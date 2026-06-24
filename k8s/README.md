# Déploiement Kubernetes (Phase 3)

Manifests pour déployer l'e-commerce sur un cluster Kubernetes (testé en local avec **minikube** / **kind**, prêt pour EKS en Phase 4).

## Architecture

- Namespace **`microservices`** : les 5 services (api-gateway, auth, product, order, payment) + leurs Services ClusterIP.
- Namespace **`databases`** : 4 StatefulSets MongoDB isolés (mongo-auth, mongo-products, mongo-orders, mongo-payments), chacun avec un Service headless et un volume persistant (PVC).
- **ConfigMap** `app-config` (valeurs non sensibles) + **Secret** `app-secret` (JWT).
- Réplicas : api-gateway/auth/product/order = 2, payment = 1.
- **HPA** sur l'api-gateway (2 → 5 pods, cible CPU 70 %).

## Structure

```
k8s/
├── 00-namespaces.yaml
├── 01-config.yaml            # ConfigMap + Secret
├── databases/                # 4 StatefulSets MongoDB
├── auth-service/
├── product-service/
├── order-service/
├── payment-service/
└── api-gateway/              # deployment + service (NodePort) + hpa
```

## Prérequis : charger les images dans le cluster

Les images sont construites localement (`docker compose build`). Pour minikube/kind, il faut les rendre disponibles au cluster :

```bash
# minikube
minikube image load ecommerce-auth-service:latest
minikube image load ecommerce-product-service:latest
minikube image load ecommerce-order-service:latest
minikube image load ecommerce-payment-service:latest
minikube image load ecommerce-api-gateway:latest

# kind
kind load docker-image ecommerce-auth-service:latest   # ... idem pour les 5
```

## Déploiement

```bash
kubectl apply -f k8s/00-namespaces.yaml
kubectl apply -f k8s/01-config.yaml
kubectl apply -f k8s/databases/
kubectl apply -R -f k8s/auth-service/ -f k8s/product-service/ \
                  -f k8s/order-service/ -f k8s/payment-service/ -f k8s/api-gateway/

kubectl get pods -n databases
kubectl get pods -n microservices
```

## Accès à la passerelle

```bash
minikube service api-gateway -n microservices --url
# ou récupérer le NodePort auto-assigné :
kubectl get svc api-gateway -n microservices
# (Docker Desktop / kind : accessible sur http://localhost:<nodePort>)
```

## Autoscaling (HPA)

Nécessite metrics-server :

```bash
minikube addons enable metrics-server
kubectl get hpa -n microservices
```

## Notes production (EKS, Phase 4)

- Remplacer le `Service` NodePort de l'api-gateway par `type: LoadBalancer` (ALB) ou un Ingress.
- Remplacer les images locales par les URIs **Amazon ECR**.
- Externaliser le `Secret` (AWS Secrets Manager / Sealed Secrets) au lieu d'une valeur en clair.
