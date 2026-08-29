import { v4 as uuidv4 } from 'uuid';

// Method color helper
export const getMethodColor = (method) => {
  const colors = {
    GET: '#00AA55',
    POST: '#EAB308',
    PUT: '#2563EB',
    DELETE: '#EF4444',
    PATCH: '#8B5CF6',
    HEAD: '#6B7280',
    OPTIONS: '#6B7280',
  };
  return colors[method] || '#6B7280';
};

export const getMethodClass = (method) => {
  return `method-${method.toLowerCase()}`;
};

export const INITIAL_STATE = {
  workspace: {
    id: "ws_default",
    name: "My Workspace",
    type: "personal"
  },

  collections: [
    {
      id: "col_1",
      name: "User Management API",
      description: "CRUD endpoints for managing users",
      auth: { type: "bearer", bearer: { token: "{{authToken}}" } },
      variables: [],
      folders: [
        {
          id: "folder_1",
          name: "Users",
          description: "",
          auth: { type: "inherit" },
          requests: [
            {
              id: "req_1",
              name: "Get All Users",
              description: "",
              method: "GET",
              url: "{{baseUrl}}/api/users",
              params: [
                { id: "p1", key: "page", value: "1", description: "Page number", enabled: true },
                { id: "p2", key: "limit", value: "10", description: "Items per page", enabled: true }
              ],
              auth: { type: "inherit" },
              headers: [
                { id: "h1", key: "Accept", value: "application/json", description: "", enabled: true }
              ],
              body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
              preRequest: "",
              tests: "pm.test('Status is 200', function() {\n    pm.response.to.have.status(200);\n});\n\npm.test('Response is an array', function() {\n    const data = pm.response.json();\n    pm.expect(data).to.be.an('array');\n});"
            },
            {
              id: "req_2",
              name: "Get User by ID",
              description: "",
              method: "GET",
              url: "{{baseUrl}}/api/users/1",
              params: [],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
              preRequest: "",
              tests: "pm.test('Status is 200', function() {\n    pm.response.to.have.status(200);\n});"
            },
            {
              id: "req_3",
              name: "Create User",
              description: "",
              method: "POST",
              url: "{{baseUrl}}/api/users",
              params: [],
              auth: { type: "inherit" },
              headers: [
                { id: "h2", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"name\": \"John Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"role\": \"user\"\n}",
                formData: [], urlencoded: [], graphql: { query: "", variables: "" }
              },
              preRequest: "",
              tests: "pm.test('Status is 201', function() {\n    pm.response.to.have.status(201);\n});"
            },
            {
              id: "req_4",
              name: "Update User",
              description: "",
              method: "PUT",
              url: "{{baseUrl}}/api/users/1",
              params: [],
              auth: { type: "inherit" },
              headers: [
                { id: "h3", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"name\": \"John Updated\",\n  \"email\": \"john.updated@example.com\"\n}",
                formData: [], urlencoded: [], graphql: { query: "", variables: "" }
              },
              preRequest: "",
              tests: ""
            },
            {
              id: "req_5",
              name: "Delete User",
              description: "",
              method: "DELETE",
              url: "{{baseUrl}}/api/users/1",
              params: [],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
              preRequest: "",
              tests: "pm.test('Status is 204', function() {\n    pm.response.to.have.status(204);\n});"
            }
          ]
        },
        {
          id: "folder_2",
          name: "Authentication",
          description: "",
          auth: { type: "none" },
          requests: [
            {
              id: "req_6",
              name: "Login",
              description: "",
              method: "POST",
              url: "{{baseUrl}}/api/auth/login",
              params: [],
              auth: { type: "none" },
              headers: [
                { id: "h4", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"password123\"\n}",
                formData: [], urlencoded: [], graphql: { query: "", variables: "" }
              },
              preRequest: "",
              tests: "pm.test('Status is 200', function() {\n    pm.response.to.have.status(200);\n});\n\npm.test('Has auth token', function() {\n    const data = pm.response.json();\n    pm.expect(data.token).to.exist;\n});"
            },
            {
              id: "req_7",
              name: "Get Profile",
              description: "",
              method: "GET",
              url: "{{baseUrl}}/api/auth/profile",
              params: [],
              auth: { type: "bearer", bearer: { token: "{{authToken}}" } },
              headers: [],
              body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
              preRequest: "",
              tests: ""
            }
          ]
        }
      ],
      requests: [],
      createdAt: "2024-11-15T10:30:00Z",
      updatedAt: "2025-01-20T14:22:00Z"
    },
    {
      id: "col_2",
      name: "E-Commerce API",
      description: "Product catalog and order management",
      auth: { type: "apikey", apikey: { key: "X-API-Key", value: "{{apiKey}}", addTo: "header" } },
      variables: [],
      folders: [
        {
          id: "folder_3",
          name: "Products",
          description: "",
          auth: { type: "inherit" },
          requests: [
            {
              id: "req_8",
              name: "List Products",
              description: "",
              method: "GET",
              url: "{{baseUrl}}/api/products",
              params: [
                { id: "p3", key: "category", value: "electronics", description: "Filter by category", enabled: true },
                { id: "p4", key: "sort", value: "price_asc", description: "Sort order", enabled: false }
              ],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
              preRequest: "",
              tests: ""
            },
            {
              id: "req_9",
              name: "Get Product Details",
              description: "",
              method: "GET",
              url: "{{baseUrl}}/api/products/42",
              params: [],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
              preRequest: "",
              tests: ""
            },
            {
              id: "req_10",
              name: "Create Product",
              description: "",
              method: "POST",
              url: "{{baseUrl}}/api/products",
              params: [],
              auth: { type: "inherit" },
              headers: [
                { id: "h5", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"name\": \"Wireless Headphones\",\n  \"price\": 79.99,\n  \"category\": \"electronics\",\n  \"stock\": 150\n}",
                formData: [], urlencoded: [], graphql: { query: "", variables: "" }
              },
              preRequest: "",
              tests: ""
            }
          ]
        },
        {
          id: "folder_4",
          name: "Orders",
          description: "",
          auth: { type: "inherit" },
          requests: [
            {
              id: "req_11",
              name: "Create Order",
              description: "",
              method: "POST",
              url: "{{baseUrl}}/api/orders",
              params: [],
              auth: { type: "inherit" },
              headers: [
                { id: "h6", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"items\": [\n    { \"productId\": 42, \"quantity\": 2 },\n    { \"productId\": 17, \"quantity\": 1 }\n  ],\n  \"shippingAddress\": \"123 Main St, City, ST 12345\"\n}",
                formData: [], urlencoded: [], graphql: { query: "", variables: "" }
              },
              preRequest: "",
              tests: ""
            },
            {
              id: "req_12",
              name: "Get Order Status",
              description: "",
              method: "GET",
              url: "{{baseUrl}}/api/orders/{{orderId}}",
              params: [],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
              preRequest: "",
              tests: ""
            }
          ]
        }
      ],
      requests: [
        {
          id: "req_13",
          name: "Health Check",
          description: "",
          method: "GET",
          url: "{{baseUrl}}/api/health",
          params: [],
          auth: { type: "none" },
          headers: [],
          body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
          preRequest: "",
          tests: "pm.test('API is healthy', function() {\n    pm.response.to.have.status(200);\n});"
        }
      ],
      createdAt: "2024-12-01T09:00:00Z",
      updatedAt: "2025-01-18T11:30:00Z"
    },
    {
      id: "col_3",
      name: "JSONPlaceholder",
      description: "Free fake API for testing - https://jsonplaceholder.typicode.com",
      auth: { type: "none" },
      variables: [],
      folders: [],
      requests: [
        {
          id: "req_14",
          name: "Get Posts",
          description: "",
          method: "GET",
          url: "https://jsonplaceholder.typicode.com/posts",
          params: [
            { id: "p5", key: "_limit", value: "5", description: "Limit results", enabled: true }
          ],
          auth: { type: "none" },
          headers: [],
          body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
          preRequest: "",
          tests: ""
        },
        {
          id: "req_15",
          name: "Create Post",
          description: "",
          method: "POST",
          url: "https://jsonplaceholder.typicode.com/posts",
          params: [],
          auth: { type: "none" },
          headers: [
            { id: "h7", key: "Content-Type", value: "application/json", description: "", enabled: true }
          ],
          body: {
            type: "json",
            content: "{\n  \"title\": \"My New Post\",\n  \"body\": \"This is the post content.\",\n  \"userId\": 1\n}",
            formData: [], urlencoded: [], graphql: { query: "", variables: "" }
          },
          preRequest: "",
          tests: ""
        },
        {
          id: "req_16",
          name: "Update Post",
          description: "",
          method: "PATCH",
          url: "https://jsonplaceholder.typicode.com/posts/1",
          params: [],
          auth: { type: "none" },
          headers: [
            { id: "h8", key: "Content-Type", value: "application/json", description: "", enabled: true }
          ],
          body: {
            type: "json",
            content: "{\n  \"title\": \"Updated Title\"\n}",
            formData: [], urlencoded: [], graphql: { query: "", variables: "" }
          },
          preRequest: "",
          tests: ""
        }
      ],
      createdAt: "2025-01-05T16:00:00Z",
      updatedAt: "2025-01-10T09:15:00Z"
    }
  ],

  environments: [
    {
      id: "env_1",
      name: "Development",
      color: "#00AA55",
      variables: [
        { id: "v1", key: "baseUrl", value: "https://api.dev.example.com", description: "Base URL", enabled: true },
        { id: "v2", key: "authToken", value: "dev-token-abc123xyz", description: "Auth token", enabled: true },
        { id: "v3", key: "apiKey", value: "dev-key-12345", description: "API Key", enabled: true },
        { id: "v4", key: "orderId", value: "ORD-2024-001", description: "Test order ID", enabled: true }
      ],
      createdAt: "2024-11-15T10:30:00Z"
    },
    {
      id: "env_2",
      name: "Staging",
      color: "#EAB308",
      variables: [
        { id: "v5", key: "baseUrl", value: "https://api.staging.example.com", description: "Base URL", enabled: true },
        { id: "v6", key: "authToken", value: "staging-token-def456uvw", description: "Auth token", enabled: true },
        { id: "v7", key: "apiKey", value: "staging-key-67890", description: "API Key", enabled: true },
        { id: "v8", key: "orderId", value: "ORD-2024-STG-001", description: "Test order ID", enabled: true }
      ],
      createdAt: "2024-12-01T09:00:00Z"
    },
    {
      id: "env_3",
      name: "Production",
      color: "#EF4444",
      variables: [
        { id: "v9", key: "baseUrl", value: "https://api.example.com", description: "Base URL", enabled: true },
        { id: "v10", key: "authToken", value: "", description: "Auth token - set before use", enabled: true },
        { id: "v11", key: "apiKey", value: "", description: "API Key - set before use", enabled: true },
        { id: "v12", key: "orderId", value: "", description: "Order ID", enabled: false }
      ],
      createdAt: "2025-01-01T00:00:00Z"
    }
  ],

  activeEnvironmentId: "env_1",

  tabs: [
    {
      id: "tab_1",
      type: "request",
      name: "Get All Users",
      method: "GET",
      requestId: "req_1",
      collectionId: "col_1",
      isDirty: false,
      request: {
        method: "GET",
        url: "{{baseUrl}}/api/users",
        params: [
          { id: "p1", key: "page", value: "1", description: "Page number", enabled: true },
          { id: "p2", key: "limit", value: "10", description: "Items per page", enabled: true }
        ],
        auth: { type: "inherit" },
        headers: [
          { id: "h1", key: "Accept", value: "application/json", description: "", enabled: true }
        ],
        body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
        preRequest: "",
        tests: "pm.test('Status is 200', function() {\n    pm.response.to.have.status(200);\n});\n\npm.test('Response is an array', function() {\n    const data = pm.response.json();\n    pm.expect(data).to.be.an('array');\n});"
      },
      response: null
    }
  ],
  activeTabId: "tab_1",

  currentRequest: {
    method: "GET",
    url: "{{baseUrl}}/api/users",
    params: [
      { id: "p1", key: "page", value: "1", description: "Page number", enabled: true },
      { id: "p2", key: "limit", value: "10", description: "Items per page", enabled: true }
    ],
    auth: { type: "inherit" },
    headers: [
      { id: "h1", key: "Accept", value: "application/json", description: "", enabled: true }
    ],
    body: { type: "none", content: "", formData: [], urlencoded: [], graphql: { query: "", variables: "" } },
    preRequest: "",
    tests: "pm.test('Status is 200', function() {\n    pm.response.to.have.status(200);\n});\n\npm.test('Response is an array', function() {\n    const data = pm.response.json();\n    pm.expect(data).to.be.an('array');\n});"
  },

  activeRequestId: "req_1",
  response: null,

  history: [
    { id: "hist_1", timestamp: Date.now() - 3600000, method: "GET", url: "https://api.dev.example.com/api/users", statusCode: 200, responseTime: 245 },
    { id: "hist_2", timestamp: Date.now() - 7200000, method: "POST", url: "https://api.dev.example.com/api/users", statusCode: 201, responseTime: 312 },
    { id: "hist_3", timestamp: Date.now() - 10800000, method: "GET", url: "https://api.dev.example.com/api/products", statusCode: 200, responseTime: 178 },
    { id: "hist_4", timestamp: Date.now() - 14400000, method: "DELETE", url: "https://api.dev.example.com/api/users/5", statusCode: 204, responseTime: 89 },
    { id: "hist_5", timestamp: Date.now() - 86400000, method: "GET", url: "https://jsonplaceholder.typicode.com/posts", statusCode: 200, responseTime: 456 }
  ],

  globalVariables: [
    { id: "gv1", key: "appVersion", value: "2.1.0", description: "Application version", enabled: true }
  ],

  // UI state
  sidebarPanel: "collections", // "collections" | "environments" | "history" | "apis" | "mockservers" | "monitors"
  splitRatio: 50
};

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'postman_clone_state';
const BASE_INITIAL_KEY = 'postman_clone_initialState';

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
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) { console.log('No custom state available'); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {});
};

export const getStoredInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Array item normalizers ---

function normalizeHeader(header, index) {
  return {
    id: header.id || `hdr_custom_${index}`,
    key: header.key || header.name || '',
    value: header.value || '',
    description: header.description || '',
    enabled: typeof header.enabled === 'boolean' ? header.enabled : true,
  };
}

function normalizeParam(param, index) {
  return {
    id: param.id || `param_custom_${index}`,
    key: param.key || param.name || '',
    value: param.value || '',
    description: param.description || '',
    enabled: typeof param.enabled === 'boolean' ? param.enabled : true,
  };
}

function normalizeBody(body) {
  if (!body || typeof body !== 'object') return { type: 'none', content: '', formData: [], urlencoded: [], graphql: { query: '', variables: '' } };
  return {
    type: body.type || 'none',
    content: body.content || body.text || body.raw || '',
    formData: Array.isArray(body.formData) ? body.formData : [],
    urlencoded: Array.isArray(body.urlencoded) ? body.urlencoded : [],
    graphql: body.graphql || { query: '', variables: '' },
  };
}

function normalizeAuth(auth) {
  if (!auth || typeof auth !== 'object') return { type: 'none' };
  return auth;
}

function normalizeRequest(request, index) {
  return {
    id: request.id || `req_custom_${index}`,
    name: request.name || request.title || `Request ${index + 1}`,
    description: request.description || '',
    method: request.method || 'GET',
    url: request.url || '',
    params: Array.isArray(request.params) ? request.params.map((p, i) => normalizeParam(p, i)) : [],
    headers: Array.isArray(request.headers) ? request.headers.map((h, i) => normalizeHeader(h, i)) : [],
    body: normalizeBody(request.body),
    auth: normalizeAuth(request.auth),
    tests: request.tests || '',
    preRequest: request.preRequest || '',
  };
}

function normalizeFolder(folder, index) {
  return {
    id: folder.id || `folder_custom_${index}`,
    name: folder.name || folder.title || `Folder ${index + 1}`,
    description: folder.description || '',
    auth: normalizeAuth(folder.auth),
    requests: Array.isArray(folder.requests) ? folder.requests.map((r, i) => normalizeRequest(r, i)) : [],
  };
}

function normalizeCollection(collection, index) {
  return {
    id: collection.id || `col_custom_${index}`,
    name: collection.name || collection.title || `Collection ${index + 1}`,
    description: collection.description || '',
    auth: normalizeAuth(collection.auth),
    variables: Array.isArray(collection.variables) ? collection.variables : [],
    folders: Array.isArray(collection.folders) ? collection.folders.map((f, i) => normalizeFolder(f, i)) : [],
    requests: Array.isArray(collection.requests) ? collection.requests.map((r, i) => normalizeRequest(r, i)) : [],
  };
}

function normalizeVariable(variable, index) {
  return {
    id: variable.id || `var_custom_${index}`,
    key: variable.key || variable.name || '',
    value: variable.value || '',
    description: variable.description || '',
    enabled: typeof variable.enabled === 'boolean' ? variable.enabled : true,
  };
}

function normalizeEnvironment(env, index) {
  return {
    id: env.id || `env_custom_${index}`,
    name: env.name || env.title || `Environment ${index + 1}`,
    color: env.color || '#6B7280',
    variables: Array.isArray(env.variables) ? env.variables.map((v, i) => normalizeVariable(v, i)) : [],
  };
}

function normalizeHistoryItem(item, index) {
  return {
    id: item.id || `hist_custom_${index}`,
    timestamp: item.timestamp || Date.now(),
    method: item.method || 'GET',
    url: item.url || '',
    statusCode: item.statusCode || 200,
    responseTime: item.responseTime || 0,
  };
}

function normalizeTab(tab, index) {
  return {
    id: tab.id || `tab_custom_${index}`,
    type: tab.type || 'request',
    name: tab.name || 'Untitled Request',
    method: tab.method || 'GET',
    requestId: tab.requestId || null,
    collectionId: tab.collectionId || null,
    isDirty: typeof tab.isDirty === 'boolean' ? tab.isDirty : false,
    request: tab.request ? normalizeRequest(tab.request, 0) : null,
    response: tab.response || null,
  };
}

const arrayNormalizers = {
  collections: normalizeCollection,
  environments: normalizeEnvironment,
  history: normalizeHistoryItem,
  tabs: normalizeTab,
  globalVariables: normalizeVariable,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item, i) => arrayNormalizers[key](item, i));
      } else if (key === 'currentRequest' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        const cr = custom[key];
        result[key] = {
          method: cr.method || defaults.currentRequest.method || 'GET',
          url: cr.url || defaults.currentRequest.url || '',
          params: Array.isArray(cr.params) ? cr.params.map((p, i) => normalizeParam(p, i)) : defaults.currentRequest.params || [],
          headers: Array.isArray(cr.headers) ? cr.headers.map((h, i) => normalizeHeader(h, i)) : defaults.currentRequest.headers || [],
          body: normalizeBody(cr.body || defaults.currentRequest.body),
          auth: normalizeAuth(cr.auth || defaults.currentRequest.auth),
          tests: cr.tests || defaults.currentRequest.tests || '',
          preRequest: cr.preRequest || defaults.currentRequest.preRequest || '',
        };
      } else if (key === 'workspace' && typeof custom[key] === 'object') {
        result[key] = { ...defaults.workspace, ...custom[key] };
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

function createDefaultData() {
  return { ...INITIAL_STATE };
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = deepMergeWithDefaults(createDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = createDefaultData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
