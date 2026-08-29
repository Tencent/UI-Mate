# Xpic MyChart Patient Portal — Research Summary

> Last updated: 2025-03-11
> Researcher: plan agent

## Application Overview

**Xpic MyChart** is the world's most widely deployed patient health portal, powered by Xpic Systems. It provides patients with secure online access to their electronic health records, enabling them to manage appointments, view test results, message care teams, manage medications, pay bills, and more. Over **195 million patients** actively use MyChart across thousands of healthcare organizations globally, with **6.45 billion unique logins** in the last 12 months.

MyChart is accessed via web browser (desktop) or mobile app (iOS/Android). Our mock targets the **desktop web portal** experience.

## Key User Personas

### Primary: The Active Patient ("Sarah Chen")
- Age 35, manages her own health records
- Regularly checks test results, messages her PCP
- Schedules annual physicals and specialist appointments
- Refills prescriptions online
- Reviews and pays medical bills

### Secondary: The Parent/Caregiver ("Maria Rodriguez")
- Manages health records for her two children and elderly mother (proxy access)
- Schedules pediatric visits, reviews immunization records
- Checks family members' test results

### Tertiary: The Chronic Condition Manager ("Frank Williams")
- Age 68, manages heart failure and hypertension
- Tracks vitals (blood pressure, pulse, weight)
- Reviews lab work frequently, communicates with specialists
- Multiple active medications requiring refills

## Navigation Structure (Desktop Web)

### Top Header Bar
- **Left**: MyChart by Xpic logo (teal/blue gradient header)
- **Center**: "MyChart" wordmark
- **Right**: Globe icon (language), Logout button
- **Below header**: Top navigation tabs: `Your Menu` | `Visits` | `Messages` | `Test Results` | `Billing/Insurance`
- **Far right of nav bar**: User avatar + name + "Switch ▼" dropdown (for proxy accounts)

### Left Sidebar ("Your Menu") — Revealed when clicking hamburger or "Your Menu"
Organized by category with icons:

**Find Care**
- Schedule an Appointment
- E-Visit
- View Care Team
- Immediate Care SmartExam
- Immediate Care Virtual Visit

**Communication**
- Messages (with unread badge count)
- Ask a Question
- Letters

**My Record**
- COVID-19
- Visits
- Test Results
- Medications
- Health Summary
- Plan of Care
- Preventive Care
- Questionnaires
- Upcoming Tests and Procedures
- Medical and Family History
- Health Reports
- Growth Charts

**Billing**
- Billing Summary
- Pay My Bill
- Insurance
- Estimates

**Preferences**
- Account Settings
- Notification Preferences
- Linked Accounts
- Share My Record

### Quick-Access Toolbar (some implementations show)
Icons for: To Do | Visits | Pay My Bill | Messages (bottom nav bar on mobile, shortcut bar on desktop)

## Feature Inventory

### P0 — Core (Must Have for App to Render)
1. **App Shell**: Top header with MyChart branding, nav tabs, user avatar/name
2. **Dashboard/Home**: Welcome message, upcoming appointment cards, unread message alerts, new test result notifications, care team sidebar
3. **Routing**: BrowserRouter with routes for all major sections
4. **State Management**: React Context with dataManager for all health data entities
5. **Session API**: `/go`, `/post`, `/state` endpoints in vite.config.js

### P1 — Primary Features (Core Interactive Workflows)

#### 1. Appointments / Visits
- **Upcoming Visits**: Card list showing date, time, provider name, visit type (In Person / Video), location, with "View Details", "Check In", "Cancel" buttons
- **Past Visits**: Chronological list of past appointments with date, provider, type, "View After Visit Summary" button
- **Schedule an Appointment**: Multi-step flow — select reason → choose provider → pick date/time → confirm
- **Visit Detail**: Expanded view with provider info, location/address, pre-visit instructions, e-check-in form

#### 2. Messages
- **Inbox**: List of message threads with sender avatar, provider name, subject, preview snippet, date, read/unread indicator (bold vs normal font)
- **Compose**: New message form with To (select provider from dropdown), Subject, Body textarea, optional attachment
- **Message Thread**: Conversation view showing back-and-forth messages with timestamps, "Reply" button
- **Sent / Archived / Trash** folders

#### 3. Test Results
- **Results List**: Chronological list showing test name, ordered date, status (Final / Pending / Reviewed), "View" button
- **Result Detail**: Shows test name, ordered by (provider), collected date, result values with reference ranges (normal/abnormal flags with color coding — green for normal, red for high/low), provider comments
- **Lab Panel View**: Grouped results for panel tests (e.g., Complete Blood Count shows WBC, RBC, Hemoglobin, etc. as sub-rows)

#### 4. Medications
- **Current Medications List**: Table with medication name, dosage, frequency, prescriber, pharmacy, status (Active/Discontinued)
- **Medication Detail**: Full details including instructions, start date, refills remaining, last filled date
- **Request Refill**: Checkbox selection of medications → pharmacy confirmation → submit refill request
- **Past Medications**: Separate tab for discontinued/historical medications

