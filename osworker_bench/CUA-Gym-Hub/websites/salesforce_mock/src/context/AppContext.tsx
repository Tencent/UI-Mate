
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { AppState } from '../types';
import { initializeData, getInitialState, fetchCustomState, getSessionId, saveState, calculateStateDiff } from '../data/initialData';

interface AppContextType {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  getInitialStateForDiff: () => AppState;
  getDebugState: () => { initial_state: AppState; current_state: AppState; state_diff: any };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // Check BEFORE initializeData if session data already exists in localStorage
      const sessionKey = `xalesforce-crm-initial_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      setState(data);
      setLoading(false);
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    if (state && !loading) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const updateState = (newState: Partial<AppState>) => {
    setState(prev => {
      if (!prev) return prev;
      return { ...prev, ...newState };
    });
  };

  const getInitialStateForDiff = (): AppState => {
    const initial = getInitialState(sidRef.current);
    return initial || state!;
  };

  const getDebugState = () => {
    const initial = getInitialStateForDiff();
    const diff = calculateStateDiff(initial, state!);
    return {
      initial_state: initial,
      current_state: state!,
      state_diff: diff
    };
  };

  if (loading || !state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ state, updateState, getInitialStateForDiff, getDebugState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
