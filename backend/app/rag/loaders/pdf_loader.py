"""
PDF loader using PyMuPDF (fitz) for high-quality text + metadata extraction.
"""
import asyncio
from dataclasses import dataclass, field
from pathlib import Path

import fitz  # PyMuPDF

from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class PageContent:
    page_number: int  # 1-based
    text: str
    char_count: int = 0
    word_count: int = 0

    def __post_init__(self) -> None:
        self.char_count = len(self.text)
        self.word_count = len(self.text.split())


@dataclass
class LoadedDocument:
    doc_id: str
    pages: list[PageContent] = field(default_factory=list)
    total_pages: int = 0
    metadata: dict = field(default_factory=dict)

    @property
    def full_text(self) -> str:
        return "\n\n".join(p.text for p in self.pages if p.text.strip())


async def load_pdf(file_path: str | Path, doc_id: str) -> LoadedDocument:
    """Async wrapper around the synchronous PyMuPDF extraction."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _load_pdf_sync, str(file_path), doc_id)


def _load_pdf_sync(file_path: str, doc_id: str) -> LoadedDocument:
    pdf = fitz.open(file_path)
    pages: list[PageContent] = []

    for page_num in range(len(pdf)):
        page = pdf[page_num]
        text = page.get_text("text")  # plain text extraction
        text = _clean_text(text)
        if text:
            pages.append(PageContent(page_number=page_num + 1, text=text))

    total_pages = len(pdf)
    metadata = {
        "title": pdf.metadata.get("title", ""),
        "author": pdf.metadata.get("author", ""),
        "total_pages": total_pages,
    }
    pdf.close()

    logger.info(
        "pdf_loaded",
        doc_id=doc_id,
        total_pages=total_pages,
        extracted_pages=len(pages),
    )
    return LoadedDocument(
        doc_id=doc_id,
        pages=pages,
        total_pages=total_pages,
        metadata=metadata,
    )


def _clean_text(text: str) -> str:
    lines = text.splitlines()
    cleaned = []
    for line in lines:
        line = line.strip()
        if line:
            cleaned.append(line)
    return " ".join(cleaned)
