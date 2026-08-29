import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';
import { InfoDialog } from '../components/InfoDialog';

const Stars = ({ count }) => {
  if (!count) return null;
  return <span style={{ color: '#f5a623', fontSize: 14 }}>{'★'.repeat(count)}</span>;
};

const ScoreBadge = ({ score, large }) => {
  const size = large ? 44 : 34;
  return (
    <div style={{
      background: '#003580',
      color: 'white',
      fontWeight: 700,
      fontSize: large ? 18 : 14,
      borderRadius: '8px 8px 8px 0',
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {score?.toFixed(1)}
    </div>
  );
};

const FACILITY_ICONS = {
  free_wifi: '📶',
  pool: '🏊',
  spa: '💆',
  fitness: '🏋️',
  restaurant: '🍽️',
  bar: '🍸',
  parking: '🅿️',
  room_service: '🛎️',
  kitchen: '🍳',
  washer: '👕',
  air_conditioning: '❄️',
  non_smoking: '🚭',
  garden: '🌿',
  terrace: '🏡',
  breakfast: '🥐',
  pets: '🐾',
  '24h_front_desk': '🏨',
  concierge: '🎩',
  airport_shuttle: '🚌',
  private_beach: '🏖️',
  balcony: '🌄',
  kids_club: '🎢',
  water_sports: '🏄',
  locker: '🔒',
  bicycle_rental: '🚲',
  shared_kitchen: '🍳',
  valet_parking: '🚗',
  tennis: '🎾',
};

export const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, viewProperty, toggleSaveProperty } = useAppContext();

  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [dateError, setDateError] = useState(false);

  const property = data?.properties?.find(p => p.id === id);

  // Mark as viewed — inside useEffect to avoid setState-during-render warning
  useEffect(() => {
    if (property) {
      viewProperty(property.id);
    }
  }, [property?.id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Property not found</h2>
        <Link to="/search" style={{ color: 'var(--bc-blue)' }}>Back to search</Link>
      </div>
    );
  }

  const isSaved = data?.user?.savedProperties?.includes(property.id);
  const rooms_list = data?.rooms?.filter(r => r.propertyId === property.id) || [];
  const reviews = data?.reviews?.filter(r => r.propertyId === property.id) || [];
  const reviewCategories = data?.reviewCategories?.[property.id] || {};

  const selectedRoom = rooms_list.find(r => r.id === selectedRoomId) || rooms_list[0];

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    return Math.max(0, diff);
  };

  const nights = calculateNights();

  const handleBookNow = () => {
    if (!selectedRoom) return;
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      setDateError(true);
      return;
    }
    const bookingState = {
      property,
      room: selectedRoom,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      nights: nights || 1,
      adults,
      children,
      rooms,
    };
    navigate('/checkout', { state: { bookingState } });
  };

  const scoreWord = (score) => {
    if (!score) return '';
    if (score >= 9.5) return 'Exceptional';
    if (score >= 9) return 'Superb';
    if (score >= 8.5) return 'Fabulous';
    if (score >= 8) return 'Very good';
    if (score >= 7) return 'Good';
    return 'Pleasant';
  };

  // All photos gallery modal
  if (showAllPhotos) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, overflow: 'auto', padding: 20 }}>
        <button
          onClick={() => setShowAllPhotos(false)}
          style={{
            position: 'fixed', top: 16, right: 16, background: 'white', border: 'none', borderRadius: '50%',
            width: 36, height: 36, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
        <div style={{ maxWidth: 900, margin: '40px auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {property.photos?.map((photo, i) => (
            <div key={photo.id}>
              <img src={photo.url} alt={photo.caption} style={{ width: '100%', borderRadius: 4 }} />
              {photo.caption && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4, textAlign: 'center' }}>{photo.caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const photos = property.photos || [];

  return (
    <>
    <div>
      {/* Breadcrumb */}
      <div style={{ background: 'var(--bc-gray-bg)', borderBottom: '1px solid var(--bc-gray-border)', padding: '8px 0' }}>
        <div className="container" style={{ fontSize: 13, color: 'var(--bc-text-medium)' }}>
          <Link to="/" style={{ color: 'var(--bc-blue)' }}>Home</Link>
          {' › '}
          <Link to="/search" style={{ color: 'var(--bc-blue)' }}>Hotels</Link>
          {' › '}
          <Link to={`/search?destination=${encodeURIComponent(property.city)}`} style={{ color: 'var(--bc-blue)' }}>
            {property.city}
          </Link>
          {' › '}
          <span>{property.name}</span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
        {/* Property header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{property.name}</h1>
              <Stars count={property.stars} />
              {property.genius && (
                <span style={{ background: 'var(--bc-blue-dark)', color: 'var(--bc-yellow)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 3 }}>
                  Genius
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--bc-blue)', flexWrap: 'wrap' }}>
              <span>📍</span>
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{property.address}</span>
              <span style={{ background: '#e8f3fc', color: 'var(--bc-blue)', padding: '2px 6px', borderRadius: 3, fontSize: 11, fontWeight: 700 }}>
                Excellent location – {property.distanceFromCenter}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => toggleSaveProperty(property.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                border: '1px solid var(--bc-gray-border)', borderRadius: 4, background: 'white',
                color: isSaved ? 'var(--bc-red)' : 'var(--bc-text-dark)',
                fontSize: 14, cursor: 'pointer',
              }}
            >
              {isSaved ? '♥' : '♡'} {isSaved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleBookNow}
              style={{
                background: 'var(--bc-blue)', color: 'white', border: 'none', borderRadius: 4,
                padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              Reserve
            </button>
          </div>
        </div>

        {/* Photo gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 4, height: 400, marginBottom: 24, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
          {photos.slice(0, 5).map((photo, i) => (
            <div
              key={photo.id}
              onClick={() => { setSelectedPhoto(i); setShowAllPhotos(true); }}
              style={{
                gridColumn: i === 0 ? '1 / 2' : undefined,
                gridRow: i === 0 ? '1 / 3' : undefined,
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <img
                src={photo.url}
                alt={photo.caption}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              />
            </div>
          ))}
          {photos.length > 5 && (
            <button
              onClick={() => setShowAllPhotos(true)}
              style={{
                position: 'absolute', bottom: 12, right: 12,
                background: 'white', border: '2px solid var(--bc-text-dark)',
                borderRadius: 4, padding: '6px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              See all {photos.length} photos
            </button>
          )}
        </div>

        {/* Main content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
          {/* Left column */}
          <div>
            {/* Score + highlights */}
            <div style={{ border: '1px solid var(--bc-gray-border)', borderRadius: 8, padding: 20, marginBottom: 24, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <ScoreBadge score={property.reviewScore} large />
                <div style={{ fontWeight: 700, fontSize: 16 }}>{scoreWord(property.reviewScore)}</div>
                <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>{property.reviewCount?.toLocaleString()} reviews</div>
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {Object.entries(reviewCategories).map(([key, val]) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <strong>{val.toFixed(1)}</strong>
                    </div>
                    <div style={{ height: 4, background: '#e8e8e8', borderRadius: 2 }}>
                      <div style={{ height: '100%', background: 'var(--bc-blue-dark)', borderRadius: 2, width: `${(val / 10) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>About this property</h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--bc-text-dark)' }}>{property.description}</p>
            </div>

            {/* Popular facilities */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Most popular facilities</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {property.facilities?.slice(0, 12).map(fac => (
                  <div key={fac} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--bc-gray-light)', padding: '6px 12px',
                    borderRadius: 4, fontSize: 13,
                  }}>
                    <span>{FACILITY_ICONS[fac] || '✓'}</span>
                    <span style={{ textTransform: 'capitalize' }}>{fac.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available rooms */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Available rooms</h2>

              {/* Date inputs for rooms */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    style={{ padding: '8px 12px', border: '2px solid var(--bc-blue)', borderRadius: 4, fontSize: 14 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    style={{ padding: '8px 12px', border: '2px solid var(--bc-blue)', borderRadius: 4, fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bc-blue-dark)', color: 'white' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Room type</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Guests</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Today's price</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Conditions</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Select rooms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms_list.map((room, i) => (
                      <tr key={room.id} style={{ background: i % 2 === 0 ? 'white' : '#fafafa', borderBottom: '1px solid var(--bc-gray-border)' }}>
                        <td style={{ padding: '12px', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 700, color: 'var(--bc-blue)', marginBottom: 4 }}>{room.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--bc-text-medium)', marginBottom: 4 }}>{room.size} · {room.bedType}</div>
                          {room.view && <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>🌄 {room.view}</div>}
                          {room.breakfastIncluded && <div style={{ fontSize: 12, color: 'var(--bc-green)', fontWeight: 700 }}>✓ Breakfast included</div>}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            {Array.from({ length: room.maxGuests }).map((_, j) => <span key={j}>👤</span>)}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>{room.maxGuests} max</div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>
                          {room.originalPrice && room.originalPrice > room.pricePerNight && (
                            <div style={{ fontSize: 11, color: 'var(--bc-red)', textDecoration: 'line-through' }}>
                              US${room.originalPrice}
                            </div>
                          )}
                          <div style={{ fontWeight: 700, fontSize: 16 }}>US${room.pricePerNight}</div>
                          <div style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>per night</div>
                          {nights > 0 && (
                            <div style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>
                              Total: US${room.pricePerNight * nights}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'left', verticalAlign: 'top' }}>
                          {room.freeCancellation ? (
                            <div style={{ fontSize: 12, color: 'var(--bc-green)', fontWeight: 700 }}>✓ Free cancellation</div>
                          ) : (
                            <div style={{ fontSize: 12, color: 'var(--bc-red)' }}>✗ Non-refundable</div>
                          )}
                          <div style={{ fontSize: 12, color: 'var(--bc-text-medium)' }}>
                            {room.prepayment === 'no_prepayment' ? 'No prepayment needed' : 'Prepayment required'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>
                            {room.availableCount} left at this price
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', verticalAlign: 'top' }}>
                          <button
                            onClick={() => {
                              setSelectedRoomId(room.id);
                              // Pass room directly to avoid race condition with stale state
                              const bookingState = {
                                property,
                                room,
                                checkIn: checkIn || null,
                                checkOut: checkOut || null,
                                nights: nights || 1,
                                adults,
                                children,
                                rooms,
                              };
                              navigate('/checkout', { state: { bookingState } });
                            }}
                            style={{
                              background: 'var(--bc-blue)', color: 'white', border: 'none', borderRadius: 4,
                              padding: '10px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                          >
                            I'll reserve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reviews */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Guest reviews</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ScoreBadge score={property.reviewScore} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{scoreWord(property.reviewScore)}</div>
                    <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>{property.reviewCount?.toLocaleString()} reviews</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {reviews.slice(0, 4).map(review => (
                  <div key={review.id} style={{ border: '1px solid var(--bc-gray-border)', borderRadius: 8, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 36, height: 36, background: 'var(--bc-blue)', color: 'white',
                          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 14,
                        }}>
                          {review.authorName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{review.authorName}</div>
                          <div style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>{review.authorCountry}</div>
                        </div>
                      </div>
                      <div style={{
                        background: 'var(--bc-blue-dark)', color: 'white', fontWeight: 700, fontSize: 13,
                        borderRadius: '6px 6px 6px 0', padding: '3px 7px',
                      }}>
                        {review.score.toFixed(1)}
                      </div>
                    </div>
                    {review.title && <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>"{review.title}"</div>}
                    {review.positive && (
                      <p style={{ fontSize: 12, color: 'var(--bc-text-dark)', lineHeight: 1.5, marginBottom: 4 }}>
                        <span style={{ color: 'var(--bc-green)', fontWeight: 700 }}>+ </span>{review.positive}
                      </p>
                    )}
                    {review.negative && (
                      <p style={{ fontSize: 12, color: 'var(--bc-text-medium)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--bc-red)', fontWeight: 700 }}>- </span>{review.negative}
                      </p>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--bc-text-light)', marginTop: 8 }}>
                      Stayed {review.nightsStayed} night{review.nightsStayed !== 1 ? 's' : ''} · {review.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Property info */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Property information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, fontSize: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Check-in</div>
                  <div style={{ color: 'var(--bc-text-medium)' }}>From {property.checkInTime}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Check-out</div>
                  <div style={{ color: 'var(--bc-text-medium)' }}>Until {property.checkOutTime}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Pets</div>
                  <div style={{ color: 'var(--bc-text-medium)' }}>{property.petsAllowed ? 'Pets allowed' : 'Pets not allowed'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Smoking</div>
                  <div style={{ color: 'var(--bc-text-medium)' }}>{property.smokingAllowed ? 'Smoking allowed' : 'Non-smoking property'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{ border: '2px solid var(--bc-blue)', borderRadius: 8, padding: 20, background: 'white' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--bc-text-light)', marginBottom: 4 }}>From</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>US${property.pricePerNight}</div>
                <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>per night</div>
                {property.taxesAndFees && (
                  <div style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>+US${property.taxesAndFees} taxes and fees</div>
                )}
              </div>

              {/* Score */}
              {property.reviewScore && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 0', borderTop: '1px solid var(--bc-gray-border)', borderBottom: '1px solid var(--bc-gray-border)' }}>
                  <ScoreBadge score={property.reviewScore} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{scoreWord(property.reviewScore)}</div>
                    <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>{property.reviewCount?.toLocaleString()} reviews</div>
                  </div>
                </div>
              )}

              {property.freeCancellation && (
                <div style={{ color: 'var(--bc-green)', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  ✓ Free cancellation available
                </div>
              )}
              {property.breakfastIncluded && (
                <div style={{ color: 'var(--bc-green)', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  ✓ Breakfast included
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Check-in date</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '2px solid var(--bc-gray-border)', borderRadius: 4, fontSize: 14 }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>Check-out date</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '2px solid var(--bc-gray-border)', borderRadius: 4, fontSize: 14 }}
                />
              </div>

              {nights > 0 && selectedRoom && (
                <div style={{ background: 'var(--bc-gray-bg)', borderRadius: 4, padding: 12, marginBottom: 16, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>US${selectedRoom.pricePerNight} × {nights} nights</span>
                    <strong>US${selectedRoom.pricePerNight * nights}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Taxes and fees</span>
                    <strong>US${property.taxesAndFees * nights}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--bc-gray-border)', paddingTop: 8, marginTop: 8 }}>
                    <span>Total</span>
                    <span>US${selectedRoom.pricePerNight * nights + property.taxesAndFees * nights}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                style={{
                  width: '100%', background: 'var(--bc-blue)', color: 'white', border: 'none',
                  borderRadius: 4, padding: '14px', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bc-blue-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bc-blue)'}
              >
                Reserve
              </button>
              <p style={{ fontSize: 11, color: 'var(--bc-text-light)', textAlign: 'center', marginTop: 8 }}>
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    {dateError && (
      <InfoDialog title="Adjust your dates" onClose={() => setDateError(false)}>
        <p style={{ color: 'var(--bc-text-medium)', lineHeight: 1.6 }}>
          Check-out must be after check-in. Choose a later check-out date to continue to checkout.
        </p>
      </InfoDialog>
    )}
    </>
  );
};
