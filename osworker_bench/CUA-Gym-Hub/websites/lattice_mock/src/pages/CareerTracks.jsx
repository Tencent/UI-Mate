import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

export default function CareerTracks() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState({})

  if (!state) return null
  const { careerTracks } = state

  return (
    <div style={{ padding: 32 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/grow')} style={{ marginBottom: 20 }}>← Back to Grow</button>
      <div className="page-header">
        <h1 className="page-title">Career Tracks</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {careerTracks.map(track => (
          <div key={track.id} className="card">
            <div
              style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => setExpanded(prev => ({ ...prev, [track.id]: !prev[track.id] }))}
              onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>{track.title}</h2>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                  {track.levels.length} levels • {track.levels[0]?.competencies?.length || 0} competencies per level
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded[track.id] ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            {expanded[track.id] && (
              <div style={{ borderTop: '1px solid #E5E7EB' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        <th style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: '#6B7280', textAlign: 'left', width: 140, borderBottom: '1px solid #E5E7EB' }}>Competency</th>
                        {track.levels.map(level => (
                          <th key={level.id} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: '#6B7280', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                            <div style={{ color: '#1A1A2E', fontWeight: 700, fontSize: 13 }}>{level.name}</div>
                            <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>Level {level.level}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(track.levels[0]?.competencies || []).map((_, compIdx) => (
                        <tr key={compIdx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#374151', background: '#FAFAFA', verticalAlign: 'top' }}>
                            {track.levels[0].competencies[compIdx]?.name || ''}
                          </td>
                          {track.levels.map(level => (
                            <td key={level.id} style={{ padding: '12px 16px', fontSize: 13, color: '#374151', verticalAlign: 'top', lineHeight: 1.5 }}>
                              {level.competencies[compIdx]?.description || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
