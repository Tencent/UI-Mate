import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function AddSiteModal({ onClose }) {
  const navigate = useNavigate()
  const { addZone } = useApp()
  const [domain, setDomain] = useState('')
  const [error, setError] = useState('')

  function validateDomain(d) {
    const clean = d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (!clean) return { valid: false, msg: 'Please enter a domain name.' }
    if (!clean.includes('.')) return { valid: false, msg: 'Please enter a valid domain (e.g., example.com).' }
    if (clean.length > 253) return { valid: false, msg: 'Domain name is too long.' }
    return { valid: true, clean }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const { valid, msg, clean } = validateDomain(domain)
    if (!valid) { setError(msg); return }

    const id = 'zone_' + Date.now()
    const newZone = {
      id,
      name: clean,
      account_id: 'acc_001',
      status: 'pending',
      paused: false,
      plan: { id: 'free', name: 'Free Website', price: 0, currency: 'USD', frequency: 'monthly' },
      name_servers: ['anna.ns.cloudflare.com', 'greg.ns.cloudflare.com'],
      original_name_servers: [],
      created_on: new Date().toISOString(),
      modified_on: new Date().toISOString(),
      activated_on: null,
      meta: { step: 1, page_rule_quota: 3, ssl_status: 'pending_validation' },
      stats: { total_requests_24h: 0, threats_blocked_24h: 0, bandwidth_saved_percent: 0 }
    }

    addZone(newZone)
    onClose()
    navigate(`/${id}/overview`)
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add a site</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ color: 'var(--cf-text-secondary)', marginBottom: 16, fontSize: 14, lineHeight: 1.5 }}>
              Enter your site's root domain to add it to Xloudflare.
            </p>
            <div className="form-group">
              <label className="form-label">Site (domain)</label>
              <input
                className="form-input"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={e => { setDomain(e.target.value); setError('') }}
                autoFocus
              />
              {error && <span style={{ color: 'var(--cf-error)', fontSize: 13 }}>{error}</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add site</button>
          </div>
        </form>
      </div>
    </div>
  )
}
