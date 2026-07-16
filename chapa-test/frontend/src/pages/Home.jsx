import { useState } from 'react';
import { initializePayment } from '../api/paymentApi';

export default function Home() {
  const [form, setForm] = useState({ customerName: '', customerEmail: '', phone: '', amount: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Full name is required';
    if (!form.customerEmail.trim()) errs.customerEmail = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.customerEmail)) errs.customerEmail = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a positive amount';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const data = await initializePayment({ ...form, amount: Number(form.amount) });
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setApiError('Failed to get checkout URL from Chapa.');
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Payment initialization failed.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  }

  return (
    <div className="card">
      <h1>Make a Payment</h1>
      <p>Test Chapa payment gateway with sandbox</p>

      {apiError && <div className="error-banner">{apiError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="John Doe" />
          {errors.customerName && <div className="form-error">{errors.customerName}</div>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="customerEmail" value={form.customerEmail} onChange={handleChange} placeholder="john@example.com" />
          {errors.customerEmail && <div className="form-error">{errors.customerEmail}</div>}
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="+251912345678" />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label>Amount (ETB)</label>
          <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="100" min="1" step="0.01" />
          {errors.amount && <div className="form-error">{errors.amount}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? 'Processing...' : 'Pay with Chapa'}
        </button>
      </form>
    </div>
  );
}
