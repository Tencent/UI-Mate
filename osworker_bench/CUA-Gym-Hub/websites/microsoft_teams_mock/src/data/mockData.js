
    import { generateId, getAvatarUrl } from '../lib/utils';

    const currentUser = {
      id: 'user-me',
      name: 'Admin User',
      email: 'admin@example.com',
      avatar: getAvatarUrl('me'),
      status: 'available', // available, busy, away, offline
      statusMessage: ''
    };

    const users = [
      currentUser,
      { id: 'u1', name: 'Alice Smith', status: 'busy', avatar: getAvatarUrl('u1') },
      { id: 'u2', name: 'Bob Jones', status: 'away', avatar: getAvatarUrl('u2') },
      { id: 'u3', name: 'Charlie Day', status: 'offline', avatar: getAvatarUrl('u3') },
      { id: 'u4', name: 'Diana Prince', status: 'available', avatar: getAvatarUrl('u4') },
    ];

    const teams = [
      {
        id: 't1',
        name: 'Engineering',
        description: 'Engineering team collaboration',
        channels: [
          { id: 'c1', name: 'General', posts: [] },
          { id: 'c2', name: 'Frontend', posts: [] },
          { id: 'c3', name: 'Deployments', posts: [] }
        ]
      },
      {
        id: 't2',
        name: 'Product Design',
        description: 'Design team sync',
        channels: [
          { id: 'c4', name: 'General', posts: [] },
          { id: 'c5', name: 'Inspiration', posts: [] }
        ]
      }
    ];

    // Seed some posts
    teams[0].channels[0].posts.push({
      id: 'p1',
      userId: 'u1',
      subject: 'Welcome to the team',
      content: 'Hi everyone! Excited to be here.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      replies: [
        { id: 'r1', userId: 'user-me', content: 'Welcome Alice!', timestamp: new Date(Date.now() - 80000000).toISOString() }
      ],
      reactions: { '\u{1F44D}': 2 }
    });

    const chats = [
      {
        id: 'chat1',
        type: 'direct',
        participants: ['user-me', 'u1'],
        messages: [
          { id: 'm1', userId: 'u1', content: 'Hey, do you have a minute?', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: 'm2', userId: 'user-me', content: 'Sure, what is up?', timestamp: new Date(Date.now() - 3500000).toISOString() }
        ]
      },
      {
        id: 'chat2',
        type: 'group',
        name: 'Lunch Crew',
        participants: ['user-me', 'u2', 'u3'],
        messages: [
          { id: 'm3', userId: 'u2', content: 'Tacos today?', timestamp: new Date(Date.now() - 7200000).toISOString() }
        ]
      }
    ];

    const activity = [
      { id: 'a1', type: 'mention', text: 'Alice mentioned you in Engineering > General', read: false, timestamp: new Date().toISOString(), link: '/teams/t1/c1' },
      { id: 'a2', type: 'reaction', text: 'Bob liked your message', read: true, timestamp: new Date(Date.now() - 100000).toISOString(), link: '/chat/chat1' }
    ];

    const calendar = [
      {
        id: 'evt1',
        title: 'Daily Standup',
        start: new Date().setHours(10, 0, 0, 0),
        end: new Date().setHours(10, 30, 0, 0),
        attendees: ['u1', 'u2', 'u3']
      }
    ];

    const files = [
      { id: 'f1', name: 'Q3_Roadmap.pdf', type: 'pdf', size: '2.4 MB', date: '2023-10-24', url: '/files/_default/Q3_Roadmap.pdf' },
      { id: 'f2', name: 'Design_System_v2.fig', type: 'fig', size: '14 MB', date: '2023-10-25', url: '/files/_default/Design_System_v2.fig' },
      { id: 'f3', name: 'Screenshot_Error.png', type: 'png', size: '1.1 MB', date: '2023-10-26', url: '/files/_default/Screenshot_Error.png' },
    ];

    export const initialState = {
      currentUser,
      users,
      teams,
      chats,
      activity,
      calendar,
      files,
      calls: [],
      activeCall: null, // If user is in a meeting
    };

    // --- Session isolation helpers ---
    const BASE_STORAGE_KEY = 'teams_mock_state';
    const BASE_INITIAL_KEY = 'teams_mock_initialState';

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

    export const saveState = (state, sid = null) => {
      localStorage.setItem(storageKey(sid), JSON.stringify(state));
      const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state, merge: false }),
      }).catch(() => {});
    };

    export const getStoredInitialState = (sid = null) => {
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
        const data = deepMergeWithDefaults(initialState, customState);
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

      const data = { ...initialState };
      localStorage.setItem(sk, JSON.stringify(data));
      localStorage.setItem(ik, JSON.stringify(data));
      return data;
    };
