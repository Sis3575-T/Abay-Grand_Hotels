const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { initializePayment, verifyPayment } = require('../services/chapaService');
const Transaction = require('../models/Transaction');

async function initialize(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { customerName, customerEmail, phone, amount, currency } = req.body;

    const nameParts = customerName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const tx_ref = uuidv4();
    const payCurrency = currency || 'ETB';

    const response = await initializePayment({
      amount: String(amount),
      currency: payCurrency,
      tx_ref,
      email: customerEmail,
      phone,
      firstName,
      lastName,
      callbackUrl: `${process.env.FRONTEND_URL}/payment/success?tx_ref=${tx_ref}`,
      returnUrl: `${process.env.FRONTEND_URL}/payment/success?tx_ref=${tx_ref}`,
    });

    if (response.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment initialization failed', error: response });
    }

    res.json({
      success: true,
      checkout_url: response.data.checkout_url,
      tx_ref,
    });
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return res.status(400).json({ success: false, message: 'Transaction reference is required' });
    }

    const existing = await Transaction.findOne({ tx_ref });
    if (existing) {
      return res.json({ success: true, message: 'Payment already verified', transaction: existing });
    }

    const response = await verifyPayment(tx_ref);

    if (response.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment verification failed', error: response });
    }

    const { data } = response;

    const transaction = await Transaction.create({
      customerName: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.customer_name || 'N/A',
      customerEmail: data.email || 'N/A',
      phone: data.phone_number || 'N/A',
      amount: parseFloat(data.amount) || 0,
      currency: data.currency || 'ETB',
      tx_ref: data.tx_ref,
      reference: data.id || '',
      paymentMethod: data.payment_type || 'N/A',
      status: data.status || 'completed',
    });

    res.json({ success: true, message: 'Payment verified successfully', transaction });
  } catch (error) {
    next(error);
  }
}

async function history(req, res, next) {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (error) {
    next(error);
  }
}

module.exports = { initialize, verify, history };
