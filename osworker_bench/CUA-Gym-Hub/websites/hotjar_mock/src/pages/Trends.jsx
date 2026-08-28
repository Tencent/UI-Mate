import { useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

export default function Trends() {
  const { state, dispatch } = useAppContext()
  const [selectedTrend, setSelectedTrend] = useState(state.trends?.[0]?.id)
  const [dateFilter, setDateFilter] = useState('30d')

  const trend = state.trends?.find(t => t.id === selectedTrend) || state.trends?.[0]

  function renderLineChart(data) {
    if (!data || data.length < 2) return null
    const values = data.map(d => d.value)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const w = 700
    const h = 200
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / range) * (h - 20) - 10
      return `${x},${y}`
    }).join(' ')
    const areaPoints = `0,${h} ` + points + ` ${w},${h}`

    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 200 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF3C00" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FF3C00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#area-grad)" />
        <polyline points={points} fill="none" stroke="#FF3C00" strokeWidth="2" />
        {values.map((v, i) => {
          const x = (i / (values.length - 1)) * w
          const y = h - ((v - min) / range) * (h - 20) - 10
          return <circle key={i} cx={x} cy={y} r="3" fill="#FF3C00" />
        })}
      </svg>
    )
  }

  return (
    <div className="content-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Trends</h1>
          <p className="page-subtitle">Track key metrics over time</p>
        </div>
        <div className="toggle-group">
          {['24h', '7d', '15d', '30d'].map(r => (
            <button key={r} className={`toggle-btn ${dateFilter === r ? 'active' : ''}`} onClick={() => setDateFilter(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* Metric selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(state.trends || []).map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTrend(t.id)}
            style={{
              padding: '6px 16px', borderRadius: 20,
              border: `1px solid ${selectedTrend === t.id ? '#FF3C00' : '#E5E7EB'}`,
              background: selectedTrend === t.id ? '#FFF7F5' : '#FFFFFF',
              color: selectedTrend === t.id ? '#FF3C00' : '#6B7280',
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: selectedTrend === t.id ? 600 : 400
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      {trend && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{trend.name}</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>Last 30 days</div>
          </div>
          <div style={{ padding: '0 8px' }}>
            {renderLineChart(trend.dataPoints)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#9CA3AF' }}>
            {trend.dataPoints?.filter((_, i) => i % 5 === 0).map((d, i) => (
              <span key={i}>{d.date.slice(5)}</span>
            ))}
          </div>
        </div>
      )}

      {/* Stats summary */}
      {trend && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="metric-card">
            <div className="metric-label">Average</div>
            <div className="metric-value">
              {Math.round(trend.dataPoints?.reduce((a, b) => a + b.value, 0) / (trend.dataPoints?.length || 1)).toLocaleString()}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Peak</div>
            <div className="metric-value">
              {Math.max(...(trend.dataPoints?.map(d => d.value) || [0])).toLocaleString()}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total</div>
            <div className="metric-value">
              {trend.dataPoints?.reduce((a, b) => a + b.value, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
