# notion_mock Schema

**Deploy order**: 35 (alphabetical among all *_mock dirs, BASE_PORT=8000 -> port 8034 zero-indexed)
**Base URL**: `http://172.17.46.46:<dynamic-port>/` (port assigned by OS; check process or use `vite --port` override)
**Go Endpoint**: `GET /go?sid=<sid>` -> `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}` (or `"merge":true` to deep-merge)
**State endpoint**: `GET /state?sid=<sid>` -> `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Current user: `{id, name, email, avatar}` |
| `workspace` | object | Workspace info: `{id, name, icon, members: string[]}` |
| `pages` | object (map) | All pages keyed by page ID. Each page is a regular page or database (see below) |
| `blocks` | object (map) | All content blocks keyed by block ID |
| `trash` | array | Trashed pages: `[{id, page, deletedDate, parentId}]` |
| `comments` | object (map) | Comments keyed by comment ID: `{id, resolved, pageId, blockId, content, authorId, createdDate}` |
| `settings` | object | See Settings object below |
| `notifications` | array | `[{id, type, userId, pageTitle, pageId, message, timestamp, read}]` |
| `pageOrder` | array | Ordered list of root-level page IDs |
| `focusBlockId` | string\|null | Transient: currently focused block ID |

### Settings object
```
{
  appearance: "light" | "dark" | "system",   // applied to <html class="dark">
  startWeekMonday: bool,
  fontSize: "small" | "default" | "large",   // applied to <html class="font-small|font-default|font-large">
  notifDesktop: bool,    // desktop notifications toggle
  notifEmail: bool,      // email notifications toggle
  notifMobile: bool,     // mobile push notifications toggle
  teamspaces: [{id, name}],  // created teamspaces
}
```

### Page object (regular)
```
{
  id, title, icon, cover, parentId, blockIds: string[],
  favorite: bool, createdDate, lastEditedDate,
  properties: {
    sharedWith?: [{email, permission, addedDate}],  // users invited via Share dialog
    ...any custom properties
  }
}
```

### Page object (database, type="database")
```
{id, title, icon, cover, parentId, type:"database", viewType:"table"|"board"|"gallery",
 properties: [{id, name, type, options?}],
 views: [{id, name, type, filters, sorts, groupBy, visibleProperties}],
 items: string[],   // ordered list of child page IDs (database rows)
 blockIds: string[], favorite: bool, createdDate}
