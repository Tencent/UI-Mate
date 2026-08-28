import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  getInitialState,
  saveState,
  initialKey
} from '../utils/dataManager';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload };

    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(j => j.id === action.payload.id ? { ...j, ...action.payload, updatedAt: new Date().toISOString() } : j)
      };

    case 'ADD_JOB': {
      const job = action.payload;
      const defaultStages = [
        { id: `stage-${job.id}-1`, jobId: job.id, name: 'Application Review', orderIndex: 0, stageType: 'application_review' },
        { id: `stage-${job.id}-2`, jobId: job.id, name: 'Recruiter Phone Screen', orderIndex: 1, stageType: 'phone_screen' },
        { id: `stage-${job.id}-3`, jobId: job.id, name: 'Hiring Manager Screen', orderIndex: 2, stageType: 'phone_screen' },
        { id: `stage-${job.id}-4`, jobId: job.id, name: 'Technical Interview', orderIndex: 3, stageType: 'interview' },
        { id: `stage-${job.id}-5`, jobId: job.id, name: 'Take Home Test', orderIndex: 4, stageType: 'take_home' },
        { id: `stage-${job.id}-6`, jobId: job.id, name: 'Onsite Interview', orderIndex: 5, stageType: 'onsite' },
        { id: `stage-${job.id}-7`, jobId: job.id, name: 'Offer', orderIndex: 6, stageType: 'offer' },
        { id: `stage-${job.id}-8`, jobId: job.id, name: 'Hired', orderIndex: 7, stageType: 'hired' }
      ];
      return {
        ...state,
        jobs: [...state.jobs, { ...job, stages: defaultStages.map(s => s.id) }],
        jobStages: [...state.jobStages, ...defaultStages]
      };
    }

    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map(a =>
          a.id === action.payload.id ? { ...a, ...action.payload, lastActivityAt: new Date().toISOString() } : a
        )
      };

    case 'ADD_APPLICATION':
      return {
        ...state,
        applications: [...state.applications, action.payload],
        jobs: state.jobs.map(j =>
          j.id === action.payload.jobId ? { ...j, candidateCount: (j.candidateCount || 0) + 1 } : j
        )
      };

    case 'MOVE_APPLICATION_STAGE': {
      const { applicationId, newStageId, fromStageName, toStageName } = action.payload;
      return {
        ...state,
        applications: state.applications.map(a =>
          a.id === applicationId
            ? { ...a, currentStageId: newStageId, daysInCurrentStage: 0, lastActivityAt: new Date().toISOString(), actionRequired: null }
            : a
        )
      };
    }

    case 'REJECT_APPLICATION': {
      const { applicationId, rejectionReason, notes: rejNotes } = action.payload;
      return {
        ...state,
        applications: state.applications.map(a =>
          a.id === applicationId
            ? { ...a, status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason, actionRequired: null, lastActivityAt: new Date().toISOString() }
            : a
        )
      };
    }

    case 'ADD_CANDIDATE':
      return {
        ...state,
        candidates: [...state.candidates, action.payload]
      };

    case 'UPDATE_CANDIDATE':
      return {
        ...state,
        candidates: state.candidates.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload, updatedAt: new Date().toISOString() } : c
        )
      };

    case 'ADD_SCORECARD':
      return {
        ...state,
        scorecards: [...state.scorecards, action.payload]
      };

    case 'UPDATE_SCORECARD':
      return {
        ...state,
        scorecards: state.scorecards.map(sc =>
          sc.id === action.payload.id ? { ...sc, ...action.payload } : sc
        )
      };

    case 'ADD_INTERVIEW':
      return {
        ...state,
        interviews: [...state.interviews, action.payload]
      };

    case 'UPDATE_INTERVIEW':
      return {
        ...state,
        interviews: state.interviews.map(i =>
          i.id === action.payload.id ? { ...i, ...action.payload } : i
        )
      };

    case 'ADD_OFFER':
      return {
        ...state,
        offers: [...state.offers, action.payload]
      };

    case 'UPDATE_OFFER':
      return {
        ...state,
        offers: state.offers.map(o =>
          o.id === action.payload.id ? { ...o, ...action.payload, updatedAt: new Date().toISOString() } : o
        )
      };

    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...state.notes, action.payload]
      };

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.payload.id ? { ...n, ...action.payload, updatedAt: new Date().toISOString() } : n
        )
      };

    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.payload.id)
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.id ? { ...n, isRead: true } : n
        )
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      };

    case 'ADD_ACTIVITY':
      return {
        ...state,
        activityFeed: [action.payload, ...state.activityFeed]
      };

    case 'SET_UI':
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      };

    case 'OPEN_MODAL':
      return {
        ...state,
        ui: { ...state.ui, modals: { ...state.ui.modals, [action.payload]: true } }
      };

    case 'CLOSE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, modals: { ...state.ui.modals, [action.payload]: false } }
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const sid = getSessionId();
  const sidRef = useRef(sid);
  const isRefresh = localStorage.getItem(initialKey(sid)) !== null;
  const [ready, setReady] = useState(false);

  const [state, dispatch] = useReducer(reducer, null, () => {
    // Synchronous seed only; the real load (fetchCustomState -> initializeData)
    // happens in the effect below before `ready` is flipped to true.
    return initializeData(sid);
  });

  const initialStateRef = useRef(null);

  // Load phase: refresh -> use stored; first-load -> fetch server custom state
  // first, then initializeData(sid, custom). `ready` gates the persist effect
  // so we never POST default fixture back to the server before the task state
  // has been applied.
  useEffect(() => {
    if (isRefresh) {
      const data = initializeData(sidRef.current);
      dispatch({ type: 'SET_STATE', payload: data });
      initialStateRef.current = getInitialState(sidRef.current) || data;
      setReady(true);
    } else {
      fetchCustomState(sidRef.current).then(custom => {
        const data = initializeData(sidRef.current, custom);
        dispatch({ type: 'SET_STATE', payload: data });
        initialStateRef.current = getInitialState(sidRef.current) || data;
        setReady(true);
      });
    }
  }, []);

  // Persist state on every change — but ONLY after the load phase finished.
  // Without this guard, the synchronous default seed from useReducer would be
  // POSTed back to the server via saveState(action:'set_current'), racing
  // setup.py's task-specific state and overwriting it.
  useEffect(() => {
    if (!ready) return;
    if (state) {
      saveState(state, sid);
      if (!initialStateRef.current) {
        initialStateRef.current = state;
      }
    }
  }, [state, ready]);

  const getInitial = () => initialStateRef.current;

  return (
    <AppContext.Provider value={{ state, dispatch, getInitialState: getInitial, sid }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export default AppContext;
