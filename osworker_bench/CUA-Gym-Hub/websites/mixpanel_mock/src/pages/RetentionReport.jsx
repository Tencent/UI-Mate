import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ChevronDown, X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { executeRetentionQuery } from '../utils/queryEngine.js'

const EVENT_NAMES = [
  'Any Event', 'Page View', 'Button Click', 'Sign Up', 'Login',
  'Search', 'Add to Cart', 'Purchase', 'Form Submit'
]

export default function RetentionReport({ report, onUpdateReport }) {
  const { state } = useApp()
  const events = state?.events || []
  const [activeTab, setActiveTab] = useState('Query')
  const [showLineChart, setShowLineChart] = useState(true)
  const [firstEventPicker, setFirstEventPicker] = useState(false)
  const [returnEventPicker, setReturnEventPicker] = useState(false)

  const retentionResult = useMemo(() => {
    return executeRetentionQuery(events, report)
  }, [events, report.retentionConfig, report.dateRange, report.granularity])

  const cohorts = retentionResult.cohorts || []
  const periodLabel = retentionResult.periodLabel || 'Week'

  const firstEvent = report.retentionConfig?.firstEvent || 'Page View'
  const returnEvent = report.retentionConfig?.returnEvent || 'Any Event'

  function getColor(pct) {
    const opacity = pct / 100
    return `rgba(79, 68, 224, ${0.08 + opacity * 0.92})`
  }

  const maxPeriods = Math.max(...cohorts.map(c => c.retention.length), 0)
  const periodHeaders = Array.from({ length: maxPeriods }, (_, i) => `${periodLabel} ${i}`)

  // Prepare line chart data
  const lineChartData = periodHeaders.map((label, pi) => {
    const point = { label }
    cohorts.forEach((c, ci) => {
      point[`c${ci}`] = c.retention[pi] !== undefined ? c.retention[pi] : null
    })
    return point
  })

  const COHORT_COLORS = ['#4F44E0', '#EB5757', '#27AE60', '#F5A623', '#00BCD4', '#9C27B0']

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Event pickers */}
      {firstEventPicker && (
        <EventPickerModal
          title="First Event"
          selected={firstEvent}
          onSelect={name => { onUpdateReport({ retentionConfig: { ...report.retentionConfig, firstEvent: name } }); setFirstEventPicker(false) }}
          onClose={() => setFirstEventPicker(false)}
        />
      )}
      {returnEventPicker && (
        <EventPickerModal
          title="Return Event"
          selected={returnEvent}
          onSelect={name => { onUpdateReport({ retentionConfig: { ...report.retentionConfig, returnEvent: name } }); setReturnEventPicker(false) }}
          onClose={() => setReturnEventPicker(false)}
        />
      )}

      {/* Main area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {/* View toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <button onClick={() => setShowLineChart(false)} style={{
            padding: '6px 14px', borderRadius: 4,
            border: '1px solid ' + (!showLineChart ? '#4F44E0' : '#E4E4E8'),
            background: !showLineChart ? '#F0EFFC' : '#fff',
            color: !showLineChart ? '#4F44E0' : '#8E8EA0',
            fontSize: 13, fontWeight: 500, cursor: 'pointer'
          }}>Heatmap</button>
          <button onClick={() => setShowLineChart(true)} style={{
            padding: '6px 14px', borderRadius: 4,
            border: '1px solid ' + (showLineChart ? '#4F44E0' : '#E4E4E8'),
            background: showLineChart ? '#F0EFFC' : '#fff',
            color: showLineChart ? '#4F44E0' : '#8E8EA0',
            fontSize: 13, fontWeight: 500, cursor: 'pointer'
          }}>Line Chart</button>
        </div>

        {/* Line chart overlay */}
        {showLineChart && cohorts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineChartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F4" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => v !== null ? `${v}%` : '--'} />
                {cohorts.map((c, ci) => (
                  <Line key={ci} type="monotone" dataKey={`c${ci}`} stroke={COHORT_COLORS[ci % COHORT_COLORS.length]} name={c.period} dot={{ r: 3 }} strokeWidth={2} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              {cohorts.map((c, ci) => (
                <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#585870' }}>
                  <div style={{ width: 10, height: 3, borderRadius: 2, background: COHORT_COLORS[ci % COHORT_COLORS.length] }} />
                  {c.period} ({c.users} users)
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retention heatmap grid */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 600, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8E8EA0', borderBottom: '1px solid #E4E4E8', minWidth: 130 }}>Cohort</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#8E8EA0', borderBottom: '1px solid #E4E4E8', minWidth: 70 }}>Users</th>
                {periodHeaders.map(w => (
                  <th key={w} style={{ padding: '8px 10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#8E8EA0', borderBottom: '1px solid #E4E4E8', minWidth: 65 }}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort, ci) => (
                <tr key={ci}>
                  <td style={{ padding: '8px 16px', fontSize: 13, borderBottom: '1px solid #E4E4E8', fontWeight: 500 }}>{cohort.period}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, textAlign: 'right', borderBottom: '1px solid #E4E4E8', color: '#585870' }}>{cohort.users}</td>
                  {Array.from({ length: maxPeriods }, (_, wi) => {
                    const pct = cohort.retention[wi]
                    if (pct === undefined) {
                      return <td key={wi} style={{ padding: '8px 10px', borderBottom: '1px solid #E4E4E8', background: '#F7F7F8' }} />
                    }
                    return (
                      <td key={wi} style={{
                        padding: '8px 10px', textAlign: 'center', fontSize: 13, fontWeight: 500,
                        borderBottom: '1px solid #E4E4E8',
                        background: getColor(pct),
                        color: pct > 50 ? '#fff' : '#1B1B2E',
                        cursor: 'default'
                      }}>
                        {pct}%
                      </td>
                    )
                  })}
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
          {['Query', 'Settings'].map(tab => (
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
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1B1B2E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>First Event</div>
              <button onClick={() => setFirstEventPicker(true)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: '#F7F7F8', borderRadius: 8,
                border: '1px solid #E4E4E8', cursor: 'pointer', marginBottom: 16
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F44E0' }} />
                <span style={{ flex: 1, fontSize: 13, color: '#1B1B2E', textAlign: 'left' }}>{firstEvent}</span>
                <ChevronDown size={12} color="#8E8EA0" />
              </button>

              <div style={{ fontSize: 12, fontWeight: 600, color: '#1B1B2E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Return Event</div>
              <button onClick={() => setReturnEventPicker(true)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: '#F7F7F8', borderRadius: 8,
                border: '1px solid #E4E4E8', cursor: 'pointer', marginBottom: 16
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27AE60' }} />
                <span style={{ flex: 1, fontSize: 13, color: '#1B1B2E', textAlign: 'left' }}>{returnEvent}</span>
                <ChevronDown size={12} color="#8E8EA0" />
              </button>

              <div style={{ fontSize: 12, fontWeight: 600, color: '#1B1B2E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Frequency</div>
              <div style={{ fontSize: 13, color: '#585870', background: '#F7F7F8', borderRadius: 8, padding: '8px 12px' }}>
                {report.granularity === 'Week' ? 'Weekly' : 'Daily'} retention
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function EventPickerModal({ title, selected, onSelect, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 16, width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0' }}><X size={14} /></button>
        </div>
        {EVENT_NAMES.map(name => (
          <button key={name} onClick={() => onSelect(name)} style={{
            width: '100%', padding: '7px 10px', border: 'none', borderRadius: 4,
            background: selected === name ? '#F0EFFC' : 'none',
            color: selected === name ? '#4F44E0' : '#1B1B2E',
            cursor: 'pointer', textAlign: 'left', fontSize: 13
          }}
          onMouseEnter={e => { if (selected !== name) e.currentTarget.style.background = '#F7F7F8' }}
          onMouseLeave={e => { if (selected !== name) e.currentTarget.style.background = 'none' }}>
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
