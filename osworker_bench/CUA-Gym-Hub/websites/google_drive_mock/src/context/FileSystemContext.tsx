import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { AppState, FileSystemItem, FileType, UploadItem, SharedUser } from '../lib/types';
import { INITIAL_STATE, initializeData, getInitialState, fetchCustomState, getSessionId, saveState } from '../lib/mockData';
import { v4 as uuidv4 } from 'uuid';

// Action Types
type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'CREATE_FOLDER'; payload: { name: string; parentId: string | null } }
  | { type: 'CREATE_FILE'; payload: { name: string; fileType: FileType; mimeType: string; parentId: string | null } }
  | { type: 'UPLOAD_FILE_START'; payload: { id: string; name: string } }
  | { type: 'UPLOAD_FILE_PROGRESS'; payload: { id: string; progress: number } }
  | { type: 'UPLOAD_FILE_COMPLETE'; payload: { id: string; file: FileSystemItem } }
  | { type: 'DELETE_ITEM'; payload: { id: string } }
  | { type: 'RESTORE_ITEM'; payload: { id: string } }
  | { type: 'PERMANENT_DELETE'; payload: { id: string } }
  | { type: 'EMPTY_TRASH' }
  | { type: 'TOGGLE_STAR'; payload: { id: string } }
  | { type: 'RENAME_ITEM'; payload: { id: string; name: string } }
  | { type: 'SORT_ITEMS'; payload: { key: 'name' | 'modifiedAt' | 'size' | 'type' } }
  | { type: 'ACCESS_ITEM'; payload: { id: string } }
  | { type: 'SHARE_ITEM'; payload: { id: string; users: SharedUser[] } }
  | { type: 'MOVE_ITEM'; payload: { id: string; newParentId: string | null } }
  | { type: 'SET_FOLDER_COLOR'; payload: { id: string; color: string | null } }
  | { type: 'COPY_ITEM'; payload: { id: string } }
  | { type: 'SELECT_ITEM'; payload: { id: string; additive?: boolean } }
  | { type: 'DESELECT_ITEM'; payload: { id: string } }
  | { type: 'SELECT_ALL'; payload: { ids: string[] } }
  | { type: 'CLEAR_SELECTION' };

const FileSystemContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getFolderContents: (folderId: string | null) => FileSystemItem[];
  getStarredItems: () => FileSystemItem[];
  getRecentItems: () => FileSystemItem[];
  getTrashedItems: () => FileSystemItem[];
  getSharedWithMeItems: () => FileSystemItem[];
  searchItems: (query: string) => FileSystemItem[];
  getPath: (folderId: string | null) => FileSystemItem[];
  initialState: AppState;
  uploadFile: (file: File, parentId: string | null) => void;
  loading: boolean;
} | null>(null);

