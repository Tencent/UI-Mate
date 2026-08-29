# outlook_web_mock Schema

**Deploy order**: 33 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8033)
**Base URL**: `http://172.17.46.46:8033/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State endpoint**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files: [{original_name, stored_name, size, content_type, url}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect | Redirects to `/mail/inbox` |
| `/mail/:folderId` | MailRoute | Mail view (inbox, drafts, sent, deleted, junk, archive, or custom folder name) |
| `/calendar` | CalendarRoute | Calendar view with month/week/day/workweek views |
| `/people` | PeopleRoute | Contacts manager |
| `/tasks` | TasksRoute | To Do task manager |
| `/go` | GoRoute | State inspection endpoint (JSON) |

### Mail Route folderId Mapping

| URL folderId | Internal ID |
|--------------|-------------|
| `inbox` | `folder-inbox` |
| `drafts` | `folder-drafts` |
| `sent` | `folder-sentitems` |
| `deleted` | `folder-deleteditems` |
| `junk` | `folder-junkemail` |
| `archive` | `folder-archive` |
| `<custom>` | `folder-<custom>` |

---

## State Schema (Top-Level Keys)

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Current user profile |
| `folders` | array | Mail folders (system + custom) |
| `messages` | array | All email messages across all folders |
| `calendars` | array | Calendar list (default, holidays, birthdays) |
| `events` | array | Calendar events |
| `contacts` | array | People/contacts |
| `categories` | array | Color categories for messages |
| `settings` | object | User settings (layout, theme, signatures, junk, rules, etc.) |
| `tasks` | array | To Do task items |
| `selectedFolderId` | string | Currently selected mail folder ID. Default: `"folder-inbox"` |
| `selectedMessageId` | string\|null | Currently selected/open email ID. Default: `null` |
| `selectedModule` | string | Active navigation module. Default: `"mail"`. Values: `"mail"`, `"calendar"`, `"people"`, `"tasks"` |
| `calendarView` | string | Calendar view mode. Default: `"month"`. Values: `"day"`, `"workweek"`, `"week"`, `"month"` |
| `calendarDate` | string | ISO 8601 date for calendar navigation. Default: current date |
| `searchQuery` | string | Active search query text. Default: `""` |
| `composeState` | object\|null | Compose modal state. `null` = closed. Default: `null` |
| `settingsOpen` | boolean | Whether settings panel is open. Default: `false` |
| `settingsSection` | string | Active settings section. Default: `"accounts"` |
| `folderPaneCollapsed` | boolean | Whether folder pane is collapsed. Default: `false` |

---

## User Object

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `id` | string | `"user-1"` | |
| `displayName` | string | `"Katy Reid"` | |
| `email` | string | `"katyreid@outlook.com"` | |
| `initials` | string | `"KR"` | |
| `avatarColor` | string | `"#0078D4"` | |
| `jobTitle` | string | `"Product Manager"` | |
| `company` | string | `"Contoso Ltd"` | |
| `timezone` | string | `"America/New_York"` | |
| `signature` | string | `"<p>Best regards,<br>Katy Reid</p>"` | HTML signature |

---

## Folder Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `"folder-inbox"`, `"folder-drafts"`, `"folder-expenses"` |
| `displayName` | string | Display name: `"Inbox"`, `"Drafts"`, etc. |
| `parentFolderId` | string\|null | Parent folder ID for nesting (e.g. `"folder-inbox"` for subfolders) |
| `wellKnownName` | string\|null | System name: `"inbox"`, `"drafts"`, `"sentitems"`, `"deleteditems"`, `"junkemail"`, `"archive"`, or `null` |
| `totalItemCount` | number | Total messages in folder (recomputed automatically from `messages`) |
| `unreadItemCount` | number | Unread messages in folder (recomputed automatically from `messages`) |
| `isSystem` | boolean | `true` for built-in folders, `false` for user-created |
| `icon` | string | Icon key: `"inbox"`, `"drafts"`, `"send"`, `"trash"`, `"warning"`, `"archive"`, `"folder"` |
| `childFolders` | array | IDs of child folders |
| `isFavorite` | boolean | Whether folder appears in Favorites section |

### Default Folders

| ID | Display Name | wellKnownName | isSystem | isFavorite |
|----|-------------|---------------|----------|------------|
| `folder-inbox` | Inbox | `inbox` | true | true |
| `folder-drafts` | Drafts | `drafts` | true | false |
| `folder-sentitems` | Sent Items | `sentitems` | true | false |
| `folder-deleteditems` | Deleted Items | `deleteditems` | true | false |
| `folder-junkemail` | Junk Email | `junkemail` | true | false |
| `folder-archive` | Archive | `archive` | true | false |
| `folder-expenses` | Expenses | `null` | false | true |
| `folder-invoices` | Invoices | `null` | false | true |
| `folder-projects` | Projects | `null` | false | false |

---

## Message Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique ID: `"msg-001"` through `"msg-030"` |
| `conversationId` | string | Groups messages in same thread: `"conv-001"`, etc. |
| `parentFolderId` | string | Folder ID this message belongs to |
| `subject` | string | Email subject line |
| `bodyPreview` | string | Plain-text preview (max ~255 chars) |
| `body` | object | `{contentType: "html", content: "<p>...</p>"}` |
| `from` | object | `{name: string, email: string}` |
| `sender` | object | `{name: string, email: string}` (usually same as from) |
| `toRecipients` | array | `[{name: string, email: string}]` |
| `ccRecipients` | array | `[{name: string, email: string}]` |
| `bccRecipients` | array | `[{name: string, email: string}]` |
| `receivedDateTime` | string | ISO 8601 datetime |
| `sentDateTime` | string | ISO 8601 datetime |
| `isRead` | boolean | Read status |
| `isDraft` | boolean | Whether message is a draft |
| `importance` | string | `"normal"`, `"high"`, or `"low"` |
| `flag` | object | `{flagStatus: "notFlagged" \| "flagged"}` |
| `categories` | array | Category names: `["Blue category", "Red category"]` etc. |
| `hasAttachments` | boolean | Whether message has attachments |
| `attachments` | array | `[{id, name, contentType, size, isInline}]` |
| `inferenceClassification` | string | `"focused"` or `"other"` (Focused Inbox classification) |
| `isPinned` | boolean | Whether message is pinned to top |

### Default Messages Summary (30 total)

| ID Range | Folder | Count | Description |
|----------|--------|-------|-------------|
| `msg-001` to `msg-012` | folder-inbox (focused) | 12 | Inbox focused tab messages |
| `msg-013` to `msg-017` | folder-inbox (other) | 5 | Inbox other tab messages |
| `msg-018` to `msg-019` | folder-drafts | 2 | Draft messages |
| `msg-020` to `msg-024` | folder-sentitems | 5 | Sent messages |
| `msg-025` to `msg-026` | folder-deleteditems | 2 | Deleted messages |
| `msg-027` to `msg-028` | folder-junkemail | 2 | Junk/spam messages |
| `msg-029` | folder-expenses | 1 | Expense report email |
| `msg-030` | folder-invoices | 1 | Invoice email |

### Attachment Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `"att-001"` |
| `name` | string | Filename: `"E-Ticket_CA4521.pdf"` |
| `contentType` | string | MIME type: `"application/pdf"`, `"application/zip"` |
| `size` | number | Size in bytes |
| `isInline` | boolean | Whether attachment is inline |

---

## Calendar Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `"cal-default"`, `"cal-holidays"`, `"cal-birthdays"` |
| `name` | string | Display name |
| `color` | string | Hex color |
| `isDefault` | boolean | Whether this is the default calendar |
| `isVisible` | boolean | Whether events from this calendar are shown |
| `canEdit` | boolean | Whether events can be created/edited on this calendar |

### Default Calendars

| ID | Name | Color | canEdit |
|----|------|-------|---------|
| `cal-default` | Calendar | `#0078D4` | true |
| `cal-holidays` | United States holidays | `#107C10` | false |
| `cal-birthdays` | Birthdays | `#FF8C00` | false |

