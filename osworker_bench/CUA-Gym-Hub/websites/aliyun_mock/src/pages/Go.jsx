import React from 'react'
import { useApp } from '../context/AppContext'
import { initialKey, storageKey, getSessionId } from '../utils/dataManager'
import { computeDiff } from '../utils/stateTracker'

export default function Go() {
  const { state } = useApp()
  const sid = getSessionId()
  const iKey = initialKey(sid)

  let initialState = null
  try {
    const stored = localStorage.getItem(iKey)
    if (stored) initialState = JSON.parse(stored)
  } catch (e) {}

  const currentState = state
  const initial = initialState || currentState
  const stateDiff = computeDiff(initial, currentState)

  const output = { initial_state: initial, current_state: currentState, state_diff: stateDiff }

  return (
    <pre style={{
      margin: 0,
      padding: 0,
      fontFamily: 'monospace',
      fontSize: 12,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
