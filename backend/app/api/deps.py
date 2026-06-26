"""Dependency factories — injected into FastAPI route handlers."""
from functools import lru_cache

from app.services.document_service import DocumentService
from app.services.chat_service import ChatService


@lru_cache(maxsize=1)
def get_document_service() -> DocumentService:
    return DocumentService()


@lru_cache(maxsize=1)
def get_chat_service() -> ChatService:
    return ChatService(document_service=get_document_service())
