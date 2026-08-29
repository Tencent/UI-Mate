import React from 'react'
import { useAppState } from '../context/AppContext'
import { computeStateDiff } from '../utils/stateTracker'

function Go() {
  const { state, getInitial } = useAppState()
  const initialState = getInitial()
  const diff = computeStateDiff(initialState, state)

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: diff
  }

  return <pre style={{ margin: 0, padding: 0, fontFamily: 'monospace', fontSize: 12 }}>{JSON.stringify(output, null, 2)}</pre>
}

export default Go
