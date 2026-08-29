# google_calendar_mock Schema

**Deploy order**: 17 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8017)
**Base URL**: `http://172.17.46.46:8017/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**State endpoint**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Current user (see User object below) |
| `calendars` | array | "My Calendars" sources with visibility toggles (see Calendar object below) |
| `otherCalendars` | array | "Other Calendars" (e.g. Holidays, Birthdays) — each entry is a Calendar object. Tracked in global state and persisted. |
| `events` | array | All calendar events (see Event object below) |
| `view` | string | Current calendar view: `"day"`, `"week"`, `"month"`, or `"agenda"` (default `"week"`) |
| `currentDate` | string | ISO 8601 datetime string for the date the calendar is centered on |
| `sidebarOpen` | boolean | Whether the left sidebar (mini calendar + calendar list) is visible (default `true`) |
| `settings` | object | User preferences (see Settings object below) |

### User Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique user ID (default `"u1"`) |
| `username` | string | Display name (default `"Demo User"`) |
| `email` | string | Email address (default `"demo@example.com"`) |
| `avatar` | string | URL to avatar image |

### Calendar Object

Used for both `calendars` (My Calendars) and `otherCalendars` (Other Calendars).

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique calendar ID (e.g. `"c1"`, `"c2"`, or UUID for user-created) |
| `name` | string | Calendar display name (e.g. `"Personal"`, `"Work"`) |
| `color` | string | Hex color string (e.g. `"#039BE5"`) |
| `visible` | boolean | Whether events from this calendar are shown |
| `userId` | string | Owner user ID (default `"u1"`) |
| `isDefault` | boolean | Whether this is the default calendar for new events (only in `calendars`) |

### Default Calendars (My Calendars)

| ID | Name | Color | isDefault |
|----|------|-------|-----------|
| `c1` | Personal | `#039BE5` (Peacock blue) | `true` |
| `c2` | Work | `#33B679` (Sage green) | `false` |
| `c3` | Family | `#8E24AA` (Grape purple) | `false` |
| `c4` | Holidays | `#F4511E` (Tangerine) | `false` |
| `c5` | Birthdays | `#E67C73` (Flamingo pink) | `false` |

### Default Other Calendars

| ID | Name | Color |
|----|------|-------|
| `oc1` | Holidays in United States | `#0B8043` (Basil green) |
| `oc2` | Birthdays | `#E67C73` (Flamingo pink) |

### Event Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique event ID (e.g. `"evt_001"`, or UUID for user-created). Quick-created events use `"evt_qc_<timestamp>"` prefix. |
| `calendarId` | string | ID of parent calendar (`"c1"`–`"c5"`). Invalid IDs are normalized to `"c1"`. |
| `title` | string | Event title. Defaults to `"(No Title)"` if empty. |
| `start` | string | ISO 8601 datetime for event start |
| `end` | string | ISO 8601 datetime for event end. Must be after `start` (validated in EventModal). |
| `allDay` | boolean | Whether this is an all-day event (default `false`) |
| `location` | string | Event location (default `""`) |
| `description` | string | Event description text (default `""`) |
| `guests` | array | Array of guest email strings, e.g. `["alice@example.com"]` |
| `color` | string | Hex color for event display (defaults to parent calendar color) |
| `recurring` | string | Recurrence rule: `"none"`, `"daily"`, `"weekly"`, `"monthly"`, or `"yearly"` (default `"none"`) |
| `reminders` | array | Array of Reminder objects (see below). Preserved when editing an existing event. |
| `meetLink` | string | Google Meet URL (default `""`) |
| `status` | string | Event status: `"confirmed"` (default), `"tentative"`, or `"cancelled"`. Editable via the Status dropdown in EventModal. |

### Reminder Object

| Field | Type | Notes |
|-------|------|-------|
| `type` | string | `"popup"` or `"email"` |
| `minutes` | number | Minutes before event to trigger reminder (e.g. `5`, `10`, `30`, `60`, `1440`) |

