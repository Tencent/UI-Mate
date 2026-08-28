# airtable_mock Schema

**Deploy order**: 0 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8000)
**Base URL**: `http://172.17.46.46:8000/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Set Current Only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**Upload**: `POST /upload?sid=<sid>` (multipart/form-data) → `{files: [{url, original_name, stored_name, size, content_type}]}`
**Serve Files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## Overview

Simulates the Xirtable web application -- a spreadsheet-database hybrid with bases, tables, fields, records, and multiple view types (grid, kanban, gallery, form, calendar). Uses React Context + `useReducer` for state management. State key in localStorage: `airtable_mock_v1` (or `airtable_mock_v1_<sid>` with session).

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | `Collaborator` | The logged-in user (defaults to first collaborator, John Doe) |
| `collaborators` | `Collaborator[]` | Array of 5 collaborators available for assignment |
| `bases` | `Record<string, Base>` | Map of base ID to Base object (default: 1 base) |
| `tables` | `Record<string, Table>` | Map of table ID to Table object (default: 3 tables) |
| `activeBaseId` | `string` | Currently selected base ID (e.g. `"base_xxxxxxxxx"`) |
| `activeTableId` | `string` | Currently selected table ID (e.g. `"tbl_xxxxxxxxx"`) |
| `ui` | `UIState` | UI transient state (sidebar, expanded record, search, button log) |

---

### `Collaborator`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique user ID (e.g. `"user_1"` through `"user_5"`) |
| `name` | `string` | Display name |
| `email` | `string` | Email address |
| `avatar` | `string` | URL to avatar image (ui-avatars.com) |

**Default collaborators:**

| id | name | email |
|----|------|-------|
| `user_1` | John Doe | john.doe@example.com |
| `user_2` | Alice Chen | alice.chen@example.com |
| `user_3` | Bob Smith | bob.smith@example.com |
| `user_4` | Carol Williams | carol.williams@example.com |
| `user_5` | Dave Johnson | dave.johnson@example.com |

---

### `Base`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Generated ID with `"base_"` prefix |
| `name` | `string` | Base name (default: `"Project Tracker"`) |
| `color` | `string` | Tailwind CSS class for header color (default: `"bg-teal-600"`) |
| `tables` | `string[]` | Ordered array of table IDs belonging to this base |

---

### `Table`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Generated ID with `"tbl_"` prefix |
| `name` | `string` | Table name (e.g. `"Tasks"`, `"Team"`, `"Milestones"`) |
| `baseId` | `string` | ID of parent base |
| `fields` | `Field[]` | Ordered array of field definitions |
| `records` | `Record_[]` | Array of data records |
| `views` | `View[]` | Array of view definitions |
| `activeViewId` | `string` | Currently active view ID for this table |

---

### `Field`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Generated ID with `"fld_"` prefix |
| `name` | `string` | Field display name |
| `type` | `string` | Field type (see Field Types below) |
| `primary` | `boolean?` | If `true`, this is the primary (first-column) field |
| `options` | `SelectOption[]?` | For `single_select` / `multiple_select` fields |
| `max` | `number?` | For `rating` fields, max stars (default 5) |
| `required` | `boolean?` | If `true`, form view enforces this field is non-empty before submit |
| `description` | `string?` | Optional description shown in form view below the field |
| `linkedTableId` | `string?` | For `linked_record` fields: the ID of the table whose records are shown in the picker |
| `actionLabel` | `string?` | For `button` fields: label on the button (default `"Run"`) |

**Field Types (FIELD_TYPES enum):**

| Constant | Value | Description |
|----------|-------|-------------|
| `TEXT` | `"text"` | Single-line text |
| `LONG_TEXT` | `"long_text"` | Multi-line text |
| `NUMBER` | `"number"` | Numeric value |
| `CURRENCY` | `"currency"` | Currency value (displayed with `$` prefix) |
| `PERCENT` | `"percent"` | Percentage value (displayed with `%` suffix) |
| `SINGLE_SELECT` | `"single_select"` | Single-choice dropdown |
| `MULTIPLE_SELECT` | `"multiple_select"` | Multi-choice tags |
| `ATTACHMENT` | `"attachment"` | File attachments array |
| `CHECKBOX` | `"checkbox"` | Boolean checkbox |
| `DATE` | `"date"` | Date string (YYYY-MM-DD) |
| `PHONE` | `"phone"` | Phone number string |
| `EMAIL` | `"email"` | Email address string |
| `URL` | `"url"` | URL string |
| `RATING` | `"rating"` | Star rating (1 to max) |
| `DURATION` | `"duration"` | Duration in minutes |
| `FORMULA` | `"formula"` | Computed formula (read-only display) |
| `CREATED_TIME` | `"created_time"` | Auto-generated creation timestamp |
| `LAST_MODIFIED` | `"last_modified"` | Auto-generated modification timestamp |
| `BUTTON` | `"button"` | Clickable action button — dispatches `BUTTON_ACTION_TRIGGERED` on click; shows green "Done" flash for 1.5 s; no `alert()` |
| `BARCODE` | `"barcode"` | Barcode string |
| `LINKED_RECORD` | `"linked_record"` | Link to another record — picker shows records from `field.linkedTableId` if set, otherwise shows fallback placeholder records |
| `USER` | `"user"` | Collaborator reference |

---

### `SelectOption`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique option ID (e.g. `"status_todo"`, `"pri_high"`) |
| `name` | `string` | Display name (e.g. `"Todo"`, `"High"`) |
| `color` | `string` | Tailwind CSS class string for pill styling |

---

### `Record_` (table record / row)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Generated ID with `"rec_"` prefix |
| `createdTime` | `string` | ISO 8601 timestamp of creation |
| `fields` | `Record<string, any>` | Map of field ID to cell value |

**Cell value types by field type:**

| Field Type | Cell Value Type | Example |
|------------|----------------|---------|
| `text`, `long_text`, `email`, `phone`, `url`, `barcode` | `string` | `"Website Redesign"` |
| `number`, `currency`, `percent`, `duration`, `rating` | `number` | `15000`, `4` |
| `single_select` | `string` | `"In Progress"` (option name) |
| `multiple_select` | `string[]` | `["Design", "Engineering"]` (option names) |
| `checkbox` | `boolean` | `true` |
| `date` | `string` | `"2024-03-15"` (YYYY-MM-DD) |
| `attachment` | `Attachment[]` | `[{url: "...", name: "mockup.png"}]` |
| `user` | `Collaborator` | `{id, name, email, avatar}` |
| `linked_record` | `{id, name}` | `{id: "rec_xxx", name: "Website Redesign"}` |

---

### `Attachment`

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string` | URL to the attachment file |
| `name` | `string` | Original filename |

