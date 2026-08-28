# salesforce_mock Schema

**Deploy order**: 45 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8044)
**Base URL**: `http://172.17.46.46:8044/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**Merge**: `POST /post?sid=<sid>` with body `{"action":"set","merge":true,"state":{...}}`

## Application Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Dashboard home with metrics, quick actions, and chatter feed |
| `/leads` | Leads | Lead list with filter, sort, bulk actions, CSV export |
| `/leads/:id` | LeadDetail | Lead detail with inline editing, activity timeline, chatter tab |
| `/accounts` | Accounts | Account list with bulk actions |
| `/accounts/:id` | AccountDetail | Account detail with related contacts, opportunities, cases |
| `/contacts` | Contacts | Contact list with bulk actions |
| `/contacts/:id` | ContactDetail | Contact detail with inline address editing |
| `/opportunities` | Opportunities | Opportunity list (table + kanban views) with drag-and-drop stage changes |
| `/opportunities/:id` | OpportunityDetail | Opportunity detail with SalesPath stage progression |
| `/cases` | Cases | Case list with bulk actions |
| `/cases/:id` | CaseDetail | Case detail with inline editing |
| `/chatter` | Chatter | Global chatter feed with post creation and comments |
| `/files` | Files | File list with upload, download, and share link generation |
| `/dashboards` | Dashboards | Dashboard list, creation, and deletion; metrics computed from state |
| `/reports` | Reports | Report summaries with live counts from state |
| `/calendar` | Calendar | Monthly calendar with click-to-create event modal |
| `/profile` | UserProfile | User profile view and editing (name, title, department, email, phone) |
| `/settings` | UserSettings | User settings (language, timezone, notification preferences) |
| `/go` | StateInspector | JSON dump: `{initial_state, current_state, state_diff}` |

### URL Parameters

| URL Pattern | Behavior |
|-------------|----------|
| `/leads?create=1` | Leads page auto-opens "New Lead" modal on load |
| `/accounts?create=1` | Accounts page auto-opens "New Account" modal on load |
| `/contacts?create=1` | Contacts page auto-opens "New Contact" modal on load |
| `/opportunities?create=1` | Opportunities page auto-opens "New Opportunity" modal on load |
| `/cases?create=1` | Cases page auto-opens "New Case" modal on load |
| `?sid=<sid>` | Session ID passed to state API for multi-tenant state isolation |

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Logged-in user (userId, firstName, lastName, email, phone, title, department, role, avatar, timezone, locale, theme) |
| `users` | User[] | All team members (same shape as `user`); default 5 users (user-1..user-5) |
| `leads` | Lead[] | Sales leads; default 8 records (lead-1..lead-8) |
| `accounts` | Account[] | Company accounts; default 5 records (account-1..account-5) |
| `contacts` | Contact[] | Contact persons linked to accounts; default 6 records (contact-1..contact-6) |
| `opportunities` | Opportunity[] | Sales opportunities; default 6 records (opp-1..opp-6) |
| `cases` | Case[] | Support cases; default 5 records (case-1..case-5) |
| `activities` | Activity[] | Tasks and events; default 8 records (activity-1..activity-8) |
| `chatterPosts` | ChatterPost[] | Feed posts with comments and likes; default 5 posts |
| `files` | FileItem[] | Uploaded files; default 5 records (file-1..file-5) |
| `dashboards` | Dashboard[] | User-created dashboards; default `[]` |
| `following` | string[] | userIds current user follows; default `["user-2","user-3"]` |
| `recentlyViewed` | RecentItem[] | Recently viewed records `{type,id,name,path,timestamp}`; default `[]` |
| `dismissedNotifications` | string[] | IDs of dismissed notifications; default `[]` |

### Key Subfield Details

**User**: `userId`, `firstName`, `lastName`, `email`, `phone`, `title`, `department`, `role`, `avatar`, `timezone`, `locale`, `theme`

**Lead**: `leadId`, `firstName`, `lastName`, `company`, `title`, `email`, `phone`, `mobile`, `status` (New/Working/Qualified/Unqualified), `rating` (Hot/Warm/Cold), `source`, `street`, `city`, `state`, `zip`, `country`, `industry`, `employees`, `revenue`, `website`, `description`, `ownerId`, `createdDate`, `modifiedDate`

**Account**: `accountId`, `name`, `parentAccountId?`, `phone`, `website`, `type` (Customer/Prospect/Partner/Reseller), `industry`, `revenue`, `employees`, `description`, `ownerId`, billing address fields (`billingStreet`, `billingCity`, `billingState`, `billingZip`, `billingCountry`), shipping address fields (`shippingStreet`, `shippingCity`, `shippingState`, `shippingZip`, `shippingCountry`), `createdDate`, `modifiedDate`

**Contact**: `contactId`, `accountId`, `firstName`, `lastName`, `title`, `department`, `email`, `phone`, `mobile`, `reportsToId?`, mailing address fields (`mailingStreet`, `mailingCity`, `mailingState`, `mailingZip`, `mailingCountry`), `ownerId`, `createdDate`, `modifiedDate`

**Opportunity**: `opportunityId`, `name`, `accountId`, `contactId?`, `amount`, `closeDate`, `stage` (Prospecting/Qualification/Needs Analysis/Value Proposition/Proposal/Negotiation/Closed Won/Closed Lost), `probability`, `type`, `leadSource`, `nextStep`, `description`, `ownerId`, `createdDate`, `modifiedDate`

**Case**: `caseId`, `caseNumber` (format: `CASE-00001`), `subject`, `status` (New/Working/Escalated/Closed), `priority` (Low/Medium/High/Critical), `origin` (Email/Phone/Web/Chat), `type?`, `accountId`, `contactId`, `description`, `internalComments?`, `ownerId`, `createdDate`, `modifiedDate`, `closedDate?`

**Activity**: `activityId`, `type` (task/event), `subject`, `status`, `priority`, `dueDate?` (task), `startDateTime?` (event), `endDateTime?` (event), `relatedToType`, `relatedToId`, `assignedToId`, `description`, `createdDate`

**ChatterPost**: `postId`, `userId`, `content`, `createdDate`, `likeCount`, `commentCount`, `likes` (userId[]), `comments` (ChatterComment[])

**ChatterComment**: `commentId`, `userId`, `content`, `createdDate`, `likeCount`, `likes` (userId[])

**FileItem**: `fileId`, `name`, `type`, `size`, `url`, `ownerId`, `uploadDate`

**Dashboard**: `dashboardId`, `name`, `description?`, `createdDate`, `createdBy` (userId), `chartType` (bar/line/pie/table)

**RecentItem**: `type`, `id`, `name`, `path`, `timestamp`

## Minimal Inject Example

```json
{
  "type": "chrome_open_url",
  "parameters": {
    "url": "http://172.17.46.46:8044/?sid=task001",
    "inject_state": true,
    "state_content": {
      "action": "set",
      "state": {
        "user": {
          "userId": "user-1",
          "firstName": "John",
          "lastName": "Smith",
          "email": "john.smith@company.com",
          "phone": "(555) 123-4567",
          "title": "Sales Manager",
          "department": "Sales",
          "role": "Manager",
          "avatar": "https://i.pravatar.cc/150?u=user-1",
          "timezone": "America/New_York",
          "locale": "en-US",
          "theme": "lightning"
        },
        "leads": [
          {
            "leadId": "lead-1",
            "firstName": "Sarah",
            "lastName": "Johnson",
            "company": "TechVentures Inc.",
            "title": "VP of Engineering",
            "email": "sarah.j@techventures.com",
            "phone": "(555) 111-2222",
            "mobile": "",
            "status": "New",
            "source": "Website",
            "rating": "Hot",
            "street": "", "city": "", "state": "", "zip": "", "country": "USA",
            "industry": "Technology",
            "employees": 250,
            "revenue": 15000000,
            "website": "",
            "description": "",
            "ownerId": "user-1",
            "createdDate": "2026-03-01T00:00:00.000Z",
            "modifiedDate": "2026-03-01T00:00:00.000Z"
          }
        ],
        "accounts": [],
        "contacts": [],
        "opportunities": [],
        "cases": [],
        "activities": [],
        "chatterPosts": [],
        "files": [],
        "users": [],
        "dashboards": [],
        "following": [],
        "recentlyViewed": [],
        "dismissedNotifications": []
      }
    }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|-------------------|
| Create new lead | `leads` array: `added` count increases by 1 |
| Edit lead field inline (name, title, status, address, etc.) | `leads` array: `modified` count increases, target lead's field updated, `modifiedDate` updated |
| Edit lead status (e.g., New → Working) | `leads` array: `modified` count increases, target lead's `status` updated |
| Convert lead to account/contact | `leads` modified (status=Qualified), `accounts`/`contacts` arrays gain new record |
| Create new opportunity | `opportunities` array: `added` count increases |
| Update opportunity stage | `opportunities` array: `modified`, target `stage` and `probability` updated |
| Drag opportunity to different Kanban column | `opportunities` modified: target `stage` updated to drop-target stage, `probability` updated, `modifiedDate` updated |
| Close opportunity (Won/Lost) | `opportunities` modified: `stage` = "Closed Won" or "Closed Lost" |
| Create new case | `cases` array: `added` count increases; `caseNumber` auto-incremented (CASE-00006, etc.) |
| Update case status | `cases` modified: target `status` updated |
| Close case | `cases` modified: `status` = "Closed", `closedDate` set |
| Create account | `accounts` array: `added` count increases |
| Edit account field inline | `accounts` modified: target field updated, `modifiedDate` updated |
| Create contact | `contacts` array: `added` count increases |
| Edit contact field inline (including address fields) | `contacts` modified: target field updated, `modifiedDate` updated |
| Create task/event (via Calendar or ActivityTimeline) | `activities` array: `added` count increases |
| Complete task | `activities` modified: target `status` = "Completed" |
| Post to Chatter | `chatterPosts` array: `added` count increases |
| Like a post (from Home or Chatter) | `chatterPosts` modified: target post `likeCount` incremented, `likes` array gains current userId |
| Unlike a post | `chatterPosts` modified: target post `likeCount` decremented, `likes` array removes current userId |
| Comment on post | `chatterPosts` modified: `commentCount` incremented, `comments` array updated |
| Follow a user | `following` array: target userId added |
| View a record | `recentlyViewed` array: new `RecentItem` prepended |
| Dismiss notification | `dismissedNotifications` array: notification ID added |
| Create dashboard | `dashboards` array: new Dashboard record added with `dashboardId`, `name`, `chartType`, `createdDate`, `createdBy` |
| Delete dashboard | `dashboards` array: target dashboard removed |
| Bulk change owner (Leads/Accounts/Contacts/Opportunities/Cases) | respective array modified: all selected records' `ownerId` updated |
| Bulk change status (Leads/Accounts/Opportunities/Cases) | respective array modified: all selected records' status field updated |
| Bulk delete records | respective array modified: all selected records removed |
| Edit user profile (/profile) | `user` object: `firstName`, `lastName`, `email`, `phone`, `title`, `department` updated |
| Edit user settings (/settings) | `user` object: `timezone`, `locale` (language), and/or `theme` fields updated |
| Log out | All `xalesforce`-prefixed localStorage keys cleared; page redirects to `/` |

## Navigation Behavior

- **TopNav "New" menu** (`+` icon): Lists all entity types. Clicking an item navigates to the corresponding list page with `?create=1` param, which auto-opens the "Create New" modal.
  - New Lead → `/leads?create=1`
  - New Account → `/accounts?create=1`
  - New Contact → `/contacts?create=1`
  - New Opportunity → `/opportunities?create=1`
  - New Case → `/cases?create=1`
- **TopNav Search**: Real-time search across leads, accounts, contacts, opportunities, and cases. Results show name, type, and subtitle. Clicking a result navigates to the detail page.
- **TopNav User menu**: "My Profile" → `/profile`, "My Settings" → `/settings`, "Log Out" → clears localStorage and reloads.
- **TopNav App Launcher**: Grid of app links (Leads, Accounts, Contacts, Opportunities, Cases, Reports, Dashboards, Files, Chatter, Calendar).
- **Dropdowns close on outside click** (click-away overlay on App Launcher, New menu, and User menu).
- **Detail pages with invalid IDs**: Show a styled "Not Found" card with a "Back to [entity]" button; no blank or broken renders.
- **Bulk Action Bar**: Appears above tables when 1+ rows are selected. Shows count, "Change Owner" (dropdown of users), "Change Status" (dropdown — hidden when no status options), "Delete", and "Export CSV" actions. Deselect All button resets selection.
