# XingTalk (钉钉) — Research Summary

## App Overview

XingTalk (钉钉) is an enterprise communication and collaboration platform developed by Alibaba Group, launched in 2014. It serves 700+ million users across 26+ million organizations. It is the #1 enterprise collaboration platform in China and Asia, comparable to Slack/Microsoft Teams but with a strong focus on OA (Office Automation) workflows, attendance management, and organizational hierarchy.

The platform consolidates messaging, video conferencing, calendaring, document collaboration, task management, approval workflows, and cloud storage into a single digital workspace.

## Key User Personas

1. **Employee (普通员工)**: Sends/receives messages, checks attendance, submits leave/reimbursement requests, views calendar, collaborates on documents.
2. **Team Lead (团队负责人)**: Manages group chats, assigns tasks, reviews approval requests, schedules meetings, tracks project progress.
3. **HR/Admin (人事/行政)**: Manages organization contacts, configures approval workflows, reviews attendance records, sends company announcements.

### Primary Workflows (Daily)
- Check unread messages and reply in 1:1 or group chats
- Read and respond to DING urgent notifications
- Submit or approve OA forms (leave, expense, business trip)
- Schedule and join video/audio meetings
- Check calendar for upcoming events
- Search contacts in the organizational directory
- Access workbench apps (attendance, cloud drive, docs)

## Complete Feature List

### P0 — Core Shell & Navigation
- **Left sidebar navigation** (vertical icon strip, ~54px wide): Message (消息), DING, Workbench (工作台), Contacts (通讯录), Me/Settings (我的)
- **Top search bar**: Global search across messages, contacts, files (placeholder: "搜索")
- **User avatar + org switcher** at top-left of sidebar
- **App header bar** with context-specific actions

### P1 — Primary Features

#### Messaging (消息)
- **Conversation list** (left panel, ~280px): Each row shows avatar (40px circle), name (bold), last message preview (gray, truncated), timestamp (right-aligned), unread badge (red circle with count)
- **Chat view** (center panel): Message bubbles — sender avatar, name, timestamp, text body; own messages right-aligned (blue bubble), others left-aligned (white bubble)
- **Message input bar**: Text input, emoji picker, file attachment, screenshot tool, @ mentions, send button
- **Group chat info panel** (right slide-out): Member list, group name, group announcement, group files, mute toggle
- **Message types**: Text, image, file, link card, system notification, DING message (with read receipt tracking)
- **Read receipts**: Show "已读/未读" (read/unread) count for sent messages in group chats
- **Message actions on hover**: Reply, forward, pin, delete, react with emoji
- **Conversation filters** at top: 全部 (All), 分组 (Groups), 未读 (Unread), @我 (@Me), 群聊 (Group Chats)

#### DING Messages (DING)
- **DING tab**: Shows sent and received DING notifications
- **Create DING**: Select recipients, type message, choose notification method (app/SMS/phone call)
- **DING status tracking**: Shows who has read/confirmed the DING message
- **Two sub-tabs**: 我发出的 (Sent by me), 我收到的 (Received)

#### Contacts (通讯录)
- **Organization tree** (left): Hierarchical department structure — expand/collapse departments, click to see members
- **Contact list** (right): Avatar, name, title/position, department, phone number
- **Contact detail card**: Avatar, name, title, department, email, phone; action buttons: Chat, Voice Call, Video Call
- **Tabs**: 组织架构 (Organization), 我的好友 (My Friends), 群组 (Groups)
- **Search contacts**: Filter by name, department, or role

#### Workbench (工作台)
- **App grid layout**: Icons in a grid (4 columns), each with icon + label
- **Common apps**: 审批 (Approval), 考勤打卡 (Attendance), 日志 (Work Log), 公告 (Announcements), 钉盘 (DingDrive/Cloud Storage), 日程 (Calendar), 会议 (Meeting), 直播 (Live Stream), 待办 (To-Do)
- **Quick access row** at top: Shortcuts to recently used/pinned apps
- **App categories**: OA tools, collaboration, HR, finance

#### Calendar (日程)
- **Week/Day/Month views** with toggle
- **Event creation**: Title, time (start/end), location, participants, reminder, recurrence
- **Event display**: Colored blocks on calendar grid, click to view detail
- **Sidebar**: Mini month calendar + upcoming events list

### P2 — Secondary Features

