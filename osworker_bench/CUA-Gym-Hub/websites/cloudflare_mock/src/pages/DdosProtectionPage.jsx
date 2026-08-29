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

const SENSITIVITY_LEVELS = [
  { id: 'low', label: 'Low', desc: 'Only mitigate highly suspicious traffic.' },
  { id: 'medium', label: 'Medium', desc: 'Balanced detection and mitigation.' },
  { id: 'high', label: 'High', desc: 'Aggressively mitigate suspected DDoS traffic.' },
]

export default function DdosProtectionPage() {
  const { zoneId } = useParams()
  const { getZone, updateSecuritySettings, state } = useApp()
  const zone = getZone(zoneId)
  const settings = state.securitySettings?.[zoneId] || {}
  const [sensitivity, setSensitivity] = useState(settings.ddos_sensitivity || 'medium')
  const [httpFloodEnabled, setHttpFloodEnabled] = useState(settings.ddos_http_flood !== false)
  const [l3l4Enabled, setL3L4Enabled] = useState(settings.ddos_l3l4 !== false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (!zone) return <div className="page-content"><p>Zone not found</p></div>

  const flash = () => { setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000) }

  const save = (changes) => {
    updateSecuritySettings(zoneId, changes)
    flash()
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">DDoS Protection</h1>
      </div>

      {showSuccess && <div className="card" style={{ padding: '10px 16px', background: '#e8f5e9', color: '#2e7d32', marginBottom: 16, fontSize: 13 }}>Settings updated successfully.</div>}

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>HTTP DDoS Attack Protection</h3>
        <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', marginBottom: 16 }}>Automatically detects and mitigates HTTP-based DDoS attacks targeting your website.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>Enabled</span>
          <Toggle checked={httpFloodEnabled} onChange={(v) => { setHttpFloodEnabled(v); save({ ddos_http_flood: v }) }} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Sensitivity Level</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {SENSITIVITY_LEVELS.map(s => (
              <button key={s.id} onClick={() => { setSensitivity(s.id); save({ ddos_sensitivity: s.id }) }}
                className={`form-input ${sensitivity === s.id ? 'selected' : ''}`}
                style={{ padding: '10px 16px', cursor: 'pointer', border: sensitivity === s.id ? '2px solid var(--cf-blue)' : '1px solid var(--cf-border)', borderRadius: 8, background: sensitivity === s.id ? 'rgba(45,114,210,0.05)' : 'transparent', flex: 1, textAlign: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--cf-text-muted)' }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Network-layer (L3/L4) DDoS Protection</h3>
        <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', marginBottom: 16 }}>Protects your origin from volumetric attacks at the network and transport layers.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 500, fontSize: 14 }}>Enabled</span>
          <Toggle checked={l3l4Enabled} onChange={(v) => { setL3L4Enabled(v); save({ ddos_l3l4: v }) }} />
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>Recent DDoS Events</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--cf-border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 12 }}>Time</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 12 }}>Type</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 12 }}>Peak Rate</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 12 }}>Duration</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 12 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--cf-border)' }}>
              <td style={{ padding: '8px 12px' }}>2 days ago</td>
              <td style={{ padding: '8px 12px' }}>HTTP Flood</td>
              <td style={{ padding: '8px 12px' }}>12,400 rps</td>
              <td style={{ padding: '8px 12px' }}>8 min</td>
              <td style={{ padding: '8px 12px' }}><span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, background: '#e8f5e9', color: '#2e7d32' }}>Mitigated</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--cf-border)' }}>
              <td style={{ padding: '8px 12px' }}>5 days ago</td>
              <td style={{ padding: '8px 12px' }}>SYN Flood</td>
              <td style={{ padding: '8px 12px' }}>45 Gbps</td>
              <td style={{ padding: '8px 12px' }}>23 min</td>
              <td style={{ padding: '8px 12px' }}><span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, background: '#e8f5e9', color: '#2e7d32' }}>Mitigated</span></td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px' }}>12 days ago</td>
              <td style={{ padding: '8px 12px' }}>UDP Flood</td>
              <td style={{ padding: '8px 12px' }}>18 Gbps</td>
              <td style={{ padding: '8px 12px' }}>5 min</td>
              <td style={{ padding: '8px 12px' }}><span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, background: '#e8f5e9', color: '#2e7d32' }}>Mitigated</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
