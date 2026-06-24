const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/order.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'order-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/orders', orderRoutes);

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: `Route ${req.originalUrl} introuvable` });
});

app.use(errorHandler);

module.exports = app;
