# Xirtable Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-02
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render properly. Existing code already has a scaffold — these items fix critical gaps and align with the real Xirtable UI.

- [x] **Visual design system overhaul**: The current mock uses orange `#FFB400` as primary color — real Xirtable uses blue `#2D7FF9`. Update `tailwind.config.js` colors: `primary: '#2D7FF9'`, `primary-hover: '#2065D1'`, `cell-border: '#E2E2E2'`, `surface-hover: '#F5F5F5'`, `header-bg: '#176BDE'` (darker blue for header). Also add the real Xirtable select option color palette: light-blue (`bg: #D0F0FD, text: #18618A`), cyan (`bg: #C2F5E9, text: #20715A`), green (`bg: #D1F7C4, text: #2D7514`), yellow (`bg: #FFEAB6, text: #8D6302`), orange (`bg: #FEE2D5, text: #B3540E`), red/pink (`bg: #FFDCE5, text: #B31846`), purple (`bg: #EDE2FE, text: #6B1CB0`), gray (`bg: #EEEEEE, text: #444444`). Add CSS custom properties or tailwind `extend.colors` entries so select pills use these exact colors instead of generic Tailwind classes.

- [x] **Remove dark sidebar, adopt Xirtable base-view layout**: The current mock has a persistent dark sidebar (`Sidebar.jsx`, width 260px, bg `#333`). Real Xirtable's base editing view has **NO** persistent left sidebar — instead, the full-width layout is: colored header bar → table tabs bar → view toolbar → main content → footer. Remove or hide the `Sidebar.jsx` component entirely from the main layout. The sidebar concept should be replaced by a **togglable View Sidebar panel** (see P1). The base is already selected (pre-loaded).

- [x] **Header bar redesign**: Replace the current `Toolbar.jsx` header section. The new header bar should be: height 56px, full-width, background `bg-teal-600` (customizable per base via `base.color`). Left side: small Xirtable-style logo icon (use a simple colored diamond/cube SVG or emoji), base name in bold white text with a small chevron dropdown icon. Center: three pill-shaped toggle buttons — "Data" (active, slightly brighter bg), "Automations", "Interfaces" — these are display-only, clicking "Data" keeps current view, others do nothing. Right side: clock/history icon button, "Help" text button, notification bell icon, "Share" button (white bg with teal text, rounded-full, bold), user avatar circle (purple bg, white initials "JD"). See `assets/screenshots/kanban/000002.jpg` and `grid/000004.jpg` for pixel reference.

- [x] **Table tabs bar redesign**: Directly below the header, same colored background (e.g., `bg-teal-600`). Show a tab for each table name in `base.tables`. Active table tab: white background `bg-white`, dark text `text-gray-800`, `rounded-t-lg`, slight shadow. Inactive tabs: transparent background, white text `text-white/80`, hover lightens. Each tab has a small chevron dropdown (for rename/delete, P2). Right end: "+" icon button to add new table (uses `window.prompt()` for name, dispatches `CREATE_TABLE`). Each tab also shows a small down-arrow icon next to the name. See the table tabs in `kanban/000002.jpg` ("Features" is active white tab, "+ Add or import" next to it).

- [x] **View toolbar bar redesign**: Height ~44px, white background, border-bottom. Must match real Xirtable toolbar layout. Left section: hamburger "≡ Views" toggle button (toggles view sidebar), then the active view icon + name in bold (e.g., "☷ All Tasks" with grid icon), then "..." more-options button. Center section: toolbar buttons in order — "⊞ Hide fields", "⊳ Filter", "⊞ Group", "↕ Sort", "● Color", "↔ Row height" (toggles row height). When filters/sorts/groups are active, show the count on the button (e.g., "Filtered" with blue text, "Sorted by 1 field" with blue text). Right section: search icon that expands to search input on click, "Extensions" text link (non-functional), "Record templates" text link (non-functional). See `kanban/000002.jpg` for reference.

- [x] **Enhanced seed data**: Replace `createInitialState()` in `store/initialData.js` with richer data. See `assets/data_model.md` §Seed Data for full spec. Must have: 3 tables ("Tasks" with 8-10 records, "Team" with 5 records, "Milestones" with 4 records), each table with 4-5 views (Grid, Kanban, Gallery, Form, Calendar), realistic field values covering all statuses, assignees from a `collaborators` array, date ranges (some past, some future), dollar amounts. Add `currentUser` and `collaborators` arrays to state. Replace the current `MOCK_USERS` constant in `Cell.jsx` with a reference to `state.collaborators`. Update select option colors to use the Xirtable color palette from the design system overhaul above.

