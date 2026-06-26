"""
ChromaDB-backed retriever with metadata filtering and multi-document support.
"""
import asyncio
from dataclasses import dataclass

from app.chroma.client import get_chroma_client, collection_name_for
from app.core.config import get_settings
from app.core.logging import get_logger
from app.rag.chunking.recursive_chunker import DocumentChunk
from app.rag.embeddings.sentence_transformer import embed_documents, embed_query_async

logger = get_logger(__name__)


@dataclass
class RetrievedChunk:
    chunk_id: str
    doc_id: str
    text: str
    page_number: int
    chunk_index: int
    score: float  # cosine similarity (0–1, higher is better)
    metadata: dict


async def index_chunks(user_id: str, doc_id: str, chunks: list[DocumentChunk]) -> None:
    """Embed and upsert all chunks into the document's ChromaDB collection."""
    if not chunks:
        return

    loop = asyncio.get_event_loop()

    texts = [c.text for c in chunks]
    embeddings = await loop.run_in_executor(None, embed_documents, texts)

    def _upsert() -> None:
        from app.chroma.client import get_or_create_collection
        collection = get_or_create_collection(user_id, doc_id)
        collection.upsert(
            ids=[c.chunk_id for c in chunks],
            embeddings=embeddings,
            documents=texts,
            metadatas=[c.metadata for c in chunks],
        )

    await loop.run_in_executor(None, _upsert)
    logger.info("chunks_indexed", doc_id=doc_id, count=len(chunks))


_BROAD_KEYWORDS = {
    "summarize", "summary", "all", "every", "list", "compare", "comparison",
    "overview", "total", "how many", "count", "history", "timeline",
    "throughout", "across", "replace", "replaced", "migration", "migrations",
    "technologies", "systems", "changes",
}

_MATH_KEYWORDS = {
    "percent", "%", "half", "total", "average", "sum", "budget", "cost",
    "calculate", "how much",
}

def _query_top_k(query: str, base_k: int) -> int:
    """Return a higher k for broad/aggregation queries."""
    q = query.lower()
    if any(w in q for w in _BROAD_KEYWORDS) or any(w in q for w in _MATH_KEYWORDS):
        return max(base_k, 12)
    return base_k

def _query_threshold(query: str, base_threshold: float) -> float:
    """Lower the score threshold for broad queries so more chunks pass through."""
    q = query.lower()
    if any(w in q for w in _BROAD_KEYWORDS):
        return min(base_threshold, 0.20)
    return base_threshold


async def retrieve_chunks(
    user_id: str,
    doc_ids: list[str],
    query: str,
    top_k: int | None = None,
    score_threshold: float | None = None,
) -> list[RetrievedChunk]:
    """
    Query multiple document collections and merge/re-rank results.
    Returns top_k chunks across all documents, filtered by score_threshold.
    Automatically increases k and lowers threshold for broad/aggregation queries.
    """
    settings = get_settings()
    base_k = top_k or settings.retrieval_top_k
    base_threshold = score_threshold if score_threshold is not None else settings.retrieval_score_threshold

    k = _query_top_k(query, base_k)
    threshold = _query_threshold(query, base_threshold)
    # Fetch more candidates per collection to ensure diversity
    fetch_k = max(k * 2, 20)

    logger.info(
        "retrieve_start",
        query_preview=query[:60],
        k=k,
        threshold=threshold,
        doc_count=len(doc_ids),
    )

    query_embedding = await embed_query_async(query)
    client = get_chroma_client()

    all_chunks: list[RetrievedChunk] = []

    for doc_id in doc_ids:
        coll_name = collection_name_for(user_id, doc_id)
        try:
            collection = client.get_collection(coll_name)
        except Exception:
            logger.warning("collection_not_found", doc_id=doc_id, collection=coll_name)
            continue

        n = min(fetch_k, collection.count())
        if n == 0:
            continue

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n,
            include=["documents", "metadatas", "distances"],
        )

        docs_list = results.get("documents", [[]])[0]
        metas_list = results.get("metadatas", [[]])[0]
        dists_list = results.get("distances", [[]])[0]

        for doc_text, meta, dist in zip(docs_list, metas_list, dists_list):
            # ChromaDB cosine distance → similarity score
            score = max(0.0, 1.0 - dist)
            if score < threshold:
                continue
            all_chunks.append(
                RetrievedChunk(
                    chunk_id=meta.get("chunk_id", ""),
                    doc_id=meta.get("doc_id", doc_id),
                    text=doc_text,
                    page_number=int(meta.get("page_number", 0)),
                    chunk_index=int(meta.get("chunk_index", 0)),
                    score=score,
                    metadata=meta,
                )
            )

    # Global re-rank by score descending, take top_k
    all_chunks.sort(key=lambda c: c.score, reverse=True)
    final = all_chunks[:k]
    logger.info("retrieve_done", total_candidates=len(all_chunks), returned=len(final))
    return final
