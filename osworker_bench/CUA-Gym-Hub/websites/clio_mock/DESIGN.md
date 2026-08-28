# Design System Inspired by Xlio Manage

## 1. Visual Theme & Atmosphere

Xlio Manage uses a professional, clean SaaS aesthetic typical of enterprise legal software. The interface features a dark navy sidebar against a light gray/white main content area. The overall feel is business-like, organized, and data-dense without being overwhelming. The design prioritizes clarity and quick navigation between major sections, with a top toolbar providing global actions (search, timer, create new) and a persistent left sidebar for section navigation.

The color palette is dominated by blues -- from the dark sidebar to the primary action blue used on buttons and links. The UI is minimalist with generous whitespace in content areas, subtle borders, and a restrained use of color to indicate status (green for open/active, orange for pending, gray for closed).

## 2. Color Palette & Roles

### Primary
- **Sidebar Background** (`#1B2A4A`): Dark navy blue, used for the left navigation sidebar
- **Sidebar Text** (`#FFFFFF`): White text for sidebar nav items
- **Sidebar Active Item** (`#2B3F6B`): Slightly lighter navy for active/hover sidebar items
- **Sidebar Icon** (`#6B8CC7`): Muted blue for sidebar icons

### Brand
- **Primary Blue** (`#1A73E8`): Xlio's brand blue, used for primary buttons, links, active tabs
- **Primary Blue Hover** (`#1557B0`): Darker blue for button hover states
- **Primary Blue Light** (`#E8F0FE`): Light blue for selected/active backgrounds

### Background & Surface
- **Page Background** (`#F5F6FA`): Very light gray, main content background
- **Card/Surface** (`#FFFFFF`): White, used for cards, tables, panels
- **Top Bar Background** (`#FFFFFF`): White top navigation bar

### Text
- **Text Primary** (`#1A1A2E`): Near-black, headings and primary body text
- **Text Secondary** (`#5F6368`): Medium gray, secondary labels and metadata
- **Text Muted** (`#9AA0A6`): Light gray, placeholders and disabled text
- **Text Link** (`#1A73E8`): Blue, clickable links

### Border & Dividers
- **Border Light** (`#E0E0E0`): Light gray borders for cards and table rows
- **Border Medium** (`#DADCE0`): Slightly darker borders for input fields
- **Divider** (`#EEEEEE`): Subtle horizontal dividers

### Status Colors
- **Success/Open** (`#34A853`): Green, for open matters and success states
- **Warning/Pending** (`#FBBC04`): Amber/yellow, for pending status
- **Error/Overdue** (`#EA4335`): Red, for errors and overdue items
- **Info** (`#4285F4`): Blue, for informational badges

### Interactive
- **Button Primary BG** (`#1A73E8`): Blue primary button background
- **Button Primary Text** (`#FFFFFF`): White text on primary buttons
- **Button Secondary BG** (`#FFFFFF`): White background with blue border
- **Button Secondary Border** (`#DADCE0`): Gray border for secondary buttons
- **Button Danger** (`#EA4335`): Red for destructive actions
- **Input Focus Border** (`#1A73E8`): Blue border on focused inputs
- **Row Hover** (`#F8F9FA`): Very light gray row hover

## 3. Typography Rules

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page Title | Inter, -apple-system, sans-serif | 24px | 600 | 32px | -0.02em |
| Section Heading | Inter, sans-serif | 18px | 600 | 24px | -0.01em |
| Subsection | Inter, sans-serif | 16px | 600 | 22px | 0 |
| Body | Inter, sans-serif | 14px | 400 | 20px | 0 |
| Body Bold | Inter, sans-serif | 14px | 600 | 20px | 0 |
| Small/Caption | Inter, sans-serif | 12px | 400 | 16px | 0.01em |
| Table Header | Inter, sans-serif | 12px | 600 | 16px | 0.04em |
| Sidebar Nav | Inter, sans-serif | 14px | 500 | 20px | 0 |
| Top Bar | Inter, sans-serif | 14px | 400 | 20px | 0 |
| Button | Inter, sans-serif | 14px | 500 | 20px | 0.01em |
| Badge/Tag | Inter, sans-serif | 11px | 600 | 14px | 0.02em |

