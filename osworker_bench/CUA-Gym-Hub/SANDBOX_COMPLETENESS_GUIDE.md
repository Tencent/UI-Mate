# CUA Mock Website Completeness Guide

This repository is training infrastructure for computer-use agents. Each mock site should behave like a rigorous, self-contained sandbox version of a real commercial product. The goal is not just visual similarity; the goal is to make RL tasks reliable by removing dead ends, fake affordances, state-sync bugs, and surprising UI failures.

## Core Values

1. UI completeness matters most.
   If a control is visible and appears clickable, it must do something coherent. Do not leave clickable placeholders, “not implemented” toasts, empty menus, fake buttons, or no-op flows. Computer-use agents will click edges humans might avoid.

2. Preserve task compatibility.
   Do not break existing task schemas. Never remove or rename fields from app state, API responses, or fixtures. Prefer additive fields only when necessary. Existing `/go`, `/post`, `/upload`, `/files`, initial state, current state, and diff behavior must remain backward compatible.

3. Realistic product shape.
   Compare against the real product’s high-level navigation and first screen. If the real app has a homepage, dashboard, inbox, file picker, or document list before the editor, the mock should too. Direct-editor-only mocks are acceptable only when that is how the real product opens.

4. No gray placeholder graveyards.
   Avoid disabled menu items as a substitute for implementation. Either implement a local sandbox version, hide the item, or move it to a real dialog/state. Disabled controls are acceptable only for transient state that the real app also disables, such as Undo with an empty undo stack.

5. File interactions are first-class.
   Upload, download, import, export, attachment, file picker, preview, and generated files are high-value training surfaces. Implement them locally with real browser/file behavior whenever possible. Server endpoints must serve uploaded/downloaded files with useful content type and disposition.

6. State must be inspectable and deterministic.
   User-visible edits must persist through local state and sync to the mock server for the current `sid`. `/go?sid=...` must expose meaningful `initial_state`, `current_state`, and `state_diff`. The initial baseline must be created before the first mutation so diffs are stable.

7. Sandbox actions should be safe and local.
   For cloud/collaboration actions, implement local analogs: share dialogs, local drafts, local version history, local folder movement, local trash, local notifications. Do not call external services.

8. Browser QA is mandatory.
   Build success is not enough. Use Browser Use against localhost to click realistic workflows, edge menus, dialogs, file actions, keyboard shortcuts, mobile-ish/narrow states when relevant, and `/go` state inspection.

## Required Workflow For Each Mock App

1. Sparse pull only the target folder.
   Keep the working set small. Each worker owns exactly one app folder unless explicitly coordinating a shared helper.

2. Understand the real product shape.
   Identify the first screen, primary navigation, common object lifecycle, and file-related flows. Use stable knowledge and local screenshots. Browse only when current product details matter.

3. Inventory fake affordances.
   Search for:
   - `placeholder`
   - `TODO`
   - `coming soon`
   - `not available`
   - `not implemented`
   - `toast`
   - empty `onClick`
   - disabled menu items
   - menu items with no action
   - buttons that only show a dead-end message

4. Test like a computer-use agent.
   Cover:
   - first screen and route navigation
   - menus and submenus
   - create/open/edit/delete/duplicate flows
   - search/filter/sort
   - upload/download/import/export
   - dialogs/modals/context menus
   - keyboard shortcuts
   - selection/drag/hover/resize/z-index behavior
   - responsive and clipped layouts
   - `/go?sid=...` after mutations

5. Implement local behavior.
   Prefer real, minimal local behavior over fake feedback. Examples:
   - Share opens a local access dialog and copy-link action.
   - Email opens a local draft composer.
   - Version history shows undo/history entries.
   - Move updates a local folder label.
   - Trash marks or moves the item locally.
   - Download creates an actual file blob.
   - Upload/import parses the file and updates app state.
   - Charts/images/comments/notes create local state and visible UI.

6. Preserve schema.
   Use existing state fields if available. If adding fields, make them optional/additive and ensure initial fixtures still load. Do not deep-merge user state in a way that changes existing semantics unless the app already does so safely.

7. Fix server sync.
   Ensure save-state logic posts `set_current` for both `sid` and no-sid cases when the app supports server inspection. Ensure the server creates an initial baseline if missing, using `initial_state || state`.

8. Verify.
   Run the app’s build command. Use Browser Use to validate several real workflows and inspect `/go`. Record what was tested in the commit or final report.

9. Commit one app at a time.
   Commit after one app reaches a meaningful quality bar. Do not bundle unrelated apps in one commit unless the change is a shared infrastructure fix.

## Acceptance Criteria

An app is ready when:

- The first screen matches the real product’s expected entry point.
- No obvious clickable placeholder remains.
- Menus do not contain gray disabled items except state-dependent controls such as empty undo.
- Core create/edit/delete/search/filter/sort flows work.
- File upload/download/import/export surfaces work where relevant.
- Visual layers do not overlap incorrectly; hover, selection, and resize affordances render above the right surfaces.
- Dialogs can be opened and closed with mouse and Escape where expected.
- Mutations persist and appear in `/go` state/diff for the active `sid`.
- `npm run build` or equivalent passes.
- Browser Use QA covers at least three meaningful workflows.

## Subagent Contract

Each worker must:

- Own one folder only, for example `websites/google_drive_mock/`.
- Not edit shared files unless explicitly assigned.
- Not revert or overwrite commits from other workers.
- Keep schema changes backward compatible.
- Prefer local sandbox implementations over external network behavior.
- Run searches for placeholders and fake affordances before finishing.
- Run build and Browser Use or a documented equivalent if Browser Use is unavailable in the worker context.
- Commit its app with a focused message after verification.
- Report changed files, workflows tested, residual risks, and commit hash.

Suggested worker prompt:

> You own `websites/<app>_mock` only. Read `SANDBOX_COMPLETENESS_GUIDE.md`. Sparse-checkout the folder if needed. QA the mock like a computer-use-agent training sandbox. Compare to the real product shape, remove clickable placeholders, implement local versions of visible features, preserve existing data schemas, fix state sync if needed, run build, validate in browser, and commit only your app changes to local `main`. Do not edit other app folders. Final report: commit hash, key fixes, tests, remaining risks.

## Priority App Batches

Batch A: high-value productivity/collaboration apps
- `google_drive_mock`
- `google_docs_mock`
- `google_calendar_mock`
- `slack_mock`
- `trello_mock`
- `jira_mock`

Batch B: operational SaaS apps
- `notion_mock`
- `airtable_mock`
- `asana_mock`
- `linear_mock`
- `github_mock`
- `salesforce_mock`

Batch C: file/form-heavy or high-stakes workflow mocks
- `docusign_mock`
- `workday_mock`
- `greenhouse_mock`
- `quickbooks_mock`
- `stripe_dashboard_mock`
- `hubspot_mock`

Batch D: commerce/travel/consumer workflows
- `amazon_mock`
- `booking_com_mock`
- `expedia_mock`
- `uber_eats_mock`
- `shopify_admin_mock`
- `zillow_mock`

## Current Baseline Notes

- `gmail_mock`: state sync and compose draft/send behavior were fixed; compose clipping was improved.
- `google_sheets_mock`: homepage, editor route, file downloads/import, menu actions, local share/email/version/history, chart/image/note/comment/data-validation/named-range actions, grid z-index, and server baseline sync were improved.
