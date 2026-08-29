import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Users, Phone, MessageSquare, Calendar } from 'lucide-react'
import '../styles/common.css'

function Avatar({ initials, color, size = 80 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: color, fontSize: size > 60 ? '22px' : '14px' }}>
      {initials}
    </div>
  )
}

export default function CareTeam() {
  const { state } = useApp()
  const navigate = useNavigate()

  const providers = state.providers || []

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Users size={22} style={{ color: 'var(--color-primary)' }} />
        Care Team
      </h1>

      <div>
        <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12 }}>Your Providers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
          {providers.map(provider => (
            <div
              key={provider.id}
              className="section-card"
              style={{ textAlign: 'center', overflow: 'hidden' }}
            >
              <div style={{ padding: '24px 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <Avatar initials={provider.avatarInitials} color={provider.avatarColor} size={80} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-md)', marginBottom: 4 }}>{provider.fullName}</div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-primary)', marginBottom: 2 }}>{provider.role}</div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{provider.specialty}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{provider.department}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 12 }}>{provider.location}</div>
                {provider.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                    <Phone size={12} /> {provider.phone}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={() => navigate(`/messages/compose?provider=${provider.id}`)}
                  >
                    <MessageSquare size={12} /> Message
                  </button>
                  <button
                    className="btn btn--success btn--sm"
                    onClick={() => navigate('/schedule')}
                  >
                    <Calendar size={12} /> Schedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
