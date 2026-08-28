# contractbook_mock Schema

**Base URL**: `http://localhost:3000/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{initial_state, current_state, state_diff}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user: `{id, firstName, lastName, email, avatar, role, company, jobTitle, phone, timezone, notifications{email,inApp,signingReminders,expirationAlerts}}` |
| `users` | array | Team members; each: `{id, firstName, lastName, email, avatar, role, jobTitle, status}` — `role`: `"admin"`, `"member"`, `"viewer"` |
| `contacts` | array | External contacts; each: `{id, firstName, lastName, email, company, jobTitle, phone, notes, createdAt, updatedAt}` |
| `folders` | array | Contract folders; each: `{id, name, parentId, color, createdAt, createdBy}` — nested via `parentId` |
| `tags` | array | Contract tags; each: `{id, name, color}` |
| `contracts` | array | Each: `{id, title, status, content, folderId, templateId, tags[], parties[], createdAt, updatedAt, createdBy, expiresAt, signedAt, sentAt, value, currency, renewalDate, notes}` — `status`: `"draft"`, `"pending"`, `"signed"`, `"rejected"`, `"expired"` |
| `contracts[].parties[]` | array | Each party: `{id, name, type, signees[]}` — `type`: `"internal"`, `"external"` |
| `contracts[].parties[].signees[]` | array | Each signee: `{id, contactId, userId, name, email, role, signedAt, status, order}` — `status`: `"not_sent"`, `"pending"`, `"signed"`, `"rejected"` |
| `templates` | array | Each: `{id, title, description, content, category, language, tags[], usageCount, createdAt, updatedAt, createdBy, isDefault}` — `category`: `"Service Agreements"`, `"NDAs"`, `"Employment"`, `"Procurement"`, `"Licensing"`, `"Partnerships"`, `"Real Estate"` |
| `tasks` | array | Each: `{id, title, description, type, status, contractId, assigneeId, createdBy, dueDate, completedAt, createdAt}` — `type`: `"review"`, `"approval"`, `"renewal"` — `status`: `"pending"`, `"completed"`, `"overdue"` |
| `activities` | array | Audit log; each: `{id, contractId, type, userId, contactId, description, timestamp, metadata}` — `type`: `"created"`, `"edited"`, `"sent"`, `"signed"`, `"rejected"`, `"viewed"`, `"commented"` |
| `notifications` | array | Each: `{id, type, title, description, contractId, read, createdAt}` — `type`: `"signature_received"`, `"contract_viewed"`, `"task_assigned"`, `"contract_expired"`, `"reminder"`, `"comment"` |
| `comments` | array | Each: `{id, contractId, userId, content, createdAt, updatedAt, resolved}` |
| `savedViews` | array | Each: `{id, name, filters, sortBy, sortOrder, columns[], isDefault, createdBy}` |
| `settings` | object | `{companyName, defaultCurrency, defaultLanguage, emailNotifications, inAppNotifications, signingReminders, expirationAlerts, reminderDays[], timezone}` |

### Default IDs

**Users**: `user-1` (Sarah Chen, currentUser/admin), `user-2` (James Wilson), `user-3` (Emily Rodriguez), `user-4` (Michael Park), `user-5` (Lisa Thompson), `user-6` (David Kim)

**Contacts**: `contact-1` through `contact-8`

**Folders**: `folder-1` (Client Agreements), `folder-2` (Enterprise Clients, child of 1), `folder-3` (SMB Clients, child of 1), `folder-4` (Vendor Contracts), `folder-5` (Employment), `folder-6` (Offer Letters, child of 5), `folder-7` (NDAs, child of 5), `folder-8` (Partnerships)

**Tags**: `tag-1` (High Priority), `tag-2` (Auto-Renew), `tag-3` (Confidential), `tag-4` (Revenue), `tag-5` (Legal Review), `tag-6` (Urgent)

**Contracts**: `contract-1` through `contract-12` — 3 draft, 3 pending, 4 signed, 1 rejected, 1 expired

**Templates**: `template-1` through `template-8`

**Tasks**: `task-1` through `task-6`

**Notifications**: `notif-1` through `notif-8` (3 unread: notif-1, notif-2, notif-3)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user-1",
      "firstName": "Sarah",
      "lastName": "Chen",
      "email": "sarah.chen@acmecorp.com",
      "avatar": null,
      "role": "admin",
      "company": "Acme Corporation",
      "jobTitle": "Head of Legal",
      "phone": "+1 (555) 234-5678",
      "timezone": "America/New_York",
      "notifications": {"email": true, "inApp": true, "signingReminders": true, "expirationAlerts": true}
    },
    "users": [],
    "contacts": [],
    "folders": [],
    "tags": [],
    "contracts": [
      {
        "id": "contract-1",
        "title": "Test Contract",
        "status": "draft",
        "content": "<h2>Agreement</h2><p>This agreement is between the parties.</p>",
        "folderId": null,
        "templateId": null,
        "tags": [],
        "parties": [
          {
            "id": "party-1a",
            "name": "Acme Corporation",
            "type": "internal",
            "signees": [
              {"id": "signee-1a", "contactId": null, "userId": "user-1", "name": "Sarah Chen", "email": "sarah.chen@acmecorp.com", "role": "Authorized Signatory", "signedAt": null, "status": "not_sent", "order": 1}
            ]
          }
        ],
        "createdAt": "2026-04-06T12:00:00Z",
        "updatedAt": "2026-04-09T12:00:00Z",
        "createdBy": "user-1",
        "expiresAt": null,
        "signedAt": null,
        "sentAt": null,
        "value": null,
        "currency": "USD",
        "renewalDate": null,
        "notes": ""
      }
    ],
    "templates": [],
    "tasks": [],
    "activities": [],
    "notifications": [],
    "comments": [],
    "savedViews": [],
    "settings": {
      "companyName": "Acme Corporation",
      "defaultCurrency": "USD",
      "defaultLanguage": "English",
      "emailNotifications": true,
      "inAppNotifications": true,
      "signingReminders": true,
      "expirationAlerts": true,
      "reminderDays": [1, 3, 7],
      "timezone": "America/New_York"
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Create blank contract | `contracts` (new entry with `status:"draft"`) |
| Create contract from template | `contracts` (new entry with `templateId` set, `status:"draft"`), `activities` (new "created" entry) |
| Edit contract content and save | `contracts[id].content`, `contracts[id].updatedAt`, `activities` (new "edited" entry) |
| Edit contract title (click title) | `contracts[id].title`, `contracts[id].updatedAt` |
| Send contract for signature | `contracts[id].status` → `"pending"`, `contracts[id].sentAt`, `contracts[id].parties[].signees[].status` → `"pending"`, `activities` (new "sent"), `notifications` (new reminder) |
| Mark signee as signed | `contracts[id].parties[].signees[].status` → `"signed"`, `contracts[id].parties[].signees[].signedAt`, `activities` (new "signed") |
| All signees signed | `contracts[id].status` → `"signed"`, `contracts[id].signedAt` |
| Signee rejects | `contracts[id].parties[].signees[].status` → `"rejected"`, `contracts[id].status` → `"rejected"`, `activities` (new "rejected") |
| Delete contract | `contracts` (entry removed) |
| Duplicate contract | `contracts` (new entry, `status:"draft"`, title prefixed "Copy of") |
| Move contract to folder | `contracts[id].folderId` |
| Add tag to contract | `contracts[id].tags` (tagId appended) |
| Remove tag from contract | `contracts[id].tags` (tagId removed) |
| Post comment | `comments` (new entry), `activities` (new "commented" entry) |
| Click notification | `notifications[id].read` → `true` |
| Mark all notifications as read | `notifications[*].read` → `true` |
| Create task | `tasks` (new entry) |
| Complete/reopen task (checkbox) | `tasks[id].status`, `tasks[id].completedAt` |
| Add contact | `contacts` (new entry) |
| Edit contact | `contacts[id].*`, `contacts[id].updatedAt` |
| Delete contact | `contacts` (entry removed) |
| Create folder | `folders` (new entry) |
| Rename folder | `folders[id].name` |
| Delete folder | `folders` (entry removed) |
| Save general settings | `settings.companyName`, `settings.defaultCurrency`, `settings.defaultLanguage`, `settings.timezone` |
| Toggle notification setting | `settings.emailNotifications` / `settings.inAppNotifications` / `settings.signingReminders` / `settings.expirationAlerts` |
| Toggle reminder day | `settings.reminderDays` (day added or removed) |
| Collapse/expand sidebar | `localStorage:sidebar_collapsed` (not tracked in state diff) |
| Filter contracts by tab | No state change (UI-only filter) |
| Sort contracts | No state change (UI-only sort) |
| Search (Cmd+K) | No state change (UI-only) |
