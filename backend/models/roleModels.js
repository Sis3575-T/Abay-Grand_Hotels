import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
  createdAt: { type: Number, default: Date.now }
})

export default mongoose.model("Role", roleSchema)