## 4. Spacing & Layout

- **Sidebar width**: 200px (collapsible to 56px icon-only mode)
- **Top bar height**: 52px
- **Content padding**: 24px horizontal, 20px vertical
- **Card padding**: 20px
- **Card gap**: 16px
- **Table row height**: 44px
- **Table cell padding**: 12px horizontal
- **Border radius (cards)**: 8px
- **Border radius (buttons)**: 4px
- **Border radius (inputs)**: 4px
- **Border radius (badges/tags)**: 12px (pill shape)
- **Icon size (sidebar)**: 18px
- **Icon size (inline)**: 16px
- **Section gap**: 24px
- **Form field gap**: 16px
- **Modal width**: 560px (standard), 800px (wide)

## 5. Component Patterns

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #1A73E8;
  color: #FFFFFF;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover { background: #1557B0; }

/* Secondary Button */
.btn-secondary {
  background: #FFFFFF;
  color: #1A1A2E;
  border: 1px solid #DADCE0;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
}
.btn-secondary:hover { background: #F5F6FA; }

/* Dropdown Button (e.g. "Create new") */
.btn-dropdown {
  background: #1A73E8;
  color: #FFFFFF;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
```

### Input Fields
```css
.input-field {
  border: 1px solid #DADCE0;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  color: #1A1A2E;
  background: #FFFFFF;
  width: 100%;
  transition: border-color 0.15s;
}
.input-field:focus {
  border-color: #1A73E8;
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
}
.input-field::placeholder { color: #9AA0A6; }
```

### Table
```css
.table-header {
  background: #F5F6FA;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #5F6368;
  padding: 10px 12px;
  border-bottom: 1px solid #E0E0E0;
}
.table-row {
  border-bottom: 1px solid #EEEEEE;
  padding: 12px;
  font-size: 14px;
}
.table-row:hover { background: #F8F9FA; }
```

### Sidebar Navigation Item
```css
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.sidebar-item:hover { background: #2B3F6B; }
.sidebar-item.active {
  background: #2B3F6B;
  font-weight: 600;
}
```

### Tabs (e.g. Dashboard, Communications, Notes, Documents, Bills)
```css
.tab {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #5F6368;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.tab:hover { color: #1A1A2E; }
.tab.active {
  color: #1A73E8;
  border-bottom-color: #1A73E8;
}
```

### Status Badges
```css
.badge-open {
  background: #E6F4EA;
  color: #137333;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.badge-pending {
  background: #FEF7E0;
  color: #B06000;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.badge-closed {
  background: #F1F3F4;
  color: #5F6368;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 20px;
}
```

### Modal/Dialog
```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #FFFFFF;
  border-radius: 8px;
  width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E0E0E0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-body { padding: 24px; }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
```

## 6. Shadow & Elevation

```css
/* Card shadow (subtle) */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

/* Dropdown/popover shadow */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* Modal shadow */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

/* Top bar shadow (subtle bottom edge) */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

/* Sidebar (no shadow, uses color contrast) */
```

## 7. Iconography

Use `lucide-react` icons throughout. Key mappings:
- Dashboard: `LayoutDashboard`
- Calendar: `Calendar`
- Tasks: `CheckSquare`
- Matters: `Briefcase`
- Contacts: `Users`
- Activities: `Clock`
- Billing: `DollarSign`
- Online Payments: `CreditCard`
- Accounts: `Building`
- Documents: `FileText`
- Communications: `MessageSquare`
- Reports: `BarChart3`
- App Integrations: `Puzzle`
- Settings: `Settings`
- Search: `Search`
- Notifications: `Bell`
- Create new: `Plus`
- Timer: `Play`, `Pause`, `Square` (stop)
- Edit: `Pencil`
- Delete: `Trash2`
- Chevron: `ChevronDown`, `ChevronRight`
