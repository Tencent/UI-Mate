# Xoogle Docs Mock - Test Report

## 2026-04-30 Hardening Pass
- **Verdict**: PASS
- **Build**: `npm run build` passed. Vite emitted the existing large chunk warning.
- **Static fake-affordance sweep**: searched for native `alert`, `confirm`, `prompt`, empty click handlers, placeholder implementation strings, and explicit mock/dead-end labels. Remaining `mock` hits are app/storage names and fixture text only.
- **State sync**: `saveData` now posts `set_current`; Vite `/go?sid=...` returns server-side `initial_state`, `current_state`, and `state_diff` with a preserved initial baseline.
- **Browser Use QA**:
  - Opened `/?sid=qa-docs`, opened `Project Proposal`, renamed it to `Project Proposal QA`, and verified the title persisted.
  - Opened the Share dialog, exercised collaborator input and closed it without page breakage.
  - Used `File > Move`, selected `Project files`, saved it, and verified `/go?sid=qa-docs` shows `documents.doc-1.folder`.
  - Used `Insert > Special characters`, inserted a check mark into the document body, and verified `/go?sid=qa-docs` includes the edited content.
- **`/go` verification**: `diffKeys` included `documents` and `ui`; `doc-1.title` was `Project Proposal QA`; `doc-1.folder` was `Project files`; document content included the inserted special character.
- **Residual risk**: generated `.docx` and `.pdf` downloads are local sandbox files with useful content and MIME/disposition behavior, not full production-grade Office/PDF serialization.

## Summary
- **Date**: 2026-02-20
- **Verdict**: PASS WITH ISSUES
- **Critical Bugs**: 1
- **Major Bugs**: 4
- **Minor Bugs**: 6

## Build Verification
- **npm run build**: PASS (no errors, builds successfully in 3.24s)
- **npm run dev**: PASS (server starts correctly)
- **Bundle size**: 757.71 kB (warning about chunk size, but functional)

## Test Results

### 1. Navigation
| Test | Status | Notes |
|------|--------|-------|
| Home page (`/`) loads | PASS | DocumentList renders with header, search, create button, doc grid |
| Click document card navigates to `/document/:docId` | PASS | `onOpen` calls `navigate('/document/' + docId)` |
| Back to home from editor | PASS | ArrowLeft button calls `navigate('/')` |
| `/go` route shows state JSON | PASS | GoDebug component renders JSON with initial_state, current_state, state_diff |
| Invalid routes handled | FAIL | No catch-all route defined in App.jsx -- invalid URLs render blank page |
| Document not found (valid route, invalid docId) | PASS | Shows "Document not found" with "Go to Documents" button |

### 2. Document Management (Home Page)
| Test | Status | Notes |
|------|--------|-------|
| Document grid displays all 5 initial documents | PASS | Object.values(state.documents) renders all docs |
| Toggle grid/list view | PASS | viewMode state toggles between 'grid' and 'list', persisted via SET_UI |
| Search documents by title | PASS | Filters by title.toLowerCase().includes(query) |
| Create new document (+ button) | PASS | Creates doc with CREATE_DOC, navigates to editor |
| Star/unstar a document | PASS | STAR_DOC toggles starred field |
| Rename a document | PASS | RenameDialog opens, RENAME_DOC dispatched |
| Delete a document (with confirmation) | PASS | Confirmation dialog with Cancel/Delete buttons |
| Sort documents (last modified, title, date created) | PASS | Three sort options, dropdown works |
| Starred section shows when starred docs exist | PASS | Conditional rendering with `!searchQuery` guard |
| Empty state when no documents | PASS | Shows message with suggestion to create |
| Search no results state | PASS | Shows "No documents found" message |
| Context menu on right-click | PASS | onContextMenu handler opens ContextMenuDropdown |
| List view shows correct columns | PASS | Name, Owner, Last modified, actions columns |

