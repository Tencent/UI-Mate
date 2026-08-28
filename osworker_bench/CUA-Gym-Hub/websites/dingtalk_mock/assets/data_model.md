# XingTalk Mock — Data Model

> This document defines all entity types, their fields, relationships, and example values for `dataManager.js`.

---

## Entity Types

### 1. User (用户)

The currently logged-in user and all contacts in the organization.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique user ID | `"user_001"` |
| name | string | Display name (Chinese) | `"张伟"` |
| avatar | string | Avatar URL or initials color | `"#2A83F0"` |
| title | string | Job title | `"高级前端工程师"` |
| department | string | Department name | `"技术研发部"` |
| departmentId | string | FK to Department | `"dept_tech"` |
| phone | string | Phone number | `"138****1234"` |
| email | string | Work email | `"zhangwei@example.com"` |
| status | string | Online status: `"online"` / `"offline"` / `"busy"` / `"away"` | `"online"` |
| isCurrentUser | boolean | Whether this is the logged-in user | `true` |

### 2. Department (部门)

Organization hierarchy structure.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique department ID | `"dept_tech"` |
| name | string | Department name | `"技术研发部"` |
| parentId | string\|null | Parent department ID (null = root) | `"dept_root"` |
| memberCount | number | Number of members | `12` |
| order | number | Sort order | `1` |

### 3. Conversation (会话)

A chat thread — either 1:1 DM or group chat.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique conversation ID | `"conv_001"` |
| type | string | `"dm"` / `"group"` | `"group"` |
| name | string | Conversation display name | `"前端开发组"` |
| avatar | string | Group avatar or null (use member avatar for DM) | `"#4CAF50"` |
| memberIds | string[] | Array of user IDs | `["user_001", "user_002"]` |
| lastMessage | object | `{text, senderId, timestamp}` | See Message |
| unreadCount | number | Unread message count | `3` |
| isPinned | boolean | Pinned to top | `false` |
| isMuted | boolean | Notifications muted | `false` |
| isGroup | boolean | Shorthand for type==="group" | `true` |
| announcement | string | Group announcement text (groups only) | `"本周五下午团建"` |
| createdAt | string | ISO timestamp | `"2024-01-15T09:00:00Z"` |

### 4. Message (消息)

Individual messages within a conversation.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique message ID | `"msg_001"` |
| conversationId | string | FK to Conversation | `"conv_001"` |
| senderId | string | FK to User (sender) | `"user_002"` |
| type | string | `"text"` / `"image"` / `"file"` / `"system"` / `"ding"` | `"text"` |
| content | string | Message text or file description | `"项目进度报告已更新"` |
| timestamp | string | ISO timestamp | `"2024-03-15T14:30:00Z"` |
| readBy | string[] | Array of user IDs who read the message | `["user_001"]` |
| isRecalled | boolean | Message has been recalled/deleted | `false` |
| replyTo | string\|null | ID of message being replied to | `null` |
| fileName | string\|null | For file messages: file name | `"Q1报告.xlsx"` |
| fileSize | string\|null | For file messages: human-readable size | `"2.4 MB"` |

### 5. DingMessage (DING消息)

Urgent DING notifications — a unique XingTalk feature.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique DING ID | `"ding_001"` |
| senderId | string | FK to User | `"user_001"` |
| recipientIds | string[] | Target user IDs | `["user_002", "user_003"]` |
| content | string | DING message text | `"请尽快回复客户邮件"` |
| timestamp | string | ISO timestamp | `"2024-03-15T10:00:00Z"` |
| confirmedBy | string[] | User IDs who confirmed/read | `["user_002"]` |
| type | string | `"sent"` / `"received"` | `"sent"` |

### 6. ApprovalForm (审批单)

OA workflow submissions.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique approval ID | `"appr_001"` |
| type | string | `"leave"` / `"expense"` / `"business_trip"` / `"overtime"` / `"purchase"` / `"general"` | `"leave"` |
| title | string | Form title | `"年假申请"` |
| submitterId | string | FK to User who submitted | `"user_001"` |
| status | string | `"pending"` / `"approved"` / `"rejected"` | `"pending"` |
| createdAt | string | ISO timestamp | `"2024-03-14T09:00:00Z"` |
| approverIds | string[] | Ordered list of approver user IDs | `["user_005", "user_006"]` |
| currentApproverId | string | The approver whose turn it is | `"user_005"` |
| fields | object | Form-specific data (see below) | `{}` |
| comments | object[] | `{userId, text, timestamp, action}` | `[]` |

