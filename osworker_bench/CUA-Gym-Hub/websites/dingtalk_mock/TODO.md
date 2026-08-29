# XingTalk (钉钉) Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `npm create vite@latest dingtalk_mock -- --template react`, install deps: `react-router-dom`; set up project structure with `src/components/`, `src/pages/`, `src/context/`, `src/utils/`

- [x] **Visual design system**: Study `assets/screenshots/` — XingTalk uses a clean, professional Chinese enterprise style. Color palette: Primary Blue `#2A83F0`, Sidebar BG `#F5F6F7`, Active icon highlight blue `#2A83F0`, Chat area BG `#EDF0F4`, Text Primary `#1F2329`, Text Secondary `#8F959E`, Unread Badge Red `#FF5252`, Border `#E8E8E8`, Own message bubble `#2A83F0` (blue) with white text, Other message bubble `#FFFFFF` with dark text, Hover BG `#F0F0F0`. Font: system Chinese fonts `"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif`. Font sizes: 14px base, 12px secondary/timestamps, 16px headers, 20px page titles. Border radius: 8px for cards, 4px for inputs, 50% for avatars.

- [x] **App layout — 3-column desktop layout**: (1) Left icon sidebar: 54px wide, vertical, light gray `#F5F6F7` background, contains user avatar at top (36px circle), then 5 nav icons stacked vertically (消息/DING/工作台/通讯录/我的) each 54×54px with icon + small label below, active state shows blue icon + blue text + subtle blue-left-border indicator, bottom area has settings gear icon. (2) Middle list panel: 280px wide, white background, top has a search bar spanning full width with magnifying glass icon and placeholder "搜索联系人、群组、聊天记录", below is context-dependent content (conversation list for Messages, DING list for DING, app grid for Workbench, org tree for Contacts, profile for Me). (3) Right main content area: flex-grow, displays chat view / detail panels / calendar / forms depending on context. A subtle 1px `#E8E8E8` border separates each column.

- [x] **Routing**: App.jsx with BrowserRouter. Routes: `/` → redirect to `/messages`, `/messages` → Messages view (conversation list + chat), `/messages/:conversationId` → Messages with specific chat open, `/ding` → DING tab, `/workbench` → Workbench app grid, `/workbench/approval` → Approval list, `/workbench/approval/:id` → Approval detail, `/workbench/todo` → Todo list, `/workbench/attendance` → Attendance page, `/workbench/announcements` → Announcements, `/contacts` → Contacts / org directory, `/calendar` → Calendar view, `/me` → Profile & settings, `/go` → State inspector

- [x] **State management**: AppContext.jsx + dataManager.js. `createInitialData()` returns full state object per `assets/data_model.md`. Context provides: `state`, `dispatch` (useReducer), plus helper actions: `sendMessage(convId, text)`, `createConversation(userIds)`, `markAsRead(convId)`, `sendDing(recipientIds, text)`, `submitApproval(form)`, `approveForm(id)`, `rejectForm(id)`, `toggleTodo(id)`, `createTodo(data)`, `createEvent(data)`, `setActiveTab(tab)`, `setActiveConversation(id)`. Persist to `localStorage` under key `"dingtalk_mock_state"`. Load from localStorage on mount, fall back to `createInitialData()`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. On mount, reads `initialState` (from first load/localStorage marker) and `currentState` from context. Computes `state_diff` via deep comparison. Renders `<pre>` with JSON of `{initial_state, current_state, state_diff}`.

- [x] **Session isolation**: `vite.config.js` — add mock-api plugin that intercepts: `POST /post?sid=<sid>` to inject/reset state per session, `GET /state?sid=<sid>` (alias for `/go?sid=`) to return state JSON. `dataManager.js` must support `getSession(sid)`, `setSession(sid, state)`, `resetSession(sid)`. When `sid` query param is present, use session-scoped state instead of global localStorage.

---

