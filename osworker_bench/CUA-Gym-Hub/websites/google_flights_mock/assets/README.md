# Xoogle Flights Mock — Research Summary

## App Overview

Xoogle Flights (google.com/travel/flights) is Google's flight metasearch engine. It does NOT sell tickets directly — it aggregates fares from airlines and OTAs (Online Travel Agencies) and redirects users to book. Powered by ITA Matrix, it's one of the most popular flight search tools.

**Key differentiators from competitors:**
- Price calendar with cheapest-date highlighting (green)
- Price graph (bar chart showing daily prices over 2 months)
- Date grid (departure × return matrix showing roundtrip prices)
- Explore map (world map with destination price pins)
- "Best" vs "Cheapest" sort tabs
- CO2 emissions data per flight
- "Track prices" toggle for email alerts

## User Personas & Workflows

### Budget Traveler
1. Open Xoogle Flights → enter origin/destination
2. Use flexible date tools (calendar, price graph, date grid) to find cheapest dates
3. Apply filters: nonstop only, max price, preferred airlines
4. Compare "Best" vs "Cheapest" tabs
5. Click to book on airline website

### Business Traveler
1. Enter specific dates (round trip)
2. Select Business/First class
3. Filter by preferred airline (loyalty program)
4. Check nonstop flights
5. Expand flight details to see aircraft, legroom, Wi-Fi, power
6. Select and book

### Flexible Explorer
1. Enter origin, leave destination as "Anywhere"
2. Use Explore map to browse destinations with prices on pins
3. Click a destination pin → see flight details
4. Adjust date range on the map
5. Select a deal

## Complete Feature List

### P0 — Core (App cannot function without)
- **Google-style header/navbar**: Google logo, Travel / Explore / Flights / Hotels / Vacation rentals tabs
- **Flight search form**: Trip type (Round trip / One way / Multi-city dropdown), passengers dropdown (adults, children, infants), cabin class dropdown (Economy, Premium economy, Business, First), origin input with airport autocomplete, destination input with autocomplete, swap button between origin/dest, departure date picker, return date picker (hidden for one-way)
- **Search button**: Blue "Search" button → navigates to results
- **Results page layout**: Filters as horizontal pills (Stops, Price, Airlines, Bags, Times, Connecting airports, Duration) NOT as a sidebar — Xoogle Flights uses horizontal filter bar + dropdown popovers
- **Flight result cards**: Airline logo, departure–arrival times (bold), duration, stops with route line visualization, CO2 emissions, price (bold green), expand chevron
- **Flight detail expansion**: Click chevron → show segments, layovers, aircraft, flight number, legroom, Wi-Fi, in-seat power, baggage info
- **Routing**: /, /results, /booking, /go
- **State management**: Session-aware with /go endpoint

### P1 — Primary Features
- **"Best flights" / "Cheapest" / "Other flights" sections**: Results grouped into "Best departing flights" (top 3-5, highlighted), then "Other departing flights" below
- **Sort tabs**: Best / Cheapest tabs at top of results (NOT dropdown)
- **Date picker with prices**: Calendar shows 2 months side-by-side, each date cell shows the cheapest roundtrip price, cheapest dates highlighted in green
- **Price graph tab**: Bar chart showing daily prices for selected trip duration, hoverable bars showing date range + price
- **Date grid tab**: Departure dates × Return dates matrix showing prices, cheapest cells highlighted
- **Filter dropdowns**: Stops (Any/Nonstop/1 stop/2+ stops), Airlines (checkboxes), Bags (carry-on included / checked bag included), Price (slider), Times (departure/arrival time range sliders), Duration (slider), Connecting airports (checkboxes), Emissions (any/less emissions)
- **Track prices toggle**: Blue toggle switch to enable price tracking for the route
- **Round trip flow**: Select departing flight → "Next, choose a return flight" blue banner → select return flight → booking page
- **Booking/selection page**: Show selected outbound + return flights summary, fare options (Basic economy / Economy / Premium economy / Business), "Book on [Airline]" external link buttons
- **Popular destinations section on home**: Grid of destination cards with photos + prices from user's origin

