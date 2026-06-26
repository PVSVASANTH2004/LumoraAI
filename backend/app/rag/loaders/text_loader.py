"""
Plain-text loader for .txt and .md files.
"""
import asyncio
from pathlib import Path

from app.core.logging import get_logger
from app.rag.loaders.pdf_loader import LoadedDocument, PageContent

logger = get_logger(__name__)


async def load_text(file_path: str | Path, doc_id: str) -> LoadedDocument:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _load_text_sync, str(file_path), doc_id)


def _load_text_sync(file_path: str, doc_id: str) -> LoadedDocument:
    text = Path(file_path).read_text(encoding="utf-8", errors="replace")
    # Split into ~page-sized chunks of 3000 chars so very large files become multiple pages
    chunk_size = 3000
    raw_chunks = [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)]

    pages = [
        PageContent(page_number=i + 1, text=chunk.strip())
        for i, chunk in enumerate(raw_chunks)
        if chunk.strip()
    ]

    logger.info("text_loaded", doc_id=doc_id, pages=len(pages), chars=len(text))
    return LoadedDocument(
        doc_id=doc_id,
        pages=pages,
        total_pages=len(pages),
        metadata={"source": Path(file_path).name},
    )
