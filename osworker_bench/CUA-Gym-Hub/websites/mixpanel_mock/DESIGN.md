# Design System Inspired by Xixpanel

## 1. Visual Theme & Atmosphere

Xixpanel has a clean, professional analytics interface with a predominantly white/light gray background. The design uses a narrow left sidebar for navigation, a consistent top header bar for context (project name, breadcrumbs), and a generous main content area optimized for charts, tables, and query builders. The overall feel is data-dense but organized, with a clear hierarchy achieved through subtle borders, restrained color use, and consistent typography. Purple is the dominant brand/accent color.

The right-side query builder panel is a distinctive Xixpanel pattern -- a sticky side panel used to configure metrics, filters, and breakdowns for reports. This creates a split-pane layout where the left/center area shows visualizations and results while the right panel controls the query.

## 2. Color Palette & Roles

### Primary
- **Primary Brand / Accent** (`#7B5CFF`): The dominant purple used for the "Create New" button, active nav states, primary action buttons (Save, Done, Apply), active tab underlines, and chart legend colors
- **Background** (`#FFFFFF`): Main content area background
- **Sidebar Background** (`#FFFFFF`): Left sidebar, separated by a subtle border
- **Text Primary** (`#1A1A2E`): Main headings, body text, table cell values -- near-black

### Accent
- **Accent Purple Light** (`#EDE8FF`): Light purple tint used for hover states on the Create New button, selected dropdown items, and subtle highlights
- **Accent Gold/Yellow** (`#F5A623`): Used for Upgrade Plan banner background at sidebar bottom

### Interactive
- **Link / Clickable** (`#7B5CFF`): Links in tables (Distinct IDs, event names in Lexicon), inline text links
- **Button Primary** (`#7B5CFF`): Filled purple buttons with white text -- rounded corners, used for Save, Done, Create New, Apply
- **Button Primary Hover** (`#6A4CE0`): Slightly darker purple on hover
- **Button Secondary** (`#FFFFFF`): White background with gray border -- Cancel, Go Back
- **Button Danger** (`#E74C3C`): Red-orange for Delete buttons in confirmation dialogs

### Surface & Borders
- **Card/Surface** (`#FFFFFF`): Report cards on dashboards, modal surfaces
- **Surface Muted** (`#F7F7F8`): Slightly gray background for date picker area, chart toolbar sections, table header backgrounds
- **Border Default** (`#E8E8EC`): 1px borders for table rows, card edges, sidebar separation, input fields
- **Border Active/Focus** (`#7B5CFF`): Purple border on focused inputs

### Status
- **Success / Converted** (`#4CAF50`): Green bars in funnels for "Converted" segments
- **Warning** (`#F5A623`): Yellow/amber used in warning banners (delete event dialog)
- **Error / Did Not Convert** (`#E74C3C`): Red for deletion buttons, "Did Not Convert" in funnels
- **Info** (`#4A90D9`): Blue for informational notices

### Chart Colors (multi-series palette)
- Series 1: `#7B5CFF` (purple)
- Series 2: `#E74C3C` (red)
- Series 3: `#4CAF50` (green/teal)
- Series 4: `#F5A623` (orange)
- Series 5: `#00BCD4` (cyan)
- Series 6: `#9C27B0` (dark purple)
- Series 7: `#FF7043` (coral)
- Series 8: `#607D8B` (gray)

## 3. Typography Rules

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page Title | Inter, -apple-system, sans-serif | 28px | 700 | 1.2 | -0.02em |
| Section Heading | Inter | 18px | 600 | 1.3 | -0.01em |
| Card Title | Inter | 16px | 600 | 1.4 | 0 |
| Body | Inter | 14px | 400 | 1.5 | 0 |
| Body Bold | Inter | 14px | 600 | 1.5 | 0 |
| Table Header | Inter | 13px | 500 | 1.4 | 0.02em |
| Table Cell | Inter | 13px | 400 | 1.4 | 0 |
| Caption / Muted | Inter | 12px | 400 | 1.4 | 0.01em |
| Nav Item | Inter | 14px | 500 | 1.5 | 0 |
| Sidebar Section Label | Inter | 11px | 600 | 1.3 | 0.08em |
| Metric Big Number | Inter | 48px | 700 | 1.1 | -0.02em |

## 4. Spacing & Layout

