import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { AIRPORTS } from '../lib/data';

function getAirportCity(code) {
  return AIRPORTS.find(a => a.code === code)?.city || code;
}

export default function Tracked() {
  const navigate = useNavigate();
  const { state, togglePriceTracking } = useAppContext();
  const trackedRoutes = state.trackedRoutes || [];
  const flights = state.flights || [];
  const sid = state.sid;

  const handleRemove = (route) => {
    togglePriceTracking(route);
  };

  const handleViewFlights = (route) => {
    const params = new URLSearchParams({
      origin: route.origin,
      destination: route.destination,
      date: state.search.departureDate || '',
      returnDate: state.search.returnDate || '',
      tripType: 'roundtrip',
      adults: state.search.passengers.adults,
      cabin: state.search.cabinClass,
    });
    if (sid) params.set('sid', sid);
    navigate(`/results?${params.toString()}`);
  };

  // Get lowest current price for a route from flight data
  const getLowestPrice = (origin, destination) => {
    const routeFlights = flights.filter(f => f.origin === origin && f.destination === destination);
    if (!routeFlights.length) return null;
    return Math.min(...routeFlights.map(f => f.price));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f3f4', fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#1a73e8',
              fontWeight: 500, fontSize: '14px', padding: '8px', borderRadius: '50%',
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e8f0fe'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 400, color: '#202124' }}>
            Tracked prices
          </h1>
        </div>

        {trackedRoutes.length === 0 ? (
          /* Empty state */
          <div style={{
            background: '#fff', borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(60,64,67,0.15)',
            padding: '60px 24px', textAlign: 'center',
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#bdc1c6" style={{ display: 'block', margin: '0 auto 16px' }}>
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#202124', marginBottom: '8px' }}>
              No tracked routes yet
            </div>
            <div style={{ fontSize: '14px', color: '#5f6368', marginBottom: '24px' }}>
              Track prices for a route and we'll show you the latest prices here.
            </div>
            <button
              onClick={() => navigate(sid ? `/?sid=${sid}` : '/')}
              style={{
                background: '#1a73e8', color: '#fff', border: 'none',
                borderRadius: '24px', padding: '10px 24px', fontSize: '14px',
                fontWeight: 500, cursor: 'pointer',
                fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
              onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
            >
              Search flights
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {trackedRoutes.map((route, idx) => {
              const lowestPrice = getLowestPrice(route.origin, route.destination);
              const originCity = getAirportCity(route.origin);
              const destCity = getAirportCity(route.destination);
              const addedDate = route.addedAt
                ? new Date(route.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recently';

              return (
                <div
                  key={`${route.origin}-${route.destination}-${idx}`}
                  style={{
                    background: '#fff', borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(60,64,67,0.15)',
                    padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Route info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 500, color: '#202124', marginBottom: '4px' }}>
                      {originCity} → {destCity}
                    </div>
                    <div style={{ fontSize: '12px', color: '#70757a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{route.origin}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#bdc1c6">
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                      </svg>
                      <span>{route.destination}</span>
                      <span style={{ color: '#dadce0' }}>·</span>
                      <span>Tracked since {addedDate}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    {lowestPrice != null ? (
                      <>
                        <div style={{ fontSize: '20px', fontWeight: 500, color: '#137333' }}>
                          from ${lowestPrice}
                        </div>
                        <div style={{ fontSize: '12px', color: '#70757a' }}>round trip</div>
                      </>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#70757a' }}>No flights available</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleViewFlights(route)}
                      style={{
                        background: '#1a73e8', color: '#fff', border: 'none',
                        borderRadius: '20px', padding: '8px 18px', fontSize: '13px',
                        fontWeight: 500, cursor: 'pointer',
                        fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
                    >
                      View flights
                    </button>
                    <button
                      onClick={() => handleRemove(route)}
                      title="Stop tracking"
                      style={{
                        background: 'none', border: '1px solid #dadce0',
                        borderRadius: '50%', width: '36px', height: '36px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#5f6368',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fce8e6'; e.currentTarget.style.borderColor = '#ea4335'; e.currentTarget.style.color = '#c5221f'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#dadce0'; e.currentTarget.style.color = '#5f6368'; }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Footer note */}
            <div style={{ fontSize: '12px', color: '#70757a', textAlign: 'center', padding: '8px 0' }}>
              {trackedRoutes.length} route{trackedRoutes.length !== 1 ? 's' : ''} tracked · Prices update in real time
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
