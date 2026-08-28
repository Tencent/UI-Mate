# Xeishu (飞书) Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] Project scaffold: `npm create vite@latest feishu_mock -- --template react`, install deps: `react-router-dom`
- [x] **Visual design system**: The Xeishu brand uses a clean, professional Chinese enterprise style. Primary color `#3370FF` (bright blue), background `#F5F6F7` (light gray), white `#FFFFFF` panels, text primary `#1F2329`, text secondary `#646A73`, text tertiary `#8F959E`, border `#DEE0E3`, hover `#F0F1F2`, selected `#E1EAFF`, unread badge `#F54A45`, success `#34C724`. Font stack: `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`. Body text 14px, captions 12px, headings 16-20px weight 600. 4px spacing grid. Border-radius: 8px cards, 4px buttons, 50% avatars. Study `assets/screenshots/` for visual reference.
- [x] **App layout — 3-zone shell**: Full viewport height, no scroll on shell. Zone 1: **Icon Sidebar** on far left, 56px wide, `#F0F1F2` background, vertical stack of module icons (each 40px icon area, centered, with 8px vertical gap). Icons top-to-bottom: 消息 (chat bubble), 日历 (calendar), 云文档 (document), 工作台 (grid/apps), 通讯录 (people), 任务 (checkbox). Active icon: `#3370FF` color with `#E1EAFF` 36px rounded-rectangle background pill. At bottom of sidebar: search icon, then user avatar (32px circle). Zone 2: **Module Panel** (variable width, typically 280px for messenger, 240px for others) — content depends on active module. Zone 3: **Content Area** (remaining width) — main content panel. Thin 1px `#DEE0E3` border between zones.
- [x] **Routing**: `App.jsx` with `BrowserRouter`. Routes: `/` → redirect to `/messenger`, `/messenger` → Messenger module, `/messenger/:conversationId` → specific chat open, `/calendar` → Calendar module, `/docs` → Docs module, `/docs/:docId` → Doc editor, `/contacts` → Contacts module, `/workbench` → Workbench module, `/workbench/approvals` → Approvals sub-view, `/tasks` → Tasks module, `/go` → StateInspector. Each route renders inside the 3-zone shell layout (icon sidebar always visible).
- [x] **State management**: `src/context/AppContext.jsx` with React Context + useReducer. `src/utils/dataManager.js` exports `createInitialData()` returning full state object (see `assets/data_model.md` for structure). State includes: `currentUser`, `users`, `conversations`, `messages` (keyed by conversationId), `documents`, `spaces`, `calendars`, `events`, `departments`, `tasks`, `approvals`, `activeConversationId`, `activeModule`, `searchQuery`, `threadPanelMessageId`, `sidebarCollapsed`. Persist to localStorage with key `feishu_mock_state`. Load from localStorage on mount, fall back to `createInitialData()`.
- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route at `/go`. Renders JSON showing `{ initial_state, current_state, state_diff }`. `initial_state` captured on first load from `createInitialData()`, `current_state` is live state, `state_diff` computed as deep diff of changes.
- [x] **Session isolation**: `vite.config.js` mock-api plugin — `POST /post?sid=<sid>` accepts `{action:"set"|"set_current"|"reset", state:{...}}`, `GET /state?sid=<sid>` returns state. `GET /go?sid=<sid>` returns `{initial_state, current_state, state_diff}`. `POST /upload?sid=<sid>` for file uploads. `GET /files/<sid>/<filename>` serves uploaded files. DataManager must support multiple sessions keyed by `sid` query param, defaulting to `"default"`.

---

## P1 — Messenger (消息)

