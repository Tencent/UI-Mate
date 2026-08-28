import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const COLORS = {
  yellow: '#fff9b1',
  pink: '#f5d0fe',
  blue: '#c9f0f7',
  green: '#d5f692',
  orange: '#ffcf96',
  purple: '#e5d4ff',
  white: '#ffffff',
  gray: '#f0f0f0',
  red: '#ffcccc',
};

export const STROKE_COLORS = {
  black: '#000000',
  blue: '#050038',
  red: '#e63946',
  green: '#2a9d8f',
  transparent: 'transparent'
};

export const INITIAL_STATE = {
  boardId: generateId(),
  name: 'Untitled Board',
  created: Date.now(),
  objects: [
    {
      id: generateId(),
      type: 'sticky',
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      text: 'Welcome to Xiro Mock!\nDouble click to edit text.',
      fill: COLORS.yellow,
      votes: 5 // Initial votes to show the badge
    },
    {
      id: generateId(),
      type: 'shape',
      shapeType: 'rect',
      x: 400,
      y: 100,
      width: 150,
      height: 150,
      fill: COLORS.blue,
      stroke: '#050038',
      strokeWidth: 2,
      votes: 0
    },
    {
      id: generateId(),
      type: 'shape',
      shapeType: 'circle',
      x: 600,
      y: 100,
      width: 150,
      height: 150,
      fill: COLORS.pink,
      stroke: '#050038',
      strokeWidth: 2,
      votes: 0
    },
    {
      id: generateId(),
      type: 'frame',
      title: 'Project Goals',
      x: 100,
      y: 400,
      width: 400,
      height: 300,
      fill: '#ffffff',
      votes: 0
    }
  ],
  view: {
    x: 0,
    y: 0,
    scale: 1
  }
};

// --- Session isolation helpers ---
const BASE_STORAGE_KEY = 'miro_mock_data';
const BASE_INITIAL_KEY = 'miro_mock_initialState';

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

export const saveState = (state, sid = null, initialState = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state, initial_state: initialState, merge: false }),
  }).catch(() => {});
};

export const getSavedInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const k in custom) {
    if (custom[k] !== null && custom[k] !== undefined) {
      if (typeof custom[k] === 'object' && !Array.isArray(custom[k]) && typeof defaults[k] === 'object' && !Array.isArray(defaults[k])) {
        result[k] = deepMergeWithDefaults(defaults[k], custom[k]);
      } else {
        result[k] = custom[k];
      }
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = deepMergeWithDefaults(INITIAL_STATE, customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  const data = JSON.parse(JSON.stringify(INITIAL_STATE));
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};
