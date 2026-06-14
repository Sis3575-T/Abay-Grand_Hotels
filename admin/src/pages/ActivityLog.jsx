import React, { useEffect, useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import {
  MdSearch, MdRefresh, MdDelete, MdHistory,
  MdPerson, MdEvent, MdCheck, MdClose, MdEdit,
  MdLogin, MdLogout, MdAttachMoney
} from 'react-icons/md'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import notify from '../components/ui/Toast'

const ACTION_ICONS = {
  'Reservation Created': { icon: MdEvent, color: '#2563EB', bg: '#EFF6FF' },
  'Reservation Updated': { icon: MdEdit, color: '#D97706', bg: '#FEF3C7' },
  'Reservation Approved': { icon: MdCheck, color: '#16A34A', bg: '#F0FDF4' },
  'Reservation Rejected': { icon: MdClose, color: '#DC2626', bg: '#FEF2F2' },
  'Guest Checked In': { icon: MdLogin, color: '#2563EB', bg: '#DBEAFE' },
  'Guest Checked Out': { icon: MdLogout, color: '#6B7280', bg: '#F3F4F6' },
  'Reservation Cancelled': { icon: MdClose, color: '#DC2626', bg: '#FEE2E2' },
  'Payment Received': { icon: MdAttachMoney, color: '#16A34A', bg: '#F0FDF4' },
}

const ACTION_LIST = Object.keys(ACTION_ICONS)

const formatDate = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  if (isNaN(d.getTime())) return String(ts)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const PAGE_SIZE = 15

const ActivityLog = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('All')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await axios.get(backendUrl + '/api/activity/list', { headers: getAuthHeaders() })
      setActivities(r.data?.activities || [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load activity log'
      setError(msg)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchActivities() }, [fetchActivities])

  const filtered = useMemo(() => {
    let result = activities
    if (filterAction !== 'All') {
      result = result.filter(a => a.action === filterAction)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a =>
        (a.userName || '').toLowerCase().includes(q) ||
        (a.action || '').toLowerCase().includes(q) ||
        (a.guestName || '').toLowerCase().includes(q) ||
        (a.details || '').toLowerCase().includes(q) ||
        (a.userRole || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [activities, search, filterAction])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const deleteActivity = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const r = await axios.delete(backendUrl + `/api/activity/delete/${deleteTarget._id}`, { headers: getAuthHeaders() })
      if (r.data?.success) {
        notify.success('Activity deleted')
      }
      setDeleteTarget(null)
      await fetchActivities()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Delete failed'
      notify.error(msg)
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="fade-in-up" style={{ marginBottom: '32px' }}>
      <div className="flex flex-wrap items-start justify-between" style={{ gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B', fontFamily: "'Playfair Display', serif" }}>Activity Log</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{activities.length} total activities recorded</p>
        </div>
        <Button variant="outline" size="sm" icon={MdRefresh} onClick={fetchActivities}>Refresh</Button>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center" style={{ gap: '16px', marginBottom: '24px' }}>
        <div className="relative flex-1 min-w-[200px]">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search by user, action, guest..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <div className="flex flex-wrap p-1 rounded" style={{ gap: '4px', background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
          <button
            onClick={() => { setFilterAction('All'); setPage(1) }}
            className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
            style={{
              background: filterAction === 'All' ? '#2563EB' : 'transparent',
              color: filterAction === 'All' ? '#fff' : '#6B7280',
            }}
          >
            All
          </button>
          {ACTION_LIST.map(action => (
            <button
              key={action}
              onClick={() => { setFilterAction(action); setPage(1) }}
              className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
              style={{
                background: filterAction === action ? '#2563EB' : 'transparent',
                color: filterAction === action ? '#fff' : '#6B7280',
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="overflow-hidden" style={{ border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0', color: '#94A3B8' }}>
            <svg className="animate-spin" fill="none" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', marginBottom: '12px' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm font-medium">Loading activity log...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0' }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#DC2626' }}>{error}</p>
            <Button variant="primary" size="sm" icon={MdRefresh} onClick={fetchActivities}>Retry</Button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center" style={{ padding: '80px 0', color: '#94A3B8' }}>
            <MdHistory size={40} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
            <p className="text-base font-medium">No activities found</p>
            <p className="text-sm mt-1">{search || filterAction !== 'All' ? 'Try a different search or filter' : 'No activity recorded yet. Actions on reservations will appear here.'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Action</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>User</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Guest</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Details</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Date &amp; Time</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(a => {
                    const actionStyle = ACTION_ICONS[a.action] || { icon: MdHistory, color: '#6B7280', bg: '#F3F4F6' }
                    const Icon = actionStyle.icon
                    return (
                      <tr key={a._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: actionStyle.bg }}>
                              <Icon size={15} style={{ color: actionStyle.color }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: '#1E293B' }}>{a.action}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <MdPerson size={14} style={{ color: '#94A3B8' }} />
                            <div>
                              <p className="text-xs font-medium" style={{ color: '#1E293B' }}>{a.userName || 'Unknown'}</p>
                              <p className="text-[10px]" style={{ color: '#94A3B8' }}>{a.userRole}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="text-xs" style={{ color: '#6B7280' }}>{a.guestName || '—'}</span></td>
                        <td>
                          <p className="text-xs truncate" style={{ color: '#6B7280', maxWidth: '220px' }}>{a.details || '—'}</p>
                        </td>
                        <td><span className="text-xs whitespace-nowrap" style={{ color: '#6B7280' }}>{formatDate(a.createdAt)}</span></td>
                        <td>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(a) }}
                            className="w-9 h-9 rounded flex items-center justify-center transition-all hover:opacity-80"
                            style={{ background: '#FEF2F2', color: '#DC2626' }}
                            title="Delete"
                          >
                            <MdDelete size={18} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{filtered.length} results</p>
                <div className="flex items-center" style={{ gap: '6px' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded flex items-center justify-center disabled:opacity-40 transition-all text-sm"
                    style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}
                  >
                    &lsaquo;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className="w-8 h-8 rounded text-xs font-medium transition-all"
                      style={{
                        background: page === i + 1 ? '#2563EB' : '#FFFFFF',
                        color: page === i + 1 ? '#fff' : '#6B7280',
                        border: `1px solid ${page === i + 1 ? '#2563EB' : '#E5E7EB'}`,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded flex items-center justify-center disabled:opacity-40 transition-all text-sm"
                    style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}
                  >
                    &rsaquo;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteActivity}
        title="Delete Activity"
        message={`Delete this activity log entry? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  )
}

export default ActivityLog
