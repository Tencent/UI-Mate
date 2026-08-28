import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Calendar, Filter, ExternalLink, PlayCircle, X, Target, Pin, MoreHorizontal, Trash2 } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { withCurrentSearch } from '../utils/navigation.js'

function Sparkline({ data, color = '#FF3C00' }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 120
  const h = 32
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

const TABS = [
  'All sessions', 'Direct traffic', 'Error occurred', 'Mobile users',
  'New users', 'Organic traffic', 'Paid traffic', 'Rage clicked', 'Returning users'
]

export default function Dashboard() {
  const { state, dispatch } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('All sessions')
  const [selectedDashboard, setSelectedDashboard] = useState('Site overview')
  const [showNewDashboardModal, setShowNewDashboardModal] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState('')
  const [pinnedDashboards, setPinnedDashboards] = useState([])
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [createError, setCreateError] = useState('')
  const [widgetNotice, setWidgetNotice] = useState('')

  const metrics = state.dashboardMetrics

  const customDashboards = state.dashboards || []
  const allDashboards = ['Site overview', 'Testing template', ...customDashboards.map(d => d.name)]

  const hasNPS = state.surveys?.some(s => s.questions?.some(q => q.type === 'nps') && s.status === 'active')

  function handleCreateDashboard() {
    if (!newDashboardName.trim()) {
      setCreateError('Enter a dashboard name before creating it.')
      return
    }
    dispatch({
      type: 'CREATE_DASHBOARD',
      payload: {
        id: `dashboard-${Date.now()}`,
        name: newDashboardName.trim(),
        createdAt: new Date().toISOString(),
        widgets: []
      }
    })
    setSelectedDashboard(newDashboardName.trim())
    setNewDashboardName('')
    setCreateError('')
    setShowNewDashboardModal(false)
  }

  function handleAddWidget(widget) {
    const widgetEntry = {
      id: `widget-${Date.now()}`,
      dashboardName: selectedDashboard,
      type: widget.id,
      label: widget.label,
      createdAt: new Date().toISOString()
    }
    dispatch({
      type: 'SET_STATE',
      payload: {
        ...state,
        dashboardWidgets: [...(state.dashboardWidgets || []), widgetEntry]
      }
    })
    setWidgetNotice(`${widget.label} added to ${selectedDashboard}.`)
    setShowAddWidget(false)
  }

  function togglePin(name) {
    setPinnedDashboards(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const dateRanges = ['Last 7 days', 'Last 15 days', 'Last 30 days', 'Last 90 days', 'Custom']

  const widgetTypes = [
    { id: 'sessions', label: 'Sessions', desc: 'Total visitor sessions over time' },
    { id: 'heatmap', label: 'Heatmap summary', desc: 'Click density overview' },
    { id: 'feedback', label: 'Feedback summary', desc: 'Recent visitor feedback' },
    { id: 'nps', label: 'NPS Score', desc: 'Net Promoter Score widget' },
    { id: 'recordings', label: 'Recordings', desc: 'Latest session recordings' },
    { id: 'funnel', label: 'Funnel', desc: 'Conversion funnel widget' },
  ]

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Dashboard sub-sidebar */}
      <div style={{ width: 240, minWidth: 240, borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', padding: '16px 0', overflow: 'auto', flexShrink: 0 }}>
        <div style={{ padding: '0 12px', marginBottom: 12 }}>
          <button className="btn-blue" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '7px 12px' }} onClick={() => setShowNewDashboardModal(true)}>
            <Plus size={14} />
            New dashboard
          </button>
        </div>
        <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PINNED</div>
        {pinnedDashboards.length === 0 ? (
          <div style={{ padding: '8px 12px', fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Any dashboards you pin will show here</div>
        ) : (
          pinnedDashboards.map(name => (
            <div
              key={`pin-${name}`}
              className={`sub-sidebar-item ${selectedDashboard === name ? 'active' : ''}`}
              onClick={() => setSelectedDashboard(name)}
            >
              <Pin size={12} style={{ flexShrink: 0 }} />
              {name}
            </div>
          ))
        )}
        <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8 }}>DASHBOARDS</div>
        {allDashboards.map(d => (
          <div
            key={d}
            className={`sub-sidebar-item ${selectedDashboard === d ? 'active' : ''}`}
            style={{ justifyContent: 'space-between' }}
          >
            <span onClick={() => setSelectedDashboard(d)} style={{ flex: 1 }}>{d}</span>
            <button
              className="header-icon-btn"
              style={{ width: 24, height: 24, opacity: 0.5 }}
              onClick={(e) => { e.stopPropagation(); togglePin(d) }}
              title={pinnedDashboards.includes(d) ? 'Unpin' : 'Pin'}
            >
              <Pin size={12} fill={pinnedDashboards.includes(d) ? '#FF3C00' : 'none'} color={pinnedDashboards.includes(d) ? '#FF3C00' : '#6B7280'} />
            </button>
          </div>
        ))}
      </div>

      {/* Main dashboard content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">An aggregated view of all your data</p>
          </div>
          <button className="btn-blue" onClick={() => setShowAddWidget(true)}>
            <Plus size={16} />
            Add widget
          </button>
        </div>
        {widgetNotice && (
          <div style={{ marginBottom: 12, padding: '8px 10px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, color: '#047857', fontSize: 13 }}>
            {widgetNotice}
          </div>
        )}

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, position: 'relative' }}>
          <div className="filter-pill" onClick={() => setShowDatePicker(!showDatePicker)}>
            <Calendar size={14} />
            {dateRange}
          </div>
          {showDatePicker && (
            <div className="dropdown-menu" style={{ top: '100%', left: 0, marginTop: 4 }}>
              {dateRanges.map(r => (
                <div key={r} className="dropdown-item" onClick={() => { setDateRange(r); setShowDatePicker(false) }}>{r}</div>
              ))}
            </div>
          )}
          <div className="filter-pill">
            <Filter size={14} />
            Add filter
          </div>
        </div>

        {/* Segment tabs */}
        <div className="tab-bar" style={{ overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="metric-card">
            <div className="metric-label">Total sessions</div>
            <div className="metric-value">{metrics?.totalSessions?.toLocaleString() || '0'}</div>
            <Sparkline data={metrics?.sessionsSparkline} color="#FF3C00" />
          </div>
          <div className="metric-card">
            <div className="metric-label">Avg. session duration</div>
            <div className="metric-value">{metrics?.avgSessionDuration || '0:00'}</div>
            <Sparkline data={metrics?.durationSparkline?.map(v => v)} color="#10B981" />
          </div>
          <div className="metric-card">
            <div className="metric-label">Avg. pages / session</div>
            <div className="metric-value">{metrics?.avgPagesPerSession?.toFixed(1) || '0.0'}</div>
            <Sparkline data={metrics?.pagesSparkline?.map(v => Math.round(v * 10))} color="#F59E0B" />
          </div>
          <div className="metric-card">
            <div className="metric-label">Bounce rate</div>
            <div className="metric-value">34.2%</div>
            <Sparkline data={[32, 35, 34, 31, 36, 33, 34, 38, 35, 32, 34, 33, 35, 36, 34, 32, 33, 35, 34, 36, 33, 35, 32, 34, 36, 35, 33, 34, 35, 34]} color="#EF4444" />
          </div>
        </div>

        {/* Main content row */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 16 }}>
          {/* Page Overview widget */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Page overview</div>
              <div className="filter-pill" style={{ fontSize: 12 }}>
                All pages
                <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3l3 3 3-3" fill="none" stroke="#6B7280" strokeWidth="1.5" /></svg>
              </div>
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: 6, padding: 16, marginBottom: 16, minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                <div style={{ width: 80, height: 56, background: '#E5E7EB', borderRadius: 4, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', margin: '0 2px' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', margin: '0 2px' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF', margin: '0 2px' }} />
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Mock website preview</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Sessions', value: metrics?.totalSessions?.toLocaleString() || '0' },
                { label: 'Clicks', value: '183K' },
                { label: 'Rage clicks', value: metrics?.rageClicksCount || '0' },
                { label: 'Avg. time on page', value: '2:45' },
                { label: 'Avg. scroll depth', value: '62%' },
                { label: 'Drop-off rate', value: '34.2%' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>{stat.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#2D3038' }}>{stat.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => navigate(withCurrentSearch('/heatmaps', location.search))}>
                <Target size={14} />
                View heatmap
              </button>
              <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => navigate(withCurrentSearch('/recordings', location.search))}>
                <PlayCircle size={14} />
                Play recordings
              </button>
            </div>
          </div>

          {/* Top Clicked Elements */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Top clicked buttons & links</div>
            </div>
            {(metrics?.topClickedElements || []).map((el, i) => {
              const maxSessions = metrics.topClickedElements[0]?.sessions || 1
              const pct = (el.sessions / maxSessions) * 100
              return (
                <div key={i} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => navigate(withCurrentSearch('/heatmaps', location.search))}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: '#2D3038' }}>{el.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: '#6B7280' }}>{el.sessions.toLocaleString()} sessions</span>
                      <ExternalLink size={12} color="#9CA3AF" style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: '#FF3C00' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {/* Rage clicks & U-turns */}
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(withCurrentSearch('/recordings', location.search))}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Rage clicks & u-turns</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Sessions of users who felt frustrated or confused</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: 12, background: '#FEF2F2', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#EF4444' }}>{metrics?.rageClicksCount || 0}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Rage clicks</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: '#FFF7ED', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#F59E0B' }}>{metrics?.uTurnsCount || 0}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>U-turns</div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(withCurrentSearch('/feedback', location.search))}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Feedback</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: 12, background: '#F0FDF4', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>{metrics?.feedbackPositive || 0}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Positive</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: '#FEF2F2', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#EF4444' }}>{metrics?.feedbackNegative || 0}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Negative</div>
              </div>
            </div>
          </div>

          {/* NPS */}
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(withCurrentSearch('/surveys', location.search))}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Net Promoter Score (NPS)</div>
            {hasNPS ? (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#10B981' }}>42</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>NPS Score</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Looks like NPS isn't set up</div>
                <button className="btn-blue" style={{ fontSize: 13 }} onClick={(e) => { e.stopPropagation(); navigate(withCurrentSearch('/surveys/new', location.search)) }}>
                  <Plus size={14} />
                  Create NPS survey
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Dashboard Modal */}
      {showNewDashboardModal && (
        <div className="modal-overlay" onClick={() => setShowNewDashboardModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 600, fontSize: 16 }}>Create new dashboard</div>
              <button className="header-icon-btn" onClick={() => setShowNewDashboardModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label className="label">Dashboard name</label>
              <input
                className="input"
                value={newDashboardName}
                onChange={e => setNewDashboardName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateDashboard()}
                placeholder="e.g. Marketing overview"
                autoFocus
              />
              {createError && <p style={{ fontSize: 12, color: '#B91C1C', marginTop: 8 }}>{createError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowNewDashboardModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateDashboard}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="modal-overlay" onClick={() => setShowAddWidget(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 600, fontSize: 16 }}>Add widget</div>
              <button className="header-icon-btn" onClick={() => setShowAddWidget(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Choose a widget type to add to your dashboard</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {widgetTypes.map(w => (
                  <div
                    key={w.id}
                    className="card"
                    style={{ cursor: 'pointer', padding: 16, transition: 'border-color 0.15s' }}
                    onClick={() => handleAddWidget(w)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#FF3C00'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{w.label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{w.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
