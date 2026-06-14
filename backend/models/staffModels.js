import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['Super Admin', 'Hotel Manager', 'Receptionist', 'Cashier', 'Housekeeping', 'Maintenance'] },
  department: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  salary: { type: Number, default: 0 },
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'On Leave'] },
  joinDate: { type: String, default: '' },
  createdAt: { type: Number, default: Date.now }
})

export default mongoose.model("Staff", staffSchema)
