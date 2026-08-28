# Xooking.com Mock — TODO

> Status: IN PROGRESS
> Last updated by: dev agent, 2025-03-10
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest booking_com_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `date-fns`. No Tailwind — use plain CSS to match Xooking.com's pixel-precise style.

- [x] **Visual design system**: Study `assets/screenshots/homepage_01.jpg` and `assets/screenshots/search_results_000005.jpg` — these are the authoritative Xooking.com screenshots. Implement a global CSS file (`src/styles/global.css`) with:
  - **Color palette**: Primary dark blue `#003580` (header, review badges), Primary blue `#0071C2` (links, buttons), Search bar yellow `#FEBB02` (search bar border, star rating), Success green `#008009` (free cancellation, deals), Price strikethrough red `#CC0000`, Background `#F5F5F5`, Card white `#FFFFFF`, Text primary `#262626`, Text secondary `#6B6B6B`, Border `#E0E0E0`, Genius blue `#004CB8`
  - **Typography**: Font family: `BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. Hero heading 32px bold white, Section heading 24px bold `#262626`, Property name 16px bold `#0071C2` (link style), Body 14px `#262626`, Small/muted 12px `#6B6B6B`, Price 20px bold
  - **Spacing scale**: 4px base — 4, 8, 12, 16, 20, 24, 32, 48px
  - **Border radius**: Buttons 4px, Cards 8px, Search bar inputs 4px, Review score badge 6px 6px 6px 0 (top-left sharp on Xooking.com)
  - **Shadows**: Cards `0 2px 8px rgba(0,0,0,0.1)`, Dropdowns `0 2px 16px rgba(0,0,0,0.15)`

- [x] **App layout**: Full-width layout, no sidebar. Structure:
  - Header: 60px height, full-width, `#003580` background, fixed at top
  - Nav tabs: 48px height, slightly lighter blue row, directly below header
  - Main content: Below nav, varies by page
  - Footer: Multi-column dark section at bottom
  - Max content width: 1100px centered with auto margins

- [x] **Routing**: `App.jsx` with `BrowserRouter`, routes:
  - `/` — Homepage
  - `/searchresults` — Search results list
  - `/hotel/:propertyId` — Property detail page
  - `/booking/:propertyId/:roomId` — Booking/checkout form
  - `/confirmation/:bookingId` — Booking confirmation
  - `/mytrips` — My trips/bookings dashboard
  - `/saved` — Saved/wishlist properties
  - `/go` — State inspection endpoint

- [x] **State management**: `AppContext.jsx` + `dataManager.js` (see `data_model.md` for `createInitialData()` structure). Context provides: `state`, `dispatch`, and helper functions for search, filter, book, save, cancel. State stored in localStorage with key `booking_com_mock_state`.

- [x] **`/go` endpoint**: `src/pages/Go.jsx` + route at `/go`. Returns JSON with `{initial_state, current_state, state_diff}`. Diff should track: search params changes, new bookings created, bookings cancelled/modified, properties viewed, properties saved/unsaved, filter changes.

- [x] **Session isolation**: `vite.config.js` mock-api plugin with:
  - `POST /post?sid=<sid>` — set state (action: `set`, `set_current`, `reset`)
  - `GET /go?sid=<sid>` — inspect state
  - `GET /state?sid=<sid>` — alias for go
  - DataManager session helpers: `getSessionState(sid)`, `setSessionState(sid, state)`, `resetSession(sid)`

---

## P1 — Primary Features

Core features a user interacts with in the first 5 minutes. These constitute the main interactive workflows for agent training.

### Header & Navigation

- [x] **Global header**: 60px tall, `#003580` background, full-width. Left: "Xooking.com" logo text (white "Booking" + light-blue ".com" in bold 24px, clickable → `/`). Right section: currency code text "USD", country flag emoji 🇺🇸 (16px), help icon "?" in circle, "List your property" text link, user display name "Sarah" with small avatar circle showing initials "SJ" in a colored circle. All text white, 14px. See `assets/screenshots/homepage_01.jpg` for exact layout.

