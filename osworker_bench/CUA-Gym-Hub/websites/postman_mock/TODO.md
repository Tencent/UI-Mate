# Xostman Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing code: partially implemented (see analysis below)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

## Existing Implementation Summary

The mock already has a working React + Vite + Tailwind foundation with:
- Basic header, sidebar (Collections/History tabs), request panel, response panel
- URL bar with method selector + Send button
- Request sub-tabs (Params, Headers, Body, Tests, Pre-request)
- Key-value editor, code editor (PrismJS)
- Environment modal, mock network layer, state management
- `/go` endpoint, session isolation, localStorage persistence

**The TODO below focuses on what needs to be ADDED or FIXED to match the real Xostman UI.**

---

## P0 — Core Shell

<!-- These are foundational changes needed before P1 features work properly. -->

- [x] **Visual design system overhaul**: Study `assets/screenshots/main_interface_03.jpg` and `assets/screenshots/ui_detail_03.jpg` carefully. The current mock uses a plain white theme — match the real Xostman light theme more closely:
  - Header background: white with subtle `#E5E5E5` bottom border
  - Sidebar: light gray `#F9FAFB` background with `#E5E5E5` right border
  - Primary accent: `#FF6C37` (Xostman Orange) — already set in tailwind.config.js ✓
  - Method colors: GET `#00AA55`, POST `#EAB308`, PUT `#2563EB`, DELETE `#EF4444`, PATCH `#8B5CF6`, HEAD `#6B7280`, OPTIONS `#6B7280`
  - Send button: solid `#FF6C37` with white text, rounded, prominent
  - Tab active indicator: `#FF6C37` bottom border
  - Font: Use Inter for UI text (add via Google Fonts CDN link in index.html), keep existing monospace for code
  - Spacing: Tighter padding in sidebar items (py-1.5), compact header (h-12)

- [x] **Layout restructure — vertical split**: Currently request and response are side-by-side (left/right). Real Xostman uses a **vertical split** (request on top, response on bottom) within the main workbench area, with a draggable divider. Change `App.jsx` layout:
  - Sidebar (left, 260px fixed width) | Workbench (right, flex-1)
  - Workbench = Tab bar (top) + Request builder (top half) + Resizable divider + Response viewer (bottom half)
  - The divider should be a horizontal bar (4px height, cursor `row-resize`) that users can drag to resize the split. Default 50/50 split. Store split ratio in state.

- [x] **Header bar redesign**: Match real Xostman header layout (see `assets/screenshots/ui_detail_03.jpg`):
  - **Left section**: Hamburger menu icon (☰, non-functional placeholder), "Home" text link, "Workspaces ▾" dropdown (shows "My Workspace" with checkmark, clicking does nothing else), "Explore" text link (non-functional)
  - **Center section**: Workspace name label "Scratch Pad" or "My Workspace", then "New" button (orange/primary bg, white text, creates new untitled request tab), "Import" button (ghost style, gray border — opens import modal placeholder)
  - **Right section**: Search input placeholder with magnifying glass icon and "⌘K" hint text (clicking focuses input, ESC closes, non-functional search), bell/notification icon (non-functional), settings gear icon (opens Settings modal), user avatar circle with "JD" initials (non-functional)
  - Height: 48px, white background, bottom border `#E5E5E5`

- [x] **Sidebar icon rail + panel redesign**: Replace the current two-tab (Collections/History) sidebar with Xostman's real sidebar structure:
  - **Icon rail** (leftmost column, 48px wide, dark-ish `#2D2D2D` or keep light): Vertical stack of icon buttons — Collections (folder icon), APIs (puzzle/link icon, placeholder), Environments (layers/stacked icon), Mock Servers (server icon, placeholder), Monitors (chart icon, placeholder), History (clock icon). Only Collections, Environments, and History should be functional; others show "Coming soon" placeholder content when clicked. Active icon has left orange border indicator.
  - **Panel area** (rest of sidebar, ~212px wide, light gray bg): Content depends on which icon is active.
  - **Collections panel**: "+" button (creates new collection) and filter/sort icon at top. Tree view showing collections → folders → requests. Each collection has expand/collapse chevron, folder icon (yellow), name, "..." context menu on hover. Each folder has expand/collapse chevron, folder icon, name. Each request shows color-coded method badge (10px bold, abbreviated: `GET` green, `POST` yellow, `PUT` blue, `DEL` red, `PATCH` purple) + request name. Click request to open it in a new tab.
  - **Environments panel**: List of environments with name and colored circle indicator. "+" button to create new. Click to open in modal or dedicated tab.
  - **History panel**: Chronological list grouped by "Today", "Yesterday", "Older". Each entry: method badge + URL (truncated) + relative timestamp. Click to load into a new tab. "Clear All" option at top.

