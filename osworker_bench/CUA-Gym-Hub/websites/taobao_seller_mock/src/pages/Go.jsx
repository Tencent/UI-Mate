import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { createInitialData, getStateDiff } from '../utils/dataManager'

export default function Go() {
  const { state } = useAppContext()
  const [serverData, setServerData] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('sid')
    if (sid) {
      fetch(`/go?sid=${sid}`)
        .then(r => r.json())
        .then(data => { setServerData(data); setLoaded(true) })
        .catch(() => setLoaded(true))
    } else {
      setLoaded(true)
    }
  }, [])

  if (!loaded) return null

  let output
  if (serverData) {
    output = serverData
  } else {
    let initial
    try {
      const saved = localStorage.getItem('taobao_seller_initial')
      initial = saved ? JSON.parse(saved) : createInitialData()
    } catch (e) {
      initial = createInitialData()
    }
    const diff = getStateDiff(initial, state)
    output = { initial_state: initial, current_state: state, state_diff: diff }
  }

  return (
    <div style={{ margin: 0, padding: 0, background: '#1e1e1e', minHeight: '100vh' }}>
      <pre style={{
        margin: 0, padding: 20, background: '#1e1e1e', color: '#d4d4d4',
        fontSize: 13, lineHeight: 1.5, fontFamily: 'monospace',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere'
      }}>
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  )
}
