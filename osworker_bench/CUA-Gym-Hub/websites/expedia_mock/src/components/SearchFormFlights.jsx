import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Calendar, Users, Search, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './SearchForm.css'

const AIRPORTS = [
  { code: 'SFO', city: 'San Francisco' },
  { code: 'LAX', city: 'Los Angeles' },
  { code: 'JFK', city: 'New York' },
  { code: 'ORD', city: 'Chicago' },
  { code: 'ATL', city: 'Atlanta' },
  { code: 'DFW', city: 'Dallas' },
  { code: 'DEN', city: 'Denver' },
  { code: 'SEA', city: 'Seattle' },
  { code: 'LAS', city: 'Las Vegas' },
  { code: 'MIA', city: 'Miami' }
]

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function AirportField({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const ref = useRef(null)

  const filtered = AIRPORTS.filter(a =>
    a.city.toLowerCase().includes(query.toLowerCase()) ||
    a.code.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="sf-field" ref={ref} style={{ flex: 1 }}>
      <button className="sf-input-btn" onClick={() => setOpen(true)}>
        <Plane size={16} className="sf-icon" />
        <div className="sf-input-content">
          <span className="sf-label">{label}</span>
          <input
            className="sf-text-input"
            placeholder="City or airport"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
          />
        </div>
      </button>
      {open && filtered.length > 0 && (
        <div className="sf-dropdown dest-dropdown">
          {filtered.map(a => (
            <button
              key={a.code}
              className="dest-option"
              onClick={() => {
                const val = `${a.city} (${a.code})`
                setQuery(val)
                onChange(val)
                setOpen(false)
              }}
            >
              <span style={{ fontWeight: 700, minWidth: 40, color: 'var(--color-action-blue)' }}>{a.code}</span>
              <span>{a.city}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DateFieldSimple({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="sf-field" ref={ref} style={{ flex: 1 }}>
      <button className="sf-input-btn" onClick={() => setOpen(!open)}>
        <Calendar size={16} className="sf-icon" />
        <div className="sf-input-content">
          <span className="sf-label">{label}</span>
          <span className="sf-value">{formatDate(value) || 'Select'}</span>
        </div>
      </button>
      {open && (
        <div className="sf-dropdown date-picker-dropdown">
          <input
            type="date"
            value={value || ''}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => { onChange(e.target.value); setOpen(false) }}
            style={{ padding: '8px', border: '1px solid var(--color-border-gray)', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>
      )}
    </div>
  )
}

export default function SearchFormFlights() {
  const { state, updateFlightSearchFilters, addRecentSearch } = useApp()
  const navigate = useNavigate()
  const { flightSearchFilters } = state

  const [tripType, setTripType] = useState(flightSearchFilters.tripType || 'roundtrip')
  const [from, setFrom] = useState(flightSearchFilters.from || '')
  const [to, setTo] = useState(flightSearchFilters.to || '')
  const [departDate, setDepartDate] = useState(flightSearchFilters.departDate || '')
  const [returnDate, setReturnDate] = useState(flightSearchFilters.returnDate || '')
  const [travelers, setTravelers] = useState(flightSearchFilters.travelers || 1)
  const [cabinClass, setCabinClass] = useState(flightSearchFilters.cabinClass || 'Economy')

  const handleSearch = () => {
    updateFlightSearchFilters({ tripType, from, to, departDate, returnDate, travelers, cabinClass })
    addRecentSearch({
      id: `search_${Date.now()}`,
      type: 'flights',
      destination: to,
      checkIn: departDate,
      checkOut: returnDate,
      guests: travelers,
      rooms: 0,
      timestamp: new Date().toISOString()
    })
    navigate('/flights')
  }

  return (
    <div className="flights-form">
      <div className="flights-top-row">
        <div className="trip-type-group">
          {['roundtrip', 'oneway'].map(t => (
            <label key={t} className="trip-type-option">
              <input
                type="radio"
                name="tripType"
                value={t}
                checked={tripType === t}
                onChange={() => setTripType(t)}
              />
              {t === 'roundtrip' ? 'Roundtrip' : 'One way'}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <select
            value={travelers}
            onChange={e => setTravelers(Number(e.target.value))}
            style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--color-border-gray)', fontSize: '14px' }}
          >
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} traveler{n > 1 ? 's' : ''}</option>)}
          </select>
          <select
            value={cabinClass}
            onChange={e => setCabinClass(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--color-border-gray)', fontSize: '14px' }}
          >
            <option>Economy</option>
            <option>Premium Economy</option>
            <option>Business</option>
            <option>First</option>
          </select>
        </div>
      </div>

      <div className="flights-inputs-row">
        <AirportField label="Leaving from" value={from} onChange={setFrom} />
        <AirportField label="Going to" value={to} onChange={setTo} />
        <DateFieldSimple label="Departing" value={departDate} onChange={setDepartDate} />
        {tripType === 'roundtrip' && (
          <DateFieldSimple label="Returning" value={returnDate} onChange={setReturnDate} />
        )}
        <button className="btn-primary search-btn" onClick={handleSearch}>
          <Search size={18} />
          Search
        </button>
      </div>
    </div>
  )
}
