# Microservices E-commerce

Mini e-commerce découpé en 5 microservices indépendants, déployés en local via Docker Compose puis sur AWS EKS via Terraform. Projet 3/5 du portfolio DevOps — démontre l'architecture microservices, Kubernetes et l'Infrastructure as Code.

## Architecture

```
Client → API Gateway (:3000)
            ├── Auth Service    (:3001)  — MongoDB users
            ├── Product Service (:3002)  — MongoDB products
            ├── Order Service   (:3003)  — MongoDB orders
            └── Payment Service (:3004)  — MongoDB transactions
```

L'API Gateway est le point d'entrée unique : routage, vérification JWT centralisée, rate limiting et logging.

## Stack

Node.js / Express (×5) · MongoDB (une base par service) · Docker Compose (local) · AWS EKS + ECR · Terraform (IaC)

## Services

| Service | Port | Rôle | Collection |
|---------|------|------|------------|
| api-gateway | 3000 | Point d'entrée, routage, auth, rate limit | — |
| auth-service | 3001 | Register / Login / Verify (JWT) | users |
| product-service | 3002 | CRUD produits | products |
| order-service | 3003 | Commandes (vérifie le stock) | orders |
| payment-service | 3004 | Paiement simulé (success/failed) | transactions |

## Phases de développement

- **Phase 1** — Les 5 services en local (Node.js pur)
- **Phase 2** — Conteneurisation + Docker Compose
- **Phase 3** — Manifests Kubernetes (minikube/kind)
- **Phase 4** — Terraform (VPC + EKS + ECR) + déploiement AWS

## État d'avancement

- [x] Auth Service
- [x] Product Service
- [x] Order Service
- [x] Payment Service
- [x] API Gateway
- [x] Docker Compose
- [x] Kubernetes
- [ ] Terraform

## Démarrage

### Tout en conteneurs (recommandé — Phase 2)

```bash
cp .env.example .env          # définir JWT_SECRET
docker compose up -d --build  # 5 services + 4 bases MongoDB
```

Seule la passerelle est exposée : **http://localhost:3000**. Les services et les bases communiquent sur le réseau interne `ecommerce-network`.

```bash
docker compose ps             # état des conteneurs
docker compose logs -f api-gateway
docker compose down           # arrêter (ajouter -v pour purger les volumes)
```

Exemple de parcours complet via la passerelle :

```bash
# Inscription + connexion
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}' | jq -r .token)

# Catalogue (public), commande et paiement (JWT requis)
curl http://localhost:3000/api/products
curl -X POST http://localhost:3000/api/orders -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"items":[{"productId":"<id>","quantity":1}]}'
```

### Service par service (Phase 1)

Chaque service se lance indépendamment. Voir le README de chaque service dans `services/`.

```bash
cd services/auth-service
npm install
cp .env.example .env
npm run dev
```
