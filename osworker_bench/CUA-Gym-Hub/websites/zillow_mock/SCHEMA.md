# zillow_mock Schema

**Deploy order**: 62 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8062)
**Base URL**: `http://172.17.46.46:8062/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{files: [{url, original_name, stored_name, size, content_type}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Hero landing page (default view) or filtered search results with map |
| `/property/:id` | PropertyDetail | Full property detail page with gallery, Zestimate, tour scheduling, agent contact, back-to-results navigation |
| `/saved` | SavedHomes | Saved properties and saved searches/alerts (delete search, toggle alerts) |
| `/mortgage` | Mortgage | Mortgage calculator with current rate display and HOA fee input |
| `/agent-finder` | AgentFinder | Search and browse real estate agents |
| `/sell` | Sell | Seller tools: Zestimate lookup, FSBO listing modal, seller resource modals, listing agents |
| `/go` | Go | State inspection / debug endpoint (SPA route, no `?sid=` needed) |

## API Endpoint Behavior

### `POST /post?sid=<sid>`

Three actions are supported:

| Action | Body | Effect |
|--------|------|--------|
| `set` | `{"action":"set","state":{...}}` | Writes `<sid>.json` (current state) **and** `<sid>.initial.json` (initial state). Both files are set to the same payload. This is used to inject the starting state for a task. After a `set`, `state_diff` in `/go` will be empty until the agent makes changes. |
| `set_current` | `{"action":"set_current","state":{...}}` | Writes only `<sid>.json`. Never touches `.initial.json`. Used by `golden_patch.py` to write the expected final state for task evaluation without resetting the baseline. |
| `reset` | `{"action":"reset"}` | Deletes `<sid>.json`. The browser reverts to application defaults on next load. |

All three actions accept an optional `"merge": true` flag (for `set` and `set_current`), which deep-merges the provided state onto the existing file rather than replacing it.

### `GET /go?sid=<sid>`

Returns:
```json
{
  "initial_state": { ... },
  "current_state": { ... },
  "state_diff": { "<key>": { "modified": <newValue> } }
}
```

- `initial_state` is read from `<sid>.initial.json` (written by `action=set`).
- `current_state` is read from `<sid>.json` (written by the browser on every state change via `saveState`).
- `state_diff` computes top-level key differences between initial and current. Keys are reported as `{ "added": <value> }` if missing from initial or `{ "modified": <value> }` if changed.
- If `?sid=` is omitted, the SPA's own `/go` route renders the debug JSON page instead (reads from `localStorage` via the browser).

### `GET /state?sid=<sid>`

Used internally by the SPA on startup to fetch any injected custom state. Returns:
```json
{ "stored_state": {...} | null, "has_custom_state": true | false, "sid": "..." }
```

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Active user profile and saved items |
| `filters` | object | Current property search/filter state |
| `properties` | array | All property listings (25 default) |
| `agents` | array | Real estate agents (10 default) |
| `savedSearches` | array | Full saved search objects with filter criteria |
| `searchSuggestions` | array | Autocomplete suggestions for search (cities, neighborhoods, ZIP codes) |
| `mortgageRates` | array | Current mortgage rate data |
| `tours` | array | Scheduled property tours (empty by default) |
| `contactMessages` | array | Contact-agent messages sent by user (empty by default) |

### `user` object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `userId` | string | `"user-1"` | Unique user identifier |
| `name` | string | `"Sarah Chen"` | Full name |
| `email` | string | `"sarah.chen@email.com"` | Email address |
| `phone` | string | `"(415) 555-0142"` | Phone number |
| `avatar` | string\|null | `null` | Avatar URL |
| `isSignedIn` | boolean | `false` | Whether the user is currently signed in. Toggled by the Sign In / Sign Out button in the Navbar. |
| `savedProperties` | string[] | `["prop-2", "prop-5", "prop-8"]` | Array of saved property IDs |
| `savedSearches` | string[] | `["search-1", "search-2"]` | Array of saved search IDs (references `savedSearches[].id`) |
| `recentlyViewed` | string[] | `["prop-1", "prop-3", "prop-7", "prop-12"]` | Array of recently viewed property IDs (most recent first, capped at 20) |

### `filters` object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | `""` | Free-text search query (address, city, ZIP, neighborhood) |
| `listingStatus` | string | `"For Sale"` | One of: `"For Sale"`, `"For Rent"`, `"Pending"`, `"Recently Sold"`, `"All"` |
| `minPrice` | number | `0` | Minimum price filter |
| `maxPrice` | number | `10000000` | Maximum price filter |
| `minBeds` | number | `0` | Minimum bedrooms (0 = any) |
| `minBaths` | number | `0` | Minimum bathrooms (0 = any) |
| `minSqft` | number | `0` | Minimum square footage |
| `maxSqft` | number | `100000` | Maximum square footage |
| `type` | string | `"All"` | Property type: `"All"`, `"Single Family"`, `"Condo"`, `"Townhouse"`, `"Apartment"` |
| `features` | string[] | `[]` | Required features (e.g. `["Garage", "Fireplace", "Pool"]`) |
| `sortBy` | string | `"Homes for You"` | Sort order: `"Homes for You"`, `"Price (Low to High)"`, `"Price (High to Low)"`, `"Newest"`, `"Bedrooms"`, `"Square Feet"` |

### `properties[]` array (25 default properties)

Each property object:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (`"prop-1"` through `"prop-25"`) |
| `zpid` | string | Xillow property ID |
| `address` | string | Street address |
| `city` | string | City name |
| `state` | string | State abbreviation (e.g. `"CA"`) |
| `zip` | string | ZIP code |
| `neighborhood` | string | Neighborhood name |
| `price` | number | Listing price (sale) or monthly rent |
| `zestimate` | number\|null | Xillow estimated value (null for rentals) |
| `zestimateRange` | object\|null | `{low: number, high: number}` or null |
| `rentZestimate` | number\|null | Estimated monthly rent |
| `beds` | number | Number of bedrooms |
| `baths` | number | Number of bathrooms (supports .5 for half baths) |
| `sqft` | number | Square footage |
| `lotSize` | number | Lot size in sqft (0 for condos/apartments) |
| `yearBuilt` | number | Year built |
| `type` | string | `"Single Family"`, `"Condo"`, `"Townhouse"`, `"Apartment"` |
| `propertyType` | string | Same as `type` (duplicated for compatibility) |
| `listingStatus` | string | `"For Sale"`, `"For Rent"`, `"Recently Sold"`, `"Pending"` |
| `listingType` | string | `"Agent Listed"`, `"For Sale By Owner"` |
| `daysOnZillow` | number | Days listed on Xillow |
| `description` | string | Property description text |
| `features` | string[] | Array of feature strings |
| `coordinates` | number[] | `[latitude, longitude]` for map display |
| `images` | string[] | Array of image URLs |
| `agentId` | string | ID of listing agent (references `agents[].id`) |
| `tags` | string[] | Tags: `"New Listing"`, `"Price Cut"`, `"Hot Home"`, `"Open House"`, `"For Sale By Owner"` |
| `openHouse` | string\|null | Open house schedule text or null |
| `hoaFee` | number\|null | Monthly HOA fee or null |
| `propertyTax` | number\|null | Annual property tax or null (null for rentals and some pending/sold) |
| `walkScore` | number\|null | Walk Score (0-100) |
| `transitScore` | number\|null | Transit Score (0-100) |
| `bikeScore` | number\|null | Bike Score (0-100) |
| `priceHistory` | array | `[{date: string, event: string, price: number, source: string}]` |
| `taxHistory` | array | `[{year: number, propertyTax: number, taxAssessment: number}]` |
| `schools` | array | `[{name, level, grades, rating, distance, type}]` |
| `estimatedPayment` | object\|null | `{total, principalAndInterest, propertyTax, homeInsurance, hoa, mortgageInsurance}` or null (null for rentals, recently sold, and some pending) |

#### Default property distribution

| Status | Type | Count | IDs |
|--------|------|-------|-----|
| For Sale | Single Family | 8 | prop-1 through prop-8 |
| For Sale | Condo | 5 | prop-9 through prop-13 |
| For Sale | Townhouse | 3 | prop-14 through prop-16 |
| For Rent | Apartment | 3 | prop-17 through prop-19 |
| For Rent | Single Family | 2 | prop-20, prop-21 |
| Recently Sold | Single Family | 2 | prop-22, prop-23 |
| Pending | Single Family | 1 | prop-24 |
| Pending | Condo | 1 | prop-25 |

#### Notable property flags

- `prop-7` is the only `"For Sale By Owner"` listing in the default dataset (`listingType: "For Sale By Owner"`, `tags: ["For Sale By Owner"]`).
- Condos and apartments always have `lotSize: 0`.
- Rental properties (`listingStatus: "For Rent"`) have `zestimate: null`, `zestimateRange: null`, `propertyTax: null`, `estimatedPayment: null`, and empty `priceHistory`/`taxHistory`.

### `agents[]` array (10 default agents)

Each agent object:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (`"agent-1"` through `"agent-10"`) |
| `name` | string | Full name |
| `photo` | string\|null | Photo URL (null by default for all agents) |
| `phone` | string | Phone number |
| `email` | string | Email address |
| `brokerage` | string | Brokerage company name |
| `rating` | number | Rating (1-5 scale, e.g. 4.9) |
| `reviewCount` | number | Number of reviews |
| `recentSales` | number | Number of recent sales |
| `activeListings` | number | Number of active listings |
| `specialties` | string[] | `"Buyer's Agent"`, `"Listing Agent"`, `"Relocation"`, `"Luxury Homes"`, `"Short Sales"`, `"Investment Properties"`, `"Staging"`, `"Rentals"` |
| `serviceAreas` | string[] | Array of city/area names |
| `isFeatured` | boolean | Whether agent is featured |
| `isTeam` | boolean | Optional. Present and `true` on some agents to indicate a team rather than an individual agent. Absent (undefined) on agents who are individuals. |
| `bio` | string | Agent biography text |

#### Default agent table

| ID | Name | Brokerage | Featured | isTeam |
|----|------|-----------|----------|--------|
| `agent-1` | Jennifer Martinez | Compass Real Estate | true | — |
| `agent-2` | David Kim | Coldwell Banker Realty | true | — |
| `agent-3` | Lisa Chen | Keller Williams SF | false | — |
| `agent-4` | Robert Williams | Sotheby's International Realty | true | true |
| `agent-5` | Sarah O'Brien | Compass Real Estate | false | — |
| `agent-6` | Marcus Johnson | RE/MAX Gold | false | — |
| `agent-7` | Amy Nguyen | Compass Real Estate | false | true |
| `agent-8` | James Park | Keller Williams East Bay | false | — |
| `agent-9` | Elena Rodriguez | Sotheby's International Realty | false | — |
| `agent-10` | Kevin Thompson | Coldwell Banker Realty | false | — |

### `savedSearches[]` array

Each saved search object:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (e.g. `"search-1"`, `"search-2"`, or `"s{timestamp}"` for new saves) |
| `name` | string | User-assigned search name |
| `location` | string | Location description (optional display label) |
| `filters` | object | Subset of the `filters` object with search criteria |
| `createdAt` | string | ISO 8601 timestamp |
| `newListings` | number | Count of new matching listings |
| `emailAlerts` | boolean | Whether email alerts are enabled. Toggled by the bell icon on the SavedHomes page. |

#### Default saved searches

| ID | Name | Location Filter | Price Range | Beds | Type |
|----|------|----------------|-------------|------|------|
| `search-1` | SF Under 900K | San Francisco, CA | $500k-$900k | 2+ | All |
| `search-2` | Oakland Family Homes | Oakland, CA | $600k-$1.2M | 3+ / 2+ baths | Single Family |

### `searchSuggestions[]` array (41 default entries)

Each suggestion:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | `"sug-1"` through `"sug-41"` |
| `text` | string | Display text (city, neighborhood, or ZIP) |
| `type` | string | `"city"`, `"neighborhood"`, or `"zip"` |
| `subtext` | string | Description (e.g. `"City in California"`, `"Neighborhood in San Francisco, CA"`) |

Default entries cover: 7 cities (San Francisco, Oakland, Berkeley, San Jose, Palo Alto, Mountain View, San Mateo), 15 SF neighborhoods, 4 Oakland neighborhoods, and 15 ZIP codes across SF, Oakland, and Berkeley.

### `mortgageRates[]` array (5 default rates)

Each rate:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Rate type name (e.g. `"30-Year Fixed"`, `"15-Year Fixed"`, `"5/1 ARM"`) |
| `rate` | number | Interest rate percentage |
| `apr` | number | APR percentage |
| `lastUpdated` | string | Date string (e.g. `"2024-12-01"`) |

#### Default rates

| Type | Rate | APR |
|------|------|-----|
| 30-Year Fixed | 6.89% | 6.95% |
| 20-Year Fixed | 6.67% | 6.74% |
| 15-Year Fixed | 6.12% | 6.21% |
| 5/1 ARM | 6.45% | 7.01% |
| 7/1 ARM | 6.55% | 6.98% |

### `tours[]` array (empty by default)

Each tour object (created when user schedules a tour on PropertyDetail):

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (e.g. `"t{timestamp}"`) |
| `propertyId` | string | Reference to property ID |
| `date` | string | Tour date (YYYY-MM-DD) |
| `time` | string | Tour time (e.g. `"10:00 AM"`, `"2:00 PM"`) |
| `type` | string | `"in-person"` or `"video"` |
| `userId` | string | User who scheduled the tour |
| `name` | string | Contact name (pre-filled from `user.name`) |
| `email` | string | Contact email (pre-filled from `user.email`) |
| `phone` | string | Contact phone (pre-filled from `user.phone`) |
| `status` | string | Always `"pending"` when created |

### `contactMessages[]` array (empty by default)

Each contact message (created when user submits the "Contact Agent" form on PropertyDetail):

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID (e.g. `"msg-{timestamp}"`) |
| `propertyId` | string | Reference to property ID |
| `agentId` | string | Reference to agent ID |
| `name` | string | Sender name |
| `email` | string | Sender email |
| `phone` | string | Sender phone |
| `message` | string | Message body text |
| `sentAt` | string | ISO 8601 timestamp when message was sent |

## Store Actions

These are the functions exposed via `useStore()` in the React context. Each mutates `state` and triggers a `saveState()` call to localStorage (and thus updates `current_state` observable via `/go`).

| Action | Signature | State Effect |
|--------|-----------|--------------|
| `toggleSaveProperty` | `(propertyId: string) => void` | Adds `propertyId` to `user.savedProperties` if absent; removes it if present |
| `scheduleTour` | `(tourData: object) => void` | Appends `{...tourData, id: "t{timestamp}", status: "pending"}` to `tours` array |
| `saveSearch` | `(searchData: object) => void` | Appends new search object to `savedSearches`; appends new ID to `user.savedSearches`. Normalizes `alertsEnabled` key to `emailAlerts`. |
| `updateFilters` | `(newFilters: object) => void` | Replaces `filters` with the provided object |
| `toggleSignIn` | `() => void` | Flips `user.isSignedIn` boolean |
| `addRecentlyViewed` | `(propertyId: string) => void` | Prepends `propertyId` to `user.recentlyViewed`, removes duplicates, caps at 20 entries |
| `sendContactMessage` | `(messageData: object) => void` | Appends `{...messageData, id: "msg-{timestamp}", sentAt: <ISO>}` to `contactMessages` array |
| `deleteSavedSearch` | `(searchId: string) => void` | Removes `searchId` from `user.savedSearches` array and removes the matching object from `savedSearches` array |
| `toggleSearchAlerts` | `(searchId: string) => void` | Flips `emailAlerts` boolean on the `savedSearches` entry matching `searchId` |
| `resetData` | `() => void` | Clears localStorage and resets state to application defaults |
| `getDiff` | `() => object` | Returns diff between `initialState` and current `state` (same format as `/go` `state_diff`) |
| `getDebugState` | `() => object` | Returns `{initial_state, current_state, state_diff}` — same payload as `/go` endpoint |

## Page Behaviors and UI Features

### Navbar (`/`)

- **Search bar**: Live autocomplete from `state.searchSuggestions`. Selecting a suggestion or pressing Enter calls `updateFilters({...state.filters, search: query})` and navigates to `/`.
- **Buy / Rent / Sell dropdowns**: Each opens a dropdown menu. Buy/Rent options call `updateFilters` to set `listingStatus` and/or `type`. Sell options link to `/sell` or `/agent-finder`.
- **Saved heart icon**: Shows badge count of `user.savedProperties.length`. Links to `/saved`.
- **Sign In / Sign Out button**: When `user.isSignedIn` is `false`, shows "Sign In" which opens `SignInModal`. When `true`, shows "Sign Out" which calls `toggleSignIn()` directly.

#### SignInModal

A modal form with email and password fields. On successful submission (both fields non-empty), calls `toggleSignIn()` setting `user.isSignedIn = true`. The email value entered is not persisted to state — only the sign-in status flag changes. Validation errors are shown inline.

### Home (`/`)

- **Hero mode**: Shown when `filters.search` is empty and `filters.listingStatus` is `"For Sale"` and `filters.type` is `"All"`. Displays a hero banner with a large search input.
- **Search results mode**: Shown when any search/filter is applied. Renders a split-pane view (property cards + Leaflet map). Switching between hero and results mode is entirely driven by `filters` state changes.
- **FilterBar**: Sets all `filters` fields via `updateFilters`. Has a "Save Search" button that calls `saveSearch(...)`.

### PropertyDetail (`/property/:id`)

- **Back to Results**: A "Back to Results" button at the top calls `navigate(-1)` to return to the previous page in history.
- **Gallery**: Opens a full-screen image carousel. Images are cycled from `property.images` to fill up to 25 slots.
- **Save/Unsave (heart icon)**: Calls `toggleSaveProperty(property.id)`.
- **Share dropdown**: Copy link, Email, Facebook, Twitter options. No state change.
- **Mortgage Calculator** (inline on PropertyDetail): Computes monthly payment using down payment %, interest rate, and loan term. HOA fee is taken directly from `property.hoaFee`. No state change — client-side only.
- **Schedule Tour form**: Requires selecting a date. On submit calls `scheduleTour({propertyId, userId, date, time, type, name, email, phone})`. Appends to `tours[]`.
- **Contact Agent form**: On submit calls `sendContactMessage({propertyId, agentId, name, email, phone, message})`. Appends to `contactMessages[]`.
- **Recently viewed**: On mount, calls `addRecentlyViewed(property.id)` which prepends to `user.recentlyViewed`.

### SavedHomes (`/saved`)

- **Saved Searches section**: Lists searches from `state.savedSearches` resolved via `user.savedSearches` ID array.
  - **Delete**: Trash icon calls `deleteSavedSearch(searchId)`, removes from both `savedSearches[]` and `user.savedSearches[]`.
  - **Toggle Alerts**: Bell icon calls `toggleSearchAlerts(searchId)`, flips `emailAlerts` on the search object.
  - **View Results**: Calls `updateFilters(search.filters)` and navigates to `/`.
- **Saved Homes section**: Lists properties matching `user.savedProperties`. Remove button (X) calls `toggleSaveProperty(propertyId)`.

### Sell (`/sell`)

- **Zestimate Lookup**: Enter an address and click "Estimate". Tries to match address text against `state.properties`. Shows the matched property's `zestimate` or a randomly generated value. No state change.
- **Find a Selling Agent button**: Navigates to `/agent-finder`.
- **List For Sale By Owner button**: Opens `FSBOModal`.
- **Seller Resource cards**: Clicking any of the 4 resource cards opens `ResourceModal` with detailed article content. No state change.

#### FSBOModal

A modal form with name (required), email (required), phone (optional), and listing price (required). On submit (all required fields valid), shows a confirmation screen ("Listing Submitted!"). No state change — UI confirmation only, not persisted to store.

#### ResourceModal

Displays article content for one of four topics: "When Is the Best Time to Sell?", "How to Stage Your Home", "Understanding Closing Costs", or "FSBO vs. Agent: Which Is Right for You?". No state change.

### Mortgage (`/mortgage`)

A standalone mortgage calculator with five inputs:
- **Home Price** (number input, default $500,000)
- **Down Payment** (% slider 0-50%, default 20%)
- **Interest Rate** (number input with 0.1 step, default 6.5%)
- **Loan Term** (select: 30, 20, 15 years; default 30)
- **HOA Fees** (monthly, number input, default $0)

Clicking any rate card in the "Current Mortgage Rates" panel sets `interestRate` and `loanTerm` to match. Payment breakdown shows Principal & Interest, Property Taxes (1.2%/yr of home price), Home Insurance (0.5%/yr of home price), and HOA Fees (if > 0). All calculations are client-side only — no state change.

### AgentFinder (`/agent-finder`)

Client-side search and filter over `state.agents`. Filter options include name search, specialty, and brokerage. No state change.

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8062/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {
          "userId": "user-1",
          "name": "Sarah Chen",
          "email": "sarah.chen@email.com",
          "phone": "(415) 555-0142",
          "avatar": null,
          "isSignedIn": false,
          "savedProperties": [],
          "savedSearches": [],
          "recentlyViewed": []
        },
        "filters": {
          "search": "",
          "listingStatus": "For Sale",
          "minPrice": 0,
          "maxPrice": 10000000,
          "minBeds": 0,
          "minBaths": 0,
          "minSqft": 0,
          "maxSqft": 100000,
          "type": "All",
          "features": [],
          "sortBy": "Homes for You"
        },
        "properties": [
          {
            "id": "prop-1",
            "zpid": "29384756",
            "address": "2847 Pacific Avenue",
            "city": "San Francisco",
            "state": "CA",
            "zip": "94115",
            "neighborhood": "Pacific Heights",
            "price": 2450000,
            "zestimate": 2510000,
            "zestimateRange": {"low": 2380000, "high": 2640000},
            "rentZestimate": 8500,
            "beds": 5,
            "baths": 3.5,
            "sqft": 3200,
            "lotSize": 3800,
            "yearBuilt": 1912,
            "type": "Single Family",
            "propertyType": "Single Family",
            "listingStatus": "For Sale",
            "listingType": "Agent Listed",
            "daysOnZillow": 8,
            "description": "Magnificent Pacific Heights Victorian with sweeping Bay views.",
            "features": ["Bay View", "Hardwood Floors", "Fireplace"],
            "coordinates": [37.7920, -122.4350],
            "images": ["https://picsum.photos/seed/p1a/800/600"],
            "agentId": "agent-1",
            "tags": ["Open House"],
            "openHouse": "Sat 1-4pm",
            "hoaFee": null,
            "propertyTax": 24500,
            "walkScore": 92,
            "transitScore": 85,
            "bikeScore": 72,
            "priceHistory": [
              {"date": "2024-11-01", "event": "Listed for sale", "price": 2450000, "source": "MLS"}
            ],
            "taxHistory": [
              {"year": 2023, "propertyTax": 24500, "taxAssessment": 2040000}
            ],
            "schools": [
              {"name": "Sherman Elementary", "level": "Elementary", "grades": "K-5", "rating": 8, "distance": "0.3 mi", "type": "Public"}
            ],
            "estimatedPayment": {"total": 14200, "principalAndInterest": 10800, "propertyTax": 2042, "homeInsurance": 1020, "hoa": 0, "mortgageInsurance": 0}
          }
        ],
        "agents": [
          {
            "id": "agent-1",
            "name": "Jennifer Martinez",
            "photo": null,
            "phone": "(415) 555-0198",
            "email": "jennifer.m@compass.com",
            "brokerage": "Compass Real Estate",
            "rating": 4.9,
            "reviewCount": 187,
            "recentSales": 62,
            "activeListings": 14,
            "specialties": ["Buyer's Agent", "Listing Agent"],
            "serviceAreas": ["San Francisco", "Daly City"],
            "isFeatured": true,
            "bio": "15+ years helping families find their dream home in San Francisco."
          }
        ],
        "savedSearches": [],
        "searchSuggestions": [
          {"id": "sug-1", "text": "San Francisco, CA", "type": "city", "subtext": "City in California"}
        ],
        "mortgageRates": [
          {"type": "30-Year Fixed", "rate": 6.89, "apr": 6.95, "lastUpdated": "2024-12-01"}
        ],
        "tours": [],
        "contactMessages": []
      }
    }
  }
}
```

