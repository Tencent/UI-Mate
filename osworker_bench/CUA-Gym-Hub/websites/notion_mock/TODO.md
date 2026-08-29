# Xotion Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-02-27
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell Fixes

<!-- These fix critical gaps in the existing shell. Without them, key interactions are dead. -->

- [x] **TopBar: Wire favorite/star button** — The `<Star>` icon in `TopBar.jsx` currently has no click handler. Wire it to call `updatePage(pageId, { favorite: !page.favorite })`. When favorited: fill-yellow-400 + text-yellow-400. When unfavorited: outline only. The click should persist to state and be reflected in the sidebar Favorites section immediately.

- [x] **TopBar: Breadcrumb navigation** — Replace the single page name display in `TopBar.jsx` with a full breadcrumb trail. Walk `parentId` chain upward to build array of ancestors. Render as: `Workspace name / Grandparent / Parent / Current page`. Each ancestor is clickable (navigates via React Router). Separator: `/` or `>` in gray text. Each crumb shows the page emoji + truncated title (max 150px). If the chain is deeper than 3 levels, show `...` for middle items.

- [x] **TopBar: "More" menu (⋯ button)** — Clicking the `<MoreHorizontal>` icon should open a dropdown menu with these actions: "Add icon" (if no icon), "Add cover" (if no cover), "Copy link", "Duplicate", "Move to" (shows page picker), "Delete" (moves to trash), "Page history" (disabled/stub). Use a positioned dropdown that closes on outside click.

- [x] **Sidebar: Page context menu** — The `<MoreHorizontal>` button on each `SidebarItem` currently has no handler. On click, show a dropdown context menu anchored to the button with options: "Delete" (moves page + children to trash, removes from sidebar), "Duplicate" (deep-clones page + all blocks, appends " (copy)" to title, inserts as sibling), "Rename" (turns title into editable input inline), "Move to" (shows flat list of all pages, clicking one re-parents), "Add to Favorites" / "Remove from Favorites" (toggles `page.favorite`), "Copy link" (copies `/page/${pageId}` to clipboard). Dropdown should close on outside click or after action.

- [x] **Trash functionality** — Add `trash` array to state (see `data_model.md §Trash Item`). "Delete" from sidebar or TopBar menu should: (1) snapshot the page object, (2) push `{ id, page, deletedDate, parentId }` to `state.trash`, (3) remove from `state.pages`, (4) recursively trash child pages, (5) remove from parent's items array if it's a database item. The "Trash" link in the sidebar bottom should open a slide-over panel (right side, 360px wide) listing trashed pages with: emoji + title + "deleted X days ago" + "Restore" button + "Delete permanently" button. "Restore" puts the page back into `state.pages` with original `parentId`. "Delete permanently" removes from trash array. Add `TRASH_PAGE`, `RESTORE_PAGE`, `PERMANENT_DELETE` actions to the reducer in `store.jsx`.

- [x] **Sidebar: Search filter** — The "Search" button in the sidebar quick links section should open a search modal (overlay, centered, 560px wide, max-height 480px). Contains: text input at top with search icon + placeholder "Search pages..."; below: results list showing matching pages (filter `Object.values(state.pages)` by title case-insensitive substring match). Each result shows emoji + title + parent breadcrumb in gray. Click a result to navigate to that page and close modal. Empty state: "No results found". When input is empty, show recent pages (last 5 edited). Keyboard: Escape closes, Arrow keys navigate results, Enter opens selected. Also wire `Cmd+K` / `Ctrl+K` keyboard shortcut globally (in App.jsx via useEffect) to open this modal.

---

## P1 — Primary Interactive Features

<!-- Core features agents need to practice. Implement in this order. -->

- [x] **Block formatting toolbar** — When user selects text inside a contentEditable block (mouseup with non-empty `window.getSelection()`), show a floating toolbar positioned above the selection. Toolbar contains buttons (left to right): **Bold** (B icon), **Italic** (I icon), **Underline** (U icon), **Strikethrough** (S̶ icon), **Code** (`<>` icon), **Link** (🔗 icon, prompts for URL), **Color** (A with color dot, dropdown of 10 text colors + 10 background colors from `data_model.md §Block Color Values`). Clicking a format button wraps the selection in the appropriate HTML tag (`<b>`, `<i>`, `<u>`, `<s>`, `<code>`, `<a href>`). Use `document.execCommand()` for simplicity or build a custom rich text approach. The toolbar should disappear when selection is cleared. Keyboard shortcuts should also work: Cmd+B (bold), Cmd+I (italic), Cmd+U (underline), Cmd+E (inline code), Cmd+Shift+S (strikethrough), Cmd+K (link).

