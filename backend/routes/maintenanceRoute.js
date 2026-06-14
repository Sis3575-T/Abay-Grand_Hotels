import express from 'express'
import { createRequest, listRequests, updateRequest, deleteRequest } from '../controllers/maintenanceControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/add', adminAuth, createRequest)
router.get('/list', adminAuth, listRequests)
router.put('/update/:id', adminAuth, updateRequest)
router.delete('/delete/:id', adminAuth, deleteRequest)

export default router
