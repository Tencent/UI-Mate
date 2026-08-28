import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const SSL_MODES = [
  {
    id: 'off',
    label: 'Off (not secure)',
    desc: 'No encryption applied. HTTP only.',
    color: '#D63B23'
  },
  {
    id: 'flexible',
    label: 'Flexible',
    desc: 'Encrypts traffic between the browser and Xloudflare only.',
    color: '#FBAD41'
  },
  {
    id: 'full',
    label: 'Full',
    desc: 'Encrypts end-to-end, using a self-signed certificate on the server.',
    color: '#068D45'
  },
  {
    id: 'strict',
    label: 'Full (strict)',
    desc: 'Encrypts end-to-end, requires a trusted CA or Xloudflare Origin CA certificate.',
    color: '#0051C3'
  }
]

export default function SslTlsPage() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const { state, updateSslSettings } = useApp()
  const ssl = state.sslSettings?.[zoneId] || {}

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">SSL/TLS</h1>
        <p className="page-subtitle">Manage your SSL/TLS encryption settings</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Your SSL/TLS encryption mode</h2>
        </div>
        <div className="card-body">
          <p style={{ color: 'var(--cf-text-secondary)', marginBottom: 20, fontSize: 14 }}>
            Select the SSL mode that matches your server's certificate configuration.
          </p>
          <div className="ssl-mode-grid">
            {SSL_MODES.map(mode => (
              <label
                key={mode.id}
                className={`ssl-mode-card ${ssl.mode === mode.id ? 'selected' : ''}`}
                onClick={() => updateSslSettings(zoneId, { mode: mode.id })}
              >
                <div className="ssl-mode-radio">
                  <input
                    type="radio"
                    name="ssl-mode"
                    value={mode.id}
                    checked={ssl.mode === mode.id}
                    onChange={() => updateSslSettings(zoneId, { mode: mode.id })}
                  />
                </div>
                <div className="ssl-mode-icon" style={{ color: mode.color }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={mode.color} strokeWidth="2">
                    {mode.id === 'off'
                      ? <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/><line x1="12" y1="15" x2="12" y2="17"/></>
                      : <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill={ssl.mode === mode.id ? mode.color : 'none'} fillOpacity="0.1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>
                    }
                  </svg>
                </div>
                <div className="ssl-mode-info">
                  <div className="ssl-mode-label">{mode.label}</div>
                  <div className="ssl-mode-desc">{mode.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Visual diagram */}
          <div className="ssl-diagram">
            <div className="ssl-diagram-node">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
              <span>Browser</span>
            </div>
            <div className="ssl-diagram-line">
              {ssl.mode !== 'off' ? (
                <span className="ssl-diagram-lock">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cf-success)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  HTTPS
                </span>
              ) : (
                <span className="ssl-diagram-unlock">HTTP</span>
              )}
            </div>
            <div className="ssl-diagram-node">
              <svg width="32" height="32" viewBox="0 0 100 68" fill="none"><path d="M81.1 47.3c.2-.8.3-1.6.3-2.5 0-7.4-6-13.4-13.4-13.4-.7 0-1.4.1-2.1.2-1.6-5.7-6.9-9.9-13.1-9.9-7.6 0-13.8 6.2-13.8 13.8 0 .5 0 1 .1 1.5-4.6.6-8.1 4.5-8.1 9.3 0 5.2 4.2 9.4 9.4 9.4h39.9c4.2 0 7.6-3.4 7.6-7.6 0-3.6-2.5-6.6-5.8-7.4-.3.2-.6.4-1 .6z" fill="#F6821F"/></svg>
              <span>Xloudflare</span>
            </div>
            <div className="ssl-diagram-line">
              {ssl.mode === 'full' || ssl.mode === 'strict' ? (
                <span className="ssl-diagram-lock">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cf-success)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  HTTPS
                </span>
              ) : (
                <span className="ssl-diagram-unlock">HTTP</span>
              )}
            </div>
            <div className="ssl-diagram-node">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 10h20"/><path d="M10 2v20"/></svg>
              <span>Origin Server</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Edge Certificates</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/${zoneId}/ssl-tls/edge-certificates`)}>
            View all
          </button>
        </div>
        <div className="card-body">
          <p style={{ color: 'var(--cf-text-secondary)', fontSize: 14 }}>
            Xloudflare automatically provisions a Universal SSL certificate for your zone.{' '}
            <button className="link-btn" onClick={() => navigate(`/${zoneId}/ssl-tls/edge-certificates`)}>
              Manage edge certificates →
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .ssl-mode-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (max-width: 900px) {
          .ssl-mode-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .ssl-mode-card {
          border: 2px solid var(--cf-border);
          border-radius: var(--cf-radius);
          padding: 16px;
          cursor: pointer;
          transition: border-color 0.15s;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ssl-mode-card:hover { border-color: var(--cf-orange); }
        .ssl-mode-card.selected { border-color: var(--cf-orange); background: var(--cf-orange-light); }
        .ssl-mode-radio { display: flex; }
        .ssl-mode-icon { display: flex; }
        .ssl-mode-label { font-size: 14px; font-weight: 600; color: var(--cf-text-primary); }
        .ssl-mode-desc { font-size: 12px; color: var(--cf-text-secondary); line-height: 1.4; margin-top: 2px; }
        .ssl-diagram {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          background: var(--cf-bg-secondary);
          border-radius: var(--cf-radius);
          flex-wrap: wrap;
        }
        .ssl-diagram-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--cf-text-secondary);
        }
        .ssl-diagram-line {
          flex: 1;
          min-width: 80px;
          height: 2px;
          background: var(--cf-border);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ssl-diagram-lock, .ssl-diagram-unlock {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          background: white;
          padding: 2px 6px;
          border-radius: 99px;
          border: 1px solid var(--cf-border);
        }
        .ssl-diagram-lock { color: var(--cf-success); }
        .ssl-diagram-unlock { color: var(--cf-error); }
      `}</style>
    </div>
  )
}
