import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, Search, ChevronDown, Plus, Minus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './SearchForm.css'

const DESTINATIONS = [
  'New York, NY',
  'Los Angeles, CA',
  'San Francisco, CA',
  'Cancun, Mexico',
  'Maui, HI',
  'Paris, France',
  'London, UK',
  'Tokyo, Japan',
  'Miami, FL',
  'Las Vegas, NV'
]

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function DatePicker({ value, onChange, minDate, label }) {
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
    <div className="sf-field" ref={ref}>
      <button className="sf-input-btn" onClick={() => setOpen(!open)}>
        <Calendar size={16} className="sf-icon" />
        <div className="sf-input-content">
          <span className="sf-label">{label}</span>
          <span className="sf-value">{formatDate(value) || 'Select date'}</span>
        </div>
      </button>
      {open && (
        <div className="sf-dropdown date-picker-dropdown">
          <input
            type="date"
            value={value || ''}
            min={minDate || new Date().toISOString().split('T')[0]}
            onChange={e => { onChange(e.target.value); setOpen(false) }}
            style={{ padding: '8px', border: '1px solid var(--color-border-gray)', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>
      )}
    </div>
  )
}

function TravelersDropdown({ guests, rooms, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const [localGuests, setLocalGuests] = useState(guests)
  const [localRooms, setLocalRooms] = useState(rooms)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const apply = () => {
    onChange({ guests: localGuests, rooms: localRooms })
    setOpen(false)
  }

  return (
    <div className="sf-field sf-travelers" ref={ref}>
      <button className="sf-input-btn" onClick={() => setOpen(!open)}>
        <Users size={16} className="sf-icon" />
        <div className="sf-input-content">
          <span className="sf-label">Travelers</span>
          <span className="sf-value">{localGuests} traveler{localGuests !== 1 ? 's' : ''}, {localRooms} room{localRooms !== 1 ? 's' : ''}</span>
        </div>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="sf-dropdown travelers-dropdown">
          <div className="travelers-row">
            <span>Adults</span>
            <div className="counter-group">
              <button onClick={() => setLocalGuests(Math.max(1, localGuests - 1))} disabled={localGuests <= 1}><Minus size={14} /></button>
              <span>{localGuests}</span>
              <button onClick={() => setLocalGuests(Math.min(6, localGuests + 1))} disabled={localGuests >= 6}><Plus size={14} /></button>
            </div>
          </div>
          <div className="travelers-row">
            <span>Rooms</span>
            <div className="counter-group">
              <button onClick={() => setLocalRooms(Math.max(1, localRooms - 1))} disabled={localRooms <= 1}><Minus size={14} /></button>
              <span>{localRooms}</span>
              <button onClick={() => setLocalRooms(Math.min(3, localRooms + 1))} disabled={localRooms >= 3}><Plus size={14} /></button>
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={apply}>Done</button>
        </div>
      )}
    </div>
  )
}

export default function SearchFormStays() {
  const { state, updateSearchFilters, addRecentSearch } = useApp()
  const navigate = useNavigate()
  const { searchFilters } = state

  const [destination, setDestination] = useState(searchFilters.destination || '')
  const [checkIn, setCheckIn] = useState(searchFilters.checkIn || '')
  const [checkOut, setCheckOut] = useState(searchFilters.checkOut || '')
  const [guests, setGuests] = useState(searchFilters.guests || 2)
  const [rooms, setRooms] = useState(searchFilters.rooms || 1)
  const [showDestSuggestions, setShowDestSuggestions] = useState(false)
  const destRef = useRef(null)

  const filtered = DESTINATIONS.filter(d => d.toLowerCase().includes(destination.toLowerCase()))

  useEffect(() => {
    const handler = (e) => {
      if (destRef.current && !destRef.current.contains(e.target)) setShowDestSuggestions(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = () => {
    updateSearchFilters({ destination, checkIn, checkOut, guests, rooms })
    addRecentSearch({
      id: `search_${Date.now()}`,
      type: 'stays',
      destination,
      checkIn,
      checkOut,
      guests,
      rooms,
      timestamp: new Date().toISOString()
    })
    navigate('/hotels')
  }

  return (
    <div className="search-form stays-form">
      {/* Destination */}
      <div className="sf-field sf-destination" ref={destRef}>
        <button
          className="sf-input-btn"
          onClick={() => setShowDestSuggestions(true)}
          style={{ position: 'relative' }}
        >
          <MapPin size={16} className="sf-icon" />
          <div className="sf-input-content">
            <span className="sf-label">Going to</span>
            <input
              className="sf-text-input"
              placeholder="City or property name"
              value={destination}
              onChange={e => { setDestination(e.target.value); setShowDestSuggestions(true) }}
              onFocus={() => setShowDestSuggestions(true)}
            />
          </div>
        </button>
        {showDestSuggestions && filtered.length > 0 && (
          <div className="sf-dropdown dest-dropdown">
            {filtered.map(d => (
              <button
                key={d}
                className="dest-option"
                onClick={() => { setDestination(d); setShowDestSuggestions(false) }}
              >
                <MapPin size={14} />
                <span>{d}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dates */}
      <DatePicker
        label="Check-in"
        value={checkIn}
        onChange={setCheckIn}
        minDate={new Date().toISOString().split('T')[0]}
      />
      <DatePicker
        label="Check-out"
        value={checkOut}
        onChange={setCheckOut}
        minDate={checkIn || new Date().toISOString().split('T')[0]}
      />

      {/* Travelers */}
      <TravelersDropdown
        guests={guests}
        rooms={rooms}
        onChange={({ guests: g, rooms: r }) => { setGuests(g); setRooms(r) }}
      />

      {/* Search Button */}
      <button className="btn-primary search-btn" onClick={handleSearch}>
        <Search size={18} />
        Search
      </button>
    </div>
  )
}
