import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { AppState, Issue, Sprint, Comment, User, Notification, Project } from '../types';
import { INITIAL_STATE, initializeData, getInitialState, fetchCustomState, getSessionId, saveState } from '../utils/mockData';

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'UPDATE_ISSUE'; payload: Issue }
  | { type: 'ADD_ISSUE'; payload: Issue }
  | { type: 'DELETE_ISSUE'; payload: string }
  | { type: 'ADD_SPRINT'; payload: Sprint }
  | { type: 'UPDATE_SPRINT'; payload: Sprint }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'RESET_STATE' };

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  initialState: AppState;
} | null>(null);

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'UPDATE_ISSUE':
      return {
        ...state,
        issues: state.issues.map((i) => (i.id === action.payload.id ? action.payload : i)),
      };
    case 'ADD_ISSUE':
      return {
        ...state,
        issues: [...state.issues, action.payload],
      };
    case 'DELETE_ISSUE':
      return {
        ...state,
        issues: state.issues.filter((i) => i.id !== action.payload),
      };
    case 'ADD_SPRINT':
      return {
        ...state,
        sprints: [...state.sprints, action.payload],
      };
    case 'UPDATE_SPRINT':
      return {
        ...state,
        sprints: state.sprints.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };
    case 'ADD_COMMENT':
      return {
        ...state,
        comments: [...state.comments, action.payload],
      };
    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter((c) => c.id !== action.payload),
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case 'RESET_STATE':
      return INITIAL_STATE;
    default:
      return state;
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const initialStateRef = useRef<AppState>(INITIAL_STATE);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // Check BEFORE initializeData if session data already exists in localStorage
      const sessionKey = `jira_clone_initialState_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        // Refresh: use existing session localStorage (preserves agent's changes)
        const data = initializeData(sid);
        initialStateRef.current = getInitialState(sid) || data;
        dispatch({ type: 'SET_STATE', payload: data });
        setLoading(false);
      } else {
        // First load: fetch custom state from server, then initialize
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          initialStateRef.current = getInitialState(sid) || data;
          dispatch({ type: 'SET_STATE', payload: data });
          setLoading(false);
        });
      }
    } else {
      // No sid: backward compatible default behavior
      const data = initializeData();
      initialStateRef.current = getInitialState() || data;
      dispatch({ type: 'SET_STATE', payload: data });
      setLoading(false);
    }
  }, []);

  // Save state to session-specific localStorage on every change
  useEffect(() => {
    if (!loading) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{ state, dispatch, initialState: initialStateRef.current }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
