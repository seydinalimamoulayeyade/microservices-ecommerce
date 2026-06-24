const express = require('express');
const { createPayment, getMyTransactions } = require('../controllers/payment.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', createPayment);
router.get('/', getMyTransactions);

module.exports = router;
