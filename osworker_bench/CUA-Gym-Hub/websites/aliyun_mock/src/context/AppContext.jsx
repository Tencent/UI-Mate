import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  initialKey,
  storageKey
} from '../utils/dataManager'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const sid = getSessionId()
    const iKey = initialKey(sid)
    const isRefresh = localStorage.getItem(iKey) !== null

    if (isRefresh) {
      const data = initializeData(sid)
      setState(data)
      setInitialized(true)
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom)
        setState(data)
        setInitialized(true)
      })
    }
  }, [])

  const updateState = (updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      const sid = getSessionId()
      const sKey = storageKey(sid)
      localStorage.setItem(sKey, JSON.stringify(next))
      // Also sync to server
      if (sid) {
        fetch(`/post?sid=${encodeURIComponent(sid)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_current', state: next })
        }).catch(() => {})
      }
      return next
    })
  }

  if (!initialized || !state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F5F5', fontFamily: '"PingFang SC", "Microsoft YaHei", Arial, sans-serif', fontSize: 14, color: '#666' }}>Loading...</div>
  }

  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
