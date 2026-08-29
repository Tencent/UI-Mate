import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { createInitialData, initializeData, saveState, getInitialState, getSessionId, fetchCustomState, initialKey } from '../utils/dataManager';

const AppContext = createContext(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'UPDATE_COLUMN_VALUE': {
      const { itemId, columnId, newValue } = action.payload;
      const prevItem = state.items[itemId];
      const previousValue = prevItem?.columnValues?.[columnId] || null;
      const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newActivity = {
        id: activityId,
        boardId: prevItem?.boardId || '',
        itemId,
        userId: state.currentUserId,
        columnId,
        action: 'column_change',
        previousValue,
        newValue: { value: newValue },
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: {
            ...prevItem,
            columnValues: {
              ...prevItem.columnValues,
              [columnId]: { value: newValue },
            },
            updatedAt: new Date().toISOString(),
          },
        },
        activityLog: [...(state.activityLog || []), newActivity],
      };
    }

    case 'UPDATE_ITEM_NAME': {
      const { itemId, name } = action.payload;
      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: { ...state.items[itemId], name, updatedAt: new Date().toISOString() },
        },
      };
    }

    case 'CREATE_ITEM': {
      const { groupId, name, boardId } = action.payload;
      const newId = generateId('item');
      const group = state.groups[groupId];
      return {
        ...state,
        items: {
          ...state.items,
          [newId]: {
            id: newId,
            boardId: boardId || group.boardId,
            groupId,
            name: name || '',
            columnValues: {},
            subitemIds: [],
            isSelected: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            creatorId: state.currentUserId,
          },
        },
        groups: {
          ...state.groups,
          [groupId]: {
            ...group,
            itemIds: [...group.itemIds, newId],
          },
        },
      };
    }

    case 'DELETE_ITEM': {
      const { itemId } = action.payload;
      const item = state.items[itemId];
      if (!item) return state;
      const group = state.groups[item.groupId];
      const newItems = { ...state.items };
      delete newItems[itemId];
      return {
        ...state,
        items: newItems,
        groups: {
          ...state.groups,
          [item.groupId]: {
            ...group,
            itemIds: group.itemIds.filter(id => id !== itemId),
          },
        },
      };
    }

    case 'ARCHIVE_ITEM': {
      const { itemId } = action.payload;
      const item = state.items[itemId];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: {
            ...item,
            archivedAt: item.archivedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        ui: {
          ...state.ui,
          itemDetailOpenId: state.ui.itemDetailOpenId === itemId ? null : state.ui.itemDetailOpenId,
        },
      };
    }

    case 'RESTORE_ITEM': {
      const { itemId } = action.payload;
      const item = state.items[itemId];
      if (!item) return state;
      const { archivedAt, ...restoredItem } = item;
      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: {
            ...restoredItem,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'MOVE_ITEM_TO_GROUP': {
      const { itemId, targetGroupId } = action.payload;
      const item = state.items[itemId];
      if (!item) return state;
      const oldGroup = state.groups[item.groupId];
      const newGroup = state.groups[targetGroupId];
      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: { ...item, groupId: targetGroupId },
        },
        groups: {
          ...state.groups,
          [item.groupId]: { ...oldGroup, itemIds: oldGroup.itemIds.filter(id => id !== itemId) },
          [targetGroupId]: { ...newGroup, itemIds: [...newGroup.itemIds, itemId] },
        },
      };
    }

    case 'TOGGLE_GROUP_COLLAPSE': {
      const { groupId } = action.payload;
      const group = state.groups[groupId];
      return {
        ...state,
        groups: {
          ...state.groups,
          [groupId]: { ...group, isCollapsed: !group.isCollapsed },
        },
      };
    }

    case 'UPDATE_GROUP_TITLE': {
      const { groupId, title } = action.payload;
      return {
        ...state,
        groups: {
          ...state.groups,
          [groupId]: { ...state.groups[groupId], title },
        },
      };
    }

    case 'CREATE_GROUP': {
      const { boardId, title, color } = action.payload;
      const newId = generateId('group');
      const board = state.boards[boardId];
      return {
        ...state,
        groups: {
          ...state.groups,
          [newId]: {
            id: newId,
            boardId,
            title: title || 'New Group',
            color: color || '#579BFC',
            isCollapsed: false,
            itemIds: [],
            position: board.groupIds.length,
          },
        },
        boards: {
          ...state.boards,
          [boardId]: { ...board, groupIds: [...board.groupIds, newId] },
        },
      };
    }

    case 'CREATE_BOARD': {
      const { boardId, groupId, tableViewId, kanbanViewId, workspaceId, name } = action.payload;
      const targetWorkspaceId = workspaceId || state.activeWorkspaceId;
      const workspace = state.workspaces[targetWorkspaceId];
      const now = new Date().toISOString();
      const newBoard = {
        id: boardId,
        name: name || 'New Board',
        description: '',
        workspaceId: targetWorkspaceId,
        type: 'board',
        isFavorite: false,
        groupIds: [groupId],
        columnIds: ['col-person-1', 'col-status-1', 'col-priority-1', 'col-date-1'],
        views: [
          { id: tableViewId, type: 'table', name: 'Table', isDefault: true },
          { id: kanbanViewId, type: 'kanban', name: 'Kanban', statusColumnId: 'col-status-1' },
        ],
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...state,
        workspaces: {
          ...state.workspaces,
          [targetWorkspaceId]: {
            ...workspace,
            boardIds: [...(workspace?.boardIds || []), boardId],
          },
        },
        boards: {
          ...state.boards,
          [boardId]: newBoard,
        },
        groups: {
          ...state.groups,
          [groupId]: {
            id: groupId,
            boardId,
            title: 'New Group',
            color: '#579BFC',
            isCollapsed: false,
            itemIds: [],
            position: 0,
          },
        },
        ui: {
          ...state.ui,
          activeBoardId: boardId,
          activeViewId: tableViewId,
          itemDetailOpenId: null,
        },
      };
    }

    case 'ADD_BOARD_VIEW': {
      const { boardId, viewId, viewType } = action.payload;
      const board = state.boards[boardId];
      if (!board) return state;
      const viewName = viewType === 'kanban' ? 'Kanban' : 'Table';
      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: {
            ...board,
            views: [
              ...board.views,
              {
                id: viewId,
                type: viewType,
                name: `${viewName} ${board.views.filter(view => view.type === viewType).length + 1}`,
                isDefault: false,
                ...(viewType === 'kanban' ? { statusColumnId: board.columnIds.find(id => state.columns[id]?.type === 'status') } : {}),
              },
            ],
            updatedAt: new Date().toISOString(),
          },
        },
        ui: { ...state.ui, activeViewId: viewId },
      };
    }

    case 'TOGGLE_FAVORITE': {
      const { boardId } = action.payload;
      const board = state.boards[boardId];
      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: { ...board, isFavorite: !board.isFavorite },
        },
      };
    }

    case 'SET_ACTIVE_BOARD': {
      const { boardId } = action.payload;
      const board = state.boards[boardId];
      const defaultView = board?.views?.find(v => v.isDefault) || board?.views?.[0];
      return {
        ...state,
        ui: {
          ...state.ui,
          activeBoardId: boardId,
          activeViewId: defaultView?.id || null,
          searchQuery: '',
          filterConditions: [],
          sortConditions: [],
        },
      };
    }

    case 'SET_ACTIVE_VIEW': {
      const { viewId } = action.payload;
      return {
        ...state,
        ui: { ...state.ui, activeViewId: viewId },
      };
    }

    case 'SET_SEARCH_QUERY': {
      return {
        ...state,
        ui: { ...state.ui, searchQuery: action.payload },
      };
    }

    case 'TOGGLE_SIDEBAR': {
      return {
        ...state,
        ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
      };
    }

    case 'TOGGLE_ITEM_SELECTED': {
      const { itemId } = action.payload;
      const item = state.items[itemId];
      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: { ...item, isSelected: !item.isSelected },
        },
      };
    }

    case 'TOGGLE_GROUP_ITEMS_SELECTED': {
      const { groupId, selected } = action.payload;
      const group = state.groups[groupId];
      if (!group) return state;
      const nextItems = { ...state.items };
      group.itemIds.forEach(itemId => {
        if (nextItems[itemId] && !nextItems[itemId].archivedAt) {
          nextItems[itemId] = { ...nextItems[itemId], isSelected: selected };
        }
      });
      return { ...state, items: nextItems };
    }

    case 'UPDATE_BOARD_NAME': {
      const { boardId, name } = action.payload;
      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: { ...state.boards[boardId], name },
        },
      };
    }

    case 'UPDATE_BOARD_DESCRIPTION': {
      const { boardId, description } = action.payload;
      return {
        ...state,
        boards: {
          ...state.boards,
          [boardId]: { ...state.boards[boardId], description },
        },
      };
    }

    case 'SET_ITEM_DETAIL': {
      return {
        ...state,
        ui: { ...state.ui, itemDetailOpenId: action.payload },
      };
    }

    case 'ADD_UPDATE': {
      const update = action.payload;
      return {
        ...state,
        updates: {
          ...state.updates,
          [update.id]: update,
        },
      };
    }

    case 'ADD_ITEM_FILE': {
      const { itemId, file } = action.payload;
      const item = state.items[itemId];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: {
            ...item,
            files: [...(item.files || []), file],
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case 'SET_SORT_CONDITIONS': {
      return {
        ...state,
        ui: { ...state.ui, sortConditions: action.payload },
      };
    }

    case 'SET_FILTER_CONDITIONS': {
      return {
        ...state,
        ui: { ...state.ui, filterConditions: action.payload },
      };
    }

    case 'TOGGLE_COLUMN_HIDDEN': {
      const { boardId, columnId } = action.payload;
      const hiddenByBoard = state.ui.hiddenColumnsByBoard || {};
      const hiddenColumns = new Set(hiddenByBoard[boardId] || []);
      if (hiddenColumns.has(columnId)) {
        hiddenColumns.delete(columnId);
      } else {
        hiddenColumns.add(columnId);
      }
      return {
        ...state,
        ui: {
          ...state.ui,
          hiddenColumnsByBoard: {
            ...hiddenByBoard,
            [boardId]: Array.from(hiddenColumns),
          },
        },
      };
    }

    case 'DUPLICATE_ITEM': {
      const { itemId } = action.payload;
      const srcItem = state.items[itemId];
      if (!srcItem) return state;
      const newId = generateId('item');
      const group = state.groups[srcItem.groupId];
      return {
        ...state,
        items: {
          ...state.items,
          [newId]: {
            ...srcItem,
            id: newId,
            name: `${srcItem.name} (copy)`,
            isSelected: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        groups: {
          ...state.groups,
          [srcItem.groupId]: {
            ...group,
            itemIds: [...group.itemIds, newId],
          },
        },
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const isRefresh = localStorage.getItem(initialKey(sid)) !== null;
      if (isRefresh) {
        const data = initializeData(sid);
        dispatch({ type: 'SET_STATE', payload: data });
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          dispatch({ type: 'SET_STATE', payload: data });
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      dispatch({ type: 'SET_STATE', payload: data });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (state) {
      saveState(state, sidRef.current);
    }
  }, [state]);

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: '"Figtree", sans-serif', color: '#676879' }}>
        Loading...
      </div>
    );
  }

  const value = {
    state,
    dispatch,
    sid: sidRef.current,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
