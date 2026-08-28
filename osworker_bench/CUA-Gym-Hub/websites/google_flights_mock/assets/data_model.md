# Xoogle Flights Mock — Data Model

## Entity Types

### Airport
```js
{
  code: "JFK",              // String, IATA 3-letter code (primary key)
  name: "John F. Kennedy International Airport",  // String, full name
  city: "New York",         // String, city name
  country: "USA",           // String, country
  lat: 40.6413,             // Number, latitude (for explore map)
  lng: -73.7781             // Number, longitude
}
```

### Airline
```js
{
  id: "DL",                 // String, IATA 2-letter code (primary key)
  name: "Delta Air Lines",  // String, full name
  logoColor: "#003366"      // String, hex brand color (used for inline SVG circle+initials logo)
}
```
> Note: Use inline SVG or CSS-generated logos (colored circle with airline initials) rather than external image URLs to avoid broken images.

### FlightSegment
```js
{
  id: "seg_abc123",         // String, unique ID
  flightNumber: "DL1234",   // String, airline code + number
  airline: "DL",            // String, airline ID reference
  aircraft: "Boeing 737 MAX 8",  // String, aircraft type
  origin: "JFK",            // String, airport code
  destination: "LAX",       // String, airport code
  departureTime: "2025-04-15T08:30:00",  // ISO datetime
  arrivalTime: "2025-04-15T11:45:00",    // ISO datetime
  duration: 195,            // Number, minutes
  amenities: {              // Object
    wifi: true,             // Boolean
    power: true,            // Boolean, in-seat power
    streaming: true,        // Boolean, stream to device
    legroom: "31\""         // String, average legroom
  }
}
```

### Flight (a complete itinerary, one direction)
```js
{
  id: "fl_xyz789",          // String, unique ID
  origin: "JFK",            // String, airport code (first segment origin)
  destination: "LAX",       // String, airport code (last segment destination)
  departureTime: "2025-04-15T08:30:00",  // ISO datetime (first segment departure)
  arrivalTime: "2025-04-15T14:20:00",    // ISO datetime (last segment arrival)
  totalDuration: 350,       // Number, minutes (flight + layover time)
  stops: 1,                 // Number, 0=nonstop
  segments: ["seg_abc123", "seg_def456"],  // Array<String>, segment IDs
  price: 287,               // Number, USD (round trip price for the cheapest fare)
  emissions: 156,           // Number, kg CO2
  emissionsPercent: -12,    // Number, % vs route median (-12 = 12% less)
  seatsAvailable: 23,       // Number
  fareClasses: {            // Object, available fare prices
    basicEconomy: 287,      // Number or null
    economy: 327,
    premiumEconomy: 498,
    business: 1240,
    first: null
  },
  baggage: {                // Object, for cheapest fare class
    personalItem: true,
    carryOn: true,
    checkedBag: false       // false = not included in price
  },
  layovers: [               // Array<Object>, only if stops > 0
    {
      airport: "DFW",       // String, airport code
      duration: 55,         // Number, minutes
      changeTerminal: false // Boolean
    }
  ]
}
```

### SearchState
```js
{
  tripType: "roundtrip",    // "roundtrip" | "oneway" | "multicity"
  origin: "SFO",            // String, airport code or null
  destination: "JFK",       // String, airport code or null
  departureDate: "2025-04-15",  // String, YYYY-MM-DD or null
  returnDate: "2025-04-20",    // String, YYYY-MM-DD or null (null for one-way)
  passengers: {
    adults: 1,              // Number, 1-9
    children: 0,            // Number, 0-8
    infantsInSeat: 0,       // Number, 0-8
    infantsOnLap: 0         // Number, 0-8
  },
  cabinClass: "economy",   // "economy" | "premiumEconomy" | "business" | "first"
  // Multi-city legs (only when tripType === "multicity")
  legs: [                   // Array, only for multi-city
    { origin: "SFO", destination: "JFK", date: "2025-04-15" },
    { origin: "JFK", destination: "CDG", date: "2025-04-20" }
  ]
}
```

### Filters
```js
{
  stops: "any",             // "any" | "0" | "1" | "2"
  airlines: [],             // Array<String>, airline IDs (empty = all)
  bags: "any",              // "any" | "carryOn" | "checked"
  maxPrice: 2000,           // Number
  departureTimeRange: [0, 1440],  // Array<Number>, minutes from midnight [min, max]
  arrivalTimeRange: [0, 1440],
  maxDuration: 1200,        // Number, minutes
  connectingAirports: [],   // Array<String>, airport codes (empty = all)
  emissions: "any"          // "any" | "less"
}
```

