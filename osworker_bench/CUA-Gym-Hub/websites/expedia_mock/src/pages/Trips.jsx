import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Bed, Car, Calendar, ChevronDown, ChevronUp, X, Check, Ship, MapPin, Package } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Trips.css'

const TRIP_TYPE_ICONS = {
  hotel: Bed,
  flight: Plane,
  car: Car,
  package: Package,
  activity: MapPin,
  cruise: Ship
}

const STATUS_COLORS = {
  upcoming: 'var(--color-action-blue)',
  completed: 'var(--color-success)',
  cancelled: 'var(--color-medium-gray)'
}

export default function Trips() {
  const { state, cancelBooking } = useApp()
  const navigate = useNavigate()
  const { bookings } = state

  const [activeTab, setActiveTab] = useState('upcoming')
  const [expandedId, setExpandedId] = useState(null)
  const [confirmCancelId, setConfirmCancelId] = useState(null)

  const filtered = bookings.filter(b => b.status === activeTab)

  const TABS = ['upcoming', 'completed', 'cancelled']

  return (
    <div className="page-content trips-page">
      <div className="container" style={{ padding: '24px' }}>
        <h1 style={{ color: 'var(--color-navy)', marginBottom: '24px' }}>Your trips</h1>

        {/* Tabs */}
        <div className="trip-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`trip-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="tab-count">({bookings.filter(b => b.status === tab).length})</span>
            </button>
          ))}
        </div>

        {/* Bookings */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === 'upcoming' ? <Plane size={48} color="var(--color-border-gray)" /> :
               activeTab === 'completed' ? <Check size={48} color="var(--color-border-gray)" /> :
               <X size={48} color="var(--color-border-gray)" />}
            </div>
            <h3>No {activeTab} trips</h3>
            <p>When you book a trip, it will appear here.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Start planning</button>
          </div>
        ) : (
          <div className="trips-list">
            {filtered.map(booking => {
              const Icon = TRIP_TYPE_ICONS[booking.type] || Calendar
              const isExpanded = expandedId === booking.id

              return (
                <div key={booking.id} className={`trip-card ${booking.status}`}>
                  <div className="trip-card-header">
                    <div className="trip-type-icon">
                      <Icon size={20} color={STATUS_COLORS[booking.status]} />
                    </div>
                    <div className="trip-header-info">
                      <div className="trip-type-label">{booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}</div>
                      <div className="trip-conf-num">#{booking.confirmationNumber}</div>
                    </div>
                    <div className="trip-status-badge" style={{ background: booking.status === 'upcoming' ? 'var(--color-action-blue-light)' : booking.status === 'completed' ? '#F0FFF4' : 'var(--color-bg-light)', color: STATUS_COLORS[booking.status] }}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                    <button
                      className="expand-btn"
                      onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>

                  {/* Summary always visible */}
                  <div className="trip-summary">
                    <div className="trip-summary-row">
                      {booking.type === 'hotel' && (
                        <>
                          <span>🏨 {booking.roomType || 'Hotel stay'}</span>
                          <span>{booking.checkIn} – {booking.checkOut}</span>
                          <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                        </>
                      )}
                      {booking.type === 'flight' && (
                        <>
                          <span>✈ Flight</span>
                          <span>{booking.checkIn} – {booking.checkOut}</span>
                          <span>{booking.travelerNames?.join(', ')}</span>
                        </>
                      )}
                      {booking.type === 'car' && (
                        <>
                          <span>Car rental</span>
                          <span>{booking.checkIn} – {booking.checkOut}</span>
                        </>
                      )}
                      {booking.type === 'activity' && (
                        <>
                          <span>Activity</span>
                          <span>{booking.checkIn}</span>
                          <span>{booking.travelerNames?.join(', ')}</span>
                        </>
                      )}
                      {booking.type === 'package' && (
                        <>
                          <span>Vacation Package</span>
                          <span>{booking.checkIn}</span>
                          <span>{booking.guests} traveler{booking.guests > 1 ? 's' : ''}</span>
                        </>
                      )}
                      {booking.type === 'cruise' && (
                        <>
                          <span>Cruise</span>
                          <span>{booking.checkIn}</span>
                          <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                        </>
                      )}
                      <span className="trip-total">${booking.totalCost}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="trip-details">
                      <div className="trip-details-grid">
                        <div><span>Itinerary #</span><strong>{booking.itineraryNumber}</strong></div>
                        <div><span>Payment</span><strong>{booking.paymentMethod}</strong></div>
                        <div><span>One Key Cash earned</span><strong style={{ color: 'var(--color-golden-yellow)' }}>+${booking.oneKeyCashEarned?.toFixed(2)}</strong></div>
                        {booking.cancellationDeadline && (
                          <div><span>Free cancellation until</span><strong>{new Date(booking.cancellationDeadline).toLocaleDateString()}</strong></div>
                        )}
                        {booking.notes && (
                          <div style={{ gridColumn: '1 / -1' }}><span>Notes</span><strong>{booking.notes}</strong></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="trip-actions">
                    <button className="btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}
                      onClick={() => setExpandedId(isExpanded ? null : booking.id)}>
                      {isExpanded ? 'Hide details' : 'View details'}
                    </button>

                    {booking.status === 'upcoming' && (
                      <button
                        className="btn-cancel"
                        onClick={() => setConfirmCancelId(booking.id)}
                      >
                        Cancel booking
                      </button>
                    )}

                    {booking.status === 'completed' && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '13px', padding: '8px 16px' }}
                        onClick={() => navigate('/')}
                      >
                        Book again
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {confirmCancelId && (
        <div className="modal-overlay" onClick={() => setConfirmCancelId(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>Cancel booking?</h3>
            <p>Are you sure you want to cancel this booking? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button
                className="btn-primary"
                style={{ background: 'var(--color-error)', flex: 1, justifyContent: 'center' }}
                onClick={() => { cancelBooking(confirmCancelId); setConfirmCancelId(null) }}
              >
                Cancel booking
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setConfirmCancelId(null)}
              >
                Keep booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