- [x] **Add `ui` state slice**: Add a `ui` object to state with: `viewSidebarOpen: false`, `expandedRecordId: null`, `searchQuery: ''`. Add reducer actions: `TOGGLE_VIEW_SIDEBAR`, `SET_EXPANDED_RECORD`, `SET_SEARCH_QUERY`. These will be consumed by P1 features.

- [x] **Add field type icons to column headers**: In `GridView.jsx`, each column header (`<th>`) should show an icon corresponding to the field type before the field name. Map each field type to a lucide icon: `text` → `Type`, `long_text` → `AlignLeft`, `number` → `Hash`, `currency` → `DollarSign`, `percent` → `Percent`, `single_select` → `ChevronDown` in a circle, `multiple_select` → `List`, `checkbox` → `CheckSquare`, `date` → `Calendar`, `email` → `Mail`, `url` → `ExternalLink`, `phone` → `Phone`, `rating` → `Star`, `attachment` → `Paperclip`, `user` → `User`, `linked_record` → `Link2`, `formula` → `FunctionSquare`. Icon should be 14px, text-gray-400, left of the field name. Also add a small dropdown chevron on the right side of each header (clicking opens P2 field config menu).

- [x] **Add "+" button at right edge of columns**: After the last column header in GridView, show a "+" button (`<th>` with `Plus` icon, width 44px). Clicking it opens a simple dropdown/modal where user enters field name and selects field type from a dropdown list of all types. On submit, dispatch `ADD_FIELD` action that adds the new field to the table's `fields` array. Also add an `ADD_FIELD` action to the store reducer if not already present (it is listed in `ACTIONS` but may not be in the reducer `switch`).

---

## P1 — Primary Features

Core interactive workflows for agent training. These are the features a computer-use agent would practice most.

- [x] **Expanded record modal**: When user clicks a row-expand icon (show a small `Expand` icon on the left side of each row on hover, before the row number), open a full-screen modal (`position: fixed, inset: 0, bg-black/50 backdrop`) containing a white panel (max-width 720px, centered, rounded-lg, max-height 90vh, scrollable). The modal shows: top bar with record title (primary field value in large bold text), close "X" button, and "Delete record" trash icon. Below: all fields listed vertically — each field shows: field name label (small, gray, uppercase), then the field value rendered using the same `Cell` component (with `isGrid={false}`). All fields are editable inline. Changes dispatch `UPDATE_CELL` and are reflected immediately. Close modal on "X" click, Escape key, or clicking the backdrop. Store the expanded record ID in `state.ui.expandedRecordId`. The row-expand icon should appear in a narrow column (width ~30px) between the checkbox column and the first field column.

- [x] **Functional filter panel**: When user clicks the "Filter" toolbar button, toggle a dropdown panel (absolute positioned below the button, white bg, shadow-lg, rounded-lg, border, width 480px, z-50). Panel content: "In this view, show records where" heading. For each active filter: a row with [field selector dropdown] [operator dropdown] [value input] [delete "X" button]. Field selector: dropdown listing all fields in the table (show name and type icon). Operator dropdown: depends on field type — text fields get `contains / does_not_contain / is / is_not / is_empty / is_not_empty`, number/currency/percent get `= / != / > / < / >= / <=`, select fields get `is / is_not / is_empty / is_not_empty`, checkbox gets `is / is_not`, date gets `is / is_before / is_after / is_empty`. Value input: text input for most types, dropdown of options for select fields, date picker for date fields, checkbox toggle for boolean. Below the filter rows: "+ Add condition" button (blue text). At bottom: "Apply" or auto-apply as conditions change. Store filters in the active view's `filters` array. In GridView, apply filters: `table.records.filter(record => allFiltersPass(record, activeView.filters, table.fields))`. When filter is active, show "Filtered" with blue text on the toolbar button.

- [x] **Functional sort panel**: When user clicks the "Sort" toolbar button, toggle a dropdown panel (similar style to filter panel, width 400px). Panel content: "Sort by" heading. For each active sort: a row with [field selector dropdown] [direction toggle: "A→Z" / "Z→A" or "1→9" / "9→1" for numbers, "First→Last" / "Last→First" for dates] [delete "X" button]. Below: "+ Add another sort" button. Store sorts in the active view's `sorts` array. In GridView, apply sorts: `[...filteredRecords].sort((a, b) => multiFieldSort(a, b, activeView.sorts, table.fields))`. Sort function should handle text (localeCompare), number (numeric), date (date comparison), select (by option order), checkbox (false before true). When sort is active, show "Sorted by N field(s)" with blue text on the toolbar button.

