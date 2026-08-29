import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { createInitialData, loadState, saveState } from '../utils/dataManager.js';

const AppContext = createContext(null);

const ACTION_TYPES = {
  SET_STATE: 'SET_STATE',
  SET_ACTIVE_TOOL: 'SET_ACTIVE_TOOL',
  UPDATE_VIEWPORT: 'UPDATE_VIEWPORT',
  SET_ACTIVE_VIEWPORT: 'SET_ACTIVE_VIEWPORT',
  LOAD_SERIES: 'LOAD_SERIES',
  ADD_MEASUREMENT: 'ADD_MEASUREMENT',
  UPDATE_MEASUREMENT: 'UPDATE_MEASUREMENT',
  DELETE_MEASUREMENT: 'DELETE_MEASUREMENT',
  SET_STUDY_STATUS: 'SET_STUDY_STATUS',
  TOGGLE_LEFT_PANEL: 'TOGGLE_LEFT_PANEL',
  TOGGLE_RIGHT_PANEL: 'TOGGLE_RIGHT_PANEL',
  SET_LEFT_PANEL_TAB: 'SET_LEFT_PANEL_TAB',
  SET_UI_STATE: 'SET_UI_STATE',
  SET_STUDY_LIST_FILTERS: 'SET_STUDY_LIST_FILTERS',
  SET_STUDY_LIST_SORT: 'SET_STUDY_LIST_SORT',
  SET_STUDY_LIST_PAGE: 'SET_STUDY_LIST_PAGE',
  OPEN_STUDY: 'OPEN_STUDY',
  SET_LAYOUT: 'SET_LAYOUT',
  SET_WINDOW_LEVEL_PRESET: 'SET_WINDOW_LEVEL_PRESET',
  TOGGLE_SERIES_TRACKING: 'TOGGLE_SERIES_TRACKING',
  SET_CINE_PLAYING: 'SET_CINE_PLAYING',
  RESET_VIEWPORT: 'RESET_VIEWPORT',
  SET_SETTINGS: 'SET_SETTINGS',
};

