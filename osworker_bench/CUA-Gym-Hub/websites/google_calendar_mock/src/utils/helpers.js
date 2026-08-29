import { v4 as uuidv4 } from 'uuid';
import { addHours, addDays, subDays, startOfDay } from 'date-fns';

export const generateId = () => uuidv4();

// --- Mock "today" support ---
// When the injected state contains a `today` field (e.g. "2024-03-11"), all
// "current date / now" reads in the UI must be rebased on that date so the
// agent perceives the calendar as if today were that date. The real wall-clock
// time-of-day is preserved so the red "now" indicator still moves naturally.
let _mockToday = null;

export const setMockToday = (isoDate) => {
  if (!isoDate) { _mockToday = null; return; }
  // Accept 'YYYY-MM-DD' or full ISO; anchor a date-only string at local midnight.
  _mockToday = /^\d{4}-\d{2}-\d{2}$/.test(isoDate)
    ? new Date(`${isoDate}T00:00:00`)
    : new Date(isoDate);
};

export const getMockToday = () => _mockToday;

// Drop-in replacement for `new Date()` that respects the mock today.
export const mockNow = () => {
  if (!_mockToday) return new Date();
  const real = new Date();
  const d = new Date(_mockToday);
  d.setHours(real.getHours(), real.getMinutes(), real.getSeconds(), real.getMilliseconds());
  return d;
};

// Equivalent of date-fns `startOfToday`, but rebased on the mock today.
export const mockStartOfToday = () => startOfDay(mockNow());

export const MOCK_USER = {
  id: 'u1',
  username: 'Demo User',
  email: 'demo@example.com',
  avatar: 'https://picsum.photos/100/100?random=user1'
};

export const DEFAULT_CALENDARS = [
  { id: 'c1', name: 'Personal', color: 'bg-blue-500', textColor: 'text-white', visible: true, userId: 'u1' },
  { id: 'c2', name: 'Work', color: 'bg-green-500', textColor: 'text-white', visible: true, userId: 'u1' },
  { id: 'c3', name: 'Family', color: 'bg-purple-500', textColor: 'text-white', visible: true, userId: 'u1' },
  { id: 'c4', name: 'Holidays', color: 'bg-yellow-500', textColor: 'text-white', visible: true, userId: 'u1' }
];

export const generateMockEvents = () => {
  const today = mockStartOfToday();

  return [
    {
      id: generateId(),
      calendarId: 'c2',
      title: 'Team Standup',
      start: addHours(today, 10).toISOString(),
      end: addHours(today, 11).toISOString(),
      allDay: false,
      location: 'Conference Room A',
      description: 'Daily sync with the team',
      guests: ['alice@example.com', 'bob@example.com'],
      color: 'bg-green-500'
    },
    {
      id: generateId(),
      calendarId: 'c1',
      title: 'Lunch with Sarah',
      start: addHours(today, 12).toISOString(),
      end: addHours(today, 13).toISOString(),
      allDay: false,
      location: 'Downtown Cafe',
      description: '',
      guests: [],
      color: 'bg-blue-500'
    },
    {
      id: generateId(),
      calendarId: 'c3',
      title: 'Family Dinner',
      start: addHours(today, 19).toISOString(),
      end: addHours(today, 21).toISOString(),
      allDay: false,
      location: 'Home',
      description: 'Pizza night',
      guests: [],
      color: 'bg-purple-500'
    },
    {
      id: generateId(),
      calendarId: 'c2',
      title: 'Project Review',
      start: addDays(addHours(today, 14), 1).toISOString(),
      end: addDays(addHours(today, 16), 1).toISOString(),
      allDay: false,
      location: 'Zoom',
      description: 'Q3 Review',
      guests: [],
      color: 'bg-green-500'
    },
    {
      id: generateId(),
      calendarId: 'c4',
      title: 'Vacation',
      start: subDays(today, 2).toISOString(),
      end: today.toISOString(),
      allDay: true,
      location: 'Hawaii',
      description: 'Relaxing',
      guests: [],
      color: 'bg-yellow-500'
    }
  ];
};

export const getContrastColor = (hexColor) => {
  // Simple check for mock purposes - assuming standard tailwind colors mapped
  return 'white';
};

// --- Session-based state isolation ---

const BASE_STORAGE_KEY = 'gcal_mock_state';
const BASE_INITIAL_KEY = 'gcal_mock_state_initialState';

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

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) {
      const d = await resp.json();
      if (d.has_custom_state && d.stored_state) return d.stored_state;
    }
  } catch (e) {
    console.warn('No custom state available, using defaults');
  }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state, merge: false })
  }).catch(() => {});
};

export const getInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

function createDefaultData() {
  return {
    user: MOCK_USER,
    calendars: DEFAULT_CALENDARS,
    events: generateMockEvents(),
    view: 'month',
    currentDate: mockNow().toISOString(),
    sidebarOpen: true,
    settings: {
      weekStart: 0,
      defaultDuration: 60,
    }
  };
}

const VALID_CALENDAR_IDS = new Set(['c1', 'c2', 'c3', 'c4']);

function normalizeEvent(event, index) {
  const calendarId = VALID_CALENDAR_IDS.has(event.calendarId) ? event.calendarId : 'c1';
  const calendarColors = { c1: 'bg-blue-500', c2: 'bg-green-500', c3: 'bg-purple-500', c4: 'bg-yellow-500' };
  return {
    id: event.id || generateId(),
    calendarId,
    title: event.title || '(No Title)',
    start: event.start || event.startTime || mockNow().toISOString(),
    end: event.end || event.endTime || addHours(mockNow(), 1).toISOString(),
    allDay: event.allDay ?? false,
    location: event.location || '',
    description: event.description || '',
    guests: Array.isArray(event.guests) ? event.guests : [],
    color: event.color || calendarColors[calendarId] || 'bg-blue-500',
    recurring: event.recurring || 'none',
    reminders: Array.isArray(event.reminders) ? event.reminders : [],
  };
}

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (key === 'events' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((e, i) => normalizeEvent(e, i));
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
  const ik = initialKey(sid);

  if (customState) {
    // Honour an injected `today` so the calendar opens on that date.
    if (customState.today) {
      setMockToday(customState.today);
    }
    const data = deepMergeWithDefaults(createDefaultData(), customState);
    // If the custom state didn't override currentDate, rebase it on `today`.
    if (customState.today && !customState.currentDate) {
      data.currentDate = mockNow().toISOString();
    }
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const data = createDefaultData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};
