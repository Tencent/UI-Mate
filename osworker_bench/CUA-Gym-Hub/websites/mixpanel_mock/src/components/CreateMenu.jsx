import React, { useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart2, BarChart, GitBranch, RotateCcw } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const ITEMS = [
  { key: 'insights', icon: <BarChart2 size={16} />, label: 'Insights', sub: 'Explore trends and compare metrics', color: '#4F44E0' },
  { key: 'funnels', icon: <BarChart size={16} />, label: 'Funnels', sub: 'Measure conversion and drop-off', color: '#EB5757' },
  { key: 'flows', icon: <GitBranch size={16} />, label: 'Flows', sub: 'Understand the user journey', color: '#27AE60' },
  { key: 'retention', icon: <RotateCcw size={16} />, label: 'Retention', sub: 'Track how often users return', color: '#F5A623' },
]

export default function CreateMenu({ onClose, navTo }) {
  const ref = useRef(null)
  const { addReport } = useApp()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  function handleClick(key) {
    onClose()
    const typeMap = { insights: 'insights', funnels: 'funnels', flows: 'flows', retention: 'retention' }
    const type = typeMap[key]
    if (type) {
      navTo(`/${type}`)
    }
  }

  return (
    <div ref={ref} style={{
      position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 200,
      background: '#fff', border: '1px solid #E4E4E8',
      borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      padding: 4, marginBottom: 4
    }}>
      {ITEMS.map(item => (
        <button key={item.key} onClick={() => handleClick(item.key)} style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '8px 10px', borderRadius: 4, border: 'none',
          background: 'none', cursor: 'pointer', textAlign: 'left',
          transition: 'background 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F7F7F8'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <span style={{ color: item.color, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1B2E' }}>{item.label}</div>
            <div style={{ fontSize: 12, color: '#8E8EA0' }}>{item.sub}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
