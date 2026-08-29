import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSessionId, fetchCustomState, initializeData, saveState, initialKey, storageKey } from '../utils/dataManager';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [initialState, setInitialState] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;
    const iKey = initialKey(sid);
    const isRefresh = localStorage.getItem(iKey) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      setState(data);
      try {
        const storedInitial = localStorage.getItem(iKey);
        setInitialState(storedInitial ? JSON.parse(storedInitial) : JSON.parse(JSON.stringify(data)));
      } catch {
        setInitialState(JSON.parse(JSON.stringify(data)));
      }
      setLoading(false);
    } else {
      fetchCustomState(sid).then(customState => {
        const data = initializeData(sid, customState);
        setState(data);
        setInitialState(JSON.parse(JSON.stringify(data)));
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (loading || !state) return;
    saveState(state, sidRef.current);
  }, [state, loading]);

  const updateState = (updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  };

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Lato, sans-serif', color: '#6B7780' }}>
        Loading...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, setState: updateState, initialState }}>
      {children}
    </AppContext.Provider>
  );
};