```

### Block object
```
{
  id, type, content, createdDate, lastEditedDate,
  properties: {
    // type-specific properties:
    color?: string,       // text color name
    bgColor?: string,     // background color name
    checked?: bool,       // for todo blocks
    url?: string,         // for image blocks
    caption?: string,     // for image blocks
    language?: string,    // for code blocks
    columns?: string[][],  // for column-layout blocks: array of arrays of blockIds
    items?: [{id, cells: {[colId]: string}}],  // for table blocks
  }
}
```

**Block types**: `text`, `heading-1`, `heading-2`, `heading-3`, `bullet-list`, `numbered-list`, `todo`, `quote`, `callout`, `divider`, `image`, `code`, `toggle`, `table`, `toc` (table of contents), `column-layout-2`, `column-layout-3`

### Database property types
`text`, `select`, `multi-select`, `person`, `date`, `checkbox`, `status`

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:<port>/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {"id": "user-1", "name": "Sarah Chen", "email": "sarah.chen@company.com", "avatar": ""},
        "workspace": {"id": "ws-1", "name": "Sarah's Workspace", "icon": "\ud83d\udcbc", "members": ["user-1"]},
        "pages": {
          "page-001": {
            "id": "page-001",
            "title": "My Page",
            "icon": "\ud83d\udcc4",
            "cover": null,
            "parentId": null,
            "blockIds": [],
            "favorite": false,
            "createdDate": "2025-01-01T00:00:00.000Z",
            "properties": {}
          }
        },
        "blocks": {},
        "trash": [],
        "comments": {},
        "settings": {
          "appearance": "light",
          "startWeekMonday": false,
          "fontSize": "default",
          "notifDesktop": true,
          "notifEmail": false,
          "notifMobile": true
        },
        "notifications": [],
        "pageOrder": ["page-001"]
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User action | State field(s) that change |
|-------------|---------------------------|
| Create new page | `pages` gains new entry; `pageOrder` gains new ID (if root page) |
| Rename page | `pages[id].title`, `pages[id].lastEditedDate` |
| Toggle page favorite | `pages[id].favorite` |
| Set page icon (emoji picker) | `pages[id].icon` |
| Set page cover image | `pages[id].cover` |
| Add/edit block | `blocks[id]` updated/added; `pages[id].blockIds` order may change |
| Delete block | `blocks[id]` removed; `pages[id].blockIds` shrinks |
| Move block (drag-and-drop) | `pages[id].blockIds` reordered |
| Move block to another page (Block menu > Move to) | `pages[sourceId].blockIds` shrinks; `pages[targetId].blockIds` grows |
| Copy link to block | Clipboard receives URL `<origin>/page/<pageId>#block-<blockId>` (no state change) |
| Table of Contents click | Scrolls viewport to heading block by `id="block-<blockId>"` (no state change) |
| Trash page | `pages[id]` removed; `trash` gains `{id, page, deletedDate}`; `pageOrder` shrinks |
| Restore from trash | `pages[id]` re-added; `trash` entry removed |
| Permanent delete | `trash` entry removed; associated `blocks` removed |
| Add database item | `pages` gains new item page; `pages[dbId].items` grows |
| Update database item property | `pages[itemId].properties[propId]` updated |
| Database search | Filters displayed rows by title/property value match (UI-only, no state change) |
| Add/update/delete DB view | `pages[dbId].views` array modified |
| Add/update/delete DB property | `pages[dbId].properties` array modified |
| Move column block (drag-and-drop) | `blocks[columnBlockId].properties.columns` updated |
| Change appearance (light/dark/system) | `settings.appearance`; `<html>` class `dark` added/removed |
| Change font size | `settings.fontSize`; `<html>` class `font-small/font-default/font-large` added |
| Toggle notification setting | `settings.notifDesktop` / `settings.notifEmail` / `settings.notifMobile` |
| Toggle "Start week on Monday" | `settings.startWeekMonday` |
| Update workspace name/icon | `workspace.name` / `workspace.icon` |
| Create teamspace | `settings.teamspaces` gains new `{id, name}` entry |
| Reorder sidebar pages | `pageOrder` reordered |
| Mark notification read | `notifications[n].read` becomes `true` |
| Add comment | `comments[id]` gains new entry |
| Resolve/unresolve comment | `comments[id].resolved` toggled |
| Invite user via Share dialog | `pages[id].properties.sharedWith` gains `{email, permission, addedDate}` |
| Share / Copy link (TopBar) | Clipboard receives page URL (no state change) |
| Duplicate page | `pages` gains new entry with `(copy)` suffix |
| Turn block into another type | `blocks[id].type` updated |
| Change block color/background | `blocks[id].properties.color` / `blocks[id].properties.bgColor` |

## Block type details for RL task design

### `column-layout-2` / `column-layout-3`
- Renders N columns side-by-side
- Each column is a `blocks[id].properties.columns[n]` array of blockIds
- Blocks can be dragged between columns using HTML5 drag-and-drop
- Blocks within columns can be nested `BlockRenderer` components

### `toc` (Table of Contents)
- Reads all `heading-1/2/3` blocks from the current page's `blockIds`
- Clicking a heading entry scrolls to `document.getElementById("block-<blockId>")`

### `numbered-list`
- Displayed number is computed by counting consecutive `numbered-list` blocks before the current one
- Breaking the sequence (non-numbered-list block between two numbered blocks) resets the count

### Slash command menu
- Opened by typing `/` in any text block
- Supports live text filter: typing after `/` filters block types by name/description
- All block types are accessible via the menu

## UI Selectors for Agent Automation

| Element | Selector pattern |
|---------|-----------------|
| Sidebar page item | `[data-page-id="<id>"]` or look for page title in sidebar |
| Add new page button | `button` containing `+` in sidebar |
| Block handle (drag) | `.group:hover [data-drag-handle]` or GripVertical icon |
| Block `+` add button | `.group:hover button:first-child` (Plus icon) |
| Slash menu | `.absolute.z-50.w-72` (SlashMenu) |
| Slash menu search | `input[placeholder="Search block types..."]` |
| Settings modal | `.fixed.inset-0 .bg-white.rounded-xl.w-\[720px\]` |
| Notifications toggle | `button.w-10.h-6.rounded-full` in notifications tab |
| Dark mode toggle | Appearance buttons in Preferences tab |
| Share dialog invite button | `button` with text "Invite" in ShareDialog |
| Database search input | `input[placeholder="Search..."]` in database toolbar |
| Block anchor | `#block-<blockId>` (used by TOC and Copy link to block) |