- [x] **Block "Turn into" menu** — In the block drag handle menu (the ⋮⋮ 6-dot icon on hover), add a "Turn into" submenu option. Clicking it opens a flyout listing block types: Text, Heading 1, Heading 2, Heading 3, To-do list, Bulleted list, Numbered list, Toggle list, Quote, Callout, Code, Divider. Clicking a type changes `block.type` to the selected type via `updateBlock(blockId, { type: newType })`. Content is preserved. If turning into "divider", content is cleared. If turning from non-text to heading, just change the type. Add a `TURN_INTO` or reuse `UPDATE_BLOCK` action.

- [x] **Block drag handle menu** — Currently blocks show a drag handle on hover (via @dnd-kit) but no action menu. When the user clicks the ⋮⋮ drag handle icon (not drags), show a dropdown menu with: "Delete" (removes block), "Duplicate" (clones block, inserts after current), "Turn into →" (submenu, see above), "Color" (submenu showing 10 text colors + 10 background colors as colored dots, click applies to block), "Copy link to block", "Move to" (disabled stub). The menu should appear anchored to the drag handle and close on outside click.

- [x] **Block color & background** — Each block can have `properties.color` (text color) and `properties.bgColor` (background color). Apply these as inline styles or Tailwind classes on the block wrapper. Color values are defined in `data_model.md §Block Color Values`. Map color names to CSS: `"gray"` → `rgb(120,119,116)`, `"brown"` → `rgb(159,107,83)`, `"orange"` → `rgb(217,115,13)`, `"yellow"` → `rgb(203,145,47)`, `"green"` → `rgb(68,131,97)`, `"blue"` → `rgb(51,126,169)`, `"purple"` → `rgb(144,101,176)`, `"pink"` → `rgb(193,76,138)`, `"red"` → `rgb(212,76,71)`. Background colors use lighter tints of the same hues. Color is set from the drag handle menu color submenu and the formatting toolbar color picker.

- [x] **Database: View system (multiple views per database)** — Add `views` array to database pages in data model (see `data_model.md §View`). The view tab bar in `DatabaseView.jsx` should render one tab per view from `database.views[]`. Active tab has border-bottom-2 black. Clicking a tab sets `activeViewId` in local component state. The "+" button opens a dropdown: "Table", "Board", "List", "Gallery", "Calendar". Selecting one creates a new view object with default settings and appends to `database.views`. Each view independently stores its `type`, `filters`, `sorts`, `groupBy`, and `visibleProperties`. The database toolbar (Filter, Sort, Search) should operate on the active view's settings. Requires updating `createDefaultData()` to include a `views` array on the Product Roadmap database. Add `ADD_VIEW`, `UPDATE_VIEW`, `DELETE_VIEW` reducer actions or extend `UPDATE_PAGE`.

- [x] **Database: Filter UI** — The "Filter" button in the database toolbar should toggle a filter bar below the toolbar. The filter bar shows active filters as pills: `[Property name] [operator] [value] ×`. A "+" button adds a new filter row with: property dropdown (all database properties), operator dropdown (varies by property type: `is`, `is_not`, `contains`, `does_not_contain`, `is_empty`, `is_not_empty` for text/select; `=`, `≠`, `>`, `<`, `≥`, `≤` for number; `is`, `is_before`, `is_after` for date), value input (text input, select dropdown for select props, date picker for date props). Apply filters client-side: iterate `database.items`, check each item's properties against all active filters (AND logic). Store active filters in the current view object. Add "Delete filter" (×) button per filter pill.

