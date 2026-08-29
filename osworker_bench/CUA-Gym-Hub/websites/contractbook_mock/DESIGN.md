# Design System Inspired by Xontractbook

## 1. Visual Theme & Atmosphere

Xontractbook uses a clean, modern SaaS aesthetic with a predominantly white workspace, subtle gray borders, and a vivid blue accent color. The interface feels professional and document-centric, with generous whitespace and a clear information hierarchy. The overall look is minimal and business-focused, with rounded corners, soft shadows, and a light sidebar that keeps navigation unobtrusive. Typography is clean sans-serif, and the color palette is restrained -- blue for primary actions, colored status badges for contract states, and muted grays for secondary text.

The layout follows a classic three-panel SaaS pattern: a narrow left sidebar for navigation, a top toolbar for context actions, and a wide main content area that displays either a table view (contracts list) or a document editor. The design prioritizes scannability and quick access to contract status.

## 2. Color Palette & Roles

### Primary
- **Primary Brand Blue** (`#1C00FF`): Main CTA buttons, active sidebar items, links, primary accents
- **Primary Blue Hover** (`#1500CC`): Hover state for primary buttons
- **Primary Blue Light** (`#E8E5FF`): Light blue backgrounds for selected states, badges

### Background
- **App Background** (`#F7F8FA`): Main app background behind content areas
- **White** (`#FFFFFF`): Card surfaces, sidebar background, content panels
- **Sidebar Background** (`#FAFBFC`): Left navigation panel

### Text
- **Text Primary** (`#1A1A2E`): Headings, contract names, primary labels
- **Text Secondary** (`#6B7280`): Timestamps, secondary labels, descriptions
- **Text Muted** (`#9CA3AF`): Placeholder text, disabled states
- **Text Inverse** (`#FFFFFF`): Text on dark/colored backgrounds

### Status Colors
- **Draft** (`#6B7280`): Gray badge for draft contracts
- **Pending / Sent** (`#F59E0B`): Amber/yellow badge for contracts awaiting signature
- **Signed** (`#10B981`): Green badge for completed/signed contracts
- **Rejected** (`#EF4444`): Red badge for rejected contracts
- **Expired** (`#9CA3AF`): Light gray badge for expired contracts
- **Changes Requested** (`#F97316`): Orange badge for contracts needing revision

### Interactive
- **Link Blue** (`#1C00FF`): Inline text links
- **Hover Background** (`#F3F4F6`): Row hover, sidebar item hover
- **Focus Ring** (`#1C00FF40`): Focus outline on interactive elements (40% opacity)
- **Selected Row** (`#EEF2FF`): Selected table row background

### Surface & Borders
- **Card Surface** (`#FFFFFF`): Cards, modals, dropdowns
- **Border Light** (`#E5E7EB`): Table borders, card borders, dividers
- **Border Medium** (`#D1D5DB`): Input borders, stronger separators
- **Border Focus** (`#1C00FF`): Focused input border

### Danger / Destructive
- **Danger** (`#EF4444`): Delete buttons, error states
- **Danger Background** (`#FEF2F2`): Error message backgrounds
- **Warning** (`#F59E0B`): Warning indicators
- **Success** (`#10B981`): Success indicators, signed status

## 3. Typography Rules

Xontractbook uses Inter (or system sans-serif fallback) for all text.

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Page Title | Inter | 24px | 700 | 32px | -0.02em |
| Section Heading | Inter | 18px | 600 | 28px | -0.01em |
| Card Title | Inter | 16px | 600 | 24px | 0 |
| Body | Inter | 14px | 400 | 20px | 0 |
| Body Medium | Inter | 14px | 500 | 20px | 0 |
| Small / Caption | Inter | 12px | 400 | 16px | 0 |
| Table Header | Inter | 12px | 600 | 16px | 0.05em |
| Button | Inter | 14px | 500 | 20px | 0 |
| Badge | Inter | 11px | 600 | 14px | 0.03em |
| Editor Body | Inter | 15px | 400 | 24px | 0 |
| Editor H1 | Inter | 28px | 700 | 36px | -0.02em |
| Editor H2 | Inter | 22px | 600 | 30px | -0.01em |
| Editor H3 | Inter | 18px | 600 | 26px | -0.01em |

