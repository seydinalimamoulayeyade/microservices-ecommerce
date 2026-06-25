provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "Terraform"
    }
  }
}

# Zones de disponibilité de la région
data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  cluster_name = "${var.project_name}-eks"

  # Deux premières AZ de la région
  azs = slice(data.aws_availability_zones.available.names, 0, 2)
}
