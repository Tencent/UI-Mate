# Xaobao Seller Center (淘宝卖家中心 / 千牛工作台) — Research Summary

## App Overview

**Xaobao Seller Center** (seller.taobao.com / 千牛工作台 Qianniu) is the backend management platform for Taobao merchants — China's largest C2C e-commerce marketplace owned by Alibaba Group. It is the primary tool used by millions of small-to-medium sellers to manage their online stores, including product listings, order fulfillment, customer communication, marketing campaigns, financial tracking, and business analytics.

The web version (seller.taobao.com) provides a desktop-optimized dashboard with a left sidebar navigation and top header bar pattern, similar to enterprise admin panels. The mobile companion app (千牛 / Qianniu) mirrors core features for on-the-go management.

**Key distinguishing features from generic e-commerce platforms:**
- Chinese-language interface with RMB (¥) currency
- Deep integration with Alipay for payment processing
- Built-in customer messaging (旺旺/Wangwang)
- "生意参谋" (Business Advisor) analytics suite
- Taobao-specific promotional tools (直通车, 钻展, etc.)
- Product category system aligned with Taobao's taxonomy
- Seller rating and credit system (seller stars/diamonds/crowns)

## Key User Personas

### Primary: Small/Medium Taobao Shop Owner
- Manages 20-200 product listings
- Processes 5-50 orders daily
- Responds to customer inquiries via built-in chat
- Runs periodic promotions and discounts
- Monitors daily sales metrics

### Secondary: Shop Assistant/Employee
- Handles order fulfillment (shipping, tracking)
- Responds to customer messages
- Processes refund requests
- Updates product inventory

## Complete Feature List

### P0 — Core Infrastructure (Must have for app to render)
1. **App Shell & Layout** — Header bar with store name, notification bell, settings icon; Left sidebar with collapsible navigation groups; Main content area
2. **Dashboard/Home (首页)** — Overview metrics cards, quick action shortcuts, announcement area
3. **Routing** — Multi-page navigation between all major modules
4. **State Management** — Centralized store for products, orders, customers, messages, settings
5. **Data Manager** — Initial seed data with realistic Chinese product/user data

### P1 — Primary Features (Core interactive workflows)
6. **Product Management (商品管理)** — Product listing table, publish new product form, edit product, batch operations (on/off shelf), inventory management
7. **Order Management (订单管理)** — Order list with status tabs (待付款/待发货/已发货/退款中/已完成), order detail view, ship order action, print shipping label
8. **Refund Management (退款管理)** — Refund request list, approve/reject refund, refund detail with reason and evidence
9. **Customer Messaging (消息/旺旺)** — Chat interface with customer conversations, quick reply phrases, message list with unread counts
10. **Business Analytics (生意参谋)** — Sales overview charts, traffic analysis, conversion rate metrics, product performance ranking
11. **Marketing Center (营销中心)** — Coupon management (create/edit/delete coupons), discount/promotion setup, store-wide sale configuration

### P2 — Secondary Features (Depth and realism)
12. **Review Management (评价管理)** — Customer review list with rating stars, reply to reviews, review statistics
13. **Store Settings (店铺管理)** — Store info editing, store announcement, category management
14. **Logistics Management (物流管理)** — Shipping template setup, default logistics provider, address management
15. **Financial Overview (财务管理)** — Revenue summary, transaction records, withdrawal history
16. **Customer Management (客户管理)** — Customer list, VIP tagging, purchase history per customer
17. **Announcement Center (公告中心)** — Platform notifications and policy updates

## UI Layout Description

