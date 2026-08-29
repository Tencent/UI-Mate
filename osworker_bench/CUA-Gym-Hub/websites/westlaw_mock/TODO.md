# Xestlaw Mock -- TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

Without these, the app cannot render. Dev implements these first.

- [ ] **Project scaffold**: `npm create vite@latest westlaw_mock -- --template react` inside the repo root, install deps (`react-router-dom`). No CSS framework -- use plain CSS to match DESIGN.md precisely. Add `lucide-react` for icons.
- [ ] **App layout (AppShell)**: Three persistent horizontal bars at top, then content area below:
  1. **Header bar** (48px height, background `#1A3A5C` with subtle gradient to `#0D2137`): Left: Thomson Reuters / XESTLAW EDGE logo in white (text-based, no image needed -- use "THOMSON REUTERS" small caps 10px above "XESTLAW EDGE" bold 16px). Center: search bar (white input, 500px wide, 36px height, border-radius 2px, right side has jurisdiction dropdown "All State & Federal" as a `<select>` styled to look inline, then orange `#E8600A` search button 40px wide with magnifying glass icon). Right side: small icon buttons in white -- History (clock), Folders (folder), Favorites (star), Notifications (bell with unread badge count), user avatar circle with initials "SC".
  2. **Secondary nav bar** (40px, background `#1E4A6E` slightly lighter): Horizontal text links in white/light gray: "All content" (dropdown), "History", "Folders", "Favorites", "Notifications" -- these duplicate the header icons as text links for accessibility. Right side: "Sign out" text (non-functional).
  3. Content area fills remaining viewport height, white background `#FFFFFF`.
- [ ] **Routing**: `BrowserRouter` in App.jsx with these routes:
  - `/` -- Homepage
  - `/search` -- Search results (query params: `?q=...&jurisdiction=...&type=...`)
  - `/document/case/:id` -- Case document view
  - `/document/statute/:id` -- Statute document view
  - `/document/secondary/:id` -- Secondary source document view
  - `/history` -- Research history page
  - `/folders` -- Folders list page
  - `/folders/:id` -- Individual folder contents
  - `/favorites` -- Favorites page
  - `/keycite/:docType/:id` -- KeyCite detail view
  - `/go` -- State inspection endpoint (JSON: `{initial_state, current_state, state_diff}`)
- [ ] **State management**: `AppContext.jsx` wrapping the app + `utils/dataManager.js`. The dataManager exports `createInitialData()` (see `assets/data_model.md` for full schema), `loadState()`, `saveState()`, and state diff helpers. Use localStorage key `"westlaw_mock_state"`. The context provides `state` + `dispatch` (useReducer pattern) with actions for search, filter, navigate, CRUD folders, toggle favorites, mark notifications read, etc.
- [ ] **`/go` endpoint**: `src/pages/Go.jsx` that reads initial and current state from dataManager, computes deep diff, and renders `<pre>` JSON with `{initial_state, current_state, state_diff}`.
- [ ] **Session isolation**: `vite.config.js` mock-api plugin: `POST /post?sid=<sid>` accepts `{action:"set"|"set_current"|"reset", state:{...}}`, `GET /state?sid=<sid>` returns current state, `GET /go?sid=<sid>` returns `{initial_state, current_state, state_diff}`. dataManager session helpers: `initSession(sid, state)`, `getSession(sid)`, `updateSession(sid, state)`, `resetSession(sid)`. When `action:"set"`, write both `.initial.json` and current state.

---

## P1 -- Primary Features

Core interactive workflows for agent training. Implement in listed order.

### Homepage