- **Left Sidebar Width**: 220px (collapsible, icon-only mode ~48px shows Xixpanel X logo, search, home, data, boards icons)
- **Top Header Height**: 48px (contains breadcrumb: "ProjectName / ReportName", action buttons: Save, Share, Link, More)
- **Date Picker Bar Height**: 44px (sits below header, contains date range, time presets: Today/Yesterday/7D/30D/3M/6M/12M, granularity: Day/Week/Month, chart type: Line/Bar/Pie)
- **Right Query Panel Width**: 300px (sticky, scrollable, contains Metrics, Filter, Breakdown sections)
- **Content Padding**: 24px horizontal, 20px vertical
- **Card Gap**: 16px between dashboard report cards
- **Card Padding**: 20px internal
- **Border Radius - Cards**: 8px
- **Border Radius - Buttons**: 6px
- **Border Radius - Inputs**: 6px
- **Border Radius - Modal**: 12px
- **Table Row Height**: 48px
- **Nav Item Height**: 36px
- **Sidebar Section Gap**: 8px

## 5. Component Patterns

### Primary Button
```css
background: #7B5CFF;
color: #FFFFFF;
border: none;
border-radius: 6px;
padding: 8px 16px;
font-size: 14px;
font-weight: 600;
cursor: pointer;
transition: background 0.15s;
```

### Secondary Button
```css
background: #FFFFFF;
color: #1A1A2E;
border: 1px solid #E8E8EC;
border-radius: 6px;
padding: 8px 16px;
font-size: 14px;
font-weight: 500;
cursor: pointer;
```

### Create New Button (sidebar top)
```css
background: #7B5CFF;
color: #FFFFFF;
border: none;
border-radius: 6px;
padding: 10px 20px;
font-size: 14px;
font-weight: 600;
width: 100%;
display: flex;
align-items: center;
gap: 8px;
```

### Input Field
```css
background: #FFFFFF;
border: 1px solid #E8E8EC;
border-radius: 6px;
padding: 8px 12px;
font-size: 14px;
color: #1A1A2E;
outline: none;
transition: border-color 0.15s;
/* Focus state */
border-color: #7B5CFF;
```

### Table
```css
/* Header */
background: #F7F7F8;
font-weight: 500;
font-size: 13px;
color: #6B6B80;
border-bottom: 1px solid #E8E8EC;
/* Row */
border-bottom: 1px solid #E8E8EC;
/* Row hover */
background: #F9F9FB;
```

### Modal / Dialog
```css
background: #FFFFFF;
border-radius: 12px;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
padding: 32px;
max-width: 600px;
```

### Date Range Picker Bar
```css
display: flex;
align-items: center;
gap: 8px;
padding: 8px 24px;
border-bottom: 1px solid #E8E8EC;
background: #FFFFFF;
/* Time preset pills */
padding: 4px 12px;
border-radius: 4px;
font-size: 13px;
/* Active pill */
background: #7B5CFF;
color: #FFFFFF;
```

### Sidebar Nav Item
```css
padding: 8px 12px;
border-radius: 6px;
font-size: 14px;
color: #6B6B80;
cursor: pointer;
/* Active */
color: #1A1A2E;
font-weight: 600;
background: #F3F0FF;
/* Hover */
background: #F7F7F8;
```

### Dropdown
```css
background: #FFFFFF;
border: 1px solid #E8E8EC;
border-radius: 8px;
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
padding: 4px;
/* Item */
padding: 8px 12px;
border-radius: 4px;
/* Item hover */
background: #F7F7F8;
/* Item active */
background: #7B5CFF;
color: #FFFFFF;
```

## 6. Shadow & Elevation

| Level | Usage | CSS |
|-------|-------|-----|
| Level 0 | Flat elements (sidebar, tables) | `none` |
| Level 1 | Cards, popovers | `0 1px 4px rgba(0, 0, 0, 0.08)` |
| Level 2 | Dropdowns, tooltips | `0 4px 16px rgba(0, 0, 0, 0.1)` |
| Level 3 | Modals, overlays | `0 20px 60px rgba(0, 0, 0, 0.15)` |
| Sidebar separator | Left sidebar right edge | `1px solid #E8E8EC` (border, not shadow) |

## 7. Iconography & Logo

