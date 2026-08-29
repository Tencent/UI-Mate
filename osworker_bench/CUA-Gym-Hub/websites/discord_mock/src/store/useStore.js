import { create } from 'zustand';
import { INITIAL_STATE, getSessionId, saveState, initializeData, fetchCustomState, getSavedInitialState } from '../data/initialState';
import { generateId } from '../lib/utils';

// Get session id once at module load
const _sid = getSessionId();

export const useStore = create(
  (set, get) => ({
    ...INITIAL_STATE,

    // Internal flag for loading state
    _loading: true,
    _initialStateSnapshot: null,

    // Hydrate action: called once from App on mount
    _hydrate: async () => {
      const sid = _sid;
      if (sid) {
        const sessionKey = `discord_mock_initialState_${sid}`;
        const isRefresh = localStorage.getItem(sessionKey) !== null;

        if (isRefresh) {
          const data = initializeData(sid);
          set({ ...data, _loading: false, _initialStateSnapshot: getSavedInitialState(sid) || JSON.parse(JSON.stringify(INITIAL_STATE)) });
        } else {
          const custom = await fetchCustomState(sid);
          const data = initializeData(sid, custom);
          set({ ...data, _loading: false, _initialStateSnapshot: getSavedInitialState(sid) || JSON.parse(JSON.stringify(INITIAL_STATE)) });
        }
      } else {
        const data = initializeData();
        set({ ...data, _loading: false, _initialStateSnapshot: getSavedInitialState(null) || JSON.parse(JSON.stringify(INITIAL_STATE)) });
      }
    },

    // Actions
    resetStore: () => set(INITIAL_STATE),

    sendMessage: (channelId, content, options = {}) => {
      const newMsgId = generateId();
      const currentUser = get().currentUser;

      const newMessage = {
        id: newMsgId,
        channelId,
        userId: currentUser.id,
        content,
        timestamp: new Date().toISOString(),
        editedTimestamp: null,
        reactions: {},
        attachments: options.attachments || [],
        embeds: [],
        mentions: options.mentions || [],
        mentionEveryone: false,
        pinned: false,
        type: options.referencedMessageId ? 'reply' : 'default',
        referencedMessageId: options.referencedMessageId || null,
        threadId: null,
        isEdited: false
      };

      set((state) => ({
        messages: { ...state.messages, [newMsgId]: newMessage }
      }));

      return newMsgId;
    },

    editMessage: (messageId, newContent) => {
      set((state) => {
        const message = state.messages[messageId];
        if (!message) return state;
        return {
          messages: {
            ...state.messages,
            [messageId]: {
              ...message,
              content: newContent,
              isEdited: true,
              editedTimestamp: new Date().toISOString()
            }
          }
        };
      });
    },

    deleteMessage: (messageId) => {
      set((state) => {
        const newMessages = { ...state.messages };
        delete newMessages[messageId];
        return { messages: newMessages };
      });
    },

    addReaction: (messageId, emoji) => {
      const currentUser = get().currentUser;
      set((state) => {
        const message = state.messages[messageId];
        if (!message) return state;
        const currentReactions = message.reactions[emoji] || [];

        if (currentReactions.includes(currentUser.id)) {
          const newReactions = currentReactions.filter(id => id !== currentUser.id);
          const updatedReactions = { ...message.reactions };
          if (newReactions.length === 0) {
            delete updatedReactions[emoji];
          } else {
            updatedReactions[emoji] = newReactions;
          }
          return {
            messages: {
              ...state.messages,
              [messageId]: { ...message, reactions: updatedReactions }
            }
          };
        } else {
          return {
            messages: {
              ...state.messages,
              [messageId]: {
                ...message,
                reactions: {
                  ...message.reactions,
                  [emoji]: [...currentReactions, currentUser.id]
                }
              }
            }
          };
        }
      });
    },

    togglePinMessage: (messageId) => {
      set((state) => {
        const message = state.messages[messageId];
        if (!message) return state;
        const newPinned = !message.pinned;
        const channel = state.channels[message.channelId];
        if (!channel) return state;

        const newPinnedIds = newPinned
          ? [...(channel.pinnedMessageIds || []), messageId]
          : (channel.pinnedMessageIds || []).filter(id => id !== messageId);

        return {
          messages: {
            ...state.messages,
            [messageId]: { ...message, pinned: newPinned }
          },
          channels: {
            ...state.channels,
            [message.channelId]: { ...channel, pinnedMessageIds: newPinnedIds }
          }
        };
      });
    },

    createThread: (messageId, name) => {
      const id = generateId();
      const message = get().messages[messageId];

      if (!message) return;

      const newThread = {
        id,
        channelId: message.channelId,
        messageId,
        name,
        ownerId: get().currentUser.id,
        messages: [],
        messageCount: 0,
        memberCount: 1,
        archived: false,
        locked: false,
        createdAt: new Date().toISOString()
      };

      set((state) => ({
        threads: { ...state.threads, [id]: newThread },
        messages: {
          ...state.messages,
          [messageId]: { ...message, threadId: id, type: 'thread_starter' }
        }
      }));

      return id;
    },

    sendThreadMessage: (threadId, content) => {
      const newMsgId = generateId();
      const currentUser = get().currentUser;

      const newMessage = {
        id: newMsgId,
        channelId: threadId,
        userId: currentUser.id,
        content,
        timestamp: new Date().toISOString(),
        editedTimestamp: null,
        reactions: {},
        attachments: [],
        embeds: [],
        mentions: [],
        mentionEveryone: false,
        pinned: false,
        type: 'default',
        referencedMessageId: null,
        threadId: null,
        isEdited: false
      };

      set((state) => {
        const thread = state.threads[threadId];
        if (!thread) return state;
        return {
          threads: {
            ...state.threads,
            [threadId]: {
              ...thread,
              messages: [...thread.messages, newMessage],
              messageCount: thread.messageCount + 1
            }
          }
        };
      });
    },

    // DM messaging
    sendDMMessage: (dmId, content) => {
      const newMsgId = generateId();
      const currentUser = get().currentUser;

      const newMessage = {
        id: newMsgId,
        channelId: dmId,
        userId: currentUser.id,
        content,
        timestamp: new Date().toISOString(),
        editedTimestamp: null,
        reactions: {},
        attachments: [],
        embeds: [],
        mentions: [],
        mentionEveryone: false,
        pinned: false,
        type: 'default',
        referencedMessageId: null,
        threadId: null,
        isEdited: false
      };

      set((state) => {
        const dm = state.dmConversations[dmId];
        if (!dm) return state;
        return {
          dmConversations: {
            ...state.dmConversations,
            [dmId]: {
              ...dm,
              messages: [...dm.messages, newMessage],
              lastMessageTimestamp: newMessage.timestamp
            }
          }
        };
      });

      // Auto-reply after 2 seconds
      const dm = get().dmConversations[dmId];
      if (dm) {
        const recipientId = dm.recipientId;
        const recipient = get().users[recipientId];
        if (recipient && !recipient.isBot) {
          setTimeout(() => {
            const replies = [
              'Sounds good!',
              'I\'ll look into that.',
              'Thanks for letting me know!',
              'Got it, I\'ll get back to you on that.',
              'Interesting, tell me more!',
              'Haha, nice one 😄',
              'Sure thing!',
              'Let me check and get back to you.',
            ];
            const replyContent = replies[Math.floor(Math.random() * replies.length)];
            const replyId = generateId();

            const replyMessage = {
              id: replyId,
              channelId: dmId,
              userId: recipientId,
              content: replyContent,
              timestamp: new Date().toISOString(),
              editedTimestamp: null,
              reactions: {},
              attachments: [],
              embeds: [],
              mentions: [],
              mentionEveryone: false,
              pinned: false,
              type: 'default',
              referencedMessageId: null,
              threadId: null,
              isEdited: false
            };

            set((state) => {
              const currentDm = state.dmConversations[dmId];
              if (!currentDm) return state;
              return {
                dmConversations: {
                  ...state.dmConversations,
                  [dmId]: {
                    ...currentDm,
                    messages: [...currentDm.messages, replyMessage],
                    lastMessageTimestamp: replyMessage.timestamp
                  }
                }
              };
            });
          }, 3000);
        }
      }
    },

    createServer: (name) => {
      const id = generateId();
      const generalChannelId = generateId();

      const newServer = {
        id,
        name,
        icon: `https://picsum.photos/seed/${id}/64/64`,
        ownerId: get().currentUser.id,
        channels: [generalChannelId],
        roles: [],
        members: [get().currentUser.id],
        categories: [{ id: generateId(), name: 'TEXT CHANNELS', channelIds: [generalChannelId] }],
        description: '',
        boostCount: 0,
        boostTier: 0
      };

      const newChannel = {
        id: generalChannelId,
        serverId: id,
        name: 'general',
        type: 'text',
        category: 'TEXT CHANNELS',
        topic: null,
        position: 0,
        isNsfw: false,
        slowMode: 0,
        pinnedMessageIds: [],
        lastMessageId: null,
        unreadCount: 0,
        permissions: {}
      };

      set((state) => ({
        servers: { ...state.servers, [id]: newServer },
        channels: { ...state.channels, [generalChannelId]: newChannel }
      }));

      return id;
    },

    createChannel: (serverId, name, type = 'text', category = 'TEXT CHANNELS') => {
      const id = generateId();
      const newChannel = {
        id,
        serverId,
        name: name.toLowerCase().replace(/\s+/g, '-'),
        type,
        category,
        topic: null,
        position: 0,
        isNsfw: false,
        slowMode: 0,
        pinnedMessageIds: [],
        lastMessageId: null,
        unreadCount: 0,
        permissions: {}
      };

      set((state) => {
        const server = state.servers[serverId];
        if (!server) return state;

        // Update categories array to include this channel
        let newCategories = server.categories ? [...server.categories] : [];
        const catIdx = newCategories.findIndex(c => c.name === category);
        if (catIdx >= 0) {
          newCategories = newCategories.map((c, i) =>
            i === catIdx ? { ...c, channelIds: [...c.channelIds, id] } : c
          );
        } else {
          newCategories = [...newCategories, { id: id + '-cat', name: category, channelIds: [id] }];
        }

        return {
          channels: { ...state.channels, [id]: newChannel },
          servers: {
            ...state.servers,
            [serverId]: {
              ...server,
              channels: [...server.channels, id],
              categories: newCategories
            }
          }
        };
      });
    },

    joinVoice: (channelId) => {
      set({ activeVoiceChannel: channelId });
    },

    leaveVoice: () => {
      set({ activeVoiceChannel: null });
    },

    updateUserStatus: (status) => {
      set((state) => ({
        currentUser: { ...state.currentUser, status },
        users: {
          ...state.users,
          [state.currentUser.id]: { ...state.users[state.currentUser.id], status }
        }
      }));
    },

    updateCustomStatus: (customStatus) => {
      set((state) => ({
        currentUser: { ...state.currentUser, customStatus },
        users: {
          ...state.users,
          [state.currentUser.id]: { ...state.users[state.currentUser.id], customStatus }
        }
      }));
    },

    updateChannelTopic: (channelId, topic) => {
      set((state) => {
        const channel = state.channels[channelId];
        if (!channel) return state;
        return {
          channels: {
            ...state.channels,
            [channelId]: { ...channel, topic }
          }
        };
      });
    },

    // UI actions
    setThreadPanel: (open, threadId = null) => {
      set((state) => ({
        ui: { ...state.ui, threadPanelOpen: open, activeThreadId: threadId }
      }));
    },

    setPinnedPanel: (open) => {
      set((state) => ({
        ui: { ...state.ui, pinnedPanelOpen: open }
      }));
    },

    toggleMemberSidebar: () => {
      set((state) => ({
        ui: { ...state.ui, memberSidebarVisible: !state.ui.memberSidebarVisible }
      }));
    },

    markChannelAsRead: (channelId) => {
      set((state) => {
        const channel = state.channels[channelId];
        if (!channel) return state;
        return {
          channels: {
            ...state.channels,
            [channelId]: { ...channel, unreadCount: 0 }
          }
        };
      });
    },

    // Channel notification settings
    setChannelNotification: (channelId, setting) => {
      set((state) => {
        const channel = state.channels[channelId];
        if (!channel) return state;
        return {
          channels: {
            ...state.channels,
            [channelId]: {
              ...channel,
              notificationSetting: setting,
              muted: setting === 'nothing'
            }
          }
        };
      });
    },

    // Reorder channels within a category via drag-and-drop
    reorderChannel: (serverId, categoryName, fromIndex, toIndex) => {
      set((state) => {
        const server = state.servers[serverId];
        if (!server || !server.categories) return state;

        const newCategories = server.categories.map(cat => {
          if (cat.name !== categoryName) return cat;
          const newIds = [...cat.channelIds];
          const [moved] = newIds.splice(fromIndex, 1);
          newIds.splice(toIndex, 0, moved);
          return { ...cat, channelIds: newIds };
        });

        // Also update position fields
        const newChannels = { ...state.channels };
        newCategories.forEach(cat => {
          cat.channelIds.forEach((chId, idx) => {
            if (newChannels[chId]) {
              newChannels[chId] = { ...newChannels[chId], position: idx };
            }
          });
        });

        return {
          servers: {
            ...state.servers,
            [serverId]: { ...server, categories: newCategories }
          },
          channels: newChannels
        };
      });
    },

    // UI: modal state
    showChannelCreationModal: (serverId) => {
      set((state) => ({
        ui: { ...state.ui, channelCreationServerId: serverId }
      }));
    },

    hideChannelCreationModal: () => {
      set((state) => ({
        ui: { ...state.ui, channelCreationServerId: null }
      }));
    },

    showServerCreationModal: () => {
      set((state) => ({
        ui: { ...state.ui, serverCreationModalOpen: true }
      }));
    },

    hideServerCreationModal: () => {
      set((state) => ({
        ui: { ...state.ui, serverCreationModalOpen: false }
      }));
    },

    // Mute/Deafen toggles
    toggleMute: () => {
      set((state) => ({
        currentUser: { ...state.currentUser, isMuted: !state.currentUser.isMuted }
      }));
    },

    toggleDeafen: () => {
      set((state) => ({
        currentUser: {
          ...state.currentUser,
          isDeafened: !state.currentUser.isDeafened,
          // Deafening also mutes
          isMuted: !state.currentUser.isDeafened ? true : state.currentUser.isMuted
        }
      }));
    },

    // Rename server
    renameServer: (serverId, name) => {
      set((state) => {
        const server = state.servers[serverId];
        if (!server) return state;
        return {
          servers: {
            ...state.servers,
            [serverId]: { ...server, name }
          }
        };
      });
    },

    // Delete server
    deleteServer: (serverId) => {
      set((state) => {
        const newServers = { ...state.servers };
        const server = newServers[serverId];
        if (!server) return state;

        // Remove associated channels and messages
        const newChannels = { ...state.channels };
        const newMessages = { ...state.messages };
        (server.channels || []).forEach(chId => {
          // Remove messages for this channel
          Object.keys(newMessages).forEach(msgId => {
            if (newMessages[msgId].channelId === chId) {
              delete newMessages[msgId];
            }
          });
          delete newChannels[chId];
        });
        delete newServers[serverId];

        return {
          servers: newServers,
          channels: newChannels,
          messages: newMessages
        };
      });
    },

    // Remove friend
    removeFriend: (userId) => {
      set((state) => {
        const newDms = (state.dms || []).filter(id => id !== userId);
        return { dms: newDms };
      });
    },

    // Block user
    blockUser: (userId) => {
      set((state) => {
        const blockedUsers = [...(state.blockedUsers || [])];
        if (!blockedUsers.includes(userId)) {
          blockedUsers.push(userId);
        }
        const newDms = (state.dms || []).filter(id => id !== userId);
        return { blockedUsers, dms: newDms };
      });
    },

    // Unblock user
    unblockUser: (userId) => {
      set((state) => {
        const blockedUsers = (state.blockedUsers || []).filter(id => id !== userId);
        return { blockedUsers };
      });
    },

    // Remove DM from list
    removeDM: (userId) => {
      set((state) => {
        const newDms = (state.dms || []).filter(id => id !== userId);
        return { dms: newDms };
      });
    },

    // Update user settings (theme, messageDisplay, fontSize, notifications, chat settings)
    updateUserSettings: (settings) => {
      set((state) => ({
        userSettings: { ...(state.userSettings || {}), ...settings }
      }));
    },

    // Update user profile fields
    updateUserProfile: (fields) => {
      set((state) => ({
        currentUser: { ...state.currentUser, ...fields },
        users: {
          ...state.users,
          [state.currentUser.id]: { ...state.users[state.currentUser.id], ...fields }
        }
      }));
    },

    // Add pending friend request
    addFriendRequest: (username) => {
      set((state) => {
        const pendingFriends = [...(state.pendingFriends || [])];
        pendingFriends.push({
          id: generateId(),
          username,
          type: 'outgoing',
          timestamp: new Date().toISOString()
        });
        return { pendingFriends };
      });
    }
  })
);

// Subscribe to state changes and persist to session-specific localStorage
useStore.subscribe((state) => {
  if (!state._loading) {
    const dataState = {};
    for (const [key, value] of Object.entries(state)) {
      if (typeof value !== 'function' && !key.startsWith('_')) {
        dataState[key] = value;
      }
    }
    saveState(dataState, _sid);
  }
});
