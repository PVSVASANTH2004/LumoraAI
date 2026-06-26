"""
Pytest fixtures shared across test modules.
Uses httpx's AsyncClient for async FastAPI testing.
"""
import os
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

# Set test env before importing app
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("APP_DEBUG", "true")
os.environ.setdefault("SECRET_KEY", "test-secret-key-minimum-32-chars-long")
os.environ.setdefault("GOOGLE_API_KEY", "test-key")
os.environ.setdefault("FIREBASE_STORAGE_BUCKET", "")


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture
async def client():
    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
