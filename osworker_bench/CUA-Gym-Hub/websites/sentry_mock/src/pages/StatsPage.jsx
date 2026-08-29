import React, { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useApp } from '../context/AppContext.jsx'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

const CHART_COLORS = ['#6C5FC7', '#E03E2F', '#33BF9E', '#F5B000', '#3B6ECC']

export default function StatsPage() {
  const { state } = useApp()
  const { projects = [], issues = [], transactions = [] } = state
  const [period, setPeriod] = useState('14d')

  // Events received over time
  const eventsOverTime = Array.from({ length: 14 }, (_, i) => ({
    day: `Apr ${i - 4 > 0 ? i - 4 : 31 + (i - 4)}`,
    events: Math.floor(2000 + Math.random() * 3000)
  }))

  // Events by project
  const eventsByProject = projects.map((p, i) => ({
    name: p.name,
    value: p.stats.totalErrors24h * 14,
    color: CHART_COLORS[i % CHART_COLORS.length]
  }))

  // Transaction count over time
  const transactionsOverTime = Array.from({ length: 14 }, (_, i) => ({
    day: `Apr ${i - 4 > 0 ? i - 4 : 31 + (i - 4)}`,
    count: Math.floor(40000 + Math.random() * 30000)
  }))

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Stats</h1>
        <div style={{ display: 'flex', gap: 4 }}>
          {['7d', '14d', '30d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              border: `1px solid ${BORDER}`, borderRadius: 4, padding: '4px 10px',
              backgroundColor: period === p ? ACCENT : '#fff', color: period === p ? '#fff' : TEXT_PRI,
              fontSize: 12, cursor: 'pointer'
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Events received */}
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRI, marginBottom: 16 }}>Events Received</div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={eventsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: TEXT_SEC }} />
              <YAxis tick={{ fontSize: 10, fill: TEXT_SEC }} />
              <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${BORDER}` }} />
              <Line type="monotone" dataKey="events" stroke={ACCENT} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Events by project (pie) */}
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRI, marginBottom: 16 }}>Events by Project</div>
          <div style={{ height: 220, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={eventsByProject} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: TEXT_SEC }}>
                  {eventsByProject.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${BORDER}` }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction count */}
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRI, marginBottom: 16 }}>Transactions Over Time</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: TEXT_SEC }} />
                <YAxis tick={{ fontSize: 10, fill: TEXT_SEC }} />
                <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${BORDER}` }} />
                <Bar dataKey="count" fill="#33BF9E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
