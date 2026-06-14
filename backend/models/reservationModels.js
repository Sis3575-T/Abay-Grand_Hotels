import mongoose from "mongoose";

const auditSubSchema = {
  userId: { type: String, default: '' },
  name: { type: String, default: '' },
  role: { type: String, default: '' },
  actionDate: { type: Date, default: Date.now },
}

const reservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  checkin: { type: String, required: true },
  checkout: { type: String, required: true },
  guests: { type: Number, required: true },
  roomName: { type: String, required: true },
  roomId: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  createdBy: { type: auditSubSchema, default: () => ({}) },
  approvedBy: { type: auditSubSchema, default: () => ({}) },
  rejectedBy: { type: auditSubSchema, default: () => ({}) },
  checkedInBy: { type: auditSubSchema, default: () => ({}) },
  checkedOutBy: { type: auditSubSchema, default: () => ({}) },
  cancelledBy: { type: auditSubSchema, default: () => ({}) },
  updatedBy: { type: auditSubSchema, default: () => ({}) },
})

export default mongoose.model("Reservation", reservationSchema)
