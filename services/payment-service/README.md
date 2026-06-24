# Payment Service

Service de paiement **simulé** du microservices e-commerce. Toutes les routes nécessitent un JWT. Chaque paiement réussit ou échoue de façon aléatoire (taux configurable, défaut 70 % de succès), la transaction est enregistrée, et le résultat est notifié à l'**Order Service**.

## Endpoints

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/health` | Santé du service | — |
| POST | `/payment` | Simuler un paiement | Bearer |
| GET | `/payment` | Mes transactions | Bearer |

### Exemple

```bash
curl -X POST http://localhost:3004/payment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"<id>","amount":59.9}'
```

Réponse (résultat `success` ou `failed`) :

```json
{
  "status": "success",
  "data": {
    "reference": "TX-AB12CD34EF56",
    "result": "success",
    "amount": 59.9,
    "orderId": "<id>",
    "orderStatus": "paid",
    "orderNotified": true
  }
}
```

## Communication inter-services

À l'issue du paiement, le service appelle `PATCH {ORDER_SERVICE_URL}/orders/:orderId/status` en relayant le token de l'utilisateur :
- paiement **réussi** → commande `paid`
- paiement **échoué** → commande `cancelled`

La notification est *best-effort* : la transaction est enregistrée même si l'Order Service est injoignable (`orderNotified: false`).

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `PORT` | Port d'écoute (défaut 3004) |
| `MONGODB_URI` | URI MongoDB (collection `transactions`) |
| `JWT_SECRET` | Secret JWT partagé |
| `ORDER_SERVICE_URL` | URL de l'Order Service (défaut `http://localhost:3003`) |
| `PAYMENT_SUCCESS_RATE` | Taux de succès simulé entre 0 et 1 (défaut `0.7`) |

## Lancer

```bash
npm install
cp .env.example .env
npm run dev
```
