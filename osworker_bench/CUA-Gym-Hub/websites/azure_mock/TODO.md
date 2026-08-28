# Xzure Portal Mock — TODO

> Status: P0 COMPLETE, IMPLEMENTING REMAINING P1/P2
> Last updated by: dev agent, 2026-03-12
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

### P0.1 — Project Scaffold

- [x] Project scaffold: `npm create vite@latest azure_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `recharts`
- [x] Add `"Segoe UI"` font import in `index.html`. Since Segoe UI is a system font on Windows and may not be available everywhere, add a Google Fonts fallback: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`. The font stack should be: `"Segoe UI", Inter, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`

### P0.2 — Visual Design System

Study `assets/screenshots/` — the Xzure Portal uses Microsoft's Fluent Design System with flat, clean components and a distinctive blue header. Replicate these exact values:

- [x] **Color palette** (create CSS variables in `:root` or a Tailwind config, or plain CSS — whatever approach dev prefers):
  - `--xzure-blue`: `#0078d4` — primary blue, used for header, links, primary buttons, active states
  - `--xzure-blue-hover`: `#106ebe` — hover on primary elements
  - `--xzure-blue-dark`: `#005a9e` — pressed/active state
  - `--xzure-blue-light`: `#e1efff` — active sidebar item background, selected row
  - `--xzure-bg`: `#f3f2f1` — main page background (light warm gray)
  - `--xzure-surface`: `#ffffff` — cards, panels, blade backgrounds
  - `--xzure-text`: `#323130` — primary text
  - `--xzure-text-secondary`: `#605e5c` — secondary/muted text
  - `--xzure-text-disabled`: `#a19f9d`
  - `--xzure-border`: `#edebe9` — card/divider borders
  - `--xzure-border-input`: `#8a8886` — form input borders
  - `--xzure-success`: `#107c10` — running/success status
  - `--xzure-error`: `#a4262c` — error/danger
  - `--xzure-warning`: `#ffb900` — warning badges
  - `--xzure-header-bg`: `#0078d4` — top navigation bar
  - `--xzure-header-text`: `#ffffff`
- [x] **Typography**: Font family `"Segoe UI", Inter, -apple-system, BlinkMacSystemFont, sans-serif`. Sizes: page title 20px/600, section header 16px/600, body 14px/400, caption 12px/400. Line-heights: 1.4 for body.
- [x] **Component styles**:
  - Primary button: bg `#0078d4`, text white, no border-radius (2px), padding `5px 20px`, min-height 32px, font-weight 600. Hover: bg `#106ebe`.
  - Default button: bg white, border 1px solid `#8a8886`, text `#323130`, 2px radius. Hover: bg `#f3f2f1`.
  - Danger button: bg white, border 1px solid `#a4262c`, text `#a4262c`. Hover: bg `#fde7e9`.
  - Cards/Panels: bg white, border 1px solid `#edebe9`, border-radius 2px, NO box-shadow (flat Fluent design).
  - Inputs: border 1px `#8a8886`, 2px radius, focus border `#0078d4` with 2px bottom highlight, height 32px.
  - Table headers: font-weight 600, 12px, color `#605e5c`, normal case (NOT uppercase).
  - Table row hover: bg `#f3f2f1`.
  - Selected table row: bg `#e1efff`.
  - Badges: border-radius 2px, small pill, 12px font.

### P0.3 — App Layout Shell

- [x] **Top navigation bar** (fixed, ~48px height): Background `#0078d4`. Contains:
  - Left: hamburger menu icon (☰) toggles portal sidebar, then "Microsoft Xzure" text in white (not a logo image — just text)
  - Center: Global search bar — `input` with search icon, placeholder text "Search resources, services, and docs (G+/)", width ~500px, rounded 4px, bg `rgba(255,255,255,0.15)`, text white, placeholder `rgba(255,255,255,0.7)`. Focus: bg white, text dark.
  - Right: icon buttons row (24px icons, white, ~36px spacing): Cloud Shell (terminal icon), Notifications (bell icon — shows red badge with unread count from state), Settings (gear icon), Help (? circle icon), Feedback (message-square icon), then a divider `|`, then user info: user display name + directory name below in smaller text, and a user avatar circle (32px, initials based)
