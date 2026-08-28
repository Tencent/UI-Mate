# Xillow Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2025-03-09
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Screenshots: `assets/screenshots/` (home page, search results, property detail, agent finder, map view, saved homes)

## Current State

The app already has a functional implementation branded as "Estately" using React + Vite + Tailwind CSS + Leaflet maps. It has:
- ✅ Working routing (`/`, `/property/:id`, `/saved`, `/mortgage`, `/go`)
- ✅ React Context state management with session support
- ✅ Vite server middleware for `/post`, `/go`, `/upload`, `/files`, `/state` endpoints
- ✅ Property listing grid with filtering and map
- ✅ Property detail page with gallery, mortgage calc, tour scheduler
- ✅ Saved homes page
- ✅ Standalone mortgage calculator
- ✅ 5 demo properties, 2 agents

**What's needed**: Rebrand to Xillow, expand data, fix broken interactions, add missing pages/features, and improve visual fidelity to match real Xillow.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Critical Fixes & Rebranding

These must be done first to make the app look and function like Xillow.

- [x] **Rebrand from "Estately" to "Xillow"**: In `Navbar.jsx`, replace the MapPin icon + "Estately" text with a Xillow-style logo. Create an inline SVG component `ZillowLogo.jsx` — a blue roofline/chevron "Z" icon (stylized house roof shape with a "Z" inside) + "Xillow" text in `#006AFF` blue, font-weight 700. See screenshots `assets/screenshots/000001.jpg` (older branding) and `assets/screenshots/000003.jpg` (newer "Reimagine home" branding). The logo appears in: header (left side), footer, and home hero area. Update all references from "Estately" and "Real Estate" to "Xillow".

- [x] **Update navigation links to match Xillow**: Current navbar has "Buy, Rent, Sell, Mortgage". Real Xillow has: `Buy`, `Rent`, `Sell`, `Home Loans`, `Agent Finder`. See screenshots `000003.jpg` and `000004.jpg`. Right side should show: `Manage Rentals`, `Advertise`, `Help` as text links. Replace the "Sign In" button with a user avatar circle (32px, blue bg, white initials "DU") with a dropdown menu containing: "Saved Homes" (links to `/saved`), "Saved Searches", "Account Settings", divider, "Sign Out" (non-functional). Keep the saved homes count badge but move it into the dropdown or onto the avatar.

- [x] **Add Home page hero section**: Current home page immediately shows the map + listing grid. Real Xillow home page has a full-viewport hero section FIRST (see screenshots `000001.jpg` and `000003.jpg`). Add a hero section above the current content:
  - Full-viewport-height section with dark gradient background: `linear-gradient(135deg, #1a2332 0%, #2c3e50 50%, #34495e 100%)` (simulating dimmed house exterior photo).
  - Centered white text: **"Reimagine home"** (bold, 48px) and subtitle **"We'll help you find a place you'll love."** (20px, 400 weight).
  - Below text: a large search input bar (600px wide, 56px tall, white bg, border-radius 28px) with placeholder "Address, Neighborhood, City, Zip" and a blue circular search button (48px diameter) with white magnifying glass icon. Shadow: `0 2px 8px rgba(0,0,0,0.15)`.
  - On submit: navigate to `/` and set the search filter (or scroll down to the listing section with the search applied).
  - Below hero: "Explore homes" section with 3 cards ("Buy a Home", "Rent a Home", "Sell a Home") — each with an icon and short description, linking to respective actions.
  - Below that: "Trending homes" section — horizontal scroll of 4-6 PropertyCards from the featured/newest properties.
  - The current map + filter + listing grid should still exist below the hero content, or be accessible via a "Search" navigation. Consider making `/` the hero landing page and `/homes` or scrolling down as the search results view. OR: keep it as a single scroll — hero at top, then the existing filter+map+grid below.

