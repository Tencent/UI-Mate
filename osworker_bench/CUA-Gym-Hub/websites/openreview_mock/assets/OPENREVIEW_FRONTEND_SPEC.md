# XpenReview Frontend Specification

Extracted from the real XpenReview web application (`xpenreview-web`). This document covers all core frontend functionality, data structures, API patterns, and interaction logic.

---

## 1. Data Models

### 1.1 Note (Paper/Submission)

The Note is the central data model. In API v2, content values are wrapped in `{value, readers}` objects.

**API v2 Note Shape:**
```js
{
  id: string,                    // unique note ID (e.g., "abcXYZ123")
  forum: string,                 // forum ID (equals id for top-level submissions)
  invitations: string[],         // e.g., ["venue.cc/2024/Conference/-/Submission"]
  domain: string,                // e.g., "venue.cc/2024/Conference"
  number: number,                // submission number (1, 2, 3...)
  cdate: number,                 // creation date (unix timestamp ms)
  tcdate: number,                // true creation date
  mdate: number,                 // modification date
  tmdate: number,                // true modification date
  ddate: number | null,          // deletion date (null if not deleted)
  pdate: number | null,          // publication date
  odate: number | null,          // online date
  replyto: string | null,        // parent note ID (null for forum notes)
  signatures: string[],          // e.g., ["~Author_Name1"]
  readers: string[],             // e.g., ["everyone"] or specific group IDs
  writers: string[],
  nonreaders: string[],
  license: string | null,        // e.g., "CC BY 4.0"
  externalIds: string[],         // e.g., ["arxiv:2401.12345", "doi:10.xxxx"]
  content: {
    title: { value: string, readers?: string[] },
    authors: { value: string[], readers?: string[] },
    authorids: { value: string[], readers?: string[] },
    abstract: { value: string },
    keywords: { value: string[] },
    pdf: { value: string },       // "/attachment/<id>" or URL
    html: { value: string },
    venue: { value: string },
    venueid: { value: string },
    _bibtex: { value: string },
    _disableTexRendering: { value: boolean },
    // Review-specific fields:
    rating: { value: string | number },
    confidence: { value: string | number },
    recommendation: { value: string },
    // ... any custom content fields
  },
  details: {
    writable: boolean,
    presentation: Array<{name: string, fieldName?: string, description?: string, type?: string, markdown?: boolean}>,
    invitation: object | null,       // the invitation object
    originalInvitation: object | null,
    original: object | null,         // original (unblinded) note
    replyCount: number,
    tags: object[],
    signatures: Array<{id: string, members: string[], readers: string[]}>,
    repliedNotes: object[],
  }
}
```

**Formatted Note (after `formatNote()` in forum-utils.js):**
```js
{
  // ... all fields from above, plus:
  sortedReaders: string[],          // readers sorted alphabetically
  searchText: string,               // combined search corpus
  generatedTitle: string,           // auto-generated from invitation + signatures
  reactions: [[label, [{id, signature, cdate}]]], // grouped tag reactions
  editInvitations: Invitation[],    // invitations to edit this note
  deleteInvitation: Invitation,     // invitation to delete this note
  replyInvitations: Invitation[],   // invitations to reply to this note
  tagInvitations: Invitation[],     // tag invitations for this note
  parentTitle: string,              // title of parent note (for threaded view)
}
```

### 1.2 Edge (Assignment/Score/Relationship)

Edges represent relationships between entities (notes, profiles, groups).

```js
{
  id: string,
  invitation: string,          // e.g., "venue.cc/-/Assignment"
  head: string,                // entity ID (note ID or profile ID)
  tail: string,                // entity ID (note ID or profile ID)
  label: string | null,        // e.g., "Accepted", "Rejected"
  weight: number | null,       // numeric score/weight
  readers: string[],
  writers: string[],
  nonreaders: string[],
  signatures: string[],
  cdate: number,
  tcdate: number,
  mdate: number,
  tmdate: number,
  ddate: number | null,
  details: {
    writable: boolean,
  }
}
```

**Formatted Edge (in edge browser Column.js):**
```js
{
  id: string,
  invitation: string,
  name: string,               // prettified invitation name
  head: string,
  tail: string,
  label: string,
  weight: number,             // rounded to 3 decimal places
  writers: string[],
  readers: string[],
  signatures: string[],
  nonreaders: string[],
  creationDate: number,       // tcdate
  modificationDate: number,   // tmdate
  writable: boolean,
}
```

### 1.3 Group (Venue/Role)

```js
{
  id: string,                 // e.g., "ICLR.cc/2024/Conference"
  members: string[],          // member IDs (profile IDs or group IDs)
  readers: string[],
  writers: string[],
  signatories: string[],
  web: string,                // webfield JS content (legacy)
  domain: string,
  cdate: number,
  ddate: number | null,
}
```

**Homepage uses a simplified venue format:**
```js
{
  groupId: string,            // group ID
  dueDate: number | null,     // nearest due date from invitations
}
```

### 1.4 Profile (User)

```js
{
  id: string,                 // e.g., "~John_Doe1"
  active: boolean,
  content: {
    names: [{
      fullname: string,
      first: string,
      middle: string,
      last: string,
      preferred: boolean,
      username: string,       // e.g., "~John_Doe1"
    }],
    emails: string[],
    preferredEmail: string,
    emailsConfirmed: string[],
    history: [{
      position: string,       // e.g., "PhD Student"
      institution: {
        name: string,         // e.g., "MIT"
        domain: string,       // e.g., "mit.edu"
      },
      start: number,
      end: number,
    }],
    expertise: [{
      keywords: string[],
      start: number,
      end: number,
    }],
    homepage: string,
    dblp: string,
    gscholar: string,
    orcid: string,
  }
}
```

**Formatted Profile Content (from `formatProfileContent()`):**
```js
{
  name: { fullname, first, middle, last, preferred, username },
  email: string,
  title: string,              // "Position at Institution (domain)"
  expertise: string[],        // flattened keywords array
}
```

### 1.5 Invitation (Action Permission)

