# XACS Viewer Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-11
> Research: `assets/README.md` | Data model: `assets/data_model.md`

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Core Shell

Without these, the app cannot render. Dev implements these first.

- [x] **Project scaffold**: `npm create vite@latest PACS-viewer_mock -- --template react`, install deps: `react-router-dom`, `lucide-react`, `uuid`. Do NOT use Tailwind — use plain CSS for this app (PACS viewers have very custom dark UI that CSS handles better). Create `src/` structure: `components/`, `pages/`, `context/`, `utils/`.

- [x] **Visual design system**: Dark radiology workstation theme based on `assets/screenshots/ohif_v3_single_viewport.jpg` and `ohif_measurement_tracking.jpg`. Create `src/styles/globals.css` with:
  - Background: `#000000` (viewport), `#090c29` (shell/frame), `#0a1628` (panels), `#1a1a2e` (toolbar)
  - Accent primary: `#05d8e6` (cyan/teal — active tools, selected series border, links)
  - Accent secondary: `#00bcd4` (buttons, badges)
  - Text primary: `#ffffff`, text secondary: `#8899aa`, text overlay: `#e0e0e0`
  - Modality badges: CT=`#2196f3`, MR=`#4caf50`, CR=`#ff9800`, US=`#9c27b0`
  - Measurement yellow: `#ffeb3b`, danger: `#f44336`, success: `#4caf50`
  - Font body: `'Inter', 'Roboto', sans-serif`
  - Font overlay: `'Roboto Mono', 'Consolas', monospace` (for DICOM overlays)
  - CSS custom properties for all colors so components reference `var(--color-bg-viewport)` etc.

- [x] **App layout**: Two main views controlled by routing:
  1. **Study List** (`/studies`): Full-page dark table layout — no sidebar, just header + table body
  2. **Viewer** (`/viewer/:studyId`): Three-region layout — 48px top toolbar bar, left panel (240px collapsible), right panel (280px collapsible), viewport area fills remaining space. All regions have `#090c29` or darker backgrounds. Panels have 1px `#1a2a3a` border separating them from viewport.

- [x] **Routing**: `App.jsx` with `BrowserRouter`, define routes:
  - `/` → redirect to `/studies`
  - `/studies` → StudyList page (worklist)
  - `/viewer/:studyId` → Viewer page (image viewer)
  - `/go` → StateInspector page (returns `{initial_state, current_state, state_diff}`)

- [x] **State management**: `src/context/AppContext.jsx` with React Context + `useReducer`. Import initial data from `src/utils/dataManager.js`. The context provides: `state`, `dispatch`, and convenience functions for common operations (addMeasurement, updateViewport, setActiveTool, etc.). Persist to localStorage under key `pacs_viewer_state`. See `data_model.md` for full `createInitialData()` structure.

- [x] **`/go` endpoint**: `src/pages/StateInspector.jsx` — renders JSON of `{initial_state, current_state, state_diff}`. The `state_diff` should track: new/modified/deleted measurements, changed study statuses, viewport state changes, tool changes. Style: white monospace text on black background.

- [x] **Session isolation**: `vite.config.js` mock-api plugin implementing:
  - `POST /post?sid=<sid>` with `{"action":"set","state":{...}}` — deep merges into both initial + current state
  - `POST /post?sid=<sid>` with `{"action":"set_current","state":{...}}` — updates only current state
  - `POST /post?sid=<sid>` with `{"action":"reset"}` — resets current to initial
  - `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
  - Session state stored in Map keyed by `sid`. When `sid` is present in URL, app reads from session state instead of localStorage.

---

## P1 — Primary Features

Core features a user interacts with in the first 5 minutes. These define the essential XACS Viewer experience.

### P1.1 — Study List (Worklist)

- [x] **Study list table**: Full-width table on `/studies` page with dark background. Columns: checkbox (for selection), Patient Name, MRN, Study Date (formatted as "Nov 15, 2024"), Description, Modality (colored badge), Accession #, # Series, # Instances, Status (colored dot: green=reported, yellow=in_progress, blue=read, red=unread). Table rows have `#090c29` bg, hover → `#1e2a3a`. Alternate row shading subtle. Header row slightly lighter bg `#0d1117`. Each row clickable → navigates to `/viewer/:studyId`. Study data comes from `state.studies` joined with `state.patients`.

