import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getSessionId, fetchCustomState, initializeData, saveState, getStoredInitialState, initialKey } from '../utils/dataManager';
import { computeStateDiff } from '../utils/stateTracker';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const initialRef = useRef(null);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;
    const ik = initialKey(sid);
    const isRefresh = localStorage.getItem(ik) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      initialRef.current = getStoredInitialState(sid) || data;
      setState(data);
      setLoading(false);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        initialRef.current = getStoredInitialState(sid) || data;
        setState(data);
        setLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
  }, []);

  // ========== ACTION METHODS ==========

  const sendMessage = useCallback((containerId, content, mentions = [], attachments = []) => {
    updateState(prev => {
      const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString();
      const msg = {
        messageId: msgId, containerId, containerType: prev.chats.find(c => c.chatId === containerId) ? 'chat' : 'channel',
        senderId: prev.currentUser.userId, content, contentType: 'text', messageType: 'message',
        createdDateTime: now, lastEditedDateTime: null, deletedDateTime: null, importance: 'normal',
        subject: '', replyToId: null, reactions: [], mentions, attachments, isBookmarked: false
      };
      const msgs = { ...prev.messages, [containerId]: [...(prev.messages[containerId] || []), msg] };
      const preview = content.length > 40 ? content.slice(0, 40) + '...' : content;

      let chats = prev.chats.map(c => c.chatId === containerId ? { ...c, lastMessagePreview: preview, lastMessageSenderId: prev.currentUser.userId, lastMessageTimestamp: now, isHidden: false } : c);
      let channels = prev.channels.map(c => c.channelId === containerId ? { ...c, lastMessagePreview: `${prev.currentUser.displayName}: ${preview}`, lastMessageTimestamp: now } : c);

      return { ...prev, messages: msgs, chats, channels };
    });
  }, [updateState]);

  const sendReply = useCallback((containerId, replyToId, content) => {
    updateState(prev => {
      const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const now = new Date().toISOString();
      const msg = {
        messageId: msgId, containerId, containerType: prev.chats.find(c => c.chatId === containerId) ? 'chat' : 'channel',
        senderId: prev.currentUser.userId, content, contentType: 'text', messageType: 'message',
        createdDateTime: now, lastEditedDateTime: null, deletedDateTime: null, importance: 'normal',
        subject: '', replyToId, reactions: [], mentions: [], attachments: [], isBookmarked: false
      };
      const msgs = { ...prev.messages, [containerId]: [...(prev.messages[containerId] || []), msg] };
      return { ...prev, messages: msgs };
    });
  }, [updateState]);

  const editMessage = useCallback((containerId, messageId, newContent) => {
    updateState(prev => {
      const msgs = { ...prev.messages };
      msgs[containerId] = (msgs[containerId] || []).map(m =>
        m.messageId === messageId ? { ...m, content: newContent, lastEditedDateTime: new Date().toISOString() } : m
      );
      return { ...prev, messages: msgs };
    });
  }, [updateState]);

  const deleteMessage = useCallback((containerId, messageId) => {
    updateState(prev => {
      const msgs = { ...prev.messages };
      msgs[containerId] = (msgs[containerId] || []).map(m =>
        m.messageId === messageId ? { ...m, deletedDateTime: new Date().toISOString(), content: 'This message has been deleted.' } : m
      );
      return { ...prev, messages: msgs };
    });
  }, [updateState]);

  const addReaction = useCallback((containerId, messageId, emoji) => {
    updateState(prev => {
      const userId = prev.currentUser.userId;
      const msgs = { ...prev.messages };
      msgs[containerId] = (msgs[containerId] || []).map(m => {
        if (m.messageId !== messageId) return m;
        const reactions = [...m.reactions];
        const idx = reactions.findIndex(r => r.emoji === emoji);
        if (idx >= 0) {
          if (!reactions[idx].users.includes(userId)) {
            reactions[idx] = { ...reactions[idx], users: [...reactions[idx].users, userId] };
          }
        } else {
          reactions.push({ emoji, users: [userId] });
        }
        return { ...m, reactions };
      });
      return { ...prev, messages: msgs };
    });
  }, [updateState]);

  const removeReaction = useCallback((containerId, messageId, emoji) => {
    updateState(prev => {
      const userId = prev.currentUser.userId;
      const msgs = { ...prev.messages };
      msgs[containerId] = (msgs[containerId] || []).map(m => {
        if (m.messageId !== messageId) return m;
        let reactions = m.reactions.map(r => {
          if (r.emoji !== emoji) return r;
          return { ...r, users: r.users.filter(u => u !== userId) };
        }).filter(r => r.users.length > 0);
        return { ...m, reactions };
      });
      return { ...prev, messages: msgs };
    });
  }, [updateState]);

  const createChannel = useCallback((teamId, displayName, description = '', membershipType = 'standard') => {
    updateState(prev => {
      const chId = 'ch_' + Date.now();
      const newChannel = {
        channelId: chId, teamId, displayName, description, membershipType,
        isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 0,
        lastMessagePreview: '', lastMessageTimestamp: new Date().toISOString(),
        createdDateTime: new Date().toISOString(), members: [],
        tabs: [{ tabId: 'tab_posts_' + chId, displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_' + chId, displayName: 'Files', type: 'files' }],
        pinnedMessages: []
      };
      const channels = [...prev.channels, newChannel];
      const teams = prev.teams.map(t => t.teamId === teamId ? { ...t, channels: [...t.channels, chId] } : t);
      const messages = { ...prev.messages, [chId]: [] };
      return { ...prev, channels, teams, messages };
    });
  }, [updateState]);

  const createTeam = useCallback((displayName, description, visibility, members) => {
    updateState(prev => {
      const tId = 'team_' + Date.now();
      const chId = 'ch_gen_' + Date.now();
      const generalChannel = {
        channelId: chId, teamId: tId, displayName: 'General', description: 'General discussions',
        membershipType: 'standard', isFavoriteByDefault: true, isPinned: false, isMuted: false,
        unreadCount: 0, lastMessagePreview: '', lastMessageTimestamp: new Date().toISOString(),
        createdDateTime: new Date().toISOString(), members: [],
        tabs: [{ tabId: 'tab_posts_' + chId, displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_' + chId, displayName: 'Files', type: 'files' }],
        pinnedMessages: []
      };
      const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const newTeam = {
        teamId: tId, displayName, description, avatar: '', avatarColor: '#6264A7', avatarInitials: initials,
        visibility, isArchived: false, isFavorite: false, createdDateTime: new Date().toISOString(),
        members: [prev.currentUser.userId, ...(members || [])], owners: [prev.currentUser.userId],
        channels: [chId],
        settings: { allowMemberCreateChannels: true, allowMemberDeleteMessages: true, allowGiphy: true, allowStickers: true, allowMemes: true }
      };
      return { ...prev, teams: [...prev.teams, newTeam], channels: [...prev.channels, generalChannel], messages: { ...prev.messages, [chId]: [] } };
    });
  }, [updateState]);

  const createChat = useCallback((participants, topic = '', _chatId = null) => {
    const chatId = _chatId || ('chat_' + Date.now());
    updateState(prev => {
      const chatType = participants.length > 1 ? 'group' : 'oneOnOne';
      const newChat = {
        chatId, chatType, topic, participants: [prev.currentUser.userId, ...participants.filter(p => p !== prev.currentUser.userId)],
        isPinned: false, isMuted: false, isHidden: false, unreadCount: 0,
        lastMessagePreview: '', lastMessageSenderId: '', lastMessageTimestamp: new Date().toISOString(),
        createdDateTime: new Date().toISOString(), pinnedMessages: [],
        tabs: [{ tabId: 'tab_chat_' + chatId, displayName: 'Chat', type: 'chat', isDefault: true }, { tabId: 'tab_files_' + chatId, displayName: 'Files', type: 'files' }]
      };
      return { ...prev, chats: [newChat, ...prev.chats], messages: { ...prev.messages, [chatId]: [] } };
    });
  }, [updateState]);

  const pinMessage = useCallback((containerId, messageId) => {
    updateState(prev => {
      const chats = prev.chats.map(c => c.chatId === containerId ? { ...c, pinnedMessages: [...c.pinnedMessages, messageId] } : c);
      const channels = prev.channels.map(c => c.channelId === containerId ? { ...c, pinnedMessages: [...c.pinnedMessages, messageId] } : c);
      return { ...prev, chats, channels };
    });
  }, [updateState]);

  const unpinMessage = useCallback((containerId, messageId) => {
    updateState(prev => {
      const chats = prev.chats.map(c => c.chatId === containerId ? { ...c, pinnedMessages: c.pinnedMessages.filter(id => id !== messageId) } : c);
      const channels = prev.channels.map(c => c.channelId === containerId ? { ...c, pinnedMessages: c.pinnedMessages.filter(id => id !== messageId) } : c);
      return { ...prev, chats, channels };
    });
  }, [updateState]);

  const markAsRead = useCallback((containerId) => {
    updateState(prev => {
      const chats = prev.chats.map(c => c.chatId === containerId ? { ...c, unreadCount: 0 } : c);
      const channels = prev.channels.map(c => c.channelId === containerId ? { ...c, unreadCount: 0 } : c);
      return { ...prev, chats, channels };
    });
  }, [updateState]);

  const updatePresence = useCallback((presence) => {
    updateState(prev => ({ ...prev, currentUser: { ...prev.currentUser, presence } }));
  }, [updateState]);

  const updateStatus = useCallback((statusMessage, statusEmoji) => {
    updateState(prev => ({ ...prev, currentUser: { ...prev.currentUser, statusMessage: statusMessage || '', statusEmoji: statusEmoji || '' } }));
  }, [updateState]);

  const updateSettings = useCallback((settingsUpdate) => {
    updateState(prev => {
      const settings = { ...prev.settings };
      for (const k in settingsUpdate) {
        if (typeof settingsUpdate[k] === 'object' && !Array.isArray(settingsUpdate[k])) {
          settings[k] = { ...settings[k], ...settingsUpdate[k] };
        } else {
          settings[k] = settingsUpdate[k];
        }
      }
      return { ...prev, settings };
    });
  }, [updateState]);

  const markAllNotificationsRead = useCallback(() => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true }))
    }));
  }, [updateState]);

  const markNotificationRead = useCallback((notificationId) => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
    }));
  }, [updateState]);

  const bookmarkMessage = useCallback((containerId, messageId) => {
    updateState(prev => {
      const msgs = { ...prev.messages };
      msgs[containerId] = (msgs[containerId] || []).map(m =>
        m.messageId === messageId ? { ...m, isBookmarked: !m.isBookmarked } : m
      );
      return { ...prev, messages: msgs };
    });
  }, [updateState]);

  const createMeeting = useCallback((subject, startDateTime, endDateTime, participantIds, bodyPreview) => {
    updateState(prev => {
      const meetingId = 'meeting_' + Date.now();
      const meeting = {
        meetingId,
        subject,
        startDateTime,
        endDateTime,
        organizer: prev.currentUser.userId,
        participants: [
          { userId: prev.currentUser.userId, role: 'organizer', rsvp: 'accepted' },
          ...participantIds.map(uid => ({ userId: uid, role: 'attendee', rsvp: 'pending' }))
        ],
        isOnline: true,
        joinUrl: `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
        chatId: null,
        bodyPreview: bodyPreview || ''
      };
      return { ...prev, meetings: [...prev.meetings, meeting] };
    });
  }, [updateState]);

  const getDiff = useCallback(() => {
    if (!initialRef.current || !state) return {};
    return computeStateDiff(initialRef.current, state);
  }, [state]);

  const getInitial = useCallback(() => initialRef.current, []);

  if (loading || !state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>Loading...</div>;
  }

  const value = {
    state,
    updateState,
    actions: {
      sendMessage, sendReply, editMessage, deleteMessage,
      addReaction, removeReaction,
      createChannel, createTeam, createChat,
      pinMessage, unpinMessage, markAsRead,
      updatePresence, updateStatus, updateSettings,
      markAllNotificationsRead, markNotificationRead, createMeeting,
      bookmarkMessage
    },
    getDiff,
    getInitial
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
