import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { createInitialData, getSessionId, fetchCustomState, saveState, saveInitialState, loadState, getInitialState } from '../utils/dataManager.js';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload };

    case 'ADD_REVIEW': {
      const review = action.payload;
      return { ...state, reviews: [...state.reviews, review] };
    }

    case 'DELETE_REVIEW': {
      return { ...state, reviews: state.reviews.filter(r => r.id !== action.payload) };
    }

    case 'TOGGLE_SAVE': {
      const { entityId, entityType, tripId } = action.payload;
      const saved = { ...state.savedEntities };
      const key = `${entityType}_${entityId}`;
      if (saved[key]) {
        delete saved[key];
        // Remove from trip if specified
        if (tripId) {
          const trips = state.trips.map(t => {
            if (t.id === tripId) {
              return { ...t, items: t.items.filter(i => i.entityId !== entityId) };
            }
            return t;
          });
          return { ...state, savedEntities: saved, trips };
        }
      } else {
        saved[key] = { tripId: tripId || null, savedAt: new Date().toISOString(), snapshot: action.payload.snapshot || null };
        // Add to trip if specified
        if (tripId) {
          const trips = state.trips.map(t => {
            if (t.id === tripId) {
              return {
                ...t,
                items: [
                  ...t.items.filter(i => !(i.entityId === entityId && i.entityType === entityType)),
                  { entityId, entityType, addedAt: new Date().toISOString().split('T')[0], snapshot: action.payload.snapshot || null }
                ]
              };
            }
            return t;
          });
          return { ...state, savedEntities: saved, trips };
        }
      }
      return { ...state, savedEntities: saved };
    }

    case 'CREATE_TRIP': {
      const trip = {
        id: `trip_${Date.now()}`,
        userId: state.currentUser.id,
        createdAt: new Date().toISOString().split('T')[0],
        items: [],
        ...action.payload
      };
      return { ...state, trips: [...state.trips, trip] };
    }

    case 'UPDATE_TRIP': {
      const trips = state.trips.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t);
      return { ...state, trips };
    }

    case 'ADD_BOOKING': {
      const booking = {
        id: `booking_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        ...action.payload
      };
      return { ...state, bookings: [...(state.bookings || []), booking] };
    }

    case 'UPDATE_FILTERS': {
      const { category, filters } = action.payload;
      return { ...state, filters: { ...state.filters, [category]: { ...state.filters[category], ...filters } } };
    }

    case 'SET_SEARCH_QUERY': {
      const { query, type, destinationId } = action.payload;
      const recentSearches = [
        { query, type, destinationId, timestamp: new Date().toISOString().split('T')[0] },
        ...state.searchHistory.recentSearches.filter(s => s.query !== query).slice(0, 4)
      ];
      return { ...state, searchHistory: { ...state.searchHistory, recentSearches } };
    }

    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload };

    case 'SET_SORT': {
      const { category, sort } = action.payload;
      return { ...state, sort: { ...state.sort, [category]: sort } };
    }

    case 'ADD_FORUM_REPLY': {
      const { threadId, reply } = action.payload;
      const threads = state.forumThreads.map(t => {
        if (t.id === threadId) {
          return { ...t, replies: [...t.replies, { ...reply, id: `reply_${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], helpfulVotes: 0 }] };
        }
        return t;
      });
      return { ...state, forumThreads: threads };
    }

    case 'VOTE_HELPFUL': {
      const reviewId = action.payload;
      if (state.votedHelpful.includes(reviewId)) return state;
      const reviews = state.reviews.map(r => {
        if (r.id === reviewId) return { ...r, helpfulVotes: r.helpfulVotes + 1 };
        return r;
      });
      return { ...state, reviews, votedHelpful: [...state.votedHelpful, reviewId] };
    }

    default:
      return state;
  }
}

function mergeCompatibleState(incoming) {
  if (!incoming) return incoming;
  const defaults = createInitialData();
  return {
    ...defaults,
    ...incoming,
    currentUser: { ...defaults.currentUser, ...(incoming.currentUser || {}) },
    searchHistory: { ...defaults.searchHistory, ...(incoming.searchHistory || {}) },
    filters: { ...defaults.filters, ...(incoming.filters || {}) },
    sort: { ...defaults.sort, ...(incoming.sort || {}) },
    savedEntities: incoming.savedEntities || defaults.savedEntities,
    votedHelpful: incoming.votedHelpful || defaults.votedHelpful,
    bookings: incoming.bookings || defaults.bookings || []
  };
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);
  const initialized = useRef(false);
  const sid = getSessionId();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function init() {
      // Try server state first
      const serverState = await fetchCustomState(sid);
      if (serverState) {
        const compatibleState = mergeCompatibleState(serverState);
        dispatch({ type: 'SET_STATE', payload: compatibleState });
        if (!getInitialState(sid)) {
          saveInitialState(compatibleState, sid);
        }
        return;
      }

      // Try localStorage
      const localState = loadState(sid);
      if (localState) {
        const compatibleState = mergeCompatibleState(localState);
        dispatch({ type: 'SET_STATE', payload: compatibleState });
        if (!getInitialState(sid)) {
          saveInitialState(compatibleState, sid);
        }
        return;
      }

      // Fall back to initial data
      const initialData = createInitialData();
      dispatch({ type: 'SET_STATE', payload: initialData });
      saveInitialState(initialData, sid);
      saveState(initialData, sid);
    }

    init();
  }, []);

  // Save state on changes
  const prevState = useRef(null);
  useEffect(() => {
    if (state && prevState.current !== state) {
      prevState.current = state;
      saveState(state, sid);
    }
  }, [state, sid]);

  if (!state) {
    return React.createElement('div', {
      style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui' }
    }, 'Loading...');
  }

  return React.createElement(AppContext.Provider, { value: { state, dispatch } }, children);
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export default AppContext;