### Settings Object

| Field | Type | Notes |
|-------|------|-------|
| `weekStart` | number | Day of week to start on: `0` = Sunday (default), `1` = Monday, `6` = Saturday |
| `defaultDuration` | number | Default event duration in minutes (default `60`). Options: 15, 30, 60, 90, 120. |
| `defaultView` | string | Default calendar view on load: `"day"`, `"week"` (default), `"month"`, `"agenda"` |
| `defaultReminder` | object | Default reminder: `{type: "popup", minutes: 10}`. Options: 0, 5, 10, 15, 30, 60, 1440 minutes. |
| `timeFormat` | string | `"12h"` (default) or `"24h"` |
| `showWeekNumbers` | boolean | Show ISO week numbers in calendar (default `false`) |
| `showDeclinedEvents` | boolean | Show declined events (default `false`) |

Settings are editable via the Settings modal (click gear icon in header).

### Event Colors (available choices)

| ID | Name | Hex |
|----|------|-----|
| `tomato` | Tomato | `#D50000` |
| `flamingo` | Flamingo | `#E67C73` |
| `tangerine` | Tangerine | `#F4511E` |
| `banana` | Banana | `#F6BF26` |
| `sage` | Sage | `#33B679` |
| `basil` | Basil | `#0B8043` |
| `peacock` | Peacock | `#039BE5` |
| `blueberry` | Blueberry | `#3F51B5` |
| `lavender` | Lavender | `#7986CB` |
| `grape` | Grape | `#8E24AA` |
| `graphite` | Graphite | `#616161` |

### Mock Guest Users (available for guest suggestions)

| Email | Name |
|-------|------|
| `alice@example.com` | Alice Smith |
| `bob@example.com` | Bob Jones |
| `charlie@example.com` | Charlie Brown |
| `david@example.com` | David Lee |
| `eve@example.com` | Eve Wilson |
| `frank@example.com` | Frank Garcia |
| `grace@example.com` | Grace Chen |

## Reducer Actions

The following actions can be dispatched to modify state. All state changes are observable via `/go`.

