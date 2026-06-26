import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_root_redirects(client):
    response = await client.get("/", follow_redirects=False)
    assert response.status_code in (301, 302, 307, 308)
