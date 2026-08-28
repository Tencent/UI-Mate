# postman_mock Schema

**Deploy order**: 37 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8037)
**Base URL**: `http://172.17.46.46:8037/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `workspace` | object | Active workspace metadata: `{id, name, type}` |
| `collections` | array | API collections; each contains folders and requests (see Collections below) |
| `environments` | array | Named variable sets; each: `{id, name, color, variables[], createdAt}` |
| `activeEnvironmentId` | string\|null | ID of the currently selected environment (e.g. `"env_1"`) or `null` for "No Environment" |
| `tabs` | array | Open request tabs; each: `{id, type, name, method, requestId, collectionId, isDirty, request, response}` |
| `activeTabId` | string | ID of the currently active tab |
| `currentRequest` | object | The request being edited in the active tab (see Request object below) |
| `activeRequestId` | string\|null | ID of the saved request loaded in the active tab, or `null` for unsaved |
| `response` | object\|null | Most recent response for the active tab (see Response object below) |
| `history` | array | Request execution history; each: `{id, timestamp, method, url, statusCode, responseTime}` |
| `globalVariables` | array | Global variables; each: `{id, key, value, description, enabled}` |
| `sidebarPanel` | string | Active sidebar panel: `"collections"` \| `"environments"` \| `"history"` \| `"apis"` \| `"mockservers"` \| `"monitors"` |
| `splitRatio` | number | Vertical split between request/response panels (20-80, default `50`) |

### Collection Object

```
{
  id: string,             // e.g. "col_1"
  name: string,           // e.g. "User Management API"
  description: string,
  auth: Auth,             // collection-level auth
  variables: array,       // collection variables
  folders: Folder[],      // grouped requests
  requests: Request[],    // top-level requests (outside folders)
  createdAt: string,      // ISO 8601
  updatedAt: string       // ISO 8601
}
```

### Folder Object

```
{
  id: string,             // e.g. "folder_1"
  name: string,           // e.g. "Users"
  description: string,
  auth: Auth,             // folder-level auth (usually {type:"inherit"})
  requests: Request[]     // requests in this folder
}
```

### Request Object

```
{
  id: string,             // e.g. "req_1"
  name: string,           // e.g. "Get All Users"
  description: string,
  method: string,         // "GET"|"POST"|"PUT"|"DELETE"|"PATCH"|"HEAD"|"OPTIONS"
  url: string,            // may contain {{variables}} e.g. "{{baseUrl}}/api/users"
  params: KeyValuePair[], // query parameters
  auth: Auth,             // request-level auth
  headers: KeyValuePair[],// request headers
  body: Body,             // request body
  preRequest: string,     // pre-request script (JavaScript) — executed before send
  tests: string           // test script using pm.test() syntax
}
```

### KeyValuePair Object

```
{
  id: string,             // e.g. "p1", "h1"
  key: string,            // e.g. "Content-Type"
  value: string,          // e.g. "application/json"
  description: string,    // optional description (shown in Description column of KeyValueEditor)
  enabled: boolean
}
```

### Auth Object

```
{
  type: string,           // "none"|"inherit"|"bearer"|"basic"|"apikey"
  bearer?: { token: string },
  basic?: { username: string, password: string },
  apikey?: { key: string, value: string, addTo: "header"|"queryParams" }
}
```

### Body Object

```
{
  type: string,           // "none"|"json"|"text"|"raw"|"formdata"|"urlencoded"|"binary"|"graphql"
  content: string,        // raw/JSON/text body content; for binary, stores filename
  formData: KeyValuePair[],
  urlencoded: KeyValuePair[],
  graphql: { query: string, variables: string }
}
```

### Tab Object

```
{
  id: string,             // UUID
  type: string,           // always "request"
  name: string,           // display name
  method: string,         // HTTP method
  requestId: string|null, // links to saved request ID, null if unsaved
  collectionId: string|null,
  isDirty: boolean,       // true if modified since save
  request: Request|null,  // working copy of the request
  response: Response|null // cached response for this tab
}
```

### Response Object (runtime, returned by mock execution)

```
{
  id: string,             // UUID
  statusCode: number,     // e.g. 200, 201, 404
  statusText: string,     // e.g. "OK", "Created", "Not Found"
  time: number,           // response time in ms
  size: number,           // response body size in bytes
  body: object|string|null, // parsed response body
  headers: object,        // response headers as key-value
  cookies: Cookie[],      // each: {name, value, domain, path, httpOnly, secure}
  testResults: TestResult[] // each: {name: string, passed: boolean}
}
```

### Environment Object

```
{
  id: string,             // e.g. "env_1"
  name: string,           // e.g. "Development" — editable inline in EnvironmentModal
  color: string,          // hex color e.g. "#00AA55" — selectable from color picker
  variables: KeyValuePair[], // environment variables
  createdAt: string       // ISO 8601
}
```

### History Item Object

```
{
  id: string,             // e.g. "hist_1" or UUID
  timestamp: number,      // Unix timestamp (ms)
  method: string,         // HTTP method
  url: string,            // resolved URL
  statusCode: number,     // shown as colored badge in sidebar history
  responseTime: number    // ms
}
```

## Default IDs

### Collections
| ID | Name | Folders |
|----|------|---------|
| `col_1` | User Management API | `folder_1` (Users), `folder_2` (Authentication) |
| `col_2` | E-Commerce API | `folder_3` (Products), `folder_4` (Orders) |
| `col_3` | JSONPlaceholder | (no folders, top-level requests only) |

### Requests
| ID | Name | Method | Collection | Folder |
|----|------|--------|------------|--------|
| `req_1` | Get All Users | GET | col_1 | folder_1 |
| `req_2` | Get User by ID | GET | col_1 | folder_1 |
| `req_3` | Create User | POST | col_1 | folder_1 |
| `req_4` | Update User | PUT | col_1 | folder_1 |
| `req_5` | Delete User | DELETE | col_1 | folder_1 |
| `req_6` | Login | POST | col_1 | folder_2 |
| `req_7` | Get Profile | GET | col_1 | folder_2 |
| `req_8` | List Products | GET | col_2 | folder_3 |
| `req_9` | Get Product Details | GET | col_2 | folder_3 |
| `req_10` | Create Product | POST | col_2 | folder_3 |
| `req_11` | Create Order | POST | col_2 | folder_4 |
| `req_12` | Get Order Status | GET | col_2 | folder_4 |
| `req_13` | Health Check | GET | col_2 | (root) |
| `req_14` | Get Posts | GET | col_3 | (root) |
| `req_15` | Create Post | POST | col_3 | (root) |
| `req_16` | Update Post | PATCH | col_3 | (root) |

### Environments
| ID | Name | Color | Key Variables |
|----|------|-------|---------------|
| `env_1` | Development | `#00AA55` | baseUrl, authToken, apiKey, orderId |
| `env_2` | Staging | `#EAB308` | baseUrl, authToken, apiKey, orderId |
| `env_3` | Production | `#EF4444` | baseUrl, authToken (empty), apiKey (empty), orderId (disabled) |

