import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Users, Briefcase, Check, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Flights.css'
import './Cars.css'

const VEHICLE_TYPES = ['Economy', 'Compact', 'Midsize', 'Full-size', 'SUV', 'Luxury']
const COMPANIES = ['Enterprise', 'Hertz', 'Budget', 'Avis', 'National']

export default function Cars() {
  const { state, setCart, updateCarSearchFilters } = useApp()
  const navigate = useNavigate()
  const { cars, carSearchFilters } = state
  const filters = carSearchFilters || {}

  const filteredCars = useMemo(() => {
    let result = [...cars]

    if (filters.vehicleTypes?.length > 0) {
      result = result.filter(c => filters.vehicleTypes.includes(c.vehicleType))
    }
    if (filters.companies?.length > 0) {
      result = result.filter(c => filters.companies.includes(c.company))
    }
    if (filters.priceMax && filters.priceMax < 200) {
      result = result.filter(c => c.pricePerDay <= filters.priceMax)
    }

    if (filters.sortBy === 'price') {
      result.sort((a, b) => a.pricePerDay - b.pricePerDay)
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    }

    return result
  }, [cars, filters])

  const toggleFilter = (key, value) => {
    const arr = filters[key] || []
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    updateCarSearchFilters({ [key]: next })
  }

  const handleSelect = (car) => {
    setCart({
      type: 'car',
      carId: car.id,
      company: car.company,
      vehicleName: car.vehicleName,
      vehicleType: car.vehicleType,
      carImage: `https://picsum.photos/seed/car_${car.id}/300/200`,
      pickupLocation: car.pickupLocation,
      dropoffLocation: car.dropoffLocation,
      pickupDate: filters.pickupDate,
      dropoffDate: filters.dropoffDate,
      pricePerDay: car.pricePerDay,
      totalPrice: car.totalPrice,
      features: car.features
    })
    navigate('/checkout')
  }

  return (
    <div className="page-content">
      <div className="search-bar-sticky">
        <div className="container search-bar-inner">
          <div className="search-summary">
            <span className="search-summary-item">
              <strong>{filters.pickupLocation || 'JFK Airport'}</strong>
            </span>
            <span className="search-summary-sep">|</span>
            <span>{filters.pickupDate} – {filters.dropoffDate}</span>
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
              <button className="btn-ghost" style={{ padding: '0', fontSize: '12px' }}
                onClick={() => updateCarSearchFilters({ vehicleTypes: [], companies: [], priceMax: 200 })}>
                Reset all
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Vehicle type</span></div>
              <div className="filter-section-body">
                {VEHICLE_TYPES.map(type => (
                  <label key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.vehicleTypes || []).includes(type)}
                      onChange={() => toggleFilter('vehicleTypes', type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Rental company</span></div>
              <div className="filter-section-body">
                {COMPANIES.map(company => (
                  <label key={company} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.companies || []).includes(company)}
                      onChange={() => toggleFilter('companies', company)}
                    />
                    {company}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Price per day (max)</span></div>
              <div className="filter-section-body">
                <div className="price-labels">
                  <span>$0</span>
                  <span>${filters.priceMax || 200}</span>
                </div>
                <input
                  type="range"
                  min={0} max={200}
                  value={filters.priceMax || 200}
                  onChange={e => updateCarSearchFilters({ priceMax: Number(e.target.value) })}
                  className="price-slider"
                />
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="results-column">
            <div className="sort-bar">
              <span className="results-count">{filteredCars.length} cars found</span>
              <div className="sort-control">
                <span>Sort by: </span>
                <select
                  value={filters.sortBy || 'recommended'}
                  onChange={e => updateCarSearchFilters({ sortBy: e.target.value })}
                  className="sort-select"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price">Price (lowest)</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {filteredCars.length === 0 ? (
              <div className="no-results">
                <p>No cars match your filters.</p>
                <button className="btn-secondary" onClick={() => updateCarSearchFilters({ vehicleTypes: [], companies: [] })}>Clear filters</button>
              </div>
            ) : (
              filteredCars.map(car => (
                <div key={car.id} className="car-card">
                  <div className="car-img-wrap">
                    <img
                      src={`https://picsum.photos/seed/car_${car.id}/300/200`}
                      alt={car.vehicleName}
                      className="car-img"
                    />
                  </div>
                  <div className="car-content">
                    <div className="car-info">
                      <div className="car-name">{car.vehicleName}</div>
                      <span className="badge" style={{ background: 'var(--color-bg-light)', fontSize: '11px' }}>{car.vehicleType}</span>
                      <div className="car-specs">
                        <span><Users size={13} /> {car.passengers}</span>
                        <span><Briefcase size={13} /> {car.bags}</span>
                        <span>⚙ {car.transmission}</span>
                      </div>
                      <div className="car-features">
                        {car.features.map(f => (
                          <span key={f} className="car-feature">
                            <Check size={12} color="var(--color-success)" />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="car-right">
                      <div className="car-company">
                        <strong>{car.company}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                          <Star size={12} fill="var(--color-golden-yellow)" color="var(--color-golden-yellow)" />
                          <span>{car.rating}</span>
                          <span style={{ color: 'var(--color-medium-gray)' }}>({car.reviewCount})</span>
                        </div>
                      </div>
                      <div className="car-price">
                        <div className="car-price-day">${car.pricePerDay}<span style={{ fontSize: '12px', fontWeight: 400 }}>/day</span></div>
                        <div className="car-price-total">${car.totalPrice} total</div>
                        <button
                          className="btn-primary"
                          style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                          onClick={() => handleSelect(car)}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
