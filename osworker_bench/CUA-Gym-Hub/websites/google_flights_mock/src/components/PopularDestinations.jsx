import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { AIRPORTS } from '../lib/data';

export default function PopularDestinations() {
  const { state, setSearch } = useAppContext();
  const navigate = useNavigate();
  const destinations = state.popularDestinations || [];

  const originCode = state.search?.origin || 'SFO';
  const originAirport = AIRPORTS.find(a => a.code === originCode);
  const originCity = originAirport?.city || originCode;

  const handleClick = (dest) => {
    setSearch({ destination: dest.airport });
    const sid = state.sid;
    const params = new URLSearchParams({
      origin: originCode,
      destination: dest.airport,
      date: state.search.departureDate || '',
      returnDate: state.search.returnDate || '',
      tripType: 'roundtrip',
      adults: state.search.passengers.adults,
      cabin: state.search.cabinClass,
    });
    if (sid) params.set('sid', sid);
    navigate(`/results?${params.toString()}`);
  };

  if (!destinations.length) return null;

  return (
    <div>
      <h2 style={{
        fontSize: '22px', fontWeight: 400, color: '#202124',
        marginBottom: '16px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
      }}>
        Popular destinations from {originCity}
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {destinations.map((dest, idx) => (
          <div
            key={dest.airport}
            onClick={() => handleClick(dest)}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(60,64,67,0.2)',
              background: '#fff',
              transition: 'box-shadow 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(60,64,67,0.25)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{ height: '160px', overflow: 'hidden' }}>
              <img
                src={dest.imageUrl}
                alt={dest.city}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.src = `https://picsum.photos/seed/${idx}/400/250`; }}
              />
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 500, color: '#202124' }}>
                {dest.city}
              </div>
              <div style={{ fontSize: '13px', color: '#70757a', marginTop: '2px' }}>
                {dest.stops} · {dest.flightDuration}
              </div>
              <div style={{ fontSize: '14px', color: '#137333', marginTop: '6px', fontWeight: 500 }}>
                From ${dest.priceFrom}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
