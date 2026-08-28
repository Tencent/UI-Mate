import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Check, MapPin, Anchor, ChevronDown, ChevronUp, Ship, Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Cruises.css'

const CRUISE_LINES = ['Royal Caribbean', 'Norwegian Cruise Line', 'Princess Cruises', 'Carnival Cruise Line', 'Holland America Line']
const DURATIONS = ['3-5 nights', '6-8 nights', '9-12 nights', '13+ nights']

function durationInRange(dur, range) {
  const nights = parseInt(dur)
  if (range === '3-5 nights') return nights >= 3 && nights <= 5
  if (range === '6-8 nights') return nights >= 6 && nights <= 8
  if (range === '9-12 nights') return nights >= 9 && nights <= 12
  if (range === '13+ nights') return nights >= 13
  return true
}

export default function Cruises() {
  const { state, setCart, updateState } = useApp()
  const navigate = useNavigate()
  const { cruises } = state
  const filters = state.cruiseSearchFilters || {}

  const [expandedId, setExpandedId] = useState(null)
  const [selectedCabins, setSelectedCabins] = useState({})
  const [selectedDates, setSelectedDates] = useState({})

  const updateFilters = (updates) => {
    updateState(prev => ({
      ...prev,
      cruiseSearchFilters: { ...prev.cruiseSearchFilters, ...updates }
    }))
  }

  const filteredCruises = useMemo(() => {
    let result = [...cruises]

    if (filters.cruiseLine) {
      result = result.filter(c => c.cruiseLine === filters.cruiseLine)
    }
    if (filters.duration) {
      result = result.filter(c => durationInRange(c.duration, filters.duration))
    }

    if (filters.sortBy === 'price') {
      result.sort((a, b) => a.cabins[0].price - b.cabins[0].price)
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    } else if (filters.sortBy === 'duration_short') {
      result.sort((a, b) => parseInt(a.duration) - parseInt(b.duration))
    } else if (filters.sortBy === 'duration_long') {
      result.sort((a, b) => parseInt(b.duration) - parseInt(a.duration))
    }

    return result
  }, [cruises, filters])

  const handleBook = (cruise) => {
    const cabinType = selectedCabins[cruise.id] || 'Interior'
    const cabin = cruise.cabins.find(c => c.type === cabinType) || cruise.cabins[0]
    const date = selectedDates[cruise.id] || cruise.departDates[0]

    setCart({
      type: 'cruise',
      cruiseId: cruise.id,
      cruiseName: cruise.name,
      cruiseLine: cruise.cruiseLine,
      ship: cruise.ship,
      cruiseImage: cruise.image,
      departure: cruise.departure,
      duration: cruise.duration,
      cabinType: cabin.type,
      departDate: date,
      checkIn: date,
      checkOut: null,
      guests: 2,
      travelers: 2,
      totalPrice: cabin.price * 2,
      pricePerPerson: cabin.price,
      itinerary: cruise.itinerary,
      freeCancellation: true
    })
    navigate('/checkout')
  }

  return (
    <div className="page-content">
      <div className="search-bar-sticky">
        <div className="container search-bar-inner">
          <div className="search-summary">
            <span className="search-summary-item">
              <strong><Ship size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Cruises</strong>
            </span>
            <span className="search-summary-sep">|</span>
            <span>{filteredCruises.length} cruises available</span>
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
                onClick={() => updateFilters({ cruiseLine: '', duration: '', sortBy: 'recommended' })}
              >
                Reset all
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Cruise line</span></div>
              <div className="filter-section-body">
                <button
                  className={`filter-option-btn ${!filters.cruiseLine ? 'selected' : ''}`}
                  onClick={() => updateFilters({ cruiseLine: '' })}
                >
                  All cruise lines
                </button>
                {CRUISE_LINES.map(line => (
                  <button
                    key={line}
                    className={`filter-option-btn ${filters.cruiseLine === line ? 'selected' : ''}`}
                    onClick={() => updateFilters({ cruiseLine: line })}
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Duration</span></div>
              <div className="filter-section-body">
                <button
                  className={`filter-option-btn ${!filters.duration ? 'selected' : ''}`}
                  onClick={() => updateFilters({ duration: '' })}
                >
                  Any duration
                </button>
                {DURATIONS.map(dur => (
                  <button
                    key={dur}
                    className={`filter-option-btn ${filters.duration === dur ? 'selected' : ''}`}
                    onClick={() => updateFilters({ duration: dur })}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="results-column">
            <div className="sort-bar">
              <span className="results-count">{filteredCruises.length} cruises found</span>
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
                  <option value="duration_short">Duration (shortest)</option>
                  <option value="duration_long">Duration (longest)</option>
                </select>
              </div>
            </div>

            {filteredCruises.length === 0 ? (
              <div className="no-results">
                <p>No cruises match your filters.</p>
                <button className="btn-secondary" onClick={() => updateFilters({ cruiseLine: '', duration: '' })}>
                  Clear filters
                </button>
              </div>
            ) : (
              filteredCruises.map(cruise => {
                const lowestCabin = cruise.cabins[0]
                const savings = lowestCabin.originalPrice - lowestCabin.price
                const isExpanded = expandedId === cruise.id
                const selectedCabin = selectedCabins[cruise.id] || 'Interior'
                const currentCabin = cruise.cabins.find(c => c.type === selectedCabin) || cruise.cabins[0]
                const date = selectedDates[cruise.id] || cruise.departDates[0]

                return (
                  <div key={cruise.id} className="cruise-card">
                    <div className="cruise-img-wrap">
                      <img src={cruise.image} alt={cruise.name} className="cruise-img" />
                      {savings > 0 && (
                        <span className="deal-badge badge badge-deal">Save ${savings}</span>
                      )}
                    </div>
                    <div className="cruise-content">
                      <div className="cruise-info">
                        <div className="cruise-line-name">{cruise.cruiseLine}</div>
                        <div className="cruise-name">{cruise.name}</div>
                        <div className="cruise-ship">
                          <Anchor size={12} />
                          <span>{cruise.ship} &middot; {cruise.duration}</span>
                        </div>
                        <div className="cruise-departure">
                          <MapPin size={12} />
                          <span>Departs from {cruise.departure}</span>
                        </div>
                        <div className="cruise-rating">
                          <Star size={12} fill="var(--color-golden-yellow)" color="var(--color-golden-yellow)" />
                          <strong>{cruise.rating}</strong>
                          <span style={{ color: 'var(--color-medium-gray)' }}>({cruise.reviewCount.toLocaleString()} reviews)</span>
                        </div>

                        <div className="cruise-itinerary">
                          <strong style={{ fontSize: '12px' }}>Ports of call:</strong>
                          <div className="cruise-ports">
                            {cruise.itinerary.map((port, i) => (
                              <span key={port} className="cruise-port">
                                {port}{i < cruise.itinerary.length - 1 ? ' → ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="cruise-highlights">
                          {cruise.highlights.slice(0, isExpanded ? undefined : 3).map(h => (
                            <span key={h} className="cruise-highlight">
                              <Check size={11} color="var(--color-success)" />
                              {h}
                            </span>
                          ))}
                        </div>

                        {isExpanded && (
                          <div className="cruise-amenities-section">
                            <strong style={{ fontSize: '12px', display: 'block', marginTop: '8px', marginBottom: '4px' }}>On-board amenities:</strong>
                            <div className="cruise-amenities-list">
                              {cruise.amenities.map(a => (
                                <span key={a} className="amenity-pill">{a}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          className="btn-ghost"
                          style={{ padding: '4px 0', fontSize: '12px' }}
                          onClick={() => setExpandedId(isExpanded ? null : cruise.id)}
                        >
                          {isExpanded ? 'Show less' : 'Show more details'}
                        </button>
                      </div>

                      <div className="cruise-price-area">
                        {currentCabin.originalPrice && (
                          <div className="cruise-original">${currentCabin.originalPrice}</div>
                        )}
                        <div className="cruise-price">${currentCabin.price}</div>
                        <div className="cruise-price-label">per person</div>

                        <div style={{ marginTop: '8px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--color-medium-gray)', display: 'block', marginBottom: '4px' }}>Cabin type</label>
                          <select
                            value={selectedCabin}
                            onChange={e => setSelectedCabins(prev => ({ ...prev, [cruise.id]: e.target.value }))}
                            style={{
                              width: '100%', padding: '4px 6px', border: '1px solid var(--color-border-gray)',
                              borderRadius: '6px', fontSize: '12px', marginBottom: '6px'
                            }}
                          >
                            {cruise.cabins.map(c => (
                              <option key={c.type} value={c.type}>{c.type} - ${c.price}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', color: 'var(--color-medium-gray)', display: 'block', marginBottom: '4px' }}>Departure</label>
                          <select
                            value={date}
                            onChange={e => setSelectedDates(prev => ({ ...prev, [cruise.id]: e.target.value }))}
                            style={{
                              width: '100%', padding: '4px 6px', border: '1px solid var(--color-border-gray)',
                              borderRadius: '6px', fontSize: '12px', marginBottom: '8px'
                            }}
                          >
                            {cruise.departDates.map(d => (
                              <option key={d} value={d}>{new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)' }}>
                          ${currentCabin.price * 2} total (2 guests)
                        </div>

                        <button
                          className="btn-primary"
                          style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                          onClick={() => handleBook(cruise)}
                        >
                          Book cruise
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
