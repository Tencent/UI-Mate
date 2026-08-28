import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getSessionId, fetchCustomState, initializeData, saveState, initialKey, storageKey
} from '../utils/dataManager';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const sidRef = useRef(getSessionId());

  const [state, setState] = useState(() => {
    const sid = sidRef.current;
    const initKey_val = initialKey(sid);
    const isRefresh = localStorage.getItem(initKey_val) !== null;
    if (isRefresh) {
      return initializeData(sid);
    }
    // On fresh session with no sid, immediately use default data so state is never permanently null
    if (!sid) {
      return initializeData(sid, null);
    }
    return null;
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (state !== null) return;
    const sid = sidRef.current;
    fetchCustomState(sid).then((custom) => {
      // initializeData always returns non-null (falls back to createInitialData)
      const data = initializeData(sid, custom);
      setState(data);
    }).catch(() => {
      // Final safety net: use default data
      const data = initializeData(sid, null);
      setState(data);
    });
  }, [state]);

  const updateState = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveState(next, sidRef.current);
      return next;
    });
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--font)', color: '#666' }}>
        加载中...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, updateState, showToast, sid: sidRef.current }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`} onClick={() => dismissToast(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

