import { AppState, User, Project, Issue, Sprint, Comment, Workflow, Notification } from '../types';

// --- Session isolation helpers ---
const BASE_STORAGE_KEY = 'jira_clone_state';
const BASE_INITIAL_KEY = 'jira_clone_initialState';

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

export const fetchCustomState = async (sid: string | null = null): Promise<Partial<AppState> | null> => {
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
    body: JSON.stringify({ action: 'set_current', state, merge: false }),
  }).catch(() => {});
};

export const getInitialState = (sid: string | null = null): AppState | null => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Normalization for POST custom state ---
function normalizeIssue(issue: any, validUserIds: Set<string>, validSprintIds: Set<string>): Issue {
  return {
    id: issue.id || `i_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    key: issue.key || 'KAN-0',
    projectId: issue.projectId || 'p1',
    summary: issue.summary || 'Untitled Issue',
    description: issue.description || '',
    type: ['Story', 'Task', 'Bug', 'Epic', 'Access Request'].includes(issue.type) ? issue.type : 'Story',
    status: ['To Do', 'In Progress', 'In Review', 'Done'].includes(issue.status) ? issue.status : 'To Do',
    priority: ['Highest', 'High', 'Medium', 'Low', 'Lowest'].includes(issue.priority) ? issue.priority : 'Medium',
    storyPoints: typeof issue.storyPoints === 'number' ? issue.storyPoints : 0,
    reporterId: issue.reporterId && validUserIds.has(issue.reporterId) ? issue.reporterId : 'u1',
    assigneeId: issue.assigneeId && validUserIds.has(issue.assigneeId) ? issue.assigneeId : null,
    sprintId: issue.sprintId && validSprintIds.has(issue.sprintId) ? issue.sprintId : null,
    epicId: issue.epicId || null,
    createdAt: issue.createdAt || new Date().toISOString(),
    updatedAt: issue.updatedAt || new Date().toISOString(),
    labels: Array.isArray(issue.labels) ? issue.labels : [],
    subtasks: Array.isArray(issue.subtasks) ? issue.subtasks.map((st: any) => ({
      id: st.id || `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: st.title || 'Subtask',
      completed: typeof st.completed === 'boolean' ? st.completed : false,
    })) : [],
    linkedIssueIds: Array.isArray(issue.linkedIssueIds) ? issue.linkedIssueIds : [],
  };
}

