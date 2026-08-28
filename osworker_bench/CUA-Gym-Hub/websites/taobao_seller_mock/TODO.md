# Xaobao Seller Center Mock — TODO

> Status: COMPLETE
> Last updated by: dev agent, 2026-04-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell
<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `npm create vite@latest taobao_seller_mock -- --template react`, install deps: `react-router-dom`, `recharts` (for analytics charts), `lucide-react` (for icons), `date-fns` (for date formatting). Use plain CSS (not Tailwind).

- [x] **Visual design system**: Create `src/styles/variables.css` with CSS custom properties matching Xaobao Seller Center's design language. Study `assets/screenshots/` and `assets/README.md` §Color Palette. Key tokens: `--color-primary: #FF4400` (Taobao orange), `--color-primary-hover: #FF6600`, `--color-bg-page: #F5F5F5`, `--color-bg-card: #FFFFFF`, `--color-text-primary: #333333`, `--color-text-secondary: #666666`, `--color-text-muted: #999999`, `--color-border: #E8E8E8`, `--color-success: #52C41A`, `--color-warning: #FAAD14`, `--color-danger: #FF4D4F`, `--color-link: #1890FF`. Font: `"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif`. Font sizes: page-title 20px/600, section-header 16px/600, body 14px/400, small 12px/400. Create `src/styles/global.css` with reset and base styles.

- [x] **App layout**: Create `src/components/Layout.jsx` with three-zone layout: (1) **Top header bar** — height 56px, white bg, bottom border 1px #E8E8E8. Left: Taobao logo (orange 淘 icon or text "淘宝卖家中心"), store name "李明的潮流小店" with seller rating badge "四钻". Right: notification bell icon (with red unread count badge), settings gear icon, user avatar circle "李" + dropdown arrow. (2) **Left sidebar** — width 220px, white bg, right border. Vertically stacked navigation groups with group headers in 12px gray uppercase and menu items (icon + 14px label). Active item: left 3px orange border + light orange bg (#FFF7E6). Sidebar is scrollable if content overflows. (3) **Main content area** — flex-grow, bg #F5F5F5, padding 20px, overflow-y auto.

- [x] **Sidebar navigation**: In `src/components/Sidebar.jsx`, implement these navigation groups and items (each item is a NavLink): **首页** group: 工作台 (Dashboard icon) → `/`. **交易管理** group: 已卖出的宝贝 (ShoppingBag icon) → `/orders`, 退款管理 (RotateCcw icon) → `/refunds`. **商品管理** group: 发布商品 (PlusCircle icon) → `/products/new`, 出售中的宝贝 (Package icon) → `/products`, 仓库中的宝贝 (Archive icon) → `/products?status=in_warehouse`. **营销中心** group: 优惠券 (Ticket icon) → `/coupons`, 营销活动 (Megaphone icon) → `/promotions`. **数据中心** group: 生意参谋 (BarChart3 icon) → `/analytics`. **客户服务** group: 消息管理 (MessageSquare icon) → `/messages`, 评价管理 (Star icon) → `/reviews`. **店铺管理** group: 店铺设置 (Settings icon) → `/settings`. Show unread count badges next to 消息管理 (from conversations with unreadCount > 0), 退款管理 (from pending refunds count), and 评价管理 (from unreplied reviews count). Badges: 16px red circle with white text.

- [x] **Routing**: In `src/App.jsx`, use `BrowserRouter` with routes: `/` (Dashboard), `/orders` (OrderList), `/orders/:id` (OrderDetail), `/refunds` (RefundList), `/refunds/:id` (RefundDetail), `/products` (ProductList), `/products/new` (ProductForm — create mode), `/products/:id/edit` (ProductForm — edit mode), `/coupons` (CouponList), `/coupons/new` (CouponForm), `/coupons/:id/edit` (CouponForm), `/promotions` (PromotionList), `/analytics` (Analytics), `/messages` (MessageCenter), `/reviews` (ReviewList), `/settings` (StoreSettings), `/go` (StateInspector). All routes wrapped in Layout component (except `/go`).

