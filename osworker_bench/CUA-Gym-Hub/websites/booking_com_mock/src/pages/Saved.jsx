import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';

const getScoreWord = (score) => {
  if (score >= 9) return 'Exceptional';
  if (score >= 8.5) return 'Superb';
  if (score >= 8) return 'Fabulous';
  if (score >= 7.5) return 'Very good';
  if (score >= 7) return 'Good';
  return 'Reviewed';
};

export const Saved = () => {
  const { data, toggleSaveProperty } = useAppContext();
  const navigate = useNavigate();

  const savedProperties = useMemo(() => {
    if (!data?.properties || !data?.user?.savedProperties) return [];
    return data.properties.filter(p => data.user.savedProperties.includes(p.id));
  }, [data?.properties, data?.user?.savedProperties]);

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bc-gray-bg)', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Page header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--bc-gray-border)', padding: '24px 0' }}>
        <div className="container">
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Saved</h1>
          <p style={{ fontSize: 14, color: 'var(--bc-text-medium)' }}>
            {savedProperties.length} saved propert{savedProperties.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        {savedProperties.length === 0 ? (
          <div style={{
            background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8,
            padding: 60, textAlign: 'center',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>♡</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No saved properties yet</h2>
            <p style={{ fontSize: 14, color: 'var(--bc-text-medium)', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px' }}>
              Save properties you love by clicking the heart icon on any property listing.
            </p>
            <Link
              to="/search"
              style={{
                background: 'var(--bc-blue)', color: 'white', padding: '12px 24px',
                borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}
            >
              Browse properties
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {savedProperties.map(property => {
              const isSaved = data.user?.savedProperties?.includes(property.id);

              return (
                <div
                  key={property.id}
                  style={{
                    background: 'white',
                    border: '1px solid var(--bc-gray-border)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Property image */}
                  <div style={{ position: 'relative', height: 180 }}>
                    <img
                      src={property.thumbnailUrl || property.photos?.[0]?.url || `https://picsum.photos/seed/${property.id}/300/180`}
                      alt={property.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onClick={() => navigate(`/property/${property.id}`)}
                    />
                    {/* Save / unsave button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSaveProperty(property.id); }}
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'white', border: 'none', borderRadius: '50%',
                        width: 36, height: 36, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)', fontSize: 18,
                      }}
                    >
                      {isSaved ? '♥' : '♡'}
                    </button>
                    {/* Property type */}
                    {property.type && (
                      <div style={{
                        position: 'absolute', bottom: 10, left: 10,
                        background: 'rgba(0,0,0,0.6)', color: 'white',
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 3,
                        textTransform: 'capitalize',
                      }}>
                        {property.type}
                      </div>
                    )}
                  </div>

                  {/* Property info */}
                  <div
                    style={{ padding: 16 }}
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {property.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--bc-text-medium)' }}>
                          {property.city}, {property.country}
                        </div>
                      </div>
                      {property.reviewScore && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                          <div style={{
                            background: 'var(--bc-blue-dark)', color: 'white', fontWeight: 700,
                            fontSize: 13, padding: '4px 8px',
                            borderRadius: '6px 6px 6px 0', marginBottom: 2,
                          }}>
                            {property.reviewScore.toFixed(1)}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--bc-text-light)', textAlign: 'right' }}>
                            {getScoreWord(property.reviewScore)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stars */}
                    {property.stars && (
                      <div style={{ display: 'flex', gap: 1, marginBottom: 8 }}>
                        {Array.from({ length: property.stars }).map((_, i) => (
                          <span key={i} style={{ color: 'var(--bc-yellow)', fontSize: 12 }}>★</span>
                        ))}
                      </div>
                    )}

                    {/* Facilities */}
                    {property.facilities?.slice(0, 3).length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                        {property.facilities.slice(0, 3).map((f, i) => (
                          <span key={i} style={{
                            background: 'var(--bc-blue-light)', color: 'var(--bc-blue)',
                            fontSize: 11, padding: '2px 7px', borderRadius: 3,
                          }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <div>
                        {property.freeCancellation && (
                          <div style={{ fontSize: 11, color: 'var(--bc-green)', fontWeight: 700, marginBottom: 2 }}>
                            ✓ Free cancellation
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 11, color: 'var(--bc-text-light)' }}>From </span>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>US${property.pricePerNight}</span>
                        <span style={{ fontSize: 11, color: 'var(--bc-text-light)' }}> / night</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div
                      style={{
                        marginTop: 12,
                        background: 'var(--bc-blue)', color: 'white', textAlign: 'center',
                        padding: '10px', borderRadius: 4, fontWeight: 700, fontSize: 13,
                      }}
                      onClick={(e) => { e.stopPropagation(); navigate(`/property/${property.id}`); }}
                    >
                      See availability
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