const reducer = (state: AppState, action: Action): AppState => {
  const now = Date.now();
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'CREATE_FOLDER': {
      const newFolder: FileSystemItem = {
        id: uuidv4(),
        parentId: action.payload.parentId,
        name: action.payload.name,
        type: 'folder',
        mimeType: 'application/vnd.google-apps.folder',
        size: 0,
        ownerId: state.currentUser.id,
        sharedWith: [],
        starred: false,
        trashed: false,
        color: null,
        createdAt: now,
        modifiedAt: now,
        accessedAt: now,
        description: ''
      };
      return { ...state, items: { ...state.items, [newFolder.id]: newFolder } };
    }

    case 'CREATE_FILE': {
      const newFile: FileSystemItem = {
        id: uuidv4(),
        parentId: action.payload.parentId,
        name: action.payload.name,
        type: action.payload.fileType,
        mimeType: action.payload.mimeType,
        size: 0,
        ownerId: state.currentUser.id,
        sharedWith: [],
        starred: false,
        trashed: false,
        color: null,
        createdAt: now,
        modifiedAt: now,
        accessedAt: now,
        description: ''
      };
      return { ...state, items: { ...state.items, [newFile.id]: newFile } };
    }

    case 'UPLOAD_FILE_START': {
      const newItem: UploadItem = {
        id: action.payload.id,
        name: action.payload.name,
        progress: 0,
        status: 'uploading'
      };
      return { ...state, uploadQueue: [...state.uploadQueue, newItem] };
    }

    case 'UPLOAD_FILE_PROGRESS': {
      return {
        ...state,
        uploadQueue: state.uploadQueue.map(item =>
          item.id === action.payload.id ? { ...item, progress: action.payload.progress } : item
        )
      };
    }

    case 'UPLOAD_FILE_COMPLETE': {
      const completedQueue = state.uploadQueue.map(item =>
        item.id === action.payload.id ? { ...item, progress: 100, status: 'completed' as const } : item
      );

      return {
        ...state,
        items: { ...state.items, [action.payload.file.id]: action.payload.file },
        uploadQueue: completedQueue
      };
    }

    case 'DELETE_ITEM': {
      const item = state.items[action.payload.id];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: { ...item, trashed: true, modifiedAt: now }
        },
        selectedItems: state.selectedItems.filter(id => id !== action.payload.id)
      };
    }

    case 'RESTORE_ITEM': {
      const item = state.items[action.payload.id];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: { ...item, trashed: false, modifiedAt: now }
        }
      };
    }

    case 'PERMANENT_DELETE': {
      const newItems = { ...state.items };
      delete newItems[action.payload.id];
      return { ...state, items: newItems };
    }

    case 'EMPTY_TRASH': {
      const newItems = { ...state.items };
      Object.keys(newItems).forEach(id => {
        if (newItems[id].trashed) {
          delete newItems[id];
        }
      });
      return { ...state, items: newItems };
    }

    case 'TOGGLE_STAR': {
      const item = state.items[action.payload.id];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: { ...item, starred: !item.starred, modifiedAt: now }
        }
      };
    }

    case 'RENAME_ITEM': {
      const item = state.items[action.payload.id];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: { ...item, name: action.payload.name, modifiedAt: now }
        }
      };
    }

    case 'ACCESS_ITEM': {
      const item = state.items[action.payload.id];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: { ...item, accessedAt: now }
        }
      };
    }

    case 'SORT_ITEMS': {
      const { key } = action.payload;
      const direction = state.sortConfig.key === key && state.sortConfig.direction === 'asc' ? 'desc' : 'asc';
      return {
        ...state,
        sortConfig: { key, direction }
      };
    }

    case 'SHARE_ITEM': {
      const item = state.items[action.payload.id];
      if (!item) return state;
      const existingUserIds = item.sharedWith.map(u => u.userId);
      const newShared = action.payload.users.filter(u => !existingUserIds.includes(u.userId));
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: {
            ...item,
            sharedWith: [...item.sharedWith, ...newShared],
            modifiedAt: now
          }
        }
      };
    }

    case 'MOVE_ITEM': {
      const item = state.items[action.payload.id];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: { ...item, parentId: action.payload.newParentId, modifiedAt: now }
        }
      };
    }

    case 'SET_FOLDER_COLOR': {
      const item = state.items[action.payload.id];
      if (!item) return state;
      return {
        ...state,
        items: {
          ...state.items,
          [action.payload.id]: { ...item, color: action.payload.color }
        }
      };
    }

    case 'COPY_ITEM': {
      const item = state.items[action.payload.id];
      if (!item) return state;
      const copy: FileSystemItem = {
        ...item,
        id: uuidv4(),
        name: `Copy of ${item.name}`,
        sharedWith: [],
        starred: false,
        createdAt: now,
        modifiedAt: now,
        accessedAt: now
      };
      return { ...state, items: { ...state.items, [copy.id]: copy } };
    }

    case 'SELECT_ITEM': {
      if (action.payload.additive) {
        if (state.selectedItems.includes(action.payload.id)) {
          return { ...state, selectedItems: state.selectedItems.filter(id => id !== action.payload.id) };
        }
        return { ...state, selectedItems: [...state.selectedItems, action.payload.id] };
      }
      if (state.selectedItems.length === 1 && state.selectedItems[0] === action.payload.id) {
        return { ...state, selectedItems: [] };
      }
      return { ...state, selectedItems: [action.payload.id] };
    }

    case 'DESELECT_ITEM': {
      return { ...state, selectedItems: state.selectedItems.filter(id => id !== action.payload.id) };
    }

    case 'SELECT_ALL': {
      return { ...state, selectedItems: action.payload.ids };
    }

    case 'CLEAR_SELECTION': {
      return { ...state, selectedItems: [] };
    }

    default:
      return state;
  }
};

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const baselineSynced = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `mock_drive_initialState_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

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

  // Persist state changes
  useEffect(() => {
    if (!loading && state) {
      if (!baselineSynced.current) {
        baselineSynced.current = true;
        const sid = sidRef.current;
        const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set', state, merge: false })
        }).catch(() => {});
        return;
      }
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const uploadFile = (file: File, parentId: string | null) => {
    const uploadId = uuidv4();
    dispatch({ type: 'UPLOAD_FILE_START', payload: { id: uploadId, name: file.name } });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      dispatch({ type: 'UPLOAD_FILE_PROGRESS', payload: { id: uploadId, progress } });

      if (progress >= 100) {
        clearInterval(interval);

        const isImage = file.type.startsWith('image/');
        const reader = new FileReader();

        const getFileType = (f: File): FileType => {
          if (f.type.startsWith('image/')) return 'image';
          if (f.type.startsWith('video/')) return 'video';
          if (f.type.startsWith('audio/')) return 'audio';
          if (f.type === 'application/pdf') return 'pdf';
          if (f.type === 'text/plain') return 'text';
          if (f.type.includes('zip') || f.type.includes('archive')) return 'archive';
          return 'unknown';
        };

        reader.onload = () => {
          const newFile: FileSystemItem = {
            id: uuidv4(),
            parentId: parentId,
            name: file.name,
            type: getFileType(file),
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            ownerId: state.currentUser.id,
            sharedWith: [],
            starred: false,
            trashed: false,
            color: null,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            accessedAt: Date.now(),
            description: '',
            thumbnailUrl: isImage ? reader.result as string : null
          };

          dispatch({ type: 'UPLOAD_FILE_COMPLETE', payload: { id: uploadId, file: newFile } });
        };

        if (isImage) {
          reader.readAsDataURL(file);
        } else {
          reader.onload!({} as any);
        }
      }
    }, 200);
  };

  const getFolderContents = (folderId: string | null) => {
    return Object.values(state.items).filter(
      item => item.parentId === folderId && !item.trashed && item.ownerId === state.currentUser.id
    );
  };

  const getStarredItems = () => {
    return Object.values(state.items).filter(item => item.starred && !item.trashed);
  };

  const getRecentItems = () => {
    return Object.values(state.items)
      .filter(item => !item.trashed && item.type !== 'folder')
      .sort((a, b) => b.accessedAt - a.accessedAt)
      .slice(0, 20);
  };

  const getTrashedItems = () => {
    return Object.values(state.items).filter(item => item.trashed);
  };

  const getSharedWithMeItems = () => {
    return Object.values(state.items).filter(
      item => item.ownerId !== state.currentUser.id &&
        item.sharedWith.some(s => s.userId === state.currentUser.id) &&
        !item.trashed
    );
  };

  const searchItems = (query: string) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return Object.values(state.items).filter(
      item => !item.trashed && item.name.toLowerCase().includes(lowerQuery)
    );
  };

  const getPath = (folderId: string | null): FileSystemItem[] => {
    const path: FileSystemItem[] = [];
    let currentId = folderId;
    while (currentId) {
      const item = state.items[currentId];
      if (item) {
        path.unshift(item);
        currentId = item.parentId;
      } else {
        break;
      }
    }
    return path;
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Google Sans, Roboto, sans-serif', color: '#5F6368' }}>Loading...</div>;
  }

  return (
    <FileSystemContext.Provider value={{
      state,
      dispatch,
      getFolderContents,
      getStarredItems,
      getRecentItems,
      getTrashedItems,
      getSharedWithMeItems,
      searchItems,
      getPath,
      initialState: getInitialState(sidRef.current) || INITIAL_STATE,
      uploadFile,
      loading
    }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) throw new Error('useFileSystem must be used within a FileSystemProvider');
  return context;
};
