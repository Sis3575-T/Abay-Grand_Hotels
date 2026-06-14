import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: String, default: '' },
  relatedModel: { type: String, default: '' },
  read: { type: Boolean, default: false },
  createdAt: { type: Number, default: Date.now },
})

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
export default Notification
