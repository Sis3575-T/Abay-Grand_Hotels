import mongoose from "mongoose";

const housekeepingSchema = new mongoose.Schema({
  roomId: { type: String, default: '' },
  roomName: { type: String, default: '' },
  assignedTo: { type: String, default: '' },
  status: { type: String, default: 'Dirty', enum: ['Clean', 'Dirty', 'Cleaning In Progress', 'Out Of Service'] },
  notes: { type: String, default: '' },
  createdAt: { type: Number, default: Date.now },
  completedAt: { type: Number, default: null }
})

export default mongoose.model("Housekeeping", housekeepingSchema)
