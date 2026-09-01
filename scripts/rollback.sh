#!/usr/bin/env bash
set -e

SERVICE="${1:-user-service}"
NAMESPACE="${2:-microservices}"

echo "========================================"
echo "  Executing Rollback for $SERVICE in $NAMESPACE"
echo "========================================"

echo "Fetching rollout history..."
kubectl rollout history deployment/"$SERVICE" -n "$NAMESPACE"

echo "Rolling back to previous revision..."
kubectl rollout undo deployment/"$SERVICE" -n "$NAMESPACE"

echo "Monitoring rollout status..."
kubectl rollout status deployment/"$SERVICE" -n "$NAMESPACE" --timeout=60s

echo "[SUCCESS] Rollback completed successfully for $SERVICE!"
