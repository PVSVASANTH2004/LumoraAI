"""
Thin async wrappers around Firestore SDK calls.
In dev mode (DEV_MODE=true), dispatches to dev_store (local JSON file).
All writes/reads are run in a thread pool so they don't block the event loop.
"""
import asyncio
from datetime import datetime

from app.core.logging import get_logger

logger = get_logger(__name__)

_USERS_COLL = "users"
_DOCUMENTS_COLL = "documents"
_SESSIONS_COLL = "chat_sessions"
_MESSAGES_COLL = "messages"


def _dev_mode() -> bool:
    from app.core.config import get_settings
    return get_settings().dev_mode


def _db():
    from google.cloud.firestore_v1.base_query import FieldFilter  # noqa: F401
    from app.firebase.client import get_firestore_client
    return get_firestore_client()


# ── Documents ─────────────────────────────────────────────────────────────────

async def save_document(user_id: str, doc_data: dict) -> None:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.save_document(user_id, doc_data)
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: _db()
        .collection(_USERS_COLL).document(user_id)
        .collection(_DOCUMENTS_COLL).document(doc_data["id"])
        .set(doc_data),
    )


async def update_document(user_id: str, doc_id: str, updates: dict) -> None:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.update_document(user_id, doc_id, updates)
    updates["updated_at"] = datetime.utcnow().isoformat()
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: _db()
        .collection(_USERS_COLL).document(user_id)
        .collection(_DOCUMENTS_COLL).document(doc_id)
        .update(updates),
    )


async def get_document(user_id: str, doc_id: str) -> dict | None:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.get_document(user_id, doc_id)
    loop = asyncio.get_event_loop()
    snap = await loop.run_in_executor(
        None,
        lambda: _db()
        .collection(_USERS_COLL).document(user_id)
        .collection(_DOCUMENTS_COLL).document(doc_id)
        .get(),
    )
    return snap.to_dict() if snap.exists else None


async def list_documents(user_id: str) -> list[dict]:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.list_documents(user_id)
    loop = asyncio.get_event_loop()
    docs = await loop.run_in_executor(
        None,
        lambda: list(
            _db()
            .collection(_USERS_COLL).document(user_id)
            .collection(_DOCUMENTS_COLL)
            .order_by("created_at", direction="DESCENDING")
            .stream()
        ),
    )
    return [d.to_dict() for d in docs]


async def delete_document(user_id: str, doc_id: str) -> None:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.delete_document(user_id, doc_id)
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: _db()
        .collection(_USERS_COLL).document(user_id)
        .collection(_DOCUMENTS_COLL).document(doc_id)
        .delete(),
    )


# ── Chat Sessions ─────────────────────────────────────────────────────────────

async def save_session(user_id: str, session_data: dict) -> None:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.save_session(user_id, session_data)
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: _db()
        .collection(_USERS_COLL).document(user_id)
        .collection(_SESSIONS_COLL).document(session_data["id"])
        .set(session_data),
    )


async def update_session(user_id: str, session_id: str, updates: dict) -> None:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.update_session(user_id, session_id, updates)
    updates["updated_at"] = datetime.utcnow().isoformat()
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: _db()
        .collection(_USERS_COLL).document(user_id)
        .collection(_SESSIONS_COLL).document(session_id)
        .update(updates),
    )


async def get_session(user_id: str, session_id: str) -> dict | None:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.get_session(user_id, session_id)
    loop = asyncio.get_event_loop()
    snap = await loop.run_in_executor(
        None,
        lambda: _db()
        .collection(_USERS_COLL).document(user_id)
        .collection(_SESSIONS_COLL).document(session_id)
        .get(),
    )
    return snap.to_dict() if snap.exists else None


async def list_sessions(user_id: str) -> list[dict]:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.list_sessions(user_id)
    loop = asyncio.get_event_loop()
    docs = await loop.run_in_executor(
        None,
        lambda: list(
            _db()
            .collection(_USERS_COLL).document(user_id)
            .collection(_SESSIONS_COLL)
            .order_by("updated_at", direction="DESCENDING")
            .limit(100)
            .stream()
        ),
    )
    return [d.to_dict() for d in docs]


async def delete_session(user_id: str, session_id: str) -> None:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.delete_session(user_id, session_id)
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: _db()
        .collection(_USERS_COLL).document(user_id)
        .collection(_SESSIONS_COLL).document(session_id)
        .delete(),
    )


# ── Messages ──────────────────────────────────────────────────────────────────

async def append_message(user_id: str, session_id: str, message_data: dict) -> None:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.append_message(user_id, session_id, message_data)
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        lambda: _db()
        .collection(_USERS_COLL).document(user_id)
        .collection(_SESSIONS_COLL).document(session_id)
        .collection(_MESSAGES_COLL).document(message_data["id"])
        .set(message_data),
    )


async def list_messages(user_id: str, session_id: str) -> list[dict]:
    if _dev_mode():
        from app.firebase import dev_store
        return await dev_store.list_messages(user_id, session_id)
    loop = asyncio.get_event_loop()
    docs = await loop.run_in_executor(
        None,
        lambda: list(
            _db()
            .collection(_USERS_COLL).document(user_id)
            .collection(_SESSIONS_COLL).document(session_id)
            .collection(_MESSAGES_COLL)
            .order_by("created_at")
            .stream()
        ),
    )
    return [d.to_dict() for d in docs]
