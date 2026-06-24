const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, 'orderId est requis'],
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'amount est requis'],
      min: [0, 'Le montant ne peut être négatif'],
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
