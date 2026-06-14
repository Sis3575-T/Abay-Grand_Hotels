import express from 'express'
import { createTask, listTasks, updateTask, deleteTask } from '../controllers/housekeepingControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/add', adminAuth, createTask)
router.get('/list', adminAuth, listTasks)
router.put('/update/:id', adminAuth, updateTask)
router.delete('/delete/:id', adminAuth, deleteTask)

export default router
