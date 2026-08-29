import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Heart, MapPin, Wifi, Waves, Dumbbell, Coffee, Check, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Hotels.css'

function getRatingClass(rating) {
  if (rating >= 8) return 'excellent'
  if (rating >= 7) return 'very-good'
  return 'good'
}

function getRatingLabel(rating) {
  if (rating >= 9) return 'Exceptional'
  if (rating >= 8) return 'Excellent'
  if (rating >= 7) return 'Very Good'
  return 'Good'
}

const AMENITIES_OPTIONS = ['Free WiFi', 'Pool', 'Fitness center', 'Restaurant', 'Parking', 'Spa', 'Pet-friendly', 'Kitchen']
const PROPERTY_TYPES = ['Hotel', 'Resort', 'Vacation Rental', 'Apartment', 'Motel', 'Inn']
const NEIGHBORHOODS = ['Midtown Manhattan', 'Times Square', 'Meatpacking District', 'Lower East Side', 'Midtown East', 'NoMad', 'Union Square', 'Downtown']

export default function Hotels() {
  const { state, updateSearchFilters, toggleSavedProperty } = useApp()
  const navigate = useNavigate()
  const { hotels, searchFilters, user } = state

  const [compareList, setCompareList] = useState([])
  const [showCompareModal, setShowCompareModal] = useState(false)

  const filters = searchFilters

  // Apply filters
  const filtered = useMemo(() => {
    let result = [...hotels]

    if (filters.priceMin > 0) {
      result = result.filter(h => h.rooms.some(r => r.pricePerNight >= filters.priceMin))
    }
    if (filters.priceMax < 1000) {
      result = result.filter(h => h.rooms.some(r => r.pricePerNight <= filters.priceMax))
    }
    if (filters.starRatings?.length > 0) {
      result = result.filter(h => filters.starRatings.includes(h.starRating))
    }
    if (filters.guestRatingMin > 0) {
      result = result.filter(h => h.guestRating >= filters.guestRatingMin)
    }
    if (filters.propertyTypes?.length > 0) {
      result = result.filter(h => filters.propertyTypes.includes(h.type))
    }
    if (filters.amenities?.length > 0) {
      result = result.filter(h => filters.amenities.every(a => h.amenities.includes(a)))
    }
    if (filters.neighborhoods?.length > 0) {
      result = result.filter(h => filters.neighborhoods.includes(h.neighborhood))
    }
    if (filters.freeCancellation) {
      result = result.filter(h => h.rooms.some(r => r.freeCancellation))
    }
    if (filters.payLater) {
      result = result.filter(h => h.rooms.some(r => r.payLater))
    }

    // Sort
    if (filters.sortBy === 'price_low') {
      result.sort((a, b) => Math.min(...a.rooms.map(r => r.pricePerNight)) - Math.min(...b.rooms.map(r => r.pricePerNight)))
    } else if (filters.sortBy === 'price_high') {
      result.sort((a, b) => Math.min(...b.rooms.map(r => r.pricePerNight)) - Math.min(...a.rooms.map(r => r.pricePerNight)))
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.guestRating - a.guestRating)
    } else if (filters.sortBy === 'distance') {
      result.sort((a, b) => parseFloat(a.distanceFromCenter) - parseFloat(b.distanceFromCenter))
    }

    return result
  }, [hotels, filters])

  const toggleFilter = (key, value) => {
    const arr = filters[key] || []
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    updateSearchFilters({ [key]: next })
  }

  const toggleCompare = (hotelId) => {
    setCompareList(prev => {
      if (prev.includes(hotelId)) return prev.filter(id => id !== hotelId)
      if (prev.length >= 3) return prev
      return [...prev, hotelId]
    })
  }

  const isHotelSaved = (id) => (user?.savedProperties || []).includes(id)

  return (
    <div className="page-content">
      {/* Search modification bar */}
      <div className="search-bar-sticky">
        <div className="container search-bar-inner">
          <div className="search-summary">
            <span className="search-summary-item">
              <strong>{searchFilters.destination || 'New York, NY'}</strong>
            </span>
            <span className="search-summary-sep">|</span>
            <span className="search-summary-item">
              {searchFilters.checkIn} – {searchFilters.checkOut}
            </span>
            <span className="search-summary-sep">|</span>
            <span className="search-summary-item">
              {searchFilters.guests} travelers, {searchFilters.rooms} room
            </span>
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
        <div className="hotels-layout">
          {/* Filter Sidebar */}
          <aside className="filter-sidebar">
            <div className="filter-header">
              <strong>Filter by</strong>
              <button
                className="btn-ghost"
                style={{ padding: '0', fontSize: '12px' }}
                onClick={() => updateSearchFilters({
                  priceMin: 0, priceMax: 1000, starRatings: [], guestRatingMin: 0,
                  amenities: [], propertyTypes: [], neighborhoods: [], freeCancellation: false, payLater: false
                })}
              >
                Reset all
              </button>
            </div>

            {/* Price Range */}
            <FilterSection title="Price range">
              <div className="price-range">
                <div className="price-labels">
                  <span>${filters.priceMin}</span>
                  <span>${filters.priceMax}+</span>
                </div>
                <input
                  type="range"
                  min={0} max={1000} step={25}
                  value={filters.priceMax}
                  onChange={e => updateSearchFilters({ priceMax: Number(e.target.value) })}
                  className="price-slider"
                />
              </div>
            </FilterSection>

            {/* Star Rating */}
            <FilterSection title="Star rating">
              <div className="star-filter">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    className={`star-btn ${(filters.starRatings || []).includes(s) ? 'selected' : ''}`}
                    onClick={() => toggleFilter('starRatings', s)}
                  >
                    {Array.from({length: s}).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* Guest Rating */}
            <FilterSection title="Guest rating">
              {[
                { label: 'Any', min: 0 },
                { label: '7+ Good', min: 7 },
                { label: '8+ Very Good', min: 8 },
                { label: '9+ Excellent', min: 9 }
              ].map(opt => (
                <button
                  key={opt.min}
                  className={`filter-option-btn ${filters.guestRatingMin === opt.min ? 'selected' : ''}`}
                  onClick={() => updateSearchFilters({ guestRatingMin: opt.min })}
                >
                  {opt.label}
                </button>
              ))}
            </FilterSection>

            {/* Property Type */}
            <FilterSection title="Property type">
              {PROPERTY_TYPES.map(pt => (
                <label key={pt} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.propertyTypes || []).includes(pt)}
                    onChange={() => toggleFilter('propertyTypes', pt)}
                  />
                  {pt}
                </label>
              ))}
            </FilterSection>

            {/* Amenities */}
            <FilterSection title="Amenities">
              {AMENITIES_OPTIONS.map(a => (
                <label key={a} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.amenities || []).includes(a)}
                    onChange={() => toggleFilter('amenities', a)}
                  />
                  {a}
                </label>
              ))}
            </FilterSection>

            {/* Payment */}
            <FilterSection title="Payment options">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.freeCancellation}
                  onChange={e => updateSearchFilters({ freeCancellation: e.target.checked })}
                />
                Free cancellation
              </label>
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.payLater}
                  onChange={e => updateSearchFilters({ payLater: e.target.checked })}
                />
                Reserve now, pay later
              </label>
            </FilterSection>

            {/* Neighborhood */}
            <FilterSection title="Neighborhood">
              {NEIGHBORHOODS.map(n => (
                <label key={n} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={(filters.neighborhoods || []).includes(n)}
                    onChange={() => toggleFilter('neighborhoods', n)}
                  />
                  {n}
                </label>
              ))}
            </FilterSection>
          </aside>

          {/* Results */}
          <div className="results-column">
            {/* Sort bar */}
            <div className="sort-bar">
              <span className="results-count">{filtered.length} properties found</span>
              <div className="sort-control">
                <span>Sort by: </span>
                <select
                  value={filters.sortBy}
                  onChange={e => updateSearchFilters({ sortBy: e.target.value })}
                  className="sort-select"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price (low to high)</option>
                  <option value="price_high">Price (high to low)</option>
                  <option value="rating">Guest rating</option>
                  <option value="distance">Distance from center</option>
                </select>
              </div>
            </div>

            {/* Hotel cards */}
            {filtered.length === 0 ? (
              <div className="no-results">
                <p>No properties match your filters.</p>
                <button className="btn-secondary" onClick={() => updateSearchFilters({ starRatings: [], guestRatingMin: 0, amenities: [], propertyTypes: [] })}>
                  Clear filters
                </button>
              </div>
            ) : (
              filtered.map(hotel => {
                const bestRoom = hotel.rooms.filter(r => r.availability !== 'sold out').sort((a,b) => a.pricePerNight - b.pricePerNight)[0] || hotel.rooms[0]
                const saved = isHotelSaved(hotel.id)
                const comparing = compareList.includes(hotel.id)

                return (
                  <div key={hotel.id} className="hotel-card" onClick={() => navigate(`/hotels/${hotel.id}`)}>
                    {/* Image */}
                    <div className="hotel-card-img-wrap">
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="hotel-card-img"
                      />
                      <button
                        className={`hotel-heart ${saved ? 'saved' : ''}`}
                        onClick={e => { e.stopPropagation(); toggleSavedProperty(hotel.id) }}
                      >
                        <Heart size={18} fill={saved ? '#E21C5B' : 'none'} color={saved ? '#E21C5B' : 'white'} />
                      </button>
                      <label
                        className="compare-check"
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={comparing}
                          onChange={() => toggleCompare(hotel.id)}
                          disabled={!comparing && compareList.length >= 3}
                        />
                        Compare
                      </label>
                    </div>

                    {/* Content */}
                    <div className="hotel-card-content">
                      <div className="hotel-card-main">
                        <div className="hotel-name">{hotel.name}</div>
                        <div className="hotel-stars">
                          {Array.from({length: hotel.starRating}).map((_, i) => (
                            <Star key={i} size={12} fill="var(--color-golden-yellow)" color="var(--color-golden-yellow)" />
                          ))}
                        </div>
                        <div className="hotel-neighborhood">
                          <MapPin size={12} />
                          {hotel.neighborhood} &middot; {hotel.distanceFromCenter}
                        </div>

                        {/* Rating */}
                        <div className="hotel-rating-row">
                          <div className={`rating-badge ${getRatingClass(hotel.guestRating)}`}>
                            {hotel.guestRating}
                          </div>
                          <div>
                            <div className="rating-label">{getRatingLabel(hotel.guestRating)}</div>
                            <div className="review-count">{hotel.reviewCount.toLocaleString()} reviews</div>
                          </div>
                        </div>

                        {/* Amenity pills */}
                        <div className="amenity-pills">
                          {hotel.amenities.slice(0, 4).map(a => (
                            <span key={a} className="amenity-pill">{a}</span>
                          ))}
                          {hotel.amenities.length > 4 && (
                            <span className="amenity-pill muted">+{hotel.amenities.length - 4} more</span>
                          )}
                        </div>

                        {/* Highlights */}
                        <div className="highlights">
                          {hotel.highlights.slice(0,2).map(h => (
                            <div key={h} className="highlight-item">
                              <Check size={12} color="var(--color-success)" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      {bestRoom && (
                        <div className="hotel-card-price">
                          {hotel.memberPrice && (
                            <span className="badge badge-member" style={{ marginBottom: '4px', display: 'inline-block' }}>Member Price</span>
                          )}
                          {bestRoom.originalPrice && (
                            <div className="price-original">${bestRoom.originalPrice}/night</div>
                          )}
                          <div className="price-current">
                            <span className="price-from">from </span>
                            ${hotel.memberPrice && bestRoom.memberPrice ? bestRoom.memberPrice : bestRoom.pricePerNight}
                          </div>
                          <div className="price-label">/night</div>
                          <div className="price-total">${bestRoom.totalPrice} total</div>
                          <button
                            className="btn-primary"
                            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                            onClick={e => { e.stopPropagation(); navigate(`/hotels/${hotel.id}`) }}
                          >
                            View rooms
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Compare bar */}
      {compareList.length >= 2 && (
        <div className="compare-bar">
          <span>Compare {compareList.length} properties</span>
          <button
            className="btn-primary"
            onClick={() => setShowCompareModal(true)}
          >
            Compare
          </button>
          <button
            className="btn-ghost"
            onClick={() => setCompareList([])}
          >
            Clear
          </button>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="compare-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Compare properties</h3>
              <button onClick={() => setShowCompareModal(false)}><X size={20} /></button>
            </div>
            <div className="compare-grid">
              {compareList.map(id => {
                const hotel = hotels.find(h => h.id === id)
                if (!hotel) return null
                const bestRoom = hotel.rooms[0]
                return (
                  <div key={id} className="compare-col">
                    <img src={hotel.images[0]} alt={hotel.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                    <h4 style={{ marginTop: '8px' }}>{hotel.name}</h4>
                    <div className="rating-badge-sm">
                      <span className={`rating-badge ${getRatingClass(hotel.guestRating)}`} style={{ fontSize: '12px', width: 'auto', padding: '4px 8px', borderRadius: '6px 6px 6px 0' }}>
                        {hotel.guestRating}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-medium-gray)' }}>{hotel.reviewCount.toLocaleString()} reviews</span>
                    </div>
                    <div style={{ fontSize: '14px', margin: '8px 0', color: 'var(--color-medium-gray)' }}>
                      {hotel.neighborhood}
                    </div>
                    <div className="compare-amenities">
                      {hotel.amenities.slice(0, 6).map(a => (
                        <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', margin: '4px 0' }}>
                          <Check size={12} color="var(--color-success)" />
                          {a}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '20px', marginTop: '12px', color: 'var(--color-navy)' }}>
                      ${bestRoom?.pricePerNight}<span style={{ fontSize: '14px', fontWeight: 400 }}>/night</span>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                      onClick={() => navigate(`/hotels/${id}`)}
                    >
                      View hotel
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="filter-section">
      <button className="filter-section-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  )
}
