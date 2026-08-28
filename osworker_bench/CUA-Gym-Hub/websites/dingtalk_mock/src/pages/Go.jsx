import { useApp } from '../context/AppContext'
import { getInitialState, getSessionId } from '../utils/dataManager'
import { computeDiff } from '../utils/stateTracker'

export default function Go() {
  const { state } = useApp()
  const sid = getSessionId()
  const initial = getInitialState(sid)

  const output = {
    initial_state: initial,
    current_state: state,
    state_diff: initial ? computeDiff(initial, state) : {}
  }

  return (
    <pre style={{
      margin: 0,
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '12px',
      background: '#1e1e1e',
      color: '#d4d4d4',
      minHeight: '100vh',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
