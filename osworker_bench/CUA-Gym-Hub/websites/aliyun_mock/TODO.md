# Alibaba Cloud (Xliyun) Console Mock -- TODO

> Status: IN PROGRESS (DEV)
> Last updated by: dev agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] Project scaffold: `npm create vite@latest aliyun_mock -- --template react` inside this directory, install deps (`react-router-dom`, `lucide-react`). Ensure `vite.config.js` has the mock-api plugin for session isolation (see aws_console_mock or slack_mock for reference pattern).

- [x] App layout (see DESIGN.md for all measurements): fixed top navbar 50px height, dark background `#232F3E`, full width. Left sidebar 200px width, white background `#FFFFFF`, border-right `1px solid #E8E8E8`, fixed position below top nav, collapsible to 48px icon rail. Main content area fills remaining space with `margin-left: 200px; margin-top: 50px; padding: 24px; background: #F5F5F5; min-height: calc(100vh - 50px)`. When sidebar collapsed, main content shifts to `margin-left: 48px`.

- [x] Top navigation bar (left to right): (1) Grid/hamburger icon button -- opens product catalog drawer overlay; (2) Alibaba Cloud logo in orange `#FF6A00` -- links to console home `/`; (3) Current service name as breadcrumb text (e.g., "Elastic Compute Service"); (4) Region selector dropdown -- displays current region name (e.g., "China (Hangzhou)"), clicking opens dropdown list of all 10 regions from data_model.md, selecting a region updates `currentRegion` in state and filters all resource lists; (5) Search input centered, ~400px wide, placeholder "Search products and resources...", on submit navigates to matching service page or filters resources; (6) Notification bell icon with red badge showing unread message count from state; (7) "Billing" text link -- navigates to `/billing`; (8) "Support" text link (no-op); (9) User avatar circle with first letter of displayName + dropdown on click showing: account name, account ID, a divider, and non-functional "Sign Out" option.

- [x] Left sidebar navigation: changes based on current route/service. Each service has its own sidebar menu config. Sidebar items use DESIGN.md `.sidebar-item` styles -- active item has blue left border and blue text. Groups have collapsible headers (`.sidebar-group-title`). Sidebar has a collapse/expand toggle button at the bottom (chevron icon). Sidebar configs per service:
  - **Console Home** (`/`): "Overview", "Favorites", "Recent Products"
  - **ECS** (`/ecs/*`): "Instances", "Disks", "Images", "Security Groups", "Key Pairs", "Network Interfaces"
  - **OSS** (`/oss/*`): "Buckets", "Cross-Region Replication", "Data Processing"
  - **RDS** (`/rds/*`): "Instances", "Backups", "Parameter Groups", "Security"
  - **VPC** (`/vpc/*`): "VPCs", "VSwitches", "Route Tables", "NAT Gateways"
  - **SLB** (`/slb/*`): "Instances", "Certificates"
  - **Billing** (`/billing/*`): "Overview", "Bills", "Orders", "Coupons"
  - **CloudMonitor** (`/monitor/*`): "Dashboard", "Alarms", "Event Monitoring"

- [x] Routing in App.jsx with BrowserRouter. Routes:
  - `/` -- Console Home Dashboard
  - `/ecs` -- redirects to `/ecs/instances`
  - `/ecs/instances` -- ECS instance list
  - `/ecs/instances/:id` -- ECS instance detail (tabbed)
  - `/ecs/disks` -- Disk list
  - `/ecs/security-groups` -- Security group list
  - `/ecs/security-groups/:id` -- Security group rules
  - `/ecs/images` -- Image list (read-only)
  - `/ecs/key-pairs` -- Key pair list (read-only)
  - `/oss` -- redirects to `/oss/buckets`
  - `/oss/buckets` -- OSS bucket list
  - `/oss/buckets/:name` -- OSS bucket detail (tabbed: Overview, Files, Settings)
  - `/rds` -- redirects to `/rds/instances`
  - `/rds/instances` -- RDS instance list
  - `/rds/instances/:id` -- RDS instance detail
  - `/vpc` -- redirects to `/vpc/list`
  - `/vpc/list` -- VPC list
  - `/vpc/vswitches` -- VSwitch list
  - `/slb` -- redirects to `/slb/instances`
  - `/slb/instances` -- SLB instance list
  - `/billing` -- redirects to `/billing/overview`
  - `/billing/overview` -- Billing dashboard
  - `/billing/bills` -- Bill list
  - `/monitor` -- redirects to `/monitor/alarms`
  - `/monitor/alarms` -- Alarm list
  - `/go` -- State inspector page

