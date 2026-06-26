"""
Singleton embedding model using sentence-transformers/bge-small-en-v1.5.
BGE models require a query prefix for retrieval tasks.
"""
import asyncio
from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    settings = get_settings()
    logger.info("loading_embedding_model", model=settings.embedding_model)
    model = SentenceTransformer(settings.embedding_model, device=settings.embedding_device)
    logger.info("embedding_model_loaded", dim=model.get_sentence_embedding_dimension())
    return model


def embed_documents(texts: list[str]) -> list[list[float]]:
    """Embed document chunks (no prefix needed for BGE document side)."""
    if not texts:
        return []
    model = get_embedding_model()
    embeddings = model.encode(texts, normalize_embeddings=True, batch_size=64, show_progress_bar=False)
    return embeddings.tolist()


def embed_query(query: str) -> list[float]:
    """Embed a user query with the BGE query prefix."""
    model = get_embedding_model()
    prefixed = _QUERY_PREFIX + query
    embedding = model.encode([prefixed], normalize_embeddings=True, show_progress_bar=False)
    return embedding[0].tolist()


async def embed_documents_async(texts: list[str]) -> list[list[float]]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, embed_documents, texts)


async def embed_query_async(query: str) -> list[float]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, embed_query, query)
