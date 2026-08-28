# booking_com_mock Schema

**Public URL**: `https://cua-gym-booking-com.xlang.ai/`
**Local dev port**: `5192` (Vite dev), `5180` (Vite preview)
**State Inspector (React UI)**: `GET /go?sid=<sid>` — renders JSON in a browser page
**State Inspector (API)**: `GET /go?sid=<sid>` — returns `{ initial_state, current_state, state_diff }` (same endpoint, JSON when accessed programmatically)
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State query**: `GET /state?sid=<sid>` — returns `{ stored_state, has_custom_state, sid }`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) — returns `{ success, files: [{original_name, stored_name, size, content_type, url}] }`
**Serve files**: `GET /files/<sid>/<filename>` — returns file content with appropriate Content-Type

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Landing page with search bar, trending destinations, recent searches, browse by type, recently viewed |
| `/search` | Search | Property search results with sidebar filters and sort options |
| `/property/:id` | PropertyDetail | Full property page with photos, rooms, reviews, booking sidebar |
| `/checkout` | Checkout | Booking form with guest details, arrival time, special requests |
| `/confirmation/:bookingId?` | Confirmation | Booking confirmation with confirmation number and PIN; cancel booking button |
| `/mytrips` | Trips | User's bookings with tabs for upcoming / completed / cancelled |
| `/saved` | Saved | User's saved (wishlisted) properties |
| `/go` | Go | State inspector — renders `{initial_state, current_state, state_diff}` as JSON in a `<pre>` block |

---

## API Endpoints

### POST /post?sid=\<sid\>

Sets or modifies the server-side state for a given session. All actions accept an optional `"merge": true` flag to deep-merge the payload into the existing state rather than replacing it.

| Action | Body | Effect |
|--------|------|--------|
| `"set"` | `{"action":"set","state":{...}}` | Replaces current state; also sets initial state (first time only for the session) |
| `"set_current"` | `{"action":"set_current","state":{...}}` | Replaces only current state; never touches `.initial.json`. Used by evaluation tools to simulate correct task completion without changing the baseline. |
| `"reset"` | `{"action":"reset"}` | Clears both current and initial state files; app falls back to client-side defaults on next load |

**Merge flag**: add `"merge": true` to any `set` or `set_current` action to deep-merge the provided state into the existing state instead of fully replacing it.

**Response on success**: `{ success: true, message: "...", state: {...} }`
**Response on reset**: `{ success: true, message: "State reset." }`
**Response on error**: HTTP 400, `{ error: "..." }`

### GET /state?sid=\<sid\>

Returns the raw server-side stored state without computing a diff.

**Response**: `{ stored_state: {...}|null, has_custom_state: boolean, sid: string|null }`

### GET /go?sid=\<sid\>

Returns the full state comparison for agent evaluation. Computes a diff between initial and current state for all top-level keys.

**Response**: `{ initial_state: {...}, current_state: {...}, state_diff: {...} }`

The `state_diff` uses the following structure per changed key:
- `{ added: <value> }` — key was absent in initial state
- `{ modified: <value> }` — key exists in both but values differ

