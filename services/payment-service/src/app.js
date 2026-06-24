const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/payment.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'payment-service', timestamp: new Date().toISOString() });
});

// Routes (POST /payment , GET /payment)
app.use('/payment', paymentRoutes);

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: `Route ${req.originalUrl} introuvable` });
});

app.use(errorHandler);

module.exports = app;
