import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  getInitialState,
  initialKey,
} from '../utils/dataManager'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(null)
  const [sid, setSid] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = getSessionId()
    setSid(sessionId)

    const iKey = initialKey(sessionId)
    const isRefresh = localStorage.getItem(iKey) !== null

    if (isRefresh) {
      const data = initializeData(sessionId)
      setState(data)
      setLoading(false)
    } else {
      fetchCustomState(sessionId).then(custom => {
        const data = initializeData(sessionId, custom)
        setState(data)
        setLoading(false)
      })
    }
  }, [])

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveState(sid, next)
      return next
    })
  }, [sid])

  const resetState = useCallback(() => {
    const initial = getInitialState(sid)
    if (initial) {
      setState(initial)
      saveState(sid, initial)
    }
  }, [sid])

  const getInitial = useCallback(() => {
    return getInitialState(sid)
  }, [sid])

  return (
    <AppContext.Provider value={{ state, updateState, resetState, getInitial, sid, loading }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
