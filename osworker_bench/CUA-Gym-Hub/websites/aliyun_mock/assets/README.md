# Alibaba Cloud (Xliyun) Console Mock -- Assets

## Overview

This directory contains research materials, reference screenshots, and data model documentation for building a faithful mock of the Alibaba Cloud management console (console.aliyun.com).

## App Summary

**Alibaba Cloud (Xliyun)** is China's largest cloud computing platform and a subsidiary of Alibaba Group. The management console is the web-based GUI where users create, manage, and monitor cloud infrastructure resources. It serves a similar role to AWS Console, Azure Portal, or Google Cloud Console, but with a distinct design language based on the Alibaba Fusion design system.

### Key User Personas

1. **DevOps Engineer** -- Manages ECS instances, configures security groups, monitors resource health. Primary workflow: launch/stop/restart instances, check monitoring, adjust configurations.
2. **Backend Developer** -- Uses RDS databases, OSS storage, manages application deployments. Primary workflow: connect to databases, upload files to OSS, check logs.
3. **System Administrator** -- Oversees billing, resource access management, VPC networking. Primary workflow: review bills, manage IAM policies, configure VPCs.
4. **Team Lead / Manager** -- Reviews spending, resource utilization, sets budgets. Primary workflow: billing dashboard, cost analysis, resource overview.

### Core Workflows (for agent training)

1. Navigate between services using top search bar or sidebar
2. View and filter resource lists (ECS instances, OSS buckets, etc.)
3. Perform CRUD operations on cloud resources
4. Change region to see different resource sets
5. Review billing and cost information
6. Configure security group rules
7. Monitor resource health via alarms
8. Manage instance lifecycle (start, stop, restart, release)

---

## Feature Inventory

### P0 -- Core Shell (must have for app to render)
- Top navigation bar with logo, region selector, search, notifications, user menu
- Left sidebar with service-specific navigation
- Main content area with breadcrumb navigation
- Routing between all service pages
- State management with dataManager.js
- `/go` endpoint for state inspection

### P1 -- Primary Features (core interactive workflows)

| Feature | Description | Priority |
|---------|-------------|----------|
| Console Home Dashboard | Overview with resource summary cards, recent products, favorites, billing snapshot | P1 |
| ECS Instance List | Filterable/searchable table of instances with status tags, actions dropdown | P1 |
| ECS Instance Detail | Tab-based detail page: basic info, disks, security groups, monitoring | P1 |
| ECS Instance Actions | Start, stop, restart, release instances; change status in state | P1 |
| OSS Bucket List | Table of buckets with storage class, size, object count | P1 |
| OSS Bucket Detail | Overview, object browser (mock file list), settings tabs | P1 |
| RDS Instance List | Database instances table with engine, version, status | P1 |
| RDS Instance Detail | Connection info, basic settings, backup info | P1 |
| VPC List | VPCs table with CIDR, vswitch count | P1 |
| Security Group List | Groups table with rule count, associated instances | P1 |
| Security Group Rules | Inbound/outbound rule table with add/delete functionality | P1 |
| Billing Dashboard | Balance, monthly spend chart, product breakdown | P1 |
| Region Selector | Dropdown in top nav that filters all resources by region | P1 |
| Global Search | Search bar in top nav that finds resources and services | P1 |

### P2 -- Secondary Features (depth and realism)

| Feature | Description | Priority |
|---------|-------------|----------|
| ECS Create Instance Wizard | Multi-step form: spec, networking, security, confirmation | P2 |
| Disk Management | List/create/attach/detach cloud disks | P2 |
| EIP Management | List/bind/unbind elastic IP addresses | P2 |
| SLB Instance List | Load balancer list and listener configuration | P2 |
| VSwitch Management | Create/delete vswitches within VPCs | P2 |
| CloudMonitor Alarms | Alarm list with status indicators | P2 |
| Notification Center | Message list with read/unread states | P2 |
| Operation Log | Audit trail of recent API operations | P2 |
| Favorites Management | Star/unstar products, reorder favorites | P2 |
| Cost Analysis | Breakdown by product, trend charts | P2 |

---

## Xliyun Console UI Layout (from research)

### Top Navigation Bar (50px)
Left to right:
1. Hamburger menu icon (opens product catalog drawer)
2. Alibaba Cloud logo (orange, links to console home)
3. Current service name as breadcrumb
4. Region selector dropdown (e.g., "华东1（杭州）")
5. Global search bar (centered, ~400px)
6. Notification bell icon (with unread count badge)
7. Support/Help link
8. User avatar + account name dropdown

