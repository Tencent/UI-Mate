// Xmail Mock - Initial State Data
// Uses fixed IDs for reproducible testing

// --- Session-aware storage functions ---
const BASE_STORAGE_KEY = 'xmail-clone-state';
const BASE_INITIAL_KEY = 'xmail-clone-initialState';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKeyFn(sid) {
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
  } catch (e) { console.log('No custom state'); }
  return null;
};

let _syncTimer = null;

export const saveState = (state, sid = null, initialState = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state, initial_state: initialState }),
    }).catch(() => {});
  }, 300);
};

export const getInitialStateBySid = (sid = null) => {
  const s = localStorage.getItem(initialKeyFn(sid));
  return s ? JSON.parse(s) : null;
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKeyFn(sid);
  if (customState) {
    const data = { ...createDefaultData(), ...customState };
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

function normalizeEmail(email, index) {
  return {
    id: email.id || `email_custom_${index}`,
    threadId: email.threadId || email.id || `thread_custom_${index}`,
    from: email.from || { name: 'Unknown', email: 'unknown@example.com' },
    to: email.to || [],
    cc: email.cc || [],
    bcc: email.bcc || [],
    subject: email.subject || '(No Subject)',
    body: email.body || '',
    snippet: email.snippet || (email.body || '').replace(/<[^>]*>/g, '').slice(0, 100),
    timestamp: email.timestamp || email.date || new Date().toISOString(),
    read: email.read ?? false,
    starred: email.starred ?? false,
    important: email.important ?? false,
    labels: email.labels || [],
    category: email.category || 'primary',
    folder: email.folder || 'inbox',
    attachments: email.attachments || [],
  };
}

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (key === 'emails' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((e, i) => normalizeEmail(e, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

// --- Default data ---

export const CURRENT_USER = {
  userId: 'u1',
  username: 'Demo User',
  email: 'demo@example.com',
  avatar: 'https://picsum.photos/100/100?random=user1'
};

export const LABELS = [
  { id: 'l1', name: 'Work', color: '#ef4444' },     // red
  { id: 'l2', name: 'Personal', color: '#3b82f6' }, // blue
  { id: 'l3', name: 'Travel', color: '#22c55e' },   // green
  { id: 'l4', name: 'Finance', color: '#eab308' },  // yellow
];

// Fixed timestamp base for reproducible data
const BASE_TIME = new Date('2026-02-09T12:00:00Z').getTime();

const generateEmails = () => {
  const emails = [];

  // Thread 1: Project Update (unread, starred, important)
  emails.push({
    id: 'email_1',
    threadId: 'thread_1',
    from: { name: 'Alice Smith', email: 'alice@company.com', avatar: 'https://picsum.photos/100/100?random=2' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Q4 Project Roadmap Update',
    body: 'Hi everyone, <br><br>Here is the updated roadmap for Q4. Please review the attached document.<br><br>Best,<br>Alice',
    snippet: 'Hi everyone, Here is the updated roadmap for Q4. Please review...',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 30).toISOString(), // 30 mins ago
    read: false,
    starred: true,
    important: true,
    labels: ['l1'],
    category: 'primary',
    folder: 'inbox',
    attachments: [
      { id: 'attach_1', name: 'roadmap_q4.pdf', size: '2.4 KB', type: 'application/pdf', url: '/files/_default/roadmap_q4.pdf' }
    ]
  });

  // Thread 2: Lunch Plans (Conversation with 3 emails)
  emails.push({
    id: 'email_2',
    threadId: 'thread_2',
    from: { name: 'Bob Jones', email: 'bob@friends.com', avatar: 'https://picsum.photos/100/100?random=3' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Lunch tomorrow?',
    body: 'Hey! Are we still on for lunch tomorrow at 12?',
    snippet: 'Hey! Are we still on for lunch tomorrow at 12?',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    starred: false,
    important: false,
    labels: ['l2'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_3',
    threadId: 'thread_2',
    from: { name: 'Demo User', email: 'demo@example.com', avatar: CURRENT_USER.avatar },
    to: [{ name: 'Bob Jones', email: 'bob@friends.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Lunch tomorrow?',
    body: 'Yes! Let\'s go to that new burger place.',
    snippet: 'Yes! Let\'s go to that new burger place.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 23).toISOString(), // 23 hours ago
    read: true,
    starred: false,
    important: false,
    labels: ['l2'],
    category: 'primary',
    folder: 'sent',
    attachments: []
  });

  emails.push({
    id: 'email_4',
    threadId: 'thread_2',
    from: { name: 'Bob Jones', email: 'bob@friends.com', avatar: 'https://picsum.photos/100/100?random=3' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Lunch tomorrow?',
    body: 'Perfect. See you there!',
    snippet: 'Perfect. See you there!',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    starred: false,
    important: false,
    labels: ['l2'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  // Thread 3: HR Benefits Email (for Task #6 - Benefits Enrollment)
  emails.push({
    id: 'email_hr_benefits',
    threadId: 'thread_hr',
    from: { name: 'HR Department', email: 'HR@company.com', avatar: 'https://picsum.photos/100/100?random=hr' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Benefits Enrollment - Action Required',
    body: `Dear Employee,<br><br>
It's time for our annual benefits enrollment! Please complete and return the attached Benefits Form by the end of this month.<br><br>
<strong>Key deadlines:</strong><br>
- Health insurance selection: Feb 28<br>
- 401(k) contribution changes: Feb 28<br>
- FSA enrollment: Feb 28<br><br>
If you have any questions, please contact HR.<br><br>
Best regards,<br>
Human Resources`,
    snippet: "It's time for our annual benefits enrollment! Please complete and return...",
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: false,
    starred: false,
    important: true,
    labels: ['l1'],
    category: 'primary',
    folder: 'inbox',
    attachments: [
      { id: 'attach_benefits', name: 'Benefits_Form.pdf', size: '2.4 KB', type: 'application/pdf', url: '/files/_default/Benefits_Form.pdf' }
    ]
  });

  // Thread 4: Q1 Budget Discussion (for Task #10)
  emails.push({
    id: 'email_budget_1',
    threadId: 'thread_budget',
    from: { name: 'Sarah Manager', email: 'sarah@company.com', avatar: 'https://picsum.photos/100/100?random=sarah' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }, { name: 'Mike', email: 'mike@company.com' }, { name: 'Lisa', email: 'lisa@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Q1 Budget Discussion',
    body: `Hi team,<br><br>
Let's discuss our Q1 budget allocation. I'm proposing we start with $50,000 for the initial phase.<br><br>
Please share your thoughts and proposed numbers.<br><br>
Sarah`,
    snippet: "Let's discuss our Q1 budget allocation. I'm proposing $50,000...",
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
    starred: false,
    important: true,
    labels: ['l1', 'l4'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_budget_2',
    threadId: 'thread_budget',
    from: { name: 'Mike Chen', email: 'mike@company.com', avatar: 'https://picsum.photos/100/100?random=mike' },
    to: [{ name: 'Sarah Manager', email: 'sarah@company.com' }, { name: 'Demo User', email: 'demo@example.com' }, { name: 'Lisa', email: 'lisa@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Q1 Budget Discussion',
    body: `I think we should allocate $75,000 to cover the expanded scope we discussed.<br><br>
Mike`,
    snippet: 'I think we should allocate $75,000 to cover the expanded scope...',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
    read: true,
    starred: false,
    important: false,
    labels: ['l1', 'l4'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_budget_3',
    threadId: 'thread_budget',
    from: { name: 'Lisa Anderson', email: 'lisa@company.com', avatar: 'https://picsum.photos/100/100?random=lisa' },
    to: [{ name: 'Sarah Manager', email: 'sarah@company.com' }, { name: 'Demo User', email: 'demo@example.com' }, { name: 'Mike', email: 'mike@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Q1 Budget Discussion',
    body: `Based on last year's data, I'd recommend $62,500 as a balanced approach.<br><br>
Lisa`,
    snippet: "Based on last year's data, I'd recommend $62,500...",
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 24).toISOString(), // 24 hours ago
    read: true,
    starred: false,
    important: false,
    labels: ['l1', 'l4'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_budget_4',
    threadId: 'thread_budget',
    from: { name: 'Demo User', email: 'demo@example.com', avatar: CURRENT_USER.avatar },
    to: [{ name: 'Sarah Manager', email: 'sarah@company.com' }, { name: 'Mike', email: 'mike@company.com' }, { name: 'Lisa', email: 'lisa@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Q1 Budget Discussion',
    body: `I agree with Mike. Let's go with $75,000 to be safe.<br><br>
- Demo`,
    snippet: "I agree with Mike. Let's go with $75,000 to be safe.",
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    read: true,
    starred: false,
    important: false,
    labels: ['l1', 'l4'],
    category: 'primary',
    folder: 'sent',
    attachments: []
  });

  // Social Tab
  emails.push({
    id: 'email_social_1',
    threadId: 'thread_social_1',
    from: { name: 'LinkedIn', email: 'notifications@linkedin.com', avatar: 'https://picsum.photos/100/100?random=4' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'You appeared in 5 searches this week',
    body: 'People are looking for you. See who viewed your profile.',
    snippet: 'People are looking for you. See who viewed your profile.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    starred: false,
    important: false,
    labels: [],
    category: 'social',
    folder: 'inbox',
    attachments: []
  });

  // Promotions Tab
  emails.push({
    id: 'email_promo_1',
    threadId: 'thread_promo_1',
    from: { name: 'Amazon', email: 'store-news@amazon.com', avatar: 'https://picsum.photos/100/100?random=5' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Your order has shipped',
    body: 'Your package is on the way. Track your package here.',
    snippet: 'Your package is on the way. Track your package here.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
    starred: false,
    important: false,
    labels: [],
    category: 'promotions',
    folder: 'inbox',
    attachments: []
  });

  // Spam
  emails.push({
    id: 'email_spam_1',
    threadId: 'thread_spam_1',
    from: { name: 'Prince Henry', email: 'money@rich.com', avatar: 'https://picsum.photos/100/100?random=6' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'URGENT BUSINESS PROPOSAL',
    body: 'I have 50 million dollars for you...',
    snippet: 'I have 50 million dollars for you...',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 100).toISOString(),
    read: false,
    starred: false,
    important: false,
    labels: [],
    category: 'primary',
    folder: 'spam',
    attachments: []
  });

  // Trash
  emails.push({
    id: 'email_trash_1',
    threadId: 'thread_trash_1',
    from: { name: 'Newsletter', email: 'news@letter.com', avatar: 'https://picsum.photos/100/100?random=7' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Weekly Digest',
    body: 'Here is your weekly digest...',
    snippet: 'Here is your weekly digest...',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 200).toISOString(),
    read: true,
    starred: false,
    important: false,
    labels: [],
    category: 'promotions',
    folder: 'trash',
    attachments: []
  });

  // Additional Social emails
  emails.push({
    id: 'email_social_2',
    threadId: 'thread_social_2',
    from: { name: 'Twitter', email: 'notify@twitter.com', avatar: 'https://picsum.photos/100/100?random=twitter' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: '@alice_dev mentioned you in a tweet',
    body: '@alice_dev mentioned you: "Great work by @demouser on the new feature rollout! The UI improvements are fantastic."',
    snippet: '@alice_dev mentioned you: "Great work by @demouser on the new feature rollout!"',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
    starred: false,
    important: false,
    labels: [],
    category: 'social',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_social_3',
    threadId: 'thread_social_3',
    from: { name: 'Facebook', email: 'notification@facebookmail.com', avatar: 'https://picsum.photos/100/100?random=facebook' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'You have 3 new friend requests',
    body: 'You have 3 new friend requests on Facebook. See who wants to connect with you.',
    snippet: 'You have 3 new friend requests on Facebook.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 8).toISOString(),
    read: true,
    starred: false,
    important: false,
    labels: [],
    category: 'social',
    folder: 'inbox',
    attachments: []
  });

  // Additional Promotions emails
  emails.push({
    id: 'email_promo_2',
    threadId: 'thread_promo_2',
    from: { name: 'Uber Eats', email: 'receipts@uber.com', avatar: 'https://picsum.photos/100/100?random=uber' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Your Uber Eats receipt - $23.45',
    body: 'Thanks for your order from Chipotle Mexican Grill. Your total was $23.45.',
    snippet: 'Thanks for your order from Chipotle Mexican Grill. Total: $23.45',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 36).toISOString(),
    read: true,
    starred: false,
    important: false,
    labels: [],
    category: 'promotions',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_promo_3',
    threadId: 'thread_promo_3',
    from: { name: 'Spotify', email: 'noreply@spotify.com', avatar: 'https://picsum.photos/100/100?random=spotify' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Your Spotify Premium invoice for February 2026',
    body: 'Your Spotify Premium subscription has been renewed. Amount charged: $9.99.',
    snippet: 'Your Spotify Premium subscription has been renewed. Amount: $9.99',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 72).toISOString(),
    read: false,
    starred: false,
    important: false,
    labels: [],
    category: 'promotions',
    folder: 'inbox',
    attachments: []
  });

  // Email with multiple attachments
  emails.push({
    id: 'email_attachments_1',
    threadId: 'thread_attachments_1',
    from: { name: 'David Park', email: 'david@company.com', avatar: 'https://picsum.photos/100/100?random=david' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [{ name: 'Sarah Manager', email: 'sarah@company.com' }],
    bcc: [],
    subject: 'Q4 Reports and Assets',
    body: `Hi,<br><br>
Please find attached the Q4 reports and related assets for your review.<br><br>
- Q4 Financial Report (PDF)<br>
- Team Photo (JPEG)<br>
- Budget Spreadsheet (XLSX)<br>
- Project Presentation (PDF)<br><br>
Let me know if you have any questions.<br><br>
David`,
    snippet: 'Please find attached the Q4 reports and related assets for your review.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 6).toISOString(),
    read: false,
    starred: false,
    important: true,
    labels: ['l1', 'l4'],
    category: 'primary',
    folder: 'inbox',
    attachments: [
      { id: 'attach_q4_1', name: 'Q4_Financial_Report.pdf', size: '3.2 MB', type: 'application/pdf', url: '/files/_default/Q4_Financial_Report.pdf' },
      { id: 'attach_q4_2', name: 'team_photo_q4.jpg', size: '1.8 MB', type: 'image/jpeg', url: 'https://picsum.photos/800/600?random=teamphoto' },
      { id: 'attach_q4_3', name: 'Budget_2026.xlsx', size: '456 KB', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', url: '/files/_default/Budget_2026.xlsx' },
      { id: 'attach_q4_4', name: 'Q4_Presentation.pdf', size: '5.1 MB', type: 'application/pdf', url: '/files/_default/Q4_Presentation.pdf' }
    ]
  });

  // Longer thread (6+ messages) - Team Sprint Discussion
  emails.push({
    id: 'email_sprint_1',
    threadId: 'thread_sprint',
    from: { name: 'Emma Wilson', email: 'emma@company.com', avatar: 'https://picsum.photos/100/100?random=emma' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }, { name: 'Mike Chen', email: 'mike@company.com' }, { name: 'Lisa Anderson', email: 'lisa@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Sprint 12 Planning - Input Needed',
    body: `Hi team,<br><br>
Sprint 12 kicks off next Monday. I need everyone's input on the following items by Friday:<br>
1. Feature priorities for this sprint<br>
2. Any technical debt we should address<br>
3. Estimated story points per item<br><br>
Emma`,
    snippet: 'Sprint 12 kicks off next Monday. I need everyone\'s input on the following items.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    read: true,
    starred: false,
    important: true,
    labels: ['l1'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_sprint_2',
    threadId: 'thread_sprint',
    from: { name: 'Mike Chen', email: 'mike@company.com', avatar: 'https://picsum.photos/100/100?random=mike' },
    to: [{ name: 'Emma Wilson', email: 'emma@company.com' }, { name: 'Demo User', email: 'demo@example.com' }, { name: 'Lisa Anderson', email: 'lisa@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Sprint 12 Planning - Input Needed',
    body: `Hi Emma,<br><br>
From my side:<br>
1. Priority should be the authentication refactor and the dashboard improvements<br>
2. The API rate limiting issue has been causing problems — let's tackle that<br>
3. Auth refactor: 8 points, Dashboard: 5 points, Rate limiting: 3 points<br><br>
Mike`,
    snippet: 'Priority should be the authentication refactor and the dashboard improvements.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 90).toISOString(),
    read: true,
    starred: false,
    important: false,
    labels: ['l1'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_sprint_3',
    threadId: 'thread_sprint',
    from: { name: 'Lisa Anderson', email: 'lisa@company.com', avatar: 'https://picsum.photos/100/100?random=lisa' },
    to: [{ name: 'Emma Wilson', email: 'emma@company.com' }, { name: 'Demo User', email: 'demo@example.com' }, { name: 'Mike Chen', email: 'mike@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Sprint 12 Planning - Input Needed',
    body: `All,<br><br>
I agree with Mike on the priorities. I'd also add:<br>
- The mobile responsiveness fixes (users have been complaining)<br>
- Documentation updates for the new API endpoints<br><br>
Mobile fixes: ~5 points, Docs: 2 points<br><br>
Lisa`,
    snippet: 'I agree with Mike on the priorities. I\'d also add the mobile responsiveness fixes.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 80).toISOString(),
    read: true,
    starred: false,
    important: false,
    labels: ['l1'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_sprint_4',
    threadId: 'thread_sprint',
    from: { name: 'Demo User', email: 'demo@example.com', avatar: CURRENT_USER.avatar },
    to: [{ name: 'Emma Wilson', email: 'emma@company.com' }, { name: 'Mike Chen', email: 'mike@company.com' }, { name: 'Lisa Anderson', email: 'lisa@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Sprint 12 Planning - Input Needed',
    body: `Team,<br><br>
Great input! I'll add:<br>
- Performance optimization for the search feature (it's been slow)<br>
- Unit tests coverage improvement (we're at 62%, target 80%)<br><br>
Search perf: 5 points, Tests: 8 points<br><br>
That brings our total to 36 points — we might need to cut something. Let's discuss Monday.<br><br>
- Demo`,
    snippet: 'Great input! I\'ll add: Performance optimization for the search feature.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 72).toISOString(),
    read: true,
    starred: false,
    important: false,
    labels: ['l1'],
    category: 'primary',
    folder: 'sent',
    attachments: []
  });

  emails.push({
    id: 'email_sprint_5',
    threadId: 'thread_sprint',
    from: { name: 'Emma Wilson', email: 'emma@company.com', avatar: 'https://picsum.photos/100/100?random=emma' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }, { name: 'Mike Chen', email: 'mike@company.com' }, { name: 'Lisa Anderson', email: 'lisa@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Sprint 12 Planning - Input Needed',
    body: `Good call on the 36 points. Our velocity has been 28-32 points. We should cut either the test coverage or documentation.<br><br>
Thoughts? I'm leaning towards deferring docs to sprint 13 since the API is still changing anyway.<br><br>
Emma`,
    snippet: 'Good call on the 36 points. Our velocity has been 28-32 points.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 60).toISOString(),
    read: true,
    starred: false,
    important: false,
    labels: ['l1'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_sprint_6',
    threadId: 'thread_sprint',
    from: { name: 'Mike Chen', email: 'mike@company.com', avatar: 'https://picsum.photos/100/100?random=mike' },
    to: [{ name: 'Emma Wilson', email: 'emma@company.com' }, { name: 'Demo User', email: 'demo@example.com' }, { name: 'Lisa Anderson', email: 'lisa@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Re: Sprint 12 Planning - Input Needed',
    body: `+1 on deferring docs. The API changes next sprint will make any docs we write now outdated anyway.<br><br>
So final list: Auth refactor (8), Dashboard (5), Rate limiting (3), Mobile fixes (5), Search perf (5), Tests (8) = 34 points.<br><br>
That should be doable. See everyone Monday!<br>
Mike`,
    snippet: '+1 on deferring docs. Final list: Auth refactor (8), Dashboard (5), Rate limiting (3)...',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 48).toISOString(),
    read: false,
    starred: false,
    important: false,
    labels: ['l1'],
    category: 'primary',
    folder: 'inbox',
    attachments: []
  });

  // Pre-existing draft
  emails.push({
    id: 'email_draft_1',
    threadId: 'thread_draft_1',
    from: { name: 'Demo User', email: 'demo@example.com', avatar: CURRENT_USER.avatar },
    to: [{ name: 'alice@company.com', email: 'alice@company.com' }],
    cc: [],
    bcc: [],
    subject: 'Meeting Notes',
    body: 'Hi Alice,\n\nHere are the notes from our meeting yesterday:\n\n1. Reviewed Q4 roadmap\n2. Discussed timeline for new features\n3. ',
    snippet: 'Hi Alice, Here are the notes from our meeting yesterday: 1. Reviewed Q4 roadmap',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 90).toISOString(), // 90 mins ago
    read: true,
    starred: false,
    important: false,
    labels: [],
    category: 'primary',
    folder: 'drafts',
    attachments: []
  });

  // Updates category emails
  emails.push({
    id: 'email_updates_1',
    threadId: 'thread_updates_1',
    from: { name: 'Chase Bank', email: 'no-reply@chase.com', avatar: 'https://picsum.photos/100/100?random=chase' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Your February 2026 statement is ready',
    body: 'Your Chase Checking Account statement for February 2026 is now available. Your balance is $3,248.76. Log in to view your full statement.',
    snippet: 'Your Chase Checking Account statement for February 2026 is now available.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    read: false,
    starred: false,
    important: false,
    labels: ['l4'],
    category: 'updates',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_updates_2',
    threadId: 'thread_updates_2',
    from: { name: 'Google', email: 'no-reply@accounts.google.com', avatar: 'https://picsum.photos/100/100?random=google' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: 'Security alert: New sign-in on Windows',
    body: 'Your Google Account demo@example.com was just signed in to from a Windows device. If this was you, you can ignore this alert. If not, we recommend securing your account.',
    snippet: 'Your Google Account was just signed in to from a Windows device.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
    read: true,
    starred: false,
    important: false,
    labels: [],
    category: 'updates',
    folder: 'inbox',
    attachments: []
  });

  // Forums category emails
  emails.push({
    id: 'email_forums_1',
    threadId: 'thread_forums_1',
    from: { name: 'Python Mailing List', email: 'python-dev@python.org', avatar: 'https://picsum.photos/100/100?random=python' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: '[Python-dev] PEP 740 - Index Support for Verifiable Build Provenance',
    body: 'Hi all, I\'d like to propose a new PEP for adding index support for verifiable build provenance. The main goal is to allow package indices to support attestations...',
    snippet: 'I\'d like to propose a new PEP for adding index support for verifiable build provenance.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 10).toISOString(), // 10 hours ago
    read: false,
    starred: false,
    important: false,
    labels: [],
    category: 'forums',
    folder: 'inbox',
    attachments: []
  });

  emails.push({
    id: 'email_forums_2',
    threadId: 'thread_forums_2',
    from: { name: 'Company All-Hands Group', email: 'all-hands@company.com', avatar: 'https://picsum.photos/100/100?random=allhands' },
    to: [{ name: 'Demo User', email: 'demo@example.com' }],
    cc: [],
    bcc: [],
    subject: '[Company] Engineering All-Hands Notes - Feb 2026',
    body: 'Hi everyone, here are the notes from our February Engineering All-Hands. Key topics covered: roadmap review, hiring update, and new engineering principles.',
    snippet: 'Here are the notes from our February Engineering All-Hands meeting.',
    timestamp: new Date(BASE_TIME - 1000 * 60 * 60 * 30).toISOString(), // 30 hours ago
    read: true,
    starred: false,
    important: false,
    labels: ['l1'],
    category: 'forums',
    folder: 'inbox',
    attachments: []
  });

  return emails;
};

export const DEFAULT_SETTINGS = {
  density: 'default',
  undoSend: 10,
  signature: '--\nDemo User\ndemo@example.com',
  categoryTabs: { primary: true, social: true, promotions: true, updates: false, forums: false },
  replyBehavior: 'Reply',
  language: 'English (US)',
  sysLabelShown: {},
  userLabelShown: {},
};

function createDefaultData() {
  return {
    user: CURRENT_USER,
    emails: generateEmails(),
    labels: LABELS,
    drafts: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

export const INITIAL_STATE = createDefaultData();

// Custom state injected via POST /post endpoint
let customInitialState = null;

export const setCustomInitialState = (state) => {
  customInitialState = state;
};

export const getCustomInitialState = () => customInitialState;

// Merge custom state with defaults
export const getInitialStateWithCustom = () => {
  if (!customInitialState) {
    return INITIAL_STATE;
  }

  // Deep merge custom state with defaults
  const merged = { ...INITIAL_STATE };

  if (customInitialState.user) {
    merged.user = { ...INITIAL_STATE.user, ...customInitialState.user };
  }

  if (customInitialState.emails) {
    // For emails, replace if provided, don't merge arrays
    merged.emails = customInitialState.emails;
  }

  if (customInitialState.labels) {
    merged.labels = customInitialState.labels;
  }

  if (customInitialState.drafts) {
    merged.drafts = customInitialState.drafts;
  }

  return merged;
};

// Calculate state diff
export const calculateStateDiff = (initial, current) => {
  const diff = {};

  // Check emails changes
  const initialEmails = initial?.emails || [];
  const currentEmails = current?.emails || [];

  // New emails
  const newEmailIds = currentEmails.filter(e => !initialEmails.find(ie => ie.id === e.id)).map(e => e.id);
  if (newEmailIds.length > 0) {
    diff.newEmails = newEmailIds;
  }

  // Deleted emails
  const deletedEmailIds = initialEmails.filter(e => !currentEmails.find(ce => ce.id === e.id)).map(e => e.id);
  if (deletedEmailIds.length > 0) {
    diff.deletedEmails = deletedEmailIds;
  }

  // Modified emails (read status, starred, folder, etc.)
  const modifiedEmails = {};
  for (const current of currentEmails) {
    const initial = initialEmails.find(e => e.id === current.id);
    if (initial) {
      const changes = {};
      if (initial.read !== current.read) changes.read = { from: initial.read, to: current.read };
      if (initial.starred !== current.starred) changes.starred = { from: initial.starred, to: current.starred };
      if (initial.important !== current.important) changes.important = { from: initial.important, to: current.important };
      if (initial.folder !== current.folder) changes.folder = { from: initial.folder, to: current.folder };
      if (JSON.stringify(initial.labels) !== JSON.stringify(current.labels)) changes.labels = { from: initial.labels, to: current.labels };

      if (Object.keys(changes).length > 0) {
        modifiedEmails[current.id] = changes;
      }
    }
  }
  if (Object.keys(modifiedEmails).length > 0) {
    diff.modifiedEmails = modifiedEmails;
  }

  // Labels changes
  if (JSON.stringify(initial?.labels) !== JSON.stringify(current?.labels)) {
    diff.labels = current?.labels;
  }

  // Settings changes
  if (JSON.stringify(initial?.settings) !== JSON.stringify(current?.settings)) {
    diff.settings = current?.settings;
  }

  return diff;
};
