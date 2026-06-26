import json
from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse

from app.api.deps import get_chat_service
from app.auth.dependencies import CurrentUser
from app.core.logging import get_logger
from app.schemas.chat import (
    ChatMessageRequest, ChatSessionCreateRequest, ChatSessionUpdateRequest,
    ChatSessionDetailResponse, ChatSessionListResponse,
    ChatSessionResponse, MessageFeedbackRequest,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])
logger = get_logger(__name__)

ChatSvc = Annotated[ChatService, Depends(get_chat_service)]


@router.post(
    "/sessions",
    response_model=ChatSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new chat session",
)
async def create_session(
    body: ChatSessionCreateRequest,
    current_user: CurrentUser,
    svc: ChatSvc,
) -> ChatSessionResponse:
    session = await svc.create_session(
        user_id=current_user.uid,
        document_ids=body.document_ids,
        title=body.title,
    )
    return _session_to_response(session)


@router.get(
    "/sessions",
    response_model=ChatSessionListResponse,
    summary="List all chat sessions",
)
async def list_sessions(current_user: CurrentUser, svc: ChatSvc) -> ChatSessionListResponse:
    sessions = await svc.list_sessions(current_user.uid)
    items = [_session_to_response(s) for s in sessions]
    return ChatSessionListResponse(items=items, total=len(items))


@router.get(
    "/sessions/{session_id}",
    response_model=ChatSessionDetailResponse,
    summary="Get session with full message history",
)
async def get_session(
    session_id: str, current_user: CurrentUser, svc: ChatSvc
) -> ChatSessionDetailResponse:
    session = await svc.get_session(current_user.uid, session_id)
    return _session_detail_to_response(session)


@router.patch(
    "/sessions/{session_id}",
    response_model=ChatSessionResponse,
    summary="Update session document IDs",
)
async def update_session(
    session_id: str,
    body: ChatSessionUpdateRequest,
    current_user: CurrentUser,
    svc: ChatSvc,
) -> ChatSessionResponse:
    session = await svc.update_session_docs(current_user.uid, session_id, body.document_ids)
    return _session_to_response(session)


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a chat session",
)
async def delete_session(session_id: str, current_user: CurrentUser, svc: ChatSvc) -> None:
    await svc.delete_session(current_user.uid, session_id)


@router.post(
    "/sessions/{session_id}/messages",
    summary="Send a message and receive a streaming AI response",
    description="""
Streams the AI response as Server-Sent Events (SSE).

Event types:
- `delta`: `{"type": "delta", "content": "..."}` — token chunk
- `sources`: `{"type": "sources", "sources": [...]}` — citation list
- `done`: `{"type": "done", "message_id": "..."}` — stream complete
- `error`: `{"type": "error", "error": "..."}` — failure
""",
)
async def send_message(
    session_id: str,
    body: ChatMessageRequest,
    current_user: CurrentUser,
    svc: ChatSvc,
) -> StreamingResponse:
    async def event_generator():
        try:
            async for event in svc.stream_chat(
                user_id=current_user.uid,
                session_id=session_id,
                user_content=body.content,
                override_doc_ids=body.document_ids,
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            logger.error("sse_stream_error", error=str(e))
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.post(
    "/sessions/{session_id}/messages/{message_id}/feedback",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Submit feedback (thumbs up/down) on an AI message",
)
async def submit_feedback(
    session_id: str,
    message_id: str,
    body: MessageFeedbackRequest,
    current_user: CurrentUser,
    svc: ChatSvc,
) -> None:
    await svc.update_feedback(current_user.uid, session_id, message_id, body.feedback)


# ── Response serializers ───────────────────────────────────────────────────────

def _session_to_response(session) -> ChatSessionResponse:
    return ChatSessionResponse(
        id=session.id,
        title=session.title,
        document_ids=session.document_ids,
        message_count=session.message_count,
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


def _session_detail_to_response(session) -> ChatSessionDetailResponse:
    from app.schemas.chat import ChatMessageResponse, CitationSourceResponse
    messages = [
        ChatMessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            sources=[
                CitationSourceResponse(**s.model_dump()) for s in m.sources
            ],
            created_at=m.created_at,
            feedback=m.feedback,
        )
        for m in session.messages
    ]
    return ChatSessionDetailResponse(
        id=session.id,
        title=session.title,
        document_ids=session.document_ids,
        message_count=session.message_count,
        created_at=session.created_at,
        updated_at=session.updated_at,
        messages=messages,
    )
