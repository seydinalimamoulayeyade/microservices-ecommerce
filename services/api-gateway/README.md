# API Gateway

Point d'entrée unique du microservices e-commerce. Route les requêtes vers les services, vérifie le JWT de façon centralisée sur les routes protégées, applique un rate limiting et journalise toutes les requêtes.

## Routage

| Préfixe | Service cible | Auth (passerelle) |
|---------|---------------|-------------------|
| `/api/auth/*` | auth-service (:3001) | publique |
| `/api/products/*` | product-service (:3002) | publique (écriture admin gérée par le service) |
| `/api/orders/*` | order-service (:3003) | **JWT requis** |
| `/api/payment/*` | payment-service (:3004) | **JWT requis** |
| `GET /health` | passerelle | — |

Exemples de réécriture :
- `POST /api/auth/login` → `auth-service` `/login`
- `GET /api/products` → `product-service` `/products`
- `POST /api/orders` → `order-service` `/orders`

## Fonctions transverses

- **Auth centralisée** : le JWT est vérifié à la passerelle pour `/api/orders` et `/api/payment`, puis relayé tel quel au service (qui le re-vérifie — défense en profondeur).
- **Rate limiting** : par IP (défaut 100 req / 15 min), configurable.
- **Logging** : toutes les requêtes via `morgan`.
- Le corps des requêtes n'est pas parsé à la passerelle (relais brut vers les services).

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `PORT` | Port d'écoute (défaut 3000) |
| `JWT_SECRET` | Secret JWT partagé (vérification) |
| `AUTH_SERVICE_URL` / `PRODUCT_SERVICE_URL` / `ORDER_SERVICE_URL` / `PAYMENT_SERVICE_URL` | URLs des services |
| `RATE_LIMIT_WINDOW_MS` | Fenêtre du rate limit (défaut 900000) |
| `RATE_LIMIT_MAX` | Nombre max de requêtes par fenêtre (défaut 100) |

## Lancer

```bash
npm install
cp .env.example .env
npm run dev
```

> Nécessite que les 4 services soient démarrés (ou utiliser le `docker-compose.yml` à la racine en Phase 2).
