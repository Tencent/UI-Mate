# Xripadvisor Mock -- TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-04-11
> Research: `assets/README.md` | Data model: `assets/data_model.md` | Design: `DESIGN.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Core Shell

Without these, the app cannot render. Dev implements these first.

- [ ] Project scaffold: `npm create vite@latest tripadvisor_mock -- --template react` inside the app directory, install deps: `react-router-dom`, `lucide-react`. Do NOT use Tailwind -- use plain CSS with a single `index.css` file for global styles + component-level CSS files.
- [ ] App layout (`App.jsx`): Full-width page, max-content 1200px centered. Structure: `<Header />` (64px height) -> `<CategoryNav />` (48px, sticky below header on scroll) -> `<main>` (flex: 1) -> `<Footer />`. White background (#FFFFFF), font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif.
- [ ] Header component (`components/Header.jsx`): Left: Xripadvisor logo (green circle #34E0A1 with owl SVG icon + "Xripadvisor" text in black, 20px bold). Center-right: search input (expandable, 280px default, magnifying glass icon, gray border, 8px radius, placeholder "Where to?"). Far right: heart icon (link to /trips), user avatar circle with dropdown (Review, Trips, Profile links). Height 64px, white bg, bottom border 1px #E0E0E0.
- [ ] Category navigation (`components/CategoryNav.jsx`): Horizontal tab bar: "Hotels" | "Things to Do" | "Restaurants" | "Flights" | "Vacation Rentals". Each tab is a NavLink. Active tab: bold black text + 3px solid black bottom border. Inactive: #545454 text, no border. Hover: black text. Tabs centered in 1200px container. 48px height, white bg. On scroll, becomes sticky with box-shadow `0 2px 4px rgba(0,0,0,0.08)`. "Flights" and "Vacation Rentals" tabs render a placeholder page with "Coming soon" text.
- [ ] Routing (`App.jsx` with BrowserRouter): Routes: `/` (Home), `/hotels` (HotelSearch), `/hotel/:id` (HotelDetail), `/restaurants` (RestaurantSearch), `/restaurant/:id` (RestaurantDetail), `/attractions` (AttractionSearch), `/attraction/:id` (AttractionDetail), `/reviews/write/:entityType/:entityId` (WriteReview), `/trips` (Trips), `/forums` (Forums), `/forum/:destinationId` (ForumDetail), `/profile` (Profile), `/go` (StateInspector).
- [ ] State management: `context/AppContext.jsx` wrapping the app + `utils/dataManager.js` with `createInitialData()` (see `data_model.md`). Context provides: `state`, `dispatch` (useReducer). Reducer actions: `SET_STATE`, `ADD_REVIEW`, `TOGGLE_SAVE`, `CREATE_TRIP`, `UPDATE_FILTERS`, `SET_SEARCH_QUERY`, `SET_ACTIVE_CATEGORY`, `SET_SORT`, `ADD_FORUM_REPLY`, `VOTE_HELPFUL`, `DELETE_REVIEW`, `UPDATE_TRIP`. Persist to localStorage under key `tripadvisor_mock_state`. Load from localStorage on mount, fall back to `createInitialData()`.
- [ ] `/go` endpoint: `pages/Go.jsx` + route. Returns JSON with `{ initial_state, current_state, state_diff }`. Deep diff comparing initial vs current state. Display as formatted JSON in a `<pre>` tag.
- [ ] Session isolation: `vite.config.js` mock-api plugin handling `POST /post?sid=<sid>` (set state) and `GET /state?sid=<sid>` (get state). dataManager must support session-based state: `getSessionState(sid)`, `setSessionState(sid, state)`. On `POST /post` with `action: "set"`, write both `.initial.json` and current state. On `action: "reset"`, restore from initial. On `GET /go?sid=<sid>`, return initial + current + diff.

---

## P1 -- Primary Features

Core features a user interacts with in the first 5 minutes.

### Homepage (`/`)
- [ ] Hero section: Large hero area (400px height) with CSS gradient background simulating a travel photo (gradient from #1A1A1A to #00AA6C at 45deg, or use a public-domain travel image). Centered white text: "Where to?" heading (32px bold). Below: category tab pills (Hotels, Things to Do, Restaurants) as horizontally centered pill buttons. Below pills: full-width search bar (max 600px, 56px height, white bg, 28px border-radius, shadow `0 2px 8px rgba(0,0,0,0.12)`, magnifying glass icon left, "Places to go, things to do, hotels..." placeholder, on submit navigates to appropriate search page based on active category).
- [ ] "Travelers' Choice Best of the Best" section: Section heading "Travelers' Choice Best of the Best" (24px bold) + subtitle text. Horizontal scrollable row of 4-6 destination cards. Each card: 280x200 image placeholder (colored gradient), destination name overlay at bottom in white bold text, heart/save icon top-right. Clicking a card navigates to `/hotels?destination=<id>`.
- [ ] "Top destinations for your next vacation" section: 2-row grid of 4 columns. Each cell: rounded image placeholder (180x180), destination name below (16px bold), "Hotels" | "Things to Do" | "Restaurants" quick links below name in green (#00AA6C). Clicking navigates to filtered search.
- [ ] "Recently viewed" section (conditional): Only shown if `state.searchHistory.recentSearches` has items. Horizontal row of small cards showing recently viewed listings.

### Hotel Search (`/hotels`)
- [ ] URL params: `?destination=<id>&checkin=<date>&checkout=<date>`. Parse and use to filter hotels from state.
- [ ] Filter sidebar (280px, left side): Sticky, scrollable. Sections: **Popular filters** (checkboxes: Free WiFi, Pool, Free Breakfast, Parking, Pet Friendly), **Price per night** (range slider or min/max inputs, $0-$600, updates results live), **Hotel class** (1-5 star checkboxes with star icons), **Rating** (checkboxes: Excellent 4.5+, Very Good 4.0+, Average 3.0+), **Property type** (Hotel, Resort, Inn, B&B, Hostel checkboxes). Each filter change dispatches `UPDATE_FILTERS` and re-filters displayed results.
- [ ] Sort bar (above results, right of sidebar): "Sort by:" dropdown or pill buttons: "Best Value" (default), "Traveler Ranked", "Price (low to high)", "Price (high to low)". Active sort: black bg, white text pill. Dispatches `SET_SORT`.
- [ ] Results count: "N properties in [Destination]" text above results.
- [ ] Hotel result cards (vertical list): Each card is a horizontal layout (full-width, white bg, 1px #E0E0E0 border, 12px radius, 16px padding, 12px margin-bottom). Left: image placeholder (200x150, 8px radius). Right: hotel name (16px bold, black, link to `/hotel/:id`), rating bubbles component (5 small circles) + review count text ("2,341 reviews" in #545454), location text in gray, amenity tags (first 3, as small gray pills), price area on far-right: "from $289" (18px bold) + "per night" small text + "View Deal" black pill button. Heart/save icon in top-right corner of card.
- [ ] Pagination: Bottom of results. "1 2 3 ... N" page buttons + "Next" button. 10 results per page.
- [ ] Empty state: If no results match filters, show "No hotels match your filters. Try adjusting your search criteria." with a reset filters link.

### Hotel Detail (`/hotel/:id`)
- [ ] Photo gallery header: Grid layout -- 1 large image (60% width, 300px height) + 4 smaller images (2x2 grid, 40% width). All images are colored placeholders. "See all N photos" overlay button on last small image. Clicking opens a full-screen photo viewer modal.
- [ ] Hotel title area: Hotel name (28px bold), star rating (N gold star icons), rating bubbles + review count link ("2,341 reviews" scrolls to reviews section), Travelers' Choice badge (green shield icon + "Travelers' Choice" text) if applicable, rank text ("#12 of 845 hotels in New York City"), address with pin icon.
- [ ] Price comparison card (right column, sticky): White card with shadow. Heading "Prices are the average nightly price provided by our partners". List of partner prices, each row: partner name (bold), price (bold), "View Deal" button (black pill). Sorted by price ascending. Card has 12px radius, 16px padding.
- [ ] About section: Hotel description text (2-3 paragraphs with "Read more" truncation at 3 lines). Below: amenities grid (3 columns, each row: icon + amenity name). Show first 9, "Show all N amenities" expandable.
- [ ] Location section: Address text + "View on map" link. Placeholder map rectangle (100% width, 200px, gray bg with pin icon centered). Below map: "What's nearby" list (3-4 nearby restaurants/attractions with names, distances, and ratings).
- [ ] Reviews section: Heading "Reviews" + review count. Rating breakdown: horizontal bar chart showing count per rating level (5 Excellent: green bar, 4 Very Good, 3 Average, 2 Poor, 1 Terrible). Each bar is proportional to its count, with count number to the right. Filter row: "Traveler type" pills (All, Couples, Family, Solo, Business, Friends) + "Time of year" pills (All, Mar-May, Jun-Aug, Sep-Nov, Dec-Feb). Below: list of review cards. Each review card: user avatar circle (40px, initials), username (bold, link), user location, date; rating bubbles for this review, review title (bold), review body (truncated at 4 lines with "Read more"), trip type tag, helpful votes count, "Helpful" button (thumbs up icon), management response (indented, gray bg, if exists). "Write a review" button (black pill) at top of reviews section.
- [ ] Sub-ratings sidebar within reviews: Small card showing sub-ratings (Location, Cleanliness, Service, Value, Sleep Quality, Rooms) each with a horizontal mini bar and numeric rating.

### Restaurant Search (`/restaurants`)
- [ ] Similar structure to hotel search but with restaurant-specific filters. Filter sidebar: **Cuisine** (checkboxes: Italian, French, Japanese, Mexican, American, Indian, Chinese, Thai, Mediterranean), **Price** ($, $$, $$$, $$$$), **Dining options** (Delivery, Outdoor Seating, Reservations), **Meals** (Breakfast, Lunch, Dinner, Brunch), **Dietary** (Vegetarian, Vegan, Gluten Free), **Rating** (same as hotels).
- [ ] Restaurant result cards: Image left (160x120), name (link), rating bubbles + review count, cuisine type tags (gray pills), price level ($-$$$$), "Open now" or hours text. No price comparison -- instead show reservation/order links.

### Restaurant Detail (`/restaurant/:id`)
- [ ] Photo gallery header (same pattern as hotel).
- [ ] Restaurant name + rating bubbles + review count + rank. Below: cuisine type tags, price level, meals served, address, phone, hours.
- [ ] Sub-ratings card: Food, Service, Value, Atmosphere -- each with its own rating bubble row + numeric value.
- [ ] Details section: Description, dietary options, features (Reservations, Outdoor Seating, etc.).
- [ ] Reviews section (same pattern as hotel reviews but with restaurant-relevant filters).

### Things to Do Search (`/attractions`)
- [ ] Filter sidebar: **Category** (Sights & Landmarks, Museums, Tours, Outdoor Activities, Shopping, Nightlife, Spas, Food & Drink), **Price** (Free, $0-$25, $25-$50, $50-$100, $100+), **Duration** (Up to 1 hour, 1-4 hours, 4+ hours, Full day), **Rating** (same pattern).
- [ ] Attraction cards: Can use a 2- or 3-column card grid instead of list. Each card: tall image (full-width card, 200px height), title below, rating bubbles + review count, category tag, "from $24" price text, duration text. Heart/save icon overlay on image.

### Attraction Detail (`/attraction/:id`)
- [ ] Photo gallery, title + rating + review count + rank.
- [ ] Description, duration, operating hours, "best time to visit" note.
- [ ] Booking options card: List of booking tiers (Standard, VIP, etc.) with price, duration, and "Book" button for each.
- [ ] "What's included" list with check-mark icons.
- [ ] Reviews section (same pattern).

### Rating Bubbles Component (`components/RatingBubbles.jsx`)
- [ ] Reusable component accepting `rating` (1-5, supports 0.5 increments) and optional `size` (small=12px, medium=16px, large=20px). Renders 5 circles in a row. Full circles are filled with #00AA6C, empty circles are #E0E0E0. Half ratings show a half-filled circle (use CSS clip-path or two overlapping circles). Gap between circles: 2px. This is the SIGNATURE Xripadvisor UI element and must look clean.

### Save/Trip System
- [ ] Heart/save button component (`components/SaveButton.jsx`): 32px circle, white bg, heart outline icon (Lucide). On click: if not saved to any trip, opens a small popover "Save to a trip" with list of user's trips as checkboxes + "Create a trip" link. If already saved, heart is filled red. Toggling dispatches `TOGGLE_SAVE`.
- [ ] Trips page (`/trips`): Grid of trip cards. Each card: trip name (bold), description, item count, created date, "View" link. Clicking a trip shows its saved items as a list of listing cards (hotel/restaurant/attraction) with rating bubbles, "Remove" button per item. "Create a trip" button (black pill) opens a modal with name + description inputs.
- [ ] Create trip modal: Name input (required), description textarea (optional), "Create" button. Dispatches `CREATE_TRIP`.

### Write Review Flow
- [ ] Write review page (`/reviews/write/:entityType/:entityId`): Accessible via "Write a review" button on detail pages. Shows entity name at top. Form: rating selector (5 large clickable circles that fill green on selection, labels: Terrible/Poor/Average/Very Good/Excellent), title input, body textarea (min 100 chars, char count shown), trip type dropdown (Couples, Family, Solo, Business, Friends), travel date month/year selector, "Submit review" black pill button. On submit: dispatches `ADD_REVIEW`, navigates back to the entity detail page. Validation: rating required, title required, body min 100 chars -- show inline error messages in red (#CC0000).

### Search Functionality
- [ ] Search overlay/dropdown (`components/SearchOverlay.jsx`): When the header search input is focused, show a dropdown (white bg, shadow, 400px width, max 500px height). Contains: "Recent searches" section (list of recent queries from state), "Popular destinations" section (list of destination names). As user types, filter destinations + hotels + restaurants + attractions by name match. Group results by type with section headers ("Hotels", "Restaurants", "Things to Do", "Destinations"). Each result: icon (bed/fork/camera/pin), name, location. Clicking navigates to the appropriate detail or search page. On Enter: navigates to search results page for active category.

---

## P2 -- Secondary Features

Depth and realism, implement after P1 is complete.

### Forums
- [ ] Forums list page (`/forums`): Grid of destination forum cards. Each card: destination name (bold), thread count, most recent thread title + date. Clicking navigates to `/forum/:destinationId`.
- [ ] Forum detail page (`/forum/:destinationId`): Destination name heading, thread list table (title link, author, replies count, last reply date, views). Clicking a thread expands it inline or opens a sub-view showing the original post + replies. Each reply: avatar, username, date, body text, helpful votes. "Reply" textarea + submit button at bottom. Dispatches `ADD_FORUM_REPLY`.

### User Profile
- [ ] Profile page (`/profile`): User avatar (large circle, 80px, initials), display name, location, member since date, stats row (N reviews, N helpful votes, N photos), level badge. Below: tabs -- "Reviews" (list of user's reviews with entity name links), "Trips" (same as /trips), "Contributions" badge list.

### Photo Viewer Modal
- [ ] Full-screen overlay (black bg, 90% opacity). Large image centered (max 80vw x 80vh). Left/right arrow buttons for navigation. Close (X) button top-right. Photo counter "3 of 24" top-center. Thumbnail strip at bottom (horizontal scroll, 60px thumbnails, active has white border).

### Map View Toggle
- [ ] On hotel/restaurant/attraction search pages, add "Map" / "List" toggle buttons in the sort bar. "Map" view: shows a placeholder gray rectangle (100% width of results area, 600px height) with text "Map view -- interactive map would appear here" and scattered colored dots representing listing locations. Clicking a dot shows a small popover with listing name + rating + price.

### Filter Chips
- [ ] On search results pages, show applied filters as removable chips below the sort bar. Each chip: filter label text + X remove icon. "Clear all" link at end. Clicking X on a chip removes that filter and re-renders results.

### Travelers' Choice Badge Component
- [ ] Small green badge with shield icon + "Travelers' Choice" text. Shown on qualifying listings (where `travelersChoice: true`). Two variants: inline (small, next to name) and card (larger, standalone promotional style).

### Review Helpfulness
- [ ] "Helpful" button on each review card. Clicking increments `helpfulVotes` count and dispatches `VOTE_HELPFUL`. Button shows filled thumbs-up after clicking. Prevents double-voting (track in state).

### Nearby Cross-Linking
- [ ] On hotel detail pages, "Restaurants nearby" section: 3 restaurant cards with name, rating, distance. Links to restaurant detail. Similarly on restaurant pages: "Hotels nearby" section.

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `data_model.md` for complete field definitions.

- [ ] **Destinations**: 8 records (New York City, Paris, London, Tokyo, Rome, Barcelona, Cancun, Bali) with realistic descriptions and counts
- [ ] **Hotels**: 15 records across NYC (6), Paris (5), London (4). Mix of: luxury ($400+, 4.5+ rating), mid-range ($150-$350, 3.5-4.5), budget ($80-$150, 2.5-3.5). Each has 3-5 images (use placeholder gradients), 2-4 mock partner prices, full amenity lists, sub-ratings. At least 3 should have `travelersChoice: true`.
- [ ] **Restaurants**: 15 records across NYC (6), Paris (5), London (4). Mix of cuisines, price levels ($-$$$$), and ratings. Include a 5-star Michelin-type, casual dining, fast casual, ethnic cuisine, cafe.
- [ ] **Attractions**: 12 records across NYC (5), Paris (4), London (3). Mix of categories: landmarks, museums, tours, outdoor activities. Varied prices (some free, some $100+). Include world-famous ones (Statue of Liberty, Eiffel Tower, British Museum).
- [ ] **Reviews**: 50+ records distributed across all hotels, restaurants, and attractions. Each entity should have 3-5 reviews. Mix of ratings (bell curve: mostly 4-5, some 3, few 1-2). Varied trip types, travel dates (last 12 months), review lengths (50-500 words). At least 5 reviews should have management responses. At least 10 should have photos (placeholder). Helpful vote counts vary from 0 to 50.
- [ ] **Users**: 1 current user (user_1: "TravelExplorer2024", San Francisco, 47 reviews, Senior Contributor) + 20 review-author users with varied locations worldwide, review counts (2-200+), and levels.
- [ ] **Trips**: 2 trips for user_1: "NYC Weekend Getaway" (3 saved items) and "European Summer 2025" (5 saved items across Paris + London).
- [ ] **Forum Threads**: 10 threads across NYC (4), Paris (3), London (3). Topics: "best area to stay", "restaurant recommendations", "day trip suggestions", "weather in [month]", etc. 2-5 replies each.
- [ ] **Search History**: 3 recent searches pre-populated.

---

## Out of Scope

Dev must NOT implement these.

- Authentication / login / signup (app starts pre-logged-in as `TravelExplorer2024`)
- Real booking / payment processing (all "View Deal" and "Book" buttons are non-functional or navigate to a placeholder)
- Real map integration (use placeholder rectangles)
- Real price comparison API calls (use seeded mock data)
- Real photo uploads (use placeholder images/gradients)
- Email or notification sending
- Real-time updates or WebSocket connections
- Mobile-responsive layout (desktop-only is fine)
- Flights or Vacation Rentals pages (show "Coming soon" placeholder)
