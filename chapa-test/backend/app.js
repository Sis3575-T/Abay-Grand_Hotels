const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

app.use(express.json());

app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Chapa Payment API is running.' });
});

app.use(errorHandler);

module.exports = app;
