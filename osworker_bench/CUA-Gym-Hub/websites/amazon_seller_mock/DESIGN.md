# Design System Inspired by Xmazon Seller Central

## 1. Visual Theme & Atmosphere

Xmazon Seller Central is a dense, data-driven business management dashboard designed for professional third-party sellers. The interface prioritizes information density and functional clarity over visual polish. It uses a clean white background with a dark navy/charcoal top navigation bar, creating a strong horizontal anchor. The overall feel is corporate-utilitarian: no rounded corners on cards, minimal decorative elements, tight spacing, and a font stack that emphasizes readability at small sizes. The signature Amazon orange appears sparingly as an accent for primary CTAs, active states, and the iconic Amazon smile logo. The left sidebar navigation (accessible via hamburger menu) uses a dark overlay panel. Tables and data grids dominate most views, with blue hyperlinks for interactive text elements.

The design language says: "This is a serious business tool." Every pixel serves a purpose. There is no whitespace luxury -- information is packed densely with small fonts, narrow row heights, and compact form layouts. Color is functional, not decorative: green for healthy/active, red for problems/alerts, orange for primary actions, blue for links.

**Key Characteristics:**
- White page background with dark navy top bar (#232f3e)
- Dense, table-heavy data layouts with compact row heights
- Amazon orange (#ff9900) as primary accent / CTA color
- Blue (#0066c0) for hyperlinks and secondary actions
- Left hamburger-menu sidebar navigation with dark overlay
- Tabs and sub-navigation within content areas
- Minimal border-radius (2-4px), sharp professional appearance
- Status badges: green (healthy), red (critical), yellow (warning)

## 2. Color Palette & Roles

### Primary
- **Amazon Navy** (`#232f3e`): Top navigation bar background, primary dark surface
- **Amazon Dark** (`#131921`): Deepest dark, used in footer/secondary nav areas
- **Page Background** (`#f5f7fa`): Light gray page canvas behind content cards
- **White Surface** (`#ffffff`): Card backgrounds, content panels, table surfaces

### Accent
- **Amazon Orange** (`#ff9900`): Primary CTA buttons, active tab indicators, logo smile, key highlights
- **Amazon Orange Hover** (`#e88b00`): Hover state for orange buttons
- **Amazon Orange Light** (`#fff3cd`): Light orange background for info banners

### Interactive
- **Link Blue** (`#0066c0`): All clickable text links, secondary action text
- **Link Blue Hover** (`#c45500`): Hovered links turn orange-brown (Amazon convention)
- **Button Primary** (`#ff9900`): Primary action buttons (orange with dark text)
- **Button Secondary** (`#e7e9ec`): Secondary buttons (gray background, dark border)
- **Button Secondary Border** (`#adb1b8`): Border for secondary/outline buttons

### Surface & Borders
- **Card Surface** (`#ffffff`): Content card backgrounds
- **Card Border** (`#dddddd`): Default card/section borders
- **Table Row Hover** (`#f7feff`): Subtle blue tint on table row hover
- **Table Header BG** (`#f3f3f3`): Table header row background
- **Divider** (`#e7e7e7`): Horizontal dividers between sections
- **Input Border** (`#888c8c`): Form input default border
- **Input Focus** (`#007185`): Teal focus ring for input elements

### Status
- **Success** (`#067d62`): Healthy account metrics, active listings, "Shipped" status
- **Success BG** (`#dff0d8`): Light green background for success banners
- **Warning** (`#b7791f`): Caution states, approaching limits
- **Warning BG** (`#fff3cd`): Light yellow for warning banners
- **Error/Critical** (`#d13212`): Account health issues, policy violations, critical alerts
- **Error BG** (`#fce4ec`): Light red background for error banners
- **Info** (`#007185`): Teal, informational highlights and focus states

### Sidebar (Hamburger Menu)
- **Sidebar Overlay** (`rgba(0,0,0,0.5)`): Dark overlay behind open sidebar
- **Sidebar BG** (`#232f3e`): Dark sidebar background
- **Sidebar Text** (`#ffffff`): White text in sidebar
- **Sidebar Hover** (`#37475a`): Hover state for sidebar menu items
- **Sidebar Active** (`#485769`): Active/selected sidebar item
- **Sidebar Divider** (`#3b4a5c`): Divider lines in sidebar

## 3. Typography Rules

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page Title | Amazon Ember, Arial, sans-serif | 28px | 700 | 36px | -0.2px |
| Section Heading | Amazon Ember, Arial, sans-serif | 18px | 700 | 24px | 0 |
| Card Title | Amazon Ember, Arial, sans-serif | 16px | 700 | 22px | 0 |
| Body | Amazon Ember, Arial, sans-serif | 13px | 400 | 18px | 0 |
| Body Small | Amazon Ember, Arial, sans-serif | 12px | 400 | 16px | 0 |
| Table Header | Amazon Ember, Arial, sans-serif | 12px | 700 | 16px | 0 |
| Table Cell | Amazon Ember, Arial, sans-serif | 13px | 400 | 18px | 0 |
| Button | Amazon Ember, Arial, sans-serif | 13px | 400 | 18px | 0 |
| Label | Amazon Ember, Arial, sans-serif | 13px | 700 | 18px | 0 |
| Caption/Help | Amazon Ember, Arial, sans-serif | 11px | 400 | 16px | 0 |
| Nav Item | Amazon Ember, Arial, sans-serif | 14px | 400 | 20px | 0 |
| KPI Number | Amazon Ember, Arial, sans-serif | 24px | 700 | 32px | 0 |

Note: Amazon Ember is proprietary. Use `Arial, Helvetica, sans-serif` as the actual fallback. The font renders nearly identically.

## 4. Spacing & Layout

- **Top navigation bar height:** 50px
- **Sidebar width (when open):** 280px (slides from left as overlay)
- **Content area max-width:** 1400px, centered
- **Content padding:** 20px horizontal, 16px top
- **Card padding:** 16px
- **Card margin-bottom:** 16px
- **Card border:** 1px solid #dddddd
- **Card border-radius:** 4px
- **Table row height:** 40px
- **Table cell padding:** 8px 12px
- **Form input height:** 32px
- **Form input padding:** 4px 8px
- **Button height:** 32px
- **Button padding:** 4px 12px
- **Button border-radius:** 3px
- **Tab bar height:** 40px
- **Badge padding:** 2px 8px
- **Badge border-radius:** 3px
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40px
- **Grid gap (dashboard cards):** 16px

## 5. Component Patterns

### Top Navigation Bar
- Height 50px, background #232f3e, fixed at top
- Left: hamburger menu icon (3 bars, white, 20px), 12px gap, "amazon" logo in white + orange smile arrow, "Seller Central" text in white
- Center: search bar with magnifying glass icon, 400px max width, white bg, border-radius 4px, placeholder "Search Seller Central"
- Right: notification bell icon, marketplace flag (US), messages envelope icon, settings gear icon, "Help" text link, user display name -- all white text/icons, 16px gap between items

### Sidebar Navigation (Hamburger Menu)
- Slides from left, 280px wide, full height, dark bg #232f3e
- Close X button top-right corner of sidebar
- Menu sections separated by #3b4a5c dividers
- Items: 14px text, 44px row height, 16px left padding, hover bg #37475a
- Section headers: 12px uppercase, #999 color, 8px bottom margin
- Nested sub-items indented additional 16px

### Primary Button (Orange)
```css
background: linear-gradient(to bottom, #f7dfa5, #f0c14b);
border: 1px solid #a88734;
border-radius: 3px;
color: #111;
font-size: 13px;
padding: 4px 12px;
height: 32px;
cursor: pointer;
```
Hover: border-color #a88734, shadow: 0 1px 0 rgba(0,0,0,.1)

### Secondary Button
```css
background: linear-gradient(to bottom, #f7f8fa, #e7e9ec);
border: 1px solid #adb1b8;
border-radius: 3px;
color: #111;
font-size: 13px;
padding: 4px 12px;
height: 32px;
```

### Data Table
```css
/* Table */
border-collapse: collapse;
width: 100%;
border: 1px solid #ddd;

/* Header */
background: #f3f3f3;
font-weight: 700;
font-size: 12px;
text-align: left;
padding: 8px 12px;
border-bottom: 2px solid #ddd;

/* Cell */
padding: 8px 12px;
border-bottom: 1px solid #eee;
font-size: 13px;

/* Row hover */
background: #f7feff;
```

### Status Badge
```css
display: inline-block;
padding: 2px 8px;
border-radius: 3px;
font-size: 12px;
font-weight: 700;
/* Variants */
/* Active/Shipped: bg #dff0d8, color #067d62, border 1px solid #c3e6cb */
/* Pending: bg #fff3cd, color #856404, border 1px solid #ffeaa7 */
/* Error/Cancelled: bg #fce4ec, color #d13212, border 1px solid #f5c6cb */
/* Inactive: bg #e7e9ec, color #555, border 1px solid #ccc */
```

### Form Input
```css
height: 32px;
padding: 4px 8px;
border: 1px solid #888c8c;
border-radius: 4px;
font-size: 13px;
outline: none;
/* Focus */
border-color: #007185;
box-shadow: 0 0 0 3px rgba(0,113,133,0.15);
```

### Tabs
```css
/* Tab bar */
border-bottom: 1px solid #ddd;
display: flex;
gap: 0;

/* Tab item */
padding: 8px 16px;
font-size: 14px;
color: #0066c0;
cursor: pointer;
border-bottom: 3px solid transparent;

/* Active tab */
color: #111;
font-weight: 700;
border-bottom: 3px solid #ff9900;
```

### Alert/Banner
```css
padding: 12px 16px;
border-radius: 4px;
font-size: 13px;
display: flex;
align-items: center;
gap: 8px;
/* Info: bg #e6f7f9, border-left 4px solid #007185 */
/* Warning: bg #fff3cd, border-left 4px solid #b7791f */
/* Error: bg #fce4ec, border-left 4px solid #d13212 */
/* Success: bg #dff0d8, border-left 4px solid #067d62 */
```

## 6. Shadow & Elevation

- **Card shadow:** `0 1px 2px rgba(0,0,0,0.1)` (subtle, barely visible)
- **Dropdown shadow:** `0 2px 4px rgba(0,0,0,0.15)`
- **Modal shadow:** `0 4px 16px rgba(0,0,0,0.25)`
- **Sidebar overlay shadow:** `4px 0 8px rgba(0,0,0,0.2)` (on the sidebar panel itself)
- **Sticky header shadow:** `0 2px 4px rgba(0,0,0,0.1)` (when scrolled)
- **Popover shadow:** `0 2px 8px rgba(0,0,0,0.15)`
- **Tooltip shadow:** `0 1px 4px rgba(0,0,0,0.2)`

## 7. Animation & Transitions

- **Sidebar slide-in:** `transform: translateX(-100%) -> translateX(0)`, `transition: transform 250ms ease-out`
- **Sidebar overlay fade:** `opacity: 0 -> 1`, `transition: opacity 200ms ease`
- **Dropdown open:** `opacity: 0 -> 1; transform: translateY(-4px) -> translateY(0)`, `transition: 150ms ease`
- **Table row hover:** `transition: background-color 100ms ease`
- **Inline edit focus:** `transition: border-color 150ms ease, box-shadow 150ms ease`
- **Button hover:** `transition: background 100ms ease`
- **Tab underline:** `transition: border-color 150ms ease`
- **Badge pulse (new notification):** subtle scale pulse animation `1 -> 1.1 -> 1`, `200ms ease`

## 8. Iconography

Use `lucide-react` icons throughout. Key icon mappings:
- Hamburger menu: `Menu` (3 bars)
- Search: `Search`
- Notifications: `Bell`
- Messages: `Mail`
- Settings: `Settings` (gear)
- Help: `HelpCircle`
- Close sidebar: `X`
- Chevron (dropdowns): `ChevronDown`
- Sort ascending: `ChevronUp`
- Sort descending: `ChevronDown`
- External link: `ExternalLink`
- Edit: `Pencil`
- Delete/Trash: `Trash2`
- Add/Plus: `Plus`
- Check/Success: `CheckCircle`
- Warning: `AlertTriangle`
- Error: `AlertCircle`
- Info: `Info`
- Star (feedback): `Star`
- Package (orders): `Package`
- BarChart (reports): `BarChart3`
- DollarSign (payments): `DollarSign`
- TrendingUp (sales): `TrendingUp`
- TrendingDown: `TrendingDown`
- Truck (shipping): `Truck`
- Tag (pricing): `Tag`
- Shield (account health): `Shield`
- MessageSquare (messages): `MessageSquare`
- RotateCcw (returns): `RotateCcw`
- Megaphone (advertising): `Megaphone`

## 9. Page-Level Layout Patterns

### Dashboard Layout
```
+----------------------------------------------+
| [TopNav: hamburger | logo | search | icons]  | 50px
+----------------------------------------------+
| [KPI Card] [KPI Card] [KPI Card] [KPI Card] | ~100px
+----------------------------------------------+
| [Account Health Banner - full width]         | ~50px
+----------------------------------------------+
| [Sales Line Chart - full width]              | ~300px
+----------------------------------------------+
| [Action Items 60%] | [Quick Links 40%]       | ~250px
+----------------------------------------------+
```

### Table Page Layout (Orders, Inventory, Pricing)
```
+----------------------------------------------+
| [TopNav]                                      |
+----------------------------------------------+
| [Page Title "Manage Orders"]                  | 28px title
+----------------------------------------------+
| [Tab: All | Pending | Unshipped | Shipped...] | 40px tabs
+----------------------------------------------+
| [Search input] [Filters] [Search btn]         | 48px
+----------------------------------------------+
| [Data Table with sortable columns]            | flex-grow
| [... rows ...]                                |
+----------------------------------------------+
| [Pagination: < 1 2 3 ... 5 >]                | 48px
+----------------------------------------------+
```

### Messages Layout (Split Panel)
```
+----------------------------------------------+
| [TopNav]                                      |
+----------------------------------------------+
| [Page Title "Buyer Messages"]                 |
+----------------------------------------------+
| [Thread List 40%] | [Thread Detail 60%]       |
| [Filter tabs]     | [Buyer name + subject]    |
| [Search]          | [Message bubbles...]       |
| [Thread items...] | [Reply composer]           |
+----------------------------------------------+
```
