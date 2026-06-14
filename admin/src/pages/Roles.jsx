import React, { useEffect, useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { MdAdminPanelSettings, MdAdd, MdEdit, MdDelete, MdCheck, MdClose } from 'react-icons/md'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import notify from '../components/ui/Toast'

const ALL_PERMISSIONS = [
  'Manage Reservations', 'Manage Rooms', 'Manage Revenue', 'Manage Customers',
  'Manage Staff', 'Manage Payments', 'View Reports', 'Manage Settings',
]

const Roles = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [formName, setFormName] = useState('')
  const [formPermissions, setFormPermissions] = useState([])
  const [errors, setErrors] = useState({})

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await axios.get(backendUrl + '/api/role/list', { headers: getAuthHeaders() })
      setRoles(r.data?.roles || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load roles')
      setRoles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const togglePermission = (perm) => {
    setFormPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    )
  }

  const openAdd = () => {
    setEditItem(null); setErrors({}); setFormName(''); setFormPermissions([]); setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item); setErrors({}); setFormName(item.name || ''); setFormPermissions(item.permissions || []); setShowModal(true)
  }

  const validate = () => {
    const errs = {}
    if (!formName.trim()) errs.name = 'Role name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaveLoading(true)
    try {
      const body = { name: formName.trim(), permissions: formPermissions }
      if (editItem) {
        const r = await axios.put(backendUrl + `/api/role/update/${editItem._id}`, body, { headers: getAuthHeaders() })
        if (!r.data?.success) { notify.error(r.data?.message || 'Update failed'); return }
        notify.success('Role updated successfully')
      } else {
        const r = await axios.post(backendUrl + '/api/role/add', body, { headers: getAuthHeaders() })
        if (!r.data?.success) { notify.error(r.data?.message || 'Create failed'); return }
        notify.success('Role created successfully')
      }
      setShowModal(false)
      await fetchRoles()
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Error saving role')
    } finally {
      setSaveLoading(false)
    }
  }

  const deleteRole = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const r = await axios.delete(backendUrl + `/api/role/delete/${deleteTarget._id}`, { headers: getAuthHeaders() })
      if (r.data?.success) notify.success('Role deleted')
      else notify.error(r.data?.message || 'Delete failed')
      setDeleteTarget(null)
      await fetchRoles()
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Delete error')
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="fade-in-up" style={{ marginBottom: '32px' }}>
      <div className="flex flex-wrap items-start justify-between" style={{ gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1E293B', fontFamily: "'Playfair Display', serif" }}>Role & Permission Management</h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{roles.length} roles defined</p>
        </div>
        <Button variant="primary" size="sm" icon={MdAdd} onClick={openAdd}>Create Role</Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0', color: '#94A3B8' }}>
          <svg className="animate-spin" fill="none" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', marginBottom: '12px' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-sm font-medium">Loading roles...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#DC2626' }}>{error}</p>
          <Button variant="primary" size="sm" icon={MdRefresh} onClick={fetchRoles}>Retry</Button>
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center" style={{ padding: '80px 0', color: '#94A3B8' }}>
          <MdAdminPanelSettings size={40} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
          <p className="text-base font-medium">No roles found</p>
          <p className="text-sm mt-1">Create your first role to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: '20px' }}>
          {roles.map(role => (
            <div key={role._id} className="p-5 card-hover" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base" style={{ color: '#1E293B' }}>{role.name}</h3>
                <div className="flex items-center" style={{ gap: '6px' }}>
                  <button onClick={() => openEdit(role)} className="w-8 h-8 rounded flex items-center justify-center transition-all hover:opacity-80" style={{ background: '#EFF6FF', color: '#2563EB' }} title="Edit"><MdEdit size={16} /></button>
                  <button onClick={() => setDeleteTarget(role)} className="w-8 h-8 rounded flex items-center justify-center transition-all hover:opacity-80" style={{ background: '#FEF2F2', color: '#DC2626' }} title="Delete"><MdDelete size={16} /></button>
                </div>
              </div>
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>Permissions ({role.permissions?.length || 0})</p>
                {role.permissions?.length > 0 ? (
                  <div className="flex flex-wrap" style={{ gap: '6px' }}>
                    {role.permissions.map(p => (
                      <span key={p} className="px-2.5 py-1 rounded text-xs font-medium" style={{ background: '#EFF6FF', color: '#2563EB' }}>{p}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: '#D1D5DB' }}>No permissions assigned</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Role' : 'Create Role'} width="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '16px' }}>
          <div>
            <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '6px' }}>Role Name <span style={{ color: '#DC2626' }}>*</span></label>
            <input className={`input-field ${errors.name ? 'error' : ''}`} value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Hotel Manager" />
            {errors.name && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold" style={{ color: '#6B7280', marginBottom: '10px' }}>Permissions</label>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '8px' }}>
              {ALL_PERMISSIONS.map(perm => (
                <label key={perm} className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all hover:bg-gray-50" style={{ border: '1px solid #E5E7EB' }}>
                  <input type="checkbox" checked={formPermissions.includes(perm)} onChange={() => togglePermission(perm)} style={{ accentColor: '#2563EB' }} />
                  <span className="text-sm" style={{ color: '#1E293B' }}>{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex" style={{ gap: '10px', paddingTop: '8px' }}>
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="success" icon={MdCheck} loading={saveLoading} className="flex-1">{editItem ? 'Update Role' : 'Create Role'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={deleteRole} title="Delete Role" message={`Delete role "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" variant="danger" loading={deleteLoading} />
    </div>
  )
}

export default Roles