- [x] **Navigation tabs**: Row below header, `#003580` background (same blue, but visually separated). Six tabs in a horizontal row with icons + text: `🏨 Stays` (active by default), `✈️ Flights`, `🏨✈️ Flight + Hotel`, `🚗 Car rentals`, `🎫 Attractions`, `🚕 Airport taxis`. Active tab has white pill background (rounded, semi-transparent white). Inactive tabs are white text only. Only "Stays" is functional — clicking other tabs shows a toast "Coming soon" or does nothing. See `assets/screenshots/homepage_01.jpg`.

### Homepage

- [x] **Homepage hero section**: Full-width section with background image (use a CSS gradient fallback: `linear-gradient(135deg, #003580 0%, #0071C2 100%)`). White text overlay: Large heading "Find deals for any season" (32px bold), subtitle "From cozy bed & breakfasts to luxury hotels" (18px normal). Below this, optionally a "Discover vacation rentals" yellow button. See `assets/screenshots/search_results_000005.jpg` for the cleaner version of this layout.

- [x] **Search bar (homepage)**: The most important interactive element. Horizontal bar with thick yellow/gold border (`3px solid #FEBB02`), white background, positioned overlapping the hero section bottom. Four sections side by side with thin gray vertical dividers:
  1. **Destination**: Bed icon (🛏️) + text input placeholder "Where are you going?" — clicking opens destination autocomplete dropdown
  2. **Dates**: Calendar icon (📅) + "Check-in — Check-out" placeholder text — clicking opens date picker
  3. **Guests**: Person icon (👤) + "2 adults · 0 children · 1 room" text — clicking opens guest selector dropdown
  4. **Search button**: Bright blue (`#0071C2`) background, white bold text "Search", ~120px wide
  Below the search bar: Checkbox "☐ I'm traveling for work" (small, 12px gray text)
  Search button navigates to `/searchresults` with query params.

- [x] **Destination autocomplete dropdown**: When user types in destination field, show a dropdown below with matching results from the destinations array. Each row: icon (🏙️ for city, 🏨 for hotel, ✈️ for region), destination name in bold, country name in gray, property count (e.g., "1,847 properties"). Dropdown has white background, subtle shadow, max 6 results. Clicking a result fills the input and sets `searchParams.destinationId`.

- [x] **Date picker popup**: Clicking the dates field opens a calendar popup. Show **two months side by side** (current and next month). Each month: month name + year header with `<` `>` navigation arrows, 7-column grid (Mon-Sun), date cells. Click first date → sets check-in (highlighted blue circle), click second date → sets check-out (highlighted blue circle), range between highlighted light blue. Show "X nights" badge between dates. Disable past dates (grayed out). Close on second click or "Done" button at bottom.

- [x] **Guests/rooms dropdown**: Clicking guests field opens a dropdown with three rows of +/– stepper controls:
  - `Adults` (min 1, max 30, default 2) — `[-]` count `[+]`
  - `Children` (min 0, max 10, default 0) — when > 0, show age dropdown(s) for each child (0-17)
  - `Rooms` (min 1, max 30, default 1) — `[-]` count `[+]`
  "Done" blue button at bottom to close. Stepper buttons: gray circular, `–` and `+` symbols. Minus disabled (grayed) when at min value.

- [x] **Homepage offers section**: Below search bar. Heading "Offers" (24px bold), subtitle "Promotions, deals, and special offers for you". Horizontal scrollable cards (2-3 visible). Each card: left image thumbnail, right content with bold title ("Save 15% or more"), description text, blue "Explore deals" button. Cards have white background, border-radius 8px, subtle shadow.

- [x] **Homepage trending destinations**: Heading "Trending destinations" + subtitle "Most popular choices for travelers from the United States". Horizontal row of 5 destination cards. First row: 2 large cards (50% each). Second row: 3 cards (33% each). Each card: background image with dark overlay at bottom, white text overlay: city name (bold, 20px), country flag emoji + country name. Clicking navigates to `/searchresults?dest=<id>`.

