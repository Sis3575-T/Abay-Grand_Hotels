import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdHotel, MdEventNote, MdPeople, MdAttachMoney,
  MdStar, MdMessage, MdSettings, MdLogout, MdMenu, MdClose,
  MdChevronLeft, MdHistory
} from 'react-icons/md'
import { useTheme, useSettings } from '../App'

const navItems = [
  { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/rooms',     icon: MdHotel,     label: 'Room Management' },
  { to: '/reservation', icon: MdEventNote, label: 'Reservations' },
  { to: '/guests',    icon: MdPeople,    label: 'Guests' },
  { to: '/revenue',   icon: MdAttachMoney, label: 'Revenue' },
  { to: '/reviews',   icon: MdStar,      label: 'Reviews' },
  { to: '/messages',  icon: MdMessage,   label: 'Messages' },
  { to: '/activity',  icon: MdHistory,   label: 'Activity Log' },
  { to: '/settings',  icon: MdSettings,  label: 'Settings' },
]

const Sidebar = ({ setToken }) => {
  const { sidebarCollapsed, setSidebarCollapsed } = useTheme()
  const { settings } = useSettings()
  const [collapsed, setCollapsed] = useState(sidebarCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const hotelName = settings?.hotelName || 'Abay Grand Hotel'
  const shortName = hotelName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AG'
  const firstLine = hotelName.split(' ').slice(0, 2).join(' ') || hotelName
  const secondLine = hotelName.split(' ').slice(2).join(' ') || 'Hotel'

  useEffect(() => { setSidebarCollapsed(collapsed) }, [collapsed, setSidebarCollapsed])

  const handleLogout = () => { setToken(''); navigate('/') }

  return (
    <>
      <button
        className="fixed top-4 left-4 z-[10001] md:hidden p-2 rounded"
        style={{ background: '#1E293B' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <MdClose size={22} color="#fff" /> : <MdMenu size={22} color="#fff" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[10000] md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ background: '#0F172A', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Logo section */}
        <div className="flex items-center justify-between px-5 py-5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)', minHeight: 80 }}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded flex items-center justify-center font-bold text-lg"
                style={{ background: '#D4AF37', color: '#0F172A' }}>
                {shortName}
              </div>
              <div>
                <p className="font-bold text-sm leading-none" style={{ color: '#D4AF37' }}>{firstLine}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{secondLine}</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded flex items-center justify-center font-bold mx-auto"
              style={{ background: '#D4AF37', color: '#0F172A' }}>
              {shortName}
            </div>
          )}
          <button
            className="hidden md:flex items-center justify-center w-7 h-7 rounded transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
            onClick={() => setCollapsed(!collapsed)}
          >
            <MdChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5" style={{ scrollbarGutter: 'stable' }}>
          <div className="flex flex-col" style={{ gap: '2px' }}>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-lg transition-all duration-200"
                style={{ padding: collapsed ? '12px 0' : '12px 12px' }}
              >
                {({ isActive }) => (
                  <div
                    className="flex items-center w-full rounded-lg transition-all duration-200"
                    style={{
                      background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                      border: isActive ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
                      padding: collapsed ? '10px 0' : '10px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    <Icon
                      size={22}
                      style={{
                        color: isActive ? '#60A5FA' : 'rgba(255,255,255,0.55)',
                        flexShrink: 0,
                        transition: 'color 0.2s',
                      }}
                    />
                    {!collapsed && (
                      <span
                        className="text-sm font-medium ml-3"
                        style={{
                          color: isActive ? '#60A5FA' : 'rgba(255,255,255,0.75)',
                          transition: 'color 0.2s',
                        }}
                      >
                        {label}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center w-full rounded-lg transition-all duration-200 hover:bg-red-900/15"
            style={{ padding: collapsed ? '12px 0' : '12px 12px', justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <MdLogout size={22} style={{ color: 'rgba(255,100,100,0.7)', flexShrink: 0 }} />
            {!collapsed && (
              <span className="text-sm font-medium ml-3" style={{ color: 'rgba(255,100,100,0.7)' }}>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
