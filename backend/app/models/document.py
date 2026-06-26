from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class DocumentStatus(StrEnum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    READY = "ready"
    ERROR = "error"


class DocumentMetadata(BaseModel):
    """Stored in Firestore alongside the document record."""

    id: str
    user_id: str
    name: str
    original_filename: str
    storage_path: str
    size_bytes: int
    page_count: int = 0
    chunk_count: int = 0
    status: DocumentStatus = DocumentStatus.UPLOADING
    error_message: str | None = None
    collection_id: str | None = None
    tags: list[str] = Field(default_factory=list)
    summary: str | None = None
    mime_type: str = "application/pdf"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def to_firestore(self) -> dict:
        data = self.model_dump()
        data["created_at"] = self.created_at.isoformat()
        data["updated_at"] = self.updated_at.isoformat()
        return data

    @classmethod
    def from_firestore(cls, data: dict) -> "DocumentMetadata":
        if isinstance(data.get("created_at"), str):
            data["created_at"] = datetime.fromisoformat(data["created_at"])
        if isinstance(data.get("updated_at"), str):
            data["updated_at"] = datetime.fromisoformat(data["updated_at"])
        return cls(**data)
