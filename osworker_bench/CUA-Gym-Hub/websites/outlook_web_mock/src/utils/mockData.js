import { subHours, subDays, addDays } from 'date-fns';

export const CATEGORIES = [
  { id: 'cat1', name: 'Blue Category', color: 'bg-blue-200 text-blue-800' },
  { id: 'cat2', name: 'Red Category', color: 'bg-red-200 text-red-800' },
  { id: 'cat3', name: 'Green Category', color: 'bg-green-200 text-green-800' },
  { id: 'cat4', name: 'Orange Category', color: 'bg-orange-200 text-orange-800' },
];

export const INITIAL_FOLDERS = [
  { id: 'inbox', name: 'Inbox', icon: 'Inbox', type: 'system' },
  { id: 'sent', name: 'Sent Items', icon: 'Send', type: 'system' },
  { id: 'drafts', name: 'Drafts', icon: 'File', type: 'system' },
  { id: 'archive', name: 'Archive', icon: 'Archive', type: 'system' },
  { id: 'deleted', name: 'Deleted Items', icon: 'Trash2', type: 'system' },
  { id: 'junk', name: 'Junk Email', icon: 'Ban', type: 'system' },
  { id: 'project-a', name: 'Project Alpha', icon: 'Folder', type: 'custom' },
  { id: 'personal', name: 'Personal', icon: 'Folder', type: 'custom' },
];

export const INITIAL_USER = {
  id: 'u1',
  name: 'Admin User',
  email: 'admin@example.com',
  avatar: 'https://picsum.photos/100/100?random=user1'
};

const generateEmails = () => {
  const emails = [];
  const senders = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Alice Smith', email: 'alice@company.com' },
    { name: 'Marketing Team', email: 'newsletter@service.com' },
    { name: 'Boss Man', email: 'boss@company.com' }
  ];

  // Generate 15 mock emails
  for (let i = 0; i < 15; i++) {
    const sender = senders[i % senders.length];
    const isImportant = i % 4 === 0;

    emails.push({
      id: `email-${i}`,
      folderId: i > 12 ? 'deleted' : (i > 10 ? 'sent' : 'inbox'),
      from: sender,
      to: [{ name: 'Admin User', email: 'admin@example.com' }],
      subject: `Project Update ${i + 1}: Important details inside`,
      body: `Hi Admin,\n\nHere is the update regarding project ${i + 1}. We are making good progress. \n\nPlease review the attached documents.\n\nBest,\n${sender.name}`,
      preview: `Hi Admin, Here is the update regarding project ${i + 1}. We are making good progress...`,
      timestamp: subHours(new Date(), i * 2).toISOString(),
      read: i > 5,
      flagged: i % 3 === 0,
      categories: i % 5 === 0 ? ['cat1'] : [],
      attachments: i % 4 === 0 ? [{ name: 'report.pdf', url: `/files/_default/report.pdf` }] : [],
      isFocused: isImportant
    });
  }
  return emails;
};

export const INITIAL_EMAILS = generateEmails();

export const INITIAL_CONTACTS = [
  { id: 'c1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', avatar: 'https://picsum.photos/100/100?random=c1' },
  { id: 'c2', name: 'Alice Smith', email: 'alice@company.com', phone: '555-0102', avatar: 'https://picsum.photos/100/100?random=c2' },
  { id: 'c3', name: 'Bob Johnson', email: 'bob@vendor.com', phone: '555-0103', avatar: 'https://picsum.photos/100/100?random=c3' },
];

export const INITIAL_TASKS = [
  { id: 't1', title: 'Review Q1 Reports', dueDate: addDays(new Date(), 2).toISOString(), completed: false },
  { id: 't2', title: 'Email Marketing Team', dueDate: new Date().toISOString(), completed: true },
  { id: 't3', title: 'Prepare Presentation', dueDate: addDays(new Date(), 5).toISOString(), completed: false },
];

export const INITIAL_EVENTS = [
  {
    id: 'e1',
    title: 'Weekly Standup',
    start: new Date().toISOString(),
    end: addDays(new Date(), 0.04).toISOString(), // ~1 hour
    attendees: ['john@example.com']
  },
  {
    id: 'e2',
    title: 'Client Lunch',
    start: addDays(new Date(), 1).toISOString(),
    end: addDays(new Date(), 1.08).toISOString(),
    attendees: ['alice@company.com']
  }
];

export const INITIAL_RULES = [
  { id: 'r1', name: 'Auto-Archive Newsletters', enabled: true },
];

export const INITIAL_QUICK_STEPS = [
  { id: 'qs1', name: 'Done & Archive', actions: ['markRead', 'moveArchive'] },
  { id: 'qs2', name: 'Reply & Delete', actions: ['reply', 'delete'] },
];

// --- Session isolation helpers ---

const BASE_STORAGE_KEY = 'outlook_mock_data';
const BASE_INITIAL_KEY = 'outlook_mock_initial_state';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKeyFn(sid) {
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

export const getStoredInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKeyFn(sid));
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

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state, merge: false }),
  }).catch(() => {});
};

function getDefaultState() {
  return {
    user: INITIAL_USER,
    folders: INITIAL_FOLDERS,
    emails: INITIAL_EMAILS,
    contacts: INITIAL_CONTACTS,
    tasks: INITIAL_TASKS,
    events: INITIAL_EVENTS,
    categories: CATEGORIES,
    rules: INITIAL_RULES,
    quickSteps: INITIAL_QUICK_STEPS,
  };
}

export const DEFAULT_STATE = getDefaultState();

// Normalization helpers for POST custom state
function normalizeEmail(email, index) {
  return {
    id: email.id || `email_custom_${index}`,
    folderId: email.folderId || 'inbox',
    from: email.from || { name: 'Unknown', email: 'unknown@example.com' },
    to: Array.isArray(email.to) ? email.to : [],
    subject: email.subject || '(No Subject)',
    body: email.body || '',
    preview: email.preview || (email.body || '').substring(0, 50),
    timestamp: email.timestamp || new Date().toISOString(),
    read: typeof email.read === 'boolean' ? email.read : false,
    flagged: typeof email.flagged === 'boolean' ? email.flagged : false,
    categories: Array.isArray(email.categories) ? email.categories : [],
    attachments: Array.isArray(email.attachments) ? email.attachments : [],
    isFocused: typeof email.isFocused === 'boolean' ? email.isFocused : false
  };
}

function normalizeContact(contact, index) {
  return {
    id: contact.id || `c_custom_${index}`,
    name: contact.name || 'Unknown',
    email: contact.email || '',
    phone: contact.phone || '',
    avatar: contact.avatar || `https://picsum.photos/100/100?random=c_custom_${index}`
  };
}

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (key === 'emails' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((e, i) => normalizeEmail(e, i));
      } else if (key === 'contacts' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((c, i) => normalizeContact(c, i));
      } else if (key === 'user' && typeof custom[key] === 'object') {
        result[key] = { ...defaults.user, ...custom[key] };
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKeyFn(sid);

  if (customState) {
    const initialData = deepMergeWithDefaults(getDefaultState(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  const initialData = getDefaultState();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
