import Backup from '../models/backupModels.js'
import Hotel from '../models/hotelModels.js'
import Reservation from '../models/reservationModels.js'
import Revenue from '../models/revenueModels.js'
import Review from '../models/reviewModels.js'
import Message from '../models/messageModels.js'
import Staff from '../models/staffModels.js'
import Role from '../models/roleModels.js'
import Housekeeping from '../models/housekeepingModels.js'
import Maintenance from '../models/maintenanceModels.js'

const createBackup = async (req, res) => {
  try {
    const collections = {}
    const colNames = []

    const hotels = await Hotel.find()
    if (hotels.length) { collections.hotels = hotels; colNames.push('hotels') }

    const reservations = await Reservation.find()
    if (reservations.length) { collections.reservations = reservations; colNames.push('reservations') }

    const revenues = await Revenue.find()
    if (revenues.length) { collections.revenues = revenues; colNames.push('revenues') }

    const reviews = await Review.find()
    if (reviews.length) { collections.reviews = reviews; colNames.push('reviews') }

    const messages = await Message.find()
    if (messages.length) { collections.messages = messages; colNames.push('messages') }

    const staff = await Staff.find()
    if (staff.length) { collections.staff = staff; colNames.push('staff') }

    const roles = await Role.find()
    if (roles.length) { collections.roles = roles; colNames.push('roles') }

    const housekeeping = await Housekeeping.find()
    if (housekeeping.length) { collections.housekeeping = housekeeping; colNames.push('housekeeping') }

    const maintenance = await Maintenance.find()
    if (maintenance.length) { collections.maintenance = maintenance; colNames.push('maintenance') }

    const jsonStr = JSON.stringify(collections)
    const size = Buffer.byteLength(jsonStr, 'utf8')

    const backup = new Backup({
      filename: `backup-${Date.now()}.json`,
      size,
      collections: colNames,
      data: collections,
    })
    await backup.save()
    res.json({ success: true, message: 'Backup created successfully', backup })
  } catch (error) {
    console.error('createBackup error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error creating backup' })
  }
}

const listBackups = async (req, res) => {
  try {
    const backups = await Backup.find().sort({ createdAt: -1 })
    res.json({ success: true, backups })
  } catch (error) {
    console.error('listBackups error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching backups' })
  }
}

const getBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id)
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' })
    res.json({ success: true, backup })
  } catch (error) {
    console.error('getBackup error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching backup' })
  }
}

const downloadBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id)
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' })
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`)
    res.json(backup.data)
  } catch (error) {
    console.error('downloadBackup error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error downloading backup' })
  }
}

const restoreBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id)
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' })
    const data = backup.data
    if (data.hotels) await Hotel.deleteMany({}); await Hotel.insertMany(data.hotels)
    if (data.reservations) await Reservation.deleteMany({}); await Reservation.insertMany(data.reservations)
    if (data.revenues) await Revenue.deleteMany({}); await Revenue.insertMany(data.revenues)
    if (data.reviews) await Review.deleteMany({}); await Review.insertMany(data.reviews)
    if (data.messages) await Message.deleteMany({}); await Message.insertMany(data.messages)
    if (data.staff) await Staff.deleteMany({}); await Staff.insertMany(data.staff)
    if (data.roles) await Role.deleteMany({}); await Role.insertMany(data.roles)
    if (data.housekeeping) await Housekeeping.deleteMany({}); await Housekeeping.insertMany(data.housekeeping)
    if (data.maintenance) await Maintenance.deleteMany({}); await Maintenance.insertMany(data.maintenance)
    res.json({ success: true, message: 'Backup restored successfully' })
  } catch (error) {
    console.error('restoreBackup error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error restoring backup' })
  }
}

const deleteBackup = async (req, res) => {
  try {
    const deleted = await Backup.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Backup not found' })
    res.json({ success: true, message: 'Backup deleted' })
  } catch (error) {
    console.error('deleteBackup error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting backup' })
  }
}

export { createBackup, listBackups, getBackup, downloadBackup, restoreBackup, deleteBackup }
