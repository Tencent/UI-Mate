import React, { useEffect, useState } from 'react'
import { getState, getInitialState, getStateDiff } from '../utils/dataManager.js'

export default function Go() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try fetching from server first (for session isolation)
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('sid')
    const url = sid ? `/go?sid=${encodeURIComponent(sid)}` : '/go'

    fetch(url)
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        // Fallback to localStorage
        const initial = getInitialState()
        const current = getState()
        const diff = getStateDiff()
        setData({ initial_state: initial, current_state: current, state_diff: diff })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ padding: 40, textAlign: 'center' }}>Loading state...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--color-navy)', color: 'white', padding: '12px 20px', borderRadius: 'var(--radius)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🔍</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>XDP Mock — State Inspector</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>GET /go — Shows initial_state, current_state, and state_diff</div>
        </div>
      </div>
      <pre style={{
        background: '#1E2936',
        color: '#E2E8F0',
        padding: 24,
        borderRadius: 'var(--radius)',
        fontSize: 12,
        lineHeight: 1.6,
        overflow: 'auto',
        maxHeight: 'calc(100vh - 120px)',
        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