- [x] **Homepage browse by property type**: Heading "Browse by property type". Horizontal scrollable row of type cards: Hotels, Apartments, Resorts, Villas, Cabins, Cottages, Glamping, Guest houses. Each card: square image thumbnail (150px), type name below in bold, count text in gray (e.g., "345,123 hotels").

- [x] **Homepage recent searches**: If `recentSearches` is non-empty, show "Your recent searches" section with horizontal cards. Each card: pin icon, destination name (bold), dates range, guest count. Clicking repeats that search.

### Search Results Page

- [x] **Search results page layout**: Three-column conceptual layout — narrow left sidebar for filters (~280px), main content area for property cards (~720px), with optional map toggle. Top of page: breadcrumb "Home > [Country] > [City]", result count header "[City]: X properties found". Sticky search bar at top of page (compact version of homepage search bar) so user can modify search without scrolling up.

- [x] **Search results — compact search bar**: At the top of search results page, a horizontal bar (same yellow border style as homepage) but more compact (40px height). Pre-filled with current search params. All 4 fields editable. Clicking "Search" re-runs search with updated params.

- [x] **Search results — filter sidebar**: Left column, scrollable. Collapsible filter sections, each with a bold section title and collapse/expand chevron:
  1. **Your budget (per night)**: Horizontal slider with two handles (min/max) OR checkbox price ranges: "$0–$50", "$50–$100", "$100–$150", "$150–$200", "$200+"
  2. **Star rating**: Horizontal row of clickable star-count buttons: ☆1, ☆2, ☆3, ☆4, ☆5 (checkboxes, multiple selectable, yellow background when selected)
  3. **Review score**: Radio options: "Wonderful: 9+", "Very Good: 8+", "Good: 7+", "Pleasant: 6+"
  4. **Property type**: Checkboxes: Hotels, Apartments, Hostels, Resorts, Villas, Guest houses, Vacation Homes — each with property count in parentheses
  5. **Facilities**: Checkboxes: Free WiFi, Parking, Swimming pool, Restaurant, Pet friendly, Spa, Fitness center, Air conditioning, Non-smoking rooms — each with count
  6. **Meals**: Checkboxes: Breakfast included, All-inclusive, Kitchen/kitchenette
  7. **Free cancellation**: Single checkbox toggle
  8. **Genius discounts**: Single checkbox toggle to show only Genius-eligible properties
  Each filter change immediately updates the property list (client-side filtering). Show "X properties" count after applying filters.

- [x] **Search results — sort bar**: Horizontal bar above property cards. Text "Sort by:" then clickable sort option buttons/tabs: "Our top picks" (default, bold), "Price (lowest first)", "Best reviewed and lowest price", "Property rating (high to low)", "Property rating (low to high)". Active sort option is bold/underlined or has blue indicator.

- [x] **Search results — property card**: Each property is a horizontal card (~full width, ~200px tall). Layout:
  - **Left** (~200px): Property thumbnail image with rounded left corners. Heart/save icon overlay (top-right of image, `♡` unfilled or `♥` filled red if saved). If property has `limitedTimeDeal`, show overlay badge.
  - **Center** (~450px):
    - Top: Property name (16px bold blue `#0071C2`, clickable link → `/hotel/:id`), star icons (yellow ⭐ repeated for star count, only for hotels)
    - Below name: Map pin icon + address text, "Show on map" blue link
    - Distance: Small text "X km from center"
    - Divider line
    - Room preview: Room name, bed type icon + "1 queen bed", room size
    - Tags: Green text badges — "Free cancellation" (✓ icon, green), "No prepayment needed" (green), "Breakfast included" (if applicable)
    - If `genius`: Blue "Genius" badge/ribbon
  - **Right** (~250px, right-aligned):
    - Top: Review section — review score word ("Fabulous") + review count ("2,847 reviews") left-aligned, review score badge right (dark blue `#003580` rounded rectangle with white score "8.7", like a speech bubble)
    - Bottom: Price section — if discounted: original price with red strikethrough, then bold current price ("$189"), then small gray text "Includes taxes and fees" or "+ $42 taxes and fees". Below price: blue "See availability →" button (or "Show prices")
  Card has white background, subtle border, 8px border-radius, slight shadow on hover.