### P2 — Secondary Features
- **Explore map page**: World map with price pins on destinations, clickable pins, date selector overlay
- **Multi-city search**: Add up to 5 flight legs with separate origin/dest/date
- **Passenger selector dropdown**: Adults (1-9), Children (2-11, 0-8), Infants (in seat/on lap, 0-8)
- **Swap origin/destination button**: Circular arrow icon between the two airport inputs
- **Flexible dates toggle**: "Exact dates" vs "+/- 1 day", "+/- 2 days", "+/- 3 days", "Flexible dates"
- **Emissions column**: CO2 emissions kg and % vs median for each flight
- **Price insights banner**: "Prices are currently [low/typical/high] for your search" with expandable chart
- **Saved/tracked flights page**: List of tracked routes with price history
- **Airport autocomplete with nearby**: "New York (all airports)" grouping JFK, LGA, EWR

## UI Layout Description

### Home Page (/)
- **Top bar**: White, full-width. Left: hamburger menu + "Google" logo. Center: Travel | Explore | Flights (active, blue underline) | Hotels | Vacation rentals. Right: dark mode toggle, grid icon, user avatar circle.
- **Hero area**: NOT a photo. Clean white/light gray background. Large centered text: "Flights" with airplane icon.
- **Search form**: Centered card with rounded corners, sits below hero. Row 1: [Round trip ▼] [1 passenger ▼] [Economy ▼]. Row 2: [Origin input ○] [swap ⇄] [Destination input ○] [Departure 📅 ◀ ▶] [Return 📅 ◀ ▶]. Row 3: Blue "Search" button, centered or right-aligned.
- **Below search**: "Popular destinations from [City]" — horizontal scrollable cards or grid with destination photo, city name, price, dates, nonstop/1-stop badge.

### Results Page (/results)
- **Sticky search bar at top**: Condensed version of search form (same fields, smaller).
- **Filter bar**: Horizontal row of pill/chip buttons: Stops ▼ | Airlines ▼ | Bags ▼ | Price ▼ | Times ▼ | Connecting airports ▼ | Duration ▼ | Emissions ▼. Clicking opens a dropdown/popover below the pill.
- **Date tools bar**: "Track prices" toggle | date display | "Date grid" button | "Price graph" button. Clicking "Date grid" or "Price graph" opens a modal/overlay with the respective visualization.
- **Results list**:
  - "Best departing flights" header with "Learn more" link
  - Each result row: [Airline logo 24px] [Departure–Arrival times, bold] [Airline name, gray small] | [Duration "Xh Ym"] [route line ●----●] [Stops text] | [CO2 "XXX kg CO2" + % badge] | [Price "$XXX" green bold, "round trip" gray below] [expand ∨ chevron]
  - Separator line
  - "Other departing flights" header
  - More results
- **Expanded flight detail**: Shows within the card. Timeline view with departure/arrival for each segment, layover callout (orange bg), aircraft type, flight number, amenities icons (Wi-Fi, power, streaming).

### Booking Page (/booking)
- Summary of selected flights (outbound + return if roundtrip)
- Fare comparison table: columns for Basic Economy, Economy, Premium Economy, etc.
- Each column shows: price, baggage allowance, seat selection, changes/cancellation policy
- "Book with [Airline]" or "Book with [OTA]" buttons linking externally

## Color Palette (from screenshots)
- **Primary blue**: #1a73e8 (Google Blue — used for links, active states, buttons)
- **Background**: #ffffff (white) for main content, #f1f3f4 (light gray) for page background
- **Text primary**: #202124 (near black)
- **Text secondary**: #5f6368 (gray)
- **Text muted**: #70757a (lighter gray)
- **Green (prices/deals)**: #137333 (dark green for prices), #e6f4ea (light green bg for cheapest dates)
- **Orange (layovers/warnings)**: #ea8600
- **Border/divider**: #dadce0 (light gray)
- **Hover bg**: #f1f3f4
- **Selected/active bg**: #e8f0fe (light blue)

## Typography
- **Font family**: Google Sans, Roboto, Arial, sans-serif
- **Headline**: 28-56px, 400 weight
- **Flight times**: 16px, 500 weight
- **Body/labels**: 14px, 400 weight
- **Small text**: 12px, 400 weight
- **Price**: 16-20px, 700 weight

## Notes on What to Skip
- **Authentication**: App starts pre-logged-in as demo user
- **Real booking**: "Book" buttons are decorative or show a toast
- **Real API calls**: All flight data is generated client-side
- **Real maps**: Explore map uses a static/simple representation, not Google Maps API
- **Email alerts**: Track prices toggle changes state but doesn't send emails