---

## Event Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `"evt-standup-0"`, `"evt-1on1"`, `"evt-sprint"` |
| `subject` | string | Event title |
| `calendarId` | string | Calendar ID this event belongs to |
| `color` | string | Hex color for display (inherited from calendar at creation time) |
| `body` | object | `{contentType: "text", content: string}` |
| `start` | object | `{dateTime: ISO8601, timeZone: "America/New_York"}` |
| `end` | object | `{dateTime: ISO8601, timeZone: "America/New_York"}` |
| `location` | object | `{displayName: string}` |
| `isAllDay` | boolean | Whether event spans entire day |
| `isCancelled` | boolean | Whether event is cancelled |
| `organizer` | object | `{name: string, email: string}` |
| `attendees` | array | `[{name: string, email: string, status: "accepted"\|"tentative"\|"declined"\|"none", type: "required"\|"optional"}]` |
| `importance` | string | `"normal"` or `"high"` |
| `showAs` | string | `"free"`, `"tentative"`, `"busy"`, `"oof"` |
| `sensitivity` | string | `"normal"` |
| `categories` | array | Category names |
| `isOnlineMeeting` | boolean | Whether there's an online meeting link |
| `onlineMeetingUrl` | string\|null | Teams meeting URL |
| `recurrence` | object\|null | `{pattern: "daily"\|"weekly"}` or `null` |
| `reminderMinutesBefore` | number | Minutes before event for reminder (0, 5, 15, 30, 60, 1440) |
| `hasAttachments` | boolean | |
| `responseStatus` | string | `"accepted"`, `"tentative"`, `"organizer"`, `"none"` |

### Attendee Object (within events.attendees)

| Field | Type | Values | Notes |
|-------|------|--------|-------|
| `name` | string | | Display name (derived from email prefix when added via form) |
| `email` | string | | Email address |
| `status` | string | `"accepted"`, `"tentative"`, `"declined"`, `"none"` | Response status |
| `type` | string | `"required"`, `"optional"` | Attendee type. Defaults to `"required"` when added via form |

### Default Events (dynamically generated relative to current date)

