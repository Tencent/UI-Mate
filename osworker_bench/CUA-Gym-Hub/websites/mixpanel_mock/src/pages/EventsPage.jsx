import React, { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Header from '../components/Header.jsx'
import { ChevronRight, ChevronDown, MoreHorizontal, Search } from 'lucide-react'

function timeAgo(iso) {
  const now = new Date('2026-01-22T10:00:00Z')
  const then = new Date(iso)
  const diff = (now - then) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function EventsPage() {
  const { state } = useApp()
  const events = state?.events || []
  const [expandedId, setExpandedId] = useState(null)
  const [searchVal, setSearchVal] = useState('')
  const [jsonMode, setJsonMode] = useState(false)

  const filtered = events.filter(e => {
    if (!searchVal) return true
    const q = searchVal.toLowerCase()
    return e.eventName.toLowerCase().includes(q) || e.distinctId.toLowerCase().includes(q)
  }).slice(0, 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header title="Events" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderBottom: '1px solid #E4E4E8', background: '#fff' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} color="#8E8EA0" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search events..." style={{
            width: '100%', border: '1px solid #E4E4E8', borderRadius: 6, padding: '7px 10px 7px 30px',
            fontSize: 13, outline: 'none'
          }}
          onFocus={e => e.target.style.borderColor = '#4F44E0'}
          onBlur={e => e.target.style.borderColor = '#E4E4E8'} />
        </div>
        <span style={{ fontSize: 13, color: '#8E8EA0' }}>
          Showing <strong style={{ color: '#1B1B2E' }}>{filtered.length}</strong> of {events.length} events
        </span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F7F7F8', position: 'sticky', top: 0, zIndex: 10 }}>
              <th style={thStyle} width={32}></th>
              <th style={thStyle}>Event Name</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Distinct ID</th>
              <th style={thStyle}>City</th>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>OS</th>
              <th style={thStyle}>Browser</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event) => {
              const isExpanded = expandedId === event.id
              return (
                <React.Fragment key={event.id}>
                  <tr
                    style={{ borderBottom: '1px solid #E4E4E8', cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = '#F9F9FB')}
                    onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = '')}
                  >
                    <td style={tdStyle}>
                      <span style={{ color: '#8E8EA0', display: 'flex' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{event.eventName}</td>
                    <td style={{ ...tdStyle, color: '#8E8EA0' }}>{timeAgo(event.time)}</td>
                    <td style={tdStyle}>
                      <span style={{ color: '#4F44E0', cursor: 'pointer' }}>
                        {event.distinctId.length > 20 ? event.distinctId.slice(0, 18) + '...' : event.distinctId}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#585870' }}>{event.city}</td>
                    <td style={{ ...tdStyle, color: '#585870' }}>{event.country}</td>
                    <td style={{ ...tdStyle, color: '#585870' }}>{event.operatingSystem}</td>
                    <td style={{ ...tdStyle, color: '#585870' }}>{event.browser}</td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={8} style={{ background: '#F9F9FB', borderBottom: '1px solid #E4E4E8', padding: 0 }}>
                        <div style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#1B1B2E' }}>Properties</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', color: '#8E8EA0' }}>
                              <div style={{
                                width: 34, height: 18, borderRadius: 9,
                                background: jsonMode ? '#4F44E0' : '#E4E4E8',
                                position: 'relative', transition: 'background 0.15s', cursor: 'pointer'
                              }} onClick={() => setJsonMode(v => !v)}>
                                <div style={{
                                  width: 14, height: 14, borderRadius: '50%', background: '#fff',
                                  position: 'absolute', top: 2, left: jsonMode ? 18 : 2, transition: 'left 0.15s'
                                }} />
                              </div>
                              JSON
                            </label>
                          </div>

                          {jsonMode ? (
                            <pre style={{ fontSize: 12, color: '#1B1B2E', background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #E4E4E8', overflow: 'auto', maxHeight: 300 }}>
                              {JSON.stringify({ ...event, properties: event.properties }, null, 2)}
                            </pre>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                              <PropItem label="City" value={event.city} />
                              <PropItem label="Country" value={event.country} />
                              <PropItem label="OS" value={event.operatingSystem} />
                              <PropItem label="Browser" value={event.browser} />
                              <PropItem label="Browser Version" value={event.browserVersion} />
                              <PropItem label="Time" value={new Date(event.time).toLocaleString()} />
                              <PropItem label="URL" value={event.currentUrl} isLink />
                              {Object.entries(event.properties || {}).map(([k, v]) => (
                                <PropItem key={k} label={k} value={String(v)} />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle = {
  padding: '8px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
  color: '#8E8EA0', borderBottom: '1px solid #E4E4E8', whiteSpace: 'nowrap'
}

const tdStyle = {
  padding: '8px 16px', fontSize: 13, color: '#1B1B2E', verticalAlign: 'middle'
}

function PropItem({ label, value, isLink }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '4px 0', fontSize: 12 }}>
      <span style={{ color: '#8E8EA0', whiteSpace: 'nowrap', minWidth: 80 }}>{label}:</span>
      {isLink ? (
        <a href="#" onClick={e => e.preventDefault()} style={{ color: '#4F44E0', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</a>
      ) : (
        <span style={{ color: '#1B1B2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      )}
    </div>
  )
}
