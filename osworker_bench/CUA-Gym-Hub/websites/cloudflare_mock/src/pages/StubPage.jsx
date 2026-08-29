import React from 'react'

export default function StubPage({ title, description }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cf-text-muted)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p style={{ color: 'var(--cf-text-secondary)', marginBottom: 8, fontWeight: 500 }}>
          {description || 'This feature is available on paid plans or coming soon.'}
        </p>
        <p style={{ color: 'var(--cf-text-muted)', fontSize: 13 }}>
          This section is not available in the mock environment.
        </p>
      </div>
    </div>
  )
}
