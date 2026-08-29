import React, { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { computeStateDiff } from '../utils/stateTracker'
import { initialKey, getSessionId } from '../utils/dataManager'

export default function GoPage() {
  const { state } = useApp()
  const [output, setOutput] = useState(null)

  useEffect(() => {
    const sid = getSessionId()
    const key = initialKey(sid)
    const initialRaw = localStorage.getItem(key)
    let initialState = null
    try { initialState = initialRaw ? JSON.parse(initialRaw) : state } catch (e) { initialState = state }

    const stateDiff = computeStateDiff(initialState, state)

    setOutput({
      initial_state: initialState,
      current_state: state,
      state_diff: stateDiff
    })
  }, [state])

  if (!output) return null

  return React.createElement('pre', {
    style: { margin: 0, padding: 0, fontFamily: 'monospace', fontSize: '12px' }
  }, JSON.stringify(output, null, 2))
}
