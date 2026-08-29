import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './UserProfiles.css'

const EVENT_COLORS = { 'Page View': '#7C3AED', 'Button Click': '#8B5CF6', 'Start Session': '#059669', 'Login': '#2563EB', 'Sign Up': '#059669', 'Purchase': '#D97706', 'Add to Cart': '#EC4899', 'Search': '#0891B2', 'End Session': '#6B7280', 'Form Submit': '#7C3AED', 'Video Play': '#DC2626', 'Share': '#0EA5E9', 'Download': '#6366F1', 'Scroll Depth': '#8B5CF6', 'Error': '#DC2626' }

export default function UserProfileDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useApp()
  const [activeTab, setActiveTab] = useState('Activity')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventDetailTab, setEventDetailTab] = useState('Info')
  const [propSearch, setPropSearch] = useState('')

  const user = state.users.find(u => u.id === id)
  if (!user) return (
    <div className="users-page">
      <div className="users-content">
        <button className="btn-ghost" onClick={() => navigate('/users')}><ArrowLeft size={16} /> Back</button>
        <div style={{ marginTop: 24, color: 'var(--text-secondary)' }}>User not found</div>
      </div>
    </div>
  )

  const userEvents = state.events
    .filter(e => e.userId === user.id)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Group by date
  function groupByDate(events) {
    const groups = {}
    const now = new Date()
    events.forEach(evt => {
      const d = new Date(evt.timestamp)
      const today = new Date(now); today.setHours(0,0,0,0)
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
      const evtDay = new Date(d); evtDay.setHours(0,0,0,0)
      let label
      if (evtDay.getTime() === today.getTime()) label = 'Today'
      else if (evtDay.getTime() === yesterday.getTime()) label = 'Yesterday'
      else label = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      if (!groups[label]) groups[label] = []
      groups[label].push(evt)
    })
    return groups
  }

  const eventGroups = groupByDate(userEvents)

  const initials = user.displayName.split(' ').map(w => w[0]).join('').substring(0, 2)

  const filteredProps = Object.entries(user.properties || {}).filter(([k]) => !propSearch || k.toLowerCase().includes(propSearch.toLowerCase()))

  return (
    <div className="user-detail-page">
      {/* Left panel */}
      <div className="user-detail-left">
        <button className="btn-ghost" style={{ marginBottom: 16, fontSize: 13 }} onClick={() => navigate('/users')}>
          <ArrowLeft size={15} /> Back to Users
        </button>
        <div className="user-avatar-large">{initials}</div>
        <div className="user-display-name">{user.displayName}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{user.userId}</div>

        <div className="user-props-search">
          <Search size={13} />
          <input
            className="user-props-search-input"
            placeholder="Search properties..."
            value={propSearch}
            onChange={e => setPropSearch(e.target.value)}
          />
        </div>

        <div className="user-props-section">
          <div className="user-props-label">User Properties</div>
          {filteredProps.map(([k, v]) => (
            <div key={k} className="user-prop-row">
              <span className="user-prop-key">{k}</span>
              <span className="user-prop-val">{String(v)}</span>
            </div>
          ))}
        </div>

        <div className="user-props-section" style={{ marginTop: 12 }}>
          <div className="user-props-label">Device Info</div>
          {[['Country', user.country], ['Platform', user.platform], ['OS', user.os], ['Browser', user.browser]].map(([k, v]) => (
            <div key={k} className="user-prop-row">
              <span className="user-prop-key">{k}</span>
              <span className="user-prop-val">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center panel */}
      <div className="user-detail-center">
        <div className="user-detail-tabs">
          {['Activity', 'Insights', 'Session Replays', 'Cohorts', 'Experiments', 'Flags'].map(tab => (
            <button
              key={tab}
              className={`user-detail-tab ${activeTab === tab ? 'user-detail-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >{tab}</button>
          ))}
        </div>

        <div className="user-events-stream">
          {activeTab === 'Activity' && (
            <>
          {Object.entries(eventGroups).map(([date, evts]) => (
            <div key={date}>
              <div className="event-date-header">{date}</div>
              {evts.map(evt => (
                <div
                  key={evt.id}
                  className={`event-stream-row ${selectedEvent?.id === evt.id ? 'event-stream-row-active' : ''}`}
                  onClick={() => setSelectedEvent(evt)}
                >
                  <button className="event-play-btn">&#9654;</button>
                  <div className="event-stream-time">
                    {new Date(evt.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div
                    className="event-stream-badge"
                    style={{ background: (EVENT_COLORS[evt.name] || '#607D8B') + '20', color: EVENT_COLORS[evt.name] || '#607D8B' }}
                  >
                    {evt.name}
                  </div>
                  {evt.properties?.['Page Title'] && (
                    <div className="event-stream-detail">{evt.properties['Page Title']}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
          {userEvents.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No events found</div>
          )}
            </>
          )}

          {activeTab === 'Insights' && (
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>User Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Events</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{userEvents.length}</div>
                  </div>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Unique Event Types</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{new Set(userEvents.map(e => e.name)).size}</div>
                  </div>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>First Seen</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{user.firstSeen}</div>
                  </div>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Last Seen</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{user.lastSeen}</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Top Events</div>
              {(() => {
                const counts = {}
                userEvents.forEach(e => { counts[e.name] = (counts[e.name] || 0) + 1 })
                return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-sep)', fontSize: 13 }}>
                    <span style={{ color: EVENT_COLORS[name] || 'var(--text-primary)', fontWeight: 500 }}>{name}</span>
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                ))
              })()}
            </div>
          )}

          {activeTab === 'Session Replays' && (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 48, opacity: 0.3, marginBottom: 12 }}>{'\uD83C\uDFAC'}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Session Replays</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>View recorded sessions for this user.</div>
              <button className="btn-primary" onClick={() => navigate('/session-replay')}>Go to Session Replays</button>
            </div>
          )}

          {activeTab === 'Cohorts' && (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Cohorts this user belongs to</div>
              {state.cohorts.filter(c => c.name === 'All Users' || Math.random() > 0.5).map(cohort => (
                <div key={cohort.id} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', marginBottom: 8, fontSize: 13 }}>
                  <div style={{ fontWeight: 500, color: 'var(--primary)' }}>{cohort.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cohort.description}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Experiments' && (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Experiments involving this user</div>
              {(state.experiments || []).map(exp => (
                <div key={exp.id} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', marginBottom: 8, fontSize: 13, cursor: 'pointer' }}
                  onClick={() => navigate(`/experiment/${exp.id}`)}>
                  <div style={{ fontWeight: 500 }}>{exp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Status: {exp.status} | Variant: {exp.variants?.[0]?.name || 'N/A'}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Flags' && (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Feature Flags</div>
              {[
                { name: 'new-dashboard', enabled: true },
                { name: 'beta-analytics', enabled: false },
                { name: 'enhanced-search', enabled: true },
              ].map(flag => (
                <div key={flag.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-sep)', fontSize: 13 }}>
                  <span style={{ fontFamily: 'monospace' }}>{flag.name}</span>
                  <span className={flag.enabled ? 'badge badge-green' : 'badge badge-gray'}>{flag.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Event detail */}
      {selectedEvent && (
        <div className="user-detail-right">
          <div className="event-detail-tabs">
            {['Info', 'Raw'].map(tab => (
              <button
                key={tab}
                className={`modal-tab ${eventDetailTab === tab ? 'modal-tab-active' : ''}`}
                onClick={() => setEventDetailTab(tab)}
              >{tab}</button>
            ))}
          </div>
          <div className="event-detail-body">
            <div className="event-detail-name">{selectedEvent.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
              {new Date(selectedEvent.timestamp).toLocaleString()}
            </div>
            {eventDetailTab === 'Info' ? (
              <div className="event-props-list">
                {Object.entries(selectedEvent.properties || {}).filter(([, v]) => v != null).map(([k, v]) => (
                  <div key={k} className="user-prop-row">
                    <span className="user-prop-key">{k}</span>
                    <span className="user-prop-val">{String(v)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="event-raw-json">{JSON.stringify(selectedEvent, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