- [x] **Study list header**: Above the table, a header bar with: left side = app logo/title "XACS Viewer" in white, right side = user avatar circle with initials "SC" + name "Dr. Sarah Chen" + settings gear icon. Below header, a filter bar with input fields for each column: Patient Name (text), MRN (text), Study Date (date range picker or text), Description (text), Modality (dropdown: All/CT/MR/CR/US/NM/PT), Accession (text). Inputs styled: dark bg `#0a1628`, border `#1a2a3a`, cyan focus border, white text, placeholder `#556677`.

- [x] **Study list sorting**: Click column header to sort ascending/descending. Show sort arrow indicator (▲/▼) next to active sort column. Default sort: Study Date descending (newest first). Dispatch sort changes to `state.uiState.studyListSort`.

- [x] **Study list filtering**: As user types in filter inputs, filter the displayed studies in real-time. Match is case-insensitive substring for text fields, exact match for modality dropdown. Dispatch filter changes to `state.uiState.studyListFilters`.

- [x] **Study list pagination**: Below table: "Showing 1-8 of 8 studies" text on left, page size selector (25/50/100) on right. If >pageSize studies, show page navigation arrows. Update `state.uiState.studyListPage` and `studyListPageSize`.

### P1.2 — Viewer Shell & Toolbar

- [x] **Viewer toolbar**: 48px height bar at top of viewer page. Dark bg `#1a1a2e` with 1px bottom border `#2a3a4a`. Layout from left to right:
  1. **Back button**: `←` arrow icon, on click → navigate to `/studies`. Tooltip: "Back to Study List".
  2. **Logo**: "XACS Viewer" text, small font.
  3. **Separator**: Vertical 1px line `#2a3a4a`.
  4. **Tool buttons group**: Icon buttons ~40x40px each, with small label text below icon (10px). Each button: icon + label, default color `#8899aa`, active/selected state = `#05d8e6` with underline highlight bar. Tools in order: **Zoom** (Search/ZoomIn icon), **Levels** (contrast icon, circular half-fill), **Pan** (Move icon), **Length** (ruler icon), **Bidirectional** (cross arrows icon), **Ellipse** (circle icon), **Angle** (angle icon), **Annotation** (text cursor icon).
  5. **More Tools dropdown**: Button labeled "More ▾" — on click opens dropdown menu with: Magnify, Probe (pixel value), Rotate CW, Rotate CCW, Flip H, Flip V, Invert, Reset. Each item has icon + label.
  6. **Separator**.
  7. **Layout selector**: Grid icon that opens a dropdown showing layout options as small grid previews: 1×1, 1×2, 2×1, 2×2, 2×3, 3×3. Current layout highlighted with cyan border. On selection: update `state.settings.layoutRows` and `layoutColumns`, create/remove viewport slots in `state.viewports`.
  8. **Cine controls**: Play/Pause button (▶/⏸) + FPS display. Only visible when a series with >1 instance is loaded.
  9. **Right section**: Preferences gear icon (opens settings dialog), "INVESTIGATIONAL USE ONLY" text in muted gray.

- [x] **Tool selection behavior**: Clicking a toolbar tool button dispatches `setActiveTool(toolName)` to state. The tool determines what happens on left-click interaction in the viewport. Map tools to `state.toolState.activeTool`. Active tool button gets cyan highlight + bottom border accent. Only one tool active at a time.

### P1.3 — Left Panel (Study Browser)

- [x] **Left panel container**: 240px wide, bg `#0a1628`, left border 1px `#1a2a3a`. Has collapse/expand toggle arrow on right edge. When collapsed: panel hides, viewport expands to fill space. Store open/closed in `state.uiState.leftPanelOpen`.

- [x] **Study browser tabs**: At top of left panel, three pill-style tab buttons: "Primary" | "Recent" | "All". Active tab: cyan bg `#05d8e6` with dark text. Inactive: transparent bg, `#8899aa` text. "Primary" shows the opened study's series. "Recent" shows studies within 1 year. "All" shows all studies. Store active tab in `state.uiState.leftPanelTab`.

- [x] **Study info header**: Below tabs, show opened study info: Study date, instance count with icon (📋 295), study description. Modality badge: colored rounded rectangle (e.g., "CT" in blue `#2196f3` bg, white text, 24px pill). Font: 13px, color `#8899aa` for labels, white for values.

