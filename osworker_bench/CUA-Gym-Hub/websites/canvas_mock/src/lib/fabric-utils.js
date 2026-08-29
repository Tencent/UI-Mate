import { Canvas, Rect, Circle, IText, Line, FabricImage, Point, Shadow } from 'fabric';
import { v4 as uuidv4 } from 'uuid';

// Helper to create default objects
export const createRect = (options = {}) => new Rect({
  left: 100,
  top: 100,
  fill: '#3498db',
  width: 100,
  height: 100,
  id: uuidv4(),
  ...options
});

export const createCircle = (options = {}) => new Circle({
  left: 200,
  top: 200,
  fill: '#e74c3c',
  radius: 50,
  id: uuidv4(),
  ...options
});

export const createText = (text = 'Double click to edit', options = {}) => new IText(text, {
  left: 300,
  top: 300,
  fontFamily: 'Arial',
  fontSize: 24,
  fill: '#333333',
  id: uuidv4(),
  ...options
});

export const createLine = (options = {}) => new Line([50, 50, 200, 50], {
  left: 150,
  top: 150,
  stroke: '#2c3e50',
  strokeWidth: 2,
  id: uuidv4(),
  ...options
});

export const addImage = async (canvas, url, options = {}) => {
  try {
    const img = await FabricImage.fromURL(url, {
      crossOrigin: 'anonymous',
      ...options
    });

    // Scale down if too big
    if (img.width > 500) {
      img.scaleToWidth(500);
    }

    img.set({
      left: canvas.width / 2 - (img.getScaledWidth() / 2),
      top: canvas.height / 2 - (img.getScaledHeight() / 2),
      id: uuidv4(),
      ...options
    });

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
    return img;
  } catch (error) {
    console.error('Failed to load image', error);
  }
};

export const serializeCanvas = (canvas) => {
  if (!canvas) return null;
  return canvas.toJSON(['id', 'name', 'selectable', 'lockMovementX', 'lockMovementY']);
};

export const compareStates = (initial, current) => {
  if (!initial || !current) return { diff: 'No state to compare' };

  const initialObjs = initial.objects || [];
  const currentObjs = current.objects || [];

  const added = currentObjs.filter(c => !initialObjs.find(i => i.id === c.id));
  const deleted = initialObjs.filter(i => !currentObjs.find(c => c.id === i.id));

  const modified = currentObjs.filter(c => {
    const i = initialObjs.find(init => init.id === c.id);
    if (!i) return false;
    // Simple shallow comparison of key props
    return (
      c.left !== i.left ||
      c.top !== i.top ||
      c.scaleX !== i.scaleX ||
      c.scaleY !== i.scaleY ||
      c.angle !== i.angle ||
      c.fill !== i.fill ||
      c.text !== i.text
    );
  }).map(c => {
    const i = initialObjs.find(init => init.id === c.id);
    return {
      id: c.id,
      type: c.type,
      changes: {
        before: { left: i.left, top: i.top, angle: i.angle, fill: i.fill },
        after: { left: c.left, top: c.top, angle: c.angle, fill: c.fill }
      }
    };
  });

  return {
    objectsAdded: added.map(o => ({ id: o.id, type: o.type })),
    objectsDeleted: deleted.map(o => ({ id: o.id, type: o.type })),
    objectsModified: modified,
    canvasModified: {
      width: initial.width !== current.width,
      height: initial.height !== current.height,
      background: initial.background !== current.background
    }
  };
};

// --- Session-based state isolation ---

const BASE_STORAGE_KEY = 'canvas_mock_state';
const BASE_INITIAL_KEY = 'canvas_mock_initialState';

function storageKeyFn(sid) { return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY; }
function initialKeyFn(sid) { return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY; }

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) { sessionStorage.setItem('mock_sid', urlSid); return urlSid; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) { console.log('No custom state available'); }
  return null;
};

export const saveCanvasState = (state, sid = null) => {
  localStorage.setItem(storageKeyFn(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {});
};

export const getCanvasInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKeyFn(sid));
  return stored ? JSON.parse(stored) : null;
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export const getDefaultCanvasState = () => ({
  canvasJSON: null,
  canvasImage: null,
  timestamp: new Date().toISOString()
});

export const initializeCanvasData = (sid = null, customState = null) => {
  const sk = storageKeyFn(sid);
  const ik = initialKeyFn(sid);

  if (customState) {
    const data = deepMergeWithDefaults(getDefaultCanvasState(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const data = getDefaultCanvasState();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};
