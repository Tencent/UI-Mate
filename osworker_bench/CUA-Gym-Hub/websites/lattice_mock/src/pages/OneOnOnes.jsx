import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/Avatar.jsx'

export default function OneOnOnes() {
  const { state } = useApp()
  const navigate = useNavigate()

  if (!state) return null

  const { currentUser, users, oneOnOnes, meetings } = state

  const myOneOnOnes = oneOnOnes.filter(o => o.participantIds.includes(currentUser.id))

  const getOtherUser = (oo) => {
    const otherId = oo.participantIds.find(id => id !== currentUser.id)
    return users.find(u => u.id === otherId)
  }

  const getUpcomingMeeting = (ooId) => {
    return meetings.find(m => m.oneOnOneId === ooId && m.status === 'upcoming')
  }

  return (
    <div style={{ padding: '32px' }}>
      <div className="page-header">
        <h1 className="page-title">1:1s</h1>
      </div>

      {myOneOnOnes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">📅</div>
          <div className="empty-state-text">No 1:1 relationships yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myOneOnOnes.map(oo => {
            const otherUser = getOtherUser(oo)
            const nextMeeting = getUpcomingMeeting(oo.id)
            const tpCount = nextMeeting?.talkingPoints?.length || 0
            const date = oo.nextMeetingDate ? new Date(oo.nextMeetingDate) : null
            const dateStr = date ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''
            const timeStr = date ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''

            return (
              <div
                key={oo.id}
                className="card"
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                onClick={() => navigate(`/1on1s/${oo.id}`)}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                {otherUser && <Avatar user={otherUser} size={44} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E' }}>
                    {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown'}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                    {otherUser?.title} • {oo.frequency.charAt(0).toUpperCase() + oo.frequency.slice(1)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {dateStr && (
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A2E' }}>
                      {dateStr} at {timeStr}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {tpCount} talking point{tpCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
