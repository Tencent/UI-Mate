import React, { createContext, useContext, useReducer, useEffect, useState, useRef, useCallback } from 'react';
import { initialData, getSessionId, fetchCustomState, saveState, initializeData } from './initialData';
import { generateId } from '../utils/helpers';

const StoreContext = createContext();

const INITIAL_KEY_PREFIX = 'xotion-clone-initialState';
const MAX_UNDO = 50;

// Actions
const ACTIONS = {
  ADD_PAGE: 'ADD_PAGE',
  UPDATE_PAGE: 'UPDATE_PAGE',
  DELETE_PAGE: 'DELETE_PAGE',
  ADD_BLOCK: 'ADD_BLOCK',
  UPDATE_BLOCK: 'UPDATE_BLOCK',
  DELETE_BLOCK: 'DELETE_BLOCK',
  MOVE_BLOCK: 'MOVE_BLOCK',
  ADD_DB_ITEM: 'ADD_DB_ITEM',
  UPDATE_DB_ITEM: 'UPDATE_DB_ITEM',
  RESET_STATE: 'RESET_STATE',
  CLEAR_FOCUS: 'CLEAR_FOCUS',
  TRASH_PAGE: 'TRASH_PAGE',
  RESTORE_PAGE: 'RESTORE_PAGE',
  PERMANENT_DELETE: 'PERMANENT_DELETE',
  DUPLICATE_PAGE: 'DUPLICATE_PAGE',
  ADD_VIEW: 'ADD_VIEW',
  UPDATE_VIEW: 'UPDATE_VIEW',
  DELETE_VIEW: 'DELETE_VIEW',
  ADD_PROPERTY: 'ADD_PROPERTY',
  UPDATE_PROPERTY: 'UPDATE_PROPERTY',
  DELETE_PROPERTY: 'DELETE_PROPERTY',
  ADD_COMMENT: 'ADD_COMMENT',
  RESOLVE_COMMENT: 'RESOLVE_COMMENT',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UPDATE_WORKSPACE: 'UPDATE_WORKSPACE',
  REORDER_PAGES: 'REORDER_PAGES',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
};

