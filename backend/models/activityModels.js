import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: String, default: '' },
  userName: { type: String, default: '' },
  userRole: { type: String, default: '' },
  reservationId: { type: String, default: '' },
  guestName: { type: String, default: '' },
  details: { type: String, default: '' },
  createdAt: { type: Number, default: Date.now },
})

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)
export default Activity
