export function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  const sidFromUrl = params.get('sid');
  if (sidFromUrl) {
    try { sessionStorage.setItem('gitlab_mock_sid', sidFromUrl); } catch(e) {}
    return sidFromUrl;
  }
  try {
    return sessionStorage.getItem('gitlab_mock_sid') || 'default';
  } catch(e) {
    return 'default';
  }
}

let _saveDebounceTimer = null;

export function saveState(state) {
  const sid = getSessionId();
  try {
    localStorage.setItem(`gitlab_mock_state_${sid}`, JSON.stringify(state));
    if (!localStorage.getItem(`gitlab_mock_initial_${sid}`)) {
      localStorage.setItem(`gitlab_mock_initial_${sid}`, JSON.stringify(state));
    }
    // debounce server sync to avoid excessive requests on rapid state changes
    clearTimeout(_saveDebounceTimer);
    _saveDebounceTimer = setTimeout(() => {
      fetch(`/post?sid=${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      }).catch(() => {});
    }, 300);
  } catch(e) {}
}

export function loadState() {
  const sid = getSessionId();
  try {
    const s = localStorage.getItem(`gitlab_mock_state_${sid}`);
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
}

export function loadInitialState() {
  const sid = getSessionId();
  try {
    const s = localStorage.getItem(`gitlab_mock_initial_${sid}`);
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
}

export function setInitialState(state) {
  const sid = getSessionId();
  try {
    localStorage.setItem(`gitlab_mock_initial_${sid}`, JSON.stringify(state));
    localStorage.setItem(`gitlab_mock_state_${sid}`, JSON.stringify(state));
    fetch(`/post?sid=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state })
    }).catch(() => {});
  } catch(e) {}
}

