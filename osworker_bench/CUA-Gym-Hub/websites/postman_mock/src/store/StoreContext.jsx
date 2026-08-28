import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { INITIAL_STATE, getSessionId, fetchCustomState, saveState, initializeData, getStoredInitialState } from '../utils/initialData';
import { v4 as uuidv4 } from 'uuid';

const StoreContext = createContext();

const BASE_INITIAL_KEY = 'postman_clone_initialState';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'UPDATE_CURRENT_REQUEST':
      return { ...state, currentRequest: { ...state.currentRequest, ...action.payload } };

    case 'SET_RESPONSE':
      return { ...state, response: action.payload };

    case 'ADD_TO_HISTORY':
      const newHistoryItem = {
        id: uuidv4(),
        timestamp: Date.now(),
        method: action.payload.method,
        url: action.payload.url
      };
      return {
        ...state,
        history: [newHistoryItem, ...state.history].slice(0, 50)
      };

    case 'CREATE_COLLECTION':
      return {
        ...state,
        collections: [...state.collections, { id: uuidv4(), name: action.payload, folders: [], requests: [] }]
      };

    case 'IMPORT_COLLECTION':
      return {
        ...state,
        collections: [...state.collections, action.payload]
      };

    case 'SAVE_REQUEST':
      // Simplified: always save to first collection for demo if no collectionId provided
      const targetCollectionId = action.payload.collectionId || state.collections[0]?.id;
      if (!targetCollectionId) return state;

      const newRequest = {
        id: uuidv4(),
        ...state.currentRequest,
        name: action.payload.name || "New Request"
      };

      return {
        ...state,
        collections: state.collections.map(c => {
          if (c.id === targetCollectionId) {
            const existingIndex = c.requests.findIndex(req => req.id === state.activeRequestId);
            if (existingIndex >= 0) {
              return {
                ...c,
                requests: c.requests.map(req => req.id === state.activeRequestId ? { ...newRequest, id: req.id } : req)
              };
            }
            return { ...c, requests: [...c.requests, newRequest] };
          }
          return c;
        }),
        activeRequestId: state.activeRequestId || newRequest.id
      };

    case 'DELETE_REQUEST':
      return {
        ...state,
        collections: state.collections.map(c => ({
          ...c,
          requests: c.requests.filter(req => req.id !== action.payload)
        })),
        activeRequestId: state.activeRequestId === action.payload ? null : state.activeRequestId
      };

    case 'LOAD_REQUEST':
      return {
        ...state,
        activeRequestId: action.payload.id,
        currentRequest: { ...action.payload },
        response: null
      };

    case 'SET_ACTIVE_ENVIRONMENT':
      return { ...state, activeEnvironmentId: action.payload };

    case 'CREATE_ENVIRONMENT':
      return {
        ...state,
        environments: [...state.environments, { id: uuidv4(), name: action.payload, variables: [] }]
      };

    case 'UPDATE_ENVIRONMENT':
      return {
        ...state,
        environments: state.environments.map(e =>
          e.id === action.payload.id ? action.payload : e
        )
      };

    case 'DELETE_ENVIRONMENT':
      return {
        ...state,
        environments: state.environments.filter(e => e.id !== action.payload),
        activeEnvironmentId: state.activeEnvironmentId === action.payload ? null : state.activeEnvironmentId
      };

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const [initialStateRef, setInitialStateRef] = useState(null);
  const [state, dispatch] = useReducer(reducer, null);
  const [loading, setLoading] = useState(true);

  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // CRITICAL: Check localStorage BEFORE initializeData
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        dispatch({ type: 'SET_STATE', payload: data });
        setInitialStateRef(getStoredInitialState(sid) || data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          dispatch({ type: 'SET_STATE', payload: data });
          setInitialStateRef(data);
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          dispatch({ type: 'SET_STATE', payload: data });
          setInitialStateRef(data);
        } else {
          const data = initializeData();
          dispatch({ type: 'SET_STATE', payload: data });
          setInitialStateRef(data);
        }
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const getDebugState = () => {
    return {
      initial_state: initialStateRef,
      current_state: state,
      state_diff: calculateDiff(initialStateRef, state)
    };
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{ state, dispatch, getDebugState }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

// Simple diff helper
function calculateDiff(obj1, obj2) {
  if (!obj1 || !obj2) return {};
  const diff = {};
  for (let key in obj2) {
    if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      diff[key] = { from: obj1[key], to: obj2[key] };
    }
  }
  return diff;
}