- [x] **Tab system**: This is CRITICAL — real Xostman is fundamentally a tabbed interface. Implement a tab bar above the request builder:
  - Tab bar sits between the header and the request builder area, full width of the workbench
  - Each tab shows: colored method badge (same colors as sidebar) + request name (truncated if long) + close (×) button on hover
  - Active tab has bottom border highlight in `#FF6C37` and slightly lighter background
  - Unsaved changes show an orange dot before the close button
  - "+" button at the end of the tab row to create a new untitled request tab
  - Clicking a request in the sidebar opens it as a new tab (or switches to existing tab if already open)
  - State model: `tabs: Tab[]` array + `activeTabId: string` in the store. Each tab holds its own request working copy and response. Switching tabs swaps `currentRequest` and `response` in the display.
  - New tab defaults: method "GET", empty URL, empty params/headers, no body, untitled name
  - Maximum visible tabs with horizontal scroll if overflow
  - **Reducer actions needed**: `OPEN_TAB`, `CLOSE_TAB`, `SET_ACTIVE_TAB`, `UPDATE_TAB`, `MARK_TAB_DIRTY`

- [x] **Data model upgrade**: Update `utils/initialData.js` to use the comprehensive seed data from `assets/data_model.md`:
  - 3 collections (User Management API, E-Commerce API, JSONPlaceholder) with folders and 16 requests total
  - 3 environments (Development, Staging, Production) with realistic variables
  - 5 history items with timestamps
  - Global variables array
  - Tabs array with one default open tab
  - Auth config on requests (inherit/bearer/apikey/basic/none)
  - **Keep all existing normalizer functions** — they handle custom state injection from the `/post` endpoint. Just update `INITIAL_STATE` and add normalizers for new fields (auth, tabs, globalVariables, workspace, etc.)

- [x] **State management upgrade**: Add new reducer actions to `store/StoreContext.jsx`:
  - `OPEN_TAB` — opens a new tab (from sidebar click or "+" button), with request data
  - `CLOSE_TAB` — closes a tab by id, switches active to adjacent tab
  - `SET_ACTIVE_TAB` — switches the active tab
  - `UPDATE_TAB` — updates the working copy of a tab's request
  - `MARK_TAB_DIRTY` — marks tab as having unsaved changes
  - `CREATE_ENVIRONMENT` — adds a new environment
  - `DELETE_ENVIRONMENT` — removes an environment
  - `DELETE_COLLECTION` — removes a collection
  - `RENAME_COLLECTION` — renames a collection
  - `CREATE_FOLDER` — creates a folder within a collection
  - `DELETE_FOLDER` — removes a folder
  - `DELETE_REQUEST` — removes a request from collection/folder
  - `RENAME_REQUEST` — renames a saved request
  - `DUPLICATE_REQUEST` — duplicates a request
  - `UPDATE_GLOBAL_VARIABLES` — updates global variables

---

## P1 — Primary Features

<!-- Core features a user interacts with in the first 5 minutes. Dev implements after P0 shell is solid. -->

- [x] **Authorization tab**: Add "Authorization" as a new sub-tab in the request builder, positioned FIRST (before Params). The tab content depends on the selected auth type:
  - **Type dropdown** at top: "No Auth", "Inherit auth from parent", "API Key", "Bearer Token", "Basic Auth"
  - **No Auth**: Shows message "This request does not use any authorization."
  - **Inherit auth from parent**: Shows message "This request inherits auth from the parent collection/folder." with info about what auth is being inherited
  - **API Key**: Two text fields — "Key" (input, placeholder "Key name") and "Value" (input, placeholder "API key value") + "Add to" dropdown ("Header" | "Query Params")
  - **Bearer Token**: Single text field "Token" with large input area, placeholder "Token"
  - **Basic Auth**: Two fields — "Username" (text input) and "Password" (password input with show/hide toggle)
  - Store auth config in `currentRequest.auth` object (see data_model.md §AuthConfig)
  - The Auth tab should show an indicator dot when auth type is not "none" or "inherit"

