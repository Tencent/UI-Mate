# Xestlaw Mock -- Research Summary

## App Overview

**Xestlaw** (by Thomson Reuters) is the leading online legal research platform used by attorneys, judges, law students, and legal professionals worldwide. It provides access to over 40,000 databases including case law, statutes, regulations, secondary sources, court documents, and legal analytics. The current version is marketed as "Xestlaw Precision" (successor to "Xestlaw Edge" and "WestlawNext").

**Core value**: Xestlaw enables legal professionals to find relevant case law, verify that legal authorities are still valid (via KeyCite), browse legal topics via the West Key Number System, and organize their research into folders and trails.

**Real URL**: https://1.next.westlaw.com (requires subscription)

---

## Key User Personas

1. **Litigation Attorney**: Searches for case precedent, checks KeyCite status, builds research folders for specific matters, uses litigation analytics.
2. **Law Student / Associate**: Performs broad research using natural language queries, browses by topic/key number, reads secondary sources for background.
3. **Transactional Attorney**: Looks up statutes and regulations, compares statutory language across jurisdictions, uses legislative history.
4. **Paralegal / Legal Researcher**: Runs detailed searches with Boolean operators, organizes results into folders, sets up alerts for new case law.

---

## Complete Feature List

### P0 -- Core Shell (Must have for app to render)
- Top navigation header bar (dark navy) with logo, search bar, jurisdiction selector, search button
- Secondary navigation bar (History, Folders, Favorites, Notifications, user profile)
- Homepage with content type tabs (AI-Assisted Research, Precision Research, Content Types, Cases, Statutes, Practical Law, Secondary Sources, Regulations)
- Browse section below tabs with category links (Business Law Center, Capital Watch, General Counsel Resources, Dockets, Litigation Analytics, etc.)
- Routing between homepage, search results, document view, folders, history
- State management with React Context + dataManager

### P1 -- Primary Features (Core interactive workflows)
- **Search with autocomplete**: Type in search bar, see typeahead suggestions grouped by: Questions (natural language), Search Suggestions (key number-based), Content Pages. Jurisdiction dropdown filter (All State & Federal, specific states, federal only).
- **Search results overview page**: After search, show results grouped by content type (Overview tab), with left sidebar showing content type counts (Cases, Trial Court Orders, Statutes & Court Rules, Secondary Sources, Practical Law, Regulations).
- **Cases results list**: Paginated list with case title (hyperlinked blue), court name, date, citation, WL number. Each result shows: KeyCite flag icon, headnote topic tags (yellow highlighted search terms), synopsis excerpt with bold/highlighted keywords. Sort by Relevance dropdown. Pagination (1-20, next, etc.).
- **Left filter panel**: Collapsible filter categories -- Jurisdiction, Date, Reported Status, Practice Area, Procedural Posture, Judge, Attorney, Law Firm, Key Number, Party. Each expandable with + icon. "Search within results" text input at top. "Restore previous filters" link.
- **Document view (case)**: Full case document with: case name, court, date, citations at top. Synopsis section. Headnotes (numbered, each with key number topic tag and one-paragraph summary). Full opinion text. "Show synopsis" / "Hide synopsis" toggle.
- **KeyCite flags**: Visual flag indicators on case results -- red (overruled), yellow (negative history), orange (implied overruling), green C (citing refs only), blue striped (on appeal).
- **Content type switching**: Click content type tabs (Cases, Statutes & Court Rules, Secondary Sources, etc.) to filter results to that type.
- **Folder management**: Create folders, add documents to folders, view folder contents, rename/delete folders.
- **Research history**: Reverse-chronological list of recent searches and viewed documents, with graphical timeline view option.

### P2 -- Secondary Features (Depth and realism)
- **Favorites/starred items**: Star documents for quick access, view favorites list.
- **Alerts/notifications**: Bell icon with badge count, notification panel showing recent alerts for saved searches.
- **KeyCite detail view**: Click flag to see full KeyCite history (citing references, negative treatment list, depth of treatment bars).
- **Statutes document view**: Statute text with section numbers, annotations, historical notes, KeyCite flag.
- **Secondary sources view**: Treatise/encyclopedia article with table of contents sidebar, section navigation.
- **Litigation analytics**: Judge analytics page showing motion grant rates, average time to ruling (placeholder charts/data).
- **Copy/print/download actions**: Toolbar buttons for copy citation, email, print, download on document view.
- **Sort options**: Relevance, Date (newest), Date (oldest), Most cited.
- **Bulk actions on results**: Select multiple results (checkbox), add to folder, print, email, download.
- **Browse by Key Number**: Hierarchical topic tree (e.g., Constitutional Law > First Amendment > Freedom of Speech) with expandable nodes.
- **Statutes Compare**: Side-by-side comparison of statute versions (visual diff with redlines).

