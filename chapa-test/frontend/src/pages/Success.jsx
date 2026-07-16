import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyPayment } from '../api/paymentApi';

export default function Success() {
  const [searchParams] = useSearchParams();
  const tx_ref = searchParams.get('tx_ref');
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tx_ref) {
      setError('No transaction reference found.');
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        const data = await verifyPayment(tx_ref);
        if (data.success && data.transaction) {
          setTransaction(data.transaction);
        } else {
          setError('Payment verification failed.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [tx_ref]);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p>Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-banner">{error}</div>
        <a href="/" className="btn btn-secondary">Return Home</a>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="success-icon">&#10003;</div>
      <h1 style={{ textAlign: 'center' }}>Payment Successful</h1>
      <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Your transaction has been completed.</p>

      <div className="detail-grid">
        <div className="detail-item">
          <label>Customer Name</label>
          <span>{transaction.customerName}</span>
        </div>
        <div className="detail-item">
          <label>Amount</label>
          <span>{transaction.currency} {Number(transaction.amount).toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <label>Currency</label>
          <span>{transaction.currency}</span>
        </div>
        <div className="detail-item">
          <label>Transaction Ref</label>
          <span>{transaction.tx_ref}</span>
        </div>
        <div className="detail-item">
          <label>Payment Method</label>
          <span>{transaction.paymentMethod}</span>
        </div>
        <div className="detail-item">
          <label>Date</label>
          <span>{new Date(transaction.createdAt).toLocaleString()}</span>
        </div>
        <div className="detail-item">
          <label>Status</label>
          <span className="status-badge status-success">{transaction.status}</span>
        </div>
      </div>

      <a href="/" className="btn btn-secondary">Return Home</a>
    </div>
  );
}
