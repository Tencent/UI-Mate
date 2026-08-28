import { useAppContext } from '../context/AppContext'
import { loadInitialState } from '../utils/dataManager'
import { computeDiff } from '../utils/stateTracker'

const Go = () => {
  const { state, sid } = useAppContext()
  const initialState = loadInitialState(sid)

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: computeDiff(initialState, state)
  }

  return (
    <pre style={{
      fontFamily: 'ui-monospace, monospace',
      fontSize: '12px',
      lineHeight: '1.6',
      padding: '24px',
      margin: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      background: '#1e1e1e',
      color: '#d4d4d4',
      minHeight: '100vh',
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}

export default Go