## P1 — Primary Features

<!-- Core interactive workflows for agent training. -->

### Messaging (消息)

- [x] **Conversation list component**: Scrollable list in the middle panel. Each item is a row (64px height): left 40px circle avatar (colored initial letter for groups, user avatar for DMs), center block with name (bold 14px, `#1F2329`) on first line and last message preview (12px, `#8F959E`, max 1 line, truncated with ellipsis) on second line, right block with timestamp (12px, `#8F959E`, relative format: "刚刚"/"5分钟前"/"昨天"/"3月15日") and below it an unread badge (red circle 18px with white count text, hidden if 0). Pinned conversations show a small 📌 pin icon. Muted conversations show a 🔇 icon and gray unread badge. Hovering a conversation row shows `#F0F0F0` background. Clicking sets it as active (left blue 3px border, `#F0F2F5` background) and opens the chat view. Sort: pinned first, then by last message timestamp descending.

- [x] **Conversation filter tabs**: Row of clickable tabs above the conversation list: "全部" (default), "未读", "@我", "群聊", "单聊". Clicking filters the conversation list accordingly. Active tab has blue underline and blue text. Each tab shows a count badge if applicable (e.g., 未读 shows total unread count).

- [x] **Chat view — message area**: Right panel header: conversation name (16px bold), member count for groups ("12人"), a `⋯` more button that opens group detail sidebar. Below header: scrollable message list with date separators ("── 3月15日 星期五 ──" centered gray text). Each message: sender avatar (32px, left side), sender name (12px, `#8F959E`, hidden for DMs and consecutive same-sender messages), message bubble (max-width 60%, rounded 8px corners, 14px text, padding 10px 14px), timestamp on hover (12px tooltip). Current user's messages: right-aligned, blue bubble `#2A83F0` white text. Others: left-aligned, white bubble `#FFFFFF` dark text. System messages: centered gray text, no bubble. File messages: show file icon + name + size in a card-style bubble with download button.

- [x] **Chat view — message input bar**: Fixed at bottom of chat area. Contains: emoji button (😊 icon, opens emoji picker popover with grid of common emojis), file attachment button (📎 icon, simulated — adds a fake file message), screenshot button (✂️ icon, non-functional but present), @ mention button (@ icon, shows member list dropdown for group chats). Main text input area (multi-line textarea, placeholder "输入消息..."). Send button ("发送", blue `#2A83F0` background, white text, or press Enter to send). Shift+Enter for newline.

- [x] **Send message action**: When user types text and clicks Send (or Enter), create a new message object: `{id: uuid, conversationId, senderId: currentUser.id, type: "text", content: inputText, timestamp: now, readBy: []}`. Append to messages array. Update conversation's lastMessage. Clear input. Auto-scroll to bottom. If the conversation has simulated "other" users, after a 1-2 second delay, generate an auto-reply from the last active member of the conversation (use a few canned Chinese responses like "好的，收到", "我看一下", "马上处理", "没问题").

- [x] **Read receipts for group messages**: In group chats, each sent message by current user shows a small "已读 N人" link below the bubble. Clicking it shows a popover with two columns: "已读" (green checkmark + avatars) and "未读" (gray + avatars). Receiving a message in active conversation auto-marks it as read by current user.

- [x] **Message context menu**: Right-clicking a message (or hovering to reveal a `⋯` button) shows a context menu: 回复 (Reply), 转发 (Forward), 复制 (Copy), 撤回 (Recall — only for own messages within 2 min), 删除 (Delete). Reply: sets a reply-to preview above the input bar showing quoted message. Copy: copies text to clipboard. Recall: replaces message with "[该消息已被撤回]" system text. Delete: removes from display (soft delete).

- [x] **Create new conversation**: Plus (+) button at top-right of conversation list. Clicking opens a modal: "发起聊天". Shows a searchable list of all users. Selecting one user creates a DM; selecting multiple (with checkboxes) creates a group chat. Group chat prompts for a group name. Clicking "确定" creates the conversation and navigates to it.

