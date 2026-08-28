# Xpic MyChart Patient Portal Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-03-13
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Screenshots: `assets/screenshots/` (30 images across dashboard, appointments, test results, messaging, medications, billing views)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

<!-- Without these, the app cannot render. Dev implements these first. -->

- [x] **Project scaffold**: `npm create vite@latest xpic-health_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`. Use **plain CSS** (no Tailwind) for pixel-accurate styling matching MyChart screenshots.

- [x] **Visual design system**: Study `assets/screenshots/dashboard_000001.jpg` and `assets/screenshots/messaging_000001.jpg` carefully. Create `src/styles/variables.css` with CSS custom properties:
  - `--color-header-bg`: Linear gradient from `#0075BC` to `#004B87` (deep blue/teal)
  - `--color-header-text`: `#FFFFFF`
  - `--color-nav-bg`: `#F5F5F5` (light gray tab bar)
  - `--color-nav-active`: `#FFFFFF` with `#0075BC` bottom border (2px)
  - `--color-nav-text`: `#333333`, active: `#0075BC`
  - `--color-body-bg`: `#FFFFFF`, section bg: `#F0F2F5`
  - `--color-primary`: `#0075BC` (teal/blue links, buttons)
  - `--color-success`: `#00875A` (green — check-in, confirm buttons)
  - `--color-danger`: `#D32F2F` (red — cancel, urgent)
  - `--color-warning`: `#FF9800` (orange — attention)
  - `--color-text-primary`: `#333333`
  - `--color-text-secondary`: `#757575`
  - `--color-border`: `#E0E0E0`
  - `--color-badge`: `#E53935` (red unread badge)
  - `--color-card-bg`: `#FFFFFF`
  - `--color-sidebar-bg`: `#FFFFFF`
  - `--font-family`: `"Helvetica Neue", Arial, sans-serif`
  - Font sizes: `--font-xs: 12px`, `--font-sm: 13px`, `--font-base: 14px`, `--font-md: 16px`, `--font-lg: 18px`, `--font-xl: 22px`, `--font-xxl: 24px`
  - `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 12px`
  - `--shadow-sm: 0 1px 3px rgba(0,0,0,0.1)`, `--shadow-md: 0 2px 8px rgba(0,0,0,0.15)`

- [x] **App layout** (`src/App.jsx` + `src/App.css`): As seen in `dashboard_000001.jpg`:
  - **Top header bar**: Full-width, 50px height, blue gradient background. Left: "MyChart" logo text (white, with small "MyChart by Xpic" sub-logo). Right: globe icon (language), user avatar circle (40px, teal with white initials "SC") + "Sarah Chen" text + "Switch ▼" dropdown, logout icon.
  - **Navigation tab bar**: Full-width, 44px, light gray `#F5F5F5` background, below header. Tab items with icons: 🏠 `Your Menu` (hamburger icon) | 📅 `Visits` | ✉ `Messages` (with red badge for unread count) | 🔬 `Test Results` | 💰 `Billing & Insurance`. Each tab is ~120px wide, separated by subtle dividers. Active tab has white background and blue bottom border.
  - **Main content area**: Max-width 1200px, centered, padding 20px on sides. Background `#F0F2F5`.
  - **Slide-out sidebar** ("Your Menu"): 340px wide panel that slides in from left when "Your Menu" tab is clicked. White background with shadow. Search input at top ("Search the menu"), then categorized menu items with small icons (see full list in `messaging_000001.jpg` screenshot). Categories: **Find Care** (Schedule an Appointment, E-Visit, View Care Team), **Communication** (Messages, Ask a Question, Letters), **My Record** (Visits, Test Results, Medications, Health Summary, Preventive Care, Questionnaires, Medical and Family History), **Billing** (Billing Summary, Insurance). Click item → navigate to route, close sidebar.

