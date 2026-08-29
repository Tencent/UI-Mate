import React, { useState } from 'react'
import { Plus, Search, MoreHorizontal, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { formatRelativeTime, formatDate } from '../utils/helpers.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

const STATUS_CONFIG = {
  critical: { icon: AlertCircle, color: '#E03E2F', bg: '#FFE8E6', label: 'Critical' },
  warning: { icon: AlertTriangle, color: '#F5B000', bg: '#FFF8E8', label: 'Warning' },
  resolved: { icon: CheckCircle, color: '#2BA185', bg: '#E8F8F5', label: 'Resolved' }
}

export default function AlertsPage() {
  const { state, addAlertRule } = useApp()
  const { alertRules = [], projects = [], teams = [] } = state
  const [activeTab, setActiveTab] = useState('rules')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedAlert, setExpandedAlert] = useState(null)
  const [newAlertName, setNewAlertName] = useState('')
  const [newAlertType, setNewAlertType] = useState('error')
  const [newAlertProject, setNewAlertProject] = useState('')
  const [newAlertCondition, setNewAlertCondition] = useState('first_seen')
  const [createError, setCreateError] = useState('')

  function handleCreateAlert() {
    const projectId = newAlertProject || projects[0]?.id || 'proj-1'
    if (!newAlertName.trim()) {
      setCreateError('Enter an alert name before creating the rule.')
      return
    }
    const project = projects.find(p => p.id === projectId)
    const id = 'alert-' + Date.now()
    addAlertRule({
      id,
      name: newAlertName.trim(),
      type: newAlertType,
      status: 'resolved',
      threshold: newAlertCondition,
      thresholdType: 'custom',
      triggerLabel: 'Resolved',
      dateTriggered: new Date().toISOString(),
      dateCreated: new Date().toISOString(),
      project: projectId,
      team: project?.teams?.[0] || teams[0]?.id || 'team-1',
      history: [{ status: 'resolved', timestamp: new Date().toISOString() }],
    })
    setShowCreateModal(false)
    setNewAlertName('')
    setNewAlertType('error')
    setNewAlertProject('')
    setNewAlertCondition('first_seen')
    setCreateError('')
  }

  const filteredRules = alertRules.filter(r =>
    !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Build history from all alert rules
  const allHistory = alertRules.flatMap(rule =>
    (rule.history || []).map(h => ({
      ...h,
      alertName: rule.name,
      alertId: rule.id,
      project: rule.project,
      type: rule.type
    }))
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Alerts</h1>
        <button onClick={() => setShowCreateModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: 4,
          padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500
        }}>
          <Plus size={14} /> Create Alert
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
        {[{ key: 'rules', label: 'Alert Rules' }, { key: 'history', label: 'History' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 20px', fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
            color: activeTab === tab.key ? ACCENT : TEXT_SEC,
            border: 'none', borderBottom: activeTab === tab.key ? `2px solid ${ACCENT}` : '2px solid transparent',
            backgroundColor: 'transparent', cursor: 'pointer', marginBottom: -1
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'rules' && (
        <>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: TEXT_SEC }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name"
              style={{
                width: '100%', padding: '7px 12px 7px 32px', border: `1px solid ${BORDER}`,
                borderRadius: 4, fontSize: 13, color: TEXT_PRI, outline: 'none'
              }}
            />
          </div>

          {/* Rules table */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 140px 100px 80px 100px 40px',
              padding: '10px 16px', backgroundColor: '#FAF9FB', borderBottom: `1px solid ${BORDER}`,
              fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              <div>Alert Rule</div>
              <div>Status</div>
              <div>Project</div>
              <div>Team</div>
              <div>Created</div>
              <div></div>
            </div>

            {filteredRules.map((rule, idx) => {
              const statusCfg = STATUS_CONFIG[rule.status] || STATUS_CONFIG.resolved
              const StatusIcon = statusCfg.icon
              const proj = projects.find(p => p.id === rule.project)
              const team = teams.find(t => t.id === rule.team)
              const expanded = expandedAlert === rule.id

              return (
                <div key={rule.id}>
                  <div
                    onClick={() => setExpandedAlert(expanded ? null : rule.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 140px 100px 80px 100px 40px',
                      padding: '12px 16px', borderBottom: `1px solid ${BORDER}`,
                      fontSize: 13, cursor: 'pointer', alignItems: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: TEXT_PRI }}>{rule.name}</div>
                      <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 2 }}>
                        Triggered {formatRelativeTime(rule.dateTriggered)}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 11, padding: '2px 8px', borderRadius: 3, fontWeight: 600,
                        backgroundColor: statusCfg.bg, color: statusCfg.color
                      }}>
                        <StatusIcon size={11} />
                        {rule.triggerLabel}
                      </span>
                    </div>
                    <div>
                      {proj && (
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 3, fontWeight: 500,
                          backgroundColor: proj.color + '22', color: proj.color
                        }}>{proj.name}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: TEXT_SEC }}>{team?.name || '-'}</div>
                    <div style={{ fontSize: 12, color: TEXT_SEC }}>{formatDate(rule.dateCreated)}</div>
                    <div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_SEC, padding: 4 }}>
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: alert history */}
                  {expanded && (
                    <div style={{ padding: '12px 24px', backgroundColor: '#FAF9FB', borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRI, marginBottom: 8 }}>History</div>
                      {(rule.history || []).map((h, i) => {
                        const hCfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.resolved
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: hCfg.color }} />
                            <span style={{ color: TEXT_PRI, fontWeight: 500 }}>{hCfg.label}</span>
                            <span style={{ color: TEXT_SEC }}>{formatRelativeTime(h.timestamp)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
            padding: '10px 16px', backgroundColor: '#FAF9FB', borderBottom: `1px solid ${BORDER}`,
            fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: 'uppercase'
          }}>
            <div>Alert</div>
            <div>Status</div>
            <div>Type</div>
            <div style={{ textAlign: 'right' }}>Time</div>
          </div>

          {allHistory.map((h, idx) => {
            const hCfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.resolved
            return (
              <div key={idx} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
                padding: '10px 16px', borderBottom: idx < allHistory.length - 1 ? `1px solid ${BORDER}` : 'none',
                fontSize: 13, alignItems: 'center'
              }}>
                <div style={{ fontWeight: 500, color: TEXT_PRI }}>{h.alertName}</div>
                <div>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 3, fontWeight: 600,
                    backgroundColor: hCfg.bg, color: hCfg.color
                  }}>{hCfg.label}</span>
                </div>
                <div style={{ fontSize: 12, color: TEXT_SEC, textTransform: 'capitalize' }}>{h.type}</div>
                <div style={{ textAlign: 'right', fontSize: 12, color: TEXT_SEC }}>{formatRelativeTime(h.timestamp)}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}
          onClick={() => setShowCreateModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: '#fff', borderRadius: 8, padding: 32, width: 520,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, color: TEXT_PRI }}>Create Alert Rule</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: TEXT_SEC, marginBottom: 4 }}>Alert Name</label>
              <input value={newAlertName} onChange={e => { setNewAlertName(e.target.value); setCreateError('') }} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13 }} placeholder="e.g., High error rate on checkout" />
              {createError && <div style={{ color: '#E03E2F', fontSize: 12, marginTop: 6 }}>{createError}</div>}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: TEXT_SEC, marginBottom: 4 }}>Type</label>
              <select value={newAlertType} onChange={e => setNewAlertType(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13 }}>
                <option value="error">Issue Alert</option>
                <option value="metric">Metric Alert</option>
                <option value="transaction">Transaction Alert</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: TEXT_SEC, marginBottom: 4 }}>Project</label>
              <select value={newAlertProject || projects[0]?.id || ''} onChange={e => setNewAlertProject(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13 }}>
                {(state.projects || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: TEXT_SEC, marginBottom: 4 }}>Condition</label>
              <select value={newAlertCondition} onChange={e => setNewAlertCondition(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13 }}>
                <option value="first_seen">When an event is first seen</option>
                <option value="frequency">When event frequency exceeds threshold</option>
                <option value="count">When error count exceeds threshold</option>
                <option value="regression">When regression occurs</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreateModal(false)} style={{
                border: `1px solid ${BORDER}`, borderRadius: 4, padding: '7px 16px',
                backgroundColor: '#fff', fontSize: 13, cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleCreateAlert} style={{
                backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: 4,
                padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500
              }}>Create Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
