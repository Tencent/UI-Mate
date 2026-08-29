import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, ChevronDown, ChevronUp, Check, Wifi, Tv, Zap } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './Flights.css'

const AIRLINES = ['United Airlines', 'Delta Air Lines', 'JetBlue Airways', 'American Airlines', 'Alaska Airlines', 'Spirit Airlines', 'Southwest Airlines', 'Frontier Airlines']

function AirlineLogo({ airline }) {
  const colors = {
    'United Airlines': '#002B5C',
    'Delta Air Lines': '#003366',
    'JetBlue Airways': '#003876',
    'American Airlines': '#0078D2',
    'Alaska Airlines': '#00629B',
    'Spirit Airlines': '#FFDE00',
    'Southwest Airlines': '#304CB2',
    'Frontier Airlines': '#006847'
  }
  const initials = airline.split(' ').map(w => w[0]).slice(0, 2).join('')
  const bg = colors[airline] || '#666'
  const textColor = airline === 'Spirit Airlines' ? '#000' : '#fff'
  return (
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '12px', fontWeight: 700, color: textColor, flexShrink: 0
    }}>
      {initials}
    </div>
  )
}

function FlightLeg({ flight, allFlights }) {
  const f = typeof flight === 'string' ? allFlights.find(fl => fl.id === flight) : flight
  if (!f) return null
  return (
    <div className="flight-leg">
      <AirlineLogo airline={f.airline} />
      <div className="flight-airline">{f.airline}</div>
      <div className="flight-timeline">
        <div className="flight-time">
          <strong>{f.departureTime}</strong>
          <span>{f.departureAirport}</span>
        </div>
        <div className="flight-duration-bar">
          <div className="duration-line">
            <span className="duration-label">{f.duration}</span>
          </div>
          <div className="stops-label">
            {f.stops === 0 ? (
              <span className="nonstop">Nonstop</span>
            ) : (
              <span className="one-stop">{f.stops} stop{f.stops > 1 ? 's' : ''} in {f.stopAirports.join(', ')}</span>
            )}
          </div>
        </div>
        <div className="flight-time">
          <strong>
            {f.arrivalTime}
            {f.nextDayArrival && <sup style={{ color: 'var(--color-error)', fontSize: '10px' }}>+1</sup>}
          </strong>
          <span>{f.arrivalAirport}</span>
        </div>
      </div>
      <div className="flight-tags">
        {f.baggageIncluded && <span className="flight-tag"><Check size={10} /> {f.baggageIncluded}</span>}
        {f.wifi && <span className="flight-tag"><Wifi size={10} /> Wi-Fi</span>}
        {f.entertainment && <span className="flight-tag"><Tv size={10} /> Entertainment</span>}
        {f.powerOutlets && <span className="flight-tag"><Zap size={10} /> Power</span>}
      </div>
    </div>
  )
}

