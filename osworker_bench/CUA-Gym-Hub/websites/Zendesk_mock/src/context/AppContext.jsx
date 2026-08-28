import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  initialKey,
  storageKey,
  getInitialState,
} from '../utils/dataManager.js';

const AppContext = createContext(null);

const STATUS_ORDER = ['new', 'open', 'pending', 'hold', 'solved', 'closed'];

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };

    case 'UPDATE_TICKET': {
      const updated = state.tickets.map(t =>
        t.id === action.payload.id
          ? { ...t, ...action.payload.changes, updated_at: new Date().toISOString() }
          : t
      );
      return { ...state, tickets: updated };
    }

    case 'ADD_TICKET': {
      return { ...state, tickets: [...state.tickets, action.payload] };
    }

    case 'DELETE_TICKET': {
      return {
        ...state,
        tickets: state.tickets.filter(t => t.id !== action.payload),
        ui: {
          ...state.ui,
          openTicketTabs: state.ui.openTicketTabs.filter(id => id !== action.payload),
          activeTicketId: state.ui.activeTicketId === action.payload ? null : state.ui.activeTicketId,
          selectedTicketIds: state.ui.selectedTicketIds.filter(id => id !== action.payload),
        }
      };
    }

    case 'ADD_COMMENT': {
      const { ticketId, comment } = action.payload;
      const newComments = { ...state.comments };
      newComments[ticketId] = [...(newComments[ticketId] || []), comment];
      const updatedTickets = state.tickets.map(t =>
        t.id === ticketId
          ? { ...t, comment_count: (t.comment_count || 0) + 1, updated_at: new Date().toISOString() }
          : t
      );
      return { ...state, comments: newComments, tickets: updatedTickets };
    }

    case 'UPDATE_COMMENT': {
      const { ticketId: tid, commentId, changes } = action.payload;
      const updated = { ...state.comments };
      updated[tid] = (updated[tid] || []).map(c =>
        c.id === commentId ? { ...c, ...changes } : c
      );
      return { ...state, comments: updated };
    }

    case 'APPLY_MACRO': {
      const { ticketId: macroTicketId, macro } = action.payload;
      let ticketChanges = {};
      let newComment = null;

      for (const act of macro.actions) {
        if (act.field === 'status') ticketChanges.status = act.value;
        else if (act.field === 'priority') ticketChanges.priority = act.value;
        else if (act.field === 'group_id') ticketChanges.group_id = act.value;
        else if (act.field === 'assignee_id') {
          ticketChanges.assignee_id = act.value === 'current_user' ? state.currentUser.id : act.value;
        }
        else if (act.field === 'comment_value') {
          const mode = macro.actions.find(a => a.field === 'comment_mode')?.value || 'public';
          newComment = {
            id: Date.now(),
            ticket_id: macroTicketId,
            author_id: state.currentUser.id,
            body: act.value,
            html_body: `<p>${act.value.replace(/\n/g, '<br>')}</p>`,
            public: mode === 'public',
            type: 'Comment',
            attachments: [],
            created_at: new Date().toISOString(),
          };
        }
      }

      let newState = { ...state };
      if (Object.keys(ticketChanges).length > 0) {
        newState.tickets = newState.tickets.map(t =>
          t.id === macroTicketId
            ? { ...t, ...ticketChanges, updated_at: new Date().toISOString() }
            : t
        );
      }
      if (newComment) {
        const newComments = { ...newState.comments };
        newComments[macroTicketId] = [...(newComments[macroTicketId] || []), newComment];
        newState.comments = newComments;
        newState.tickets = newState.tickets.map(t =>
          t.id === macroTicketId ? { ...t, comment_count: (t.comment_count || 0) + 1 } : t
        );
      }
      return newState;
    }

    case 'UPDATE_ORGANIZATION': {
      const updated = state.organizations.map(o =>
        o.id === action.payload.id
          ? { ...o, ...action.payload.changes, updated_at: new Date().toISOString() }
          : o
      );
      return { ...state, organizations: updated };
    }

    case 'UPDATE_USER': {
      const updated = state.users.map(u =>
        u.id === action.payload.id
          ? { ...u, ...action.payload.changes, updated_at: new Date().toISOString() }
          : u
      );
      return { ...state, users: updated };
    }

    case 'SET_ACTIVE_VIEW':
      return { ...state, ui: { ...state.ui, activeView: action.payload } };

    case 'OPEN_TICKET_TAB': {
      const tabId = action.payload;
      const tabs = state.ui.openTicketTabs.includes(tabId)
        ? state.ui.openTicketTabs
        : [...state.ui.openTicketTabs, tabId];
      return { ...state, ui: { ...state.ui, openTicketTabs: tabs, activeTicketId: tabId } };
    }

    case 'CLOSE_TICKET_TAB': {
      const closedId = action.payload;
      const newTabs = state.ui.openTicketTabs.filter(id => id !== closedId);
      let newActive = state.ui.activeTicketId;
      if (newActive === closedId) {
        newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
      }
      return { ...state, ui: { ...state.ui, openTicketTabs: newTabs, activeTicketId: newActive } };
    }

    case 'SET_ACTIVE_TICKET':
      return { ...state, ui: { ...state.ui, activeTicketId: action.payload } };

    case 'SET_SEARCH_QUERY':
      return { ...state, ui: { ...state.ui, searchQuery: action.payload } };

    case 'TOGGLE_SELECTED_TICKET': {
      const tid2 = action.payload;
      const sel = state.ui.selectedTicketIds.includes(tid2)
        ? state.ui.selectedTicketIds.filter(id => id !== tid2)
        : [...state.ui.selectedTicketIds, tid2];
      return { ...state, ui: { ...state.ui, selectedTicketIds: sel } };
    }

    case 'SELECT_ALL_TICKETS':
      return { ...state, ui: { ...state.ui, selectedTicketIds: action.payload } };

    case 'DESELECT_ALL_TICKETS':
      return { ...state, ui: { ...state.ui, selectedTicketIds: [] } };

    case 'BULK_UPDATE_TICKETS': {
      const { ids, changes } = action.payload;
      const bulkUpdated = state.tickets.map(t =>
        ids.includes(t.id) ? { ...t, ...changes, updated_at: new Date().toISOString() } : t
      );
      return { ...state, tickets: bulkUpdated, ui: { ...state.ui, selectedTicketIds: [] } };
    }

    case 'SET_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } };

    default:
      return state;
  }
}

