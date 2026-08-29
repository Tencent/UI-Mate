import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Check, Plane, Bed, Car, Package as PackageIcon, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Packages.css'

export default function Packages() {
  const { state, setCart, updateState } = useApp()
  const navigate = useNavigate()
  const { packages: pkgs } = state
  const filters = state.packageSearchFilters || {}

  const [selectedDates, setSelectedDates] = useState({})
  const [travelerCounts, setTravelerCounts] = useState({})

  const updateFilters = (updates) => {
    updateState(prev => ({
      ...prev,
      packageSearchFilters: { ...prev.packageSearchFilters, ...updates }
    }))
  }

  const filteredPackages = useMemo(() => {
    let result = [...pkgs]

    if (filters.destination) {
      result = result.filter(p =>
        p.destination.toLowerCase().includes(filters.destination.toLowerCase())
      )
    }

    if (filters.sortBy === 'price') {
      result.sort((a, b) => a.pricePerPerson - b.pricePerPerson)
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    } else if (filters.sortBy === 'savings') {
      result.sort((a, b) => (b.originalPrice - b.pricePerPerson) - (a.originalPrice - a.pricePerPerson))
    }

    return result
  }, [pkgs, filters])

  const handleBook = (pkg) => {
    const travelers = travelerCounts[pkg.id] || filters.travelers || 2
    const date = selectedDates[pkg.id] || pkg.departDates[0]
    setCart({
      type: 'package',
      packageId: pkg.id,
      packageName: pkg.name,
      hotelName: pkg.hotel,
      airline: pkg.airline,
      destination: pkg.destination,
      duration: pkg.duration,
      departDate: date,
      checkIn: date,
      checkOut: null,
      guests: travelers,
      travelers: travelers,
      pricePerPerson: pkg.pricePerPerson,
      totalPrice: pkg.pricePerPerson * travelers,
      includes: pkg.includes,
      freeCancellation: true
    })
    navigate('/checkout')
  }

  const DESTINATIONS = [...new Set(pkgs.map(p => p.destination))]

  return (
    <div className="page-content">
      <div className="search-bar-sticky">
        <div className="container search-bar-inner">
          <div className="search-summary">
            <span className="search-summary-item">
              <strong>Vacation Packages</strong>
            </span>
            <span className="search-summary-sep">|</span>
            <span>{filteredPackages.length} packages available</span>
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
                onClick={() => updateFilters({ destination: '', sortBy: 'recommended' })}
              >
                Reset all
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Destination</span></div>
              <div className="filter-section-body">
                <button
                  className={`filter-option-btn ${!filters.destination ? 'selected' : ''}`}
                  onClick={() => updateFilters({ destination: '' })}
                >
                  All destinations
                </button>
                {DESTINATIONS.map(dest => (
                  <button
                    key={dest}
                    className={`filter-option-btn ${filters.destination === dest ? 'selected' : ''}`}
                    onClick={() => updateFilters({ destination: dest })}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="results-column">
            <div className="sort-bar">
              <span className="results-count">{filteredPackages.length} packages found</span>
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
                  <option value="savings">Biggest savings</option>
                </select>
              </div>
            </div>

            {filteredPackages.length === 0 ? (
              <div className="no-results">
                <p>No packages match your filters.</p>
                <button className="btn-secondary" onClick={() => updateFilters({ destination: '' })}>
                  Clear filters
                </button>
              </div>
            ) : (
              filteredPackages.map(pkg => {
                const savings = pkg.originalPrice - pkg.pricePerPerson
                const travelers = travelerCounts[pkg.id] || 2
                const date = selectedDates[pkg.id] || pkg.departDates[0]

                return (
                  <div key={pkg.id} className="package-card">
                    <div className="package-img-wrap">
                      <img src={pkg.image} alt={pkg.name} className="package-img" />
                      {savings > 0 && (
                        <span className="deal-badge badge badge-deal">Save ${savings}</span>
                      )}
                    </div>
                    <div className="package-content">
                      <div className="package-info">
                        <div className="package-name">{pkg.name}</div>
                        <div className="package-dest">{pkg.destination} &middot; {pkg.duration}</div>
                        <div className="package-rating">
                          <Star size={12} fill="var(--color-golden-yellow)" color="var(--color-golden-yellow)" />
                          <strong>{pkg.rating}</strong>
                          <span style={{ color: 'var(--color-medium-gray)' }}>({pkg.reviewCount.toLocaleString()})</span>
                        </div>
                        <div className="package-includes">
                          {pkg.includes.map(inc => (
                            <span key={inc} className="package-include-tag">
                              <Check size={11} color="var(--color-success)" />
                              {inc}
                            </span>
                          ))}
                        </div>
                        <div className="package-details">
                          <span><Bed size={13} /> {pkg.hotel}</span>
                          <span><Plane size={13} /> {pkg.airline}</span>
                        </div>
                        <div className="package-highlights">
                          {pkg.highlights.map(h => (
                            <span key={h} className="package-highlight">
                              <Check size={11} color="var(--color-action-blue)" />
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="package-price-area">
                        {pkg.originalPrice && (
                          <div className="package-original">${pkg.originalPrice}</div>
                        )}
                        <div className="package-price">${pkg.pricePerPerson}</div>
                        <div className="package-price-label">per person</div>

                        <div style={{ marginTop: '8px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--color-medium-gray)', display: 'block', marginBottom: '4px' }}>Departure</label>
                          <select
                            value={date}
                            onChange={e => setSelectedDates(prev => ({ ...prev, [pkg.id]: e.target.value }))}
                            style={{
                              width: '100%', padding: '4px 6px', border: '1px solid var(--color-border-gray)',
                              borderRadius: '6px', fontSize: '12px', marginBottom: '6px'
                            }}
                          >
                            {pkg.departDates.map(d => (
                              <option key={d} value={d}>{new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', color: 'var(--color-medium-gray)', display: 'block', marginBottom: '4px' }}>Travelers</label>
                          <select
                            value={travelers}
                            onChange={e => setTravelerCounts(prev => ({ ...prev, [pkg.id]: Number(e.target.value) }))}
                            style={{
                              width: '100%', padding: '4px 6px', border: '1px solid var(--color-border-gray)',
                              borderRadius: '6px', fontSize: '12px', marginBottom: '6px'
                            }}
                          >
                            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} traveler{n > 1 ? 's' : ''}</option>)}
                          </select>
                        </div>

                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-navy)', marginTop: '4px' }}>
                          ${pkg.pricePerPerson * travelers} total
                        </div>

                        <button
                          className="btn-primary"
                          style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                          onClick={() => handleBook(pkg)}
                        >
                          Book package
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
