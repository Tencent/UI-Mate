import React, { useState } from 'react';
import { ChevronDown, X, Star, Tag, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './FilterBar.css';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Rating' },
  { value: 'delivery_time', label: 'Delivery Time' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'];

export default function FilterBar() {
  const { state, updateFilters } = useApp();
  const filters = state.ui.activeFilters;
  const [sortOpen, setSortOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [dietaryOpen, setDietaryOpen] = useState(false);

  const hasActiveFilters = filters.sort !== 'recommended' ||
    filters.priceRange.length > 0 ||
    filters.dietary.length > 0 ||
    filters.maxDeliveryFee !== null ||
    filters.deals;

  const togglePrice = (p) => {
    const current = filters.priceRange || [];
    const updated = current.includes(p) ? current.filter(x => x !== p) : [...current, p];
    updateFilters({ priceRange: updated });
  };

  const toggleDietary = (d) => {
    const current = filters.dietary || [];
    const updated = current.includes(d) ? current.filter(x => x !== d) : [...current, d];
    updateFilters({ dietary: updated });
  };

  const clearAll = () => {
    updateFilters({
      sort: 'recommended',
      priceRange: [],
      dietary: [],
      maxDeliveryFee: null,
      deals: false
    });
  };

  return (
    <div className="filter-bar scrollbar-hide">
      {/* Offers pill */}
      <button
        className={`filter-bar__pill ${filters.deals ? 'filter-bar__pill--active' : ''}`}
        onClick={() => updateFilters({ deals: !filters.deals })}
      >
        <Tag size={14} />
        Offers
      </button>

      {/* Under 30 min */}
      <button
        className={`filter-bar__pill ${filters.maxDeliveryFee === 30 ? 'filter-bar__pill--active' : ''}`}
        onClick={() => updateFilters({ sort: filters.sort === 'delivery_time' ? 'recommended' : 'delivery_time' })}
      >
        Under 30 min
      </button>

      {/* Best overall */}
      <button
        className={`filter-bar__pill ${filters.sort === 'popular' ? 'filter-bar__pill--active' : ''}`}
        onClick={() => updateFilters({ sort: filters.sort === 'popular' ? 'recommended' : 'popular' })}
      >
        <Star size={14} />
        Best overall
      </button>

      {/* Rating dropdown */}
      <div className="filter-bar__dropdown-wrap">
        <button
          className={`filter-bar__pill ${filters.sort === 'rating' ? 'filter-bar__pill--active' : ''}`}
          onClick={() => { setRatingOpen(!ratingOpen); setSortOpen(false); setPriceOpen(false); setDietaryOpen(false); }}
        >
          <Star size={14} />
          Rating
          <ChevronDown size={14} />
        </button>
        {ratingOpen && (
          <>
            <div className="filter-bar__dropdown-backdrop" onClick={() => setRatingOpen(false)} />
            <div className="filter-bar__dropdown">
              <button
                className={`filter-bar__dropdown-item ${filters.sort === 'rating' ? 'filter-bar__dropdown-item--active' : ''}`}
                onClick={() => { updateFilters({ sort: 'rating' }); setRatingOpen(false); }}
              >
                Highest Rated
              </button>
              <button
                className={`filter-bar__dropdown-item ${filters.sort === 'recommended' ? 'filter-bar__dropdown-item--active' : ''}`}
                onClick={() => { updateFilters({ sort: 'recommended' }); setRatingOpen(false); }}
              >
                Recommended
              </button>
            </div>
          </>
        )}
      </div>

      {/* Price dropdown */}
      <div className="filter-bar__dropdown-wrap">
        <button
          className={`filter-bar__pill ${filters.priceRange.length > 0 ? 'filter-bar__pill--active' : ''}`}
          onClick={() => { setPriceOpen(!priceOpen); setSortOpen(false); setRatingOpen(false); setDietaryOpen(false); }}
        >
          Price
          <ChevronDown size={14} />
        </button>
        {priceOpen && (
          <>
            <div className="filter-bar__dropdown-backdrop" onClick={() => setPriceOpen(false)} />
            <div className="filter-bar__dropdown filter-bar__dropdown--price">
              <div className="filter-bar__price-grid">
                {PRICE_OPTIONS.map(p => (
                  <button
                    key={p}
                    className={`filter-bar__price-btn ${filters.priceRange.includes(p) ? 'filter-bar__price-btn--active' : ''}`}
                    onClick={() => togglePrice(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dietary dropdown */}
      <div className="filter-bar__dropdown-wrap">
        <button
          className={`filter-bar__pill ${filters.dietary.length > 0 ? 'filter-bar__pill--active' : ''}`}
          onClick={() => { setDietaryOpen(!dietaryOpen); setSortOpen(false); setRatingOpen(false); setPriceOpen(false); }}
        >
          Dietary
          <ChevronDown size={14} />
        </button>
        {dietaryOpen && (
          <>
            <div className="filter-bar__dropdown-backdrop" onClick={() => setDietaryOpen(false)} />
            <div className="filter-bar__dropdown">
              {DIETARY_OPTIONS.map(d => (
                <button
                  key={d}
                  className={`filter-bar__dropdown-item ${filters.dietary.includes(d.toLowerCase()) ? 'filter-bar__dropdown-item--active' : ''}`}
                  onClick={() => toggleDietary(d.toLowerCase())}
                >
                  {d}
                  {filters.dietary.includes(d.toLowerCase()) && <span className="filter-bar__check">&#10003;</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sort dropdown */}
      <div className="filter-bar__dropdown-wrap">
        <button
          className={`filter-bar__pill ${filters.sort !== 'recommended' ? 'filter-bar__pill--active' : ''}`}
          onClick={() => { setSortOpen(!sortOpen); setRatingOpen(false); setPriceOpen(false); setDietaryOpen(false); }}
        >
          Sort
          <ChevronDown size={14} />
        </button>
        {sortOpen && (
          <>
            <div className="filter-bar__dropdown-backdrop" onClick={() => setSortOpen(false)} />
            <div className="filter-bar__dropdown">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`filter-bar__dropdown-item ${filters.sort === opt.value ? 'filter-bar__dropdown-item--active' : ''}`}
                  onClick={() => { updateFilters({ sort: opt.value }); setSortOpen(false); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <button className="filter-bar__clear" onClick={clearAll}>
          <X size={14} />
          Clear all
        </button>
      )}
    </div>
  );
}
