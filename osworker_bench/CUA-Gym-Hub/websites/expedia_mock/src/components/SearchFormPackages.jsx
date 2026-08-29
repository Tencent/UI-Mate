import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './SearchForm.css'

const DESTINATIONS = [
  'New York, NY',
  'Cancun, Mexico',
  'Paris, France',
  'Maui, HI',
  'Las Vegas, NV',
  'Tokyo, Japan',
  'London, UK',
  'Los Angeles, CA'
]

export default function SearchFormPackages() {
  const { state, updateState, addRecentSearch } = useApp()
  const navigate = useNavigate()
  const filters = state.packageSearchFilters || {}

  const [destination, setDestination] = useState(filters.destination || '')
  const [departDate, setDepartDate] = useState(filters.departDate || '')
  const [travelers, setTravelers] = useState(filters.travelers || 2)
  const [showDest, setShowDest] = useState(false)
  const [showDate, setShowDate] = useState(false)
  const destRef = useRef(null)
  const dateRef = useRef(null)

  const filtered = DESTINATIONS.filter(d => d.toLowerCase().includes(destination.toLowerCase()))

  useEffect(() => {
    const handler = (e) => {
      if (destRef.current && !destRef.current.contains(e.target)) setShowDest(false)
      if (dateRef.current && !dateRef.current.contains(e.target)) setShowDate(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = () => {
    updateState(prev => ({
      ...prev,
      packageSearchFilters: { ...prev.packageSearchFilters, destination, departDate, travelers }
    }))
    addRecentSearch({
      id: `search_${Date.now()}`,
      type: 'packages',
      destination,
      checkIn: departDate,
      checkOut: null,
      guests: travelers,
      rooms: 0,
      timestamp: new Date().toISOString()
    })
    navigate('/packages')
  }

  const formatted = departDate
    ? new Date(departDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="search-form stays-form">
      <div className="sf-field sf-destination" ref={destRef}>
        <button className="sf-input-btn" onClick={() => setShowDest(true)}>
          <MapPin size={16} className="sf-icon" />
          <div className="sf-input-content">
            <span className="sf-label">Going to</span>
            <input
              className="sf-text-input"
              placeholder="Destination"
              value={destination}
              onChange={e => { setDestination(e.target.value); setShowDest(true) }}
              onFocus={() => setShowDest(true)}
            />
          </div>
        </button>
        {showDest && filtered.length > 0 && (
          <div className="sf-dropdown dest-dropdown">
            {filtered.map(d => (
              <button key={d} className="dest-option" onClick={() => { setDestination(d); setShowDest(false) }}>
                <MapPin size={14} /><span>{d}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sf-field" ref={dateRef}>
        <button className="sf-input-btn" onClick={() => setShowDate(!showDate)}>
          <Calendar size={16} className="sf-icon" />
          <div className="sf-input-content">
            <span className="sf-label">Departing</span>
            <span className="sf-value">{formatted || 'Select date'}</span>
          </div>
        </button>
        {showDate && (
          <div className="sf-dropdown date-picker-dropdown">
            <input
              type="date"
              value={departDate || ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => { setDepartDate(e.target.value); setShowDate(false) }}
              style={{ padding: '8px', border: '1px solid var(--color-border-gray)', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
        )}
      </div>

      <div className="sf-field">
        <div className="sf-input-btn">
          <Users size={16} className="sf-icon" />
          <div className="sf-input-content">
            <span className="sf-label">Travelers</span>
            <select
              value={travelers}
              onChange={e => setTravelers(Number(e.target.value))}
              style={{ border: 'none', background: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
            >
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} traveler{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button className="btn-primary search-btn" onClick={handleSearch}>
        <Search size={18} />
        Search
      </button>
    </div>
  )
}
