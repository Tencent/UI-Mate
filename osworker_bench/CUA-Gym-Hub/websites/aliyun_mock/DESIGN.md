# Design System Inspired by Alibaba Cloud (Xliyun) Console

## 1. Visual Theme & Atmosphere

The Alibaba Cloud management console follows a professional, enterprise-grade cloud infrastructure design. The interface is clean, information-dense, and optimized for managing complex cloud resources. The top navigation bar is dark (near-black) providing strong contrast against the light content area. The left sidebar uses a white/light gray background with clearly organized service navigation. The overall feel is utilitarian and functional, prioritizing data density and quick access over decorative elements. The design derives from the Alibaba Fusion design system (also called "Wind"), an enterprise component library built on React.

## 2. Color Palette & Roles

### Primary
- **Brand Orange** (`#FF6A00`): Alibaba Cloud brand color, used sparingly for logos, key CTAs, and active states
- **Console Primary** (`#0070CC`): Primary interactive blue, used for links, primary buttons, selected states
- **Background** (`#F5F5F5`): Main page background, light gray
- **Text Primary** (`#333333`): Primary body text
- **Text Secondary** (`#666666`): Secondary/muted text
- **Text Tertiary** (`#999999`): Placeholder text, disabled text

### Top Navigation Bar
- **Nav Background** (`#232F3E`): Dark charcoal/navy top bar (matches Xliyun's dark header)
- **Nav Text** (`#FFFFFF`): White nav text
- **Nav Text Muted** (`#B0B8C1`): Dimmed nav items
- **Nav Hover** (`#37475A`): Hover background on nav items

### Interactive
- **Link Blue** (`#0070CC`): All clickable links and interactive elements
- **Link Hover** (`#0058A3`): Hovered links
- **Button Primary** (`#FF6A00`): Primary action buttons (orange brand)
- **Button Primary Hover** (`#E55D00`): Hovered primary buttons
- **Button Normal** (`#0070CC`): Standard action buttons
- **Button Normal Hover** (`#0058A3`): Hovered standard buttons

### Surface & Borders
- **Card/Surface** (`#FFFFFF`): Card backgrounds, panels, tables
- **Sidebar Background** (`#FFFFFF`): Left sidebar background
- **Border Light** (`#E8E8E8`): Table borders, card borders, dividers
- **Border Medium** (`#D9D9D9`): Input borders
- **Row Hover** (`#F2F6FC`): Table row hover background

### Status
- **Success** (`#1DC11D`): Running, healthy, online
- **Warning** (`#FFA003`): Alerts, pending, expiring
- **Error** (`#FF3333`): Stopped, errors, critical alerts
- **Info** (`#0070CC`): Informational badges

### Tag / Badge Colors
- **Tag Green Background** (`#E6F9E6`): Running status badge bg
- **Tag Green Text** (`#1DC11D`): Running status text
- **Tag Red Background** (`#FFE6E6`): Stopped status badge bg
- **Tag Red Text** (`#FF3333`): Stopped status text
- **Tag Blue Background** (`#E6F0FF`): Info badge bg
- **Tag Orange Background** (`#FFF3E0`): Warning badge bg

## 3. Typography Rules

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page Title | "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif | 20px | 600 | 28px | 0 |
| Section Title | same stack | 16px | 600 | 24px | 0 |
| Card Title | same stack | 14px | 600 | 22px | 0 |
| Body | same stack | 13px | 400 | 20px | 0 |
| Small / Caption | same stack | 12px | 400 | 18px | 0 |
| Nav Item | same stack | 13px | 400 | 20px | 0 |
| Top Nav | same stack | 13px | 400 | 20px | 0 |
| Table Header | same stack | 12px | 600 | 18px | 0 |
| Table Cell | same stack | 13px | 400 | 20px | 0 |
| Button | same stack | 13px | 400 | 20px | 0 |
| Instance ID / Code | "Menlo", "Monaco", "Consolas", "Courier New", monospace | 13px | 400 | 20px | 0 |

## 4. Spacing & Layout

- **Top Navbar height**: 50px
- **Left Sidebar width (collapsed)**: 48px (icon-only rail)
- **Left Sidebar width (expanded)**: 200px
- **Content left padding**: 24px
- **Content top padding**: 16px
- **Content right padding**: 24px
- **Card padding**: 16px
- **Card gap (vertical)**: 16px
- **Table row height**: 46px
- **Form field height**: 32px
- **Button height (small)**: 28px
- **Button height (normal)**: 32px
- **Button height (large)**: 40px
- **Border radius (card)**: 2px
- **Border radius (button)**: 2px
- **Border radius (input)**: 2px
- **Border radius (tag/badge)**: 2px
- **Region selector dropdown**: positioned in top nav, width ~180px

## 5. Component Patterns

### Top Navigation Bar
```css
.top-nav {
  height: 50px;
  background: #232F3E;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: #FFFFFF;
  font-size: 13px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
```
Elements left-to-right: hamburger menu icon | Alibaba Cloud logo (orange) | product name breadcrumb | region selector dropdown | search bar (centered, ~400px wide) | notification bell | message icon | support/help | user avatar+name dropdown

### Left Sidebar
```css
.sidebar {
  width: 200px;
  background: #FFFFFF;
  border-right: 1px solid #E8E8E8;
  position: fixed;
  top: 50px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  padding-top: 8px;
}
.sidebar-item {
  height: 40px;
  padding: 0 16px;
  font-size: 13px;
  color: #333333;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.sidebar-item:hover {
  background: #F2F6FC;
}
.sidebar-item.active {
  color: #0070CC;
  background: #E6F0FF;
  border-right: 3px solid #0070CC;
}
.sidebar-group-title {
  font-size: 12px;
  color: #999999;
  padding: 12px 16px 4px;
  text-transform: uppercase;
}
```

### Primary Button (Orange)
```css
.btn-primary {
  background: #FF6A00;
  color: #FFFFFF;
  border: none;
  border-radius: 2px;
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  cursor: pointer;
}
.btn-primary:hover {
  background: #E55D00;
}
```

### Normal Button
```css
.btn-normal {
  background: #FFFFFF;
  color: #333333;
  border: 1px solid #D9D9D9;
  border-radius: 2px;
  height: 32px;
  padding: 0 16px;
  font-size: 13px;
  cursor: pointer;
}
.btn-normal:hover {
  border-color: #0070CC;
  color: #0070CC;
}
```

### Text Link Button
```css
.btn-text {
  background: none;
  border: none;
  color: #0070CC;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}
.btn-text:hover {
  color: #0058A3;
}
```

### Data Table
```css
.data-table {
  width: 100%;
  border: 1px solid #E8E8E8;
  border-collapse: collapse;
  background: #FFFFFF;
}
.data-table th {
  background: #FAFAFA;
  border-bottom: 1px solid #E8E8E8;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #333333;
  text-align: left;
}
.data-table td {
  padding: 10px 16px;
  font-size: 13px;
  color: #333333;
  border-bottom: 1px solid #E8E8E8;
}
.data-table tr:hover {
  background: #F2F6FC;
}
```

### Status Tag
```css
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
}
.status-tag.running {
  background: #E6F9E6;
  color: #1DC11D;
}
.status-tag.stopped {
  background: #FFE6E6;
  color: #FF3333;
}
```

### Card / Panel
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 2px;
  padding: 16px;
  margin-bottom: 16px;
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E8E8E8;
}
```

### Search Input
```css
.search-input {
  height: 32px;
  border: 1px solid #D9D9D9;
  border-radius: 2px;
  padding: 0 12px;
  font-size: 13px;
  outline: none;
}
.search-input:focus {
  border-color: #0070CC;
  box-shadow: 0 0 0 2px rgba(0, 112, 204, 0.15);
}
```

### Region Selector (top bar dropdown)
```css
.region-selector {
  height: 32px;
  background: #37475A;
  border: 1px solid #4A5B6D;
  border-radius: 2px;
  color: #FFFFFF;
  padding: 0 28px 0 12px;
  font-size: 13px;
}
```

### Pagination
```css
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 12px 0;
}
.pagination-btn {
  min-width: 32px;
  height: 32px;
  border: 1px solid #D9D9D9;
  border-radius: 2px;
  background: #FFFFFF;
  font-size: 13px;
}
.pagination-btn.active {
  border-color: #0070CC;
  color: #0070CC;
}
```

## 6. Shadow & Elevation

- **Card shadow**: none (cards use borders, not shadows)
- **Dropdown shadow**: `0 2px 8px rgba(0, 0, 0, 0.15)`
- **Modal overlay**: `rgba(0, 0, 0, 0.45)`
- **Modal shadow**: `0 4px 12px rgba(0, 0, 0, 0.15)`
- **Tooltip shadow**: `0 2px 8px rgba(0, 0, 0, 0.15)`
- **Sidebar shadow (when floating)**: `2px 0 8px rgba(0, 0, 0, 0.08)`

## 7. Icons

Use simple line-style icons (similar to Alibaba's icon font). For the mock, use `lucide-react` or Unicode symbols as lightweight alternatives. Key icons needed:
- Menu hamburger (top-left)
- Search magnifying glass
- Bell (notifications)
- User avatar circle
- Chevron down (dropdowns)
- Plus (create resource)
- Refresh
- Settings gear
- Trash / delete
- Start / stop / restart (instance actions)
- External link
- Copy to clipboard

## 8. Responsive Notes

The Xliyun console is desktop-only (min-width ~1200px). No mobile layout is needed. The sidebar can collapse to an icon-only rail (48px) to give more space to the main content area.

## 9. Product Catalog Drawer

When the user clicks the hamburger/grid icon (top-left of nav bar), a full-width overlay drawer slides down from the top nav. It contains a grid of all cloud products organized into categories:

```css
.product-catalog-overlay {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
}
.product-catalog-panel {
  background: #FFFFFF;
  max-height: 70vh;
  overflow-y: auto;
  padding: 24px 32px;
}
.product-category-title {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #E8E8E8;
}
.product-item {
  display: inline-flex;
  align-items: center;
  width: 200px;
  padding: 8px 12px;
  font-size: 13px;
  color: #333333;
  cursor: pointer;
  border-radius: 2px;
}
.product-item:hover {
  background: #F2F6FC;
  color: #0070CC;
}
.product-item .star-icon {
  margin-left: auto;
  color: #D9D9D9;
  cursor: pointer;
}
.product-item .star-icon.favorited {
  color: #FFA003;
}
```

Categories in the product catalog (English mock labels):
- **Compute**: ECS, Auto Scaling, Container Service, Function Compute, Simple Application Server
- **Storage**: OSS, NAS, Table Store, Hybrid Backup
- **Database**: RDS, PolarDB, Redis, MongoDB, ApsaraDB for HBase
- **Networking**: VPC, SLB, NAT Gateway, EIP, CDN, Direct Connect
- **Security**: Cloud Firewall, WAF, Security Center, Anti-DDoS
- **Monitoring**: CloudMonitor, Log Service, Application Real-Time Monitoring (ARMS)
- **Developer Tools**: API Gateway, Resource Orchestration, Cloud Shell

## 10. Breadcrumb Pattern

Each page shows a breadcrumb below the top nav bar, inside the content area:

```css
.breadcrumb {
  font-size: 13px;
  color: #666666;
  margin-bottom: 16px;
  padding: 8px 0;
}
.breadcrumb a {
  color: #0070CC;
  text-decoration: none;
}
.breadcrumb a:hover {
  text-decoration: underline;
}
.breadcrumb .separator {
  margin: 0 8px;
  color: #999999;
}
```

Example: `Console Home > Elastic Compute Service > Instances`

## 11. Confirmation Dialog (for destructive actions)

```css
.confirm-dialog {
  width: 416px;
  background: #FFFFFF;
  border-radius: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 24px;
}
.confirm-dialog .icon-warning {
  color: #FFA003;
  font-size: 24px;
  margin-right: 12px;
}
.confirm-dialog .title {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}
.confirm-dialog .message {
  font-size: 13px;
  color: #666666;
  margin: 12px 0 24px;
}
.confirm-dialog .actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

## 12. Tab Navigation (for detail pages)

```css
.tab-nav {
  display: flex;
  border-bottom: 1px solid #E8E8E8;
  margin-bottom: 16px;
}
.tab-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #666666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tab-item:hover {
  color: #0070CC;
}
.tab-item.active {
  color: #0070CC;
  border-bottom-color: #0070CC;
  font-weight: 600;
}
```
