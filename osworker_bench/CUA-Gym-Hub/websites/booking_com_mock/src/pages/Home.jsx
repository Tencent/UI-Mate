import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';
import { SearchBar } from '../components/SearchBar';

const DEST_IMAGES = {
  dest_1: 'https://picsum.photos/seed/nyc_dest/300/200',
  dest_2: 'https://picsum.photos/seed/paris_dest/300/200',
  dest_3: 'https://picsum.photos/seed/london_dest/300/200',
  dest_4: 'https://picsum.photos/seed/tokyo_dest/300/200',
  dest_5: 'https://picsum.photos/seed/barcelona_dest/300/200',
  dest_6: 'https://picsum.photos/seed/rome_dest/300/200',
  dest_7: 'https://picsum.photos/seed/dubai_dest/300/200',
  dest_8: 'https://picsum.photos/seed/amsterdam_dest/300/200',
  dest_9: 'https://picsum.photos/seed/bali_dest/300/200',
  dest_10: 'https://picsum.photos/seed/la_dest/300/200',
};

const BROWSE_TYPES = [
  { label: 'Hotels', icon: '🏨', type: 'hotel' },
  { label: 'Apartments', icon: '🏢', type: 'apartment' },
  { label: 'Resorts', icon: '🌴', type: 'resort' },
  { label: 'Villas', icon: '🏡', type: 'villa' },
  { label: 'Hostels', icon: '🛏️', type: 'hostel' },
  { label: 'B&Bs', icon: '☕', type: 'guesthouse' },
];

export const Home = () => {
  const { data, loading } = useAppContext();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const trendingDests = data?.destinations?.filter(d => d.trending).slice(0, 6) || [];
  const recentSearches = data?.recentSearches || [];

  const handleDestClick = (dest) => {
    navigate(`/search?destination=${encodeURIComponent(dest.name)}&dest_id=${dest.id}`);
  };

  return (
    <div>
      {/* Hero section with search */}
      <div style={{ background: 'var(--bc-blue-dark)', padding: '40px 0 80px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            Find deals for any season
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 24 }}>
            From cozy stays to luxury escapes, your next stay is just a search away.
          </p>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/search?destination=${encodeURIComponent(s.destination)}&dest_id=${s.destinationId}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.15)', color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20,
                    padding: '6px 14px', fontSize: 13, cursor: 'pointer',
                  }}
                >
                  🕐 {s.destination}
                </button>
              ))}
            </div>
          )}

          {/* Search bar */}
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Offers section */}
      <div style={{ background: 'var(--bc-gray-bg)', padding: '32px 0' }}>
        <div className="container">
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: 'var(--bc-text-dark)' }}>Offers</h2>
          <p style={{ fontSize: 14, color: 'var(--bc-text-medium)', marginBottom: 20 }}>
            Promotions, deals and special offers for you
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Genius offer */}
            <div style={{
              background: 'white',
              borderRadius: 8,
              padding: 20,
              border: '1px solid var(--bc-gray-border)',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}>
              <div style={{ fontSize: 40 }}>🏆</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Unlock Genius discounts</div>
                <div style={{ fontSize: 13, color: 'var(--bc-text-medium)', marginBottom: 8 }}>
                  Complete 2 bookings to reach Genius Level 2 and save more.
                </div>
                <button
                  onClick={() => navigate('/search')}
                  style={{
                    background: 'var(--bc-blue)', color: 'white', border: 'none', borderRadius: 4,
                    padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Find Genius deals
                </button>
              </div>
            </div>

            {/* Wallet offer */}
            <div style={{
              background: 'white',
              borderRadius: 8,
              padding: 20,
              border: '1px solid var(--bc-gray-border)',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}>
              <div style={{ fontSize: 40 }}>💳</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Xooking.com Wallet</div>
                <div style={{ fontSize: 13, color: 'var(--bc-text-medium)', marginBottom: 8 }}>
                  Earn cashback rewards on every booking you make.
                </div>
                <button
                  onClick={() => navigate('/search')}
                  style={{
                    background: 'var(--bc-blue)', color: 'white', border: 'none', borderRadius: 4,
                    padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending destinations */}
      <div style={{ padding: '40px 0' }}>
        <div className="container">
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Trending destinations</h2>
          <p style={{ fontSize: 14, color: 'var(--bc-text-medium)', marginBottom: 20 }}>
            Travellers searching for places like these
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {trendingDests.map(dest => (
              <div
                key={dest.id}
                onClick={() => handleDestClick(dest)}
                style={{
                  position: 'relative',
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  height: 160,
                }}
                onMouseEnter={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}
              >
                <img
                  src={DEST_IMAGES[dest.id]}
                  alt={dest.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 12,
                }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>{dest.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                    {dest.propertyCount.toLocaleString()} properties
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Browse by property type */}
      <div style={{ background: 'var(--bc-gray-bg)', padding: '40px 0' }}>
        <div className="container">
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Browse by property type</h2>
          <p style={{ fontSize: 14, color: 'var(--bc-text-medium)', marginBottom: 20 }}>
            Find the accommodation that suits you
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {BROWSE_TYPES.map(({ label, icon, type }) => {
              const count = data?.properties?.filter(p => p.type === type).length || 0;
              return (
                <button
                  key={type}
                  onClick={() => navigate(`/search?type=${type}`)}
                  style={{
                    background: 'white',
                    border: '1px solid var(--bc-gray-border)',
                    borderRadius: 8,
                    padding: '20px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <span style={{ fontSize: 32 }}>{icon}</span>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
                  {count > 0 && <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>{count} properties</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recently viewed */}
      {data?.recentlyViewed?.length > 0 && (
        <div style={{ padding: '40px 0' }}>
          <div className="container">
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Recently viewed</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {data.recentlyViewed.slice(0, 4).map(propId => {
                const prop = data.properties?.find(p => p.id === propId);
                if (!prop) return null;
                return (
                  <Link
                    key={propId}
                    to={`/property/${prop.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{
                      border: '1px solid var(--bc-gray-border)',
                      borderRadius: 8,
                      overflow: 'hidden',
                      transition: 'box-shadow 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <img src={prop.thumbnailUrl} alt={prop.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                      <div style={{ padding: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--bc-blue)', marginBottom: 4 }}>{prop.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>{prop.city}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>From US${prop.pricePerNight}/night</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
