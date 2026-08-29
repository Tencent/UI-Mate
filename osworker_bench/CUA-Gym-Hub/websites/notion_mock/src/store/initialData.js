import { generateId } from '../utils/helpers';

// --- Session-aware storage functions ---
const BASE_STORAGE_KEY = 'xotion-clone-state';
const BASE_INITIAL_KEY = 'xotion-clone-initialState';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

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
    if (resp.ok) { const d = await resp.json(); if (d.has_custom_state && d.stored_state) return d.stored_state; }
  } catch (e) {
    console.warn('[notion_mock] Custom state fetch unavailable:', e);
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
    console.warn('[notion_mock] Server state sync unavailable:', e);
  });
};

export const getInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);
  if (customState) {
    const data = deepMergeWithDefaults(createDefaultData(), customState);
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

// --- Data normalization functions ---
// These ensure malformed POST data gets safe defaults for all required fields.

function normalizeUser(user) {
  if (!user || typeof user !== 'object') return undefined;
  return {
    id: user.id || 'user-unknown',
    name: typeof user.name === 'string' ? user.name : 'Unknown User',
    email: typeof user.email === 'string' ? user.email : '',
    avatar: typeof user.avatar === 'string' ? user.avatar : '',
  };
}

function normalizeWorkspace(workspace) {
  if (!workspace || typeof workspace !== 'object') return undefined;
  return {
    id: workspace.id || 'ws-unknown',
    name: typeof workspace.name === 'string' ? workspace.name : 'Workspace',
    icon: typeof workspace.icon === 'string' ? workspace.icon : '',
    members: Array.isArray(workspace.members) ? workspace.members : [],
  };
}

function normalizeDatabaseProperty(prop) {
  if (!prop || typeof prop !== 'object') return null;
  return {
    id: prop.id || generateId(),
    name: typeof prop.name === 'string' ? prop.name : 'Untitled Property',
    type: typeof prop.type === 'string' ? prop.type : 'text',
    ...((prop.type === 'select' || prop.type === 'multi-select' || prop.type === 'status')
      ? { options: Array.isArray(prop.options) ? prop.options : [] } : {}),
  };
}

function normalizeView(view) {
  if (!view || typeof view !== 'object') return null;
  return {
    id: view.id || generateId(),
    name: typeof view.name === 'string' ? view.name : 'Untitled View',
    type: typeof view.type === 'string' ? view.type : 'table',
    filters: Array.isArray(view.filters) ? view.filters : [],
    sorts: Array.isArray(view.sorts) ? view.sorts : [],
    groupBy: view.groupBy != null ? view.groupBy : null,
    visibleProperties: Array.isArray(view.visibleProperties) ? view.visibleProperties : [],
  };
}

function normalizePage(page, id) {
  if (!page || typeof page !== 'object') return null;
  const now = new Date().toISOString();
  const pageId = page.id || id || generateId();

  // Base fields shared by all page types
  const base = {
    id: pageId,
    title: typeof page.title === 'string' ? page.title : '(Untitled)',
    icon: page.icon != null ? page.icon : '',
    parentId: page.parentId != null ? page.parentId : null,
    createdDate: typeof page.createdDate === 'string' ? page.createdDate : now,
    lastEditedDate: page.lastEditedDate != null ? page.lastEditedDate : undefined,
  };

  // Database page
  if (page.type === 'database') {
    const rawProps = Array.isArray(page.properties) ? page.properties : [];
    const rawViews = Array.isArray(page.views) ? page.views : [];
    return {
      ...base,
      type: 'database',
      cover: page.cover != null ? page.cover : null,
      viewType: typeof page.viewType === 'string' ? page.viewType : 'table',
      favorite: typeof page.favorite === 'boolean' ? page.favorite : false,
      properties: rawProps.map(normalizeDatabaseProperty).filter(Boolean),
      views: rawViews.map(normalizeView).filter(Boolean),
      items: Array.isArray(page.items) ? page.items : [],
      blockIds: Array.isArray(page.blockIds) ? page.blockIds : [],
    };
  }

  // Regular page (may also be a database item with properties as an object)
  return {
    ...base,
    cover: page.cover != null ? page.cover : null,
    blockIds: Array.isArray(page.blockIds) ? page.blockIds : [],
    favorite: typeof page.favorite === 'boolean' ? page.favorite : false,
    properties: (page.properties && typeof page.properties === 'object' && !Array.isArray(page.properties))
      ? page.properties
      : {},
  };
}

function normalizeBlock(block, id) {
  if (!block || typeof block !== 'object') return null;
  const now = new Date().toISOString();
  return {
    id: block.id || id || generateId(),
    type: typeof block.type === 'string' ? block.type : 'text',
    content: typeof block.content === 'string' ? block.content : '',
    properties: (block.properties && typeof block.properties === 'object' && !Array.isArray(block.properties))
      ? block.properties
      : {},
    createdDate: typeof block.createdDate === 'string' ? block.createdDate : now,
    lastEditedDate: block.lastEditedDate != null ? block.lastEditedDate : undefined,
  };
}

function normalizePages(pages) {
  if (!pages || typeof pages !== 'object' || Array.isArray(pages)) return {};
  const result = {};
  for (const key in pages) {
    const normalized = normalizePage(pages[key], key);
    if (normalized) {
      result[key] = normalized;
    }
  }
  return result;
}

function normalizeBlocks(blocks) {
  if (!blocks || typeof blocks !== 'object' || Array.isArray(blocks)) return {};
  const result = {};
  for (const key in blocks) {
    const normalized = normalizeBlock(blocks[key], key);
    if (normalized) {
      result[key] = normalized;
    }
  }
  return result;
}

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

  // Normalize top-level collection fields after merging
  if (result.user) {
    result.user = normalizeUser(result.user);
  }
  if (result.workspace) {
    result.workspace = normalizeWorkspace(result.workspace);
  }
  if (result.pages) {
    result.pages = normalizePages(result.pages);
  }
  if (result.blocks) {
    result.blocks = normalizeBlocks(result.blocks);
  }

  // Ensure trash is always an array
  if (!Array.isArray(result.trash)) {
    result.trash = [];
  }

  return result;
}