- **Xixpanel Logo**: A stylized "X" in purple (`#7B5CFF`) on white background, approximately 20x20px in the sidebar header. The X has slightly tapered strokes.
- **Icon Library**: Use `lucide-react` icons throughout. Key mappings:
  - Home: `Home` icon
  - Search: `Search` icon
  - Data: `Database` icon
  - Events: `Zap` icon
  - Users: `Users` icon
  - Lexicon: `BookOpen` icon
  - Session Replay: `Play` icon (in circle)
  - Settings: `Settings` (gear) icon
  - Help: `HelpCircle` icon
  - Apps Grid: `LayoutGrid` icon
  - Collapse: `ChevronsLeft` / `ChevronsRight` icon
  - Create New: `Plus` icon
  - Filter: `Filter` icon
  - Breakdown: `BarChart3` icon
  - Chart Line: `LineChart` icon
  - Chart Bar: `BarChart` icon
  - Export: `Download` icon
  - Share: `Share2` icon
  - Link: `Link` icon
  - More: `MoreHorizontal` icon
  - Save: `Save` icon (or just text button)
  - Calendar: `Calendar` icon
  - Chevron: `ChevronDown` / `ChevronRight` icon
  - Star/Favorite: `Heart` icon
  - Subscribe: `Bell` icon
  - Duplicate: `Copy` icon
  - Undo: `Undo` icon
  - Alerts: `Bell` icon
  - Refresh: `RefreshCw` icon
  - Delete/Trash: `Trash2` icon
  - Edit/Pencil: `Pencil` icon
  - External Link: `ExternalLink` icon
- **Icon Size**: Default 16px for inline icons, 20px for sidebar nav icons, 14px for table action icons
- **Icon Color**: `#6B6B80` default, `#1A1A2E` on active/hover, `#7B5CFF` for brand actions

## 8. Animation & Transitions

- **Hover transitions**: `transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease`
- **Dropdown open**: Fade in 150ms + slight scale from 0.95 to 1.0
- **Sidebar collapse**: Width transition 200ms ease-in-out
- **Modal open**: Overlay fade 200ms, modal scale from 0.95 to 1.0 in 200ms
- **Active tab underline**: Border-bottom transition 150ms
- **Chart tooltip**: Instant appearance on hover (no delay)

## 9. Specific Component Reference

### Sidebar Section Header
```css
font-size: 11px;
font-weight: 600;
letter-spacing: 0.08em;
text-transform: uppercase;
color: #6B6B80;
padding: 16px 12px 8px;
```

### Board Card
```css
background: #FFFFFF;
border: 1px solid #E8E8EC;
border-radius: 8px;
padding: 20px;
/* Hover */
box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
```

### Time Preset Pill (inactive)
```css
padding: 4px 12px;
border-radius: 4px;
font-size: 13px;
font-weight: 500;
color: #6B6B80;
background: transparent;
cursor: pointer;
/* Hover */
background: #F7F7F8;
```

### Time Preset Pill (active)
```css
padding: 4px 12px;
border-radius: 4px;
font-size: 13px;
font-weight: 600;
color: #FFFFFF;
background: #7B5CFF;
```

### Metric Letter Badge
```css
display: inline-flex;
align-items: center;
justify-content: center;
width: 20px;
height: 20px;
border-radius: 4px;
font-size: 12px;
font-weight: 700;
color: #FFFFFF;
/* Background color matches the series color (e.g., #7B5CFF for A, #E74C3C for B) */
```

### Property Type Icon
```css
/* Aa = string, # = number, calendar = date, user-group = cohort */
display: inline-flex;
align-items: center;
font-size: 11px;
font-weight: 600;
color: #6B6B80;
margin-right: 6px;
```

### Funnel Bar
```css
/* Converted */
background: #7B5CFF;
border-radius: 4px;
/* Did Not Convert / Drop-off */
background: #E0E0E0;
/* Green accent for positive change */
color: #4CAF50;
```

### Upgrade Plan Banner
```css
background: #F5A623;
color: #FFFFFF;
border-radius: 6px;
padding: 10px 12px;
font-size: 13px;
font-weight: 600;
display: flex;
align-items: center;
gap: 8px;
margin: 8px 12px;
cursor: pointer;
```

### User Avatar (Emoji)
```css
/* Xixpanel uses emoji faces as default avatars */
width: 28px;
height: 28px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
font-size: 18px;
background: #F7F7F8;
```

### Status Badge
```css
/* Visible */
font-size: 12px;
font-weight: 500;
color: #4CAF50;
/* Hidden */
color: #6B6B80;
```
