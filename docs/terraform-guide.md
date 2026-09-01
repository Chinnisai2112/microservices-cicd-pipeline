# Terraform Guide

Basic **Infrastructure as Code** using Terraform to provision Docker containers locally.

## Overview

The Terraform configuration in `terraform/` creates:

- A Docker network for service communication
- Docker images built from each service Dockerfile
- Running containers for all three microservices

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- Docker running locally
- Docker provider access (Terraform talks to Docker daemon)

## Quick Start

```bash
cd terraform

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit dockerhub_username in terraform.tfvars

terraform init
terraform plan
terraform apply
```

## File Structure

```
terraform/
├── main.tf                  # Resources and provider config
└── terraform.tfvars.example # Example variable values
```

## Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `dockerhub_username` | Docker Hub username for image tags | (required) |
| `project_name` | Prefix for network name | `microservices-cicd` |

## What Gets Created

| Resource | Name | Purpose |
|----------|------|---------|
| `docker_network` | microservices-cicd-network | Inter-service communication |
| `docker_image` | user-service, product-service, order-service | Built from Dockerfiles |
| `docker_container` | user-service (3001), product-service (3002), order-service (8000) | Running services |

## Verify

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:8000/health
```

## Destroy

```bash
terraform destroy
```

## Intern Exercises

1. Run `terraform plan` and explain each resource in the output
2. Modify `project_name` and re-apply
3. Add a variable for replica count (stretch goal)
4. Compare Terraform approach vs `docker compose up`

## Notes

- This is a **local Docker** setup, not cloud infrastructure
- For AWS/Azure/GCP, interns can extend this with respective providers (ECS, AKS, GKE)
- State is stored locally in `terraform.tfstate` – do not commit this file
