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

export default function EmailRoutingPage() {
  const { zoneId } = useParams()
  const { getZone, updateState, state } = useApp()
  const zone = getZone(zoneId)
  const emailConfig = state.emailRouting?.[zoneId] || { enabled: false, catchAll: 'drop', routes: [] }
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ source: '', destination: '', action: 'forward' })
  const [showSuccess, setShowSuccess] = useState(false)

  if (!zone) return <div className="page-content"><p>Zone not found</p></div>

  const flash = () => { setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000) }

  const update = (changes) => {
    updateState(prev => ({
      ...prev,
      emailRouting: { ...prev.emailRouting, [zoneId]: { ...emailConfig, ...changes } }
    }))
    flash()
  }

  const addRoute = (e) => {
    e.preventDefault()
    if (!form.source || !form.destination) return
    const route = { id: `er-${Date.now()}`, ...form, enabled: true, createdAt: new Date().toISOString() }
    update({ routes: [...emailConfig.routes, route] })
    setForm({ source: '', destination: '', action: 'forward' })
    setShowAdd(false)
  }

  const toggleRoute = (routeId) => {
    update({ routes: emailConfig.routes.map(r => r.id === routeId ? { ...r, enabled: !r.enabled } : r) })
  }

  const deleteRoute = (routeId) => {
    update({ routes: emailConfig.routes.filter(r => r.id !== routeId) })
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Email Routing</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Create Address</button>
      </div>

      {showSuccess && <div className="card" style={{ padding: '10px 16px', background: '#e8f5e9', color: '#2e7d32', marginBottom: 16, fontSize: 13 }}>Updated successfully.</div>}

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Email Routing</h3>
            <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', margin: 0 }}>Route incoming emails sent to your domain to specific email addresses or workers.</p>
          </div>
          <Toggle checked={emailConfig.enabled} onChange={(v) => update({ enabled: v })} />
        </div>

        {emailConfig.enabled && (
          <div style={{ padding: 16, background: 'var(--cf-bg-secondary)', borderRadius: 8, fontSize: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px 12px' }}>
              <span style={{ fontWeight: 600 }}>Domain:</span><span>{zone.name}</span>
              <span style={{ fontWeight: 600 }}>MX Record:</span><span style={{ fontFamily: 'var(--cf-mono)', fontSize: 12 }}>route1.mx.cloudflare.net</span>
              <span style={{ fontWeight: 600 }}>Status:</span><span style={{ color: 'var(--cf-green)' }}>Active</span>
            </div>
          </div>
        )}
      </div>

      {emailConfig.enabled && (
        <>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600 }}>Catch-all Action</h3>
            <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', marginBottom: 12 }}>What to do with emails sent to addresses that don't match any routing rule.</p>
            <select className="form-input" value={emailConfig.catchAll} onChange={e => update({ catchAll: e.target.value })} style={{ maxWidth: 300 }}>
              <option value="drop">Drop (reject message)</option>
              <option value="forward">Forward to catch-all address</option>
              <option value="worker">Send to Worker</option>
            </select>
          </div>

          {showAdd && (
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>New Email Route</h3>
              <form onSubmit={addRoute}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Custom Address</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input className="form-input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="info" required style={{ borderRadius: '6px 0 0 6px' }} />
                      <span style={{ padding: '7px 12px', background: 'var(--cf-bg-secondary)', border: '1px solid var(--cf-border)', borderLeft: 'none', borderRadius: '0 6px 6px 0', fontSize: 13, color: 'var(--cf-text-secondary)' }}>@{zone.name}</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Destination Address</label>
                    <input className="form-input" type="email" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="you@gmail.com" required />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Action</label>
                  <select className="form-input" value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} style={{ maxWidth: 240 }}>
                    <option value="forward">Forward</option>
                    <option value="worker">Send to Worker</option>
                    <option value="drop">Drop</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--cf-border)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Routing Rules ({emailConfig.routes.length})</h3>
            </div>
            {emailConfig.routes.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--cf-text-muted)', fontSize: 13 }}>No email routes configured. Click "Create Address" to add one.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--cf-border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Custom Address</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Destination</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Action</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Enabled</th>
                    <th style={{ padding: '10px 14px', width: 60 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {emailConfig.routes.map(route => (
                    <tr key={route.id} style={{ borderBottom: '1px solid var(--cf-border)' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--cf-mono)', fontSize: 12 }}>{route.source}@{zone.name}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12 }}>{route.destination}</td>
                      <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{route.action}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <label className="toggle-switch" style={{ transform: 'scale(0.8)' }}>
                          <input type="checkbox" checked={route.enabled} onChange={() => toggleRoute(route.id)} />
                          <span className="toggle-slider" />
                        </label>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button style={{ color: 'var(--cf-red)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 18 }} onClick={() => deleteRoute(route.id)} title="Delete">&times;</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
