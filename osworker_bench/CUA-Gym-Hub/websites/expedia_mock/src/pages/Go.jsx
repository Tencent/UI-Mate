import { useApp } from '../context/AppContext'
import { computeDiff } from '../utils/stateTracker'

export default function Go() {
  const { state, initialStateSnapshot } = useApp()

  const initial_state = initialStateSnapshot || state
  const current_state = state
  const state_diff = computeDiff(initial_state, current_state)

  const output = {
    initial_state,
    current_state,
    state_diff
  }

  return (
    <pre style={{
      margin: 0,
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
