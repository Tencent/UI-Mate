import React, { useState, useMemo } from 'react'
import { Plus, ChevronDown, X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { executeFlowQuery } from '../utils/queryEngine.js'

const COLUMN_COLORS = ['#4F44E0', '#EB5757', '#27AE60', '#F5A623', '#00BCD4', '#9C27B0']

const EVENT_NAMES = [
  'Page View', 'Button Click', 'Sign Up', 'Login', 'Search',
  'Add to Cart', 'Purchase', 'Form Submit', 'Video Play'
]

export default function FlowsReport({ report, onUpdateReport }) {
  const { state } = useApp()
  const events = state?.events || []
  const [activeTab, setActiveTab] = useState('Query')
  const [eventPickerOpen, setEventPickerOpen] = useState(false)

  const flowResult = useMemo(() => {
    return executeFlowQuery(events, report)
  }, [events, report.flowConfig, report.dateRange])

  const { columns, links, totalPaths } = flowResult

  const startEvent = report.flowConfig?.startEvent || 'Page View'
  const depth = report.flowConfig?.depth || 4

  function updateStartEvent(name) {
    onUpdateReport({ flowConfig: { ...report.flowConfig, startEvent: name } })
    setEventPickerOpen(false)
  }

  // Compute max count for sizing
  const maxCount = Math.max(...(columns.flat().map(n => n.count) || [1]), 1)

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Event picker */}
      {eventPickerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEventPickerOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 16, width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Select Starting Event</div>
            {EVENT_NAMES.map(name => (
              <button key={name} onClick={() => updateStartEvent(name)} style={{
                width: '100%', padding: '7px 10px', border: 'none', borderRadius: 4,
                background: startEvent === name ? '#F0EFFC' : 'none',
                color: startEvent === name ? '#4F44E0' : '#1B1B2E',
                cursor: 'pointer', textAlign: 'left', fontSize: 13
              }}
              onMouseEnter={e => { if (startEvent !== name) e.currentTarget.style.background = '#F7F7F8' }}
              onMouseLeave={e => { if (startEvent !== name) e.currentTarget.style.background = 'none' }}>
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#F7F7F8', borderRadius: 8, padding: '10px 16px' }}>
            <div style={{ fontSize: 11, color: '#8E8EA0' }}>Total Paths</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1B1B2E' }}>{totalPaths}</div>
          </div>
          <div style={{ background: '#F7F7F8', borderRadius: 8, padding: '10px 16px' }}>
            <div style={{ fontSize: 11, color: '#8E8EA0' }}>Starting Event</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#4F44E0' }}>{startEvent}</div>
          </div>
          <div style={{ background: '#F7F7F8', borderRadius: 8, padding: '10px 16px' }}>
            <div style={{ fontSize: 11, color: '#8E8EA0' }}>Depth</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1B1B2E' }}>{depth} steps</div>
          </div>
        </div>

        {/* Sankey-style flow visualization */}
        <div style={{ position: 'relative', minHeight: 500 }}>
          {/* Column headers */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
            {columns.map((col, ci) => (
              <div key={ci} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#8E8EA0', marginBottom: 8 }}>
                  Step {ci + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Flow columns with nodes */}
          <div style={{ display: 'flex', gap: 0 }}>
            {columns.map((col, ci) => (
              <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px' }}>
                {col.map((node, ni) => {
                  const barH = Math.max(28, (node.count / maxCount) * 180)
                  const color = COLUMN_COLORS[ci % COLUMN_COLORS.length]
                  return (
                    <div key={node.id} style={{
                      background: color,
                      borderRadius: 6,
                      padding: '8px 12px',
                      minHeight: barH,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      transition: 'opacity 0.15s',
                      cursor: 'default'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }} className="truncate">
                        {node.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                        {node.count} ({node.pct}%)
                      </div>
                    </div>
                  )
                })}
                {/* Drop-off indicator */}
                {ci > 0 && col.length > 0 && (
                  <div style={{
                    borderRadius: 6, padding: '6px 12px',
                    background: '#F7F7F8', border: '1px dashed #E4E4E8',
                    fontSize: 11, color: '#8E8EA0', textAlign: 'center'
                  }}>
                    Drop-off: {totalPaths - col.reduce((s, n) => s + n.count, 0)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Connection lines (simplified) */}
          {links.length > 0 && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', opacity: 0.1 }}>
              {/* SVG lines would go here for a real Sankey - using opacity hint */}
            </div>
          )}
        </div>

        {/* Top paths table */}
        {columns.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1B1B2E', marginBottom: 12 }}>Top Paths</h3>
            <div style={{ border: '1px solid #E4E4E8', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F7F7F8' }}>
                    {columns.map((_, ci) => (
                      <th key={ci} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8E8EA0', borderBottom: '1px solid #E4E4E8' }}>
                        Step {ci + 1}
                      </th>
                    ))}
                    <th style={{ padding: '8px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#8E8EA0', borderBottom: '1px solid #E4E4E8' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {columns[0]?.slice(0, 5).map((node, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #E4E4E8' }}>
                      {columns.map((col, ci) => (
                        <td key={ci} style={{ padding: '8px 16px', fontSize: 13, color: '#1B1B2E' }}>
                          {col[i]?.name || '--'}
                        </td>
                      ))}
                      <td style={{ padding: '8px 16px', fontSize: 13, textAlign: 'right', fontWeight: 500, color: '#4F44E0' }}>
                        {columns[0][i]?.count || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1B1B2E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Starting Event</div>
              <button onClick={() => setEventPickerOpen(true)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', background: '#F7F7F8', borderRadius: 8,
                border: '1px solid #E4E4E8', cursor: 'pointer', marginBottom: 16
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F44E0' }} />
                <span style={{ flex: 1, fontSize: 13, color: '#1B1B2E', textAlign: 'left' }}>{startEvent}</span>
                <ChevronDown size={12} color="#8E8EA0" />
              </button>

              <div style={{ fontSize: 12, fontWeight: 600, color: '#1B1B2E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Depth</div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[3, 4, 5, 6].map(d => (
                  <button key={d} onClick={() => onUpdateReport({ flowConfig: { ...report.flowConfig, depth: d } })} style={{
                    padding: '4px 12px', borderRadius: 4,
                    border: '1px solid ' + (depth === d ? '#4F44E0' : '#E4E4E8'),
                    background: depth === d ? '#F0EFFC' : '#fff',
                    color: depth === d ? '#4F44E0' : '#8E8EA0',
                    fontSize: 12, cursor: 'pointer'
                  }}>{d}</button>
                ))}
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: '#1B1B2E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Flow Steps</div>
              {columns.map((col, ci) => (
                <div key={ci} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#8E8EA0', marginBottom: 4 }}>Step {ci + 1}</div>
                  {col.map(node => (
                    <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: '#F7F7F8', borderRadius: 4, marginBottom: 2, fontSize: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLUMN_COLORS[ci % COLUMN_COLORS.length] }} />
                      <span style={{ flex: 1, color: '#1B1B2E' }}>{node.name}</span>
                      <span style={{ color: '#8E8EA0' }}>{node.pct}%</span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
