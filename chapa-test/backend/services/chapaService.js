const axios = require('axios');

const CHAPA_API_URL = 'https://api.chapa.co/v1';

const chapaClient = axios.create({
  baseURL: CHAPA_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

async function initializePayment({ amount, currency, tx_ref, email, phone, firstName, lastName, callbackUrl, returnUrl }) {
  const response = await chapaClient.post('/transaction/initialize', {
    amount,
    currency,
    tx_ref,
    email,
    first_name: firstName,
    last_name: lastName,
    phone_number: phone,
    callback_url: callbackUrl,
    return_url: returnUrl,
    customization: {
      title: 'Chapa Payment',
      description: `Payment of ${amount} ${currency}`,
    },
  });
  return response.data;
}

async function verifyPayment(tx_ref) {
  const response = await chapaClient.get(`/transaction/verify/${tx_ref}`);
  return response.data;
}

module.exports = { initializePayment, verifyPayment };