### Default Active State
- `activeEnvironmentId`: `"env_1"`
- `activeTabId`: `"tab_1"` (Get All Users)
- `activeRequestId`: `"req_1"`
- `sidebarPanel`: `"collections"`
- `splitRatio`: `50`

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8037/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "workspace": { "id": "ws_default", "name": "My Workspace", "type": "personal" },
        "collections": [
          {
            "id": "col_1",
            "name": "Test API",
            "description": "A test collection",
            "auth": { "type": "none" },
            "variables": [],
            "folders": [
              {
                "id": "folder_1",
                "name": "Users",
                "description": "",
                "auth": { "type": "inherit" },
                "requests": [
                  {
                    "id": "req_1",
                    "name": "Get Users",
                    "description": "",
                    "method": "GET",
                    "url": "{{baseUrl}}/api/users",
                    "params": [
                      { "id": "p1", "key": "page", "value": "1", "description": "", "enabled": true }
                    ],
                    "auth": { "type": "inherit" },
                    "headers": [],
                    "body": { "type": "none", "content": "", "formData": [], "urlencoded": [], "graphql": { "query": "", "variables": "" } },
                    "preRequest": "",
                    "tests": ""
                  }
                ]
              }
            ],
            "requests": []
          }
        ],
        "environments": [
          {
            "id": "env_1",
            "name": "Dev",
            "color": "#00AA55",
            "variables": [
              { "id": "v1", "key": "baseUrl", "value": "https://api.dev.example.com", "description": "Base URL", "enabled": true }
            ]
          }
        ],
        "activeEnvironmentId": "env_1",
        "tabs": [
          {
            "id": "tab_1",
            "type": "request",
            "name": "Get Users",
            "method": "GET",
            "requestId": "req_1",
            "collectionId": "col_1",
            "isDirty": false,
            "request": {
              "method": "GET",
              "url": "{{baseUrl}}/api/users",
              "params": [{ "id": "p1", "key": "page", "value": "1", "description": "", "enabled": true }],
              "auth": { "type": "inherit" },
              "headers": [],
              "body": { "type": "none", "content": "", "formData": [], "urlencoded": [], "graphql": { "query": "", "variables": "" } },
              "preRequest": "",
              "tests": ""
            },
            "response": null
          }
        ],
        "activeTabId": "tab_1",
        "currentRequest": {
          "method": "GET",
          "url": "{{baseUrl}}/api/users",
          "params": [{ "id": "p1", "key": "page", "value": "1", "description": "", "enabled": true }],
          "auth": { "type": "inherit" },
          "headers": [],
          "body": { "type": "none", "content": "", "formData": [], "urlencoded": [], "graphql": { "query": "", "variables": "" } },
          "preRequest": "",
          "tests": ""
        },
        "activeRequestId": "req_1",
        "response": null,
        "history": [],
        "globalVariables": [
          { "id": "gv1", "key": "appVersion", "value": "2.1.0", "description": "Application version", "enabled": true }
        ],
        "sidebarPanel": "collections",
        "splitRatio": 50
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Send request (click Send or Ctrl+Enter) | `response` populated with mock response; `history` grows by 1; active tab's `response` updated |
| Send request with pre-request script | Pre-request JS runs sandboxed; `pm.environment.set` calls affect variable substitution for that request only |
| Send request fails (network error) | Error toast shown in UI; `response` remains null |
| Change HTTP method | `currentRequest.method` updated; active tab's `method` updated; tab marked dirty |
| Edit URL | `currentRequest.url` updated; active tab marked dirty; `{{var}}` tokens highlighted orange (resolved) or red (unresolved) |
| Add/edit query param | `currentRequest.params` array modified; active tab marked dirty |
| Toggle param enabled | `currentRequest.params[i].enabled` toggled |
| Edit param description | `currentRequest.params[i].description` updated |
| Add/edit header | `currentRequest.headers` array modified; active tab marked dirty |
| Toggle header enabled | `currentRequest.headers[i].enabled` toggled |
| Edit header description | `currentRequest.headers[i].description` updated |
| Change body type | `currentRequest.body.type` updated |
| Edit body content | `currentRequest.body.content` updated; active tab marked dirty |
| Select binary file | `currentRequest.body.type` set to `"binary"`; `body.content` set to filename |
| Edit form-data | `currentRequest.body.formData` array modified |
| Edit URL-encoded | `currentRequest.body.urlencoded` array modified |
| Edit GraphQL query/vars | `currentRequest.body.graphql.query` or `.variables` updated |
| Change auth type | `currentRequest.auth.type` and related subfields updated |
| Edit auth fields | `currentRequest.auth.bearer.token`, `.basic.username`/`.password`, or `.apikey.*` updated |
| Edit pre-request script | `currentRequest.preRequest` updated; Pre-request tab indicator dot shown when non-empty |
| Edit test script | `currentRequest.tests` updated; Tests tab indicator dot shown when non-empty |
| Save new request (Ctrl+S or Save button) | Opens SaveRequestModal if unsaved; `collections[i].requests` grows by 1; tab `isDirty` set to false; tab gets `requestId` |
| Save existing request (Ctrl+S or Save button) | `collections[i].requests[j]` updated in-place; tab `isDirty` set to false; no modal shown |
| Open request from sidebar | `tabs` may grow (new tab); `activeTabId`, `activeRequestId`, `currentRequest` updated |
| Open new tab (New button) | `tabs` grows by 1; `activeTabId` updated; `currentRequest` set to blank |
| Close tab | `tabs` shrinks; if active tab closed, `activeTabId` switches to adjacent tab |
| Switch tab | `activeTabId` updated; `activeRequestId`, `currentRequest`, `response` restored from tab |
| Create collection | `collections` array grows by 1 (via InlineInputDialog — no native prompt) |
| Delete collection | `collections` array shrinks by 1 (via ConfirmDialog — no native confirm) |
| Rename collection | `collections[i].name` updated (click inline edit in sidebar) |
| Create folder | `collections[i].folders` grows by 1 (via InlineInputDialog) |
| Delete folder | `collections[i].folders` shrinks; all requests inside removed (via ConfirmDialog) |
| Rename folder | `collections[i].folders[j].name` updated |
| Delete request | Request removed from its collection/folder's requests array (via ConfirmDialog) |
| Rename request | Request's `name` updated in collection; matching tab `name` updated |
| Duplicate request | New request added to same collection/folder with `(Copy)` suffix |
| Filter sidebar collections | Local UI filter only — no state change; tree filtered by query |
| Switch environment | `activeEnvironmentId` updated (header dropdown or sidebar panel) |
| Create environment | `environments` array grows by 1 (InlineInputDialog in EnvironmentModal — no prompt()) |
| Delete environment | `environments` shrinks; if was active, `activeEnvironmentId` set to `null` (ConfirmDialog — no confirm()) |
| Rename environment | `environments[i].name` updated (click name in EnvironmentModal to edit inline) |
| Change environment color | `environments[i].color` updated (color picker in EnvironmentModal) |
| Edit environment variable | `environments[i].variables[j]` fields updated |
| Add environment variable | `environments[i].variables` grows by 1 |
| Remove environment variable | `environments[i].variables` shrinks by 1 |
| Update global variables | `globalVariables` array replaced |
| Clear history | `history` set to `[]` |
| Switch sidebar panel | `sidebarPanel` updated |
| Click Home (header) | `sidebarPanel` set to `"collections"` |
| Click hamburger Menu (header) | `sidebarPanel` refreshed to current panel |
| Click Explore (header) | Opens new tab with Explore URL |
| Click Import (header) | Opens ImportModal (no state change until import action) |
| Click Notifications (header) | Notifications panel shown (no state change) |
| Click Settings (header) | Settings modal shown (no state change) |
| Click User avatar (header) | User menu shown with Manage Environments, Profile Settings, Sign Out options |
| Create workspace (Workspaces menu) | `workspace` replaced with `{id: UUID, name, type: "personal"}` |
| Drag resize split | `splitRatio` updated (integer 20-80) |