- [ ] **Homepage layout**: Below the header/secondary nav, render a centered content area (max-width 1100px). At top: a "Get Started" quick-access bar (row of shortcut icons/links: "AI-Assisted Research", "Quick Check", "Practical Law", "Statutes", "Regulations"). Below that: a horizontal tab row with tabs: "AI-Assisted Research" | "Precision Research" | "Content Types" | "Cases" | "Statutes" | "Practical Law" | "Secondary Sources" | "Regulations". Active tab has orange `#E8600A` 3px bottom border and bold text. Default active tab: "AI-Assisted Research".
- [ ] **AI-Assisted Research tab content**: Shows a welcome section: heading "Welcome to Xestlaw's AI-Assisted Research" with a description paragraph (see screenshot reference `docs_0004.png`). Below: two cards side by side -- "How the AI works" and "Tips for best results" (static text content). Below that: a "Legal question" input area (textarea, ~400px wide) with prompt text "Ask your legal research question with more detail for better results." and a "Search for..." button. Also shows "Jurisdiction: All State & Federal" selector.
- [ ] **Precision Research tab content**: Shows the same central search bar (duplicated from header for prominence) with jurisdiction dropdown, plus a row of content type quick-filter buttons (Cases, Statutes, Secondary Sources, Regulations) that when clicked navigate to `/search?type=<type>`.
- [ ] **Content Types tab**: Grid layout (3 columns) showing clickable category cards: "Business Law Center", "Capitol Watch", "General Counsel Resources", "Dockets", "Litigation Analytics", "Company Investigator", "Intellectual Property", "International Materials", "News", "Profiler", "Sample Agreements", "Trial Transcripts & Oral Arguments", "Directories". Each card is a simple text link with subtle hover background. Clicking navigates to `/search?type=<type>&category=<category>` (mock -- shows search results).
- [ ] **Browse section below tabs**: Two-column grid of category links matching the screenshot (000003.jpg). Links: Business Law Center, Capitol Watch, General Counsel Resources, Dockets, Litigation Analytics, Company Investigator, Intellectual Property, International Materials, News, Profiler, Trial Transcripts & Oral Arguments, Sample Agreements.

### Search

- [ ] **Search bar interaction**: Typing in the header search bar shows an autocomplete dropdown (box-shadow `0 4px 12px rgba(0,0,0,0.12)`, white background, max-height 400px, z-index 1000). Dropdown has three sections separated by thin gray `#E8ECF0` dividers:
  1. **Questions** header (bold 13px, gray): 3-4 natural language question suggestions based on typed text (e.g., typing "employment discrimination" shows "Is employment discrimination a tort?", "Is summary judgment appropriate in employment discrimination cases?", etc.). Each question shows "All State & Federal" jurisdiction label. Left side has content type labels in small orange text (Questions, Cases, Statutes & Court Rules, Regulations).
  2. **Search Suggestions** header: 4-5 key-number-based search suggestions with highlighted matching terms in yellow `#FFF3B0` background.
  3. **Content Pages** header: 1-2 content page links (e.g., "Employment Discrimination Coordinator").
  Clicking any suggestion navigates to `/search?q=<suggestion text>`. Pressing Enter in the search bar navigates to `/search?q=<typed text>`. Autocomplete filters suggestions client-side from a pre-seeded list of ~20 suggestion strings.
- [ ] **Search execution**: When navigating to `/search`, the `currentSearch` state updates with the query. The app filters the mock data (cases, statutes, secondarySources, regulations) by matching the query string against title, synopsis, topics, headnote text, and opinion text fields (simple case-insensitive substring match). Results are grouped by content type with counts.

### Search Results -- Overview

- [ ] **Search results overview page** (`/search?q=...`): Left sidebar (220px, background `#F5F7FA`) shows "Content types" header and a clickable list of content types with result counts: "Overview" (active by default, bold), "Cases (N)", "Trial Court Orders (N)", "Statutes & Court Rules (N)", "Secondary Sources (N)", "Practical Law (N)", "Regulations (N)". A "Set default" link appears next to Overview. Clicking any content type sets `activeContentType` in state and switches the main content area. Right: "Filter" section header and "Select multiple" toggle.
- [ ] **Overview main content**: For the overview tab, the main area (right of sidebar) shows the search query as a heading, then for each content type with results, shows the top 2-3 results in a condensed card format: doc icon, KeyCite flag (if case), title (blue link `#1A73BA`), court/source + date + citation in gray 13px, and a 2-line synopsis excerpt with search terms highlighted in yellow `#FFF3B0`. Each content type section has a "View all N results" link.

### Search Results -- Cases List

- [ ] **Cases list view** (`/search?q=...&type=cases` or click "Cases" in sidebar): Header area shows "Cases (N)" title in 22px bold, pagination "1-20 >" with left/right arrows, sort dropdown (options: "Relevance", "Date (newest)", "Date (oldest)", "Most cited"), view toggle icons (list view / detail view -- list is default), toolbar row with: alert bell icon, list/grid icons, copy icon, print icon, email icon. Below: "Select all items" checkbox + "No items selected" text + "Related documents" link at far right.
- [ ] **Individual case result item**: Each result is a row with: checkbox (left), document icon, KeyCite flag icon (colored triangle/flag -- red/yellow/orange/green/blue based on `keyCiteFlag` field, or no icon if null), result number (1., 2., etc.), case title as blue link (`#1A73BA`, 16px semibold, clicking navigates to `/document/case/:id`). Below title: court name + date + citation + WL number in gray 13px. Below that: a topic/headnote summary line with yellow-highlighted search terms. Below that: a synopsis excerpt (2-3 lines) with bold/highlighted matching terms. A "Show synopsis" / "Hide synopsis" toggle (chevron + text) expands/collapses the full synopsis. Results separated by 1px `#E8ECF0` border. Implement the yellow highlight by wrapping matched query words in `<mark>` tags with `background: #FFF3B0`.
- [ ] **Pagination**: Below results list, show pagination: "1-20" text, left arrow (disabled on page 1), right arrow, with total count. Clicking arrows updates `currentSearch.page` and re-slices results. Show 20 results per page.