```js
{
  id: string,                 // e.g., "venue.cc/2024/-/Official_Review"
  domain: string,
  cdate: number,
  duedate: number,            // deadline
  expdate: number,            // expiration
  maxReplies: number | null,
  minReplies: number | null,
  multiReply: boolean,
  edit: {
    note: {
      id: string | { param: { withInvitation?, withVenueid? } },
      replyto: string | { param: { withForum? } },
      content: object,        // field definitions with param specs
      readers: string[] | { param: { const?, regex? } },
      writers: string[],
      signatures: string[],
      ddate: number | null,   // present for delete invitations
    }
  },
  // For edge invitations:
  edge: {
    head: { type: string, query: object, param?: object },
    tail: { type: string, query: object, param?: object },
    label: { param: { enum?, default?, regex?, input? } },
    weight: { param: { enum?, default?, type?, input? } },
    readers: any,
    writers: any,
    signatures: any,
  },
  // For tag invitations:
  tag: {
    note: { id?: string, param?: object },
  },
  details: {
    writable: boolean,
    repliesAvailable: boolean,
    repliedNotes: object[],
  },
  replyForumViews: [{
    id: string,
    label: string,
    filter: string,
    sort: string,
    expandedInvitations: string[],
    layout: string,           // "default" | "chat"
  }],
}
```

---

## 2. API Patterns

### 2.1 Endpoints Used

All requests go through `api-client.js` which wraps `fetch()`. Base URL is `process.env.API_V2_URL` (v2) or `process.env.API_URL` (v1).

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/notes` | Fetch notes (papers, reviews, comments) |
| GET | `/notes?id=X` | Fetch single note by ID |
| GET | `/notes?forum=X` | Fetch all notes in a forum thread |
| GET | `/notes?invitation=X` | Fetch notes created by an invitation |
| GET | `/notes?content.venueid=X` | Fetch notes by venue |
| GET | `/invitations` | Fetch invitations |
| GET | `/invitations?replyForum=X` | Fetch invitations for a forum |
| GET | `/invitations?invitee=~&pastdue=false&type=note` | Active invitations for user |
| GET | `/groups` | Fetch groups |
| GET | `/groups?id=host` | All venues (homepage) |
| GET | `/groups?id=active_venues` | Active venues (homepage) |
| GET | `/profiles` | Fetch profiles |
| GET | `/profiles?id=X` | Fetch single profile |
| GET | `/edges` | Fetch edges (assignments, scores) |
| GET | `/edges?invitation=X&groupBy=head&select=count` | Grouped edge counts |
| POST | `/edges` | Create or update edge |
| POST | `/notes` | Create note |
| PUT | `/notes` | Update note |
| DELETE | `/notes` | Delete note (via ddate) |
| POST | `/refreshToken` | Refresh authentication token |
| GET | `/attachment?id=X&name=pdf` | Download file attachment |
| GET | `/pdf?id=X` | Download PDF |

### 2.2 Query Parameters

**Common note query params:**
- `id` - note ID
- `forum` - forum ID
- `invitation` - invitation ID filter
- `content.venueid` - venue ID filter
- `trash` - include deleted notes (boolean)
- `details` - comma-separated: `writable`, `presentation`, `invitation`, `original`, `replyCount`, `tags`, `signatures`, `repliedNotes`
- `sort` - e.g., `cdate:desc`, `number:asc`, `tmdate:desc`
- `limit` - max results (default 1000)
- `offset` - pagination offset
- `count` - include total count in response (boolean)
- `after` - cursor-based pagination (note ID)
- `select` - field selection, e.g., `id,cdate,content.title`
- `domain` - restrict to specific venue domain
- `mintmdate` - minimum true modification date (for live updates)

**Edge query params:**
- `invitation` - edge invitation ID
- `head` / `tail` - entity IDs
- `label` - edge label filter
- `groupBy` - `head` or `tail` for aggregation
- `select` - `count` for count-only
- `sort` - e.g., `weight:desc`

**Invitation query params:**
- `replyForum` - forum ID
- `expired` - include expired (boolean)
- `type` - `note` or `tag`
- `details` - `repliedNotes,writable`
- `invitee` - `~` for current user
- `pastdue` - boolean

### 2.3 Response Formats

All GET list responses follow the pattern:
```js
{
  notes: Note[],       // or groups, profiles, invitations, edges
  count: number,       // total count (when count=true)
}
```

**`getAll()` helper**: Automatically paginates through all results (limit 1000 per request). Returns flat array.

**`getAllWithAfter()` helper**: Uses cursor-based pagination with `after` parameter. Sequential requests.

**`getCombined()` helper**: Fetches from both API v1 and v2, merges and sorts results.

**`getById()` helper**: Fetches single entity, tries v2 first then v1.

---

## 3. Pages & Components

### 3.1 Homepage

**Route:** `app/(Home)/page.js` (server component)

**Layout:** `app/layout.js` -> `<Nav />` + `<AppInit />` + children

**Data fetching (server-side):**
1. `GET /groups?id=active_venues` -> `formatGroupResults()` -> active venues
2. `GET /invitations?invitee=~&pastdue=false&type=note` -> open venues with due dates
3. `GET /notes?invitation=OpenReview.net/News/-/Article&limit=3&sort=cdate:desc` -> news

**Structure:**
```
<div class="home">
  <div class="col-xs-12">
    <News />                          <!-- dismissible news banner -->
  </div>
  <div class="col-xs-12 col-sm-6">
    <ActiveConsoles />                <!-- user's venue consoles -->
    <OpenVenues />                    <!-- venues with open invitations (mobile) -->
    <ActiveVenues />                  <!-- active venue list -->
  </div>
  <div class="col-xs-12 col-sm-6">
    <OpenVenues />                    <!-- venues with open invitations (desktop) -->
  </div>
  <div class="col-xs-12">
    <AllVenues />                     <!-- alphabetical list of all venues -->
  </div>
</div>
```

**VenueListItem structure:**
```html
<li>
  <h2>
    <a href="/group?id={groupId}&referrer=[Homepage](/)" class="leading-venue?">
      {prettyId(groupId)}
    </a>
  </h2>
  <VenueListItemDueDate dueDate={dueDate} />   <!-- shows relative time -->
</li>
```

**CSS classes:** `.home`, `.conferences.list-unstyled`, `.conferences.list-inline`, `.leading-venue`, `#all-venues`, `#all-venues-mobile`

### 3.2 Navigation

**Component:** `app/(Home)/Nav.js` (server component)

```html
<nav class="navbar navbar-inverse" role="navigation">
  <div class="container">
    <div class="navbar-header">
      <button class="navbar-toggle collapsed">...</button>
      <a href="/" class="navbar-brand home push-link">
        <strong>XpenReview</strong>.net
      </a>
    </div>
    <div id="navbar" class="navbar-collapse collapse">
      <NavSearch />             <!-- search form with autocomplete -->
      <NavUserLinks />          <!-- login/user dropdown -->
    </div>
  </div>
</nav>
```

**NavSearch:** Form submits to `/search?term=X&group=all&content=all&source=all`

**NavUserLinks (logged in):**
- Notifications (with unread count badge)
- Activity
- Tasks
- User dropdown: Profile, Password & Security, Logout

**NavUserLinks (logged out):**
- Login link