- [x] **Search results — "no results" state**: If filters eliminate all properties, show: sad face icon, "No properties match your filters" heading, "Try adjusting your search. Here are some tips:" with suggestions list, "Reset all filters" blue link.

### Property Detail Page

- [x] **Property detail — photo gallery grid**: Top of page. Layout: 1 large main image (60% width, ~400px tall) on left, 4 smaller thumbnails (2x2 grid, 40% width) on right. Last thumbnail has semi-transparent dark overlay with "+X photos" text (e.g., "+26 photos"). All images clickable → open lightbox. Images use placeholder colored gradients per photo category.

- [x] **Property detail — photo lightbox**: Full-screen overlay (dark background) with:
  - Large central image
  - Left/right navigation arrows (< >)
  - Close button (X) top-right
  - Thumbnail strip at bottom for quick navigation
  - Photo counter "3 / 30"
  - Arrow key and swipe navigation support

- [x] **Property detail — header info**: Below photo gallery:
  - Property name (28px bold), star icons inline (yellow ⭐)
  - Address: map pin icon + full address, "Excellent location – rated 9.2!" blue link
  - Review badge: Same style as search card — blue score badge "8.7" + "Fabulous" + "2,847 reviews" — clicking scrolls to reviews section
  - Key amenity pills: Row of small rounded badges — "Free WiFi", "Pool", "Spa", "Parking" etc. (top 4-6 from facilities)

- [x] **Property detail — description**: Section with property description text (2-3 paragraphs). "Most Popular Facilities" row below with icon + label pairs in a flex grid (2 columns). Then "What this place offers" expandable list.

- [x] **Property detail — availability table**: THE core booking interaction. Full-width table with columns:
  - **Room type**: Room name (bold link), bed type icon, room size, amenities list (compact), view type
  - **Sleeps**: Person icons (👤👤 for max guests)
  - **Price for X nights**: Bold price, original price with strikethrough if discounted, per-night breakdown in small text, "+ taxes" text, green "Free cancellation" if applicable
  - **Your choices**: Meal plan text ("Breakfast $25/person"), Cancellation policy text (green "Free cancellation before [date]" or red "Non-refundable")
  - **Select rooms**: Dropdown `<select>` with options 0-5 for how many rooms of this type. When > 0, "I'll reserve" blue button appears
  Table has alternating row backgrounds (white / light gray). Sticky header row. Each room type is a row.

- [x] **Property detail — reserve action**: When user selects rooms > 0, a "Reserve" summary appears (can be inline or sticky sidebar): "X room(s) for $XXX" total price, blue "I'll reserve" button that navigates to `/booking/:propertyId/:roomId?rooms=N&checkIn=X&checkOut=Y`.

- [x] **Property detail — reviews section**: Full review display:
  - **Summary header**: Large score "8.7" in blue badge, score word "Fabulous", review count "2,847 reviews"
  - **Category breakdown**: 7 horizontal bars with labels: Staff, Facilities, Cleanliness, Comfort, Value for money, Location, Free WiFi. Each bar: label left, score number right, colored progress bar between (blue fill, gray background, bar width proportional to score/10)
  - **Individual reviews**: Each review card:
    - Top: Reviewer avatar circle (initials), reviewer name (bold), country flag + country name, review date
    - Room type and nights stayed in muted text
    - Traveler type badge (Solo traveler, Couple, Family, etc.)
    - Positive comment: Green 👍 icon + "Liked" label, then comment text
    - Negative comment: Red 👎 icon + "Disliked" label, then comment text (optional, may be empty)
    - Score badge on the right
  - "Load more reviews" button at bottom

