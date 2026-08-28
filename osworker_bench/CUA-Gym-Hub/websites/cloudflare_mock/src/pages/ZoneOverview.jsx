import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './ZoneOverview.css'

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}

function PlanBadge({ plan }) {
  const classes = { free: 'badge-free', pro: 'badge-pro', business: 'badge-business', enterprise: 'badge-enterprise' }
  return <span className={`badge ${classes[plan?.id] || 'badge-free'}`}>{plan?.name}</span>
}

function StatusBadge({ status, paused }) {
  if (paused) return <span className="badge badge-paused">Paused</span>
  return <span className={`badge ${status === 'active' ? 'badge-active' : 'badge-pending'}`}>{status === 'active' ? 'Active' : 'Pending'}</span>
}

function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + ' KB'
  return bytes + ' B'
}

function getTimeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function ZoneOverview() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const { getZone, updateZone, state, updateCachingSettings, updateSslSettings, updateSecuritySettings } = useApp()

  const zone = getZone(zoneId)
  const sslSettings = state.sslSettings?.[zoneId] || {}
  const cachingSettings = state.cachingSettings?.[zoneId] || {}
  const securitySettings = state.securitySettings?.[zoneId] || {}
  const analytics = state.analytics?.[zoneId]
  const dnsRecords = state.dnsRecords?.[zoneId] || []
  const firewallRules = state.firewallRules?.[zoneId] || []

  const [showPurgeConfirmModal, setShowPurgeConfirmModal] = useState(false)
  const [purgeSuccess, setPurgeSuccess] = useState(false)

  if (!zone) return <div className="page-content"><p>Zone not found.</p></div>

  function handlePauseToggle() {
    updateZone(zoneId, { paused: !zone.paused })
  }

  function handlePurgeConfirm() {
    setShowPurgeConfirmModal(false)
    updateCachingSettings(zoneId, { last_purge_on: new Date().toISOString() })
    updateZone(zoneId, { stats: { ...zone.stats, bandwidth_saved_percent: 0 } })
    setPurgeSuccess(true)
    setTimeout(() => setPurgeSuccess(false), 3000)
  }

  const sslModeLabels = { off: 'Off', flexible: 'Flexible', full: 'Full', strict: 'Full (Strict)' }
  const bandwidth = analytics?.traffic?.bandwidth

  return (
    <div className="page-content">
      {zone.paused && (
        <div className="zone-paused-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          This zone is paused. Xloudflare is not active for this domain.
        </div>
      )}

      {purgeSuccess && (
        <div className="success-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Cache purged successfully.
        </div>
      )}

      <div className="page-header zone-overview-header">
        <div className="zone-title-row">
          <h1 className="page-title">{zone.name}</h1>
          <div className="zone-badges">
            <PlanBadge plan={zone.plan} />
            <StatusBadge status={zone.status} paused={zone.paused} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${zone.paused ? 'btn-orange' : 'btn-secondary'}`} onClick={handlePauseToggle}>
            {zone.paused ? 'Resume Xloudflare' : 'Pause Xloudflare'}
          </button>
        </div>
      </div>

      {/* Status Cards Row */}
      <div className="overview-status-row">
        <div className="overview-status-card card accent-card">
          <div className="overview-status-icon" style={{ color: zone.status === 'active' && !zone.paused ? 'var(--cf-success)' : 'var(--cf-warning)' }}>
            {zone.status === 'active' && !zone.paused ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
          </div>
          <div>
            <div className="overview-status-label">Status</div>
            <div className="overview-status-value">{zone.paused ? 'Paused' : zone.status === 'active' ? 'Active' : 'Pending'}</div>
          </div>
        </div>

        <div className="overview-status-card card">
          <div className="overview-status-icon" style={{ color: sslSettings.certificate_status === 'active' ? 'var(--cf-success)' : 'var(--cf-warning)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <div className="overview-status-label">SSL/TLS</div>
            <div className="overview-status-value">{sslModeLabels[sslSettings.mode] || 'Flexible'}</div>
            <div className="overview-status-sub">{sslSettings.certificate_status === 'active' ? 'Certificate Active' : 'Pending Validation'}</div>
          </div>
        </div>

        <div className="overview-status-card card">
          <div className="overview-status-icon" style={{ color: 'var(--cf-blue)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <div>
            <div className="overview-status-label">DNS Records</div>
            <div className="overview-status-value">{dnsRecords.length} records</div>
            <div className="overview-status-sub">{dnsRecords.filter(r => r.proxied).length} proxied</div>
          </div>
        </div>

        <div className="overview-status-card card">
          <div className="overview-status-icon" style={{ color: 'var(--cf-orange)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div className="overview-status-label">Firewall Rules</div>
            <div className="overview-status-value">{firewallRules.length} rules</div>
            <div className="overview-status-sub">{(securitySettings.security_level || 'medium').replace(/_/g, ' ')}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <h2 className="section-title" style={{ marginTop: 28 }}>Quick Stats (Last 24 hours)</h2>
      <div className="stats-row">
        <div className="stat-box card" onClick={() => navigate(`/${zoneId}/analytics/traffic`)} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cf-blue)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="stat-value">{formatNumber(zone.stats.total_requests_24h)}</div>
          <div className="stat-label">Total Requests</div>
        </div>
        <div className="stat-box card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cf-error)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="stat-value">{zone.stats.threats_blocked_24h}</div>
          <div className="stat-label">Threats Blocked</div>
        </div>
        <div className="stat-box card">
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cf-success)" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div className="stat-value">{zone.stats.bandwidth_saved_percent}%</div>
          <div className="stat-label">Bandwidth Saved</div>
        </div>
        <div className="stat-box card" onClick={() => navigate(`/${zoneId}/analytics/traffic`)} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cf-orange)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="stat-value">{formatNumber(analytics?.traffic?.unique_visitors || 0)}</div>
          <div className="stat-label">Unique Visitors</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="section-title" style={{ marginTop: 28 }}>Quick Actions</h2>
      <div className="quick-actions-grid">
        <div className="quick-action-card card">
          <div className="qa-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cf-orange)" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          </div>
          <div className="qa-info">
            <h3 className="qa-title">Purge Cache</h3>
            <p className="qa-desc">Remove cached files so Xloudflare fetches latest content from your origin.</p>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setShowPurgeConfirmModal(true)}>Purge Everything</button>
        </div>

        <div className="quick-action-card card">
          <div className="qa-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cf-orange)" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <div className="qa-info">
            <h3 className="qa-title">Development Mode</h3>
            <p className="qa-desc">Bypass cache for 3 hours so changes are visible immediately.</p>
          </div>
          <Toggle
            checked={cachingSettings.development_mode || false}
            onChange={val => updateCachingSettings(zoneId, { development_mode: val })}
          />
        </div>

        <div className="quick-action-card card">
          <div className="qa-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cf-orange)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="qa-info">
            <h3 className="qa-title">Under Attack Mode</h3>
            <p className="qa-desc">Challenge all visitors with a JS check to mitigate DDoS.</p>
          </div>
          <Toggle
            checked={securitySettings.security_level === 'under_attack'}
            onChange={val => updateSecuritySettings(zoneId, { security_level: val ? 'under_attack' : 'medium' })}
          />
        </div>

        <div className="quick-action-card card">
          <div className="qa-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cf-orange)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="qa-info">
            <h3 className="qa-title">Always Use HTTPS</h3>
            <p className="qa-desc">Redirect all HTTP visitors to HTTPS for improved security.</p>
          </div>
          <Toggle
            checked={sslSettings.always_use_https || false}
            onChange={val => updateSslSettings(zoneId, { always_use_https: val })}
          />
        </div>
      </div>

      {/* Domain Summary */}
      <h2 className="section-title" style={{ marginTop: 28 }}>Domain Summary</h2>
      <div className="card">
        <div className="card-body">
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">Nameservers</div>
              <div className="summary-value">
                {zone.name_servers.map(ns => (
                  <div key={ns} className="monospace" style={{ fontSize: 13 }}>{ns}</div>
                ))}
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-label">SSL/TLS Mode</div>
              <div className="summary-value">
                <span style={{ textTransform: 'capitalize' }}>{sslModeLabels[sslSettings.mode] || 'Flexible'}</span>
                <button className="link-btn" style={{ marginLeft: 8 }} onClick={() => navigate(`/${zoneId}/ssl-tls`)}>Configure</button>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Security Level</div>
              <div className="summary-value" style={{ textTransform: 'capitalize' }}>
                {(securitySettings.security_level || 'medium').replace(/_/g, ' ')}
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Plan</div>
              <div className="summary-value">{zone.plan.name} {zone.plan.price > 0 && <span className="text-muted">- ${zone.plan.price}/{zone.plan.frequency}</span>}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Created</div>
              <div className="summary-value">{new Date(zone.created_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Bandwidth (24h)</div>
              <div className="summary-value">{bandwidth ? formatBytes(bandwidth.total) : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <h2 className="section-title" style={{ marginTop: 28 }}>Recent Activity</h2>
      <div className="card" style={{ overflow: 'hidden' }}>
        {state.notifications.filter(n => n.zone_name === zone.name).length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--cf-text-muted)', fontSize: 14 }}>
            No recent activity for this zone.
          </div>
        ) : (
          state.notifications.filter(n => n.zone_name === zone.name).slice(0, 5).map((n, idx, arr) => (
            <div key={n.id} className="activity-item" style={{ borderBottom: idx < arr.length - 1 ? '1px solid var(--cf-border-light)' : 'none' }}>
              <div className={`activity-dot activity-dot-${n.type}`} />
              <div className="activity-info">
                <div className="activity-title">{n.title}</div>
                <div className="activity-msg">{n.message}</div>
              </div>
              <div className="activity-time">{getTimeAgo(n.created_on)}</div>
            </div>
          ))
        )}
      </div>

      {/* Purge Confirm Modal */}
      {showPurgeConfirmModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Purge Everything</h2>
              <button className="btn-icon" onClick={() => setShowPurgeConfirmModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--cf-text-secondary)', fontSize: 14 }}>
                Are you sure you want to purge <strong>ALL</strong> cached files for <strong>{zone.name}</strong>?
                This may temporarily slow your site while files are re-cached.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPurgeConfirmModal(false)}>Cancel</button>
              <button className="btn btn-danger-solid" onClick={handlePurgeConfirm}>Purge Everything</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
