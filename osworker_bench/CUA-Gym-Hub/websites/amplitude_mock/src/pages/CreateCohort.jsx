import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function CreateCohort() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [count, setCount] = useState(1)
  const [error, setError] = useState('')

  function handleSave() {
    if (!name.trim()) {
      setError('Enter a cohort name.')
      return
    }
    const cohort = {
      id: `cohort_${Date.now()}`,
      name: name.trim(),
      description: `Users who ${selectedEvent ? `performed ${selectedEvent}` : 'match criteria'} >= ${count} time(s) in the last 30 days`,
      owner: state.currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userCount: Math.floor(Math.random() * 20) + 1,
      lastComputed: new Date().toISOString(),
      definition: {
        conditions: selectedEvent ? [{ type: 'didPerform', eventName: selectedEvent, operator: '>=', count, timeRange: 'last_30_days' }] : [],
        combinator: 'and'
      }
    }
    dispatch({ type: 'ADD_COHORT', payload: cohort })
    navigate('/cohorts')
  }

  return (
    <div className="users-page">
      <div className="users-content">
        <h1 className="page-title">Create Cohort</h1>
        <div className="users-query-builder" style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Cohort Name</label>
            <input
              className="input"
              style={{ width: 320 }}
              placeholder="Enter cohort name..."
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
            />
            {error && <div style={{ color: 'var(--error)', fontSize: 12, marginTop: 6 }}>{error}</div>}
          </div>
          <div className="query-row">
            <span className="query-label">The Users who</span>
          </div>
          <div className="query-row" style={{ paddingLeft: 32 }}>
            <span className="query-label">...did perform</span>
            <select
              className="query-tag"
              style={{ cursor: 'pointer', fontFamily: 'inherit' }}
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
            >
              <option value="">Select event...</option>
              {state.eventDefinitions.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
            <span className="query-label">with count</span>
            <input
              type="number"
              className="query-tag"
              style={{ width: 60, textAlign: 'center' }}
              min={1}
              value={count}
              onChange={e => setCount(Number(e.target.value))}
            />
            <span className="query-label">time(s) during</span>
            <button className="query-tag" style={{ color: 'var(--primary)' }}>📅 Last 30 days</button>
          </div>
          <div className="query-row" style={{ paddingLeft: 16, gap: 16 }}>
            <button className="query-combinator">...then</button>
            <button className="query-combinator">...or</button>
          </div>
          <div className="query-row">
            <button className="chart-add-btn">+ Add</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={handleSave}>Save as Cohort</button>
          <button className="btn-outline" onClick={() => navigate('/cohorts')}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
