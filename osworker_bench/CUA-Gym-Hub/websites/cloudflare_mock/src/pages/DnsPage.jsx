import React, { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './DnsPage.css'

const DNS_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'NS', 'CAA']
const TTL_OPTIONS = [
  { label: 'Auto', value: 1 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
  { label: '1 hr', value: 3600 },
  { label: '2 hr', value: 7200 },
  { label: '5 hr', value: 18000 },
  { label: '12 hr', value: 43200 },
  { label: '1 day', value: 86400 }
]

const PROXIABLE_TYPES = ['A', 'AAAA', 'CNAME']

function formatTtl(ttl) {
  if (ttl === 1) return 'Auto'
  const opt = TTL_OPTIONS.find(o => o.value === ttl)
  if (opt) return opt.label
  if (ttl >= 3600) return Math.round(ttl / 3600) + ' hr'
  if (ttl >= 60) return Math.round(ttl / 60) + ' min'
  return ttl + ' sec'
}

function ProxyStatusBadge({ proxied }) {
  return proxied ? (
    <span className="proxy-badge proxied">
      <svg width="16" height="11" viewBox="0 0 40 28" fill="none"><path d="M34 14c-.3-5.5-4.9-10-10.5-10-4.5 0-8.3 2.7-10 6.6-.7-.4-1.5-.6-2.5-.6-2.8 0-5 2.2-5 5s2.2 5 5 5h23c2.8 0 5-2.2 5-5 0-2.4-1.7-4.4-4-5" fill="#F6821F"/></svg>
      Proxied
    </span>
  ) : (
    <span className="proxy-badge dns-only">
      <svg width="16" height="11" viewBox="0 0 40 28" fill="none"><path d="M34 14c-.3-5.5-4.9-10-10.5-10-4.5 0-8.3 2.7-10 6.6-.7-.4-1.5-.6-2.5-.6-2.8 0-5 2.2-5 5s2.2 5 5 5h23c2.8 0 5-2.2 5-5 0-2.4-1.7-4.4-4-5" fill="#9CA3AF"/></svg>
      DNS only
    </span>
  )
}

function RecordForm({ initial, onSave, onCancel, zoneId }) {
  const defaultRecord = { type: 'A', name: '', content: '', ttl: 1, proxied: false, priority: 10 }
  const [form, setForm] = useState(initial || defaultRecord)
  const [errors, setErrors] = useState({})

  const canProxy = PROXIABLE_TYPES.includes(form.type)

  function getContentPlaceholder() {
    switch (form.type) {
      case 'A': return 'IPv4 address (e.g. 192.0.2.1)'
      case 'AAAA': return 'IPv6 address (e.g. 2001:db8::1)'
      case 'CNAME': return 'Target domain name'
      case 'MX': return 'Mail server hostname'
      case 'TXT': return 'Text content'
      default: return 'Value'
    }
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.content.trim()) errs.content = 'Content is required'
    if (form.type === 'A' && !/^\d{1,3}(\.\d{1,3}){3}$/.test(form.content.trim())) {
      errs.content = 'Must be a valid IPv4 address'
    }
    return errs
  }

  function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const record = {
      ...form,
      name: form.name === '@' ? zoneId.replace('zone_', '') : form.name,
      proxied: canProxy ? form.proxied : false,
      proxiable: canProxy,
      priority: form.type === 'MX' ? (form.priority || 10) : null,
      modified_on: new Date().toISOString()
    }
    onSave(record)
  }

  return (
    <tr className="record-form-row">
      <td colSpan="6">
        <div className="record-form">
          <div className="record-form-fields">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value, proxied: false }))}
              >
                {DNS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Name</label>
              <input
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Use @ for root"
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group" style={{ flex: 3 }}>
              <label className="form-label">Content</label>
              <input
                className={`form-input ${errors.content ? 'input-error' : ''}`}
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder={getContentPlaceholder()}
              />
              {errors.content && <span className="field-error">{errors.content}</span>}
            </div>

            {form.type === 'MX' && (
              <div className="form-group">
                <label className="form-label">Priority</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 10 }))}
                  style={{ width: 80 }}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">TTL</label>
              <select
                className="form-select"
                value={form.ttl}
                onChange={e => setForm(f => ({ ...f, ttl: parseInt(e.target.value) }))}
              >
                {TTL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {canProxy && (
              <div className="form-group">
                <label className="form-label">Proxy status</label>
                <label className="proxy-toggle">
                  <input
                    type="checkbox"
                    checked={form.proxied}
                    onChange={e => setForm(f => ({ ...f, proxied: e.target.checked }))}
                  />
                  <span className={`proxy-toggle-btn ${form.proxied ? 'proxied' : 'dns-only'}`}>
                    {form.proxied ? 'Proxied' : 'DNS only'}
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="record-form-actions">
            <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </td>
    </tr>
  )
}

function DeleteConfirmModal({ record, zoneName, onConfirm, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Delete DNS Record</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: 16, color: 'var(--cf-text-secondary)' }}>
            Are you sure you want to delete this DNS record?
          </p>
          <table className="cf-table">
            <tbody>
              <tr><td style={{ fontWeight: 500 }}>Type</td><td>{record.type}</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Name</td><td>{record.name}</td></tr>
              <tr><td style={{ fontWeight: 500 }}>Content</td><td className="monospace">{record.content}</td></tr>
              <tr><td style={{ fontWeight: 500 }}>TTL</td><td>{formatTtl(record.ttl)}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-danger-solid" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}

function AdvancedDropdown({ records, zoneName, zoneId, onImportRecord }) {
  const [open, setOpen] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState('')
  const [importError, setImportError] = useState('')

  function handleExport() {
    const lines = records.map(r => {
      const name = r.name.includes('.') ? r.name : `${r.name}.${zoneName}`
      const ttl = r.ttl === 1 ? 3600 : r.ttl
      if (r.type === 'MX') return `${name} ${ttl} IN MX ${r.priority || 10} ${r.content}.`
      if (r.type === 'TXT') return `${name} ${ttl} IN TXT "${r.content}"`
      return `${name} ${ttl} IN ${r.type} ${r.content}`
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${zoneName || 'dns'}-records.txt`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  function handleImportOpen() {
    setShowImport(true)
    setOpen(false)
  }

  function parseImportRecords() {
    const parsed = []
    const supported = new Set(['A', 'AAAA', 'CNAME', 'MX', 'TXT'])
    importText.split('\n').forEach((rawLine, index) => {
      const line = rawLine.trim()
      if (!line || line.startsWith(';') || line.startsWith('#')) return
      const parts = line.replace(/\s+;.*$/, '').match(/"[^"]*"|\S+/g) || []
      const inIndex = parts.findIndex(part => part.toUpperCase() === 'IN')
      const typeIndex = inIndex >= 0 ? inIndex + 1 : parts.findIndex(part => supported.has(part.toUpperCase()))
      const type = parts[typeIndex]?.toUpperCase()
      if (!type || !supported.has(type)) {
        throw new Error(`Line ${index + 1}: unsupported DNS record.`)
      }
      const ttl = Number.parseInt(parts[inIndex >= 0 ? inIndex - 1 : typeIndex - 1], 10)
      const name = parts[0]?.replace(/\.$/, '') || '@'
      let content
      let priority = null
      if (type === 'MX') {
        priority = Number.parseInt(parts[typeIndex + 1], 10) || 10
        content = parts[typeIndex + 2]
      } else {
        content = parts.slice(typeIndex + 1).join(' ')
      }
      content = (content || '').replace(/^"|"$/g, '').replace(/\.$/, '')
      if (!content) throw new Error(`Line ${index + 1}: missing record content.`)
      parsed.push({
        type,
        name: name === zoneName ? '@' : name.replace(`.${zoneName}`, '') || '@',
        content,
        ttl: Number.isFinite(ttl) ? ttl : 1,
        proxied: false,
        proxiable: PROXIABLE_TYPES.includes(type),
        priority: type === 'MX' ? priority : null
      })
    })
    return parsed
  }

  function handleImport() {
    try {
      const parsed = parseImportRecords()
      if (parsed.length === 0) {
        setImportError('Paste at least one supported DNS record.')
        return
      }
      parsed.forEach((record, index) => onImportRecord({
        ...record,
        id: `dns_import_${Date.now()}_${index}`,
        zone_id: zoneId,
        created_on: new Date().toISOString(),
        modified_on: new Date().toISOString(),
        locked: false
      }))
      setImportError('')
      setImportStatus(`${parsed.length} DNS record${parsed.length === 1 ? '' : 's'} imported.`)
      setTimeout(() => {
        setShowImport(false)
        setImportText('')
        setImportStatus('')
      }, 900)
    } catch (error) {
      setImportError(error.message)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-secondary" onClick={() => setOpen(o => !o)}>
        Advanced
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4 }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 4,
          background: '#fff', border: '1px solid var(--cf-border)',
          borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          zIndex: 100, minWidth: 200
        }}>
          <button
            style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, cursor: 'pointer', color: 'var(--cf-text-primary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cf-bg-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            onClick={handleImportOpen}
          >
            Import DNS Records
          </button>
          <button
            style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: 14, cursor: 'pointer', color: 'var(--cf-text-primary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cf-bg-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            onClick={handleExport}
          >
            Export DNS Records
          </button>
        </div>
      )}
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />}
      {showImport && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title">Import DNS Records</h2>
              <button className="btn-icon" onClick={() => setShowImport(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 12, fontSize: 14, color: 'var(--cf-text-secondary)' }}>
                Paste your BIND-formatted DNS records below. Existing records will not be removed.
              </p>
              <textarea
                className="form-input"
                style={{ width: '100%', height: 180, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
                placeholder={`example.com 3600 IN A 192.0.2.1\nwww.example.com 3600 IN CNAME example.com`}
                value={importText}
                onChange={e => { setImportText(e.target.value); setImportError(''); setImportStatus('') }}
              />
              {importError && <div className="form-error" style={{ marginTop: 8 }}>{importError}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowImport(false); setImportStatus(''); setImportError('') }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleImport}>Import</button>
            </div>
            {importStatus && (
              <div style={{ padding: '8px 20px 12px', color: 'var(--cf-success, #00a651)', fontSize: 13, fontWeight: 500 }}>
                {importStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DnsPage() {
  const { zoneId } = useParams()
  const { getDnsRecords, addDnsRecord, updateDnsRecord, deleteDnsRecord, getZone, state } = useApp()
  const zone = getZone(zoneId)
  const records = getDnsRecords(zoneId)

  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const filtered = useMemo(() => {
    if (!search) return records
    const s = search.toLowerCase()
    return records.filter(r =>
      r.name.toLowerCase().includes(s) ||
      r.content.toLowerCase().includes(s) ||
      r.type.toLowerCase().includes(s)
    )
  }, [records, search])

  // Sort by type priority
  const typeOrder = { A: 1, AAAA: 2, CNAME: 3, MX: 4, TXT: 5, SRV: 6, NS: 7, CAA: 8 }
  const sorted = [...filtered].sort((a, b) => (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9))

  function handleAdd(record) {
    const newRecord = {
      ...record,
      id: 'dns_' + Date.now(),
      zone_id: zoneId,
      created_on: new Date().toISOString(),
      locked: false
    }
    addDnsRecord(zoneId, newRecord)
    setAdding(false)
  }

  function handleEdit(record) {
    const { id, zone_id, created_on, locked, ...rest } = record
    updateDnsRecord(zoneId, editingId, rest)
    setEditingId(null)
  }

  function handleDelete() {
    deleteDnsRecord(zoneId, deleteRecord.id)
    setDeleteRecord(null)
  }

  const editingRecord = editingId ? records.find(r => r.id === editingId) : null

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">DNS management for {zone?.name}</h1>
      </div>

      <div className="dns-toolbar">
        <button className="btn btn-orange" onClick={() => { setAdding(true); setEditingId(null) }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add record
        </button>
        <div className="search-input-wrap" style={{ flex: 1, maxWidth: 300 }}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            className="form-input search-input"
            placeholder="Search DNS Records"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <AdvancedDropdown records={records} zoneName={zone?.name} zoneId={zoneId} onImportRecord={record => addDnsRecord(zoneId, record)} />
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="cf-table dns-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Type</th>
                <th style={{ width: 200 }}>Name</th>
                <th>Content</th>
                <th style={{ width: 80 }}>TTL</th>
                <th style={{ width: 130 }}>Proxy status</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adding && (
                <RecordForm
                  onSave={handleAdd}
                  onCancel={() => setAdding(false)}
                  zoneId={zoneId}
                />
              )}
              {sorted.map(record => (
                editingId === record.id ? (
                  <RecordForm
                    key={record.id}
                    initial={record}
                    onSave={handleEdit}
                    onCancel={() => setEditingId(null)}
                    zoneId={zoneId}
                  />
                ) : (
                  <tr key={record.id} className="dns-row">
                    <td><span className={`type-badge type-${record.type.toLowerCase()}`}>{record.type}</span></td>
                    <td className="monospace truncate" style={{ maxWidth: 200 }} title={record.name}>{record.name}</td>
                    <td className="monospace truncate" style={{ maxWidth: 300 }} title={record.content}>
                      {record.priority != null && <span style={{ color: 'var(--cf-text-muted)', marginRight: 4 }}>{record.priority}</span>}
                      {record.content}
                    </td>
                    <td>{formatTtl(record.ttl)}</td>
                    <td>
                      {record.proxiable ? (
                        <button
                          className="proxy-toggle-inline"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateDnsRecord(zoneId, record.id, { proxied: !record.proxied })
                          }}
                          title={record.proxied ? 'Click to switch to DNS only' : 'Click to enable proxy'}
                        >
                          <ProxyStatusBadge proxied={record.proxied} />
                        </button>
                      ) : <span style={{ color: 'var(--cf-text-muted)' }}>--</span>}
                    </td>
                    <td>
                      <div className="record-actions">
                        <button
                          className="link-btn"
                          onClick={() => { setEditingId(record.id); setAdding(false) }}
                        >Edit</button>
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteRecord(record)}
                          title="Delete"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
              {sorted.length === 0 && !adding && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--cf-text-muted)' }}>
                    {search ? 'No records match your search.' : 'No DNS records yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteRecord && (
        <DeleteConfirmModal
          record={deleteRecord}
          zoneName={zone?.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteRecord(null)}
        />
      )}
    </div>
  )
}