- [x] **Conversation list panel** (280px wide, white background): Top section has a 32px tall search input with magnifying glass icon and placeholder "搜索" (Search), `#F5F6F7` background, 8px border-radius. Below search: horizontal filter tabs — 全部 | 未读 | @我 | 群组 | 单聊 — each tab is 14px text, active tab has `#3370FF` text + 2px bottom border, inactive is `#646A73`. Below tabs: scrollable conversation list. **Pinned conversations** appear first with a subtle `#F0F1F2` section header "置顶" in 12px `#8F959E` text. Each conversation row: 48px height, 16px horizontal padding, hover background `#F0F1F2`, selected background `#E1EAFF`. Row layout: 40px rounded avatar on left (group avatars show 4-grid composite or single letter colored bg), 12px gap, then vertical stack of (top: name 14px `#1F2329` semibold + timestamp 12px `#8F959E` right-aligned) (bottom: last message preview 12px `#646A73` truncated + unread badge). Unread badge: 16px red `#F54A45` circle with white count text; if muted, gray badge. Right-click context menu: 置顶/取消置顶, 标记已读, 免打扰 开/关, 删除会话.

- [x] **Chat area header**: Horizontal bar 56px height, white background, bottom border `#DEE0E3`. Left side: group name (16px semibold `#1F2329`), for groups: member count "👥 15" in `#646A73`. Right side icon buttons (24px, `#646A73`, hover `#3370FF`): phone icon (audio call), video icon (video call), sidebar/settings icon (toggle group info panel), search icon (search in chat). For DMs: show user name + online/offline status dot.

- [x] **Message list**: Scrollable area, `#FFFFFF` background, padding 16px. Messages in chronological order (oldest at top, newest at bottom). Auto-scroll to bottom on new message. **Date dividers**: centered gray line with date text ("今天", "昨天", "4月8日") in 12px `#8F959E`. **Regular messages**: left-aligned. 36px round avatar on left, 8px gap, then content block: sender name (14px semibold `#1F2329`) + timestamp (12px `#8F959E`, "14:30" or "昨天 14:30"), message body below (14px `#1F2329`, line-height 22px). **@mentions** in message body: highlighted with `#3370FF` color and clickable. **System messages**: centered, no avatar, gray text 12px in a pill background ("张微 加入了群聊"). Message spacing: 16px between messages from different senders, 4px between consecutive messages from same sender (show avatar only on first).

- [x] **Message hover actions**: On hover over any message, show a floating action bar (4px above message, right-aligned): row of icon buttons 28px each with 4px gap — 😀 (add reaction), 💬 (reply in thread), ↩️ (quote reply), ⋯ (more menu). More menu dropdown: 转发 (Forward), 收藏 (Favorite), 置顶 (Pin to chat), 复制 (Copy), 编辑 (Edit, only own messages), 删除 (Delete, only own messages). Bar has white background, subtle shadow, 4px border-radius.

- [x] **Message reactions**: Below message body, show reaction chips. Each chip: 24px height, `#F0F1F2` background, 4px border-radius, contains emoji (16px) + count (12px `#646A73`). If current user reacted: chip has `#E1EAFF` background with `#3370FF` border. Clicking an existing reaction chip toggles current user's reaction (add/remove). Clicking the 😀 hover action opens an emoji picker popover: 280px × 320px, grid of common emojis (😀👍❤️🎉🤔👏🔥✅ etc.), search bar at top, categorized tabs at bottom (最近, 笑脸, 手势, 心形, 动物).

- [x] **Send message**: Input area at bottom of chat area, 56-80px min height. Toolbar row above input: icon buttons for bold (B), @mention, emoji (😀), attachment (📎), screenshot (✂️). Below toolbar: textarea with placeholder "发给 [conversation name]", 14px font. Right side: blue send button (36px circle, `#3370FF` background, white arrow icon). Press Enter to send (adds message to state with current timestamp, senderId = currentUser.id, conversationId = active conversation). Shift+Enter for newline. After sending, update conversation's `lastMessage` and move it to top of conversation list. Clear input after send.

- [x] **@mention autocomplete**: When user types "@" in message input, show a dropdown popover listing all members of current conversation. Each row: 28px avatar, name (14px), department (12px `#646A73`). Filter as user types after "@". Clicking a user inserts "@张明 " (blue text) into the message and adds userId to message.mentions array.

