import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function AddRouteModal({ workers, zoneName, zoneId, onSave, onClose }) {
  const [pattern, setPattern] = useState(`${zoneName}/`)
  const [workerName, setWorkerName] = useState(workers[0]?.name || '')
  const [errors, setErrors] = useState({})

  function handleSave() {
    const errs = {}
    if (!pattern.trim()) errs.pattern = 'Route pattern is required.'
    if (!workerName) errs.worker = 'Select a worker.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ pattern, worker: workerName })
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Route</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Route</label>
            <input
              className="form-input monospace"
              value={pattern}
              onChange={e => { setPattern(e.target.value); setErrors(p => ({ ...p, pattern: undefined })) }}
              placeholder={`${zoneName}/*`}
            />
            {errors.pattern && <div className="form-error">{errors.pattern}</div>}
            <div className="form-helper">Use * as a wildcard in the path</div>
          </div>
          <div className="form-group">
            <label className="form-label">Worker</label>
            <select className="form-select" value={workerName} onChange={e => { setWorkerName(e.target.value); setErrors(p => ({ ...p, worker: undefined })) }}>
              {workers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
            {errors.worker && <div className="form-error">{errors.worker}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

function CreateWorkerModal({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [script, setScript] = useState(`addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  return new Response('Hello World!', {
    headers: { 'content-type': 'text/plain' },
  })
}`)
  const [nameError, setNameError] = useState('')

  function handleSave() {
    const clean = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    if (!clean) { setNameError('Worker name is required.'); return }
    if (clean.length < 2) { setNameError('Worker name must be at least 2 characters.'); return }
    onSave({ name: clean, script })
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title">Create Worker</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Worker Name</label>
            <input
              className={`form-input monospace${nameError ? ' form-input-error' : ''}`}
              value={name}
              onChange={e => { setName(e.target.value); setNameError('') }}
              placeholder="my-worker"
            />
            {nameError && <div className="form-error">{nameError}</div>}
            <div className="form-helper">Only lowercase letters, numbers, and hyphens</div>
          </div>
          <div className="form-group">
            <label className="form-label">Script</label>
            <textarea
              className="form-textarea monospace"
              style={{ width: '100%', height: 200, fontSize: 12, resize: 'vertical', tabSize: 2 }}
              value={script}
              onChange={e => setScript(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Deploy</button>
        </div>
      </div>
    </div>
  )
}

function KvNamespaceModal({ onSave, onClose }) {
  const [title, setTitle] = useState('')
  const [titleError, setTitleError] = useState('')

  function handleSave() {
    if (!title.trim()) { setTitleError('Namespace title is required.'); return }
    onSave({ title: title.trim() })
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title">Create a Namespace</h2>
          <button className="btn-icon" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Namespace Name</label>
            <input
              className={`form-input${titleError ? ' form-input-error' : ''}`}
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError('') }}
              placeholder="MY_KV_NAMESPACE"
            />
            {titleError && <div className="form-error">{titleError}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Add</button>
        </div>
      </div>
    </div>
  )
}

export default function WorkersPage() {
  const { zoneId } = useParams()
  const { state, updateState, addWorkerRoute, deleteWorkerRoute, getZone } = useApp()
  const zone = getZone(zoneId)
  const workers = state.workers || []
  const kvNamespaces = state.kvNamespaces || []

  // Get routes for this zone across all workers
  const routes = workers.flatMap(w =>
    (w.routes || []).filter(r => r.zone_id === zoneId).map(r => ({ ...r, workerName: w.name }))
  )

  const [activeTab, setActiveTab] = useState('routes')
  const [showModal, setShowModal] = useState(false)
  const [showCreateWorker, setShowCreateWorker] = useState(false)
  const [showKvModal, setShowKvModal] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deleteWorkerConfirmId, setDeleteWorkerConfirmId] = useState(null)
  const [deleteKvId, setDeleteKvId] = useState(null)
  const [expandedWorker, setExpandedWorker] = useState(null)

  function handleAddRoute({ pattern, worker }) {
    addWorkerRoute(zoneId, {
      id: 'route_' + Date.now(),
      pattern,
      zone_id: zoneId,
      zone_name: zone?.name,
      worker
    })
    setShowModal(false)
  }

  function handleDelete(routeId) {
    deleteWorkerRoute(routeId)
    setDeleteConfirmId(null)
  }

  function handleCreateWorker({ name, script }) {
    updateState(prev => ({
      ...prev,
      workers: [...(prev.workers || []), {
        id: 'worker_' + Date.now(),
        account_id: 'acc_001',
        name,
        script,
        created_on: new Date().toISOString(),
        modified_on: new Date().toISOString(),
        routes: [],
        usage: { requests_today: 0, cpu_time_avg_ms: 0 }
      }]
    }))
    setShowCreateWorker(false)
  }

  function handleDeleteWorker(workerId) {
    updateState(prev => ({
      ...prev,
      workers: (prev.workers || []).filter(w => w.id !== workerId)
    }))
    setDeleteWorkerConfirmId(null)
  }

  function handleCreateKv({ title }) {
    updateState(prev => ({
      ...prev,
      kvNamespaces: [...(prev.kvNamespaces || []), {
        id: 'kv_' + Date.now(),
        title,
        created_on: new Date().toISOString(),
        keys_count: 0
      }]
    }))
    setShowKvModal(false)
  }

  function handleDeleteKv(kvId) {
    updateState(prev => ({
      ...prev,
      kvNamespaces: (prev.kvNamespaces || []).filter(kv => kv.id !== kvId)
    }))
    setDeleteKvId(null)
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Workers</h1>
        <p className="page-subtitle">Deploy serverless code to Xloudflare's edge network</p>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 20 }}>
        <button className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`} onClick={() => setActiveTab('routes')}>Routes</button>
        <button className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`} onClick={() => setActiveTab('workers')}>Workers</button>
        <button className={`tab-btn ${activeTab === 'kv' ? 'active' : ''}`} onClick={() => setActiveTab('kv')}>KV Namespaces</button>
      </div>

      {activeTab === 'routes' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={workers.length === 0}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add route
            </button>
          </div>

          {workers.length === 0 && (
            <div className="info-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Create a Worker first before adding routes.
            </div>
          )}

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="cf-table">
                <thead>
                  <tr>
                    <th>Route Pattern</th>
                    <th>Worker</th>
                    <th>Environment</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map(route => (
                    <tr key={route.id}>
                      <td className="monospace">{route.pattern}</td>
                      <td>
                        <span style={{ color: 'var(--cf-blue)', fontWeight: 500 }}>
                          {route.workerName || route.worker}
                        </span>
                      </td>
                      <td style={{ color: 'var(--cf-text-secondary)' }}>production</td>
                      <td>
                        {deleteConfirmId === route.id ? (
                          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
                            <button className="btn btn-danger btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => handleDelete(route.id)}>Delete</button>
                            <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                          </span>
                        ) : (
                          <button className="btn-icon" onClick={() => setDeleteConfirmId(route.id)} title="Delete" style={{ color: 'var(--cf-error)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {routes.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: 32, color: 'var(--cf-text-muted)' }}>
                        No routes configured. Add a route to direct traffic to a Worker.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'workers' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => setShowCreateWorker(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Worker
            </button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="cf-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Routes</th>
                    <th>Requests Today</th>
                    <th>Avg CPU Time</th>
                    <th>Last Modified</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map(w => (
                    <React.Fragment key={w.id}>
                      <tr>
                        <td>
                          <button
                            className="link-btn"
                            style={{ fontWeight: 600, fontSize: 14 }}
                            onClick={() => setExpandedWorker(expandedWorker === w.id ? null : w.id)}
                          >
                            {w.name}
                          </button>
                        </td>
                        <td>{(w.routes || []).length}</td>
                        <td>{w.usage?.requests_today?.toLocaleString()}</td>
                        <td>{w.usage?.cpu_time_avg_ms} ms</td>
                        <td style={{ fontSize: 13, color: 'var(--cf-text-secondary)' }}>
                          {new Date(w.modified_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          {deleteWorkerConfirmId === w.id ? (
                            <span style={{ display: 'inline-flex', gap: 6, fontSize: 12 }}>
                              <button className="btn btn-danger btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => handleDeleteWorker(w.id)}>Delete</button>
                              <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => setDeleteWorkerConfirmId(null)}>Cancel</button>
                            </span>
                          ) : (
                            <button className="btn-icon" onClick={() => setDeleteWorkerConfirmId(w.id)} title="Delete" style={{ color: 'var(--cf-error)' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedWorker === w.id && (
                        <tr>
                          <td colSpan="6" style={{ padding: 0, background: 'var(--cf-bg-secondary)' }}>
                            <div style={{ padding: '16px 20px' }}>
                              <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: 'var(--cf-text-muted)', textTransform: 'uppercase' }}>Script</div>
                              <pre style={{
                                background: '#1a1a1a',
                                color: '#e2e8f0',
                                padding: 16,
                                borderRadius: 6,
                                fontSize: 12,
                                fontFamily: 'var(--cf-font-mono)',
                                overflow: 'auto',
                                maxHeight: 250,
                                margin: 0
                              }}>
                                {w.script}
                              </pre>
                              {w.routes?.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                  <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--cf-text-muted)', textTransform: 'uppercase' }}>Routes</div>
                                  {w.routes.map(r => (
                                    <div key={r.id} className="monospace" style={{ fontSize: 13, padding: '3px 0', color: 'var(--cf-text-primary)' }}>
                                      {r.pattern} <span style={{ color: 'var(--cf-text-muted)' }}>({r.zone_name})</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {workers.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--cf-text-muted)' }}>
                        No workers deployed. Create your first Worker to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'kv' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ color: 'var(--cf-text-secondary)', fontSize: 14, margin: 0 }}>
              Workers KV provides a global, low-latency, key-value data store.
            </p>
            <button className="btn btn-primary" onClick={() => setShowKvModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create a Namespace
            </button>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table className="cf-table">
                <thead>
                  <tr>
                    <th>Namespace Title</th>
                    <th>ID</th>
                    <th>Keys</th>
                    <th style={{ width: 150 }}>Created</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kvNamespaces.map(kv => (
                    <tr key={kv.id}>
                      <td style={{ fontWeight: 500 }}>{kv.title}</td>
                      <td className="monospace" style={{ fontSize: 12 }}>{kv.id}</td>
                      <td>{kv.keys_count || 0}</td>
                      <td style={{ fontSize: 13, color: 'var(--cf-text-secondary)' }}>
                        {new Date(kv.created_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        {deleteKvId === kv.id ? (
                          <span style={{ display: 'inline-flex', gap: 6, fontSize: 12 }}>
                            <button className="btn btn-danger btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => handleDeleteKv(kv.id)}>Delete</button>
                            <button className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => setDeleteKvId(null)}>Cancel</button>
                          </span>
                        ) : (
                          <button className="btn-icon" onClick={() => setDeleteKvId(kv.id)} title="Delete" style={{ color: 'var(--cf-error)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {kvNamespaces.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: 32, color: 'var(--cf-text-muted)' }}>
                        No KV namespaces. Create one to start storing key-value data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showModal && workers.length > 0 && (
        <AddRouteModal
          workers={workers}
          zoneName={zone?.name}
          zoneId={zoneId}
          onSave={handleAddRoute}
          onClose={() => setShowModal(false)}
        />
      )}

      {showCreateWorker && (
        <CreateWorkerModal
          onSave={handleCreateWorker}
          onClose={() => setShowCreateWorker(false)}
        />
      )}

      {showKvModal && (
        <KvNamespaceModal
          onSave={handleCreateKv}
          onClose={() => setShowKvModal(false)}
        />
      )}
    </div>
  )
}
