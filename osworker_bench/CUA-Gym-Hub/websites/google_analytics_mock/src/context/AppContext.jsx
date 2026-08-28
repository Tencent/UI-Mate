import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSessionId, fetchCustomState, initializeData,
  getInitialState, initialKey, saveState, storageKey,
  getMetricsForDateRange, getDailyMetricsArray
} from '../utils/dataManager.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = getSessionId();
    const isRefresh = localStorage.getItem(initialKey(sid)) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      setState(data);
      setLoading(false);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        setState(data);
        setLoading(false);
      });
    }
  }, []);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const sid = getSessionId();
      saveState(sid, next);
      return next;
    });
  }, []);

  const getAggregatedMetrics = useCallback((startDate, endDate) => {
    if (!state) return null;
    return getMetricsForDateRange(state.dailyMetrics, startDate, endDate);
  }, [state]);

  const getDailyArray = useCallback((startDate, endDate) => {
    if (!state) return [];
    return getDailyMetricsArray(state.dailyMetrics, startDate, endDate);
  }, [state]);

  const addRecentlyAccessed = useCallback((path, title) => {
    setState(prev => {
      const existing = (prev.recentlyAccessed || []).filter(r => r.path !== path);
      const updated = [{ path, title, timestamp: new Date().toISOString() }, ...existing].slice(0, 10);
      const next = { ...prev, recentlyAccessed: updated };
      const sid = getSessionId();
      saveState(sid, next);
      return next;
    });
  }, []);

  if (loading || !state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Roboto, sans-serif', color: '#5f6368' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{
      state, updateState, getAggregatedMetrics, getDailyArray, addRecentlyAccessed
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
}