export function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff/86400)} days ago`;
  if (diff < 31536000) return `${Math.floor(diff/2592000)} months ago`;
  return `${Math.floor(diff/31536000)} years ago`;
}

export function computeDiff(initial, current) {
  const diff = {};
  for (const key of Object.keys(current)) {
    if (JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
      diff[key] = current[key];
    }
  }
  return diff;
}

export function createInitialData() {
  const currentUser = {
    id: 'u1', name: 'Sofia Velasquez', username: 'svelasquez',
    email: 'sofia@acme-corp.io', avatarUrl: 'https://i.pravatar.cc/150?img=47',
    bio: 'Full-stack engineer', role: 'Owner'
  };

  const users = [
    { id: 'u1', name: 'Sofia Velasquez', username: 'svelasquez', email: 'sofia@acme-corp.io', avatarUrl: 'https://i.pravatar.cc/150?img=47', bio: 'Full-stack engineer' },
    { id: 'u2', name: 'Marcus Chen', username: 'mchen', email: 'marcus@acme-corp.io', avatarUrl: 'https://i.pravatar.cc/150?img=12', bio: 'Backend engineer' },
    { id: 'u3', name: 'Priya Patel', username: 'ppatel', email: 'priya@acme-corp.io', avatarUrl: 'https://i.pravatar.cc/150?img=25', bio: 'Frontend developer' },
    { id: 'u4', name: 'James Rodriguez', username: 'jrodriguez', email: 'james@acme-corp.io', avatarUrl: 'https://i.pravatar.cc/150?img=8', bio: 'DevOps engineer' },
    { id: 'u5', name: 'Emma Schmidt', username: 'eschmidt', email: 'emma@acme-corp.io', avatarUrl: 'https://i.pravatar.cc/150?img=44', bio: 'QA engineer' },
    { id: 'u6', name: 'Alex Kim', username: 'akim', email: 'alex@acme-corp.io', avatarUrl: 'https://i.pravatar.cc/150?img=33', bio: 'Product designer' },
  ];

  const groups = [
    { id: 'g1', name: 'Acme Corp', path: 'acme-corp', description: 'Acme Corporation engineering teams', avatarColor: '#6B4FBB' },
    { id: 'g2', name: 'Frontend Team', path: 'frontend-team', description: 'Frontend engineering subgroup', avatarColor: '#FC6D26', parentId: 'g1' }
  ];

  const projects = [
    {
      id: 'p1', name: 'web-platform', fullPath: 'acme-corp/web-platform', groupId: 'g1',
      description: 'Main web platform built with TypeScript and React',
      language: 'TypeScript', languageColor: '#3178C6', visibility: 'private',
      stars: 24, forks: 3, isStarred: false, defaultBranch: 'main',
      topics: ['react', 'typescript', 'vite'], avatarColor: '#6B4FBB',
      features: { issues: true, mergeRequests: true, wiki: true, snippets: true, pipelines: true },
      createdAt: '2025-01-15T10:00:00Z', updatedAt: '2026-04-09T14:30:00Z',
      readme: `# web-platform\n\nMain web application for Acme Corp.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Architecture\n\nBuilt with React, TypeScript, and Vite. Uses Context API for state management.\n\n## Contributing\n\nSee [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.`
    },
    {
      id: 'p2', name: 'mobile-app', fullPath: 'acme-corp/mobile-app', groupId: 'g1',
      description: 'Native mobile application built with Kotlin',
      language: 'Kotlin', languageColor: '#A97BFF', visibility: 'private',
      stars: 12, forks: 1, isStarred: true, defaultBranch: 'main',
      topics: ['kotlin', 'android', 'mobile'], avatarColor: '#E24329',
      features: { issues: true, mergeRequests: true, wiki: false, snippets: true, pipelines: true },
      createdAt: '2025-03-01T10:00:00Z', updatedAt: '2026-04-07T10:00:00Z',
      readme: `# mobile-app\n\nNative Android app for Acme Corp.\n\n## Build\n\n\`\`\`bash\n./gradlew build\n\`\`\``
    },
    {
      id: 'p3', name: 'design-system', fullPath: 'acme-corp/design-system', groupId: 'g1',
      description: 'Shared design system components and tokens',
      language: 'TypeScript', languageColor: '#3178C6', visibility: 'public',
      stars: 48, forks: 8, isStarred: false, defaultBranch: 'main',
      topics: ['design-system', 'storybook', 'css'], avatarColor: '#108548',
      features: { issues: true, mergeRequests: true, wiki: true, snippets: true, pipelines: true },
      createdAt: '2025-02-01T10:00:00Z', updatedAt: '2026-04-05T16:00:00Z',
      readme: `# design-system\n\nShared component library and design tokens.\n\n## Installation\n\n\`\`\`bash\nnpm install @acme-corp/design-system\n\`\`\``
    },
    {
      id: 'p4', name: 'docs-site', fullPath: 'acme-corp/docs-site', groupId: 'g1',
      description: 'Developer documentation site',
      language: 'Markdown', languageColor: '#083fa1', visibility: 'public',
      stars: 6, forks: 2, isStarred: false, defaultBranch: 'main',
      topics: ['docs', 'vitepress', 'markdown'], avatarColor: '#1F75CB',
      features: { issues: true, mergeRequests: true, wiki: false, snippets: false, pipelines: true },
      createdAt: '2025-04-01T10:00:00Z', updatedAt: '2026-04-01T09:00:00Z',
      readme: `# docs-site\n\nDeveloper documentation portal.\n\n## Development\n\n\`\`\`bash\nnpm run dev\n\`\`\``
    }
  ];

  const labels = [
    { id: 'l1', projectId: 'p1', name: 'bug', color: '#DD2B0E', description: 'Something is broken' },
    { id: 'l2', projectId: 'p1', name: 'feature', color: '#6B4FBB', description: 'New functionality' },
    { id: 'l3', projectId: 'p1', name: 'enhancement', color: '#1F75CB', description: 'Improvement to existing feature' },
    { id: 'l4', projectId: 'p1', name: 'documentation', color: '#C17D10', description: 'Docs update needed' },
    { id: 'l5', projectId: 'p1', name: 'critical', color: '#DD2B0E', description: 'Critical priority' },
    { id: 'l6', projectId: 'p1', name: 'design', color: '#FC6D26', description: 'Design work required' },
    { id: 'l7', projectId: 'p1', name: 'backend', color: '#108548', description: 'Backend work' },
    { id: 'l8', projectId: 'p1', name: 'frontend', color: '#6B4FBB', description: 'Frontend work' },
    { id: 'l9', projectId: 'p1', name: 'devops', color: '#74717A', description: 'DevOps/CI tasks' },
    { id: 'l10', projectId: 'p1', name: 'good first issue', color: '#108548', description: 'Good for newcomers' },
    { id: 'l11', projectId: 'p1', name: 'blocked', color: '#DD2B0E', description: 'Blocked by something' },
    { id: 'l12', projectId: 'p1', name: 'needs review', color: '#C17D10', description: 'Needs review' },
  ];

  const milestones = [
    { id: 'm1', projectId: 'p1', title: 'v2.0 Release', description: 'Major feature release', status: 'active', startDate: '2026-03-01', dueDate: '2026-04-30', createdAt: '2026-02-15T09:00:00Z' },
    { id: 'm2', projectId: 'p1', title: 'v2.1 Hotfix', description: 'Critical bug fixes', status: 'active', startDate: '2026-04-01', dueDate: '2026-05-15', createdAt: '2026-03-20T10:00:00Z' },
    { id: 'm3', projectId: 'p1', title: 'v1.5 Release', description: 'Previous milestone', status: 'closed', startDate: '2025-10-01', dueDate: '2025-12-31', createdAt: '2025-09-15T08:00:00Z' },
  ];

  const issues = [
    { id: 'i1', projectId: 'p1', iid: 1, title: 'Fix authentication redirect loop', description: '## Problem\n\nWhen users log in from a deep link, they get caught in a redirect loop.\n\n## Steps to reproduce\n1. Navigate to `/settings`\n2. Log in\n3. Observe redirect to `/settings` fails', state: 'opened', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', assigneeIds: ['u1'], labelIds: ['l1', 'l5'], milestoneId: 'm2', dueDate: '2026-04-20', weight: 3, createdAt: '2026-04-01T10:00:00Z', updatedAt: '2026-04-08T15:30:00Z', commentCount: 3 },
    { id: 'i2', projectId: 'p1', iid: 2, title: 'Dashboard charts not rendering on Safari', description: '## Problem\n\nThe analytics dashboard charts fail to render on Safari 17+.\n\n## Expected behavior\nCharts display correctly on all browsers.\n\n## Actual behavior\nBlank canvas on Safari.', state: 'opened', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', assigneeIds: ['u3'], labelIds: ['l1', 'l8'], milestoneId: 'm2', dueDate: '2026-04-25', weight: 2, createdAt: '2026-04-02T09:00:00Z', updatedAt: '2026-04-09T10:00:00Z', commentCount: 2 },
    { id: 'i3', projectId: 'p1', iid: 3, title: 'Add dark mode support', description: '## Feature Request\n\nAdd dark mode toggle to user preferences.\n\n## Acceptance criteria\n- Toggle in settings\n- Persists across sessions\n- All components support dark theme', state: 'opened', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', assigneeIds: ['u3', 'u6'], labelIds: ['l2', 'l8', 'l6'], milestoneId: 'm1', dueDate: '2026-04-30', weight: 5, createdAt: '2026-03-15T14:00:00Z', updatedAt: '2026-04-07T11:00:00Z', commentCount: 5 },
    { id: 'i4', projectId: 'p1', iid: 4, title: 'Implement notification system', description: '## Feature\n\nReal-time notification system for user actions.\n\n## Scope\n- In-app notifications\n- Email digest\n- Push notifications (future)', state: 'opened', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', assigneeIds: ['u2'], labelIds: ['l2', 'l7'], milestoneId: 'm1', dueDate: null, weight: 8, createdAt: '2026-03-20T10:00:00Z', updatedAt: '2026-04-06T14:00:00Z', commentCount: 4 },
    { id: 'i5', projectId: 'p1', iid: 5, title: 'Update API documentation', description: '## Task\n\nUpdate REST API docs to reflect v2.0 changes.\n\n## Sections to update\n- Authentication endpoints\n- User management\n- Analytics API', state: 'opened', authorId: 'u4', authorName: 'James Rodriguez', authorEmail: 'james@acme-corp.io', assigneeIds: ['u1'], labelIds: ['l4'], milestoneId: 'm1', dueDate: '2026-04-28', weight: 2, createdAt: '2026-03-25T09:00:00Z', updatedAt: '2026-04-05T10:00:00Z', commentCount: 1 },
    { id: 'i6', projectId: 'p1', iid: 6, title: 'Performance improvements for large datasets', description: '## Enhancement\n\nThe data table component becomes sluggish with >1000 rows.\n\n## Solution\nImplement virtual scrolling.', state: 'opened', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', assigneeIds: ['u2'], labelIds: ['l3', 'l8'], milestoneId: 'm1', dueDate: null, weight: 5, createdAt: '2026-03-28T11:00:00Z', updatedAt: '2026-04-04T16:00:00Z', commentCount: 2 },
    { id: 'i7', projectId: 'p1', iid: 7, title: 'Add CSV export to reports', description: '## Feature\n\nAllow users to export report data as CSV.\n\n## Acceptance criteria\n- Export button on all report pages\n- Includes all visible columns\n- Respects current filters', state: 'opened', authorId: 'u6', authorName: 'Alex Kim', authorEmail: 'alex@acme-corp.io', assigneeIds: ['u3'], labelIds: ['l2', 'l10'], milestoneId: 'm1', dueDate: '2026-04-30', weight: 3, createdAt: '2026-04-01T14:00:00Z', updatedAt: '2026-04-03T09:00:00Z', commentCount: 1 },
    { id: 'i8', projectId: 'p1', iid: 8, title: 'Fix mobile responsiveness on settings page', description: '## Bug\n\nSettings page layout breaks on mobile (< 768px).\n\n## Steps\n1. Open settings on mobile\n2. Observe broken layout', state: 'opened', authorId: 'u5', authorName: 'Emma Schmidt', authorEmail: 'emma@acme-corp.io', assigneeIds: ['u3'], labelIds: ['l1', 'l8'], milestoneId: 'm2', dueDate: '2026-04-22', weight: 2, createdAt: '2026-04-03T10:00:00Z', updatedAt: '2026-04-08T09:00:00Z', commentCount: 3 },
    { id: 'i9', projectId: 'p1', iid: 9, title: 'Add keyboard shortcuts for common actions', description: '## Enhancement\n\nAdd keyboard shortcuts for power users.\n\n## Shortcuts to add\n- `n` - new issue\n- `/` - search\n- `g i` - go to issues', state: 'opened', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', assigneeIds: ['u1'], labelIds: ['l3', 'l8', 'l10'], milestoneId: null, dueDate: null, weight: 3, createdAt: '2026-04-04T11:00:00Z', updatedAt: '2026-04-06T10:00:00Z', commentCount: 2 },
    { id: 'i10', projectId: 'p1', iid: 10, title: 'Migrate to React 19', description: '## Task\n\nUpgrade React from 18 to 19 and adopt new features.\n\n## Steps\n- Update dependencies\n- Fix breaking changes\n- Adopt new concurrent features', state: 'opened', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', assigneeIds: ['u2', 'u3'], labelIds: ['l3', 'l9'], milestoneId: 'm1', dueDate: '2026-04-30', weight: 8, createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-04-09T14:00:00Z', commentCount: 6 },
    { id: 'i11', projectId: 'p1', iid: 11, title: 'Fix typo in onboarding email', description: 'Typo in welcome email subject line.', state: 'closed', authorId: 'u5', authorName: 'Emma Schmidt', authorEmail: 'emma@acme-corp.io', assigneeIds: ['u4'], labelIds: ['l1'], milestoneId: null, dueDate: null, weight: 1, createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-02-11T14:00:00Z', commentCount: 1 },
    { id: 'i12', projectId: 'p1', iid: 12, title: 'Add loading spinners to async operations', description: 'Show loading state during API calls.', state: 'closed', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', assigneeIds: ['u3'], labelIds: ['l3', 'l8'], milestoneId: 'm3', dueDate: null, weight: 2, createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-03-01T16:00:00Z', commentCount: 3 },
    { id: 'i13', projectId: 'p1', iid: 13, title: 'Implement SSO login', description: 'Add SAML/OAuth SSO support for enterprise customers.', state: 'closed', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', assigneeIds: ['u2'], labelIds: ['l2', 'l7'], milestoneId: 'm3', dueDate: null, weight: 13, createdAt: '2025-11-01T10:00:00Z', updatedAt: '2025-12-20T15:00:00Z', commentCount: 8 },
    { id: 'i14', projectId: 'p1', iid: 14, title: 'Write unit tests for auth module', description: 'Achieve 90% test coverage on authentication code.', state: 'closed', authorId: 'u5', authorName: 'Emma Schmidt', authorEmail: 'emma@acme-corp.io', assigneeIds: ['u5'], labelIds: ['l4', 'l7'], milestoneId: 'm3', dueDate: null, weight: 5, createdAt: '2025-11-15T09:00:00Z', updatedAt: '2025-12-15T11:00:00Z', commentCount: 2 },
    { id: 'i15', projectId: 'p1', iid: 15, title: 'Set up CI/CD pipeline', description: 'Configure XitLab CI with build, test, and deploy stages.', state: 'closed', authorId: 'u4', authorName: 'James Rodriguez', authorEmail: 'james@acme-corp.io', assigneeIds: ['u4'], labelIds: ['l9'], milestoneId: 'm3', dueDate: null, weight: 5, createdAt: '2025-10-20T14:00:00Z', updatedAt: '2025-11-05T10:00:00Z', commentCount: 4 },
  ];

  const issueComments = [
    { id: 'ic1', issueId: 'i1', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'I can reproduce this on staging. The router catches the auth callback before it completes.', isSystemNote: false, createdAt: '2026-04-02T09:00:00Z' },
    { id: 'ic2', issueId: 'i1', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'assigned to @svelasquez', isSystemNote: true, createdAt: '2026-04-01T10:05:00Z' },
    { id: 'ic3', issueId: 'i1', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'Looking at the auth middleware. The issue is that the `returnTo` parameter is being lost during the OAuth handshake.', isSystemNote: false, createdAt: '2026-04-08T15:30:00Z' },
    { id: 'ic4', issueId: 'i2', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', body: 'Confirmed on Safari 17.3. The canvas API behaves differently. Using a polyfill might fix this.', isSystemNote: false, createdAt: '2026-04-03T10:00:00Z' },
    { id: 'ic5', issueId: 'i2', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'Added `l1` label and milestone `m2`.', isSystemNote: true, createdAt: '2026-04-02T09:15:00Z' },
    { id: 'ic6', issueId: 'i3', authorId: 'u6', authorName: 'Alex Kim', authorEmail: 'alex@acme-corp.io', body: 'Design proposal attached. Using CSS custom properties for theming.', isSystemNote: false, createdAt: '2026-03-16T10:00:00Z' },
    { id: 'ic7', issueId: 'i3', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', body: 'We can use `prefers-color-scheme` for system-level detection.', isSystemNote: false, createdAt: '2026-03-18T14:00:00Z' },
    { id: 'ic8', issueId: 'i3', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'assigned to @ppatel, @akim', isSystemNote: true, createdAt: '2026-03-15T14:05:00Z' },
    { id: 'ic9', issueId: 'i3', authorId: 'u6', authorName: 'Alex Kim', authorEmail: 'alex@acme-corp.io', body: 'Figma designs are ready for review.', isSystemNote: false, createdAt: '2026-04-01T11:00:00Z' },
    { id: 'ic10', issueId: 'i3', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', body: 'Starting implementation this week.', isSystemNote: false, createdAt: '2026-04-07T11:00:00Z' },
    { id: 'ic11', issueId: 'i4', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'Planning to use WebSockets for real-time delivery.', isSystemNote: false, createdAt: '2026-03-22T10:00:00Z' },
    { id: 'ic12', issueId: 'i4', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'Should we use Server-Sent Events instead? Simpler for our use case.', isSystemNote: false, createdAt: '2026-03-23T09:00:00Z' },
    { id: 'ic13', issueId: 'i4', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'Good point. SSE works for unidirectional. Going with that.', isSystemNote: false, createdAt: '2026-03-24T14:00:00Z' },
    { id: 'ic14', issueId: 'i4', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'assigned to @mchen', isSystemNote: true, createdAt: '2026-03-20T10:05:00Z' },
    { id: 'ic15', issueId: 'i5', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'I will start with the auth endpoints section.', isSystemNote: false, createdAt: '2026-03-26T09:00:00Z' },
    { id: 'ic16', issueId: 'i6', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'react-window is a good option for virtual scrolling.', isSystemNote: false, createdAt: '2026-03-30T14:00:00Z' },
    { id: 'ic17', issueId: 'i6', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', body: 'Agreed. Also consider react-virtualized for more complex cases.', isSystemNote: false, createdAt: '2026-04-01T10:00:00Z' },
    { id: 'ic18', issueId: 'i8', authorId: 'u5', authorName: 'Emma Schmidt', authorEmail: 'emma@acme-corp.io', body: 'The sidebar overlay breaks the layout. Needs z-index fix too.', isSystemNote: false, createdAt: '2026-04-04T10:00:00Z' },
    { id: 'ic19', issueId: 'i8', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', body: 'Working on the responsive breakpoints now.', isSystemNote: false, createdAt: '2026-04-06T09:00:00Z' },
    { id: 'ic20', issueId: 'i8', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', body: 'Fixed the sidebar and form layout. PR coming soon.', isSystemNote: false, createdAt: '2026-04-08T09:00:00Z' },
    { id: 'ic21', issueId: 'i9', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'Can use a global keydown listener. Need to be careful with form inputs.', isSystemNote: false, createdAt: '2026-04-05T11:30:00Z' },
    { id: 'ic22', issueId: 'i9', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'Check out the `hotkeys-js` library if we can add dependencies.', isSystemNote: false, createdAt: '2026-04-06T10:00:00Z' },
    { id: 'ic23', issueId: 'i10', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'React 19 has breaking changes in the Context API. Need to audit our usage.', isSystemNote: false, createdAt: '2026-04-06T09:00:00Z' },
    { id: 'ic24', issueId: 'i10', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', body: 'Also the new `use()` hook is very interesting for data fetching.', isSystemNote: false, createdAt: '2026-04-07T14:00:00Z' },
    { id: 'ic25', issueId: 'i10', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'Creating a migration branch. Will document breaking changes.', isSystemNote: false, createdAt: '2026-04-09T14:00:00Z' },
  ];

  const mergeRequests = [
    {
      id: 'mr1', projectId: 'p1', iid: 1,
      title: 'feat: Add dashboard analytics module',
      description: '## Summary\n\nAdds the new analytics dashboard with charts.\n\n## Changes\n- New `AnalyticsDashboard` component\n- REST API integration\n- Unit tests added',
      state: 'opened', isDraft: false, authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', assigneeIds: ['u1'], reviewerIds: ['u2'],
      labelIds: ['l2', 'l8'], milestoneId: 'm1',
      sourceBranch: 'feature/dashboard-analytics', targetBranch: 'main',
      pipelineStatus: 'passed', pipelineId: 'pipe2', canBeMerged: true,
      commits: ['c5', 'c6'],
      changes: [
        { file: 'src/pages/Analytics.jsx', additions: 245, deletions: 0, diff: '+import React from "react";\n+// analytics component\n+export default function Analytics() {\n+  return <div>Analytics</div>;\n+}' },
        { file: 'src/App.jsx', additions: 5, deletions: 2, diff: '-// old route\n+// new route\n+<Route path="/analytics" element={<Analytics />} />' }
      ],
      createdAt: '2026-04-05T11:00:00Z', updatedAt: '2026-04-09T16:00:00Z'
    },
    {
      id: 'mr2', projectId: 'p1', iid: 2,
      title: 'WIP: Refactor authentication flow',
      description: '## Work in progress\n\nRefactoring auth to use the new token service.\n\n## TODO\n- [ ] Update token refresh logic\n- [ ] Add tests\n- [ ] Update docs',
      state: 'opened', isDraft: true, authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', assigneeIds: ['u2'], reviewerIds: ['u1'],
      labelIds: ['l3', 'l7'], milestoneId: 'm2',
      sourceBranch: 'feature/auth-refactor', targetBranch: 'main',
      pipelineStatus: 'running', pipelineId: 'pipe4', canBeMerged: false,
      commits: ['c9', 'c10'],
      changes: [
        { file: 'src/auth/tokenService.js', additions: 120, deletions: 45, diff: '-// old token logic\n+// new token logic\n+export class TokenService {}' }
      ],
      createdAt: '2026-04-07T09:00:00Z', updatedAt: '2026-04-09T17:00:00Z'
    },
    {
      id: 'mr3', projectId: 'p1', iid: 3,
      title: 'fix: Resolve mobile layout issues on settings page',
      description: '## Fix\n\nResolves #8. Fixed responsive layout breakpoints for mobile.\n\n## Screenshots\n\nBefore/after screenshots attached.',
      state: 'opened', isDraft: false, authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', assigneeIds: ['u3'], reviewerIds: ['u1', 'u5'],
      labelIds: ['l1', 'l8'], milestoneId: 'm2',
      sourceBranch: 'fix/settings-mobile', targetBranch: 'main',
      pipelineStatus: 'failed', pipelineId: 'pipe5', canBeMerged: false,
      commits: ['c11', 'c12'],
      changes: [
        { file: 'src/pages/Settings.css', additions: 35, deletions: 12, diff: '+@media (max-width: 768px) {\n+  .settings-container { flex-direction: column; }\n+}' }
      ],
      createdAt: '2026-04-08T10:00:00Z', updatedAt: '2026-04-09T11:00:00Z'
    },
    {
      id: 'mr4', projectId: 'p1', iid: 4,
      title: 'feat: Add virtual scrolling to data tables',
      description: '## Summary\n\nImplements virtual scrolling using react-window for large datasets.',
      state: 'merged', isDraft: false, authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', assigneeIds: ['u2'], reviewerIds: ['u3'],
      labelIds: ['l3', 'l8'], milestoneId: 'm1',
      sourceBranch: 'feature/virtual-scroll', targetBranch: 'main',
      pipelineStatus: 'passed', pipelineId: 'pipe1', canBeMerged: false,
      mergedAt: '2026-03-28T15:00:00Z', mergedBy: 'u1',
      commits: ['c7', 'c8'],
      changes: [
        { file: 'src/components/DataTable.jsx', additions: 180, deletions: 90, diff: '+import { FixedSizeList } from "react-window";\n+// virtual scroll implementation' }
      ],
      createdAt: '2026-03-25T11:00:00Z', updatedAt: '2026-03-28T15:00:00Z'
    },
    {
      id: 'mr5', projectId: 'p1', iid: 5,
      title: 'chore: Upgrade dependencies to latest versions',
      description: '## Dependency updates\n\n- React 18.2 → 18.3\n- Vite 4 → 5\n- TypeScript 4 → 5',
      state: 'merged', isDraft: false, authorId: 'u4', authorName: 'James Rodriguez', authorEmail: 'james@acme-corp.io', assigneeIds: ['u4'], reviewerIds: ['u2'],
      labelIds: ['l9'], milestoneId: 'm1',
      sourceBranch: 'chore/update-deps', targetBranch: 'main',
      pipelineStatus: 'passed', pipelineId: null, canBeMerged: false,
      mergedAt: '2026-03-15T10:00:00Z', mergedBy: 'u2',
      commits: ['c13'],
      changes: [],
      createdAt: '2026-03-12T09:00:00Z', updatedAt: '2026-03-15T10:00:00Z'
    },
    {
      id: 'mr6', projectId: 'p1', iid: 6,
      title: 'feat: Implement SSO login flow',
      description: '## Summary\n\nAdds SAML and OAuth SSO support. Closes #13.',
      state: 'merged', isDraft: false, authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', assigneeIds: ['u2'], reviewerIds: ['u1'],
      labelIds: ['l2', 'l7'], milestoneId: 'm3',
      sourceBranch: 'feature/sso-login', targetBranch: 'main',
      pipelineStatus: 'passed', pipelineId: null, canBeMerged: false,
      mergedAt: '2025-12-20T15:00:00Z', mergedBy: 'u1',
      commits: ['c14', 'c15'],
      changes: [],
      createdAt: '2025-12-10T10:00:00Z', updatedAt: '2025-12-20T15:00:00Z'
    },
    {
      id: 'mr7', projectId: 'p1', iid: 7,
      title: 'feat: Add user profile customization',
      description: '## Summary\n\nAllows users to customize their profile with avatar upload and bio.',
      state: 'closed', isDraft: false, authorId: 'u6', authorName: 'Alex Kim', authorEmail: 'alex@acme-corp.io', assigneeIds: ['u6'], reviewerIds: ['u3'],
      labelIds: ['l2', 'l8'], milestoneId: null,
      sourceBranch: 'feature/profile-custom', targetBranch: 'main',
      pipelineStatus: 'canceled', pipelineId: null, canBeMerged: false,
      commits: [],
      changes: [],
      createdAt: '2026-02-20T09:00:00Z', updatedAt: '2026-03-01T10:00:00Z'
    },
    {
      id: 'mr8', projectId: 'p1', iid: 8,
      title: 'docs: Update README with v2.0 instructions',
      description: '## Summary\n\nUpdates README with new setup instructions and architecture overview.',
      state: 'opened', isDraft: false, authorId: 'u4', authorName: 'James Rodriguez', authorEmail: 'james@acme-corp.io', assigneeIds: ['u4'], reviewerIds: ['u1'],
      labelIds: ['l4'], milestoneId: 'm1',
      sourceBranch: 'docs/update-readme', targetBranch: 'main',
      pipelineStatus: 'passed', pipelineId: 'pipe3', canBeMerged: true,
      commits: ['c16'],
      changes: [
        { file: 'README.md', additions: 45, deletions: 20, diff: '+# web-platform v2.0\n+\n+Updated instructions...' }
      ],
      createdAt: '2026-04-09T09:00:00Z', updatedAt: '2026-04-09T12:00:00Z'
    },
  ];

  const mrComments = [
    { id: 'mrc1', mergeRequestId: 'mr1', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'This looks good overall. A few minor nits on the chart config.', isSystemNote: false, createdAt: '2026-04-06T10:00:00Z' },
    { id: 'mrc2', mergeRequestId: 'mr1', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'assigned to @svelasquez, reviewed by @mchen', isSystemNote: true, createdAt: '2026-04-05T11:05:00Z' },
    { id: 'mrc3', mergeRequestId: 'mr1', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'Thanks for the review! Updated the chart config.', isSystemNote: false, createdAt: '2026-04-07T09:00:00Z' },
    { id: 'mrc4', mergeRequestId: 'mr1', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'Looks good now. Approving.', isSystemNote: false, createdAt: '2026-04-09T16:00:00Z' },
    { id: 'mrc5', mergeRequestId: 'mr2', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'The token refresh logic needs to handle network errors gracefully.', isSystemNote: false, createdAt: '2026-04-08T10:00:00Z' },
    { id: 'mrc6', mergeRequestId: 'mr2', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'Adding retry logic now.', isSystemNote: false, createdAt: '2026-04-09T09:00:00Z' },
    { id: 'mrc7', mergeRequestId: 'mr3', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'The pipeline is failing on the CSS lint check. Please fix.', isSystemNote: false, createdAt: '2026-04-09T11:00:00Z' },
    { id: 'mrc8', mergeRequestId: 'mr3', authorId: 'u5', authorName: 'Emma Schmidt', authorEmail: 'emma@acme-corp.io', body: 'Also check the z-index on the modal overlay.', isSystemNote: false, createdAt: '2026-04-09T11:30:00Z' },
    { id: 'mrc9', mergeRequestId: 'mr4', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', body: 'Virtual scrolling works great. Performance is much better!', isSystemNote: false, createdAt: '2026-03-27T14:00:00Z' },
    { id: 'mrc10', mergeRequestId: 'mr4', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'Merging. Great work!', isSystemNote: true, createdAt: '2026-03-28T15:00:00Z' },
    { id: 'mrc11', mergeRequestId: 'mr6', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'SSO tested with Okta and Azure AD. Working correctly.', isSystemNote: false, createdAt: '2025-12-18T10:00:00Z' },
    { id: 'mrc12', mergeRequestId: 'mr6', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', body: 'All tests passing. Ready to merge.', isSystemNote: false, createdAt: '2025-12-19T14:00:00Z' },
    { id: 'mrc13', mergeRequestId: 'mr7', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', body: 'The avatar upload size limit is too small. Also needs image cropping.', isSystemNote: false, createdAt: '2026-02-25T10:00:00Z' },
    { id: 'mrc14', mergeRequestId: 'mr7', authorId: 'u6', authorName: 'Alex Kim', authorEmail: 'alex@acme-corp.io', body: 'Closing this. Will reopen with a more complete implementation.', isSystemNote: false, createdAt: '2026-03-01T10:00:00Z' },
    { id: 'mrc15', mergeRequestId: 'mr8', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', body: 'Good changes. Just need to update the architecture diagram too.', isSystemNote: false, createdAt: '2026-04-09T12:00:00Z' },
  ];

  const pipelines = [
    { id: 'pipe1', iid: 1, projectId: 'p1', ref: 'main', sha: 'a1b2c3d4', status: 'passed', triggeredBy: 'u1', duration: 142, createdAt: '2026-04-09T10:00:00Z', stages: [{ name: 'build', status: 'passed' }, { name: 'test', status: 'passed' }, { name: 'deploy', status: 'passed' }], jobs: ['j1', 'j2', 'j3', 'j4'] },
    { id: 'pipe2', iid: 2, projectId: 'p1', ref: 'feature/dashboard-analytics', sha: 'c3d4e5f6', status: 'passed', triggeredBy: 'u1', duration: 98, createdAt: '2026-04-09T15:00:00Z', stages: [{ name: 'build', status: 'passed' }, { name: 'test', status: 'passed' }], jobs: ['j5', 'j6', 'j7'] },
    { id: 'pipe3', iid: 3, projectId: 'p1', ref: 'docs/update-readme', sha: 'd4e5f6a7', status: 'passed', triggeredBy: 'u4', duration: 45, createdAt: '2026-04-09T11:00:00Z', stages: [{ name: 'build', status: 'passed' }], jobs: ['j8'] },
    { id: 'pipe4', iid: 4, projectId: 'p1', ref: 'feature/auth-refactor', sha: 'e5f6a7b8', status: 'running', triggeredBy: 'u2', duration: null, createdAt: '2026-04-09T17:00:00Z', stages: [{ name: 'build', status: 'passed' }, { name: 'test', status: 'running' }], jobs: ['j9', 'j10', 'j11'] },
    { id: 'pipe5', iid: 5, projectId: 'p1', ref: 'fix/settings-mobile', sha: 'f6a7b8c9', status: 'failed', triggeredBy: 'u3', duration: 62, createdAt: '2026-04-09T10:30:00Z', stages: [{ name: 'build', status: 'passed' }, { name: 'test', status: 'failed' }], jobs: ['j12', 'j13'] },
    { id: 'pipe6', iid: 6, projectId: 'p1', ref: 'main', sha: 'a7b8c9d0', status: 'passed', triggeredBy: 'u1', duration: 138, createdAt: '2026-04-08T09:00:00Z', stages: [{ name: 'build', status: 'passed' }, { name: 'test', status: 'passed' }, { name: 'deploy', status: 'passed' }], jobs: ['j14', 'j15', 'j16', 'j17'] },
    { id: 'pipe7', iid: 7, projectId: 'p1', ref: 'main', sha: 'b8c9d0e1', status: 'canceled', triggeredBy: 'u2', duration: 30, createdAt: '2026-04-07T14:00:00Z', stages: [{ name: 'build', status: 'canceled' }], jobs: ['j18'] },
    { id: 'pipe8', iid: 8, projectId: 'p1', ref: 'main', sha: 'c9d0e1f2', status: 'passed', triggeredBy: 'u1', duration: 145, createdAt: '2026-04-06T11:00:00Z', stages: [{ name: 'build', status: 'passed' }, { name: 'test', status: 'passed' }, { name: 'deploy', status: 'passed' }], jobs: ['j19', 'j20', 'j21', 'j22'] },
  ];

  const jobs = [
    { id: 'j1', pipelineId: 'pipe1', projectId: 'p1', name: 'build:webpack', stage: 'build', status: 'passed', duration: 45, startedAt: '2026-04-09T10:01:00Z', finishedAt: '2026-04-09T10:01:45Z', runner: 'xitlab-runner-01', logExcerpt: `$ npm ci\nadded 1247 packages in 12.3s\n$ npm run build\n> web-platform@2.0.0 build\n> tsc && vite build\nvite v5.0.0 building for production...\n✓ 1842 modules transformed.\ndist/index.html                  0.46 kB\ndist/assets/index-DiwrgTda.css  31.20 kB\ndist/assets/index-C8Kp52q5.js  245.82 kB\n✓ built in 8.45s\nJob succeeded` },
    { id: 'j2', pipelineId: 'pipe1', projectId: 'p1', name: 'test:unit', stage: 'test', status: 'passed', duration: 67, startedAt: '2026-04-09T10:02:00Z', finishedAt: '2026-04-09T10:03:07Z', runner: 'xitlab-runner-02', logExcerpt: `$ npm test\n> web-platform@2.0.0 test\n> vitest run\n✓ src/auth/auth.test.ts (12 tests)\n✓ src/components/Button.test.tsx (8 tests)\n✓ src/utils/helpers.test.ts (15 tests)\nTest Files: 3 passed (3)\nTests: 35 passed (35)\nJob succeeded` },
    { id: 'j3', pipelineId: 'pipe1', projectId: 'p1', name: 'test:e2e', stage: 'test', status: 'passed', duration: 89, startedAt: '2026-04-09T10:02:00Z', finishedAt: '2026-04-09T10:03:29Z', runner: 'xitlab-runner-03', logExcerpt: `$ npx playwright test\nRunning 24 tests using 4 workers\n  24 passed (1m 29s)\nJob succeeded` },
    { id: 'j4', pipelineId: 'pipe1', projectId: 'p1', name: 'deploy:production', stage: 'deploy', status: 'passed', duration: 30, startedAt: '2026-04-09T10:04:00Z', finishedAt: '2026-04-09T10:04:30Z', runner: 'xitlab-runner-01', logExcerpt: `$ ./deploy.sh production\nDeploying to production...\nBuilding Docker image...\nPushing to registry...\nUpdating Kubernetes deployment...\nDeployment successful!\nJob succeeded` },
    { id: 'j5', pipelineId: 'pipe2', projectId: 'p1', name: 'build:webpack', stage: 'build', status: 'passed', duration: 42, startedAt: '2026-04-09T15:01:00Z', finishedAt: '2026-04-09T15:01:42Z', runner: 'xitlab-runner-01', logExcerpt: `$ npm run build\n✓ built in 7.8s\nJob succeeded` },
    { id: 'j6', pipelineId: 'pipe2', projectId: 'p1', name: 'test:unit', stage: 'test', status: 'passed', duration: 56, startedAt: '2026-04-09T15:02:00Z', finishedAt: '2026-04-09T15:02:56Z', runner: 'xitlab-runner-02', logExcerpt: `$ npm test\nTests: 35 passed (35)\nJob succeeded` },
    { id: 'j7', pipelineId: 'pipe2', projectId: 'p1', name: 'test:lint', stage: 'test', status: 'passed', duration: 15, startedAt: '2026-04-09T15:02:00Z', finishedAt: '2026-04-09T15:02:15Z', runner: 'xitlab-runner-03', logExcerpt: `$ npm run lint\nNo linting errors found.\nJob succeeded` },
    { id: 'j8', pipelineId: 'pipe3', projectId: 'p1', name: 'build:docs', stage: 'build', status: 'passed', duration: 45, startedAt: '2026-04-09T11:01:00Z', finishedAt: '2026-04-09T11:01:45Z', runner: 'xitlab-runner-01', logExcerpt: `$ npm run build\n✓ built in 2.1s\nJob succeeded` },
    { id: 'j9', pipelineId: 'pipe4', projectId: 'p1', name: 'build:webpack', stage: 'build', status: 'passed', duration: 44, startedAt: '2026-04-09T17:01:00Z', finishedAt: '2026-04-09T17:01:44Z', runner: 'xitlab-runner-01', logExcerpt: `$ npm run build\n✓ built in 8.1s\nJob succeeded` },
    { id: 'j10', pipelineId: 'pipe4', projectId: 'p1', name: 'test:unit', stage: 'test', status: 'running', duration: null, startedAt: '2026-04-09T17:02:00Z', finishedAt: null, runner: 'xitlab-runner-02', logExcerpt: `$ npm test\nRunning tests...\n✓ src/auth/auth.test.ts (12 tests)` },
    { id: 'j11', pipelineId: 'pipe4', projectId: 'p1', name: 'test:e2e', stage: 'test', status: 'pending', duration: null, startedAt: null, finishedAt: null, runner: null, logExcerpt: 'Waiting for runner...' },
    { id: 'j12', pipelineId: 'pipe5', projectId: 'p1', name: 'build:webpack', stage: 'build', status: 'passed', duration: 41, startedAt: '2026-04-09T10:31:00Z', finishedAt: '2026-04-09T10:31:41Z', runner: 'xitlab-runner-01', logExcerpt: `$ npm run build\n✓ built in 7.9s\nJob succeeded` },
    { id: 'j13', pipelineId: 'pipe5', projectId: 'p1', name: 'test:lint', stage: 'test', status: 'failed', duration: 12, startedAt: '2026-04-09T10:32:00Z', finishedAt: '2026-04-09T10:32:12Z', runner: 'xitlab-runner-02', logExcerpt: `$ npm run lint\nERROR: src/pages/Settings.css: Expected semicolon at line 42\nERROR: 1 problem (1 error, 0 warnings)\nJob failed: exit code 1` },
    { id: 'j14', pipelineId: 'pipe6', projectId: 'p1', name: 'build:webpack', stage: 'build', status: 'passed', duration: 43, startedAt: '2026-04-08T09:01:00Z', finishedAt: '2026-04-08T09:01:43Z', runner: 'xitlab-runner-01', logExcerpt: `$ npm run build\n✓ built in 8.0s\nJob succeeded` },
    { id: 'j15', pipelineId: 'pipe6', projectId: 'p1', name: 'test:unit', stage: 'test', status: 'passed', duration: 65, startedAt: '2026-04-08T09:02:00Z', finishedAt: '2026-04-08T09:03:05Z', runner: 'xitlab-runner-02', logExcerpt: `$ npm test\nTests: 35 passed (35)\nJob succeeded` },
    { id: 'j16', pipelineId: 'pipe6', projectId: 'p1', name: 'test:e2e', stage: 'test', status: 'passed', duration: 87, startedAt: '2026-04-08T09:02:00Z', finishedAt: '2026-04-08T09:03:27Z', runner: 'xitlab-runner-03', logExcerpt: `$ npx playwright test\n24 passed\nJob succeeded` },
    { id: 'j17', pipelineId: 'pipe6', projectId: 'p1', name: 'deploy:production', stage: 'deploy', status: 'passed', duration: 28, startedAt: '2026-04-08T09:04:00Z', finishedAt: '2026-04-08T09:04:28Z', runner: 'xitlab-runner-01', logExcerpt: `$ ./deploy.sh production\nDeployment successful!\nJob succeeded` },
    { id: 'j18', pipelineId: 'pipe7', projectId: 'p1', name: 'build:webpack', stage: 'build', status: 'canceled', duration: 30, startedAt: '2026-04-07T14:01:00Z', finishedAt: '2026-04-07T14:01:30Z', runner: 'xitlab-runner-01', logExcerpt: `$ npm run build\nJob was canceled` },
    { id: 'j19', pipelineId: 'pipe8', projectId: 'p1', name: 'build:webpack', stage: 'build', status: 'passed', duration: 46, startedAt: '2026-04-06T11:01:00Z', finishedAt: '2026-04-06T11:01:46Z', runner: 'xitlab-runner-01', logExcerpt: `$ npm run build\n✓ built in 8.2s\nJob succeeded` },
    { id: 'j20', pipelineId: 'pipe8', projectId: 'p1', name: 'test:unit', stage: 'test', status: 'passed', duration: 68, startedAt: '2026-04-06T11:02:00Z', finishedAt: '2026-04-06T11:03:08Z', runner: 'xitlab-runner-02', logExcerpt: `$ npm test\nTests: 35 passed (35)\nJob succeeded` },
    { id: 'j21', pipelineId: 'pipe8', projectId: 'p1', name: 'test:e2e', stage: 'test', status: 'passed', duration: 90, startedAt: '2026-04-06T11:02:00Z', finishedAt: '2026-04-06T11:03:30Z', runner: 'xitlab-runner-03', logExcerpt: `$ npx playwright test\n24 passed\nJob succeeded` },
    { id: 'j22', pipelineId: 'pipe8', projectId: 'p1', name: 'deploy:production', stage: 'deploy', status: 'passed', duration: 29, startedAt: '2026-04-06T11:04:00Z', finishedAt: '2026-04-06T11:04:29Z', runner: 'xitlab-runner-01', logExcerpt: `$ ./deploy.sh production\nDeployment successful!\nJob succeeded` },
  ];

  const branches = [
    { id: 'br1', projectId: 'p1', name: 'main', isDefault: true, isProtected: true, lastCommitId: 'c1', createdAt: '2025-01-15T10:00:00Z' },
    { id: 'br2', projectId: 'p1', name: 'develop', isDefault: false, isProtected: false, lastCommitId: 'c3', createdAt: '2025-02-01T09:00:00Z' },
    { id: 'br3', projectId: 'p1', name: 'feature/dashboard-refactor', isDefault: false, isProtected: false, lastCommitId: 'c7', createdAt: '2026-03-15T14:00:00Z' },
    { id: 'br4', projectId: 'p1', name: 'feature/auth-module', isDefault: false, isProtected: false, lastCommitId: 'c9', createdAt: '2026-03-20T10:00:00Z' },
    { id: 'br5', projectId: 'p1', name: 'fix/login-redirect', isDefault: false, isProtected: false, lastCommitId: 'c11', createdAt: '2026-04-01T08:00:00Z' },
    { id: 'br6', projectId: 'p1', name: 'release/v2.0', isDefault: false, isProtected: true, lastCommitId: 'c2', createdAt: '2026-04-01T09:00:00Z' },
  ];

  const commits = [
    { id: 'c1', projectId: 'p1', sha: 'a1b2c3d4e5f6', shortId: 'a1b2c3d4', title: 'feat: initial project setup with Vite + React', message: 'feat: initial project setup with Vite + React', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', branch: 'main', additions: 1500, deletions: 0, createdAt: '2025-01-15T10:00:00Z', files: [] },
    { id: 'c2', projectId: 'p1', sha: 'b2c3d4e5f6a7', shortId: 'b2c3d4e5', title: 'feat: add authentication module', message: 'feat: add authentication module', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', branch: 'main', additions: 340, deletions: 12, createdAt: '2025-02-01T14:00:00Z', files: [{ name: 'src/auth/index.js', additions: 340, deletions: 12 }] },
    { id: 'c3', projectId: 'p1', sha: 'c3d4e5f6a7b8', shortId: 'c3d4e5f6', title: 'docs: add CONTRIBUTING.md and update README', message: 'docs: add CONTRIBUTING.md and update README', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', branch: 'main', additions: 120, deletions: 5, createdAt: '2025-02-10T09:00:00Z', files: [{ name: 'CONTRIBUTING.md', additions: 80, deletions: 0 }, { name: 'README.md', additions: 40, deletions: 5 }] },
    { id: 'c4', projectId: 'p1', sha: 'd4e5f6a7b8c9', shortId: 'd4e5f6a7', title: 'feat: add user dashboard page', message: 'feat: add user dashboard page', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', branch: 'main', additions: 250, deletions: 8, createdAt: '2025-03-01T14:00:00Z', files: [{ name: 'src/pages/Dashboard.jsx', additions: 250, deletions: 8 }] },
    { id: 'c5', projectId: 'p1', sha: 'e5f6a7b8c9d0', shortId: 'e5f6a7b8', title: 'chore: configure Vite with path aliases', message: 'chore: configure Vite with path aliases', authorId: 'u4', authorName: 'James Rodriguez', authorEmail: 'james@acme-corp.io', branch: 'main', additions: 45, deletions: 10, createdAt: '2025-03-15T10:00:00Z', files: [{ name: 'vite.config.ts', additions: 45, deletions: 10 }] },
    { id: 'c6', projectId: 'p1', sha: 'f6a7b8c9d0e1', shortId: 'f6a7b8c9', title: 'feat: add settings page with theme toggle', message: 'feat: add settings page with theme toggle', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', branch: 'main', additions: 310, deletions: 0, createdAt: '2025-04-01T11:00:00Z', files: [{ name: 'src/pages/Settings.jsx', additions: 200, deletions: 0 }, { name: 'src/pages/Settings.css', additions: 110, deletions: 0 }] },
    { id: 'c7', projectId: 'p1', sha: 'a7b8c9d0e1f2', shortId: 'a7b8c9d0', title: 'feat: implement virtual scrolling in data tables', message: 'feat: implement virtual scrolling in data tables', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', branch: 'feature/dashboard-refactor', additions: 180, deletions: 90, createdAt: '2026-03-25T11:00:00Z', files: [{ name: 'src/components/DataTable.jsx', additions: 180, deletions: 90 }] },
    { id: 'c8', projectId: 'p1', sha: 'b8c9d0e1f2a3', shortId: 'b8c9d0e1', title: 'test: add unit tests for DataTable virtual scroll', message: 'test: add unit tests for DataTable virtual scroll', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', branch: 'feature/dashboard-refactor', additions: 95, deletions: 0, createdAt: '2026-03-26T14:00:00Z', files: [{ name: 'src/components/DataTable.test.jsx', additions: 95, deletions: 0 }] },
    { id: 'c9', projectId: 'p1', sha: 'c9d0e1f2a3b4', shortId: 'c9d0e1f2', title: 'refactor: extract token service from auth module', message: 'refactor: extract token service from auth module', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', branch: 'feature/auth-module', additions: 120, deletions: 45, createdAt: '2026-04-07T09:00:00Z', files: [{ name: 'src/auth/tokenService.js', additions: 120, deletions: 45 }] },
    { id: 'c10', projectId: 'p1', sha: 'd0e1f2a3b4c5', shortId: 'd0e1f2a3', title: 'test: add token service tests', message: 'test: add token service tests', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', branch: 'feature/auth-module', additions: 80, deletions: 0, createdAt: '2026-04-08T10:00:00Z', files: [{ name: 'src/auth/tokenService.test.js', additions: 80, deletions: 0 }] },
    { id: 'c11', projectId: 'p1', sha: 'e1f2a3b4c5d6', shortId: 'e1f2a3b4', title: 'fix: resolve mobile layout breakpoints in settings', message: 'fix: resolve mobile layout breakpoints in settings', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', branch: 'fix/login-redirect', additions: 35, deletions: 12, createdAt: '2026-04-08T10:00:00Z', files: [{ name: 'src/pages/Settings.css', additions: 35, deletions: 12 }] },
    { id: 'c12', projectId: 'p1', sha: 'f2a3b4c5d6e7', shortId: 'f2a3b4c5', title: 'fix: correct z-index on modal overlay', message: 'fix: correct z-index on modal overlay', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', branch: 'fix/login-redirect', additions: 5, deletions: 2, createdAt: '2026-04-09T09:00:00Z', files: [{ name: 'src/components/Modal.css', additions: 5, deletions: 2 }] },
    { id: 'c13', projectId: 'p1', sha: 'a3b4c5d6e7f8', shortId: 'a3b4c5d6', title: 'chore: upgrade dependencies to latest versions', message: 'chore: upgrade dependencies to latest versions', authorId: 'u4', authorName: 'James Rodriguez', authorEmail: 'james@acme-corp.io', branch: 'main', additions: 3, deletions: 3, createdAt: '2026-03-12T09:00:00Z', files: [{ name: 'package.json', additions: 3, deletions: 3 }] },
    { id: 'c14', projectId: 'p1', sha: 'b4c5d6e7f8a9', shortId: 'b4c5d6e7', title: 'feat: implement SAML SSO provider', message: 'feat: implement SAML SSO provider', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', branch: 'main', additions: 280, deletions: 0, createdAt: '2025-12-10T10:00:00Z', files: [{ name: 'src/auth/saml.js', additions: 280, deletions: 0 }] },
    { id: 'c15', projectId: 'p1', sha: 'c5d6e7f8a9b0', shortId: 'c5d6e7f8', title: 'feat: add OAuth SSO and update auth routing', message: 'feat: add OAuth SSO and update auth routing', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', branch: 'main', additions: 195, deletions: 20, createdAt: '2025-12-15T14:00:00Z', files: [{ name: 'src/auth/oauth.js', additions: 150, deletions: 0 }, { name: 'src/App.jsx', additions: 45, deletions: 20 }] },
    { id: 'c16', projectId: 'p1', sha: 'd6e7f8a9b0c1', shortId: 'd6e7f8a9', title: 'docs: update README with v2.0 instructions', message: 'docs: update README with v2.0 instructions', authorId: 'u4', authorName: 'James Rodriguez', authorEmail: 'james@acme-corp.io', branch: 'main', additions: 45, deletions: 20, createdAt: '2026-04-09T09:00:00Z', files: [{ name: 'README.md', additions: 45, deletions: 20 }] },
    { id: 'c17', projectId: 'p1', sha: 'e7f8a9b0c1d2', shortId: 'e7f8a9b0', title: 'feat: add CSV export to reports', message: 'feat: add CSV export to reports', authorId: 'u3', authorName: 'Priya Patel', authorEmail: 'priya@acme-corp.io', branch: 'main', additions: 120, deletions: 5, createdAt: '2026-04-03T14:00:00Z', files: [{ name: 'src/utils/csvExport.js', additions: 120, deletions: 5 }] },
    { id: 'c18', projectId: 'p1', sha: 'f8a9b0c1d2e3', shortId: 'f8a9b0c1', title: 'feat: add notification bell icon component', message: 'feat: add notification bell icon component', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', branch: 'main', additions: 85, deletions: 0, createdAt: '2026-04-04T11:00:00Z', files: [{ name: 'src/components/NotificationBell.jsx', additions: 85, deletions: 0 }] },
    { id: 'c19', projectId: 'p1', sha: 'a9b0c1d2e3f4', shortId: 'a9b0c1d2', title: 'style: improve button hover states and transitions', message: 'style: improve button hover states and transitions', authorId: 'u6', authorName: 'Alex Kim', authorEmail: 'alex@acme-corp.io', branch: 'main', additions: 45, deletions: 20, createdAt: '2026-04-05T10:00:00Z', files: [{ name: 'src/styles/buttons.css', additions: 45, deletions: 20 }] },
    { id: 'c20', projectId: 'p1', sha: 'b0c1d2e3f4a5', shortId: 'b0c1d2e3', title: 'feat: dashboard page redesign with metrics cards', message: 'feat: dashboard page redesign with metrics cards', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', branch: 'main', additions: 320, deletions: 150, createdAt: '2026-04-06T14:00:00Z', files: [{ name: 'src/pages/Dashboard.jsx', additions: 320, deletions: 150 }] },
    { id: 'c21', projectId: 'p1', sha: 'c1d2e3f4a5b6', shortId: 'c1d2e3f4', title: 'fix: correct date formatting in activity feed', message: 'fix: correct date formatting in activity feed', authorId: 'u5', authorName: 'Emma Schmidt', authorEmail: 'emma@acme-corp.io', branch: 'main', additions: 15, deletions: 10, createdAt: '2026-04-07T09:00:00Z', files: [{ name: 'src/utils/dateFormat.js', additions: 15, deletions: 10 }] },
    { id: 'c22', projectId: 'p1', sha: 'd2e3f4a5b6c7', shortId: 'd2e3f4a5', title: 'test: expand coverage for auth unit tests', message: 'test: expand coverage for auth unit tests', authorId: 'u5', authorName: 'Emma Schmidt', authorEmail: 'emma@acme-corp.io', branch: 'main', additions: 110, deletions: 5, createdAt: '2026-04-07T14:00:00Z', files: [{ name: 'src/auth/auth.test.ts', additions: 110, deletions: 5 }] },
    { id: 'c23', projectId: 'p1', sha: 'e3f4a5b6c7d8', shortId: 'e3f4a5b6', title: 'chore: update .gitignore and add .editorconfig', message: 'chore: update .gitignore and add .editorconfig', authorId: 'u4', authorName: 'James Rodriguez', authorEmail: 'james@acme-corp.io', branch: 'main', additions: 20, deletions: 3, createdAt: '2026-04-08T09:00:00Z', files: [{ name: '.gitignore', additions: 10, deletions: 3 }, { name: '.editorconfig', additions: 10, deletions: 0 }] },
    { id: 'c24', projectId: 'p1', sha: 'f4a5b6c7d8e9', shortId: 'f4a5b6c7', title: 'feat: add pipeline status widget to dashboard', message: 'feat: add pipeline status widget to dashboard', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', branch: 'main', additions: 95, deletions: 20, createdAt: '2026-04-08T14:00:00Z', files: [{ name: 'src/components/PipelineStatus.jsx', additions: 95, deletions: 20 }] },
    { id: 'c25', projectId: 'p1', sha: 'a5b6c7d8e9f0', shortId: 'a5b6c7d8', title: 'release: bump version to 2.0.0-rc1', message: 'release: bump version to 2.0.0-rc1', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', branch: 'main', additions: 5, deletions: 5, createdAt: '2026-04-09T08:00:00Z', files: [{ name: 'package.json', additions: 5, deletions: 5 }] },
  ];

  const files = [
    { id: 'f1', path: '.gitlab-ci.yml', name: '.gitlab-ci.yml', branch: 'main', type: 'blob', projectId: 'p1', size: '1.5 KB', lastCommitId: 'c5', content: 'stages:\n  - build\n  - test\n  - deploy\n\nbuild:webpack:\n  stage: build\n  image: node:18\n  script:\n    - npm ci\n    - npm run build\n  artifacts:\n    paths:\n      - dist/\n\ntest:unit:\n  stage: test\n  image: node:18\n  script:\n    - npm ci\n    - npm test\n  coverage: /All files[^|]*\\|[^|]*\\s+([\\d.]+)/\n\ntest:e2e:\n  stage: test\n  image: mcr.microsoft.com/playwright:v1.40.0\n  script:\n    - npm ci\n    - npx playwright test\n\ntest:lint:\n  stage: test\n  image: node:18\n  script:\n    - npm ci\n    - npm run lint\n\ndeploy:production:\n  stage: deploy\n  image: alpine\n  script:\n    - ./deploy.sh production\n  environment:\n    name: production\n    url: https://app.acme-corp.io\n  only:\n    - main' },
    { id: 'f2', path: 'README.md', name: 'README.md', branch: 'main', type: 'blob', projectId: 'p1', size: '2.4 KB', lastCommitId: 'c16', content: '# web-platform\n\nMain web application for Acme Corp.\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```\n\n## Architecture\n\nBuilt with React, TypeScript, and Vite. Uses Context API for state management.\n\n## Contributing\n\nSee [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.' },
    { id: 'f3', path: 'package.json', name: 'package.json', branch: 'main', type: 'blob', projectId: 'p1', size: '1.2 KB', lastCommitId: 'c25', content: '{\n  "name": "web-platform",\n  "version": "2.0.0-rc1",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "test": "vitest run",\n    "lint": "eslint src/"\n  },\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0",\n    "react-router-dom": "^7.0.0",\n    "react-window": "^1.8.10"\n  },\n  "devDependencies": {\n    "typescript": "^5.5.0",\n    "vite": "^5.4.0",\n    "@vitejs/plugin-react": "^4.3.0",\n    "vitest": "^2.0.0",\n    "@playwright/test": "^1.40.0",\n    "eslint": "^9.0.0"\n  }\n}' },
    { id: 'f4', path: 'src', name: 'src', branch: 'main', type: 'tree', projectId: 'p1', lastCommitId: 'c20' },
    { id: 'f5', path: 'src/App.jsx', name: 'App.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '3.1 KB', lastCommitId: 'c15', content: 'import React from "react";\nimport { BrowserRouter, Routes, Route } from "react-router-dom";\nimport Dashboard from "./pages/Dashboard";\nimport Settings from "./pages/Settings";\nimport Analytics from "./pages/Analytics";\nimport Layout from "./components/Layout";\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Layout>\n        <Routes>\n          <Route path="/" element={<Dashboard />} />\n          <Route path="/settings" element={<Settings />} />\n          <Route path="/analytics" element={<Analytics />} />\n        </Routes>\n      </Layout>\n    </BrowserRouter>\n  );\n}' },
    { id: 'f6', path: 'src/main.jsx', name: 'main.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '0.3 KB', lastCommitId: 'c1', content: 'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nimport "./styles/globals.css";\n\nReactDOM.createRoot(document.getElementById("root")).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);' },
    { id: 'f7', path: 'src/components', name: 'components', branch: 'main', type: 'tree', projectId: 'p1', lastCommitId: 'c24' },
    { id: 'f8', path: 'src/components/Header.jsx', name: 'Header.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '1.8 KB', lastCommitId: 'c12', content: 'import React from "react";\nimport { Link } from "react-router-dom";\nimport NotificationBell from "./NotificationBell";\n\nexport default function Header({ title }) {\n  return (\n    <header className="app-header">\n      <Link to="/" className="logo">Acme Corp</Link>\n      <nav>\n        <Link to="/">Dashboard</Link>\n        <Link to="/analytics">Analytics</Link>\n        <Link to="/settings">Settings</Link>\n      </nav>\n      <NotificationBell />\n    </header>\n  );\n}' },
    { id: 'f9', path: 'src/components/DataTable.jsx', name: 'DataTable.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '4.5 KB', lastCommitId: 'c7', content: 'import React, { useMemo } from "react";\nimport { FixedSizeList } from "react-window";\n\nexport default function DataTable({ data, columns, rowHeight = 40 }) {\n  const Row = ({ index, style }) => {\n    const row = data[index];\n    return (\n      <div style={{ ...style, display: "flex", borderBottom: "1px solid #eee" }}>\n        {columns.map(col => (\n          <div key={col.key} style={{ flex: col.width || 1, padding: "8px 12px" }}>\n            {col.render ? col.render(row[col.key], row) : row[col.key]}\n          </div>\n        ))}\n      </div>\n    );\n  };\n\n  return (\n    <div className="data-table">\n      <div className="data-table-header" style={{ display: "flex" }}>\n        {columns.map(col => (\n          <div key={col.key} style={{ flex: col.width || 1, padding: "8px 12px", fontWeight: 600 }}>\n            {col.label}\n          </div>\n        ))}\n      </div>\n      <FixedSizeList\n        height={400}\n        itemCount={data.length}\n        itemSize={rowHeight}\n      >\n        {Row}\n      </FixedSizeList>\n    </div>\n  );\n}' },
    { id: 'f9a', path: 'src/components/NotificationBell.jsx', name: 'NotificationBell.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '1.2 KB', lastCommitId: 'c18', content: 'import React, { useState } from "react";\n\nexport default function NotificationBell() {\n  const [open, setOpen] = useState(false);\n  const [count, setCount] = useState(3);\n\n  return (\n    <div className="notification-bell" onClick={() => setOpen(o => !o)}>\n      <svg width="20" height="20" viewBox="0 0 20 20">\n        <path d="M10 18a2 2 0 01-2-2h4a2 2 0 01-2 2z" fill="currentColor" />\n        <path d="M3 14h14l-2-3V8a5 5 0 00-10 0v3l-2 3z" fill="currentColor" />\n      </svg>\n      {count > 0 && <span className="badge">{count}</span>}\n    </div>\n  );\n}' },
    { id: 'f9b', path: 'src/components/Layout.jsx', name: 'Layout.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '0.6 KB', lastCommitId: 'c20', content: 'import React from "react";\nimport Header from "./Header";\n\nexport default function Layout({ children }) {\n  return (\n    <div className="app-layout">\n      <Header />\n      <main className="app-main">{children}</main>\n    </div>\n  );\n}' },
    { id: 'f9c', path: 'src/components/PipelineStatus.jsx', name: 'PipelineStatus.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '1.4 KB', lastCommitId: 'c24', content: 'import React from "react";\n\nconst statusColors = {\n  success: "#108548",\n  failed: "#DD2B0E",\n  running: "#1F75CB",\n  pending: "#C17D10",\n};\n\nexport default function PipelineStatus({ status, duration }) {\n  return (\n    <div className="pipeline-status">\n      <span\n        className="status-dot"\n        style={{ background: statusColors[status] || "#999" }}\n      />\n      <span className="status-text">{status}</span>\n      {duration && <span className="duration">{duration}s</span>}\n    </div>\n  );\n}' },
    { id: 'f10', path: 'src/pages', name: 'pages', branch: 'main', type: 'tree', projectId: 'p1', lastCommitId: 'c20' },
    { id: 'f11', path: 'src/pages/Dashboard.jsx', name: 'Dashboard.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '4.2 KB', lastCommitId: 'c20', content: 'import React from "react";\nimport DataTable from "../components/DataTable";\nimport PipelineStatus from "../components/PipelineStatus";\n\nconst metrics = [\n  { label: "Users", value: "12,450", change: "+3.2%" },\n  { label: "Revenue", value: "$84,200", change: "+7.1%" },\n  { label: "Orders", value: "1,842", change: "-0.5%" },\n  { label: "Conversion", value: "3.24%", change: "+0.8%" },\n];\n\nexport default function Dashboard() {\n  return (\n    <main className="dashboard">\n      <h1>Dashboard</h1>\n      <div className="metrics-grid">\n        {metrics.map(m => (\n          <div key={m.label} className="metric-card">\n            <span className="metric-label">{m.label}</span>\n            <span className="metric-value">{m.value}</span>\n            <span className="metric-change">{m.change}</span>\n          </div>\n        ))}\n      </div>\n    </main>\n  );\n}' },
    { id: 'f12', path: 'src/pages/Settings.jsx', name: 'Settings.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '3.8 KB', lastCommitId: 'c11', content: 'import React, { useState } from "react";\n\nexport default function Settings() {\n  const [theme, setTheme] = useState("light");\n  const [notifications, setNotifications] = useState(true);\n\n  return (\n    <main className="settings">\n      <h1>Settings</h1>\n      <section>\n        <h2>Appearance</h2>\n        <label>\n          Theme:\n          <select value={theme} onChange={e => setTheme(e.target.value)}>\n            <option value="light">Light</option>\n            <option value="dark">Dark</option>\n            <option value="auto">System</option>\n          </select>\n        </label>\n      </section>\n      <section>\n        <h2>Notifications</h2>\n        <label>\n          <input\n            type="checkbox"\n            checked={notifications}\n            onChange={e => setNotifications(e.target.checked)}\n          />\n          Enable email notifications\n        </label>\n      </section>\n    </main>\n  );\n}' },
    { id: 'f12a', path: 'src/pages/Analytics.jsx', name: 'Analytics.jsx', branch: 'main', type: 'blob', projectId: 'p1', size: '2.1 KB', lastCommitId: 'c20', content: 'import React from "react";\n\nexport default function Analytics() {\n  return (\n    <main className="analytics">\n      <h1>Analytics</h1>\n      <div className="chart-container">\n        <p>Charts rendered here via Chart.js</p>\n      </div>\n    </main>\n  );\n}' },
    { id: 'f13', path: 'src/utils', name: 'utils', branch: 'main', type: 'tree', projectId: 'p1', lastCommitId: 'c21' },
    { id: 'f14', path: 'src/utils/dateFormat.js', name: 'dateFormat.js', branch: 'main', type: 'blob', projectId: 'p1', size: '0.8 KB', lastCommitId: 'c21', content: 'export function formatDate(date) {\n  return new Intl.DateTimeFormat("en-US", {\n    year: "numeric",\n    month: "short",\n    day: "numeric",\n  }).format(new Date(date));\n}\n\nexport function timeAgo(date) {\n  const diff = Date.now() - new Date(date);\n  const mins = Math.floor(diff / 60000);\n  if (mins < 1) return "just now";\n  if (mins < 60) return `${mins}m ago`;\n  const hours = Math.floor(mins / 60);\n  if (hours < 24) return `${hours}h ago`;\n  const days = Math.floor(hours / 24);\n  return `${days}d ago`;\n}' },
    { id: 'f14a', path: 'src/utils/csvExport.js', name: 'csvExport.js', branch: 'main', type: 'blob', projectId: 'p1', size: '0.9 KB', lastCommitId: 'c17', content: 'export function exportToCsv(data, columns, filename = "export.csv") {\n  const header = columns.map(c => c.label).join(",");\n  const rows = data.map(row =>\n    columns.map(c => {\n      const val = row[c.key] ?? "";\n      return typeof val === "string" && val.includes(",") ? `"${val}"` : val;\n    }).join(",")\n  );\n  const csv = [header, ...rows].join("\\n");\n  const blob = new Blob([csv], { type: "text/csv" });\n  const url = URL.createObjectURL(blob);\n  const a = document.createElement("a");\n  a.href = url;\n  a.download = filename;\n  a.click();\n  URL.revokeObjectURL(url);\n}' },
    { id: 'f15', path: 'src/auth', name: 'auth', branch: 'main', type: 'tree', projectId: 'p1', lastCommitId: 'c15' },
    { id: 'f16', path: 'src/auth/index.js', name: 'index.js', branch: 'main', type: 'blob', projectId: 'p1', size: '5.2 KB', lastCommitId: 'c2', content: 'const AUTH_TOKEN_KEY = "auth_token";\n\nexport async function login(credentials) {\n  const res = await fetch("/api/auth/login", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(credentials),\n  });\n  if (!res.ok) throw new Error("Login failed");\n  const data = await res.json();\n  localStorage.setItem(AUTH_TOKEN_KEY, data.token);\n  return data;\n}\n\nexport async function logout() {\n  localStorage.removeItem(AUTH_TOKEN_KEY);\n  window.location.href = "/login";\n}\n\nexport function getToken() {\n  return localStorage.getItem(AUTH_TOKEN_KEY);\n}\n\nexport function isAuthenticated() {\n  return !!getToken();\n}' },
    { id: 'f16a', path: 'src/auth/tokenService.js', name: 'tokenService.js', branch: 'main', type: 'blob', projectId: 'p1', size: '2.8 KB', lastCommitId: 'c9', content: 'export class TokenService {\n  #token = null;\n  #refreshTimer = null;\n\n  constructor() {\n    this.#token = localStorage.getItem("auth_token");\n  }\n\n  getToken() {\n    return this.#token;\n  }\n\n  async refresh() {\n    try {\n      const res = await fetch("/api/auth/refresh", {\n        method: "POST",\n        headers: { Authorization: `Bearer ${this.#token}` },\n      });\n      if (!res.ok) throw new Error("Refresh failed");\n      const data = await res.json();\n      this.#token = data.token;\n      localStorage.setItem("auth_token", data.token);\n      return data.token;\n    } catch (err) {\n      this.#token = null;\n      localStorage.removeItem("auth_token");\n      throw err;\n    }\n  }\n\n  startAutoRefresh(interval = 300000) {\n    this.#refreshTimer = setInterval(() => this.refresh(), interval);\n  }\n\n  stopAutoRefresh() {\n    clearInterval(this.#refreshTimer);\n  }\n}' },
    { id: 'f16b', path: 'src/auth/saml.js', name: 'saml.js', branch: 'main', type: 'blob', projectId: 'p1', size: '3.5 KB', lastCommitId: 'c14', content: 'export function initSAML(config) {\n  return {\n    login: () => {\n      const params = new URLSearchParams({\n        SAMLRequest: btoa(buildAuthRequest(config)),\n        RelayState: window.location.href,\n      });\n      window.location.href = `${config.idpUrl}?${params}`;\n    },\n    handleCallback: async (samlResponse) => {\n      const res = await fetch("/api/auth/saml/callback", {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify({ SAMLResponse: samlResponse }),\n      });\n      return res.json();\n    },\n  };\n}\n\nfunction buildAuthRequest(config) {\n  return `<AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:protocol"\\n    ID="_${crypto.randomUUID()}"\\n    IssueInstant="${new Date().toISOString()}"\\n    Destination="${config.idpUrl}">\\n    <Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion">${config.entityId}</Issuer>\\n  </AuthnRequest>`;\n}' },
    { id: 'f16c', path: 'src/auth/oauth.js', name: 'oauth.js', branch: 'main', type: 'blob', projectId: 'p1', size: '2.1 KB', lastCommitId: 'c15', content: 'export function initOAuth(config) {\n  return {\n    authorize: () => {\n      const params = new URLSearchParams({\n        client_id: config.clientId,\n        redirect_uri: config.redirectUri,\n        response_type: "code",\n        scope: config.scope || "openid profile email",\n        state: crypto.randomUUID(),\n      });\n      window.location.href = `${config.authUrl}?${params}`;\n    },\n    handleCallback: async (code) => {\n      const res = await fetch("/api/auth/oauth/callback", {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify({ code, redirect_uri: config.redirectUri }),\n      });\n      return res.json();\n    },\n  };\n}' },
    { id: 'f16d', path: 'src/auth/auth.test.ts', name: 'auth.test.ts', branch: 'main', type: 'blob', projectId: 'p1', size: '3.2 KB', lastCommitId: 'c22', content: 'import { describe, it, expect, vi } from "vitest";\nimport { login, logout, isAuthenticated } from "./index";\n\ndescribe("auth", () => {\n  it("should login successfully", async () => {\n    global.fetch = vi.fn().mockResolvedValue({\n      ok: true,\n      json: () => Promise.resolve({ token: "abc123" }),\n    });\n    const result = await login({ email: "test@test.com", password: "pass" });\n    expect(result.token).toBe("abc123");\n  });\n\n  it("should throw on login failure", async () => {\n    global.fetch = vi.fn().mockResolvedValue({ ok: false });\n    await expect(login({ email: "test@test.com", password: "wrong" })).rejects.toThrow();\n  });\n\n  it("should clear token on logout", () => {\n    localStorage.setItem("auth_token", "abc123");\n    delete window.location;\n    window.location = { href: "" };\n    logout();\n    expect(localStorage.getItem("auth_token")).toBeNull();\n  });\n\n  it("should check authentication", () => {\n    localStorage.removeItem("auth_token");\n    expect(isAuthenticated()).toBe(false);\n    localStorage.setItem("auth_token", "abc");\n    expect(isAuthenticated()).toBe(true);\n  });\n});' },
    { id: 'f13a', path: 'src/styles', name: 'styles', branch: 'main', type: 'tree', projectId: 'p1', lastCommitId: 'c19' },
    { id: 'f13b', path: 'src/styles/globals.css', name: 'globals.css', branch: 'main', type: 'blob', projectId: 'p1', size: '1.5 KB', lastCommitId: 'c6', content: ':root {\n  --color-primary: #6B4FBB;\n  --color-success: #108548;\n  --color-danger: #DD2B0E;\n  --color-warning: #C17D10;\n  --color-text: #1F1E24;\n  --color-bg: #FFFFFF;\n}\n\n* { box-sizing: border-box; }\n\nbody {\n  font-family: Inter, sans-serif;\n  margin: 0;\n  color: var(--color-text);\n  background: var(--color-bg);\n}\n\n.app-layout {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n}\n\n.app-main {\n  flex: 1;\n  padding: 24px;\n}' },
    { id: 'f13c', path: 'src/styles/buttons.css', name: 'buttons.css', branch: 'main', type: 'blob', projectId: 'p1', size: '0.9 KB', lastCommitId: 'c19', content: '.btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 16px;\n  border-radius: 4px;\n  border: none;\n  cursor: pointer;\n  font-weight: 500;\n  transition: opacity 0.15s, transform 0.1s;\n}\n\n.btn:hover { opacity: 0.9; }\n.btn:active { transform: scale(0.98); }\n\n.btn-primary { background: var(--color-primary); color: white; }\n.btn-success { background: var(--color-success); color: white; }\n.btn-danger { background: var(--color-danger); color: white; }' },
    { id: 'f17', path: 'tsconfig.json', name: 'tsconfig.json', branch: 'main', type: 'blob', projectId: 'p1', size: '0.8 KB', lastCommitId: 'c1', content: '{\n  "compilerOptions": {\n    "target": "ESNext",\n    "lib": ["DOM", "ESNext"],\n    "module": "ESNext",\n    "moduleResolution": "bundler",\n    "strict": true,\n    "jsx": "react-jsx",\n    "skipLibCheck": true,\n    "esModuleInterop": true,\n    "resolveJsonModule": true,\n    "isolatedModules": true,\n    "noEmit": true,\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  },\n  "include": ["src"]\n}' },
    { id: 'f18', path: 'vite.config.ts', name: 'vite.config.ts', branch: 'main', type: 'blob', projectId: 'p1', size: '0.5 KB', lastCommitId: 'c5', content: 'import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport path from "path";\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      "@": path.resolve(__dirname, "./src"),\n    },\n  },\n  server: {\n    port: 3000,\n    open: true,\n  },\n  build: {\n    sourcemap: true,\n  },\n});' },
    { id: 'f19', path: '.gitignore', name: '.gitignore', branch: 'main', type: 'blob', projectId: 'p1', size: '0.3 KB', lastCommitId: 'c23', content: 'node_modules/\ndist/\n.env\n.env.local\n*.log\n.DS_Store\ncoverage/' },
    { id: 'f20', path: 'CONTRIBUTING.md', name: 'CONTRIBUTING.md', branch: 'main', type: 'blob', projectId: 'p1', size: '1.1 KB', lastCommitId: 'c3', content: '# Contributing to web-platform\n\n## Development Setup\n\n1. Fork the repo\n2. Create a branch: `git checkout -b feature/my-feature`\n3. Make your changes\n4. Run tests: `npm test`\n5. Open a merge request\n\n## Code Style\n\n- We use ESLint and Prettier\n- TypeScript strict mode is enabled\n- All new code must have test coverage\n\n## Commit Messages\n\nFollow [Conventional Commits](https://www.conventionalcommits.org/):\n\n- `feat:` new feature\n- `fix:` bug fix\n- `docs:` documentation\n- `chore:` maintenance' },
    { id: 'f21', path: '.editorconfig', name: '.editorconfig', branch: 'main', type: 'blob', projectId: 'p1', size: '0.2 KB', lastCommitId: 'c23', content: 'root = true\n\n[*]\nindent_style = space\nindent_size = 2\nend_of_line = lf\ncharset = utf-8\ntrim_trailing_whitespace = true\ninsert_final_newline = true' },
    { id: 'f22', path: 'package-lock.json', name: 'package-lock.json', branch: 'main', type: 'blob', projectId: 'p1', size: '245 KB', lastCommitId: 'c25', content: '// Auto-generated lock file (content truncated)' },
    { id: 'f23', path: 'deploy.sh', name: 'deploy.sh', branch: 'main', type: 'blob', projectId: 'p1', size: '0.8 KB', lastCommitId: 'c5', content: '#!/bin/bash\nset -e\n\nENV=${1:-staging}\necho "Deploying to $ENV..."\n\n# Build Docker image\ndocker build -t web-platform:latest .\n\n# Push to registry\ndocker push registry.acme-corp.io/web-platform:latest\n\n# Update Kubernetes deployment\nkubectl set image deployment/web-platform \\\n  web-platform=registry.acme-corp.io/web-platform:latest \\\n  -n $ENV\n\necho "Deployment to $ENV successful!"' },
    { id: 'f24', path: 'Dockerfile', name: 'Dockerfile', branch: 'main', type: 'blob', projectId: 'p1', size: '0.4 KB', lastCommitId: 'c5', content: 'FROM node:18-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\nCOPY nginx.conf /etc/nginx/conf.d/default.conf\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]' },
  ];

  const wikiPages = [
    { id: 'w1', projectId: 'p1', title: 'Home', slug: 'home', content: '# Welcome to web-platform Wiki\n\nThis is the main documentation hub.\n\n## Quick Links\n- [Getting Started](getting-started)\n- [Architecture](architecture)', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', createdAt: '2025-02-01T10:00:00Z', updatedAt: '2026-03-15T14:00:00Z' },
    { id: 'w2', projectId: 'p1', title: 'Getting Started', slug: 'getting-started', content: '# Getting Started\n\n## Prerequisites\n- Node.js 18+\n- npm 9+\n\n## Installation\n```bash\ngit clone https://gitlab.acme-corp.io/acme-corp/web-platform\ncd web-platform\nnpm install\nnpm run dev\n```', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', createdAt: '2025-02-01T11:00:00Z', updatedAt: '2026-01-10T09:00:00Z' },
    { id: 'w3', projectId: 'p1', title: 'Architecture', slug: 'architecture', content: '# Architecture\n\n## Tech Stack\n- **Frontend**: React 18, TypeScript\n- **Build**: Vite\n- **State**: Context API\n- **Routing**: React Router v6', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', createdAt: '2025-03-01T10:00:00Z', updatedAt: '2026-02-20T16:00:00Z' },
  ];

  const snippets = [
    { id: 'sn1', projectId: 'p1', title: 'API request helper', filename: 'api.js', language: 'JavaScript', description: 'Generic fetch wrapper with auth', content: 'export async function apiRequest(url, options = {}) {\n  const token = localStorage.getItem("auth_token");\n  const res = await fetch(url, {\n    ...options,\n    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", ...options.headers }\n  });\n  if (!res.ok) throw new Error(`HTTP ${res.status}`);\n  return res.json();\n}', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', createdAt: '2026-02-15T10:00:00Z' },
    { id: 'sn2', projectId: 'p1', title: 'TypeScript config template', filename: 'tsconfig.json', language: 'JSON', description: 'Strict TS config for React apps', content: '{\n  "compilerOptions": {\n    "target": "ESNext",\n    "lib": ["DOM", "ESNext"],\n    "module": "ESNext",\n    "strict": true,\n    "jsx": "react-jsx"\n  }\n}', authorId: 'u2', authorName: 'Marcus Chen', authorEmail: 'marcus@acme-corp.io', createdAt: '2026-01-10T14:00:00Z' },
    { id: 'sn3', projectId: null, title: 'Git aliases', filename: '.gitconfig', language: 'INI', description: 'Useful git aliases', content: '[alias]\n  st = status\n  co = checkout\n  br = branch\n  lg = log --oneline --graph', authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', createdAt: '2025-12-01T09:00:00Z' },
  ];

  const members = [
    { id: 'mem1', projectId: 'p1', userId: 'u1', role: 'Owner', createdAt: '2025-01-15T10:00:00Z' },
    { id: 'mem2', projectId: 'p1', userId: 'u2', role: 'Maintainer', createdAt: '2025-01-20T10:00:00Z' },
    { id: 'mem3', projectId: 'p1', userId: 'u3', role: 'Developer', createdAt: '2025-02-01T10:00:00Z' },
    { id: 'mem4', projectId: 'p1', userId: 'u4', role: 'Developer', createdAt: '2025-02-15T10:00:00Z' },
    { id: 'mem5', projectId: 'p1', userId: 'u5', role: 'Developer', createdAt: '2025-03-01T10:00:00Z' },
    { id: 'mem6', projectId: 'p1', userId: 'u6', role: 'Reporter', createdAt: '2025-04-01T10:00:00Z' },
  ];

  const todos = [
    { id: 't1', userId: 'u1', type: 'assigned', targetType: 'issue', targetId: 'i1', projectId: 'p1', message: 'assigned you Issue #1: Fix authentication redirect loop', isDone: false, createdAt: '2026-04-01T10:05:00Z' },
    { id: 't2', userId: 'u1', type: 'mentioned', targetType: 'merge_request', targetId: 'mr1', projectId: 'p1', message: 'mentioned you in MR !1: feat: Add dashboard analytics module', isDone: false, createdAt: '2026-04-05T11:05:00Z' },
    { id: 't3', userId: 'u1', type: 'review_requested', targetType: 'merge_request', targetId: 'mr2', projectId: 'p1', message: 'requested your review on MR !2', isDone: false, createdAt: '2026-04-06T09:00:00Z' },
    { id: 't4', userId: 'u1', type: 'mentioned', targetType: 'issue', targetId: 'i3', projectId: 'p1', message: 'mentioned you in Issue #3', isDone: false, createdAt: '2026-04-07T14:00:00Z' },
    { id: 't5', userId: 'u1', type: 'assigned', targetType: 'issue', targetId: 'i5', projectId: 'p1', message: 'assigned you Issue #5', isDone: false, createdAt: '2026-04-08T10:00:00Z' },
  ];

  const boards = [{
    id: 'board1', projectId: 'p1', name: 'Development Board',
    lists: [
      { id: 'bl1', name: 'Open', type: 'backlog', labelId: null, issueIds: ['i6', 'i7', 'i8'] },
      { id: 'bl2', name: 'Bug', type: 'label', labelId: 'l1', issueIds: ['i1', 'i2'] },
      { id: 'bl3', name: 'Feature', type: 'label', labelId: 'l2', issueIds: ['i3', 'i4'] },
      { id: 'bl4', name: 'Enhancement', type: 'label', labelId: 'l3', issueIds: ['i9', 'i10'] },
      { id: 'bl5', name: 'Closed', type: 'closed', labelId: null, issueIds: ['i11', 'i12', 'i13', 'i14', 'i15'] },
    ]
  }];

  const tags = [
    { id: 'tag1', projectId: 'p1', name: 'v1.0.0', commitSha: 'a1b2c3d4', message: 'First stable release', taggerId: 'u1', createdAt: '2025-06-01T10:00:00Z' },
    { id: 'tag2', projectId: 'p1', name: 'v1.5.0', commitSha: 'b2c3d4e5', message: 'Feature release with auth module', taggerId: 'u1', createdAt: '2025-12-15T10:00:00Z' },
    { id: 'tag3', projectId: 'p1', name: 'v2.0.0-rc1', commitSha: 'c3d4e5f6', message: 'Release candidate for v2.0', taggerId: 'u2', createdAt: '2026-04-01T10:00:00Z' },
  ];

  const releases = [
    { id: 'rel1', projectId: 'p1', tagName: 'v1.0.0', title: 'v1.0.0 - First Stable Release', description: "## What's new\n- Initial stable release\n- Core authentication\n- Dashboard MVP\n\n## Assets\n- Source code (zip)\n- Source code (tar.gz)", authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', createdAt: '2025-06-01T12:00:00Z' },
    { id: 'rel2', projectId: 'p1', tagName: 'v1.5.0', title: 'v1.5.0 - Auth Module', description: "## What's new\n- Full authentication system\n- User profile pages\n- Performance improvements", authorId: 'u1', authorName: 'Sofia Velasquez', authorEmail: 'sofia@acme-corp.io', createdAt: '2025-12-15T12:00:00Z' },
  ];

  return {
    currentUser, users, groups, projects, labels, milestones,
    issues, issueComments, mergeRequests, mrComments,
    pipelines, jobs, branches, commits, files,
    wikiPages, snippets, members, todos, boards, tags, releases
  };
}