### 3.3 Paper Forum

**Route:** `app/forum/page.js`

**URL:** `/forum?id={forumId}&noteId={noteId}&invitationId={invId}&referrer={ref}`

**Server-side data fetching:**
1. `api.getNoteById(queryId)` with `details: 'writable,presentation'` (v2) or `details: 'original,replyCount,writable'` (v1)
2. Handles redirects for blind submissions and forbidden access
3. Generates metadata (citation_title, citation_author, etc.)

**Main Forum Component:** `components/forum/Forum.js`

**Props:**
```js
{
  forumNote: Note,              // the forum (top-level) note
  selectedNoteId: string,       // note to scroll to/highlight
  selectedInvitationId: string, // invitation to auto-open
  prefilledValues: object,      // pre-filled form values
  query: object,                // URL query params
  editInvitationIdToHide: string,
}
```

**State:**
```js
{
  parentNote: Note,                          // formatted forum note
  replyNoteMap: { [noteId]: FormattedNote }, // all replies keyed by ID
  parentMap: { [noteId]: string[] },         // parent -> child IDs
  displayOptionsMap: { [noteId]: { collapsed, contentExpanded, hidden } },
  orderedReplies: string[],                  // sorted reply IDs
  allInvitations: Invitation[],
  signature: string,
  expandedInvitations: string[],
  nesting: 1 | 2 | 3,                       // 1=linear, 2=threaded, 3=nested
  layout: 'default' | 'chat',
  sort: 'date-desc' | 'date-asc',
  defaultCollapseLevel: 0 | 1 | 2,
  filterOptions: { invitations: string[], signatures: string[], readers: string[] },
  selectedFilters: { invitations, signatures, keywords, readers, excludedReaders },
  activeInvitation: Invitation | null,
  maxLength: number,                         // max replies visible (chat mode)
  enableLiveUpdate: boolean,
  latestMdate: number,
}
```

**API calls on mount:**
1. `GET /invitations?replyForum={id}&expired=true&type=note&details=repliedNotes,writable`
2. `GET /invitations?replyForum={id}&type=tag&details=writable`
3. `GET /notes?forum={id}&trash=true&details=writable,signatures,invitation,presentation,tags` (via `getAll`)

**Forum structure:**
```html
<div class="forum-container">
  <ForumNote note={parentNote} />           <!-- main paper -->

  <FilterTabs />                            <!-- tab-based view switching -->
  <FilterForm />                            <!-- filter/sort controls -->

  <div id="forum-replies">
    <ForumReply /> ...                      <!-- threaded replies -->
  </div>
</div>
```

#### 3.3.1 ForumNote

**Component:** `components/forum/ForumNote.js`

**Structure:**
```html
<div class="forum-note [trashed] [disable-tex-rendering]">
  <OtherVersions note={note} />
  <div class="forum-title mt-2 mb-2">
    <h2 class="citation_title">{title}</h2>
    <a class="citation_pdf_url" href="/pdf?id={id}">PDF icon</a>
    <a href="{html}">HTML icon</a>
  </div>
  <div class="forum-authors mb-2">
    <h3><NoteAuthorsV2 /></h3>
  </div>
  <div class="clearfix mb-1">
    <div class="forum-meta">
      <span class="date item"><Icon name="calendar" />{date}</span>
      <span class="item"><Icon name="folder-open" />{venue}</span>
      <span class="readers item"><Icon name="eye-open" />{readers}</span>
      <span class="item"><Icon name="duplicate" /><a href="/revisions?id={id}">Revisions</a></span>
      <span class="item"><Icon name="bookmark" /><a>BibTeX</a></span>
      <span class="item"><Icon name="copyright-mark" />{license}</span>
    </div>
    <div class="invitation-buttons">
      <!-- Edit dropdown and Delete button -->
    </div>
  </div>
  <NoteContentV2 />
</div>
```

#### 3.3.2 ForumReply

**Component:** `components/forum/ForumReply.js`

**Props:**
```js
{
  note: FormattedNote,
  replies: Array<{id, replies}>,   // nested reply tree
  replyDepth: number,
  parentNote: Note,
  updateNote: function,
  deleteOrRestoreNote: function,
  isDirectReplyToForum: boolean,
}
```

**Collapsed reply:**
```html
<div class="note" data-id="{id}">
  <div class="heading">
    <h4 class="minimal-title">
      <strong>{title}</strong> &bull;
      <span class="signatures">by {signatures}</span>
      [Deleted]
    </h4>
    <CopyLinkButton />
  </div>
</div>
```

**Expanded reply:**
```html
<div class="note depth-{odd|even}" data-id="{id}">
  <div class="heading">
    <h4><strong>{title}</strong></h4>
    <CopyLinkButton />
    <!-- Edit dropdown, Delete button -->
  </div>
  <div class="subheading">
    <span class="invitation highlight" style="{invitationColors}">{invitationType}</span>
    <span class="signatures">by {signatureLinks}</span>
    <span class="created-date"><Icon name="calendar" />{date}</span>
    <span class="readers"><Icon name="eye-open" />{readers}</span>
    <span class="revisions"><Icon name="duplicate" /><a href="/revisions?id={id}">Revisions</a></span>
  </div>
  <NoteContentCollapsible />
  <div class="invitations-container mt-2">
    <div class="invitation-buttons">
      <span class="hint">Add:</span>
      <button class="btn btn-xs">{invitationName}</button> ...
    </div>
  </div>
  <!-- Nested child replies -->
</div>
```

**Invitation color map:**
```js
{
  'Comment':          { backgroundColor: '#bfb', color: '#2c3a4a' },
  'Official Comment': { backgroundColor: '#bbf', color: '#2c3a4a' },
  'Public Comment':   { backgroundColor: '#bfb', color: '#2c3a4a' },
  'Review':           { backgroundColor: '#fbb', color: '#2c3a4a' },
  'Meta Review':      { backgroundColor: '#fbf', color: '#2c3a4a' },
  'Official Review':  { backgroundColor: '#fbb', color: '#2c3a4a' },
  'Decision':         { backgroundColor: '#bff', color: '#2c3a4a' },
  // Others: hash-based from palette ['#8cf','#8fc','#8ff','#8cc','#fc8','#f8c','#cf8','#c8f','#cc8','#ccf']
}
```

#### 3.3.3 FilterForm

**Component:** `components/forum/FilterForm.js`

