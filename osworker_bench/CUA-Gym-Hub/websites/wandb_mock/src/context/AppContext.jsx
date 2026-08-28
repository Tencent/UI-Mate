import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { getSessionId, fetchCustomState, initializeData, saveState, initialKey } from '../utils/dataManager';

const AppContext = createContext();

function appReducer(state, action) {
  switch (action.type) {
    case 'INIT_STATE':
      return { ...action.payload };

    case 'SET_ACTIVE_PROJECT':
      return { ...state, activeProjectId: action.payload, activeRunId: null };

    case 'SET_ACTIVE_RUN':
      return { ...state, activeRunId: action.payload };

    case 'TOGGLE_RUN_VISIBILITY': {
      const runs = state.runs.map(r =>
        r.id === action.payload ? { ...r, visible: !r.visible } : r
      );
      return { ...state, runs };
    }

    case 'SET_RUN_COLOR': {
      const runs = state.runs.map(r =>
        r.id === action.payload.runId ? { ...r, color: action.payload.color } : r
      );
      return { ...state, runs };
    }

    case 'UPDATE_RUN_TAGS': {
      const runs = state.runs.map(r =>
        r.id === action.payload.runId ? { ...r, tags: action.payload.tags } : r
      );
      return { ...state, runs };
    }

    case 'ADD_RUN_TAG': {
      const runs = state.runs.map(r =>
        r.id === action.payload.runId ? { ...r, tags: [...r.tags, action.payload.tag] } : r
      );
      return { ...state, runs };
    }

    case 'REMOVE_RUN_TAG': {
      const runs = state.runs.map(r =>
        r.id === action.payload.runId ? { ...r, tags: r.tags.filter(t => t !== action.payload.tag) } : r
      );
      return { ...state, runs };
    }

    case 'UPDATE_RUN_NOTES': {
      const runs = state.runs.map(r =>
        r.id === action.payload.runId ? { ...r, notes: action.payload.notes } : r
      );
      return { ...state, runs };
    }

    case 'UPDATE_RUN_NAME': {
      const runs = state.runs.map(r =>
        r.id === action.payload.runId ? { ...r, name: action.payload.name } : r
      );
      return { ...state, runs };
    }

    case 'UPDATE_RUN_STATE': {
      const runs = state.runs.map(r =>
        r.id === action.payload.runId ? { ...r, state: action.payload.state } : r
      );
      return { ...state, runs };
    }

    case 'DELETE_RUN': {
      const runs = state.runs.filter(r => r.id !== action.payload);
      const selectedRunIds = state.selectedRunIds.filter(id => id !== action.payload);
      return { ...state, runs, selectedRunIds };
    }

    case 'ADD_PANEL': {
      const workspace = { ...state.workspace };
      const sections = workspace.panelSections.map(s => {
        if (s.id === action.payload.sectionId) {
          return { ...s, panels: [...s.panels, action.payload.panel] };
        }
        return s;
      });
      return { ...state, workspace: { ...workspace, panelSections: sections } };
    }

    case 'REMOVE_PANEL': {
      const workspace = { ...state.workspace };
      const sections = workspace.panelSections.map(s => ({
        ...s,
        panels: s.panels.filter(p => p.id !== action.payload)
      }));
      return { ...state, workspace: { ...workspace, panelSections: sections } };
    }

    case 'REORDER_PANELS': {
      const workspace = { ...state.workspace };
      const sections = workspace.panelSections.map(s => {
        if (s.id === action.payload.sectionId) {
          return { ...s, panels: action.payload.panels };
        }
        return s;
      });
      return { ...state, workspace: { ...workspace, panelSections: sections } };
    }

    case 'TOGGLE_SECTION_COLLAPSE': {
      const workspace = { ...state.workspace };
      const sections = workspace.panelSections.map(s =>
        s.id === action.payload ? { ...s, collapsed: !s.collapsed } : s
      );
      return { ...state, workspace: { ...workspace, panelSections: sections } };
    }

    case 'SET_SORT':
      return { ...state, workspace: { ...state.workspace, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder } };

    case 'SET_FILTER':
      return { ...state, workspace: { ...state.workspace, filters: action.payload } };

    case 'SET_GROUP_BY':
      return { ...state, workspace: { ...state.workspace, groupBy: action.payload } };

    case 'ADD_PROJECT': {
      return { ...state, projects: [...state.projects, action.payload] };
    }

    case 'UPDATE_PROJECT': {
      const projects = state.projects.map(p =>
        p.id === action.payload.id ? { ...p, ...action.payload, updatedAt: new Date().toISOString() } : p
      );
      return { ...state, projects };
    }

    case 'DELETE_PROJECT': {
      const projects = state.projects.filter(p => p.id !== action.payload);
      return { ...state, projects };
    }

    case 'CREATE_REPORT': {
      return { ...state, reports: [...state.reports, action.payload] };
    }

    case 'UPDATE_REPORT': {
      const reports = state.reports.map(r =>
        r.id === action.payload.id ? { ...r, ...action.payload } : r
      );
      return { ...state, reports };
    }

    case 'DELETE_REPORT': {
      return { ...state, reports: state.reports.filter(r => r.id !== action.payload) };
    }

    case 'ADD_SWEEP': {
      return { ...state, sweeps: [...state.sweeps, action.payload] };
    }

    case 'SET_SELECTED_RUNS':
      return { ...state, selectedRunIds: action.payload };

    case 'MARK_NOTIFICATION_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return { ...state, notifications };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }));
      return { ...state, notifications };
    }

    case 'UPDATE_CURRENT_USER': {
      const currentUser = { ...state.currentUser, ...action.payload };
      return { ...state, currentUser };
    }

    case 'UPDATE_WORKSPACE':
      return { ...state, workspace: { ...state.workspace, ...action.payload } };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);
  const [loading, setLoading] = useState(true);
  const sid = getSessionId();

  useEffect(() => {
    const isRefresh = localStorage.getItem(initialKey(sid)) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      dispatch({ type: 'INIT_STATE', payload: data });
      setLoading(false);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        dispatch({ type: 'INIT_STATE', payload: data });
        setLoading(false);
      });
    }
  }, [sid]);

  useEffect(() => {
    if (state) {
      saveState(state, sid);
    }
  }, [state, sid]);

  if (loading || !state) {
    return <div style={{ background: '#1a1c1f', color: '#e0e0e0', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
