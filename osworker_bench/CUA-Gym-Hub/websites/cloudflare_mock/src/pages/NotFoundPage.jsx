import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, color: 'var(--cf-text-muted)', marginBottom: 12 }}>404</h1>
      <p style={{ color: 'var(--cf-text-secondary)', marginBottom: 24 }}>This page could not be found.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Return to Account Home</button>
    </div>
  )
}
