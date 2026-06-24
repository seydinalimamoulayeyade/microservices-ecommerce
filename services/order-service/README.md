# Order Service

Service de gestion des commandes du microservices e-commerce. Toutes les routes nécessitent un JWT. À la création d'une commande, il appelle le **Product Service** pour vérifier le stock de chaque article.

## Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/health` | Santé du service | — |
| POST | `/orders` | Créer une commande (vérifie le stock) | Bearer |
| GET | `/orders` | Mes commandes | Bearer |
| GET | `/orders/:id` | Détail d'une commande (propriétaire ou admin) | Bearer |
| PATCH | `/orders/:id/status` | Mettre à jour le statut | Bearer |

Statuts : `pending` → `paid` → `shipped` → `delivered` (ou `cancelled`).

### Exemple

```bash
curl -X POST http://localhost:3003/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"<id>","quantity":2}]}'
```

## Communication inter-services

`createOrder` interroge `GET {PRODUCT_SERVICE_URL}/products/:id` pour récupérer prix et stock. Si le stock est insuffisant → `400`. Si le Product Service est injoignable → `503`. Le prix est figé (snapshot) dans la commande au moment de l'achat.

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `PORT` | Port d'écoute (défaut 3003) |
| `MONGODB_URI` | URI MongoDB (collection `orders`) |
| `JWT_SECRET` | Secret JWT partagé |
| `PRODUCT_SERVICE_URL` | URL du Product Service (défaut `http://localhost:3002`) |

## Lancer

```bash
npm install
cp .env.example .env
npm run dev
```
