# Xostman Mock — Data Model

> This document defines all entity types, their fields, relationships, and example values.
> The dev agent should use this as the reference for `createInitialData()` in `utils/initialData.js`.

---

## Entity Types

### 1. Workspace

The top-level container. For this mock, we have a single workspace pre-loaded.

```javascript
{
  id: "ws_1",                           // string, unique ID
  name: "My Workspace",                 // string
  type: "personal",                     // "personal" | "team"
  description: "Default personal workspace"
}
```

### 2. Collection

A named group of API requests, optionally organized into folders.

```javascript
{
  id: "col_1",                          // string, unique ID
  name: "User Management API",          // string
  description: "CRUD operations for user management", // string, optional
  auth: { type: "none" },               // AuthConfig, inherited by child requests
  variables: [],                         // CollectionVariable[], collection-scoped variables
  folders: [/* Folder[] */],
  requests: [/* Request[] */],           // top-level requests (not in folders)
  createdAt: "2024-11-15T10:30:00Z",
  updatedAt: "2025-01-20T14:22:00Z"
}
```

### 3. Folder

A sub-grouping within a collection. Can contain requests.

```javascript
{
  id: "folder_1",                       // string, unique ID
  name: "Authentication",               // string
  description: "",                       // string, optional
  auth: { type: "inherit" },            // AuthConfig, inherits from parent collection
  requests: [/* Request[] */]
}
```

### 4. Request

The core entity — an API request with all its configuration.

```javascript
{
  id: "req_1",                          // string, unique ID
  name: "Get All Users",               // string
  description: "",                       // string, markdown supported
  method: "GET",                        // "GET"|"POST"|"PUT"|"DELETE"|"PATCH"|"HEAD"|"OPTIONS"
  url: "{{baseUrl}}/api/users",         // string, supports {{variable}} syntax
  params: [                             // QueryParam[]
    { id: "p1", key: "page", value: "1", description: "Page number", enabled: true },
    { id: "p2", key: "limit", value: "10", description: "Items per page", enabled: true }
  ],
  auth: {                               // AuthConfig
    type: "bearer",                     // "none"|"inherit"|"apikey"|"bearer"|"basic"
    bearer: { token: "{{authToken}}" },
    // OR basic: { username: "admin", password: "{{adminPass}}" }
    // OR apikey: { key: "X-API-Key", value: "{{apiKey}}", addTo: "header" }
  },
  headers: [                            // Header[]
    { id: "h1", key: "Content-Type", value: "application/json", description: "", enabled: true },
    { id: "h2", key: "Accept", value: "application/json", description: "", enabled: true }
  ],
  body: {                               // RequestBody
    type: "json",                       // "none"|"json"|"text"|"xml"|"html"|"formdata"|"urlencoded"|"raw"|"binary"|"graphql"
    content: "{\n  \"name\": \"John\"\n}", // string, raw content
    formData: [],                        // FormDataField[], for formdata type
    urlencoded: []                       // FormDataField[], for urlencoded type
  },
  preRequest: "",                        // string, JavaScript pre-request script
  tests: "",                            // string, JavaScript test script
  savedAt: "2025-01-20T14:22:00Z"
}
```

### 5. QueryParam / Header / FormDataField

Key-value pair with enable toggle.

```javascript
// QueryParam and Header share the same shape
{
  id: "p1",                             // string, unique ID
  key: "page",                          // string
  value: "1",                           // string
  description: "Page number",           // string, optional
  enabled: true                         // boolean
}

// FormDataField adds a type field
{
  id: "fd1",
  key: "file",
  value: "",                            // string (filename or value)
  description: "",
  type: "text",                         // "text" | "file"
  enabled: true
}
```

### 6. AuthConfig

Authorization configuration that can be set at collection, folder, or request level.

```javascript
// No Auth
{ type: "none" }

// Inherit from parent
{ type: "inherit" }

// API Key
{
  type: "apikey",
  apikey: {
    key: "X-API-Key",                   // string, header/param name
    value: "abc123",                    // string, the key value
    addTo: "header"                     // "header" | "queryParams"
  }
}

// Bearer Token
{
  type: "bearer",
  bearer: {
    token: "eyJhbGciOiJIUzI1NiIs..."   // string
  }
}

// Basic Auth
{
  type: "basic",
  basic: {
    username: "admin",                  // string
    password: "secret123"              // string
  }
}
```