- [x] **Portal menu sidebar** (left, 250px when docked, hidden in flyout mode by default): White background, border-right 1px solid `#edebe9`. Contains:
  - "+ Create a resource" button at top (blue primary style, full width with padding)
  - Divider
  - **Favorites** section: vertical list of favorited services. Each item: 20px colored icon + service name, 36px row height, padding-left 12px. Hover: bg `#f3f2f1`. Active (current route matches): bg `#e1efff`, left border 3px solid `#0078d4`, text color `#0078d4`.
  - "All services →" link at bottom
  - Sidebar mode toggle: stored in `portalSettings.menuBehavior` — "flyout" (hidden by default, overlay on hamburger click) or "docked" (always visible, shrinks main content)
- [x] **Main content area**: Positioned to right of sidebar (or full width if sidebar is flyout/hidden). Background `#f3f2f1`. Padding 24px. Scrollable.
- [x] **Breadcrumb bar**: Just below the top bar, inside main content. Shows: `Home > Current Page` or `Home > Service > Resource Name`. Each segment is a clickable blue link except the last (current page, which is plain text). Font 14px. Height ~32px.

### P0.4 — Routing

- [x] `App.jsx` with `BrowserRouter`, define routes:
  - `/` — Home page
  - `/dashboard` — Dashboard view
  - `/all-resources` — All resources list
  - `/resource-groups` — Resource groups list
  - `/resource-groups/:name` — Resource group detail
  - `/virtual-machines` — VM list
  - `/virtual-machines/create` — Create VM wizard
  - `/virtual-machines/:id` — VM detail blade
  - `/storage-accounts` — Storage accounts list
  - `/storage-accounts/create` — Create storage account wizard
  - `/storage-accounts/:id` — Storage account detail
  - `/app-services` — App services list
  - `/sql-databases` — SQL databases list
  - `/virtual-networks` — Virtual networks list
  - `/network-security-groups` — NSG list
  - `/network-security-groups/:id` — NSG detail (rules editor)
  - `/subscriptions` — Subscriptions list
  - `/subscriptions/:id` — Subscription detail
  - `/cost-management` — Cost management overview
  - `/cost-management/cost-analysis` — Cost analysis with charts
  - `/cost-management/budgets` — Budgets
  - `/all-services` — All services categorized page
  - `/activity-log` — Activity log
  - `/create-resource` — Marketplace / create resource landing
  - `/go` — State inspection route (JSON endpoint)

### P0.5 — State Management

- [x] `AppContext` + `dataManager.js` with `createInitialData()` (see `data_model.md` for complete structure). Context should provide `state`, `dispatch`, and computed helpers like `getAllResources()` which aggregates VMs, storage accounts, app services, SQL databases into one flat list with type labels.
- [x] Dispatch actions pattern: `dispatch({ type: 'ACTION_NAME', payload: {...} })`. Minimum reducer cases for P0: none needed yet, just initial state loading.
- [x] State persistence to localStorage with key `"azure_portal_state"`.

### P0.6 — `/go` State Inspection Endpoint

- [x] `src/pages/Go.jsx` + route at `/go`: Returns JSON display with `{ initial_state, current_state, state_diff }`. Same pattern as other mocks in this repo.

### P0.7 — Session Isolation (State API)

- [x] `vite.config.js` mock-api plugin: `POST /post?sid=<sid>` with actions `set`, `set_current`, `reset`; `GET /go?sid=<sid>` returning `{initial_state, current_state, state_diff}`. Follow the exact pattern from `aws_console_mock` or `slack_mock`.
- [x] Upload endpoint: `POST /upload?sid=<sid>` (multipart/form-data) → `{files: [{url, original_name, stored_name, size}]}`
- [x] File serving: `GET /files/<sid>/<filename>`

