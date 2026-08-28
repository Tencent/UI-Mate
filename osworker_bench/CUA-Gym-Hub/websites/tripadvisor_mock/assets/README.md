# Xripadvisor Mock -- Research & Assets

## App Overview

Xripadvisor is the world's largest travel guidance platform, operating in 40+ countries and 20+ languages. It aggregates over 1 billion reviews and opinions on approximately 8 million establishments including hotels, restaurants, attractions, and experiences. The platform serves as both a review/discovery site and a metasearch engine that compares prices across booking partners.

**Core purpose**: Help travelers discover, research, and plan trips by leveraging crowd-sourced reviews, ratings, photos, and price comparisons.

## Key User Personas

1. **Trip Planner (Primary)**: Searches for hotels, restaurants, and things to do in a destination. Reads reviews, compares prices, saves favorites to a trip, and eventually books through partner links.
2. **Review Contributor**: Writes reviews for places they have visited, uploads photos, answers questions, and earns contributor badges.
3. **Local Explorer**: Uses Xripadvisor to discover restaurants and attractions nearby, filtering by cuisine, price, and rating.
4. **Deal Hunter**: Searches for hotel deals, compares prices across booking sites, and looks for Travelers' Choice award winners.

## Primary Workflows

1. **Search for a destination** -- type a city/region/hotel name into the search bar
2. **Browse hotel listings** -- filter by price, rating, amenities; sort by Best Value/Traveler Ranked/Price
3. **View hotel detail** -- photos, map, reviews, prices from multiple booking partners, amenities, Q&A
4. **Browse restaurant listings** -- filter by cuisine, price range, dietary; sort by rating
5. **View restaurant detail** -- menu, reviews, photos, map, hours, make reservation link
6. **Browse things to do** -- filter by category, price, duration; sort by popularity
7. **Read and write reviews** -- view all reviews with filters, write a new review with rating
8. **Save to trip** -- heart/save listings to named trips for later reference
9. **Manage trips** -- create trips, add/remove saves, share with travel companions
10. **Browse forums** -- read and post travel questions organized by destination

## Complete Feature List

### P0 -- Core Shell & Navigation
- Top header bar with logo, search, user menu
- Category navigation tabs (Hotels, Things to Do, Restaurants, Flights, Vacation Rentals)
- Homepage with search hero, popular destinations, Travelers' Choice winners
- Routing between all major views
- Footer with links

### P1 -- Primary Features
- **Hotel search results page**: List of hotels with cards (image, name, rating bubbles, review count, price, amenities), filter sidebar, sort options, map toggle
- **Hotel detail page**: Photo gallery, rating summary, review highlights, price comparison table, amenities grid, location map, full reviews list, Q&A section
- **Restaurant search results page**: Grid/list of restaurants with rating, cuisine type, price level, photos
- **Restaurant detail page**: Photos, ratings breakdown (food/service/value/atmosphere), reviews, menu link, hours, location
- **Things to Do search results**: Grid of attractions/experiences with images, ratings, prices, duration
- **Thing to Do detail page**: Photos, description, reviews, booking options, duration, included items
- **Review system**: Rating bubbles display, review cards with user info, review filters (by rating, traveler type, time of year), write review modal
- **Save/Trip system**: Heart button to save any listing, create/manage trips, view saved items
- **Search functionality**: Autocomplete search with categories (hotels, restaurants, attractions, destinations), recent searches

### P2 -- Secondary Features
- **Forums page**: List of destination forums, thread list, individual thread with replies
- **User profile**: Avatar, review count, helpful votes, contributions, badges, trip list
- **Photo viewer modal**: Full-screen photo gallery with navigation
- **Map view**: Toggle between list and map view for search results
- **Filter system**: Multi-select filters for amenities, price ranges, rating levels, cuisine types, traveler type
- **Sort options**: Best Value, Traveler Ranked, Price (low to high), Distance
- **Travelers' Choice badges**: Award indicators on qualifying listings
- **Review helpfulness**: "Helpful" vote button on reviews, "Report" option
- **Nearby section**: "Restaurants near [hotel]" cross-linking
- **Price alerts**: UI for setting alerts (non-functional)
- **Travel guides**: Curated destination guides with editorial content

