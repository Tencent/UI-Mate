import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const ACTION_COLORS = {
  block: 'badge-block',
  allow: 'badge-allow',
  challenge: 'badge-challenge',
  js_challenge: 'badge-js-challenge',
  managed_challenge: 'badge-js-challenge',
  log: 'badge-free'
}

const EXPRESSION_FIELDS = [
  { value: 'ip.src', label: 'IP Source Address', type: 'ip' },
  { value: 'ip.geoip.country', label: 'Country', type: 'string' },
  { value: 'ip.geoip.continent', label: 'Continent', type: 'string' },
  { value: 'ip.geoip.asnum', label: 'AS Number', type: 'number' },
  { value: 'http.request.uri.path', label: 'URI Path', type: 'string' },
  { value: 'http.request.uri', label: 'URI', type: 'string' },
  { value: 'http.request.method', label: 'Request Method', type: 'string' },
  { value: 'http.host', label: 'Hostname', type: 'string' },
  { value: 'http.user_agent', label: 'User Agent', type: 'string' },
  { value: 'http.referer', label: 'Referer', type: 'string' },
  { value: 'cf.client.bot', label: 'Known Bot', type: 'boolean' },
  { value: 'cf.threat_score', label: 'Threat Score', type: 'number' },
  { value: 'ssl', label: 'SSL/HTTPS', type: 'boolean' },
  { value: 'http.request.version', label: 'HTTP Version', type: 'string' },
]