## Observable State Changes (for RL evaluation)

| User Action | State Field(s) Changed | Notes |
|-------------|------------------------|-------|
| Save a property (heart icon) | `user.savedProperties` gains property ID | |
| Unsave a property (heart icon or X on SavedHomes) | `user.savedProperties` loses property ID | |
| Sign in via SignInModal | `user.isSignedIn` → `true` | Email/password not stored |
| Sign out via Navbar button | `user.isSignedIn` → `false` | |
| Schedule a property tour | `tours[]` grows by 1 with `{id, propertyId, date, time, type, userId, name, email, phone, status: "pending"}` | Requires date selection |
| Contact an agent | `contactMessages[]` grows by 1 with `{id, propertyId, agentId, name, email, phone, message, sentAt}` | Previously no state change |
| Save a search (from FilterBar) | `savedSearches[]` grows by 1; `user.savedSearches[]` gains new search ID | |
| Delete a saved search (trash icon on SavedHomes) | Entry removed from `savedSearches[]`; ID removed from `user.savedSearches[]` | |
| Toggle email alerts (bell icon on SavedHomes) | `savedSearches[].emailAlerts` flips for the matching search | |
| View Results from SavedHomes | `filters` object updated to match saved search filters | Navigates to `/` |
| Change search/filter criteria | `filters` fields updated | |
| Reset all filters | `filters` reset to default values | |
| Navigate to property detail | `user.recentlyViewed` prepended with property ID (capped at 20) | |
| Use standalone Mortgage calculator | No state change | Client-side only |
| Look up Zestimate on Sell page | No state change | Client-side only |
| Submit FSBO listing form (Sell page) | No state change | UI confirmation only |
| Open Seller Resource modal (Sell page) | No state change | UI only |
| Filter agents on AgentFinder | No state change | Client-side filtering only |