### Left Filter Panel (Cases)

- [ ] **Filter panel** (220px left sidebar when viewing Cases results): Header "Filter category" + "Cases" subheading. "Restore previous filters" link (resets all filters to empty). "Search within results" text input (filters displayed results client-side by additional substring match). Below: collapsible filter sections, each with category label (14px semibold) and "+" icon that expands/collapses:
  - **Jurisdiction**: Expandable list of jurisdictions (Federal, 1st Circuit, 2nd Circuit, ... or All States, New York, California, etc.). Each is a checkbox + label + count. Checking filters results.
  - **Date**: Date range picker with "From" and "To" text inputs (format: MM/DD/YYYY) + "Apply" button.
  - **Reported Status**: Checkboxes: "Reported", "Unreported".
  - **Practice Area**: Checkboxes: "Employment Law", "Constitutional Law", "Civil Rights", "Contracts", "Torts", "Criminal Law", etc.
  - **Procedural Posture**: Checkboxes: "Motion for Summary Judgment", "Trial", "Appeal", "Motion to Dismiss", etc.
  - **Judge**: Text input to search/filter judge names, then checkbox list.
  - **Attorney**: Same pattern as Judge.
  - **Law Firm**: Same pattern.
  - **Key Number**: Expandable key number tree (simplified -- show top-level topics with counts).
  - **Party**: Text input to search party names.
  All filter selections update `currentSearch.filters` in state and re-filter the displayed results. Multiple filters within a category are OR; across categories are AND.

### Document View -- Case

- [ ] **Case document page** (`/document/case/:id`): Full-width content below header. Optional left sidebar (document outline/table of contents -- collapsible, 200px) listing: "Synopsis", "Headnotes", "Opinion", "Holdings". Clicking scrolls to that section. Main content area (padded 24px):
  1. **Header bar**: Case title in 20px bold, below: court name, date decided, citation, WL number in gray 14px. Far right: toolbar icons -- star/favorite toggle (filled orange if favorited), folder icon (opens "Add to folder" dropdown), copy citation icon, print icon, download icon, email icon. KeyCite flag displayed prominently to left of title (large colored flag icon with tooltip text like "Negative Treatment").
  2. **Synopsis section**: Bordered box with "Synopsis" header. Text of the synopsis with search terms highlighted. "Hide synopsis" toggle link.
  3. **Headnotes section**: Each headnote is a numbered block (HN1, HN2, ...) with: key number topic tag (e.g., "92 Constitutional Law > 92k1520 Freedom of Speech" in a pill/badge with orange left border), one-paragraph summary text. Headnotes are visually separated by light borders.
  4. **Holdings section**: "Holdings" header, bulleted list of holding statements.
  5. **Opinion text section**: "Opinion" header with judge name attribution (e.g., "Joseph F. Bianco, J."), then multi-paragraph opinion text. Search terms highlighted in yellow.
- [ ] **Star/Favorite toggle on document**: Clicking the star icon toggles `isFavorite` on the case and adds/removes its ID from the `favorites` array in state. Star turns solid orange when favorited.
- [ ] **Add to folder from document**: Clicking the folder icon shows a dropdown listing existing folders (checkboxes). Checking a folder adds the document to that folder's items array. An "Create new folder" option at the bottom opens a small inline form (name input + "Create" button).

### Folder Management

- [ ] **Folders page** (`/folders`): List of folders in a table/list layout. Each row: folder icon, folder name (link to `/folders/:id`), item count, last updated date, actions (rename pencil icon, delete trash icon). Above list: "Create new folder" button (opens inline form or modal: name input + "Create" button). Subfolders are indented under their parent.
- [ ] **Individual folder view** (`/folders/:id`): Folder name as page title (editable on click -- inline rename). Below: table of documents in the folder. Columns: checkbox, doc type icon (case/statute/secondary), KeyCite flag, document title (link to document view), citation, date added, notes (editable inline text). Toolbar above table: "Remove selected" button (removes checked items from folder), "Move to folder" dropdown, sort options.
- [ ] **Folder CRUD**: Create folder (name required, optional parent folder), rename folder (inline edit), delete folder (confirmation dialog: "Are you sure you want to delete this folder and all its contents?"), add/remove documents to/from folders.

