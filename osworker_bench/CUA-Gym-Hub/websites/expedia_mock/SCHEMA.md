# expedia_mock Schema

**Deploy port**: 5180 (dev); deployed at `https://cua-gym-xpedia.xlang.ai`
**Base URL**: `http://localhost:5180/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → stored state JSON

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Logged-in user profile (see shape below) |
| `hotels` | array | 16 NYC hotel objects with rooms and reviews (see shape below) |
| `flights` | array | 21 individual flight legs (SFO/JFK routes, multiple airlines) |
| `flightResults` | array | 12 paired outbound+return combinations with cabin options |
| `cars` | array | 12 car rental options at JFK |
| `activities` | array | 8 NYC activity listings |
| `bookings` | array | User's booking records (hotel, flight, car) |
| `searchFilters` | object | Hotel search params: destination, dates, guests, rooms, price, ratings, etc. |
| `flightSearchFilters` | object | Flight search params: from, to, dates, travelers, cabin class, stops, etc. |
| `carSearchFilters` | object | Car search params: pickup location, dates, times, vehicle types, companies |
| `trendingDestinations` | array | 6 destination cards for homepage hero section |
| `currentView` | string | Current page name (initialized to `"home"`, not updated on navigation) |
| `selectedHotel` | null | Always null — not currently used by any page |
| `selectedFlight` | string\|null | Flight result ID of currently selected flight (set when user clicks Select on flights page) |
| `cart` | object\|null | Active booking in progress (hotel, flight, or car) |
| `recentlyViewed` | array | Hotel IDs recently viewed (most recent first, max 10) |

### `user` shape

```
{
  id: string,                       // "user_1"
  firstName: string,                // "Sarah"
  lastName: string,                 // "Johnson"
  email: string,
  phone: string,
  oneKeyTier: string,               // "Blue" | "Silver" | "Gold" | "Platinum"
  oneKeyCash: number,               // Balance in USD (e.g. 124.50)
  savedProperties: string[],        // Array of hotel IDs
  recentSearches: SearchRecord[],   // Most recent first, max 10
  travelers: TravelerProfile[]      // Saved traveler profiles
}
```

### `hotels[]` item shape

```
{
  id: string,                   // "hotel_1" through "hotel_12"
  name: string,
  type: string,                 // "Hotel" | "Resort" | "Apartment" | "Inn"
  starRating: number,           // 3 | 4 | 5
  guestRating: number,          // 7.0–9.5
  guestRatingLabel: string,
  reviewCount: number,
  address: string,
  neighborhood: string,
  images: string[],             // 5 picsum URLs
  description: string,
  amenities: string[],
  highlights: string[],
  distanceFromCenter: string,
  memberPrice: boolean,
  memberDiscount: number,
  policies: { checkIn, checkOut, cancellation },
  rooms: Room[],                // 2-4 rooms per hotel
  reviews: Review[]             // 3-5 reviews per hotel
}
```

### `flightResults[]` item shape

```
{
  id: string,               // "flightresult_1" through "flightresult_8"
  outbound: string,         // Flight ID (SFO→JFK leg)
  returnFlight: string,     // Flight ID (JFK→SFO leg)
  totalPrice: number,       // Round-trip total
  pricePerPerson: number,
  savings: number,          // vs. non-member price
  cabinOptions: [{ class, price, pricePerPerson }]
}
```

### `bookings[]` item shape

```
{
  id: string,                   // "booking_1" or "booking_<timestamp>"
  type: string,                 // "hotel" | "flight" | "car"
  status: string,               // "upcoming" | "completed" | "cancelled"
  confirmationNumber: string,   // "EXP-XXXXXXXX"
  itineraryNumber: string,
  createdAt: string,            // ISO timestamp
  hotelId: string|null,
  flightId: string|null,
  carId: string|null,
  checkIn: string,              // "YYYY-MM-DD"
  checkOut: string,
  guests: number,
  rooms: number,
  roomType: string|null,
  totalCost: number,
  oneKeyCashEarned: number,
  paymentMethod: string,        // "Visa ending in XXXX"
  travelerNames: string[],
  cancellationDeadline: string|null,  // ISO timestamp
  notes: string
}
```

### `cart` shape (when non-null)

```
// Hotel cart
{
  type: "hotel",
  hotelId, hotelName, hotelImage, roomId, roomType,
  checkIn, checkOut, guests, rooms,
  pricePerNight, totalPrice, breakfastIncluded, freeCancellation
}

// Flight cart
{
  type: "flight",
  flightResultId, outboundId, returnId,
  airline, from, to, departureAirport, arrivalAirport, departureTime,
  departDate, returnDate, cabinClass, travelers, totalPrice, pricePerPerson
}

