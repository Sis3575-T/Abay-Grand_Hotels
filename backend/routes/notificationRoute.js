import express from 'express'
import { getAllNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const notificationRouter = express.Router()

notificationRouter.get('/list', adminAuth, getAllNotifications)
notificationRouter.put('/read/:id', adminAuth, markAsRead)
notificationRouter.put('/read-all', adminAuth, markAllAsRead)
notificationRouter.delete('/delete/:id', adminAuth, deleteNotification)

export default notificationRouter
