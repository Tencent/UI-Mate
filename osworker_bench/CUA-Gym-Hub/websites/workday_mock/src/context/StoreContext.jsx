import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { generateInitialState, getSessionId, fetchCustomState, saveState, initializeData } from '../lib/mockData';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const BASE_INITIAL_KEY = 'hr_platform_initialState';

export const StoreProvider = ({ children }) => {
  const [initialStateRef, setInitialStateRef] = useState(null);
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        setInitialStateRef(data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setInitialStateRef(data);
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          setState(data);
          setInitialStateRef(data);
        } else {
          const data = initializeData();
          setState(data);
          setInitialStateRef(data);
        }
        setLoading(false);
      });
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const updateState = (path, value) => {
    setState(prev => {
      return { ...prev, [path]: value };
    });
  };

  const dispatch = (action) => {
    setState(prev => {
      const newState = { ...prev };

      switch (action.type) {
        case 'CLOCK_IN':
          newState.clockStatus = { isClockedIn: true, startTime: new Date().toISOString() };
          break;

        case 'CLOCK_OUT': {
          newState.clockStatus = { isClockedIn: false, startTime: null };
          const hours = (new Date() - new Date(prev.clockStatus.startTime)) / 3600000;
          newState.timeEntries = [
            ...prev.timeEntries,
            {
              entryId: `te_${Date.now()}`,
              employeeId: prev.currentUser.id,
              date: new Date().toISOString().split('T')[0],
              hours: parseFloat(hours.toFixed(2)),
              project: 'General',
              status: 'Pending',
              notes: '',
            }
          ];
          break;
        }

        case 'ADD_TIME_OFF':
          newState.timeOffRequests = [
            ...prev.timeOffRequests,
            {
              ...action.payload,
              requestId: `tr_${Date.now()}`,
              employeeId: action.payload.employeeId || prev.currentUser.id,
              status: 'Pending',
              totalHours: action.payload.totalHours || 0,
              reviewedBy: null,
              reviewedDate: null,
            }
          ];
          break;

        case 'CANCEL_TIME_OFF':
          newState.timeOffRequests = prev.timeOffRequests.map(r =>
            r.requestId === action.payload ? { ...r, status: 'Cancelled' } : r
          );
          break;

        case 'COMPLETE_TASK':
          newState.tasks = prev.tasks.map(t =>
            t.taskId === action.payload ? { ...t, status: 'Completed' } : t
          );
          break;

        case 'DENY_TASK':
          newState.tasks = prev.tasks.map(t =>
            t.taskId === action.payload ? { ...t, status: 'Denied' } : t
          );
          break;

        case 'SEND_BACK_TASK':
          newState.tasks = prev.tasks.map(t =>
            t.taskId === action.payload.taskId
              ? {
                  ...t,
                  comments: [
                    ...t.comments,
                    {
                      id: `c_${Date.now()}`,
                      author: prev.currentUser.name,
                      text: action.payload.feedback || 'Sent back for revision.',
                      timestamp: new Date().toISOString(),
                    }
                  ]
                }
              : t
          );
          break;

        case 'ADD_TASK_COMMENT':
          newState.tasks = prev.tasks.map(t =>
            t.taskId === action.payload.taskId
              ? {
                  ...t,
                  comments: [
                    ...t.comments,
                    {
                      id: `c_${Date.now()}`,
                      author: prev.currentUser.name,
                      text: action.payload.text,
                      timestamp: new Date().toISOString(),
                    }
                  ]
                }
              : t
          );
          break;

        case 'UPDATE_PROFILE':
          newState.currentUser = { ...prev.currentUser, ...action.payload };
          newState.employees = prev.employees.map(e =>
            e.id === prev.currentUser.id ? { ...e, ...action.payload } : e
          );
          break;

        case 'ADD_GOAL':
          newState.goals = [
            ...prev.goals,
            {
              ...action.payload,
              goalId: action.payload.goalId || `g_${Date.now()}`,
              employeeId: action.payload.employeeId || prev.currentUser.id,
              createdDate: new Date().toISOString().split('T')[0],
              milestones: action.payload.milestones || [],
            }
          ];
          break;

        case 'UPDATE_GOAL':
          newState.goals = prev.goals.map(g =>
            g.goalId === action.payload.goalId ? { ...g, ...action.payload } : g
          );
          break;

        case 'DELETE_GOAL':
          newState.goals = prev.goals.filter(g => g.goalId !== action.payload);
          break;

        case 'SUBMIT_SELF_REVIEW':
          newState.reviews = prev.reviews.map(r =>
            r.reviewId === action.payload.reviewId
              ? {
                  ...r,
                  selfReviewComments: action.payload.selfReviewComments,
                  ratingScore: action.payload.ratingScore || r.ratingScore,
                  status: 'Pending Manager Review',
                }
              : r
          );
          break;

        case 'ADD_REVIEW_COMMENT':
          newState.reviews = prev.reviews.map(r =>
            r.reviewId === action.payload.reviewId
              ? {
                  ...r,
                  managerComments: action.payload.managerComments,
                  rating: action.payload.rating || r.rating,
                  ratingScore: action.payload.ratingScore || r.ratingScore,
                  status: 'Completed',
                  completedDate: new Date().toISOString().split('T')[0],
                }
              : r
          );
          break;

        case 'MARK_NOTIFICATION_READ':
          newState.notifications = (prev.notifications || []).map(n =>
            n.id === action.payload ? { ...n, read: true } : n
          );
          break;

        case 'MARK_ALL_NOTIFICATIONS_READ':
          newState.notifications = (prev.notifications || []).map(n => ({ ...n, read: true }));
          break;

        case 'ADD_CONTACT_DRAFT':
          newState.contactDrafts = [
            action.payload,
            ...(prev.contactDrafts || []),
          ];
          break;

        case 'UPDATE_BENEFIT_PLAN':
          newState.benefits = {
            ...prev.benefits,
            plans: prev.benefits.plans.map(p =>
              p.id === action.payload.planId ? { ...p, ...action.payload.updates } : p
            ),
          };
          break;

        case 'ADD_TIME_ENTRY':
          newState.timeEntries = [
            ...prev.timeEntries,
            {
              entryId: `te_${Date.now()}`,
              employeeId: prev.currentUser.id,
              date: action.payload.date,
              hours: action.payload.hours,
              project: action.payload.project || 'General',
              status: 'Pending',
              notes: action.payload.notes || '',
            }
          ];
          break;

        case 'UPDATE_TIME_ENTRY':
          newState.timeEntries = prev.timeEntries.map(e =>
            e.entryId === action.payload.entryId ? { ...e, ...action.payload } : e
          );
          break;

        case 'UPDATE_PAYMENT_ELECTIONS':
          newState.paymentElections = { ...(prev.paymentElections || {}), ...action.payload };
          break;

        case 'ADD_DEPENDENT':
          newState.benefits = {
            ...prev.benefits,
            dependents: [
              ...(prev.benefits.dependents || []),
              {
                ...action.payload,
                id: action.payload.id || `dep_${Date.now()}`,
              }
            ],
          };
          break;

        case 'REMOVE_DEPENDENT':
          newState.benefits = {
            ...prev.benefits,
            dependents: (prev.benefits.dependents || []).filter(d => d.id !== action.payload),
          };
          break;

        default:
          break;
      }
      return newState;
    });
  };

  const getDebugState = () => {
    const diff = {};
    if (initialStateRef && state) {
      Object.keys(state).forEach(key => {
        if (JSON.stringify(state[key]) !== JSON.stringify(initialStateRef[key])) {
          diff[key] = { from: initialStateRef[key], to: state[key] };
        }
      });
    }

    return {
      initial_state: initialStateRef,
      current_state: state,
      state_diff: diff
    };
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{ state, dispatch, getDebugState }}>
      {children}
    </StoreContext.Provider>
  );
};
