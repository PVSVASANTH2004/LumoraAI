import asyncio
import uuid
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, UploadFile, status
from fastapi.responses import Response

from app.api.deps import get_document_service
from app.auth.dependencies import CurrentUser
from app.core.logging import get_logger
from app.schemas.document import (
    DocumentListResponse, DocumentResponse, DocumentStatusResponse,
    DocumentUploadResponse,
)
from app.services.document_service import DocumentService
from app.services.storage_service import upload_file, download_file
from app.workers.document_processor import process_document

router = APIRouter(prefix="/documents", tags=["documents"])
logger = get_logger(__name__)

DocSvc = Annotated[DocumentService, Depends(get_document_service)]


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload a document for AI processing",
)
async def upload_document(
    current_user: CurrentUser,
    svc: DocSvc,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="PDF, DOCX, TXT, or MD file"),
    collection_id: str | None = Form(None),
) -> DocumentUploadResponse:
    """
    Upload a document. Processing (chunking + embedding) runs in the background.
    Poll `GET /documents/{id}/status` to track progress.
    """
    filename = file.filename or "untitled"
    content_type = file.content_type or "application/octet-stream"
    file_bytes = await file.read()

    # Validate
    ext = svc.validate_upload(filename, len(file_bytes))

    # Upload to storage
    doc_id = str(uuid.uuid4())
    storage_path = f"users/{current_user.uid}/documents/{doc_id}.{ext}"
    await upload_file(file_bytes, storage_path, content_type)

    # Create Firestore record
    doc = await svc.create_document_record(
        user_id=current_user.uid,
        filename=filename,
        size_bytes=len(file_bytes),
        storage_path=storage_path,
        mime_type=content_type,
    )

    if collection_id:
        from app.firebase import firestore as fs
        await fs.update_document(current_user.uid, doc.id, {"collection_id": collection_id})

    # Kick off background processing
    background_tasks.add_task(
        process_document,
        user_id=current_user.uid,
        doc_id=doc.id,
        storage_path=storage_path,
        document_service=svc,
    )

    logger.info("document_upload_accepted", doc_id=doc.id, user_id=current_user.uid)
    return DocumentUploadResponse(id=doc.id, name=filename, status=doc.status)


@router.get("", response_model=DocumentListResponse, summary="List all documents")
async def list_documents(current_user: CurrentUser, svc: DocSvc) -> DocumentListResponse:
    docs = await svc.list_documents(current_user.uid)
    items = [_to_response(d) for d in docs]
    return DocumentListResponse(items=items, total=len(items))


@router.get(
    "/{doc_id}",
    response_model=DocumentResponse,
    summary="Get document details",
)
async def get_document(doc_id: str, current_user: CurrentUser, svc: DocSvc) -> DocumentResponse:
    doc = await svc.get_document(current_user.uid, doc_id)
    return _to_response(doc)


@router.get(
    "/{doc_id}/status",
    response_model=DocumentStatusResponse,
    summary="Poll document processing status",
)
async def get_document_status(
    doc_id: str, current_user: CurrentUser, svc: DocSvc
) -> DocumentStatusResponse:
    doc = await svc.get_document(current_user.uid, doc_id)
    return DocumentStatusResponse(
        id=doc.id,
        status=doc.status,
        page_count=doc.page_count,
        chunk_count=doc.chunk_count,
        error_message=doc.error_message,
    )


@router.get(
    "/{doc_id}/download",
    summary="Download the original document file",
)
async def download_document(doc_id: str, current_user: CurrentUser, svc: DocSvc) -> Response:
    doc = await svc.get_document(current_user.uid, doc_id)
    file_bytes = await download_file(doc.storage_path)
    filename = doc.original_filename.encode("ascii", errors="ignore").decode()
    return Response(
        content=file_bytes,
        media_type=doc.mime_type or "application/octet-stream",
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.delete(
    "/{doc_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a document and its embeddings",
)
async def delete_document(doc_id: str, current_user: CurrentUser, svc: DocSvc) -> None:
    await svc.delete_document(current_user.uid, doc_id)


def _to_response(doc) -> DocumentResponse:
    return DocumentResponse(
        id=doc.id,
        name=doc.name,
        original_filename=doc.original_filename,
        size_bytes=doc.size_bytes,
        page_count=doc.page_count,
        chunk_count=doc.chunk_count,
        status=doc.status,
        error_message=doc.error_message,
        collection_id=doc.collection_id,
        tags=doc.tags,
        summary=doc.summary,
        mime_type=doc.mime_type,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )
