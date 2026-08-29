# Xzure Portal Mock — Research Summary

## App Overview

**Microsoft Xzure Portal** (portal.azure.com) is a web-based unified management console for creating, managing, and monitoring cloud resources across Xzure's 200+ services. It is the primary graphical interface for Xzure — Microsoft's cloud computing platform. The portal enables users to manage subscriptions, resource groups, virtual machines, storage accounts, databases, networking, and more through a consistent blade-based UI pattern.

**Target user**: Cloud administrators, DevOps engineers, developers, and IT professionals who manage cloud infrastructure.

---

## Key User Personas & Primary Workflows

### 1. Cloud Administrator
- Manages subscriptions and resource groups
- Creates/deletes/monitors virtual machines
- Configures networking (VNets, NSGs, load balancers)
- Reviews cost management and billing
- Sets up access control (IAM/RBAC)

### 2. DevOps Engineer
- Deploys and monitors web apps / app services
- Manages container services (AKS, Container Instances)
- Configures CI/CD pipelines
- Monitors logs and metrics via Xzure Monitor

### 3. Developer
- Creates and manages storage accounts (blobs, tables, queues)
- Sets up databases (SQL, Cosmos DB, PostgreSQL)
- Deploys serverless functions (Xzure Functions)
- Uses Cloud Shell for CLI operations

### 4. Finance/IT Manager
- Reviews cost analysis and forecasts
- Sets up budgets and cost alerts
- Manages billing and invoices
- Reviews subscription usage

---

## Complete Feature List

