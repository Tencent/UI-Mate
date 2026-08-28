# Xotion Mock — Data Model

> For use with `src/store/initialData.js` → `createDefaultData()`
> Dev agent: reference this document for all entity definitions

---

## Entity: User

The pre-logged-in user. No authentication flow.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"user-1"` | Stable ID |
| name | string | `"Sarah Chen"` | Display name |
| email | string | `"sarah.chen@company.com"` | |
| avatar | string | `"https://picsum.photos/100/100?random=user0"` | Avatar URL |

---

## Entity: Workspace

Single workspace the user belongs to.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"ws-1"` | |
| name | string | `"Sarah's Workspace"` | Shown in sidebar header |
| icon | string | `"🚀"` | Emoji or letter initial |
| members | string[] | `["user-1"]` | Array of user IDs |

---

## Entity: Page

Every page, database, and database item is a Page object. Differentiated by `type` field.

### Regular Page

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"page-abc123"` | UUID |
| title | string | `"Getting Started"` | |
| icon | string\|null | `"👋"` | Emoji icon |
| cover | string\|null | `"https://..."` | Cover image URL |
| parentId | string\|null | `null` | Parent page ID, null = root |
| blockIds | string[] | `["block-1", "block-2"]` | Ordered block references |
| favorite | boolean | `true` | In favorites section |
| createdDate | string | ISO 8601 | |
| lastEditedDate | string\|undefined | ISO 8601 | |
| properties | object | `{}` | Empty for regular pages |

### Database Page (type: "database")

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"db-roadmap"` | |
| title | string | `"Product Roadmap"` | |
| icon | string | `"🗺️"` | |
| type | `"database"` | `"database"` | Distinguishes from regular pages |
| parentId | string\|null | `null` | |
| cover | string\|null | `null` | |
| viewType | string | `"board"` | Default view: `"table" \| "board" \| "list" \| "gallery" \| "calendar"` |
| views | View[] | (see View entity below) | **NEW** — array of named view configurations |
| properties | Property[] | (see Property entity) | Database schema (columns) |
| items | string[] | `["item-1", "item-2"]` | Ordered array of database item page IDs |
| blockIds | string[] | `[]` | Blocks above the database view |
| favorite | boolean | `false` | |
| createdDate | string | ISO 8601 | |

### Database Item (child page of a database)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"item-abc"` | |
| title | string | `"Launch MVP"` | The "Name" property |
| icon | string\|null | `"🚀"` | |
| parentId | string | `"db-roadmap"` | Points to parent database |
| blockIds | string[] | `[]` | Content blocks inside item |
| properties | object | `{ "prop-status": "In Progress" }` | Key = property ID, value varies by type |
| createdDate | string | ISO 8601 | |
| lastEditedDate | string\|undefined | ISO 8601 | |

---

## Entity: Block

The fundamental content unit.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"block-xyz"` | UUID |
| type | string | `"text"` | See block types below |
| content | string | `"Hello world"` | Text content |
| properties | object | `{}` | Type-specific properties |
| createdDate | string | ISO 8601 | |
| lastEditedDate | string\|undefined | ISO 8601 | |

### Block Types and Their Properties

| type | content | properties | Notes |
|------|---------|------------|-------|
| `"text"` | paragraph text | `{ color?, bgColor? }` | Default block |
| `"heading-1"` | heading text | `{ color?, collapsed? }` | Large heading |
| `"heading-2"` | heading text | `{ color?, collapsed? }` | Medium heading |
| `"heading-3"` | heading text | `{ color?, collapsed? }` | Small heading |
| `"todo"` | task text | `{ checked: boolean }` | Checkbox |
| `"bullet-list"` | item text | `{ color? }` | Unordered list |
| `"numbered-list"` | item text | `{ color? }` | Ordered list |
| `"toggle"` | toggle text | `{ collapsed: boolean }` | Collapsible section |
| `"quote"` | quote text | `{ color? }` | Block quote |
| `"callout"` | callout text | `{ icon?: string, color?, bgColor? }` | Callout box |
| `"divider"` | `""` | `{}` | Horizontal rule |
| `"code"` | code text | `{ language: string }` | Syntax-highlighted |
| `"image"` | `""` | `{ url: string, caption?: string }` | Image block |
| `"table"` | `""` | `{ rows: string[][], hasHeader: boolean }` | Simple table |
| `"table-of-contents"` | `""` | `{}` | Auto-generated ToC |

### Block Color Values (for color / bgColor properties)

**Text colors**: `"default"`, `"gray"`, `"brown"`, `"orange"`, `"yellow"`, `"green"`, `"blue"`, `"purple"`, `"pink"`, `"red"`

**Background colors**: `"default_background"`, `"gray_background"`, `"brown_background"`, `"orange_background"`, `"yellow_background"`, `"green_background"`, `"blue_background"`, `"purple_background"`, `"pink_background"`, `"red_background"`

---

## Entity: View (NEW — for database multi-view support)

Each database can have multiple named views with independent layout, filter, and sort settings.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"view-1"` | UUID |
| name | string | `"Board View"` | Tab label |
| type | string | `"board"` | `"table" \| "board" \| "list" \| "gallery" \| "calendar"` |
| filters | Filter[] | `[]` | Active filter conditions |
| sorts | Sort[] | `[]` | Active sort rules |
| groupBy | string\|null | `"prop-status"` | Property ID to group by (board/table) |
| visibleProperties | string[] | `["prop-status", "prop-date"]` | Which property IDs are shown |