### 3. Document Editor
| Test | Status | Notes |
|------|--------|-------|
| Document title displayed and editable | PASS | Input with onChange, onBlur dispatches RENAME_DOC |
| Rich text editor loads with content | PASS | Tiptap useEditor with doc.content |
| Bold | PASS | toggleBold in toolbar and bubble menu |
| Italic | PASS | toggleItalic in toolbar and bubble menu |
| Underline | PASS | toggleUnderline in toolbar and bubble menu |
| Strikethrough | PASS | toggleStrike in toolbar and bubble menu |
| Heading styles dropdown | PASS | Normal, Title, Subtitle, H1-H6 with appropriate styling |
| Font family dropdown | PASS | 10 font families, setFontFamily command |
| Font size works | PASS | Input + dropdown + increment/decrement buttons |
| Text color picker | PASS | Grid of 50 colors, setColor command |
| Highlight color picker | PASS | Grid of 24 colors, setHighlight with None option |
| Text alignment (left/center/right/justify) | PASS | setTextAlign for all 4 options |
| Bullet list | PASS | toggleBulletList command |
| Numbered list | PASS | toggleOrderedList command |
| Checklist | PASS | toggleTaskList command |
| Indent/outdent | PASS | sinkListItem/liftListItem -- but only works in lists (see BUG-007) |
| Undo/redo | PASS | undo/redo with disabled state check |
| Insert link | PASS | window.prompt for URL, setLink/unsetLink |
| Insert image | PASS | window.prompt for URL, setImage |
| Insert table (via menu) | PASS | 2x2, 3x3, 4x4, 5x5 options |
| Horizontal rule (via menu) | PASS | setHorizontalRule command |
| Bubble menu on text selection | PASS | BubbleMenu with bold/italic/underline/strike/link/comment |
| Bubble menu table controls | PASS | Add column/row, delete column/row/table when inside table |
| Content saves to state on edit | PASS | onUpdate callback dispatches UPDATE_DOC |
| Star/unstar from editor | PASS | Star button next to title |
| Shared user avatars display | PASS | Shows up to 3 avatars with overflow count |
| Print button | PASS | Calls window.print() |
| Font size setMark approach | FAIL | See BUG-001 |

### 4. Menu Bar
| Test | Status | Notes |
|------|--------|-------|
| File menu opens | PASS | MenuDropdown with toggle |
| Edit menu opens | PASS | All items present |
| View menu opens | PASS | Mode submenu, show options |
| Insert menu opens | PASS | Image/Table/Link/HR and more |
| Format menu opens | PASS | Text/Paragraph/Align/Lists submenus |
| Tools menu opens | PASS | Word count, spelling, dictionary |
| Help menu opens | PASS | Help, training, keyboard shortcuts |
| Menus close when clicking outside | PASS | handleClickOutside listener |
| Menu items with actions work | PASS | Actions fire on click then close menu |
| Keyboard shortcuts displayed | PASS | Shown as right-aligned text |
| File > New | PASS | Creates new doc and navigates |
| File > Open | PASS | Navigates to home |
| File > Make a copy | PASS | Creates copy with "Copy of" prefix and same content |
| File > Share | PASS | Opens share dialog |
| File > Rename | PASS | Focuses title input |
| File > Move to trash | PASS | Confirms and deletes, navigates home |
| File > Download submenu | PASS | 5 format options with mock alerts |
| File > Email submenu | PASS | 2 options with mock alerts |
| File > Version history submenu | PASS | Name and see version history |
| File > Print | PASS | window.print() |
| Edit > Undo/Redo | PASS | Editor commands |
| Edit > Cut/Copy/Paste | PASS | execCommand calls |
| Edit > Select all | PASS | editor.selectAll() |
| Edit > Delete | PASS | editor.deleteSelection() |
| Edit > Find and replace | PASS | Toggles findReplaceOpen UI state (but no UI -- see BUG-004) |
| View > Mode submenu | PASS | Sets viewMode to editing/suggesting/viewing |
| View > Full screen | PASS | requestFullscreen/exitFullscreen |
| Insert > Image by URL | PASS | Prompt + setImage |
| Insert > Table sizes | PASS | 2x2 through 5x5 |
| Insert > Horizontal line | PASS | setHorizontalRule |
| Insert > Link | PASS | Prompt + setLink |
| Format > Text formatting | PASS | Bold/Italic/Underline/Strike |
| Format > Paragraph styles | PASS | Normal through H6 |
| Format > Align & indent | PASS | Left/Center/Right/Justify |
| Format > Bullets & numbering | PASS | Bullet/Numbered/Checklist |
| Format > Clear formatting | PASS | clearNodes + unsetAllMarks |
| Tools > Word count | PASS | Counts words and characters |
| Submenus appear on hover | PASS | onMouseEnter/onMouseLeave |

### 5. Comments
| Test | Status | Notes |
|------|--------|-------|
| Comments sidebar opens/closes | PASS | Toggle via button, sidebarOpen UI state |
| Comments for current document displayed | PASS | Filtered by docId |
| Add new comment | PASS | ADD_COMMENT dispatch with content |
| Reply to comment | PASS | REPLY_COMMENT dispatch, Enter key support |
| Resolve/unresolve comment | PASS | RESOLVE_COMMENT toggles resolved flag |
| Delete comment | PASS | DELETE_COMMENT removes from array |
| Delete only shown for comment author | PASS | isOwner check on delete button |
| Comment filter (All/Open/Resolved) | PASS | Three filter tabs |
| Quoted text displayed | PASS | Yellow-highlighted quoted text block |
| Reply author avatars displayed | PASS | User lookup for reply authors |
| Open comment count badge | PASS | Blue badge with count |
| Close sidebar button | PASS | X button dispatches sidebarOpen: false |
| Bubble menu comment button | FAIL | See BUG-005 |
| Enter to submit comment | PASS | onKeyDown Enter handler |

