import express from 'express'
import { createBackup, listBackups, getBackup, downloadBackup, restoreBackup, deleteBackup } from '../controllers/backupControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/create', adminAuth, createBackup)
router.get('/list', adminAuth, listBackups)
router.get('/:id', adminAuth, getBackup)
router.get('/download/:id', adminAuth, downloadBackup)
router.post('/restore/:id', adminAuth, restoreBackup)
router.delete('/delete/:id', adminAuth, deleteBackup)

export default router
