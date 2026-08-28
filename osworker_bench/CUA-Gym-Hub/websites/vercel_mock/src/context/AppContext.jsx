import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { createInitialData, loadState, saveState, getSessionId } from '../utils/dataManager';

const AppContext = createContext(null);

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload };
    case 'RESET_STATE':
      return { ...action.payload };
    case 'SET_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } };

    case 'ADD_PROJECT': {
      const project = { ...action.payload, id: action.payload.id || generateId('prj') };
      return { ...state, projects: [...state.projects, project] };
    }
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p)
      };
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.payload) };

    case 'ADD_DEPLOYMENT': {
      const dep = { ...action.payload, id: action.payload.id || generateId('dpl') };
      return { ...state, deployments: [dep, ...state.deployments] };
    }
    case 'UPDATE_DEPLOYMENT':
      return {
        ...state,
        deployments: state.deployments.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d)
      };

    case 'ADD_DOMAIN': {
      const domain = { ...action.payload, id: action.payload.id || generateId('dom') };
      return { ...state, domains: [...state.domains, domain] };
    }
    case 'UPDATE_DOMAIN':
      return {
        ...state,
        domains: state.domains.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d)
      };
    case 'DELETE_DOMAIN':
      return { ...state, domains: state.domains.filter(d => d.id !== action.payload) };

    case 'ADD_ENV_VAR': {
      const ev = { ...action.payload, id: action.payload.id || generateId('env') };
      return { ...state, environmentVariables: [...state.environmentVariables, ev] };
    }
    case 'UPDATE_ENV_VAR':
      return {
        ...state,
        environmentVariables: state.environmentVariables.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e)
      };
    case 'DELETE_ENV_VAR':
      return { ...state, environmentVariables: state.environmentVariables.filter(e => e.id !== action.payload) };

    case 'ADD_ACTIVITY_EVENT': {
      const evt = { ...action.payload, id: action.payload.id || generateId('evt'), createdAt: action.payload.createdAt || new Date().toISOString() };
      return { ...state, activityEvents: [evt, ...state.activityEvents] };
    }

    case 'ADD_TEAM_MEMBER': {
      const member = { ...action.payload, id: action.payload.id || generateId('user') };
      return { ...state, teamMembers: [...state.teamMembers, member] };
    }
    case 'REMOVE_TEAM_MEMBER':
      return { ...state, teamMembers: state.teamMembers.filter(m => m.id !== action.payload) };
    case 'UPDATE_TEAM_MEMBER_ROLE':
      return {
        ...state,
        teamMembers: state.teamMembers.map(m => m.id === action.payload.id ? { ...m, role: action.payload.role } : m)
      };

    case 'UPDATE_TEAM':
      return { ...state, currentTeam: { ...state.currentTeam, ...action.payload } };

    case 'ADD_INTEGRATION': {
      const integration = { ...action.payload };
      return { ...state, integrations: [...state.integrations, integration] };
    }
    case 'UPDATE_INTEGRATION':
      return {
        ...state,
        integrations: state.integrations.map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i)
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const initialData = createInitialData();
  const savedState = loadState();
  const initialStateRef = useRef(savedState?.initial || initialData);
  const [state, dispatch] = useReducer(appReducer, savedState?.current || initialData);

  useEffect(() => {
    saveState({ initial: initialStateRef.current, current: state });
  }, [state]);

  // BUG-002 fix: On mount, if ?sid= is present, fetch server state and use it as initial state
  useEffect(() => {
    const sid = getSessionId();
    if (sid) {
      fetch(`/go?sid=${encodeURIComponent(sid)}`)
        .then(r => r.json())
        .then(data => {
          if (data.current_state && Object.keys(data.current_state).length > 0) {
            initialStateRef.current = data.initial_state || data.current_state;
            dispatch({ type: 'SET_STATE', payload: data.current_state });
          }
        })
        .catch(() => {});
    }
  }, []);

  const setInitialState = (newInitial) => {
    initialStateRef.current = newInitial;
    dispatch({ type: 'SET_STATE', payload: newInitial });
  };

  const resetToInitial = () => {
    dispatch({ type: 'RESET_STATE', payload: initialStateRef.current });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, initialState: initialStateRef.current, setInitialState, resetToInitial }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