---

### `View`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Generated ID with `"view_"` prefix |
| `name` | `string` | View display name |
| `type` | `string` | View type: `"grid"`, `"kanban"`, `"gallery"`, `"form"`, or `"calendar"` |
| `filters` | `Filter[]?` | Array of filter conditions (grid views) |
| `sorts` | `Sort[]?` | Array of sort conditions (grid views) |
| `groupBy` | `GroupBy[]?` | Array of group-by conditions (grid views, max 1) |
| `hiddenFieldIds` | `string[]?` | Array of field IDs hidden in this view |
| `fieldWidths` | `Record<string, number>?` | Map of field ID to column width in pixels |
| `rowHeight` | `string?` | Row height setting: `"short"` (default), `"medium"`, `"tall"`, or `"extra_tall"` |
| `groupFieldId` | `string?` | For kanban views: field ID to group columns by |
| `dateFieldId` | `string?` | For calendar views: field ID for date display |

---

### `Filter`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Generated ID with `"flt_"` prefix |
| `fieldId` | `string` | Field ID to filter on |
| `operator` | `string` | Filter operator (see below) |
| `value` | `any` | Filter value to compare against |

**Filter operators by field type:**

| Field Type | Operators |
|------------|-----------|
| text, long_text, email, url, phone | `contains`, `does_not_contain`, `is`, `is_not`, `is_empty`, `is_not_empty` |
| number, currency, percent, duration, rating | `=`, `!=`, `>`, `<`, `>=`, `<=`, `is_empty`, `is_not_empty` |
| single_select, multiple_select | `is`, `is_not`, `is_empty`, `is_not_empty` |
| checkbox | `is`, `is_not` |
| date, created_time, last_modified | `is`, `is_before`, `is_after`, `is_empty`, `is_not_empty` |

---

### `Sort`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Generated ID with `"srt_"` prefix |
| `fieldId` | `string` | Field ID to sort by |
| `direction` | `string` | `"asc"` or `"desc"` |

---

### `GroupBy`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Generated ID with `"grp_"` prefix |
| `fieldId` | `string` | Field ID to group by |
| `direction` | `string` | `"asc"` or `"desc"` |

---

