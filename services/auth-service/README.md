# Auth Service

Service d'authentification du microservices e-commerce. Gère l'inscription, la connexion (JWT) et la vérification de token.

## Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/health` | Santé du service | — |
| POST | `/register` | Créer un compte | — |
| POST | `/login` | Connexion, retourne un JWT | — |
| GET | `/verify` | Valide un token (`Authorization: Bearer <token>`) | Bearer |

### Exemples

```bash
# Inscription
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'

# Connexion
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret123"}'

# Vérification
curl http://localhost:3001/verify -H "Authorization: Bearer <token>"
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `PORT` | Port d'écoute (défaut 3001) |
| `MONGODB_URI` | URI MongoDB (collection `users`) |
| `JWT_SECRET` | Secret de signature JWT |
| `JWT_EXPIRES_IN` | Durée de validité du token (défaut `1h`) |

## Lancer

```bash
npm install
cp .env.example .env
npm run dev
```

## Sécurité

Mots de passe hashés avec **bcrypt** (jamais renvoyés par l'API). Les tokens JWT expirent (1h par défaut). Le `JWT_SECRET` doit être fort et secret en production.