---

## UI Layout Descriptions

### Homepage
- **Header** (48px, dark navy): Thomson Reuters / Xestlaw Edge logo (left), central search bar (white, ~500px wide) with jurisdiction dropdown ("All State & Federal") and orange search button, right side: user icon, sign-out
- **Secondary nav** (40px, slightly lighter navy): Horizontal links -- History, Folders, Favorites, Notifications (with badge)
- **Content area** (white background, centered):
  - "Get Started" quick-access bar with shortcut links
  - Tab row: AI-Assisted Research | Precision Research | Content Types | Cases | Statutes | Practical Law | Secondary Sources | Regulations
  - Below tabs: welcome/feature content or browse category grid
  - Browse grid: 2-column layout of category links (Business Law Center, Capitol Watch, etc.)

### Search Results -- Overview
- **Header**: Same persistent header with search bar pre-filled with query
- **Left sidebar** (~220px): Content type list with result counts (Overview, Cases 1,904, Trial Court Orders 68, Statutes & Court Rules 71, Secondary Sources 1,200, Practical Law 159, Regulations 43)
- **Main content**: Overview showing top results from each content type, with "Set default" link and filter options

### Search Results -- Cases
- **Left sidebar**: "Filter category: Cases" header, "Restore previous filters" link, "Search within results" input, expandable filter sections (Jurisdiction, Date, Reported Status, Practice Area, Procedural Posture, Judge, Attorney, Law Firm, Key Number, Party)
- **Main content**: "Cases (1,904)" title, pagination "1-20 >", sort dropdown (Relevance), view options (list/detail), "Select all items" checkbox. Each result: checkbox, doc icon, KeyCite flag, numbered result, case name (blue link), court + date + citation + WL number (gray), topic headnote (yellow highlighted), synopsis excerpt, "Show synopsis" toggle.

### Document View -- Case
- **Header**: Same persistent header
- **Left sidebar**: Table of contents / document outline (optional)
- **Main content**: Case name heading, court, date, citation. Synopsis block. Numbered headnotes with key number tags. Full opinion text with judge attribution. Holdings section.
- **Right sidebar** (optional): "Selected Topics" finding aids

---

## Screenshots Reference (Visual Ground Truth for Dev Agent)

### `000001.jpg` -- Search Results Overview Page
Shows the full search results overview layout after searching "What constitutes an adverse action under a First Amendment employment discrimination claim?". Key UI elements visible:
- Dark navy header bar with "THOMSON REUTERS XESTLAW EDGE" logo left, centered search bar (pre-filled with query), "All State & Federal" jurisdiction dropdown, orange search button, right icons (History/Folders/Favorites/Notifications/User)
- Left sidebar (light gray background) labeled "Content types" with "Set default" link: Overview (active), Cases 1,451, Trial Court Orders 68, Statutes & Court Rules 71, Secondary Sources 1,200, Practical Law 159, Regulations 43. Below: "Filter" header and "Select multiple" toggle
- Main content area: query as heading in blue/bold, "All State & Federal" jurisdiction label. Results grouped by content type. Each case result shows: doc icon, numbered entry, blue hyperlinked case title, gray metadata line (court, date, citation, WL number), topic headnote row (with key number references), and a synopsis excerpt with search terms bolded/highlighted in yellow
- Two case results visible: "Duccillo v. Whittemore" and "Charleston v. McCarthy"

### `000002.jpg` -- Cases Results List (PRIMARY REFERENCE for case results)
Full-width Cases results view. Critical for replicating the main search results page:
- Header: same dark navy bar with search query visible
- Left sidebar labeled "Filter category / Cases" with: "Restore previous filters" button (blue outline), "Search within results" text input with magnifying glass. Below: expandable filter categories each with "+" icon: Jurisdiction, Date, Reported Status, Practice Area, Procedural Posture, Judge, Attorney, Law Firm, Key Number, Party
- Main content: "Cases (1,904)" heading in large bold text. Pagination row: "1 - 20 >" with arrows. Sort dropdown "Relevance". Toolbar icons: alert bell, list/grid view toggles, copy, print, email icons
- "Select all items" checkbox + "No items selected" + "Related documents" link
- Result #1: "Frisenda v. Incorporated Village of Malverne" -- court "United States District Court, E.D. New York", date "March 31, 2011", citation "775 F.Supp.2d 486", WL number "2011 WL 1227774". Below title: topic tag line "LABOR AND EMPLOYMENT - Discrimination" with highlighted terms in yellow/bold. "Show synopsis" toggle with right arrow. Below: multi-paragraph headnote excerpts with highlighted search terms (yellow background for "employment", "actions", "discrimination", "claim", "adverse", "First Amendment", "constitutes" etc.)
- Result #2: "Laface v. Eastern Suffolk Boces" -- similar layout