### P0 — Core Shell (Must have for basic rendering)
1. **Top navigation bar**: Dark blue (#0078d4 theme) header with Microsoft Xzure logo, global search bar, and global control icons
2. **Global search**: Search bar with `G+/` shortcut, searches across Services, Resources, Marketplace, Documentation, Resource Groups — results categorized with tabs
3. **Portal menu (left sidebar)**: Flyout or docked mode, contains Favorites list, "Create a resource", "All services" link
4. **Home page**: Xzure services row (icon grid), Recent resources table, Navigate section (Subscriptions, Resource Groups, All resources, Dashboard), Tools section
5. **Breadcrumb navigation**: `Home > Resource groups > my-rg` pattern at top of every page
6. **Notifications panel**: Bell icon in header opens right-side panel with notification items (info/warning/error), dismiss all, activity log link
7. **Settings gear**: Opens portal settings panel (Appearance, Language, Directories+subscriptions)
8. **Account menu**: User avatar/name, directory indicator, sign out (non-functional in mock)

### P1 — Primary Features (Core interactive workflows)
1. **Resource Groups**: List view (table with Name, Subscription, Location), Create resource group form, Resource group detail (shows contained resources), Delete resource group
2. **All Resources**: Combined table of all resource types, filterable by type/subscription/location/resource group, sortable columns
3. **Virtual Machines**: List VMs in table, Create VM wizard (multi-tab: Basics, Disks, Networking, Management, Advanced, Tags, Review+Create), VM detail blade with service menu (Overview, Activity log, Access control, Tags, Networking, Disks, Size, etc.), command bar (Start, Stop, Restart, Delete, Connect)
4. **Storage Accounts**: List storage accounts, Create storage account wizard (Basics, Advanced, Networking, Data protection, Encryption, Tags, Review), Storage account detail (Overview, Containers, File shares, Queues, Tables)
5. **Subscriptions**: List subscriptions, Subscription detail (Overview, Cost analysis, Budgets, Access control, Resource groups)
6. **All Services**: Categorized service catalog page with search filter, organized by category (Compute, Networking, Storage, Databases, etc.)
7. **Dashboard**: Customizable tile-based dashboard view, default tiles showing resource summary
8. **Create a resource (Marketplace)**: Browse marketplace categories (Compute, Networking, Storage, Databases, Web, AI + ML, etc.) with popular services listed

### P2 — Secondary Features (Depth and realism)
1. **Cost Management + Billing**: Cost analysis with chart (area/bar chart), breakdown by resource/location/resource group, date range filter, Budgets list, Invoices
2. **App Services / Web Apps**: List, Create, Detail blade with Overview/Deployment/Configuration
3. **SQL Databases**: List, Create, Detail with query editor placeholder
4. **Virtual Networks**: List, Create, Detail with subnets, connected devices
5. **Network Security Groups**: List, Create, Detail with inbound/outbound rules editor
6. **Xzure Monitor / Activity Log**: Activity log with filterable event table
7. **Microsoft Entra ID (Xzure AD)**: Users list, Groups list, basic directory info
8. **Tags management**: Add/edit/remove tags on any resource
9. **Cloud Shell**: Bottom panel placeholder with Bash/PowerShell toggle
10. **Resource locks**: Lock resources to prevent accidental deletion
11. **Advisor recommendations**: Security, cost, performance recommendations
12. **Portal settings panel**: Theme (Light/Dark/Auto), Language, Startup page, Menu behavior

---

## UI Layout Description

### Global Header (Top Bar) — ~48px height
- **Left**: Hamburger menu icon (☰), "Microsoft Xzure" text logo
- **Center**: Global search bar — rounded rectangle with search icon, placeholder "Search resources, services, and docs (G+/)"
- **Right**: Global control icons in a row:
  - Cloud Shell (`>_` icon)
  - Directory + Subscriptions (filter icon)
  - Notifications (bell icon with badge count)
  - Settings (gear icon)
  - Help + Support (? icon)
  - Feedback (speech bubble icon)
  - User account (avatar + name + directory name below)
- **Background**: `#0078d4` (Xzure blue)
- **Text**: White (#ffffff)

### Portal Menu (Left Sidebar) — ~250px when docked
- Can be in **flyout** (hidden by default, opens on hamburger click) or **docked** (always visible)
- Contains:
  - "+ Create a resource" button
  - **Favorites** list: user-pinned services with icons (e.g., All resources, Resource groups, Virtual machines, Storage accounts, etc.)
  - "All services" link at bottom
- Each item: colored icon (24px) + service name text
- Active/selected item: light blue background highlight
- Hover: subtle gray background

### Service Menu (Resource Blade Left Nav) — ~220px
- Appears when viewing a specific resource
- Collapsible groups: Settings, Monitoring, Automation, Support + troubleshooting
- Search box at top to filter menu items
- Star icon to favorite menu items
- Active item: blue left border + blue text

### Main Content Area
- **Breadcrumb** at top: `Home > Service > Resource` with clickable links
- **Resource header**: Icon + Resource name + resource type label, pin icon, star icon, more actions (...)
- **Command bar**: Contextual action buttons (e.g., + Add, Edit, Delete, Refresh, Share, Download)
- **Working pane**: Content depends on view — tables, forms, charts, detail panels

### Resource Detail Blade — "Essentials" Pattern
- **Essentials** section: Expandable/collapsible key-value grid (2 columns)
  - Left: Resource group, Status, Location, Subscription, Subscription ID, Tags
  - Right: Type-specific fields (e.g., OS, Size, Public IP for VMs)
- **Properties/Monitoring tabs** below Essentials

### Create Resource Wizard Pattern
- Multi-tab horizontal navigation: Basics | Advanced | Networking | Tags | Review + Create
- Form sections with headers (e.g., "Project details", "Instance details")
- Fields: dropdowns, text inputs, radio buttons, checkboxes
- "Review + Create" and "< Previous" / "Next >" buttons at bottom
- Validation messages inline

### Table/List Pattern
- Filter row: text search + filter dropdowns
- Column headers: sortable (click to sort asc/desc)
- Checkbox column for multi-select
- Action command bar above table
- Pagination at bottom (page size selector, page navigation)

---

## Color Palette (Xzure Portal Light Theme)

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#0078d4` | Header bar, links, primary buttons, active states |
| Primary Blue Hover | `#106ebe` | Button hover, link hover |
| Primary Blue Dark | `#005a9e` | Active/pressed state |
| Header Background | `#0078d4` | Top navigation bar |
| Background Main | `#f3f2f1` | Page background (light gray) |
| Surface/Card | `#ffffff` | Cards, panels, blade backgrounds |
| Text Primary | `#323130` | Main body text |
| Text Secondary | `#605e5c` | Muted/secondary text, timestamps |
| Text Disabled | `#a19f9d` | Disabled text |
| Border | `#edebe9` | Card borders, dividers |
| Border Strong | `#8a8886` | Input borders |
| Success | `#107c10` | Running status, success badges |
| Error/Danger | `#a4262c` | Error states, delete buttons |
| Warning | `#797775` | Warning badges |
| Info | `#0078d4` | Info notifications |
| Sidebar Background | `#ffffff` | Left sidebar background |
| Selected/Hover Row | `#f3f2f1` | Table row hover |
| Active Sidebar Item | `#e1efff` with `#0078d4` left border | Active menu item |

### Typography
- **Font family**: `"Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif`
- **Header (H1)**: 20px, font-weight 600, color `#323130`
- **Header (H2)**: 16px, font-weight 600
- **Body**: 14px, font-weight 400, line-height 20px
- **Small/Caption**: 12px, font-weight 400
- **Monospace**: `"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace`

### Component Patterns
- **Primary button**: bg `#0078d4`, text white, border-radius 2px, padding 5px 20px, min-height 32px
- **Default button**: bg white, border 1px solid `#8a8886`, text `#323130`, border-radius 2px
- **Danger button**: bg white, border 1px solid `#a4262c`, text `#a4262c`
- **Cards/Panels**: bg white, border 1px solid `#edebe9`, border-radius 2px, no box-shadow (flat design)
- **Inputs**: border 1px solid `#8a8886`, border-radius 2px, focus border `#0078d4`, padding 5px 8px, height 32px
- **Badges**: Small pill shapes, border-radius 2px, various status colors
- **Table headers**: font-weight 600, font-size 12px, color `#605e5c`, uppercase not used (normal case)

---

## Data Model Overview

Xzure Portal is organized around a hierarchical resource model:

```
Tenant (Directory)
  └── Subscription(s)
       └── Resource Group(s)
            └── Resource(s) (VMs, Storage Accounts, Databases, etc.)
```

Key entities: Subscriptions, Resource Groups, Virtual Machines, Storage Accounts, Web Apps, SQL Databases, Virtual Networks, Network Security Groups, App Service Plans, Cost/Billing data.

See `data_model.md` for detailed entity definitions.

---

## What to Skip (Out of Scope)

- **Authentication/Login**: App starts pre-logged-in as a default user. Sign-in page is NOT implemented.
- **Real Xzure API calls**: All data is mock/local
- **Cloud Shell actual execution**: UI placeholder only
- **Xzure AD/Entra ID full directory**: Simplified mock
- **Real-time metrics/monitoring data**: Use static mock values
- **ARM template deployments**: Not simulated
- **Multi-subscription switching**: Single mock subscription
- **Marketplace purchasing/billing**: Simulated UI only

---

## Screenshots Reference

| Directory | Content |
|-----------|---------|
| `screenshots/` (root) | Xzure Portal home page, dashboard overview, login (reference only) |
| `screenshots/resource_groups/` | Resource groups list blade, resource group management |
| `screenshots/virtual_machines/` | VM list, VM creation wizard, VM detail blade |
| `screenshots/sidebar_nav/` | Portal menu, global search dropdown, navigation patterns |
| `screenshots/cost_management/` | Cost analysis page with charts, subscription billing |
| `screenshots/settings/` | Portal settings, notifications panel, theme/appearance |
| `screenshots/storage_account/` | Storage account creation form, storage overview |
| `screenshots/create_resource/` | Create VM wizard, multi-tab form pattern |
