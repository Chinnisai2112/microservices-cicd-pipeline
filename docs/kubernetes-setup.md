# Kubernetes Setup Guide

Deploy the microservices stack to a local Kubernetes cluster using **Minikube** or **Kind**.

## Prerequisites

- kubectl installed and configured
- Minikube **or** Kind installed
- Docker images pushed to Docker Hub (or loaded locally)

## Option A: Minikube

### Start Cluster

```bash
minikube start --cpus=4 --memory=8192
minikube addons enable metrics-server
```

### Load Local Images (if not using Docker Hub)

```bash
eval $(minikube docker-env)
docker build -t user-service:latest services/user-service
docker build -t product-service:latest services/product-service
docker build -t order-service:latest services/order-service
```

Update image references in `k8s/services/*.yaml` to use `user-service:latest` instead of `DOCKERHUB_USERNAME/user-service:latest`.

### Deploy

Replace `DOCKERHUB_USERNAME` in manifest files, then:

```bash
# Linux/macOS
./scripts/deploy-k8s.sh your-dockerhub-username

# Windows PowerShell
.\scripts\deploy-k8s.ps1 -DockerHubUsername your-dockerhub-username
```

Or manually:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/services/
kubectl apply -f k8s/monitoring/
```

### Verify

```bash
kubectl get pods -n microservices
kubectl get svc -n microservices
```

### Access Services

```bash
# Port-forward order service
kubectl port-forward svc/order-service 8000:8000 -n microservices

# Port-forward Grafana
kubectl port-forward svc/grafana 3000:3000 -n microservices
```

## Option B: Kind

### Create Cluster

```bash
kind create cluster --name microservices
```

### Load Images

```bash
docker build -t user-service:latest services/user-service
docker build -t product-service:latest services/product-service
docker build -t order-service:latest services/order-service

kind load docker-image user-service:latest --name microservices
kind load docker-image product-service:latest --name microservices
kind load docker-image order-service:latest --name microservices
```

Update manifests to use local image names and set `imagePullPolicy: Never`.

### Deploy

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/services/
kubectl apply -f k8s/monitoring/
```

## Scaling

```bash
kubectl scale deployment user-service --replicas=3 -n microservices
```

## Cleanup

```bash
kubectl delete namespace microservices
minikube stop   # or: kind delete cluster --name microservices
```

## Intern Exercise

1. Deploy all three services to Minikube
2. Create an order via port-forwarded order-service
3. Scale product-service to 3 replicas and verify with `kubectl get pods`
4. Open Grafana and confirm metrics are flowing