- [x] **Routing** (`src/App.jsx` with BrowserRouter): Define routes:
  - `/` → Dashboard/Home
  - `/visits` → Visits (upcoming + past)
  - `/visits/:id` → Visit Detail
  - `/schedule` → Schedule Appointment flow
  - `/messages` → Messages inbox
  - `/messages/compose` → Compose new message
  - `/messages/:threadId` → Message thread view
  - `/test-results` → Test Results list
  - `/test-results/:id` → Test Result detail
  - `/medications` → Medications list
  - `/medications/:id` → Medication detail
  - `/medications/refill` → Request refill flow
  - `/health-summary` → Health Summary (conditions, allergies, vitals, immunizations)
  - `/billing` → Billing summary
  - `/billing/:id` → Statement detail
  - `/billing/pay` → Pay bill form
  - `/insurance` → Insurance info
  - `/preventive-care` → Preventive care checklist
  - `/care-team` → Care team provider list
  - `/settings` → Account settings
  - `/go` → State inspection JSON endpoint (GoPage component)

- [x] **State management**: `src/context/AppContext.jsx` wrapping entire app. Provides `state` and `dispatch` (useReducer pattern). Actions: `SET_STATE`, `UPDATE_APPOINTMENT`, `ADD_MESSAGE`, `MARK_MESSAGE_READ`, `UPDATE_MEDICATION`, `REQUEST_REFILL`, `DISMISS_NOTIFICATION`, `SET_ACTIVE_SECTION`, `TOGGLE_SIDEBAR`, `CANCEL_APPOINTMENT`, `PAY_BILL`, `SCHEDULE_APPOINTMENT`. On mount, check for server-injected state via `fetch('/state?sid=...')` then fall back to `createInitialData()` from `src/utils/dataManager.js`. Persist current state to localStorage on every change. Expose `window.__APP_STATE__` for state inspection.

