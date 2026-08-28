import { getDefaultState } from '../../defaultState.js';

const BASE_STORAGE_KEY = 'wechat_mock_data';
const BASE_INITIAL_KEY = 'wechat_mock_data_initialState';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}

function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

// Fetch custom state from server (set via POST /post)
export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) {
      const d = await resp.json();
      if (d.has_custom_state && d.stored_state) return d.stored_state;
    }
  } catch (e) {
    console.log('No custom state available, using defaults');
  }
  return null;
};

export const getInitialData = () => {
  return getDefaultState();
};

function normalizeContact(contact, index) {
  return {
    userId: contact.userId || contact.id || `contact_${index}`,
    nickname: contact.nickname || contact.name || contact.displayName || '未知用户',
    avatar: contact.avatar || `https://picsum.photos/100/100?random=${index + 100}`,
    wechatId: contact.wechatId || '',
    phone: contact.phone || '',
    signature: contact.signature || contact.status || '',
    region: contact.region || '',
    gender: contact.gender || '',
    tag: contact.tag || '',
    isStar: contact.isStar || false,
  };
}

function normalizeConversation(conv, index) {
  return {
    contactId: conv.contactId || conv.userId || conv.id || `contact_${index}`,
    lastMessage: conv.lastMessage || '',
    lastTime: conv.lastTime || conv.timestamp || new Date().toISOString(),
    unreadCount: conv.unreadCount ?? conv.unread ?? 0,
    isGroup: conv.isGroup || false,
    isPinned: conv.isPinned || false,
    isMuted: conv.isMuted || false,
    draft: conv.draft || '',
  };
}

function normalizeMessage(msg, index) {
  return {
    messageId: msg.messageId || msg.id || `msg_${index}`,
    senderId: msg.senderId || msg.from || 'unknown',
    content: msg.content || msg.text || '',
    type: msg.type || 'text',
    timestamp: msg.timestamp || new Date().toISOString(),
    isSelf: msg.isSelf ?? false,
    ...(msg.amount != null ? { amount: msg.amount } : {}),
    ...(msg.opened != null ? { opened: msg.opened } : {}),
    ...(msg.greeting ? { greeting: msg.greeting } : {}),
    ...(msg.duration != null ? { duration: msg.duration } : {}),
    ...(msg.fileName ? { fileName: msg.fileName } : {}),
    ...(msg.fileSize ? { fileSize: msg.fileSize } : {}),
    ...(msg.locationName ? { locationName: msg.locationName } : {}),
    ...(msg.locationAddress ? { locationAddress: msg.locationAddress } : {}),
    ...(msg.recalled != null ? { recalled: msg.recalled } : {}),
  };
}

function normalizeMessages(messagesObj) {
  if (!messagesObj || typeof messagesObj !== 'object') return {};
  const result = {};
  for (const key of Object.keys(messagesObj)) {
    if (Array.isArray(messagesObj[key])) {
      result[key] = messagesObj[key].map((m, i) => normalizeMessage(m, i));
    }
  }
  return result;
}

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (key === 'contacts' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((c, i) => normalizeContact(c, i));
      } else if (key === 'conversations' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((c, i) => normalizeConversation(c, i));
      } else if (key === 'messages' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        result[key] = normalizeMessages(custom[key]);
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export const saveToStorage = (data, sid = null) => {
  try {
    const toSave = {
      user: data.user,
      contacts: data.contacts,
      conversations: data.conversations,
      messages: data.messages,
      moments: data.moments,
      groups: data.groups,
      favorites: data.favorites,
      initialState: data.initialState
    };
    localStorage.setItem(storageKey(sid), JSON.stringify(toSave));
    // Also sync current state to server for /go endpoint
    syncStateToServer(toSave, sid);
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};

// Sync state to server so /go endpoint can detect changes
const syncStateToServer = (data, sid = null) => {
  try {
    const stateToSync = {
      user: data.user,
      contacts: data.contacts,
      conversations: data.conversations,
      messages: data.messages,
      moments: data.moments,
      groups: data.groups,
      favorites: data.favorites
    };
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state: stateToSync })
    }).catch(() => {});
  } catch (e) {
    // Silent fail — server sync is best-effort
  }
};

// Sync initial state to server (called once on first load) so /go has baseline for diff
export const syncInitialStateToServer = (data, sid = null) => {
  try {
    const stateToSync = {
      user: data.user,
      contacts: data.contacts,
      conversations: data.conversations,
      messages: data.messages,
      moments: data.moments,
      groups: data.groups,
      favorites: data.favorites
    };
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: stateToSync })
    }).catch(() => {});
  } catch (e) {
    // Silent fail
  }
};

export const loadFromStorage = (sid = null) => {
  try {
    const stored = localStorage.getItem(storageKey(sid));
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return null;
  }
};

export const getStoredInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = { ...getInitialData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const data = getInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};