- [x] **Functional group-by panel**: When user clicks the "Group" toolbar button, toggle a dropdown panel (width 320px). Panel content: "Group by" heading. A single field selector dropdown (listing fields, with icons). Option for group order (ascending/descending). Store in the active view's `groupBy` array (usually just one field). In GridView, render grouped: compute groups (unique values of the group field), then for each group, render a collapsible section header showing the group value (as a colored pill for select fields, or plain text), record count, and a collapse/expand chevron. Records under each group are the filtered+sorted subset matching that group value. An "Uncategorized" group holds records with no value for the group field. Each group header row spans all columns, has gray background, is sticky within its scroll context. When grouping is active, show "Grouped by 1 field" with blue text on the toolbar button. See `grid/000004.jpg` for the exact visual layout of grouped records.

- [x] **Hide fields panel**: When user clicks "Hide fields" toolbar button, toggle a dropdown panel (width 300px). Panel content: list of all fields, each with: field type icon, field name, and a toggle switch (green when visible, gray when hidden). Primary field always shown, cannot be hidden (toggle disabled). Toggle switches add/remove field IDs from the active view's `hiddenFieldIds` array. In GridView, filter `table.fields` to exclude `hiddenFieldIds` before rendering columns. "Show all" / "Hide all" links at the top. When fields are hidden, show "N hidden fields" with blue text on the toolbar button.

- [x] **Search / Find in view**: In the toolbar, the search icon on the right should expand to a text input when clicked (width transitions from icon-only to ~200px input). As user types, set `state.ui.searchQuery`. In GridView, highlight matching cells: for each visible cell, if `String(value).toLowerCase().includes(query.toLowerCase())`, add a yellow background highlight (`bg-yellow-100`). Optionally filter records to only show matches. Show match count next to the search input (e.g., "3 of 8 records"). Clear search on "X" button or Escape.

- [x] **View sidebar panel**: When user clicks the "≡ Views" button in the toolbar, slide in a panel from the left side (width 260px, white background, border-right, z-30) that pushes the main content area. The panel shows: "Find a view" search input at top, then a list of all views for the current table. Each view shows: type icon (grid=table icon, kanban=columns icon, gallery=grid-of-4 icon, form=clipboard icon, calendar=calendar icon), view name, and a checkmark if it's the active view. Active view is highlighted with blue text. Clicking a view dispatches `SET_ACTIVE_VIEW`. Below the list: a "Create..." section header, then options to create each view type (Grid, Form, Calendar, Gallery, Kanban) — each with the type icon, name, and a "+" button. Clicking "+" creates a new view of that type (use `window.prompt()` for name, generate a view ID, push to `table.views`, set as active). A settings gear icon in the top-right of the panel. Close on clicking outside or clicking the "≡ Views" button again. Store `state.ui.viewSidebarOpen`.

- [x] **Row selection with checkboxes**: The leftmost column in GridView is a checkbox column (width 44px). Header has a checkbox that selects/deselects all visible records. Each row has a checkbox. Selected record IDs are stored in component state (`useState` — not global state). When records are selected, show a blue floating action bar at the bottom of the grid: "N records selected" text, "Delete selected" button (red), "Clear selection" button. Selecting a row also visually highlights the entire row with a light blue background (`bg-blue-50`). Clicking the row number also selects the row.

- [x] **Kanban drag and drop**: In `KanbanView.jsx`, when user clicks and drags a card from one column to another, update the record's group field value to match the destination column's option name. Implementation: use `onDragStart`, `onDragOver`, `onDrop` native HTML drag events on the card elements and column containers. On `onDragStart`, store the record ID and source column. On `onDragOver` of a column, add a visual drop indicator (blue dashed border). On `onDrop`, dispatch `UPDATE_CELL` with `{tableId, recordId, fieldId: groupFieldId, value: targetColumnName}`. Also: when clicking "New" button in a kanban column, the new record should have the group field pre-set to that column's value (currently it adds a blank record). Fix by dispatching both `ADD_RECORD` and then `UPDATE_CELL` for the new record, or by modifying the `ADD_RECORD` action to accept optional `initialFields`.

