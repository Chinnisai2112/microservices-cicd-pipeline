terraform {
  required_version = ">= 1.5.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

variable "dockerhub_username" {
  description = "Docker Hub username for image tags"
  type        = string
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "microservices-cicd"
}

locals {
  services = ["user-service", "product-service", "order-service"]
}

resource "docker_network" "microservices" {
  name = "${var.project_name}-network"
}

resource "docker_image" "services" {
  for_each = toset(local.services)

  name         = "${var.dockerhub_username}/${each.key}:latest"
  keep_locally = true

  build {
    context    = "${path.module}/../services/${each.key}"
    dockerfile = "Dockerfile"
  }
}

resource "docker_container" "services" {
  for_each = toset(local.services)

  name  = each.key
  image = docker_image.services[each.key].image_id

  networks_advanced {
    name = docker_network.microservices.name
  }

  ports {
    internal = each.key == "order-service" ? 8000 : (each.key == "product-service" ? 3002 : 3001)
    external = each.key == "order-service" ? 8000 : (each.key == "product-service" ? 3002 : 3001)
  }

  env = each.key == "order-service" ? [
    "USER_SERVICE_URL=http://user-service:3001",
    "PRODUCT_SERVICE_URL=http://product-service:3002"
  ] : []

  restart = "unless-stopped"

  depends_on = [docker_network.microservices]
}

output "service_urls" {
  value = {
    user_service    = "http://localhost:3001"
    product_service = "http://localhost:3002"
    order_service   = "http://localhost:8000"
  }
}

output "network_name" {
  value = docker_network.microservices.name
}