## Sidebar Panels

| Panel | Activation | Content |
|-------|-----------|---------|
| `collections` | Click Folder icon or "Home" in header | Collection/folder/request tree with filter search |
| `apis` | Click APIs icon (link icon) | Static list of 3 APIs with version/status badges |
| `environments` | Click Environ. icon | List of environments with active indicator; click to set active |
| `mockservers` | Click Mock Srv icon | Static mock server list (running/stopped status) |
| `monitors` | Click Monitors icon | Static monitor list (passing/failing status with pass rate) |
| `history` | Click History icon (clock) | Grouped by today/yesterday/older; method badge + colored status code badge + URL + response time |

## Header Actions

| Element | Action |
|---------|--------|
| Hamburger (Menu) button | Refreshes `sidebarPanel` |
| "Home" link | Sets `sidebarPanel` to `"collections"` |
| "Workspaces" dropdown | Shows current workspace; inline input to create new workspace |
| "Explore" link | Opens new blank tab |
| "New" button | Opens new blank request tab (`OPEN_TAB`) |
| "Import" button | Opens ImportModal (file / URL / raw text) |
| Environment selector (dropdown) | Changes `activeEnvironmentId` |
| Bell (Notifications) button | Shows notifications panel popover |
| Settings (gear) button | Shows Settings modal (theme, language, SSL, redirects) |
| User avatar (JD) button | Shows User menu (Manage Environments / Profile Settings / Sign Out) |

