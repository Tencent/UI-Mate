# Xirtable Mock — Data Model

> This document defines all entity types, their fields, relationships, and the structure for `createInitialState()` in `store/initialData.js`.

---

## Entity: Base

A **Base** is the top-level container — equivalent to a database. A user can have multiple bases.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID, prefixed `base_` |
| `name` | `string` | Display name (e.g., "Project Tracker") |
| `color` | `string` | Header bar color class (e.g., `"bg-blue-600"`, `"bg-teal-600"`, `"bg-purple-600"`) |
| `tables` | `string[]` | Ordered array of table IDs belonging to this base |

---

## Entity: Table

A **Table** belongs to a Base and contains Fields (columns), Records (rows), and Views (saved configurations).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID, prefixed `tbl_` |
| `baseId` | `string` | Reference to parent base |
| `name` | `string` | Display name (e.g., "Tasks", "Team") |
| `fields` | `Field[]` | Ordered array of field definitions |
| `records` | `Record[]` | Array of record objects |
| `views` | `View[]` | Array of view configurations |
| `activeViewId` | `string` | ID of the currently active view |

---

## Entity: Field

A **Field** defines a column — its name, type, and type-specific configuration.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID, prefixed `fld_` |
| `name` | `string` | Column header name |
| `type` | `FieldType` | One of the supported field types (see below) |
| `primary` | `boolean?` | `true` for the primary field (first column, always visible) |
| `options` | `Option[]?` | For `single_select` / `multiple_select`: array of `{id, name, color}` |
| `max` | `number?` | For `rating`: maximum stars (default 5) |
| `description` | `string?` | Optional field description text |
| `required` | `boolean?` | For form views — whether field is required |

### Supported Field Types (FieldType enum)

| Type Key | Display Name | Value Format | Icon |
|----------|-------------|-------------|------|
| `text` | Single line text | `string` | `Type` (lucide) |
| `long_text` | Long text | `string` | `AlignLeft` |
| `number` | Number | `number` | `Hash` |
| `currency` | Currency | `number` (displayed as `$X`) | `DollarSign` |
| `percent` | Percent | `number` (displayed as `X%`) | `Percent` |
| `single_select` | Single select | `string` (option name) | `ChevronDown` (circle) |
| `multiple_select` | Multiple select | `string[]` (option names) | `List` |
| `checkbox` | Checkbox | `boolean` | `CheckSquare` |
| `date` | Date | `string` (ISO date `YYYY-MM-DD`) | `Calendar` |
| `email` | Email | `string` | `Mail` |
| `url` | URL | `string` | `ExternalLink` |
| `phone` | Phone | `string` | `Phone` |
| `rating` | Rating | `number` (1 to max) | `Star` |
| `currency` | Currency | `number` | `DollarSign` |
| `duration` | Duration | `number` (minutes) | `Clock` |
| `attachment` | Attachment | `{url, name}[]` | `Paperclip` |
| `user` | Collaborator | `{id, name, avatar}` | `User` |
| `linked_record` | Linked record | `{id, name}` | `Link` |
| `formula` | Formula | `string` (computed, read-only) | `FunctionSquare` |
| `created_time` | Created time | `string` (ISO datetime, auto-set) | `Clock` |
| `last_modified` | Last modified | `string` (ISO datetime, auto-set) | `Clock` |
| `auto_number` | Auto number | `number` (auto-increment, read-only) | `Hash` |
| `button` | Button | N/A (triggers action) | `Play` |
| `barcode` | Barcode | `string` | `Barcode` |

### Option Object (for single_select / multiple_select)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique option ID |
| `name` | `string` | Display text |
| `color` | `string` | Tailwind color classes (e.g., `"bg-blue-100 text-blue-800"`) |

---

## Entity: Record

