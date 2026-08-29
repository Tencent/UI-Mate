# docusign_mock Schema

**Deploy order**: 12 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8012)
**Base URL**: `http://172.17.46.46:8012/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}` (use `"merge":true` for partial update)
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`

Note: vite.config.js uses `port: 0` (random). Actual port depends on deployment config. The inject endpoint is `/post`, not `/go`.

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Logged-in user profile |
| `envelopes` | array | All envelopes (9 in default state) |
| `templates` | array | Reusable document templates (4 in default) |
| `folders` | array | Folder organization (2 in default) |
| `contacts` | array | Address book entries (8 in default) |
| `auditLog` | array | System-wide audit trail |

### `user` subfields
- `id`, `name`, `email`, `title`, `company`, `avatar`
- `signatureDataUrl`, `initialsDataUrl` — base64 PNG for signing
- `memberSince` — ISO date string
- `settings`: `{defaultReminderDays, defaultExpirationDays, timezone}`

### `envelopes[]` subfields
- `id`, `subject`, `message`, `status` — status enum: `draft | sent | delivered | signed | completed | voided | declined`
- `createdAt`, `sentAt`, `completedAt`, `voidedAt`, `declinedAt`, `lastActivityAt`, `expiresAt` — ISO timestamps
- `senderId`, `folderId`, `templateId`
- `reminderEnabled`, `reminderDays`, `reminderFrequency`
- `documents[]`: `{id, name, pageCount, order, fileUrl, fileType, fileSize?}` — `fileUrl` is a data URL for user-uploaded files or a picsum URL for mock data
- `recipients[]`: `{id, name, email, role (signer|cc|editor), routingOrder, status (created|sent|delivered|signed|declined), signedAt, viewedAt, deliveredAt, declinedAt, declineReason}`
- `fields[]`: `{id, type (signature|dateSigned|name|initial|title|company|text|email|checkbox|dropdown), recipientId, documentId, pageNumber, x, y, width, height, value, required, label, readOnly, fontSize, fontColor, dropdownOptions?}` — `dropdownOptions` is an array of strings for `dropdown` type fields
- `history[]`: `{id, timestamp, action, actorName, actorEmail, details}`

### `templates[]` subfields
- `id`, `name`, `description`, `createdAt`, `lastUsedAt`, `usageCount`, `ownerId`, `shared`
- `documents[]` — same shape as envelope documents
- `roles[]` — `{id, name, role, routingOrder}` (roles have no email, only name/type)
- `fields[]` — `{...fieldShape, roleId}` where `roleId` references a role in `roles[]`

### `folders[]` subfields
- `id`, `name`, `parentFolder`, `createdAt`

### `contacts[]` subfields
- `id`, `name`, `email`, `company`, `title`

### `auditLog[]` subfields
- `id`, `timestamp`, `action` (e.g. `CREATE_ENVELOPE`, `SEND_ENVELOPE`, `COMPLETE_ENVELOPE`, `VOID_ENVELOPE`, `DECLINE_ENVELOPE`), `details`, `envelopeId`

## Routes

| Route | Description |
|-------|-------------|
| `GET /` | Home dashboard |
| `GET /agreements` | Agreements list (defaults to inbox folder) |
| `GET /agreements/:folder` | Agreements filtered by folder. Valid folder slugs: `inbox`, `sent`, `drafts`, `completed`, `action-required`, `waiting`, `expiring`, `deleted`, or a custom folder `id` |
| `GET /agreements/detail/:id` | Envelope detail view |
| `GET /templates` | Templates list |
| `GET /templates/new/edit` | Create new template (PrepareEnvelope in template mode) |
| `GET /templates/:id/edit` | Edit existing template |
| `GET /prepare/:id` | PrepareEnvelope editor (3-step: documents → recipients → fields) |
| `GET /sign/:id` | SigningRoom — sign a sent envelope |
| `GET /reports` | Analytics and reporting |
| `GET /settings` | User profile and signature settings |
| `GET /go` | Debug endpoint — renders current/initial state and diff as JSON |

## UI Behaviors (after fixes)

### PrepareEnvelope (3-step wizard)

**Step 1 – Add Documents**
- "Upload" button and drag-and-drop zone both open a file input (accepts PDF, DOC, DOCX, PNG, JPG).
- Files are read as data URLs and stored in `envelope.documents`.
- Multiple documents can be added; each gets a unique id.
- "Use a Template" opens a modal that clones documents, roles (as recipients with empty email), and fields from the template into the current envelope.
- Documents can be removed with the trash icon.

**Step 2 – Add Recipients**
- Name validation: name is required.
- Email validation: a valid email address is required for non-template envelopes (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- Role options: `signer` (Needs to Sign), `cc` (Receives a Copy), `editor` (Needs to Edit).
- "Set signing order" toggle reveals up/down reorder arrows on each recipient row; reordering updates `routingOrder` sequentially.
- Address book icon opens a contact search modal using `state.contacts`.
- Template mode accepts roles without email addresses (email field hidden).
- Subject (envelope) and message (optional) are editable in step 2 for non-template mode.

**Step 3 – Place Fields**
- Active recipient selector controls which recipient gets newly placed fields.
- Document selector appears when envelope has more than one document.
- Field palette has two sections: Standard Fields (signature, initial, dateSigned, name, email, company, title) and Data Fields (text, checkbox, dropdown).
- Fields are draggable within the document canvas (uses react-draggable with `bounds="parent"`).
- Selected field shows a properties panel: assigned recipient, document (if multiple docs), required toggle, label/tooltip, dropdown options editor (for `dropdown` type).
- **Send validation**: blocks send if (a) no documents, (b) no recipients, (c) any non-cc recipient has invalid email, (d) no signer recipients. Shows warning (non-blocking) if no fields are placed.
- "Confirm Send" modal shows summary before sending.

**Template mode differences**
- Breadcrumb goes back to `/templates`.
- "Save Template" button instead of "Send".
- Email fields hidden in recipients (roles only).
- Saves to `state.templates` via `createTemplate` or `updateTemplate`.

### SigningRoom
- Document tabs appear at top when envelope has multiple documents; clicking switches which document is displayed.
- Fields are filtered to only show those belonging to the currently displayed document.
- Clicking a `signature` or `initial` field opens the adoption modal (type/draw/upload tabs).
- Clicking a `dropdown` field opens a modal with a `<select>` of configured options.
- Clicking a `text`, `name`, `email`, etc. field opens a text input modal; Save button uses controlled state (no DOM query hacks).
- Progress bar in bottom toolbar shows completed required fields.
- "Finish" button disabled until all required fields are complete.
- Calling `signEnvelope(id, recipientId, fieldValues)` updates the store state.

### EnvelopeDetail
- Message section displayed when `envelope.message` is non-empty.
- "Correct Recipients" modal includes "Add Recipient" button to add new recipients to a sent envelope.
- Recipients that have already signed cannot be removed (no X button shown for signed recipients).

### Reports
- Avg completion time computed from `completedAt - sentAt` of envelopes with both timestamps.
- Completion rate denominator excludes `draft` and `voided` envelopes.
- Monthly bar chart uses real sent/completed counts from `state.envelopes` for the last 6 months.
- "More Info" on each stat card opens a modal with a detailed explanation.
- "Export Report" button shows a toast notification.

### Agreements
- "Expiring Soon" filter correctly excludes `declined` envelopes (in addition to `completed` and `voided`).
- Date range filter chips: "Last 7 days", "Last 30 days", "Last 6 months", "All time".

### Home Page
- "More Info" buttons in "What's New" section open a modal with detailed feature descriptions.

### Layout
- Help icon (?) in header opens a Help Center modal with 5 help topics.

### GoEndpoint (`/go` browser page)
- Diff now uses `{added, modified}` structure to match server-side `/go` endpoint format.

## Observable State Changes (for LLM evaluation)

| User Action | State Field(s) Changed |
|-------------|------------------------|
| Send a draft envelope | `envelopes[i].status` → `"sent"`, `envelopes[i].sentAt` set, `envelopes[i].recipients[j].status` → `"sent"`, `envelopes[i].history` appended, `auditLog` appended |
| Void an envelope | `envelopes[i].status` → `"voided"`, `envelopes[i].voidedAt` set, `history` appended |
| Complete signing (all recipients signed) | `envelopes[i].status` → `"completed"`, `envelopes[i].completedAt` set, `recipients[j].status` → `"signed"`, `recipients[j].signedAt` set, field `value` populated with signature data |
| Move envelope to folder | `envelopes[i].folderId` set to target folder id |
| Update user settings | `user.settings.defaultReminderDays`, `user.settings.defaultExpirationDays`, `user.settings.timezone` |
| Update user profile | `user.name`, `user.title`, `user.company` |
| Update user signature | `user.signatureDataUrl` or `user.initialsDataUrl` set to base64 data URL |
| Create new envelope | `envelopes` array gains new entry with `status: "draft"` |
| Upload document to envelope | `envelopes[i].documents` gains entry with `fileUrl` as data URL |
| Add recipient to envelope | `envelopes[i].recipients` array gains entry |
| Remove recipient from envelope | `envelopes[i].recipients` filtered; their fields removed from `envelopes[i].fields` |
| Place field on document | `envelopes[i].fields` array gains entry |
| Move field | `envelopes[i].fields[j].x`, `envelopes[i].fields[j].y` updated |
| Remove field | `envelopes[i].fields` filtered |
| Use template (from PrepareEnvelope) | Template documents/recipients/fields cloned into current envelope with new UUIDs |
| Create template | `templates` array gains new entry |
| Update template | `templates[i]` updated fields |
| Delete template | `templates` filtered |
| Create folder | `folders` array gains new entry |
| Delete folder | `folders` filtered; envelopes in that folder have `folderId` set to null |
| Correct recipients | `envelopes[i].recipients` updated with new names/emails or new recipient added |
| Sign a field | `envelopes[i].fields[j].value` set (during `signEnvelope` action) |
| Add contact | `contacts` array gains new entry |
| Remove contact | `contacts` filtered |

## State Diff Format

The `/go` endpoint (both server-side and browser `/go` page) returns diffs in this format:

```json
{
  "initial_state": { ... },
  "current_state": { ... },
  "state_diff": {
    "envelopes": { "modified": [ ... ] },
    "templates": { "added": [ ... ] }
  }
}
```

Top-level keys only. `modified` = key existed in initial state but changed. `added` = key is new.

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8012/?sid=task01",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {
          "id": "user_1",
          "name": "Sarah Chen",
          "email": "sarah.chen@acmecorp.com",
          "title": "VP of Operations",
          "company": "Acme Corporation",
          "settings": {"defaultReminderDays": 3, "defaultExpirationDays": 120, "timezone": "America/Los_Angeles"}
        },
        "envelopes": [
          {
            "id": "env_1",
            "subject": "Acme Corp - Q1 Sales Agreement",
            "message": "Please sign at your earliest convenience.",
            "status": "draft",
            "createdAt": "2025-02-10T09:15:00Z",
            "sentAt": null, "completedAt": null, "voidedAt": null, "declinedAt": null,
            "lastActivityAt": "2025-02-10T09:15:00Z", "expiresAt": null,
            "senderId": "user_1", "folderId": null, "templateId": null,
            "reminderEnabled": false, "reminderDays": 3, "reminderFrequency": 2,
            "documents": [{"id": "doc_1_1", "name": "Agreement.pdf", "pageCount": 4, "order": 1, "fileUrl": "https://picsum.photos/seed/doc1/800/1100", "fileType": "pdf"}],
            "recipients": [{"id": "rec_1_1", "name": "Michael Torres", "email": "m.torres@example.com", "role": "signer", "routingOrder": 1, "status": "created", "signedAt": null, "viewedAt": null, "deliveredAt": null, "declinedAt": null, "declineReason": null}],
            "fields": [],
            "history": [{"id": "evt_1_1", "timestamp": "2025-02-10T09:15:00Z", "action": "created", "actorName": "Sarah Chen", "actorEmail": "sarah.chen@acmecorp.com", "details": "Envelope created"}]
          }
        ],
        "templates": [],
        "folders": [],
        "contacts": [],
        "auditLog": []
      }
    }
  }
}
```
