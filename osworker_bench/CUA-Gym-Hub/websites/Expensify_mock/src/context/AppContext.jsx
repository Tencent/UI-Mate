import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { initializeData, saveState, getSessionId, fetchCustomState, initialKey } from '../utils/dataManager';

const AppContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_EXPENSE': {
      const expenses = [...state.expenses, action.payload];
      return { ...state, expenses };
    }
    case 'UPDATE_EXPENSE': {
      const expenses = state.expenses.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e);
      return { ...state, expenses };
    }
    case 'DELETE_EXPENSE': {
      const deletedExpense = state.expenses.find(e => e.id === action.payload);
      const expenses = state.expenses.filter(e => e.id !== action.payload);
      // Update parent report totals if expense was in a report
      let reports = state.reports;
      if (deletedExpense && deletedExpense.reportId) {
        reports = state.reports.map(r => {
          if (r.id === deletedExpense.reportId) {
            const remaining = expenses.filter(e => e.reportId === r.id);
            return {
              ...r,
              total: remaining.reduce((sum, e) => sum + e.amount, 0),
              expenseCount: remaining.length,
              modifiedAt: new Date().toISOString(),
            };
          }
          return r;
        });
      }
      return { ...state, expenses, reports };
    }
    case 'ADD_REPORT': {
      const reports = [...state.reports, action.payload];
      return { ...state, reports };
    }
    case 'UPDATE_REPORT': {
      const reports = state.reports.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r);
      return { ...state, reports };
    }
    case 'DELETE_REPORT': {
      const reports = state.reports.filter(r => r.id !== action.payload);
      // Clear reportId on expenses that referenced the deleted report
      const expenses = state.expenses.map(e =>
        e.reportId === action.payload ? { ...e, reportId: null, status: 'unreported', modifiedAt: new Date().toISOString() } : e
      );
      return { ...state, reports, expenses };
    }
    case 'ADD_COMMENT': {
      const comments = [...state.comments, action.payload];
      return { ...state, comments };
    }
    case 'UPDATE_INBOX_ITEM': {
      const inboxItems = state.inboxItems.map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i);
      return { ...state, inboxItems };
    }
    case 'UPDATE_CATEGORY': {
      const categories = state.categories.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c);
      return { ...state, categories };
    }
    case 'ADD_CATEGORY': {
      const categories = [...state.categories, action.payload];
      return { ...state, categories };
    }
    case 'UPDATE_TAG': {
      const tags = state.tags.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t);
      return { ...state, tags };
    }
    case 'ADD_TAG': {
      const tags = [...state.tags, action.payload];
      return { ...state, tags };
    }
    case 'UPDATE_MEMBER': {
      const members = state.members.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m);
      return { ...state, members };
    }
    case 'ADD_MEMBER': {
      const members = [...state.members, action.payload];
      return { ...state, members };
    }
    case 'UPDATE_POLICY': {
      const policies = state.policies.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p);
      return { ...state, policies };
    }
    case 'UPDATE_UI':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    case 'SET_FILTERS':
      return { ...state, ui: { ...state.ui, ...action.payload } };
    case 'TOGGLE_EXPENSE_SELECTION': {
      const id = action.payload;
      const sel = state.ui.selectedExpenseIds || [];
      const next = sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id];
      return { ...state, ui: { ...state.ui, selectedExpenseIds: next } };
    }
    case 'TOGGLE_REPORT_SELECTION': {
      const id = action.payload;
      const sel = state.ui.selectedReportIds || [];
      const next = sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id];
      return { ...state, ui: { ...state.ui, selectedReportIds: next } };
    }
    case 'TOGGLE_REPORT_STAR': {
      const reports = state.reports.map(r => r.id === action.payload ? { ...r, starred: !r.starred } : r);
      return { ...state, reports };
    }
    case 'UPDATE_EXPORT_SETTINGS':
      return { ...state, exportSettings: { ...state.exportSettings, ...action.payload } };
    case 'UPDATE_CURRENT_USER':
      return { ...state, currentUser: { ...state.currentUser, ...action.payload } };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null);
  const [loading, setLoading] = useState(true);
  const sid = getSessionId();

  useEffect(() => {
    const iKey = initialKey(sid);
    const isRefresh = localStorage.getItem(iKey) !== null;
    if (isRefresh) {
      const data = initializeData(sid);
      dispatch({ type: 'SET_STATE', payload: data });
      setLoading(false);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        dispatch({ type: 'SET_STATE', payload: data });
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (state) saveState(state, sid);
  }, [state]);

  if (loading || !state) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8B959E' }}>Loading...</div>;
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
