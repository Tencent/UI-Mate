import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';
import { InfoDialog } from '../components/InfoDialog';

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addBooking, data } = useAppContext();

  // Try navigation state first, then fall back to URL query params
  let bookingState = location.state?.bookingState;

  if (!bookingState && data) {
    const params = new URLSearchParams(location.search);
    const propertyId = params.get('propertyId');
    const roomId = params.get('roomId');
    const checkIn = params.get('checkIn');
    const checkOut = params.get('checkOut');
    const rooms = parseInt(params.get('rooms') || '1', 10);
    const adults = parseInt(params.get('adults') || '2', 10);

    if (propertyId) {
      const property = data.properties?.find(p => p.id === propertyId);
      const room = roomId ? data.rooms?.find(r => r.id === roomId) : null;

      if (property) {
        let nights = 1;
        if (checkIn && checkOut) {
          const msPerDay = 1000 * 60 * 60 * 24;
          nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / msPerDay));
        }
        bookingState = { property, room, checkIn, checkOut, nights, adults, children: 0, rooms };
      }
    }
  }

  const [formData, setFormData] = useState({
    firstName: data?.user?.firstName || '',
    lastName: data?.user?.lastName || '',
    email: data?.user?.email || '',
    phone: data?.user?.phone || '',
    specialRequests: '',
    arrivalTime: '14:00 – 15:00',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [legalDialog, setLegalDialog] = useState(null);

  if (!bookingState) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>No booking details found</h2>
        <Link to="/search" style={{ color: 'var(--bc-blue)' }}>Search for a property</Link>
      </div>
    );
  }

  const { property, room, checkIn, checkOut, nights, adults, children, rooms } = bookingState;
  const nightsCount = nights || 1;
  const roomPrice = room?.pricePerNight || property.pricePerNight;
  const subtotal = roomPrice * nightsCount;
  const taxes = property.taxesAndFees * nightsCount;
  const grandTotal = subtotal + taxes;

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'Required';
    if (!formData.lastName.trim()) errs.lastName = 'Required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email required';
    if (!formData.phone.trim()) errs.phone = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const confirmationNumber = String(Math.floor(Math.random() * 9000000000) + 1000000000);
    const pinCode = String(Math.floor(Math.random() * 9000) + 1000);
    const bookingId = `booking_${Date.now()}`;

    const booking = {
      id: bookingId,
      confirmationNumber,
      pinCode,
      userId: data?.user?.id || 'user_1',
      propertyId: property.id,
      propertyName: property.name,
      propertyImage: property.thumbnailUrl || property.photos?.[0]?.url,
      propertyCity: property.city,
      propertyAddress: property.address,
      roomId: room?.id,
      roomName: room?.name,
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      nights: nightsCount,
      guests: { adults: adults || 2, children: children || 0 },
      rooms: rooms || 1,
      pricePerNight: roomPrice,
      totalPrice: subtotal,
      taxesAndFees: taxes,
      grandTotal,
      status: 'confirmed',
      guestFirstName: formData.firstName,
      guestLastName: formData.lastName,
      guestEmail: formData.email,
      guestPhone: formData.phone,
      specialRequests: formData.specialRequests,
      arrivalTime: formData.arrivalTime,
      freeCancellation: room?.freeCancellation || property.freeCancellation,
      cancellationDeadline: room?.cancellationDeadline,
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);
    navigate(`/confirmation/${bookingId}`, { state: { booking } });
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '10px 12px',
    border: `2px solid ${errors[field] ? 'var(--bc-red)' : 'var(--bc-gray-border)'}`,
    borderRadius: 4, fontSize: 14, outline: 'none',
    background: errors[field] ? '#fff5f5' : 'white',
  });

  const ARRIVAL_TIMES = [
    '00:00 – 01:00', '01:00 – 02:00', '02:00 – 03:00', '03:00 – 04:00',
    '04:00 – 05:00', '05:00 – 06:00', '06:00 – 07:00', '07:00 – 08:00',
    '08:00 – 09:00', '09:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00',
    '12:00 – 13:00', '13:00 – 14:00', '14:00 – 15:00', '15:00 – 16:00',
    '16:00 – 17:00', '17:00 – 18:00', '18:00 – 19:00', '19:00 – 20:00',
    '20:00 – 21:00', '21:00 – 22:00', '22:00 – 23:00', '23:00 – 00:00',
    "I don't know",
  ];

  return (
    <div style={{ background: 'var(--bc-gray-bg)', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--bc-gray-border)', padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <Link to="/" style={{ color: 'var(--bc-blue)' }}>Home</Link>
          {' › '}
          <Link to={`/property/${property.id}`} style={{ color: 'var(--bc-blue)' }}>{property.name}</Link>
          {' › '}
          <span>Booking</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Confirm your booking</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' }}>
          {/* Left: Form */}
          <div>
            <form onSubmit={handleSubmit}>
              {/* Property summary */}
              <div style={{ background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <img
                    src={property.thumbnailUrl || property.photos?.[0]?.url}
                    alt={property.name}
                    style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{property.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--bc-text-medium)', marginBottom: 4 }}>📍 {property.city}</div>
                    {room && <div style={{ fontSize: 13, color: 'var(--bc-text-medium)' }}>{room.name}</div>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--bc-gray-border)', fontSize: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Check-in</div>
                    <div style={{ fontWeight: 700 }}>{checkIn || 'Not selected'}</div>
                    <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>From {property.checkInTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Check-out</div>
                    <div style={{ fontWeight: 700 }}>{checkOut || 'Not selected'}</div>
                    <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>Until {property.checkOutTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Duration</div>
                    <div style={{ fontWeight: 700 }}>{nightsCount} night{nightsCount !== 1 ? 's' : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Guests</div>
                    <div style={{ fontWeight: 700 }}>{adults || 2} adult{(adults || 2) !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <div style={{ background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>First name *</label>
                    <input
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      style={inputStyle('firstName')}
                    />
                    {errors.firstName && <div style={{ fontSize: 12, color: 'var(--bc-red)', marginTop: 4 }}>{errors.firstName}</div>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Last name *</label>
                    <input
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                      style={inputStyle('lastName')}
                    />
                    {errors.lastName && <div style={{ fontSize: 12, color: 'var(--bc-red)', marginTop: 4 }}>{errors.lastName}</div>}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Email address *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    style={inputStyle('email')}
                  />
                  {errors.email && <div style={{ fontSize: 12, color: 'var(--bc-red)', marginTop: 4 }}>{errors.email}</div>}
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginTop: 4 }}>Confirmation will be sent to this email</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Phone number *</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    style={inputStyle('phone')}
                  />
                  {errors.phone && <div style={{ fontSize: 12, color: 'var(--bc-red)', marginTop: 4 }}>{errors.phone}</div>}
                </div>
              </div>

              {/* Arrival time */}
              <div style={{ background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Arrival time</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: 12, background: 'var(--bc-blue-light)', borderRadius: 4 }}>
                  <span>🏨</span>
                  <span style={{ fontSize: 13 }}>Check-in from <strong>{property.checkInTime}</strong></span>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Your estimated arrival time</label>
                  <select
                    value={formData.arrivalTime}
                    onChange={e => setFormData(p => ({ ...p, arrivalTime: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', border: '2px solid var(--bc-gray-border)',
                      borderRadius: 4, fontSize: 14, background: 'white', outline: 'none',
                    }}
                  >
                    {ARRIVAL_TIMES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special requests */}
              <div style={{ background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Special requests</h2>
                <p style={{ fontSize: 13, color: 'var(--bc-text-medium)', marginBottom: 12 }}>
                  Special requests cannot be guaranteed, but the property will do its best to meet your needs.
                </p>
                <textarea
                  value={formData.specialRequests}
                  onChange={e => setFormData(p => ({ ...p, specialRequests: e.target.value }))}
                  placeholder="e.g., late check-in, high floor, extra pillows..."
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 12px', border: '2px solid var(--bc-gray-border)',
                    borderRadius: 4, fontSize: 14, resize: 'vertical', outline: 'none',
                  }}
                />
              </div>

              {/* Finalize */}
              <div style={{ background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8, padding: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Final step</h2>
                {room?.freeCancellation && (
                  <div style={{ background: '#f0fff0', border: '1px solid #c3e6cb', borderRadius: 4, padding: 12, marginBottom: 16, fontSize: 13 }}>
                    <strong style={{ color: 'var(--bc-green)' }}>✓ Free cancellation</strong>
                    {room.cancellationDeadline && ` until ${room.cancellationDeadline}`}
                  </div>
                )}
                <div style={{ fontSize: 13, color: 'var(--bc-text-medium)', marginBottom: 20 }}>
                  By completing this booking I acknowledge I have read and accept the{' '}
                  <button onClick={(e) => { e.preventDefault(); setLegalDialog('Rules and Restrictions'); }} style={{ color: 'var(--bc-blue)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}>Rules and Restrictions</button>,{' '}
                  <button onClick={(e) => { e.preventDefault(); setLegalDialog('Privacy Policy'); }} style={{ color: 'var(--bc-blue)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}>Privacy Policy</button>, and{' '}
                  <button onClick={(e) => { e.preventDefault(); setLegalDialog('Terms of Service'); }} style={{ color: 'var(--bc-blue)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}>Terms of Service</button>.
                </div>
                <button
                  type="submit"
                  style={{
                    background: 'var(--bc-blue)', color: 'white', border: 'none', borderRadius: 4,
                    padding: '14px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', width: '100%',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bc-blue-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bc-blue)'}
                >
                  Complete booking
                </button>
              </div>
            </form>
          </div>

          {/* Right: Price summary */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{ background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: 'var(--bc-blue-dark)', color: 'white', padding: '16px 20px' }}>
                <div style={{ fontSize: 13, marginBottom: 4 }}>Your price summary</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>US${grandTotal.toFixed(0)}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Total includes taxes and fees</div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12 }}>
                  <span>{nightsCount} night{nightsCount !== 1 ? 's' : ''} × US${roomPrice}</span>
                  <strong>US${subtotal.toFixed(0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12 }}>
                  <span>Taxes and charges</span>
                  <strong>US${taxes.toFixed(0)}</strong>
                </div>
                <div style={{ borderTop: '1px solid var(--bc-gray-border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                  <span>Total</span>
                  <span>US${grandTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Property info */}
              <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--bc-gray-border)', paddingTop: 16, fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{property.name}</div>
                <div style={{ color: 'var(--bc-text-medium)', marginBottom: 4 }}>📍 {property.city}</div>
                {room && <div style={{ color: 'var(--bc-text-medium)', marginBottom: 4 }}>{room.name}</div>}
                {property.freeCancellation && (
                  <div style={{ color: 'var(--bc-green)', fontWeight: 700, marginTop: 8 }}>✓ Free cancellation</div>
                )}
              </div>
            </div>
          </div>
        </div>
        {legalDialog && (
          <InfoDialog title={legalDialog} onClose={() => setLegalDialog(null)}>
            <p style={{ color: 'var(--bc-text-medium)', lineHeight: 1.6 }}>
              This sandbox copy explains the booking terms locally. Completing the booking creates a local reservation only, stores it in the current session, and does not contact an external payment or travel service.
            </p>
          </InfoDialog>
        )}
      </div>
    </div>
  );
};
