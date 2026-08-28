# Xutlook Web Mock — Data Model

This document defines all entity types, their fields, relationships, and realistic example values for `dataManager.js`.

---

## 1. User (Current Logged-In User)

The app always starts pre-logged-in as this user.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique user ID | `"user-1"` |
| displayName | string | Full name | `"Katy Reid"` |
| email | string | Primary email address | `"katyreid@outlook.com"` |
| initials | string | Avatar initials | `"KR"` |
| avatarColor | string | Background color for initials avatar | `"#0078D4"` |
| jobTitle | string | Job title | `"Product Manager"` |
| company | string | Company name | `"Contoso Ltd"` |
| timezone | string | User timezone | `"America/New_York"` |
| signature | string (HTML) | Default email signature | `"<p>Best regards,<br>Katy Reid</p>"` |

---

## 2. MailFolder

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique folder ID | `"folder-inbox"` |
| displayName | string | Folder name | `"Inbox"` |
| parentFolderId | string\|null | Parent folder ID (null for root) | `null` |
| wellKnownName | string\|null | System folder identifier | `"inbox"` |
| totalItemCount | number | Total messages in folder | `24` |
| unreadItemCount | number | Unread message count | `5` |
| isSystem | boolean | Whether this is a built-in folder | `true` |
| icon | string | Icon name for display | `"inbox"` |
| childFolders | string[] | IDs of child folders | `[]` |
| isFavorite | boolean | Whether pinned to Favorites | `true` |

### Default Folders (well-known names)

```javascript
const defaultFolders = [
  { id: "folder-inbox", displayName: "Inbox", wellKnownName: "inbox", icon: "inbox", isFavorite: true },
  { id: "folder-drafts", displayName: "Drafts", wellKnownName: "drafts", icon: "drafts", isFavorite: false },
  { id: "folder-sentitems", displayName: "Sent Items", wellKnownName: "sentitems", icon: "send", isFavorite: false },
  { id: "folder-deleteditems", displayName: "Deleted Items", wellKnownName: "deleteditems", icon: "trash", isFavorite: false },
  { id: "folder-junkemail", displayName: "Junk Email", wellKnownName: "junkemail", icon: "warning", isFavorite: false },
  { id: "folder-archive", displayName: "Archive", wellKnownName: "archive", icon: "archive", isFavorite: false },
  // Custom folders
  { id: "folder-expenses", displayName: "Expenses", wellKnownName: null, icon: "folder", isFavorite: true, parentFolderId: "folder-inbox" },
  { id: "folder-invoices", displayName: "Invoices", wellKnownName: null, icon: "folder", isFavorite: true, parentFolderId: "folder-inbox" },
  { id: "folder-projects", displayName: "Projects", wellKnownName: null, icon: "folder", isFavorite: false },
];
```

---

## 3. Message

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique message ID | `"msg-001"` |
| conversationId | string | Conversation thread ID | `"conv-001"` |
| parentFolderId | string | Folder this message belongs to | `"folder-inbox"` |
| subject | string | Email subject line | `"Surprise Birthday Planning"` |
| bodyPreview | string | First ~255 chars of body (plain text) | `"Hi Katy, I wanted to discuss..."` |
| body | object | `{ contentType: "html"|"text", content: string }` | `{ contentType: "html", content: "<p>Hi Katy...</p>" }` |
| from | object | `{ name: string, email: string }` | `{ name: "Elvia Atkins", email: "elvia@outlook.com" }` |
| sender | object | Same as from (usually) | `{ name: "Elvia Atkins", email: "elvia@outlook.com" }` |
| toRecipients | array | `[{ name: string, email: string }]` | `[{ name: "Katy Reid", email: "katyreid@outlook.com" }]` |
| ccRecipients | array | CC recipients | `[]` |
| bccRecipients | array | BCC recipients | `[]` |
| replyTo | array | Reply-to addresses | `[]` |
| receivedDateTime | string (ISO 8601) | When message was received | `"2025-03-09T08:31:00Z"` |
| sentDateTime | string (ISO 8601) | When message was sent | `"2025-03-09T08:30:45Z"` |
| isRead | boolean | Whether message has been read | `false` |
| isDraft | boolean | Whether message is a draft | `false` |
| importance | string | `"low"` \| `"normal"` \| `"high"` | `"normal"` |
| flag | object | `{ flagStatus: "notFlagged"|"flagged"|"complete" }` | `{ flagStatus: "notFlagged" }` |
| categories | string[] | Array of category names | `["Blue category"]` |
| hasAttachments | boolean | Whether message has attachments | `false` |
| attachments | array | Array of Attachment objects | `[]` |
| inferenceClassification | string | `"focused"` \| `"other"` | `"focused"` |
| isPinned | boolean | Whether pinned to top | `false` |
| isStarred | boolean | Whether starred/flagged in UI | `false` |

