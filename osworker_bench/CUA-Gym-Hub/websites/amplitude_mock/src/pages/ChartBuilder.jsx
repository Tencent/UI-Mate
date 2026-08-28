import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import {
  TrendingUp, Filter, Grid, RotateCcw, Workflow, MoreHorizontal,
  ChevronDown, Info, Plus, X, Share2, Trash2, Check, Bell,
  RefreshCw, Download
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'
import { useApp } from '../context/AppContext'
import './ChartBuilder.css'

const CHART_TYPES = [
  { id: 'segmentation', label: 'Segmentation', icon: TrendingUp },
  { id: 'funnel', label: 'Funnel', icon: Filter },
  { id: 'dataTable', label: 'Data Table', icon: Grid },
  { id: 'retention', label: 'Retention', icon: RotateCcw },
  { id: 'journeys', label: 'Journeys', icon: Workflow },
]

const MEASURED_AS_OPTIONS = ['Uniques', 'Event Totals', 'Active %', 'Average', 'Frequency', 'Properties']

const SERIES_COLORS = ['#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#EC4899', '#6366F1', '#6B7280']
const VIZ_OPTIONS = ['Line chart', 'Bar chart', 'Stacked bar', 'Pie chart', 'Area chart']
const TIME_RANGES = ['7d', '30d', '60d', '90d']
const INTERVALS = ['Daily', 'Weekly', 'Monthly']

function ShareModal({ onClose }) {
  const [tab, setTab] = useState('Share')
  const members = [
    { name: 'Sam Lee', email: 'samlee@example.com', lastViewed: '37 seconds ago' },
    { name: 'Alice Johnson', email: 'alice@example.com', lastViewed: '2 hours ago' },
  ]
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-tabs">
          {['Share', 'Embed', 'View History'].map(t => (
            <button key={t} className={`modal-tab ${tab === t ? 'modal-tab-active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {tab === 'View History' && (
          <table className="share-table">
            <thead><tr><th>NAME</th><th>LAST VIEWED</th></tr></thead>
            <tbody>
              {members.map(m => (
                <tr key={m.email}>
                  <td>
                    <div className="share-member">
                      <div className="share-avatar">{m.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{m.lastViewed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'Share' && (
          <div style={{ padding: 20 }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Share this chart with your team members.</p>
            <input className="input" style={{ marginTop: 12 }} placeholder="Enter email address" />
          </div>
        )}
        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}

function EventPickerDropdown({ onSelect, onClose, eventDefinitions }) {
  const [search, setSearch] = useState('')
  const filtered = eventDefinitions.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
  const [hoveredEvent, setHoveredEvent] = useState(filtered[0])

  return (
    <div className="event-picker-overlay" onClick={onClose}>
      <div className="event-picker" onClick={e => e.stopPropagation()}>
        <div className="event-picker-left">
          <input
            className="input event-picker-search"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className="event-picker-section-label">Xmplitude</div>
          {filtered.map(evtDef => (
            <button
              key={evtDef.id}
              className={`event-picker-item ${hoveredEvent?.id === evtDef.id ? 'event-picker-item-hovered' : ''}`}
              onMouseEnter={() => setHoveredEvent(evtDef)}
              onClick={() => { onSelect(evtDef); onClose() }}
            >
              <span className="event-icon-circle" style={{ background: evtDef.color }}>🌐</span>
              <span className="event-picker-name">{evtDef.name}</span>
              <span className="event-picker-count">{evtDef.occurrencesLast30d}</span>
            </button>
          ))}
        </div>
        <div className="event-picker-right">
          {hoveredEvent && (
            <>
              <div className="event-picker-preview-label">DEFAULT EVENTS</div>
              <div className="event-picker-preview-name">{hoveredEvent.displayName}</div>
              <div className="event-picker-preview-desc">{hoveredEvent.description}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChartBuilder() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()

  const initialType = searchParams.get('type') || 'segmentation'

  // Find existing chart or create draft
  const existingChart = id && id !== 'new' ? state.charts.find(c => c.id === id) : null

  const [chartType, setChartType] = useState(existingChart?.type || initialType)
  const [title, setTitle] = useState(existingChart?.name || 'Page views')
  const [editingTitle, setEditingTitle] = useState(false)
  const [measuredAs, setMeasuredAs] = useState(existingChart?.config?.measuredAs || 'uniques')
  const [viz, setViz] = useState(existingChart?.config?.chartVisualization || 'line')
  const [timeRange, setTimeRange] = useState(existingChart?.config?.timeRange || '30d')
  const [interval, setInterval] = useState(existingChart?.config?.interval || 'daily')
  const [saved, setSaved] = useState(!!existingChart && existingChart.status === 'saved')
  const [showShare, setShowShare] = useState(false)
  const [showEventPicker, setShowEventPicker] = useState(false)
  const [events, setEvents] = useState(existingChart?.config?.events || [
    { letter: 'A', eventName: 'Page View', filters: [], groupBy: null }
  ])
  const [segments, setSegments] = useState([
    { id: 'seg_1', name: 'All Users', filters: [] }
  ])
  const [showBreakdownSearch, setShowBreakdownSearch] = useState(false)
  const [checkedRows, setCheckedRows] = useState({ 'All Users': true })

  const chartData = existingChart?.data || null

  function addSegment() {
    const newSeg = { id: `seg_${Date.now()}`, name: `Segment ${segments.length + 1}`, filters: [] }
    setSegments(prev => [...prev, newSeg])
    setCheckedRows(prev => ({ ...prev, [newSeg.name]: true }))
  }

  function removeSegment(segId) {
    setSegments(prev => prev.filter(s => s.id !== segId))
  }

  const [chartSession, setChartSession] = useState({
    chartType: existingChart?.type || initialType,
    lastSwitched: null
  })

  function handleChartTypeChange(newType) {
    setChartType(newType)
    setChartSession({ chartType: newType, lastSwitched: new Date().toISOString() })
    if (existingChart) {
      dispatch({ type: 'UPDATE_CHART_CONFIG', payload: { chartId: existingChart.id, config: { chartType: newType } } })
    }
  }

  // Get line chart data
  function getLineData() {
    if (chartData?.series?.[0]?.dataPoints) {
      return chartData.series[0].dataPoints.map((p, i) => {
        const d = new Date(p.date)
        return {
          label: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`,
          value: p.value,
          date: p.date
        }
      })
    }
    // Generate mock data for new draft
    const data = []
    const start = new Date('2024-11-16')
    for (let i = 0; i < 30; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      data.push({
        label: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`,
        value: Math.floor(Math.random() * 4),
        date: d.toISOString().split('T')[0]
      })
    }
    return data
  }

  function getPieData() {
    if (chartData?.series && chartData.series[0]?.value !== undefined) {
      return chartData.series.map((s, i) => ({ name: s.name, value: s.value || s.percentage || 25, color: s.color || SERIES_COLORS[i] }))
    }
    return [
      { name: '1 time', value: 25, color: '#7C3AED' },
      { name: '3 times', value: 50, color: '#8BC34A' },
      { name: '4 times', value: 25, color: '#9C27B0' },
    ]
  }

  function getBarData() {
    if (chartData?.series?.[0]?.dataPoints) {
      return chartData.series[0].dataPoints.map(p => {
        const d = new Date(p.date)
        return { label: `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`, value: p.value }
      })
    }
    return [
      { label: 'Nov 16', value: 3 }, { label: 'Nov 23', value: 5 },
      { label: 'Nov 30', value: 8 }, { label: 'Dec 7', value: 12 }, { label: 'Dec 14', value: 15 }
    ]
  }

  function getFunnelData() {
    if (chartData?.steps) return chartData.steps
    return [
      { name: 'Start Session', count: 100, percentage: 100 },
      { name: 'Page Viewed', count: 85, percentage: 85 },
      { name: 'Element Clicked', count: 25, percentage: 25 }
    ]
  }

  function getRetentionData() {
    if (chartData?.curve) return chartData.curve
    return [
      { day: 0, percentage: 100 }, { day: 1, percentage: 42 }, { day: 2, percentage: 28 },
      { day: 3, percentage: 20 }, { day: 7, percentage: 8 }, { day: 14, percentage: 4 }, { day: 30, percentage: 2 }
    ]
  }

  function handleSave() {
    const now = new Date().toISOString()
    const chartId = existingChart?.id || `chart_${Date.now()}`
    const newChart = {
      id: chartId,
      name: title,
      description: '',
      type: chartType,
      status: 'saved',
      owner: state.currentUser.name,
      ownerEmail: state.currentUser.email,
      createdAt: existingChart?.createdAt || now,
      updatedAt: now,
      dashboardIds: existingChart?.dashboardIds || [],
      notebookIds: existingChart?.notebookIds || [],
      config: {
        events,
        measuredAs,
        segments: [{ id: 'seg_1', name: 'All Users', filters: [], cohortId: null }],
        chartVisualization: viz,
        timeRange,
        interval: interval.toLowerCase(),
        groupSegmentBy: null,
        formula: null
      },
      data: chartData || { series: [], breakdownTable: [] }
    }
    dispatch({ type: 'SAVE_CHART', payload: newChart })
    setSaved(true)
    if (!existingChart) navigate(`/chart/${chartId}`)
  }

  function handleDelete() {
    if (existingChart) {
      dispatch({ type: 'DELETE_CHART', payload: existingChart.id })
      navigate('/content')
    }
  }

  const lineData = getLineData()
  const breakdownTable = chartData?.breakdownTable || [
    { segment: 'All Users', values: { 'Thu, Dec 12': 1, 'Fri, Dec 13': 0, 'Sat, Dec 14': 0, 'Sun, Dec 15': 0, 'Mon, Dec 16': 3 }, rowAverage: 0.13 }
  ]
  const funnelSteps = getFunnelData()
  const retentionCurve = getRetentionData()

  const currentVizLabel = viz === 'line' ? 'Line chart' : viz === 'bar' ? 'Bar chart' : viz === 'pie' ? 'Pie chart' : viz === 'stacked_bar' ? 'Stacked bar' : 'Area chart'

  return (
    <div className="chart-builder">
      {/* Left panel */}
      <div className="chart-left-panel">
        {/* Project dropdown */}
        <div className="chart-project-bar">
          <button className="project-btn">default <ChevronDown size={14} /></button>
        </div>

        {/* Chart type tabs */}
        <div className="chart-type-tabs">
          {CHART_TYPES.map(ct => {
            const Icon = ct.icon
            return (
              <button
                key={ct.id}
                className={`chart-type-tab ${chartType === ct.id ? 'chart-type-tab-active' : ''}`}
                onClick={() => handleChartTypeChange(ct.id)}
                title={ct.label}
              >
                <Icon size={18} />
                <span>{ct.label}</span>
              </button>
            )
          })}
          <button className="chart-type-tab" title="More"><MoreHorizontal size={18} /></button>
        </div>

        <div className="chart-panel-scroll">
          {/* Events section */}
          <div className="chart-section">
            <div className="chart-section-header">
              <button className="chart-section-title">
                <ChevronDown size={14} /> {chartType === 'funnel' ? 'Steps' : chartType === 'retention' ? 'Start Event' : 'Events'}
              </button>
              <button className="btn-ghost" style={{ fontSize: 12 }}>Explorer</button>
            </div>

            {chartType === 'retention' ? (
              <div className="chart-retention-config">
                <div className="retention-event-row">
                  <span className="retention-event-label">Start event:</span>
                  <button className="chart-event-tag">New User <ChevronDown size={12} /></button>
                </div>
                <div className="retention-event-row" style={{ marginTop: 8 }}>
                  <span className="retention-event-label">Return event:</span>
                  <button className="chart-event-tag">Any Active Event <ChevronDown size={12} /></button>
                </div>
              </div>
            ) : chartType === 'funnel' ? (
              <>
                {funnelSteps.map((step, i) => (
                  <div key={i} className="chart-event-row">
                    <div className="event-row-main">
                      <span className="event-step-badge">{i + 1}</span>
                      <span className="event-icon-circle" style={{ background: '#7C3AED', fontSize: 12 }}>🌐</span>
                      <span className="event-name">{step.name}</span>
                      <button className="icon-btn" style={{ marginLeft: 'auto' }}><MoreHorizontal size={14} /></button>
                    </div>
                  </div>
                ))}
                <button className="chart-add-btn" onClick={() => setShowEventPicker(true)}>+ Add Step</button>
              </>
            ) : (
              <>
                {events.map((evt, i) => (
                  <div key={i} className="chart-event-row">
                    <div className="event-row-main">
                      <span className="event-letter-badge">{evt.letter}</span>
                      <span className="event-icon-circle" style={{ background: '#7C3AED', fontSize: 12 }}>🌐</span>
                      <span className="event-name">{evt.eventName}</span>
                      <button className="icon-btn" style={{ marginLeft: 'auto' }}><MoreHorizontal size={14} /></button>
                    </div>
                    <div className="event-row-links">
                      <button className="event-link-btn">+ Filter by</button>
                      <button className="event-link-btn">+ Group-by</button>
                    </div>
                  </div>
                ))}
                <button className="chart-add-btn" onClick={() => setShowEventPicker(true)}>+ Add Event</button>
              </>
            )}
          </div>

          {/* Measured as section */}
          {chartType !== 'retention' && chartType !== 'funnel' && (
            <div className="chart-section">
              <div className="chart-section-header">
                <button className="chart-section-title">
                  <ChevronDown size={14} /> Measured as
                  <button className="icon-btn" style={{ width: 20, height: 20 }}><Info size={12} /></button>
                </button>
                <button className="btn-ghost" style={{ fontSize: 12 }}>Advanced <ChevronDown size={12} /></button>
              </div>
              <div className="measured-as-grid">
                {MEASURED_AS_OPTIONS.map(opt => {
                  const key = opt.toLowerCase().replace(/ /g, '').replace('%', 'Percent')
                  const optKey = opt === 'Event Totals' ? 'eventTotals' : opt === 'Active %' ? 'activePercent' : opt.toLowerCase()
                  const isActive = measuredAs === optKey
                  return (
                    <button
                      key={opt}
                      className={`measured-as-pill ${isActive ? 'measured-as-pill-active' : ''}`}
                      onClick={() => setMeasuredAs(optKey)}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {measuredAs === 'frequency' && (
                <div style={{ marginTop: 8 }}>
                  <button className="btn-outline" style={{ width: '100%', fontSize: 13 }}>
                    Set buckets <ChevronDown size={12} />
                  </button>
                </div>
              )}
              <button className="chart-formula-btn">✨ Formula</button>
            </div>
          )}

          {/* Segment by section */}
          <div className="chart-section">
            <div className="chart-section-header">
              <div className="chart-section-title">
                <ChevronDown size={14} /> Segment by
                <button className="btn-outline" style={{ height: 24, padding: '0 8px', fontSize: 12 }}>Any <ChevronDown size={11} /></button>
                <button className="btn-outline" style={{ height: 24, padding: '0 8px', fontSize: 12 }}>Users <ChevronDown size={11} /></button>
                <button className="icon-btn" style={{ width: 20, height: 20 }}><Info size={12} /></button>
              </div>
              <button className="btn-ghost" style={{ fontSize: 12 }}>Saved <ChevronDown size={12} /></button>
            </div>
            {segments.map((seg, idx) => (
              <div key={seg.id} className="chart-segment-row">
                <div className="segment-row-main">
                  <span className="drag-handle" style={{ fontSize: 12 }}>⣿</span>
                  <span className="segment-number">{idx + 1}</span>
                  <ChevronDown size={12} style={{ color: 'var(--text-secondary)' }} />
                  <span className="segment-name">{seg.name}</span>
                  <button className="icon-btn" style={{ marginLeft: 'auto', width: 20, height: 20 }} onClick={() => removeSegment(seg.id)}><X size={12} /></button>
                  <button className="icon-btn" style={{ width: 20, height: 20 }}><MoreHorizontal size={12} /></button>
                </div>
                <div className="event-row-links">
                  <button className="event-link-btn">+ Filter by</button>
                  <button className="event-link-btn">+ In Cohort</button>
                  <button className="event-link-btn">+ Performed</button>
                </div>
              </div>
            ))}
            <button className="chart-add-btn" onClick={addSegment}>+ Add Segment</button>
          </div>

          {/* Group Segment by */}
          <div className="chart-section" style={{ borderBottom: 'none' }}>
            <div className="chart-section-title" style={{ marginBottom: 8 }}>Group Segment by</div>
            <button className="chart-add-btn">+ Select User Property</button>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="chart-right-panel">
        {/* Top action bar */}
        <div className="chart-right-topbar">
          <div className="chart-space-label">
            {existingChart ? `${state.currentUser.name}'s Space` : ''}
          </div>
          <div className="chart-topbar-actions">
            {existingChart && <button className="icon-btn" title="Notifications"><Bell size={18} /></button>}
            {existingChart && <button className="btn-outline" onClick={handleDelete}><Trash2 size={14} /> Delete</button>}
            <button className="btn-outline">More <ChevronDown size={14} /></button>
            <button className="btn-outline">Add to (1)</button>
            <button
              className={`${saved ? 'btn-outline' : 'btn-outline'} chart-save-btn ${saved ? 'chart-save-btn-saved' : ''}`}
              onClick={handleSave}
            >
              {saved ? <><Check size={14} /> Saved</> : 'Save'}
            </button>
            <button className="btn-primary" onClick={() => setShowShare(true)}>
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>

        {/* Chart title */}
        <div className="chart-title-area">
          <div className="chart-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!saved && <span className="badge badge-blue" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>DRAFT</span>}
              {editingTitle ? (
                <input
                  className="chart-title-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false) }}
                  autoFocus
                />
              ) : (
                <h1 className="chart-title" onClick={() => setEditingTitle(true)}>{title}</h1>
              )}
            </div>
            {existingChart && (
              <div className="chart-ownership">
                <span>Owned by {existingChart.owner}</span>
                <span>{existingChart.dashboardIds.length} Dashboard · {existingChart.notebookIds.length} Notebooks</span>
              </div>
            )}
          </div>
          <div className="chart-description">What question does this chart answer? Enter a description here.</div>
        </div>

        {/* Chart toolbar */}
        <div className="chart-toolbar">
          <div className="chart-toolbar-left">
            <button className="btn-outline" style={{ fontSize: 13 }}>✨ Anomaly + Forecast</button>
            <button className="btn-outline" style={{ fontSize: 13 }}>Compare <ChevronDown size={13} /></button>
            <span className="chart-freshness">
              <RefreshCw size={12} /> Data from {existingChart ? '10' : '1'} min ago
            </span>
          </div>
          <div className="chart-toolbar-right">
            <button className="btn-outline chart-viz-btn" onClick={() => {
              const opts = ['line', 'bar', 'pie', 'stacked_bar']
              const i = opts.indexOf(viz)
              setViz(opts[(i + 1) % opts.length])
            }}>
              📈 {currentVizLabel} <ChevronDown size={13} />
            </button>
            <div className="chart-interval-select">
              {INTERVALS.map(int => (
                <button
                  key={int}
                  className={`chart-interval-btn ${interval.toLowerCase() === int.toLowerCase() ? 'chart-interval-active' : ''}`}
                  onClick={() => setInterval(int)}
                >{int}</button>
              ))}
            </div>
            <div className="chart-timerange-pills">
              {TIME_RANGES.map(r => (
                <button
                  key={r}
                  className={`chart-timerange-pill ${timeRange === r ? 'chart-timerange-active' : ''}`}
                  onClick={() => setTimeRange(r)}
                >{r}</button>
              ))}
              <button className="icon-btn" style={{ width: 28, height: 28 }}>📅</button>
            </div>
          </div>
        </div>

        {/* Metric summary (for line/bar) */}
        {(viz === 'line' || viz === 'bar') && chartType !== 'funnel' && chartType !== 'retention' && (
          <div className="chart-metric-summary">
            <button className="btn-outline" style={{ fontSize: 13 }}>
              Current {measuredAs === 'uniques' ? 'Uniques' : measuredAs === 'eventTotals' ? 'Event Totals' : measuredAs} <ChevronDown size={13} />
            </button>
            <div className="metric-summary-value">
              <span className="metric-large">{existingChart ? lineData.reduce((s, p) => s + p.value, 0) : 0}</span>
              <span className="metric-delta-neutral">0%</span>
            </div>
            <div className="metric-summary-sub">yesterday from Nov 16</div>
            <div className="metric-summary-desc">Current {measuredAs} are not showing any change since Nov 16.</div>
          </div>
        )}

        {/* Chart area */}
        <div className="chart-area">
          {chartType === 'retention' ? (
            <div className="chart-inner">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={retentionCurve} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.6} />
                  <XAxis dataKey="day" tickFormatter={d => `Day ${d}`} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Retention']} contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }} />
                  <Line type="monotone" dataKey="percentage" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3, fill: '#7C3AED' }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="chart-legend"><span className="legend-dot" style={{ background: '#7C3AED' }} /> All Users</div>
              {/* Retention Heatmap */}
              {chartData?.heatmap && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Cohort Retention Grid</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', fontSize: 11, minWidth: 600 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Cohort</th>
                          <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>New Users</th>
                          {Array.from({ length: 15 }, (_, i) => (
                            <th key={i} style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', minWidth: 42 }}>Day {i}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.heatmap.map((row, ri) => (
                          <tr key={ri}>
                            <td style={{ padding: '6px 10px', fontWeight: 500, whiteSpace: 'nowrap' }}>{row.week}</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>{row.newUsers}</td>
                            {row.days.map((pct, di) => {
                              const intensity = pct / 100
                              const bg = `rgba(124, 58, 237, ${intensity * 0.7 + 0.05})`
                              const textColor = intensity > 0.4 ? 'white' : 'var(--text-primary)'
                              return (
                                <td key={di} style={{ padding: '6px 6px', textAlign: 'center', background: bg, color: textColor, fontWeight: 500, borderRadius: 2 }}>
                                  {pct}%
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : chartType === 'funnel' ? (
            <div className="chart-inner">
              <div className="funnel-chart-wrap">
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Overall conversion: <strong>{chartData?.overallConversion || 25}%</strong> | Median time: <strong>{chartData?.medianTime || '2m 34s'}</strong>
                </div>
                <div className="funnel-bars">
                  {funnelSteps.map((step, i) => {
                    const dropoff = i > 0 ? funnelSteps[i-1].percentage - step.percentage : 0
                    return (
                      <div key={i} className="funnel-bar-col">
                        <div className="funnel-pct-label">{step.percentage}%</div>
                        <div className="funnel-bar-bg">
                          <div className="funnel-bar-fill" style={{ height: `${step.percentage}%`, background: `rgba(124, 58, 237, ${1 - i * 0.15})` }} />
                        </div>
                        <div className="funnel-bar-label">{step.name}</div>
                        <div className="funnel-bar-count">{step.count.toLocaleString()}</div>
                        {i > 0 && dropoff > 0 && (
                          <div style={{ fontSize: 10, color: 'var(--error)', fontWeight: 600, marginTop: 2 }}>-{dropoff.toFixed(1)}%</div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {/* Step conversion details */}
                {chartData?.stepConversions && (
                  <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {chartData.stepConversions.map((sc, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: 'var(--page-bg)', borderRadius: 8, fontSize: 12 }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{sc.from} &rarr; {sc.to}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{sc.rate}% convert &middot; {sc.medianTime} median</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="chart-legend"><span className="legend-dot" style={{ background: '#7C3AED' }} /> All Users</div>
            </div>
          ) : viz === 'pie' ? (
            <div className="chart-inner">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={getPieData()} cx="50%" cy="50%" outerRadius={130} dataKey="value" label={({ name, percentage, value }) => `${name}: ${value || percentage}%`}>
                    {getPieData().map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {getPieData().map((s, i) => (
                  <span key={i} className="legend-item"><span className="legend-dot" style={{ background: s.color }} /> {s.name}</span>
                ))}
              </div>
            </div>
          ) : viz === 'bar' ? (
            <div className="chart-inner">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={getBarData()} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E5E8" strokeOpacity={0.6} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B6F76' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6F76' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7C3AED" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="chart-legend"><span className="legend-dot" style={{ background: '#7C3AED' }} /> All Users</div>
            </div>
          ) : (
            <div className="chart-inner">
              <div className="chart-scroll-btns">
                <button className="chart-scroll-btn">‹</button>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData} margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E5E8" strokeOpacity={0.6} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B6F76' }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6F76' }} axisLine={false} tickLine={false} label={{ value: measuredAs === 'uniques' ? 'Uniques' : 'Count', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6B6F76' }} />
                  <Tooltip labelFormatter={l => l} formatter={(v) => [v, 'All Users']} />
                  <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div />
                <div className="chart-legend"><span className="legend-dot" style={{ background: '#7C3AED' }} /> All Users</div>
                <button className="chart-scroll-btn">›</button>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown table */}
        <div className="chart-breakdown">
          <div className="chart-breakdown-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Breakdown by:</span>
              <button className="btn-outline" style={{ fontSize: 12, height: 28 }}>Top 3 (Default) <ChevronDown size={12} /></button>
              <button className="icon-btn" style={{ width: 24, height: 24 }}><Info size={13} /></button>
              <button className="icon-btn" style={{ width: 24, height: 24 }}>🔍</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button className="btn-outline" style={{ fontSize: 12, height: 28 }} onClick={() => {
                const rows = breakdownTable.map(row => {
                  const vals = Object.values(row.values || {})
                  return [row.segment, ...vals, row.rowAverage].join(',')
                })
                const headers = ['Segment', ...Object.keys(breakdownTable[0]?.values || {}), 'Row Average'].join(',')
                const csv = [headers, ...rows].join('\n')
                const blob = new Blob([csv], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${title.replace(/\s+/g, '_')}_export.csv`
                a.click()
                URL.revokeObjectURL(url)
              }}>
                <Download size={13} /> Export CSV
              </button>
              <button className="icon-btn" style={{ width: 24, height: 24 }}><Info size={13} /></button>
            </div>
          </div>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th><input type="checkbox" defaultChecked /></th>
                <th>{chartType === 'funnel' ? 'Step' : measuredAs === 'frequency' ? 'Times Performed' : 'Segment'} <ChevronDown size={11} /></th>
                {breakdownTable[0] && Object.keys(breakdownTable[0].values || {}).slice(0, 5).map(k => (
                  <th key={k}>{k} <ChevronDown size={11} /></th>
                ))}
                <th>Row Average <ChevronDown size={11} /></th>
              </tr>
            </thead>
            <tbody>
              {breakdownTable.map((row, i) => (
                <tr key={i}>
                  <td>
                    <input type="checkbox" checked={checkedRows[row.segment] !== false}
                      onChange={e => setCheckedRows(prev => ({ ...prev, [row.segment]: e.target.checked }))} />
                  </td>
                  <td>
                    <span className="legend-dot" style={{ background: SERIES_COLORS[i], display: 'inline-block', marginRight: 6 }} />
                    {row.segment}
                  </td>
                  {Object.values(row.values || {}).slice(0, 5).map((v, j) => (
                    <td key={j}>{v}</td>
                  ))}
                  <td>{row.rowAverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}

      {showEventPicker && (
        <EventPickerDropdown
          eventDefinitions={state.eventDefinitions}
          onSelect={evtDef => {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            const letter = letters[events.length] || 'A'
            setEvents(prev => [...prev, { letter, eventName: evtDef.name, filters: [], groupBy: null }])
          }}
          onClose={() => setShowEventPicker(false)}
        />
      )}
    </div>
  )
}
