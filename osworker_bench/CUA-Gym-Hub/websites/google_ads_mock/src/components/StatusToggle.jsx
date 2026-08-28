import React from 'react'

export default function StatusToggle({ status, onChange, entityType = 'campaign' }) {
  const enabled = status === 'ENABLED'
  const label = entityType.toLowerCase()
  return (
    <button
      title={enabled ? `Pause ${label}` : `Enable ${label}`}
      onClick={e => { e.stopPropagation(); onChange(enabled ? 'PAUSED' : 'ENABLED') }}
      style={{
        width: 32, height: 18, borderRadius: 9, border: 'none',
        background: enabled ? '#188038' : '#DADCE0', position: 'relative',
        cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
        padding: 0
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: 7, background: '#fff',
        position: 'absolute', top: 2, left: enabled ? 15 : 2,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </button>
  )
}
