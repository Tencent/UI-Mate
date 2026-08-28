import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/StoreContext';
import { PropertyCard } from '../components/PropertyCard';
import { SearchBar } from '../components/SearchBar';

const SORT_OPTIONS = [
  { value: 'our_top_picks', label: 'Our top picks' },
  { value: 'price_low', label: 'Price (lowest first)' },
  { value: 'price_high', label: 'Price (highest first)' },
  { value: 'review_score', label: 'Best reviewed' },
  { value: 'stars_high', label: 'Stars (5 to 1)' },
];

const FilterSection = ({ title, children }) => (
  <div style={{ borderBottom: '1px solid var(--bc-gray-border)', paddingBottom: 16, marginBottom: 16 }}>
    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--bc-text-dark)' }}>{title}</h4>
    {children}
  </div>
);

const CheckboxFilter = ({ label, checked, onChange, count }) => (
  <label style={{
    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    padding: '4px 0', fontSize: 14, color: 'var(--bc-text-dark)',
  }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ width: 16, height: 16, accentColor: 'var(--bc-blue)', cursor: 'pointer' }}
    />
    <span style={{ flex: 1 }}>{label}</span>
    {count !== undefined && (
      <span style={{ fontSize: 12, color: 'var(--bc-text-light)' }}>{count}</span>
    )}
  </label>
);

