import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const ACTION_SETTINGS = [
  'Always Use HTTPS',
  'Cache Level',
  'Browser Cache TTL',
  'Forwarding URL',
  'Security Level',
  'SSL',
  'Disable Apps',
  'Disable Performance',
  'Email Obfuscation',
  'Server Side Excludes'
]

function PageRuleModal({ rule, zoneName, onSave, onClose }) {
  const isEdit = !!rule
  const [urlPattern, setUrlPattern] = useState(rule?.targets?.[0]?.constraint?.value || '')
  const [setting, setSetting] = useState(rule?.actions?.[0]?.id || 'always_use_https')
  const [settingValue, setSettingValue] = useState(rule?.actions?.[0]?.value || 'on')
  const [urlError, setUrlError] = useState('')

  function handleSave() {
    if (!urlPattern.trim()) { setUrlError('URL pattern is required.'); return }
    onSave({
      targets: [{ target: 'url', constraint: { operator: 'matches', value: urlPattern.trim() } }],
      actions: [{ id: setting.toLowerCase().replace(/ /g, '_'), value: settingValue }],
      status: 'active'
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Page Rule' : `Create a Page Rule for ${zoneName}`}</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">If the URL matches:</label>
            <input
              className="form-input monospace"
              value={urlPattern}
              onChange={e => { setUrlPattern(e.target.value); setUrlError('') }}
              placeholder={`${zoneName}/*`}
            />
            {urlError && <div className="form-error">{urlError}</div>}
            <div className="form-helper">Use * as a wildcard. Example: example.com/images/*</div>
          </div>

          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>Then the settings are:</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="form-select" value={setting} onChange={e => setSetting(e.target.value)}>
                {ACTION_SETTINGS.map(s => (
                  <option key={s} value={s.toLowerCase().replace(/ /g, '_')}>{s}</option>
                ))}
              </select>
              {(setting === 'always_use_https' || setting === 'disable_apps' || setting === 'disable_performance' || setting === 'email_obfuscation' || setting === 'server_side_excludes') ? (
                <select className="form-select" value={settingValue} onChange={e => setSettingValue(e.target.value)}>
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              ) : setting === 'forwarding_url' ? (
                <input className="form-input" placeholder="https://newsite.com/$1" value={settingValue?.url || ''} onChange={e => setSettingValue({ url: e.target.value, status_code: 301 })} style={{ flex: 1 }} />
              ) : (
                <input className="form-input" value={typeof settingValue === 'string' ? settingValue : ''} onChange={e => setSettingValue(e.target.value)} placeholder="Value" style={{ flex: 1 }} />
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-secondary" onClick={() => { handleSave(); }}>Save as Draft</button>
          <button className="btn btn-primary" onClick={handleSave}>Save and Deploy</button>
        </div>
      </div>
    </div>
  )
}

function describeActions(actions) {
  return actions.map(a => {
    const label = a.id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const val = typeof a.value === 'object' ? JSON.stringify(a.value) : a.value
    return `${label}: ${val}`
  }).join(', ')
}

export default function PageRulesPage() {
  const { zoneId } = useParams()
  const { getPageRules, addPageRule, updatePageRule, deletePageRule, getZone, state } = useApp()
  const zone = getZone(zoneId)
  const rules = getPageRules(zoneId)
  const planLimit = state.zones?.find(z => z.id === zoneId)?.meta?.page_rule_quota || 3

  const [showModal, setShowModal] = useState(false)
  const [editRule, setEditRule] = useState(null)
  const [planLimitWarning, setPlanLimitWarning] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  function handleSave(form) {
    if (editRule) {
      updatePageRule(zoneId, editRule.id, { ...form, modified_on: new Date().toISOString() })
    } else {
      if (rules.length >= planLimit) {
        setPlanLimitWarning(true)
        setShowModal(false)
        return
      }
      addPageRule(zoneId, {
        id: 'pr_' + Date.now(),
        zone_id: zoneId,
        ...form,
        priority: rules.length + 1,
        created_on: new Date().toISOString(),
        modified_on: new Date().toISOString()
      })
    }
    setShowModal(false)
    setEditRule(null)
  }

  function handleDelete(ruleId) {
    deletePageRule(zoneId, ruleId)
    setDeleteConfirmId(null)
  }

  function toggleStatus(rule) {
    updatePageRule(zoneId, rule.id, { status: rule.status === 'active' ? 'disabled' : 'active' })
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Page Rules</h1>
          <p className="page-subtitle">{rules.length} of {planLimit} page rules used</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditRule(null); setPlanLimitWarning(false); setShowModal(true) }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Page Rule
        </button>
      </div>

      {planLimitWarning && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: 'var(--cf-warning-bg, #fff8e1)', border: '1px solid var(--cf-warning, #f5a623)', borderRadius: 6, fontSize: 14, color: 'var(--cf-warning-dark, #8a6000)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>You've reached the {planLimit} page rule limit for your plan. Upgrade to add more rules.</span>
          <button className="btn-icon" style={{ marginLeft: 8 }} onClick={() => setPlanLimitWarning(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {rules.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--cf-text-muted)' }}>
            No page rules yet. Create your first rule to control site behavior.
          </div>
        ) : (
          <div>
            {rules.map((rule, idx) => (
              <div key={rule.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px',
                borderBottom: idx < rules.length - 1 ? '1px solid var(--cf-border-light)' : 'none'
              }}>
                <span style={{ color: 'var(--cf-text-muted)', fontWeight: 500, minWidth: 20 }}>{rule.priority}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="monospace" style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>
                    {rule.targets?.[0]?.constraint?.value}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--cf-text-secondary)' }}>
                    {describeActions(rule.actions || [])}
                  </div>
                </div>

                {/* Toggle */}
                <span
                  className={`badge ${rule.status === 'active' ? 'badge-active' : 'badge-paused'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleStatus(rule)}
                >
                  {rule.status === 'active' ? 'On' : 'Off'}
                </span>

                <button className="btn-icon" onClick={() => { setEditRule(rule); setShowModal(true) }} title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                {deleteConfirmId === rule.id ? (
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
                    <button className="btn btn-danger btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => handleDelete(rule.id)}>Delete</button>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                  </span>
                ) : (
                  <button className="btn-icon" onClick={() => setDeleteConfirmId(rule.id)} title="Delete" style={{ color: 'var(--cf-error)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <PageRuleModal
          rule={editRule}
          zoneName={zone?.name}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditRule(null) }}
        />
      )}
    </div>
  )
}
