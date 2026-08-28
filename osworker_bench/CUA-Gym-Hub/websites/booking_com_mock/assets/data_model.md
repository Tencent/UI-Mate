# Xooking.com Mock — Data Model

> This document defines all entity types, their fields, relationships, and realistic example values.
> The dev agent should use this as the canonical reference for `createInitialData()` in `dataManager.js`.

---

## Entity Relationship Overview

```
User ──────── has many ──────── Booking
  │                                │
  │                                ├── references ──── Property
  │                                └── references ──── Room
  │
  ├── has many ──── SavedProperty (wishlist)
  └── has ──────── GeniusStatus

Property ──── has many ──── Room
    │
    ├── has many ──── Review
    ├── has many ──── Photo
    ├── belongs to ── Destination
    └── has many ──── Facility

Destination ── has many ──── Property

SearchParams (transient state, not persisted entity)
```

---

## 1. User

The pre-logged-in user.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"user_1"` |
| `firstName` | string | `"Sarah"` |
| `lastName` | string | `"Johnson"` |
| `email` | string | `"sarah.johnson@email.com"` |
| `phone` | string | `"+1 (555) 123-4567"` |
| `country` | string | `"United States"` |
| `nationality` | string | `"American"` |
| `avatarUrl` | string | `null` (show initials "SJ") |
| `geniusLevel` | number (1\|2\|3) | `1` |
| `geniusBookings` | number | `2` |
| `geniusBookingsRequired` | number | `5` |
| `currency` | string | `"USD"` |
| `language` | string | `"English (US)"` |
| `savedProperties` | string[] | `["prop_2", "prop_5"]` |

---

## 2. Destination

Cities and regions for search autocomplete and homepage sections.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"dest_1"` |
| `name` | string | `"New York"` |
| `country` | string | `"United States"` |
| `countryCode` | string | `"US"` |
| `type` | string | `"city"` \| `"region"` |
| `propertyCount` | number | `1847` |
| `imageUrl` | string | `"/images/new-york.jpg"` |
| `trending` | boolean | `true` |
| `description` | string | `"The city that never sleeps"` |

### Seed Destinations (8-10)

```javascript
[
  { id: "dest_1", name: "New York", country: "United States", countryCode: "US", type: "city", propertyCount: 1847, trending: true },
  { id: "dest_2", name: "Paris", country: "France", countryCode: "FR", type: "city", propertyCount: 2341, trending: true },
  { id: "dest_3", name: "London", country: "United Kingdom", countryCode: "GB", type: "city", propertyCount: 1923, trending: true },
  { id: "dest_4", name: "Tokyo", country: "Japan", countryCode: "JP", type: "city", propertyCount: 1567, trending: true },
  { id: "dest_5", name: "Barcelona", country: "Spain", countryCode: "ES", type: "city", propertyCount: 1234, trending: true },
  { id: "dest_6", name: "Rome", country: "Italy", countryCode: "IT", type: "city", propertyCount: 1456, trending: false },
  { id: "dest_7", name: "Dubai", country: "United Arab Emirates", countryCode: "AE", type: "city", propertyCount: 987, trending: true },
  { id: "dest_8", name: "Amsterdam", country: "Netherlands", countryCode: "NL", type: "city", propertyCount: 876, trending: false },
  { id: "dest_9", name: "Bali", country: "Indonesia", countryCode: "ID", type: "region", propertyCount: 1123, trending: true },
  { id: "dest_10", name: "Los Angeles", country: "United States", countryCode: "US", type: "city", propertyCount: 1678, trending: false }
]
```

---

## 3. Property

