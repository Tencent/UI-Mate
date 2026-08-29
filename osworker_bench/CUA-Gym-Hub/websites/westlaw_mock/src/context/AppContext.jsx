import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { getSessionId, initializeData, saveState } from '../utils/dataManager';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };

    case 'SEARCH': {
      const query = action.payload.query.toLowerCase();
      const allDocs = [...(state.cases || []), ...(state.statutes || [])];
      const results = allDocs.filter(doc => {
        const searchable = [
          doc.title, doc.citation, doc.synopsis, doc.text,
          ...(doc.topics || []),
          ...(doc.annotations || [])
        ].filter(Boolean).join(' ').toLowerCase();
        return searchable.includes(query);
      });

      // Apply filters
      let filtered = results;
      if (state.filters.jurisdiction && state.filters.jurisdiction !== 'All') {
        filtered = filtered.filter(d => d.jurisdiction === state.filters.jurisdiction || d.court?.includes('United States'));
      }
      if (state.filters.contentType && state.filters.contentType !== 'All') {
        filtered = filtered.filter(d => d.type === state.filters.contentType);
      }

      const historyEntry = {
        id: `hist-${Date.now()}`,
        type: 'search',
        query: action.payload.query,
        timestamp: new Date().toISOString(),
        resultCount: filtered.length
      };

      return {
        ...state,
        searchQuery: action.payload.query,
        searchResults: filtered,
        history: [historyEntry, ...(state.history || [])]
      };
    }

    case 'SAVE_TO_FOLDER': {
      const { folderId, documentId } = action.payload;
      const folders = (state.folders || []).map(f => {
        if (f.id === folderId) {
          const docIds = f.documentIds || [];
          if (!docIds.includes(documentId)) {
            return { ...f, documentIds: [...docIds, documentId] };
          }
        }
        return f;
      });
      return { ...state, folders };
    }

    case 'REMOVE_FROM_FOLDER': {
      const { folderId: rmFolderId, documentId: rmDocId } = action.payload;
      const updatedFolders = (state.folders || []).map(f => {
        if (f.id === rmFolderId) {
          return { ...f, documentIds: (f.documentIds || []).filter(id => id !== rmDocId) };
        }
        return f;
      });
      return { ...state, folders: updatedFolders };
    }

    case 'CREATE_FOLDER': {
      const newFolder = {
        id: `folder-${Date.now()}`,
        name: action.payload.name,
        createdAt: new Date().toISOString(),
        documentIds: []
      };
      return { ...state, folders: [...(state.folders || []), newFolder] };
    }

    case 'DELETE_FOLDER': {
      return {
        ...state,
        folders: (state.folders || []).filter(f => f.id !== action.payload.folderId)
      };
    }

    case 'ADD_HISTORY': {
      const entry = {
        id: `hist-${Date.now()}`,
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      return { ...state, history: [entry, ...(state.history || [])] };
    }

    case 'ADD_NOTE': {
      const { documentId: noteDocId, text } = action.payload;
      return {
        ...state,
        notes: { ...(state.notes || {}), [noteDocId]: text }
      };
    }

    case 'SET_FILTERS': {
      return {
        ...state,
        filters: { ...(state.filters || {}), ...action.payload }
      };
    }

    case 'TOGGLE_FAVORITE': {
      const docId = action.payload.documentId;
      const favs = state.favorites || [];
      const newFavs = favs.includes(docId) ? favs.filter(id => id !== docId) : [...favs, docId];
      return { ...state, favorites: newFavs };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);
  const [loading, setLoading] = useState(true);
  const sid = getSessionId();

  useEffect(() => {
    initializeData(sid).then(data => {
      dispatch({ type: 'SET_STATE', payload: data });
      setLoading(false);
    });
  }, [sid]);

  // Save state to server on changes
  useEffect(() => {
    if (state && !loading) {
      saveState(sid, state);
    }
  }, [state, sid, loading]);

  if (loading || !state) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#5A6577' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
