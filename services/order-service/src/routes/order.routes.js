const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