- [x] **Series thumbnails list**: Scrollable list of series for the current study. Each series item ~100px tall containing:
  - **Thumbnail image**: 120×90px canvas showing simulated series preview (see §Image Generation in data_model.md). Cyan border `#05d8e6` 2px when this series is active in any viewport. Default border: 1px `#2a3a4a`.
  - **Tracking indicator**: Small dashed circle on left side (○ dashed = untracked, ● solid cyan = tracked).
  - **Series description**: Below thumbnail, e.g., "Body 5.0 CE" in white 12px.
  - **Instance count**: "S: 6  📋 295" format — series number + instance count.
  - **Hover state**: Lighten background to `#1e2a3a`.
  - **Click behavior**: Click thumbnail → loads that series into the active viewport. Updates `state.viewports[activeVP].seriesId` and resets to instance 1.
  - **Drag behavior**: Drag thumbnail → can drop onto any viewport in multi-viewport layout to load series there.

### P1.4 — Viewport (Image Display)

- [x] **Viewport container**: Fills remaining space between panels. Black background `#000000`. If layout is multi-viewport (e.g., 2×2), divide space into equal grid cells with 2px `#1a2a3a` borders between them. Active viewport has cyan border highlight `#05d8e6` 2px. Click a viewport to make it active.

- [x] **Simulated medical image rendering**: Each viewport renders a `<canvas>` element sized to fill the viewport. The image is generated procedurally based on the series' `thumbnailType` and current `instanceNumber`. **Image generation approach**:
  - Create a `src/utils/imageGenerator.js` module with functions for each `thumbnailType`.
  - Each generator draws to an offscreen canvas (series.columns × series.rows resolution) using shapes: ellipses (for skull, organs, ventricles), noise (for tissue texture), gradients (for density variation).
  - **CT axial head**: Dark circle (skull), lighter brain area inside with slight asymmetric structures, two dark ventricle shapes in center. Vary ventricle size slightly per slice.
  - **CT axial chest**: Large dark lung fields (two ovals), central mediastinum (bright), spine at back (bright circle), ribs visible as bright arcs. Vary slice position → lungs get bigger then smaller.
  - **CT axial abdomen**: Outer body contour, liver (upper right bright region), kidneys (two bright ovals posteriorly), spine, bowel loops (varied density).
  - **MR brain**: Similar to CT head but inverted contrast for MR — bright gray matter on T1, bright CSF on T2. Use `seriesDescription` to pick contrast style.
  - **X-ray chest PA**: Full rectangle, bright mediastinum center, dark lung fields, rib cage lines, shoulder outlines at top.
  - **Ultrasound**: Sector/fan shaped bright region on dark background, speckle noise texture.
  - Apply current viewport's `windowCenter`/`windowWidth` to map raw pixel values to display grayscale: `displayVal = clamp(((rawVal - (WC - WW/2)) / WW) * 255, 0, 255)`.
  - Apply transforms: `zoom`, `panX/panY`, `rotation`, `flipH/flipV`, `invert`.
  - **Performance**: Cache generated images. Only regenerate when instanceNumber, window/level, or series changes. Use `requestAnimationFrame` for smooth scrolling.

- [x] **DICOM overlay text**: Render text overlays on top of the viewport canvas (can use absolutely-positioned HTML divs or draw on a separate overlay canvas). Use monospace font `'Roboto Mono', monospace`, 13px, color `#e0e0e0`, with subtle text-shadow `0 0 3px rgba(0,0,0,0.8)` for readability. Four corners:
  - **Top-left**: Patient name (e.g., "Smith, John A."), Patient ID (MRN), DOB, Sex/Age (e.g., "M / 67Y")
  - **Top-right**: Institution name, Study date and time, "A" orientation marker centered at top edge
  - **Bottom-left**: Series description, Slice thickness (e.g., "T: 2.00mm"), Body part. "R" marker on left edge centered vertically
  - **Bottom-right**: `W: 410  L: 70` (window/level), Zoom percentage (e.g., "116.80%"), Image position `I: 82 (82/295)`. "L" marker on right edge

- [x] **Orientation markers**: Single letters placed at viewport edges: "A" (Anterior, top center), "P" (Posterior, bottom center), "R" (Right, left edge center), "L" (Left, right edge center). Color `#e0e0e0`, 14px bold. These indicate patient orientation and should flip when image is flipped.

- [x] **Scroll through slices**: Mouse wheel over viewport → increment/decrement `currentInstanceNumber`. Scroll up = decrease (toward head), scroll down = increase (toward feet). Clamp to [1, series.numberOfInstances]. Update the `I: X (Y/Z)` overlay. Animate smoothly — regenerate image on each scroll step. Also: thin vertical scrollbar indicator on right edge of viewport showing current position as a bright line in a dark track.

