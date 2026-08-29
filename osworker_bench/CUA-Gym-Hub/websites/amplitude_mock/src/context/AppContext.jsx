import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import {
  getSessionId, fetchCustomState, initializeData,
  saveState, initialKey, storageKey
} from '../utils/dataManager'

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload

    case 'SET_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } }

    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarExpanded: !state.ui.sidebarExpanded } }

    case 'TOGGLE_SECTION': {
      const { section } = action.payload
      const expanded = state.ui.expandedSections || []
      const newExpanded = expanded.includes(section)
        ? expanded.filter(s => s !== section)
        : [...expanded, section]
      return { ...state, ui: { ...state.ui, expandedSections: newExpanded } }
    }

    case 'SET_ACTIVE_SIDEBAR':
      return { ...state, ui: { ...state.ui, activeSidebarItem: action.payload } }

    case 'SAVE_CHART': {
      const chart = action.payload
      const existing = state.charts.find(c => c.id === chart.id)
      const charts = existing
        ? state.charts.map(c => c.id === chart.id ? { ...c, ...chart } : c)
        : [...state.charts, chart]
      return { ...state, charts }
    }

    case 'UPDATE_CHART_CONFIG': {
      const { chartId, config } = action.payload
      const charts = state.charts.map(c =>
        c.id === chartId ? { ...c, config: { ...c.config, ...config }, updatedAt: new Date().toISOString() } : c
      )
      return { ...state, charts }
    }

    case 'ADD_COHORT': {
      return { ...state, cohorts: [...state.cohorts, action.payload] }
    }

    case 'DELETE_COHORT': {
      return { ...state, cohorts: state.cohorts.filter(c => c.id !== action.payload) }
    }

    case 'ADD_ASK_THREAD': {
      const threads = state.askThreads || []
      return { ...state, askThreads: [...threads, action.payload] }
    }

    case 'DELETE_CHART': {
      return { ...state, charts: state.charts.filter(c => c.id !== action.payload) }
    }

    case 'UPDATE_DASHBOARD': {
      const dash = action.payload
      const dashboards = state.dashboards.map(d => d.id === dash.id ? { ...d, ...dash } : d)
      return { ...state, dashboards }
    }

    case 'UPDATE_EXPERIMENT': {
      const exp = action.payload
      const experiments = state.experiments.map(e => e.id === exp.id ? { ...e, ...exp } : e)
      return { ...state, experiments }
    }

    case 'ADD_EXPERIMENT': {
      return { ...state, experiments: [...(state.experiments || []), action.payload] }
    }

    case 'DELETE_EXPERIMENT': {
      return { ...state, experiments: (state.experiments || []).filter(e => e.id !== action.payload) }
    }

    case 'UPDATE_NOTEBOOK': {
      const nb = action.payload
      const notebooks = state.notebooks.map(n => n.id === nb.id ? { ...n, ...nb } : n)
      return { ...state, notebooks }
    }

    case 'ADD_NOTEBOOK': {
      return { ...state, notebooks: [...state.notebooks, action.payload] }
    }

    case 'DELETE_NOTEBOOK': {
      return { ...state, notebooks: state.notebooks.filter(n => n.id !== action.payload) }
    }

    case 'ADD_DASHBOARD': {
      return { ...state, dashboards: [...state.dashboards, action.payload] }
    }

    case 'UPDATE_EVENT_DEFINITION': {
      const evtDef = action.payload
      const eventDefinitions = state.eventDefinitions.map(e => e.id === evtDef.id ? { ...e, ...evtDef } : e)
      return { ...state, eventDefinitions }
    }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sid = getSessionId()
    const iKey = initialKey(sid)
    const isRefresh = localStorage.getItem(iKey) !== null

    if (isRefresh) {
      const data = initializeData(sid)
      dispatch({ type: 'INIT', payload: data })
      setReady(true)
    } else {
      fetchCustomState(sid).then(customState => {
        const data = initializeData(sid, customState)
        dispatch({ type: 'INIT', payload: data })
        setReady(true)
      })
    }
  }, [])

  useEffect(() => {
    if (!state) return
    const sid = getSessionId()
    saveState(state, sid)
  }, [state])

  if (!ready || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ color: '#6B6F76', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
