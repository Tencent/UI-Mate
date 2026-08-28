import React, { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { formatRelativeTime, formatDate, getInitials, getAvatarColor } from '../utils/helpers.js'

const ACCENT = '#6C5FC7'
const BORDER = '#E2DBE8'
const TEXT_SEC = '#80708F'
const TEXT_PRI = '#2B2233'

export default function ReleasesPage() {
  const { state } = useApp()
  const { releases = [], projects = [], users = [] } = state
  const [sortBy, setSortBy] = useState('date')
  const [expandedRelease, setExpandedRelease] = useState(null)

  const sorted = useMemo(() => {
    const list = [...releases]
    if (sortBy === 'date') list.sort((a, b) => new Date(b.dateReleased) - new Date(a.dateReleased))
    else if (sortBy === 'sessions') list.sort((a, b) => a.crashFreeSessions - b.crashFreeSessions)
    else if (sortBy === 'adoption') list.sort((a, b) => b.adoption - a.adoption)
    return list
  }, [releases, sortBy])

  return (
    <div style={{ padding: '24px 32px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: TEXT_PRI }}>Releases</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['date', 'sessions', 'adoption'].map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              border: `1px solid ${BORDER}`, borderRadius: 4, padding: '5px 12px',
              backgroundColor: sortBy === s ? ACCENT : '#fff', color: sortBy === s ? '#fff' : TEXT_PRI,
              fontSize: 12, cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize'
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '200px 1fr 100px 100px 80px 100px',
          padding: '10px 16px', backgroundColor: '#FAF9FB', borderBottom: `1px solid ${BORDER}`,
          fontSize: 11, fontWeight: 600, color: TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.5px'
        }}>
          <div>Version</div>
          <div>Projects</div>
          <div style={{ textAlign: 'right' }}>Crash Free</div>
          <div style={{ textAlign: 'right' }}>Adoption</div>
          <div style={{ textAlign: 'right' }}>Issues</div>
          <div style={{ textAlign: 'right' }}>Date</div>
        </div>

        {sorted.map((rel, idx) => {
          const relProjects = projects.filter(p => rel.projects.includes(p.id))
          const relAuthors = users.filter(u => rel.authors.includes(u.id))
          const expanded = expandedRelease === rel.id

          return (
            <div key={rel.id}>
              <div
                onClick={() => setExpandedRelease(expanded ? null : rel.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '200px 1fr 100px 100px 80px 100px',
                  padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, fontSize: 13,
                  cursor: 'pointer', alignItems: 'center'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF9FB'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ fontFamily: '"Source Code Pro", monospace', color: ACCENT, fontWeight: 500 }}>
                  {rel.shortVersion}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {relProjects.map(p => (
                    <span key={p.id} style={{
                      fontSize: 10, padding: '1px 6px', borderRadius: 3, fontWeight: 500,
                      backgroundColor: p.color + '22', color: p.color, border: `1px solid ${p.color}44`
                    }}>{p.name}</span>
                  ))}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    color: rel.crashFreeSessions >= 97 ? '#2BA185' : rel.crashFreeSessions >= 95 ? '#F5B000' : '#E03E2F',
                    fontWeight: 600
                  }}>
                    {rel.crashFreeSessions}%
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    <div style={{ width: 48, height: 6, borderRadius: 3, backgroundColor: '#F0EEFF', overflow: 'hidden' }}>
                      <div style={{ width: `${rel.adoption}%`, height: '100%', backgroundColor: ACCENT, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, color: TEXT_PRI }}>{rel.adoption}%</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', color: rel.newIssues > 0 ? '#E03E2F' : '#2BA185', fontWeight: 500 }}>
                  {rel.newIssues}
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: TEXT_SEC }}>
                  {formatRelativeTime(rel.dateReleased)}
                </div>
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div style={{ padding: '16px 24px', backgroundColor: '#FAF9FB', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, fontSize: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: TEXT_PRI, marginBottom: 8 }}>Details</div>
                      <div style={{ color: TEXT_SEC, marginBottom: 4 }}>Released: <span style={{ color: TEXT_PRI }}>{formatDate(rel.dateReleased, 'long')}</span></div>
                      <div style={{ color: TEXT_SEC, marginBottom: 4 }}>Sessions: <span style={{ color: TEXT_PRI }}>{rel.totalSessions.toLocaleString()}</span></div>
                      <div style={{ color: TEXT_SEC, marginBottom: 4 }}>Crash Free Users: <span style={{ color: '#2BA185' }}>{rel.crashFreeUsers}%</span></div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: TEXT_PRI, marginBottom: 8 }}>Commits</div>
                      <div style={{ color: TEXT_SEC }}>{rel.commitCount} commits</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: TEXT_PRI, marginBottom: 8 }}>Authors</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {relAuthors.map(u => (
                          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%',
                              backgroundColor: getAvatarColor(u.name),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 8, fontWeight: 700, color: '#fff'
                            }}>{getInitials(u.name)}</div>
                            <span style={{ color: TEXT_PRI }}>{u.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
