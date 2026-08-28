import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, X, Clock, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import RestaurantCard from '../components/RestaurantCard';
import './SearchPage.css';

export default function SearchPage() {
  const { state, setSearchQuery } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const [inputValue, setInputValue] = useState(queryParam || categoryParam);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (queryParam) setInputValue(queryParam);
    if (categoryParam) setInputValue(categoryParam);
  }, [queryParam, categoryParam]);

  // Debounced URL sync while typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = inputValue.trim();
      if (trimmed) {
        navigate('/search?q=' + encodeURIComponent(trimmed), { replace: true });
      } else if (queryParam || categoryParam) {
        navigate('/search', { replace: true });
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  const results = useMemo(() => {
    const searchTerm = (queryParam || categoryParam).toLowerCase();
    if (!searchTerm) return [];

    return state.restaurants.filter(r => {
      const nameMatch = r.name.toLowerCase().includes(searchTerm);
      const cuisineMatch = r.cuisineType.some(c => c.toLowerCase().includes(searchTerm));
      const tagMatch = r.tags.some(t => t.toLowerCase().includes(searchTerm));
      // Check menu items for matching food names
      const menuMatch = state.menuItems.some(
        m => m.restaurantId === r.id && (m.name.toLowerCase().includes(searchTerm) || m.category.toLowerCase().includes(searchTerm))
      );
      return nameMatch || cuisineMatch || tagMatch || menuMatch;
    });
  }, [state.restaurants, state.menuItems, queryParam, categoryParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
      setSearchQuery(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSearchParams({});
  };

  const hasQuery = !!(queryParam || categoryParam);

  return (
    <div className="search-page">
      {/* Search input */}
      <div className="search-page__bar">
        <Link to="/" className="search-page__back">
          <ArrowLeft size={20} />
        </Link>
        <form className="search-page__form" onSubmit={handleSubmit}>
          <Search size={18} className="search-page__icon" />
          <input
            type="text"
            className="search-page__input"
            placeholder="Search for restaurant or cuisine"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          {inputValue && (
            <button type="button" className="search-page__clear" onClick={handleClear}>
              <X size={16} />
            </button>
          )}
        </form>
      </div>

      {/* Results or suggestions */}
      {hasQuery ? (
        <div className="search-page__results">
          <p className="search-page__count">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{queryParam || categoryParam}"
          </p>
          {results.length === 0 ? (
            <div className="search-page__no-results">
              <p>No restaurants found. Try a different search term.</p>
            </div>
          ) : (
            <div className="search-page__grid">
              {results.map(r => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="search-page__suggestions">
          {/* Recent searches */}
          {state.ui.recentSearches && state.ui.recentSearches.length > 0 && (
            <section className="search-page__section">
              <h3 className="search-page__section-title">Recent searches</h3>
              <div className="search-page__recent">
                {state.ui.recentSearches.map((term, idx) => (
                  <button
                    key={idx}
                    className="search-page__recent-item"
                    onClick={() => {
                      setInputValue(term);
                      setSearchParams({ q: term });
                    }}
                  >
                    <Clock size={14} />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Browse by cuisine */}
          <section className="search-page__section">
            <h3 className="search-page__section-title">Browse by category</h3>
            <div className="search-page__cats">
              {state.categories.map(cat => (
                <button
                  key={cat.id}
                  className="search-page__cat-btn"
                  onClick={() => {
                    setInputValue(cat.name);
                    setSearchParams({ category: cat.name });
                  }}
                >
                  <span className="search-page__cat-icon">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
