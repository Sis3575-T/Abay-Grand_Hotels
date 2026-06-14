import express from 'express'
import { getAllActivities, deleteActivity } from '../controllers/activityControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const activityRouter = express.Router()

activityRouter.get('/list', adminAuth, getAllActivities)
activityRouter.delete('/delete/:id', adminAuth, deleteActivity)

export default activityRouter
