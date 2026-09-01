#!/usr/bin/env bash
set -e

TARGET_VERSION="${1}"
SERVICE_NAME="${2:-user-service-active}"
NAMESPACE="${3:-microservices}"

if [[ "$TARGET_VERSION" != "blue" && "$TARGET_VERSION" != "green" ]]; then
    echo "Usage: ./switch-blue-green.sh <blue|green> [service_name] [namespace]"
    exit 1
fi

echo "========================================"
echo "  Switching Traffic to $TARGET_VERSION Version"
echo "========================================"

kubectl patch service "$SERVICE_NAME" -n "$NAMESPACE" -p "{\"spec\":{\"selector\":{\"version\":\"$TARGET_VERSION\"}}}"

echo "[SUCCESS] Traffic actively routed to $TARGET_VERSION deployment!"
kubectl get service "$SERVICE_NAME" -n "$NAMESPACE" -o wide
