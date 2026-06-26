from functools import lru_cache

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def get_chroma_client() -> chromadb.PersistentClient:
    settings = get_settings()
    client = chromadb.PersistentClient(
        path=settings.chroma_persist_dir,
        settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True),
    )
    logger.info("chroma_initialized", persist_dir=settings.chroma_persist_dir)
    return client


def collection_name_for(user_id: str, doc_id: str) -> str:
    """Each document gets its own ChromaDB collection for isolated retrieval."""
    settings = get_settings()
    # Sanitize: ChromaDB collection names must match ^[a-zA-Z0-9_-]+$
    safe_uid = user_id.replace("|", "_").replace(".", "_")[:32]
    safe_did = doc_id[:36]
    return f"{settings.chroma_collection_prefix}_{safe_uid}_{safe_did}"


def get_or_create_collection(user_id: str, doc_id: str) -> chromadb.Collection:
    client = get_chroma_client()
    name = collection_name_for(user_id, doc_id)
    return client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"},
    )


def delete_collection(user_id: str, doc_id: str) -> None:
    client = get_chroma_client()
    name = collection_name_for(user_id, doc_id)
    try:
        client.delete_collection(name)
        logger.info("chroma_collection_deleted", name=name)
    except Exception:
        pass  # Already gone
