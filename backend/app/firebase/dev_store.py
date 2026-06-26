"""
Dev-mode in-memory store backed by a JSON file.
Replaces Firestore for local development without Firebase credentials.
All functions have the same async signatures as firestore.py.
"""
import asyncio
import json
import threading
from datetime import datetime
from pathlib import Path

_DATA_FILE = Path("./dev_data.json")
_lock = threading.Lock()


# ── Internal helpers ──────────────────────────────────────────────────────────

def _load() -> dict:
    if _DATA_FILE.exists():
        try:
            return json.loads(_DATA_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def _save(data: dict) -> None:
    _DATA_FILE.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")


def _user(data: dict, uid: str) -> dict:
    return data.setdefault("users", {}).setdefault(uid, {})


# ── Documents ─────────────────────────────────────────────────────────────────

async def save_document(user_id: str, doc_data: dict) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _sync_save_document, user_id, doc_data)


def _sync_save_document(user_id: str, doc_data: dict) -> None:
    with _lock:
        data = _load()
        _user(data, user_id).setdefault("documents", {})[doc_data["id"]] = doc_data
        _save(data)


async def update_document(user_id: str, doc_id: str, updates: dict) -> None:
    updates["updated_at"] = datetime.utcnow().isoformat()
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _sync_update_document, user_id, doc_id, updates)


def _sync_update_document(user_id: str, doc_id: str, updates: dict) -> None:
    with _lock:
        data = _load()
        docs = _user(data, user_id).setdefault("documents", {})
        if doc_id in docs:
            docs[doc_id].update(updates)
            _save(data)


async def get_document(user_id: str, doc_id: str) -> dict | None:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_get_document, user_id, doc_id)


def _sync_get_document(user_id: str, doc_id: str) -> dict | None:
    data = _load()
    return _user(data, user_id).get("documents", {}).get(doc_id)


async def list_documents(user_id: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_list_documents, user_id)


def _sync_list_documents(user_id: str) -> list[dict]:
    data = _load()
    docs = _user(data, user_id).get("documents", {})
    result = list(docs.values())
    result.sort(key=lambda d: d.get("created_at", ""), reverse=True)
    return result


async def delete_document(user_id: str, doc_id: str) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _sync_delete_document, user_id, doc_id)


def _sync_delete_document(user_id: str, doc_id: str) -> None:
    with _lock:
        data = _load()
        _user(data, user_id).get("documents", {}).pop(doc_id, None)
        _save(data)


# ── Chat Sessions ─────────────────────────────────────────────────────────────

async def save_session(user_id: str, session_data: dict) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _sync_save_session, user_id, session_data)


def _sync_save_session(user_id: str, session_data: dict) -> None:
    with _lock:
        data = _load()
        _user(data, user_id).setdefault("sessions", {})[session_data["id"]] = session_data
        _save(data)


async def update_session(user_id: str, session_id: str, updates: dict) -> None:
    updates["updated_at"] = datetime.utcnow().isoformat()
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _sync_update_session, user_id, session_id, updates)


def _sync_update_session(user_id: str, session_id: str, updates: dict) -> None:
    with _lock:
        data = _load()
        sessions = _user(data, user_id).setdefault("sessions", {})
        if session_id in sessions:
            sessions[session_id].update(updates)
            _save(data)


async def get_session(user_id: str, session_id: str) -> dict | None:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_get_session, user_id, session_id)


def _sync_get_session(user_id: str, session_id: str) -> dict | None:
    data = _load()
    return _user(data, user_id).get("sessions", {}).get(session_id)


async def list_sessions(user_id: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_list_sessions, user_id)


def _sync_list_sessions(user_id: str) -> list[dict]:
    data = _load()
    sessions = _user(data, user_id).get("sessions", {})
    result = list(sessions.values())
    result.sort(key=lambda s: s.get("updated_at", ""), reverse=True)
    return result[:100]


async def delete_session(user_id: str, session_id: str) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _sync_delete_session, user_id, session_id)


def _sync_delete_session(user_id: str, session_id: str) -> None:
    with _lock:
        data = _load()
        _user(data, user_id).get("sessions", {}).pop(session_id, None)
        # Also delete messages for this session
        _user(data, user_id).get("messages", {}).pop(session_id, None)
        _save(data)


# ── Messages ──────────────────────────────────────────────────────────────────

async def append_message(user_id: str, session_id: str, message_data: dict) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _sync_append_message, user_id, session_id, message_data)


def _sync_append_message(user_id: str, session_id: str, message_data: dict) -> None:
    with _lock:
        data = _load()
        msgs = _user(data, user_id).setdefault("messages", {}).setdefault(session_id, {})
        msgs[message_data["id"]] = message_data
        _save(data)


async def list_messages(user_id: str, session_id: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_list_messages, user_id, session_id)


def _sync_list_messages(user_id: str, session_id: str) -> list[dict]:
    data = _load()
    msgs = _user(data, user_id).get("messages", {}).get(session_id, {})
    result = list(msgs.values())
    result.sort(key=lambda m: m.get("created_at", ""))
    return result
