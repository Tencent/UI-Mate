import { AppState, FileSystemItem, User, SharedUser } from './types';

const BASE_STORAGE_KEY = 'mock_drive_state';
const BASE_INITIAL_KEY = 'mock_drive_initialState';

function storageKey(sid: string | null): string {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid: string | null): string {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid: string | null = null): Promise<Record<string, any> | null> => {
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

export const saveState = (state: AppState, sid: string | null = null): void => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state, merge: false })
  }).catch(() => {});
};

export const getInitialState = (sid: string | null = null): AppState | null => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// Top-level keys whose value is a catalog (record of id -> entity). When the
// injected state provides one of these, we REPLACE it wholesale rather than
// deep-merging: otherwise the default sample catalog (21 demo items, 5 demo
// users) leaks into the task's clean scene and typically breaks the render
// (e.g. task-injected currentUser 'user_001' would "own" all 21 default items,
// crowding the ROOT view and mixing incompatible fixtures). This mirrors how
// arrays are already replaced wholesale.
const REPLACE_TOPLEVEL_KEYS = new Set(['items', 'users']);

function deepMergeWithDefaults(defaults: any, custom: any, depth: number = 0): any {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      const isTopLevelReplaceKey = depth === 0 && REPLACE_TOPLEVEL_KEYS.has(key);
      if (!isTopLevelReplaceKey &&
          typeof custom[key] === 'object' && !Array.isArray(custom[key]) &&
          typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key], depth + 1);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export const initializeData = (sid: string | null = null, customState: Record<string, any> | null = null): AppState => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = deepMergeWithDefaults(getDefaultData(), customState);
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

  const data = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

const d = (isoStr: string): number => new Date(isoStr).getTime();

const USERS: Record<string, User> = {
  'user_001': {
    id: 'user_001',
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=1A73E8&color=fff&size=64'
  },
  'user_002': {
    id: 'user_002',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=0B8043&color=fff&size=64'
  },
  'user_003': {
    id: 'user_003',
    name: 'Mike Williams',
    email: 'mike.williams@company.com',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Williams&background=E52592&color=fff&size=64'
  },
  'user_004': {
    id: 'user_004',
    name: 'Emily Davis',
    email: 'emily.davis@gmail.com',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=F4B400&color=fff&size=64'
  },
  'user_005': {
    id: 'user_005',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=EA4335&color=fff&size=64'
  }
};

