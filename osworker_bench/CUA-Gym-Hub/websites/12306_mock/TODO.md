# Y2306 Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

- [x] Project scaffold: `npm create vite@latest 12306_mock -- --template react`, install deps (`react-router-dom`). No TypeScript — use plain JSX.

- [x] **Visual design system**: The Y2306 website uses a blue-dominant color scheme inspired by China Railway branding. Study `assets/screenshots/` carefully. Exact palette:
  - Primary blue: `#1A6FB5` (header, links, active tabs)
  - Dark blue: `#0D4F8B` (top header bar, sidebar background)
  - Accent orange: `#F08519` (primary CTA buttons like "查询", promotional badges)
  - Light blue bg: `#E8F4FD` (alternate row, hover states)
  - White: `#FFFFFF` (cards, form backgrounds, main content area)
  - Text dark: `#333333` (primary text)
  - Text gray: `#999999` (secondary text, timestamps)
  - Available green: `#52C41A` (tickets available indicator text)
  - Waitlist orange: `#FF8C00` ("候补" badge text)
  - Sold-out gray: `#CCCCCC` ("无" text)
  - Border: `#E0E0E0` (table borders, card borders, dividers)
  - Font: `"Microsoft YaHei", "PingFang SC", -apple-system, sans-serif`
  - Train times use 20-24px bold; prices use 16px orange/red; body 14px; small text 12px

- [x] **App layout**: Fixed header at top (two rows: ~40px dark-blue brand bar + ~36px lighter-blue nav bar = ~76px total). Content area below fills remaining viewport height. No persistent sidebar on most pages (sidebar only on homepage search form area). Main content centered, max-width 1200px, padding 20px.

- [x] **Header component**:
  - **Top bar** (dark blue `#0D4F8B`, height 40px): Left — China Railway logo (red circle with "工" character stylized) + text "中国铁路12306" + subtitle "CHINA RAILWAY" in smaller white text. Right — "购票车, 餐饮·特产, 旅游, 铁路商城" links in white, plus user greeting "您好，张伟" with dropdown arrow.
  - **Nav bar** (blue `#1A6FB5`, height 36px): Tabs — "首页" (Home), "车票▾" (Tickets, with dropdown: 单程/往返/改签/退票), "商旅服务" (Business Travel), "会员服务" (Membership), "站车服务" (Station Services). Active tab has lighter bottom border or background highlight.

- [x] **Routing**: `App.jsx` with BrowserRouter. Routes:
  - `/` — Homepage with search form
  - `/search` — Search results page (query params: `from`, `to`, `date`)
  - `/booking/:trainNo` — Booking confirmation page
  - `/orders` — Order list page
  - `/orders/:orderId` — Order detail page
  - `/passengers` — Passenger management page
  - `/my` — My Y2306 personal center
  - `/train/:trainNo` — Train stops/schedule detail
  - `/waitlist` — Waitlist orders page
  - `/go` — State inspection endpoint

- [x] **State management**: `AppContext.jsx` wrapping the app + `utils/dataManager.js`. The dataManager exports `createInitialData()` (see `data_model.md` for full structure), `loadState()`, `saveState()`. State includes: `user`, `stations`, `trains`, `passengers`, `orders`, `waitlistOrders`, `searchHistory`, `notifications`, `currentSearch`, `selectedTrain`, `selectedSeatClass`, `selectedPassengers`, `searchFilters`. Persist to localStorage under key `"12306_mock_state"`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Reads `initial_state` (snapshot at app load) and `current_state` (live state from context) and computes `state_diff` (deep diff of all changed fields). Returns JSON displayed in `<pre>` tag. Must track: orders created/modified, passengers added/removed, search queries made, waitlist orders changed.

- [x] **Session isolation**: `vite.config.js` mock-api plugin. `POST /post?sid=<sid>` accepts `{"action":"set","state":{...}}` to replace state, `{"action":"set_current","state":{...}}` to update only current state, `{"action":"reset"}` to restore initial. `GET /go?sid=<sid>` returns `{initial_state, current_state, state_diff}`. `GET /state?sid=<sid>` returns current state. DataManager stores sessions keyed by sid in a Map; no-sid requests use default session.

