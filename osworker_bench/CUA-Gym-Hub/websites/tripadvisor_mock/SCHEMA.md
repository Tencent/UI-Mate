# tripadvisor_mock Schema

**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files: [{original_name, stored_name, size, content_type, url}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user (same shape as users[]); default `user_1` (TravelExplorer2024) |
| `users` | array | 21 users; each: `{id, name, location, avatar, reviewCount, helpfulVotes, photoCount, level, memberSince, bio?}` — `level`: `"Contributor"` \| `"Senior Contributor"` \| `"Top Contributor"` |
| `destinations` | array | 8 destinations; each: `{id, name, country, description, hotelCount, restaurantCount, attractionCount, image}` |
| `hotels` | array | 15 hotels across destinations; each: `{id, name, destinationId, address, rating, reviewCount, starClass, pricePerNight, travelersChoice, rank, totalHotelsInCity, description, amenities[], images[], partnerPrices[{partner, price}], subRatings{location, cleanliness, service, value, sleepQuality, rooms}, propertyType, neighborhood}` |
| `restaurants` | array | 15+ restaurants; each: `{id, name, destinationId, address, rating, reviewCount, priceLevel, cuisines[], meals[], dietaryOptions[], features[], hours, phone, description, images[], subRatings{food, service, value, atmosphere}, travelersChoice, rank, totalRestaurantsInCity}` — `priceLevel`: `"$"` \| `"$$"` \| `"$$$"` \| `"$$$$"` |
| `attractions` | array | 15+ attractions; each: `{id, name, destinationId, address, rating, reviewCount, category, priceRange, duration, description, images[], subRatings, travelersChoice, rank}` |
| `reviews` | array | 30+ reviews; each: `{id, entityId, entityType, userId, userName, userLevel, rating, title, text, visitDate, tripType, helpfulVotes, photos[], createdAt}` — `entityType`: `"hotel"` \| `"restaurant"` \| `"attraction"` — `tripType`: `"Couples"` \| `"Family"` \| `"Friends"` \| `"Business"` \| `"Solo"` |
| `trips` | array | 3 user trips; each: `{id, userId, name, destination, startDate, endDate, createdAt, items[{entityId, entityType, addedAt}]}` |
| `forumThreads` | array | 5 forum threads; each: `{id, title, destinationId, authorId, authorName, category, content, replies[{id, authorId, authorName, content, createdAt, helpfulVotes}], createdAt, viewCount, replyCount}` |
| `searchHistory` | object | `{recentSearches: [{query, type, destinationId, timestamp}]}` |
| `filters` | object | `{hotels: {amenities[], priceMin, priceMax, starClass[], rating[], propertyType[], destination}, restaurants: {cuisines[], priceLevel[], meals[], dietary[], features[], rating[], destination}, attractions: {category[], priceRange, duration[], rating[], destination}}` |
| `sort` | object | `{hotels, restaurants, attractions}` — each: `"bestValue"` \| `"rating"` etc. |
| `activeCategory` | string | `"hotels"` \| `"restaurants"` \| `"attractions"` |
| `votedHelpful` | array | Review IDs the current user has voted helpful |
| `savedEntities` | object | Keyed by `"<entityType>_<entityId>"` → `{tripId, savedAt}` |

### Default IDs

**Destinations**: `dest_1` (New York City), `dest_2` (Paris), `dest_3` (London), `dest_4` (Tokyo), `dest_5` (Rome), `dest_6` (Barcelona), `dest_7` (Cancun), `dest_8` (Bali)
**Hotels**: `hotel_1` through `hotel_15` across NYC, Paris, London
**Restaurants**: `rest_1` through `rest_15`+
**Attractions**: `attr_1` through `attr_15`+
**Users**: `user_1` (TravelExplorer2024, currentUser) through `user_21`
**Trips**: `trip_1` (NYC Adventure), `trip_2` (European Dream), `trip_3` (Asian Discovery)
**Forum Threads**: `thread_1` through `thread_5`

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user_1",
      "name": "TravelExplorer2024",
      "location": "San Francisco, CA",
      "reviewCount": 47,
      "helpfulVotes": 234,
      "photoCount": 89,
      "level": "Senior Contributor",
      "memberSince": "2019-03-15"
    },
    "destinations": [
      {
        "id": "dest_1",
        "name": "New York City",
        "country": "United States",
        "description": "The city that never sleeps",
        "hotelCount": 1423,
        "restaurantCount": 12845,
        "attractionCount": 1328,
        "image": ""
      }
    ],
    "hotels": [],
    "restaurants": [],
    "attractions": [],
    "reviews": [],
    "trips": [],
    "forumThreads": [],
    "searchHistory": { "recentSearches": [] },
    "filters": {
      "hotels": { "amenities": [], "priceMin": 0, "priceMax": 1000, "starClass": [], "rating": [], "propertyType": [], "destination": null },
      "restaurants": { "cuisines": [], "priceLevel": [], "meals": [], "dietary": [], "features": [], "rating": [], "destination": null },
      "attractions": { "category": [], "priceRange": null, "duration": [], "rating": [], "destination": null }
    },
    "sort": { "hotels": "bestValue", "restaurants": "bestValue", "attractions": "bestValue" },
    "activeCategory": "hotels",
    "votedHelpful": [],
    "savedEntities": {},
    "users": []
  }
}
```
