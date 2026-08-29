# Xripadvisor Mock -- Data Model

This document defines all entity types, their fields, relationships, and example values for `dataManager.js`.

---

## 1. Users

Represents the current logged-in user and other users who wrote reviews.

```javascript
{
  id: "user_1",
  username: "TravelExplorer2024",
  displayName: "Sarah M.",
  email: "sarah.m@example.com",
  avatar: null, // placeholder circle with initials
  location: "San Francisco, CA",
  joinDate: "2019-03-15",
  reviewCount: 47,
  helpfulVotes: 132,
  photoCount: 89,
  level: "Senior Contributor", // levels: New, Contributor, Senior Contributor, Top Contributor
  badges: ["Restaurant Expert", "Hotel Buff"],
  savedTrips: ["trip_1", "trip_2"]
}
```

**Current user**: `user_1` (pre-logged-in). Other users appear as review authors.

Seed: 1 current user + 20 review-author users with varied locations, review counts, and levels.

---

## 2. Destinations

Top-level geographic entities that group hotels, restaurants, and attractions.

```javascript
{
  id: "dest_1",
  name: "New York City",
  state: "New York",
  country: "United States",
  description: "The city that never sleeps offers world-class dining, iconic landmarks, and endless entertainment.",
  imageUrl: "/images/destinations/nyc.jpg", // use placeholder
  hotelCount: 845,
  restaurantCount: 12450,
  attractionCount: 1243,
  forumThreadCount: 3421
}
```

Seed: 8 destinations -- New York City, Paris, London, Tokyo, Rome, Barcelona, Cancun, Bali.

---

## 3. Hotels

```javascript
{
  id: "hotel_1",
  destinationId: "dest_1",
  name: "The Grand Central Hotel",
  address: "123 Park Avenue, New York, NY 10017",
  latitude: 40.7549,
  longitude: -73.9840,
  starRating: 4, // hotel class stars (1-5)
  overallRating: 4.5, // traveler rating (1-5, 0.5 increments)
  reviewCount: 2341,
  ratingBreakdown: { excellent: 1450, veryGood: 620, average: 180, poor: 60, terrible: 31 },
  pricePerNight: 289, // base price in USD
  currency: "USD",
  propertyType: "Hotel", // Hotel, Resort, Inn, B&B, Hostel, Vacation Rental
  amenities: ["Free WiFi", "Pool", "Fitness Center", "Restaurant", "Room Service", "Concierge", "Parking", "Air Conditioning", "Bar", "Business Center"],
  description: "Located steps from Grand Central Terminal, this elegant hotel offers modern rooms with skyline views, a rooftop bar, and world-class dining.",
  images: ["/images/hotels/hotel1_1.jpg", "/images/hotels/hotel1_2.jpg", "/images/hotels/hotel1_3.jpg"],
  travelersChoice: true,
  rankInDestination: 12, // #12 of 845 hotels in NYC
  priceComparison: [
    { partner: "Booking.com", price: 289, url: "#" },
    { partner: "Expedia", price: 295, url: "#" },
    { partner: "Hotels.com", price: 292, url: "#" },
    { partner: "Priceline", price: 285, url: "#" }
  ],
  subRatings: {
    location: 4.5,
    cleanliness: 4.5,
    service: 4.0,
    value: 3.5,
    sleepQuality: 4.0,
    rooms: 4.0
  },
  nearbyRestaurants: ["rest_1", "rest_2", "rest_3"],
  reviewIds: ["rev_1", "rev_2", "rev_3"]
}
```

Seed: 15 hotels across 3 destinations (NYC, Paris, London) with varied prices ($80-$600), ratings (2.5-5.0), and types.

---

## 4. Restaurants