---

## P1 — Primary Features

### Homepage & Search

- [x] **Homepage search form**: A white card (~520px wide) centered on the page with a blue left sidebar area (~180px) on the left side. The card has:
  - **Tab row** at top: Icon "🚂 车票" label, then radio-style tabs: "单程" (one-way, default selected), "往返" (round-trip). Tabs have underline indicator for active state.
  - **Departure field** ("出发地"): Text input with placeholder "请输入出发地", on the left side. Shows a station autocomplete dropdown on focus/typing — filters from the stations list by name or pinyin. Max 10 suggestions shown.
  - **Swap button** (⇋): Circular button between departure and arrival fields. Click swaps the two values with a subtle animation.
  - **Arrival field** ("到达地"): Same autocomplete behavior as departure.
  - **Date field** ("出发日期"): Date picker input showing `YYYY-MM-DD` format. Calendar dropdown on click. Highlight today; disable past dates. If round-trip selected, show second date field "返程日期".
  - **Checkboxes row**: "学生" (Student) checkbox and "高铁/动车" (High-speed/EMU only) checkbox, side by side.
  - **Search button**: Full-width orange button `#F08519` with white text "查 询" (Search), bold, 40px height. On click → navigates to `/search?from=X&to=Y&date=Z` with filters.
  - **Recent searches**: Below the form, show last 5 search pairs as clickable chips (e.g., "北京 → 上海"), pulling from `searchHistory`. Clicking one fills the form.

- [x] **Left sidebar quick links** (on homepage only): Dark blue (`#0D4F8B`) sidebar, ~180px wide, positioned left of the search card. Contains icon+text links stacked vertically: "🔍 常用查询" (Frequent Queries), "🍽 订餐" (Meal Ordering), "📋 计次·定期票" (Multi-ride), each as a small card/button. These are decorative — clicking shows a brief "功能开发中" (Feature in development) toast.

- [x] **Promotional banner area**: Right of the search card on homepage, show 1-2 promotional banners as static images or styled cards (e.g., "积分换车票" points-for-tickets, "会员服务" membership). These are non-functional, decorative elements that add realism.

### Search Results

- [x] **Search results page** (`/search`): Reads `from`, `to`, `date` from URL query params. Displays a header showing "北京南 → 上海虹桥 2026-04-15 出发" in bold. Below it, the full results interface.

- [x] **Train filter bar**: Horizontal bar above results table with:
  - **Departure time range** filter: 4 toggle buttons: "00:00-06:00", "06:00-12:00", "12:00-18:00", "18:00-24:00". Multiple can be selected (toggle on/off). Default: all selected.
  - **Train type** filter: Checkboxes for "G 高铁", "D 动车", "C 城际", "K 快速", "T 特快", "Z 直达". Default: all checked.
  - **Sort options**: "出发时间" (departure time, default), "到达时间" (arrival time), "历时" (duration) — clicking toggles asc/desc with arrow indicator.
  - Selecting any filter immediately re-filters the displayed train list (client-side).

- [x] **Search results table**: Each row represents one train. Columns:
  - **车次** (Train No.): e.g., "G1" in blue link text. A color-coded badge before the number: G=red, D=blue, C=purple, K/T/Z=gray. Clicking the train number opens `/train/G1` stops detail page.
  - **出发 / 到达** (Departure / Arrival): Two-line cell — top line: station name in bold 14px. Bottom line: time in large bold 18px (e.g., "09:00"). A small arrow "→" between departure and arrival columns.
  - **历时** (Duration): e.g., "4时28分" in gray text, centered.
  - **Seat availability columns** (show only columns relevant to filtered trains; for G trains show 商务座/一等座/二等座/无座; for K trains show 软卧/硬卧/硬座/无座):
    - Each cell shows: number in green if available (e.g., "156"), "有" in green if >100, "无" in gray if sold out, "候补" in orange if waitlist available, "--" in gray if seat class not applicable.
    - Below the availability, show the price in smaller text (e.g., "¥553").
  - **操作** (Action): Blue "预订" (Book) button. If all seat classes are "无" or "候补", the button text changes to "候补" with orange color.

