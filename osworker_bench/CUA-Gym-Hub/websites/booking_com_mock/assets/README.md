# Xooking.com — Research Summary

## App Overview

**Xooking.com** is the world's largest online travel agency (OTA), founded in 1996 in Amsterdam, Netherlands. It operates as a fare aggregator and travel metasearch engine for lodging reservations, offering bookings for hotels, apartments, vacation rentals, flights, car rentals, attractions, and airport taxis. The platform lists over 28 million accommodation options across 220+ countries.

**Core Value Proposition**: "Find deals for any season" — from cozy bed & breakfasts to luxury hotels, the platform aggregates global accommodation inventory with user reviews, transparent pricing, and often free cancellation.

**Parent Company**: Booking Holdings (NASDAQ: BKNG), which also owns Priceline, Kayak, Agoda, and OpenTable.

---

## Key User Personas

### 1. Leisure Traveler (Primary)
- Searches for hotels/apartments for vacation
- Compares prices, reviews, and amenities
- Values free cancellation and "pay at property" options
- Browses destination inspiration sections

### 2. Business Traveler
- Needs quick booking with "I'm traveling for work" checkbox
- Prioritizes location near business districts, Wi-Fi, workspaces
- Often has employer-managed bookings

### 3. Budget Traveler
- Heavily uses filters (price range, star rating)
- Sorts by "Lowest price first"
- Looks for deals, Genius discounts, "Limited-time deal" badges

### 4. Return/Loyal User (Genius Member)
- Has Genius loyalty status (Level 1, 2, or 3)
- Sees special Genius discount badges on eligible properties
- Values accumulated benefits (free breakfast, room upgrades)

---

## Complete Feature List

### P0 — Critical Infrastructure (App Cannot Render Without These)

