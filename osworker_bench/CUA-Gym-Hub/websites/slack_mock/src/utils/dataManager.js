
const BASE_STORAGE_KEY = 'slackCloneState';
const BASE_INITIAL_KEY = 'slackCloneInitialState';

// Get session-specific storage keys
function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

// Read sid from URL query string or sessionStorage (survives refresh + SPA navigation)
export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    // New session from URL → save to sessionStorage for subsequent loads
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  // Fallback to sessionStorage (handles refresh where URL may lose ?sid)
  return sessionStorage.getItem('mock_sid') || null;
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) {
        return data.stored_state;
      }
    }
  } catch (e) {
    console.warn('No custom state available');
  }
  return null;
};

// Save current state to session-specific localStorage
export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state, merge: false })
  }).catch(() => {});
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  // If custom state provided (first load with session), merge with defaults
  if (customState) {
    const initialData = deepMergeWithDefaults(createInitialData(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  // Load from session-specific localStorage (refresh case)
  const stored = localStorage.getItem(sk);
  if (stored) {
    // Ensure initial state key also exists
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  // No session data, no custom state → create defaults
  const initialData = createInitialData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};

// --- Normalization functions for array fields ---

function normalizeUser(user, index) {
  return {
    userId: user.userId || `user_custom_${index}`,
    fullName: user.fullName || user.displayName || 'Unknown User',
    displayName: user.displayName || user.fullName || 'Unknown',
    email: user.email || `user${index}@example.com`,
    avatar: user.avatar || `https://picsum.photos/200/200?random=${index + 100}`,
    title: user.title || '',
    status: user.status || 'online',
    statusMessage: user.statusMessage || '',
    statusEmoji: user.statusEmoji || '',
    timeZone: user.timeZone || 'America/New_York'
  };
}

function normalizeChannel(channel, index) {
  return {
    channelId: channel.channelId || `channel_custom_${index}`,
    name: channel.name || `channel-${index}`,
    description: channel.description || '',
    topic: channel.topic || '',
    isPrivate: typeof channel.isPrivate === 'boolean' ? channel.isPrivate : false,
    isStarred: typeof channel.isStarred === 'boolean' ? channel.isStarred : false,
    members: Array.isArray(channel.members) ? channel.members : [],
    createdBy: channel.createdBy || '',
    createdAt: channel.createdAt || new Date().toISOString(),
    pinnedMessages: Array.isArray(channel.pinnedMessages) ? channel.pinnedMessages : [],
    unreadCount: typeof channel.unreadCount === 'number' ? channel.unreadCount : 0
  };
}

function normalizeMessage(message, index) {
  return {
    messageId: message.messageId || `msg_custom_${index}`,
    senderId: message.senderId || '',
    content: message.content || '',
    timestamp: message.timestamp || new Date().toISOString(),
    threadId: message.threadId || null,
    reactions: Array.isArray(message.reactions)
      ? message.reactions.map(r => normalizeReaction(r))
      : [],
    attachments: Array.isArray(message.attachments)
      ? message.attachments.map(a => normalizeAttachment(a))
      : [],
    isEdited: typeof message.isEdited === 'boolean' ? message.isEdited : false
  };
}

function normalizeReaction(reaction) {
  return {
    emoji: reaction.emoji || '',
    users: Array.isArray(reaction.users) ? reaction.users : []
  };
}

function normalizeAttachment(attachment) {
  return {
    type: attachment.type || 'file',
    url: attachment.url || '#',
    name: attachment.name || 'untitled',
    size: attachment.size || '0 KB'
  };
}

function normalizeThread(thread, key) {
  return {
    threadId: thread.threadId || key,
    parentMessageId: thread.parentMessageId || '',
    channelId: thread.channelId || null,
    dmId: thread.dmId || null,
    replies: Array.isArray(thread.replies) ? thread.replies : [],
    followers: Array.isArray(thread.followers) ? thread.followers : []
  };
}

function normalizeDM(dm, index) {
  return {
    dmId: dm.dmId || `dm_custom_${index}`,
    participants: Array.isArray(dm.participants) ? dm.participants : [],
    lastMessage: dm.lastMessage || '',
    lastTime: dm.lastTime || new Date().toISOString(),
    unreadCount: typeof dm.unreadCount === 'number' ? dm.unreadCount : 0
  };
}

function normalizeCallHistoryEntry(call, index) {
  return {
    callId: call.callId || `call_custom_${index}`,
    type: call.type || 'voice',
    participants: Array.isArray(call.participants) ? call.participants : [],
    dmId: call.dmId || '',
    startTime: call.startTime || new Date().toISOString(),
    duration: typeof call.duration === 'number' ? call.duration : 0,
    status: call.status || 'completed'
  };
}

function normalizeInvitation(invitation, index) {
  return {
    invitationId: invitation.invitationId || `inv_custom_${index}`,
    email: invitation.email || '',
    sentBy: invitation.sentBy || '',
    sentAt: invitation.sentAt || new Date().toISOString(),
    status: invitation.status || 'pending'
  };
}

function normalizeNotification(notification, index) {
  return {
    notificationId: notification.notificationId || `notif_custom_${index}`,
    type: notification.type || 'mention',
    messageId: notification.messageId || '',
    channelId: notification.channelId || null,
    dmId: notification.dmId || null,
    userId: notification.userId || '',
    timestamp: notification.timestamp || new Date().toISOString(),
    read: typeof notification.read === 'boolean' ? notification.read : false
  };
}

// Normalize the messages object (object of channel/dm key → message arrays)
function normalizeMessagesObject(messagesObj) {
  if (!messagesObj || typeof messagesObj !== 'object') return {};
  const result = {};
  for (const key in messagesObj) {
    if (Array.isArray(messagesObj[key])) {
      result[key] = messagesObj[key].map((m, i) => normalizeMessage(m, i));
    } else {
      result[key] = [];
    }
  }
  return result;
}

// Normalize the threads object (object of threadId → thread objects)
function normalizeThreadsObject(threadsObj) {
  if (!threadsObj || typeof threadsObj !== 'object') return {};
  const result = {};
  for (const key in threadsObj) {
    if (threadsObj[key] && typeof threadsObj[key] === 'object') {
      result[key] = normalizeThread(threadsObj[key], key);
    }
  }
  return result;
}

// Deep merge custom state with defaults (custom state takes precedence)
function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;

  const result = { ...defaults };

  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      // Normalize array fields that the UI iterates over
      if (key === 'users' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((u, i) => normalizeUser(u, i));
      } else if (key === 'channels' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((ch, i) => normalizeChannel(ch, i));
      } else if (key === 'dms' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((dm, i) => normalizeDM(dm, i));
      } else if (key === 'messages' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        result[key] = normalizeMessagesObject(custom[key]);
      } else if (key === 'threads' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        result[key] = normalizeThreadsObject(custom[key]);
      } else if (key === 'bookmarkedMessages' && Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (key === 'callHistory' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((c, i) => normalizeCallHistoryEntry(c, i));
      } else if (key === 'invitations' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((inv, i) => normalizeInvitation(inv, i));
      } else if (key === 'notifications' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((n, i) => normalizeNotification(n, i));
      } else if (key === 'currentUser' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        result[key] = normalizeUser(custom[key], 0);
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object') {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }

  return result;
}

export const createInitialData = () => {
  const users = [
    {
      userId: 'user_1',
      fullName: 'John Smith',
      displayName: 'John',
      email: 'john.smith@company.com',
      avatar: 'https://picsum.photos/200/200?random=1',
      title: 'Senior Developer',
      status: 'online',
      statusMessage: 'In a meeting until 3pm',
      statusEmoji: '',
      timeZone: 'America/New_York'
    },
    {
      userId: 'user_2',
      fullName: 'Sarah Johnson',
      displayName: 'Sarah',
      email: 'sarah.johnson@company.com',
      avatar: 'https://picsum.photos/200/200?random=2',
      title: 'Designer',
      status: 'online',
      statusMessage: 'Working on new designs',
      statusEmoji: '',
      timeZone: 'America/New_York'
    },
    {
      userId: 'user_3',
      fullName: 'Mike Chen',
      displayName: 'Mike',
      email: 'mike.chen@company.com',
      avatar: 'https://picsum.photos/200/200?random=3',
      title: 'Product Manager',
      status: 'away',
      statusMessage: 'Out for lunch',
      statusEmoji: '\u{1F4C5}',
      timeZone: 'America/Los_Angeles'
    },
    {
      userId: 'user_4',
      fullName: 'Emily Davis',
      displayName: 'Emily',
      email: 'emily.davis@company.com',
      avatar: 'https://picsum.photos/200/200?random=4',
      title: 'Developer',
      status: 'online',
      statusMessage: '',
      statusEmoji: '',
      timeZone: 'America/New_York'
    },
    {
      userId: 'user_5',
      fullName: 'Alex Kim',
      displayName: 'Alex',
      email: 'alex.kim@company.com',
      avatar: 'https://picsum.photos/200/200?random=5',
      title: 'Marketing Manager',
      status: 'busy',
      statusMessage: 'Do not disturb',
      statusEmoji: '\u{1F534}',
      timeZone: 'America/Chicago'
    },
    {
      userId: 'user_6',
      fullName: 'Lisa Anderson',
      displayName: 'Lisa',
      email: 'lisa.anderson@company.com',
      avatar: 'https://picsum.photos/200/200?random=6',
      title: 'HR Manager',
      status: 'online',
      statusMessage: '',
      statusEmoji: '',
      timeZone: 'America/New_York'
    },
    {
      userId: 'user_7',
      fullName: 'Tom Wilson',
      displayName: 'Tom',
      email: 'tom.wilson@company.com',
      avatar: 'https://picsum.photos/200/200?random=7',
      title: 'Sales Director',
      status: 'away',
      statusMessage: 'On a call',
      statusEmoji: '',
      timeZone: 'America/New_York'
    },
    {
      userId: 'user_8',
      fullName: 'Rachel Lee',
      displayName: 'Rachel',
      email: 'rachel.lee@company.com',
      avatar: 'https://picsum.photos/200/200?random=8',
      title: 'Support Specialist',
      status: 'online',
      statusMessage: 'Working from home',
      statusEmoji: '\u{1F3E0}',
      timeZone: 'America/Los_Angeles'
    }
  ];

  const channels = [
    {
      channelId: 'general',
      name: 'general',
      description: 'Company-wide announcements and general discussion',
      topic: 'Company-wide announcements',
      isPrivate: false,
      isStarred: true,
      members: users.map(u => u.userId),
      createdBy: 'user_1',
      createdAt: '2024-01-01T10:00:00Z',
      pinnedMessages: [],
      unreadCount: 0
    },
    {
      channelId: 'random',
      name: 'random',
      description: 'Non-work banter and water cooler conversation',
      topic: 'Non-work banter',
      isPrivate: false,
      isStarred: false,
      members: users.map(u => u.userId),
      createdBy: 'user_1',
      createdAt: '2024-01-01T10:00:00Z',
      pinnedMessages: [],
      unreadCount: 3
    },
    {
      channelId: 'engineering',
      name: 'engineering',
      description: 'Engineering team discussions and updates',
      topic: 'Ship it \u{1F680}',
      isPrivate: false,
      isStarred: true,
      members: ['user_1', 'user_4', 'user_2'],
      createdBy: 'user_1',
      createdAt: '2024-01-05T10:00:00Z',
      pinnedMessages: [],
      unreadCount: 0
    },
    {
      channelId: 'design',
      name: 'design',
      description: 'Design team collaboration and feedback',
      topic: 'Pixels matter',
      isPrivate: false,
      isStarred: false,
      members: ['user_2', 'user_3', 'user_1'],
      createdBy: 'user_2',
      createdAt: '2024-01-05T10:00:00Z',
      pinnedMessages: [],
      unreadCount: 0
    },
    {
      channelId: 'marketing',
      name: 'marketing',
      description: 'Marketing campaigns and strategies',
      topic: 'Q4 campaign planning',
      isPrivate: false,
      isStarred: false,
      members: ['user_5', 'user_3', 'user_7'],
      createdBy: 'user_5',
      createdAt: '2024-01-10T10:00:00Z',
      pinnedMessages: [],
      unreadCount: 1
    },
    {
      channelId: 'project-alpha',
      name: 'project-alpha',
      description: 'Private channel for Project Alpha team',
      topic: 'Launch date: March 15',
      isPrivate: true,
      isStarred: true,
      members: ['user_1', 'user_2', 'user_3', 'user_4'],
      createdBy: 'user_3',
      createdAt: '2024-01-15T10:00:00Z',
      pinnedMessages: [],
      unreadCount: 0
    }
  ];

  const messages = {
    'general': [
      {
        messageId: 'msg_1',
        senderId: 'user_3',
        content: 'Good morning team! Hope everyone had a great weekend 🌞',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        threadId: null,
        reactions: [
          { emoji: '👋', users: ['user_1', 'user_2', 'user_4'] },
          { emoji: '☕', users: ['user_5'] }
        ],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_2',
        senderId: 'user_1',
        content: 'Thanks Mike! Had a great time hiking. Ready for the week ahead!',
        timestamp: new Date(Date.now() - 3600000 * 23).toISOString(),
        threadId: null,
        reactions: [{ emoji: '🏔️', users: ['user_3', 'user_2'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_3',
        senderId: 'user_6',
        content: 'Reminder: Team building event this Friday at 4pm! Please RSVP in the thread.',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        threadId: null,
        reactions: [{ emoji: '🎉', users: ['user_1', 'user_2', 'user_4', 'user_5'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_4',
        senderId: 'user_2',
        content: 'Just shared the new design mockups in #design. @[user_1:John] @[user_3:Mike] would love to get your feedback!',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        threadId: null,
        reactions: [{ emoji: '👀', users: ['user_1', 'user_3'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_5',
        senderId: 'user_7',
        content: 'Great Q4 numbers everyone! Sales team crushed it this quarter 📈',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        threadId: null,
        reactions: [{ emoji: '🎯', users: ['user_1', 'user_3', 'user_5'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_6',
        senderId: 'user_5',
        content: 'New blog post is live! Check it out: https://blog.example.com/latest',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        threadId: null,
        reactions: [{ emoji: '🚀', users: ['user_2', 'user_7'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_thread_1_1',
        senderId: 'user_1',
        content: 'Count me in! 🙋‍♂️',
        timestamp: new Date(Date.now() - 3600000 * 19).toISOString(),
        threadId: 'thread_1',
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_thread_1_2',
        senderId: 'user_2',
        content: 'I\'ll be there too!',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        threadId: 'thread_1',
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_thread_1_3',
        senderId: 'user_4',
        content: 'Same here! Looking forward to it.',
        timestamp: new Date(Date.now() - 3600000 * 17).toISOString(),
        threadId: 'thread_1',
        reactions: [],
        attachments: [],
        isEdited: false
      }
    ],
    'engineering': [
      {
        messageId: 'msg_eng_1',
        senderId: 'user_1',
        content: 'Starting work on the new API endpoints today. @[user_4:Emily] want to pair on this?',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        threadId: null,
        reactions: [{ emoji: '\u{1F44D}', users: ['user_4'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_eng_2',
        senderId: 'user_4',
        content: 'Absolutely! Let\'s sync up after standup.',
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_eng_3',
        senderId: 'user_1',
        content: 'Here\'s the architecture diagram for the new feature',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        threadId: null,
        reactions: [{ emoji: '\u{1F680}', users: ['user_4', 'user_2'] }],
        attachments: [
          {
            type: 'image',
            url: '/files/_default/architecture-diagram.png',
            name: 'architecture-diagram.png',
            size: '245 KB'
          }
        ],
        isEdited: false
      },
      // Thread replies on msg_eng_3 (architecture discussion)
      {
        messageId: 'msg_eng_thread2_1',
        senderId: 'user_4',
        content: 'Love this! Quick question: are we going with Redis or Memcached for the caching layer?',
        timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
        threadId: 'thread_2',
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_eng_thread2_2',
        senderId: 'user_1',
        content: 'Redis for sure. We need the pub/sub capabilities for real-time updates.',
        timestamp: new Date(Date.now() - 3600000 * 1.6).toISOString(),
        threadId: 'thread_2',
        reactions: [{ emoji: '\u{1F44D}', users: ['user_4'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_eng_thread2_3',
        senderId: 'user_2',
        content: 'Makes sense. I\'ll make sure the UI handles the real-time updates gracefully.',
        timestamp: new Date(Date.now() - 3600000 * 1.4).toISOString(),
        threadId: 'thread_2',
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_eng_4',
        senderId: 'user_4',
        content: 'Looks great! I have a few questions about the caching layer.',
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_eng_5',
        senderId: 'user_2',
        content: 'The new UI components are ready for integration. @[user_1:John] let me know when you need them.',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        threadId: null,
        reactions: [{ emoji: '\u2705', users: ['user_1'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_eng_6',
        senderId: 'user_1',
        content: 'Perfect timing! We can integrate them this afternoon.',
        timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      }
    ],
    'random': [
      {
        messageId: 'msg_rand_1',
        senderId: 'user_5',
        content: 'Anyone tried that new coffee shop downtown? ☕',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        threadId: null,
        reactions: [{ emoji: '☕', users: ['user_1', 'user_7'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_rand_2',
        senderId: 'user_7',
        content: 'Yes! Their cold brew is amazing. Highly recommend!',
        timestamp: new Date(Date.now() - 3600000 * 5.5).toISOString(),
        threadId: null,
        reactions: [{ emoji: '👍', users: ['user_5'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_rand_3',
        senderId: 'user_2',
        content: 'I went there yesterday! Got the vanilla latte. So good!',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        threadId: null,
        reactions: [{ emoji: '😋', users: ['user_5', 'user_7'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_rand_4',
        senderId: 'user_8',
        content: 'Anyone watching the game tonight?',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        threadId: null,
        reactions: [{ emoji: '🏀', users: ['user_1', 'user_3'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_rand_5',
        senderId: 'user_3',
        content: 'Definitely! Should be a good one.',
        timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_rand_6',
        senderId: 'user_1',
        content: 'Count me in too! What time does it start?',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        threadId: null,
        reactions: [{ emoji: '👍', users: ['user_3', 'user_8'] }],
        attachments: [],
        isEdited: false
      }
    ],
    'design': [
      {
        messageId: 'msg_des_1',
        senderId: 'user_2',
        content: 'New design system components are ready for review!',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        threadId: null,
        reactions: [{ emoji: '\u{1F3A8}', users: ['user_1', 'user_3'] }],
        attachments: [
          {
            type: 'image',
            url: '/files/_default/design-system.png',
            name: 'design-system.png',
            size: '512 KB'
          }
        ],
        isEdited: false
      },
      // Thread on design system review
      {
        messageId: 'msg_des_thread3_1',
        senderId: 'user_1',
        content: 'The button variants look perfect. One thought: should we add a ghost variant?',
        timestamp: new Date(Date.now() - 3600000 * 7.8).toISOString(),
        threadId: 'thread_3',
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_des_thread3_2',
        senderId: 'user_2',
        content: 'Good idea! I\'ll add ghost and outline variants to the component library.',
        timestamp: new Date(Date.now() - 3600000 * 7.6).toISOString(),
        threadId: 'thread_3',
        reactions: [{ emoji: '\u{1F44D}', users: ['user_1'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_des_2',
        senderId: 'user_3',
        content: 'These look fantastic! Love the color palette.',
        timestamp: new Date(Date.now() - 3600000 * 7.5).toISOString(),
        threadId: null,
        reactions: [{ emoji: '\u{1F4AF}', users: ['user_2'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_des_3',
        senderId: 'user_1',
        content: 'Great work! Can we use these in the next sprint?',
        timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_des_4',
        senderId: 'user_2',
        content: 'Absolutely! They\'re production-ready.',
        timestamp: new Date(Date.now() - 3600000 * 6.5).toISOString(),
        threadId: null,
        reactions: [{ emoji: '\u2705', users: ['user_1', 'user_3'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_des_5',
        senderId: 'user_3',
        content: 'I\'ll update the documentation today.',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        threadId: null,
        reactions: [{ emoji: '\u{1F4DA}', users: ['user_2'] }],
        attachments: [],
        isEdited: false
      }
    ],
    'marketing': [
      {
        messageId: 'msg_mkt_1',
        senderId: 'user_5',
        content: 'Q4 campaign planning meeting tomorrow at 2pm',
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_mkt_2',
        senderId: 'user_7',
        content: 'I\'ll be there. Have some ideas to share.',
        timestamp: new Date(Date.now() - 3600000 * 9.5).toISOString(),
        threadId: null,
        reactions: [{ emoji: '💡', users: ['user_5'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_mkt_3',
        senderId: 'user_3',
        content: 'Looking forward to it! Let\'s make this quarter amazing.',
        timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
        threadId: null,
        reactions: [{ emoji: '🚀', users: ['user_5', 'user_7'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_mkt_4',
        senderId: 'user_5',
        content: 'Here\'s the agenda for tomorrow\'s meeting',
        timestamp: new Date(Date.now() - 3600000 * 8.5).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [
          {
            type: 'file',
            url: '/files/_default/Q4-Campaign-Agenda.pdf',
            name: 'Q4-Campaign-Agenda.pdf',
            size: '156 KB'
          }
        ],
        isEdited: false
      },
      {
        messageId: 'msg_mkt_5',
        senderId: 'user_7',
        content: 'Thanks! I\'ll review it before the meeting.',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        threadId: null,
        reactions: [{ emoji: '👍', users: ['user_5'] }],
        attachments: [],
        isEdited: false
      }
    ],
    'project-alpha': [
      {
        messageId: 'msg_alpha_1',
        senderId: 'user_3',
        content: 'Project Alpha kickoff meeting notes: https://docs.example.com/alpha',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        threadId: null,
        reactions: [{ emoji: '📝', users: ['user_1', 'user_2', 'user_4'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_alpha_2',
        senderId: 'user_1',
        content: 'Making great progress on the backend. Should have the first milestone done by EOW.',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        threadId: null,
        reactions: [{ emoji: '🎯', users: ['user_3'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_alpha_3',
        senderId: 'user_2',
        content: 'UI mockups are complete. Ready for implementation.',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        threadId: null,
        reactions: [{ emoji: '🎨', users: ['user_1', 'user_3', 'user_4'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_alpha_4',
        senderId: 'user_4',
        content: 'Database schema is finalized. Starting implementation today.',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        threadId: null,
        reactions: [{ emoji: '💾', users: ['user_1'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_alpha_5',
        senderId: 'user_3',
        content: 'Great work team! We\'re ahead of schedule.',
        timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        threadId: null,
        reactions: [{ emoji: '🎉', users: ['user_1', 'user_2', 'user_4'] }],
        attachments: [],
        isEdited: false
      }
    ],
    'dm_1': [
      {
        messageId: 'msg_dm_1_1',
        senderId: 'user_1',
        content: 'Hey Sarah, I reviewed the new designs. They look fantastic!',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_dm_1_2',
        senderId: 'user_2',
        content: 'Thanks for the design feedback!',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        threadId: null,
        reactions: [{ emoji: '❤️', users: ['user_1'] }],
        attachments: [],
        isEdited: false
      }
    ],
    'dm_2': [
      {
        messageId: 'msg_dm_2_1',
        senderId: 'user_3',
        content: 'Can we discuss the roadmap for next quarter?',
        timestamp: new Date(Date.now() - 3600000 * 13).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      },
      // Thread on roadmap discussion in DM
      {
        messageId: 'msg_dm_2_thread4_1',
        senderId: 'user_1',
        content: 'Sure! I was thinking we should focus on the mobile experience first.',
        timestamp: new Date(Date.now() - 3600000 * 12.5).toISOString(),
        threadId: 'thread_4',
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_dm_2_thread4_2',
        senderId: 'user_3',
        content: 'Agreed. I\'ll put together a priority list by Friday.',
        timestamp: new Date(Date.now() - 3600000 * 12.2).toISOString(),
        threadId: 'thread_4',
        reactions: [{ emoji: '\u{1F4AA}', users: ['user_1'] }],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_dm_2_2',
        senderId: 'user_1',
        content: 'Let\'s schedule that meeting',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      }
    ],
    'dm_3': [
      {
        messageId: 'msg_dm_3_1',
        senderId: 'user_4',
        content: 'Can you review my PR when you get a chance?',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        threadId: null,
        reactions: [],
        attachments: [],
        isEdited: false
      },
      {
        messageId: 'msg_dm_3_2',
        senderId: 'user_1',
        content: 'Code review looks good!',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        threadId: null,
        reactions: [{ emoji: '✅', users: ['user_4'] }],
        attachments: [],
        isEdited: false
      }
    ]
  };

  const threads = {
    'thread_1': {
      threadId: 'thread_1',
      parentMessageId: 'msg_3',
      channelId: 'general',
      dmId: null,
      replies: ['msg_thread_1_1', 'msg_thread_1_2', 'msg_thread_1_3'],
      followers: ['user_1', 'user_2', 'user_4', 'user_6']
    },
    'thread_2': {
      threadId: 'thread_2',
      parentMessageId: 'msg_eng_3',
      channelId: 'engineering',
      dmId: null,
      replies: ['msg_eng_thread2_1', 'msg_eng_thread2_2', 'msg_eng_thread2_3'],
      followers: ['user_1', 'user_4', 'user_2']
    },
    'thread_3': {
      threadId: 'thread_3',
      parentMessageId: 'msg_des_1',
      channelId: 'design',
      dmId: null,
      replies: ['msg_des_thread3_1', 'msg_des_thread3_2'],
      followers: ['user_1', 'user_2']
    },
    'thread_4': {
      threadId: 'thread_4',
      parentMessageId: 'msg_dm_2_1',
      channelId: null,
      dmId: 'dm_2',
      replies: ['msg_dm_2_thread4_1', 'msg_dm_2_thread4_2'],
      followers: ['user_1', 'user_3']
    }
  };

  const dms = [
    {
      dmId: 'dm_1',
      participants: ['user_1', 'user_2'],
      lastMessage: 'Thanks for the design feedback!',
      lastTime: new Date(Date.now() - 3600000 * 2).toISOString(),
      unreadCount: 0
    },
    {
      dmId: 'dm_2',
      participants: ['user_1', 'user_3'],
      lastMessage: 'Let\'s schedule that meeting',
      lastTime: new Date(Date.now() - 3600000 * 12).toISOString(),
      unreadCount: 2
    },
    {
      dmId: 'dm_3',
      participants: ['user_1', 'user_4'],
      lastMessage: 'Code review looks good!',
      lastTime: new Date(Date.now() - 3600000 * 3).toISOString(),
      unreadCount: 0
    }
  ];

  const workspace = {
    workspaceId: 'ws_1',
    workspaceName: 'Acme Corp',
    icon: 'https://picsum.photos/64/64?random=workspace'
  };

  return {
    currentUser: users[0],
    workspace,
    users,
    channels,
    messages,
    threads,
    dms,
    bookmarkedMessages: ['msg_eng_3', 'msg_alpha_1'],
    callHistory: [],
    settings: {
      theme: 'light',
      notifications: 'all',
      displayDensity: 'comfortable',
      showAvatars: true,
      use24Hour: false
    },
    invitations: [],
    notifications: [
      {
        notificationId: 'notif_1',
        type: 'mention',
        messageId: 'msg_eng_1',
        channelId: 'engineering',
        dmId: null,
        userId: 'user_4',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        read: false
      },
      {
        notificationId: 'notif_2',
        type: 'reaction',
        messageId: 'msg_2',
        channelId: 'general',
        dmId: null,
        userId: 'user_3',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        read: false
      },
      {
        notificationId: 'notif_3',
        type: 'thread_reply',
        messageId: 'msg_thread_1_2',
        channelId: 'general',
        dmId: null,
        userId: 'user_2',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        read: true
      },
      {
        notificationId: 'notif_4',
        type: 'reaction',
        messageId: 'msg_eng_3',
        channelId: 'engineering',
        dmId: null,
        userId: 'user_4',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        read: false
      },
      {
        notificationId: 'notif_5',
        type: 'thread_reply',
        messageId: 'msg_eng_thread2_3',
        channelId: 'engineering',
        dmId: null,
        userId: 'user_2',
        timestamp: new Date(Date.now() - 3600000 * 1.4).toISOString(),
        read: false
      }
    ]
  };
};

export const calculateStateDiff = (initial, current) => {
  const diff = {};

  if (JSON.stringify(initial.currentUser) !== JSON.stringify(current.currentUser)) {
    diff.currentUser = current.currentUser;
  }

  if (JSON.stringify(initial.channels) !== JSON.stringify(current.channels)) {
    diff.channels = current.channels;
  }

  if (JSON.stringify(initial.messages) !== JSON.stringify(current.messages)) {
    diff.messages = current.messages;
  }

  if (JSON.stringify(initial.threads) !== JSON.stringify(current.threads)) {
    diff.threads = current.threads;
  }

  if (JSON.stringify(initial.dms) !== JSON.stringify(current.dms)) {
    diff.dms = current.dms;
  }

  if (JSON.stringify(initial.workspace) !== JSON.stringify(current.workspace)) {
    diff.workspace = current.workspace;
  }

  if (JSON.stringify(initial.bookmarkedMessages) !== JSON.stringify(current.bookmarkedMessages)) {
    diff.bookmarkedMessages = current.bookmarkedMessages;
  }

  if (JSON.stringify(initial.callHistory) !== JSON.stringify(current.callHistory)) {
    diff.callHistory = current.callHistory;
  }

  if (JSON.stringify(initial.settings) !== JSON.stringify(current.settings)) {
    diff.settings = current.settings;
  }

  if (JSON.stringify(initial.invitations) !== JSON.stringify(current.invitations)) {
    diff.invitations = current.invitations;
  }

  if (JSON.stringify(initial.notifications) !== JSON.stringify(current.notifications)) {
    diff.notifications = current.notifications;
  }

  return diff;
};
