# Xoogle Calendar Mock — Data Model

## Entity Types

### User
```js
{
  id: "u1",                          // string, unique
  username: "Demo User",             // string, display name
  email: "demo@example.com",         // string
  avatar: "https://..."              // string, URL to avatar image
}
```

### Calendar
```js
{
  id: "c1",                          // string, unique (c1, c2, c3, ...)
  name: "Personal",                  // string, display name
  color: "#039BE5",                  // string, hex color (NOT tailwind class)
  visible: true,                     // boolean, show/hide in views
  userId: "u1",                      // string, owner reference
  isDefault: true                    // boolean, default calendar for new events
}
```

**Important**: Colors should be stored as hex values, not Tailwind classes. This allows proper rendering in both Tailwind utility classes and inline styles. The dev agent should migrate from `bg-blue-500` to hex colors.

### Event
```js
{
  id: "evt_001",                     // string, unique
  calendarId: "c1",                  // string, references Calendar.id
  title: "Team Standup",             // string, event title
  start: "2026-03-08T10:00:00.000Z", // ISO 8601 datetime string
  end: "2026-03-08T11:00:00.000Z",   // ISO 8601 datetime string
  allDay: false,                     // boolean
  location: "Conference Room A",     // string, free-form
  description: "Daily sync",         // string, supports plain text
  color: "#33B679",                  // string, hex color (overrides calendar color)
  guests: [                          // array of email strings
    "alice@example.com",
    "bob@example.com"
  ],
  recurring: "none",                 // "none" | "daily" | "weekly" | "monthly" | "yearly"
  reminders: [                       // array of reminder objects
    { type: "popup", minutes: 10 },
    { type: "email", minutes: 30 }
  ],
  meetLink: "",                      // string, mock Google Meet URL
  status: "confirmed"               // "confirmed" | "tentative" | "cancelled"
}
```

### Settings
```js
{
  weekStart: 0,                      // 0=Sunday, 1=Monday
  defaultDuration: 60,               // minutes
  defaultView: "week",               // "day" | "week" | "month" | "year" | "schedule"
  defaultReminder: { type: "popup", minutes: 10 },
  timeFormat: "12h",                 // "12h" | "24h"
  showWeekNumbers: false,            // boolean
  showDeclinedEvents: false          // boolean
}
```

## Relationships
- `Event.calendarId` → `Calendar.id` (many-to-one)
- `Calendar.userId` → `User.id` (many-to-one, but in mock all belong to u1)
- `Event.guests` references mock user emails (not enforced as foreign keys)

## Xoogle Calendar Event Color Palette
These are the 11 named colors from real Xoogle Calendar:
```js
const EVENT_COLORS = [
  { id: "tomato",    name: "Tomato",    hex: "#D50000" },
  { id: "flamingo",  name: "Flamingo",  hex: "#E67C73" },
  { id: "tangerine", name: "Tangerine", hex: "#F4511E" },
  { id: "banana",    name: "Banana",    hex: "#F6BF26" },
  { id: "sage",      name: "Sage",      hex: "#33B679" },
  { id: "basil",     name: "Basil",     hex: "#0B8043" },
  { id: "peacock",   name: "Peacock",   hex: "#039BE5" },
  { id: "blueberry", name: "Blueberry", hex: "#3F51B5" },
  { id: "lavender",  name: "Lavender",  hex: "#7986CB" },
  { id: "grape",     name: "Grape",     hex: "#8E24AA" },
  { id: "graphite",  name: "Graphite",  hex: "#616161" },
];
```

## Mock Users (for guest picker)
```js
const MOCK_USERS = [
  { email: "alice@example.com",   name: "Alice Smith",    avatar: "..." },
  { email: "bob@example.com",     name: "Bob Jones",      avatar: "..." },
  { email: "charlie@example.com", name: "Charlie Brown",  avatar: "..." },
  { email: "david@example.com",   name: "David Lee",      avatar: "..." },
  { email: "eve@example.com",     name: "Eve Wilson",     avatar: "..." },
  { email: "frank@example.com",   name: "Frank Garcia",   avatar: "..." },
  { email: "grace@example.com",   name: "Grace Chen",     avatar: "..." },
];
```

## createInitialData() Structure

```js
function createInitialData() {
  const today = startOfToday();
  return {
    user: { id: "u1", username: "Demo User", email: "demo@example.com", avatar: "..." },
    calendars: [
      { id: "c1", name: "Personal",    color: "#039BE5", visible: true, userId: "u1", isDefault: true },
      { id: "c2", name: "Work",        color: "#33B679", visible: true, userId: "u1", isDefault: false },
      { id: "c3", name: "Family",      color: "#8E24AA", visible: true, userId: "u1", isDefault: false },
      { id: "c4", name: "Holidays",    color: "#F4511E", visible: true, userId: "u1", isDefault: false },
      { id: "c5", name: "Birthdays",   color: "#E67C73", visible: true, userId: "u1", isDefault: false },
    ],
    events: [
      // See "Seed Data" section below
    ],
    view: "week",        // default to week view (most common for Xoogle Calendar)
    currentDate: new Date().toISOString(),
    sidebarOpen: true,
    settings: {
      weekStart: 0,
      defaultDuration: 60,
      defaultView: "week",
      defaultReminder: { type: "popup", minutes: 10 },
      timeFormat: "12h",
      showWeekNumbers: false,
      showDeclinedEvents: false,
    }
  };
}
```

## Seed Data — Events
Generate ~20-25 events spanning the current week and nearby weeks to make the calendar feel populated:

**Today:**
- "Team Standup" 9:00–9:30, Work, location: "Zoom", guests: alice, bob
- "Lunch with Sarah" 12:00–13:00, Personal, location: "Downtown Cafe"
- "Product Review" 14:00–15:00, Work, location: "Conference Room B", guests: charlie, david
- "Gym" 18:00–19:00, Personal

**Tomorrow:**
- "1:1 with Manager" 10:00–10:30, Work, guests: eve
- "Dentist Appointment" 14:00–15:00, Personal, location: "Dr. Smith's Office"
- "Family Dinner" 19:00–21:00, Family, location: "Mom's House"

**This week (other days):**
- "Sprint Planning" (Monday) 10:00–11:30, Work, recurring: weekly
- "Design Review" (Wednesday) 15:00–16:00, Work, guests: alice, frank
- "Happy Hour" (Friday) 17:00–19:00, Personal, location: "The Pub"
- "Soccer Game" (Saturday) 10:00–12:00, Personal, location: "City Park"

**All-day events:**
- "Company Offsite" spanning 2 days next week, Work
- "Mom's Birthday" (specific date), Family, recurring: yearly
- "National Holiday" from Holidays calendar

**Past events (last week):**
- "Project Kickoff" Work
- "Book Club" Personal
- "Team Retrospective" Work

**Recurring:**
- "Team Standup" daily (weekdays)
- "Sprint Planning" weekly
- "Monthly Review" monthly

This gives the dev agent enough variety: timed events, all-day events, multi-day events, events with guests, events with locations, events across different calendars, and recurring events.
