# Xillow Mock — Research Summary

## App Overview

**Xillow** is the largest online real estate marketplace in the United States, allowing users to search for homes for sale, for rent, and to check property values (Zestimate). Founded in 2006, it provides comprehensive property data, neighborhood information, and connects buyers/renters with real estate agents. The site is used by home buyers, sellers, renters, and real estate professionals.

**URL**: https://www.zillow.com
**Category**: Real estate marketplace / property search
**Primary users**: Home buyers, home sellers, renters, real estate agents

## Key User Personas & Primary Workflows

### 1. Home Buyer (Primary)
- Search properties by location (city, ZIP, neighborhood)
- Apply filters (price, beds, baths, home type, square footage)
- Browse search results in list and map views
- View property details (photos, price, features, Zestimate)
- Save/favorite properties (heart icon)
- Save search criteria for alerts
- Contact listing agent
- Use mortgage calculator to estimate payments

### 2. Renter
- Search rental properties by location
- Filter by rent amount, beds, baths, pet-friendly, etc.
- View rental listing details
- Contact landlord/property manager

### 3. Home Seller
- Check Zestimate (home value estimate)
- View comparable sold properties
- Explore "Sell" flow (connect with agents)

### 4. Casual Browser
- Explore neighborhoods, browse homes
- Check "How much is my home worth?"
- Browse recently sold properties

## Complete Feature List

### P0 — Core Features (Must Have)
1. **Homepage with hero search** — Full-width hero image, centered "Reimagine home" tagline, large search bar with placeholder "Address, Neighborhood, City, Zip", search icon button
2. **Top navigation bar** — Xillow logo (blue Z icon + "Xillow" text), nav links: Buy, Rent, Sell, Home Loans, Agent Finder; right side: Manage Rentals, Advertise, Help; user avatar/menu
3. **Property search results page** — Split layout: left side = scrollable property card grid, right side = interactive map with price pins
4. **Search filter bar** — Horizontal bar with dropdown filters: For Sale/Rent toggle, Price range, Beds & Baths, Home Type, More filters; "Save Search" button
5. **Property listing card** — Property photo (with photo count badge), price (bold, large), beds/baths/sqft summary, full address, listing status badge (e.g. "New", "Price cut"), heart/save icon overlay, listing source
6. **Property detail page** — Photo gallery (grid/carousel), price, beds/baths/sqft, full address, "Zestimate" value, estimated monthly payment, property description, facts & features, price history, tax history, nearby schools, walk/transit/bike scores, similar homes
7. **Search autocomplete** — Dropdown suggestions as user types: cities, neighborhoods, ZIP codes, addresses
8. **App routing** — Home `/`, Search results `/homes/:location`, Property detail `/homedetails/:id`, Saved homes `/saved-homes`, Agent finder `/agent-finder`, Mortgage calculator `/mortgage-calculator`, Sell `/sell`

### P1 — Important Interactive Features
9. **Save/favorite property** — Heart icon on each property card and detail page; toggles saved state; saved homes appear in "Saved Homes" page
10. **Saved homes page** — Grid of saved property cards with ability to remove
11. **Saved searches** — Save current search criteria; view/manage saved searches
12. **Map with price pins** — Simplified map area showing property pins with abbreviated prices (e.g. "$425K"); hover on pin highlights corresponding card; click pin opens mini card popup
13. **Property photo gallery** — Grid of photos on detail page; click to open fullscreen lightbox carousel with prev/next navigation
14. **Filter dropdowns** — Price: min/max input fields with presets; Beds/Baths: button row (Any, 1+, 2+, 3+, 4+, 5+); Home Type: checkboxes (Houses, Townhomes, Multi-family, Condos/Co-ops, Lots/Land, Apartments, Manufactured); More: square footage, year built, keywords, parking, etc.
15. **Sort results** — Dropdown: "Homes for You", "Price (High to Low)", "Price (Low to High)", "Newest", "Bedrooms", "Bathrooms", "Square Feet"
16. **Mortgage calculator** — On property detail page and standalone page; inputs: home price, down payment ($ and %), loan term (30yr/15yr), interest rate; output: monthly payment breakdown (principal & interest, property tax, HOA, insurance)
17. **Zestimate display** — Property detail shows "Zestimate: $X" with a range bar (low-high estimate), plus Zestimate history chart
18. **Agent finder page** — Search by location; list of agents with photo, name, phone, rating (stars), reviews count, recent sales count

