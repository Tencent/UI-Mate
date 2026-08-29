import React from 'react'
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { formatRelativeTime, formatCount, formatDate } from '../utils/helpers.js'
import { withCurrentSearch } from '../utils/navigation.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

function MetricCard({ label, value, color, sparkData }) {
  return (
    <div style={{
      border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16, flex: 1, minWidth: 150
    }}>
      <div style={{ fontSize: 12, color: TEXT_SEC, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || TEXT_PRI }}>{value}</div>
      {sparkData && (
        <div style={{ height: 30, marginTop: 8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData.map((v, i) => ({ v, i }))}>
              <Line type="monotone" dataKey="v" stroke={color || ACCENT} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

const STATUS_COLORS = { critical: '#E03E2F', warning: '#F5B000', resolved: '#2BA185' }

export default function ProjectDetailPage() {
  const { projectSlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useApp()
  const { projects = [], issues = [], releases = [], alertRules = [], transactions = [] } = state

  const project = projects.find(p => p.slug === projectSlug)
  if (!project) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: TEXT_SEC }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>Project not found</div>
        <button onClick={() => navigate(withCurrentSearch('/projects/', location.search))} style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer' }}>Back to Projects</button>
      </div>
    )
  }

  const projIssues = issues.filter(i => i.project === project.id && i.status === 'unresolved').sort((a, b) => b.count - a.count).slice(0, 5)
  const projReleases = releases.filter(r => r.projects.includes(project.id)).sort((a, b) => new Date(b.dateReleased) - new Date(a.dateReleased)).slice(0, 5)
  const projAlerts = alertRules.filter(a => a.project === project.id).sort((a, b) => new Date(b.dateTriggered) - new Date(a.dateTriggered)).slice(0, 3)
  const projTransactions = transactions.filter(t => t.project === project.id)

  const errorData = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    errors: Math.floor(project.stats.totalErrors24h * (0.6 + Math.random() * 0.8))
  }))

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 20 }}>
        <Link to={withCurrentSearch('/projects/', location.search)} style={{ color: ACCENT }}>Projects</Link>
        <span style={{ color: TEXT_SEC }}>/</span>
        <span style={{ color: TEXT_PRI, fontWeight: 600 }}>{project.name}</span>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <MetricCard label="Crash Free Sessions" value={`${project.stats.crashFreeSessions}%`} color="#2BA185" sparkData={[97, 96.5, 97.2, 96.8, 97.1, 97.3, 97.2]} />
        <MetricCard label="Crash Free Users" value={`${project.stats.crashFreeUsers}%`} color="#2BA185" sparkData={[98, 97.8, 98.5, 98.2, 98.4, 98.6, 98.5]} />
        <MetricCard label="Releases (30d)" value={String(projReleases.length)} color={ACCENT} />
        <MetricCard label="Apdex" value={projTransactions.length > 0 ? (projTransactions.reduce((s, t) => s + t.apdex, 0) / projTransactions.length).toFixed(2) : 'N/A'} color={ACCENT} sparkData={[0.88, 0.89, 0.87, 0.9, 0.91, 0.89, 0.92]} />
      </div>

      {/* Error chart */}
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRI, marginBottom: 12 }}>Errors Over Time</div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={errorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: TEXT_SEC }} />
              <YAxis tick={{ fontSize: 10, fill: TEXT_SEC }} />
              <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${BORDER}` }} />
              <Bar dataKey="errors" fill={project.color} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Latest Alerts */}
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRI, marginBottom: 12 }}>Latest Alerts</div>
          {projAlerts.length === 0 ? (
            <div style={{ fontSize: 13, color: TEXT_SEC }}>No alerts</div>
          ) : projAlerts.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid #F4F2F7`, fontSize: 12 }}>
              <div>
                <div style={{ fontWeight: 500, color: TEXT_PRI }}>{a.name}</div>
                <div style={{ color: TEXT_SEC, marginTop: 2 }}>{formatRelativeTime(a.dateTriggered)}</div>
              </div>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 3, fontWeight: 600,
                backgroundColor: STATUS_COLORS[a.status] ? STATUS_COLORS[a.status] + '18' : '#F4F2F7',
                color: STATUS_COLORS[a.status] || TEXT_SEC
              }}>{a.status}</span>
            </div>
          ))}
        </div>

        {/* Latest Releases */}
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRI, marginBottom: 12 }}>Latest Releases</div>
          {projReleases.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid #F4F2F7`, fontSize: 12 }}>
              <div>
                <span style={{ fontFamily: '"Source Code Pro", monospace', color: ACCENT, fontWeight: 500 }}>{r.shortVersion}</span>
                <span style={{ color: TEXT_SEC, marginLeft: 8 }}>{formatDate(r.dateReleased)}</span>
              </div>
              <span style={{ color: '#2BA185', fontWeight: 500 }}>{r.crashFreeSessions}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Issues */}
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16, marginTop: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRI, marginBottom: 12 }}>Top Issues</div>
        {projIssues.map(issue => (
          <div key={issue.id}
            onClick={() => navigate(withCurrentSearch(`/issues/${issue.id}/`, location.search))}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid #F4F2F7`, cursor: 'pointer', fontSize: 13 }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ fontWeight: 600, color: TEXT_PRI }}>{issue.title}: </span>
              <span style={{ color: TEXT_SEC }}>{issue.subtitle}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_PRI, flexShrink: 0, marginLeft: 12 }}>
              {formatCount(issue.count)} events
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
