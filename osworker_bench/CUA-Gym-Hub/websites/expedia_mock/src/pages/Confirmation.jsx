import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Plane, Bed, Car, Ship, MapPin, Package, Download, Printer, Mail, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Checkout.css'

export default function Confirmation() {
  const { bookingId } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)

  const booking = state.bookings.find(b => b.id === bookingId)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEmail = () => {
    showToast(`Confirmation sent to ${state.user?.email}`)
  }

  const handleDownload = () => {
    const data = JSON.stringify(booking, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `xpedia-booking-${booking.confirmationNumber}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Booking details downloaded')
  }

  if (!booking) {
    return (
      <div className="page-content" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2>Booking not found</h2>
        <button className="btn-primary" onClick={() => navigate('/')}>Go home</button>
      </div>
    )
  }

  const TypeIcon = booking.type === 'hotel' ? Bed : booking.type === 'flight' ? Plane : booking.type === 'cruise' ? Ship : booking.type === 'activity' ? MapPin : booking.type === 'package' ? Package : Car

  return (
    <div className="page-content" style={{ background: 'var(--color-bg-light)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '700px', padding: '48px 24px' }}>
        {/* Success banner */}
        <div style={{
          background: 'linear-gradient(135deg, #00355F 0%, #004E8C 100%)',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '24px',
          color: 'white'
        }}>
          <CheckCircle size={56} color="#FFC72C" style={{ marginBottom: '16px' }} />
          <h1 style={{ color: 'white', marginBottom: '8px', fontSize: '28px' }}>Booking confirmed!</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: '8px' }}>
            Your {booking.type} booking has been successfully confirmed.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            A confirmation email has been sent to {state.user?.email}
          </p>
        </div>

        {/* Confirmation details card */}
        <div className="card" style={{ padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-medium-gray)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.5px' }}>Confirmation number</div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-navy)', letterSpacing: '1px', fontFamily: 'monospace' }}>{booking.confirmationNumber}</div>
            </div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--color-action-blue-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <TypeIcon size={24} color="var(--color-action-blue)" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={handlePrint}>
              <Printer size={14} /> Print
            </button>
            <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={handleEmail}>
              <Mail size={14} /> Email
            </button>
            <button className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={handleDownload}>
              <Download size={14} /> Download
            </button>
          </div>

          <div style={{ height: '1px', background: 'var(--color-border-gray)', margin: '0 0 16px' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-medium-gray)', marginBottom: '2px' }}>Itinerary number</div>
              <div style={{ fontWeight: 600 }}>{booking.itineraryNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-medium-gray)', marginBottom: '2px' }}>Type</div>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{booking.type}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-medium-gray)', marginBottom: '2px' }}>Status</div>
              <div style={{ fontWeight: 600, color: 'var(--color-success)', textTransform: 'capitalize' }}>{booking.status}</div>
            </div>
            {booking.roomType && (
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-medium-gray)', marginBottom: '2px' }}>Room / Class</div>
                <div style={{ fontWeight: 600 }}>{booking.roomType}</div>
              </div>
            )}
            {booking.checkIn && (
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-medium-gray)', marginBottom: '2px' }}>
                  {booking.type === 'flight' ? 'Departure' : booking.type === 'car' ? 'Pick-up' : 'Check-in'}
                </div>
                <div style={{ fontWeight: 600 }}>{booking.checkIn}</div>
              </div>
            )}
            {booking.checkOut && (
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-medium-gray)', marginBottom: '2px' }}>
                  {booking.type === 'flight' ? 'Return' : booking.type === 'car' ? 'Drop-off' : 'Check-out'}
                </div>
                <div style={{ fontWeight: 600 }}>{booking.checkOut}</div>
              </div>
            )}
            {booking.guests > 0 && (
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-medium-gray)', marginBottom: '2px' }}>Travelers</div>
                <div style={{ fontWeight: 600 }}>{booking.travelerNames?.join(', ')}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-medium-gray)', marginBottom: '2px' }}>Payment</div>
              <div style={{ fontWeight: 600 }}>{booking.paymentMethod}</div>
            </div>
          </div>
        </div>

        {/* Price card */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-dark-text)' }}>Total cost</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-navy)' }}>${booking.totalCost}</span>
          </div>
          {booking.oneKeyCashEarned > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #FFF9EE 0%, #FFFAF0 100%)',
              border: '1px solid var(--color-golden-yellow)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '14px'
            }}>
              <span style={{ color: 'var(--color-navy)' }}>
                &#9733; One Key Cash earned
              </span>
              <strong style={{ color: 'var(--color-navy)', fontSize: '16px' }}>
                +${booking.oneKeyCashEarned?.toFixed(2)}
              </strong>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/trips')}>
            View your trips
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Book another trip
          </button>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: 'var(--color-navy)', color: 'white',
          padding: '12px 20px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.16)', zIndex: 3000,
          fontSize: '14px'
        }}>
          <Check size={16} /> {toast}
        </div>
      )}
    </div>
  )
}
