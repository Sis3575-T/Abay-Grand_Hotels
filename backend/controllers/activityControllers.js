import Activity from '../models/activityModels.js'

const logActivity = async ({ action, userId, userName, userRole, reservationId, guestName, details }) => {
  try {
    await Activity.create({ action, userId, userName, userRole, reservationId, guestName, details })
  } catch (error) {
    console.error('logActivity error:', error?.message || error)
  }
}

const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 })
    res.json({ success: true, activities })
  } catch (error) {
    console.error('getAllActivities error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching activities' })
  }
}

const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Activity.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Activity not found' })
    res.json({ success: true, message: 'Activity deleted' })
  } catch (error) {
    console.error('deleteActivity error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting activity' })
  }
}

export { logActivity, getAllActivities, deleteActivity }