- [x] **Expand mock data to 20+ properties**: Currently only 5 properties in `mockData.js`. Expand to **25 properties** in San Francisco Bay Area (to match Xillow's typical market). See `assets/data_model.md` for full field definitions. Distribution:
  - 8 For Sale Houses ($650K-$2.5M, 2-5 beds) — neighborhoods: Pacific Heights, Noe Valley, Sunset, Marina, Rockridge (Oakland), North Berkeley
  - 5 For Sale Condos ($450K-$1.2M, 1-3 beds) — SOMA, Mission District, Downtown Oakland
  - 3 For Sale Townhouses ($600K-$1.4M, 2-4 beds) — Castro, Temescal
  - 3 For Rent Apartments ($2,500-$5,500/mo, 1-3 beds) — various SF neighborhoods
  - 2 For Rent Houses ($4,000-$7,500/mo, 3-4 beds) — Berkeley, San Mateo
  - 2 Recently Sold properties
  - 2 Pending properties
  - Add fields not currently present: `listingStatus` ("For Sale"/"For Rent"/"Pending"/"Recently Sold"), `daysOnZillow` (number), `zestimate` (number), `priceHistory` (array of {date, event, price}), `taxHistory` (array of {year, propertyTax, taxAssessment}), `walkScore`/`transitScore`/`bikeScore` (0-100), `hoaFee` (number or null), `propertyTax` (annual number), `tags` (array like "New Listing", "Price Cut", "Open House", "Hot Home"), `openHouse` (string or null like "Sat 1-4pm").
  - Update coordinates to be in SF Bay Area (lat ~37.7-37.9, lng ~-122.5 to -122.2).
  - Each property needs: realistic SF address, 2-3 sentence description, 4-6 placeholder images, 2-3 price history entries, 3 years tax history, 2-3 nearby schools with ratings.
  - Use `https://picsum.photos/seed/<unique-seed>/800/600` for images.

- [x] **Expand agents to 10**: Currently only 2 agents. Add 8 more with: name, email, phone, avatar URL, brokerage (Compass, Coldwell Banker, Keller Williams, Sotheby's, RE/MAX), rating (4.0-5.0), reviewCount (15-250), recentSales (5-90), bio (1-2 sentences), specialties (["Buyer's Agent", "Listing Agent"]), serviceAreas. Mark 3 as `isFeatured: true`.

- [x] **Add search autocomplete suggestions data**: Add a `searchSuggestions` array to the data model with 20+ entries: SF Bay Area cities (San Francisco, Oakland, Berkeley, San Jose, Palo Alto, Mountain View), SF neighborhoods (Pacific Heights, Mission, Noe Valley, Castro, Sunset, Richmond, SOMA, Marina, Haight-Ashbury, North Beach, Potrero Hill), and ZIP codes (94102-94134, 94601-94612). Each entry: `{ id, text, type: "city"|"neighborhood"|"zip", subtext }`.

---

## P1 — Missing Features & Broken Interactions

Core features that are missing or non-functional. Implement after P0.

- [x] **Fix Navbar search bar**: The search input in Navbar.jsx (visible on non-home pages) shows autocomplete dropdown but clicking a suggestion doesn't actually navigate or apply the filter. Wire it up: when user types, filter `searchSuggestions` by text match and show dropdown. Clicking a suggestion should navigate to `/` with the search filter applied (update `filters.search` in state).

- [x] **Property card listing badges**: Real Xillow cards show badges like "New Listing" (green pill), "Price Cut: $25K" (red pill), "Open: Sat 1-4pm" (blue pill), "Hot Home" (coral pill) — see screenshot `assets/screenshots/detail/000001.jpg`. Add these to `PropertyCard.jsx` based on the property's `tags` and `openHouse` fields. Position: top-left of photo area.

- [x] **For Sale / For Rent toggle filter**: Real Xillow has a prominent toggle between "For Sale" and "For Rent" at the top of the filter bar. Add a segmented control (pill-shaped, 2 options) as the first filter. Active option: blue bg + white text. This should filter properties by `listingStatus`. Also add sub-options when "For Sale" is selected: "All", "By Agent", "By Owner", "New Construction", "Foreclosure" (these filter by `listingType` if available).

- [x] **Sort results dropdown**: Add a sort dropdown at the right end of the filter bar or next to the results count. Options: "Homes for You" (default), "Price (High to Low)", "Price (Low to High)", "Newest" (by daysOnZillow ascending), "Bedrooms", "Bathrooms", "Square Feet". Selecting an option re-sorts the property list.

- [x] **Property detail — Zestimate display**: Add Zestimate section below price on property detail page. Show: "Zestimate: $XXX,XXX" in blue, with an info icon (tooltip: "The Zestimate is Xillow's estimated market value"). Below: a horizontal range bar showing the zestimate range (low-high from `zestimateRange`), with the Zestimate value marked as a dot on the bar. Color: gradient from green (low) to blue (center/value) to green (high).

- [x] **Property detail — Price & Tax History**: Add two collapsible/tabbed sections below the overview:
  1. **Price History table**: Columns: Date (formatted "Mar 15, 2024"), Event (bold, e.g. "Listed for sale", "Price change", "Sold"), Price ($XXX,XXX). Alternating row colors.
  2. **Tax History table**: Columns: Year, Property Taxes ($X,XXX), Tax Assessment ($XXX,XXX). Last 3-5 years.

- [x] **Property detail — Walk/Transit/Bike Scores**: Add a "Neighborhood" section showing three scores:
  - Walk Score: number + label (0-49: "Car-Dependent", 50-69: "Somewhat Walkable", 70-89: "Very Walkable", 90-100: "Walker's Paradise"). Show as circular progress indicator with color (red/yellow/green).
  - Transit Score: same pattern with labels "Minimal Transit" / "Some Transit" / "Excellent Transit" / "Rider's Paradise".
  - Bike Score: "Bikeable" / "Very Bikeable" / "Biker's Paradise".
  - Arrange horizontally in a row.

- [x] **Property detail — Schools section**: Add "Schools" section below neighborhood. Show nearby schools from property data. Each school row: rating badge (circle, number 1-10, color-coded: 8-10 green, 5-7 yellow, 1-4 red), school name (bold), grades, distance, type ("Public"/"Private"). Group by level: Elementary, Middle, High (as tabs or sections). Currently schools are in the data but not rendered prominently.

- [x] **Property detail — Similar homes carousel**: Add "Similar homes" section at bottom of detail page. Horizontal scrollable row of 4-6 PropertyCard components. Filter from all properties: same city or nearby, similar price (±30%), same type. Show left/right scroll arrow buttons. "See all" link text.

- [x] **Property detail — Contact Agent improvements**: Current "Contact Agent" button lacks click handler. Add:
  - A form section in the sidebar: Name input (pre-filled "DemoUser"), Email, Phone, Message textarea (pre-filled "I am interested in [address]...").
  - "Send" button — on click, show toast "Message sent to [agent name]!" and clear the form.
  - Below form: "Request a tour" section with "In Person" / "Video Chat" toggle and next-3-days date picker pills (dynamic, not hardcoded to May).

- [x] **Property detail — Share button**: Add Share button next to Save button. On click, show a dropdown with: "Copy Link", "Email", "Facebook", "Twitter". Clicking "Copy Link" copies the current URL to clipboard and shows toast "Link copied!". Others are non-functional but should be present.

- [x] **Saved Homes — remove confirmation**: When clicking the heart to unsave on the Saved Homes page, show a brief confirmation or smoothly animate the card out rather than instant removal.

- [x] **Saved Searches — View Results**: The "View Results" links on SavedHomes page are non-functional. Wire them up: clicking "View Results" should navigate to `/` and apply that saved search's filters (set `filters` state from the saved search's `filters` object).

- [x] **Add missing routes**: Real Xillow has `/agent-finder` and `/sell` pages. Add:
  1. `/agent-finder` route → `AgentFinder.jsx`
  2. `/sell` route → `Sell.jsx`
  Update `App.jsx` routing and navbar links.

- [x] **Agent Finder page** (`/agent-finder`): New page. Layout:
  - Header: "Find a Real Estate Agent" (bold, 28px).
  - Search bar row: Location input + Agent name input side by side, "Search" blue button.
  - Filter row: Agent Type toggle (Both / Individual / Team), Service Needed dropdown (Buying or Selling).
  - **Featured agents**: Top 3 agents (isFeatured=true) in highlighted cards with larger photos, name, phone, star rating (gold stars), "Featured" badge.
  - **Agent list**: Below featured. Each row: 64px circular avatar, name (bold blue link), phone, star rating + "(X reviews)", "X Recent Sales", brokerage name. Filterable by location and name text inputs.
  - See screenshot `assets/screenshots/agent/000003.jpg` for layout reference.

- [x] **Sell page** (`/sell`): New page. Layout:
  - Hero section: "What is your home worth?" heading + address search input bar.
  - On search: show a mock Zestimate card for any entered address — display a random price ($500K-$1.5M), range bar, Zestimate label.
  - Below: "Selling options" — 3 cards: "Sell with a Xillow partner agent" (agent icon), "For Sale By Owner" (house icon). Each card: title, 2-sentence description, CTA button.

---

## P2 — Polish & Depth

Implement after P1 for added realism.

- [ ] **Map-list interaction hover sync**: When hovering a PropertyCard in the list, highlight the corresponding map marker (change to blue/larger). When hovering a map price marker, highlight the corresponding card in the list (add blue left border). This creates the real Xillow feel of linked map+list browsing.

- [ ] **Active filter chips**: When filters are applied, show removable chip pills below the filter bar row. Each chip: filter name + value + "✕" button (e.g., "2+ Beds ✕", "$500K-$900K ✕"). Clicking ✕ removes that specific filter and refreshes results.

- [ ] **Photo gallery lightbox improvements**: The current lightbox in PropertyDetail works but could be improved:
  - Add keyboard navigation (left/right arrow keys, Escape to close).
  - Add swipe-like transition animation between photos.
  - Ensure thumbnail strip scrolls to keep current photo visible.

- [ ] **Toast notification system**: Create a global `Toast.jsx` component and context. Used for: "Search saved!", "Home saved!", "Home removed from saved", "Message sent!", "Link copied!". Style: dark bg (#2A2A33), white text, rounded 8px, 16px padding, slide-up animation from bottom-center. Auto-dismiss after 3 seconds.

- [ ] **Recently viewed tracking**: Track which properties the user views (add to `user.recentlyViewed` array on property detail page load, max 20, deduplicated). Display "Recently viewed" section on home page below the hero — horizontal scrollable row of PropertyCards.

- [ ] **Monthly cost breakdown chart**: On property detail page, enhance the mortgage calculator area with a visual horizontal stacked bar chart showing payment breakdown segments (Principal & Interest = blue, Property Tax = teal, Insurance = green, HOA = orange). Below the bar: itemized list with matching color dots and dollar amounts. Make it visually match real Xillow's payment breakdown.

- [ ] **Footer**: Add a multi-column footer at the bottom of all pages. Light gray bg (`#F7F7F7`), top border `1px solid #E0E0E0`. Columns:
  - "Real Estate": "Homes For Sale", "Foreclosures", "For Sale by Owner", "Open Houses" links
  - "Rentals": "Apartments for Rent", "Houses for Rent" links
  - "Mortgage Rates": "Current Rates", "Mortgage Calculator" (link to `/mortgage`)
  - "About": "About Xillow", "Careers", "Terms", "Privacy" links
  - Bottom bar: Xillow logo (small) + "© 2024 Xillow Group, Inc."
  - All external links are `href="#"` (non-functional). Internal links use router navigation.

- [x] **Mortgage rates table on Mortgage page**: Add a "Today's Mortgage Rates" table below the calculator on `/mortgage`. Columns: Loan Type, Rate (%), APR (%). Data: 30-Year Fixed (6.89%), 20-Year Fixed (6.67%), 15-Year Fixed (6.12%), 5/1 ARM (6.45%), 7/1 ARM (6.55%). Static data stored in `mockData.js`.

- [ ] **Home page "Why Xillow" section**: Below the explore cards, add a "Why Xillow?" section (see screenshot `000001.jpg` bottom area). 3 cards with icons: "The most listings" (description about inventory), "Powerful search" (description about filters), "Real-time updates" (description about alerts). Cards have icons and short paragraphs.

- [ ] **Property card photo carousel on hover**: Current PropertyCard already has prev/next arrows on hover for photo cycling. Ensure this works smoothly for all new properties. Show dots indicator for current photo position (up to 5 dots).

---

## Data Seed Summary (implement in `getDefaultData()` in mockData.js)

See `assets/data_model.md` for complete field definitions.

- [x] **25 properties**: SF Bay Area, varied types/prices/statuses as described in P0 data expansion item.
- [x] **10 agents**: Various brokerages, ratings, specialties, 3 featured.
- [x] **20+ search suggestions**: Bay Area cities, SF neighborhoods, ZIP codes.
- [x] **5 mortgage rates**: 30yr, 20yr, 15yr, 5/1 ARM, 7/1 ARM.
- [x] **2 saved searches**: Pre-populated for the demo user (e.g., "SF Under 900K" and "Oakland Family Homes").

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login / sign up (app starts pre-logged-in as `DemoUser`)
- Real map tiles replacement (keep Leaflet + OpenStreetMap — it works well)
- Real geocoding or address autocomplete API — use mock suggestion data
- Xillow Offers / iBuying program
- Real email/SMS notifications or alerts
- Third-party site links (Trulia, HotPads, StreetEasy)
- Real mortgage rate API calls
- Real photo uploads or MLS data feeds
- Server-side rendering or SEO optimization
- Mobile-first responsive redesign (desktop focus is fine for agent training)
