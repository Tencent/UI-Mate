# Xpensify Mock — Research Summary

## App Overview

**Xpensify** is a financial management platform primarily focused on **expense reporting, receipt scanning, invoicing, bill pay, and corporate card management**. Founded in 2008, it serves individuals and businesses of all sizes for tracking and reimbursing expenses. The platform combines expense tracking with chat-based collaboration (in "New Xpensify") and AI-powered receipt scanning ("SmartScan").

For this mock, we replicate the **Xpensify Classic web interface** — the traditional desktop dashboard that administrators and employees use to manage expenses, reports, and workspace settings. This is the most feature-rich version with clear CRUD interactions ideal for agent training.

---

## Key User Personas

### 1. Employee (Expense Submitter)
- Creates and submits expenses (receipt scan, manual entry, mileage, time)
- Attaches receipts to expenses
- Groups expenses into reports
- Submits reports for approval
- Tracks reimbursement status

### 2. Manager (Approver)
- Reviews submitted expense reports in Inbox
- Approves or rejects reports
- Adds comments to reports
- Views team spending

### 3. Admin (Workspace Owner)
- Configures workspace policies (categories, tags, rules)
- Manages members/employees
- Sets up approval workflows
- Configures integrations (accounting software)
- Views spending insights/analytics

**Default user for mock**: Admin role with ability to act as all three personas.

---

## Core Features (Priority Ranked)

### P0 — Core Shell & Navigation
- **Left sidebar** (dark navy/charcoal, ~220px wide): User avatar + email at top, navigation items: Inbox, Expenses, Reports, Settings. "Xpensify" wordmark at bottom.
- **Top bar** in main content area: Page title (bold, large), action buttons (e.g., "New Expense", "New Report", "Export to")
- **Footer**: Links (OUR PRODUCT, UPGRADE, PRICING, JOBS, ABOUT US, BLOG, COMMUNITY, STATUS, PRIVACY, HELP), copyright notice
- **Concierge chat bubble** (blue circle, bottom-right)
- **Routing**: `/inbox`, `/expenses`, `/reports`, `/settings`, `/settings/workspace/:id`

### P1 — Primary Features

#### Expenses Page (`/expenses`)
- Table view with sortable columns: Date, Merchant, Amount, Policy, Category, Description
- Each expense row shows: checkbox, expense type icon, merchant name, date, status badge (Open/Closed/Reimbursed), report link, amount (dollars + cents), receipt thumbnail, policy name, category, description
- **View toggle buttons** (top-right): List view (default), Compact list, Grid view, Receipt view
- **"Show Filters" toggle** expands filter bar: Merchant search, Date range (From/To), All/Billable/Reimbursable toggle, Category dropdown, Tags dropdown, Policy dropdown, Card dropdown, Status filter checkboxes (Unreported, Open, Processing, Approved, Reimbursed, Closed, Deleted)
- **"New Expense" button** (green, top-right) — dropdown with options: Expense, Distance, Time, Multiple
- Status badges: Open (green), Closed (gray), Processing (yellow), Approved (green outline), Reimbursed (pink/magenta), Deleted (red)
- Pagination: "Expenses 1 to N" with prev/next arrows

#### Reports Page (`/reports`)
- Table with sortable columns: Name (checkbox + star + report name), Total, Policy, From, To, Submitted, Exported
- Each report row: checkbox, star/favorite toggle, report name with ID number, status badge, total amount, policy name, from/to emails, submitted date, exported status
- **"New Report" button** (green, top-right) with dropdown
- **"Export to" button** (top-right)
- **"Show Filters" toggle** — similar filter bar to Expenses
- Pagination: "Reports 1 to N" with prev/next arrows
- Report statuses: Open, Submitted, Approved, Reimbursed, Closed, Archived, Retracted

#### Report Detail View
- Report header: Status badge, Report ID, Policy name, Report title, Total amount
- From user (avatar + name), Date range
- Expense table within report: Date, Merchant, receipt icon, Total columns
- Report History & Comments section (timeline)
- Receipt Thumbnails section (image grid)
- Documents section

#### New Expense Modal
- Tabs: Expense (default), Distance, Time, Multiple
- **Expense tab fields**: Date, Merchant, Total (amount + currency), Tax, Category dropdown, Description, Receipt upload area
- **Distance tab fields**: From, To, Distance, Rate
- **Time tab fields**: Hours, Rate, Date
- **Multiple tab**: Spreadsheet-like grid with columns: Date, Merchant, Total, Tax, Category, Description (multiple rows, bulk entry)
- Reset and Save buttons

#### Inbox Page (`/inbox`)
- Concierge section at top with avatar and "Watch Demo" / "Call" buttons
- Task cards / notification items
- Setup wizard prompts (Business vs Individual)
- "Show Hidden Tasks" toggle at bottom

### P2 — Secondary Features

#### Settings Page (`/settings`)
- **Workspace sub-navigation** (left panel): Policy name, then links: Basics, Connections, Categories, Tags, People, Distance and Time, Report Fields, Tax, Export Formats
- **Basics**: Workspace name, output currency, reimbursement settings
- **Categories**: Toggle "People must categorize expenses", category list with Name, GL Code, Payroll Code columns, enabled/disabled toggle per category
- **Tags**: Tag management, hierarchical tags with colon notation
- **People**: Member list with email, role, manager assignment
- **Distance and Time**: Mileage rates, time tracking hourly rates
- **Report Fields**: Custom field configuration (text, dropdown, date)
- **Tax**: Tax rate configuration
- **Export Formats**: Template configuration for report exports

