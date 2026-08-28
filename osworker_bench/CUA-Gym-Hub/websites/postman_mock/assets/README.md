# Xostman Mock — Research Summary

> Last updated: 2025-03-09
> Sources: Xostman official docs, product pages, UI screenshots

## App Overview

**Xostman** is the world's leading API development and testing platform, used by 40M+ developers and 98% of Fortune 500 companies. It provides a comprehensive environment for building, testing, documenting, and monitoring APIs. The core experience centers around a **request builder** where users craft HTTP requests (GET, POST, PUT, DELETE, PATCH, etc.), send them, and inspect responses — all organized within **collections** and supported by **environments** with variable substitution.

## Key User Personas

### 1. API Developer (Primary)
- Builds and tests REST APIs daily
- Creates collections to organize API endpoints
- Uses environments to switch between dev/staging/prod
- Writes pre-request scripts and tests
- Inspects response bodies, headers, and status codes

### 2. QA/Test Engineer
- Runs collection test suites
- Writes assertions using `pm.test` syntax
- Uses Collection Runner to automate test sequences
- Monitors test results and coverage

### 3. API Consumer/Explorer
- Imports shared collections
- Explores API documentation
- Tests endpoints with different parameters
- Saves request history for reference

## Core Workflows

1. **Send a Request**: Select method → enter URL → add params/headers/body → click Send → inspect response
2. **Organize Collections**: Create collection → add folders → save requests → reorder/rename
3. **Manage Environments**: Create environment → define variables → switch active environment → variables auto-substitute in requests
4. **Write & Run Tests**: Add test scripts → send request → view test results in response panel
5. **Browse History**: View past requests → click to reload → save to collection

---

## Complete Feature List

### P0 — Core Shell (Must have for app to render)
- **App frame layout**: Header bar + left sidebar + main workbench area
- **Header bar**: Xostman logo/brand, workspace name, New/Import buttons, search bar, environment selector, settings gear
- **Sidebar**: Tabs for Collections / Environments / History, tree view with expand/collapse
- **Tab system**: Multiple request tabs with method badge + name, close button, unsaved indicator dot
- **Routing**: BrowserRouter with `/` (main app) and `/go` (state inspection)
- **State management**: React Context with reducer, localStorage persistence, session isolation
- **`/go` endpoint**: Returns `{initial_state, current_state, state_diff}`

### P1 — Primary Features (Core interactive workflows)
- **Request builder URL bar**: HTTP method dropdown (color-coded: GET=green, POST=yellow, PUT=blue, DELETE=red, PATCH=purple), URL input, Send button (orange), Save button
- **Request tabs**: Params, Authorization, Headers, Body, Pre-request Script, Tests, Settings
- **Params tab**: Key-value table with checkbox enable/toggle, description column, bulk edit
- **Authorization tab**: Type dropdown (No Auth, API Key, Bearer Token, Basic Auth), config fields per type
- **Headers tab**: Key-value table (same as params), auto-complete for common headers
- **Body tab**: Radio buttons for body type (none, form-data, x-www-form-urlencoded, raw, binary, GraphQL), code editor for raw with format dropdown (JSON, XML, Text, JavaScript, HTML)
- **Pre-request Script tab**: JavaScript code editor
- **Tests tab**: JavaScript code editor with snippet sidebar
- **Response panel**: Status code (color-coded), response time, response size
- **Response Body tab**: Pretty/Raw/Preview toggle, format dropdown (JSON, XML, HTML, Text), syntax-highlighted code viewer, search within response
- **Response Headers tab**: Key-value table (read-only)
- **Response Cookies tab**: Cookie details table
- **Response Test Results tab**: Pass/fail indicators with test names
- **Collection management**: Create/rename/delete collections, create folders, add/save requests, drag items
- **Environment management**: Create/edit/delete environments, add/edit/delete variables, switch active environment
- **Variable substitution**: `{{variable_name}}` syntax highlighting and resolution in URLs, headers, body
- **Request history**: Auto-logged with timestamp, method, URL; click to reload
- **Mock network**: Simulate realistic responses based on URL patterns

