# Phase 2: Continuous Deployment, Kubernetes Orchestration & Monitoring

This document details the implementation and usage of all 10 modules covered in **Phase 2**.

---

## 1. Continuous Deployment (CD) Pipelines
- **Staging Pipeline (`.github/workflows/cd-staging.yml`)**: Triggers on push to `main`, deploys to the `microservices-staging` namespace, and executes automated integration/smoke tests.
- **Production Pipeline (`.github/workflows/cd-production.yml`)**: Triggered on release or manual dispatch. Requires environment approval and executes zero-downtime deployment with an automated rollback safeguard.

## 2 & 3. Kubernetes Fundamentals, Ingress & API Gateway
- **API Gateway Manifest**: [`k8s/gateway/api-gateway.yaml`](../k8s/gateway/api-gateway.yaml)
  - Reverse proxy routing:
    - `/api/users` $\rightarrow$ `user-service:3001`
    - `/api/products` $\rightarrow$ `product-service:3002`
    - `/api/orders` $\rightarrow$ `order-service:8000`
    - `/health` $\rightarrow$ Gateway Health status

## 4. Multi-Environment Management
Manifests configured for environment isolation:
- `k8s/environments/dev/dev-environment.yaml` (`microservices-dev`)
- `k8s/environments/staging/staging-environment.yaml` (`microservices-staging`)
- `k8s/environments/prod/prod-environment.yaml` (`microservices-prod` with HPA and NetworkPolicies)

## 5. Infrastructure as Code (Terraform)
- Multi-environment namespace and quota management defined in [`terraform/environments.tf`](../terraform/environments.tf).
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 6. Monitoring & Logging
- **Prometheus Alert Rules**: [`monitoring/prometheus/alert-rules.yml`](../monitoring/prometheus/alert-rules.yml)
  - `ServiceDown` (Triggered if any service is unreachable for >1m)
  - `HighErrorRate` (Triggered if HTTP 5xx errors exceed 5%)
  - `HighRequestLatency` (Triggered if 95th percentile latency > 1s)

## 7. Deployment Strategies
- **Rolling Update**: Zero downtime rollout (`maxSurge: 25%`, `maxUnavailable: 0`).
- **Blue-Green Deployment**: [`k8s/strategies/blue-green/user-service-blue-green.yaml`](../k8s/strategies/blue-green/user-service-blue-green.yaml)
  - Switch traffic with PowerShell or Bash:
    ```powershell
    ./scripts/switch-blue-green.ps1 -TargetVersion green
    ```
- **Canary Deployment**: [`k8s/strategies/canary/order-service-canary.yaml`](../k8s/strategies/canary/order-service-canary.yaml)
  - 80/20 or 90/10 traffic splitting between primary and canary track deployments.

## 8. Rollback Mechanisms
Automated and manual rollback script via `kubectl rollout undo`:
```powershell
# PowerShell
./scripts/rollback.ps1 -Service user-service -Namespace microservices

# Bash
./scripts/rollback.sh user-service microservices
```

## 9. Security & Compliance
- Production namespace includes:
  - ResourceQuotas (CPU/Memory caps)
  - NetworkPolicies restricting unauthorized external ingress
  - Kubernetes Secret separation per environment

## 10. End-to-End Validation
Run automated end-to-end integration and API tests across all services:
```powershell
# PowerShell
./scripts/validate-e2e.ps1 -GatewayUrl http://localhost:8080

# Bash
./scripts/validate-e2e.sh http://localhost:8080
```
