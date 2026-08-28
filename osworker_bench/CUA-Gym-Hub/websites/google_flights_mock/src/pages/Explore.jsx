import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { AIRPORTS, POPULAR_DESTINATIONS, generatePriceCalendar } from '../lib/data';

// Map viewport constants — simple equirectangular projection
const MAP_W = 900;
const MAP_H = 460;

// Project lat/lng to SVG coordinates
function project(lat, lng) {
  // Equirectangular: x = (lng + 180) / 360 * width, y = (90 - lat) / 180 * height
  const x = ((lng + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return { x, y };
}

// Simplified world map SVG path data (approximate continent outlines)
// Using a simplified representation with major landmasses
const CONTINENTS = [
  // North America (simplified outline)
  {
    id: 'na',
    d: 'M 145,55 L 170,50 L 190,55 L 210,60 L 225,75 L 235,90 L 245,100 L 250,115 L 240,130 L 225,140 L 215,155 L 205,170 L 195,175 L 185,165 L 175,150 L 160,145 L 148,140 L 135,130 L 125,120 L 115,105 L 110,90 L 115,75 L 130,65 Z',
    fill: '#e8eaed',
  },
  // Central America + Mexico continuation
  {
    id: 'ca',
    d: 'M 175,175 L 185,170 L 195,180 L 188,195 L 178,200 L 170,190 Z',
    fill: '#e8eaed',
  },
  // South America
  {
    id: 'sa',
    d: 'M 185,195 L 205,190 L 220,195 L 230,210 L 235,230 L 240,255 L 235,275 L 225,295 L 215,310 L 200,320 L 188,315 L 178,300 L 170,280 L 165,260 L 162,240 L 163,220 L 168,205 Z',
    fill: '#e8eaed',
  },
  // Europe
  {
    id: 'eu',
    d: 'M 440,65 L 460,55 L 480,58 L 500,60 L 515,70 L 520,82 L 510,90 L 495,95 L 480,90 L 465,92 L 455,85 L 445,78 Z',
    fill: '#e8eaed',
  },
  // Africa
  {
    id: 'af',
    d: 'M 455,105 L 480,100 L 500,105 L 515,115 L 520,130 L 522,150 L 520,170 L 515,190 L 505,210 L 490,230 L 478,240 L 465,235 L 450,220 L 440,200 L 435,180 L 432,160 L 435,140 L 440,120 Z',
    fill: '#e8eaed',
  },
  // Asia (large)
  {
    id: 'as',
    d: 'M 520,60 L 560,50 L 610,48 L 660,50 L 700,55 L 730,62 L 745,72 L 740,85 L 725,92 L 710,95 L 695,100 L 680,105 L 660,110 L 640,108 L 620,112 L 600,115 L 580,110 L 560,108 L 545,102 L 530,95 L 520,82 Z',
    fill: '#e8eaed',
  },
  // South/Southeast Asia
  {
    id: 'sea',
    d: 'M 620,112 L 650,112 L 670,118 L 680,130 L 670,140 L 655,145 L 640,140 L 625,132 L 618,120 Z',
    fill: '#e8eaed',
  },
  // Japan / Korea islands
  {
    id: 'jpkr',
    d: 'M 730,75 L 740,72 L 750,78 L 748,86 L 738,88 L 730,82 Z',
    fill: '#e8eaed',
  },
  // Australia
  {
    id: 'au',
    d: 'M 720,285 L 750,275 L 775,278 L 795,290 L 800,308 L 793,325 L 778,332 L 758,330 L 740,320 L 725,305 Z',
    fill: '#e8eaed',
  },
  // Indonesia/Bali islands (simplified)
  {
    id: 'id',
    d: 'M 690,175 L 720,170 L 740,172 L 742,180 L 720,182 L 695,180 Z',
    fill: '#e8eaed',
  },
  // Greenland
  {
    id: 'gr',
    d: 'M 235,28 L 260,22 L 280,25 L 290,35 L 285,45 L 268,50 L 248,48 L 235,40 Z',
    fill: '#e8eaed',
  },
];

// Destination pins to show on the map
// Using POPULAR_DESTINATIONS and their airport lat/lng
const EXPLORE_DESTINATIONS = POPULAR_DESTINATIONS.map(dest => {
  const airport = AIRPORTS.find(a => a.code === dest.airport);
  return { ...dest, airport: dest.airport, lat: airport?.lat, lng: airport?.lng };
}).filter(d => d.lat != null);

// Add a few more interesting destinations
const EXTRA_DESTINATIONS = [
  { city: 'Dubai', country: 'UAE', airport: 'DXB', priceFrom: 780, flightDuration: '16h 0m', stops: '1 stop', imageUrl: 'https://picsum.photos/seed/dubai/400/250' },
  { city: 'Sydney', country: 'Australia', airport: 'SYD', priceFrom: 920, flightDuration: '17h 30m', stops: '1 stop', imageUrl: 'https://picsum.photos/seed/sydney/400/250' },
  { city: 'Rome', country: 'Italy', airport: 'FCO', priceFrom: 520, flightDuration: '13h 0m', stops: '1 stop', imageUrl: 'https://picsum.photos/seed/rome/400/250' },
  { city: 'Seoul', country: 'South Korea', airport: 'ICN', priceFrom: 680, flightDuration: '12h 0m', stops: 'Nonstop', imageUrl: 'https://picsum.photos/seed/seoul/400/250' },
].map(dest => {
  const airport = AIRPORTS.find(a => a.code === dest.airport);
  return { ...dest, lat: airport?.lat, lng: airport?.lng };
}).filter(d => d.lat != null);

const ALL_DESTINATIONS = [...EXPLORE_DESTINATIONS, ...EXTRA_DESTINATIONS];

export default function Explore() {
  const navigate = useNavigate();
  const { state, setSearch } = useAppContext();
  const sid = state?.sid;

  const [origin, setOrigin] = useState(state?.search?.origin || 'SFO');
  const [tripType, setTripType] = useState('roundtrip');
  const [selectedDest, setSelectedDest] = useState(null);
  const [hoveredDest, setHoveredDest] = useState(null);
  const [originQuery, setOriginQuery] = useState(() => {
    const apt = AIRPORTS.find(a => a.code === (state?.search?.origin || 'SFO'));
    return apt ? `${apt.city} (${apt.code})` : 'San Francisco (SFO)';
  });
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const originAirport = AIRPORTS.find(a => a.code === origin) || AIRPORTS[2];
  const originPos = project(originAirport.lat, originAirport.lng);

  const filteredOrigins = useMemo(() => {
    if (!originQuery) return AIRPORTS.slice(0, 6);
    return AIRPORTS.filter(a =>
      a.city.toLowerCase().includes(originQuery.toLowerCase()) ||
      a.code.toLowerCase().includes(originQuery.toLowerCase())
    ).slice(0, 6);
  }, [originQuery]);

  const handleViewFlights = (dest) => {
    setSearch({ origin, destination: dest.airport, tripType });
    const params = new URLSearchParams({
      origin,
      destination: dest.airport,
      tripType,
    });
    if (sid) params.set('sid', sid);
    navigate(`/results?${params.toString()}`);
  };

  const handlePinClick = (dest) => {
    setSelectedDest(selectedDest?.airport === dest.airport ? null : dest);
  };

  // Compute price for each destination (lowest from price calendar)
  const destPrices = useMemo(() => {
    const map = {};
    ALL_DESTINATIONS.forEach(dest => {
      const cal = generatePriceCalendar(origin, dest.airport);
      map[dest.airport] = cal.length ? Math.min(...cal.map(e => e.price)) : dest.priceFrom;
    });
    return map;
  }, [origin]);

  return (
    <div style={{ minHeight: '100vh', background: '#f1f3f4', fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}>
      <Navbar />

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>

        {/* Left sidebar */}
        <div style={{
          width: '320px', flexShrink: 0,
          background: '#fff', borderRight: '1px solid #dadce0',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #f1f3f4' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 400, color: '#202124' }}>
              Explore destinations
            </h2>

            {/* Origin selector */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#5f6368', marginBottom: '4px', fontWeight: 500 }}>
                Flying from
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={originQuery}
                  onChange={e => { setOriginQuery(e.target.value); setShowOriginDropdown(true); }}
                  onFocus={() => setShowOriginDropdown(true)}
                  onBlur={() => setTimeout(() => setShowOriginDropdown(false), 150)}
                  placeholder="City or airport"
                  style={{
                    width: '100%', height: '44px', border: '1px solid #dadce0',
                    borderRadius: '8px', padding: '0 12px',
                    fontSize: '14px', color: '#202124',
                    fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  onFocusCapture={e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 1px #1a73e8'; }}
                  onBlurCapture={e => { e.target.style.borderColor = '#dadce0'; e.target.style.boxShadow = 'none'; }}
                />
                {showOriginDropdown && filteredOrigins.length > 0 && (
                  <ul style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: '#fff', border: 'none', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 200,
                    margin: 0, padding: '8px 0', listStyle: 'none',
                  }}>
                    {filteredOrigins.map(apt => (
                      <li
                        key={apt.code}
                        onMouseDown={() => {
                          setOrigin(apt.code);
                          setOriginQuery(`${apt.city} (${apt.code})`);
                          setShowOriginDropdown(false);
                        }}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '13px', color: '#202124' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f3f4'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <strong>{apt.city}</strong> ({apt.code}) — {apt.country}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Trip type toggle */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { value: 'roundtrip', label: 'Round trip' },
                { value: 'oneway', label: 'One way' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTripType(opt.value)}
                  style={{
                    flex: 1, padding: '8px 0', border: `1px solid ${tripType === opt.value ? '#1a73e8' : '#dadce0'}`,
                    borderRadius: '20px', background: tripType === opt.value ? '#e8f0fe' : 'none',
                    color: tripType === opt.value ? '#1a73e8' : '#5f6368',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                    fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                    transition: 'all 0.1s',
                  }}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Destination list */}
          <div style={{ padding: '12px 0', flex: 1 }}>
            <div style={{ padding: '4px 20px 8px', fontSize: '12px', color: '#70757a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Destinations from {originAirport.city}
            </div>
            {ALL_DESTINATIONS.map(dest => {
              const price = destPrices[dest.airport] || dest.priceFrom;
              const isSelected = selectedDest?.airport === dest.airport;
              return (
                <div
                  key={dest.airport}
                  onClick={() => handlePinClick(dest)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    background: isSelected ? '#e8f0fe' : 'transparent',
                    borderLeft: `3px solid ${isSelected ? '#1a73e8' : 'transparent'}`,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8f9fa'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <img
                    src={dest.imageUrl}
                    alt={dest.city}
                    style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dest.city}, {dest.country}
                    </div>
                    <div style={{ fontSize: '12px', color: '#70757a' }}>
                      {dest.stops} · {dest.flightDuration}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#137333' }}>
                      ${price}
                    </div>
                    <div style={{ fontSize: '11px', color: '#70757a' }}>from</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#d4e6f7' }}>

          {/* World map SVG */}
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            style={{ width: '100%', height: '100%' }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Ocean background */}
            <rect width={MAP_W} height={MAP_H} fill="#d4e6f7" />

            {/* Grid lines */}
            {[-60, -30, 0, 30, 60].map(lat => {
              const { y } = project(lat, 0);
              return <line key={`lat${lat}`} x1={0} y1={y} x2={MAP_W} y2={y} stroke="#b8d4ea" strokeWidth="0.5" strokeDasharray="4,4" />;
            })}
            {[-120, -60, 0, 60, 120].map(lng => {
              const { x } = project(0, lng);
              return <line key={`lng${lng}`} x1={x} y1={0} x2={x} y2={MAP_H} stroke="#b8d4ea" strokeWidth="0.5" strokeDasharray="4,4" />;
            })}

            {/* Continent paths */}
            {CONTINENTS.map(c => (
              <path key={c.id} d={c.d} fill={c.fill} stroke="#c5cdd6" strokeWidth="1" />
            ))}

            {/* Origin point */}
            <circle
              cx={originPos.x} cy={originPos.y} r={8}
              fill="#1a73e8" stroke="#fff" strokeWidth="2"
            />
            <circle cx={originPos.x} cy={originPos.y} r={14}
              fill="none" stroke="#1a73e8" strokeWidth="1.5" opacity={0.4}
            />

            {/* Flight arc lines from origin to each destination */}
            {ALL_DESTINATIONS.map(dest => {
              const destPos = project(dest.lat, dest.lng);
              const isSelected = selectedDest?.airport === dest.airport;
              const isHovered = hoveredDest?.airport === dest.airport;
              if (!isSelected && !isHovered) return null;
              return (
                <line
                  key={`arc-${dest.airport}`}
                  x1={originPos.x} y1={originPos.y}
                  x2={destPos.x} y2={destPos.y}
                  stroke={isSelected ? '#1a73e8' : '#70b8f0'}
                  strokeWidth={isSelected ? 1.5 : 1}
                  strokeDasharray="4,3"
                  opacity={0.7}
                />
              );
            })}

            {/* Destination pins */}
            {ALL_DESTINATIONS.map(dest => {
              const pos = project(dest.lat, dest.lng);
              const price = destPrices[dest.airport] || dest.priceFrom;
              const isSelected = selectedDest?.airport === dest.airport;
              const isHovered = hoveredDest?.airport === dest.airport;
              const labelW = 60;
              const labelH = 24;

              return (
                <g
                  key={dest.airport}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handlePinClick(dest)}
                  onMouseEnter={() => setHoveredDest(dest)}
                  onMouseLeave={() => setHoveredDest(null)}
                >
                  {/* Price bubble */}
                  <rect
                    x={pos.x - labelW / 2}
                    y={pos.y - labelH - 8}
                    width={labelW}
                    height={labelH}
                    rx={12}
                    fill={isSelected ? '#1a73e8' : isHovered ? '#34a853' : '#fff'}
                    stroke={isSelected ? '#1557b0' : '#dadce0'}
                    strokeWidth={1}
                    style={{ filter: isSelected || isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - labelH / 2 - 8 + 5}
                    textAnchor="middle"
                    fill={isSelected || isHovered ? '#fff' : '#202124'}
                    fontSize={11}
                    fontWeight={600}
                    fontFamily='"Google Sans", Roboto, Arial, sans-serif'
                    style={{ pointerEvents: 'none' }}
                  >
                    ${price}
                  </text>
                  {/* Pin dot */}
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#1a73e8' : '#fff'}
                    stroke={isSelected ? '#1557b0' : '#5f6368'}
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
          </svg>

          {/* Selected destination card (popup) */}
          {selectedDest && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              padding: '16px',
              width: '320px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              zIndex: 10,
            }}>
              <img
                src={selectedDest.imageUrl}
                alt={selectedDest.city}
                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#202124', marginBottom: '2px' }}>
                  {selectedDest.city}
                </div>
                <div style={{ fontSize: '13px', color: '#5f6368', marginBottom: '6px' }}>
                  {selectedDest.country} · {selectedDest.airport} · {selectedDest.stops} · {selectedDest.flightDuration}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#137333', marginBottom: '8px' }}>
                  From ${destPrices[selectedDest.airport] || selectedDest.priceFrom}
                </div>
                <button
                  onClick={() => handleViewFlights(selectedDest)}
                  style={{
                    background: '#1a73e8', color: '#fff', border: 'none',
                    borderRadius: '20px', padding: '8px 16px', fontSize: '13px',
                    fontWeight: 500, cursor: 'pointer',
                    fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
                >
                  View flights
                </button>
              </div>
              <button
                onClick={() => setSelectedDest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '2px', flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          )}

          {/* Map legend */}
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(255,255,255,0.92)', borderRadius: '8px',
            padding: '10px 14px', fontSize: '12px', color: '#5f6368',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1a73e8', border: '2px solid #fff', boxShadow: '0 0 0 1px #1a73e8' }} />
              <span>Your origin</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#fff', border: '1px solid #dadce0' }} />
              <span>Destination (click)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#1a73e8' }} />
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
