# Xoogle Flights Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-08
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing scaffold: Vite+React+Tailwind already set up with basic routing, data.js, store.js, pages (Home, Results, Booking, Go)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

> The existing scaffold has basic structure but uses a sidebar filter layout and random flight generation. The real Xoogle Flights uses a horizontal filter bar with dropdown popovers, Google-branded styling, and structured route-based data. This TODO rewrites/refactors the existing code to match the real UI.

- [x] **Visual design system**: Refactor Tailwind config + index.css to match Xoogle Flights exactly. Primary blue `#1a73e8`, bg `#ffffff`/`#f1f3f4`, text `#202124`/`#5f6368`/`#70757a`, green prices `#137333`, border `#dadce0`, selected bg `#e8f0fe`, hover `#f1f3f4`. Font: `"Google Sans", Roboto, Arial, sans-serif`. Import Google Sans from fonts.googleapis.com. Remove any existing hero images or stock photo dependencies. The overall feel is clean, white, minimal — Material Design 3 aesthetic.

- [x] **Data model refactor** (`src/lib/data.js`): Rewrite `data.js` per `assets/data_model.md`. Key changes: (1) Add ~15 more airports with lat/lng (US + Europe + Asia), (2) Add missing US airlines (UA, AA, WN, B6, AS), (3) Replace `picsum.photos` logos with inline SVG generation — each airline gets a colored circle with 2-letter code, (4) Generate flights per-route (10-15 popular route pairs × 10-15 flights each) instead of random origin/dest, (5) Add `emissions`, `emissionsPercent`, `fareClasses`, `baggage`, `layovers` fields to each flight, (6) Add `popularDestinations` array (8 items with real city names + prices), (7) Add `priceCalendar` generation function (60 days of prices for a given route), (8) Restructure `createInitialData()` to include `search`, `filters`, `selectedOutboundFlight`, `selectedReturnFlight`, `bookings`, `priceAlerts`, `activeTab`, `dateViewMode`, `popularDestinations`, `priceCalendar` per data_model.md. Keep session isolation logic (storageKey, initializeData, etc.) intact.

- [x] **State management refactor** (`src/lib/store.js`): Convert from simple `useAppStore` hook to React Context pattern (`src/context/AppContext.jsx`) for proper state sharing across components. Provide: `state`, `dispatch` (or setter functions for each action), and derive `initialState` for /go endpoint. Actions needed: `setSearch(fields)`, `setFilters(fields)`, `selectOutboundFlight(id)`, `selectReturnFlight(id)`, `addBooking(booking)`, `addPriceAlert(alert)`, `removePriceAlert(id)`, `togglePriceTracking(route)`, `setActiveTab(tab)`, `setDateViewMode(mode)`, `resetState()`. Persist to localStorage on every state change. Load from localStorage or customState on init (keep existing session isolation pattern from data.js).

