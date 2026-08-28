# Xoogle Calendar Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-08
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing codebase: Partially implemented — has basic views, event CRUD, drag-and-drop, session isolation

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done (existing code covers this)

---

## P0 — Core Shell (Already Exists — Needs Fixes)

The app scaffold, routing, state management, session isolation, and `/go` endpoint already exist. These items focus on fixing and aligning what's there with the real Xoogle Calendar design.

- [x] Project scaffold: Vite + React + Tailwind already set up
- [x] Routing: `/` (calendar) and `/go` (state inspector) via manual path-based router in App.jsx
- [x] State management: StoreContext with useReducer + dataManager.js with session isolation
- [x] Session isolation: vite.config.js mock-api plugin with POST/GET endpoints, sid support
- [x] `/go` endpoint: GoEndpoint.jsx component + server-side /go handler in vite.config.js
- [x] **Migrate event colors from Tailwind classes to hex values**: Migrated ALL color references to hex strings. Updated: `helpers.js` EVENT_COLORS palette, DEFAULT_CALENDARS, `generateMockEvents()`, `EventModal.jsx` color picker with 11 Xoogle Calendar colors, all views use `style={{ backgroundColor: color }}` inline.
- [x] **Visual design system alignment**: Google Fonts imported, header 64px with `#DADCE0` border, sidebar 256px, dynamic date logo showing today's actual day number in blue rounded square, "Calendar" text in `#5F6368`.
- [x] **Improve seed data**: 23 events across Personal/Work/Family/Holidays/Birthdays calendars spanning last week, current week, next week. Mix of timed/all-day/multi-day/recurring events with guests, locations, meetLinks.
- [x] **Default view should be "week"**: Both `defaultState.view` and `createDefaultData()` now default to `'week'`.
- [x] **Add react-router-dom**: Installed and implemented `BrowserRouter` with `Routes`/`Route` for `/` and `/go`. `RedirectWithQuery` component preserves `?sid=` params.

---

## P1 — Primary Features (Core Interactive Workflows)

### P1.1 — Header Bar Improvements
- [x] **Xoogle Calendar branding**: Dynamic date logo showing today's actual date in blue square, "Calendar" in `#5F6368` text.
- [x] **View switcher as segmented pill/dropdown**: View dropdown with keyboard shortcuts D/W/M/A shown in menu. Keyboard shortcuts `d`, `w`, `m`, `a`, `t`, `c`, `Escape` all implemented.
- [x] **Search bar**: Collapsed search icon, expands to full search bar. Typing filters events by title/description/location. Results appear in dropdown below, clicking navigates to event date and opens modal.

### P1.2 — Sidebar Improvements
- [x] **Create button styling**: Pill shape with shadow, colorful SVG plus icon, hover shadow elevation, matches Xoogle Calendar design.
- [x] **Mini calendar prev/next month**: ChevronLeft/ChevronRight arrows navigate mini calendar independently from main view. Clicking dates updates main view's currentDate.
- [x] **"My calendars" section**: Colored checkbox squares with checkmark when visible, hover shows 3-dot context menu with "Display this only" and "Hide from list" options.
- [x] **"Other calendars" section**: "Holidays in United States" and "Birthdays" section with same checkbox behavior, "+" button to subscribe.

### P1.3 — Month View Improvements
- [x] **Current time indicator**: Today's date number inside blue filled circle. Other month dates muted `#70757A`.
- [x] **Event chip styling**: 20px height, 2px border-radius chips. Timed events: left colored border + time prefix. All-day events: full colored background.
- [x] **"X more" popover**: "+N more" link opens scrollable popover listing all events for that day.
- [x] **Click empty space to create**: Clicking empty day cell area opens quick-create popover with title input + date + Save/More Options.

### P1.4 — Week View Improvements
- [x] **All-day event section**: Dedicated all-day section above time grid showing colored bars for all-day events.
- [x] **Current time red line**: Red line with circle dot on left at current time position, updates every minute, only in today's column.
- [ ] **Click-and-drag to create event**: Drag vertically on empty slot to create event spanning dragged duration.
- [x] **Overlapping events**: Side-by-side layout using `computeEventLayout()` algorithm assigning columns to overlapping events.
- [x] **Event block styling**: Title bold 11px, time range 11px below, location if tall enough. Colored background ~90% opacity, 4px radius, darker left border.
- [x] **30-minute snap grid**: Dashed lines at 30-min marks, solid at hour marks.

### P1.5 — Day View
- [x] **Day View uses WeekView with 1 column**: Works correctly with all features (all-day section, current time red line, overlapping events, date header).

### P1.6 — Event Popover Improvements
- [x] **Match Xoogle Calendar popover design**: 8px colored strip at top, edit/delete/close icons, large title with color square, date/time, location, meet link, guests count, calendar name, description block.
- [x] **Guest count in popover**: Shows "N guests" when event has guests.

### P1.7 — Event Modal Improvements
- [x] **Event color picker**: 11 Xoogle Calendar color swatches with name display. Selected color shows blue border. Color updates event header and form accents.
- [x] **Google Meet mock link**: "Add Google Meet link" field with Video icon, persists as `meetLink`.
- [x] **All-day toggle**: Smooth toggle switch hides/shows time inputs.
- [x] **Guest autocomplete**: Typing in guest field shows suggestions from MOCK_USERS. Enter/comma adds guest. Tags shown as removable chips.

