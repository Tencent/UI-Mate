import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BarChart, Bar, ResponsiveContainer } from 'recharts'
import { useApp } from '../context/AppContext.jsx'
import { formatCount } from '../utils/helpers.js'
import { withCurrentSearch } from '../utils/navigation.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

export default function ProjectsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useApp()
  const { projects = [], issues = [], teams = [] } = state

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Projects</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {projects.map(proj => {
          const projIssues = issues.filter(i => i.project === proj.id && i.status === 'unresolved')
          const projTeams = teams.filter(t => proj.teams.includes(t.id))
          const errorData = (projIssues[0]?.stats14d || [10, 15, 12, 18, 14, 16, 20]).map(v => ({ v }))

          return (
            <div key={proj.id}
              onClick={() => navigate(withCurrentSearch(`/projects/${proj.slug}/`, location.search))}
              style={{
                border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden',
                cursor: 'pointer', backgroundColor: '#fff', transition: 'box-shadow 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ borderLeft: `4px solid ${proj.color}`, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: TEXT_PRI }}>{proj.name}</div>
                    <div style={{ fontSize: 12, color: TEXT_SEC, marginTop: 2 }}>{proj.platform}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {projTeams.map(t => (
                      <span key={t.id} style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 3,
                        backgroundColor: '#F0EEFF', color: ACCENT, fontWeight: 500
                      }}>{t.name}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <span style={{ color: TEXT_SEC }}>
                      <strong style={{ color: TEXT_PRI }}>{proj.stats.totalErrors24h}</strong> errors today
                    </span>
                    <span style={{ color: TEXT_SEC }}>
                      <strong style={{ color: '#2BA185' }}>{proj.stats.crashFreeSessions}%</strong> crash-free
                    </span>
                  </div>
                  <div style={{ width: 60, height: 24 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={errorData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={1}>
                        <Bar dataKey="v" fill={proj.color} radius={[1, 1, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
