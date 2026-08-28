import React, { useState } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';

export const Confirmation = () => {
  const location = useLocation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { data, cancelBooking } = useAppContext();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Try to get booking from navigation state first, then from stored bookings
  let booking = location.state?.booking;
  if (!booking && bookingId && data?.bookings) {
    booking = data.bookings.find(b => b.id === bookingId);
  }

  if (!booking) {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: 'var(--bc-gray-bg)', minHeight: '100vh' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Booking not found</h2>
        <p style={{ color: 'var(--bc-text-medium)', marginBottom: 24 }}>
          We couldn't find the booking you're looking for.
        </p>
        <Link
          to="/"
          style={{
            background: 'var(--bc-blue)', color: 'white', padding: '12px 24px',
            borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}
        >
          Go to homepage
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const guestName = booking.guestFirstName
    ? `${booking.guestFirstName} ${booking.guestLastName || ''}`.trim()
    : 'Guest';

  const downloadReceipt = () => {
    const receipt = [
      'Xooking.com sandbox confirmation',
      `Confirmation number: ${booking.confirmationNumber}`,
      `PIN code: ${booking.pinCode}`,
      `Guest: ${guestName}`,
      `Property: ${booking.propertyName}`,
      `Room: ${booking.roomName || 'Selected room'}`,
      `Check-in: ${formatDate(booking.checkIn)}`,
      `Check-out: ${formatDate(booking.checkOut)}`,
      `Total: US$${(booking.grandTotal || 0).toFixed(0)}`,
      `Status: ${booking.status}`,
    ].join('\n');
    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking-${booking.confirmationNumber || booking.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: 'var(--bc-gray-bg)', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Dark blue confirmation header */}
      <div style={{ background: 'var(--bc-blue-dark)', color: 'white', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={{
            width: 56, height: 56, background: '#008009', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0,
          }}>
            ✓
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
              Thanks, {guestName}! Your booking is confirmed.
            </h1>
            <p style={{ fontSize: 15, opacity: 0.85 }}>
              Your booking confirmation has been sent to{' '}
              <strong>{booking.guestEmail || 'your email address'}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        {/* Confirmation codes card */}
        <div style={{
          background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8,
          padding: 24, marginBottom: 20,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
        }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--bc-text-medium)', marginBottom: 6 }}>Booking confirmation number</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--bc-blue-dark)', letterSpacing: 1 }}>
              {booking.confirmationNumber}
            </div>
            <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginTop: 4 }}>
              Use this number when contacting the property
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--bc-text-medium)', marginBottom: 6 }}>PIN code</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--bc-blue-dark)', letterSpacing: 4 }}>
              {booking.pinCode}
            </div>
            <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginTop: 4 }}>
              Keep this code safe — it proves you made this booking
            </div>
          </div>
        </div>

        {/* Main booking details */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'flex-start',
        }}>
          {/* Left: Property and stay details */}
          <div>
            {/* Property info */}
            <div style={{
              background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8,
              padding: 24, marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your booking details</h2>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                {booking.propertyImage && (
                  <img
                    src={booking.propertyImage}
                    alt={booking.propertyName}
                    style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{booking.propertyName}</div>
                  {booking.propertyCity && (
                    <div style={{ fontSize: 13, color: 'var(--bc-text-medium)', marginBottom: 2 }}>
                      📍 {booking.propertyCity}
                    </div>
                  )}
                  {booking.roomName && (
                    <div style={{ fontSize: 13, color: 'var(--bc-text-medium)' }}>{booking.roomName}</div>
                  )}
                </div>
              </div>

              {/* Dates and guests grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
                paddingTop: 16, borderTop: '1px solid var(--bc-gray-border)',
              }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Check-in</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{formatDate(booking.checkIn)}</div>
                  {booking.freeCancellation && (
                    <div style={{ fontSize: 12, color: 'var(--bc-green)', fontWeight: 700, marginTop: 2 }}>
                      ✓ Free cancellation available
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Check-out</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{formatDate(booking.checkOut)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Duration</div>
                  <div style={{ fontWeight: 700 }}>
                    {booking.nights} night{booking.nights !== 1 ? 's' : ''}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Guests</div>
                  <div style={{ fontWeight: 700 }}>
                    {booking.guests?.adults || 2} adult{(booking.guests?.adults || 2) !== 1 ? 's' : ''}
                    {booking.guests?.children > 0 ? `, ${booking.guests.children} child${booking.guests.children !== 1 ? 'ren' : ''}` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Guest info */}
            <div style={{
              background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8,
              padding: 24, marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Name</div>
                  <div style={{ fontWeight: 600 }}>{guestName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Email</div>
                  <div style={{ fontWeight: 600 }}>{booking.guestEmail}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Phone</div>
                  <div style={{ fontWeight: 600 }}>{booking.guestPhone || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Estimated arrival</div>
                  <div style={{ fontWeight: 600 }}>{booking.arrivalTime || '—'}</div>
                </div>
              </div>
              {booking.specialRequests && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--bc-gray-border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 4 }}>Special requests</div>
                  <div style={{ fontSize: 14, color: 'var(--bc-text-medium)' }}>{booking.specialRequests}</div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link
                to="/mytrips"
                style={{
                  background: 'var(--bc-blue)', color: 'white', padding: '12px 24px',
                  borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none',
                }}
              >
                Manage booking
              </Link>
              <Link
                to="/search"
                style={{
                  background: 'white', color: 'var(--bc-blue)', padding: '12px 24px',
                  borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  border: '2px solid var(--bc-blue)',
                }}
              >
                Find another stay
              </Link>
              <button
                type="button"
                onClick={downloadReceipt}
                style={{
                  background: 'white', color: 'var(--bc-blue)', padding: '12px 24px',
                  borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  border: '2px solid var(--bc-blue)',
                }}
              >
                Download confirmation
              </button>
              {booking.status !== 'cancelled' && (
                <button
                  onClick={() => setShowCancelDialog(true)}
                  style={{
                    background: 'white', color: 'var(--bc-red)', padding: '12px 24px',
                    borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    border: '2px solid var(--bc-red)',
                  }}
                >
                  Cancel your booking
                </button>
              )}
            </div>

            {/* Cancel confirmation dialog */}
            {showCancelDialog && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 1000,
              }}>
                <div style={{
                  background: 'white', borderRadius: 8, padding: 32, maxWidth: 440, width: '90%',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Cancel your booking</h2>
                  <p style={{ fontSize: 14, color: 'var(--bc-text-medium)', marginBottom: 24 }}>
                    Are you sure you want to cancel this booking? This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => {
                        cancelBooking(bookingId || booking.id);
                        navigate('/mytrips');
                      }}
                      style={{
                        flex: 1, background: 'var(--bc-red)', color: 'white', border: 'none',
                        borderRadius: 4, padding: '12px 16px', fontWeight: 700, fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      Yes, cancel booking
                    </button>
                    <button
                      onClick={() => setShowCancelDialog(false)}
                      style={{
                        flex: 1, background: 'white', color: 'var(--bc-text-dark)',
                        border: '2px solid var(--bc-gray-border)', borderRadius: 4,
                        padding: '12px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}
                    >
                      No, keep booking
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Price summary */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{
              background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8, overflow: 'hidden',
            }}>
              <div style={{ background: 'var(--bc-blue-dark)', color: 'white', padding: '16px 20px' }}>
                <div style={{ fontSize: 13, marginBottom: 4 }}>Price summary</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>US${(booking.grandTotal || 0).toFixed(0)}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Includes taxes and fees</div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12 }}>
                  <span>{booking.nights} night{booking.nights !== 1 ? 's' : ''} × US${booking.pricePerNight}</span>
                  <strong>US${(booking.totalPrice || 0).toFixed(0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12 }}>
                  <span>Taxes and charges</span>
                  <strong>US${(booking.taxesAndFees || 0).toFixed(0)}</strong>
                </div>
                <div style={{
                  borderTop: '1px solid var(--bc-gray-border)', paddingTop: 12,
                  display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16,
                }}>
                  <span>Total</span>
                  <span>US${(booking.grandTotal || 0).toFixed(0)}</span>
                </div>
              </div>

              {/* Checklist */}
              <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--bc-gray-border)', paddingTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>What's confirmed</div>
                {[
                  'Booking confirmed instantly',
                  'Confirmation email sent',
                  'No payment needed today',
                  booking.freeCancellation && 'Free cancellation',
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: 'var(--bc-green)', fontWeight: 700 }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
