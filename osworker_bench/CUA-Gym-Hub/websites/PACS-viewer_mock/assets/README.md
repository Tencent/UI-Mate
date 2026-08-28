# XACS Viewer Mock — Research Summary

## App Overview

**PACS** (Picture Archiving and Communication System) is a medical imaging technology used in healthcare organizations to store, retrieve, manage, distribute, and display medical images. A **XACS Viewer** is the radiologist's primary workstation software for viewing and interpreting medical images such as X-rays, CT scans, MRIs, ultrasounds, and nuclear medicine studies.

This mock is modeled primarily on the **OHIF (Open Health Imaging Foundation) DICOM Viewer** — the most widely-used open-source web-based XACS Viewer — with visual elements inspired by commercial viewers like SonicDICOM and RadiAnt. The interface uses a **dark theme** (near-black backgrounds) which is standard in radiology to reduce eye strain during long reading sessions.

**Key Reference**: OHIF Viewer v3.x — https://docs.ohif.org/

---

## Key User Personas & Primary Workflows

### Persona 1: Radiologist (Primary)
- Opens study worklist → selects patient study → views images
- Scrolls through image slices in viewport
- Adjusts window/level (brightness/contrast) for different tissues
- Makes measurements (length, angle, area) and annotations
- Compares current study with prior studies
- Generates reports from findings

### Persona 2: Referring Physician
- Searches for patient by name/MRN
- Opens a specific study to view results
- Reviews radiologist annotations and measurements

### Persona 3: Technologist
- Reviews image quality after acquisition
- Checks that all series are complete
- Verifies patient information overlay accuracy

---

## Complete Feature List

