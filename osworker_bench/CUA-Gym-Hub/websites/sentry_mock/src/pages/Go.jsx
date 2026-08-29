import React from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function Go() {
  const { state, initialState, getStateDiff } = useApp()

  // Check for sid in URL (for session-based access)
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')

  let output
  if (sid && window.__sentryMockState) {
    output = {
      initial_state: window.__sentryMockInitial || initialState,
      current_state: window.__sentryMockState || state,
      state_diff: getStateDiff()
    }
  } else {
    output = {
      initial_state: initialState,
      current_state: state,
      state_diff: getStateDiff()
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: '"Source Code Pro", monospace', fontSize: 12 }}>
      <pre style={{
        backgroundColor: '#FAF9FB',
        border: '1px solid #E2DBE8',
        borderRadius: 8,
        padding: 24,
        overflow: 'auto',
        maxHeight: '90vh',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        lineHeight: 1.5,
        color: '#2B2233'
      }}>
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  )
}