| ID | Subject | Calendar | Type |
|----|---------|----------|------|
| `evt-standup-0` to `evt-standup-4` | Team Standup | cal-default | Recurring daily Mon-Fri 9:00-9:30 AM |
| `evt-1on1` | 1:1 with Marcus | cal-default | Weekly Tuesday 2:00-2:30 PM |
| `evt-sprint` | Sprint Planning | cal-default | Weekly Monday 10:00-11:00 AM |
| `evt-demo` | Product Demo | cal-default | Wednesday 3:00-4:00 PM |
| `evt-design` | Design Review | cal-default | Thursday 1:00-2:00 PM |
| `evt-client` | Client Call -- Woodgrove Bank | cal-default | Friday 11:00-11:30 AM |
| `evt-offsite` | Company Offsite | cal-default | Next Friday, all day |
| `evt-birthday` | Marcus Chen's Birthday | cal-birthdays | Next Tuesday, all day |
| `evt-qbr` | Quarterly Review | cal-default | Last Monday 2:00-3:00 PM |
| `evt-lunch` | Team Lunch | cal-default | Last Wednesday 12:00-1:00 PM |
| `evt-spring` | Spring Break | cal-holidays | 10 days from now, all day |

---

## Contact Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `"contact-001"` through `"contact-018"` |
| `displayName` | string | Full name |
| `givenName` | string | First name |
| `surname` | string | Last name |
| `emailAddresses` | array | `[{address: string, name: string}]` |
| `businessPhones` | array | `[string]` |
| `mobilePhone` | string\|null | Mobile phone number |
| `homePhones` | array | `[string]` |
| `jobTitle` | string\|null | Job title |
| `companyName` | string\|null | Company |
| `department` | string\|null | Department |
| `officeLocation` | string\|null | Office location |
| `businessAddress` | object\|null | Business address |
| `homeAddress` | object\|null | Home address |
| `birthday` | string\|null | Date string e.g. `"1990-06-15"` |
| `personalNotes` | string | Notes about the contact |
| `initials` | string | Two-letter initials for avatar |
| `avatarColor` | string | Hex color for avatar background |
| `isFavorite` | boolean | Whether contact is in favorites |
| `categories` | array | Category names |

### Default Contacts (18 total)

| ID | Name | Company | Favorite |
|----|------|---------|----------|
| `contact-001` | Elvia Atkins | Contoso Ltd | true |
| `contact-002` | Marcus Chen | Contoso Ltd | true |
| `contact-003` | Lydia Bauer | Contoso Ltd | false |
| `contact-004` | Kevin Thompson | Contoso Ltd | true |
| `contact-005` | Alex Wilber | Contoso Ltd | true |
| `contact-006` | Megan Bowen | Contoso Ltd | false |
| `contact-007` | Pradeep Gupta | Contoso Ltd | false |
| `contact-008` | Nestor Wilke | Contoso Ltd | false |
| `contact-009` | Johanna Lorenz | Contoso Ltd | false |
| `contact-010` | Isaiah Langer | Contoso Ltd | false |
| `contact-011` | Lee Gu | Contoso Ltd | false |
| `contact-012` | Miriam Graham | Contoso Ltd | true |
| `contact-013` | Daisy Phillips | (personal) | false |
| `contact-014` | Amanda Brady | Brady Real Estate | false |
| `contact-015` | Shannon Trine | Fabrikam Inc | false |
| `contact-016` | Kristin Patterson | Woodgrove Bank | false |
| `contact-017` | Contoso Airlines | Contoso Airlines | false |
| `contact-018` | Margie's Travel | Margie's Travel | false |

---

## Category Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `"cat-blue"` |
| `displayName` | string | e.g. `"Blue category"` |
| `color` | string | Hex color |
| `presetIndex` | number | Preset index (0-5) |

### Default Categories

| ID | Display Name | Color |
|----|-------------|-------|
| `cat-blue` | Blue category | `#0078D4` |
| `cat-green` | Green category | `#107C10` |
| `cat-orange` | Orange category | `#FF8C00` |
| `cat-purple` | Purple category | `#8764B8` |
| `cat-red` | Red category | `#D13438` |
| `cat-yellow` | Yellow category | `#FFB900` |

---

## Settings Object

All settings fields are stored under `state.settings`. Fields not present default to the values below. The `updateSettings` action performs a shallow merge, so partial updates (e.g. `{theme: "dark"}`) are safe.

### Core UI Settings (always persisted)

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `theme` | string | `"light"` | `"light"`, `"dark"`, or `"system"`. Applied immediately via CSS class `dark-theme` on `<html>`. |
| `density` | string | `"medium"` | `"full"`, `"medium"`, or `"compact"`. Affects email row padding via CSS class `density-<value>` on the email list container. |
| `readingPanePosition` | string | `"right"` | `"right"`, `"bottom"`, or `"off"`. Controls reading pane layout in MailRoute. |
| `focusedInbox` | boolean | `true` | When `true` and in Inbox, shows Focused/Other tabs filtering by `inferenceClassification`. When `false`, all inbox emails shown without tabs. |
| `conversationView` | boolean | `true` | When `true`, groups emails sharing the same `conversationId` into one row with a count badge. When `false`, each message shown individually. |
| `previewText` | boolean | `true` | When `true`, shows `bodyPreview` text in email list rows. When `false`, hides preview; only category dots, attachment icon, and flag are shown. |

### AutoReply Sub-Object (`settings.autoReply`)