- [x] **Body type expansion**: Currently only supports none/json/text. Expand to match real Xostman:
  - **Radio buttons row**: `none` | `form-data` | `x-www-form-urlencoded` | `raw` | `binary` | `GraphQL`
  - **`none`**: Shows "This request does not have a body" message (already exists)
  - **`form-data`**: KeyValueEditor with an extra "type" dropdown per row (Text/File). File rows show a file name input (simulated, no real upload)
  - **`x-www-form-urlencoded`**: KeyValueEditor (same as params/headers table)
  - **`raw`**: Code editor with a **format dropdown** to the right of the radio buttons: `Text` | `JSON` | `XML` | `HTML` | `JavaScript`. Default to JSON. The format selection should update syntax highlighting in the code editor
  - **`binary`**: Shows "Select file" button placeholder and filename display
  - **`GraphQL`**: Two-pane view — "Query" code editor on left, "Variables" code editor on right (JSON)
  - Update `body` in state: `{ type, content, rawFormat, formData: [], urlencoded: [], graphql: { query: "", variables: "" } }`

- [x] **Response body Pretty/Raw/Preview toggle**: The response body viewer currently only shows pretty-printed JSON. Add:
  - **Toggle buttons row** above the code viewer: `Pretty` | `Raw` | `Preview`
  - **Format dropdown** next to toggle: `JSON` | `XML` | `HTML` | `Text` | `Auto` (auto-detect from content-type header)
  - **Pretty**: Syntax-highlighted, formatted code (current behavior). For JSON, show collapsible tree with line numbers
  - **Raw**: Plain text, no syntax highlighting, monospace font
  - **Preview**: For HTML responses, render in an iframe; for others, same as Pretty
  - **Search icon** (🔍) that opens a search bar within the response body (Ctrl+F)
  - **Copy button** to copy response body to clipboard
  - **Word wrap toggle** button

- [x] **Response Cookies tab**: Add a "Cookies" tab between Body and Headers in the response panel:
  - Table with columns: Name, Value, Domain, Path, Expires, HttpOnly, Secure
  - Mock responses should include 1-2 cookies (see data_model.md §Response)
  - Read-only display

- [x] **Folder rendering in sidebar**: The current sidebar ignores folders — it only shows top-level requests. Fix to show the proper tree structure:
  - Collection (expand/collapse) → Folder (expand/collapse, folder icon, indented) → Request (method badge + name, further indented)
  - Folders should have `📁` folder icon in yellow/amber color
  - Folder items indented with a left border line (subtle gray, like current implementation but for folders too)
  - Requests at collection level (outside folders) shown after all folders

- [x] **Context menus on sidebar items**: Right-clicking (or clicking "..." button on hover) on collections, folders, and requests should show a context menu:
  - **Collection context menu**: "Add Request", "Add Folder", "Rename", "Duplicate", "Export" (placeholder), "Delete"
  - **Folder context menu**: "Add Request", "Rename", "Delete"
  - **Request context menu**: "Open in New Tab", "Rename", "Duplicate", "Move" (placeholder), "Delete"
  - Context menu component: positioned absolutely at cursor, dismisses on click outside, styled with white bg, shadow, rounded corners, py-1 items with hover highlight

- [x] **Save request dialog**: Replace the current `prompt()` with a proper modal dialog:
  - Modal with title "Save Request"
  - "Request name" text input (pre-filled with current request name or "Untitled Request")
  - "Save to" — Collection selector dropdown + optional folder selector
  - "Save" and "Cancel" buttons
  - If saving an existing request (activeRequestId is set), just update in place without the modal

