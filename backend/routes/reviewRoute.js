import express from 'express'
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview
} from '../controllers/reviewControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const reviewRouter = express.Router()

reviewRouter.post('/add', adminAuth, createReview)
reviewRouter.get('/list', adminAuth, getAllReviews)
reviewRouter.get('/:id', adminAuth, getReviewById)
reviewRouter.put('/update/:id', adminAuth, updateReview)
reviewRouter.delete('/delete/:id', adminAuth, deleteReview)

export default reviewRouter