// Car cart
{
  type: "car",
  carId, company, vehicleName, vehicleType, carImage,
  pickupLocation, dropoffLocation, pickupDate, dropoffDate,
  pricePerDay, totalPrice, features
}
```

### Default IDs

**Hotels**: `hotel_1` through `hotel_16` (16 NYC hotels, star ratings 3-5)

**Flights**: `flight_1` through `flight_21` (SFO/JFK legs, 8 airlines including Southwest, Frontier)

**Flight Results**: `flightresult_1` through `flightresult_12`

**Cars**: `car_1` through `car_12` (JFK, Enterprise/Hertz/Budget/Avis/National, Economy through Luxury)

**Activities**: `activity_1` through `activity_8` (NYC)

**Bookings** (seeded):
- `booking_1` — hotel, upcoming, The Manhattan Club, May 15–19
- `booking_2` — flight, upcoming, SFO→JFK, May 15–19
- `booking_3` — hotel, completed, past stay
- `booking_4` — car, cancelled

**Traveler profiles**: `traveler_1` (Sarah Johnson), `traveler_2` (James Johnson)

**Saved properties** (initial): `["hotel_3", "hotel_7"]`

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "user": {
      "id": "user_1",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah.johnson@email.com",
      "phone": "+1 (415) 555-0123",
      "oneKeyTier": "Gold",
      "oneKeyCash": 124.50,
      "savedProperties": [],
      "recentSearches": [],
      "travelers": [
        {
          "id": "traveler_1",
          "firstName": "Sarah",
          "lastName": "Johnson",
          "dateOfBirth": "1988-03-15",
          "gender": "Female",
          "passportNumber": "X12345678",
          "knownTravelerNumber": "",
          "frequentFlyerNumbers": {}
        }
      ]
    },
    "searchFilters": {
      "destination": "New York, NY",
      "checkIn": "2026-05-15",
      "checkOut": "2026-05-19",
      "guests": 2,
      "rooms": 1,
      "priceMin": 0,
      "priceMax": 1000,
      "starRatings": [],
      "guestRatingMin": 0,
      "amenities": [],
      "propertyTypes": [],
      "neighborhoods": [],
      "freeCancellation": false,
      "payLater": false,
      "sortBy": "recommended"
    },
    "flightSearchFilters": {
      "from": "San Francisco (SFO)",
      "to": "New York (JFK)",
      "departDate": "2026-05-15",
      "returnDate": "2026-05-19",
      "tripType": "roundtrip",
      "travelers": 1,
      "cabinClass": "Economy",
      "stops": "any",
      "airlines": [],
      "priceMax": 1000,
      "sortBy": "recommended"
    },
    "carSearchFilters": {
      "pickupLocation": "JFK International Airport",
      "pickupDate": "2026-05-15",
      "dropoffDate": "2026-05-19",
      "pickupTime": "10:00",
      "dropoffTime": "10:00",
      "vehicleTypes": [],
      "companies": [],
      "priceMax": 200,
      "sortBy": "recommended"
    },
    "bookings": [],
    "cart": null,
    "selectedHotel": null,
    "selectedFlight": null,
    "recentlyViewed": []
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Search for hotels (stays form) | `searchFilters.destination`, `searchFilters.checkIn`, `searchFilters.checkOut`, `searchFilters.guests`, `searchFilters.rooms` updated; `user.recentSearches` grows by 1 |
| Search for flights (flights form) | `flightSearchFilters.from`, `flightSearchFilters.to`, `flightSearchFilters.departDate`, `flightSearchFilters.returnDate`, `flightSearchFilters.travelers`, `flightSearchFilters.cabinClass` updated; `user.recentSearches` grows by 1 |
| Search for cars (cars form) | `carSearchFilters.pickupLocation`, `carSearchFilters.pickupDate`, `carSearchFilters.dropoffDate` updated; `user.recentSearches` grows by 1 |
| Apply hotel price filter (slider) | `searchFilters.priceMax` updated |
| Apply star rating filter | `searchFilters.starRatings` array updated |
| Apply guest rating filter | `searchFilters.guestRatingMin` updated |
| Apply property type filter | `searchFilters.propertyTypes` array updated |
| Apply amenity filter | `searchFilters.amenities` array updated |
| Apply free cancellation filter | `searchFilters.freeCancellation` toggled |
| Apply pay later filter | `searchFilters.payLater` toggled |
| Apply hotel sort | `searchFilters.sortBy` updated |
| Apply neighborhood filter | `searchFilters.neighborhoods` array updated |
| Reset hotel filters | All `searchFilters` filter fields reset to defaults |
| Apply flight stop filter | `flightSearchFilters.stops` updated |
| Apply airline filter | `flightSearchFilters.airlines` array updated |
| Apply flight price filter | `flightSearchFilters.priceMax` updated |
| Apply flight sort | `flightSearchFilters.sortBy` updated |
| Apply car vehicle type filter | `carSearchFilters.vehicleTypes` array updated |
| Apply car company filter | `carSearchFilters.companies` array updated |
| Apply car price filter | `carSearchFilters.priceMax` updated |
| Heart/save a hotel (any page) | `user.savedProperties` array grows by 1 (hotel ID added) |
| Unsave a hotel (heart toggle or Account page) | `user.savedProperties` array shrinks by 1 |
| View hotel detail page | `recentlyViewed` array grows by 1 (hotelId prepended, max 10) |
| Select flight + cabin class | `selectedFlight` set to flightresult ID; `cart` populated with flight details |
| Select room on hotel detail | `cart` populated with hotel/room details |
| Select car | `cart` populated with car details |
| Complete checkout (Step 3 confirm) | `bookings` array grows by 1; `cart` → `null` |
| Cancel booking (Trips page) | `bookings[i].status` → `"cancelled"` |
| Save profile changes (Account) | `user.firstName`, `user.lastName`, `user.email`, `user.phone` updated |
| Add traveler (Account) | `user.travelers` array grows by 1 |
| Remove traveler (Account) | `user.travelers` array shrinks by 1 |
| Edit traveler (Account) | `user.travelers[i]` fields updated |
| Remove recent search (Account) | `user.recentSearches` array shrinks by 1 |
| Apply One Key Cash at checkout | `user.oneKeyCash` decremented by applied amount |
| Booking earns One Key Cash | `user.oneKeyCash` incremented by `bookings[i].oneKeyCashEarned` |