| Action Type | Payload | Effect |
|-------------|---------|--------|
| `SET_VIEW` | `string` (view name) | Changes `view` |
| `SET_DATE` | `string` (ISO datetime) | Changes `currentDate` |
| `TOGGLE_SIDEBAR` | — | Toggles `sidebarOpen` |
| `ADD_EVENT` | Event object | Appends to `events` array |
| `UPDATE_EVENT` | Event object (with `id`) | Replaces matching event in `events` |
| `DELETE_EVENT` | `string` (event id) | Removes event from `events` by id |
| `MOVE_EVENT` | `{eventId, newStart}` | Updates `start` and `end` of event, preserving duration |
| `TOGGLE_CALENDAR` | `string` (calendar id) | Toggles `visible` on matching calendar in `calendars` |
| `SHOW_ONLY_CALENDAR` | `string` (calendar id) | Sets target calendar `visible: true`, all others `visible: false` — atomic single update |
| `ADD_CALENDAR` | Calendar object | Appends to `calendars` array (My Calendars) |
| `DELETE_CALENDAR` | `string` (calendar id) | Removes calendar from `calendars` by id |
| `TOGGLE_OTHER_CALENDAR` | `string` (calendar id) | Toggles `visible` on matching entry in `otherCalendars` |
| `ADD_OTHER_CALENDAR` | Calendar object | Appends to `otherCalendars` array (Other Calendars) |
| `UPDATE_SETTINGS` | Partial Settings object | Merges changes into `settings` |
| `LOAD_STATE` | Full state object | Replaces entire state (used at startup for injected state) |

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8017/",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {"id": "u1", "username": "Demo User", "email": "demo@example.com", "avatar": "https://picsum.photos/100/100?random=user1"},
        "calendars": [
          {"id": "c1", "name": "Personal", "color": "#039BE5", "visible": true, "userId": "u1", "isDefault": true},
          {"id": "c2", "name": "Work", "color": "#33B679", "visible": true, "userId": "u1", "isDefault": false}
        ],
        "otherCalendars": [
          {"id": "oc1", "name": "Holidays in United States", "color": "#0B8043", "visible": true},
          {"id": "oc2", "name": "Birthdays", "color": "#E67C73", "visible": true}
        ],
        "events": [
          {
            "id": "evt_001",
            "calendarId": "c2",
            "title": "Team Standup",
            "start": "2026-03-13T09:00:00.000Z",
            "end": "2026-03-13T09:30:00.000Z",
            "allDay": false,
            "location": "Zoom",
            "description": "Daily sync with the team",
            "guests": ["alice@example.com", "bob@example.com"],
            "color": "#33B679",
            "recurring": "daily",
            "reminders": [{"type": "popup", "minutes": 5}],
            "meetLink": "",
            "status": "confirmed"
          },
          {
            "id": "evt_002",
            "calendarId": "c1",
            "title": "Lunch with Sarah",
            "start": "2026-03-13T12:00:00.000Z",
            "end": "2026-03-13T13:00:00.000Z",
            "allDay": false,
            "location": "Downtown Cafe",
            "description": "Catch up over coffee",
            "guests": [],
            "color": "#039BE5",
            "recurring": "none",
            "reminders": [{"type": "popup", "minutes": 15}],
            "meetLink": "",
            "status": "confirmed"
          },
          {
            "id": "evt_003",
            "calendarId": "c4",
            "title": "National Holiday",
            "start": "2026-03-20T00:00:00.000Z",
            "end": "2026-03-21T00:00:00.000Z",
            "allDay": true,
            "location": "",
            "description": "Public holiday",
            "guests": [],
            "color": "#F4511E",
            "recurring": "none",
            "reminders": [],
            "meetLink": "",
            "status": "confirmed"
          }
        ],
        "view": "week",
        "currentDate": "2026-03-13T00:00:00.000Z",
        "sidebarOpen": true,
        "settings": {
          "weekStart": 0,
          "defaultDuration": 60,
          "defaultView": "week",
          "defaultReminder": {"type": "popup", "minutes": 10},
          "timeFormat": "12h",
          "showWeekNumbers": false,
          "showDeclinedEvents": false
        }
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|-------------------|
| Create a new event | New event object appended to `events` array |
| Edit an event | `events[i]` fields updated (title, start, end, location, description, guests, color, recurring, etc.) |
| Delete an event | Event removed from `events` array (by `id`) |
| Move/drag an event | `events[i].start` and `events[i].end` both updated (duration preserved); drops snap to nearest 30-minute mark |
| Quick-create an event (click on date) | New event appended to `events` with `id` prefixed `"evt_qc_"` |
| Click-drag on week/day grid | Opens event modal pre-filled with dragged time range (H-06) |
| Change calendar view | `view` changed: `"day"`, `"week"`, `"month"`, or `"agenda"` |
| Navigate to a date | `currentDate` updated to new ISO datetime |
| Toggle sidebar | `sidebarOpen` toggled between `true` and `false` |
| Toggle "My Calendar" visibility | `calendars[i].visible` toggled |
| "Display this only" context menu | All calendars updated atomically: target `visible: true`, all others `visible: false` |
| Add a new calendar (My Calendars) | New calendar object appended to `calendars` array |
| Delete a calendar | Calendar removed from `calendars` array (by `id`) |
| Toggle "Other Calendar" visibility | `otherCalendars[i].visible` toggled |
| Add a new other calendar (subscribe) | New calendar object appended to `otherCalendars` array |
| Update settings | `settings` sub-keys modified (weekStart, defaultDuration, timeFormat, etc.) |
| Add/remove guests | `events[i].guests` array modified |
| Change event color | `events[i].color` updated to new hex value |
| Change recurrence | `events[i].recurring` changed (e.g. `"none"` to `"weekly"`) |
| Change event status | `events[i].status` changed (`"confirmed"`, `"tentative"`, or `"cancelled"`) |