- [x] **Thread panel**: When clicking "reply in thread" or "N 条回复" link on a message, slide in a right panel (360px wide) with `#FFFFFF` background, left border `#DEE0E3`. Header: "话题" (16px semibold) + close ✕ button. Below header: the parent message rendered identically to chat area. Divider line. Below: thread replies (same message rendering as chat). Bottom: thread reply input (same as main input but smaller). Posting a thread reply adds to the parent message's thread, increments `threadCount`, updates `threadLastReply`. The parent message in the main chat shows "N 条回复 · 最后回复 时间" link below it.

- [x] **Pinned messages / Top notice**: For group conversations with `topNotice` set, show a banner at the top of the chat area below the header: `#FFF8E5` background, left orange border, notice text, dismiss ✕ button. Clicking "📌" in message hover → "置顶" adds that message content as the group's `topNotice`.

- [x] **Message search in conversation**: Clicking the search icon in chat header opens a search overlay/panel at top of message list. Input field with "在当前会话中搜索" placeholder. Results shown as highlighted matching messages. Click result scrolls to that message.

---

## P1 — Calendar (日历)

- [x] **Calendar module layout**: When activeModule = "calendar", Zone 2 shows calendar sidebar (240px) and Zone 3 shows the calendar grid. Calendar sidebar: small month picker at top (current month grid, clickable dates, navigation arrows for prev/next month), "今天" (Today) button. Below: "我的日历" section header + list of calendars with colored circle + name + visibility checkbox. Below: "其他日历" section with subscribed calendars. "+ 新建日历" link at bottom.

- [x] **Week view** (default): Header row showing Mon-Sun dates ("4月7日 周一", "4月8日 周二", ...) with today's date highlighted in blue circle. Time column on left showing 00:00-23:00 in 1-hour increments (12px `#8F959E`). Grid: 7 columns × 24 rows. All-day events in a strip above the time grid. Timed events rendered as colored blocks (height proportional to duration, colored by calendar color with 90% opacity, white text: title + time). Events can overlap (shift right). Current time: red horizontal line + red dot on left edge.

- [x] **Event interaction**: Click empty time slot → open create event modal pre-filled with that time. Click existing event → show event detail popover (280px wide, shadow): title (16px semibold), time ("14:00 - 15:00"), location with 📍 icon, organizer with avatar, attendee list with RSVP status icons (✓ accepted, ? pending, ✕ declined), "编辑" and "删除" buttons. Double-click event → open edit modal.

- [x] **Create/Edit event modal**: Centered modal 480px wide, white background, shadow. Fields: title input (large, placeholder "添加标题"), date picker row (start date + start time | end date + end time, with "全天" toggle), location input (📍 icon), attendee input (search users, show chips for added attendees), description textarea, reminder dropdown (5分钟前, 15分钟前, 30分钟前, 1小时前), color picker (row of 8 color circles). Buttons: "保存" (primary blue), "取消" (gray outline). Creating event adds to `events` array in state.

---

## P1 — Cloud Docs (云文档)

- [x] **Docs module layout**: Zone 2 shows doc sidebar (240px): top "飞书云文档" logo/title. Left nav sections (each is clickable, active has `#E1EAFF` bg + `#3370FF` text): 🏠 主页 (Home), 📁 我的空间 (My Space, expandable tree), 👥 共享空间 (Shared Space, expandable), 📚 知识库 (Wiki), ⭐ 收藏 (Favorites), 🗑️ 回收站 (Trash). Each document in tree: type icon (📄 doc, 📊 sheet, 📋 bitable) + title (14px), truncated. Top of sidebar: "➕ 新建" button with dropdown: 文档, 表格, 多维表格.

- [x] **Docs home / space view** (Zone 3): Top: breadcrumb path + view toggle (list/grid). Filter tabs: 最近 (Recent) | 我创建的 | 与我共享. Sort dropdown: 最近编辑 | 标题 | 创建时间. **Grid view**: cards in 3-4 column grid. Each card: 160px height, white bg, 8px radius, hover shadow. Card content: type icon + title (14px semibold, 2 lines max), bottom row: owner avatar (20px) + "编辑于 2小时前" (12px `#646A73`). **List view**: table with columns: 名称, 所有者, 最近编辑. Star icon on hover for each doc.

