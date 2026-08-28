# gmail_mock Schema

**Deploy order**: 18 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8017)
**Base URL**: `http://172.17.46.46:8017/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State endpoint**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{files: [{url, original_name, stored_name, size}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

---

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Current user: `{userId, username, email, avatar}` |
| `emails` | array | All emails across all folders (see Email fields below) |
| `labels` | array | User-defined labels: `[{id, name, color}]` |
| `drafts` | array | Draft emails (same shape as email objects, legacy field — drafts are stored in `emails` with `folder: "drafts"`) |
| `settings` | object | User settings (see Settings fields below) |

### Email Object Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique email ID (e.g. `"email_1"`) |
| `threadId` | string | Groups emails into threads |
| `from` | object | `{name, email, avatar}` |
| `to` | array | `[{name, email}]` |
| `cc` | array | `[{name, email}]` |
| `bcc` | array | `[{name, email}]` |
| `subject` | string | Email subject line |
| `body` | string | HTML body content |
| `snippet` | string | Plain-text preview (auto-derived from body if omitted) |
| `timestamp` | string | ISO 8601 datetime |
| `read` | boolean | Read status |
| `starred` | boolean | Starred flag |
| `important` | boolean | Important flag |
| `labels` | array | Label IDs referencing `labels[].id` (e.g. `["l1", "l2"]`) |
| `category` | string | Tab: `"primary"`, `"social"`, or `"promotions"` |
| `folder` | string | `"inbox"`, `"sent"`, `"drafts"`, `"spam"`, `"trash"`, `"all-mail"`, `"snoozed"` |
| `attachments` | array | `[{id, name, size, type, url}]` |
| `snoozedUntil` | string | ISO 8601 datetime when snoozed email returns to inbox (only when `folder: "snoozed"`) |

### Settings Object Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `density` | string | `"default"` | Display density: `"default"`, `"comfortable"`, or `"compact"` |
| `undoSend` | number | `10` | Undo send window in seconds: `5`, `10`, `20`, or `30` |
| `signature` | string | `"--\nDemo User\ndemo@example.com"` | Email signature appended to outgoing messages |
| `categoryTabs` | object | `{primary:true, social:true, promotions:true, updates:false, forums:false}` | Which inbox category tabs are enabled |
| `replyBehavior` | string | `"Reply"` | Default reply action: `"Reply"` or `"Reply all"` |
| `language` | string | `"English (US)"` | Display language |
| `sysLabelShown` | object | `{}` | Per-system-label visibility: `{"sys_inbox": true, "sys_spam": false, ...}` |
| `userLabelShown` | object | `{}` | Per-user-label sidebar visibility: `{"l1": true, "l2": false, ...}` |

### Default Labels

| ID | Name | Color |
|----|------|-------|
| `l1` | Work | `#ef4444` (red) |
| `l2` | Personal | `#3b82f6` (blue) |
| `l3` | Travel | `#22c55e` (green) |
| `l4` | Finance | `#eab308` (yellow) |

### Default User

```json
{"userId": "u1", "username": "Demo User", "email": "demo@example.com"}
```

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect | Redirects to `/inbox` |
| `/#/inbox` | EmailList | Primary inbox (category tabs: Primary, Social, Promotions) |
| `/#/starred` | EmailList | Starred emails |
| `/#/important` | EmailList | Important emails |
| `/#/sent` | EmailList | Sent emails |
| `/#/drafts` | EmailList | Draft emails |
| `/#/snoozed` | EmailList | Snoozed emails |
| `/#/spam` | EmailList | Spam emails |
| `/#/trash` | EmailList | Trash emails |
| `/#/all-mail` | EmailList | All mail / Archive |
| `/#/label/:labelId` | EmailList | Emails with a specific label |
| `/#/email/:threadId` | ThreadView | Thread/conversation view |
| `/#/settings` | SettingsPage | Settings (General, Labels, Inbox, Accounts tabs) |
| `/go` | GoRoute | JSON state dump: `{initial_state, current_state, state_diff}` |

All routes except `/go` are wrapped in the Layout component (Header + collapsible Sidebar).

---

## Actions / State Mutations

### Email Actions

