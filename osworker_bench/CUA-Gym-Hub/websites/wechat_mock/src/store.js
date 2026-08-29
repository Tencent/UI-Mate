
import { create } from 'zustand';
import { getInitialData, saveToStorage, loadFromStorage, fetchCustomState, getSessionId, initializeData, syncInitialStateToServer } from './utils/storage';

// Pre-compute default data so the store can initialize synchronously
const defaultData = getInitialData();
// Deep clone for initial state to prevent mutation
const defaultInitialState = JSON.parse(JSON.stringify(defaultData));

export const useStore = create((set, get) => ({
  // Initialize with default data synchronously so UI renders immediately
  user: defaultData.user,
  contacts: defaultData.contacts,
  conversations: defaultData.conversations,
  messages: defaultData.messages,
  moments: defaultData.moments,
  groups: defaultData.groups || [],
  favorites: defaultData.favorites || [],
  initialState: defaultInitialState,
  _sid: null,
  _initialized: false,

  initialize: async () => {
    // Prevent double initialization
    if (get()._initialized) return;
    set({ _initialized: true });

    const sid = getSessionId();
    set({ _sid: sid });

    // Check localStorage first (preserves initialState across navigations)
    const stored = loadFromStorage(sid);
    if (stored && stored.user) {
      // Use stored initialState if available, otherwise deep clone defaults
      const initialState = stored.initialState || JSON.parse(JSON.stringify(defaultData));
      set({
        user: stored.user,
        contacts: stored.contacts,
        conversations: stored.conversations,
        messages: stored.messages,
        moments: stored.moments,
        groups: stored.groups || [],
        favorites: stored.favorites || [],
        initialState: initialState
      });
      return;
    }

    // Then check for custom state from POST /post (session-aware, e.g. external injection)
    const customState = await fetchCustomState(sid);
    if (customState) {
      const data = initializeData(sid, customState);
      // Deep clone to create independent initial state snapshot
      const initialSnapshot = JSON.parse(JSON.stringify(data));
      set({
        user: data.user,
        contacts: data.contacts,
        conversations: data.conversations,
        messages: data.messages,
        moments: data.moments,
        groups: data.groups || [],
        favorites: data.favorites || [],
        initialState: initialSnapshot
      });
      saveToStorage({ ...data, initialState: initialSnapshot }, sid);
      return;
    }

    // No stored or custom state — use fresh defaults
    const initialData = initializeData(sid, null);
    // Deep clone to create independent initial state snapshot
    const initialSnapshot = JSON.parse(JSON.stringify(initialData));
    set({
      user: initialData.user,
      contacts: initialData.contacts,
      conversations: initialData.conversations,
      messages: initialData.messages,
      moments: initialData.moments,
      groups: initialData.groups || [],
      favorites: initialData.favorites || [],
      initialState: initialSnapshot
    });
    saveToStorage({ ...initialData, initialState: initialSnapshot }, sid);

    // POST initial state to server so /go has a baseline for diff tracking
    syncInitialStateToServer(initialSnapshot, sid);
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
    saveToStorage(get(), get()._sid);
  },

  // --- Conversation actions ---

  pinConversation: (contactId) => {
    const state = get();
    const idx = state.conversations.findIndex(c => c.contactId === contactId);
    if (idx >= 0) {
      const updated = [...state.conversations];
      updated[idx] = { ...updated[idx], isPinned: !updated[idx].isPinned };
      set({ conversations: updated });
      saveToStorage(get(), get()._sid);
    }
  },

  muteConversation: (contactId) => {
    const state = get();
    const idx = state.conversations.findIndex(c => c.contactId === contactId);
    if (idx >= 0) {
      const updated = [...state.conversations];
      updated[idx] = { ...updated[idx], isMuted: !updated[idx].isMuted };
      set({ conversations: updated });
      saveToStorage(get(), get()._sid);
    }
  },

  saveDraft: (contactId, text) => {
    const state = get();
    const idx = state.conversations.findIndex(c => c.contactId === contactId);
    if (idx >= 0) {
      const updated = [...state.conversations];
      updated[idx] = { ...updated[idx], draft: text || '' };
      set({ conversations: updated });
      saveToStorage(get(), get()._sid);
    }
  },

  deleteConversation: (contactId) => {
    const state = get();
    const updatedConversations = state.conversations.filter(c => c.contactId !== contactId);
    set({ conversations: updatedConversations });
    saveToStorage(get(), get()._sid);
  },

  recallMessage: (contactId, messageId) => {
    const state = get();
    const msgs = state.messages[contactId];
    if (!msgs) return;
    const msgIdx = msgs.findIndex(m => m.messageId === messageId);
    if (msgIdx < 0) return;
    const updatedMsgs = [...msgs];
    updatedMsgs[msgIdx] = { ...updatedMsgs[msgIdx], recalled: true, content: '' };
    const updatedMessages = { ...state.messages, [contactId]: updatedMsgs };
    set({ messages: updatedMessages });
    saveToStorage(get(), get()._sid);
  },

  // --- Contact actions ---

  addContact: (contact) => {
    const state = get();
    if (state.contacts.some(c => c.userId === contact.userId)) return;
    set({ contacts: [...state.contacts, contact] });
    saveToStorage(get(), get()._sid);
  },

  removeContact: (userId) => {
    const state = get();
    set({ contacts: state.contacts.filter(c => c.userId !== userId) });
    saveToStorage(get(), get()._sid);
  },

  // --- Group actions ---

  exitGroup: (groupId) => {
    const state = get();
    // Remove user from group members
    const groupIdx = state.groups.findIndex(g => g.groupId === groupId);
    if (groupIdx >= 0) {
      const updatedGroups = [...state.groups];
      updatedGroups[groupIdx] = {
        ...updatedGroups[groupIdx],
        members: updatedGroups[groupIdx].members.filter(id => id !== state.user.userId)
      };
      // Remove group conversation
      const updatedConversations = state.conversations.filter(c => c.contactId !== groupId);
      set({ groups: updatedGroups, conversations: updatedConversations });
      saveToStorage(get(), get()._sid);
    }
  },

  setGroupAnnouncement: (groupId, text) => {
    const state = get();
    const groupIdx = state.groups.findIndex(g => g.groupId === groupId);
    if (groupIdx >= 0) {
      const updatedGroups = [...state.groups];
      updatedGroups[groupIdx] = { ...updatedGroups[groupIdx], announcement: text };
      set({ groups: updatedGroups });
      saveToStorage(get(), get()._sid);
    }
  },

  sendMessage: (contactId, content, type = 'text', extra = {}) => {
    const state = get();
    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();

    const newMessage = {
      messageId,
      senderId: state.user.userId,
      content,
      type,
      timestamp,
      isSelf: true,
      ...extra
    };

    const conversationMessages = state.messages[contactId] || [];
    const updatedMessages = {
      ...state.messages,
      [contactId]: [...conversationMessages, newMessage]
    };

    let displayContent = content;
    if (type === 'image') {
      displayContent = '[图片]';
    } else if (type === 'file') {
      displayContent = '[文件]';
    } else if (type === 'hongbao') {
      displayContent = '[微信红包]';
    } else if (type === 'voice') {
      displayContent = '[语音]';
    } else if (type === 'location') {
      displayContent = '[位置]';
    } else if (type === 'transfer') {
      displayContent = '[转账]';
    }

    const conversationIndex = state.conversations.findIndex(c => c.contactId === contactId);
    let updatedConversations = [...state.conversations];

    if (conversationIndex >= 0) {
      const conv = updatedConversations[conversationIndex];
      updatedConversations.splice(conversationIndex, 1);
      updatedConversations.unshift({
        ...conv,
        lastMessage: displayContent,
        lastTime: timestamp,
        draft: ''
      });
    } else {
      updatedConversations.unshift({
        contactId,
        lastMessage: displayContent,
        lastTime: timestamp,
        unreadCount: 0,
        isGroup: false,
        isPinned: false,
        isMuted: false,
        draft: ''
      });
    }

    set({
      messages: updatedMessages,
      conversations: updatedConversations
    });
    saveToStorage(get(), get()._sid);

    // Auto-reply for individual chats
    if (!contactId.startsWith('group_')) {
      setTimeout(() => {
        get().receiveMessage(contactId);
      }, 2000 + Math.random() * 3000);
    }
  },

  receiveMessage: (contactId) => {
    const state = get();
    const contact = state.contacts.find(c => c.userId === contactId);
    if (!contact) return;

    const replies = [
      '好的，收到了！',
      '哈哈哈',
      '在忙，稍后回复你',
      '明白了',
      '没问题！',
      '好的呢',
      '让我想想',
      '可以的',
      '嗯嗯'
    ];

    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();

    const newMessage = {
      messageId,
      senderId: contactId,
      content: replies[Math.floor(Math.random() * replies.length)],
      type: 'text',
      timestamp,
      isSelf: false
    };

    const conversationMessages = state.messages[contactId] || [];
    const updatedMessages = {
      ...state.messages,
      [contactId]: [...conversationMessages, newMessage]
    };

    const conversationIndex = state.conversations.findIndex(c => c.contactId === contactId);
    let updatedConversations = [...state.conversations];

    if (conversationIndex >= 0) {
      const conv = updatedConversations[conversationIndex];
      updatedConversations.splice(conversationIndex, 1);
      updatedConversations.unshift({
        ...conv,
        lastMessage: newMessage.content,
        lastTime: timestamp,
        unreadCount: conv.unreadCount + 1
      });
    }

    set({
      messages: updatedMessages,
      conversations: updatedConversations
    });
    saveToStorage(get(), get()._sid);
  },

  markAsRead: (contactId) => {
    const state = get();
    const conversationIndex = state.conversations.findIndex(c => c.contactId === contactId);
    if (conversationIndex >= 0) {
      const updatedConversations = [...state.conversations];
      updatedConversations[conversationIndex] = {
        ...updatedConversations[conversationIndex],
        unreadCount: 0
      };
      set({ conversations: updatedConversations });
      saveToStorage(get(), get()._sid);
    }
  },

  clearChatHistory: (contactId) => {
    const state = get();
    const updatedMessages = { ...state.messages };
    delete updatedMessages[contactId];

    const updatedConversations = state.conversations.filter(c => c.contactId !== contactId);

    set({
      messages: updatedMessages,
      conversations: updatedConversations
    });
    saveToStorage(get(), get()._sid);
  },

  addMoment: (content, images, location = '') => {
    const state = get();
    const postId = Date.now().toString();
    const timestamp = new Date().toISOString();

    const newMoment = {
      postId,
      userId: state.user.userId,
      content,
      images,
      timestamp,
      likes: [],
      comments: [],
      location
    };

    set({ moments: [newMoment, ...state.moments] });
    saveToStorage(get(), get()._sid);
  },

  deleteMoment: (postId) => {
    const state = get();
    set({ moments: state.moments.filter(m => m.postId !== postId) });
    saveToStorage(get(), get()._sid);
  },

  toggleLike: (postId) => {
    const state = get();
    const momentIndex = state.moments.findIndex(m => m.postId === postId);
    if (momentIndex >= 0) {
      const moment = state.moments[momentIndex];
      const userLiked = moment.likes.includes(state.user.userId);
      const updatedLikes = userLiked
        ? moment.likes.filter(id => id !== state.user.userId)
        : [...moment.likes, state.user.userId];

      const updatedMoments = [...state.moments];
      updatedMoments[momentIndex] = {
        ...moment,
        likes: updatedLikes
      };

      set({ moments: updatedMoments });
      saveToStorage(get(), get()._sid);
    }
  },

  addComment: (postId, content, replyTo = null) => {
    const state = get();
    const momentIndex = state.moments.findIndex(m => m.postId === postId);
    if (momentIndex >= 0) {
      const moment = state.moments[momentIndex];
      const newComment = {
        commentId: Date.now().toString(),
        userId: state.user.userId,
        content,
        timestamp: new Date().toISOString(),
        ...(replyTo ? { replyTo } : {})
      };

      const updatedMoments = [...state.moments];
      updatedMoments[momentIndex] = {
        ...moment,
        comments: [...moment.comments, newComment]
      };

      set({ moments: updatedMoments });
      saveToStorage(get(), get()._sid);
    }
  },

  createGroup: (name, memberIds) => {
    const state = get();
    const groupId = `group_${Date.now()}`;
    const newGroup = {
      groupId,
      name,
      avatar: `https://picsum.photos/100/100?random=${Date.now()}`,
      members: [state.user.userId, ...memberIds],
      createdAt: new Date().toISOString(),
      createdBy: state.user.userId,
      description: '',
      announcement: ''
    };

    const updatedGroups = [...state.groups, newGroup];
    const updatedMessages = { ...state.messages, [groupId]: [] };

    set({
      groups: updatedGroups,
      messages: updatedMessages
    });
    saveToStorage(get(), get()._sid);
    return groupId;
  },

  sendGroupMessage: (groupId, content, type = 'text', extra = {}) => {
    const state = get();
    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();

    const newMessage = {
      messageId,
      senderId: state.user.userId,
      content,
      type,
      timestamp,
      isSelf: true,
      ...extra
    };

    const groupMessages = state.messages[groupId] || [];
    const updatedMessages = {
      ...state.messages,
      [groupId]: [...groupMessages, newMessage]
    };

    let displayContent = content;
    if (type === 'image') {
      displayContent = '[图片]';
    } else if (type === 'file') {
      displayContent = '[文件]';
    } else if (type === 'location') {
      displayContent = '[位置]';
    } else if (type === 'transfer') {
      displayContent = '[转账]';
    } else if (type === 'voice') {
      displayContent = '[语音]';
    } else if (type === 'hongbao') {
      displayContent = '[微信红包]';
    }

    const conversationIndex = state.conversations.findIndex(c => c.contactId === groupId);
    let updatedConversations = [...state.conversations];

    if (conversationIndex >= 0) {
      const conv = updatedConversations[conversationIndex];
      updatedConversations.splice(conversationIndex, 1);
      updatedConversations.unshift({
        ...conv,
        lastMessage: displayContent,
        lastTime: timestamp,
        draft: ''
      });
    } else {
      updatedConversations.unshift({
        contactId: groupId,
        lastMessage: displayContent,
        lastTime: timestamp,
        unreadCount: 0,
        isGroup: true,
        isPinned: false,
        isMuted: false,
        draft: ''
      });
    }

    set({
      messages: updatedMessages,
      conversations: updatedConversations
    });
    saveToStorage(get(), get()._sid);

    setTimeout(() => {
      get().receiveGroupMessage(groupId);
    }, 2000 + Math.random() * 3000);
  },

  receiveGroupMessage: (groupId) => {
    const state = get();
    const group = state.groups.find(g => g.groupId === groupId);
    if (!group) return;

    const otherMembers = group.members.filter(id => id !== state.user.userId);
    if (otherMembers.length === 0) return;

    const senderId = otherMembers[Math.floor(Math.random() * otherMembers.length)];
    const sender = state.contacts.find(c => c.userId === senderId);
    if (!sender) return;

    const replies = [
      '收到了！',
      '好的',
      '没问题',
      '哈哈哈',
      '在呢',
      '明白了',
      '可以的'
    ];

    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();

    const newMessage = {
      messageId,
      senderId,
      content: replies[Math.floor(Math.random() * replies.length)],
      type: 'text',
      timestamp,
      isSelf: false
    };

    const groupMessages = state.messages[groupId] || [];
    const updatedMessages = {
      ...state.messages,
      [groupId]: [...groupMessages, newMessage]
    };

    const conversationIndex = state.conversations.findIndex(c => c.contactId === groupId);
    let updatedConversations = [...state.conversations];

    if (conversationIndex >= 0) {
      const conv = updatedConversations[conversationIndex];
      updatedConversations.splice(conversationIndex, 1);
      updatedConversations.unshift({
        ...conv,
        lastMessage: `${sender.nickname}: ${newMessage.content}`,
        lastTime: timestamp,
        unreadCount: conv.unreadCount + 1
      });
    }

    set({
      messages: updatedMessages,
      conversations: updatedConversations
    });
    saveToStorage(get(), get()._sid);
  },

  updateGroup: (groupId, updates) => {
    const state = get();
    const groupIndex = state.groups.findIndex(g => g.groupId === groupId);
    if (groupIndex >= 0) {
      const updatedGroups = [...state.groups];
      updatedGroups[groupIndex] = {
        ...updatedGroups[groupIndex],
        ...updates
      };
      set({ groups: updatedGroups });
      saveToStorage(get(), get()._sid);
    }
  },

  addGroupMember: (groupId, userId) => {
    const state = get();
    const groupIndex = state.groups.findIndex(g => g.groupId === groupId);
    if (groupIndex >= 0) {
      const group = state.groups[groupIndex];
      if (!group.members.includes(userId)) {
        const updatedGroups = [...state.groups];
        updatedGroups[groupIndex] = {
          ...group,
          members: [...group.members, userId]
        };
        set({ groups: updatedGroups });
        saveToStorage(get(), get()._sid);
      }
    }
  },

  removeGroupMember: (groupId, userId) => {
    const state = get();
    const groupIndex = state.groups.findIndex(g => g.groupId === groupId);
    if (groupIndex >= 0) {
      const group = state.groups[groupIndex];
      const updatedGroups = [...state.groups];
      updatedGroups[groupIndex] = {
        ...group,
        members: group.members.filter(id => id !== userId)
      };
      set({ groups: updatedGroups });
      saveToStorage(get(), get()._sid);
    }
  },

  getStateDiff: () => {
    const state = get();
    const initial = state.initialState || {};
    const current = {
      user: state.user,
      contacts: state.contacts,
      conversations: state.conversations,
      messages: state.messages,
      moments: state.moments,
      groups: state.groups,
      favorites: state.favorites
    };

    const diff = {};

    if (JSON.stringify(initial.user) !== JSON.stringify(current.user)) {
      diff.user = { initial: initial.user, current: current.user };
    }

    if (JSON.stringify(initial.contacts) !== JSON.stringify(current.contacts)) {
      diff.contacts = {
        added: current.contacts.filter(c =>
          !initial.contacts?.some(ic => ic.userId === c.userId)
        ),
        removed: (initial.contacts || []).filter(ic =>
          !current.contacts.some(c => c.userId === ic.userId)
        ),
        modified: current.contacts.filter(c => {
          const ic = initial.contacts?.find(ic => ic.userId === c.userId);
          return ic && JSON.stringify(ic) !== JSON.stringify(c);
        })
      };
    }

    if (JSON.stringify(initial.conversations) !== JSON.stringify(current.conversations)) {
      diff.conversations = {
        added: current.conversations.filter(c =>
          !initial.conversations?.some(ic => ic.contactId === c.contactId)
        ),
        removed: (initial.conversations || []).filter(ic =>
          !current.conversations.some(c => c.contactId === ic.contactId)
        ),
        modified: current.conversations.filter(c => {
          const ic = initial.conversations?.find(ic => ic.contactId === c.contactId);
          return ic && JSON.stringify(ic) !== JSON.stringify(c);
        })
      };
    }

    if (JSON.stringify(initial.messages) !== JSON.stringify(current.messages)) {
      diff.messages = {
        newConversations: Object.keys(current.messages).filter(k => !initial.messages?.[k]),
        newMessages: Object.keys(current.messages).reduce((acc, key) => {
          const initialCount = initial.messages?.[key]?.length || 0;
          const currentCount = current.messages[key]?.length || 0;
          if (currentCount > initialCount) {
            acc[key] = currentCount - initialCount;
          }
          return acc;
        }, {}),
        recalledMessages: Object.keys(current.messages).reduce((acc, key) => {
          const currentMsgs = current.messages[key] || [];
          const initialMsgs = initial.messages?.[key] || [];
          const recalled = currentMsgs.filter(m => {
            const im = initialMsgs.find(im => im.messageId === m.messageId);
            return m.recalled && (!im || !im.recalled);
          });
          if (recalled.length > 0) acc[key] = recalled.length;
          return acc;
        }, {})
      };
    }

    if (JSON.stringify(initial.moments) !== JSON.stringify(current.moments)) {
      diff.moments = {
        added: current.moments.filter(m =>
          !initial.moments?.some(im => im.postId === m.postId)
        ).length,
        removed: (initial.moments || []).filter(im =>
          !current.moments.some(m => m.postId === im.postId)
        ).length,
        modified: current.moments.filter(m => {
          const im = initial.moments?.find(im => im.postId === m.postId);
          return im && JSON.stringify(im) !== JSON.stringify(m);
        }).length
      };
    }

    if (JSON.stringify(initial.groups) !== JSON.stringify(current.groups)) {
      diff.groups = {
        added: current.groups.filter(g =>
          !initial.groups?.some(ig => ig.groupId === g.groupId)
        ),
        modified: current.groups.filter(g => {
          const ig = initial.groups?.find(ig => ig.groupId === g.groupId);
          return ig && JSON.stringify(ig) !== JSON.stringify(g);
        })
      };
    }

    if (JSON.stringify(initial.favorites) !== JSON.stringify(current.favorites)) {
      diff.favorites = {
        added: (current.favorites || []).filter(f =>
          !(initial.favorites || []).some(ifav => ifav.favoriteId === f.favoriteId)
        ).length,
        removed: (initial.favorites || []).filter(ifav =>
          !(current.favorites || []).some(f => f.favoriteId === ifav.favoriteId)
        ).length
      };
    }

    return diff;
  }
}));
