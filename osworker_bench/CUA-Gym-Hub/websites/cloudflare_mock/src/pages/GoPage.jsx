import React from 'react'
import { useApp } from '../context/AppContext'
import { getInitialState, getStateDiff } from '../utils/dataManager'

export default function GoPage() {
  const { state } = useApp()
  const initial = getInitialState()
  const diff = getStateDiff(initial, state)

  const output = {
    initial_state: initial,
    current_state: state,
    state_diff: diff
  }

  return (
    <div style={{ padding: 20, background: '#1A1A1A', minHeight: '100vh' }}>
      <pre style={{
        color: '#E2E8F0',
        fontSize: 13,
        fontFamily: '"SF Mono", "Fira Code", Consolas, monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.6
      }}>
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  )
}
