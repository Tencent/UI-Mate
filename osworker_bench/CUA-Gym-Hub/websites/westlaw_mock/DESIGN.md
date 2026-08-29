# Design System Inspired by Xestlaw Edge / Xestlaw Precision

## 1. Visual Theme & Atmosphere

Xestlaw uses a professional, authoritative legal research aesthetic dominated by a dark navy/steel-blue header bar contrasted against a clean white content area. The overall feel is corporate, dense with information, and optimized for long reading sessions. The interface evokes trust and seriousness appropriate for legal professionals. Typography is clean and readable, with clear hierarchy between document titles, metadata, and body text. The color palette is restrained: navy, white, orange accents for branding and warnings, with subtle grays for borders and secondary text.

The Thomson Reuters / Xestlaw Edge branding appears in the top-left of the header. The interface is utilitarian rather than flashy -- every pixel serves a functional purpose for legal research workflows.

## 2. Color Palette & Roles

### Primary
- **Header/Nav Background** (`#1A3A5C`): Dark navy blue used for the top navigation bar
- **Header Gradient** (`#0D2137` to `#1A3A5C`): Subtle gradient in the header area
- **Page Background** (`#FFFFFF`): Clean white for main content areas
- **Content Background** (`#F5F7FA`): Very light gray-blue for sidebar/filter panels

### Accent
- **Brand Orange** (`#E8600A`): Thomson Reuters orange, used for the search button, active tab indicators, and primary CTAs
- **Brand Orange Hover** (`#D05508`): Darker orange for hover states
- **Link Blue** (`#1A73BA`): Blue used for case name hyperlinks and clickable document titles

### Interactive
- **Link/Document Title** (`#1A73BA`): Clickable case names and document links
- **Link Hover** (`#0D5A94`): Darker blue on hover
- **Active Tab Underline** (`#E8600A`): Orange underline for active content type tabs
- **Search Button** (`#E8600A`): Orange search/magnifying glass button

### Surface & Borders
- **Card/Surface** (`#FFFFFF`): White document cards and result items
- **Filter Panel BG** (`#F5F7FA`): Light gray for left sidebar filter area
- **Border Light** (`#D9DDE3`): Subtle borders between sections
- **Border Medium** (`#B8BFC9`): Slightly stronger borders for filter category separators
- **Result Divider** (`#E8ECF0`): Light horizontal rules between search results

### Status / KeyCite Flags
- **Red Flag** (`#CC0000`): Case overruled / no longer good law
- **Yellow Flag** (`#F0AD00`): Negative history but not overruled
- **Orange Flag** (`#E8600A`): Implied overruling risk (AI-detected)
- **Green C** (`#2E8B57`): Citing references, no negative history
- **Blue Striped** (`#3B82C4`): Case on appeal

### Highlight
- **Search Term Highlight** (`#FFF3B0`): Yellow background highlight for matched search terms in results
- **Selected/Active Row** (`#EBF0F5`): Light blue-gray highlight for selected result

## 3. Typography Rules

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Header Nav Links | "Segoe UI", Arial, sans-serif | 13px | 400 | 18px | 0 |
| Page Title (e.g., "Cases (1,904)") | "Segoe UI", Arial, sans-serif | 22px | 600 | 28px | 0 |
| Document/Case Title | "Segoe UI", Arial, sans-serif | 16px | 600 | 22px | 0 |
| Case Metadata (court, date, citation) | "Segoe UI", Arial, sans-serif | 13px | 400 | 18px | 0 |
| Body Text / Synopsis | "Segoe UI", Arial, sans-serif | 14px | 400 | 20px | 0 |
| Filter Category Label | "Segoe UI", Arial, sans-serif | 14px | 600 | 20px | 0 |
| Filter Item | "Segoe UI", Arial, sans-serif | 13px | 400 | 18px | 0 |
| Search Bar Text | "Segoe UI", Arial, sans-serif | 14px | 400 | 20px | 0 |
| Pagination / Count | "Segoe UI", Arial, sans-serif | 13px | 400 | 18px | 0 |
| Tab Labels (Content Types) | "Segoe UI", Arial, sans-serif | 14px | 400 | 20px | 0 |

## 4. Spacing & Layout

- **Header height**: 48px (contains logo, search bar, nav icons)
- **Secondary nav bar**: 40px (History, Folders, Favorites, Notifications links)
- **Content type tabs bar**: 36px (Cases, Statutes, Secondary Sources, etc.)
- **Left filter panel width**: 220px (collapsible)
- **Main content area**: flex-grow, typically 700-900px
- **Content padding**: 20px horizontal, 16px vertical
- **Search result item padding**: 16px vertical, separated by 1px border
- **Card gap**: 0 (results are a continuous list with dividers)
- **Border radius**: 2px (minimal, corporate feel -- Xestlaw uses very subtle rounding)
- **Filter section spacing**: 12px between filter categories
- **Search bar height**: 36px
- **Search bar width**: ~500px in header

## 5. Component Patterns

### Search Bar (Header)
```css
.search-bar {
  background: #FFFFFF;
  border: 1px solid #B8BFC9;
  border-radius: 2px;
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
  width: 500px;
}
.search-button {
  background: #E8600A;
  color: #FFFFFF;
  border: none;
  border-radius: 0 2px 2px 0;
  width: 40px;
  height: 36px;
  cursor: pointer;
}
```

### Content Type Tab
```css
.content-tab {
  padding: 8px 16px;
  font-size: 14px;
  color: #5A6577;
  border-bottom: 3px solid transparent;
  cursor: pointer;
}
.content-tab.active {
  color: #1A3A5C;
  font-weight: 600;
  border-bottom-color: #E8600A;
}
```

### Filter Category (Left Panel)
```css
.filter-category {
  padding: 10px 0;
  border-bottom: 1px solid #E8ECF0;
}
.filter-category-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

### Search Result Item
```css
.result-item {
  padding: 16px 0;
  border-bottom: 1px solid #E8ECF0;
}
.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #1A73BA;
  cursor: pointer;
  text-decoration: none;
}
.result-title:hover {
  text-decoration: underline;
}
.result-metadata {
  font-size: 13px;
  color: #5A6577;
  margin-top: 4px;
}
.result-snippet {
  font-size: 14px;
  color: #333;
  margin-top: 8px;
  line-height: 20px;
}
.highlight {
  background: #FFF3B0;
  padding: 0 2px;
}
```

### KeyCite Flag Icons
```css
.keycite-flag { width: 16px; height: 16px; display: inline-block; margin-right: 4px; }
.flag-red { color: #CC0000; }
.flag-yellow { color: #F0AD00; }
.flag-orange { color: #E8600A; }
.flag-green { color: #2E8B57; }
```

### Button Styles
```css
.btn-primary {
  background: #E8600A;
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 14px;
  cursor: pointer;
}
.btn-secondary {
  background: #FFFFFF;
  color: #1A3A5C;
  border: 1px solid #B8BFC9;
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 14px;
  cursor: pointer;
}
```

## 6. Shadow & Elevation

- **Dropdown menus**: `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)`
- **Autocomplete/typeahead**: `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12)`
- **Modal dialogs**: `box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2)`
- **Header**: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)` (subtle bottom shadow)
- **Cards**: No shadow (flat design with borders for separation)

## 7. Icon Style

Xestlaw uses simple, thin-line icons in the header navigation area. Icons for History (clock), Folders (folder), Favorites (star), Notifications (bell), and user profile are rendered as small SVG or Unicode glyphs at approximately 18px size in white/light color against the dark header background. The search icon is a magnifying glass. KeyCite flags use filled triangular flag shapes.