### `000003.jpg` -- Homepage with Search Autocomplete (PRIMARY REFERENCE for autocomplete)
Shows the homepage with the autocomplete dropdown open after typing "employment discrimination":
- Dark navy header with search bar active, showing typed text "employment discrimination"
- Autocomplete dropdown (white, wide, shadow) with three sections:
  1. "Questions" section (left column labels: "Questions", "Cases", "Statutes & Court Rules", "Regulations", "Other"): Natural language questions like "Is employment discrimination a tort?", "Is summary judgment appropriate in employment discrimination cases?", "What constitutes an adverse action under a First Amendment employment discrimination claim?" -- each with "All State & Federal" jurisdiction label
  2. "Search Suggestions" section: Key-number-based suggestions with highlighted matching terms in yellow, e.g., "Cases with the Key Number for civil rights/employment practices/age discrimination/education, employment in"
  3. "Content Pages" section: "Employment Discrimination Coordinator" link
- Below dropdown: browse grid visible -- "Business Law Center", "Capitol Watch", "General Counsel Resources", "Dockets", "Litigation Analytics", "Company Investigator", etc.

### `000004.jpg` -- Quick Check Modal
Small modal/upload area. Less relevant -- out of scope for mock.

### `000005.jpg` -- Case Result Expanded with Synopsis and Holdings (PRIMARY REFERENCE for document detail)
Shows an expanded case result for "Frisenda v. Incorporated Village of Malverne" with all details visible:
- Left sidebar: same content types list (Overview, Cases 1,318, etc.) with "Filter" and "Filter category" sections
- Main content: "Cases (1,318)" heading, pagination "1 - 20 >"
- Result #1 expanded: Case title, court info, date, citation. "Hide synopsis" toggle (indicating synopsis is currently shown). Synopsis text block: "LABOR AND EMPLOYMENT - Discrimination. Fact issues precluded summary judgment as to village police lieutenant's First Amendment..." with highlighted terms
- "Holdings" section: "The District Court, Joseph F. Bianco, J., held that:" followed by numbered holdings (7 items): "1 lieutenant's speech contained in memorandum to police chief was not protected by First Amendment", "2 lieutenant's membership and participation in union was protected activity under First Amendment", "3 lieutenant's involvement in federal lawsuit brought by another police officer constituted protected speech", etc. Holdings use numbered list with terms highlighted in yellow/bold
- "Motion for summary judgment granted in part and denied in part" procedural outcome

### `reference/docs_0004.png` -- Xestlaw Precision Homepage (REFERENCE for modern homepage)
Shows the newer "Xestlaw Precision" branding homepage:
- Header: Dark navy gradient with "THOMSON REUTERS XESTLAW PRECISION" logo. Secondary nav: "All", "CLH", "History", "Tables", "Folders", "Community", "Bookmarks", "CoCounsel" tabs
- Search bar centered with jurisdiction dropdown
- "Get Started" quick-access bar below header
- Tab row: "AI-Assisted Research" (active, orange underline) | "Precision Research" | "Content Types" | "Cases" | "Statutes" | "Practical Law" | "Secondary Sources" | "Regulations"
- Main content: "Welcome to Xestlaw's AI-Assisted Research" heading with paragraph description. Two cards: "How the AI works" and "Tips for best results". Below: "Legal question" text area and jurisdiction selector
- "Key Features" section below

---

## Notes on Scope

- **Authentication**: App starts pre-logged-in as "Sarah Chen" (attorney at Morrison & Associates)
- **No real API calls**: All searches return from pre-seeded mock data
- **No file uploads**: Quick Check upload feature is out of scope
- **No real email/print**: Copy/print/download buttons can show toast notifications but do not perform real actions
- **Limited dataset**: ~50 mock cases, ~20 mock statutes, ~10 mock secondary sources -- enough for realistic search and browsing
