import { v4 as uuidv4 } from 'uuid';

// Helper to replace variables {{var}} with values from environment
export const substituteVariables = (text, environment) => {
  if (!text || !environment) return text;
  let newText = text;
  (environment.variables || []).forEach(variable => {
    if (variable.enabled) {
      const regex = new RegExp(`\\{\\{${variable.key}\\}\\}`, 'g');
      newText = newText.replace(regex, variable.value);
    }
  });
  return newText;
};

const randomName = () => {
  const first = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack'];
  const last = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
};

const randomEmail = (name) => {
  return name.toLowerCase().replace(' ', '.') + '@example.com';
};

const randomId = () => Math.floor(Math.random() * 10000);

const MOCK_COOKIES = [
  { name: 'session_id', value: `sess_${uuidv4().slice(0, 12)}`, domain: '.example.com', path: '/', httpOnly: true, secure: true },
  { name: 'csrf_token', value: `csrf_${uuidv4().slice(0, 16)}`, domain: '.example.com', path: '/', httpOnly: false, secure: true },
];

const buildHeaders = (contentType = 'application/json') => ({
  'content-type': `${contentType}; charset=utf-8`,
  'date': new Date().toUTCString(),
  'server': 'MockServer/2.0',
  'x-request-id': uuidv4(),
  'x-response-time': `${Math.floor(Math.random() * 100) + 10}ms`,
  'cache-control': 'no-cache, no-store, must-revalidate',
  'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
});

// Execute pre-request script and return modified env variables
const runPreRequestScript = (preRequestCode, request, environment) => {
  if (!preRequestCode || !preRequestCode.trim()) return;
  try {
    // Create pm sandbox for pre-request script
    const pmEnv = {};
    const pm = {
      environment: {
        get: (key) => (environment?.variables || []).find(v => v.key === key)?.value || '',
        set: (key, value) => { pmEnv[key] = value; },
        unset: (key) => { delete pmEnv[key]; },
      },
      variables: {
        get: (key) => (environment?.variables || []).find(v => v.key === key)?.value || '',
        set: (key, value) => { pmEnv[key] = value; },
      },
      globals: {
        get: () => '',
        set: () => {},
      },
      request: {
        url: request.url,
        method: request.method,
        headers: {},
        body: request.body?.content || '',
      },
      info: {
        requestName: request.name || '',
        eventName: 'prerequest',
      }
    };
    // eslint-disable-next-line no-new-func
    const fn = new Function('pm', 'console', preRequestCode);
    fn(pm, console);
    return pmEnv;
  } catch (e) {
    // Pre-request script errors are non-fatal
    console.warn('Pre-request script error:', e.message);
    return {};
  }
};

