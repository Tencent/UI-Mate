import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Treemap, RadialBarChart, RadialBar
} from 'recharts'
import { useApp } from '../../context/AppContext'

const DEFAULT_COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FF6D01', '#46BDC6', '#7BAAF7', '#F07B72']

function aggregateData(data, dimensions, metrics) {
  if (!data || !data.length || !dimensions || !dimensions.length) return []

  const dimField = dimensions[0].fieldId
  const aggMap = {}

  data.forEach(row => {
    const dimVal = row[dimField] || '(not set)'
    if (!aggMap[dimVal]) {
      aggMap[dimVal] = { [dimField]: dimVal }
      metrics.forEach(m => { aggMap[dimVal][m.fieldId] = 0; aggMap[dimVal][`_count_${m.fieldId}`] = 0 })
    }
    metrics.forEach(m => {
      const val = parseFloat(row[m.fieldId]) || 0
      aggMap[dimVal][m.fieldId] += val
      aggMap[dimVal][`_count_${m.fieldId}`]++
    })
  })

  // Compute AVG for avg aggregations
  const rows = Object.values(aggMap)
  rows.forEach(row => {
    metrics.forEach(m => {
      if (m.aggregation === 'AVG') {
        row[m.fieldId] = row[`_count_${m.fieldId}`] ? row[m.fieldId] / row[`_count_${m.fieldId}`] : 0
      }
    })
  })

  return rows.sort((a, b) => {
    if (metrics[0]) {
      return (b[metrics[0].fieldId] || 0) - (a[metrics[0].fieldId] || 0)
    }
    return 0
  }).slice(0, 10)
}

function aggregateByDate(data, dateField, metrics) {
  if (!data || !data.length) return []
  const aggMap = {}
  data.forEach(row => {
    const date = row[dateField] || ''
    if (!date) return
    if (!aggMap[date]) {
      aggMap[date] = { date }
      metrics.forEach(m => { aggMap[date][m.fieldId] = 0 })
    }
    metrics.forEach(m => {
      aggMap[date][m.fieldId] = (aggMap[date][m.fieldId] || 0) + (parseFloat(row[m.fieldId]) || 0)
    })
  })
  return Object.values(aggMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-60)
}

function formatValue(val, fieldId) {
  if (typeof val !== 'number') return val
  if (fieldId && (fieldId.includes('rate') || fieldId.includes('ctr') || fieldId.includes('probability'))) {
    return `${val.toFixed(1)}%`
  }
  if (fieldId && (fieldId.includes('revenue') || fieldId.includes('cost') || fieldId.includes('amount') || fieldId.includes('cpc'))) {
    return `$${val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toFixed(0)}`
  }
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
  return val.toFixed(0)
}

function formatCompact(val, fieldId) {
  if (typeof val !== 'number') return val
  if (fieldId && (fieldId.includes('revenue') || fieldId.includes('cost') || fieldId.includes('amount'))) {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
    return `$${val.toFixed(0)}`
  }
  if (fieldId && (fieldId.includes('rate') || fieldId.includes('ctr') || fieldId.includes('probability'))) {
    return `${val.toFixed(1)}%`
  }
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
  return val.toLocaleString()
}

// ─── SCORECARD ─────────────────────────────────────────────────────────────────
export function ScorecardChart({ component, data }) {
  const { metrics, style } = component
  if (!metrics || !metrics.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>Configure a metric</div>
  }

  const metric = metrics[0]
  const total = data ? data.reduce((sum, row) => sum + (parseFloat(row[metric.fieldId]) || 0), 0) : 0
  const avg = data && data.length ? total / data.length : 0
  const value = metric.aggregation === 'AVG' ? avg : total

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '8px' }}>
      {style.showTitle && (
        <div style={{ fontSize: '12px', color: '#5F6368', marginBottom: '4px', textAlign: 'center' }}>{style.title || metric.name}</div>
      )}
      <div style={{ fontSize: '32px', fontWeight: 300, color: '#202124', lineHeight: 1.2 }}>
        {formatCompact(value, metric.fieldId)}
      </div>
      <div style={{ fontSize: '11px', color: '#5F6368', marginTop: '2px' }}>{metric.name}</div>
    </div>
  )
}

