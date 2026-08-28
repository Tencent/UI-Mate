# Xpedia Mock -- TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`
> Screenshots: `assets/screenshots/` (reference images in multiple subdirectories)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest expedia_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `date-fns`. Configure vite.config.js with mock-api plugin for session isolation.
- [x] **App layout**: Full-width page, no sidebar. Top header bar (64px height, white bg, shadow on scroll) with Xpedia logo on left, nav links center ("Stays", "Flights", "Cars", "Packages", "Things to Do", "Cruises" -- only Stays/Flights/Cars functional), right side: "One Key" loyalty badge, "Your trips" link, account avatar circle with initials "SJ". Max content width: 1160px centered. See DESIGN.md section 4 for all spacing values.
- [x] **Routing**: BrowserRouter in App.jsx with these routes:
  - `/` -- Homepage with hero search
  - `/hotels` -- Hotel search results
  - `/hotels/:hotelId` -- Hotel detail page
  - `/flights` -- Flight search results
  - `/cars` -- Car rental search results
  - `/checkout` -- Checkout flow (multi-step)
  - `/confirmation/:bookingId` -- Booking confirmation page
  - `/trips` -- My Trips page (upcoming, completed, cancelled)
  - `/account` -- User account / profile
  - `/go` -- State inspection endpoint (JSON)
- [x] **State management**: React Context (AppContext.jsx) wrapping entire app + `utils/dataManager.js`. The dataManager exports `createInitialData()` that returns the full state tree (see `assets/data_model.md` for the exact structure). State shape: `{ user, hotels, flights, flightResults, cars, activities, bookings, searchFilters, flightSearchFilters, currentView, selectedHotel, selectedFlight, cart }`. Persist to localStorage under key `expedia_mock_state`.
- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route. Reads `initialState` (snapshot at load) and `currentState` from context; computes `state_diff` using deep comparison. Returns JSON object `{ initial_state, current_state, state_diff }` rendered as formatted `<pre>` block.
- [x] **Session isolation**: vite.config.js mock-api plugin handling:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` -- sets both current + initial state, writes `.initial.json`
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` -- updates only current state
  - `POST /post?sid=<sid>` with `{"action":"reset"}` -- resets current to initial
  - `GET /go?sid=<sid>` -- returns `{initial_state, current_state, state_diff}`
  - dataManager.js reads `sid` from URL query param and uses it as localStorage key suffix
- [x] **Seed data**: Implement `createInitialData()` in `utils/dataManager.js` per `assets/data_model.md`. Must include:
  - 1 user (Sarah Johnson, Gold One Key tier, $124.50 One Key Cash)
  - 12-15 NYC hotels with 2-4 rooms each and 3-5 reviews each
  - 15-20 flights (SFO to JFK route, various airlines)
  - 8-10 flight search results (outbound + return pairs)
  - 8-10 car rentals at JFK
  - 8-10 NYC activities
  - 4 bookings (2 upcoming, 1 completed, 1 cancelled)
  - Default search filters pre-filled for NYC, May 15-19
  - 6 trending destination objects for homepage (NYC, Cancun, Maui, Paris, Tokyo, London) with placeholder image URLs (use `https://picsum.photos/seed/<city>/400/250`)
