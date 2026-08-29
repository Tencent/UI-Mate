const BASE_KEY = 'teamsState';
const BASE_INITIAL_KEY = 'teamsInitialState';

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
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) { /* no custom state */ }
  return null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  try { localStorage.setItem(storageKey(sid), JSON.stringify(state)); } catch(e) {}
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_current',
          state,
          initialState: getStoredInitialState(sid),
        }),
      }).catch(() => {});
    }, 300);
  }
};

export const getStoredInitialState = (sid = null) => {
  try {
    const s = localStorage.getItem(initialKey(sid));
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
};

function deepMerge(target, source) {
  if (!source) return target;
  const result = { ...target };
  for (const k in source) {
    if (source[k] === null || source[k] === undefined) continue;
    if (typeof source[k] === 'object' && !Array.isArray(source[k]) && typeof target[k] === 'object' && !Array.isArray(target[k])) {
      result[k] = deepMerge(target[k], source[k]);
    } else {
      result[k] = source[k];
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = { ...createInitialData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const data = createInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

let _idCounter = 1000;
function genId(prefix) { return `${prefix}_${++_idCounter}`; }

export function createInitialData() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayISO = today.toISOString();
  const yesterdayISO = new Date(today.getTime() - 86400000).toISOString();
  const twoDaysAgo = new Date(today.getTime() - 2 * 86400000).toISOString();
  const threeDaysAgo = new Date(today.getTime() - 3 * 86400000).toISOString();
  const fourDaysAgo = new Date(today.getTime() - 4 * 86400000).toISOString();

  function ts(dayOffset, h, m) {
    const d = new Date(today.getTime() + dayOffset * 86400000);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }

  // =========== USERS ===========
  const users = [
    { userId: 'user_1', displayName: 'Adele Vance', firstName: 'Adele', lastName: 'Vance', email: 'adele.vance@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_1', jobTitle: 'Senior Marketing Manager', department: 'Marketing', location: 'Seattle, WA', phone: '+1 (206) 555-0110', presence: 'available', statusMessage: '', statusEmoji: '', outOfOffice: false, timezone: 'America/Los_Angeles' },
    { userId: 'user_2', displayName: 'Alex Wilber', firstName: 'Alex', lastName: 'Wilber', email: 'alex.wilber@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_2', jobTitle: 'Software Engineer', department: 'Engineering', location: 'Seattle, WA', phone: '+1 (206) 555-0120', presence: 'available', statusMessage: '', statusEmoji: '', outOfOffice: false, timezone: 'America/Los_Angeles' },
    { userId: 'user_3', displayName: 'Megan Bowen', firstName: 'Megan', lastName: 'Bowen', email: 'megan.bowen@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_3', jobTitle: 'HR Manager', department: 'Human Resources', location: 'Seattle, WA', phone: '+1 (206) 555-0130', presence: 'away', statusMessage: 'In a meeting until 3 PM', statusEmoji: '', outOfOffice: false, timezone: 'America/Los_Angeles' },
    { userId: 'user_4', displayName: 'Nestor Wilke', firstName: 'Nestor', lastName: 'Wilke', email: 'nestor.wilke@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_4', jobTitle: 'IT Admin', department: 'IT', location: 'Redmond, WA', phone: '+1 (425) 555-0140', presence: 'busy', statusMessage: 'Focused work', statusEmoji: '', outOfOffice: false, timezone: 'America/Los_Angeles' },
    { userId: 'user_5', displayName: 'Joni Sherman', firstName: 'Joni', lastName: 'Sherman', email: 'joni.sherman@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_5', jobTitle: 'Legal Counsel', department: 'Legal', location: 'San Francisco, CA', phone: '+1 (415) 555-0150', presence: 'available', statusMessage: '', statusEmoji: '', outOfOffice: false, timezone: 'America/Los_Angeles' },
    { userId: 'user_6', displayName: 'Lee Gu', firstName: 'Lee', lastName: 'Gu', email: 'lee.gu@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_6', jobTitle: 'UX Designer', department: 'Design', location: 'Seattle, WA', phone: '+1 (206) 555-0160', presence: 'away', statusMessage: '', statusEmoji: '', outOfOffice: false, timezone: 'America/Los_Angeles' },
    { userId: 'user_7', displayName: 'Lynne Robbins', firstName: 'Lynne', lastName: 'Robbins', email: 'lynne.robbins@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_7', jobTitle: 'VP of Sales', department: 'Sales', location: 'New York, NY', phone: '+1 (212) 555-0170', presence: 'busy', statusMessage: 'On a call', statusEmoji: '', outOfOffice: false, timezone: 'America/New_York' },
    { userId: 'user_8', displayName: 'Diego Siciliani', firstName: 'Diego', lastName: 'Siciliani', email: 'diego.siciliani@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_8', jobTitle: 'Finance Analyst', department: 'Finance', location: 'Chicago, IL', phone: '+1 (312) 555-0180', presence: 'offline', statusMessage: '', statusEmoji: '', outOfOffice: false, timezone: 'America/Chicago' },
    { userId: 'user_9', displayName: 'Pradeep Gupta', firstName: 'Pradeep', lastName: 'Gupta', email: 'pradeep.gupta@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_9', jobTitle: 'Data Scientist', department: 'Engineering', location: 'Seattle, WA', phone: '+1 (206) 555-0190', presence: 'inAMeeting', statusMessage: 'Sprint planning', statusEmoji: '', outOfOffice: false, timezone: 'America/Los_Angeles' },
    { userId: 'user_10', displayName: 'Henrietta Mueller', firstName: 'Henrietta', lastName: 'Mueller', email: 'henrietta.mueller@contoso.com', avatar: 'https://i.pravatar.cc/150?u=user_10', jobTitle: 'Project Manager', department: 'PMO', location: 'Seattle, WA', phone: '+1 (206) 555-0200', presence: 'dnd', statusMessage: 'Deep work block', statusEmoji: '', outOfOffice: false, timezone: 'America/Los_Angeles' }
  ];

  const currentUser = users[0];

  // =========== TEAMS ===========
  const teams = [
    {
      teamId: 'team_1', displayName: 'Contoso Engineering', description: 'Engineering team collaboration space',
      avatar: '', avatarColor: '#4A90D9', avatarInitials: 'CE',
      visibility: 'private', isArchived: false, isFavorite: true,
      createdDateTime: '2024-06-15T10:00:00Z',
      members: ['user_1', 'user_2', 'user_6', 'user_4', 'user_9', 'user_8', 'user_10'],
      owners: ['user_2'],
      channels: ['ch_1', 'ch_2', 'ch_3', 'ch_4', 'ch_5'],
      settings: { allowMemberCreateChannels: true, allowMemberDeleteMessages: true, allowGiphy: true, allowStickers: true, allowMemes: true }
    },
    {
      teamId: 'team_2', displayName: 'Marketing', description: 'Marketing team hub',
      avatar: '', avatarColor: '#E8733A', avatarInitials: 'MK',
      visibility: 'private', isArchived: false, isFavorite: true,
      createdDateTime: '2024-07-01T10:00:00Z',
      members: ['user_1', 'user_7', 'user_3', 'user_5', 'user_6'],
      owners: ['user_1'],
      channels: ['ch_6', 'ch_7', 'ch_8', 'ch_9'],
      settings: { allowMemberCreateChannels: true, allowMemberDeleteMessages: true, allowGiphy: true, allowStickers: true, allowMemes: true }
    },
    {
      teamId: 'team_3', displayName: 'Product Design', description: 'Design and UX collaboration',
      avatar: '', avatarColor: '#9B59B6', avatarInitials: 'PD',
      visibility: 'private', isArchived: false, isFavorite: false,
      createdDateTime: '2024-08-01T10:00:00Z',
      members: ['user_6', 'user_1', 'user_2', 'user_3', 'user_10'],
      owners: ['user_6'],
      channels: ['ch_10', 'ch_11', 'ch_12'],
      settings: { allowMemberCreateChannels: true, allowMemberDeleteMessages: true, allowGiphy: true, allowStickers: true, allowMemes: true }
    },
    {
      teamId: 'team_4', displayName: 'All Company', description: 'Company-wide announcements and discussions',
      avatar: '', avatarColor: '#27AE60', avatarInitials: 'AC',
      visibility: 'public', isArchived: false, isFavorite: false,
      createdDateTime: '2024-01-01T10:00:00Z',
      members: ['user_1', 'user_2', 'user_3', 'user_4', 'user_5', 'user_6', 'user_7', 'user_8', 'user_9', 'user_10'],
      owners: ['user_4'],
      channels: ['ch_13', 'ch_14'],
      settings: { allowMemberCreateChannels: false, allowMemberDeleteMessages: true, allowGiphy: true, allowStickers: true, allowMemes: true }
    }
  ];

  // =========== CHANNELS ===========
  const channels = [
    { channelId: 'ch_1', teamId: 'team_1', displayName: 'General', description: 'General engineering discussions', membershipType: 'standard', isFavoriteByDefault: true, isPinned: false, isMuted: false, unreadCount: 3, lastMessagePreview: 'Alex: The deployment went smoothly', lastMessageTimestamp: ts(0, 14, 30), createdDateTime: '2024-06-15T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_1', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_1', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_2', teamId: 'team_1', displayName: 'Backend', description: 'Backend development discussions', membershipType: 'standard', isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Pradeep: PR #452 is ready for review', lastMessageTimestamp: ts(0, 11, 45), createdDateTime: '2024-06-20T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_2', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_2', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_3', teamId: 'team_1', displayName: 'Frontend', description: 'Frontend development and UI discussions', membershipType: 'standard', isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 2, lastMessagePreview: 'Lee: Updated the component library', lastMessageTimestamp: ts(0, 13, 15), createdDateTime: '2024-06-20T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_3', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_3', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_4', teamId: 'team_1', displayName: 'DevOps', description: 'CI/CD and infrastructure', membershipType: 'standard', isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Nestor: Pipeline green across all envs', lastMessageTimestamp: ts(-1, 16, 0), createdDateTime: '2024-07-01T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_4', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_4', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_5', teamId: 'team_1', displayName: 'Code Reviews', description: 'Code review discussions and requests', membershipType: 'standard', isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 1, lastMessagePreview: 'Alex: Can someone review the auth module?', lastMessageTimestamp: ts(0, 10, 0), createdDateTime: '2024-07-15T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_5', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_5', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_6', teamId: 'team_2', displayName: 'General', description: 'Marketing team general discussions', membershipType: 'standard', isFavoriteByDefault: true, isPinned: false, isMuted: false, unreadCount: 1, lastMessagePreview: 'Lynne: Q3 numbers are looking great!', lastMessageTimestamp: ts(0, 12, 0), createdDateTime: '2024-07-01T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_6', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_6', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_7', teamId: 'team_2', displayName: 'Campaigns', description: 'Campaign planning and execution', membershipType: 'standard', isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Adele: Draft campaign brief attached', lastMessageTimestamp: ts(-1, 15, 30), createdDateTime: '2024-07-15T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_7', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_7', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_8', teamId: 'team_2', displayName: 'Social Media', description: 'Social media strategy and content', membershipType: 'standard', isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Joni: New LinkedIn post is live', lastMessageTimestamp: ts(-1, 11, 0), createdDateTime: '2024-08-01T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_8', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_8', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_9', teamId: 'team_2', displayName: 'Brand Guidelines', description: 'Brand standards and guidelines (restricted)', membershipType: 'private', isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Adele: Updated brand colors document', lastMessageTimestamp: ts(-2, 14, 0), createdDateTime: '2024-08-15T10:00:00Z', members: ['user_1', 'user_7', 'user_6'], tabs: [{ tabId: 'tab_posts_9', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_9', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_10', teamId: 'team_3', displayName: 'General', description: 'Product design general discussions', membershipType: 'standard', isFavoriteByDefault: true, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Lee: Design sprint starts Monday', lastMessageTimestamp: ts(0, 9, 30), createdDateTime: '2024-08-01T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_10', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_10', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_11', teamId: 'team_3', displayName: 'UI/UX Research', description: 'User research findings and insights', membershipType: 'standard', isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Megan: Usability test results are in', lastMessageTimestamp: ts(-1, 14, 0), createdDateTime: '2024-08-15T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_11', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_11', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_12', teamId: 'team_3', displayName: 'Design Reviews', description: 'Design review sessions and feedback', membershipType: 'standard', isFavoriteByDefault: false, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Henrietta: Please review the dashboard mockups', lastMessageTimestamp: ts(-1, 10, 30), createdDateTime: '2024-09-01T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_12', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_12', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_13', teamId: 'team_4', displayName: 'General', description: 'Company-wide discussions', membershipType: 'standard', isFavoriteByDefault: true, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Nestor: Welcome to the new intranet!', lastMessageTimestamp: ts(-1, 9, 0), createdDateTime: '2024-01-01T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_13', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_13', displayName: 'Files', type: 'files' }], pinnedMessages: [] },
    { channelId: 'ch_14', teamId: 'team_4', displayName: 'Announcements', description: 'Important company announcements', membershipType: 'standard', isFavoriteByDefault: true, isPinned: false, isMuted: false, unreadCount: 0, lastMessagePreview: 'Nestor: Q2 all-hands recording available', lastMessageTimestamp: ts(-3, 10, 0), createdDateTime: '2024-01-01T10:00:00Z', members: [], tabs: [{ tabId: 'tab_posts_14', displayName: 'Posts', type: 'posts', isDefault: true }, { tabId: 'tab_files_14', displayName: 'Files', type: 'files' }], pinnedMessages: [] }
  ];

  // =========== CHATS ===========
  const chats = [
    { chatId: 'chat_1', chatType: 'oneOnOne', topic: '', participants: ['user_1', 'user_2'], isPinned: true, isMuted: false, isHidden: false, unreadCount: 2, lastMessagePreview: 'Sounds good, I\'ll push the fix now.', lastMessageSenderId: 'user_2', lastMessageTimestamp: ts(0, 14, 45), createdDateTime: '2024-12-01T09:00:00Z', pinnedMessages: [], tabs: [{ tabId: 'tab_chat_1', displayName: 'Chat', type: 'chat', isDefault: true }, { tabId: 'tab_files_c1', displayName: 'Files', type: 'files' }] },
    { chatId: 'chat_2', chatType: 'oneOnOne', topic: '', participants: ['user_1', 'user_3'], isPinned: false, isMuted: false, isHidden: false, unreadCount: 1, lastMessagePreview: 'Sure, I\'ll send over the handbook.', lastMessageSenderId: 'user_3', lastMessageTimestamp: ts(0, 11, 30), createdDateTime: '2025-01-10T09:00:00Z', pinnedMessages: [], tabs: [{ tabId: 'tab_chat_2', displayName: 'Chat', type: 'chat', isDefault: true }, { tabId: 'tab_files_c2', displayName: 'Files', type: 'files' }] },
    { chatId: 'chat_3', chatType: 'oneOnOne', topic: '', participants: ['user_1', 'user_7'], isPinned: false, isMuted: false, isHidden: false, unreadCount: 0, lastMessagePreview: 'Let\'s sync on the Q3 pipeline tomorrow.', lastMessageSenderId: 'user_1', lastMessageTimestamp: ts(-1, 17, 0), createdDateTime: '2025-01-15T09:00:00Z', pinnedMessages: [], tabs: [{ tabId: 'tab_chat_3', displayName: 'Chat', type: 'chat', isDefault: true }, { tabId: 'tab_files_c3', displayName: 'Files', type: 'files' }] },
    { chatId: 'chat_4', chatType: 'oneOnOne', topic: '', participants: ['user_1', 'user_6'], isPinned: true, isMuted: false, isHidden: false, unreadCount: 0, lastMessagePreview: 'The new mockups look great!', lastMessageSenderId: 'user_1', lastMessageTimestamp: ts(0, 10, 15), createdDateTime: '2025-02-01T09:00:00Z', pinnedMessages: [], tabs: [{ tabId: 'tab_chat_4', displayName: 'Chat', type: 'chat', isDefault: true }, { tabId: 'tab_files_c4', displayName: 'Files', type: 'files' }] },
    { chatId: 'chat_5', chatType: 'group', topic: 'Project Kickoff', participants: ['user_1', 'user_2', 'user_6', 'user_10'], isPinned: false, isMuted: false, isHidden: false, unreadCount: 3, lastMessagePreview: 'Henrietta: I\'ve updated the timeline.', lastMessageSenderId: 'user_10', lastMessageTimestamp: ts(0, 13, 0), createdDateTime: '2025-02-15T09:00:00Z', pinnedMessages: [], tabs: [{ tabId: 'tab_chat_5', displayName: 'Chat', type: 'chat', isDefault: true }, { tabId: 'tab_files_c5', displayName: 'Files', type: 'files' }] },
    { chatId: 'chat_6', chatType: 'group', topic: 'Lunch Plans', participants: ['user_1', 'user_3', 'user_5', 'user_8'], isPinned: false, isMuted: false, isHidden: false, unreadCount: 0, lastMessagePreview: 'Diego: How about Thai food?', lastMessageSenderId: 'user_8', lastMessageTimestamp: ts(0, 11, 45), createdDateTime: '2025-03-01T09:00:00Z', pinnedMessages: [], tabs: [{ tabId: 'tab_chat_6', displayName: 'Chat', type: 'chat', isDefault: true }, { tabId: 'tab_files_c6', displayName: 'Files', type: 'files' }] },
    { chatId: 'chat_7', chatType: 'group', topic: 'Design Sprint', participants: ['user_6', 'user_1', 'user_2'], isPinned: false, isMuted: false, isHidden: false, unreadCount: 0, lastMessagePreview: 'Lee: Sprint retro notes attached.', lastMessageSenderId: 'user_6', lastMessageTimestamp: ts(-1, 16, 30), createdDateTime: '2025-03-05T09:00:00Z', pinnedMessages: [], tabs: [{ tabId: 'tab_chat_7', displayName: 'Chat', type: 'chat', isDefault: true }, { tabId: 'tab_files_c7', displayName: 'Files', type: 'files' }] },
    { chatId: 'chat_meeting_1', chatType: 'meeting', topic: 'Sprint Planning', participants: ['user_1', 'user_2', 'user_10', 'user_9', 'user_6'], isPinned: false, isMuted: false, isHidden: false, unreadCount: 0, lastMessagePreview: 'Let\'s finalize story points.', lastMessageSenderId: 'user_10', lastMessageTimestamp: ts(0, 10, 30), createdDateTime: '2025-03-10T09:00:00Z', pinnedMessages: [], tabs: [{ tabId: 'tab_chat_m1', displayName: 'Chat', type: 'chat', isDefault: true }, { tabId: 'tab_files_m1', displayName: 'Files', type: 'files' }] }
  ];

  // =========== MESSAGES ===========
  const messages = {};

  // --- Engineering General (ch_1) ~20 messages ---
  messages['ch_1'] = [
    { messageId: 'msg_1', containerId: 'ch_1', containerType: 'channel', senderId: 'user_2', content: 'Good morning team! Quick update on the API refactor - we\'re about 80% done with the migration to the new gateway.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'API Refactor Update', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_1', 'user_9'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_2', containerId: 'ch_1', containerType: 'channel', senderId: 'user_9', content: 'Nice work Alex! I ran the performance tests and the new endpoints are about 30% faster.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_1', reactions: [{ emoji: '\u{1F389}', users: ['user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_3', containerId: 'ch_1', containerType: 'channel', senderId: 'user_1', content: 'That\'s great news! @Alex Wilber can you share the migration timeline with the marketing team?', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_1', reactions: [], mentions: [{ userId: 'user_2', displayName: 'Alex Wilber', mentionText: '@Alex Wilber' }], attachments: [], isBookmarked: false },
    { messageId: 'msg_4', containerId: 'ch_1', containerType: 'channel', senderId: 'user_2', content: 'Sure, I\'ll put together a summary doc and share it by EOD.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 45), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_1', reactions: [{ emoji: '\u{1F44D}', users: ['user_1'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_5', containerId: 'ch_1', containerType: 'channel', senderId: 'user_4', content: 'Reminder: We\'re doing server maintenance tonight at 11 PM PST. Expect about 30 minutes of downtime for the staging environment.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 11, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'high', subject: 'Server Maintenance Tonight', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_2', 'user_9', 'user_1'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_6', containerId: 'ch_1', containerType: 'channel', senderId: 'user_10', content: 'Hey everyone, I\'ve created the sprint board for next week. Please review and add any missing items before standup tomorrow.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 14, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [{ attachmentId: 'att_1', name: 'Sprint_Backlog.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', contentUrl: '#', thumbnailUrl: '', size: 184320 }], isBookmarked: false },
    { messageId: 'msg_7', containerId: 'ch_1', containerType: 'channel', senderId: 'user_6', content: 'Updated the component library with the new design tokens. Check out the Storybook for the latest changes.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 15, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u2764\uFE0F', users: ['user_1', 'user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_8', containerId: 'ch_1', containerType: 'channel', senderId: 'user_2', content: '@Pradeep Gupta the data pipeline job failed again last night. Can you take a look at the logs?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 8, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [{ userId: 'user_9', displayName: 'Pradeep Gupta', mentionText: '@Pradeep Gupta' }], attachments: [], isBookmarked: false },
    { messageId: 'msg_9', containerId: 'ch_1', containerType: 'channel', senderId: 'user_9', content: 'On it! Looks like a memory issue on the ETL worker. I\'ll increase the instance size and re-run.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 8, 45), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_8', reactions: [{ emoji: '\u{1F44D}', users: ['user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_10', containerId: 'ch_1', containerType: 'channel', senderId: 'user_1', content: 'Quick question - has anyone tested the new SSO integration with the staging environment?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_11', containerId: 'ch_1', containerType: 'channel', senderId: 'user_4', content: 'Yes, I tested it yesterday. Found a couple of edge cases with the token refresh. I\'ll file bugs.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 20), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_10', reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_sys_1', containerId: 'ch_1', containerType: 'channel', senderId: 'system', content: 'Alex Wilber added Pradeep Gupta to the team', contentType: 'text', messageType: 'systemEvent', createdDateTime: ts(-3, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_12', containerId: 'ch_1', containerType: 'channel', senderId: 'user_10', content: 'Sprint retro is scheduled for this Friday at 3 PM. Please come prepared with your highlights and blockers.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 11, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_1', 'user_2', 'user_6'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_13', containerId: 'ch_1', containerType: 'channel', senderId: 'user_2', content: 'The deployment went smoothly. All services are green. Great work everyone!', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 14, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F389}', users: ['user_1', 'user_10', 'user_9'] }, { emoji: '\u{1F44D}', users: ['user_6'] }], mentions: [], attachments: [], isBookmarked: false }
  ];

  // --- Backend (ch_2) ~12 messages ---
  messages['ch_2'] = [
    { messageId: 'msg_20', containerId: 'ch_2', containerType: 'channel', senderId: 'user_2', content: 'I\'m refactoring the user service to use the repository pattern. Should improve testability.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Repository Pattern Refactor', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_9'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_21', containerId: 'ch_2', containerType: 'channel', senderId: 'user_9', content: 'Good idea. I had similar plans for the analytics service. Want to pair on establishing the pattern?', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 10, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_20', reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_22', containerId: 'ch_2', containerType: 'channel', senderId: 'user_2', content: 'Absolutely! Let\'s schedule a pairing session for tomorrow afternoon.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 10, 45), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_20', reactions: [{ emoji: '\u{1F44D}', users: ['user_9'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_23', containerId: 'ch_2', containerType: 'channel', senderId: 'user_4', content: 'Heads up: I\'m upgrading the database cluster to PostgreSQL 16 this weekend. Migration scripts are in the shared repo.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'high', subject: 'Database Upgrade', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_2', 'user_9'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_24', containerId: 'ch_2', containerType: 'channel', senderId: 'user_2', content: 'Thanks Nestor. I\'ll review the migration scripts today.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_23', reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_25', containerId: 'ch_2', containerType: 'channel', senderId: 'user_9', content: 'The new caching layer is showing great results. Response times dropped by 45% on the product catalog endpoint.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 9, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F389}', users: ['user_2', 'user_4'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_26', containerId: 'ch_2', containerType: 'channel', senderId: 'user_9', content: 'PR #452 is ready for review. It includes the new rate limiting middleware and updated API docs.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 11, 45), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [{ attachmentId: 'att_api', name: 'API_Documentation.md', contentType: 'text/markdown', contentUrl: '#', thumbnailUrl: '', size: 45000 }], isBookmarked: false }
  ];

  // --- Frontend (ch_3) ---
  messages['ch_3'] = [
    { messageId: 'msg_30', containerId: 'ch_3', containerType: 'channel', senderId: 'user_6', content: 'I\'ve finished the new dashboard wireframes. Here\'s the Figma link for review.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Dashboard Wireframes', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_1', 'user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_31', containerId: 'ch_3', containerType: 'channel', senderId: 'user_2', content: 'Looks clean! One suggestion - can we add a quick-filter option on the data table?', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 10, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_30', reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_32', containerId: 'ch_3', containerType: 'channel', senderId: 'user_6', content: 'Good call, I\'ll add that to the next iteration.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 11, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_30', reactions: [{ emoji: '\u{1F44D}', users: ['user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_33', containerId: 'ch_3', containerType: 'channel', senderId: 'user_1', content: 'The new landing page is getting great feedback from the beta testers. Conversion rate is up 15%.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 9, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F389}', users: ['user_6', 'user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_34', containerId: 'ch_3', containerType: 'channel', senderId: 'user_6', content: 'Updated the component library with the new design tokens. All changes are backward compatible.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 13, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_2'] }], mentions: [], attachments: [], isBookmarked: false }
  ];

  // --- DevOps (ch_4) ---
  messages['ch_4'] = [
    { messageId: 'msg_40', containerId: 'ch_4', containerType: 'channel', senderId: 'user_4', content: 'All CI/CD pipelines are green across dev, staging, and production. No issues to report.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 9, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Pipeline Status Update', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_41', containerId: 'ch_4', containerType: 'channel', senderId: 'user_4', content: 'Deployed the monitoring dashboard update. You can now see real-time container metrics.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 14, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F389}', users: ['user_2', 'user_9'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_42', containerId: 'ch_4', containerType: 'channel', senderId: 'user_4', content: 'Pipeline green across all envs. Weekend maintenance completed successfully.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 16, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_2', 'user_10'] }], mentions: [], attachments: [{ attachmentId: 'att_rn', name: 'Release_Notes_v3.1.md', contentType: 'text/markdown', contentUrl: '#', thumbnailUrl: '', size: 15000 }], isBookmarked: false }
  ];

  // --- Code Reviews (ch_5) ---
  messages['ch_5'] = [
    { messageId: 'msg_50', containerId: 'ch_5', containerType: 'channel', senderId: 'user_2', content: 'Can someone review the auth module changes? PR #445 - it\'s a security-critical update.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'high', subject: 'PR #445 - Auth Module', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_51', containerId: 'ch_5', containerType: 'channel', senderId: 'user_9', content: 'I\'ll take a look this afternoon. How urgent is this?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_50', reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_52', containerId: 'ch_5', containerType: 'channel', senderId: 'user_2', content: 'Fairly urgent - we need it merged before the release branch cut on Friday.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 20), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_50', reactions: [{ emoji: '\u{1F44D}', users: ['user_9'] }], mentions: [], attachments: [], isBookmarked: false }
  ];

  // --- Marketing General (ch_6) ---
  messages['ch_6'] = [
    { messageId: 'msg_60', containerId: 'ch_6', containerType: 'channel', senderId: 'user_1', content: 'Team, the Q3 marketing plan is finalized. Key focus areas: product launches, brand refresh, and content strategy.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Q3 Marketing Plan', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_7', 'user_3'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_61', containerId: 'ch_6', containerType: 'channel', senderId: 'user_7', content: 'Q3 numbers are looking great! We\'re 15% above target on leads. Let\'s keep the momentum going!', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 12, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F389}', users: ['user_1', 'user_3', 'user_5'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_62', containerId: 'ch_6', containerType: 'channel', senderId: 'user_5', content: 'That\'s fantastic! The new campaign targeting seems to be working well.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 12, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false }
  ];

  // --- Campaigns (ch_7) ---
  messages['ch_7'] = [
    { messageId: 'msg_70', containerId: 'ch_7', containerType: 'channel', senderId: 'user_1', content: 'I\'ve attached the draft campaign brief for the summer product launch. Please review and share feedback by Thursday.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 15, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Summer Campaign Brief', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_7'] }], mentions: [], attachments: [{ attachmentId: 'att_comp', name: 'Competitor_Analysis.pptx', contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', contentUrl: '#', thumbnailUrl: '', size: 2500000 }], isBookmarked: false },
    { messageId: 'msg_71', containerId: 'ch_7', containerType: 'channel', senderId: 'user_7', content: 'Looks solid! I have a few suggestions on the channel mix. Let\'s discuss in our 1:1 tomorrow.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 16, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: 'msg_70', reactions: [], mentions: [], attachments: [], isBookmarked: false }
  ];

  // --- Social Media (ch_8) ---
  messages['ch_8'] = [
    { messageId: 'msg_80', containerId: 'ch_8', containerType: 'channel', senderId: 'user_5', content: 'New LinkedIn post is live! Please like and share to boost visibility.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 11, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_1', 'user_7'] }], mentions: [], attachments: [{ attachmentId: 'att_logo', name: 'Logo_Final.png', contentType: 'image/png', contentUrl: '#', thumbnailUrl: '', size: 350000 }], isBookmarked: false }
  ];

  // --- Brand Guidelines (ch_9) ---
  messages['ch_9'] = [
    { messageId: 'msg_90', containerId: 'ch_9', containerType: 'channel', senderId: 'user_1', content: 'Updated brand colors document is attached. Please use these new values for all future materials.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 14, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Brand Colors Update', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_7', 'user_6'] }], mentions: [], attachments: [{ attachmentId: 'att_brand', name: 'Brand_Guidelines_v2.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', contentUrl: '#', thumbnailUrl: '', size: 1200000 }], isBookmarked: false }
  ];

  // --- Product Design General (ch_10) ---
  messages['ch_10'] = [
    { messageId: 'msg_100', containerId: 'ch_10', containerType: 'channel', senderId: 'user_6', content: 'Design sprint starts Monday. I\'ve set up the Figma workspace with all the necessary templates.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 9, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_1', 'user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'msg_101', containerId: 'ch_10', containerType: 'channel', senderId: 'user_1', content: 'Sounds great! I\'ll make sure the user research findings are ready for the kickoff.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 9, 45), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false }
  ];

  // --- UI/UX Research (ch_11) ---
  messages['ch_11'] = [
    { messageId: 'msg_110', containerId: 'ch_11', containerType: 'channel', senderId: 'user_3', content: 'Usability test results are in. Overall task completion rate is 87%, up from 72% last quarter.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 14, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Q2 Usability Test Results', replyToId: null, reactions: [{ emoji: '\u{1F389}', users: ['user_6', 'user_1'] }], mentions: [], attachments: [{ attachmentId: 'att_ux', name: 'UX_Research_Report.pdf', contentType: 'application/pdf', contentUrl: '#', thumbnailUrl: '', size: 3200000 }], isBookmarked: false }
  ];

  // --- Design Reviews (ch_12) ---
  messages['ch_12'] = [
    { messageId: 'msg_120', containerId: 'ch_12', containerType: 'channel', senderId: 'user_10', content: 'Please review the dashboard mockups before Friday\'s design review meeting.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 10, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Dashboard Mockups Review', replyToId: null, reactions: [], mentions: [], attachments: [{ attachmentId: 'att_fig', name: 'Design_Mockups.fig', contentType: 'application/octet-stream', contentUrl: '#', thumbnailUrl: '', size: 5200000 }], isBookmarked: false }
  ];

  // --- All Company General (ch_13) ---
  messages['ch_13'] = [
    { messageId: 'msg_130', containerId: 'ch_13', containerType: 'channel', senderId: 'user_4', content: 'Welcome to the new intranet! This channel is for company-wide discussions. Feel free to introduce yourself.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Welcome!', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_1', 'user_2', 'user_3', 'user_5'] }], mentions: [], attachments: [{ attachmentId: 'att_photo', name: 'Team_Photo.jpg', contentType: 'image/jpeg', contentUrl: '#', thumbnailUrl: '', size: 2800000 }], isBookmarked: false }
  ];

  // --- Announcements (ch_14) ---
  messages['ch_14'] = [
    { messageId: 'msg_140', containerId: 'ch_14', containerType: 'channel', senderId: 'user_4', content: 'The Q2 all-hands recording is now available. Check the shared drive for the link.', contentType: 'text', messageType: 'message', createdDateTime: ts(-3, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: 'Q2 All-Hands Recording', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_1'] }], mentions: [], attachments: [], isBookmarked: false }
  ];

  // --- Chat messages ---
  // chat_1: Adele <-> Alex (15 messages)
  messages['chat_1'] = [
    { messageId: 'cm_1', containerId: 'chat_1', containerType: 'chat', senderId: 'user_2', content: 'Hey Adele, do you have a minute to discuss the product launch timeline?', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_2', containerId: 'chat_1', containerType: 'chat', senderId: 'user_1', content: 'Of course! I was actually about to reach out to you about the same thing.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 5), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_3', containerId: 'chat_1', containerType: 'chat', senderId: 'user_2', content: 'Great minds think alike! So the engineering team is on track for the March 20th release. We just need the marketing assets finalized.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 10), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_4', containerId: 'chat_1', containerType: 'chat', senderId: 'user_1', content: 'Perfect. The creative team is wrapping up the landing page assets this week. I\'ll share the preview link by Thursday.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 9, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_5', containerId: 'chat_1', containerType: 'chat', senderId: 'user_2', content: 'That works. Also, I noticed the API docs need an update before we can share them with the partner team.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 14, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_6', containerId: 'chat_1', containerType: 'chat', senderId: 'user_1', content: 'Got it. Can you flag the specific sections that need updating?', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 14, 10), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_7', containerId: 'chat_1', containerType: 'chat', senderId: 'user_2', content: 'Sure. Mostly the authentication section and the new webhook endpoints.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 14, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_8', containerId: 'chat_1', containerType: 'chat', senderId: 'user_1', content: 'Thanks! I\'ll coordinate with the tech writing team.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 14, 20), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_9', containerId: 'chat_1', containerType: 'chat', senderId: 'user_2', content: 'Hey, the build is failing on the staging branch. I think the latest commit broke the CSS bundler.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_10', containerId: 'chat_1', containerType: 'chat', senderId: 'user_1', content: 'Oh no, let me check. Which branch?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 5), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_11', containerId: 'chat_1', containerType: 'chat', senderId: 'user_2', content: 'feature/landing-page-v2. I think it\'s a dependency conflict with the new Tailwind version.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 8), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_12', containerId: 'chat_1', containerType: 'chat', senderId: 'user_1', content: 'Found it! The postcss config was referencing an old plugin. Fixing now.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_13', containerId: 'chat_1', containerType: 'chat', senderId: 'user_2', content: 'You\'re a lifesaver! Let me know when it\'s pushed.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 35), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u2764\uFE0F', users: ['user_1'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_14', containerId: 'chat_1', containerType: 'chat', senderId: 'user_1', content: 'Done! Build should be green now. Can you verify?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 14, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_15', containerId: 'chat_1', containerType: 'chat', senderId: 'user_2', content: 'Sounds good, I\'ll push the fix now.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 14, 45), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_1'] }], mentions: [], attachments: [], isBookmarked: false }
  ];

  // chat_2: Adele <-> Megan (10 messages)
  messages['chat_2'] = [
    { messageId: 'cm_20', containerId: 'chat_2', containerType: 'chat', senderId: 'user_3', content: 'Hi Adele! I wanted to follow up on the new hire onboarding process.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_21', containerId: 'chat_2', containerType: 'chat', senderId: 'user_1', content: 'Hey Megan! Sure, what do you need from the marketing side?', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 10, 10), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_22', containerId: 'chat_2', containerType: 'chat', senderId: 'user_3', content: 'We need updated brand training materials for the new hires starting next month. Can you send the latest deck?', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 10, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_23', containerId: 'chat_2', containerType: 'chat', senderId: 'user_1', content: 'Absolutely! I\'ll send the updated brand guide and marketing overview by tomorrow.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 10, 20), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_3'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_24', containerId: 'chat_2', containerType: 'chat', senderId: 'user_3', content: 'Also, do you think we should include a Teams walkthrough in the onboarding?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 9, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_25', containerId: 'chat_2', containerType: 'chat', senderId: 'user_1', content: 'Great idea! Let me put together a quick-start guide for Teams.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 9, 10), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_26', containerId: 'chat_2', containerType: 'chat', senderId: 'user_3', content: 'Perfect. Also, can you review the employee handbook section on marketing policies?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 11, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_27', containerId: 'chat_2', containerType: 'chat', senderId: 'user_3', content: 'Sure, I\'ll send over the handbook.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 11, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false }
  ];

  // chat_3: Adele <-> Lynne (8 messages)
  messages['chat_3'] = [
    { messageId: 'cm_30', containerId: 'chat_3', containerType: 'chat', senderId: 'user_7', content: 'Adele, I need your help with the partner presentation for next week.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 15, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_31', containerId: 'chat_3', containerType: 'chat', senderId: 'user_1', content: 'Sure! What do you need?', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 15, 10), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_32', containerId: 'chat_3', containerType: 'chat', senderId: 'user_7', content: 'Can you pull together the case study slides and the ROI data from last quarter?', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 15, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_33', containerId: 'chat_3', containerType: 'chat', senderId: 'user_1', content: 'On it! I\'ll have them ready by Thursday.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 15, 20), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_7'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_34', containerId: 'chat_3', containerType: 'chat', senderId: 'user_7', content: 'Thanks! Also, the sales team hit 110% of quota this month!', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F389}', users: ['user_1'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_35', containerId: 'chat_3', containerType: 'chat', senderId: 'user_1', content: 'Amazing! Let\'s sync on the Q3 pipeline tomorrow.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 17, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false }
  ];

  // chat_4: Adele <-> Lee (12 messages)
  messages['chat_4'] = [
    { messageId: 'cm_40', containerId: 'chat_4', containerType: 'chat', senderId: 'user_6', content: 'Hey Adele, I finished the initial mockups for the new product page. Want to take a look?', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 11, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_41', containerId: 'chat_4', containerType: 'chat', senderId: 'user_1', content: 'Yes please! Share the Figma link and I\'ll review today.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 11, 5), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_42', containerId: 'chat_4', containerType: 'chat', senderId: 'user_6', content: 'Here you go. Focus on the hero section and the pricing table layout.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 11, 10), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_43', containerId: 'chat_4', containerType: 'chat', senderId: 'user_1', content: 'Love the direction! The hero section feels very modern. A couple of minor notes on the CTA button placement.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 14, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u2764\uFE0F', users: ['user_6'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_44', containerId: 'chat_4', containerType: 'chat', senderId: 'user_6', content: 'Good points! I\'ll adjust the CTA and send an updated version.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 14, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_45', containerId: 'chat_4', containerType: 'chat', senderId: 'user_1', content: 'The new mockups look great!', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_6'] }], mentions: [], attachments: [], isBookmarked: false }
  ];

  // chat_5: Project Kickoff group
  messages['chat_5'] = [
    { messageId: 'cm_50', containerId: 'chat_5', containerType: 'chat', senderId: 'user_10', content: 'Hey team! Let\'s use this chat for the new project kickoff coordination.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_1', 'user_2', 'user_6'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_51', containerId: 'chat_5', containerType: 'chat', senderId: 'user_2', content: 'Great idea! I\'ll share the technical requirements doc.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 10, 10), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [{ attachmentId: 'att_notes', name: 'Meeting_Notes_Mar10.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', contentUrl: '#', thumbnailUrl: '', size: 85000 }], isBookmarked: false },
    { messageId: 'cm_52', containerId: 'chat_5', containerType: 'chat', senderId: 'user_6', content: 'I\'ll start on the design explorations this week.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 10, 20), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_53', containerId: 'chat_5', containerType: 'chat', senderId: 'user_1', content: 'I\'ll handle the marketing strategy and competitive analysis.', contentType: 'text', messageType: 'message', createdDateTime: ts(-2, 10, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_54', containerId: 'chat_5', containerType: 'chat', senderId: 'user_10', content: 'I\'ve updated the timeline. We need to finalize scope by next Friday.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 13, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false }
  ];

  // chat_6: Lunch Plans
  messages['chat_6'] = [
    { messageId: 'cm_60', containerId: 'chat_6', containerType: 'chat', senderId: 'user_3', content: 'Anyone up for lunch today?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 11, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_61', containerId: 'chat_6', containerType: 'chat', senderId: 'user_5', content: 'I\'m in! What are we thinking?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 11, 10), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_62', containerId: 'chat_6', containerType: 'chat', senderId: 'user_1', content: 'I could go for something light. Poke bowls?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 11, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_63', containerId: 'chat_6', containerType: 'chat', senderId: 'user_8', content: 'How about Thai food?', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 11, 45), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_3', 'user_5'] }], mentions: [], attachments: [], isBookmarked: false }
  ];

  // chat_7: Design Sprint
  messages['chat_7'] = [
    { messageId: 'cm_70', containerId: 'chat_7', containerType: 'chat', senderId: 'user_6', content: 'Design sprint wrap-up! Thanks everyone for the great collaboration.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 16, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F389}', users: ['user_1', 'user_2'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_71', containerId: 'chat_7', containerType: 'chat', senderId: 'user_2', content: 'It was really productive. The prototyping session was especially valuable.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 16, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_72', containerId: 'chat_7', containerType: 'chat', senderId: 'user_6', content: 'Sprint retro notes attached.', contentType: 'text', messageType: 'message', createdDateTime: ts(-1, 16, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false }
  ];

  // chat_meeting_1: Sprint Planning
  messages['chat_meeting_1'] = [
    { messageId: 'cm_m1', containerId: 'chat_meeting_1', containerType: 'chat', senderId: 'user_10', content: 'Let\'s start with the backlog review. I\'ve prioritized the top 10 items.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 0), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_m2', containerId: 'chat_meeting_1', containerType: 'chat', senderId: 'user_2', content: 'The auth module refactor should be top priority. It\'s blocking the release.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 15), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [{ emoji: '\u{1F44D}', users: ['user_9'] }], mentions: [], attachments: [], isBookmarked: false },
    { messageId: 'cm_m3', containerId: 'chat_meeting_1', containerType: 'chat', senderId: 'user_10', content: 'Let\'s finalize story points.', contentType: 'text', messageType: 'message', createdDateTime: ts(0, 10, 30), lastEditedDateTime: null, deletedDateTime: null, importance: 'normal', subject: '', replyToId: null, reactions: [], mentions: [], attachments: [], isBookmarked: false }
  ];

  // =========== MEETINGS ===========
  const meetings = [
    { meetingId: 'meeting_1', subject: 'Daily Standup', startDateTime: ts(0, 9, 0), endDateTime: ts(0, 9, 30), isAllDay: false, location: 'Xicrosoft Teams Meeting', organizer: 'user_2', participants: [{ userId: 'user_2', role: 'organizer', rsvp: 'accepted' }, { userId: 'user_1', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_9', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_6', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_10', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_4', role: 'attendee', rsvp: 'tentative' }], isRecurring: true, recurrencePattern: 'daily', chatId: null, channelId: null, teamId: null, bodyPreview: 'Daily sync to discuss progress and blockers.', joinUrl: '#', status: 'scheduled' },
    { meetingId: 'meeting_2', subject: 'Sprint Planning', startDateTime: ts(0, 10, 0), endDateTime: ts(0, 11, 0), isAllDay: false, location: 'Xicrosoft Teams Meeting', organizer: 'user_10', participants: [{ userId: 'user_10', role: 'organizer', rsvp: 'accepted' }, { userId: 'user_1', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_2', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_9', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_6', role: 'attendee', rsvp: 'accepted' }], isRecurring: false, recurrencePattern: null, chatId: 'chat_meeting_1', channelId: null, teamId: null, bodyPreview: 'Review the sprint backlog and plan for the next iteration.', joinUrl: '#', status: 'scheduled' },
    { meetingId: 'meeting_3', subject: '1:1 with Lynne', startDateTime: ts(0, 13, 0), endDateTime: ts(0, 13, 30), isAllDay: false, location: 'Xicrosoft Teams Meeting', organizer: 'user_1', participants: [{ userId: 'user_1', role: 'organizer', rsvp: 'accepted' }, { userId: 'user_7', role: 'attendee', rsvp: 'accepted' }], isRecurring: false, recurrencePattern: null, chatId: null, channelId: null, teamId: null, bodyPreview: 'Weekly sync on Q3 pipeline and partner deals.', joinUrl: '#', status: 'scheduled' },
    { meetingId: 'meeting_4', subject: 'Design Review', startDateTime: ts(0, 14, 0), endDateTime: ts(0, 15, 0), isAllDay: false, location: 'Xicrosoft Teams Meeting', organizer: 'user_6', participants: [{ userId: 'user_6', role: 'organizer', rsvp: 'accepted' }, { userId: 'user_1', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_2', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_10', role: 'attendee', rsvp: 'tentative' }], isRecurring: false, recurrencePattern: null, chatId: null, channelId: null, teamId: null, bodyPreview: 'Review latest design mockups for the product page.', joinUrl: '#', status: 'scheduled' },
    { meetingId: 'meeting_5', subject: 'All Hands', startDateTime: ts(0, 16, 0), endDateTime: ts(0, 17, 0), isAllDay: false, location: 'Xicrosoft Teams Meeting', organizer: 'user_4', participants: users.map(u => ({ userId: u.userId, role: u.userId === 'user_4' ? 'organizer' : 'attendee', rsvp: 'accepted' })), isRecurring: false, recurrencePattern: null, chatId: null, channelId: null, teamId: null, bodyPreview: 'Monthly company all-hands meeting. Q3 updates and roadmap.', joinUrl: '#', status: 'scheduled' },
    { meetingId: 'meeting_6', subject: 'Daily Standup', startDateTime: ts(1, 9, 0), endDateTime: ts(1, 9, 30), isAllDay: false, location: 'Xicrosoft Teams Meeting', organizer: 'user_2', participants: [{ userId: 'user_2', role: 'organizer', rsvp: 'accepted' }, { userId: 'user_1', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_9', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_6', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_10', role: 'attendee', rsvp: 'accepted' }], isRecurring: true, recurrencePattern: 'daily', chatId: null, channelId: null, teamId: null, bodyPreview: 'Daily sync.', joinUrl: '#', status: 'scheduled' },
    { meetingId: 'meeting_7', subject: 'Marketing Strategy', startDateTime: ts(1, 11, 0), endDateTime: ts(1, 12, 0), isAllDay: false, location: 'Xicrosoft Teams Meeting', organizer: 'user_1', participants: [{ userId: 'user_1', role: 'organizer', rsvp: 'accepted' }, { userId: 'user_7', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_3', role: 'attendee', rsvp: 'tentative' }, { userId: 'user_5', role: 'attendee', rsvp: 'accepted' }], isRecurring: false, recurrencePattern: null, chatId: null, channelId: null, teamId: null, bodyPreview: 'Q3 marketing strategy planning session.', joinUrl: '#', status: 'scheduled' },
    { meetingId: 'meeting_8', subject: 'Budget Review', startDateTime: ts(1, 15, 0), endDateTime: ts(1, 15, 30), isAllDay: false, location: 'Xicrosoft Teams Meeting', organizer: 'user_8', participants: [{ userId: 'user_8', role: 'organizer', rsvp: 'accepted' }, { userId: 'user_1', role: 'attendee', rsvp: 'accepted' }, { userId: 'user_7', role: 'attendee', rsvp: 'tentative' }], isRecurring: false, recurrencePattern: null, chatId: null, channelId: null, teamId: null, bodyPreview: 'Quarterly budget review and forecast.', joinUrl: '#', status: 'scheduled' }
  ];

  // =========== CALLS ===========
  const calls = [
    { callId: 'call_1', callType: 'oneOnOne', direction: 'incoming', participants: ['user_1', 'user_2'], startDateTime: ts(-1, 16, 0), endDateTime: ts(-1, 16, 12), duration: 720, status: 'completed', isVideoCall: true },
    { callId: 'call_2', callType: 'oneOnOne', direction: 'outgoing', participants: ['user_1', 'user_7'], startDateTime: ts(-1, 14, 0), endDateTime: ts(-1, 14, 8), duration: 480, status: 'completed', isVideoCall: false },
    { callId: 'call_3', callType: 'oneOnOne', direction: 'incoming', participants: ['user_1', 'user_3'], startDateTime: twoDaysAgo, endDateTime: null, duration: null, status: 'missed', isVideoCall: false },
    { callId: 'call_4', callType: 'oneOnOne', direction: 'outgoing', participants: ['user_1', 'user_8'], startDateTime: threeDaysAgo, endDateTime: threeDaysAgo, duration: 180, status: 'completed', isVideoCall: false },
    { callId: 'call_5', callType: 'oneOnOne', direction: 'incoming', participants: ['user_1', 'user_4'], startDateTime: fourDaysAgo, endDateTime: fourDaysAgo, duration: 1500, status: 'completed', isVideoCall: true }
  ];

  // =========== FILES ===========
  const files = [
    { fileId: 'file_1', name: 'Q3_Roadmap.pdf', contentType: 'application/pdf', size: 245760, containerId: 'ch_1', containerType: 'channel', sharedBy: 'user_2', sharedDateTime: ts(-3, 10, 0), lastModifiedDateTime: ts(-3, 10, 0), lastModifiedBy: 'user_2', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_2', name: 'Brand_Guidelines_v2.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1200000, containerId: 'ch_9', containerType: 'channel', sharedBy: 'user_1', sharedDateTime: ts(-2, 14, 0), lastModifiedDateTime: ts(-2, 14, 0), lastModifiedBy: 'user_1', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_3', name: 'Sprint_Backlog.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 184320, containerId: 'ch_1', containerType: 'channel', sharedBy: 'user_10', sharedDateTime: ts(-1, 14, 0), lastModifiedDateTime: ts(-1, 14, 0), lastModifiedBy: 'user_10', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_4', name: 'Design_Mockups.fig', contentType: 'application/octet-stream', size: 5200000, containerId: 'ch_12', containerType: 'channel', sharedBy: 'user_10', sharedDateTime: ts(-1, 10, 30), lastModifiedDateTime: ts(-1, 10, 30), lastModifiedBy: 'user_10', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_5', name: 'Meeting_Notes_Mar10.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 85000, containerId: 'chat_5', containerType: 'chat', sharedBy: 'user_2', sharedDateTime: ts(-2, 10, 10), lastModifiedDateTime: ts(-2, 10, 10), lastModifiedBy: 'user_2', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_6', name: 'Logo_Final.png', contentType: 'image/png', size: 350000, containerId: 'ch_8', containerType: 'channel', sharedBy: 'user_5', sharedDateTime: ts(-1, 11, 0), lastModifiedDateTime: ts(-1, 11, 0), lastModifiedBy: 'user_5', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_7', name: 'API_Documentation.md', contentType: 'text/markdown', size: 45000, containerId: 'ch_2', containerType: 'channel', sharedBy: 'user_9', sharedDateTime: ts(0, 11, 45), lastModifiedDateTime: ts(0, 11, 45), lastModifiedBy: 'user_9', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_8', name: 'Budget_2025.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 128000, containerId: 'chat_3', containerType: 'chat', sharedBy: 'user_8', sharedDateTime: ts(-2, 15, 0), lastModifiedDateTime: ts(-2, 15, 0), lastModifiedBy: 'user_8', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_9', name: 'Team_Photo.jpg', contentType: 'image/jpeg', size: 2800000, containerId: 'ch_13', containerType: 'channel', sharedBy: 'user_4', sharedDateTime: ts(-1, 9, 0), lastModifiedDateTime: ts(-1, 9, 0), lastModifiedBy: 'user_4', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_10', name: 'Release_Notes_v3.1.md', contentType: 'text/markdown', size: 15000, containerId: 'ch_4', containerType: 'channel', sharedBy: 'user_4', sharedDateTime: ts(-1, 16, 0), lastModifiedDateTime: ts(-1, 16, 0), lastModifiedBy: 'user_4', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_11', name: 'Competitor_Analysis.pptx', contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 2500000, containerId: 'ch_7', containerType: 'channel', sharedBy: 'user_1', sharedDateTime: ts(-1, 15, 30), lastModifiedDateTime: ts(-1, 15, 30), lastModifiedBy: 'user_1', thumbnailUrl: '', downloadUrl: '#' },
    { fileId: 'file_12', name: 'UX_Research_Report.pdf', contentType: 'application/pdf', size: 3200000, containerId: 'ch_11', containerType: 'channel', sharedBy: 'user_3', sharedDateTime: ts(-1, 14, 0), lastModifiedDateTime: ts(-1, 14, 0), lastModifiedBy: 'user_3', thumbnailUrl: '', downloadUrl: '#' }
  ];

  // =========== NOTIFICATIONS ===========
  const notifications = [
    { notificationId: 'notif_1', type: 'mention', actorId: 'user_2', targetMessageId: 'msg_8', containerId: 'ch_1', containerType: 'channel', containerName: 'General', teamName: 'Contoso Engineering', previewText: 'Alex Wilber mentioned you: @Adele the data pipeline job failed...', timestamp: ts(0, 8, 30), isRead: false, isActionable: false },
    { notificationId: 'notif_2', type: 'mention', actorId: 'user_10', targetMessageId: 'cm_54', containerId: 'chat_5', containerType: 'chat', containerName: 'Project Kickoff', teamName: null, previewText: 'Henrietta Mueller: I\'ve updated the timeline.', timestamp: ts(0, 13, 0), isRead: false, isActionable: false },
    { notificationId: 'notif_3', type: 'mention', actorId: 'user_7', targetMessageId: 'msg_61', containerId: 'ch_6', containerType: 'channel', containerName: 'General', teamName: 'Marketing', previewText: 'Lynne Robbins: Q3 numbers are looking great!', timestamp: ts(0, 12, 0), isRead: false, isActionable: false },
    { notificationId: 'notif_4', type: 'reply', actorId: 'user_9', targetMessageId: 'msg_9', containerId: 'ch_1', containerType: 'channel', containerName: 'General', teamName: 'Contoso Engineering', previewText: 'Pradeep Gupta replied: On it! Looks like a memory issue...', timestamp: ts(0, 8, 45), isRead: false, isActionable: false },
    { notificationId: 'notif_5', type: 'reply', actorId: 'user_4', targetMessageId: 'msg_11', containerId: 'ch_1', containerType: 'channel', containerName: 'General', teamName: 'Contoso Engineering', previewText: 'Nestor Wilke replied: Yes, I tested it yesterday...', timestamp: ts(0, 10, 20), isRead: true, isActionable: false },
    { notificationId: 'notif_6', type: 'reply', actorId: 'user_6', targetMessageId: 'msg_32', containerId: 'ch_3', containerType: 'channel', containerName: 'Frontend', teamName: 'Contoso Engineering', previewText: 'Lee Gu replied: Good call, I\'ll add that...', timestamp: ts(-1, 11, 0), isRead: true, isActionable: false },
    { notificationId: 'notif_7', type: 'reaction', actorId: 'user_2', targetMessageId: 'cm_4', containerId: 'chat_1', containerType: 'chat', containerName: 'Alex Wilber', teamName: null, previewText: 'Alex Wilber reacted \u{1F44D} to your message', timestamp: ts(-1, 9, 16), isRead: true, isActionable: false },
    { notificationId: 'notif_8', type: 'reaction', actorId: 'user_7', targetMessageId: 'cm_33', containerId: 'chat_3', containerType: 'chat', containerName: 'Lynne Robbins', teamName: null, previewText: 'Lynne Robbins reacted \u{1F44D} to your message', timestamp: ts(-2, 15, 21), isRead: true, isActionable: false },
    { notificationId: 'notif_9', type: 'reaction', actorId: 'user_6', targetMessageId: 'cm_43', containerId: 'chat_4', containerType: 'chat', containerName: 'Lee Gu', teamName: null, previewText: 'Lee Gu reacted \u2764\uFE0F to your message', timestamp: ts(-1, 14, 1), isRead: true, isActionable: false },
    { notificationId: 'notif_10', type: 'meeting', actorId: 'user_10', targetMessageId: null, containerId: null, containerType: null, containerName: 'Sprint Planning', teamName: null, previewText: 'Sprint Planning starts in 15 minutes', timestamp: ts(0, 9, 45), isRead: false, isActionable: true },
    { notificationId: 'notif_11', type: 'meeting', actorId: 'user_6', targetMessageId: null, containerId: null, containerType: null, containerName: 'Design Review', teamName: null, previewText: 'Design Review starts in 15 minutes', timestamp: ts(0, 13, 45), isRead: false, isActionable: true },
    { notificationId: 'notif_12', type: 'system', actorId: 'user_2', targetMessageId: null, containerId: 'ch_1', containerType: 'channel', containerName: 'General', teamName: 'Contoso Engineering', previewText: 'Alex Wilber added Pradeep Gupta to the team', timestamp: ts(-3, 10, 0), isRead: true, isActionable: false },
    { notificationId: 'notif_13', type: 'system', actorId: 'user_4', targetMessageId: null, containerId: 'ch_4', containerType: 'channel', containerName: 'DevOps', teamName: 'Contoso Engineering', previewText: 'Nestor Wilke created channel DevOps', timestamp: ts(-4, 10, 0), isRead: true, isActionable: false },
    { notificationId: 'notif_14', type: 'assignment', actorId: 'user_10', targetMessageId: null, containerId: 'ch_1', containerType: 'channel', containerName: 'General', teamName: 'Contoso Engineering', previewText: 'Henrietta Mueller assigned you: Review sprint backlog items', timestamp: ts(-1, 14, 5), isRead: true, isActionable: false },
    { notificationId: 'notif_15', type: 'assignment', actorId: 'user_7', targetMessageId: null, containerId: 'ch_6', containerType: 'channel', containerName: 'General', teamName: 'Marketing', previewText: 'Lynne Robbins assigned you: Prepare partner case study', timestamp: ts(-2, 11, 0), isRead: true, isActionable: false }
  ];

  // =========== SETTINGS ===========
  const settings = {
    theme: 'light',
    language: 'en-US',
    notifications: {
      showMessagePreviews: true,
      playSound: true,
      showBadgeCount: true,
      muteAll: false,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00'
    },
    privacy: {
      readReceipts: true,
      showPresence: true
    },
    display: {
      density: 'comfortable',
      showChannelPreview: true
    }
  };

  // =========== UI STATE ===========
  const ui = {
    activeView: 'chat',
    activeTeamId: null,
    activeChannelId: null,
    activeChatId: null,
    activeThreadMessageId: null,
    isThreadPanelOpen: false,
    isDetailsPanelOpen: false,
    searchQuery: '',
    searchResults: null
  };

  return {
    currentUser,
    users,
    teams,
    channels,
    chats,
    messages,
    meetings,
    calls,
    files,
    notifications,
    settings,
    ui
  };
}
