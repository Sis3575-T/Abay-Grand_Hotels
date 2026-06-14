import React, { useEffect, useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import {
  MdBadge, MdAdd, MdEdit, MdDelete, MdVisibility,
  MdSearch, MdRefresh, MdCheck, MdClose
} from 'react-icons/md'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import notify from '../components/ui/Toast'

const ROLES = ['Super Admin', 'Hotel Manager', 'Receptionist', 'Cashier', 'Housekeeping', 'Maintenance']
const DEPARTMENTS = ['Management', 'Front Desk', 'Housekeeping', 'Maintenance', 'Kitchen', 'Other']
const STATUSES = ['Active', 'Inactive', 'On Leave']

const statusBadge = (status) => {
  const map = {
    'Active':   { bg: '#DCFCE7', color: '#16A34A' },
    'Inactive': { bg: '#FEE2E2', color: '#DC2626' },
    'On Leave': { bg: '#FEF3C7', color: '#D97706' },
  }
  const s = map[status] || { bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span className="px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

const StaffManagement = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [filterRole, setFilterRole] = useState('')

  const [formName, setFormName] = useState('')
  const [formEmpId, setFormEmpId] = useState('')
  const [formRole, setFormRole] = useState('Receptionist')
  const [formDept, setFormDept] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formSalary, setFormSalary] = useState('')
  const [formStatus, setFormStatus] = useState('Active')
  const [formJoinDate, setFormJoinDate] = useState('')
  const [errors, setErrors] = useState({})

  const PAGE_SIZE = 8

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await axios.get(backendUrl + '/api/staff/list', { headers: getAuthHeaders() })
      setStaff(r.data?.staff || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load staff')
      setStaff([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  const filtered = useMemo(() => {
    let result = staff
    if (filterRole) result = result.filter(s => s.role === filterRole)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.employeeId || '').toLowerCase().includes(q) ||
        (s.role || '').toLowerCase().includes(q) ||
        (s.department || '').toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [staff, search, filterRole])

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
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <span className="ml-1" style={{ color: '#94A3B8', opacity: 0.4 }}>&#8597;</span>
    return <span className="ml-1" style={{ color: '#2563EB' }}>{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>
  }

  const openAdd = () => {
    setEditItem(null); setErrors({})
    setFormName(''); setFormEmpId(''); setFormRole('Receptionist'); setFormDept('')
    setFormPhone(''); setFormEmail(''); setFormSalary(''); setFormStatus('Active'); setFormJoinDate('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item); setErrors({})
    setFormName(item.name || ''); setFormEmpId(item.employeeId || ''); setFormRole(item.role || 'Receptionist')
    setFormDept(item.department || ''); setFormPhone(item.phone || ''); setFormEmail(item.email || '')
    setFormSalary(String(item.salary || '')); setFormStatus(item.status || 'Active'); setFormJoinDate(item.joinDate || '')
    setShowModal(true)
  }

  const validate = () => {
    const errs = {}
    if (!formName.trim()) errs.name = 'Name is required'
    if (!formEmpId.trim()) errs.empId = 'Employee ID is required'
    if (!formRole) errs.role = 'Role is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaveLoading(true)
    try {
      const body = {
        name: formName.trim(), employeeId: formEmpId.trim(), role: formRole,
        department: formDept, phone: formPhone.trim(), email: formEmail.trim(),
        salary: Number(formSalary) || 0, status: formStatus, joinDate: formJoinDate,
      }
      if (editItem) {
        const r = await axios.put(backendUrl + `/api/staff/update/${editItem._id}`, body, { headers: getAuthHeaders() })
        if (!r.data?.success) { notify.error(r.data?.message || 'Update failed'); return }
        notify.success('Staff updated successfully')
      } else {
        const r = await axios.post(backendUrl + '/api/staff/add', body, { headers: getAuthHeaders() })
        if (!r.data?.success) { notify.error(r.data?.message || 'Add failed'); return }
        notify.success('Staff added successfully')
      }
      setShowModal(false)
      await fetchStaff()
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Error saving staff')
    } finally {
      setSaveLoading(false)
    }
  }

  const deleteStaff = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const r = await axios.delete(backendUrl + `/api/staff/delete/${deleteTarget._id}`, { headers: getAuthHeaders() })
      if (r.data?.success) notify.success('Staff deleted successfully')
      else notify.error(r.data?.message || 'Delete failed')
      setDeleteTarget(null)
      await fetchStaff()
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Delete error')
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    { header: () => <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('employeeId')}>ID <SortIcon column="employeeId" /></div>, render: (r) => <span className="font-mono text-xs font-semibold" style={{ color: '#2563EB' }}>{r.employeeId}</span> },
    { header: () => <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('name')}>Name <SortIcon column="name" /></div>, render: (r) => <span className="font-medium" style={{ color: '#1E293B' }}>{r.name}</span> },
    { header: () => <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('role')}>Role <SortIcon column="role" /></div>, render: (r) => <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#F3F0FF', color: '#7C3AED' }}>{r.role}</span> },
    { header: () => <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('department')}>Department <SortIcon column="department" /></div>, accessor: 'department' },
    { header: () => <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('phone')}>Phone <SortIcon column="phone" /></div>, accessor: 'phone' },
    { header: () => <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('salary')}>Salary <SortIcon column="salary" /></div>, render: (r) => <span className="font-semibold" style={{ color: '#16A34A' }}>${(r.salary || 0).toLocaleString()}</span> },
    { header: () => <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('status')}>Status <SortIcon column="status" /></div>, render: (r) => statusBadge(r.status) },
    { header: () => <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => handleSort('joinDate')}>Join Date <SortIcon column="joinDate" /></div>, accessor: 'joinDate' },
    { header: 'Actions', render: (r) => (
      <div className="flex items-center" style={{ gap: '10px', whiteSpace: 'nowrap' }}>
        <button onClick={(e) => { e.stopPropagation(); setViewItem(r) }} className="w-9 h-9 rounded flex items-center justify-center transition-all hover:opacity-80" style={{ background: '#EEF2FF', color: '#6366F1' }} title="View"><MdVisibility size={18} /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="w-9 h-9 rounded flex items-center justify-center transition-all hover:opacity-80" style={{ background: '#EFF6FF', color: '#2563EB' }} title="Edit"><MdEdit size={18} /></button>
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }} className="w-9 h-9 rounded flex items-center justify-center transition-all hover:opacity-80" style={{ background: '#FEF2F2', color: '#DC2626' }} title="Delete"><MdDelete size={18} /></button>
      </div>
    )},
  ]

  return (
    <div className="fade-in-up" style={{ marginBottom: '32px' }}>
      <div className="flex flex-wrap items-start justify-between" style={{ gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B', fontFamily: "'Playfair Display', serif" }}>Staff Management</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{staff.length} staff members</p>
        </div>
        <Button variant="primary" size="sm" icon={MdAdd} onClick={openAdd}>Add Staff</Button>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center" style={{ gap: '12px', marginBottom: '16px' }}>
        <div className="relative" style={{ maxWidth: '360px', flex: '1 1 200px' }}>
          <MdSearch size={18} className="absolute" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', zIndex: 1 }} />
          <input type="text" placeholder="Search staff..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="input-field" style={{ paddingLeft: '44px', height: '42px', width: '100%' }} />
        </div>
        <select className="input-field" style={{ width: 'auto', minWidth: '160px' }} value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1) }}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden" style={{ border: '1px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0', color: '#94A3B8' }}>
            <svg className="animate-spin" fill="none" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', marginBottom: '12px' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-sm font-medium">Loading staff...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0' }}>
            <p className="text-sm font-medium mb-3" style={{ color: '#DC2626' }}>{error}</p>
            <Button variant="primary" size="sm" icon={MdRefresh} onClick={fetchStaff}>Retry</Button>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center" style={{ padding: '80px 0', color: '#94A3B8' }}>
            <MdBadge size={40} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
            <p className="text-base font-medium">No staff found</p>
            <p className="text-sm mt-1">{search || filterRole ? 'Try a different search or filter' : 'Add your first staff member'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>{columns.map((col, i) => (<th key={i} style={{ position: 'sticky', top: 0, zIndex: 10 }}>{typeof col.header === 'function' ? col.header() : col.header}</th>))}</tr>
                </thead>
                <tbody>
                  {paginated.map((row) => (
                    <tr key={row._id}>
                      {columns.map((col, j) => (<td key={j}>{col.render ? col.render(row) : row[col.accessor] ?? '-'}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: '#E5E7EB' }}>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{sorted.length} results</p>
                <div className="flex items-center" style={{ gap: '6px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded flex items-center justify-center disabled:opacity-40 transition-all text-sm" style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>&lsaquo;</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} onClick={() => setPage(i + 1)} className="w-8 h-8 rounded text-xs font-medium transition-all" style={{ background: page === i + 1 ? '#2563EB' : '#FFFFFF', color: page === i + 1 ? '#fff' : '#6B7280', border: `1px solid ${page === i + 1 ? '#2563EB' : '#E5E7EB'}` }}>{i + 1}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded flex items-center justify-center disabled:opacity-40 transition-all text-sm" style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>&rsaquo;</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Modal */}
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} title="Staff Details" width="max-w-md">
        {viewItem && (
          <div className="flex flex-col" style={{ gap: '16px' }}>
            {[['Name', viewItem.name], ['Employee ID', viewItem.employeeId], ['Role', viewItem.role], ['Department', viewItem.department || '-'], ['Phone', viewItem.phone || '-'], ['Email', viewItem.email || '-'], ['Salary', `$${(viewItem.salary || 0).toLocaleString()}`], ['Status', viewItem.status], ['Join Date', viewItem.joinDate || '-']].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between py-3 border-b" style={{ borderColor: '#E5E7EB' }}>
                <span className="text-sm font-medium" style={{ color: '#6B7280' }}>{label}</span>
                <span className="text-sm font-semibold" style={{ color: '#1E293B' }}>{value}</span>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setViewItem(null)} className="w-full">Close</Button>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Staff' : 'Add Staff'} width="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '16px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Full Name <span style={{ color: '#DC2626' }}>*</span></label>
              <input className={`input-field ${errors.name ? 'error' : ''}`} value={formName} onChange={e => setFormName(e.target.value)} placeholder="Enter full name" />
              {errors.name && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Employee ID <span style={{ color: '#DC2626' }}>*</span></label>
              <input className={`input-field ${errors.empId ? 'error' : ''}`} value={formEmpId} onChange={e => setFormEmpId(e.target.value)} placeholder="e.g. EMP001" />
              {errors.empId && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.empId}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Role <span style={{ color: '#DC2626' }}>*</span></label>
              <select className="input-field" value={formRole} onChange={e => setFormRole(e.target.value)}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select>
              {errors.role && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.role}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Department</label>
              <select className="input-field" value={formDept} onChange={e => setFormDept(e.target.value)}><option value="">Select</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Phone</label>
              <input className="input-field" value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="Enter phone number" />
            </div>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Email</label>
              <input type="email" className="input-field" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="Enter email" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Salary ($)</label>
              <input type="number" className="input-field" value={formSalary} onChange={e => setFormSalary(e.target.value)} placeholder="0" min="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Status</label>
              <select className="input-field" value={formStatus} onChange={e => setFormStatus(e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Join Date</label>
            <input type="date" className="input-field" value={formJoinDate} onChange={e => setFormJoinDate(e.target.value)} />
          </div>
          <div className="flex" style={{ gap: '10px', paddingTop: '8px' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="success" icon={MdCheck} loading={saveLoading} className="flex-1">{editItem ? 'Update Staff' : 'Add Staff'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={deleteStaff} title="Delete Staff" message={`Delete ${deleteTarget?.name} (${deleteTarget?.employeeId})? This cannot be undone.`} confirmLabel="Delete" variant="danger" loading={deleteLoading} />
    </div>
  )
}

export default StaffManagement
