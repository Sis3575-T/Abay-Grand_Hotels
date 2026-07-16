const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'ETB' },
  tx_ref: { type: String, required: true, unique: true },
  reference: { type: String },
  paymentMethod: { type: String },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
