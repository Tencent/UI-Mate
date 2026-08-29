import React, { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts'
import { Plus, X, ChevronDown, MoreVertical } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { executeInsightsQuery } from '../utils/queryEngine.js'

const CHART_COLORS = ['#4F44E0', '#EB5757', '#27AE60', '#F5A623', '#00BCD4', '#9C27B0', '#FF7043', '#607D8B']
const METRIC_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const EVENT_NAMES = [
  'All Events', 'Page View', 'Button Click', 'Sign Up', 'Login', 'Logout',
  'Search', 'Add to Cart', 'Purchase', 'Remove from Cart', 'Form Submit',
  'Page Scroll', 'Video Play', 'File Download', 'Share', 'Comment', 'Like',
  'Profile Update', 'Invite Sent', 'Notification Click', 'Session Start', 'Session End'
]

const PROPERTIES = [
  'Browser', 'Country', 'City', 'OS', 'Event Name',
  'page_path', 'utm_source', 'utm_campaign', '$referrer'
]

const MEASUREMENTS = ['Total Events', 'Unique Users', 'Total Sessions', 'Frequency per User']

export default function InsightsReport({ report, onUpdateReport, chartType, granularity }) {
  const { state } = useApp()
  const events = state?.events || []
  const [activeTab, setActiveTab] = useState('Query')
  const [measureOpen, setMeasureOpen] = useState(null)
  const [eventPickerFor, setEventPickerFor] = useState(null)
  const [propPickerFor, setPropPickerFor] = useState(null)

  // Execute query
  const queryResult = useMemo(() => {
    return executeInsightsQuery(events, report)
  }, [events, report.metrics, report.filters, report.breakdowns, report.dateRange, report.granularity])

  const chartData = queryResult.chartData || { labels: [], series: [] }
  const tableData = queryResult.tableData || { columns: [], rows: [] }

  const data = (chartData.labels || []).map((label, i) => {
    const point = { label }
    chartData.series.forEach((s, si) => { point[`s${si}`] = s.data[i] || 0 })
    return point
  })

  function addMetric() {
    const metrics = report.metrics || []
    const idx = metrics.length
    const label = METRIC_LABELS[idx] || String.fromCharCode(65 + idx)
    const color = CHART_COLORS[idx % CHART_COLORS.length]
    onUpdateReport({
      metrics: [...metrics, {
        id: 'metric_' + Date.now(),
        label,
        name: 'Total Page View',
        events: [{ id: 'mevt_' + Date.now(), name: 'Page View', color }],
        measurement: 'Total Events',
        aggregation: null
      }]
    })
  }

  function removeMetric(metricId) {
    onUpdateReport({ metrics: (report.metrics || []).filter(m => m.id !== metricId) })
  }

  function updateEventName(metricId, eventIdx, newName) {
    const metrics = (report.metrics || []).map(m => {
      if (m.id !== metricId) return m
      const events = [...m.events]
      events[eventIdx] = { ...events[eventIdx], name: newName }
      return { ...m, events, name: `${m.measurement} of ${newName}` }
    })
    onUpdateReport({ metrics })
    setEventPickerFor(null)
  }

  function addFilter(property) {
    onUpdateReport({
      filters: [...(report.filters || []), { id: 'f_' + Date.now(), property, operator: 'is', values: [] }]
    })
    setPropPickerFor(null)
  }

  function removeFilter(filterId) {
    onUpdateReport({ filters: (report.filters || []).filter(f => f.id !== filterId) })
  }

  function addBreakdown(property) {
    onUpdateReport({
      breakdowns: [...(report.breakdowns || []), { id: 'bd_' + Date.now(), property, propertyType: 'string' }]
    })
    setPropPickerFor(null)
  }

  function removeBreakdown(bdId) {
    onUpdateReport({ breakdowns: (report.breakdowns || []).filter(b => b.id !== bdId) })
  }

  function renderChart() {
    const series = chartData.series || []
    if (series.length === 0) {
      return <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8EA0' }}>No data. Add metrics and run the query.</div>
    }

    if (chartType === 'pie') {
      const pieData = series.map((s, i) => ({
        name: s.name,
        value: s.data.reduce((a, b) => a + b, 0),
        color: s.color
      }))
      return (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} dataKey="value">
              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F4" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E4E4E8' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s, i) => (
              <Bar key={i} dataKey={`s${i}`} fill={s.color} name={s.name} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F4" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E4E4E8' }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s, i) => (
            <Line key={i} type="monotone" dataKey={`s${i}`} stroke={s.color} name={s.name} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Property picker modal */}
      {propPickerFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPropPickerFor(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 16, width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{propPickerFor === 'filter' ? 'Add Filter' : 'Add Breakdown'}</span>
              <button onClick={() => setPropPickerFor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0' }}><X size={14} /></button>
            </div>
            {PROPERTIES.map(prop => (
              <button key={prop} onClick={() => propPickerFor === 'filter' ? addFilter(prop) : addBreakdown(prop)} style={{
                width: '100%', padding: '7px 10px', border: 'none', borderRadius: 4,
                background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#1B1B2E'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F7F7F8'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                {prop}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Event picker modal */}
      {eventPickerFor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEventPickerFor(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 16, width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Select Event</span>
              <button onClick={() => setEventPickerFor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0' }}><X size={14} /></button>
            </div>
            {EVENT_NAMES.map(name => (
              <button key={name} onClick={() => updateEventName(eventPickerFor.metricId, eventPickerFor.eventIdx, name)} style={{
                width: '100%', padding: '7px 10px', border: 'none', borderRadius: 4,
                background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#1B1B2E'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F7F7F8'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* Chart */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            {chartData.series?.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 3, borderRadius: 2, background: s.color }} />
                <span style={{ fontSize: 12, color: '#585870' }}>{s.name}</span>
              </div>
            ))}
          </div>
          {renderChart()}
        </div>

        {/* Summary stats */}
        {chartData.series?.length > 0 && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {chartData.series.slice(0, 4).map((s, i) => {
              const total = s.data.reduce((a, b) => a + b, 0)
              return (
                <div key={i} style={{ background: '#F7F7F8', borderRadius: 8, padding: '12px 16px', minWidth: 140 }}>
                  <div style={{ fontSize: 11, color: '#8E8EA0', marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{total.toLocaleString()}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Data table */}
        <div style={{ border: '1px solid #E4E4E8', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F7F7F8' }}>
                {(tableData.columns || []).map(col => (
                  <th key={col} style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                    color: '#8E8EA0', borderBottom: '1px solid #E4E4E8', whiteSpace: 'nowrap'
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(tableData.rows || []).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E4E4E8' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9F9FB'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      {row.metric}
                    </div>
                  </td>
                  {row.breakdown !== undefined && <td style={{ padding: '10px 16px', fontSize: 13, color: '#585870' }}>{row.breakdown}</td>}
                  <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 500 }}>{row.average}</td>
                  {(row.values || []).map((v, vi) => (
                    <td key={vi} style={{ padding: '10px 16px', fontSize: 13 }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right query panel */}
      <div style={{
        width: 300, borderLeft: '1px solid #E4E4E8', background: '#fff',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
      }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #E4E4E8', padding: '0 16px' }}>
          {['Query', 'Annotations'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '12px 10px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? '#4F44E0' : '#8E8EA0',
              borderBottom: activeTab === tab ? '2px solid #4F44E0' : '2px solid transparent',
              marginBottom: -1
            }}>{tab}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {activeTab === 'Query' && (
            <>
              {/* Metrics */}
              <PanelSection label="Metrics" onAdd={addMetric} />
              {(report.metrics || []).map((metric, i) => (
                <div key={metric.id} style={{ marginBottom: 14, background: '#F7F7F8', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4, background: CHART_COLORS[i % CHART_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0
                    }}>{metric.label}</div>
                    <span style={{ flex: 1, fontSize: 13, color: '#1B1B2E', fontWeight: 500 }} className="truncate">{metric.name}</span>
                    <button onClick={() => removeMetric(metric.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0', padding: 2 }}><X size={12} /></button>
                  </div>
                  {(metric.events || []).map((ev, ei) => (
                    <button key={ev.id} onClick={() => setEventPickerFor({ metricId: metric.id, eventIdx: ei })} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px',
                      background: '#fff', borderRadius: 4, border: '1px solid #E4E4E8',
                      marginBottom: 4, cursor: 'pointer', fontSize: 12, color: '#1B1B2E', width: '100%', textAlign: 'left'
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.color, flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{ev.name}</span>
                      <ChevronDown size={10} color="#8E8EA0" />
                    </button>
                  ))}
                  <div style={{ position: 'relative', marginTop: 4 }}>
                    <button onClick={() => setMeasureOpen(measureOpen === metric.id ? null : metric.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                      border: '1px solid #E4E4E8', borderRadius: 4, background: '#fff',
                      cursor: 'pointer', fontSize: 12, color: '#1B1B2E', width: '100%', textAlign: 'left'
                    }}>
                      <span style={{ color: '#8E8EA0', fontSize: 11 }}>Measure:</span>
                      <span style={{ background: '#EEEDFC', color: '#4F44E0', borderRadius: 4, padding: '1px 6px', fontSize: 11, fontWeight: 500 }}>
                        {metric.measurement || 'Total Events'}
                      </span>
                    </button>
                    {measureOpen === metric.id && (
                      <MeasurementDropdown
                        selected={metric.measurement}
                        onSelect={m => {
                          onUpdateReport({ metrics: (report.metrics || []).map(mt => mt.id === metric.id ? { ...mt, measurement: m, name: `${m} of ${mt.events[0]?.name || 'Events'}` } : mt) })
                          setMeasureOpen(null)
                        }}
                        onClose={() => setMeasureOpen(null)}
                      />
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addMetric} style={{ color: '#4F44E0', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: '4px 0', fontWeight: 500 }}>
                + Add Metric
              </button>

              {/* Filters */}
              <PanelSection label="Filter" onAdd={() => setPropPickerFor('filter')} />
              {(report.filters || []).map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: '#F7F7F8', borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: '#8E8EA0', fontWeight: 600 }}>Aa</span>
                  <span style={{ color: '#1B1B2E', flex: 1 }}>{f.property} {f.operator} {(f.values || []).join(', ') || '...'}</span>
                  <button onClick={() => removeFilter(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0', padding: 2 }}><X size={10} /></button>
                </div>
              ))}

              {/* Breakdowns */}
              <PanelSection label="Breakdown" onAdd={() => setPropPickerFor('breakdown')} />
              {(report.breakdowns || []).map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: '#F7F7F8', borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: '#8E8EA0', fontWeight: 600 }}>Aa</span>
                  <span style={{ color: '#1B1B2E', flex: 1 }}>{b.property}</span>
                  <button onClick={() => removeBreakdown(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0', padding: 2 }}><X size={10} /></button>
                </div>
              ))}
            </>
          )}
          {activeTab === 'Annotations' && (
            <div style={{ fontSize: 13, color: '#8E8EA0', padding: '8px 0' }}>
              {(state?.annotations || []).map(ann => (
                <div key={ann.id} style={{ padding: '8px 0', borderBottom: '1px solid #F0F0F4' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1B1B2E' }}>{ann.date}</div>
                  <div style={{ fontSize: 12, color: '#8E8EA0' }}>{ann.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PanelSection({ label, onAdd }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#1B1B2E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <button onClick={onAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0' }}>
        <Plus size={14} />
      </button>
    </div>
  )
}

function MeasurementDropdown({ selected, onSelect, onClose }) {
  React.useEffect(() => {
    const handler = () => onClose()
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [onClose])

  return (
    <div onClick={e => e.stopPropagation()} style={{
      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, marginTop: 4,
      background: '#fff', border: '1px solid #E4E4E8', borderRadius: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)', padding: 4
    }}>
      {MEASUREMENTS.map(m => (
        <button key={m} onClick={() => onSelect(m)} style={{
          width: '100%', padding: '7px 10px', border: 'none', borderRadius: 4,
          background: selected === m ? '#4F44E0' : 'none',
          color: selected === m ? '#fff' : '#1B1B2E',
          fontSize: 12, cursor: 'pointer', textAlign: 'left'
        }}
        onMouseEnter={e => { if (selected !== m) e.currentTarget.style.background = '#F7F7F8' }}
        onMouseLeave={e => { if (selected !== m) e.currentTarget.style.background = 'none' }}>
          {m}
        </button>
      ))}
    </div>
  )
}
