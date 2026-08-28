import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './AccountHome.css'

function PlanBadge({ plan }) {
  const classes = {
    free: 'badge-free',
    pro: 'badge-pro',
    business: 'badge-business',
    enterprise: 'badge-enterprise'
  }
  return (
    <span className={`badge ${classes[plan.id] || 'badge-free'}`}>
      {plan.name}
    </span>
  )
}

function StatusBadge({ status, paused }) {
  if (paused) return (
    <span className="zone-status">
      <span className="status-dot status-dot-paused" />
      Paused
    </span>
  )
  const map = {
    active: { cls: 'status-dot-active', label: 'Active' },
    pending: { cls: 'status-dot-pending', label: 'Pending' },
    initializing: { cls: 'status-dot-pending', label: 'Initializing' }
  }
  const s = map[status] || { cls: 'status-dot-paused', label: status }
  return (
    <span className="zone-status">
      <span className={`status-dot ${s.cls}`} />
      {s.label}
    </span>
  )
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

export default function AccountHome({ onAddSite }) {
  const navigate = useNavigate()
  const { state, updateZone, deleteZone } = useApp()
  const [search, setSearch] = useState('')
  const [showRemoveMenu, setShowRemoveMenu] = useState(null)
  const [removeZone, setRemoveZone] = useState(null)

  const filtered = (state.zones || []).filter(z =>
    z.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="account-home">
      <div className="account-home-header">
        <div>
          <h1 className="page-title">Websites</h1>
          <p className="page-subtitle">{state.zones?.length || 0} site{state.zones?.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-orange" onClick={onAddSite}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add site
        </button>
      </div>

      <div className="zones-search-bar">
        <div className="search-input-wrap">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            className="form-input search-input"
            type="text"
            placeholder="Search by domain name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="zones-list card">
        {filtered.length === 0 ? (
          <div className="zones-empty">
            {search ? `No sites matching "${search}"` : 'No sites yet. Add your first site!'}
          </div>
        ) : (
          filtered.map(zone => (
            <div key={zone.id} className="zone-row" onClick={() => navigate(`/${zone.id}/overview`)}>
              <div className="zone-row-main">
                <div className="zone-domain">{zone.name}</div>
                <div className="zone-meta">
                  <PlanBadge plan={zone.plan} />
                  <StatusBadge status={zone.status} paused={zone.paused} />
                </div>
              </div>

              {zone.status === 'active' && !zone.paused && (
                <div className="zone-stats">
                  <div className="zone-stat">
                    <span className="zone-stat-value">{formatNumber(zone.stats.total_requests_24h)}</span>
                    <span className="zone-stat-label">Requests (24h)</span>
                  </div>
                  <div className="zone-stat">
                    <span className="zone-stat-value">{zone.stats.threats_blocked_24h}</span>
                    <span className="zone-stat-label">Threats</span>
                  </div>
                  <div className="zone-stat">
                    <span className="zone-stat-value">{zone.stats.bandwidth_saved_percent}%</span>
                    <span className="zone-stat-label">Bandwidth Saved</span>
                  </div>
                </div>
              )}

              <div className="zone-row-actions" onClick={e => e.stopPropagation()}>
                <div className="overflow-menu-wrap">
                  <button
                    className="btn-icon"
                    onClick={() => setShowRemoveMenu(showRemoveMenu === zone.id ? null : zone.id)}
                    title="More options"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
                  </button>
                  {showRemoveMenu === zone.id && (
                    <div className="overflow-menu">
                      <button
                        className="overflow-menu-item danger"
                        onClick={() => {
                          setShowRemoveMenu(null)
                          setRemoveZone(zone)
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Remove Zone Modal */}
      {removeZone && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Remove Site</h2>
              <button className="btn-icon" onClick={() => setRemoveZone(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--cf-text-secondary)', fontSize: 14 }}>
                Are you sure you want to remove <strong>{removeZone.name}</strong> from your Xloudflare account?
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRemoveZone(null)}>Cancel</button>
              <button className="btn btn-danger-solid" onClick={() => { deleteZone(removeZone.id); setRemoveZone(null) }}>
                Remove {removeZone.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