const OPERATORS = {
  string: [
    { value: 'eq', label: 'equals' },
    { value: 'ne', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'matches', label: 'matches regex' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
  ],
  ip: [
    { value: 'eq', label: 'equals' },
    { value: 'ne', label: 'does not equal' },
    { value: 'in', label: 'is in' },
  ],
  number: [
    { value: 'eq', label: 'equals' },
    { value: 'ne', label: 'does not equal' },
    { value: 'gt', label: 'greater than' },
    { value: 'ge', label: 'greater or equal' },
    { value: 'lt', label: 'less than' },
    { value: 'le', label: 'less or equal' },
  ],
  boolean: [
    { value: 'eq', label: 'equals' },
  ],
}

function ExpressionBuilder({ expression, onChange }) {
  const [mode, setMode] = useState('visual') // 'visual' | 'editor'
  const [conditions, setConditions] = useState([{ field: 'ip.src', operator: 'eq', value: '' }])

  function buildExpression(conds) {
    return conds.map(c => {
      const fieldDef = EXPRESSION_FIELDS.find(f => f.value === c.field)
      if (fieldDef?.type === 'boolean') {
        return c.value === 'true' ? `(${c.field})` : `(not ${c.field})`
      }
      if (c.operator === 'in') {
        return `(${c.field} in {${c.value}})`
      }
      if (c.operator === 'contains') {
        return `(${c.field} contains "${c.value}")`
      }
      if (c.operator === 'matches') {
        return `(${c.field} matches "${c.value}")`
      }
      if (c.operator === 'starts_with') {
        return `(starts_with(${c.field}, "${c.value}"))`
      }
      if (c.operator === 'ends_with') {
        return `(ends_with(${c.field}, "${c.value}"))`
      }
      if (fieldDef?.type === 'number') {
        return `(${c.field} ${c.operator} ${c.value})`
      }
      return `(${c.field} ${c.operator} "${c.value}")`
    }).join(' and ')
  }

  function updateCondition(idx, key, value) {
    const next = conditions.map((c, i) => i === idx ? { ...c, [key]: value } : c)
    setConditions(next)
    onChange(buildExpression(next))
  }

  function addCondition() {
    const next = [...conditions, { field: 'ip.src', operator: 'eq', value: '' }]
    setConditions(next)
  }

  function removeCondition(idx) {
    if (conditions.length <= 1) return
    const next = conditions.filter((_, i) => i !== idx)
    setConditions(next)
    onChange(buildExpression(next))
  }

  function getFieldType(fieldValue) {
    return EXPRESSION_FIELDS.find(f => f.value === fieldValue)?.type || 'string'
  }

  return (
    <div className="expression-builder">
      <div style={{ display: 'flex', gap: 0, marginBottom: 10 }}>
        <button
          className={`tab-btn-mini ${mode === 'visual' ? 'active' : ''}`}
          onClick={() => setMode('visual')}
          type="button"
        >
          Expression Builder
        </button>
        <button
          className={`tab-btn-mini ${mode === 'editor' ? 'active' : ''}`}
          onClick={() => setMode('editor')}
          type="button"
        >
          Edit expression
        </button>
      </div>

      {mode === 'visual' ? (
        <div>
          {conditions.map((cond, idx) => {
            const fieldType = getFieldType(cond.field)
            const ops = OPERATORS[fieldType] || OPERATORS.string
            return (
              <div key={idx}>
                {idx > 0 && (
                  <div style={{ padding: '6px 0', fontSize: 12, fontWeight: 600, color: 'var(--cf-orange)' }}>AND</div>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <select
                    className="form-select"
                    value={cond.field}
                    onChange={e => {
                      const newType = getFieldType(e.target.value)
                      const newOps = OPERATORS[newType] || OPERATORS.string
                      updateCondition(idx, 'field', e.target.value)
                      if (!newOps.find(o => o.value === cond.operator)) {
                        updateCondition(idx, 'operator', newOps[0].value)
                      }
                    }}
                    style={{ minWidth: 160 }}
                  >
                    {EXPRESSION_FIELDS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>

                  <select
                    className="form-select"
                    value={cond.operator}
                    onChange={e => updateCondition(idx, 'operator', e.target.value)}
                    style={{ minWidth: 130 }}
                  >
                    {ops.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>

                  {fieldType === 'boolean' ? (
                    <select
                      className="form-select"
                      value={cond.value || 'true'}
                      onChange={e => updateCondition(idx, 'value', e.target.value)}
                      style={{ minWidth: 80 }}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <input
                      className="form-input"
                      value={cond.value}
                      onChange={e => updateCondition(idx, 'value', e.target.value)}
                      placeholder={fieldType === 'ip' ? '192.168.1.0/24' : fieldType === 'number' ? '50' : 'value'}
                      style={{ flex: 1, minWidth: 120 }}
                    />
                  )}

                  {conditions.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => removeCondition(idx)}
                      title="Remove condition"
                      style={{ color: 'var(--cf-error)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          <button
            type="button"
            className="link-btn"
            onClick={addCondition}
            style={{ marginTop: 8, fontSize: 13 }}
          >
            + Add condition
          </button>
        </div>
      ) : (
        <textarea
          className="form-textarea"
          style={{ width: '100%', fontFamily: 'var(--cf-font-mono)', fontSize: 13 }}
          rows={3}
          value={expression}
          onChange={e => onChange(e.target.value)}
          placeholder='(ip.geoip.country eq "CN") or (cf.threat_score gt 50)'
        />
      )}

      {expression && (
        <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--cf-bg-secondary)', borderRadius: 4, fontFamily: 'var(--cf-font-mono)', fontSize: 12, color: 'var(--cf-text-secondary)', wordBreak: 'break-all' }}>
          {expression}
        </div>
      )}

      <style>{`
        .tab-btn-mini {
          padding: 5px 12px;
          background: white;
          border: 1px solid var(--cf-border);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          color: var(--cf-text-secondary);
          font-family: inherit;
        }
        .tab-btn-mini:first-child { border-radius: 4px 0 0 4px; }
        .tab-btn-mini:last-child { border-radius: 0 4px 4px 0; margin-left: -1px; }
        .tab-btn-mini.active {
          background: var(--cf-blue-light);
          color: var(--cf-blue);
          border-color: var(--cf-blue);
          z-index: 1;
          position: relative;
        }
      `}</style>
    </div>
  )
}

function FirewallRuleModal({ rule, onSave, onClose }) {
  const isEdit = !!rule
  const [form, setForm] = useState(rule || {
    description: '',
    action: 'block',
    filter: { expression: '', paused: false },
    paused: false
  })
  const [formErrors, setFormErrors] = useState({})

  function handleSave() {
    const errors = {}
    if (!form.description.trim()) errors.description = 'Rule name is required.'
    if (!form.filter?.expression?.trim()) errors.expression = 'Expression is required.'
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setFormErrors({})
    onSave(form)
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Firewall Rule' : 'Create a Firewall Rule'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Rule name</label>
            <input
              className={`form-input${formErrors.description ? ' form-input-error' : ''}`}
              value={form.description}
              onChange={e => { setForm(f => ({ ...f, description: e.target.value })); if (formErrors.description) setFormErrors(fe => ({ ...fe, description: undefined })) }}
              placeholder="My firewall rule"
            />
            {formErrors.description && <div className="form-error">{formErrors.description}</div>}
          </div>

          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>When incoming requests match...</div>
            <ExpressionBuilder
              expression={form.filter?.expression || ''}
              onChange={expr => { setForm(f => ({ ...f, filter: { ...f.filter, expression: expr } })); if (formErrors.expression) setFormErrors(fe => ({ ...fe, expression: undefined })) }}
            />
            {formErrors.expression && <div className="form-error">{formErrors.expression}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Then...</label>
            <select
              className="form-select"
              value={form.action}
              onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
            >
              <option value="block">Block</option>
              <option value="allow">Allow</option>
              <option value="challenge">Challenge (Captcha)</option>
              <option value="js_challenge">JS Challenge</option>
              <option value="managed_challenge">Managed Challenge</option>
              <option value="log">Log</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {isEdit ? 'Save' : 'Deploy'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WafPage() {
  const { zoneId } = useParams()
  const { getFirewallRules, addFirewallRule, updateFirewallRule, deleteFirewallRule, state, updateSecuritySettings } = useApp()
  const rules = getFirewallRules(zoneId)
  const security = state.securitySettings?.[zoneId] || {}
  const ipRules = security.ip_access_rules || []

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editRule, setEditRule] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [activeTab, setActiveTab] = useState('firewall')

  // IP access rule state
  const [showIpModal, setShowIpModal] = useState(false)
  const [ipForm, setIpForm] = useState({ mode: 'block', value: '', notes: '' })
  const [ipFormError, setIpFormError] = useState('')
  const [deleteIpId, setDeleteIpId] = useState(null)

  const filtered = rules.filter(r => {
    if (search && !r.description.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && (statusFilter === 'active' ? r.paused : !r.paused)) return false
    if (actionFilter !== 'all' && r.action !== actionFilter) return false
    return true
  })

  function handleSave(form) {
    if (editRule) {
      updateFirewallRule(zoneId, editRule.id, {
        description: form.description,
        action: form.action,
        filter: form.filter,
        modified_on: new Date().toISOString()
      })
    } else {
      addFirewallRule(zoneId, {
        id: 'fw_' + Date.now(),
        zone_id: zoneId,
        description: form.description,
        action: form.action,
        filter: { ...form.filter, id: 'filter_' + Date.now() },
        priority: rules.length + 1,
        paused: false,
        created_on: new Date().toISOString(),
        modified_on: new Date().toISOString(),
        activity_last_24h: 0
      })
    }
    setShowModal(false)
    setEditRule(null)
  }

  function handleDelete(ruleId) {
    setDeleteConfirmId(ruleId)
  }

  function confirmDelete() {
    if (deleteConfirmId) {
      deleteFirewallRule(zoneId, deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  function handleAddIpRule() {
    if (!ipForm.value.trim()) { setIpFormError('IP address or CIDR range is required.'); return }
    const newRules = [...ipRules, {
      id: 'ip_' + Date.now(),
      mode: ipForm.mode,
      value: ipForm.value.trim(),
      notes: ipForm.notes.trim(),
      created_on: new Date().toISOString()
    }]
    updateSecuritySettings(zoneId, { ip_access_rules: newRules })
    setShowIpModal(false)
    setIpForm({ mode: 'block', value: '', notes: '' })
    setIpFormError('')
  }

  function handleDeleteIpRule(id) {
    updateSecuritySettings(zoneId, { ip_access_rules: ipRules.filter(r => r.id !== id) })
    setDeleteIpId(null)
  }

  function actionLabel(action) {
    return { block: 'Block', allow: 'Allow', challenge: 'Challenge', js_challenge: 'JS Challenge', managed_challenge: 'Managed Challenge', log: 'Log' }[action] || action
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Web Application Firewall (WAF)</h1>
        <p className="page-subtitle">Protect your application from malicious traffic</p>
      </div>

      {/* WAF Toggle */}
      <div className="module-card" style={{ marginBottom: 20 }}>
        <div className="module-card-info">
          <h3 className="module-card-title">WAF</h3>
          <p className="module-card-desc">The Web Application Firewall (WAF) protects your application from common web vulnerabilities and attack patterns.</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" checked={security.waf_enabled || false} onChange={e => updateSecuritySettings(zoneId, { waf_enabled: e.target.checked })} />
          <span className="toggle-slider" />
        </label>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${activeTab === 'firewall' ? 'active' : ''}`} onClick={() => setActiveTab('firewall')}>Firewall Rules</button>
        <button className={`tab-btn ${activeTab === 'ip' ? 'active' : ''}`} onClick={() => setActiveTab('ip')}>IP Access Rules</button>
      </div>

      {activeTab === 'firewall' && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-input-wrap" style={{ flex: 1, maxWidth: 260 }}>
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                className="form-input search-input"
                placeholder="Search rules..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
            <select className="form-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
              <option value="all">All Actions</option>
              <option value="block">Block</option>
              <option value="allow">Allow</option>
              <option value="challenge">Challenge</option>
              <option value="js_challenge">JS Challenge</option>
            </select>
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={() => { setEditRule(null); setShowModal(true) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create a Firewall Rule
            </button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="cf-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th style={{ width: 120 }}>Action</th>
                    <th>Description / Expression</th>
                    <th style={{ width: 120 }}>Activity (24h)</th>
                    <th style={{ width: 80 }}>Enabled</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rule) => (
                    <tr key={rule.id}>
                      <td style={{ color: 'var(--cf-text-muted)', fontWeight: 500 }}>{rule.priority}</td>
                      <td>
                        <span className={`badge ${ACTION_COLORS[rule.action] || 'badge-free'}`} style={{ textTransform: 'capitalize' }}>
                          {actionLabel(rule.action)}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{rule.description}</div>
                        <div className="monospace" style={{ fontSize: 12, color: 'var(--cf-text-muted)', marginTop: 2 }}>
                          {rule.filter?.expression}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{rule.activity_last_24h}</span>
                        <span style={{ color: 'var(--cf-text-muted)', fontSize: 12 }}> matches</span>
                      </td>
                      <td>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={!rule.paused}
                            onChange={e => updateFirewallRule(zoneId, rule.id, { paused: !e.target.checked })}
                          />
                          <span className="toggle-slider" />
                        </label>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-icon" onClick={() => { setEditRule(rule); setShowModal(true) }} title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(rule.id)} title="Delete" style={{ color: 'var(--cf-error)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--cf-text-muted)' }}>
                        No firewall rules found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'ip' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ color: 'var(--cf-text-secondary)', fontSize: 14, margin: 0 }}>
              Create rules to allow, block, or challenge IP addresses or CIDR ranges.
            </p>
            <button className="btn btn-primary" onClick={() => setShowIpModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add IP Rule
            </button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="cf-table">
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>Action</th>
                    <th>IP Address / CIDR</th>
                    <th>Notes</th>
                    <th style={{ width: 150 }}>Created</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ipRules.map(rule => (
                    <tr key={rule.id}>
                      <td>
                        <span className={`badge ${rule.mode === 'block' ? 'badge-block' : rule.mode === 'allow' ? 'badge-allow' : 'badge-challenge'}`}>
                          {rule.mode.charAt(0).toUpperCase() + rule.mode.slice(1)}
                        </span>
                      </td>
                      <td className="monospace">{rule.value}</td>
                      <td style={{ color: 'var(--cf-text-secondary)' }}>{rule.notes || '--'}</td>
                      <td style={{ fontSize: 13, color: 'var(--cf-text-secondary)' }}>
                        {new Date(rule.created_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        {deleteIpId === rule.id ? (
                          <span style={{ display: 'inline-flex', gap: 6, fontSize: 12 }}>
                            <button className="btn btn-danger btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => handleDeleteIpRule(rule.id)}>Delete</button>
                            <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => setDeleteIpId(null)}>Cancel</button>
                          </span>
                        ) : (
                          <button className="btn-icon" onClick={() => setDeleteIpId(rule.id)} title="Delete" style={{ color: 'var(--cf-error)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {ipRules.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: 32, color: 'var(--cf-text-muted)' }}>
                        No IP access rules configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <FirewallRuleModal
          rule={editRule}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditRule(null) }}
        />
      )}

      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Firewall Rule</h2>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--cf-text-secondary)' }}>
                Are you sure you want to delete this firewall rule? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger-solid" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showIpModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">Add IP Access Rule</h2>
              <button className="btn-icon" onClick={() => { setShowIpModal(false); setIpFormError('') }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Action</label>
                <select className="form-select" value={ipForm.mode} onChange={e => setIpForm(f => ({ ...f, mode: e.target.value }))}>
                  <option value="block">Block</option>
                  <option value="challenge">Challenge</option>
                  <option value="allow">Whitelist</option>
                  <option value="js_challenge">JavaScript Challenge</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">IP Address, IP Range, or CIDR</label>
                <input
                  className={`form-input monospace${ipFormError ? ' form-input-error' : ''}`}
                  value={ipForm.value}
                  onChange={e => { setIpForm(f => ({ ...f, value: e.target.value })); setIpFormError('') }}
                  placeholder="192.168.1.0/24"
                />
                {ipFormError && <div className="form-error">{ipFormError}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input
                  className="form-input"
                  value={ipForm.notes}
                  onChange={e => setIpForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Reason for this rule"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowIpModal(false); setIpFormError('') }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddIpRule}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
