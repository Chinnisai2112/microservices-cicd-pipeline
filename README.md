# Automated CI/CD Pipeline for a Microservices Application

A hands-on internship project demonstrating a complete **microservices architecture** with **Docker containerization**, **automated CI/CD pipelines**, **Kubernetes orchestration**, and **observability**.

## Architecture Overview

```
                    ┌─────────────────┐
                    │   API Gateway   │  (optional, port 8080)
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
   ┌─────▼─────┐      ┌──────▼──────┐     ┌──────▼──────┐
   │   User    │      │   Product   │     │    Order    │
   │  Service  │      │   Service   │     │   Service   │
   │ Node.js   │      │  Node.js    │     │   Python    │
   │  :3001    │      │   :3002     │     │   :8000     │
   └───────────┘      └─────────────┘     └─────────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌────▼────┐
        │ Prometheus│  │  Grafana  │  │  Trivy  │
        └───────────┘  └───────────┘  └─────────┘
```

## Tech Stack

| Category | Tools |
|----------|-------|
| **Services** | Node.js (Express), Python (FastAPI) |
| **APIs** | REST |
| **Version Control** | Git, GitHub |
| **Containerization** | Docker, Docker Hub |
| **CI/CD** | GitHub Actions, Jenkins |
| **Orchestration** | Kubernetes (Minikube / Kind) |
| **IaC** | Terraform (Basic) |
| **Monitoring** | Prometheus, Grafana |
| **Security** | Trivy (container scanning) |
| **Cloud (Optional)** | AWS / Azure / GCP, Render / Railway |
| **Documentation** | Markdown, Draw.io |

## Project Structure

```
.
├── services/
│   ├── user-service/       # Node.js – user management
│   ├── product-service/    # Node.js – product catalog
│   └── order-service/      # Python – order processing
├── k8s/                    # Kubernetes manifests
├── terraform/              # Basic infrastructure as code
├── jenkins/                # Jenkins pipeline definitions
├── monitoring/             # Prometheus & Grafana configs
├── .github/workflows/      # GitHub Actions CI pipelines
├── docs/                   # Architecture & setup guides
└── docker-compose.yml      # Local development stack
```

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js 20+](https://nodejs.org/)
- [Python 3.11+](https://www.python.org/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) (for K8s)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) or [Kind](https://kind.sigs.k8s.io/) (optional)

### Run Locally with Docker Compose

```bash
docker compose up --build
```

| Service | URL | Health |
|---------|-----|--------|
| User Service | http://localhost:3001 | `/health` |
| Product Service | http://localhost:3002 | `/health` |
| Order Service | http://localhost:8000 | `/health` |
| Prometheus | http://localhost:9090 | – |
| Grafana | http://localhost:3000 | admin / admin |

### Run Services Individually (Development)

```bash
# User Service
cd services/user-service && npm install && npm run dev

# Product Service
cd services/product-service && npm install && npm run dev

# Order Service
cd services/order-service && pip install -r requirements.txt && uvicorn app.main:app --reload
```

### Run Tests

```bash
# User Service
cd services/user-service && npm test

# Product Service
cd services/product-service && npm test

# Order Service
cd services/order-service && pytest
```

## CI/CD Pipelines

### GitHub Actions

Each service has its own workflow (`.github/workflows/`):

1. **Lint & Test** – code quality and unit tests
2. **Build** – Docker image build
3. **Security Scan** – Trivy vulnerability scan
4. **Push** – publish to Docker Hub (on main branch)

Configure these repository secrets:

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |

### Jenkins

See [`jenkins/Jenkinsfile`](jenkins/Jenkinsfile) for a multi-service pipeline that mirrors the GitHub Actions workflow.

## Kubernetes Deployment

```bash
# Start Minikube
minikube start

# Deploy all services
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/services/
kubectl apply -f k8s/monitoring/

# Check status
kubectl get pods -n microservices
```

See [docs/kubernetes-setup.md](docs/kubernetes-setup.md) for detailed instructions.

## Terraform

Basic infrastructure provisioning in [`terraform/`](terraform/). See [docs/terraform-guide.md](docs/terraform-guide.md).

## Monitoring

- **Prometheus** scrapes `/metrics` from each service
- **Grafana** dashboards visualize service health and request rates
- Pre-configured datasource and dashboard in `monitoring/grafana/`

## Security Scanning

Trivy runs in CI to scan Docker images for CVEs. Run locally:

```bash
docker build -t user-service:local services/user-service
trivy image user-service:local
```

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System design and data flow |
| [Setup Guide](docs/setup-guide.md) | Step-by-step intern onboarding |
| [Kubernetes Setup](docs/kubernetes-setup.md) | K8s deployment guide |
| [Terraform Guide](docs/terraform-guide.md) | IaC basics |
| [CI/CD Guide](docs/cicd-guide.md) | Pipeline configuration |

## Intern Tasks Checklist

- [ ] Clone repo and run `docker compose up`
- [ ] Explore REST APIs via curl or Postman
- [ ] Add a new endpoint to one service and write tests
- [ ] Trigger a GitHub Actions CI run
- [ ] Build and scan an image with Trivy
- [ ] Deploy to Minikube/Kind
- [ ] View metrics in Grafana
- [ ] Draw architecture diagram in Draw.io (template in `docs/diagrams/`)

## License

MIT – for educational and internship use.