| Action | Store Function | Description |
|--------|---------------|-------------|
| Mark read/unread | `bulkUpdateEmails(ids, {read})` | Updates `read` flag on one or many emails |
| Star/unstar | `toggleStar(emailId)` | Toggles `starred` on email |
| Mark important | `toggleImportant(emailId)` | Toggles `important` on email |
| Archive | `archiveEmails(ids)` | Sets `folder: "all-mail"`, shows undo toast |
| Delete | `deleteEmails(ids)` | Moves to `"trash"` (or permanently deletes if already in trash), shows undo toast |
| Move to folder | `bulkUpdateEmails(ids, {folder})` | Moves emails to any folder |
| Report spam | `bulkUpdateEmails(ids, {folder: "spam"})` | Moves to spam folder |
| Empty trash | `emptyTrash()` | Permanently removes all emails with `folder: "trash"` |
| Snooze | `snoozeEmail(emailId, isoDatetime)` | Sets `folder: "snoozed"` and `snoozedUntil`; auto-returns to inbox after the specified time |
| Send email | `sendEmail({to, cc, bcc, subject, body, attachments})` | Creates new email with `folder: "sent"` |
| Reply | `replyToEmail(email, body, isReplyAll, attachments)` | Creates reply in same thread with `folder: "sent"` |
| Forward | `forwardEmail(email)` | Opens ComposeModal pre-filled with forwarded content |
| Save draft | `saveDraft({to, cc, bcc, subject, body, attachments})` | Creates/updates email with `folder: "drafts"` |
| Delete draft | `deleteDraft(id)` | Removes draft email by ID |
| Open draft | `openDraft(emailId)` | Opens draft in ComposeModal for editing |
| Add label | `addLabel(emailId, labelId)` | Appends labelId to `email.labels` |
| Remove label | `removeLabel(emailId, labelId)` | Removes labelId from `email.labels` |

### Label Actions

| Action | Store Function | Description |
|--------|---------------|-------------|
| Create label | `createLabel(name, color)` | Adds new label to `state.labels` |
| Edit label | `updateLabel(labelId, {name, color})` | Updates label name/color in `state.labels` |
| Delete label | `deleteLabel(labelId)` | Removes label from `state.labels` AND removes it from all emails' `labels` arrays |

### Settings Actions

| Action | Store Function | Description |
|--------|---------------|-------------|
| Update settings | `updateSettings(partialSettings)` | Deep-merges `partialSettings` into `state.settings`, persisted via `saveState()` |

Settings changes are stored in `state.settings` and appear in the `/go` endpoint's `state_diff`.

---

## Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `c` | List view | Open compose modal |
| `/` | Anywhere | Focus search input |
| `?` | Anywhere | Open shortcuts modal |
| `j` / `k` | List view | Move focus down/up |
| `Enter` / `o` | List view | Open focused thread |
| `x` | List view | Select/deselect focused email |
| `e` | List/thread | Archive selected/current thread |
| `#` | List/thread | Delete selected/current thread |
| `s` | List/thread | Star/unstar focused or current email |
| `!` | List/thread | Report as spam |
| `r` | Thread view | Open reply box |
| `Shift+r` | Thread view | Open reply-all box |
| `f` | Thread view | Forward latest email |
| `u` | Thread view | Return to email list |
| `Shift+I` | List/thread | Mark as read |
| `Shift+U` | List/thread | Mark as unread |
| `+` / `=` | List/thread | Mark as important |
| `-` | List/thread | Mark as not important |
| `b` | List/thread | Snooze (opens snooze menu) |
| `v` | List/thread | Move to folder (opens move-to menu) |
| `l` | List/thread | Apply label (opens label picker) |
| `z` | Anywhere | Undo last action (triggers toast undo) |
| `g` then `i` | Anywhere | Go to Inbox |
| `g` then `t` | Anywhere | Go to Sent |
| `g` then `d` | Anywhere | Go to Drafts |
| `g` then `s` | Anywhere | Go to Starred |
| `Ctrl+Enter` | Compose modal | Send email |
| `Ctrl+Shift+C` | Compose modal | Show Cc field |
| `Ctrl+Shift+B` | Compose modal | Show Bcc field |
| `Ctrl+k` | Compose body | Insert hyperlink |