function reducer(state, action) {
  let newState = { ...state };

  switch (action.type) {
    case ACTIONS.RESET_STATE: {
      return action.payload;
    }

    case ACTIONS.ADD_PAGE: {
      const { parentId, title = 'Untitled', id } = action.payload;
      const newPageId = id || generateId();
      const newPage = {
        id: newPageId,
        title,
        icon: null,
        cover: null,
        parentId: parentId || null,
        blockIds: [],
        createdDate: new Date().toISOString(),
        properties: {},
      };

      newState.pages[newPageId] = newPage;

      if (parentId && newState.pages[parentId]?.type === 'database') {
        newState.pages[parentId].items.push(newPageId);
      }

      // Add to pageOrder if root page
      if (!parentId && newState.pageOrder) {
        newState.pageOrder = [...newState.pageOrder, newPageId];
      }

      return newState;
    }

    case ACTIONS.UPDATE_PAGE: {
      const { pageId, updates } = action.payload;
      if (newState.pages[pageId]) {
        newState.pages[pageId] = { ...newState.pages[pageId], ...updates, lastEditedDate: new Date().toISOString() };
      }
      return newState;
    }

    case ACTIONS.DELETE_PAGE: {
      const { pageId } = action.payload;
      delete newState.pages[pageId];
      if (newState.pageOrder) {
        newState.pageOrder = newState.pageOrder.filter(id => id !== pageId);
      }
      return newState;
    }

    case ACTIONS.ADD_BLOCK: {
      const { pageId, type, content, afterBlockId } = action.payload;
      const newBlockId = generateId();
      const newBlock = {
        id: newBlockId,
        type,
        content: content || '',
        properties: {},
        createdDate: new Date().toISOString(),
      };

      newState.blocks[newBlockId] = newBlock;
      newState.focusBlockId = newBlockId;

      const page = newState.pages[pageId];
      if (page) {
        const blockIndex = afterBlockId ? page.blockIds.indexOf(afterBlockId) + 1 : page.blockIds.length;
        const newBlockIds = [...page.blockIds];
        newBlockIds.splice(blockIndex, 0, newBlockId);
        newState.pages[pageId] = { ...page, blockIds: newBlockIds };
      }
      return newState;
    }

    case ACTIONS.UPDATE_BLOCK: {
      const { blockId, updates } = action.payload;
      if (newState.blocks[blockId]) {
        newState.blocks[blockId] = { ...newState.blocks[blockId], ...updates };
      }
      return newState;
    }

    case ACTIONS.DELETE_BLOCK: {
      const { pageId, blockId } = action.payload;
      if (newState.pages[pageId]) {
        const blockIds = newState.pages[pageId].blockIds;
        const idx = blockIds.indexOf(blockId);
        if (idx > 0) {
          newState.focusBlockId = blockIds[idx - 1];
        } else if (blockIds.length > 1) {
          newState.focusBlockId = blockIds[1];
        }
        newState.pages[pageId].blockIds = blockIds.filter(id => id !== blockId);
      }
      delete newState.blocks[blockId];
      return newState;
    }

    case ACTIONS.MOVE_BLOCK: {
      const { pageId, activeId, overId } = action.payload;
      const page = newState.pages[pageId];
      if (!page) return state;

      const oldIndex = page.blockIds.indexOf(activeId);
      const newIndex = page.blockIds.indexOf(overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlockIds = [...page.blockIds];
        const [moved] = newBlockIds.splice(oldIndex, 1);
        newBlockIds.splice(newIndex, 0, moved);
        newState.pages[pageId] = { ...page, blockIds: newBlockIds };
      }
      return newState;
    }

    case ACTIONS.ADD_DB_ITEM: {
      const { pageId } = action.payload;
      const database = newState.pages[pageId];
      if (!database || database.type !== 'database') return state;

      const newItemId = generateId();
      const defaultProperties = {};
      database.properties.forEach(prop => {
        if (prop.type === 'select') {
          defaultProperties[prop.id] = '';
        } else if (prop.type === 'person') {
          defaultProperties[prop.id] = [];
        } else {
          defaultProperties[prop.id] = '';
        }
      });

      newState.pages[newItemId] = {
        id: newItemId,
        title: 'Untitled',
        icon: null,
        parentId: pageId,
        blockIds: [],
        properties: defaultProperties,
        createdDate: new Date().toISOString(),
      };
      newState.pages[pageId] = {
        ...database,
        items: [...database.items, newItemId],
      };
      return newState;
    }

    case ACTIONS.UPDATE_DB_ITEM: {
      const { pageId, itemId, propertyId, value } = action.payload;
      const item = newState.pages[itemId];
      if (!item) return state;

      newState.pages[itemId] = {
        ...item,
        properties: { ...item.properties, [propertyId]: value },
        lastEditedDate: new Date().toISOString(),
      };
      return newState;
    }

    case ACTIONS.CLEAR_FOCUS: {
      newState.focusBlockId = null;
      return newState;
    }

    case ACTIONS.TRASH_PAGE: {
      const { pageId } = action.payload;
      const page = newState.pages[pageId];
      if (!page) return state;

      if (!newState.trash) newState.trash = [];

      const pagesToTrash = [pageId];
      const collectChildren = (pid) => {
        Object.values(newState.pages).forEach(p => {
          if (p.parentId === pid && !pagesToTrash.includes(p.id)) {
            pagesToTrash.push(p.id);
            collectChildren(p.id);
          }
        });
      };
      collectChildren(pageId);

      pagesToTrash.forEach(pid => {
        const p = newState.pages[pid];
        if (p) {
          newState.trash.push({
            id: pid,
            page: JSON.parse(JSON.stringify(p)),
            deletedDate: new Date().toISOString(),
            parentId: p.parentId,
          });
          if (p.parentId && newState.pages[p.parentId]?.type === 'database') {
            newState.pages[p.parentId] = {
              ...newState.pages[p.parentId],
              items: newState.pages[p.parentId].items.filter(id => id !== pid),
            };
          }
          delete newState.pages[pid];
        }
      });

      if (newState.pageOrder) {
        newState.pageOrder = newState.pageOrder.filter(id => !pagesToTrash.includes(id));
      }

      return newState;
    }

    case ACTIONS.RESTORE_PAGE: {
      const { trashId } = action.payload;
      if (!newState.trash) return state;
      const trashIndex = newState.trash.findIndex(t => t.id === trashId);
      if (trashIndex === -1) return state;

      const trashItem = newState.trash[trashIndex];
      const restoredPage = { ...trashItem.page };

      if (restoredPage.parentId && !newState.pages[restoredPage.parentId]) {
        restoredPage.parentId = null;
      }

      newState.pages[restoredPage.id] = restoredPage;

      if (restoredPage.parentId && newState.pages[restoredPage.parentId]?.type === 'database') {
        newState.pages[restoredPage.parentId] = {
          ...newState.pages[restoredPage.parentId],
          items: [...newState.pages[restoredPage.parentId].items, restoredPage.id],
        };
      }

      const childTrashItems = newState.trash.filter(t => t.parentId === restoredPage.id && t.id !== trashId);
      childTrashItems.forEach(ct => {
        newState.pages[ct.page.id] = { ...ct.page };
      });

      const restoredIds = new Set([trashId, ...childTrashItems.map(ct => ct.id)]);
      newState.trash = newState.trash.filter(t => !restoredIds.has(t.id));

      // Re-add to pageOrder if root
      if (!restoredPage.parentId && newState.pageOrder && !newState.pageOrder.includes(restoredPage.id)) {
        newState.pageOrder = [...newState.pageOrder, restoredPage.id];
      }

      return newState;
    }

    case ACTIONS.PERMANENT_DELETE: {
      const { trashId } = action.payload;
      if (!newState.trash) return state;
      const trashIndex = newState.trash.findIndex(t => t.id === trashId);
      if (trashIndex === -1) return state;

      const trashItem = newState.trash[trashIndex];
      if (trashItem.page.blockIds) {
        trashItem.page.blockIds.forEach(bid => {
          delete newState.blocks[bid];
        });
      }

      newState.trash = newState.trash.filter(t => t.id !== trashId);
      return newState;
    }

    case ACTIONS.DUPLICATE_PAGE: {
      const { pageId } = action.payload;
      const originalPage = newState.pages[pageId];
      if (!originalPage) return state;

      const newPageId = generateId();
      const newBlockIds = [];
      if (originalPage.blockIds) {
        originalPage.blockIds.forEach(bid => {
          const block = newState.blocks[bid];
          if (block) {
            const newBlockId = generateId();
            newState.blocks[newBlockId] = {
              ...JSON.parse(JSON.stringify(block)),
              id: newBlockId,
              createdDate: new Date().toISOString(),
            };
            newBlockIds.push(newBlockId);
          }
        });
      }

      const newPage = {
        ...JSON.parse(JSON.stringify(originalPage)),
        id: newPageId,
        title: `${originalPage.title || 'Untitled'} (copy)`,
        blockIds: newBlockIds,
        createdDate: new Date().toISOString(),
        lastEditedDate: new Date().toISOString(),
      };

      if (originalPage.type === 'database' && originalPage.items) {
        const newItems = [];
        originalPage.items.forEach(itemId => {
          const item = newState.pages[itemId];
          if (item) {
            const newItemId = generateId();
            const itemBlockIds = [];
            if (item.blockIds) {
              item.blockIds.forEach(bid => {
                const block = newState.blocks[bid];
                if (block) {
                  const nbid = generateId();
                  newState.blocks[nbid] = { ...JSON.parse(JSON.stringify(block)), id: nbid };
                  itemBlockIds.push(nbid);
                }
              });
            }
            newState.pages[newItemId] = {
              ...JSON.parse(JSON.stringify(item)),
              id: newItemId,
              parentId: newPageId,
              blockIds: itemBlockIds,
            };
            newItems.push(newItemId);
          }
        });
        newPage.items = newItems;
      }

      newState.pages[newPageId] = newPage;
      return newState;
    }

    case ACTIONS.ADD_VIEW: {
      const { dbId, view } = action.payload;
      const db = newState.pages[dbId];
      if (!db || db.type !== 'database') return state;
      const views = db.views ? [...db.views] : [];
      views.push(view);
      newState.pages[dbId] = { ...db, views };
      return newState;
    }

    case ACTIONS.UPDATE_VIEW: {
      const { dbId, viewId, updates } = action.payload;
      const db = newState.pages[dbId];
      if (!db || !db.views) return state;
      newState.pages[dbId] = {
        ...db,
        views: db.views.map(v => v.id === viewId ? { ...v, ...updates } : v),
      };
      return newState;
    }

    case ACTIONS.DELETE_VIEW: {
      const { dbId, viewId } = action.payload;
      const db = newState.pages[dbId];
      if (!db || !db.views) return state;
      newState.pages[dbId] = {
        ...db,
        views: db.views.filter(v => v.id !== viewId),
      };
      return newState;
    }

    case ACTIONS.ADD_PROPERTY: {
      const { dbId, property } = action.payload;
      const db = newState.pages[dbId];
      if (!db || db.type !== 'database') return state;
      newState.pages[dbId] = {
        ...db,
        properties: [...db.properties, property],
      };
      db.items.forEach(itemId => {
        const item = newState.pages[itemId];
        if (item) {
          const defaultVal = property.type === 'person' ? [] : property.type === 'multi-select' ? [] : property.type === 'checkbox' ? false : '';
          newState.pages[itemId] = {
            ...item,
            properties: { ...item.properties, [property.id]: defaultVal },
          };
        }
      });
      return newState;
    }

    case ACTIONS.UPDATE_PROPERTY: {
      const { dbId, propertyId, updates } = action.payload;
      const db = newState.pages[dbId];
      if (!db || db.type !== 'database') return state;
      newState.pages[dbId] = {
        ...db,
        properties: db.properties.map(p => p.id === propertyId ? { ...p, ...updates } : p),
      };
      return newState;
    }

    case ACTIONS.DELETE_PROPERTY: {
      const { dbId, propertyId } = action.payload;
      const db = newState.pages[dbId];
      if (!db || db.type !== 'database') return state;
      newState.pages[dbId] = {
        ...db,
        properties: db.properties.filter(p => p.id !== propertyId),
      };
      db.items.forEach(itemId => {
        const item = newState.pages[itemId];
        if (item && item.properties) {
          const newProps = { ...item.properties };
          delete newProps[propertyId];
          newState.pages[itemId] = { ...item, properties: newProps };
        }
      });
      return newState;
    }

    case ACTIONS.ADD_COMMENT: {
      const { comment } = action.payload;
      if (!newState.comments) newState.comments = {};
      newState.comments[comment.id] = comment;
      return newState;
    }

    case ACTIONS.RESOLVE_COMMENT: {
      const { commentId } = action.payload;
      if (newState.comments && newState.comments[commentId]) {
        newState.comments[commentId] = { ...newState.comments[commentId], resolved: !newState.comments[commentId].resolved };
      }
      return newState;
    }

    case ACTIONS.UPDATE_SETTINGS: {
      const { updates } = action.payload;
      newState.settings = { ...(newState.settings || {}), ...updates };
      return newState;
    }

    case ACTIONS.UPDATE_WORKSPACE: {
      const { updates } = action.payload;
      newState.workspace = { ...newState.workspace, ...updates };
      return newState;
    }

    case ACTIONS.REORDER_PAGES: {
      const { pageOrder } = action.payload;
      newState.pageOrder = pageOrder;
      return newState;
    }

    case ACTIONS.MARK_NOTIFICATION_READ: {
      const { notificationId } = action.payload;
      if (newState.notifications) {
        newState.notifications = newState.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        );
      }
      return newState;
    }

    default:
      return state;
  }
}

