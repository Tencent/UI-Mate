import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  getInitialState,
  calculateStateDiff,
  generateCandles,
} from '../utils/dataManager.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  useEffect(() => {
    const sid = getSessionId();
    sidRef.current = sid;

    const ik = sid ? `tradingViewInitialState_${sid}` : 'tradingViewInitialState';
    const isRefresh = localStorage.getItem(ik) !== null;

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
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveState(next, sidRef.current);
      return next;
    });
  }, []);

  // Convenience actions
  const setSymbol = useCallback((symbolId) => {
    updateState(prev => {
      // Ensure candle data exists for this symbol
      let candleData = prev.candleData;
      if (!candleData[symbolId]) {
        const sym = prev.symbols[symbolId];
        if (sym) {
          const seed = symbolId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
          candleData = {
            ...candleData,
            [symbolId]: { D: generateCandles(sym.price * 0.85, 250, 'D', seed) }
          };
        }
      }
      const tf = prev.chartState.timeframe;
      if (candleData[symbolId] && !candleData[symbolId][tf]) {
        const sym = prev.symbols[symbolId];
        if (sym) {
          const seed = symbolId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + tf.length;
          candleData = {
            ...candleData,
            [symbolId]: {
              ...candleData[symbolId],
              [tf]: generateCandles(sym.price * 0.9, tf === '60' ? 500 : 250, tf, seed)
            }
          };
        }
      }
      return { ...prev, candleData, chartState: { ...prev.chartState, symbolId } };
    });
  }, [updateState]);

  const setTimeframe = useCallback((timeframe) => {
    updateState(prev => {
      const symbolId = prev.chartState.symbolId;
      let candleData = prev.candleData;
      if (!candleData[symbolId]?.[timeframe]) {
        const sym = prev.symbols[symbolId];
        if (sym) {
          const seed = symbolId.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + timeframe.length * 7;
          const count = timeframe === '60' || timeframe === '240' ? 500 : timeframe === 'D' ? 250 : 200;
          candleData = {
            ...candleData,
            [symbolId]: {
              ...(candleData[symbolId] || {}),
              [timeframe]: generateCandles(sym.price * 0.9, count, timeframe, seed)
            }
          };
        }
      }
      return { ...prev, candleData, chartState: { ...prev.chartState, timeframe } };
    });
  }, [updateState]);

  const setChartType = useCallback((chartType) => {
    updateState(prev => ({ ...prev, chartState: { ...prev.chartState, chartType } }));
  }, [updateState]);

  const toggleRightPanel = useCallback((panel) => {
    updateState(prev => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        activeRightPanel: prev.uiState.activeRightPanel === panel ? null : panel
      }
    }));
  }, [updateState]);

  const toggleBottomPanel = useCallback((panel) => {
    updateState(prev => ({
      ...prev,
      uiState: {
        ...prev.uiState,
        activeBottomPanel: prev.uiState.activeBottomPanel === panel ? null : panel
      }
    }));
  }, [updateState]);

  const addAlert = useCallback((alert) => {
    updateState(prev => ({
      ...prev,
      alerts: [...prev.alerts, { ...alert, id: `alert_${Date.now()}` }]
    }));
  }, [updateState]);

  const removeAlert = useCallback((alertId) => {
    updateState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== alertId)
    }));
  }, [updateState]);

  const addIndicator = useCallback((indicator) => {
    const id = `ind_${Date.now()}`;
    updateState(prev => ({
      ...prev,
      indicators: [...prev.indicators, { ...indicator, id }],
      chartState: { ...prev.chartState, indicators: [...prev.chartState.indicators, id] }
    }));
  }, [updateState]);

  const removeIndicator = useCallback((indicatorId) => {
    updateState(prev => ({
      ...prev,
      indicators: prev.indicators.filter(i => i.id !== indicatorId),
      chartState: { ...prev.chartState, indicators: prev.chartState.indicators.filter(id => id !== indicatorId) }
    }));
  }, [updateState]);

  const addDrawing = useCallback((drawing) => {
    const id = `draw_${Date.now()}`;
    setState(prev => {
      // Push current drawings to undo stack before adding
      undoStackRef.current = [...undoStackRef.current, prev.drawings];
      redoStackRef.current = [];
      const next = {
        ...prev,
        drawings: [...prev.drawings, { ...drawing, id }],
        chartState: { ...prev.chartState, drawings: [...prev.chartState.drawings, id] }
      };
      saveState(next, sidRef.current);
      return next;
    });
    return id;
  }, []);

  const removeDrawing = useCallback((drawingId) => {
    updateState(prev => ({
      ...prev,
      drawings: prev.drawings.filter(d => d.id !== drawingId),
      chartState: { ...prev.chartState, drawings: prev.chartState.drawings.filter(id => id !== drawingId) }
    }));
  }, [updateState]);

  const setSelectedDrawingTool = useCallback((tool) => {
    updateState(prev => ({
      ...prev,
      uiState: { ...prev.uiState, selectedDrawingTool: tool }
    }));
  }, [updateState]);

  const addToWatchlist = useCallback((symbolId, watchlistId = null) => {
    updateState(prev => {
      const wlId = watchlistId || prev.watchlists.find(w => w.isDefault)?.id;
      return {
        ...prev,
        watchlists: prev.watchlists.map(wl => {
          if (wl.id !== wlId) return wl;
          const firstSection = wl.sections[0];
          if (firstSection.symbolIds.includes(symbolId)) return wl;
          return {
            ...wl,
            sections: wl.sections.map((s, i) => i === 0 ? { ...s, symbolIds: [...s.symbolIds, symbolId] } : s)
          };
        })
      };
    });
  }, [updateState]);

  const removeFromWatchlist = useCallback((symbolId, watchlistId = null) => {
    updateState(prev => {
      const wlId = watchlistId || prev.watchlists.find(w => w.isDefault)?.id;
      return {
        ...prev,
        watchlists: prev.watchlists.map(wl => {
          if (wl.id !== wlId) return wl;
          return {
            ...wl,
            sections: wl.sections.map(s => ({
              ...s,
              symbolIds: s.symbolIds.filter(id => id !== symbolId)
            }))
          };
        })
      };
    });
  }, [updateState]);

  const undoDrawing = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    setState(prev => {
      const prevDrawings = undoStackRef.current[undoStackRef.current.length - 1];
      undoStackRef.current = undoStackRef.current.slice(0, -1);
      redoStackRef.current = [...redoStackRef.current, prev.drawings];
      const next = {
        ...prev,
        drawings: prevDrawings,
        chartState: { ...prev.chartState, drawings: prevDrawings.map(d => d.id) }
      };
      saveState(next, sidRef.current);
      return next;
    });
  }, []);

  const redoDrawing = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    setState(prev => {
      const nextDrawings = redoStackRef.current[redoStackRef.current.length - 1];
      redoStackRef.current = redoStackRef.current.slice(0, -1);
      undoStackRef.current = [...undoStackRef.current, prev.drawings];
      const next = {
        ...prev,
        drawings: nextDrawings,
        chartState: { ...prev.chartState, drawings: nextDrawings.map(d => d.id) }
      };
      saveState(next, sidRef.current);
      return next;
    });
  }, []);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  const getStateDiff = useCallback(() => {
    if (!state) return {};
    const initial = getInitialState(sidRef.current);
    if (!initial) return {};
    return calculateStateDiff(initial, state);
  }, [state]);

  if (loading || !state) {
    return <div style={{ width: '100vw', height: '100vh', background: '#131722', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D4DC', fontFamily: '"Trebuchet MS", Roboto, Ubuntu, sans-serif' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{
      state, updateState, setSymbol, setTimeframe, setChartType,
      toggleRightPanel, toggleBottomPanel,
      addAlert, removeAlert,
      addIndicator, removeIndicator,
      addDrawing, removeDrawing, setSelectedDrawingTool,
      addToWatchlist, removeFromWatchlist,
      undoDrawing, redoDrawing, canUndo, canRedo,
      getStateDiff
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