A **Record** is a single row of data in a table.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID, prefixed `rec_` |
| `createdTime` | `string` | ISO timestamp when record was created |
| `fields` | `object` | Map of `fieldId → value` (key is the field's `id`, value depends on field type) |

---

## Entity: View

A **View** is a saved configuration for how to display a table's data.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID, prefixed `view_` |
| `name` | `string` | Display name (e.g., "Grid View", "By Status") |
| `type` | `ViewType` | `"grid"` \| `"kanban"` \| `"gallery"` \| `"form"` \| `"calendar"` |
| `groupFieldId` | `string?` | For kanban: which field to group by |
| `dateFieldId` | `string?` | For calendar: which date field to use |
| `filters` | `Filter[]?` | Array of filter conditions |
| `sorts` | `Sort[]?` | Array of sort specifications |
| `groupBy` | `GroupBy[]?` | Array of group-by specifications |
| `hiddenFieldIds` | `string[]?` | Array of field IDs to hide in this view |
| `fieldWidths` | `object?` | Map of `fieldId → number` (pixel width) |
| `rowHeight` | `string?` | `"short"` \| `"medium"` \| `"tall"` \| `"extra-tall"` (default: `"short"`) |

### Filter Object

| Field | Type | Description |
|-------|------|-------------|
| `fieldId` | `string` | Which field to filter on |
| `operator` | `string` | `"contains"`, `"does_not_contain"`, `"is"`, `"is_not"`, `"is_empty"`, `"is_not_empty"`, `"="`, `"!="`, `">"`, `"<"`, `">="`, `"<="` |
| `value` | `any` | The comparison value |

### Sort Object

| Field | Type | Description |
|-------|------|-------------|
| `fieldId` | `string` | Which field to sort by |
| `direction` | `string` | `"asc"` or `"desc"` |

### GroupBy Object

| Field | Type | Description |
|-------|------|-------------|
| `fieldId` | `string` | Which field to group by |
| `order` | `string` | `"asc"` or `"desc"` |

---

## Entity: User (Mock)

The current logged-in user. Pre-defined, not editable.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | `"user_1"` |
| `name` | `string` | `"John Doe"` |
| `email` | `string` | `"john.doe@example.com"` |
| `avatar` | `string` | URL to avatar image |

---

## Relationships

```
User (logged-in)
  └── owns multiple Bases
        └── each Base has multiple Tables (ordered)
              ├── each Table has multiple Fields (ordered columns)
              ├── each Table has multiple Records (rows)
              │     └── Record.fields maps fieldId → value
              └── each Table has multiple Views (saved configs)
                    └── View references Fields by ID for filters/sorts/groups
```

---

## createInitialState() Structure

The function should return the following structure. Field IDs are generated dynamically but referenced consistently within records.

```javascript
{
  // Current user
  currentUser: {
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=8B5CF6&color=fff'
  },

  // All collaborators available in the workspace
  collaborators: [
    { id: 'user_1', name: 'John Doe', avatar: '...' },
    { id: 'user_2', name: 'Alice Chen', avatar: '...' },
    { id: 'user_3', name: 'Bob Smith', avatar: '...' },
    { id: 'user_4', name: 'Carol Williams', avatar: '...' },
    { id: 'user_5', name: 'Dave Johnson', avatar: '...' },
  ],

  // Bases
  bases: {
    [baseId]: {
      id: baseId,
      name: 'Project Tracker',
      color: 'bg-teal-600',  // Header bar color
      tables: [table1Id, table2Id, table3Id]
    }
  },

  // Tables
  tables: {
    [table1Id]: {
      id: table1Id,
      baseId: baseId,
      name: 'Tasks',
      fields: [ /* see §Seed Data below */ ],
      records: [ /* 8-10 realistic records */ ],
      views: [
        { id: view1, name: 'All Tasks', type: 'grid', filters: [], sorts: [], hiddenFieldIds: [] },
        { id: view2, name: 'By Status', type: 'kanban', groupFieldId: statusFieldId },
        { id: view3, name: 'Gallery', type: 'gallery' },
        { id: view4, name: 'Submit Task', type: 'form' },
        { id: view5, name: 'Calendar', type: 'calendar', dateFieldId: dueDateFieldId }
      ],
      activeViewId: view1
    },
    [table2Id]: { /* Team Members table */ },
    [table3Id]: { /* Milestones table */ }
  },

  // Active selections
  activeBaseId: baseId,
  activeTableId: table1Id,

  // UI state
  ui: {
    viewSidebarOpen: false,
    expandedRecordId: null,
    searchQuery: '',
    isSearching: false,
  }
}
```

---

## Seed Data Specification

### Table 1: "Tasks" (8-10 records)

**Fields:**
1. `Name` — text, primary ✓
2. `Status` — single_select: "Todo" (red), "In Progress" (yellow), "In Review" (blue), "Done" (green)
3. `Priority` — single_select: "Critical" (red), "High" (orange), "Medium" (yellow), "Low" (gray)
4. `Assignee` — user (reference to collaborators)
5. `Due Date` — date
6. `Budget` — currency
7. `Tags` — multiple_select: "Design" (purple), "Engineering" (blue), "Marketing" (pink), "Research" (teal)
8. `Attachments` — attachment
9. `Notes` — long_text
10. `Approved` — checkbox
11. `Rating` — rating (max 5)
12. `Email Contact` — email

**Records should cover:**
- Mix of all statuses (2-3 per status)
- Different assignees
- Some with attachments, some without
- Various date ranges (past due, upcoming, no date)
- Budget values from $500 to $50,000
- Some checked, some unchecked for Approved

### Table 2: "Team" (5 records)

**Fields:**
1. `Name` — text, primary ✓
2. `Role` — single_select: "Manager" (purple), "Designer" (pink), "Engineer" (blue), "Marketing" (green)
3. `Email` — email
4. `Phone` — phone
5. `Start Date` — date
6. `Active` — checkbox

### Table 3: "Milestones" (4 records)

**Fields:**
1. `Milestone` — text, primary ✓
2. `Phase` — single_select: "Planning" (blue), "Execution" (yellow), "Review" (purple), "Complete" (green)
3. `Target Date` — date
4. `Owner` — user
5. `Progress` — percent
6. `Notes` — long_text