- [x] **Window/Level adjustment**: When "Levels" tool is active, left-click + drag on viewport: drag up/down → change `windowWidth` (contrast), drag left/right → change `windowCenter` (brightness). Show W/L values updating in real-time in bottom-right overlay. Dispatch updates to `state.viewports[id].windowWidth/windowCenter`. Min windowWidth: 1. No max constraint.

- [ ] **Window/Level presets**: When "Levels" tool is active, show a small expandable preset bar or right-click the Levels button to show presets dropdown: Soft Tissue (W:400 L:40), Lung (W:1500 L:-600), Bone (W:2000 L:300), Brain (W:80 L:40), Abdomen (W:350 L:50), Liver (W:150 L:30). Clicking a preset instantly updates viewport W/L and sets `state.toolState.windowLevelPreset`.

- [x] **Pan**: When "Pan" tool active, left-click + drag moves the image within viewport. Also: middle mouse button always pans regardless of active tool. Update `state.viewports[id].panX/panY`. Visual: translate the rendered image by pan offset before displaying.

- [x] **Zoom**: When "Zoom" tool active, left-click + drag up = zoom in, drag down = zoom out. Also: right-click + drag always zooms regardless of active tool. Update `state.viewports[id].zoom`. Show zoom percentage in overlay (e.g., "150.0%"). Min zoom: 0.1, max zoom: 10.0. Zoom toward cursor position (center-based is acceptable for mock).

### P1.5 — Measurement Tools

- [ ] **Length measurement**: When "Length" tool active, click first point on viewport → show crosshair, click second point → draw a cyan dashed line between the two points with a label showing distance in mm (calculated from pixel spacing: `distance = sqrt((dx*pixelSpacing[0])^2 + (dy*pixelSpacing[1])^2)`). The measurement is rendered as an SVG overlay or canvas drawing on top of the image. Create a new Measurement in state with `type: "length"`. Points stored as normalized coordinates (0–1 relative to image dimensions).

- [ ] **Bidirectional measurement**: When "Bidirectional" tool active, user draws two perpendicular lines (click 4 points: first two = long axis, last two = short axis). Display both measurements in mm, labeled "L: 24.4 mm / W: 16.4 mm". Yellow color `#ffeb3b` for target measurements. Create Measurement with `type: "bidirectional"`.

- [ ] **Ellipse ROI**: When "Ellipse" tool active, click center → drag to define ellipse → show area in mm² and mean HU value. Display: dashed ellipse outline with label "Area: 156.2 mm² Mean: 45.2 HU". For mock, generate random but plausible HU values based on window center ± noise. Create Measurement with `type: "ellipse"`.

- [ ] **Angle measurement**: When "Angle" tool active, click three points to define angle vertex and two rays. Display angle in degrees. Create Measurement with `type: "angle"`.

- [ ] **Annotation (text marker)**: When "Annotation" tool active, click on image → show text input popup → type label (e.g., "Suspicious lesion") → place text with arrow pointing to clicked location. Create Measurement with `type: "annotation"`.

- [ ] **Measurement rendering on viewport**: All measurements for the currently displayed series+instance are rendered as overlays on the viewport. Each measurement shows: visual indicator (line/ellipse/angle/arrow) + text label with value. Color: `#05d8e6` for non-targets, `#ffeb3b` for targets. Measurements should scale with zoom and move with pan. Only show measurements for the current slice (matching instanceNumber).

- [ ] **Measurement interaction**: Hover over a measurement label on the viewport → highlight it. Right-click → context menu with: "Edit Label", "Delete", "Mark as Target", "Mark as Non-Target". Measurements can be deleted by right-click → Delete OR by dragging them off the viewport edge.

### P1.6 — Right Panel (Measurements)

- [x] **Right panel container**: 280px wide, bg `#0a1628`, right border 1px `#1a2a3a`. Collapse/expand toggle arrow on left edge. Store in `state.uiState.rightPanelOpen`.

