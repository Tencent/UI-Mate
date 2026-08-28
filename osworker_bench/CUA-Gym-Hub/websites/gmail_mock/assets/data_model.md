# Xmail Mock — Data Model

## Entity Types

### User (singleton — the logged-in user)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `userId` | string | `"u1"` | Fixed ID |
| `username` | string | `"Demo User"` | Display name |
| `email` | string | `"demo@example.com"` | Primary email |
| `avatar` | string | `"https://picsum.photos/100/100?random=user1"` | Profile photo URL |

### Email

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"email_1"` | Unique email ID |
| `threadId` | string | `"thread_1"` | Groups emails into conversations |
| `from` | Contact | `{ name, email, avatar }` | Sender info |
| `to` | Contact[] | `[{ name, email }]` | Recipients |
| `cc` | Contact[] | `[]` | Carbon copy |
| `bcc` | Contact[] | `[]` | Blind carbon copy |
| `subject` | string | `"Q4 Project Roadmap Update"` | Email subject line |
| `body` | string (HTML) | `"<p>Hello...</p>"` | HTML body content |
| `snippet` | string | `"Hello, please review..."` | Plain-text preview (~100 chars) |
| `timestamp` | ISO 8601 | `"2026-02-09T11:30:00Z"` | Send/receive time |
| `read` | boolean | `false` | Read status |
| `starred` | boolean | `true` | Star flag |
| `important` | boolean | `false` | Important marker |
| `snoozedUntil` | ISO 8601 \| null | `null` | Snooze return time |
| `labels` | string[] | `["l1", "l4"]` | Array of label IDs |
| `category` | enum | `"primary"` | One of: `primary`, `social`, `promotions`, `updates`, `forums` |
| `folder` | enum | `"inbox"` | One of: `inbox`, `sent`, `drafts`, `spam`, `trash`, `all-mail`, `snoozed` |
| `attachments` | Attachment[] | `[...]` | File attachments |

### Contact (embedded, not standalone)

| Field | Type | Example |
|-------|------|---------|
| `name` | string | `"Alice Smith"` |
| `email` | string | `"alice@company.com"` |
| `avatar` | string (optional) | `"https://..."` (only on `from`) |

### Label

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `id` | string | `"l1"` | Unique label ID |
| `name` | string | `"Work"` | Display name |
| `color` | string (hex) | `"#ef4444"` | Badge/dot color |

### Attachment (embedded in Email)

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"attach_1"` |
| `name` | string | `"roadmap_q4.pdf"` |
| `size` | string | `"2.4 MB"` |
| `type` | string | `"pdf"` |
| `url` | string | `"https://picsum.photos/400/300?random=attach1"` |

---

## Relationships

```
User (1) ←→ (many) Email.from   (when folder=sent or folder=drafts)
Email (many) → (many) Label      (via email.labels[] containing label.id)
Email (many) → (1) Thread        (via email.threadId — threads are implicit groups)
Email (1) → (many) Attachment    (embedded array)
```

- **Threads** are not a separate entity — they are an implicit grouping of emails sharing the same `threadId`
- **Drafts** are regular emails with `folder: 'drafts'`
- **Sent mail** has `folder: 'sent'` and `from` = current user

---

## State Shape (`createInitialData()` / `createDefaultData()`)

```javascript
{
  user: User,                    // Singleton current user
  emails: Email[],               // All emails (inbox, sent, drafts, spam, trash)
  labels: Label[],               // Custom user labels
  // settings: Settings          // Future: user preferences
}
```

### Current Default Data Summary

| Entity | Count | Scenarios Covered |
|--------|-------|-------------------|
| **User** | 1 | `Demo User <demo@example.com>` |
| **Labels** | 4 | Work (red), Personal (blue), Travel (green), Finance (yellow) |
| **Emails** | 14 | See breakdown below |

### Email Breakdown

| Thread | Messages | From | Subject | Scenarios |
|--------|----------|------|---------|-----------|
| thread_1 | 1 | Alice Smith | Q4 Project Roadmap Update | Unread, starred, important, has attachment, Work label |
| thread_2 | 3 | Bob Jones ↔ Demo | Lunch tomorrow? | Multi-message conversation, Personal label, mix of read/unread |
| thread_hr | 1 | HR Department | Benefits Enrollment - Action Required | Unread, important, Work label, has attachment |
| thread_budget | 4 | Sarah/Mike/Lisa/Demo | Q1 Budget Discussion | 4-person thread, Work+Finance labels, mix of read/sent |
| thread_social_1 | 1 | LinkedIn | You appeared in 5 searches | Social category, unread |
| thread_promo_1 | 1 | Amazon | Your order has shipped | Promotions category, read |
| thread_spam_1 | 1 | Prince Henry | URGENT BUSINESS PROPOSAL | Spam folder |
| thread_trash_1 | 1 | Newsletter | Weekly Digest | Trash folder, read |

---

## Suggested Additional Mock Data

To make the app feel more realistic for agent training, consider adding:

### More inbox variety
- An email with multiple large attachments (images, spreadsheet)
- A newsletter-style email in Promotions with HTML formatting
- 2-3 more Social category emails (Twitter, Facebook notifications)
- An Updates category email (shipping notification, account alert)
- A Forums category email (Google Groups, mailing list)

### Additional threads for depth
- A longer thread (6-8 messages) to test scroll in ThreadView
- An email from the current user (Demo) that was starred
- A draft email with partially filled fields (to test draft resume)

### Contact variety
- At least 8-10 distinct senders for a realistic inbox
- Some senders with similar names (for search testing)

---

## normalizeEmail() Contract

When custom state is POSTed via `/post`, each email object is run through `normalizeEmail(email, index)` which ensures all required fields exist with sensible defaults:

```javascript
{
  id:          email.id || `email_custom_${index}`,
  threadId:    email.threadId || email.id || `thread_custom_${index}`,
  from:        email.from || { name: 'Unknown', email: 'unknown@example.com' },
  to:          email.to || [],
  cc:          email.cc || [],
  bcc:         email.bcc || [],
  subject:     email.subject || '(No Subject)',
  body:        email.body || '',
  snippet:     email.snippet || stripHtml(email.body).slice(0, 100),
  timestamp:   email.timestamp || email.date || new Date().toISOString(),
  read:        email.read ?? false,
  starred:     email.starred ?? false,
  important:   email.important ?? false,
  snoozedUntil: email.snoozedUntil || null,
  labels:      email.labels || [],
  category:    email.category || 'primary',
  folder:      email.folder || 'inbox',
  attachments: email.attachments || [],
}
```

This means the POST API accepts partial email objects — only `subject` and `from` are truly needed for a useful email.
