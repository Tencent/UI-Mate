import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function TransformRulesPage() {
  const { zoneId } = useParams()
  const { getZone, updateState, state } = useApp()
  const zone = getZone(zoneId)
  const rules = state.transformRules?.[zoneId] || []
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState('request')
  const [form, setForm] = useState({ name: '', type: 'request_header', action: 'set', headerName: '', headerValue: '', expression: '' })

  if (!zone) return <div className="page-content"><p>Zone not found</p></div>

  const addRule = (e) => {
    e.preventDefault()
    if (!form.headerName) return
    const rule = { id: `tr-${Date.now()}`, ...form, enabled: true, createdAt: new Date().toISOString() }
    updateState(prev => ({
      ...prev,
      transformRules: { ...prev.transformRules, [zoneId]: [...(prev.transformRules?.[zoneId] || []), rule] }
    }))
    setForm({ name: '', type: 'request_header', action: 'set', headerName: '', headerValue: '', expression: '' })
    setShowAdd(false)
  }

  const toggleRule = (ruleId) => {
    updateState(prev => ({
      ...prev,
      transformRules: { ...prev.transformRules, [zoneId]: (prev.transformRules?.[zoneId] || []).map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r) }
    }))
  }

  const deleteRule = (ruleId) => {
    updateState(prev => ({
      ...prev,
      transformRules: { ...prev.transformRules, [zoneId]: (prev.transformRules?.[zoneId] || []).filter(r => r.id !== ruleId) }
    }))
  }

  const tabRules = rules.filter(r => tab === 'request' ? r.type.startsWith('request') : r.type.startsWith('response'))

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Transform Rules</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Create Rule</button>
      </div>

      <p style={{ fontSize: 13, color: 'var(--cf-text-secondary)', marginBottom: 16 }}>Modify HTTP request and response headers before they reach your origin or are sent to the client.</p>

      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--cf-border)' }}>
        {['request', 'response'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? 'var(--cf-blue)' : 'var(--cf-text-secondary)', borderBottom: tab === t ? '2px solid var(--cf-blue)' : '2px solid transparent', marginBottom: -1, textTransform: 'capitalize' }}>
            {t} Header Modification
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>New Transform Rule</h3>
          <form onSubmit={addRule}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Rule Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Add security headers" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Type</label>
                <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="request_header">Request Header Modification</option>
                  <option value="response_header">Response Header Modification</option>
                  <option value="request_url_rewrite">URL Rewrite</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Action</label>
                <select className="form-input" value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}>
                  <option value="set">Set</option>
                  <option value="add">Add</option>
                  <option value="remove">Remove</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Header Name</label>
                <input className="form-input" value={form.headerName} onChange={e => setForm(f => ({ ...f, headerName: e.target.value }))} placeholder="X-Custom-Header" required />
              </div>
              {form.action !== 'remove' && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Header Value</label>
                  <input className="form-input" value={form.headerValue} onChange={e => setForm(f => ({ ...f, headerValue: e.target.value }))} placeholder="value" />
                </div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, display: 'block', marginBottom: 4 }}>Expression (optional)</label>
              <input className="form-input" value={form.expression} onChange={e => setForm(f => ({ ...f, expression: e.target.value }))} placeholder='(http.request.uri.path eq "/api")' />
              <div style={{ fontSize: 11, color: 'var(--cf-text-muted)', marginTop: 4 }}>Leave empty to apply to all requests</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {tabRules.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--cf-text-muted)', fontSize: 13 }}>No {tab} header transform rules configured. Click "Create Rule" to add one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cf-border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Action</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Header</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Value</th>
                <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, fontSize: 12 }}>Enabled</th>
                <th style={{ padding: '10px 14px', width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {tabRules.map(rule => (
                <tr key={rule.id} style={{ borderBottom: '1px solid var(--cf-border)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{rule.name || '(unnamed)'}</td>
                  <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{rule.action}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--cf-mono)', fontSize: 12 }}>{rule.headerName}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'var(--cf-mono)', fontSize: 12 }}>{rule.headerValue || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <label className="toggle-switch" style={{ transform: 'scale(0.8)' }}>
                      <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button style={{ color: 'var(--cf-red)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 18 }} onClick={() => deleteRule(rule.id)} title="Delete">&times;</button>
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
