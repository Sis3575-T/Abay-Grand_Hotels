import express from 'express'
import { createRole, listRoles, updateRole, deleteRole } from '../controllers/roleControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/add', adminAuth, createRole)
router.get('/list', adminAuth, listRoles)
router.put('/update/:id', adminAuth, updateRole)
router.delete('/delete/:id', adminAuth, deleteRole)

export default router