// Mock fetch function
export const executeRequest = async (request, environment) => {
  const startTime = Date.now();

  // 0. Run pre-request script (captures any pm.environment.set calls)
  const preEnvOverrides = runPreRequestScript(request.preRequest, request, environment);
  // Merge pre-request overrides into a temporary environment copy
  let effectiveEnvironment = environment;
  if (preEnvOverrides && Object.keys(preEnvOverrides).length > 0) {
    effectiveEnvironment = {
      ...environment,
      variables: [
        ...(environment?.variables || []).map(v =>
          preEnvOverrides.hasOwnProperty(v.key)
            ? { ...v, value: preEnvOverrides[v.key] }
            : v
        ),
        // Add new keys not already in environment
        ...Object.entries(preEnvOverrides)
          .filter(([k]) => !(environment?.variables || []).some(v => v.key === k))
          .map(([key, value]) => ({ id: `pre_${key}`, key, value, enabled: true, description: '' }))
      ]
    };
  }

  // 1. Variable Substitution
  const url = substituteVariables(request.url, effectiveEnvironment);
  const bodyContent = substituteVariables(request.body?.content, effectiveEnvironment);
  const headers = (request.headers || []).reduce((acc, h) => {
    if (h.enabled) acc[substituteVariables(h.key, effectiveEnvironment)] = substituteVariables(h.value, effectiveEnvironment);
    return acc;
  }, {});

  // 2. Simulate Network Delay
  let delay = Math.floor(Math.random() * 600) + 100; // 100-700ms

  // Timeout simulation
  if (url.includes('timeout')) {
    delay = 5500;
  }

  await new Promise(resolve => setTimeout(resolve, delay));

  const endTime = Date.now();
  const time = endTime - startTime;

  // 3. Mock Response Logic
  let status = 200;
  let statusText = 'OK';
  let responseBody = {};
  let responseHeaders = buildHeaders();
  let cookies = [...MOCK_COOKIES];

  // URL-based error simulation
  if (url.includes('timeout')) {
    status = 408;
    statusText = 'Request Timeout';
    responseBody = { error: 'Request timed out', message: 'The server did not respond within the allocated time.' };
    cookies = [];
  } else if (url.includes('500') || url.includes('error')) {
    status = 500;
    statusText = 'Internal Server Error';
    responseBody = { error: 'Internal Server Error', message: 'Something went wrong on the server.', timestamp: new Date().toISOString() };
  } else if (url.includes('404') || url.includes('notfound')) {
    status = 404;
    statusText = 'Not Found';
    responseBody = { error: 'Not Found', message: 'The requested resource was not found.', path: url };
  } else if (url.includes('401') || url.includes('unauthorized')) {
    status = 401;
    statusText = 'Unauthorized';
    responseBody = { error: 'Unauthorized', message: 'Invalid or missing authentication credentials.' };
  } else if (url.includes('403')) {
    status = 403;
    statusText = 'Forbidden';
    responseBody = { error: 'Forbidden', message: 'You do not have permission to access this resource.' };
  }

  // Route-based mock responses
  else if (url.includes('/api/auth/login')) {
    if (request.method === 'POST') {
      status = 200;
      statusText = 'OK';
      responseBody = {
        token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: 1, name: 'Admin User', iat: Date.now() }))}._mock_signature`,
        refreshToken: `rt_${uuidv4()}`,
        user: { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        expiresIn: 3600
      };
    }
  } else if (url.includes('/api/auth/profile')) {
    responseBody = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User',
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: new Date().toISOString(),
    };
  } else if (url.includes('/api/users')) {
    const idMatch = url.match(/\/api\/users\/(\d+)/);

    if (request.method === 'GET') {
      if (idMatch) {
        const userId = parseInt(idMatch[1]);
        const name = randomName();
        responseBody = {
          id: userId,
          name,
          email: randomEmail(name),
          role: 'user',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
          department: 'Engineering',
          createdAt: '2024-06-15T08:30:00Z',
          updatedAt: new Date().toISOString(),
        };
      } else {
        const users = [];
        for (let i = 1; i <= 10; i++) {
          const name = randomName();
          users.push({
            id: i,
            name,
            email: randomEmail(name),
            role: i === 1 ? 'admin' : 'user',
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
            department: ['Engineering', 'Marketing', 'Sales', 'Support'][i % 4],
            createdAt: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
          });
        }
        responseBody = users;
        responseHeaders['x-total-count'] = '47';
        responseHeaders['x-page'] = '1';
        responseHeaders['x-per-page'] = '10';
      }
    } else if (request.method === 'POST') {
      status = 201;
      statusText = 'Created';
      try {
        const parsed = JSON.parse(bodyContent || '{}');
        responseBody = {
          id: randomId(),
          ...parsed,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch {
        responseBody = { id: randomId(), message: 'User created successfully', createdAt: new Date().toISOString() };
      }
    } else if (request.method === 'PUT' || request.method === 'PATCH') {
      try {
        const parsed = JSON.parse(bodyContent || '{}');
        responseBody = {
          id: idMatch ? parseInt(idMatch[1]) : randomId(),
          ...parsed,
          updatedAt: new Date().toISOString(),
        };
      } catch {
        responseBody = { id: idMatch ? parseInt(idMatch[1]) : randomId(), message: 'User updated successfully', updatedAt: new Date().toISOString() };
      }
    } else if (request.method === 'DELETE') {
      status = 204;
      statusText = 'No Content';
      responseBody = null;
    }
  } else if (url.includes('/api/products')) {
    const idMatch = url.match(/\/api\/products\/(\d+)/);

    if (request.method === 'GET') {
      if (idMatch) {
        responseBody = {
          id: parseInt(idMatch[1]),
          name: 'Wireless Headphones',
          price: 79.99,
          category: 'electronics',
          description: 'High-quality wireless headphones with noise cancellation.',
          stock: 150,
          rating: 4.5,
          reviews: 234,
          images: ['https://picsum.photos/400/400?random=1', 'https://picsum.photos/400/400?random=2'],
          createdAt: '2024-08-10T12:00:00Z',
          updatedAt: new Date().toISOString(),
        };
      } else {
        responseBody = [
          { id: 1, name: 'Wireless Headphones', price: 79.99, category: 'electronics', stock: 150, rating: 4.5 },
          { id: 2, name: 'Smart Watch', price: 199.99, category: 'electronics', stock: 75, rating: 4.2 },
          { id: 3, name: 'Running Shoes', price: 129.00, category: 'sports', stock: 200, rating: 4.7 },
          { id: 4, name: 'Backpack Pro', price: 89.99, category: 'accessories', stock: 50, rating: 4.4 },
          { id: 5, name: 'Desk Lamp LED', price: 45.00, category: 'home', stock: 300, rating: 4.1 },
        ];
      }
    } else if (request.method === 'POST') {
      status = 201;
      statusText = 'Created';
      try {
        const parsed = JSON.parse(bodyContent || '{}');
        responseBody = { id: randomId(), ...parsed, createdAt: new Date().toISOString() };
      } catch {
        responseBody = { id: randomId(), message: 'Product created successfully' };
      }
    }
  } else if (url.includes('/api/orders')) {
    const idMatch = url.match(/\/api\/orders\/([\w-]+)/);

    if (request.method === 'POST') {
      status = 201;
      statusText = 'Created';
      try {
        const parsed = JSON.parse(bodyContent || '{}');
        responseBody = {
          orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
          ...parsed,
          status: 'confirmed',
          totalAmount: 259.97,
          estimatedDelivery: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };
      } catch {
        responseBody = { orderId: `ORD-${Date.now().toString(36).toUpperCase()}`, status: 'confirmed' };
      }
    } else if (request.method === 'GET' && idMatch) {
      responseBody = {
        orderId: idMatch[1],
        status: 'shipped',
        items: [
          { productId: 42, name: 'Wireless Headphones', quantity: 2, price: 79.99 },
          { productId: 17, name: 'Running Shoes', quantity: 1, price: 129.00 },
        ],
        totalAmount: 288.98,
        shippingAddress: '123 Main St, City, ST 12345',
        trackingNumber: `TRK${randomId()}`,
        estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      };
    }
  } else if (url.includes('/api/health')) {
    responseBody = {
      status: 'healthy',
      uptime: `${Math.floor(Math.random() * 30) + 1}d ${Math.floor(Math.random() * 24)}h`,
      version: '2.1.0',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        cache: 'connected',
        queue: 'connected',
      }
    };
  } else if (url.includes('jsonplaceholder.typicode.com/posts')) {
    const idMatch = url.match(/\/posts\/(\d+)/);
    if (request.method === 'GET') {
      if (idMatch) {
        responseBody = {
          userId: 1,
          id: parseInt(idMatch[1]),
          title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
          body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
        };
      } else {
        responseBody = Array.from({ length: 5 }, (_, i) => ({
          userId: Math.ceil((i + 1) / 2),
          id: i + 1,
          title: `Post title ${i + 1}`,
          body: `This is the body of post ${i + 1}. Lorem ipsum dolor sit amet.`
        }));
      }
    } else if (request.method === 'POST') {
      status = 201;
      statusText = 'Created';
      try {
        const parsed = JSON.parse(bodyContent || '{}');
        responseBody = { id: 101, ...parsed };
      } catch {
        responseBody = { id: 101, message: 'Post created' };
      }
    } else if (request.method === 'PATCH' || request.method === 'PUT') {
      try {
        const parsed = JSON.parse(bodyContent || '{}');
        responseBody = { id: idMatch ? parseInt(idMatch[1]) : 1, ...parsed };
      } catch {
        responseBody = { id: 1, message: 'Post updated' };
      }
    }
  } else {
    // Default echo response
    responseBody = {
      message: 'Request received successfully',
      method: request.method,
      url: url,
      headers: headers,
      timestamp: new Date().toISOString(),
      body: request.body?.type === 'json' ? tryParse(bodyContent) : bodyContent || null
    };
  }

  // 4. Run Tests (Mock with extended pm sandbox)
  const testResults = [];
  if (request.tests) {
    const lines = request.tests.split('\n');
    const testBlocks = [];
    let currentTest = null;

    lines.forEach(line => {
      const testMatch = line.match(/pm\.test\s*\(\s*['"]([^'"]+)['"]/);
      if (testMatch) {
        currentTest = { name: testMatch[1], lines: [] };
        testBlocks.push(currentTest);
      }
      if (currentTest) {
        currentTest.lines.push(line);
      }
    });

    testBlocks.forEach(test => {
      const code = test.lines.join('\n');
      let passed = true;

      try {
        // Build a pm sandbox for test evaluation
        let testPassed = true;
        const assertions = [];

        const expect = (value) => {
          const chain = {
            to: {
              equal: (expected) => { assertions.push(value === expected); },
              eql: (expected) => { assertions.push(JSON.stringify(value) === JSON.stringify(expected)); },
              be: {
                an: (type) => {
                  if (type === 'array') assertions.push(Array.isArray(value));
                  else if (type === 'string') assertions.push(typeof value === 'string');
                  else if (type === 'number') assertions.push(typeof value === 'number');
                  else if (type === 'object') assertions.push(typeof value === 'object' && !Array.isArray(value));
                  else if (type === 'boolean') assertions.push(typeof value === 'boolean');
                  else assertions.push(true);
                },
                above: (n) => { assertions.push(typeof value === 'number' && value > n); },
                below: (n) => { assertions.push(typeof value === 'number' && value < n); },
                at: {
                  least: (n) => { assertions.push(typeof value === 'number' && value >= n); },
                  most: (n) => { assertions.push(typeof value === 'number' && value <= n); },
                },
                null: assertions.push(value === null),
                undefined: assertions.push(value === undefined),
                true: assertions.push(value === true),
                false: assertions.push(value === false),
                empty: {
                  get status() { assertions.push(Array.isArray(value) ? value.length === 0 : value === '' || value === null || value === undefined); return chain.to; }
                },
              },
              have: {
                status: (s) => { assertions.push(status === s); },
                property: (prop) => { assertions.push(value !== null && value !== undefined && Object.hasOwn(value, prop)); },
                jsonBody: (fn) => {
                  if (typeof fn === 'function') {
                    try { fn(responseBody); assertions.push(true); } catch { assertions.push(false); }
                  } else {
                    assertions.push(true);
                  }
                },
                length: (n) => { assertions.push(Array.isArray(value) ? value.length === n : typeof value === 'string' && value.length === n); },
                header: (h) => { assertions.push(responseHeaders[h.toLowerCase()] !== undefined); },
              },
              include: (v) => { assertions.push(typeof value === 'string' ? value.includes(v) : Array.isArray(value) ? value.includes(v) : false); },
              exist: assertions.push(value !== null && value !== undefined),
              not: {
                exist: assertions.push(value === null || value === undefined),
                equal: (expected) => { assertions.push(value !== expected); },
                include: (v) => { assertions.push(!(typeof value === 'string' ? value.includes(v) : false)); },
                be: {
                  null: assertions.push(value !== null),
                  undefined: assertions.push(value !== undefined),
                },
                have: {
                  property: (prop) => { assertions.push(!(value !== null && value !== undefined && Object.hasOwn(value, prop))); },
                }
              },
            },
          };
          return chain;
        };

        const pm = {
          test: (name, fn) => {
            try {
              fn();
              testPassed = assertions.every(a => a !== false);
            } catch {
              testPassed = false;
            }
          },
          response: {
            code: status,
            status: statusText,
            responseTime: Date.now() - startTime,
            to: {
              have: {
                status: (s) => { assertions.push(status === s); },
                header: (h) => { assertions.push(responseHeaders[h.toLowerCase()] !== undefined); },
                jsonBody: (fn) => {
                  if (typeof fn === 'function') {
                    try { fn(responseBody); assertions.push(true); } catch { assertions.push(false); }
                  }
                },
              },
            },
            json: () => responseBody,
            text: () => typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
          },
          environment: {
            get: (key) => (effectiveEnvironment?.variables || []).find(v => v.key === key)?.value || '',
            set: () => {},
          },
          globals: {
            get: () => '',
            set: () => {},
          },
          variables: {
            get: (key) => (effectiveEnvironment?.variables || []).find(v => v.key === key)?.value || '',
          },
          expect,
        };

        // Status code checks (fallback pattern)
        const statusMatch = code.match(/status\((\d+)\)/);
        if (statusMatch) {
          testPassed = status === parseInt(statusMatch[1]);
        }

        // Check for array response
        if (code.includes("be.an('array')") || code.includes('be.an("array")')) {
          testPassed = Array.isArray(responseBody);
        }

        // Check for token existence
        if (code.includes('token') && code.includes('to.exist')) {
          testPassed = responseBody && responseBody.token !== undefined;
        }

        // Check for response time
        const timeMatch = code.match(/responseTime\)\.to\.be\.below\((\d+)\)/);
        if (timeMatch) {
          testPassed = time < parseInt(timeMatch[1]);
        }

        // Check for property
        const propMatch = code.match(/\.to\.have\.property\(['"]([^'"]+)['"]\)/);
        if (propMatch) {
          testPassed = responseBody !== null && responseBody !== undefined && Object.hasOwn(responseBody, propMatch[1]);
        }

        // Check jsonBody is array
        if (code.includes('jsonBody') && code.includes('Array.isArray')) {
          testPassed = Array.isArray(responseBody);
        }

        passed = testPassed;
      } catch {
        passed = false;
      }

      testResults.push({ name: test.name, passed });
    });

    // If tests are defined but no pm.test blocks found
    if (testResults.length === 0 && request.tests.trim().length > 0) {
      testResults.push({ name: 'Custom Script Execution', passed: true });
    }
  }

  return {
    id: uuidv4(),
    statusCode: status,
    statusText,
    time,
    size: responseBody ? JSON.stringify(responseBody).length : 0,
    body: responseBody,
    headers: responseHeaders,
    cookies: status >= 400 ? [] : cookies,
    testResults
  };
};

const tryParse = (str) => {
  try { return JSON.parse(str); } catch { return str; }
};
