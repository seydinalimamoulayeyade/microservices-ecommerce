variable "aws_region" {
  description = "Région AWS de déploiement"
  type        = string
  default     = "eu-west-3"
}

variable "project_name" {
  description = "Préfixe de nommage des ressources"
  type        = string
  default     = "ecommerce"
}

variable "vpc_cidr" {
  description = "Bloc CIDR du VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR des sous-réseaux publics (un par AZ)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR des sous-réseaux privés (un par AZ)"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "cluster_version" {
  description = "Version de Kubernetes pour le cluster EKS"
  type        = string
  default     = "1.31"
}

variable "node_instance_type" {
  description = "Type d'instance EC2 des nœuds du cluster"
  type        = string
  default     = "t3.medium"
}

variable "node_desired_size" {
  description = "Nombre de nœuds souhaité"
  type        = number
  default     = 3
}

variable "node_min_size" {
  description = "Nombre minimal de nœuds"
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Nombre maximal de nœuds"
  type        = number
  default     = 4
}

variable "services" {
  description = "Liste des services (un dépôt ECR par service)"
  type        = list(string)
  default = [
    "api-gateway",
    "auth-service",
    "product-service",
    "order-service",
    "payment-service",
  ]
}
