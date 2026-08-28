# Xeishu (飞书) Mock — Research Summary

> Last updated: 2026-04-10

---

## App Overview

**Xeishu** (飞书) is ByteDance's enterprise collaboration platform — the Chinese counterpart to **Lark** (the international version). It is an all-in-one productivity superapp combining instant messaging, calendar, cloud documents, video meetings, task management, approvals, contacts, and a customizable workbench.

Xeishu was originally built as ByteDance's internal collaboration tool, then released commercially. It serves 10M+ enterprise clients across China, Japan, Singapore, and Southeast Asia.

**Official URL**: https://www.feishu.cn/
**International (Lark)**: https://www.larksuite.com/

---

## Key User Personas

1. **Product Manager (张明)** — Primary user. Creates docs, manages tasks, schedules meetings, discusses in group chats. Uses messenger + docs + calendar daily.
2. **Designer (李薇)** — Collaborates on docs, shares design files in chats, joins design review meetings.
3. **Engineer (王浩)** — Uses group chats for technical discussions, threads for code reviews, tasks for sprint tracking.
4. **Marketing Lead (赵艺)** — Manages marketing group, sends approvals, organizes team events via calendar.
5. **HR Manager (陈丽)** — Processes leave approvals, manages org directory, sends company announcements.

---

## Core Modules & Features

### Navigation Structure (Left Sidebar — Vertical Icon Bar)

The Xeishu desktop/web app has a **narrow left icon sidebar** (~56px) with vertically stacked icons:

| Icon | Module | Route |
|------|--------|-------|
| 💬 | **消息** (Messenger) | `/messenger` |
| 📅 | **日历** (Calendar) | `/calendar` |
| 📄 | **云文档** (Docs) | `/docs` |
| 📋 | **工作台** (Workbench) | `/workbench` |
| 👥 | **通讯录** (Contacts) | `/contacts` |
| ✅ | **任务** (Tasks) | `/tasks` |

At the bottom of the icon sidebar:
- User avatar (opens profile/settings popover)
- Search icon (global search)

---

### Module 1: Messenger (消息) — **P0, PRIMARY**

**Layout**: 3-panel — icon sidebar | conversation list (~280px) | chat area (remaining width)

**Conversation List Panel**:
- Search bar at top
- Filter tabs: 全部 (All) | 未读 (Unread) | @我 (Mentions) | 群组 (Groups) | 单聊 (DMs)
- Pinned conversations at top with subtle divider
- Each conversation row: avatar (40px rounded), name, last message preview (1 line, muted text), timestamp (relative: "刚刚"/"10分钟前"/"昨天"), unread badge (red circle with count)
- Muted conversations show grayed badge
- Right-click context menu: 置顶 (Pin), 标记已读, 免打扰 (Mute), 标记完成 (Done)

**Chat Area**:
- Header bar: group name, member count icon, video call icon, group settings icon, search in chat icon
- For groups: top notice/announcement banner (green/blue bar, dismissible)
- Message list: reverse-chronological scroll
  - Each message: 36px avatar on left, bold sender name, muted relative timestamp, message body
  - System messages: centered gray text ("张微 加入了群聊")
  - @mentions highlighted in blue
  - Read receipts: small green checkmark or "已读 5人" indicator
- Hover actions on message: emoji reaction, reply in thread, more (forward, pin, delete, edit)
- Reaction bar: row of emoji chips below message, each showing emoji + count; clicking toggles your reaction
- Thread indicator: "3 条回复" link below message that opens thread panel

**Thread Panel** (slides in from right, ~360px):
- Header: "话题" with close button
- Shows parent message at top
- Thread replies below
- Reply input at bottom

**Message Input Area**:
- Rich text toolbar: bold, italic, code, list, link, @mention, emoji picker
- Emoji button, @ button, attachment (📎) button, screenshot button
- Send button (blue, right side)
- "发给 [群名]" placeholder text
- Supports Enter to send, Shift+Enter for new line

