import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  getSessionId, fetchCustomState, initializeData,
  initialKey, saveState, getInitialState
} from '../utils/dataManager';

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload };

    case 'UPDATE_EMPLOYEE': {
      const employees = state.employees.map(e =>
        e.id === action.id ? { ...e, ...action.changes } : e
      );
      return { ...state, employees };
    }

    case 'ADD_TIME_OFF_REQUEST':
      return { ...state, timeOffRequests: [...state.timeOffRequests, action.request] };

    case 'UPDATE_TIME_OFF_REQUEST': {
      const timeOffRequests = state.timeOffRequests.map(r =>
        r.id === action.id ? { ...r, ...action.changes } : r
      );
      return { ...state, timeOffRequests };
    }

    case 'ADD_CANDIDATE':
      return { ...state, candidates: [...state.candidates, action.candidate] };

    case 'UPDATE_CANDIDATE': {
      const candidates = state.candidates.map(c =>
        c.id === action.id ? { ...c, ...action.changes } : c
      );
      return { ...state, candidates };
    }

    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.note] };

    case 'UPDATE_NOTE': {
      const notes = state.notes.map(n =>
        n.id === action.id ? { ...n, ...action.changes } : n
      );
      return { ...state, notes };
    }

    case 'DELETE_NOTE': {
      const notes = state.notes.filter(n => n.id !== action.id);
      return { ...state, notes };
    }

    case 'ADD_ANNOUNCEMENT':
      return { ...state, announcements: [...state.announcements, action.announcement] };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications] };

    case 'MARK_NOTIFICATION_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.id ? { ...n, isRead: true } : n
      );
      return { ...state, notifications };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const notifications = state.notifications.map(n => ({ ...n, isRead: true }));
      return { ...state, notifications };
    }

    case 'UPDATE_UI':
      return { ...state, ui: { ...state.ui, ...action.changes } };

    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.employee] };

    case 'ADD_JOB_OPENING':
      return { ...state, jobOpenings: [...(state.jobOpenings || []), action.jobOpening] };

    case 'ADD_REPORT':
      return { ...state, reports: [...(state.reports || []), action.report] };

    case 'UPDATE_REPORT': {
      const reports = (state.reports || []).map(r =>
        r.id === action.id ? { ...r, ...action.changes } : r
      );
      return { ...state, reports };
    }

    case 'UPDATE_GOAL': {
      const goals = state.goals.map(g =>
        g.id === action.id ? { ...g, ...action.changes } : g
      );
      return { ...state, goals };
    }

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.goal] };

    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.document] };

    case 'DELETE_DOCUMENT': {
      const documents = state.documents.filter(d => d.id !== action.id);
      return { ...state, documents };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null);
  const [initialized, setInitialized] = React.useState(false);
  const [initialState, setInitialState] = React.useState(null);

  useEffect(() => {
    const sid = getSessionId();
    const ik = initialKey(sid);
    const isRefresh = localStorage.getItem(ik) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      dispatch({ type: 'SET_STATE', payload: data });
      setInitialState(getInitialState(sid));
      setInitialized(true);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        dispatch({ type: 'SET_STATE', payload: data });
        setInitialState(getInitialState(sid));
        setInitialized(true);
      });
    }
  }, []);

  useEffect(() => {
    if (state && initialized) {
      const sid = getSessionId();
      saveState(state, sid);
    }
  }, [state, initialized]);

  const getEmployee = useCallback((id) => {
    if (!state) return null;
    return state.employees.find(e => e.id === Number(id)) || null;
  }, [state]);

  const getDepartment = useCallback((id) => {
    if (!state) return null;
    return state.departments.find(d => d.id === Number(id)) || null;
  }, [state]);

  const getLocation = useCallback((id) => {
    if (!state) return null;
    return state.locations.find(l => l.id === Number(id)) || null;
  }, [state]);

  const updateEmployee = useCallback((id, changes) => {
    dispatch({ type: 'UPDATE_EMPLOYEE', id: Number(id), changes });
  }, []);

  const addTimeOffRequest = useCallback((request) => {
    dispatch({ type: 'ADD_TIME_OFF_REQUEST', request });
  }, []);

  const updateTimeOffRequest = useCallback((id, changes) => {
    dispatch({ type: 'UPDATE_TIME_OFF_REQUEST', id, changes });
  }, []);

  const addCandidate = useCallback((candidate) => {
    dispatch({ type: 'ADD_CANDIDATE', candidate });
  }, []);

  const updateCandidate = useCallback((id, changes) => {
    dispatch({ type: 'UPDATE_CANDIDATE', id, changes });
  }, []);

  const addNote = useCallback((note) => {
    dispatch({ type: 'ADD_NOTE', note });
  }, []);

  const addAnnouncement = useCallback((announcement) => {
    dispatch({ type: 'ADD_ANNOUNCEMENT', announcement });
  }, []);

  if (!initialized || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#666' }}>
        Loading...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      state,
      initialState,
      dispatch,
      getEmployee,
      getDepartment,
      getLocation,
      updateEmployee,
      addTimeOffRequest,
      updateTimeOffRequest,
      addCandidate,
      updateCandidate,
      addNote,
      addAnnouncement
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useInitialState() {
  const sid = getSessionId();
  return getInitialState(sid);
}
