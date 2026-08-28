const BASE_KEY = 'zendesk_mock_state';
const BASE_INITIAL_KEY = 'zendesk_mock_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('zendesk_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('zendesk_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${encodeURIComponent(sid)}`);
    if (res.ok) {
      const data = await res.json();
      // /state wraps the injected state as { stored_state, has_custom_state, sid }.
      // Unwrap it so initializeData merges the real state (not the wrapper),
      // matching servicenow_mock's fetchCustomState.
      if (data && data.has_custom_state && data.stored_state) {
        return data.stored_state;
      }
      return null;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveState = (state, sid) => {
  try {
    localStorage.setItem(storageKey(sid), JSON.stringify(state));
  } catch (e) { /* ignore quota errors */ }
  if (sid) {
    fetch(`/post?sid=${encodeURIComponent(sid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state }),
    }).catch(() => {});
  }
};

export const loadState = (sid) => {
  try {
    const raw = localStorage.getItem(storageKey(sid));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const getInitialState = (sid) => {
  try {
    const raw = localStorage.getItem(initialKey(sid));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  if (!target || typeof target !== 'object') return source;
  if (Array.isArray(source)) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) continue;
    if (typeof source[key] === 'object' && !Array.isArray(source[key]) && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  if (customState) {
    const defaults = createInitialData();
    const merged = { ...defaults, ...customState };
    localStorage.setItem(storageKey(sid), JSON.stringify(merged));
    localStorage.setItem(initialKey(sid), JSON.stringify(merged));
    return merged;
  }

  const existing = loadState(sid);
  if (existing) return existing;

  const defaults = createInitialData();
  localStorage.setItem(storageKey(sid), JSON.stringify(defaults));
  localStorage.setItem(initialKey(sid), JSON.stringify(defaults));
  return defaults;
};

export function createInitialData() {
  const now = new Date();
  const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();
  const hoursAgo = (h) => new Date(now.getTime() - h * 3600000).toISOString();

  const agents = [
    { id: 1, name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'agent', phone: '+1-555-0101', photo: null, organization_id: null, group_id: 1, time_zone: 'America/New_York', locale: 'en-US', signature: 'Best regards,\nSarah Chen\nCustomer Support', notes: '', suspended: false, verified: true, active: true, created_at: '2023-06-15T10:00:00Z', updated_at: daysAgo(5), last_login_at: hoursAgo(1), initials: 'SC' },
    { id: 2, name: 'Marcus Johnson', email: 'marcus.j@company.com', role: 'agent', phone: '+1-555-0102', photo: null, organization_id: null, group_id: 1, time_zone: 'America/Chicago', locale: 'en-US', signature: 'Thanks,\nMarcus Johnson', notes: '', suspended: false, verified: true, active: true, created_at: '2023-08-01T10:00:00Z', updated_at: daysAgo(3), last_login_at: hoursAgo(2), initials: 'MJ' },
    { id: 3, name: 'Emily Rodriguez', email: 'emily.r@company.com', role: 'agent', phone: '+1-555-0103', photo: null, organization_id: null, group_id: 2, time_zone: 'America/Los_Angeles', locale: 'en-US', signature: 'Cheers,\nEmily Rodriguez\nTier 2 Support', notes: '', suspended: false, verified: true, active: true, created_at: '2023-09-15T10:00:00Z', updated_at: daysAgo(2), last_login_at: hoursAgo(3), initials: 'ER' },
    { id: 4, name: 'David Kim', email: 'david.kim@company.com', role: 'agent', phone: '+1-555-0104', photo: null, organization_id: null, group_id: 3, time_zone: 'America/New_York', locale: 'en-US', signature: 'Best,\nDavid Kim\nBilling Support', notes: '', suspended: false, verified: true, active: true, created_at: '2023-11-01T10:00:00Z', updated_at: daysAgo(1), last_login_at: hoursAgo(5), initials: 'DK' },
    { id: 5, name: 'Priya Patel', email: 'priya.p@company.com', role: 'agent', phone: '+1-555-0105', photo: null, organization_id: null, group_id: 4, time_zone: 'America/New_York', locale: 'en-US', signature: 'Regards,\nPriya Patel\nEngineering', notes: '', suspended: false, verified: true, active: true, created_at: '2024-01-10T10:00:00Z', updated_at: daysAgo(1), last_login_at: hoursAgo(8), initials: 'PP' },
  ];

  const endUsers = [
    { id: 101, name: 'Alex Thompson', email: 'alex.t@acmecorp.com', role: 'end-user', phone: '+1-555-1001', photo: null, organization_id: 1, group_id: null, time_zone: 'America/New_York', locale: 'en-US', signature: '', notes: 'VIP customer', suspended: false, verified: true, active: true, created_at: '2024-03-10T10:00:00Z', updated_at: daysAgo(1), last_login_at: daysAgo(1), initials: 'AT' },
    { id: 102, name: 'Jordan Lee', email: 'jordan.lee@techstart.io', role: 'end-user', phone: '+1-555-1002', photo: null, organization_id: 2, group_id: null, time_zone: 'America/Chicago', locale: 'en-US', signature: '', notes: '', suspended: false, verified: true, active: true, created_at: '2024-04-15T10:00:00Z', updated_at: daysAgo(2), last_login_at: daysAgo(2), initials: 'JL' },
    { id: 103, name: 'Maria Garcia', email: 'maria.g@globalretail.com', role: 'end-user', phone: '+1-555-1003', photo: null, organization_id: 3, group_id: null, time_zone: 'America/Los_Angeles', locale: 'en-US', signature: '', notes: '', suspended: false, verified: true, active: true, created_at: '2024-05-20T10:00:00Z', updated_at: daysAgo(1), last_login_at: daysAgo(1), initials: 'MG' },
    { id: 104, name: 'Sam Wilson', email: 'sam.wilson@acmecorp.com', role: 'end-user', phone: '+1-555-1004', photo: null, organization_id: 1, group_id: null, time_zone: 'America/Denver', locale: 'en-US', signature: '', notes: '', suspended: false, verified: true, active: true, created_at: '2024-06-01T10:00:00Z', updated_at: daysAgo(5), last_login_at: daysAgo(3), initials: 'SW' },
    { id: 105, name: 'Nina Patel', email: 'nina.p@techstart.io', role: 'end-user', phone: '+1-555-1005', photo: null, organization_id: 2, group_id: null, time_zone: 'Asia/Kolkata', locale: 'en-US', signature: '', notes: '', suspended: false, verified: true, active: true, created_at: '2024-06-15T10:00:00Z', updated_at: daysAgo(3), last_login_at: daysAgo(2), initials: 'NP' },
    { id: 106, name: 'Chris Brown', email: 'chris.b@designhub.co', role: 'end-user', phone: '+1-555-1006', photo: null, organization_id: 4, group_id: null, time_zone: 'America/New_York', locale: 'en-US', signature: '', notes: '', suspended: false, verified: true, active: true, created_at: '2024-07-01T10:00:00Z', updated_at: daysAgo(7), last_login_at: daysAgo(5), initials: 'CB' },
    { id: 107, name: 'Lisa Wang', email: 'lisa.wang@globalretail.com', role: 'end-user', phone: '+1-555-1007', photo: null, organization_id: 3, group_id: null, time_zone: 'Asia/Shanghai', locale: 'en-US', signature: '', notes: '', suspended: false, verified: true, active: true, created_at: '2024-07-15T10:00:00Z', updated_at: daysAgo(2), last_login_at: daysAgo(1), initials: 'LW' },
    { id: 108, name: 'Tom Anderson', email: 'tom.a@freelance.com', role: 'end-user', phone: '+1-555-1008', photo: null, organization_id: null, group_id: null, time_zone: 'America/New_York', locale: 'en-US', signature: '', notes: 'Freelancer, no org', suspended: false, verified: true, active: true, created_at: '2024-08-01T10:00:00Z', updated_at: daysAgo(4), last_login_at: daysAgo(3), initials: 'TA' },
    { id: 109, name: 'Rachel Kim', email: 'rachel.k@edutech.org', role: 'end-user', phone: '+1-555-1009', photo: null, organization_id: 5, group_id: null, time_zone: 'America/New_York', locale: 'en-US', signature: '', notes: '', suspended: false, verified: true, active: true, created_at: '2024-08-15T10:00:00Z', updated_at: daysAgo(6), last_login_at: daysAgo(4), initials: 'RK' },
    { id: 110, name: 'Mike Davis', email: 'mike.d@acmecorp.com', role: 'end-user', phone: '+1-555-1010', photo: null, organization_id: 1, group_id: null, time_zone: 'America/Chicago', locale: 'en-US', signature: '', notes: '', suspended: false, verified: true, active: true, created_at: '2024-09-01T10:00:00Z', updated_at: daysAgo(1), last_login_at: hoursAgo(12), initials: 'MD' },
  ];

  const users = [...agents, ...endUsers];

  const organizations = [
    { id: 1, name: 'Acme Corp', domain_names: ['acmecorp.com'], details: 'Enterprise customer, 500+ employees', notes: 'Key account — escalate P1 tickets immediately', group_id: 1, shared_tickets: false, shared_comments: false, tags: ['enterprise', 'key-account'], created_at: '2023-01-15T00:00:00Z', updated_at: daysAgo(10) },
    { id: 2, name: 'TechStart Inc', domain_names: ['techstart.io'], details: 'Growing startup, 50 employees', notes: 'Recently upgraded to Pro plan', group_id: 1, shared_tickets: false, shared_comments: false, tags: ['startup', 'growth'], created_at: '2023-03-20T00:00:00Z', updated_at: daysAgo(15) },
    { id: 3, name: 'Global Retail', domain_names: ['globalretail.com'], details: 'Enterprise retail chain, 2000+ employees', notes: 'Multi-region deployment', group_id: 1, shared_tickets: false, shared_comments: false, tags: ['enterprise', 'retail'], created_at: '2023-05-10T00:00:00Z', updated_at: daysAgo(8) },
    { id: 4, name: 'DesignHub Co', domain_names: ['designhub.co'], details: 'Small design agency, 15 employees', notes: '', group_id: 1, shared_tickets: false, shared_comments: false, tags: ['smb'], created_at: '2023-09-01T00:00:00Z', updated_at: daysAgo(20) },
    { id: 5, name: 'EduTech Foundation', domain_names: ['edutech.org'], details: 'Non-profit educational technology organization', notes: 'Eligible for non-profit discount', group_id: 1, shared_tickets: false, shared_comments: false, tags: ['nonprofit', 'education'], created_at: '2024-01-10T00:00:00Z', updated_at: daysAgo(12) },
  ];

  const groups = [
    { id: 1, name: 'Tier 1 Support', description: 'Front-line customer support', default: true, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
    { id: 2, name: 'Tier 2 Support', description: 'Escalated technical issues', default: false, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
    { id: 3, name: 'Billing', description: 'Payment and subscription issues', default: false, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
    { id: 4, name: 'Engineering', description: 'Bug reports and feature requests', default: false, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
  ];

  const tickets = [
    { id: 1001, subject: 'Cannot login to dashboard after password reset', description: 'I reset my password yesterday using the "Forgot Password" link, but now when I try to login with the new password, it says "Invalid credentials". I\'ve tried multiple browsers.', status: 'open', type: 'problem', priority: 'high', requester_id: 101, submitter_id: 101, assignee_id: 1, group_id: 1, organization_id: 1, collaborator_ids: [], follower_ids: [2], tags: ['login', 'password', 'urgent-fix'], via: { channel: 'email' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(1.5), updated_at: hoursAgo(2), comment_count: 4, sla: { first_reply_at: daysAgo(1.4), next_reply_due: hoursAgo(-6), breached: false } },
    { id: 1002, subject: 'Billing discrepancy on January invoice', description: 'Hi, I noticed my January invoice shows a charge of $499 but my plan should be $299/month. Can you please look into this?', status: 'pending', type: 'question', priority: 'normal', requester_id: 102, submitter_id: 102, assignee_id: 4, group_id: 3, organization_id: 2, collaborator_ids: [], follower_ids: [], tags: ['billing', 'invoice'], via: { channel: 'email' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(3), updated_at: daysAgo(1), comment_count: 3, sla: { first_reply_at: daysAgo(2.8), next_reply_due: daysAgo(-2), breached: false } },
    { id: 1003, subject: 'App crashes when uploading files > 10MB', description: 'Every time I try to upload a file larger than 10MB, the application crashes and shows a white screen. This is blocking our team from sharing design assets.', status: 'open', type: 'problem', priority: 'urgent', requester_id: 103, submitter_id: 103, assignee_id: 3, group_id: 2, organization_id: 3, collaborator_ids: [107], follower_ids: [1, 5], tags: ['bug', 'crash', 'upload'], via: { channel: 'web' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(2), updated_at: hoursAgo(5), comment_count: 5, sla: { first_reply_at: daysAgo(1.9), next_reply_due: hoursAgo(-3), breached: false } },
    { id: 1004, subject: 'How to export data to CSV?', description: 'Hello, I need to export our customer data to a CSV file for a quarterly report. Can you guide me through the steps?', status: 'solved', type: 'question', priority: 'low', requester_id: 104, submitter_id: 104, assignee_id: 1, group_id: 1, organization_id: 1, collaborator_ids: [], follower_ids: [], tags: ['export', 'csv', 'documentation'], via: { channel: 'email' }, satisfaction_rating: { score: 'good', comment: 'Very helpful, thank you!' }, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(5), updated_at: daysAgo(4), comment_count: 3, sla: { first_reply_at: daysAgo(4.8), next_reply_due: null, breached: false } },
    { id: 1005, subject: 'Feature request: Dark mode support', description: 'Several team members have requested dark mode support for the dashboard. This would greatly improve our workflow during late shifts.', status: 'open', type: 'task', priority: 'normal', requester_id: 105, submitter_id: 105, assignee_id: 5, group_id: 4, organization_id: 2, collaborator_ids: [], follower_ids: [1], tags: ['feature-request', 'dark-mode'], via: { channel: 'web' }, satisfaction_rating: null, due_at: daysAgo(-14), is_public: true, custom_fields: [], created_at: daysAgo(7), updated_at: daysAgo(3), comment_count: 3, sla: { first_reply_at: daysAgo(6.5), next_reply_due: null, breached: false } },
    { id: 1006, subject: 'Cannot access API documentation', description: 'I\'m trying to access the API docs at docs.company.com/api but I keep getting a 403 Forbidden error. My team needs this for our integration project.', status: 'new', type: 'question', priority: 'normal', requester_id: 106, submitter_id: 106, assignee_id: null, group_id: 1, organization_id: 4, collaborator_ids: [], follower_ids: [], tags: ['api', 'documentation'], via: { channel: 'email' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(1), updated_at: daysAgo(1), comment_count: 1, sla: { first_reply_at: null, next_reply_due: hoursAgo(-4), breached: false } },
    { id: 1007, subject: 'Integration with Slack not sending notifications', description: 'We set up the Slack integration last week but notifications are not being sent to our #support channel. We followed the setup guide exactly.', status: 'open', type: 'incident', priority: 'high', requester_id: 101, submitter_id: 101, assignee_id: 2, group_id: 1, organization_id: 1, collaborator_ids: [], follower_ids: [1], tags: ['integration', 'slack', 'notification'], via: { channel: 'email' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(3), updated_at: daysAgo(1), comment_count: 4, sla: { first_reply_at: daysAgo(2.8), next_reply_due: hoursAgo(-8), breached: false } },
    { id: 1008, subject: 'Subscription upgrade not reflected', description: 'I upgraded from Basic to Pro plan 3 days ago but my account still shows Basic features. Payment was processed successfully.', status: 'pending', type: 'problem', priority: 'high', requester_id: 108, submitter_id: 108, assignee_id: 4, group_id: 3, organization_id: null, collaborator_ids: [], follower_ids: [], tags: ['subscription', 'upgrade', 'billing'], via: { channel: 'web' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(4), updated_at: daysAgo(2), comment_count: 3, sla: { first_reply_at: daysAgo(3.8), next_reply_due: daysAgo(-1), breached: false } },
    { id: 1009, subject: 'Mobile app performance issues on Android', description: 'The mobile app has become extremely slow on Android devices. Loading times are 10+ seconds and the app frequently freezes.', status: 'open', type: 'problem', priority: 'normal', requester_id: 107, submitter_id: 107, assignee_id: 3, group_id: 2, organization_id: 3, collaborator_ids: [], follower_ids: [5], tags: ['mobile', 'android', 'performance'], via: { channel: 'email' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(6), updated_at: daysAgo(2), comment_count: 4, sla: { first_reply_at: daysAgo(5.8), next_reply_due: hoursAgo(-12), breached: false } },
    { id: 1010, subject: 'Need to change organization admin', description: 'Our previous admin, John Smith, has left the company. We need to transfer admin rights to me. How do we proceed?', status: 'new', type: 'question', priority: 'low', requester_id: 109, submitter_id: 109, assignee_id: null, group_id: 1, organization_id: 5, collaborator_ids: [], follower_ids: [], tags: ['enterprise'], via: { channel: 'web' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(2), updated_at: daysAgo(2), comment_count: 1, sla: { first_reply_at: null, next_reply_due: hoursAgo(-20), breached: false } },
    { id: 1011, subject: 'Two-factor authentication setup failing', description: 'I\'m trying to enable 2FA on my account but the verification codes are not being accepted. I\'ve tried both SMS and authenticator app methods.', status: 'open', type: 'incident', priority: 'urgent', requester_id: 110, submitter_id: 110, assignee_id: 1, group_id: 1, organization_id: 1, collaborator_ids: [], follower_ids: [2, 3], tags: ['2fa', 'login', 'urgent-fix'], via: { channel: 'email' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: hoursAgo(6), updated_at: hoursAgo(1), comment_count: 3, sla: { first_reply_at: hoursAgo(5), next_reply_due: hoursAgo(-2), breached: false } },
    { id: 1012, subject: 'Data import from legacy system', description: 'We need to import approximately 50,000 customer records from our legacy CRM system. What format do you support and are there any limitations?', status: 'hold', type: 'task', priority: 'normal', requester_id: 102, submitter_id: 102, assignee_id: 5, group_id: 4, organization_id: 2, collaborator_ids: [], follower_ids: [1], tags: ['import', 'enterprise'], via: { channel: 'email' }, satisfaction_rating: null, due_at: daysAgo(-7), is_public: true, custom_fields: [], created_at: daysAgo(10), updated_at: daysAgo(5), comment_count: 4, sla: { first_reply_at: daysAgo(9.5), next_reply_due: null, breached: false } },
    { id: 1013, subject: 'Custom report builder not loading', description: 'When I try to access the custom report builder, the page shows a loading spinner indefinitely. This has been happening since yesterday.', status: 'solved', type: 'problem', priority: 'normal', requester_id: 103, submitter_id: 103, assignee_id: 3, group_id: 2, organization_id: 3, collaborator_ids: [], follower_ids: [], tags: ['bug', 'performance'], via: { channel: 'web' }, satisfaction_rating: { score: 'good', comment: '' }, due_at: null, is_public: true, custom_fields: [], created_at: daysAgo(8), updated_at: daysAgo(6), comment_count: 3, sla: { first_reply_at: daysAgo(7.8), next_reply_due: null, breached: false } },
    { id: 1014, subject: 'Request for team training session', description: 'We have 10 new team members joining next month and would like to schedule a training session on the platform. Do you offer onboarding training?', status: 'pending', type: 'task', priority: 'low', requester_id: 104, submitter_id: 104, assignee_id: 2, group_id: 1, organization_id: 1, collaborator_ids: [], follower_ids: [], tags: ['training'], via: { channel: 'email' }, satisfaction_rating: null, due_at: daysAgo(-21), is_public: true, custom_fields: [], created_at: daysAgo(7), updated_at: daysAgo(4), comment_count: 2, sla: { first_reply_at: daysAgo(6.5), next_reply_due: daysAgo(-5), breached: false } },
    { id: 1015, subject: 'SSO configuration errors after domain change', description: 'After changing our company domain from old-techstart.io to techstart.io, SSO authentication is broken for all users. Getting SAML assertion errors.', status: 'new', type: 'incident', priority: 'high', requester_id: 105, submitter_id: 105, assignee_id: null, group_id: 2, organization_id: 2, collaborator_ids: [], follower_ids: [], tags: ['sso', 'enterprise'], via: { channel: 'email' }, satisfaction_rating: null, due_at: null, is_public: true, custom_fields: [], created_at: hoursAgo(3), updated_at: hoursAgo(3), comment_count: 1, sla: { first_reply_at: null, next_reply_due: hoursAgo(-5), breached: false } },
  ];

  const comments = {
    1001: [
      { id: 5001, ticket_id: 1001, author_id: 101, body: 'I reset my password yesterday using the "Forgot Password" link, but now when I try to login with the new password, it says "Invalid credentials". I\'ve tried Chrome, Firefox, and Safari. Clearing cache didn\'t help either.', html_body: '<p>I reset my password yesterday using the "Forgot Password" link, but now when I try to login with the new password, it says "Invalid credentials". I\'ve tried Chrome, Firefox, and Safari. Clearing cache didn\'t help either.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(1.5) },
      { id: 5002, ticket_id: 1001, author_id: 1, body: 'Checked auth logs — seeing multiple failed attempts from IP 192.168.1.45. The password reset token may have expired before being used. Need to verify the token expiry window.', html_body: '<p>Checked auth logs — seeing multiple failed attempts from IP 192.168.1.45. The password reset token may have expired before being used. Need to verify the token expiry window.</p>', public: false, type: 'Comment', attachments: [], created_at: daysAgo(1.4) },
      { id: 5003, ticket_id: 1001, author_id: 1, body: 'Hi Alex, thank you for reaching out. I\'ve looked into this and it appears the password reset token had a short expiry window. I\'ve sent you a new password reset link — please use it within 30 minutes. If the issue persists, try using an incognito window.', html_body: '<p>Hi Alex, thank you for reaching out. I\'ve looked into this and it appears the password reset token had a short expiry window. I\'ve sent you a new password reset link — please use it within 30 minutes. If the issue persists, try using an incognito window.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(1.3) },
      { id: 5004, ticket_id: 1001, author_id: 101, body: 'Thanks Sarah! I used the new link and was able to reset my password. However, I\'m now seeing a different error: "Account locked". Could this be related?', html_body: '<p>Thanks Sarah! I used the new link and was able to reset my password. However, I\'m now seeing a different error: "Account locked". Could this be related?</p>', public: true, type: 'Comment', attachments: [], created_at: hoursAgo(2) },
    ],
    1002: [
      { id: 5010, ticket_id: 1002, author_id: 102, body: 'Hi, I noticed my January invoice shows a charge of $499 but my plan should be $299/month. Can you please look into this? I have attached a screenshot of the invoice.', html_body: '<p>Hi, I noticed my January invoice shows a charge of $499 but my plan should be $299/month. Can you please look into this? I have attached a screenshot of the invoice.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(3) },
      { id: 5011, ticket_id: 1002, author_id: 4, body: 'Hi Jordan, I\'ve reviewed your account. The additional $200 charge appears to be for an add-on service (Advanced Analytics) that was activated on January 5th. Could you confirm if someone on your team enabled this feature? I\'ve put the ticket on pending while we await your response.', html_body: '<p>Hi Jordan, I\'ve reviewed your account. The additional $200 charge appears to be for an add-on service (Advanced Analytics) that was activated on January 5th. Could you confirm if someone on your team enabled this feature? I\'ve put the ticket on pending while we await your response.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(2.8) },
      { id: 5012, ticket_id: 1002, author_id: 102, body: 'Oh, I see. I think my colleague might have enabled it accidentally. Can we get a refund for this month and disable the add-on?', html_body: '<p>Oh, I see. I think my colleague might have enabled it accidentally. Can we get a refund for this month and disable the add-on?</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(1) },
    ],
    1003: [
      { id: 5020, ticket_id: 1003, author_id: 103, body: 'Every time I try to upload a file larger than 10MB, the application crashes and shows a white screen. This is blocking our team from sharing design assets. Browser: Chrome 120. OS: macOS Sonoma.', html_body: '<p>Every time I try to upload a file larger than 10MB, the application crashes and shows a white screen. This is blocking our team from sharing design assets. Browser: Chrome 120. OS: macOS Sonoma.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(2) },
      { id: 5021, ticket_id: 1003, author_id: 3, body: 'Reproduced the issue locally. The file upload handler doesn\'t handle large files properly — it tries to load the entire file into memory. Filing an engineering ticket for a chunked upload fix.', html_body: '<p>Reproduced the issue locally. The file upload handler doesn\'t handle large files properly — it tries to load the entire file into memory. Filing an engineering ticket for a chunked upload fix.</p>', public: false, type: 'Comment', attachments: [], created_at: daysAgo(1.9) },
      { id: 5022, ticket_id: 1003, author_id: 3, body: 'Hi Maria, thank you for the detailed report. We\'ve confirmed this is a known issue with files over 10MB. Our engineering team is working on a fix. As a temporary workaround, you can compress your files before uploading, or use our desktop app which handles large files differently.', html_body: '<p>Hi Maria, thank you for the detailed report. We\'ve confirmed this is a known issue with files over 10MB. Our engineering team is working on a fix. As a temporary workaround, you can compress your files before uploading, or use our desktop app which handles large files differently.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(1.8) },
      { id: 5023, ticket_id: 1003, author_id: 103, body: 'The desktop app workaround works for now, but we really need the web upload fixed as several team members work remotely on Chromebooks.', html_body: '<p>The desktop app workaround works for now, but we really need the web upload fixed as several team members work remotely on Chromebooks.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(1), },
      { id: 5024, ticket_id: 1003, author_id: 5, body: 'Engineering update: PR #4521 submitted with chunked upload implementation. Expected to ship in next release (v2.14). ETA: 1 week.', html_body: '<p>Engineering update: PR #4521 submitted with chunked upload implementation. Expected to ship in next release (v2.14). ETA: 1 week.</p>', public: false, type: 'Comment', attachments: [], created_at: hoursAgo(5) },
    ],
    1004: [
      { id: 5030, ticket_id: 1004, author_id: 104, body: 'Hello, I need to export our customer data to a CSV file for a quarterly report. Can you guide me through the steps?', html_body: '<p>Hello, I need to export our customer data to a CSV file for a quarterly report. Can you guide me through the steps?</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(5) },
      { id: 5031, ticket_id: 1004, author_id: 1, body: 'Hi Sam! You can export data to CSV by going to Settings → Data Management → Export. Select the data type (Customers, Orders, etc.), choose your date range, and click "Export to CSV". The file will be emailed to your registered address within a few minutes.', html_body: '<p>Hi Sam! You can export data to CSV by going to Settings → Data Management → Export. Select the data type (Customers, Orders, etc.), choose your date range, and click "Export to CSV". The file will be emailed to your registered address within a few minutes.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(4.8) },
      { id: 5032, ticket_id: 1004, author_id: 104, body: 'Perfect, that worked! I found the export option. Thanks for the quick help, Sarah!', html_body: '<p>Perfect, that worked! I found the export option. Thanks for the quick help, Sarah!</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(4) },
    ],
    1005: [
      { id: 5040, ticket_id: 1005, author_id: 105, body: 'Several team members have requested dark mode support for the dashboard. This would greatly improve our workflow during late shifts. We work across multiple time zones and many of us prefer darker interfaces.', html_body: '<p>Several team members have requested dark mode support for the dashboard. This would greatly improve our workflow during late shifts. We work across multiple time zones and many of us prefer darker interfaces.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(7) },
      { id: 5041, ticket_id: 1005, author_id: 5, body: 'Added to our product roadmap under "UI/UX Improvements". Currently planned for Q2. Will update this ticket as we make progress.', html_body: '<p>Added to our product roadmap under "UI/UX Improvements". Currently planned for Q2. Will update this ticket as we make progress.</p>', public: false, type: 'Comment', attachments: [], created_at: daysAgo(6.5) },
      { id: 5042, ticket_id: 1005, author_id: 5, body: 'Hi Nina, thank you for the feature request! Dark mode is on our roadmap for Q2 of this year. I\'ve added your vote to the feature request. We\'ll keep you updated on progress.', html_body: '<p>Hi Nina, thank you for the feature request! Dark mode is on our roadmap for Q2 of this year. I\'ve added your vote to the feature request. We\'ll keep you updated on progress.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(6) },
    ],
    1006: [
      { id: 5050, ticket_id: 1006, author_id: 106, body: 'I\'m trying to access the API docs at docs.company.com/api but I keep getting a 403 Forbidden error. My team needs this for our integration project. Our account is on the Pro plan which should include API access.', html_body: '<p>I\'m trying to access the API docs at docs.company.com/api but I keep getting a 403 Forbidden error. My team needs this for our integration project. Our account is on the Pro plan which should include API access.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(1) },
    ],
    1007: [
      { id: 5060, ticket_id: 1007, author_id: 101, body: 'We set up the Slack integration last week but notifications are not being sent to our #support channel. We followed the setup guide exactly. The integration shows as "Connected" in settings.', html_body: '<p>We set up the Slack integration last week but notifications are not being sent to our #support channel. We followed the setup guide exactly. The integration shows as "Connected" in settings.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(3) },
      { id: 5061, ticket_id: 1007, author_id: 2, body: 'Checking the webhook logs for Acme Corp\'s Slack integration. Seeing 401 errors — the OAuth token may have been revoked.', html_body: '<p>Checking the webhook logs for Acme Corp\'s Slack integration. Seeing 401 errors — the OAuth token may have been revoked.</p>', public: false, type: 'Comment', attachments: [], created_at: daysAgo(2.8) },
      { id: 5062, ticket_id: 1007, author_id: 2, body: 'Hi Alex, I\'ve checked the integration logs and found that the Slack OAuth token expired. This can happen if your Slack workspace admin changed permissions. Could you try disconnecting and reconnecting the integration from Settings → Integrations → Slack?', html_body: '<p>Hi Alex, I\'ve checked the integration logs and found that the Slack OAuth token expired. This can happen if your Slack workspace admin changed permissions. Could you try disconnecting and reconnecting the integration from Settings → Integrations → Slack?</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(2.5) },
      { id: 5063, ticket_id: 1007, author_id: 101, body: 'I reconnected the integration and it\'s working now! Notifications are coming through to #support. However, we lost the notification history from the past week. Is there a way to resend those?', html_body: '<p>I reconnected the integration and it\'s working now! Notifications are coming through to #support. However, we lost the notification history from the past week. Is there a way to resend those?</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(1) },
    ],
    1008: [
      { id: 5070, ticket_id: 1008, author_id: 108, body: 'I upgraded from Basic to Pro plan 3 days ago but my account still shows Basic features. Payment of $299 was processed successfully. Order confirmation #ORD-2024-8834.', html_body: '<p>I upgraded from Basic to Pro plan 3 days ago but my account still shows Basic features. Payment of $299 was processed successfully. Order confirmation #ORD-2024-8834.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(4) },
      { id: 5071, ticket_id: 1008, author_id: 4, body: 'Confirmed payment received. The provisioning system shows the upgrade is stuck in "Processing" state. Escalating to engineering to force-complete the provisioning.', html_body: '<p>Confirmed payment received. The provisioning system shows the upgrade is stuck in "Processing" state. Escalating to engineering to force-complete the provisioning.</p>', public: false, type: 'Comment', attachments: [], created_at: daysAgo(3.8) },
      { id: 5072, ticket_id: 1008, author_id: 4, body: 'Hi Tom, I can confirm we received your payment. There was a delay in our provisioning system. I\'ve escalated this to our engineering team to resolve. You should see Pro features within 24 hours. I\'ll follow up to confirm.', html_body: '<p>Hi Tom, I can confirm we received your payment. There was a delay in our provisioning system. I\'ve escalated this to our engineering team to resolve. You should see Pro features within 24 hours. I\'ll follow up to confirm.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(3.5) },
    ],
    1009: [
      { id: 5080, ticket_id: 1009, author_id: 107, body: 'The mobile app has become extremely slow on Android devices. Loading times are 10+ seconds and the app frequently freezes. We are using Samsung Galaxy S23 and Pixel 7.', html_body: '<p>The mobile app has become extremely slow on Android devices. Loading times are 10+ seconds and the app frequently freezes. We are using Samsung Galaxy S23 and Pixel 7.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(6) },
      { id: 5081, ticket_id: 1009, author_id: 3, body: 'Performance profiling shows memory leak in the notification service on Android 13+. Related to issue #3892.', html_body: '<p>Performance profiling shows memory leak in the notification service on Android 13+. Related to issue #3892.</p>', public: false, type: 'Comment', attachments: [], created_at: daysAgo(5.8) },
      { id: 5082, ticket_id: 1009, author_id: 3, body: 'Hi Lisa, thank you for reporting this. We\'ve identified a performance issue specific to Android devices running Android 13 or later. A fix is being developed. In the meantime, force-closing and restarting the app when it freezes should help. You can also try clearing the app cache.', html_body: '<p>Hi Lisa, thank you for reporting this. We\'ve identified a performance issue specific to Android devices running Android 13 or later. A fix is being developed. In the meantime, force-closing and restarting the app when it freezes should help. You can also try clearing the app cache.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(5.5) },
      { id: 5083, ticket_id: 1009, author_id: 107, body: 'Clearing the cache helped somewhat but the app still lags when switching between tabs. Looking forward to the fix.', html_body: '<p>Clearing the cache helped somewhat but the app still lags when switching between tabs. Looking forward to the fix.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(2) },
    ],
    1010: [
      { id: 5090, ticket_id: 1010, author_id: 109, body: 'Our previous admin, John Smith (john.s@edutech.org), has left the company. We need to transfer admin rights to me. How do we proceed?', html_body: '<p>Our previous admin, John Smith (john.s@edutech.org), has left the company. We need to transfer admin rights to me. How do we proceed?</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(2) },
    ],
    1011: [
      { id: 5100, ticket_id: 1011, author_id: 110, body: 'I\'m trying to enable 2FA on my account but the verification codes are not being accepted. I\'ve tried both SMS and authenticator app methods. The codes generate fine but keep saying "Invalid code" when I enter them.', html_body: '<p>I\'m trying to enable 2FA on my account but the verification codes are not being accepted. I\'ve tried both SMS and authenticator app methods. The codes generate fine but keep saying "Invalid code" when I enter them.</p>', public: true, type: 'Comment', attachments: [], created_at: hoursAgo(6) },
      { id: 5101, ticket_id: 1011, author_id: 1, body: 'Urgent — this is a security-sensitive issue. Checking if there\'s a time sync issue between the user\'s device and our auth server. Common cause of TOTP code failures.', html_body: '<p>Urgent — this is a security-sensitive issue. Checking if there\'s a time sync issue between the user\'s device and our auth server. Common cause of TOTP code failures.</p>', public: false, type: 'Comment', attachments: [], created_at: hoursAgo(5) },
      { id: 5102, ticket_id: 1011, author_id: 1, body: 'Hi Mike, this is a high-priority issue for us. The most common cause is a time synchronization issue between your device and our servers. Please check that your phone\'s date and time are set to "automatic". If you\'re using an authenticator app, try removing the account and scanning the QR code again. Let me know if this helps.', html_body: '<p>Hi Mike, this is a high-priority issue for us. The most common cause is a time synchronization issue between your device and our servers. Please check that your phone\'s date and time are set to "automatic". If you\'re using an authenticator app, try removing the account and scanning the QR code again. Let me know if this helps.</p>', public: true, type: 'Comment', attachments: [], created_at: hoursAgo(4) },
    ],
    1012: [
      { id: 5110, ticket_id: 1012, author_id: 102, body: 'We need to import approximately 50,000 customer records from our legacy CRM system. What format do you support and are there any limitations?', html_body: '<p>We need to import approximately 50,000 customer records from our legacy CRM system. What format do you support and are there any limitations?</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(10) },
      { id: 5111, ticket_id: 1012, author_id: 5, body: 'Large import request. Need to check if the batch import API can handle 50k records. Current limit is 10k per batch. May need to split into multiple batches.', html_body: '<p>Large import request. Need to check if the batch import API can handle 50k records. Current limit is 10k per batch. May need to split into multiple batches.</p>', public: false, type: 'Comment', attachments: [], created_at: daysAgo(9.5) },
      { id: 5112, ticket_id: 1012, author_id: 5, body: 'Hi Jordan, we support CSV and JSON formats for data import. For 50,000 records, you\'ll need to split the import into batches of 10,000 records each. I can provide you with our import template and API documentation. I\'ve put this on hold while we prepare the import plan.', html_body: '<p>Hi Jordan, we support CSV and JSON formats for data import. For 50,000 records, you\'ll need to split the import into batches of 10,000 records each. I can provide you with our import template and API documentation. I\'ve put this on hold while we prepare the import plan.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(9) },
      { id: 5113, ticket_id: 1012, author_id: 102, body: 'That makes sense. Please share the import template when ready. We can handle splitting the data on our end.', html_body: '<p>That makes sense. Please share the import template when ready. We can handle splitting the data on our end.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(5) },
    ],
    1013: [
      { id: 5120, ticket_id: 1013, author_id: 103, body: 'When I try to access the custom report builder, the page shows a loading spinner indefinitely. This has been happening since yesterday morning.', html_body: '<p>When I try to access the custom report builder, the page shows a loading spinner indefinitely. This has been happening since yesterday morning.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(8) },
      { id: 5121, ticket_id: 1013, author_id: 3, body: 'Hi Maria, we identified a configuration issue affecting the report builder for some accounts. This has been fixed. Could you try clearing your browser cache and accessing the report builder again?', html_body: '<p>Hi Maria, we identified a configuration issue affecting the report builder for some accounts. This has been fixed. Could you try clearing your browser cache and accessing the report builder again?</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(7.8) },
      { id: 5122, ticket_id: 1013, author_id: 103, body: 'Yes, it\'s working now after clearing the cache. Thank you for the quick fix!', html_body: '<p>Yes, it\'s working now after clearing the cache. Thank you for the quick fix!</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(6) },
    ],
    1014: [
      { id: 5130, ticket_id: 1014, author_id: 104, body: 'We have 10 new team members joining next month and would like to schedule a training session on the platform. Do you offer onboarding training?', html_body: '<p>We have 10 new team members joining next month and would like to schedule a training session on the platform. Do you offer onboarding training?</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(7) },
      { id: 5131, ticket_id: 1014, author_id: 2, body: 'Hi Sam, yes we do offer onboarding training! We have two options: a self-paced online course, or a live virtual training session with one of our Customer Success Managers. Given your team size, I\'d recommend the live session. I\'m checking available slots and will get back to you.', html_body: '<p>Hi Sam, yes we do offer onboarding training! We have two options: a self-paced online course, or a live virtual training session with one of our Customer Success Managers. Given your team size, I\'d recommend the live session. I\'m checking available slots and will get back to you.</p>', public: true, type: 'Comment', attachments: [], created_at: daysAgo(6.5) },
    ],
    1015: [
      { id: 5140, ticket_id: 1015, author_id: 105, body: 'After changing our company domain from old-techstart.io to techstart.io, SSO authentication is broken for all users. Getting SAML assertion errors. This is affecting our entire team of 50 people.', html_body: '<p>After changing our company domain from old-techstart.io to techstart.io, SSO authentication is broken for all users. Getting SAML assertion errors. This is affecting our entire team of 50 people.</p>', public: true, type: 'Comment', attachments: [], created_at: hoursAgo(3) },
    ],
  };

  const views = [
    { id: 1, title: 'Your unsolved tickets', description: 'Tickets assigned to you that are not yet solved', active: true, position: 0, type: 'standard', conditions: { all: [{ field: 'assignee_id', operator: 'is', value: 'current_user' }, { field: 'status', operator: 'less_than', value: 'solved' }], any: [] } },
    { id: 2, title: 'Unassigned tickets', description: 'Tickets with no assignee', active: true, position: 1, type: 'standard', conditions: { all: [{ field: 'assignee_id', operator: 'is', value: null }, { field: 'status', operator: 'less_than', value: 'solved' }], any: [] } },
    { id: 3, title: 'All unsolved tickets', description: 'All tickets that are not solved or closed', active: true, position: 2, type: 'standard', conditions: { all: [{ field: 'status', operator: 'less_than', value: 'solved' }], any: [] } },
    { id: 4, title: 'Recently updated tickets', description: 'Tickets updated in the last 7 days', active: true, position: 3, type: 'standard', conditions: { all: [{ field: 'updated_at', operator: 'within', value: '7_days' }], any: [] } },
    { id: 5, title: 'Recently solved tickets', description: 'Tickets solved in the last 7 days', active: true, position: 4, type: 'standard', conditions: { all: [{ field: 'status', operator: 'is', value: 'solved' }], any: [] } },
    { id: 6, title: 'Pending tickets', description: 'All pending tickets', active: true, position: 5, type: 'standard', conditions: { all: [{ field: 'status', operator: 'is', value: 'pending' }], any: [] } },
    { id: 7, title: 'New tickets', description: 'All new tickets', active: true, position: 6, type: 'shared', conditions: { all: [{ field: 'status', operator: 'is', value: 'new' }], any: [] } },
    { id: 8, title: 'Urgent & High priority', description: 'Urgent and high priority unsolved tickets', active: true, position: 7, type: 'personal', conditions: { all: [{ field: 'status', operator: 'less_than', value: 'solved' }], any: [{ field: 'priority', operator: 'is', value: 'urgent' }, { field: 'priority', operator: 'is', value: 'high' }] } },
  ];

  const macros = [
    { id: 1, title: 'Close and redirect to FAQ', description: 'Closes ticket and sends FAQ link', active: true, position: 0, actions: [{ field: 'status', value: 'solved' }, { field: 'comment_mode', value: 'public' }, { field: 'comment_value', value: 'Thank you for reaching out! This question is covered in our FAQ: https://help.company.com/faq. If you need further assistance, please don\'t hesitate to reply.' }], restriction: null },
    { id: 2, title: 'Escalate to Tier 2', description: 'Escalates ticket to Tier 2 Support', active: true, position: 1, actions: [{ field: 'group_id', value: 2 }, { field: 'priority', value: 'high' }, { field: 'comment_mode', value: 'internal' }, { field: 'comment_value', value: 'Escalated to Tier 2 Support for further investigation.' }], restriction: null },
    { id: 3, title: 'Request more information', description: 'Sets ticket to pending and asks for more details', active: true, position: 2, actions: [{ field: 'status', value: 'pending' }, { field: 'comment_mode', value: 'public' }, { field: 'comment_value', value: 'Thank you for contacting us. Could you please provide more details about your issue? Specifically:\n\n1. What steps led to this problem?\n2. What browser/device are you using?\n3. When did the issue first occur?\n\nThis will help us investigate more effectively.' }], restriction: null },
    { id: 4, title: 'Assign to me', description: 'Assigns ticket to current agent', active: true, position: 3, actions: [{ field: 'assignee_id', value: 'current_user' }, { field: 'status', value: 'open' }], restriction: null },
    { id: 5, title: 'Downgrade priority — resolved', description: 'Lowers priority and solves', active: true, position: 4, actions: [{ field: 'priority', value: 'low' }, { field: 'status', value: 'solved' }, { field: 'comment_mode', value: 'public' }, { field: 'comment_value', value: 'Glad we could resolve this for you! If you have any other questions, feel free to reach out.' }], restriction: null },
    { id: 6, title: 'Transfer to Billing', description: 'Transfers ticket to billing team', active: true, position: 5, actions: [{ field: 'group_id', value: 3 }, { field: 'comment_mode', value: 'internal' }, { field: 'comment_value', value: 'Transferred to billing team for handling.' }], restriction: null },
  ];

  const tags = [
    'login', 'password', 'billing', 'invoice', 'api', 'integration',
    'bug', 'feature-request', 'urgent-fix', 'mobile', 'performance',
    'sso', '2fa', 'export', 'import', 'slack', 'android', 'ios',
    'enterprise', 'training', 'documentation', 'csv', 'dark-mode',
    'crash', 'upload', 'notification', 'subscription', 'upgrade',
    'key-account', 'startup', 'retail', 'smb', 'nonprofit'
  ];

  return {
    currentUser: { ...agents[0] },
    users,
    organizations,
    groups,
    tickets,
    comments,
    views,
    macros,
    tags,
    ui: {
      activeView: 1,
      openTicketTabs: [],
      activeTicketId: null,
      searchQuery: '',
      selectedTicketIds: [],
      replyMode: 'public',
      sidebarCollapsed: false,
    }
  };
}