| Feature | Description |
|---------|-------------|
| **Header/Navbar** | Dark blue (#003580) header with Xooking.com logo (white text, blue ".com"), currency selector (USD), flag icon, help "?", "List your property", user avatar/name |
| **Navigation Tabs** | Horizontal tabs below header: Stays (active, pill-shaped), Flights, Flight + Hotel, Car rentals, Attractions, Airport taxis — each with an icon |
| **Search Bar** | Yellow/gold (#FEBB02) bordered horizontal bar with 4 fields: Destination (bed icon + "Where are you going?"), Check-in/Check-out dates (calendar icon), Guests & Rooms (person icon + "2 adults · 0 children · 1 room"), blue Search button |
| **Routing** | Homepage → Search Results → Property Detail → Booking Form → Confirmation |
| **State Management** | Search params, selected property, booking state, user trips, favorites |

### P1 — Primary Features (Core User Workflows)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Homepage Hero** | P1 | Large hero image with tagline "Find deals for any season" / "A piece of paradise just for you" + subtitle. Below search bar: "I'm traveling for work" checkbox |
| **Homepage Offers Section** | P1 | "Offers" heading with promotional cards (e.g., "Save 15% or more", "Explore deals") |
| **Homepage Trending Destinations** | P1 | "Trending destinations" — horizontal card row showing cities with thumbnail, city name, country flag |
| **Homepage Property Type Browsing** | P1 | "Browse by property type" — horizontal scroll: Hotels, Apartments, Resorts, Villas, Cabins, Cottages, Glamping, etc. |
| **Homepage "Explore" Section** | P1 | "Get inspiration for your next trip" — destination cards with images |
| **Search Results Page** | P1 | Left sidebar filters + right main area with property cards, top sort bar, breadcrumb, map toggle |
| **Search Results — Filter Sidebar** | P1 | Collapsible filter sections: Budget (price range slider), Star rating (1-5 checkboxes), Review score, Property type, Facilities (Free WiFi, Parking, Pool, etc.), Bed preference, Room facilities, Meals, Cancellation policy, Distance from center |
| **Search Results — Sort Options** | P1 | Sort bar: "Our top picks", "Price (lowest first)", "Best reviewed and lowest price", "Property rating (high to low)", "Property rating (low to high)" |
| **Search Results — Property Card** | P1 | Horizontal card: Left image thumbnail (with heart/save icon overlay), Right content: Property name (link), star icons, location with "Show on map" link, distance from center, room type, bed info, amenities tags, cancellation policy badge, Genius badge if applicable. Far right: Review score badge (dark blue rounded square with score like "8.5"), review count, price section with original price (strikethrough if discounted), final price, tax info, "See availability" blue button |
| **Property Detail Page** | P1 | Full property page: Photo gallery grid (1 large + 4-5 small thumbnails with "+N photos" overlay), property name + star rating + address + "Show on map", review score badge, key amenities row, description, availability table, facilities list, reviews section, location map, house rules |
| **Property Photo Gallery** | P1 | Clicking photo grid opens full-screen lightbox carousel with thumbnails strip at bottom |
| **Property Availability Table** | P1 | Table with columns: Room type, Number of guests, Price for X nights, Your choices (meal plan, cancellation), Select rooms (dropdown quantity selector), and "I'll reserve" button per row |
| **Guest Reviews Section** | P1 | Overall score (large number out of 10 with label like "Superb"), score breakdown bars: Staff, Facilities, Cleanliness, Comfort, Value for money, Location, Free WiFi. Individual reviews: reviewer name, country flag, room type, nights stayed, date, positive "👍" and negative "👎" comment sections |
| **Booking/Checkout Form** | P1 | Multi-section form: Guest details (first name, last name, email, phone, country), Special requests textarea, arrival time dropdown. Price summary sidebar with property thumbnail, dates, room type, total price. "Complete Booking" button |
| **Booking Confirmation Page** | P1 | Dark blue header with confirmation number and PIN code, "Thanks [Name]! Your [property] in [city] is confirmed" with green checkmark, property details, "Modify your booking" and "Cancel booking" buttons |
| **Date Picker** | P1 | Double-month calendar popup: Two side-by-side months with navigation arrows, date range selection (check-in blue, checkout blue, range highlighted light blue), "X nights" badge, flexible date tabs |
| **Guests/Rooms Dropdown** | P1 | Popup with +/- stepper controls: Adults (default 2), Children (default 0, shows age dropdowns when > 0), Rooms (default 1). "Done" button |

### P2 — Secondary Features (Depth & Realism)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Destination Autocomplete** | P2 | As user types in search, dropdown shows matching cities, regions, hotels with icons (city/hotel/airport) and property count |
| **Map View** | P2 | Toggle to show search results on a map with price markers, clickable to show property card popup |
| **Saved Lists / Wishlist** | P2 | Heart icon on property cards to save; "My next trip" saved list accessible from profile |
| **My Trips / Bookings** | P2 | Dashboard showing upcoming, current, and past bookings with status badges |
| **Genius Loyalty Program** | P2 | Genius badge display on eligible properties, level indicator (1/2/3), discount percentages shown, progress tracker |
| **Property Facilities Section** | P2 | Grid of facility icons: Pool, Spa, Restaurant, Bar, Gym, Parking, Airport shuttle, Family rooms, Non-smoking, Pet-friendly, etc. |
| **"We Price Match" Banner** | P2 | Banner/badge on property pages indicating price guarantee |
| **Recently Viewed** | P2 | "Your recent searches" and "Recently viewed properties" sections on homepage |
| **Deals & Promotions Badges** | P2 | "Limited-time deal", "Genius discount", "Mobile-only price", "Early 2024 Deal" badges on cards |
| **Review Filters** | P2 | Filter reviews by: Traveler type (Solo, Couple, Family, Group), Score range, Topic keywords |
| **House Rules** | P2 | Check-in/check-out times, cancellation/prepayment policy, children/bed policy, pet policy |
| **Footer** | P2 | Multi-column footer: Support, Discover, Terms & settings, Partners, Countries, Regions, Cities sections |
| **Currency & Language Selector** | P2 | Popup modals for changing currency (USD, EUR, GBP, etc.) and language |

---

## UI Layout Description

### Global Header (60px height)
- **Background**: Dark navy blue (#003580)
- **Left**: "Xooking.com" logo — "Booking" in white, ".com" in lighter blue
- **Right**: Currency code (e.g., "USD"), country flag, help icon (?), "List your property" text, Register button (white outline), Sign in button (white outline)

### Navigation Tabs (48px height, same blue background but slightly lighter tone)
- Horizontal row of icon+text tabs: 🏨 Stays | ✈️ Flights | 🏨✈️ Flight + Hotel | 🚗 Car rentals | 🎫 Attractions | 🚕 Airport taxis
- Active tab has white pill/rounded background
- Inactive tabs are white text

### Homepage Search Section
- Full-width blue background section
- **Hero Text**: Large white bold heading "Find deals for any season" + smaller subtitle "From cozy bed & breakfasts to luxury hotels"
- **Search Bar**: Prominent horizontal bar with yellow/gold (#FEBB02) border/outline, sits at bottom of hero area overlapping the content below
  - 4 sections with vertical dividers: Destination | Dates | Guests | Search button
  - Search button: Bright blue (#0071C2) with white text "Search"
- Below search bar: Checkbox "I'm traveling for work"

### Search Results Layout (Full width, no sidebar on modern Xooking.com)
- **Top**: Breadcrumb (Home > Country > City), result count, sort dropdown
- **Left Column** (~300px): Filter sidebar with collapsible sections
- **Right Column**: Vertical stack of property cards
- Each property card is a horizontal rectangle (~800px wide, ~200px tall)

### Property Detail Page
- **Photo Grid**: Top section — 1 large photo (60% width) + grid of 4-5 smaller photos (40% width), "+30 photos" overlay on last thumbnail
- **Info Header**: Property name (large text), star icons, address, "Show on map" link, review badge
- **Content Sections**: Stacked vertically — Description, Availability table, Facilities, Reviews, Location, House Rules
- **Sticky Price Summary**: Right sidebar (on desktop) showing selected room price and "Reserve" CTA

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Dark Blue | #003580 | Header, navbar, CTAs |
| Primary Blue | #0071C2 | Links, buttons, interactive elements |
| Search Bar Yellow | #FEBB02 | Search bar border, highlights |
| Review Score Blue | #003580 | Review score badges |
| Success Green | #008009 | Free cancellation, availability, deals |
| Price Red/Strikethrough | #CC0000 | Original prices (struck through) |
| Background Light | #F5F5F5 | Page background |
| Card White | #FFFFFF | Property cards, content areas |
| Text Primary | #262626 | Main text |
| Text Secondary | #6B6B6B | Muted text, descriptions |
| Border | #E0E0E0 | Card borders, dividers |
| Star Yellow | #FEBB02 | Star ratings |
| Genius Blue-Green | #004CB8 | Genius loyalty badges |

### Typography
- **Font Family**: BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif
- **Heading Large**: 32px bold (hero title)
- **Heading Medium**: 24px bold (section titles)
- **Property Name**: 16px bold blue (#0071C2), acts as link
- **Body Text**: 14px regular #262626
- **Small/Muted**: 12px #6B6B6B
- **Price**: 20px bold #262626

---

## Data Model Overview

See `data_model.md` for complete entity definitions.

**Key Entities**:
1. **Property** — Hotels, apartments, vacation rentals (the core listing)
2. **Room** — Room types within a property (Standard Double, Deluxe Suite, etc.)
3. **Review** — Guest reviews with scores and comments
4. **Booking/Reservation** — User's confirmed bookings
5. **User** — The logged-in user with profile and Genius status
6. **SearchParams** — Current search state (destination, dates, guests)
7. **Destination** — Cities/regions for autocomplete and browse

---

## Notes on Scope Exclusions

- **Authentication**: App starts pre-logged-in as "Sarah Johnson" (Genius Level 1). Register/Sign in buttons visible but non-functional.
- **Real payments**: Checkout form collects info but "Complete Booking" just creates a mock booking in state.
- **Real-time availability**: All properties always have availability; no actual inventory checking.
- **Email notifications**: Confirmation page shown but no emails sent.
- **Map integration**: Use a static map placeholder or simple CSS map, no Google Maps API.
- **Flight/Car/Attractions**: These tabs can exist in nav but link to stub pages or stay on Stays.

---

## Screenshots Reference

| File | Content |
|------|---------|
| `homepage_01.jpg` | ⭐ **Actual Xooking.com** — Dark blue header, nav tabs (Stays/Flights/etc), hero image with "A piece of paradise just for you", yellow-bordered search bar with destination/dates/guests fields, blue Search button |
| `search_results_000005.jpg` | ⭐ **Actual Xooking.com** — Homepage variant: "Find deals for any season", search bar, "I'm traveling for work" checkbox, Offers section below |
| `confirmation_000001.jpg` | ⭐ **Actual Xooking.com** — Confirmation page: blue header with confirmation number & PIN, "Thanks Claire! Your holiday home in Strass is confirmed", Modify/Manage buttons |
| `loyalty_000001.jpg` | ⭐ **Actual Xooking.com Genius** — Genius loyalty program page: "Get rewarded for your travels", 3-column layout: Easy to get / Easy to keep / Easy to grow |
| `loyalty_000002.jpg` | ⭐ **Actual Xooking.com Genius** — Level 1 progress: "You're at Level 1!", 5 circle progress tracker, "Complete 5 bookings within 2 years to unlock Level 2" |
| `search_filters_000001.jpg` | Xooking.com search results with yellow Search sidebar (older design — shows Destination/Property Name field, Check-in Date), breadcrumb "Home > Search results" |
| `reviews_000002.jpg` | Xooking.com review score display — large "9.7 Out of 10" in gold circle on dark blue |
| `property_detail_000001.jpg` | Room cards showing: Standard Double Room ($220/night), Deluxe Single Room ($320/night), Two-Bedroom Apartment ($440/night) with amenities, size, bed info |
| Other screenshots | Various hotel booking UI references (generic booking templates, not Xooking.com specific) |

**Key visual takeaways from authentic screenshots:**
1. Header is solid dark navy blue (#003580) with white text
2. Search bar has distinctive yellow/gold (#FEBB02) border
3. "Search" button is bright blue (#0071C2)
4. Nav tabs use pill-shaped active state (white background on dark blue)
5. Clean, minimal design with generous whitespace
6. Confirmation uses dark blue header with green checkmarks
7. Genius program uses deep blue branding with yellow accent
