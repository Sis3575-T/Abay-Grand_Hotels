import express from 'express'
import { addStaff, listStaff, getStaffById, updateStaff, deleteStaff } from '../controllers/staffControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/add', adminAuth, addStaff)
router.get('/list', adminAuth, listStaff)
router.get('/:id', adminAuth, getStaffById)
router.put('/update/:id', adminAuth, updateStaff)
router.delete('/delete/:id', adminAuth, deleteStaff)

export default router