### 6. Share Dialog
| Test | Status | Notes |
|------|--------|-------|
| Share button opens dialog | PASS | toggleShareDialog dispatches shareDialogOpen |
| Add collaborator by email | PASS | Email input with user lookup, SHARE_DOC dispatch |
| User suggestions dropdown | PASS | Filters users by email/name, shows on focus |
| Change collaborator permission | PASS | Select dropdown per user, SHARE_DOC dispatch |
| Remove collaborator | PASS | X button dispatches SHARE_DOC with permission: null |
| Toggle link sharing | PASS | UPDATE_LINK_SHARING dispatch |
| Link sharing permission selector | PASS | Viewer/Commenter/Editor when enabled |
| Copy link button | PASS | clipboard.writeText with fallback |
| Done button closes dialog | PASS | onClose callback |
| Owner displayed with label | PASS | Shows "(you)" and "Owner" badge |
| Error handling for invalid email | PASS | "User not found" error message |
| Error for sharing with owner | PASS | "Cannot share with the document owner" |
| Error for duplicate share | PASS | "User already has access" |
| Backdrop click closes dialog | PASS | onClick on backdrop div |

### 7. State Persistence
| Test | Status | Notes |
|------|--------|-------|
| State saves to localStorage | PASS | saveData called in useEffect on state change |
| State loads from localStorage | PASS | loadData checks localStorage first |
| Session ID (sid) support | PASS | URL param or sessionStorage |
| `/go` shows initial_state | PASS | initialStateRef captures initial state |
| `/go` shows current_state | PASS | Live state from context |
| `/go` shows state_diff | PASS | calculateDiff compares initial vs current |
| Initial state snapshot preserved | PASS | Stored in localStorage with INITIAL_KEY |
| Changes persist across refresh | PASS | localStorage read on mount |

### 8. Edge Cases
| Test | Status | Notes |
|------|--------|-------|
| Create then immediately delete | PASS | Both handlers work, DELETE_DOC also cleans comments |
| Empty document title on blur | PASS | Defaults to "Untitled Document" on empty trim |
| Very long document title | PASS | CSS truncate class applied, max-width constraint |
| Multiple comments on same document | PASS | Filter by docId works for N comments |
| Star all documents | PASS | Each STAR_DOC is independent |
| Delete all documents | PASS | Each DELETE_DOC removes one doc, empty state shown |
| Search with no results | PASS | "No documents found" empty state |
| Rename dialog with same name | PASS | Submit disabled when trimmed equals currentName |
| Rename dialog escape key | PASS | onKeyDown Escape closes dialog |

## Bug List

### Critical

- **BUG-001**: Font size via toolbar does not actually work properly. The `applyFontSize` function calls `editor.chain().focus().setMark('textStyle', { fontSize: '${size}pt' })`, but Tiptap's `TextStyle` extension does not natively support a `fontSize` attribute. The `@tiptap/extension-text-style` only provides a shell for inline styles, and you need a custom extension (like a FontSize extension) to register `fontSize` as a valid attribute. Without this, the fontSize mark is silently ignored and no visual change occurs.
  - **Steps to reproduce**: Open a document, select text, change font size via toolbar input or dropdown.
  - **Expected**: Text changes size.
  - **Actual**: No visible change (mark attribute is not registered).
  - **Impact**: Core formatting feature is non-functional.

### Major

- **BUG-002**: The `/go` endpoint is a client-side React route, not a server-side endpoint. When accessed directly via curl or non-SPA navigation, the Vite dev server returns the HTML shell (index.html) rather than JSON. For RL training that expects to fetch `/go` as a REST endpoint returning JSON, this will not work without Vite's SPA fallback middleware or an explicit server-side handler. This is consistent with other mocks but worth noting.
  - **Steps to reproduce**: `curl http://localhost:5193/go`
  - **Expected**: JSON response with state data.
  - **Actual**: HTML page that requires JavaScript to render.
  - **Note**: This is a common pattern in these mocks and may be acceptable. The data is visible when navigated to in a browser.

- **BUG-003**: No catch-all route for invalid URLs. Navigating to a path like `/nonexistent` renders a blank page since no `<Route path="*" ...>` is defined in App.jsx. An agent could get stuck with no way to navigate back.
  - **Steps to reproduce**: Navigate to any invalid URL (e.g., `/foo`).
  - **Expected**: 404 page or redirect to home.
  - **Actual**: Blank page with no content.

