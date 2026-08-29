import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Info, Settings, ChevronDown, MoreHorizontal, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './UserProfiles.css'

function SaveCohortModal({ userCount, onSave, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleSave() {
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim(), userCount })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Save as Cohort</span>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Cohort Name *</label>
          <input
            className="input"
            placeholder="e.g. Power Users"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4 }}>Description</label>
          <input
            className="input"
            placeholder="Optional description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          This cohort will include <strong>{userCount}</strong> users matching the current query.
        </div>
        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={!name.trim()}>Save Cohort</button>
        </div>
      </div>
    </div>
  )
}

export default function UserProfiles() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('')
  const [showSaveCohort, setShowSaveCohort] = useState(false)

  const filtered = state.users.filter(u =>
    !search ||
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.userId.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="users-page">
      <div className="users-topbar">
        <div className="project-btn">default <ChevronDown size={14} /></div>
      </div>
      <div className="users-content">
        <h1 className="page-title">User Profiles</h1>
        <p className="page-subtitle">A list of all your users. You can search for and dive into their specific properties and event paths.</p>

        <div className="users-search-row">
          <div className="search-input-wrap">
            <Search size={15} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search user or device ID's"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-outline" onClick={() => { setSearch(''); setSelectedEvent('') }}>Cancel</button>
          <button className="btn-outline" style={{ color: 'var(--primary)' }} onClick={() => setShowSaveCohort(true)}>Save as Cohort</button>
        </div>

        <div className="users-query-builder">
          <div className="query-row">
            <span className="query-label">The Users who</span>
          </div>
          <div className="query-row" style={{ paddingLeft: 32 }}>
            <span className="query-label">...did perform</span>
            <select className="query-tag" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} style={{ fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="">Select event...</option>
              {state.eventDefinitions.map(evt => <option key={evt.id} value={evt.name}>{evt.name}</option>)}
            </select>
            <span className="query-label">with</span>
            <button className="query-tag">count</button>
            <button className="query-tag">&gt;=</button>
            <button className="query-tag">1</button>
            <span className="query-label">time</span>
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn-ghost" style={{ fontSize: 12 }}>+ where</button>
              <button className="icon-btn" style={{ width: 24, height: 24 }}>✕</button>
            </div>
          </div>
          <div className="query-row" style={{ paddingLeft: 32 }}>
            <span className="query-label">any time</span>
            <span className="query-label">during</span>
            <button className="query-tag" style={{ color: 'var(--primary)' }}>📅 Last 30 days</button>
          </div>
          <div className="query-row" style={{ paddingLeft: 16, gap: 16 }}>
            <button className="query-combinator">...then</button>
            <button className="query-combinator">...or</button>
          </div>
          <div className="query-row">
            <button className="chart-add-btn" style={{ fontSize: 13 }}>+ Add</button>
          </div>
        </div>

        <div className="users-table-wrap">
          <div className="users-table-header">
            <span className="users-count">{filtered.length} Users</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="icon-btn"><Settings size={16} /></button>
              <button className="icon-btn"><ChevronDown size={16} /></button>
            </div>
          </div>

          {filtered.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID <MoreHorizontal size={13} className="th-menu" /></th>
                  <th>Xmplitude ID <MoreHorizontal size={13} className="th-menu" /></th>
                  <th>First Seen <MoreHorizontal size={13} className="th-menu" /></th>
                  <th>Last Seen <MoreHorizontal size={13} className="th-menu" /></th>
                  <th>Watch Session <MoreHorizontal size={13} className="th-menu" /></th>
                  <th>Country <MoreHorizontal size={13} className="th-menu" /></th>
                  <th>Platform <MoreHorizontal size={13} className="th-menu" /></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} onClick={() => navigate(`/users/${user.id}`)} className="users-row">
                    <td><a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--primary)' }}>{user.userId}</a></td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 12 }}>{user.amplitudeId}</td>
                    <td>{formatDate(user.firstSeen)}</td>
                    <td>{formatDate(user.lastSeen)}</td>
                    <td><button className="btn-ghost" style={{ fontSize: 12, padding: '2px 6px' }} onClick={e => { e.stopPropagation(); navigate(`/session-replay?user=${encodeURIComponent(user.id)}`) }}>▶ Watch</button></td>
                    <td>{user.country}</td>
                    <td>{user.platform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="users-empty">
              <div className="users-empty-icon">👤</div>
              <div>No users found</div>
            </div>
          )}
        </div>
      </div>

      {showSaveCohort && (
        <SaveCohortModal
          userCount={filtered.length}
          onSave={({ name, description, userCount }) => {
            dispatch({ type: 'ADD_COHORT', payload: {
              id: `cohort_${Date.now()}`,
              name,
              description: description || `Users matching search: ${search || 'all'}`,
              owner: state.currentUser.name,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              userCount,
              lastComputed: new Date().toISOString(),
              definition: { conditions: [], combinator: 'and' }
            }})
          }}
          onClose={() => setShowSaveCohort(false)}
        />
      )}
    </div>
  )
}
