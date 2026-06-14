import React, { useState, useRef, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  MdNotifications, MdDarkMode, MdLightMode, MdSearch,
  MdCheckCircle, MdCancel, MdMeetingRoom, MdLogout, MdMessage, MdStar, MdAddCircle
} from 'react-icons/md'
import { useTheme, useSettings, backendUrl } from '../App'

const getAuthHeaders = () => {
  const t = localStorage.getItem('adminToken')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

const typeIcons = {
  reservation_created: { icon: MdAddCircle, color: '#3B82F6' },
  reservation_approved: { icon: MdCheckCircle, color: '#16A34A' },
  reservation_rejected: { icon: MdCancel, color: '#DC2626' },
  reservation_cancelled: { icon: MdCancel, color: '#DC2626' },
  guest_checked_in: { icon: MdMeetingRoom, color: '#2563EB' },
  guest_checked_out: { icon: MdLogout, color: '#6B7280' },
  new_message: { icon: MdMessage, color: '#D97706' },
  new_review: { icon: MdStar, color: '#D4AF37' },
}

const timeAgo = (ts) => {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const Topbar = ({ setToken }) => {
  const { darkMode, setDarkMode, sidebarCollapsed } = useTheme()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifLoading, setNotifLoading] = useState(true)
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const r = await axios.get(backendUrl + '/api/notification/list?limit=10', { headers: getAuthHeaders() })
      if (r.data?.success) {
        setNotifications(r.data.notifications || [])
        setUnreadCount(r.data.unreadCount || 0)
      }
    } catch {} finally {
      setNotifLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleMarkAllRead = async () => {
    try {
      await axios.put(backendUrl + '/api/notification/read-all', {}, { headers: getAuthHeaders() })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const handleMarkRead = async (id) => {
    try {
      await axios.put(backendUrl + '/api/notification/read/' + id, {}, { headers: getAuthHeaders() })
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header
      className="fixed top-0 z-30 flex items-center justify-between px-4 md:px-6"
      style={{
        left: sidebarCollapsed ? 72 : 260,
        right: 0,
        height: 72,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        transition: 'left 0.3s ease',
      }}
    >
      <div className="relative hidden md:flex items-center flex-1 max-w-md">
        <MdSearch size={18} className="absolute left-3" style={{ color: '#94A3B8' }} />
        <input
          type="text"
          placeholder="Search reservations, guests, rooms..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              navigate('/reservation')
              setSearchQuery('')
            }
          }}
          className="pl-11 pr-4 py-2 rounded text-sm w-full outline-none"
          style={{
            border: '1.5px solid #E5E7EB',
            background: '#F8FAFC',
            color: '#1E293B',
          }}
        />
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded flex items-center justify-center transition-all hover:opacity-80"
          style={{ background: '#F8FAFC', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          title="Toggle dark mode"
        >
          {darkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); if (!showNotif) fetchNotifications() }}
            className="w-9 h-9 rounded flex items-center justify-center relative transition-all hover:opacity-80"
            style={{ background: '#F8FAFC', border: '1.5px solid #E5E7EB', color: '#6B7280' }}
          >
            <MdNotifications size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ background: '#DC2626' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 shadow-2xl border overflow-hidden z-50 fade-in-up"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
                <span className="font-semibold text-sm" style={{ color: '#1E293B' }}>Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}
                      className="text-xs font-medium hover:underline" style={{ color: '#3B82F6' }}>
                      Mark all read
                    </button>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded font-bold"
                    style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>
                    {unreadCount} new
                  </span>
                </div>
              </div>
              {notifLoading && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm" style={{ color: '#94A3B8' }}>Loading...</p>
                </div>
              )}
              {!notifLoading && notifications.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <MdNotifications size={24} className="mx-auto mb-2" style={{ color: '#D1D5DB' }} />
                  <p className="text-sm" style={{ color: '#94A3B8' }}>No notifications yet</p>
                </div>
              )}
              {!notifLoading && notifications.map(n => {
                const t = typeIcons[n.type] || { icon: MdNotifications, color: '#6B7280' }
                const Icon = t.icon
                return (
                  <div key={n._id}
                    onClick={() => { if (!n.read) handleMarkRead(n._id) }}
                    className="flex items-start gap-3 px-4 py-3 border-b transition-all cursor-pointer"
                    style={{
                      borderColor: '#E5E7EB',
                      background: n.read ? 'transparent' : 'rgba(59,130,246,0.04)',
                    }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: n.read ? '#F3F4F6' : `${t.color}18` }}>
                      <Icon size={14} style={{ color: n.read ? '#9CA3AF' : t.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-tight" style={{ color: '#1E293B', fontWeight: n.read ? 400 : 500 }}>
                        {n.message}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: '#3B82F6' }} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false) }}
            className="flex items-center gap-2 px-3 py-1.5 rounded transition-all hover:opacity-80"
            style={{ background: '#F8FAFC', border: '1.5px solid #E5E7EB' }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#3B82F6', color: '#fff' }}>
              A
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold leading-none" style={{ color: '#1E293B' }}>Admin</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>Super Admin</p>
            </div>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-48 shadow-2xl border overflow-hidden z-50 fade-in-up"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{settings?.hotelName || 'Abay Grand Hotel'}</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{settings?.email || 'admin@abaygrnd.com'}</p>
              </div>
              {[
                { label: 'My Profile', onClick: () => {} },
                { label: 'Account Settings', onClick: () => { setShowProfile(false); navigate('/settings') } },
                { label: 'Help & Support', onClick: () => {} },
              ].map(item => (
                <button key={item.label} onClick={item.onClick}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all hover:opacity-80"
                  style={{ color: '#1E293B' }}>
                  {item.label}
                </button>
              ))}
              <div className="border-t" style={{ borderColor: '#E5E7EB' }}>
                <button
                  onClick={() => { setToken(''); navigate('/') }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-all" style={{ color: '#DC2626' }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar
