import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}

export default function SecuritySettingsPage() {
  const { zoneId } = useParams()
  const { getZone, state, updateSecuritySettings } = useApp()
  const zone = getZone(zoneId)
  const settings = state.securitySettings?.[zoneId] || {}
  const [showSuccess, setShowSuccess] = useState(false)

  if (!zone) return <div className="page-content"><p>Zone not found</p></div>

  const flash = () => { setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000) }

  const toggle = (key) => {
    updateSecuritySettings(zoneId, { [key]: !settings[key] })
    flash()
  }

  const setChallengeTtl = (val) => {
    updateSecuritySettings(zoneId, { challenge_ttl: Number(val) })
    flash()
  }

  const CHALLENGE_TTLS = [
    { label: '5 minutes', value: 300 },
    { label: '15 minutes', value: 900 },
    { label: '30 minutes', value: 1800 },
    { label: '1 hour', value: 3600 },
    { label: '2 hours', value: 7200 },
    { label: '1 day', value: 86400 },
  ]

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Security Settings</h1>
      </div>

      {showSuccess && <div className="card" style={{ padding: '10px 16px', background: '#e8f5e9', color: '#2e7d32', marginBottom: 16, fontSize: 13 }}>Settings updated successfully.</div>}

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Challenge Passage</h3>
        <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', marginBottom: 12 }}>Specify how long a visitor who completed a challenge can access your website.</p>
        <select className="form-input" value={settings.challenge_ttl || 1800} onChange={e => setChallengeTtl(e.target.value)} style={{ maxWidth: 240 }}>
          {CHALLENGE_TTLS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Browser Integrity Check</h3>
            <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', margin: 0 }}>Evaluates incoming HTTP headers against known bad actors. Blocks requests that have commonly abused headers.</p>
          </div>
          <Toggle checked={settings.browser_integrity_check !== false} onChange={() => toggle('browser_integrity_check')} />
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Privacy Pass Support</h3>
            <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', margin: 0 }}>Allow Privacy Pass tokens to bypass challenge pages. Reduces the number of CAPTCHAs shown to legitimate visitors.</p>
          </div>
          <Toggle checked={settings.privacy_pass !== false} onChange={() => toggle('privacy_pass')} />
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Onion Routing</h3>
            <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', margin: 0 }}>Allow legitimate Tor requests to access your site without encountering CAPTCHAs.</p>
          </div>
          <Toggle checked={!!settings.onion_routing} onChange={() => toggle('onion_routing')} />
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Opportunistic Encryption</h3>
            <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', margin: 0 }}>Allows browsers to access HTTP URIs over an encrypted TLS channel, improving performance for HTTP content.</p>
          </div>
          <Toggle checked={!!settings.opportunistic_encryption} onChange={() => toggle('opportunistic_encryption')} />
        </div>
      </div>
    </div>
  )
}
