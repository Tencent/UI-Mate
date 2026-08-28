import { useState } from 'react'
import { Info, Search, ChevronDown, Plus } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import './DataEvents.css'

export default function DataEvents() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Events')
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeSidebarItem, setActiveSidebarItem] = useState('Events')
  const [detailTab, setDetailTab] = useState('DETAILS')
  const [editingDescription, setEditingDescription] = useState(false)
  const [descriptionVal, setDescriptionVal] = useState('')

  const tabs = ['Events', 'Custom Events', 'Labeled Events']

  const filtered = state.eventDefinitions.filter(e => {
    if (activeTab === 'Labeled Events') return false
    if (activeTab === 'Custom Events') return false
    return !search || e.name.toLowerCase().includes(search.toLowerCase())
  })

  // Mini sparkline data (seeded per event)
  function getSparkData(evtId) {
    let seed = 0
    for (let i = 0; i < evtId.length; i++) seed = ((seed << 5) - seed) + evtId.charCodeAt(i)
    const data = []
    for (let i = 0; i < 10; i++) {
      seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
      data.push({ v: Math.abs(seed % 20) })
    }
    return data
  }

  function handleSaveDescription() {
    if (selectedEvent && descriptionVal !== selectedEvent.description) {
      dispatch({ type: 'UPDATE_EVENT_DEFINITION', payload: { id: selectedEvent.id, description: descriptionVal } })
      setSelectedEvent({ ...selectedEvent, description: descriptionVal })
    }
    setEditingDescription(false)
  }

  // Find charts using the selected event
  function getChartsUsingEvent(eventName) {
    return state.charts.filter(c => {
      if (c.config?.events?.some(e => e.eventName === eventName)) return true
      if (c.config?.steps?.some(s => s.eventName === eventName)) return true
      if (c.config?.startEvent === eventName || c.config?.returnEvent === eventName) return true
      return false
    })
  }

  return (
    <div className="data-events-page">
      {/* Inner sidebar */}
      <div className="data-sidebar">
        <div className="data-sidebar-title">Data</div>
        <div className="data-sidebar-dropdown">
          <select className="data-project-select">
            <option>default</option>
          </select>
        </div>
        <div className="data-sidebar-dropdown">
          <span className="data-branch-icon">&#9095;</span>
          <select className="data-project-select" style={{ paddingLeft: 20 }}>
            <option>main</option>
          </select>
        </div>
        <div className="data-nav">
          {['Home', 'Activity', 'Assistant', 'Visual Labeling', 'Events', 'Properties', 'Filters', 'Connections Overview', 'Sources', 'Destinations', 'Catalog'].map(item => (
            <button
              key={item}
              className={`data-nav-item ${activeSidebarItem === item ? 'data-nav-item-active' : ''}`}
              onClick={() => {
                if (item === 'Home') {
                  navigate('/home')
                } else {
                  setActiveSidebarItem(item)
                  setSelectedEvent(null)
                }
              }}
            >
              {item}
              {item === 'Visual Labeling' && <span className="badge badge-new" style={{ marginLeft: 6 }}>New</span>}
            </button>
          ))}
        </div>
        <div className="data-nav-footer">
          <button className="data-nav-item" onClick={() => navigate('/home')}>Pricing</button>
          <button className="data-nav-item" onClick={() => navigate('/home')}>Settings</button>
        </div>
      </div>

      {/* Main content */}
      <div className="data-main">
        <div className="data-content">
          {activeSidebarItem === 'Activity' && (
            <div style={{ padding: '40px 0' }}>
              <h1 className="page-title" style={{ marginBottom: 12 }}>Activity</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>View recent data ingestion activity, schema changes, and system events.</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 16px', textAlign: 'left', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>Time</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>Type</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: '2 min ago', type: 'Ingestion', details: `${state.events.length} events ingested from SDK` },
                    { time: '15 min ago', type: 'Schema Change', details: 'New property "utm_campaign" detected on Page View' },
                    { time: '1 hour ago', type: 'Ingestion', details: 'Batch of 450 events processed' },
                    { time: '3 hours ago', type: 'Config', details: 'Event "Scroll Depth" status updated to live' },
                    { time: '1 day ago', type: 'Ingestion', details: 'Daily ingestion: 1,200 events from 20 users' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)', fontFamily: 'monospace', fontSize: 12 }}>{row.time}</td>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)' }}>
                        <span className="badge badge-blue">{row.type}</span>
                      </td>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)', color: 'var(--text-secondary)' }}>{row.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSidebarItem === 'Properties' && (
            <div style={{ padding: '40px 0' }}>
              <h1 className="page-title" style={{ marginBottom: 12 }}>Properties</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Manage user properties and event properties across your data.</p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <button className="btn-outline">User Properties</button>
                <button className="btn-outline">Event Properties</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8 }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 16px', textAlign: 'left', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>Property</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>Type</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', background: 'var(--page-bg)', borderBottom: '1px solid var(--border)' }}>Used By Events</th>
                  </tr>
                </thead>
                <tbody>
                  {['plan', 'company', 'role', 'signupSource', 'totalPurchases', 'lifetimeValue'].map(prop => (
                    <tr key={prop}>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)', fontWeight: 500 }}>{prop}</td>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)', color: 'var(--text-secondary)' }}>
                        {typeof state.users[0]?.properties?.[prop] === 'number' ? 'number' : 'string'}
                      </td>
                      <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-sep)', color: 'var(--text-secondary)' }}>User Property</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSidebarItem === 'Sources' && (
            <div style={{ padding: '40px 0' }}>
              <h1 className="page-title" style={{ marginBottom: 12 }}>Sources</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Manage data sources sending events to Xmplitude.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'JavaScript SDK', type: 'Browser', status: 'Active', events: '850/day' },
                  { name: 'iOS SDK', type: 'Mobile', status: 'Active', events: '200/day' },
                  { name: 'Android SDK', type: 'Mobile', status: 'Active', events: '150/day' },
                ].map((src, i) => (
                  <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {src.type === 'Browser' ? '\uD83C\uDF10' : '\uD83D\uDCF1'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{src.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{src.type} · {src.events}</div>
                    </div>
                    <span className="badge badge-green">{src.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSidebarItem === 'Destinations' && (
            <div style={{ padding: '40px 0' }}>
              <h1 className="page-title" style={{ marginBottom: 12 }}>Destinations</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Configure destinations to export Xmplitude data.</p>
              <button className="btn-primary" style={{ marginBottom: 20 }}><Plus size={14} /> Add Destination</button>
              <div style={{ border: '1px dashed var(--border)', borderRadius: 8, padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                No destinations configured. Add a destination to start exporting data.
              </div>
            </div>
          )}

          {['Assistant', 'Visual Labeling', 'Filters', 'Connections Overview', 'Catalog'].includes(activeSidebarItem) && (
            <div style={{ padding: '40px 0' }}>
              <h1 className="page-title" style={{ marginBottom: 12 }}>{activeSidebarItem}</h1>
              {activeSidebarItem === 'Visual Labeling' && (
                <span className="badge badge-new" style={{ marginBottom: 16, display: 'inline-block' }}>New</span>
              )}
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                {activeSidebarItem === 'Assistant' && 'Get AI-powered suggestions for your data schema and event taxonomy.'}
                {activeSidebarItem === 'Visual Labeling' && 'Label events visually by clicking elements directly on your website. Select a page URL to get started.'}
                {activeSidebarItem === 'Filters' && 'Create and manage data filters for your events and properties.'}
                {activeSidebarItem === 'Connections Overview' && 'View all connected sources and destinations in one place.'}
                {activeSidebarItem === 'Catalog' && 'Browse all available integrations and data connectors.'}
              </p>
              {activeSidebarItem === 'Catalog' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {['Segment', 'Braze', 'Snowflake', 'BigQuery', 'Slack', 'Salesforce'].map(name => (
                    <div key={name} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{'\uD83D\uDD0C'}</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Integration</div>
                    </div>
                  ))}
                </div>
              )}
              {activeSidebarItem === 'Assistant' && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Schema Suggestions</div>
                  {[
                    'Consider adding a "screen_name" property to your Page View events for better mobile tracking.',
                    'The "Button Click" event has inconsistent element IDs. Consider standardizing your naming convention.',
                    'You have 3 events with fewer than 10 occurrences in the last 30 days. Consider archiving unused events.'
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-secondary)', borderBottom: i < 2 ? '1px solid var(--border-sep)' : 'none' }}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSidebarItem === 'Events' && (
            <>
          <h1 className="page-title" style={{ marginBottom: 16 }}>
            Events <button className="icon-btn" style={{ width: 20, height: 20, verticalAlign: 'middle' }}><Info size={14} /></button>
          </h1>

          <div className="data-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`data-tab ${activeTab === tab ? 'data-tab-active' : ''}`}
                onClick={() => { setActiveTab(tab); setSelectedEvent(null) }}
              >{tab}</button>
            ))}
          </div>

          <div className="data-search-row">
            <div className="search-input-wrap" style={{ width: 300 }}>
              <Search size={14} className="search-icon" />
              <input
                className="search-input"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, padding: '0 4px' }}>
            {filtered.length} events
          </div>

          {(activeTab === 'Custom Events' || activeTab === 'Labeled Events') ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No {activeTab.toLowerCase()} found. {activeTab === 'Custom Events' ? 'Create custom events by combining existing events with filters.' : 'Use Visual Labeling to create labeled events.'}
            </div>
          ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" /></th>
                <th>NAME</th>
                <th>CREATED</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(evt => (
                <tr
                  key={evt.id}
                  className={`events-row ${selectedEvent?.id === evt.id ? 'events-row-active' : ''}`}
                  onClick={() => { setSelectedEvent(evt); setDetailTab('DETAILS') }}
                >
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                  <td>
                    <div className="events-name-cell">
                      <span className="event-icon-circle" style={{ background: evt.color, fontSize: 11, width: 24, height: 24 }}>{'\uD83C\uDF10'}</span>
                      <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--primary)' }}>{evt.name}</a>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div className="events-created-cell">
                      <div className="events-avatar">{evt.createdBy[0].toUpperCase()}</div>
                      {evt.createdAt}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          </>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedEvent && (
        <div className="event-detail-panel">
          <div className="event-detail-panel-header">
            <div className="event-detail-panel-icon">
              <span style={{ fontSize: 20 }}>{'\uD83C\uDF10'}</span>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedEvent.name}</h2>
            </div>
            <button className="btn-outline" style={{ fontSize: 12, height: 28 }} onClick={() => navigate(`/chart/new?type=segmentation&event=${encodeURIComponent(selectedEvent.name)}`)}>
              {'\uD83D\uDCC8'} Create Chart
            </button>
          </div>

          <div className="event-detail-panel-tabs">
            <button className={`data-tab ${detailTab === 'DETAILS' ? 'data-tab-active' : ''}`} onClick={() => setDetailTab('DETAILS')}>DETAILS</button>
            <button className={`data-tab ${detailTab === 'USED BY' ? 'data-tab-active' : ''}`} onClick={() => setDetailTab('USED BY')}>USED BY</button>
          </div>

          <div className="event-detail-panel-body">
            {detailTab === 'DETAILS' ? (
              <>
                <div className="event-detail-row">
                  <span className="event-detail-label">Description</span>
                  {editingDescription ? (
                    <input
                      className="input"
                      style={{ fontSize: 13 }}
                      value={descriptionVal}
                      onChange={e => setDescriptionVal(e.target.value)}
                      onBlur={handleSaveDescription}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveDescription() }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="event-detail-val"
                      style={{ color: selectedEvent.description ? 'var(--text-primary)' : 'var(--text-placeholder)', fontStyle: selectedEvent.description ? 'normal' : 'italic', cursor: 'pointer' }}
                      onClick={() => { setDescriptionVal(selectedEvent.description || ''); setEditingDescription(true) }}
                    >
                      {selectedEvent.description || 'Click to add a description'}
                    </span>
                  )}
                </div>
                <div className="event-detail-row">
                  <span className="event-detail-label">Category</span>
                  <span className="event-detail-val"><span className="badge badge-blue">{selectedEvent.category}</span></span>
                </div>
                <div className="event-detail-row">
                  <span className="event-detail-label">Status</span>
                  <span className="event-detail-val"><span className="badge badge-green">{selectedEvent.status}</span></span>
                </div>
                <div className="event-detail-row">
                  <span className="event-detail-label">Created</span>
                  <span className="event-detail-val">{selectedEvent.createdAt} by {selectedEvent.createdBy}</span>
                </div>
                <div className="event-detail-row">
                  <span className="event-detail-label">Occurrences</span>
                  <div>
                    <div className="event-sparkline">
                      <ResponsiveContainer width="100%" height={40}>
                        <LineChart data={getSparkData(selectedEvent.id)}><Line dataKey="v" stroke="#7C3AED" strokeWidth={1.5} dot={false} /></LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Seen {selectedEvent.occurrencesLast30d} times in the last 30 days
                    </div>
                  </div>
                </div>
                <div className="event-detail-section">
                  <div className="event-detail-section-title">Properties ({selectedEvent.properties?.length || 0})</div>
                  {(selectedEvent.properties || []).map((prop, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-sep)', fontSize: 13 }}>
                      <span style={{ fontWeight: 500 }}>{prop.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{prop.type}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Charts and cohorts using this event:</div>
                {getChartsUsingEvent(selectedEvent.name).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {getChartsUsingEvent(selectedEvent.name).map(chart => (
                      <div
                        key={chart.id}
                        style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
                        onClick={() => navigate(`/chart/${chart.id}`)}
                      >
                        <span style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                          {chart.type === 'funnel' ? 'F' : chart.type === 'retention' ? 'R' : 'S'}
                        </span>
                        <span style={{ fontWeight: 500 }}>{chart.name}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)' }}>{chart.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                    This event is not used in any charts yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
