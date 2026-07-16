import { useEffect, useState } from 'react';
import { getPaymentHistory } from '../api/paymentApi';

export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getPaymentHistory();
        setTransactions(data.transactions || []);
      } catch (err) {
        setError('Failed to load payment history.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="card card-wide" style={{ textAlign: 'center' }}>
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className="card card-wide">
      <h1>Payment History</h1>
      <p>All verified transactions</p>

      {error && <div className="error-banner">{error}</div>}

      {transactions.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', padding: '2rem 0' }}>No transactions found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{t.customerName}</td>
                  <td>{t.customerEmail}</td>
                  <td>{t.currency} {Number(t.amount).toLocaleString()}</td>
                  <td><span className="status-badge status-success">{t.status}</span></td>
                  <td>{t.paymentMethod}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
