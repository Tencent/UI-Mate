import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Check, Shield } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Checkout.css'

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateCard(num) {
  return num.replace(/\s/g, '').length === 16
}

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

export default function Checkout() {
  const { state, addBooking, applyOneKeyCash, setCart } = useApp()
  const navigate = useNavigate()
  const { cart, user } = state

  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState({})

  const [travelerInfo, setTravelerInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: ''
  })

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: user ? `${user.firstName} ${user.lastName}` : '',
    street: '',
    city: '',
    state: '',
    zip: ''
  })

  const [applyOneKey, setApplyOneKey] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')

  if (!cart) {
    return (
      <div className="page-content" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2>No booking in progress</h2>
        <button className="btn-primary" onClick={() => navigate('/')}>Start searching</button>
      </div>
    )
  }

  const basePrice = cart.totalPrice || 0
  const taxes = Math.round(basePrice * 0.15)
  const oneKeyCashApplied = applyOneKey ? Math.min(user?.oneKeyCash || 0, basePrice) : 0
  const total = basePrice + taxes - oneKeyCashApplied - promoDiscount

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SAVE10') {
      setPromoDiscount(Math.round(basePrice * 0.1))
      setPromoError('')
    } else {
      setPromoDiscount(0)
      setPromoError('Invalid promo code')
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    if (!travelerInfo.firstName.trim()) newErrors.firstName = 'Required'
    if (!travelerInfo.lastName.trim()) newErrors.lastName = 'Required'
    if (!travelerInfo.email.trim() || !validateEmail(travelerInfo.email)) newErrors.email = 'Valid email required'
    if (!travelerInfo.phone.trim()) newErrors.phone = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!validateCard(paymentInfo.cardNumber)) newErrors.cardNumber = 'Must be 16 digits'
    if (!paymentInfo.expiry.trim()) newErrors.expiry = 'Required'
    if (paymentInfo.cvv.length !== 3) newErrors.cvv = 'Must be 3 digits'
    if (!paymentInfo.nameOnCard.trim()) newErrors.nameOnCard = 'Required'
    if (!paymentInfo.street.trim()) newErrors.street = 'Required'
    if (!paymentInfo.city.trim()) newErrors.city = 'Required'
    if (!paymentInfo.state) newErrors.state = 'Required'
    if (!paymentInfo.zip.trim()) newErrors.zip = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep1Next = () => {
    if (validateStep1()) setStep(2)
  }

  const handleStep2Next = () => {
    if (validateStep2()) setStep(3)
  }

  const handleCompleteBooking = () => {
    const confirmNum = 'EXP-' + Math.floor(10000000 + Math.random() * 90000000)
    const itineraryNum = String(Math.floor(1000000000 + Math.random() * 9000000000))
    const bookingId = `booking_${Date.now()}`

    const booking = {
      id: bookingId,
      type: cart.type || 'hotel',
      status: 'upcoming',
      confirmationNumber: confirmNum,
      itineraryNumber: itineraryNum,
      createdAt: new Date().toISOString(),
      hotelId: cart.hotelId || null,
      flightId: cart.flightResultId || null,
      carId: cart.carId || null,
      activityId: cart.activityId || null,
      cruiseId: cart.cruiseId || null,
      packageId: cart.packageId || null,
      checkIn: cart.checkIn || cart.departDate || cart.pickupDate,
      checkOut: cart.checkOut || cart.returnDate || cart.dropoffDate,
      guests: cart.guests || 1,
      rooms: cart.rooms || 0,
      roomType: cart.roomType || cart.cabinClass || cart.vehicleType || cart.cabinType || cart.duration || null,
      totalCost: total,
      oneKeyCashEarned: Math.round(total * 0.02 * 100) / 100,
      paymentMethod: `Visa ending in ${paymentInfo.cardNumber.replace(/\s/g, '').slice(-4)}`,
      travelerNames: [`${travelerInfo.firstName} ${travelerInfo.lastName}`],
      cancellationDeadline: null,
      notes: travelerInfo.specialRequests
    }

    addBooking(booking)
    if (applyOneKey && oneKeyCashApplied > 0) {
      applyOneKeyCash(oneKeyCashApplied)
    }
    navigate(`/confirmation/${bookingId}`)
  }

  const updateTraveler = (field, value) => {
    setTravelerInfo(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const updatePayment = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="page-content checkout-page">
      <div className="container">
        <h1 style={{ margin: '24px 0' }}>Checkout</h1>

        {/* Step indicators */}
        <div className="step-indicator">
          {[1, 2, 3].map(s => (
            <div key={s} className={`step ${step === s ? 'active' : step > s ? 'done' : ''}`}>
              <div className="step-circle">
                {step > s ? <Check size={14} /> : s}
              </div>
              <span>{s === 1 ? 'Traveler info' : s === 2 ? 'Payment' : 'Review'}</span>
              {s < 3 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          {/* Form area */}
          <div className="checkout-form">
            {/* Step 1: Traveler Info */}
            {step === 1 && (
              <div className="form-section card" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>Traveler details</h2>

                {user?.travelers?.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '14px', marginBottom: '6px', display: 'block', fontWeight: 600 }}>
                      Use saved traveler
                    </label>
                    <select
                      onChange={e => {
                        const t = user.travelers.find(tr => tr.id === e.target.value)
                        if (t) updateTraveler('firstName', t.firstName) || setTravelerInfo(prev => ({
                          ...prev, firstName: t.firstName, lastName: t.lastName
                        }))
                      }}
                      className="form-select"
                    >
                      <option value="">Select...</option>
                      {user.travelers.map(t => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-grid">
                  <FormField
                    label="First name" value={travelerInfo.firstName}
                    onChange={v => updateTraveler('firstName', v)}
                    error={errors.firstName} required
                  />
                  <FormField
                    label="Last name" value={travelerInfo.lastName}
                    onChange={v => updateTraveler('lastName', v)}
                    error={errors.lastName} required
                  />
                  <FormField
                    label="Email" type="email" value={travelerInfo.email}
                    onChange={v => updateTraveler('email', v)}
                    error={errors.email} required
                  />
                  <FormField
                    label="Phone number" type="tel" value={travelerInfo.phone}
                    onChange={v => updateTraveler('phone', v)}
                    error={errors.phone} required
                  />
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label className="form-label">Special requests (optional)</label>
                  <textarea
                    value={travelerInfo.specialRequests}
                    onChange={e => updateTraveler('specialRequests', e.target.value)}
                    className="form-textarea"
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>

                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={handleStep1Next}>
                  Continue to payment
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="form-section card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <h2>Payment method</h2>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-success)' }}>
                    <Lock size={14} />
                    Secure checkout
                  </div>
                </div>

                <div className="form-grid">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Card number <span className="required">*</span></label>
                    <input
                      className={`form-input ${errors.cardNumber ? 'error' : ''}`}
                      value={paymentInfo.cardNumber}
                      onChange={e => updatePayment('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {errors.cardNumber && <span className="form-error">{errors.cardNumber}</span>}
                  </div>
                  <FormField
                    label="Expiration (MM/YY)" value={paymentInfo.expiry}
                    onChange={v => {
                      const clean = v.replace(/\D/g, '').slice(0, 4)
                      const formatted = clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean
                      updatePayment('expiry', formatted)
                    }}
                    error={errors.expiry} required placeholder="MM/YY"
                  />
                  <FormField
                    label="CVV" value={paymentInfo.cvv}
                    onChange={v => updatePayment('cvv', v.replace(/\D/g, '').slice(0, 3))}
                    error={errors.cvv} required placeholder="123"
                  />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <FormField
                    label="Name on card" value={paymentInfo.nameOnCard}
                    onChange={v => updatePayment('nameOnCard', v)}
                    error={errors.nameOnCard} required
                  />
                </div>

                <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>Billing address</h3>
                <div className="form-grid">
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FormField
                      label="Street address" value={paymentInfo.street}
                      onChange={v => updatePayment('street', v)}
                      error={errors.street} required
                    />
                  </div>
                  <FormField
                    label="City" value={paymentInfo.city}
                    onChange={v => updatePayment('city', v)}
                    error={errors.city} required
                  />
                  <div>
                    <label className="form-label">State <span className="required">*</span></label>
                    <select
                      className={`form-select ${errors.state ? 'error' : ''}`}
                      value={paymentInfo.state}
                      onChange={e => updatePayment('state', e.target.value)}
                    >
                      <option value="">Select...</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <span className="form-error">{errors.state}</span>}
                  </div>
                  <FormField
                    label="ZIP code" value={paymentInfo.zip}
                    onChange={v => updatePayment('zip', v.replace(/\D/g, '').slice(0, 5))}
                    error={errors.zip} required
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button className="btn-primary" onClick={handleStep2Next}>Review booking</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="form-section card" style={{ padding: '24px' }}>
                <h2 style={{ marginBottom: '16px' }}>Review your booking</h2>

                <div className="review-section">
                  <h3>Traveler information</h3>
                  <div className="review-row"><span>Name:</span><strong>{travelerInfo.firstName} {travelerInfo.lastName}</strong></div>
                  <div className="review-row"><span>Email:</span><strong>{travelerInfo.email}</strong></div>
                  <div className="review-row"><span>Phone:</span><strong>{travelerInfo.phone}</strong></div>
                </div>

                <div className="review-section">
                  <h3>Payment</h3>
                  <div className="review-row">
                    <span>Card:</span>
                    <strong>Visa ending in {paymentInfo.cardNumber.replace(/\s/g, '').slice(-4)}</strong>
                  </div>
                  <div className="review-row"><span>Billing:</span><strong>{paymentInfo.city}, {paymentInfo.state}</strong></div>
                </div>

                {cart.freeCancellation && (
                  <div style={{ background: '#F0FFF4', border: '1px solid var(--color-success)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-success)' }}>
                    <Check size={16} />
                    Free cancellation available on this booking
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                  <button
                    className="btn-primary"
                    style={{ fontSize: '18px', padding: '14px 32px' }}
                    onClick={handleCompleteBooking}
                  >
                    Complete booking
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Booking summary sidebar */}
          <div className="booking-summary">
            <div className="card summary-card">
              <h3>Booking summary</h3>

              {(cart.hotelImage || cart.activityImage || cart.cruiseImage || cart.carImage) && (
                <img src={cart.hotelImage || cart.activityImage || cart.cruiseImage || cart.carImage} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} />
              )}

              <div className="summary-title">
                {cart.hotelName || cart.airline || cart.company || cart.activityName || cart.packageName || cart.cruiseName || 'Your booking'}
              </div>
              <div className="summary-detail">{cart.roomType || cart.cabinClass || cart.vehicleType || cart.cabinType || cart.duration || ''}</div>

              {cart.checkIn && (
                <div className="summary-row">
                  <span>{cart.type === 'cruise' ? 'Departure' : cart.type === 'activity' ? 'Date' : cart.type === 'car' ? 'Pick-up' : cart.type === 'flight' ? 'Departure' : 'Check-in'}</span><span>{cart.checkIn}</span>
                </div>
              )}
              {cart.checkOut && (
                <div className="summary-row">
                  <span>{cart.type === 'car' ? 'Drop-off' : cart.type === 'flight' ? 'Return' : 'Check-out'}</span><span>{cart.checkOut}</span>
                </div>
              )}
              {cart.guests && (
                <div className="summary-row">
                  <span>{cart.type === 'hotel' ? 'Guests' : 'Travelers'}</span><span>{cart.guests}</span>
                </div>
              )}
              {cart.includes && (
                <div style={{ marginTop: '8px' }}>
                  {cart.includes.map(inc => (
                    <div key={inc} style={{ fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600 }}>&#10003;</span> {inc}
                    </div>
                  ))}
                </div>
              )}
              {cart.itinerary && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-medium-gray)' }}>
                  <strong>Ports:</strong> {cart.itinerary.join(' > ')}
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-row">
                <span>Base price</span><span>${basePrice}</span>
              </div>
              <div className="summary-row">
                <span>Taxes & fees (est. 15%)</span><span>${taxes}</span>
              </div>

              {/* One Key Cash */}
              <div className="summary-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={applyOneKey}
                    onChange={e => setApplyOneKey(e.target.checked)}
                    style={{ accentColor: 'var(--color-action-blue)' }}
                  />
                  Apply One Key Cash (${user?.oneKeyCash?.toFixed(2)})
                </label>
                {applyOneKey && (
                  <span style={{ color: 'var(--color-success)', fontSize: '13px' }}>-${oneKeyCashApplied.toFixed(2)}</span>
                )}
              </div>

              {/* Promo code */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-input"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={e => { setPromoCode(e.target.value); setPromoError('') }}
                    style={{ flex: 1 }}
                  />
                  <button className="btn-secondary" style={{ borderRadius: '8px', padding: '0 12px', whiteSpace: 'nowrap' }} onClick={applyPromo}>Apply</button>
                </div>
                {promoError && <div style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '4px' }}>{promoError}</div>}
                {promoDiscount > 0 && <div style={{ color: 'var(--color-success)', fontSize: '13px', marginTop: '4px' }}>-${promoDiscount} promo discount</div>}
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>
                <span>${total}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-medium-gray)', marginTop: '8px' }}>
                <Shield size={14} />
                <span>Price Match Promise</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, value, onChange, error, required, type = 'text', placeholder }) {
  return (
    <div>
      <label className="form-label">{label} {required && <span className="required">*</span>}</label>
      <input
        type={type}
        className={`form-input ${error ? 'error' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}
