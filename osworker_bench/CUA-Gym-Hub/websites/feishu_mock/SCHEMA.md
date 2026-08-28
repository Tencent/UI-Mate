# feishu_mock Schema

**Deploy order**: 34 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8034)
**Base URL**: `http://localhost:3000/` (dev) · `https://cua-gym-xeishu.xlang.ai/` (prod)
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files:[{original_name, stored_name, size, content_type, url}]}`
**Serve file**: `GET /files/<sid>/<filename>`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user (same shape as users[]); fields: `id, name, englishName, avatar, avatarColor, initials, email, phone, department, title, status, statusText, statusEmoji, isCurrentUser` |
| `users` | array | All workspace members; `status` can be `"online"`, `"busy"`, `"away"`, `"offline"` |
| `conversations` | array | Each: `{id, type ("group"\|"direct"\|"bot"), name, avatar, memberCount, members[], lastMessage{content,senderId,timestamp}, unreadCount, isPinned, isMuted, isDone, topNotice, labels[], createdAt}` |
| `messages` | object | Keyed by conversationId → array of messages; each: `{id, conversationId, senderId, content, contentType ("text"\|"image"\|"file"\|"card"\|"system"), timestamp, isEdited, reactions[{emoji, userIds[]}], threadId\|null, threadCount, threadLastReply, replyTo, mentions[], isRead, isPinned, attachments[], card{title,body,color,actions[]}\|null}` |
| `documents` | array | Each: `{id, title, type ("doc"\|"sheet"\|"bitable"), icon, ownerId, collaborators[], content, spaceId, parentId, isStar, lastEditedBy, lastEditedAt, createdAt, viewCount, wordCount}` |
| `spaces` | array | Each: `{id, name, type}` |
| `calendars` | array | Each: `{id, name, color, isVisible, ownerId}` |
| `events` | array | Each: `{id, title, description, startTime, endTime, isAllDay, location, meetingLink, organizerId, attendees[{userId, status}], color, reminder, isRecurring, calendarId}` |
| `departments` | array | Each: `{id, name, parentId\|null, memberIds[], headId}` |
| `tasks` | array | Each: `{id, title, description, status ("todo"\|"in_progress"\|"done"), priority ("high"\|"medium"\|"low"), assigneeId, creatorId, dueDate, tags[], relatedDocId, relatedConvId, createdAt, completedAt}` |
| `approvals` | array | Each: `{id, type ("leave"\|"expense"\|"travel"\|"procurement"), title, status ("pending"\|"approved"\|"rejected"), applicantId, approverId, details{}, createdAt, updatedAt, comment}` |
| `activeConversationId` | string | Currently open conversation ID |
| `activeModule` | string | Active sidebar module (`"messenger"`, `"calendar"`, etc.) |
| `searchQuery` | string | Current global search text |
| `threadPanelMessageId` | string\|null | Message ID whose thread panel is open; null = closed |
| `sidebarCollapsed` | boolean | Whether icon sidebar is collapsed |
| `favorites` | array | Bookmarked messages; each: `{messageId, conversationId, timestamp}` |
| `activeContactId` | string\|null | Currently highlighted contact ID (from global search navigation) |
| `settings` | object | User preferences; general fields: `language` (string: `"zh-CN"\|"zh-TW"\|"en-US"\|"ja-JP"`), `theme` (string: `"light"\|"dark"\|"auto"`), `fontSize` (string: `"small"\|"medium"\|"large"`), `autoStart` (bool), `doNotDisturb` (string: `"off"\|"22-8"\|"20-9"\|"custom"`), `messagePermission` (string: `"everyone"\|"contacts"\|"nobody"`); notification fields: `notificationSound` (bool), `desktopNotification` (bool), `mentionNotification` (bool), `emailDigest` (bool); privacy fields: `showOnlineStatus` (bool), `readReceipt` (bool), `allowSearch` (bool) |

### Default conversation IDs
`conv_1` (产品研发群, group, pinned), `conv_2` (Q2 OKR 讨论, group, pinned), `conv_3` (市场部, group), `conv_4` (全员群, group, muted), `conv_5` (项目A-冲刺计划, group), `conv_6` through `conv_10` (DMs with user_2 through user_8), `conv_bot1` (飞书助手), `conv_bot2` (审批通知)

### Default user IDs
`user_1` (张明, currentUser, 产品研发部), `user_2` (李薇, 设计部), `user_3` (王浩, 技术部), `user_4` (赵艺, 市场部), `user_5` (陈丽, 人事部), `user_6` (刘洋, 技术部), `user_7` (周思远, 产品研发部), `user_8` (林小雨, 设计部)

### Default document IDs
`doc_1` through `doc_10` (Q2 产品规划方案, 用户调研报告, 项目A需求文档, Q1 数据汇总, 团队 OKR 看板, 设计规范 v2.0, 新员工手册, 会议纪要-0409, 竞品分析表, 产品路线图)

### Default event IDs
`event_1` through `event_8` (this week: 产品评审会议, 周会, 1:1 with 周思远, 技术方案讨论, 团建活动, Q2 Kickoff, 午餐, 设计评审)

### Default task IDs
`task_1` through `task_6`

### Default approval IDs
`approval_1` (pending leave, applicantId=user_1, approverId=user_7), `approval_2` (approved expense, applicantId=user_4, approverId=user_7), `approval_3` (rejected travel, applicantId=user_3, approverId=user_6), `approval_4` (pending leave, applicantId=user_7, approverId=user_1 — appears in user_1's "待我审批" tab)

### Default department IDs
`dept_0` (公司总部) through `dept_5` (人事部)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user_1",
      "name": "张明",
      "englishName": "Zhang Ming",
      "avatar": "",
      "avatarColor": "#3370FF",
      "initials": "张",
      "email": "zhangming@bytedance.com",
      "phone": "138****5678",
      "department": "产品研发部",
      "title": "高级产品经理",
      "status": "online",
      "statusText": "",
      "statusEmoji": "",
      "isCurrentUser": true
    },
    "users": [
      {"id": "user_1", "name": "张明", "englishName": "Zhang Ming", "avatar": "", "avatarColor": "#3370FF", "initials": "张", "department": "产品研发部", "title": "高级产品经理", "status": "online", "statusText": "", "statusEmoji": "", "isCurrentUser": true},
      {"id": "user_2", "name": "李薇", "englishName": "Li Wei", "avatar": "", "avatarColor": "#FF7D00", "initials": "李", "department": "设计部", "title": "UI设计师", "status": "online", "statusText": "设计中", "statusEmoji": "🎨", "isCurrentUser": false}
    ],
    "conversations": [
      {"id": "conv_1", "type": "group", "name": "产品研发群", "avatar": "", "memberCount": 2, "members": ["user_1", "user_2"], "lastMessage": {"content": "Hello", "senderId": "user_2", "timestamp": 1700000000000}, "unreadCount": 0, "isPinned": false, "isMuted": false, "isDone": false, "topNotice": null, "labels": [], "createdAt": 1699000000000}
    ],
    "messages": {
      "conv_1": [
        {"id": "msg_1", "conversationId": "conv_1", "senderId": "user_2", "content": "Hello", "contentType": "text", "timestamp": 1700000000000, "isEdited": false, "reactions": [], "threadId": null, "threadCount": 0, "threadLastReply": null, "replyTo": null, "mentions": [], "isRead": true, "isPinned": false, "attachments": [], "card": null}
      ]
    },
    "documents": [],
    "spaces": [],
    "calendars": [],
    "events": [],
    "departments": [],
    "tasks": [],
    "approvals": [],
    "activeConversationId": "conv_1",
    "activeModule": "messenger",
    "searchQuery": "",
    "threadPanelMessageId": null,
    "sidebarCollapsed": false,
    "favorites": [],
    "activeContactId": null,
    "settings": {
      "language": "zh-CN",
      "theme": "light",
      "fontSize": "medium",
      "autoStart": false,
      "doNotDisturb": "off",
      "messagePermission": "everyone",
      "notificationSound": true,
      "desktopNotification": true,
      "mentionNotification": true,
      "emailDigest": false,
      "showOnlineStatus": true,
      "readReceipt": true,
      "allowSearch": true
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Send message in conversation | `messages[convId]` array grows by 1; `conversations[i].lastMessage` updated |
| Reply in thread | `messages[convId]` grows (threadId set); parent message `threadCount` incremented; `threadLastReply` updated |
| Add/remove emoji reaction | `messages[convId][i].reactions` array modified |
| Delete message | `messages[convId]` shrinks by 1 |
| Edit message | `messages[convId][i].content` updated; `isEdited` → `true` |
| Pin message to conversation notice | `conversations[i].topNotice` set to message content; `messages[convId][i].isPinned` → `true` |
| Pin/unpin conversation | `conversations[i].isPinned` toggled; list re-sorted |
| Mute/unmute conversation | `conversations[i].isMuted` toggled |
| Mark conversation read | `conversations[i].unreadCount` → 0 |
| Open conversation | `activeConversationId` updated; `conversations[i].unreadCount` → 0 |
| Open thread panel | `threadPanelMessageId` set to message ID |
| Close thread panel | `threadPanelMessageId` → `null` |
| Create calendar event | `events` array grows by 1 |
| Update calendar event | `events[i]` fields updated |
| Delete calendar event | `events` array shrinks by 1 |
| Create document | `documents` array grows by 1 |
| Update document title/content | `documents[i].title` / `documents[i].content` updated; `lastEditedAt` updated |
| Star/unstar document | `documents[i].isStar` toggled |
| Create task | `tasks` array grows by 1 |
| Update task (status, priority, title, description, dueDate) | `tasks[i]` fields updated |
| Toggle task done | `tasks[i].status` → `"done"` or `"in_progress"`; `completedAt` set or cleared |
| Delete task | `tasks` array shrinks by 1 |
| Approve/reject approval | `approvals[i].status` → `"approved"` or `"rejected"`; `comment` set; `updatedAt` updated |
| Update user status | `currentUser.status` updated |
| Update user status text/emoji | `currentUser.statusText` and `currentUser.statusEmoji` updated |
| Switch active module | `activeModule` updated |
| Favorite a message (收藏) | `favorites` array grows by 1 |
| Navigate to contact from search | `activeContactId` set to target user ID |
| Toggle notification/privacy setting on Settings page | `settings[key]` boolean toggled |
| Change language/theme/fontSize/messagePermission on Settings page | `settings.language` / `settings.theme` / `settings.fontSize` / `settings.messagePermission` updated |
| Toggle autoStart / doNotDisturb on Settings page | `settings.autoStart` / `settings.doNotDisturb` updated |
| Forward message (转发) | `messages[targetConvId]` grows by 1 with `[转发]` prefix; `conversations[i].lastMessage` updated |
