# Infrastructure AWS (Phase 4 — Terraform)

Infrastructure as Code pour déployer l'e-commerce sur **AWS EKS**. Ressources natives (provider `hashicorp/aws ~> 5.40`), sans dépendance à des modules tiers.

## Ressources provisionnées

| Fichier | Ressources |
|---------|------------|
| `vpc.tf` | VPC, Internet Gateway, 2 sous-réseaux publics, 2 privés, NAT Gateway + EIP, tables de routage (tags EKS pour la découverte des LoadBalancers) |
| `eks.tf` | Cluster EKS (control plane), node group managé (3× t3.medium en sous-réseaux privés), rôles IAM (cluster + nœuds) |
| `ecr.tf` | 5 dépôts ECR (un par service) avec scan d'image au push et politique de rétention (10 images) |
| `main.tf` | Provider AWS, data sources, locals |
| `variables.tf` / `outputs.tf` | Paramètres et sorties |

## Prérequis

- Terraform >= 1.5
- AWS CLI configuré (`aws configure`) avec des droits suffisants (VPC, EKS, IAM, ECR)
- kubectl

## Utilisation

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # ajuster si besoin

terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply        # ⚠️ crée des ressources AWS facturées (EKS, NAT, EC2)
```

### Configurer kubectl et déployer l'application

```bash
# La sortie configure_kubectl donne la commande exacte :
aws eks update-kubeconfig --region eu-west-3 --name ecommerce-eks

# Pousser les images sur ECR (voir ecr_repository_urls), puis :
#   - remplacer les images locales par les URIs ECR dans k8s/
kubectl apply -R -f ../k8s/
```

## Nettoyage

```bash
terraform destroy     # détruit toute l'infrastructure
```

> 💡 EKS, le NAT Gateway et les instances EC2 sont **facturés à l'heure**. Penser à `terraform destroy` après les tests pour éviter les coûts.

## Notes

- Le `backend "s3"` est préparé (commenté) dans `main.tf` pour un état distant partagé.
- Pour la production : restreindre `endpoint_public_access`, activer le chiffrement des secrets EKS (KMS) et utiliser IRSA pour les permissions fines des pods.
