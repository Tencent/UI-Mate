import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getSessionId, fetchCustomState, initialKey, initializeData, saveState, getInitialState } from '../utils/dataManager'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sid] = useState(() => getSessionId())

  useEffect(() => {
    const isRefresh = localStorage.getItem(initialKey(sid)) !== null
    if (isRefresh) {
      const data = initializeData(sid)
      setState(data)
      setLoading(false)
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom)
        setState(data)
        setLoading(false)
      })
    }
  }, [sid])

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveState(next, sid)
      return next
    })
  }, [sid])

  // Dispatch-style actions for common operations
  const dispatch = useCallback((action) => {
    setState(prev => {
      let next
      switch (action.type) {
        case 'ADD_EDGE': {
          const newEdge = {
            id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            cdate: Date.now(),
            tcdate: Date.now(),
            mdate: Date.now(),
            tmdate: Date.now(),
            ddate: null,
            nonreaders: [],
            ...action.edge,
          }
          next = { ...prev, edges: [...prev.edges, newEdge] }
          break
        }
        case 'REMOVE_EDGE': {
          // Soft-delete by setting ddate
          next = {
            ...prev,
            edges: prev.edges.map(e =>
              e.id === action.edgeId ? { ...e, ddate: Date.now() } : e
            ),
          }
          break
        }
        case 'ADD_NOTE': {
          const noteId = action.note.id || `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
          const newNote = {
            id: noteId,
            cdate: Date.now(),
            tcdate: Date.now(),
            mdate: Date.now(),
            tmdate: Date.now(),
            ddate: null,
            pdate: null,
            odate: null,
            nonreaders: [],
            license: null,
            ...action.note,
            details: { writable: true, presentation: [], ...action.note.details },
          }
          // Add to reviews (since replies are stored there) or notes
          if (newNote.replyto) {
            next = { ...prev, reviews: { ...prev.reviews, [noteId]: newNote } }
          } else {
            next = { ...prev, notes: { ...prev.notes, [noteId]: newNote } }
          }
          break
        }
        case 'UPDATE_NOTE': {
          const { noteId, updates } = action
          // Check reviews first, then notes
          if (prev.reviews[noteId]) {
            next = {
              ...prev,
              reviews: {
                ...prev.reviews,
                [noteId]: { ...prev.reviews[noteId], ...updates, mdate: Date.now(), tmdate: Date.now() },
              },
            }
          } else if (prev.notes[noteId]) {
            next = {
              ...prev,
              notes: {
                ...prev.notes,
                [noteId]: { ...prev.notes[noteId], ...updates, mdate: Date.now(), tmdate: Date.now() },
              },
            }
          } else {
            next = prev
          }
          break
        }
        default:
          next = prev
      }
      saveState(next, sid)
      return next
    })
  }, [sid])

  const getInitial = useCallback(() => {
    return getInitialState(sid)
  }, [sid])

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666' }}>Loading...</div>
  }

  return (
    <AppContext.Provider value={{ state, updateState, dispatch, getInitial, sid }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
