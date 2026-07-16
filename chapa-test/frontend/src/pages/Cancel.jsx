export default function Cancel() {
  return (
    <div className="card cancel-container">
      <div className="cancel-icon">&#10060;</div>
      <h1>Payment Cancelled</h1>
      <p>You have cancelled the payment. No charges were made.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Return Home</a>
    </div>
  );
}
