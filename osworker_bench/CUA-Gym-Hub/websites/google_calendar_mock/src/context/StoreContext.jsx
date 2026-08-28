import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { MOCK_USER, DEFAULT_CALENDARS, generateMockEvents, getSessionId, fetchCustomState, saveState, initializeData, getInitialState, setMockToday, mockNow } from '../utils/helpers';
import { addMinutes, differenceInMinutes } from 'date-fns';

const StoreContext = createContext();

const defaultState = {
  user: MOCK_USER,
  calendars: DEFAULT_CALENDARS,
  events: generateMockEvents(),
  view: 'month', // month, week, day, agenda
  currentDate: mockNow().toISOString(),
  sidebarOpen: true,
  settings: {
    weekStart: 0, // Sunday
    defaultDuration: 60,
  }
};

// Deep clone for diffing
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_DATE':
      return { ...state, currentDate: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(e => e.id === action.payload.id ? action.payload : e)
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(e => e.id !== action.payload)
      };
    case 'MOVE_EVENT': {
      const { eventId, newStart } = action.payload;
      const event = state.events.find(e => e.id === eventId);
      if (!event) return state;

      const oldStart = new Date(event.start);
      const oldEnd = new Date(event.end);
      const duration = differenceInMinutes(oldEnd, oldStart);

      const newStartDate = new Date(newStart);
      const newEndDate = addMinutes(newStartDate, duration);

      const updatedEvent = {
        ...event,
        start: newStartDate.toISOString(),
        end: newEndDate.toISOString()
      };

      return {
        ...state,
        events: state.events.map(e => e.id === eventId ? updatedEvent : e)
      };
    }
    case 'TOGGLE_CALENDAR':
      return {
        ...state,
        calendars: state.calendars.map(c =>
          c.id === action.payload ? { ...c, visible: !c.visible } : c
        )
      };
    case 'ADD_CALENDAR':
      return { ...state, calendars: [...state.calendars, action.payload] };
    case 'DELETE_CALENDAR':
      return { ...state, calendars: state.calendars.filter(c => c.id !== action.payload) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_NOTICE':
      return {
        ...state,
        notices: [
          ...(state.notices || []),
          { id: action.payload.id || Date.now().toString(), createdAt: new Date().toISOString(), message: action.payload.message }
        ].slice(-5)
      };
    case 'LOAD_STATE':
      if (action.payload && action.payload.today) {
        setMockToday(action.payload.today);
      }
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const [readyToSave, setReadyToSave] = React.useState(false);

  const [state, dispatch] = useReducer(reducer, defaultState, (initial) => {
    // Session-aware: check localStorage with session key BEFORE any async fetch
    const sid = sidRef.current;
    const stored = localStorage.getItem(sid ? `gcal_mock_state_${sid}` : 'gcal_mock_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Honour persisted `today` immediately so first paint already reflects it.
      if (parsed && parsed.today) setMockToday(parsed.today);
      return parsed;
    }
    return initial;
  });

  const [originalState, setOriginalState] = React.useState(() => {
    const sid = sidRef.current;
    const stored = getInitialState(sid);
    return stored || deepClone(defaultState);
  });

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;
    fetchCustomState(sid).then(customState => {
      if (customState) {
        const data = initializeData(sid, customState);
        dispatch({ type: 'LOAD_STATE', payload: data });
        setOriginalState(deepClone(data));
        setReadyToSave(true);
      } else {
        // No custom state - just ensure initialState is saved
        const data = initializeData(sid, null);
        dispatch({ type: 'LOAD_STATE', payload: data });
        const initialStored = getInitialState(sid);
        if (initialStored) {
          setOriginalState(initialStored);
        }
        setReadyToSave(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!readyToSave) return;
    const sid = sidRef.current;
    saveState(state, sid);
  }, [state, readyToSave]);

  const getDiff = () => {
    // Simple shallow diff for demonstration
    const diff = {};
    if (state.events.length !== originalState.events.length) diff.events = "Changed";
    if (state.view !== originalState.view) diff.view = { from: originalState.view, to: state.view };
    // ... more detailed diffing logic could go here
    return diff;
  };

  const value = {
    state,
    dispatch,
    originalState,
    getDiff
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
