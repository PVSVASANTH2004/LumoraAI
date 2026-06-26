"""
Recursive character text splitter with page-level metadata preservation.
"""
from dataclasses import dataclass, field

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import get_settings
from app.core.logging import get_logger
from app.rag.loaders.pdf_loader import LoadedDocument

logger = get_logger(__name__)


@dataclass
class DocumentChunk:
    chunk_id: str          # "{doc_id}_p{page}_c{chunk_idx}"
    doc_id: str
    text: str
    page_number: int
    chunk_index: int       # global chunk index within the document
    char_count: int = 0
    metadata: dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.char_count = len(self.text)


def chunk_document(loaded_doc: LoadedDocument) -> list[DocumentChunk]:
    """
    Split each page's text into overlapping chunks, preserving page metadata.
    Returns a flat list of DocumentChunk objects.
    """
    settings = get_settings()
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""],
        length_function=len,
        is_separator_regex=False,
    )

    chunks: list[DocumentChunk] = []
    global_idx = 0

    for page in loaded_doc.pages:
        if not page.text.strip():
            continue

        page_chunks = splitter.split_text(page.text)
        for local_idx, chunk_text in enumerate(page_chunks):
            chunk_text = chunk_text.strip()
            if not chunk_text:
                continue
            chunks.append(
                DocumentChunk(
                    chunk_id=f"{loaded_doc.doc_id}_p{page.page_number}_c{local_idx}",
                    doc_id=loaded_doc.doc_id,
                    text=chunk_text,
                    page_number=page.page_number,
                    chunk_index=global_idx,
                    metadata={
                        "doc_id": loaded_doc.doc_id,
                        "page_number": page.page_number,
                        "chunk_index": global_idx,
                        "local_chunk_index": local_idx,
                    },
                )
            )
            global_idx += 1

    logger.info(
        "document_chunked",
        doc_id=loaded_doc.doc_id,
        pages=len(loaded_doc.pages),
        chunks=len(chunks),
    )
    return chunks
