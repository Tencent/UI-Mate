const BASE_STORAGE_KEY = 'circleciMockState';
const BASE_INITIAL_KEY = 'circleciMockInitialState';

export function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
export function initialKey(sid) {
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
  if (stored) return JSON.parse(stored);
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
    // no custom state available
  }
  return null;
};

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'set_current',
        state,
        initialState: JSON.parse(localStorage.getItem(initialKey(sid)) || 'null'),
      }),
    }).catch(() => {});
  }, 300);
};

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = deepMergeData(createInitialData(), customState);
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

  const initialData = createInitialData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};

function deepMergeData(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] !== null && source[key] !== undefined) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMergeData(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
}

export function createInitialData() {
  const now = new Date('2026-04-10T08:30:00Z');
  const ts = (offsetMinutes) => {
    const d = new Date(now.getTime() - offsetMinutes * 60 * 1000);
    return d.toISOString();
  };
  const seededNumber = (index, min, span) => min + ((index * 37 + 11) % span);

  const organization = {
    id: 'org-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    avatarUrl: null,
    plan: 'performance',
    createdAt: '2022-03-15T10:00:00Z',
    creditBalance: 50000,
    creditsUsed: 12450
  };

  const currentUser = {
    id: 'user-1',
    name: 'Alex Johnson',
    username: 'alexj',
    email: 'alex@acmecorp.com',
    avatarUrl: null,
    role: 'admin',
    createdAt: '2022-03-15T10:00:00Z'
  };

  const users = [
    { id: 'user-1', name: 'Alex Johnson', username: 'alexj', email: 'alex@acmecorp.com', avatarUrl: null, role: 'admin', createdAt: '2022-03-15T10:00:00Z' },
    { id: 'user-2', name: 'Sarah Martinez', username: 'sarahm', email: 'sarah@acmecorp.com', avatarUrl: null, role: 'member', createdAt: '2022-04-01T09:00:00Z' },
    { id: 'user-3', name: 'Mike Chen', username: 'mikec', email: 'mike@acmecorp.com', avatarUrl: null, role: 'member', createdAt: '2022-05-10T11:00:00Z' },
    { id: 'user-4', name: 'Lisa Park', username: 'lisap', email: 'lisa@acmecorp.com', avatarUrl: null, role: 'member', createdAt: '2023-01-15T10:00:00Z' }
  ];

  const projects = [
    {
      id: 'proj-1',
      name: 'frontend-app',
      slug: 'frontend-app',
      vcsProvider: 'github',
      vcsUrl: 'https://github.com/acme-corp/frontend-app',
      defaultBranch: 'main',
      isFollowed: true,
      lastBuildStatus: 'success',
      lastBuildAt: ts(5),
      createdAt: '2023-01-10T09:00:00Z',
      settings: {
        buildForkPRs: false,
        passSecretsToForks: false,
        onlyBuildPRs: false,
        autoCancelRedundant: true
      }
    },
    {
      id: 'proj-2',
      name: 'backend-api',
      slug: 'backend-api',
      vcsProvider: 'github',
      vcsUrl: 'https://github.com/acme-corp/backend-api',
      defaultBranch: 'main',
      isFollowed: true,
      lastBuildStatus: 'failed',
      lastBuildAt: ts(45),
      createdAt: '2023-02-15T10:00:00Z',
      settings: {
        buildForkPRs: true,
        passSecretsToForks: false,
        onlyBuildPRs: false,
        autoCancelRedundant: true
      }
    },
    {
      id: 'proj-3',
      name: 'mobile-app',
      slug: 'mobile-app',
      vcsProvider: 'gitlab',
      vcsUrl: 'https://gitlab.com/acme-corp/mobile-app',
      defaultBranch: 'main',
      isFollowed: true,
      lastBuildStatus: 'running',
      lastBuildAt: ts(2),
      createdAt: '2023-06-01T09:00:00Z',
      settings: {
        buildForkPRs: false,
        passSecretsToForks: false,
        onlyBuildPRs: true,
        autoCancelRedundant: false
      }
    },
    {
      id: 'proj-4',
      name: 'infrastructure',
      slug: 'infrastructure',
      vcsProvider: 'bitbucket',
      vcsUrl: 'https://bitbucket.org/acme-corp/infrastructure',
      defaultBranch: 'main',
      isFollowed: false,
      lastBuildStatus: 'success',
      lastBuildAt: ts(2880),
      createdAt: '2023-09-01T09:00:00Z',
      settings: {
        buildForkPRs: false,
        passSecretsToForks: false,
        onlyBuildPRs: false,
        autoCancelRedundant: false
      }
    }
  ];

  // Pipelines
  const pipelines = [
    // frontend-app pipelines
    { id: 'pipe-1', projectId: 'proj-1', number: 1847, state: 'created', trigger: { type: 'webhook', actor: { login: 'alexj', avatarUrl: null } }, vcs: { branch: 'main', commitHash: 'a3f7b2c', commitMessage: 'Fix responsive layout on dashboard', commitAuthor: 'alexj' }, createdAt: ts(5), updatedAt: ts(0) },
    { id: 'pipe-2', projectId: 'proj-1', number: 1846, state: 'created', trigger: { type: 'webhook', actor: { login: 'sarahm', avatarUrl: null } }, vcs: { branch: 'feature/new-dashboard', commitHash: 'b8c4d1e', commitMessage: 'Add new analytics widgets to dashboard', commitAuthor: 'sarahm' }, createdAt: ts(120), updatedAt: ts(115) },
    { id: 'pipe-3', projectId: 'proj-1', number: 1845, state: 'created', trigger: { type: 'webhook', actor: { login: 'alexj', avatarUrl: null } }, vcs: { branch: 'develop', commitHash: 'c9d5e2f', commitMessage: 'Update dependencies to latest versions', commitAuthor: 'alexj' }, createdAt: ts(360), updatedAt: ts(355) },
    { id: 'pipe-4', projectId: 'proj-1', number: 1844, state: 'created', trigger: { type: 'schedule', actor: { login: 'alexj', avatarUrl: null } }, vcs: { branch: 'main', commitHash: 'a3f7b2c', commitMessage: 'Fix responsive layout on dashboard', commitAuthor: 'alexj' }, createdAt: ts(1440), updatedAt: ts(1435) },
    // backend-api pipelines
    { id: 'pipe-5', projectId: 'proj-2', number: 923, state: 'created', trigger: { type: 'webhook', actor: { login: 'lisap', avatarUrl: null } }, vcs: { branch: 'fix/auth-bug', commitHash: 'd1e6f3a', commitMessage: 'Fix JWT token expiration handling', commitAuthor: 'lisap' }, createdAt: ts(45), updatedAt: ts(40) },
    { id: 'pipe-6', projectId: 'proj-2', number: 922, state: 'created', trigger: { type: 'webhook', actor: { login: 'sarahm', avatarUrl: null } }, vcs: { branch: 'main', commitHash: 'e2f7a4b', commitMessage: 'Add rate limiting to API endpoints', commitAuthor: 'sarahm' }, createdAt: ts(180), updatedAt: ts(175) },
    { id: 'pipe-7', projectId: 'proj-2', number: 921, state: 'created', trigger: { type: 'api', actor: { login: 'alexj', avatarUrl: null } }, vcs: { branch: 'release/v2.1', commitHash: 'f3a8b5c', commitMessage: 'Prepare v2.1 release', commitAuthor: 'alexj' }, createdAt: ts(720), updatedAt: ts(715) },
    // mobile-app pipelines
    { id: 'pipe-8', projectId: 'proj-3', number: 456, state: 'created', trigger: { type: 'webhook', actor: { login: 'alexj', avatarUrl: null } }, vcs: { branch: 'main', commitHash: 'a4b9c6d', commitMessage: 'Implement dark mode support', commitAuthor: 'alexj' }, createdAt: ts(2), updatedAt: ts(0) },
    { id: 'pipe-9', projectId: 'proj-3', number: 455, state: 'created', trigger: { type: 'webhook', actor: { login: 'alexj', avatarUrl: null } }, vcs: { branch: 'feature/push-notifications', commitHash: 'b5c0d7e', commitMessage: 'Add push notification service integration', commitAuthor: 'alexj' }, createdAt: ts(240), updatedAt: ts(235) },
    { id: 'pipe-10', projectId: 'proj-3', number: 454, state: 'created', trigger: { type: 'webhook', actor: { login: 'mikec', avatarUrl: null } }, vcs: { branch: 'develop', commitHash: 'c6d1e8f', commitMessage: 'Fix crash on startup for Android 12', commitAuthor: 'mikec' }, createdAt: ts(480), updatedAt: ts(475) },
    // infrastructure pipelines
    { id: 'pipe-11', projectId: 'proj-4', number: 78, state: 'created', trigger: { type: 'webhook', actor: { login: 'alexj', avatarUrl: null } }, vcs: { branch: 'main', commitHash: 'd7e2f9a', commitMessage: 'Update Terraform modules to v4', commitAuthor: 'alexj' }, createdAt: ts(2880), updatedAt: ts(2875) },
    // More frontend-app
    { id: 'pipe-12', projectId: 'proj-1', number: 1843, state: 'created', trigger: { type: 'webhook', actor: { login: 'alexj', avatarUrl: null } }, vcs: { branch: 'main', commitHash: 'e8f3a0b', commitMessage: 'Remove unused CSS files', commitAuthor: 'alexj' }, createdAt: ts(2160), updatedAt: ts(2155) },
    { id: 'pipe-13', projectId: 'proj-2', number: 920, state: 'created', trigger: { type: 'schedule', actor: { login: 'sarahm', avatarUrl: null } }, vcs: { branch: 'main', commitHash: 'f9a4b1c', commitMessage: 'Nightly integration test run', commitAuthor: 'sarahm' }, createdAt: ts(1680), updatedAt: ts(1675) },
    { id: 'pipe-14', projectId: 'proj-3', number: 453, state: 'created', trigger: { type: 'webhook', actor: { login: 'lisap', avatarUrl: null } }, vcs: { branch: 'main', commitHash: 'a0b5c2d', commitMessage: 'Update app store metadata', commitAuthor: 'lisap' }, createdAt: ts(1440), updatedAt: ts(1435) },
    { id: 'pipe-15', projectId: 'proj-1', number: 1842, state: 'created', trigger: { type: 'api', actor: { login: 'alexj', avatarUrl: null } }, vcs: { branch: 'main', commitHash: 'b1c6d3e', commitMessage: 'Hotfix: resolve prod issue with auth flow', commitAuthor: 'alexj' }, createdAt: ts(4320), updatedAt: ts(4315) }
  ];

  // Jobs for pipe-1 workflow (build-test-deploy) - fan-out/fan-in pattern
  const jobsPipe1Wf1 = [
    { id: 'job-1', workflowId: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'checkout', type: 'build', status: 'success', jobNumber: 28451, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: [], startedAt: ts(5), stoppedAt: ts(4.9), duration: 8, creditsUsed: 1, createdAt: ts(5),
      steps: [
        { id: 'step-1-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [
          { line: 1, text: 'Build-agent version 1.0.210920-8b5fba6, based on node.js 14.20.0', timestamp: ts(5) },
          { line: 2, text: 'Starting container cimg/node:18.16', timestamp: ts(5) },
          { line: 3, text: 'Pulling image: cimg/node:18.16', timestamp: ts(5) },
          { line: 4, text: 'Container started', timestamp: ts(4.98) }
        ]},
        { id: 'step-1-2', name: 'Checkout code', status: 'success', index: 1, duration: 5, output: [
          { line: 1, text: '#!/bin/bash -eo pipefail', timestamp: ts(4.97) },
          { line: 2, text: 'Cloning into \'.\'...', timestamp: ts(4.96) },
          { line: 3, text: 'remote: Enumerating objects: 3847, done.', timestamp: ts(4.95) },
          { line: 4, text: 'remote: Counting objects: 100% (3847/3847), done.', timestamp: ts(4.94) },
          { line: 5, text: 'remote: Compressing objects: 100% (1523/1523), done.', timestamp: ts(4.94) },
          { line: 6, text: 'remote: Total 3847 (delta 2104), reused 3612 (delta 1921), pack-reused 0', timestamp: ts(4.93) },
          { line: 7, text: 'Receiving objects: 100% (3847/3847), 4.21 MiB | 12.34 MiB/s, done.', timestamp: ts(4.93) },
          { line: 8, text: 'Resolving deltas: 100% (2104/2104), done.', timestamp: ts(4.92) },
          { line: 9, text: 'From https://github.com/acme-corp/frontend-app', timestamp: ts(4.92) },
          { line: 10, text: ' * branch            main       -> FETCH_HEAD', timestamp: ts(4.92) },
          { line: 11, text: 'Switched to a new branch \'main\'', timestamp: ts(4.92) },
          { line: 12, text: 'Branch \'main\' set up to track remote branch \'main\' from \'origin\'.', timestamp: ts(4.92) },
          { line: 13, text: 'HEAD is now at a3f7b2c Fix responsive layout on dashboard', timestamp: ts(4.92) },
          { line: 14, text: 'Commit: a3f7b2c | Author: alexj | 2026-04-10T08:25:00Z', timestamp: ts(4.92) },
          { line: 15, text: 'Checked out branch: main', timestamp: ts(4.92) }
        ]}
      ]
    },
    { id: 'job-2', workflowId: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'install-deps', type: 'build', status: 'success', jobNumber: 28452, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-1'], startedAt: ts(4.85), stoppedAt: ts(4.5), duration: 22, creditsUsed: 3, createdAt: ts(5),
      steps: [
        { id: 'step-2-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [
          { line: 1, text: 'Starting container cimg/node:18.16', timestamp: ts(4.85) },
          { line: 2, text: 'Container started', timestamp: ts(4.83) }
        ]},
        { id: 'step-2-2', name: 'Restore cache', status: 'success', index: 1, duration: 2, output: [
          { line: 1, text: 'Found a cache for key: npm-deps-v1-{{ checksum "package-lock.json" }}', timestamp: ts(4.82) },
          { line: 2, text: 'Restoring cache...', timestamp: ts(4.81) }
        ]},
        { id: 'step-2-3', name: 'run: npm ci', status: 'success', index: 2, duration: 15, output: [
          { line: 1, text: '#!/bin/bash -eo pipefail', timestamp: ts(4.8) },
          { line: 2, text: 'npm warn config production Use `--omit=dev` instead.', timestamp: ts(4.78) },
          { line: 3, text: 'npm http fetch GET 200 https://registry.npmjs.org/react/-/react-18.2.0.tgz', timestamp: ts(4.75) },
          { line: 4, text: 'npm http fetch GET 200 https://registry.npmjs.org/react-dom/-/react-dom-18.2.0.tgz', timestamp: ts(4.73) },
          { line: 5, text: 'npm http fetch GET 200 https://registry.npmjs.org/vite/-/vite-5.0.0.tgz', timestamp: ts(4.70) },
          { line: 6, text: 'npm http fetch GET 200 https://registry.npmjs.org/eslint/-/eslint-8.57.0.tgz', timestamp: ts(4.68) },
          { line: 7, text: 'npm http fetch GET 200 https://registry.npmjs.org/typescript/-/typescript-5.3.3.tgz', timestamp: ts(4.65) },
          { line: 8, text: 'npm http fetch GET 200 https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-4.2.1.tgz', timestamp: ts(4.62) },
          { line: 9, text: 'npm http fetch GET 200 https://registry.npmjs.org/jest/-/jest-29.7.0.tgz', timestamp: ts(4.60) },
          { line: 10, text: 'npm http fetch GET 200 https://registry.npmjs.org/cypress/-/cypress-13.6.0.tgz', timestamp: ts(4.58) },
          { line: 11, text: 'added 847 packages, and audited 848 packages in 14s', timestamp: ts(4.57) },
          { line: 12, text: '148 packages are looking for funding', timestamp: ts(4.56) },
          { line: 13, text: '  run `npm fund` for details', timestamp: ts(4.56) },
          { line: 14, text: 'found 0 vulnerabilities', timestamp: ts(4.55) }
        ]},
        { id: 'step-2-4', name: 'Save cache', status: 'success', index: 3, duration: 2, output: [
          { line: 1, text: 'Creating cache archive...', timestamp: ts(4.52) },
          { line: 2, text: 'Cache saved successfully', timestamp: ts(4.51) }
        ]}
      ]
    },
    { id: 'job-3', workflowId: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'lint', type: 'build', status: 'success', jobNumber: 28453, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-2'], startedAt: ts(4.45), stoppedAt: ts(4.2), duration: 15, creditsUsed: 2, createdAt: ts(5),
      steps: [
        { id: 'step-3-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(4.45) }] },
        { id: 'step-3-2', name: 'run: npm run lint', status: 'success', index: 1, duration: 12, output: [
          { line: 1, text: '#!/bin/bash -eo pipefail', timestamp: ts(4.42) },
          { line: 2, text: '> frontend-app@2.1.0 lint', timestamp: ts(4.41) },
          { line: 3, text: '> eslint src --ext .js,.jsx,.ts,.tsx', timestamp: ts(4.4) },
          { line: 4, text: 'No ESLint warnings or errors found.', timestamp: ts(4.22) }
        ]}
      ]
    },
    { id: 'job-4', workflowId: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'unit-test', type: 'build', status: 'success', jobNumber: 28454, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-2'], startedAt: ts(4.45), stoppedAt: ts(3.8), duration: 39, creditsUsed: 5, createdAt: ts(5),
      steps: [
        { id: 'step-4-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(4.45) }] },
        { id: 'step-4-2', name: 'run: npm test', status: 'success', index: 1, duration: 34, output: [
          { line: 1, text: '#!/bin/bash -eo pipefail', timestamp: ts(4.42) },
          { line: 2, text: 'PASS src/components/Dashboard.test.js', timestamp: ts(4.1) },
          { line: 3, text: 'PASS src/components/Header.test.js', timestamp: ts(4.05) },
          { line: 4, text: 'PASS src/utils/helpers.test.js', timestamp: ts(3.95) },
          { line: 5, text: 'Test Suites: 3 passed, 3 total', timestamp: ts(3.82) },
          { line: 6, text: 'Tests:       24 passed, 24 total', timestamp: ts(3.82) },
          { line: 7, text: 'Time:        34.21s', timestamp: ts(3.82) }
        ]},
        { id: 'step-4-3', name: 'Store test results', status: 'success', index: 2, duration: 2, output: [
          { line: 1, text: 'Storing test results...', timestamp: ts(3.81) }
        ]}
      ]
    },
    { id: 'job-5', workflowId: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'e2e-test', type: 'build', status: 'success', jobNumber: 28455, executor: { type: 'docker', resourceClass: 'large' }, parallelism: 1, dependencies: ['job-2'], startedAt: ts(4.45), stoppedAt: ts(3.7), duration: 46, creditsUsed: 8, createdAt: ts(5),
      steps: [
        { id: 'step-5-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(4.45) }] },
        { id: 'step-5-2', name: 'run: npx cypress run', status: 'success', index: 1, duration: 40, output: [
          { line: 1, text: '============================== Run Starting ==============================', timestamp: ts(4.42) },
          { line: 2, text: '  Cypress:        13.6.0', timestamp: ts(4.42) },
          { line: 3, text: '  Tests:          18', timestamp: ts(3.75) },
          { line: 4, text: '  Passing:        18', timestamp: ts(3.75) },
          { line: 5, text: '  Duration:       39 seconds', timestamp: ts(3.72) }
        ]},
        { id: 'step-5-3', name: 'Store artifacts', status: 'success', index: 2, duration: 3, output: [
          { line: 1, text: 'Storing artifacts...', timestamp: ts(3.71) }
        ]}
      ]
    },
    { id: 'job-6', workflowId: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'build', type: 'build', status: 'success', jobNumber: 28456, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-3', 'job-4', 'job-5'], startedAt: ts(3.65), stoppedAt: ts(3.15), duration: 30, creditsUsed: 4, createdAt: ts(5),
      steps: [
        { id: 'step-6-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(3.65) }] },
        { id: 'step-6-2', name: 'run: npm run build', status: 'success', index: 1, duration: 25, output: [
          { line: 1, text: '> frontend-app@2.1.0 build', timestamp: ts(3.62) },
          { line: 2, text: '> vite build', timestamp: ts(3.62) },
          { line: 3, text: 'vite v5.0.0 building for production...', timestamp: ts(3.5) },
          { line: 4, text: '✓ 1247 modules transformed.', timestamp: ts(3.2) },
          { line: 5, text: 'dist/index.html                  0.45 kB', timestamp: ts(3.18) },
          { line: 6, text: 'dist/assets/index-abc123.js    421.30 kB', timestamp: ts(3.18) },
          { line: 7, text: '✓ built in 24.82s', timestamp: ts(3.17) }
        ]},
        { id: 'step-6-3', name: 'Store artifacts', status: 'success', index: 2, duration: 2, output: [
          { line: 1, text: 'Storing build artifacts...', timestamp: ts(3.16) }
        ]}
      ]
    },
    { id: 'job-7', workflowId: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'deploy-staging', type: 'build', status: 'success', jobNumber: 28457, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-6'], startedAt: ts(3.1), stoppedAt: ts(2.8), duration: 18, creditsUsed: 2, createdAt: ts(5),
      steps: [
        { id: 'step-7-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(3.1) }] },
        { id: 'step-7-2', name: 'run: ./scripts/deploy.sh staging', status: 'success', index: 1, duration: 14, output: [
          { line: 1, text: 'Deploying to staging environment...', timestamp: ts(3.07) },
          { line: 2, text: 'Uploading build artifacts to S3...', timestamp: ts(3.0) },
          { line: 3, text: 'Invalidating CloudFront cache...', timestamp: ts(2.95) },
          { line: 4, text: 'Deployment complete! URL: https://staging.acmecorp.com', timestamp: ts(2.82) }
        ]}
      ]
    },
    { id: 'job-8', workflowId: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'hold-for-approval', type: 'approval', status: 'success', jobNumber: 28458, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-7'], startedAt: ts(2.75), stoppedAt: ts(1.5), duration: 75, creditsUsed: 0, createdAt: ts(5), steps: [] },
    { id: 'job-9', workflowId: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'deploy-production', type: 'build', status: 'success', jobNumber: 28459, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-8'], startedAt: ts(1.45), stoppedAt: ts(1.1), duration: 21, creditsUsed: 2, createdAt: ts(5),
      steps: [
        { id: 'step-9-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(1.45) }] },
        { id: 'step-9-2', name: 'run: ./scripts/deploy.sh production', status: 'success', index: 1, duration: 16, output: [
          { line: 1, text: 'Deploying to production environment...', timestamp: ts(1.42) },
          { line: 2, text: 'Running pre-deploy checks...', timestamp: ts(1.38) },
          { line: 3, text: 'Uploading build artifacts to S3...', timestamp: ts(1.3) },
          { line: 4, text: 'Invalidating CloudFront cache...', timestamp: ts(1.2) },
          { line: 5, text: 'Deployment complete! URL: https://app.acmecorp.com', timestamp: ts(1.12) }
        ]}
      ]
    }
  ];

  // pipe-1 lint workflow jobs
  const jobsPipe1Wf2 = [
    { id: 'job-10', workflowId: 'wf-2', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'lint', type: 'build', status: 'success', jobNumber: 28460, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: [], startedAt: ts(5), stoppedAt: ts(4.75), duration: 15, creditsUsed: 1, createdAt: ts(5),
      steps: [
        { id: 'step-10-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(5) }] },
        { id: 'step-10-2', name: 'run: npm run lint', status: 'success', index: 1, duration: 12, output: [
          { line: 1, text: '> frontend-app@2.1.0 lint', timestamp: ts(4.97) },
          { line: 2, text: 'No ESLint warnings or errors found.', timestamp: ts(4.77) }
        ]}
      ]
    }
  ];

  // pipe-5 (backend-api, failed) jobs
  const jobsPipe5Wf3 = [
    { id: 'job-11', workflowId: 'wf-3', pipelineId: 'pipe-5', projectId: 'proj-2', name: 'checkout', type: 'build', status: 'success', jobNumber: 18821, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: [], startedAt: ts(45), stoppedAt: ts(44.88), duration: 7, creditsUsed: 1, createdAt: ts(45),
      steps: [
        { id: 'step-11-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(45) }] },
        { id: 'step-11-2', name: 'Checkout code', status: 'success', index: 1, duration: 4, output: [
          { line: 1, text: 'Cloning into \'.\'...', timestamp: ts(44.95) },
          { line: 2, text: 'HEAD is now at d1e6f3a Fix JWT token expiration handling', timestamp: ts(44.9) }
        ]}
      ]
    },
    { id: 'job-12', workflowId: 'wf-3', pipelineId: 'pipe-5', projectId: 'proj-2', name: 'install-deps', type: 'build', status: 'success', jobNumber: 18822, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-11'], startedAt: ts(44.8), stoppedAt: ts(44.4), duration: 24, creditsUsed: 3, createdAt: ts(45),
      steps: [
        { id: 'step-12-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(44.8) }] },
        { id: 'step-12-2', name: 'run: npm ci', status: 'success', index: 1, duration: 18, output: [
          { line: 1, text: 'added 512 packages in 17s', timestamp: ts(44.5) }
        ]}
      ]
    },
    { id: 'job-13', workflowId: 'wf-3', pipelineId: 'pipe-5', projectId: 'proj-2', name: 'unit-test', type: 'build', status: 'failed', jobNumber: 18823, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-12'], startedAt: ts(44.3), stoppedAt: ts(43.8), duration: 30, creditsUsed: 4, createdAt: ts(45),
      steps: [
        { id: 'step-13-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(44.3) }] },
        { id: 'step-13-2', name: 'run: npm test', status: 'failed', index: 1, duration: 25, output: [
          { line: 1, text: '#!/bin/bash -eo pipefail', timestamp: ts(44.27) },
          { line: 2, text: 'PASS src/services/userService.test.js', timestamp: ts(44.1) },
          { line: 3, text: 'PASS src/middleware/auth.test.js', timestamp: ts(44.0) },
          { line: 4, text: 'FAIL src/controllers/auth.test.js', timestamp: ts(43.95) },
          { line: 5, text: '  ● AuthController › POST /auth/login › should handle expired tokens', timestamp: ts(43.95) },
          { line: 6, text: '    Expected: "Token expired"', timestamp: ts(43.93) },
          { line: 7, text: '    Received: "Invalid token"', timestamp: ts(43.93) },
          { line: 8, text: '    at Object.<anonymous> (src/controllers/auth.test.js:89:5)', timestamp: ts(43.93) },
          { line: 9, text: 'Test Suites: 1 failed, 2 passed, 3 total', timestamp: ts(43.82) },
          { line: 10, text: 'Tests:       1 failed, 23 passed, 24 total', timestamp: ts(43.82) },
          { line: 11, text: 'npm ERR! Test failed. See above for more details.', timestamp: ts(43.82) },
          { line: 12, text: 'Exited with code exit status 1', timestamp: ts(43.81) }
        ]}
      ]
    },
    { id: 'job-14', workflowId: 'wf-3', pipelineId: 'pipe-5', projectId: 'proj-2', name: 'build', type: 'build', status: 'not_run', jobNumber: 18824, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-13'], startedAt: null, stoppedAt: null, duration: 0, creditsUsed: 0, createdAt: ts(45), steps: [] },
    { id: 'job-15', workflowId: 'wf-3', pipelineId: 'pipe-5', projectId: 'proj-2', name: 'deploy-staging', type: 'build', status: 'not_run', jobNumber: 18825, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-14'], startedAt: null, stoppedAt: null, duration: 0, creditsUsed: 0, createdAt: ts(45), steps: [] }
  ];

  // pipe-8 (mobile-app, running) jobs
  const jobsPipe8Wf4 = [
    { id: 'job-16', workflowId: 'wf-4', pipelineId: 'pipe-8', projectId: 'proj-3', name: 'checkout', type: 'build', status: 'success', jobNumber: 9341, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: [], startedAt: ts(2), stoppedAt: ts(1.9), duration: 6, creditsUsed: 1, createdAt: ts(2), steps: [
      { id: 'step-16-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(2) }] },
      { id: 'step-16-2', name: 'Checkout code', status: 'success', index: 1, duration: 3, output: [{ line: 1, text: 'HEAD is now at a4b9c6d Implement dark mode support', timestamp: ts(1.95) }] }
    ]},
    { id: 'job-17', workflowId: 'wf-4', pipelineId: 'pipe-8', projectId: 'proj-3', name: 'install-deps', type: 'build', status: 'success', jobNumber: 9342, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-16'], startedAt: ts(1.85), stoppedAt: ts(1.5), duration: 21, creditsUsed: 3, createdAt: ts(2), steps: [
      { id: 'step-17-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(1.85) }] },
      { id: 'step-17-2', name: 'run: npm ci', status: 'success', index: 1, duration: 18, output: [{ line: 1, text: 'added 1234 packages in 17s', timestamp: ts(1.55) }] }
    ]},
    { id: 'job-18', workflowId: 'wf-4', pipelineId: 'pipe-8', projectId: 'proj-3', name: 'unit-test', type: 'build', status: 'running', jobNumber: 9343, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-17'], startedAt: ts(1.4), stoppedAt: null, duration: 84, creditsUsed: 5, createdAt: ts(2), steps: [
      { id: 'step-18-1', name: 'Spin up environment', status: 'success', index: 0, duration: 3, output: [{ line: 1, text: 'Container started', timestamp: ts(1.4) }] },
      { id: 'step-18-2', name: 'run: npm test', status: 'running', index: 1, duration: 0, output: [
        { line: 1, text: 'PASS src/screens/HomeScreen.test.js', timestamp: ts(1.3) },
        { line: 2, text: 'PASS src/screens/ProfileScreen.test.js', timestamp: ts(1.2) },
        { line: 3, text: 'Running tests...', timestamp: ts(1.0) }
      ]}
    ]},
    { id: 'job-19', workflowId: 'wf-4', pipelineId: 'pipe-8', projectId: 'proj-3', name: 'build-android', type: 'build', status: 'blocked', jobNumber: 9344, executor: { type: 'machine', resourceClass: 'large' }, parallelism: 1, dependencies: ['job-18'], startedAt: null, stoppedAt: null, duration: 0, creditsUsed: 0, createdAt: ts(2), steps: [] },
    { id: 'job-20', workflowId: 'wf-4', pipelineId: 'pipe-8', projectId: 'proj-3', name: 'build-ios', type: 'build', status: 'blocked', jobNumber: 9345, executor: { type: 'macos', resourceClass: 'large' }, parallelism: 1, dependencies: ['job-18'], startedAt: null, stoppedAt: null, duration: 0, creditsUsed: 0, createdAt: ts(2), steps: [] }
  ];

  // pipe-2 (feature/new-dashboard, on_hold) jobs
  const jobsPipe2Wf5 = [
    { id: 'job-21', workflowId: 'wf-5', pipelineId: 'pipe-2', projectId: 'proj-1', name: 'checkout', type: 'build', status: 'success', jobNumber: 28448, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: [], startedAt: ts(120), stoppedAt: ts(119.88), duration: 7, creditsUsed: 1, createdAt: ts(120), steps: [] },
    { id: 'job-22', workflowId: 'wf-5', pipelineId: 'pipe-2', projectId: 'proj-1', name: 'unit-test', type: 'build', status: 'success', jobNumber: 28449, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-21'], startedAt: ts(119.8), stoppedAt: ts(119.2), duration: 36, creditsUsed: 5, createdAt: ts(120), steps: [] },
    { id: 'job-23', workflowId: 'wf-5', pipelineId: 'pipe-2', projectId: 'proj-1', name: 'build', type: 'build', status: 'success', jobNumber: 28450, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-21'], startedAt: ts(119.8), stoppedAt: ts(119.3), duration: 30, creditsUsed: 4, createdAt: ts(120), steps: [] },
    { id: 'job-24', workflowId: 'wf-5', pipelineId: 'pipe-2', projectId: 'proj-1', name: 'deploy-staging', type: 'build', status: 'success', jobNumber: 28451, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-22', 'job-23'], startedAt: ts(119.2), stoppedAt: ts(119.0), duration: 12, creditsUsed: 2, createdAt: ts(120), steps: [] },
    { id: 'job-25', workflowId: 'wf-5', pipelineId: 'pipe-2', projectId: 'proj-1', name: 'hold-for-approval', type: 'approval', status: 'on_hold', jobNumber: 28452, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-24'], startedAt: ts(118.95), stoppedAt: null, duration: 0, creditsUsed: 0, createdAt: ts(120), steps: [] },
    { id: 'job-26', workflowId: 'wf-5', pipelineId: 'pipe-2', projectId: 'proj-1', name: 'deploy-production', type: 'build', status: 'blocked', jobNumber: 28453, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-25'], startedAt: null, stoppedAt: null, duration: 0, creditsUsed: 0, createdAt: ts(120), steps: [] }
  ];

  // pipe-3 (queued) jobs
  const jobsPipe3Wf6 = [
    { id: 'job-27', workflowId: 'wf-6', pipelineId: 'pipe-3', projectId: 'proj-1', name: 'checkout', type: 'build', status: 'queued', jobNumber: 28447, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: [], startedAt: null, stoppedAt: null, duration: 0, creditsUsed: 0, createdAt: ts(360), steps: [] }
  ];

  const workflows = [
    { id: 'wf-1', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'build-test-deploy', status: 'success', startedAt: ts(5), stoppedAt: ts(1.1), duration: 234, creditsUsed: 26, createdAt: ts(5) },
    { id: 'wf-2', pipelineId: 'pipe-1', projectId: 'proj-1', name: 'lint', status: 'success', startedAt: ts(5), stoppedAt: ts(4.75), duration: 15, creditsUsed: 1, createdAt: ts(5) },
    { id: 'wf-3', pipelineId: 'pipe-5', projectId: 'proj-2', name: 'build-test-deploy', status: 'failed', startedAt: ts(45), stoppedAt: ts(43.8), duration: 72, creditsUsed: 9, createdAt: ts(45) },
    { id: 'wf-4', pipelineId: 'pipe-8', projectId: 'proj-3', name: 'build-test-deploy', status: 'running', startedAt: ts(2), stoppedAt: null, duration: 120, creditsUsed: 9, createdAt: ts(2) },
    { id: 'wf-5', pipelineId: 'pipe-2', projectId: 'proj-1', name: 'build-test-deploy', status: 'on_hold', startedAt: ts(120), stoppedAt: null, duration: 60, creditsUsed: 12, createdAt: ts(120) },
    { id: 'wf-6', pipelineId: 'pipe-3', projectId: 'proj-1', name: 'build-test-deploy', status: 'queued', startedAt: null, stoppedAt: null, duration: 0, creditsUsed: 0, createdAt: ts(360) },
    { id: 'wf-7', pipelineId: 'pipe-6', projectId: 'proj-2', name: 'build-test-deploy', status: 'success', startedAt: ts(180), stoppedAt: ts(177), duration: 180, creditsUsed: 22, createdAt: ts(180) },
    { id: 'wf-8', pipelineId: 'pipe-6', projectId: 'proj-2', name: 'lint', status: 'success', startedAt: ts(180), stoppedAt: ts(179.7), duration: 18, creditsUsed: 1, createdAt: ts(180) },
    { id: 'wf-9', pipelineId: 'pipe-7', projectId: 'proj-2', name: 'deploy-production', status: 'success', startedAt: ts(720), stoppedAt: ts(718), duration: 120, creditsUsed: 15, createdAt: ts(720) },
    { id: 'wf-10', pipelineId: 'pipe-9', projectId: 'proj-3', name: 'build-test-deploy', status: 'failed', startedAt: ts(240), stoppedAt: ts(238), duration: 120, creditsUsed: 10, createdAt: ts(240) },
    { id: 'wf-11', pipelineId: 'pipe-10', projectId: 'proj-3', name: 'build-test-deploy', status: 'success', startedAt: ts(480), stoppedAt: ts(477), duration: 180, creditsUsed: 18, createdAt: ts(480) },
    { id: 'wf-12', pipelineId: 'pipe-11', projectId: 'proj-4', name: 'terraform-plan-apply', status: 'success', startedAt: ts(2880), stoppedAt: ts(2875), duration: 300, creditsUsed: 20, createdAt: ts(2880) },
    { id: 'wf-13', pipelineId: 'pipe-4', projectId: 'proj-1', name: 'nightly-tests', status: 'success', startedAt: ts(1440), stoppedAt: ts(1435), duration: 300, creditsUsed: 30, createdAt: ts(1440) },
    { id: 'wf-14', pipelineId: 'pipe-12', projectId: 'proj-1', name: 'build-test-deploy', status: 'success', startedAt: ts(2160), stoppedAt: ts(2157), duration: 180, creditsUsed: 22, createdAt: ts(2160) },
    { id: 'wf-15', pipelineId: 'pipe-13', projectId: 'proj-2', name: 'nightly-tests', status: 'success', startedAt: ts(1680), stoppedAt: ts(1675), duration: 300, creditsUsed: 25, createdAt: ts(1680) },
    { id: 'wf-16', pipelineId: 'pipe-14', projectId: 'proj-3', name: 'build-test-deploy', status: 'canceled', startedAt: ts(1440), stoppedAt: ts(1439), duration: 60, creditsUsed: 5, createdAt: ts(1440) },
    { id: 'wf-17', pipelineId: 'pipe-15', projectId: 'proj-1', name: 'build-test-deploy', status: 'success', startedAt: ts(4320), stoppedAt: ts(4317), duration: 180, creditsUsed: 22, createdAt: ts(4320) }
  ];

  // Additional jobs for wf-7 (proj-2, success)
  const jobsWf7 = [
    { id: 'job-28', workflowId: 'wf-7', pipelineId: 'pipe-6', projectId: 'proj-2', name: 'checkout', type: 'build', status: 'success', jobNumber: 18830, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: [], startedAt: ts(180), stoppedAt: ts(179.9), duration: 6, creditsUsed: 1, createdAt: ts(180), steps: [] },
    { id: 'job-29', workflowId: 'wf-7', pipelineId: 'pipe-6', projectId: 'proj-2', name: 'unit-test', type: 'build', status: 'success', jobNumber: 18831, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-28'], startedAt: ts(179.8), stoppedAt: ts(179.3), duration: 30, creditsUsed: 4, createdAt: ts(180), steps: [] },
    { id: 'job-30', workflowId: 'wf-7', pipelineId: 'pipe-6', projectId: 'proj-2', name: 'integration-test', type: 'build', status: 'success', jobNumber: 18832, executor: { type: 'docker', resourceClass: 'large' }, parallelism: 1, dependencies: ['job-28'], startedAt: ts(179.8), stoppedAt: ts(179.0), duration: 48, creditsUsed: 8, createdAt: ts(180), steps: [] },
    { id: 'job-31', workflowId: 'wf-7', pipelineId: 'pipe-6', projectId: 'proj-2', name: 'build', type: 'build', status: 'success', jobNumber: 18833, executor: { type: 'docker', resourceClass: 'medium' }, parallelism: 1, dependencies: ['job-29', 'job-30'], startedAt: ts(178.9), stoppedAt: ts(178.4), duration: 30, creditsUsed: 4, createdAt: ts(180), steps: [] },
    { id: 'job-32', workflowId: 'wf-7', pipelineId: 'pipe-6', projectId: 'proj-2', name: 'deploy-staging', type: 'build', status: 'success', jobNumber: 18834, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-31'], startedAt: ts(178.3), stoppedAt: ts(178.0), duration: 18, creditsUsed: 2, createdAt: ts(180), steps: [] },
    { id: 'job-33', workflowId: 'wf-7', pipelineId: 'pipe-6', projectId: 'proj-2', name: 'hold-for-approval', type: 'approval', status: 'success', jobNumber: 18835, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-32'], startedAt: ts(177.95), stoppedAt: ts(177.5), duration: 27, creditsUsed: 0, createdAt: ts(180), steps: [] },
    { id: 'job-34', workflowId: 'wf-7', pipelineId: 'pipe-6', projectId: 'proj-2', name: 'deploy-production', type: 'build', status: 'success', jobNumber: 18836, executor: { type: 'docker', resourceClass: 'small' }, parallelism: 1, dependencies: ['job-33'], startedAt: ts(177.45), stoppedAt: ts(177.0), duration: 27, creditsUsed: 3, createdAt: ts(180), steps: [] }
  ];

  const testResults = [
    { id: 'tr-1', jobId: 'job-4', suiteName: 'src/components/Dashboard.test.js', totalTests: 8, passed: 8, failed: 0, skipped: 0, duration: 3.2, failures: [] },
    { id: 'tr-2', jobId: 'job-4', suiteName: 'src/components/Header.test.js', totalTests: 6, passed: 6, failed: 0, skipped: 0, duration: 2.1, failures: [] },
    { id: 'tr-3', jobId: 'job-4', suiteName: 'src/utils/helpers.test.js', totalTests: 10, passed: 10, failed: 0, skipped: 0, duration: 1.8, failures: [] },
    { id: 'tr-4', jobId: 'job-13', suiteName: 'src/services/userService.test.js', totalTests: 10, passed: 10, failed: 0, skipped: 0, duration: 4.5, failures: [] },
    { id: 'tr-5', jobId: 'job-13', suiteName: 'src/middleware/auth.test.js', totalTests: 6, passed: 6, failed: 0, skipped: 0, duration: 2.3, failures: [] },
    { id: 'tr-6', jobId: 'job-13', suiteName: 'src/controllers/auth.test.js', totalTests: 8, passed: 7, failed: 1, skipped: 0, duration: 5.1, failures: [
      { testName: 'POST /auth/login › should handle expired tokens', className: 'AuthController', message: 'Expected: "Token expired"\nReceived: "Invalid token"', stackTrace: 'at Object.<anonymous> (src/controllers/auth.test.js:89:5)' }
    ]},
    { id: 'tr-7', jobId: 'job-29', suiteName: 'src/services/database.test.js', totalTests: 12, passed: 11, failed: 0, skipped: 1, duration: 6.2, failures: [] },
    { id: 'tr-8', jobId: 'job-29', suiteName: 'src/api/routes.test.js', totalTests: 15, passed: 15, failed: 0, skipped: 0, duration: 4.8, failures: [] },
    { id: 'tr-9', jobId: 'job-5', suiteName: 'cypress/e2e/homepage.cy.js', totalTests: 8, passed: 8, failed: 0, skipped: 0, duration: 12.4, failures: [] },
    { id: 'tr-10', jobId: 'job-5', suiteName: 'cypress/e2e/dashboard.cy.js', totalTests: 10, passed: 10, failed: 0, skipped: 0, duration: 18.6, failures: [] }
  ];

  const artifacts = [
    { id: 'art-1', jobId: 'job-4', path: 'coverage/lcov-report/index.html', url: '#', size: 45230 },
    { id: 'art-2', jobId: 'job-4', path: 'coverage/lcov-report/coverage-summary.json', url: '#', size: 2840 },
    { id: 'art-3', jobId: 'job-6', path: 'dist/assets/index-a3f7b2c.js', url: '#', size: 431258 },
    { id: 'art-4', jobId: 'job-6', path: 'dist/assets/index-a3f7b2c.css', url: '#', size: 52108 },
    { id: 'art-5', jobId: 'job-5', path: 'cypress/screenshots/dashboard.cy.js/homepage.png', url: '#', size: 178450 },
    { id: 'art-6', jobId: 'job-5', path: 'cypress/videos/dashboard.cy.js.mp4', url: '#', size: 5820400 },
    { id: 'art-7', jobId: 'job-13', path: 'test-results/junit.xml', url: '#', size: 8430 },
    { id: 'art-8', jobId: 'job-9', path: 'deploy/manifest.json', url: '#', size: 1240 }
  ];

  const contexts = [
    { id: 'ctx-1', name: 'production-secrets', orgId: 'org-1', createdAt: '2023-06-01T12:00:00Z', envVars: [
      { id: 'ctxenv-1', name: 'AWS_ACCESS_KEY_ID', value: '****', createdAt: '2023-06-01T12:00:00Z' },
      { id: 'ctxenv-2', name: 'AWS_SECRET_ACCESS_KEY', value: '****', createdAt: '2023-06-01T12:00:00Z' },
      { id: 'ctxenv-3', name: 'DEPLOY_KEY', value: '****', createdAt: '2023-06-15T09:00:00Z' }
    ]},
    { id: 'ctx-2', name: 'staging-secrets', orgId: 'org-1', createdAt: '2023-07-15T10:00:00Z', envVars: [
      { id: 'ctxenv-4', name: 'STAGING_AWS_ACCESS_KEY_ID', value: '****', createdAt: '2023-07-15T10:00:00Z' },
      { id: 'ctxenv-5', name: 'STAGING_DATABASE_URL', value: '****', createdAt: '2023-07-15T10:00:00Z' }
    ]}
  ];

  const environmentVariables = [
    { id: 'env-1', projectId: 'proj-1', name: 'NPM_TOKEN', value: 'xxxx...1a2b', createdAt: '2024-01-15T09:00:00Z' },
    { id: 'env-2', projectId: 'proj-1', name: 'SENTRY_DSN', value: 'xxxx...8x9y', createdAt: '2024-01-20T11:00:00Z' },
    { id: 'env-3', projectId: 'proj-2', name: 'DATABASE_URL', value: 'xxxx...3c4d', createdAt: '2024-02-10T14:00:00Z' },
    { id: 'env-4', projectId: 'proj-2', name: 'AWS_ACCESS_KEY_ID', value: 'xxxx...5e6f', createdAt: '2024-02-10T14:00:00Z' },
    { id: 'env-5', projectId: 'proj-2', name: 'AWS_SECRET_ACCESS_KEY', value: 'xxxx...7g8h', createdAt: '2024-02-10T14:00:00Z' },
    { id: 'env-6', projectId: 'proj-3', name: 'DOCKER_HUB_TOKEN', value: 'xxxx...9i0j', createdAt: '2024-03-05T10:00:00Z' },
    { id: 'env-7', projectId: 'proj-3', name: 'SLACK_WEBHOOK_URL', value: 'xxxx...1k2l', createdAt: '2024-03-05T10:00:00Z' },
    { id: 'env-8', projectId: 'proj-4', name: 'TERRAFORM_TOKEN', value: 'xxxx...3m4n', createdAt: '2024-04-01T09:00:00Z' }
  ];

  const sshKeys = [
    { id: 'ssh-1', projectId: 'proj-1', type: 'deploy-key', fingerprint: 'SHA256:abc123def456ghi789jkl012mno345pqr678stu', hostname: 'github.com', createdAt: '2024-01-15T09:00:00Z' },
    { id: 'ssh-2', projectId: 'proj-2', type: 'deploy-key', fingerprint: 'SHA256:xyz987wvu654tsr321qpo098nml765kji432hgf', hostname: 'github.com', createdAt: '2024-02-10T14:00:00Z' },
    { id: 'ssh-3', projectId: 'proj-4', type: 'additional', fingerprint: 'SHA256:efg135hij246klm357nop468qrs579tuv680wxy', hostname: 'bitbucket.org', createdAt: '2024-04-01T09:00:00Z' }
  ];

  const webhooks = [
    { id: 'wh-1', projectId: 'proj-1', name: 'Slack Notification', url: 'https://hooks.slack.com/services/T01234567/B0123456789/abcdefghijklmnop', events: ['workflow-completed'], signingSecret: '****', createdAt: '2024-02-01T10:00:00Z' },
    { id: 'wh-2', projectId: 'proj-2', name: 'PagerDuty Alert', url: 'https://events.pagerduty.com/integration/abc123/enqueue', events: ['job-completed'], signingSecret: '****', createdAt: '2024-03-01T09:00:00Z' }
  ];

  // Generate 30 days of insights data
  const dailyData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const runs = isWeekend ? seededNumber(i, 5, 11) : seededNumber(i, 40, 21);
    const successRate = seededNumber(i, 82, 14);
    const avgDuration = seededNumber(i, 120, 360);
    const credits = runs * seededNumber(i, 8, 10);
    dailyData.push({ date: date.toISOString().split('T')[0], runs, successRate, avgDuration, credits });
  }

  const insights = {
    timeRange: '30d',
    summary: { workflowRuns: 1247, totalDuration: 345600, successRate: 87.3, totalCredits: 12450 },
    workflowMetrics: [
      { workflowName: 'build-test-deploy', projectName: 'frontend-app', runs: 342, successRate: 91.2, p50Duration: 185, p95Duration: 420, credits: 4200, mttr: 1800, throughput: 11.4 },
      { workflowName: 'build-test-deploy', projectName: 'backend-api', runs: 289, successRate: 84.1, p50Duration: 210, p95Duration: 480, credits: 3800, mttr: 3600, throughput: 9.6 },
      { workflowName: 'build-test-deploy', projectName: 'mobile-app', runs: 215, successRate: 82.3, p50Duration: 320, p95Duration: 620, credits: 2900, mttr: 4200, throughput: 7.2 },
      { workflowName: 'nightly-tests', projectName: 'frontend-app', runs: 210, successRate: 95.0, p50Duration: 280, p95Duration: 510, credits: 1550, mttr: 900, throughput: 7.0 },
      { workflowName: 'terraform-plan-apply', projectName: 'infrastructure', runs: 191, successRate: 89.0, p50Duration: 240, p95Duration: 400, credits: 0, mttr: 2400, throughput: 6.4 }
    ],
    dailyData
  };

  const pipelineFilters = { ownership: 'everyone', projectId: 'all', branch: 'all' };

  const resourceClasses = [
    { id: 'rc-1', name: 'acme-corp/docker-runner', description: 'General Docker runner', createdAt: '2024-01-10T09:00:00Z' },
    { id: 'rc-2', name: 'acme-corp/macos-runner', description: 'macOS build runner', createdAt: '2024-01-15T11:00:00Z' }
  ];

  const runnerInstances = [
    { id: 'ri-1', name: 'runner-001', resourceClassId: 'rc-1', resourceClassName: 'acme-corp/docker-runner', version: '1.0.48', platform: 'Linux', status: 'online', ip: '10.0.1.5', lastContactAt: ts(2) },
    { id: 'ri-2', name: 'runner-002', resourceClassId: 'rc-1', resourceClassName: 'acme-corp/docker-runner', version: '1.0.48', platform: 'Linux', status: 'online', ip: '10.0.1.6', lastContactAt: ts(1) },
    { id: 'ri-3', name: 'runner-003', resourceClassId: 'rc-1', resourceClassName: 'acme-corp/docker-runner', version: '1.0.45', platform: 'Linux', status: 'offline', ip: '10.0.1.7', lastContactAt: ts(180) },
    { id: 'ri-4', name: 'runner-mac-001', resourceClassId: 'rc-2', resourceClassName: 'acme-corp/macos-runner', version: '1.0.48', platform: 'macOS', status: 'online', ip: '10.0.2.1', lastContactAt: ts(5) }
  ];

  const deployEnvironments = [
    { id: 'deploy-env-1', name: 'Production', status: 'success', version: 'v2.1.4', commit: 'a3f7b2c', deployedAt: ts(120), url: 'https://app.acmecorp.com' },
    { id: 'deploy-env-2', name: 'Staging', status: 'success', version: 'v2.1.5-rc1', commit: 'b8c4d1e', deployedAt: ts(45), url: 'https://staging.acmecorp.com' },
    { id: 'deploy-env-3', name: 'Development', status: 'running', version: 'v2.1.5-dev', commit: 'c9d5e2f', deployedAt: ts(1), url: 'https://dev.acmecorp.com' }
  ];

  const jobs = [
    ...jobsPipe1Wf1, ...jobsPipe1Wf2, ...jobsPipe5Wf3, ...jobsPipe8Wf4,
    ...jobsPipe2Wf5, ...jobsPipe3Wf6, ...jobsWf7
  ];

  return {
    organization,
    currentUser,
    users,
    projects,
    pipelines,
    workflows,
    jobs,
    testResults,
    artifacts,
    contexts,
    environmentVariables,
    sshKeys,
    webhooks,
    insights,
    pipelineFilters,
    resourceClasses,
    runnerInstances,
    deployEnvironments,
    searchQuery: ''
  };
}
