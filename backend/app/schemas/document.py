from datetime import datetime

from pydantic import BaseModel, Field

from app.models.document import DocumentStatus


class DocumentUploadResponse(BaseModel):
    id: str
    name: str
    status: DocumentStatus
    message: str = "Document uploaded. Processing started."


class DocumentResponse(BaseModel):
    id: str
    name: str
    original_filename: str
    size_bytes: int
    page_count: int
    chunk_count: int
    status: DocumentStatus
    error_message: str | None
    collection_id: str | None
    tags: list[str]
    summary: str | None
    mime_type: str
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    total: int


class DocumentStatusResponse(BaseModel):
    id: str
    status: DocumentStatus
    page_count: int
    chunk_count: int
    error_message: str | None = None


class CollectionCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)
    color: str = Field(default="#7c3aed")
