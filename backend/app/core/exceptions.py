from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class DocumentNotFoundError(Exception):
    def __init__(self, doc_id: str) -> None:
        super().__init__(f"Document '{doc_id}' not found")
        self.doc_id = doc_id


class DocumentProcessingError(Exception):
    def __init__(self, doc_id: str, reason: str) -> None:
        super().__init__(f"Processing failed for '{doc_id}': {reason}")
        self.doc_id = doc_id
        self.reason = reason


class SessionNotFoundError(Exception):
    def __init__(self, session_id: str) -> None:
        super().__init__(f"Chat session '{session_id}' not found")
        self.session_id = session_id


class AuthenticationError(Exception):
    pass


class FileTooLargeError(Exception):
    def __init__(self, size_mb: float, limit_mb: int) -> None:
        super().__init__(f"File {size_mb:.1f}MB exceeds {limit_mb}MB limit")
        self.size_mb = size_mb
        self.limit_mb = limit_mb


class UnsupportedFileTypeError(Exception):
    def __init__(self, ext: str, allowed: list[str]) -> None:
        super().__init__(f"File type '.{ext}' not supported. Allowed: {allowed}")
        self.ext = ext
        self.allowed = allowed


class EmbeddingError(Exception):
    pass


class LLMError(Exception):
    pass


# ── FastAPI exception handlers ────────────────────────────────────────────────

async def document_not_found_handler(request: Request, exc: DocumentNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)})


async def document_processing_handler(request: Request, exc: DocumentProcessingError) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={"detail": str(exc), "doc_id": exc.doc_id})


async def session_not_found_handler(request: Request, exc: SessionNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)})


async def auth_handler(request: Request, exc: AuthenticationError) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"detail": str(exc)})


async def file_too_large_handler(request: Request, exc: FileTooLargeError) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, content={"detail": str(exc)})


async def unsupported_file_handler(request: Request, exc: UnsupportedFileTypeError) -> JSONResponse:
    return JSONResponse(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, content={"detail": str(exc), "allowed": exc.allowed})


def register_exception_handlers(app) -> None:  # type: ignore[type-arg]
    app.add_exception_handler(DocumentNotFoundError, document_not_found_handler)
    app.add_exception_handler(DocumentProcessingError, document_processing_handler)
    app.add_exception_handler(SessionNotFoundError, session_not_found_handler)
    app.add_exception_handler(AuthenticationError, auth_handler)
    app.add_exception_handler(FileTooLargeError, file_too_large_handler)
    app.add_exception_handler(UnsupportedFileTypeError, unsupported_file_handler)