## Notes

- **State Management**: Uses React Context (`StoreProvider`) with `useState` hooks. State is auto-saved to localStorage on every change via `saveState()`.
- **State Normalization**: Custom state injected via `/post` is deep-merged with defaults. Array items in `properties` and `tours` are normalized with fallback defaults for all fields via `normalizeProperty()` and `normalizeTour()`. The `agents`, `savedSearches`, `searchSuggestions`, and `mortgageRates` arrays are replaced wholesale (no per-item normalization).
- **Initial State Tracking**: On first load with a `?sid=`, the app checks `localStorage` for an existing `zillow_mock_initial_state_<sid>` key. If absent, it fetches from `/state?sid=` and writes both state and initial-state keys to localStorage. This ensures that page refreshes do not reset `initial_state` to the server-side value. The `/go?sid=` endpoint reads from `.initial.json` (written by `action=set`) as the authoritative initial state.
- **Map Integration**: Uses Leaflet (`react-leaflet`) with OpenStreetMap tiles. Properties display as price-labeled markers at their `coordinates`.
- **Hero vs Search View**: The Home page shows a hero landing page when `filters.search` is empty and `filters.listingStatus` is `"For Sale"` and `filters.type` is `"All"`. Any search or filter change switches to a split-pane search results + map view.
- **Session Support**: Full `?sid=` query parameter support for isolated sessions. Per-session state files stored in `.mock-states/<sid>.json` and `.mock-states/<sid>.initial.json`. Sessions without `?sid=` use `.mock-state.json` and `.mock-state.initial.json` at the project root.
- **Styling**: Tailwind CSS with a custom `brand` color palette (Xillow blue `#006AFF`).
- **`isTeam` field**: Present only on agents who represent a team (`agent-4` Robert Williams, `agent-7` Amy Nguyen). Absent (not `false`) on individual agents. Consumers should use `!!agent.isTeam` to check.
