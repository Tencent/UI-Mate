# Xillow Mock — Data Model

This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js`.

---

## Entity: `currentUser`

The pre-logged-in user.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"user-1"` |
| name | string | `"Sarah Chen"` |
| email | string | `"sarah.chen@email.com"` |
| phone | string | `"(415) 555-0142"` |
| avatar | string | `null` (use initials) |
| savedHomes | string[] | `["prop-1", "prop-5", "prop-12"]` |
| savedSearches | string[] | `["search-1", "search-2"]` |
| recentlyViewed | string[] | `["prop-3", "prop-7"]` |

---

## Entity: `properties`

The core entity. Array of property listings.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"prop-1"` | Unique ID |
| zpid | string | `"29384756"` | Xillow property ID (mock) |
| address | object | see below | Full address breakdown |
| address.street | string | `"1234 Oak Avenue"` | |
| address.city | string | `"San Francisco"` | |
| address.state | string | `"CA"` | 2-letter code |
| address.zip | string | `"94102"` | |
| address.neighborhood | string | `"Pacific Heights"` | |
| address.full | string | `"1234 Oak Avenue, San Francisco, CA 94102"` | Computed display string |
| price | number | `875000` | Listing price in dollars |
| zestimate | number | `890000` | Xillow estimated value |
| zestimateRange | object | `{ low: 845000, high: 935000 }` | Estimate range |
| rentZestimate | number | `4200` | Monthly rent estimate |
| beds | number | `3` | |
| baths | number | `2` | Can be decimal (2.5) |
| sqft | number | `1850` | Living area |
| lotSize | number | `5000` | Lot size in sqft |
| yearBuilt | number | `1925` | |
| propertyType | string | `"Single Family"` | One of: "Single Family", "Condo", "Townhouse", "Multi Family", "Apartment", "Land", "Manufactured" |
| listingStatus | string | `"For Sale"` | One of: "For Sale", "For Rent", "Pending", "Recently Sold" |
| listingType | string | `"Agent Listed"` | "Agent Listed", "For Sale By Owner", "New Construction", "Foreclosure" |
| daysOnZillow | number | `12` | |
| photos | string[] | `["/photos/prop1-1.jpg", ...]` | Array of photo URLs (use placeholder images) |
| photoCount | number | `24` | |
| description | string | `"Beautifully updated Victorian..."` | 2-4 sentences |
| features | object | see below | |
| features.heating | string | `"Central"` | |
| features.cooling | string | `"Central Air"` | |
| features.parking | string | `"2 Car Garage"` | |
| features.laundry | string | `"In Unit"` | |
| features.flooring | string[] | `["Hardwood", "Tile"]` | |
| features.appliances | string[] | `["Dishwasher", "Refrigerator", "Stove"]` | |
| features.exterior | string[] | `["Deck", "Patio", "Fenced Yard"]` | |
| features.other | string[] | `["Fireplace", "Walk-in Closet"]` | |
| priceHistory | array | see below | |
| taxHistory | array | see below | |
| schools | array | see below | Nearby schools |
| walkScore | number | `85` | 0-100 |
| transitScore | number | `72` | 0-100 |
| bikeScore | number | `68` | 0-100 |
| hoaFee | number | `350` | Monthly, null if none |
| propertyTax | number | `8750` | Annual |
| estimatedPayment | object | see below | |
| agent | string | `"agent-1"` | Listing agent ID |
| coordinates | object | `{ lat: 37.7749, lng: -122.4194 }` | For map pins |
| tags | string[] | `["New Listing", "Open House"]` | Badges/labels |
| openHouse | string\|null | `"Sat 1-4pm"` | Open house schedule |
| isFeatured | boolean | `false` | |

### Nested: `priceHistory` items

| Field | Type | Example |
|-------|------|---------|
| date | string | `"2024-03-15"` |
| event | string | `"Listed for sale"` |
| price | number | `875000` |
| source | string | `"MLS"` |

### Nested: `taxHistory` items

| Field | Type | Example |
|-------|------|---------|
| year | number | `2023` |
| propertyTax | number | `8750` |
| taxAssessment | number | `720000` |

### Nested: `schools` items

| Field | Type | Example |
|-------|------|---------|
| name | string | `"Lincoln Elementary"` |
| level | string | `"Elementary"` |
| grades | string | `"K-5"` |
| rating | number | `8` |
| distance | string | `"0.3 mi"` |
| type | string | `"Public"` |

### Nested: `estimatedPayment`

| Field | Type | Example |
|-------|------|---------|
| total | number | `5234` |
| principalAndInterest | number | `3850` |
| propertyTax | number | `729` |
| homeInsurance | number | `305` |
| hoa | number | `350` |
| mortgageInsurance | number | `0` |

---

## Entity: `agents`

Real estate agents displayed on listing pages and agent finder.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"agent-1"` |
| name | string | `"Jennifer Martinez"` |
| photo | string | `null` (use initials) |
| phone | string | `"(415) 555-0198"` |
| email | string | `"jennifer.m@realestate.com"` |
| brokerage | string | `"Compass Real Estate"` |
| rating | number | `4.8` |
| reviewCount | number | `127` |
| recentSales | number | `45` |
| activeListings | number | `12` |
| specialties | string[] | `["Buyer's Agent", "Listing Agent"]` |
| serviceAreas | string[] | `["San Francisco", "Oakland"]` |
| isFeatured | boolean | `true` |
| bio | string | `"15+ years helping families..."` |

