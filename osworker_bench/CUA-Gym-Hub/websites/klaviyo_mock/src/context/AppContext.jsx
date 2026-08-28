import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  loadState,
  loadInitialState,
  initialKey,
  saveInitialState,
  createInitialData
} from '../utils/dataManager';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [initialState, setInitialState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = getSessionId();
    const isRefresh = localStorage.getItem(initialKey(sid)) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      setState(data);
      setInitialState(loadInitialState(sid) || data);
      setLoading(false);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        setState(data);
        setInitialState(loadInitialState(sid) || data);
        setLoading(false);
      });
    }
  }, []);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const sid = getSessionId();
      saveState(next, sid);
      return next;
    });
  }, []);

  const updateEntity = useCallback((entityType, id, updates) => {
    updateState(prev => {
      const items = prev[entityType];
      if (Array.isArray(items)) {
        return {
          ...prev,
          [entityType]: items.map(item => item.id === id ? { ...item, ...updates } : item)
        };
      }
      return prev;
    });
  }, [updateState]);

  const addEntity = useCallback((entityType, entity) => {
    updateState(prev => ({
      ...prev,
      [entityType]: [...(prev[entityType] || []), entity]
    }));
  }, [updateState]);

  const removeEntity = useCallback((entityType, id) => {
    updateState(prev => ({
      ...prev,
      [entityType]: (prev[entityType] || []).filter(item => item.id !== id)
    }));
  }, [updateState]);

  const updateUI = useCallback((updates) => {
    updateState(prev => ({
      ...prev,
      ui: { ...prev.ui, ...updates }
    }));
  }, [updateState]);

  if (loading || !state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#6E6E8A', background: '#0F0F1A' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{
      state,
      initialState,
      updateState,
      updateEntity,
      addEntity,
      removeEntity,
      updateUI
    }}>
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