## Reducer Actions Reference

| Action Type | Payload | Effect |
|-------------|---------|--------|
| `UPDATE_CURRENT_REQUEST` | `{field: value}` | Merges into `currentRequest`; marks active tab dirty |
| `SET_RESPONSE` | `Response \| null` | Sets `response` and active tab's `response` |
| `ADD_TO_HISTORY` | `{method, url, statusCode, responseTime}` | Prepends to `history` (max 50) |
| `CREATE_COLLECTION` | `name: string` | Adds new collection |
| `DELETE_COLLECTION` | `id: string` | Removes collection by ID |
| `RENAME_COLLECTION` | `{id, name}` | Updates collection name |
| `CREATE_FOLDER` | `{collectionId, name}` | Adds folder to collection |
| `DELETE_FOLDER` | `{collectionId, folderId}` | Removes folder and its requests |
| `RENAME_FOLDER` | `{id, name}` | Updates folder name |
| `SAVE_REQUEST` | `{name, collectionId, folderId?, requestId?}` | If `requestId` provided: updates in-place; otherwise: creates new request in collection |
| `DELETE_REQUEST` | `id: string` | Removes request from all collections |
| `RENAME_REQUEST` | `{id, name}` | Updates request name; updates matching tab name |
| `DUPLICATE_REQUEST` | `{requestId}` | Creates copy with `(Copy)` suffix in same collection/folder |
| `LOAD_REQUEST` | `Request` | Sets `activeRequestId`, `currentRequest`, clears `response` |
| `OPEN_TAB` | `{request, requestId, collectionId, name, method}` | Opens or focuses tab |
| `CLOSE_TAB` | `tabId: string` | Removes tab; creates blank tab if last one |
| `SET_ACTIVE_TAB` | `tabId: string` | Switches active tab, restores request/response |
| `UPDATE_TAB` | `{id, updates}` | Merges updates into tab |
| `MARK_TAB_DIRTY` | `tabId: string` | Sets `isDirty: true` on tab |
| `SET_ACTIVE_ENVIRONMENT` | `id: string \| null` | Sets `activeEnvironmentId` |
| `UPDATE_ENVIRONMENT` | `Environment` | Replaces environment by ID |
| `CREATE_ENVIRONMENT` | `name: string` | Creates new environment with `color: "#6B7280"` |
| `DELETE_ENVIRONMENT` | `id: string` | Removes environment; clears `activeEnvironmentId` if matched |
| `RENAME_ENVIRONMENT` | `{id, name}` | Updates environment name |
| `UPDATE_ENVIRONMENT_COLOR` | `{id, color}` | Updates environment color |
| `UPDATE_WORKSPACE` | `{...fields}` | Merges fields into `workspace` |
| `CREATE_WORKSPACE` | `name: string` | Replaces `workspace` with new `{id, name, type: "personal"}` |
| `UPDATE_GLOBAL_VARIABLES` | `KeyValuePair[]` | Replaces `globalVariables` |
| `CLEAR_HISTORY` | — | Sets `history` to `[]` |
| `SET_SIDEBAR_PANEL` | `panel: string` | Updates `sidebarPanel` |
| `SET_SPLIT_RATIO` | `ratio: number` | Updates `splitRatio` (20-80) |

