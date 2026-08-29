import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, MoreHorizontal, Trash2, Share2, Plus, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useApp } from '../context/AppContext'
import './DashboardView.css'

function MiniChart({ chart }) {
  if (!chart) return <div style={{ height: 120, background: 'var(--page-bg)', borderRadius: 6 }} />

  if (chart.type === 'funnel') {
    const steps = chart.data?.steps || []
    return (
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={steps} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Bar dataKey="percentage" fill="#7C3AED" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (chart.config?.chartVisualization === 'pie' && chart.data?.series?.[0]?.value !== undefined) {
    const data = chart.data.series.map((s, i) => ({ name: s.name, value: s.value, color: s.color }))
    return (
      <ResponsiveContainer width="100%" height={120}>
        <PieChart><Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={50}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie></PieChart>
      </ResponsiveContainer>
    )
  }

  const pts = chart.data?.series?.[0]?.dataPoints || []
  const lineData = pts.map((p, i) => ({ label: i, value: p.value }))
  if (!lineData.length) {
    const barData = chart.data?.series?.[0]?.dataPoints || []
    const bd = barData.map(p => ({ value: p.value }))
    if (chart.config?.chartVisualization === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={bd} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <Bar dataKey="value" fill="#7C3AED" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )
    }
  }
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={lineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E5E8" strokeOpacity={0.5} />
        <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function DashboardView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')

  const [showShare, setShowShare] = useState(false)
  const [showAddChart, setShowAddChart] = useState(false)

  useEffect(() => {
    if (id !== 'new') return
    const newId = `dash_${Date.now()}`
    const createdAt = new Date().toISOString()
    dispatch({ type: 'ADD_DASHBOARD', payload: {
      id: newId,
      name: 'Untitled Dashboard',
      description: '',
      owner: state.currentUser.name,
      ownerEmail: state.currentUser.email,
      isOfficial: false,
      createdAt,
      updatedAt: createdAt,
      chartIds: [],
      layout: [],
      space: `${state.currentUser.name}'s Space`
    }})
    navigate(`/dashboard/${newId}`, { replace: true })
  }, [id, dispatch, navigate, state.currentUser.email, state.currentUser.name])

  if (id === 'new') return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Creating dashboard...</div>

  const dashboard = state.dashboards.find(d => d.id === id)
  if (!dashboard) return (
    <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Dashboard not found</div>
  )

  const charts = dashboard.chartIds.map(cid => state.charts.find(c => c.id === cid)).filter(Boolean)

  function handleTitleSave() {
    if (titleVal.trim()) {
      dispatch({ type: 'UPDATE_DASHBOARD', payload: { ...dashboard, name: titleVal.trim(), updatedAt: new Date().toISOString() } })
    }
    setEditingTitle(false)
  }

  function handleCopyAsDashboard() {
    const newId = `dash_${Date.now()}`
    dispatch({ type: 'ADD_DASHBOARD', payload: {
      ...dashboard,
      id: newId,
      name: `${dashboard.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }})
    navigate(`/dashboard/${newId}`)
  }

  function handleAddChart(chartId) {
    dispatch({ type: 'UPDATE_DASHBOARD', payload: {
      ...dashboard,
      chartIds: [...dashboard.chartIds, chartId],
      updatedAt: new Date().toISOString()
    }})
    setShowAddChart(false)
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-topbar">
        <div className="dashboard-breadcrumb">
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/content')}>{dashboard.space || "Sam Lee's Space"} <ChevronDown size={13} /></button>
        </div>
        <div className="dashboard-topbar-actions">
          <button className="btn-outline" onClick={() => navigate('/content')}>More <ChevronDown size={13} /></button>
          <button className="btn-outline" onClick={handleCopyAsDashboard}>Copy as dashboard</button>
          <button className="btn-outline" onClick={() => navigate('/content')}>Chart View</button>
          <button className="btn-primary" onClick={() => setShowShare(true)}><Share2 size={14} /> Share</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-title-row">
          {editingTitle ? (
            <input
              className="chart-title-input"
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={e => { if (e.key === 'Enter') handleTitleSave() }}
              autoFocus
            />
          ) : (
            <h1 className="page-title" style={{ cursor: 'pointer' }}
              onClick={() => { setTitleVal(dashboard.name); setEditingTitle(true) }}>
              {dashboard.name}
            </h1>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Owned by {dashboard.owner} · Last updated {new Date(dashboard.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="dashboard-grid">
          {charts.map(chart => (
            <div key={chart.id} className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <div className="dashboard-card-title" onClick={() => navigate(`/chart/${chart.id}`)} style={{ cursor: 'pointer' }}>
                    {chart.name}
                  </div>
                  <div className="dashboard-card-sub">
                    {chart.config?.interval?.charAt(0).toUpperCase() + chart.config?.interval?.slice(1) || 'Daily'}, Last {chart.config?.timeRange || '30d'}
                  </div>
                </div>
                <button className="icon-btn dashboard-card-trash" onClick={() => {
                  dispatch({ type: 'UPDATE_DASHBOARD', payload: { ...dashboard, chartIds: dashboard.chartIds.filter(cid => cid !== chart.id) } })
                }}><Trash2 size={14} /></button>
              </div>
              <MiniChart chart={chart} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button className="btn-outline" onClick={() => setShowAddChart(true)}>
            <Plus size={14} /> Add Chart
          </button>
        </div>
      </div>

      {showAddChart && (
        <div className="modal-overlay" onClick={() => setShowAddChart(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Add Chart to Dashboard</span>
              <button className="icon-btn" onClick={() => setShowAddChart(false)}><X size={16} /></button>
            </div>
            <div style={{ padding: 16, maxHeight: 400, overflowY: 'auto' }}>
              {state.charts.filter(c => !dashboard.chartIds.includes(c.id)).map(c => (
                <button key={c.id} className="dropdown-item" style={{ padding: '10px 12px' }} onClick={() => handleAddChart(c.id)}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                    {c.type === 'funnel' ? 'F' : c.type === 'retention' ? 'R' : 'S'}
                  </span>
                  {c.name}
                </button>
              ))}
              {state.charts.filter(c => !dashboard.chartIds.includes(c.id)).length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>All charts are already in this dashboard.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Share Dashboard</span>
              <button className="icon-btn" onClick={() => setShowShare(false)}><X size={16} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>Share this dashboard with your team members.</p>
              <input className="input" placeholder="Enter email address" />
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowShare(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
