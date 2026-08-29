
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeData, getInitialState, fetchCustomState, getSessionId, saveState } from '../utils/dataManager';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState(null);
  const [toast, setToast] = useState(null);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);
  const baselineSynced = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      // Check BEFORE initializeData if session data already exists in localStorage
      const sessionKey = `slackCloneInitialState_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        // Refresh: use existing session localStorage (preserves agent's changes)
        const data = initializeData(sid);
        setState(data);
        setLoading(false);
      } else {
        // First load: fetch custom state from server, then initialize
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setLoading(false);
        });
      }
    } else {
      // No sid: backward compatible default behavior
      const data = initializeData();
      setState(data);
      setLoading(false);
    }
  }, []);

  const updateState = (updates) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      saveState(newState, sidRef.current);
      return newState;
    });
  };

  // Create the server-side initial_state before the first user mutation, then
  // let saveState write later changes through set_current.
  useEffect(() => {
    if (!state || loading || baselineSynced.current) return;
    baselineSynced.current = true;
    const sid = sidRef.current;
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state, merge: false })
    }).catch(() => {});
  }, [state, loading]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addMessage = (channelId, dmId, content, threadId = null) => {
    if (!state || !state.currentUser) {
      console.error('Cannot add message: state not initialized');
      return null;
    }

    const newMessage = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: state.currentUser.userId,
      content,
      timestamp: new Date().toISOString(),
      threadId,
      reactions: [],
      attachments: [],
      isEdited: false
    };

    const messages = { ...state.messages };
    const key = channelId || dmId;

    if (!messages[key]) {
      messages[key] = [];
    }
    messages[key].push(newMessage);

    if (threadId) {
      const threads = { ...state.threads };
      if (threads[threadId]) {
        threads[threadId].replies.push(newMessage.messageId);
      }
      updateState({ messages, threads });
    } else {
      updateState({ messages });
    }

    if (dmId) {
      const dms = state.dms.map(dm =>
        dm.dmId === dmId
          ? { ...dm, lastMessage: content, lastTime: new Date().toISOString(), unreadCount: 0 }
          : dm
      );
      updateState({ dms });
    }

    return newMessage;
  };

  const addReaction = (messageId, channelId, dmId, emoji) => {
    if (!state || !state.currentUser || !state.messages) {
      console.error('Cannot add reaction: state not initialized');
      return;
    }

    const messages = { ...state.messages };
    const key = channelId || dmId;
    const messageList = messages[key];

    if (!messageList) {
      console.error('Cannot add reaction: message list not found');
      return;
    }

    const messageIndex = messageList.findIndex(m => m.messageId === messageId);
    if (messageIndex !== -1) {
      const message = { ...messageList[messageIndex] };
      const existingReaction = message.reactions.find(r => r.emoji === emoji);

      if (existingReaction) {
        const userIndex = existingReaction.users.indexOf(state.currentUser.userId);
        if (userIndex > -1) {
          existingReaction.users.splice(userIndex, 1);
          if (existingReaction.users.length === 0) {
            message.reactions = message.reactions.filter(r => r.emoji !== emoji);
          }
        } else {
          existingReaction.users.push(state.currentUser.userId);
        }
      } else {
        message.reactions.push({
          emoji,
          users: [state.currentUser.userId]
        });
      }

      messageList[messageIndex] = message;
      messages[key] = messageList;
      updateState({ messages });
    }
  };

  const toggleChannelStar = (channelId) => {
    const channels = state.channels.map(ch =>
      ch.channelId === channelId ? { ...ch, isStarred: !ch.isStarred } : ch
    );
    updateState({ channels });
    showToast(channels.find(ch => ch.channelId === channelId).isStarred ? 'Channel starred' : 'Channel unstarred');
  };

  const updateUserProfile = (updates) => {
    const currentUser = { ...state.currentUser, ...updates };
    const users = state.users.map(u =>
      u.userId === currentUser.userId ? currentUser : u
    );
    updateState({ currentUser, users });
    showToast('Profile updated successfully');
  };

  const createThread = (messageId, channelId, dmId) => {
    const threadId = `thread_${Date.now()}`;
    const threads = {
      ...state.threads,
      [threadId]: {
        threadId,
        parentMessageId: messageId,
        channelId: channelId || null,
        dmId: dmId || null,
        replies: [],
        followers: [state.currentUser.userId]
      }
    };
    updateState({ threads });
    setActiveThread(threadId);
    return threadId;
  };

  const toggleThreadFollow = (threadId) => {
    const threads = { ...state.threads };
    const thread = threads[threadId];
    const userId = state.currentUser.userId;

    if (thread.followers.includes(userId)) {
      thread.followers = thread.followers.filter(id => id !== userId);
      showToast('Thread unfollowed');
    } else {
      thread.followers.push(userId);
      showToast('Thread followed');
    }

    updateState({ threads });
  };

  const editMessage = (messageId, channelId, dmId, newContent) => {
    const messages = { ...state.messages };
    const key = channelId || dmId;
    const messageList = messages[key];

    const messageIndex = messageList.findIndex(m => m.messageId === messageId);
    if (messageIndex !== -1) {
      messageList[messageIndex] = {
        ...messageList[messageIndex],
        content: newContent,
        isEdited: true
      };
      messages[key] = messageList;
      updateState({ messages });
      showToast('Message updated');
    }
  };

  const deleteMessage = (messageId, channelId, dmId) => {
    const messages = { ...state.messages };
    const key = channelId || dmId;
    messages[key] = messages[key].filter(m => m.messageId !== messageId);
    updateState({ messages });
    showToast('Message deleted');
  };

  const addMessageWithAttachments = (channelId, dmId, content, attachments = [], mentions = [], threadId = null) => {
    if (!state || !state.currentUser) {
      console.error('Cannot add message with attachments: state not initialized');
      return null;
    }

    const newMessage = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: state.currentUser.userId,
      content,
      timestamp: new Date().toISOString(),
      threadId,
      reactions: [],
      attachments,
      mentions,
      isEdited: false
    };

    const messages = { ...state.messages };
    const key = channelId || dmId;

    if (!messages[key]) {
      messages[key] = [];
    }
    messages[key].push(newMessage);

    if (threadId) {
      const threads = { ...state.threads };
      if (threads[threadId]) {
        threads[threadId].replies.push(newMessage.messageId);
      }
      updateState({ messages, threads });
    } else {
      updateState({ messages });
    }

    if (dmId) {
      const dms = state.dms.map(dm =>
        dm.dmId === dmId
          ? { ...dm, lastMessage: content, lastTime: new Date().toISOString(), unreadCount: 0 }
          : dm
      );
      updateState({ dms });
    }

    if (mentions.length > 0) {
      const newNotifications = mentions.filter(userId => userId !== state.currentUser.userId).map(userId => ({
        notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'mention',
        messageId: newMessage.messageId,
        channelId,
        dmId,
        userId,
        timestamp: new Date().toISOString(),
        read: false
      }));
      updateState({ notifications: [...state.notifications, ...newNotifications] });
    }

    return newMessage;
  };

  const toggleBookmark = (messageId) => {
    const bookmarked = state.bookmarkedMessages || [];
    const isBookmarked = bookmarked.includes(messageId);
    const newBookmarks = isBookmarked
      ? bookmarked.filter(id => id !== messageId)
      : [...bookmarked, messageId];
    updateState({ bookmarkedMessages: newBookmarks });
    showToast(isBookmarked ? 'Bookmark removed' : 'Message bookmarked');
  };

  const togglePinMessage = (messageId, channelId) => {
    const channels = state.channels.map(ch => {
      if (ch.channelId === channelId) {
        const pinned = ch.pinnedMessages || [];
        const isPinned = pinned.includes(messageId);
        return {
          ...ch,
          pinnedMessages: isPinned
            ? pinned.filter(id => id !== messageId)
            : [...pinned, messageId]
        };
      }
      return ch;
    });
    updateState({ channels });
    const channel = channels.find(ch => ch.channelId === channelId);
    const isPinned = (channel.pinnedMessages || []).includes(messageId);
    showToast(isPinned ? 'Message pinned' : 'Message unpinned');
  };

  const joinChannel = (channelId) => {
    const channels = state.channels.map(ch => {
      if (ch.channelId === channelId && !ch.members.includes(state.currentUser.userId)) {
        return {
          ...ch,
          members: [...ch.members, state.currentUser.userId]
        };
      }
      return ch;
    });
    updateState({ channels });
    showToast('Joined channel successfully');
  };

  const leaveChannel = (channelId) => {
    const channels = state.channels.map(ch => {
      if (ch.channelId === channelId) {
        return {
          ...ch,
          members: ch.members.filter(id => id !== state.currentUser.userId)
        };
      }
      return ch;
    });
    updateState({ channels });
    showToast('Left channel');
  };

  const updateChannelDescription = (channelId, description) => {
    const channels = state.channels.map(ch => {
      if (ch.channelId === channelId) {
        return { ...ch, description };
      }
      return ch;
    });
    updateState({ channels });
    showToast('Channel description updated');
  };

  const updateChannelTopic = (channelId, topic) => {
    const channels = state.channels.map(ch => {
      if (ch.channelId === channelId) {
        return { ...ch, topic };
      }
      return ch;
    });
    updateState({ channels });
    showToast('Channel topic updated');
  };

  const startCall = (dmId, type) => {
    const dm = state.dms.find(d => d.dmId === dmId);
    const callId = `call_${Date.now()}`;
    const call = {
      callId,
      type,
      participants: dm.participants,
      dmId,
      startTime: new Date().toISOString(),
      duration: 0,
      status: 'calling'
    };
    const callHistory = [...(state.callHistory || []), call];
    updateState({ callHistory });
    return callId;
  };

  const endCall = (callId, duration) => {
    const callHistory = (state.callHistory || []).map(call => {
      if (call.callId === callId) {
        return {
          ...call,
          duration,
          status: 'completed',
          endTime: new Date().toISOString()
        };
      }
      return call;
    });
    updateState({ callHistory });
    showToast('Call ended');
  };

  const updateSettings = (newSettings) => {
    const settings = { ...state.settings, ...newSettings };
    updateState({ settings });
    showToast('Settings updated');
  };

  const sendInvitation = (email) => {
    const invitation = {
      invitationId: `inv_${Date.now()}`,
      email,
      sentBy: state.currentUser.userId,
      sentAt: new Date().toISOString(),
      status: 'pending'
    };
    const invitations = [...(state.invitations || []), invitation];
    updateState({ invitations });
    showToast(`Invitation sent to ${email}`);
  };

  const markNotificationAsRead = (notificationId) => {
    const notifications = (state.notifications || []).map(notif => {
      if (notif.notificationId === notificationId) {
        return { ...notif, read: true };
      }
      return notif;
    });
    updateState({ notifications });
  };

  const clearAllNotifications = () => {
    updateState({ notifications: [] });
    showToast('All notifications cleared');
  };

  const createChannel = (name, description, isPrivate) => {
    if (!state || !state.currentUser) {
      console.error('Cannot create channel: state not initialized');
      return null;
    }

    const channelId = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newChannel = {
      channelId,
      name,
      description: description || '',
      isPrivate: isPrivate || false,
      isStarred: false,
      members: [state.currentUser.userId],
      pinnedMessages: [],
      createdAt: new Date().toISOString(),
      createdBy: state.currentUser.userId
    };

    const channels = [...state.channels, newChannel];
    const messages = { ...state.messages, [channelId]: [] };

    updateState({ channels, messages });
    showToast(`Channel #${name} created successfully`);

    return channelId;
  };

  const signOut = () => {
    localStorage.removeItem('slackCloneState');
    localStorage.removeItem('slackCloneInitialState');
    window.location.reload();
  };

  const createDM = (userId) => {
    if (!state || !state.currentUser) {
      console.error('Cannot create DM: state not initialized');
      return null;
    }

    // Check if DM already exists
    const existing = state.dms.find(d =>
      d.participants.includes(userId) && d.participants.includes(state.currentUser.userId)
    );
    if (existing) return existing.dmId;

    const dmId = `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDM = {
      dmId,
      participants: [state.currentUser.userId, userId],
      lastMessage: '',
      lastTime: new Date().toISOString(),
      unreadCount: 0,
      isMuted: false,
      isArchived: false
    };

    const dms = [...state.dms, newDM];
    const messages = { ...state.messages, [dmId]: [] };
    updateState({ dms, messages });
    return dmId;
  };

  const value = {
    state,
    loading,
    activeThread,
    setActiveThread,
    updateState,
    addMessage,
    addMessageWithAttachments,
    addReaction,
    toggleChannelStar,
    updateUserProfile,
    createThread,
    toggleThreadFollow,
    editMessage,
    deleteMessage,
    toggleBookmark,
    togglePinMessage,
    joinChannel,
    leaveChannel,
    updateChannelDescription,
    updateChannelTopic,
    createChannel,
    createDM,
    startCall,
    endCall,
    updateSettings,
    sendInvitation,
    markNotificationAsRead,
    clearAllNotifications,
    signOut,
    showToast,
    getInitialState
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
};
