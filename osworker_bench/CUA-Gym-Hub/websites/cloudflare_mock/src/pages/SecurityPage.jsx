import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}

const SECURITY_LEVELS = [
  { id: 'essentially_off', label: 'Essentially Off', desc: 'Only challenges IPs with serious threats.' },
  { id: 'low', label: 'Low', desc: 'Challenges only the most threatening IPs.' },
  { id: 'medium', label: 'Medium', desc: 'Challenges IPs that pose a moderate threat. Recommended.' },
  { id: 'high', label: 'High', desc: 'Challenges all IPs with a threat score above 0.' },
  { id: 'under_attack', label: "I'm Under Attack!", desc: 'CAUTION: Presents a JavaScript challenge to all visitors.' }
]

const CHALLENGE_TTL_OPTIONS = [
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '2 hours', value: 7200 },
  { label: '1 day', value: 86400 }
]

export default function SecurityPage({ tab }) {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const { state, updateSecuritySettings } = useApp()
  const security = state.securitySettings?.[zoneId] || {}
  const firewallRules = state.firewallRules?.[zoneId] || []
  const ipRules = security.ip_access_rules || []

  const currentLevel = SECURITY_LEVELS.find(l => l.id === security.security_level) || SECURITY_LEVELS[2]

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Security</h1>
        <p className="page-subtitle">Configure security settings for your zone</p>
      </div>

      {/* Security Level */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Security Level</h2>
        </div>
        <div className="card-body">
          <p style={{ marginBottom: 16, color: 'var(--cf-text-secondary)', fontSize: 14 }}>
            Adjust the sensitivity of Xloudflare's security features. Current: <strong>{currentLevel.label}</strong>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SECURITY_LEVELS.map(l => (
              <label
                key={l.id}
                style={{
                  display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start',
                  padding: '10px 14px', borderRadius: 6,
                  border: `2px solid ${security.security_level === l.id ? 'var(--cf-orange)' : 'var(--cf-border)'}`,
                  background: security.security_level === l.id ? 'var(--cf-orange-light)' : 'white',
                  transition: 'border-color 0.15s, background 0.15s'
                }}
              >
                <input
                  type="radio"
                  name="security-level"
                  checked={security.security_level === l.id}
                  onChange={() => updateSecuritySettings(zoneId, { security_level: l.id })}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: l.id === 'under_attack' ? 'var(--cf-error)' : 'var(--cf-text-primary)' }}>
                    {l.label}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--cf-text-secondary)' }}>{l.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Security Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate(`/${zoneId}/security/waf`)}>
          <div style={{ fontSize: 12, color: 'var(--cf-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Firewall Rules</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--cf-text-primary)' }}>{firewallRules.length}</div>
          <div style={{ fontSize: 12, color: 'var(--cf-text-secondary)' }}>{firewallRules.filter(r => !r.paused).length} active</div>
        </div>
        <div className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => navigate(`/${zoneId}/security/waf`)}>
          <div style={{ fontSize: 12, color: 'var(--cf-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>IP Access Rules</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--cf-text-primary)' }}>{ipRules.length}</div>
          <div style={{ fontSize: 12, color: 'var(--cf-text-secondary)' }}>{ipRules.filter(r => r.mode === 'block').length} blocked</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--cf-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>WAF Status</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: security.waf_enabled ? 'var(--cf-success)' : 'var(--cf-text-muted)' }}>
            {security.waf_enabled ? 'On' : 'Off'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--cf-text-secondary)' }}>
            {security.waf_enabled ? 'Protecting your site' : 'Not active'}
          </div>
        </div>
      </div>

      {/* Challenge Passage */}
      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Challenge Passage</h3>
          <p className="module-card-desc">How long a visitor can access your site after completing a challenge. After this time they'll have to complete another challenge.</p>
        </div>
        <select
          className="form-select"
          value={security.challenge_ttl || 1800}
          onChange={e => updateSecuritySettings(zoneId, { challenge_ttl: parseInt(e.target.value) })}
        >
          {CHALLENGE_TTL_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Browser Integrity Check</h3>
          <p className="module-card-desc">Evaluate HTTP headers from your visitors browser for threats. If a threat is found, a block page will be delivered.</p>
        </div>
        <Toggle
          checked={security.browser_integrity_check || false}
          onChange={v => updateSecuritySettings(zoneId, { browser_integrity_check: v })}
        />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Bot Fight Mode</h3>
          <p className="module-card-desc">Detects and challenges bot traffic automatically. Helps protect your site from automated attacks and scraping.</p>
        </div>
        <Toggle
          checked={security.bot_fight_mode || false}
          onChange={v => updateSecuritySettings(zoneId, { bot_fight_mode: v })}
        />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">WAF (Web Application Firewall)</h3>
          <p className="module-card-desc">
            The WAF examines incoming traffic and filters out illegitimate traffic. Manage rules in the{' '}
            <button className="link-btn" onClick={() => navigate(`/${zoneId}/security/waf`)}>WAF settings</button>.
          </p>
        </div>
        <Toggle
          checked={security.waf_enabled || false}
          onChange={v => updateSecuritySettings(zoneId, { waf_enabled: v })}
        />
      </div>
    </div>
  )
}
