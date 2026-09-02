#!/usr/bin/env bash
set -e

GATEWAY_URL="${1:-http://localhost:8080}"

echo "========================================"
echo "  Starting End-to-End Validation Tests"
echo "  Gateway URL: $GATEWAY_URL"
echo "========================================"

echo "Testing Gateway Health..."
curl -s -f "$GATEWAY_URL/health" > /dev/null
echo "[PASSED] Gateway Health"

echo "Testing Create User..."
curl -s -f -X POST "$GATEWAY_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"DevOps Intern","email":"intern@example.com"}' > /dev/null
echo "[PASSED] Create User"

echo "Testing List Users..."
curl -s -f "$GATEWAY_URL/api/users" > /dev/null
echo "[PASSED] List Users"

echo "Testing Create Product..."
curl -s -f -X POST "$GATEWAY_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cloud Kubernetes Guide","price":29.99,"category":"Books","stock":100}' > /dev/null
echo "[PASSED] Create Product"

echo "Testing List Products..."
curl -s -f "$GATEWAY_URL/api/products" > /dev/null
echo "[PASSED] List Products"

echo "Testing Create Order..."
curl -s -f -X POST "$GATEWAY_URL/api/orders" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"1","items":[{"product_id":"1","quantity":2}]}' > /dev/null
echo "[PASSED] Create Order"

echo "Testing List Orders..."
curl -s -f "$GATEWAY_URL/api/orders" > /dev/null
echo "[PASSED] List Orders"

echo "========================================"
echo "  [SUCCESS] All E2E Tests Passed!"
echo "========================================"
