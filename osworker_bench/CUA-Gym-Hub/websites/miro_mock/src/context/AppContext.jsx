import React, { createContext, useContext, useReducer, useEffect, useRef, useState, useCallback } from 'react';
import {
  createInitialData, initializeData, getSavedInitialState,
  fetchCustomState, getSessionId, saveState, generateId, initialKey
} from '../utils/dataManager.js';

const AppContext = createContext(null);

function appReducer(state, action) {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'ADD_BOARD': {
      const newBoard = {
        id: action.payload.id || generateId(),
        name: action.payload.name || 'Untitled board',
        description: '',
        projectId: action.payload.projectId || null,
        teamId: 'team_1',
        createdBy: 'user_1',
        createdAt: now,
        modifiedAt: now,
        starred: false,
        thumbnailColor: action.payload.thumbnailColor || '#4262ff',
        viewedAt: now,
      };
      return {
        ...state,
        boards: [...state.boards, newBoard],
        boardItems: { ...state.boardItems, [newBoard.id]: [] },
        comments: { ...state.comments, [newBoard.id]: [] },
        tags: { ...state.tags, [newBoard.id]: [] },
      };
    }

    case 'UPDATE_BOARD': {
      return {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.id ? { ...b, ...action.payload.changes, modifiedAt: now } : b
        ),
      };
    }

    case 'DELETE_BOARD': {
      const boardId = action.payload.id;
      const newBoardItems = { ...state.boardItems };
      delete newBoardItems[boardId];
      const newComments = { ...state.comments };
      delete newComments[boardId];
      const newTags = { ...state.tags };
      delete newTags[boardId];
      return {
        ...state,
        boards: state.boards.filter(b => b.id !== boardId),
        boardItems: newBoardItems,
        comments: newComments,
        tags: newTags,
        projects: state.projects.map(p => ({
          ...p,
          boardIds: p.boardIds.filter(id => id !== boardId),
        })),
      };
    }

    case 'STAR_BOARD': {
      return {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.id ? { ...b, starred: !b.starred } : b
        ),
      };
    }

    case 'DUPLICATE_BOARD': {
      const original = state.boards.find(b => b.id === action.payload.id);
      if (!original) return state;
      const newBoardId = generateId();
      const newBoard = {
        ...original,
        id: newBoardId,
        name: `${original.name} (copy)`,
        createdAt: now,
        modifiedAt: now,
        viewedAt: now,
        starred: false,
      };
      const originalItems = state.boardItems[original.id] || [];
      const idMap = {};
      const newItems = originalItems.map(item => {
        const newId = generateId();
        idMap[item.id] = newId;
        return { ...item, id: newId, boardId: newBoardId };
      });
      // Update parentId references
      const finalItems = newItems.map(item => ({
        ...item,
        parentId: item.parentId ? (idMap[item.parentId] || item.parentId) : null,
        childrenIds: item.childrenIds ? item.childrenIds.map(cid => idMap[cid] || cid) : undefined,
        start: item.start ? { ...item.start, itemId: idMap[item.start.itemId] || item.start.itemId } : undefined,
        end: item.end ? { ...item.end, itemId: idMap[item.end.itemId] || item.end.itemId } : undefined,
      }));
      return {
        ...state,
        boards: [...state.boards, newBoard],
        boardItems: { ...state.boardItems, [newBoardId]: finalItems },
        comments: { ...state.comments, [newBoardId]: [] },
        tags: { ...state.tags, [newBoardId]: [] },
      };
    }

    case 'MOVE_BOARD_TO_PROJECT': {
      const { boardId, projectId } = action.payload;
      return {
        ...state,
        boards: state.boards.map(b =>
          b.id === boardId ? { ...b, projectId } : b
        ),
        projects: state.projects.map(p => ({
          ...p,
          boardIds: p.id === projectId
            ? (p.boardIds.includes(boardId) ? p.boardIds : [...p.boardIds, boardId])
            : p.boardIds.filter(id => id !== boardId),
        })),
      };
    }

    case 'ADD_ITEM': {
      const { boardId, item } = action.payload;
      const items = state.boardItems[boardId] || [];
      return {
        ...state,
        boardItems: {
          ...state.boardItems,
          [boardId]: [...items, { ...item, createdAt: now, modifiedAt: now }],
        },
        boards: state.boards.map(b =>
          b.id === boardId ? { ...b, modifiedAt: now } : b
        ),
      };
    }

    case 'UPDATE_ITEM': {
      const { boardId, itemId, changes } = action.payload;
      return {
        ...state,
        boardItems: {
          ...state.boardItems,
          [boardId]: (state.boardItems[boardId] || []).map(item =>
            item.id === itemId ? { ...item, ...changes, modifiedAt: now } : item
          ),
        },
        boards: state.boards.map(b =>
          b.id === boardId ? { ...b, modifiedAt: now } : b
        ),
      };
    }

    case 'DELETE_ITEM': {
      const { boardId, itemId } = action.payload;
      return {
        ...state,
        boardItems: {
          ...state.boardItems,
          [boardId]: (state.boardItems[boardId] || []).filter(item => item.id !== itemId),
        },
        boards: state.boards.map(b =>
          b.id === boardId ? { ...b, modifiedAt: now } : b
        ),
      };
    }

    case 'MOVE_ITEM': {
      const { boardId, itemId, x, y } = action.payload;
      return {
        ...state,
        boardItems: {
          ...state.boardItems,
          [boardId]: (state.boardItems[boardId] || []).map(item =>
            item.id === itemId ? { ...item, x, y, modifiedAt: now } : item
          ),
        },
      };
    }

    case 'RESIZE_ITEM': {
      const { boardId, itemId, width, height } = action.payload;
      return {
        ...state,
        boardItems: {
          ...state.boardItems,
          [boardId]: (state.boardItems[boardId] || []).map(item =>
            item.id === itemId ? { ...item, width, height, modifiedAt: now } : item
          ),
        },
      };
    }

    case 'ADD_PROJECT': {
      const newProject = {
        id: action.payload.id || generateId(),
        name: action.payload.name || 'New project',
        teamId: 'team_1',
        boardIds: [],
        createdAt: now,
      };
      return {
        ...state,
        projects: [...state.projects, newProject],
      };
    }

    default:
      return state;
  }
}

