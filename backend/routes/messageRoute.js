import express from 'express'
import {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage
} from '../controllers/messageControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const messageRouter = express.Router()

messageRouter.post('/add', adminAuth, createMessage)
messageRouter.get('/list', adminAuth, getAllMessages)
messageRouter.get('/:id', adminAuth, getMessageById)
messageRouter.put('/update/:id', adminAuth, updateMessage)
messageRouter.delete('/delete/:id', adminAuth, deleteMessage)

export default messageRouter
