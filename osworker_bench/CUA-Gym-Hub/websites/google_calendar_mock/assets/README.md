# Xoogle Calendar Mock — Research Summary

## App Overview
Xoogle Calendar is Google's web-based calendar and scheduling application. It allows users to create, manage, and share events across multiple calendars with color-coding, reminders, recurring events, and guest invitations. The desktop web interface (calendar.google.com) is the target for this mock.

## Key User Personas & Workflows

### Persona 1: Knowledge Worker (Primary)
- Creates meetings with colleagues (time, location, guests, Google Meet link)
- Switches between Week and Day views to plan their schedule
- Drags events to reschedule
- Checks other people's availability before scheduling
- Uses multiple calendars (Work, Personal, Team)

### Persona 2: Personal User
- Manages personal appointments, birthdays, holidays
- Creates all-day events for trips/vacations
- Sets reminders for tasks
- Uses Month view to get an overview

## Xoogle Calendar Desktop UI Layout

### Header Bar (64px height)
- **Left section**: Hamburger menu (toggles sidebar) → Xoogle Calendar logo (calendar icon with current date number, blue square) → "Calendar" text
- **Center-left**: "Today" button (outlined) → Left/Right chevron arrows → Current period title (e.g., "March 2026")
- **Right section**: Search icon (opens search bar) → Settings gear → View dropdown (Day/Week/Month/Year/Schedule/4 Days) → User avatar circle

### Left Sidebar (256px width, collapsible)
- **Create button**: Large pill-shaped button with colorful "+" icon (red/yellow/green/blue gradient cross), shadow on hover, text "Create" — clicking opens a dropdown with "Event", "Task", "Reminder", "Appointment schedule"
- **Mini calendar**: Small month grid for quick date navigation. Current date has blue circle. Selected date has light blue background. Clicking a date navigates the main view.
- **"My calendars" section**: List of user's calendars, each with a colored checkbox (square with rounded corners). Clicking toggles visibility. Includes: calendar name, 3-dot overflow menu on hover.
- **"Other calendars" section**: Subscribed calendars (Holidays, etc.) with same checkbox pattern.
- **"Search for people"**: Input to find other users' calendars.

### Main Content Area
Varies by view:

#### Month View
- 7-column grid (Sun–Sat headers)
- Each cell: date number (top-left), event chips stacked vertically
- Event chips: small colored rectangles with event title, truncated
- "X more" link if >3–4 events per day
- Current day: date number in blue circle
- Days outside current month: grayed out
- Clicking empty space → quick event creation
- Clicking event → event popover

#### Week View
- 7-day columns with all-day section at top
- Time labels on left (12am–11pm, 60px per hour)
- Events as colored blocks spanning their time range
- Current time: red horizontal line across the grid
- Overlapping events placed side-by-side
- Clicking empty slot → event creation at that time

#### Day View
- Single column, same time grid as Week View
- All-day events at top
- More space per event to show details

#### Year View
- 12 mini month grids (4 columns × 3 rows)
- Days with events have dots beneath them
- Clicking a date navigates to Day view

#### Schedule/Agenda View
- Chronological list of upcoming events
- Grouped by date with date headers
- Each event shows: color dot, time range, title, location

### Event Popover (on click)
- Appears near the clicked event
- Shows: colored square + event title, date/time, location, calendar name, description snippet
- Action buttons: Edit (pencil), Delete (trash), Close (X)

### Event Creation/Edit Modal
- Full modal overlay with form:
  - Title input (large, top)
  - Date/time pickers (start, end)
  - All-day toggle
  - Recurrence dropdown (Does not repeat / Daily / Weekly / Monthly / Yearly / Custom)
  - Location input
  - Description textarea
  - Calendar selector dropdown
  - Guest input (email autocomplete, shows avatars)
  - Google Meet "Add conferencing" button
  - Reminder settings (Notification/Email, N minutes/hours/days before)
  - Color picker for event
  - Save / More Options buttons

## Visual Design System

### Colors (from real Xoogle Calendar)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary (Google Blue) | `#1A73E8` | Today circle, selected states, links, Save button |
| Primary Hover | `#1557B0` | Button hover states |
| Background | `#FFFFFF` | Main content area |
| Surface Gray | `#F1F3F4` | Search bar bg, sidebar hover |
| Border | `#DADCE0` | All borders, dividers |
| Text Primary | `#3C4043` | Main text, event titles |
| Text Secondary | `#70757A` | Time labels, muted text |
| Error/Red | `#D93025` | Delete actions, current time line |
| Event Colors: Tomato | `#D50000` | |
| Event Colors: Flamingo | `#E67C73` | |
| Event Colors: Tangerine | `#F4511E` | |
| Event Colors: Banana | `#F6BF26` | |
| Event Colors: Sage | `#33B679` | |
| Event Colors: Basil | `#0B8043` | |
| Event Colors: Peacock | `#039BE5` | |
| Event Colors: Blueberry | `#3F51B5` | |
| Event Colors: Lavender | `#7986CB` | |
| Event Colors: Grape | `#8E24AA` | |
| Event Colors: Graphite | `#616161` | |

### Typography
- Font family: `Google Sans`, `Roboto`, `Arial`, sans-serif
- Header title: 22px, 400 weight
- Day headers: 11px, 500 weight, uppercase
- Event text: 12px, 400/500 weight
- Time labels: 10px, 400 weight
- Mini calendar: 12px

### Spacing
- Sidebar width: 256px
- Header height: 64px
- Hour row height: 60px (week/day view)
- Event chip height: ~20px (month view)
- Mini calendar cell: 28×28px

## Complete Feature List

### P0 — Core (App Cannot Render Without)
1. App shell layout (header + sidebar + main area)
2. React Router with `/` and `/go` routes
3. State management (context + dataManager with session isolation)
4. Month View with event display
5. Week View with time grid
6. Day View
7. Navigation (Today, prev/next, date display)
8. View switcher (Day/Week/Month/Year/Schedule)

### P1 — Primary Interactive Features
1. Create event via modal (title, time, location, description, calendar, guests)
2. Edit event via modal
3. Delete event
4. Event click → popover with details
5. Mini calendar in sidebar (date navigation)
6. Calendar visibility toggles (checkboxes)
7. Drag-and-drop event rescheduling (month + week views)
8. All-day events (displayed in top section of week/day views)
9. Quick event creation (click empty time slot)
10. Recurring events (daily/weekly/monthly/yearly)
11. Search events
12. Create/delete calendars
13. Event color picker
14. Guest management (add/remove attendees)
15. Reminders (notification type + timing)

### P2 — Secondary/Depth Features
1. Year View (12 mini months)
2. Schedule/Agenda View (chronological list)
3. "4 Days" custom view option
4. Current time indicator (red line in week/day views)
5. Settings panel (week start day, default event duration, default view)
6. Event duplication
7. Quick Add (natural language parsing: "Meeting tomorrow 2pm")
8. "X more" overflow in month view cells
9. Keyboard shortcuts (c=create, d/w/m=views, t=today, delete=remove)
10. Google Meet link generation (mock)
11. Create button dropdown (Event/Task/Reminder)
12. Other calendars section (holidays, birthdays)
13. Print calendar view

## What to Skip
- Authentication/login (pre-logged-in as Demo User)
- Real Google Meet integration
- Real email invitations
- Calendar sharing permissions
- Import/export ICS files
- Mobile responsive layout (desktop only)
- Timezone conversion
- Real notification delivery