### P2 — Secondary Features (Depth and realism)
- **Collection Runner**: Select collection → run all requests sequentially → show results summary
- **Import/Export**: Import from JSON/cURL, export collection as JSON
- **Code generation**: Generate code snippets from request (JavaScript fetch, Python requests, cURL, etc.)
- **Console panel**: Bottom panel showing request/response logs with timing
- **Search**: Global search (Cmd+K) across collections, requests, environments
- **Workspace selector**: Dropdown in header to switch workspaces (My Workspace, Team Workspace)
- **Settings modal**: General, Themes (Light/Dark/System), Shortcuts, Data tabs
- **Right sidebar panel**: Documentation view for selected collection/folder
- **Request description field**: Markdown description per request
- **Cookies manager**: View/edit cookies by domain
- **Keyboard shortcuts**: Ctrl+Enter to send, Ctrl+S to save, Ctrl+N new request, Ctrl+T new tab

---

## UI Layout Description

### Header Bar (48px height)
- **Left**: Hamburger menu icon, "Home" link, "Workspaces ▾" dropdown, "Explore" link
- **Center**: "Scratch Pad" workspace label, "New" button (blue/orange), "Import" button
- **Right**: Search bar (centered, with ⌘K hint), notification bell, settings gear, user avatar

### Left Sidebar (~260px width)
- **Icon rail** (leftmost, ~48px): Vertical icon buttons — Collections (folder), APIs, Environments, Mock Servers, Monitors, History
- **Panel area** (~212px): Depends on selected icon:
  - **Collections tab**: "+" and filter icons at top, tree view of collections with expand/collapse. Each collection shows folder icon + name. Expand reveals folders and requests. Requests show color-coded method badge (GET green, POST yellow, PUT blue, DEL red, PATCH purple) + request name
  - **Environments tab**: List of environments with "+" to create
  - **History tab**: Chronological list of past requests with method badge + URL + timestamp

### Workbench Area (main content)
- **Tab bar**: Horizontal tabs for open requests. Each tab shows: method badge (colored) + request name + close (×) button. Active tab has bottom border highlight. "+" button at end to add new tab
- **Request Builder** (top half or left side):
  - **URL bar row**: Method dropdown (color-coded) | URL input field (monospace) | "Params" link | **Send** button (orange, prominent) | Save dropdown
  - **Sub-tabs row**: Authorization | Headers (count badge) | Body (indicator dot) | Pre-request Script | Tests | Settings
  - **Tab content area**: Varies by active sub-tab (key-value editor, code editor, auth config form)
- **Response Viewer** (bottom half or right side):
  - **Status bar**: "Status: 200 OK" (green) | "Time: 245ms" | "Size: 1.23 KB"
  - **Sub-tabs**: Body | Cookies | Headers (count) | Test Results (pass/fail count)
  - **Body view controls**: Pretty | Raw | Preview toggle + format dropdown (JSON ▾) + search icon + copy icon
  - **Content area**: Syntax-highlighted JSON/XML/HTML viewer with line numbers

### Footer Bar (~32px height)
- **Left**: Console toggle, Collection Runner button, find/replace
- **Right**: Runner, Trash, layout toggle icons

---

## Color Scheme (Xostman Light Theme — Default)
- **Primary/Brand**: `#FF6C37` (Xostman Orange)
- **Primary Hover**: `#E05A2B`
- **Background**: `#FFFFFF` (white)
- **Sidebar Background**: `#F5F5F5` / `#FAFAFA`
- **Header Background**: `#FFFFFF` with bottom border `#E0E0E0`
- **Text Primary**: `#333333`
- **Text Secondary**: `#6B6B6B`
- **Text Muted**: `#999999`
- **Border**: `#E0E0E0`
- **Input Border**: `#CCCCCC`
- **Method GET**: `#00AA55` (green)
- **Method POST**: `#EAB308` / `#D4A017` (yellow/gold)
- **Method PUT**: `#2563EB` (blue)
- **Method DELETE**: `#EF4444` (red)
- **Method PATCH**: `#8B5CF6` (purple)
- **Status Success (2xx)**: `#00AA55` (green)
- **Status Error (4xx/5xx)**: `#EF4444` (red)
- **Status Redirect (3xx)**: `#EAB308` (yellow)
- **Code Editor BG**: `#FFFFFF`
- **Tab Active Border**: `#FF6C37`
- **Selection/Hover**: `#F0F0F0`

