
    import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
    import { INITIAL_STATE, fetchCustomState, getInitialState, getSessionId, initializeData, saveState } from './data';

    const createId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const AppStoreContext = createContext(null);

    const useStoreValue = () => {
      const sidRef = useRef(getSessionId());
      const [state, setState] = useState(() => {
        return initializeData(sidRef.current);
      });
      const [initialState, setInitialState] = useState(() => getInitialState(sidRef.current) || state);

      useEffect(() => {
        let isMounted = true;
        fetchCustomState(sidRef.current).then(customState => {
          if (!isMounted || !customState) return;
          const hydrated = initializeData(sidRef.current, customState);
          setState(hydrated);
          setInitialState(getInitialState(sidRef.current) || hydrated);
        });
        return () => {
          isMounted = false;
        };
      }, []);

      useEffect(() => {
        saveState(state, sidRef.current);
      }, [state]);

      const addBooking = (booking) => {
        setState(prev => ({
          ...prev,
          bookings: [
            ...prev.bookings,
            {
              ...booking,
              id: createId('bk'),
              reference: booking.reference || `SKY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
              created: new Date().toISOString()
            }
          ]
        }));
      };

      const addAlert = (alert) => {
        setState(prev => ({
          ...prev,
          alerts: [...prev.alerts, { ...alert, id: createId('al'), active: true }]
        }));
      };

      const markAlertRead = (alertId) => {
        setState(prev => ({
          ...prev,
          alerts: prev.alerts.map(alert => alert.id === alertId ? { ...alert, read: true } : alert)
        }));
      };

      const cancelAlert = (alertId) => {
        setState(prev => ({
          ...prev,
          alerts: prev.alerts.map(alert => alert.id === alertId ? { ...alert, active: false } : alert)
        }));
      };

      const resetStore = () => {
        const nextState = initializeData(sidRef.current, INITIAL_STATE);
        setState(nextState);
        setInitialState(nextState);
      }

      return {
        state,
        addBooking,
        addAlert,
        markAlertRead,
        cancelAlert,
        resetStore,
        initialState
      };
    };

    export const StoreProvider = ({ children }) => {
      const value = useStoreValue();
      return React.createElement(AppStoreContext.Provider, { value }, children);
    };

    export const useAppStore = () => {
      const context = useContext(AppStoreContext);
      if (!context) {
        throw new Error('useAppStore must be used inside StoreProvider');
      }
      return context;
    };
