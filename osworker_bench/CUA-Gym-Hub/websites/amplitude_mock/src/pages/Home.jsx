import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, MoreHorizontal, ChevronRight, X, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area
} from 'recharts'
import { useApp } from '../context/AppContext'
import './Home.css'

const METRIC_KEYS = ['visitors', 'pageViews', 'bounceRate', 'pageViewsPerSession']
const METRIC_LABELS = {
  visitors: 'Visitors',
  pageViews: 'Page Views',
  bounceRate: 'Bounce Rate',
  pageViewsPerSession: 'Pages / Session'
}
const METRIC_SUBTITLES = {
  visitors: 'Uniques',
  pageViews: 'Event Totals',
  bounceRate: 'Percentage',
  pageViewsPerSession: 'Average'
}

function DeltaBadge({ delta, deltaType }) {
  const isUp = deltaType === 'increase'
  const isGood = (isUp && delta > 0) || (!isUp && delta < 0)
  const color = isGood ? 'var(--success)' : 'var(--error)'
  const abs = Math.abs(delta)
  return (
    <span className="metric-delta" style={{ color }}>
      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {abs}%
    </span>
  )
}

export default function Home() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [activeMetric, setActiveMetric] = useState('visitors')

  const { homeMetrics } = state
  const chartData = homeMetrics.webEngagementSeries || []
  const revenueData = homeMetrics.revenueData || []

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`
  }

  const chartDataFormatted = chartData.map(p => ({ ...p, label: formatDate(p.date) }))
  const revenueFormatted = revenueData.map(p => ({ ...p, label: formatDate(p.date) }))

  return (
    <div className="home-page">
      <div className="home-topbar">
        <div className="home-project-dropdown">
          <button className="project-btn">
            default <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>
      </div>

      <div className="home-content">
        {/* Metric cards row */}
        <div className="home-metrics-row">
          {METRIC_KEYS.map(key => {
            const m = homeMetrics[key]
            const isActive = activeMetric === key
            return (
              <button
                key={key}
                className={`home-metric-card ${isActive ? 'home-metric-card-active' : ''}`}
                onClick={() => setActiveMetric(key)}
              >
                <div className="home-metric-label">{METRIC_LABELS[key]}</div>
                <div className="home-metric-sublabel">{METRIC_SUBTITLES[key]}</div>
                <div className="home-metric-value">
                  {key === 'bounceRate' ? `${m.value}%` : key === 'pageViewsPerSession' ? m.value.toFixed(1) : m.value.toLocaleString()}
                </div>
                <DeltaBadge delta={m.delta} deltaType={m.deltaType} />
              </button>
            )
          })}
        </div>

        {/* Main chart + live users */}
        <div className="home-top-row">
          <div className="card home-engagement-card">
            <div className="card-header">
              <div className="card-header-left">
                <span className="card-title">Web Engagement</span>
                <button className="icon-btn" style={{ width: 24, height: 24 }}><Info size={14} /></button>
              </div>
              <div className="card-header-right">
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/chart/chart_001')}>
                  Open Analysis <ArrowUpRight size={12} />
                </button>
                <button className="icon-btn" style={{ width: 24, height: 24 }}><MoreHorizontal size={14} /></button>
              </div>
            </div>
            <div className="home-chart-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartDataFormatted} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.6} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 13 }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card home-live-card">
            <div className="card-header">
              <div className="card-header-left">
                <span className="live-dot" />
                <span className="card-title">Live Users</span>
              </div>
            </div>
            <div className="home-live-number">{homeMetrics.currentLiveUsers}</div>
            <div className="home-live-subtitle">Current active users</div>
            <div className="home-live-stats">
              <div className="home-live-stat">
                <div className="home-live-stat-label">New Users Today</div>
                <div className="home-live-stat-value">{homeMetrics.newUsersToday}</div>
              </div>
              <div className="home-live-stat">
                <div className="home-live-stat-label">Avg Session</div>
                <div className="home-live-stat-value">{homeMetrics.avgSessionDuration}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="card home-templates-card">
          <div className="card-header">
            <div className="card-header-left">
              <span className="card-title">Templates</span>
            </div>
            <div className="card-header-right">
              <button className="btn-outline" style={{ fontSize: 12, height: 28, padding: '0 10px' }} onClick={() => navigate('/content')}>See All</button>
            </div>
          </div>
          <div className="templates-row">
            {state.templates.map((tpl, i) => (
              <div key={tpl.id} className="template-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/chart/new?type=segmentation')}>
                <div className="template-card-icon" style={{ background: ['#EDE9FE', '#ECFDF5', '#FEF3C7', '#EDE9FE', '#E0F2FE'][i] }}>
                  <TrendingUp size={20} style={{ color: ['#7C3AED', '#059669', '#D97706', '#7C3AED', '#0891B2'][i] }} />
                </div>
                <div className="template-card-text">
                  <div className="template-card-name">{tpl.name}</div>
                  <div className="template-card-sub">{tpl.type} &middot; {tpl.chartCount} Charts</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent charts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Charts</span>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/content')}>View All</button>
          </div>
          <div className="home-recent-grid">
            {state.charts.slice(0, 4).map(chart => (
              <div key={chart.id} className="home-recent-item" onClick={() => navigate(`/chart/${chart.id}`)}>
                <div className="home-recent-item-header">
                  <span className="home-recent-type-badge">{chart.type === 'funnel' ? 'F' : chart.type === 'retention' ? 'R' : 'S'}</span>
                  <span className="home-recent-name">{chart.name}</span>
                </div>
                <div className="home-recent-meta">
                  {chart.owner} &middot; {new Date(chart.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="home-bottom-row">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Top Pages</span>
            </div>
            <div className="card-subtitle">Last 30 Days</div>
            <table className="home-table">
              <thead>
                <tr><th>Page Title</th><th style={{ textAlign: 'right' }}>Volume</th></tr>
              </thead>
              <tbody>
                {homeMetrics.topPages.map((p, i) => (
                  <tr key={i}>
                    <td><a href="#" onClick={e => e.preventDefault()}>{p.title}</a></td>
                    <td style={{ textAlign: 'right' }}>{p.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Users by Country</span>
            </div>
            <div className="card-subtitle">Last 30 Days</div>
            <table className="home-table">
              <thead>
                <tr><th>Country</th><th style={{ textAlign: 'right' }}>Users</th></tr>
              </thead>
              <tbody>
                {homeMetrics.usersByCountry.map((c, i) => (
                  <tr key={i}>
                    <td>{c.flag} {c.country}</td>
                    <td style={{ textAlign: 'right' }}>{c.users.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Revenue Trend</span>
            </div>
            <div className="card-subtitle">Last 30 Days</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={revenueFormatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