---

## Entity: `savedSearches`

User's stored search criteria.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"search-1"` |
| name | string | `"SF Under 900K"` |
| location | string | `"San Francisco, CA"` |
| filters | object | `{ minPrice: 500000, maxPrice: 900000, beds: 2, baths: 1, homeType: ["Single Family", "Condo"] }` |
| createdAt | string | `"2024-11-15T10:30:00Z"` |
| newListings | number | `3` |
| emailAlerts | boolean | `true` |

---

## Entity: `searchSuggestions`

Preloaded autocomplete data for the search bar.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"sug-1"` |
| text | string | `"San Francisco, CA"` |
| type | string | `"city"` |
| subtext | string | `"City in California"` |

Types: `"city"`, `"neighborhood"`, `"zip"`, `"address"`, `"county"`

---

## Entity: `mortgageRates`

Static mortgage rate data for display.

| Field | Type | Example |
|-------|------|---------|
| type | string | `"30-Year Fixed"` |
| rate | number | `6.89` |
| apr | number | `6.95` |
| lastUpdated | string | `"2024-12-01"` |

---

## Relationships

```
Property --has--> Agent (property.agent -> agents[].id)
Property --has--> Schools (embedded array)
Property --has--> PriceHistory (embedded array)
Property --has--> TaxHistory (embedded array)
User --saves--> Properties (user.savedHomes -> properties[].id)
User --creates--> SavedSearches (user.savedSearches -> savedSearches[].id)
User --views--> Properties (user.recentlyViewed -> properties[].id)
```

---

## `createInitialData()` Structure

```javascript
export function createInitialData() {
  return {
    currentUser: {
      id: "user-1",
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      phone: "(415) 555-0142",
      avatar: null,
      savedHomes: ["prop-2", "prop-5", "prop-8"],
      savedSearches: ["search-1", "search-2"],
      recentlyViewed: ["prop-1", "prop-3", "prop-7", "prop-12"]
    },

    properties: [
      // ~20-25 properties across San Francisco, Oakland, Berkeley
      // Mix of:
      //   - For Sale (majority, ~15)
      //   - For Rent (~5)
      //   - Recently Sold (~3)
      //   - Pending (~2)
      // Price range: $350,000 - $2,500,000
      // Types: Single Family, Condo, Townhouse, Multi Family
      // Each with 2-5 mock photos, description, features
      // Properties should be in a realistic area (San Francisco Bay Area)
      // Include variety: some new listings, some with price cuts, some open houses
    ],

    agents: [
      // 8-10 agents
      // Mix of ratings (4.0 - 5.0)
      // Various brokerages
      // Some featured, some not
    ],

    savedSearches: [
      {
        id: "search-1",
        name: "SF Under 900K",
        location: "San Francisco, CA",
        filters: {
          minPrice: 500000,
          maxPrice: 900000,
          minBeds: 2,
          homeType: ["Single Family", "Condo"]
        },
        createdAt: "2024-11-15T10:30:00Z",
        newListings: 3,
        emailAlerts: true
      },
      {
        id: "search-2",
        name: "Oakland Family Homes",
        location: "Oakland, CA",
        filters: {
          minPrice: 600000,
          maxPrice: 1200000,
          minBeds: 3,
          minBaths: 2,
          homeType: ["Single Family"]
        },
        createdAt: "2024-10-20T14:00:00Z",
        newListings: 5,
        emailAlerts: true
      }
    ],

    searchSuggestions: [
      { id: "sug-1", text: "San Francisco, CA", type: "city", subtext: "City in California" },
      { id: "sug-2", text: "Oakland, CA", type: "city", subtext: "City in California" },
      { id: "sug-3", text: "Berkeley, CA", type: "city", subtext: "City in California" },
      { id: "sug-4", text: "Pacific Heights", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
      { id: "sug-5", text: "Mission District", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
      { id: "sug-6", text: "Noe Valley", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
      { id: "sug-7", text: "94102", type: "zip", subtext: "San Francisco, CA" },
      { id: "sug-8", text: "94103", type: "zip", subtext: "San Francisco, CA" },
      { id: "sug-9", text: "94110", type: "zip", subtext: "San Francisco, CA" },
      { id: "sug-10", text: "94607", type: "zip", subtext: "Oakland, CA" },
      // ... more
    ],

    mortgageRates: [
      { type: "30-Year Fixed", rate: 6.89, apr: 6.95, lastUpdated: "2024-12-01" },
      { type: "20-Year Fixed", rate: 6.67, apr: 6.74, lastUpdated: "2024-12-01" },
      { type: "15-Year Fixed", rate: 6.12, apr: 6.21, lastUpdated: "2024-12-01" },
      { type: "5/1 ARM", rate: 6.45, apr: 7.01, lastUpdated: "2024-12-01" },
      { type: "7/1 ARM", rate: 6.55, apr: 6.98, lastUpdated: "2024-12-01" }
    ],

    // UI state
    searchFilters: {
      location: "",
      listingStatus: "For Sale",
      minPrice: null,
      maxPrice: null,
      minBeds: null,
      minBaths: null,
      homeType: [],
      minSqft: null,
      maxSqft: null,
      minYearBuilt: null,
      maxYearBuilt: null,
      minLotSize: null,
      keywords: "",
      sortBy: "Homes for You",
      hasGarage: false,
      hasPool: false,
      hasAC: false,
      daysOnZillow: null, // null = Any, or 1, 7, 14, 30, 90
      openHouse: false
    }
  };
}
```

---

## Property Data Seed Requirements

Generate **25 realistic San Francisco Bay Area properties**:

### Distribution
| Category | Count | Notes |
|----------|-------|-------|
| For Sale — Single Family | 8 | $650K - $2.5M, 2-5 beds |
| For Sale — Condo | 5 | $450K - $1.2M, 1-3 beds |
| For Sale — Townhouse | 3 | $600K - $1.4M, 2-4 beds |
| For Rent — Apartment | 3 | $2,500 - $5,500/mo, 1-3 beds |
| For Rent — House | 2 | $4,000 - $7,500/mo, 3-4 beds |
| Recently Sold | 2 | Various types |
| Pending | 2 | Various types |

### Tag Distribution
- 3-4 with "New Listing" (daysOnZillow < 3)
- 2-3 with "Price Cut" tag
- 2 with "Open House" and openHouse time
- 1 with "Hot Home" tag
- 2-3 with "Foreclosure" or "For Sale By Owner"

### Location Variety
Use real San Francisco Bay Area neighborhoods:
- San Francisco: Pacific Heights, Mission District, Noe Valley, Castro, Sunset, Richmond, SOMA, Marina
- Oakland: Rockridge, Temescal, Lake Merritt, Montclair
- Berkeley: North Berkeley, Downtown Berkeley

### Photo Strategy
Since we can't use real photos, use colored gradient placeholder divs or a single placeholder image service URL pattern like:
```
`https://placehold.co/800x600/e0e0e0/999?text=Photo+${n}`
```
Each property should reference 3-6 photos.