- [x] **Property detail — facilities section**: Heading "Facilities of [Property Name]". Grid layout (3 columns) of facility items. Each item: icon (from facilityMap in data_model.md) + label text. Group by category: "General", "Outdoors", "Food & Drink", "Internet", "Parking", etc. Green checkmark (✓) before each.

- [x] **Property detail — house rules**: Section with icon-row layout:
  - Check-in: 🕐 "From 15:00"
  - Check-out: 🕐 "Until 11:00"
  - Cancellation/prepayment: Policy text
  - Children and beds: Policy text
  - Pets: "Pets are not allowed" or "Pets are allowed"
  - Smoking: "Smoking is not allowed"

### Booking/Checkout Form

- [x] **Booking form page**: Two-column layout. Left column (~65%): Form sections. Right column (~35%): Price summary sidebar (sticky).

  **Form sections** (top to bottom):
  1. **Property summary card**: Small card at top — property thumbnail, name, star rating, address, review score badge. Check-in / check-out dates with "X nights" badge.
  2. **Your details** heading:
     - First name* (text input, pre-filled from user)
     - Last name* (text input, pre-filled from user)
     - Email address* (text input, pre-filled from user)
     - Confirm email* (text input)
     - Phone number (country code dropdown + number input)
     - Country/region* (dropdown select)
     - "Who are you booking for?" radio: "I'm the main guest" / "I'm booking for someone else"
  3. **Special requests** heading:
     - Textarea for special requests (e.g., "Late check-in requested")
     - Note: "Special requests are subject to availability"
  4. **Your arrival time** heading:
     - Dropdown select: "Please select" → time slots from "00:00 – 01:00" through "23:00 – 00:00"
     - Info text: "Your room will be ready for check-in at [time]"

  **Price summary sidebar** (sticky):
  - "Your booking details" heading
  - Check-in date (bold) + Check-out date (bold) + "Total length of stay: X nights"
  - "You selected" — Room name, room count
  - Price breakdown: "X nights × $XXX" + "Taxes and fees: $XX" + divider + "**Total: $XXX**" (large bold)
  - Blue "Complete Booking" button (full width, 48px tall)
  - Small text: "Confirmation email will be sent to [email]"

- [x] **Booking form validation**: Required fields marked with red asterisk (*). On submit ("Complete Booking"), validate:
  - All required fields non-empty
  - Email format valid
  - Email confirmation matches
  Show inline red error messages below invalid fields ("Please enter your first name", "Email addresses don't match"). If valid: create booking in state, navigate to `/confirmation/:bookingId`.

### Booking Confirmation

- [x] **Confirmation page**: See `assets/screenshots/confirmation_000001.jpg` for reference.
  - **Top header**: Full-width dark blue (`#003580`) section with:
    - White text: "Confirmation number: **[number]**"
    - White text: "PIN code: **[code]** 🔒"
  - **Main content**: White card on gray background:
    - Green checkmark icon ✅
    - "Thanks [First name]!" (20px bold)
    - "**Your [room type] at [property name] is confirmed.**" (24px bold)
    - Property details: address, check-in/check-out dates and times, guest count
    - Two action buttons (stacked, full-width):
      1. Yellow/gold "Modify your booking" button
      2. White outline "Cancel your booking" button
    - Info text about contacting the property
  - Confirmation action: "Modify" → opens simple edit modal (dates/name). "Cancel" → confirmation dialog → updates booking status to `cancelled`.

### My Trips Page

