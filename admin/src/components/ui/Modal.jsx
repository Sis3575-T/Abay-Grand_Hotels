import React, { useEffect } from 'react'
import { MdClose } from 'react-icons/md'

const Modal = ({ open, onClose, title, children, width = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && open) onClose() }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`w-full ${width} mx-auto fade-in-up`}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded transition-all hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            <MdClose size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