### P0 — Core Shell & Framework
| Feature | Priority | Description |
|---------|----------|-------------|
| Dark theme shell | P0 | Near-black background (#000000–#0a0a0a), cyan/teal accents (#00bcd4, #05d8e6), white text |
| Header/toolbar bar | P0 | Top bar with logo, navigation, tool buttons, layout selector, preferences |
| Left panel (Study Browser) | P0 | Collapsible panel with study info, series thumbnails, Primary/Recent/All tabs |
| Main viewport area | P0 | Central image display with DICOM overlays (patient info, window/level, slice position) |
| Right panel (Measurements) | P0 | Collapsible panel with measurement list, tracking status, export options |
| Routing | P0 | Study list → Viewer navigation, `/studies` (worklist), `/viewer/:studyId` |
| State management | P0 | React Context for studies, measurements, tool selection, viewport state |

### P1 — Primary Features
| Feature | Priority | Description |
|---------|----------|-------------|
| Study worklist/list | P1 | Table with Patient Name, MRN, Study Date, Description, Modality, Accession, sortable/filterable |
| Image viewport rendering | P1 | Display simulated medical images (use canvas-based grayscale image rendering) |
| Slice scrolling (stack navigation) | P1 | Mouse wheel to scroll through image slices in a series; show I: X (Y/Z) indicator |
| Window/Level adjustment | P1 | Left-click drag to adjust brightness/contrast; show W: and L: values in overlay |
| Window/Level presets | P1 | Quick presets: Soft Tissue (W:400 L:40), Lung (W:1500 L:-600), Bone (W:2000 L:300), Brain (W:80 L:40), Abdomen (W:350 L:50) |
| Pan tool | P1 | Middle-click drag or Pan tool to move image in viewport |
| Zoom tool | P1 | Right-click drag or Zoom tool; show zoom percentage (e.g. "116.80%") |
| Measurement: Length | P1 | Click two points → show distance in mm with dashed line |
| Measurement: Bidirectional | P1 | Two perpendicular measurements (longest diameter + perpendicular) |
| Measurement: Ellipse/ROI | P1 | Draw ellipse → show area (mm²) and mean/std HU value |
| Measurement: Angle | P1 | Three-point angle measurement in degrees |
| Annotation text | P1 | Place text labels on images with arrow pointer |
| Measurement panel | P1 | Right panel lists all measurements with label, value, series; click to navigate |
| Series thumbnails | P1 | Left panel shows small preview thumbnails for each series with modality badge, series number, instance count |
| Drag series to viewport | P1 | Drag thumbnail from left panel to viewport to change displayed series |
| Layout selector | P1 | Toolbar grid icon opens dropdown: 1x1, 1x2, 2x1, 2x2, 2x3, 3x3 viewport layouts |
| Viewport overlay info | P1 | Four corners: top-left (patient name, MRN, DOB), top-right (institution, study date), bottom-left (series info, slice thickness), bottom-right (W/L values, zoom, image number) |
| Toolbar with tool selection | P1 | Tools: Zoom, Levels (W/L), Pan, Length, Bidirectional, Ellipse, Angle, Annotation, plus "More Tools" dropdown |
| Active tool highlighting | P1 | Selected tool in toolbar highlighted with accent color |

### P2 — Secondary/Depth Features
| Feature | Priority | Description |
|---------|----------|-------------|
| Study search/filter | P2 | Filter worklist by patient name, MRN, date range, modality, description |
| Study date sorting | P2 | Sort by most recent first; pagination (25/50/100 per page) |
| Image invert (negative) | P2 | Toggle color inversion of displayed image |
| Image rotation | P2 | Rotate image 90° CW/CCW |
| Flip horizontal/vertical | P2 | Mirror image along horizontal or vertical axis |
| Cine playback | P2 | Auto-play through slices at adjustable frame rate (fps); play/pause/stop buttons |
| Magnifying glass | P2 | Circular magnification loupe over image area |
| Crosshair/reference lines | P2 | Show crosshair position synced across viewports in MPR mode |
| Reset viewport | P2 | Button to reset zoom, pan, W/L, rotation to defaults |
| Fit to window | P2 | Scale image to fit viewport dimensions |
| Measurement delete | P2 | Right-click measurement → delete, or drag out of viewport |
| Measurement rename/label | P2 | Right-click → edit label (e.g., "Lymph Node", "Lesion A") |
| CSV export measurements | P2 | Download measurements as CSV file |
| Capture/download image | P2 | Download current viewport as PNG/JPG with customizable dimensions |
| Study comparison (prior) | P2 | Side-by-side display of current vs prior study with synced scrolling |
| Preferences/settings dialog | P2 | Gear icon → modal with language, hotkey bindings, W/L defaults |
| Keyboard shortcuts | P2 | Standard shortcuts: Scroll (Up/Down), Zoom (+ / -), W/L (1-9 presets), Esc (reset tool) |
| Hanging protocols | P2 | Auto-layout rules based on modality (e.g., chest CT → axial+coronal 1x2) |

---

## UI Layout Description

### Study List Page (`/studies`)
Based on `studylist_worklist.jpg`:
- **Header**: Logo ("Open Health Imaging Foundation" or similar) on left, settings gear on right
- **Body**: Full-width table with columns: Patient Name, MRN (Patient ID), Study Date, Description, Modality (badge), Accession #, # Instances
- **Search bar**: Above table, filter inputs for each column
- **Pagination**: Bottom of table, page size selector (25/50/100)
- **Row interaction**: Click to open study in viewer; hover highlights row
- **Colors**: Dark background (#090c29 or similar deep navy), table rows alternate slightly, text is white/light gray

### Viewer Page (`/viewer/:studyId`)
Based on `ohif_measurement_tracking.jpg`, `ohif_v3_single_viewport.jpg`, `viewer_tools_dropdown.jpg`:

**Header/Toolbar** (~48px height):
- Left section: Back arrow (← to study list), Logo text, "Study list" link
- Center section: Tool buttons with icons and labels below:
  - Row 1 (primary): Studies, Zoom, Levels (W/L), Pan, Link, Target, Non-Target, Temp, More ▾
  - Separator
  - Row 2 (secondary): Tools, Others, Annotation, Cine, Report, Help
- Right section: Layout selector grid icons (Series/Study toggle), Save button
- Toolbar background: dark (#1a1a2e), icon color: teal/cyan (#05d8e6), active state has underline/highlight

**Left Panel** (~240px width, collapsible):
- Tab bar: "Primary" | "Recent" | "All" (filter tabs with pill-style buttons, active = cyan bg)
- Study info header: Date, instance count icon, description
- Modality badge: "CT" / "MR" / "US" etc. in colored box (CT = blue, MR = green)
- Series thumbnails: ~120x90px preview images with:
  - Tracking circle indicator (dashed = untracked, solid = tracked)
  - Series description text below
  - Instance count badge
  - Currently active series: cyan/teal border highlight
- Scrollable list of all series

**Viewport** (flexible, fills remaining space):
- Black background (#000000)
- Image displayed centered with current zoom/fit
- Four-corner overlay text:
  - Top-left: Patient Name, Patient ID, Study date
  - Top-right: Institution name, Study date/time, "A" (anterior marker)
  - Bottom-left: Series description, Slice thickness, "R" (right marker)
  - Bottom-right: W: XXX L: XXX, Zoom %, Image I: XX (XX/XX)
- Orientation markers: A (Anterior), P (Posterior), R (Right), L (Left) on edges
- Measurement overlays: colored lines (cyan/yellow) with value labels
- Scroll indicator: Thin bar on right side showing current position in stack

**Right Panel** (~280px width, collapsible):
- Header tabs: "Comparison" | "Key Timepoints"
- Timeline bar: Follow-up dates and baseline date
- "Targets" section with MAX count badge:
  - Numbered rows: #, Label (e.g., "Lymph Node"), Measurement values (e.g., "24.4 x 16.4" | "34.6 x 20.3")
  - Actions: Rename, Delete links
- "Non-Targets" section with count badge:
  - Numbered rows: #, Label, Response (CR/SD/Present)
- "Generate Report" button at bottom (green)

---

## Color Palette (from screenshots)
| Role | Hex | Usage |
|------|-----|-------|
| Background (darkest) | `#000000` | Viewport background |
| Background (shell) | `#090c29` | App frame, panels |
| Background (panel) | `#0a1628` | Side panels |
| Background (toolbar) | `#1a1a2e` | Top toolbar |
| Background (hover) | `#1e2a3a` | Hover state on panel items |
| Accent primary | `#05d8e6` | Active tool highlight, selected series border, links |
| Accent secondary | `#00bcd4` | Buttons, badges |
| Text primary | `#ffffff` | Main text, overlay text |
| Text secondary | `#8899aa` | Muted text, descriptions |
| Text overlay | `#e0e0e0` | DICOM overlay text |
| Series CT badge | `#2196f3` | CT modality badge |
| Series MR badge | `#4caf50` | MR modality badge |
| Measurement line | `#ffeb3b` | Yellow measurement lines |
| Target annotation | `#ffeb3b` | Yellow target markers |
| Danger/delete | `#f44336` | Delete actions |
| Success/save | `#4caf50` | Save button, generate report |

---

## Typography
- **Font family**: `'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif`
- **Overlay font**: `'Roboto Mono', 'Consolas', monospace` (for DICOM text overlays — patient info, W/L values)
- **Header tools**: 11-12px, uppercase or title case, regular weight
- **Panel text**: 13-14px, regular weight
- **Overlay text**: 12-14px, monospace, with subtle text shadow for readability over images
- **Study list table**: 14px body, 12px header, medium weight headers

---

## What to Skip (Out of Scope)
- Login/authentication (app starts pre-logged-in as "Dr. Sarah Chen")
- Real DICOM file parsing (images are simulated with canvas-drawn medical-looking patterns)
- Real network/PACS server communication
- DICOM standard compliance
- 3D volume rendering (too complex for mock)
- Real MPR reconstruction from volumetric data
- File upload to real DICOM servers
