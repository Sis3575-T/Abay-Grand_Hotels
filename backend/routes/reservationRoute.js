import express from 'express'
import {
  createReservation, getAllReservation, getMyReservations,
  approveReservation, rejectReservation, checkinReservation,
  checkoutReservation, cancelReservation, clientCancelReservation,
  updateReservation, deleteReservation,
} from '../controllers/reservationControllers.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

router.post('/create', createReservation)
router.get('/get', getAllReservation)
router.get('/my-reservations/:email', getMyReservations)
router.put('/approve/:id', adminAuth, approveReservation)
router.put('/reject/:id', adminAuth, rejectReservation)
router.put('/checkin/:id', adminAuth, checkinReservation)
router.put('/checkout/:id', adminAuth, checkoutReservation)
router.put('/cancel/:id', adminAuth, cancelReservation)
router.put('/client-cancel/:id', clientCancelReservation)
router.put('/update/:id', adminAuth, updateReservation)
router.delete('/delete/:id', adminAuth, deleteReservation)

export default router