**Leave fields**: `{leaveType: "年假"|"事假"|"病假"|"调休", startDate, endDate, duration: "3天", reason}`
**Expense fields**: `{category: "差旅"|"办公用品"|"招待", amount: 2500, items: [{desc, amount}], receipts: []}`
**Business Trip fields**: `{destination, startDate, endDate, purpose, transportation}`

### 7. CalendarEvent (日程)

Calendar events and meetings.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique event ID | `"evt_001"` |
| title | string | Event title | `"Q1 季度复盘会议"` |
| startTime | string | ISO timestamp | `"2024-03-15T14:00:00Z"` |
| endTime | string | ISO timestamp | `"2024-03-15T15:30:00Z"` |
| location | string | Meeting location or link | `"3楼会议室A"` |
| creatorId | string | FK to User | `"user_005"` |
| participantIds | string[] | Invited user IDs | `["user_001", "user_002"]` |
| color | string | Display color | `"#2A83F0"` |
| isAllDay | boolean | All-day event | `false` |
| reminder | number | Minutes before to remind | `15` |
| recurrence | string\|null | `"daily"` / `"weekly"` / `"monthly"` / `null` | `null` |
| description | string | Event notes | `"请提前准备部门数据"` |

### 8. TodoItem (待办)

Tasks/to-do items.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique todo ID | `"todo_001"` |
| title | string | Task title | `"完成API文档更新"` |
| description | string | Task details | `""` |
| completed | boolean | Done state | `false` |
| dueDate | string\|null | ISO date | `"2024-03-20"` |
| creatorId | string | FK to User | `"user_001"` |
| assigneeId | string | FK to User | `"user_001"` |
| priority | string | `"high"` / `"medium"` / `"low"` | `"medium"` |
| conversationId | string\|null | Linked conversation | `null` |
| createdAt | string | ISO timestamp | `"2024-03-15T09:00:00Z"` |

### 9. WorkbenchApp (工作台应用)

Apps displayed on the workbench grid.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | App ID | `"app_approval"` |
| name | string | Display name | `"审批"` |
| icon | string | Icon identifier or emoji | `"📋"` |
| color | string | Icon background color | `"#FF9800"` |
| route | string | Internal route to navigate to | `"/workbench/approval"` |
| category | string | App category | `"OA"` |
| badge | number | Notification badge count | `2` |

### 10. Announcement (公告)

Company-wide announcements.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| id | string | Unique ID | `"ann_001"` |
| title | string | Announcement title | `"关于五一假期安排的通知"` |
| content | string | Body text | `"根据国家规定..."` |
| authorId | string | FK to User | `"user_006"` |
| publishedAt | string | ISO timestamp | `"2024-03-10T08:00:00Z"` |
| readBy | string[] | User IDs who read it | `["user_001"]` |
| isTop | boolean | Pinned to top | `true` |

---

## Entity Relationships

```
Organization (root)
  └── Department (tree structure via parentId)
       └── User (belongs to department)

User ──┬── sends ──> Message (in Conversation)
       ├── sends ──> DingMessage
       ├── submits ──> ApprovalForm
       ├── creates ──> CalendarEvent
       ├── owns ──> TodoItem
       └── publishes ──> Announcement

Conversation ──> has many Messages
             ──> has many member Users
```

---

## Suggested `createInitialData()` Structure