- [x] **Enhanced mock network layer**: Upgrade `utils/mockNetwork.js` to produce much richer, more realistic responses (see data_model.md §Mock Network Response Rules):
  - URL pattern matching for `/api/users`, `/api/products`, `/api/orders`, `/api/auth`, `/api/health`
  - Responses should include realistic JSON data with multiple fields, timestamps, nested objects
  - Response headers should include: `content-type`, `date`, `server`, `x-request-id` (random UUID), `x-response-time`, `cache-control`
  - Response cookies should include 1-2 mock cookies: `session_id` and `csrf_token`
  - Vary response data slightly each time (random names, different timestamps)
  - Support URL path parameter extraction (e.g., `/users/1` → return user with id=1)
  - Error simulation: URLs containing "error", "500", "404", "401", "timeout" should produce corresponding error responses
  - Timeout simulation: URLs containing "timeout" should delay 5+ seconds then return 408

- [x] **Variable highlighting in URL bar**: When the user types `{{variableName}}` in the URL input, params, headers, or body, highlight the variable references:
  - `{{resolved_variable}}` should appear with an orange/highlighted background if the variable exists in the active environment
  - `{{unresolved_variable}}` should appear with a red background if the variable doesn't exist
  - Tooltip on hover showing the resolved value
  - This can be implemented as a custom input component that renders overlaid spans, or by using a contentEditable div with HTML markup. A simpler approach: just apply CSS styling to the resolved URL display below the input (show "Resolved: https://api.dev.example.com/api/users" in small muted text below the URL bar when variables are detected)

- [x] **New request creation flows**: The "New" button in header and "+" in tab bar should:
  - Create a new tab with an untitled request (method: GET, empty URL)
  - Set focus to the URL input field
  - Tab name shows "Untitled Request" in italics
  - The "+" button in the sidebar Collections panel should open a "New Collection" dialog (text input for name + Create/Cancel buttons)

- [x] **Delete/rename operations**: All CRUD operations on sidebar items:
  - **Delete collection**: Confirmation dialog "Are you sure you want to delete [name]? This will delete all requests inside it." with Delete (red) and Cancel buttons
  - **Delete folder**: Same pattern, warns about contained requests
  - **Delete request**: Same pattern but simpler message
  - **Rename**: Inline editing — clicking "Rename" in context menu turns the name into an editable text input. Press Enter to save, Escape to cancel. Update in state.
  - **Duplicate request**: Creates a copy with " (Copy)" appended to name, added to same collection/folder

---

## P2 — Secondary Features

<!-- Depth and polish. Only implement after P1 is completely solid. -->

- [ ] **Collection Runner**: A modal/panel that lets users run all requests in a collection sequentially:
  - Trigger: "Run" option in collection context menu, or a "Runner" button in the footer/header
  - Modal shows: collection name, list of requests to run (checkboxes to include/exclude), "Run" button
  - Execution: Runs each request top-to-bottom with a brief delay (500ms), shows progress bar
  - Results: Each request shows method + name + status code (green/red) + time. Summary at bottom: "X/Y passed"
  - Errors don't stop execution — all requests run regardless

- [ ] **Console panel**: A toggleable bottom panel (like a browser DevTools console):
  - Toggle via "Console" button in footer bar
  - Shows chronological log entries for each request/response:
    - `→ GET https://api.dev.example.com/api/users` (with timestamp, colored by method)
    - `← 200 OK 245ms` (with response details)
  - Each entry expandable to show full request/response details
  - "Clear" button to clear console
  - Filter by method, status code
  - Panel slides up from bottom, resizable height

- [ ] **Settings modal**: Accessible via gear icon in header. Tabbed modal:
  - **General**: "Request timeout" number input (default 30000ms), "SSL certificate verification" toggle, "Automatically follow redirects" toggle, "Max response size" dropdown
  - **Themes**: Three cards — "System Default", "Light" (selected), "Dark" — with radio buttons (see `assets/screenshots/settings_theme.jpg`). Selecting dark mode is non-functional placeholder (or implement as CSS variable swap if straightforward)
  - **Shortcuts**: Read-only table of keyboard shortcuts: Ctrl+Enter (Send), Ctrl+S (Save), Ctrl+N (New Request), Ctrl+T (New Tab), Ctrl+W (Close Tab), Ctrl+K (Search)
  - **Data**: "Export All Data" button (placeholder), "Import Data" button (placeholder), "Clear Browsing Data" button (clears localStorage + resets to initial state)
  - **About**: Xostman Mock version "1.0.0", links placeholder