| Field | Type | Default |
|-------|------|---------|
| `enabled` | boolean | `false` |
| `internalMessage` | string | `""` |
| `externalMessage` | string | `""` |

### Signature Sub-Object (`settings.signature`)

| Field | Type | Default |
|-------|------|---------|
| `name` | string | `"Default Signature"` |
| `html` | string | `"<p>Best regards,<br>Katy Reid</p>"` |
| `useForNew` | boolean | `true` |
| `useForReply` | boolean | `false` |

### Calendar Settings

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `weekStart` | string | `"Sunday"` | First day of the week: `"Sunday"`, `"Monday"`, `"Saturday"` |
| `defaultReminder` | string | `"15"` | Default reminder minutes for new events: `"0"`, `"5"`, `"15"`, `"30"`, `"60"`, `"1440"` |
| `defaultEventDuration` | string | `"60"` | Default event duration in minutes: `"15"`, `"30"`, `"60"`, `"120"` |
| `autoDeclineConflicts` | boolean | `false` | Automatically decline conflicting invitations |
| `publishCalendar` | boolean | `false` | Publish calendar publicly |
| `calendarSharingPermission` | string | `"availability"` | `"availability"`, `"limited"`, `"full"`, `"edit"` |

### Working Hours Sub-Object (`settings.workingHours`)

| Field | Type | Default |
|-------|------|---------|
| `start` | string | `"08:00"` |
| `end` | string | `"17:00"` |
| `days` | array | `[1, 2, 3, 4, 5]` (Mon-Fri) |

### Language and Format Settings

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `language` | string | `"en-US"` | Display language: `"en-US"`, `"en-GB"`, `"es-ES"`, `"fr-FR"`, `"de-DE"`, `"ja-JP"`, `"zh-CN"`, `"pt-BR"` |
| `timeFormat` | string | `"12h"` | `"12h"` or `"24h"` |
| `dateFormat` | string | `"MM/dd/yyyy"` | `"MM/dd/yyyy"`, `"dd/MM/yyyy"`, `"yyyy-MM-dd"` |

### Accessibility Settings

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `highContrast` | boolean | `false` | High contrast mode toggle (stored in state; no CSS side-effect currently) |
| `screenReader` | boolean | `false` | Screen reader support toggle (stored in state) |
| `fontSize` | string | `"medium"` | `"small"`, `"medium"`, `"large"`, `"extra-large"` (stored in state) |

### Compose Settings

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `composeFont` | string | `"Segoe UI"` | Default font: `"Segoe UI"`, `"Arial"`, `"Calibri"`, `"Times New Roman"`, `"Verdana"` |
| `composeFontSize` | string | `"11"` | Font size in pt: `"8"`, `"10"`, `"11"`, `"12"`, `"14"` |
| `composeFormat` | string | `"html"` | `"html"` or `"plain"` |
| `alwaysShowBcc` | boolean | `false` | Always show Bcc field in compose |
| `includeOriginalInReply` | boolean | `true` | Include original message in reply |

### Junk Email Settings

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `blockedSenders` | array | `["rewards-special-offer.xyz", "account-verify-now.xyz"]` | Array of blocked email addresses or domains (strings) |
| `safeSenders` | array | `["contoso.com", "outlook.com"]` | Array of safe email addresses or domains (strings) |

### Inbox Rules (`settings.rules`)

An array of rule objects. Default initial value is hardcoded in the UI when `settings.rules` is absent.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Rule ID (e.g. `"rule-1"`) |
| `name` | string | Rule display name |
| `condition` | string | Condition description (display only) |
| `action` | string | Action description (display only) |
| `enabled` | boolean | Whether rule is active |

### People Settings

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `autoAddContacts` | boolean | `true` | Automatically add contacts from email |
| `contactSortOrder` | string | `"firstName"` | `"firstName"`, `"lastName"`, `"company"` |

---

## Settings Effects on UI (Implementation Reference)

| Setting | Effect |
|---------|--------|
| `settings.theme = "dark"` | Adds class `dark-theme` to `<html>`. CSS overrides apply dark background (`#1f1f1f`), light text, dark borders/inputs throughout. |
| `settings.theme = "light"` | Removes `dark-theme` class from `<html>`. Default light styling. |
| `settings.theme = "system"` | Applies `dark-theme` if `window.matchMedia('(prefers-color-scheme: dark)').matches`, otherwise removes it. |
| `settings.density = "compact"` | Wraps email list in `density-compact` container. CSS sets `email-row` padding to 4px top/bottom; avatar reduced to 28px. |
| `settings.density = "medium"` | Default: `email-row` padding 10px top/bottom (Tailwind `py-2.5`). No override class active. |
| `settings.density = "full"` | Wraps email list in `density-full` container. CSS sets `email-row` padding to 12px top/bottom. |
| `settings.readingPanePosition = "right"` | Email list and reading pane displayed side by side horizontally. |
| `settings.readingPanePosition = "bottom"` | Email list stacked above reading pane vertically. |
| `settings.readingPanePosition = "off"` | Reading pane hidden entirely. Clicking an email selects it but shows no content. |
| `settings.focusedInbox = true` | In `/mail/inbox`, shows "Focused" and "Other" tabs. Emails filtered by `inferenceClassification`. |
| `settings.focusedInbox = false` | In `/mail/inbox`, no tabs shown. All messages displayed regardless of `inferenceClassification`. |
| `settings.conversationView = true` | Emails with the same `conversationId` are grouped; only the most recent is shown with a count badge `(N)`. |
| `settings.conversationView = false` | Every message shown individually; no grouping. |
| `settings.previewText = true` | `bodyPreview` text shown as third line in each email row. |
| `settings.previewText = false` | `bodyPreview` hidden; only category dots, attachment icon, and flag shown below subject. |

