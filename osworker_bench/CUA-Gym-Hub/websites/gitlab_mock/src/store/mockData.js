const BASE_STORAGE_KEY = 'gitlab_mock_state';
const BASE_INITIAL_KEY = 'gitlab_mock_initialState';

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

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
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

const getDefaultData = () => ({
  currentUser: {
    id: 1,
    name: "Admin User",
    username: "admin",
    avatarUrl: "https://picsum.photos/100/100?random=user1"
  },
  projects: [
    {
      id: 1,
      name: "frontend-monorepo",
      description: "Main frontend repository for the enterprise application.",
      visibility: "private",
      stars: 12,
      forks: 4,
      updatedAt: new Date().toISOString(),
      branches: ["main", "develop", "fix/login-mobile", "feat/dark-mode", "fix/header-style"],
      files: [
        { name: "src", type: "folder", children: [
          { name: "components", type: "folder", children: [
             { name: "Button.jsx", type: "file", content: "export const Button = () => <button>Click me</button>;" },
             { name: "Header.jsx", type: "file", content: "export const Header = () => <header>Logo</header>;" }
          ]},
          { name: "App.jsx", type: "file", content: "import { Button } from './components/Button';\n\nexport default function App() {\n  return <div><Button /></div>;\n}" },
          { name: "index.css", type: "file", content: "body { background: #fff; }" }
        ]},
        { name: "package.json", type: "file", content: "{\n  \"name\": \"frontend\",\n  \"version\": \"1.0.0\"\n}" },
        { name: "README.md", type: "file", content: "# Frontend Monorepo\n\nThis is the main repository.\n\n## Getting Started\n\n1. `npm install`\n2. `npm start`\n\n## Features\n- React\n- Vite\n- Tailwind" }
      ]
    },
    {
      id: 2,
      name: "backend-api",
      description: "Go-based microservices API gateway.",
      visibility: "internal",
      stars: 8,
      forks: 1,
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      branches: ["main", "dev", "feat/auth-service"],
      files: [
        { name: "main.go", type: "file", content: "package main\n\nfunc main() {\n  println(\"Hello World\")\n}" },
        { name: "go.mod", type: "file", content: "module backend-api\n\ngo 1.20" }
      ]
    }
  ],
  pipelines: [
    {
      id: 101,
      projectId: 1,
      status: "success",
      branch: "main",
      commit: "a1b2c3d",
      message: "fix: update dependency versions",
      duration: "4m 12s",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      stages: [
        { id: 1, name: "build", status: "success", jobs: [{ id: 1, name: "build-app", status: "success", duration: "1m" }] },
        { id: 2, name: "test", status: "success", jobs: [{ id: 2, name: "unit-tests", status: "success", duration: "2m" }, { id: 3, name: "lint", status: "success", duration: "30s" }] },
        { id: 3, name: "deploy", status: "success", jobs: [{ id: 4, name: "deploy-staging", status: "success", duration: "42s" }] }
      ]
    },
    {
      id: 102,
      projectId: 1,
      status: "failed",
      branch: "feature/login-page",
      commit: "e5f6g7h",
      message: "feat: add login form",
      duration: "2m 10s",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      stages: [
        { id: 4, name: "build", status: "success", jobs: [{ id: 5, name: "build-app", status: "success", duration: "1m" }] },
        { id: 5, name: "test", status: "failed", jobs: [{ id: 6, name: "unit-tests", status: "failed", duration: "1m 10s", logs: "Error: Test failed in Login.test.js\nExpected true to be false." }] }
      ]
    },
    {
      id: 103,
      projectId: 1,
      status: "running",
      branch: "fix/header-style",
      commit: "i8j9k0l",
      message: "style: fix header padding",
      duration: "45s",
      createdAt: new Date().toISOString(),
      stages: [
        { id: 6, name: "build", status: "success", jobs: [{ id: 7, name: "build-app", status: "success", duration: "40s" }] },
        { id: 7, name: "test", status: "running", jobs: [{ id: 8, name: "unit-tests", status: "running", duration: "5s" }] },
        { id: 8, name: "deploy", status: "pending", jobs: [{ id: 9, name: "deploy-staging", status: "pending", duration: "0s" }] }
      ]
    },
    {
      id: 201,
      projectId: 2,
      status: "success",
      branch: "main",
      commit: "z9y8x7w",
      message: "init: project structure",
      duration: "1m 05s",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      stages: [
        { id: 21, name: "build", status: "success", jobs: [{ id: 21, name: "go-build", status: "success", duration: "45s" }] },
        { id: 22, name: "test", status: "success", jobs: [{ id: 22, name: "go-test", status: "success", duration: "20s" }] }
      ]
    },
    {
      id: 202,
      projectId: 2,
      status: "failed",
      branch: "feat/auth-service",
      commit: "b2c3d4e",
      message: "feat: add auth middleware",
      duration: "45s",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      stages: [
        { id: 23, name: "build", status: "success", jobs: [{ id: 23, name: "go-build", status: "success", duration: "40s" }] },
        { id: 24, name: "test", status: "failed", jobs: [{ id: 24, name: "go-test", status: "failed", duration: "5s", logs: "FAIL: TestAuthMiddleware\nExpected 401, got 200" }] }
      ]
    },
    {
      id: 203,
      projectId: 2,
      status: "running",
      branch: "main",
      commit: "f5g6h7i",
      message: "chore: update dependencies",
      duration: "10s",
      createdAt: new Date().toISOString(),
      stages: [
        { id: 25, name: "build", status: "running", jobs: [{ id: 25, name: "go-build", status: "running", duration: "10s" }] },
        { id: 26, name: "test", status: "pending", jobs: [{ id: 26, name: "go-test", status: "pending", duration: "0s" }] }
      ]
    }
  ],
  issues: [
    { id: 1, projectId: 1, title: "Login button not working on mobile", description: "The login button is unresponsive on iOS devices.", status: "open", labels: ["bug", "high-priority"], assignee: "Admin User" },
    { id: 2, projectId: 1, title: "Update documentation", description: "Readme needs to be updated with new build steps.", status: "closed", labels: ["docs"], assignee: "Admin User" },
    { id: 3, projectId: 1, title: "Refactor user context", description: "Move user state to global context.", status: "in_progress", labels: ["refactor"], assignee: null },
    { id: 4, projectId: 2, title: "Implement JWT Auth", description: "Add JWT token generation and validation.", status: "open", labels: ["feature", "security"], assignee: "Admin User" },
    { id: 5, projectId: 2, title: "Fix database connection timeout", description: "Connection drops after 5 minutes of inactivity.", status: "in_progress", labels: ["bug"], assignee: null },
    { id: 6, projectId: 2, title: "Setup CI pipeline", description: "Configure XitLab CI for Go project.", status: "closed", labels: ["devops"], assignee: "Admin User" }
  ],
  mergeRequests: [
    { id: 1, projectId: 1, title: "Resolve login issues", sourceBranch: "fix/login-mobile", targetBranch: "main", status: "open", author: "Admin User", createdAt: new Date().toISOString(), reviewers: [] },
    { id: 2, projectId: 1, title: "Add dark mode", sourceBranch: "feat/dark-mode", targetBranch: "main", status: "merged", author: "Admin User", createdAt: new Date(Date.now() - 86400000).toISOString(), reviewers: [] }
  ],
  registry: [
    { id: 1, projectId: 1, name: "frontend-monorepo/app", tags: ["latest", "v1.0.1", "v1.0.0"], size: "45MB", updatedAt: new Date().toISOString() },
    { id: 2, projectId: 2, name: "backend-api/server", tags: ["latest", "v0.1.0"], size: "12MB", updatedAt: new Date(Date.now() - 3600000).toISOString() }
  ],
  snippets: [
    { id: 1, title: "Useful Regex for Email", code: "const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;", language: "javascript", author: "Admin User" }
  ],
  wiki: [
    { id: 1, projectId: 1, title: "Home", content: "# Welcome to the Wiki\n\nThis is the home page of the project wiki." },
    { id: 2, projectId: 1, title: "Deployment Guide", content: "# Deployment\n\n1. Build\n2. Test\n3. Push" }
  ],
  vulnerabilities: [
    { id: 1, projectId: 1, severity: "critical", name: "SQL Injection in Login", status: "detected" },
    { id: 2, projectId: 1, severity: "medium", name: "Outdated Dependency: lodash", status: "resolved" },
    { id: 3, projectId: 1, severity: "low", name: "Missing X-Frame-Options Header", status: "detected" }
  ],
  milestones: [
    { id: 1, projectId: 1, title: "v1.0 Launch", dueDate: "2024-12-31", progress: 75 }
  ],
  releases: [
    { id: 1, projectId: 1, tagName: "v1.0.0", name: "Initial Release", description: "First major release with all core features.", createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), author: "Admin User" }
  ]
});

// Keep backward-compatible named export
export const INITIAL_STATE = getDefaultData();