### `UIState`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `viewSidebarOpen` | `boolean` | `false` | Whether the left view sidebar panel is open |
| `expandedRecordId` | `string \| null` | `null` | ID of the currently expanded record (modal), or null |
| `searchQuery` | `string` | `""` | Current search/find text |
| `isSearching` | `boolean` | `false` | Whether search is active (derived from searchQuery length) |
| `buttonActionLog` | `ButtonActionEntry[]` | `[]` | Rolling log of the last 20 button field clicks (most recent first) |

### `ButtonActionEntry`

| Field | Type | Description |
|-------|------|-------------|
| `fieldId` | `string` | ID of the button field that was clicked |
| `fieldName` | `string` | Display name of the button field |
| `recordId` | `string \| null` | ID of the record the button belongs to |
| `tableId` | `string \| null` | ID of the table the button belongs to |
| `timestamp` | `string` | ISO 8601 timestamp of the click |

---

## Default Tables Detail

### Table 1: "Tasks" (9 records, 12 fields, 5 views)

**Fields:**

| # | Name | Type | Options / Notes |
|---|------|------|-----------------|
| 1 | Name | `text` | Primary field |
| 2 | Status | `single_select` | Options: `Todo`, `In Progress`, `In Review`, `Done` |
| 3 | Priority | `single_select` | Options: `Critical`, `High`, `Medium`, `Low` |
| 4 | Assignee | `user` | Collaborator reference |
| 5 | Due Date | `date` | YYYY-MM-DD |
| 6 | Budget | `currency` | Numeric, displayed with `$` |
| 7 | Tags | `multiple_select` | Options: `Design`, `Engineering`, `Marketing`, `Research` |
| 8 | Attachments | `attachment` | Array of `{url, name}` |
| 9 | Notes | `long_text` | Multi-line text |
| 10 | Approved | `checkbox` | Boolean |
| 11 | Rating | `rating` | 1-5 stars (max: 5) |
| 12 | Email Contact | `email` | Email string |

**Default Records (9):**

| Name | Status | Priority | Assignee | Budget |
|------|--------|----------|----------|--------|
| Website Redesign | In Progress | High | Alice Chen | 15000 |
| Q1 Marketing Campaign | Todo | Critical | Bob Smith | 25000 |
| Mobile App MVP | In Progress | Critical | Carol Williams | 45000 |
| Database Migration | Done | Medium | Dave Johnson | 8000 |
| Brand Guidelines Update | In Review | Low | Carol Williams | 3000 |
| Customer Survey Analysis | Todo | Medium | John Doe | 1200 |
| API Documentation | Done | High | Alice Chen | 5000 |
| Security Audit | In Review | Critical | Bob Smith | 12000 |
| Onboarding Flow Redesign | In Progress | High | Carol Williams | 18000 |

**Views (5):**

| Name | Type | Notes |
|------|------|-------|
| All Tasks | `grid` | Default view, no filters/sorts |
| By Status | `kanban` | Grouped by Status field |
| Gallery | `gallery` | Card layout with cover images; clicking a card opens the expanded record modal |
| Submit Task | `form` | Form for adding new records; required fields are validated before submit |
| Calendar | `calendar` | Date field: Due Date; click a day to add a record; click a record chip to expand it |

---

### Table 2: "Team" (5 records, 6 fields, 3 views)

**Fields:**

| # | Name | Type | Options / Notes |
|---|------|------|-----------------|
| 1 | Name | `text` | Primary field |
| 2 | Role | `single_select` | Options: `Manager`, `Designer`, `Engineer`, `Marketing` |
| 3 | Email | `email` | Email string |
| 4 | Phone | `phone` | Phone number string |
| 5 | Start Date | `date` | YYYY-MM-DD |
| 6 | Active | `checkbox` | Boolean |

**Default Records (5):**

| Name | Role | Email | Active |
|------|------|-------|--------|
| Alice Chen | Designer | alice.chen@example.com | true |
| Bob Smith | Engineer | bob.smith@example.com | true |
| Carol Williams | Marketing | carol.williams@example.com | true |
| Dave Johnson | Manager | dave.johnson@example.com | true |
| John Doe | Manager | john.doe@example.com | true |

**Views (3):**

| Name | Type | Notes |
|------|------|-------|
| All Members | `grid` | Default view |
| By Role | `kanban` | Grouped by Role field |
| Add Member | `form` | Form for adding team members |

---

### Table 3: "Milestones" (4 records, 6 fields, 3 views)

**Fields:**

