import React from 'react'

const variants = {
  primary:   { bg: '#2563EB', hover: '#1D4ED8', color: '#fff' },
  success:   { bg: '#16A34A', hover: '#15803D', color: '#fff' },
  danger:    { bg: '#DC2626', hover: '#B91C1C', color: '#fff' },
  secondary: { bg: '#6B7280', hover: '#4B5563', color: '#fff' },
  info:      { bg: '#6366F1', hover: '#4F46E5', color: '#fff' },
  outline:   { bg: 'transparent', hover: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' },
  ghost:     { bg: 'transparent', hover: '#F3F4F6', color: '#6B7280', border: 'none' },
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = ({ variant = 'primary', size = 'md', loading = false, disabled = false, children, onClick, type = 'button', className = '', icon: Icon, ...props }) => {
  const v = variants[variant] || variants.primary
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-150 ${sizes[size]} ${className}`}
      style={{
        background: v.bg,
        color: v.color,
        border: v.border ? `1.5px solid ${v.border}` : 'none',
        opacity: isDisabled ? 0.6 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => { if (!isDisabled) e.target.style.background = v.hover }}
      onMouseLeave={e => { if (!isDisabled) e.target.style.background = v.bg }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {Icon && !loading && <Icon size={16} />}
      {children}
    </button>
  )
}

export default Button
