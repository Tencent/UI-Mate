import { useApp } from '../context/AppContext.jsx'
import { computeDiff } from '../utils/stateTracker.js'

export default function Go() {
  const { state, getInitial } = useApp()
  const initialState = getInitial()

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: initialState && state ? computeDiff(initialState, state) : {},
  }

  return (
    <pre style={{
      margin: 0,
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '12px',
      background: '#1e1e1e',
      color: '#d4d4d4',
      minHeight: '100vh',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