- [x] **Navbar refactor** (`src/components/Navbar.jsx`): Replace existing navbar. Match Google Travel header exactly: Left side: hamburger menu icon (☰) + "Google" text logo (multicolor: blue-red-yellow-blue-green-red). Center/right: horizontal tabs — "Travel" | "Explore" | "Flights" (active, with blue underline + blue text) | "Hotels" | "Vacation rentals". Each tab has a small icon to its left (matching Google's travel nav icons). Far right: dark/light mode toggle (moon icon), apps grid icon (3×3 dots), user avatar circle (colored circle with "D" initial). Tabs are navigation links but only "Flights" works (others show a toast "Not available in mock"). Active tab has 3px blue bottom border. Navbar is white bg, 64px tall, sticky top, with subtle bottom border `#dadce0`.

- [x] **App layout + routing** (`src/App.jsx`): Wrap app in `AppProvider` (the new context). Routes: `/` (Home), `/results` (Results), `/booking` (Booking), `/explore` (Explore map — P2, placeholder for now), `/go` (state inspector). Add `RedirectWithQuery` for preserving `?sid=` params.

- [x] **`/go` endpoint** (`src/pages/Go.jsx`): Ensure Go.jsx reads from AppContext, computes `state_diff` between `initialState` and `currentState`, returns JSON `{initial_state, current_state, state_diff}`. Must work with session isolation (`?sid=` param).

- [x] **Session isolation**: Verify vite.config.js mock-api plugin works correctly for `POST /post?sid=`, `GET /state?sid=`, `GET /go?sid=`. Existing vite.config.js already has this — just verify it's compatible with the new data model. Ensure `initializeData()` is called before reading localStorage (check for the critical bug: read localStorage BEFORE calling initializeData).

---

## P1 — Primary Features

### Home Page

- [x] **Home page redesign** (`src/pages/Home.jsx`): Remove the hero image/overlay. Replace with clean Xoogle Flights home: (1) White background, (2) Large centered heading "Flights" with small airplane icon, in `#202124`, `36px`, Google Sans, (3) Below heading: the flight search form card (see next item), (4) Below search form: "Popular destinations from San Francisco" section with destination cards.

- [x] **Flight search form** (`src/components/FlightSearchForm.jsx`): Complete rewrite to match Xoogle Flights. The form is a white card with subtle shadow and rounded corners (12px border-radius), centered, max-width ~920px. **Row 1** (left-aligned, inside the card): [Trip type dropdown: "Round trip ▼" / "One way" / "Multi-city"] [Passengers dropdown: "1 passenger ▼" — opens popover with Adults/Children/Infants-in-seat/Infants-on-lap counters with +/- buttons, Done button] [Cabin class dropdown: "Economy ▼" / "Premium economy" / "Business" / "First"]. **Row 2**: [Origin input with ○ pin icon, autocomplete dropdown] [Swap button ⇄ circular, between origin/dest] [Destination input with ○ pin icon, autocomplete dropdown] [Departure date field with 📅 icon + ◀▶ arrows to shift date ±1 day] [Return date field, same style — hidden if one-way]. **Row 3**: [Search button — blue pill `#1a73e8`, white text "Search", right-aligned or centered]. All inputs have Google's Material style: gray outlined, rounded, 48px height, 14px text. Autocomplete dropdown shows airport matches with city name, airport code, and full name.

- [x] **Passenger selector popover**: Opens below the "1 passenger" button. Shows: Adults (age 12+) with count and +/- buttons, Children (age 2-11) with +/- buttons, Infants (in seat) with +/- buttons, Infants (on lap) with +/- buttons. Min adults = 1, max total = 9. "Done" and "Cancel" buttons at bottom. Updates the button text: "1 adult", "2 passengers", etc.

- [x] **Date picker with prices**: When user clicks departure or return date field, open a modal/overlay showing: **Tabs**: "Dates" (calendar view, default) | "Price graph". **Calendar view**: Two months side-by-side (current + next month), ◀▶ arrows to navigate months. Each date cell: day number on top, price below in small text (e.g., "$147"). Cheapest dates: green text + light green background `#e6f4ea`. Selected date: blue circle `#1a73e8`. Date range (departure→return): blue highlight bar between the two selected dates. Bottom bar: "Showing prices in USD for" [trip length selector: "◀ 4 day trips ▶" with +/- arrows] | "from $129 round trip price" | blue "Done" button. Generate price calendar data from `data.js` for the selected route.

- [x] **Popular destinations** (`src/components/PopularDestinations.jsx`): Grid of 6-8 cards below the search form. Each card: destination photo (use picsum with deterministic seed per city), city + country name, "From $XXX" price, "Nonstop · Xh Ym" or "1 stop · Xh Ym" text. Clicking a card fills in the destination in the search form and navigates to /results. Cards have rounded corners, subtle shadow, hover: slight scale-up + shadow increase.

### Results Page

- [x] **Results page layout refactor** (`src/pages/Results.jsx`): Major refactor from sidebar-filter layout to Xoogle Flights' horizontal layout. Structure: (1) Sticky condensed search bar at top (same fields as home search form but more compact, single row), (2) **Horizontal filter bar** below search: row of pill-shaped filter buttons [All filters] [Stops ▼] [Airlines ▼] [Bags ▼] [Price ▼] [Times ▼] [Connecting airports ▼] [Duration ▼] [Emissions ▼]. Each is a rounded chip/pill (`border-radius: 20px`, border `#dadce0`, bg white, 36px tall). Active filters show blue text + blue border. Clicking opens a **dropdown popover** below the pill (NOT a sidebar). (3) Date tools row: "Track prices" toggle (blue switch), date display, "Date grid" + "Price graph" link buttons. (4) Results area: full-width, max ~800px centered.

- [x] **Filter dropdown popovers**: Each filter pill, when clicked, opens a popover dropdown directly below it. **Stops**: radio buttons — "Any number of stops", "Nonstop only", "1 stop or fewer", "2 stops or fewer". **Airlines**: scrollable checkbox list of airlines with names, "Select all" / "Clear" links. Search input if >7 airlines. **Bags**: checkboxes — "Carry-on bag", "1 checked bag". **Price**: range slider with min/max labels. **Times**: Two sections — "Departure" and "Arrival" — each with a time range slider (drag handles for start/end time, 12am-12am, with time labels updating). **Duration**: single slider for max duration. **Connecting airports**: checkbox list of airports. **Emissions**: radio — "Any emissions" / "Less emissions only". Each popover has rounded corners, shadow, white bg, and a small triangle/arrow pointing to the parent pill.

- [x] **Best/Cheapest sort tabs**: Above the results list, show tabs: "Best departing flights" (default active) with "Learn more" link | "Cheapest". Active tab has blue text + blue underline. "Best" sorts by a composite score (price + duration weighted). "Cheapest" sorts strictly by price. These are NOT dropdown selects — they are horizontal tabs. Remove the existing `<select>` sort dropdown.

- [x] **Flight result card refactor** (`src/components/FlightCard.jsx`): Refactor to match Xoogle Flights' result row exactly. Single row, left to right: (1) Departure–Arrival times "8:30 AM – 11:45 AM" in 16px/500 weight, airline name below in 12px gray (or "+1" next-day indicator if arrives next day), (2) Duration "5h 15m" with route dots-line visualization below (gray line with filled circles at endpoints, hollow circles for stops), "Nonstop" or "1 stop" + stop airport code in gray below, (3) Emissions "XXX kg CO2" with colored badge: green if <median, light gray if ≈median, (4) Price "$287" in 16px bold `#137333` (green), "round trip" in 12px gray below, (5) Expand chevron ∨. The whole row is clickable to expand. Hover: light gray bg `#f1f3f4`. NO shadow on individual cards — use subtle bottom border only.

- [x] **Flight detail expansion**: When a flight card is expanded (chevron clicked), show a detail panel below it (within the same card area, pushing content down). Shows: **Timeline view** with vertical line connecting segments. Each segment shows: departure time + airport code + city name, then flight info line (airline logo + name · flight number · aircraft type), then arrival time + airport code + city name. Between segments: layover callout box (light orange bg `#fef7e0`, "Xh Ym layover in City (CODE)"). At bottom: amenities row (Wi-Fi icon, power icon, streaming icon, legroom text). **Fare options**: Side-by-side cards for each available fare class (Basic economy, Economy, Premium economy, Business) showing price and key inclusions (personal item, carry-on, checked bag, seat selection, changes). "Select" button for each fare. "Book on [Airline website]" blue button.

- [x] **"Other departing flights" section**: After the "Best departing flights" cards (top 3-5 results), show a horizontal divider, then "Other departing flights" header, then remaining results. This mimics Google's grouping.

- [x] **Return flight selection flow**: After user selects an outbound flight (clicks "Select" on a fare card), show a blue banner: "✓ Outbound flight selected" with summary (times, price), then below it "Next, choose a return flight" heading in blue. Display return flights for the same route (reversed). When return is selected, navigate to /booking. Store `selectedOutboundFlight` and `selectedReturnFlight` in state.

- [x] **Track prices toggle**: In the date tools bar, show a toggle switch labeled "Track prices". When toggled on (blue), add a price alert to state for the current route/dates. Show a brief toast: "Tracking prices for SFO → JFK". Toggle state persists and is visible in /go.

### Booking Page

- [x] **Booking page** (`src/pages/Booking.jsx`): Show selected itinerary summary. Top: "Your trip" heading. Outbound flight card (collapsed, showing airline, times, route, duration, stops, price). Return flight card (same). Below: total price summary. "Booking options" section: list of 2-3 booking links — "Book on Delta.com — $287", "Book on Expedia — $295", "Book on Kayak — $291". Each is a white card with airline/OTA name, price, and a blue "Book" button (clicking shows toast: "In a real app, this would redirect to [site]"). Below booking options: "Price breakdown" expandable section showing base fare, taxes, total. At bottom: "Back to search results" link and "Save trip" button (adds to bookings in state).

---

## P2 — Secondary Features

- [~] **Date grid modal**: When "Date grid" is clicked in the date tools bar, open a modal showing a matrix: rows = departure dates (7 days centered on selected departure), columns = return dates (7 days centered on selected return). Each cell shows roundtrip price. Cheapest cell highlighted green. Selected cell highlighted blue. Clicking a cell updates departure + return dates and closes modal. Header shows "Departure ◀ ▶" and "Return" labels. Bottom: "Cancel" and "OK" buttons.

- [~] **Price graph modal**: When "Price graph" is clicked, open a modal with: **Tabs**: "Dates" | "Price graph" (active). Bar chart showing daily prices for ~60 days. X-axis: dates. Y-axis: price in USD. Bars are light blue `#a8c7fa`. Hovering a bar shows tooltip: "Sat, Apr 15 - Wed, Apr 19 / From $129". Top-left: trip duration selector "4-day trip [- +]". Selected date range: darker blue highlighted bars. Below chart: price trend text "Prices are currently [low/typical/high] for your search" with colored indicator.

- [~] **Explore page** (`src/pages/Explore.jsx`): Simple map-like view. Show a world map (use a static SVG world map or a simple CSS-based representation). Overlay destination pins with prices. Left sidebar: origin selector, date range picker, "One-way / Round trip" toggle. Clicking a pin shows a card with destination details + "View flights" button. This is a simplified version — no real map API needed.

- [x] **Multi-city search**: When "Multi-city" is selected in trip type dropdown, the search form transforms: show 2+ rows, each with [Origin] [Destination] [Date]. "Add flight" link below to add more legs (up to 5). "Remove" (×) button on each leg except the first. Each leg is independent. On search, navigate to results showing multi-city itineraries.

- [x] **Swap origin/destination button**: Circular button with ⇄ icon between origin and destination inputs. Clicking swaps the two values with a brief CSS rotation animation (180° on the icon).

- [~] **Flexible dates selector**: Next to the date fields or in the date picker, offer a toggle: "Exact dates" (default) | "+/- 1 day" | "+/- 2 days" | "+/- 3 days" | "Flexible dates". Flexible dates widens the search to include nearby dates and shows cheapest option.

- [x] **CO2 emissions column**: Each flight card shows emissions: "XXX kg CO2" with a small badge/label. Green badge = "XX% less than median" (below median emissions for that route). Gray = "Avg emissions". The emissions data is generated per-flight in data.js.

- [x] **Price insights banner**: At top of results (below date tools), show a collapsible banner: "Prices are currently [low/typical/high] for your search" with a small colored dot (green/yellow/red). Expandable to show a mini price trend chart. Based on comparing current search price against priceCalendar average.

- [x] **Saved/tracked flights page**: Accessible from navbar or a "Tracked flights" link. Lists all active price alerts with: route, dates, current price, price when tracking started, % change. "Remove" button per alert. This could be a simple list view at `/tracked`.

- [~] **Airport autocomplete with nearby airports**: When typing a city name (e.g., "New York"), show grouped results: "New York (all airports)" as first option, then individual airports (JFK, LGA, EWR) indented below. Selecting "all airports" searches all airports in that city.

- [x] **Keyboard shortcuts**: Enter to search, Escape to close modals/popovers, Tab navigation through form fields, arrow keys in date picker.

---

## Data Seed (implement in createInitialData())

- [x] **Airports**: 25 records covering US (JFK, LAX, SFO, ORD, DFW, MIA, ATL, SEA, BOS, DEN), Europe (LHR, CDG, FRA, AMS, FCO, MAD, BCN), Asia/ME (NRT, HND, ICN, SIN, HKG, DXB, BKK), Oceania (SYD). Each with code, name, city, country, lat, lng.

- [x] **Airlines**: 10 records — DL (Delta), UA (United), AA (American), WN (Southwest), B6 (JetBlue), AS (Alaska), BA (British Airways), LH (Lufthansa), EK (Emirates), AF (Air France). Each with id, name, logoColor (brand hex color for SVG circles).

- [x] **Flights**: ~150-200 flights. Generate deterministically (seeded random) for 12 popular routes: SFO↔JFK, SFO↔LAX, LAX↔LHR, JFK↔CDG, JFK↔LHR, SFO↔NRT, ORD↔DFW, MIA↔JFK, SEA↔LAX, SFO↔DXB, LAX↔SYD, JFK↔BCN. Per route: ~12 flights across next 30 days, mix of nonstop/1-stop/2-stop, multiple airlines, price range $80-$1800, realistic durations (domestic 2-6h, transatlantic 7-11h, transpacific 11-16h).

- [x] **Popular destinations**: 8 records from SFO default origin — Paris (CDG, $450), Tokyo (NRT, $620), London (LHR, $380), Cancun (CUN — add this airport, $280), New York (JFK, $180), Honolulu (HNL — add, $320), Barcelona (BCN, $520), Bali (DPS — add, $780). Each with city, country, airport, priceFrom, flightDuration, stops.

- [x] **Price calendar**: Generate 60 days of prices for default route (SFO→JFK). Base price ~$180, add variance: weekends +$20-40, Tue/Wed cheapest (-$20-30), holidays +$80-120. Mark bottom 10% of prices as `isCheapest: true` for green highlighting.

---

## Out of Scope
- Authentication / login (app starts pre-logged-in as "Demo User")
- Real booking / payment processing (buttons show toasts)
- Real Google Maps API for explore page
- Real airline API data
- Email notifications for price alerts
- File uploads
- Mobile-responsive design (optimize for desktop 1280px+ viewport)
