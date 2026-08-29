import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { computeStateDiff } from '../utils/stateTracker'
import { getSessionId, initialKey } from '../utils/dataManager'

export default function Go() {
  const { state } = useApp()
  const [output, setOutput] = useState(null)

  useEffect(() => {
    const sid = getSessionId()
    const iKey = initialKey(sid)
    const initialRaw = localStorage.getItem(iKey)
    const initialState = initialRaw ? JSON.parse(initialRaw) : state

    const diff = computeStateDiff(initialState, state)

    setOutput({
      initial_state: initialState,
      current_state: state,
      state_diff: diff
    })
  }, [state])

  if (!output) return null

  return (
    <pre style={{
      margin: 0,
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '12px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      background: '#fff',
      color: '#333'
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
