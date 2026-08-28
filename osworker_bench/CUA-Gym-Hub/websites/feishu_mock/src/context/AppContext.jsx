import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { createInitialData } from '../utils/dataManager';

const STORAGE_KEY = 'feishu_mock_state';

function getSid() {
  try {
    return new URLSearchParams(window.location.search).get('sid') || 'default';
  } catch {
    return 'default';
  }
}

const AppContext = createContext(null);

function deepDiff(a, b, path = '') {
  if (a === b) return {};
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return { [path || 'value']: { from: a, to: b } };
  }
  const diff = {};
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const key of keys) {
    const sub = deepDiff(a[key], b[key], path ? `${path}.${key}` : key);
    Object.assign(diff, sub);
  }
  return diff;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload };

    case 'SET_ACTIVE_MODULE':
      return { ...state, activeModule: action.payload };

    case 'SET_ACTIVE_CONVERSATION':
      return {
        ...state,
        activeConversationId: action.payload,
        threadPanelMessageId: null,
        // mark conversation as read
        conversations: state.conversations.map(c =>
          c.id === action.payload ? { ...c, unreadCount: 0 } : c
        ),
      };

    case 'SEND_MESSAGE': {
      const { message } = action.payload;
      const existing = state.messages[message.conversationId] || [];
      const newMsgs = { ...state.messages, [message.conversationId]: [...existing, message] };
      const newConvs = state.conversations.map(c => {
        if (c.id === message.conversationId) {
          return {
            ...c,
            lastMessage: { content: message.content, senderId: message.senderId, timestamp: message.timestamp },
          };
        }
        return c;
      });
      // Sort conversations: pinned first, then by lastMessage timestamp
      newConvs.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        const ta = a.lastMessage?.timestamp || 0;
        const tb = b.lastMessage?.timestamp || 0;
        return tb - ta;
      });
      return { ...state, messages: newMsgs, conversations: newConvs };
    }

    case 'SEND_THREAD_REPLY': {
      const { reply, parentId, conversationId } = action.payload;
      const convMsgs = state.messages[conversationId] || [];
      const updated = convMsgs.map(m => {
        if (m.id === parentId) {
          return { ...m, threadCount: (m.threadCount || 0) + 1, threadLastReply: reply.timestamp };
        }
        return m;
      });
      return {
        ...state,
        messages: { ...state.messages, [conversationId]: [...updated, reply] },
      };
    }

    case 'ADD_REACTION': {
      const { conversationId, messageId, emoji, userId } = action.payload;
      const convMsgs = state.messages[conversationId] || [];
      const updated = convMsgs.map(m => {
        if (m.id !== messageId) return m;
        const reactions = [...(m.reactions || [])];
        const idx = reactions.findIndex(r => r.emoji === emoji);
        if (idx >= 0) {
          const r = reactions[idx];
          if (r.userIds.includes(userId)) {
            // toggle off
            const newUserIds = r.userIds.filter(id => id !== userId);
            if (newUserIds.length === 0) reactions.splice(idx, 1);
            else reactions[idx] = { ...r, userIds: newUserIds };
          } else {
            reactions[idx] = { ...r, userIds: [...r.userIds, userId] };
          }
        } else {
          reactions.push({ emoji, userIds: [userId] });
        }
        return { ...m, reactions };
      });
      return { ...state, messages: { ...state.messages, [conversationId]: updated } };
    }

    case 'DELETE_MESSAGE': {
      const { conversationId, messageId } = action.payload;
      const convMsgs = state.messages[conversationId] || [];
      const updated = convMsgs.filter(m => m.id !== messageId);
      return { ...state, messages: { ...state.messages, [conversationId]: updated } };
    }

    case 'EDIT_MESSAGE': {
      const { conversationId, messageId, content } = action.payload;
      const convMsgs = state.messages[conversationId] || [];
      const updated = convMsgs.map(m => m.id === messageId ? { ...m, content, isEdited: true } : m);
      return { ...state, messages: { ...state.messages, [conversationId]: updated } };
    }

    case 'PIN_MESSAGE': {
      const { conversationId, messageId, isPinned } = action.payload;
      const convMsgs = state.messages[conversationId] || [];
      const msg = convMsgs.find(m => m.id === messageId);
      const updatedConvs = state.conversations.map(c => {
        if (c.id === conversationId && isPinned && msg) {
          return { ...c, topNotice: msg.content };
        }
        return c;
      });
      const updated = convMsgs.map(m => m.id === messageId ? { ...m, isPinned } : m);
      return { ...state, messages: { ...state.messages, [conversationId]: updated }, conversations: updatedConvs };
    }

    case 'SET_TOP_NOTICE': {
      const { conversationId, notice } = action.payload;
      const updatedConvs = state.conversations.map(c =>
        c.id === conversationId ? { ...c, topNotice: notice } : c
      );
      return { ...state, conversations: updatedConvs };
    }

    case 'SET_THREAD_PANEL':
      return { ...state, threadPanelMessageId: action.payload };

    case 'TOGGLE_PIN_CONVERSATION': {
      const updated = state.conversations.map(c =>
        c.id === action.payload ? { ...c, isPinned: !c.isPinned } : c
      );
      updated.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0);
      });
      return { ...state, conversations: updated };
    }

    case 'TOGGLE_MUTE_CONVERSATION': {
      const updated = state.conversations.map(c =>
        c.id === action.payload ? { ...c, isMuted: !c.isMuted } : c
      );
      return { ...state, conversations: updated };
    }

    case 'MARK_CONVERSATION_READ': {
      const updated = state.conversations.map(c =>
        c.id === action.payload ? { ...c, unreadCount: 0 } : c
      );
      return { ...state, conversations: updated };
    }

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    // Calendar
    case 'CREATE_EVENT':
      return { ...state, events: [...state.events, action.payload] };

    case 'UPDATE_EVENT': {
      const updated = state.events.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e);
      return { ...state, events: updated };
    }

    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.payload) };

    // Docs
    case 'CREATE_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] };

    case 'UPDATE_DOCUMENT': {
      const updated = state.documents.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d);
      return { ...state, documents: updated };
    }

    case 'TOGGLE_STAR_DOCUMENT': {
      const updated = state.documents.map(d =>
        d.id === action.payload ? { ...d, isStar: !d.isStar } : d
      );
      return { ...state, documents: updated };
    }

    // Tasks
    case 'CREATE_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };

    case 'UPDATE_TASK': {
      const updated = state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t);
      return { ...state, tasks: updated };
    }

    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };

    case 'TOGGLE_TASK_DONE': {
      const updated = state.tasks.map(t => {
        if (t.id !== action.payload) return t;
        const done = t.status !== 'done';
        return { ...t, status: done ? 'done' : 'in_progress', completedAt: done ? Date.now() : null };
      });
      return { ...state, tasks: updated };
    }

    // Approvals
    case 'UPDATE_APPROVAL': {
      const updated = state.approvals.map(a =>
        a.id === action.payload.id ? { ...a, ...action.payload, updatedAt: Date.now() } : a
      );
      return { ...state, approvals: updated };
    }

    // Meetings
    case 'CREATE_MEETING':
      return { ...state, meetings: [...(state.meetings || []), action.payload] };

    case 'UPDATE_MEETING': {
      const updated = (state.meetings || []).map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m);
      return { ...state, meetings: updated };
    }

    case 'DELETE_MEETING':
      return { ...state, meetings: (state.meetings || []).filter(m => m.id !== action.payload) };

    // User profile
    case 'UPDATE_CURRENT_USER':
      return { ...state, currentUser: { ...state.currentUser, ...action.payload } };

    // Favorites
    case 'ADD_FAVORITE': {
      const { messageId, conversationId } = action.payload;
      const existing = state.favorites || [];
      if (existing.some(f => f.messageId === messageId)) return state;
      return { ...state, favorites: [...existing, { messageId, conversationId, timestamp: Date.now() }] };
    }

    case 'REMOVE_FAVORITE': {
      const existing = state.favorites || [];
      return { ...state, favorites: existing.filter(f => f.messageId !== action.payload) };
    }

    // Leave conversation
    case 'LEAVE_CONVERSATION': {
      const { conversationId, userId } = action.payload;
      const updatedConvs = state.conversations.map(c => {
        if (c.id !== conversationId) return c;
        return { ...c, members: (c.members || []).filter(id => id !== userId) };
      }).filter(c => c.id !== conversationId || (c.members || []).length > 0);
      const newActiveId = updatedConvs.length > 0 ? updatedConvs[0].id : null;
      return {
        ...state,
        conversations: updatedConvs,
        activeConversationId: state.activeConversationId === conversationId ? newActiveId : state.activeConversationId,
      };
    }

    // Add member
    case 'ADD_MEMBER': {
      const { conversationId, userId } = action.payload;
      const updatedConvs = state.conversations.map(c => {
        if (c.id !== conversationId) return c;
        if ((c.members || []).includes(userId)) return c;
        return { ...c, members: [...(c.members || []), userId] };
      });
      return { ...state, conversations: updatedConvs };
    }

    // Active contact
    case 'SET_ACTIVE_CONTACT':
      return { ...state, activeContactId: action.payload };

    // Settings
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...(state.settings || {}), ...action.payload } };

    // Card action responses
    case 'CARD_ACTION_RESPOND': {
      const { messageId, action: actionLabel, conversationId, timestamp } = action.payload;
      const convMsgs = state.messages[conversationId] || [];
      const updatedMsgs = convMsgs.map(m =>
        m.id === messageId ? { ...m, cardResponded: actionLabel } : m
      );
      const existingResponses = state.cardResponses || [];
      return {
        ...state,
        messages: { ...state.messages, [conversationId]: updatedMsgs },
        cardResponses: [
          ...existingResponses,
          { messageId, action: actionLabel, conversationId, timestamp },
        ],
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const initialData = createInitialData();
  const initialRef = useRef(initialData);

  const saved = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [state, dispatch] = useReducer(reducer, saved || initialData);

  // Persist to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  // On first mount, POST initial state to establish server-side baseline
  const initialSyncDone = useRef(false);
  useEffect(() => {
    if (!initialSyncDone.current) {
      initialSyncDone.current = true;
      const sid = getSid();
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', state: initialRef.current }),
      }).catch(() => {});
    }
  }, []);

  // Sync current state to server (for /go?sid= RL harness)
  const syncTimerRef = useRef(null);
  useEffect(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      const sid = getSid();
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }, [state]);

  const getStateDiff = () => deepDiff(initialRef.current, state);

  return (
    <AppContext.Provider value={{ state, dispatch, initialState: initialRef.current, getStateDiff }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export default AppContext;
