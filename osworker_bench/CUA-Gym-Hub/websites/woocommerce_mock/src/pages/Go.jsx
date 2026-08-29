import { useApp } from '../context/AppContext'
import { initialKey } from '../utils/dataManager'
import { computeDiff } from '../utils/stateTracker'
import { getSessionId } from '../utils/dataManager'

export default function Go() {
  const { state } = useApp()
  const sid = getSessionId()
  const iKey = initialKey(sid)

  let initial_state = null
  try {
    const stored = localStorage.getItem(iKey)
    if (stored) initial_state = JSON.parse(stored)
  } catch {}

  const current_state = state
  const state_diff = initial_state ? computeDiff(initial_state, current_state) : {}

  const output = { initial_state, current_state, state_diff }

  return (
    <pre style={{
      margin: 0,
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      background: '#fff',
      color: '#1e1e1e',
      minHeight: '100vh'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