- [x] **Multiple select cell editing**: Currently the `MULTIPLE_SELECT` cell type in `Cell.jsx` only displays tags but has no edit UI. When user clicks a multiple_select cell, show a dropdown panel listing all available options with checkboxes. Checked options are currently selected. Toggling an option adds/removes it from the value array. Also include a text input at the top for filtering options. An "Add option" button at the bottom that creates a new option (prompts for name, assigns a random color from the Xirtable palette). The dropdown should close on clicking outside.

- [x] **Form view with actual data writing**: Currently `FormView.jsx` adds a blank record on submit. Fix: the `handleSubmit` function should dispatch `ADD_RECORD` to get a new record ID, then immediately dispatch `UPDATE_CELL` for each field that has a value in `formData`. Alternatively, modify the `ADD_RECORD` reducer action to accept an optional `initialFields` parameter: `{ tableId, initialFields?: { [fieldId]: value } }`. Then FormView dispatches `ADD_RECORD` with the collected `formData` as `initialFields`. After successful submit, show a success message ("Record created!") and reset the form. Also: make the form more visually appealing — add field descriptions, required indicators, and better styling for each field type in form mode.

- [x] **Column resize in GridView**: Allow users to resize columns by dragging the right edge of column headers. Implementation: on each `<th>`, add a resize handle div (width 4px, position absolute right, cursor `col-resize`, full height). On mousedown, track the starting X position and column width. On mousemove, calculate the delta and update the column width. Store widths in the view's `fieldWidths` map. Min width: 100px, max width: 600px. Apply widths via inline `style={{ width: fieldWidths[field.id] || 180 }}` on both `<th>` and corresponding `<td>` elements. Use `min-w-[100px]` as a CSS minimum.

---

## P2 — Secondary Features

Depth and realism. Implement only after all P0 and P1 items are complete.

- [ ] **Calendar view**: New component `CalendarView.jsx`. Renders a month-grid calendar (7 columns for days of week, 5-6 rows for weeks). Each day cell shows records whose date field value falls on that date. Records are shown as small colored pills with the primary field text (truncated). Clicking a record pill opens the expanded record modal. Navigation: left/right arrows to go to previous/next month, "Today" button to jump to current month. Header shows month and year. The view uses `view.dateFieldId` to determine which date field to display — if not set, use the first date field in the table. Records without a date value are shown in a "No date" section below the calendar.

- [ ] **Rename table via tab context menu**: Right-clicking (or clicking the chevron on) a table tab shows a small context menu with options: "Rename table", "Duplicate table", "Delete table". "Rename" shows an inline text input replacing the tab text. "Delete" shows a confirmation dialog. Add a `RENAME_TABLE` and `DELETE_TABLE` reducer action. Deleting the active table switches to the first remaining table. Prevent deleting the last table in a base.

- [ ] **Field configuration dropdown**: Clicking the dropdown chevron on a column header opens a dropdown menu with: "Edit field" (opens a modal to rename the field, change description), "Sort A→Z / Z→A" (applies sort), "Filter by this field" (opens filter panel pre-filled), "Group by this field", "Hide field", a divider, "Delete field" (confirmation required, cannot delete primary field). The "Edit field" modal allows renaming the field and changing its description. For select fields, it shows the current options list with the ability to add/remove/reorder options and change colors.

- [ ] **Rename field via column header**: Double-clicking a column header name makes it editable inline (replace text with an input). On blur or Enter, dispatch a `RENAME_FIELD` action that updates `table.fields[index].name`.

- [ ] **Row height toggle**: The "Row height" button in the toolbar cycles through: "Short" (32px, default — 1 line of text), "Medium" (56px — 2 lines), "Tall" (88px — 3-4 lines), "Extra tall" (120px — many lines). Store in the active view's `rowHeight` field. Apply as `style={{ height: rowHeights[view.rowHeight] }}` on each `<tr>` in the grid. Cells should clip content with `overflow: hidden` for short rows, and show more content in taller rows.

- [ ] **Keyboard navigation in grid**: Arrow keys (↑↓←→) move the selected cell indicator (a blue border highlight around the focused cell). Enter key opens cell for editing. Escape exits editing mode. Tab moves to next cell. Shift+Tab moves to previous cell. Space on a row opens the expanded record modal. Track `focusedCell: { recordId, fieldId }` in component state. Render focused cell with a 2px blue border (`border-2 border-blue-500`).