### 7. Environment

A named set of variables that can be activated to inject values into requests.

```javascript
{
  id: "env_1",                          // string, unique ID
  name: "Development",                  // string
  color: "#00AA55",                     // string, optional color indicator
  variables: [                          // EnvironmentVariable[]
    {
      id: "v1",
      key: "baseUrl",                   // string, variable name
      value: "https://api.dev.example.com", // string, current/local value
      description: "Base URL for API",  // string, optional
      enabled: true                     // boolean
    }
  ],
  createdAt: "2024-11-15T10:30:00Z"
}
```

### 8. HistoryItem

A logged past request.

```javascript
{
  id: "hist_1",                         // string, unique ID
  timestamp: 1706806920000,             // number, Unix timestamp in ms
  method: "GET",                        // string
  url: "https://api.dev.example.com/users", // string, resolved URL
  statusCode: 200,                      // number, response status
  responseTime: 245                     // number, ms
}
```

### 9. Tab

An open request tab in the workbench.

```javascript
{
  id: "tab_1",                          // string, unique ID
  type: "request",                      // "request" | "collection" | "environment"
  name: "Get All Users",               // string, display name
  method: "GET",                        // string, for request tabs
  requestId: "req_1",                   // string | null, linked to saved request
  isDirty: false,                       // boolean, unsaved changes indicator
  request: { /* full Request object */ }, // the working copy of the request
  response: null                        // Response | null, last response for this tab
}
```

### 10. Response

The result of executing a request (mock).

```javascript
{
  id: "resp_1",                         // string, unique ID
  statusCode: 200,                      // number
  statusText: "OK",                     // string
  time: 245,                           // number, ms
  size: 1234,                          // number, bytes
  body: { /* parsed JSON or raw string */ },
  headers: {                            // object, key-value pairs
    "content-type": "application/json",
    "date": "Mon, 20 Jan 2025 14:22:00 GMT",
    "server": "MockServer/1.0",
    "x-request-id": "abc-123-def"
  },
  cookies: [                            // Cookie[]
    {
      name: "session_id",
      value: "abc123def456",
      domain: "api.example.com",
      path: "/",
      httpOnly: true,
      secure: true
    }
  ],
  testResults: [                        // TestResult[]
    { name: "Status is 200", passed: true },
    { name: "Response has users array", passed: true }
  ]
}
```

---

## Relationships

```
Workspace
  └── Collections[]
        ├── Folders[]
        │     └── Requests[]
        └── Requests[] (top-level, outside folders)

Environments[] (independent, workspace-level)

Tabs[] (open items in workbench, each references a Request working copy)

History[] (auto-logged, workspace-level, chronological)
```

---

## Suggested `createInitialData()` Structure

