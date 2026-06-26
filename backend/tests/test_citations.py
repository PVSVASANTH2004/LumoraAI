"""Unit tests for citation builder."""
from app.rag.citations.citation_builder import build_citations, _extract_snippet
from app.rag.retriever.chroma_retriever import RetrievedChunk


def make_chunk(doc_id: str, page: int, score: float, text: str = "Sample text.") -> RetrievedChunk:
    return RetrievedChunk(
        chunk_id=f"{doc_id}_p{page}_c0",
        doc_id=doc_id,
        text=text,
        page_number=page,
        chunk_index=0,
        score=score,
        metadata={},
    )


def test_build_citations_basic():
    chunks = [
        make_chunk("doc1", 1, 0.95, "Important finding on page 1."),
        make_chunk("doc1", 2, 0.87, "Supporting data on page 2."),
        make_chunk("doc2", 5, 0.72, "Related content from doc2."),
    ]
    citations = build_citations(chunks, {"doc1": "Report.pdf", "doc2": "Whitepaper.pdf"})
    assert len(citations) == 3
    assert citations[0].document_name == "Report.pdf"
    assert citations[0].page_number == 1
    assert citations[2].document_name == "Whitepaper.pdf"


def test_citations_deduplicate_same_page():
    chunks = [
        make_chunk("doc1", 3, 0.90),
        make_chunk("doc1", 3, 0.85),  # Same doc + page — should be deduplicated
    ]
    citations = build_citations(chunks, {})
    assert len(citations) == 1


def test_extract_snippet_short():
    text = "Short text."
    assert _extract_snippet(text) == text


def test_extract_snippet_long():
    text = "word " * 200
    snippet = _extract_snippet(text, max_chars=100)
    assert len(snippet) <= 110  # some wiggle for ellipsis
    assert snippet.endswith("…")
