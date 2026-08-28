import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from '../components/RatingBubbles.jsx';
import SaveButton from '../components/SaveButton.jsx';

const categoryOptions = ['Sights & Landmarks', 'Museums', 'Tours', 'Outdoor Activities', 'Shopping', 'Nightlife', 'Spas', 'Food & Drink'];
const priceRanges = [
  { label: 'Free', min: 0, max: 0 },
  { label: '$0-$25', min: 0, max: 25 },
  { label: '$25-$50', min: 25, max: 50 },
  { label: '$50-$100', min: 50, max: 100 },
  { label: '$100+', min: 100, max: 9999 }
];
const durationOptions = ['Up to 1 hour', '1-4 hours', '4+ hours', 'Full day'];
const sortOptions = [
  { value: 'bestValue', label: 'Best Value' },
  { value: 'travelerRanked', label: 'Traveler Ranked' },
  { value: 'priceLow', label: 'Price (low to high)' }
];

export default function AttractionSearch() {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const destId = searchParams.get('destination');
  const queryStr = searchParams.get('q') || '';

  const [filters, setFilters] = useState({ category: [], priceRange: null, duration: [], ratingMin: 0 });
  const [sort, setSort] = useState('bestValue');
  const [page, setPage] = useState(1);

  const destination = destId ? state.destinations.find(d => d.id === destId) : null;

  const filtered = useMemo(() => {
    let results = [...state.attractions];
    if (destId) results = results.filter(a => a.destinationId === destId);
    if (queryStr) {
      const q = queryStr.toLowerCase();
      results = results.filter(a => {
        const dest = state.destinations.find(d => d.id === a.destinationId);
        return a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (dest && dest.name.toLowerCase().includes(q));
      });
    }
    if (filters.category.length > 0) results = results.filter(a => filters.category.includes(a.category));
    if (filters.priceRange) {
      results = results.filter(a => a.price >= filters.priceRange.min && a.price <= filters.priceRange.max);
    }
    if (filters.duration.length > 0) {
      results = results.filter(a => filters.duration.some(d => a.duration.toLowerCase().includes(d.toLowerCase().replace('up to ', '').replace('+', ''))));
    }
    if (filters.ratingMin > 0) results = results.filter(a => a.rating >= filters.ratingMin);

    switch (sort) {
      case 'travelerRanked': results.sort((a, b) => a.rank - b.rank); break;
      case 'priceLow': results.sort((a, b) => a.price - b.price); break;
      default: results.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount)); break;
    }
    return results;
  }, [state.attractions, destId, queryStr, filters, sort]);

  const toggleCategory = (c) => {
    setFilters(prev => ({ ...prev, category: prev.category.includes(c) ? prev.category.filter(v => v !== c) : [...prev.category, c] }));
    setPage(1);
  };

  const toggleDuration = (d) => {
    setFilters(prev => ({ ...prev, duration: prev.duration.includes(d) ? prev.duration.filter(v => v !== d) : [...prev.duration, d] }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: [], priceRange: null, duration: [], ratingMin: 0 });
    setPage(1);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
        {destination ? `Things to Do in ${destination.name}` : queryStr ? `Attractions matching "${queryStr}"` : 'All Things to Do'}
      </h1>
      <p style={{ color: '#545454', fontSize: '14px', marginBottom: '20px' }}>{filtered.length} attractions found</p>

      <div style={{ display: 'flex', gap: '24px' }}>
        <aside style={{ width: '280px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '72px' }}>
            <FilterSection title="Category">
              {categoryOptions.map(c => (
                <label key={c} style={checkboxStyle}>
                  <input type="checkbox" checked={filters.category.includes(c)} onChange={() => toggleCategory(c)} style={{ accentColor: '#00AA6C' }} /> {c}
                </label>
              ))}
            </FilterSection>
            <FilterSection title="Price">
              {priceRanges.map(p => (
                <label key={p.label} style={checkboxStyle}>
                  <input type="radio" name="priceRange" checked={filters.priceRange?.label === p.label} onChange={() => { setFilters(prev => ({ ...prev, priceRange: p })); setPage(1); }} style={{ accentColor: '#00AA6C' }} /> {p.label}
                </label>
              ))}
              {filters.priceRange && (
                <button onClick={() => { setFilters(prev => ({ ...prev, priceRange: null })); setPage(1); }} style={{ fontSize: '12px', color: '#00AA6C', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>Clear</button>
              )}
            </FilterSection>
            <FilterSection title="Duration">
              {durationOptions.map(d => (
                <label key={d} style={checkboxStyle}>
                  <input type="checkbox" checked={filters.duration.includes(d)} onChange={() => toggleDuration(d)} style={{ accentColor: '#00AA6C' }} /> {d}
                </label>
              ))}
            </FilterSection>
            <FilterSection title="Rating">
              {[
                { label: 'Excellent 4.5+', min: 4.5 },
                { label: 'Very Good 4.0+', min: 4.0 },
                { label: 'Average 3.0+', min: 3.0 }
              ].map(r => (
                <label key={r.label} style={checkboxStyle}>
                  <input type="radio" name="ratingFilter" checked={filters.ratingMin === r.min} onChange={() => { setFilters(p => ({ ...p, ratingMin: r.min })); setPage(1); }} style={{ accentColor: '#00AA6C' }} /> {r.label}
                </label>
              ))}
            </FilterSection>
          </div>
        </aside>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
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

          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ color: '#545454', marginBottom: '12px' }}>No attractions match your filters.</p>
              <button onClick={clearFilters} style={{ color: '#00AA6C', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Reset filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {filtered.map(attr => {
                const dest = state.destinations.find(d => d.id === attr.destinationId);
                return (
                  <Link key={attr.id} to={`/attraction/${attr.id}`} style={{
                    textDecoration: 'none', color: '#1A1A1A', border: '1px solid #E0E0E0', borderRadius: '12px',
                    overflow: 'hidden', transition: 'box-shadow 0.2s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ height: '180px', background: attr.images[0], position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '8px', right: '8px' }}><SaveButton entityId={attr.id} entityType="attraction" size={16} /></div>
                      {attr.travelersChoice && (
                        <div className="travelers-choice-badge" style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '10px', padding: '2px 6px' }}>
                          Travelers' Choice
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{attr.name}</div>
                      <RatingBubbles rating={attr.rating} size="small" count={attr.reviewCount} />
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <span className="tag-pill">{attr.category}</span>
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '15px' }}>
                          {attr.price === 0 ? 'Free' : `from $${attr.price}`}
                        </span>
                        <span style={{ fontSize: '12px', color: '#8A8A8A' }}>{attr.duration}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
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