### Booking
```js
{
  id: "bk_123",             // String, unique ID
  outboundFlightId: "fl_xyz789",  // String, flight ID
  returnFlightId: "fl_abc123",    // String, flight ID (null for one-way)
  fareClass: "economy",     // String
  passengers: { adults: 1, children: 0, infantsInSeat: 0, infantsOnLap: 0 },
  totalPrice: 654,          // Number, USD
  createdAt: "2025-04-10T14:30:00Z"  // ISO datetime
}
```

### PriceAlert
```js
{
  id: "al_456",             // String, unique ID
  origin: "SFO",            // String, airport code
  destination: "JFK",       // String, airport code
  departureDate: "2025-04-15",
  returnDate: "2025-04-20",
  active: true,             // Boolean
  currentPrice: 287,        // Number, last known price
  createdAt: "2025-04-10T14:30:00Z"
}
```

### PopularDestination
```js
{
  city: "Paris",
  country: "France",
  airport: "CDG",
  imageUrl: "https://picsum.photos/400/300?random=paris",
  priceFrom: 450,           // Number, USD round trip
  flightDuration: "10h 30m",
  stops: "Nonstop"          // String, display text
}
```

### PriceCalendarDay
```js
{
  date: "2025-04-15",       // String, YYYY-MM-DD
  price: 287,               // Number, cheapest round trip price for that date
  isCheapest: false         // Boolean, true if this is among the cheapest dates
}
```

## Relationships
- Flight.segments → FlightSegment[] (embedded or referenced by ID)
- Flight.origin/destination → Airport.code
- FlightSegment.airline → Airline.id
- FlightSegment.origin/destination → Airport.code
- Booking.outboundFlightId → Flight.id
- Booking.returnFlightId → Flight.id
- PriceAlert.origin/destination → Airport.code

## createInitialData() Structure

```js
export function createInitialData() {
  return {
    // Reference data
    airports: AIRPORTS,        // ~20-25 major world airports
    airlines: AIRLINES,        // ~10 major airlines

    // Generated flight data
    flights: generateFlights(),  // ~150 flights for various routes
    segments: [],              // Embedded in flights (denormalized)

    // User state
    search: {
      tripType: "roundtrip",
      origin: "SFO",
      destination: null,
      departureDate: null,     // Will be set to 2 weeks from "today"
      returnDate: null,        // Will be set to 3 weeks from "today"
      passengers: { adults: 1, children: 0, infantsInSeat: 0, infantsOnLap: 0 },
      cabinClass: "economy",
      legs: []
    },
    filters: {
      stops: "any",
      airlines: [],
      bags: "any",
      maxPrice: 2000,
      departureTimeRange: [0, 1440],
      arrivalTimeRange: [0, 1440],
      maxDuration: 1200,
      connectingAirports: [],
      emissions: "any"
    },
    selectedOutboundFlight: null,  // Flight ID or null
    selectedReturnFlight: null,    // Flight ID or null

    // Bookings & tracking
    bookings: [],
    priceAlerts: [],
    trackedRoutes: [],             // { origin, destination, dates, prices[] }

    // UI state
    activeTab: "best",             // "best" | "cheapest"
    dateViewMode: "calendar",      // "calendar" | "dateGrid" | "priceGraph"

    // Explore destinations
    popularDestinations: POPULAR_DESTINATIONS,  // ~8-10 destinations

    // Price calendar data (generated for selected route)
    priceCalendar: [],             // PriceCalendarDay[]

    // User
    user: {
      id: "u_1",
      name: "Demo User",
      email: "demo@example.com"
    }
  };
}
```

## Seed Data Requirements

### Airports (~25)
Include: JFK, LAX, SFO, ORD, DFW, MIA, ATL, SEA, BOS, DEN (US), LHR, CDG, FRA, AMS, FCO, MAD, BCN (Europe), NRT, HND, ICN, SIN, HKG, DXB, BKK (Asia/Middle East), SYD (Oceania). Each with lat/lng for explore map.

### Airlines (~10)
Delta (DL), United (UA), American (AA), Southwest (WN), JetBlue (B6), Alaska (AS), British Airways (BA), Lufthansa (LH), Emirates (EK), Air France (AF). Add US carriers (UA, AA, WN) that the existing data is missing.

### Flights (~150-200)
- Generate for 10-15 popular route pairs (SFO↔JFK, LAX↔LHR, JFK↔CDG, etc.)
- Each route: 10-15 flights spread across next 30 days
- Mix of nonstop (30%), 1-stop (50%), 2-stop (20%)
- Price range: $80-$2000+
- Duration range: 1h (short domestic) to 20h+ (international with stops)
- Ensure some flights share same route/date with different prices (comparison shopping)

### Popular Destinations (8-10)
From SFO (default origin): Paris $450, Tokyo $620, London $380, Cancun $280, New York $180, Honolulu $320, Barcelona $520, Bali $780.

### Price Calendar (60 days)
Generate daily prices for selected route. Prices should vary realistically: weekdays cheaper than weekends, some dates significantly cheaper (highlighted green), holiday periods more expensive.