```javascript
export const INITIAL_STATE = {
  // Workspace info
  workspace: {
    id: "ws_default",
    name: "My Workspace",
    type: "personal"
  },

  // Collections with folders and requests
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
          auth: { type: "inherit" },
          requests: [
            {
              id: "req_1",
              name: "Get All Users",
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
              body: { type: "none", content: "" },
              preRequest: "",
              tests: "pm.test('Status is 200', function() {\n    pm.response.to.have.status(200);\n});\n\npm.test('Response is an array', function() {\n    const data = pm.response.json();\n    pm.expect(data).to.be.an('array');\n});"
            },
            {
              id: "req_2",
              name: "Get User by ID",
              method: "GET",
              url: "{{baseUrl}}/api/users/1",
              params: [],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "" },
              preRequest: "",
              tests: "pm.test('Status is 200', function() {\n    pm.response.to.have.status(200);\n});"
            },
            {
              id: "req_3",
              name: "Create User",
              method: "POST",
              url: "{{baseUrl}}/api/users",
              params: [],
              auth: { type: "inherit" },
              headers: [
                { id: "h2", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"name\": \"John Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"role\": \"user\"\n}"
              },
              preRequest: "",
              tests: "pm.test('Status is 201', function() {\n    pm.response.to.have.status(201);\n});"
            },
            {
              id: "req_4",
              name: "Update User",
              method: "PUT",
              url: "{{baseUrl}}/api/users/1",
              params: [],
              auth: { type: "inherit" },
              headers: [
                { id: "h3", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"name\": \"John Updated\",\n  \"email\": \"john.updated@example.com\"\n}"
              },
              preRequest: "",
              tests: ""
            },
            {
              id: "req_5",
              name: "Delete User",
              method: "DELETE",
              url: "{{baseUrl}}/api/users/1",
              params: [],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "" },
              preRequest: "",
              tests: "pm.test('Status is 204', function() {\n    pm.response.to.have.status(204);\n});"
            }
          ]
        },
        {
          id: "folder_2",
          name: "Authentication",
          auth: { type: "none" },
          requests: [
            {
              id: "req_6",
              name: "Login",
              method: "POST",
              url: "{{baseUrl}}/api/auth/login",
              params: [],
              auth: { type: "none" },
              headers: [
                { id: "h4", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"password123\"\n}"
              },
              preRequest: "",
              tests: "pm.test('Status is 200', function() {\n    pm.response.to.have.status(200);\n});\n\npm.test('Has auth token', function() {\n    const data = pm.response.json();\n    pm.expect(data.token).to.exist;\n});"
            },
            {
              id: "req_7",
              name: "Get Profile",
              method: "GET",
              url: "{{baseUrl}}/api/auth/profile",
              params: [],
              auth: { type: "bearer", bearer: { token: "{{authToken}}" } },
              headers: [],
              body: { type: "none", content: "" },
              preRequest: "",
              tests: ""
            }
          ]
        }
      ],
      requests: []  // no top-level requests in this collection
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
          auth: { type: "inherit" },
          requests: [
            {
              id: "req_8",
              name: "List Products",
              method: "GET",
              url: "{{baseUrl}}/api/products",
              params: [
                { id: "p3", key: "category", value: "electronics", description: "Filter by category", enabled: true },
                { id: "p4", key: "sort", value: "price_asc", description: "Sort order", enabled: false }
              ],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "" },
              preRequest: "",
              tests: ""
            },
            {
              id: "req_9",
              name: "Get Product Details",
              method: "GET",
              url: "{{baseUrl}}/api/products/42",
              params: [],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "" },
              preRequest: "",
              tests: ""
            },
            {
              id: "req_10",
              name: "Create Product",
              method: "POST",
              url: "{{baseUrl}}/api/products",
              params: [],
              auth: { type: "inherit" },
              headers: [
                { id: "h5", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"name\": \"Wireless Headphones\",\n  \"price\": 79.99,\n  \"category\": \"electronics\",\n  \"stock\": 150\n}"
              },
              preRequest: "",
              tests: ""
            }
          ]
        },
        {
          id: "folder_4",
          name: "Orders",
          auth: { type: "inherit" },
          requests: [
            {
              id: "req_11",
              name: "Create Order",
              method: "POST",
              url: "{{baseUrl}}/api/orders",
              params: [],
              auth: { type: "inherit" },
              headers: [
                { id: "h6", key: "Content-Type", value: "application/json", description: "", enabled: true }
              ],
              body: {
                type: "json",
                content: "{\n  \"items\": [\n    { \"productId\": 42, \"quantity\": 2 },\n    { \"productId\": 17, \"quantity\": 1 }\n  ],\n  \"shippingAddress\": \"123 Main St, City, ST 12345\"\n}"
              },
              preRequest: "",
              tests: ""
            },
            {
              id: "req_12",
              name: "Get Order Status",
              method: "GET",
              url: "{{baseUrl}}/api/orders/{{orderId}}",
              params: [],
              auth: { type: "inherit" },
              headers: [],
              body: { type: "none", content: "" },
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
          method: "GET",
          url: "{{baseUrl}}/api/health",
          params: [],
          auth: { type: "none" },
          headers: [],
          body: { type: "none", content: "" },
          preRequest: "",
          tests: "pm.test('API is healthy', function() {\n    pm.response.to.have.status(200);\n});"
        }
      ]
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
          method: "GET",
          url: "https://jsonplaceholder.typicode.com/posts",
          params: [
            { id: "p5", key: "_limit", value: "5", description: "Limit results", enabled: true }
          ],
          auth: { type: "none" },
          headers: [],
          body: { type: "none", content: "" },
          preRequest: "",
          tests: ""
        },
        {
          id: "req_15",
          name: "Create Post",
          method: "POST",
          url: "https://jsonplaceholder.typicode.com/posts",
          params: [],
          auth: { type: "none" },
          headers: [
            { id: "h7", key: "Content-Type", value: "application/json", description: "", enabled: true }
          ],
          body: {
            type: "json",
            content: "{\n  \"title\": \"My New Post\",\n  \"body\": \"This is the post content.\",\n  \"userId\": 1\n}"
          },
          preRequest: "",
          tests: ""
        },
        {
          id: "req_16",
          name: "Update Post",
          method: "PATCH",
          url: "https://jsonplaceholder.typicode.com/posts/1",
          params: [],
          auth: { type: "none" },
          headers: [
            { id: "h8", key: "Content-Type", value: "application/json", description: "", enabled: true }
          ],
          body: {
            type: "json",
            content: "{\n  \"title\": \"Updated Title\"\n}"
          },
          preRequest: "",
          tests: ""
        }
      ]
    }
  ],

  // Environments
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
      ]
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
      ]
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
      ]
    }
  ],

  // Active environment
  activeEnvironmentId: "env_1",

  // Open tabs
  tabs: [
    {
      id: "tab_1",
      type: "request",
      name: "Get All Users",
      method: "GET",
      requestId: "req_1",
      collectionId: "col_1",
      isDirty: false
    }
  ],
  activeTabId: "tab_1",

  // Current working request (loaded into the active tab)
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
    body: { type: "none", content: "" },
    preRequest: "",
    tests: "pm.test('Status is 200', function() {\n    pm.response.to.have.status(200);\n});\n\npm.test('Response is an array', function() {\n    const data = pm.response.json();\n    pm.expect(data).to.be.an('array');\n});"
  },

  // Active request reference
  activeRequestId: "req_1",

  // Response (null until a request is sent)
  response: null,

  // History
  history: [
    { id: "hist_1", timestamp: Date.now() - 3600000, method: "GET", url: "https://api.dev.example.com/api/users", statusCode: 200, responseTime: 245 },
    { id: "hist_2", timestamp: Date.now() - 7200000, method: "POST", url: "https://api.dev.example.com/api/users", statusCode: 201, responseTime: 312 },
    { id: "hist_3", timestamp: Date.now() - 10800000, method: "GET", url: "https://api.dev.example.com/api/products", statusCode: 200, responseTime: 178 },
    { id: "hist_4", timestamp: Date.now() - 14400000, method: "DELETE", url: "https://api.dev.example.com/api/users/5", statusCode: 204, responseTime: 89 },
    { id: "hist_5", timestamp: Date.now() - 86400000, method: "GET", url: "https://jsonplaceholder.typicode.com/posts", statusCode: 200, responseTime: 456 }
  ],

  // Global variables (always available regardless of environment)
  globalVariables: [
    { id: "gv1", key: "appVersion", value: "2.1.0", description: "Application version", enabled: true }
  ]
};
```