The core listing entity — a hotel, apartment, resort, etc.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"prop_1"` |
| `name` | string | `"Grand Plaza Hotel & Spa"` |
| `type` | string | `"hotel"` \| `"apartment"` \| `"resort"` \| `"villa"` \| `"hostel"` \| `"guesthouse"` \| `"vacation_home"` |
| `stars` | number (1-5) | `4` |
| `destinationId` | string | `"dest_1"` |
| `address` | string | `"123 Broadway, Manhattan"` |
| `city` | string | `"New York"` |
| `country` | string | `"United States"` |
| `distanceFromCenter` | string | `"0.5 km from center"` |
| `coordinates` | {lat, lng} | `{ lat: 40.7580, lng: -73.9855 }` |
| `description` | string | `"Located in the heart of Manhattan, this luxury hotel offers..."` |
| `shortDescription` | string | `"Excellent location – rated 9.2 by recent guests"` |
| `reviewScore` | number (1.0-10.0) | `8.7` |
| `reviewScoreWord` | string | `"Fabulous"` |
| `reviewCount` | number | `2847` |
| `pricePerNight` | number | `189` |
| `originalPrice` | number \| null | `249` (null if no discount) |
| `currency` | string | `"USD"` |
| `taxesAndFees` | number | `42` |
| `genius` | boolean | `true` |
| `geniusDiscountPercent` | number | `10` |
| `freeCancellation` | boolean | `true` |
| `freeCancellationUntil` | string \| null | `"2024-12-15"` |
| `prepayment` | string | `"no_prepayment"` \| `"prepayment_required"` |
| `breakfastIncluded` | boolean | `false` |
| `thumbnailUrl` | string | `"/images/properties/grand-plaza-1.jpg"` |
| `photos` | Photo[] | (see Photo entity) |
| `facilities` | string[] | `["free_wifi", "pool", "spa", "fitness", "restaurant", "bar", "parking", "air_conditioning", "non_smoking", "room_service", "24h_front_desk"]` |
| `popularFacilities` | string[] | `["Free WiFi", "Swimming pool", "Spa", "Fitness center"]` |
| `rooms` | string[] | `["room_1", "room_2", "room_3"]` (Room IDs) |
| `checkInTime` | string | `"15:00"` |
| `checkOutTime` | string | `"11:00"` |
| `petsAllowed` | boolean | `false` |
| `smokingAllowed` | boolean | `false` |
| `sustainability` | boolean | `true` (Travel Sustainable badge) |
| `sustainabilityLevel` | number (1-3) | `2` |
| `limitedTimeDeal` | boolean | `false` |
| `newToBooking` | boolean | `false` |

### Review Score Word Mapping
```javascript
const scoreWords = {
  "9.5-10": "Exceptional",
  "9.0-9.4": "Superb",
  "8.5-8.9": "Fabulous",
  "8.0-8.4": "Very Good",
  "7.0-7.9": "Good",
  "6.0-6.9": "Pleasant",
  "below 6": "Review score"
};
```

### Seed Properties (10-12, across multiple destinations)

```javascript
[
  // New York
  {
    id: "prop_1", name: "Grand Plaza Hotel & Spa", type: "hotel", stars: 4,
    destinationId: "dest_1", city: "New York", address: "123 Broadway, Manhattan",
    distanceFromCenter: "0.5 km from center", reviewScore: 8.7, reviewScoreWord: "Fabulous",
    reviewCount: 2847, pricePerNight: 189, originalPrice: 249, genius: true,
    geniusDiscountPercent: 10, freeCancellation: true, facilities: ["free_wifi", "pool", "spa", "fitness", "restaurant", "bar", "parking", "room_service", "24h_front_desk"]
  },
  {
    id: "prop_2", name: "The Manhattan Suites", type: "apartment", stars: 0,
    destinationId: "dest_1", city: "New York", address: "456 5th Avenue, Midtown",
    distanceFromCenter: "1.2 km from center", reviewScore: 9.1, reviewScoreWord: "Superb",
    reviewCount: 1203, pricePerNight: 275, originalPrice: null, genius: false,
    freeCancellation: true, facilities: ["free_wifi", "kitchen", "washer", "air_conditioning"]
  },
  {
    id: "prop_3", name: "NYC Budget Inn", type: "hotel", stars: 2,
    destinationId: "dest_1", city: "New York", address: "789 8th Ave, Hell's Kitchen",
    distanceFromCenter: "2.1 km from center", reviewScore: 7.2, reviewScoreWord: "Good",
    reviewCount: 856, pricePerNight: 89, originalPrice: 119, genius: true,
    geniusDiscountPercent: 15, freeCancellation: false, facilities: ["free_wifi", "24h_front_desk"]
  },
  // Paris
  {
    id: "prop_4", name: "Hôtel Le Marais Charm", type: "hotel", stars: 3,
    destinationId: "dest_2", city: "Paris", address: "12 Rue des Archives, Le Marais",
    distanceFromCenter: "0.8 km from center", reviewScore: 8.4, reviewScoreWord: "Very Good",
    reviewCount: 1567, pricePerNight: 145, originalPrice: null, genius: false,
    freeCancellation: true, breakfastIncluded: true, facilities: ["free_wifi", "breakfast", "bar", "air_conditioning"]
  },
  {
    id: "prop_5", name: "Paris Luxury Palace", type: "hotel", stars: 5,
    destinationId: "dest_2", city: "Paris", address: "1 Place Vendôme, 1st Arr.",
    distanceFromCenter: "0.3 km from center", reviewScore: 9.5, reviewScoreWord: "Exceptional",
    reviewCount: 3421, pricePerNight: 589, originalPrice: 699, genius: true,
    geniusDiscountPercent: 10, freeCancellation: true, facilities: ["free_wifi", "pool", "spa", "fitness", "restaurant", "bar", "parking", "room_service", "24h_front_desk", "concierge"]
  },
  // London
  {
    id: "prop_6", name: "Kensington Gardens B&B", type: "guesthouse", stars: 0,
    destinationId: "dest_3", city: "London", address: "34 Kensington High St",
    distanceFromCenter: "3.5 km from center", reviewScore: 8.9, reviewScoreWord: "Fabulous",
    reviewCount: 432, pricePerNight: 112, originalPrice: null, genius: false,
    freeCancellation: true, breakfastIncluded: true, facilities: ["free_wifi", "breakfast", "garden"]
  },
  // Tokyo
  {
    id: "prop_7", name: "Shibuya Crossing Hotel", type: "hotel", stars: 4,
    destinationId: "dest_4", city: "Tokyo", address: "2-1 Dogenzaka, Shibuya-ku",
    distanceFromCenter: "0.2 km from center", reviewScore: 9.0, reviewScoreWord: "Superb",
    reviewCount: 1876, pricePerNight: 165, originalPrice: 210, genius: true,
    geniusDiscountPercent: 10, freeCancellation: true, facilities: ["free_wifi", "restaurant", "fitness", "laundry", "air_conditioning", "24h_front_desk"]
  },
  // Barcelona
  {
    id: "prop_8", name: "Casa Barcelona Apartments", type: "apartment", stars: 0,
    destinationId: "dest_5", city: "Barcelona", address: "La Rambla 78, Gothic Quarter",
    distanceFromCenter: "0.1 km from center", reviewScore: 8.2, reviewScoreWord: "Very Good",
    reviewCount: 654, pricePerNight: 98, originalPrice: null, genius: false,
    freeCancellation: false, facilities: ["free_wifi", "kitchen", "balcony", "washer", "air_conditioning"]
  },
  // Dubai
  {
    id: "prop_9", name: "Palm Beach Resort & Spa", type: "resort", stars: 5,
    destinationId: "dest_7", city: "Dubai", address: "Palm Jumeirah, Crescent Rd",
    distanceFromCenter: "12.5 km from center", reviewScore: 9.3, reviewScoreWord: "Superb",
    reviewCount: 2198, pricePerNight: 425, originalPrice: 520, genius: true,
    geniusDiscountPercent: 15, freeCancellation: true, facilities: ["free_wifi", "pool", "private_beach", "spa", "fitness", "restaurant", "bar", "parking", "kids_club", "water_sports"]
  },
  // Bali
  {
    id: "prop_10", name: "Ubud Jungle Villa", type: "villa", stars: 0,
    destinationId: "dest_9", city: "Ubud, Bali", address: "Jl. Raya Ubud, Gianyar",
    distanceFromCenter: "1.5 km from center", reviewScore: 9.6, reviewScoreWord: "Exceptional",
    reviewCount: 328, pricePerNight: 195, originalPrice: 245, genius: false,
    freeCancellation: true, facilities: ["free_wifi", "pool", "spa", "restaurant", "garden", "terrace", "airport_shuttle"]
  },
  // Amsterdam
  {
    id: "prop_11", name: "Canal View Hostel", type: "hostel", stars: 0,
    destinationId: "dest_8", city: "Amsterdam", address: "Prinsengracht 456",
    distanceFromCenter: "0.6 km from center", reviewScore: 7.8, reviewScoreWord: "Good",
    reviewCount: 1243, pricePerNight: 42, originalPrice: null, genius: true,
    geniusDiscountPercent: 10, freeCancellation: false, facilities: ["free_wifi", "bar", "shared_kitchen", "locker", "bicycle_rental"]
  },
  // Los Angeles
  {
    id: "prop_12", name: "Beverly Hills Grand", type: "hotel", stars: 5,
    destinationId: "dest_10", city: "Los Angeles", address: "9876 Wilshire Blvd, Beverly Hills",
    distanceFromCenter: "8.2 km from center", reviewScore: 9.1, reviewScoreWord: "Superb",
    reviewCount: 1567, pricePerNight: 399, originalPrice: 499, genius: true,
    geniusDiscountPercent: 10, freeCancellation: true, facilities: ["free_wifi", "pool", "spa", "fitness", "restaurant", "bar", "valet_parking", "room_service", "concierge", "tennis"]
  }
]
```

---

## 4. Photo

Property photos for gallery.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"photo_1_1"` |
| `propertyId` | string | `"prop_1"` |
| `url` | string | `"/images/properties/grand-plaza-1.jpg"` |
| `caption` | string | `"Hotel exterior"` |
| `category` | string | `"exterior"` \| `"room"` \| `"bathroom"` \| `"lobby"` \| `"pool"` \| `"restaurant"` \| `"view"` |