```javascript
export function createInitialData() {
  return {
    // Current user
    currentUser: { id: "user_001", name: "张伟", ... },

    // All users (10-15 people across departments)
    users: [ ... ],

    // Organization departments (nested tree)
    departments: [
      { id: "dept_root", name: "钉钉科技有限公司", parentId: null },
      { id: "dept_tech", name: "技术研发部", parentId: "dept_root", memberCount: 12 },
      { id: "dept_frontend", name: "前端组", parentId: "dept_tech", memberCount: 5 },
      { id: "dept_backend", name: "后端组", parentId: "dept_tech", memberCount: 4 },
      { id: "dept_product", name: "产品部", parentId: "dept_root", memberCount: 6 },
      { id: "dept_design", name: "设计部", parentId: "dept_root", memberCount: 4 },
      { id: "dept_hr", name: "人力资源部", parentId: "dept_root", memberCount: 3 },
      { id: "dept_finance", name: "财务部", parentId: "dept_root", memberCount: 3 },
      { id: "dept_marketing", name: "市场部", parentId: "dept_root", memberCount: 5 },
    ],

    // Conversations (8-12 conversations mixing DMs and groups)
    conversations: [ ... ],

    // Messages (30-50 messages across conversations)
    messages: [ ... ],

    // DING messages (5-8 items)
    dingMessages: [ ... ],

    // Approval forms (6-10 items in various states)
    approvalForms: [ ... ],

    // Calendar events (8-12 events over current week/month)
    calendarEvents: [ ... ],

    // Todo items (8-12 tasks)
    todoItems: [ ... ],

    // Workbench apps (fixed set of ~12 apps)
    workbenchApps: [
      { id: "app_approval", name: "审批", icon: "📋", color: "#FF9800", route: "/workbench/approval", category: "OA", badge: 2 },
      { id: "app_attendance", name: "考勤打卡", icon: "📍", color: "#4CAF50", route: "/workbench/attendance", category: "OA", badge: 0 },
      { id: "app_calendar", name: "日程", icon: "📅", color: "#2196F3", route: "/calendar", category: "效率", badge: 0 },
      { id: "app_todo", name: "待办", icon: "✅", color: "#9C27B0", route: "/workbench/todo", category: "效率", badge: 3 },
      { id: "app_drive", name: "钉盘", icon: "💾", color: "#00BCD4", route: "/workbench/drive", category: "协作", badge: 0 },
      { id: "app_docs", name: "文档", icon: "📄", color: "#3F51B5", route: "/workbench/docs", category: "协作", badge: 0 },
      { id: "app_log", name: "日志", icon: "📝", color: "#FF5722", route: "/workbench/log", category: "OA", badge: 0 },
      { id: "app_announcement", name: "公告", icon: "📢", color: "#E91E63", route: "/workbench/announcements", category: "OA", badge: 1 },
      { id: "app_meeting", name: "会议", icon: "🎥", color: "#673AB7", route: "/workbench/meeting", category: "协作", badge: 0 },
      { id: "app_live", name: "直播", icon: "📡", color: "#F44336", route: "/workbench/live", category: "协作", badge: 0 },
      { id: "app_report", name: "汇报", icon: "📊", color: "#795548", route: "/workbench/report", category: "OA", badge: 0 },
      { id: "app_contacts", name: "外部联系人", icon: "👥", color: "#607D8B", route: "/contacts", category: "通讯", badge: 0 },
    ],

    // Announcements (3-5 items)
    announcements: [ ... ],

    // UI state
    activeTab: "messages",       // "messages" | "ding" | "workbench" | "contacts" | "me"
    activeConversationId: null,  // currently open conversation
    searchQuery: "",
  };
}
```

### Seed Data Scenarios for Agent Training

**Users** (12 people):
- 张伟 (current user, Senior Frontend Engineer, Tech Dept)
- 李娜 (Product Manager, Product Dept)
- 王磊 (Backend Engineer, Tech Dept)
- 陈静 (UI Designer, Design Dept)
- 赵强 (Tech Lead / Manager, Tech Dept)
- 刘洋 (HR Manager, HR Dept)
- 周敏 (Finance, Finance Dept)
- 吴昊 (Marketing, Marketing Dept)
- 孙丽 (QA Engineer, Tech Dept)
- 黄伟 (Product Designer, Design Dept)
- 杨芳 (Frontend Engineer, Tech Dept — same team)
- 马超 (CEO / General Manager, root dept)

**Conversations** should include:
- 3 group chats (前端开发组, 项目A讨论组, 全员群)
- 4 DM conversations with varying unread counts
- 1 pinned conversation, 1 muted conversation

**Messages** should include:
- Normal text exchanges
- File sharing messages
- System messages (e.g., "赵强 invited 杨芳 to the group")
- Messages with read receipts
- A DING-type urgent message

**Approvals** should include:
- 1 pending leave request (submitted by current user)
- 1 approved expense claim
- 1 rejected business trip
- 1 pending approval waiting for current user to approve
- 1 overtime request

**Calendar events** should span the current week with a mix of meetings, all-day events, and recurring events.