- [x] **State management**: Create `src/context/AppContext.jsx` with React Context + useReducer. State shape matches `data_model.md` §createInitialData(). Reducer actions: `SET_STATE` (full replace for POST /post), `UPDATE_PRODUCT`, `ADD_PRODUCT`, `DELETE_PRODUCT`, `UPDATE_PRODUCT_STATUS` (batch on/off shelf), `UPDATE_ORDER`, `SHIP_ORDER`, `UPDATE_REFUND`, `APPROVE_REFUND`, `REJECT_REFUND`, `ADD_MESSAGE`, `MARK_CONVERSATION_READ`, `ADD_COUPON`, `UPDATE_COUPON`, `DELETE_COUPON`, `REPLY_REVIEW`, `UPDATE_STORE_SETTINGS`, `MARK_NOTIFICATION_READ`, `MARK_ALL_NOTIFICATIONS_READ`, `ADD_NOTIFICATION`. Persist state to localStorage under key `taobao_seller_state`. Load from localStorage on mount, falling back to `createInitialData()`.

- [x] **Data manager**: Create `src/utils/dataManager.js` implementing `createInitialData()` per `data_model.md`. Generate all 15 products, 25 orders, 8 refunds, 15 customers, 8 conversations, 6 coupons, 20 reviews, 12 notifications with hardcoded realistic Chinese data. All IDs deterministic. Product images use colored placeholder divs (no external URLs). Include `getStateDiff(initial, current)` function and `deepMerge()` utility. Add session management helpers: `getSessionState(sid)`, `setSessionState(sid, state)`, `resetSession(sid)`.

- [x] **`/go` endpoint**: Create `src/pages/Go.jsx` that reads current state from context, compares with initial state from `createInitialData()`, and renders JSON `{ initial_state, current_state, state_diff }`. Route at `/go`. No Layout wrapper.

- [x] **Session isolation**: In `vite.config.js`, add a mock-api plugin that intercepts: `POST /post?sid=<sid>` — accepts `{action:"set"|"set_current"|"reset", state:{...}}`, stores per-session state; `GET /go?sid=<sid>` — returns `{initial_state, current_state, state_diff}` for the session; `GET /state?sid=<sid>` — alias for `/go`. When the app detects `?sid=` in URL params, use session-specific state instead of localStorage. Reference existing mocks (e.g., `slack_mock/vite.config.js`) for implementation pattern.

---

## P1 — Primary Features
<!-- Core features a user interacts with in the first 5 minutes. -->

### Dashboard (工作台首页)

- [x] **Dashboard overview cards**: Create `src/pages/Dashboard.jsx`. Top row: 4 metric cards in a responsive grid. Each card: white bg, rounded 8px, padding 20px, subtle shadow. Card content: icon (colored circle bg, 40px), metric label (12px gray), metric value (28px bold), comparison line "较昨日 ↑12%" (green for positive, red for negative). Cards: (1) 今日销售额 ¥3,580.00 (orange icon), (2) 待发货订单 5笔 (blue icon, clickable → navigates to `/orders?status=pending_shipment`), (3) 待处理退款 3笔 (red icon, clickable → `/refunds?status=pending`), (4) 今日访客 1,256人 (green icon). Data from `state.dashboardMetrics.today` and `.yesterday` for comparison. Format currency with `toLocaleString('zh-CN')` and ¥ prefix.

- [x] **Dashboard quick actions**: Below overview cards, a "快捷操作" section with 2×4 grid of icon buttons. Each button: 80×80px white card, icon (32px colored) + label (12px) below. Actions: 发布商品 → `/products/new`, 订单管理 → `/orders`, 营销活动 → `/promotions`, 数据报表 → `/analytics`, 退款管理 → `/refunds`, 评价管理 → `/reviews`, 物流管理 → `/settings` (logistics tab), 店铺装修 → `/settings` (store tab). Hover: light shadow + slight scale transform.

- [x] **Dashboard sales trend chart**: "销售趋势" section with recharts `AreaChart`. X-axis: dates (last 7 days from `dashboardMetrics.salesTrend`). Y-axis: sales amount (¥). Orange gradient fill area. Tooltip shows date + sales + orders. Toggle buttons above chart: "近7天" / "近30天" (for 30-day, generate extended trend data). Chart container: white card, height 300px.

- [x] **Dashboard pending tasks**: "待办事项" section. White card with list items, each showing: colored left border (4px), icon, task description, count badge, arrow icon (clickable). Items: "待发货订单" (5, orange border), "待处理退款" (3, red border), "待回复评价" (10, blue border), "待回复消息" (unread message count, green border). Clicking navigates to the respective page.