- [x] State management: React Context (`AppContext.jsx`) wrapping the app. `dataManager.js` implements `createInitialData()` returning the full data structure from `data_model.md`. State stored in localStorage keyed by `aliyun_mock_state`. Context provides `state` and `dispatch` (or setState wrapper). All CRUD operations go through context to ensure `/go` can diff.

- [x] `/go` endpoint: `src/pages/Go.jsx` renders JSON of `{ initial_state, current_state, state_diff }`. `state_diff` is a deep diff showing only changed/added/removed fields. Route: `/go`.

- [x] Session isolation: `vite.config.js` configures a plugin that intercepts:
  - `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}` -- sets both initial and current state for session
  - `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}` -- updates only current state
  - `POST /post?sid=<sid>` with body `{"action":"reset"}` -- resets current to initial
  - `GET /go?sid=<sid>` -- returns `{initial_state, current_state, state_diff}`
  Follow the exact pattern from `aws_console_mock/vite.config.js` or any other existing mock.

- [x] Product catalog drawer: when user clicks the grid icon (top-left of nav bar), an overlay panel slides down from beneath the top nav. Overlay background `rgba(0, 0, 0, 0.45)`. Panel is white, max-height 70vh, scrollable. Products organized in a grid by category (see DESIGN.md section 9 for categories). Each product item shows an icon and name, is clickable to navigate to that service route. Star icon on each item toggles favorite status in state. Close by clicking outside or pressing Escape.

---

## P1 -- Primary Features

<!-- Core features a user interacts with in the first 5 minutes. -->

### Console Home Dashboard (`/`)

- [x] Welcome banner: card at top with "Welcome, Zhang Wei" greeting, account ID, and balance display (`CNY 12,586.42` in orange). "Top Up" button (primary orange, no-op).

- [x] Resource summary cards row: 4 cards in a horizontal row, each showing an icon, count, and label. Cards: "ECS Instances" (count of all ECS instances in current region), "OSS Buckets" (count), "RDS Instances" (count), "SLB Instances" (count). Each card is clickable, navigates to the corresponding service list page.

- [x] Billing snapshot card: shows "Current Month Spend" with the current month's amount from `billing.monthlySpend[0]`. Small bar chart or sparkline showing last 6 months trend (use simple CSS bars, no charting library needed). "View Details" link navigates to `/billing/overview`.

- [x] Favorite products section: horizontal list of favorite products from `favoriteProducts` array. Each shows icon + name, clickable to navigate. An "Edit" button opens inline editing to remove favorites (X icon on each).

- [x] Recent products section: list of recently visited products from `recentProducts`, showing name and last visited time (relative format). Clickable to navigate.

- [x] Notification/message panel: show count of unread messages as badge on bell icon in top nav. Clicking bell opens a small dropdown panel (positioned below the bell icon, right-aligned, width ~360px, max-height 400px, shadow per DESIGN.md). Panel shows list of messages from `messages` array: each shows type icon (color-coded: blue for system, orange for billing, red for security), title (bold if unread), relative timestamp. Clicking a message marks it as read (updates `isRead: true` in state) and could open a detail or just mark-and-close. "Mark All Read" link at top of panel.

### ECS Instance List (`/ecs/instances`)

- [x] Page header: "Instances" title on left, "Create Instance" primary orange button on right (opens create instance wizard modal, see P2). Breadcrumb above: "Console Home > ECS > Instances".

- [x] Filter bar above table: (1) Search input (placeholder "Search by name or ID") that filters the table client-side; (2) Status dropdown filter ("All Status", "Running", "Stopped", "Starting", "Stopping", "Expired"); (3) Billing method dropdown ("All", "Subscription", "Pay-As-You-Go"); (4) "Refresh" icon button that triggers a visual refresh animation. All filters apply client-side to the instance list for the current region.

- [x] Data table (see DESIGN.md `.data-table` styles): columns are:
  - Checkbox (for bulk select)
  - Instance Name / ID: two lines -- name in blue link (clickable, navigates to `/ecs/instances/:id`), ID in monospace gray below (e.g., `i-bp1234567890abcdef`). Copy icon next to ID that copies to clipboard.
  - Status: colored status tag using `.status-tag` styles -- green "Running", red "Stopped", blue "Starting"/"Stopping"
  - Zone: e.g., "cn-hangzhou-h"
  - IP Address: show both public (if exists) and private IP, each on separate line. If no public IP, show "--".
  - Instance Type: e.g., "ecs.g7.xlarge" with "(4 vCPU, 16 GiB)" subtitle
  - OS: icon + OS name (truncated if long)
  - Billing: "Subscription" or "Pay-As-You-Go", for subscription show expiry date below
  - Actions column: "More" dropdown button containing: "Start" (only if Stopped), "Stop" (only if Running), "Restart" (only if Running), divider, "Change Instance Type" (no-op), "Reset Password" (no-op), divider, "Release" (shows confirmation dialog)

