import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft } from 'lucide-react'
import '../styles/common.css'

const REASONS = ['Annual Physical', 'Follow-Up Visit', 'New Concern', 'Sick Visit', 'Prescription Refill', 'Referral', 'E-Visit']
const EVISIT_REASONS = ['E-Visit: Cold / Flu Symptoms', 'E-Visit: Minor Rash or Skin Question', 'E-Visit: Medication Question', 'E-Visit: Mental Health Check-In', 'E-Visit: Lab Results Review']

const TIME_SLOTS = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM']

function getAvailableDates() {
  const dates = []
  const today = new Date()
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(d)
  }
  return dates
}

function Avatar({ initials, color }) {
  return (
    <div className="avatar" style={{ width: 44, height: 44, background: color, fontSize: '14px' }}>
      {initials}
    </div>
  )
}

export default function ScheduleAppointment() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const visitType = searchParams.get('type')
  const rescheduleId = searchParams.get('reschedule')
  const rescheduleReason = searchParams.get('reason')
  const isEVisit = visitType === 'evisit'

  const [step, setStep] = useState(1)
  const [reason, setReason] = useState(
    isEVisit ? 'E-Visit: Cold / Flu Symptoms' :
    rescheduleReason ? decodeURIComponent(rescheduleReason) : ''
  )
  const [details, setDetails] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [success, setSuccess] = useState(false)

  const providers = state.providers || []
  const availableDates = getAvailableDates()
  const unavailable = [2, 5, 8, 11, 14, 17, 20, 23]

  const handleConfirm = () => {
    const dt = new Date(selectedDate)
    const [timePart, ampm] = selectedTime.split(' ')
    let [hours, minutes] = timePart.split(':').map(Number)
    if (ampm === 'PM' && hours !== 12) hours += 12
    if (ampm === 'AM' && hours === 12) hours = 0
    dt.setHours(hours, minutes)

    const newAppt = {
      id: `appt-new-${Date.now()}`,
      patientId: 'patient-1',
      providerId: selectedProvider.id,
      providerName: selectedProvider.fullName,
      type: reason,
      status: 'Scheduled',
      dateTime: dt.toISOString(),
      duration: 30,
      location: selectedProvider.location,
      address: selectedProvider.address || '',
      department: selectedProvider.department,
      reason: details || reason,
      instructions: '',
      isUpcoming: true,
      canCheckIn: false,
      canCancel: true,
      canReschedule: true,
      afterVisitSummary: null,
      questionnairesRequired: [],
      notes: ''
    }

    dispatch({ type: 'SCHEDULE_APPOINTMENT', payload: newAppt })
    setSuccess(true)
    setTimeout(() => navigate('/visits'), 2000)
  }

  const STEPS = ['Reason', 'Provider', 'Date & Time', 'Confirm']

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
        <h2 style={{ color: 'var(--color-success)', fontSize: 'var(--font-xl)', marginBottom: 8 }}>Appointment Scheduled!</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>Redirecting to your visits...</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="back-btn" onClick={() => navigate('/visits')}>
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="page-title">
          {isEVisit ? 'Schedule an E-Visit' : rescheduleId ? 'Reschedule Appointment' : 'Schedule an Appointment'}
        </h1>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 0 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: 'var(--font-sm)',
              background: step > i + 1 ? 'var(--color-success)' : step === i + 1 ? 'var(--color-primary)' : 'var(--color-border)',
              color: step >= i + 1 ? '#fff' : 'var(--color-text-secondary)',
              flexShrink: 0
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 'var(--font-xs)', marginLeft: 6, color: step === i + 1 ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > i + 1 ? 'var(--color-success)' : 'var(--color-border)', margin: '0 8px' }} />
            )}
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="section-card-body">
          {/* Step 1: Reason */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 16 }}>What is the reason for your visit?</h2>
              {isEVisit && (
                <div style={{ padding: '10px 14px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)', color: 'var(--color-primary)', marginBottom: 16 }}>
                  E-Visit: Please select the topic for your virtual consultation.
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {(isEVisit ? EVISIT_REASONS : REASONS).map(r => (
                  <div
                    key={r}
                    style={{
                      padding: '12px 16px', border: `2px solid ${reason === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)', cursor: 'pointer', background: reason === r ? 'var(--color-primary-light)' : '#fff',
                      fontSize: 'var(--font-sm)', fontWeight: reason === r ? 600 : 400, color: reason === r ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => setReason(r)}
                  >
                    {r}
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Additional details (optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your concern..."
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  rows={3}
                />
              </div>
              <button className="btn btn--primary" disabled={!reason} onClick={() => setStep(2)}>
                Next: Choose Provider
              </button>
            </div>
          )}

          {/* Step 2: Provider */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 16 }}>Select a Provider</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div
                  style={{
                    padding: '12px 16px', border: `2px solid ${selectedProvider === 'first' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)', cursor: 'pointer', background: selectedProvider === 'first' ? 'var(--color-primary-light)' : '#fff',
                    fontSize: 'var(--font-sm)', fontWeight: 600, color: selectedProvider === 'first' ? 'var(--color-primary)' : 'var(--color-text-primary)'
                  }}
                  onClick={() => setSelectedProvider('first')}
                >
                  First Available
                </div>
                {providers.filter(p => p.id !== 'provider-5').map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      border: `2px solid ${selectedProvider?.id === p.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      background: selectedProvider?.id === p.id ? 'var(--color-primary-light)' : '#fff',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => setSelectedProvider(p)}
                  >
                    <Avatar initials={p.avatarInitials} color={p.avatarColor} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-sm)' }}>{p.fullName}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{p.specialty}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-success)' }}>Next available: 3-5 business days</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn--gray" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn--primary" disabled={!selectedProvider} onClick={() => {
                  if (selectedProvider === 'first') setSelectedProvider(providers[0])
                  setStep(3)
                }}>Next: Choose Date & Time</button>
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 16 }}>Choose Date & Time</h2>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {availableDates.slice(0, 20).map((d, i) => {
                    const isUnavail = unavailable.includes(i)
                    const isSelected = selectedDate && d.toDateString() === new Date(selectedDate).toDateString()
                    return (
                      <div
                        key={i}
                        style={{
                          width: 60, padding: '8px 4px', textAlign: 'center', borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: isUnavail ? '#f5f5f5' : isSelected ? 'var(--color-primary)' : '#fff',
                          color: isUnavail ? '#bbb' : isSelected ? '#fff' : 'var(--color-text-primary)',
                          cursor: isUnavail ? 'not-allowed' : 'pointer', fontSize: 'var(--font-xs)', fontWeight: isSelected ? 600 : 400
                        }}
                        onClick={() => !isUnavail && setSelectedDate(d.toISOString())}
                      >
                        <div style={{ fontWeight: 600 }}>{d.getDate()}</div>
                        <div>{d.toLocaleString('en-US', { month: 'short' })}</div>
                        {isUnavail && <div style={{ fontSize: '9px' }}>Full</div>}
                      </div>
                    )
                  })}
                </div>

                {selectedDate && (
                  <div>
                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: 10 }}>
                      Available times for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {TIME_SLOTS.map(t => (
                        <div
                          key={t}
                          style={{
                            padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-sm)', cursor: 'pointer',
                            border: `1px solid ${selectedTime === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: selectedTime === t ? 'var(--color-primary)' : '#fff',
                            color: selectedTime === t ? '#fff' : 'var(--color-text-primary)',
                            fontWeight: selectedTime === t ? 600 : 400
                          }}
                          onClick={() => setSelectedTime(t)}
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn--gray" onClick={() => setStep(2)}>Back</button>
                <button className="btn btn--primary" disabled={!selectedDate || !selectedTime} onClick={() => setStep(4)}>
                  Next: Confirm
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 16 }}>Confirm Your Appointment</h2>
              <div style={{ background: 'var(--color-section-bg)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 'var(--font-sm)' }}>
                  <div><strong>Reason:</strong> {reason}</div>
                  {details && <div><strong>Details:</strong> {details}</div>}
                  <div><strong>Provider:</strong> {typeof selectedProvider === 'object' ? selectedProvider.fullName : 'First Available'}</div>
                  {typeof selectedProvider === 'object' && (
                    <div><strong>Location:</strong> {selectedProvider.location}</div>
                  )}
                  <div><strong>Date:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}</div>
                  <div><strong>Time:</strong> {selectedTime} EDT</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn--gray" onClick={() => setStep(3)}>Back</button>
                <button className="btn btn--success btn--lg" onClick={handleConfirm}>
                  Confirm Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