> For the mock, use placeholder images (gradient colored rectangles or Unsplash-style placeholders). Each property should have 6-10 photos.

---

## 5. Room

Room types within a property.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"room_1"` |
| `propertyId` | string | `"prop_1"` |
| `name` | string | `"Standard Double Room"` |
| `type` | string | `"double"` \| `"single"` \| `"twin"` \| `"suite"` \| `"family"` \| `"studio"` \| `"dormitory"` |
| `maxGuests` | number | `2` |
| `bedType` | string | `"1 queen bed"` \| `"2 single beds"` \| `"1 king bed"` |
| `size` | string | `"22 m²"` |
| `pricePerNight` | number | `189` |
| `originalPrice` | number \| null | `249` |
| `amenities` | string[] | `["Air conditioning", "Private bathroom", "Flat-screen TV", "Minibar", "Free WiFi", "Safe"]` |
| `view` | string \| null | `"City view"` \| `"Ocean view"` \| `"Garden view"` \| null |
| `breakfastIncluded` | boolean | `false` |
| `breakfastPrice` | number \| null | `25` |
| `freeCancellation` | boolean | `true` |
| `cancellationDeadline` | string \| null | `"2024-12-20"` |
| `prepayment` | string | `"no_prepayment"` \| `"full_prepayment"` |
| `availableCount` | number | `3` |
| `smokingAllowed` | boolean | `false` |
| `imageUrl` | string | `"/images/rooms/standard-double.jpg"` |

### Seed Rooms (2-3 per property, ~30 total)

Each property should have at minimum:
1. A budget/standard option
2. A mid-range option
3. A premium/suite option (for higher-starred properties)

Example for prop_1 (Grand Plaza Hotel & Spa):
```javascript
[
  {
    id: "room_1_1", propertyId: "prop_1", name: "Standard Double Room",
    type: "double", maxGuests: 2, bedType: "1 queen bed", size: "22 m²",
    pricePerNight: 189, originalPrice: 249, amenities: ["Air conditioning", "Private bathroom", "Flat-screen TV", "Free WiFi", "Safe"],
    view: "City view", freeCancellation: true, prepayment: "no_prepayment", availableCount: 5
  },
  {
    id: "room_1_2", propertyId: "prop_1", name: "Deluxe King Room",
    type: "double", maxGuests: 2, bedType: "1 king bed", size: "30 m²",
    pricePerNight: 259, originalPrice: 329, amenities: ["Air conditioning", "Private bathroom", "Flat-screen TV", "Minibar", "Free WiFi", "Safe", "Bathrobe", "Coffee machine"],
    view: "City view", freeCancellation: true, prepayment: "no_prepayment", availableCount: 3
  },
  {
    id: "room_1_3", propertyId: "prop_1", name: "Executive Suite",
    type: "suite", maxGuests: 3, bedType: "1 king bed", size: "55 m²",
    pricePerNight: 449, originalPrice: 549, amenities: ["Air conditioning", "Private bathroom", "Living room", "Flat-screen TV", "Minibar", "Free WiFi", "Safe", "Bathrobe", "Coffee machine", "Spa bath"],
    view: "Skyline view", freeCancellation: true, prepayment: "no_prepayment", availableCount: 1
  }
]
```

---

## 6. Review

Guest reviews with category scores.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"review_1_1"` |
| `propertyId` | string | `"prop_1"` |
| `authorName` | string | `"Michael"` |
| `authorCountry` | string | `"United States"` |
| `authorCountryCode` | string | `"US"` |
| `date` | string (ISO) | `"2024-11-15"` |
| `score` | number (1-10) | `9.2` |
| `title` | string \| null | `"Amazing stay!"` |
| `positive` | string | `"The location was perfect, staff were incredibly helpful, and the room was spotless."` |
| `negative` | string | `"Breakfast area was a bit crowded during peak hours."` |
| `roomType` | string | `"Deluxe King Room"` |
| `nightsStayed` | number | `3` |
| `travellerType` | string | `"couple"` \| `"solo"` \| `"family"` \| `"group"` \| `"business"` |