- [x] **No results state**: If no trains match the filters or route, show a centered message: "没有找到符合条件的列车" (No matching trains found) with a train icon and suggestion to adjust date/filters.

- [x] **Date navigation**: Above the results table, show the search date prominently with left/right arrow buttons to navigate to previous/next day. Clicking updates the date and re-filters trains. Show day of week next to the date (e.g., "2026-04-15 周三").

### Booking Flow

- [x] **Booking confirmation page** (`/booking/:trainNo`): Reached after clicking "预订" on a search result. Layout:
  - **Blue header card**: Shows date ("2026-04-15 发车"), departure station + time on left, train icon + train number (e.g., "G1") in center, arrival station + time on right. Duration shown below train number. Background: gradient blue `#1A6FB5` to `#0D4F8B`, white text.
  - **Seat class selector**: Horizontal row of clickable cards/tabs for each available seat class. Each card shows: class name (e.g., "二等座"), price (e.g., "¥553"), and availability count. Selected card highlighted with blue border. Only show seat classes that are available (not "--").
  - **Passenger selection**: Section titled "乘车人" (Passengers). Shows list of saved passengers as checkboxes. Each row: checkbox + name + ID type + masked ID number. Max 5 passengers can be selected. "添加乘车人" (Add Passenger) link at bottom opens a mini-form or navigates to `/passengers`.
  - **Seat preference**: For each selected passenger, show radio buttons: "窗口" (Window) / "过道" (Aisle) / "无偏好" (No preference). Only shown for G/D trains with assigned seating.
  - **Contact info**: Show phone number field, pre-filled with user's phone. "接收购票信息" checkbox (checked by default).
  - **Submit button**: Full-width blue button "提交订单" (Submit Order), 44px height. Clicking creates an order in state with status "待支付" and navigates to a mock payment page.

- [x] **Mock payment page**: After order submission, show a payment page with:
  - Order summary (train, passengers, total price)
  - 30-minute countdown timer (visual only)
  - Payment method options: "支付宝" (Alipay), "微信支付" (WeChat Pay), "银联" (UnionPay) — displayed as icon cards
  - "确认支付" (Confirm Payment) button. Clicking immediately sets order status to "已支付" and navigates to order detail page.
  - "取消订单" (Cancel Order) link. Clicking sets status to "已取消" and navigates to order list.

### Order Management

- [x] **Order list page** (`/orders`): Two tabs at top:
  - **"未出行订单"** (Upcoming): Shows orders with status "已支付" or "待支付" where departure date is in the future. Each order card: train type icon + train number + route ("北京南 → 上海虹桥"), order number (partially masked), departure datetime, ticket count, status badge (color-coded: 已支付=green, 待支付=orange), "查看详情" (View Details) button.
  - **"历史订单"** (Past): Shows orders with status "已完成", "已退票", "已改签", "已取消". Same card layout with appropriate status badges (已完成=gray, 已退票=red, 已改签=blue, 已取消=gray).
  - Clicking "查看详情" navigates to `/orders/:orderId`.

- [x] **Order detail page** (`/orders/:orderId`): Full order information:
  - **Header**: Status banner at top — color-coded by status (green for paid, orange for pending, etc.) with status text and icon.
  - **Train info card**: Same blue card layout as booking page — departure/arrival stations, times, train number, date, duration.
  - **Passenger table**: For each passenger in the order: name, ID type, masked ID number, seat class, seat number (e.g., "05车07A号"), ticket price, ticket status.
  - **Order info**: Order number, creation time, payment time, total price.
  - **Action buttons** (context-dependent):
    - If "待支付": "去支付" (Go to Payment) and "取消订单" (Cancel Order)
    - If "已支付" and departure in future: "改签" (Change) and "退票" (Refund) buttons
    - If "已完成": "再次购买" (Buy Again) button → fills search form with same route
    - If "已退票"/"已取消": No action buttons, just informational

