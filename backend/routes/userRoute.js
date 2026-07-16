import express from 'express'
import multer from 'multer'
import { adminLogin, verifyToken, getProfile, updateProfile, setupAdmin } from '../controllers/userControllers.js'
import adminAuth from '../middleware/adminAuth.js'
const upload = multer({ dest: 'uploads/' })
const userRouter = express.Router()
userRouter.post('/admin', adminLogin)
userRouter.get('/verify', adminAuth, verifyToken)
userRouter.get('/profile', adminAuth, getProfile)
userRouter.put('/profile', adminAuth, upload.single('photo'), updateProfile)
userRouter.get('/setup', setupAdmin)
export default userRouter