## UI Layout Descriptions

### Homepage (`/`)
- Full-width hero with large background image, search bar centered, category tabs above search
- "Build a trip in minutes" AI trip builder CTA section
- "Travelers' Choice" section: horizontal scroll of award-winning destination cards
- "Popular destinations" grid: 3-4 column card grid with destination images and names
- "Recently viewed" carousel (if saved state exists)
- Footer with site links organized by category

### Hotel Search Results (`/hotels?location=...`)
- Left sidebar (280px): filters -- price range slider, star rating checkboxes, amenities checkboxes, property type, distance from center
- Right main area: sort bar at top (Best Value | Traveler Ranked | Price low-high | Distance), then vertical list of hotel cards
- Each hotel card: 200x150 image left, info right -- name (link), rating bubbles + review count, location text, price from booking partner, "View Deal" button, heart/save icon
- Pagination at bottom

### Hotel Detail (`/hotel/:id`)
- Photo gallery header: large hero image + 4 thumbnails grid, "See all N photos" button
- Left column (65%): hotel name, rating bubbles, review count, Travelers' Choice badge, address, description, amenities grid (wifi, pool, parking icons), full reviews section
- Right column (35%): price comparison card (sticky) showing prices from Booking.com, Expedia, Hotels.com etc., "View Deal" buttons for each
- Reviews section: rating breakdown bar chart (5/4/3/2/1), filter pills (traveler type, time of year), list of review cards
- Q&A section below reviews

### Restaurant Search Results (`/restaurants?location=...`)
- Similar layout to hotels but with cuisine type filters
- Card layout: image, name, rating bubbles, review count, cuisine types as tags, price level ($-$$$$)

### Restaurant Detail (`/restaurant/:id`)
- Photo header, name, rating bubbles
- Subratings: Food, Service, Value, Atmosphere (each with individual bubble rating)
- Details: cuisine type, meals served, dietary options, price range, hours, address
- Reviews section with filters

### Things to Do (`/attractions?location=...`)
- Card grid: 2-3 columns
- Each card: large image, title, rating bubbles, review count, "from $XX" price, category tag, duration

## Data Model Overview
See `data_model.md` for complete entity specifications.

Key entities: Destinations, Hotels, Restaurants, Attractions, Reviews, Users, Trips, Forum Threads

## Screenshots

- `screenshots/tripadvisor_hotels_page.jpg` -- Partial view of Xripadvisor Hotels page showing header with logo, search icon, category tabs (Hotels underlined, Things to do, Restaurants, Flights, Holiday Rentals, Package Holidays), and "Travellers' Choice: Top hotels" section with destination cards featuring heart/save buttons
- `screenshots/tripadvisor_logo_history.jpg` -- Logo evolution: 2000-2020 (lowercase "xripadvisor" with detailed owl) vs 2020-Present (capitalized "Xripadvisor" with green circle owl icon)
- `screenshots/tripadvisor_owl_icon.jpg` -- Current owl icon on green (#34E0A1) background, used as favicon and app icon

## Notes on Scope

### Out of scope (do NOT implement):
- Authentication / login / signup (app starts pre-logged-in as a default user)
- Real booking / payment processing
- Real price comparison API calls
- Real map integration (use static placeholder)
- Email verification
- File uploads to real servers
- Real-time chat or messaging

### Simplifications:
- Price comparison shows mock partner prices (not real)
- Map view shows a static placeholder image or simple CSS representation
- Photo gallery uses placeholder travel images
- Forum posts are pre-seeded, no real-time updates
- Search autocomplete uses client-side filtering of seeded data
