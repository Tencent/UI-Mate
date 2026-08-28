import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, Share2, ChevronDown, X, MoreHorizontal } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

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

  if (chart.type === 'retention' && chart.data?.curve) {
    return (
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chart.data.curve} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E5E8" strokeOpacity={0.5} />
          <Line type="monotone" dataKey="percentage" stroke="#7C3AED" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const pts = chart.data?.series?.[0]?.dataPoints || []
  const lineData = pts.map((p, i) => ({ label: i, value: p.value }))

  if (chart.config?.chartVisualization === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={lineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <Bar dataKey="value" fill="#7C3AED" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
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

export default function Notebook() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [showShare, setShowShare] = useState(false)
  const [showAddChart, setShowAddChart] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [textBlocks, setTextBlocks] = useState({})

  useEffect(() => {
    if (id !== 'new') return
    const newId = `notebook_${Date.now()}`
    const createdAt = new Date().toISOString()
    dispatch({ type: 'ADD_NOTEBOOK', payload: {
      id: newId,
      name: 'Untitled Notebook',
      owner: state.currentUser.name,
      space: `${state.currentUser.name}'s Space`,
      createdAt,
      updatedAt: createdAt,
      viewCount: 0,
      blocks: []
    }})
    navigate(`/notebooks/${newId}`, { replace: true })
  }, [id, dispatch, navigate, state.currentUser.name])

  if (id === 'new') return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Creating notebook...</div>

  const notebook = state.notebooks.find(n => n.id === id)
  if (!notebook) return <div style={{ padding: 40 }}>Notebook not found</div>

  const blockCharts = notebook.blocks.map(b => ({
    ...b,
    chart: b.type === 'chart' ? state.charts.find(c => c.id === b.chartId) : null
  }))

  function handleTitleSave() {
    if (titleVal.trim()) {
      dispatch({ type: 'UPDATE_NOTEBOOK', payload: { id: notebook.id, name: titleVal.trim(), updatedAt: new Date().toISOString() } })
    }
    setEditingTitle(false)
  }

  function addChartBlock(chartId) {
    const newBlocks = [...notebook.blocks, { id: `block_${Date.now()}`, type: 'chart', chartId }]
    dispatch({ type: 'UPDATE_NOTEBOOK', payload: { id: notebook.id, blocks: newBlocks, updatedAt: new Date().toISOString() } })
    setShowAddChart(false)
  }

  function addTextBlock() {
    const blockId = `block_${Date.now()}`
    const newBlocks = [...notebook.blocks, { id: blockId, type: 'text', content: '' }]
    dispatch({ type: 'UPDATE_NOTEBOOK', payload: { id: notebook.id, blocks: newBlocks, updatedAt: new Date().toISOString() } })
  }

  function removeBlock(blockId) {
    const newBlocks = notebook.blocks.filter(b => b.id !== blockId)
    dispatch({ type: 'UPDATE_NOTEBOOK', payload: { id: notebook.id, blocks: newBlocks, updatedAt: new Date().toISOString() } })
  }

  function updateTextBlock(blockId, content) {
    setTextBlocks(prev => ({ ...prev, [blockId]: content }))
    const newBlocks = notebook.blocks.map(b => b.id === blockId ? { ...b, content } : b)
    dispatch({ type: 'UPDATE_NOTEBOOK', payload: { id: notebook.id, blocks: newBlocks, updatedAt: new Date().toISOString() } })
  }

  function handleCopyAsDashboard() {
    const chartIds = notebook.blocks.filter(b => b.type === 'chart' && b.chartId).map(b => b.chartId)
    const dashId = `dash_${Date.now()}`
    dispatch({ type: 'ADD_DASHBOARD', payload: {
      id: dashId,
      name: `${notebook.name} (Dashboard)`,
      description: `Created from notebook: ${notebook.name}`,
      owner: state.currentUser.name,
      ownerEmail: state.currentUser.email,
      isOfficial: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chartIds,
      layout: chartIds.map((cid, i) => ({ chartId: cid, x: (i % 2) * 6, y: Math.floor(i / 2) * 4, w: 6, h: 4 })),
      space: `${state.currentUser.name}'s Space`
    }})
    navigate(`/dashboard/${dashId}`)
  }

  return (
    <div style={{ padding: 24, background: 'white', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        {editingTitle ? (
          <input
            className="input"
            style={{ fontSize: 24, fontWeight: 600, height: 40, width: 400 }}
            value={titleVal}
            onChange={e => setTitleVal(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleTitleSave() }}
            autoFocus
          />
        ) : (
          <h1 style={{ fontSize: 24, fontWeight: 600, cursor: 'pointer' }}
            onClick={() => { setTitleVal(notebook.name); setEditingTitle(true) }}
          >{notebook.name}</h1>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <button className="btn-outline" onClick={() => setShowMoreMenu(!showMoreMenu)}>More <ChevronDown size={14} /></button>
            {showMoreMenu && (
              <>
                <div className="overlay" onClick={() => setShowMoreMenu(false)} />
                <div className="dropdown" style={{ position: 'absolute', top: 38, right: 0, width: 180, zIndex: 200 }}>
                  <button className="dropdown-item" onClick={() => { addTextBlock(); setShowMoreMenu(false) }}>Add Text Block</button>
                  <button className="dropdown-item" onClick={() => { setShowAddChart(true); setShowMoreMenu(false) }}>Add Chart Block</button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" style={{ color: 'var(--error)' }} onClick={() => { dispatch({ type: 'DELETE_NOTEBOOK', payload: notebook.id }); navigate('/content'); setShowMoreMenu(false) }}>Delete Notebook</button>
                </div>
              </>
            )}
          </div>
          <button className="btn-outline" onClick={handleCopyAsDashboard}>Copy as dashboard</button>
          <button className="btn-outline" onClick={() => navigate('/content')}>Chart View</button>
          <button className="btn-primary" onClick={() => setShowShare(true)}><Share2 size={14} /> Share</button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Owned by {notebook.owner} · {notebook.viewCount || 0} views · Last edited {new Date(notebook.updatedAt).toLocaleDateString()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {blockCharts.map(b => (
          <div key={b.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 20, background: 'white', position: 'relative' }}>
            <button
              className="icon-btn"
              style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24 }}
              onClick={() => removeBlock(b.id)}
            >
              <Trash2 size={13} />
            </button>
            {b.type === 'text' ? (
              <textarea
                style={{ width: '100%', minHeight: 80, border: 'none', resize: 'vertical', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                placeholder="Write your analysis notes here..."
                value={textBlocks[b.id] !== undefined ? textBlocks[b.id] : (b.content || '')}
                onChange={e => updateTextBlock(b.id, e.target.value)}
              />
            ) : (
              <>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, cursor: 'pointer' }}
                  onClick={() => b.chart && navigate(`/chart/${b.chart.id}`)}
                >{b.chart?.name || 'Chart'}</div>
                <MiniChart chart={b.chart} />
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn-outline" onClick={addTextBlock}><Plus size={14} /> Add Text</button>
        <button className="btn-outline" onClick={() => setShowAddChart(true)}><Plus size={14} /> Add Chart</button>
      </div>

      {showAddChart && (
        <div className="modal-overlay" onClick={() => setShowAddChart(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Add Chart</span>
              <button className="icon-btn" onClick={() => setShowAddChart(false)}><X size={16} /></button>
            </div>
            <div style={{ padding: 16, maxHeight: 400, overflowY: 'auto' }}>
              {state.charts.map(c => (
                <button key={c.id} className="dropdown-item" style={{ padding: '10px 12px' }} onClick={() => addChartBlock(c.id)}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--primary)' }}>
                    {c.type === 'funnel' ? 'F' : c.type === 'retention' ? 'R' : 'S'}
                  </span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Share Notebook</span>
              <button className="icon-btn" onClick={() => setShowShare(false)}><X size={16} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>Share this notebook with your team members.</p>
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