- [x] **Document editor** (simplified, when navigating to `/docs/:docId`): Zone 3 becomes editor. Top bar: back arrow, document title (editable, 20px bold), star toggle, share button (blue), "⋯" more menu. Below: slim toolbar — H1/H2/H3 dropdown, B, I, ~~S~~, code, bullet list, numbered list, checkbox, link, image, table insert, @mention. Content area: white, max-width 800px centered, contentEditable div or textarea simulating a doc editor. Show basic formatting. Editing updates document content in state. Right side: small collaborator avatar stack showing "2人正在查看".

---

## P1 — Contacts (通讯录)

- [x] **Contacts module layout**: Zone 2 shows contacts sidebar (240px). Search bar at top. Sections: 📊 组织架构 (Org Structure) — expandable department tree, each department shows: folder icon + name + member count, click to expand and show members. Each member row: 32px avatar + name + title. 👥 我的群组 (My Groups) — list of groups user belongs to. 📱 外部联系人 (External Contacts) — placeholder section. Zone 3: **Contact detail panel**. When clicking a person: centered card with 64px avatar, name (20px bold), English name (14px `#646A73`), title + department, divider, email row (📧 + email), phone row (📱 + phone). Action buttons row: "💬 发消息" (blue outline button), "📹 视频通话" (gray outline button). Online status dot next to avatar (green = online, gray = offline, orange = busy).

---

## P2 — Workbench (工作台)

- [x] **Workbench layout**: Zone 2+3 merge into single content area. Header: "工作台" title. Grid of app tiles: 3-4 columns. Each tile: 80px × 80px area, icon (32px, colored), app name below (12px), optional red badge for pending items. Default apps: 📋 审批 (Approvals), 🎯 OKR, ⏰ 打卡 (Attendance), 📢 公告 (Announcements), 📊 汇报 (Reports), 📅 日程 (Schedule), 📝 问卷 (Surveys). Clicking "审批" navigates to `/workbench/approvals`.

- [x] **Approvals sub-view**: Tabs: 待我审批 | 我发起的 | 已完成. Each tab shows list of approval cards. Card: white bg, 8px radius, padding 16px. Content: type icon (🏖️ leave, 💰 expense, ✈️ travel), title (14px semibold), applicant name + avatar, date, status badge (pending=orange, approved=green, rejected=red). Click card → detail panel: full details, approve button (green), reject button (red) with comment textarea. Approving/rejecting updates approval status in state.

---

## P2 — Tasks (任务)

- [x] **Tasks module layout**: Zone 2 shows task sidebar (240px): filter sections — 📥 我的任务 (My Tasks), 📤 我分配的 (Assigned by me), ✅ 已完成 (Completed). Zone 3: task list. Each task row: checkbox (clicking toggles done), title (14px, strikethrough if done), due date (12px, red if overdue), assignee avatar (24px), priority indicator (🔴 high, 🟡 medium, 🔵 low). "➕ 新建任务" button at top. Click task → slide-in detail panel on right: title (editable), description (editable textarea), status dropdown, priority dropdown, assignee selector, due date picker, tags, related doc link, "删除" button. Creating/editing tasks updates state.

---

## P2 — Additional Features

- [x] **Global search**: Clicking search icon in icon sidebar bottom opens a centered search overlay/modal (600px wide). Search input with "搜索消息、文档、联系人..." placeholder. As user types: show categorized results — 消息 (Messages), 文档 (Documents), 联系人 (Contacts). Each result: icon + title + snippet/preview + source. Click result navigates to that item. Search filters messages by content, documents by title, users by name.

- [x] **User profile popover**: Clicking user avatar in icon sidebar bottom opens a popover upward: user avatar (64px), name, status emoji + status text (editable), department + title. Options: 设置状态 (Set Status — opens status editor: emoji picker + text input + duration dropdown), 个人设置 (Settings), "关于" (About). Status changes update `currentUser.status` and `currentUser.statusText`.

- [x] **Rich message types**: Support for file/image attachment messages: `contentType: "image"` renders thumbnail (max 300px wide, click to view full), `contentType: "file"` renders file card (icon + filename + size + download button). Bot card messages (`contentType: "card"`): rendered as a card with colored left border, title, body text, and action buttons.