### Example Messages (Seed Data)

```javascript
const sampleMessages = [
  {
    id: "msg-001",
    conversationId: "conv-001",
    parentFolderId: "folder-inbox",
    subject: "Surprise Birthday Planning",
    bodyPreview: "Hi Katy, I wanted to reach out about planning a surprise birthday party for Marcus next Friday...",
    body: {
      contentType: "html",
      content: "<p>Hi Katy,</p><p>I wanted to reach out about planning a surprise birthday party for Marcus next Friday. I was thinking we could book the conference room and order a cake from that bakery on 5th street.</p><p>Can you help coordinate the guest list? I've already invited the design team.</p><p>Let me know what you think!</p><p>Best,<br>Elvia</p>"
    },
    from: { name: "Elvia Atkins", email: "elvia.atkins@outlook.com" },
    sender: { name: "Elvia Atkins", email: "elvia.atkins@outlook.com" },
    toRecipients: [{ name: "Katy Reid", email: "katyreid@outlook.com" }],
    ccRecipients: [],
    bccRecipients: [],
    receivedDateTime: "2025-03-09T08:31:00Z",
    sentDateTime: "2025-03-09T08:30:45Z",
    isRead: false,
    isDraft: false,
    importance: "normal",
    flag: { flagStatus: "notFlagged" },
    categories: [],
    hasAttachments: false,
    attachments: [],
    inferenceClassification: "focused",
    isPinned: true
  },
  // More messages defined in createInitialData()
];
```

---

## 4. Attachment

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique attachment ID | `"att-001"` |
| name | string | File name | `"Q4_Report.pdf"` |
| contentType | string | MIME type | `"application/pdf"` |
| size | number | File size in bytes | `245760` |
| isInline | boolean | Whether inline (embedded image) | `false` |

---

## 5. CalendarEvent

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique event ID | `"evt-001"` |
| subject | string | Event title | `"Team Standup"` |
| body | object | `{ contentType: string, content: string }` | `{ contentType: "html", content: "<p>Weekly standup</p>" }` |
| start | object | `{ dateTime: string, timeZone: string }` | `{ dateTime: "2025-03-10T09:00:00", timeZone: "America/New_York" }` |
| end | object | `{ dateTime: string, timeZone: string }` | `{ dateTime: "2025-03-10T09:30:00", timeZone: "America/New_York" }` |
| location | object | `{ displayName: string }` | `{ displayName: "Conference Room A" }` |
| isAllDay | boolean | All-day event | `false` |
| isCancelled | boolean | Whether cancelled | `false` |
| organizer | object | `{ name: string, email: string }` | `{ name: "Katy Reid", email: "katyreid@outlook.com" }` |
| attendees | array | `[{ name, email, status: "accepted"|"declined"|"tentative"|"none" }]` | `[{ name: "Marcus Chen", email: "marcus@outlook.com", status: "accepted" }]` |
| importance | string | `"low"` \| `"normal"` \| `"high"` | `"normal"` |
| showAs | string | `"free"` \| `"tentative"` \| `"busy"` \| `"oof"` \| `"workingElsewhere"` | `"busy"` |
| sensitivity | string | `"normal"` \| `"personal"` \| `"private"` \| `"confidential"` | `"normal"` |
| categories | string[] | Category labels | `[]` |
| isOnlineMeeting | boolean | Has Teams/online link | `false` |
| onlineMeetingUrl | string\|null | Meeting URL | `null` |
| recurrence | object\|null | Recurrence pattern | `null` |
| calendarId | string | Which calendar this belongs to | `"cal-default"` |
| color | string | Display color (hex) | `"#0078D4"` |
| reminderMinutesBefore | number | Reminder offset | `15` |
| hasAttachments | boolean | Has attachments | `false` |
| responseStatus | string | User's RSVP status | `"organizer"` |