// ─── BAR CHART ─────────────────────────────────────────────────────────────────
export function BarChartComp({ component, data }) {
  const { dimensions, metrics, style } = component
  const chartData = useMemo(() => aggregateData(data, dimensions, metrics), [data, dimensions, metrics])
  const colors = style.colors || DEFAULT_COLORS
  const dimField = dimensions && dimensions[0] ? dimensions[0].fieldId : null

  if (!chartData.length || !dimField) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
        <XAxis dataKey={dimField} tick={{ fontSize: 11, fill: '#5F6368' }} interval={0} angle={-30} textAnchor="end" />
        <YAxis tick={{ fontSize: 11, fill: '#5F6368' }} tickFormatter={v => formatValue(v, metrics[0]?.fieldId)} />
        <Tooltip formatter={(val, name) => [formatCompact(val, name), name]} />
        {style.showLegend && metrics.length > 1 && <Legend />}
        {(metrics || []).map((m, i) => (
          <Bar key={m.fieldId} dataKey={m.fieldId} name={m.name} fill={colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} radius={[2, 2, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── LINE CHART ────────────────────────────────────────────────────────────────
export function LineChartComp({ component, data }) {
  const { dimensions, metrics, style } = component
  const chartData = useMemo(() => aggregateData(data, dimensions, metrics), [data, dimensions, metrics])
  const colors = style.colors || DEFAULT_COLORS
  const dimField = dimensions && dimensions[0] ? dimensions[0].fieldId : null

  if (!chartData.length || !dimField) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
        <XAxis dataKey={dimField} tick={{ fontSize: 11, fill: '#5F6368' }} />
        <YAxis tick={{ fontSize: 11, fill: '#5F6368' }} tickFormatter={v => formatValue(v, metrics[0]?.fieldId)} />
        <Tooltip formatter={(val, name) => [formatCompact(val, name), name]} />
        {style.showLegend && <Legend />}
        {(metrics || []).map((m, i) => (
          <Line key={m.fieldId} type="monotone" dataKey={m.fieldId} name={m.name}
            stroke={colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── TIME SERIES ───────────────────────────────────────────────────────────────
export function TimeSeriesChart({ component, data }) {
  const { dimensions, metrics, style } = component
  const dateField = dimensions && dimensions[0] ? dimensions[0].fieldId : 'dim_date'
  const chartData = useMemo(() => aggregateByDate(data, dateField, metrics), [data, dateField, metrics])
  const colors = style.colors || DEFAULT_COLORS

  if (!chartData.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>No data</div>
  }

  const trimDate = (d) => d ? d.substring(5) : d // show MM-DD only

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5F6368' }} tickFormatter={trimDate} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#5F6368' }} tickFormatter={v => formatValue(v, metrics[0]?.fieldId)} />
        <Tooltip formatter={(val, name) => [formatCompact(val, name), name]} />
        {style.showLegend && metrics.length > 1 && <Legend />}
        {(metrics || []).map((m, i) => (
          <Line key={m.fieldId} type="monotone" dataKey={m.fieldId} name={m.name}
            stroke={colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── AREA CHART ────────────────────────────────────────────────────────────────
export function AreaChartComp({ component, data }) {
  const { dimensions, metrics, style } = component
  const dateField = dimensions && dimensions[0] ? dimensions[0].fieldId : 'dim_date'
  const isDate = dateField.includes('date')
  const chartData = useMemo(
    () => isDate ? aggregateByDate(data, dateField, metrics) : aggregateData(data, dimensions, metrics),
    [data, dateField, dimensions, metrics]
  )
  const colors = style.colors || DEFAULT_COLORS
  const xKey = isDate ? 'date' : dateField

  if (!chartData.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
        <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#5F6368' }} />
        <YAxis tick={{ fontSize: 11, fill: '#5F6368' }} tickFormatter={v => formatValue(v, metrics[0]?.fieldId)} />
        <Tooltip formatter={(val, name) => [formatCompact(val, name), name]} />
        {style.showLegend && <Legend />}
        {(metrics || []).map((m, i) => (
          <Area key={m.fieldId} type="monotone" dataKey={m.fieldId} name={m.name}
            stroke={colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            fill={colors[i] || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            fillOpacity={0.2} strokeWidth={2} dot={false} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── PIE CHART ─────────────────────────────────────────────────────────────────
export function PieChartComp({ component, data, isDonut = false }) {
  const { dimensions, metrics, style } = component
  const chartData = useMemo(() => aggregateData(data, dimensions, metrics), [data, dimensions, metrics])
  const colors = style.colors || DEFAULT_COLORS
  const dimField = dimensions && dimensions[0] ? dimensions[0].fieldId : null
  const metField = metrics && metrics[0] ? metrics[0].fieldId : null

  if (!chartData.length || !dimField || !metField) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>No data</div>
  }

  const pieData = chartData.slice(0, 8).map((row, i) => ({
    name: row[dimField],
    value: parseFloat(row[metField]) || 0,
    color: colors[i % colors.length]
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={isDonut ? '40%' : 0}
          outerRadius="70%"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {pieData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(val, name) => [formatCompact(val, metField), name]} />
        {style.showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── TABLE CHART ───────────────────────────────────────────────────────────────
export function TableChart({ component, data }) {
  const { dimensions, metrics, style, rowLimit = 10 } = component

  if (!data || !data.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>No data</div>
  }

  const tableData = useMemo(() => {
    if (!dimensions || !dimensions.length) return data.slice(0, rowLimit)
    return aggregateData(data, dimensions, metrics).slice(0, rowLimit)
  }, [data, dimensions, metrics, rowLimit])

  const cols = [
    ...(dimensions || []),
    ...(metrics || [])
  ]

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col.fieldId} style={{
                padding: '8px 12px',
                textAlign: col.category === 'metric' || metrics.find(m => m.fieldId === col.fieldId) ? 'right' : 'left',
                color: '#5F6368',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '11px',
                borderBottom: '2px solid #DADCE0',
                background: 'white',
                position: 'sticky',
                top: 0,
                whiteSpace: 'nowrap'
              }}>
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid #F1F3F4' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8F9FA'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              {cols.map(col => {
                const isMetric = metrics.find(m => m.fieldId === col.fieldId)
                const val = row[col.fieldId]
                return (
                  <td key={col.fieldId} style={{
                    padding: '6px 12px',
                    textAlign: isMetric ? 'right' : 'left',
                    color: isMetric ? '#202124' : '#5F6368',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '160px',
                    textOverflow: 'ellipsis'
                  }}>
                    {isMetric ? formatCompact(parseFloat(val) || 0, col.fieldId) : val}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── GEO CHART (simplified) ───────────────────────────────────────────────────
export function GeoChart({ component, data }) {
  const { dimensions, metrics } = component
  const chartData = useMemo(() => aggregateData(data, dimensions, metrics), [data, dimensions, metrics])
  const dimField = dimensions && dimensions[0] ? dimensions[0].fieldId : null
  const metField = metrics && metrics[0] ? metrics[0].fieldId : null

  if (!chartData.length || !dimField) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>No data</div>
  }

  const maxVal = Math.max(...chartData.map(r => r[metField] || 0))

  return (
    <div style={{ padding: '8px', height: '100%', overflowY: 'auto' }}>
      <div style={{ fontSize: '11px', color: '#5F6368', marginBottom: '8px', textAlign: 'center' }}>
        {dimensions[0]?.name} vs {metrics[0]?.name}
      </div>
      {chartData.slice(0, 10).map((row, i) => {
        const val = parseFloat(row[metField]) || 0
        const pct = maxVal ? val / maxVal : 0
        return (
          <div key={i} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '120px', fontSize: '11px', color: '#5F6368', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row[dimField]}
            </div>
            <div style={{ flex: 1, height: '16px', background: '#E8EAED', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${pct * 100}%`, height: '100%', background: '#4285F4', borderRadius: '2px' }} />
            </div>
            <div style={{ width: '60px', fontSize: '11px', color: '#202124', textAlign: 'right', flexShrink: 0 }}>
              {formatCompact(val, metField)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── SCATTER CHART ─────────────────────────────────────────────────────────────
export function ScatterChartComp({ component, data }) {
  const { metrics, dimensions, style } = component
  if (!metrics || metrics.length < 2) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>Need 2 metrics</div>
  }

  const m1 = metrics[0], m2 = metrics[1]
  const chartData = (data || []).slice(0, 50).map(r => ({
    x: parseFloat(r[m1.fieldId]) || 0,
    y: parseFloat(r[m2.fieldId]) || 0
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
        <XAxis dataKey="x" type="number" tick={{ fontSize: 11, fill: '#5F6368' }} name={m1.name} tickFormatter={v => formatValue(v, m1.fieldId)} />
        <YAxis dataKey="y" type="number" tick={{ fontSize: 11, fill: '#5F6368' }} name={m2.name} tickFormatter={v => formatValue(v, m2.fieldId)} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(val, name) => [formatCompact(val, name), name]} />
        <Scatter data={chartData} fill={style.colors?.[0] || '#4285F4'} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// ─── GAUGE CHART ───────────────────────────────────────────────────────────────
export function GaugeChart({ component, data }) {
  const { metrics } = component
  if (!metrics || !metrics.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>No data</div>
  }
  const metric = metrics[0]
  const total = data ? data.reduce((s, r) => s + (parseFloat(r[metric.fieldId]) || 0), 0) : 0
  const value = metric.aggregation === 'AVG' ? (data?.length ? total / data.length : 0) : total
  const max = value * 2 || 100
  const pct = Math.min((value / max) * 100, 100)
  const angle = -135 + (pct / 100) * 270

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <svg width="140" height="90" viewBox="0 0 140 90">
        <path d="M 10 80 A 60 60 0 0 1 130 80" fill="none" stroke="#E8EAED" strokeWidth="12" strokeLinecap="round" />
        <path d="M 10 80 A 60 60 0 0 1 130 80" fill="none" stroke="#4285F4" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 188.5} 188.5`} />
        <circle cx="70" cy="80" r="5" fill="#202124" />
        <line x1="70" y1="80" x2={70 + 50 * Math.cos((angle - 90) * Math.PI / 180)} y2={80 + 50 * Math.sin((angle - 90) * Math.PI / 180)} stroke="#202124" strokeWidth="2" />
      </svg>
      <div style={{ fontSize: '20px', fontWeight: 300, color: '#202124' }}>{formatCompact(value, metric.fieldId)}</div>
      <div style={{ fontSize: '11px', color: '#5F6368' }}>{metric.name}</div>
    </div>
  )
}

// ─── TREEMAP ───────────────────────────────────────────────────────────────────
export function TreemapChart({ component, data }) {
  const { dimensions, metrics, style } = component
  const chartData = useMemo(() => aggregateData(data, dimensions, metrics), [data, dimensions, metrics])
  const colors = style.colors || DEFAULT_COLORS
  const dimField = dimensions && dimensions[0] ? dimensions[0].fieldId : null
  const metField = metrics && metrics[0] ? metrics[0].fieldId : null

  if (!chartData.length || !dimField) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>No data</div>
  }

  const treeData = chartData.slice(0, 10).map((row, i) => ({
    name: row[dimField],
    size: parseFloat(row[metField]) || 1,
    fill: colors[i % colors.length]
  }))

  const CustomContent = ({ root, depth, x, y, width, height, index, name, value }) => {
    if (width < 20 || height < 20) return null
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={treeData[index]?.fill || '#4285F4'} stroke="white" strokeWidth={2} />
        {width > 40 && height > 30 && (
          <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="white" fontSize={11} fontWeight={500}>
            {name}
          </text>
        )}
      </g>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap data={treeData} dataKey="size" content={<CustomContent />}>
        <Tooltip formatter={(val, name) => [formatCompact(parseFloat(val), metField), name]} />
      </Treemap>
    </ResponsiveContainer>
  )
}

// ─── PIVOT TABLE ───────────────────────────────────────────────────────────────
export function PivotTable({ component, data }) {
  return <TableChart component={component} data={data} />
}

// ─── DATE RANGE CONTROL ────────────────────────────────────────────────────────
export function DateRangeControl({ component, onFilterChange }) {
  const [open, setOpen] = useState(false)
  const range = component.dateRange || { start: '2024-10-01', end: '2024-12-29', preset: 'Last 90 days' }
  const [selected, setSelected] = useState(range.preset || 'Last 90 days')

  const presets = ['Auto', 'Today', 'Yesterday', 'Last 7 days', 'Last 28 days', 'Last 90 days', 'Last 12 months', 'This month', 'Last month']

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', border: '1px solid #DADCE0', borderRadius: '4px',
          background: 'white', cursor: 'pointer', fontSize: '13px', color: '#202124'
        }}
      >
        📅 {range.start} - {range.end} ({selected})
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 500,
          background: 'white', border: '1px solid #DADCE0', borderRadius: '8px',
          boxShadow: '0 2px 6px 2px rgba(60,64,67,0.15)', padding: '8px', minWidth: '200px'
        }}>
          {presets.map(p => (
            <div
              key={p}
              onClick={() => { setSelected(p); setOpen(false); if (onFilterChange) onFilterChange({ preset: p }) }}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                color: selected === p ? '#1A73E8' : '#202124',
                background: selected === p ? '#E8F0FE' : 'transparent',
                borderRadius: '4px'
              }}
            >
              {p}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── DROPDOWN CONTROL ─────────────────────────────────────────────────────────
export function DropdownControl({ component, data, onFilterChange }) {
  const [value, setValue] = useState('All')
  const dimField = component.dimensions?.[0]?.fieldId
  const values = useMemo(() => {
    if (!data || !dimField) return []
    return [...new Set(data.map(r => r[dimField]).filter(Boolean))].sort()
  }, [data, dimField])

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '4px 8px' }}>
      <select
        value={value}
        onChange={e => { setValue(e.target.value); if (onFilterChange) onFilterChange({ field: dimField, value: e.target.value }) }}
        style={{ width: '100%', padding: '6px 8px', border: '1px solid #DADCE0', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}
      >
        <option value="All">All</option>
        {values.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </div>
  )
}

// ─── SLIDER CONTROL ────────────────────────────────────────────────────────────
export function SliderControl({ component, data, onFilterChange }) {
  const metField = component.metrics?.[0]?.fieldId
  const max = useMemo(() => {
    if (!data || !metField) return 100
    return Math.max(...data.map(r => parseFloat(r[metField]) || 0))
  }, [data, metField])
  const [val, setVal] = useState(max)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%', padding: '4px 8px' }}>
      <span style={{ fontSize: '11px', color: '#5F6368' }}>0</span>
      <input type="range" min={0} max={max} value={val}
        onChange={e => { setVal(Number(e.target.value)); if (onFilterChange) onFilterChange({ field: metField, value: Number(e.target.value) }) }}
        style={{ flex: 1 }} />
      <span style={{ fontSize: '11px', color: '#5F6368' }}>{formatCompact(val, metField)}</span>
    </div>
  )
}

// ─── CHECKBOX CONTROL ─────────────────────────────────────────────────────────
export function CheckboxControl({ component, data, onFilterChange }) {
  const [checked, setChecked] = useState({})
  const dimField = component.dimensions?.[0]?.fieldId
  const values = useMemo(() => {
    if (!data || !dimField) return []
    return [...new Set(data.map(r => r[dimField]).filter(Boolean))].sort().slice(0, 8)
  }, [data, dimField])

  const toggle = (v) => {
    const newChecked = { ...checked, [v]: !checked[v] }
    setChecked(newChecked)
    if (onFilterChange) onFilterChange({ field: dimField, values: Object.keys(newChecked).filter(k => newChecked[k]) })
  }

  return (
    <div style={{ padding: '4px 8px', height: '100%', overflowY: 'auto' }}>
      {values.map(v => (
        <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', fontSize: '12px' }}>
          <input type="checkbox" checked={!!checked[v]} onChange={() => toggle(v)} />
          {v}
        </label>
      ))}
    </div>
  )
}

// ─── TEXT COMPONENT ────────────────────────────────────────────────────────────
export function TextComponent({ component }) {
  return (
    <div style={{
      height: '100%', padding: '8px',
      display: 'flex', alignItems: 'flex-start',
      fontSize: `${component.textSize || 14}px`,
      color: component.textColor || '#202124',
      fontWeight: component.textBold ? 700 : 400,
      fontStyle: component.textItalic ? 'italic' : 'normal',
      textAlign: component.textAlign || 'left',
      overflowWrap: 'break-word', wordBreak: 'break-word'
    }}>
      {component.textContent || 'Text'}
    </div>
  )
}

// ─── SHAPE COMPONENT ──────────────────────────────────────────────────────────
export function ShapeComponent({ component }) {
  return (
    <div style={{
      height: '100%', width: '100%',
      background: component.fillColor || '#FFFFFF',
      border: `${component.strokeWidth || 1}px solid ${component.strokeColor || '#5F6368'}`,
      borderRadius: component.shapeType === 'circle' ? '50%' : 0,
      opacity: component.style?.opacity ?? 1
    }} />
  )
}

// ─── COMPONENT RENDERER ────────────────────────────────────────────────────────
export function ChartRenderer({ component }) {
  const { state } = useApp()
  const ds = component.dataSourceId ? state.dataSources.find(d => d.id === component.dataSourceId) : null
  const data = ds?.data || []

  const { type, chartType, controlType, style } = component

  if (type === 'text') return <TextComponent component={component} />
  if (type === 'shape') return <ShapeComponent component={component} />

  if (type === 'control') {
    switch (controlType) {
      case 'date_range': return <DateRangeControl component={component} />
      case 'dropdown': return <DropdownControl component={component} data={data} />
      case 'slider': return <SliderControl component={component} data={data} />
      case 'checkbox': return <CheckboxControl component={component} data={data} />
      default: return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '12px', color: '#5F6368', border: '1px solid #DADCE0', borderRadius: '4px' }}>
          {controlType || 'Control'}
        </div>
      )
    }
  }

  // Wrap chart in title
  const showTitle = style?.showTitle && style?.title
  const chartHeight = showTitle ? 'calc(100% - 26px)' : '100%'

  const renderChart = () => {
    switch (chartType) {
      case 'scorecard': return <ScorecardChart component={component} data={data} />
      case 'bar':
      case 'column': return <BarChartComp component={component} data={data} />
      case 'stacked_bar':
      case 'stacked_column': return <BarChartComp component={{ ...component, stacked: true }} data={data} />
      case 'line': return <LineChartComp component={component} data={data} />
      case 'time_series': return <TimeSeriesChart component={component} data={data} />
      case 'area': return <AreaChartComp component={component} data={data} />
      case 'pie': return <PieChartComp component={component} data={data} />
      case 'donut': return <PieChartComp component={component} data={data} isDonut />
      case 'table': return <TableChart component={component} data={data} />
      case 'pivot_table': return <PivotTable component={component} data={data} />
      case 'geo': return <GeoChart component={component} data={data} />
      case 'scatter': return <ScatterChartComp component={component} data={data} />
      case 'gauge': return <GaugeChart component={component} data={data} />
      case 'treemap': return <TreemapChart component={component} data={data} />
      case 'combo': return <BarChartComp component={component} data={data} />
      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#5F6368', fontSize: '12px' }}>
            {chartType || 'Chart'}
          </div>
        )
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showTitle && (
        <div style={{ height: '26px', padding: '4px 8px', fontSize: '13px', color: '#202124', fontWeight: 500, flexShrink: 0 }}>
          {style.title}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0 }}>
        {renderChart()}
      </div>
    </div>
  )
}

// End of file
