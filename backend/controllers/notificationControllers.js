import Notification from '../models/notificationModels.js'

const createNotification = async ({ type, message, relatedId = '', relatedModel = '' }) => {
  try {
    await Notification.create({ type, message, relatedId, relatedModel, read: false })
  } catch (error) {
    console.error('createNotification error:', error?.message || error)
  }
}

const getAllNotifications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(limit)
    const unreadCount = await Notification.countDocuments({ read: false })
    res.json({ success: true, notifications, unreadCount })
  } catch (error) {
    console.error('getAllNotifications error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching notifications' })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true })
    if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' })
    res.json({ success: true, message: 'Marked as read' })
  } catch (error) {
    console.error('markAsRead error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error marking notification as read' })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true })
    res.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    console.error('markAllAsRead error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error marking all as read' })
  }
}

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Notification.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Notification not found' })
    res.json({ success: true, message: 'Notification deleted' })
  } catch (error) {
    console.error('deleteNotification error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting notification' })
  }
}

export { createNotification, getAllNotifications, markAsRead, markAllAsRead, deleteNotification }
