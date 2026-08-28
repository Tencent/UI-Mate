import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Calendar, Mail, FlaskConical, X, ChevronRight, MessageSquare } from 'lucide-react'
import './Home.css'

function formatDate(dtStr) {
  const d = new Date(dtStr)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return {
    dayName: days[d.getDay()],
    day: d.getDate(),
    month: months[d.getMonth()],
    year: d.getFullYear(),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ' EDT'
  }
}

function Avatar({ initials, color, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#fff',
      fontSize: size < 36 ? '11px' : '14px', fontWeight: 700,
      flexShrink: 0
    }}>
      {initials}
    </div>
  )
}

export default function Home() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const user = state.currentUser
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const upcomingAppts = (state.appointments || [])
    .filter(a => a.isUpcoming && a.status === 'Scheduled')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))

  const banners = (state.ui?.notificationBanners || []).filter(b => !b.dismissed)
  const unreadCount = state.ui?.unreadMessageCount || 0
  const newResults = (state.testResults || []).filter(r => !r.isReviewed)

  const careTeamProviders = (state.providers || []).slice(0, 3)

  const dismissBanner = (id) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', payload: id })
  }

  const getProviderById = (id) => (state.providers || []).find(p => p.id === id)

  return (
    <div className="home-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome, {user.firstName}!</h1>
          <p className="welcome-date">{dateStr}</p>
        </div>
      </div>

      {/* Notification Banners */}
      {banners.map(banner => (
        <div key={banner.id} className={`notif-banner notif-banner--${banner.type}`}>
          <div className="notif-banner-icon">
            {banner.type === 'appointment' ? <Calendar size={20} /> :
              banner.type === 'result' ? <FlaskConical size={20} /> :
              <Mail size={20} />}
          </div>
          <div className="notif-banner-text">
            <span>{banner.text}</span>
          </div>
          <div className="notif-banner-actions">
            {banner.type === 'appointment' && (
              <button className="notif-action-btn" onClick={() => navigate('/visits')}>
                View Details
              </button>
            )}
            {banner.type === 'result' && (
              <button className="notif-action-btn notif-action-btn--success" onClick={() => navigate('/test-results')}>
                View Results
              </button>
            )}
          </div>
          <button className="notif-dismiss" onClick={() => dismissBanner(banner.id)}>
            <X size={16} />
          </button>
        </div>
      ))}

      <div className="home-grid">
        {/* Main column */}
        <div className="home-main-col">
          {/* Upcoming Appointments */}
          <div className="home-section-card">
            <div className="home-section-header">
              <h2 className="home-section-title">
                <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
                Upcoming Appointments
              </h2>
              <button className="view-all-link" onClick={() => navigate('/visits')}>
                View All <ChevronRight size={14} />
              </button>
            </div>

            {upcomingAppts.length === 0 ? (
              <div className="home-empty">No upcoming appointments scheduled.</div>
            ) : (
              upcomingAppts.slice(0, 2).map(appt => {
                const dt = formatDate(appt.dateTime)
                const provider = getProviderById(appt.providerId)
                return (
                  <div key={appt.id} className="appt-card">
                    <div className="appt-date-block">
                      <span className="appt-day-num">{dt.day}</span>
                      <span className="appt-month">{dt.month}</span>
                      <span className="appt-year">{dt.year}</span>
                    </div>
                    <div className="appt-details">
                      <div className="appt-time">{dt.time}</div>
                      <div className="appt-provider">
                        <Avatar initials={provider?.avatarInitials || 'DR'} color={provider?.avatarColor || '#0075BC'} size={32} />
                        <div>
                          <div className="appt-provider-name">With {appt.providerName}</div>
                          <div className="appt-dept">{appt.department}</div>
                        </div>
                      </div>
                      <div className="appt-badges">
                        <span className={`appt-type-badge appt-type-badge--${appt.type === 'Video Visit' ? 'video' : 'office'}`}>
                          {appt.type}
                        </span>
                      </div>
                      <div className="appt-location">{appt.location}</div>
                    </div>
                    <div className="appt-actions">
                      {appt.canCheckIn && (
                        <button className="btn btn--success btn--sm" onClick={() => navigate(`/visits/${appt.id}`)}>
                          e-preregistration
                        </button>
                      )}
                      <button className="btn btn--outline btn--sm" onClick={() => navigate(`/visits/${appt.id}`)}>
                        View Details
                      </button>
                    </div>
                  </div>
                )
              })
            )}

            <div className="home-card-footer">
              <button className="btn btn--primary btn--sm" onClick={() => navigate('/schedule')}>
                Schedule Appointment
              </button>
            </div>
          </div>

          {/* Messages Preview */}
          {unreadCount > 0 && (
            <div className="home-section-card">
              <div className="home-section-header">
                <h2 className="home-section-title">
                  <Mail size={18} style={{ color: 'var(--color-primary)' }} />
                  Messages
                  <span className="unread-badge">{unreadCount} unread</span>
                </h2>
                <button className="view-all-link" onClick={() => navigate('/messages')}>
                  View All ({unreadCount}) <ChevronRight size={14} />
                </button>
              </div>
              <p className="home-messages-hint">You have {unreadCount} unread message{unreadCount > 1 ? 's' : ''} in your inbox.</p>
            </div>
          )}

          {/* New Test Results */}
          {newResults.length > 0 && (
            <div className="home-section-card">
              <div className="home-section-header">
                <h2 className="home-section-title">
                  <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
                  New Test Results
                </h2>
                <button className="view-all-link" onClick={() => navigate('/test-results')}>
                  View All <ChevronRight size={14} />
                </button>
              </div>
              {newResults.map(r => (
                <div key={r.id} className="result-preview-row" onClick={() => navigate(`/test-results/${r.id}`)}>
                  <span className="result-new-badge">NEW</span>
                  <span className="result-name">{r.testName}</span>
                  <span className="result-date">from {r.resultDate?.split('T')[0]}</span>
                  <button className="btn btn--success btn--sm" onClick={(e) => { e.stopPropagation(); navigate(`/test-results/${r.id}`) }}>
                    View Results
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Care Team sidebar */}
        <div className="home-side-col">
          <div className="home-section-card">
            <h2 className="home-section-title care-team-title">Your Care Team and Recent Providers</h2>
            <div className="care-team-list">
              {careTeamProviders.map(provider => (
                <div key={provider.id} className="care-team-member">
                  <Avatar initials={provider.avatarInitials} color={provider.avatarColor} size={48} />
                  <div className="care-team-info">
                    <div className="care-team-name">{provider.fullName}</div>
                    <div className="care-team-role">{provider.role}</div>
                    <div className="care-team-specialty">{provider.specialty}</div>
                  </div>
                  <div className="care-team-actions">
                    <button
                      className="care-action-btn"
                      title="Send message"
                      onClick={() => navigate(`/messages/compose?provider=${provider.id}`)}
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="care-team-footer">
              <button className="view-all-link" onClick={() => navigate('/care-team')}>
                See provider details and manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
