import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const airlines = ['Delta Air Lines', 'United Airlines', 'American Airlines', 'JetBlue', 'Southwest', 'Air France', 'British Airways', 'Lufthansa'];
const cabinClasses = ['Economy', 'Premium Economy', 'Business', 'First'];

function generateFlights(from, to, date) {
  if (!from || !to || from === to) return [];
  const seed = (from + to + date).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i) => ((seed * 9301 + 49297 + i * 233) % 233280) / 233280;
  const count = 4 + Math.floor(rng(0) * 5);
  const results = [];
  for (let i = 0; i < count; i++) {
    const airline = airlines[Math.floor(rng(i * 3 + 1) * airlines.length)];
    const depHour = 6 + Math.floor(rng(i * 3 + 2) * 16);
    const durationH = 1 + Math.floor(rng(i * 3 + 3) * 12);
    const durationM = Math.floor(rng(i * 3 + 4) * 4) * 15;
    const stops = rng(i * 3 + 5) < 0.4 ? 0 : rng(i * 3 + 5) < 0.75 ? 1 : 2;
    const price = 89 + Math.floor(rng(i * 3 + 6) * 900);
    results.push({
      id: `fl_${i}`,
      airline,
      departTime: `${String(depHour).padStart(2, '0')}:${String(Math.floor(rng(i * 3 + 7) * 4) * 15).padStart(2, '0')}`,
      arriveTime: `${String((depHour + durationH) % 24).padStart(2, '0')}:${String(durationM).padStart(2, '0')}`,
      duration: `${durationH}h ${durationM}m`,
      stops,
      price,
    });
  }
  return results.sort((a, b) => a.price - b.price);
}

export default function Flights() {
  const { state, dispatch } = useApp();
  const [tripType, setTripType] = useState('roundtrip');
  const [from, setFrom] = useState('New York City');
  const [to, setTo] = useState('London');
  const [departDate, setDepartDate] = useState('2026-05-15');
  const [returnDate, setReturnDate] = useState('2026-05-22');
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [maxStops, setMaxStops] = useState(-1);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const destinations = state.destinations.map(d => d.name);
  const flights = searched ? generateFlights(from, to, departDate) : [];
  const filtered = flights.filter(f => maxStops < 0 || f.stops <= maxStops);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    return a.stops - b.stops;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
    setSelectedFlight(null);
    setConfirmation(null);
  };

  const handleBookFlight = () => {
    if (!selectedFlight) return;
    const booking = {
      type: 'flight',
      provider: selectedFlight.airline,
      route: `${from} to ${to}`,
      departDate,
      returnDate: tripType === 'roundtrip' ? returnDate : null,
      tripType,
      passengers,
      cabinClass,
      price: selectedFlight.price * passengers,
      flightId: selectedFlight.id
    };
    dispatch({ type: 'ADD_BOOKING', payload: booking });
    setConfirmation(booking);
    setSelectedFlight(null);
  };

  const cardStyle = { background: 'white', borderRadius: '12px', border: '1px solid #E0E0E0', padding: '16px', marginBottom: '12px' };
  const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#545454', marginBottom: '4px', display: 'block' };
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px' }}>Flights</h1>

      {/* Search form */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          {['roundtrip', 'oneway'].map(t => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="radio" name="tripType" checked={tripType === t} onChange={() => setTripType(t)} />
              {t === 'roundtrip' ? 'Round trip' : 'One-way'}
            </label>
          ))}
        </div>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: tripType === 'roundtrip' ? '1fr 1fr 1fr 1fr auto auto' : '1fr 1fr 1fr auto auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>From</label>
              <select style={inputStyle} value={from} onChange={e => setFrom(e.target.value)}>
                {destinations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>To</label>
              <select style={inputStyle} value={to} onChange={e => setTo(e.target.value)}>
                {destinations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Depart</label>
              <input type="date" style={inputStyle} value={departDate} onChange={e => setDepartDate(e.target.value)} />
            </div>
            {tripType === 'roundtrip' && (
              <div>
                <label style={labelStyle}>Return</label>
                <input type="date" style={inputStyle} value={returnDate} onChange={e => setReturnDate(e.target.value)} />
              </div>
            )}
            <div>
              <label style={labelStyle}>Travelers</label>
              <select style={inputStyle} value={passengers} onChange={e => setPassengers(+e.target.value)}>
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Class</label>
              <select style={inputStyle} value={cabinClass} onChange={e => setCabinClass(e.target.value)}>
                {cabinClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '16px', padding: '12px 32px', fontSize: '15px' }}>
            Search Flights
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', marginTop: '20px' }}>
          {/* Filters */}
          <div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Stops</h3>
              {[[-1, 'Any'], [0, 'Nonstop'], [1, '1 stop or fewer'], [2, '2 stops or fewer']].map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" name="stops" checked={maxStops === val} onChange={() => setMaxStops(val)} />
                  {label}
                </label>
              ))}
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Sort by</h3>
              {[['price', 'Cheapest'], ['duration', 'Shortest'], ['stops', 'Fewest stops']].map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" name="sort" checked={sortBy === val} onChange={() => setSortBy(val)} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Flight list */}
          <div>
            <div style={{ fontSize: '14px', color: '#545454', marginBottom: '12px' }}>
              {sorted.length} flights found &middot; {from} to {to} &middot; {new Date(departDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            {sorted.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#8A8A8A' }}>No flights match your filters. Try adjusting your search criteria.</div>
            )}
            {sorted.map(flight => (
              <div key={flight.id} style={{
                ...cardStyle,
                display: 'grid',
                gridTemplateColumns: '1fr 100px 100px 120px',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s',
                border: selectedFlight?.id === flight.id ? '2px solid #00AA6C' : cardStyle.border
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                onClick={() => { setSelectedFlight(flight); setConfirmation(null); }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{flight.airline}</div>
                  <div style={{ fontSize: '14px' }}>
                    <span style={{ fontWeight: 600 }}>{flight.departTime}</span>
                    <span style={{ color: '#8A8A8A', margin: '0 8px' }}>&rarr;</span>
                    <span style={{ fontWeight: 600 }}>{flight.arriveTime}</span>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#545454' }}>{flight.duration}</div>
                <div style={{ fontSize: '13px', color: flight.stops === 0 ? '#00AA6C' : '#545454' }}>
                  {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>${flight.price}</div>
                  <div style={{ fontSize: '12px', color: '#8A8A8A' }}>{tripType === 'roundtrip' ? 'roundtrip' : 'one-way'}</div>
                </div>
              </div>
            ))}
            {selectedFlight && (
              <div style={{ ...cardStyle, border: '2px solid #00AA6C', background: '#F6FFFB' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px' }}>Review your flight</div>
                <div style={{ fontSize: '14px', color: '#545454', marginBottom: '12px' }}>
                  {selectedFlight.airline} &middot; {from} to {to} &middot; {passengers} traveler{passengers > 1 ? 's' : ''} &middot; {cabinClass} &middot; Total ${selectedFlight.price * passengers}
                </div>
                <button className="btn-primary" onClick={handleBookFlight} style={{ padding: '10px 20px' }}>Reserve flight</button>
              </div>
            )}
            {confirmation && (
              <div style={{ ...cardStyle, borderColor: '#00AA6C', background: '#F6FFFB' }}>
                <div style={{ fontWeight: 700 }}>Flight reserved</div>
                <div style={{ fontSize: '14px', color: '#545454', marginTop: '4px' }}>
                  {confirmation.provider} &middot; {confirmation.route} &middot; Total ${confirmation.price}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
