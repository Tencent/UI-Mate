import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useSearchParams } from 'react-router-dom';
import RatingBubbles from '../components/RatingBubbles.jsx';
import SaveButton from '../components/SaveButton.jsx';

function generateRentals(destinations) {
  const types = ['Entire apartment', 'Entire villa', 'Entire house', 'Condo', 'Cabin', 'Studio'];
  const amenities = ['Kitchen', 'WiFi', 'Air conditioning', 'Washer', 'Pool', 'Hot tub', 'Parking', 'Gym', 'Pet friendly', 'Balcony'];
  const rentals = [];
  let idx = 0;

  destinations.forEach(dest => {
    const count = 3 + (dest.id.charCodeAt(dest.id.length - 1) % 4);
    for (let i = 0; i < count; i++) {
      const seed = dest.id.charCodeAt(5) * 31 + i * 17 + idx;
      const rng = (offset) => ((seed * 9301 + 49297 + offset * 1373) % 233280) / 233280;
      const bedrooms = 1 + Math.floor(rng(1) * 4);
      const bathrooms = 1 + Math.floor(rng(2) * 3);
      const sleeps = bedrooms * 2 + Math.floor(rng(3) * 3);
      const pricePerNight = 60 + Math.floor(rng(4) * 400);
      const rating = 3.5 + Math.round(rng(5) * 15) / 10;
      const reviewCount = 10 + Math.floor(rng(6) * 500);
      const numAmenities = 3 + Math.floor(rng(7) * 5);
      const selectedAmenities = [...amenities].sort(() => rng(idx) - 0.5).slice(0, numAmenities);

      rentals.push({
        id: `vr_${idx}`,
        name: `${types[Math.floor(rng(8) * types.length)]} in ${dest.name}`,
        type: types[Math.floor(rng(8) * types.length)],
        destinationId: dest.id,
        destinationName: dest.name,
        bedrooms,
        bathrooms,
        sleeps,
        pricePerNight,
        rating: Math.min(rating, 5),
        reviewCount,
        amenities: selectedAmenities,
        image: dest.image,
        description: `Charming ${bedrooms}-bedroom rental with ${selectedAmenities.slice(0, 3).join(', ').toLowerCase()}. Perfect for your ${dest.name} getaway.`,
      });
      idx++;
    }
  });
  return rentals;
}

const ITEMS_PER_PAGE = 9;

export default function VacationRentals() {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const destId = searchParams.get('destination');

  const allRentals = useMemo(() => generateRentals(state.destinations), [state.destinations]);

  const [priceMax, setPriceMax] = useState(1000);
  const [bedroomsMin, setBedroomsMin] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('price');
  const [page, setPage] = useState(1);

  const amenityOptions = ['Kitchen', 'WiFi', 'Pool', 'Hot tub', 'Parking', 'Pet friendly'];

  const toggleAmenity = (a) => {
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let results = [...allRentals];
    if (destId) results = results.filter(r => r.destinationId === destId);
    results = results.filter(r => r.pricePerNight <= priceMax);
    if (bedroomsMin > 0) results = results.filter(r => r.bedrooms >= bedroomsMin);
    if (selectedAmenities.length > 0) results = results.filter(r => selectedAmenities.every(a => r.amenities.includes(a)));
    if (sortBy === 'price') results.sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sortBy === 'rating') results.sort((a, b) => b.rating - a.rating);
    else results.sort((a, b) => b.reviewCount - a.reviewCount);
    return results;
  }, [allRentals, destId, priceMax, bedroomsMin, selectedAmenities, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const destination = destId ? state.destinations.find(d => d.id === destId) : null;
  const cardStyle = { background: 'white', borderRadius: '12px', border: '1px solid #E0E0E0', overflow: 'hidden', transition: 'box-shadow 0.15s' };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
        Vacation Rentals{destination ? ` in ${destination.name}` : ''}
      </h1>
      <p style={{ color: '#545454', fontSize: '14px', marginBottom: '20px' }}>
        {filtered.length} rental{filtered.length !== 1 ? 's' : ''} available
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>
        {/* Filters sidebar */}
        <div>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E0E0E0', padding: '16px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Price per night</h3>
            <input type="range" min={50} max={500} value={priceMax} onChange={e => { setPriceMax(+e.target.value); setPage(1); }} style={{ width: '100%' }} />
            <div style={{ fontSize: '13px', color: '#545454' }}>Up to ${priceMax}/night</div>
          </div>

          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E0E0E0', padding: '16px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Bedrooms</h3>
            {[0, 1, 2, 3, 4].map(n => (
              <label key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '14px', cursor: 'pointer' }}>
                <input type="radio" name="bedrooms" checked={bedroomsMin === n} onChange={() => { setBedroomsMin(n); setPage(1); }} />
                {n === 0 ? 'Any' : `${n}+`}
              </label>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E0E0E0', padding: '16px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Amenities</h3>
            {amenityOptions.map(a => (
              <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedAmenities.includes(a)} onChange={() => toggleAmenity(a)} />
                {a}
              </label>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E0E0E0', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Sort by</h3>
            {[['price', 'Price (low to high)'], ['rating', 'Rating'], ['reviews', 'Most reviewed']].map(([val, label]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '14px', cursor: 'pointer' }}>
                <input type="radio" name="sort" checked={sortBy === val} onChange={() => setSortBy(val)} />
                {label}
              </label>
            ))}
          </div>

          {/* Destination filter */}
          {!destId && (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E0E0E0', padding: '16px', marginTop: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Destination</h3>
              {state.destinations.map(d => (
                <a
                  key={d.id}
                  href={`/vacation-rentals?destination=${d.id}`}
                  style={{ display: 'block', padding: '4px 0', fontSize: '14px', color: '#00AA6C', textDecoration: 'none' }}
                >
                  {d.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Results grid */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {pageItems.map(rental => (
              <div
                key={rental.id}
                style={cardStyle}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ height: '160px', background: rental.image, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <SaveButton entityId={rental.id} entityType="vacationRental" entitySnapshot={rental} size={18} />
                  </div>
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', lineHeight: 1.3 }}>{rental.name}</div>
                  <RatingBubbles rating={rental.rating} size="small" count={rental.reviewCount} />
                  <div style={{ fontSize: '13px', color: '#545454', marginTop: '6px' }}>
                    {rental.bedrooms} BR &middot; {rental.bathrooms} BA &middot; Sleeps {rental.sleeps}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '4px' }}>
                    {rental.amenities.slice(0, 3).join(' &middot; ')}
                  </div>
                  <div style={{ marginTop: '8px', fontWeight: 700, fontSize: '16px' }}>
                    ${rental.pricePerNight} <span style={{ fontSize: '12px', fontWeight: 400, color: '#8A8A8A' }}>avg/night</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {pageItems.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8A8A8A' }}>
              No vacation rentals match your filters. Try adjusting your criteria.
            </div>
          )}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: page === i + 1 ? '2px solid #00AA6C' : '1px solid #E0E0E0',
                    background: page === i + 1 ? '#00AA6C' : 'white',
                    color: page === i + 1 ? 'white' : '#1A1A1A',
                    fontWeight: page === i + 1 ? 700 : 400,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
