import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { loadData, saveData, getInitialState, fetchCustomState, getSessionId, initializeWithCustomState } from '../store/initialData';

const DocsContext = createContext();

function docsReducer(state, action) {
  switch (action.type) {
    case 'INIT_STATE':
      return action.payload;

    case 'CREATE_DOC': {
      const { id, title } = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        documents: {
          ...state.documents,
          [id]: {
            id,
            title: title || 'Untitled Document',
            content: '',
            ownerId: state.currentUser.id,
            starred: false,
            created: now,
            updated: now,
            sharedWith: [],
            linkSharing: { enabled: false, permission: 'viewer' }
          }
        }
      };
    }

    case 'UPDATE_DOC': {
      const { docId, ...updates } = action.payload;
      const doc = state.documents[docId];
      if (!doc) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [docId]: {
            ...doc,
            ...updates,
            updated: new Date().toISOString()
          }
        }
      };
    }

    case 'DELETE_DOC': {
      const { docId } = action.payload;
      const { [docId]: removed, ...rest } = state.documents;
      return {
        ...state,
        documents: rest,
        comments: state.comments.filter(c => c.docId !== docId)
      };
    }

    case 'STAR_DOC': {
      const { docId } = action.payload;
      const doc = state.documents[docId];
      if (!doc) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [docId]: { ...doc, starred: !doc.starred }
        }
      };
    }

    case 'RENAME_DOC': {
      const { docId, title } = action.payload;
      const doc = state.documents[docId];
      if (!doc) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [docId]: { ...doc, title, updated: new Date().toISOString() }
        }
      };
    }

    case 'ADD_COMMENT': {
      const { docId, content, quotedText } = action.payload;
      const newComment = {
        id: `comment-${Date.now()}`,
        docId,
        userId: state.currentUser.id,
        content,
        resolved: false,
        created: new Date().toISOString(),
        quotedText: quotedText || '',
        replies: []
      };
      return {
        ...state,
        comments: [...state.comments, newComment]
      };
    }

    case 'REPLY_COMMENT': {
      const { commentId, content } = action.payload;
      return {
        ...state,
        comments: state.comments.map(c => {
          if (c.id !== commentId) return c;
          return {
            ...c,
            replies: [
              ...c.replies,
              {
                id: `reply-${Date.now()}`,
                userId: state.currentUser.id,
                content,
                created: new Date().toISOString()
              }
            ]
          };
        })
      };
    }

    case 'RESOLVE_COMMENT': {
      const { commentId } = action.payload;
      return {
        ...state,
        comments: state.comments.map(c =>
          c.id === commentId ? { ...c, resolved: !c.resolved } : c
        )
      };
    }

    case 'DELETE_COMMENT': {
      const { commentId } = action.payload;
      return {
        ...state,
        comments: state.comments.filter(c => c.id !== commentId)
      };
    }

    case 'SHARE_DOC': {
      const { docId, userId, permission } = action.payload;
      const doc = state.documents[docId];
      if (!doc) return state;

      let sharedWith;
      if (permission === null) {
        sharedWith = doc.sharedWith.filter(s => s.userId !== userId);
      } else {
        const existing = doc.sharedWith.find(s => s.userId === userId);
        if (existing) {
          sharedWith = doc.sharedWith.map(s =>
            s.userId === userId ? { ...s, permission } : s
          );
        } else {
          sharedWith = [...doc.sharedWith, { userId, permission }];
        }
      }

      return {
        ...state,
        documents: {
          ...state.documents,
          [docId]: { ...doc, sharedWith, updated: new Date().toISOString() }
        }
      };
    }

    case 'UPDATE_LINK_SHARING': {
      const { docId, enabled, permission } = action.payload;
      const doc = state.documents[docId];
      if (!doc) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [docId]: {
            ...doc,
            linkSharing: { enabled, permission },
            updated: new Date().toISOString()
          }
        }
      };
    }

    case 'SET_UI': {
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      };
    }

    case 'ADD_VERSION': {
      const { docId, label, content, author } = action.payload;
      const doc = state.documents[docId];
      if (!doc) return state;
      const VERSION_COLORS = ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#9334e8', '#e88c1a'];
      const existing = doc.versions || [];
      const newVersion = {
        id: 'v-' + Date.now(),
        label: label || null,
        timestamp: new Date().toISOString(),
        author: author || 'Demo User',
        color: VERSION_COLORS[existing.length % VERSION_COLORS.length],
        content: content || doc.content || '',
      };
      return {
        ...state,
        documents: {
          ...state.documents,
          [docId]: {
            ...doc,
            versions: [newVersion, ...existing].slice(0, 30),
          }
        }
      };
    }

    case 'RESTORE_VERSION': {
      const { docId, versionId } = action.payload;
      const doc = state.documents[docId];
      if (!doc) return state;
      const versions = doc.versions || [];
      const version = versions.find(v => v.id === versionId);
      if (!version) return state;
      return {
        ...state,
        documents: {
          ...state.documents,
          [docId]: {
            ...doc,
            content: version.content,
            updated: new Date().toISOString(),
          }
        }
      };
    }

    default:
      return state;
  }
}

