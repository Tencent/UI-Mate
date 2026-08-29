import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const TABS = [
  { id: 'traffic', label: 'Traffic' },
  { id: 'security', label: 'Security' },
  { id: 'performance', label: 'Performance' }
]

const COLORS = ['#F38020', '#0051C3', '#068D45', '#D63B23', '#8B5CF6', '#06B6D4', '#F59E0B']

function formatBytes(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + ' KB'
  return bytes + ' B'
}

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card" style={{ padding: '16px 20px', flex: 1, minWidth: 140, borderTop: accent ? `3px solid ${accent}` : undefined }}>
      <div style={{ fontSize: 12, color: 'var(--cf-text-secondary)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--cf-text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--cf-text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function TrafficTab({ analytics, timeRangeLabel = 'Last 24 Hours' }) {
  const traffic = analytics?.traffic || {}
  const ts = traffic.timeseries || []

  const chartData = ts.map(t => ({
    name: t.label || (t.hour != null ? t.hour + ':00' : ''),
    Total: t.requests,
    Cached: t.cached_requests,
    Uncached: t.uncached_requests
  }))

  const bwData = ts.map(t => ({
    name: t.label || (t.hour != null ? t.hour + ':00' : ''),
    Bandwidth: t.bandwidth || 0
  }))

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Total Requests" value={formatNum(traffic.total_requests || 0)} accent="#F38020" />
        <StatCard
          label="Cached Requests"
          value={formatNum(traffic.cached_requests || 0)}
          sub={`${Math.round((traffic.cached_requests / (traffic.total_requests || 1)) * 100)}% of total`}
          accent="#068D45"
        />
        <StatCard
          label="Uncached Requests"
          value={formatNum(traffic.uncached_requests || 0)}
          accent="#0051C3"
        />
        <StatCard label="Unique Visitors" value={formatNum(traffic.unique_visitors || 0)} accent="#8B5CF6" />
      </div>

      {/* Requests chart */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Requests ({timeRangeLabel})</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F38020" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#F38020" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCached" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#068D45" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#068D45" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={formatNum} />
            <Tooltip formatter={(val) => formatNum(val)} />
            <Legend />
            <Area type="monotone" dataKey="Total" stroke="#F38020" strokeWidth={2} fill="url(#colorTotal)" />
            <Area type="monotone" dataKey="Cached" stroke="#068D45" strokeWidth={2} fill="url(#colorCached)" strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bandwidth chart */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Bandwidth ({timeRangeLabel})</h3>
        <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--cf-text-muted)', fontWeight: 500 }}>TOTAL</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{formatBytes(traffic.bandwidth?.total || 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--cf-text-muted)', fontWeight: 500 }}>CACHED</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cf-success)' }}>{formatBytes(traffic.bandwidth?.cached || 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--cf-text-muted)', fontWeight: 500 }}>UNCACHED</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--cf-blue)' }}>{formatBytes(traffic.bandwidth?.uncached || 0)}</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={bwData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => formatBytes(v)} />
            <Tooltip formatter={(val) => formatBytes(val)} />
            <Bar dataKey="Bandwidth" fill="#F38020" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* By Country */}
        <div className="card" style={{ padding: 20, flex: 1, minWidth: 280 }}>
          <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Top Traffic Countries</h3>
          {(traffic.requests_by_country || []).map((c, i) => (
            <div key={c.country} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 13, minWidth: 30, fontWeight: 600, color: 'var(--cf-text-primary)' }}>{c.country}</span>
              <div style={{ flex: 1, background: 'var(--cf-border-light)', borderRadius: 3, overflow: 'hidden', height: 8 }}>
                <div style={{ width: c.percent + '%', background: COLORS[i % COLORS.length], height: '100%', borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 13, minWidth: 50, textAlign: 'right', fontWeight: 500 }}>{formatNum(c.requests)}</span>
              <span style={{ fontSize: 12, color: 'var(--cf-text-muted)', minWidth: 35, textAlign: 'right' }}>{c.percent}%</span>
            </div>
          ))}
        </div>

        {/* Status Codes */}
        <div className="card" style={{ padding: 20, flex: 1, minWidth: 280 }}>
          <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Status Codes</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={(traffic.requests_by_status || []).map(s => ({ name: s.label, value: s.count }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                >
                  {(traffic.requests_by_status || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatNum(val)} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {(traffic.requests_by_status || []).map((s, i) => (
                <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{formatNum(s.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecurityTab({ analytics }) {
  const security = analytics?.security || {}

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <StatCard label="Threats Stopped" value={security.threats_stopped || 0} accent="#D63B23" />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: 20, flex: 1, minWidth: 280 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Threat Types</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={security.threats_by_type || []}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                >
                  {(security.threats_by_type || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {(security.threats_by_type || []).map((item, i) => (
                <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{item.type}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, flex: 1, minWidth: 280 }}>
          <h3 style={{ marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Threats by Country</h3>
          {(security.threats_by_country || []).map((c, i) => (
            <div key={c.country} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 13, minWidth: 30, fontWeight: 600 }}>{c.country}</span>
              <div style={{ flex: 1, background: 'var(--cf-border-light)', borderRadius: 3, overflow: 'hidden', height: 8 }}>
                <div style={{ width: Math.round((c.count / (security.threats_stopped || 1)) * 100) + '%', background: '#D63B23', height: '100%', borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PerformanceTab({ analytics }) {
  const perf = analytics?.performance || {}

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <StatCard label="Bandwidth Saved" value={perf.bandwidth_saved_percent + '%'} sub="Served from Xloudflare cache" accent="#068D45" />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Content Type Breakdown</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={perf.content_type_breakdown || []}
                dataKey="percent"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
              >
                {(perf.content_type_breakdown || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => val + '%'} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1 }}>
            {(perf.content_type_breakdown || []).map((item, i) => (
              <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ width: 12, height: 12, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 14 }}>{item.type}</span>
                <div style={{ width: 60, background: 'var(--cf-border-light)', borderRadius: 3, overflow: 'hidden', height: 6 }}>
                  <div style={{ width: item.percent + '%', background: COLORS[i % COLORS.length], height: '100%', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, minWidth: 35, textAlign: 'right' }}>{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function generateDailyTimeseries(baseTimeseries, days) {
  const daily = []
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayFactor = 0.7 + Math.random() * 0.6
    const totalRequests = baseTimeseries.reduce((s, t) => s + t.requests, 0)
    const totalCached = baseTimeseries.reduce((s, t) => s + t.cached_requests, 0)
    const totalBw = baseTimeseries.reduce((s, t) => s + (t.bandwidth || 0), 0)
    daily.push({
      timestamp: date.toISOString(),
      label,
      requests: Math.round(totalRequests * dayFactor),
      cached_requests: Math.round(totalCached * dayFactor),
      uncached_requests: Math.round((totalRequests - totalCached) * dayFactor),
      bandwidth: Math.round(totalBw * dayFactor)
    })
  }
  return daily
}

function getFilteredAnalytics(analytics, timeRange) {
  if (!analytics) return analytics
  const traffic = analytics.traffic || {}
  const baseTimeseries = traffic.timeseries || []

  if (timeRange === '24h') return analytics

  const days = timeRange === '7d' ? 7 : 30
  const multiplier = days / 1
  const dailySeries = generateDailyTimeseries(baseTimeseries, days)

  return {
    ...analytics,
    traffic: {
      ...traffic,
      total_requests: Math.round((traffic.total_requests || 0) * multiplier),
      cached_requests: Math.round((traffic.cached_requests || 0) * multiplier),
      uncached_requests: Math.round((traffic.uncached_requests || 0) * multiplier),
      unique_visitors: Math.round((traffic.unique_visitors || 0) * multiplier * 0.6),
      bandwidth: {
        total: Math.round(((traffic.bandwidth?.total) || 0) * multiplier),
        cached: Math.round(((traffic.bandwidth?.cached) || 0) * multiplier),
        uncached: Math.round(((traffic.bandwidth?.uncached) || 0) * multiplier)
      },
      requests_by_country: (traffic.requests_by_country || []).map(c => ({
        ...c,
        requests: Math.round(c.requests * multiplier)
      })),
      requests_by_status: (traffic.requests_by_status || []).map(s => ({
        ...s,
        count: Math.round(s.count * multiplier)
      })),
      timeseries: dailySeries
    },
    security: {
      ...analytics.security,
      threats_stopped: Math.round((analytics.security?.threats_stopped || 0) * multiplier)
    }
  }
}

export default function AnalyticsPage() {
  const { zoneId, tab = 'traffic' } = useParams()
  const navigate = useNavigate()
  const { state } = useApp()
  const analytics = state.analytics?.[zoneId]

  const [timeRange, setTimeRange] = useState('24h')

  const filteredAnalytics = getFilteredAnalytics(analytics, timeRange)
  const timeRangeLabel = timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'

  return (
    <div className="page-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h1 className="page-title">Analytics</h1>
        <select
          className="form-select"
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
          style={{ minWidth: 160 }}
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => navigate(`/${zoneId}/analytics/${t.id}`)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!analytics ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--cf-text-muted)' }}>
          No analytics data available for this zone.
        </div>
      ) : (
        <>
          {tab === 'traffic' && <TrafficTab analytics={filteredAnalytics} timeRangeLabel={timeRangeLabel} />}
          {tab === 'security' && <SecurityTab analytics={filteredAnalytics} />}
          {tab === 'performance' && <PerformanceTab analytics={filteredAnalytics} />}
          {tab !== 'traffic' && tab !== 'security' && tab !== 'performance' && <TrafficTab analytics={filteredAnalytics} timeRangeLabel={timeRangeLabel} />}
        </>
      )}
    </div>
  )
}
