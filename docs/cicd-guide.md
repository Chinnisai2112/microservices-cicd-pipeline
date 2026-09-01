# CI/CD Guide

This project supports two CI/CD tools: **GitHub Actions** (primary) and **Jenkins** (alternative).

## GitHub Actions

### Workflow Structure

Each service has a dedicated workflow file:

| Workflow | Trigger Paths |
|----------|---------------|
| `ci-user-service.yml` | `services/user-service/**` |
| `ci-product-service.yml` | `services/product-service/**` |
| `ci-order-service.yml` | `services/order-service/**` |

### Pipeline Stages

1. **Lint & Test** – Install dependencies, run lint and unit tests
2. **Build & Scan** – Build Docker image, scan with Trivy (CRITICAL/HIGH)
3. **Push** – Push to Docker Hub (main branch only)

### Required Secrets

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (not password) |

Create a token at: https://hub.docker.com/settings/security

### Triggering a Run

```bash
# Any push to main/develop touching a service folder
git add services/user-service/src/index.js
git commit -m "feat: add email validation to user service"
git push
```

## Jenkins

### Setup

1. Install Jenkins with Docker and Node.js/Python plugins
2. Install Trivy on the Jenkins agent
3. Create a credential `dockerhub-credentials` (username + password/token)
4. Create a Pipeline job pointing to `jenkins/Jenkinsfile`

### Parameters

| Parameter | Options | Description |
|-----------|---------|-------------|
| `SERVICE` | all, user-service, product-service, order-service | Which service to build |
| `PUSH_IMAGE` | true/false | Push to Docker Hub after build |
| `RUN_TRIVY` | true/false | Run security scan |

### Running the Pipeline

1. Open Jenkins → your pipeline job
2. Click **Build with Parameters**
3. Select service and options
4. Monitor console output

## Trivy Security Scanning

Trivy scans container images for known vulnerabilities (CVEs).

### In CI

Both GitHub Actions and Jenkins fail the pipeline if CRITICAL or HIGH severity issues are found.

### Locally

```bash
docker build -t my-service:local services/user-service
trivy image --severity CRITICAL,HIGH my-service:local
```

### Ignoring False Positives

Create `.trivyignore` in the service directory:

```
# Example: ignore a specific CVE
CVE-2024-12345
```

## Docker Hub

### Image Naming Convention

```
<username>/user-service:latest
<username>/user-service:<git-sha>
<username>/product-service:latest
<username>/order-service:latest
```

### Pull and Run

```bash
docker pull yourusername/user-service:latest
docker run -p 3001:3001 yourusername/user-service:latest
```

## Optional Cloud Deployment

### Render / Railway

1. Connect your GitHub repo
2. Set root directory to `services/<service-name>`
3. Configure build command and port
4. Deploy each service independently

### AWS / Azure / GCP

- Use EKS / AKS / GKE for Kubernetes
- Push images to ECR / ACR / GCR instead of Docker Hub
- Update CI workflows to push to cloud registry

## Intern Exercises

1. Push code and watch GitHub Actions run all three stages
2. Intentionally break a test and observe CI failure
3. Run Trivy locally and document any findings
4. Configure Jenkins and run a parameterized build
5. Push an image to Docker Hub and pull it on another machine
