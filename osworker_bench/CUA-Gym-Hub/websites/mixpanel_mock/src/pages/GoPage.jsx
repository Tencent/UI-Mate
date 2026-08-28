import React from 'react'
import { useApp } from '../context/AppContext.jsx'
import { computeStateDiff } from '../utils/stateTracker.js'
import { initialKey } from '../utils/dataManager.js'

export default function GoPage() {
  const { state } = useApp()

  const sid = (() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('sid')
  })()

  const initKey = initialKey(sid)
  let initialState = null
  try {
    const stored = localStorage.getItem(initKey)
    if (stored) initialState = JSON.parse(stored)
  } catch (e) {}

  const initial = initialState || state
  const current = state
  const state_diff = computeStateDiff(initial, current)

  const output = {
    initial_state: initial,
    current_state: current,
    state_diff
  }

  return (
    <pre style={{
      margin: 0, padding: 16,
      fontFamily: 'monospace', fontSize: 12,
      background: '#fff', color: '#1A1A2E',
      minHeight: '100vh', overflowX: 'auto'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
