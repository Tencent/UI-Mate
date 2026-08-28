# Design System Inspired by Xmplitude Analytics

## 1. Visual Theme & Atmosphere

Xmplitude has a clean, professional SaaS analytics aesthetic with a predominantly white/light gray background, bright blue accent color for interactive elements, and a well-organized information hierarchy. The interface feels spacious, data-focused, and modern. The left sidebar uses a narrow icon-only rail (when collapsed) or wider text sidebar (when expanded), with a top navigation bar containing the Create button, breadcrumb dropdowns (Recent, Favorites, Spaces), a prominent search bar, and utility icons. The overall feel is clinical yet approachable -- focused on data visualization clarity above all.

## 2. Color Palette & Roles

### Primary
- **Primary Brand / CTA** (`#1E61F0`): Blue used for "Create" button, links, active states, primary buttons
- **Background** (`#FFFFFF`): Main content area background
- **Surface / Cards** (`#FFFFFF`): Card backgrounds, chart containers
- **Page Background** (`#F7F8FA`): Subtle gray behind cards on home dashboard
- **Text Primary** (`#1B1B25`): Main body text, headings -- near-black
- **Text Secondary** (`#6B6F76`): Muted labels, descriptions, timestamps

### Accent
- **Blue Accent** (`#1E61F0`): Links, interactive text, selected tabs, active sidebar items
- **Blue Hover** (`#1550D4`): Darker blue for hover on primary buttons
- **Blue Light** (`#E8EEFB`): Light blue background for selected states, active tab underlines

### Interactive
- **Link / Button** (`#1E61F0`): All clickable text links and primary buttons
- **Hover Background** (`#F0F1F3`): Row hover, sidebar item hover
- **Selected / Active** (`#E8EEFB`): Active sidebar item background, selected measurement tab
- **Focus Ring** (`#1E61F0`): 2px blue outline on focused inputs

### Surface & Borders
- **Card Background** (`#FFFFFF`): Dashboard cards, chart panels
- **Border Light** (`#E4E5E8`): Card borders, table dividers, input borders
- **Border Separator** (`#ECEDF0`): Thinner separators between list items
- **Sidebar Background** (`#FFFFFF`): Left sidebar background
- **Sidebar Icon Rail** (`#FFFFFF`): Collapsed icon-only sidebar

### Status
- **Success / Green** (`#00875A`): Positive metric changes (up arrow)
- **Warning / Yellow** (`#F5A623`): Caution states, warning badges
- **Error / Red** (`#DE350B`): Negative metric changes (down arrow), error states
- **Info Blue** (`#1E61F0`): Info badges, tooltip triggers

### Chart Series Colors (default palette)
- **Series 1** (`#1E61F0`): Blue
- **Series 2** (`#8BC34A`): Green/lime
- **Series 3** (`#9C27B0`): Purple
- **Series 4** (`#FF9800`): Orange
- **Series 5** (`#E91E63`): Pink
- **Series 6** (`#00BCD4`): Cyan
- **Series 7** (`#795548`): Brown
- **Series 8** (`#607D8B`): Blue-gray

## 3. Typography Rules

Xmplitude uses a clean sans-serif system font stack.

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page Title | Inter, system-ui | 24px | 600 (semibold) | 32px | -0.2px |
| Section Heading | Inter, system-ui | 18px | 600 | 24px | -0.1px |
| Card Title | Inter, system-ui | 16px | 600 | 22px | 0 |
| Body / Table Cell | Inter, system-ui | 14px | 400 | 20px | 0 |
| Body Semibold | Inter, system-ui | 14px | 500 | 20px | 0 |
| Small / Caption | Inter, system-ui | 12px | 400 | 16px | 0.1px |
| Small Semibold | Inter, system-ui | 12px | 500 | 16px | 0.1px |
| Metric Large | Inter, system-ui | 28px | 700 (bold) | 36px | -0.3px |
| Button | Inter, system-ui | 14px | 500 | 20px | 0 |
| Nav Item | Inter, system-ui | 14px | 400 | 20px | 0 |
| Sidebar Nav | Inter, system-ui | 14px | 400 | 20px | 0 |

## 4. Spacing & Layout

- **Top Bar Height**: 52px
- **Icon Sidebar Width** (collapsed): 48px
- **Expanded Sidebar Width**: 200px
- **Content Area Padding**: 24px
- **Card Padding**: 20px
- **Card Gap**: 16px
- **Card Border Radius**: 8px
- **Button Border Radius**: 6px
- **Input Border Radius**: 6px
- **Table Row Height**: 48px
- **Section Spacing**: 24px
- **Form Field Gap**: 12px
- **Modal Border Radius**: 12px

## 5. Component Patterns

### Top Navigation Bar
- Height: 52px, white background, bottom border `#E4E5E8`
- Left: hamburger icon (24px), blue "Create" button (rounded, 32px height, `#1E61F0` bg, white text), "Recent" / "Favorites" / "Spaces" dropdown links
- Center: search bar with magnifying glass icon, placeholder "Search or ask a question", `Cmd+K` shortcut hint, ~400px wide, gray border, rounded
- Right: "Invite Members" with X close, notification bell icon, help circle icon, settings gear icon, "Upgrade" link with sparkle icon

