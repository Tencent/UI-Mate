import React, { useState } from 'react'
import { Wrench, Search, FileText, Globe, BarChart2 } from 'lucide-react'

const tools = [
  { icon: Search, label: 'Keyword Planner', desc: 'Find the right keywords for your campaigns.' },
  { icon: FileText, label: 'Ad Preview and Diagnosis', desc: 'See how your ads look on Google Search.' },
  { icon: Globe, label: 'Reach Planner', desc: 'Plan your video and display campaigns.' },
  { icon: BarChart2, label: 'Performance Planner', desc: 'Forecast the impact of campaign changes.' },
]

export default function Tools() {
  const [activeTool, setActiveTool] = useState(null)

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 20 }}>Tools</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {tools.map(({ icon: Icon, label, desc }) => {
          const isActive = activeTool === label
          return (
            <div key={label} style={{
              background: '#fff', border: `1px solid ${isActive ? '#1A73E8' : '#DADCE0'}`,
              borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
              cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s',
              boxShadow: isActive ? '0 2px 8px rgba(26,115,232,0.2)' : 'none'
            }}
              onClick={() => setActiveTool(isActive ? null : label)}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = isActive ? '0 2px 8px rgba(26,115,232,0.2)' : 'none' }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <Icon size={24} color={isActive ? '#1A73E8' : '#1A73E8'} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#202124', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#5F6368' }}>{desc}</div>
                </div>
              </div>
              {isActive && (
                <div style={{
                  background: '#E8F0FE', borderRadius: 6, padding: '8px 12px',
                  fontSize: 13, color: '#1A73E8', fontWeight: 400
                }}>
                  Feature preview — {label} is available in the live Xoogle Ads interface.
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
