import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, Map, List, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from '../components/RatingBubbles.jsx';
import SaveButton from '../components/SaveButton.jsx';

const ITEMS_PER_PAGE = 10;
const amenityOptions = ['Free WiFi', 'Pool', 'Free Breakfast', 'Parking', 'Pet Friendly', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Bar/Lounge'];
const starOptions = [5, 4, 3, 2, 1];
const ratingOptions = [
  { label: 'Excellent 4.5+', min: 4.5 },
  { label: 'Very Good 4.0+', min: 4.0 },
  { label: 'Average 3.0+', min: 3.0 }
];
const propertyTypes = ['Hotel', 'Resort', 'Inn', 'B&B', 'Hostel'];
const sortOptions = [
  { value: 'bestValue', label: 'Best Value' },
  { value: 'travelerRanked', label: 'Traveler Ranked' },
  { value: 'priceLow', label: 'Price (low to high)' },
  { value: 'priceHigh', label: 'Price (high to low)' }
];

export default function HotelSearch() {
  const { state, dispatch } = useApp();
  const [searchParams] = useSearchParams();
  const destId = searchParams.get('destination');
  const queryStr = searchParams.get('q') || '';

  const [filters, setFilters] = useState({
    amenities: [], priceMin: 0, priceMax: 1000, starClass: [], ratingMin: 0, propertyType: []
  });
  const [sort, setSort] = useState('bestValue');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');

  const destination = destId ? state.destinations.find(d => d.id === destId) : null;

  const filtered = useMemo(() => {
    let results = [...state.hotels];

    if (destId) results = results.filter(h => h.destinationId === destId);
    if (queryStr) {
      const q = queryStr.toLowerCase();
      results = results.filter(h => {
        const dest = state.destinations.find(d => d.id === h.destinationId);
        return h.name.toLowerCase().includes(q) || (dest && dest.name.toLowerCase().includes(q));
      });
    }

    if (filters.amenities.length > 0) {
      results = results.filter(h => filters.amenities.every(a => h.amenities.includes(a)));
    }
    results = results.filter(h => h.pricePerNight >= filters.priceMin && h.pricePerNight <= filters.priceMax);
    if (filters.starClass.length > 0) {
      results = results.filter(h => filters.starClass.includes(h.starClass));
    }
    if (filters.ratingMin > 0) {
      results = results.filter(h => h.rating >= filters.ratingMin);
    }
    if (filters.propertyType.length > 0) {
      results = results.filter(h => filters.propertyType.includes(h.propertyType));
    }

    // Sort
    switch (sort) {
      case 'travelerRanked': results.sort((a, b) => a.rank - b.rank); break;
      case 'priceLow': results.sort((a, b) => a.pricePerNight - b.pricePerNight); break;
      case 'priceHigh': results.sort((a, b) => b.pricePerNight - a.pricePerNight); break;
      default: results.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount)); break;
    }

    return results;
  }, [state.hotels, destId, queryStr, filters, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeFilterCount = filters.amenities.length + filters.starClass.length + filters.propertyType.length + (filters.ratingMin > 0 ? 1 : 0) + (filters.priceMin > 0 || filters.priceMax < 1000 ? 1 : 0);

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ amenities: [], priceMin: 0, priceMax: 1000, starClass: [], ratingMin: 0, propertyType: [] });
    setPage(1);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
        {destination ? `Hotels in ${destination.name}` : queryStr ? `Hotels matching "${queryStr}"` : 'All Hotels'}
      </h1>
      <p style={{ color: '#545454', fontSize: '14px', marginBottom: '20px' }}>
        {filtered.length} properties {destination ? `in ${destination.name}` : 'found'}
      </p>

      {/* Filter chips */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {filters.amenities.map(a => (
            <span key={a} className="tag-pill" style={{ cursor: 'pointer' }} onClick={() => toggleArrayFilter('amenities', a)}>
              {a} <X size={12} style={{ marginLeft: '4px' }} />
            </span>
          ))}
          {filters.starClass.map(s => (
            <span key={s} className="tag-pill" style={{ cursor: 'pointer' }} onClick={() => toggleArrayFilter('starClass', s)}>
              {s} Star <X size={12} style={{ marginLeft: '4px' }} />
            </span>
          ))}
          {filters.propertyType.map(p => (
            <span key={p} className="tag-pill" style={{ cursor: 'pointer' }} onClick={() => toggleArrayFilter('propertyType', p)}>
              {p} <X size={12} style={{ marginLeft: '4px' }} />
            </span>
          ))}
          {filters.ratingMin > 0 && (
            <span className="tag-pill" style={{ cursor: 'pointer' }} onClick={() => { setFilters(p => ({ ...p, ratingMin: 0 })); setPage(1); }}>
              Rating {filters.ratingMin}+ <X size={12} style={{ marginLeft: '4px' }} />
            </span>
          )}
          <button onClick={clearFilters} style={{ color: '#00AA6C', fontWeight: 600, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear all
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Filter sidebar */}
        <aside style={{ width: '280px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '72px' }}>
            {/* Popular Filters */}
            <FilterSection title="Popular Filters">
              {amenityOptions.map(a => (
                <label key={a} style={checkboxStyle}>
                  <input type="checkbox" checked={filters.amenities.includes(a)} onChange={() => toggleArrayFilter('amenities', a)} style={{ accentColor: '#00AA6C' }} />
                  {a}
                </label>
              ))}
            </FilterSection>

            {/* Price */}
            <FilterSection title="Price per night">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="number" value={filters.priceMin} onChange={e => { setFilters(p => ({ ...p, priceMin: +e.target.value })); setPage(1); }} style={inputStyle} placeholder="$0" min={0} />
                <span style={{ color: '#8A8A8A' }}>to</span>
                <input type="number" value={filters.priceMax} onChange={e => { setFilters(p => ({ ...p, priceMax: +e.target.value })); setPage(1); }} style={inputStyle} placeholder="$1000" min={0} />
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={10}
                value={filters.priceMax}
                onChange={e => { setFilters(p => ({ ...p, priceMax: +e.target.value })); setPage(1); }}
                style={{ width: '100%', marginTop: '8px', accentColor: '#00AA6C' }}
              />
            </FilterSection>

            {/* Star Class */}
            <FilterSection title="Hotel Class">
              {starOptions.map(s => (
                <label key={s} style={checkboxStyle}>
                  <input type="checkbox" checked={filters.starClass.includes(s)} onChange={() => toggleArrayFilter('starClass', s)} style={{ accentColor: '#00AA6C' }} />
                  {'★'.repeat(s)} {s} Star
                </label>
              ))}
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Rating">
              {ratingOptions.map(r => (
                <label key={r.label} style={checkboxStyle}>
                  <input type="radio" name="ratingFilter" checked={filters.ratingMin === r.min} onChange={() => { setFilters(p => ({ ...p, ratingMin: r.min })); setPage(1); }} style={{ accentColor: '#00AA6C' }} />
                  {r.label}
                </label>
              ))}
              {filters.ratingMin > 0 && (
                <button onClick={() => { setFilters(p => ({ ...p, ratingMin: 0 })); setPage(1); }} style={{ fontSize: '12px', color: '#00AA6C', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
                  Clear
                </button>
              )}
            </FilterSection>

            {/* Property Type */}
            <FilterSection title="Property Type">
              {propertyTypes.map(p => (
                <label key={p} style={checkboxStyle}>
                  <input type="checkbox" checked={filters.propertyType.includes(p)} onChange={() => toggleArrayFilter('propertyType', p)} style={{ accentColor: '#00AA6C' }} />
                  {p}
                </label>
              ))}
            </FilterSection>
          </div>
        </aside>

        {/* Results */}
        <div style={{ flex: 1 }}>
          {/* Sort bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {sortOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setPage(1); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: sort === opt.value ? 'none' : '1px solid #E0E0E0',
                    background: sort === opt.value ? '#1A1A1A' : 'white',
                    color: sort === opt.value ? 'white' : '#1A1A1A',
                    fontSize: '13px',
                    fontWeight: sort === opt.value ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', border: '1px solid #E0E0E0', borderRadius: '4px', background: viewMode === 'list' ? '#1A1A1A' : 'white', color: viewMode === 'list' ? 'white' : '#1A1A1A', cursor: 'pointer' }}>
                <List size={16} />
              </button>
              <button onClick={() => setViewMode('map')} style={{ padding: '6px 10px', border: '1px solid #E0E0E0', borderRadius: '4px', background: viewMode === 'map' ? '#1A1A1A' : 'white', color: viewMode === 'map' ? 'white' : '#1A1A1A', cursor: 'pointer' }}>
                <Map size={16} />
              </button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div style={{ width: '100%', height: '600px', background: '#E8E8E8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ color: '#8A8A8A', fontSize: '16px' }}>Map view -- interactive map would appear here</span>
              {filtered.slice(0, 8).map((h, i) => (
                <div key={h.id} title={`${h.name} - $${h.pricePerNight}`} style={{
                  position: 'absolute',
                  left: `${15 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 35}%`,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#00AA6C',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  cursor: 'pointer'
                }} />
              ))}
            </div>
          ) : (
            <>
              {paginated.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', color: '#545454', marginBottom: '12px' }}>No hotels match your filters.</p>
                  <button onClick={clearFilters} style={{ color: '#00AA6C', fontWeight: 600, fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Reset filters
                  </button>
                </div>
              ) : (
                paginated.map(hotel => <HotelCard key={hotel.id} hotel={hotel} state={state} />)
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '24px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        border: page === p ? 'none' : '1px solid #E0E0E0',
                        background: page === p ? '#1A1A1A' : 'white',
                        color: page === p ? 'white' : '#1A1A1A',
                        fontSize: '14px',
                        fontWeight: page === p ? 700 : 400,
                        cursor: 'pointer'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  {page < totalPages && (
                    <button onClick={() => setPage(page + 1)} style={{ padding: '8px 16px', border: '1px solid #E0E0E0', borderRadius: '20px', background: 'white', cursor: 'pointer', fontSize: '14px' }}>
                      Next
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function HotelCard({ hotel, state }) {
  const dest = state.destinations.find(d => d.id === hotel.destinationId);
  return (
    <Link to={`/hotel/${hotel.id}`} style={{ textDecoration: 'none', color: '#1A1A1A' }}>
      <div style={{
        display: 'flex',
        border: '1px solid #E0E0E0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        background: 'white',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer'
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        {/* Image */}
        <div style={{
          width: '200px',
          height: '150px',
          borderRadius: '8px',
          background: hotel.images[0],
          flexShrink: 0,
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
            <SaveButton entityId={hotel.id} entityType="hotel" size={16} />
          </div>
          {hotel.travelersChoice && (
            <div className="travelers-choice-badge" style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '10px', padding: '2px 6px' }}>
              Travelers' Choice
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, marginLeft: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{hotel.name}</div>
          <div style={{ marginBottom: '4px' }}>
            <RatingBubbles rating={hotel.rating} size="small" count={hotel.reviewCount} />
          </div>
          <div style={{ fontSize: '12px', color: '#8A8A8A', marginBottom: '8px' }}>
            #{hotel.rank} of {hotel.totalHotelsInCity} hotels in {dest?.name}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {hotel.amenities.slice(0, 3).map(a => (
              <span key={a} className="tag-pill">{a}</span>
            ))}
          </div>
        </div>

        {/* Price */}
        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', minWidth: '120px' }}>
          <div style={{ fontSize: '12px', color: '#8A8A8A', marginBottom: '2px' }}>from</div>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>${hotel.pricePerNight}</div>
          <div style={{ fontSize: '12px', color: '#8A8A8A', marginBottom: '12px' }}>per night</div>
          <span className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>View Deal</span>
        </div>
      </div>
    </Link>
  );
}

function FilterSection({ title, children }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ marginBottom: '20px', borderBottom: '1px solid #E0E0E0', paddingBottom: '16px' }}>
      <button onClick={() => setExpanded(!expanded)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0', marginBottom: expanded ? '12px' : 0 }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A1A' }}>{title}</span>
        <ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {expanded && <div>{children}</div>}
    </div>
  );
}

const checkboxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: '#1A1A1A',
  cursor: 'pointer',
  padding: '4px 0'
};

const inputStyle = {
  width: '80px',
  padding: '6px 8px',
  border: '1px solid #E0E0E0',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none'
};