**Structure:**
```html
<form class="form-inline filter-controls">
  <div class="wrap">
    <Dropdown name="filter-invitations" class="replies-filter invitations-filter"
      placeholder="Filter by reply type..." isMulti isSearchable />
    <Dropdown name="filter-signatures" class="replies-filter"
      placeholder="Filter by author..." isMulti isSearchable />
    <input id="keyword-input" placeholder="Search keywords..." />
    <select id="sort-dropdown">
      <option value="date-desc">Sort: Newest First</option>
      <option value="date-asc">Sort: Oldest First</option>
    </select>
    <div class="layout-buttons">
      <!-- Nesting: Linear(1) / Threaded(2) / Nested(3) -->
      <!-- Collapse: Collapsed(0) / Default(1) / Expanded(2) -->
      <!-- Copy URL button -->
    </div>
  </div>
  <div>
    <Icon name="eye-open" tooltip="Visible to" />
    <ToggleButtonGroup name="readers-filter" /> or <Dropdown /> (if >25 readers)
    <em class="filter-count">{visible} / {total} replies shown</em>
  </div>
</form>
```

**Filter matching logic:**
- `invitations`: match note invitation ID against selected
- `signatures`: match note signatures against selected (supports `.*` wildcards)
- `readers`: all selected readers must be present in note readers
- `excludedReaders`: if any selected reader is in note readers, hide the note
- `keywords`: case-insensitive text search in note's `searchText` field

#### 3.3.4 FilterTabs

**Component:** `components/forum/FilterTabs.js`

Uses `replyForumViews` from the invitation config. Each tab has: `id`, `label`, `filter`, `sort`, `expandedInvitations`, `layout`.

```html
<ul class="nav nav-tabs filter-tabs">
  <li data-id="{view.id}" class="active?">
    <a href="?id={forumId}#{view.id}">{view.label}
      <span class="badge">{newMessageCount}</span>
    </a>
  </li>
</ul>
```

### 3.4 Note Components

#### 3.4.1 NoteV2 (Paper Card in Lists)

**Component:** `components/Note.js` (`NoteV2` export)

```html
<div class="note [note-private] [unlinked-publication] {extraClasses}">
  <h4>
    <a href="/forum?id={forum}">{content.title.value || generatedTitle}</a>
    <a href="/attachment?id={id}&name=pdf" class="pdf-link">PDF icon</a>
  </h4>
  <div class="note-parent-title">  <!-- if reply to another note -->
    <Icon name="share-alt" /><strong>{forumContent.title.value}</strong>
  </div>
  <div class="note-authors">
    <NoteAuthorsV2 />
  </div>
  <ul class="note-meta-info list-inline">
    <li>{date}</li>
    <li>{venue || prettyId(invitations[0])}
      <Icon name="eye-open" class="note-visible-icon" tooltip="Privately revealed to you" />
    </li>
    <li class="readers">Readers: <NoteReaders /></li>
    <li>{replyCount} Replies</li>
  </ul>
  <NoteContentV2 />  <!-- expandable content fields -->
</div>
```

**Display options (props.options):**
```js
{
  showContents: boolean,
  showPrivateIcon: boolean,
  collapse: boolean,           // wrap content in Collapse component
  omitFields: string[],
  pdfLink: boolean,
  htmlLink: boolean,
  openNoteInNewWindow: boolean,
  referrer: string,
  replyCount: boolean,
  clientRenderingOnly: boolean,
  isReference: boolean,
  customTitle: (note) => JSX,
  customAuthor: (note) => JSX,
  customMetaInfo: (note) => JSX,
  extraClasses: string,
  emptyMessage: string,
  unlinkedPublications: string[],
}
```

#### 3.4.2 NoteTitle / NoteTitleV2

**Component:** `components/NoteTitle.js`

Renders `<h4>` with link to forum. Uses `buildNoteUrl()`:
```js
// URL construction:
`/forum?id=${forum}${id !== forum ? `&noteId=${id}` : ''}${referrer ? `&referrer=${encodeURIComponent(referrer)}` : ''}`
```

Title text: `content.title?.value || buildNoteTitle(invitation, signatures)`

`buildNoteTitle()` generates: `"{InvitationType} [Edit] [of Paper# by Signature]"`

#### 3.4.3 NoteAuthorsV2

**Component:** `components/NoteAuthors.js`

- Zips `authors.value[]` with `authorids.value[]`
- Falls back to `signatures` if no authors
- Links `~ProfileId` authors to `/profile?id=X`
- Links email authors to `/profile?email=X`
- Links DBLP authors to external DBLP URL
- `maxAuthorsToShow = 20`, then shows expandable "et al." link
- Shows private icon if `authorids.readers` differs from note readers

#### 3.4.4 NoteContentV2

**Component:** `components/NoteContent.js`

**Default omitted fields:** `title`, `authors`, `authorids`, `verdict`, `paperhash`, `ee`, `year`, `venue`, `venueid`, `pdf`, `html` + any fields starting with `_`

**Content ordering:** Uses `presentation` array from `note.details.presentation` if available, otherwise uses natural key order.

Per-field rendering:
- Attachments (`/attachment/` or `/pdf/` prefix): `<DownloadLink>` component
- Markdown-enabled fields: rendered via `marked` + `DOMPurify`
- Regular text: auto-linked URLs and profile IDs
- Arrays: joined with `, `
- Objects: JSON stringified

```html
<div class="note-content">
  <div>
    <strong class="note-content-field disable-tex-rendering">{Field Name}:</strong>
    <Icon name="eye-open" class="private-contents-icon" />  <!-- if private -->
    <span class="note-content-value">{value}</span>
    <!-- or for markdown: -->
    <div class="note-content-value markdown-rendered">{html}</div>
  </div>
</div>
```

#### 3.4.5 NoteList

**Component:** `components/NoteList.js`

```html
<ul class="list-unstyled submissions-list">
  <li><NoteV2 note={note} options={displayOptions} /></li>
  ...
  <!-- or if empty: -->
  <li><p class="empty-message">{emptyMessage}</p></li>
</ul>
```

### 3.5 AC Console

**Component:** `components/webfield/AreaChairConsole.js`

**Context fields (from WebFieldContext):**
```js
{
  venueId: string,                    // e.g., "ICLR.cc/2024/Conference"
  areaChairName: string,              // e.g., "Area_Chairs"
  secondaryAreaChairName: string,
  submissionName: string,             // e.g., "Submission"
  officialReviewName: string,         // e.g., "Official_Review"
  reviewRatingName: string | string[],
  officialMetaReviewName: string,
  reviewerName: string,               // default "Reviewers"
  metaReviewRecommendationName: string, // default "recommendation"
  additionalMetaReviewFields: string[],
  shortPhrase: string,                // venue short name
  filterOperators: string[],
  propertiesAllowed: object,
  enableQuerySearch: boolean,
  extraExportColumns: object[],
  ithenticateInvitationId: string,
  extraRoleNames: string[],
  sortOptions: object,
  displayReplyInvitations: string[],
  customStageInvitations: string[],
}
```