- [ ] **Copy/paste cells**: When a cell is focused (not editing), Ctrl+C copies the cell value to a component-level clipboard variable. Ctrl+V pastes the clipboard value into the focused cell (dispatch `UPDATE_CELL`). For select fields, only paste if the value matches an existing option.

- [ ] **Undo/redo**: Maintain a history stack of state snapshots. On each state change, push the previous state onto the undo stack. Ctrl+Z pops the undo stack and sets state. Ctrl+Shift+Z pops the redo stack. Limit history to last 50 changes. Show a brief toast notification: "Undo: [action description]".

- [ ] **Color conditional row highlighting**: The "Color" toolbar button opens a panel where user can set rules: "Color records where [field] [operator] [value] → [color]". Colors are row background tints. Store rules in the view configuration. Apply as conditional className on `<tr>` elements in GridView.

- [ ] **Record count footer bar**: At the bottom of GridView, show a fixed footer bar (height 32px, bg-gray-50, border-top). Content: left side shows "N records" text (N = number of visible/filtered records), if filtered also show "(M total)". Right side: aggregate function buttons — when clicked, show a dropdown per column allowing: None, Count, Sum (number fields), Average, Min, Max. Display the computed aggregate value in the footer below each column.

---

## Data Seed (implement in createInitialState())

- [x] **Table "Tasks"**: 8-10 records with fields: Name (text, primary), Status (single_select: "Todo"/"In Progress"/"In Review"/"Done"), Priority (single_select: "Critical"/"High"/"Medium"/"Low"), Assignee (user), Due Date (date), Budget (currency), Tags (multiple_select: "Design"/"Engineering"/"Marketing"/"Research"), Attachments (attachment), Notes (long_text), Approved (checkbox), Rating (rating max 5). Records should cover: all 4 statuses (2-3 each), all 4 priorities, all 5 collaborators as assignees, dates ranging from 2024-01-15 to 2024-06-30, budgets from $500 to $50,000, various tag combinations. Example records: "Website Redesign" (In Progress, High, Alice, $15,000), "Q1 Marketing Campaign" (Todo, Critical, Bob, $25,000), "Mobile App MVP" (In Progress, Critical, Charlie, $45,000), "Database Migration" (Done, Medium, Dave, $8,000), "Brand Guidelines Update" (In Review, Low, Carol, $3,000), "Customer Survey Analysis" (Todo, Medium, John Doe, $1,200), "API Documentation" (Done, High, Alice, $5,000), "Security Audit" (In Review, Critical, Bob, $12,000), "Onboarding Flow Redesign" (In Progress, High, Carol, $18,000).

- [x] **Table "Team"**: 5 records with fields: Name (text, primary), Role (single_select: "Manager"/"Designer"/"Engineer"/"Marketing"), Email (email), Phone (phone), Start Date (date), Active (checkbox). Records for: Alice Chen (Designer), Bob Smith (Engineer), Carol Williams (Marketing), Dave Johnson (Manager), John Doe (Manager).

- [x] **Table "Milestones"**: 4 records with fields: Milestone (text, primary), Phase (single_select: "Planning"/"Execution"/"Review"/"Complete"), Target Date (date), Owner (user), Progress (percent), Notes (long_text). Records: "Project Kickoff" (Complete, 100%), "Design Phase" (Review, 85%), "Development Sprint" (Execution, 45%), "Launch" (Planning, 10%).

- [x] **Collaborators array**: Top-level `state.collaborators` array with 5 users: John Doe (user_1), Alice Chen (user_2), Bob Smith (user_3), Carol Williams (user_4), Dave Johnson (user_5). Each has `{id, name, email, avatar}` where avatar uses `https://ui-avatars.com/api/?name=First+Last&background=HEXCOLOR&color=fff` with different bg colors.

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login (app starts pre-logged-in as John Doe, `currentUser` in state)
- Real file uploads (attachment fields use placeholder image URLs like `https://picsum.photos/300/200?random=N`)
- Real-time collaboration / multi-user presence
- Automations engine (tab exists but is display-only)
- Interface Designer (tab exists but is display-only)
- Extensions panel (link exists but is display-only)
- Import/Export functionality
- Revision history / audit log
- Comments on records
- Record linking between tables (linked_record field can be display-only with mock data)
- API keys or real external integrations
