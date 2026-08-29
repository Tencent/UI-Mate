import React from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Header from '../components/Header.jsx'
import { ArrowLeft, Mail, MapPin, Calendar, Monitor } from 'lucide-react'

const AVATAR_COLORS = ['#4F44E0', '#EB5757', '#27AE60', '#F5A623', '#00BCD4', '#9C27B0', '#FF7043', '#607D8B']

export default function UserProfilePage() {
  const { userId } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sid = searchParams.get('sid')
  const events = state?.events || []

  const profile = state?.userProfiles?.find(p => p.id === userId)

  function navTo(path) {
    navigate(sid ? `${path}?sid=${sid}` : path)
  }

  if (!profile) return <div style={{ padding: 40, color: '#8E8EA0' }}>User not found</div>

  const userEvents = events.filter(e => e.distinctId === profile.distinctId).slice(0, 50)
  const idx = state?.userProfiles?.indexOf(profile) || 0

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  function timeAgo(iso) {
    const now = new Date('2026-01-22T10:00:00Z')
    const then = new Date(iso)
    const diff = (now - then) / 1000
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header title={profile.name} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Profile sidebar */}
        <div style={{ width: 320, borderRight: '1px solid #E4E4E8', overflowY: 'auto', padding: '24px', background: '#fff' }}>
          <button onClick={() => navTo('/users')} style={{
            display: 'flex', alignItems: 'center', gap: 6, color: '#4F44E0', fontSize: 13,
            background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0
          }}>
            <ArrowLeft size={14} /> Back to Users
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12
            }}>{getInitials(profile.name)}</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1B1B2E', marginBottom: 4 }}>{profile.name}</h2>
            <span style={{ fontSize: 13, color: '#8E8EA0' }}>{profile.distinctId}</span>
          </div>

          <div style={{ borderTop: '1px solid #E4E4E8', paddingTop: 16 }}>
            <InfoRow icon={<Mail size={14} />} label="Email" value={profile.email} />
            <InfoRow icon={<MapPin size={14} />} label="Location" value={`${profile.city}, ${profile.countryCode}`} />
            <InfoRow icon={<Calendar size={14} />} label="Created" value={new Date(profile.createdAt).toLocaleDateString()} />
            <InfoRow icon={<Monitor size={14} />} label="Device" value={profile.properties?.['Device Type'] || '--'} />
          </div>

          <div style={{ borderTop: '1px solid #E4E4E8', paddingTop: 16, marginTop: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1B1B2E', marginBottom: 12 }}>Properties</h3>
            {Object.entries(profile.properties || {}).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0F0F4', fontSize: 13 }}>
                <span style={{ color: '#8E8EA0' }}>{k}</span>
                <span style={{ color: '#1B1B2E', fontWeight: 500 }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1B1B2E', marginBottom: 16 }}>Activity Timeline</h3>
          <div style={{ fontSize: 13, color: '#8E8EA0', marginBottom: 16 }}>{userEvents.length} events</div>

          {userEvents.length === 0 ? (
            <div style={{ color: '#8E8EA0', fontSize: 13 }}>No events found for this user.</div>
          ) : (
            <div>
              {userEvents.map((event, i) => (
                <div key={event.id} style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
                  {/* Timeline line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: event.eventName === 'Purchase' ? '#27AE60' : event.eventName === 'Sign Up' ? '#4F44E0' : '#E4E4E8',
                      border: '2px solid #fff', zIndex: 1
                    }} />
                    {i < userEvents.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: '#E4E4E8', minHeight: 30 }} />
                    )}
                  </div>

                  {/* Event content */}
                  <div style={{ flex: 1, paddingBottom: 16, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1B1B2E' }}>{event.eventName}</span>
                      <span style={{ fontSize: 11, color: '#8E8EA0' }}>{timeAgo(event.time)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8E8EA0', marginTop: 2 }}>
                      {event.currentUrl} -- {event.browser} on {event.operatingSystem}
                    </div>
                    {event.properties?.revenue && (
                      <div style={{ fontSize: 12, color: '#27AE60', marginTop: 2, fontWeight: 500 }}>
                        Revenue: ${event.properties.revenue}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 13 }}>
      <span style={{ color: '#8E8EA0', display: 'flex' }}>{icon}</span>
      <span style={{ color: '#8E8EA0', minWidth: 60 }}>{label}</span>
      <span style={{ color: '#1B1B2E', flex: 1 }}>{value}</span>
    </div>
  )
}
