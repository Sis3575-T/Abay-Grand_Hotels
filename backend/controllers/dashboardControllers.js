import Hotel from '../models/hotelModels.js'
import Reservation from '../models/reservationModels.js'
import Revenue from '../models/revenueModels.js'
import Activity from '../models/activityModels.js'

const getDashboardStats = async (req, res) => {
  try {
    const hotels = await Hotel.find()
    const reservations = await Reservation.find()
    const revenues = await Revenue.find()
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(10)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const totalRooms = hotels.length
    const availableRooms = hotels.filter(h => h.available !== false).length
    const occupiedRooms = totalRooms - availableRooms

    const todayCheckins = reservations.filter(r => r.checkin === todayStr).length
    const todayCheckouts = reservations.filter(r => r.checkout === todayStr).length
    const pendingReservations = reservations.filter(r => r.status === 'Pending').length
    const totalCustomers = [...new Set(reservations.map(r => r.email))].length

    const monthlyRevenue = revenues.reduce((sum, r) => {
      if (!r.date) return sum
      const d = new Date(r.date)
      if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
        return sum + (Number(r.amount) || 0)
      }
      return sum
    }, 0)

    const totalRevenue = revenues.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    const totalReservations = reservations.length

    res.json({
      success: true,
      stats: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        todayCheckins,
        todayCheckouts,
        pendingReservations,
        monthlyRevenue,
        totalRevenue,
        totalCustomers,
        totalReservations,
      },
      recentActivities: activities,
    })
  } catch (error) {
    console.error('getDashboardStats error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' })
  }
}

export { getDashboardStats }