### Create Button
- Background: `#1E61F0`, color: white, border-radius: 6px, padding: 6px 16px, font-weight: 500
- Hover: `#1550D4`

### Left Sidebar (Expanded)
- Width: 200px, white background, left border none, slight shadow or border-right `#E4E5E8`
- Items: icon (20px) + text, padding: 8px 12px, border-radius: 6px
- Active item: blue text `#1E61F0`, light blue background `#E8EEFB`
- Hover: background `#F0F1F3`
- Sections: Home, All Content, Live Events, Ask Xmplitude, Product Analytics (expandable), Web Analytics (expandable), Users (expandable), Session Replay, Experiment (expandable), Data, Releases
- Bottom: MTU usage indicator (progress bar)

### Left Sidebar (Icon Rail - collapsed)
- Width: 48px, icons only, tooltip on hover
- Icons are 20px, centered in 48px column
- Order: Home, Analytics (chart), Spark/AI, Arrow/Pathfinder, Dashboard, Chat/Messaging, Users, Clock/History, Experiment beaker, Comments, Data flow

### Chart Type Tabs (in chart builder)
- Row of icon+text tabs: Segmentation (line chart icon), Funnel (funnel icon), Data Table (grid icon), Retention (curved arrow icon), Journeys (flow icon), More (three dots)
- Active tab: blue underline 2px, blue text
- Inactive: gray text, no underline

### Chart Builder Left Panel
- Width: ~400px, scrollable, white background
- Sections: Events (collapsible), Measured as (collapsible), Segment by (collapsible), Group Segment by
- Each section has a chevron and header text
- "Measured as" section: pill-style toggle buttons (Uniques, Event Totals, Active %, Average, Frequency, Properties) -- selected has blue border and text
- Event items: letter badge (A, B, C), event icon (colored circle), event name, three-dot menu
- "+ Add Event" link in blue
- Segment items: drag handle (6 dots), numbered badge, "All Users" with X to remove, filter links

### Chart Area (Right Panel)
- Toolbar: "Anomaly + Forecast" toggle button, "Compare" dropdown, data freshness text, refresh icon | chart type dropdown (Line chart, Bar chart, Pie chart, etc.), Daily/Weekly/Monthly dropdown, time range pills (7d, 30d, 60d, 90d), calendar icon
- Chart: SVG area with axes, gridlines at 25% opacity, series lines/bars
- Legend: below chart, colored dots + series name
- Below chart: "Breakdown by" dropdown, search field, "Export CSV" button
- Data table: checkbox column, colored dot, segment name, date columns, "Row Average" column

### Dashboard Cards
- White background, 8px border-radius, 1px border `#E4E5E8`
- Title bar: card title (16px semibold), info icon, time range subtitle
- Optional drag handle (6-dot grid icon) top-left on hover
- Cards can contain: line charts, bar charts, tables, metric values, maps

### Metric Cards (on Home)
- Horizontal row of metric tabs: "Visitors (Uniques)", "Page Views (Event Totals)", "Bounce Rate", "Page Views Per Session"
- Selected tab: blue border, slightly larger text
- Metric value: large number (28px bold), delta percentage with colored arrow (green up / red down)

### Dropdown/Popover
- White background, border-radius 8px, box-shadow: `0 4px 16px rgba(0,0,0,0.12)`
- Search input at top
- Grouped sections with gray section headers
- Items: icon + text, hover background `#F0F1F3`

### Table
- Header: uppercase labels (12px, `#6B6F76`), sortable with chevron
- Rows: 48px height, hover `#F7F8FA`, border-bottom `#ECEDF0`
- Links in blue, clickable
- Inline bar charts in cells (light blue fill)

### Buttons
- **Primary**: `#1E61F0` bg, white text, 6px radius, 36px height
- **Secondary/Outline**: white bg, `#E4E5E8` border, dark text, 6px radius
- **Ghost**: transparent bg, blue text, no border
- **Pill Tabs**: rounded-full, border `#E4E5E8`, selected: `#1E61F0` border + text

### Form Inputs
- Height: 36px, border: 1px `#E4E5E8`, border-radius: 6px, padding: 8px 12px
- Focus: border `#1E61F0`, ring 2px `rgba(30,97,240,0.15)`
- Placeholder: `#9CA0A6`

## 6. Shadow & Elevation

- **Card (resting)**: `0 1px 3px rgba(0,0,0,0.06)` or just border
- **Dropdown/Popover**: `0 4px 16px rgba(0,0,0,0.12)`
- **Modal Overlay**: background `rgba(0,0,0,0.4)`, modal shadow `0 8px 32px rgba(0,0,0,0.16)`
- **Tooltip**: `0 2px 8px rgba(0,0,0,0.12)`, dark bg `#1B1B25`, white text, border-radius 6px
- **Sidebar hover**: no shadow, background color change only
