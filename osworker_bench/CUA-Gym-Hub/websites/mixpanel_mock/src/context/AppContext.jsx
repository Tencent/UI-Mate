import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getSessionId, fetchCustomState, initializeData, saveState, initialKey, storageKey } from '../utils/dataManager.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setStateRaw] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // e.g., { type: 'search' }

  useEffect(() => {
    const sid = getSessionId()
    const initK = initialKey(sid)
    const isRefresh = localStorage.getItem(initK) !== null

    if (isRefresh) {
      const data = initializeData(sid)
      setStateRaw(data)
      setLoading(false)
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom)
        setStateRaw(data)
        setLoading(false)
      })
    }
  }, [])

  const setState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const sid = getSessionId()
      saveState(next, sid)
      return next
    })
  }, [])

  const resetState = useCallback(() => {
    const sid = getSessionId()
    const initK = initialKey(sid)
    const stored = localStorage.getItem(initK)
    if (stored) {
      try {
        const initial = JSON.parse(stored)
        const key = storageKey(sid)
        localStorage.setItem(key, JSON.stringify(initial))
        setStateRaw(initial)
      } catch (e) {}
    }
  }, [])

  const updateBoard = useCallback((boardId, updates) => {
    setState(prev => ({
      ...prev,
      boards: prev.boards.map(b => b.id === boardId ? { ...b, ...updates } : b)
    }))
  }, [setState])

  const updateReport = useCallback((reportId, updates) => {
    setState(prev => ({
      ...prev,
      reports: prev.reports.map(r => r.id === reportId ? { ...r, ...updates } : r)
    }))
  }, [setState])

  const addBoard = useCallback((board) => {
    setState(prev => ({ ...prev, boards: [...prev.boards, board] }))
  }, [setState])

  const addReport = useCallback((report) => {
    setState(prev => ({ ...prev, reports: [...prev.reports, report] }))
  }, [setState])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6B6B80', fontSize: 14 }}>
        Loading...
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      state,
      setState,
      resetState,
      sidebarCollapsed,
      setSidebarCollapsed,
      activeModal,
      setActiveModal,
      updateBoard,
      updateReport,
      addBoard,
      addReport
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
