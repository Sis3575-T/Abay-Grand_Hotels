import mongoose from "mongoose";

const backupSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  size: { type: Number, default: 0 },
  collections: [{ type: String }],
  data: { type: Object, default: {} },
  createdAt: { type: Number, default: Date.now }
})

export default mongoose.model("Backup", backupSchema)
