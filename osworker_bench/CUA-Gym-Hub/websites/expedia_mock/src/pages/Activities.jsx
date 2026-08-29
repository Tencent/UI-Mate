import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Clock, MapPin, Check, ChevronDown, ChevronUp, Heart } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Activities.css'

const CATEGORIES = ['Tours', 'Attractions', 'Shows', 'Day trips', 'Outdoor', 'Food & Drink']

export default function Activities() {
  const { state, setCart, updateState } = useApp()
  const navigate = useNavigate()
  const { activities } = state
  const filters = state.activitySearchFilters || {}

  const [expandedId, setExpandedId] = useState(null)

  const updateFilters = (updates) => {
    updateState(prev => ({
      ...prev,
      activitySearchFilters: { ...prev.activitySearchFilters, ...updates }
    }))
  }

  const filteredActivities = useMemo(() => {
    let result = [...activities]

    if (filters.categories?.length > 0) {
      result = result.filter(a => filters.categories.includes(a.category))
    }
    if (filters.priceMax && filters.priceMax < 300) {
      result = result.filter(a => a.price <= filters.priceMax)
    }
    if (filters.freeCancellationOnly) {
      result = result.filter(a => a.freeCancellation)
    }

    if (filters.sortBy === 'price') {
      result.sort((a, b) => a.price - b.price)
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    } else if (filters.sortBy === 'popular') {
      result.sort((a, b) => b.reviewCount - a.reviewCount)
    }

    return result
  }, [activities, filters])

  const toggleCategory = (cat) => {
    const arr = filters.categories || []
    const next = arr.includes(cat) ? arr.filter(c => c !== cat) : [...arr, cat]
    updateFilters({ categories: next })
  }

  const handleBook = (activity) => {
    setCart({
      type: 'activity',
      activityId: activity.id,
      activityName: activity.name,
      activityImage: activity.image,
      location: activity.location,
      duration: activity.duration,
      date: filters.date || '2026-05-15',
      totalPrice: activity.price,
      pricePerPerson: activity.price,
      travelers: 1,
      freeCancellation: activity.freeCancellation
    })
    navigate('/checkout')
  }

  return (
    <div className="page-content">
      <div className="search-bar-sticky">
        <div className="container search-bar-inner">
          <div className="search-summary">
            <span className="search-summary-item">
              <strong>{filters.location || 'New York, NY'}</strong>
            </span>
            <span className="search-summary-sep">|</span>
            <span>{filters.date || 'Any date'}</span>
          </div>
          <button
            className="btn-primary"
            style={{ height: '36px', padding: '0 16px', fontSize: '14px', borderRadius: '8px' }}
            onClick={() => navigate('/')}
          >
            Modify search
          </button>
        </div>
      </div>

      <div className="container">
        <div className="results-layout" style={{ padding: '24px 0' }}>
          {/* Filter sidebar */}
          <aside className="filter-sidebar">
            <div className="filter-header">
              <strong>Filter by</strong>
              <button
                className="btn-ghost"
                style={{ padding: '0', fontSize: '12px' }}
                onClick={() => updateFilters({ categories: [], priceMax: 300, freeCancellationOnly: false })}
              >
                Reset all
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Category</span></div>
              <div className="filter-section-body">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.categories || []).includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Price (max)</span></div>
              <div className="filter-section-body">
                <div className="price-labels">
                  <span>$0</span>
                  <span>${filters.priceMax || 300}</span>
                </div>
                <input
                  type="range"
                  min={0} max={300}
                  value={filters.priceMax || 300}
                  onChange={e => updateFilters({ priceMax: Number(e.target.value) })}
                  className="price-slider"
                />
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Options</span></div>
              <div className="filter-section-body">
                <label className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.freeCancellationOnly || false}
                    onChange={e => updateFilters({ freeCancellationOnly: e.target.checked })}
                  />
                  Free cancellation only
                </label>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="results-column">
            <div className="sort-bar">
              <span className="results-count">{filteredActivities.length} things to do</span>
              <div className="sort-control">
                <span>Sort by: </span>
                <select
                  value={filters.sortBy || 'recommended'}
                  onChange={e => updateFilters({ sortBy: e.target.value })}
                  className="sort-select"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price">Price (lowest)</option>
                  <option value="rating">Rating (highest)</option>
                  <option value="popular">Most popular</option>
                </select>
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="no-results">
                <p>No activities match your filters.</p>
                <button className="btn-secondary" onClick={() => updateFilters({ categories: [], priceMax: 300, freeCancellationOnly: false })}>
                  Clear filters
                </button>
              </div>
            ) : (
              filteredActivities.map(activity => {
                const savings = activity.originalPrice
                  ? Math.round((1 - activity.price / activity.originalPrice) * 100)
                  : 0
                const isExpanded = expandedId === activity.id

                return (
                  <div key={activity.id} className="activity-card">
                    <div className="activity-img-wrap">
                      <img src={activity.image} alt={activity.name} className="activity-img" />
                      {savings > 0 && (
                        <span className="deal-badge badge badge-deal">Save {savings}%</span>
                      )}
                    </div>
                    <div className="activity-content">
                      <div className="activity-info">
                        <span className="badge" style={{ background: 'var(--color-bg-light)', fontSize: '11px', marginBottom: '4px' }}>
                          {activity.category}
                        </span>
                        <div className="activity-name">{activity.name}</div>
                        <div className="activity-location">
                          <MapPin size={12} />
                          <span>{activity.location}</span>
                        </div>
                        <div className="activity-duration">
                          <Clock size={12} />
                          <span>{activity.duration}</span>
                        </div>
                        <div className="activity-rating">
                          <Star size={12} fill="var(--color-golden-yellow)" color="var(--color-golden-yellow)" />
                          <strong>{activity.rating}</strong>
                          <span style={{ color: 'var(--color-medium-gray)' }}>({activity.reviewCount.toLocaleString()} reviews)</span>
                        </div>
                        <div className="activity-highlights">
                          {activity.highlights.slice(0, isExpanded ? undefined : 2).map(h => (
                            <span key={h} className="activity-highlight">
                              <Check size={11} color="var(--color-success)" />
                              {h}
                            </span>
                          ))}
                        </div>
                        {activity.highlights.length > 2 && (
                          <button
                            className="btn-ghost"
                            style={{ padding: '2px 0', fontSize: '12px' }}
                            onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                          >
                            {isExpanded ? 'Show less' : `+${activity.highlights.length - 2} more`}
                          </button>
                        )}
                        {isExpanded && (
                          <p className="activity-description">{activity.description}</p>
                        )}
                      </div>
                      <div className="activity-price-area">
                        {activity.originalPrice && (
                          <div className="activity-original">${activity.originalPrice}</div>
                        )}
                        <div className="activity-price">${activity.price}</div>
                        <div className="activity-price-label">per person</div>
                        {activity.freeCancellation && (
                          <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={10} /> Free cancellation
                          </div>
                        )}
                        <button
                          className="btn-primary"
                          style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                          onClick={() => handleBook(activity)}
                        >
                          Book now
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