---

## 6. Calendar

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique calendar ID | `"cal-default"` |
| name | string | Calendar name | `"Calendar"` |
| color | string | Calendar color (hex) | `"#0078D4"` |
| isDefault | boolean | Whether this is the default calendar | `true` |
| isVisible | boolean | Whether shown in calendar view | `true` |
| canEdit | boolean | Whether user can add/edit events | `true` |

### Default Calendars

```javascript
const defaultCalendars = [
  { id: "cal-default", name: "Calendar", color: "#0078D4", isDefault: true, isVisible: true, canEdit: true },
  { id: "cal-holidays", name: "United States holidays", color: "#107C10", isDefault: false, isVisible: true, canEdit: false },
  { id: "cal-birthdays", name: "Birthdays", color: "#FF8C00", isDefault: false, isVisible: true, canEdit: false },
];
```

---

## 7. Contact

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique contact ID | `"contact-001"` |
| displayName | string | Full display name | `"Elvia Atkins"` |
| givenName | string | First name | `"Elvia"` |
| surname | string | Last name | `"Atkins"` |
| emailAddresses | array | `[{ address: string, name: string }]` | `[{ address: "elvia.atkins@outlook.com", name: "Elvia Atkins" }]` |
| businessPhones | string[] | Work phone numbers | `["+1 (555) 123-4567"]` |
| mobilePhone | string\|null | Mobile number | `"+1 (555) 987-6543"` |
| homePhones | string[] | Home phone numbers | `[]` |
| jobTitle | string\|null | Job title | `"UX Designer"` |
| companyName | string\|null | Company name | `"Contoso Ltd"` |
| department | string\|null | Department | `"Design"` |
| officeLocation | string\|null | Office location | `"Building 4, Room 201"` |
| businessAddress | object\|null | `{ street, city, state, postalCode, country }` | `null` |
| homeAddress | object\|null | Same as above | `null` |
| birthday | string\|null | ISO date | `"1990-06-15"` |
| personalNotes | string | Notes about contact | `""` |
| initials | string | Avatar initials | `"EA"` |
| avatarColor | string | Avatar background color | `"#8764B8"` |
| isFavorite | boolean | Frequent/favorite contact | `true` |
| categories | string[] | Categories | `[]` |

---

## 8. Category

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique category ID | `"cat-blue"` |
| displayName | string | Category label | `"Blue category"` |
| color | string | Color hex value | `"#0078D4"` |
| presetIndex | number | Xutlook preset index (0-24) | `0` |

### Default Categories

```javascript
const defaultCategories = [
  { id: "cat-blue", displayName: "Blue category", color: "#0078D4", presetIndex: 0 },
  { id: "cat-green", displayName: "Green category", color: "#107C10", presetIndex: 1 },
  { id: "cat-orange", displayName: "Orange category", color: "#FF8C00", presetIndex: 2 },
  { id: "cat-purple", displayName: "Purple category", color: "#8764B8", presetIndex: 3 },
  { id: "cat-red", displayName: "Red category", color: "#D13438", presetIndex: 4 },
  { id: "cat-yellow", displayName: "Yellow category", color: "#FFB900", presetIndex: 5 },
];
```

