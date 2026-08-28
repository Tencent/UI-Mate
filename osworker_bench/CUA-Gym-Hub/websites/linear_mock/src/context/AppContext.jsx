import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { getSessionId, initializeData, fetchCustomState, initialKey, storageKey, computeStateDiff, saveState } from '../utils/dataManager.js';

const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.payload;

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'SET_SIDEBAR':
      return { ...state, sidebarCollapsed: action.collapsed };

    case 'TOGGLE_TEAM_SECTION':
      return {
        ...state,
        teamSectionsExpanded: {
          ...state.teamSectionsExpanded,
          [action.teamId]: !state.teamSectionsExpanded[action.teamId],
        },
      };

    case 'CREATE_ISSUE': {
      const { issue } = action;
      const counters = { ...state.issueCounters };
      counters[issue.teamId] = (counters[issue.teamId] || 0) + 1;
      return {
        ...state,
        issues: [...state.issues, issue],
        issueCounters: counters,
      };
    }

    case 'UPDATE_ISSUE': {
      return {
        ...state,
        issues: state.issues.map(i =>
          i.id === action.issueId
            ? { ...i, ...action.updates, updatedAt: new Date().toISOString() }
            : i
        ),
      };
    }

    case 'DELETE_ISSUE':
      return {
        ...state,
        issues: state.issues.filter(i => i.id !== action.issueId),
      };

    case 'CREATE_COMMENT': {
      return {
        ...state,
        comments: [...state.comments, action.comment],
      };
    }

    case 'UPDATE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(c =>
          c.id === action.commentId
            ? { ...c, ...action.updates, updatedAt: new Date().toISOString() }
            : c
        ),
      };

    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(c => c.id !== action.commentId),
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.notificationId ? { ...n, isRead: true } : n
        ),
      };

    case 'MARK_NOTIFICATION_UNREAD':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.notificationId ? { ...n, isRead: false } : n
        ),
      };

    case 'ARCHIVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.notificationId ? { ...n, isArchived: true } : n
        ),
      };

    case 'SNOOZE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.notificationId ? { ...n, isSnoozed: true } : n
        ),
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      };

    case 'ARCHIVE_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isArchived: true })),
      };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.projectId
            ? { ...p, ...action.updates, updatedAt: new Date().toISOString() }
            : p
        ),
      };

    case 'CREATE_PROJECT':
      return { ...state, projects: [...state.projects, action.project] };

    case 'UPDATE_CYCLE':
      return {
        ...state,
        cycles: state.cycles.map(c =>
          c.id === action.cycleId ? { ...c, ...action.updates } : c
        ),
      };

    case 'UPDATE_WORKSPACE':
      return { ...state, workspace: { ...state.workspace, ...action.updates } };

    case 'INVITE_MEMBER':
      return {
        ...state,
        invitations: [...(state.invitations || []), action.invitation],
      };

    case 'CREATE_LABEL':
      return { ...state, labels: [...state.labels, action.label] };

    case 'UPDATE_LABEL':
      return {
        ...state,
        labels: state.labels.map(l =>
          l.id === action.labelId ? { ...l, ...action.updates } : l
        ),
      };

    case 'DELETE_LABEL':
      return { ...state, labels: state.labels.filter(l => l.id !== action.labelId) };

    case 'CREATE_VIEW':
      return { ...state, views: [...state.views, action.view] };

    case 'UPDATE_VIEW':
      return {
        ...state,
        views: state.views.map(v =>
          v.id === action.viewId ? { ...v, ...action.updates } : v
        ),
      };

    case 'DELETE_VIEW':
      return { ...state, views: state.views.filter(v => v.id !== action.viewId) };

    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.find(
        f => f.targetId === action.targetId && f.userId === state.currentUserId
      );
      if (exists) {
        return { ...state, favorites: state.favorites.filter(f => f.id !== exists.id) };
      }
      const newFav = {
        id: `f${Date.now()}`,
        type: action.favType,
        targetId: action.targetId,
        userId: state.currentUserId,
        sortOrder: state.favorites.length,
      };
      return { ...state, favorites: [...state.favorites, newFav] };
    }

    case 'ADD_ISSUE_RELATION':
      return { ...state, issueRelations: [...state.issueRelations, action.relation] };

    case 'REMOVE_ISSUE_RELATION':
      return {
        ...state,
        issueRelations: state.issueRelations.filter(r => r.id !== action.relationId),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null);
  const sidRef = useRef(getSessionId());
  const initialStateRef = useRef(null);

  useEffect(() => {
    const sid = sidRef.current;
    const isRefresh = localStorage.getItem(initialKey(sid)) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      initialStateRef.current = JSON.parse(localStorage.getItem(initialKey(sid)));
      dispatch({ type: 'INIT', payload: data });
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        initialStateRef.current = JSON.parse(localStorage.getItem(initialKey(sid)));
        dispatch({ type: 'INIT', payload: data });
      });
    }
  }, []);

  // Save state changes to localStorage
  useEffect(() => {
    if (state) {
      saveState(state, sidRef.current);
    }
  }, [state]);

  if (!state) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f1011', color: '#8a8f98', fontSize: 14,
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch, sid: sidRef.current, initialStateRef }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
