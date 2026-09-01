#!/usr/bin/env bash
set -euo pipefail

DOCKERHUB_USERNAME="${1:?Usage: ./deploy-k8s.sh <dockerhub-username>}"

echo "Deploying microservices with Docker Hub user: ${DOCKERHUB_USERNAME}"

kubectl apply -f k8s/namespace.yaml

for file in k8s/services/*.yaml; do
  sed "s/DOCKERHUB_USERNAME/${DOCKERHUB_USERNAME}/g" "$file" | kubectl apply -f -
done
kubectl apply -f k8s/monitoring/

echo "Waiting for deployments..."
kubectl rollout status deployment/user-service -n microservices --timeout=120s
kubectl rollout status deployment/product-service -n microservices --timeout=120s
kubectl rollout status deployment/order-service -n microservices --timeout=120s

kubectl get pods -n microservices
echo "Deployment complete!"
