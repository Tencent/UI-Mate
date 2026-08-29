import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getDefaultState,
  getSessionId,
  fetchCustomState,
  saveState,
  getSavedInitialState,
  initializeData
} from './initialData';

const StoreContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'LOAD_STATE':
      return action.payload;
    case 'CREATE_SPACE':
      return { ...state, spaces: [...state.spaces, { id: uuidv4(), ...action.payload }] };
    case 'CREATE_PAGE': {
      const newPage = {
        id: uuidv4(),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        version: 1,
        labels: [],
        ...action.payload
      };
      return { ...state, pages: [...state.pages, newPage] };
    }
    case 'UPDATE_PAGE': {
      const { id, ...updates } = action.payload;
      const updatedPages = state.pages.map(p => {
        if (p.id === id) {
          return { ...p, ...updates, updated: new Date().toISOString(), version: p.version + 1 };
        }
        return p;
      });

      const oldPage = state.pages.find(p => p.id === id);
      const newVersion = {
        id: uuidv4(),
        pageId: oldPage.id,
        content: oldPage.content,
        authorId: state.currentUser.id,
        created: new Date().toISOString(),
        version: oldPage.version
      };

      return {
        ...state,
        pages: updatedPages,
        versions: [...state.versions, newVersion]
      };
    }
    case 'MOVE_PAGE': {
      const { pageId, newParentId } = action.payload;
      return {
        ...state,
        pages: state.pages.map(p => p.id === pageId ? { ...p, parentId: newParentId } : p)
      };
    }
    case 'ADD_COMMENT':
      return {
        ...state,
        comments: [...state.comments, { id: uuidv4(), created: new Date().toISOString(), ...action.payload }]
      };
    case 'RESTORE_VERSION': {
      const { pageId, versionId } = action.payload;
      const versionToRestore = state.versions.find(v => v.id === versionId);
      if (!versionToRestore) return state;

      return {
        ...state,
        pages: state.pages.map(p => p.id === pageId ? {
          ...p,
          content: versionToRestore.content,
          updated: new Date().toISOString(),
          version: p.version + 1
        } : p),
        versions: [
          ...state.versions,
          ...state.pages
            .filter(p => p.id === pageId)
            .map(p => ({
              id: uuidv4(),
              pageId,
              content: p.content,
              authorId: state.currentUser.id,
              created: new Date().toISOString(),
              version: p.version
            }))
        ]
      };
    }
    case 'SWITCH_USER':
      return { ...state, currentUser: state.users.find(u => u.id === action.payload) || state.users[0] };
    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const [state, dispatch] = useReducer(reducer, null);
  const [loading, setLoading] = useState(true);

  // Session-aware initialization
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `kb_app_initialState_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        dispatch({ type: 'LOAD_STATE', payload: data });
        setLoading(false);
      } else {
        fetchCustomState(sid).then(custom => {
          const data = initializeData(sid, custom);
          dispatch({ type: 'LOAD_STATE', payload: data });
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      dispatch({ type: 'LOAD_STATE', payload: data });
      setLoading(false);
    }
  }, []);

  // Persist to session-specific localStorage on change
  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  // Helper to get initial state for /go endpoint
  const getInitialStateForDebug = () => {
    return getSavedInitialState(sidRef.current) || getDefaultState();
  };

  if (loading || !state) return <div>Loading...</div>;

  return (
    <StoreContext.Provider value={{ state, dispatch, getInitialState: getInitialStateForDebug }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