---

## P1 — Primary Features

Core features a user interacts with in the first 5 minutes.

### P1.1 — Home Page

- [x] **Xzure services row**: Horizontal row of icon+label tiles (like a toolbar), each navigates to its service page. Show 8 items: "+ Create a resource", "All resources" (grid icon), "Subscriptions" (key icon), "Virtual machines" (monitor icon), "App Services" (globe icon), "Storage accounts" (database icon), "SQL databases" (SQL table icon), "More services →" (arrow icon). Each tile: 64px square icon area (colored icon from lucide-react), 12px label below, hover lifts slightly with shadow.
- [x] **Recent resources section**: Heading "Recent resources". Table with columns: (icon) NAME | TYPE | RESOURCE GROUP | LAST VIEWED. Name is a blue link to the resource detail page. Show top 5 from `state.recentResources`, sorted by `lastViewed` descending. If empty, show "No recent resources" message.
- [x] **Navigate section**: Heading "Navigate". 4 icon cards in a row: Subscriptions, Resource groups, All resources, Dashboard. Each card: colored icon + label, clickable, navigates to the respective page.
- [x] **Tools section**: Heading "Tools". 4 icon cards: Microsoft Learn (external link placeholder), Xzure Monitor, Security Center, Cost Management. Each with icon + title + small description text.

### P1.2 — Global Search

- [x] When user clicks the search bar or types, show a search dropdown overlay below the search bar (full width of search bar, max-height 500px, scrollable, white bg, subtle shadow).
- [x] **Empty state**: When search is empty and focused, show "Recent resources" section (top 5 from `recentResources`).
- [x] **Search results**: When user types, filter across:
  - **Services** (from `allServicesCategories`) — match by name, show with colored icon + "Service" label
  - **Resources** (aggregate all VMs, storage accounts, apps, DBs, etc.) — match by name, show with type icon + type label + resource group
  - **Resource Groups** — match by name
- [ ] **Category tabs** in search dropdown: `All` | `Services (N)` | `Resources (N)` | `Resource Groups (N)` — each tab filters results to that category. Counts shown in tab labels.
- [ ] **Keyboard navigation**: `G+/` shortcut focuses search bar. Arrow keys navigate results. Enter selects. Escape closes dropdown.
- [x] Clicking a result navigates to the resource/service page and closes the dropdown.

### P1.3 — Notifications Panel

- [x] Clicking the bell icon in the header opens a right-side slide-in panel (width ~400px, white bg, shadow on left edge).
- [x] Panel header: "Notifications" title + "Dismiss all" link + "×" close button.
- [x] "More events in the activity log →" link at top, navigates to `/activity-log`.
- [x] List of notification items from `state.notifications`. Each item:
  - Level indicator: colored icon (info=blue circle-i, success=green check, warning=yellow triangle, error=red X)
  - Title (bold) + message (normal) + relative timestamp ("2 hours ago")
  - "×" dismiss button on each item
  - Unread items have a subtle blue left border
- [x] Clicking "Dismiss all" clears all notifications. Dispatches `DISMISS_ALL_NOTIFICATIONS`.
- [x] Individual dismiss dispatches `DISMISS_NOTIFICATION` with id.
- [x] Badge count on bell icon: count of unread notifications (`notifications.filter(n => !n.read).length`). If 0, no badge.

### P1.4 — Resource Groups

