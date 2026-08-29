import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  getInitialState,
  initialKey
} from '../utils/dataManager.js'

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_SITE':
      return { ...state, activeSiteId: action.payload }
    case 'SET_DATE_RANGE':
      return { ...state, selectedDateRange: action.payload }
    case 'ADD_FILTER':
      return { ...state, activeFilters: [...state.activeFilters, action.payload] }
    case 'REMOVE_FILTER':
      return { ...state, activeFilters: state.activeFilters.filter((_, i) => i !== action.payload) }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarExpanded: !state.sidebarExpanded }
    case 'UPDATE_RECORDING':
      return {
        ...state,
        recordings: state.recordings.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        )
      }
    case 'CREATE_SURVEY':
      return { ...state, surveys: [...state.surveys, action.payload] }
    case 'UPDATE_SURVEY':
      return {
        ...state,
        surveys: state.surveys.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        )
      }
    case 'DELETE_SURVEY':
      return { ...state, surveys: state.surveys.filter(s => s.id !== action.payload) }
    case 'CREATE_HEATMAP':
      return { ...state, heatmaps: [...state.heatmaps, action.payload] }
    case 'UPDATE_HEATMAP':
      return {
        ...state,
        heatmaps: state.heatmaps.map(h =>
          h.id === action.payload.id ? { ...h, ...action.payload.updates } : h
        )
      }
    case 'ADD_HIGHLIGHT':
      return { ...state, highlights: [...state.highlights, action.payload] }
    case 'REMOVE_HIGHLIGHT':
      return { ...state, highlights: state.highlights.filter(h => h.id !== action.payload) }
    case 'ADD_FEEDBACK':
      return { ...state, feedback: [action.payload, ...state.feedback] }
    case 'CREATE_FUNNEL':
      return { ...state, funnels: [...state.funnels, action.payload] }
    case 'UPDATE_FUNNEL':
      return {
        ...state,
        funnels: state.funnels.map(f =>
          f.id === action.payload.id ? { ...f, ...action.payload.updates } : f
        )
      }
    case 'UPDATE_USER':
      return { ...state, currentUser: { ...state.currentUser, ...action.payload } }
    case 'CREATE_DASHBOARD':
      return { ...state, dashboards: [...(state.dashboards || []), action.payload] }
    case 'CREATE_HIGHLIGHT_COLLECTION':
      return { ...state, highlightCollections: [...(state.highlightCollections || []), action.payload] }
    case 'UI_SET_HEATMAP_VIEW':
      return {
        ...state,
        uiState: {
          ...(state.uiState || {}),
          heatmapView: {
            ...(state.uiState?.heatmapView || {}),
            ...action.payload
          }
        }
      }
    case 'DELETE_FUNNEL':
      return { ...state, funnels: state.funnels.filter(f => f.id !== action.payload) }
    case 'UPDATE_FEEDBACK_CONFIG':
      return { ...state, feedbackWidgetConfig: { ...(state.feedbackWidgetConfig || {}), ...action.payload } }
    case 'DELETE_HIGHLIGHT_COLLECTION':
      return { ...state, highlightCollections: (state.highlightCollections || []).filter(c => c.id !== action.payload) }
    case 'SET_STATE':
      return { ...action.payload }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const sid = getSessionId()
  const isRefresh = localStorage.getItem(initialKey(sid)) !== null
  const initialized = useRef(false)

  const [state, dispatch] = useReducer(reducer, null, () => {
    if (isRefresh) {
      return initializeData(sid)
    }
    return initializeData(sid)
  })

  useEffect(() => {
    if (!isRefresh && !initialized.current) {
      initialized.current = true
      fetchCustomState(sid).then(custom => {
        if (custom) {
          const data = initializeData(sid, custom)
          dispatch({ type: 'SET_STATE', payload: data })
        }
      })
    }
  }, [])

  useEffect(() => {
    if (state) {
      saveState(state, sid)
    }
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
