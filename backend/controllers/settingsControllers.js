import Settings from '../models/settingsModels.js'
import { v2 as cloudinary } from "cloudinary";

const defaultSettings = {
  hotelName: 'Abay Grand Hotel',
  address: 'Bole Road, Addis Ababa, Ethiopia',
  phone: '+251 11 554 4000',
  email: 'info@abaygrand.com',
  website: 'https://abaygrand.com',
  facebook: 'https://facebook.com/abaygrand',
  twitter: 'https://twitter.com/abaygrand',
  instagram: 'https://instagram.com/abaygrand',
  linkedin: 'https://linkedin.com/company/abaygrand',
  description: 'Experience luxury at the heart of Addis Ababa. Abay Grand Hotel offers world-class accommodations, fine dining, and exceptional service.',
  checkinTime: '14:00',
  checkoutTime: '12:00',
  currency: 'ETB',
  taxRate: '15',
}

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create(defaultSettings)
    }
    res.json({ success: true, settings })
  } catch (error) {
    console.error('getSettings error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching settings' })
  }
}

const updateSettings = async (req, res) => {
  try {
    const updateData = {}
    const fields = [
      'hotelName', 'address', 'phone', 'email', 'website',
      'facebook', 'twitter', 'instagram', 'linkedin',
      'description', 'checkinTime', 'checkoutTime', 'currency', 'taxRate'
    ]
    fields.forEach(f => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f]
    })

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })
      updateData.logo = result?.secure_url || result?.secureUrl || ''
    }

    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({ ...defaultSettings, ...updateData })
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, updateData, { new: true })
    }

    res.json({ success: true, message: 'Settings updated successfully', settings })
  } catch (error) {
    console.error('updateSettings error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating settings' })
  }
}

export { getSettings, updateSettings }
