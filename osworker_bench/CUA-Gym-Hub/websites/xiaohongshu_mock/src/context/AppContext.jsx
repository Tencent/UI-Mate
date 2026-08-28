import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveState, loadInitialState, createInitialData, getStateDiff, initializeState } from '../utils/dataManager.js';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'INIT_STATE':
      return action.payload;

    case 'LIKE_NOTE': {
      const { noteId, userId } = action.payload;
      const note = state.notes[noteId];
      if (!note) return state;
      const liked = note.likedByIds.includes(userId);
      return {
        ...state,
        notes: {
          ...state.notes,
          [noteId]: {
            ...note,
            likedByIds: liked
              ? note.likedByIds.filter(id => id !== userId)
              : [...note.likedByIds, userId]
          }
        }
      };
    }

    case 'BOOKMARK_NOTE': {
      const { noteId, userId } = action.payload;
      const note = state.notes[noteId];
      if (!note) return state;
      const bookmarked = note.bookmarkedByIds.includes(userId);
      return {
        ...state,
        notes: {
          ...state.notes,
          [noteId]: {
            ...note,
            bookmarkedByIds: bookmarked
              ? note.bookmarkedByIds.filter(id => id !== userId)
              : [...note.bookmarkedByIds, userId]
          }
        }
      };
    }

    case 'FOLLOW_USER': {
      const { targetUserId, currentUserId } = action.payload;
      const targetUser = state.users[targetUserId];
      const currentUser = state.users[currentUserId];
      if (!targetUser || !currentUser) return state;
      const isFollowing = currentUser.followingIds.includes(targetUserId);
      const newNotifId = `notif_${uuidv4().slice(0, 8)}`;
      const newNotifications = isFollowing
        ? state.notifications
        : {
            ...state.notifications,
            [newNotifId]: {
              id: newNotifId,
              recipientId: targetUserId,
              actorId: currentUserId,
              type: 'follow',
              noteId: null,
              commentId: null,
              isRead: false,
              createdAt: Date.now()
            }
          };
      return {
        ...state,
        users: {
          ...state.users,
          [currentUserId]: {
            ...currentUser,
            followingIds: isFollowing
              ? currentUser.followingIds.filter(id => id !== targetUserId)
              : [...currentUser.followingIds, targetUserId]
          },
          [targetUserId]: {
            ...targetUser,
            followerIds: isFollowing
              ? targetUser.followerIds.filter(id => id !== currentUserId)
              : [...targetUser.followerIds, currentUserId]
          }
        },
        notifications: newNotifications
      };
    }

    case 'ADD_COMMENT': {
      const { noteId, content, parentCommentId, userId } = action.payload;
      const note = state.notes[noteId];
      if (!note) return state;
      const newCommentId = `c_${uuidv4().slice(0, 8)}`;
      const newComment = {
        id: newCommentId,
        noteId,
        authorId: userId,
        content,
        likedByIds: [],
        parentCommentId: parentCommentId || null,
        createdAt: Date.now()
      };
      return {
        ...state,
        notes: {
          ...state.notes,
          [noteId]: {
            ...note,
            commentCount: note.commentCount + 1
          }
        },
        comments: {
          ...state.comments,
          [newCommentId]: newComment
        }
      };
    }

    case 'LIKE_COMMENT': {
      const { commentId, userId } = action.payload;
      const comment = state.comments[commentId];
      if (!comment) return state;
      const liked = comment.likedByIds.includes(userId);
      return {
        ...state,
        comments: {
          ...state.comments,
          [commentId]: {
            ...comment,
            likedByIds: liked
              ? comment.likedByIds.filter(id => id !== userId)
              : [...comment.likedByIds, userId]
          }
        }
      };
    }

    case 'SEND_MESSAGE': {
      const { conversationId, content, senderId } = action.payload;
      const conv = state.conversations[conversationId];
      if (!conv) return state;
      const newMsgId = `msg_${uuidv4().slice(0, 8)}`;
      const newMsg = {
        id: newMsgId,
        conversationId,
        senderId,
        content,
        type: 'text',
        imageUrl: null,
        sharedNoteId: null,
        createdAt: Date.now()
      };
      return {
        ...state,
        messages: {
          ...state.messages,
          [newMsgId]: newMsg
        },
        conversations: {
          ...state.conversations,
          [conversationId]: {
            ...conv,
            lastMessagePreview: content.length > 30 ? content.slice(0, 30) + '...' : content,
            lastMessageAt: Date.now(),
            unreadCount: 0
          }
        }
      };
    }

    case 'MARK_NOTIFICATION_READ': {
      const { notifId } = action.payload;
      const notif = state.notifications[notifId];
      if (!notif) return state;
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [notifId]: { ...notif, isRead: true }
        }
      };
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const updatedNotifs = {};
      for (const id in state.notifications) {
        updatedNotifs[id] = { ...state.notifications[id], isRead: true };
      }
      return { ...state, notifications: updatedNotifs };
    }

    case 'CREATE_NOTE': {
      const { noteData } = action.payload;
      const noteId = noteData.id || `n_${uuidv4().slice(0, 8)}`;
      const newNote = {
        ...noteData,
        id: noteId,
        likedByIds: [],
        bookmarkedByIds: [],
        commentCount: 0,
        shareCount: 0,
        isPinned: false,
        createdAt: Date.now()
      };
      return {
        ...state,
        notes: {
          ...state.notes,
          [noteId]: newNote
        }
      };
    }

    case 'DELETE_NOTE': {
      const { noteId } = action.payload;
      const { [noteId]: _removed, ...remainingNotes } = state.notes;
      return { ...state, notes: remainingNotes };
    }

    case 'EDIT_NOTE': {
      const { noteId, updates } = action.payload;
      const note = state.notes[noteId];
      if (!note) return state;
      return {
        ...state,
        notes: {
          ...state.notes,
          [noteId]: { ...note, ...updates }
        }
      };
    }

    case 'EDIT_PROFILE': {
      const { userId, updates } = action.payload;
      const user = state.users[userId];
      if (!user) return state;
      return {
        ...state,
        users: {
          ...state.users,
          [userId]: { ...user, ...updates }
        }
      };
    }

    case 'PIN_NOTE': {
      const { noteId } = action.payload;
      const note = state.notes[noteId];
      if (!note) return state;
      return {
        ...state,
        notes: {
          ...state.notes,
          [noteId]: { ...note, isPinned: !note.isPinned }
        }
      };
    }

    case 'SET_THEME': {
      const { isDarkMode } = action.payload;
      return { ...state, isDarkMode };
    }

    case 'MARK_CONV_READ': {
      const { convId } = action.payload;
      const conv = state.conversations?.[convId];
      if (!conv) return state;
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [convId]: { ...conv, unreadCount: 0 }
        }
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);
  const [initialState, setInitialState] = useReducer((s, a) => a, null);
  const isInitialized = useRef(false);

  useEffect(() => {
    async function init() {
      // Check for server-side state (session isolation)
      const sid = new URLSearchParams(window.location.search).get('sid');
      let serverState = null;
      if (sid) {
        try {
          const res = await fetch(`/go?sid=${sid}`);
          if (res.ok) {
            const data = await res.json();
            if (data.current_state && Object.keys(data.current_state).length > 0) {
              serverState = data.current_state;
            }
          }
        } catch (e) {}
      }
      const loadedState = initializeState(serverState);
      dispatch({ type: 'INIT_STATE', payload: loadedState });
      setInitialState(loadInitialState() || loadedState);
    }
    init();
  }, []);

  useEffect(() => {
    if (state) {
      if (!isInitialized.current) {
        isInitialized.current = true;
        return;
      }
      saveState(state);
    }
  }, [state]);

  const likeNote = useCallback((noteId) => {
    if (!state) return;
    dispatch({ type: 'LIKE_NOTE', payload: { noteId, userId: state.currentUserId } });
  }, [state?.currentUserId]);

  const bookmarkNote = useCallback((noteId) => {
    if (!state) return;
    dispatch({ type: 'BOOKMARK_NOTE', payload: { noteId, userId: state.currentUserId } });
  }, [state?.currentUserId]);

  const followUser = useCallback((targetUserId) => {
    if (!state) return;
    dispatch({ type: 'FOLLOW_USER', payload: { targetUserId, currentUserId: state.currentUserId } });
  }, [state?.currentUserId]);

  const addComment = useCallback((noteId, content, parentCommentId = null) => {
    if (!state) return;
    dispatch({ type: 'ADD_COMMENT', payload: { noteId, content, parentCommentId, userId: state.currentUserId } });
  }, [state?.currentUserId]);

  const likeComment = useCallback((commentId) => {
    if (!state) return;
    dispatch({ type: 'LIKE_COMMENT', payload: { commentId, userId: state.currentUserId } });
  }, [state?.currentUserId]);

  const sendMessage = useCallback((conversationId, content) => {
    if (!state) return;
    dispatch({ type: 'SEND_MESSAGE', payload: { conversationId, content, senderId: state.currentUserId } });
  }, [state?.currentUserId]);

  const markNotificationRead = useCallback((notifId) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { notifId } });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }, []);

  const createNote = useCallback((noteData) => {
    if (!state) return;
    dispatch({ type: 'CREATE_NOTE', payload: { noteData } });
  }, []);

  const deleteNote = useCallback((noteId) => {
    dispatch({ type: 'DELETE_NOTE', payload: { noteId } });
  }, []);

  const editNote = useCallback((noteId, updates) => {
    dispatch({ type: 'EDIT_NOTE', payload: { noteId, updates } });
  }, []);

  const editProfile = useCallback((updates) => {
    if (!state) return;
    dispatch({ type: 'EDIT_PROFILE', payload: { userId: state.currentUserId, updates } });
  }, [state?.currentUserId]);

  const pinNote = useCallback((noteId) => {
    dispatch({ type: 'PIN_NOTE', payload: { noteId } });
  }, []);

  const setTheme = useCallback((isDarkMode) => {
    dispatch({ type: 'SET_THEME', payload: { isDarkMode } });
  }, []);

  const markConvRead = useCallback((convId) => {
    dispatch({ type: 'MARK_CONV_READ', payload: { convId } });
  }, []);

  const getStateDiffFn = useCallback(() => {
    const initState = loadInitialState() || createInitialData();
    return getStateDiff(initState, state || {});
  }, [state]);

  return (
    <AppContext.Provider value={{
      state,
      initialState,
      currentUserId: state?.currentUserId || 'u1',
      likeNote,
      bookmarkNote,
      followUser,
      addComment,
      likeComment,
      sendMessage,
      markNotificationRead,
      markAllNotificationsRead,
      createNote,
      deleteNote,
      editNote,
      editProfile,
      pinNote,
      setTheme,
      markConvRead,
      getStateDiff: getStateDiffFn
    }}>
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