- [x] Table row hover highlight `#F2F6FC`. Rows for current region only (filter by `regionId === currentRegion`).

- [x] Bulk actions bar: appears when one or more checkboxes are selected. Shows "N items selected" count and action buttons: "Start", "Stop", "Restart", "Release" -- each applies the action to all selected instances (with confirmation dialog for destructive actions).

- [x] Pagination below table: total count display ("Total N items"), page size selector (10/20/50), page number buttons, prev/next arrows (see DESIGN.md `.pagination` styles).

### ECS Instance Detail (`/ecs/instances/:id`)

- [x] Page header: instance name (editable -- pencil icon, clicking enables inline text input to rename, pressing Enter or blur saves to state), status tag, and action buttons: "Start" / "Stop" / "Restart" (contextual based on current status). Breadcrumb: "Console Home > ECS > Instances > [instance name]".

- [x] Tab navigation (see DESIGN.md section 12): tabs are "Instance Details", "Monitoring", "Security Groups", "Cloud Disks", "Snapshots" (placeholder).

- [x] **Instance Details tab** (default): Two-column key-value grid in a card. Left column: Instance Name, Instance ID (monospace + copy button), Status, Region, Zone, Instance Type, vCPU / Memory, Image, OS Name, Creation Time. Right column: VPC ID (blue link), VSwitch ID, Security Group IDs (blue links), Private IP, Public IP, Key Pair Name, Billing Method, Auto-Renewal Status, Expiry Time. Tags section below: display tags as colored pills `key: value`, with "Edit Tags" button that opens inline tag editor (add/remove key-value pairs).

- [x] **Monitoring tab**: Show 4 mock metric cards in a 2x2 grid, each containing a simple line chart area (use CSS or simple SVG paths -- no charting library): "CPU Utilization (%)", "Memory Utilization (%)", "Network In (Mbps)", "Network Out (Mbps)". Each card shows the metric name, current value, and a fake static chart line. Time range selector at top: "1 Hour", "6 Hours", "1 Day", "7 Days" (toggling these just updates a label, chart stays static).