### Research History

- [ ] **History page** (`/history`): Reverse-chronological list of `SearchHistoryEntry` items. Two view modes toggled by icons: "List view" (default) and "Timeline view". List view shows each entry as a row: icon (magnifying glass for search, document icon for doc view), title/query text (bold), jurisdiction label, timestamp (relative: "2 hours ago", "Yesterday", etc.), result count (for searches). Clicking a search entry re-runs that search (navigates to `/search?q=...`). Clicking a document entry navigates to that document. Timeline view: vertical timeline with date headers grouping entries by day, and entries as cards along the timeline. "Clear history" button at top (with confirmation).

### Statutes & Regulations Results

- [ ] **Statutes results list**: Same layout as Cases but without KeyCite flags for most items. Each result shows: statute title (blue link), code name, section number, a brief excerpt with highlighted terms. Clicking navigates to `/document/statute/:id`.
- [ ] **Statute document view** (`/document/statute/:id`): Title, code, section number, effective date at top. Full statute text below. Annotations section listing "Notes of Decisions" counts. Historical notes section. Same toolbar as case document (favorite, folder, copy, print).

### Secondary Sources Results

- [ ] **Secondary sources results list**: Each result: title (blue link), type badge ("Treatise", "Law Review", etc.), author, publisher, year, citation, excerpt with highlights. Clicking navigates to `/document/secondary/:id`.
- [ ] **Secondary source document view**: Title, author, publisher, year, citation at top. Left sidebar: table of contents (list of sections with numbers and titles, clickable to scroll). Main content: section text. Same toolbar as other documents.

---

## P2 -- Secondary Features

Depth and realism, implement after P1 is complete.

### Notifications

- [ ] **Notification bell**: Bell icon in header with unread count badge (red circle with white number). Clicking opens a dropdown panel (320px wide, max-height 400px, scrollable) listing notifications. Each notification: type icon (alert bell / keycite flag / system gear), title text, message text, timestamp (relative), read/unread indicator (bold for unread, normal for read). Clicking a notification marks it as read and navigates to the relevant alert or document. "Mark all as read" link at top of dropdown.
- [ ] **Favorites page** (`/favorites`): List of all documents where `isFavorite === true`. Same layout as folder contents -- table with doc type, title, citation, date. Remove from favorites (star toggle).

### KeyCite Detail View

- [ ] **KeyCite page** (`/keycite/:docType/:id`): For a given case, shows three tabs: "Negative Treatment" (list of cases that negatively cite this one, with treatment type: "Distinguished", "Overruled", "Criticized"), "Citing References" (list of all citing cases with depth-of-treatment bar -- 1-4 green bars indicating how extensively the case is discussed), "History" (procedural history timeline). Each citing reference row: case title link, court, date, treatment type, depth bars. This can be simplified -- 5-10 mock citing references per case is sufficient.

### Content Type Switching

- [ ] **Tab-based content switching on search results**: The left sidebar content type list (Overview, Cases, Statutes, etc.) and/or a horizontal tab bar at top of results should allow switching between content types. Switching updates `currentSearch.activeContentType` and re-renders the main results area with the appropriate filtered list. The active type has bold text and orange left border in sidebar.

### Sort Options

- [ ] **Sort dropdown on results pages**: "Relevance" (default -- no reorder), "Date (newest)" (sort by dateDecided descending), "Date (oldest)" (ascending), "Most cited" (sort by a `citedByCount` field or mock metric). Changing sort updates `currentSearch.sort` and re-orders displayed results.

### Bulk Actions

- [ ] **Multi-select on results**: Each result has a checkbox. "Select all items" checkbox at top. When items are selected, toolbar activates: "Add to folder" button (opens folder picker dropdown), "Print" button (shows toast "Printing N documents..."), "Email" button (shows toast "Email dialog would open"), "Download" button (shows toast "Downloading N documents..."). Selection state tracked in component-local state.

### Copy/Print/Download Actions

- [ ] **Document action toolbar**: On document view pages, toolbar buttons: "Copy citation" (copies citation string to clipboard, shows toast "Citation copied"), "Print" (shows toast "Print dialog would open"), "Download" (shows toast "Download started"), "Email" (shows toast "Email dialog would open"). These are non-functional but show realistic toast notifications.

### Browse by Key Number

- [ ] **Key Number browse** (accessible from Content Types tab or a dedicated route `/browse/keynumbers`): Hierarchical tree of KeyNumberTopic entities. Top-level topics (Constitutional Law, Employment Law, etc.) are expandable nodes showing subtopics. Each node shows topic name and case count. Clicking a leaf-level topic navigates to `/search?keyNumber=<number>` showing matching cases.

