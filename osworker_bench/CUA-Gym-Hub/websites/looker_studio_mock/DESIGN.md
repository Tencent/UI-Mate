# Design System Inspired by Xooker Studio

## 1. Visual Theme & Atmosphere

Xooker Studio follows Google's Material Design 3 aesthetic with a clean, professional, data-focused interface. The home page is bright and airy with a white background, subtle gray borders, and blue accent color. The report editor uses a darker toolbar area with a white canvas and a right-side properties panel. The overall feel is functional and business-oriented, prioritizing data clarity over decorative elements. Typography is crisp and uses Google's proprietary fonts. The interface uses a minimal color palette where blue signals interactivity and the data visualizations themselves provide the color variety.

## 2. Color Palette & Roles

### Primary
- **Google Blue (Primary Brand)** (`#4285F4`): Primary action buttons, active tab indicators, selected items, links
- **Background** (`#FFFFFF`): Page background, canvas area, card backgrounds
- **Surface** (`#F8F9FA`): Home page background, secondary areas, report list background
- **Text Primary** (`#202124`): Headings, body text, data values
- **Text Secondary** (`#5F6368`): Labels, descriptions, metadata, timestamps

### Accent
- **Xooker Studio Brand Blue** (`#4285F4`): Logo accent, toolbar active states
- **Xooker Studio Icon** (`#4285F4` with `#669DF6` lighter ring): The Xooker Studio logo icon (connected circles/rings)

### Interactive
- **Link/Button Blue** (`#1A73E8`): Text links, primary buttons background
- **Button Hover** (`#1765CC`): Primary button hover state
- **Icon Default** (`#5F6368`): Toolbar icons default state
- **Icon Hover** (`#202124`): Toolbar icons on hover
- **Selection Blue** (`#E8F0FE`): Selected item background, active nav item

### Surface & Borders
- **Card Surface** (`#FFFFFF`): Cards, panels, modals
- **Border Light** (`#DADCE0`): Card borders, table borders, dividers
- **Border Medium** (`#E8EAED`): Secondary dividers, panel borders
- **Panel Background** (`#F1F3F4`): Properties panel background, toolbar background
- **Canvas Background** (`#F0F0F0`): The gray area behind the white report canvas in editor mode

### Status & Data Colors
- **Chart Blue** (`#4285F4`): Default chart series 1
- **Chart Red** (`#EA4335`): Chart series 2, negative values
- **Chart Yellow** (`#FBBC04`): Chart series 3
- **Chart Green** (`#34A853`): Chart series 4, positive indicators
- **Chart Teal** (`#00BCD4`): Chart series 5
- **Chart Purple** (`#9C27B0`): Chart series 6
- **Success** (`#34A853`): Positive changes
- **Warning** (`#FBBC04`): Warnings
- **Error** (`#EA4335`): Errors, negative changes

## 3. Typography Rules

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page Title | Google Sans, Roboto, sans-serif | 22px | 400 | 28px | 0 |
| Section Title | Google Sans, Roboto, sans-serif | 16px | 500 | 24px | 0 |
| Toolbar Label | Roboto, sans-serif | 14px | 400 | 20px | 0.1px |
| Body Text | Roboto, sans-serif | 14px | 400 | 20px | 0.2px |
| Body Small | Roboto, sans-serif | 12px | 400 | 16px | 0.3px |
| Caption | Roboto, sans-serif | 11px | 400 | 16px | 0.3px |
| Menu Item | Roboto, sans-serif | 14px | 400 | 20px | 0.2px |
| Button Text | Google Sans, Roboto, sans-serif | 14px | 500 | 20px | 0.25px |
| Report Name | Google Sans, Roboto, sans-serif | 18px | 400 | 24px | 0 |
| Chart Value | Roboto, sans-serif | 14px | 500 | 20px | 0 |
| Scorecard Large | Roboto, sans-serif | 32px | 300 | 40px | 0 |
| Properties Label | Roboto, sans-serif | 12px | 500 | 16px | 0.5px |

## 4. Spacing & Layout

### Home Page
- Top header height: 64px
- Search bar in header: 720px max-width, 48px height, 24px border-radius, `#F1F3F4` background
- Template gallery row: horizontal scroll, card size 160px x 120px
- Report list: full width, each row 48px height
- Content max-width: 960px centered
- Content padding: 24px horizontal

### Report Editor
- Menu bar height: 40px (contains File, Edit, View, Insert, Format, Arrange, Page, Resource, Help)
- Toolbar height: 48px (contains icon buttons for undo/redo, selection mode, add data, add chart, add control, insert text/image/shape/line, zoom level)
- Canvas area: centered, default report page is 1160px x 900px, white background, surrounded by `#F0F0F0` gray
- Right properties panel width: 300px, background `#FFFFFF`, border-left `1px solid #DADCE0`
- Page navigation tabs at bottom: 32px height, horizontal tab bar