### P2 — Depth & Polish Features
19. **Contact agent form** — Modal/sidebar with: name, email, phone, message, "I want to:" dropdown (Buy/Sell/Rent), submit button
20. **Price history table** — Date, Event (Listed, Sold, Price change), Price columns on property detail
21. **Tax history table** — Year, Property Taxes, Tax Assessment on property detail
22. **Nearby schools section** — School name, grades, rating (1-10), distance; organized by Elementary/Middle/High
23. **Walk Score / Transit Score / Bike Score** — Numeric score with label (e.g. "72 — Very Walkable")
24. **Similar homes carousel** — Horizontal scrollable row of property cards at bottom of detail page
25. **Recently viewed** — Track and display recently viewed properties
26. **Sell page** — "What is your home worth?" with address search, display Zestimate result
27. **Home Loans page** — Simple mortgage rate display table, rate comparison
28. **Footer** — Multi-column footer with links organized by: Real Estate, Rentals, Mortgage Rates, Browse Homes

## UI Layout Description

### Homepage (`/`)
- **Header**: ~64px tall, white background. Left: Xillow logo (blue). Center-left: nav links (Buy, Rent, Sell, Home Loans, Agent Finder). Right: Manage Rentals, Advertise, Help, Sign In
- **Hero section**: Full-viewport-height background image (house exterior, dimmed overlay). Centered white text: "Reimagine home" (bold, ~48px). Subtitle: "We'll help you find a place you'll love." Below: Wide search input (~600px, white, rounded, ~56px tall) with placeholder "Address, Neighborhood, City, Zip" and blue search icon button
- **Below fold**: Optional content sections — trending homes, recently viewed, featured content

### Search Results Page (`/homes/:location`)
- **Top bar**: Search input (pre-filled with location) + filter chips (For Sale, Price, Beds & Baths, Home Type, More, Save Search)
- **Split layout**:
  - Left panel (~480px): Scrollable grid of property cards (2 columns), with result count header ("1,234 results")
  - Right panel (remaining width): Map with price pin markers
- Each **property card**: ~220px wide, photo (16:9 ratio, ~160px tall), photo count badge, heart icon (top-right), price ($XXX,XXX bold), "X bd | X ba | X,XXX sqft", address line, listing badge

### Property Detail Page (`/homedetails/:id`)
- **Photo gallery**: Top section, grid layout (1 large + 4 small thumbnails), "See all X photos" button
- **Main content** (left, ~65%): Price (large, bold), bed/bath/sqft row, address, "Zestimate" line, "Est. payment: $X,XXX/mo" with calculator link
- **Sidebar** (right, ~35%): "Contact Agent" card with agent photo, name, phone, message form
- **Below**: Tabbed/scrollable sections — Overview, Facts & Features, Price & Tax History, Monthly Cost, Neighborhood, Schools, Similar Homes

### Agent Finder Page (`/agent-finder`)
- Location search bar + agent name search + filters (Agent Type: Both/Individual/Team, Service: Buying/Selling)
- Featured agents section (top 3 with larger cards)
- Agent list: photo, name, phone, star rating, review count, recent sales, brokerage

## Color Palette (from screenshots)
- **Primary Blue**: `#006AFF` (Xillow brand blue — buttons, links, logo)
- **Dark Blue**: `#2A2A33` (header text, headings)
- **Body Text**: `#555555` (secondary text, descriptions)
- **Light Gray Background**: `#F7F7F7` (page backgrounds)
- **White**: `#FFFFFF` (cards, inputs, header)
- **Border Gray**: `#E0E0E0` (card borders, dividers)
- **Green**: `#008A00` (price cut badges, positive indicators)
- **Red/Coral**: `#D6342D` (heart/save icon when active, alerts)
- **Dark Overlay**: `rgba(0,0,0,0.5)` (hero image overlay)

## Typography
- **Font family**: "Xillow" custom sans-serif ≈ use `"Inter", "Helvetica Neue", Arial, sans-serif`
- **Headings**: 600-700 weight, dark (#2A2A33)
- **Body text**: 400 weight, #555
- **Prices**: 700 weight, #2A2A33, larger size
- **Small labels**: 12-13px, #888

## Data Model Overview
See `data_model.md` for complete entity definitions. Key entities:
- **Property** — The central entity (address, price, beds, baths, sqft, photos, type, status)
- **Agent** — Real estate agents (name, photo, phone, rating, reviews)
- **SavedHome** — User's favorited properties
- **SavedSearch** — Stored search criteria
- **User** — Current logged-in user profile

## What to Skip
- Authentication / login / sign up (app starts pre-logged-in as "Sarah Chen")
- Real map integration (use a static/styled div as map placeholder with CSS-drawn pins)
- Real address autocomplete API (use mock suggestion data)
- Xillow Offers / iBuying flow
- Real email/SMS notifications
- Third-party integrations (Trulia, HotPads)
- Real mortgage rate APIs