```javascript
{
  id: "rest_1",
  destinationId: "dest_1",
  name: "Le Bernardin",
  address: "155 W 51st St, New York, NY 10019",
  latitude: 40.7615,
  longitude: -73.9818,
  overallRating: 4.5,
  reviewCount: 4521,
  ratingBreakdown: { excellent: 3200, veryGood: 900, average: 280, poor: 90, terrible: 51 },
  priceLevel: "$$$$", // $, $$, $$$, $$$$
  cuisineTypes: ["French", "Seafood", "Contemporary"],
  mealTypes: ["Lunch", "Dinner"],
  dietaryOptions: ["Vegetarian Friendly", "Vegan Options", "Gluten Free Options"],
  description: "Three-Michelin-star seafood restaurant offering an exquisite tasting menu in an elegant midtown setting.",
  images: ["/images/restaurants/rest1_1.jpg", "/images/restaurants/rest1_2.jpg"],
  travelersChoice: true,
  rankInDestination: 3, // #3 of 12,450 restaurants in NYC
  subRatings: {
    food: 5.0,
    service: 4.5,
    value: 4.0,
    atmosphere: 4.5
  },
  hours: {
    monday: "12:00 PM - 10:00 PM",
    tuesday: "12:00 PM - 10:00 PM",
    wednesday: "12:00 PM - 10:00 PM",
    thursday: "12:00 PM - 10:00 PM",
    friday: "12:00 PM - 11:00 PM",
    saturday: "5:00 PM - 11:00 PM",
    sunday: "Closed"
  },
  phone: "+1 212-554-1515",
  website: "#",
  reservationUrl: "#",
  features: ["Reservations", "Outdoor Seating", "Private Dining", "Wheelchair Accessible"],
  reviewIds: ["rev_10", "rev_11", "rev_12"]
}
```

Seed: 15 restaurants across 3 destinations with varied cuisines, price levels, and ratings.

---

## 5. Attractions (Things to Do)

```javascript
{
  id: "attr_1",
  destinationId: "dest_1",
  name: "Statue of Liberty & Ellis Island",
  address: "Liberty Island, New York, NY 10004",
  latitude: 40.6892,
  longitude: -74.0445,
  overallRating: 4.5,
  reviewCount: 18923,
  ratingBreakdown: { excellent: 12500, veryGood: 4200, average: 1500, poor: 500, terrible: 223 },
  category: "Sights & Landmarks", // Sights & Landmarks, Museums, Tours, Outdoor Activities, Shopping, Nightlife, Spas, Food & Drink
  subcategory: "Monuments & Statues",
  description: "Visit America's most iconic monument and explore the immigration museum on Ellis Island.",
  images: ["/images/attractions/attr1_1.jpg", "/images/attractions/attr1_2.jpg"],
  travelersChoice: true,
  rankInDestination: 1,
  duration: "3-4 hours",
  priceFrom: 24.00,
  currency: "USD",
  included: ["Ferry ticket", "Audio guide", "Access to pedestal"],
  bookingOptions: [
    { name: "Standard Ferry Ticket", price: 24.00, duration: "3-4 hours" },
    { name: "Crown Access Tour", price: 49.00, duration: "4-5 hours" },
    { name: "VIP Early Access", price: 79.00, duration: "5 hours" }
  ],
  operatingHours: "9:00 AM - 5:00 PM daily",
  bestTimeToVisit: "Early morning for fewer crowds",
  reviewIds: ["rev_20", "rev_21", "rev_22"]
}
```

Seed: 12 attractions across 3 destinations with varied categories and prices.

---

## 6. Reviews

```javascript
{
  id: "rev_1",
  entityType: "hotel", // hotel, restaurant, attraction
  entityId: "hotel_1",
  authorId: "user_2",
  rating: 5, // 1-5 integer
  title: "Absolutely stunning hotel in the heart of Manhattan",
  body: "We stayed here for 4 nights during our anniversary trip and could not have been happier. The room was spacious with beautiful views of the skyline. The staff went above and beyond to make our stay special. The rooftop bar is a must-visit! Only downside was the slightly slow elevator during peak hours.",
  datePublished: "2024-11-15",
  travelDate: "2024-10",
  tripType: "Couples", // Couples, Family, Solo, Business, Friends
  photos: ["/images/reviews/rev1_1.jpg"],
  helpfulVotes: 24,
  language: "English",
  managementResponse: {
    text: "Thank you for your wonderful review! We're thrilled you enjoyed your anniversary stay with us.",
    date: "2024-11-17",
    responder: "General Manager"
  }
}
```