- [x] **Global CSS reset and base styles**: Apply DESIGN.md typography (font stack: `"Xpedia Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`), color variables as CSS custom properties (--color-navy: #1E243A, --color-action-blue: #1668E3, etc.), body background #F5F5F5, smooth scrolling.

---

## P1 -- Primary Features

Core interactive workflows a user/agent interacts with. These are the main training scenarios.

### Homepage

- [x] **Hero section**: Full-width hero area with gradient overlay (navy to transparent) on a travel destination background image (use placeholder). Centered heading: "Where to next?" in white, 40px bold. Below, the search form container (white card, 12px border-radius, shadow level 2, padding 24px).
- [x] **Search tabs**: Horizontal tab bar inside search card. Tabs: Stays (Bed icon), Flights (Plane icon), Cars (Car icon), Packages (Package icon), Things to Do (MapPin icon), Cruises (Ship icon). Active tab: navy text, 3px blue underline. Inactive: gray text, no underline. Only Stays, Flights, Cars tabs are functional -- others show "Coming soon" inline message. Icons from lucide-react. See DESIGN.md section 5 "Search Tab" styles.
- [x] **Stays search form** (default tab): Single row layout with connected input fields:
  - "Going to" -- text input with MapPin icon, destination autocomplete dropdown showing city suggestions (pre-populated list: New York, Los Angeles, San Francisco, Cancun, Maui, Paris, London, Tokyo). Dropdown appears on focus, filters as user types, each item shows city name + country. Selecting sets `searchFilters.destination`.
  - "Check-in" / "Check-out" -- two date inputs side by side. Clicking opens a dual-month calendar picker (custom component). Calendar shows two months, user clicks start date then end date. Selected range highlighted in blue. Min date = today. Updates `searchFilters.checkIn` and `searchFilters.checkOut`.
  - "Travelers" -- button showing "N travelers, M room". Clicking opens a dropdown panel with: Adults (counter +/-), Children (counter +/-), Rooms (counter +/-). Min adults=1, max=6. Min rooms=1, max=3. "Done" button closes the dropdown.
  - "Search" -- blue pill button (DESIGN.md primary button style). Clicking navigates to `/hotels` with search params applied to state.
- [x] **Flights search form** (when Flights tab active): Different layout with trip type, airports, dates, travelers, cabin class.
- [x] **Cars search form** (when Cars tab active): Location, dates, and time pickers.
- [x] **Trending destinations section**: Below hero. Section heading "Trending destinations" (H2, navy, 24px bold). Grid of 6 destination cards in 3-column layout.
- [x] **Deals section**: Below trending. Section heading "Today's top deals". Horizontal scrollable row of hotel deal cards.
- [x] **One Key loyalty banner**: Below deals. Full-width navy background card with gold accent.

### Hotel Search Results Page (`/hotels`)

- [x] **Search modification bar**: Sticky bar at top of results (below header).
- [x] **Results layout**: Two-column layout. Left column (280px): filter sidebar. Right column (flex: 1): sort bar + results list.
- [x] **Filter sidebar** (left column, sticky): Price range, star rating, guest rating, property type, amenities, payment options, neighborhood. Each section collapsible.
- [x] **Sort bar**: "N properties found" count on left. Sort dropdown on right.
- [x] **Hotel result cards** (list view): Horizontal flex row with image, content, price area.
- [x] **"Compare" feature**: Checkboxes to compare 2-3 hotels side-by-side in modal.
- [x] **Save/heart button**: Heart icon toggles hotel to/from `user.savedProperties[]`.

### Hotel Detail Page (`/hotels/:hotelId`)

- [x] **Photo gallery**: 1 large main image + 4 smaller in 2x2 grid. Fullscreen lightbox on click.
- [x] **Hotel header**: Name, stars, address, save button, share button.
- [x] **Rating summary**: Rating badge, label, review count, category bar chart.
- [x] **Overview section**: Description text + highlights.
- [x] **Amenities section**: 3-column grid with icons.
- [x] **Room selection section**: Room cards with pricing, reserve button, availability indicators.
- [x] **Reviews section**: Filter tabs, sort dropdown, review cards.
- [x] **Policies section**: Check-in/out times, cancellation policy.

### Flight Search Results Page (`/flights`)

- [x] **Flight search modification bar**: Sticky bar showing route, dates, travelers.
- [x] **Flight filter sidebar**: Stops, airlines, price range filters.
- [x] **Flight sort bar**: "N flights found" + sort dropdown.
- [x] **Flight result cards**: Outbound + return flight legs, pricing, select button.
- [x] **Cabin class upgrade options**: Select dropdown per flight result.

### Car Rental Search Results Page (`/cars`)

- [x] **Car search modification bar**: Shows pickup location and dates.
- [x] **Car filter sidebar**: Vehicle type, rental company, price range.
- [x] **Car sort bar**: "N cars found" + sort.
- [x] **Car result cards**: Car image, specs, features, price, select button.

### Checkout Flow (`/checkout`)

- [x] **Checkout layout**: Two-column layout with form (left) and booking summary (right).
- [x] **Booking summary card**: Shows booking details, price breakdown, One Key Cash toggle, promo code.
- [x] **Step 1 -- Traveler information**: Form with validation.
- [x] **Step 2 -- Payment information**: Card number, expiry, CVV, billing address.
- [x] **Step 3 -- Review and confirm**: Full summary + "Complete booking" button.
- [x] **Confirmation page** (`/confirmation/:bookingId`): Success state with confirmation number.

### My Trips Page (`/trips`)

- [x] **Trips layout**: Tabbed view with Upcoming, Completed, Cancelled.
- [x] **Trip cards**: Booking type, dates, cost, action buttons.
- [x] **Cancel booking modal**: Confirmation dialog for cancellation.
- [x] **Empty state**: Placeholder when no trips in a tab.

### User Account Page (`/account`)

- [x] **Account layout**: Clean single-column layout, max-width 800px.
- [x] **Profile section**: Editable name, email, phone. Save changes.
- [x] **One Key section**: Tier badge, balance, tier progress bar.
- [x] **Saved travelers section**: List of travelers, add/edit/remove.
- [x] **Saved properties section**: Grid of saved hotels.
- [x] **Recent searches section**: List with search again + clear options.

---

## P2 -- Secondary Features

Depth and polish features. Implement after P1 is solid.

### Search Enhancements

- [ ] **Destination autocomplete with recent searches**: Show recent searches above popular destinations.
- [ ] **Flexible dates option**: "+/- N days" visual toggle below date pickers.
- [ ] **Map view toggle**: Map / List view with static placeholder map.

### Hotel Detail Enhancements

- [ ] **"Rooms at this property" sticky anchor nav**: Sticky secondary nav with section anchors.
- [ ] **Photo gallery categories**: Filter tabs in lightbox.
- [ ] **Review helpfulness voting**: Thumbs up/down on reviews.
- [ ] **Price comparison calendar**: Multi-month price calendar in room selection.

### Flight Enhancements

- [ ] **Flight details expandable panel**: Show detailed flight info on expand.
- [ ] **Price graph**: 7-day price graph above flight results.

### Checkout Enhancements

- [ ] **Step progress indicator**: Visual step tracker at top of checkout.
- [ ] **Price match guarantee banner**: Trust badge below booking summary.
- [ ] **Add extras upsell**: Airport transfer, travel insurance, early check-in.

### General Polish

- [ ] **Loading skeleton states**: Shimmer placeholders while loading.
- [ ] **Toast notification system**: Global toast component.
- [ ] **Responsive header behavior**: Transparent header on homepage hero.
- [ ] **Back to top button**: Floating button after scroll 500px.
- [ ] **Recently viewed properties**: Track and display on homepage.
- [ ] **Keyboard shortcuts**: Escape/Enter/Tab handling.
- [ ] **Breadcrumb navigation**: On hotel detail and checkout pages.

---

## Data Seed (implement in createInitialData())

- [x] **User**: Sarah Johnson, Gold tier, $124.50 One Key Cash, 2 saved properties, 3 recent searches, 2 traveler profiles
- [x] **Hotels**: 12 NYC hotels spanning 3-5 star range with rooms and reviews
- [x] **Flights**: 13 flights on SFO-JFK and JFK-SFO routes
- [x] **Flight Results**: 8 paired outbound+return combinations
- [x] **Cars**: 8 at JFK across 5 companies
- [x] **Activities**: 8 NYC activities
- [x] **Bookings**: 4 records (2 upcoming, 1 completed, 1 cancelled)
- [x] **Trending destinations**: 6 objects (NYC, Cancun, Maui, Paris, Tokyo, London)

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login / logout (app starts pre-logged-in as Sarah Johnson)
- Real payment processing or card validation beyond format checks
- Actual map integration (use static placeholders)
- Real API calls or network requests
- Email confirmations or notifications
- Multi-language support
- Mobile-first responsive (desktop layout only, 1024px+ viewport)
- Cruise or "Things to Do" search flows (tabs exist but show "Coming soon")
- Multi-city flight search
- Vacation package bundling logic
