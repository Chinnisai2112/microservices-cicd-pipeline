from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import httpx
import os
import time

app = FastAPI(title="Order Service", version="1.0.0")

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:3001")
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:3002")

orders: list[dict] = []
next_id = 1

REQUEST_COUNT = Counter(
    "order_service_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"]
)
REQUEST_LATENCY = Histogram(
    "order_service_request_duration_seconds",
    "Request latency in seconds",
    ["method", "endpoint"]
)


class OrderItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)


class CreateOrderRequest(BaseModel):
    user_id: str
    items: list[OrderItem]


@app.middleware("http")
async def metrics_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    endpoint = request.url.path
    REQUEST_LATENCY.labels(request.method, endpoint).observe(duration)
    REQUEST_COUNT.labels(request.method, endpoint, response.status_code).inc()
    return response


@app.get("/health")
def health():
    return {"status": "healthy", "service": "order-service"}


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/api/orders")
def list_orders():
    return {"data": orders}


@app.get("/api/orders/{order_id}")
def get_order(order_id: str):
    order = next((o for o in orders if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"data": order}


@app.post("/api/orders", status_code=201)
async def create_order(payload: CreateOrderRequest):
    global next_id

    async with httpx.AsyncClient(timeout=5.0) as client:
        user_resp = await client.get(f"{USER_SERVICE_URL}/api/users/{payload.user_id}")
        if user_resp.status_code == 404:
            raise HTTPException(status_code=400, detail="Invalid user_id")

        total = 0.0
        line_items = []
        for item in payload.items:
            product_resp = await client.get(f"{PRODUCT_SERVICE_URL}/api/products/{item.product_id}")
            if product_resp.status_code == 404:
                raise HTTPException(status_code=400, detail=f"Invalid product_id: {item.product_id}")
            product = product_resp.json()["data"]
            subtotal = product["price"] * item.quantity
            total += subtotal
            line_items.append({
                "product_id": item.product_id,
                "product_name": product["name"],
                "quantity": item.quantity,
                "unit_price": product["price"],
                "subtotal": subtotal
            })

    order = {
        "id": str(next_id),
        "user_id": payload.user_id,
        "items": line_items,
        "total": round(total, 2),
        "status": "pending"
    }
    next_id += 1
    orders.append(order)
    return {"data": order}