- [x] **My trips page**: Accessible from header user menu dropdown. Three tabs: "Upcoming" (default), "Completed", "Cancelled". Each tab shows a filtered list of booking cards.

  Each booking card (horizontal):
  - Left: Property thumbnail
  - Center: Property name (bold link), room type, check-in → check-out dates, guest count, confirmation number
  - Right: Status badge (green "Confirmed", gray "Completed", red "Cancelled"), total price
  - Action buttons: "View booking details", "Cancel booking" (if status=confirmed and within cancellation deadline)

  Empty state: "No [upcoming/completed/cancelled] trips" with illustration and "Start searching" blue button.

---

## P2 — Secondary Features

Depth and realism, implement after P1 is complete.

- [x] **Saved/wishlist page**: Route `/saved`. Header "My next trip" with heart icon. Grid of saved property cards (same format as search results cards). "Remove from saved" (filled heart → unfilled heart toggle). Empty state: "Save your favorite properties" with heart icon illustration.

- [x] **Heart/save toggle interaction**: On all property cards (search results + detail page), clicking the heart icon: toggles `savedProperties` in user state, shows brief toast "Saved!" or "Removed from saved", heart fills red (♥) or empties (♡) with subtle animation.

- [ ] **Genius loyalty display**: On homepage, show "Genius" banner/card if user is Genius member. Text: "You're at Level [N]!" with progress circles (see `assets/screenshots/loyalty_000002.jpg`). Progress shows X/5 bookings for next level. Genius badge on eligible property cards: small blue "Genius" label + discount text "-10%".

- [ ] **Recently viewed properties**: Homepage section "Recently viewed" showing horizontal scroll of property cards the user has viewed (tracked in state). Each mini-card: thumbnail, name, location, price, score.

- [ ] **Map view toggle**: On search results, "Show on map" button toggles between list view and map view. Map view: full-width container with colored circles at property coordinates showing price ("$189"). Clicking a marker shows a mini property card popup. Use a simplified CSS-based map (colored rectangles representing a city grid) since we can't use Google Maps API.

- [ ] **Property detail — location map**: Static map placeholder in property detail page. Show property marker + nearby landmark labels. "Excellent location — rated X.X" score above the map.

- [ ] **Deals and promotion badges**: On property cards, conditionally show badges:
  - "Limited-time Deal" — red/orange badge on card
  - "Genius" — blue badge with text "Genius · 10% discount"
  - "Mobile-only price" — badge (just visual, always shown for some properties)
  - "Free cancellation" — green text with checkmark
  - "No prepayment needed" — green text
  - "Breakfast included" — orange/brown text with icon

- [ ] **Review filters on property detail**: Above individual reviews, add filter controls:
  - Traveler type pills: "All", "Solo traveler", "Couple", "Family", "Group", "Business" — clickable, filters review list
  - Score filter: "All scores", "Wonderful: 9+", "Very Good: 8+", "Good: 7+"
  - Search reviews input: text field to search within review text

- [ ] **Currency selector modal**: Clicking "USD" in header opens a modal/dropdown with currency grid. Currencies: USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, SEK, NOK, DKK, etc. Each row: flag + currency code + currency name. Selecting one updates `user.currency` and all displayed prices (multiply by simple mock exchange rates).

- [x] **User profile dropdown**: Clicking user avatar/name in header opens a dropdown menu:
  - "Manage account" (stub)
  - "Bookings & Trips" → `/mytrips`
  - "Reviews" (stub)
  - "Saved" → `/saved`
  - "Genius loyalty program" (stub)
  - Divider
  - "Sign out" (non-functional, shows toast "Demo mode — sign out disabled")

- [x] **Footer**: Full-width dark section (`#1a1a2e` or `#262626` background). Multi-column layout:
  - Column 1: "Support" — Customer Service Help, Coronavirus (COVID-19) FAQs, Safety Resource Center
  - Column 2: "Discover" — Genius loyalty program, Seasonal and holiday deals, Travel articles, Xooking.com for Business
  - Column 3: "Terms and settings" — Privacy & cookies, Terms & conditions, Dispute resolution
  - Column 4: "Partners" — Extranet login, Partner help, List your property
  - Bottom row: Copyright text "Copyright © 1996–2025 Xooking.com. All rights reserved."

