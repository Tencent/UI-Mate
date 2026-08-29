import { useApp } from '../context/AppContext'

function calculateDiff(initial, current) {
  if (initial === current) return undefined
  if (typeof initial !== 'object' || typeof current !== 'object' || initial === null || current === null) {
    return { __old: initial, __new: current }
  }
  if (Array.isArray(initial) && Array.isArray(current)) {
    if (initial.length !== current.length) return { __old: initial, __new: current }
    let hasDiff = false
    const diffs = initial.map((item, i) => {
      const d = calculateDiff(item, current[i])
      if (d !== undefined) hasDiff = true
      return d
    })
    return hasDiff ? { __old: initial, __new: current } : undefined
  }
  const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)])
  const diff = {}
  let hasDiff = false
  for (const key of allKeys) {
    const d = calculateDiff(initial[key], current[key])
    if (d !== undefined) { diff[key] = d; hasDiff = true }
  }
  return hasDiff ? diff : undefined
}

export default function Go() {
  const { state, initialState } = useApp()

  const stateDiff = calculateDiff(initialState, state) || {}

  const data = {
    initial_state: initialState,
    current_state: state,
    state_diff: stateDiff
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
      overflowX: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