- [x] **Dashboard announcements**: "平台公告" section at bottom. White card with 3-5 announcement items: orange "公告" tag, title text (truncated), date. Mock content about Double 11 promotions, policy updates, etc. Each row clickable (shows a simple modal with full text).

### Product Management (商品管理)

- [x] **Product list page**: Create `src/pages/ProductList.jsx`. **Tab bar** at top: "出售中" (on_sale count), "仓库中" (in_warehouse count), "已下架" (removed count). Active tab: orange bottom border + orange text. Below tabs: **toolbar row** with search input (placeholder "搜索商品标题/ID", 240px width), category dropdown filter (全部分类 / 男装 / 女装 / 鞋靴 / 配饰 / 数码), sort dropdown (默认排序 / 价格升序 / 价格降序 / 销量降序 / 上架时间), and batch action buttons on the right ("批量上架" / "批量下架" / "批量删除" — disabled when no items selected). **Product table**: full-width white card. Columns: checkbox (24px), 商品信息 (product image 60×60 + title + product ID below in gray, 350px), 价格 (¥ amount, 100px), 库存 (stock number, 80px), 销量 (sales count, 80px), 状态 (colored badge — green "出售中" / gray "仓库中" / red "已下架", 100px), 操作 (action links: 编辑 | 上架/下架 | 删除, 150px). Table header: bg #FAFAFA, 14px gray text. Rows: 14px, border-bottom 1px #F0F0F0, hover bg #FAFAFA. **Pagination** at bottom: "共 X 件商品" left, page size selector (20/50/100) + page navigator right.

- [x] **Product list batch operations**: Implement select-all checkbox in table header that toggles all visible products. When items selected, show selected count "已选择 N 件商品" and enable batch action buttons. "批量上架": changes selected products' status to "on_sale". "批量下架": changes to "in_warehouse". "批量删除": shows confirmation modal "确定要删除选中的 N 件商品吗？此操作不可恢复。" with 确定/取消 buttons, then changes status to "removed". All batch operations dispatch `UPDATE_PRODUCT_STATUS` action.

- [x] **Product form (create & edit)**: Create `src/pages/ProductForm.jsx`. Used for both `/products/new` (create) and `/products/:id/edit` (edit — pre-fill from state). **Page title**: "发布商品" or "编辑商品". Form sections in white cards: (1) **基本信息**: 商品标题 text input (required, max 60 chars, show char count), 商品分类 cascading dropdowns (primary category → subcategory), 商品描述 textarea (200 chars). (2) **商品图片**: Grid of 5 image upload slots (dashed border boxes with + icon, clicking shows a mock "image selected" state with a placeholder color block; already-uploaded images show thumbnail with X delete button). (3) **价格库存**: If no SKUs, show single 价格 input (¥, required) + 库存 input (number). "添加规格" button to enable SKU mode. In SKU mode: add color/size attribute rows, auto-generate SKU grid table (color × size matrix with price + stock inputs per cell). (4) **物流信息**: 运费模板 dropdown (from logisticsTemplates), 商品重量 input (kg). (5) **Form footer**: sticky bottom bar with "发布" orange primary button (dispatches `ADD_PRODUCT` or `UPDATE_PRODUCT`) + "存入仓库" gray button (saves with status "in_warehouse") + "取消" link. Form validation: title required, at least one image, price > 0, stock ≥ 0.

- [x] **Product form SKU management**: When "添加规格" is clicked, show attribute editor. Two default attribute groups: "颜色" and "尺码". Each group: label + tag input (type value, press Enter to add as a chip, X to remove). As attributes are added, a SKU matrix table auto-generates below: rows = color × size combinations. Each row shows: 颜色, 尺码, 价格 (¥ input), 库存 (number input). "批量设置" button above table: opens a small form to set price/stock for all SKUs at once. Total stock auto-calculated and displayed.

### Order Management (订单管理)

