import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  getInitialState,
  initialKey
} from '../data/mockData';

const StoreContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SET_STATE':
      return action.payload;

    // Contacts
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] };
    case 'UPDATE_CONTACT':
      return { ...state, contacts: state.contacts.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'DELETE_CONTACT':
      return { ...state, contacts: state.contacts.filter(c => c.id !== action.payload) };

    // Companies
    case 'ADD_COMPANY':
      return { ...state, companies: [...state.companies, action.payload] };
    case 'UPDATE_COMPANY':
      return { ...state, companies: state.companies.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) };
    case 'DELETE_COMPANY':
      return { ...state, companies: state.companies.filter(c => c.id !== action.payload) };

    // Deals
    case 'ADD_DEAL':
      return { ...state, deals: [...state.deals, action.payload] };
    case 'UPDATE_DEAL':
      return { ...state, deals: state.deals.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d) };
    case 'UPDATE_DEAL_STAGE':
      return {
        ...state,
        deals: state.deals.map(d =>
          d.id === action.payload.dealId
            ? { ...d, stage: action.payload.stage }
            : d
        )
      };
    case 'DELETE_DEAL':
      return { ...state, deals: state.deals.filter(d => d.id !== action.payload) };

    // Tickets
    case 'ADD_TICKET':
      return { ...state, tickets: [...state.tickets, action.payload] };
    case 'UPDATE_TICKET':
      return { ...state, tickets: state.tickets.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t) };
    case 'DELETE_TICKET':
      return { ...state, tickets: state.tickets.filter(t => t.id !== action.payload) };

    // Tasks
    case 'ADD_TASK':
      return { ...state, tasks: [...(state.tasks || []), action.payload] };
    case 'UPDATE_TASK':
      return { ...state, tasks: (state.tasks || []).map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: (state.tasks || []).filter(t => t.id !== action.payload) };
    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: (state.tasks || []).map(t =>
          t.id === action.payload
            ? { ...t, status: t.status === 'completed' ? 'not_started' : 'completed', completedDate: t.status !== 'completed' ? new Date().toISOString() : null }
            : t
        )
      };

    // Notes
    case 'ADD_NOTE':
      return { ...state, notes: [...(state.notes || []), action.payload] };
    case 'UPDATE_NOTE':
      return { ...state, notes: (state.notes || []).map(n => n.id === action.payload.id ? { ...n, ...action.payload } : n) };
    case 'DELETE_NOTE':
      return { ...state, notes: (state.notes || []).filter(n => n.id !== action.payload) };

    // Templates
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...(state.templates || []), action.payload] };
    case 'UPDATE_TEMPLATE':
      return { ...state, templates: (state.templates || []).map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t) };
    case 'DELETE_TEMPLATE':
      return { ...state, templates: (state.templates || []).filter(t => t.id !== action.payload) };

    // Meetings
    case 'ADD_MEETING':
      return { ...state, meetings: [...(state.meetings || []), action.payload] };
    case 'UPDATE_MEETING':
      return { ...state, meetings: (state.meetings || []).map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m) };
    case 'DELETE_MEETING':
      return { ...state, meetings: (state.meetings || []).filter(m => m.id !== action.payload) };

    // Forms
    case 'ADD_FORM':
      return { ...state, forms: [...(state.forms || []), action.payload] };
    case 'UPDATE_FORM':
      return { ...state, forms: (state.forms || []).map(f => f.id === action.payload.id ? { ...f, ...action.payload } : f) };
    case 'DELETE_FORM':
      return { ...state, forms: (state.forms || []).filter(f => f.id !== action.payload) };

    case 'RESET_DB': {
      const sid = action.payload || null;
      const fresh = initializeData(sid, null);
      return fresh;
    }

    case 'UPDATE_APP_STATE':
      return { ...state, appState: { ...(state.appState || {}), ...action.payload } };

    case 'UPDATE_PROPERTIES':
      return { ...state, properties: { ...(state.properties || {}), ...action.payload } };

    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const sid = getSessionId();
  const sidRef = useRef(sid);
  const [initialStateSnap, setInitialStateSnap] = useState(null);
  const [ready, setReady] = useState(false);

  // Check if this is a page refresh (localStorage already has the initial key)
  const isRefresh = localStorage.getItem(initialKey(sid)) !== null;

  const [state, dispatch] = useReducer(reducer, null, () => {
    if (isRefresh) {
      return initializeData(sid);
    }
    // Use default data until the async session state check completes.
    return initializeData(sid);
  });

  useEffect(() => {
    if (isRefresh) {
      // Page refresh: use existing stored data
      const data = initializeData(sidRef.current);
      dispatch({ type: 'LOAD_STATE', payload: data });
      const snap = getInitialState(sidRef.current) || data;
      setInitialStateSnap(snap);
      setReady(true);
    } else {
      // First load: fetch custom state from server, then initialize
      fetchCustomState(sidRef.current).then(customState => {
        const data = initializeData(sidRef.current, customState);
        dispatch({ type: 'LOAD_STATE', payload: data });
        const snap = getInitialState(sidRef.current) || data;
        setInitialStateSnap(snap);
        setReady(true);
      });
    }
  }, []);

  // Persist state to localStorage and sync to server on every change
  useEffect(() => {
    if (!ready) return;
    saveState(state, sidRef.current);
    // Sync to server for /go endpoint
    const sid = sidRef.current;
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    }).catch(() => {});
  }, [state, ready]);

  const getDiff = () => {
    const initial = initialStateSnap || {};
    const diff = {};
    const allKeys = new Set([...Object.keys(initial), ...Object.keys(state)]);
    allKeys.forEach(key => {
      const oldVal = JSON.stringify(initial[key]);
      const newVal = JSON.stringify(state[key]);
      if (oldVal !== newVal) {
        diff[key] = { old: initial[key], new: state[key] };
      }
    });
    return diff;
  };

  return (
    <StoreContext.Provider value={{ state, dispatch, initialState: initialStateSnap, getDiff }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
