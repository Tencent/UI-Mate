import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Clock, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './SearchForm.css'

const LOCATIONS = [
  'JFK International Airport',
  'LaGuardia Airport (LGA)',
  'Newark Airport (EWR)',
  'Manhattan, NY',
  'Los Angeles Airport (LAX)',
  'Chicago O\'Hare (ORD)',
  'San Francisco Airport (SFO)'
]

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

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

  const formatted = value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="sf-field" ref={ref} style={{ flex: 1 }}>
      <button className="sf-input-btn" onClick={() => setOpen(!open)}>
        <Calendar size={16} className="sf-icon" />
        <div className="sf-input-content">
          <span className="sf-label">{label}</span>
          <span className="sf-value">{formatted || 'Select date'}</span>
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

function LocationField({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const ref = useRef(null)

  const filtered = LOCATIONS.filter(l => l.toLowerCase().includes(query.toLowerCase()))

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
    <div className="sf-field" ref={ref} style={{ flex: 2 }}>
      <button className="sf-input-btn" onClick={() => setOpen(true)}>
        <MapPin size={16} className="sf-icon" />
        <div className="sf-input-content">
          <span className="sf-label">{label}</span>
          <input
            className="sf-text-input"
            placeholder="Airport or city"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
          />
        </div>
      </button>
      {open && filtered.length > 0 && (
        <div className="sf-dropdown dest-dropdown">
          {filtered.map(loc => (
            <button
              key={loc}
              className="dest-option"
              onClick={() => { setQuery(loc); onChange(loc); setOpen(false) }}
            >
              <MapPin size={14} />
              <span>{loc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchFormCars() {
  const { state, updateCarSearchFilters, addRecentSearch } = useApp()
  const navigate = useNavigate()
  const { carSearchFilters } = state

  const [pickupLocation, setPickupLocation] = useState(carSearchFilters?.pickupLocation || '')
  const [pickupDate, setPickupDate] = useState(carSearchFilters?.pickupDate || '')
  const [dropoffDate, setDropoffDate] = useState(carSearchFilters?.dropoffDate || '')
  const [pickupTime, setPickupTime] = useState(carSearchFilters?.pickupTime || '10:00')
  const [dropoffTime, setDropoffTime] = useState(carSearchFilters?.dropoffTime || '10:00')

  const handleSearch = () => {
    updateCarSearchFilters({ pickupLocation, pickupDate, dropoffDate, pickupTime, dropoffTime })
    addRecentSearch({
      id: `search_${Date.now()}`,
      type: 'cars',
      destination: pickupLocation,
      checkIn: pickupDate,
      checkOut: dropoffDate,
      guests: 1,
      rooms: 0,
      timestamp: new Date().toISOString()
    })
    navigate('/cars')
  }

  return (
    <div className="cars-form">
      <div className="cars-inputs-row">
        <LocationField label="Pick-up location" value={pickupLocation} onChange={setPickupLocation} />
        <DateFieldSimple label="Pick-up date" value={pickupDate} onChange={setPickupDate} />
        <div className="sf-field" style={{ flex: '0 0 120px' }}>
          <div className="sf-input-btn">
            <Clock size={16} className="sf-icon" />
            <div className="sf-input-content">
              <span className="sf-label">Pick-up time</span>
              <select
                value={pickupTime}
                onChange={e => setPickupTime(e.target.value)}
                style={{ border: 'none', background: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
        <DateFieldSimple label="Drop-off date" value={dropoffDate} onChange={setDropoffDate} />
        <div className="sf-field" style={{ flex: '0 0 120px' }}>
          <div className="sf-input-btn">
            <Clock size={16} className="sf-icon" />
            <div className="sf-input-content">
              <span className="sf-label">Drop-off time</span>
              <select
                value={dropoffTime}
                onChange={e => setDropoffTime(e.target.value)}
                style={{ border: 'none', background: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
        <button className="btn-primary search-btn" onClick={handleSearch}>
          <Search size={18} />
          Search
        </button>
      </div>
    </div>
  )
}
