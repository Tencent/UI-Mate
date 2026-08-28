# google_flights_mock Schema

**Deploy order**: 20 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8020)
**Base URL**: `http://172.17.46.46:8020/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**State endpoint**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Landing page with search form and popular destinations |
| `/results` | Results | Flight search results with filters, sort tabs, price insights |
| `/booking` | Booking | Multi-step booking flow (passenger info, seat selection, payment) |
| `/tracked` | Tracked | View and manage tracked price routes |
| `/explore` | Explore | Map-based destination explorer with price pins |
| `/go` | Go | State inspection endpoint (JSON) |

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `airports` | array | All supported airports (see Airport object below) |
| `airlines` | array | All supported airlines (see Airline object below) |
| `flights` | array | Generated flight itineraries (see Flight object below) |
| `segments` | object | Map of segment ID → Segment object (see below) |
| `search` | object | Current search parameters (see Search object below) |
| `filters` | object | Active result filters (see Filters object below) |
| `selectedOutboundFlight` | string\|null | ID of selected outbound flight (e.g. `"fl_42"`) |
| `selectedReturnFlight` | string\|null | ID of selected return flight (e.g. `"fl_87"`) |
| `bookings` | array | Completed bookings (see Booking object below) |
| `priceAlerts` | array | Price alerts (see PriceAlert object below) |
| `trackedRoutes` | array | Routes being tracked for price changes (see TrackedRoute below) |
| `activeTab` | string | Sort tab on results page: `"best"`, `"cheapest"`, or `"fastest"` |
| `dateViewMode` | string | Date view mode: `"calendar"` |
| `popularDestinations` | array | Popular destination cards on home page (see PopularDestination below) |
| `priceCalendar` | array | 60-day price calendar for default route (see PriceCalendarEntry below) |
| `user` | object | Current user: `{id, name, email}` |

### Airport Object

| Field | Type | Notes |
|-------|------|-------|
| `code` | string | IATA code (e.g. `"SFO"`, `"JFK"`, `"LHR"`) |
| `name` | string | Full airport name |
| `city` | string | City name |
| `country` | string | Country name |
| `lat` | number | Latitude |
| `lng` | number | Longitude |

31 airports included by default: JFK, LAX, SFO, ORD, DFW, MIA, ATL, SEA, BOS, DEN, HNL (US); LHR, CDG, FRA, AMS, FCO, MAD, BCN (Europe); NRT, HND, ICN, SIN, HKG, DXB, BKK (Asia); SYD (Oceania); CUN, DPS, PHX, LAS, MSP (Others/US hubs).

**Note:** PHX (Phoenix), LAS (Las Vegas), MSP (Minneapolis) were added to ensure all layover cities referenced by the flight generator (`pickStopAirport`) resolve to proper city names.

### Airline Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | IATA code (e.g. `"DL"`, `"UA"`, `"BA"`) |
| `name` | string | Full airline name (e.g. `"Delta Air Lines"`) |
| `logoColor` | string | Hex color for logo display (e.g. `"#003876"`) |

10 airlines: DL (Delta), UA (United), AA (American), WN (Southwest), B6 (JetBlue), AS (Alaska), BA (British Airways), LH (Lufthansa), EK (Emirates), AF (Air France).

### Flight Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique ID (e.g. `"fl_1"`, `"fl_42"`) |
| `origin` | string | Origin airport code (e.g. `"SFO"`) |
| `destination` | string | Destination airport code (e.g. `"JFK"`) |
| `departureTime` | string | ISO 8601 datetime |
| `arrivalTime` | string | ISO 8601 datetime |
| `totalDuration` | number | Total trip duration in minutes (including layovers) |
| `stops` | number | Number of stops: `0`, `1`, or `2` |
| `segments` | array | Ordered list of segment IDs (e.g. `["seg_1", "seg_2"]`) |
| `price` | number | Price in USD (integer, e.g. `180`) |
| `emissions` | number | Estimated kg CO2 |
| `emissionsPercent` | number | % difference from route median (negative = less, positive = more) |
| `seatsAvailable` | number | Seats remaining (3-30) |
| `fareClasses` | object | See FareClasses below |
| `baggage` | object | See Baggage below |
| `layovers` | array | Layover details (see Layover below); empty array if nonstop |

~12 flights are generated per route definition, spanning the next 30 days. 26 route pairs are defined (13 bidirectional routes).

### FareClasses Object

| Field | Type | Notes |
|-------|------|-------|
| `basicEconomy` | number\|null | Price for basic economy (null if unavailable, only on connecting flights) |
| `economy` | number | Economy price (same as flight.price) |
| `premiumEconomy` | number | ~1.7x economy price |
| `business` | number | ~4.2x economy price |
| `first` | number\|null | ~7.0x economy price (null ~40% of the time) |

### Baggage Object

| Field | Type | Notes |
|-------|------|-------|
| `personalItem` | boolean | Always `true` |
| `carryOn` | boolean | `true` for nonstop; ~70% for connecting |
| `checkedBag` | boolean | `true` for ~50% of nonstop flights; `false` for connecting |

### Layover Object

| Field | Type | Notes |
|-------|------|-------|
| `airport` | string | Airport code of layover (e.g. `"ORD"`) |
| `duration` | number | Layover duration in minutes (50-180) |
| `changeTerminal` | boolean | Whether terminal change is required (~30% chance) |

### Segment Object (keyed by segment ID in `segments` map)

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique ID (e.g. `"seg_1"`) |
| `flightNumber` | string | e.g. `"DL4523"` |
| `airline` | string | Airline ID (e.g. `"DL"`) |
| `aircraft` | string | Aircraft type (e.g. `"Boeing 787-9 Dreamliner"`) |
| `origin` | string | Segment origin airport code |
| `destination` | string | Segment destination airport code |
| `departureTime` | string | ISO 8601 datetime |
| `arrivalTime` | string | ISO 8601 datetime |
| `duration` | number | Segment duration in minutes |
| `amenities` | object | See Amenities below |

### Amenities Object

| Field | Type | Notes |
|-------|------|-------|
| `wifi` | boolean | Wi-Fi available (~70%) |
| `power` | boolean | Power outlets (~60%) |
| `streaming` | boolean | Streaming entertainment (~50%) |
| `legroom` | string | Legroom in inches (e.g. `"31"`) — range 29-33 |

### Search Object

| Field | Type | Notes |
|-------|------|-------|
| `tripType` | string | `"roundtrip"`, `"oneway"`, or `"multicity"` |
| `origin` | string\|null | Origin airport code (default: `"SFO"`) |
| `destination` | string\|null | Destination airport code (default: `null`) |
| `departureDate` | string | ISO date `"YYYY-MM-DD"` (default: 14 days from today) |
| `returnDate` | string | ISO date `"YYYY-MM-DD"` (default: 21 days from today) |
| `passengers` | object | See Passengers below |
| `cabinClass` | string | `"economy"`, `"premiumEconomy"`, `"business"`, or `"first"` |
| `legs` | array | Multi-city legs — each leg is `{origin, destination, date}`. Persisted to context when user submits a multi-city search. |

### Multi-city Leg Object

| Field | Type | Notes |
|-------|------|-------|
| `origin` | string | Leg origin airport code |
| `destination` | string | Leg destination airport code |
| `date` | string | ISO date `"YYYY-MM-DD"` |

### Passengers Object

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `adults` | number | `1` | Min 1, max 9 total passengers |
| `children` | number | `0` | Ages 2-11 |
| `infantsInSeat` | number | `0` | In-seat infants |
| `infantsOnLap` | number | `0` | Lap infants |

### Filters Object

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `stops` | string | `"any"` | `"any"`, `"0"` (nonstop), `"1"`, or `"2"` |
| `airlines` | array | `[]` | Airline IDs to filter by (e.g. `["DL", "UA"]`). Exposed via Airlines chip dropdown and All Filters panel. |
| `bags` | array | `[]` | Bag requirements: `"carryOn"`, `"checkedBag"`. Flights are filtered to only those where `baggage[type] === true`. Exposed via Bags chip dropdown and All Filters panel. |
| `maxPrice` | number | `2000` | Maximum price filter (50-2000, step 50). Exposed via Price chip dropdown and All Filters panel. |
| `departureTimeRange` | array | `[0, 1440]` | `[minMinutes, maxMinutes]` — 0=midnight, 1440=end of day. Both handles are now adjustable (dual-range slider). Exposed via Times chip dropdown and All Filters panel. |
| `arrivalTimeRange` | array | `[0, 1440]` | `[minMinutes, maxMinutes]`. Both handles adjustable. Exposed via Times chip dropdown and All Filters panel. Arrival time filter is now applied to flight results. |
| `maxDuration` | number | `1200` | Maximum total trip duration in minutes (60-1200, step 30). Values ≥1200 mean "any duration". Exposed via All Filters panel. |
| `connectingAirports` | array | `[]` | Filter by connecting airport codes (UI in All Filters panel — field stored, not yet filtered). |
| `emissions` | string | `"any"` | `"any"` or `"low"`. Exposed via All Filters panel. |

### Booking Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto-generated (e.g. `"bk_1710000000000"`) |
| `flightId` | string | ID of the booked flight |
| `origin` | string | Origin airport code |
| `destination` | string | Destination airport code |
| `departureTime` | string | ISO 8601 datetime |
| `arrivalTime` | string | ISO 8601 datetime |
| `passenger` | object | `{firstName, lastName, dob, passportNumber, phone, email, nationality}` |
| `seat` | string\|null | Selected seat (e.g. `"12A"`) or null if skipped |
| `total` | number | Total price paid |
| `bookingRef` | string | 6-character alphanumeric reference |
| `status` | string | `"confirmed"` |
| `cabin` | string | Cabin class at time of booking |
| `createdAt` | string | ISO 8601 datetime |

### PriceAlert Object

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto-generated (e.g. `"al_1710000000000"`) |
| `active` | boolean | Whether alert is active |
| `createdAt` | string | ISO 8601 datetime |
| (plus any custom fields passed to `addPriceAlert`) | | |

### TrackedRoute Object

| Field | Type | Notes |
|-------|------|-------|
| `origin` | string | Origin airport code (e.g. `"SFO"`) |
| `destination` | string | Destination airport code (e.g. `"JFK"`) |
| `addedAt` | string | ISO 8601 datetime when tracking started |

### PopularDestination Object

| Field | Type | Notes |
|-------|------|-------|
| `city` | string | City name (e.g. `"Paris"`) |
| `country` | string | Country name (e.g. `"France"`) |
| `airport` | string | Airport code (e.g. `"CDG"`) |
| `imageUrl` | string | URL for destination image |
| `priceFrom` | number | Starting price in USD |
| `flightDuration` | string | Duration display (e.g. `"10h 30m"`) |
| `stops` | string | Stops display (e.g. `"Nonstop"`, `"1 stop"`) |

8 default destinations: Paris (CDG), Tokyo (NRT), London (LHR), Cancun (CUN), New York (JFK), Honolulu (HNL), Barcelona (BCN), Bali (DPS).

The "Popular destinations from X" heading now dynamically resolves the origin airport code to a city name (e.g., "San Francisco" for SFO).

### PriceCalendarEntry Object

| Field | Type | Notes |
|-------|------|-------|
| `date` | string | ISO date `"YYYY-MM-DD"` |
| `price` | number | Price for that date |
| `isCheapest` | boolean | `true` if in bottom 10% of prices |

Default calendar: 60 days from today, SFO→JFK route, base price $180.

### Default User

```json
{"id": "u_1", "name": "Demo User", "email": "demo@example.com"}
```

## Context Actions

The following actions are dispatched from `AppContext`:

| Action | Description |
|--------|-------------|
| `setSearch(fields)` | Merge fields into `state.search` |
| `setMultiLegs(legs)` | Set `state.search.legs` array (for multi-city trips). Called when user submits multi-city search. |
| `setFilters(fields)` | Merge fields into `state.filters` |
| `selectOutboundFlight(id)` | Set `state.selectedOutboundFlight` |
| `selectReturnFlight(id)` | Set `state.selectedReturnFlight` |
| `addBooking(booking)` | Append new booking to `state.bookings[]` |
| `addPriceAlert(alert)` | Append new alert to `state.priceAlerts[]` |
| `removePriceAlert(id)` | Remove alert from `state.priceAlerts[]` |
| `togglePriceTracking(route)` | Add or remove route from `state.trackedRoutes[]` |
| `setActiveTab(tab)` | Set `state.activeTab` |
| `setDateViewMode(mode)` | Set `state.dateViewMode` |
| `resetState()` | Reset to initial persisted state |

## UI Behaviors (Updated)

### Navbar
- **Hamburger button**: Shows a toast "Navigation menu is not available in this demo"
- **Flights tab**: Navigates to `/` without nested `<Link>` inside `<button>` (fixed M-15)
- **Hotels / Vacation rentals / Travel tabs**: Show toast "X is not available"
- **Apps grid button**: Opens a Google Apps popover grid (6 apps shown; clicking an app shows a toast)
- **User avatar button**: Opens a user account popover with name, email, bookings count, tracked routes count, price alerts count, and "Sign out" button

### Filter Chips (Results page)
- **All filters chip**: Opens a right-side drawer panel with all filters: Stops, Airlines, Bags, Price, Max Duration, Departure Time, Arrival Time, Emissions. Has "Reset all" and "Apply filters" buttons.
- **Stops chip**: Dropdown with radio options (Any, Nonstop, 1 stop, 2 stops)
- **Airlines chip**: Multi-select checkbox dropdown
- **Bags chip**: Multi-select for carry-on and checked bag. Selection actively filters flight results.
- **Price chip**: Single range slider for max price ($50–$2000)
- **Times chip**: Dual-range slider panel for both departure AND arrival time windows
- **Clear all button**: Appears when any filter is active; resets all filters to defaults

### Results Page Filtering
The following filters are applied to flights in order:
1. Origin/destination match
2. Date match (within 1 day)
3. Stops filter (`filters.stops`)
4. Airlines filter (`filters.airlines`)
5. Max price filter (`filters.maxPrice`)
6. Departure time range (`filters.departureTimeRange`) — both min and max bounds enforced
7. **Bags filter** (`filters.bags`) — filters to flights where `baggage.carryOn === true` and/or `baggage.checkedBag === true` (NEW)
8. **Arrival time range** (`filters.arrivalTimeRange`) — both min and max bounds enforced (NEW)
9. Max duration filter (`filters.maxDuration`)
10. Emissions filter (`filters.emissions`)

### Booking Page (Step 3 — Payment)
All payment form fields are now fully editable:
- Card number (pre-filled with `4242 4242 4242 4242`)
- Expiry month/year (pre-filled with `12` / `2027`)
- CVC (pre-filled with `123`)
- Name on card (auto-fills from passenger name but is editable)

### PriceGraphModal (Results page)
- **Price graph tab**: Shows the price bar chart + price trend indicator
- **Dates tab** (NEW): Shows a 14-day date grid with per-day prices, highlighting cheapest dates in green and the currently selected departure date in blue

### Multi-city Search
- Multi-city legs are synced to `state.search.legs` when user submits search (via `setMultiLegs`)
- On submit, navigates to `/results` with the first leg's origin/destination
- The leg state initializes from `search.legs` if previously saved

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8020/",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {"id": "u_1", "name": "Demo User", "email": "demo@example.com"},
        "search": {
          "tripType": "roundtrip",
          "origin": "JFK",
          "destination": "LAX",
          "departureDate": "2026-04-01",
          "returnDate": "2026-04-08",
          "passengers": {"adults": 2, "children": 0, "infantsInSeat": 0, "infantsOnLap": 0},
          "cabinClass": "economy",
          "legs": []
        },
        "filters": {
          "stops": "any",
          "airlines": [],
          "bags": [],
          "maxPrice": 2000,
          "departureTimeRange": [0, 1440],
          "arrivalTimeRange": [0, 1440],
          "maxDuration": 1200,
          "connectingAirports": [],
          "emissions": "any"
        },
        "selectedOutboundFlight": null,
        "selectedReturnFlight": null,
        "bookings": [],
        "priceAlerts": [],
        "trackedRoutes": [],
        "activeTab": "best",
        "dateViewMode": "calendar"
      }
    }
  }
}
```