- [x] **Data manager** (`src/utils/dataManager.js`): Implement `createInitialData()` returning full data structure per `assets/data_model.md`. All 13 entity types with realistic seed data. Include the exact records specified in data_model.md tables. Export `INITIAL_STATE` for use in vite.config.js.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` at route `/go` that renders JSON with `{initial_state, current_state, state_diff}`. Also implement the server-side `/go` handler in `vite.config.js` (copy the standard pattern from `gmail_mock/vite.config.js` — includes `/go`, `/state`, `/post` with `set`/`set_current`/`reset` actions, `/upload`, `/files` endpoints). Import `INITIAL_STATE` from data manager.

- [x] **Session isolation**: In `vite.config.js`, implement the full mock-api plugin with session support (`?sid=` parameter) for `/post`, `/state`, `/go`, `/upload`, `/files` endpoints. Copy the exact pattern from the gmail_mock vite.config.js (which is the repo standard). Duplicate for both `configureServer` and `configurePreviewServer`.

---

## P1 — Primary Features

<!-- Core features a user interacts with in the first 5 minutes. Implement in this order. -->

### Dashboard / Home Page

- [x] **Welcome banner**: Full-width card at top of main content showing "Welcome, Sarah!" with current date. Light blue/teal gradient background, white text. Below it, notification cards for: upcoming appointment reminder (teal/blue card with calendar icon, appointment date/time/provider, "View Details" and "e-preregistration" green button), unread messages alert (blue envelope icon with count badge, "View All (N)" link), new test results alert (flask icon, "New [test name] results from [date]", green "View Results" button). Each notification card is dismissible (small X in top-right corner). See `dashboard_000001.jpg` for exact layout.

- [x] **Upcoming appointments card**: Below welcome section. Shows next 1-2 upcoming appointments as cards. Each card: Left side has large date display (day number in teal, month abbreviation below), then appointment details: time with timezone ("9:30 AM EDT"), provider name ("With Elizabeth Morrison, MD"), visit type badge ("Office Visit" / "Video Visit"). Right side buttons: green "e-preregistration" button (if check-in available) and blue "View Details" link. Cards have white background, subtle shadow, rounded corners.

- [x] **Care Team sidebar**: Right column (30% width) on dashboard. Header "Your Care Team and Recent Providers" in teal text. Provider cards stacked vertically: each shows 48px avatar circle (colored with initials), provider name (bold), role ("Primary Care Provider"), specialty ("Family Medicine"). Each has small message icon and phone icon buttons. Below providers: "See provider details and manage" link in blue. At bottom of sidebar: "Linked Accounts" section if user has proxy access.

### Visits / Appointments

- [x] **Visits page** (`/visits`): Two-tab layout — "Upcoming" (default active) and "Past Visits" tabs. **Upcoming tab**: List of scheduled appointments as cards. Each card shows: date (left, large format), time, provider name with avatar, visit type (badge: "Office Visit" in blue, "Video Visit" in green with camera icon), location address, department. Action buttons: "Check In" (green, only if canCheckIn), "View Details" (blue outline), "Cancel" (red text link), "Reschedule" (gray text link). **Past Visits tab**: Chronological list (newest first) of completed visits. Each row: date, provider, visit type, "View After Visit Summary" button (blue). Filter dropdown at top: "All visits" / "Last 6 months" / "Last year".

- [x] **Visit detail page** (`/visits/:id`): Full appointment info card. Header: visit type + date/time. Sections: **Appointment Information** (provider name with avatar, specialty, department, location with address, phone), **Pre-Visit Instructions** (text block from appointment.instructions), **E-Check-In** section (if upcoming — form with checkboxes: "Verify demographics", "Verify insurance", "Verify medications", "Verify allergies", "Sign consent forms" with "Complete Check-In" green button), **After Visit Summary** (if completed — provider notes, diagnoses discussed, medications changed, follow-up instructions). Back button "← Back to Visits".

- [x] **Schedule appointment flow** (`/schedule`): Multi-step wizard. **Step 1 — Reason**: "What is the reason for your visit?" — dropdown/radio options: Annual Physical, Follow-Up Visit, New Concern, Sick Visit, Prescription Refill, Referral. Free-text "Additional details" textarea. **Step 2 — Provider**: Select from care team providers. Card for each with avatar, name, specialty, next available date shown. Option "First Available" at top. **Step 3 — Date/Time**: Calendar grid showing available dates (next 30 days). Click date → shows time slots (9:00 AM, 9:30 AM, 10:00 AM, etc.) as clickable chips. Green = available, gray = unavailable. **Step 4 — Confirm**: Summary card showing all selections. "Confirm Appointment" green button. On confirm: add to appointments array, show success message, redirect to `/visits`. Progress bar at top showing steps 1→2→3→4 with current highlighted.

- [x] **Cancel appointment modal**: Triggered from visit detail or visits list "Cancel" button. Modal dialog: "Are you sure you want to cancel this appointment?" with appointment summary. Radio options for reason: "Schedule conflict", "No longer needed", "Found another provider", "Other" (with textarea). "Cancel Appointment" red button and "Keep Appointment" gray button. On confirm: update appointment status to "Cancelled", remove from upcoming list.

### Messages

- [x] **Messages inbox** (`/messages`): Left panel (40%) shows message thread list, right panel (60%) shows selected thread. **Thread list**: Each row shows: unread indicator (blue dot for unread), sender avatar circle, sender name (bold if unread, normal if read), subject line truncated, message preview snippet (1 line, gray), date/time (relative: "2 hours ago", "Mar 8", etc.). Threads sorted by most recent message. Above list: folder tabs — "Inbox" (with count badge), "Sent", "Archived". Top-right: blue "New Message" button (envelope + icon). Search bar at top of list: "Search messages".

- [x] **Message thread view** (`/messages/:threadId`): Right panel showing full conversation. Header: subject line (bold, 18px), "From: Dr. Morrison" / "To: Sarah Chen" with provider avatar. Messages displayed chronologically (oldest at top): each message bubble shows sender name, date/time, full body text. Provider messages have light blue-gray background, patient messages have white background with blue-left-border. At bottom: reply area with textarea ("Type your reply..."), "Send" blue button, "Attach" paperclip icon. Clicking "Send" adds new message to thread, updates state.

- [x] **Compose message** (`/messages/compose`): Full-page or modal form. **To**: Dropdown/searchable select populated from providers list (show name + specialty). **Subject**: Text input. **Body**: Large textarea (min 200px height). **Attach**: File attachment button (mock only — shows filename but doesn't upload). Buttons: "Send" (blue), "Save Draft" (gray outline), "Cancel" (text link). On send: create new message thread, add to messages array, redirect to inbox.

- [x] **Mark read/unread**: Clicking a thread in the list marks all its messages as read, updates unread count badge in nav tab and on inbox folder tab. Right-click or action menu (⋮) on thread row: "Mark as Unread", "Archive", "Delete" options.

### Test Results

- [x] **Test results list** (`/test-results`): Table/card list showing all test results. Columns/fields: Test Name (bold, clickable link), Ordered Date, Result Date, Ordered By (provider), Status badge ("Final" in green, "Pending" in yellow, "Preliminary" in orange). New/unreviewed results have a blue "NEW" badge next to name. Sort by date (newest first default). Filter: "All" / "Lab" / "Imaging" / "Pathology" tab filters. Clicking a test navigates to detail view.

- [x] **Test result detail** (`/test-results/:id`): Full result display. Header: test name (bold, 22px), status badge, dates (ordered/collected/resulted). **Provider Comment** section: boxed area with provider's comment text (if any) in italic. **Results Table**: For each observation in the result — columns: Component Name | Value | Units | Reference Range | Flag. Value cell is color-coded: green text for Normal, red text + bold for High (with "H" flag) or Low (with "L" flag), dark red for Critical. Reference range shows "70 - 100" format. If panel test (like CMP), show all observations in a grouped table with alternating row colors. Back button: "← Back to Test Results". Action buttons: "Print Results", "Share with Provider" (mock/no-op).

### Medications

- [x] **Medications list** (`/medications`): Two tabs — "Current Medications" (default) and "Past Medications". **Current tab**: Card list, each medication card shows: medication name (bold, 16px) + dosage on first line, frequency + route on second line, prescriber name, pharmacy name, status badge ("Active" green). Right side: refill info — "Refills remaining: 3/5" with progress bar, "Last filled: Feb 20, 2025". Checkbox on left for bulk refill selection. Top-right: blue "Request Refill" button (navigates to `/medications/refill` with pre-selected items). **Past tab**: Same layout but grayed out with "Discontinued" badge and discontinuation date.

- [x] **Medication detail** (`/medications/:id`): Full medication info page. Sections: **Medication Info** (name, generic name, dosage, form, route, frequency), **Instructions** (full text instructions), **Prescription Details** (prescriber, pharmacy with address/phone, start date, days supply, quantity), **Refill Information** (refills remaining/total as progress bar, last filled date, "Request Refill" button if refillable), **Reason** (condition it treats). Back button: "← Back to Medications".

- [x] **Request refill flow** (`/medications/refill`): Page showing refillable medications with checkboxes (pre-checked if navigated from selection). Each row: medication name + dosage, pharmacy name, refills remaining. Bottom section: "Preferred Pharmacy" dropdown (pre-filled with default), "Comments" textarea for pharmacist. "Submit Refill Request" green button. On submit: update medication lastFilledDate and decrement refillsRemaining, show success toast "Refill request submitted for N medications", redirect to `/medications`.

### Health Summary

- [x] **Health summary page** (`/health-summary`): Accordion-style sections, all expanded by default:
  - **Current Conditions**: Table with columns: Condition Name | Status (badge) | Diagnosed Date | Diagnosed By | Notes. Active conditions shown with green "Active" badge. See `data_model.md §Condition`.
  - **Allergies**: Table: Allergen | Type (badge: "Medication" blue, "Food" orange, "Environmental" green) | Reaction | Severity (badge: "Severe" red, "Moderate" yellow, "Mild" green) | Notes.
  - **Current Vitals**: Most recent vital record displayed as a grid of cards (similar to `appointments_000001.jpg` — MyChart Bedside view). Each vital: icon + value + unit + label. Cards for: Blood Pressure (heart icon, "128/82 mmHg"), Heart Rate (pulse icon, "72 bpm"), Temperature (thermometer, "98.6°F"), Weight (scale, "154 lbs"), BMI ("25.6 kg/m²"), O2 Sat ("98%"). Color-coded: normal = teal, elevated = orange, high/low = red.
  - **Immunizations**: Table: Vaccine Name | Date Administered | Site | Status | Next Due Date. Sorted by most recent first.
  - **Demographics**: Card showing patient info: name, DOB, age, gender, address, phone, email, emergency contact, preferred pharmacy, preferred language. "Edit" link (opens inline edit for phone/email/address).

### Billing

- [x] **Billing summary** (`/billing`): Top card: "Your Balance" showing total outstanding amount in large bold ($245.00), "Pay Now" green button. Below: **Recent Statements** list. Each statement row: statement date, service date range, total amount, status badge ("Due" orange, "Paid" green, "Overdue" red, "Payment Plan" blue), "View Details" link. At bottom: "View Payment History" link. Side card: "Insurance Summary" mini-card showing plan name and member ID.

- [x] **Statement detail** (`/billing/:id`): Header: "Statement from [date]" with status badge and amount due. **Line Items Table**: columns: Service Date | Description | Provider | Charged | Insurance Adj. | Insurance Paid | You Owe. Each row is a line item from the statement. Footer row: totals. Payment action: "Pay This Statement" green button (navigates to `/billing/pay` with pre-filled amount).

- [x] **Pay bill form** (`/billing/pay`): Card form. **Amount**: Input pre-filled with balance due, editable. **Payment Method**: Radio buttons — "Credit/Debit Card" (form: card number, expiration, CVV, billing zip), "Bank Account" (routing number, account number). **Payment Plan Option**: "Set Up Payment Plan" link that reveals: monthly amount input, payment day of month (1-31), calculated end date. Buttons: "Submit Payment" green, "Cancel" gray. On submit: update billing statement (reduce balanceDue, update status to "Paid" if fully paid), show success message "Payment of $X.XX processed successfully".

---

## P2 — Secondary Features

<!-- Depth and realism, implement after P1 is complete. -->

- [x] **Preventive care checklist** (`/preventive-care`): Card list of preventive care items. Each card: item name, category icon, status badge ("Completed" green checkmark, "Due" yellow clock, "Overdue" red exclamation, "Not Applicable" gray), last completed date, next due date, frequency. "Due" and "Overdue" items highlighted with colored left border. Action button for due items: "Schedule Now" (links to schedule flow).

- [x] **Care team page** (`/care-team`): Grid of provider cards (2-3 per row). Each card: large avatar circle (80px), provider name, title, specialty, department, location, phone number. Action buttons: "Send Message" (blue, navigates to compose with provider pre-selected), "Schedule Appointment" (green outline). Grouped by relationship: "Your Providers" and "Recent Providers".

- [ ] **E-Visit flow**: From schedule or sidebar. Structured questionnaire: Step 1 — Select symptom category (dropdown: Cold/Flu, Urinary, Skin, Eye, etc.). Step 2 — Symptom details form (onset, duration, severity 1-10, associated symptoms checkboxes). Step 3 — Review & Submit. On submit: creates a new message thread with type "E-Visit" and the questionnaire responses formatted as the message body.

- [ ] **Letters inbox**: Separate section listing official documents/letters. Each row: letter type (Referral, After Visit Summary, Lab Report), date, from provider, "View" button that opens letter content in a formatted document view.

- [x] **Account settings** (`/settings`): Sections: **Personal Information** (name, DOB — read only; address, phone, email — editable with "Edit"/"Save" buttons), **Communication Preferences** (toggle switches for: appointment reminders email/text, test result notifications email/text, billing notifications email/text, marketing communications), **Language** (dropdown: English, Spanish, Chinese, etc.), **Linked Accounts** (list of connected health organizations with "Unlink" option).

- [ ] **Proxy account switching**: In header, clicking user avatar dropdown shows: current user "Sarah Chen" with checkmark, then "Managed Accounts" section listing family members (e.g., "Michael Chen (Son)" with age). Clicking a managed account switches `currentUser` context and reloads dashboard with that person's data. Second set of mock data for child patient (fewer conditions, different immunization schedule, pediatric vitals).

- [ ] **Search functionality**: In sidebar "Your Menu", search input at top filters menu items in real-time as user types. Also global search in the nav area — typing searches across messages (subject/body), test results (test names), medications (drug names), providers (names). Results shown in dropdown grouped by category.

- [ ] **Questionnaires**: Pre-visit health questionnaire form. Example PHQ-9 depression screening: 9 questions, each with radio options (Not at all / Several days / More than half the days / Nearly every day), scored 0-3. Shows total score and interpretation at bottom. "Submit" button saves responses.

- [ ] **Print/Share actions**: On test results and visit summaries, "Print" button opens browser print dialog with print-friendly CSS. "Share" button shows modal with options: "Share with another provider" (select from list), "Download PDF" (generates mock PDF view).

---

## Data Seed (implement in createInitialData())

<!-- Dev must create realistic seed data matching these specs. -->

- [x] **Patient**: 1 primary user (Sarah Chen) with full demographics as specified in `data_model.md §Patient`
- [x] **Providers**: 5 providers covering family medicine, cardiology, dermatology, dentistry, and nursing staff — see `data_model.md §Provider` table
- [x] **Appointments**: 6 total — 3 upcoming (Apr 15 annual physical, Apr 28 cardiology follow-up, May 10 dermatology), 3 completed (Mar 1, Jan 15, Nov 20 2024) — see `data_model.md §Appointment` table
- [x] **Messages**: 8+ messages across 4+ threads covering: lab results discussion, appointment reminders, prescription confirmation, medication questions — see `data_model.md §Message` table. 2 unread messages.
- [x] **Test Results**: 5 results (CMP, Lipid Panel, CBC, HbA1c, Thyroid Panel) with full observation arrays including one abnormal value (LDL slightly high) — see `data_model.md §TestResult` table
- [x] **Medications**: 6 medications (4 active: Lisinopril, Atorvastatin, Metformin, Vitamin D3; 2 discontinued: Amoxicillin, Prednisone) — see `data_model.md §Medication` table
- [x] **Conditions**: 4 active conditions (Hypertension, Type 2 Diabetes, Hyperlipidemia, Seasonal Allergies) — see `data_model.md §Condition` table
- [x] **Allergies**: 3 allergies (Penicillin medication, Peanuts food, Latex environmental) — see `data_model.md §Allergy` table
- [x] **Immunizations**: 6 records (Flu, COVID booster, Tdap, Hep B, MMR, Varicella) — see `data_model.md §Immunization` table
- [x] **Vitals**: 3 records from recent visits showing improving trend (BP decreasing over time) — see `data_model.md §Vital` table
- [x] **Billing**: 3 statements (1 due $245, 2 paid $75 and $150) with full line items — see `data_model.md §BillingStatement` table
- [x] **Insurance**: 1 BCBS PPO plan with copays, deductible tracking, out-of-pocket max — see `data_model.md §Insurance`
- [x] **Preventive Care**: 6 items with mixed statuses (completed, due, overdue) — see `data_model.md §PreventiveCareItem` table
- [x] **UI State**: Initialize with activeSection "home", 2 unread messages, 2 notification banners (upcoming appointment + new test results)

---

## Out of Scope

<!-- Dev must NOT implement these. -->

- Authentication / login / logout (app starts pre-logged-in as Sarah Chen)
- Password management, account creation, two-step verification
- Real FHIR API integration or network calls
- Actual video visits / telehealth streaming
- Real file uploads to servers
- Email/SMS/push notifications
- PDF document generation
- Encryption or security mechanisms
- Real payment processing
- Database persistence (use localStorage only)
