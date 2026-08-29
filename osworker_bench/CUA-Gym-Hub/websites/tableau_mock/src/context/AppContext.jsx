import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  getInitialState,
  initialKey,
  storageKey
} from '../utils/dataManager'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(null)
  const [sid, setSid] = useState(null)
  const [initialStateSnapshot, setInitialStateSnapshot] = useState(null)

  useEffect(() => {
    const sessionId = getSessionId()
    setSid(sessionId)

    const isRefresh = localStorage.getItem(initialKey(sessionId)) !== null

    if (isRefresh) {
      const data = initializeData(sessionId)
      setState(data)
      setInitialStateSnapshot(getInitialState(sessionId))
    } else {
      fetchCustomState(sessionId).then(custom => {
        const data = initializeData(sessionId, custom)
        setState(data)
        setInitialStateSnapshot(getInitialState(sessionId))
      })
    }
  }, [])

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveState(next, sid)
      return next
    })
  }, [sid])

  // Navigation
  const navigate = useCallback((page) => {
    updateState(prev => ({
      ...prev,
      uiState: { ...prev.uiState, currentPage: page, selectedWorkbook: null, selectedSheet: null }
    }))
  }, [updateState])

  const openWorkbook = useCallback((workbookId) => {
    updateState(prev => {
      const wb = prev.workbooks.find(w => w.id === workbookId)
      const firstSheet = wb?.sheets?.[0]?.id || null
      // Add to recents
      const recents = [workbookId, ...prev.recents.filter(id => id !== workbookId)].slice(0, 20)
      // Increment view count
      const workbooks = prev.workbooks.map(w =>
        w.id === workbookId ? { ...w, viewCount: (w.viewCount || 0) + 1 } : w
      )
      return {
        ...prev,
        workbooks,
        recents,
        uiState: { ...prev.uiState, currentPage: 'workbook', selectedWorkbook: workbookId, selectedSheet: firstSheet }
      }
    })
  }, [updateState])

  const selectSheet = useCallback((sheetId) => {
    updateState(prev => ({
      ...prev,
      uiState: { ...prev.uiState, selectedSheet: sheetId }
    }))
  }, [updateState])

  const toggleFavorite = useCallback((workbookId) => {
    updateState(prev => {
      const isFav = prev.favorites.includes(workbookId)
      const favorites = isFav
        ? prev.favorites.filter(id => id !== workbookId)
        : [...prev.favorites, workbookId]
      const workbooks = prev.workbooks.map(w =>
        w.id === workbookId ? { ...w, isFavorite: !isFav, favoriteCount: w.favoriteCount + (isFav ? -1 : 1) } : w
      )
      return { ...prev, favorites, workbooks }
    })
  }, [updateState])

  // Explore settings
  const setExploreView = useCallback((view) => {
    updateState(prev => ({ ...prev, uiState: { ...prev.uiState, exploreView: view } }))
  }, [updateState])

  const setExploreSort = useCallback((sort) => {
    updateState(prev => ({ ...prev, uiState: { ...prev.uiState, exploreSort: sort } }))
  }, [updateState])

  const setExploreFilter = useCallback((filter) => {
    updateState(prev => ({ ...prev, uiState: { ...prev.uiState, exploreFilter: filter } }))
  }, [updateState])

  const setExploreSearch = useCallback((search) => {
    updateState(prev => ({ ...prev, uiState: { ...prev.uiState, exploreSearch: search } }))
  }, [updateState])

  // Admin
  const setAdminTab = useCallback((tab) => {
    updateState(prev => ({ ...prev, uiState: { ...prev.uiState, adminTab: tab } }))
  }, [updateState])

  // Dashboard filter
  const setDashboardFilter = useCallback((sheetId, filterId, selected) => {
    updateState(prev => {
      const dashboardFilters = { ...prev.uiState.dashboardFilters }
      if (!dashboardFilters[sheetId]) dashboardFilters[sheetId] = {}
      dashboardFilters[sheetId][filterId] = selected
      return { ...prev, uiState: { ...prev.uiState, dashboardFilters } }
    })
  }, [updateState])

  // Data source view
  const openDataSource = useCallback((dsId) => {
    updateState(prev => ({
      ...prev,
      uiState: { ...prev.uiState, currentPage: 'datasource-detail', selectedDataSource: dsId }
    }))
  }, [updateState])

  if (!state) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F3F4F6' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="18" cy="24" r="14" fill="#1F77B4" fillOpacity="0.9" />
            <circle cx="30" cy="24" r="14" fill="#FF7F0E" fillOpacity="0.8" />
          </svg>
        </div>
        <div style={{ fontSize: 14, color: '#6B7280' }}>Loading Xableau...</div>
      </div>
    </div>
  )

  return (
    <AppContext.Provider value={{
      state,
      sid,
      initialStateSnapshot,
      updateState,
      navigate,
      openWorkbook,
      selectSheet,
      toggleFavorite,
      setExploreView,
      setExploreSort,
      setExploreFilter,
      setExploreSearch,
      setAdminTab,
      setDashboardFilter,
      openDataSource
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
