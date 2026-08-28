import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from '../components/RatingBubbles.jsx';
import SaveButton from '../components/SaveButton.jsx';

const heroCategories = ['Hotels', 'Things to Do', 'Restaurants'];

export default function Home() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [activeHeroCat, setActiveHeroCat] = useState('Hotels');
  const [heroQuery, setHeroQuery] = useState('');

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const q = heroQuery.trim();
    if (!q) return;
    if (activeHeroCat === 'Hotels') navigate(`/hotels?q=${encodeURIComponent(q)}`);
    else if (activeHeroCat === 'Restaurants') navigate(`/restaurants?q=${encodeURIComponent(q)}`);
    else navigate(`/attractions?q=${encodeURIComponent(q)}`);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: { query: q, type: activeHeroCat.toLowerCase(), destinationId: null } });
  };

  const topDestinations = state.destinations.slice(0, 8);
  const recentSearches = state.searchHistory.recentSearches;

  return (
    <div>
      {/* Hero */}
      <div style={{
        height: '420px',
        background: 'linear-gradient(135deg, #1A1A1A 0%, #0d3320 40%, #00AA6C 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px'
      }}>
        <h1 style={{ color: 'white', fontSize: '36px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
          Where to?
        </h1>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {heroCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveHeroCat(cat)}
              style={{
                padding: '8px 20px',
                borderRadius: '24px',
                border: '2px solid white',
                background: activeHeroCat === cat ? 'white' : 'transparent',
                color: activeHeroCat === cat ? '#1A1A1A' : 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <form onSubmit={handleHeroSearch} style={{ width: '100%', maxWidth: '600px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            borderRadius: '28px',
            padding: '12px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            height: '56px'
          }}>
            <Search size={20} color="#8A8A8A" />
            <input
              type="text"
              value={heroQuery}
              onChange={(e) => setHeroQuery(e.target.value)}
              placeholder="Places to go, things to do, hotels..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                marginLeft: '12px',
                fontSize: '16px',
                color: '#1A1A1A'
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="container" style={{ paddingTop: '40px' }}>
        {/* Travelers' Choice */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Travelers' Choice Best of the Best</h2>
          <p style={{ color: '#545454', fontSize: '14px', marginBottom: '20px' }}>
            Our highest level of recognition, awarded to the top 1% of businesses on Xripadvisor.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '8px'
          }}>
            {state.destinations.slice(0, 6).map(dest => (
              <Link
                key={dest.id}
                to={`/hotels?destination=${dest.id}`}
                style={{
                  flexShrink: 0,
                  width: '240px',
                  height: '200px',
                  borderRadius: '12px',
                  background: dest.image,
                  position: 'relative',
                  overflow: 'hidden',
                  textDecoration: 'none'
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.6))',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px'
                }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>{dest.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Destinations */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Top destinations for your next vacation</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }}>
            {topDestinations.map(dest => (
              <div key={dest.id}>
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  background: dest.image,
                  marginBottom: '12px'
                }} />
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{dest.name}</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                  <Link to={`/hotels?destination=${dest.id}`} style={{ color: '#00AA6C', fontWeight: 600 }}>Hotels</Link>
                  <Link to={`/attractions?destination=${dest.id}`} style={{ color: '#00AA6C', fontWeight: 600 }}>Things to Do</Link>
                  <Link to={`/restaurants?destination=${dest.id}`} style={{ color: '#00AA6C', fontWeight: 600 }}>Restaurants</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Viewed */}
        {recentSearches.length > 0 && (
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Recently Viewed</h2>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
              {recentSearches.map((search, i) => {
                const dest = state.destinations.find(d => d.id === search.destinationId);
                return (
                  <Link
                    key={i}
                    to={`/${search.type}s?destination=${search.destinationId}`}
                    style={{
                      flexShrink: 0,
                      padding: '12px 16px',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#1A1A1A',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'white'
                    }}
                  >
                    <Search size={14} color="#8A8A8A" />
                    {search.query}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Popular Hotels Preview */}
        <section style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Popular Hotels</h2>
            <Link to="/hotels" style={{ color: '#00AA6C', fontWeight: 600, fontSize: '14px' }}>See all</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {state.hotels.filter(h => h.travelersChoice).slice(0, 3).map(hotel => {
              const dest = state.destinations.find(d => d.id === hotel.destinationId);
              return (
                <Link key={hotel.id} to={`/hotel/${hotel.id}`} style={{
                  textDecoration: 'none',
                  color: '#1A1A1A',
                  border: '1px solid #E0E0E0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ height: '160px', background: hotel.images[0], position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                      <SaveButton entityId={hotel.id} entityType="hotel" size={18} />
                    </div>
                    {hotel.travelersChoice && (
                      <div className="travelers-choice-badge" style={{ position: 'absolute', top: '8px', left: '8px' }}>
                        Travelers' Choice
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{hotel.name}</div>
                    <RatingBubbles rating={hotel.rating} size="small" count={hotel.reviewCount} />
                    <div style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '4px' }}>{dest?.name}</div>
                    <div style={{ marginTop: '8px', fontWeight: 700, fontSize: '16px' }}>
                      from ${hotel.pricePerNight} <span style={{ fontSize: '12px', fontWeight: 400, color: '#8A8A8A' }}>per night</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
