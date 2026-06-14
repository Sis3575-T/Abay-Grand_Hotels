import express from 'express'
import {
  createRevenue,
  getAllRevenues,
  getRevenueById,
  updateRevenue,
  deleteRevenue
} from '../controllers/revenueControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const revenueRouter = express.Router()

revenueRouter.post('/add', adminAuth, createRevenue)
revenueRouter.get('/list', adminAuth, getAllRevenues)
revenueRouter.get('/:id', adminAuth, getRevenueById)
revenueRouter.put('/update/:id', adminAuth, updateRevenue)
revenueRouter.delete('/delete/:id', adminAuth, deleteRevenue)

export default revenueRouter