#### Spending Insights (Analytics)
- Charts and graphs showing spending by category, department, time
- Trend lines
- Summary statistics

#### Invoice Feature
- Create invoice form: Client info, line items, amounts, tax, due date
- Invoice list with status tracking
- Payment status indicators

---

## UI Layout Description

### Sidebar (Left Navigation)
- **Width**: ~220px
- **Background**: Dark navy (#0E1B2A or similar dark blue-black)
- **User section (top)**: Circular avatar (pink/magenta placeholder), email address below in white text
- **Nav items**: Icon + label, white text, ~48px height each, left padding ~24px
  - Inbox (speech bubble icon)
  - Expenses (document icon, blue highlight when active)
  - Reports (document icon)
  - Settings (gear icon)
- **Active state**: Blue (#0185FF) left border bar, blue icon/text color
- **Bottom**: "Xpensify" wordmark in bold white

### Main Content Area
- **Background**: White (#FFFFFF)
- **Page title**: Large bold text (~28px), top-left
- **Action buttons**: Green (#03D47C) rounded buttons, top-right
- **Filter bar**: Light blue text link "Show Filters" with filter icon, expandable
- **Tables**:
  - Header row: Gray text, uppercase, sortable (sort arrows)
  - Data rows: White background, ~60-70px height, hover highlight
  - Checkbox column (leftmost)
  - Text: Dark gray/black (#333)
- **Status badges**: Rounded pill shapes, colored backgrounds with white text
- **Pagination**: "Items 1 to N" text, left/right arrow buttons, bottom-right

### Color Palette
- **Primary (sidebar bg)**: #0E1B2A (dark navy)
- **Primary action (buttons)**: #03D47C (green)
- **Active nav**: #0185FF (blue)
- **Status - Open**: #03D47C (green)
- **Status - Closed**: #8B959E (gray)
- **Status - Processing**: #F5A623 (yellow)
- **Status - Reimbursed**: #E85E95 (pink) or #03D47C (green)
- **Status - Retracted**: #FF0000 (red)
- **Background**: #FFFFFF (white)
- **Text primary**: #2E3440 (dark charcoal)
- **Text secondary**: #8B959E (gray)
- **Border/divider**: #E8ECF0 (light gray)
- **Concierge bubble**: #0185FF (blue)
- **Star/favorite**: #F5A623 (gold/yellow)

### Typography
- **Font family**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Page title**: 28px, bold (700)
- **Table header**: 12px, uppercase, 500 weight, gray
- **Body text**: 14px, regular (400)
- **Amount**: 16-18px, the dollars part regular weight, cents part smaller superscript
- **Sidebar nav**: 14px, regular, white

---

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Core entities:**
1. **User** — Current logged-in user (admin/employee)
2. **Expense** — Individual expense item (receipt, mileage, time, manual)
3. **Report** — Collection of expenses submitted for approval
4. **Category** — Expense classification (Travel, Meals, Office Supplies, etc.)
5. **Tag** — Additional classification (Project, Department, etc.)
6. **Policy/Workspace** — Company expense policy configuration
7. **Member** — Workspace member with role
8. **Comment** — Report comment/history entry
9. **InboxItem** — Notification/task in inbox

---

## What to Skip (Out of Scope)

- **Authentication/Login**: App starts pre-logged-in as admin user
- **Real SmartScan/OCR**: Receipt "scanning" is simulated with pre-populated data
- **Real payment processing**: Reimbursement status changes are state-only
- **Accounting integrations**: Connection settings exist as UI but don't connect to real services
- **Email/SMS sending**: No real notifications
- **File uploads to server**: Receipt images are simulated with placeholder thumbnails
- **Real currency conversion**: Display only
- **Real Concierge AI**: Concierge shows static helpful messages

---

## Screenshots Reference

Located in `assets/screenshots/`:

### Root directory (5 images)
- `000001.jpg` — **Reports page**: Full classic UI with dark sidebar, reports table showing 5 reports with statuses (Open, Closed, Reimbursed), "New Report" green button, pagination
- `000002.jpg` — Marketing/branding image (SmartScan receipt illustration)
- `000003.jpg` — **Expenses page**: Full classic UI with expenses table, 3 expenses shown with Date/Merchant/Amount/Policy/Category/Description columns, status badges, view toggle buttons, "New Expense" button
- `000004.jpg` — Mobile Inbox view showing Concierge card introducing Xpensify Card
- `000005.jpg` — **Expenses page (older version on tablet)**: Shows Advanced Search expanded with filters (Merchant, From/To dates, Categories, Tags, Policies, Cards, status filter chips)

### `/chat/` subdirectory
- Not Xpensify-specific (generic chat UI references)

### `/reports/` subdirectory
- `000001.jpg` — Expenses page (smaller viewport)
- `000003.jpg` — **New Expense modal** (Multiple tab): Spreadsheet grid with Date/Merchant/Total/Tax/Category/Description columns, Reset + Save buttons
- `000004.jpg` — Reports page (duplicate of root 000001)

### `/settings/` subdirectory
- `000001.jpg` — **Policy Categories page**: Shows Settings > Categories with sub-nav (Basics, Connections, Categories, Tags, People, Distance and Time, Report Fields, Tax, Export Formats), category list with Name/GL Code/Payroll columns
- `000005.jpg` — **Inbox page**: Shows Concierge section with "Watch Demo" and "Call" buttons, Business vs Individual setup choice

### `/receipts/` subdirectory
- `000001.jpg` — **Report detail/preview**: Shows full report with status badge, ID, policy, total, expense line items, Report History & Comments section, Receipt Thumbnails grid
