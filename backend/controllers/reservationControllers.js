import Reservation from '../models/reservationModels.js'
import { logActivity } from './activityControllers.js'
import { createNotification } from './notificationControllers.js'

const getAdminInfo = (req) => {
  if (req.admin) {
    return {
      userId: req.admin.userId || '',
      name: req.admin.name || 'Administrator',
      role: req.admin.role || 'Admin',
      actionDate: new Date(),
    }
  }
  return null
}

const getClientInfo = (body) => {
  return {
    userId: body.email || '',
    name: body.name || '',
    role: 'Client',
    actionDate: new Date(),
  }
}

const createReservation = async (req, res) => {
  try {
    const { name, email, phone, checkin, checkout, guests, roomName, roomId } = req.body
    if (!name || !email || !checkin || !checkout || !guests || !roomName) {
      return res.json({ success: false, message: 'All fields are required' })
    }
    const clientInfo = getClientInfo(req.body)
    const newReservation = new Reservation({
      name, email, phone, checkin, checkout, guests, roomName, roomId,
      status: 'Pending',
      createdBy: clientInfo,
    })
    await newReservation.save()

    logActivity({
      action: 'Reservation Created',
      userId: clientInfo.userId,
      userName: clientInfo.name,
      userRole: clientInfo.role,
      reservationId: newReservation._id.toString(),
      guestName: name,
      details: `Reservation created for ${name} at ${roomName}`,
    })
    createNotification({
      type: 'reservation_created',
      message: `New reservation from ${name} for ${roomName}`,
      relatedId: newReservation._id.toString(),
      relatedModel: 'Reservation',
    })

    res.json({ success: true, message: 'reservation created successfully', reservation: newReservation })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error creating reservation' })
  }
}

const getAllReservation = async (req, res) => {
  try {
    const reservations = await Reservation.find()
    res.json(reservations)
  } catch (error) {
    console.log(error)
    res.json({ message: 'error fetching reservation' })
  }
}

const getMyReservations = async (req, res) => {
  try {
    const { email } = req.params
    if (!email) return res.json({ success: false, message: 'Email is required' })
    const reservations = await Reservation.find({ email }).sort({ createdAt: -1 })
    res.json({ success: true, reservations })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error fetching reservations' })
  }
}

const approveReservation = async (req, res) => {
  try {
    const { id } = req.params
    const existing = await Reservation.findById(id)
    if (!existing) return res.status(404).json({ success: false, message: 'Reservation not found' })
    if (existing.status !== 'Pending') {
      return res.json({ success: false, message: `Cannot approve a reservation with status "${existing.status}"` })
    }
    const adminInfo = getAdminInfo(req)
    existing.status = 'Approved'
    existing.approvedBy = adminInfo
    await existing.save()

    logActivity({
      action: 'Reservation Approved',
      userId: adminInfo.userId,
      userName: adminInfo.name,
      userRole: adminInfo.role,
      reservationId: id,
      guestName: existing.name,
      details: `Reservation for ${existing.name} approved`,
    })
    createNotification({
      type: 'reservation_approved',
      message: `${existing.name}'s reservation approved`,
      relatedId: id,
      relatedModel: 'Reservation',
    })

    res.json({ success: true, message: 'Reservation approved', reservation: existing })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error approving reservation' })
  }
}

const rejectReservation = async (req, res) => {
  try {
    const { id } = req.params
    const existing = await Reservation.findById(id)
    if (!existing) return res.status(404).json({ success: false, message: 'Reservation not found' })
    if (existing.status !== 'Pending') {
      return res.json({ success: false, message: `Cannot reject a reservation with status "${existing.status}"` })
    }
    const adminInfo = getAdminInfo(req)
    existing.status = 'Rejected'
    existing.rejectedBy = adminInfo
    await existing.save()

    logActivity({
      action: 'Reservation Rejected',
      userId: adminInfo.userId,
      userName: adminInfo.name,
      userRole: adminInfo.role,
      reservationId: id,
      guestName: existing.name,
      details: `Reservation for ${existing.name} rejected`,
    })
    createNotification({
      type: 'reservation_rejected',
      message: `${existing.name}'s reservation was rejected`,
      relatedId: id,
      relatedModel: 'Reservation',
    })

    res.json({ success: true, message: 'Reservation rejected', reservation: existing })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error rejecting reservation' })
  }
}

const checkinReservation = async (req, res) => {
  try {
    const { id } = req.params
    const existing = await Reservation.findById(id)
    if (!existing) return res.status(404).json({ success: false, message: 'Reservation not found' })
    if (existing.status !== 'Approved' && existing.status !== 'Confirmed') {
      return res.json({ success: false, message: `Cannot check in a reservation with status "${existing.status}"` })
    }
    const adminInfo = getAdminInfo(req)
    existing.status = 'Checked In'
    existing.checkedInBy = adminInfo
    await existing.save()

    logActivity({
      action: 'Guest Checked In',
      userId: adminInfo.userId,
      userName: adminInfo.name,
      userRole: adminInfo.role,
      reservationId: id,
      guestName: existing.name,
      details: `${existing.name} checked into ${existing.roomName}`,
    })
    createNotification({
      type: 'guest_checked_in',
      message: `${existing.name} checked into ${existing.roomName}`,
      relatedId: id,
      relatedModel: 'Reservation',
    })

    res.json({ success: true, message: 'Guest checked in', reservation: existing })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error checking in guest' })
  }
}