// Actions that should be pushed onto the undo history
const UNDOABLE_ACTIONS = new Set([
  'ADD_ITEM', 'UPDATE_ITEM', 'DELETE_ITEM', 'MOVE_ITEM', 'RESIZE_ITEM',
  'ADD_BOARD', 'UPDATE_BOARD', 'DELETE_BOARD', 'STAR_BOARD', 'DUPLICATE_BOARD',
  'MOVE_BOARD_TO_PROJECT', 'ADD_PROJECT',
]);

export function AppProvider({ children }) {
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const [state, dispatch] = useReducer(appReducer, null);
  const [initialState, setInitialState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Undo/redo history stacks — each entry is a full state snapshot
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  // Track the last dispatched action type to decide whether to snapshot
  const lastActionRef = useRef(null);

  // Wrap dispatch to snapshot state before undoable actions
  const dispatchWithHistory = useCallback((action) => {
    if (UNDOABLE_ACTIONS.has(action.type)) {
      // Capture current state before the action is applied
      // We store the state in the callback so we read the most current value
      lastActionRef.current = action;
    }
    dispatch(action);
  }, []);

  // After state changes, push previous state onto undo stack if action was undoable
  const prevStateRef = useRef(null);
  useEffect(() => {
    if (state && lastActionRef.current) {
      const prev = prevStateRef.current;
      if (prev) {
        undoStack.current.push(prev);
        // Limit stack to 50 entries
        if (undoStack.current.length > 50) {
          undoStack.current.shift();
        }
        // Any new action clears the redo stack
        redoStack.current = [];
      }
      lastActionRef.current = null;
    }
    prevStateRef.current = state;
  }, [state]);

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop();
    // Push current state onto redo stack
    if (state) {
      redoStack.current.push(state);
    }
    dispatch({ type: 'SET_STATE', payload: prev });
    lastActionRef.current = null; // Don't re-snapshot for SET_STATE
  }, [state]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop();
    if (state) {
      undoStack.current.push(state);
    }
    dispatch({ type: 'SET_STATE', payload: next });
    lastActionRef.current = null;
  }, [state]);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;
    const ik = initialKey(sid);

    if (sid) {
      const isRefresh = localStorage.getItem(ik) !== null;
      if (isRefresh) {
        const loaded = initializeData(sid);
        setInitialState(getSavedInitialState(sid) || JSON.parse(JSON.stringify(loaded)));
        dispatch({ type: 'SET_STATE', payload: loaded });
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const loaded = initializeData(sid, customState);
          setInitialState(getSavedInitialState(sid) || JSON.parse(JSON.stringify(loaded)));
          dispatch({ type: 'SET_STATE', payload: loaded });
          setLoading(false);
        });
      }
    } else {
      const ik0 = initialKey(null);
      const isRefresh = localStorage.getItem(ik0) !== null;
      if (isRefresh) {
        const loaded = initializeData();
        setInitialState(getSavedInitialState() || JSON.parse(JSON.stringify(loaded)));
        dispatch({ type: 'SET_STATE', payload: loaded });
        setLoading(false);
      } else {
        const loaded = initializeData();
        setInitialState(JSON.parse(JSON.stringify(loaded)));
        dispatch({ type: 'SET_STATE', payload: loaded });
        setLoading(false);
      }
    }
  }, []);

  // Persist state
  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  if (loading || !state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#050038' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ state, dispatch: dispatchWithHistory, initialState, onUndo: handleUndo, onRedo: handleRedo }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