- [x] **Measurement list**: Scrollable list of all measurements for the current study. Each measurement row shows:
  - Number (#1, #2, ...) on left
  - Label (e.g., "Lymph Node") in white
  - Value(s) (e.g., "24.4 x 16.4" for bidirectional, "48.8 mm" for length) in `#8899aa`
  - Clicking a measurement row → navigates viewport to that measurement's series and instance number, centers on measurement location
  - Hover → show Rename (pencil icon) and Delete (X icon) action buttons

- [x] **Target/Non-Target sections**: Group measurements into sections: "Targets" (with MAX count badge) and "Non-Targets" (with count badge), matching the OHIF measurement tracking layout shown in `ohif_measurement_tracking.jpg`. Targets show bidirectional measurements with L×W values. Non-Targets show label + response status (CR/SD/Present). Each section header is bold white text with count badge in cyan circle.

- [ ] **Measurement tracking prompt**: When a user creates a measurement on a series that isn't tracked yet, show a small prompt: "Track measurements for this series? [Yes] [No] [No, don't ask again]". "Yes" sets `series.isTracked = true`. Tracked series show a solid cyan circle indicator in the left panel thumbnails.

- [x] **Export measurements CSV**: Button at bottom of right panel: "Export CSV" — generates and downloads a CSV file with columns: Label, Type, Value, SecondaryValue, Unit, SeriesDescription, InstanceNumber, CreatedBy, CreatedAt.

- [ ] **Generate Report button**: Green button `#4caf50` at bottom of right panel below measurement list. On click: open a modal showing a structured report with all target and non-target measurements organized in a table. Include "RECIST" style headers. Allow "Copy to Clipboard" or "Download as Text".

---

## P2 — Secondary Features

Depth and realism features. Implement only after P1 is solid.

### P2.1 — Additional Viewport Tools

- [ ] **Image invert**: Toggle via "More Tools" → "Invert" or keyboard shortcut `I`. Swaps black/white by inverting the grayscale LUT. Update `state.viewports[id].invert`. Show "INV" indicator in overlay when active.

- [ ] **Image rotation**: "More Tools" → "Rotate CW" rotates 90° clockwise, "Rotate CCW" rotates 90° counter-clockwise. Update `state.viewports[id].rotation` (0, 90, 180, 270). Orientation markers (A/P/R/L) should rotate accordingly.

- [ ] **Flip horizontal/vertical**: "More Tools" → "Flip H" / "Flip V". Toggle `state.viewports[id].flipH` / `flipV`. Orientation markers swap accordingly (R↔L for flipH, A↔P for flipV).

- [ ] **Reset viewport**: "More Tools" → "Reset" or keyboard `Escape`. Reset zoom to 1.0, pan to 0,0, rotation to 0, flips to false, invert to false, W/L to series defaults. Dispatch reset to viewport state.

- [ ] **Fit to window**: "More Tools" → "Fit". Scale image so it fits entirely within the viewport bounds. Calculate appropriate zoom level based on image dimensions vs viewport dimensions.

- [ ] **Magnifying glass**: "More Tools" → "Magnify". When active, shows a circular magnification loupe (150px diameter, 2x zoom) following the cursor over the viewport. Draws a zoomed-in portion of the image inside the circle with a cyan border.

- [ ] **Probe tool**: "More Tools" → "Probe". When active, click on image → show a small label at click location with the pixel value in HU (for CT: `HU = rawValue * rescaleSlope + rescaleIntercept`; for mock, generate plausible value based on position and series type, e.g., -800 for lung, 40 for soft tissue, 1000 for bone).

- [ ] **Cine playback**: When a viewport has a multi-slice series loaded, the Play button (▶) in toolbar starts auto-scrolling through slices at `state.settings.cineFrameRate` fps. Show frame counter. Pause (⏸) stops. Loop when reaching end. Clicking anywhere in viewport also pauses.

### P2.2 — Study List Enhancements

- [ ] **Study row expansion**: Click arrow icon on study row → expand to show series list inline (mini thumbnails + series description + modality + instance count) without navigating to viewer. User can then click a specific series to open viewer directly on that series.

- [ ] **Study status badge colors**: Color-coded status dots in study list: 🔴 red = unread, 🟡 yellow = in_progress, 🔵 blue = read, 🟢 green = reported. Show status text on hover tooltip.

- [ ] **Bulk study actions**: Checkbox on each row. When ≥1 selected, show action bar above table with: "Mark as Read", "Mark as Reported", count of selected studies.

### P2.3 — Viewer Enhancements

- [ ] **Multi-viewport layout**: When layout is changed (e.g., to 2×2), create 4 viewport slots in state, each independently controllable. Each viewport has its own series, scroll position, W/L, zoom, pan. Active viewport (clicked) is highlighted with cyan border. Tools apply to the active viewport only. Series can be dragged from left panel thumbnails to any viewport.

