"""
Background worker that runs the full ingestion pipeline:
  download → load PDF → chunk → embed → index → update status
"""
import asyncio
import tempfile
from pathlib import Path

from app.core.exceptions import DocumentProcessingError
from app.core.logging import get_logger
from app.models.document import DocumentStatus
from app.rag.chunking.recursive_chunker import chunk_document
from app.rag.loaders.pdf_loader import load_pdf
from app.rag.loaders.text_loader import load_text
from app.rag.retriever.chroma_retriever import index_chunks
from app.services.document_service import DocumentService
from app.services.storage_service import download_file

logger = get_logger(__name__)


async def process_document(
    user_id: str,
    doc_id: str,
    storage_path: str,
    document_service: DocumentService,
) -> None:
    """
    Full async ingestion pipeline for a single document.
    Updates Firestore status at each stage.
    """
    logger.info("processing_start", user_id=user_id, doc_id=doc_id)

    try:
        # Mark as processing
        await document_service.update_status(user_id, doc_id, DocumentStatus.PROCESSING)

        # 1. Download file to temp path
        file_bytes = await download_file(storage_path)
        suffix = Path(storage_path).suffix or ".pdf"

        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            # 2. Load & extract text (dispatch by extension)
            ext = Path(storage_path).suffix.lower().lstrip(".")
            if ext in ("txt", "md"):
                loaded_doc = await load_text(tmp_path, doc_id)
            else:
                loaded_doc = await load_pdf(tmp_path, doc_id)

            if not loaded_doc.pages:
                raise DocumentProcessingError(doc_id, "No text could be extracted from the document")

            # 3. Chunk
            chunks = chunk_document(loaded_doc)

            if not chunks:
                raise DocumentProcessingError(doc_id, "Document produced zero chunks after splitting")

            # 4. Embed + index in ChromaDB
            await index_chunks(user_id, doc_id, chunks)

            # 5. Mark ready
            await document_service.update_status(
                user_id=user_id,
                doc_id=doc_id,
                status=DocumentStatus.READY,
                page_count=loaded_doc.total_pages,
                chunk_count=len(chunks),
            )
            logger.info(
                "processing_complete",
                doc_id=doc_id,
                pages=loaded_doc.total_pages,
                chunks=len(chunks),
            )

        finally:
            Path(tmp_path).unlink(missing_ok=True)

    except DocumentProcessingError:
        raise
    except Exception as e:
        error_msg = str(e)
        logger.error("processing_failed", doc_id=doc_id, error=error_msg)
        await document_service.update_status(
            user_id=user_id,
            doc_id=doc_id,
            status=DocumentStatus.ERROR,
            error_message=error_msg,
        )
        raise DocumentProcessingError(doc_id, error_msg) from e