const checkoutReservation = async (req, res) => {
  try {
    const { id } = req.params
    const existing = await Reservation.findById(id)
    if (!existing) return res.status(404).json({ success: false, message: 'Reservation not found' })
    if (existing.status !== 'Checked In') {
      return res.json({ success: false, message: `Cannot check out a reservation with status "${existing.status}"` })
    }
    const adminInfo = getAdminInfo(req)
    existing.status = 'Checked Out'
    existing.checkedOutBy = adminInfo
    await existing.save()

    logActivity({
      action: 'Guest Checked Out',
      userId: adminInfo.userId,
      userName: adminInfo.name,
      userRole: adminInfo.role,
      reservationId: id,
      guestName: existing.name,
      details: `${existing.name} checked out from ${existing.roomName}`,
    })
    createNotification({
      type: 'guest_checked_out',
      message: `${existing.name} checked out from ${existing.roomName}`,
      relatedId: id,
      relatedModel: 'Reservation',
    })

    res.json({ success: true, message: 'Guest checked out', reservation: existing })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error checking out guest' })
  }
}

const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params
    const existing = await Reservation.findById(id)
    if (!existing) return res.status(404).json({ success: false, message: 'Reservation not found' })
    if (existing.status === 'Checked Out' || existing.status === 'Cancelled' || existing.status === 'Rejected') {
      return res.json({ success: false, message: `Cannot cancel a reservation with status "${existing.status}"` })
    }
    const adminInfo = getAdminInfo(req)
    existing.status = 'Cancelled'
    existing.cancelledBy = adminInfo
    await existing.save()

    logActivity({
      action: 'Reservation Cancelled',
      userId: adminInfo.userId,
      userName: adminInfo.name,
      userRole: adminInfo.role,
      reservationId: id,
      guestName: existing.name,
      details: `Reservation for ${existing.name} cancelled`,
    })
    createNotification({
      type: 'reservation_cancelled',
      message: `${existing.name}'s reservation cancelled`,
      relatedId: id,
      relatedModel: 'Reservation',
    })

    res.json({ success: true, message: 'Reservation cancelled', reservation: existing })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error cancelling reservation' })
  }
}

const clientCancelReservation = async (req, res) => {
  try {
    const { id } = req.params
    const { email } = req.body
    const existing = await Reservation.findById(id)
    if (!existing) return res.status(404).json({ success: false, message: 'Reservation not found' })
    if (existing.email !== email) {
      return res.json({ success: false, message: 'Email does not match this reservation' })
    }
    if (existing.status === 'Checked In' || existing.status === 'Checked Out' || existing.status === 'Cancelled' || existing.status === 'Rejected') {
      return res.json({ success: false, message: `Cannot cancel a reservation with status "${existing.status}"` })
    }
    const clientInfo = getClientInfo(req.body)
    existing.status = 'Cancelled'
    existing.cancelledBy = clientInfo
    await existing.save()

    logActivity({
      action: 'Reservation Cancelled',
      userId: clientInfo.userId,
      userName: clientInfo.name,
      userRole: clientInfo.role,
      reservationId: id,
      guestName: existing.name,
      details: `Reservation for ${existing.name} cancelled by client`,
    })
    createNotification({
      type: 'reservation_cancelled',
      message: `${existing.name} cancelled their reservation`,
      relatedId: id,
      relatedModel: 'Reservation',
    })

    res.json({ success: true, message: 'Reservation cancelled', reservation: existing })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error cancelling reservation' })
  }
}

const updateReservation = async (req, res) => {
  try {
    const { id } = req.params
    const existing = await Reservation.findById(id)
    if (!existing) return res.status(404).json({ success: false, message: 'Reservation not found' })
    const updateData = {}
    if (req.body.name !== undefined) updateData.name = req.body.name
    if (req.body.email !== undefined) updateData.email = req.body.email
    if (req.body.phone !== undefined) updateData.phone = req.body.phone
    if (req.body.roomName !== undefined) updateData.roomName = req.body.roomName
    if (req.body.checkin !== undefined) updateData.checkin = req.body.checkin
    if (req.body.checkout !== undefined) updateData.checkout = req.body.checkout
    if (req.body.guests !== undefined) updateData.guests = Number(req.body.guests)

    const adminInfo = getAdminInfo(req)
    if (adminInfo) {
      updateData.updatedBy = { ...adminInfo, actionDate: new Date() }
    }

    const updated = await Reservation.findByIdAndUpdate(id, updateData, { new: true })
    logActivity({
      action: 'Reservation Updated',
      userId: adminInfo?.userId || '',
      userName: adminInfo?.name || '',
      userRole: adminInfo?.role || '',
      reservationId: id,
      guestName: updated.name,
      details: `Reservation for ${updated.name} updated`,
    })
    res.json({ success: true, message: 'Reservation updated', reservation: updated })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error updating reservation' })
  }
}

const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params
    await Reservation.findByIdAndDelete(id)
    res.json({ success: true, message: 'reservation deleted successfully' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: 'error deleting reservation' })
  }
}

export {
  createReservation,
  getAllReservation,
  getMyReservations,
  approveReservation,
  rejectReservation,
  checkinReservation,
  checkoutReservation,
  cancelReservation,
  clientCancelReservation,
  updateReservation,
  deleteReservation,
}