- [x] **Security Groups tab**: table listing the security groups associated with this instance (`securityGroupIds`). Columns: Group Name/ID (link to `/ecs/security-groups/:id`), Description, Rule Count, VPC ID. "Add to Security Group" button (opens a select dropdown of available groups, confirming adds the group ID to the instance's `securityGroupIds` array).

- [x] **Cloud Disks tab**: table of disks attached to this instance (filter `disks` where `instanceId === this instance`). Columns: Disk ID, Name, Status, Category, Size (GiB), Device, Type (system/data). "Create Disk" button (see P2).

### ECS Instance Actions (state mutations)

- [x] **Start instance**: changes status from "Stopped" to "Starting" immediately, then after 1.5s timeout changes to "Running". Update the instance in state. Add an entry to `operationLog`.

- [x] **Stop instance**: confirmation dialog: "Are you sure you want to stop instance [name]? The instance will be shut down." On confirm, changes status to "Stopping", then after 1.5s to "Stopped". Update state + operation log.

- [x] **Restart instance**: confirmation dialog. Changes status to "Stopping" -> 1s -> "Starting" -> 1s -> "Running". Update state + operation log.

- [x] **Release instance**: confirmation dialog with warning icon: "This action is irreversible! Instance [name] and its system disk will be permanently deleted." Requires user to type the instance ID in an input field to confirm. On confirm, removes the instance from `ecsInstances`, removes associated system disk, detaches data disks (set `instanceId` to ""), and adds operation log entry. Navigates back to instance list.

- [x] **Rename instance**: inline edit on the instance detail page. Updates the `name` field in state.

### OSS Bucket List (`/oss/buckets`)

- [x] Page header: "Buckets" title, "Create Bucket" primary orange button (opens create bucket modal). Breadcrumb: "Console Home > OSS > Buckets".

- [x] Data table: columns: Bucket Name (blue link to `/oss/buckets/:name`), Region, Storage Class (tag styled), ACL (tag styled: "Private" gray, "Public Read" blue, "Public Read-Write" orange warning), Object Count, Storage Size (formatted as GiB/MiB), Created Time. Search filter above table for bucket name.

- [x] Note: OSS buckets are region-independent in the list view (show all buckets regardless of region selector, but display the region column). This matches real Xliyun behavior.

### OSS Bucket Detail (`/oss/buckets/:name`)

- [x] Page header: bucket name, status "Active". Breadcrumb: "Console Home > OSS > Buckets > [bucket name]".

- [x] Tab navigation: "Overview", "Files", "Settings".

- [x] **Overview tab**: Key-value display: Bucket Name, Region, Storage Class, ACL, Versioning, Encryption, Object Count, Storage Size, Created, Last Modified. Endpoint display: `[bucket-name].oss-[region].aliyuncs.com` (read-only text with copy button).

- [x] **Files tab**: Mock file browser. Show a breadcrumb path starting at root `/`. Table columns: Name (file icon or folder icon + name as link), Size, Last Modified, Storage Class, Actions (Download link -- no-op, Delete -- removes from mock data). "Upload" button at top (opens modal where user types a filename and it adds a mock file entry to state). Mock file entries: use static seed data of ~10 files with realistic names like `index.html`, `styles.css`, `images/logo.png`, `data/export.csv`, etc.

- [x] **Settings tab**: Read-only display of bucket settings: Versioning toggle (visual only -- on/off switch that updates state), ACL radio group (private/public-read/public-read-write -- updates state), Storage Class display, Encryption display.

### RDS Instance List (`/rds/instances`)

- [x] Page header: "Instances" title, "Create Instance" button (disabled or opens simple modal). Breadcrumb: "Console Home > RDS > Instances".

- [x] Data table: columns: Instance Name/ID (two-line like ECS, link to detail), Status tag, Engine (icon + name like "MySQL 8.0"), Instance Class (e.g., `rds.mysql.s3.large`), Storage (GiB), Region/Zone, VPC, Billing, Actions dropdown ("Manage" link to detail, "Restart", "Release"). Filter by current region.

### RDS Instance Detail (`/rds/instances/:id`)

- [x] Page header: instance name, status tag, engine version badge. Action buttons: "Restart", "Release" (with confirmation).

- [x] Tab navigation: "Basic Information", "Connection", "Monitoring", "Backup" (placeholder).

- [x] **Basic Information tab**: Two-column key-value: Instance ID, Name, Status, Engine, Engine Version, Instance Class, vCPU, Memory, Storage Size, Storage Type, Category (High Availability etc.), Max Connections, Max IOPS, Region, Zone, VPC, VSwitch, Billing Method, Created, Expires.

- [x] **Connection tab**: Card showing: Internal Endpoint (connection string, monospace + copy), Port (3306, copy), VPC ID, VSwitch ID. "Apply for Public Endpoint" button (no-op).

### VPC List (`/vpc/list`)

- [x] Page header: "VPCs" title, "Create VPC" primary button (opens create modal). Breadcrumb: "Console Home > VPC > VPCs".

- [x] Data table: columns: VPC Name/ID (link, two-line), Status tag, CIDR Block (monospace), VSwitch Count, Route Table Count, Description, Created. Filter by current region.

- [x] Create VPC modal: form fields: Name (text input), CIDR Block (dropdown: "172.16.0.0/12", "10.0.0.0/8", "192.168.0.0/16"), Description (textarea). On submit creates a new VPC entry in state with auto-generated ID `vpc-bp` + 16 random hex chars.

### VSwitch List (`/vpc/vswitches`)

- [x] Data table: columns: VSwitch Name/ID, Status, VPC (link), Zone, CIDR Block, Available IP Count, Description, Created. Filter by current region.

- [x] Create VSwitch modal: VPC dropdown (select from existing VPCs), Zone dropdown, Name, CIDR Block input, Description. Creates entry in state.

### Security Group List (`/ecs/security-groups`)

- [x] Page header: "Security Groups" title, "Create Security Group" button. Breadcrumb: "Console Home > ECS > Security Groups".

- [x] Data table: columns: Security Group Name/ID (link to detail), VPC (link), Type, Instance Count, Rule Count, Description, Created. Filter by current region.

- [x] Create Security Group modal: Name, Description, VPC dropdown, Type radio (Normal/Enterprise). Creates entry with empty rules array.

### Security Group Rules (`/ecs/security-groups/:id`)

- [x] Page header: security group name, ID. Breadcrumb includes group name.

- [x] Two sections with tab toggle: "Inbound Rules" and "Outbound Rules" (filter `rules` by `direction`).

- [x] Rules table: columns: Priority, Protocol, Port Range, Source (for inbound) or Destination (for egress), Policy (Accept/Drop tag), Description, Actions ("Delete" link -- removes rule from array with confirmation).

- [x] "Add Rule" button above each table: opens inline form row at top of table OR a modal with fields: Protocol dropdown (TCP/UDP/ICMP/All), Port Range input (e.g., "80/80" or "1/65535"), Source/Dest CIDR input, Priority (1-100 number input, default 1), Policy radio (Accept/Drop), Description. On submit, adds rule to the security group's rules array in state.

### Billing Dashboard (`/billing/overview`)

- [x] Balance card: large display of current balance `CNY 12,586.42` in bold, "Top Up" orange button (no-op). Credit rating badge "A".

- [x] Monthly spend chart: bar chart showing last 6 months spend from `billing.monthlySpend`. Use simple CSS-based horizontal or vertical bars (no charting library). Each bar labeled with month and amount.

- [x] Product cost breakdown: horizontal bar chart or table showing `billing.productBreakdown` -- product name, amount, percentage bar. Sorted by amount descending.

- [x] Renewal reminders card: list items from `billing.renewalReminders` showing resource name, type, expiry date, "N days left" in orange if < 30 days. "Renew" link (no-op).

- [x] Coupons card: list available coupons with name, amount, expiry date, status badge.

### Region Selector (global)

- [x] Dropdown in top nav bar: styled per DESIGN.md `.region-selector`. Current region displayed as text. On click, opens dropdown with two groups: "China" and "International" (grouped by `zone` field). Each region shows both English name and region ID. Selecting updates `user.region` (or `currentRegion`) in state. All resource list pages re-filter by the new region.

### Global Search (top nav)

- [x] Search input in top nav: on focus, expands slightly. As user types, show dropdown results below with two sections: "Products" (matching products from catalog) and "Resources" (matching ECS/OSS/RDS instances by name or ID). Clicking a product navigates to its service page. Clicking a resource navigates to its detail page. If no matches, show "No results". Debounce input by 200ms.

---

## P2 -- Secondary Features

<!-- Depth and realism, implement after P1 is solid. -->

- [ ] ECS Create Instance wizard: multi-step modal or full-page form. Steps: (1) Billing Method -- radio: Subscription / Pay-As-You-Go; (2) Region & Zone -- dropdowns; (3) Instance Type -- select from a small list of 5-6 types with vCPU/memory specs; (4) Image -- select OS (Alibaba Cloud Linux / CentOS / Ubuntu / Windows Server); (5) Storage -- system disk size slider (20-500 GiB), category dropdown (cloud_essd/cloud_ssd); (6) Networking -- VPC dropdown, VSwitch dropdown, Security Group checkboxes, assign public IP toggle + bandwidth slider; (7) Key Pair -- dropdown; (8) Name + Tags. "Create" button adds instance to state with "Starting" status, then transitions to "Running" after 2s. Navigate to instance list.

- [ ] Disk management (`/ecs/disks`): list page with create/attach/detach. Create disk modal: name, zone, category, size. Attach modal: select instance in same zone. Detach: confirmation + update state.

- [ ] EIP management: would be at `/ecs/eips`. List, bind to instance, unbind. Lower priority since it overlaps with instance detail.

- [ ] SLB Instance list (`/slb/instances`): table showing load balancers. Detail page showing listeners in a sub-table. "Add Listener" form: protocol, frontend port, backend port.

- [ ] CloudMonitor Alarms (`/monitor/alarms`): table of alarms with status indicator (green OK / red ALARM / gray INSUFFICIENT_DATA). Toggle enable/disable. Create alarm form: name, product, metric, threshold, comparison operator.

- [ ] Notification center: dedicated page or expanded dropdown showing all messages, filterable by type. Mark individual or all as read.

- [ ] Operation log (`/ecs/operation-log` or a global section): table of recent operations from `operationLog` with time, service, event, resource, result. Search and time-range filter.

- [ ] Favorites management: drag-to-reorder favorites in console home. Add/remove from product catalog.

- [ ] Sidebar collapse animation: smooth width transition from 200px to 48px with icon-only display. Remember collapsed state in localStorage.

- [ ] Cost analysis page (`/billing/bills`): table of monthly bills broken down by product. Simple filter by month dropdown.

- [ ] OSS bucket creation modal: bucket name input (validate: lowercase, no special chars, 3-63 chars), region dropdown, storage class radio, ACL radio. Creates bucket in state.

- [ ] VPC detail page (`/vpc/list/:id`): show VPC info and list of VSwitches within it.

- [ ] Dark mode toggle (stretch): toggle in user dropdown that switches CSS variables. Low priority.

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. See data_model.md for complete field definitions. -->

- [x] **Regions**: 10 regions as defined in data_model.md. Default selected: `cn-hangzhou`.

- [x] **ECS Instances**: 6 instances across 2 regions (4 in cn-hangzhou, 2 in cn-shanghai). Mix: 3 Running + 2 Stopped + 1 Expired. Mix of Subscription and Pay-As-You-Go. Mix of Linux (4) and Windows (2). Realistic names: "web-server-prod-01", "api-server-prod-01", "db-proxy-01", "dev-test-01", "staging-web-01", "log-collector-01". Instance types: ecs.g7.xlarge, ecs.c7.large, ecs.g7.2xlarge, ecs.t6-c1m1.large, ecs.g7.large, ecs.s6-c1m2.small.

- [x] **Disks**: 10 disks (6 system disks attached to 6 instances + 4 data disks, 3 attached, 1 Available/unattached). Various categories: cloud_essd, cloud_ssd, cloud_efficiency.

- [x] **Security Groups**: 3 groups in cn-hangzhou VPC: "web-sg-prod" (HTTP/HTTPS/SSH rules), "app-sg-prod" (custom port range rules), "db-sg-prod" (MySQL 3306, PostgreSQL 5432 from internal only). Each has 3-5 inbound rules and 1 default outbound allow-all rule.

- [x] **VPCs**: 2 VPCs -- "prod-vpc" in cn-hangzhou (172.16.0.0/12) and "dev-vpc" in cn-hangzhou (10.0.0.0/8).

- [x] **VSwitches**: 4 vswitches -- 2 per VPC (web-subnet, app-subnet in prod; dev-subnet-a, dev-subnet-b in dev).

- [x] **EIPs**: 3 -- 2 InUse (bound to ECS instances), 1 Available.

- [x] **OSS Buckets**: 4 buckets across different regions: "hangzhoutech-static-assets" (Standard, cn-hangzhou), "hangzhoutech-backups" (IA, cn-shanghai), "hangzhoutech-logs" (Archive, cn-hangzhou), "hangzhoutech-media" (Standard, cn-hangzhou, public-read). Include mock file entries for the first bucket (10-15 files with realistic names and sizes).

- [x] **RDS Instances**: 2 -- "prod-mysql-master" (MySQL 8.0, Running, cn-hangzhou) and "prod-postgres" (PostgreSQL 15, Running, cn-hangzhou).

- [x] **SLB Instances**: 2 -- "prod-web-lb" (internet, active, 2 listeners) and "prod-internal-lb" (intranet, active, 1 listener).

- [x] **Billing**: balance 12586.42 CNY, 6 months of spend data, product breakdown totaling current month, 1 coupon, 1 renewal reminder.

- [x] **Alarms**: 4 -- 2 OK, 1 ALARM (CPU high on an instance), 1 INSUFFICIENT_DATA (new alarm).

- [x] **Operation Log**: 10 recent entries covering: StopInstance, StartInstance, CreateInstance, DeleteInstance, CreateSecurityGroupRule, CreateBucket, ModifyInstanceAttribute, etc. Spanning last 7 days.

- [x] **Messages**: 5 messages -- 2 unread (renewal reminder, security alert), 3 read (billing, system update, product announcement).

- [x] **Products & Favorites**: recentProducts (5 items) and favoriteProducts (3 items) as defined in data_model.md.

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login (app starts pre-logged-in as "Zhang Wei" with admin role at "Hangzhou Tech Co.")
- Real API calls or network requests (all data is mock, in localStorage)
- File uploads to real servers (OSS upload creates mock entries only)
- Real-time monitoring data (charts show static mock data)
- RAM (Resource Access Management) user/role/policy management
- Marketplace / third-party products
- International site vs China site switching (mock is English-only)
- SSL certificate management
- DNS / Domain registration
- Container service (ACK) management
- Serverless / Function Compute
- Real clipboard API for copy buttons (use `navigator.clipboard.writeText` with try-catch fallback)
