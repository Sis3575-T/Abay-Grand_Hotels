import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  hotelName: { type: String, default: 'Abay Grand Hotel' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  description: { type: String, default: '' },
  checkinTime: { type: String, default: '14:00' },
  checkoutTime: { type: String, default: '12:00' },
  currency: { type: String, default: 'ETB' },
  taxRate: { type: String, default: '15' },
  logo: { type: String, default: '' },
})

const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema)
export default Settings
