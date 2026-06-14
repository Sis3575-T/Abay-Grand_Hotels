import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { backendUrl, useSettings } from '../App'
import { MdSave, MdHotel, MdLocationOn, MdPhone, MdEmail, MdLanguage, MdCameraAlt, MdRefresh } from 'react-icons/md'
import { FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'
import Button from '../components/ui/Button'
import notify from '../components/ui/Toast'

const Settings = () => {
  const { refreshSettings } = useSettings()
  const [form, setForm] = useState({
    hotelName: '', address: '', phone: '', email: '', website: '',
    facebook: '', twitter: '', instagram: '', linkedin: '',
    description: '', checkinTime: '14:00', checkoutTime: '12:00', currency: 'ETB', taxRate: '15',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [logo, setLogo] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await axios.get(backendUrl + '/api/settings', { headers: getAuthHeaders() })
      if (r.data?.success && r.data?.settings) {
        const s = r.data.settings
        setForm({
          hotelName: s.hotelName || '', address: s.address || '', phone: s.phone || '', email: s.email || '', website: s.website || '',
          facebook: s.facebook || '', twitter: s.twitter || '', instagram: s.instagram || '', linkedin: s.linkedin || '',
          description: s.description || '', checkinTime: s.checkinTime || '14:00', checkoutTime: s.checkoutTime || '12:00',
          currency: s.currency || 'ETB', taxRate: s.taxRate || '15',
        })
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load settings'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const validate = () => {
    const errs = {}
    if (!form.hotelName.trim()) errs.hotelName = 'Hotel name is required'
    if (!form.address.trim()) errs.address = 'Address is required'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.taxRate || Number(form.taxRate) < 0) errs.taxRate = 'Valid tax rate is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      let body
      let headers = getAuthHeaders()
      if (logo) {
        const fd = new FormData()
        fd.append('logo', logo)
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        body = fd
        headers = { ...headers, 'Content-Type': 'multipart/form-data' }
      } else {
        body = form
      }
      const r = await axios.put(backendUrl + '/api/settings/update', body, { headers })
      if (r.data?.success) {
        notify.success('Settings saved successfully!')
        refreshSettings()
      } else {
        notify.error(r.data?.message || 'Save failed')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error saving settings'
      notify.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, field, icon: Icon, type = 'text', required, placeholder }) => (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94A3B8' }} />}
        {type === 'textarea' ? (
          <textarea className={`input-field ${errors[field] ? 'error' : ''}`} value={form[field]} onChange={handleChange(field)} rows={3}
            style={Icon ? { paddingLeft: '36px', resize: 'vertical' } : { resize: 'vertical' }} />
        ) : type === 'select' ? (
          <select className={`input-field ${errors[field] ? 'error' : ''}`} value={form[field]} onChange={handleChange(field)}>
            {['ETB', 'USD', 'EUR'].map(c => <option key={c} value={c}>{c} — {c === 'ETB' ? 'Ethiopian Birr' : c === 'USD' ? 'US Dollar' : 'Euro'}</option>)}
          </select>
        ) : (
          <input type={type} className={`input-field ${errors[field] ? 'error' : ''}`} value={form[field]} onChange={handleChange(field)}
            placeholder={placeholder} style={Icon ? { paddingLeft: '36px' } : {}} />
        )}
      </div>
      {errors[field] && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors[field]}</p>}
    </div>
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0', color: '#94A3B8' }}>
        <svg className="animate-spin" fill="none" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', marginBottom: '12px' }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm font-medium">Loading settings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ padding: '80px 0' }}>
        <p className="text-sm font-medium mb-3" style={{ color: '#DC2626' }}>{error}</p>
        <Button variant="primary" size="sm" icon={MdRefresh} onClick={fetchSettings}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="fade-in-up" style={{ marginBottom: '32px' }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#1E293B', fontFamily: "'Playfair Display', serif" }}>Hotel Settings</h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Manage your hotel's configuration and preferences</p>
      </div>

      <form onSubmit={handleSave} className="max-w-4xl flex flex-col gap-5">
        <div className="p-5 card-hover" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1E293B' }}>
            <MdHotel size={16} style={{ color: '#2563EB' }} /> Branding
          </h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <label className="block text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>Hotel Logo</label>
              <label className="flex flex-col items-center justify-center w-32 h-32 cursor-pointer transition-all rounded"
                style={{ border: '2px dashed #E5E7EB', background: '#F8FAFC' }}>
                {logo ? (
                  <img src={URL.createObjectURL(logo)} alt="preview" className="w-full h-full object-cover rounded" />
                ) : (
                  <div className="text-center p-3">
                    <div className="w-12 h-12 rounded flex items-center justify-center font-bold text-base mx-auto mb-2"
                      style={{ background: '#D4AF37', color: '#0F172A' }}>
                      AG
                    </div>
                    <MdCameraAlt size={16} style={{ color: '#94A3B8' }} className="mx-auto" />
                    <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>Upload Logo</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={e => setLogo(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Hotel Name" field="hotelName" required />
              </div>
              <div className="sm:col-span-2">
                <Field label="Description" field="description" type="textarea" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 card-hover" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1E293B' }}>
            <MdLocationOn size={16} style={{ color: '#2563EB' }} /> Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Field label="Address" field="address" icon={MdLocationOn} required /></div>
            <Field label="Phone" field="phone" icon={MdPhone} required />
            <Field label="Email" field="email" icon={MdEmail} type="email" required />
            <div className="sm:col-span-2"><Field label="Website" field="website" icon={MdLanguage} type="url" /></div>
          </div>
        </div>

        <div className="p-5 card-hover" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>Social Media Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: MdLanguage, field: 'facebook', label: 'Facebook' },
              { icon: FaTwitter, field: 'twitter', label: 'Twitter' },
              { icon: FaInstagram, field: 'instagram', label: 'Instagram' },
              { icon: FaLinkedin, field: 'linkedin', label: 'LinkedIn' },
            ].map(({ icon: Icon, field, label }) => (
              <Field key={field} label={label} field={field} icon={Icon} type="url" placeholder={`https://${label.toLowerCase()}.com/...`} />
            ))}
          </div>
        </div>

        <div className="p-5 card-hover" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#1E293B' }}>Hotel Policies</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Check-in Time" field="checkinTime" type="time" />
            <Field label="Check-out Time" field="checkoutTime" type="time" />
            <Field label="Currency" field="currency" type="select" />
            <Field label="Tax Rate (%)" field="taxRate" type="number" required />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button variant="secondary" onClick={() => fetchSettings()}>Reset</Button>
          <Button type="submit" variant="primary" icon={MdSave} loading={saving} size="lg">Save Settings</Button>
        </div>
      </form>
    </div>
  )
}

export default Settings
