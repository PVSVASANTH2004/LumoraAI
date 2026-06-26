from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class MessageRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class CitationSource(BaseModel):
    document_id: str
    document_name: str
    page_number: int
    score: float
    snippet: str
    chunk_index: int = 0


class ChatMessage(BaseModel):
    id: str
    role: MessageRole
    content: str
    sources: list[CitationSource] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    feedback: str | None = None

    def to_firestore(self) -> dict:
        data = self.model_dump()
        data["created_at"] = self.created_at.isoformat()
        return data


class ChatSession(BaseModel):
    id: str
    user_id: str
    title: str = "New conversation"
    document_ids: list[str] = Field(default_factory=list)
    messages: list[ChatMessage] = Field(default_factory=list)
    message_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def to_firestore(self) -> dict:
        """Return a Firestore-safe dict (messages stored as sub-collection, not here)."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "document_ids": self.document_ids,
            "message_count": self.message_count,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_firestore(cls, data: dict) -> "ChatSession":
        if isinstance(data.get("created_at"), str):
            data["created_at"] = datetime.fromisoformat(data["created_at"])
        if isinstance(data.get("updated_at"), str):
            data["updated_at"] = datetime.fromisoformat(data["updated_at"])
        data.setdefault("messages", [])
        return cls(**data)