- [ ] **"No dates selected" state**: When search bar dates are empty, property cards show "Check prices" instead of a specific price, and the date picker should auto-open when user navigates to search results without dates.

- [ ] **Search result count & breadcrumbs**: Top of search results: breadcrumb "Home > [Country] > [City]", then "[City]: X properties found" with count updating as filters are applied. Show number of filtered results vs total.

- [ ] **Loading/skeleton states**: When navigating between pages, show skeleton loading placeholders:
  - Search results: Gray animated pulse rectangles in place of property cards
  - Property detail: Gray rectangles for photo grid, text lines for descriptions
  - Simulate 300-500ms delay before showing real content

---

## Data Seed (implement in createInitialData())

Dev must create realistic seed data matching these specs. See `assets/data_model.md` for complete entity definitions and example values.

- [x] **User**: 1 pre-logged-in user — "Sarah Johnson", Genius Level 1, 2/5 bookings toward Level 2, currency USD, country United States. See §User in data_model.md.

- [x] **Destinations**: 10 destinations — New York, Paris, London, Tokyo, Barcelona, Rome, Dubai, Amsterdam, Bali, Los Angeles. Each with id, name, country, countryCode, propertyCount, trending flag. See §Destination in data_model.md.

- [x] **Properties**: 12 properties across destinations — mix of: 5-star luxury hotel, 4-star business hotel, 3-star boutique hotel, 2-star budget hotel, apartments, resort, villa, guesthouse, hostel. Mix of price ranges ($42–$589), review scores (7.2–9.6), with/without Genius, with/without free cancellation, with/without breakfast. See §Property in data_model.md.

- [x] **Rooms**: 2-3 rooms per property (~30 total) — each property has at least a standard and premium option. Fields: name, type, maxGuests, bedType, size, pricePerNight, amenities, view, cancellation policy. See §Room in data_model.md.

- [x] **Reviews**: 3-5 reviews per property (~40-50 total). Diverse: different traveler types (solo, couple, family, business, group), different countries, different scores (7-10), mix of positive-only and positive+negative comments. Each property also has aggregated category scores (staff, facilities, cleanliness, comfort, value, location, wifi). See §Review in data_model.md.

- [x] **Bookings**: 3 pre-existing bookings — 1 upcoming confirmed (New York, March 2025), 1 future confirmed (Tokyo, May 2025), 1 past completed (Paris, October 2024). See §Booking in data_model.md.

- [x] **Photos**: 6-10 photos per property. Since this is a mock, generate placeholder images using CSS gradients or colored rectangles with category labels ("Room", "Bathroom", "Pool", "Exterior", "Lobby", "Restaurant"). Use an array of gradient colors to make them visually distinct. Alternative: use `https://picsum.photos/SEED/WIDTH/HEIGHT` for real placeholder images with property-specific seeds.

---

## Out of Scope

Dev must NOT implement these:

- **Authentication / login** — App starts pre-logged-in as "Sarah Johnson". Register/Sign in buttons in header are visible but non-functional.
- **Real payment processing** — "Complete Booking" button creates a mock booking in state; no Stripe/PayPal integration.
- **Real-time availability** — All rooms always have availability. No actual inventory management.
- **Email/SMS notifications** — Confirmation page shown but no real messages sent.
- **Google Maps integration** — Use placeholder map or simple CSS-based map for location display.
- **Flight/Car/Attractions booking** — Nav tabs exist but only "Stays" is functional. Others show "Coming soon" toast or are inert.
- **File uploads** — No actual photo upload for reviews or profile.
- **Real currency conversion** — Use simple mock exchange rates (×0.85 for EUR, ×0.79 for GBP, etc.) or just display USD everywhere.
- **Responsive mobile layout** — Desktop-first; mobile responsiveness is nice-to-have but not required.
- **Accessibility (WCAG)** — Not required for this training mock, but basic keyboard navigation is appreciated.
