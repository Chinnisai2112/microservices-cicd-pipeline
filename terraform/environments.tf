# Kubernetes Provider and Multi-Environment Automation
terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25.0"
    }
  }
}

variable "environments" {
  type    = list(string)
  default = ["dev", "staging", "prod"]
}

resource "kubernetes_namespace" "env_namespaces" {
  for_each = toset(var.environments)

  metadata {
    name = "microservices-${each.key}"
    labels = {
      environment = each.key
      managed_by  = "terraform"
    }
  }
}

resource "kubernetes_resource_quota" "prod_quota" {
  metadata {
    name      = "prod-resource-quota"
    namespace = kubernetes_namespace.env_namespaces["prod"].metadata[0].name
  }

  spec {
    hard = {
      "requests.cpu"    = "4"
      "requests.memory" = "8Gi"
      "limits.cpu"      = "8"
      "limits.memory"   = "16Gi"
      "pods"            = "30"
    }
  }
}
