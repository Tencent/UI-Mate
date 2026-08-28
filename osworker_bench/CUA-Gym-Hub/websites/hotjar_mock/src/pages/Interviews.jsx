import { useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

export default function Interviews() {
  const { state } = useAppContext()
  const [activeTab, setActiveTab] = useState('interviews')

  const feedbackCount = state.feedback?.filter(f => f.siteId === state.activeSiteId).length || 0

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2D3038' }}>Follow up interview invitation</h1>
        <span className="badge badge-orange">IN PROGRESS</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Feedback received', value: String(feedbackCount), sub: 'View all', action: true },
          { label: 'Recruited participants', value: '0', sub: null },
          { label: 'Scheduled interviews', value: '0', sub: null },
          { label: 'Completed interviews', value: '0', sub: null },
        ].map(card => (
          <div key={card.label} className="card">
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2D3038' }}>{card.value}</div>
            {card.sub && <div style={{ fontSize: 13, color: '#FF3C00', cursor: 'pointer', marginTop: 4 }}>{card.sub}</div>}
          </div>
        ))}
      </div>

      <div className="tab-bar">
        {['interviews', 'invitations'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'interviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center', color: '#6B7280' }}>
          <div style={{ width: 64, height: 64, background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 28 }}>📅</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#2D3038', marginBottom: 8 }}>No scheduled interviews yet</div>
          <p style={{ fontSize: 14, maxWidth: 360 }}>Invite participants from your feedback to schedule a user interview</p>
        </div>
      )}

      {activeTab === 'invitations' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center', color: '#6B7280' }}>
          <div style={{ width: 64, height: 64, background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 28 }}>📧</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#2D3038', marginBottom: 8 }}>No invitations sent</div>
          <p style={{ fontSize: 14, maxWidth: 360 }}>Send invitations to visitors who left feedback to schedule follow-up interviews</p>
        </div>
      )}
    </div>
  )
}
