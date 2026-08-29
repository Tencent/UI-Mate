# Xusto Mock — Research Summary

## App Overview

**Xusto** is a cloud-based HR, payroll, and benefits platform designed for small-to-medium businesses. It provides an all-in-one admin dashboard where employers can run payroll, manage employees, track time, administer benefits, handle tax compliance, and generate reports. Xusto is known for its clean, friendly, and approachable design — making complex payroll/HR workflows feel simple.

**Target user**: Small business owner or HR admin managing 5-50 employees.

## Key Personas

1. **Admin / Business Owner (Jessica Jackson)** — Primary user. Runs payroll, adds employees, manages benefits, views reports. This is the persona we mock.
2. **Employee** — Views pay stubs, requests time off, updates personal info. (Secondary — not the focus of this mock.)

## Visual Design & Brand

### Color Palette (derived from screenshots)
- **Primary brand color (logo/accent)**: Coral/salmon `#F45D48` (Xusto's signature orange-red)
- **Secondary accent**: Teal/dark green `#0A8080` used for active sidebar items, links, and CTA buttons
- **Sidebar background**: White `#FFFFFF` with a light left border
- **Main content background**: White `#FFFFFF`
- **Page background**: Very light gray `#F7F7F7`
- **Text primary**: Dark charcoal `#1A1A1A`
- **Text secondary/muted**: Gray `#666666`
- **Border/divider**: Light gray `#E0E0E0`
- **Success/active**: Green `#0A8080`
- **Error/warning**: Red `#DC4C41`
- **Progress bar**: Coral-to-green gradient for multi-step flows

### Typography
- **Font family**: System sans-serif stack (appears similar to "Centra No2" or similar geometric sans)
- **Heading sizes**: Large headings ~28px bold, section headings ~20px semibold, body 14-15px regular
- **Logo**: Lowercase "xusto" in coral/salmon color, clean sans-serif

### Layout Structure (from screenshots)
- **Left sidebar**: ~220px wide, white background, with Xusto logo top-left in coral
- **Top bar**: ~56px height, contains search bar (centered), notification bell icon, and user avatar + name dropdown (right)
- **Main content area**: Centered content column ~800px max-width, generous padding

## Sidebar Navigation (confirmed from screenshots)

```
xusto (logo, coral)
─────────────────
Home
─────────────────
People >
  Team members
  Org chart
  Team insights
  Performance
─────────────────
Company
Payroll >
  Run Payroll
  Pay Contractors
  Time Tracking
  Time Off
Benefits
Taxes & compliance
─────────────────
Team Insights
Reports
Company Details
─────────────────
Referrals
Documents
Settings
─────────────────
Refer & earn
Upgrade
Help
─────────────────
Terms & Privacy
```

## Feature List by Priority

### P0 — Core Shell (Must render)
1. App shell with sidebar, topbar, main content area
2. Routing for all major views
3. State management (AppContext + dataManager)
4. `/go` endpoint for state inspection
5. Session isolation API

### P1 — Primary Features (Core workflows)
1. **Home Dashboard** — Welcome message, to-do items (action cards), upcoming payroll date, recent activity summary
2. **Run Payroll** — Multi-step wizard (4 steps): Hours → Time Off → Review → Confirmation. Table of employees with hours worked, gross pay, taxes, benefits, net pay. Submit payroll button.
3. **People / Team Members** — Searchable/filterable employee directory table with name, department, job title, status, start date. Click to view employee profile.
4. **Employee Profile / Add Employee** — Modal/page with multi-step form: Basics (name, email, job title, department, manager, start date) → Employment details → Review & send.
5. **Time Tracking** — Weekly view per employee: day-by-day hours with time ranges, edit capability, notes, overtime calculation, approve/reject toggle.
6. **Time Off** — PTO request list (pending/approved/denied), balance display, request time off form.
7. **Benefits** — Benefits overview with enrolled plans (Medical, Dental, Vision, 401k), cost per month, enrollment status.
8. **Payroll History** — List of past payroll runs with dates, amounts, status.

### P2 — Secondary Features (Depth)
1. **Org Chart** — Visual tree of company hierarchy
2. **Team Insights** — Headcount stats, turnover, department breakdown charts
3. **Performance** — Reviews, goals, feedback
4. **Pay Contractors** — Separate contractor payment flow
5. **Taxes & Compliance** — Tax forms list (W-2, 1099, quarterly), filing status
6. **Reports** — Payroll summary, tax payments, PTO balances, headcount reports
7. **Company Details** — Company info, locations, bank accounts, departments
8. **Documents** — Document storage (offer letters, I-9s, W-4s)
9. **Settings** — Company settings, notification preferences, permissions
10. **Refer & Earn** — Referral program card

## UI Patterns Observed

### Multi-step Wizard (Run Payroll, Add Employee)
- Horizontal progress bar at top with numbered steps
- Progress bar uses coral-to-green gradient as steps complete
- Step labels below dots: "1. Hours", "2. Time Off", "3. Review", "4. Confirmation"
- Back / Save & Continue / Save changes for later buttons at bottom

### Data Tables
- Clean, minimal table with subtle row borders
- Employee name in bold (with avatar for some), data in regular weight
- Dollar amounts right-aligned
- Totals row at bottom with bold/larger text

### Cards
- White background with subtle shadow or border
- Used for dashboard to-do items, benefit plan summaries
- "Start >" link in teal for actionable items

### Modals
- Large centered modal overlaying dimmed background
- Multi-step forms with "Save and close" / "Cancel" / primary action button
- Form fields: text inputs with labels above, dropdowns, date pickers, radio buttons

### Employee Time Detail (popup/overlay)
- Shows employee avatar + name + date range header
- Summary stats: Total hours, Regular, Overtime, Time off
- Day-by-day breakdown table with editable time ranges
- "Approved" toggle switch top-right
- Edit buttons per entry, "Add hours" link

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
- **Company** — name, EIN, locations, departments, pay schedule
- **Employee** — personal info, job info, compensation, status
- **Contractor** — similar to employee but 1099
- **Payroll** — pay period, employee compensations, totals, status
- **TimeEntry** — employee, date, clock in/out, hours, notes
- **TimeOffRequest** — employee, type, dates, status, balance
- **BenefitPlan** — type (medical/dental/vision/401k), provider, cost
- **BenefitEnrollment** — employee + plan + election
- **TaxForm** — type (W-2, 1099, quarterly), year, status
- **Document** — name, type, employee, uploaded date
- **TodoItem** — dashboard action items for admin

## What to Skip
- Authentication / login (app starts pre-logged-in as "Jessica Jackson", Administrator)
- Actual tax calculations (show realistic static numbers)
- Real payment processing
- Email notifications
- File uploads to real servers
- Integrations / App directory functionality

## Screenshot Inventory

| File | Content |
|------|---------|
| `gusto_000001.jpg` | **Run Payroll — Review step** (Step 3). Full sidebar visible. Employee payroll table with gross pay, reimbursements, taxes, benefits, subtotal. Submit payroll + Download Preview buttons. |
| `gusto_000005.jpg` | **Run Payroll — Hours step** (Step 1). Employee hours table with Additional Earnings columns (Commission, Bonus, etc.) and Gross Pay. |
| `gusto_000003.jpg` | **Onboarding checklist** for "Craig Ellis". Tasks list with due dates and Start links. Completed section below. Coral background decorative. |
| `000001.jpg` | **Add international employee modal** — Multi-step form (Basics/Employment details/Review). Shows full sidebar navigation clearly. Fields: Country, name, email, job title, manager, department, start date. |
| `000005.jpg` | **Time Tracking — Employee detail**. "Alex Martin" weekly breakdown. Day-by-day hours, edit popover with time inputs + note, Approved toggle. Summary: Total hours, Regular, Overtime, Time off. |
| `gusto_000004.jpg` | Marketing — "Enroll in benefits" mobile view showing Medical/Dental enrollment cards. |
