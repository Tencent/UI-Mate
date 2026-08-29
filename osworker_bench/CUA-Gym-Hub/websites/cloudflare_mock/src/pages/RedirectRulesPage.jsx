import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function RedirectRulesPage() {
  const { zoneId } = useParams()
  const { getZone, updateState, state } = useApp()
  const zone = getZone(zoneId)
  const rules = state.redirectRules?.[zoneId] || []
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', source: '', target: '', statusCode: '301', preserveQuery: true })

  if (!zone) return <div className="page-content"><p>Zone not found</p></div>

  const addRule = (e) => {
    e.preventDefault()
    if (!form.source || !form.target) return
    const rule = { id: `rr-${Date.now()}`, ...form, statusCode: Number(form.statusCode), enabled: true, createdAt: new Date().toISOString() }
    updateState(prev => ({
      ...prev,
      redirectRules: { ...prev.redirectRules, [zoneId]: [...(prev.redirectRules?.[zoneId] || []), rule] }
    }))
    setForm({ name: '', source: '', target: '', statusCode: '301', preserveQuery: true })
    setShowAdd(false)
  }

  const toggleRule = (ruleId) => {
    updateState(prev => ({
      ...prev,
      redirectRules: { ...prev.redirectRules, [zoneId]: (prev.redirectRules?.[zoneId] || []).map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r) }
    }))
  }

  const deleteRule = (ruleId) => {
    updateState(prev => ({
      ...prev,
      redirectRules: { ...prev.redirectRules, [zoneId]: (prev.redirectRules?.[zoneId] || []).filter(r => r.id !== ruleId) }
    }))
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Redirect Rules</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Create Rule</button>
      </div>

      <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', marginBottom: 16 }}>Redirect incoming requests to a different URL using dynamic or static redirects. Rules are evaluated in order.</p>

      {showAdd && (
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>New Redirect Rule</h3>
          <form onSubmit={addRule}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Rule Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My redirect rule" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Source URL</label>
                <input className="form-input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder={`${zone.name}/old-path/*`} required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Target URL</label>
                <input className="form-input" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="https://newsite.com/$1" required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Status Code</label>
                <select className="form-input" value={form.statusCode} onChange={e => setForm(f => ({ ...f, statusCode: e.target.value }))}>
                  <option value="301">301 - Permanent Redirect</option>
                  <option value="302">302 - Temporary Redirect</option>
                  <option value="307">307 - Temporary Redirect (preserve method)</option>
                  <option value="308">308 - Permanent Redirect (preserve method)</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.preserveQuery} onChange={e => setForm(f => ({ ...f, preserveQuery: e.target.checked }))} />
                Preserve query string
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {rules.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--cf-text-muted)', fontSize: 13 }}>No redirect rules configured. Click "Create Rule" to add one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cf-border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Source</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Target</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Enabled</th>
                <th style={{ padding: '10px 14px', width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id} style={{ borderBottom: '1px solid var(--cf-border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{rule.name || '(unnamed)'}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--cf-mono)', fontSize: 12 }}>{rule.source}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--cf-mono)', fontSize: 12 }}>{rule.target}</td>
                  <td style={{ padding: '10px 14px' }}>{rule.statusCode}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <label className="toggle-switch" style={{ transform: 'scale(0.8)' }}>
                      <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button className="btn-icon-only" style={{ color: 'var(--cf-red)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 18 }} onClick={() => deleteRule(rule.id)} title="Delete">&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