## Mock Network Behavior

The app does **not** make real HTTP requests. Instead, `executeRequest()` simulates responses based on URL patterns:

| URL Pattern | Method | Mock Response |
|-------------|--------|---------------|
| `/api/auth/login` | POST | JWT token + user object (status 200) |
| `/api/auth/profile` | GET | User profile object |
| `/api/users` | GET | Array of 10 mock users |
| `/api/users/:id` | GET | Single user object |
| `/api/users` | POST | Created user (status 201) |
| `/api/users/:id` | PUT/PATCH | Updated user |
| `/api/users/:id` | DELETE | No content (status 204) |
| `/api/products` | GET | Array of 5 products |
| `/api/products/:id` | GET | Single product detail |
| `/api/products` | POST | Created product (status 201) |
| `/api/orders` | POST | Created order with tracking (status 201) |
| `/api/orders/:id` | GET | Order status with items |
| `/api/health` | GET | Health check with service statuses |
| `jsonplaceholder.typicode.com/posts` | GET | Array of 5 posts |
| `jsonplaceholder.typicode.com/posts/:id` | GET | Single post |
| `jsonplaceholder.typicode.com/posts` | POST | Created post (status 201) |
| `jsonplaceholder.typicode.com/posts/:id` | PATCH/PUT | Updated post |
| URL contains `timeout` | any | Status 408 (Request Timeout) |
| URL contains `500` or `error` | any | Status 500 (Internal Server Error) |
| URL contains `404` or `notfound` | any | Status 404 (Not Found) |
| URL contains `401` or `unauthorized` | any | Status 401 (Unauthorized) |
| URL contains `403` | any | Status 403 (Forbidden) |
| (default/other) | any | Echo response with method, url, headers, body |

