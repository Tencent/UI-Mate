export function getSessionId() {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('vercel_mock_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('vercel_mock_sid') || null;
}

export function createInitialData() {
  const now = new Date();
  const d = (daysBack, hoursBack = 0) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - daysBack);
    dt.setHours(dt.getHours() - hoursBack);
    return dt.toISOString();
  };

  const projects = [
    {
      id: 'prj_001',
      name: 'my-nextjs-app',
      slug: 'my-nextjs-app',
      framework: 'nextjs',
      gitRepo: {
        provider: 'github',
        owner: 'alexjohnson',
        name: 'my-nextjs-app',
        url: 'https://github.com/alexjohnson/my-nextjs-app',
        branch: 'main'
      },
      productionUrl: 'my-nextjs-app.vercel.app',
      customDomains: ['myapp.com', 'www.myapp.com'],
      latestDeployment: 'dpl_001',
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: d(0),
      buildCommand: 'next build',
      outputDirectory: '.next',
      installCommand: 'npm install',
      rootDirectory: null,
      nodeVersion: '20.x',
      productionBranch: 'main',
      autoDeployEnabled: true,
      screenshot: null,
      isPaused: false
    },
    {
      id: 'prj_002',
      name: 'docs-site',
      slug: 'docs-site',
      framework: 'astro',
      gitRepo: {
        provider: 'github',
        owner: 'alexjohnson',
        name: 'docs-site',
        url: 'https://github.com/alexjohnson/docs-site',
        branch: 'main'
      },
      productionUrl: 'docs-site.vercel.app',
      customDomains: ['docs.acme.dev'],
      latestDeployment: 'dpl_007',
      createdAt: '2024-03-20T11:00:00Z',
      updatedAt: d(1),
      buildCommand: 'astro build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      rootDirectory: null,
      nodeVersion: '20.x',
      productionBranch: 'main',
      autoDeployEnabled: true,
      screenshot: null,
      isPaused: false
    },
    {
      id: 'prj_003',
      name: 'api-gateway',
      slug: 'api-gateway',
      framework: 'vite',
      gitRepo: {
        provider: 'gitlab',
        owner: 'acme-inc',
        name: 'api-gateway',
        url: 'https://gitlab.com/acme-inc/api-gateway',
        branch: 'main'
      },
      productionUrl: 'api-gateway.vercel.app',
      customDomains: ['api.acme.dev'],
      latestDeployment: 'dpl_011',
      createdAt: '2024-05-15T09:00:00Z',
      updatedAt: d(2),
      buildCommand: 'vite build',
      outputDirectory: 'dist',
      installCommand: 'npm install',
      rootDirectory: null,
      nodeVersion: '20.x',
      productionBranch: 'main',
      autoDeployEnabled: true,
      screenshot: null,
      isPaused: false
    },
    {
      id: 'prj_004',
      name: 'marketing-site',
      slug: 'marketing-site',
      framework: 'nuxt',
      gitRepo: {
        provider: 'github',
        owner: 'alexjohnson',
        name: 'marketing-site',
        url: 'https://github.com/alexjohnson/marketing-site',
        branch: 'main'
      },
      productionUrl: 'marketing-site.vercel.app',
      customDomains: ['staging.acme.dev'],
      latestDeployment: 'dpl_014',
      createdAt: '2024-07-01T16:00:00Z',
      updatedAt: d(0, 2),
      buildCommand: 'nuxt build',
      outputDirectory: '.output',
      installCommand: 'npm install',
      rootDirectory: null,
      nodeVersion: '20.x',
      productionBranch: 'main',
      autoDeployEnabled: true,
      screenshot: null,
      isPaused: false
    },
    {
      id: 'prj_005',
      name: 'internal-tools',
      slug: 'internal-tools',
      framework: 'sveltekit',
      gitRepo: {
        provider: 'github',
        owner: 'alexjohnson',
        name: 'internal-tools',
        url: 'https://github.com/alexjohnson/internal-tools',
        branch: 'main'
      },
      productionUrl: 'internal-tools.vercel.app',
      customDomains: [],
      latestDeployment: 'dpl_018',
      createdAt: '2024-09-10T13:00:00Z',
      updatedAt: d(0, 5),
      buildCommand: 'vite build',
      outputDirectory: 'build',
      installCommand: 'npm install',
      rootDirectory: null,
      nodeVersion: '20.x',
      productionBranch: 'main',
      autoDeployEnabled: true,
      screenshot: null,
      isPaused: false
    }
  ];

  const deployments = [
    // prj_001 my-nextjs-app (6 deployments)
    {
      id: 'dpl_001',
      projectId: 'prj_001',
      url: 'my-nextjs-app-a1b2c3d.vercel.app',
      productionUrl: 'my-nextjs-app.vercel.app',
      status: 'READY',
      environment: 'production',
      git: { branch: 'main', commitSha: 'a1b2c3d', commitMessage: 'feat: add user dashboard page', author: 'alexjohnson' },
      buildDuration: 45,
      framework: 'nextjs',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 42, serverlessFunctions: 8, edgeFunctions: 2, totalSize: '12.4 MB' },
      buildLogs: [
        { timestamp: d(0, 0) + '', text: 'Cloning github.com/alexjohnson/my-nextjs-app (Branch: main, Commit: a1b2c3d)' },
        { timestamp: d(0, 0) + '', text: 'Cloning completed: 1.234s' },
        { timestamp: d(0, 0) + '', text: 'Installing dependencies...' },
        { timestamp: d(0, 0) + '', text: 'npm warn deprecated some-package@1.0.0: Use new-package instead' },
        { timestamp: d(0, 0) + '', text: 'Dependencies installed: 13.421s' },
        { timestamp: d(0, 0) + '', text: 'Running build command: next build' },
        { timestamp: d(0, 0) + '', text: 'Creating an optimized production build...' },
        { timestamp: d(0, 0) + '', text: 'Route (app)                    Size     First Load JS' },
        { timestamp: d(0, 0) + '', text: '├ ○ /                          5.2 kB   89.1 kB' },
        { timestamp: d(0, 0) + '', text: '├ ○ /dashboard                 12.1 kB  96.0 kB' },
        { timestamp: d(0, 0) + '', text: 'Build completed in 45s' },
        { timestamp: d(0, 0) + '', text: 'Deploying outputs... Deployment ready!' }
      ],
      createdAt: d(0),
      readyAt: d(0),
      creatorId: 'user_01'
    },
    {
      id: 'dpl_002',
      projectId: 'prj_001',
      url: 'my-nextjs-app-f4e5d6c.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'feat/dark-mode', commitSha: 'f4e5d6c', commitMessage: 'feat: implement dark mode toggle', author: 'sarahchen' },
      buildDuration: 38,
      framework: 'nextjs',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 42, serverlessFunctions: 8, edgeFunctions: 2, totalSize: '12.2 MB' },
      buildLogs: [
        { timestamp: d(1) + '', text: 'Cloning github.com/alexjohnson/my-nextjs-app (Branch: feat/dark-mode, Commit: f4e5d6c)' },
        { timestamp: d(1) + '', text: 'Installing dependencies...' },
        { timestamp: d(1) + '', text: 'Running build command: next build' },
        { timestamp: d(1) + '', text: 'Creating an optimized production build...' },
        { timestamp: d(1) + '', text: 'Build completed in 38s' },
        { timestamp: d(1) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(1),
      readyAt: d(1),
      creatorId: 'user_02'
    },
    {
      id: 'dpl_003',
      projectId: 'prj_001',
      url: 'my-nextjs-app-b7c8d9e.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'fix/navbar', commitSha: 'b7c8d9e', commitMessage: 'fix: responsive navbar on mobile', author: 'marcusw' },
      buildDuration: 42,
      framework: 'nextjs',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 42, serverlessFunctions: 8, edgeFunctions: 2, totalSize: '12.3 MB' },
      buildLogs: [
        { timestamp: d(2) + '', text: 'Cloning github.com/alexjohnson/my-nextjs-app (Branch: fix/navbar, Commit: b7c8d9e)' },
        { timestamp: d(2) + '', text: 'Installing dependencies...' },
        { timestamp: d(2) + '', text: 'Running build command: next build' },
        { timestamp: d(2) + '', text: 'Build completed in 42s' },
        { timestamp: d(2) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(2),
      readyAt: d(2),
      creatorId: 'user_03'
    },
    {
      id: 'dpl_004',
      projectId: 'prj_001',
      url: 'my-nextjs-app-c1d2e3f.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'chore/deps', commitSha: 'c1d2e3f', commitMessage: 'chore: update dependencies to latest', author: 'alexjohnson' },
      buildDuration: 51,
      framework: 'nextjs',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 40, serverlessFunctions: 8, edgeFunctions: 2, totalSize: '11.9 MB' },
      buildLogs: [
        { timestamp: d(3) + '', text: 'Cloning github.com/alexjohnson/my-nextjs-app' },
        { timestamp: d(3) + '', text: 'Installing dependencies...' },
        { timestamp: d(3) + '', text: 'npm warn deprecated old-package@2.1.0' },
        { timestamp: d(3) + '', text: 'Running build command: next build' },
        { timestamp: d(3) + '', text: 'Build completed in 51s' },
        { timestamp: d(3) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(3),
      readyAt: d(3),
      creatorId: 'user_01'
    },
    {
      id: 'dpl_005',
      projectId: 'prj_001',
      url: 'my-nextjs-app-d4e5f6a.vercel.app',
      productionUrl: null,
      status: 'BUILDING',
      environment: 'preview',
      git: { branch: 'feat/analytics', commitSha: 'd4e5f6a', commitMessage: 'feat: integrate analytics dashboard', author: 'priyap' },
      buildDuration: null,
      framework: 'nextjs',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: null,
      buildLogs: [
        { timestamp: d(0, 1) + '', text: 'Cloning github.com/alexjohnson/my-nextjs-app (Branch: feat/analytics, Commit: d4e5f6a)' },
        { timestamp: d(0, 1) + '', text: 'Installing dependencies...' },
        { timestamp: d(0, 1) + '', text: 'Running build command: next build' },
        { timestamp: d(0, 1) + '', text: 'Creating an optimized production build...' }
      ],
      createdAt: d(0, 1),
      readyAt: null,
      creatorId: 'user_04'
    },
    {
      id: 'dpl_006',
      projectId: 'prj_001',
      url: 'my-nextjs-app-e7f8a9b.vercel.app',
      productionUrl: null,
      status: 'CANCELED',
      environment: 'preview',
      git: { branch: 'experiment/new-layout', commitSha: 'e7f8a9b', commitMessage: 'experiment: trying new layout approach', author: 'sarahchen' },
      buildDuration: null,
      framework: 'nextjs',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: null,
      buildLogs: [
        { timestamp: d(5) + '', text: 'Cloning github.com/alexjohnson/my-nextjs-app' },
        { timestamp: d(5) + '', text: 'Installing dependencies...' },
        { timestamp: d(5) + '', text: 'Build canceled by user' }
      ],
      createdAt: d(5),
      readyAt: null,
      creatorId: 'user_02'
    },

    // prj_002 docs-site (4 deployments)
    {
      id: 'dpl_007',
      projectId: 'prj_002',
      url: 'docs-site-a2b3c4d.vercel.app',
      productionUrl: 'docs-site.vercel.app',
      status: 'READY',
      environment: 'production',
      git: { branch: 'main', commitSha: 'a2b3c4d', commitMessage: 'docs: add API reference section', author: 'sarahchen' },
      buildDuration: 28,
      framework: 'astro',
      nodeVersion: '20.x',
      regions: ['iad1', 'sfo1'],
      output: { staticFiles: 120, serverlessFunctions: 0, edgeFunctions: 1, totalSize: '8.7 MB' },
      buildLogs: [
        { timestamp: d(1) + '', text: 'Cloning github.com/alexjohnson/docs-site (Branch: main, Commit: a2b3c4d)' },
        { timestamp: d(1) + '', text: 'Installing dependencies...' },
        { timestamp: d(1) + '', text: 'Running build command: astro build' },
        { timestamp: d(1) + '', text: 'Building static pages...' },
        { timestamp: d(1) + '', text: '✓ 84 pages generated' },
        { timestamp: d(1) + '', text: 'Build completed in 28s' },
        { timestamp: d(1) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(1),
      readyAt: d(1),
      creatorId: 'user_02'
    },
    {
      id: 'dpl_008',
      projectId: 'prj_002',
      url: 'docs-site-b3c4d5e.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'feat/search', commitSha: 'b3c4d5e', commitMessage: 'feat: add full-text search to docs', author: 'marcusw' },
      buildDuration: 31,
      framework: 'astro',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 121, serverlessFunctions: 1, edgeFunctions: 1, totalSize: '9.1 MB' },
      buildLogs: [
        { timestamp: d(2) + '', text: 'Cloning github.com/alexjohnson/docs-site' },
        { timestamp: d(2) + '', text: 'Installing dependencies...' },
        { timestamp: d(2) + '', text: 'Running build command: astro build' },
        { timestamp: d(2) + '', text: 'Build completed in 31s' },
        { timestamp: d(2) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(2),
      readyAt: d(2),
      creatorId: 'user_03'
    },
    {
      id: 'dpl_009',
      projectId: 'prj_002',
      url: 'docs-site-c4d5e6f.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'fix/broken-links', commitSha: 'c4d5e6f', commitMessage: 'fix: repair broken links in sidebar', author: 'priyap' },
      buildDuration: 25,
      framework: 'astro',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 120, serverlessFunctions: 0, edgeFunctions: 1, totalSize: '8.7 MB' },
      buildLogs: [
        { timestamp: d(3) + '', text: 'Cloning github.com/alexjohnson/docs-site' },
        { timestamp: d(3) + '', text: 'Running build command: astro build' },
        { timestamp: d(3) + '', text: 'Build completed in 25s' },
        { timestamp: d(3) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(3),
      readyAt: d(3),
      creatorId: 'user_04'
    },
    {
      id: 'dpl_010',
      projectId: 'prj_002',
      url: 'docs-site-d5e6f7a.vercel.app',
      productionUrl: null,
      status: 'CANCELED',
      environment: 'preview',
      git: { branch: 'refactor/components', commitSha: 'd5e6f7a', commitMessage: 'refactor: split header into smaller components', author: 'sarahchen' },
      buildDuration: null,
      framework: 'astro',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: null,
      buildLogs: [
        { timestamp: d(4) + '', text: 'Cloning github.com/alexjohnson/docs-site' },
        { timestamp: d(4) + '', text: 'Build canceled by user' }
      ],
      createdAt: d(4),
      readyAt: null,
      creatorId: 'user_02'
    },

    // prj_003 api-gateway (3 deployments)
    {
      id: 'dpl_011',
      projectId: 'prj_003',
      url: 'api-gateway-e6f7a8b.vercel.app',
      productionUrl: 'api-gateway.vercel.app',
      status: 'READY',
      environment: 'production',
      git: { branch: 'main', commitSha: 'e6f7a8b', commitMessage: 'feat: add rate limiting middleware', author: 'marcusw' },
      buildDuration: 35,
      framework: 'vite',
      nodeVersion: '20.x',
      regions: ['iad1', 'cdg1'],
      output: { staticFiles: 15, serverlessFunctions: 12, edgeFunctions: 4, totalSize: '6.2 MB' },
      buildLogs: [
        { timestamp: d(2) + '', text: 'Cloning gitlab.com/acme-inc/api-gateway (Branch: main, Commit: e6f7a8b)' },
        { timestamp: d(2) + '', text: 'Installing dependencies...' },
        { timestamp: d(2) + '', text: 'Running build command: vite build' },
        { timestamp: d(2) + '', text: '✓ built in 35s' },
        { timestamp: d(2) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(2),
      readyAt: d(2),
      creatorId: 'user_03'
    },
    {
      id: 'dpl_012',
      projectId: 'prj_003',
      url: 'api-gateway-f7a8b9c.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'feat/oauth', commitSha: 'f7a8b9c', commitMessage: 'feat: implement OAuth 2.0 flow', author: 'priyap' },
      buildDuration: 40,
      framework: 'vite',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 15, serverlessFunctions: 14, edgeFunctions: 4, totalSize: '6.8 MB' },
      buildLogs: [
        { timestamp: d(3) + '', text: 'Cloning gitlab.com/acme-inc/api-gateway' },
        { timestamp: d(3) + '', text: 'Running build command: vite build' },
        { timestamp: d(3) + '', text: 'Build completed in 40s' },
        { timestamp: d(3) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(3),
      readyAt: d(3),
      creatorId: 'user_04'
    },
    {
      id: 'dpl_013',
      projectId: 'prj_003',
      url: 'api-gateway-a9b0c1d.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'fix/cors-headers', commitSha: 'a9b0c1d', commitMessage: 'fix: correct CORS headers for cross-origin requests', author: 'marcusw' },
      buildDuration: 32,
      framework: 'vite',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 15, serverlessFunctions: 12, edgeFunctions: 4, totalSize: '6.1 MB' },
      buildLogs: [
        { timestamp: d(4) + '', text: 'Cloning gitlab.com/acme-inc/api-gateway' },
        { timestamp: d(4) + '', text: 'Running build command: vite build' },
        { timestamp: d(4) + '', text: 'Build completed in 32s' },
        { timestamp: d(4) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(4),
      readyAt: d(4),
      creatorId: 'user_03'
    },

    // prj_004 marketing-site (4 deployments)
    {
      id: 'dpl_014',
      projectId: 'prj_004',
      url: 'marketing-site-b0c1d2e.vercel.app',
      productionUrl: null,
      status: 'BUILDING',
      environment: 'preview',
      git: { branch: 'feat/redesign', commitSha: 'b0c1d2e', commitMessage: 'feat: new landing page redesign with animations', author: 'sarahchen' },
      buildDuration: null,
      framework: 'nuxt',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: null,
      buildLogs: [
        { timestamp: d(0, 0) + '', text: 'Cloning github.com/alexjohnson/marketing-site (Branch: feat/redesign, Commit: b0c1d2e)' },
        { timestamp: d(0, 0) + '', text: 'Installing dependencies...' },
        { timestamp: d(0, 0) + '', text: 'Running build command: nuxt build' },
        { timestamp: d(0, 0) + '', text: 'Generating production bundle...' }
      ],
      createdAt: d(0, 0),
      readyAt: null,
      creatorId: 'user_02'
    },
    {
      id: 'dpl_015',
      projectId: 'prj_004',
      url: 'marketing-site-c1d2e3f.vercel.app',
      productionUrl: 'marketing-site.vercel.app',
      status: 'READY',
      environment: 'production',
      git: { branch: 'main', commitSha: 'c1d2e3f', commitMessage: 'feat: add case studies section', author: 'alexjohnson' },
      buildDuration: 62,
      framework: 'nuxt',
      nodeVersion: '20.x',
      regions: ['iad1', 'sfo1'],
      output: { staticFiles: 89, serverlessFunctions: 5, edgeFunctions: 1, totalSize: '18.3 MB' },
      buildLogs: [
        { timestamp: d(2) + '', text: 'Cloning github.com/alexjohnson/marketing-site' },
        { timestamp: d(2) + '', text: 'Installing dependencies...' },
        { timestamp: d(2) + '', text: 'Running build command: nuxt build' },
        { timestamp: d(2) + '', text: 'Building Nuxt app...' },
        { timestamp: d(2) + '', text: 'Build completed in 62s' },
        { timestamp: d(2) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(2),
      readyAt: d(2),
      creatorId: 'user_01'
    },
    {
      id: 'dpl_016',
      projectId: 'prj_004',
      url: 'marketing-site-d2e3f4a.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'feat/blog', commitSha: 'd2e3f4a', commitMessage: 'feat: add blog section with CMS integration', author: 'sarahchen' },
      buildDuration: 58,
      framework: 'nuxt',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 91, serverlessFunctions: 6, edgeFunctions: 1, totalSize: '19.1 MB' },
      buildLogs: [
        { timestamp: d(4) + '', text: 'Cloning github.com/alexjohnson/marketing-site' },
        { timestamp: d(4) + '', text: 'Running build command: nuxt build' },
        { timestamp: d(4) + '', text: 'Build completed in 58s' },
        { timestamp: d(4) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(4),
      readyAt: d(4),
      creatorId: 'user_02'
    },
    {
      id: 'dpl_017',
      projectId: 'prj_004',
      url: 'marketing-site-e3f4a5b.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'fix/seo-meta', commitSha: 'e3f4a5b', commitMessage: 'fix: add proper meta tags for SEO', author: 'priyap' },
      buildDuration: 55,
      framework: 'nuxt',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 89, serverlessFunctions: 5, edgeFunctions: 1, totalSize: '18.2 MB' },
      buildLogs: [
        { timestamp: d(5) + '', text: 'Cloning github.com/alexjohnson/marketing-site' },
        { timestamp: d(5) + '', text: 'Running build command: nuxt build' },
        { timestamp: d(5) + '', text: 'Build completed in 55s' },
        { timestamp: d(5) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(5),
      readyAt: d(5),
      creatorId: 'user_04'
    },

    // prj_005 internal-tools (3 deployments)
    {
      id: 'dpl_018',
      projectId: 'prj_005',
      url: 'internal-tools-f4a5b6c.vercel.app',
      productionUrl: 'internal-tools.vercel.app',
      status: 'ERROR',
      environment: 'production',
      git: { branch: 'main', commitSha: 'f4a5b6c', commitMessage: 'feat: migrate to new database schema', author: 'marcusw' },
      buildDuration: 18,
      framework: 'sveltekit',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: null,
      buildLogs: [
        { timestamp: d(0, 3) + '', text: 'Cloning github.com/alexjohnson/internal-tools (Branch: main, Commit: f4a5b6c)' },
        { timestamp: d(0, 3) + '', text: 'Installing dependencies...' },
        { timestamp: d(0, 3) + '', text: 'Running build command: vite build' },
        { timestamp: d(0, 3) + '', text: 'Error: Cannot find module \'@prisma/client\'' },
        { timestamp: d(0, 3) + '', text: 'Error: Build failed with exit code 1' },
        { timestamp: d(0, 3) + '', text: 'Deployment failed after 18s' }
      ],
      createdAt: d(0, 3),
      readyAt: null,
      creatorId: 'user_03'
    },
    {
      id: 'dpl_019',
      projectId: 'prj_005',
      url: 'internal-tools-a5b6c7d.vercel.app',
      productionUrl: 'internal-tools.vercel.app',
      status: 'READY',
      environment: 'production',
      git: { branch: 'main', commitSha: 'a5b6c7d', commitMessage: 'chore: update Prisma to v5.10', author: 'alexjohnson' },
      buildDuration: 72,
      framework: 'sveltekit',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 28, serverlessFunctions: 15, edgeFunctions: 0, totalSize: '9.8 MB' },
      buildLogs: [
        { timestamp: d(3) + '', text: 'Cloning github.com/alexjohnson/internal-tools' },
        { timestamp: d(3) + '', text: 'Installing dependencies...' },
        { timestamp: d(3) + '', text: 'Running build command: vite build' },
        { timestamp: d(3) + '', text: 'Generating Prisma client...' },
        { timestamp: d(3) + '', text: 'Build completed in 72s' },
        { timestamp: d(3) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(3),
      readyAt: d(3),
      creatorId: 'user_01'
    },
    {
      id: 'dpl_020',
      projectId: 'prj_005',
      url: 'internal-tools-b6c7d8e.vercel.app',
      productionUrl: null,
      status: 'READY',
      environment: 'preview',
      git: { branch: 'feat/reporting', commitSha: 'b6c7d8e', commitMessage: 'feat: add monthly reporting dashboard', author: 'priyap' },
      buildDuration: 68,
      framework: 'sveltekit',
      nodeVersion: '20.x',
      regions: ['iad1'],
      output: { staticFiles: 30, serverlessFunctions: 17, edgeFunctions: 0, totalSize: '10.4 MB' },
      buildLogs: [
        { timestamp: d(6) + '', text: 'Cloning github.com/alexjohnson/internal-tools' },
        { timestamp: d(6) + '', text: 'Installing dependencies...' },
        { timestamp: d(6) + '', text: 'Running build command: vite build' },
        { timestamp: d(6) + '', text: 'Build completed in 68s' },
        { timestamp: d(6) + '', text: 'Deployment ready!' }
      ],
      createdAt: d(6),
      readyAt: d(6),
      creatorId: 'user_04'
    }
  ];

  const domains = [
    {
      id: 'dom_001',
      projectId: 'prj_001',
      name: 'myapp.com',
      apexDomain: 'myapp.com',
      verified: true,
      sslStatus: 'active',
      dnsRecords: [
        { type: 'A', name: '@', value: '76.76.21.21' },
        { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com' }
      ],
      redirectTo: null,
      createdAt: '2024-02-01T10:00:00Z'
    },
    {
      id: 'dom_002',
      projectId: 'prj_001',
      name: 'www.myapp.com',
      apexDomain: 'myapp.com',
      verified: true,
      sslStatus: 'active',
      dnsRecords: [
        { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com' }
      ],
      redirectTo: 'myapp.com',
      createdAt: '2024-02-01T10:05:00Z'
    },
    {
      id: 'dom_003',
      projectId: 'prj_002',
      name: 'docs.acme.dev',
      apexDomain: 'acme.dev',
      verified: true,
      sslStatus: 'active',
      dnsRecords: [
        { type: 'CNAME', name: 'docs', value: 'cname.vercel-dns.com' }
      ],
      redirectTo: null,
      createdAt: '2024-04-10T09:00:00Z'
    },
    {
      id: 'dom_004',
      projectId: 'prj_003',
      name: 'api.acme.dev',
      apexDomain: 'acme.dev',
      verified: true,
      sslStatus: 'active',
      dnsRecords: [
        { type: 'CNAME', name: 'api', value: 'cname.vercel-dns.com' }
      ],
      redirectTo: null,
      createdAt: '2024-06-20T14:00:00Z'
    },
    {
      id: 'dom_005',
      projectId: 'prj_004',
      name: 'staging.acme.dev',
      apexDomain: 'acme.dev',
      verified: false,
      sslStatus: 'pending',
      dnsRecords: [
        { type: 'CNAME', name: 'staging', value: 'cname.vercel-dns.com' }
      ],
      redirectTo: null,
      createdAt: d(1)
    }
  ];

  const environmentVariables = [
    { id: 'env_001', projectId: 'prj_001', key: 'DATABASE_URL', value: 'postgresql://user:pass@db.example.com/mydb', target: ['production'], type: 'encrypted', gitBranch: null, createdAt: '2024-03-10T08:00:00Z', updatedAt: '2024-03-10T08:00:00Z' },
    { id: 'env_002', projectId: 'prj_001', key: 'NEXT_PUBLIC_API_URL', value: 'https://api.acme.dev', target: ['production', 'preview', 'development'], type: 'plain', gitBranch: null, createdAt: '2024-03-10T08:05:00Z', updatedAt: '2024-03-10T08:05:00Z' },
    { id: 'env_003', projectId: 'prj_001', key: 'STRIPE_SECRET_KEY', value: 'sk_test_abcdefghijklmnopqrstuvwxyz', target: ['production'], type: 'encrypted', gitBranch: null, createdAt: '2024-03-15T10:00:00Z', updatedAt: '2024-03-15T10:00:00Z' },
    { id: 'env_004', projectId: 'prj_001', key: 'NEXT_PUBLIC_GA_ID', value: 'G-ABCDEFGHIJ', target: ['production', 'preview'], type: 'plain', gitBranch: null, createdAt: '2024-04-01T09:00:00Z', updatedAt: '2024-04-01T09:00:00Z' },
    { id: 'env_005', projectId: 'prj_002', key: 'CONTENT_API_KEY', value: 'ctf-api-key-xyz123abc456', target: ['production', 'preview', 'development'], type: 'encrypted', gitBranch: null, createdAt: '2024-05-01T11:00:00Z', updatedAt: '2024-05-01T11:00:00Z' },
    { id: 'env_006', projectId: 'prj_002', key: 'SITE_URL', value: 'https://docs.acme.dev', target: ['production'], type: 'plain', gitBranch: null, createdAt: '2024-05-01T11:05:00Z', updatedAt: '2024-05-01T11:05:00Z' },
    { id: 'env_007', projectId: 'prj_003', key: 'API_SECRET', value: 'secret_key_9xT7qR2mL5nP8wS4', target: ['production'], type: 'encrypted', gitBranch: null, createdAt: '2024-07-10T08:00:00Z', updatedAt: '2024-07-10T08:00:00Z' },
    { id: 'env_008', projectId: 'prj_003', key: 'REDIS_URL', value: 'redis://default:pass@redis.example.com:6379', target: ['production', 'preview'], type: 'encrypted', gitBranch: null, createdAt: '2024-07-10T08:10:00Z', updatedAt: '2024-07-10T08:10:00Z' },
    { id: 'env_009', projectId: 'prj_005', key: 'DATABASE_URL', value: 'postgresql://admin:secure@internal-db.acme.dev/tools', target: ['production', 'preview', 'development'], type: 'encrypted', gitBranch: null, createdAt: '2024-10-01T09:00:00Z', updatedAt: '2024-10-01T09:00:00Z' },
    { id: 'env_010', projectId: 'prj_005', key: 'DEBUG_MODE', value: 'true', target: ['development'], type: 'plain', gitBranch: null, createdAt: '2024-10-01T09:15:00Z', updatedAt: '2024-10-01T09:15:00Z' }
  ];

  const teamMembers = [
    { id: 'user_01', name: 'Alex Johnson', username: 'alexjohnson', email: 'alex@acme.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', role: 'owner', joinedAt: '2023-06-15T10:00:00Z' },
    { id: 'user_02', name: 'Sarah Chen', username: 'sarahchen', email: 'sarah@acme.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', role: 'member', joinedAt: '2023-08-20T14:00:00Z' },
    { id: 'user_03', name: 'Marcus Williams', username: 'marcusw', email: 'marcus@acme.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', role: 'developer', joinedAt: '2024-01-10T09:00:00Z' },
    { id: 'user_04', name: 'Priya Patel', username: 'priyap', email: 'priya@acme.dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', role: 'developer', joinedAt: '2024-05-05T11:00:00Z' }
  ];

  const activityEvents = [
    { id: 'evt_001', type: 'deployment.ready', description: 'Deployed my-nextjs-app to production', userId: 'user_01', userName: 'Alex Johnson', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', projectId: 'prj_001', projectName: 'my-nextjs-app', metadata: { deploymentId: 'dpl_001' }, createdAt: d(0) },
    { id: 'evt_002', type: 'deployment.created', description: 'Triggered deployment for my-nextjs-app (feat/analytics branch)', userId: 'user_04', userName: 'Priya Patel', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', projectId: 'prj_001', projectName: 'my-nextjs-app', metadata: { deploymentId: 'dpl_005' }, createdAt: d(0, 1) },
    { id: 'evt_003', type: 'deployment.error', description: 'Deployment failed for internal-tools (main branch)', userId: 'user_03', userName: 'Marcus Williams', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', projectId: 'prj_005', projectName: 'internal-tools', metadata: { deploymentId: 'dpl_018' }, createdAt: d(0, 3) },
    { id: 'evt_004', type: 'deployment.created', description: 'Triggered build for marketing-site (feat/redesign branch)', userId: 'user_02', userName: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', projectId: 'prj_004', projectName: 'marketing-site', metadata: { deploymentId: 'dpl_014' }, createdAt: d(0, 0) },
    { id: 'evt_005', type: 'deployment.ready', description: 'Deployed docs-site (feat/search branch) to preview', userId: 'user_02', userName: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', projectId: 'prj_002', projectName: 'docs-site', metadata: { deploymentId: 'dpl_007' }, createdAt: d(1) },
    { id: 'evt_006', type: 'domain.created', description: 'Added domain staging.acme.dev to marketing-site', userId: 'user_01', userName: 'Alex Johnson', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', projectId: 'prj_004', projectName: 'marketing-site', metadata: { domain: 'staging.acme.dev' }, createdAt: d(1) },
    { id: 'evt_007', type: 'deployment.ready', description: 'Deployed my-nextjs-app (feat/dark-mode) to preview', userId: 'user_02', userName: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', projectId: 'prj_001', projectName: 'my-nextjs-app', metadata: { deploymentId: 'dpl_002' }, createdAt: d(1) },
    { id: 'evt_008', type: 'deployment.ready', description: 'Deployed api-gateway to production', userId: 'user_03', userName: 'Marcus Williams', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', projectId: 'prj_003', projectName: 'api-gateway', metadata: { deploymentId: 'dpl_011' }, createdAt: d(2) },
    { id: 'evt_009', type: 'deployment.ready', description: 'Deployed my-nextjs-app (fix/navbar) to preview', userId: 'user_03', userName: 'Marcus Williams', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', projectId: 'prj_001', projectName: 'my-nextjs-app', metadata: { deploymentId: 'dpl_003' }, createdAt: d(2) },
    { id: 'evt_010', type: 'deployment.ready', description: 'Deployed marketing-site to production', userId: 'user_01', userName: 'Alex Johnson', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', projectId: 'prj_004', projectName: 'marketing-site', metadata: { deploymentId: 'dpl_015' }, createdAt: d(2) },
    { id: 'evt_011', type: 'env-variable.created', description: 'Added environment variable REDIS_URL to api-gateway', userId: 'user_03', userName: 'Marcus Williams', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', projectId: 'prj_003', projectName: 'api-gateway', metadata: { key: 'REDIS_URL' }, createdAt: d(3) },
    { id: 'evt_012', type: 'deployment.ready', description: 'Deployed my-nextjs-app (chore/deps) to preview', userId: 'user_01', userName: 'Alex Johnson', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', projectId: 'prj_001', projectName: 'my-nextjs-app', metadata: { deploymentId: 'dpl_004' }, createdAt: d(3) },
    { id: 'evt_013', type: 'deployment.ready', description: 'Deployed internal-tools to production', userId: 'user_01', userName: 'Alex Johnson', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', projectId: 'prj_005', projectName: 'internal-tools', metadata: { deploymentId: 'dpl_019' }, createdAt: d(3) },
    { id: 'evt_014', type: 'deployment.ready', description: 'Deployed api-gateway (feat/oauth) to preview', userId: 'user_04', userName: 'Priya Patel', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', projectId: 'prj_003', projectName: 'api-gateway', metadata: { deploymentId: 'dpl_012' }, createdAt: d(3) },
    { id: 'evt_015', type: 'deployment.canceled', description: 'Canceled deployment for docs-site (refactor/components)', userId: 'user_02', userName: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', projectId: 'prj_002', projectName: 'docs-site', metadata: { deploymentId: 'dpl_010' }, createdAt: d(4) },
    { id: 'evt_016', type: 'deployment.ready', description: 'Deployed marketing-site (feat/blog) to preview', userId: 'user_02', userName: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', projectId: 'prj_004', projectName: 'marketing-site', metadata: { deploymentId: 'dpl_016' }, createdAt: d(4) },
    { id: 'evt_017', type: 'domain.verified', description: 'Domain api.acme.dev verified successfully', userId: 'user_01', userName: 'Alex Johnson', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', projectId: 'prj_003', projectName: 'api-gateway', metadata: { domain: 'api.acme.dev' }, createdAt: d(5) },
    { id: 'evt_018', type: 'deployment.canceled', description: 'Canceled deployment for my-nextjs-app (experiment/new-layout)', userId: 'user_02', userName: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', projectId: 'prj_001', projectName: 'my-nextjs-app', metadata: { deploymentId: 'dpl_006' }, createdAt: d(5) },
    { id: 'evt_019', type: 'member.added', description: 'Priya Patel joined Acme Inc as developer', userId: 'user_01', userName: 'Alex Johnson', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', projectId: null, projectName: null, metadata: { memberId: 'user_04', role: 'developer' }, createdAt: d(6) },
    { id: 'evt_020', type: 'deployment.ready', description: 'Deployed internal-tools (feat/reporting) to preview', userId: 'user_04', userName: 'Priya Patel', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', projectId: 'prj_005', projectName: 'internal-tools', metadata: { deploymentId: 'dpl_020' }, createdAt: d(6) }
  ];

  const integrations = [
    { id: 'int_001', name: 'GitHub', slug: 'github', icon: 'github', description: 'Deploy from GitHub repositories with automatic deployments on push', installedAt: '2023-06-15T10:00:00Z', status: 'active', configuredProjects: ['prj_001', 'prj_002', 'prj_004', 'prj_005'] },
    { id: 'int_002', name: 'GitLab', slug: 'gitlab', icon: 'gitlab', description: 'Deploy from GitLab repositories and self-hosted GitLab instances', installedAt: '2024-05-15T09:00:00Z', status: 'active', configuredProjects: ['prj_003'] },
    { id: 'int_003', name: 'Xercel Analytics', slug: 'analytics', icon: 'analytics', description: 'Privacy-friendly analytics with real user monitoring', installedAt: '2024-02-10T11:00:00Z', status: 'active', configuredProjects: ['prj_001', 'prj_004'] },
    { id: 'int_004', name: 'Sentry', slug: 'sentry', icon: 'sentry', description: 'Error tracking and performance monitoring for your applications', installedAt: '2024-08-20T14:00:00Z', status: 'active', configuredProjects: ['prj_001'] }
  ];

  return {
    currentTeam: {
      id: 'team_abc123',
      name: 'Acme Inc',
      slug: 'acme-inc',
      avatar: null,
      plan: 'pro',
      createdAt: '2023-06-15T10:00:00Z'
    },
    currentUser: {
      id: 'user_01',
      name: 'Alex Johnson',
      username: 'alexjohnson',
      email: 'alex@acme.dev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      role: 'owner'
    },
    projects,
    deployments,
    domains,
    environmentVariables,
    teamMembers,
    activityEvents,
    integrations,
    ui: {
      sidebarCollapsed: false,
      activeProjectId: null,
      searchQuery: '',
      deploymentFilter: 'all',
      deploymentStatusFilter: 'all'
    }
  };
}

const STORAGE_KEY = 'vercel_mock_state';
const SESSION_FLAG_KEY = 'vercel_mock_session_initialized';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

let _saveTimer = null;
export function saveState(state) {
  try {
    // BUG-005 fix: Only persist initial_state on first load of each session.
    // Use sessionStorage flag to detect reloads vs fresh starts.
    const isFirstLoad = !sessionStorage.getItem(SESSION_FLAG_KEY);
    if (isFirstLoad) {
      sessionStorage.setItem(SESSION_FLAG_KEY, '1');
      // On first load, save as-is (initial tracks the true starting state)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      // On subsequent saves (state changes), preserve the stored initial_state
      const existing = loadState();
      const preserved = { initial: existing?.initial || state.initial, current: state.current };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preserved));
    }
  } catch (e) {
    console.warn('State save failed:', e.message);
  }
  const sid = getSessionId();
  if (sid) {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state: state.current }),
      }).catch(() => {});
    }, 300);
  }
}

export function deepDiff(initial, current, path = '') {
  const diff = {};
  const allKeys = new Set([...Object.keys(initial || {}), ...Object.keys(current || {})]);
  for (const key of allKeys) {
    const a = initial?.[key];
    const b = current?.[key];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diff[path ? `${path}.${key}` : key] = { from: a, to: b };
    }
  }
  return diff;
}