export const Search = () => {
  const { data, loading, setSearchFilters } = useAppContext();
  const [urlParams] = useSearchParams();
  const navigate = useNavigate();

  // Local filter state
  const [sortBy, setSortBy] = useState('our_top_picks');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [starFilters, setStarFilters] = useState([]);
  const [reviewFilter, setReviewFilter] = useState(null);
  const [typeFilters, setTypeFilters] = useState([]);
  const [freeCancellationOnly, setFreeCancellationOnly] = useState(false);
  const [breakfastOnly, setBreakfastOnly] = useState(false);

  const destinationQuery = urlParams.get('destination') || '';
  const destId = urlParams.get('dest_id') || null;
  const typeQuery = urlParams.get('type') || null;

  useEffect(() => {
    setSearchFilters({
      priceMin: priceMin === '' ? null : Number(priceMin),
      priceMax: priceMax === '' ? null : Number(priceMax),
      starRating: starFilters,
      reviewScore: reviewFilter,
      propertyType: typeFilters,
      freeCancellation: freeCancellationOnly,
      breakfastIncluded: breakfastOnly,
      sortBy,
    });
  }, [priceMin, priceMax, starFilters, reviewFilter, typeFilters, freeCancellationOnly, breakfastOnly, sortBy]);

  const filteredProperties = useMemo(() => {
    if (!data?.properties) return [];

    let results = [...data.properties];

    // Destination filter
    if (destId) {
      results = results.filter(p => p.destinationId === destId);
    } else if (destinationQuery) {
      const q = destinationQuery.toLowerCase();
      results = results.filter(p =>
        p.city.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
      );
    }

    // Type filter from URL
    if (typeQuery && typeFilters.length === 0) {
      results = results.filter(p => p.type === typeQuery);
    }

    // Type filter from sidebar
    if (typeFilters.length > 0) {
      results = results.filter(p => typeFilters.includes(p.type));
    }

    // Star filter
    if (starFilters.length > 0) {
      results = results.filter(p => starFilters.includes(p.stars));
    }

    // Price filter
    if (priceMin !== '' && !isNaN(priceMin)) {
      results = results.filter(p => p.pricePerNight >= Number(priceMin));
    }
    if (priceMax !== '' && !isNaN(priceMax)) {
      results = results.filter(p => p.pricePerNight <= Number(priceMax));
    }

    // Review filter
    if (reviewFilter) {
      results = results.filter(p => p.reviewScore >= reviewFilter);
    }

    // Free cancellation
    if (freeCancellationOnly) {
      results = results.filter(p => p.freeCancellation);
    }

    // Breakfast
    if (breakfastOnly) {
      results = results.filter(p => p.breakfastIncluded);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        results.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price_high':
        results.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'review_score':
        results.sort((a, b) => (b.reviewScore || 0) - (a.reviewScore || 0));
        break;
      case 'stars_high':
        results.sort((a, b) => (b.stars || 0) - (a.stars || 0));
        break;
      default:
        // our_top_picks: sort by review score * 0.4 + genius boost
        results.sort((a, b) => {
          const scoreA = (a.reviewScore || 0) + (a.genius ? 0.5 : 0);
          const scoreB = (b.reviewScore || 0) + (b.genius ? 0.5 : 0);
          return scoreB - scoreA;
        });
    }

    return results;
  }, [data, destinationQuery, destId, typeQuery, typeFilters, starFilters, priceMin, priceMax, reviewFilter, freeCancellationOnly, breakfastOnly, sortBy]);

  const toggleType = (type) => {
    setTypeFilters(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleStar = (star) => {
    setStarFilters(prev => prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const pageTitle = destinationQuery
    ? `${filteredProperties.length} properties found${destinationQuery ? ` in ${destinationQuery}` : ''}`
    : `${filteredProperties.length} properties found`;

  return (
    <div>
      {/* Search bar at top */}
      <div style={{ background: 'var(--bc-blue-dark)', padding: '12px 0' }}>
        <div className="container--wide">
          <SearchBar compact />
        </div>
      </div>

      {/* Sort bar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--bc-gray-border)', padding: '12px 0' }}>
        <div className="container--wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, color: 'var(--bc-text-medium)' }}>
            <strong style={{ color: 'var(--bc-text-dark)' }}>{pageTitle}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--bc-text-dark)' }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--bc-gray-border)',
                borderRadius: 4,
                fontSize: 14,
                cursor: 'pointer',
                background: 'white',
                outline: 'none',
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container--wide" style={{ padding: '20px 16px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Filter sidebar */}
        <aside style={{ width: 250, flexShrink: 0, background: 'white', border: '1px solid var(--bc-gray-border)', borderRadius: 8, padding: '16px', position: 'sticky', top: 90 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Filter by:</h3>
            <button
              onClick={() => {
                setTypeFilters([]);
                setStarFilters([]);
                setPriceMin('');
                setPriceMax('');
                setReviewFilter(null);
                setFreeCancellationOnly(false);
                setBreakfastOnly(false);
              }}
              style={{ fontSize: 12, color: 'var(--bc-blue)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear all
            </button>
          </div>

          <FilterSection title="Your budget (per night)">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={e => setPriceMin(e.target.value)}
                style={{ width: '50%', padding: '6px 8px', border: '1px solid var(--bc-gray-border)', borderRadius: 4, fontSize: 13 }}
              />
              <span style={{ fontSize: 12 }}>–</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={e => setPriceMax(e.target.value)}
                style={{ width: '50%', padding: '6px 8px', border: '1px solid var(--bc-gray-border)', borderRadius: 4, fontSize: 13 }}
              />
            </div>
            {[50, 100, 200, 500].map(max => (
              <CheckboxFilter
                key={max}
                label={`Up to US$${max}`}
                checked={priceMax === String(max)}
                onChange={() => setPriceMax(priceMax === String(max) ? '' : String(max))}
              />
            ))}
          </FilterSection>

          <FilterSection title="Review score">
            {[{ min: 9, label: 'Wonderful: 9+' }, { min: 8, label: 'Very good: 8+' }, { min: 7, label: 'Good: 7+' }].map(({ min, label }) => (
              <CheckboxFilter
                key={min}
                label={label}
                checked={reviewFilter === min}
                onChange={() => setReviewFilter(reviewFilter === min ? null : min)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Property type">
            {[
              { type: 'hotel', label: 'Hotels' },
              { type: 'apartment', label: 'Apartments' },
              { type: 'resort', label: 'Resorts' },
              { type: 'villa', label: 'Villas' },
              { type: 'hostel', label: 'Hostels' },
              { type: 'guesthouse', label: 'Guesthouses' },
            ].map(({ type, label }) => {
              const count = data?.properties?.filter(p => p.type === type).length || 0;
              return (
                <CheckboxFilter
                  key={type}
                  label={label}
                  checked={typeFilters.includes(type)}
                  onChange={() => toggleType(type)}
                  count={count}
                />
              );
            })}
          </FilterSection>

          <FilterSection title="Star rating">
            {[5, 4, 3, 2, 1].map(star => (
              <CheckboxFilter
                key={star}
                label={'★'.repeat(star)}
                checked={starFilters.includes(star)}
                onChange={() => toggleStar(star)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Facilities">
            <CheckboxFilter
              label="Free cancellation"
              checked={freeCancellationOnly}
              onChange={() => setFreeCancellationOnly(!freeCancellationOnly)}
            />
            <CheckboxFilter
              label="Breakfast included"
              checked={breakfastOnly}
              onChange={() => setBreakfastOnly(!breakfastOnly)}
            />
          </FilterSection>
        </aside>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {filteredProperties.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1px solid var(--bc-gray-border)',
              borderRadius: 8,
              padding: 40,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No results found</h3>
              <p style={{ fontSize: 14, color: 'var(--bc-text-medium)', marginBottom: 20 }}>
                Try adjusting your search criteria or remove some filters.
              </p>
              <button
                onClick={() => {
                  setTypeFilters([]);
                  setStarFilters([]);
                  setPriceMin('');
                  setPriceMax('');
                  setReviewFilter(null);
                  setFreeCancellationOnly(false);
                  setBreakfastOnly(false);
                }}
                style={{
                  background: 'var(--bc-blue)', color: 'white', border: 'none', borderRadius: 4,
                  padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