---

## CSS Theme Classes

### Dark Theme

The class `dark-theme` is added to `<html>` when `settings.theme === "dark"` or when `settings.theme === "system"` and the OS prefers dark mode.

Key dark theme overrides (defined in `/src/index.css`):
- `.bg-white` → `#2d2d2d`
- `.bg-neutral-50` → `#252525`
- `.bg-neutral-100` → `#333333`
- `.bg-neutral-200` → `#3d3d3d`
- Text colors shifted to light variants (`#f3f2f1`, `#d2d0ce`)
- Border colors shifted to dark variants (`#3d3d3d`, `#333333`)
- Selected row background `.bg-[#EBF3FC]` → `#003966`
- All `input`, `textarea`, `select` elements get dark backgrounds

### Density Classes

The email list container (`div.w-80.border-r...`) receives class `density-compact`, `density-medium`, or `density-full` based on `settings.density`.

| Class | Email Row Padding |
|-------|------------------|
| `density-compact` | 4px top/bottom; avatar 28x28px |
| `density-medium` | Tailwind default (`py-2.5` = 10px) |
| `density-full` | 12px top/bottom |

---

## Task Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | e.g. `"task-001"` through `"task-007"` |
| `title` | string | Task title |
| `dueDate` | string | ISO 8601 datetime |
| `completed` | boolean | Whether task is done |
| `importance` | string | `"high"`, `"normal"`, or `"low"` |
| `categories` | array | Category names |

### Default Tasks (7 total)

| ID | Title | Importance | Completed |
|----|-------|-----------|-----------|
| `task-001` | Review Project Falcon PR #142 | high | false |
| `task-002` | Approve Q2 marketing budget | high | false |
| `task-003` | Prepare QBR presentation slides | normal | false |
| `task-004` | Follow up with legal on ToS changes | normal | false |
| `task-005` | Send team outing photo selections | low | false |
| `task-006` | Book conference room for sprint demo | normal | true |
| `task-007` | Submit March expense report | normal | true |

---

## ComposeState Object (when not null)

| Field | Type | Notes |
|-------|------|-------|
| `mode` | string | `"new"`, `"reply"`, `"replyAll"`, or `"forward"` |
| `to` | string | Pre-filled "To" field (comma-separated emails) |
| `subject` | string | Pre-filled subject |
| `body` | string | Pre-filled body content |
| `replyTo` | object | Original message object (for reply/replyAll) |
| `forwardFrom` | object | Original message object (for forward) |

---

## Actions Reference (StoreContext)

All actions are accessible via `actions` from `useStore()`.

### Mail Actions

| Action | Signature | State Changes |
|--------|-----------|---------------|
| `selectFolder` | `(folderId: string)` | `selectedFolderId = folderId`, `selectedMessageId = null`, `searchQuery = ""` |
| `selectMessage` | `(messageId: string)` | `selectedMessageId = messageId`, `messages[i].isRead = true` for the selected message |
| `sendEmail` | `(emailData: object)` | New message added to `messages` with `parentFolderId: "folder-sentitems"`, `composeState = null` |
| `deleteMessage` | `(messageId: string)` | If already in Deleted Items: removes from `messages`. Otherwise: moves to `folder-deleteditems`. Clears `selectedMessageId` if it matches. |
| `archiveMessage` | `(messageId: string)` | Sets `messages[i].parentFolderId = "folder-archive"`. Clears `selectedMessageId` if it matches. |
| `moveMessage` | `(messageId: string, folderId: string)` | Sets `messages[i].parentFolderId = folderId` |
| `toggleRead` | `(messageId: string)` | Toggles `messages[i].isRead` |
| `markRead` | `(messageId: string, isRead: boolean)` | Sets `messages[i].isRead = isRead` |
| `toggleFlag` | `(messageId: string)` | Toggles `messages[i].flag.flagStatus` between `"flagged"` and `"notFlagged"` |
| `togglePin` | `(messageId: string)` | Toggles `messages[i].isPinned` |
| `categorizeMessage` | `(messageId: string, categoryName: string)` | Adds or removes `categoryName` from `messages[i].categories` (toggle) |
| `setSearchQuery` | `(query: string)` | Sets `searchQuery`. When non-empty, email list ignores folder/tab filter and shows all matching messages. |
| `setComposeState` | `(composeState: object\|null)` | Sets `composeState`. `null` closes the compose modal. |

### Folder Actions

| Action | Signature | State Changes |
|--------|-----------|---------------|
| `toggleFolderPane` | `()` | Toggles `folderPaneCollapsed` |
| `createFolder` | `(name: string, parentId?: string\|null)` | Adds new folder object to `folders` with `id: "folder-<timestamp>"`, `isSystem: false`, `icon: "folder"` |
| `toggleFolderFavorite` | `(folderId: string)` | Toggles `folders[i].isFavorite` |

