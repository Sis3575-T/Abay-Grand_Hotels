import React, { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { backendUrl } from '../App'
import { RoomContext } from '../context/RoomContext'
import { FaWifi, FaTv, FaUtensils, FaSwimmingPool, FaConciergeBell } from 'react-icons/fa'

const PAYMENT_METHODS = [
  { id: 'pay_at_hotel', name: 'Pay at Hotel', description: 'Pay when you arrive' },
  { id: 'Chapa', name: 'Pay with Chapa', description: 'Pay online via Chapa (Telebirr, CBE Birr, Visa, etc.)' },
]

const HotelDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRoomById, rooms } = useContext(RoomContext)

  // Immediately resolve cached room to eliminate loading time
  const initialRoom = useMemo(() => getRoomById(id), [id, getRoomById])
  const [room, setRoom] = useState(initialRoom)
  const [loading, setLoading] = useState(!initialRoom)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [availability, setAvailability] = useState({ checking: false, available: true, message: '' })
  const availabilityTimer = useRef(null)
  const [paymentMethod, setPaymentMethod] = useState('pay_at_hotel')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkin: '',
    checkout: '',
    guests: 1,
    roomName: initialRoom?.name || '',
    roomId: initialRoom?._id || id || '',
  })

  // Synchronize when context loads or initial room is resolved
  useEffect(() => {
    if (!room && initialRoom) {
      setRoom(initialRoom)
      setLoading(false)
      setFormData(prev => ({
        ...prev,
        roomName: initialRoom.name,
        roomId: initialRoom._id,
        guests: prev.guests > (initialRoom.capacity || 10) ? 1 : prev.guests,
      }))
    }
  }, [initialRoom, room])

  // Fetch or refresh room details (runs silently in background if room is already cached)
  useEffect(() => {
    let cancelled = false
    const fetchRoomDetails = async () => {
      // If we don't have room from context, show loader; otherwise load in background
      if (!room && !initialRoom) {
        setLoading(true)
      }
      try {
        const response = await axios.get(`${backendUrl}/api/hotel/rooms/${id}`, { timeout: 8000 })
        if (cancelled) return
        const fetched = response.data?.hotel || response.data
        if (fetched && (fetched._id || fetched.name)) {
          setRoom(fetched)
          setFormData(prev => ({
            ...prev,
            roomName: fetched.name || prev.roomName,
            roomId: fetched._id || prev.roomId,
            guests: prev.guests > (fetched.capacity || 10) ? 1 : prev.guests,
          }))
        }
      } catch (error) {
        if (cancelled) return
        console.log('Error fetching room details:', error?.message || error)
        if (!room && !initialRoom) {
          setNotification({ type: 'error', message: 'Failed to load room details. Please try again.' })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchRoomDetails()
    return () => { cancelled = true }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormErrors(prev => ({ ...prev, [name]: '' }))
    if (name === 'checkin' || name === 'checkout') {
      if (availabilityTimer.current) clearTimeout(availabilityTimer.current)
      setAvailability(prev => ({ ...prev, checking: true, message: '' }))
    }
  }

  // Real-time debounce check for date availability
  useEffect(() => {
    const { checkin, checkout, roomId } = formData
    if (!checkin || !checkout || !roomId) return
    if (availabilityTimer.current) clearTimeout(availabilityTimer.current)
    availabilityTimer.current = setTimeout(async () => {
      try {
        const r = await axios.get(`${backendUrl}/api/reservation/check-availability`, {
          params: { roomId, checkin, checkout },
          timeout: 5000,
        })
        if (r.data?.success) {
          setAvailability({
            checking: false,
            available: r.data.available,
            message: r.data.available ? '' : 'This room is not available for the selected dates.',
          })
        }
      } catch {
        setAvailability({ checking: false, available: true, message: '' })
      }
    }, 400)
    return () => { if (availabilityTimer.current) clearTimeout(availabilityTimer.current) }
  }, [formData.checkin, formData.checkout, formData.roomId])

  const bookingPrice = useMemo(() => {
    if (!room?.price || !formData.checkin || !formData.checkout || formData.checkout <= formData.checkin) {
      return null
    }
    const start = new Date(`${formData.checkin}T00:00:00`)
    const end = new Date(`${formData.checkout}T00:00:00`)
    const nights = Math.round((end - start) / (1000 * 60 * 60 * 24))
    if (nights <= 0) return null
    return {
      pricePerNight: room.price,
      nights,
      totalAmount: nights * room.price,
    }
  }, [room?.price, formData.checkin, formData.checkout])

  const formatPrice = (amount) => `$${Number(amount).toLocaleString()}`

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (!formData.phone.trim()) errors.phone = 'Phone is required'
    if (!formData.checkin) errors.checkin = 'Check-in date is required'
    if (!formData.checkout) errors.checkout = 'Check-out date is required'
    if (formData.checkin && formData.checkout && formData.checkout <= formData.checkin) {
      errors.checkout = 'Check-out must be after check-in'
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkinDate = new Date(formData.checkin + 'T00:00:00')
    checkinDate.setHours(0, 0, 0, 0)
    if (formData.checkin && checkinDate < today) {
      errors.checkin = 'Check-in cannot be in the past'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Quick fallback handler to confirm with Pay at Hotel if Chapa gateway fails
  const handlePayAtHotelFallback = async () => {
    setPaymentMethod('pay_at_hotel')
    setSubmitting(true)
    setNotification(null)
    try {
      const response = await axios.post(`${backendUrl}/api/reservation/create`, {
        ...formData,
        paymentMethod: 'pay_at_hotel',
      })
      if (response.data?.success) {
        setNotification({
          type: 'success',
          message: 'Reservation booked successfully! You can pay at the hotel upon arrival.',
        })
        setFormData(prev => ({
          ...prev, name: '', email: '', phone: '', checkin: '', checkout: '', guests: 1,
        }))
      } else {
        setNotification({ type: 'error', message: response.data.message || 'Failed to create reservation' })
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error creating reservation'
      setNotification({ type: 'error', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (formData.checkout <= formData.checkin) {
      setNotification({ type: 'error', message: 'Check-out must be after check-in' })
      return
    }

    try {
      setSubmitting(true)
      setNotification(null)

      if (paymentMethod === 'Chapa') {
        const response = await axios.post(`${backendUrl}/api/reservation/book-with-chapa`, {
          ...formData,
          paymentMethod: 'Chapa',
          channels: [],
          frontendUrl: window.location.origin,
        })

        if (response.data?.success && response.data?.checkout_url) {
          sessionStorage.setItem('chapa_tx_ref', response.data.tx_ref || '')
          sessionStorage.setItem('chapa_booking_id', response.data.bookingId || '')
          sessionStorage.setItem('chapa_redirect_time', Date.now().toString())
          window.location.href = response.data.checkout_url
          return
        }

        if (response.data?.success && response.data?.paymentType === 'direct_charge') {
          sessionStorage.setItem('chapa_tx_ref', response.data.tx_ref || '')
          sessionStorage.setItem('chapa_booking_id', response.data.bookingId || '')
          setNotification({ type: 'info', message: response.data.message || 'Check your phone to complete payment.' })
          setFormData(prev => ({
            ...prev, name: '', email: '', phone: '', checkin: '', checkout: '', guests: 1
          }))
          return
        }

        setNotification({
          type: 'error',
          message: response.data?.message || 'Payment initialization failed. Please try again or pay at hotel.',
          allowPayAtHotel: true,
        })
        return
      }

      // Standard reservation (Pay at Hotel)
      const response = await axios.post(`${backendUrl}/api/reservation/create`, formData)
      if (response.data?.success) {
        setNotification({ type: 'success', message: 'Reservation booked successfully! You can pay at the hotel.' })
        setAvailability({ checking: false, available: true, message: '' })
        setFormData(prev => ({
          ...prev,
          name: '',
          email: '',
          phone: '',
          checkin: '',
          checkout: '',
          guests: 1
        }))
      } else {
        setNotification({ type: 'error', message: response.data.message || 'Failed to create reservation' })
      }
    } catch (error) {
      console.error('Booking error:', error)
      const errData = error.response?.data
      const rawMsg = errData?.message || error.message || 'Error occurred while booking. Please try again.'

      // Friendly interpretation of Chapa API key / account active error
      const isChapaError = paymentMethod === 'Chapa' && (
        rawMsg.toLowerCase().includes('api key') ||
        rawMsg.toLowerCase().includes('account is active') ||
        rawMsg.toLowerCase().includes('chapa') ||
        error.response?.status === 401 ||
        error.response?.status === 502
      )

      if (isChapaError) {
        setNotification({
          type: 'error',
          message: 'Chapa online payment is temporarily unavailable. You can easily complete your booking now with "Pay at Hotel".',
          allowPayAtHotel: true,
        })
      } else {
        setNotification({ type: 'error', message: rawMsg, allowPayAtHotel: paymentMethod === 'Chapa' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Fast skeleton view when room data is still downloading
  if (loading && !room) {
    return (
      <div className="mx-auto max-w-7xl p-6 animate-pulse">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-40 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <p className="text-xl text-red-500 font-medium">Room not found.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-lime-600 text-white px-5 py-2 rounded font-medium hover:bg-lime-700 transition-colors"
        >
          Browse All Rooms
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {notification && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm font-medium border ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : notification.type === 'info'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p>{notification.message}</p>
              {notification.allowPayAtHotel && (
                <button
                  type="button"
                  onClick={handlePayAtHotelFallback}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 bg-lime-600 text-white text-xs font-semibold px-3 py-2 rounded shadow hover:bg-lime-700 transition-colors"
                >
                  {submitting ? 'Confirming...' : 'Switch to Pay at Hotel & Confirm Instantly'}
                </button>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-700 font-bold ml-4 text-base"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Image + description (spans 2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{room.name}</h2>
            <p className="text-2xl font-bold text-lime-600 mt-1">${room.price} <span className="text-sm font-normal text-gray-500">/ night</span></p>
            <p className="text-sm text-gray-500 mt-1">
              {room.occupancy || (room.capacity ? `1-${room.capacity} persons` : '1-2 persons')} &middot; {room.roomType || 'Standard'}
            </p>
          </div>

          <img
            src={room.image}
            alt={room.name}
            className="w-full h-[400px] object-cover rounded-xl shadow-md"
            onError={(e) => { e.target.style.display = 'none' }}
          />

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Amenities & Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-700">
              <div className="flex items-center gap-2.5"><FaWifi className="text-lime-600" /> Free High-Speed Wi-Fi</div>
              <div className="flex items-center gap-2.5"><FaTv className="text-lime-600" /> Smart Cable TV</div>
              <div className="flex items-center gap-2.5"><FaUtensils className="text-lime-600" /> In-Room Dining</div>
              <div className="flex items-center gap-2.5"><FaSwimmingPool className="text-lime-600" /> Swimming Pool Access</div>
              <div className="flex items-center gap-2.5"><FaConciergeBell className="text-lime-600" /> 24/7 Room Service</div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Room Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {room.description || 'A luxurious room designed for your utmost comfort and relaxation with scenic views and premium bedding.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Booking form */}
        <aside className="p-6 rounded-xl shadow-sm border border-gray-200 bg-white h-fit sticky top-28">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Reserve This Room</h2>
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <input
                className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none"
                type="text"
                name="name"
                placeholder="Sisay Temesgen"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
              <input
                className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none"
                type="email"
                name="email"
                placeholder="guest@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
              <input
                className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none"
                type="tel"
                name="phone"
                placeholder="+251 91 234 5678"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Check-In</label>
                <input
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none"
                  type="date"
                  name="checkin"
                  value={formData.checkin}
                  onChange={handleChange}
                  required
                />
                {formErrors.checkin && <p className="text-xs text-red-600 mt-1">{formErrors.checkin}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Check-Out</label>
                <input
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none"
                  type="date"
                  name="checkout"
                  value={formData.checkout}
                  onChange={handleChange}
                  required
                />
                {formErrors.checkout && <p className="text-xs text-red-600 mt-1">{formErrors.checkout}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Number of Guests</label>
              <select
                className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none bg-white"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
              >
                {[...Array(room.capacity || 10).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Payment Method</label>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'border-lime-500 bg-lime-50/70 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-lime-600 mt-1"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{pm.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{pm.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {availability.checking && (
              <p className="text-xs text-blue-600 text-center font-medium">Checking availability...</p>
            )}
            {!availability.checking && !availability.available && (
              <p className="text-xs text-red-600 text-center font-medium">{availability.message}</p>
            )}

            {bookingPrice && (
              <div className="p-3.5 border rounded-lg bg-gray-50 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Price per night</span>
                  <span className="font-semibold text-gray-800">{formatPrice(bookingPrice.pricePerNight)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-gray-800">{bookingPrice.nights} night{bookingPrice.nights > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold text-sm">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-lime-600">{formatPrice(bookingPrice.totalAmount)}</span>
                </div>
              </div>
            )}

            <button
              className="w-full bg-lime-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-lime-700 transition-colors duration-200 disabled:opacity-50 shadow-sm"
              type="submit"
              disabled={submitting || (!availability.checking && !availability.available)}
            >
              {submitting
                ? 'Processing Booking...'
                : !availability.available && !availability.checking
                ? 'Selected Dates Unavailable'
                : paymentMethod === 'Chapa'
                ? 'Pay & Book with Chapa'
                : 'Confirm Reservation'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  )
}

export default HotelDetails
