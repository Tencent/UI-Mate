import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ship, Calendar, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './SearchForm.css'

const CRUISE_LINES = [
  'Royal Caribbean',
  'Norwegian Cruise Line',
  'Princess Cruises',
  'Carnival Cruise Line',
  'Holland America Line'
]

const DESTINATIONS = [
  'Caribbean',
  'Mediterranean',
  'Alaska',
  'Bahamas',
  'Hawaii'
]

export default function SearchFormCruises() {
  const { state, updateState, addRecentSearch } = useApp()
  const navigate = useNavigate()
  const filters = state.cruiseSearchFilters || {}

  const [cruiseLine, setCruiseLine] = useState(filters.cruiseLine || '')
  const [departMonth, setDepartMonth] = useState(filters.departMonth || '')

  const handleSearch = () => {
    updateState(prev => ({
      ...prev,
      cruiseSearchFilters: { ...prev.cruiseSearchFilters, cruiseLine, departMonth }
    }))
    addRecentSearch({
      id: `search_${Date.now()}`,
      type: 'cruises',
      destination: cruiseLine || 'Any cruise',
      checkIn: departMonth,
      checkOut: null,
      guests: 2,
      rooms: 0,
      timestamp: new Date().toISOString()
    })
    navigate('/cruises')
  }

  return (
    <div className="search-form stays-form">
      <div className="sf-field" style={{ flex: 2 }}>
        <div className="sf-input-btn">
          <Ship size={16} className="sf-icon" />
          <div className="sf-input-content">
            <span className="sf-label">Cruise line</span>
            <select
              value={cruiseLine}
              onChange={e => setCruiseLine(e.target.value)}
              style={{ border: 'none', background: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', outline: 'none', width: '100%' }}
            >
              <option value="">Any cruise line</option>
              {CRUISE_LINES.map(cl => (
                <option key={cl} value={cl}>{cl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="sf-field" style={{ flex: 1 }}>
        <div className="sf-input-btn">
          <Calendar size={16} className="sf-icon" />
          <div className="sf-input-content">
            <span className="sf-label">Departure month</span>
            <select
              value={departMonth}
              onChange={e => setDepartMonth(e.target.value)}
              style={{ border: 'none', background: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', outline: 'none', width: '100%' }}
            >
              <option value="">Any month</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-10">October 2026</option>
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
