import { v4 as uuidv4 } from 'uuid';

export const USERS = [
  {
    id: 'user-1',
    username: 'admin',
    displayName: 'Admin User',
    email: 'admin@example.com',
    avatar: 'https://picsum.photos/100/100?random=user1'
  },
  {
    id: 'user-2',
    username: 'alice',
    displayName: 'Alice Engineer',
    email: 'alice@example.com',
    avatar: 'https://picsum.photos/100/100?random=user2'
  },
  {
    id: 'user-3',
    username: 'bob',
    displayName: 'Bob Manager',
    email: 'bob@example.com',
    avatar: 'https://picsum.photos/100/100?random=user3'
  }
];

export const SPACES = [
  {
    id: 'space-1',
    key: 'ENG',
    name: 'Engineering',
    description: 'Technical documentation and engineering processes.',
    icon: 'Code'
  },
  {
    id: 'space-2',
    key: 'HR',
    name: 'Human Resources',
    description: 'Company policies, onboarding, and benefits.',
    icon: 'Users'
  }
];

const now = new Date().toISOString();

export const PAGES = [
  {
    id: 'page-1',
    spaceId: 'space-1',
    parentId: null,
    title: 'Engineering Home',
    content: '<h1>Welcome to Engineering</h1><p>This is the home of the engineering team.</p>',
    authorId: 'user-1',
    created: now,
    updated: now,
    version: 1,
    labels: ['home', 'engineering']
  },
  {
    id: 'page-2',
    spaceId: 'space-1',
    parentId: 'page-1',
    title: 'Development Guidelines',
    content: '<h2>Coding Standards</h2><p>Please follow these guidelines...</p>',
    authorId: 'user-2',
    created: now,
    updated: now,
    version: 1,
    labels: ['guidelines']
  },
  {
    id: 'page-3',
    spaceId: 'space-2',
    parentId: null,
    title: 'HR Home',
    content: '<h1>HR Portal</h1><p>Welcome to the employee portal.</p>',
    authorId: 'user-3',
    created: now,
    updated: now,
    version: 1,
    labels: ['hr', 'home']
  }
];

export const COMMENTS = [
  {
    id: 'comment-1',
    pageId: 'page-1',
    userId: 'user-2',
    content: 'Great start to the documentation!',
    created: now
  }
];

export const VERSIONS = [
  {
    id: 'v-1',
    pageId: 'page-1',
    content: '<h1>Welcome to Engineering</h1><p>Initial draft.</p>',
    authorId: 'user-1',
    created: now,
    version: 0
  }
];

// --- Session-based state management ---

const BASE_STORAGE_KEY = 'kb_app_state';
const BASE_INITIAL_KEY = 'kb_app_initialState';

function storageKey(sid) { return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY; }
function initialKey(sid) { return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY; }

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) { sessionStorage.setItem('mock_sid', urlSid); return urlSid; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) { const data = await resp.json(); if (data.has_custom_state && data.stored_state) return data.stored_state; }
  } catch (e) { console.warn('No custom state available'); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state, merge: false }),
  }).catch(() => {});
};

export const getSavedInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

export function getDefaultState() {
  return {
    users: USERS,
    currentUser: USERS[0],
    spaces: SPACES,
    pages: PAGES,
    comments: COMMENTS,
    versions: VERSIONS,
    templates: [
      { id: 't-1', name: 'Meeting Notes', content: '<h1>Meeting Notes</h1><table><tbody><tr><th>Date</th><td></td></tr><tr><th>Attendees</th><td></td></tr></tbody></table><h2>Agenda</h2><ul><li></li></ul>' },
      { id: 't-2', name: 'Project Plan', content: '<h1>Project Plan</h1><h2>Overview</h2><p>Project goals...</p><h2>Timeline</h2><p>Q1...</p>' }
    ]
  };
}

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else { result[key] = custom[key]; }
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const d = deepMergeWithDefaults(getDefaultState(), customState);
    localStorage.setItem(sk, JSON.stringify(d));
    localStorage.setItem(ik, JSON.stringify(d));
    return d;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const d = getDefaultState();
  localStorage.setItem(sk, JSON.stringify(d));
  localStorage.setItem(ik, JSON.stringify(d));
  return d;
};
