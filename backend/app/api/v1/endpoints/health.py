from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import get_settings

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    timestamp: str


@router.get("/health", response_model=HealthResponse, summary="Health check")
async def health_check() -> HealthResponse:
    """Returns service health status. No authentication required."""
    settings = get_settings()
    return HealthResponse(
        status="ok",
        version="1.0.0",
        environment=settings.app_env,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
