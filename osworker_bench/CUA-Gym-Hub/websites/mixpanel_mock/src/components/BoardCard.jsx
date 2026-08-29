import React from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MoreHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { executeInsightsQuery, executeFunnelQuery, executeRetentionQuery } from '../utils/queryEngine.js'

export default function BoardCard({ item, report, onClick }) {
  const [hover, setHover] = React.useState(false)
  const { state } = useApp()
  const events = state?.events || []

  const title = item.title || report?.name || 'Untitled'

  function renderMiniChart() {
    if (!report) return <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8EA0', fontSize: 12 }}>No data</div>

    const type = report.type || report.chartType

    if (type === 'insights') {
      const result = executeInsightsQuery(events, report)
      const chartData = result.chartData
      if (!chartData?.series?.length) return <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8EA0', fontSize: 12 }}>No data</div>

      if (report.chartType === 'bar') {
        const data = chartData.labels.map((label, i) => {
          const point = { label }
          chartData.series.forEach((s, si) => { point[`s${si}`] = s.data[i] || 0 })
          return point
        })
        return (
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              {chartData.series.slice(0, 3).map((s, i) => (
                <Bar key={i} dataKey={`s${i}`} fill={s.color} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      }

      // Line chart default
      const data = chartData.labels.map((label, i) => {
        const point = { label }
        chartData.series.forEach((s, si) => { point[`s${si}`] = s.data[i] || 0 })
        return point
      })
      return (
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            {chartData.series.slice(0, 3).map((s, i) => (
              <Line key={i} type="monotone" dataKey={`s${i}`} stroke={s.color} dot={false} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (type === 'funnels') {
      const result = executeFunnelQuery(events, report)
      const steps = result.steps || []
      return (
        <div style={{ padding: '4px 0', height: 100, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
          {steps.map((step, i) => {
            const pct = i === 0 ? 100 : step.overallPct
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  height: `${Math.max(pct, 5)}%`, background: '#4F44E0',
                  borderRadius: 2, minHeight: 4, opacity: 0.3 + (pct / 100) * 0.7
                }} />
                <div style={{ fontSize: 9, color: '#8E8EA0', textAlign: 'center' }}>
                  {Math.round(pct)}%
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (type === 'retention') {
      const result = executeRetentionQuery(events, report)
      const cohorts = result.cohorts || []
      return (
        <div style={{ height: 100, overflow: 'hidden', padding: '4px 0' }}>
          {cohorts.slice(0, 4).map((c, ci) => (
            <div key={ci} style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
              {c.retention.map((pct, pi) => (
                <div key={pi} style={{
                  width: 20, height: 16, borderRadius: 2,
                  background: `rgba(79, 68, 224, ${pct / 100})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, color: pct > 50 ? '#fff' : '#1B1B2E'
                }}>{pct}</div>
              ))}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8EA0', fontSize: 12, textTransform: 'capitalize' }}>
        {type} report
      </div>
    )
  }

  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: '#fff', border: '1px solid #E4E4E8', borderRadius: 8, padding: 20,
      cursor: 'pointer', position: 'relative',
      boxShadow: hover ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
      transition: 'box-shadow 0.15s'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1B1B2E', margin: 0 }} className="truncate">
          {title}
        </h3>
        {hover && (
          <button onClick={e => e.stopPropagation()} style={{
            width: 24, height: 24, border: 'none', background: '#F7F7F8',
            borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <MoreHorizontal size={14} color="#8E8EA0" />
          </button>
        )}
      </div>
      {renderMiniChart()}
    </div>
  )
}