### Calendar Actions

| Action | Signature | State Changes |
|--------|-----------|---------------|
| `setCalendarView` | `(view: string)` | Sets `calendarView` to `"day"`, `"workweek"`, `"week"`, or `"month"` |
| `setCalendarDate` | `(date: string)` | Sets `calendarDate` (ISO 8601 string) |
| `createEvent` | `(eventData: object)` | Adds new event to `events` with `id: "evt-<timestamp>"` merged with `eventData` |
| `updateEvent` | `(eventId: string, data: object)` | Shallow-merges `data` into `events[i]` matching `eventId` |
| `deleteEvent` | `(eventId: string)` | Removes event from `events` |
| `toggleCalendarVisibility` | `(calId: string)` | Toggles `calendars[i].isVisible` |

### Contact Actions

| Action | Signature | State Changes |
|--------|-----------|---------------|
| `addContact` | `(contactData: object)` | Adds new contact to `contacts` with `id: "contact-<timestamp>"`. Auto-derives `displayName`, `initials`, `avatarColor`, `emailAddresses`, `businessPhones`. |
| `updateContact` | `(contactId: string, data: object)` | Shallow-merges `data` into `contacts[i]` matching `contactId` |
| `deleteContact` | `(contactId: string)` | Removes contact from `contacts` |

### Task Actions

| Action | Signature | State Changes |
|--------|-----------|---------------|
| `createTask` | `(title: string, dueDate?: string)` | Adds new task to `tasks` with `id: "task-<timestamp>"`, `completed: false`, `importance: "normal"` |
| `toggleTaskComplete` | `(taskId: string)` | Toggles `tasks[i].completed` |
| `deleteTask` | `(taskId: string)` | Removes task from `tasks` |

### Settings Actions

| Action | Signature | State Changes |
|--------|-----------|---------------|
| `updateSettings` | `(settingsUpdate: object)` | Shallow-merges `settingsUpdate` into `settings`. Immediately affects UI. |
| `setSettingsOpen` | `(open: boolean, section?: string)` | Sets `settingsOpen = open`. If `section` provided, also sets `settingsSection = section`. |
| `selectModule` | `(mod: string)` | Sets `selectedModule` |

### Derived State (auto-recomputed)

After any action that changes `messages` or `folders`, the context automatically recomputes:
- `folders[i].totalItemCount` = count of messages with `parentFolderId === folders[i].id`
- `folders[i].unreadItemCount` = count of unread messages with `parentFolderId === folders[i].id`

---

## Form Validation Rules

### Calendar Event Form (EventFormModal in CalendarRoute)

| Rule | Condition | Error Message |
|------|-----------|---------------|
| Start date required | `eventForm.startDate` is empty | `"Start and end dates are required."` |
| End date required | `eventForm.endDate` is empty | `"Start and end dates are required."` |
| Start time required (non-all-day) | `!eventForm.isAllDay && !eventForm.startTime` | `"Start and end times are required."` |
| End time required (non-all-day) | `!eventForm.isAllDay && !eventForm.endTime` | `"Start and end times are required."` |
| Valid datetime values | `isNaN(startDateTime)` or `isNaN(endDateTime)` | `"Invalid date or time values."` |
| End after start | `endDateTime <= startDateTime` | `"End time must be after start time."` |

Validation errors are displayed inline in a red banner inside the modal (not browser `alert()`/`confirm()`). Subject defaults to `"(No title)"` if empty.

### Contact Form (ContactFormModal in PeopleRoute)

| Rule | Condition | Error Message |
|------|-----------|---------------|
| Name required | Both `givenName.trim()` and `surname.trim()` are empty | `"Please enter at least a first or last name."` |
| Valid email format | `email.trim()` non-empty and fails regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `"Please enter a valid email address."` |

Validation errors are displayed inline in a red banner inside the modal.

---

## Confirm Dialogs (Styled, No Native Browser Dialogs)

Both calendar event deletion and contact deletion use a styled `ConfirmDialog` component instead of native `window.confirm()`. The dialog renders:
- An amber warning icon with the confirmation message
- A "Cancel" button (closes dialog, no action)
- A red "Delete" button (confirms and executes deletion)

The dialog is rendered as a fixed overlay (`z-[100]`) with a semi-transparent backdrop.

---

## Junk Email Settings UI

The `Settings > Mail > Junk email` section uses a proper input UI (`JunkEmailSettings` component) instead of `window.prompt()`. It provides:
- A list of blocked senders/domains with individual "Remove" buttons
- A text input + "Add" button (also responds to Enter key) for adding new entries
- A separate list of safe senders/domains with the same controls
- Changes immediately update `settings.blockedSenders` and `settings.safeSenders` in state

---

## Settings Panel Navigation

The settings panel (`SettingsPanel`) has two-level navigation:

| Section | Sub-items |
|---------|-----------|
| Accounts | Email accounts, Automatic replies, Signatures, Categories |
| General | Appearance, Language, Accessibility |
| Mail | Layout, Compose and reply, Rules, Junk email |
| Calendar | Events and invitations, Shared calendars |
| People | Contacts, Import/Export |