export function evaluateViewConditions(view, tickets, currentUserId) {
  const statusOrder = STATUS_ORDER;

  function matchCondition(ticket, cond) {
    const val = ticket[cond.field];
    if (cond.field === 'assignee_id') {
      const checkVal = cond.value === 'current_user' ? currentUserId : cond.value;
      if (cond.operator === 'is') return val === checkVal;
      if (cond.operator === 'is_not') return val !== checkVal;
    }
    if (cond.field === 'status') {
      if (cond.operator === 'is') return val === cond.value;
      if (cond.operator === 'less_than') {
        return statusOrder.indexOf(val) < statusOrder.indexOf(cond.value);
      }
    }
    if (cond.field === 'priority') {
      if (cond.operator === 'is') return val === cond.value;
    }
    if (cond.field === 'updated_at' && cond.operator === 'within') {
      const rawDays = cond.value;
      let days = parseFloat(rawDays);
      if (isNaN(days)) {
        // Handle formats like '7_days', '30_days', '2_weeks'
        const match = String(rawDays).match(/^(\d+(?:\.\d+)?)_?(days?|weeks?|months?)?/i);
        if (match) {
          days = parseFloat(match[1]);
          const unit = (match[2] || 'days').toLowerCase();
          if (unit.startsWith('week')) days *= 7;
          else if (unit.startsWith('month')) days *= 30;
        } else {
          days = 7; // fallback
        }
      }
      const cutoff = new Date(Date.now() - days * 86400000);
      return new Date(val) >= cutoff;
    }
    return true;
  }

  return tickets.filter(ticket => {
    const allMatch = view.conditions.all.every(c => matchCondition(ticket, c));
    const anyMatch = view.conditions.any.length === 0 || view.conditions.any.some(c => matchCondition(ticket, c));
    return allMatch && anyMatch;
  });
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);
  const sidRef = useRef(null);

  useEffect(() => {
    const sid = getSessionId();
    sidRef.current = sid;

    const isRefresh = localStorage.getItem(initialKey(sid)) !== null;
    if (isRefresh) {
      const data = initializeData(sid);
      dispatch({ type: 'SET_STATE', payload: data });
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        dispatch({ type: 'SET_STATE', payload: data });
      });
    }
  }, []);

  useEffect(() => {
    if (state) {
      saveState(state, sidRef.current);
    }
  }, [state]);

  if (!state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui', color: '#68737D' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { AppContext };
