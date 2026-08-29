import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';

const STATUS_TABS = ['upcoming', 'completed', 'cancelled'];

const getStatusLabel = (status) => {
  switch (status) {
    case 'confirmed': return 'Confirmed';
    case 'cancelled': return 'Cancelled';
    case 'completed': return 'Completed';
    default: return status;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return { color: 'var(--bc-green)', background: '#f0fff0', border: '1px solid #c3e6cb' };
    case 'completed': return { color: 'var(--bc-blue)', background: '#e8f3fc', border: '1px solid #b8daff' };
    case 'cancelled': return { color: 'var(--bc-red)', background: '#fff5f5', border: '1px solid #f5c6cb' };
    default: return { color: 'var(--bc-text-medium)', background: 'var(--bc-gray-light)', border: '1px solid var(--bc-gray-border)' };
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const Trips = () => {
  const { data, cancelBooking } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const now = new Date();
  const allBookings = [...(data.bookings || [])].reverse();

  const filterBookings = (tab) => {
    return allBookings.filter(b => {
      if (tab === 'cancelled') return b.status === 'cancelled';
      if (tab === 'completed') {
        if (b.status === 'completed') return true;
        const checkOut = b.checkOut ? new Date(b.checkOut) : null;
        return b.status === 'confirmed' && checkOut && checkOut < now;
      }
      // upcoming: confirmed and future checkout
      const checkOut = b.checkOut ? new Date(b.checkOut) : null;
      return b.status === 'confirmed' && (!checkOut || checkOut >= now);
    });
  };

  const tabBookings = filterBookings(activeTab);

  const handleCancel = (bookingId) => {
    setCancellingId(bookingId);
    setTimeout(() => {
      cancelBooking(bookingId);
      setCancellingId(null);
      setBookingToCancel(null);
    }, 300);
  };

  const tabCounts = {
    upcoming: filterBookings('upcoming').length,
    completed: filterBookings('completed').length,
    cancelled: filterBookings('cancelled').length,
  };

  return (
    <div style={{ background: 'var(--bc-gray-bg)', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Page header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--bc-gray-border)', padding: '24px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>My bookings</h1>
          <p style={{ fontSize: 14, color: 'var(--bc-text-medium)' }}>
            Manage and track all your bookings in one place
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        {/* Tabs */}
        <div style={{
          background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8,
          overflow: 'hidden', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--bc-gray-border)' }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                style={{
                  padding: '14px 20px',
                  fontSize: 14,
                  fontWeight: activeTab === tab ? 700 : 400,
                  color: activeTab === tab ? 'var(--bc-blue)' : 'var(--bc-text-medium)',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--bc-blue)' : '2px solid transparent',
                  marginBottom: -1,
                  background: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tabCounts[tab] > 0 && (
                  <span aria-hidden="true" style={{
                    marginLeft: 6, background: activeTab === tab ? 'var(--bc-blue)' : 'var(--bc-gray-border)',
                    color: activeTab === tab ? 'white' : 'var(--bc-text-medium)',
                    borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 700,
                  }}>
                    {tabCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bookings list */}
          {tabBookings.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {activeTab === 'upcoming' ? '🧳' : activeTab === 'completed' ? '✈️' : '❌'}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                {activeTab === 'upcoming' ? 'No upcoming trips' :
                  activeTab === 'completed' ? 'No completed trips' : 'No cancelled bookings'}
              </h2>
              <p style={{ fontSize: 14, color: 'var(--bc-text-medium)', marginBottom: 24 }}>
                {activeTab === 'upcoming' ? "Time to plan your next adventure!" :
                  activeTab === 'completed' ? "Your past trips will appear here." :
                  "You haven't cancelled any bookings."}
              </p>
              {activeTab === 'upcoming' && (
                <Link
                  to="/search"
                  style={{
                    background: 'var(--bc-blue)', color: 'white', padding: '12px 24px',
                    borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none',
                  }}
                >
                  Find a stay
                </Link>
              )}
            </div>
          ) : (
            <div>
              {tabBookings.map((booking, idx) => {
                const statusStyle = getStatusColor(booking.status);
                const isLast = idx === tabBookings.length - 1;

                return (
                  <div
                    key={booking.id}
                    style={{
                      display: 'flex',
                      gap: 0,
                      borderBottom: isLast ? 'none' : '1px solid var(--bc-gray-border)',
                    }}
                  >
                    {/* Property image */}
                    <div style={{ width: 180, flexShrink: 0, position: 'relative' }}>
                      <img
                        src={booking.propertyImage || `https://picsum.photos/seed/${booking.propertyId}/180/120`}
                        alt={booking.propertyName}
                        style={{ width: '100%', height: '100%', minHeight: 120, objectFit: 'cover' }}
                      />
                    </div>

                    {/* Booking info */}
                    <div style={{ flex: 1, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                              {booking.propertyName}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--bc-text-medium)' }}>
                              📍 {booking.propertyCity || booking.propertyAddress}
                            </div>
                            {booking.roomName && (
                              <div style={{ fontSize: 13, color: 'var(--bc-text-medium)', marginTop: 2 }}>
                                {booking.roomName}
                              </div>
                            )}
                          </div>
                          <span style={{
                            fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 4,
                            ...statusStyle, whiteSpace: 'nowrap',
                          }}>
                            {getStatusLabel(booking.status)}
                          </span>
                        </div>

                        {/* Dates and guests */}
                        <div style={{ display: 'flex', gap: 24, fontSize: 13, marginBottom: 12 }}>
                          <div>
                            <div style={{ color: 'var(--bc-text-light)', marginBottom: 2 }}>Check-in</div>
                            <div style={{ fontWeight: 600 }}>{formatDate(booking.checkIn)}</div>
                          </div>
                          <div style={{ color: 'var(--bc-gray-border)', alignSelf: 'center', fontSize: 18 }}>→</div>
                          <div>
                            <div style={{ color: 'var(--bc-text-light)', marginBottom: 2 }}>Check-out</div>
                            <div style={{ fontWeight: 600 }}>{formatDate(booking.checkOut)}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--bc-text-light)', marginBottom: 2 }}>Duration</div>
                            <div style={{ fontWeight: 600 }}>
                              {booking.nights} night{booking.nights !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--bc-text-light)', marginBottom: 2 }}>Guests</div>
                            <div style={{ fontWeight: 600 }}>
                              {booking.guests?.adults || 2} adult{(booking.guests?.adults || 2) !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        {/* Confirmation number */}
                        <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>
                          Confirmation: <strong style={{ color: 'var(--bc-text-dark)' }}>{booking.confirmationNumber}</strong>
                          {booking.pinCode && (
                            <> &nbsp;·&nbsp; PIN: <strong style={{ color: 'var(--bc-text-dark)' }}>{booking.pinCode}</strong></>
                          )}
                        </div>
                      </div>

                      {/* Price + actions */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                          US${(booking.grandTotal || 0).toFixed(0)}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--bc-text-light)', marginBottom: 16 }}>
                          Includes taxes
                        </div>

                        {booking.status !== 'cancelled' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Link
                              to={`/confirmation/${booking.id}`}
                              style={{
                                display: 'block', background: 'var(--bc-blue)', color: 'white',
                                padding: '8px 16px', borderRadius: 4, fontWeight: 700, fontSize: 13,
                                textDecoration: 'none', textAlign: 'center',
                              }}
                            >
                              View details
                            </Link>
                            <button
                              onClick={() => setBookingToCancel(booking)}
                              style={{
                                background: 'white', color: 'var(--bc-red)', border: '2px solid var(--bc-red)',
                                padding: '7px 16px', borderRadius: 4, fontWeight: 700, fontSize: 13,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel booking
                            </button>
                          </div>
                        )}

                        {booking.status === 'cancelled' && (
                          <Link
                            to={`/property/${booking.propertyId}`}
                            style={{
                              display: 'block', background: 'white', color: 'var(--bc-blue)',
                              border: '2px solid var(--bc-blue)', padding: '8px 16px', borderRadius: 4,
                              fontWeight: 700, fontSize: 13, textDecoration: 'none', textAlign: 'center',
                            }}
                          >
                            Book again
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {bookingToCancel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 8, maxWidth: 460, width: '100%', padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Cancel booking?</h2>
            <p style={{ fontSize: 14, color: 'var(--bc-text-medium)', lineHeight: 1.5, marginBottom: 16 }}>
              Cancel your stay at <strong>{bookingToCancel.propertyName}</strong>. The booking will move to the Cancelled tab and stay visible in your trip history.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setBookingToCancel(null)}
                style={{ background: 'white', color: 'var(--bc-blue)', border: '2px solid var(--bc-blue)', borderRadius: 4, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={() => handleCancel(bookingToCancel.id)}
                style={{ background: 'var(--bc-red)', color: 'white', border: '2px solid var(--bc-red)', borderRadius: 4, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', opacity: cancellingId === bookingToCancel.id ? 0.7 : 1 }}
              >
                {cancellingId === bookingToCancel.id ? 'Cancelling...' : 'Cancel booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
