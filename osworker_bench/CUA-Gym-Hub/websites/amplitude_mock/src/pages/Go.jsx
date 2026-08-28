import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { initialKey, storageKey } from '../utils/dataManager'
import { computeDiff } from '../utils/stateTracker'

export default function Go() {
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid') || null
  const [output, setOutput] = useState(null)

  useEffect(() => {
    try {
      const iKey = initialKey(sid)
      const sKey = storageKey(sid)
      const initialRaw = localStorage.getItem(iKey)
      const currentRaw = localStorage.getItem(sKey)
      const initial_state = initialRaw ? JSON.parse(initialRaw) : null
      const current_state = currentRaw ? JSON.parse(currentRaw) : null
      const state_diff = computeDiff(initial_state || {}, current_state || {})
      setOutput({ initial_state, current_state, state_diff })
    } catch (e) {
      setOutput({ error: e.message })
    }
  }, [sid])

  if (!output) return null

  return (
    <pre style={{
      margin: 0,
      padding: 0,
      fontFamily: 'monospace',
      fontSize: 12,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      lineHeight: 1.5
    }}>
      {JSON.stringify(output, null, 2)}
    </pre>
  )
}