| # | Name | Type | Options / Notes |
|---|------|------|-----------------|
| 1 | Milestone | `text` | Primary field |
| 2 | Phase | `single_select` | Options: `Planning`, `Execution`, `Review`, `Complete` |
| 3 | Target Date | `date` | YYYY-MM-DD |
| 4 | Owner | `user` | Collaborator reference |
| 5 | Progress | `percent` | 0-100 |
| 6 | Notes | `long_text` | Multi-line text |

**Default Records (4):**

| Milestone | Phase | Target Date | Owner | Progress |
|-----------|-------|-------------|-------|----------|
| Project Kickoff | Complete | 2024-01-15 | John Doe | 100 |
| Design Phase | Review | 2024-03-01 | Alice Chen | 85 |
| Development Sprint | Execution | 2024-05-15 | Bob Smith | 45 |
| Launch | Planning | 2024-06-30 | Dave Johnson | 10 |

**Views (3):**

| Name | Type | Notes |
|------|------|-------|
| All Milestones | `grid` | Default view |
| By Phase | `kanban` | Grouped by Phase field |
| Timeline | `calendar` | Date field: Target Date |

---

## Reducer Actions

| Action | Payload | Effect |
|--------|---------|--------|
| `SET_STATE` | `state` (full state object) | Replace entire state |
| `UPDATE_CELL` | `{tableId, recordId, fieldId, value}` | Update a single cell value in a record |
| `ADD_RECORD` | `{tableId, initialFields?}` | Append a new record (auto-generates `rec_` ID and `createdTime`) |
| `DELETE_RECORD` | `{tableId, recordId}` | Remove a record from a table |
| `SET_ACTIVE_TABLE` | `tableId` (string) | Switch the active table tab |
| `SET_ACTIVE_VIEW` | `{tableId, viewId}` | Switch the active view for a table |
| `ADD_FIELD` | `{tableId, field: {name, type, options?, max?}}` | Add a new field column to a table |
| `CREATE_TABLE` | `{baseId, name}` | Create a new table with default fields (Name, Notes, Status) and a Grid View |
| `CREATE_VIEW` | `{tableId, view}` | Add a new view object to a table and make it active |
| `TOGGLE_VIEW_SIDEBAR` | (none) | Toggle `ui.viewSidebarOpen` |
| `SET_EXPANDED_RECORD` | `recordId \| null` | Open/close the expanded record modal |
| `SET_SEARCH_QUERY` | `string` | Set search text and update `ui.isSearching` |
| `UPDATE_VIEW` | `{tableId, viewId, updates}` | Merge updates into a view (filters, sorts, groupBy, hiddenFieldIds, fieldWidths) |
| `RENAME_TABLE` | `{tableId, name}` | Rename a table |
| `RENAME_VIEW` | `{tableId, viewId, name}` | Rename a view |
| `DELETE_VIEW` | `{tableId, viewId}` | Delete a view (no-op if it's the last view); updates `activeViewId` if needed |
| `DELETE_TABLE` | `{tableId}` | Delete a table and remove it from its base (no-op if it's the last table); updates `activeTableId` if needed |
| `ADD_BASE` | `{name, color?}` | Create a new base with a default "Table 1" (Grid View); switches `activeBaseId` and `activeTableId` |
| `SET_ACTIVE_BASE` | `baseId` (string) | Switch `activeBaseId` and set `activeTableId` to the base's first table |
| `SET_ROW_HEIGHT` | `{tableId, viewId, rowHeight}` | Set `rowHeight` on a view (`"short"`, `"medium"`, `"tall"`, `"extra_tall"`) |
| `BUTTON_ACTION_TRIGGERED` | `{fieldId, fieldName, recordId, tableId}` | Prepends a `ButtonActionEntry` to `ui.buttonActionLog` (capped at 20 entries); no browser `alert()` is shown |

---

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user_1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe&background=8B5CF6&color=fff"
    },
    "collaborators": [
      {"id": "user_1", "name": "John Doe", "email": "john.doe@example.com", "avatar": "https://ui-avatars.com/api/?name=John+Doe&background=8B5CF6&color=fff"},
      {"id": "user_2", "name": "Alice Chen", "email": "alice.chen@example.com", "avatar": "https://ui-avatars.com/api/?name=Alice+Chen&background=EC4899&color=fff"}
    ],
    "bases": {
      "base_001": {
        "id": "base_001",
        "name": "My Project",
        "color": "bg-teal-600",
        "tables": ["tbl_001"]
      }
    },
    "tables": {
      "tbl_001": {
        "id": "tbl_001",
        "name": "Tasks",
        "baseId": "base_001",
        "fields": [
          {"id": "fld_name", "name": "Name", "type": "text", "primary": true, "required": true},
          {"id": "fld_status", "name": "Status", "type": "single_select", "options": [
            {"id": "s1", "name": "Todo", "color": "bg-[#FFDCE5] text-[#B31846]"},
            {"id": "s2", "name": "In Progress", "color": "bg-[#FFEAB6] text-[#8D6302]"},
            {"id": "s3", "name": "Done", "color": "bg-[#D1F7C4] text-[#2D7514]"}
          ]},
          {"id": "fld_assignee", "name": "Assignee", "type": "user"},
          {"id": "fld_date", "name": "Due Date", "type": "date"},
          {"id": "fld_linked", "name": "Related Project", "type": "linked_record", "linkedTableId": "tbl_001"}
        ],
        "records": [
          {
            "id": "rec_001",
            "createdTime": "2024-01-15T09:00:00.000Z",
            "fields": {
              "fld_name": "Build landing page",
              "fld_status": "In Progress",
              "fld_assignee": {"id": "user_2", "name": "Alice Chen", "email": "alice.chen@example.com", "avatar": "https://ui-avatars.com/api/?name=Alice+Chen&background=EC4899&color=fff"},
              "fld_date": "2024-04-01"
            }
          }
        ],
        "views": [
          {"id": "view_001", "name": "Grid View", "type": "grid", "filters": [], "sorts": [], "groupBy": [], "hiddenFieldIds": [], "fieldWidths": {}, "rowHeight": "short"},
          {"id": "view_002", "name": "Calendar", "type": "calendar", "dateFieldId": "fld_date"}
        ],
        "activeViewId": "view_001"
      }
    },
    "activeBaseId": "base_001",
    "activeTableId": "tbl_001",
    "ui": {
      "viewSidebarOpen": false,
      "expandedRecordId": null,
      "searchQuery": "",
      "isSearching": false,
      "buttonActionLog": []
    }
  }
}
```

---

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Edit a cell value (text, number, date, etc.) | `tables.<tableId>.records[i].fields.<fieldId>` |
| Toggle a checkbox | `tables.<tableId>.records[i].fields.<fieldId>` (boolean flip) |
| Click a star rating | `tables.<tableId>.records[i].fields.<fieldId>` (number 1-5) |
| Select single-select option | `tables.<tableId>.records[i].fields.<fieldId>` (string) |
| Toggle multiple-select tags | `tables.<tableId>.records[i].fields.<fieldId>` (string[]) |
| Assign a user/collaborator | `tables.<tableId>.records[i].fields.<fieldId>` (Collaborator object) |
| Select linked record | `tables.<tableId>.records[i].fields.<fieldId>` (`{id, name}` object) |
| Click a button field | `ui.buttonActionLog` (new entry prepended with fieldId, fieldName, recordId, tableId, timestamp) |
| Add a new record (grid, kanban, gallery, calendar, form) | `tables.<tableId>.records` (new entry appended) |
| Delete a record (confirmed in inline dialog) | `tables.<tableId>.records` (entry removed) |
| Bulk delete selected records (confirmed in inline dialog) | `tables.<tableId>.records` (multiple entries removed) |
| Submit a form view | `tables.<tableId>.records` (new entry appended with form data) |
| Expand a gallery card | `ui.expandedRecordId` |
| Click calendar day to add record | `tables.<tableId>.records` (new entry with date pre-filled) |
| Click calendar record chip | `ui.expandedRecordId` |
| Switch active table tab | `activeTableId` |
| Switch active view | `tables.<tableId>.activeViewId` |
| Toggle view sidebar | `ui.viewSidebarOpen` |
| Expand a record (open modal) | `ui.expandedRecordId` |
| Close expanded record | `ui.expandedRecordId` → `null` |
| Type in search box | `ui.searchQuery`, `ui.isSearching` |
| Clear search | `ui.searchQuery` → `""`, `ui.isSearching` → `false` |
| Add a filter condition | `tables.<tableId>.views[i].filters` (new Filter appended) |
| Remove a filter condition | `tables.<tableId>.views[i].filters` (entry removed) |
| Update filter field/operator/value | `tables.<tableId>.views[i].filters[j]` |
| Add a sort condition | `tables.<tableId>.views[i].sorts` (new Sort appended) |
| Remove a sort condition | `tables.<tableId>.views[i].sorts` (entry removed) |
| Update sort field/direction | `tables.<tableId>.views[i].sorts[j]` |
| Add grouping | `tables.<tableId>.views[i].groupBy` (new GroupBy appended) |
| Remove grouping | `tables.<tableId>.views[i].groupBy` (entry removed) |
| Hide/show fields | `tables.<tableId>.views[i].hiddenFieldIds` |
| Show all / hide all fields | `tables.<tableId>.views[i].hiddenFieldIds` (cleared or set to all non-primary) |
| Resize a column | `tables.<tableId>.views[i].fieldWidths.<fieldId>` |
| Change row height | `tables.<tableId>.views[i].rowHeight` |
| Create a new table | `bases.<baseId>.tables` (new ID appended), `tables` (new table added), `activeTableId` |
| Rename a table | `tables.<tableId>.name` |
| Delete a table | `bases.<baseId>.tables` (ID removed), `tables` (entry removed), `activeTableId` (updated if active) |
| Add a new field/column | `tables.<tableId>.fields` (new Field appended) |
| Create a new view | `tables.<tableId>.views` (new View appended), `tables.<tableId>.activeViewId` |
| Rename a view | `tables.<tableId>.views[i].name` |
| Delete a view | `tables.<tableId>.views` (entry removed), `tables.<tableId>.activeViewId` (updated if active) |
| Add a new base | `bases` (new Base added), `tables` (new default table added), `activeBaseId`, `activeTableId` |
| Switch active base | `activeBaseId`, `activeTableId` |
| Drag kanban card to different column | `tables.<tableId>.records[i].fields.<groupFieldId>` (value changes to target column name) |

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `MainLayout` | Main application (Sidebar + Toolbar + ViewSidebar + active view + ExpandedRecord modal) |
| `/go` | `GoDebug` | State inspection endpoint (JSON viewer: `{initial_state, current_state, state_diff}`) |

---

## Layout Structure

The main layout renders these components in order (left to right, top to bottom):

```
<Sidebar>          — dark left rail (240px wide); lists all bases; "Add a base" button;
                     Settings and Help modals; clicking a base dispatches SET_ACTIVE_BASE
