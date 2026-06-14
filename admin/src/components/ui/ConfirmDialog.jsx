import React from 'react'
import Button from './Button'

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Delete', loading = false, variant = 'danger' }) => {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-auto fade-in-up p-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={variant} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
