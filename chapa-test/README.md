# Chapa Payment Test

A complete test project for the [Chapa Payment Gateway](https://chapa.co) using the official Chapa Sandbox API.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **API Client**: Axios
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
chapa-test/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Validators & error handler
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── services/        # Chapa API integration
│   ├── app.js           # Express app setup
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios API client
│   │   └── pages/       # React page components
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Chapa sandbox secret key

## Setup

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment variables

Copy the example env file in `backend/`:

```bash
cp .env.example .env
```

Fill in the values:

| Variable          | Description                              |
| ----------------- | ---------------------------------------- |
| `PORT`            | Backend port (default: 5000)             |
| `MONGODB_URI`     | MongoDB connection string                |
| `CHAPA_SECRET_KEY`| Your Chapa sandbox secret key            |
| `FRONTEND_URL`    | Frontend URL (default: http://localhost:5173) |
| `SUCCESS_URL`     | Redirect URL after successful payment    |
| `CANCEL_URL`      | Redirect URL after cancelled payment     |

Get your sandbox secret key from the [Chapa Dashboard](https://dashboard.chapa.co) under Settings > API Keys.

### 3. Run the backend

```bash
cd backend
npm run dev
```

Server starts on `http://localhost:5000`.

### 4. Run the frontend

```bash
cd frontend
npm run dev
```

Frontend starts on `http://localhost:5173`.

## How to perform a sandbox payment

1. Open `http://localhost:5173` in your browser.
2. Fill in the payment form with test details:
   - **Full Name**: Any name
   - **Email**: Any email
   - **Phone**: Any valid phone number (e.g., `+251912345678`)
   - **Amount**: Any positive number (e.g., `100`)
3. Click **Pay with Chapa**.
4. You will be redirected to the Chapa sandbox checkout page.
5. On the Chapa sandbox page, use a test card or choose "Test Successful Payment" to complete the transaction.
6. After completion, you will be redirected back to the success page where the payment is verified.

### Chapa Sandbox Test Cards

On the Chapa sandbox checkout, you can use:
- **Test Successful Payment**: Simulates a successful payment
- **Test Failed Payment**: Simulates a failed payment

## How to verify a payment

Payment verification happens automatically:
1. After the user completes payment on Chapa's checkout page, they are redirected to `/payment/success?tx_ref=xxx`.
2. The success page calls `GET /api/payment/verify/:tx_ref`.
3. The backend calls Chapa's verify endpoint to confirm the payment.
4. On successful verification, the transaction is saved to MongoDB.
5. The transaction details are displayed to the user.

You can also view all verified transactions at `/payment/history`.

## API Endpoints

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| POST   | `/api/payment/initialize`   | Initialize a new payment       |
| GET    | `/api/payment/verify/:tx_ref` | Verify a payment by tx_ref   |
| GET    | `/api/payment/history`      | Get all verified transactions  |

## Duplicate Prevention

Transactions with the same `tx_ref` are prevented from being saved twice. If a payment is already verified, the verify endpoint returns the existing transaction without calling Chapa again.

## Error Handling

The API returns appropriate HTTP status codes:
- `400` - Validation errors or Chapa API errors
- `502` - Chapa API authentication or server errors
- `503` - Service unavailable
- `504` - Request timeout
- `500` - Internal server error