#### Approval Workflows (审批)
- **Approval form types**: Leave (请假), Expense (报销), Business Trip (出差), Overtime (加班), Purchase (采购), General
- **Form view**: Form fields (date pickers, text areas, amount inputs, attachment uploads), approval chain visualization
- **My submissions** list: Status badges (Pending 审批中, Approved 已通过, Rejected 已拒绝)
- **My approvals** list: Pending items requiring action, approve/reject buttons

#### Attendance (考勤打卡)
- **Check-in button**: Large circular button showing current time
- **Attendance records**: Daily check-in/check-out times, status (Normal 正常, Late 迟到, Early Leave 早退, Absent 缺卡)
- **Monthly summary**: Calendar view with status indicators per day

#### Cloud Drive (钉盘)
- **File browser**: List/grid view, file icons, name, size, modified date, uploader
- **Folder navigation**: Breadcrumb trail
- **Actions**: Upload, create folder, share, move, delete, preview
- **Spaces**: My files (我的文件), Team files (团队文件), Shared with me (共享给我)

#### To-Do / Tasks (待办)
- **Task list**: Checkbox, title, due date, assignee avatar, priority indicator
- **Create task**: Title, description, due date, assignee, priority
- **Filter**: All, My tasks, Assigned to others, Completed

#### Settings (我的)
- **Profile section**: Avatar, name, title, org, phone
- **Preference toggles**: Notification sounds, Do Not Disturb schedule, message preview on lock screen
- **General settings**: Language, font size, theme

## UI Layout Description (Desktop)

```
┌──────────────────────────────────────────────────────────┐
│ [Avatar] │  Search bar (联系人, 群组, 聊天记录)     │ [+] │
├──54px────┼──────280px──────┼─────────flex─────────────────┤
│ 💬 消息  │ Conv. filters   │                              │
│ 📌 DING  │ ┌─────────────┐ │  Chat header (name, members) │
│ 🏢 工作台│ │ Conv item 1 │ │ ─────────────────────────── │
│ 👥 通讯录│ │ Conv item 2 │ │  Message bubbles area       │
│ 👤 我的  │ │ Conv item 3 │ │  (scrollable)               │
│          │ │ ...         │ │                              │
│          │ └─────────────┘ │ ─────────────────────────── │
│          │                 │  [Emoji][File][📷] [Input] [Send] │
└──────────┴─────────────────┴──────────────────────────────┘
```

## Color Palette (from screenshots)

- **Primary Blue**: #2A83F0 (XingTalk brand blue — sidebar active, buttons, links)
- **Header/Sidebar Background**: #2A2D35 or #FFFFFF (newer versions use white sidebar)
- **Sidebar Icon Bar**: #F5F6F7 (light gray background)
- **Active Sidebar Icon**: #2A83F0 blue highlight
- **Chat Background**: #EDF0F4 (light gray)
- **Own Message Bubble**: #95EC69 or #2A83F0 (blue bubble in newer versions)
- **Other's Message Bubble**: #FFFFFF (white)
- **Text Primary**: #1F2329 (near-black)
- **Text Secondary**: #8F959E (gray)
- **Unread Badge**: #FF5252 (red)
- **Success/Online**: #67C23A (green)
- **Border Color**: #E8E8E8
- **Hover Background**: #F0F0F0

## What to Skip (Out of Scope)
- Login / QR code scanning / phone verification
- Real DING notifications (SMS/phone call)
- Actual video/audio calling (show UI only)
- Real file upload to servers (use localStorage)
- Actual AI features (AI assistant, smart translation)
- Payment/salary integration
- Third-party app marketplace

## Screenshots Reference

| File | Description |
|------|-------------|
| 000001.jpg | Desktop chat list with conversation sidebar + empty chat area; shows XingTalk blue header, search bar, conversation items with avatars and timestamps |
| 000002.jpg | Video meeting interface with participant tiles, bottom toolbar (mute, camera, invite, members, share, record, apps, settings, leave) |
| 000003.jpg | Video conference view with dark theme, bottom controls bar |
| 000004.jpg | Chat window with livestream creation dialog modal overlay |
| 000005.jpg | XingTalk logo/branding image (blue gradient with lightning bolt bird icon) |
| mobile_messaging.jpg | Mobile message list showing tabs: 消息, DING, 联系人, 微应用 with conversation items |
| mobile_nav_tabs.jpg | Mobile top area showing quick-access row: 日历, 待办, DING, 打卡; bottom tabs: 消息, 数字, 工作台, 通讯录, 我的 |
| tablet_chat_list.jpg | Tablet/HarmonyOS view showing left sidebar (消息, 协作, 通讯录, 我的, 更多) + conversation list + chat view; modern clean UI with white background |
