import { generateId, FIELD_TYPES } from '../lib/utils';

const BASE_STORAGE_KEY = 'airtable_mock_v1';
const BASE_INITIAL_KEY = 'airtable_mock_v1_initial';

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
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) {
    console.warn('[airtable_mock] Custom state fetch unavailable:', e);
  }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state }),
  }).catch(e => {
    console.warn('[airtable_mock] Server state sync unavailable:', e);
  });
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
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

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = deepMergeWithDefaults(createInitialState(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = createInitialState();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};

export const createInitialState = () => {
  const baseId = generateId('base');
  const table1Id = generateId('tbl');
  const table2Id = generateId('tbl');

  // Fields for Table 1 (Project Tracker)
  const fields1 = [
    { id: generateId('fld'), name: 'Name', type: FIELD_TYPES.TEXT, primary: true },
    { id: generateId('fld'), name: 'Status', type: FIELD_TYPES.SINGLE_SELECT, options: [
      { id: 'opt1', name: 'Todo', color: 'bg-red-100 text-red-800' },
      { id: 'opt2', name: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
      { id: 'opt3', name: 'Done', color: 'bg-green-100 text-green-800' }
    ]},
    { id: generateId('fld'), name: 'Priority', type: FIELD_TYPES.RATING, max: 5 },
    { id: generateId('fld'), name: 'Assignee', type: FIELD_TYPES.USER },
    { id: generateId('fld'), name: 'Due Date', type: FIELD_TYPES.DATE },
    { id: generateId('fld'), name: 'Budget', type: FIELD_TYPES.CURRENCY },
    { id: generateId('fld'), name: 'Attachments', type: FIELD_TYPES.ATTACHMENT },
    { id: generateId('fld'), name: 'Tags', type: FIELD_TYPES.MULTIPLE_SELECT, options: [
      { id: 'tag1', name: 'Design', color: 'bg-purple-100 text-purple-800' },
      { id: 'tag2', name: 'Dev', color: 'bg-blue-100 text-blue-800' },
      { id: 'tag3', name: 'Marketing', color: 'bg-pink-100 text-pink-800' }
    ]},
    { id: generateId('fld'), name: 'Notes', type: FIELD_TYPES.LONG_TEXT },
    { id: generateId('fld'), name: 'Approved', type: FIELD_TYPES.CHECKBOX },
  ];

  // Records for Table 1
  const records1 = [
    {
      id: generateId('rec'),
      createdTime: new Date().toISOString(),
      fields: {
        [fields1[0].id]: 'Website Redesign',
        [fields1[1].id]: 'In Progress',
        [fields1[2].id]: 4,
        [fields1[3].id]: { name: 'Alice', avatar: 'https://picsum.photos/100/100?random=1' },
        [fields1[4].id]: '2023-12-25',
        [fields1[5].id]: 5000,
        [fields1[6].id]: [{ url: 'https://picsum.photos/300/200?random=10', name: 'mockup.png' }],
        [fields1[7].id]: ['Design', 'Dev'],
        [fields1[8].id]: 'Needs to be responsive.',
        [fields1[9].id]: true
      }
    },
    {
      id: generateId('rec'),
      createdTime: new Date().toISOString(),
      fields: {
        [fields1[0].id]: 'Q1 Marketing Campaign',
        [fields1[1].id]: 'Todo',
        [fields1[2].id]: 5,
        [fields1[3].id]: { name: 'Bob', avatar: 'https://picsum.photos/100/100?random=2' },
        [fields1[4].id]: '2024-01-15',
        [fields1[5].id]: 12000,
        [fields1[6].id]: [],
        [fields1[7].id]: ['Marketing'],
        [fields1[8].id]: 'Focus on social media.',
        [fields1[9].id]: false
      }
    },
    {
      id: generateId('rec'),
      createdTime: new Date().toISOString(),
      fields: {
        [fields1[0].id]: 'Database Migration',
        [fields1[1].id]: 'Done',
        [fields1[2].id]: 3,
        [fields1[3].id]: { name: 'Charlie', avatar: 'https://picsum.photos/100/100?random=3' },
        [fields1[4].id]: '2023-11-01',
        [fields1[5].id]: 2500,
        [fields1[6].id]: [{ url: 'https://picsum.photos/300/200?random=11', name: 'schema.pdf' }],
        [fields1[7].id]: ['Dev'],
        [fields1[8].id]: 'Completed ahead of schedule.',
        [fields1[9].id]: true
      }
    }
  ];

  // Views for Table 1
  const views1 = [
    { id: generateId('view'), name: 'Grid View', type: 'grid' },
    { id: generateId('view'), name: 'Kanban Board', type: 'kanban', groupFieldId: fields1[1].id },
    { id: generateId('view'), name: 'Gallery', type: 'gallery' },
    { id: generateId('view'), name: 'Input Form', type: 'form' }
  ];

  return {
    bases: {
      [baseId]: {
        id: baseId,
        name: 'Project Tracker',
        color: 'bg-orange-500',
        tables: [table1Id, table2Id]
      }
    },
    tables: {
      [table1Id]: {
        id: table1Id,
        name: 'Tasks',
        baseId: baseId,
        fields: fields1,
        records: records1,
        views: views1,
        activeViewId: views1[0].id
      },
      [table2Id]: {
        id: table2Id,
        name: 'Team',
        baseId: baseId,
        fields: [
          { id: generateId('fld'), name: 'Name', type: FIELD_TYPES.TEXT, primary: true },
          { id: generateId('fld'), name: 'Role', type: FIELD_TYPES.SINGLE_SELECT, options: [{id:'r1', name:'Manager'}, {id:'r2', name:'IC'}] },
          { id: generateId('fld'), name: 'Email', type: FIELD_TYPES.EMAIL },
        ],
        records: [
          { id: generateId('rec'), createdTime: new Date().toISOString(), fields: {} }
        ],
        views: [{ id: generateId('view'), name: 'All Team', type: 'grid' }],
        activeViewId: null // Will resolve dynamically
      }
    },
    activeBaseId: baseId,
    activeTableId: table1Id,
    ui: {
      searchQuery: ''
    },
    activityLog: []
  };
};
