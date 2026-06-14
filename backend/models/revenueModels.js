import mongoose from "mongoose";

const revenueSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  roomNumber: { type: String, default: '' },
  revenueType: {
    type: String,
    enum: ['Room Booking', 'Food & Beverage', 'Event', 'Spa', 'Other'],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  date: { type: String, required: true },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Mobile Money', 'Bank Transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Refunded'],
    default: 'Completed'
  },
  description: { type: String, default: '' },
  createdAt: { type: Number, default: Date.now }
})

const Revenue = mongoose.models.Revenue || mongoose.model('Revenue', revenueSchema)
export default Revenue