**Note**: The `airports`, `airlines`, `flights`, `segments`, `popularDestinations`, and `priceCalendar` fields are auto-generated at initialization and do not need to be injected. They will be populated with deterministic default data if omitted. You can override them if you need specific flight data.

### Inject with Pre-existing Booking

```json
{
  "action": "set",
  "state": {
    "search": {
      "tripType": "roundtrip",
      "origin": "SFO",
      "destination": "NRT",
      "departureDate": "2026-04-15",
      "returnDate": "2026-04-25",
      "passengers": {"adults": 1, "children": 0, "infantsInSeat": 0, "infantsOnLap": 0},
      "cabinClass": "business"
    },
    "bookings": [
      {
        "id": "bk_1",
        "flightId": "fl_1",
        "origin": "SFO",
        "destination": "JFK",
        "departureTime": "2026-03-20T08:30:00.000Z",
        "arrivalTime": "2026-03-20T17:00:00.000Z",
        "passenger": {
          "firstName": "John",
          "lastName": "Doe",
          "dob": "1990-05-15",
          "passportNumber": "X12345678",
          "phone": "+1-555-0123",
          "email": "demo@example.com",
          "nationality": "US"
        },
        "seat": "14A",
        "total": 210,
        "bookingRef": "ABC123",
        "status": "confirmed",
        "cabin": "economy",
        "createdAt": "2026-03-10T10:00:00.000Z"
      }
    ],
    "trackedRoutes": [
      {"origin": "SFO", "destination": "NRT", "addedAt": "2026-03-10T10:00:00.000Z"}
    ]
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|-------------------|
| Change trip type (roundtrip/oneway/multicity) | `search.tripType` |
| Set origin airport | `search.origin` |
| Set destination airport | `search.destination` |
| Change departure date | `search.departureDate` |
| Change return date | `search.returnDate` |
| Adjust passenger count | `search.passengers.{adults,children,infantsInSeat,infantsOnLap}` |
| Change cabin class | `search.cabinClass` |
| Swap origin and destination | `search.origin` + `search.destination` swap |
| Submit multi-city search | `search.legs` (array of leg objects) |
| Apply stops filter | `filters.stops` |
| Filter by airlines | `filters.airlines` (array of airline IDs) |
| Filter by bags | `filters.bags` (e.g. `["carryOn"]`, `["carryOn","checkedBag"]`) |
| Adjust max price filter | `filters.maxPrice` |
| Set departure time range | `filters.departureTimeRange` (both min and max bounds) |
| Set arrival time range | `filters.arrivalTimeRange` (both min and max bounds) |
| Set max duration | `filters.maxDuration` |
| Set emissions filter | `filters.emissions` (`"any"` or `"low"`) |
| Clear all filters | `filters` resets to defaults |
| Select outbound flight | `selectedOutboundFlight` (flight ID) |
| Select return flight | `selectedReturnFlight` (flight ID) |
| Complete booking | new entry appended to `bookings[]` |
| Toggle track prices for a route | `trackedRoutes[]` (add/remove route) |
| Remove price alert | `priceAlerts[]` (entry removed) |
| Change results sort tab | `activeTab` (`"best"`, `"cheapest"`, `"fastest"`) |

## Flight Generation Details

Flights are generated deterministically using a seeded pseudo-random number generator (LCG) so the same flight data is produced on every initialization. Key generation rules:

- **Routes**: 13 bidirectional route pairs (26 total) covering US domestic, transatlantic, and transpacific routes
- **Flights per route**: ~12, spread over the next 30 days
- **Stop distribution**: 30% nonstop, 50% 1-stop, 20% 2-stop
- **Price modifiers**: Weekend +15%, stop discounts (1-stop: /0.85, 2-stop: /0.75), random variance 85%-120%
- **Segments**: Each stop adds an additional segment with a layover of 50-180 minutes

### Default Route Pairs and Base Prices

| Origin | Destination | Base Price | Notes |
|--------|-------------|-----------|-------|
| SFO | JFK | $180 | US transcontinental |
| SFO | LAX | $80 | Short-haul West Coast |
| LAX | LHR | $520 | Transatlantic |
| JFK | CDG | $400 | Transatlantic |
| JFK | LHR | $380 | Transatlantic |
| SFO | NRT | $680 | Transpacific |
| ORD | DFW | $120 | US domestic |
| MIA | JFK | $150 | US domestic |
| SEA | LAX | $130 | US domestic |
| SFO | DXB | $900 | Long-haul |
| LAX | SYD | $1100 | Transpacific |
| JFK | BCN | $480 | Transatlantic |
| (all routes are bidirectional) | | | |