// Skip undo tracking for these actions
const SKIP_UNDO_ACTIONS = new Set(['RESET_STATE', 'CLEAR_FOCUS']);

export const StoreProvider = ({ children }) => {
  const [state, rawDispatch] = useReducer(reducer, initialData);
  const [initialStateRef, setInitialStateRef] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  // Undo/Redo stacks
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  const dispatch = useCallback((action) => {
    if (!SKIP_UNDO_ACTIONS.has(action.type)) {
      // Push current state to undo stack before mutation
      undoStack.current = [...undoStack.current.slice(-(MAX_UNDO - 1)), state];
      redoStack.current = [];
    }
    rawDispatch(action);
  }, [state]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    redoStack.current = [...redoStack.current, state];
    rawDispatch({ type: 'RESET_STATE', payload: prev });
  }, [state]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current[redoStack.current.length - 1];
    redoStack.current = redoStack.current.slice(0, -1);
    undoStack.current = [...undoStack.current, state];
    rawDispatch({ type: 'RESET_STATE', payload: next });
  }, [state]);

  // Session-aware initialization
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;
    if (sid) {
      const sessionKey = `${INITIAL_KEY_PREFIX}_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;
      if (isRefresh) {
        const data = initializeData(sid);
        rawDispatch({ type: 'RESET_STATE', payload: data });
        setInitialStateRef(JSON.parse(localStorage.getItem(sessionKey)));
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          rawDispatch({ type: 'RESET_STATE', payload: data });
          setInitialStateRef(JSON.parse(JSON.stringify(data)));
          setLoading(false);
        });
      }
    } else {
      fetchCustomState().then(customState => {
        if (customState) {
          const data = initializeData(null, customState);
          rawDispatch({ type: 'RESET_STATE', payload: data });
          setInitialStateRef(JSON.parse(JSON.stringify(data)));
        } else {
          const data = initializeData();
          rawDispatch({ type: 'RESET_STATE', payload: data });
          setInitialStateRef(JSON.parse(JSON.stringify(data)));
        }
        setLoading(false);
      });
    }
  }, []);

  // Save state on changes (session-aware)
  useEffect(() => {
    if (loading) return;
    // Apply stored appearance/font-size settings to DOM
    const settings = state.settings || {};
    if (settings.appearance === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.appearance === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (settings.fontSize && settings.fontSize !== 'default') {
      document.documentElement.classList.remove('font-small', 'font-default', 'font-large');
      document.documentElement.classList.add(`font-${settings.fontSize}`);
    }
  }, [loading]);

  // Persist state on changes (session-aware)
  useEffect(() => {
    if (loading) return;
    saveState(state, sidRef.current);
  }, [state, loading]);

  const addPage = (parentId, title = 'Untitled') => {
    const id = generateId();
    dispatch({ type: ACTIONS.ADD_PAGE, payload: { parentId, title, id } });
    return id;
  };
  const updatePage = (pageId, updates) => dispatch({ type: ACTIONS.UPDATE_PAGE, payload: { pageId, updates } });
  const deletePage = (pageId) => dispatch({ type: ACTIONS.DELETE_PAGE, payload: { pageId } });

  const addBlock = (pageId, type, content, afterBlockId) => dispatch({ type: ACTIONS.ADD_BLOCK, payload: { pageId, type, content, afterBlockId } });
  const updateBlock = (blockId, updates) => dispatch({ type: ACTIONS.UPDATE_BLOCK, payload: { blockId, updates } });
  const deleteBlock = (pageId, blockId) => dispatch({ type: ACTIONS.DELETE_BLOCK, payload: { pageId, blockId } });
  const moveBlock = (pageId, activeId, overId) => dispatch({ type: ACTIONS.MOVE_BLOCK, payload: { pageId, activeId, overId } });
  const clearFocus = () => rawDispatch({ type: ACTIONS.CLEAR_FOCUS });
  const addDbItem = (pageId) => dispatch({ type: ACTIONS.ADD_DB_ITEM, payload: { pageId } });
  const updateDbItem = (pageId, itemId, propertyId, value) => dispatch({ type: ACTIONS.UPDATE_DB_ITEM, payload: { pageId, itemId, propertyId, value } });
  const trashPage = (pageId) => dispatch({ type: ACTIONS.TRASH_PAGE, payload: { pageId } });
  const restorePage = (trashId) => dispatch({ type: ACTIONS.RESTORE_PAGE, payload: { trashId } });
  const permanentDelete = (trashId) => dispatch({ type: ACTIONS.PERMANENT_DELETE, payload: { trashId } });
  const duplicatePage = (pageId) => dispatch({ type: ACTIONS.DUPLICATE_PAGE, payload: { pageId } });
  const addView = (dbId, view) => dispatch({ type: ACTIONS.ADD_VIEW, payload: { dbId, view } });
  const updateView = (dbId, viewId, updates) => dispatch({ type: ACTIONS.UPDATE_VIEW, payload: { dbId, viewId, updates } });
  const deleteView = (dbId, viewId) => dispatch({ type: ACTIONS.DELETE_VIEW, payload: { dbId, viewId } });
  const addProperty = (dbId, property) => dispatch({ type: ACTIONS.ADD_PROPERTY, payload: { dbId, property } });
  const updateProperty = (dbId, propertyId, updates) => dispatch({ type: ACTIONS.UPDATE_PROPERTY, payload: { dbId, propertyId, updates } });
  const deleteProperty = (dbId, propertyId) => dispatch({ type: ACTIONS.DELETE_PROPERTY, payload: { dbId, propertyId } });
  const addComment = (comment) => dispatch({ type: ACTIONS.ADD_COMMENT, payload: { comment } });
  const resolveComment = (commentId) => dispatch({ type: ACTIONS.RESOLVE_COMMENT, payload: { commentId } });
  const updateSettings = (updates) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: { updates } });
  const updateWorkspace = (updates) => dispatch({ type: ACTIONS.UPDATE_WORKSPACE, payload: { updates } });
  const reorderPages = (pageOrder) => dispatch({ type: ACTIONS.REORDER_PAGES, payload: { pageOrder } });
  const markNotificationRead = (notificationId) => dispatch({ type: ACTIONS.MARK_NOTIFICATION_READ, payload: { notificationId } });

  return (
    <StoreContext.Provider value={{
      state,
      initialState: initialStateRef,
      loading,
      dispatch,
      addPage,
      updatePage,
      deletePage,
      addBlock,
      updateBlock,
      deleteBlock,
      moveBlock,
      clearFocus,
      addDbItem,
      updateDbItem,
      trashPage,
      restorePage,
      permanentDelete,
      duplicatePage,
      addView,
      updateView,
      deleteView,
      addProperty,
      updateProperty,
      deleteProperty,
      addComment,
      resolveComment,
      updateSettings,
      updateWorkspace,
      reorderPages,
      markNotificationRead,
      undo,
      redo,
      canUndo: undoStack.current.length > 0,
      canRedo: redoStack.current.length > 0,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
