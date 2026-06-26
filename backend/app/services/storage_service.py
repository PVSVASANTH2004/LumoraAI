"""
Firebase Storage upload/download service with async wrappers.
Falls back to local temp storage when Firebase is not configured.
"""
import asyncio
import os
import tempfile
from pathlib import Path

from app.core.config import get_settings
from app.core.logging import get_logger
from app.firebase.client import get_storage_bucket

logger = get_logger(__name__)


async def upload_file(
    file_bytes: bytes,
    destination_path: str,
    content_type: str = "application/octet-stream",
) -> str:
    """
    Upload bytes to Firebase Storage.
    Returns the public download URL (or local path in dev mode).
    """
    settings = get_settings()

    if not settings.firebase_storage_bucket:
        # Dev mode: save to local temp dir
        local_path = Path(tempfile.gettempdir()) / "documind_uploads" / destination_path
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_bytes(file_bytes)
        logger.info("file_saved_locally", path=str(local_path))
        return str(local_path)

    loop = asyncio.get_event_loop()

    def _upload() -> str:
        bucket = get_storage_bucket()
        blob = bucket.blob(destination_path)
        blob.upload_from_string(file_bytes, content_type=content_type)
        blob.make_public()
        return blob.public_url

    url = await loop.run_in_executor(None, _upload)
    logger.info("file_uploaded_to_storage", path=destination_path)
    return url


async def download_file(storage_path: str) -> bytes:
    """Download a file from Firebase Storage or local filesystem."""
    settings = get_settings()

    if not settings.firebase_storage_bucket:
        p = Path(storage_path)
        if not p.is_absolute():
            # Reconstruct the same temp path used by upload_file
            p = Path(tempfile.gettempdir()) / "documind_uploads" / storage_path
        return p.read_bytes()

    loop = asyncio.get_event_loop()

    def _download() -> bytes:
        bucket = get_storage_bucket()
        blob = bucket.blob(storage_path)
        return blob.download_as_bytes()

    return await loop.run_in_executor(None, _download)


async def delete_file(storage_path: str) -> None:
    settings = get_settings()
    if not settings.firebase_storage_bucket:
        p = Path(storage_path)
        if not p.is_absolute():
            p = Path(tempfile.gettempdir()) / "documind_uploads" / storage_path
        try:
            p.unlink(missing_ok=True)
        except Exception:
            pass
        return

    loop = asyncio.get_event_loop()

    def _delete() -> None:
        bucket = get_storage_bucket()
        blob = bucket.blob(storage_path)
        blob.delete()

    try:
        await loop.run_in_executor(None, _delete)
    except Exception as e:
        logger.warning("storage_delete_failed", path=storage_path, error=str(e))