### state_diff Structure

The `/go` endpoint returns a flat key-path diff between initial and current state:

```json
{
  "events": {
    "old": [/* initial events array */],
    "new": [/* current events array */]
  },
  "view": {
    "old": "week",
    "new": "month"
  },
  "sidebarOpen": {
    "old": true,
    "new": false
  },
  "calendars.2.visible": {
    "old": true,
    "new": false
  },
  "otherCalendars": {
    "old": [/* initial otherCalendars array */],
    "new": [/* updated otherCalendars array */]
  },
  "settings.timeFormat": {
    "old": "12h",
    "new": "24h"
  }
}
```

### Notes on Event Normalization

When injecting events via the state API, the following normalization is applied:
- `calendarId` is validated against `["c1", "c2", "c3", "c4", "c5"]`; invalid IDs default to `"c1"`
- Missing `id` fields are auto-generated via UUID
- `start` also accepts `startTime` as an alias
- `end` also accepts `endTime` as an alias
- Missing `title` defaults to `"(No Title)"`
- `guests` must be an array; non-array values default to `[]`
- `reminders` must be an array; non-array values default to `[]`
- `color` defaults to the parent calendar's color if omitted
- `recurring` defaults to `"none"`
- `status` defaults to `"confirmed"`

### Event Form Validation

The EventModal enforces the following rules before saving:
- `title` must be non-empty
- `end` datetime must be strictly after `start` datetime (validation error shown inline; save blocked)
- Empty `startDate`/`endDate` fields will produce `NaN` dates, blocked by browser date input native validation

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `c` | Open create event modal |
| `d` | Switch to Day view |
| `w` | Switch to Week view |
| `m` | Switch to Month view |
| `a` | Switch to Agenda/Schedule view |
| `t` | Jump to today |
| `Escape` | Close modal / popover / search |

## New Components Added

| Component | File | Purpose |
|-----------|------|---------|
| `SettingsModal` | `src/components/SettingsModal.jsx` | Settings modal opened via gear icon in header. Edits all `settings.*` fields. Dispatches `UPDATE_SETTINGS`. |
| `AddCalendarModal` | `src/components/AddCalendarModal.jsx` | Modal for adding a new calendar. Mode `'my'` → dispatches `ADD_CALENDAR`. Mode `'other'` → dispatches `ADD_OTHER_CALENDAR`. |
| `ConfirmDialog` | `src/components/ConfirmDialog.jsx` | Reusable confirm/alert dialog replacing all `window.confirm()` and `alert()` calls. Props: `isOpen`, `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `danger`. |

## Agenda View Behavior

The Agenda/Schedule view shows events from `currentDate` forward for the next **90 days**. It:
- Respects calendar visibility (only shows events from visible `calendars`)
- Expands recurring events into individual instances within the 90-day window
- Groups events by date
- Shows an empty state message if no events exist in the window
- Clicking an event opens the event popover

## Week/Day View Drag-to-Create (H-06)

In the week and day views, users can click and drag vertically on an empty area of the time grid to create an event:
1. **Mouse down** on empty grid area starts the drag. A blue shaded preview rectangle appears.
2. **Mouse move** (with button held) extends the selection, snapping to 30-minute marks.
3. **Mouse up** opens the event creation modal pre-filled with the dragged start time.
4. A simple click (no drag) also opens the quick-create popover at the clicked time.
- Drags initiated on existing event chips are ignored (initiates event move instead).

## Drag-to-Move Behavior

- **Week/Day view**: Dragging an existing event to a new time slot snaps to the nearest 30-minute mark based on cursor position within the target slot.
- **Month view**: Dragging moves an event to a new day, preserving its original time-of-day.
- Recurring event instances (IDs containing `_recur_`) cannot be dragged. Attempting to drop one shows a `ConfirmDialog` alert (MonthView) or is silently ignored (WeekView guard).
