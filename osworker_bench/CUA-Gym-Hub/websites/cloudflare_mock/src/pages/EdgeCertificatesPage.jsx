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

function CertDetailsModal({ cert, onClose }) {
  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title">Certificate Details</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <table className="cf-table">
            <tbody>
              <tr><td style={{ fontWeight: 500, width: 140 }}>Certificate ID</td><td className="monospace" style={{ fontSize: 13 }}>{cert.id}</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Hosts</td><td className="monospace" style={{ fontSize: 13 }}>{cert.hosts?.join(', ')}</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Type</td><td style={{ textTransform: 'capitalize' }}>{cert.type}</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Issuer</td><td>{cert.issuer || 'Xloudflare, Inc.'}</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Status</td><td><span className={`badge ${cert.status === 'active' ? 'badge-active' : 'badge-pending'}`}>{cert.status === 'active' ? 'Active' : 'Pending'}</span></td></tr>
              <tr><td style={{ fontWeight: 500 }}>Expires</td><td>{formatDate(cert.expires_on)}</td></tr>
              {cert.signature_hash && <tr><td style={{ fontWeight: 500 }}>Signature</td><td className="monospace" style={{ fontSize: 13 }}>{cert.signature_hash}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function EdgeCertificatesPage() {
  const { zoneId } = useParams()
  const { state, updateSslSettings } = useApp()
  const ssl = state.sslSettings?.[zoneId] || {}
  const certs = ssl.edge_certificates || []
  const [selectedCert, setSelectedCert] = useState(null)

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Edge Certificates</h1>
        <p className="page-subtitle">Certificates served to your visitors by Xloudflare</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="table-wrapper">
          <table className="cf-table">
            <thead>
              <tr>
                <th>Hosts</th>
                <th>Type</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certs.map(cert => (
                <tr key={cert.id}>
                  <td className="monospace" style={{ fontSize: 13 }}>{cert.hosts?.join(', ')}</td>
                  <td style={{ textTransform: 'capitalize' }}>{cert.type}</td>
                  <td>
                    <span className={`badge ${cert.status === 'active' ? 'badge-active' : 'badge-pending'}`}>
                      {cert.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td>{formatDate(cert.expires_on)}</td>
                  <td><button className="link-btn" onClick={() => setSelectedCert(cert)}>Details</button></td>
                </tr>
              ))}
              {certs.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--cf-text-muted)' }}>No certificates</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toggle settings */}
      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Always Use HTTPS</h3>
          <p className="module-card-desc">Redirect all visitors from http to https. This applies to all http requests to the zone.</p>
        </div>
        <Toggle checked={ssl.always_use_https || false} onChange={v => updateSslSettings(zoneId, { always_use_https: v })} />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Automatic HTTPS Rewrites</h3>
          <p className="module-card-desc">Fix mixed-content issues by automatically rewriting insecure links to use HTTPS.</p>
        </div>
        <Toggle checked={ssl.automatic_https_rewrites || false} onChange={v => updateSslSettings(zoneId, { automatic_https_rewrites: v })} />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Minimum TLS Version</h3>
          <p className="module-card-desc">Only allow HTTPS connections from visitors that support the selected TLS protocol version or higher.</p>
        </div>
        <select
          className="form-select"
          value={ssl.min_tls_version || '1.0'}
          onChange={e => updateSslSettings(zoneId, { min_tls_version: e.target.value })}
        >
          <option value="1.0">TLS 1.0</option>
          <option value="1.1">TLS 1.1</option>
          <option value="1.2">TLS 1.2</option>
          <option value="1.3">TLS 1.3</option>
        </select>
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">TLS 1.3</h3>
          <p className="module-card-desc">Enable the latest version of the TLS protocol for improved security and performance.</p>
        </div>
        <Toggle checked={ssl.tls_1_3 === 'on'} onChange={v => updateSslSettings(zoneId, { tls_1_3: v ? 'on' : 'off' })} />
      </div>

      {selectedCert && (
        <CertDetailsModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  )
}

