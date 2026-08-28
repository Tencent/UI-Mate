const STORAGE_KEY = 'google_docs_mock_state';
const INITIAL_KEY = 'google_docs_mock_initial';

export const initialData = {
  currentUser: {
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://picsum.photos/100/100?random=user1'
  },
  users: [
    { id: 'user-1', name: 'Demo User', email: 'demo@example.com', avatar: 'https://picsum.photos/100/100?random=user1' },
    { id: 'user-2', name: 'Alice Chen', email: 'alice@example.com', avatar: 'https://picsum.photos/100/100?random=user2' },
    { id: 'user-3', name: 'Bob Smith', email: 'bob@example.com', avatar: 'https://picsum.photos/100/100?random=user3' }
  ],
  documents: {
    'doc-1': {
      id: 'doc-1',
      title: 'Project Proposal',
      content: '<h1>Project Proposal</h1><p>This document outlines the goals, timeline, and deliverables for the upcoming project.</p><h2>Goals</h2><ul><li>Improve user engagement by 25%</li><li>Launch new dashboard by Q2</li><li>Reduce page load time to under 2 seconds</li></ul><h2>Timeline</h2><p>Phase 1: January - March (Research &amp; Design)</p><p>Phase 2: April - June (Development &amp; Testing)</p><h2>Team</h2><p>Lead: Demo User</p><p>Design: Alice Chen</p><p>Engineering: Bob Smith</p>',
      ownerId: 'user-1',
      starred: true,
      created: '2025-01-15T10:00:00Z',
      updated: '2025-02-18T14:30:00Z',
      sharedWith: [
        { userId: 'user-2', permission: 'editor' },
        { userId: 'user-3', permission: 'viewer' }
      ],
      linkSharing: { enabled: false, permission: 'viewer' }
    },
    'doc-2': {
      id: 'doc-2',
      title: 'Meeting Notes - Feb 2025',
      content: '<h1>Meeting Notes</h1><h2>Date: February 14, 2025</h2><h3>Attendees</h3><p>Demo User, Alice Chen, Bob Smith</p><h3>Agenda</h3><ol><li>Review Q1 progress</li><li>Discuss new feature requests</li><li>Plan sprint goals</li></ol><h3>Action Items</h3><ul><li>Demo User: Update project timeline</li><li>Alice: Share design mockups by Friday</li><li>Bob: Set up staging environment</li></ul>',
      ownerId: 'user-1',
      starred: false,
      created: '2025-02-14T09:00:00Z',
      updated: '2025-02-14T11:00:00Z',
      sharedWith: [{ userId: 'user-2', permission: 'editor' }],
      linkSharing: { enabled: true, permission: 'viewer' }
    },
    'doc-3': {
      id: 'doc-3',
      title: 'API Documentation',
      content: '<h1>API Documentation</h1><p>REST API reference for the application backend.</p><h2>Authentication</h2><p>All API requests require a Bearer token in the Authorization header.</p><h2>Endpoints</h2><h3>GET /api/users</h3><p>Returns a list of all users.</p><h3>POST /api/documents</h3><p>Creates a new document. Required fields: title, content.</p><h3>PUT /api/documents/:id</h3><p>Updates an existing document.</p>',
      ownerId: 'user-2',
      starred: false,
      created: '2025-01-20T08:00:00Z',
      updated: '2025-02-10T16:45:00Z',
      sharedWith: [
        { userId: 'user-1', permission: 'editor' },
        { userId: 'user-3', permission: 'commenter' }
      ],
      linkSharing: { enabled: false, permission: 'viewer' }
    },
    'doc-4': {
      id: 'doc-4',
      title: 'Weekly Status Report',
      content: '<h1>Weekly Status Report</h1><h2>Week of February 10-14, 2025</h2><h3>Completed</h3><ul><li>Finished authentication module</li><li>Deployed database migration</li><li>Code review for PR #142</li></ul><h3>In Progress</h3><ul><li>Dashboard redesign (70% complete)</li><li>Performance optimization</li></ul><h3>Blocked</h3><ul><li>Waiting on design approval for mobile layout</li></ul>',
      ownerId: 'user-1',
      starred: true,
      created: '2025-02-10T08:00:00Z',
      updated: '2025-02-14T17:00:00Z',
      sharedWith: [],
      linkSharing: { enabled: false, permission: 'viewer' }
    },
    'doc-5': {
      id: 'doc-5',
      title: 'Onboarding Guide',
      content: '<h1>New Employee Onboarding Guide</h1><p>Welcome to the team! This guide will help you get set up.</p><h2>Day 1</h2><ol><li>Set up your workstation</li><li>Install required software</li><li>Join Slack channels</li></ol><h2>Week 1</h2><ol><li>Complete security training</li><li>Meet your team members</li><li>Review codebase documentation</li></ol><h2>Month 1</h2><ol><li>Complete first project milestone</li><li>Schedule 1-on-1 with manager</li><li>Submit feedback on onboarding experience</li></ol>',
      ownerId: 'user-3',
      starred: false,
      created: '2024-12-01T10:00:00Z',
      updated: '2025-01-05T09:30:00Z',
      sharedWith: [
        { userId: 'user-1', permission: 'viewer' },
        { userId: 'user-2', permission: 'viewer' }
      ],
      linkSharing: { enabled: true, permission: 'viewer' }
    }
  },
  comments: [
    {
      id: 'comment-1',
      docId: 'doc-1',
      userId: 'user-2',
      content: 'Should we add budget estimates to the proposal?',
      resolved: false,
      created: '2025-02-12T09:00:00Z',
      quotedText: 'goals, timeline, and deliverables',
      replies: [
        { id: 'reply-1', userId: 'user-1', content: 'Good idea, I will add a budget section.', created: '2025-02-12T10:30:00Z' }
      ]
    },
    {
      id: 'comment-2',
      docId: 'doc-1',
      userId: 'user-3',
      content: 'The Q2 launch date might be too aggressive. Can we discuss?',
      resolved: false,
      created: '2025-02-15T14:00:00Z',
      quotedText: 'Launch new dashboard by Q2',
      replies: []
    },
    {
      id: 'comment-3',
      docId: 'doc-2',
      userId: 'user-2',
      content: 'I have shared the mockups in the shared drive.',
      resolved: true,
      created: '2025-02-15T08:00:00Z',
      quotedText: 'Share design mockups by Friday',
      replies: []
    }
  ],
  ui: {
    currentDocId: null,
    sidebarOpen: false,
    sidebarTab: 'comments',
    shareDialogOpen: false,
    findReplaceOpen: false,
    viewMode: 'editing',
    zoom: 100,
    documentListView: 'grid',
    searchQuery: ''
  }
};

