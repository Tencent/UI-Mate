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

const BROWSER_TTL_OPTIONS = [
  { label: 'Respect Existing Headers', value: 0 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '2 hours', value: 7200 },
  { label: '4 hours', value: 14400 },
  { label: '8 hours', value: 28800 },
  { label: '16 hours', value: 57600 },
  { label: '1 day', value: 86400 },
  { label: '2 days', value: 172800 },
  { label: '3 days', value: 259200 },
  { label: '8 days', value: 691200 },
  { label: '1 month', value: 2592000 },
  { label: '1 year', value: 31536000 }
]

const EDGE_TTL_OPTIONS = [
  { label: '2 hours', value: 7200 },
  { label: '4 hours', value: 14400 },
  { label: '1 day', value: 86400 },
  { label: '2 days', value: 172800 },
  { label: '1 week', value: 604800 },
  { label: '1 month', value: 2592000 },
]

function CacheRuleModal({ rule, zoneName, onSave, onClose }) {
  const isEdit = !!rule
  const [form, setForm] = useState(rule || {
    name: '',
    match_url: '',
    action: 'cache',
    edge_ttl: 86400,
    browser_ttl: 14400,
    bypass_cache: false,
    enabled: true,
  })
  const [errors, setErrors] = useState({})

  function handleSave() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Rule name is required.'
    if (!form.match_url.trim()) errs.match_url = 'URL match pattern is required.'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    onSave(form)
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Cache Rule' : 'Create Cache Rule'}</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Rule Name</label>
            <input
              className={`form-input${errors.name ? ' form-input-error' : ''}`}
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(e2 => ({ ...e2, name: undefined })) }}
              placeholder="Cache static assets"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">When URL matches</label>
            <input
              className={`form-input monospace${errors.match_url ? ' form-input-error' : ''}`}
              value={form.match_url}
              onChange={e => { setForm(f => ({ ...f, match_url: e.target.value })); setErrors(e2 => ({ ...e2, match_url: undefined })) }}
              placeholder={`${zoneName}/assets/*`}
            />
            {errors.match_url && <div className="form-error">{errors.match_url}</div>}
            <div className="form-helper">Use * as a wildcard. Example: example.com/images/*</div>
          </div>

          <div className="form-group">
            <label className="form-label">Cache behavior</label>
            <select
              className="form-select"
              value={form.action}
              onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
            >
              <option value="cache">Cache Everything</option>
              <option value="bypass">Bypass Cache</option>
              <option value="custom">Custom TTL</option>
            </select>
          </div>

          {form.action === 'custom' && (
            <>
              <div className="form-group">
                <label className="form-label">Edge Cache TTL</label>
                <select
                  className="form-select"
                  value={form.edge_ttl}
                  onChange={e => setForm(f => ({ ...f, edge_ttl: parseInt(e.target.value) }))}
                >
                  {EDGE_TTL_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Browser Cache TTL</label>
                <select
                  className="form-select"
                  value={form.browser_ttl}
                  onChange={e => setForm(f => ({ ...f, browser_ttl: parseInt(e.target.value) }))}
                >
                  {BROWSER_TTL_OPTIONS.filter(o => o.value > 0).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{isEdit ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  )
}

export default function CachingConfigPage() {
  const { zoneId } = useParams()
  const { state, updateCachingSettings, getZone } = useApp()
  const caching = state.cachingSettings?.[zoneId] || {}
  const zone = getZone(zoneId)
  const cacheRules = caching.cache_rules || []

  const [showPurgeModal, setShowPurgeModal] = useState(false)
  const [showCustomPurge, setShowCustomPurge] = useState(false)
  const [customUrls, setCustomUrls] = useState('')
  const [purgeSuccess, setPurgeSuccess] = useState('')
  const [customUrlError, setCustomUrlError] = useState('')
  const [showCacheRuleModal, setShowCacheRuleModal] = useState(false)
  const [editCacheRule, setEditCacheRule] = useState(null)
  const [deleteCacheRuleId, setDeleteCacheRuleId] = useState(null)

  function showSuccessBanner(msg) {
    setPurgeSuccess(msg)
    setTimeout(() => setPurgeSuccess(''), 3000)
  }

  function handlePurgeAll() {
    setShowPurgeModal(false)
    updateCachingSettings(zoneId, { last_purge_on: new Date().toISOString() })
    showSuccessBanner('All cached files have been purged successfully.')
  }

  function handleCustomPurge() {
    const urls = customUrls.split('\n').filter(u => u.trim())
    if (urls.length === 0) { setCustomUrlError('Please enter at least one URL.'); return }
    setCustomUrlError('')
    setShowCustomPurge(false)
    setCustomUrls('')
    updateCachingSettings(zoneId, { last_purge_on: new Date().toISOString() })
    showSuccessBanner(`${urls.length} URL(s) purged from cache.`)
  }

  function handleSaveCacheRule(form) {
    if (editCacheRule) {
      const updated = cacheRules.map(r => r.id === editCacheRule.id ? { ...r, ...form, modified_on: new Date().toISOString() } : r)
      updateCachingSettings(zoneId, { cache_rules: updated })
    } else {
      updateCachingSettings(zoneId, {
        cache_rules: [...cacheRules, {
          ...form,
          id: 'cr_' + Date.now(),
          created_on: new Date().toISOString(),
          modified_on: new Date().toISOString()
        }]
      })
    }
    setShowCacheRuleModal(false)
    setEditCacheRule(null)
  }

  function handleDeleteCacheRule(id) {
    updateCachingSettings(zoneId, { cache_rules: cacheRules.filter(r => r.id !== id) })
    setDeleteCacheRuleId(null)
  }

  function toggleCacheRuleEnabled(id) {
    const updated = cacheRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    updateCachingSettings(zoneId, { cache_rules: updated })
  }

  const ttlLabel = BROWSER_TTL_OPTIONS.find(o => o.value === caching.browser_cache_ttl)?.label || '4 hours'

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Caching</h1>
        <p className="page-subtitle">Configuration</p>
      </div>

      {/* Purge Cache */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Purge Cache</h2>
        </div>
        <div className="card-body">
          <p style={{ color: 'var(--cf-text-secondary)', fontSize: 14, marginBottom: 16 }}>
            Remove all files from Xloudflare's cache for {zone?.name}. The next request for each file will go to your origin server.
          </p>
          {purgeSuccess && (
            <div className="success-banner" style={{ marginBottom: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {purgeSuccess}
            </div>
          )}
          {caching.last_purge_on && (
            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--cf-text-muted)' }}>
              Last purge: {new Date(caching.last_purge_on).toLocaleString()}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-danger" onClick={() => setShowPurgeModal(true)}>Purge Everything</button>
            <button className="btn btn-secondary" onClick={() => setShowCustomPurge(v => !v)}>Custom Purge</button>
          </div>

          {showCustomPurge && (
            <div style={{ marginTop: 16 }}>
              <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>URLs to purge (one per line)</label>
              <textarea
                className="form-textarea"
                style={{ width: '100%', maxWidth: 500 }}
                rows={4}
                placeholder={`https://${zone?.name}/path/to/file.js`}
                value={customUrls}
                onChange={e => { setCustomUrls(e.target.value); setCustomUrlError('') }}
              />
              {customUrlError && <div className="form-error" style={{ marginTop: 4 }}>{customUrlError}</div>}
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleCustomPurge}>Purge</button>
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => { setShowCustomPurge(false); setCustomUrls(''); setCustomUrlError('') }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Caching Level */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Caching Level</h2>
        </div>
        <div className="card-body">
          <p style={{ color: 'var(--cf-text-secondary)', fontSize: 14, marginBottom: 16 }}>
            Select your caching level based on how resources are cached.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { id: 'basic', label: 'No Query String', desc: 'Only delivers files from cache when there is no query string.' },
              { id: 'standard', label: 'Standard', desc: 'Delivers a different resource each time the query string changes. Recommended.' },
              { id: 'aggressive', label: 'Aggressive', desc: 'Delivers the same resource to everyone regardless of the query string.' }
            ].map(opt => (
              <label key={opt.id} style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                <input
                  type="radio"
                  name="caching-level"
                  checked={caching.caching_level === opt.id}
                  onChange={() => updateCachingSettings(zoneId, { caching_level: opt.id })}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{opt.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--cf-text-secondary)' }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Browser Cache TTL */}
      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Browser Cache TTL</h3>
          <p className="module-card-desc">Determines the length of time Xloudflare instructs a visitor's browser to cache files. Currently: <strong>{ttlLabel}</strong></p>
        </div>
        <select
          className="form-select"
          value={caching.browser_cache_ttl}
          onChange={e => updateCachingSettings(zoneId, { browser_cache_ttl: parseInt(e.target.value) })}
        >
          {BROWSER_TTL_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Always Online</h3>
          <p className="module-card-desc">If your server goes down, Xloudflare will serve limited copies of your site from our cache, keeping it online.</p>
        </div>
        <Toggle
          checked={caching.always_online || false}
          onChange={v => updateCachingSettings(zoneId, { always_online: v })}
        />
      </div>

      <div className="module-card">
        <div className="module-card-info">
          <h3 className="module-card-title">Development Mode</h3>
          <p className="module-card-desc">Temporarily bypass our cache to allow you to make changes to your origin server. Changes take effect immediately. Expires after 3 hours.</p>
          {caching.development_mode && (
            <div style={{ marginTop: 8, color: 'var(--cf-warning)', fontSize: 13, fontWeight: 500 }}>
              Development mode is active. Cache is bypassed.
            </div>
          )}
        </div>
        <Toggle
          checked={caching.development_mode || false}
          onChange={v => updateCachingSettings(zoneId, { development_mode: v, development_mode_expires: v ? new Date(Date.now() + 3 * 3600000).toISOString() : null })}
        />
      </div>

      {/* Cache Rules */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Cache Rules</h2>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditCacheRule(null); setShowCacheRuleModal(true) }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Cache Rule
          </button>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="cf-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>URL Pattern</th>
                  <th>Behavior</th>
                  <th style={{ width: 80 }}>Enabled</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cacheRules.map(rule => (
                  <tr key={rule.id}>
                    <td style={{ fontWeight: 500 }}>{rule.name}</td>
                    <td className="monospace" style={{ fontSize: 13 }}>{rule.match_url}</td>
                    <td>
                      <span className={`badge ${rule.action === 'bypass' ? 'badge-paused' : rule.action === 'custom' ? 'badge-pro' : 'badge-active'}`}>
                        {rule.action === 'cache' ? 'Cache Everything' : rule.action === 'bypass' ? 'Bypass Cache' : 'Custom TTL'}
                      </span>
                    </td>
                    <td>
                      <Toggle
                        checked={rule.enabled !== false}
                        onChange={() => toggleCacheRuleEnabled(rule.id)}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn-icon" onClick={() => { setEditCacheRule(rule); setShowCacheRuleModal(true) }} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {deleteCacheRuleId === rule.id ? (
                          <span style={{ display: 'inline-flex', gap: 4, fontSize: 12 }}>
                            <button className="btn btn-danger btn-sm" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => handleDeleteCacheRule(rule.id)}>Yes</button>
                            <button className="btn btn-secondary btn-sm" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => setDeleteCacheRuleId(null)}>No</button>
                          </span>
                        ) : (
                          <button className="btn-icon" onClick={() => setDeleteCacheRuleId(rule.id)} title="Delete" style={{ color: 'var(--cf-error)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {cacheRules.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 32, color: 'var(--cf-text-muted)' }}>
                      No cache rules configured. Create a rule to customize caching behavior.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Purge Everything Modal */}
      {showPurgeModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Purge Everything</h2>
              <button className="btn-icon" onClick={() => setShowPurgeModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--cf-text-secondary)', fontSize: 14 }}>
                Are you sure you want to purge <strong>ALL</strong> cached files for <strong>{zone?.name}</strong>?
                This may temporarily slow your site while files are re-cached.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPurgeModal(false)}>Cancel</button>
              <button className="btn btn-danger-solid" onClick={handlePurgeAll}>Purge Everything</button>
            </div>
          </div>
        </div>
      )}

      {showCacheRuleModal && (
        <CacheRuleModal
          rule={editCacheRule}
          zoneName={zone?.name}
          onSave={handleSaveCacheRule}
          onClose={() => { setShowCacheRuleModal(false); setEditCacheRule(null) }}
        />
      )}
    </div>
  )
}
