"""
DocuMind AI — FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import RedirectResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import get_logger, setup_logging
from app.middleware.cors import add_cors
from app.middleware.logging import add_logging_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm-up: pre-load embedding model to avoid cold-start on first request."""
    settings = get_settings()
    logger = get_logger(__name__)
    logger.info("startup", app=settings.app_name, env=settings.app_env)

    try:
        from app.rag.embeddings.sentence_transformer import get_embedding_model
        get_embedding_model()
        logger.info("embedding_model_ready")
    except Exception as e:
        logger.warning("embedding_model_preload_failed", error=str(e))

    yield

    logger.info("shutdown")


def create_app() -> FastAPI:
    settings = get_settings()
    setup_logging(debug=settings.app_debug)

    app = FastAPI(
        title="Lumora AI API",
        description="""
## Lumora AI — RAG Document Assistant

### Features
- **Document Management**: Upload PDFs, track processing status
- **Streaming Chat**: Ask questions, get streaming AI answers grounded in your documents
- **Source Citations**: Every answer includes document name, page number, and relevance score
- **Multi-document Retrieval**: Query across multiple documents in a single session

### Authentication
All endpoints (except `/health`) require a Firebase ID token:
```
Authorization: Bearer <firebase-id-token>
```
        """,
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Middleware (order matters — outermost first)
    add_cors(app)
    add_logging_middleware(app)

    # Exception handlers
    register_exception_handlers(app)

    # Routes
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/", include_in_schema=False)
    async def root():
        return RedirectResponse(url="/docs")

    return app


app = create_app()