#### 5. Health Summary
- **Conditions/Problems**: Active diagnoses list (e.g., "Type 2 Diabetes Mellitus", "Hypertension")
- **Allergies**: List with allergen, reaction, severity
- **Vitals**: Recent vital signs — blood pressure, heart rate, temperature, weight, BMI, respirations
- **Immunizations**: Table with vaccine name, date administered, status
- **Demographics**: Patient name, DOB, gender, address, phone, email, emergency contact

#### 6. Billing
- **Billing Summary**: Outstanding balance card, list of recent statements/charges
- **Statement Detail**: Itemized charges with service date, description, provider, amount, insurance adjustments, patient responsibility
- **Pay My Bill**: Payment form with amount, payment method selection (credit card form), payment plan option
- **Insurance**: Insurance card display with plan name, member ID, group number

### P2 — Secondary Features (Depth & Realism)

1. **Preventive Care**: Checklist of recommended screenings (mammogram, colonoscopy, flu shot) with due dates and status
2. **Questionnaires**: Health questionnaires (PHQ-9, pain scale) with form fill and submit
3. **E-Visit**: Structured symptom questionnaire (select symptoms → answer follow-ups → provider responds async)
4. **Care Team**: Provider cards with photo, specialty, phone, "Send Message" button
5. **Medical/Family History**: Editable forms for personal and family medical history
6. **Letters**: Official letters from providers (referral letters, sick notes)
7. **Proxy/Family Access**: Switch between patient accounts (bottom of page or avatar dropdown)
8. **Notification Preferences**: Toggle email/text notifications for appointments, results, messages
9. **Account Settings**: Personal info, communication preferences, language setting
10. **Linked Accounts**: Connect MyChart accounts from different health systems

## UI Layout Description (Desktop)

### Color Palette
- **Primary (Header)**: Deep teal/blue gradient `#0075BC` → `#004B87`
- **Header text**: White `#FFFFFF`
- **Nav tabs background**: Light gray `#F5F5F5`
- **Nav tab active**: White with blue bottom border
- **Body background**: White `#FFFFFF` with light gray `#F0F2F5` section backgrounds
- **Primary accent/buttons**: Green `#00875A` (e-check-in, schedule) and Teal `#0075BC` (view details, links)
- **Alert/Urgent buttons**: Red `#D32F2F` or Orange `#FF9800`
- **Text primary**: Dark gray `#333333`
- **Text secondary/muted**: Gray `#757575`
- **Card borders**: Light gray `#E0E0E0`
- **Unread badge**: Red circle `#E53935` with white count

### Typography
- **Font family**: System sans-serif stack (Arial, Helvetica Neue, sans-serif)
- **Header (app name)**: 24px, bold
- **Nav tabs**: 14px, medium
- **Page titles**: 22-24px, bold
- **Card titles**: 16-18px, semibold
- **Body text**: 14px, normal
- **Muted text**: 12-13px, normal, gray

### Layout Structure
- **Top header**: Full-width, ~50px height, blue gradient background
- **Nav bar**: Full-width below header, ~44px, white/light gray, tab items spaced ~100px apart
- **Main content**: Max-width ~1200px centered, padded 20px
- **Dashboard**: Left main content area (~70%) + Right sidebar (~30%) for Care Team and quick links
- **Sidebar menu ("Your Menu")**: Slide-out panel ~320px wide, white background, overlays content

## Data Model Overview

See `data_model.md` for complete entity definitions. Key entities:
- **Patient** (the logged-in user)
- **Provider** (doctors, care team members)
- **Appointment** (upcoming and past visits)
- **Message** (inbox, sent, archived threads)
- **TestResult** (lab panels with individual observations)
- **Medication** (active and past prescriptions)
- **Condition** (active problems/diagnoses)
- **Allergy** (allergies and intolerances)
- **Immunization** (vaccine records)
- **Vital** (vital sign readings)
- **BillingStatement** (bills and charges)
- **Insurance** (coverage plans)
- **PreventiveCareItem** (screening recommendations)

## Out of Scope
- Login / logout / authentication (app starts pre-logged-in as Sarah Chen)
- Real API calls or FHIR integration
- Actual video visits / telehealth streaming
- File uploads to real servers
- Email/SMS notifications
- PDF generation
- Two-step verification / biometric login

## Screenshots Reference

See `screenshots/` directory:
- `dashboard_000001.jpg` — **KEY**: Real MyChart dashboard showing top nav (Your Menu, Visits, Messages, Test Results, Questionnaires), welcome card, upcoming appointment, message notification, test result alert, care team sidebar
- `messaging_000001.jpg` — **KEY**: Full left sidebar menu revealed ("Your Menu") showing all navigation categories and items
- `messaging_000004.jpg` — MyChart mobile home screen showing icon grid (Visits, Menu, Medications, Messages, Test Results)
- `appointments_000001.jpg` — MyChart Bedside view showing patient vitals, conditions, medications
- `appointments_000003.jpg` — Mobile Activities view showing icon grid: Test Results, Messages, Appointments, Medications, Health Reminders, Health Summary, Billing, Questionnaires, Track My Health
- `medications_000001.jpg` — Prescription refill interface
- `billing_000001.jpg` — Payment plan setup with amount and payment method
- `billing_000003.jpg` — Visit summary reference