- [ ] **Viewport header bar**: Each viewport has a thin header (20px) showing: series date + description on left, instance/series info on right. Visible in multi-viewport layouts as colored coded strips (like the screenshots show — pink/red borders for different viewports).

- [ ] **Synced scrolling**: When viewing the same study across multiple viewports, scrolling one viewport can optionally sync-scroll the other viewports to the corresponding anatomical position (based on slice location). Toggle with a "Link" toolbar button.

- [ ] **Prior study comparison**: If a patient has multiple studies (like PAT-001 with STU-001 and STU-007), allow loading the prior study in a second viewport. Show "Follow-up 1" and "Baseline" labels above viewports as in `ohif_measurement_tracking.jpg`. The right panel's comparison tab shows measurements side-by-side with percentage change.

### P2.4 — Preferences & Settings

- [ ] **Preferences dialog**: Click gear icon → modal dialog with tabs: "General", "Hotkeys", "Window/Level".
  - **General tab**: Language dropdown, interpolation toggle (bilinear/nearest), show overlays toggle, show orientation markers toggle.
  - **Hotkeys tab**: Two-column list of action + key binding. Default shortcuts: `Escape` = reset, `1-9` = W/L presets, `+/-` = zoom in/out, `ArrowUp/Down` = scroll slices, `I` = invert, `R` = rotate, `L` = length tool, `A` = annotation tool.
  - **Window/Level tab**: Editable list of W/L presets — name, window width, window center. Add/remove custom presets.
  - Dialog: dark bg `#0d1117`, rounded corners, backdrop blur overlay.

- [ ] **Keyboard shortcuts**: Implement default keyboard shortcuts (listed above). When focused on viewport, keys trigger actions. `Escape` always deselects current tool and resets to pointer/default. Number keys 1-9 correspond to W/L presets.

### P2.5 — Visual Polish

- [ ] **Loading state for study open**: When clicking a study in worklist, show brief loading spinner (0.5s simulated delay) before transitioning to viewer. Spinner: cyan rotating ring on dark backdrop.

- [ ] **Smooth transitions**: Panel open/close should animate (width transition 200ms ease-out). Tool selection should have smooth highlight transition. Viewport border highlight should pulse briefly when switching active viewport.

- [ ] **Tooltip on all toolbar buttons**: Hover any toolbar button → show tooltip with tool name + keyboard shortcut (e.g., "Zoom (Z)"). Dark bg tooltip with white text, 300ms delay.

- [ ] **Context menu styling**: Right-click context menus (on measurements, on viewport) should match dark theme: `#1a1a2e` bg, `#ffffff` text, `#05d8e6` hover highlight, subtle shadow.

- [ ] **Empty state for measurement panel**: When no measurements exist, show centered text: "No measurements" with a small ruler icon, muted text `#556677`.

---

## Data Seed (implement in createInitialData())

See `assets/data_model.md` for the complete `createInitialData()` structure. Key points:

- [x] **Patients**: 6 patients with realistic DICOM-format names (LAST^FIRST^MIDDLE), MRNs, DOBs, sex, age
- [x] **Studies**: 8 studies across the 6 patients covering CT (head, chest, abdomen), MR (brain), CR (chest X-ray), US (abdomen). Mixed statuses: 2 unread, 1 in_progress, 2 read, 3 reported. PAT-001 has current + prior study (3 months apart) for comparison scenario. PAT-005 has CT + MRI studies.
- [x] **Series**: 28 series total across all studies. Each with realistic descriptions, modality, instance counts, pixel spacing, slice thickness, window/level defaults matching the modality.
- [x] **Measurements**: 5 pre-existing measurements on STU-001 (3 bidirectional targets, 1 length reference, 1 ellipse ROI) demonstrating the measurement tracking workflow.
- [x] **Simulated image generators**: At minimum implement generators for: `ct_axial_head`, `ct_axial_chest`, `ct_axial_abdomen`, `mr_axial_brain`, `xr_chest_pa`, `us_abdomen`. Each generator must produce visually distinct, anatomically suggestive patterns that change subtly per slice number.

---

## Out of Scope

Dev must NOT implement these:

- Authentication / login (app starts pre-logged-in as `Dr. Sarah Chen`)
- Real DICOM file parsing or loading
- Real PACS server communication / DICOMWeb
- True volumetric 3D rendering or MPR from real data
- DICOM standard compliance (we simulate the visual experience only)
- File upload to remote servers
- Real Hounsfield Unit calculations (mock generates plausible values)
- Mobile responsive layout (this is a desktop radiology workstation)
