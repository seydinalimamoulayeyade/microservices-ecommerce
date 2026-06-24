const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { requireAuth } = require('./middleware/auth.middleware');

const app = express();

const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
  order: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
};

// CORS + logging de toutes les requêtes
app.use(cors());
app.use(morgan('dev'));

// Rate limiting basique (par IP)
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Trop de requêtes, réessayez plus tard' },
});
app.use(limiter);

// Health check de la passerelle
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Fabrique de proxy (NB : pas de body parser en amont pour relayer le corps brut)
const makeProxy = (target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    proxyTimeout: 10000,
    onError: (err, req, res) => {
      res.status(503).json({ status: 'error', message: `Service indisponible (${target})` });
    },
  });

// Routage vers les services
//   /api/auth/*     -> auth-service     (public : register / login / verify)
//   /api/products/* -> product-service  (lecture publique, écriture admin gérée par le service)
//   /api/orders/*   -> order-service     (JWT requis, vérifié ici)
//   /api/payment/*  -> payment-service   (JWT requis, vérifié ici)
app.use('/api/auth', makeProxy(SERVICES.auth, { '^/api/auth': '' }));
app.use('/api/products', makeProxy(SERVICES.product, { '^/api': '' }));
app.use('/api/orders', requireAuth, makeProxy(SERVICES.order, { '^/api': '' }));
app.use('/api/payment', requireAuth, makeProxy(SERVICES.payment, { '^/api': '' }));

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: `Route ${req.originalUrl} introuvable` });
});

module.exports = app;
