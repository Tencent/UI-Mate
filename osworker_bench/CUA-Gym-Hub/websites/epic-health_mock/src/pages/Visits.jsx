import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Calendar, ChevronRight } from 'lucide-react'
import '../styles/common.css'
import './Visits.css'

function formatDateTime(dtStr) {
  const d = new Date(dtStr)
  return {
    full: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    short: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ' EDT',
    day: d.getDate(),
    month: d.toLocaleString('en-US', { month: 'short' }),
    year: d.getFullYear()
  }
}

function Avatar({ initials, color, size = 40 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: color, fontSize: size < 36 ? '11px' : '14px' }}>
      {initials}
    </div>
  )
}

export default function Visits() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [filter, setFilter] = useState('all')

  const upcoming = (state.appointments || [])
    .filter(a => a.isUpcoming && a.status === 'Scheduled')
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))

  const filterPast = (appts) => {
    if (filter === 'all') return appts
    const now = new Date()
    const cutoff = filter === '6months'
      ? new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
      : new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    return appts.filter(a => new Date(a.dateTime) >= cutoff)
  }

  const past = filterPast(
    (state.appointments || [])
      .filter(a => !a.isUpcoming && a.status === 'Completed')
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
  )

  const getProvider = (id) => (state.providers || []).find(p => p.id === id)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Calendar size={22} style={{ color: 'var(--color-primary)', verticalAlign: 'middle', marginRight: 8 }} />
          Visits
        </h1>
        <button className="btn btn--primary btn--sm" onClick={() => navigate('/schedule')}>
          + Schedule Appointment
        </button>
      </div>

      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'upcoming' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'past' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past Visits
        </button>
      </div>

      {activeTab === 'upcoming' && (
        <div>
          {upcoming.length === 0 ? (
            <div className="section-card">
              <div className="section-card-body" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                <Calendar size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p>No upcoming appointments scheduled.</p>
                <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => navigate('/schedule')}>
                  Schedule Appointment
                </button>
              </div>
            </div>
          ) : upcoming.map(appt => {
            const dt = formatDateTime(appt.dateTime)
            const provider = getProvider(appt.providerId)
            return (
              <div key={appt.id} className="visit-card">
                <div className="visit-date-block">
                  <span className="visit-day-num">{dt.day}</span>
                  <span className="visit-month">{dt.month}</span>
                  <span className="visit-year">{dt.year}</span>
                </div>
                <div className="visit-details">
                  <div className="visit-time">{dt.time}</div>
                  <div className="visit-provider-row">
                    <Avatar initials={provider?.avatarInitials || 'DR'} color={provider?.avatarColor || '#0075BC'} size={36} />
                    <div>
                      <div className="visit-provider-name">With {appt.providerName}</div>
                      <div className="visit-provider-dept">{appt.department}</div>
                    </div>
                  </div>
                  <div className="visit-badges">
                    <span className={`badge ${appt.type === 'Video Visit' ? 'badge--green' : 'badge--blue'}`}>
                      {appt.type}
                    </span>
                  </div>
                  <div className="visit-location">{appt.location}</div>
                </div>
                <div className="visit-actions">
                  {appt.canCheckIn && (
                    <button className="btn btn--success btn--sm" onClick={() => navigate(`/visits/${appt.id}`)}>
                      Check In
                    </button>
                  )}
                  <button className="btn btn--outline btn--sm" onClick={() => navigate(`/visits/${appt.id}`)}>
                    View Details
                  </button>
                  {appt.canCancel && (
                    <button className="btn-text-danger btn--sm" onClick={() => navigate(`/visits/${appt.id}`)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'past' && (
        <div>
          <div className="past-filter-row">
            <span className="past-filter-label">Filter:</span>
            <select className="form-select past-filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All visits</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
            </select>
          </div>

          {past.length === 0 ? (
            <div className="section-card">
              <div className="section-card-body" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
                <p>No past visits in the selected time range.</p>
              </div>
            </div>
          ) : past.map(appt => {
            const dt = formatDateTime(appt.dateTime)
            const provider = getProvider(appt.providerId)
            return (
              <div key={appt.id} className="past-visit-row">
                <div className="past-visit-date">{dt.short}</div>
                <div className="past-visit-provider">
                  <Avatar initials={provider?.avatarInitials || 'DR'} color={provider?.avatarColor || '#0075BC'} size={32} />
                  <div>
                    <div className="past-provider-name">{appt.providerName}</div>
                    <span className="badge badge--gray">{appt.type}</span>
                  </div>
                </div>
                <button
                  className="btn btn--outline btn--sm"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => navigate(`/visits/${appt.id}`)}
                >
                  View After Visit Summary
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
