import React from 'react'
import { useApp } from '../context/AppContext'
import { computeStateDiff } from '../utils/stateTracker'
import { getInitialState } from '../utils/dataManager'

export default function Go() {
  const { state, sid } = useApp()
  const initial = getInitialState(sid)

  const output = {
    initial_state: initial || state,
    current_state: state,
    state_diff: initial ? computeStateDiff(initial, state) : {}
  }

  return (
    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 12, padding: 16, background: '#1e1e1e', color: '#d4d4d4', minHeight: '100vh', overflow: 'auto' }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
