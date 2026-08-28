import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { Search, MapPin, Bed, UtensilsCrossed, Camera, Clock } from 'lucide-react';

export default function SearchOverlay({ query, onSelect }) {
  const { state } = useApp();
  const navigate = useNavigate();

  const q = (query || '').toLowerCase().trim();

  const matchingDestinations = state.destinations.filter(d =>
    d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchingHotels = q.length > 0 ? state.hotels.filter(h =>
    h.name.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchingRestaurants = q.length > 0 ? state.restaurants.filter(r =>
    r.name.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchingAttractions = q.length > 0 ? state.attractions.filter(a =>
    a.name.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const handleNavigate = (path) => {
    onSelect();
    navigate(path);
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#1A1A1A',
    textDecoration: 'none'
  };

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: '4px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      maxHeight: '500px',
      overflowY: 'auto',
      zIndex: 200
    }}>
      {/* Recent searches */}
      {!q && state.searchHistory.recentSearches.length > 0 && (
        <div>
          <div style={{ padding: '12px 16px 6px', fontSize: '12px', fontWeight: 700, color: '#8A8A8A', textTransform: 'uppercase' }}>
            Recent Searches
          </div>
          {state.searchHistory.recentSearches.map((s, i) => (
            <div
              key={i}
              style={itemStyle}
              onClick={() => handleNavigate(`/${s.type}s?destination=${s.destinationId}`)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F2F2F2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Clock size={16} color="#8A8A8A" />
              <span>{s.query}</span>
            </div>
          ))}
        </div>
      )}

      {/* Popular destinations */}
      {!q && (
        <div>
          <div style={{ padding: '12px 16px 6px', fontSize: '12px', fontWeight: 700, color: '#8A8A8A', textTransform: 'uppercase' }}>
            Popular Destinations
          </div>
          {state.destinations.slice(0, 5).map(d => (
            <div
              key={d.id}
              style={itemStyle}
              onClick={() => handleNavigate(`/hotels?destination=${d.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F2F2F2'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin size={16} color="#8A8A8A" />
              <div>
                <div style={{ fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontSize: '12px', color: '#8A8A8A' }}>{d.country}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search results */}
      {q && (
        <>
          {matchingDestinations.length > 0 && (
            <div>
              <div style={{ padding: '12px 16px 6px', fontSize: '12px', fontWeight: 700, color: '#8A8A8A', textTransform: 'uppercase' }}>
                Destinations
              </div>
              {matchingDestinations.map(d => (
                <div
                  key={d.id}
                  style={itemStyle}
                  onClick={() => handleNavigate(`/hotels?destination=${d.id}`)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F2F2F2'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={16} color="#8A8A8A" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: '12px', color: '#8A8A8A' }}>{d.country}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {matchingHotels.length > 0 && (
            <div>
              <div style={{ padding: '12px 16px 6px', fontSize: '12px', fontWeight: 700, color: '#8A8A8A', textTransform: 'uppercase' }}>
                Hotels
              </div>
              {matchingHotels.map(h => {
                const dest = state.destinations.find(d => d.id === h.destinationId);
                return (
                  <div
                    key={h.id}
                    style={itemStyle}
                    onClick={() => handleNavigate(`/hotel/${h.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F2F2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Bed size={16} color="#8A8A8A" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{h.name}</div>
                      <div style={{ fontSize: '12px', color: '#8A8A8A' }}>{dest?.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {matchingRestaurants.length > 0 && (
            <div>
              <div style={{ padding: '12px 16px 6px', fontSize: '12px', fontWeight: 700, color: '#8A8A8A', textTransform: 'uppercase' }}>
                Restaurants
              </div>
              {matchingRestaurants.map(r => {
                const dest = state.destinations.find(d => d.id === r.destinationId);
                return (
                  <div
                    key={r.id}
                    style={itemStyle}
                    onClick={() => handleNavigate(`/restaurant/${r.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F2F2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <UtensilsCrossed size={16} color="#8A8A8A" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: '12px', color: '#8A8A8A' }}>{dest?.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {matchingAttractions.length > 0 && (
            <div>
              <div style={{ padding: '12px 16px 6px', fontSize: '12px', fontWeight: 700, color: '#8A8A8A', textTransform: 'uppercase' }}>
                Things to Do
              </div>
              {matchingAttractions.map(a => {
                const dest = state.destinations.find(d => d.id === a.destinationId);
                return (
                  <div
                    key={a.id}
                    style={itemStyle}
                    onClick={() => handleNavigate(`/attraction/${a.id}`)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F2F2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Camera size={16} color="#8A8A8A" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: '12px', color: '#8A8A8A' }}>{dest?.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {matchingDestinations.length === 0 && matchingHotels.length === 0 && matchingRestaurants.length === 0 && matchingAttractions.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#8A8A8A', fontSize: '14px' }}>
              No results found for "{query}"
            </div>
          )}
        </>
      )}
    </div>
  );
}
