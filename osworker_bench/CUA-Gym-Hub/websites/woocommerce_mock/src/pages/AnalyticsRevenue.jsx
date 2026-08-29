import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { TrendingUp, TrendingDown, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

const DATE_PRESETS = [
  'Today', 'Yesterday', 'Week to date', 'Last week',
  'Month to date', 'Last month', 'Quarter to date', 'Last quarter',
  'Year to date', 'Last year', 'Custom'
]

function fmt(n) {
  return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function pctChange(curr, prev) {
  if (!prev || prev === 0) return 0
  return ((curr - prev) / prev) * 100
}

function SummaryCard({ label, value, change, prevValue, selected, onClick }) {
  const positive = change >= 0
  return (
    <div className={`wc-summary-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="wc-summary-card-label">{label}</div>
      <div className="wc-summary-card-value">{value}</div>
      <div className={`wc-summary-card-change ${positive ? 'positive' : 'negative'}`}>
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {' '}{Math.abs(change).toFixed(1)}%
      </div>
      {prevValue && <div className="wc-summary-card-prev">Previous year: {prevValue}</div>}
    </div>
  )
}

export default function AnalyticsRevenue() {
  const { state } = useApp()
  const [selectedPreset, setSelectedPreset] = useState('Last month')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('grossRevenue')
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const summary = state.analytics.revenueSummary
  const prev = summary.previousPeriod

  const chartData = state.analytics.dailyData.map(d => ({
    date: format(new Date(d.date), 'MMM d'),
    'Current Period': d[selectedMetric] || d.grossRevenue,
    'Previous Year': d['previous' + selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)] || d.previousGrossRevenue,
  }))

  const tableData = [...state.analytics.dailyData].sort((a, b) => {
    const aVal = a[sortField], bVal = b[sortField]
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const metrics = [
    { key: 'grossRevenue', label: 'Gross Revenue', value: fmt(summary.grossRevenue), prev: fmt(prev.grossRevenue), change: pctChange(summary.grossRevenue, prev.grossRevenue) },
    { key: 'refunds', label: 'Refunds', value: fmt(summary.refunds), prev: '$0.00', change: 0 },
    { key: 'coupons', label: 'Coupons', value: fmt(summary.coupons), prev: '$0.00', change: 0 },
    { key: 'taxes', label: 'Taxes', value: fmt(summary.taxes), prev: '$0.00', change: 0 },
    { key: 'shipping', label: 'Shipping', value: fmt(summary.shipping), prev: fmt(summary.shipping * 0.9), change: pctChange(summary.shipping, summary.shipping * 0.9) },
    { key: 'netRevenue', label: 'Net Revenue', value: fmt(summary.netRevenue), prev: fmt(prev.netRevenue), change: pctChange(summary.netRevenue, prev.netRevenue) },
  ]

  return (
    <div>
      <div className="wc-breadcrumb">
        <a>XooCommerce</a><span>/</span><a>Analytics</a><span>/</span>Revenue
      </div>

      <div className="wp-page-title"><h1>Revenue</h1></div>

      {/* Date range picker */}
      <div className="wc-date-picker" style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 13, marginRight: 8 }}>Date Range:</span>
        <button className="wc-date-picker-button" onClick={() => setShowDatePicker(v => !v)}>
          {selectedPreset} (Mar 1–31, 2026) vs. Previous Year (Mar 1–31, 2025) ▾
        </button>
        {showDatePicker && (
          <div className="wc-date-picker-dropdown">
            {DATE_PRESETS.map(p => (
              <div key={p} className={`wc-date-picker-option ${selectedPreset === p ? 'active' : ''}`} onClick={() => { setSelectedPreset(p); setShowDatePicker(false) }}>
                {p}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="wc-summary-cards">
        {metrics.map(m => (
          <SummaryCard
            key={m.key}
            label={m.label}
            value={m.value}
            change={m.change}
            prevValue={m.prev}
            selected={selectedMetric === m.key}
            onClick={() => setSelectedMetric(m.key)}
          />
        ))}
      </div>

      {/* Chart */}
      <div className="wc-card">
        <div className="wc-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 600 }}>
              {metrics.find(m => m.key === selectedMetric)?.label || 'Gross Revenue'}
            </span>
            <span style={{ fontSize: 12, color: '#646970' }}>
              ✓ Last Month (Mar 1–31, 2026) — <strong>{metrics.find(m => m.key === selectedMetric)?.value}</strong>
              {'  '} ✓ Previous Year (Mar 1–31, 2025) — <strong>{metrics.find(m => m.key === selectedMetric)?.prev}</strong>
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#646970' }}>By day</span>
        </div>
        <div style={{ padding: '20px', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcdcde" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="Current Period" stroke="#7f54b3" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Previous Year" stroke="#b3b3b3" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data table */}
      <div className="wc-card">
        <div className="wc-card-header">
          <span>Revenue</span>
          <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => { const blob = new Blob(['Date,Orders,Gross Revenue,Refunds,Coupons,Taxes,Shipping,Net Revenue\n' + state.analytics.dailyData.map(d => `${d.date},${d.ordersCount},${d.grossRevenue},${d.refunds},${d.coupons},${d.taxes},${d.shipping},${d.netRevenue}`).join('\n')], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'revenue-report.csv'; a.click() }}>
            <Download size={14} /> Download
          </button>
        </div>
        <table className="wp-list-table" style={{ border: 'none' }}>
          <thead>
            <tr>
              {[['date', 'Date'], ['ordersCount', 'Orders'], ['grossRevenue', 'Gross Revenue'], ['refunds', 'Refunds'], ['coupons', 'Coupons'], ['taxes', 'Taxes'], ['shipping', 'Shipping'], ['netRevenue', 'Net Revenue']].map(([field, label]) => (
                <th key={field} onClick={() => handleSort(field)} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {label} {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map(d => (
              <tr key={d.date}>
                <td>{format(new Date(d.date), 'MMM d, yyyy')}</td>
                <td style={{ color: '#2271b1' }}>{d.ordersCount}</td>
                <td>{fmt(d.grossRevenue)}</td>
                <td>{fmt(d.refunds)}</td>
                <td>{fmt(d.coupons)}</td>
                <td>{fmt(d.taxes)}</td>
                <td>{fmt(d.shipping)}</td>
                <td>{fmt(d.netRevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
