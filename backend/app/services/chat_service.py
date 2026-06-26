"""
ChatService — session management, message persistence, and RAG orchestration.
"""
import uuid
from collections.abc import AsyncGenerator
from datetime import datetime

from app.core.exceptions import SessionNotFoundError
from app.core.logging import get_logger
from app.firebase import firestore as fs
from app.models.chat import ChatMessage, ChatSession, CitationSource, MessageRole
from app.rag.citations.citation_builder import build_citations
from app.rag.generator.openai_generator import generate_title, stream_response
from app.rag.prompts.rag_prompt import build_rag_prompt
from app.rag.retriever.chroma_retriever import retrieve_chunks
from app.services.document_service import DocumentService

logger = get_logger(__name__)


class ChatService:
    def __init__(self, document_service: DocumentService) -> None:
        self._doc_svc = document_service

    # ── Session CRUD ──────────────────────────────────────────────────────────

    async def create_session(
        self,
        user_id: str,
        document_ids: list[str],
        title: str = "New conversation",
    ) -> ChatSession:
        session = ChatSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            document_ids=document_ids,
        )
        await fs.save_session(user_id, session.to_firestore())
        return session

    async def get_session(self, user_id: str, session_id: str) -> ChatSession:
        data = await fs.get_session(user_id, session_id)
        if not data:
            raise SessionNotFoundError(session_id)
        session = ChatSession.from_firestore(data)
        # Load messages from sub-collection
        raw_messages = await fs.list_messages(user_id, session_id)
        session.messages = [_parse_message(m) for m in raw_messages]
        return session

    async def list_sessions(self, user_id: str) -> list[ChatSession]:
        items = await fs.list_sessions(user_id)
        return [ChatSession.from_firestore(d) for d in items]

    async def update_session_docs(
        self, user_id: str, session_id: str, document_ids: list[str]
    ) -> ChatSession:
        data = await fs.get_session(user_id, session_id)
        if not data:
            raise SessionNotFoundError(session_id)
        await fs.update_session(user_id, session_id, {"document_ids": document_ids})
        data["document_ids"] = document_ids
        return ChatSession.from_firestore(data)

    async def delete_session(self, user_id: str, session_id: str) -> None:
        await fs.get_session(user_id, session_id)  # raises if not found
        await fs.delete_session(user_id, session_id)

    # ── Streaming Chat ────────────────────────────────────────────────────────

    async def stream_chat(
        self,
        user_id: str,
        session_id: str,
        user_content: str,
        override_doc_ids: list[str] | None = None,
    ) -> AsyncGenerator[dict, None]:
        """
        Full RAG pipeline with streaming.
        Yields SSE-ready dicts: {type, ...}
        """
        # 1. Load session + history
        session = await self.get_session(user_id, session_id)
        doc_ids = override_doc_ids or session.document_ids

        # Persist doc IDs so they survive page refreshes (frontend sends as override)
        if override_doc_ids and set(override_doc_ids) != set(session.document_ids):
            await fs.update_session(user_id, session_id, {"document_ids": override_doc_ids})

        # 2. Save user message
        user_msg = ChatMessage(
            id=str(uuid.uuid4()),
            role=MessageRole.USER,
            content=user_content,
        )
        await fs.append_message(user_id, session_id, user_msg.to_firestore())
        await fs.update_session(user_id, session_id, {"message_count": session.message_count + 1})

        # 3. Retrieve relevant chunks
        chunks = []
        if doc_ids:
            chunks = await retrieve_chunks(user_id, doc_ids, user_content)

        # 4. Build doc name map for citations
        doc_name_map: dict[str, str] = {}
        for doc_id in doc_ids:
            try:
                doc = await self._doc_svc.get_document(user_id, doc_id)
                doc_name_map[doc_id] = doc.name
            except Exception:
                doc_name_map[doc_id] = doc_id

        # 5. Build prompt with conversation history
        history = [{"role": m.role, "content": m.content} for m in session.messages[-10:]]
        messages = build_rag_prompt(user_content, chunks, history)

        # 6. Stream response
        assistant_msg_id = str(uuid.uuid4())
        full_response = ""

        try:
            async for token in stream_response(messages):
                full_response += token
                yield {"type": "delta", "content": token}

            # 7. Build and yield citations
            citations = build_citations(chunks, doc_name_map)
            citation_dicts = [c.model_dump() for c in citations]
            yield {"type": "sources", "sources": citation_dicts}

            # 8. Persist assistant message
            assistant_msg = ChatMessage(
                id=assistant_msg_id,
                role=MessageRole.ASSISTANT,
                content=full_response,
                sources=citations,
            )
            await fs.append_message(user_id, session_id, assistant_msg.to_firestore())

            # 9. Update session title if first exchange
            if session.message_count <= 1:
                title = await generate_title(user_content)
                await fs.update_session(
                    user_id, session_id,
                    {"title": title, "message_count": session.message_count + 2},
                )
            else:
                await fs.update_session(
                    user_id, session_id,
                    {"message_count": session.message_count + 2},
                )

            yield {"type": "done", "message_id": assistant_msg_id}

        except Exception as e:
            logger.error("stream_chat_error", error=str(e), session_id=session_id)
            yield {"type": "error", "error": "An error occurred. Please try again."}

    async def update_feedback(
        self,
        user_id: str,
        session_id: str,
        message_id: str,
        feedback: str,
    ) -> None:
        # Firestore update on the specific message document
        import asyncio

        def _update():
            from app.firebase.client import get_firestore_client
            db = get_firestore_client()
            db.collection("users").document(user_id) \
              .collection("chat_sessions").document(session_id) \
              .collection("messages").document(message_id) \
              .update({"feedback": feedback})

        await asyncio.get_event_loop().run_in_executor(None, _update)


def _parse_message(data: dict) -> ChatMessage:
    if isinstance(data.get("created_at"), str):
        data["created_at"] = datetime.fromisoformat(data["created_at"])
    sources_raw = data.pop("sources", [])
    msg = ChatMessage(**data)
    msg.sources = [CitationSource(**s) if isinstance(s, dict) else s for s in sources_raw]
    return msg