**Table structure:**
```html
<table class="table">
  <thead><tr>
    <th>Checkbox</th>
    <th>#</th>
    <th>Paper Summary</th>
    <th>Review Progress</th>
    <th>Latest Replies</th>    <!-- optional -->
    <th>Meta Review Status</th>
  </tr></thead>
  <tbody>
    <AssignedPaperRow /> ...
  </tbody>
</table>
```

**AssignedPaperRow columns:**
1. Checkbox for selecting notes
2. `note.number` (strong, class `note-number`)
3. `<NoteSummary>` - title, authors, PDF link, venue
4. `<AcPcConsoleNoteReviewStatus>` - review progress per reviewer
5. `<LatestReplies>` - optional, based on displayReplyInvitations
6. `<AreaChairConsoleNoteMetaReviewStatus>` - meta review submission

**Tabs:**
- Assigned Papers tab (default)
- Tasks tab (AreaChairConsoleTasks via ConsoleTaskList)
- Secondary AC tab (if secondaryAreaChairName)
- Extra role tabs

**Menu bar (AreaChairConsoleMenuBar):**
- Query search filter with property-based filtering
- Sort dropdown
- Export to CSV
- Message reviewers modal
- Select all checkbox

**Filterable properties:**
```js
{
  number: ['note.number'],
  title: ['note.content.title.value'],
  author: ['note.content.authors.value', 'note.content.authorids.value'],
  keywords: ['note.content.keywords.value'],
  venue: ['note.content.venue.value'],
  numReviewersAssigned: ['reviewProgressData.numReviewersAssigned'],
  numReviewsDone: ['reviewProgressData.numReviewsDone'],
  ratingAvg: ['reviewProgressData.ratings.{ratingName}.ratingAvg'],
  ratingMax / ratingMin: similar,
  confidenceAvg / Max / Min: ['reviewProgressData.confidence*'],
  replyCount: ['reviewProgressData.replyCount'],
  recommendation: ['metaReviewData.recommendation'],
}
```

### 3.6 Edge Browser (Reviewer Assignment)

**Route:** `/edges/browse?traverse=X&edit=X&browse=X&referrer=X`

**URL parameters:**
- `traverse` - invitation ID for main edges (assignments), with optional `,label:X`
- `edit` - semicolon-separated invitation IDs for editable edges
- `browse` - semicolon-separated invitation IDs for read-only display edges
- `hide` - invitation IDs for hidden edges
- `start` - starting invitation (optional alternative entry)
- `version` - API version
- `maxColumns` - max number of columns
- `referrer` - back link
- `preferredEmailInvitationId` - invitation for preferred email lookup

**Component:** `components/browser/EdgeBrowser.js` (class component)

**State:**
```js
{
  headMap: { [entityId]: EntityContent },   // all head entities (notes)
  tailMap: { [entityId]: EntityContent },   // all tail entities (profiles)
  metadataMap: { [entityId]: metadata },    // assignment metadata
  columns: [{
    type: 'head' | 'tail',
    entityType: 'note' | 'profile' | 'group',
    parent: string | null,
  }],
  loading: boolean,
  traverseGroup: Group | null,
}
```

**Context (EdgeBrowserContext):**
```js
{
  traverseInvitation,
  editInvitations,
  browseInvitations,
  hideInvitation,
  version,
  availableSignaturesInvitationMap,
  traverseGroup,
  ignoreHeadBrowseInvitations,
}
```

**Initialization:**
1. Build entity maps for heads (notes) and tails (profiles) from traverse invitation
2. For each entity type, query the relevant API endpoint (`/notes`, `/profiles`, `/groups`)
3. Get grouped edge counts: `GET /edges?invitation=X&groupBy=head|tail&select=count`
4. Create entity map: `{ [id]: { id, content: formatEntityContent(), searchText, traverseEdgesCount } }`

#### 3.6.1 Column

**Component:** `components/browser/Column.js`

**State:**
```js
{
  selectedItemId: string | null,
  items: EntityItem[],
  filteredItems: EntityItem[],
  itemsHeading: string,
  numItemsToRender: number,        // starts at 100, increments by 100
  columnSort: string,              // 'default' or invitation ID
  hideQuotaReached: boolean,
  searchTerm: string,
  immediateSearchTerm: string,
}
```

**Entity item format:**
```js
{
  // ... entity content (note or profile)
  metadata: { isAssigned, isUserAssigned, hasConflict, isHidden },
  editEdges: FormattedEdge[],        // existing editable edges
  editEdgeTemplates: EdgeTemplate[], // templates for new edges
  browseEdges: FormattedEdge[],      // read-only score edges
  traverseEdgesCount: number,
  traverseEdge: Edge | null,         // for profiles
}
```

**Column structure:**
```html
<div class="col-md-6 col-lg-4">
  <div class="column">
    <div class="column-header">
      {title}
      <input type="search" placeholder="Search..." />
      <select>{sortOptions}</select>
      <label><input type="checkbox" /> Hide quota reached</label>
    </div>
    <div class="column-body">
      <EntityList>
        <NoteEntity /> or <ProfileEntity /> ...
      </EntityList>
      <button>Load More</button>
    </div>
  </div>
</div>
```

**Sort options:**
- Default (by traverse invitation count)
- By each edit/browse invitation score

#### 3.6.2 NoteEntity

**Component:** `components/browser/NoteEntity.js`

```html
<li class="entry entry-note [is-assigned] [has-conflict] [is-hidden] [is-editable] [is-selected]">
  <div class="note-heading">
    <h3><a href="/forum?id={forum}">{title}</a> <span>(#{number})</span></h3>
    <NoteAuthors max={4} />
    <span class="note-venue">{venue}</span>
  </div>
  <NoteContent collapse />
  <div class="note-meta clearfix">
    <!-- EditEdgeDropdown / EditEdgeToggle widgets for each edit invitation -->
    <ScoresList edges={browseEdges} />
    <div class="action-links">
      <a class="show-assignments">{traverseLabel} ({traverseEdgesCount}) &raquo;</a>
    </div>
  </div>
</li>
```

**Click behavior:** Calls `addNewColumn(id, content)` to show child column.

#### 3.6.3 ProfileEntity

**Component:** `components/browser/ProfileEntity.js`