### Filter Object

| Field | Type | Example |
|-------|------|---------|
| id | string | `"filter-1"` |
| propertyId | string | `"prop-status"` |
| operator | string | `"is" \| "is_not" \| "contains" \| "does_not_contain" \| "is_empty" \| "is_not_empty"` |
| value | any | `"In Progress"` |

### Sort Object

| Field | Type | Example |
|-------|------|---------|
| id | string | `"sort-1"` |
| propertyId | string | `"prop-date"` |
| direction | string | `"ascending" \| "descending"` |

---

## Entity: Property (Database Column Definition)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"prop-status"` | Stable ID referenced by items |
| name | string | `"Status"` | Column header label |
| type | string | `"select"` | See types below |
| options | string[] | `["Not Started", "In Progress", "Done"]` | Only for select/multi-select |

### Property Types to Support

| type | Item value type | UI | Notes |
|------|----------------|-----|-------|
| `"text"` | string | Editable text input | |
| `"number"` | number\|string | Editable number input | |
| `"select"` | string | Dropdown with colored tags | `options` array required |
| `"multi-select"` | string[] | Multi-tag dropdown | `options` array required |
| `"status"` | string | Dropdown with 3 groups (todo/in-progress/done) | Special select |
| `"date"` | string | Date picker | ISO date string |
| `"person"` | string[] | User avatar pills | Array of user IDs |
| `"checkbox"` | boolean | Checkbox | true/false |
| `"url"` | string | Clickable link | Opens in new tab |
| `"email"` | string | Clickable mailto | |
| `"phone"` | string | Clickable tel | |
| `"created_time"` | string | Read-only timestamp | Auto from createdDate |
| `"last_edited_time"` | string | Read-only timestamp | Auto from lastEditedDate |

---

## Entity: Trash Item (NEW)

Soft-deleted pages stored in a trash collection.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | page ID | Same as original page |
| page | Page | full page object | Snapshot at deletion time |
| deletedDate | string | ISO 8601 | When it was trashed |
| parentId | string\|null | original parentId | For restoring to correct location |

---

## Recommended State Shape

```javascript
{
  user: { id, name, email, avatar },
  workspace: { id, name, icon, members },
  pages: {
    [pageId]: { /* Page entity */ }
  },
  blocks: {
    [blockId]: { /* Block entity */ }
  },
  trash: [
    { id, page, deletedDate, parentId }
  ],
  focusBlockId: null
}
```

---

## Seed Data Specification for createDefaultData()

### Users
- 1 user: Sarah Chen (user-1)

### Workspace
- "Sarah's Workspace" with rocket emoji

### Pages (11 pages + 1 database + 5 database items = 17 total entries)

| Page | Icon | Parent | Favorite | Blocks |
|------|------|--------|----------|--------|
| Getting Started | 👋 | root | yes | 10 blocks: welcome heading, intro text, tip callout, features heading, 3 todos, divider, quote, image |
| Team Wiki | 📚 | root | no | 6 blocks: heading, description, quick links heading, 3 bullet items |
| Meeting Notes | 📅 | Team Wiki | no | 9 blocks: heading, attendees heading, attendee text, agenda heading, 2 bullets, action items heading, 2 todos |
| Design System | 🎨 | Team Wiki | no | 8 blocks: heading, description, colors heading, color text x2, typography heading, type text x2 |
| Onboarding Guide | 🧭 | Team Wiki | no | 6 blocks: heading, intro, steps heading, 3 numbered list items |
| Personal Home | 🏠 | root | yes | 6 blocks: heading, focus callout, habits heading, 3 todos |
| Reading List | 📖 | Personal Home | no | 4 blocks: heading, 3 bullet items with book titles |
| Recipes | 🍳 | Personal Home | no | 4 blocks: heading, 3 bullet items |
| Travel Plans | ✈️ | Personal Home | no | 4 blocks: heading, 3 bullet items with destinations |
| Project Specs | 📑 | root | no | 5 blocks: heading, overview, requirements heading, 2 bullets |

### Database: Product Roadmap

| Field | Value |
|-------|-------|
| Title | Product Roadmap |
| Icon | 🗺️ |
| Type | database |
| Default View | board |
| Views | [{ name: "Board View", type: "board", groupBy: "prop-status" }, { name: "Table View", type: "table" }] |

**Properties (columns):**
1. Status (select): Not Started, In Progress, Done
2. Assignee (person)
3. Due Date (date)
4. Priority (select): Low, Medium, High — **NEW**

**Items (5):**
1. "Q1 Planning" — Status: Done, Assignee: [user-1], Date: 2024-10-15, Priority: High
2. "Launch MVP" — Status: In Progress, Assignee: [user-1], Date: 2024-11-01, Priority: High
3. "User Testing" — Status: Not Started, Assignee: [], Date: 2024-12-01, Priority: Medium
4. "Marketing Campaign" — Status: In Progress, Assignee: [user-1], Date: 2024-11-15, Priority: Medium
5. "Analytics Setup" — Status: Not Started, Assignee: [], Date: 2024-12-10, Priority: Low

### Trash
- Initially empty: `trash: []`
