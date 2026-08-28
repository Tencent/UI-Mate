// dataManager.js — Seed data for Xentry mock

export function createInitialData() {
  return {
    organization: {
      id: 'org-1',
      name: 'Empower Plant',
      slug: 'empower-plant',
      avatar: null,
      dateCreated: '2023-01-15T00:00:00Z',
      teams: ['team-1', 'team-2', 'team-3'],
      members: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
      projects: ['proj-1', 'proj-2', 'proj-3', 'proj-4']
    },

    currentUser: {
      id: 'user-1',
      name: 'Jane Schmidt',
      email: 'jane@empower-plant.io',
      avatar: null,
      role: 'Admin',
      teams: ['team-1', 'team-2'],
      dateJoined: '2023-01-15T00:00:00Z'
    },

    users: [
      { id: 'user-1', name: 'Jane Schmidt', email: 'jane@empower-plant.io', avatar: null, role: 'Admin', teams: ['team-1', 'team-2'], dateJoined: '2023-01-15T00:00:00Z' },
      { id: 'user-2', name: 'Keith Ryan', email: 'keith@empower-plant.io', avatar: null, role: 'Member', teams: ['team-1'], dateJoined: '2023-02-10T00:00:00Z' },
      { id: 'user-3', name: 'Maria Chen', email: 'maria@empower-plant.io', avatar: null, role: 'Manager', teams: ['team-2', 'team-3'], dateJoined: '2023-03-05T00:00:00Z' },
      { id: 'user-4', name: 'Alex Thompson', email: 'alex@empower-plant.io', avatar: null, role: 'Member', teams: ['team-1'], dateJoined: '2023-04-20T00:00:00Z' },
      { id: 'user-5', name: 'Sam Park', email: 'sam@empower-plant.io', avatar: null, role: 'Member', teams: ['team-3'], dateJoined: '2023-05-01T00:00:00Z' }
    ],

    teams: [
      { id: 'team-1', name: 'Frontend', slug: 'frontend', avatar: null, memberCount: 3, members: ['user-1', 'user-2', 'user-4'], projects: ['proj-1', 'proj-2'] },
      { id: 'team-2', name: 'Backend', slug: 'backend', avatar: null, memberCount: 2, members: ['user-1', 'user-3'], projects: ['proj-3'] },
      { id: 'team-3', name: 'Infrastructure', slug: 'infra', avatar: null, memberCount: 2, members: ['user-3', 'user-5'], projects: ['proj-4'] }
    ],

    projects: [
      {
        id: 'proj-1', name: 'javascript', slug: 'javascript',
        platform: 'javascript-react', color: '#F5B000',
        teams: ['team-1'], dateCreated: '2023-02-01T00:00:00Z',
        stats: { crashFreeSessions: 97.2, crashFreeUsers: 98.5, totalErrors24h: 342, totalTransactions24h: 15200 },
        latestRelease: 'rel-1', environments: ['production', 'staging', 'development']
      },
      {
        id: 'proj-2', name: 'react-app', slug: 'react-app',
        platform: 'javascript-react', color: '#E03E2F',
        teams: ['team-1'], dateCreated: '2023-03-15T00:00:00Z',
        stats: { crashFreeSessions: 99.1, crashFreeUsers: 99.6, totalErrors24h: 87, totalTransactions24h: 8900 },
        latestRelease: 'rel-2', environments: ['production', 'staging']
      },
      {
        id: 'proj-3', name: 'flask-api', slug: 'flask-api',
        platform: 'python-flask', color: '#33BF9E',
        teams: ['team-2'], dateCreated: '2023-02-20T00:00:00Z',
        stats: { crashFreeSessions: 95.8, crashFreeUsers: 97.1, totalErrors24h: 513, totalTransactions24h: 28400 },
        latestRelease: 'rel-3', environments: ['production', 'staging', 'development']
      },
      {
        id: 'proj-4', name: 'spring-boot-5', slug: 'spring-boot-5',
        platform: 'java-spring-boot', color: '#3B6ECC',
        teams: ['team-2', 'team-3'], dateCreated: '2023-04-01T00:00:00Z',
        stats: { crashFreeSessions: 98.9, crashFreeUsers: 99.2, totalErrors24h: 124, totalTransactions24h: 12100 },
        latestRelease: 'rel-4', environments: ['production', 'staging']
      }
    ],

    issues: [
      {
        id: 'issue-1', shortId: 'REACT-59F',
        title: 'TypeError', subtitle: "'NoneType' object has no attribute 'split'",
        culprit: 'app/components/smartSearchBar/utils.tsx in escapeTagValue',
        type: 'error', level: 'error', status: 'unresolved', priority: 'critical',
        isUnhandled: true, project: 'proj-1', assignee: 'user-2',
        firstSeen: '2024-12-20T08:30:00Z', lastSeen: '2025-04-09T14:22:00Z',
        count: 8300, userCount: 6600,
        stats14d: [120, 95, 140, 110, 200, 180, 150, 170, 190, 210, 230, 185, 160, 145],
        trend: 'escalating', events: ['event-1', 'event-2'],
        tags: {
          browser: { Chrome: 61, Firefox: 20, Safari: 15, Edge: 4 },
          os: { 'Mac OS X': 55, Windows: 35, Linux: 10 },
          environment: { production: 90, staging: 10 },
          handled: { yes: 30, no: 70 }, level: { error: 100 },
          release: { d66ac445f3b1: 60, a3bc88e12f4a: 40 }
        },
        metadata: { type: 'TypeError', value: "'NoneType' object has no attribute 'split'" }
      },
      {
        id: 'issue-2', shortId: 'JAVASCRIPT-3B2',
        title: 'ReferenceError', subtitle: 'Cannot access before initialization',
        culprit: 'src/hooks/useAuth.ts in validateSession',
        type: 'error', level: 'error', status: 'unresolved', priority: 'high',
        isUnhandled: true, project: 'proj-1', assignee: 'user-4',
        firstSeen: '2025-01-05T09:00:00Z', lastSeen: '2025-04-09T13:55:00Z',
        count: 4120, userCount: 2890,
        stats14d: [80, 110, 90, 130, 100, 120, 95, 88, 102, 115, 140, 130, 125, 118],
        trend: 'ongoing', events: ['event-3', 'event-4'],
        tags: {
          browser: { Chrome: 72, Firefox: 18, Safari: 10 },
          os: { 'Mac OS X': 45, Windows: 40, Linux: 15 },
          environment: { production: 85, staging: 15 },
          handled: { no: 100 }, level: { error: 100 },
          release: { d66ac445f3b1: 100 }
        },
        metadata: { type: 'ReferenceError', value: 'Cannot access before initialization' }
      },
      {
        id: 'issue-3', shortId: 'FLASK-API-A91',
        title: 'IntegrityError', subtitle: 'UNIQUE constraint failed: auth_user.username',
        culprit: 'flask_api/models/user.py in create_user',
        type: 'error', level: 'error', status: 'unresolved', priority: 'critical',
        isUnhandled: false, project: 'proj-3', assignee: 'user-3',
        firstSeen: '2025-02-10T11:00:00Z', lastSeen: '2025-04-09T12:30:00Z',
        count: 1240, userCount: 890,
        stats14d: [40, 35, 50, 45, 60, 55, 42, 38, 44, 52, 58, 63, 70, 80],
        trend: 'escalating', events: ['event-5', 'event-6'],
        tags: {
          browser: { 'N/A': 100 },
          os: { Linux: 95, Windows: 5 },
          environment: { production: 100 },
          handled: { yes: 100 }, level: { error: 100 },
          release: { a3bc88e12f4a: 100 }
        },
        metadata: { type: 'IntegrityError', value: 'UNIQUE constraint failed: auth_user.username' }
      },
      {
        id: 'issue-4', shortId: 'FLASK-API-D23',
        title: 'DatabaseError', subtitle: 'connection to server at "db-primary" (10.0.1.5) failed',
        culprit: 'flask_api/database/connection.py in get_connection',
        type: 'error', level: 'fatal', status: 'unresolved', priority: 'high',
        isUnhandled: true, project: 'proj-3', assignee: null,
        firstSeen: '2025-03-01T06:00:00Z', lastSeen: '2025-04-09T10:15:00Z',
        count: 562, userCount: 345,
        stats14d: [5, 3, 8, 12, 6, 9, 11, 14, 10, 8, 7, 9, 12, 15],
        trend: 'ongoing', events: ['event-7'],
        tags: {
          browser: { 'N/A': 100 },
          os: { Linux: 100 },
          environment: { production: 100 },
          handled: { no: 100 }, level: { fatal: 100 },
          release: { a3bc88e12f4a: 70, b5cd99f67e8a: 30 }
        },
        metadata: { type: 'DatabaseError', value: 'connection to server at "db-primary" failed' }
      },
      {
        id: 'issue-5', shortId: 'SPRING-F7C',
        title: 'RuntimeException', subtitle: 'NullPointerException at OrderService.processPayment',
        culprit: 'com.empowerplant.orders.OrderService.processPayment',
        type: 'error', level: 'error', status: 'unresolved', priority: 'high',
        isUnhandled: true, project: 'proj-4', assignee: 'user-5',
        firstSeen: '2025-01-20T14:00:00Z', lastSeen: '2025-04-09T09:45:00Z',
        count: 2876, userCount: 1923,
        stats14d: [90, 85, 100, 95, 110, 105, 120, 115, 100, 95, 88, 92, 98, 103],
        trend: 'ongoing', events: ['event-8'],
        tags: {
          browser: { 'N/A': 100 },
          os: { Linux: 70, Windows: 30 },
          environment: { production: 80, staging: 20 },
          handled: { no: 100 }, level: { error: 100 },
          release: { c4ef12a89b3d: 100 }
        },
        metadata: { type: 'RuntimeException', value: 'NullPointerException at OrderService.processPayment' }
      },
      {
        id: 'issue-6', shortId: 'REACT-APP-2E1',
        title: 'TypeError', subtitle: "Cannot read properties of undefined (reading 'map')",
        culprit: 'src/components/ProductList/index.jsx in ProductList',
        type: 'error', level: 'warning', status: 'unresolved', priority: 'medium',
        isUnhandled: false, project: 'proj-2', assignee: 'user-2',
        firstSeen: '2025-02-25T10:00:00Z', lastSeen: '2025-04-09T08:30:00Z',
        count: 734, userCount: 612,
        stats14d: [20, 25, 18, 30, 28, 22, 26, 24, 29, 31, 27, 23, 21, 19],
        trend: 'new', events: ['event-9'],
        tags: {
          browser: { Chrome: 80, Safari: 20 },
          os: { 'Mac OS X': 60, Windows: 30, iOS: 10 },
          environment: { production: 95, staging: 5 },
          handled: { yes: 100 }, level: { warning: 100 },
          release: { d66ac445f3b1: 100 }
        },
        metadata: { type: 'TypeError', value: "Cannot read properties of undefined (reading 'map')" }
      },
      {
        id: 'issue-7', shortId: 'FLASK-API-E55',
        title: 'N+1 Query Detected', subtitle: 'Performing 47 queries where 1 was expected',
        culprit: 'flask_api/api/products.py in get_product_list',
        type: 'performance', level: 'warning', status: 'unresolved', priority: 'medium',
        isUnhandled: false, project: 'proj-3', assignee: 'user-3',
        firstSeen: '2025-03-10T08:00:00Z', lastSeen: '2025-04-09T07:55:00Z',
        count: 15200, userCount: 8900,
        stats14d: [800, 850, 820, 900, 880, 950, 1000, 1100, 1050, 1080, 1150, 1200, 1100, 1080],
        trend: 'escalating', events: ['event-10'],
        tags: {
          browser: { 'N/A': 100 },
          os: { Linux: 100 },
          environment: { production: 100 },
          handled: { yes: 100 }, level: { warning: 100 },
          release: { a3bc88e12f4a: 100 }
        },
        metadata: { type: 'N+1 Query', value: 'Performing 47 queries where 1 was expected' }
      },
      {
        id: 'issue-8', shortId: 'SPRING-B88',
        title: 'Slow DB Query', subtitle: 'Query duration 12500ms exceeds threshold 1000ms',
        culprit: 'com.empowerplant.inventory.InventoryRepository.findAll',
        type: 'performance', level: 'warning', status: 'unresolved', priority: 'low',
        isUnhandled: false, project: 'proj-4', assignee: null,
        firstSeen: '2025-03-15T12:00:00Z', lastSeen: '2025-04-09T07:00:00Z',
        count: 3450, userCount: 0,
        stats14d: [150, 160, 155, 170, 175, 180, 190, 185, 200, 195, 205, 210, 220, 215],
        trend: 'escalating', events: ['event-11'],
        tags: {
          browser: { 'N/A': 100 },
          os: { Linux: 100 },
          environment: { production: 75, staging: 25 },
          handled: { yes: 100 }, level: { warning: 100 },
          release: { c4ef12a89b3d: 100 }
        },
        metadata: { type: 'Slow DB Query', value: 'Query duration 12500ms exceeds threshold 1000ms' }
      },
      {
        id: 'issue-9', shortId: 'JAVASCRIPT-7A4',
        title: '500 Internal Server Error', subtitle: 'POST /api/checkout failed with status 500',
        culprit: 'src/api/checkout.ts in submitOrder',
        type: 'error', level: 'error', status: 'unresolved', priority: 'medium',
        isUnhandled: true, project: 'proj-1', assignee: 'user-1',
        firstSeen: '2025-03-20T15:00:00Z', lastSeen: '2025-04-09T06:30:00Z',
        count: 892, userCount: 724,
        stats14d: [30, 35, 28, 40, 38, 42, 45, 50, 48, 52, 55, 60, 58, 62],
        trend: 'new', events: ['event-12'],
        tags: {
          browser: { Chrome: 65, Firefox: 25, Safari: 10 },
          os: { 'Mac OS X': 50, Windows: 35, Linux: 15 },
          environment: { production: 100 },
          handled: { no: 100 }, level: { error: 100 },
          release: { d66ac445f3b1: 60, a3bc88e12f4a: 40 }
        },
        metadata: { type: '500 Internal Server Error', value: 'POST /api/checkout failed with status 500' }
      },
      {
        id: 'issue-10', shortId: 'REACT-APP-F10',
        title: 'UnhandledPromiseRejectionWarning', subtitle: 'NetworkError: Failed to fetch',
        culprit: 'src/services/api.js in fetchWithRetry',
        type: 'error', level: 'warning', status: 'resolved', priority: 'low',
        isUnhandled: false, project: 'proj-2', assignee: 'user-2',
        firstSeen: '2024-11-10T10:00:00Z', lastSeen: '2025-04-02T12:00:00Z',
        count: 12400, userCount: 9200,
        stats14d: [500, 480, 460, 440, 420, 400, 380, 360, 340, 320, 300, 280, 260, 240],
        trend: 'regression', events: ['event-13'],
        tags: {
          browser: { Chrome: 55, Firefox: 30, Safari: 15 },
          os: { 'Mac OS X': 40, Windows: 40, Linux: 20 },
          environment: { production: 90, staging: 10 },
          handled: { yes: 100 }, level: { warning: 100 },
          release: { d66ac445f3b1: 100 }
        },
        metadata: { type: 'UnhandledPromiseRejectionWarning', value: 'NetworkError: Failed to fetch' }
      },
      {
        id: 'issue-11', shortId: 'FLASK-API-C39',
        title: 'ValueError', subtitle: 'invalid literal for int() with base 10: empty string',
        culprit: 'flask_api/api/users.py in get_user_by_id',
        type: 'error', level: 'warning', status: 'resolved', priority: 'low',
        isUnhandled: false, project: 'proj-3', assignee: 'user-3',
        firstSeen: '2024-10-05T08:00:00Z', lastSeen: '2025-03-28T14:00:00Z',
        count: 3200, userCount: 2100,
        stats14d: [120, 115, 110, 105, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55],
        trend: 'ongoing', events: ['event-14'],
        tags: {
          browser: { 'N/A': 100 },
          os: { Linux: 100 },
          environment: { production: 100 },
          handled: { yes: 100 }, level: { warning: 100 },
          release: { a3bc88e12f4a: 100 }
        },
        metadata: { type: 'ValueError', value: "invalid literal for int() with base 10: empty string" }
      },
      {
        id: 'issue-12', shortId: 'JAVASCRIPT-9E3',
        title: 'SyntaxError', subtitle: 'Unexpected token in JSON at position 0',
        culprit: 'src/utils/apiClient.ts in parseResponse',
        type: 'error', level: 'info', status: 'archived', priority: 'low',
        isUnhandled: false, project: 'proj-1', assignee: null,
        firstSeen: '2024-09-15T12:00:00Z', lastSeen: '2025-03-20T09:00:00Z',
        count: 1800, userCount: 1500,
        stats14d: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35],
        trend: 'ongoing', events: ['event-15'],
        tags: {
          browser: { Chrome: 70, Firefox: 30 },
          os: { 'Mac OS X': 55, Windows: 45 },
          environment: { production: 80, staging: 20 },
          handled: { yes: 100 }, level: { info: 100 },
          release: { d66ac445f3b1: 100 }
        },
        metadata: { type: 'SyntaxError', value: 'Unexpected token in JSON at position 0' }
      },
      {
        id: 'issue-13', shortId: 'SPRING-D14',
        title: 'RuntimeException', subtitle: 'Cannot deserialize value of type Long from String',
        culprit: 'com.empowerplant.api.UserController.getUser',
        type: 'error', level: 'error', status: 'archived', priority: 'medium',
        isUnhandled: false, project: 'proj-4', assignee: 'user-5',
        firstSeen: '2025-01-08T09:00:00Z', lastSeen: '2025-04-01T11:00:00Z',
        count: 456, userCount: 312,
        stats14d: [30, 28, 25, 22, 20, 18, 15, 12, 10, 8, 6, 5, 4, 3],
        trend: 'ongoing', events: ['event-16'],
        tags: {
          browser: { 'N/A': 100 },
          os: { Linux: 100 },
          environment: { production: 100 },
          handled: { yes: 100 }, level: { error: 100 },
          release: { c4ef12a89b3d: 100 }
        },
        metadata: { type: 'RuntimeException', value: 'Cannot deserialize value of type Long from String' }
      }
    ],

    events: {
      'issue-1': [
        {
          id: 'event-1', eventId: '59d078e91074', issueId: 'issue-1',
          title: "TypeError: 'NoneType' object has no attribute 'split'",
          timestamp: '2025-04-09T14:22:00Z', level: 'error',
          platform: 'javascript', release: 'd66ac445f3b1', environment: 'production',
          user: { id: 'web-user-739596', email: 'hello@abc.xyz', ip: '192.168.1.42' },
          contexts: {
            browser: { name: 'Chrome', version: '121.0' },
            os: { name: 'Mac OS X', version: '>=10.15.7' },
            runtime: { name: 'CPython', version: '3.11.8' }
          },
          highlights: {
            handled: 'yes', level: 'error', release: 'd66ac445f3b1',
            environment: 'production', url: '/checkout',
            transaction: 'xentry.tasks.process_commit_context',
            status_code: '500', sentry_region: 'us',
            silo_mode: 'REGION', trace_id: 'abc123def456', runtime_name: 'CPython', runtime_version: '3.11.8'
          },
          exception: {
            type: 'TypeError', value: "'NoneType' object has no attribute 'split'",
            stacktrace: {
              frames: [
                {
                  filename: 'app/components/smartSearchBar/utils.tsx',
                  function: 'escapeTagValue', lineNo: 46, colNo: 28, inApp: true,
                  context: [
                    [41, "export function escapeTagValue(value: string): string {"],
                    [42, "  // Wrap in quotes if there is a space"],
                    [43, "  const isArrayTag = value.startsWith('[') && value.endsWith(']');"],
                    [44, "  return (value.includes('\"') || value.includes(\"'\")) && !isArrayTag"],
                    [45, "    ? `${value.replace(/\\'/g, '\\\\\\'')}\"`"],
                    [46, "    : value.split(' ').join('_');"],
                    [47, "}"]
                  ]
                },
                {
                  filename: 'app/components/smartSearchBar/index.tsx',
                  function: 'SmartSearchBar', lineNo: 1295, colNo: 19, inApp: true,
                  context: [
                    [1292, "  const handleTokenCreate = (token: SearchItem) => {"],
                    [1293, "    const escaped = escapeTagValue(token.value);"],
                    [1294, "    if (escaped) {"],
                    [1295, "      setQuery(prev => prev + escaped);"],
                    [1296, "    }"],
                    [1297, "  }"]
                  ]
                },
                {
                  filename: 'node_modules/react-dom/cjs/react-dom.production.min.js',
                  function: 'render', lineNo: 234, colNo: 12, inApp: false, context: []
                },
                {
                  filename: 'node_modules/scheduler/cjs/scheduler.production.min.js',
                  function: 'unstable_runWithPriority', lineNo: 468, colNo: 12, inApp: false, context: []
                }
              ]
            }
          },
          breadcrumbs: [
            { type: 'error', category: 'exception', message: "TypeError: 'NoneType' object has no attribute 'split'", level: 'error', timestamp: '2025-04-09T14:22:00Z', data: {} },
            { type: 'navigation', category: 'navigation', message: null, level: 'info', timestamp: '2025-04-09T14:21:59Z', data: { from: '/issues/', to: '/issues/2341631/' } },
            { type: 'ui', category: 'ui.click', message: 'span.app-1x2krai.e16hd6vm1', level: 'info', timestamp: '2025-04-09T14:21:58Z', data: { ui_component_name: 'SectionHeader' } },
            { type: 'http', category: 'fetch', message: null, level: 'info', timestamp: '2025-04-09T14:21:55Z', data: { method: 'GET', url: '/api/0/issues/2341631/', status_code: 200 } },
            { type: 'default', category: 'console', message: 'Warning: componentWillReceiveProps has been renamed', level: 'warning', timestamp: '2025-04-09T14:21:50Z', data: {} }
          ],
          tags: { browser: 'Chrome 121.0', 'browser.name': 'Chrome', environment: 'production', handled: 'yes', level: 'error', release: 'd66ac445f3b1' }
        },
        {
          id: 'event-2', eventId: 'a3bc88e12f4a', issueId: 'issue-1',
          title: "TypeError: 'NoneType' object has no attribute 'split'",
          timestamp: '2025-04-09T10:15:00Z', level: 'error',
          platform: 'javascript', release: 'd66ac445f3b1', environment: 'production',
          user: { id: 'web-user-829312', email: 'user2@test.com', ip: '10.0.0.5' },
          contexts: { browser: { name: 'Firefox', version: '122.0' }, os: { name: 'Windows', version: '10' }, runtime: { name: 'Node.js', version: '18.x' } },
          highlights: { handled: 'no', level: 'error', release: 'd66ac445f3b1', environment: 'production', url: '/issues/', status_code: '500', sentry_region: 'us' },
          exception: {
            type: 'TypeError', value: "'NoneType' object has no attribute 'split'",
            stacktrace: { frames: [{ filename: 'app/components/smartSearchBar/utils.tsx', function: 'escapeTagValue', lineNo: 46, colNo: 28, inApp: true, context: [[45, "    ? val"], [46, "    : value.split(' ').join('_');"], [47, "}"]]}] }
          },
          breadcrumbs: [
            { type: 'error', category: 'exception', message: "TypeError: 'NoneType' object has no attribute 'split'", level: 'error', timestamp: '2025-04-09T10:15:00Z', data: {} },
            { type: 'navigation', category: 'navigation', message: null, level: 'info', timestamp: '2025-04-09T10:14:58Z', data: { from: '/', to: '/issues/' } }
          ],
          tags: { browser: 'Firefox 122.0', 'browser.name': 'Firefox', environment: 'production', handled: 'no', level: 'error', release: 'd66ac445f3b1' }
        }
      ],
      'issue-2': [
        {
          id: 'event-3', eventId: 'b9cd44e98f2a', issueId: 'issue-2',
          title: "ReferenceError: Cannot access before initialization",
          timestamp: '2025-04-09T13:55:00Z', level: 'error',
          platform: 'javascript', release: 'd66ac445f3b1', environment: 'production',
          user: { id: 'web-user-993021', email: 'alice@example.com', ip: '192.168.0.10' },
          contexts: { browser: { name: 'Chrome', version: '120.0' }, os: { name: 'Mac OS X', version: '14.0' }, runtime: { name: 'Node.js', version: '20.x' } },
          highlights: { handled: 'no', level: 'error', release: 'd66ac445f3b1', environment: 'production', url: '/login', status_code: '200', sentry_region: 'us' },
          exception: {
            type: 'ReferenceError', value: 'Cannot access before initialization',
            stacktrace: {
              frames: [
                { filename: 'src/hooks/useAuth.ts', function: 'validateSession', lineNo: 88, colNo: 5, inApp: true, context: [[85, "const validateSession = async () => {"], [86, "  const token = localStorage.getItem('token');"], [87, "  if (!token) throw new Error('No token');"], [88, "  return await verifyToken(token);"], [89, "};"]] },
                { filename: 'src/context/AuthContext.jsx', function: 'AuthProvider', lineNo: 32, colNo: 20, inApp: true, context: [[30, "useEffect(() => {"], [31, "  validateSession()"], [32, "    .then(setUser)"], [33, "    .catch(logout);"], [34, "}, []);"]]}
              ]
            }
          },
          breadcrumbs: [
            { type: 'error', category: 'exception', message: 'ReferenceError: Cannot access before initialization', level: 'error', timestamp: '2025-04-09T13:55:00Z', data: {} },
            { type: 'http', category: 'fetch', message: null, level: 'info', timestamp: '2025-04-09T13:54:58Z', data: { method: 'POST', url: '/api/auth/verify', status_code: 401 } }
          ],
          tags: { browser: 'Chrome 120.0', 'browser.name': 'Chrome', environment: 'production', handled: 'no', level: 'error', release: 'd66ac445f3b1' }
        },
        {
          id: 'event-4', eventId: 'c7de55a01b3c', issueId: 'issue-2',
          title: "ReferenceError: Cannot access before initialization",
          timestamp: '2025-04-09T11:00:00Z', level: 'error',
          platform: 'javascript', release: 'd66ac445f3b1', environment: 'staging',
          user: { id: 'web-user-445678', email: 'bob@test.io', ip: '10.1.1.100' },
          contexts: { browser: { name: 'Safari', version: '17.0' }, os: { name: 'Mac OS X', version: '13.0' } },
          highlights: { handled: 'no', level: 'error', release: 'd66ac445f3b1', environment: 'staging', url: '/dashboard', status_code: '500', sentry_region: 'us' },
          exception: { type: 'ReferenceError', value: 'Cannot access before initialization', stacktrace: { frames: [{ filename: 'src/hooks/useAuth.ts', function: 'validateSession', lineNo: 88, colNo: 5, inApp: true, context: [] }] } },
          breadcrumbs: [{ type: 'error', category: 'exception', message: 'ReferenceError: Cannot access before initialization', level: 'error', timestamp: '2025-04-09T11:00:00Z', data: {} }],
          tags: { browser: 'Safari 17.0', 'browser.name': 'Safari', environment: 'staging', handled: 'no', level: 'error', release: 'd66ac445f3b1' }
        }
      ],
      'issue-3': [
        {
          id: 'event-5', eventId: 'd1ef78b23c4d', issueId: 'issue-3',
          title: "IntegrityError: UNIQUE constraint failed: auth_user.username",
          timestamp: '2025-04-09T12:30:00Z', level: 'error',
          platform: 'python', release: 'a3bc88e12f4a', environment: 'production',
          user: { id: 'api-user-112233', email: 'signup-attempt@gmail.com', ip: '203.45.67.89' },
          contexts: { runtime: { name: 'CPython', version: '3.11.8' } },
          highlights: { handled: 'yes', level: 'error', release: 'a3bc88e12f4a', environment: 'production', url: '/api/users/register', status_code: '409', sentry_region: 'us' },
          exception: {
            type: 'IntegrityError', value: 'UNIQUE constraint failed: auth_user.username',
            stacktrace: {
              frames: [
                { filename: 'flask_api/models/user.py', function: 'create_user', lineNo: 45, colNo: 8, inApp: true, context: [[42, "def create_user(username, email, password):"], [43, "    user = User(username=username, email=email)"], [44, "    user.set_password(password)"], [45, "    db.session.add(user)"], [46, "    db.session.commit()  # <- UNIQUE constraint violation"]] },
                { filename: 'flask_api/api/auth.py', function: 'register', lineNo: 78, colNo: 12, inApp: true, context: [[75, "@app.route('/api/users/register', methods=['POST'])"], [76, "def register():"], [77, "    data = request.get_json()"], [78, "    user = create_user(data['username'], data['email'], data['password'])"]] }
              ]
            }
          },
          breadcrumbs: [
            { type: 'error', category: 'exception', message: 'IntegrityError: UNIQUE constraint failed', level: 'error', timestamp: '2025-04-09T12:30:00Z', data: {} },
            { type: 'http', category: 'fetch', message: null, level: 'info', timestamp: '2025-04-09T12:29:59Z', data: { method: 'POST', url: '/api/users/register', status_code: 409 } }
          ],
          tags: { environment: 'production', handled: 'yes', level: 'error', release: 'a3bc88e12f4a', runtime: 'CPython 3.11.8' }
        },
        {
          id: 'event-6', eventId: 'e2fg89c34d5e', issueId: 'issue-3',
          title: "IntegrityError: UNIQUE constraint failed: auth_user.username",
          timestamp: '2025-04-09T09:45:00Z', level: 'error',
          platform: 'python', release: 'a3bc88e12f4a', environment: 'production',
          user: { id: 'api-user-445566', email: 'another@example.com', ip: '175.23.45.67' },
          contexts: { runtime: { name: 'CPython', version: '3.11.8' } },
          highlights: { handled: 'yes', level: 'error', release: 'a3bc88e12f4a', environment: 'production', url: '/api/users/register', status_code: '409' },
          exception: { type: 'IntegrityError', value: 'UNIQUE constraint failed: auth_user.username', stacktrace: { frames: [{ filename: 'flask_api/models/user.py', function: 'create_user', lineNo: 45, colNo: 8, inApp: true, context: [] }] } },
          breadcrumbs: [{ type: 'error', category: 'exception', message: 'IntegrityError: UNIQUE constraint failed', level: 'error', timestamp: '2025-04-09T09:45:00Z', data: {} }],
          tags: { environment: 'production', handled: 'yes', level: 'error', release: 'a3bc88e12f4a' }
        }
      ],
      'issue-4': [{
        id: 'event-7', eventId: 'f3gh90d45e6f', issueId: 'issue-4',
        title: 'DatabaseError: connection to server at "db-primary" (10.0.1.5) failed',
        timestamp: '2025-04-09T10:15:00Z', level: 'fatal',
        platform: 'python', release: 'a3bc88e12f4a', environment: 'production',
        user: { id: 'system', email: null, ip: '10.0.0.1' },
        contexts: { runtime: { name: 'CPython', version: '3.11.8' } },
        highlights: { handled: 'no', level: 'fatal', release: 'a3bc88e12f4a', environment: 'production', url: '/api/products', status_code: '503' },
        exception: {
          type: 'DatabaseError', value: 'connection to server at "db-primary" (10.0.1.5) failed',
          stacktrace: { frames: [{ filename: 'flask_api/database/connection.py', function: 'get_connection', lineNo: 23, colNo: 4, inApp: true, context: [[20, "def get_connection():"], [21, "    try:"], [22, "        conn = psycopg2.connect(DATABASE_URL, connect_timeout=5)"], [23, "        return conn"], [24, "    except psycopg2.OperationalError as e:"], [25, "        raise DatabaseError(str(e)) from e"]] }] }
        },
        breadcrumbs: [{ type: 'error', category: 'exception', message: 'DatabaseError: connection failed', level: 'fatal', timestamp: '2025-04-09T10:15:00Z', data: {} }],
        tags: { environment: 'production', handled: 'no', level: 'fatal', release: 'a3bc88e12f4a' }
      }],
      'issue-5': [{
        id: 'event-8', eventId: 'g4hi01e56f7g', issueId: 'issue-5',
        title: 'RuntimeException: NullPointerException at OrderService.processPayment',
        timestamp: '2025-04-09T09:45:00Z', level: 'error',
        platform: 'java', release: 'c4ef12a89b3d', environment: 'production',
        user: { id: 'java-user-556677', email: 'customer@store.com', ip: '88.44.22.11' },
        contexts: { runtime: { name: 'Java', version: '17.0.8' } },
        highlights: { handled: 'no', level: 'error', release: 'c4ef12a89b3d', environment: 'production', url: '/api/checkout/pay', status_code: '500' },
        exception: {
          type: 'RuntimeException', value: 'NullPointerException at OrderService.processPayment',
          stacktrace: { frames: [
            { filename: 'com/empowerplant/orders/OrderService.java', function: 'processPayment', lineNo: 142, colNo: 0, inApp: true, context: [[139, "public PaymentResult processPayment(Order order) {"], [140, "    PaymentGateway gateway = order.getPaymentGateway();"], [141, "    // gateway is null when payment method not set"], [142, "    return gateway.charge(order.getTotal());"], [143, "}"]]}
          ]}
        },
        breadcrumbs: [{ type: 'error', category: 'exception', message: 'NullPointerException at processPayment', level: 'error', timestamp: '2025-04-09T09:45:00Z', data: {} }],
        tags: { environment: 'production', handled: 'no', level: 'error', release: 'c4ef12a89b3d' }
      }],
      'issue-6': [{ id: 'event-9', eventId: 'h5ij12f67g8h', issueId: 'issue-6', title: "TypeError: Cannot read properties of undefined (reading 'map')", timestamp: '2025-04-09T08:30:00Z', level: 'warning', platform: 'javascript', release: 'd66ac445f3b1', environment: 'production', user: { id: 'web-user-001', email: 'shopper@gmail.com', ip: '172.16.0.5' }, contexts: { browser: { name: 'Chrome', version: '121.0' }, os: { name: 'Mac OS X' } }, highlights: { handled: 'yes', level: 'warning', release: 'd66ac445f3b1', environment: 'production', url: '/products' }, exception: { type: 'TypeError', value: "Cannot read properties of undefined (reading 'map')", stacktrace: { frames: [{ filename: 'src/components/ProductList/index.jsx', function: 'ProductList', lineNo: 22, colNo: 25, inApp: true, context: [[20, "export default function ProductList({ products }) {"], [21, "  return ("], [22, "    <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>"], [23, "  );"], [24, "}"]] }] } }, breadcrumbs: [{ type: 'error', category: 'exception', message: "TypeError: Cannot read properties of undefined (reading 'map')", level: 'warning', timestamp: '2025-04-09T08:30:00Z', data: {} }], tags: { browser: 'Chrome 121.0', environment: 'production', level: 'warning', release: 'd66ac445f3b1' } }],
      'issue-7': [{ id: 'event-10', eventId: 'i6jk23g78h9i', issueId: 'issue-7', title: 'N+1 Query: Performing 47 queries where 1 was expected', timestamp: '2025-04-09T07:55:00Z', level: 'warning', platform: 'python', release: 'a3bc88e12f4a', environment: 'production', user: null, contexts: { runtime: { name: 'CPython', version: '3.11.8' } }, highlights: { level: 'warning', release: 'a3bc88e12f4a', environment: 'production', url: '/api/products', status_code: '200' }, exception: { type: 'N+1 Query', value: 'Performing 47 queries where 1 was expected', stacktrace: { frames: [{ filename: 'flask_api/api/products.py', function: 'get_product_list', lineNo: 55, colNo: 8, inApp: true, context: [[52, "def get_product_list():"], [53, "    products = Product.query.all()"], [54, "    # WARNING: N+1 - each loop issues a separate query"], [55, "    return [p.to_dict_with_reviews() for p in products]"]] }] } }, breadcrumbs: [], tags: { environment: 'production', level: 'warning', release: 'a3bc88e12f4a' } }],
      'issue-8': [{ id: 'event-11', eventId: 'j7kl34h89i0j', issueId: 'issue-8', title: 'Slow DB Query: 12500ms exceeds 1000ms threshold', timestamp: '2025-04-09T07:00:00Z', level: 'warning', platform: 'java', release: 'c4ef12a89b3d', environment: 'production', user: null, contexts: { runtime: { name: 'Java', version: '17.0.8' } }, highlights: { level: 'warning', release: 'c4ef12a89b3d', environment: 'production', status_code: '200' }, exception: { type: 'Slow DB Query', value: 'Query duration 12500ms exceeds threshold 1000ms', stacktrace: { frames: [{ filename: 'com/empowerplant/inventory/InventoryRepository.java', function: 'findAll', lineNo: 38, colNo: 0, inApp: true, context: [[35, "public List<InventoryItem> findAll() {"], [36, "    // Missing index on inventory_date column"], [37, "    return em.createQuery(\"SELECT i FROM InventoryItem i ORDER BY i.date\", InventoryItem.class)"], [38, "              .getResultList();"], [39, "}"]]}] } }, breadcrumbs: [], tags: { environment: 'production', level: 'warning', release: 'c4ef12a89b3d' } }],
      'issue-9': [{ id: 'event-12', eventId: 'k8lm45i90j1k', issueId: 'issue-9', title: '500 Internal Server Error: POST /api/checkout failed', timestamp: '2025-04-09T06:30:00Z', level: 'error', platform: 'javascript', release: 'd66ac445f3b1', environment: 'production', user: { id: 'web-user-778899', email: 'buyer@shop.io', ip: '55.66.77.88' }, contexts: { browser: { name: 'Chrome', version: '121.0' }, os: { name: 'Windows', version: '11' } }, highlights: { handled: 'no', level: 'error', release: 'd66ac445f3b1', environment: 'production', url: '/checkout', status_code: '500' }, exception: { type: '500 Internal Server Error', value: 'POST /api/checkout failed with status 500', stacktrace: { frames: [{ filename: 'src/api/checkout.ts', function: 'submitOrder', lineNo: 67, colNo: 22, inApp: true, context: [[64, "export async function submitOrder(cart: Cart) {"], [65, "  const res = await fetch('/api/checkout', { method: 'POST', body: JSON.stringify(cart) });"], [66, "  if (!res.ok) {"], [67, "    throw new Error(`POST /api/checkout failed with status ${res.status}`);"], [68, "  }"]]}] } }, breadcrumbs: [{ type: 'error', category: 'exception', message: '500 Internal Server Error on checkout', level: 'error', timestamp: '2025-04-09T06:30:00Z', data: {} }, { type: 'http', category: 'fetch', message: null, level: 'info', timestamp: '2025-04-09T06:29:58Z', data: { method: 'POST', url: '/api/checkout', status_code: 500 } }], tags: { browser: 'Chrome 121.0', environment: 'production', handled: 'no', level: 'error', release: 'd66ac445f3b1' } }],
      'issue-10': [{ id: 'event-13', eventId: 'l9mn56j01k2l', issueId: 'issue-10', title: 'UnhandledPromiseRejectionWarning: NetworkError: Failed to fetch', timestamp: '2025-04-02T12:00:00Z', level: 'warning', platform: 'javascript', release: 'd66ac445f3b1', environment: 'production', user: { id: 'web-user-334455', email: 'visitor@web.com', ip: '44.55.66.77' }, contexts: { browser: { name: 'Firefox', version: '122.0' }, os: { name: 'Windows' } }, highlights: { handled: 'yes', level: 'warning', release: 'd66ac445f3b1', environment: 'production', url: '/api/products', status_code: '0' }, exception: { type: 'UnhandledPromiseRejectionWarning', value: 'NetworkError: Failed to fetch', stacktrace: { frames: [{ filename: 'src/services/api.js', function: 'fetchWithRetry', lineNo: 34, colNo: 10, inApp: true, context: [[31, "async function fetchWithRetry(url, options, retries = 3) {"], [32, "  try {"], [33, "    const res = await fetch(url, options);"], [34, "    if (!res.ok) throw new Error(`NetworkError: Failed to fetch`);"], [35, "    return res.json();"]] }] } }, breadcrumbs: [], tags: { browser: 'Firefox 122.0', environment: 'production', level: 'warning', release: 'd66ac445f3b1' } }],
      'issue-11': [{ id: 'event-14', eventId: 'm0no67k12l3m', issueId: 'issue-11', title: "ValueError: invalid literal for int() with base 10: ''", timestamp: '2025-03-28T14:00:00Z', level: 'warning', platform: 'python', release: 'a3bc88e12f4a', environment: 'production', user: null, contexts: { runtime: { name: 'CPython', version: '3.11.8' } }, highlights: { handled: 'yes', level: 'warning', release: 'a3bc88e12f4a', environment: 'production', url: '/api/users/0' }, exception: { type: 'ValueError', value: "invalid literal for int() with base 10: ''", stacktrace: { frames: [{ filename: 'flask_api/api/users.py', function: 'get_user_by_id', lineNo: 29, colNo: 12, inApp: true, context: [[26, "def get_user_by_id(user_id: str):"], [27, "    try:"], [28, "        uid = int(user_id)"], [29, "        return User.query.get(uid)"], [30, "    except ValueError:"]] }] } }, breadcrumbs: [], tags: { environment: 'production', level: 'warning', release: 'a3bc88e12f4a' } }],
      'issue-12': [{ id: 'event-15', eventId: 'n1op78l23m4n', issueId: 'issue-12', title: 'SyntaxError: Unexpected token in JSON at position 0', timestamp: '2025-03-20T09:00:00Z', level: 'info', platform: 'javascript', release: 'd66ac445f3b1', environment: 'production', user: null, contexts: { browser: { name: 'Chrome', version: '120.0' } }, highlights: { level: 'info', release: 'd66ac445f3b1', environment: 'production', url: '/api/config' }, exception: { type: 'SyntaxError', value: 'Unexpected token in JSON at position 0', stacktrace: { frames: [{ filename: 'src/utils/apiClient.ts', function: 'parseResponse', lineNo: 18, colNo: 15, inApp: true, context: [[15, "async function parseResponse(res: Response) {"], [16, "  const text = await res.text();"], [17, "  try {"], [18, "    return JSON.parse(text); // throws if text is HTML error page"]] }] } }, breadcrumbs: [], tags: { environment: 'production', level: 'info', release: 'd66ac445f3b1' } }],
      'issue-13': [{ id: 'event-16', eventId: 'o2pq89m34n5o', issueId: 'issue-13', title: 'RuntimeException: Cannot deserialize value of type Long from String', timestamp: '2025-04-01T11:00:00Z', level: 'error', platform: 'java', release: 'c4ef12a89b3d', environment: 'production', user: null, contexts: { runtime: { name: 'Java', version: '17.0.8' } }, highlights: { level: 'error', release: 'c4ef12a89b3d', environment: 'production', url: '/api/users/abc' }, exception: { type: 'RuntimeException', value: 'Cannot deserialize value of type Long from String', stacktrace: { frames: [{ filename: 'com/empowerplant/api/UserController.java', function: 'getUser', lineNo: 55, colNo: 0, inApp: true, context: [[52, "@GetMapping(\"/api/users/{id}\")"], [53, "public User getUser(@PathVariable Long id) {"], [54, "    // Long parsing fails when path variable is non-numeric"], [55, "    return userService.findById(id);"]] }] } }, breadcrumbs: [], tags: { environment: 'production', level: 'error', release: 'c4ef12a89b3d' } }]
    },

    alertRules: [
      { id: 'alert-1', name: 'Signup page is too slow', type: 'metric', status: 'warning', threshold: 0.2, thresholdType: 'below', triggerLabel: 'Below 0.2', dateTriggered: '2025-04-09T13:30:00Z', dateCreated: '2024-05-29T00:00:00Z', project: 'proj-1', team: 'team-1', history: [{ timestamp: '2025-04-09T13:30:00Z', status: 'warning' }, { timestamp: '2025-04-08T09:00:00Z', status: 'resolved' }, { timestamp: '2025-04-07T22:15:00Z', status: 'critical' }] },
      { id: 'alert-2', name: 'Error rate too high', type: 'metric', status: 'critical', threshold: 5, thresholdType: 'above', triggerLabel: 'Above 5%', dateTriggered: '2025-04-09T10:00:00Z', dateCreated: '2024-03-12T00:00:00Z', project: 'proj-3', team: 'team-2', history: [{ timestamp: '2025-04-09T10:00:00Z', status: 'critical' }, { timestamp: '2025-04-07T08:00:00Z', status: 'resolved' }] },
      { id: 'alert-3', name: 'CLS score above threshold', type: 'metric', status: 'warning', threshold: 0.25, thresholdType: 'above', triggerLabel: 'Above 0.25', dateTriggered: '2025-04-08T14:00:00Z', dateCreated: '2024-07-08T00:00:00Z', project: 'proj-2', team: 'team-1', history: [{ timestamp: '2025-04-08T14:00:00Z', status: 'warning' }] },
      { id: 'alert-4', name: 'New issue detected in prod', type: 'issue', status: 'critical', threshold: 1, thresholdType: 'above', triggerLabel: 'New Issue', dateTriggered: '2025-04-09T12:30:00Z', dateCreated: '2024-01-20T00:00:00Z', project: 'proj-1', team: 'team-1', history: [{ timestamp: '2025-04-09T12:30:00Z', status: 'critical' }, { timestamp: '2025-04-06T10:00:00Z', status: 'critical' }] },
      { id: 'alert-5', name: 'High frequency issue', type: 'issue', status: 'warning', threshold: 100, thresholdType: 'above', triggerLabel: 'Above 100/hr', dateTriggered: '2025-04-09T09:00:00Z', dateCreated: '2024-04-15T00:00:00Z', project: 'proj-4', team: 'team-3', history: [{ timestamp: '2025-04-09T09:00:00Z', status: 'warning' }, { timestamp: '2025-04-08T15:00:00Z', status: 'resolved' }] },
      { id: 'alert-6', name: 'Issue regression detected', type: 'issue', status: 'critical', threshold: 1, thresholdType: 'above', triggerLabel: 'Regression', dateTriggered: '2025-04-08T20:00:00Z', dateCreated: '2024-06-01T00:00:00Z', project: 'proj-3', team: 'team-2', history: [{ timestamp: '2025-04-08T20:00:00Z', status: 'critical' }] },
      { id: 'alert-7', name: 'Apdex score recovered', type: 'metric', status: 'resolved', threshold: 0.8, thresholdType: 'below', triggerLabel: 'Resolved', dateTriggered: '2025-04-07T06:00:00Z', dateCreated: '2024-02-14T00:00:00Z', project: 'proj-2', team: 'team-1', history: [{ timestamp: '2025-04-07T06:00:00Z', status: 'resolved' }, { timestamp: '2025-04-05T12:00:00Z', status: 'critical' }] },
      { id: 'alert-8', name: 'DB connection pool resolved', type: 'metric', status: 'resolved', threshold: 90, thresholdType: 'above', triggerLabel: 'Resolved', dateTriggered: '2025-04-06T18:00:00Z', dateCreated: '2024-09-30T00:00:00Z', project: 'proj-4', team: 'team-3', history: [{ timestamp: '2025-04-06T18:00:00Z', status: 'resolved' }, { timestamp: '2025-04-06T10:00:00Z', status: 'critical' }] }
    ],

    releases: [
      { id: 'rel-1', version: 'd66ac445f3b1', shortVersion: 'd66ac445', dateCreated: '2025-04-08T10:00:00Z', dateReleased: '2025-04-08T12:00:00Z', projects: ['proj-1', 'proj-2'], newIssues: 2, crashFreeSessions: 97.2, crashFreeUsers: 98.5, adoption: 85, totalSessions: 24500, commitCount: 12, authors: ['user-1', 'user-2'], lastEvent: '2025-04-09T14:22:00Z' },
      { id: 'rel-2', version: 'a3bc88e12f4a', shortVersion: 'a3bc88e1', dateCreated: '2025-04-01T08:00:00Z', dateReleased: '2025-04-01T10:00:00Z', projects: ['proj-3'], newIssues: 1, crashFreeSessions: 95.8, crashFreeUsers: 97.1, adoption: 72, totalSessions: 18200, commitCount: 8, authors: ['user-3'], lastEvent: '2025-04-09T12:30:00Z' },
      { id: 'rel-3', version: 'c4ef12a89b3d', shortVersion: 'c4ef12a8', dateCreated: '2025-03-25T09:00:00Z', dateReleased: '2025-03-25T11:00:00Z', projects: ['proj-4'], newIssues: 3, crashFreeSessions: 98.9, crashFreeUsers: 99.2, adoption: 100, totalSessions: 12100, commitCount: 15, authors: ['user-3', 'user-5'], lastEvent: '2025-04-09T09:45:00Z' },
      { id: 'rel-4', version: 'b5cd99f67e8a', shortVersion: 'b5cd99f6', dateCreated: '2025-03-18T14:00:00Z', dateReleased: '2025-03-18T16:00:00Z', projects: ['proj-1', 'proj-3'], newIssues: 0, crashFreeSessions: 99.5, crashFreeUsers: 99.8, adoption: 100, totalSessions: 31400, commitCount: 6, authors: ['user-1', 'user-4'], lastEvent: '2025-04-02T12:00:00Z' },
      { id: 'rel-5', version: '7e8f90a01b2c', shortVersion: '7e8f90a0', dateCreated: '2025-03-10T10:00:00Z', dateReleased: '2025-03-10T12:00:00Z', projects: ['proj-2'], newIssues: 4, crashFreeSessions: 96.3, crashFreeUsers: 97.8, adoption: 100, totalSessions: 9800, commitCount: 22, authors: ['user-2', 'user-4'], lastEvent: '2025-03-28T14:00:00Z' },
      { id: 'rel-6', version: '3f4g05b12c3d', shortVersion: '3f4g05b1', dateCreated: '2025-03-01T08:00:00Z', dateReleased: '2025-03-01T09:00:00Z', projects: ['proj-1', 'proj-2', 'proj-3', 'proj-4'], newIssues: 5, crashFreeSessions: 94.2, crashFreeUsers: 95.5, adoption: 100, totalSessions: 58700, commitCount: 30, authors: ['user-1', 'user-2', 'user-3', 'user-5'], lastEvent: '2025-03-25T11:00:00Z' }
    ],

    dashboards: [
      {
        id: 'dash-1', title: 'Frontend Overview', dateCreated: '2024-06-15T00:00:00Z', createdBy: 'user-1',
        widgets: [
          { id: 'widget-1', title: 'Top 5 Issues by Unique Users Over Time', type: 'line', layout: { x: 0, y: 0, w: 6, h: 3 }, data: { series: [{ label: 'REACT-59F', color: '#6C5FC7', values: [120, 95, 140, 110, 200, 180, 150] }, { label: 'JAVASCRIPT-3B2', color: '#E03E2F', values: [80, 110, 90, 130, 100, 120, 95] }, { label: 'REACT-APP-2E1', color: '#F5B000', values: [40, 60, 55, 70, 65, 80, 72] }], xLabels: ['Sep 1', 'Oct 1', 'Nov 1', 'Dec 1', 'Jan 1', 'Feb 1', 'Mar 1'] } },
          { id: 'widget-2', title: 'Overall LCP', type: 'big_number', layout: { x: 6, y: 0, w: 3, h: 1 }, data: { value: '1.46s', previousValue: '1.62s', label: 'Largest Contentful Paint' } },
          { id: 'widget-3', title: 'Overall FID', type: 'big_number', layout: { x: 9, y: 0, w: 3, h: 1 }, data: { value: '18ms', previousValue: '24ms', label: 'First Input Delay' } },
          { id: 'widget-4', title: 'Error Rate by Project', type: 'bar', layout: { x: 6, y: 1, w: 6, h: 2 }, data: { series: [{ label: 'Error Rate', color: '#E03E2F', values: [2.1, 0.8, 4.2, 1.1] }], xLabels: ['javascript', 'react-app', 'flask-api', 'spring-boot-5'] } },
          { id: 'widget-5', title: 'Sessions over Time', type: 'area', layout: { x: 0, y: 3, w: 12, h: 2 }, data: { series: [{ label: 'Sessions', color: '#6C5FC7', values: [1200, 1350, 1280, 1420, 1500, 1380, 1450, 1520, 1490, 1600, 1550, 1700, 1650, 1800] }], xLabels: ['Mar 27', 'Mar 28', 'Mar 29', 'Mar 30', 'Mar 31', 'Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7', 'Apr 8', 'Apr 9'] } },
          { id: 'widget-6', title: 'Top Transactions by Duration', type: 'table', layout: { x: 0, y: 5, w: 6, h: 3 }, data: { columns: ['Transaction', 'P50', 'P95'], rows: [['/api/checkout', '120ms', '890ms'], ['/api/products', '45ms', '320ms'], ['/api/users', '55ms', '410ms'], ['/ (home)', '230ms', '1200ms'], ['/products', '180ms', '950ms']] } },
          { id: 'widget-7', title: 'Overall CLS', type: 'big_number', layout: { x: 6, y: 5, w: 3, h: 1 }, data: { value: '0.12', previousValue: '0.18', label: 'Cumulative Layout Shift' } },
          { id: 'widget-8', title: 'Crash Free Sessions', type: 'big_number', layout: { x: 9, y: 5, w: 3, h: 1 }, data: { value: '97.2%', previousValue: '95.8%', label: 'javascript project' } }
        ]
      },
      {
        id: 'dash-2', title: 'Backend Health', dateCreated: '2024-08-20T00:00:00Z', createdBy: 'user-3',
        widgets: [
          { id: 'widget-9', title: 'API Error Rate', type: 'line', layout: { x: 0, y: 0, w: 8, h: 3 }, data: { series: [{ label: 'flask-api', color: '#33BF9E', values: [4.2, 3.8, 5.1, 4.5, 3.9, 4.8, 5.5, 6.1, 5.8, 4.9, 4.2, 3.8, 5.0, 4.6] }, { label: 'spring-boot-5', color: '#3B6ECC', values: [1.1, 0.9, 1.3, 1.0, 0.8, 1.2, 1.5, 1.3, 1.1, 0.9, 1.0, 0.8, 1.1, 1.2] }], xLabels: ['Mar 27', 'Mar 28', 'Mar 29', 'Mar 30', 'Mar 31', 'Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7', 'Apr 8', 'Apr 9'] } },
          { id: 'widget-10', title: 'Avg Response Time', type: 'big_number', layout: { x: 8, y: 0, w: 4, h: 1 }, data: { value: '87ms', previousValue: '102ms', label: 'flask-api P50' } },
          { id: 'widget-11', title: 'DB Query Volume', type: 'bar', layout: { x: 0, y: 3, w: 6, h: 2 }, data: { series: [{ label: 'Queries/min', color: '#F5B000', values: [450, 520, 490, 580, 610, 570, 540, 600, 620, 590, 550, 580, 610, 640] }], xLabels: ['Mar 27', 'Mar 28', 'Mar 29', 'Mar 30', 'Mar 31', 'Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7', 'Apr 8', 'Apr 9'] } },
          { id: 'widget-12', title: 'Apdex Score', type: 'big_number', layout: { x: 6, y: 3, w: 3, h: 1 }, data: { value: '0.92', previousValue: '0.88', label: 'spring-boot-5' } },
          { id: 'widget-13', title: 'Failure Rate', type: 'big_number', layout: { x: 9, y: 3, w: 3, h: 1 }, data: { value: '3.2%', previousValue: '2.9%', label: 'flask-api' } },
          { id: 'widget-14', title: 'Top Failing Endpoints', type: 'table', layout: { x: 6, y: 4, w: 6, h: 2 }, data: { columns: ['Endpoint', 'Failures', 'Rate'], rows: [['/api/checkout', '45', '8.2%'], ['/api/users/register', '28', '5.1%'], ['/api/products', '12', '1.8%'], ['/api/inventory', '8', '0.9%']] } }
        ]
      }
    ],

    transactions: [
      { id: 'txn-1', name: '/api/checkout', project: 'proj-3', tpm: 45.2, p50: 120, p75: 250, p95: 890, p99: 2400, failureRate: 0.082, apdex: 0.87, totalCount: 65000, stats24h: [40, 42, 38, 45, 50, 48, 43, 41, 44, 46, 49, 52] },
      { id: 'txn-2', name: '/api/products', project: 'proj-3', tpm: 128.5, p50: 45, p75: 120, p95: 320, p99: 850, failureRate: 0.018, apdex: 0.96, totalCount: 185000, stats24h: [110, 125, 118, 130, 140, 135, 128, 122, 130, 138, 145, 150] },
      { id: 'txn-3', name: '/api/users', project: 'proj-3', tpm: 78.3, p50: 55, p75: 140, p95: 410, p99: 980, failureRate: 0.024, apdex: 0.94, totalCount: 113000, stats24h: [65, 72, 68, 80, 85, 78, 72, 70, 75, 80, 88, 92] },
      { id: 'txn-4', name: '/ (Home)', project: 'proj-1', tpm: 312.8, p50: 230, p75: 480, p95: 1200, p99: 3500, failureRate: 0.005, apdex: 0.89, totalCount: 450000, stats24h: [280, 310, 295, 330, 350, 340, 315, 300, 325, 345, 360, 380] },
      { id: 'txn-5', name: '/products', project: 'proj-1', tpm: 256.1, p50: 180, p75: 350, p95: 950, p99: 2800, failureRate: 0.008, apdex: 0.91, totalCount: 368000, stats24h: [220, 245, 230, 260, 275, 265, 250, 240, 258, 270, 285, 295] },
      { id: 'txn-6', name: '/checkout', project: 'proj-2', tpm: 89.4, p50: 310, p75: 620, p95: 1800, p99: 4200, failureRate: 0.043, apdex: 0.82, totalCount: 128000, stats24h: [75, 82, 78, 90, 95, 88, 82, 79, 85, 92, 98, 102] },
      { id: 'txn-7', name: '/api/orders', project: 'proj-4', tpm: 34.7, p50: 280, p75: 550, p95: 1400, p99: 3100, failureRate: 0.031, apdex: 0.88, totalCount: 50000, stats24h: [28, 32, 30, 36, 38, 35, 32, 30, 33, 36, 40, 42] },
      { id: 'txn-8', name: '/api/inventory', project: 'proj-4', tpm: 22.1, p50: 420, p75: 850, p95: 2500, p99: 8000, failureRate: 0.012, apdex: 0.78, totalCount: 32000, stats24h: [18, 20, 19, 23, 25, 22, 20, 19, 21, 24, 26, 28] },
      { id: 'txn-9', name: 'celery.process_order', project: 'proj-3', tpm: 15.3, p50: 850, p75: 1500, p95: 4200, p99: 9800, failureRate: 0.064, apdex: 0.72, totalCount: 22000, stats24h: [12, 14, 13, 16, 18, 15, 13, 12, 14, 16, 18, 20] },
      { id: 'txn-10', name: 'spring.sendEmailNotification', project: 'proj-4', tpm: 8.9, p50: 220, p75: 480, p95: 1200, p99: 2800, failureRate: 0.009, apdex: 0.95, totalCount: 13000, stats24h: [7, 8, 7, 9, 10, 9, 8, 7, 8, 9, 10, 11] }
    ],

    // UI state
    selectedProject: 'all',
    selectedEnvironment: 'all',
    dateRange: '14d',
    issueListSort: 'lastSeen',
    issueListTab: 'unresolved',
    issueSearchQuery: 'is:unresolved',
    selectedIssues: [],
    bookmarkedIssues: []
  }
}
