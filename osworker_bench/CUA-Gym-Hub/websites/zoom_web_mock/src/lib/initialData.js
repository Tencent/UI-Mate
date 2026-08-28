import { addDays, subDays, setHours, setMinutes } from 'date-fns';

const now = new Date();

export const initialUser = {
  userId: 'u_admin',
  username: 'Admin User',
  email: 'admin@example.com',
  avatar: 'https://picsum.photos/100/100?random=user1',
  pmi: '543 888 1234' // Personal Meeting ID
};

export const initialContacts = [
  { contactId: 'c1', name: 'Sarah Connor', email: 'sarah@skynet.com', avatar: 'https://picsum.photos/100/100?random=c1', status: 'available' },
  { contactId: 'c2', name: 'John Wick', email: 'john@continental.com', avatar: 'https://picsum.photos/100/100?random=c2', status: 'busy' },
  { contactId: 'c3', name: 'Tony Stark', email: 'tony@stark.com', avatar: 'https://picsum.photos/100/100?random=c3', status: 'offline' },
];

export const initialMeetings = [
  {
    meetingId: '123 456 7890',
    title: 'Weekly Team Sync',
    hostId: 'u_admin',
    startTime: setMinutes(setHours(addDays(now, 1), 10), 0).toISOString(),
    duration: 60,
    password: '',
    joinUrl: 'https://zoom-mock.web/j/1234567890',
    participants: [],
    settings: { video: true, audio: true },
    recurring: true
  },
  {
    meetingId: '987 654 3210',
    title: 'Project Kickoff',
    hostId: 'u_admin',
    startTime: setMinutes(setHours(addDays(now, 2), 14), 0).toISOString(),
    duration: 45,
    password: '123',
    joinUrl: 'https://zoom-mock.web/j/9876543210',
    participants: [],
    settings: { video: true, audio: true },
    recurring: false
  },
  {
    meetingId: '111 222 3333',
    title: 'Client Review',
    hostId: 'u_admin',
    startTime: setMinutes(setHours(subDays(now, 1), 15), 0).toISOString(), // Past
    duration: 30,
    password: '',
    joinUrl: 'https://zoom-mock.web/j/1112223333',
    participants: ['c1', 'c2'],
    settings: { video: true, audio: true },
    recurring: false
  }
];

export const initialRecordings = [
  {
    recordingId: 'rec_001',
    meetingId: '111 222 3333',
    title: 'Client Review - Recording',
    url: 'xoom-mock-recording://rec_001',
    duration: '28:45',
    created: setMinutes(setHours(subDays(now, 1), 16), 0).toISOString(),
    size: '145 MB',
    transcript: 'Client Review recording transcript. Alice reviewed timeline risks and Bob confirmed next steps.',
    sharedWith: []
  }
];

export const initialSettings = {
  audio: { input: 'Default Microphone', output: 'Default Speakers' },
  video: { input: 'FaceTime Camera', hd: true },
  notifications: { email: true, push: true }
};

// --- Session-based state isolation ---

const BASE_STORAGE_KEY = 'zoom_mock_data';
const BASE_INITIAL_KEY = 'zoom_mock_data_initialState';

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
    if (resp.ok) { const d = await resp.json(); if (d.has_custom_state && d.stored_state) return d.stored_state; }
  } catch(e) {}
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

export const getInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid)); return s ? JSON.parse(s) : null;
};

function createDefaultData() {
  return {
    user: initialUser,
    meetings: initialMeetings,
    contacts: initialContacts,
    recordings: initialRecordings,
    settings: initialSettings,
    activityLog: []
  };
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid), ik = initialKey(sid);
  if (customState) {
    const data = deepMergeWithDefaults(createDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }
  const stored = localStorage.getItem(sk);
  if (stored) { if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored); return JSON.parse(stored); }
  const data = createDefaultData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

// --- Data normalizers for malformed POST data ---

function normalizeMeeting(meeting, index) {
  const meetingId = meeting.meetingId || meeting.id || `mtg_custom_${index}`;
  return {
    meetingId,
    title: meeting.title || meeting.topic || meeting.name || '(No Title)',
    hostId: meeting.hostId || meeting.host || 'u_admin',
    startTime: meeting.startTime || meeting.start_time || meeting.date || new Date().toISOString(),
    duration: typeof meeting.duration === 'number' ? meeting.duration : (parseInt(meeting.duration, 10) || 60),
    password: meeting.password || meeting.passcode || '',
    joinUrl: meeting.joinUrl || meeting.join_url || `https://zoom-mock.web/j/${String(meetingId).replace(/\s/g, '')}`,
    participants: Array.isArray(meeting.participants) ? meeting.participants : [],
    settings: (meeting.settings && typeof meeting.settings === 'object')
      ? { video: meeting.settings.video !== false, audio: meeting.settings.audio !== false }
      : { video: true, audio: true },
    recurring: meeting.recurring === true || meeting.recurring === 'true' || false,
  };
}

function normalizeContact(contact, index) {
  return {
    contactId: contact.contactId || contact.id || `c_custom_${index}`,
    name: contact.name || contact.displayName || contact.username || '(Unknown)',
    email: contact.email || contact.mail || '',
    avatar: contact.avatar || contact.avatarUrl || contact.image || `https://picsum.photos/100/100?random=custom_${index}`,
    status: ['available', 'busy', 'offline'].includes(contact.status) ? contact.status : 'offline',
  };
}

function normalizeRecording(recording, index) {
  return {
    recordingId: recording.recordingId || recording.id || `rec_custom_${index}`,
    meetingId: recording.meetingId || recording.meeting_id || '',
    title: recording.title || recording.topic || recording.name || '(Untitled Recording)',
    url: recording.url || recording.playUrl || '#',
    duration: recording.duration || '0:00',
    created: recording.created || recording.createdAt || recording.date || new Date().toISOString(),
    size: recording.size || recording.fileSize || '0 MB',
    transcript: recording.transcript || '',
    sharedWith: Array.isArray(recording.sharedWith) ? recording.sharedWith : [],
  };
}

const arrayNormalizers = {
  meetings: normalizeMeeting,
  contacts: normalizeContact,
  recordings: normalizeRecording,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item, idx) => arrayNormalizers[key](item, idx));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else { result[key] = custom[key]; }
    }
  }
  return result;
}
