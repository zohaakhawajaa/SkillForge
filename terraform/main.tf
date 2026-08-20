terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Basic infrastructure for publishing the three Docker images before a Kubernetes deployment.
resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}/frontend"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "api_gateway" {
  name                 = "${var.project_name}/api-gateway"
  image_tag_mutability = "MUTABLE"
}

resource "aws_ecr_repository" "python_service" {
  name                 = "${var.project_name}/python-service"
  image_tag_mutability = "MUTABLE"
}
