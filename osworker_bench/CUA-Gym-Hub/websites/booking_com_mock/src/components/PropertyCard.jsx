import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';

const Stars = ({ count }) => {
  if (!count) return null;
  return (
    <span style={{ color: '#f5a623', fontSize: 12 }} title={`${count}-star hotel`}>
      {'★'.repeat(count)}
    </span>
  );
};

export const PropertyCard = ({ property }) => {
  const { data, toggleSaveProperty } = useAppContext();
  const isSaved = data?.user?.savedProperties?.includes(property.id);

  const lowestPrice = property.pricePerNight;
  const isDiscounted = property.originalPrice && property.originalPrice > property.pricePerNight;

  const scoreColor = (score) => {
    if (score >= 9) return '#003580';
    if (score >= 8) return '#1a669a';
    if (score >= 7) return '#4a86b8';
    return '#6b9ec8';
  };

  const scoreWord = (score) => {
    if (score >= 9.5) return 'Exceptional';
    if (score >= 9) return 'Superb';
    if (score >= 8.5) return 'Fabulous';
    if (score >= 8) return 'Very good';
    if (score >= 7) return 'Good';
    return 'Pleasant';
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveProperty(property.id);
  };

  const propTypeLabel = {
    hotel: 'Hotel',
    apartment: 'Apartment',
    resort: 'Resort',
    villa: 'Villa',
    hostel: 'Hostel',
    guesthouse: 'Guest house',
  }[property.type] || property.type;

  return (
    <Link
      to={`/property/${property.id}`}
      style={{
        display: 'flex',
        gap: 0,
        border: '1px solid var(--bc-gray-border)',
        borderRadius: 8,
        overflow: 'hidden',
        background: 'white',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: 200, flexShrink: 0, minHeight: 140 }}>
        <img
          src={property.thumbnailUrl}
          alt={property.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 140 }}
        />
        {/* Save heart */}
        <button
          onClick={handleSave}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            lineHeight: 1,
            color: isSaved ? 'var(--bc-blue-dark)' : 'rgba(255,255,255,0.9)',
            textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}
          title={isSaved ? 'Remove from saved' : 'Save property'}
        >
          {isSaved ? '♥' : '♡'}
        </button>
        {property.genius && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            background: 'var(--bc-blue-dark)',
            color: 'var(--bc-yellow)',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
          }}>
            Genius
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Name */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--bc-blue)', margin: 0 }}>
                {property.name}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <Stars count={property.stars} />
              <span style={{ fontSize: 12, color: 'var(--bc-text-medium)' }}>{propTypeLabel}</span>
              {property.sustainability && (
                <span style={{ fontSize: 11, color: '#4caf50', fontWeight: 600 }}>♻ Sustainable</span>
              )}
            </div>
          </div>
          {/* Score */}
          {property.reviewScore && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{scoreWord(property.reviewScore)}</div>
                  <div style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>{property.reviewCount.toLocaleString()} reviews</div>
                </div>
                <div style={{
                  background: scoreColor(property.reviewScore),
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: '6px 6px 6px 0',
                  padding: '4px 8px',
                  minWidth: 36,
                  textAlign: 'center',
                }}>
                  {property.reviewScore.toFixed(1)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div style={{ fontSize: 12, color: 'var(--bc-text-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>📍</span>
          <span>{property.city}, {property.country}</span>
          <span style={{ color: 'var(--bc-blue)', fontWeight: 600, marginLeft: 4 }}>– {property.distanceFromCenter}</span>
        </div>

        {/* Short description */}
        <p style={{ fontSize: 12, color: 'var(--bc-text-medium)', marginTop: 4, lineHeight: 1.4 }}>
          {property.shortDescription}
        </p>

        {/* Facilities */}
        {property.popularFacilities && property.popularFacilities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {property.popularFacilities.slice(0, 3).map(fac => (
              <span key={fac} style={{
                fontSize: 11,
                background: 'var(--bc-blue-light)',
                color: 'var(--bc-blue)',
                padding: '2px 6px',
                borderRadius: 3,
              }}>{fac}</span>
            ))}
          </div>
        )}

        {/* Price + cancellation */}
        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            {property.freeCancellation && (
              <div style={{ fontSize: 12, color: 'var(--bc-green)', fontWeight: 700 }}>✓ Free cancellation</div>
            )}
            {property.breakfastIncluded && (
              <div style={{ fontSize: 12, color: 'var(--bc-green)', fontWeight: 700 }}>✓ Breakfast included</div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            {isDiscounted && (
              <div style={{ fontSize: 12, color: 'var(--bc-red)', textDecoration: 'line-through' }}>
                US${property.originalPrice}
              </div>
            )}
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--bc-text-dark)' }}>
              US${lowestPrice}
            </div>
            <div style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>per night</div>
            <div style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>
              +US${property.taxesAndFees} taxes and fees
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