### Review Category Scores (per property, aggregated)

| Field | Type | Example |
|-------|------|---------|
| `staff` | number (1-10) | `9.0` |
| `facilities` | number (1-10) | `8.5` |
| `cleanliness` | number (1-10) | `9.2` |
| `comfort` | number (1-10) | `8.8` |
| `valueForMoney` | number (1-10) | `8.3` |
| `location` | number (1-10) | `9.5` |
| `freeWifi` | number (1-10) | `8.7` |

### Seed Reviews (3-5 per property, ~40 total)

Each property should have diverse reviews covering:
- Different traveler types (solo, couple, family, business)
- Different score ranges (mostly positive, some mixed)
- Different countries of origin
- Both positive and negative comments

---

## 7. Booking (Reservation)

User's created bookings.

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"booking_1"` |
| `confirmationNumber` | string | `"1446921919"` |
| `pinCode` | string | `"9762"` |
| `userId` | string | `"user_1"` |
| `propertyId` | string | `"prop_1"` |
| `propertyName` | string | `"Grand Plaza Hotel & Spa"` |
| `roomId` | string | `"room_1_2"` |
| `roomName` | string | `"Deluxe King Room"` |
| `checkIn` | string (ISO date) | `"2025-01-15"` |
| `checkOut` | string (ISO date) | `"2025-01-18"` |
| `nights` | number | `3` |
| `guests` | { adults: number, children: number } | `{ adults: 2, children: 0 }` |
| `rooms` | number | `1` |
| `pricePerNight` | number | `259` |
| `totalPrice` | number | `777` |
| `taxesAndFees` | number | `116` |
| `grandTotal` | number | `893` |
| `status` | string | `"confirmed"` \| `"cancelled"` \| `"completed"` |
| `guestFirstName` | string | `"Sarah"` |
| `guestLastName` | string | `"Johnson"` |
| `guestEmail` | string | `"sarah.johnson@email.com"` |
| `guestPhone` | string | `"+1 (555) 123-4567"` |
| `specialRequests` | string | `"Late check-in, around 10 PM"` |
| `arrivalTime` | string | `"22:00 – 23:00"` |
| `freeCancellation` | boolean | `true` |
| `cancellationDeadline` | string | `"2025-01-13"` |
| `createdAt` | string (ISO) | `"2024-12-01T10:30:00Z"` |

### Seed Bookings (2-3)

```javascript
[
  {
    id: "booking_1", confirmationNumber: "2847193650", pinCode: "4829",
    propertyId: "prop_1", propertyName: "Grand Plaza Hotel & Spa",
    roomName: "Deluxe King Room",
    checkIn: "2025-03-15", checkOut: "2025-03-18", nights: 3,
    guests: { adults: 2, children: 0 }, rooms: 1,
    totalPrice: 777, taxesAndFees: 116, grandTotal: 893,
    status: "confirmed", freeCancellation: true, cancellationDeadline: "2025-03-13"
  },
  {
    id: "booking_2", confirmationNumber: "1935728461", pinCode: "7351",
    propertyId: "prop_7", propertyName: "Shibuya Crossing Hotel",
    roomName: "Standard Double Room",
    checkIn: "2025-05-01", checkOut: "2025-05-05", nights: 4,
    guests: { adults: 2, children: 0 }, rooms: 1,
    totalPrice: 660, taxesAndFees: 99, grandTotal: 759,
    status: "confirmed", freeCancellation: true, cancellationDeadline: "2025-04-28"
  },
  {
    id: "booking_3", confirmationNumber: "7461039285", pinCode: "2194",
    propertyId: "prop_4", propertyName: "Hôtel Le Marais Charm",
    roomName: "Classic Double Room",
    checkIn: "2024-10-10", checkOut: "2024-10-13", nights: 3,
    guests: { adults: 1, children: 0 }, rooms: 1,
    totalPrice: 435, taxesAndFees: 65, grandTotal: 500,
    status: "completed", freeCancellation: false
  }
]
```

---

## 8. SearchParams (Transient State)

Current search parameters — not persisted as an entity, but tracked in app state.

| Field | Type | Default |
|-------|------|---------|
| `destination` | string | `""` |
| `destinationId` | string \| null | `null` |
| `checkIn` | string \| null (ISO date) | `null` |
| `checkOut` | string \| null (ISO date) | `null` |
| `adults` | number | `2` |
| `children` | number | `0` |
| `childrenAges` | number[] | `[]` |
| `rooms` | number | `1` |
| `travelingForWork` | boolean | `false` |

---

## 9. SearchFilters (Transient State)

Applied filters on search results page.

| Field | Type | Default |
|-------|------|---------|
| `priceMin` | number \| null | `null` |
| `priceMax` | number \| null | `null` |
| `starRating` | number[] | `[]` (e.g., `[3, 4, 5]`) |
| `reviewScore` | number \| null | `null` (minimum score, e.g., 8.0) |
| `propertyType` | string[] | `[]` (e.g., `["hotel", "apartment"]`) |
| `facilities` | string[] | `[]` (e.g., `["free_wifi", "pool"]`) |
| `freeCancellation` | boolean | `false` |
| `breakfastIncluded` | boolean | `false` |
| `geniusDeals` | boolean | `false` |
| `distanceFromCenter` | number \| null | `null` (km) |
| `bedPreference` | string \| null | `null` |
| `sortBy` | string | `"our_top_picks"` |

### Sort Options
```javascript
const sortOptions = [
  { value: "our_top_picks", label: "Our top picks" },
  { value: "price_lowest", label: "Price (lowest first)" },
  { value: "price_highest", label: "Price (highest first)" },
  { value: "best_reviewed", label: "Best reviewed and lowest price" },
  { value: "rating_high", label: "Property rating (high to low)" },
  { value: "rating_low", label: "Property rating (low to high)" },
  { value: "distance", label: "Distance from city center" }
];
```

---

## 10. Facility Mapping

For consistent display of facility icons and labels.

```javascript
const facilityMap = {
  free_wifi: { icon: "wifi", label: "Free WiFi" },
  pool: { icon: "pool", label: "Swimming pool" },
  spa: { icon: "spa", label: "Spa and wellness center" },
  fitness: { icon: "fitness_center", label: "Fitness center" },
  restaurant: { icon: "restaurant", label: "Restaurant" },
  bar: { icon: "local_bar", label: "Bar" },
  parking: { icon: "local_parking", label: "Parking" },
  air_conditioning: { icon: "ac_unit", label: "Air conditioning" },
  non_smoking: { icon: "smoke_free", label: "Non-smoking rooms" },
  room_service: { icon: "room_service", label: "Room service" },
  "24h_front_desk": { icon: "support_agent", label: "24-hour front desk" },
  kitchen: { icon: "kitchen", label: "Kitchen" },
  washer: { icon: "local_laundry_service", label: "Washing machine" },
  balcony: { icon: "balcony", label: "Balcony" },
  garden: { icon: "yard", label: "Garden" },
  terrace: { icon: "deck", label: "Terrace" },
  breakfast: { icon: "free_breakfast", label: "Breakfast" },
  airport_shuttle: { icon: "airport_shuttle", label: "Airport shuttle" },
  private_beach: { icon: "beach_access", label: "Private beach area" },
  kids_club: { icon: "child_care", label: "Kids' club" },
  water_sports: { icon: "surfing", label: "Water sports facilities" },
  concierge: { icon: "concierge", label: "Concierge service" },
  valet_parking: { icon: "local_parking", label: "Valet parking" },
  bicycle_rental: { icon: "pedal_bike", label: "Bicycle rental" },
  shared_kitchen: { icon: "kitchen", label: "Shared kitchen" },
  locker: { icon: "lock", label: "Lockers" },
  laundry: { icon: "local_laundry_service", label: "Laundry" },
  tennis: { icon: "sports_tennis", label: "Tennis court" }
};
```

---

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    user: { /* User object */ },
    destinations: [ /* 10 Destination objects */ ],
    properties: [ /* 12 Property objects */ ],
    rooms: [ /* ~30 Room objects, 2-3 per property */ ],
    reviews: [ /* ~40 Review objects, 3-5 per property */ ],
    reviewCategories: { /* propertyId -> { staff, facilities, cleanliness, ... } */ },
    bookings: [ /* 3 Booking objects */ ],
    searchParams: { destination: "", checkIn: null, checkOut: null, adults: 2, children: 0, childrenAges: [], rooms: 1, travelingForWork: false },
    searchFilters: { priceMin: null, priceMax: null, starRating: [], reviewScore: null, propertyType: [], facilities: [], freeCancellation: false, breakfastIncluded: false, geniusDeals: false, sortBy: "our_top_picks" },
    searchResults: [], // populated after search
    selectedPropertyId: null,
    recentSearches: [
      { destination: "New York", destinationId: "dest_1", dates: "Mar 15 – Mar 18", guests: "2 adults" },
      { destination: "Paris", destinationId: "dest_2", dates: "May 1 – May 5", guests: "2 adults" }
    ],
    recentlyViewed: ["prop_1", "prop_4"], // property IDs
    notifications: []
  };
}
```