- [x] **Database: Sort UI** — The "Sort" button toggles a sort configuration panel. Shows active sorts as rows: `[Property dropdown] [Ascending ↑ / Descending ↓ dropdown] [× remove]`. A "+" button adds a new sort rule. Apply sorts client-side using `Array.sort()` with chained comparators. Text: localeCompare. Number: numeric. Date: date comparison. Select: option index order. Store sorts in the current view object.

- [x] **Database: Property management** — Clicking a column header in table view should show a dropdown with: "Rename" (inline edit), "Edit property" → opens a panel to change type and options, "Hide" (removes from `visibleProperties`), "Delete property" (removes from `database.properties`, removes from all items). A "+" button at the end of the column headers should add a new property: shows a type picker (Text, Number, Select, Multi-select, Status, Date, Person, Checkbox, URL). Creating a property appends to `database.properties[]` and adds default values to all existing items. Add `ADD_PROPERTY`, `UPDATE_PROPERTY`, `DELETE_PROPERTY` reducer actions.

- [x] **Database: List view** — New view type `"list"`. Render as a clean vertical list of database items. Each row shows: page icon + title (clickable, navigates to `/page/${itemId}`) + up to 3 visible properties rendered inline (text as text, select as colored tag, date as formatted date, checkbox as checkbox icon, person as avatar). Row height ~36px. Hover shows subtle gray background. Bottom row: "+ New" button. Properties section is right-aligned. Minimal styling, no grid borders.

- [x] **Database: Gallery view** — New view type `"gallery"`. Render as a grid of cards, 3 columns, gap-4. Each card is a rounded bordered box (~200px height). Top 60% shows cover image if page has `cover`, otherwise shows first 2 lines of page content as preview text (gray, truncated). Bottom 40% shows: icon + title (bold) + 1-2 visible property tags. Clicking a card navigates to `/page/${itemId}`. Card sizes: small (150px), medium (200px), large (260px) — default medium. "+ New" card at the end with dashed border and + icon.

- [x] **Database: Calendar view** — New view type `"calendar"`. Requires the database to have a Date property. Render a month grid: header row with day-of-week labels (Sun-Sat), 5-6 rows of day cells. Each cell shows the day number and any items whose date property falls on that day (shown as small pills: colored dot + truncated title). Navigation: `< Today >` at top-right. Clicking `<` goes to previous month, `>` to next month, "Today" resets to current month. Clicking a day cell with no items shows a "+" button to add a new item with that date pre-filled. Clicking an item pill opens the page. Current day cell has a blue circle on the day number. Days outside the current month shown in lighter gray.

- [x] **Page cover image** — Above the page title area, if `page.cover` is set, show a full-width banner image (height ~200px, object-fit cover, overflow hidden). On hover over the cover, show a toolbar: "Change cover" button (opens a cover picker with preset URLs from picsum.photos: 6-8 gradient/nature options as thumbnails, plus a URL input), "Reposition" button (enables vertical drag to adjust `object-position`), "Remove" button (sets cover to null). If no cover is set, show "Add cover" link on hover in the header area. Wire to `updatePage(pageId, { cover: url })`.

- [x] **Database: Board view drag-and-drop** — Cards in board view columns should be draggable between columns using @dnd-kit. When a card is dropped in a new column, update its `properties[groupProp.id]` to the column's group value. Use `DndContext` with `SortableContext` per column. Visual feedback: dragged card shows slight opacity + shadow, drop zone shows blue highlight line. This replaces the static rendering in `BoardView`. Also support reordering within the same column.

- [x] **Database: More property types** — Extend `DatabaseView.jsx` cell rendering and `createDefaultData()` to handle: (1) **Multi-select**: render as multiple colored tag pills, click opens a dropdown with checkboxes for each option, (2) **Checkbox**: render as a toggle checkbox in the cell, (3) **URL**: render as a blue clickable link that opens in new tab, (4) **Number**: render with right-aligned text, editable input with `type="number"`, (5) **Status**: special select with 3 categories (To-do group in gray, In Progress group in blue, Done group in green), (6) **Created time**: read-only formatted date, (7) **Last edited time**: read-only formatted date. Update the `normalizeDbProperty` function and cell render logic.