function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_STATE:
      return { ...state, ...action.payload };

    case ACTION_TYPES.SET_ACTIVE_TOOL:
      return {
        ...state,
        toolState: {
          ...state.toolState,
          activeTool: action.payload,
          activeLeftClick: action.payload,
        }
      };

    case ACTION_TYPES.UPDATE_VIEWPORT: {
      const { viewportId, updates } = action.payload;
      return {
        ...state,
        viewports: {
          ...state.viewports,
          [viewportId]: {
            ...state.viewports[viewportId],
            ...updates
          }
        }
      };
    }

    case ACTION_TYPES.SET_ACTIVE_VIEWPORT: {
      const newViewports = {};
      for (const [id, vp] of Object.entries(state.viewports)) {
        newViewports[id] = { ...vp, isActive: id === action.payload };
      }
      return { ...state, viewports: newViewports };
    }

    case ACTION_TYPES.LOAD_SERIES: {
      const { viewportId, seriesId } = action.payload;
      const ser = state.series[seriesId];
      if (!ser) return state;
      return {
        ...state,
        viewports: {
          ...state.viewports,
          [viewportId]: {
            ...state.viewports[viewportId],
            seriesId,
            currentInstanceNumber: 1,
            windowCenter: ser.windowCenter,
            windowWidth: ser.windowWidth,
            zoom: 1.0,
            panX: 0,
            panY: 0,
            rotation: 0,
            flipH: false,
            flipV: false,
            invert: false,
          }
        }
      };
    }

    case ACTION_TYPES.ADD_MEASUREMENT:
      return {
        ...state,
        measurements: {
          ...state.measurements,
          [action.payload.id]: action.payload
        }
      };

    case ACTION_TYPES.UPDATE_MEASUREMENT: {
      const { id, updates } = action.payload;
      return {
        ...state,
        measurements: {
          ...state.measurements,
          [id]: { ...state.measurements[id], ...updates }
        }
      };
    }

    case ACTION_TYPES.DELETE_MEASUREMENT: {
      const newMeasurements = { ...state.measurements };
      delete newMeasurements[action.payload];
      return { ...state, measurements: newMeasurements };
    }

    case ACTION_TYPES.SET_STUDY_STATUS: {
      const { studyId, status } = action.payload;
      return {
        ...state,
        studies: {
          ...state.studies,
          [studyId]: { ...state.studies[studyId], status }
        }
      };
    }

    case ACTION_TYPES.TOGGLE_LEFT_PANEL:
      return {
        ...state,
        uiState: { ...state.uiState, leftPanelOpen: !state.uiState.leftPanelOpen }
      };

    case ACTION_TYPES.TOGGLE_RIGHT_PANEL:
      return {
        ...state,
        uiState: { ...state.uiState, rightPanelOpen: !state.uiState.rightPanelOpen }
      };

    case ACTION_TYPES.SET_LEFT_PANEL_TAB:
      return {
        ...state,
        uiState: { ...state.uiState, leftPanelTab: action.payload }
      };

    case ACTION_TYPES.SET_UI_STATE:
      return {
        ...state,
        uiState: { ...state.uiState, ...action.payload }
      };

    case ACTION_TYPES.SET_STUDY_LIST_FILTERS:
      return {
        ...state,
        uiState: {
          ...state.uiState,
          studyListFilters: { ...state.uiState.studyListFilters, ...action.payload },
          studyListPage: 1
        }
      };

    case ACTION_TYPES.SET_STUDY_LIST_SORT:
      return {
        ...state,
        uiState: { ...state.uiState, studyListSort: action.payload }
      };

    case ACTION_TYPES.SET_STUDY_LIST_PAGE:
      return {
        ...state,
        uiState: { ...state.uiState, studyListPage: action.payload }
      };

    case ACTION_TYPES.OPEN_STUDY: {
      const studyId = action.payload;
      const studySeries = Object.values(state.series).filter(s => s.studyId === studyId);
      const firstSeries = studySeries.length > 0 ? studySeries.sort((a, b) => a.seriesNumber - b.seriesNumber)[0] : null;
      const vpUpdates = {};
      const totalVPs = state.settings.layoutRows * state.settings.layoutColumns;
      for (let i = 0; i < totalVPs; i++) {
        const vpId = `VP-${i}`;
        const ser = i === 0 && firstSeries ? firstSeries : null;
        vpUpdates[vpId] = {
          id: vpId,
          seriesId: ser ? ser.id : null,
          currentInstanceNumber: ser ? Math.ceil(ser.numberOfInstances / 2) : 1,
          windowCenter: ser ? ser.windowCenter : 40,
          windowWidth: ser ? ser.windowWidth : 400,
          zoom: 1.0,
          panX: 0,
          panY: 0,
          rotation: 0,
          flipH: false,
          flipV: false,
          invert: false,
          isActive: i === 0,
        };
      }
      return {
        ...state,
        uiState: {
          ...state.uiState,
          currentView: 'viewer',
          activeStudyId: studyId,
        },
        viewports: vpUpdates,
      };
    }

    case ACTION_TYPES.SET_LAYOUT: {
      const { rows, columns } = action.payload;
      const total = rows * columns;
      const newViewports = {};
      for (let i = 0; i < total; i++) {
        const vpId = `VP-${i}`;
        newViewports[vpId] = state.viewports[vpId] || {
          id: vpId,
          seriesId: null,
          currentInstanceNumber: 1,
          windowCenter: 40,
          windowWidth: 400,
          zoom: 1.0,
          panX: 0,
          panY: 0,
          rotation: 0,
          flipH: false,
          flipV: false,
          invert: false,
          isActive: i === 0,
        };
      }
      return {
        ...state,
        settings: { ...state.settings, layoutRows: rows, layoutColumns: columns },
        viewports: newViewports,
      };
    }

    case ACTION_TYPES.SET_WINDOW_LEVEL_PRESET:
      return {
        ...state,
        toolState: { ...state.toolState, windowLevelPreset: action.payload }
      };

    case ACTION_TYPES.TOGGLE_SERIES_TRACKING: {
      const seriesId = action.payload;
      return {
        ...state,
        series: {
          ...state.series,
          [seriesId]: { ...state.series[seriesId], isTracked: !state.series[seriesId].isTracked }
        }
      };
    }

    case ACTION_TYPES.SET_CINE_PLAYING:
      return {
        ...state,
        uiState: { ...state.uiState, cineIsPlaying: action.payload }
      };

    case ACTION_TYPES.RESET_VIEWPORT: {
      const vpId = action.payload;
      const vp = state.viewports[vpId];
      if (!vp) return state;
      const ser = vp.seriesId ? state.series[vp.seriesId] : null;
      return {
        ...state,
        viewports: {
          ...state.viewports,
          [vpId]: {
            ...vp,
            windowCenter: ser ? ser.windowCenter : 40,
            windowWidth: ser ? ser.windowWidth : 400,
            zoom: 1.0,
            panX: 0,
            panY: 0,
            rotation: 0,
            flipH: false,
            flipV: false,
            invert: false,
          }
        }
      };
    }

    case ACTION_TYPES.SET_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const initialData = useRef(createInitialData());
  const [state, dispatch] = useReducer(appReducer, null, () => loadState());
  const initialStateRef = useRef(JSON.parse(JSON.stringify(initialData.current)));

  // Save state to localStorage on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const contextValue = {
    state,
    dispatch,
    initialState: initialStateRef.current,

    // Convenience functions
    setActiveTool: (tool) => dispatch({ type: ACTION_TYPES.SET_ACTIVE_TOOL, payload: tool }),
    updateViewport: (viewportId, updates) => dispatch({ type: ACTION_TYPES.UPDATE_VIEWPORT, payload: { viewportId, updates } }),
    setActiveViewport: (vpId) => dispatch({ type: ACTION_TYPES.SET_ACTIVE_VIEWPORT, payload: vpId }),
    loadSeries: (viewportId, seriesId) => dispatch({ type: ACTION_TYPES.LOAD_SERIES, payload: { viewportId, seriesId } }),
    addMeasurement: (measurement) => dispatch({ type: ACTION_TYPES.ADD_MEASUREMENT, payload: measurement }),
    updateMeasurement: (id, updates) => dispatch({ type: ACTION_TYPES.UPDATE_MEASUREMENT, payload: { id, updates } }),
    deleteMeasurement: (id) => dispatch({ type: ACTION_TYPES.DELETE_MEASUREMENT, payload: id }),
    setStudyStatus: (studyId, status) => dispatch({ type: ACTION_TYPES.SET_STUDY_STATUS, payload: { studyId, status } }),
    toggleLeftPanel: () => dispatch({ type: ACTION_TYPES.TOGGLE_LEFT_PANEL }),
    toggleRightPanel: () => dispatch({ type: ACTION_TYPES.TOGGLE_RIGHT_PANEL }),
    setLeftPanelTab: (tab) => dispatch({ type: ACTION_TYPES.SET_LEFT_PANEL_TAB, payload: tab }),
    setUiState: (updates) => dispatch({ type: ACTION_TYPES.SET_UI_STATE, payload: updates }),
    setStudyListFilters: (filters) => dispatch({ type: ACTION_TYPES.SET_STUDY_LIST_FILTERS, payload: filters }),
    setStudyListSort: (sort) => dispatch({ type: ACTION_TYPES.SET_STUDY_LIST_SORT, payload: sort }),
    setStudyListPage: (page) => dispatch({ type: ACTION_TYPES.SET_STUDY_LIST_PAGE, payload: page }),
    openStudy: (studyId) => dispatch({ type: ACTION_TYPES.OPEN_STUDY, payload: studyId }),
    setLayout: (rows, columns) => dispatch({ type: ACTION_TYPES.SET_LAYOUT, payload: { rows, columns } }),
    setWindowLevelPreset: (preset) => dispatch({ type: ACTION_TYPES.SET_WINDOW_LEVEL_PRESET, payload: preset }),
    toggleSeriesTracking: (seriesId) => dispatch({ type: ACTION_TYPES.TOGGLE_SERIES_TRACKING, payload: seriesId }),
    setCinePlaying: (playing) => dispatch({ type: ACTION_TYPES.SET_CINE_PLAYING, payload: playing }),
    resetViewport: (vpId) => dispatch({ type: ACTION_TYPES.RESET_VIEWPORT, payload: vpId }),
    setSettings: (updates) => dispatch({ type: ACTION_TYPES.SET_SETTINGS, payload: updates }),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export { ACTION_TYPES };