The React `/go` page renders this same data via the `getDiff()` helper in `StoreContext`, which does a field-level diff over only the 7 tracked fields (see [Tracked State Diff Fields](#tracked-state-diff-fields)).

### POST /upload?sid=\<sid\>

Accepts `multipart/form-data`. Stores files in `.mock-files/<sid>/` on the server.

**Response**: `{ success: true, files: [{ original_name, stored_name, size, content_type, url }] }`
- `url` format: `/files/<sid>/<uuid_prefix>_<safe_filename>`

### GET /files/\<sid\>/\<filename\>

Serves uploaded files. Supported MIME types: PDF, PNG, JPG/JPEG, GIF, TXT, CSV, ZIP, DOC/DOCX, XLS/XLSX.

---

## State Architecture

State is stored as `{ initial_state, current_state }` in localStorage. The shape of both is identical. Both the server-side `.json` file (written by `/post`) and the client-side localStorage are used for state persistence. The server-side state is fetched at mount time and takes precedence over localStorage.

On first load with a `sid` parameter, the app calls `/state?sid=<sid>`. If `has_custom_state` is true, it deep-merges the custom state over the default data. Once initialized, the app saves state to localStorage on every state change.

State is accessed via `useAppContext()` (aliased as `useStore()`), which exposes both the current data and a set of action functions.

---

## State Schema

### Top-Level Keys

| Key | Type | Description |
|-----|------|-------------|
| `user` | Object\|null | Current user profile and preferences; `null` when signed out |
| `destinations` | Array\<Destination\> | All available travel destinations (10 items; static) |
| `properties` | Array\<Property\> | All available accommodation listings (12 items; static) |
| `rooms` | Array\<Room\> | All room types across all properties (28 items; static) |
| `reviews` | Array\<Review\> | Guest reviews for properties (28 items; static) |
| `reviewCategories` | Object | Per-property category review scores (keyed by property ID; static) |
| `bookings` | Array\<Booking\> | User's bookings (initially 3; mutable) |
| `searchParams` | Object | Current search parameters (mutable) |
| `searchFilters` | Object | Persisted search filter settings (mutable via `setSearchFilters`/`resetFilters`) |
| `searchResults` | Array | Always `[]` — filtering is done client-side in the Search component; not used for actual results |
| `selectedPropertyId` | String\|null | ID of the most recently viewed property (set by `viewProperty`) |
| `recentSearches` | Array\<RecentSearch\> | Recent search history, max 5, deduped by `destinationId` (mutable) |
| `recentlyViewed` | Array\<String\> | Recently viewed property IDs, max 10, newest first (mutable) |
| `notifications` | Array | Always `[]` — not used by the UI in the current implementation |
| `viewedProperties` | Array\<String\> | All property IDs ever viewed (deduplicated; append-only) |

---

### user Object

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `user.id` | String | `"user_1"` | User ID |
| `user.firstName` | String | `"Sarah"` | First name |
| `user.lastName` | String | `"Johnson"` | Last name |
| `user.email` | String | `"sarah.johnson@email.com"` | Email address |
| `user.phone` | String | `"+1 (555) 123-4567"` | Phone number |
| `user.country` | String | `"United States"` | Country |
| `user.nationality` | String | `"American"` | Nationality |
| `user.avatarUrl` | String\|null | `null` | Avatar image URL |
| `user.geniusLevel` | Number | `1` | Genius loyalty level (1–3) |
| `user.geniusBookings` | Number | `2` | Number of qualifying Genius bookings completed |
| `user.geniusBookingsRequired` | Number | `5` | Bookings needed to reach the next Genius level |
| `user.currency` | String | `"USD"` | Preferred currency |
| `user.language` | String | `"English (US)"` | Preferred language |
| `user.savedProperties` | Array\<String\> | `["prop_2", "prop_5"]` | IDs of saved/wishlisted properties |

**Sign out**: Clicking "Sign out" in the Navbar sets `current_state.user` to `null`.
**Sign in**: Clicking "Sign in" in the Navbar restores the default `user_1` object, preserving existing `savedProperties`.

---

### Destination Object

| Key | Type | Description |
|-----|------|-------------|
| `id` | String | Destination ID (e.g., `"dest_1"`) |
| `name` | String | City/region name (e.g., `"New York"`) |
| `country` | String | Country name |
| `countryCode` | String | 2-letter ISO country code |
| `type` | String | `"city"` or `"region"` |
| `propertyCount` | Number | Approximate number of available properties on the real platform |
| `trending` | Boolean | Whether the destination is highlighted as trending |
| `description` | String | Short one-line description |

**All 10 destination IDs**:

| ID | Name | Country | Trending |
|----|------|---------|---------|
| `dest_1` | New York | United States | true |
| `dest_2` | Paris | France | true |
| `dest_3` | London | United Kingdom | true |
| `dest_4` | Tokyo | Japan | true |
| `dest_5` | Barcelona | Spain | true |
| `dest_6` | Rome | Italy | false |
| `dest_7` | Dubai | United Arab Emirates | true |
| `dest_8` | Amsterdam | Netherlands | false |
| `dest_9` | Bali | Indonesia | true |
| `dest_10` | Los Angeles | United States | false |

---

### Property Object

| Key | Type | Description |
|-----|------|-------------|
| `id` | String | Property ID (e.g., `"prop_1"`) |
| `name` | String | Property name |
| `type` | String | One of: `"hotel"`, `"apartment"`, `"resort"`, `"villa"`, `"hostel"`, `"guesthouse"` |
| `stars` | Number | Star rating (1–5 for hotels; `0` for non-hotel types) |
| `destinationId` | String | FK to destination |
| `city` | String | City name |
| `country` | String | Country name |
| `address` | String | Full address string |
| `distanceFromCenter` | String | Human-readable distance (e.g., `"0.5 km from center"`) |
| `coordinates` | Object | `{ lat: Number, lng: Number }` |
| `description` | String | Full property description |
| `shortDescription` | String | One-line summary |
| `reviewScore` | Number | Overall review score (0–10) |
| `reviewScoreWord` | String | Label for score: `"Exceptional"` (≥9.5), `"Superb"` (≥9), `"Fabulous"` (≥8.5), `"Very Good"` (≥8), `"Good"` (≥7) |
| `reviewCount` | Number | Total number of reviews |
| `pricePerNight` | Number | Current price per night in USD |
| `originalPrice` | Number\|null | Pre-discount price; `null` if no discount |
| `currency` | String | Always `"USD"` |
| `taxesAndFees` | Number | Additional taxes and fees per night in USD |
| `genius` | Boolean | Whether Genius discount is available |
| `geniusDiscountPercent` | Number | Genius discount percentage: `0`, `10`, or `15` |
| `freeCancellation` | Boolean | Whether free cancellation is available |
| `freeCancellationUntil` | String\|null | Date string (YYYY-MM-DD) for cancellation deadline; `null` if open-ended or not applicable |
| `prepayment` | String | `"no_prepayment"` or `"prepayment_required"` |
| `breakfastIncluded` | Boolean | Whether breakfast is included in the price |
| `thumbnailUrl` | String | Thumbnail image URL (from picsum.photos) |
| `photos` | Array\<Photo\> | Array of `{ id, url, caption, category }` objects |
| `facilities` | Array\<String\> | Facility code strings (see full list below) |
| `popularFacilities` | Array\<String\> | Human-readable popular facility names (subset of `facilities`) |
| `rooms` | Array\<String\> | Room IDs belonging to this property |
| `checkInTime` | String | Check-in time (e.g., `"15:00"`) |
| `checkOutTime` | String | Check-out time (e.g., `"11:00"`) |
| `petsAllowed` | Boolean | Whether pets are permitted |
| `smokingAllowed` | Boolean | Whether smoking is permitted |
| `sustainability` | Boolean | Whether the property has sustainability certification |
| `sustainabilityLevel` | Number | Sustainability level: `0` (none) – `3` (highest) |
| `limitedTimeDeal` | Boolean | Whether a limited-time deal badge is shown |
| `newToBooking` | Boolean | Whether the property is newly listed on the platform |

**Facility codes used across properties**: `free_wifi`, `pool`, `spa`, `fitness`, `restaurant`, `bar`, `parking`, `room_service`, `24h_front_desk`, `air_conditioning`, `non_smoking`, `kitchen`, `washer`, `garden`, `terrace`, `breakfast`, `private_beach`, `balcony`, `kids_club`, `water_sports`, `locker`, `bicycle_rental`, `shared_kitchen`, `valet_parking`, `tennis`, `airport_shuttle`, `concierge`, `laundry`

**All 12 property IDs and key attributes**:

| ID | Name | Type | Stars | Destination | Price/night |
|----|------|------|-------|-------------|-------------|
| `prop_1` | Grand Plaza Hotel & Spa | hotel | 4 | dest_1 (NY) | $189 |
| `prop_2` | The Manhattan Suites | apartment | 0 | dest_1 (NY) | $275 |
| `prop_3` | NYC Budget Inn | hotel | 2 | dest_1 (NY) | $89 |
| `prop_4` | Hôtel Le Marais Charm | hotel | 3 | dest_2 (Paris) | $145 |
| `prop_5` | Paris Luxury Palace | hotel | 5 | dest_2 (Paris) | $589 |
| `prop_6` | Kensington Gardens B&B | guesthouse | 0 | dest_3 (London) | $112 |
| `prop_7` | Shibuya Crossing Hotel | hotel | 4 | dest_4 (Tokyo) | $165 |
| `prop_8` | Casa Barcelona Apartments | apartment | 0 | dest_5 (Barcelona) | $98 |
| `prop_9` | Palm Beach Resort & Spa | resort | 5 | dest_7 (Dubai) | $425 |
| `prop_10` | Ubud Jungle Villa | villa | 0 | dest_9 (Bali) | $195 |
| `prop_11` | Canal View Hostel | hostel | 0 | dest_8 (Amsterdam) | $42 |
| `prop_12` | Beverly Hills Grand | hotel | 5 | dest_10 (LA) | $399 |

---

### Room Object

| Key | Type | Description |
|-----|------|-------------|
| `id` | String | Room ID (format: `"room_<propNum>_<roomNum>"`, e.g., `"room_1_1"`) |
| `propertyId` | String | FK to property |
| `name` | String | Room name (e.g., `"Deluxe King Room"`) |
| `type` | String | One of: `"single"`, `"double"`, `"suite"`, `"studio"`, `"family"`, `"dormitory"` |
| `maxGuests` | Number | Maximum occupancy |
| `bedType` | String | Bed description (e.g., `"1 king bed"`) |
| `size` | String | Room size (e.g., `"30 m²"`) |
| `pricePerNight` | Number | Room price per night in USD |
| `originalPrice` | Number\|null | Original price before discount; `null` if no discount |
| `amenities` | Array\<String\> | Room amenities list (human-readable strings) |
| `view` | String\|null | View description; `null` if none |
| `breakfastIncluded` | Boolean | Whether breakfast is included for this room |
| `breakfastPrice` | Number\|null | Breakfast add-on price; `null` if no add-on available |
| `freeCancellation` | Boolean | Whether free cancellation applies to this room |
| `cancellationDeadline` | String\|null | Free cancellation deadline (YYYY-MM-DD); `null` if open-ended or not applicable |
| `prepayment` | String | `"no_prepayment"` or `"prepayment_required"` |
| `availableCount` | Number | Number of rooms available at this price |
| `smokingAllowed` | Boolean | Whether smoking is allowed in this room |
| `imageUrl` | String | Room image URL (from picsum.photos) |

**Room count per property**: prop_1: 3 rooms, prop_2: 2, prop_3: 2, prop_4: 2, prop_5: 3, prop_6: 2, prop_7: 3, prop_8: 2, prop_9: 3, prop_10: 2, prop_11: 2, prop_12: 3. Total: 28 rooms.

---

### Review Object

| Key | Type | Description |
|-----|------|-------------|
| `id` | String | Review ID (format: `"review_<propNum>_<reviewNum>"`, e.g., `"review_1_1"`) |
| `propertyId` | String | FK to property |
| `authorName` | String | Reviewer first name |
| `authorCountry` | String | Reviewer country |
| `authorCountryCode` | String | 2-letter ISO country code |
| `date` | String | Review date (YYYY-MM-DD) |
| `score` | Number | Review score (0–10) |
| `title` | String | Review title |
| `positive` | String | Positive feedback text |
| `negative` | String | Negative feedback text (empty string `""` if none) |
| `roomType` | String | Name of room type stayed in |
| `nightsStayed` | Number | Duration of stay in nights |
| `travellerType` | String | One of: `"couple"`, `"solo"`, `"family"`, `"business"` |

**Review counts per property**: prop_1: 4, prop_2: 3, prop_3: 2, prop_4: 3, prop_5: 3, prop_6: 2, prop_7: 3, prop_8: 2, prop_9: 3, prop_10: 2, prop_11: 2, prop_12: 2. Total: 28 reviews.

---

### reviewCategories Object

Keyed by property ID (e.g., `"prop_1"`). Each value is an object with these numeric fields (all 0–10):

| Key | Description |
|-----|-------------|
| `staff` | Staff service rating |
| `facilities` | Facilities rating |
| `cleanliness` | Cleanliness rating |
| `comfort` | Comfort rating |
| `valueForMoney` | Value for money rating |
| `location` | Location rating |
| `freeWifi` | Free WiFi rating |

All 12 property IDs (`prop_1` through `prop_12`) have review category entries.

---

### Booking Object

| Key | Type | Description |
|-----|------|-------------|
| `id` | String | Booking ID — seed data uses `"booking_1"` etc.; new bookings use `"booking_<Date.now()>"` |
| `confirmationNumber` | String | 10-digit confirmation number (numeric string) |
| `pinCode` | String | 4-digit PIN code (numeric string) |
| `userId` | String | FK to user (e.g., `"user_1"`) |
| `propertyId` | String | FK to property |
| `propertyName` | String | Property name (denormalized copy) |
| `propertyImage` | String | Property thumbnail URL (denormalized copy) |
| `propertyCity` | String | Property city (denormalized copy) |
| `propertyAddress` | String | Property full address (denormalized copy) |
| `roomId` | String\|undefined | FK to room; `undefined` if no room was selected |
| `roomName` | String\|undefined | Room name (denormalized); `undefined` if no room |
| `checkIn` | String | Check-in date (YYYY-MM-DD) or `""` if not set |
| `checkOut` | String | Check-out date (YYYY-MM-DD) or `""` if not set |
| `nights` | Number | Number of nights |
| `guests` | Object | `{ adults: Number, children: Number }` |
| `rooms` | Number | Number of rooms booked |
| `pricePerNight` | Number | Price per night used for this booking |
| `totalPrice` | Number | Subtotal (pricePerNight × nights) |
| `taxesAndFees` | Number | Total taxes and fees (property.taxesAndFees × nights) |
| `grandTotal` | Number | Grand total (totalPrice + taxesAndFees) |
| `status` | String | `"confirmed"`, `"completed"`, or `"cancelled"` |
| `guestFirstName` | String | Guest first name |
| `guestLastName` | String | Guest last name |
| `guestEmail` | String | Guest email |
| `guestPhone` | String | Guest phone number |
| `specialRequests` | String | Special request text (may be empty string) |
| `arrivalTime` | String | Expected arrival time window (e.g., `"14:00 – 15:00"` or `"I don't know"`) |
| `freeCancellation` | Boolean | Whether free cancellation applies to this booking |
| `cancellationDeadline` | String\|null | Cancellation deadline date (YYYY-MM-DD); `null` if open-ended |
| `createdAt` | String | ISO 8601 timestamp of booking creation |

**Default bookings**:

| ID | Property | City | Check-in | Check-out | Status |
|----|----------|------|----------|-----------|--------|
| `booking_1` | Grand Plaza Hotel & Spa (prop_1) | New York | 2026-06-15 | 2026-06-20 | confirmed |
| `booking_2` | Shibuya Crossing Hotel (prop_7) | Tokyo | 2025-05-01 | 2025-05-05 | confirmed |
| `booking_3` | Hôtel Le Marais Charm (prop_4) | Paris | 2024-10-10 | 2024-10-13 | completed |

**Trips page tab logic**:
- **Upcoming**: `status === "confirmed"` AND checkout date is in the future (or not set)
- **Completed**: `status === "completed"` OR (`status === "confirmed"` AND checkout date is in the past)
- **Cancelled**: `status === "cancelled"`

---

### searchParams Object

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `destination` | String | `""` | Search destination text (free text, may not match a destination name exactly) |
| `destinationId` | String\|null | `null` | Selected destination ID (set when user picks from autocomplete dropdown) |
| `checkIn` | String\|null | `null` | Check-in date (YYYY-MM-DD) |
| `checkOut` | String\|null | `null` | Check-out date (YYYY-MM-DD) |
| `adults` | Number | `2` | Number of adults |
| `children` | Number | `0` | Number of children (ages 0–17) |
| `childrenAges` | Array | `[]` | Ages of children (not populated by the UI in the current implementation) |
| `rooms` | Number | `1` | Number of rooms requested |
| `travelingForWork` | Boolean | `false` | Business travel flag (not populated by the UI in the current implementation) |

---

### searchFilters Object

Note: The Search page sidebar uses **local React component state** for its filter controls; those local values are NOT automatically written to `searchFilters` in the store. The store's `searchFilters` is updated only when `setSearchFilters()` is called explicitly (which the Search page currently does not do — it calls `resetFilters()` only via "Clear all"). This means `searchFilters` in the store may not reflect what the user sees on the Search page unless state is injected via the API.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `priceMin` | Number\|null | `null` | Minimum price filter |
| `priceMax` | Number\|null | `null` | Maximum price filter |
| `starRating` | Array\<Number\> | `[]` | Star rating filter (e.g., `[4, 5]`) |
| `reviewScore` | Number\|null | `null` | Minimum review score threshold |
| `propertyType` | Array\<String\> | `[]` | Property type filter values |
| `facilities` | Array\<String\> | `[]` | Facility filter values |
| `freeCancellation` | Boolean | `false` | Show only free cancellation properties |
| `breakfastIncluded` | Boolean | `false` | Show only breakfast-included properties |
| `geniusDeals` | Boolean | `false` | Show only Genius deal properties (not implemented in sidebar UI, but field exists) |
| `sortBy` | String | `"our_top_picks"` | Sort order: `"our_top_picks"`, `"price_low"`, `"price_high"`, `"review_score"`, `"stars_high"` |

---

### RecentSearch Object

| Key | Type | Description |
|-----|------|-------------|
| `destination` | String | Destination name |
| `destinationId` | String | Destination ID |
| `dates` | String | Date range display string (e.g., `"2026-05-01 – 2026-05-05"` or `"Any dates"`) |
| `guests` | String | Guest summary (e.g., `"2 adults · 0 children · 1 room"`) |

**Default recent searches** (2 entries):
1. New York (`dest_1`), dates: `"Mar 15 – Mar 18"`, guests: `"2 adults · 0 children · 1 room"`
2. Tokyo (`dest_4`), dates: `"May 1 – May 5"`, guests: `"2 adults · 0 children · 1 room"`

---

## Context Actions (StoreContext)

All actions are available via `useAppContext()`. They all call `updateCurrentState()` internally and trigger a localStorage save.

| Action | Signature | State Changed | Notes |
|--------|-----------|---------------|-------|
| `setSearchParams` | `(params: Partial<searchParams>) => void` | `searchParams` | Shallow-merges into existing searchParams |
| `setSearchFilters` | `(filters: Partial<searchFilters>) => void` | `searchFilters` | Shallow-merges into existing searchFilters |
| `resetFilters` | `() => void` | `searchFilters` | Resets all searchFilters to default values |
| `viewProperty` | `(propertyId: string) => void` | `selectedPropertyId`, `viewedProperties`, `recentlyViewed` | Only adds to `viewedProperties` if not already present (dedup); always prepends to `recentlyViewed` (max 10) |
| `toggleSaveProperty` | `(propertyId: string) => void` | `user.savedProperties` | Adds if absent, removes if present |
| `addBooking` | `(booking: Booking) => void` | `bookings` | Appends new booking to the array |
| `cancelBooking` | `(bookingId: string) => void` | `bookings` | Sets `status` to `"cancelled"` on the matching booking |
| `updateBooking` | `(bookingId: string, updates: Partial<Booking>) => void` | `bookings` | Shallow-merges `updates` into the matching booking; available but not called by any page in the current implementation |
| `addRecentSearch` | `(search: RecentSearch) => void` | `recentSearches` | Prepends; deduplicates by `destinationId`; max 5 entries |
| `updateCurrentState` | `(updater: Function\|Object) => void` | any field | Low-level escape hatch; used by Navbar sign-in/sign-out |

---

## Tracked State Diff Fields

The `/go` React page computes a diff over these 7 tracked fields only (client-side `computeStateDiff`):

| Field | Path |
|-------|------|
| `bookings` | `current_state.bookings` |
| `user.savedProperties` | `current_state.user.savedProperties` |
| `searchParams` | `current_state.searchParams` |
| `searchFilters` | `current_state.searchFilters` |
| `viewedProperties` | `current_state.viewedProperties` |
| `recentlyViewed` | `current_state.recentlyViewed` |
| `recentSearches` | `current_state.recentSearches` |

The server-side `/go` endpoint compares ALL top-level keys (not just the 7 tracked fields) using `JSON.stringify` equality.

---

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed | Details |
|-------------|---------------------|---------|
| Search via search bar | `searchParams` | Updates destination, destinationId, checkIn, checkOut, adults, children, rooms |
| Search adds to recent | `recentSearches` | New entry prepended; deduplicated by destinationId; max 5 |
| Navigate to property detail | `selectedPropertyId`, `viewedProperties`, `recentlyViewed` | `viewProperty` is called on mount; deduped in `viewedProperties` |
| Click heart/save icon | `user.savedProperties` | Property ID toggled in/out of array |
| Complete checkout form | `bookings` | New booking object appended with `status: "confirmed"` |
| Cancel booking (Trips or Confirmation page) | `bookings` | Matching booking `status` changed to `"cancelled"` |
| Reset sidebar filters | `searchFilters` | All filter fields reset to defaults (note: sidebar UI uses local state; only "Clear all" resets the store) |
| Sign out (Navbar) | `user` | Set to `null` |
| Sign in (Navbar) | `user` | Restored to `user_1` defaults, preserving `savedProperties` |

---

## Minimal Inject Example

```json
{
  "user": {
    "firstName": "Alex",
    "lastName": "Chen",
    "email": "alex.chen@example.com",
    "phone": "+1 (555) 999-0000",
    "country": "Australia",
    "nationality": "Australian",
    "geniusLevel": 1,
    "geniusBookings": 0,
    "geniusBookingsRequired": 5,
    "currency": "USD",
    "language": "English (US)",
    "savedProperties": []
  },
  "bookings": [],
  "searchParams": {
    "destination": "Paris",
    "destinationId": "dest_2",
    "checkIn": null,
    "checkOut": null,
    "adults": 2,
    "children": 0,
    "rooms": 1
  },
  "recentSearches": [],
  "recentlyViewed": [],
  "viewedProperties": []
}
```

## Inject Example: Pre-configured Search for Tokyo Hotels

```json
{
  "searchParams": {
    "destination": "Tokyo",
    "destinationId": "dest_4",
    "checkIn": "2026-05-01",
    "checkOut": "2026-05-05",
    "adults": 2,
    "children": 0,
    "rooms": 1
  },
  "searchFilters": {
    "starRating": [4, 5],
    "freeCancellation": true,
    "sortBy": "review_score"
  }
}
```

## Inject Example: User with Existing Confirmed Booking

```json
{
  "user": {
    "id": "user_1",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@email.com",
    "phone": "+1 (555) 123-4567",
    "country": "United States",
    "nationality": "American",
    "avatarUrl": null,
    "geniusLevel": 1,
    "geniusBookings": 2,
    "geniusBookingsRequired": 5,
    "currency": "USD",
    "language": "English (US)",
    "savedProperties": ["prop_2", "prop_5"]
  },
  "bookings": [
    {
      "id": "booking_1",
      "confirmationNumber": "2847193650",
      "pinCode": "4829",
      "userId": "user_1",
      "propertyId": "prop_1",
      "propertyName": "Grand Plaza Hotel & Spa",
      "propertyImage": "https://picsum.photos/seed/prop1a/400/300",
      "propertyCity": "New York",
      "propertyAddress": "123 Broadway, Manhattan, New York, NY 10001",
      "roomId": "room_1_2",
      "roomName": "Deluxe King Room",
      "checkIn": "2026-06-15",
      "checkOut": "2026-06-20",
      "nights": 5,
      "guests": { "adults": 2, "children": 0 },
      "rooms": 1,
      "pricePerNight": 259,
      "totalPrice": 1295,
      "taxesAndFees": 194,
      "grandTotal": 1489,
      "status": "confirmed",
      "guestFirstName": "Sarah",
      "guestLastName": "Johnson",
      "guestEmail": "sarah.johnson@email.com",
      "guestPhone": "+1 (555) 123-4567",
      "specialRequests": "Late check-in, around 10 PM please",
      "arrivalTime": "22:00 – 23:00",
      "freeCancellation": true,
      "cancellationDeadline": "2026-06-12",
      "createdAt": "2026-02-01T10:30:00Z"
    }
  ]
}
```
