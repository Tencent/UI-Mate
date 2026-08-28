import React, { useState, useMemo } from 'react'
import { Plus, X, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { executeFunnelQuery } from '../utils/queryEngine.js'

const STEP_COLORS = ['#4F44E0', '#EB5757', '#27AE60', '#F5A623', '#00BCD4', '#9C27B0', '#FF7043', '#607D8B']

const EVENT_NAMES = [
  'Page View', 'Button Click', 'Sign Up', 'Login', 'Search',
  'Add to Cart', 'Purchase', 'Remove from Cart', 'Form Submit',
  'Video Play', 'File Download', 'Share', 'Comment', 'Like',
  'Profile Update', 'Invite Sent', 'Notification Click'
]

export default function FunnelsReport({ report, onUpdateReport }) {
  const { state } = useApp()
  const events = state?.events || []
  const [activeTab, setActiveTab] = useState('Query')
  const [eventPickerFor, setEventPickerFor] = useState(null) // step index

  const funnelResult = useMemo(() => {
    return executeFunnelQuery(events, report)
  }, [events, report.steps, report.dateRange, report.filters])

  const steps = funnelResult.steps || []
  const medianTime = funnelResult.medianTime

  function addStep() {
    const currentSteps = report.steps || []
    const idx = currentSteps.length
    const label = String.fromCharCode(65 + idx)
    onUpdateReport({
      steps: [...currentSteps, { id: 'step_' + Date.now(), label, eventName: 'Button Click' }]
    })
  }

  function removeStep(stepId) {
    onUpdateReport({ steps: (report.steps || []).filter(s => s.id !== stepId) })
  }

  function updateStepEvent(stepIdx, newEvent) {
    const updated = [...(report.steps || [])]
    updated[stepIdx] = { ...updated[stepIdx], eventName: newEvent }
    onUpdateReport({ steps: updated })
    setEventPickerFor(null)
  }

  function formatDuration(ms) {
    if (!ms) return '--'
    const hours = Math.floor(ms / 3600000)
    const mins = Math.floor((ms % 3600000) / 60000)
    if (hours > 24) return `${Math.round(hours / 24)}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  // Overall conversion
  const overallConversion = steps.length > 1 && steps[0].converted > 0
    ? Math.round(steps[steps.length - 1].converted / steps[0].converted * 10000) / 100
    : 0

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Event picker */}
      {eventPickerFor !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEventPickerFor(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 16, width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Select Event</div>
            {EVENT_NAMES.map(name => (
              <button key={name} onClick={() => updateStepEvent(eventPickerFor, name)} style={{
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
        {/* Summary bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <div style={{ background: '#F7F7F8', borderRadius: 8, padding: '12px 20px' }}>
            <div style={{ fontSize: 11, color: '#8E8EA0', marginBottom: 4 }}>Overall Conversion</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#4F44E0' }}>{overallConversion}%</div>
          </div>
          <div style={{ background: '#F7F7F8', borderRadius: 8, padding: '12px 20px' }}>
            <div style={{ fontSize: 11, color: '#8E8EA0', marginBottom: 4 }}>Median Time to Convert</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1B1B2E' }}>{formatDuration(medianTime)}</div>
          </div>
          <div style={{ background: '#F7F7F8', borderRadius: 8, padding: '12px 20px' }}>
            <div style={{ fontSize: 11, color: '#8E8EA0', marginBottom: 4 }}>Total Entered</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1B1B2E' }}>{steps[0]?.converted?.toLocaleString() || 0}</div>
          </div>
        </div>

        {/* Funnel bars */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, overflowX: 'auto', paddingBottom: 20 }}>
          {steps.map((step, i) => {
            const maxHeight = 320
            const pct = i === 0 ? 100 : step.overallPct
            const barH = Math.max(24, (pct / 100) * maxHeight)

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 100, flex: 1, maxWidth: 160 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#8E8EA0', marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: '#1B1B2E', marginBottom: 4, textAlign: 'center', fontWeight: 500, maxWidth: 120 }} className="truncate" title={step.name}>
                  {step.name}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: STEP_COLORS[i % STEP_COLORS.length], marginBottom: 8 }}>
                  {step.converted}
                </div>

                <div style={{ width: '75%', height: maxHeight, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{
                    height: barH,
                    background: STEP_COLORS[i % STEP_COLORS.length],
                    borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'height 0.3s ease'
                  }}>
                    <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{Math.round(pct)}%</span>
                  </div>
                </div>

                {/* Drop-off */}
                {i > 0 && step.dropOff > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#EB5757', textAlign: 'center' }}>
                    {step.dropOffPct}% drop-off ({step.dropOff})
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Step details table */}
        {steps.length > 0 && (
          <div style={{ border: '1px solid #E4E4E8', borderRadius: 8, overflow: 'hidden', marginTop: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F7F7F8' }}>
                  <th style={thStyle}>Step</th>
                  <th style={thStyle}>Event</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Entered</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Completed</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Conversion</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Drop-off</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #E4E4E8' }}>
                    <td style={tdStyle}><span style={{ width: 20, height: 20, borderRadius: 4, background: STEP_COLORS[i % STEP_COLORS.length], display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>{step.label}</span></td>
                    <td style={tdStyle}>{step.name}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>{step.total}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>{step.converted}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#27AE60', fontWeight: 500 }}>{i === 0 ? '100%' : `${step.overallPct}%`}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#EB5757' }}>{step.dropOff > 0 ? `${step.dropOffPct}%` : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1B1B2E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Steps</div>
              {(report.steps || []).map((step, i) => (
                <div key={step.id} style={{ marginBottom: 8, background: '#F7F7F8', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: STEP_COLORS[i % STEP_COLORS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0
                    }}>{step.label}</div>
                    <button onClick={() => setEventPickerFor(i)} style={{
                      flex: 1, fontSize: 13, color: '#1B1B2E', background: '#fff',
                      border: '1px solid #E4E4E8', borderRadius: 4, padding: '4px 8px',
                      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <span style={{ flex: 1 }}>{step.eventName}</span>
                      <ChevronDown size={10} color="#8E8EA0" />
                    </button>
                    <button onClick={() => removeStep(step.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8EA0', padding: 2 }}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={addStep} style={{ color: '#4F44E0', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: '4px 0', fontWeight: 500 }}>
                + Add Step
              </button>

              <div style={{ fontSize: 12, fontWeight: 600, color: '#1B1B2E', marginBottom: 8, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Conversion Criteria</div>
              <div style={{ background: '#F7F7F8', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#8E8EA0' }}>Window:</span>
                  <span style={{ color: '#1B1B2E' }}>{report.conversionCriteria?.timeWindow || '7 days'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#8E8EA0' }}>Counting:</span>
                  <span style={{ color: '#1B1B2E' }}>{report.conversionCriteria?.counting || 'Uniques'}</span>
                </div>
              </div>
            </>
          )}
          {activeTab === 'Settings' && (
            <div style={{ fontSize: 13, color: '#8E8EA0' }}>Funnel display settings</div>
          )}
        </div>
      </div>
    </div>
  )
}

const thStyle = { padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#8E8EA0', borderBottom: '1px solid #E4E4E8' }
const tdStyle = { padding: '10px 16px', fontSize: 13, color: '#1B1B2E' }
