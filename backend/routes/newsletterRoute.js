import express from 'express'
import Newsletter from '../models/newsletterModels.js'

const newsletterRouter = express.Router()

newsletterRouter.get('/count', async (req, res) => {
  try {
    const count = await Newsletter.countDocuments()
    res.json({ success: true, count })
  } catch (error) {
    console.error('newsletter count error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching subscriber count' })
  }
})

newsletterRouter.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }
    const existing = await Newsletter.findOne({ email })
    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed!' })
    }
    const sub = new Newsletter({ email })
    await sub.save()
    res.json({ success: true, message: 'Successfully subscribed to our newsletter!' })
  } catch (error) {
    console.error('newsletter subscribe error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error subscribing to newsletter' })
  }
})

export default newsletterRouter