- [x] **Order list page**: Create `src/pages/OrderList.jsx`. **Status tabs**: horizontal tab bar with: 全部 (all count), 待付款 (pending_payment count), 待发货 (pending_shipment count), 已发货 (shipped count), 退款中 (refunding count), 已完成 (completed count), 已关闭 (closed count). Active tab: orange text + orange bottom border. Count badges as gray rounded numbers next to each tab label. **Search bar** below tabs: order number search input (placeholder "请输入订单编号"), buyer name search input, date range picker (two date inputs with "—" separator), "搜索" button (orange), "重置" button (gray). **Order list**: each order rendered as a **card** (not table row) — white bg, rounded 8px, margin-bottom 12px. Card layout: **Header row**: order number (14px, link blue, clickable → `/orders/:id`) + order date (gray) on left; order status badge on right (colored: orange "待发货", blue "已发货", green "已完成", red "退款中", gray "待付款"/"已关闭"). **Content row**: left side shows product items (thumbnail 60×60 + title + SKU desc + ¥price × quantity per item), right side shows 订单总额 ¥amount (bold) + buyer name. **Footer row**: left = buyer note (if any, in yellow bg strip), right = action buttons. Actions vary by status: 待发货 → "发货" (orange) + "修改价格" + "备注"; 已发货 → "查看物流" + "备注"; 退款中 → "查看退款" (→ refund detail). Pagination at bottom.

- [x] **Order detail page**: Create `src/pages/OrderDetail.jsx` at route `/orders/:id`. **Breadcrumb**: 订单管理 > 订单详情. **Order progress bar**: horizontal stepper showing order lifecycle: 买家下单 → 买家付款 → 卖家发货 → 买家确认收货 → 交易完成. Completed steps: green checkmark + green connector line. Current step: orange circle. Future steps: gray circle + gray dashed line. Show timestamps below completed steps. **Order info card**: two-column layout. Left column: 订单编号, 创建时间, 付款时间, 付款方式. Right column: 买家昵称, 收货人, 联系电话, 收货地址. **Product list card**: table with columns: 商品信息 (image + title + SKU), 单价, 数量, 小计. Footer row: 商品总额 + 运费 + 优惠 = 实付金额 (bold, orange). **Logistics card** (if shipped): logistics company, tracking number, shipping timeline mockup (3-4 status entries). **Action bar**: if pending_shipment → show "发货" button that opens Ship Order modal; if shipped → "查看物流"; general: "卖家备注" editable textarea + save button.

- [x] **Ship order modal**: When clicking "发货" on a pending_shipment order, show a modal dialog. Content: order summary (product thumbnail + title + quantity), shipping form: 快递公司 dropdown (from logisticsProviders: 中通/圆通/韵达/顺丰/申通), 快递单号 text input (required). Footer: "确认发货" orange button + "取消". On confirm: dispatch `SHIP_ORDER` which sets order status to "shipped", fills logistics object, sets shippedAt timestamp. Close modal. Show success toast "发货成功！".

- [x] **Order seller note**: In order card footer or detail page, add "卖家备注" functionality. Click "备注" text link → inline editable textarea appears below the order card (or in detail page). 5 colored flag options (red/orange/green/blue/purple circle buttons) for visual categorization. Type note text + select flag color + click "保存" to dispatch `UPDATE_ORDER` with sellerNote field. Saved notes display as a small colored flag icon + note text on the order card.

### Refund Management (退款管理)

- [x] **Refund list page**: Create `src/pages/RefundList.jsx`. **Status tabs**: 待处理 (pending count, with red badge), 处理中 (approved/awaiting return), 已完成 (completed), 已拒绝 (rejected). **Refund table**: white card table with columns: 退款编号 (link to detail), 订单编号, 商品 (thumbnail + title), 买家, 退款金额 (¥, red text), 退款原因, 申请时间, 状态 (colored badge), 操作. Actions for pending: "同意" (green) + "拒绝" (red) + "查看". Clicking "同意" opens confirm modal: "确认同意退款 ¥{amount}?" with 确定/取消. Dispatches `APPROVE_REFUND`. Clicking "拒绝" opens modal with textarea for rejection reason (required) + 确定/取消. Dispatches `REJECT_REFUND`. **Deadline warning**: for pending refunds, show countdown text "剩余处理时间: X天X小时" in orange when < 24h, red when < 12h.

- [x] **Refund detail page**: Create `src/pages/RefundDetail.jsx` at `/refunds/:id`. Shows: refund status banner (top, colored bg matching status), original order info (order number, product, SKU, buyer), refund info (amount, type: 仅退款/退货退款, reason category + description text, evidence images as thumbnail grid — clicking opens lightbox-style larger view), processing timeline (退款申请 → 卖家处理 → 退款完成, with timestamps), action buttons at bottom (同意退款 / 拒绝退款 for pending status). If approved and type is return: show "等待买家退货" section with return logistics info (tracking number input for buyer, but displayed read-only to seller).

