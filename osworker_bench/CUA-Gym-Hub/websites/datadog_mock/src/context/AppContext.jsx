import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { getSessionId, initializeData, fetchCustomState, saveState, getInitialState, calculateStateDiff } from '../utils/dataManager';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };

    case 'UPDATE_HOST': {
      const hosts = state.hosts.map(h => h.id === action.payload.id ? { ...h, ...action.payload } : h);
      return { ...state, hosts };
    }

    case 'UPDATE_MONITOR': {
      const monitors = state.monitors.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m);
      return { ...state, monitors };
    }

    case 'ADD_MONITOR': {
      return { ...state, monitors: [...state.monitors, action.payload] };
    }

    case 'DELETE_MONITOR': {
      return { ...state, monitors: state.monitors.filter(m => m.id !== action.payload) };
    }

    case 'ADD_LOG': {
      return { ...state, logs: [action.payload, ...state.logs] };
    }

    case 'UPDATE_DASHBOARD': {
      const dashboards = state.dashboards.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d);
      return { ...state, dashboards };
    }

    case 'ADD_DASHBOARD': {
      return { ...state, dashboards: [...state.dashboards, action.payload] };
    }

    case 'DELETE_DASHBOARD': {
      return { ...state, dashboards: state.dashboards.filter(d => d.id !== action.payload) };
    }

    case 'ADD_WIDGET': {
      const dashboards = state.dashboards.map(d => {
        if (d.id === action.payload.dashboardId) {
          return { ...d, widgets: [...d.widgets, action.payload.widget], modified: new Date().toISOString() };
        }
        return d;
      });
      return { ...state, dashboards };
    }

    case 'REMOVE_WIDGET': {
      const dashboards = state.dashboards.map(d => {
        if (d.id === action.payload.dashboardId) {
          return { ...d, widgets: d.widgets.filter(w => w.id !== action.payload.widgetId), modified: new Date().toISOString() };
        }
        return d;
      });
      return { ...state, dashboards };
    }

    case 'UPDATE_INCIDENT': {
      const incidents = state.incidents.map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i);
      return { ...state, incidents };
    }

    case 'ADD_INCIDENT': {
      return { ...state, incidents: [...state.incidents, action.payload] };
    }

    case 'ADD_INCIDENT_TIMELINE': {
      const incidents = state.incidents.map(i => {
        if (i.id === action.payload.incidentId) {
          return { ...i, timeline: [...i.timeline, action.payload.entry], updated: new Date().toISOString() };
        }
        return i;
      });
      return { ...state, incidents };
    }

    case 'ADD_NOTEBOOK': {
      return { ...state, notebooks: [...state.notebooks, action.payload] };
    }

    case 'UPDATE_NOTEBOOK': {
      const notebooks = state.notebooks.map(n => n.id === action.payload.id ? { ...n, ...action.payload } : n);
      return { ...state, notebooks };
    }

    case 'DELETE_NOTEBOOK': {
      return { ...state, notebooks: state.notebooks.filter(n => n.id !== action.payload) };
    }

    case 'SET_TIME_RANGE':
      return { ...state, selectedTimeRange: action.payload };

    case 'SET_SELECTED_ENV':
      return { ...state, selectedEnv: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'SET_ACTIVE_DASHBOARD':
      return { ...state, activeDashboardId: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const sid = getSessionId();
      const customState = await fetchCustomState(sid);
      const data = initializeData(sid, customState);
      dispatch({ type: 'SET_STATE', payload: data });
      setLoading(false);
    }
    init();
  }, []);

  // Persist state changes
  useEffect(() => {
    if (state && !loading) {
      const sid = getSessionId();
      saveState(state, sid);
    }
  }, [state, loading]);

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F5F5', fontFamily: '"DD Din", system-ui, sans-serif', color: '#6C6C80' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#632CA6', borderRadius: 8, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm0-8H9V7h6v2z"/></svg>
          </div>
          <div>Loading Xatadog...</div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function useStateDiff() {
  const { state } = useAppContext();
  const sid = getSessionId();
  const initial = getInitialState(sid);
  return calculateStateDiff(initial || state, state);
}