```html
<li class="entry entry-reviewer d-flex [is-assigned] [has-conflict] [is-hidden] [is-editable] [is-selected]">
  <div class="reviewer-heading">
    <h3><a href="/profile?id={id}">{content.name.fullname}</a></h3>
    <p>{content.title}</p>    <!-- "Position at Institution (domain)" -->
    <h3><span>({content.email})</span> or <span onClick={getEmail}>Copy Email</span></h3>
  </div>
  <!-- EditEdge widgets -->
  <!-- Traverse edge widget (for accepted invites) -->
  <div>
    <ScoresList edges={browseEdges} />
    <div class="action-links">
      <a class="show-assignments">{traverseLabel} ({traverseEdgesCount}) &raquo;</a>
    </div>
  </div>
</li>
```

#### 3.6.4 ScoresList

```html
<div class="scores-list">
  <ul class="list-unstyled">
    <li><span>{edge.name}:</span> <span>{getEdgeValue(edge)}</span></li>
  </ul>
</div>
```

`getEdgeValue(edge)`:
- If weight is null: return label
- If label is null: return weight
- Both: `"{label} ({weight})"`

#### 3.6.5 EditEdgeDropdown

```html
<div class="edit-controls full-width">
  <label>{invitationName}:</label>
  <div class="btn-group edit-edge-dropdown">
    <button class="btn btn-default btn-xs btn-link dropdown-toggle">
      <span class="edge-weight">{selected || defaultWeight || defaultLabel}</span>
      <span class="caret" />
    </button>
    <ul class="dropdown-menu">
      <li><a onClick={addEdge({type: option})}>{option}</a></li> ...
    </ul>
  </div>
  <a class="edit-edge-remove"><span class="glyphicon glyphicon-trash" /></a>
</div>
```

#### 3.6.6 EdgeBrowserHeader

```html
<div class="explore-header">
  <div class="container">
    <div class="row">
      <div class="col-xs-12">
        <h1 id="matching-title">{prettyId(invitation.id)} - {label}</h1>
      </div>
    </div>
  </div>
</div>
```

### 3.7 Common Components

#### 3.7.1 Table

```html
<table class="table {className}">
  <thead><tr>
    <th style="width: {heading.width}">{heading.content}</th> ...
  </tr></thead>
  <tbody>{children}</tbody>
</table>
```

#### 3.7.2 Tabs

```html
<div class="tabs-container {className}">
  <div class="mobile-full-width">
    <ul class="nav nav-tabs" role="tablist">
      <li role="presentation" class="disabled?">
        <a href="#{id}" role="tab" data-toggle="tab">
          {children}
          <span class="badge">{headingCount}</span>
          <Icon name={icon} />
        </a>
      </li>
    </ul>
  </div>
  <div class="tab-content">
    <div id="{id}" class="tab-pane fade {className}" role="tabpanel">
      {children}
    </div>
  </div>
</div>
```

Also: `<AntdTabs>` wraps Ant Design Tabs with custom styles: `{ fontWeight: 'bold', color: '#3e6775' }`

#### 3.7.3 Badge

Wraps Ant Design Badge with styles: `{ root: { color: 'inherit' }, indicator: { backgroundColor: '#777', boxShadow: 'none' } }`

#### 3.7.4 PaginatedList

```html
<div>
  <form class="form-inline notes-search-form" role="search">
    <div class="form-group search-content has-feedback">
      <input type="text" class="form-control" placeholder="Search submissions..." />
      <Icon name="search" class="form-control-feedback" />
    </div>
  </form>
  <BasePaginatedList />   <!-- or LoadingSpinner -->
</div>
```

**State:** `listItems`, `totalCount`, `searchTerm`, `page`, `error`

**Behavior:**
- Debounced search (300ms)
- Search triggers when >= 3 chars typed, clears on empty
- Items loaded via `loadItems(limit, offset)` or `searchItems(term, limit, offset)`
- Calls `typesetMathJax()` after items load

### 3.8 Footer

```html
<footer class="sitemap">
  <div class="container">
    <div class="row">
      <!-- 3-column layout (tablet/desktop) -->
      <div class="col-sm-4">About XpenReview, Hosting a Venue, All Venues</div>
      <div class="col-sm-4">Contact, Sponsors, Donate</div>
      <div class="col-sm-4">FAQ, Terms/Privacy, News</div>
    </div>
  </div>
</footer>
<div class="sponsor">
  <p>XpenReview is a long-term project... &copy; {year} XpenReview</p>
</div>
```

---

## 4. Interaction Patterns

### 4.1 Assignment Flow (Edge Browser)

1. **Entry**: User navigates to `/edges/browse?traverse=...&edit=...&browse=...`
2. **Load**: EdgeBrowser builds entity maps for heads (papers) and tails (reviewers) by querying `/notes`, `/profiles`, `/edges`
3. **First column**: Shows all papers or all reviewers (based on traverse invitation head type)
4. **Click entity**: Opens second column showing connected entities via traverse edges
5. **Assign (toggle)**: `EditEdgeToggle` calls `addEdge()` -> `POST /edges` with new edge body
6. **Assign (dropdown)**: `EditEdgeDropdown` selects label/weight -> `POST /edges`
7. **Remove assignment**: Calls `removeEdge()` -> `POST /edges` with `ddate: Date.now()`
8. **Scores display**: Browse edges shown as `ScoresList` (read-only)
9. **Search/filter**: Text search against entity `searchText`, sort by score
10. **Custom load**: `Custom_Max_Papers` edge sets reviewer capacity; assignment disabled when load reached

**Edge creation body:**
```js
{
  invitation: editInvitation.id,
  head: parentId,             // paper ID
  tail: profileId,            // reviewer ID
  label: 'default_label',
  weight: 0,
  readers: interpolated_readers,
  writers: interpolated_writers,
  signatures: [computed_signature],
}
```

### 4.2 Review Submission

1. On forum page, user sees reply invitations under the forum note or replies
2. Clicking invitation button opens `<NoteEditor>` inline
3. NoteEditor renders form fields based on invitation's `edit.note.content` schema
4. On submit: `POST /notes` with note body including `replyto`, `invitation`, `content`, `signatures`
5. On success: `updateNote(newNote)` adds to `replyNoteMap` and updates display
6. Forum supports live updates via WebSocket (`useSocket('forum', ['edit-upserted'])`)

### 4.3 Meta-Review

In AC Console:
1. `<AreaChairConsoleNoteMetaReviewStatus>` shows meta review status
2. Links to forum with `referrer` parameter pointing back to AC console
3. Meta review fields visible: recommendation + any additional fields
4. Uses `metaReviewData.recommendation` path for filtering

### 4.4 Filtering & Sorting

#### Forum Filtering
- **By reply type**: Multi-select dropdown of invitation IDs
- **By author**: Multi-select dropdown of signature group IDs (supports wildcards)
- **By keywords**: Free text search against `searchText` field
- **By readers**: Toggle buttons showing/hiding by reader groups
- **Sort**: Newest First / Oldest First
- **Nesting**: Linear (1) / Threaded (2) / Nested (3)
- **Collapse level**: Collapsed (0) / Partial (1) / Expanded (2)

