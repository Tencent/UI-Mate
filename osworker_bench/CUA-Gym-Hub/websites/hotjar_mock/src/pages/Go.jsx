import { useAppContext } from '../context/AppContext.jsx'
import { getInitialState, getSessionId } from '../utils/dataManager.js'

function deepDiff(initial, current, prefix = '') {
  const diff = {}
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})])

  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key
    const a = initial?.[key]
    const b = current?.[key]

    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diff[path] = { old: a, new: b }
    }
  }
  return diff
}

export default function Go() {
  const { state } = useAppContext()
  const sid = getSessionId()
  const initialState = getInitialState(sid)

  const stateDiff = deepDiff(initialState, state)

  const output = {
    initial_state: initialState,
    current_state: state,
    state_diff: stateDiff
  }

  return (
    <pre style={{
      margin: 0,
      padding: 0,
      fontFamily: 'monospace',
      fontSize: 13,
      color: '#2D3038',
      background: '#FFFFFF',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