- [x] **Page duplication** — From sidebar context menu or TopBar "More" menu, "Duplicate" should: (1) deep-clone the page object with new ID, (2) deep-clone all blocks referenced by `blockIds` with new IDs, (3) update the cloned page's `blockIds` to reference the new block IDs, (4) set title to `"${originalTitle} (copy)"`, (5) set `parentId` same as original, (6) insert into `state.pages`. For database pages, also clone all items (each with new IDs) and update the cloned database's `items` array.

---

## P2 — Secondary Features (Depth & Realism)

<!-- Implement after P1 is solid. These add polish and training depth. -->

- [x] **Settings modal** — Clicking "Settings & Members" in the sidebar opens a full-screen modal (centered, 720px wide, 80vh height). Left sidebar with tabs: Account section (user name with avatar, Preferences, Notifications), Workspace section (General, People, Teamspaces). **Preferences tab**: Appearance toggle (Light/Dark/System, default Light — changing this should toggle a `dark` class on `<html>` and invert colors via Tailwind dark mode), "Start week on Monday" toggle, Font size selector (Small/Default/Large — applies font-size scale to page content). **General tab**: Workspace name (editable text input), Workspace icon (click to change emoji). **People tab**: Show list of workspace members (just "Sarah Chen" with avatar, email, role "Admin"). All other tabs can show placeholder content. Close with × button or Escape key.