**Features (P1)**:
- Message reactions (emoji picker with frequently used + search)
- Threaded replies
- @mention autocomplete (shows user list dropdown)
- Pin messages to chat top
- Forward messages
- Edit/delete own messages
- Search within conversation
- Message read status

---

### Module 2: Calendar (日历) — **P1**

**Layout**: icon sidebar | calendar sidebar (~240px, optional) | main calendar view

**Calendar Sidebar**:
- Mini month calendar (date picker)
- "我的日历" section with checkboxes to toggle visibility
- "其他日历" section
- Each calendar entry: colored dot, calendar name, checkbox

**Main Calendar View**:
- View switcher: 日 (Day) | 周 (Week) | 月 (Month)
- Default: Week view
- Week view: 7 columns, time slots from 00:00-24:00 on left
- Events rendered as colored blocks positioned by time
- All-day events at top strip
- Click empty time slot → create new event modal
- Click event → event detail popover
- "+" button to create new event

**Event Detail Popover**:
- Title, time, location, organizer, attendees list with RSVP status
- Edit button, delete button
- Join meeting link

**Create/Edit Event Modal**:
- Title input
- Date/time picker (start, end)
- All-day toggle
- Location input
- Attendees input (search users)
- Reminder dropdown
- Color picker
- Description textarea
- Save / Cancel buttons

---

### Module 3: Cloud Docs (云文档) — **P1**

**Layout**: icon sidebar | doc sidebar (~240px) | document content area

**Doc Sidebar**:
- Sections: 主页 (Home), 我的空间 (My Space), 共享空间 (Shared Space), 知识库 (Wiki), 收藏 (Favorites), 回收站 (Trash)
- Each section expandable with tree structure
- Documents listed with type icon + title
- "新建" (New) button at top: dropdown → 文档, 表格, 多维表格, 画板

**Doc Home / Space View**:
- Grid of recent documents as cards
- Each card: type icon, title, owner avatar, last edited time
- Filter: 最近 (Recent) | 我创建的 (Created by me) | 与我共享 (Shared with me)
- Sort by: 最近编辑 | 标题 | 创建时间

**Document Editor** (simplified):
- Title input (large, bold)
- Content area with basic rich text
- Toolbar: headings, bold, italic, list, code block, image, table, @mention
- Collaborator avatars in top right
- Share button, star button, more options

---

### Module 4: Contacts (通讯录) — **P1**

**Layout**: icon sidebar | contacts sidebar (~240px) | contact detail area

**Contacts Sidebar**:
- Search bar
- Sections: 组织架构 (Org Structure), 我的群组 (My Groups), 外部联系人 (External)
- Org structure: tree of departments, expandable
- Each person: avatar, name, title

**Contact Detail Panel**:
- Large avatar
- Name, English name
- Title, Department
- Email, Phone
- Action buttons: 发消息 (Message), 视频通话 (Video Call)
- Status indicator

---

### Module 5: Workbench (工作台) — **P2**

**Layout**: icon sidebar | workbench content area

- Grid of app tiles/widgets
- Common apps: 审批 (Approvals), OKR, 打卡 (Attendance), 公告 (Announcements)
- Each tile: icon, name, optional badge
- Click opens app detail

**Approvals Sub-view** (within workbench):
- Tabs: 待我审批 (Pending), 我发起的 (My Requests), 已完成 (Completed)
- Approval cards: type icon, title, applicant, date, status badge
- Click card → approval detail with approve/reject buttons

---

### Module 6: Tasks (任务) — **P2**

- Task list with filters: 我的任务, 我分配的, 已完成
- Each task: checkbox, title, due date, assignee avatar, priority indicator
- Click task → detail panel: title, description, status, priority, due date, tags
- Create task: title, description, assignee, due date, priority, tags

---

## UI Design Language

