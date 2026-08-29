import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSessionId, fetchCustomState, initializeData, saveState, initialKey } from '../utils/dataManager';
import { getStateDiff } from '../utils/stateTracker';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [initialState, setInitialState] = useState(null);
  const [sid, setSid] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const sessionId = getSessionId();
    setSid(sessionId);

    const iKey = initialKey(sessionId);
    const isRefresh = localStorage.getItem(iKey) !== null;

    if (isRefresh) {
      const data = initializeData(sessionId);
      const initial = JSON.parse(localStorage.getItem(iKey));
      setState(data);
      setInitialState(initial);
    } else {
      fetchCustomState(sessionId).then(custom => {
        const data = initializeData(sessionId, custom);
        const initial = JSON.parse(localStorage.getItem(iKey) || JSON.stringify(data));
        setState(data);
        setInitialState(initial);
      });
    }
  }, []);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveState(next, sid);
      return next;
    });
  }, [sid]);

  // Toast system
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // CRUD helpers
  const addItem = useCallback((collection, item) => {
    updateState(prev => ({
      ...prev,
      [collection]: [...(prev[collection] || []), item]
    }));
  }, [updateState]);

  const updateItem = useCallback((collection, id, updates) => {
    updateState(prev => ({
      ...prev,
      [collection]: (prev[collection] || []).map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  }, [updateState]);

  const deleteItem = useCallback((collection, id) => {
    updateState(prev => ({
      ...prev,
      [collection]: (prev[collection] || []).filter(item => item.id !== id)
    }));
  }, [updateState]);

  // Add an activity entry to the activities map (keyed by contactId)
  const addActivity = useCallback((contactId, activity) => {
    updateState(prev => ({
      ...prev,
      activities: {
        ...(prev.activities || {}),
        [contactId]: [activity, ...(prev.activities?.[contactId] || [])]
      }
    }));
  }, [updateState]);

  const getStateDiffFn = useCallback(() => {
    if (!initialState || !state) return {};
    return getStateDiff(initialState, state);
  }, [initialState, state]);

  if (!state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F8FA' }}>
        <div style={{ color: '#516F90', fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      state,
      setState,
      updateState,
      initialState,
      addItem,
      updateItem,
      deleteItem,
      addActivity,
      showToast,
      getStateDiff: getStateDiffFn,
      sid
    }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
          >×</button>
        </div>
      ))}
    </div>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