// --- Default data creation ---

const userId = 'user-1';
const workspaceId = 'ws-1';

const createBlock = (type, content = '', props = {}) => ({
  id: generateId(),
  type,
  content,
  properties: props,
  createdDate: new Date().toISOString(),
  lastEditedDate: new Date().toISOString(),
});

function createDefaultData() {
  const page1Id = generateId();
  const page2Id = generateId();
  const page3Id = generateId();
  const page4Id = generateId();
  const page5Id = generateId();
  const page6Id = generateId();
  const page7Id = generateId();
  const page8Id = generateId();
  const page9Id = generateId();
  const page10Id = generateId();
  const db1Id = generateId();

  const data = {
    user: {
      id: userId,
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      avatar: 'https://picsum.photos/100/100?random=user0',
    },
    workspace: {
      id: workspaceId,
      name: "Sarah's Workspace",
      icon: '\u{1F680}',
      members: [userId],
    },
    pages: {
      [page1Id]: {
        id: page1Id,
        title: 'Getting Started',
        icon: '\u{1F44B}',
        cover: 'https://picsum.photos/1500/400?random=cover1',
        parentId: null,
        blockIds: [],
        favorite: true,
        createdDate: new Date().toISOString(),
      },
      [page2Id]: {
        id: page2Id,
        title: 'Team Wiki',
        icon: '\u{1F4DA}',
        cover: null,
        parentId: null,
        blockIds: [],
        favorite: false,
        createdDate: new Date().toISOString(),
      },
      [page3Id]: {
        id: page3Id,
        title: 'Meeting Notes',
        icon: '\u{1F4C5}',
        cover: null,
        parentId: page2Id,
        blockIds: [],
        favorite: false,
        createdDate: new Date().toISOString(),
      },
      [db1Id]: {
        id: db1Id,
        title: 'Product Roadmap',
        icon: '\u{1F5FA}\uFE0F',
        type: 'database',
        viewType: 'board',
        parentId: null,
        properties: [
          { id: 'prop-status', name: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Done'] },
          { id: 'prop-assignee', name: 'Assignee', type: 'person' },
          { id: 'prop-date', name: 'Due Date', type: 'date' },
          { id: 'prop-priority', name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
        ],
        views: [
          { id: 'view-board', name: 'Board View', type: 'board', groupBy: 'prop-status', filters: [], sorts: [], visibleProperties: ['prop-status', 'prop-assignee', 'prop-date', 'prop-priority'] },
          { id: 'view-table', name: 'Table View', type: 'table', groupBy: null, filters: [], sorts: [], visibleProperties: ['prop-status', 'prop-assignee', 'prop-date', 'prop-priority'] },
        ],
        items: [],
        blockIds: [],
        favorite: false,
        createdDate: new Date().toISOString(),
      },
      [page4Id]: {
        id: page4Id,
        title: 'Design System',
        icon: '\u{1F3A8}',
        parentId: page2Id,
        blockIds: [],
        favorite: false,
        createdDate: new Date().toISOString(),
      },
      [page5Id]: {
        id: page5Id,
        title: 'Onboarding Guide',
        icon: '\u{1F9ED}',
        parentId: page2Id,
        blockIds: [],
        favorite: false,
        createdDate: new Date().toISOString(),
      },
      [page6Id]: {
        id: page6Id,
        title: 'Personal Home',
        icon: '\u{1F3E0}',
        parentId: null,
        blockIds: [],
        favorite: true,
        createdDate: new Date().toISOString(),
      },
      [page7Id]: {
        id: page7Id,
        title: 'Reading List',
        icon: '\u{1F4D6}',
        parentId: page6Id,
        blockIds: [],
        favorite: false,
        createdDate: new Date().toISOString(),
      },
      [page8Id]: {
        id: page8Id,
        title: 'Recipes',
        icon: '\u{1F373}',
        parentId: page6Id,
        blockIds: [],
        favorite: false,
        createdDate: new Date().toISOString(),
      },
      [page9Id]: {
        id: page9Id,
        title: 'Travel Plans',
        icon: '\u2708\uFE0F',
        parentId: page6Id,
        blockIds: [],
        favorite: false,
        createdDate: new Date().toISOString(),
      },
      [page10Id]: {
        id: page10Id,
        title: 'Project Specs',
        icon: '\u{1F4D1}',
        parentId: null,
        blockIds: [],
        favorite: false,
        createdDate: new Date().toISOString(),
      }
    },
    blocks: {},
    trash: [],
    comments: {},
    settings: {
      appearance: 'light',
      startWeekMonday: false,
      fontSize: 'default',
    },
    notifications: [
      { id: 'notif-1', type: 'edit', userId: 'user-1', pageTitle: 'Getting Started', pageId: null, message: 'Sarah Chen edited Getting Started', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false },
      { id: 'notif-2', type: 'comment', userId: 'user-1', pageTitle: 'Meeting Notes', pageId: null, message: 'New comment on Meeting Notes', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: false },
      { id: 'notif-3', type: 'edit', userId: 'user-1', pageTitle: 'Product Roadmap', pageId: null, message: 'Sarah Chen updated Product Roadmap', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: false },
      { id: 'notif-4', type: 'mention', userId: 'user-1', pageTitle: 'Design System', pageId: null, message: 'You were mentioned in Design System', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), read: true },
      { id: 'notif-5', type: 'edit', userId: 'user-1', pageTitle: 'Team Wiki', pageId: null, message: 'Sarah Chen reorganized Team Wiki', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), read: true },
      { id: 'notif-6', type: 'comment', userId: 'user-1', pageTitle: 'Personal Home', pageId: null, message: 'Comment resolved on Personal Home', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), read: true },
      { id: 'notif-7', type: 'edit', userId: 'user-1', pageTitle: 'Onboarding Guide', pageId: null, message: 'Sarah Chen added new steps to Onboarding Guide', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), read: true },
    ],
    pageOrder: [],
  };

  // Helper to add blocks to a page
  const addBlocksToPage = (pageId, blocks) => {
    blocks.forEach(block => {
      data.blocks[block.id] = block;
      data.pages[pageId].blockIds.push(block.id);
    });
  };

  // Populate Page 1: Getting Started
  addBlocksToPage(page1Id, [
    createBlock('heading-1', 'Welcome to your new workspace!'),
    createBlock('text', 'This is a mock version of a block-based editor. You can click anywhere to start typing.'),
    createBlock('callout', '\u{1F4A1} Tip: Type "/" to see available commands.'),
    createBlock('heading-2', 'Features to try'),
    createBlock('todo', 'Try dragging blocks to reorder them'),
    createBlock('todo', 'Create a new page from the sidebar'),
    createBlock('todo', 'Try the slash command menu (Type "/")'),
    createBlock('divider'),
    createBlock('quote', 'Simplicity is the ultimate sophistication.'),
    createBlock('image', '', { url: 'https://picsum.photos/800/400?random=img1', caption: 'A random placeholder image' }),
  ]);

  // Populate Page 2: Team Wiki
  addBlocksToPage(page2Id, [
    createBlock('heading-1', 'Engineering Team Wiki'),
    createBlock('text', 'Central hub for all engineering resources and documentation.'),
    createBlock('heading-2', 'Quick Links'),
    createBlock('bullet-list', 'GitHub Repository'),
    createBlock('bullet-list', 'Jira Board'),
    createBlock('bullet-list', 'Figma Designs'),
  ]);

  // Populate Page 3: Meeting Notes
  addBlocksToPage(page3Id, [
    createBlock('heading-1', 'Weekly Sync - Oct 24'),
    createBlock('heading-3', 'Attendees'),
    createBlock('text', '@Sarah, @Mike, @John'),
    createBlock('heading-3', 'Agenda'),
    createBlock('bullet-list', 'Review Q3 Goals'),
    createBlock('bullet-list', 'Discuss Roadmap'),
    createBlock('heading-3', 'Action Items'),
    createBlock('todo', 'Update documentation'),
    createBlock('todo', 'Schedule follow-up'),
  ]);

  // Populate Page 4: Design System
  addBlocksToPage(page4Id, [
    createBlock('heading-1', 'Design System'),
    createBlock('text', 'Our design system ensures consistency across all products.'),
    createBlock('heading-2', 'Colors'),
    createBlock('text', 'Primary: #0B6FFF'),
    createBlock('text', 'Secondary: #37352F'),
    createBlock('heading-2', 'Typography'),
    createBlock('text', 'Headings: Sans-serif'),
    createBlock('text', 'Body: Serif (optional)'),
  ]);

  // Populate Page 6: Personal Home
  addBlocksToPage(page6Id, [
    createBlock('heading-1', 'Personal Dashboard'),
    createBlock('callout', '\u{1F3AF} Focus for the week: Complete the Xotion Clone.'),
    createBlock('heading-2', 'Habits'),
    createBlock('todo', 'Read 30 mins'),
    createBlock('todo', 'Exercise'),
    createBlock('todo', 'Drink water'),
  ]);

  // Populate Database Items
  const item1Id = generateId();
  const item2Id = generateId();
  const item3Id = generateId();
  const item4Id = generateId();
  const item5Id = generateId();

  data.pages[item1Id] = {
    id: item1Id,
    title: 'Q1 Planning',
    icon: '\u{1F4DD}',
    parentId: db1Id,
    blockIds: [],
    properties: {
      'prop-status': 'Done',
      'prop-assignee': [userId],
      'prop-date': '2024-10-15',
      'prop-priority': 'High',
    },
    createdDate: new Date().toISOString(),
  };

  data.pages[item2Id] = {
    id: item2Id,
    title: 'Launch MVP',
    icon: '\u{1F680}',
    parentId: db1Id,
    blockIds: [],
    properties: {
      'prop-status': 'In Progress',
      'prop-assignee': [userId],
      'prop-date': '2024-11-01',
      'prop-priority': 'High',
    },
    createdDate: new Date().toISOString(),
  };

  data.pages[item3Id] = {
    id: item3Id,
    title: 'User Testing',
    icon: '\u{1F9EA}',
    parentId: db1Id,
    blockIds: [],
    properties: {
      'prop-status': 'Not Started',
      'prop-assignee': [],
      'prop-date': '2024-12-01',
      'prop-priority': 'Medium',
    },
    createdDate: new Date().toISOString(),
  };

  data.pages[item4Id] = {
    id: item4Id,
    title: 'Marketing Campaign',
    icon: '\u{1F4E2}',
    parentId: db1Id,
    blockIds: [],
    properties: {
      'prop-status': 'In Progress',
      'prop-assignee': [userId],
      'prop-date': '2024-11-15',
      'prop-priority': 'Medium',
    },
    createdDate: new Date().toISOString(),
  };

  data.pages[item5Id] = {
    id: item5Id,
    title: 'Analytics Setup',
    icon: '\u{1F4CA}',
    parentId: db1Id,
    blockIds: [],
    properties: {
      'prop-status': 'Not Started',
      'prop-assignee': [],
      'prop-date': '2024-12-10',
      'prop-priority': 'Low',
    },
    createdDate: new Date().toISOString(),
  };

  data.pages[db1Id].items = [item1Id, item2Id, item3Id, item4Id, item5Id];

  // --- Reading Tracker Database ---
  const db2Id = generateId();
  const book1Id = generateId();
  const book2Id = generateId();
  const book3Id = generateId();
  const book4Id = generateId();
  const book5Id = generateId();

  data.pages[db2Id] = {
    id: db2Id,
    title: 'Reading Tracker',
    icon: '\u{1F4DA}',
    type: 'database',
    viewType: 'table',
    parentId: null,
    cover: null,
    favorite: false,
    properties: [
      { id: 'rt-author', name: 'Author', type: 'text' },
      { id: 'rt-status', name: 'Status', type: 'select', options: ['Want to Read', 'Reading', 'Finished'] },
      { id: 'rt-rating', name: 'Rating', type: 'select', options: ['\u2B50', '\u2B50\u2B50', '\u2B50\u2B50\u2B50', '\u2B50\u2B50\u2B50\u2B50', '\u2B50\u2B50\u2B50\u2B50\u2B50'] },
      { id: 'rt-genre', name: 'Genre', type: 'multi-select', options: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'Self-Help'] },
      { id: 'rt-date', name: 'Date Finished', type: 'date' },
    ],
    views: [
      { id: 'rt-view-table', name: 'Table View', type: 'table', groupBy: null, filters: [], sorts: [], visibleProperties: ['rt-author', 'rt-status', 'rt-rating', 'rt-genre', 'rt-date'] },
      { id: 'rt-view-gallery', name: 'Gallery View', type: 'gallery', groupBy: null, filters: [], sorts: [], visibleProperties: ['rt-author', 'rt-status', 'rt-rating'] },
    ],
    items: [],
    blockIds: [],
    createdDate: new Date().toISOString(),
  };

  data.pages[book1Id] = {
    id: book1Id, title: 'Atomic Habits', icon: '\u{1F4D7}', parentId: db2Id, blockIds: [],
    properties: { 'rt-author': 'James Clear', 'rt-status': 'Finished', 'rt-rating': '\u2B50\u2B50\u2B50\u2B50\u2B50', 'rt-genre': ['Self-Help', 'Non-Fiction'], 'rt-date': '2024-08-15' },
    createdDate: new Date().toISOString(),
  };
  data.pages[book2Id] = {
    id: book2Id, title: 'Dune', icon: '\u{1F4D8}', parentId: db2Id, blockIds: [],
    properties: { 'rt-author': 'Frank Herbert', 'rt-status': 'Finished', 'rt-rating': '\u2B50\u2B50\u2B50\u2B50', 'rt-genre': ['Fiction', 'Sci-Fi'], 'rt-date': '2024-06-20' },
    createdDate: new Date().toISOString(),
  };
  data.pages[book3Id] = {
    id: book3Id, title: 'Thinking, Fast and Slow', icon: '\u{1F4D9}', parentId: db2Id, blockIds: [],
    properties: { 'rt-author': 'Daniel Kahneman', 'rt-status': 'Reading', 'rt-rating': '', 'rt-genre': ['Non-Fiction'], 'rt-date': '' },
    createdDate: new Date().toISOString(),
  };
  data.pages[book4Id] = {
    id: book4Id, title: 'The Martian', icon: '\u{1F4D5}', parentId: db2Id, blockIds: [],
    properties: { 'rt-author': 'Andy Weir', 'rt-status': 'Want to Read', 'rt-rating': '', 'rt-genre': ['Fiction', 'Sci-Fi'], 'rt-date': '' },
    createdDate: new Date().toISOString(),
  };
  data.pages[book5Id] = {
    id: book5Id, title: 'Steve Jobs', icon: '\u{1F4D3}', parentId: db2Id, blockIds: [],
    properties: { 'rt-author': 'Walter Isaacson', 'rt-status': 'Finished', 'rt-rating': '\u2B50\u2B50\u2B50\u2B50', 'rt-genre': ['Biography', 'Non-Fiction'], 'rt-date': '2024-03-10' },
    createdDate: new Date().toISOString(),
  };

  data.pages[db2Id].items = [book1Id, book2Id, book3Id, book4Id, book5Id];

  // Set pageOrder for root pages
  data.pageOrder = [page1Id, page2Id, db1Id, page6Id, page10Id, db2Id];

  // Fix notification pageIds to match generated IDs
  data.notifications[0].pageId = page1Id;
  data.notifications[1].pageId = page3Id;
  data.notifications[2].pageId = db1Id;
  data.notifications[3].pageId = page4Id;
  data.notifications[4].pageId = page2Id;
  data.notifications[5].pageId = page6Id;
  data.notifications[6].pageId = page5Id;

  // --- Enrich block content for existing pages ---

  // Add code block to Design System page
  addBlocksToPage(page4Id, [
    createBlock('code', 'const primaryColor = "#0B6FFF";\nconst textColor = "#37352F";\nconst bgColor = "#FFFFFF";\n\nfunction applyTheme(element) {\n  element.style.color = textColor;\n  element.style.backgroundColor = bgColor;\n}', { language: 'javascript' }),
    createBlock('toggle', 'Font Scale Reference', { collapsed: false }),
    createBlock('table', '', {
      headers: ['Size', 'Weight', 'Usage'],
      rows: [
        ['14px', 'Regular (400)', 'Body text'],
        ['16px', 'Medium (500)', 'Subheadings'],
        ['24px', 'Bold (700)', 'Page titles'],
      ],
    }),
  ]);

  // Add enriched blocks to Onboarding Guide
  addBlocksToPage(page5Id, [
    createBlock('heading-1', 'Getting Started Guide'),
    createBlock('text', 'Welcome to the team! Follow these steps to get set up.'),
    createBlock('callout', '\u{1F525} Complete all steps within your first week.', { icon: '\u{1F525}', bgColor: 'orange_background' }),
    createBlock('numbered-list', 'Set up your development environment'),
    createBlock('numbered-list', 'Read the engineering wiki'),
    createBlock('numbered-list', 'Schedule 1:1 with your manager'),
    createBlock('divider'),
    createBlock('toggle', 'Environment Setup Details', { collapsed: false }),
    createBlock('code', '# Clone the repository\ngit clone git@github.com:team/project.git\ncd project\nnpm install\nnpm run dev', { language: 'bash' }),
  ]);

  // Add enriched blocks to Reading List page
  addBlocksToPage(page7Id, [
    createBlock('heading-1', 'Reading List'),
    createBlock('callout', '\u{1F4DA} Track your reading progress here.', { icon: '\u{1F4DA}', bgColor: 'blue_background' }),
    createBlock('bullet-list', 'Atomic Habits - James Clear'),
    createBlock('bullet-list', 'Deep Work - Cal Newport'),
    createBlock('bullet-list', 'The Design of Everyday Things - Don Norman'),
    createBlock('quote', 'A reader lives a thousand lives before he dies. The man who never reads lives only one.'),
  ]);

  // Add enriched blocks to Travel Plans page
  addBlocksToPage(page9Id, [
    createBlock('heading-1', 'Travel Plans 2025'),
    createBlock('callout', '\u2708\uFE0F Upcoming trips and dream destinations', { icon: '\u2708\uFE0F', bgColor: 'green_background' }),
    createBlock('heading-2', 'Upcoming Trips'),
    createBlock('table', '', {
      headers: ['Destination', 'Dates', 'Status'],
      rows: [
        ['Tokyo, Japan', 'Mar 15-25', 'Booked'],
        ['Barcelona, Spain', 'Jun 1-10', 'Planning'],
        ['New Zealand', 'Oct 2025', 'Wishlist'],
      ],
    }),
    createBlock('heading-2', 'Bucket List'),
    createBlock('todo', 'Visit the Northern Lights in Iceland', { checked: false }),
    createBlock('todo', 'Hike the Inca Trail to Machu Picchu', { checked: false }),
    createBlock('todo', 'Safari in Tanzania', { checked: false }),
  ]);

  // Add enriched blocks to Recipes page
  addBlocksToPage(page8Id, [
    createBlock('heading-1', 'Favorite Recipes'),
    createBlock('callout', '\u{1F468}\u200D\u{1F373} Quick and easy meals for busy weeknights', { icon: '\u{1F468}\u200D\u{1F373}' }),
    createBlock('toggle', 'Pasta Aglio e Olio', { collapsed: true }),
    createBlock('toggle', 'Chicken Stir Fry', { collapsed: true }),
    createBlock('toggle', 'Mediterranean Salad', { collapsed: true }),
  ]);

  return data;
}

// Export for backward compatibility
export const initialData = createDefaultData();