export function DocsProvider({ children }) {
  // Capture the "is this a refresh?" flag BEFORE the useReducer lazy initializer
  // (loadData) runs, because loadData writes the `..._initial_<sid>` key on a
  // fresh first load. If we re-read that key inside the effect below, a first
  // load looks like a refresh and we skip fetchCustomState — so server-injected
  // state (e.g. a task's seeded documents) never reaches the client. Reading it
  // here, before loadData, keeps first-load vs refresh correct (mirrors slack_mock).
  const didRefreshRef = useRef(
    (() => {
      const sid = getSessionId();
      return sid ? localStorage.getItem(`google_docs_mock_initial_${sid}`) !== null : false;
    })()
  );
  const [state, dispatch] = useReducer(docsReducer, null, loadData);
  const [loading, setLoading] = useState(false);
  const initialStateRef = useRef(getInitialState());
  const initDone = useRef(false);

  // Async custom state fetch for session isolation
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = getSessionId();
    if (sid) {
      const isRefresh = didRefreshRef.current;

      if (!isRefresh) {
        setLoading(true);
        fetchCustomState(sid).then(customState => {
          if (customState) {
            const data = initializeWithCustomState(sid, customState);
            dispatch({ type: 'INIT_STATE', payload: data });
            initialStateRef.current = JSON.parse(JSON.stringify(data));
          }
          setLoading(false);
        });
      }
    }
  }, []);

  // Persist user-driven state changes back to the mock backend.
  //
  // NOTE: This effect intentionally does NOT run a "baseline sync" POST on
  // first mount. Previous versions did — they POSTed the reducer's lazy
  // initial state (defaults / localStorage) to /post with action:'set',
  // merge:false on the very first render. That was a race against the
  // task setup script's own POST to /post: on a fresh throwaway Chrome
  // profile, `loading` was still its initial `false` value when this
  // effect fired for the first time (setLoading(true) from the other
  // effect had not yet been applied), so the guard `if (!loading)` did
  // not save us. The result was that whichever POST landed at vite last
  // won, and the task's seeded documents (e.g. AE Briefing / Lead Tier
  // Playbook) would sometimes disappear from the current state, replaced
  // by the mock's built-in defaults. The .initial.json snapshot (used by
  // reward.py) was already written by the setup POST and therefore stayed
  // correct — that mismatch is what produced "reward says pass but the
  // page shows the wrong docs".
  //
  // The setup script is the sole owner of the initial baseline; the
  // frontend must only report *subsequent* user edits through saveData().
  useEffect(() => {
    if (loading) return;
    saveData(state);
  }, [state, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <DocsContext.Provider value={{ state, dispatch, initialState: initialStateRef.current }}>
      {children}
    </DocsContext.Provider>
  );
}

export function useDocsContext() {
  const context = useContext(DocsContext);
  if (!context) {
    throw new Error('useDocsContext must be used within a DocsProvider');
  }
  return context;
}

export { DocsContext };