### P1.8 — Drag-and-Drop
- [x] Drag-and-drop in month view — move events between days
- [x] Drag-and-drop in week view — move events to different times/days
- [ ] **Visual drag feedback**: Ghost preview and dotted placeholder.

### P1.9 — Recurring Events
- [x] Recurring event creation in modal (daily/weekly/monthly/yearly)
- [x] Recurring event expansion in month view
- [x] **Recurring events in week/day view**: `expandRecurringEvents()` function also in WeekView for correct display.
- [ ] **Edit/delete recurring event confirmation**: Dialog for "This event / This and following / All events".

---

## P2 — Secondary Features (Depth & Realism)

### P2.1 — Additional Views
- [ ] **Year View**: A page showing 12 mini month grids in a 4×3 layout. Each mini month shows day numbers in a grid. Days with events should have a small dot below the number. Clicking a day navigates to that date in Day view. The current month should be highlighted. Navigation arrows change the year.
- [ ] **Schedule/Agenda View improvements**: The existing AgendaView works but could be more polished. Add: empty state message "No upcoming events" when there are none in the next 30 days. Show events for the next 30 days (not all events). Add a "No more events within the next month" footer message.
- [ ] **"4 Days" custom view**: Add a 4-day view option in the view switcher. Same as week view but shows only 4 consecutive days starting from currentDate. Useful for narrower screens.

### P2.2 — Settings Panel
- [ ] **Settings page/modal**: Accessible via the gear icon in the header. A full-page or large modal with sections:
  - **General**: Week starts on (Sunday/Monday/Saturday dropdown), Default view (Day/Week/Month/Year), Time format (12h/24h), Show week numbers (checkbox)
  - **Event settings**: Default duration (15/30/45/60/90/120 min dropdown), Default reminder (type + time)
  - **Calendar settings**: List of calendars with name, color picker, and default reminder per calendar
  - Changes should immediately update the `settings` object in state and persist via localStorage.

### P2.3 — Keyboard Shortcuts
- [ ] **Implement keyboard shortcuts**: Register a global keydown handler (disabled when any input/textarea is focused):
  - `c` → Open create event modal
  - `q` → Open quick-add (natural language)
  - `d` → Switch to Day view
  - `w` → Switch to Week view
  - `m` → Switch to Month view
  - `y` → Switch to Year view
  - `a` → Switch to Schedule/Agenda view
  - `t` → Navigate to Today
  - `j` or `n` → Next period
  - `k` or `p` → Previous period
  - `Delete`/`Backspace` → Delete selected event (if popover is open)
  - `/` → Focus search input
  - `Escape` → Close any open modal/popover
  - `?` → Show keyboard shortcuts help dialog

### P2.4 — UI Polish
- [ ] **Current time red line in all time-based views**: Ensure the red line with dot appears in both Week and Day views and updates in real-time.
- [ ] **Smooth transitions**: Add CSS transitions for: sidebar open/close (already has `transition-all`), view switching (fade), modal open/close (scale + fade), popover appearance (fade + slight scale).
- [ ] **Responsive sidebar toggle animation**: When sidebar collapses, the main content area should smoothly expand to fill the space. The hamburger menu icon should remain accessible in the header.
- [ ] **Empty state for no events**: In schedule view, when there are no events, show an illustration or message. In day/week view, show a subtle "Click to create an event" tooltip on hover over empty time slots.
- [ ] **Toast notifications**: When creating, editing, or deleting an event, show a brief toast notification at the bottom of the screen: "Event created", "Event updated", "Event deleted" with an "Undo" link (undo reverts the last action). Auto-dismiss after 5 seconds.

### P2.5 — Advanced Event Features
- [ ] **Event invitation status**: For events with guests, show RSVP status: "Yes", "No", "Maybe". In the event popover/modal, show each guest's response. The current user's response can be toggled. This adds realistic depth for agent training.
- [ ] **Multi-day timed events**: Support events that span multiple days but are not all-day (e.g., a 2-day conference 9am-5pm). These should render across multiple day columns in week view.

---

## Data Seed (implement in createInitialData())
- [x] **Calendars**: 5 calendars — Personal (#039BE5), Work (#33B679), Family (#8E24AA), Holidays (#F4511E), Birthdays (#E67C73)
- [x] **Events**: 23 events as described in `data_model.md §Seed Data`, using deterministic dates relative to today. Includes: daily standup (recurring), all-day holiday, multi-day offsite, birthday (yearly recurring), variety of single events across different calendars with guests and locations.
- [x] **Mock users**: 7 mock users (alice, bob, charlie, david, eve, frank, grace) for guest picker

---

## Out of Scope
- Authentication / login (app starts pre-logged-in as `Demo User` / `demo@example.com`)
- Real Google Meet video conferencing
- Real email/notification delivery
- Calendar sharing with real permissions
- Import/export ICS files
- Timezone conversion
- Mobile/responsive layout (desktop-only)
- Real Google account integration
- Server-side persistence (beyond localStorage + session files)