### Global Shell
- **Top Header Bar**: Height ~56px. White background with subtle bottom border. Left: Taobao logo (orange) + "卖家中心" text. Center: Store name display with seller rating badge. Right: Notification bell icon (with red badge count), settings gear icon, user avatar dropdown.
- **Left Sidebar**: Width ~220px. White/light gray background. Contains vertically stacked navigation groups, each with a group label (gray, small caps) and menu items below (icon + Chinese text label). Active item highlighted with orange/blue left border and light orange/blue background. Groups: 首页, 交易管理, 商品管理, 营销中心, 数据中心, 店铺管理, 客户服务.
- **Main Content Area**: Fills remaining space. White background cards on a light gray (#f5f5f5) page background. Typical pattern: page title + breadcrumb at top, then content cards below.

### Color Palette
- **Primary/Brand**: Taobao Orange `#FF4400` (buttons, active states, logo)
- **Secondary**: `#FF6600` (hover states, accent)
- **Background (page)**: `#F5F5F5` (light gray)
- **Background (cards)**: `#FFFFFF`
- **Text primary**: `#333333`
- **Text secondary**: `#666666`
- **Text muted**: `#999999`
- **Border**: `#E8E8E8`
- **Success**: `#52C41A` (green, completed orders)
- **Warning**: `#FAAD14` (yellow, pending items)
- **Danger**: `#FF4D4F` (red, refunds, errors)
- **Info/Link**: `#1890FF` (blue, clickable links)

### Typography
- **Font Family**: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif (standard Chinese web fonts)
- **Page Title**: 20px, font-weight 600, color #333
- **Section Header**: 16px, font-weight 600, color #333
- **Body Text**: 14px, font-weight 400, color #333
- **Small/Meta Text**: 12px, font-weight 400, color #999
- **Table Header**: 14px, font-weight 500, color #666, background #FAFAFA

### Key Page Layouts

#### Dashboard (首页)
- **Quick Stats Row**: 4 metric cards in a row — 今日销售额 (Today's Sales), 待发货订单 (Pending Shipments), 待处理退款 (Pending Refunds), 今日访客 (Today's Visitors). Each card: white bg, icon left, number large center, comparison text below (vs yesterday ↑↓)
- **Quick Actions Grid**: 2x4 grid of icon buttons — 发布商品 (Publish Product), 订单管理 (Order Mgmt), 营销活动 (Promotions), 数据报表 (Reports), 退款管理 (Refunds), 评价管理 (Reviews), 物流管理 (Logistics), 店铺装修 (Store Design)
- **Sales Trend Chart**: Line chart showing last 7/30 days sales amount, with date picker toggle
- **Pending Tasks List**: Card listing items needing attention (orders to ship, refunds to process, reviews to reply)
- **Platform Announcements**: Scrollable list of system notices

#### Product Management (商品管理)
- **Tab bar**: 出售中 (On Sale) | 仓库中 (In Warehouse/Draft) | 已下架 (Removed)
- **Toolbar**: Search input, category filter dropdown, batch operations button (上架/下架/删除)
- **Product Table**: Columns — Checkbox, Product Image (60x60px thumbnail), Product Name + ID, Price (¥), Stock, Sales Count, Status, Last Updated, Actions (编辑/下架/删除)
- **Pagination**: Bottom right, showing items per page dropdown (20/50/100) + page navigator

#### Order Management (订单管理)
- **Status Tabs**: 全部 (All) | 待付款 (Awaiting Payment) | 待发货 (Awaiting Shipment) | 已发货 (Shipped) | 退款中 (Refunding) | 已完成 (Completed) | 已关闭 (Closed). Each tab shows count badge.
- **Search/Filter Bar**: Order number search, date range picker, buyer name search
- **Order Cards**: Each order is a card (not table row) containing: Order number + order date header; Buyer name + address; Product rows (thumbnail + name + specs + price x quantity); Order total; Status badge; Action buttons (发货/Modify/View Detail)
- **Order Detail Page**: Full order info with timeline/progress bar (已下单→已付款→已发货→已签收→已完成)

#### Refund Management (退款管理)
- **Status Tabs**: 待处理 (Pending) | 处理中 (Processing) | 已完成 (Completed) | 已拒绝 (Rejected)
- **Refund List Table**: Columns — Refund ID, Order ID, Product, Buyer, Refund Amount, Refund Reason, Apply Time, Status, Actions (同意/拒绝/查看)
- **Refund Detail**: Shows original order info, refund reason, evidence images, communication log, approve/reject buttons

#### Customer Messaging (消息中心)
- **Two-panel layout**: Left panel (280px) = conversation list; Right panel = active chat
- **Conversation List**: Each item shows buyer avatar, buyer name, last message preview, timestamp, unread badge
- **Chat Panel**: Message bubbles (right=seller, left=buyer), timestamp dividers, text input at bottom with send button, quick reply button that shows predefined phrase list

#### Business Analytics (生意参谋/数据中心)
- **Overview Cards**: Revenue, Orders, Visitors, Conversion Rate, Avg Order Value — each with sparkline and vs-yesterday comparison
- **Sales Chart**: Area/line chart with date range selector (今日/昨日/近7天/近30天)
- **Product Ranking Table**: Top products by sales, showing product name, sales count, revenue, conversion rate
- **Traffic Sources**: Pie chart showing search/direct/promotion/social traffic breakdown

#### Marketing Center (营销中心)
- **Coupon Management**: Table of coupons — Name, Type (满减/折扣/无门槛), Amount/Discount, Valid Period, Usage Count/Limit, Status (Active/Expired/Draft), Actions (Edit/Delete/Copy)
- **Create Coupon Form**: Coupon name, type selector, discount amount, minimum spend threshold, validity date range, usage limit, applicable products (all/specific categories)
- **Store Promotions**: List of active/scheduled promotions with edit capability

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
- **Product (商品)**: Core listing entity with SKU variants, pricing, images, category, stock
- **Order (订单)**: Purchase record with status lifecycle, buyer info, product line items, shipping
- **Refund (退款)**: Refund request linked to order with approval workflow
- **Customer (客户)**: Buyer profile with purchase history
- **Message/Conversation (消息)**: Chat threads between seller and buyers
- **Coupon (优惠券)**: Discount instruments with rules and validity
- **Review (评价)**: Product reviews from buyers with ratings
- **Notification (通知)**: System and platform notifications
- **Store Settings (店铺设置)**: Store configuration and preferences

## What to Skip (Out of Scope)

- **Authentication/Login**: App starts pre-logged-in as store owner "李明的潮流小店"
- **Real Alipay integration**: Financial displays are mock data only
- **Real shipping API**: Logistics tracking is simulated
- **Image upload to server**: Product images use placeholder URLs
- **Ali Wangwang desktop client**: Only the web-based messaging UI
- **直通车/钻展 ad platforms**: Too complex; marketing limited to coupons/promotions
- **Store decoration editor**: Would require a drag-drop page builder; out of scope
- **Sub-account management**: Single user mode only
