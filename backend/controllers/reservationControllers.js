import reservationModels from '../models/reservationModels.js'

const createReservation = async (req, res) => {
  try {
    const { name, email, phone, checkin, checkout, guests, roomName, roomId } = req.body
    if (!name || !email || !phone || !checkin || !checkout || !guests || !roomName || !roomId) {
      return res.json({ message: 'All fields are required' })
    }
    const newReservation = new reservationModels({ name, email, phone, checkin, checkout, guests, roomName, roomId })
    await newReservation.save()
    res.json({ message: 'reservation created successfully', reservation: newReservation })
  } catch (error) {
    console.log(error)
    res.json({ message: 'error creating reservation' })
  }
}

const getAllReservation = async (req, res) => {
  try {
    const reservations = await reservationModels.find()
    res.json(reservations)
  } catch (error) {
    console.log(error)
    res.json({ message: 'error fetching reservation' })
  }
}

const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params
    await reservationModels.findByIdAndDelete(id)
    res.json({ message: 'reservation deleted successfully' })
  } catch (error) {
    console.log(error)
    res.json({ message: 'error deleting reservation' })
  }
}

export { createReservation, getAllReservation, deleteReservation }