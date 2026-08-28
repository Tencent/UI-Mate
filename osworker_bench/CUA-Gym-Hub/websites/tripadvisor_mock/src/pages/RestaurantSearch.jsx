import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, X, Map, List } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from '../components/RatingBubbles.jsx';
import SaveButton from '../components/SaveButton.jsx';

const ITEMS_PER_PAGE = 10;
const cuisineOptions = ['Italian', 'French', 'Japanese', 'Mexican', 'American', 'Indian', 'Chinese', 'Thai', 'Mediterranean', 'Seafood', 'European', 'British', 'Sushi', 'Pizza', 'Pasta', 'Steakhouse', 'Cafe', 'Latin'];
const priceLevels = ['$', '$$', '$$$', '$$$$'];
const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Brunch', 'Late Night'];
const dietaryOpts = ['Vegetarian Options', 'Vegan Options', 'Gluten Free Options'];
const featureOpts = ['Reservations', 'Outdoor Seating', 'Delivery', 'Takeout', 'Private Dining'];
const sortOptions = [
  { value: 'bestValue', label: 'Best Value' },
  { value: 'travelerRanked', label: 'Traveler Ranked' },
  { value: 'ratingHigh', label: 'Highest Rated' }
];

export default function RestaurantSearch() {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const destId = searchParams.get('destination');
  const queryStr = searchParams.get('q') || '';

  const [filters, setFilters] = useState({
    cuisines: [], priceLevel: [], meals: [], dietary: [], features: [], ratingMin: 0
  });
  const [sort, setSort] = useState('bestValue');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');

  const destination = destId ? state.destinations.find(d => d.id === destId) : null;

  const filtered = useMemo(() => {
    let results = [...state.restaurants];
    if (destId) results = results.filter(r => r.destinationId === destId);
    if (queryStr) {
      const q = queryStr.toLowerCase();
      results = results.filter(r => {
        const dest = state.destinations.find(d => d.id === r.destinationId);
        return r.name.toLowerCase().includes(q) || r.cuisines.some(c => c.toLowerCase().includes(q)) || (dest && dest.name.toLowerCase().includes(q));
      });
    }
    if (filters.cuisines.length > 0) results = results.filter(r => r.cuisines.some(c => filters.cuisines.includes(c)));
    if (filters.priceLevel.length > 0) results = results.filter(r => filters.priceLevel.includes(r.priceLevel));
    if (filters.meals.length > 0) results = results.filter(r => r.meals.some(m => filters.meals.includes(m)));
    if (filters.dietary.length > 0) results = results.filter(r => r.dietaryOptions.some(d => filters.dietary.includes(d)));
    if (filters.features.length > 0) results = results.filter(r => r.features.some(f => filters.features.includes(f)));
    if (filters.ratingMin > 0) results = results.filter(r => r.rating >= filters.ratingMin);

    switch (sort) {
      case 'travelerRanked': results.sort((a, b) => a.rank - b.rank); break;
      case 'ratingHigh': results.sort((a, b) => b.rating - a.rating); break;
      default: results.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount)); break;
    }
    return results;
  }, [state.restaurants, destId, queryStr, filters, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value] }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ cuisines: [], priceLevel: [], meals: [], dietary: [], features: [], ratingMin: 0 });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).reduce((c, v) => c + (Array.isArray(v) ? v.length : v > 0 ? 1 : 0), 0);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
        {destination ? `Restaurants in ${destination.name}` : queryStr ? `Restaurants matching "${queryStr}"` : 'All Restaurants'}
      </h1>
      <p style={{ color: '#545454', fontSize: '14px', marginBottom: '20px' }}>{filtered.length} restaurants found</p>

      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {Object.entries(filters).map(([key, values]) => {
            if (Array.isArray(values)) return values.map(v => (
              <span key={`${key}-${v}`} className="tag-pill" style={{ cursor: 'pointer' }} onClick={() => toggleFilter(key, v)}>{v} <X size={12} style={{ marginLeft: '4px' }} /></span>
            ));
            return null;
          })}
          <button onClick={clearFilters} style={{ color: '#00AA6C', fontWeight: 600, fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px' }}>
        <aside style={{ width: '280px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '72px' }}>
            <FilterSection title="Cuisine">
              {cuisineOptions.map(c => (
                <label key={c} style={checkboxStyle}>
                  <input type="checkbox" checked={filters.cuisines.includes(c)} onChange={() => toggleFilter('cuisines', c)} style={{ accentColor: '#00AA6C' }} /> {c}
                </label>
              ))}
            </FilterSection>
            <FilterSection title="Price">
              <div style={{ display: 'flex', gap: '8px' }}>
                {priceLevels.map(p => (
                  <button key={p} onClick={() => toggleFilter('priceLevel', p)} style={{
                    padding: '6px 14px', borderRadius: '20px',
                    border: filters.priceLevel.includes(p) ? 'none' : '1px solid #E0E0E0',
                    background: filters.priceLevel.includes(p) ? '#1A1A1A' : 'white',
                    color: filters.priceLevel.includes(p) ? 'white' : '#1A1A1A',
                    fontSize: '13px', cursor: 'pointer'
                  }}>{p}</button>
                ))}
              </div>
            </FilterSection>
            <FilterSection title="Meals">
              {mealOptions.map(m => (
                <label key={m} style={checkboxStyle}>
                  <input type="checkbox" checked={filters.meals.includes(m)} onChange={() => toggleFilter('meals', m)} style={{ accentColor: '#00AA6C' }} /> {m}
                </label>
              ))}
            </FilterSection>
            <FilterSection title="Dietary">
              {dietaryOpts.map(d => (
                <label key={d} style={checkboxStyle}>
                  <input type="checkbox" checked={filters.dietary.includes(d)} onChange={() => toggleFilter('dietary', d)} style={{ accentColor: '#00AA6C' }} /> {d}
                </label>
              ))}
            </FilterSection>
            <FilterSection title="Features">
              {featureOpts.map(f => (
                <label key={f} style={checkboxStyle}>
                  <input type="checkbox" checked={filters.features.includes(f)} onChange={() => toggleFilter('features', f)} style={{ accentColor: '#00AA6C' }} /> {f}
                </label>
              ))}
            </FilterSection>
          </div>
        </aside>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {sortOptions.map(opt => (
                <button key={opt.value} onClick={() => { setSort(opt.value); setPage(1); }} style={{
                  padding: '6px 14px', borderRadius: '20px',
                  border: sort === opt.value ? 'none' : '1px solid #E0E0E0',
                  background: sort === opt.value ? '#1A1A1A' : 'white',
                  color: sort === opt.value ? 'white' : '#1A1A1A',
                  fontSize: '13px', fontWeight: sort === opt.value ? 600 : 400, cursor: 'pointer'
                }}>{opt.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', border: '1px solid #E0E0E0', borderRadius: '4px', background: viewMode === 'list' ? '#1A1A1A' : 'white', color: viewMode === 'list' ? 'white' : '#1A1A1A', cursor: 'pointer' }}><List size={16} /></button>
              <button onClick={() => setViewMode('map')} style={{ padding: '6px 10px', border: '1px solid #E0E0E0', borderRadius: '4px', background: viewMode === 'map' ? '#1A1A1A' : 'white', color: viewMode === 'map' ? 'white' : '#1A1A1A', cursor: 'pointer' }}><Map size={16} /></button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div style={{ width: '100%', height: '600px', background: '#E8E8E8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ color: '#8A8A8A' }}>Map view -- interactive map would appear here</span>
              {filtered.slice(0, 8).map((r, i) => (
                <div key={r.id} title={r.name} style={{ position: 'absolute', left: `${15 + (i % 4) * 20}%`, top: `${20 + Math.floor(i / 4) * 35}%`, width: '12px', height: '12px', borderRadius: '50%', background: '#CC0000', border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', cursor: 'pointer' }} />
              ))}
            </div>
          ) : (
            <>
              {paginated.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <p style={{ color: '#545454', marginBottom: '12px' }}>No restaurants match your filters.</p>
                  <button onClick={clearFilters} style={{ color: '#00AA6C', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Reset filters</button>
                </div>
              ) : (
                paginated.map(rest => <RestaurantCard key={rest.id} restaurant={rest} state={state} />)
              )}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '24px' }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: page === p ? 'none' : '1px solid #E0E0E0', background: page === p ? '#1A1A1A' : 'white', color: page === p ? 'white' : '#1A1A1A', fontSize: '14px', fontWeight: page === p ? 700 : 400, cursor: 'pointer' }}>{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RestaurantCard({ restaurant, state }) {
  const dest = state.destinations.find(d => d.id === restaurant.destinationId);
  return (
    <Link to={`/restaurant/${restaurant.id}`} style={{ textDecoration: 'none', color: '#1A1A1A' }}>
      <div style={{ display: 'flex', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '16px', marginBottom: '12px', background: 'white', transition: 'box-shadow 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
        <div style={{ width: '160px', height: '120px', borderRadius: '8px', background: restaurant.images[0], flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '8px', right: '8px' }}><SaveButton entityId={restaurant.id} entityType="restaurant" size={16} /></div>
        </div>
        <div style={{ flex: 1, marginLeft: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{restaurant.name}</div>
          <div style={{ marginBottom: '4px' }}><RatingBubbles rating={restaurant.rating} size="small" count={restaurant.reviewCount} /></div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
            {restaurant.cuisines.map(c => <span key={c} className="tag-pill">{c}</span>)}
            <span className="tag-pill">{restaurant.priceLevel}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#8A8A8A' }}>
            #{restaurant.rank} of {restaurant.totalRestaurantsInCity} restaurants in {dest?.name}
          </div>
          <div style={{ fontSize: '12px', color: '#545454', marginTop: '4px' }}>{restaurant.hours}</div>
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
        <span style={{ fontWeight: 700, fontSize: '14px' }}>{title}</span>
        <ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {expanded && <div>{children}</div>}
    </div>
  );
}

const checkboxStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', padding: '4px 0' };
