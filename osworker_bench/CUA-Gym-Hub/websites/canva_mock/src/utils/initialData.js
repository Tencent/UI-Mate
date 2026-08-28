import { v4 as uuidv4 } from 'uuid';

export const INITIAL_CANVAS_CONFIG = {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
};

export const MOCK_TEMPLATES = [
  {
    id: 't1',
    name: 'Social Media Post',
    category: 'Social Media',
    thumbnail: 'https://picsum.photos/300/200?random=t1',
    elements: [
      { id: uuidv4(), type: 'rect', x: 0, y: 0, width: 800, height: 600, fill: '#FFD166' },
      { id: uuidv4(), type: 'text', x: 50, y: 50, text: 'SUMMER SALE', fontSize: 60, fill: '#000000', fontFamily: 'Arial', fontWeight: 'bold' },
      { id: uuidv4(), type: 'circle', x: 600, y: 300, radius: 100, fill: '#EF476F' }
    ]
  },
  {
    id: 't2',
    name: 'Inspirational Quote',
    category: 'Poster',
    thumbnail: 'https://picsum.photos/300/200?random=t2',
    elements: [
      { id: uuidv4(), type: 'rect', x: 0, y: 0, width: 800, height: 600, fill: '#118AB2' },
      { id: uuidv4(), type: 'text', x: 100, y: 200, text: 'Dream Big', fontSize: 80, fill: '#ffffff', fontFamily: 'Georgia', fontStyle: 'italic' }
    ]
  },
  {
    id: 't3',
    name: 'Tech Presentation',
    category: 'Presentation',
    thumbnail: 'https://picsum.photos/300/200?random=t3',
    elements: [
      { id: uuidv4(), type: 'rect', x: 0, y: 0, width: 800, height: 600, fill: '#073B4C' },
      { id: uuidv4(), type: 'rect', x: 50, y: 50, width: 700, height: 100, fill: '#06D6A0' },
      { id: uuidv4(), type: 'text', x: 70, y: 75, text: 'Future of AI', fontSize: 48, fill: '#ffffff', fontFamily: 'Verdana' }
    ]
  }
];

export const MOCK_ELEMENTS = [
  { id: 'e1', type: 'rect', width: 100, height: 100, fill: '#EF476F' },
  { id: 'e2', type: 'circle', radius: 50, fill: '#FFD166' },
  { id: 'e3', type: 'star', numPoints: 5, innerRadius: 30, outerRadius: 60, fill: '#06D6A0' },
];

// --- Session-based state management ---

const BASE_STORAGE_KEY = 'canva_mock_state';
const BASE_INITIAL_KEY = 'canva_mock_initialState';

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
  } catch (e) { console.log('No custom state available'); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {});
};

export const getSavedInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

function getDefaultData() {
  return {
    canvasConfig: INITIAL_CANVAS_CONFIG,
    elements: [],
    uploads: [],
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
    const d = deepMergeWithDefaults(getDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(d));
    localStorage.setItem(ik, JSON.stringify(d));
    return d;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const d = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(d));
  localStorage.setItem(ik, JSON.stringify(d));
  return d;
};