### Pre-Request Script Execution

Pre-request scripts run in a sandboxed `Function` context before the request is sent. The `pm` object provides:
- `pm.environment.get(key)` — read active environment variable
- `pm.environment.set(key, value)` — override variable for this request's execution (affects URL/header/body substitution)
- `pm.variables.get(key)` / `.set(key, value)` — alias for environment
- `pm.request.url`, `.method`, `.body` — read-only request info
- `pm.info.requestName`, `.eventName` — metadata

Script errors are non-fatal (console warning only).

### Test Script Evaluation

Test scripts use `pm.test()` syntax. Supported assertion patterns:
- `pm.response.to.have.status(N)` — checks status code
- `.to.be.an('array'|'string'|'number'|'object'|'boolean')` — type checks
- `.to.equal(value)` / `.to.eql(value)` — equality checks
- `.to.have.property('key')` — property existence
- `.to.include(value)` — string/array inclusion
- `.to.be.above(N)` / `.below(N)` / `.at.least(N)` / `.at.most(N)` — numeric comparisons
- `token` + `to.exist` — token property existence (legacy pattern)
- `responseTime).to.be.below(N)` — response time check

Test results stored in `response.testResults[]` as `{name: string, passed: boolean}`.

### Response Preview Mode

- **Pretty**: Syntax-highlighted JSON code view
- **Raw**: Plain text with optional word wrap
- **Preview**:
  - HTML responses: rendered in sandboxed iframe
  - JSON/object responses: interactive collapsible tree (purple keys, green strings, amber numbers)
  - Toggle collapse/expand for nested objects and arrays

## Notes

- Variable substitution: `{{varName}}` in URLs, headers, and body content replaced using active environment variables and global variables. URL bar shows variable token highlighting — orange for resolved, red for unresolved.
- History is capped at 50 items (most recent first). History items show colored status code badges and response time.
- When all tabs are closed, a blank "Untitled Request" tab is automatically created.
- The `response` field at the top level mirrors the active tab's response. Tab-switching restores each tab's cached response.
- The `currentRequest` field always reflects the working copy in the active tab. Editing it marks the tab as `isDirty: true`.
- `Ctrl+S` / `Cmd+S` saves the current request. If already saved (`activeRequestId` is set), updates in-place without a modal. If new, opens SaveRequestModal.
- All native `prompt()` and `window.confirm()` dialogs replaced with custom React UI (InlineInputDialog and ConfirmDialog components).
- KeyValueEditor shows Key, Value, and Description columns. Description is editable and persisted to state.
- Binary body type shows a clickable file picker button; selected filename stored in `body.content`.
- Collections panel has a live filter input (Filter button) — filters by collection name, folder name, request name, URL, and method. No state change.
