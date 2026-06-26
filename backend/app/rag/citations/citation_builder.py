"""
Build structured citation objects from retrieved chunks + document metadata.
"""
from app.models.chat import CitationSource
from app.rag.retriever.chroma_retriever import RetrievedChunk


def build_citations(
    chunks: list[RetrievedChunk],
    doc_name_map: dict[str, str],
) -> list[CitationSource]:
    """
    Convert retrieved chunks to CitationSource objects.

    :param chunks: Retrieved and ranked chunks.
    :param doc_name_map: {doc_id -> document filename} for human-readable names.
    """
    seen: set[str] = set()
    citations: list[CitationSource] = []

    for chunk in chunks:
        # Deduplicate by (doc_id, page_number) — keep highest-scoring one
        key = f"{chunk.doc_id}:{chunk.page_number}"
        if key in seen:
            continue
        seen.add(key)

        citations.append(
            CitationSource(
                document_id=chunk.doc_id,
                document_name=doc_name_map.get(chunk.doc_id, chunk.doc_id),
                page_number=chunk.page_number,
                score=round(chunk.score, 4),
                snippet=_extract_snippet(chunk.text),
                chunk_index=chunk.chunk_index,
            )
        )

    return citations


def _extract_snippet(text: str, max_chars: int = 280) -> str:
    """Return the first `max_chars` characters, trimmed at a word boundary."""
    if len(text) <= max_chars:
        return text
    trimmed = text[:max_chars]
    last_space = trimmed.rfind(" ")
    if last_space > max_chars // 2:
        return trimmed[:last_space] + "…"
    return trimmed + "…"
