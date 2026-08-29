import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  initialKey,
  storageKey,
} from '../lib/data';

// Compute flat key-path diff between two state objects
function computeDiff(initial, current, prefix = '') {
  const diff = {};
  const allKeys = new Set([
    ...Object.keys(initial || {}),
    ...Object.keys(current || {}),
  ]);
  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const oldVal = initial ? initial[key] : undefined;
    const newVal = current ? current[key] : undefined;
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[path] = { old: oldVal, new: newVal };
    }
  }
  return diff;
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const sid = getSessionId();
  const isRefresh = localStorage.getItem(initialKey(sid)) !== null;
  const [state, setState] = useState(() => {
    if (isRefresh) {
      return initializeData(sid);
    }
    // Async load will update state; start with defaults
    return initializeData(sid);
  });
  const initialStateRef = useRef(null);

  useEffect(() => {
    // Store initialState reference (from localStorage initialKey)
    const stored = localStorage.getItem(initialKey(sid));
    if (stored) {
      initialStateRef.current = JSON.parse(stored);
    } else {
      initialStateRef.current = state;
    }

    if (!isRefresh) {
      // First load: fetch custom state from server
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        setState(data);
        initialStateRef.current = JSON.parse(localStorage.getItem(initialKey(sid)) || 'null') || data;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state on every change
  useEffect(() => {
    saveState(state, sid);
    // Also write to vite's /post-compatible file via fetch (only if state has changed from initial)
    if (initialStateRef.current) {
      const body = JSON.stringify({ action: 'set_current', state });
      fetch(`/post${sid ? `?sid=${encodeURIComponent(sid)}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).catch(() => {});
    }
  }, [state]);

  // ─── Action Dispatchers ──────────────────────────────────────────────────

  const setSearch = (fields) => {
    setState(prev => ({ ...prev, search: { ...prev.search, ...fields } }));
  };

  const setMultiLegs = (legs) => {
    setState(prev => ({ ...prev, search: { ...prev.search, legs } }));
  };

  const setFilters = (fields) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...fields } }));
  };

  const selectOutboundFlight = (id) => {
    setState(prev => ({ ...prev, selectedOutboundFlight: id }));
  };

  const selectReturnFlight = (id) => {
    setState(prev => ({ ...prev, selectedReturnFlight: id }));
  };

  const addBooking = (booking) => {
    setState(prev => ({
      ...prev,
      bookings: [
        ...prev.bookings,
        { ...booking, id: `bk_${Date.now()}`, createdAt: new Date().toISOString() },
      ],
    }));
  };

  const addPriceAlert = (alert) => {
    setState(prev => ({
      ...prev,
      priceAlerts: [
        ...prev.priceAlerts,
        { ...alert, id: `al_${Date.now()}`, active: true, createdAt: new Date().toISOString() },
      ],
    }));
  };

  const removePriceAlert = (id) => {
    setState(prev => ({
      ...prev,
      priceAlerts: prev.priceAlerts.filter(a => a.id !== id),
    }));
  };

  const togglePriceTracking = (route) => {
    setState(prev => {
      const exists = prev.trackedRoutes.find(
        r => r.origin === route.origin && r.destination === route.destination
      );
      return {
        ...prev,
        trackedRoutes: exists
          ? prev.trackedRoutes.filter(
              r => !(r.origin === route.origin && r.destination === route.destination)
            )
          : [...prev.trackedRoutes, { ...route, addedAt: new Date().toISOString() }],
      };
    });
  };

  const setActiveTab = (tab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const setDateViewMode = (mode) => {
    setState(prev => ({ ...prev, dateViewMode: mode }));
  };

  const resetState = () => {
    const fresh = initializeData(sid, null);
    setState(fresh);
  };

  const getInitialState = () => initialStateRef.current || state;

  const getStateDiff = () => {
    const initial = getInitialState();
    return computeDiff(initial, state);
  };

  // Helper: look up segment object by ID
  const getSegment = (segId) => state.segments?.[segId] || null;

  // Helper: look up airline object by ID
  const getAirline = (airlineId) => state.airlines?.find(a => a.id === airlineId) || null;

  // Helper: look up airport object by code
  const getAirport = (code) => state.airports?.find(a => a.code === code) || null;

  const value = {
    state,
    sid,
    setSearch,
    setMultiLegs,
    setFilters,
    selectOutboundFlight,
    selectReturnFlight,
    addBooking,
    addPriceAlert,
    removePriceAlert,
    togglePriceTracking,
    setActiveTab,
    setDateViewMode,
    resetState,
    getInitialState,
    getStateDiff,
    getSegment,
    getAirline,
    getAirport,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
