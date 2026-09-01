# 5–10 Minute Demo Video Script & Presentation Guide

This guide gives you a step-by-step recording plan for your 5 to 10-minute project presentation.

---

## Video Outline & Timestamp Breakdown

| Time | Section | Screen to Show | What to Say / Do |
|---|---|---|---|
| **0:00 - 1:00** | **Introduction & Architecture** | GitHub Repo & Architecture Diagram (`docs/architecture.md`) | Introduce yourself, project goals, tech stack (Node.js, FastAPI, Docker, K8s, GitHub Actions, Prometheus, Grafana). |
| **1:00 - 2:30** | **Microservices & Local Docker Stack** | Terminal (`docker compose up`) + Browser (`localhost:3001`, `localhost:8000`) | Show the 3 services running locally, hit health checks and API endpoints in browser or Postman. |
| **2:30 - 4:30** | **CI/CD Pipeline & GitHub Actions** | GitHub Repository $\rightarrow$ **Actions** Tab | Show automated CI runs: Linting, Unit Testing, Trivy CVE Scanning, Docker Build & Push, and Staging CD. |
| **4:30 - 6:30** | **Kubernetes Orchestration & API Gateway** | Terminal (`kubectl get all -n microservices`) | Demonstrate K8s pods, services, HPA, ConfigMaps, and the NGINX API Gateway routing. |
| **6:30 - 8:00** | **Deployment Strategy & Rollback Demo** | Terminal (`scripts/switch-blue-green.ps1` & `scripts/rollback.ps1`) | Demonstrate Blue-Green traffic switching and simulate a rollback using `kubectl rollout undo`. |
| **8:00 - 9:30** | **Observability (Prometheus & Grafana)** | Browser (`localhost:9090` and `localhost:3000`) | Show Prometheus scraping `/metrics` and walk through the Grafana microservices dashboard. |
| **9:30 - 10:00**| **Conclusion & Key Takeaways** | Presentation Summary / GitHub page | Highlight production readiness, key learnings, and wrap up. |

---

## Detailed Step-by-Step Recording Instructions

### 1. Introduction (0:00 - 1:00)
- **Visual**: Show the GitHub repository homepage: [https://github.com/Chinnisai2112/microservices-cicd-pipeline](https://github.com/Chinnisai2112/microservices-cicd-pipeline)
- **Script**:
  > *"Hello everyone, welcome to my demonstration of the Automated CI/CD Pipeline and Kubernetes Orchestration for a Microservices Application. In this project, we built a production-ready DevOps workflow covering containerization, multi-environment Kubernetes orchestration, automated testing and security scanning, zero-downtime deployment strategies, and full observability."*

---

### 2. Local Architecture & Services (1:00 - 2:30)
- **Commands**:
  ```bash
  docker compose up -d
  curl http://localhost:3001/health
  curl http://localhost:3002/health
  curl http://localhost:8000/health
  ```
- **Script**:
  > *"We have three core microservices: the User Service and Product Service built with Node.js and Express, and the Order Service built with Python FastAPI. All services expose health and Prometheus metric endpoints."*

---

### 3. CI/CD & Security Scanning (2:30 - 4:30)
- **Visual**: Open GitHub Actions tab.
- **Script**:
  > *"Every push triggers an automated CI pipeline. The pipeline first runs linting and unit tests. Then, Trivy scans the Docker container for vulnerabilities. If no high or critical issues exist, the image is automatically built and pushed to Docker Hub."*

---

### 4. Kubernetes Orchestration & Environments (4:30 - 6:30)
- **Commands**:
  ```bash
  kubectl get namespaces
  kubectl get pods -n microservices
  kubectl get svc -n microservices
  ```
- **Script**:
  > *"On Kubernetes, our application is partitioned across Dev, Staging, and Production namespaces. We have an NGINX API Gateway that routes external traffic to the appropriate microservice, along with Horizontal Pod Autoscalers to handle traffic spikes."*

---

### 5. Deployment Strategies & Rollback (6:30 - 8:00)
- **Commands**:
  ```powershell
  # Demonstrate Blue-Green Switch
  ./scripts/switch-blue-green.ps1 -TargetVersion green

  # Demonstrate Rollback Guard
  ./scripts/rollback.ps1 -Service user-service -Namespace microservices
  ```
- **Script**:
  > *"To ensure zero downtime, we support Blue-Green deployments and Rolling Updates. If an unhealthy deployment is detected, our automated rollback mechanism instantly rolls back the deployment to the previous stable revision."*

---

### 6. Prometheus & Grafana Monitoring (8:00 - 9:30)
- **Visual**: Show Prometheus targets (`http://localhost:9090/targets`) and Grafana Dashboard (`http://localhost:3000`).
- **Script**:
  > *"For observability, Prometheus continuously scrapes metrics from each service. Our Grafana dashboard visualizes real-time request rates, latency percentiles, error rates, and resource utilization."*

---

### 7. Wrap-up (9:30 - 10:00)
- **Script**:
  > *"In summary, this project demonstrates an end-to-end cloud-native DevOps workflow from code commit to automated testing, container scanning, Kubernetes orchestration, and monitoring. Thank you!"*
