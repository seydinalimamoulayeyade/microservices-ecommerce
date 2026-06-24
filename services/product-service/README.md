# Product Service

Service catalogue produits du microservices e-commerce. CRUD produits ; la lecture est publique, l'écriture réservée aux administrateurs (JWT vérifié avec le secret partagé `JWT_SECRET`).

## Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/health` | Santé du service | — |
| GET | `/products` | Liste (filtres `?category=`, `?search=`) | — |
| GET | `/products/:id` | Détail d'un produit | — |
| POST | `/products` | Créer un produit | admin |
| PUT | `/products/:id` | Modifier un produit | admin |
| DELETE | `/products/:id` | Supprimer un produit | admin |

### Exemples

```bash
# Liste publique
curl http://localhost:3002/products

# Création (admin)
curl -X POST http://localhost:3002/products \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Clavier mécanique","price":89.9,"stock":25,"category":"peripheriques"}'
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `PORT` | Port d'écoute (défaut 3002) |
| `MONGODB_URI` | URI MongoDB (collection `products`) |
| `JWT_SECRET` | Secret JWT partagé avec l'Auth Service |

## Lancer

```bash
npm install
cp .env.example .env
npm run dev
```