<Toolbar>          — top bar with:
                     • Colored header: base name, Data/Automations/Interfaces tabs,
                       History panel, Help dropdown, Notifications panel, Share modal,
                       User menu
                     • Table tabs: one per table in active base; ChevronDown opens
                       TableContextMenu (Rename/Duplicate/Delete)
                     • View toolbar: Views toggle, active view name (opens ViewOptionsMenu),
                       Filter/Sort/Group/Hide/Color/Row-height panels,
                       Search, Extensions, Templates
<ViewSidebar>      — collapsible left panel; lists views by type; inline NewViewForm
                     (no window.prompt) creates new views; Close button
<ActiveView>       — one of: GridView | KanbanView | GalleryView | FormView | CalendarView
<ExpandedRecord>   — full-screen modal for editing a single record; inline delete confirmation
                     (no confirm()); Escape key or backdrop click to close
```

## Notes

- All IDs are randomly generated at initialization time using `Math.random().toString(36)` with a prefix (e.g. `base_`, `tbl_`, `fld_`, `rec_`, `view_`). They change on every fresh initialization.
- When injecting state, use fixed IDs for predictability.
- The `/go` endpoint deep-diffs `initial_state` vs `current_state` recursively (arrays, objects, and primitives all compared).
- All browser dialog calls (`alert`, `confirm`, `prompt`) have been replaced with inline React UI components (banners, modals, inline forms).
- `CalendarView` is fully implemented: month navigation, record chips on correct days, click day to add record, click record chip to expand.
- Gallery cards are clickable and open the expanded record modal via `SET_EXPANDED_RECORD`.
- Form view validates required fields client-side before dispatching `ADD_RECORD`; red border + inline error message shown for missing required fields; errors clear as the user types.
- `BUTTON` field cells dispatch `BUTTON_ACTION_TRIGGERED` on click (observable in `/go` state diff via `ui.buttonActionLog`); button turns green with "Done" label for 1.5 s as visual confirmation.
- `LINKED_RECORD` field picker dynamically loads records from the table specified by `field.linkedTableId`; falls back to placeholder records if `linkedTableId` is unset.
- `SET_ROW_HEIGHT` supports four values: `"short"`, `"medium"`, `"tall"`, `"extra_tall"`.
- Kanban view supports drag-and-drop between columns, updating the `groupFieldId` value on the record.
- State auto-saves to localStorage on every state change via a `useEffect` in the `StoreProvider`.
