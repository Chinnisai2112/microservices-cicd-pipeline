# Setup Guide

Step-by-step onboarding for interns working on this project.

## 1. Clone and Explore

```bash
git clone <your-repo-url>
cd microservices-cicd
```

Review the project structure in the root `README.md`.

## 2. Install Prerequisites

| Tool | Version | Install Link |
|------|---------|--------------|
| Git | Latest | https://git-scm.com/ |
| Docker Desktop | Latest | https://docs.docker.com/get-docker/ |
| Node.js | 20+ | https://nodejs.org/ |
| Python | 3.11+ | https://www.python.org/ |
| kubectl | Latest | https://kubernetes.io/docs/tasks/tools/ |
| Minikube or Kind | Latest | See links in README |

## 3. Run Locally

### Option A: Docker Compose (Recommended)

```bash
docker compose up --build
```

Verify each service:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:8000/health
```

### Option B: Run Services Individually

Open three terminals:

```bash
# Terminal 1
cd services/user-service && npm install && npm run dev

# Terminal 2
cd services/product-service && npm install && npm run dev

# Terminal 3
cd services/order-service && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## 4. Test the APIs

```bash
# List users
curl http://localhost:3001/api/users

# List products
curl http://localhost:3002/api/products

# Create an order
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":"1","items":[{"product_id":"1","quantity":1}]}'
```

## 5. Run Tests

```bash
cd services/user-service && npm test
cd services/product-service && npm test
cd services/order-service && python -m pytest -v
```

## 6. Set Up GitHub Actions

1. Create a GitHub repository and push this project.
2. Go to **Settings → Secrets and variables → Actions**.
3. Add secrets:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`
4. Push a change to `services/user-service/` and watch the CI workflow run.

## 7. Security Scan with Trivy

```bash
# Install Trivy: https://aquasecurity.github.io/trivy/latest/getting-started/installation/
docker build -t user-service:local services/user-service
trivy image user-service:local
```

## 8. View Monitoring

After running `docker compose up`:

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin / admin)

Generate traffic and watch metrics update:

```bash
for i in $(seq 1 20); do curl -s http://localhost:3001/health > /dev/null; done
```

## 9. Next Steps

- [Kubernetes Setup](kubernetes-setup.md)
- [CI/CD Guide](cicd-guide.md)
- [Terraform Guide](terraform-guide.md)
- [Architecture](architecture.md)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Stop other services or change ports in `docker-compose.yml` |
| Docker build fails | Ensure Docker Desktop is running |
| Order service 400 error | Verify user-service and product-service are healthy first |
| Grafana empty dashboard | Generate API traffic, wait ~30s for Prometheus scrape |