### General
- Border radius (buttons): 4px
- Border radius (cards): 8px
- Border radius (search bar): 24px
- Border radius (modals): 8px
- Icon size (toolbar): 24px with 40px click target
- Content gap: 16px
- Section gap: 24px

## 5. Component Patterns

### Primary Button
```css
background: #1A73E8;
color: #FFFFFF;
border: none;
border-radius: 4px;
padding: 8px 24px;
font-size: 14px;
font-weight: 500;
font-family: 'Google Sans', Roboto, sans-serif;
cursor: pointer;
/* hover */ background: #1765CC;
```

### Secondary Button (Outlined)
```css
background: #FFFFFF;
color: #1A73E8;
border: 1px solid #DADCE0;
border-radius: 4px;
padding: 8px 24px;
font-size: 14px;
font-weight: 500;
/* hover */ background: #F8F9FA;
```

### Toolbar Button
```css
background: transparent;
border: none;
border-radius: 4px;
padding: 8px;
color: #5F6368;
cursor: pointer;
/* hover */ background: rgba(0,0,0,0.08);
/* active/selected */ background: #E8F0FE; color: #1A73E8;
```

### Card (Home Page Report Item)
```css
background: #FFFFFF;
border: 1px solid #DADCE0;
border-radius: 4px;
padding: 0;
cursor: pointer;
/* hover */ box-shadow: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
```

### Input Field
```css
background: #FFFFFF;
border: 1px solid #DADCE0;
border-radius: 4px;
padding: 8px 12px;
font-size: 14px;
color: #202124;
/* focus */ border-color: #1A73E8; box-shadow: 0 0 0 1px #1A73E8;
```

### Properties Panel Section Header
```css
font-size: 12px;
font-weight: 500;
color: #5F6368;
text-transform: uppercase;
letter-spacing: 0.5px;
padding: 12px 16px 4px;
```

### Tab Bar (Setup / Style)
```css
display: flex;
border-bottom: 1px solid #DADCE0;
/* Tab item */
padding: 12px 16px;
font-size: 14px;
color: #5F6368;
cursor: pointer;
/* Active tab */
color: #1A73E8;
border-bottom: 2px solid #1A73E8;
font-weight: 500;
```

### Menu Bar
```css
background: #FFFFFF;
border-bottom: 1px solid #DADCE0;
height: 40px;
display: flex;
align-items: center;
padding: 0 8px;
/* Menu item */
padding: 4px 12px;
font-size: 14px;
color: #202124;
border-radius: 4px;
/* Menu item hover */
background: #F1F3F4;
```

### Dropdown Menu
```css
background: #FFFFFF;
border: none;
border-radius: 4px;
box-shadow: 0 2px 6px 2px rgba(60,64,67,0.15), 0 1px 2px rgba(60,64,67,0.3);
padding: 8px 0;
min-width: 200px;
/* Menu item */
padding: 8px 16px;
font-size: 14px;
color: #202124;
/* Menu item hover */
background: #F1F3F4;
```

## 6. Shadow & Elevation

| Level | Usage | Value |
|-------|-------|-------|
| Level 0 | Flat elements | none |
| Level 1 | Cards at rest | `0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)` |
| Level 2 | Cards on hover, panels | `0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)` |
| Level 3 | Dropdown menus, modals | `0 2px 6px 2px rgba(60,64,67,0.15), 0 1px 2px rgba(60,64,67,0.3)` |
| Level 4 | Dialogs | `0 4px 8px rgba(60,64,67,0.3), 0 8px 16px 6px rgba(60,64,67,0.15)` |

## 7. Chart/Visualization Styling

### Default Chart Color Sequence
1. `#4285F4` (Blue)
2. `#EA4335` (Red)
3. `#FBBC04` (Yellow)
4. `#34A853` (Green)
5. `#FF6D01` (Orange)
6. `#46BDC6` (Teal)
7. `#7BAAF7` (Light Blue)
8. `#F07B72` (Light Red)
9. `#FCD04F` (Light Yellow)
10. `#71C287` (Light Green)

### Chart Axis & Grid
- Axis line color: `#DADCE0`
- Grid line color: `#E8EAED`
- Axis label font: Roboto, 11px, `#5F6368`
- Chart background: `#FFFFFF`
- Chart border: none (charts sit directly on the canvas)

### Selected Component (Editor)
- Blue selection handles: `#4285F4` 8px squares at corners and midpoints
- Selection border: `2px solid #4285F4`
- Resize cursor on handles
