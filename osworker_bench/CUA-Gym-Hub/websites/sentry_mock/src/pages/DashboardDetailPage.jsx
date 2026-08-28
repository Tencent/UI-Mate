import React, { useState } from 'react'
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { withCurrentSearch } from '../utils/navigation.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

function BigNumberWidget({ widget }) {
  const { value, previousValue, label } = widget.data
  const isImproved = parseFloat(value) > parseFloat(previousValue)
    || (value.includes('%') && parseFloat(value) > parseFloat(previousValue))
    || (value.includes('s') && parseFloat(value) < parseFloat(previousValue))
    || (value.includes('ms') && parseFloat(value) < parseFloat(previousValue))

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: TEXT_PRI }}>{value}</div>
      {previousValue && (
        <div style={{ fontSize: 12, color: isImproved ? '#2BA185' : '#E03E2F', marginTop: 4 }}>
          {isImproved ? '▼' : '▲'} from {previousValue}
        </div>
      )}
      {label && <div style={{ fontSize: 11, color: TEXT_SEC, marginTop: 4 }}>{label}</div>}
    </div>
  )
}

function LineChartWidget({ widget }) {
  const { series, xLabels } = widget.data
  const chartData = xLabels.map((label, i) => {
    const point = { label }
    series.forEach(s => { point[s.label] = s.values[i] })
    return point
  })
  return (
    <div style={{ padding: '12px 16px', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: TEXT_SEC }} />
          <YAxis tick={{ fontSize: 9, fill: TEXT_SEC }} />
          <Tooltip contentStyle={{ fontSize: 11, border: `1px solid ${BORDER}` }} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {series.map(s => (
            <Line key={s.label} type="monotone" dataKey={s.label} stroke={s.color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function BarChartWidget({ widget }) {
  const { series, xLabels } = widget.data
  const chartData = xLabels.map((label, i) => {
    const point = { label }
    series.forEach(s => { point[s.label] = s.values[i] })
    return point
  })
  return (
    <div style={{ padding: '12px 16px', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: TEXT_SEC }} />
          <YAxis tick={{ fontSize: 9, fill: TEXT_SEC }} />
          <Tooltip contentStyle={{ fontSize: 11, border: `1px solid ${BORDER}` }} />
          {series.map(s => (
            <Bar key={s.label} dataKey={s.label} fill={s.color} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function AreaChartWidget({ widget }) {
  const { series, xLabels } = widget.data
  const chartData = xLabels.map((label, i) => {
    const point = { label }
    series.forEach(s => { point[s.label] = s.values[i] })
    return point
  })
  return (
    <div style={{ padding: '12px 16px', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: TEXT_SEC }} />
          <YAxis tick={{ fontSize: 9, fill: TEXT_SEC }} />
          <Tooltip contentStyle={{ fontSize: 11, border: `1px solid ${BORDER}` }} />
          {series.map(s => (
            <Area key={s.label} type="monotone" dataKey={s.label} fill={s.color + '33'} stroke={s.color} strokeWidth={2} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function TableWidget({ widget }) {
  const { columns, rows } = widget.data
  return (
    <div style={{ padding: '8px 12px', overflow: 'auto', height: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{
                textAlign: i === 0 ? 'left' : 'right', padding: '4px 8px',
                borderBottom: `1px solid ${BORDER}`, fontWeight: 600, color: TEXT_SEC, fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  textAlign: ci === 0 ? 'left' : 'right', padding: '5px 8px',
                  borderBottom: `1px solid #F4F2F7`, color: ci === 0 ? TEXT_PRI : TEXT_SEC,
                  fontWeight: ci === 0 ? 500 : 400,
                  fontFamily: ci > 0 ? '"Source Code Pro", monospace' : 'inherit'
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CELL_HEIGHT = 80

export default function DashboardDetailPage() {
  const { dashboardId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { state, updateDashboard } = useApp()
  const { dashboards = [] } = state
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [editMessage, setEditMessage] = useState('')

  const dashboard = dashboards.find(d => d.id === dashboardId)
  if (!dashboard) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: TEXT_SEC }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Dashboard not found</div>
        <button onClick={() => navigate(withCurrentSearch('/dashboards/', location.search))} style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer' }}>Back to Dashboards</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      {/* Breadcrumb + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 16 }}>
        <Link to={withCurrentSearch('/dashboards/', location.search)} style={{ color: ACCENT }}>Dashboards</Link>
        <span style={{ color: TEXT_SEC }}>/</span>
        <span style={{ color: TEXT_PRI, fontWeight: 600 }}>{dashboard.title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>{dashboard.title}</h1>
        <button style={{
          border: `1px solid ${ACCENT}`, borderRadius: 4, padding: '6px 16px',
          backgroundColor: 'transparent', color: ACCENT, fontSize: 13, cursor: 'pointer', fontWeight: 500
        }} onClick={() => { setTitle(dashboard.title); setEditing(true); setEditMessage('') }}>Edit Dashboard</button>
      </div>
      {editMessage && <div style={{ color: '#2BA185', fontSize: 13, marginBottom: 12 }}>{editMessage}</div>}

      {/* Widget grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 12, gridAutoRows: CELL_HEIGHT
      }}>
        {dashboard.widgets.map(widget => {
          const { x, y, w, h } = widget.layout
          const style = {
            gridColumn: `${x + 1} / span ${w}`,
            gridRow: `${y + 1} / span ${h}`,
            border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden',
            backgroundColor: '#fff', display: 'flex', flexDirection: 'column'
          }

          return (
            <div key={widget.id} style={style}>
              <div style={{
                padding: '8px 12px', borderBottom: `1px solid ${BORDER}`,
                fontSize: 12, fontWeight: 600, color: TEXT_PRI, backgroundColor: '#FAF9FB',
                flexShrink: 0
              }}>
                {widget.title}
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                {widget.type === 'big_number' && <BigNumberWidget widget={widget} />}
                {widget.type === 'line' && <LineChartWidget widget={widget} />}
                {widget.type === 'bar' && <BarChartWidget widget={widget} />}
                {widget.type === 'area' && <AreaChartWidget widget={widget} />}
                {widget.type === 'table' && <TableWidget widget={widget} />}
              </div>
            </div>
          )
        })}
      </div>
      {editing && (
        <div onClick={() => setEditing(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, backgroundColor: '#fff', borderRadius: 8, padding: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 18, color: TEXT_PRI }}>Edit Dashboard</h2>
            <label style={{ display: 'block', fontSize: 12, color: TEXT_SEC, marginBottom: 4 }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} autoFocus style={{ width: '100%', padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 13 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setEditing(false)} style={{ border: `1px solid ${BORDER}`, borderRadius: 4, padding: '7px 16px', backgroundColor: '#fff', fontSize: 13 }}>Cancel</button>
              <button onClick={() => { if (title.trim()) { updateDashboard({ id: dashboard.id, title: title.trim(), dateModified: new Date().toISOString() }); setEditMessage('Dashboard updated'); setEditing(false) } }} style={{ backgroundColor: ACCENT, color: '#fff', border: 'none', borderRadius: 4, padding: '7px 16px', fontSize: 13, fontWeight: 500 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
