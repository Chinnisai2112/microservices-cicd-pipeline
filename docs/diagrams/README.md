# Architecture Diagrams (Draw.io)

Interns should create visual architecture diagrams using [Draw.io](https://app.diagrams.net/) (diagrams.net).

## Required Diagrams

### 1. System Architecture Diagram

Include:
- All three microservices (User, Product, Order)
- REST API communication between services
- Docker containers
- GitHub repository
- CI/CD pipeline (GitHub Actions / Jenkins)
- Docker Hub registry
- Kubernetes cluster
- Prometheus and Grafana
- Trivy security scanning step

### 2. CI/CD Pipeline Flow

Include:
- Developer commit/push
- Lint & test stage
- Docker build stage
- Trivy scan stage
- Push to registry
- Kubernetes deployment
- Monitoring feedback loop

### 3. Sequence Diagram (Order Creation)

Show:
1. Client sends POST to Order Service
2. Order Service validates user via User Service
3. Order Service fetches product via Product Service
4. Order Service returns created order

## How to Create

1. Go to https://app.diagrams.net/
2. Create a new diagram
3. Use shapes: rectangles for services, cylinders for registries, clouds for K8s
4. Export as PNG and PDF
5. Save source `.drawio` files in this folder

## Suggested File Names

```
docs/diagrams/
├── system-architecture.drawio
├── system-architecture.png
├── cicd-pipeline.drawio
├── cicd-pipeline.png
├── order-sequence.drawio
└── order-sequence.png
```

## Tips

- Use consistent colors: blue for services, green for CI/CD, orange for monitoring
- Label all arrows with protocol (REST/HTTP)
- Include port numbers on service boxes
- Add a legend for symbols used

## Reference

See the Mermaid diagrams in [architecture.md](../architecture.md) for text-based equivalents.
