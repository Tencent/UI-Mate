import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  INITIAL_CANVAS_CONFIG,
  MOCK_TEMPLATES,
  getSessionId,
  fetchCustomState,
  saveState,
  getSavedInitialState,
  initializeData
} from '../utils/initialData';

const DesignContext = createContext();

export const useDesign = () => useContext(DesignContext);

export const DesignProvider = ({ children }) => {
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  // --- State ---
  const [canvasConfig, setCanvasConfig] = useState(INITIAL_CANVAS_CONFIG);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastShareLink, setLastShareLink] = useState('');

  // --- Initialization (session-aware) ---
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `canva_mock_initialState_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const data = initializeData(sid);
        setCanvasConfig(data.canvasConfig || INITIAL_CANVAS_CONFIG);
        setElements(data.elements || []);
        setUploads(data.uploads || []);
        setLastShareLink(data.lastShareLink || '');
        setHistory([data.elements || []]);
        setHistoryStep(0);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(custom => {
          const data = initializeData(sid, custom);
          setCanvasConfig(data.canvasConfig || INITIAL_CANVAS_CONFIG);
          setElements(data.elements || []);
          setUploads(data.uploads || []);
          setLastShareLink(data.lastShareLink || '');
          setHistory([data.elements || []]);
          setHistoryStep(0);
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      setCanvasConfig(data.canvasConfig || INITIAL_CANVAS_CONFIG);
      setElements(data.elements || []);
      setUploads(data.uploads || []);
      setLastShareLink(data.lastShareLink || '');
      setHistory([data.elements || []]);
      setHistoryStep(0);
      setLoading(false);
    }
  }, []);

  // --- Persistence (session-aware) ---
  useEffect(() => {
    if (loading) return;
    const stateToSave = {
      canvasConfig,
      elements,
      uploads,
      lastShareLink,
      timestamp: new Date().toISOString()
    };
    saveState(stateToSave, sidRef.current);
  }, [canvasConfig, elements, uploads, lastShareLink, loading]);

  // --- History Management ---
  const pushToHistory = (newElements) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setElements(newElements);
  };

  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      setElements(history[prevStep]);
      setSelectedId(null);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setElements(history[nextStep]);
      setSelectedId(null);
    }
  };

  // --- Actions ---
  const addElement = (element) => {
    const newElement = {
      ...element,
      id: uuidv4(),
      x: element.x || canvasConfig.width / 2 - 50,
      y: element.y || canvasConfig.height / 2 - 50,
    };
    pushToHistory([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateElement = (id, newAttrs) => {
    const newElements = elements.map(el =>
      el.id === id ? { ...el, ...newAttrs } : el
    );
    pushToHistory(newElements);
  };

  const deleteElement = (id) => {
    const newElements = elements.filter(el => el.id !== id);
    pushToHistory(newElements);
    setSelectedId(null);
  };

  const toggleVisibility = (id) => {
    const newElements = elements.map(el =>
      el.id === id ? { ...el, visible: el.visible === false } : el
    );
    pushToHistory(newElements);
  };

  const duplicateElement = (id) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      addElement({
        ...element,
        x: element.x + 20,
        y: element.y + 20,
      });
    }
  };

  const reorderElement = (id, direction) => {
    const index = elements.findIndex(el => el.id === id);
    if (index === -1) return;

    const newElements = [...elements];
    const [movedElement] = newElements.splice(index, 1);

    if (direction === 'front') {
      newElements.push(movedElement);
    } else if (direction === 'back') {
      newElements.unshift(movedElement);
    } else if (direction === 'forward' && index < elements.length - 1) {
      newElements.splice(index + 1, 0, movedElement);
    } else if (direction === 'backward' && index > 0) {
      newElements.splice(index - 1, 0, movedElement);
    } else {
      // No change possible, put it back
      newElements.splice(index, 0, movedElement);
      return;
    }
    pushToHistory(newElements);
  };

  const applyTemplate = (template) => {
    const templateElements = template.elements.map(el => ({
      ...el,
      id: uuidv4()
    }));
    pushToHistory(templateElements);
    setSelectedId(null);
  };

  const addUpload = (file) => {
    const newUpload = {
      id: uuidv4(),
      url: file.url,
      name: file.name,
      type: file.type || 'image',
      createdAt: new Date().toISOString()
    };
    setUploads([...uploads, newUpload]);
  };

  const createShareLink = () => {
    const token = Math.random().toString(36).slice(2, 11);
    const sidPart = sidRef.current ? `?sid=${encodeURIComponent(sidRef.current)}` : '';
    const link = `https://mock-xanva.local/design/${token}${sidPart}`;
    setLastShareLink(link);
    return link;
  };

  const resizeCanvas = (width, height) => {
    setCanvasConfig(prev => ({ ...prev, width, height }));
  };

  // --- Get State for /go endpoint ---
  const getFullState = () => {
    const savedInitial = getSavedInitialState(sidRef.current);
    return {
      initial_state: savedInitial || {
        canvasConfig: INITIAL_CANVAS_CONFIG,
        elements: [],
        uploads: []
      },
      current_state: {
        canvasConfig,
        elements,
        uploads,
        lastShareLink,
        selectedId
      },
      state_diff: {
        elementCount: elements.length,
        historySteps: history.length,
        currentStep: historyStep
      }
    };
  };

  if (loading) return <div>Loading...</div>;

  return (
    <DesignContext.Provider value={{
      canvasConfig,
      elements,
      selectedId,
      setSelectedId,
      addElement,
      updateElement,
      deleteElement,
      duplicateElement,
      reorderElement,
      toggleVisibility,
      applyTemplate,
      undo,
      redo,
      canUndo: historyStep > 0,
      canRedo: historyStep < history.length - 1,
      uploads,
      addUpload,
      resizeCanvas,
      createShareLink,
      lastShareLink,
      getFullState
    }}>
      {children}
    </DesignContext.Provider>
  );
};