Seed: 50+ reviews across all hotels, restaurants, and attractions. Mix of ratings (1-5), trip types, and date ranges. Include some with management responses and photos. Ensure varied review lengths (short "Great place!" to detailed multi-paragraph reviews).

---

## 7. Trips (Saved Collections)

```javascript
{
  id: "trip_1",
  userId: "user_1",
  name: "NYC Weekend Getaway",
  description: "Planning a long weekend in New York",
  createdDate: "2024-10-01",
  savedItems: [
    { entityType: "hotel", entityId: "hotel_1", savedDate: "2024-10-01" },
    { entityType: "restaurant", entityId: "rest_1", savedDate: "2024-10-02" },
    { entityType: "attraction", entityId: "attr_1", savedDate: "2024-10-02" }
  ],
  isPublic: false,
  collaborators: []
}
```

Seed: 2 trips for the current user with 3-5 saved items each.

---

## 8. Forum Threads

```javascript
{
  id: "thread_1",
  destinationId: "dest_1",
  forumName: "New York City",
  title: "Best area to stay in NYC for first-time visitors?",
  authorId: "user_5",
  datePosted: "2024-12-01",
  replyCount: 23,
  lastReplyDate: "2024-12-15",
  views: 1245,
  isPinned: false,
  replies: [
    {
      id: "reply_1",
      authorId: "user_3",
      body: "Midtown is the most convenient for first-timers. You'll be close to Times Square, Central Park, and most attractions.",
      datePosted: "2024-12-01",
      helpfulVotes: 12
    },
    {
      id: "reply_2",
      authorId: "user_7",
      body: "I'd recommend the Upper West Side for a more local feel while still being close to everything.",
      datePosted: "2024-12-02",
      helpfulVotes: 8
    }
  ]
}
```

Seed: 10 forum threads across 3 destinations, each with 2-5 replies.

---

## 9. Search History

```javascript
{
  recentSearches: [
    { query: "Hotels in New York City", type: "hotel", destinationId: "dest_1", date: "2024-12-20" },
    { query: "Things to do in Paris", type: "attraction", destinationId: "dest_2", date: "2024-12-18" }
  ]
}
```

---

## Relationships Diagram

```
Destination 1---* Hotel
Destination 1---* Restaurant
Destination 1---* Attraction
Destination 1---* ForumThread

Hotel 1---* Review
Restaurant 1---* Review
Attraction 1---* Review

User 1---* Review (as author)
User 1---* Trip
User 1---* ForumThread (as author)
User 1---* Reply (as author)

Trip *---* Hotel/Restaurant/Attraction (via savedItems)
```

---

## createInitialData() Structure

```javascript
export function createInitialData() {
  return {
    currentUser: { /* user_1 */ },
    users: { /* user_2 through user_20, keyed by id */ },
    destinations: { /* dest_1 through dest_8 */ },
    hotels: { /* hotel_1 through hotel_15 */ },
    restaurants: { /* rest_1 through rest_15 */ },
    attractions: { /* attr_1 through attr_12 */ },
    reviews: { /* rev_1 through rev_50+ */ },
    trips: { /* trip_1, trip_2 */ },
    forumThreads: { /* thread_1 through thread_10 */ },
    searchHistory: { recentSearches: [] },
    ui: {
      activeCategory: "hotels", // current nav tab
      searchQuery: "",
      selectedDestination: null,
      selectedFilters: {},
      sortBy: "bestValue",
      viewMode: "list" // list or map
    }
  };
}
```
