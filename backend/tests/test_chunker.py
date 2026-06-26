"""Unit tests for the recursive chunker — no Firebase/Chroma required."""
import pytest

from app.rag.chunking.recursive_chunker import chunk_document
from app.rag.loaders.pdf_loader import LoadedDocument, PageContent


def make_doc(texts: list[str]) -> LoadedDocument:
    pages = [PageContent(page_number=i + 1, text=t) for i, t in enumerate(texts)]
    return LoadedDocument(doc_id="test-doc", pages=pages, total_pages=len(pages))


def test_chunk_single_short_page():
    doc = make_doc(["Hello world. This is a short page."])
    chunks = chunk_document(doc)
    assert len(chunks) >= 1
    assert chunks[0].doc_id == "test-doc"
    assert chunks[0].page_number == 1


def test_chunk_long_text_splits():
    long_text = "The quick brown fox jumps over the lazy dog. " * 100
    doc = make_doc([long_text])
    chunks = chunk_document(doc)
    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk.text) <= 900  # chunk_size + some overhead


def test_chunk_preserves_page_numbers():
    doc = make_doc(["Page one content.", "Page two content.", "Page three content."])
    chunks = chunk_document(doc)
    pages_seen = {c.page_number for c in chunks}
    assert pages_seen == {1, 2, 3}


def test_chunk_ids_are_unique():
    doc = make_doc(["A" * 2000])
    chunks = chunk_document(doc)
    ids = [c.chunk_id for c in chunks]
    assert len(ids) == len(set(ids))


def test_empty_pages_skipped():
    doc = make_doc(["", "   ", "Real content here."])
    chunks = chunk_document(doc)
    assert all(c.text.strip() for c in chunks)
