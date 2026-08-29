import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas } from 'fabric';
import { serializeCanvas, getSessionId, saveCanvasState, getCanvasInitialState, fetchCustomState, initializeCanvasData } from '../lib/fabric-utils';

const BASE_INITIAL_KEY = 'canvas_mock_initialState';

export const useCanvas = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [activeObject, setActiveObject] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState({ undo: [], redo: [] });
  const [isSaved, setIsSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const saveTimerRef = useRef(null);

  const persistCanvas = useCallback((fabricCanvas, markSaved = false) => {
    if (!fabricCanvas) return;
    const json = serializeCanvas(fabricCanvas);
    const sid = sidRef.current;
    const currentKey = sid ? `canvas_current_state_${sid}` : 'canvas_current_state';
    const modifiedKey = sid ? `canvas_last_modified_${sid}` : 'canvas_last_modified';
    localStorage.setItem(currentKey, JSON.stringify(json));
    localStorage.setItem(modifiedKey, new Date().toISOString());
    saveCanvasState({
      canvasJSON: json,
      canvasImage: null,
      timestamp: new Date().toISOString()
    }, sid);
    if (markSaved) {
      setIsSaved(true);
      setLastSaved(new Date());
    }
  }, []);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: window.innerWidth - 300, // Subtract sidebar width
      height: window.innerHeight - 60, // Subtract toolbar height
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    setCanvas(fabricCanvas);

    const handleSelection = () => {
      const active = fabricCanvas.getActiveObject();
      setActiveObject(active);
    };

    const handleModification = () => {
      setIsSaved(false);
      saveToHistory(fabricCanvas);
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = window.setTimeout(() => persistCanvas(fabricCanvas, true), 300);
    };

    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', () => setActiveObject(null));

    fabricCanvas.on('object:added', handleModification);
    fabricCanvas.on('object:modified', handleModification);
    fabricCanvas.on('object:removed', handleModification);

    // Resize handler
    const handleResize = () => {
      fabricCanvas.setDimensions({
        width: window.innerWidth - 300,
        height: window.innerHeight - 60
      });
    };
    window.addEventListener('resize', handleResize);

    // Session-aware initialization
    const sid = sidRef.current;
    const doInit = async () => {
      if (initDone.current) return;
      initDone.current = true;

      if (sid) {
        const sessionKey = `${BASE_INITIAL_KEY}_${sid}`;
        const isRefresh = localStorage.getItem(sessionKey) !== null;
        if (isRefresh) {
          // Load from session-specific localStorage
          const data = initializeCanvasData(sid);
          if (data && data.canvasJSON) {
            await fabricCanvas.loadFromJSON(data.canvasJSON);
            fabricCanvas.requestRenderAll();
          }
        } else {
          // First load with session - fetch custom state
          const customState = await fetchCustomState(sid);
          const data = initializeCanvasData(sid, customState);
          if (data && data.canvasJSON) {
            await fabricCanvas.loadFromJSON(data.canvasJSON);
            fabricCanvas.requestRenderAll();
          }
        }
      } else {
        initializeCanvasData();
      }

      // Capture initial state after init
      const initialState = fabricCanvas.toJSON(['id']);
      const sid2 = sidRef.current;
      const initKey = sid2 ? `canvas_initial_state_${sid2}` : 'canvas_initial_state';
      localStorage.setItem(initKey, JSON.stringify({
        state: initialState,
        timestamp: new Date().toISOString(),
        image: fabricCanvas.toDataURL()
      }));
      persistCanvas(fabricCanvas, true);

      setLoading(false);
    };

    doInit();

    return () => {
      fabricCanvas.dispose();
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(saveTimerRef.current);
    };
  }, [persistCanvas]);

  // Auto-save
  useEffect(() => {
    if (!canvas) return;

    const interval = setInterval(() => {
      if (!isSaved) {
        persistCanvas(canvas, true);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [canvas, isSaved, persistCanvas]);

  const saveToHistory = (c) => {
    if (!c) return;
    const json = JSON.stringify(c.toJSON(['id']));
    setHistory(prev => ({
      undo: [...prev.undo.slice(-49), json],
      redo: []
    }));
  };

  const undo = useCallback(() => {
    if (!canvas || history.undo.length === 0) return;
    const prevState = history.undo[history.undo.length - 2]; // Get second to last
    const currentState = history.undo[history.undo.length - 1];

    if (prevState) {
      canvas.loadFromJSON(JSON.parse(prevState)).then(() => {
        canvas.requestRenderAll();
        setHistory(prev => ({
          undo: prev.undo.slice(0, -1),
          redo: [...prev.redo, currentState]
        }));
      });
    }
  }, [canvas, history]);

  const redo = useCallback(() => {
    if (!canvas || history.redo.length === 0) return;
    const nextState = history.redo[history.redo.length - 1];
    const currentState = JSON.stringify(canvas.toJSON(['id']));

    canvas.loadFromJSON(JSON.parse(nextState)).then(() => {
      canvas.requestRenderAll();
      setHistory(prev => ({
        undo: [...prev.undo, currentState],
        redo: prev.redo.slice(0, -1)
      }));
    });
  }, [canvas, history]);

  return {
    canvasRef,
    canvas,
    activeObject,
    zoom,
    setZoom,
    undo,
    redo,
    isSaved,
    lastSaved,
    loading,
    persistCanvas: () => persistCanvas(canvas, true)
  };
};