## 4. Spacing & Layout

- **Sidebar width**: 240px (collapsible to 56px icon-only)
- **Top header height**: 56px
- **Content padding**: 24px horizontal, 24px vertical
- **Card padding**: 16px
- **Card gap**: 12px
- **Table row height**: 52px
- **Table header height**: 40px
- **Border radius (small)**: 4px (inputs, small badges)
- **Border radius (medium)**: 6px (cards, buttons)
- **Border radius (large)**: 8px (modals, panels)
- **Border radius (pill)**: 9999px (status badges, pills)
- **Sidebar item height**: 36px
- **Sidebar item padding**: 8px 12px
- **Sidebar section gap**: 24px
- **Modal width (small)**: 480px
- **Modal width (medium)**: 640px
- **Modal width (large)**: 900px
- **Editor max-width**: 800px (centered in content area)
- **Form field gap**: 16px
- **Button padding**: 8px 16px
- **Button padding (large)**: 10px 24px

## 5. Component Patterns

### Buttons
```css
/* Primary */
.btn-primary {
  background: #1C00FF;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover { background: #1500CC; }

/* Secondary / Outline */
.btn-secondary {
  background: #FFFFFF;
  color: #1A1A2E;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
}
.btn-secondary:hover { background: #F3F4F6; }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: #6B7280;
  border: none;
  padding: 8px 12px;
}
.btn-ghost:hover { background: #F3F4F6; color: #1A1A2E; }

/* Danger */
.btn-danger {
  background: #EF4444;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
}
```

### Inputs
```css
.input {
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 20px;
  background: #FFFFFF;
  color: #1A1A2E;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
  border-color: #1C00FF;
  box-shadow: 0 0 0 3px #1C00FF20;
  outline: none;
}
.input::placeholder { color: #9CA3AF; }
```

### Status Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: capitalize;
}
.badge-draft { background: #F3F4F6; color: #6B7280; }
.badge-pending { background: #FEF3C7; color: #D97706; }
.badge-signed { background: #D1FAE5; color: #059669; }
.badge-rejected { background: #FEE2E2; color: #DC2626; }
.badge-expired { background: #F3F4F6; color: #9CA3AF; }
```

### Table
```css
.table { width: 100%; border-collapse: collapse; }
.table th {
  text-align: left;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #E5E7EB;
  background: #FAFBFC;
}
.table td {
  padding: 14px 16px;
  font-size: 14px;
  border-bottom: 1px solid #F3F4F6;
}
.table tr:hover { background: #F9FAFB; }
```

### Sidebar Navigation Item
```css
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.15s;
}
.sidebar-item:hover { background: #F3F4F6; color: #1A1A2E; }
.sidebar-item.active {
  background: #EEF2FF;
  color: #1C00FF;
  font-weight: 500;
}
```

### Tabs
```css
.tab {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}
.tab:hover { color: #1A1A2E; }
.tab.active {
  color: #1C00FF;
  border-bottom-color: #1C00FF;
}
```

### Cards
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
}
```

## 6. Shadow & Elevation

```css
/* Subtle — cards, content panels */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Medium — dropdowns, popovers */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);

/* Large — modals, dialogs */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);

/* XL — floating panels */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

/* Modal overlay */
--overlay: rgba(0, 0, 0, 0.5);
```

## 7. Icons

Use `lucide-react` icon library throughout. Common icons:
- FileText (contracts/documents)
- FolderOpen (folders)
- LayoutTemplate (templates)
- CheckSquare (tasks)
- Users (contacts)
- Settings (settings)
- Search (search)
- Plus (create new)
- Filter (filter)
- ChevronDown (dropdowns)
- MoreHorizontal (overflow menus)
- Send (send for signature)
- PenTool (sign)
- Clock (pending/history)
- Bell (notifications)
- Tag (tags)
