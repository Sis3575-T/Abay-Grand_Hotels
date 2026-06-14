import React, { useEffect, useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import {
  MdStar, MdStarBorder, MdSearch, MdAdd, MdEdit, MdDelete,
  MdVisibility, MdClose, MdCheck, MdRefresh,
  MdThumbUp, MdThumbDown, MdRateReview
} from 'react-icons/md'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import notify from '../components/ui/Toast'

const StarRating = ({ rating, size = 18 }) => (
  <div className="flex items-center" style={{ gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(s => (
      s <= rating
        ? <MdStar key={s} size={size} style={{ color: '#D4AF37' }} />
        : <MdStarBorder key={s} size={size} style={{ color: '#D1D5DB' }} />
    ))}
  </div>
)

const statusBadge = (status) => {
  const map = {
    'Approved': { bg: '#DCFCE7', color: '#16A34A' },
    'Pending':  { bg: '#FEF3C7', color: '#D97706' },
  }
  const s = map[status] || { bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span className="px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [formGuest, setFormGuest] = useState('')
  const [formRoom, setFormRoom] = useState('')
  const [formRating, setFormRating] = useState(5)
  const [formDate, setFormDate] = useState('')
  const [formComment, setFormComment] = useState('')
  const [formStatus, setFormStatus] = useState('Pending')
  const [errors, setErrors] = useState({})

  const PAGE_SIZE = 8

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await axios.get(backendUrl + '/api/review/list', { headers: getAuthHeaders() })
      setReviews(r.data?.reviews || [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load reviews'
      setError(msg)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  // Dashboard calculations
  const dashboard = useMemo(() => {
    const total = reviews.length
    const approved = reviews.filter(r => r.status === 'Approved').length
    const pending = reviews.filter(r => r.status === 'Pending').length
    const avgRating = total > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
      : '0.0'
    return { total, approved, pending, avgRating }
  }, [reviews])

  // Filter + search
  const filtered = useMemo(() => {
    let result = reviews
    if (filterStatus !== 'All') {
      result = result.filter(r => r.status === filterStatus)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        (r.guestName || '').toLowerCase().includes(q) ||
        (r.roomName || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q) ||
        (r.date || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [reviews, search, filterStatus])

  // Sorting
  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <span className="ml-1" style={{ color: '#94A3B8', opacity: 0.4 }}>&#8597;</span>
    return <span className="ml-1" style={{ color: '#2563EB' }}>{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
  }

  // CRUD
  const openAdd = () => {
    setEditItem(null)
    setFormGuest('')
    setFormRoom('')
    setFormRating(5)
    setFormDate(new Date().toISOString().split('T')[0])
    setFormComment('')
    setFormStatus('Pending')
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setFormGuest(item.guestName || '')
    setFormRoom(item.roomName || '')
    setFormRating(item.rating || 5)
    setFormDate(item.date || '')
    setFormComment(item.comment || '')
    setFormStatus(item.status || 'Pending')
    setErrors({})
    setShowModal(true)
  }

  const validate = () => {
    const errs = {}
    if (!formGuest.trim()) errs.guest = 'Guest name is required'
    if (!formRating || formRating < 1 || formRating > 5) errs.rating = 'Rating must be between 1 and 5'
    if (!formDate) errs.date = 'Date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaveLoading(true)
    try {
      const body = {
        guestName: formGuest.trim(),
        roomName: formRoom.trim(),
        rating: Number(formRating),
        date: formDate,
        comment: formComment.trim(),
        status: formStatus,
      }

      if (editItem) {
        const r = await axios.put(backendUrl + `/api/review/update/${editItem._id}`, body, { headers: getAuthHeaders() })
        if (r.data?.success) {
          notify.success('Review updated successfully')
        } else {
          notify.error(r.data?.message || 'Update failed')
          return
        }
      } else {
        const r = await axios.post(backendUrl + '/api/review/add', body, { headers: getAuthHeaders() })
        if (r.data?.success) {
          notify.success('Review added successfully')
        } else {
          notify.error(r.data?.message || 'Add failed')
          return
        }
      }
      setShowModal(false)
      await fetchReviews()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error saving review'
      notify.error(msg)
    } finally {
      setSaveLoading(false)
    }
  }

  const deleteReview = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const r = await axios.delete(backendUrl + `/api/review/delete/${deleteTarget._id}`, { headers: getAuthHeaders() })
      if (r.data?.success) {
        notify.success('Review deleted successfully')
      } else {
        notify.error(r.data?.message || 'Delete failed')
      }
      setDeleteTarget(null)
      await fetchReviews()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Delete error'
      notify.error(msg)
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const approveReview = async (id) => {
    try {
      const r = await axios.put(backendUrl + `/api/review/update/${id}`,
        { status: 'Approved' },
        { headers: getAuthHeaders() }
      )
      if (r.data?.success) {
        notify.success('Review approved')
        await fetchReviews()
      } else {
        notify.error(r.data?.message || 'Approval failed')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Approval error'
      notify.error(msg)
    }
  }

  return (
    <div className="fade-in-up" style={{ marginBottom: '32px' }}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between" style={{ gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B', fontFamily: "'Playfair Display', serif" }}>Reviews</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Guest feedback from {reviews.length} reviews</p>
        </div>
        <Button variant="primary" size="sm" icon={MdAdd} onClick={openAdd}>Add Review</Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '16px', marginBottom: '32px' }}>
        <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: '#EFF6FF' }}>
              <MdRateReview size={20} style={{ color: '#2563EB' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>{dashboard.total}</p>
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Total Reviews</p>
        </div>
        <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: '#F0FDF4' }}>
              <MdThumbUp size={20} style={{ color: '#16A34A' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>{dashboard.approved}</p>
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Approved</p>
        </div>
        <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: '#FEF3C7' }}>
              <MdThumbDown size={20} style={{ color: '#D97706' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>{dashboard.pending}</p>
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Pending</p>
        </div>
        <div className="p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: '#FFFBEB' }}>
              <MdStar size={20} style={{ color: '#D4AF37' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>{dashboard.avgRating}</p>
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Avg Rating</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap" style={{ gap: '8px', marginBottom: '24px' }}>
        {['All', 'Approved', 'Pending'].map(f => (
          <button
            key={f}
            onClick={() => { setFilterStatus(f); setPage(1) }}
            className="px-4 py-2 rounded text-xs font-medium transition-all"
            style={{
              background: filterStatus === f ? '#2563EB' : '#FFFFFF',
              color: filterStatus === f ? '#fff' : '#6B7280',
              border: `1.5px solid ${filterStatus === f ? '#2563EB' : '#E5E7EB'}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative" style={{ maxWidth: '400px', marginBottom: '16px' }}>
        <MdSearch size={18} className="absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', zIndex: 1 }} />
        <input
          type="text"
          placeholder="Search reviews by guest, room, or comment..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="input-field"
          style={{ paddingLeft: '44px', height: '42px' }}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden" style={{ border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0', color: '#94A3B8' }}>
            <svg className="animate-spin" fill="none" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', marginBottom: '12px' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm font-medium">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0' }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#DC2626' }}>{error}</p>
            <Button variant="primary" size="sm" icon={MdRefresh} onClick={fetchReviews}>Retry</Button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center" style={{ padding: '80px 0', color: '#94A3B8' }}>
            <MdRateReview size={40} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
            <p className="text-base font-medium">No reviews found</p>
            <p className="text-sm mt-1">{search ? 'Try a different search term' : 'Add the first review to get started'}</p>
            {!search && (
              <Button variant="primary" size="sm" icon={MdAdd} onClick={openAdd} className="mt-4">Add Review</Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('guestName')}>
                        Guest <SortIcon column="guestName" />
                      </div>
                    </th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('roomName')}>
                        Room <SortIcon column="roomName" />
                      </div>
                    </th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('rating')}>
                        Rating <SortIcon column="rating" />
                      </div>
                    </th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('date')}>
                        Date <SortIcon column="date" />
                      </div>
                    </th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Comment</th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('status')}>
                        Status <SortIcon column="status" />
                      </div>
                    </th>
                    <th style={{ position: 'sticky', top: 0, zIndex: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(row => (
                    <tr key={row._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: '#1E293B', color: '#FFFFFF' }}>
                            {(row.guestName || '?')[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-sm" style={{ color: '#1E293B' }}>{row.guestName}</span>
                        </div>
                      </td>
                      <td><span className="text-sm" style={{ color: '#6B7280' }}>{row.roomName || '-'}</span></td>
                      <td><StarRating rating={row.rating} size={16} /></td>
                      <td><span className="text-sm" style={{ color: '#6B7280' }}>{row.date}</span></td>
                      <td>
                        <p className="text-xs truncate" style={{ color: '#6B7280', maxWidth: '220px' }}>
                          &ldquo;{row.comment || 'No comment'}&rdquo;
                        </p>
                      </td>
                      <td>{statusBadge(row.status)}</td>
                      <td>
                        <div className="flex items-center" style={{ gap: '8px', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setViewItem(row) }}
                            className="w-9 h-9 rounded flex items-center justify-center transition-all hover:opacity-80"
                            style={{ background: '#EEF2FF', color: '#6366F1' }}
                            title="View"
                          >
                            <MdVisibility size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(row) }}
                            className="w-9 h-9 rounded flex items-center justify-center transition-all hover:opacity-80"
                            style={{ background: '#EFF6FF', color: '#2563EB' }}
                            title="Edit"
                          >
                            <MdEdit size={18} />
                          </button>
                          {row.status === 'Pending' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); approveReview(row._id) }}
                              className="w-9 h-9 rounded flex items-center justify-center transition-all hover:opacity-80"
                              style={{ background: '#F0FDF4', color: '#16A34A' }}
                              title="Approve"
                            >
                              <MdCheck size={18} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row) }}
                            className="w-9 h-9 rounded flex items-center justify-center transition-all hover:opacity-80"
                            style={{ background: '#FEF2F2', color: '#DC2626' }}
                            title="Delete"
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{sorted.length} results</p>
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

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Review Details" width="max-w-md">
        {viewItem && (
          <div className="flex flex-col" style={{ gap: '16px' }}>
            <div className="text-center mb-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3" style={{ background: '#1E293B', color: '#FFFFFF' }}>
                {(viewItem.guestName || '?')[0].toUpperCase()}
              </div>
              <h3 className="font-bold text-base" style={{ color: '#1E293B' }}>{viewItem.guestName}</h3>
              <div className="flex justify-center mt-1"><StarRating rating={viewItem.rating} /></div>
            </div>
            {[
              ['Room', viewItem.roomName || '-'],
              ['Date', viewItem.date],
              ['Status', viewItem.status],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
                <span className="text-sm font-medium" style={{ color: '#6B7280' }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: '#1E293B' }}>{value}</span>
              </div>
            ))}
            {viewItem.comment && (
              <div className="p-4 rounded" style={{ background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                <p className="text-sm italic" style={{ color: '#6B7280' }}>&ldquo;{viewItem.comment}&rdquo;</p>
              </div>
            )}
            <Button variant="secondary" onClick={() => setViewItem(null)} className="w-full">Close</Button>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Review' : 'Add Review'} width="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '16px' }}>
          <div>
            <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>
              Guest Name <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              className={`input-field ${errors.guest ? 'error' : ''}`}
              value={formGuest}
              onChange={e => setFormGuest(e.target.value)}
              placeholder="Enter guest name"
            />
            {errors.guest && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.guest}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Room</label>
              <input className="input-field" value={formRoom} onChange={e => setFormRoom(e.target.value)} placeholder="e.g. Deluxe Suite 201" />
            </div>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>
                Rating <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div className="flex items-center" style={{ gap: '12px', height: '40px' }}>
                <select className="input-field" value={formRating} onChange={e => setFormRating(Number(e.target.value))} style={{ width: 'auto', minWidth: '80px' }}>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <StarRating rating={formRating} />
              </div>
              {errors.rating && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.rating}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>
                Date <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="date"
                className={`input-field ${errors.date ? 'error' : ''}`}
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
              />
              {errors.date && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Status</label>
              <select className="input-field" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Comment</label>
            <textarea
              className="input-field"
              value={formComment}
              onChange={e => setFormComment(e.target.value)}
              placeholder="Write the guest's review comment..."
              rows={3}
            />
          </div>

          <div className="flex" style={{ gap: '10px', paddingTop: '8px' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button
              type="submit"
              variant="success"
              icon={MdCheck}
              loading={saveLoading}
              className="flex-1"
            >
              {editItem ? 'Update Review' : 'Add Review'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteReview}
        title="Delete Review"
        message={`Delete review by ${deleteTarget?.guestName}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  )
}

export default Reviews