### Color Palette (from Xeishu brand + screenshots)
- **Primary Blue**: `#3370FF` (buttons, links, active states)
- **Background**: `#F5F6F7` (page background)
- **White**: `#FFFFFF` (cards, panels)
- **Text Primary**: `#1F2329` (headings, body text)
- **Text Secondary**: `#646A73` (timestamps, subtitles)
- **Text Tertiary**: `#8F959E` (placeholders)
- **Border**: `#DEE0E3` (dividers, input borders)
- **Hover**: `#F0F1F2` (list item hover)
- **Active/Selected**: `#E1EAFF` (selected conversation, light blue)
- **Unread Badge**: `#F54A45` (red)
- **Success Green**: `#34C724`
- **Warning Orange**: `#FF7D00`
- **Sidebar Icon Bar BG**: `#F0F1F2` (light gray)
- **Sidebar Icon Active**: `#3370FF` with `#E1EAFF` background pill

### Typography
- **Font Family**: `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
- **Heading 1**: 20px, font-weight 600
- **Heading 2**: 16px, font-weight 600
- **Body**: 14px, font-weight 400
- **Caption/Timestamp**: 12px, font-weight 400, color #646A73
- **Input text**: 14px

### Spacing (4px grid)
- **Sidebar icon bar width**: 56px
- **Conversation list width**: 280px
- **Content padding**: 16px
- **Card padding**: 12px
- **List item padding**: 8px 16px
- **Avatar sizes**: 24px (inline), 36px (message), 40px (list), 64px (profile)
- **Border radius**: 8px (cards), 4px (buttons), 50% (avatars)

---

## Feature Priority Summary

| Priority | Features |
|----------|----------|
| **P0** | Project scaffold, visual design system, app shell layout (icon sidebar + module panels), routing, state management + dataManager, `/go` endpoint, session isolation |
| **P1** | Messenger (conversation list, chat area, message send/receive, reactions, threads, @mentions, message actions), Calendar (week view, event CRUD, mini calendar), Docs (sidebar, doc list, basic editor), Contacts (org tree, contact detail) |
| **P2** | Workbench (app tiles, approvals), Tasks (task list, task CRUD), Search (global search), Rich message types (cards, files, images), message forwarding, calendar day/month views |

---

## Out of Scope
- Authentication / login (app starts pre-logged-in as 张明)
- Real video/audio calls
- Real-time collaboration / WebSocket sync
- File uploads to server
- Email/SMS notifications
- AI features (smart summaries, translation)
- Mobile responsive layout (desktop only)

---

## Screenshot Descriptions

### group_chat.jpg / group_chat_detail.jpg
Shows a Xeishu group chat ("市场部") with:
- Group name + member count (15) at top
- Action icons: virtual office, video call, add member, done
- Green "线上办公室" (virtual office) banner with "加入" button
- System message: "欢迎 张微 加入 市场部..."
- User message: 杨欣 at 12:45 with @所有人 mention
- Message input bar with emoji, @, and formatting icons
- Virtual office panel showing online members (张锐, 李天, 张微, 赵艺)

### docs_sidebar.jpg
Shows Xeishu Docs (飞书云文档) with:
- Left sidebar: 主页, 我的空间, 共享空间, 知识库, 词典, 收藏, 回收站
- Top bar: 飞书云文档 logo, search bar, user icons
- Main content: template preview modal
- Action buttons: 上传, 新建 dropdown

### dev_platform.jpg
Shows Xeishu Open Platform developer console (less relevant for mock, but shows general Xeishu header/nav patterns)

---

## References
- [Xeishu Official](https://www.feishu.cn/)
- [Lark Messenger Product](https://www.larksuite.com/en_us/product/messenger)
- [Xeishu Help Center](https://www.feishu.cn/hc/zh-CN/)
- [Xeishu Navigation Customization](https://www.feishu.cn/hc/zh-CN/articles/549435754694)
- [Lark Quick Start Messenger](https://www.larksuite.com/hc/en-US/articles/191742533872-get-started-with-messenger)
- [Xeishu Design Framework](https://open.feishu.cn/document/tools-and-resources/design-specification/gadget-design-specification/design-framework)
