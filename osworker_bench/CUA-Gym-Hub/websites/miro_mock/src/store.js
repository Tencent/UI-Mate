import { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_STATE, initializeData, getSavedInitialState, fetchCustomState, getSessionId, saveState } from './utils';

export const useWhiteboardStore = () => {
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  const [data, setData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [initialState, setInitialState] = useState(JSON.parse(JSON.stringify(INITIAL_STATE)));

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // Check BEFORE initializeData if session data already exists in localStorage
      const sessionKey = `miro_mock_initialState_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        // Refresh: use existing session localStorage (preserves agent's changes)
        const loaded = initializeData(sid);
        setInitialState(getSavedInitialState(sid) || JSON.parse(JSON.stringify(loaded)));
        setData(loaded);
        setLoading(false);
      } else {
        // First load: fetch custom state from server, then initialize
        fetchCustomState(sid).then(customState => {
          const loaded = initializeData(sid, customState);
          setInitialState(getSavedInitialState(sid) || JSON.parse(JSON.stringify(loaded)));
          setData(loaded);
          setLoading(false);
        });
      }
    } else {
      // No sid: backward compatible default behavior
      const loaded = initializeData();
      setInitialState(getSavedInitialState() || JSON.parse(JSON.stringify(loaded)));
      setData(loaded);
      setLoading(false);
    }
  }, []);

  // Persist to session-specific localStorage
  useEffect(() => {
    if (!loading) {
      saveState(data, sidRef.current, initialState);
    }
  }, [data, loading, initialState]);

  // Actions
  const addObject = (obj) => {
    setData(prev => ({
      ...prev,
      objects: [...prev.objects, obj]
    }));
  };

  const updateObject = (id, changes) => {
    setData(prev => ({
      ...prev,
      objects: prev.objects.map(obj => obj.id === id ? { ...obj, ...changes } : obj)
    }));
  };

  const deleteObject = (id) => {
    setData(prev => ({
      ...prev,
      objects: prev.objects.filter(obj => obj.id !== id)
    }));
  };

  const updateView = (view) => {
    setData(prev => ({
      ...prev,
      view: { ...prev.view, ...view }
    }));
  };

  const updateBoardName = (name) => {
    setData(prev => ({
      ...prev,
      name
    }));
  };

  const resetBoard = () => {
    setData(INITIAL_STATE);
  };

  const loadTemplate = (templateObjects) => {
    setData(prev => ({
      ...prev,
      objects: [...prev.objects, ...templateObjects]
    }));
  };

  // For /go endpoint
  const getStateReport = () => {
    // Calculate simple diff
    const diff = {
      objectsCountDiff: data.objects.length - initialState.objects.length,
      modified: data.created !== initialState.created,
      currentView: data.view
    };

    return {
      initial_state: initialState,
      current_state: data,
      state_diff: diff
    };
  };

  return {
    data,
    loading,
    addObject,
    updateObject,
    deleteObject,
    updateView,
    updateBoardName,
    resetBoard,
    loadTemplate,
    getStateReport
  };
};
