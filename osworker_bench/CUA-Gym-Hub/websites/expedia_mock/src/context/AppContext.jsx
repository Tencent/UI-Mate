import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  getInitialState,
  initialKey
} from '../utils/dataManager'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(null)
  const [initialStateSnapshot, setInitialStateSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sid = getSessionId()

    const isRefresh = localStorage.getItem(initialKey(sid)) !== null

    if (isRefresh) {
      const data = initializeData(sid)
      setState(data)
      setInitialStateSnapshot(getInitialState(sid) || data)
      setLoading(false)
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom)
        setState(data)
        setInitialStateSnapshot(getInitialState(sid) || data)
        setLoading(false)
      })
    }
  }, [])

  const updateState = useCallback((updates) => {
    setState(prev => {
      const sid = getSessionId()
      const next = typeof updates === 'function'
        ? updates(prev)
        : { ...prev, ...updates }
      saveState(next, sid)
      return next
    })
  }, [])

  const updateUser = useCallback((userUpdates) => {
    updateState(prev => ({
      ...prev,
      user: { ...prev.user, ...userUpdates }
    }))
  }, [updateState])

  const updateSearchFilters = useCallback((filters) => {
    updateState(prev => ({
      ...prev,
      searchFilters: { ...prev.searchFilters, ...filters }
    }))
  }, [updateState])

  const updateFlightSearchFilters = useCallback((filters) => {
    updateState(prev => ({
      ...prev,
      flightSearchFilters: { ...prev.flightSearchFilters, ...filters }
    }))
  }, [updateState])

  const updateCarSearchFilters = useCallback((filters) => {
    updateState(prev => ({
      ...prev,
      carSearchFilters: { ...prev.carSearchFilters, ...filters }
    }))
  }, [updateState])

  const setCart = useCallback((cart) => {
    updateState(prev => ({ ...prev, cart }))
  }, [updateState])

  const setSelectedHotel = useCallback((hotel) => {
    updateState(prev => ({ ...prev, selectedHotel: hotel }))
  }, [updateState])

  const setSelectedFlight = useCallback((flight) => {
    updateState(prev => ({ ...prev, selectedFlight: flight }))
  }, [updateState])

  const toggleSavedProperty = useCallback((hotelId) => {
    updateState(prev => {
      const saved = prev.user.savedProperties || []
      const newSaved = saved.includes(hotelId)
        ? saved.filter(id => id !== hotelId)
        : [...saved, hotelId]
      return {
        ...prev,
        user: { ...prev.user, savedProperties: newSaved }
      }
    })
  }, [updateState])

  const addBooking = useCallback((booking) => {
    updateState(prev => {
      const earned = booking.oneKeyCashEarned || 0
      return {
        ...prev,
        bookings: [...prev.bookings, booking],
        cart: null,
        user: {
          ...prev.user,
          oneKeyCash: Math.round(((prev.user.oneKeyCash || 0) + earned) * 100) / 100
        }
      }
    })
  }, [updateState])

  const applyOneKeyCash = useCallback((amount) => {
    updateState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        oneKeyCash: Math.round(Math.max(0, (prev.user.oneKeyCash || 0) - amount) * 100) / 100
      }
    }))
  }, [updateState])

  const cancelBooking = useCallback((bookingId) => {
    updateState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      )
    }))
  }, [updateState])

  const addRecentSearch = useCallback((search) => {
    updateState(prev => {
      const existing = prev.user.recentSearches || []
      const filtered = existing.filter(s => s.id !== search.id)
      return {
        ...prev,
        user: {
          ...prev.user,
          recentSearches: [search, ...filtered].slice(0, 10)
        }
      }
    })
  }, [updateState])

  const removeRecentSearch = useCallback((searchId) => {
    updateState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        recentSearches: prev.user.recentSearches.filter(s => s.id !== searchId)
      }
    }))
  }, [updateState])

  const addRecentlyViewed = useCallback((hotelId) => {
    updateState(prev => {
      const existing = prev.recentlyViewed || []
      const filtered = existing.filter(id => id !== hotelId)
      return {
        ...prev,
        recentlyViewed: [hotelId, ...filtered].slice(0, 10)
      }
    })
  }, [updateState])

  const addTraveler = useCallback((traveler) => {
    updateState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        travelers: [...prev.user.travelers, traveler]
      }
    }))
  }, [updateState])

  const updateTraveler = useCallback((travelerId, updates) => {
    updateState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        travelers: prev.user.travelers.map(t =>
          t.id === travelerId ? { ...t, ...updates } : t
        )
      }
    }))
  }, [updateState])

  const removeTraveler = useCallback((travelerId) => {
    updateState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        travelers: prev.user.travelers.filter(t => t.id !== travelerId)
      }
    }))
  }, [updateState])

  if (loading || !state) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
        color: '#6B6B6B'
      }}>
        Loading...
      </div>
    )
  }

  const value = {
    state,
    initialStateSnapshot,
    updateState,
    updateUser,
    updateSearchFilters,
    updateFlightSearchFilters,
    updateCarSearchFilters,
    setCart,
    setSelectedHotel,
    setSelectedFlight,
    toggleSavedProperty,
    addBooking,
    applyOneKeyCash,
    cancelBooking,
    addRecentSearch,
    removeRecentSearch,
    addRecentlyViewed,
    addTraveler,
    updateTraveler,
    removeTraveler
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
