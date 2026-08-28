import React, { useState } from 'react'
import { Search, Play, Save, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { formatDate, formatCount } from '../utils/helpers.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

const FIELD_OPTIONS = [
  'event.type', 'project', 'timestamp', 'title', 'message', 'platform',
  'release', 'environment', 'user', 'browser.name', 'os.name', 'level',
  'count()', 'count_unique(user)', 'p50(transaction.duration)', 'p95(transaction.duration)'
]

const CONDITION_OPS = ['is', 'is not', 'contains', '>', '<', '>=', '<=']

const SAVED_QUERIES = [
  { id: 'sq-1', name: 'Errors by Release', fields: ['title', 'release', 'count()'], conditions: [{ field: 'event.type', op: 'is', value: 'error' }] },
  { id: 'sq-2', name: 'Top Browsers', fields: ['browser.name', 'count()', 'count_unique(user)'], conditions: [] },
  { id: 'sq-3', name: 'Slowest Transactions', fields: ['title', 'p50(transaction.duration)', 'p95(transaction.duration)', 'count()'], conditions: [{ field: 'event.type', op: 'is', value: 'transaction' }] }
]

export default function DiscoverPage() {
  const { state, saveDiscoverQuery } = useApp()
  const { issues = [], projects = [], discoverSavedQueries = [] } = state

  const [selectedFields, setSelectedFields] = useState(['title', 'project', 'count()', 'level'])
  const [conditions, setConditions] = useState([{ field: 'event.type', op: 'is', value: 'error' }])
  const [queryRan, setQueryRan] = useState(false)
  const [savedQueryId, setSavedQueryId] = useState(null)
  const [saveMessage, setSaveMessage] = useState('')

  function addField() {
    const remaining = FIELD_OPTIONS.filter(f => !selectedFields.includes(f))
    if (remaining.length > 0) setSelectedFields([...selectedFields, remaining[0]])
  }

  function removeField(idx) {
    setSelectedFields(selectedFields.filter((_, i) => i !== idx))
  }

  function addCondition() {
    setConditions([...conditions, { field: 'project', op: 'is', value: '' }])
  }

  function removeCondition(idx) {
    setConditions(conditions.filter((_, i) => i !== idx))
  }

  function updateCondition(idx, key, value) {
    setConditions(conditions.map((c, i) => i === idx ? { ...c, [key]: value } : c))
  }

  function loadSavedQuery(sq) {
    setSelectedFields(sq.fields)
    setConditions(sq.conditions)
    setSavedQueryId(sq.id)
    setQueryRan(true)
  }

  function handleSaveQuery() {
    const id = 'sq-custom-' + Date.now()
    saveDiscoverQuery({
      id,
      name: `Custom Query ${discoverSavedQueries.length + 1}`,
      fields: selectedFields,
      conditions,
      createdAt: new Date().toISOString(),
    })
    setSavedQueryId(id)
    setSaveMessage('Saved')
  }

  // Mock results based on issues
  const results = issues.slice(0, 10).map(issue => {
    const proj = projects.find(p => p.id === issue.project)
    const row = {}
    selectedFields.forEach(field => {
      if (field === 'title') row[field] = `${issue.title}: ${issue.subtitle}`
      else if (field === 'project') row[field] = proj?.name || 'unknown'
      else if (field === 'count()') row[field] = issue.count
      else if (field === 'count_unique(user)') row[field] = issue.userCount
      else if (field === 'level') row[field] = issue.level
      else if (field === 'platform') row[field] = proj?.platform || 'unknown'
      else if (field === 'release') row[field] = 'd66ac445f3b1'
      else if (field === 'environment') row[field] = 'production'
      else if (field === 'browser.name') row[field] = ['Chrome', 'Firefox', 'Safari'][Math.floor(Math.random() * 3)]
      else if (field === 'os.name') row[field] = ['Mac OS X', 'Windows', 'Linux'][Math.floor(Math.random() * 3)]
      else if (field === 'message') row[field] = issue.subtitle
      else if (field.includes('p50')) row[field] = `${Math.floor(100 + Math.random() * 400)}ms`
      else if (field.includes('p95')) row[field] = `${Math.floor(500 + Math.random() * 2000)}ms`
      else if (field === 'event.type') row[field] = issue.type
      else if (field === 'timestamp') row[field] = formatDate(issue.lastSeen, 'long')
      else if (field === 'user') row[field] = `user-${Math.floor(Math.random() * 1000)}`
      else row[field] = '-'
    })
    return row
  })

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Discover</h1>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Saved Queries sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
            Saved Queries
          </div>
          {[...discoverSavedQueries, ...SAVED_QUERIES].map(sq => (
            <div key={sq.id}
              onClick={() => loadSavedQuery(sq)}
              style={{
                padding: '8px 10px', borderRadius: 4, fontSize: 13, cursor: 'pointer',
                color: savedQueryId === sq.id ? ACCENT : TEXT_PRI,
                backgroundColor: savedQueryId === sq.id ? '#F0EEFF' : 'transparent',
                fontWeight: savedQueryId === sq.id ? 500 : 400, marginBottom: 2
              }}
              onMouseEnter={e => { if (savedQueryId !== sq.id) e.currentTarget.style.backgroundColor = '#FAF9FB' }}
              onMouseLeave={e => { if (savedQueryId !== sq.id) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {sq.name}
            </div>
          ))}
        </div>

        {/* Query builder */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Fields */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRI, marginBottom: 8 }}>Fields</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {selectedFields.map((field, idx) => (
                <span key={idx} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 12, padding: '3px 8px', borderRadius: 4,
                  backgroundColor: '#F0EEFF', color: ACCENT, border: `1px solid #DDD8F8`
                }}>
                  {field}
                  <button onClick={() => removeField(idx)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: ACCENT, lineHeight: 1
                  }}>&times;</button>
                </span>
              ))}
              <button onClick={addField} style={{
                fontSize: 12, padding: '3px 8px', borderRadius: 4,
                border: `1px dashed ${BORDER}`, backgroundColor: 'transparent',
                cursor: 'pointer', color: TEXT_SEC
              }}>
                <Plus size={10} style={{ marginRight: 2 }} /> Add Field
              </button>
            </div>
          </div>

          {/* Conditions */}
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRI, marginBottom: 8 }}>Conditions</div>
            {conditions.map((cond, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <select value={cond.field} onChange={e => updateCondition(idx, 'field', e.target.value)}
                  style={{ padding: '5px 8px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 12, flex: 1 }}>
                  {FIELD_OPTIONS.filter(f => !f.includes('(')).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={cond.op} onChange={e => updateCondition(idx, 'op', e.target.value)}
                  style={{ padding: '5px 8px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 12, width: 80 }}>
                  {CONDITION_OPS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input value={cond.value} onChange={e => updateCondition(idx, 'value', e.target.value)}
                  placeholder="value" style={{ padding: '5px 8px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 12, flex: 1 }} />
                <button onClick={() => removeCondition(idx)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: TEXT_SEC, padding: 4
                }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button onClick={addCondition} style={{
              fontSize: 12, color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500
            }}>
              + Add Condition
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button onClick={() => setQueryRan(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: 4,
              padding: '7px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 500
            }}>
              <Play size={12} /> Run Query
            </button>
            <button onClick={handleSaveQuery} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              border: `1px solid ${ACCENT}`, borderRadius: 4, padding: '7px 18px',
              backgroundColor: 'transparent', color: ACCENT, fontSize: 13, cursor: 'pointer', fontWeight: 500
            }}>
              <Save size={12} /> Save Query
            </button>
            {saveMessage && <span style={{ alignSelf: 'center', color: '#2BA185', fontSize: 13 }}>{saveMessage}</span>}
          </div>

          {/* Results table */}
          {queryRan && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                display: 'flex', padding: '10px 16px', backgroundColor: '#FAF9FB',
                borderBottom: `1px solid ${BORDER}`, fontSize: 11, fontWeight: 600, color: TEXT_SEC,
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {selectedFields.map(field => (
                  <div key={field} style={{ flex: field === 'title' || field === 'message' ? 2 : 1, minWidth: 80 }}>{field}</div>
                ))}
              </div>
              {results.map((row, idx) => (
                <div key={idx} style={{
                  display: 'flex', padding: '8px 16px', fontSize: 12,
                  borderBottom: idx < results.length - 1 ? `1px solid ${BORDER}` : 'none'
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {selectedFields.map(field => (
                    <div key={field} style={{
                      flex: field === 'title' || field === 'message' ? 2 : 1, minWidth: 80,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: TEXT_PRI,
                      fontFamily: field.includes('count') || field.includes('p5') || field.includes('p9') ? '"Source Code Pro", monospace' : 'inherit'
                    }}>
                      {typeof row[field] === 'number' ? formatCount(row[field]) : row[field]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