### Passenger Management

- [x] **Passenger list page** (`/passengers`): Shows all saved passengers in a table:
  - Columns: 序号 (Index), 姓名 (Name), 证件类型 (ID Type), 证件号码 (ID Number, masked), 旅客类型 (Passenger Type), 手机号 (Phone), 操作 (Actions)
  - Actions per row: "编辑" (Edit) and "删除" (Delete) buttons
  - "添加乘车人" (Add Passenger) button at top-right → opens a modal or inline form
  - **Add/Edit passenger form**: Fields — 姓名 (Name, required), 证件类型 (ID Type, dropdown: 身份证/护照/港澳通行证/台湾通行证), 证件号码 (ID Number, required), 旅客类型 (dropdown: 成人/学生/儿童), 手机号 (Phone), 座位偏好 (Seat Preference dropdown: 窗口/过道/无偏好). Save/Cancel buttons. Validates: name not empty, ID number format (18 digits for 身份证). Updates state on save.

### Personal Center

- [x] **My Y2306 page** (`/my`): Personal center layout:
  - **User info card** at top: Avatar placeholder (circular, with first character of name "张"), name "张伟", member level "普通会员", points "2680积分", masked phone number.
  - **Quick links grid** (2x3 or 3x2): "我的订单" (My Orders) → `/orders`, "候补订单" (Waitlist) → `/waitlist`, "乘车人" (Passengers) → `/passengers`, "个人信息" (Personal Info), "出行向导" (Travel Guide), "会员中心" (Member Center). Each is a card with icon + label. Only Orders, Waitlist, and Passengers actually navigate; others show "功能开发中" toast.
  - **Menu list** below: Vertical list items with right chevron arrows: "我的保险", "我的餐饮·特产", "温馨服务", "信息服务", "旅行休闲". All show "功能开发中" toast on click.

### Train Detail

- [x] **Train stops page** (`/train/:trainNo`): Shows the full route of a train:
  - **Header**: Train number + type badge, route ("北京南 → 上海虹桥"), date.
  - **Stops timeline**: Vertical timeline with dots/circles for each stop. Each stop shows:
    - Station name (bold if departure or arrival station)
    - Arrival time / Departure time
    - Stop duration (e.g., "停2分" or "始发" for origin / "终到" for destination)
    - Stop index number
  - Departure station highlighted in green, arrival station in red, intermediate stops in blue.
  - "返回" (Back) button to go back to search results.

---

## P2 — Secondary Features

- [ ] **Ticket change (改签)**: From order detail page, clicking "改签" opens a flow:
  - Shows current ticket info at top
  - Below, a mini search form pre-filled with same route, allowing date/time change
  - Shows available trains for new date
  - Select new train → confirm change → updates order status to "已改签", creates new order with "已支付" status
  - Shows price difference notice (补差价/退差价)

- [ ] **Ticket refund (退票)**: From order detail page, clicking "退票" shows:
  - Confirmation dialog with refund policy based on timing:
    - 8+ days before: 0% fee
    - 48h-8 days: 5% fee
    - 24h-48h: 10% fee
    - <24h: 20% fee
  - Shows calculated refund amount
  - "确认退票" (Confirm Refund) button → sets order status to "已退票"

- [x] **Waitlist management** (`/waitlist`): Three tabs:
  - "待支付" — Waitlist orders pending deposit payment
  - "待兑现" — Active waitlist orders waiting for ticket match
  - "已处理" — Completed/cancelled/failed waitlist orders
  - Each card shows: train info, seat class, passenger names, status, deposit amount
  - Actions: "取消候补" (Cancel Waitlist) for active orders

