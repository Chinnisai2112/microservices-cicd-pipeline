import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock, patch
from app.main import app


class MockResponse:
    def __init__(self, status_code, data):
        self.status_code = status_code
        self._data = data

    def json(self):
        return self._data


@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "order-service"


@pytest.mark.asyncio
async def test_list_orders():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/orders")
    assert response.status_code == 200
    assert "data" in response.json()


@pytest.mark.asyncio
async def test_create_order():
    user_resp = MockResponse(200, {"data": {"id": "1", "name": "Alice", "email": "alice@example.com"}})
    product_resp = MockResponse(200, {"data": {"id": "1", "name": "Laptop Pro", "price": 1299.99, "category": "Electronics"}})

    mock_client = MagicMock()
    mock_client.get = AsyncMock(side_effect=[user_resp, product_resp])
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=False)

    with patch("app.main.httpx.AsyncClient", return_value=mock_client):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post("/api/orders", json={
                "user_id": "1",
                "items": [{"product_id": "1", "quantity": 1}]
            })

    assert response.status_code == 201
    data = response.json()["data"]
    assert data["user_id"] == "1"
    assert data["total"] == 1299.99
