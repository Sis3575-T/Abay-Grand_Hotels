import express from 'express'
import { getSettings, updateSettings } from '../controllers/settingsControllers.js'
import adminAuth from '../middleware/adminAuth.js'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })
const settingsRouter = express.Router()

settingsRouter.get('/', adminAuth, getSettings)
settingsRouter.put('/update', adminAuth, upload.single('logo'), updateSettings)

export default settingsRouter
