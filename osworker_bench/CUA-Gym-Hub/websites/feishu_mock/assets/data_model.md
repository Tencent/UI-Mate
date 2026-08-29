# Xeishu Mock — Data Model

> This document defines all entity types, their fields, relationships, and realistic seed data for `dataManager.js`.

---

## 1. Users

```js
{
  id: "user_1",                    // String, unique
  name: "张明",                     // String, display name (Chinese)
  englishName: "Zhang Ming",       // String, English name
  avatar: "",                      // String, avatar URL or initials-generated
  email: "zhangming@bytedance.com",
  phone: "138****5678",
  department: "产品研发部",          // String, department name
  title: "高级产品经理",             // String, job title
  status: "online",                // "online" | "busy" | "away" | "offline"
  statusText: "",                  // String, custom status text (e.g., "出差中")
  statusEmoji: "",                 // String, emoji for status
  isCurrentUser: true              // Boolean, marks the logged-in user
}
```

**Seed**: 8-10 users across different departments (产品研发部, 设计部, 市场部, 技术部, 人事部).

---

## 2. Conversations (Chat List)

```js
{
  id: "conv_1",                    // String, unique
  type: "group",                   // "group" | "direct" | "bot"
  name: "产品研发群",               // String, group name (null for DMs)
  avatar: "",                      // String, group avatar
  memberCount: 15,                 // Number, for groups
  members: ["user_1", "user_2"],   // Array<String>, user IDs
  lastMessage: {                   // Object, preview of last message
    content: "好的，明天上午开会讨论",
    senderId: "user_2",
    timestamp: 1712700000000
  },
  unreadCount: 3,                  // Number, unread badge count
  isPinned: false,                 // Boolean, pinned to top
  isMuted: false,                  // Boolean, muted notifications
  isDone: false,                   // Boolean, marked as done/archived
  topNotice: null,                 // String|null, pinned announcement at top of chat
  labels: [],                      // Array<String>, custom labels
  createdAt: 1700000000000
}
```

**Seed**: 12-15 conversations:
- 4-5 group chats (产品研发群, 市场部, Q2 OKR 讨论, 全员群, 项目A-冲刺计划)
- 4-5 direct messages (with different users)
- 1-2 bot conversations (飞书助手, 审批通知)

---

## 3. Messages

```js
{
  id: "msg_1",                     // String, unique
  conversationId: "conv_1",        // String, FK to conversation
  senderId: "user_2",             // String, FK to user
  content: "大家看一下这个方案",     // String, message text
  contentType: "text",             // "text" | "image" | "file" | "card" | "system"
  timestamp: 1712700000000,        // Number, milliseconds
  isEdited: false,                 // Boolean
  reactions: [                     // Array<Object>
    { emoji: "👍", userIds: ["user_1", "user_3"] },
    { emoji: "🎉", userIds: ["user_2"] }
  ],
  threadId: null,                  // String|null, parent msg ID if this is a thread reply
  threadCount: 0,                  // Number, replies count (for parent messages)
  threadLastReply: null,           // Timestamp of last thread reply
  replyTo: null,                   // String|null, msg ID being quoted/replied to
  mentions: ["user_1"],            // Array<String>, @mentioned user IDs
  isRead: true,                    // Boolean
  isPinned: false,                 // Boolean, pinned in chat
  attachments: [],                 // Array<Object>, files/images
  card: null                       // Object|null, for rich card messages (bot cards, approval cards)
}
```

**Seed**: 40-60 messages across all conversations, with a mix of:
- Regular text messages
- Messages with reactions
- Thread conversations (3-5 thread chains with 2-4 replies each)
- @mentions
- 1-2 system messages ("张微 加入了群聊")
- 1-2 card/bot messages (approval notification, meeting reminder)

---

## 4. Documents

```js
{
  id: "doc_1",                     // String, unique
  title: "Q2 产品规划方案",         // String, document title
  type: "doc",                     // "doc" | "sheet" | "bitable" | "mindmap" | "slides"
  icon: "📄",                      // String, type icon
  ownerId: "user_1",              // String, FK to user
  collaborators: ["user_2"],       // Array<String>, user IDs with access
  content: "# Q2 产品规划\n\n## 1. 目标...", // String, markdown-ish content
  spaceId: "space_1",             // String|null, FK to space
  parentId: null,                  // String|null, FK to parent folder/doc
  isStar: false,                   // Boolean, starred/favorited
  lastEditedBy: "user_1",
  lastEditedAt: 1712600000000,
  createdAt: 1710000000000,
  viewCount: 42,
  wordCount: 1580
}
```

**Seed**: 10-12 documents:
- 3-4 in "我的空间" (My Space)
- 3-4 in "共享空间" (Shared Space)
- 2-3 in "知识库" (Wiki)
- Mix of doc, sheet, bitable types

---

## 5. Spaces (Drive/Cloud)

