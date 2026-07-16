import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export async function initializePayment(data) {
  const response = await api.post('/payment/initialize', data);
  return response.data;
}

export async function verifyPayment(tx_ref) {
  const response = await api.get(`/payment/verify/${tx_ref}`);
  return response.data;
}

export async function getPaymentHistory() {
  const response = await api.get('/payment/history');
  return response.data;
}
