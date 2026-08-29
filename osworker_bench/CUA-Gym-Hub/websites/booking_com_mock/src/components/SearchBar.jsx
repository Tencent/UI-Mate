import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';

const DestinationDropdown = ({ destinations, query, onSelect }) => {
  const filtered = destinations.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.country.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  if (!query || filtered.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      zIndex: 200,
      background: 'white',
      border: '1px solid var(--bc-gray-border)',
      borderRadius: 4,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      width: '100%',
      minWidth: 280,
    }}>
      {filtered.map(dest => (
        <button
          key={dest.id}
          onClick={() => onSelect(dest)}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            borderBottom: '1px solid #f5f5f5',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bc-gray-light)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span style={{ fontSize: 20 }}>📍</span>
          <div>
            <div style={{ fontWeight: 600 }}>{dest.name}</div>
            <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>{dest.country}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

export const SearchBar = ({ compact = false }) => {
  const navigate = useNavigate();
  const { data, setSearchParams, addRecentSearch } = useAppContext();
  const [destination, setDestination] = useState('');
  const [selectedDest, setSelectedDest] = useState(null);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [errors, setErrors] = useState({});

  const destRef = useRef(null);
  const guestRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (destRef.current && !destRef.current.contains(e.target)) setShowDestDropdown(false);
      if (guestRef.current && !guestRef.current.contains(e.target)) setShowGuestDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const guestSummary = `${adults} adult${adults !== 1 ? 's' : ''}${children > 0 ? ` · ${children} child${children !== 1 ? 'ren' : ''}` : ''} · ${rooms} room${rooms !== 1 ? 's' : ''}`;

  const handleSearch = () => {
    const errs = {};
    if (!destination.trim()) errs.destination = 'Please enter a destination';
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      errs.checkOut = 'Check-out must be after check-in';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const params = {
      destination: destination,
      destinationId: selectedDest?.id || null,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      adults,
      children,
      rooms,
    };
    setSearchParams(params);

    if (selectedDest) {
      addRecentSearch({
        destination: selectedDest.name,
        destinationId: selectedDest.id,
        dates: checkIn && checkOut ? `${checkIn} – ${checkOut}` : 'Any dates',
        guests: guestSummary,
      });
    }

    const urlParams = new URLSearchParams();
    urlParams.set('destination', destination);
    if (selectedDest?.id) urlParams.set('dest_id', selectedDest.id);
    if (checkIn) urlParams.set('checkin', checkIn);
    if (checkOut) urlParams.set('checkout', checkOut);
    urlParams.set('adults', adults);
    urlParams.set('children', children);
    urlParams.set('rooms', rooms);
    navigate(`/search?${urlParams.toString()}`);
  };

  const fieldStyle = {
    background: 'white',
    border: errors.destination ? '3px solid var(--bc-red)' : '3px solid transparent',
    borderRadius: 4,
    padding: compact ? '8px 12px' : '12px 14px',
    cursor: 'pointer',
    position: 'relative',
    flex: 1,
    minWidth: 0,
  };

  const labelStyle = { fontSize: 11, fontWeight: 700, color: 'var(--bc-text-dark)', display: 'block', marginBottom: 2 };
  const inputStyle = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: 14,
    width: '100%',
    color: 'var(--bc-text-dark)',
    padding: 0,
  };

  return (
    <div style={{
      background: compact ? 'transparent' : 'var(--bc-yellow)',
      borderRadius: compact ? 0 : 8,
      padding: compact ? 0 : '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Destination */}
        <div ref={destRef} style={{ ...fieldStyle, minWidth: compact ? 180 : 240, flex: 2 }}>
          <label style={labelStyle}>Where are you going?</label>
          <input
            type="text"
            placeholder="Enter a destination"
            value={destination}
            style={inputStyle}
            onChange={e => {
              setDestination(e.target.value);
              setSelectedDest(null);
              setShowDestDropdown(true);
              if (errors.destination) setErrors({});
            }}
            onFocus={() => setShowDestDropdown(true)}
          />
          {errors.destination && (
            <span style={{ position: 'absolute', bottom: -18, left: 0, fontSize: 11, color: 'var(--bc-red)', fontWeight: 600 }}>
              {errors.destination}
            </span>
          )}
          {showDestDropdown && data?.destinations && (
            <DestinationDropdown
              destinations={data.destinations}
              query={destination}
              onSelect={dest => {
                setDestination(dest.name);
                setSelectedDest(dest);
                setShowDestDropdown(false);
                if (errors.destination) setErrors({});
              }}
            />
          )}
        </div>

        {/* Check-in */}
        <div style={{ ...fieldStyle, flex: 1, minWidth: 130 }}>
          <label style={labelStyle}>Check-in date</label>
          <input
            type="date"
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            style={{ ...inputStyle, fontSize: 13 }}
          />
        </div>

        {/* Check-out */}
        <div style={{ ...fieldStyle, flex: 1, minWidth: 130, border: errors.checkOut ? '3px solid var(--bc-red)' : '3px solid transparent' }}>
          <label style={labelStyle}>Check-out date</label>
          <input
            type="date"
            value={checkOut}
            onChange={e => { setCheckOut(e.target.value); if (errors.checkOut) setErrors(prev => { const { checkOut, ...rest } = prev; return rest; }); }}
            style={{ ...inputStyle, fontSize: 13 }}
          />
          {errors.checkOut && (
            <span style={{ position: 'absolute', bottom: -18, left: 0, fontSize: 11, color: 'var(--bc-red)', fontWeight: 600 }}>
              {errors.checkOut}
            </span>
          )}
        </div>

        {/* Guests */}
        <div ref={guestRef} style={{ ...fieldStyle, flex: 1, minWidth: 160 }}>
          <label style={labelStyle}>Adults · Children · Rooms</label>
          <div
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            style={{ ...inputStyle, cursor: 'pointer', userSelect: 'none' }}
          >
            {guestSummary}
          </div>
          {showGuestDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 200,
              background: 'white',
              border: '1px solid var(--bc-gray-border)',
              borderRadius: 4,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              width: 260,
              padding: 16,
              marginTop: 4,
            }}>
              {[
                { label: 'Adults', value: adults, setter: setAdults, min: 1, max: 30 },
                { label: 'Children', sub: 'Ages 0-17', value: children, setter: setChildren, min: 0, max: 10 },
                { label: 'Rooms', value: rooms, setter: setRooms, min: 1, max: 30 },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{row.label}</div>
                    {row.sub && <div style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>{row.sub}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={e => { e.stopPropagation(); row.setter(Math.max(row.min, row.value - 1)); }}
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        border: '1px solid var(--bc-gray-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, color: row.value <= row.min ? '#ccc' : 'var(--bc-blue)',
                        cursor: row.value <= row.min ? 'default' : 'pointer',
                        background: 'none',
                      }}
                      disabled={row.value <= row.min}
                    >
                      −
                    </button>
                    <span style={{ width: 20, textAlign: 'center', fontWeight: 700 }}>{row.value}</span>
                    <button
                      onClick={e => { e.stopPropagation(); row.setter(Math.min(row.max, row.value + 1)); }}
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        border: '1px solid var(--bc-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, color: 'var(--bc-blue)',
                        cursor: 'pointer',
                        background: 'none',
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowGuestDropdown(false)}
                style={{
                  width: '100%', padding: '10px', background: 'var(--bc-blue)',
                  color: 'white', borderRadius: 4, fontWeight: 700, fontSize: 14,
                  border: 'none', cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          style={{
            background: 'var(--bc-blue)',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: compact ? '8px 20px' : '12px 24px',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bc-blue-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bc-blue)'}
        >
          Search
        </button>
      </div>
    </div>
  );
};
