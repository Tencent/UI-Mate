import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import {
  createInitialData, getSessionId, saveState, loadState,
  saveInitialState, getInitialState, initializeData, calculatePriority
} from '../utils/dataManager.js';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload };

    case 'UPDATE_INCIDENT': {
      const incidents = state.incidents.map(inc =>
        inc.sys_id === action.payload.sys_id ? { ...inc, ...action.payload, updated_at: new Date().toISOString() } : inc
      );
      return { ...state, incidents };
    }

    case 'ADD_INCIDENT': {
      const newInc = { ...action.payload, updated_at: new Date().toISOString() };
      return { ...state, incidents: [...state.incidents, newInc] };
    }

    case 'DELETE_INCIDENT': {
      return { ...state, incidents: state.incidents.filter(i => i.sys_id !== action.payload) };
    }

    case 'UPDATE_PROBLEM': {
      const problems = state.problems.map(p =>
        p.sys_id === action.payload.sys_id ? { ...p, ...action.payload, updated_at: new Date().toISOString() } : p
      );
      return { ...state, problems };
    }

    case 'ADD_PROBLEM': {
      return { ...state, problems: [...state.problems, { ...action.payload, updated_at: new Date().toISOString() }] };
    }

    case 'UPDATE_CHANGE': {
      const changeRequests = state.changeRequests.map(c =>
        c.sys_id === action.payload.sys_id ? { ...c, ...action.payload, updated_at: new Date().toISOString() } : c
      );
      return { ...state, changeRequests };
    }

    case 'ADD_CHANGE': {
      return { ...state, changeRequests: [...state.changeRequests, { ...action.payload, updated_at: new Date().toISOString() }] };
    }

    case 'ADD_REQUEST': {
      return { ...state, requests: [...state.requests, action.payload] };
    }

    case 'UPDATE_REQUEST': {
      const requests = state.requests.map(r =>
        r.sys_id === action.payload.sys_id ? { ...r, ...action.payload } : r
      );
      return { ...state, requests };
    }

    case 'ADD_REQUESTED_ITEMS': {
      return { ...state, requestedItems: [...state.requestedItems, ...action.payload] };
    }

    case 'ADD_JOURNAL_ENTRY': {
      return { ...state, journal: [...state.journal, action.payload] };
    }

    case 'ADD_NOTIFICATION': {
      return { ...state, notifications: [action.payload, ...state.notifications] };
    }

    case 'MARK_NOTIFICATION_READ': {
      const notifications = state.notifications.map(n =>
        n.sys_id === action.payload ? { ...n, read: true } : n
      );
      return { ...state, notifications };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }));
      return { ...state, notifications };
    }

    case 'ADD_TO_CART': {
      const existing = state.shoppingCart.find(c => c.item.sys_id === action.payload.item.sys_id);
      if (existing) {
        const shoppingCart = state.shoppingCart.map(c =>
          c.item.sys_id === action.payload.item.sys_id
            ? { ...c, quantity: c.quantity + (action.payload.quantity || 1) }
            : c
        );
        return { ...state, shoppingCart };
      }
      return { ...state, shoppingCart: [...state.shoppingCart, { item: action.payload.item, quantity: action.payload.quantity || 1 }] };
    }

    case 'REMOVE_FROM_CART': {
      return { ...state, shoppingCart: state.shoppingCart.filter(c => c.item.sys_id !== action.payload) };
    }

    case 'CLEAR_CART': {
      return { ...state, shoppingCart: [] };
    }

    case 'SET_NAVIGATOR_FILTER': {
      return { ...state, navigatorFilter: action.payload };
    }

    case 'TOGGLE_NAV_SECTION': {
      const section = action.payload;
      const expanded = state.navigatorExpandedSections || [];
      const isExpanded = expanded.includes(section);
      return {
        ...state,
        navigatorExpandedSections: isExpanded
          ? expanded.filter(s => s !== section)
          : [...expanded, section]
      };
    }

    case 'SET_ACTIVE_MODULE': {
      return { ...state, activeModule: action.payload };
    }

    case 'ADD_FAVORITE': {
      const favorites = state.favorites || [];
      if (!favorites.some(f => f.route === action.payload.route)) {
        return { ...state, favorites: [...favorites, action.payload] };
      }
      return state;
    }

    case 'REMOVE_FAVORITE': {
      return { ...state, favorites: (state.favorites || []).filter(f => f.route !== action.payload) };
    }

    case 'ADD_HISTORY': {
      const history = state.history || [];
      const newEntry = { ...action.payload, timestamp: new Date().toISOString() };
      const filtered = history.filter(h => h.route !== newEntry.route);
      return { ...state, history: [newEntry, ...filtered].slice(0, 15) };
    }

    case 'DELETE_PROBLEM': {
      return { ...state, problems: state.problems.filter(p => p.sys_id !== action.payload) };
    }

    case 'DELETE_CHANGE': {
      return { ...state, changeRequests: state.changeRequests.filter(c => c.sys_id !== action.payload) };
    }

    case 'UPDATE_CART_QUANTITY': {
      const shoppingCart = state.shoppingCart.map(c =>
        c.item.sys_id === action.payload.itemId
          ? { ...c, quantity: Math.max(1, action.payload.quantity) }
          : c
      );
      return { ...state, shoppingCart };
    }

    case 'RATE_KB_ARTICLE': {
      const { articleId, vote, previousVote } = action.payload;
      const kbArticles = state.kbArticles.map(a => {
        if (a.sys_id !== articleId) return a;
        let helpful_count = a.helpful_count;
        let not_helpful_count = a.not_helpful_count || 0;
        // Undo previous vote
        if (previousVote === 'up') helpful_count = Math.max(0, helpful_count - 1);
        if (previousVote === 'down') not_helpful_count = Math.max(0, not_helpful_count - 1);
        // Apply new vote
        if (vote === 'up') helpful_count += 1;
        if (vote === 'down') not_helpful_count += 1;
        return { ...a, helpful_count, not_helpful_count };
      });
      return { ...state, kbArticles };
    }

    case 'INCREMENT_KB_VIEW': {
      const kbArticles = state.kbArticles.map(a =>
        a.sys_id === action.payload ? { ...a, view_count: (a.view_count || 0) + 1 } : a
      );
      return { ...state, kbArticles };
    }

    case 'UPDATE_CMDB_ITEM': {
      const cmdbItems = state.cmdbItems.map(c =>
        c.sys_id === action.payload.sys_id ? { ...c, ...action.payload } : c
      );
      return { ...state, cmdbItems };
    }

    case 'ADD_CMDB_ITEM': {
      return { ...state, cmdbItems: [...state.cmdbItems, action.payload] };
    }

    case 'SET_CURRENT_USER': {
      return { ...state, currentUser: action.payload };
    }

    case 'LOGOUT': {
      // Reset to initial state but keep the sid-based infrastructure intact
      const sid = getSessionId();
      const initial = getInitialState(sid);
      return initial || createInitialData();
    }

    case 'SET_LANGUAGE': {
      return { ...state, language: action.payload };
    }

    case 'SET_BANNER_TAB': {
      return { ...state, bannerTab: action.payload };
    }

    case 'RESET_STATE': {
      const sid = getSessionId();
      const initial = getInitialState(sid);
      return initial || createInitialData();
    }

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
      const data = await initializeData(sid);
      dispatch({ type: 'SET_STATE', payload: data });
      setLoading(false);
    }
    init();
  }, []);

  // Auto-save to localStorage on every state change
  useEffect(() => {
    if (state && !loading) {
      const sid = getSessionId();
      saveState(state, sid);
    }
  }, [state, loading]);

  const enhancedDispatch = useCallback((action) => {
    dispatch(action);
  }, []);

  if (loading || !state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--sn-font-family)', color: '#666' }}>Loading XerviceNow...</div>;
  }

  return (
    <AppContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
