const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const ApiError = require('../utils/ApiError');
const { updateOrderStatus } = require('../services/orderService');

// POST /payment  (JWT requis)
const createPayment = async (req, res, next) => {
  try {
    const { orderId, amount } = req.body;
    if (!orderId || amount === undefined) {
      throw new ApiError(400, 'orderId et amount sont requis');
    }
    if (typeof amount !== 'number' || amount < 0) {
      throw new ApiError(400, 'amount doit être un nombre positif');
    }

    // Simulation du paiement (succès configurable, défaut 70%)
    const successRate = parseFloat(process.env.PAYMENT_SUCCESS_RATE || '0.7');
    const success = Math.random() < successRate;
    const status = success ? 'success' : 'failed';

    const transaction = await Transaction.create({
      orderId,
      userId: req.user.id,
      amount,
      status,
      reference: `TX-${crypto.randomBytes(6).toString('hex').toUpperCase()}`,
    });

    // Notifier l'Order Service du résultat (best-effort)
    const newOrderStatus = success ? 'paid' : 'cancelled';
    const orderNotified = await updateOrderStatus(orderId, newOrderStatus, req.token);

    res.status(201).json({
      status: 'success',
      data: {
        transactionId: transaction._id,
        reference: transaction.reference,
        result: status,
        amount: transaction.amount,
        orderId: transaction.orderId,
        orderStatus: orderNotified ? newOrderStatus : 'non mis à jour',
        orderNotified,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /payments  (mes transactions)
const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: transactions.length, data: transactions });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, getMyTransactions };
