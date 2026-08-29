# dingtalk_mock Schema

**Base URL**: `http://localhost:5173/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{current, initial}`

> Note: The `/go` route is handled by **both** the vite server middleware (returns JSON when called programmatically) and a React SPA page at `/go` for browser debugging.

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user (same shape as `users[]`); `isCurrentUser: true` |
| `users` | array | All employees; each: `{id, name, avatar (CSS color hex), title, department, departmentId, phone, email, status, isCurrentUser}` — `status`: `"online"`, `"busy"`, `"away"`, `"offline"` |
| `departments` | array | Org tree nodes; each: `{id, name, parentId, memberCount, order, expanded}` |
| `conversations` | array | Each: `{id, type ("group"\|"dm"), name, avatar, memberIds[], lastMessage{text,senderId,timestamp}, unreadCount, isPinned, isMuted, isGroup, announcement, createdAt}` |
| `messages` | array | Flat list of all messages; each: `{id, conversationId, senderId, type ("text"\|"file"\|"system"), content, timestamp, readBy[], isRecalled, replyTo (msgId\|null), fileName?, fileSize?}` |
| `dingMessages` | array | Each: `{id, senderId, recipientIds[], content, method, timestamp, confirmedBy[], type ("sent"\|"received")}` |
| `approvalForms` | array | Each: `{id, type, title, submitterId, status ("pending"\|"approved"\|"rejected"), createdAt, approverIds[], currentApproverId, fields{}, comments[{userId,text,timestamp,action}]}` |
| `calendarEvents` | array | Each: `{id, title, startTime, endTime, location, creatorId, participantIds[], color, isAllDay, reminder, recurrence, description}` |
| `todoItems` | array | Each: `{id, title, description, completed, dueDate, creatorId, assigneeId, priority ("high"\|"medium"\|"low"), conversationId, createdAt}` |
| `workbenchApps` | array | Each: `{id, name, icon, color, route, category, badge}` |
| `announcements` | array | Each: `{id, title, content, authorId, publishedAt, readBy[], isTop}` |
| `attendanceRecords` | object | `{checkIn, checkOut, history: {[dateStr]: {checkIn, checkOut}}}` |
| `activeTab` | string | Current sidebar tab key (`"messages"`, `"ding"`, `"workbench"`, `"contacts"`, `"calendar"`, `"me"`) |
| `activeConversationId` | string\|null | Currently open conversation id |
| `searchQuery` | string | Current search bar content |
| `dingActiveTab` | string | `"received"` or `"sent"` |
| `approvalActiveTab` | string | `"submitted"`, `"pending"`, or `"cc"` |
| `contactsActiveTab` | string | `"org"`, `"friends"`, or `"groups"` |
| `calendarView` | string | `"day"`, `"week"`, or `"month"` |
| `calendarDate` | string | ISO date string for current calendar position |
| `settings` | object | `{notificationSound, messagePreview, dndEnabled, dndStart, dndEnd, language, fontSize}` |
| `drive` | object | `{folders: [{id, name, modifiedAt, uploaderId}], files: [{id, name, size, modifiedAt, uploaderId}]}` |

### Default IDs

**Users**: `user_001` (张伟, currentUser) through `user_012` (马超)

**Departments**: `dept_root`, `dept_tech`, `dept_frontend`, `dept_backend`, `dept_product`, `dept_design`, `dept_hr`, `dept_finance`, `dept_marketing`

**Conversations**: `conv_001` (前端开发组, group), `conv_002` (项目Alpha讨论组, group), `conv_003` (全员群, group, pinned), `conv_004` (李娜, DM), `conv_005` (赵强, DM), `conv_006` (陈静, DM), `conv_007` (王磊, DM, muted), `conv_008` (刘洋, DM)

**Messages**: `msg_001`–`msg_025`

**DING messages**: `ding_001`–`ding_006` (3 sent by user_001, 3 received)

**Approval forms**: `appr_001`–`appr_006`

**Calendar events**: `evt_001`–`evt_010`

**Todo items**: `todo_001`–`todo_010`