### Search Within Results

- [ ] **"Search within results" input**: In the filter panel, a text input. Typing and pressing Enter or clicking a search icon narrows the currently displayed results by additionally matching the new term against all text fields. The narrowing term is shown as a removable chip/tag above results: "Results for 'original query' > narrowed by 'within term'" with an X to clear.

### Alerts Management

- [ ] **Create alert from search**: On search results page, an "Alert" bell icon in the toolbar. Clicking opens a modal: "Create Alert" with fields: alert name (pre-filled with query), jurisdiction, content type (pre-filled), frequency dropdown (Daily/Weekly). "Save" creates a new Alert entity. "Cancel" closes.
- [ ] **Alerts list**: Accessible from Notifications dropdown or a route. Shows all alerts with name, query, frequency, last triggered date, new result count, active/inactive toggle.

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `assets/data_model.md` for full field definitions.

- [ ] **currentUser**: Sarah Chen, Senior Associate at Morrison & Associates LLP, jurisdiction "All State & Federal", avatar initials "SC".
- [ ] **cases**: 50 cases covering: ~10 employment discrimination (varying courts, dates 2005-2026, mix of KeyCite flags), ~8 Constitutional Law / First Amendment, ~8 contract disputes, ~8 personal injury / torts, ~8 criminal law (state + federal), ~8 miscellaneous. Each case needs: realistic title (plaintiff v. defendant), real-looking citation and WL number, court name, date, 2-4 headnotes with key number topics, a 2-3 sentence synopsis, 2-4 holdings, and a 2-3 paragraph abbreviated opinion excerpt. KeyCite flags distributed: ~5 red, ~8 yellow, ~3 orange, ~15 green, ~3 blue, ~16 null.
- [ ] **statutes**: 20 statutes including: 42 USC 1983 (Civil Rights), Title VII (42 USC 2000e), ADA (42 USC 12101), 4th Amendment, FMLA (29 USC 2601), FLSA (29 USC 201), Sherman Act (15 USC 1), Clean Air Act section, 2-3 state statutes (NY CPLR, CA Civil Code), UCC provisions. Each with full text (1-2 paragraphs), annotations count, historical notes.
- [ ] **secondarySources**: 10 sources -- 3 treatises, 3 law review articles, 2 legal encyclopedias, 2 practice guides. Each with 3-5 sections with brief text.
- [ ] **regulations**: 5 regulations from EEOC, EPA, SEC, DOL, FTC. Each with full text.
- [ ] **folders**: 5 folders -- "Morrison v. City of Springfield - Case Research" (8 items), "Title VII Research" (5 items), "Client Memo - ADA Compliance" (3 items), "Appellate Brief Sources" (6 items), "Personal Notes" (subfolder of first, 2 items).
- [ ] **history**: 20 entries spanning last 2 weeks -- mix of 12 searches and 8 document views, most recent first.
- [ ] **alerts**: 4 alerts -- "First Amendment employment cases" (Daily, 3 new), "ADA reasonable accommodation" (Weekly, 0 new), "Summary judgment employment" (Daily, 1 new), "Title VII retaliation" (Weekly, 5 new).
- [ ] **notifications**: 6 notifications -- 3 unread (alert results, keycite update, system message), 3 read.
- [ ] **keyNumberTopics**: 30+ topics in 3-level hierarchy. Top level: Constitutional Law (92), Employment Law (169), Civil Rights (78), Contracts (95), Torts (379), Criminal Law (110). Each with 3-5 subtopics, each subtopic with 2-3 leaf topics. Each leaf has a case count.
- [ ] **searchSuggestions**: Pre-seeded array of ~25 autocomplete suggestions covering natural language questions, key-number-based suggestions, and content page links.
- [ ] **currentSearch**: Default empty state: `{ query: "", jurisdiction: "All State & Federal", activeContentType: "overview", filters: {}, sort: "relevance", page: 1, resultsPerPage: 20 }`.

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login (app starts pre-logged-in as Sarah Chen)
- Real Thomson Reuters API calls or database connections
- Real file upload (Quick Check / Litigation Document Analyzer upload)
- Real email/print/download (show toast notifications only)
- Real AI-assisted research (show static content for AI tab)
- CoCounsel / Deep Research AI features (too complex, out of scope)
- Mobile/responsive layout (desktop only, min-width 1200px)
- Accessibility compliance beyond basic semantic HTML
- Dark mode / theme switching
- Real-time alerts or WebSocket connections
- Payment / subscription management
