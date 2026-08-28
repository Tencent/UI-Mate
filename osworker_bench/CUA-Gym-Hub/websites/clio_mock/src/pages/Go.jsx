import { useApp } from '../context/AppContext'
import { getInitialState } from '../utils/dataManager'
import { getStateDiff } from '../utils/stateTracker'
import { getSessionId } from '../utils/dataManager'

export default function Go() {
  const { state } = useApp()
  const sid = getSessionId()
  const initial = getInitialState(sid) || state
  const diff = getStateDiff(initial, state)

  const output = {
    initial_state: initial,
    current_state: state,
    state_diff: diff
  }

  return (
    <pre style={{
      fontFamily: 'monospace',
      fontSize: 12,
      background: '#FFFFFF',
      padding: 24,
      margin: 0,
      minHeight: '100vh',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      color: '#1A1A2E'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