function normalizeNotification(notif: any, validUserIds: Set<string>): Notification {
  return {
    id: notif.id || `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: ['comment', 'status_change', 'assignment', 'mention'].includes(notif.type) ? notif.type : 'comment',
    issueId: notif.issueId || '',
    actorId: notif.actorId && validUserIds.has(notif.actorId) ? notif.actorId : 'u1',
    message: notif.message || '',
    read: typeof notif.read === 'boolean' ? notif.read : false,
    createdAt: notif.createdAt || new Date().toISOString(),
  };
}

function deepMergeWithDefaults(defaults: AppState, custom: any): AppState {
  if (!custom) return defaults;
  const result: any = { ...defaults };

  // Collect valid user/sprint IDs for normalization
  const validUserIds = new Set<string>((custom.users || defaults.users).map((u: any) => u.id));
  const validSprintIds = new Set<string>((custom.sprints || defaults.sprints).map((s: any) => s.id));

  for (const k in custom) {
    if (custom[k] === null || custom[k] === undefined) continue;

    if (k === 'issues' && Array.isArray(custom[k])) {
      result[k] = custom[k].map((issue: any) => normalizeIssue(issue, validUserIds, validSprintIds));
    } else if (k === 'notifications' && Array.isArray(custom[k])) {
      result[k] = custom[k].map((n: any) => normalizeNotification(n, validUserIds));
    } else if (Array.isArray(custom[k])) {
      result[k] = custom[k];
    } else if (typeof custom[k] === 'object' && typeof result[k] === 'object' && !Array.isArray(result[k])) {
      result[k] = { ...result[k], ...custom[k] };
    } else {
      result[k] = custom[k];
    }
  }
  return result as AppState;
}

export const initializeData = (sid: string | null = null, customState: Partial<AppState> | null = null): AppState => {
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

// ============================================================
// Deterministic Seed Data
// ============================================================

const USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@example.com', avatar: 'https://picsum.photos/100/100?random=u1' },
  { id: 'u2', name: 'Jane Doe', email: 'jane@example.com', avatar: 'https://picsum.photos/100/100?random=u2' },
  { id: 'u3', name: 'John Smith', email: 'john@example.com', avatar: 'https://picsum.photos/100/100?random=u3' },
  { id: 'u4', name: 'Sarah Connor', email: 'sarah@example.com', avatar: 'https://picsum.photos/100/100?random=u4' },
];

const PROJECTS: Project[] = [
  { id: 'p1', key: 'KAN', name: 'Kanban Project', leadId: 'u1', category: 'Software', icon: 'https://picsum.photos/64/64?random=p1' },
  { id: 'p2', key: 'SCRUM', name: 'Scrum Alpha', leadId: 'u2', category: 'Marketing', icon: 'https://picsum.photos/64/64?random=p2' },
];

// Fixed date anchors (relative to a stable reference)
const NOW = '2026-02-28T12:00:00.000Z';
const nowMs = new Date(NOW).getTime();
const DAY = 86400000;

function daysAgo(n: number): string {
  return new Date(nowMs - n * DAY).toISOString();
}
function daysFromNow(n: number): string {
  return new Date(nowMs + n * DAY).toISOString();
}
function hoursAgo(n: number): string {
  return new Date(nowMs - n * 3600000).toISOString();
}

const SPRINTS: Sprint[] = [
  {
    id: 's1',
    projectId: 'p1',
    name: 'Sprint 1',
    goal: 'Setup core infrastructure',
    startDate: daysAgo(5),
    endDate: daysFromNow(9),
    state: 'active',
  },
  {
    id: 's2',
    projectId: 'p1',
    name: 'Sprint 2',
    goal: 'User authentication flow',
    startDate: daysFromNow(10),
    endDate: daysFromNow(24),
    state: 'future',
  },
  {
    id: 's3',
    projectId: 'p1',
    name: 'Sprint 3 (completed)',
    goal: 'Initial MVP features',
    startDate: daysAgo(19),
    endDate: daysAgo(5),
    state: 'closed',
  },
];

const WORKFLOWS: Workflow[] = [
  {
    id: 'w1',
    name: 'Software Workflow',
    transitions: [
      { from: 'To Do', to: ['In Progress'] },
      { from: 'In Progress', to: ['In Review', 'To Do', 'Done'] },
      { from: 'In Review', to: ['Done', 'In Progress'] },
      { from: 'Done', to: ['In Progress', 'To Do'] },
    ],
  },
];

// --- 25 deterministic issues ---
// Sprint 1 (active, s1): i1-i8  (2 To Do, 3 In Progress, 1 In Review, 2 Done)
// Sprint 2 (future, s2): i9-i12 (all To Do)
// Sprint 3 (closed, s3): i13-i17 (all Done)
// Backlog (null sprint): i18-i25 (all To Do)
// Epics: i24 "Infrastructure & DevOps", i25 "User Experience Overhaul"

const ISSUES: Issue[] = [
  // === Sprint 1 (active) ===
  {
    id: 'i1', key: 'KAN-1', projectId: 'p1',
    summary: 'Set up CI/CD pipeline for staging environment',
    description: 'Configure GitHub Actions to deploy to staging on merge to develop branch.\n\nAcceptance Criteria:\n- Pipeline triggers on push to develop\n- Runs tests before deploy\n- Sends Slack notification on failure',
    type: 'Story', status: 'In Progress', priority: 'High', storyPoints: 5,
    reporterId: 'u1', assigneeId: 'u3', sprintId: 's1', epicId: 'i24',
    labels: ['devops', 'infrastructure'],
    subtasks: [
      { id: 'st1', title: 'Create workflow YAML file', completed: true },
      { id: 'st2', title: 'Add test step', completed: false },
      { id: 'st3', title: 'Configure Slack webhook', completed: false },
    ],
    linkedIssueIds: ['i5'],
    createdAt: daysAgo(15), updatedAt: daysAgo(1),
  },
  {
    id: 'i2', key: 'KAN-2', projectId: 'p1',
    summary: 'Fix login page redirect loop on Safari',
    description: 'Users on Safari are experiencing an infinite redirect loop after login. The issue is related to cookie SameSite attribute handling.\n\nSteps to reproduce:\n1. Open Safari\n2. Navigate to /login\n3. Enter valid credentials\n4. Observe redirect loop',
    type: 'Bug', status: 'In Progress', priority: 'Highest', storyPoints: 3,
    reporterId: 'u4', assigneeId: 'u2', sprintId: 's1', epicId: null,
    labels: ['bug', 'frontend', 'urgent'],
    subtasks: [
      { id: 'st4', title: 'Reproduce on Safari 17', completed: true },
      { id: 'st5', title: 'Fix SameSite cookie attribute', completed: false },
    ],
    linkedIssueIds: ['i3'],
    createdAt: daysAgo(12), updatedAt: daysAgo(0),
  },
  {
    id: 'i3', key: 'KAN-3', projectId: 'p1',
    summary: 'Design user dashboard wireframes',
    description: 'Create wireframes for the main user dashboard. Should include:\n- Overview stats cards\n- Recent activity feed\n- Quick action buttons\n- Notification center',
    type: 'Story', status: 'In Review', priority: 'Medium', storyPoints: 3,
    reporterId: 'u1', assigneeId: 'u2', sprintId: 's1', epicId: 'i25',
    labels: ['design', 'frontend'],
    subtasks: [
      { id: 'st6', title: 'Create low-fidelity wireframe', completed: true },
      { id: 'st7', title: 'Create high-fidelity mockup', completed: true },
      { id: 'st8', title: 'Get stakeholder approval', completed: false },
    ],
    linkedIssueIds: ['i2'],
    createdAt: daysAgo(14), updatedAt: daysAgo(1),
  },
  {
    id: 'i4', key: 'KAN-4', projectId: 'p1',
    summary: 'Implement search autocomplete for product catalog',
    description: 'Add typeahead search functionality to the product catalog page. Use debounced API calls with 300ms delay. Show max 10 suggestions in a dropdown.',
    type: 'Story', status: 'In Progress', priority: 'High', storyPoints: 8,
    reporterId: 'u2', assigneeId: 'u1', sprintId: 's1', epicId: 'i25',
    labels: ['frontend', 'backend'],
    subtasks: [
      { id: 'st9', title: 'Build search API endpoint', completed: true },
      { id: 'st10', title: 'Create autocomplete component', completed: false },
      { id: 'st11', title: 'Add debounce logic', completed: false },
    ],
    linkedIssueIds: [],
    createdAt: daysAgo(10), updatedAt: daysAgo(0),
  },
  {
    id: 'i5', key: 'KAN-5', projectId: 'p1',
    summary: 'Update API documentation for v2 endpoints',
    description: 'The v2 API endpoints are undocumented. Add OpenAPI/Swagger specs for all new endpoints including:\n- /api/v2/users\n- /api/v2/products\n- /api/v2/orders',
    type: 'Task', status: 'To Do', priority: 'Medium', storyPoints: 2,
    reporterId: 'u1', assigneeId: 'u3', sprintId: 's1', epicId: 'i24',
    labels: ['documentation'],
    subtasks: [],
    linkedIssueIds: ['i1'],
    createdAt: daysAgo(8), updatedAt: daysAgo(3),
  },
  {
    id: 'i6', key: 'KAN-6', projectId: 'p1',
    summary: 'Add email notification preferences to settings',
    description: 'Users should be able to configure which email notifications they receive. Add toggles for:\n- New assignment notifications\n- Comment mentions\n- Status change updates\n- Weekly digest',
    type: 'Task', status: 'Done', priority: 'Low', storyPoints: 3,
    reporterId: 'u2', assigneeId: 'u4', sprintId: 's1', epicId: 'i25',
    labels: ['backend', 'settings'],
    subtasks: [
      { id: 'st12', title: 'Create preferences schema', completed: true },
      { id: 'st13', title: 'Build settings UI', completed: true },
      { id: 'st14', title: 'Wire up email service', completed: true },
    ],
    linkedIssueIds: [],
    createdAt: daysAgo(13), updatedAt: daysAgo(2),
  },
  {
    id: 'i7', key: 'KAN-7', projectId: 'p1',
    summary: 'Investigate memory leak in WebSocket connections',
    description: 'Production metrics show increasing memory usage over time. Suspected memory leak in WebSocket connection handler. Needs profiling with Chrome DevTools.',
    type: 'Bug', status: 'To Do', priority: 'Highest', storyPoints: 5,
    reporterId: 'u4', assigneeId: null, sprintId: 's1', epicId: null,
    labels: ['backend', 'performance', 'urgent'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(6), updatedAt: daysAgo(4),
  },
  {
    id: 'i8', key: 'KAN-8', projectId: 'p1',
    summary: 'Optimize database queries for reports page',
    description: 'The reports page takes over 5 seconds to load. Investigate and optimize the SQL queries. Consider adding indexes on frequently queried columns.',
    type: 'Task', status: 'Done', priority: 'Medium', storyPoints: 5,
    reporterId: 'u1', assigneeId: 'u3', sprintId: 's1', epicId: 'i24',
    labels: ['backend', 'performance'],
    subtasks: [
      { id: 'st15', title: 'Profile slow queries', completed: true },
      { id: 'st16', title: 'Add database indexes', completed: true },
    ],
    linkedIssueIds: [],
    createdAt: daysAgo(11), updatedAt: daysAgo(2),
  },

  // === Sprint 2 (future) ===
  {
    id: 'i9', key: 'KAN-9', projectId: 'p1',
    summary: 'Implement OAuth2 login with Google',
    description: 'Add Google OAuth2 as an authentication option. Follow the authorization code flow with PKCE.',
    type: 'Story', status: 'To Do', priority: 'High', storyPoints: 8,
    reporterId: 'u1', assigneeId: 'u2', sprintId: 's2', epicId: null,
    labels: ['backend', 'auth'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(7), updatedAt: daysAgo(7),
  },
  {
    id: 'i10', key: 'KAN-10', projectId: 'p1',
    summary: 'Create password reset flow',
    description: 'Users need to be able to reset their passwords via email verification link. Include rate limiting to prevent abuse.',
    type: 'Story', status: 'To Do', priority: 'High', storyPoints: 5,
    reporterId: 'u1', assigneeId: 'u3', sprintId: 's2', epicId: null,
    labels: ['backend', 'auth'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(7), updatedAt: daysAgo(7),
  },
  {
    id: 'i11', key: 'KAN-11', projectId: 'p1',
    summary: 'Add two-factor authentication support',
    description: 'Implement TOTP-based 2FA using authenticator apps. Include backup codes for account recovery.',
    type: 'Story', status: 'To Do', priority: 'Medium', storyPoints: 8,
    reporterId: 'u2', assigneeId: 'u1', sprintId: 's2', epicId: null,
    labels: ['backend', 'auth', 'security'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(7), updatedAt: daysAgo(7),
  },
  {
    id: 'i12', key: 'KAN-12', projectId: 'p1',
    summary: 'Session management and token refresh',
    description: 'Implement JWT refresh token rotation. Auto-refresh access tokens 5 minutes before expiry.',
    type: 'Task', status: 'To Do', priority: 'Medium', storyPoints: 3,
    reporterId: 'u1', assigneeId: null, sprintId: 's2', epicId: null,
    labels: ['backend', 'auth'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(7), updatedAt: daysAgo(7),
  },

  // === Sprint 3 (closed) ===
  {
    id: 'i13', key: 'KAN-13', projectId: 'p1',
    summary: 'Set up project scaffolding with Vite and React',
    description: 'Initialize the project with Vite, React 18, TypeScript, and Tailwind CSS. Configure ESLint and Prettier.',
    type: 'Task', status: 'Done', priority: 'High', storyPoints: 3,
    reporterId: 'u1', assigneeId: 'u1', sprintId: 's3', epicId: 'i24',
    labels: ['infrastructure'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(25), updatedAt: daysAgo(20),
  },
  {
    id: 'i14', key: 'KAN-14', projectId: 'p1',
    summary: 'Create basic navigation and routing',
    description: 'Set up React Router with sidebar navigation. Include routes for dashboard, board, backlog, and reports.',
    type: 'Story', status: 'Done', priority: 'High', storyPoints: 5,
    reporterId: 'u1', assigneeId: 'u2', sprintId: 's3', epicId: 'i25',
    labels: ['frontend'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(24), updatedAt: daysAgo(18),
  },
  {
    id: 'i15', key: 'KAN-15', projectId: 'p1',
    summary: 'Design and implement component library',
    description: 'Create reusable UI components: Button, Input, Select, Modal, Card, Badge, Avatar. Follow Atlassian Design System.',
    type: 'Story', status: 'Done', priority: 'Medium', storyPoints: 8,
    reporterId: 'u2', assigneeId: 'u3', sprintId: 's3', epicId: 'i25',
    labels: ['frontend', 'design'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(23), updatedAt: daysAgo(16),
  },
  {
    id: 'i16', key: 'KAN-16', projectId: 'p1',
    summary: 'Configure PostgreSQL database and migrations',
    description: 'Set up PostgreSQL with Prisma ORM. Create initial migration for users, projects, and issues tables.',
    type: 'Task', status: 'Done', priority: 'High', storyPoints: 5,
    reporterId: 'u1', assigneeId: 'u3', sprintId: 's3', epicId: 'i24',
    labels: ['backend', 'infrastructure'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(23), updatedAt: daysAgo(17),
  },
  {
    id: 'i17', key: 'KAN-17', projectId: 'p1',
    summary: 'Implement basic CRUD API for issues',
    description: 'Create REST API endpoints for issue CRUD operations: GET /issues, POST /issues, PUT /issues/:id, DELETE /issues/:id.',
    type: 'Story', status: 'Done', priority: 'Medium', storyPoints: 5,
    reporterId: 'u1', assigneeId: 'u1', sprintId: 's3', epicId: 'i24',
    labels: ['backend'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(22), updatedAt: daysAgo(15),
  },

  // === Backlog (no sprint) ===
  {
    id: 'i18', key: 'KAN-18', projectId: 'p1',
    summary: 'Create onboarding flow for new team members',
    description: 'Build a step-by-step onboarding wizard that guides new users through project setup, team invitations, and first issue creation.',
    type: 'Story', status: 'To Do', priority: 'Medium', storyPoints: 5,
    reporterId: 'u1', assigneeId: null, sprintId: null, epicId: 'i25',
    labels: ['frontend', 'ux'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(20), updatedAt: daysAgo(20),
  },
  {
    id: 'i19', key: 'KAN-19', projectId: 'p1',
    summary: 'Add dark mode toggle to user preferences',
    description: 'Implement dark mode theme switching. Store preference in localStorage and user profile settings.',
    type: 'Story', status: 'To Do', priority: 'Low', storyPoints: 3,
    reporterId: 'u2', assigneeId: null, sprintId: null, epicId: 'i25',
    labels: ['frontend', 'ux'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(18), updatedAt: daysAgo(18),
  },
  {
    id: 'i20', key: 'KAN-20', projectId: 'p1',
    summary: 'Implement file upload for issue attachments',
    description: 'Add drag-and-drop file upload to issue modal. Support images, PDFs, and documents up to 10MB. Store in S3.',
    type: 'Story', status: 'To Do', priority: 'Medium', storyPoints: 8,
    reporterId: 'u1', assigneeId: null, sprintId: null, epicId: null,
    labels: ['frontend', 'backend'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(16), updatedAt: daysAgo(16),
  },
  {
    id: 'i21', key: 'KAN-21', projectId: 'p1',
    summary: 'Write end-to-end tests for critical user flows',
    description: 'Create Playwright E2E tests covering: login, issue creation, board drag-drop, sprint management, and search.',
    type: 'Task', status: 'To Do', priority: 'High', storyPoints: 8,
    reporterId: 'u4', assigneeId: null, sprintId: null, epicId: null,
    labels: ['testing', 'qa'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(14), updatedAt: daysAgo(14),
  },
  {
    id: 'i22', key: 'KAN-22', projectId: 'p1',
    summary: 'Add keyboard shortcuts for common actions',
    description: 'Implement keyboard shortcuts: C (create issue), ? (show help), Esc (close modal), J/K (navigate list).',
    type: 'Task', status: 'To Do', priority: 'Low', storyPoints: 3,
    reporterId: 'u2', assigneeId: null, sprintId: null, epicId: 'i25',
    labels: ['frontend', 'accessibility'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(12), updatedAt: daysAgo(12),
  },
  {
    id: 'i23', key: 'KAN-23', projectId: 'p1',
    summary: 'Set up error monitoring with Sentry',
    description: 'Integrate Sentry SDK for frontend and backend error tracking. Configure source maps upload in CI pipeline.',
    type: 'Task', status: 'To Do', priority: 'Medium', storyPoints: 2,
    reporterId: 'u1', assigneeId: null, sprintId: null, epicId: 'i24',
    labels: ['devops', 'infrastructure'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(10), updatedAt: daysAgo(10),
  },
  // Epics
  {
    id: 'i24', key: 'KAN-24', projectId: 'p1',
    summary: 'Infrastructure & DevOps',
    description: 'Epic covering all infrastructure, CI/CD, monitoring, and DevOps-related work items.',
    type: 'Epic', status: 'In Progress', priority: 'High', storyPoints: 0,
    reporterId: 'u1', assigneeId: 'u1', sprintId: null, epicId: null,
    labels: ['epic'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(28), updatedAt: daysAgo(1),
  },
  {
    id: 'i25', key: 'KAN-25', projectId: 'p1',
    summary: 'User Experience Overhaul',
    description: 'Epic covering all UX improvements, dashboard redesign, onboarding, and accessibility enhancements.',
    type: 'Epic', status: 'In Progress', priority: 'High', storyPoints: 0,
    reporterId: 'u1', assigneeId: 'u2', sprintId: null, epicId: null,
    labels: ['epic'],
    subtasks: [],
    linkedIssueIds: [],
    createdAt: daysAgo(28), updatedAt: daysAgo(1),
  },
];

// --- 18 deterministic comments ---
const COMMENTS: Comment[] = [
  { id: 'c1', issueId: 'i1', userId: 'u3', content: "I've started working on the YAML config. Should have a PR ready by EOD.", createdAt: hoursAgo(48) },
  { id: 'c2', issueId: 'i1', userId: 'u1', content: 'Great, make sure to include the Slack webhook step as well.', createdAt: hoursAgo(44) },
  { id: 'c3', issueId: 'i2', userId: 'u4', content: 'I was able to reproduce this on Safari 17.3. The SameSite=Lax attribute is causing the redirect.', createdAt: hoursAgo(36) },
  { id: 'c4', issueId: 'i2', userId: 'u2', content: "Thanks Sarah. I'm switching to SameSite=None with Secure flag. Should fix it.", createdAt: hoursAgo(30) },
  { id: 'c5', issueId: 'i3', userId: 'u2', content: 'Moving this to review. The mockups are in Figma: https://figma.com/file/abc123', createdAt: hoursAgo(26) },
  { id: 'c6', issueId: 'i3', userId: 'u1', content: 'Looks good overall! Can we add a notification center to the top bar?', createdAt: hoursAgo(22) },
  { id: 'c7', issueId: 'i4', userId: 'u1', content: 'The search API endpoint is done. PR #142 is ready for review.', createdAt: hoursAgo(18) },
  { id: 'c8', issueId: 'i4', userId: 'u2', content: 'Can we clarify the requirements for the mobile view? Should autocomplete work on touch devices?', createdAt: hoursAgo(14) },
  { id: 'c9', issueId: 'i4', userId: 'u1', content: "Good question. Let's skip mobile autocomplete for now and track it as a separate issue.", createdAt: hoursAgo(12) },
  { id: 'c10', issueId: 'i6', userId: 'u4', content: 'Deployed to staging for testing. All notification toggles work as expected.', createdAt: hoursAgo(60) },
  { id: 'c11', issueId: 'i6', userId: 'u2', content: 'Looks good to me! Approved.', createdAt: hoursAgo(55) },
  { id: 'c12', issueId: 'i7', userId: 'u4', content: 'Found a blocker: the staging API is returning 500s when we have more than 50 concurrent connections.', createdAt: hoursAgo(40) },
  { id: 'c13', issueId: 'i8', userId: 'u3', content: 'Added indexes on created_at and project_id columns. Query time dropped from 5.2s to 0.3s.', createdAt: hoursAgo(72) },
  { id: 'c14', issueId: 'i8', userId: 'u1', content: 'Excellent improvement! Merging this now.', createdAt: hoursAgo(68) },
  { id: 'c15', issueId: 'i5', userId: 'u3', content: 'Tests are passing locally but failing in CI. Investigating the environment difference.', createdAt: hoursAgo(50) },
  { id: 'c16', issueId: 'i18', userId: 'u1', content: '@jane can you take a look at the CSS alignment for the onboarding wizard?', createdAt: hoursAgo(96) },
  { id: 'c17', issueId: 'i21', userId: 'u4', content: 'I can start on the E2E tests once the sprint board drag-drop is more stable.', createdAt: hoursAgo(120) },
  { id: 'c18', issueId: 'i1', userId: 'u1', content: "Let's also set up a staging environment variable file. I'll create the template.", createdAt: hoursAgo(8) },
];

// --- 8 deterministic notifications for current user (u1) ---
const NOTIFICATIONS: Notification[] = [
  // 3 unread (recent)
  { id: 'n1', type: 'comment', issueId: 'i2', actorId: 'u4', message: 'Sarah Connor commented on KAN-2: "I was able to reproduce this on Safari 17.3..."', read: false, createdAt: hoursAgo(2) },
  { id: 'n2', type: 'assignment', issueId: 'i4', actorId: 'u2', message: 'Jane Doe assigned KAN-4 "Implement search autocomplete" to you', read: false, createdAt: hoursAgo(6) },
  { id: 'n3', type: 'status_change', issueId: 'i3', actorId: 'u2', message: 'Jane Doe moved KAN-3 "Design user dashboard wireframes" to In Review', read: false, createdAt: hoursAgo(10) },
  // 5 read (older)
  { id: 'n4', type: 'comment', issueId: 'i8', actorId: 'u3', message: 'John Smith commented on KAN-8: "Added indexes on created_at and project_id columns..."', read: true, createdAt: hoursAgo(72) },
  { id: 'n5', type: 'assignment', issueId: 'i11', actorId: 'u2', message: 'Jane Doe assigned KAN-11 "Add two-factor authentication" to you', read: true, createdAt: hoursAgo(96) },
  { id: 'n6', type: 'status_change', issueId: 'i6', actorId: 'u4', message: 'Sarah Connor moved KAN-6 "Add email notification preferences" to Done', read: true, createdAt: hoursAgo(120) },
  { id: 'n7', type: 'comment', issueId: 'i1', actorId: 'u3', message: 'John Smith commented on KAN-1: "I\'ve started working on the YAML config..."', read: true, createdAt: hoursAgo(144) },
  { id: 'n8', type: 'assignment', issueId: 'i17', actorId: 'u1', message: 'You were assigned KAN-17 "Implement basic CRUD API for issues"', read: true, createdAt: hoursAgo(200) },
];

export function getDefaultData(): AppState {
  return {
    users: USERS,
    projects: PROJECTS,
    issues: ISSUES,
    sprints: SPRINTS,
    comments: COMMENTS,
    workflows: WORKFLOWS,
    notifications: NOTIFICATIONS,
    currentUser: USERS[0],
  };
}

export const INITIAL_STATE: AppState = getDefaultData();