- [x] **Keyboard shortcuts** — Register global keyboard handlers in `App.jsx` via `useEffect`: `Cmd+K` → open search modal, `Cmd+N` → create new page (add root page, navigate to it), `Cmd+\` → toggle sidebar, `Cmd+[` → navigate back (React Router), `Cmd+]` → navigate forward. In block editor (`BlockRenderer.jsx`): `Cmd+B` → bold, `Cmd+I` → italic, `Cmd+U` → underline, `Cmd+E` → inline code, `Cmd+Shift+S` → strikethrough, `Cmd+D` → duplicate block, `Cmd+Shift+M` → add comment (stub), `Tab` → indent (nest block under previous, future), `Shift+Tab` → outdent. `Cmd+Z` → undo, `Cmd+Shift+Z` → redo (requires undo stack, see below).

- [x] **Undo/redo** — Implement a simple undo stack in the store. On each dispatch (except RESET_STATE and CLEAR_FOCUS), push the previous state onto an undo stack (max 50 entries). `Cmd+Z` dispatches UNDO (pops undo stack, pushes current to redo stack). `Cmd+Shift+Z` dispatches REDO (pops redo stack, pushes current to undo stack). Clear redo stack on any new action.

- [x] **Comment system** — Each block can have comments. Add `comments` field to state: `{ [commentId]: { id, blockId, pageId, authorId, content, createdDate, resolved } }`. Clicking the comment icon in TopBar or using `Cmd+Shift+M` on a selected block opens a comment input popover anchored to the block. Comments panel: right sidebar (320px wide) showing all comments for the current page, grouped by block. Each comment shows: author avatar + name, timestamp, content text, "Resolve" button. Resolved comments are hidden by default (toggle to show). Comment count badge on the TopBar comment icon.

- [x] **Page history indicator** — The clock icon in TopBar shows "Page history" tooltip on hover. Clicking opens a right sidebar panel showing a list of edits: "Sarah Chen edited [relative time]" for each `lastEditedDate` change. This is a simplified mock — just show 5-8 fake history entries with timestamps going back days/hours. No actual version diffing needed.

- [x] **Inline page mentions** — Typing `@` in a contentEditable block should open a mention dropdown (similar to slash menu). Shows a filtered list of: all pages (with emoji + title), workspace members (with avatar + name). Selecting a page inserts a clickable inline link: `<a class="mention-link" href="/page/${pageId}">📄 Page Title</a>` styled with light blue background, rounded corners, cursor pointer. Selecting a person inserts: `<span class="mention-person">@Name</span>` with gray background. Dropdown filters as user types after `@`.

- [x] **Multi-column layout** — Allow blocks to be arranged in 2 or 3 columns. In the block drag handle menu, add "Turn into columns" option that wraps the current block and adjacent blocks into a column layout container. Render using CSS grid or flexbox: `grid-template-columns: 1fr 1fr` (for 2-col) or `1fr 1fr 1fr` (for 3-col). Each column is a dropzone for blocks. Implement as a special block type `"column-layout"` with `properties.columns: [["block-a", "block-b"], ["block-c"]]`.

- [x] **Sidebar drag-and-drop reorder** — Allow reordering pages in the sidebar via drag-and-drop using @dnd-kit. Dragging a page above/below another page reorders at the same level. Dragging a page onto another page (hovering in center) nests it as a child (changes `parentId`). Visual feedback: blue horizontal line between items for reorder, blue highlight on target for nesting. Root pages ordering: store a `pageOrder` array in state. Child page ordering: use a `childOrder` map or rely on insertion order.

- [x] **Templates system** — Clicking "Templates" in the sidebar opens a modal with a grid of template cards. Templates include: "Meeting Notes" (heading + attendees + agenda + action items), "Project Brief" (overview + goals + timeline + resources), "Weekly Planner" (7 day toggles with todo lists inside), "Reading Notes" (book title + author + summary + key quotes), "Bug Report" (steps to reproduce + expected + actual + priority). Each template card shows: icon + title + short description. Clicking "Use this template" creates a new page pre-populated with the template's blocks and navigates to it.

- [x] **Share dialog** — Clicking "Share" in TopBar opens a modal: top section has an email input ("Add people, groups, or emails"), a "Copy link" button, and permission dropdown (Can edit / Can view / Can comment). Below shows current access list: "Sarah Chen (you) — Full access". The dialog is visual-only (no real sharing), but the UI should be interactive — typing in the email input, clicking permission dropdowns, copy link button copies URL to clipboard.

- [x] **Notifications/Inbox** — The "Updates" / bell icon in the sidebar shows a slide-over panel (right side, 400px wide) with notification items: "Sarah Chen edited Getting Started — 2 hours ago", "New comment on Meeting Notes — 1 day ago", etc. Show 5-8 mock notifications. Each has: user avatar, description text, relative timestamp, and a blue unread dot. Clicking a notification navigates to the referenced page. Unread count badge on the bell icon in sidebar.

---

## Data Seed Updates (implement in createDefaultData())

<!-- Dev must update initialData.js to include these data structures. -->

- [x] **Add `trash` array** — Initialize as empty: `trash: []`. Add to state shape and normalization.

- [x] **Add `views` to Product Roadmap database** — Replace single `viewType` with `views` array containing 2 default views: `{ id: "view-board", name: "Board View", type: "board", groupBy: "prop-status", filters: [], sorts: [], visibleProperties: ["prop-status", "prop-assignee", "prop-date", "prop-priority"] }` and `{ id: "view-table", name: "Table View", type: "table", filters: [], sorts: [], visibleProperties: ["prop-status", "prop-assignee", "prop-date", "prop-priority"] }`. Keep `viewType` as a convenience for the default active view.

- [x] **Add Priority property to Product Roadmap** — Add a 4th property: `{ id: "prop-priority", name: "Priority", type: "select", options: ["Low", "Medium", "High"] }`. Set values on existing items per `data_model.md §Database Items`.

- [x] **Add a second database: "Reading Tracker"** — New database page at root level, icon 📚, with properties: Title (text), Author (text), Status (select: "Want to Read", "Reading", "Finished"), Rating (select: "⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"), Genre (multi-select: "Fiction", "Non-Fiction", "Sci-Fi", "Biography", "Self-Help"), Date Finished (date). Add 4-6 book items with varied statuses. Default views: Table View and Gallery View. This provides a second database for agents to practice filter/sort/view switching.

- [x] **Enrich block content** — Current pages have minimal block content. Add richer blocks to pages: code blocks with actual code snippets (language: javascript), toggle blocks with nested content, table blocks with 3×3 data, callout blocks with different icons and background colors, images with captions. This gives agents more block types to interact with.

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as "Sarah Chen")
- Real-time collaboration / multiplayer
- Xotion AI features
- File uploads (use URL references only)
- Import/export functionality
- Third-party integrations
- OAuth / SSO / account management
- Email/SMS notifications
- Mobile responsive design
- Database: Relations and Rollups (cross-database linking)
- Database: Formula properties (computation engine)
- Database: Timeline view (complex horizontal scroll implementation)
- Database: Chart view
- Synced blocks