Filter matching (in Forum.js):
```js
// Signatures: supports wildcard matching
checkSignaturesMatch(selected, replySignature) // some sig matches
// Readers: all selected must be present
checkReadersMatch(selected, replyReaders)     // every selected in reply readers
// Excluded readers: if any match, hide
checkExReadersMatch(excluded, replyReaders)   // some excluded in reply readers
// Keywords: case-insensitive substring in searchText
```

#### Console Filtering (AC Console)
- Query-based search with operators: `!=`, `>=`, `<=`, `>`, `<`, `==`, `=`
- Properties: number, title, author, ratings, confidence, etc.
- Sort by various properties
- CSV export with customizable columns

### 4.5 Search

**Global search:** NavSearch submits to `/search?term=X&group=all&content=all&source=all`

**Forum search:** Keyword input in FilterForm searches against `note.searchText`

**Edge browser search:** Per-column text search against entity `searchText`

**PaginatedList search:** Debounced (300ms), searches via `searchItems(term, limit, offset)` callback

**Search text construction (`buildNoteSearchText`):**
```js
searchFields = [id, `#${number}`, prettyInvitationId(invitations)]
// All content fields except: pdf, verdict, paperhash, ee, html, year, venueid
// Strings and arrays included, objects excluded
// If details.original: includes original authors and authorids
return searchFields.join('\n')
```

**Profile search text (`buildProfileSearchText`):**
```js
searchFields = [id, names.fullname, institution.name, institution.domain,
                preferredEmail, confirmedEmails, expertise.keywords]
