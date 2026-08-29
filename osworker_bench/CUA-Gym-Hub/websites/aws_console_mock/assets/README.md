# AWS Management Console Mock — Research Summary

## App Overview

The **AWS Management Console** is the web-based graphical interface for managing Amazon Web Services (AWS) cloud infrastructure. It provides a unified dashboard to create, configure, monitor, and manage over 200 cloud services including compute (EC2), storage (S3), databases (RDS), serverless functions (Lambda), identity management (IAM), and billing/cost management.

**Category:** Cloud infrastructure management platform
**URL:** https://console.aws.amazon.com
**Design System:** Cloudscape Design System (https://cloudscape.design)

---

## Key User Personas

### 1. DevOps Engineer (Primary)
- Launches/manages EC2 instances, configures Lambda functions
- Monitors costs, sets up IAM roles for CI/CD pipelines
- Creates S3 buckets for deployments, manages RDS databases
- **Daily workflows:** Instance management, deployment monitoring, log checking

### 2. Cloud Architect
- Reviews billing dashboards, right-sizes resources
- Manages IAM policies and roles across teams
- Creates VPCs, security groups, networking resources
- **Daily workflows:** Cost optimization, security reviews, architecture changes

### 3. Application Developer
- Deploys Lambda functions, tests code in-console
- Uploads assets to S3, queries RDS databases
- **Daily workflows:** Code deployment, function testing, S3 file management

---

## Brand & Visual Design

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| AWS Orange (Primary) | `#FF9900` | Primary buttons, CTAs, active indicators, accents |
| AWS Hover Orange | `#EC7211` | Button hover states |
| AWS Dark Navy (Nav) | `#161E2D` | Top navigation bar background |
| AWS Squid Ink | `#232F3E` | Secondary dark background, search bar BG |
| AWS Blue (Link) | `#0073BB` | Links, secondary interactive elements |
| AWS Blue Hover | `#006DAF` | Link hover state |
| Page Background | `#F2F3F3` | Light gray page background |
| Card Background | `#FFFFFF` | White card/container background |
| Border Gray | `#D5DBDB` | Card borders, table borders, dividers |
| Text Primary | `#16191F` | Main text color (near-black) |
| Text Secondary | `#545B64` | Muted text, descriptions |
| Text Tertiary | `#879596` | Disabled text, timestamps |
| Success Green | `#1D8102` | Running state, healthy status |
| Success BG | `#F2F8F0` | Success background tint |
| Warning Yellow | `#FF9900` | Warning state, pending operations |
| Error Red | `#D13212` | Error state, terminated, critical alerts |
| Error BG | `#FDF3F0` | Error background tint |
| Info Blue | `#0073BB` | Informational state, creating status |

### Typography
- **Font Family:** "Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif
- **H1:** 28px, font-weight 700 (bold), color #16191F
- **H2:** 20px, font-weight 700
- **H3:** 18px, font-weight 700
- **Body:** 14px, font-weight 400, color #16191F, line-height 1.5
- **Small/Meta:** 12px, color #545B64
- **Monospace:** "Monaco", "Menlo", "Ubuntu Mono", monospace (used in code editors, instance IDs)

### Spacing Scale
- `4px` — tight spacing
- `8px` — component internal padding
- `12px` — small gap
- `16px` — standard padding
- `20px` — medium gap
- `24px` — section spacing
- `32px` — large section gap

---

## UI Layout Architecture

### Global Top Navigation Bar
- **Height:** 48px (fixed at top, z-50)
- **Background:** `#232F3E` (squid ink dark)
- **Elements (left to right):**
  1. AWS logo (white "aws" wordmark with orange smile, ~80px wide) — links to Console Home
  2. "Services" dropdown button (white text, hover → orange underline)
  3. Search bar — centered, ~600px wide, dark input bg `#1B2A3B`, placeholder "Search for services, features, blogs, docs, and more", search icon left-aligned, keyboard shortcut hint "[Alt+S]" right-aligned
  4. Right-side buttons cluster:
     - CloudShell icon button (terminal icon)
     - Notifications bell icon (with badge count when alerts exist)
     - Help/Support icon (question mark circle)
     - User account dropdown showing "Admin User @ 1234-5678-9012" with chevron
     - Region selector showing current region "N. Virginia ▾" (region name, not ID) with orange text on selected
- **Dropdown menus** appear on dark background matching the nav bar color

### Service-Specific Left Sidebar
- **Width:** ~220px, fixed left, below top nav
- **Background:** White (`#FFFFFF`)
- **Border:** Right border `#D5DBDB`
- **Content varies by service:** Each AWS service page has its OWN contextual sidebar. For example:
  - **EC2 sidebar:** Dashboard, Instances, Instance Types, Launch Templates, AMIs, Volumes, Snapshots, Security Groups, Key Pairs, Elastic IPs, Load Balancers, Target Groups, Auto Scaling
  - **S3 sidebar:** Buckets, Access Points, Batch Operations, Storage Lens
  - **Lambda sidebar:** Dashboard, Functions, Applications, Layers
  - **IAM sidebar:** Dashboard, Users, User groups, Roles, Policies, Identity providers, Account settings
  - **RDS sidebar:** Dashboard, Databases, Query Editor, Performance Insights, Snapshots, Automated backups, Subnet groups, Parameter groups
  - **Billing sidebar:** Home, Bills, Cost Explorer, Budgets, Cost allocation tags, Payment methods, Tax settings
- **Active item:** Left border 3px orange (#FF9900), text color #FF9900, background light orange tint
- **Inactive items:** Color #545B64, hover → light gray bg

### Main Content Area
- **Position:** Right of sidebar, below top nav
- **Padding:** 24px all sides
- **Background:** `#F2F3F3` (light gray)
- **Max width:** Fluid, fills available space
- **Content cards:** White bg, 1px border #D5DBDB, no border-radius (square corners in AWS style), subtle shadow

### Breadcrumb Bar
- Sits at top of main content area
- Format: `Service Name > Section > Subsection`
- Gray text with `>` separator, links in blue (#0073BB)

---

## Feature List by Priority

### P0 — Core Shell (Must have to render)
1. Top navigation bar with AWS logo, search, region selector, account info
2. Service-specific contextual sidebars (EC2, S3, Lambda, RDS, IAM, Billing)
3. Page routing and navigation between services
4. Light gray page background with white card containers
5. Breadcrumb navigation at top of content area
6. Unified search modal with categorized results (Services, Features, Docs)
7. State management (React Context) with localStorage persistence
8. Session isolation via vite.config.js mock-api plugin
9. `/go` endpoint for state inspection

### P1 — Primary Interactive Features
10. **EC2 Instances page:** Table with checkbox selection, columns (Name, Instance ID, State, Type, Public IP, AZ, Launch Time), state badges (running=green dot, stopped=gray, pending=yellow, terminated=red), action buttons (Launch instances, Instance state dropdown → Start/Stop/Reboot/Terminate)
11. **EC2 Launch Instance wizard:** Multi-step form — Name & Tags, AMI selection (quick-start cards for Amazon Linux, Ubuntu, Windows), Instance Type selector (searchable table), Key Pair, Network Settings (VPC/Subnet/Security Group), Storage (EBS volumes), Summary sidebar, Launch button
12. **EC2 Instance detail panel:** Tabs below the instances table when one is selected — Details, Security, Networking, Storage, Status checks, Monitoring, Tags
13. **S3 Buckets list:** Table with columns (Name, Region, Created, Access level), "Create bucket" button, search/filter
14. **S3 Bucket detail:** Tabbed interface — Objects (file browser with breadcrumb path, Upload button, Create folder, Delete, Download), Properties, Permissions, Metrics, Management, Access Points
15. **S3 Object upload:** Upload modal with drag-and-drop zone, file list, destination path, storage class selector, upload progress
16. **Lambda Functions list:** Table with Function name, Runtime, Description, Last modified, size
17. **Lambda Function detail:** Tabbed — Code (inline editor with dark theme, Deploy button, Test button), Test (configure test event JSON), Monitor (invocation charts), Configuration (General, Triggers, Permissions, Environment variables, Tags), Aliases, Versions
18. **Lambda code editor:** Dark theme textarea simulating a code editor with syntax highlighting hint, file browser sidebar showing index.js, Deploy and Test buttons in toolbar
19. **RDS Databases list:** Table with DB identifier, Engine, Status badge (available=green, creating=blue, deleting=red), Role (instance/cluster), Size, Region
20. **RDS Create Database wizard:** Engine selection (MySQL, PostgreSQL, MariaDB, Aurora), Templates (Production, Dev/Test, Free tier), Settings (DB identifier, master username, password), Instance configuration, Storage, Connectivity
21. **IAM Dashboard:** Security recommendations summary, IAM resources count cards (Users, Roles, Policies, Groups), Account details (Account ID, account alias, sign-in URL)
22. **IAM Users page:** Table with User name, Groups, Access key age, Last activity, MFA status; Create User button
23. **IAM Roles page:** Table with Role name, Trusted entities, Last activity; Create Role button
24. **IAM Policies page:** Table with Policy name, Type (AWS managed / Customer managed), Attached entities; Create Policy button
25. **Billing Dashboard:** Cost summary cards (Month-to-date, Forecast, Last month), Cost breakdown bar chart by service (stacked colors), Monthly spend trend line chart, Top Free Tier services usage table
26. **Region selector dropdown:** Scrollable list grouped by geography (US East, US West, Asia Pacific, Europe, etc.) showing region name and region code, currently selected highlighted in orange

### P2 — Secondary Features (Depth & Realism)
27. **Notification bell dropdown:** List of notifications with unread count badge, dismissable
28. **User account dropdown:** Menu showing Account ID, Switch Role, Sign Out (non-functional), My Account, My Billing Dashboard, My Security Credentials
29. **Services mega-menu:** Categorized grid — Compute, Storage, Database, Networking, Security, Developer Tools, Management & Governance
30. **EC2 instance filter bar:** Multi-attribute filter (Name, Instance ID, State, Type, AZ) with AND logic
31. **S3 object delete confirmation:** Warning modal requiring typing bucket/object name to confirm
32. **Lambda test event configuration:** JSON editor for test event payload with template presets (API Gateway, S3, SNS, etc.)
33. **RDS instance detail page:** Tabs — Connectivity, Monitoring, Logs, Configuration, Maintenance, Tags
34. **IAM User detail:** Permissions tab (attached policies, inline policies), Groups tab, Security credentials tab (access keys, MFA)
35. **IAM Create User wizard:** Multi-step — User details, Permissions (Add to group, Copy, Attach directly), Tags, Review
36. **Billing Cost Explorer:** Date range selector, group-by dropdown (Service, Region, Account), bar chart + table visualization
37. **CloudWatch dashboard widget** on Console Home — showing key metrics
38. **Favorites star toggle** on services for pinning to top nav
39. **Table column sorting** — click column header to sort asc/desc with indicator arrow
40. **Table pagination controls** — rows per page selector (10/25/50), page navigation
41. **Info/Help panels** — expandable "Info" side panel on some pages explaining the feature
42. **Flash messages/alerts** — Success/Error/Warning/Info banners at top of content area when actions complete
43. **EC2 Security Groups page** — Table listing SGs with inbound/outbound rule counts; Create Security Group form
44. **EC2 Key Pairs page** — Table listing key pairs; Create Key Pair modal
45. **S3 Bucket versioning toggle** — Enable/disable in Properties tab
46. **Lambda Layers page** — List of Lambda layers with version info

---

## Data Model Overview
See `data_model.md` for full entity definitions with fields and types.

**Core Entities:**
- User (current logged-in user)
- EC2 Instances
- S3 Buckets and Objects
- Lambda Functions
- RDS Database Instances
- IAM Users, Roles, Policies, Groups
- Billing data (costs by service, monthly history)
- Security Groups
- Key Pairs
- Notifications

---

## What to Skip (Out of Scope)

- **Authentication/Login** — App starts pre-logged-in as "Admin User" (account 1234-5678-9012)
- **Real API calls** — All data is mock, stored in localStorage
- **File uploads** — S3 upload simulated with mock file objects
- **Actual Lambda execution** — Test runs return mock results
- **VPC/Networking deep pages** — Beyond basic Security Group management
- **CloudFormation, ECS, EKS** — Complex services that are secondary
- **Multiple AWS accounts** — Single account view only
- **Console settings/preferences page** — Low value for agent training

---

## Screenshots Reference

Downloaded screenshots are in `assets/screenshots/`:
- `000001-000005.jpg` — Console home page, services navigation, region selector
- `ec2/` — EC2 related views
- `ec2_instances/` — EC2 instances table views
- `s3/` — S3 search and navigation
- `s3_buckets/` — S3 bucket views
- `lambda/` — Lambda console views
- `iam/` — IAM dashboard and users
- `billing/` — Billing dashboard with charts
- `dashboard/` — Console home dashboard
- `cloudscape/` — Cloudscape design system elements

**Key visual references:**
- `000001.jpg` — Console home: dark nav bar (#232F3E), orange "aws" logo, service search with autocomplete, grouped services under categories (Compute, Storage, Developer Tools, etc.), "Helpful tips" sidebar
- `000002.jpg` — Services page: dark header bar with "Services ▼" button, search bar with magnifier icon, "Recently visited services" collapsible section, "All services" grid categorized into Compute, Quantum Technologies, Security Identity & Compliance, Management & Governance
- `000003.jpg` — Region selector dropdown: dark background matching nav bar, regions grouped by geography, selected region "US East (N. Virginia) us-east-1" highlighted in orange
- `s3/000002.jpg` — Search results overlay: categorized left sidebar (Services, Features, Blogs, Documentation, Knowledge Articles, Tutorials, Events, Marketplace), service results showing icon + name + description + "Top features" links
- `billing/000001.jpg` — Billing dashboard: large cost figure at top, bar chart comparing Last Month vs Month-to-Date vs Forecast, "Top Free Tier Services by Usage" table with Service/Free Tier Usage Limit/Month-to-date usage columns
