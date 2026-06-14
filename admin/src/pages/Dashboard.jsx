import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  MdHotel, MdCheckCircle, MdEventNote, MdAttachMoney,
  MdTrendingUp, MdTrendingDown, MdArrowUpward, MdRefresh,
  MdMeetingRoom, MdBuild, MdPeople, MdHistory
} from 'react-icons/md'
import axios from 'axios'
import { backendUrl } from '../App'
import Button from '../components/ui/Button'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 shadow border text-sm" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
        <p className="font-semibold mb-2" style={{ color: '#1E293B' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <strong>{typeof p.value === 'number' && p.value > 999 ? `$${(p.value / 1000).toFixed(0)}K` : p.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const Dashboard = () => {
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
  const [revenues, setRevenues] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [rRooms, rRes, rRev, rAct] = await Promise.all([
        axios.get(backendUrl + '/api/hotel/list').catch(() => ({ data: { hotels: [] } })),
        axios.get(backendUrl + '/api/reservation/get').catch(() => ({ data: [] })),
        axios.get(backendUrl + '/api/revenue/list', { headers: getAuthHeaders() }).catch(() => ({ data: { revenues: [] } })),
        axios.get(backendUrl + '/api/activity/list', { headers: getAuthHeaders() }).catch(() => ({ data: { activities: [] } })),
      ])
      setRooms(rRooms.data?.hotels || [])
      setReservations(Array.isArray(rRes.data) ? rRes.data : [])
      setRevenues(rRev.data?.revenues || [])
      setActivities((rAct.data?.activities || []).slice(0, 8))
    } catch {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const stats = useMemo(() => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const totalRooms = rooms.length
    const availableRooms = rooms.filter(r => r.available !== false).length
    const occupiedRooms = totalRooms - availableRooms
    const activeReservations = reservations.filter(r =>
      ['Approved', 'Confirmed', 'Pending', 'Checked In'].includes(r.status)
    ).length
    const totalRevenue = revenues.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    const todayCheckins = reservations.filter(r => r.checkin === todayStr).length
    const todayCheckouts = reservations.filter(r => r.checkout === todayStr).length
    const pendingReservations = reservations.filter(r => r.status === 'Pending').length
    const monthlyRevenue = revenues.filter(r => {
      if (!r.date) return false
      const d = new Date(r.date)
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    }).reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    const totalCustomers = [...new Set(reservations.map(r => r.email))].length
    return { totalRooms, availableRooms, occupiedRooms, activeReservations, totalRevenue, todayCheckins, todayCheckouts, pendingReservations, monthlyRevenue, totalCustomers }
  }, [rooms, reservations, revenues])

  const revenueChartData = useMemo(() => {
    const byMonth = {}
    revenues.forEach(r => {
      if (!r.date) return
      const d = new Date(r.date)
      const m = d.getMonth()
      const key = MONTHS[m]
      byMonth[key] = (byMonth[key] || 0) + (Number(r.amount) || 0)
    })
    return MONTHS.map(m => ({ month: m, revenue: byMonth[m] || 0 }))
  }, [revenues])

  const reservationChartData = useMemo(() => {
    const byMonth = {}
    reservations.forEach(r => {
      if (!r.checkin) return
      const d = new Date(r.checkin)
      const key = MONTHS[d.getMonth()]
      if (!byMonth[key]) byMonth[key] = { confirmed: 0, pending: 0, cancelled: 0 }
      if (r.status === 'Approved' || r.status === 'Confirmed' || r.status === 'Checked In' || r.status === 'Checked Out') byMonth[key].confirmed++
      else if (r.status === 'Pending') byMonth[key].pending++
      else if (r.status === 'Cancelled') byMonth[key].cancelled++
    })
    return MONTHS.map(m => ({ month: m, ...byMonth[m] || { confirmed: 0, pending: 0, cancelled: 0 } }))
  }, [reservations])

  const occupancyData = useMemo(() => {
    const total = rooms.length || 1
    const available = rooms.filter(r => r.available !== false).length
    const occupied = total - available
    const maintenance = Math.max(0, Math.round(total * 0.1))
    return [
      { name: 'Occupied', value: Math.round((occupied / total) * 100), color: '#1E293B' },
      { name: 'Available', value: Math.round((available / total) * 100), color: '#D4AF37' },
      { name: 'Maintenance', value: maintenance, color: '#94A3B8' },
    ]
  }, [rooms])

  const statCards = [
    { label: 'Total Rooms', value: stats.totalRooms, change: `${rooms.length}`, up: true, icon: MdHotel, color: '#1E293B' },
    { label: 'Available Rooms', value: stats.availableRooms, change: `${stats.occupiedRooms} occupied`, up: stats.availableRooms > rooms.length / 2, icon: MdCheckCircle, color: '#16A34A' },
    { label: 'Occupied Rooms', value: stats.occupiedRooms, change: `${Math.round((stats.occupiedRooms / (rooms.length || 1)) * 100)}%`, up: false, icon: MdMeetingRoom, color: '#DC2626' },
    { label: 'Today Check-ins', value: stats.todayCheckins, change: 'today', up: true, icon: MdEventNote, color: '#2563EB' },
    { label: 'Today Check-outs', value: stats.todayCheckouts, change: 'today', up: false, icon: MdHistory, color: '#D97706' },
    { label: 'Pending Reservations', value: stats.pendingReservations, change: 'awaiting approval', up: false, icon: MdBuild, color: '#D97706' },
    { label: 'Monthly Revenue', value: `$${stats.monthlyRevenue.toLocaleString()}`, change: 'this month', up: true, icon: MdAttachMoney, color: '#D4AF37' },
    { label: 'Total Customers', value: stats.totalCustomers, change: `${reservations.length} bookings`, up: true, icon: MdPeople, color: '#6366F1' },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ padding: '120px 0', color: '#94A3B8' }}>
        <svg className="animate-spin" fill="none" viewBox="0 0 24 24" style={{ width: '32px', height: '32px', marginBottom: '12px' }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm font-medium">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ padding: '120px 0' }}>
        <p className="text-sm font-medium mb-3" style={{ color: '#DC2626' }}>{error}</p>
        <Button variant="primary" size="sm" icon={MdRefresh} onClick={fetchData}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="fade-in-up" style={{ marginBottom: '32px' }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#1E293B', fontFamily: "'Playfair Display', serif" }}>Dashboard Overview</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Welcome back! Here's what's happening at Abay Grand Hotel today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="p-5 card-hover relative overflow-hidden"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: `${card.color}15` }}>
                  <Icon size={20} style={{ color: card.color }} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${card.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {card.up ? <MdTrendingUp size={12} /> : <MdTrendingDown size={12} />}
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>{card.value}</p>
              <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3" style={{ gap: '20px', marginBottom: '32px' }}>
        <div className="xl:col-span-2 p-5 card-hover" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold" style={{ color: '#1E293B' }}>Monthly Revenue</h3>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Real revenue data from {revenues.length} transactions</p>
            </div>
            {revenues.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                <MdArrowUpward size={12} /> {revenues.length} transactions
              </span>
            )}
          </div>
          {revenues.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: '220px', color: '#94A3B8' }}>
              <p className="text-sm">No revenue data yet. Add revenue records to see the chart.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 3 }} activeDot={{ r: 5, fill: '#2563EB' }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="p-5 card-hover" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <h3 className="font-semibold mb-1" style={{ color: '#1E293B' }}>Room Occupancy</h3>
          <p className="text-xs mb-4" style={{ color: '#94A3B8' }}>Current room status from {rooms.length} rooms</p>
          {rooms.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: '220px', color: '#94A3B8' }}>
              <p className="text-sm">No rooms data</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {occupancyData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-2">
                {occupancyData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: d.color }} />
                      <span style={{ color: '#6B7280' }}>{d.name}</span>
                    </div>
                    <span className="font-semibold" style={{ color: '#1E293B' }}>{d.value}%</span>
                  </div>
               