```

---

## 5. State Structure for Mock

### 5.1 Proposed createInitialData()

Based on the real data shapes extracted above:

```js
function createInitialData() {
  return {
    // Venue
    venue: {
      id: 'Mock.cc/2024/Conference',
      shortPhrase: 'Mock 2024',
      submissionName: 'Submission',
      officialReviewName: 'Official_Review',
      officialMetaReviewName: 'Meta_Review',
      reviewerName: 'Reviewers',
      areaChairName: 'Area_Chairs',
      reviewRatingName: 'rating',
      metaReviewRecommendationName: 'recommendation',
    },

    // Groups
    groups: {
      host: { id: 'host', members: ['Mock.cc/2024/Conference'] },
      active_venues: { id: 'active_venues', members: ['Mock.cc/2024/Conference'] },
      'Mock.cc/2024/Conference': {
        id: 'Mock.cc/2024/Conference',
        members: [],
        web: '...',
      },
      'Mock.cc/2024/Conference/Reviewers': {
        id: 'Mock.cc/2024/Conference/Reviewers',
        members: ['~Reviewer_One1', '~Reviewer_Two1'],
      },
      'Mock.cc/2024/Conference/Area_Chairs': {
        id: 'Mock.cc/2024/Conference/Area_Chairs',
        members: ['~AC_One1'],
      },
    },

    // Profiles
    profiles: {
      '~Author_One1': {
        id: '~Author_One1',
        active: true,
        content: {
          names: [{ fullname: 'Author One', first: 'Author', last: 'One', preferred: true, username: '~Author_One1' }],
          emails: ['author1@example.com'],
          preferredEmail: 'author1@example.com',
          emailsConfirmed: ['author1@example.com'],
          history: [{ position: 'Professor', institution: { name: 'MIT', domain: 'mit.edu' } }],
          expertise: [{ keywords: ['machine learning', 'NLP'] }],
        },
      },
      '~Reviewer_One1': { /* similar */ },
      '~AC_One1': { /* similar */ },
    },

    // Notes (Submissions)
    notes: {
      'noteId1': {
        id: 'noteId1',
        forum: 'noteId1',
        invitations: ['Mock.cc/2024/Conference/-/Submission'],
        domain: 'Mock.cc/2024/Conference',
        number: 1,
        cdate: 1700000000000,
        tcdate: 1700000000000,
        mdate: 1700100000000,
        tmdate: 1700100000000,
        ddate: null,
        pdate: 1700200000000,
        odate: null,
        replyto: null,
        signatures: ['~Author_One1'],
        readers: ['everyone'],
        writers: ['Mock.cc/2024/Conference', '~Author_One1'],
        license: 'CC BY 4.0',
        content: {
          title: { value: 'A Novel Approach to Mock Testing' },
          authors: { value: ['Author One', 'Author Two'] },
          authorids: { value: ['~Author_One1', '~Author_Two1'] },
          abstract: { value: 'This paper presents...' },
          keywords: { value: ['testing', 'mock'] },
          pdf: { value: '/pdf/noteId1' },
          venue: { value: 'Mock 2024' },
          venueid: { value: 'Mock.cc/2024/Conference/Submission' },
          _bibtex: { value: '@inproceedings{...}' },
        },
        details: {
          writable: false,
          presentation: [],
          replyCount: 3,
        },
      },
    },

    // Reviews (also notes, keyed by id)
    reviews: {
      'reviewId1': {
        id: 'reviewId1',
        forum: 'noteId1',
        invitations: ['Mock.cc/2024/Conference/Submission1/-/Official_Review'],
        number: 1,
        replyto: 'noteId1',
        signatures: ['Mock.cc/2024/Conference/Submission1/Reviewer_ABCD'],
        readers: ['Mock.cc/2024/Conference/Program_Chairs', 'Mock.cc/2024/Conference/Submission1/Area_Chairs', 'Mock.cc/2024/Conference/Submission1/Reviewers'],
        content: {
          title: { value: 'Review of Submission 1' },
          review: { value: 'This paper is well-written...' },
          rating: { value: '8: Strong Accept' },
          confidence: { value: '4: High' },
          soundness: { value: '3 good' },
        },
        details: {
          writable: false,
          invitation: { /* invitation object */ },
          signatures: [{ id: 'Mock.cc/2024/Conference/Submission1/Reviewer_ABCD', members: ['~Reviewer_One1'], readers: ['Mock.cc/2024/Conference/Submission1/Area_Chairs'] }],
        },
      },
    },

    // Edges (Assignments)
    edges: [
      {
        id: 'edgeId1',
        invitation: 'Mock.cc/2024/Conference/Reviewers/-/Assignment',
        head: 'noteId1',
        tail: '~Reviewer_One1',
        label: null,
        weight: null,
        readers: ['Mock.cc/2024/Conference'],
        writers: ['Mock.cc/2024/Conference'],
        signatures: ['Mock.cc/2024/Conference'],
      },
      {
        id: 'edgeId2',
        invitation: 'Mock.cc/2024/Conference/Reviewers/-/Affinity_Score',
        head: 'noteId1',
        tail: '~Reviewer_One1',
        weight: 0.85,
        label: null,
        readers: ['Mock.cc/2024/Conference'],
      },
      {
        id: 'edgeId3',
        invitation: 'Mock.cc/2024/Conference/Reviewers/-/Conflict',
        head: 'noteId1',
        tail: '~Reviewer_Two1',
        weight: null,
        label: 'Institutional',
        readers: ['Mock.cc/2024/Conference'],
      },
    ],

    // Invitations
    invitations: {
      'Mock.cc/2024/Conference/-/Submission': {
        id: 'Mock.cc/2024/Conference/-/Submission',
        domain: 'Mock.cc/2024/Conference',
        duedate: 1701000000000,
        expdate: 1701100000000,
        edit: {
          note: {
            id: { param: { withInvitation: 'Mock.cc/2024/Conference/-/Submission' } },
            content: {
              title: { value: { param: { type: 'string', regex: '.{1,250}' } } },
              authors: { value: { param: { type: 'string[]' } } },
              abstract: { value: { param: { type: 'string', maxLength: 5000 } } },
              pdf: { value: { param: { type: 'file', extensions: ['pdf'] } } },
            },
          },
        },
      },
      'Mock.cc/2024/Conference/Submission1/-/Official_Review': {
        id: 'Mock.cc/2024/Conference/Submission1/-/Official_Review',
        duedate: 1702000000000,
        expdate: 1702100000000,
        edit: {
          note: {
            replyto: { param: { withForum: 'noteId1' } },
            content: {
              review: { value: { param: { type: 'string', minLength: 1 } } },
              rating: { value: { param: { type: 'string', enum: ['1: Strong Reject', '3: Reject', '5: Borderline', '8: Strong Accept', '10: Award'] } } },
              confidence: { value: { param: { type: 'string', enum: ['1: Low', '2: Medium', '3: High', '4: Very High'] } } },
            },
          },
        },
        details: { repliesAvailable: true, writable: true },
      },
    },
  }
}
```

### 5.2 Key ID Patterns

**Group ID format:** `{venue_domain}/{Year}/{Track}/{RoleName}`
- Example: `ICLR.cc/2024/Conference/Reviewers`
- Paper-specific: `ICLR.cc/2024/Conference/Submission1/Reviewers`
- Anonymous: `ICLR.cc/2024/Conference/Submission1/Reviewer_ABCD`

**Invitation ID format:** `{group_id}/-/{InvitationName}`
- Example: `ICLR.cc/2024/Conference/-/Submission`
- Paper-specific: `ICLR.cc/2024/Conference/Submission1/-/Official_Review`

**Profile ID format:** `~{FirstName}_{LastName}{N}`
- Example: `~John_Doe1`

**Note ID format:** Random alphanumeric string (e.g., `abcXYZ123`)

### 5.3 URL Patterns

| Page | URL |
|------|-----|
| Homepage | `/` |
| Venue page | `/group?id={venueId}` |
| Forum page | `/forum?id={forumId}` |
| Forum with reply | `/forum?id={forumId}&noteId={noteId}` |
| Profile | `/profile?id={profileId}` or `/profile?email={email}` |
| Search | `/search?term=X&group=all&content=all&source=all` |
| Edge browser | `/edges/browse?traverse=X&edit=X&browse=X` |
| Login | `/login` |
| Tasks | `/tasks` |
| Activity | `/activity` |
| Notifications | `/notifications` |
| Revisions | `/revisions?id={noteId}` |
| PDF download | `/pdf?id={noteId}` |
| Attachment | `/attachment?id={noteId}&name={fieldName}` |
| All venues | `/venues` |
| Assignments | `/assignments?group={groupId}` |

### 5.4 CSS Class Reference

**Note components:**
- `.note` - base note container
- `.note-private` - privately revealed note
- `.note-parent-title` - parent forum title
- `.note-authors` - authors section
- `.note-meta-info.list-inline` - date/venue/readers metadata
- `.note-content` - content fields container
- `.note-content-field.disable-tex-rendering` - field label
- `.note-content-value` - field value
- `.note-content-value.markdown-rendered` - markdown content
- `.submissions-list.list-unstyled` - note list container
- `.empty-message` - no results message

**Forum components:**
- `.forum-note` - main forum note
- `.forum-note.trashed` - deleted forum note
- `.forum-title` - forum title section
- `.forum-authors` - forum authors section
- `.forum-meta` - metadata row (date, venue, readers)
- `.forum-content-link` - PDF/HTML icon links
- `.citation_title` - paper title (h2)
- `.citation_pdf_url` - PDF link (for citation parsers)
- `.forum-replies-container` - all replies container
- `.filter-controls` - filter form
- `.filter-tabs` - view switching tabs
- `.invitation.highlight` - reply type badge
- `.invitation-buttons` - action buttons
- `.note.depth-even` / `.note.depth-odd` - threaded alternating styles
- `.parent-title` - "Replying to..." header
- `.signatures` - author signatures
- `.created-date` - creation date
- `.readers` - visibility info

**Edge browser:**
- `.explore-header` - browser header
- `.column` - entity column
- `.column-header` - column title + search
- `.column-body` - scrollable entity list
- `.entry.entry-note` - paper entity item
- `.entry.entry-reviewer` - reviewer entity item
- `.is-assigned` - assigned state
- `.has-conflict` - conflict state
- `.is-hidden` - hidden state
- `.is-editable` - editable state
- `.is-selected` - selected/active state
- `.note-heading` - entity title area
- `.note-venue` - venue badge
- `.reviewer-heading` - reviewer info area
- `.scores-list` - score display
- `.edit-controls` - edge edit UI
- `.edit-edge-dropdown` - dropdown for edge editing
- `.edit-edge-remove` - trash icon for edge removal
- `.edge-weight` - current edge value display
- `.action-links` - traverse/count links
- `.show-assignments` - "Assignments (N) >>" link

**Navigation:**
- `.navbar.navbar-inverse` - top nav bar
- `.navbar-brand.home.push-link` - logo link
- `.navbar-form.navbar-left.profile-search` - search form
- `#user-menu.dropdown` - user dropdown menu

**Layout:**
- `.container` / `.container-fluid` - Bootstrap containers
- `#content` - main content area
- `.sitemap` - footer
- `.sponsor` - sponsor bar

**Tables:**
- `.table` - base table class
- `.note-number` - paper number cell

**Tabs:**
- `.tabs-container` - tab wrapper
- `.nav.nav-tabs` - tab header
- `.tab-content` - tab body
- `.tab-pane.fade` - individual tab panel
