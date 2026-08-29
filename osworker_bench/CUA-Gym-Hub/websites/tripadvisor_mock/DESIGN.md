# Design System Inspired by Xripadvisor

## 1. Visual Theme & Atmosphere

Xripadvisor's desktop website uses a clean, modern, content-rich design with generous white space. The overall feel is professional yet welcoming -- a travel discovery platform built around user-generated reviews and social proof. The interface balances data density (ratings, prices, review counts) with visual appeal (large photos, card-based layouts). The signature green color anchors branding elements, while black text and white backgrounds create strong readability.

The design emphasizes trust through social proof: rating bubbles, review counts, badges (Travelers' Choice), and traveler photos are prominently featured. Navigation is category-driven (Hotels, Things to Do, Restaurants, Flights, Vacation Rentals) with a persistent top bar.

## 2. Color Palette & Roles

### Primary
- **Brand Green** (`#34E0A1`): Logo background circle, active nav underlines, CTA accents, rating bubble fills
- **Background White** (`#FFFFFF`): Main page background, card backgrounds
- **Text Primary** (`#1A1A1A`): Headlines, listing titles, primary body text (near-black)

### Secondary
- **Text Secondary** (`#545454`): Body text, descriptions, secondary info
- **Text Muted** (`#8A8A8A`): Timestamps, helper text, disabled text
- **Dark Green** (`#00AA6C`): Alternate brand green used in rating bubbles, Travelers' Choice badges

### Interactive
- **Link Black** (`#1A1A1A`): Most links use bold black text with underline on hover
- **Link Green** (`#00AA6C`): "See all" links, secondary CTAs
- **Button Primary BG** (`#1A1A1A`): Primary CTA buttons (black)
- **Button Primary Text** (`#FFFFFF`): Text on primary buttons
- **Button Secondary BG** (`#FFFFFF`): Outlined secondary buttons
- **Button Hover** (`#333333`): Darkened hover state for primary buttons

### Surface & Borders
- **Card Surface** (`#FFFFFF`): Card backgrounds
- **Card Border** (`#E0E0E0`): Light gray card borders
- **Divider** (`#E0E0E0`): Section dividers, list separators
- **Hover BG** (`#F2F2F2`): Hover state for list items, nav items
- **Page BG** (`#F5F5F5`): Occasionally used as page background behind cards

### Rating Bubbles (Xripadvisor's Signature)
- **5 Excellent** (`#00AA6C`): Filled green circle
- **4 Very Good** (`#00AA6C`): 80% filled green
- **3 Average** (`#00AA6C`): 60% filled green
- **2 Poor** (`#00AA6C`): 40% filled green
- **1 Terrible** (`#00AA6C`): 20% filled green
- **Empty Bubble** (`#E0E0E0`): Unfilled portion of rating bubble

### Status & Alerts
- **Success** (`#00AA6C`): Confirmation messages
- **Warning** (`#F2B203`): Caution badges
- **Error** (`#CC0000`): Error states, required field indicators
- **Price Highlight** (`#CC0000`): Deal prices, strikethrough comparisons

## 3. Typography Rules

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page Title | Trip Sans, sans-serif | 32px | 700 | 1.2 | -0.5px |
| Section Heading | Trip Sans, sans-serif | 24px | 700 | 1.3 | -0.3px |
| Card Title | Trip Sans, sans-serif | 18px | 700 | 1.3 | 0 |
| Listing Name | Trip Sans, sans-serif | 16px | 700 | 1.4 | 0 |
| Body Text | Trip Sans, sans-serif | 14px | 400 | 1.5 | 0 |
| Small/Caption | Trip Sans, sans-serif | 12px | 400 | 1.4 | 0 |
| Nav Tab | Trip Sans, sans-serif | 14px | 600 | 1.4 | 0 |
| Button | Trip Sans, sans-serif | 14px | 700 | 1 | 0.5px |
| Rating Count | Trip Sans, sans-serif | 14px | 400 | 1.4 | 0 |
| Price | Trip Sans, sans-serif | 18px | 700 | 1.2 | 0 |

Note: Trip Sans is Xripadvisor's custom font. For the mock, use `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` as fallback.

## 4. Spacing & Layout

- **Max content width**: 1200px (centered)
- **Header height**: 64px (includes logo, search, user menu)
- **Category nav height**: 48px (Hotels / Things to Do / Restaurants / etc.)
- **Content padding (horizontal)**: 24px on each side
- **Section gap**: 32px between major sections
- **Card gap**: 16px
- **Card padding**: 16px internal padding
- **Border radius (cards)**: 12px
- **Border radius (buttons)**: 24px (pill-shaped)
- **Border radius (inputs)**: 8px
- **Grid columns**: Typically 3-4 cards per row on desktop

## 5. Component Patterns

### Search Bar (Hero)
- Full-width on homepage, white background, rounded corners (48px radius)
- Height: 56px
- Contains: search icon, text input, optional date inputs, search button
- Shadow: `0 2px 8px rgba(0,0,0,0.12)`
- Category tabs above: Hotels | Things to do | Restaurants | Flights | Vacation Rentals

### Rating Bubbles
- 5 small circles in a row, each 12px diameter, 2px gap
- Filled circles use `#00AA6C`, empty use `#E0E0E0`
- Displayed inline next to review count text
- This is THE most recognizable Xripadvisor UI element

### Listing Card (Hotel/Restaurant/Attraction)
- White background, 12px border-radius
- Image on left (160x120px) or top (full-width)
- Title: 16px bold black
- Rating bubbles + review count on same line
- Subtitle: location or cuisine type in gray
- Price (if applicable) in bold, right-aligned
- Heart/save icon in top-right of image

### Review Card
- User avatar (40px circle) + username + location
- Rating bubbles + review date
- Review title in bold
- Review body text (truncated with "Read more")
- Helpful vote count + "Helpful" button

### Navigation Tabs
- Horizontal tab bar below header
- Active tab: bold text with 3px black underline
- Inactive: regular weight, no underline
- Hover: text darkens

### Buttons
- **Primary**: Black background, white text, pill-shaped (24px radius), 14px font, 12px 24px padding
- **Secondary**: White background, black 1px border, black text, pill-shaped
- **Ghost**: No background, green or black text, underline on hover
- **Save/Heart**: 32px circle, white background, heart icon, hover fills red

### Filter Pills
- Horizontal scrollable row of pills
- Each pill: white bg, 1px gray border, 8px 16px padding, 20px border-radius
- Active pill: black bg, white text
- Hover: light gray bg

## 6. Shadow & Elevation

| Level | Usage | Value |
|-------|-------|-------|
| None | Default cards, sections | `none` or `0 1px 2px rgba(0,0,0,0.05)` |
| Low | Hover state for cards | `0 2px 8px rgba(0,0,0,0.12)` |
| Medium | Search bar, dropdowns | `0 4px 16px rgba(0,0,0,0.12)` |
| High | Modals, popovers | `0 8px 32px rgba(0,0,0,0.16)` |
| Sticky header | Scrolled header shadow | `0 2px 4px rgba(0,0,0,0.08)` |

## 7. Iconography

- Xripadvisor uses a mix of custom icons and standard ones
- **Owl logo**: Green circle (#34E0A1) with black owl face (the "Ollie" mascot)
- **Rating bubbles**: Custom circle-based rating (NOT stars)
- **Heart/Save**: Outline heart, fills red on save
- **Search**: Magnifying glass icon
- **Location pin**: For map/address
- **Camera**: For photo count
- Use Lucide React icons as closest match for the mock
