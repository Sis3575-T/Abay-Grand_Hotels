import Revenue from '../models/revenueModels.js'

const generateTransactionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'TXN'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const createRevenue = async (req, res) => {
  try {
    const { customerName, roomNumber, revenueType, amount, date, paymentMethod, status, description } = req.body

    if (!customerName || !revenueType || !amount || !date || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Customer name, revenue type, amount, date, and payment method are required' })
    }

    if (amount < 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' })
    }

    const validTypes = ['Room Booking', 'Food & Beverage', 'Event', 'Spa', 'Other']
    if (!validTypes.includes(revenueType)) {
      return res.status(400).json({ success: false, message: 'Invalid revenue type' })
    }

    const validMethods = ['Cash', 'Card', 'Mobile Money', 'Bank Transfer']
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' })
    }

    let transactionId
    let isUnique = false
    while (!isUnique) {
      transactionId = generateTransactionId()
      const existing = await Revenue.findOne({ transactionId })
      if (!existing) isUnique = true
    }

    const revenue = new Revenue({
      transactionId,
      customerName,
      roomNumber: roomNumber || '',
      revenueType,
      amount: Number(amount),
      date,
      paymentMethod,
      status: status || 'Completed',
      description: description || '',
    })

    await revenue.save()
    res.json({ success: true, message: 'Revenue record created successfully', revenue })
  } catch (error) {
    console.error('createRevenue error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error creating revenue record' })
  }
}

const getAllRevenues = async (req, res) => {
  try {
    const revenues = await Revenue.find().sort({ createdAt: -1 })
    res.json({ success: true, revenues })
  } catch (error) {
    console.error('getAllRevenues error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching revenue records' })
  }
}

const getRevenueById = async (req, res) => {
  try {
    const { id } = req.params
    const revenue = await Revenue.findById(id)
    if (!revenue) {
      return res.status(404).json({ success: false, message: 'Revenue record not found' })
    }
    res.json({ success: true, revenue })
  } catch (error) {
    console.error('getRevenueById error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching revenue record' })
  }
}

const updateRevenue = async (req, res) => {
  try {
    const { id } = req.params
    const { customerName, roomNumber, revenueType, amount, date, paymentMethod, status, description } = req.body

    if (!customerName || !revenueType || !amount || !date || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Customer name, revenue type, amount, date, and payment method are required' })
    }

    if (amount < 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' })
    }

    const updateData = {
      customerName,
      roomNumber: roomNumber || '',
      revenueType,
      amount: Number(amount),
      date,
      paymentMethod,
      status: status || 'Completed',
      description: description || '',
    }

    const updated = await Revenue.findByIdAndUpdate(id, updateData, { new: true })
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Revenue record not found' })
    }

    res.json({ success: true, message: 'Revenue record updated successfully', revenue: updated })
  } catch (error) {
    console.error('updateRevenue error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating revenue record' })
  }
}

const deleteRevenue = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Revenue.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Revenue record not found' })
    }
    res.json({ success: true, message: 'Revenue record deleted successfully' })
  } catch (error) {
    console.error('deleteRevenue error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting revenue record' })
  }
}

export { createRevenue, getAllRevenues, getRevenueById, updateRevenue, deleteRevenue }
