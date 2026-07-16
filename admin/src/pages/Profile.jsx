import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { MdPerson, MdEmail, MdPhotoCamera, MdSave, MdAdminPanelSettings } from 'react-icons/md'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'

const getAuthHeaders = () => {
  const t = localStorage.getItem('adminToken')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

const Profile = () => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [photo, setPhoto] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [preview, setPreview] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const r = await axios.get(`${backendUrl}/api/user/profile`, { headers: getAuthHeaders() })
        if (r.data?.success) {
          setAdmin(r.data.admin)
          setName(r.data.admin.name)
          setEmail(r.data.admin.email)
          setPhoto(r.data.admin.photo || '')
          setPreview(r.data.admin.photo || '')
        }
      } catch {
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('email', email.trim())
      if (photoFile) formData.append('photo', photoFile)

      const r = await axios.put(`${backendUrl}/api/user/profile`, formData, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
      })
      if (r.data?.success) {
        setAdmin(r.data.admin)
        setPhoto(r.data.admin.photo || '')
        setPreview(r.data.admin.photo || '')
        setPhotoFile(null)
        toast.success(r.data.message || 'Profile updated successfully')
      } else {
        toast.error(r.data?.message || 'Failed to update profile')
      }
    } catch {
      toast.error('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your personal information</p>
      </div>

      <div className="rounded-xl shadow-sm border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #1E293B, #334155)', border: '3px solid #D4AF37' }}
                >
                  {preview ? (
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span style={{ color: '#D4AF37' }}>{(name || 'A')[0].toUpperCase()}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105"
                  style={{ background: '#D4AF37', color: '#1E293B' }}
                >
                  <MdPhotoCamera size={16} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click the camera icon to change photo</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                <MdPerson className="inline mr-1.5" size={16} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                }}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                <MdEmail className="inline mr-1.5" size={16} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                }}
                required
              />
            </div>

            {/* Role (read-only) */}
            {admin?.role && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  <MdAdminPanelSettings className="inline mr-1.5" size={16} /> Role
                </label>
                <input
                  type="text"
                  value={admin.role}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none cursor-not-allowed"
                  style={{
                    border: '1.5px solid var(--border)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: '#D4AF37', color: '#1E293B' }}
              >
                <MdSave size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
