import { useNavigate } from 'react-router-dom'
import { Plus, ChevronDown, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useState } from 'react'

export default function Cohorts() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [selectedCohort, setSelectedCohort] = useState(null)

  function relTime(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function handleDelete(cohortId) {
    dispatch({ type: 'DELETE_COHORT', payload: cohortId })
  }

  return (
    <div className="users-page">
      <div className="users-topbar">
        <div className="project-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>default <ChevronDown size={14} /></div>
      </div>
      <div className="users-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Cohorts</h1>
          <button className="btn-primary" onClick={() => navigate('/cohorts/new')}>
            <Plus size={14} /> Create Cohort
          </button>
        </div>
        <table className="users-table" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Owner</th>
              <th>User Count</th>
              <th>Last Computed</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {state.cohorts.map(cohort => (
              <tr key={cohort.id} className="users-row">
                <td><button onClick={() => setSelectedCohort(cohort)} style={{ color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{cohort.name}</button></td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{cohort.description}</td>
                <td style={{ fontSize: 13 }}>{cohort.owner}</td>
                <td style={{ fontSize: 13 }}>{cohort.userCount.toLocaleString()}</td>
                <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{relTime(cohort.lastComputed)}</td>
                <td>
                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28 }}
                    title="Delete cohort"
                    onClick={() => handleDelete(cohort.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedCohort && (
          <div style={{ marginTop: 18, border: '1px solid var(--border)', borderRadius: 8, padding: 16, background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{selectedCohort.name}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{selectedCohort.description}</p>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {selectedCohort.userCount.toLocaleString()} users · {selectedCohort.definition?.conditions?.length || 0} condition(s)
                </div>
              </div>
              <button className="btn-outline" onClick={() => navigate(`/users?cohort=${encodeURIComponent(selectedCohort.id)}`)}>View Users</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