- [ ] **Import/Export functionality**:
  - **Import**: Button in header opens modal with: "Paste cURL command" textarea + "Import" button. Parse basic cURL commands: extract method, URL, headers (-H), data (-d/--data). Create a new request from parsed data and open in tab
  - **Export**: In collection context menu, "Export" generates a JSON representation of the collection and triggers a browser download

- [ ] **Code generation snippets**: Button/icon in response panel or request panel that opens a side panel:
  - Dropdown to select language: "JavaScript - Fetch", "Python - Requests", "cURL", "Node.js - Axios"
  - Generates code snippet from the current request configuration
  - Copy button to clipboard
  - Example for JS Fetch: `fetch('https://...', { method: 'GET', headers: {...} })`

- [ ] **Global search (Cmd+K)**: A search overlay/modal:
  - Trigger: Click search bar in header or press Cmd+K / Ctrl+K
  - Full-screen overlay with centered search input at top
  - As user types, filter and show matching results from: collection names, request names, environment names, URLs
  - Results grouped by type (Collections, Requests, Environments)
  - Click result to navigate (open request in tab, select environment, etc.)
  - ESC or click outside to dismiss

- [ ] **Keyboard shortcuts**:
  - `Ctrl+Enter` / `Cmd+Enter`: Send current request
  - `Ctrl+S` / `Cmd+S`: Save current request
  - `Ctrl+N` / `Cmd+N`: New request tab
  - `Ctrl+T` / `Cmd+T`: New tab (same as above)
  - `Ctrl+W` / `Cmd+W`: Close current tab
  - `Ctrl+K` / `Cmd+K`: Open search
  - Register via `useEffect` with `keydown` event listeners in App.jsx
  - Prevent default browser behavior for these shortcuts

- [ ] **Footer bar**: Add a slim footer bar (32px) at the very bottom:
  - **Left**: "Console" toggle button (opens console panel), "Runner" button (opens collection runner), "Find and Replace" text link
  - **Right**: "Runner" status indicator, "Trash" icon (placeholder), layout toggle icons (horizontal/vertical split)
  - Gray background `#F5F5F5`, top border `#E5E5E5`, small text 11px

- [ ] **Request description**: Add an optional description field for each request:
  - Small "Add description" link below the request name in the tab/builder area
  - Clicking opens a textarea for markdown-formatted description
  - Stored in `request.description`
  - Collapsible — shows first line preview when collapsed

- [ ] **Drag and drop reordering**: Allow reordering of:
  - Requests within a collection/folder (drag to change order)
  - Folders within a collection
  - Tabs in the tab bar
  - Use HTML5 drag-and-drop API or a lightweight library
  - Visual feedback: drag ghost, drop zone highlighting

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. See data_model.md for full structure. -->

- [x] **Collections**: 3 collections — "User Management API" (2 folders: Users with 5 requests, Authentication with 2 requests), "E-Commerce API" (2 folders: Products with 3 requests, Orders with 2 requests, plus 1 top-level Health Check request), "JSONPlaceholder" (no folders, 3 requests). Total: 16 requests covering all HTTP methods (GET, POST, PUT, DELETE, PATCH).
- [x] **Environments**: 3 environments — Development (4 vars: baseUrl, authToken, apiKey, orderId — all filled), Staging (4 vars — all filled), Production (4 vars — some empty, requiring user to fill in). Active environment: Development.
- [x] **History**: 5 entries spanning last 24 hours with varied methods and URLs.
- [x] **Global Variables**: 1 variable (`appVersion: "2.1.0"`).
- [x] **Default Tab**: One tab open showing "Get All Users" request from the User Management API collection.

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login (app starts pre-logged-in as user "JD" in "My Workspace")
- Real HTTP requests to external servers (all requests are mocked in `mockNetwork.js`)
- OAuth 2.0 / JWT token refresh flows
- Real file uploads (binary body type shows UI but doesn't actually upload)
- WebSocket / gRPC / MQTT protocol support (HTTP only)
- API documentation publishing
- Mock servers (the Xostman feature, not our mock infrastructure)
- Monitoring / scheduled runs
- Team collaboration / sharing
- Version control / forking
- Xostman AI assistant features