- [x] **Search**: Clicking the search bar in the middle panel focuses it and shows a dropdown. Typing filters across: contacts (name match), group names, and message content. Results grouped by category: "联系人", "群聊", "聊天记录". Clicking a result navigates to the corresponding conversation or contact.

### DING Messages

- [x] **DING tab view**: When DING tab is active in sidebar, the middle panel shows two sub-tabs: "我收到的" (Received) and "我发出的" (Sent). Each DING item is a card (white, rounded, subtle shadow): sender/recipient avatar + name, DING content text (bold), timestamp, status badge. For received: show "已确认"/"未确认" toggle button. For sent: show read/confirm statistics "已确认 2/5 人". Clicking a sent DING expands to show a list of recipients with confirmed/unconfirmed status.

- [x] **Create DING**: Button "发DING" at top of DING tab. Opens a modal with: recipient selector (searchable user list with checkboxes), text input for DING content, notification method radio buttons (应用内 / 短信 / 电话 — all simulated, just store the choice). Clicking "发送" creates a DingMessage and adds to the list.

### Contacts (通讯录)

- [x] **Organization tree view**: When Contacts tab is active, middle panel shows an expandable tree. Root node: company name "钉钉科技有限公司" with member count. Each department node: folder icon + department name + member count badge. Clicking a department expands it to show sub-departments and member users. Members listed below their department: 40px avatar + name + title. Tree expand/collapse with arrow (▸/▾) icons. Indent each level by 20px.

- [x] **Contact detail panel**: Clicking a user in the org tree opens their contact card in the right main panel. Card shows: large avatar (80px), name (20px bold), title, department breadcrumb (公司 > 技术研发部 > 前端组), phone number (with click-to-copy icon), email (with click-to-copy icon). Action buttons below: "发消息" (navigates to DM with this user), "DING TA" (opens DING creation pre-filled with this user), "视频会议" (non-functional button, shows toast "功能开发中").

- [x] **Contact tabs**: Tabs above org tree: "组织架构" (default, shows department tree), "我的好友" (flat list of all users the current user has chatted with), "群组" (list of all group conversations the current user is in, clicking one opens the chat).

### Workbench (工作台)

- [x] **Workbench app grid**: When Workbench tab is active, middle panel shows a grid of app cards (2 columns in middle panel, 4 in expanded view). Each card: 48px colored circle with icon/emoji, app name below (12px), optional badge count (red circle top-right of icon). Common apps row at top: "常用应用" header with the most-used apps in a horizontal scrollable strip. Below: "全部应用" with all apps in grid. Clicking an app navigates to its route.