Key sub-items and the settings they control:
- **Appearance** (General): `theme`, `density`, `focusedInbox`, `conversationView`
- **Language** (General): `language`, `timeFormat`, `dateFormat`
- **Accessibility** (General): `highContrast`, `screenReader`, `fontSize`
- **Layout** (Mail): `readingPanePosition`, `density`, `previewText`
- **Compose and reply** (Mail): `composeFont`, `composeFontSize`, `composeFormat`, `alwaysShowBcc`, `includeOriginalInReply`
- **Rules** (Mail): `rules` array
- **Junk email** (Mail): `blockedSenders`, `safeSenders`
- **Events and invitations** (Calendar): `defaultReminder`, `defaultEventDuration`, `autoDeclineConflicts`, `weekStart`
- **Shared calendars** (Calendar): `publishCalendar`, `calendarSharingPermission`
- **Contacts** (People): `autoAddContacts`, `contactSortOrder`

The panel has Save and Discard buttons. **Save** commits current `settings` and closes the panel. **Discard** reverts `settings` to the snapshot taken when the panel was opened, then closes.

---

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8033/",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {
          "id": "user-1",
          "displayName": "Katy Reid",
          "email": "katyreid@outlook.com",
          "initials": "KR",
          "avatarColor": "#0078D4"
        },
        "folders": [
          {"id": "folder-inbox", "displayName": "Inbox", "parentFolderId": null, "wellKnownName": "inbox", "totalItemCount": 1, "unreadItemCount": 1, "isSystem": true, "icon": "inbox", "childFolders": [], "isFavorite": true}
        ],
        "messages": [
          {
            "id": "msg-001",
            "conversationId": "conv-001",
            "parentFolderId": "folder-inbox",
            "subject": "Test Email Subject",
            "bodyPreview": "This is a test email body preview...",
            "body": {"contentType": "html", "content": "<p>This is a test email.</p>"},
            "from": {"name": "Alice Smith", "email": "alice@example.com"},
            "sender": {"name": "Alice Smith", "email": "alice@example.com"},
            "toRecipients": [{"name": "Katy Reid", "email": "katyreid@outlook.com"}],
            "ccRecipients": [],
            "bccRecipients": [],
            "receivedDateTime": "2026-03-13T10:00:00Z",
            "sentDateTime": "2026-03-13T10:00:00Z",
            "isRead": false,
            "isDraft": false,
            "importance": "normal",
            "flag": {"flagStatus": "notFlagged"},
            "categories": [],
            "hasAttachments": false,
            "attachments": [],
            "inferenceClassification": "focused",
            "isPinned": false
          }
        ],
        "calendars": [
          {"id": "cal-default", "name": "Calendar", "color": "#0078D4", "isDefault": true, "isVisible": true, "canEdit": true}
        ],
        "events": [],
        "contacts": [],
        "categories": [
          {"id": "cat-blue", "displayName": "Blue category", "color": "#0078D4", "presetIndex": 0}
        ],
        "settings": {
          "readingPanePosition": "right",
          "density": "medium",
          "conversationView": true,
          "focusedInbox": true,
          "autoReply": {"enabled": false, "internalMessage": "", "externalMessage": ""},
          "signature": {"name": "Default Signature", "html": "<p>Best regards,<br>Katy Reid</p>", "useForNew": true, "useForReply": false},
          "theme": "light",
          "previewText": true,
          "weekStart": "Sunday",
          "workingHours": {"start": "08:00", "end": "17:00", "days": [1, 2, 3, 4, 5]},
          "blockedSenders": ["rewards-special-offer.xyz", "account-verify-now.xyz"],
          "safeSenders": ["contoso.com", "outlook.com"]
        },
        "tasks": [],
        "selectedFolderId": "folder-inbox",
        "selectedMessageId": null,
        "selectedModule": "mail",
        "calendarView": "month",
        "calendarDate": "2026-03-13T00:00:00.000Z",
        "searchQuery": "",
        "composeState": null,
        "settingsOpen": false,
        "settingsSection": "accounts",
        "folderPaneCollapsed": false
      }
    }
  }
}
```

---

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|-------------------|
| Select a folder | `selectedFolderId` changes; `selectedMessageId` set to `null`; `searchQuery` cleared |
| Select/read an email | `selectedMessageId` changes; `messages[i].isRead: false -> true` |
| Toggle read/unread | `messages[i].isRead` toggled |
| Flag/unflag email | `messages[i].flag.flagStatus`: `"notFlagged"` <-> `"flagged"` |
| Pin/unpin email | `messages[i].isPinned` toggled |
| Delete email | If in Deleted Items: message removed from `messages`. Otherwise: `messages[i].parentFolderId` -> `"folder-deleteditems"` |
| Archive email | `messages[i].parentFolderId` -> `"folder-archive"` |
| Move email to folder | `messages[i].parentFolderId` changes to target folder ID |
| Categorize email | `messages[i].categories` array modified (add/remove category name) |
| Send email (compose) | New message object added to `messages` with `parentFolderId: "folder-sentitems"`; `composeState` set to `null` |
| Open compose modal | `composeState` set to `{mode: "new"\|"reply"\|"replyAll"\|"forward", ...}` |
| Close compose modal | `composeState` set to `null` |
| Search for emails | `searchQuery` updated |
| Create folder | New folder object added to `folders` |
| Toggle folder favorite | `folders[i].isFavorite` toggled |
| Toggle folder pane | `folderPaneCollapsed` toggled |
| Switch module (Mail/Calendar/People/Tasks) | `selectedModule` changes |
| Change calendar view | `calendarView` changes (`"day"`, `"workweek"`, `"week"`, `"month"`) |
| Navigate calendar date | `calendarDate` changes |
| Create calendar event | New event object added to `events` |
| Edit calendar event | `events[i]` fields updated |
| Delete calendar event | Event removed from `events` |
| Toggle calendar visibility | `calendars[i].isVisible` toggled |
| Add contact | New contact object added to `contacts` |
| Edit contact | `contacts[i]` fields updated |
| Delete contact | Contact removed from `contacts` |
| Create task | New task object added to `tasks` |
| Toggle task complete | `tasks[i].completed` toggled |
| Delete task | Task removed from `tasks` |
| Update settings (any field) | `settings` sub-field updated (e.g. `settings.theme`, `settings.density`, `settings.focusedInbox`, `settings.blockedSenders`, etc.) |
| Open settings panel | `settingsOpen: true` |
| Close settings panel | `settingsOpen: false` |
| Add blocked sender | `settings.blockedSenders` array grows by one entry |
| Remove blocked sender | `settings.blockedSenders` array shrinks by one entry |
| Add safe sender | `settings.safeSenders` array grows by one entry |
| Remove safe sender | `settings.safeSenders` array shrinks by one entry |
| Toggle Focused Inbox | `settings.focusedInbox` toggled; inbox immediately shows/hides tabs |
| Toggle conversation view | `settings.conversationView` toggled; email list immediately groups/ungroups |
| Toggle preview text | `settings.previewText` toggled; email rows immediately show/hide body preview |
| Change reading pane position | `settings.readingPanePosition` changes; layout immediately updates |
| Change density | `settings.density` changes; email row padding immediately changes |
| Change theme | `settings.theme` changes; `dark-theme` class on `<html>` added/removed immediately |

---

## state_diff Structure

The `/go` endpoint returns `state_diff` which describes differences between `initial_state` and `current_state`. Each changed key maps to either `{added: <value>}` (if not present in initial) or `{modified: <value>}` (if present in initial but changed).

```json
{
  "state_diff": {
    "messages": {
      "modified": [...]
    },
    "selectedMessageId": {
      "modified": "msg-001"
    },
    "selectedFolderId": {
      "modified": "folder-sentitems"
    },
    "settings": {
      "modified": {
        "theme": "dark",
        "density": "compact",
        "focusedInbox": false
      }
    }
  }
}
```

Note: The `state_diff` compares full top-level keys by JSON stringification. A change to any sub-field of `settings` or `messages` will show the entire `settings` or `messages` object as `modified`.

---

## API Endpoints (vite.config.js)

### POST /post?sid=<sid>

| Body | Behavior |
|------|----------|
| `{"action": "set", "state": {...}}` | Writes `state` to `.mock-states/<sid>.json`. Also writes `.mock-states/<sid>.initial.json` if it does not yet exist. Supports `"merge": true` for deep merge with existing state. |
| `{"action": "set_current", "state": {...}}` | Updates only current state file. Never touches `.initial.json`. Used for golden patch (correct completion state). Supports `"merge": true`. |
| `{"action": "reset"}` | Deletes both `.json` and `.initial.json` files for the session. App reloads with fresh default state. |

### GET /go?sid=<sid>

Returns `{initial_state, current_state, state_diff}`. Both `initial_state` and `current_state` are read from disk files. If no initial file exists, falls back to current state as the baseline.

### GET /state?sid=<sid>

Returns `{stored_state, has_custom_state, sid}`. Low-level endpoint to see raw stored state.

### POST /upload?sid=<sid>

Accepts `multipart/form-data` with one or more file fields. Stores files in `.mock-files/<sid>/` with UUID-prefixed names. Returns `{success: true, files: [{original_name, stored_name, size, content_type, url}]}`.

### GET /files/<sid>/<filename>

Serves a previously uploaded file with appropriate `Content-Type` and `Content-Disposition: attachment` header. Supported MIME types: pdf, doc/docx, xls/xlsx, ppt/pptx, png, jpg/jpeg, gif, txt, csv, zip.

---

## State Management Details

- **Pattern**: React Context (`StoreContext.jsx`)
- **Persistence**: localStorage with keys `outlook_mock_data` (current) and `outlook_mock_initial_state` (initial), suffixed with `_<sid>` when session ID is present
- **Folder counts**: `totalItemCount` and `unreadItemCount` are automatically recomputed from `messages` whenever messages or folders change (inside `updateState`)
- **Deep merge**: Custom state injected via `/post` is deep-merged with the default `createInitialData()` output, so partial state overrides work correctly
- **Session IDs**: Passed via URL query param `?sid=<sid>`. Each session has isolated state files on disk and isolated localStorage keys.
- **Settings persistence**: All settings changes via `updateSettings` are immediately saved to localStorage and disk on next render cycle.