### Customer Messaging (消息管理)

- [x] **Message center**: Create `src/pages/MessageCenter.jsx`. **Two-panel layout**: left panel 300px (conversation list) + right panel (active chat). **Left panel**: header "消息" with search input below. Conversation list: each item shows buyer avatar (40px circle, colored initial letter), buyer name (bold if unread), last message preview (one line, truncated, gray), timestamp (relative: "刚刚"/"5分钟前"/"昨天"), unread count badge (red circle, top-right of avatar). Active conversation: light blue/orange bg. Sorted by lastMessageTime descending. **Right panel**: when no conversation selected, show empty state with envelope icon + "选择一个会话开始聊天". When selected: header (buyer name + "在线"/"离线" status), message area (scrollable, messages in bubbles — buyer messages: left-aligned, gray bg #F5F5F5; seller messages: right-aligned, orange bg #FF4400 white text; system messages: centered gray text; timestamps as dividers every 5 min gap), input area at bottom (textarea, 80px height, "快捷回复" button on left that opens quick reply dropdown from state.quickReplies, "发送" orange button on right, Enter to send, Shift+Enter for newline). Sending a message dispatches `ADD_MESSAGE` and updates conversation's lastMessage/lastMessageTime. Selecting a conversation dispatches `MARK_CONVERSATION_READ`.

- [x] **Quick reply panel**: In message center, clicking "快捷回复" button shows a dropdown/popover listing all quick reply phrases from `state.quickReplies`. Each item: bold label + preview of content (one line). Clicking an item inserts the content into the message input textarea (does not auto-send). User can edit before sending. Add "管理快捷回复" link at bottom of dropdown → navigates to `/settings` quick reply tab (or opens inline editor modal to add/edit/delete phrases).

### Business Analytics (生意参谋)

- [x] **Analytics dashboard**: Create `src/pages/Analytics.jsx`. **Overview section**: 5 metric cards in a row — 营业额 (¥, with vs-yesterday comparison arrow), 订单数, 访客数, 转化率 (%), 客单价 (¥). Each card: white bg, metric value large (24px bold), label below (12px gray), sparkline mini-chart (50px wide) or up/down arrow indicator. **Date range selector**: button group — 今日 / 昨日 / 近7天 / 近30天, default "近7天". Changing date range updates all charts (mock the data variation). **Sales chart**: recharts `AreaChart`, orange gradient, X-axis dates, Y-axis ¥ amount. Dual Y-axis: left = sales amount, right = order count (line overlay). **Product ranking table**: "商品排行" section. Table: rank #, product name (with small thumbnail), sales count, revenue, conversion rate. Sortable by clicking column headers. Show top 10 products. **Traffic source chart**: "流量来源" section. recharts `PieChart` with 4 slices: 搜索流量 (45%, blue), 直接访问 (20%, green), 推广流量 (25%, orange), 社交流量 (10%, purple). Legend below chart.

### Marketing Center (营销中心)

- [x] **Coupon list page**: Create `src/pages/CouponList.jsx`. **Header**: "优惠券管理" + "创建优惠券" orange button (→ `/coupons/new`). **Status tabs**: 全部 | 进行中 (active) | 已过期 (expired) | 未开始 (draft). **Coupon table**: columns — 优惠券名称, 类型 (colored tag: 满减=orange, 折扣=blue, 无门槛=green), 优惠内容 (e.g., "满200减30" or "85折"), 有效期 (date range), 领取/使用 (e.g., "580/356" with progress bar showing usage ratio), 状态 (colored badge), 操作 (编辑/删除/复制). Delete shows confirmation modal. Copy creates a duplicate in draft status.

- [x] **Coupon form (create & edit)**: Create `src/pages/CouponForm.jsx`. Form fields: 优惠券名称 text input (required), 优惠类型 radio group: 满减 / 折扣 / 无门槛 (changes which input fields appear), 优惠金额/折扣率 number input (for 满减: "减 ¥__"; for 折扣: "打 __折"; for 无门槛: "减 ¥__"), 使用门槛 number input (for 满减: "满 ¥__ 可用"; hidden for 无门槛), 有效期 date range picker, 发放数量 number input, 适用范围 radio: 全部商品 / 指定分类 (shows category checkboxes) / 指定商品 (shows product search/select). Footer: "创建" orange button + "取消". Validation: name required, amount > 0, dates valid. Dispatches `ADD_COUPON` or `UPDATE_COUPON`.

- [x] **Promotions page**: Create `src/pages/PromotionList.jsx`. "店铺活动" header + "创建活动" button. **Promotion cards**: each promotion as a white card showing: promotion name, type (限时折扣 / 满减活动 / 搭配套餐), time range, status (即将开始/进行中/已结束), product count, discount summary. Create promotion modal/form: name, type selector, date range, discount rule (e.g., "全场X折" or "满X减Y" with add-row for tiered discounts), select applicable products (checkbox list from products). Mock 3-4 seed promotions.

### Review Management (评价管理)

- [x] **Review list page**: Create `src/pages/ReviewList.jsx`. **Stats bar**: top section showing review summary — 好评率 (percentage, large green number), total reviews count, rating distribution bar (5-star to 1-star horizontal bars with counts). **Filter tabs**: 全部 | 好评(4-5星) | 中评(3星) | 差评(1-2星) | 待回复 (no sellerReply). **Review list**: each review as a white card. Card content: buyer avatar (32px) + buyer name (or "匿名用户" if anonymous) + rating stars (filled orange / empty gray, 16px) + timestamp. Below: review text content. Below: SKU info in gray tag. Below: review images as thumbnail row (clickable to enlarge). Below: seller reply section — if replied: gray bg block with "卖家回复:" prefix + reply text + reply time; if not replied: "回复" blue link → expands inline textarea (150px height) + "提交回复" orange button + "取消" link. Submitting dispatches `REPLY_REVIEW`. Pagination at bottom.

---

## P2 — Secondary Features
<!-- Depth and realism, implement after P1 is complete. -->

- [x] **Store settings page**: Create `src/pages/StoreSettings.jsx`. Tabbed interface: **基本信息** tab: store name input, store description textarea, store announcement textarea (rich text optional, plain text fine), store category display (read-only), location display. "保存" button dispatches `UPDATE_STORE_SETTINGS`. **物流设置** tab: shipping template list (name, free shipping threshold, base fee) with edit/delete, "添加模板" button with inline form. Default logistics provider dropdown. Return address input. **快捷回复** tab: list of quick reply phrases, each editable (label + content textarea). "添加回复" button appends new item. Delete button per item.

- [ ] **Customer management page**: Create `src/pages/CustomerList.jsx`. **Stats**: total customers, new this month, repeat purchase rate. **Customer table**: columns — 买家 (avatar + name), 地区, 订单数, 累计消费 (¥), 最近购买, VIP等级 (colored badge: 普通=gray, 白银=silver, 黄金=gold, 钻石=blue), 标签 (editable tags), 操作 (查看详情). Clicking a customer row opens a slide-out detail panel showing: customer info, purchase history (order list), message history link. VIP level dropdown to change level. Tag editor: click to add custom tags (chip input).

- [ ] **Financial overview page**: Create `src/pages/Financial.jsx`. Not a full page — add as a section in Dashboard or as a separate route `/financial`. Shows: 本月营业额 (big number), 本月订单数, 退款金额, 净收入. Transaction table: date, type (收入/退款/提现), order number, amount, balance. Line chart showing daily revenue over the last 30 days. "提现" button (mock — shows success toast "提现申请已提交").

- [x] **Notification center panel**: Clicking the bell icon in the header opens a dropdown panel (360px wide, max-height 480px, positioned below bell icon). Header: "通知中心" + "全部已读" link. Notification list: each item shows colored left border (orange=order, red=refund, blue=review, gray=system), icon, title (bold if unread), message, relative timestamp. Unread items have light blue bg. Clicking an item marks it read and navigates to the linked page. Empty state: "暂无新通知" with bell icon. Dispatches `MARK_NOTIFICATION_READ` on click, `MARK_ALL_NOTIFICATIONS_READ` on "全部已读".

- [x] **Toast/notification system**: Create `src/components/Toast.jsx`. Global toast notification component for action feedback. Shows briefly (3 seconds) at top-center of main area. Types: success (green left border + checkmark icon), error (red + X icon), warning (yellow + alert icon), info (blue + info icon). Used after: shipping order, approving/rejecting refund, saving product, creating coupon, sending message, etc. Toast queue supports multiple concurrent toasts stacked vertically.

- [ ] **Dashboard real-time simulation**: Add a subtle "real-time" feel to the dashboard. Every 30-60 seconds (random interval), increment today's visitor count by 1-5 and occasionally add a simulated new order notification. Show a gentle pulse animation on the visitor count card when it updates. This is cosmetic only — the "new order" notification adds to the notification list but doesn't create a full order.

- [ ] **Product list view toggle**: Add a grid/list view toggle button group in the product list toolbar. List view: current table layout. Grid view: products displayed as cards (3 per row), each card showing: product image (square, 200px), title (2 lines max), price (¥, bold orange), stock/sales badges, status tag, edit/toggle buttons at bottom. Toggle state persisted in localStorage.

- [ ] **Order export (mock)**: Add "导出订单" button in OrderList toolbar. Clicking shows a modal: "导出订单" title, date range selector, status filter checkboxes, format radio (Excel/CSV). "开始导出" button shows a loading spinner for 2 seconds, then a success message "订单已导出" with a mock download link (no actual file download needed, just visual feedback).

- [ ] **Print shipping label (mock)**: In order detail / order card for pending_shipment orders, add "打印面单" button. Clicking opens a new window/modal with a mock shipping label: sender address (from store settings), receiver address (from order), order items list, barcode placeholder (black rectangle), logistics company logo area. "打印" button (triggers `window.print()` on the modal content).

---

## Data Seed (implement in createInitialData())

- [x] **Products**: 15 products with realistic Chinese product names, descriptions, and pricing (see `data_model.md` §Products). Cover categories: 男装 (4), 女装 (4), 鞋靴 (3), 配饰 (2), 数码 (2). Status: 10 on_sale, 3 in_warehouse, 2 removed. Each product has 2-4 SKU variants with color/size combinations. Prices range ¥29.90–¥699.00. Sales counts range 50–2000. Generate realistic Chinese product titles like "2024秋冬新款男士加绒卫衣连帽外套", "韩版女士修身连衣裙春秋款", etc.

- [x] **Orders**: 25 orders covering all statuses (see `data_model.md` §Orders for distribution). Each order has 1-3 product items. Order numbers follow pattern "TB2024MMDD{8-digit-seq}". Buyer names are realistic Chinese names. Shipping addresses cover different provinces (广东/浙江/江苏/北京/上海/四川). Orders should span the last 30 days with most recent orders in pending/shipped status. Include buyer notes on ~30% of orders.

- [x] **Refunds**: 8 refunds linked to existing completed/shipped orders (see `data_model.md`). Reasons cover: size_issue (2), quality_issue (2), wrong_item (1), not_as_described (1), no_longer_needed (2). Pending refunds have deadlines within 1-3 days.

- [x] **Conversations**: 8 message threads with 3-8 messages each. Topics: size inquiries, shipping questions, return discussions, product availability, discount requests. 3 conversations with unread messages (unreadCount 1-3). Messages use natural Chinese conversational language with 亲/您好 honorifics.

- [x] **Reviews**: 20 reviews across products. Rating distribution: 12×5-star, 4×4-star, 2×3-star, 1×2-star, 1×1-star. 10 with seller replies (the ones needing replies are 4-5 star mostly unreplied, 1-2 star definitely replied to for damage control). Review content uses authentic Chinese review language.

- [x] **Coupons**: 6 coupons as specified in `data_model.md` §Coupons. Mix of active, expired, and draft.

- [ ] **Notifications, quick replies, logistics**: As specified in `data_model.md`.

---

## Out of Scope
<!-- Dev must NOT implement these. -->
- Authentication / login (app starts pre-logged-in as store owner "李明" of "李明的潮流小店")
- Real Alipay/WeChat Pay integration
- Real shipping API / logistics tracking
- Actual image file uploads (use placeholder colored blocks)
- 直通车 / 钻展 ad platform integration
- Store decoration drag-and-drop page builder
- Sub-account / employee management
- Ali Wangwang desktop client integration
- Real-time WebSocket messaging (use polling simulation or simple state updates)
- Mobile responsive layout (desktop-only is fine)
