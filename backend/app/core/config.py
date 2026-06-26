from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Lumora AI"
    app_env: str = "development"
    app_debug: bool = False
    api_v1_prefix: str = "/api/v1"
    secret_key: str = Field(min_length=32)

    # CORS
    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v: str | list) -> list[str]:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",")]
        return v

    # Dev mode (bypasses Firebase auth + uses local JSON store)
    dev_mode: bool = False
    dev_user_id: str = "dev-user-001"

    # Firebase
    firebase_service_account_path: str = "./firebase-service-account.json"
    firebase_storage_bucket: str = ""

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Embeddings
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    embedding_device: str = "cpu"

    # ChromaDB
    chroma_persist_dir: str = "./chroma_data"
    chroma_collection_prefix: str = "lumora"

    # Document processing
    chunk_size: int = 800
    chunk_overlap: int = 150
    max_file_size_mb: int = 50
    allowed_extensions: list[str] = ["pdf", "txt", "md", "docx"]

    @field_validator("allowed_extensions", mode="before")
    @classmethod
    def parse_extensions(cls, v: str | list) -> list[str]:
        if isinstance(v, str):
            return [e.strip().lstrip(".") for e in v.split(",")]
        return v

    # RAG
    retrieval_top_k: int = 6
    retrieval_score_threshold: float = 0.35
    max_context_tokens: int = 12000

    # Rate limiting
    rate_limit_requests: int = 60
    rate_limit_window: int = 60

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


SettingsDep = Annotated[Settings, None]