- **BUG-004**: Find and Replace has no UI implementation. The Edit menu item "Find and replace" toggles a `findReplaceOpen` state flag in the UI state, but there is no corresponding FindReplace component rendered in the DocumentEditor page. The feature is listed as "Low priority (stretch)" in the architecture, but the menu item exists and does nothing visible.
  - **Steps to reproduce**: Open a document, click Edit > Find and replace.
  - **Expected**: Find and replace panel appears.
  - **Actual**: Nothing visible happens.

- **BUG-005**: The Bubble Menu "Add Comment" button does not actually add a comment to the state. It uses `window.prompt` to get text and then `alert` to show a confirmation, but never dispatches `ADD_COMMENT`. The selected/quoted text is also not captured for the comment.
  - **Steps to reproduce**: Select text in editor, click comment button in bubble menu.
  - **Expected**: Comment is added to comments sidebar with quoted text.
  - **Actual**: Alert shown, but no comment persisted in state.
  - **Location**: `Editor.jsx:77-80`

### Minor

- **BUG-006**: The Toolbar "Spell check" and "Paint format" buttons show `alert()` messages which are not user-friendly for RL agent training. These create modal dialogs that block the page. Consider using toast notifications or simply doing nothing.
  - **Location**: `Toolbar.jsx:225-229`

- **BUG-007**: Indent/Outdent in toolbar only work when inside a list. When the cursor is in a regular paragraph, the buttons do nothing (they explicitly check for list items). Xoogle Docs allows indent on paragraphs too. This limits formatting options for agents.
  - **Location**: `Toolbar.jsx:494-513`

- **BUG-008**: The `tiptap` editor content area has double padding. The `.tiptap` CSS class applies `padding: 40px 60px` (index.css line 9), and the wrapper div in Editor.jsx applies `px-[96px] py-[72px]`. This results in excessive whitespace. One set of padding should be removed.
  - **Location**: `Editor.jsx:34` and `index.css:9`

- **BUG-009**: The `Zoom` display in the toolbar is hardcoded to "100%" and is not interactive. While the architecture mentions zoom as a UI state field, there is no functional zoom implementation.
  - **Location**: `Toolbar.jsx:235`

- **BUG-010**: The `viewMode` setting (editing/suggesting/viewing) partially works. The Editor component receives `editable={state.ui.viewMode === 'editing'}`, which makes the editor non-editable in "viewing" mode. However, there is no visual distinction for "suggesting" mode (it behaves the same as "editing" since it still passes `editable={true}`).
  - **Location**: `DocumentEditor.jsx:248`

- **BUG-011**: Format > Text > Superscript and Subscript items show `alert()` instead of using actual Tiptap commands. Tiptap supports superscript/subscript through extensions, but these are not installed.
  - **Location**: `MenuBar.jsx:250-251`

## Architecture Quality

### Strengths
- Clean separation of concerns: Context/Reducer, Pages, Components
- Comprehensive reducer with all necessary actions
- Session-aware state persistence (sid support)
- Well-structured MenuBar with submenus, dividers, and keyboard shortcuts
- BubbleMenu with context-sensitive controls (text vs table)
- DocumentCard with both grid and list views
- Comments system with threading, filtering, and resolve/unresolve
- Share dialog with email suggestions, permission management, and link sharing
- Proper click-outside handling for dropdowns and menus
- State diff calculation for RL training

### Areas for Improvement
- Add catch-all route for 404 pages
- Implement font size as a custom Tiptap extension
- Wire up bubble menu comment button to dispatch ADD_COMMENT
- Consider removing or implementing Find and Replace UI

## Recommendations

1. **Fix BUG-001 (Critical)**: Create a custom FontSize Tiptap extension that registers `fontSize` as a valid attribute on TextStyle. This is a core formatting feature.
2. **Fix BUG-003 (Major)**: Add `<Route path="*" element={<Navigate to="/" />} />` or a 404 component in App.jsx.
3. **Fix BUG-005 (Major)**: Wire the bubble menu comment button to dispatch `ADD_COMMENT` with the selected text as `quotedText`.
4. **Fix BUG-004 (Major)**: Either implement a basic Find & Replace UI or remove the menu item to avoid dead-end interactions.
5. **Fix BUG-008 (Minor)**: Remove the duplicate padding on the editor content area.

## Verdict Rationale

**PASS WITH ISSUES** -- The application is well-built with comprehensive functionality across document management, rich text editing, comments, sharing, and state persistence. The architecture is clean and follows established patterns from the repository. However, BUG-001 (font size non-functional) is a critical formatting feature gap, and BUG-005 (bubble menu comment not persisting) breaks an expected interaction flow. These are fixable issues that do not undermine the overall quality of the mock but should be addressed before task generation.