- [x] **Conversation info panel**: Clicking the settings icon in chat header toggles a right panel (320px) showing group details: group name (editable for admins), group avatar, member list (each with avatar + name + role badge for owner/admin), "添加成员" button, group announcement, notification settings toggle, "退出群聊" button at bottom.

---

## Data Seed (implement in createInitialData())

- [x] **Users**: 8 users — 张明 (current user, 产品研发部, 高级产品经理), 李薇 (设计部, UI设计师), 王浩 (技术部, 前端工程师), 赵艺 (市场部, 市场经理), 陈丽 (人事部, HR经理), 刘洋 (技术部, 后端工程师), 周思远 (产品研发部, 产品总监), 林小雨 (设计部, 设计总监). Each with realistic Chinese names, departments, job titles, varied online statuses.

- [x] **Conversations**: 12 conversations — Group: "产品研发群" (6 members, 2 unread, pinned), "市场部" (15 members, 0 unread), "Q2 OKR 讨论" (8 members, 5 unread), "全员群" (30 members, 1 unread), "项目A-冲刺计划" (4 members). DM: with 李薇, 王浩, 赵艺, 周思远, 林小雨. Bot: "飞书助手" (system notifications), "审批通知" (approval bot). Varied last messages, timestamps, unread counts.

- [x] **Messages**: 50+ messages across conversations. "产品研发群" should have 15+ messages with: threaded discussion (3 replies on one message), @mentions, reactions (👍, 🎉), a pinned notice, a system message. Each DM conversation: 5-8 messages. Bot conversations: 2-3 card-style messages (approval notification, meeting reminder). Messages should span across "today" and "yesterday" for date dividers. Content should be realistic Chinese work conversations (discussing product features, scheduling meetings, sharing docs, etc.).

- [x] **Documents**: 10 documents — "Q2 产品规划方案" (doc, My Space), "用户调研报告" (doc, My Space), "项目A需求文档" (doc, Shared), "Q1 数据汇总" (sheet, Shared), "团队 OKR 看板" (bitable, Shared), "设计规范 v2.0" (doc, Wiki), "新员工手册" (doc, Wiki), "会议纪要-0409" (doc, My Space), "竞品分析表" (sheet, My Space), "产品路线图" (doc, Shared). Each with realistic content snippets, varied owners and collaborators.

- [x] **Calendar events**: 8 events this week — "产品评审会议" (Wed 14:00-15:00, 会议室A301, 5 attendees), "周会" (Mon 10:00-11:00, recurring), "1:1 with 周思远" (Thu 16:00-16:30), "技术方案讨论" (Tue 15:00-16:00), "团建活动" (Fri, all-day), "Q2 Kickoff" (Wed 9:00-10:00), "午餐" (daily 12:00-13:00, personal), "设计评审" (Thu 14:00-15:00).

- [x] **Tasks**: 6 tasks — "完成产品需求文档" (in_progress, high, due Fri), "评审设计稿" (todo, medium, due Wed), "更新项目A排期" (todo, high, due Thu), "整理Q1数据报告" (done, low), "准备周会材料" (todo, medium, due Mon), "回复客户反馈" (in_progress, high, due today).

- [x] **Departments**: 5 departments — 公司总部 (parent: null), 产品研发部 (parent: 公司总部), 技术部 (parent: 公司总部), 设计部 (parent: 公司总部), 市场部 (parent: 公司总部), 人事部 (parent: 公司总部).

- [x] **Approvals**: 3 approvals — pending leave request from 张明, approved expense report from 赵艺, rejected travel request from 王浩.

---

## Out of Scope
- Authentication / login (app starts pre-logged-in as 张明)
- Real video/audio calls (buttons exist but are non-functional)
- Real-time WebSocket communication
- File uploads to real server (use mock data)
- Email/SMS sending
- AI features (smart summaries, translation)
- Mobile responsive layout (desktop-only, min-width 1024px)
- Actual rich text editing (simplified contentEditable or textarea)
- Dark mode (light mode only)
