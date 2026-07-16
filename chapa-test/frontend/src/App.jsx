import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import History from './pages/History';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <a href="/" className="header-title">Chapa Payment Test</a>
        <nav className="header-nav">
          <a href="/">Home</a>
          <a href="/payment/history">History</a>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/payment/success" element={<Success />} />
          <Route path="/payment/cancel" element={<Cancel />} />
          <Route path="/payment/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}
