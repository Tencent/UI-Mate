# Xoogle Docs Mock — TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-08
> Research: `assets/README.md` | Data model: `assets/data_model.md`
> Existing codebase: This mock already has a substantial implementation. This TODO focuses on **bug fixes and missing features** identified in TEST_REPORT.md and research gaps.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 — Critical Bug Fixes

These bugs break core functionality and must be fixed first. References: TEST_REPORT.md BUG-001 through BUG-005.

- [x] **BUG-001 FIX: Font size not working** — The custom `src/extensions/FontSize.js` extension exists but font size changes via toolbar are not applying visually. Verify that the FontSize extension is properly registered in the TipTap editor setup in `Editor.jsx`. The extension must register `fontSize` as a valid attribute on `TextStyle` mark so that `editor.chain().focus().setMark('textStyle', { fontSize: '14pt' })` actually renders. Test: select text → change font size in toolbar → text should visually resize. If the extension file exists but isn't imported, add the import. If the extension logic is wrong, fix it to properly extend `@tiptap/extension-text-style` with `addAttributes()` returning `{ fontSize: { default: null, parseHTML: el => el.style.fontSize, renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {} } }`.

- [x] **BUG-003 FIX: Catch-all route for invalid URLs** — App.jsx already has `<Route path="*" element={<Navigate to="/" replace />} />` per CLAUDE.md, but TEST_REPORT.md says it's missing. Verify: navigate to `/nonexistent` — should redirect to `/`. If the route is present but not working, check that it's the last `<Route>` inside `<Routes>`. If missing, add it.

- [x] **BUG-004 FIX: Find and Replace UI not rendering** — `FindReplaceBar.jsx` component exists in `src/components/` but is not being rendered in `DocumentEditor.jsx` when `state.ui.findReplaceOpen` is true. Fix: In `DocumentEditor.jsx`, import `FindReplaceBar` and conditionally render it when `findReplaceOpen` is true, passing the TipTap `editor` instance. The FindReplaceBar should appear as a horizontal bar between the toolbar and the document canvas (like Xoogle Docs: gray bar with "Find" input, "Replace with" input, up/down navigation arrows, "Replace" and "Replace all" buttons, and a close X). Ensure keyboard shortcut Ctrl+H and Ctrl+F also toggle the bar. The component should use TipTap's built-in search functionality or implement text search on the editor's HTML content.

- [x] **BUG-005 FIX: Bubble menu comment button not persisting** — In `Editor.jsx`, the BubbleMenu's comment button currently uses `window.prompt`/`alert` instead of dispatching `ADD_COMMENT`. Fix: Get the selected text from the editor via `editor.state.doc.textBetween(from, to)`, use it as `quotedText`, open a small popover or the comments sidebar with a new comment input pre-filled with the quoted text. When user submits, dispatch `ADD_COMMENT` with `{ docId, content, quotedText }`. Also open the comments sidebar automatically (`SET_UI { sidebarOpen: true }`).

---

## P1 — Feature Gaps & UI Polish

These are missing features that reduce realism for agent training.

