import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Plus } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { formatDate } from '../utils/helpers.js'
import { withCurrentSearch } from '../utils/navigation.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

export default function DashboardsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, addDashboard } = useApp()
  const { dashboards = [], users = [] } = state
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [createError, setCreateError] = useState('')

  function createDashboard() {
    if (!title.trim()) {
      setCreateError('Enter a dashboard title before creating it.')
      return
    }
    const id = 'dash-' + Date.now()
    addDashboard({
      id,
      title: title.trim(),
      dateCreated: new Date().toISOString(),
      createdBy: state.currentUser?.id || 'user-1',
      widgets: [],
    })
    setShowCreate(false)
    setTitle('')
    setCreateError('')
    navigate(withCurrentSearch(`/dashboards/${id}/`, location.search))
  }

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Dashboards</h1>
        <button onClick={() => setShowCreate(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: 4,
          padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 500
        }}>
          <Plus size={14} /> Create Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {dashboards.map(dash => {
          const creator = users.find(u => u.id === dash.createdBy)
          return (
            <div key={dash.id}
              onClick={() => navigate(withCurrentSearch(`/dashboards/${dash.id}/`, location.search))}
              style={{
                border: `1px solid ${BORDER}`, borderRadius: 6, padding: 20,
                cursor: 'pointer', backgroundColor: '#fff', transition: 'box-shadow 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ fontWeight: 600, fontSize: 15, color: TEXT_PRI, marginBottom: 6 }}>{dash.title}</div>
              <div style={{ fontSize: 12, color: TEXT_SEC }}>
                {dash.widgets.length} widgets
                {creator && <span> &middot; by {creator.name}</span>}
              </div>
              <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>
                Created {formatDate(dash.dateCreated)}
              </div>
            </div>
          )
        })}
      </div>
      {showCreate && (
        <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, backgroundColor: '#fff', borderRadius: 8, padding: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 18, color: TEXT_PRI }}>Create Dashboard</h2>
            <label style={{ display: 'block', fontSize: 12, color: TEXT_SEC, marginBottom: 4 }}>Dashboard Title</label>
            <input value={title} onChange={e => { setTitle(e.target.value); setCreateError('') }} placeholder="Frontend health dashboard" autoFocus
              style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13 }} />
            {createError && <div style={{ color: '#E03E2F', fontSize: 12, marginTop: 6 }}>{createError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowCreate(false)} style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: '7px 16px', backgroundColor: '#fff', fontSize: 13 }}>Cancel</button>
              <button onClick={createDashboard} style={{ backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: 4, padding: '7px 16px', fontSize: 13, fontWeight: 500 }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
