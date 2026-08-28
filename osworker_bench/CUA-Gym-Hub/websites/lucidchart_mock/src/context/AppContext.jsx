import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getSessionId, fetchCustomState, initializeData, saveState,
  getSavedInitialState, initialKey, storageKey
} from '../utils/dataManager';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const initialStateRef = useRef(null);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;
    const ik = initialKey(sid);
    const isRefresh = localStorage.getItem(ik) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      initialStateRef.current = getSavedInitialState(sid) || data;
      setState(data);
      setLoading(false);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        initialStateRef.current = getSavedInitialState(sid) || data;
        setState(data);
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      const timeout = setTimeout(() => {
        saveState(state, sidRef.current);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [state, loading]);

  const updateState = useCallback((updater) => {
    setState(prev => {
      if (!prev) return prev;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  }, []);

  // Document operations
  const addDocument = useCallback((doc) => {
    updateState(prev => ({
      ...prev,
      documents: [...prev.documents, doc]
    }));
  }, [updateState]);

  const updateDocument = useCallback((docId, changes) => {
    updateState(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === docId ? { ...d, ...changes } : d)
    }));
  }, [updateState]);

  const deleteDocument = useCallback((docId) => {
    updateState(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== docId)
    }));
  }, [updateState]);

  // Shape operations
  const addShape = useCallback((shape) => {
    updateState(prev => ({
      ...prev,
      shapes: [...prev.shapes, shape]
    }));
  }, [updateState]);

  const updateShape = useCallback((shapeId, changes) => {
    updateState(prev => ({
      ...prev,
      shapes: prev.shapes.map(s => s.id === shapeId ? { ...s, ...changes } : s)
    }));
  }, [updateState]);

  const deleteShapes = useCallback((shapeIds) => {
    updateState(prev => ({
      ...prev,
      shapes: prev.shapes.filter(s => !shapeIds.includes(s.id)),
      connectors: prev.connectors.filter(c =>
        !shapeIds.includes(c.sourceShapeId) && !shapeIds.includes(c.targetShapeId)
      ),
      ui: { ...prev.ui, selectedShapeIds: [] }
    }));
  }, [updateState]);

  // Connector operations
  const addConnector = useCallback((conn) => {
    updateState(prev => ({
      ...prev,
      connectors: [...prev.connectors, conn]
    }));
  }, [updateState]);

  const updateConnector = useCallback((connId, changes) => {
    updateState(prev => ({
      ...prev,
      connectors: prev.connectors.map(c => c.id === connId ? { ...c, ...changes } : c)
    }));
  }, [updateState]);

  const deleteConnector = useCallback((connId) => {
    updateState(prev => ({
      ...prev,
      connectors: prev.connectors.filter(c => c.id !== connId)
    }));
  }, [updateState]);

  // Comment operations
  const addComment = useCallback((comment) => {
    updateState(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }));
  }, [updateState]);

  const updateComment = useCallback((commentId, changes) => {
    updateState(prev => ({
      ...prev,
      comments: prev.comments.map(c => c.id === commentId ? { ...c, ...changes } : c)
    }));
  }, [updateState]);

  // Page operations
  const addPage = useCallback((page) => {
    updateState(prev => ({
      ...prev,
      pages: [...prev.pages, page]
    }));
  }, [updateState]);

  const updatePage = useCallback((pageId, changes) => {
    updateState(prev => ({
      ...prev,
      pages: prev.pages.map(p => p.id === pageId ? { ...p, ...changes } : p)
    }));
  }, [updateState]);

  const deletePage = useCallback((pageId) => {
    updateState(prev => ({
      ...prev,
      pages: prev.pages.filter(p => p.id !== pageId),
      shapes: prev.shapes.filter(s => s.pageId !== pageId),
      connectors: prev.connectors.filter(c => c.pageId !== pageId)
    }));
  }, [updateState]);

  // Folder operations
  const addFolder = useCallback((folder) => {
    updateState(prev => ({
      ...prev,
      folders: [...prev.folders, folder]
    }));
  }, [updateState]);

  // UI state
  const setUI = useCallback((changes) => {
    updateState(prev => ({
      ...prev,
      ui: { ...prev.ui, ...changes }
    }));
  }, [updateState]);

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui' }}>
        Loading...
      </div>
    );
  }

  const value = {
    state,
    initialState: initialStateRef.current,
    updateState,
    addDocument, updateDocument, deleteDocument,
    addShape, updateShape, deleteShapes,
    addConnector, updateConnector, deleteConnector,
    addComment, updateComment,
    addPage, updatePage, deletePage,
    addFolder,
    setUI,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