const ITEMS: Record<string, FileSystemItem> = {
  // === ROOT FOLDERS ===
  'folder_001': {
    id: 'folder_001',
    parentId: null,
    name: 'Work Projects',
    type: 'folder',
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [{ userId: 'user_002', role: 'editor', addedAt: '2026-01-10T08:00:00Z' }],
    starred: true,
    trashed: false,
    color: '#4285F4',
    createdAt: d('2025-06-01T10:00:00Z'),
    modifiedAt: d('2026-03-01T14:00:00Z'),
    accessedAt: d('2026-03-07T09:15:00Z'),
    description: 'All work-related projects and deliverables'
  },
  'folder_002': {
    id: 'folder_002',
    parentId: null,
    name: 'Personal',
    type: 'folder',
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-07-15T10:00:00Z'),
    modifiedAt: d('2026-02-10T11:30:00Z'),
    accessedAt: d('2026-03-05T16:00:00Z'),
    description: ''
  },
  'folder_003': {
    id: 'folder_003',
    parentId: null,
    name: 'Photos',
    type: 'folder',
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [],
    starred: true,
    trashed: false,
    color: null,
    createdAt: d('2025-08-20T10:00:00Z'),
    modifiedAt: d('2026-01-20T10:00:00Z'),
    accessedAt: d('2026-03-06T12:00:00Z'),
    description: ''
  },
  'folder_004': {
    id: 'folder_004',
    parentId: null,
    name: 'Shared Documents',
    type: 'folder',
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [
      { userId: 'user_002', role: 'viewer', addedAt: '2025-11-01T09:00:00Z' },
      { userId: 'user_003', role: 'viewer', addedAt: '2025-11-01T09:00:00Z' }
    ],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-10-05T10:00:00Z'),
    modifiedAt: d('2026-02-28T15:00:00Z'),
    accessedAt: d('2026-03-04T08:30:00Z'),
    description: 'Documents shared with the team'
  },

  // === NESTED FOLDERS ===
  'folder_005': {
    id: 'folder_005',
    parentId: 'folder_001',
    name: 'Q4 Reports',
    type: 'folder',
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [{ userId: 'user_002', role: 'viewer', addedAt: '2026-01-15T10:00:00Z' }],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-10-01T10:00:00Z'),
    modifiedAt: d('2026-02-20T14:22:00Z'),
    accessedAt: d('2026-03-07T09:00:00Z'),
    description: ''
  },
  'folder_006': {
    id: 'folder_006',
    parentId: 'folder_001',
    name: 'Design Assets',
    type: 'folder',
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-09-15T10:00:00Z'),
    modifiedAt: d('2026-01-30T11:00:00Z'),
    accessedAt: d('2026-03-02T14:00:00Z'),
    description: ''
  },
  'folder_007': {
    id: 'folder_007',
    parentId: 'folder_002',
    name: 'Taxes 2025',
    type: 'folder',
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-03-01T10:00:00Z'),
    modifiedAt: d('2025-04-15T18:00:00Z'),
    accessedAt: d('2026-02-01T09:00:00Z'),
    description: ''
  },

  // === GOOGLE WORKSPACE FILES ===
  'file_001': {
    id: 'file_001',
    parentId: 'folder_001',
    name: 'Project Roadmap',
    type: 'doc',
    mimeType: 'application/vnd.google-apps.document',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [
      { userId: 'user_002', role: 'editor', addedAt: '2026-01-10T08:00:00Z' },
      { userId: 'user_003', role: 'viewer', addedAt: '2026-01-20T10:00:00Z' }
    ],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-11-15T10:30:00Z'),
    modifiedAt: d('2026-03-06T16:45:00Z'),
    accessedAt: d('2026-03-07T09:15:00Z'),
    description: 'Q1-Q4 product development roadmap'
  },
  'file_002': {
    id: 'file_002',
    parentId: 'folder_001',
    name: 'Budget 2026',
    type: 'spreadsheet',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [{ userId: 'user_002', role: 'editor', addedAt: '2026-01-05T09:00:00Z' }],
    starred: true,
    trashed: false,
    color: null,
    createdAt: d('2026-01-03T09:00:00Z'),
    modifiedAt: d('2026-03-05T11:20:00Z'),
    accessedAt: d('2026-03-07T08:00:00Z'),
    description: 'Annual budget planning and tracking'
  },
  'file_003': {
    id: 'file_003',
    parentId: 'folder_005',
    name: 'Q4 Revenue Analysis',
    type: 'spreadsheet',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [{ userId: 'user_002', role: 'viewer', addedAt: '2026-01-10T08:00:00Z' }],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-01-10T10:00:00Z'),
    modifiedAt: d('2026-02-15T15:30:00Z'),
    accessedAt: d('2026-03-01T11:00:00Z'),
    description: ''
  },
  'file_004': {
    id: 'file_004',
    parentId: 'folder_001',
    name: 'Team Standup Notes',
    type: 'doc',
    mimeType: 'application/vnd.google-apps.document',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [
      { userId: 'user_002', role: 'editor', addedAt: '2025-12-01T09:00:00Z' },
      { userId: 'user_003', role: 'editor', addedAt: '2025-12-01T09:00:00Z' }
    ],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-12-01T09:00:00Z'),
    modifiedAt: d('2026-03-07T09:30:00Z'),
    accessedAt: d('2026-03-07T09:30:00Z'),
    description: 'Daily standup meeting notes'
  },
  'file_005': {
    id: 'file_005',
    parentId: null,
    name: 'Product Launch Deck',
    type: 'presentation',
    mimeType: 'application/vnd.google-apps.presentation',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [
      { userId: 'user_002', role: 'editor', addedAt: '2026-02-01T10:00:00Z' },
      { userId: 'user_005', role: 'viewer', addedAt: '2026-02-01T10:00:00Z' }
    ],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-01-25T14:00:00Z'),
    modifiedAt: d('2026-03-04T17:00:00Z'),
    accessedAt: d('2026-03-06T10:00:00Z'),
    description: 'Q2 product launch presentation'
  },

  // === UPLOADED FILES ===
  'file_006': {
    id: 'file_006',
    parentId: 'folder_005',
    name: 'Q4_Financial_Report.pdf',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 2457600,
    ownerId: 'user_001',
    sharedWith: [{ userId: 'user_002', role: 'viewer', addedAt: '2026-01-15T10:00:00Z' }],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-01-15T10:00:00Z'),
    modifiedAt: d('2026-01-15T10:00:00Z'),
    accessedAt: d('2026-03-01T14:00:00Z'),
    description: ''
  },
  'file_007': {
    id: 'file_007',
    parentId: 'folder_003',
    name: 'vacation_photo_01.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 3145728,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-08-15T18:30:00Z'),
    modifiedAt: d('2025-08-15T18:30:00Z'),
    accessedAt: d('2026-01-20T10:00:00Z'),
    thumbnailUrl: 'https://picsum.photos/seed/vacation1/400/300',
    description: ''
  },
  'file_008': {
    id: 'file_008',
    parentId: 'folder_003',
    name: 'vacation_photo_02.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 2867200,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-08-16T10:00:00Z'),
    modifiedAt: d('2025-08-16T10:00:00Z'),
    accessedAt: d('2026-01-20T10:00:00Z'),
    thumbnailUrl: 'https://picsum.photos/seed/vacation2/400/300',
    description: ''
  },
  'file_009': {
    id: 'file_009',
    parentId: 'folder_006',
    name: 'logo_final.png',
    type: 'image',
    mimeType: 'image/png',
    size: 524288,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-01-05T14:00:00Z'),
    modifiedAt: d('2026-01-05T14:00:00Z'),
    accessedAt: d('2026-03-02T14:00:00Z'),
    thumbnailUrl: 'https://picsum.photos/seed/logo/400/300',
    description: ''
  },
  'file_010': {
    id: 'file_010',
    parentId: null,
    name: 'meeting_recording.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    size: 52428800,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-02-28T11:00:00Z'),
    modifiedAt: d('2026-02-28T11:00:00Z'),
    accessedAt: d('2026-03-01T09:00:00Z'),
    description: 'Q1 All-hands meeting recording'
  },
  'file_011': {
    id: 'file_011',
    parentId: 'folder_002',
    name: 'resume_2026.pdf',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 184320,
    ownerId: 'user_001',
    sharedWith: [],
    starred: true,
    trashed: false,
    color: null,
    createdAt: d('2026-01-01T10:00:00Z'),
    modifiedAt: d('2026-01-15T16:00:00Z'),
    accessedAt: d('2026-02-20T09:00:00Z'),
    description: ''
  },
  'file_012': {
    id: 'file_012',
    parentId: 'folder_007',
    name: 'tax_return_2025.pdf',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 1048576,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-04-10T14:00:00Z'),
    modifiedAt: d('2025-04-10T14:00:00Z'),
    accessedAt: d('2026-02-01T09:00:00Z'),
    description: ''
  },
  'file_013': {
    id: 'file_013',
    parentId: null,
    name: 'notes.txt',
    type: 'text',
    mimeType: 'text/plain',
    size: 2048,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-03-03T08:00:00Z'),
    modifiedAt: d('2026-03-03T08:30:00Z'),
    accessedAt: d('2026-03-07T07:00:00Z'),
    content: 'Meeting notes from March 3rd\n- Discussed Q1 targets\n- Action items assigned\n- Follow up next week',
    description: ''
  },
  'file_014': {
    id: 'file_014',
    parentId: null,
    name: 'project_archive.zip',
    type: 'archive',
    mimeType: 'application/zip',
    size: 10485760,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-02-01T16:00:00Z'),
    modifiedAt: d('2026-02-01T16:00:00Z'),
    accessedAt: d('2026-02-15T10:00:00Z'),
    description: ''
  },

  // === SHARED WITH ME ===
  'file_015': {
    id: 'file_015',
    parentId: null,
    name: 'Marketing Strategy 2026',
    type: 'doc',
    mimeType: 'application/vnd.google-apps.document',
    size: 0,
    ownerId: 'user_002',
    sharedWith: [{ userId: 'user_001', role: 'editor', addedAt: '2026-02-10T10:00:00Z' }],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-02-05T09:00:00Z'),
    modifiedAt: d('2026-03-05T14:00:00Z'),
    accessedAt: d('2026-03-06T11:00:00Z'),
    description: 'Annual marketing strategy and campaigns'
  },
  'file_016': {
    id: 'file_016',
    parentId: null,
    name: 'Company Handbook',
    type: 'pdf',
    mimeType: 'application/pdf',
    size: 5242880,
    ownerId: 'user_003',
    sharedWith: [{ userId: 'user_001', role: 'viewer', addedAt: '2025-12-15T09:00:00Z' }],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2025-12-01T10:00:00Z'),
    modifiedAt: d('2025-12-15T11:00:00Z'),
    accessedAt: d('2026-01-10T14:00:00Z'),
    description: ''
  },
  'file_017': {
    id: 'file_017',
    parentId: null,
    name: 'Team Photo Album',
    type: 'folder',
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    ownerId: 'user_004',
    sharedWith: [{ userId: 'user_001', role: 'viewer', addedAt: '2026-01-20T10:00:00Z' }],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-01-15T10:00:00Z'),
    modifiedAt: d('2026-01-20T16:00:00Z'),
    accessedAt: d('2026-02-10T09:00:00Z'),
    description: 'Team event photos'
  },
  'file_018': {
    id: 'file_018',
    parentId: null,
    name: 'Sales Dashboard',
    type: 'spreadsheet',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    size: 0,
    ownerId: 'user_005',
    sharedWith: [{ userId: 'user_001', role: 'commenter', addedAt: '2026-02-20T10:00:00Z' }],
    starred: false,
    trashed: false,
    color: null,
    createdAt: d('2026-02-15T09:00:00Z'),
    modifiedAt: d('2026-03-07T08:00:00Z'),
    accessedAt: d('2026-03-07T08:30:00Z'),
    description: 'Live sales metrics and KPI tracking'
  },

  // === TRASHED ITEMS ===
  'file_019': {
    id: 'file_019',
    parentId: null,
    name: 'Old_Draft.txt',
    type: 'text',
    mimeType: 'text/plain',
    size: 1024,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: true,
    color: null,
    createdAt: d('2025-10-01T10:00:00Z'),
    modifiedAt: d('2025-12-15T14:00:00Z'),
    accessedAt: d('2026-01-05T10:00:00Z'),
    description: ''
  },
  'file_020': {
    id: 'file_020',
    parentId: null,
    name: 'Untitled Document',
    type: 'doc',
    mimeType: 'application/vnd.google-apps.document',
    size: 0,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: true,
    color: null,
    createdAt: d('2026-01-20T11:00:00Z'),
    modifiedAt: d('2026-01-25T16:00:00Z'),
    accessedAt: d('2026-01-25T16:00:00Z'),
    description: ''
  },
  'file_021': {
    id: 'file_021',
    parentId: null,
    name: 'Screenshot_2025.png',
    type: 'image',
    mimeType: 'image/png',
    size: 786432,
    ownerId: 'user_001',
    sharedWith: [],
    starred: false,
    trashed: true,
    color: null,
    createdAt: d('2025-11-10T15:00:00Z'),
    modifiedAt: d('2026-02-01T09:00:00Z'),
    accessedAt: d('2026-02-01T09:00:00Z'),
    thumbnailUrl: 'https://picsum.photos/seed/screenshot/400/300',
    description: ''
  }
};

const getDefaultData = (): AppState => ({
  items: ITEMS,
  users: USERS,
  currentUser: USERS['user_001'],
  viewMode: 'list',
  sortConfig: { key: 'name', direction: 'asc' },
  uploadQueue: [],
  storageUsed: 9876543210,
  storageTotal: 16106127360,
  selectedItems: []
});

export const INITIAL_STATE: AppState = getDefaultData();