### Left Sidebar (200px, collapsible to 48px)
- Service-specific navigation menu
- Organized into expandable groups
- Active item highlighted with blue left border
- Supports nested sub-items (1 level deep)
- Collapse/expand toggle at bottom

### Main Content Area
- Breadcrumb at top
- Page title with action buttons
- Filter bar (search, dropdowns, tags)
- Data table or dashboard cards
- Pagination at bottom

### Product Catalog (overlay drawer from hamburger)
- Grid layout of all cloud products
- Grouped by category: Compute, Storage, Database, Networking, Security, etc.
- Each product shows icon + Chinese name + English abbreviation
- Search/filter within catalog
- Star icon to add to favorites

---

## Technology Notes

- Built on Alibaba Fusion design system (React component library)
- Chinese-first UI with English translations available
- Uses Chinese font stack: PingFang SC, Microsoft YaHei, then western fallbacks
- The Xliyun brand color is orange (#FF6A00) but the console primarily uses blue (#0070CC) for interactive elements
- Design is desktop-only, no responsive mobile layout
- Resource IDs follow pattern: `{type}-bp{random_hex}` (e.g., `i-bp1234567890abcdef`)

---

## Screenshots

### `screenshots/` -- Downloaded images
- `000001.jpg`: **PRIMARY REFERENCE** -- Real Xliyun IoT console showing top nav bar (dark #232F3E), left sidebar with menu items, region selector ("华东2（上海）"), search bar, main content area with data table and pagination. Shows the full console layout with all key elements visible.
- `ecs_list_01.jpg`: **ECS INSTANCE DETAIL REFERENCE** -- ECS instance detail page showing tab navigation at top (Instance Details / Monitoring / Security Groups / Cloud Disks / Snapshots / Instance Snapshots / ENIs / Remote Commands/Files). Shows "Basic Info" section with instance name, edit pencil icon, green "Running" status badge, instance ID (i-xxxx format), public IP, security group link. Action links at top right: "Diagnostics / Start / Restart / Stop / Configure Security Group Rules / Reset Instance Password". Blue outlined "Remote Connect" button visible.

### `screenshots/reference/` -- Pre-existing reference images
- `docs_0027.webp`: Xliyun pricing model icons (Reserved Instance, Pay-As-You-Go, Subscription, Preemptible)
- `docs_0009.webp`: Globe icon representing global regions
- `docs_0012.webp`: Instance type diagram showing alternative instance types
- `docs_0014.webp`: Auto Scaling diagram with cloud monitor
- `docs_0025.webp`: Security/access control diagram
- Other files: decorative assets, logos, icons

### Key Visual Reference
The most useful screenshots are `000001.jpg` and `ecs_list_01.jpg`:

**`000001.jpg` (Console Shell):**
- Dark top navbar (#232F3E) with: Alibaba Cloud logo (teal "C" icon), "管理控制台" label, region selector ("华东2（上海）" dropdown), teal/cyan search bar in center, right-side nav items: 消息 (Messages), 费用 (Billing), 工单 (Tickets), 备案 (ICP Filing), 企业 (Enterprise), 支持与服务 (Support & Services), user avatar
- Left sidebar: white background, organized menu groups, blue text for active item, gray text for inactive, expandable groups with chevrons
- Main content: white card with breadcrumb, data table with checkbox column, search/filter bar above table, pagination below ("共有 0 条" count, page nav buttons, items-per-page dropdown "每页显示: 10")
- Bulk action buttons at bottom: 批量删除 (Batch Delete), 批量禁用 (Batch Disable), 批量启用 (Batch Enable)

**`ecs_list_01.jpg` (Instance Detail):**
- Horizontal tab navigation with blue underline on active tab
- "Basic Info" section heading in large text
- Instance name with editable pencil icon
- Green checkmark badge with "运行中" (Running) status
- Key-value layout: Instance ID, Public IP, Security Group
- Action links in blue: Diagnostics, Start, Restart, Stop, Configure Security Group Rules
- "Remote Connect" button (blue outlined)

---

## Data Model

See `data_model.md` for complete entity definitions, field types, relationships, and seed data specifications.

---

## Out of Scope

- **Authentication**: App starts pre-logged-in as "Zhang Wei" (admin user at Hangzhou Tech Co.)
- **Real API calls**: All data is local mock data in localStorage
- **File uploads**: OSS file browser shows mock objects, no real upload
- **Real-time monitoring**: CloudMonitor shows static mock charts
- **RAM (Resource Access Management)**: No user/role/policy management UI
- **Marketplace**: No third-party product catalog