export default function Flights() {
  const { state, setSelectedFlight, setCart, updateFlightSearchFilters } = useApp()
  const navigate = useNavigate()
  const { flights, flightResults, flightSearchFilters } = state

  const filters = flightSearchFilters || {}

  const [expandedCard, setExpandedCard] = useState(null)
  const [selectedCabin, setSelectedCabin] = useState({})

  const filteredResults = useMemo(() => {
    let results = [...flightResults]

    const outboundFlights = new Set(results.map(r => r.outbound))

    // Filter stops
    if (filters.stops && filters.stops !== 'any') {
      results = results.filter(r => {
        const f = flights.find(fl => fl.id === r.outbound)
        if (!f) return false
        if (filters.stops === 'nonstop') return f.stops === 0
        if (filters.stops === '1stop') return f.stops === 1
        return true
      })
    }

    // Filter airlines
    if (filters.airlines?.length > 0) {
      results = results.filter(r => {
        const f = flights.find(fl => fl.id === r.outbound)
        return f && filters.airlines.includes(f.airline)
      })
    }

    // Filter price
    if (filters.priceMax && filters.priceMax < 1000) {
      results = results.filter(r => r.totalPrice <= filters.priceMax)
    }

    // Sort
    if (filters.sortBy === 'price') {
      results.sort((a, b) => a.totalPrice - b.totalPrice)
    } else if (filters.sortBy === 'duration') {
      results.sort((a, b) => {
        const fa = flights.find(fl => fl.id === a.outbound)
        const fb = flights.find(fl => fl.id === b.outbound)
        return (fa?.durationMinutes || 0) - (fb?.durationMinutes || 0)
      })
    } else if (filters.sortBy === 'departure') {
      results.sort((a, b) => {
        const fa = flights.find(fl => fl.id === a.outbound)
        const fb = flights.find(fl => fl.id === b.outbound)
        return (fa?.departureTime || '').localeCompare(fb?.departureTime || '')
      })
    }

    return results
  }, [flightResults, filters, flights])

  const toggleFilter = (key, value) => {
    const arr = filters[key] || []
    const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
    updateFlightSearchFilters({ [key]: next })
  }

  const handleSelect = (result) => {
    const cabin = selectedCabin[result.id] || 'Economy'
    const cabinOpt = result.cabinOptions?.find(c => c.class === cabin) || result.cabinOptions?.[0]
    setSelectedFlight(result.id)
    const outFlight = flights.find(f => f.id === result.outbound)
    const retFlight = result.returnFlight ? flights.find(f => f.id === result.returnFlight) : null
    setCart({
      type: 'flight',
      flightResultId: result.id,
      outboundId: result.outbound,
      returnId: result.returnFlight,
      airline: outFlight?.airline,
      flightImage: null,
      from: outFlight?.departureCity,
      to: outFlight?.arrivalCity,
      departureAirport: outFlight?.departureAirport,
      arrivalAirport: outFlight?.arrivalAirport,
      departureTime: outFlight?.departureTime,
      departDate: filters.departDate,
      returnDate: filters.returnDate,
      cabinClass: cabin,
      travelers: filters.travelers || 1,
      totalPrice: cabinOpt?.price || result.totalPrice,
      pricePerPerson: cabinOpt?.pricePerPerson || result.pricePerPerson
    })
    navigate('/checkout')
  }

  return (
    <div className="page-content">
      <div className="search-bar-sticky">
        <div className="container search-bar-inner">
          <div className="search-summary">
            <span className="search-summary-item">
              <strong>{filters.from || 'SFO'}</strong>
            </span>
            <span style={{ color: 'var(--color-medium-gray)' }}>→</span>
            <span className="search-summary-item">
              <strong>{filters.to || 'JFK'}</strong>
            </span>
            <span className="search-summary-sep">|</span>
            <span>{filters.departDate} – {filters.returnDate}</span>
            <span className="search-summary-sep">|</span>
            <span>{filters.travelers || 1} traveler · {filters.cabinClass || 'Economy'}</span>
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
                onClick={() => updateFlightSearchFilters({ stops: 'any', airlines: [], priceMax: 1000 })}
              >
                Reset all
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Stops</span></div>
              <div className="filter-section-body">
                {[
                  { label: 'Any', value: 'any' },
                  { label: 'Nonstop', value: 'nonstop' },
                  { label: '1 stop', value: '1stop' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    className={`filter-option-btn ${filters.stops === opt.value ? 'selected' : ''}`}
                    onClick={() => updateFlightSearchFilters({ stops: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Airlines</span></div>
              <div className="filter-section-body">
                {AIRLINES.map(airline => (
                  <label key={airline} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.airlines || []).includes(airline)}
                      onChange={() => toggleFilter('airlines', airline)}
                    />
                    {airline}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-section-header" style={{ marginBottom: '8px' }}><span>Price (max per person)</span></div>
              <div className="filter-section-body">
                <div className="price-labels">
                  <span>$0</span>
                  <span>${filters.priceMax || 1000}</span>
                </div>
                <input
                  type="range"
                  min={0} max={1000}
                  value={filters.priceMax || 1000}
                  onChange={e => updateFlightSearchFilters({ priceMax: Number(e.target.value) })}
                  className="price-slider"
                />
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="results-column">
            <div className="sort-bar">
              <span className="results-count">{filteredResults.length} flights found</span>
              <div className="sort-control">
                <span>Sort by: </span>
                <select
                  value={filters.sortBy || 'recommended'}
                  onChange={e => updateFlightSearchFilters({ sortBy: e.target.value })}
                  className="sort-select"
                >
                  <option value="recommended">Best</option>
                  <option value="price">Price (lowest)</option>
                  <option value="duration">Duration (shortest)</option>
                  <option value="departure">Departure (earliest)</option>
                </select>
              </div>
            </div>

            {filteredResults.length === 0 ? (
              <div className="no-results">
                <p>No flights match your filters.</p>
                <button className="btn-secondary" onClick={() => updateFlightSearchFilters({ stops: 'any', airlines: [], priceMax: 1000 })}>
                  Clear filters
                </button>
              </div>
            ) : (
              filteredResults.map(result => {
                const outFlight = flights.find(f => f.id === result.outbound)
                const retFlight = result.returnFlight ? flights.find(f => f.id === result.returnFlight) : null
                const cabin = selectedCabin[result.id] || 'Economy'
                const cabinOpt = result.cabinOptions?.find(c => c.class === cabin) || result.cabinOptions?.[0]

                return (
                  <div key={result.id} className="flight-card">
                    <div className="flight-card-main">
                      <div className="flight-legs">
                        <FlightLeg flight={outFlight} allFlights={flights} />
                        {retFlight && (
                          <>
                            <div className="flight-divider" />
                            <FlightLeg flight={retFlight} allFlights={flights} />
                          </>
                        )}
                      </div>
                      <div className="flight-price-area">
                        {result.savings > 0 && (
                          <div className="flight-savings">Save ${result.savings}</div>
                        )}
                        <div className="flight-price">${cabinOpt?.price || result.totalPrice}</div>
                        <div className="flight-price-per">per person ${cabinOpt?.pricePerPerson || result.pricePerPerson}</div>

                        {/* Cabin selector */}
                        {result.cabinOptions?.length > 1 && (
                          <select
                            value={cabin}
                            onChange={e => setSelectedCabin(prev => ({ ...prev, [result.id]: e.target.value }))}
                            style={{
                              margin: '8px 0',
                              padding: '4px 8px',
                              border: '1px solid var(--color-border-gray)',
                              borderRadius: '6px',
                              fontSize: '12px',
                              width: '100%'
                            }}
                          >
                            {result.cabinOptions.map(c => (
                              <option key={c.class} value={c.class}>{c.class} - ${c.price}</option>
                            ))}
                          </select>
                        )}

                        <button
                          className="btn-primary"
                          style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
                          onClick={() => handleSelect(result)}
                        >
                          Select
                        </button>
                        {outFlight?.refundable && (
                          <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={10} /> Refundable
                          </div>
                        )}
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