- [x] **Suggesting mode visual distinction** (BUG-010) — When `viewMode` is `'suggesting'`, the editor should still be editable but show a visual indicator: (1) a small "Suggesting" badge in green near the editing mode selector in the toolbar or top-right, (2) text typed in suggesting mode should appear with a different background color (light green #E6F4EA) to simulate tracked changes. For a mock, at minimum show the mode label and change the editing pencil icon to a pencil-with-suggestion icon. The mode selector dropdown in the top-right (or View menu) should show checkmark next to the active mode.

- [x] **Zoom control functional** (BUG-009) — The zoom display currently shows "100%" but is not interactive. Fix: Make it a dropdown with options: 50%, 75%, 90%, 100%, 125%, 150%, 200%. When changed, update `state.ui.zoom` via `SET_UI`. Apply the zoom as a CSS `transform: scale(zoom/100)` on the document canvas wrapper div (the white page area), with `transform-origin: top center`. The toolbar zoom dropdown should display the current zoom value. Also support Ctrl+= (zoom in), Ctrl+- (zoom out), Ctrl+0 (reset to 100%).

- [x] **Indent/outdent for paragraphs** (BUG-007) — Currently indent/outdent only works inside lists. In Xoogle Docs, indent also works on paragraphs by adding left margin. Fix: When cursor is in a paragraph (not a list), indent should add `margin-left: 40px` (cumulative, up to ~200px), outdent should remove 40px. Use TipTap's `updateAttributes` on the paragraph node or wrap in a custom extension. This is a common agent training action.

- [x] **Superscript and subscript** (BUG-011) — Format > Text > Superscript/Subscript show `alert()`. Fix: Install `@tiptap/extension-superscript` and `@tiptap/extension-subscript`, add them to the editor extensions array, and wire the menu items to call `editor.chain().focus().toggleSuperscript().run()` and `editor.chain().focus().toggleSubscript().run()`. Also add toolbar buttons or keep them in the Format > Text submenu only.

- [x] **Remove alert() dialogs** (BUG-006) — Replace all `alert()` calls in the app with toast notifications using the existing `Toast.jsx` system. Affected locations: Toolbar.jsx spell check button, paint format button; MenuBar.jsx superscript/subscript (after fixing BUG-011); any other alert() calls. For features that are "not implemented", show a toast like "Spell check is not available in this demo" instead of a blocking alert.

- [x] **Fix double padding on editor** (BUG-008) — The editor content area has double padding: `.tiptap` CSS class applies `padding: 40px 60px` AND the wrapper div in `Editor.jsx` applies `px-[96px] py-[72px]`. Remove one set. Keep the padding that best matches Xoogle Docs' real margins (~1 inch = 96px on sides, ~72px top). The `.tiptap` padding should be removed and let the wrapper div handle it, OR set `.tiptap { padding: 0 }` and use the Tailwind classes.

- [x] **Document outline sidebar** — Xoogle Docs has a document outline panel on the left side showing all headings (H1-H6) as a clickable table of contents. Add an outline panel: a narrow left sidebar (~220px) that lists all headings extracted from the TipTap editor content. Clicking a heading scrolls the editor to that heading. Toggle via View > Show outline or a dedicated button (the hamburger-list icon visible on the left edge of the document in the screenshot). The outline shows heading text with indentation based on level (H1 flush left, H2 indented, H3 more indented, etc.).

- [x] **Line & paragraph spacing** — Add a line spacing dropdown in the toolbar (the icon between alignment and lists). Options: Single (1.0), 1.15, 1.5, Double (2.0). Also include "Add space before paragraph" and "Add space after paragraph" toggles. Apply via custom CSS or TipTap paragraph attributes. Default is 1.15 line spacing matching Xoogle Docs default.

- [x] **Page break insertion** — Insert menu should include "Page break" option (and Ctrl+Enter shortcut). In the TipTap editor, insert a `<hr class="page-break">` with CSS `page-break-after: always` and visual styling: a dashed line across the page with "Page break" label centered, like Xoogle Docs shows.

- [x] **Clear formatting in toolbar** — The toolbar should have a clear formatting button (Tx with strikethrough or eraser icon) that calls `editor.chain().focus().clearNodes().unsetAllMarks().run()`. This is visible in Xoogle Docs toolbar screenshots as the last toolbar item. Currently exists in Format menu but should also be a toolbar icon.

- [x] **Template gallery on home page** — The home page should show a "Start a new document" section at the top with template cards. Include: Blank (+ icon), Resume, Letter, Project proposal, Meeting notes, Brochure. Each template card shows a small thumbnail preview and title below. Clicking Blank creates a new empty document (existing behavior). Clicking a template creates a new document pre-filled with template HTML content (headings, placeholder text matching the template type). See `assets/screenshots/home/000001.jpg` for visual reference.

- [x] **Keyboard shortcuts dialog** — Help > Keyboard shortcuts should open a modal dialog listing common shortcuts in a grid layout. Categories: Text formatting (Ctrl+B, Ctrl+I, Ctrl+U), Navigation (Ctrl+Home, Ctrl+End), Editing (Ctrl+Z, Ctrl+Y, Ctrl+A), Insert (Ctrl+K for link), etc. The dialog should have a search/filter input at top and be dismissible with Escape or X button.

- [x] **Version history panel (mock)** — File > Version history > See version history should open a right sidebar panel showing 3-5 mock version entries. Each entry shows: timestamp, user name, colored indicator. Clicking an entry shows a toast "Version preview is not available in demo". The panel should have a "Name this version" input. This gives agents something to interact with even though it's a mock.

---

## P2 — Depth & Polish

Implement only after P0 and P1 are solid.

- [ ] **Paint format (format painter)** — The paint roller icon in the toolbar should: (1) on click, capture the current text formatting (bold, italic, underline, font family, font size, text color, highlight color), (2) change cursor to a paint roller cursor, (3) on next text selection, apply the captured formatting to the selected text, (4) deactivate paint mode. Show a toast "Format copied" when activated. Double-click for persistent paint mode (stays active until clicked again).

- [ ] **Spelling/grammar check simulation** — Tools > Spelling & grammar should toggle red wavy underlines on a few predefined "misspelled" words in the document. Right-clicking an underlined word shows a context menu with correction suggestions. Accepting a suggestion replaces the word. This is more realistic than showing a toast.

- [ ] **Print preview layout** — View > Print layout should toggle a visual mode where the document shows page boundaries (horizontal lines between pages at ~11 inch intervals), headers, footers, and page numbers. Without print layout, the document is a continuous scroll. This is a visual toggle, not functional printing.

- [ ] **Insert special characters dialog** — Insert > Special characters should open a modal with a grid of common symbols (arrows, math, currency, etc.) organized by category. Clicking a character inserts it at the cursor position. Include a search input to filter characters.

- [ ] **Insert equation** — Insert > Equation should insert a small equation editor toolbar below the main toolbar and an equation block in the document. For a mock, inserting a pre-formatted equation block (e.g., `E = mc²`) is sufficient.

- [ ] **Headers and footers** — Insert > Headers & footers > Header/Footer should show a distinct editing area at the top/bottom of the document canvas with a dashed border separator. The header/footer area should be editable and persist as document metadata. Include page number insertion within header/footer.

- [ ] **Columns layout** — Format > Columns should show a submenu with 1, 2, 3 column options. Selecting a multi-column layout wraps the document content in a CSS columns container. This is a visual formatting feature.

- [ ] **Table of contents** — Insert > Table of contents should insert a generated block at the cursor position listing all H1-H6 headings with page-like section numbers. The TOC should be clickable (scrolls to heading) and styled with dotted leaders. Include "Update table of contents" option in context menu.

- [ ] **Word count in status bar** — Show a small word/character count in the bottom-left corner of the editor (below the document canvas) that updates live as the user types. Clicking it opens the full word count dialog (already exists in Tools menu).

- [ ] **Emoji reactions on comments** — Each comment thread should have a small emoji reaction bar (👍 visible by default). Clicking adds a reaction. This matches modern Xoogle Docs comment UX.

- [ ] **Right-click context menu in editor** — Right-clicking in the document canvas should show a custom context menu with: Cut, Copy, Paste, Paste without formatting, Select all, ─, Link, Comment, ─, Spelling suggestions (if on misspelled word). Currently only the default browser context menu appears.

- [ ] **Drag and drop text** — Selected text in the editor should be draggable to a new position within the document. TipTap supports this natively but it may need enabling via the `draggable` option or a custom extension.

- [ ] **Image resize handles** — When clicking an inserted image, show resize handles (small squares at corners and edges). Dragging handles should resize the image. TipTap's image extension may support this with additional configuration or a wrapper component.

---

## Data Seed (already implemented in createInitialData())

The existing seed data in `src/store/initialData.js` is adequate with 5 documents, 3 users, and 3 comments. No changes needed unless template gallery is implemented (P1), in which case add template content strings.

- [x] **Template content strings** — If implementing template gallery (P1), add HTML content strings for each template type:
  - Resume: `<h1>Your Name</h1><p>Contact info</p><h2>Experience</h2>...`
  - Letter: `<p>[Your Name]</p><p>[Date]</p><p>Dear [Recipient],</p>...`
  - Project proposal: `<h1>Project Proposal</h1><h2>Executive Summary</h2>...`
  - Meeting notes: `<h1>Meeting Notes</h1><h2>Date: [date]</h2><h3>Attendees</h3>...`
  - Brochure: `<h1>Company Name</h1><h2>Our Services</h2>...`

---

## Out of Scope

Dev must NOT implement these:
- Authentication / login (app starts pre-logged-in as Demo User, user-1)
- Real-time collaboration / WebSocket sync
- Google Drive file picker integration
- Extension/Add-on marketplace
- Voice typing
- Translate document
- Real file uploads to server (downloads use client-side blob generation)
- Offline mode
- Google account switcher
- Notification bell
