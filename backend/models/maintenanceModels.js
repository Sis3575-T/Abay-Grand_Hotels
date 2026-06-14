import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  roomId: { type: String, default: '' },
  roomName: { type: String, default: '' },
  issue: { type: String, required: true },
  description: { type: String, default: '' },
  assignedTo: { type: String, default: '' },
  priority: { type: String, default: 'Medium', enum: ['Low', 'Medium', 'High', 'Critical'] },
  status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Completed'] },
  createdAt: { type: Number, default: Date.now },
  completedAt: { type: Number, default: null }
})

export default mongoose.model("Maintenance", maintenanceSchema)