---

## Mock Network Response Rules

The mock network layer (`utils/mockNetwork.js`) should generate realistic responses based on URL patterns:

| URL Pattern | Method | Status | Response Body |
|---|---|---|---|
| `/api/users` | GET | 200 | Array of 3-5 user objects with id, name, email, role, avatar, createdAt |
| `/api/users/:id` | GET | 200 | Single user object |
| `/api/users` | POST | 201 | Created user with generated id |
| `/api/users/:id` | PUT | 200 | Updated user |
| `/api/users/:id` | DELETE | 204 | Empty body |
| `/api/auth/login` | POST | 200 | `{ token: "...", user: {...} }` |
| `/api/auth/profile` | GET | 200 | User profile object |
| `/api/products` | GET | 200 | Array of 5-8 product objects |
| `/api/products/:id` | GET | 200 | Single product |
| `/api/products` | POST | 201 | Created product |
| `/api/orders` | POST | 201 | Created order with orderId, status |
| `/api/orders/:id` | GET | 200 | Order with items, status, timestamps |
| `/api/health` | GET | 200 | `{ status: "ok", uptime: "..." }` |
| `*error*` | any | 500 | `{ error: "Internal Server Error" }` |
| `*404*` or `*notfound*` | any | 404 | `{ error: "Not Found" }` |
| `*unauthorized*` or `*401*` | any | 401 | `{ error: "Unauthorized" }` |
| Default | any | 200 | Echo of request details |
