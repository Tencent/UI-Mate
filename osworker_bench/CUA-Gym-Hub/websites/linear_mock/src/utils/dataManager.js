const BASE_KEY = 'linear_mock_state';
const BASE_INITIAL_KEY = 'linear_mock_initial';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('linear_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('linear_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${sid}`);
    if (!res.ok) return null;
    const data = await res.json();
    // Standard format: { stored_state, has_custom_state, sid }
    const state = data?.stored_state || null;
    return state && Object.keys(state).length > 0 ? state : null;
  } catch {
    return null;
  }
};

function deepMerge(target, source) {
  if (source === null || source === undefined) return target;
  if (typeof source !== 'object' || Array.isArray(source)) return source;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else if (source[key] !== null && typeof source[key] === 'object') {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else if (source[key] !== null && source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

export function createInitialData() {
  const workspace = { id: 'w1', name: 'Acme Corp', urlKey: 'acme' };

  const users = [
    { id: 'u1', name: 'Alex Morgan', email: 'alex@acmecorp.com', avatarUrl: 'https://i.pravatar.cc/150?u=u1', displayName: 'Alex', role: 'Admin', active: true },
    { id: 'u2', name: 'Jamie Chen', email: 'jamie@acmecorp.com', avatarUrl: 'https://i.pravatar.cc/150?u=u2', displayName: 'Jamie', role: 'Member', active: true },
    { id: 'u3', name: 'Sam Patel', email: 'sam@acmecorp.com', avatarUrl: 'https://i.pravatar.cc/150?u=u3', displayName: 'Sam', role: 'Member', active: true },
    { id: 'u4', name: 'Taylor Kim', email: 'taylor@acmecorp.com', avatarUrl: 'https://i.pravatar.cc/150?u=u4', displayName: 'Taylor', role: 'Member', active: true },
    { id: 'u5', name: 'Jordan Lee', email: 'jordan@acmecorp.com', avatarUrl: 'https://i.pravatar.cc/150?u=u5', displayName: 'Jordan', role: 'Member', active: true },
    { id: 'u6', name: 'Riley Zhang', email: 'riley@acmecorp.com', avatarUrl: 'https://i.pravatar.cc/150?u=u6', displayName: 'Riley', role: 'Guest', active: true },
  ];

  const engStates = [
    { id: 'ws_eng_triage', name: 'Triage', category: 'triage', color: '#8a8f98', position: 0, teamId: 't1' },
    { id: 'ws_eng_backlog', name: 'Backlog', category: 'backlog', color: '#8a8f98', position: 1, teamId: 't1' },
    { id: 'ws_eng_todo', name: 'Todo', category: 'unstarted', color: '#e2e2e3', position: 2, teamId: 't1' },
    { id: 'ws_eng_in_progress', name: 'In Progress', category: 'started', color: '#f2c94c', position: 3, teamId: 't1' },
    { id: 'ws_eng_in_review', name: 'In Review', category: 'started', color: '#5e6ad2', position: 4, teamId: 't1' },
    { id: 'ws_eng_done', name: 'Done', category: 'completed', color: '#27a644', position: 5, teamId: 't1' },
    { id: 'ws_eng_canceled', name: 'Canceled', category: 'canceled', color: '#8a8f98', position: 6, teamId: 't1' },
  ];

  const desStates = [
    { id: 'ws_des_triage', name: 'Triage', category: 'triage', color: '#8a8f98', position: 0, teamId: 't2' },
    { id: 'ws_des_backlog', name: 'Backlog', category: 'backlog', color: '#8a8f98', position: 1, teamId: 't2' },
    { id: 'ws_des_todo', name: 'Todo', category: 'unstarted', color: '#e2e2e3', position: 2, teamId: 't2' },
    { id: 'ws_des_in_progress', name: 'In Progress', category: 'started', color: '#f2c94c', position: 3, teamId: 't2' },
    { id: 'ws_des_in_review', name: 'In Review', category: 'started', color: '#5e6ad2', position: 4, teamId: 't2' },
    { id: 'ws_des_done', name: 'Done', category: 'completed', color: '#27a644', position: 5, teamId: 't2' },
    { id: 'ws_des_canceled', name: 'Canceled', category: 'canceled', color: '#8a8f98', position: 6, teamId: 't2' },
  ];

  const teams = [
    {
      id: 't1',
      name: 'Engineering',
      key: 'ENG',
      icon: '⚙️',
      color: '#5e6ad2',
      memberIds: ['u1', 'u2', 'u3', 'u4'],
      workflowStates: engStates,
      triageEnabled: true,
      cycleEnabled: true,
      cycleDuration: 2,
      activeCycleId: 'c1',
    },
    {
      id: 't2',
      name: 'Design',
      key: 'DES',
      icon: '🎨',
      color: '#e5484d',
      memberIds: ['u1', 'u4', 'u5'],
      workflowStates: desStates,
      triageEnabled: false,
      cycleEnabled: true,
      cycleDuration: 1,
      activeCycleId: 'c4',
    },
  ];

  const labels = [
    { id: 'l1', name: 'Bug', color: '#eb5757', teamId: null },
    { id: 'l2', name: 'Feature', color: '#5e6ad2', teamId: null },
    { id: 'l3', name: 'Improvement', color: '#27a644', teamId: null },
    { id: 'l4', name: 'Design', color: '#f2994a', teamId: null },
    { id: 'l5', name: 'Documentation', color: '#8a8f98', teamId: null },
    { id: 'l6', name: 'Performance', color: '#bb6bd9', teamId: null },
    { id: 'l7', name: 'Security', color: '#e5484d', teamId: null },
    { id: 'l8', name: 'Infrastructure', color: '#56b4be', teamId: null },
  ];

  const cycles = [
    { id: 'c1', number: 5, name: 'Cycle 5', teamId: 't1', startsAt: '2026-03-31', endsAt: '2026-04-13', isActive: true, isCompleted: false, progress: 20 },
    { id: 'c2', number: 4, name: 'Cycle 4', teamId: 't1', startsAt: '2026-03-17', endsAt: '2026-03-30', isActive: false, isCompleted: true, progress: 100 },
    { id: 'c3', number: 6, name: 'Cycle 6', teamId: 't1', startsAt: '2026-04-14', endsAt: '2026-04-27', isActive: false, isCompleted: false, progress: 0 },
    { id: 'c4', number: 3, name: 'Cycle 3', teamId: 't2', startsAt: '2026-04-07', endsAt: '2026-04-13', isActive: true, isCompleted: false, progress: 20 },
  ];

  const projects = [
    {
      id: 'p1', name: 'Website Redesign', description: 'Complete overhaul of the marketing website with new brand identity and improved performance.',
      icon: '🌐', color: '#5e6ad2', status: 'started', health: 'onTrack', leadId: 'u1',
      memberIds: ['u1', 'u2', 'u4', 'u5'], teamIds: ['t1', 't2'],
      targetDate: '2026-05-31', startDate: '2026-03-01', progress: 65,
      createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-04-09T14:00:00Z',
    },
    {
      id: 'p2', name: 'API v2 Migration', description: 'Migrate all public API endpoints to v2 with improved authentication and error handling.',
      icon: '🔌', color: '#f2994a', status: 'started', health: 'atRisk', leadId: 'u2',
      memberIds: ['u1', 'u2', 'u3'], teamIds: ['t1'],
      targetDate: '2026-04-30', startDate: '2026-02-15', progress: 30,
      createdAt: '2026-02-15T09:00:00Z', updatedAt: '2026-04-08T11:00:00Z',
    },
    {
      id: 'p3', name: 'Mobile App Launch', description: 'Design and development of the companion mobile app for iOS and Android.',
      icon: '📱', color: '#27a644', status: 'planned', health: null, leadId: 'u4',
      memberIds: ['u4', 'u5'], teamIds: ['t2'],
      targetDate: '2026-07-31', startDate: '2026-05-01', progress: 0,
      createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-01T09:00:00Z',
    },
  ];

  const issues = [
    // ENG Active Cycle (c1) - 10 issues
    { id: 'i1', identifier: 'ENG-1', number: 1, title: 'Set up CI/CD pipeline for staging environment', description: 'Configure GitHub Actions to deploy to staging on merge to develop branch.\n\n**Acceptance Criteria:**\n- Pipeline triggers on push to develop\n- Runs tests before deploy\n- Sends Slack notification on failure', stateId: 'ws_eng_in_progress', priority: 2, estimate: 5, assigneeId: 'u3', creatorId: 'u1', teamId: 't1', projectId: 'p2', cycleId: 'c1', labelIds: ['l8'], parentId: null, dueDate: '2026-04-18', subscriberIds: ['u1', 'u3'], relationIds: [], createdAt: '2026-03-28T10:00:00Z', updatedAt: '2026-04-09T14:30:00Z', completedAt: null, sortOrder: 100 },
    { id: 'i2', identifier: 'ENG-2', number: 2, title: 'Fix authentication token refresh race condition', description: 'There is a race condition when multiple requests try to refresh the auth token simultaneously, causing some requests to fail with 401.\n\n**Steps to reproduce:**\n1. Open multiple tabs\n2. Let token expire\n3. Perform simultaneous actions', stateId: 'ws_eng_in_progress', priority: 1, estimate: 3, assigneeId: 'u1', creatorId: 'u1', teamId: 't1', projectId: 'p2', cycleId: 'c1', labelIds: ['l1', 'l7'], parentId: null, dueDate: '2026-04-12', subscriberIds: ['u1', 'u2'], relationIds: [], createdAt: '2026-03-29T09:00:00Z', updatedAt: '2026-04-10T09:00:00Z', completedAt: null, sortOrder: 110 },
    { id: 'i3', identifier: 'ENG-3', number: 3, title: 'Implement user avatar upload endpoint', description: 'Add a POST /api/users/avatar endpoint that accepts image files and stores them in S3.', stateId: 'ws_eng_todo', priority: 3, estimate: 3, assigneeId: 'u2', creatorId: 'u2', teamId: 't1', projectId: 'p1', cycleId: 'c1', labelIds: ['l2'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u2'], relationIds: [], createdAt: '2026-03-30T11:00:00Z', updatedAt: '2026-04-07T10:00:00Z', completedAt: null, sortOrder: 120 },
    { id: 'i4', identifier: 'ENG-4', number: 4, title: 'Update API error response format to RFC 7807', description: 'Standardize all API error responses to use Problem Details format as defined in RFC 7807.', stateId: 'ws_eng_todo', priority: 3, estimate: 2, assigneeId: 'u4', creatorId: 'u1', teamId: 't1', projectId: 'p2', cycleId: 'c1', labelIds: ['l3'], parentId: null, dueDate: null, subscriberIds: ['u1'], relationIds: [], createdAt: '2026-03-31T08:00:00Z', updatedAt: '2026-04-06T15:00:00Z', completedAt: null, sortOrder: 130 },
    { id: 'i5', identifier: 'ENG-5', number: 5, title: 'Add rate limiting to public API endpoints', description: 'Implement rate limiting using Redis to prevent API abuse. Limits: 100 req/min per IP for unauthenticated, 1000 req/min for authenticated.', stateId: 'ws_eng_todo', priority: 2, estimate: 5, assigneeId: 'u3', creatorId: 'u1', teamId: 't1', projectId: 'p2', cycleId: 'c1', labelIds: ['l7', 'l8'], parentId: null, dueDate: '2026-04-15', subscriberIds: ['u1', 'u3'], relationIds: [], createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-04-08T11:00:00Z', completedAt: null, sortOrder: 140 },
    { id: 'i6', identifier: 'ENG-6', number: 6, title: 'Refactor database connection pooling', description: 'Current connection pool configuration is causing connection exhaustion under load. Need to tune pool size and implement proper connection lifecycle management.', stateId: 'ws_eng_in_review', priority: 2, estimate: 8, assigneeId: 'u1', creatorId: 'u2', teamId: 't1', projectId: 'p2', cycleId: 'c1', labelIds: ['l6', 'l8'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u2', 'u3'], relationIds: [], createdAt: '2026-03-25T14:00:00Z', updatedAt: '2026-04-10T08:00:00Z', completedAt: null, sortOrder: 150 },
    { id: 'i7', identifier: 'ENG-7', number: 7, title: 'Write integration tests for payment flow', description: 'Create comprehensive integration tests covering the complete payment flow from cart to confirmation.', stateId: 'ws_eng_in_progress', priority: 2, estimate: 5, assigneeId: 'u2', creatorId: 'u1', teamId: 't1', projectId: 'p1', cycleId: 'c1', labelIds: ['l5'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u2'], relationIds: [], createdAt: '2026-04-02T10:00:00Z', updatedAt: '2026-04-09T16:00:00Z', completedAt: null, sortOrder: 160 },
    { id: 'i8', identifier: 'ENG-8', number: 8, title: 'Fix mobile viewport breakpoint inconsistencies', description: 'Several UI components render incorrectly on mobile screen sizes. Fixed breakpoints to use consistent values.', stateId: 'ws_eng_done', priority: 3, estimate: 2, assigneeId: 'u4', creatorId: 'u3', teamId: 't1', projectId: 'p1', cycleId: 'c1', labelIds: ['l1'], parentId: null, dueDate: null, subscriberIds: ['u3', 'u4'], relationIds: [], createdAt: '2026-04-03T09:00:00Z', updatedAt: '2026-04-08T17:00:00Z', completedAt: '2026-04-08T17:00:00Z', sortOrder: 170 },
    { id: 'i9', identifier: 'ENG-9', number: 9, title: 'Add dark mode support to settings page', description: 'Settings page is missing dark mode styles. Should use the same color system as the rest of the app.', stateId: 'ws_eng_done', priority: 4, estimate: 3, assigneeId: 'u1', creatorId: 'u4', teamId: 't1', projectId: 'p1', cycleId: 'c1', labelIds: ['l2', 'l4'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u4'], relationIds: [], createdAt: '2026-04-04T11:00:00Z', updatedAt: '2026-04-09T10:00:00Z', completedAt: '2026-04-09T10:00:00Z', sortOrder: 180 },
    { id: 'i10', identifier: 'ENG-10', number: 10, title: 'Optimize image lazy loading performance', description: 'Implement Intersection Observer-based lazy loading for all product images to improve initial page load time.', stateId: 'ws_eng_in_progress', priority: 3, estimate: 3, assigneeId: 'u3', creatorId: 'u2', teamId: 't1', projectId: 'p1', cycleId: 'c1', labelIds: ['l6'], parentId: null, dueDate: null, subscriberIds: ['u2', 'u3'], relationIds: [], createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-04-10T10:00:00Z', completedAt: null, sortOrder: 190 },
    // ENG Backlog - 7 issues
    { id: 'i11', identifier: 'ENG-11', number: 11, title: 'Implement WebSocket reconnection logic', description: 'WebSocket connections drop silently when network is interrupted. Need exponential backoff reconnect logic.', stateId: 'ws_eng_backlog', priority: 2, estimate: 5, assigneeId: null, creatorId: 'u1', teamId: 't1', projectId: 'p2', cycleId: null, labelIds: ['l2', 'l8'], parentId: null, dueDate: null, subscriberIds: ['u1'], relationIds: [], createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-03-20T10:00:00Z', completedAt: null, sortOrder: 200 },
    { id: 'i12', identifier: 'ENG-12', number: 12, title: 'Add CSV export for analytics dashboard', description: 'Users need ability to export analytics data as CSV for external reporting.', stateId: 'ws_eng_backlog', priority: 4, estimate: 3, assigneeId: null, creatorId: 'u3', teamId: 't1', projectId: 'p1', cycleId: null, labelIds: ['l2'], parentId: null, dueDate: null, subscriberIds: ['u3'], relationIds: [], createdAt: '2026-03-22T14:00:00Z', updatedAt: '2026-03-22T14:00:00Z', completedAt: null, sortOrder: 210 },
    { id: 'i13', identifier: 'ENG-13', number: 13, title: 'Migrate user preferences to new schema', description: 'User preference storage needs to be migrated from legacy JSON blob to properly normalized schema.', stateId: 'ws_eng_backlog', priority: 3, estimate: 5, assigneeId: 'u2', creatorId: 'u1', teamId: 't1', projectId: 'p2', cycleId: null, labelIds: ['l3'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u2'], relationIds: [], createdAt: '2026-03-23T09:00:00Z', updatedAt: '2026-03-23T09:00:00Z', completedAt: null, sortOrder: 220 },
    { id: 'i14', identifier: 'ENG-14', number: 14, title: 'Create API documentation with OpenAPI spec', description: 'Write comprehensive OpenAPI 3.0 spec for all public API endpoints, including request/response schemas and examples.', stateId: 'ws_eng_backlog', priority: 3, estimate: 8, assigneeId: null, creatorId: 'u2', teamId: 't1', projectId: 'p2', cycleId: null, labelIds: ['l5'], parentId: null, dueDate: null, subscriberIds: ['u2'], relationIds: [], createdAt: '2026-03-24T11:00:00Z', updatedAt: '2026-03-24T11:00:00Z', completedAt: null, sortOrder: 230 },
    { id: 'i15', identifier: 'ENG-15', number: 15, title: 'Fix memory leak in real-time notification service', description: 'Notification service has a memory leak causing server restarts every ~48 hours. Profiling shows event listeners are not being cleaned up.', stateId: 'ws_eng_backlog', priority: 1, estimate: 5, assigneeId: 'u3', creatorId: 'u4', teamId: 't1', projectId: null, cycleId: null, labelIds: ['l1', 'l6'], parentId: null, dueDate: null, subscriberIds: ['u3', 'u4'], relationIds: [], createdAt: '2026-03-26T15:00:00Z', updatedAt: '2026-03-26T15:00:00Z', completedAt: null, sortOrder: 240 },
    { id: 'i16', identifier: 'ENG-16', number: 16, title: 'Add end-to-end encryption for file uploads', description: 'Implement client-side encryption before upload and decryption on download for sensitive file attachments.', stateId: 'ws_eng_backlog', priority: 2, estimate: 13, assigneeId: null, creatorId: 'u1', teamId: 't1', projectId: null, cycleId: null, labelIds: ['l7'], parentId: null, dueDate: null, subscriberIds: ['u1'], relationIds: [], createdAt: '2026-03-27T09:00:00Z', updatedAt: '2026-03-27T09:00:00Z', completedAt: null, sortOrder: 250 },
    { id: 'i17', identifier: 'ENG-17', number: 17, title: 'Set up error monitoring with Sentry integration', description: 'Integrate Sentry for error tracking and performance monitoring in both frontend and backend services.', stateId: 'ws_eng_backlog', priority: 3, estimate: 3, assigneeId: null, creatorId: 'u3', teamId: 't1', projectId: 'p2', cycleId: null, labelIds: ['l8'], parentId: null, dueDate: null, subscriberIds: ['u3'], relationIds: [], createdAt: '2026-03-28T10:00:00Z', updatedAt: '2026-03-28T10:00:00Z', completedAt: null, sortOrder: 260 },
    // ENG Completed Cycle (c2) - 5 issues
    { id: 'i18', identifier: 'ENG-18', number: 18, title: 'Design new landing page layout', description: 'Create the new homepage design with improved hero section, feature highlights, and social proof.', stateId: 'ws_eng_done', priority: 2, estimate: 5, assigneeId: 'u4', creatorId: 'u1', teamId: 't1', projectId: 'p1', cycleId: 'c2', labelIds: ['l2', 'l4'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u4'], relationIds: [], createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-03-28T16:00:00Z', completedAt: '2026-03-28T16:00:00Z', sortOrder: 270 },
    { id: 'i19', identifier: 'ENG-19', number: 19, title: 'Implement search indexing service', description: 'Set up Elasticsearch to index all issue content for full-text search capabilities.', stateId: 'ws_eng_done', priority: 1, estimate: 8, assigneeId: 'u1', creatorId: 'u2', teamId: 't1', projectId: 'p2', cycleId: 'c2', labelIds: ['l2', 'l8'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u2'], relationIds: [], createdAt: '2026-03-12T10:00:00Z', updatedAt: '2026-03-29T14:00:00Z', completedAt: '2026-03-29T14:00:00Z', sortOrder: 280 },
    { id: 'i20', identifier: 'ENG-20', number: 20, title: 'Fix pagination cursor bug in API', description: 'Cursor-based pagination returns incorrect results when sorting by non-unique fields.', stateId: 'ws_eng_done', priority: 2, estimate: 3, assigneeId: 'u2', creatorId: 'u3', teamId: 't1', projectId: 'p2', cycleId: 'c2', labelIds: ['l1'], parentId: null, dueDate: null, subscriberIds: ['u2', 'u3'], relationIds: [], createdAt: '2026-03-14T11:00:00Z', updatedAt: '2026-03-27T15:00:00Z', completedAt: '2026-03-27T15:00:00Z', sortOrder: 290 },
    { id: 'i21', identifier: 'ENG-21', number: 21, title: 'Add request logging middleware', description: 'Implement structured logging middleware that captures request/response details, timing, and error information.', stateId: 'ws_eng_done', priority: 3, estimate: 2, assigneeId: 'u3', creatorId: 'u1', teamId: 't1', projectId: 'p2', cycleId: 'c2', labelIds: ['l5', 'l8'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u3'], relationIds: [], createdAt: '2026-03-16T09:00:00Z', updatedAt: '2026-03-26T12:00:00Z', completedAt: '2026-03-26T12:00:00Z', sortOrder: 300 },
    { id: 'i22', identifier: 'ENG-22', number: 22, title: 'Remove deprecated v1 API routes', description: 'Clean up legacy v1 API routes that are no longer used. Migration guide has been published.', stateId: 'ws_eng_canceled', priority: 4, estimate: null, assigneeId: 'u1', creatorId: 'u1', teamId: 't1', projectId: 'p2', cycleId: 'c2', labelIds: [], parentId: null, dueDate: null, subscriberIds: ['u1'], relationIds: [], createdAt: '2026-03-18T10:00:00Z', updatedAt: '2026-03-25T09:00:00Z', completedAt: '2026-03-25T09:00:00Z', sortOrder: 310 },
    // DES Active Cycle (c4) - 5 issues
    { id: 'i23', identifier: 'DES-1', number: 1, title: 'Design onboarding flow mockups', description: 'Create high-fidelity mockups for the new user onboarding experience, covering account setup, team invitation, and first issue creation.', stateId: 'ws_des_in_progress', priority: 2, estimate: 5, assigneeId: 'u5', creatorId: 'u4', teamId: 't2', projectId: 'p1', cycleId: 'c4', labelIds: ['l4'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u4', 'u5'], relationIds: [], createdAt: '2026-04-07T09:00:00Z', updatedAt: '2026-04-10T11:00:00Z', completedAt: null, sortOrder: 100 },
    { id: 'i24', identifier: 'DES-2', number: 2, title: 'Create component library documentation', description: 'Document all UI components in Storybook with usage examples, prop descriptions, and accessibility notes.', stateId: 'ws_des_todo', priority: 3, estimate: 3, assigneeId: 'u4', creatorId: 'u5', teamId: 't2', projectId: 'p1', cycleId: 'c4', labelIds: ['l5'], parentId: null, dueDate: null, subscriberIds: ['u4', 'u5'], relationIds: [], createdAt: '2026-04-07T10:00:00Z', updatedAt: '2026-04-07T10:00:00Z', completedAt: null, sortOrder: 110 },
    { id: 'i25', identifier: 'DES-3', number: 3, title: 'Redesign notification center UI', description: 'The current notification center is cluttered and hard to scan. Design a cleaner, more focused inbox experience.', stateId: 'ws_des_in_progress', priority: 2, estimate: 5, assigneeId: 'u5', creatorId: 'u1', teamId: 't2', projectId: 'p1', cycleId: 'c4', labelIds: ['l2', 'l4'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u5'], relationIds: [], createdAt: '2026-04-08T09:00:00Z', updatedAt: '2026-04-10T14:00:00Z', completedAt: null, sortOrder: 120 },
    { id: 'i26', identifier: 'DES-4', number: 4, title: 'Audit accessibility compliance (WCAG 2.1)', description: 'Conduct full accessibility audit of the application against WCAG 2.1 AA standards. Document all failures and create remediation plan.', stateId: 'ws_des_todo', priority: 1, estimate: 8, assigneeId: 'u1', creatorId: 'u4', teamId: 't2', projectId: 'p1', cycleId: 'c4', labelIds: ['l3'], parentId: null, dueDate: '2026-04-13', subscriberIds: ['u1', 'u4'], relationIds: [], createdAt: '2026-04-08T11:00:00Z', updatedAt: '2026-04-08T11:00:00Z', completedAt: null, sortOrder: 130 },
    { id: 'i27', identifier: 'DES-5', number: 5, title: 'Design mobile app icon and splash screen', description: 'Create app icon following Apple and Google guidelines, plus splash screen animations.', stateId: 'ws_des_done', priority: 3, estimate: 2, assigneeId: 'u4', creatorId: 'u5', teamId: 't2', projectId: 'p3', cycleId: 'c4', labelIds: ['l4'], parentId: null, dueDate: null, subscriberIds: ['u4', 'u5'], relationIds: [], createdAt: '2026-04-07T14:00:00Z', updatedAt: '2026-04-09T17:00:00Z', completedAt: '2026-04-09T17:00:00Z', sortOrder: 140 },
    // DES Backlog - 3 issues
    { id: 'i28', identifier: 'DES-6', number: 6, title: 'Create illustration set for empty states', description: 'Design a cohesive set of illustrations for all empty state screens in the application.', stateId: 'ws_des_backlog', priority: 4, estimate: null, assigneeId: null, creatorId: 'u4', teamId: 't2', projectId: 'p1', cycleId: null, labelIds: ['l4'], parentId: null, dueDate: null, subscriberIds: ['u4'], relationIds: [], createdAt: '2026-03-25T10:00:00Z', updatedAt: '2026-03-25T10:00:00Z', completedAt: null, sortOrder: 200 },
    { id: 'i29', identifier: 'DES-7', number: 7, title: 'Design dark mode color palette variants', description: 'Expand the design system to include dark mode variants for all semantic colors.', stateId: 'ws_des_backlog', priority: 3, estimate: null, assigneeId: 'u5', creatorId: 'u1', teamId: 't2', projectId: 'p1', cycleId: null, labelIds: ['l4'], parentId: null, dueDate: null, subscriberIds: ['u1', 'u5'], relationIds: [], createdAt: '2026-03-26T09:00:00Z', updatedAt: '2026-03-26T09:00:00Z', completedAt: null, sortOrder: 210 },
    { id: 'i30', identifier: 'DES-8', number: 8, title: 'Prototype interactive data visualization', description: 'Build an interactive prototype of the new analytics dashboard with filterable charts.', stateId: 'ws_des_backlog', priority: 3, estimate: null, assigneeId: null, creatorId: 'u4', teamId: 't2', projectId: 'p3', cycleId: null, labelIds: ['l2'], parentId: null, dueDate: null, subscriberIds: ['u4'], relationIds: [], createdAt: '2026-03-28T11:00:00Z', updatedAt: '2026-03-28T11:00:00Z', completedAt: null, sortOrder: 220 },
    // Sub-issues
    { id: 'i31', identifier: 'ENG-23', number: 23, title: 'Design avatar upload UI component', description: 'Create the modal dialog and drag-and-drop area for avatar uploads.', stateId: 'ws_eng_todo', priority: 3, estimate: 2, assigneeId: 'u4', creatorId: 'u2', teamId: 't1', projectId: 'p1', cycleId: null, labelIds: ['l4'], parentId: 'i3', dueDate: null, subscriberIds: ['u2', 'u4'], relationIds: [], createdAt: '2026-04-05T10:00:00Z', updatedAt: '2026-04-05T10:00:00Z', completedAt: null, sortOrder: 320 },
    { id: 'i32', identifier: 'ENG-24', number: 24, title: 'Implement S3 upload service', description: 'Build the backend service for handling multipart uploads to S3 with presigned URLs.', stateId: 'ws_eng_in_progress', priority: 3, estimate: 3, assigneeId: 'u2', creatorId: 'u2', teamId: 't1', projectId: 'p1', cycleId: null, labelIds: ['l8'], parentId: 'i3', dueDate: null, subscriberIds: ['u2'], relationIds: [], createdAt: '2026-04-05T10:30:00Z', updatedAt: '2026-04-09T11:00:00Z', completedAt: null, sortOrder: 330 },
  ];

  const comments = [
    { id: 'cm1', body: 'I\'ve started working on this. The GitHub Actions workflow is configured and should be ready for review by EOD.', issueId: 'i1', userId: 'u3', createdAt: '2026-04-08T10:00:00Z', updatedAt: '2026-04-08T10:00:00Z', parentId: null },
    { id: 'cm2', body: 'Looks good! Make sure to add the Slack webhook secret to the environment variables.', issueId: 'i1', userId: 'u1', createdAt: '2026-04-08T11:30:00Z', updatedAt: '2026-04-08T11:30:00Z', parentId: null },
    { id: 'cm3', body: 'Done, added it to the secrets manager. The pipeline is green now.', issueId: 'i1', userId: 'u3', createdAt: '2026-04-08T14:00:00Z', updatedAt: '2026-04-08T14:00:00Z', parentId: 'cm2' },
    { id: 'cm4', body: 'I reproduced the race condition. It happens when the token expires within the same 100ms window as multiple fetch calls. We need to implement a mutex or queue mechanism.', issueId: 'i2', userId: 'u1', createdAt: '2026-04-09T09:30:00Z', updatedAt: '2026-04-09T09:30:00Z', parentId: null },
    { id: 'cm5', body: 'Could we use a refresh promise singleton pattern? That way concurrent refreshes share the same promise.', issueId: 'i2', userId: 'u2', createdAt: '2026-04-09T10:15:00Z', updatedAt: '2026-04-09T10:15:00Z', parentId: null },
    { id: 'cm6', body: 'Yes, that\'s the plan. I\'ll implement that approach.', issueId: 'i2', userId: 'u1', createdAt: '2026-04-09T10:45:00Z', updatedAt: '2026-04-09T10:45:00Z', parentId: 'cm5' },
    { id: 'cm7', body: 'Code review complete. The PR looks solid overall. A few minor comments:\n1. The pool size should be configurable via env var\n2. Add connection timeout handling\n3. The error logging format could be more structured', issueId: 'i6', userId: 'u2', createdAt: '2026-04-09T14:00:00Z', updatedAt: '2026-04-09T14:00:00Z', parentId: null },
    { id: 'cm8', body: 'All feedback addressed. Pool size is now configurable with `DB_POOL_SIZE` env var.', issueId: 'i6', userId: 'u1', createdAt: '2026-04-10T08:30:00Z', updatedAt: '2026-04-10T08:30:00Z', parentId: null },
    { id: 'cm9', body: 'Payment flow tests are at 85% coverage. Remaining 15% is edge cases around declined cards and network timeouts.', issueId: 'i7', userId: 'u2', createdAt: '2026-04-09T16:00:00Z', updatedAt: '2026-04-09T16:00:00Z', parentId: null },
    { id: 'cm10', body: 'Great progress! Make sure to include a test for the 3D Secure redirect flow.', issueId: 'i7', userId: 'u1', createdAt: '2026-04-09T16:45:00Z', updatedAt: '2026-04-09T16:45:00Z', parentId: null },
    { id: 'cm11', body: 'This is blocking the launch of the mobile responsive design. Can we prioritize it?', issueId: 'i5', userId: 'u3', createdAt: '2026-04-08T09:00:00Z', updatedAt: '2026-04-08T09:00:00Z', parentId: null },
    { id: 'cm12', body: 'Agreed, adding to the current cycle. @u3 can you pair with @u4 on this?', issueId: 'i5', userId: 'u1', createdAt: '2026-04-08T09:30:00Z', updatedAt: '2026-04-08T09:30:00Z', parentId: null },
    { id: 'cm13', body: 'The onboarding mockups are taking shape! Initial screens are in Figma. Would love feedback from the eng team on feasibility.', issueId: 'i23', userId: 'u5', createdAt: '2026-04-09T11:00:00Z', updatedAt: '2026-04-09T11:00:00Z', parentId: null },
    { id: 'cm14', body: 'The animation on the welcome screen might be tricky with our current setup. Let\'s discuss in tomorrow\'s sync.', issueId: 'i23', userId: 'u1', createdAt: '2026-04-09T14:30:00Z', updatedAt: '2026-04-09T14:30:00Z', parentId: null },
    { id: 'cm15', body: 'The notification redesign looks great! Much cleaner than the current version. One suggestion: add a "Mark all as read" button at the top.', issueId: 'i25', userId: 'u1', createdAt: '2026-04-10T09:00:00Z', updatedAt: '2026-04-10T09:00:00Z', parentId: null },
    { id: 'cm16', body: 'Good call! Added that to the designs. Also thinking about adding swipe gestures for mobile.', issueId: 'i25', userId: 'u5', createdAt: '2026-04-10T10:30:00Z', updatedAt: '2026-04-10T10:30:00Z', parentId: null },
    { id: 'cm17', body: 'The performance numbers are looking promising. Initial LCP improved by 35% with lazy loading.', issueId: 'i10', userId: 'u3', createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-04-10T10:00:00Z', parentId: null },
  ];

  const notifications = [
    { id: 'n1', type: 'issue_assigned', actorId: 'u2', issueId: 'i2', projectId: null, title: 'Jamie Chen assigned you to ENG-2', body: 'Fix authentication token refresh race condition', isRead: false, isSnoozed: false, isArchived: false, createdAt: '2026-04-10T09:00:00Z' },
    { id: 'n2', type: 'comment', actorId: 'u3', issueId: 'i1', projectId: null, title: 'Sam Patel commented on ENG-1', body: 'Done, added it to the secrets manager. The pipeline is green now.', isRead: false, isSnoozed: false, isArchived: false, createdAt: '2026-04-08T14:00:00Z' },
    { id: 'n3', type: 'issue_mention', actorId: 'u1', issueId: 'i5', projectId: null, title: 'Alex Morgan mentioned you in ENG-5', body: 'can you pair with @u3 on this?', isRead: false, isSnoozed: false, isArchived: false, createdAt: '2026-04-08T09:30:00Z' },
    { id: 'n4', type: 'issue_status_changed', actorId: 'u4', issueId: 'i8', projectId: null, title: 'ENG-8 moved to Done', body: 'Taylor Kim moved Fix mobile viewport breakpoint inconsistencies to Done', isRead: false, isSnoozed: false, isArchived: false, createdAt: '2026-04-08T17:00:00Z' },
    { id: 'n5', type: 'comment', actorId: 'u2', issueId: 'i6', projectId: null, title: 'Jamie Chen commented on ENG-6', body: 'Code review complete. The PR looks solid overall.', isRead: true, isSnoozed: false, isArchived: false, createdAt: '2026-04-09T14:00:00Z' },
    { id: 'n6', type: 'issue_assigned', actorId: 'u4', issueId: 'i26', projectId: null, title: 'Taylor Kim assigned you to DES-4', body: 'Audit accessibility compliance (WCAG 2.1)', isRead: true, isSnoozed: false, isArchived: false, createdAt: '2026-04-08T11:00:00Z' },
    { id: 'n7', type: 'issue_status_changed', actorId: 'u3', issueId: 'i1', projectId: null, title: 'ENG-1 moved to In Progress', body: 'Sam Patel moved Set up CI/CD pipeline to In Progress', isRead: true, isSnoozed: false, isArchived: false, createdAt: '2026-04-08T10:00:00Z' },
    { id: 'n8', type: 'project_update', actorId: 'u2', issueId: null, projectId: 'p2', title: 'API v2 Migration health changed to At Risk', body: 'Jamie Chen updated project health. Timeline may need adjustment due to scope changes.', isRead: true, isSnoozed: false, isArchived: false, createdAt: '2026-04-09T11:00:00Z' },
    { id: 'n9', type: 'issue_mention', actorId: 'u5', issueId: 'i23', projectId: null, title: 'Jordan Lee mentioned you in DES-1', body: 'Would love feedback from the eng team on feasibility.', isRead: true, isSnoozed: false, isArchived: false, createdAt: '2026-04-09T11:00:00Z' },
    { id: 'n10', type: 'issue_assigned', actorId: 'u1', issueId: 'i9', projectId: null, title: 'You were assigned ENG-9', body: 'Add dark mode support to settings page', isRead: true, isSnoozed: false, isArchived: false, createdAt: '2026-04-04T11:00:00Z' },
  ];

  const views = [
    { id: 'v1', name: 'High Priority Bugs', icon: '🐛', filters: { priority: [1, 2], labelIds: ['l1'] }, groupBy: 'status', sortBy: 'priority', layout: 'list', teamId: null, creatorId: 'u1' },
    { id: 'v2', name: 'My In Progress', icon: '🔥', filters: { assigneeId: 'u1', stateCategory: 'started' }, groupBy: null, sortBy: 'updated', layout: 'list', teamId: null, creatorId: 'u1' },
  ];

  const favorites = [
    { id: 'f1', type: 'project', targetId: 'p1', userId: 'u1', sortOrder: 0 },
    { id: 'f2', type: 'view', targetId: 'v1', userId: 'u1', sortOrder: 1 },
    { id: 'f3', type: 'cycle', targetId: 'c1', userId: 'u1', sortOrder: 2 },
  ];

  const issueRelations = [
    { id: 'r1', issueId: 'i2', relatedIssueId: 'i5', type: 'blocks' },
    { id: 'r2', issueId: 'i5', relatedIssueId: 'i2', type: 'blocked_by' },
    { id: 'r3', issueId: 'i6', relatedIssueId: 'i1', type: 'relates_to' },
    { id: 'r4', issueId: 'i25', relatedIssueId: 'i9', type: 'relates_to' },
  ];

  return {
    currentUserId: 'u1',
    workspace,
    users,
    teams,
    issues,
    labels,
    projects,
    cycles,
    comments,
    notifications,
    views,
    favorites,
    issueRelations,
    issueCounters: { t1: 24, t2: 8 },
    // UI state
    sidebarCollapsed: false,
    teamSectionsExpanded: { t1: true, t2: true },
  };
}

export function loadState(sid = null) {
  try {
    const key = storageKey(sid);
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return createInitialData();
}

export function saveState(state, sid = null) {
  try {
    const key = storageKey(sid);
    localStorage.setItem(key, JSON.stringify(state));
    // also sync to server
    const rawSid = sid || 'default';
    fetch(`/post?sid=${rawSid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state }),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export function computeStateDiff(initial, current, path = '') {
  const diff = {};
  if (initial === null || initial === undefined || current === null || current === undefined) {
    if (initial !== current) {
      diff[path || 'root'] = { old: initial, new: current };
    }
    return diff;
  }
  if (typeof initial !== 'object' || typeof current !== 'object') {
    if (initial !== current) {
      diff[path || 'value'] = { old: initial, new: current };
    }
    return diff;
  }
  if (Array.isArray(initial) || Array.isArray(current)) {
    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      diff[path || 'array'] = { old: initial, new: current };
    }
    return diff;
  }
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
  for (const key of allKeys) {
    const subPath = path ? `${path}.${key}` : key;
    Object.assign(diff, computeStateDiff(initial[key], current[key], subPath));
  }
  return diff;
}

export function initializeData(sid = null, customState = null) {
  const initialK = initialKey(sid);
  const storageK = storageKey(sid);

  if (customState) {
    const defaultData = createInitialData();
    const merged = deepMerge(defaultData, customState);
    localStorage.setItem(storageK, JSON.stringify(merged));
    localStorage.setItem(initialK, JSON.stringify(merged));
    return merged;
  }

  const existingInitial = localStorage.getItem(initialK);
  if (existingInitial) {
    const stored = localStorage.getItem(storageK);
    return stored ? JSON.parse(stored) : JSON.parse(existingInitial);
  }

  const data = createInitialData();
  localStorage.setItem(storageK, JSON.stringify(data));
  localStorage.setItem(initialK, JSON.stringify(data));

  // sync to server
  const rawSid = sid || 'default';
  fetch(`/post?sid=${rawSid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set', state: data }),
  }).catch(() => {});

  return data;
}