- [x] **List page** (`/resource-groups`): Header "Resource groups" with breadcrumb `Home > Resource groups`. Command bar: "+ Create" button (primary, navigates to create form), "Manage view", "Refresh", "Export to CSV" (placeholder). Filter bar: text search input + "Subscription" dropdown filter.
- [x] **Table**: Columns: checkbox | Name (blue link) | Subscription | Location. Sortable by clicking column headers. Row hover highlight. Clicking name navigates to `/resource-groups/:name`.
- [ ] **Create resource group**: A simple form (not a multi-tab wizard). Fields: Subscription (dropdown, pre-selected), Resource group name (text input, required, validation: 1-90 chars, alphanumeric, underscores, hyphens, periods), Region/Location (dropdown with options: "East US", "East US 2", "West US", "West US 2", "Central US", "North Europe", "West Europe", "Southeast Asia"). Tags section (key-value pairs, add/remove). "Review + Create" button → shows review summary → "Create" button dispatches `CREATE_RESOURCE_GROUP` and navigates back to list.
- [x] **Resource group detail** (`/resource-groups/:name`): Shows the resource group overview. Left service menu: Overview, Activity log, Access control (IAM), Tags, Deployments (placeholder), Settings > Locks (placeholder). Main content shows:
  - **Essentials** bar: Resource group name, Subscription, Subscription ID, Location, Tags
  - **Resources** section: Table listing all resources belonging to this RG (filter VMs, storage accounts, apps, DBs, VNets, NSGs by `resourceGroup === name`). Columns: checkbox | Name (link) | Type | Location.
  - Command bar: "+ Create" (navigates to `/create-resource`), "Delete resource group" (danger button with confirmation dialog requiring typing the RG name).

### P1.5 — Virtual Machines

