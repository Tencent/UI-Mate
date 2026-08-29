import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft, MapPin, Phone, CheckSquare, Square } from 'lucide-react'
import '../styles/common.css'

function Avatar({ initials, color, size = 48 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: color, fontSize: '16px' }}>
      {initials}
    </div>
  )
}

export default function VisitDetail() {
  const { id } = useParams()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelOther, setCancelOther] = useState('')
  const [checkInItems, setCheckInItems] = useState({
    demographics: false,
    insurance: false,
    medications: false,
    allergies: false,
    consent: false
  })
  const [checkInComplete, setCheckInComplete] = useState(false)

  const appt = (state.appointments || []).find(a => a.id === id)
  const provider = appt ? (state.providers || []).find(p => p.id === appt.providerId) : null

  if (!appt) {
    return (
      <div>
        <button className="back-btn" onClick={() => navigate('/visits')}>
          <ChevronLeft size={16} /> Back to Visits
        </button>
        <p style={{ marginTop: 20, color: 'var(--color-text-secondary)' }}>Appointment not found.</p>
      </div>
    )
  }

  const dt = new Date(appt.dateTime)
  const dateStr = dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  // Cancel now persists reason to state via dedicated action
  const handleCancel = () => {
    dispatch({
      type: 'CANCEL_APPOINTMENT_WITH_REASON',
      payload: {
        id: appt.id,
        reason: cancelReason,
        otherText: cancelReason === 'Other' ? cancelOther : ''
      }
    })
    setCancelOpen(false)
    navigate('/visits')
  }

  const toggleCheckIn = (key) => {
    setCheckInItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const allItemsChecked = Object.values(checkInItems).every(Boolean)

  const handleCompleteCheckIn = () => {
    if (!allItemsChecked) return
    dispatch({ type: 'UPDATE_APPOINTMENT', payload: { id: appt.id, status: 'Checked In', canCheckIn: false } })
    setCheckInComplete(true)
  }

  // Reschedule navigates to schedule with existing appt context pre-filled
  const handleReschedule = () => {
    navigate(`/schedule?reschedule=${appt.id}&reason=${encodeURIComponent(appt.reason || appt.type)}`)
  }

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/visits')}>
        <ChevronLeft size={16} /> Back to Visits
      </button>

      <div style={{ marginTop: 16 }}>
        <h1 className="page-title">{appt.type}</h1>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {dateStr} at {timeStr}
        </div>

        {/* Status badge */}
        <div style={{ marginTop: 8 }}>
          <span className={`badge ${
            appt.status === 'Completed' ? 'badge--green' :
            appt.status === 'Cancelled' ? 'badge--red' :
            appt.status === 'Checked In' ? 'badge--blue' :
            'badge--orange'
          }`}>
            {appt.status}
          </span>
        </div>
      </div>

      {/* Appointment Info */}
      <div className="section-card" style={{ marginTop: 16 }}>
        <div className="section-card-header">
          <h2 className="section-card-title">Appointment Information</h2>
        </div>
        <div className="section-card-body">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar initials={provider?.avatarInitials || 'DR'} color={provider?.avatarColor || '#0075BC'} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-md)' }}>{appt.providerName}</div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
                    {provider?.specialty} — {provider?.role}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 'var(--font-sm)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div><strong>Department:</strong> {appt.department}</div>
                <div><strong>Visit Type:</strong> {appt.type}</div>
                <div><strong>Duration:</strong> {appt.duration} minutes</div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <MapPin size={16} style={{ color: 'var(--color-primary)', marginTop: 2 }} />
                <div style={{ fontSize: 'var(--font-sm)' }}>
                  <div style={{ fontWeight: 600 }}>{appt.location}</div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>{appt.address}</div>
                </div>
              </div>
              {provider?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={16} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: 'var(--font-sm)' }}>{provider.phone}</span>
                </div>
              )}
            </div>
          </div>

          {appt.reason && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--color-section-bg)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)' }}>
              <strong>Reason for Visit:</strong> {appt.reason}
            </div>
          )}

          {/* Show cancellation reason if available */}
          {appt.status === 'Cancelled' && appt.cancelReason && (
            <div style={{ marginTop: 12, padding: 12, background: '#fff8f8', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)', borderLeft: '3px solid var(--color-danger)' }}>
              <strong>Cancellation Reason:</strong> {appt.cancelReason}
              {appt.cancelOtherText && <div style={{ marginTop: 4, color: 'var(--color-text-secondary)' }}>{appt.cancelOtherText}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Instructions (upcoming) */}
      {appt.isUpcoming && appt.instructions && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">Pre-Visit Instructions</h2>
          </div>
          <div className="section-card-body">
            <p style={{ fontSize: 'var(--font-sm)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{appt.instructions}</p>
          </div>
        </div>
      )}

      {/* E-Check-In */}
      {appt.isUpcoming && appt.canCheckIn && !checkInComplete && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title" style={{ color: 'var(--color-success)' }}>E-Check-In</h2>
          </div>
          <div className="section-card-body">
            <p style={{ fontSize: 'var(--font-sm)', marginBottom: 16, color: 'var(--color-text-secondary)' }}>
              Please complete all items below before checking in.
            </p>
            {[
              { key: 'demographics', label: 'Verify demographics' },
              { key: 'insurance', label: 'Verify insurance' },
              { key: 'medications', label: 'Verify medications' },
              { key: 'allergies', label: 'Verify allergies' },
              { key: 'consent', label: 'Sign consent forms' }
            ].map(item => (
              <div
                key={item.key}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                onClick={() => toggleCheckIn(item.key)}
              >
                {checkInItems[item.key]
                  ? <CheckSquare size={20} style={{ color: 'var(--color-success)' }} />
                  : <Square size={20} style={{ color: 'var(--color-text-secondary)' }} />
                }
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: checkInItems[item.key] ? 400 : 600 }}>{item.label}</span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              {!allItemsChecked && (
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  Please check all items above to complete check-in.
                </p>
              )}
              <button
                className="btn btn--success"
                onClick={handleCompleteCheckIn}
                disabled={!allItemsChecked}
              >
                Complete Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {checkInComplete && (
        <div className="section-card">
          <div className="section-card-body" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
            ✓ Check-in complete. See you at your appointment!
          </div>
        </div>
      )}

      {/* After Visit Summary */}
      {appt.status === 'Completed' && appt.afterVisitSummary && (
        <div className="section-card">
          <div className="section-card-header">
            <h2 className="section-card-title">After Visit Summary</h2>
          </div>
          <div className="section-card-body" style={{ fontSize: 'var(--font-sm)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {appt.afterVisitSummary.providerNotes && (
              <div>
                <strong>Provider Notes:</strong>
                <p style={{ marginTop: 4, lineHeight: 1.6, fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                  {appt.afterVisitSummary.providerNotes}
                </p>
              </div>
            )}
            {appt.afterVisitSummary.diagnoses?.length > 0 && (
              <div>
                <strong>Diagnoses Discussed:</strong>
                <ul style={{ marginTop: 4, paddingLeft: 20, lineHeight: 1.8 }}>
                  {appt.afterVisitSummary.diagnoses.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {appt.afterVisitSummary.medications?.length > 0 && (
              <div>
                <strong>Medications:</strong>
                <ul style={{ marginTop: 4, paddingLeft: 20, lineHeight: 1.8 }}>
                  {appt.afterVisitSummary.medications.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}
            {appt.afterVisitSummary.followUp && (
              <div>
                <strong>Follow-Up Instructions:</strong>
                <p style={{ marginTop: 4, lineHeight: 1.6 }}>{appt.afterVisitSummary.followUp}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {appt.isUpcoming && (appt.canCancel || appt.canReschedule) && (
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {appt.canCancel && (
            <button className="btn btn--danger" onClick={() => setCancelOpen(true)}>
              Cancel Appointment
            </button>
          )}
          {appt.canReschedule && (
            <button className="btn btn--gray" onClick={handleReschedule}>
              Reschedule
            </button>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelOpen && (
        <div className="modal-overlay" onClick={() => setCancelOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Cancel Appointment</h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', marginBottom: 16 }}>
              Are you sure you want to cancel your appointment with {appt.providerName} on {dateStr}?
            </p>
            <div className="form-group">
              <label className="form-label">Reason for cancellation</label>
              {['Schedule conflict', 'No longer needed', 'Found another provider', 'Other'].map(r => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <input
                    type="radio"
                    id={`cancel-${r}`}
                    name="cancelReason"
                    value={r}
                    checked={cancelReason === r}
                    onChange={() => setCancelReason(r)}
                  />
                  <label htmlFor={`cancel-${r}`} style={{ fontSize: 'var(--font-sm)', cursor: 'pointer' }}>{r}</label>
                </div>
              ))}
              {cancelReason === 'Other' && (
                <textarea
                  className="form-textarea"
                  placeholder="Please describe..."
                  value={cancelOther}
                  onChange={e => setCancelOther(e.target.value)}
                  rows={3}
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn--danger"
                onClick={handleCancel}
                disabled={!cancelReason || (cancelReason === 'Other' && !cancelOther.trim())}
              >
                Cancel Appointment
              </button>
              <button className="btn btn--gray" onClick={() => setCancelOpen(false)}>
                Keep Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 500; padding: 20px;
        }
        .modal-dialog {
          background: #fff; border-radius: 8px; padding: 24px;
          max-width: 480px; width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .modal-title {
          font-size: var(--font-lg); font-weight: 700; margin-bottom: 12px;
          color: var(--color-text-primary);
        }
      `}</style>
    </div>
  )
}