---

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "user": {"userId": "u1", "username": "Demo User", "email": "demo@example.com"},
    "emails": [
      {
        "id": "email_1",
        "threadId": "thread_1",
        "from": {"name": "Alice Smith", "email": "alice@company.com"},
        "to": [{"name": "Demo User", "email": "demo@example.com"}],
        "subject": "Q4 Project Roadmap Update",
        "body": "Please review the attached roadmap.",
        "timestamp": "2026-02-09T11:30:00Z",
        "read": false,
        "starred": true,
        "important": true,
        "labels": ["l1"],
        "category": "primary",
        "folder": "inbox",
        "attachments": []
      }
    ],
    "labels": [
      {"id": "l1", "name": "Work", "color": "#ef4444"},
      {"id": "l2", "name": "Personal", "color": "#3b82f6"}
    ],
    "drafts": [],
    "settings": {
      "density": "default",
      "undoSend": 10
    }
  }
}
```

---

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|-------------------|
| Open a thread | `emails[i].read: false → true` (all unread emails in thread auto-marked read) |
| Star/unstar email | `emails[i].starred` toggled |
| Mark as important | `emails[i].important` toggled |
| Move to trash | `emails[i].folder: "inbox" → "trash"` |
| Move to spam | `emails[i].folder: "inbox" → "spam"` |
| Archive email | `emails[i].folder: "inbox" → "all-mail"` |
| Snooze email | `emails[i].folder: "inbox" → "snoozed"`, `emails[i].snoozedUntil` set |
| Send reply/compose | New email object added to `emails` with `folder: "sent"` |
| Save draft | New email object added to `emails` with `folder: "drafts"` |
| Add/remove label | `emails[i].labels` array modified |
| Delete permanently | Email ID removed from `emails` array (appears in `state_diff.deletedEmails`) |
| Update settings | `settings` object updated (appears in `state_diff.settings`) |
| Edit label | `labels[i].name` or `labels[i].color` changed (appears in `state_diff.labels`) |
| Delete label | Label removed from `labels` array; removed from all `emails[i].labels` |
| Create label | New object added to `labels` array |

### state_diff Structure

```json
{
  "newEmails": ["email_id_1"],
  "deletedEmails": ["email_id_2"],
  "modifiedEmails": {
    "email_1": {
      "read": {"from": false, "to": true},
      "folder": {"from": "inbox", "to": "trash"}
    }
  },
  "labels": [...],
  "settings": {
    "density": "compact",
    "undoSend": 30,
    "signature": "...",
    "categoryTabs": {...},
    "replyBehavior": "Reply",
    "language": "English (US)",
    "sysLabelShown": {},
    "userLabelShown": {}
  }
}
```

---

## Compose Modal Behaviors

- **Ctrl+Enter**: Sends the message
- **Ctrl+Shift+C**: Reveals the Cc field
- **Ctrl+Shift+B**: Reveals the Bcc field
- **Ctrl+K**: Opens the insert-link popover in the body
- **Auto-save**: Draft is auto-saved to `emails` (folder `"drafts"`) after 2 seconds of inactivity
- **Signature**: Default signature is pre-inserted on new compose (not on forward/reply)
- **Scheduled send**: ChevronDown dropdown next to Send allows scheduling for tomorrow morning, tomorrow afternoon, or next Monday morning
- **Recipient validation**: Empty `to` field shows inline red "Recipient required" error — no native `alert()` dialogs
- **Attachment upload**: File picker allows attaching files; attachments stored as `{id, name, size, type, url}`

---

## Search Operators

| Operator | Example | Effect |
|----------|---------|--------|
| `from:` | `from:alice` | Filter emails sent from matching address/name |
| `to:` | `to:bob` | Filter emails sent to matching address/name |
| `has:attachment` | `has:attachment` | Filter emails with attachments |
| `is:unread` | `is:unread` | Filter unread emails |
| `is:read` | `is:read` | Filter read emails |
| `in:spam` | `in:spam` | Filter emails in spam folder |
| `in:trash` | `in:trash` | Filter emails in trash folder |
| `in:sent` | `in:sent` | Filter emails in sent folder |
| (free text) | `project update` | Matches subject, sender name, email address, or body |

Multiple operators can be combined: `from:alice has:attachment project`
