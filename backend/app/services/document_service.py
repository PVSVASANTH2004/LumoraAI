"""
DocumentService — orchestrates upload, background processing, and retrieval.
"""
import uuid
from datetime import datetime
from pathlib import Path

from app.core.exceptions import DocumentNotFoundError, FileTooLargeError, UnsupportedFileTypeError
from app.core.config import get_settings
from app.core.logging import get_logger
from app.firebase import firestore as fs
from app.models.document import DocumentMetadata, DocumentStatus
from app.services.storage_service import delete_file

logger = get_logger(__name__)


class DocumentService:
    def __init__(self) -> None:
        self._settings = get_settings()

    def validate_upload(self, filename: str, size_bytes: int) -> str:
        """Validate file and return the sanitized extension."""
        ext = Path(filename).suffix.lstrip(".").lower()
        if not ext or ext not in self._settings.allowed_extensions:
            raise UnsupportedFileTypeError(ext, self._settings.allowed_extensions)
        if size_bytes > self._settings.max_file_size_bytes:
            raise FileTooLargeError(size_bytes / (1024 * 1024), self._settings.max_file_size_mb)
        return ext

    async def create_document_record(
        self,
        user_id: str,
        filename: str,
        size_bytes: int,
        storage_path: str,
        mime_type: str = "application/pdf",
    ) -> DocumentMetadata:
        doc_id = str(uuid.uuid4())
        doc = DocumentMetadata(
            id=doc_id,
            user_id=user_id,
            name=filename,
            original_filename=filename,
            storage_path=storage_path,
            size_bytes=size_bytes,
            status=DocumentStatus.UPLOADING,
            mime_type=mime_type,
        )
        await fs.save_document(user_id, doc.to_firestore())
        logger.info("document_record_created", doc_id=doc_id, user_id=user_id)
        return doc

    async def get_document(self, user_id: str, doc_id: str) -> DocumentMetadata:
        data = await fs.get_document(user_id, doc_id)
        if not data:
            raise DocumentNotFoundError(doc_id)
        return DocumentMetadata.from_firestore(data)

    async def list_documents(self, user_id: str) -> list[DocumentMetadata]:
        items = await fs.list_documents(user_id)
        return [DocumentMetadata.from_firestore(d) for d in items]

    async def update_status(
        self,
        user_id: str,
        doc_id: str,
        status: DocumentStatus,
        page_count: int = 0,
        chunk_count: int = 0,
        error_message: str | None = None,
        summary: str | None = None,
    ) -> None:
        updates: dict = {"status": status.value, "updated_at": datetime.utcnow().isoformat()}
        if page_count:
            updates["page_count"] = page_count
        if chunk_count:
            updates["chunk_count"] = chunk_count
        if error_message is not None:
            updates["error_message"] = error_message
        if summary is not None:
            updates["summary"] = summary
        await fs.update_document(user_id, doc_id, updates)

    async def delete_document(self, user_id: str, doc_id: str) -> None:
        doc = await self.get_document(user_id, doc_id)
        # Remove from Firebase Storage
        await delete_file(doc.storage_path)
        # Remove from ChromaDB
        from app.chroma.client import delete_collection
        delete_collection(user_id, doc_id)
        # Remove Firestore record
        await fs.delete_document(user_id, doc_id)
        logger.info("document_deleted", doc_id=doc_id, user_id=user_id)
