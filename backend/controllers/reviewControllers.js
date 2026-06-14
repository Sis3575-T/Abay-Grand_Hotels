import Review from '../models/reviewModels.js'
import { createNotification } from './notificationControllers.js'

const createReview = async (req, res) => {
  try {
    const { guestName, roomName, rating, date, comment, status } = req.body

    if (!guestName || !rating || !date) {
      return res.status(400).json({ success: false, message: 'Guest name, rating, and date are required' })
    }

    const numRating = Number(rating)
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' })
    }

    const review = new Review({
      guestName,
      roomName: roomName || '',
      rating: numRating,
      date,
      comment: comment || '',
      status: status || 'Pending',
    })

    await review.save()
    createNotification({
      type: 'new_review',
      message: `New ${numRating}-star review from ${guestName}`,
      relatedId: review._id.toString(),
      relatedModel: 'Review',
    })
    res.json({ success: true, message: 'Review created successfully', review })
  } catch (error) {
    console.error('createReview error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error creating review' })
  }
}

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 })
    res.json({ success: true, reviews })
  } catch (error) {
    console.error('getAllReviews error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching reviews' })
  }
}

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params
    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }
    res.json({ success: true, review })
  } catch (error) {
    console.error('getReviewById error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching review' })
  }
}

const updateReview = async (req, res) => {
  try {
    const { id } = req.params
    const { guestName, roomName, rating, date, comment, status } = req.body

    if (!guestName || !rating || !date) {
      return res.status(400).json({ success: false, message: 'Guest name, rating, and date are required' })
    }

    const numRating = Number(rating)
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' })
    }

    const updateData = {
      guestName,
      roomName: roomName || '',
      rating: numRating,
      date,
      comment: comment || '',
      status: status || 'Pending',
    }

    const updated = await Review.findByIdAndUpdate(id, updateData, { new: true })
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }

    res.json({ success: true, message: 'Review updated successfully', review: updated })
  } catch (error) {
    console.error('updateReview error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating review' })
  }
}

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Review.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found' })
    }
    res.json({ success: true, message: 'Review deleted successfully' })
  } catch (error) {
    console.error('deleteReview error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting review' })
  }
}

export { createReview, getAllReviews, getReviewById, updateReview, deleteReview }
