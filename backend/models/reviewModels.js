import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  roomName: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  date: { type: String, required: true },
  comment: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Approved', 'Pending'],
    default: 'Pending'
  },
  createdAt: { type: Number, default: Date.now }
})

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema)
export default Review