// Session isolation helpers
export function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('docs_mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('docs_mock_sid') || null;
}

function storageKey(sid) {
  return sid ? `${STORAGE_KEY}_${sid}` : STORAGE_KEY;
}

function initialKeyForSid(sid) {
  return sid ? `${INITIAL_KEY}_${sid}` : INITIAL_KEY;
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
  return result;
}

export async function fetchCustomState(sid) {
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
}

export function loadData() {
  try {
    const sid = getSessionId();
    const sk = storageKey(sid);
    const ik = initialKeyForSid(sid);

    // Check if there's existing data in localStorage (refresh case)
    const saved = localStorage.getItem(sk);
    if (saved) {
      if (!localStorage.getItem(ik)) {
        localStorage.setItem(ik, saved);
      }
      return JSON.parse(saved);
    }

    // No saved state: use defaults
    const data = JSON.parse(JSON.stringify(initialData));
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  } catch {
    return JSON.parse(JSON.stringify(initialData));
  }
}

export function initializeWithCustomState(sid, customState) {
  const sk = storageKey(sid);
  const ik = initialKeyForSid(sid);
  const defaults = JSON.parse(JSON.stringify(initialData));
  const data = deepMergeWithDefaults(defaults, customState);
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
}

export function saveData(state) {
  try {
    const sid = getSessionId();
    const key = storageKey(sid);
    localStorage.setItem(key, JSON.stringify(state));
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state, merge: false })
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function getInitialState() {
  try {
    const sid = getSessionId();
    const stored = localStorage.getItem(initialKeyForSid(sid));
    if (stored) return JSON.parse(stored);
  } catch {}
  return JSON.parse(JSON.stringify(initialData));
}
