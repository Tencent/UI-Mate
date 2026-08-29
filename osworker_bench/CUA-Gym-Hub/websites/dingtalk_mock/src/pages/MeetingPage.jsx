import { useState } from 'react'
import { useApp } from '../context/AppContext'

const MEETING_STATUS = {
  upcoming: { label: '即将开始', color: '#1890FF' },
  ongoing: { label: '进行中', color: '#52C41A' },
  ended: { label: '已结束', color: '#8F959E' },
}

export default function MeetingPage() {
  const { state } = useApp()
  const [activeTab, setActiveTab] = useState('upcoming')

  const now = new Date()

  const meetings = state.calendarEvents
    .filter(evt => evt.location || evt.participantIds?.length > 1)
    .map(evt => {
      const start = new Date(evt.startTime)
      const end = new Date(evt.endTime)
      let status = 'upcoming'
      if (now >= start && now <= end) status = 'ongoing'
      else if (now > end) status = 'ended'
      return { ...evt, status }
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

  const getList = () => {
    if (activeTab === 'upcoming') return meetings.filter(m => m.status === 'upcoming')
    if (activeTab === 'ongoing') return meetings.filter(m => m.status === 'ongoing')
    return meetings.filter(m => m.status === 'ended')
  }

  const getUser = (id) => state.users.find(u => u.id === id)

  const formatTime = (ts) => {
    const d = new Date(ts)
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
  }

  const formatDate = (ts) => {
    const d = new Date(ts)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return '今天'
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (d.toDateString() === tomorrow.toDateString()) return '明天'
    return `${d.getMonth()+1}月${d.getDate()}日`
  }

  const list = getList()

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>会议</h2>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        {[
          { key: 'upcoming', label: '即将开始' },
          { key: 'ongoing', label: '进行中' },
          { key: 'ended', label: '已结束' },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14,
              fontFamily: 'var(--font-family)',
              color: activeTab === t.key ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: activeTab === t.key ? 600 : 400
            }}
          >{t.label}</button>
        ))}
      </div>
      {list.map(meeting => {
        const creator = getUser(meeting.creatorId)
        const participants = (meeting.participantIds || []).map(id => getUser(id)).filter(Boolean)
        const statusInfo = MEETING_STATUS[meeting.status]
        return (
          <div key={meeting.id} style={{
            background: 'white', border: '1px solid var(--border)', borderRadius: 8,
            padding: '16px 20px', marginBottom: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: meeting.color || 'var(--primary)' }} />
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{meeting.title}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 12 }}>
                  {formatDate(meeting.startTime)} {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                </div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                color: statusInfo.color, background: statusInfo.color + '18'
              }}>
                {statusInfo.label}
              </span>
            </div>
            {meeting.location && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, marginLeft: 12 }}>
                📍 {meeting.location}
              </div>
            )}
            {meeting.description && (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, marginLeft: 12 }}>
                {meeting.description}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginRight: 4 }}>参与人：</span>
              {participants.slice(0, 5).map(u => (
                <div key={u.id} className="avatar-circle" style={{ width: 24, height: 24, fontSize: 10, background: u.avatar }} title={u.name}>
                  {u.name.charAt(0)}
                </div>
              ))}
              {participants.length > 5 && (
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>+{participants.length - 5}</span>
              )}
            </div>
          </div>
        )
      })}
      {list.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
          暂无会议
        </div>
      )}
    </div>
  )
}
