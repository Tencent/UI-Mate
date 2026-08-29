import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import MetricCard from '../components/MetricCard.jsx'
import SortableTable from '../components/SortableTable.jsx'
import StatusToggle from '../components/StatusToggle.jsx'
import DateRangePicker from '../components/DateRangePicker.jsx'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const fmt = {
  num: n => n == null ? '-' : n.toLocaleString(),
  usd: n => n == null ? '-' : '$' + n.toFixed(2),
  pct: n => n == null ? '-' : (n * 100).toFixed(2) + '%',
}

const TYPE_COLORS = {
  SEARCH: '#1A73E8', DISPLAY: '#188038', VIDEO: '#D93025',
  SHOPPING: '#F9AB00', PERFORMANCE_MAX: '#8430CE'
}

export default function Overview() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [activeMetrics, setActiveMetrics] = useState({ clicks: true, cost: true, impressions: false })
  const [chartType, setChartType] = useState('line')

  const campaigns = useMemo(() => (state?.campaigns || []).filter(c => c.status !== 'REMOVED'), [state])
  const dailyMetrics = state?.dailyMetrics || []
  const dateRange = state?.selectedDateRange
  const score = state?.account?.optimizationScore || 72

  // Optimization score gauge
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const progressColor = score >= 80 ? '#188038' : score >= 50 ? '#F9AB00' : '#D93025'

  // Aggregate all campaigns for hero cards
  const totals = useMemo(() => {
    const filtered = dailyMetrics.filter(d =>
      (!dateRange || (d.date >= dateRange.start && d.date <= dateRange.end))
    )
    const clicks = filtered.reduce((s, d) => s + d.clicks, 0)
    const impressions = filtered.reduce((s, d) => s + d.impressions, 0)
    const cost = filtered.reduce((s, d) => s + d.cost, 0)
    const conversions = filtered.reduce((s, d) => s + d.conversions, 0)
    const ctr = impressions > 0 ? clicks / impressions : 0
    const avgCpc = clicks > 0 ? cost / clicks : 0
    return { clicks, impressions, ctr, avgCpc, cost, conversions }
  }, [dailyMetrics, dateRange])

  // Chart data — aggregate per date
  const chartData = useMemo(() => {
    const byDate = {}
    dailyMetrics.filter(d => !dateRange || (d.date >= dateRange.start && d.date <= dateRange.end))
      .forEach(d => {
        if (!byDate[d.date]) byDate[d.date] = { date: d.date, clicks: 0, cost: 0, impressions: 0, conversions: 0 }
        byDate[d.date].clicks += d.clicks
        byDate[d.date].cost += parseFloat(d.cost.toFixed(2))
        byDate[d.date].impressions += d.impressions
        byDate[d.date].conversions += d.conversions
      })
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
  }, [dailyMetrics, dateRange])

  const columns = [
    {
      key: 'status', label: '', sortable: false, nowrap: true,
      render: (v, row) => row.id === '__total__' ? null : (
        <StatusToggle entityType="campaign" status={v} onChange={newStatus => dispatch({ type: 'UPDATE_CAMPAIGN', payload: { id: row.id, status: newStatus } })} />
      )
    },
    {
      key: 'name', label: 'Campaign', nowrap: true,
      render: (v, row) => row.id === '__total__' ? <span style={{ fontWeight: 600 }}>Total</span> : (
        <span style={{ color: '#1A73E8', fontWeight: 500, cursor: 'pointer' }} onClick={e => { e.stopPropagation(); navigate(`/campaigns/${row.id}`) }}>{v}</span>
      )
    },
    {
      key: 'type', label: 'Type', nowrap: true,
      render: (v, row) => row.id === '__total__' ? null : (
        <span style={{ background: (TYPE_COLORS[v] || '#5F6368') + '22', color: TYPE_COLORS[v] || '#5F6368', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500 }}>{v}</span>
      )
    },
    { key: 'budget', label: 'Budget', align: 'right', render: (v, row) => row.id === '__total__' ? '' : `$${v.toFixed(2)}/day` },
    { key: 'clicks', label: 'Clicks', align: 'right', render: (v, row) => fmt.num(row.metrics?.clicks) },
    { key: 'impressions', label: 'Impr.', align: 'right', render: (v, row) => fmt.num(row.metrics?.impressions) },
    { key: 'ctr', label: 'CTR', align: 'right', render: (v, row) => fmt.pct(row.metrics?.ctr) },
    { key: 'avgCpc', label: 'Avg. CPC', align: 'right', render: (v, row) => fmt.usd(row.metrics?.avgCpc) },
    { key: 'cost', label: 'Cost', align: 'right', render: (v, row) => fmt.usd(row.metrics?.cost) },
    { key: 'conversions', label: 'Conv.', align: 'right', render: (v, row) => fmt.num(row.metrics?.conversions) },
  ]

  const tableRows = useMemo(() => {
    const rows = campaigns.map(c => ({ ...c, id: c.id }))
    const totalsRow = {
      id: '__total__', _bold: true, name: 'Total', type: '', status: '', budget: 0,
      metrics: {
        clicks: rows.reduce((s, r) => s + (r.metrics?.clicks || 0), 0),
        impressions: rows.reduce((s, r) => s + (r.metrics?.impressions || 0), 0),
        ctr: null, avgCpc: null,
        cost: rows.reduce((s, r) => s + (r.metrics?.cost || 0), 0),
        conversions: rows.reduce((s, r) => s + (r.metrics?.conversions || 0), 0),
      }
    }
    return [...rows, totalsRow]
  }, [campaigns])

  // Compute actual delta percentages
  const deltas = useMemo(() => {
    const allDates = [...new Set(dailyMetrics.map(d => d.date))].sort()
    if (allDates.length === 0) return {}
    const currentDates = dailyMetrics
      .filter(d => !dateRange || (d.date >= dateRange.start && d.date <= dateRange.end))
      .map(d => d.date)
    const currentSet = new Set(currentDates)
    const currentStart = currentDates.length > 0 ? currentDates.reduce((a, b) => a < b ? a : b) : null
    const currentEnd = currentDates.length > 0 ? currentDates.reduce((a, b) => a > b ? a : b) : null
    let priorDates = []
    if (currentStart && currentEnd) {
      const startMs = new Date(currentStart).getTime()
      const endMs = new Date(currentEnd).getTime()
      const periodMs = endMs - startMs + 86400000
      const priorEnd = new Date(startMs - 86400000).toISOString().slice(0, 10)
      const priorStart = new Date(startMs - periodMs).toISOString().slice(0, 10)
      priorDates = allDates.filter(d => d >= priorStart && d <= priorEnd)
    }
    if (priorDates.length === 0 && allDates.length >= 2) {
      const mid = Math.floor(allDates.length / 2)
      priorDates = allDates.slice(0, mid)
      const secondHalf = new Set(allDates.slice(mid))
      if (!dateRange) {
        const priorMetrics = dailyMetrics.filter(d => priorDates.includes(d.date))
        const currentMetrics = dailyMetrics.filter(d => secondHalf.has(d.date))
        const sum = (arr, key) => arr.reduce((s, d) => s + (d[key] || 0), 0)
        const pClicks = sum(priorMetrics, 'clicks') || 1
        const pImpr = sum(priorMetrics, 'impressions') || 1
        const pCost = sum(priorMetrics, 'cost') || 1
        const pConv = sum(priorMetrics, 'conversions') || 1
        const pCtr = pImpr > 0 ? sum(priorMetrics, 'clicks') / pImpr : 0
        const pCpc = sum(priorMetrics, 'clicks') > 0 ? sum(priorMetrics, 'cost') / sum(priorMetrics, 'clicks') : 0
        const cClicks = sum(currentMetrics, 'clicks')
        const cImpr = sum(currentMetrics, 'impressions')
        const cCost = sum(currentMetrics, 'cost')
        const cConv = sum(currentMetrics, 'conversions')
        const cCtr = cImpr > 0 ? cClicks / cImpr : 0
        const cCpc = cClicks > 0 ? cCost / cClicks : 0
        const pctFn = (curr, prev) => prev === 0 ? null : ((curr - prev) / Math.abs(prev)) * 100
        return { clicks: pctFn(cClicks, pClicks), impressions: pctFn(cImpr, pImpr), ctr: pctFn(cCtr, pCtr), avgCpc: pctFn(cCpc, pCpc), cost: pctFn(cCost, pCost), conversions: pctFn(cConv, pConv) }
      }
    }
    const priorSet = new Set(priorDates)
    const priorMetrics = dailyMetrics.filter(d => priorSet.has(d.date))
    const currentMetrics = dailyMetrics.filter(d => currentSet.has(d.date))
    const sum = (arr, key) => arr.reduce((s, d) => s + (d[key] || 0), 0)
    const pClicks = sum(priorMetrics, 'clicks'); const pImpr = sum(priorMetrics, 'impressions')
    const pCost = sum(priorMetrics, 'cost'); const pConv = sum(priorMetrics, 'conversions')
    const pCtr = pImpr > 0 ? pClicks / pImpr : 0; const pCpc = pClicks > 0 ? pCost / pClicks : 0
    const cClicks = sum(currentMetrics, 'clicks'); const cImpr = sum(currentMetrics, 'impressions')
    const cCost = sum(currentMetrics, 'cost'); const cConv = sum(currentMetrics, 'conversions')
    const cCtr = cImpr > 0 ? cClicks / cImpr : 0; const cCpc = cClicks > 0 ? cCost / cClicks : 0
    const pctFn = (curr, prev) => prev === 0 ? null : ((curr - prev) / Math.abs(prev)) * 100
    return { clicks: pctFn(cClicks, pClicks), impressions: pctFn(cImpr, pImpr), ctr: pctFn(cCtr, pCtr), avgCpc: pctFn(cCpc, pCpc), cost: pctFn(cCost, pCost), conversions: pctFn(cConv, pConv) }
  }, [dailyMetrics, dateRange])

  const fmtDelta = (val) => {
    if (val == null) return 'vs prev period'
    const sign = val >= 0 ? '+' : ''
    return `${sign}${val.toFixed(1)}% vs prev period`
  }
  const ChartComponent = chartType === 'area' ? AreaChart : LineChart
  const SeriesComponent = chartType === 'area' ? Area : Line

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#202124' }}>Overview</h1>
        <DateRangePicker />
      </div>

      {/* Optimization Score + Metrics row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'stretch' }}>
        {/* Optimization Score Card */}
        <div style={{
          background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 16,
          display: 'flex', alignItems: 'center', gap: 16, minWidth: 200, cursor: 'pointer',
        }}
          onClick={() => navigate('/recommendations')}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#1A73E8'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#DADCE0'}
        >
          <svg width={120} height={120} viewBox="0 0 120 120">
            <circle cx={60} cy={60} r={radius} fill="none" stroke="#F1F3F4" strokeWidth={10} />
            <circle cx={60} cy={60} r={radius} fill="none" stroke={progressColor} strokeWidth={10}
              strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
              transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 1s ease' }} />
            <text x={60} y={55} textAnchor="middle" dominantBaseline="middle" fontSize={28} fontWeight={700} fill={progressColor}>{score}</text>
            <text x={60} y={78} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#5F6368">/ 100</text>
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#202124', marginBottom: 4 }}>Optimization score</div>
            <div style={{ fontSize: 12, color: '#5F6368' }}>
              {(state?.recommendations || []).filter(r => r.status === 'PENDING').length} recommendations available
            </div>
            <div style={{ fontSize: 12, color: '#1A73E8', marginTop: 8, fontWeight: 500 }}>View recommendations</div>
          </div>
        </div>

        {/* Metric cards */}
        <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
          <MetricCard label="Clicks" value={fmt.num(totals.clicks)} deltaLabel={fmtDelta(deltas.clicks)} positive={deltas.clicks == null ? true : deltas.clicks >= 0} />
          <MetricCard label="Impressions" value={fmt.num(totals.impressions)} deltaLabel={fmtDelta(deltas.impressions)} positive={deltas.impressions == null ? true : deltas.impressions >= 0} />
          <MetricCard label="CTR" value={fmt.pct(totals.ctr)} deltaLabel={fmtDelta(deltas.ctr)} positive={deltas.ctr == null ? true : deltas.ctr >= 0} />
          <MetricCard label="Avg. CPC" value={fmt.usd(totals.avgCpc)} deltaLabel={fmtDelta(deltas.avgCpc)} positive={deltas.avgCpc == null ? true : deltas.avgCpc <= 0} />
          <MetricCard label="Cost" value={fmt.usd(totals.cost)} deltaLabel={fmtDelta(deltas.cost)} positive={deltas.cost == null ? false : deltas.cost <= 0} />
          <MetricCard label="Conversions" value={fmt.num(totals.conversions)} deltaLabel={fmtDelta(deltas.conversions)} positive={deltas.conversions == null ? true : deltas.conversions >= 0} />
        </div>
      </div>

      {/* Performance Chart */}
      <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Performance</span>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {[
              { key: 'clicks', label: 'Clicks', color: '#1A73E8' },
              { key: 'cost', label: 'Cost', color: '#188038' },
              { key: 'impressions', label: 'Impressions', color: '#F9AB00' },
              { key: 'conversions', label: 'Conv.', color: '#D93025' },
            ].map(m => (
              <button key={m.key} onClick={() => setActiveMetrics(am => ({ ...am, [m.key]: !am[m.key] }))}
                style={{
                  padding: '4px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${activeMetrics[m.key] ? m.color : '#DADCE0'}`,
                  background: activeMetrics[m.key] ? m.color + '22' : '#fff',
                  color: activeMetrics[m.key] ? m.color : '#5F6368', fontWeight: 500
                }}>
                {m.label}
              </button>
            ))}
            <div style={{ display: 'flex', border: '1px solid #DADCE0', borderRadius: 4, overflow: 'hidden' }}>
              {['line', 'area'].map(t => (
                <button key={t} onClick={() => setChartType(t)} style={{ padding: '4px 10px', border: 'none', background: chartType === t ? '#E8F0FE' : '#fff', color: chartType === t ? '#1A73E8' : '#5F6368', cursor: 'pointer', fontSize: 12 }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <ChartComponent data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F4" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#5F6368' }} tickFormatter={d => d.slice(5)} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5F6368' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#5F6368' }} />
            <Tooltip formatter={(value, name) => [typeof value === 'number' ? value.toFixed(name === 'cost' ? 2 : 0) : value, name]} />
            <Legend />
            {activeMetrics.clicks && (
              <SeriesComponent yAxisId="left" type="monotone" dataKey="clicks" stroke="#1A73E8" fill="#1A73E8" fillOpacity={0.1} name="Clicks" dot={false} />
            )}
            {activeMetrics.cost && (
              <SeriesComponent yAxisId="right" type="monotone" dataKey="cost" stroke="#188038" fill="#188038" fillOpacity={0.1} name="Cost" dot={false} />
            )}
            {activeMetrics.impressions && (
              <SeriesComponent yAxisId="left" type="monotone" dataKey="impressions" stroke="#F9AB00" fill="#F9AB00" fillOpacity={0.1} name="Impressions" dot={false} />
            )}
            {activeMetrics.conversions && (
              <SeriesComponent yAxisId="left" type="monotone" dataKey="conversions" stroke="#D93025" fill="#D93025" fillOpacity={0.1} name="Conversions" dot={false} />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      {/* Campaigns table */}
      <div style={{ background: '#fff', border: '1px solid #DADCE0', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #DADCE0' }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Campaigns</span>
        </div>
        <SortableTable columns={columns} rows={tableRows} onRowClick={row => row.id !== '__total__' && navigate(`/campaigns/${row.id}`)} />
      </div>
    </div>
  )
}