---

## Typography
- **UI Font**: Inter, -apple-system, system-ui, sans-serif
- **Monospace Font**: "Fira Code", "Fira Mono", "SF Mono", Menlo, Monaco, Consolas, monospace
- **Header text**: 14px semibold
- **Sidebar items**: 13px regular
- **Tab labels**: 13px medium
- **Input fields**: 13px regular
- **Code editor**: 12px monospace
- **Labels/badges**: 10-11px bold uppercase

---

## Existing Implementation Analysis

The current `postman_mock` has a **basic but functional foundation**:

### What exists:
- ✅ React + Vite + Tailwind CSS setup
- ✅ Basic header with environment selector
- ✅ Left sidebar with Collections/History tabs
- ✅ Request builder with URL bar, method selector, Send button
- ✅ Request sub-tabs: Params, Headers, Body, Tests, Pre-request
- ✅ Response panel with Body, Headers, Test Results tabs
- ✅ Key-value editor component for params/headers
- ✅ Code editor using react-simple-code-editor + PrismJS
- ✅ Environment modal for managing variables
- ✅ Mock network layer with variable substitution
- ✅ State management via React Context + useReducer
- ✅ `/go` endpoint for state inspection
- ✅ Session-aware state persistence (vite.config.js mock-api plugin)
- ✅ localStorage persistence
- ✅ History tracking (last 50 requests)

### What's missing or needs improvement:
- ❌ No tab system (single request only — no multiple open tabs)
- ❌ No Authorization tab/feature
- ❌ Body only supports none/json/text (no form-data, x-www-form-urlencoded, raw with format options, binary)
- ❌ No folder support in sidebar (data model has folders but UI doesn't render them)
- ❌ Sidebar lacks icon rail navigation (Collections/Environments/History should be icon-based)
- ❌ No Collection Runner
- ❌ No import/export functionality
- ❌ No code generation
- ❌ No console panel
- ❌ No search functionality (global or within response)
- ❌ No workspace selector
- ❌ No settings modal
- ❌ No cookies in response
- ❌ No request description
- ❌ Header doesn't match real Xostman layout (missing New/Import buttons, search)
- ❌ Response panel missing Pretty/Raw/Preview toggle
- ❌ Response panel missing search, copy, format selector
- ❌ No save dialog (uses prompt())
- ❌ No right-click context menus on sidebar items
- ❌ No drag-and-drop reordering
- ❌ Very limited mock data (only 2 requests in 1 collection)
- ❌ Layout uses side-by-side (request left, response right) instead of Xostman's standard vertical split (request top, response bottom)

---

## Notes for Dev Agent

### What to Skip (Out of Scope)
- Login/logout/authentication flows (app starts pre-logged-in as "My Workspace" user)
- Real network requests — all API calls are mocked client-side
- OAuth flows, SSO, identity verification
- Real database — use localStorage only
- File uploads to real servers
- Email/SMS notifications

### Key Architecture Decisions
- Keep existing React Context + useReducer pattern (it works well)
- Keep existing vite.config.js mock-api plugin for server-side state management
- Keep Tailwind CSS for styling
- Use existing PrismJS code editor — it's lightweight and sufficient
- The layout should switch to **vertical split** (request on top, response on bottom) to match real Xostman
- Implement tab system using state array of open tabs + activeTabId
- Mock responses should be richer and more varied for agent training realism