```js
{
  id: "space_1",
  name: "我的空间",                 // "我的空间" | "共享空间" | wiki name
  type: "personal",                // "personal" | "shared" | "wiki"
  ownerId: "user_1",
  documents: ["doc_1", "doc_2"],   // Array<String>, doc IDs
  icon: "📁"
}
```

---

## 6. Calendar Events

```js
{
  id: "event_1",                   // String, unique
  title: "产品评审会议",            // String, event title
  description: "讨论Q2产品方案",    // String
  startTime: 1712750400000,        // Number, milliseconds
  endTime: 1712754000000,          // Number, milliseconds (1 hour later)
  isAllDay: false,                 // Boolean
  location: "会议室A301",           // String
  meetingLink: "",                 // String, video meeting URL
  organizerId: "user_1",          // String, FK to user
  attendees: [                     // Array<Object>
    { userId: "user_1", status: "accepted" },
    { userId: "user_2", status: "accepted" },
    { userId: "user_3", status: "pending" }
  ],
  color: "#3370FF",                // String, hex color
  reminder: 15,                    // Number, minutes before
  isRecurring: false,
  calendarId: "cal_1"             // String, FK to calendar
}
```

**Seed**: 8-10 events across the current week:
- 3-4 meetings (产品评审, 周会, 1:1, 技术方案讨论)
- 1-2 all-day events (团建活动, 发版日)
- 1-2 personal events (午餐, 健身)

---

## 7. Calendars

```js
{
  id: "cal_1",
  name: "我的日历",                 // String
  color: "#3370FF",
  isDefault: true,
  isVisible: true,
  ownerId: "user_1"
}
```

**Seed**: 3 calendars (我的日历, 团队日历, 中国节假日)

---

## 8. Contacts / Organization

```js
// Department
{
  id: "dept_1",
  name: "产品研发部",
  parentId: null,                  // String|null, parent department
  memberIds: ["user_1", "user_2"],
  headId: "user_1"                 // String, department head
}
```

**Seed**: 4-5 departments forming a tree:
- 公司总部
  - 产品研发部
  - 设计部
  - 市场部
  - 技术部

---

## 9. Tasks (Todo)

```js
{
  id: "task_1",
  title: "完成产品需求文档",
  description: "需要在周五前完成PRD初稿",
  status: "in_progress",           // "todo" | "in_progress" | "done"
  priority: "high",                // "high" | "medium" | "low"
  assigneeId: "user_1",
  creatorId: "user_2",
  dueDate: 1712836800000,
  tags: ["产品", "Q2"],
  relatedDocId: "doc_1",          // String|null
  relatedConvId: "conv_1",        // String|null
  createdAt: 1712500000000,
  completedAt: null
}
```

**Seed**: 6-8 tasks with various statuses and priorities.

---

## 10. Approvals

```js
{
  id: "approval_1",
  type: "leave",                   // "leave" | "expense" | "procurement" | "travel"
  title: "年假申请 - 张明",
  status: "pending",               // "pending" | "approved" | "rejected"
  applicantId: "user_1",
  approverId: "user_4",
  details: {
    leaveType: "年假",
    startDate: "2024-04-15",
    endDate: "2024-04-16",
    reason: "个人事务"
  },
  createdAt: 1712600000000,
  updatedAt: null
}
```

**Seed**: 3-4 approvals (1 pending, 1 approved, 1 rejected).

---

## Relationships Summary

```
User ──┬── Conversation (members)
       ├── Message (sender)
       ├── Document (owner/collaborator)
       ├── CalendarEvent (organizer/attendee)
       ├── Task (assignee/creator)
       ├── Approval (applicant/approver)
       └── Department (member)

Conversation ── Message (1:many)
Document ── Space (many:1)
CalendarEvent ── Calendar (many:1)
Message ── Message (thread parent → replies)
```

---

## createInitialData() Structure

```js
export function createInitialData() {
  return {
    currentUser: { /* user_1 object, isCurrentUser: true */ },
    users: [ /* 8-10 user objects */ ],
    conversations: [ /* 12-15 conversation objects, sorted by lastMessage.timestamp desc */ ],
    messages: {
      // Keyed by conversationId for efficient lookup
      "conv_1": [ /* messages array */ ],
      "conv_2": [ /* messages array */ ],
      // ...
    },
    documents: [ /* 10-12 document objects */ ],
    spaces: [ /* 3 space objects */ ],
    calendars: [ /* 3 calendar objects */ ],
    events: [ /* 8-10 event objects */ ],
    departments: [ /* 4-5 department objects */ ],
    tasks: [ /* 6-8 task objects */ ],
    approvals: [ /* 3-4 approval objects */ ],
    // UI state
    activeConversationId: "conv_1",
    activeModule: "messenger",     // "messenger" | "calendar" | "docs" | "contacts" | "workbench"
    searchQuery: "",
    threadPanelMessageId: null,
    sidebarCollapsed: false
  };
}
```
