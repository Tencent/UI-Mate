import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_STATE, initializeData, getInitialState, fetchCustomState, getSessionId, saveState } from './mockData';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `gitlab_mock_initialState_${sid}`;
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

  // Persist state changes
  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const updateState = (updater) => {
    setState(prev => {
      const newState = updater(prev);
      return { ...prev, ...newState };
    });
  };

  const getDiff = () => {
    const initial = getInitialState(sidRef.current) || INITIAL_STATE;
    if (!state || !initial) return {};
    return Object.keys(state).reduce((diff, key) => {
      if (JSON.stringify(state[key]) !== JSON.stringify(initial[key])) {
        diff[key] = {
          original: initial[key],
          current: state[key]
        };
      }
      return diff;
    }, {});
  };

  const resetState = () => {
    setState(INITIAL_STATE);
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{
      state,
      loading,
      updateState,
      INITIAL_STATE: getInitialState(sidRef.current) || INITIAL_STATE,
      getDiff,
      resetState
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
