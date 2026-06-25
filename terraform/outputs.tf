output "aws_region" {
  description = "Région AWS"
  value       = var.aws_region
}

output "cluster_name" {
  description = "Nom du cluster EKS"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "Endpoint de l'API server du cluster EKS"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_version" {
  description = "Version Kubernetes du cluster"
  value       = aws_eks_cluster.main.version
}

output "vpc_id" {
  description = "ID du VPC"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "IDs des sous-réseaux privés"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "IDs des sous-réseaux publics"
  value       = aws_subnet.public[*].id
}

output "ecr_repository_urls" {
  description = "URLs des dépôts ECR (un par service)"
  value       = { for name, repo in aws_ecr_repository.services : name => repo.repository_url }
}

output "configure_kubectl" {
  description = "Commande pour configurer kubectl sur le cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.main.name}"
}