- [ ] **Station autocomplete enhancement**: When typing in departure/arrival fields, show grouped suggestions:
  - First group: "热门城市" (Popular Cities): 北京, 上海, 广州, 深圳, 成都, 武汉, 杭州, 南京
  - Second group: Pinyin/name matches from station list
  - If city has multiple stations (e.g., 北京 → 北京南, 北京西, 北京), show all with sub-labels
  - Keyboard navigation (up/down arrows, Enter to select)

- [ ] **Round-trip booking**: When "往返" tab is selected on homepage:
  - Show return date picker
  - Search results page shows outbound trains; after selecting outbound, automatically show return trains
  - Both legs create separate orders linked by a round-trip ID

- [ ] **Notification center**: Bell icon in header with unread count badge (red circle with number). Clicking opens a dropdown panel showing recent notifications:
  - Each notification: icon by type, title, content preview, time (relative: "2小时前"), read/unread dot
  - Click notification → navigate to related order detail
  - "全部已读" (Mark All Read) button at top

- [x] **Toast/message system**: Global toast component for feedback messages:
  - Success: Green bar, "订单提交成功" (Order submitted successfully)
  - Warning: Orange bar, "请选择乘车人" (Please select passengers)
  - Error: Red bar, "操作失败" (Operation failed)
  - Info: Blue bar, "功能开发中" (Feature in development)
  - Auto-dismiss after 3 seconds, or click to dismiss

- [ ] **Responsive loading states**: When transitioning between pages or performing actions (search, submit order), show:
  - Skeleton loading for results table (gray pulsing rows)
  - Spinning indicator on buttons during "submission"
  - Brief artificial delay (300-500ms) to simulate network latency for realism

- [ ] **Seat selection visual map** (for G/D trains on booking page): Optional visual seat picker:
  - Show train car layout (5 seats per row: A/B/C/D/F for second class, A/B/C/F for first class)
  - Available seats in blue, occupied in gray, selected in orange
  - Click to select specific seat
  - Falls back to random assignment if not selected

---

## Data Seed (implement in createInitialData())

- [x] **Stations**: 30 major Chinese railway stations with code, name, fullName, pinyin, initial. Cover: Beijing (3 stations), Shanghai (2), Guangzhou, Shenzhen (2), Chengdu, Chongqing, Wuhan, Changsha, Nanjing, Hangzhou, Xi'an, Zhengzhou, Jinan, Tianjin, Hefei, Fuzhou, Xiamen, Kunming, Guiyang, Nanning, Harbin, Changchun, Shenyang, Dalian, Qingdao, Suzhou. See `data_model.md §2`.

- [x] **Trains**: 45-50 train services. For the default search (北京→上海), provide ~15 trains of mixed types (G/D/K/T/Z) with varied departure times spanning the full day. For other popular routes (广州→深圳, 上海→杭州, 北京→天津, etc.), provide 3-5 trains each. Each train must have: realistic stops (3-8), correct seat availability per type, realistic pricing. Mix availability: some trains fully available, some limited (show specific counts like "23"), some sold out ("无"), some waitlist ("候补"). See `data_model.md §3` for guidelines.

- [x] **Passengers**: 5 passenger profiles for the default user. See `data_model.md §4`.

- [x] **Orders**: 8 orders in various states covering all status types. See `data_model.md §5`.

- [x] **Waitlist orders**: 2 waitlist orders. See `data_model.md §6`.

- [x] **Search history**: 5 recent search pairs. See `data_model.md §7`.

- [x] **Notifications**: 4 notifications, 2 unread + 2 read. See `data_model.md §8`.

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login / registration (app starts pre-logged-in as "张伟")
- Real payment processing (payment button immediately succeeds)
- Real-time seat inventory updates (static mock data)
- SMS/email verification
- Face recognition / identity verification
- File uploads
- Real API calls to Y2306 servers
- Mobile-responsive layout (desktop-only is fine)
- Accessibility (a11y) beyond basic semantic HTML
- i18n / English version (Chinese-only interface)
