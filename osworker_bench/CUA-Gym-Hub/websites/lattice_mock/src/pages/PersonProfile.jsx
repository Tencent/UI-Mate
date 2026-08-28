import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'
import { formatDate } from '../utils/dataManager.js'

export default function PersonProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useApp()
  const [activeTab, setActiveTab] = useState('About')

  if (!state) return null
  const { users, goals, feedback, currentUser, reviewCycles } = state

  const person = users.find(u => u.id === id)
  if (!person) {
    return (
      <div style={{ padding: 32 }}>
        <button className="btn btn-outline" onClick={() => navigate('/people')}>← Back to People</button>
        <p style={{ marginTop: 20, color: '#6B7280' }}>Person not found.</p>
      </div>
    )
  }

  const manager = users.find(u => u.id === person.managerId)
  const directReports = users.filter(u => u.managerId === person.id)
  const personGoals = goals.filter(g => g.ownerId === person.id)
  const personPraise = feedback.filter(f => f.toUserId === person.id && f.type === 'praise')
  const personReviewCycles = (reviewCycles || []).filter(rc => rc.revieweeIds && rc.revieweeIds.includes(person.id))

  return (
    <div style={{ padding: 32 }}>
      <button className="btn btn-outline btn-sm" onClick={() => navigate('/people')} style={{ marginBottom: 20 }}>
        ← Back to People
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
        {/* Left profile card */}
        <div className="card" style={{ padding: 24, alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <Avatar user={person} size={80} />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 12, textAlign: 'center' }}>
              {person.firstName} {person.lastName}
            </h2>
            <div style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4 }}>{person.title}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 2 }}>{person.department}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Email', value: person.email },
              { label: 'Location', value: person.location },
              { label: 'Start Date', value: formatDate(person.startDate) },
              { label: 'Manager', value: manager ? `${manager.firstName} ${manager.lastName}` : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right tabs */}
        <div>
          <div className="tab-nav">
            {['About', 'Goals', 'Feedback', 'Reviews'].map(tab => (
              <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'About' && (
            <div>
              {directReports.length > 0 && (
                <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Direct Reports ({directReports.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {directReports.map(dr => (
                      <div key={dr.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate(`/people/${dr.id}`)}>
                        <Avatar user={dr} size={32} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{dr.firstName} {dr.lastName}</div>
                          <div style={{ fontSize: 12, color: '#6B7280' }}>{dr.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="card" style={{ padding: '16px 20px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Team</h3>
                <div style={{ fontSize: 14, color: '#374151' }}>{person.team || '—'}</div>
              </div>
            </div>
          )}

          {activeTab === 'Goals' && (
            <div>
              {personGoals.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-emoji">🎯</div>
                  <div className="empty-state-text">No goals</div>
                </div>
              ) : (
                personGoals.map(goal => (
                  <div key={goal.id} className="card" style={{ padding: '14px 20px', marginBottom: 10, cursor: 'pointer' }} onClick={() => navigate(`/goals/${goal.id}`)}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{goal.title}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{goal.progress}% • {goal.status.replace('_', ' ')}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'Feedback' && (
            <div>
              {personPraise.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-emoji">💬</div>
                  <div className="empty-state-text">No public feedback</div>
                </div>
              ) : (
                personPraise.map(item => {
                  const fromUser = users.find(u => u.id === item.fromUserId)
                  return (
                    <div key={item.id} className="card" style={{ padding: '14px 20px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        {fromUser && <Avatar user={fromUser} size={28} />}
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{fromUser?.firstName} {fromUser?.lastName}</span>
                          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{item.body}</p>
                      {item.valueTags?.map(tag => (
                        <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#FFF7ED', color: '#92400E', fontWeight: 500, marginRight: 6 }}>
                          ⭐ {tag}
                        </span>
                      ))}
                    </div>
                  )
                })
              )}
            </div>
          )}
          {activeTab === 'Reviews' && (
            <div>
              {personReviewCycles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-emoji">📋</div>
                  <div className="empty-state-text" style={{ color: '#9CA3AF' }}>No review history</div>
                </div>
              ) : (
                personReviewCycles.map(rc => {
                  const statusMap = {
                    completed: { label: 'COMPLETED', bg: '#D1FAE5', color: '#065F46' },
                    active: { label: 'STILL RECEIVING', bg: '#FEF3C7', color: '#92400E' },
                    not_started: { label: 'NOT STARTED', bg: '#F3F4F6', color: '#6B7280' },
                  }
                  const badge = statusMap[rc.status] || { label: rc.status.toUpperCase(), bg: '#F3F4F6', color: '#6B7280' }
                  return (
                    <div key={rc.id} className="card" style={{ padding: '14px 20px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{rc.name}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color, letterSpacing: '0.5px' }}>
                          {badge.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                        {formatDate(rc.startDate)} – {formatDate(rc.endDate)}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