- [x] **Approval list page** (`/workbench/approval`): Right main panel shows approval forms. Top tabs: "我发起的" (My submissions), "我审批的" (Need my approval), "我收到的" (CC'd to me). Each approval item is a card: type icon + title, submitter name + avatar, timestamp, status badge (审批中 = orange, 已通过 = green, 已拒绝 = red). Clicking opens approval detail. A floating "+" button opens new approval form.

- [x] **Approval detail page** (`/workbench/approval/:id`): Shows form fields read-only for submitted approvals: form type header, field labels and values (dates, amounts, reasons, etc.), attached files list. Approval flow visualization: horizontal stepper with avatar circles connected by lines — each step shows approver name + status (waiting/approved/rejected). If current user is the current approver, show "同意" (green) and "拒绝" (red) buttons with a comment textarea. Action updates the approval status and adds a comment record.

- [x] **Create approval form**: "+" button or "发起审批" button opens a type selector: list of approval types (请假, 报销, 出差, 加班, 采购, 通用). Selecting one opens a form in the right panel. Leave form: leave type dropdown (年假/事假/病假/调休), start date picker, end date picker, auto-calculated duration, reason textarea. Expense form: category dropdown, item rows (description + amount, add/remove rows), total auto-sum, receipt upload placeholder. All forms: approver chain shown at bottom (auto-selected based on department hierarchy — use team lead as default). "提交" button creates the ApprovalForm record.

### Calendar (日程)

- [x] **Calendar main view** (`/calendar`): Takes over both middle and right panels when active. Top bar: "< 2024年3月 >" month navigation with arrows, view toggle buttons (日/周/月 for Day/Week/Month). Default: Week view. Week view: 7-column grid with time slots (8:00-20:00), 30min row height. Each event: colored block positioned at correct time slot, shows title + time. Day view: single column, larger time slots. Month view: traditional calendar grid with event dots/titles in each day cell. Clicking empty slot opens create-event modal. Clicking event opens detail popover.

- [x] **Create/edit calendar event**: Modal form: title input, date picker (start + end), time picker, all-day toggle, location input, participant selector (searchable user list with checkboxes), reminder dropdown (无/5分钟/15分钟/30分钟/1小时), color picker (5-6 preset colors), description textarea. "保存" saves the event and shows it on calendar. Editing: click existing event → popover with "编辑" button → same form pre-filled.

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is complete. -->

- [x] **Todo list page** (`/workbench/todo`): Right panel shows task list. Top tabs: "我的待办" (My tasks), "我分配的" (Assigned by me), "已完成" (Completed). Each item: checkbox (clicking toggles completed state + strikethrough), title, due date (red if overdue), assignee avatar, priority dot (red/orange/gray). "+" button to create new todo: title input, due date picker, assignee selector, priority radio (高/中/低), description textarea. Filtering and sorting by due date / priority.

- [x] **Attendance page** (`/workbench/attendance`): Shows a large circular "打卡" (check-in) button at center with current time displayed (HH:MM:SS, live updating). Below: today's record — "上班打卡: 09:02 正常" / "下班打卡: --:-- 未打卡". Status indicators: 正常 (green), 迟到 (orange), 早退 (yellow), 缺卡 (red). Below today: mini calendar for the month where each day has a colored dot indicating attendance status. Clicking the check-in button records current time as check-in (first click) or check-out (second click).

- [x] **Announcements page** (`/workbench/announcements`): List of company announcements. Each item: title (bold), author name + avatar, date, "TOP" badge for pinned. Clicking opens full announcement in right panel with rich text body. Unread announcements show a blue dot. Reading marks it as read.

- [x] **Cloud Drive page** (`/workbench/drive`): File browser interface. Left sidebar: "我的文件", "团队文件", "共享给我" sections. Main area: breadcrumb navigation (钉盘 > 团队文件 > 技术部), file/folder list table with columns: icon + name, size, modified date, uploader. Toolbar: "上传" (simulated), "新建文件夹", view toggle (list/grid). Right-click context menu on files: 下载, 重命名, 移动, 删除, 分享. Create a few mock folders and files (PDF, Excel, PPT, images) as seed data.

- [x] **Profile & Settings page** (`/me`): When "我的" tab is active, middle panel shows current user profile card (large avatar, name, title, department, phone, email). Below: settings sections. (1) "消息通知": toggles for notification sounds, message preview, Do Not Disturb time range. (2) "通用设置": language selector (中文/English), font size slider. (3) "关于钉钉": version info "7.5.0". All toggles are functional and persist to state.

- [x] **Group chat detail sidebar**: Clicking "⋯" in chat header slides in a right panel (300px) over the main content. Shows: group name (editable inline), group avatar, member list with avatars (clickable to view profile), "群公告" announcement section (editable), "群文件" file list, "消息免打扰" mute toggle, "置顶聊天" pin toggle, "退出群聊" leave button. Changes persist to state.

- [x] **Emoji picker**: Popover (280px × 300px) triggered by emoji button in chat input. Grid of common emojis (6 columns, scrollable). Categories at bottom: 😊 常用, 🐱 动物, 🍔 食物, ⚽ 活动, ✈️ 旅行. Clicking an emoji inserts it at cursor position in the input textarea.

- [x] **Message forwarding**: Selecting "转发" from message context menu opens a modal showing conversation list. User selects a target conversation, optionally adds a comment, clicks "发送". Creates a new message in the target conversation with `"[转发] originalSenderName: originalContent"` format.

- [x] **Conversation pinning and muting**: Right-clicking a conversation in the list shows a context menu: "置顶" / "取消置顶" (pin/unpin), "消息免打扰" / "取消免打扰" (mute/unmute), "删除聊天" (remove from list). Pinned conversations show at top with pin icon. Muted conversations show muted icon and suppressed badge styling (gray instead of red).

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Users**: 12 users across 8 departments. Current user: 张伟 (user_001, Senior Frontend Engineer, Tech Dept). Include mix of managers, engineers, designers, HR, finance. All with Chinese names, realistic titles, phone numbers, emails. See `data_model.md` for full user list spec.

- [x] **Departments**: 9 departments in tree structure: root company → Tech (with Frontend + Backend sub-depts), Product, Design, HR, Finance, Marketing. See `data_model.md`.

- [x] **Conversations**: 8 conversations total. Groups: "前端开发组" (5 members, active, 3 unread), "项目Alpha讨论组" (8 members, 0 unread), "全员群" (12 members, pinned, 5 unread). DMs: with 李娜 (2 unread), 赵强 (0 unread, last message yesterday), 陈静 (1 unread), 王磊 (0 unread, muted), 刘洋 (0 unread).

- [x] **Messages**: 40+ messages spread across conversations. Include: normal text exchanges about work (code review requests, meeting scheduling, project updates), a file-share message, system messages (member joined group), a DING-type message, messages with read receipts showing partial read status in groups.

- [x] **DING messages**: 6 items. 3 sent by current user (e.g., "请确认明天的上线计划" with 3/5 confirmed), 3 received (1 unconfirmed, 2 confirmed).

- [x] **Approval forms**: 6 forms. Current user submitted: 1 pending leave request (3 days annual leave), 1 approved expense claim (¥2,580). Others: 1 pending approval waiting for current user to act (colleague's business trip), 1 rejected overtime request, 1 approved purchase order, 1 pending general form.

- [x] **Calendar events**: 10 events over current week. Include: daily standup (recurring, 9:30-10:00), Q1 review meeting (Thursday 14:00-15:30), 1:1 with manager (Wednesday 11:00), team lunch (Friday 12:00, all-day style), deployment window (Saturday 2:00-4:00 AM), product roadmap review, design review.

- [x] **Todo items**: 10 tasks. Mix of completed (3), in-progress (4), overdue (2), upcoming (1). Titles: "完成API文档更新", "Review PR #234", "准备周报", "修复登录页面Bug", etc. Various priorities and assignees.

- [x] **Workbench apps**: 12 predefined app shortcuts with icons, colors, and routes as specified in `data_model.md`. Badges: 审批 (2), 待办 (3), 公告 (1).

- [x] **Announcements**: 4 announcements. "关于五一假期安排的通知" (pinned, unread), "Q1季度绩效考核通知", "新员工入职培训安排", "办公区域装修通知" (read).

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / QR code scanning (app starts pre-logged-in as 张伟)
- Real voice/video calls (buttons exist but show "功能开发中" toast)
- Real SMS/phone DING notifications (store preference but simulate in-app only)
- Real file uploads (use mock file objects in state)
- AI features (smart assistant, translation, AI sheets)
- Payment/salary integration
- Third-party app marketplace
- Mobile-responsive layout (desktop-only is fine)
- Real-time sync between multiple browser tabs
- Internationalization (Chinese-only UI is correct for XingTalk)