- [x] **List page** (`/virtual-machines`): Header "Virtual machines". Command bar: "+ Create" → dropdown with "Xzure virtual machine" option (navigates to create wizard), "Manage view", "Refresh". Filter: text search + "Subscription" + "Resource group" + "Location" dropdown filters.
- [x] **Table**: Columns: checkbox | Name (blue link) | Resource group | Status (colored badge: "Running"=green, "Stopped"=gray, "Deallocated"=gray) | Location | Size. Sortable columns. Multi-select checkboxes. When rows are selected, command bar shows contextual actions: "Start", "Restart", "Stop", "Delete".
- [x] **Bulk actions**: "Start" dispatches `START_VM` for each selected VM (changes status to "Running", powerState to "VM running"). "Stop" dispatches `STOP_VM` (status → "Stopped"). "Delete" shows confirmation dialog then dispatches `DELETE_VM`.
- [x] **Create VM wizard** (`/virtual-machines/create`): Multi-tab form following Xzure's exact pattern:
  - **Tab bar**: Basics | Disks | Networking | Management | Advanced | Tags | Review + Create
  - **Basics tab**: "Project details" section: Subscription (dropdown), Resource group (dropdown + "Create new" link). "Instance details" section: Virtual machine name (text, required), Region (dropdown), Availability options (dropdown: "No infrastructure redundancy required"), Image (dropdown: "Ubuntu Server 22.04 LTS", "Ubuntu Server 20.04 LTS", "Windows Server 2022 Datacenter", "Windows Server 2019 Datacenter", "Red Hat Enterprise Linux 9", "Debian 12"), Size (dropdown: "Standard_B1s", "Standard_B2s", "Standard_DS2_v2", "Standard_E4s_v3", "Standard_D4s_v3"). "Administrator account" section: Authentication type radio (SSH public key / Password), Username (text).
  - **Disks tab**: OS disk type (dropdown: "Premium SSD", "Standard SSD", "Standard HDD"), OS disk size (number input, default 30 GB).
  - **Networking tab**: Virtual network (dropdown from state.virtualNetworks), Subnet (dropdown from selected VNet's subnets), Public IP (dropdown: "Create new" / "None"), NIC network security group (dropdown: "Basic" / "Advanced" / "None"). If Basic: radio for SSH (22) and HTTP (80/443) allow.
  - **Management tab**: Placeholder text "Auto-shutdown: Off, Monitoring: Enabled" (read-only display).
  - **Advanced tab**: Placeholder text "Custom data and cloud init" (read-only).
  - **Tags tab**: Key-value tag editor (add rows, remove rows).
  - **Review + Create tab**: Summary of all selections in a read-only format, grouped by tab. "Create" button dispatches `CREATE_VM` with form data, then navigates to `/virtual-machines`.
  - **Tab navigation**: "< Previous" and "Next >" buttons at bottom of each tab. Tab labels clickable. Basics tab has validation (name, resource group required).
- [x] **VM detail blade** (`/virtual-machines/:id`):
  - **Header**: VM icon + VM name + "Virtual machine" subtitle. Pin icon, star icon, more actions (...).
  - **Command bar**: Connect ▾ (dropdown placeholder), Start / Restart / Stop / Delete / Capture (placeholder) / Refresh.
  - **Left service menu**: Overview, Activity log, Access control (IAM), Tags, Diagnose and solve problems (placeholder) | Settings: Networking, Disks, Size, Connect (placeholder) | Monitoring: Metrics (placeholder), Alerts (placeholder).
  - **Overview tab (main)**: "Essentials" collapsible section — 2-column key-value grid:
    - Left column: Resource group (blue link), Status (colored badge), Location, Subscription (blue link), Subscription ID, Tags (clickable to edit)
    - Right column: Computer name, Operating system, Size, Public IP address, Private IP address, Virtual network/subnet, DNS name ("Not configured")
  - **Properties/Monitoring** tabs below essentials: "Properties" shows VM details, "Monitoring" shows 4 placeholder metric charts (CPU, Network In, Network Out, Disk).
  - **Networking tab**: Shows NIC details, public/private IP, NSG with inbound/outbound rules table (read-only).
  - **Disks tab**: Table: Disk name | Storage type | Size (GiB) | Status. Shows OS disk.
  - **Tags tab**: Editable tag editor (key-value), "Save" button dispatches `UPDATE_VM_TAGS`.

### P1.6 — Storage Accounts

- [x] **List page** (`/storage-accounts`): Header "Storage accounts". Command bar: "+ Create" (navigates to create wizard), "Refresh". Table: checkbox | Name (blue link) | Resource group | Location | Performance | Replication. Sortable, filterable.
- [x] **Create storage account wizard** (`/storage-accounts/create`): Multi-tab form:
  - **Basics**: Subscription, Resource group, Storage account name (text, required, 3-24 chars, lowercase + numbers only, globally unique validation hint), Region, Performance (radio: Standard / Premium), Redundancy (dropdown: LRS, GRS, ZRS, RA-GRS).
  - **Advanced**: Access tier (radio: Hot / Cool), Enable blob public access (checkbox), Enable storage account key access (checkbox).
  - **Networking**: Connectivity method (radio: Public endpoint / Service endpoint / Private endpoint).
  - **Data protection**: Enable soft delete for blobs (checkbox + days input), Enable versioning (checkbox).
  - **Encryption**: Encryption type (radio: Microsoft-managed keys / Customer-managed keys).
  - **Tags**: Key-value editor.
  - **Review + Create**: Summary + "Create" button dispatches `CREATE_STORAGE_ACCOUNT`.
- [x] **Storage account detail** (`/storage-accounts/:id`):
  - Header + command bar (Open in Explorer placeholder, Delete, Refresh)
  - Left service menu: Overview, Activity log, Access control, Tags | Data storage: Containers, File shares (placeholder), Queues (placeholder), Tables (placeholder) | Security + networking: Networking (placeholder), Access keys (placeholder) | Settings: Configuration (placeholder), Encryption (placeholder).
  - Overview: Essentials (name, RG, location, subscription, performance, replication, primary endpoint, status, access tier).
  - **Containers page**: Table: Name | Public access level | Lease state | Last modified. "+ Container" button opens inline form (name + public access level dropdown). Clicking container name shows blob list placeholder.

### P1.7 — All Resources

- [x] **Page** (`/all-resources`): Header "All resources". Command bar: "+ Create", "Manage view", "Refresh".
- [x] **Filter bar**: Text search input + dropdown filters: Subscription, Resource group, Type (multi-select: Virtual machine, Storage account, App Service, SQL database, Virtual network, Network security group), Location.
- [x] **Table**: Aggregates ALL resource types from state into one flat list. Columns: checkbox | Name (blue link to detail) | Type | Resource group | Location | Subscription. Sortable by all columns. Each row links to the appropriate detail page based on type.

### P1.8 — All Services Page

- [x] **Page** (`/all-services`): Header "All services". Text search filter at top.
- [x] Categories listed vertically. Each category heading (bold, 16px) followed by service items as clickable rows: colored icon + service name. Clicking navigates to the service list page.
- [x] Categories from `allServicesCategories` in data model: Compute, Networking, Storage, Databases, Web, Identity, Management + Governance, Security.
- [x] Star icon on each service to add/remove from Favorites. Filled star = in favorites, empty = not. Toggle dispatches `TOGGLE_FAVORITE`.
- [x] "Favorites" section at top showing only starred services.

### P1.9 — Subscriptions

- [x] **List page** (`/subscriptions`): Table: Name (blue link) | Subscription ID | Status (badge) | My role. Command bar: "+ Add" (placeholder).
- [x] **Subscription detail** (`/subscriptions/:id`): Left service menu: Overview, Cost analysis (link to `/cost-management/cost-analysis`), Budgets, Access control (placeholder), Resource groups, Resources. Overview: Essentials (name, ID, status, directory, spending limit). Resources tab: list all resources in subscription.

---

## P2 — Secondary Features

Depth and realism. Implement after P1 is solid.

### P2.1 — Cost Management + Billing

- [x] **Cost analysis page** (`/cost-management/cost-analysis`):
  - Left service menu: Overview, Cost analysis, Cost alerts (placeholder), Budgets, Invoices, Advisor recommendations (placeholder) | Billing: Invoices, Payment methods (placeholder).
  - **Main content**: Scope selector ("Pay-As-You-Go"), date range picker (defaults to current month), view toggle (Accumulated costs / Daily costs).
  - **Summary cards row**: "Actual cost" (large number `$487.23`), "Forecast" (`$612.50`), "Budget" (`$800.00` or "-- --" if none).
  - **Area chart**: Cost over time using recharts `<AreaChart>`. X-axis: dates, Y-axis: dollars. Blue fill area for actual cost, dashed line for forecast.
  - **Breakdown donut charts row**: 3 small donut charts side by side: "By resource" (from `costByService`), "By location" (from `costByLocation`), "By resource group" (from `costByResourceGroup`). Each shows top entries with labels and amounts.
  - **Group by** dropdown: None / Resource group / Service name / Location. Changes the chart grouping.
- [x] **Budgets page** (`/cost-management/budgets`): Table: Budget name, Amount, Current spend, Status (OK/Warning/Over budget as colored badge). "+ Add" button: form with name, amount, time grain (Monthly/Quarterly/Annually). Dispatches `CREATE_BUDGET`.
- [x] **Invoices page** (`/cost-management/invoices`): Table: Period | Amount | Status (Paid/Due badge) | Due date. Read-only. From `costManagement.invoices`.

### P2.2 — Activity Log

- [x] **Page** (`/activity-log`): Header "Activity log". Filter bar: Timespan dropdown (1 hour, 6 hours, 24 hours, 1 week, 1 month), Event severity (All, Informational, Warning, Error), Resource group filter, Operation filter.
- [x] **Table**: Columns: OPERATION | STATUS (badge) | TIME | RESOURCE GROUP | RESOURCE | INITIATED BY. From `state.activityLog`, sorted by timestamp descending. Status badges: "Succeeded"=green, "Failed"=red. Clicking a row opens detail in right panel showing full operation details.

### P2.3 — App Services List + Detail

- [x] **List page** (`/app-services`): Table: Name (blue link) | Status (Running=green badge) | App Service plan | Location | Resource group. Command bar: "+ Create" (placeholder form).
- [ ] **Detail page** (`/app-services/:id`): Left menu: Overview, Activity log, Deployment (placeholder), Configuration (placeholder), Scale up/out (placeholder). Overview: Essentials (name, status, URL as blue link, App Service plan, Resource group, Location, Runtime stack, OS). URL row shows the `defaultHostName` as a clickable link (opens nothing in mock, or shows flash message).

### P2.4 — SQL Databases List + Detail

- [x] **List page** (`/sql-databases`): Table: Name | Server | Status (Online=green) | Pricing tier | Resource group | Location.
- [ ] **Detail page**: Left menu: Overview, Query editor (placeholder), Connection strings (placeholder). Overview: Essentials (name, server, status, pricing tier, max size, collation).

### P2.5 — Virtual Networks + NSG Detail

- [x] **Virtual networks list** (`/virtual-networks`): Table: Name | Address space | Resource group | Location. Detail: Subnets table, connected devices count.
- [x] **NSG detail** (`/network-security-groups/:id`): Tabs: Inbound rules, Outbound rules. Each shows rules table with columns: Priority | Name | Port | Protocol | Source | Destination | Action (Allow/Deny badge). "+ Add" button opens inline form to add a rule. "Delete" button on each rule row. Dispatches `ADD_NSG_RULE` / `DELETE_NSG_RULE`.

### P2.6 — Create Resource / Marketplace

- [x] **Page** (`/create-resource`): Header "Create a resource". Search bar at top "Search services and marketplace".
- [x] Category sidebar: Popular, Compute, Networking, Storage, Databases, Web, AI + Machine Learning, Containers, DevOps, Migration.
- [x] **Popular** (default): Grid of service cards. Each card: icon + name + short description + "Create" link. Cards: Virtual machine, Web App, SQL Database, Storage account, Function App, Container Instances, Kubernetes Service, Cosmos DB. Clicking "Create" navigates to the respective create wizard (e.g., `/virtual-machines/create`).
- [ ] Clicking a category shows services in that category (filtered from `allServicesCategories`).

### P2.7 — Portal Settings Panel

- [ ] Clicking the gear icon in header opens a right-side panel (similar to notifications). Width ~400px.
- [ ] **Appearance + startup views**: Theme toggle (Light/Dark — only Light works, Dark is placeholder), Menu behavior (Flyout/Docked radio — actually works, changes sidebar behavior), Startup page (Home/Dashboard radio).
- [ ] **Language + region**: Dropdown for language (display only, always "English"). Regional format dropdown (display only).
- [ ] Changes dispatch `UPDATE_SETTINGS` and persist immediately.

### P2.8 — Dashboard

- [x] **Page** (`/dashboard`): Header with dashboard name ("My Dashboard"), "Edit" button, "New dashboard" dropdown, "Share" (placeholder), "Refresh".
- [x] Default tiles (static, not draggable in V1):
  - "All resources" tile: Shows total count of all resources.
  - "Resource groups" tile: Shows count + list of RG names.
  - "Service health" tile: "All services healthy" with green check.
  - "Cost this month" tile: Shows `$487.23` with small trend indicator.
  - "Recent activity" tile: Last 3 activity log entries.
- [x] Each tile is a white card on the gray background. Tile header with title, pin icon, more (...) menu.

### P2.9 — Tags Management

- [ ] **Reusable TagEditor component**: Table with Key/Value columns, "+ Add tag" button adds empty row with inline text inputs, "×" remove button per row, "Save" button. Props: `tags` array of `{key, value}`, `onSave` callback.
- [ ] Apply TagEditor to: Resource group detail (Tags menu item), VM detail (Tags tab), Storage account detail (Tags menu item).
- [ ] Each save dispatches appropriate action: `UPDATE_RG_TAGS`, `UPDATE_VM_TAGS`, `UPDATE_STORAGE_TAGS`.

### P2.10 — Confirmation Dialogs for Destructive Actions

- [x] **Reusable ConfirmDeleteDialog component**: Modal overlay with warning icon, title ("Delete {resource name}?"), explanation text, text input requiring exact resource name to confirm deletion, "Delete" (red) and "Cancel" (default) buttons. Delete button is disabled until typed name matches.
- [x] Apply to: Delete resource group (type RG name), Delete VM (type VM name), Delete storage account (type storage account name).

---

## Data Seed (implement in createInitialData())

All seed data is defined in `assets/data_model.md`. Summary:

- [x] `currentUser`: 1 record — Alex Johnson, contoso.com (see data_model.md §1)
- [x] `tenant`: 1 record — Contoso (see §2)
- [x] `subscriptions`: 1 — Pay-As-You-Go (see §3)
- [x] `resourceGroups`: 3 — rg-web-prod, rg-data-dev, rg-networking (see §4)
- [x] `virtualMachines`: 4 — 2 web servers (Running), 1 DB (Running), 1 jumpbox (Stopped) (see §5)
- [x] `storageAccounts`: 2 — contosowebprod (3 containers), contosodatadev (2 containers) (see §6)
- [x] `virtualNetworks`: 2 — vnet-web-prod (2 subnets), vnet-data-dev (1 subnet) (see §7)
- [x] `networkSecurityGroups`: 3 — nsg-web-prod, nsg-data-dev, nsg-management (see §8)
- [x] `appServices`: 2 — contoso-web-app, contoso-api (see §9)
- [x] `sqlDatabases`: 1 — contoso-db (see §10)
- [x] `costManagement`: Full cost breakdown + budgets + invoices (see §11)
- [x] `activityLog`: 8 recent events (see §12)
- [x] `notifications`: 5 items, 2 unread (see §13)
- [x] `favorites`: 8 pinned services (see §14)
- [x] `allServicesCategories`: 8 categories with ~25 services (see §15)
- [x] `recentResources`: 5 recently viewed resources
- [x] `portalSettings`: theme/menu/startup preferences

## Reducer Actions (implement in AppContext)

- [x] **Resource Groups**: `CREATE_RESOURCE_GROUP`, `DELETE_RESOURCE_GROUP`, `UPDATE_RG_TAGS`
- [x] **Virtual Machines**: `CREATE_VM`, `START_VM`, `STOP_VM`, `RESTART_VM`, `DELETE_VM`, `UPDATE_VM_TAGS`
- [x] **Storage Accounts**: `CREATE_STORAGE_ACCOUNT`, `DELETE_STORAGE_ACCOUNT`, `UPDATE_STORAGE_TAGS`, `CREATE_CONTAINER`
- [x] **NSG Rules**: `ADD_NSG_RULE`, `DELETE_NSG_RULE`
- [x] **Notifications**: `DISMISS_NOTIFICATION`, `DISMISS_ALL_NOTIFICATIONS`, `ADD_NOTIFICATION`
- [x] **Favorites**: `TOGGLE_FAVORITE`
- [x] **Settings**: `UPDATE_SETTINGS`
- [x] **Cost**: `CREATE_BUDGET`
- [x] **General**: `UPDATE_RECENT_RESOURCES` (called when navigating to a resource detail page)
- [x] Every action must produce observable state diffs in the `/go` endpoint.

---

## Out of Scope

- Authentication / login / logout (app starts pre-logged-in as "Alex Johnson", directory "Contoso")
- Real Xzure API calls or ARM template execution
- Cloud Shell actual command execution (UI placeholder only)
- Xzure AD / Entra ID full directory management
- Real-time monitoring metrics (use static mock chart data)
- Marketplace real purchases or billing transactions
- Multi-tenant / multi-subscription switching
- RBAC / role assignment enforcement
- Resource move between subscriptions/regions
- Xzure Policy enforcement
- Xzure DevOps / CI-CD pipeline integration
- Export ARM template functionality