---

## 9. Settings

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| readingPanePosition | string | `"right"` \| `"bottom"` \| `"off"` | `"right"` |
| density | string | `"full"` \| `"medium"` \| `"compact"` | `"medium"` |
| conversationView | boolean | Group messages by conversation | `true` |
| focusedInbox | boolean | Enable Focused/Other tabs | `true` |
| autoReply | object | `{ enabled: boolean, internalMessage: string, externalMessage: string }` | `{ enabled: false, internalMessage: "", externalMessage: "" }` |
| signature | object | `{ name: string, html: string, useForNew: boolean, useForReply: boolean }` | see below |
| theme | string | `"light"` \| `"dark"` | `"light"` |
| previewText | boolean | Show body preview in message list | `true` |
| weekStart | string | Day week starts | `"Sunday"` |
| workingHours | object | `{ start: string, end: string, days: number[] }` | `{ start: "08:00", end: "17:00", days: [1,2,3,4,5] }` |

---

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    user: { /* User object */ },
    folders: [ /* Array of MailFolder objects */ ],
    messages: [ /* Array of Message objects — ~25-30 messages across folders */ ],
    calendars: [ /* Array of Calendar objects */ ],
    events: [ /* Array of CalendarEvent objects — ~15-20 events spanning 2 weeks */ ],
    contacts: [ /* Array of Contact objects — ~15-20 contacts */ ],
    categories: [ /* Array of Category objects */ ],
    settings: { /* Settings object */ },

    // UI state
    selectedFolderId: "folder-inbox",
    selectedMessageId: null,
    selectedModule: "mail", // "mail" | "calendar" | "people"
    calendarView: "month", // "day" | "workweek" | "week" | "month"
    calendarDate: new Date().toISOString(), // Current viewed date
    searchQuery: "",
    composeState: null, // null or compose draft object
    settingsOpen: false,
    settingsSection: "accounts",
  };
}
```

---

## Seed Data Requirements

### Messages (~30 total, distributed across folders)
- **Inbox (Focused)**: 12-15 messages from various senders, mix of read/unread, some with attachments, varying importance, some flagged, some pinned, spanning last 7 days
- **Inbox (Other)**: 5-7 messages (newsletters, promotions, notifications)
- **Drafts**: 2 draft messages (partially composed)
- **Sent Items**: 5-6 sent messages
- **Deleted Items**: 2-3 deleted messages
- **Junk Email**: 2 spam-like messages
- **Custom folders (Expenses, Invoices)**: 2-3 messages each

### Calendar Events (~18 total)
- 5-6 recurring weekday events (standups, 1:1s, team meetings)
- 3-4 one-time events this week
- 2-3 all-day events (holidays, out-of-office)
- 2 past events (last week)
- 2-3 future events (next week)
- 1 cancelled event
- Mix of: organizer events, attendee events, accepted/tentative/pending status

### Contacts (~18 total)
- 8-10 colleagues at same company (Contoso Ltd)
- 3-4 external business contacts
- 3-4 personal contacts
- Include variety: with/without phone, with/without company, with/without job title
- Some marked as favorites

### Realistic Sender/Contact Names
Use a consistent set of names across messages, events, and contacts:
```
Elvia Atkins, Marcus Chen, Lydia Bauer, Daisy Phillips, Amanda Brady,
Contoso Airlines (airline@contoso.com), Margie's Travel (bookings@margiestravel.com),
Kevin Thompson, Shannon Trine, Kristin Patterson, Alex Wilber,
Megan Bowen, Adele Vance, Pradeep Gupta, Nestor Wilke,
Isaiah Langer, Lee Gu, Johanna Lorenz, Miriam Graham
```
