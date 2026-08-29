
    import { v4 as uuidv4 } from 'uuid';

    export const USERS = [
      { id: 'u1', name: 'Admin User', avatar: 'https://picsum.photos/100/100?random=u1' },
      { id: 'u2', name: 'Sarah Smith', avatar: 'https://picsum.photos/100/100?random=u2' },
      { id: 'u3', name: 'Mike Johnson', avatar: 'https://picsum.photos/100/100?random=u3' },
      { id: 'u4', name: 'Emily Davis', avatar: 'https://picsum.photos/100/100?random=u4' },
    ];

    export const COLUMN_TYPES = {
      STATUS: 'status',
      PERSON: 'person',
      DATE: 'date',
      TEXT: 'text',
      NUMBERS: 'numbers',
      TIMELINE: 'timeline',
      RATING: 'rating',
    };

    export const STATUS_LABELS = [
      { id: 's1', label: 'Done', color: '#00c875' },
      { id: 's2', label: 'Working on it', color: '#fdab3d' },
      { id: 's3', label: 'Stuck', color: '#e2445c' },
      { id: 's4', label: 'Not Started', color: '#c4c4c4' },
    ];

    const generateId = () => uuidv4();

    // --- Session isolation helpers ---

    const BASE_STORAGE_KEY = 'monday_clone_state';
    const BASE_INITIAL_KEY = 'monday_clone_initial_state';

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

    export const getInitialState = (sid = null) => {
      const stored = localStorage.getItem(initialKey(sid));
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

    function getDefaultData() {
      return {
        workspaces: [
          { id: 'ws1', name: 'Main Workspace' }
        ],
        boards: [
          {
            id: 'b1',
            workspaceId: 'ws1',
            name: 'Product Roadmap',
            description: 'Q1 2024 Goals and Tasks',
            columns: [
              { id: 'c1', title: 'Owner', type: COLUMN_TYPES.PERSON, width: 100 },
              { id: 'c2', title: 'Status', type: COLUMN_TYPES.STATUS, width: 140, settings: { labels: STATUS_LABELS } },
              { id: 'c3', title: 'Due Date', type: COLUMN_TYPES.DATE, width: 120 },
              { id: 'c4', title: 'Priority', type: COLUMN_TYPES.STATUS, width: 140, settings: {
                labels: [
                  { id: 'p1', label: 'High', color: '#401694' },
                  { id: 'p2', label: 'Medium', color: '#579bfc' },
                  { id: 'p3', label: 'Low', color: '#79d5ea' }
                ]
              }},
              { id: 'c5', title: 'Timeline', type: COLUMN_TYPES.TIMELINE, width: 180 },
              { id: 'c6', title: 'Budget', type: COLUMN_TYPES.NUMBERS, width: 100, settings: { prefix: '$' } },
            ],
            groups: [
              { id: 'g1', title: 'Q1 Goals', color: '#579bfc' },
              { id: 'g2', title: 'Backlog', color: '#a25ddc' }
            ],
            items: [
              {
                id: 'i1', groupId: 'g1', name: 'Launch New Website',
                columnValues: {
                  c1: ['u1', 'u2'],
                  c2: 's2',
                  c3: '2024-03-15',
                  c4: 'p1',
                  c5: { start: '2024-03-01', end: '2024-03-15' },
                  c6: 5000
                }
              },
              {
                id: 'i2', groupId: 'g1', name: 'Mobile App Design',
                columnValues: {
                  c1: ['u3'],
                  c2: 's1',
                  c3: '2024-02-28',
                  c4: 'p2',
                  c5: { start: '2024-02-01', end: '2024-02-28' },
                  c6: 12000
                }
              },
               {
                id: 'i3', groupId: 'g2', name: 'User Research',
                columnValues: {
                  c1: ['u4'],
                  c2: 's4',
                  c3: '2024-04-10',
                  c4: 'p3',
                  c5: { start: '2024-04-01', end: '2024-04-10' },
                  c6: 2000
                }
              }
            ],
            updates: [],
            activities: []
          }
        ],
        currentUser: USERS[0]
      };
    }

    // Normalization helpers for POST custom state
    function normalizeItem(item, index) {
      return {
        id: item.id || `item_custom_${index}`,
        groupId: item.groupId || '',
        name: item.name || 'Untitled',
        columnValues: item.columnValues || {},
        updates: Array.isArray(item.updates) ? item.updates : [],
        subitems: Array.isArray(item.subitems) ? item.subitems : []
      };
    }

    function normalizeBoard(board, index) {
      return {
        id: board.id || `board_custom_${index}`,
        workspaceId: board.workspaceId || 'ws1',
        name: board.name || 'Untitled Board',
        description: board.description || '',
        columns: Array.isArray(board.columns) ? board.columns : [],
        groups: Array.isArray(board.groups) ? board.groups : [],
        items: Array.isArray(board.items) ? board.items.map((it, i) => normalizeItem(it, i)) : [],
        updates: Array.isArray(board.updates) ? board.updates : [],
        activities: Array.isArray(board.activities) ? board.activities : []
      };
    }

    function deepMergeWithDefaults(defaults, custom) {
      if (!custom) return defaults;
      const result = { ...defaults };
      for (const key in custom) {
        if (custom[key] !== null && custom[key] !== undefined) {
          if (key === 'boards' && Array.isArray(custom[key])) {
            result[key] = custom[key].map((b, i) => normalizeBoard(b, i));
          } else if (key === 'currentUser' && typeof custom[key] === 'object') {
            result[key] = { ...defaults.currentUser, ...custom[key] };
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
        const initialData = deepMergeWithDefaults(getDefaultData(), customState);
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

      const initialData = getDefaultData();
      localStorage.setItem(sk, JSON.stringify(initialData));
      localStorage.setItem(ik, JSON.stringify(initialData));
      return initialData;
    };

    // Keep INITIAL_STATE export for backward compatibility
    export const INITIAL_STATE = getDefaultData();