**Announcements**: `ann_001`–`ann_004`

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user_001",
      "name": "张伟",
      "avatar": "#2A83F0",
      "title": "高级前端工程师",
      "department": "前端组",
      "departmentId": "dept_frontend",
      "phone": "138****1234",
      "email": "zhangwei@example.com",
      "status": "online",
      "isCurrentUser": true
    },
    "users": [
      {"id": "user_001", "name": "张伟", "avatar": "#2A83F0", "title": "高级前端工程师", "department": "前端组", "departmentId": "dept_frontend", "status": "online", "isCurrentUser": true},
      {"id": "user_002", "name": "李娜", "avatar": "#F5A623", "title": "产品经理", "department": "产品部", "departmentId": "dept_product", "status": "online", "isCurrentUser": false}
    ],
    "conversations": [
      {
        "id": "conv_004", "type": "dm", "name": "李娜", "avatar": "#F5A623",
        "memberIds": ["user_001", "user_002"],
        "lastMessage": {"text": "你好", "senderId": "user_002", "timestamp": "2024-03-15T09:00:00Z"},
        "unreadCount": 1, "isPinned": false, "isMuted": false, "isGroup": false,
        "announcement": "", "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "messages": [
      {
        "id": "msg_001", "conversationId": "conv_004", "senderId": "user_002",
        "type": "text", "content": "你好", "timestamp": "2024-03-15T09:00:00Z",
        "readBy": ["user_002"], "isRecalled": false, "replyTo": null
      }
    ],
    "dingMessages": [],
    "approvalForms": [],
    "calendarEvents": [],
    "todoItems": [],
    "workbenchApps": [],
    "announcements": [],
    "departments": [],
    "attendanceRecords": {"checkIn": null, "checkOut": null, "history": {}},
    "activeTab": "messages",
    "activeConversationId": "conv_004",
    "searchQuery": "",
    "dingActiveTab": "received",
    "approvalActiveTab": "submitted",
    "contactsActiveTab": "org",
    "calendarView": "week",
    "calendarDate": "2024-03-15T00:00:00Z",
    "settings": {
      "notificationSound": true,
      "messagePreview": true,
      "dndEnabled": false,
      "dndStart": "22:00",
      "dndEnd": "08:00",
      "language": "中文",
      "fontSize": 14
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Send message in conversation | `messages` array grows by 1; `conversations[i].lastMessage` + `unreadCount` updated |
| Auto-reply triggers | `messages` array grows by 1 more; `conversations[i].lastMessage` updated |
| Reply to message | `messages` array grows (new msg has `replyTo` set to quoted msg id) |
| Recall message (within 2 min) | `messages[i].isRecalled` → `true`; `content` → `"[该消息已被撤回]"`; `type` → `"system"` |
| Delete message | `messages` array shrinks by 1 |
| Mark conversation as read | `conversations[i].unreadCount` → 0; affected `messages[].readBy` gains `currentUser.id` |
| Create new DM | `conversations` array grows by 1; if existing DM found, `activeConversationId` updates |
| Create group chat | `conversations` array grows by 1 |
| Pin/unpin conversation | `conversations[i].isPinned` toggled |
| Mute/unmute conversation | `conversations[i].isMuted` toggled |
| Delete conversation | `conversations` array shrinks by 1; `activeConversationId` may → null |
| Update group name | `conversations[i].name` updated |
| Update group announcement | `conversations[i].announcement` updated |
| Send DING | `dingMessages` array grows by 1 (type: "sent") |
| Confirm DING | `dingMessages[i].confirmedBy` gains `currentUser.id` |
| Switch DING tab | `dingActiveTab` → `"received"` or `"sent"` |
| Submit approval form | `approvalForms` array grows by 1 (status: "pending") |
| Approve form | `approvalForms[i].status` → `"approved"` or `"pending"` (if more approvers); `comments` grows |
| Reject form | `approvalForms[i].status` → `"rejected"`; `currentApproverId` → null; `comments` grows |
| Switch approval tab | `approvalActiveTab` → `"submitted"`, `"pending"`, or `"cc"` |
| Toggle todo item | `todoItems[i].completed` toggled |
| Create todo | `todoItems` array grows by 1 |
| Clock in (first click) | `attendanceRecords.checkIn` set; `attendanceRecords.history[today].checkIn` set |
| Clock out (second click) | `attendanceRecords.checkOut` set; `attendanceRecords.history[today].checkOut` set |
| Read announcement | `announcements[i].readBy` gains `currentUser.id` |
| Create calendar event | `calendarEvents` array grows by 1 |
| Delete calendar event | `calendarEvents` array shrinks by 1 |
| Change calendar view | `calendarView` → `"day"`, `"week"`, or `"month"` |
| Navigate calendar | `calendarDate` ISO string updated |
| Toggle department in org tree | `departments[i].expanded` toggled |
| Switch contacts tab | `contactsActiveTab` → `"org"`, `"friends"`, or `"groups"` |
| Update settings toggle | `settings.notificationSound`, `messagePreview`, or `dndEnabled` toggled |
| Change language | `settings.language` → `"中文"` or `"English"` |
| Change font size | `settings.fontSize` → integer (12–18) |
| Switch active sidebar tab | `activeTab` updated |
| Set active conversation | `activeConversationId` updated |
| Search query changes | `searchQuery` updated |
| Forward message to conversation | `messages` array grows by 1 (content prefixed with `[转发]`); `conversations[i].lastMessage` updated |
| Upload file in Cloud Drive | `drive.files` array grows by 1 |
| Create folder in Cloud Drive | `drive.folders` array grows by 1 |
| Delete file in Cloud Drive | `drive.files` array shrinks by 1 |
| Delete folder in Cloud Drive | `drive.folders` array shrinks by 1 |
| Rename file or folder in Cloud Drive | `drive.files[i].name` or `drive.folders[i].name` updated |
