import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Search } from 'lucide-react'
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

export default function SearchFormActivities() {
  const { state, updateState, addRecentSearch } = useApp()
  const navigate = useNavigate()
  const filters = state.activitySearchFilters || {}

  const [location, setLocation] = useState(filters.location || '')
  const [date, setDate] = useState(filters.date || '')
  const [showDest, setShowDest] = useState(false)
  const [showDate, setShowDate] = useState(false)
  const destRef = useRef(null)
  const dateRef = useRef(null)

  const filtered = DESTINATIONS.filter(d => d.toLowerCase().includes(location.toLowerCase()))

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
      activitySearchFilters: { ...prev.activitySearchFilters, location, date }
    }))
    addRecentSearch({
      id: `search_${Date.now()}`,
      type: 'activities',
      destination: location,
      checkIn: date,
      checkOut: null,
      guests: 1,
      rooms: 0,
      timestamp: new Date().toISOString()
    })
    navigate('/activities')
  }

  const formatted = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <div className="search-form stays-form">
      <div className="sf-field sf-destination" ref={destRef}>
        <button className="sf-input-btn" onClick={() => setShowDest(true)}>
          <MapPin size={16} className="sf-icon" />
          <div className="sf-input-content">
            <span className="sf-label">Where</span>
            <input
              className="sf-text-input"
              placeholder="City or destination"
              value={location}
              onChange={e => { setLocation(e.target.value); setShowDest(true) }}
              onFocus={() => setShowDest(true)}
            />
          </div>
        </button>
        {showDest && filtered.length > 0 && (
          <div className="sf-dropdown dest-dropdown">
            {filtered.map(d => (
              <button key={d} className="dest-option" onClick={() => { setLocation(d); setShowDest(false) }}>
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
            <span className="sf-label">Date</span>
            <span className="sf-value">{formatted || 'Any date'}</span>
          </div>
        </button>
        {showDate && (
          <div className="sf-dropdown date-picker-dropdown">
            <input
              type="date"
              value={date || ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => { setDate(e.target.value); setShowDate(false) }}
              style={{ padding: '8px', border: '1px solid var(--color-border-gray)', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
        )}
      </div>

      <button className="btn-primary search-btn" onClick={handleSearch}>
        <Search size={18} />
        Search
      </button>
    </div>
  )
}
