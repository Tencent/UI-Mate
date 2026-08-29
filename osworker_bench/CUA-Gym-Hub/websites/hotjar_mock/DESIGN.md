# Design System Inspired by Xotjar

## 1. Visual Theme & Atmosphere

Xotjar uses a clean, modern SaaS analytics interface with a predominantly white background, a compact left sidebar for navigation, and a spacious main content area. The overall feel is professional, data-focused, and minimal -- designed for quick scanning of analytics data. The brand identity features the distinctive Xotjar flame logo in red/orange, paired with a mostly monochrome UI that uses color sparingly for emphasis, status indicators, and data visualizations. The heatmap views use vivid thermal gradients (red/yellow/green/blue) overlaid on greyed-out website screenshots.

## 2. Color Palette & Roles

### Primary
- **Brand Red/Orange** (`#FF3C00`): Xotjar flame logo, primary brand accent
- **Background** (`#FFFFFF`): Main content area background
- **Sidebar Background** (`#FAFBFC`): Light gray sidebar background
- **Text Primary** (`#2D3038`): Headings, primary text
- **Text Secondary** (`#6B7280`): Descriptions, muted labels, timestamps

### Accent
- **Blue Link** (`#3B82F6`): Active sidebar item, links, selected states
- **Blue Highlight** (`#EBF5FF`): Active sidebar item background highlight

### Interactive
- **Button Primary** (`#FF3C00`): CTA buttons (matches brand)
- **Button Secondary** (`#F3F4F6`): Secondary/outline buttons
- **Button Hover** (`#E63500`): Primary button hover state
- **Focus Ring** (`#3B82F6`): Input/button focus outline

### Surface & Borders
- **Card Surface** (`#FFFFFF`): Card/panel backgrounds
- **Border Light** (`#E5E7EB`): Card borders, dividers, table lines
- **Border Medium** (`#D1D5DB`): Input borders
- **Sidebar Border** (`#E5E7EB`): Right border of sidebar

### Status
- **Success/Green** (`#10B981`): Positive metrics, active status
- **Warning/Yellow** (`#F59E0B`): Caution indicators
- **Error/Red** (`#EF4444`): Errors, rage clicks, frustration indicators
- **Info/Blue** (`#3B82F6`): Information badges

### Heatmap Gradient
- **Hot** (`#FF0000`): Maximum activity
- **Warm** (`#FF8800`): High activity
- **Medium** (`#FFFF00`): Moderate activity
- **Cool** (`#00FF00`): Low activity
- **Cold** (`#0000FF`): Minimal activity

## 3. Typography Rules

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page Title | Inter, -apple-system, sans-serif | 24px | 700 | 32px | -0.02em |
| Section Heading | Inter, sans-serif | 18px | 600 | 24px | -0.01em |
| Card Title | Inter, sans-serif | 16px | 600 | 22px | 0 |
| Body | Inter, sans-serif | 14px | 400 | 20px | 0 |
| Body Bold | Inter, sans-serif | 14px | 600 | 20px | 0 |
| Small/Caption | Inter, sans-serif | 12px | 400 | 16px | 0 |
| Stat Number | Inter, sans-serif | 28px | 700 | 34px | -0.02em |
| Sidebar Item | Inter, sans-serif | 13px | 500 | 18px | 0 |
| Badge | Inter, sans-serif | 11px | 600 | 14px | 0.02em |

## 4. Spacing & Layout

- **Sidebar width (collapsed)**: 56px (icon-only mode with tooltips)
- **Sidebar width (expanded)**: 220px (shows labels next to icons)
- **Header height**: 56px (contains site selector, search, user avatar)
- **Content padding**: 24px (main area left/right/top)
- **Card padding**: 20px
- **Card gap**: 16px (between dashboard cards)
- **Section gap**: 24px (between major sections)
- **Border radius (cards)**: 8px
- **Border radius (buttons)**: 6px
- **Border radius (inputs)**: 6px
- **Border radius (badges)**: 12px (pill shape)
- **Icon size (sidebar)**: 20px
- **Icon size (inline)**: 16px

## 5. Component Patterns

### Sidebar Navigation Item
```css
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  color: #6B7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.sidebar-item:hover { background: #F3F4F6; color: #2D3038; }
.sidebar-item.active { background: #EBF5FF; color: #3B82F6; border-left: 3px solid #3B82F6; }
```

### Metric Card
```css
.metric-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 20px;
}
.metric-card .value { font-size: 28px; font-weight: 700; color: #2D3038; }
.metric-card .label { font-size: 12px; font-weight: 400; color: #6B7280; text-transform: uppercase; }
.metric-card .sparkline { height: 32px; margin-top: 8px; }
```

### Button Primary
```css
.btn-primary {
  background: #FF3C00;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover { background: #E63500; }
```

### Button Secondary
```css
.btn-secondary {
  background: #FFFFFF;
  color: #2D3038;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.btn-secondary:hover { background: #F3F4F6; }
```

### Filter Pill / Tag
```css
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 13px;
  color: #2D3038;
}
```

### Table Row
```css
.table-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
  font-size: 14px;
  cursor: pointer;
}
.table-row:hover { background: #F9FAFB; }
```

### Toggle Switch Group (Device/Type selector in heatmaps)
```css
.toggle-group {
  display: inline-flex;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  overflow: hidden;
}
.toggle-btn {
  padding: 6px 12px;
  border: none;
  background: #FFFFFF;
  font-size: 13px;
  cursor: pointer;
  border-right: 1px solid #E5E7EB;
}
.toggle-btn:last-child { border-right: none; }
.toggle-btn.active { background: #2D3038; color: #FFFFFF; }
```

### Date Range Selector
```css
.date-selector {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 13px;
  color: #2D3038;
  cursor: pointer;
}
```

## 6. Shadow & Elevation

- **Card shadow**: `0 1px 3px rgba(0, 0, 0, 0.08)`
- **Dropdown shadow**: `0 4px 12px rgba(0, 0, 0, 0.12)`
- **Modal shadow**: `0 8px 32px rgba(0, 0, 0, 0.16)`
- **Toast/notification shadow**: `0 4px 16px rgba(0, 0, 0, 0.12)`
- **Sidebar shadow** (when overlapping): `2px 0 8px rgba(0, 0, 0, 0.06)`
