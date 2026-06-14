import React, { useState } from 'react'
import { backendUrl } from '../App'
import axios from 'axios'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import Button from './ui/Button'

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const adminLoginHandler = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Email and password are required'); return }
    setError('')
    try {
      setLoading(true)
      const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
      const data = response.data
      if (data && data.success) {
        setToken(data.token)
      } else {
        setError(data?.message || 'Login failed')
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError(`Cannot reach server at ${backendUrl}. Make sure the backend is running.`)
      } else if (err.response) {
        setError(err.response?.data?.message || `Server error (${err.response.status})`)
      } else {
        setError(err.message || 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F172A' }}>
      <form onSubmit={adminLoginHandler} className="w-full max-w-sm flex flex-col gap-4">
        <div className="text-center mb-2">
          <h1 className="text-lg font-bold" style={{ color: '#D4AF37' }}>Abay Grand Hotel</h1>
          <p className="text-xs mt-1" style={{ color: '#64748B' }}>Admin Login</p>
        </div>

        {error && (
          <p className="text-xs text-center py-2 px-3 rounded" style={{ background: 'rgba(220,38,38,0.15)', color: '#FCA5A5' }}>
            {error}
          </p>
        )}

        <div>
          <label className="block text-xs mb-1 font-medium" style={{ color: '#94A3B8' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded text-sm outline-none"
            style={{ background: '#1E293B', border: '1px solid #334155', color: '#F1F5F9' }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1 font-medium" style={{ color: '#94A3B8' }}>Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded text-sm outline-none pr-10"
              style={{ background: '#1E293B', border: '1px solid #334155', color: '#F1F5F9' }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }}>
              {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  )
}

export default Login
