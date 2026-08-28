# XerviceNow Mock — Data Model

This document defines all entity types, their fields, relationships, and realistic example values for the XerviceNow ITSM mock. The dev agent should implement `createInitialData()` in `src/utils/dataManager.js` following this structure.

---

## Reference Date

Use `2026-03-01T09:00:00.000Z` as the base reference date for all mock data. All dates should be deterministic relative to this reference.

---

## §Users — `sys_user`

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sys_id` | string | Unique ID | `"u1"` |
| `user_name` | string | Login username | `"admin"` |
| `first_name` | string | | `"System"` |
| `last_name` | string | | `"Administrator"` |
| `email` | string | | `"admin@example.com"` |
| `title` | string | Job title | `"System Administrator"` |
| `department` | string | Department name | `"IT"` |
| `phone` | string | | `"555-0100"` |
| `avatar` | string | Avatar URL or initials | `"SA"` |
| `role` | string | Primary role | `"admin"` / `"itil"` / `"user"` |
| `active` | boolean | | `true` |
| `vip` | boolean | VIP flag for priority | `false` |

### Seed Users (8)

| sys_id | user_name | Name | Role | Department |
|--------|-----------|------|------|------------|
| `u1` | `admin` | System Administrator | admin | IT |
| `u2` | `beth.anglin` | Beth Anglin | itil | IT Service Desk |
| `u3` | `david.loo` | David Loo | itil | IT Service Desk |
| `u4` | `fred.luddy` | Fred Luddy | itil | IT Network |
| `u5` | `luke.wilson` | Luke Wilson | itil | IT Database |
| `u6` | `bud.richman` | Bud Richman | user | Sales |
| `u7` | `don.goodliffe` | Don Goodliffe | user | Human Resources |
| `u8` | `abel.tuter` | Abel Tuter | user | Finance |

**Default logged-in user**: `u1` (System Administrator / admin)

---

## §User Groups — `sys_user_group`

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sys_id` | string | Unique ID | `"g1"` |
| `name` | string | Group name | `"Service Desk"` |
| `description` | string | | `"Front-line support"` |
| `manager` | string (ref→sys_user) | Group manager | `"u2"` |
| `members` | string[] (ref→sys_user) | Member user IDs | `["u2","u3"]` |
| `type` | string | | `"itil"` |
| `active` | boolean | | `true` |

### Seed Groups (5)

| sys_id | name | Manager | Members |
|--------|------|---------|---------|
| `g1` | Service Desk | u2 | u2, u3 |
| `g2` | Network | u4 | u4 |
| `g3` | Database | u5 | u5 |
| `g4` | Hardware | u4 | u4, u5 |
| `g5` | Software | u2 | u2, u3, u5 |

---

## §Incidents — `incident`

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sys_id` | string | Unique ID | `"inc1"` |
| `number` | string | Display number | `"INC0010001"` |
| `caller_id` | string (ref→sys_user) | Who reported it | `"u6"` |
| `category` | string | Category | `"Network"` |
| `subcategory` | string | | `"VPN"` |
| `contact_type` | string | How reported | `"Phone"` / `"Email"` / `"Self-service"` / `"Walk-in"` |
| `short_description` | string | Summary | `"Unable to connect to VPN"` |
| `description` | string | Full description | `"User reports VPN client shows error..."` |
| `state` | number | Current state | `1` (New) |
| `impact` | number | Impact level | `2` (Medium) |
| `urgency` | number | Urgency level | `2` (Medium) |
| `priority` | number | Calculated priority | `3` (Moderate) |
| `assignment_group` | string (ref→group) | Assigned group | `"g1"` |
| `assigned_to` | string (ref→sys_user) | Assigned agent | `"u2"` |
| `opened_at` | string (ISO date) | When opened | `"2026-02-28T14:30:00.000Z"` |
| `opened_by` | string (ref→sys_user) | Who created record | `"u2"` |
| `resolved_at` | string (ISO date) | When resolved | `null` |
| `resolved_by` | string (ref→sys_user) | Who resolved | `null` |
| `closed_at` | string (ISO date) | When closed | `null` |
| `closed_by` | string (ref→sys_user) | Who closed | `null` |
| `close_code` | string | Resolution code | `"Solved (Permanently)"` / `"Solved (Workaround)"` / `"Not Solved"` / `"Closed/Resolved by Caller"` |
| `close_notes` | string | Closure details | `""` |
| `updated_at` | string (ISO date) | Last updated | `"2026-02-28T15:00:00.000Z"` |
| `sla_due` | string (ISO date) | SLA target date | `"2026-03-01T14:30:00.000Z"` |
| `cmdb_ci` | string (ref→cmdb_ci) | Related CI | `"ci1"` |
| `knowledge` | boolean | Knowledge flag | `false` |
| `comments_and_work_notes` | array | Journal entries (see §Journal) | `[]` |

### State Values
| Value | Label |
|-------|-------|
| `1` | New |
| `2` | In Progress |
| `3` | On Hold |
| `6` | Resolved |
| `7` | Closed |
| `8` | Cancelled |

### Impact Values
| Value | Label |
|-------|-------|
| `1` | High |
| `2` | Medium |
| `3` | Low |

### Urgency Values
| Value | Label |
|-------|-------|
| `1` | High |
| `2` | Medium |
| `3` | Low |

### Priority Matrix (Impact × Urgency)
| | Urgency 1 (High) | Urgency 2 (Medium) | Urgency 3 (Low) |
|---|---|---|---|
| **Impact 1 (High)** | 1 - Critical | 2 - High | 3 - Moderate |
| **Impact 2 (Medium)** | 2 - High | 3 - Moderate | 4 - Low |
| **Impact 3 (Low)** | 3 - Moderate | 4 - Low | 5 - Planning |

### Priority Labels & Colors
| Value | Label | Color |
|-------|-------|-------|
| `1` | 1 - Critical | `#d32f2f` (red) |
| `2` | 2 - High | `#f57c00` (orange) |
| `3` | 3 - Moderate | `#fbc02d` (yellow) |
| `4` | 4 - Low | `#388e3c` (green) |
| `5` | 5 - Planning | `#90a4ae` (grey) |

### Category / Subcategory Options
| Category | Subcategories |
|----------|---------------|
| `Inquiry / Help` | `""` (none) |
| `Software` | `Email`, `Operating System`, `Application` |
| `Hardware` | `Computer`, `Disk`, `Keyboard`, `Monitor`, `Mouse`, `Printer` |
| `Network` | `VPN`, `Wireless`, `Connectivity`, `DNS` |
| `Database` | `Oracle`, `SQL Server`, `DB2` |

### Seed Incidents (15)

Create a realistic distribution:
- 3 incidents state=New (unassigned or freshly assigned)
- 4 incidents state=In Progress (actively worked)
- 1 incident state=On Hold (awaiting caller)
- 3 incidents state=Resolved
- 3 incidents state=Closed
- 1 incident state=Cancelled

Mix of priorities (1 Critical, 2 High, 5 Moderate, 4 Low, 3 Planning), diverse categories, different callers and assignees.

Example incidents:
| number | short_description | state | priority | assigned_to | caller |
|--------|-------------------|-------|----------|-------------|--------|
| INC0010001 | Unable to connect to VPN | 2 (In Progress) | 2 (High) | u4 | u6 |
| INC0010002 | Email not syncing on mobile | 1 (New) | 3 (Moderate) | null | u7 |
| INC0010003 | SAP application crashing | 2 (In Progress) | 1 (Critical) | u3 | u8 |
| INC0010004 | Printer not responding on 3rd floor | 3 (On Hold) | 4 (Low) | u2 | u6 |
| INC0010005 | Password reset request | 6 (Resolved) | 4 (Low) | u2 | u7 |
| INC0010006 | Cannot access shared drive | 2 (In Progress) | 3 (Moderate) | u3 | u8 |
| INC0010007 | Monitor flickering intermittently | 1 (New) | 4 (Low) | null | u6 |
| INC0010008 | Slow internet connection in Building A | 2 (In Progress) | 2 (High) | u4 | u7 |
| INC0010009 | Software license expired - Adobe CC | 6 (Resolved) | 3 (Moderate) | u2 | u8 |
| INC0010010 | Laptop keyboard not working | 7 (Closed) | 3 (Moderate) | u3 | u6 |
| INC0010011 | VoIP phone no dial tone | 1 (New) | 3 (Moderate) | null | u7 |
| INC0010012 | Database backup failure alert | 7 (Closed) | 2 (High) | u5 | u2 |
| INC0010013 | Request for additional monitor | 8 (Cancelled) | 5 (Planning) | null | u6 |
| INC0010014 | Wireless drops in conference room B | 6 (Resolved) | 3 (Moderate) | u4 | u8 |
| INC0010015 | New employee onboarding - IT setup | 7 (Closed) | 4 (Low) | u2 | u7 |

---

## §Problems — `problem`

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sys_id` | string | Unique ID | `"prb1"` |
| `number` | string | Display number | `"PRB0040001"` |
| `short_description` | string | Summary | `"Recurring VPN disconnections"` |
| `description` | string | Full description | `""` |
| `state` | number | Current state | `1` |
| `priority` | number | Priority | `2` |
| `impact` | number | | `2` |
| `urgency` | number | | `2` |
| `assignment_group` | string (ref→group) | | `"g2"` |
| `assigned_to` | string (ref→sys_user) | | `"u4"` |
| `opened_at` | string (ISO date) | | `"2026-02-20T10:00:00.000Z"` |
| `opened_by` | string (ref→sys_user) | | `"u2"` |
| `resolved_at` | string (ISO date) | | `null` |
| `closed_at` | string (ISO date) | | `null` |
| `cause_notes` | string | Root cause | `""` |
| `fix_notes` | string | Fix applied | `""` |
| `known_error` | boolean | Is Known Error | `false` |
| `related_incidents` | string[] | Related incident IDs | `["inc1","inc8"]` |
| `updated_at` | string (ISO date) | | |
| `cmdb_ci` | string (ref→cmdb_ci) | | `null` |

### Problem States
| Value | Label |
|-------|-------|
| `1` | New |
| `2` | Assess |
| `3` | Root Cause Analysis |
| `4` | Fix in Progress |
| `5` | Resolved |
| `6` | Closed |

### Seed Problems (4)
| number | short_description | state | priority | assigned_to |
|--------|-------------------|-------|----------|-------------|
| PRB0040001 | Recurring VPN disconnections | 3 (RCA) | 2 (High) | u4 |
| PRB0040002 | Email sync failures on mobile devices | 2 (Assess) | 3 (Moderate) | u3 |
| PRB0040003 | Database backup job intermittent failures | 5 (Resolved) | 2 (High) | u5 |
| PRB0040004 | Wireless coverage gaps in Building A | 1 (New) | 3 (Moderate) | null |

---

## §Change Requests — `change_request`

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sys_id` | string | Unique ID | `"chg1"` |
| `number` | string | Display number | `"CHG0030001"` |
| `type` | string | Change type | `"Normal"` / `"Standard"` / `"Emergency"` |
| `short_description` | string | Summary | `"Upgrade VPN concentrator firmware"` |
| `description` | string | Full description | `""` |
| `state` | number | Current state | `-5` |
| `priority` | number | Priority | `3` |
| `impact` | number | | `2` |
| `risk` | string | Risk level | `"Moderate"` |
| `category` | string | | `"Network"` |
| `assignment_group` | string (ref→group) | | `"g2"` |
| `assigned_to` | string (ref→sys_user) | | `"u4"` |
| `requested_by` | string (ref→sys_user) | | `"u4"` |
| `opened_at` | string (ISO date) | | |
| `opened_by` | string (ref→sys_user) | | |
| `start_date` | string (ISO date) | Planned start | |
| `end_date` | string (ISO date) | Planned end | |
| `close_code` | string | | `"Successful"` / `"Unsuccessful"` / `"Cancelled"` |
| `close_notes` | string | | `""` |
| `updated_at` | string (ISO date) | | |
| `cmdb_ci` | string (ref→cmdb_ci) | | |
| `approval` | string | Approval status | `"Not Yet Requested"` / `"Requested"` / `"Approved"` / `"Rejected"` |
| `conflict_status` | string | Schedule conflict | `"Not Run"` / `"No Conflicts"` / `"Conflict"` |

### Change States
| Value | Label |
|-------|-------|
| `-5` | New |
| `-4` | Assess |
| `-3` | Authorize |
| `-2` | Scheduled |
| `-1` | Implement |
| `0` | Review |
| `3` | Closed |
| `4` | Cancelled |

### Seed Change Requests (5)
| number | short_description | type | state | priority |
|--------|-------------------|------|-------|----------|
| CHG0030001 | Upgrade VPN concentrator firmware | Normal | -2 (Scheduled) | 3 (Moderate) |
| CHG0030002 | Deploy new email server | Normal | -4 (Assess) | 2 (High) |
| CHG0030003 | Patch Windows servers - March cycle | Standard | -2 (Scheduled) | 4 (Low) |
| CHG0030004 | Emergency DB failover configuration | Emergency | -1 (Implement) | 1 (Critical) |
| CHG0030005 | Replace Building A wireless access points | Normal | 3 (Closed) | 3 (Moderate) |

---

## §Service Catalog — `sc_catalog`, `sc_category`, `sc_cat_item`

### Catalog
| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | Unique ID |
| `title` | string | Catalog name |
| `description` | string | |
| `active` | boolean | |

### Category
| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | Unique ID |
| `title` | string | Category name |
| `description` | string | |
| `icon` | string | Icon name or emoji |
| `parent` | string (ref→sc_category) | Parent category (for nesting) |
| `catalog` | string (ref→sc_catalog) | Parent catalog |
| `active` | boolean | |
| `order` | number | Sort order |

### Catalog Item
| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | Unique ID |
| `name` | string | Item name |
| `short_description` | string | Brief description |
| `description` | string | Full description (can be HTML) |
| `category` | string (ref→sc_category) | |
| `price` | string | Display price |
| `picture` | string | Icon/image |
| `delivery_time` | string | Expected delivery |
| `active` | boolean | |
| `order` | number | Sort order |
| `popular` | boolean | Shows in "Top Requests" |

### Seed Catalog Data

**1 Catalog**: "Service Catalog" (`cat1`)

**6 Categories**:
| sys_id | title | icon | description |
|--------|-------|------|-------------|
| `scc1` | Hardware | 🖥️ | Hardware requests and accessories |
| `scc2` | Software | 💿 | Software licenses and installations |
| `scc3` | Services | 🔧 | IT service requests |
| `scc4` | Office | 🏢 | Office supplies and services |
| `scc5` | Can We Help You? | ❓ | General IT support gateway |
| `scc6` | Peripherals | 🖱️ | Monitors, keyboards, mice, cables |

**12 Catalog Items** (distributed across categories):
| sys_id | name | category | price | delivery_time | popular |
|--------|------|----------|-------|---------------|---------|
| `sci1` | Standard Laptop | Hardware | `$1,200` | 5 business days | true |
| `sci2` | Apple iPad | Hardware | `$599` | 3 business days | true |
| `sci3` | Desktop Computer | Hardware | `$900` | 5 business days | false |
| `sci4` | Microsoft Office 365 | Software | `$15/mo` | 1 business day | true |
| `sci5` | Adobe Creative Cloud | Software | `$55/mo` | 1 business day | false |
| `sci6` | VPN Access | Services | `Free` | 1 business day | true |
| `sci7` | New Email Account | Services | `Free` | 1 business day | false |
| `sci8` | Network Access | Services | `Free` | 2 business days | true |
| `sci9` | Desk Phone | Office | `$0` | 3 business days | false |
| `sci10` | Standing Desk | Office | `$450` | 10 business days | false |
| `sci11` | External Monitor | Peripherals | `$350` | 3 business days | true |
| `sci12` | Wireless Mouse & Keyboard | Peripherals | `$75` | 2 business days | false |

---

## §Requests & Requested Items — `sc_request`, `sc_req_item`

### Request
| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | |
| `number` | string | `"REQ0010001"` |
| `requested_for` | string (ref→sys_user) | |
| `opened_at` | string (ISO date) | |
| `opened_by` | string (ref→sys_user) | |
| `state` | string | `"Open"` / `"Closed Complete"` / `"Closed Incomplete"` |
| `stage` | string | `"Requested"` / `"Delivery"` / `"Completed"` |
| `items` | string[] (ref→sc_req_item) | |
| `updated_at` | string (ISO date) | |

### Requested Item
| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | |
| `number` | string | `"RITM0010001"` |
| `request` | string (ref→sc_request) | Parent request |
| `cat_item` | string (ref→sc_cat_item) | What was ordered |
| `state` | string | `"Open"` / `"Work in Progress"` / `"Closed Complete"` / `"Closed Incomplete"` |
| `assigned_to` | string (ref→sys_user) | |
| `assignment_group` | string (ref→group) | |
| `quantity` | number | |
| `opened_at` | string (ISO date) | |
| `updated_at` | string (ISO date) | |
| `short_description` | string | Auto: item name |

### Seed Requests (3)
| number | requested_for | state | items |
|--------|---------------|-------|-------|
| REQ0010001 | u6 (Bud) | Open | Standard Laptop (RITM0010001) |
| REQ0010002 | u7 (Don) | Open | VPN Access (RITM0010002), External Monitor (RITM0010003) |
| REQ0010003 | u8 (Abel) | Closed Complete | Microsoft Office 365 (RITM0010004) |

---

## §Knowledge Base — `kb_category`, `kb_knowledge`

### KB Category
| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | |
| `label` | string | Category name |
| `parent_id` | string (ref→kb_category) | Parent (for tree) |
| `description` | string | |
| `active` | boolean | |
| `article_count` | number | Number of articles |

### Knowledge Article
| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | |
| `number` | string | `"KB0010001"` |
| `short_description` | string | Article title |
| `text` | string | Article body (HTML/markdown) |
| `category` | string (ref→kb_category) | |
| `author` | string (ref→sys_user) | |
| `published` | string (ISO date) | |
| `workflow_state` | string | `"Published"` / `"Draft"` / `"Retired"` |
| `rating` | number | Average rating (0-5) |
| `view_count` | number | |
| `helpful_count` | number | |
| `updated_at` | string (ISO date) | |

### Seed KB Categories (6 top-level, 4 children)
| sys_id | label | parent | article_count |
|--------|-------|--------|---------------|
| `kbc1` | Applications | null | 2 |
| `kbc2` | Email | null | 3 |
| `kbc3` | Hardware | null | 2 |
| `kbc4` | Network | null | 3 |
| `kbc5` | Operating Systems | null | 2 |
| `kbc6` | Policies | null | 1 |
| `kbc7` | Outlook | kbc2 | 2 |
| `kbc8` | Gmail | kbc2 | 1 |
| `kbc9` | Windows | kbc5 | 1 |
| `kbc10` | Mac OS X | kbc5 | 1 |

### Seed Knowledge Articles (10)
| number | short_description | category | workflow_state |
|--------|-------------------|----------|---------------|
| KB0010001 | How to connect to VPN | Network | Published |
| KB0010002 | Resetting your password | Applications | Published |
| KB0010003 | Setting up email on mobile | Email | Published |
| KB0010004 | Outlook configuration guide | Outlook | Published |
| KB0010005 | Troubleshooting printer issues | Hardware | Published |
| KB0010006 | Connecting to wireless network | Network | Published |
| KB0010007 | Installing software via Software Center | Applications | Published |
| KB0010008 | Creating email distribution list | Gmail | Published |
| KB0010009 | VPN troubleshooting FAQ | Network | Published |
| KB0010010 | IT acceptable use policy | Policies | Published |

---

## §CMDB Configuration Items — `cmdb_ci`

| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | |
| `name` | string | CI name |
| `sys_class_name` | string | CI class |
| `status` | string | `"Installed"` / `"Retired"` / `"On Order"` / `"In Maintenance"` |
| `environment` | string | `"Production"` / `"Development"` / `"Test"` |
| `category` | string | `"Hardware"` / `"Software"` / `"Network"` |
| `assigned_to` | string (ref→sys_user) | |
| `department` | string | |
| `location` | string | |
| `ip_address` | string | |
| `serial_number` | string | |
| `manufacturer` | string | |
| `model` | string | |

### CI Classes
- `cmdb_ci_server` — Server
- `cmdb_ci_app_server` — Application Server
- `cmdb_ci_netgear` — Network Gear
- `cmdb_ci_database` — Database

### Seed CIs (8)
| sys_id | name | class | status | environment |
|--------|------|-------|--------|-------------|
| `ci1` | VPN-GW-01 | Network Gear | Installed | Production |
| `ci2` | MAIL-SVR-01 | Server | Installed | Production |
| `ci3` | DB-PROD-01 | Database | Installed | Production |
| `ci4` | WEB-SVR-01 | Application Server | Installed | Production |
| `ci5` | AP-BLDGA-01 | Network Gear | In Maintenance | Production |
| `ci6` | DB-DEV-01 | Database | Installed | Development |
| `ci7` | FILE-SVR-01 | Server | Installed | Production |
| `ci8` | BACKUP-SVR-01 | Server | Installed | Production |

---

## §Journal / Activity — `sys_journal_field`

| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | |
| `element_id` | string | Parent record sys_id (incident, change, etc.) |
| `element` | string | `"comments"` (customer visible) or `"work_notes"` (internal) |
| `value` | string | The comment/note text |
| `sys_created_by` | string (ref→sys_user) | Who wrote it |
| `sys_created_on` | string (ISO date) | When written |
| `name` | string | Table name (e.g., `"incident"`) |

### Seed Journal Entries (12)
Create 2-3 journal entries per active incident, mix of comments and work_notes. Example:

| element_id | element | value | created_by |
|------------|---------|-------|------------|
| inc1 | work_notes | "Contacted user, attempting remote VPN diagnostic." | u4 |
| inc1 | comments | "Hi, I've submitted a VPN issue. Urgently need access." | u6 |
| inc3 | work_notes | "SAP team notified. Escalating to vendor support." | u3 |
| inc3 | work_notes | "Vendor confirmed bug in latest patch. Rollback planned." | u3 |
| inc4 | comments | "Awaiting replacement toner cartridge from vendor." | u2 |
| inc6 | work_notes | "Checking file server permissions for the shared drive." | u3 |

---

## §Notifications — `notification`

| Field | Type | Description |
|-------|------|-------------|
| `sys_id` | string | |
| `type` | string | `"assignment"` / `"state_change"` / `"comment"` / `"approval"` / `"sla_warning"` |
| `target_table` | string | `"incident"` / `"change_request"` / `"sc_req_item"` |
| `target_id` | string | Record sys_id |
| `target_number` | string | Record number for display |
| `message` | string | Notification text |
| `created_at` | string (ISO date) | |
| `read` | boolean | |
| `actor` | string (ref→sys_user) | Who triggered it |

### Seed Notifications (8)
| message | type | target_number | read |
|---------|------|---------------|------|
| INC0010003 assigned to you | assignment | INC0010003 | false |
| INC0010001 updated with new work notes | comment | INC0010001 | false |
| CHG0030004 requires approval | approval | CHG0030004 | false |
| INC0010005 has been resolved | state_change | INC0010005 | true |
| SLA warning: INC0010003 due in 2 hours | sla_warning | INC0010003 | true |
| INC0010009 has been resolved | state_change | INC0010009 | true |
| REQ0010001 is being processed | state_change | REQ0010001 | true |
| CHG0030001 moved to Scheduled | state_change | CHG0030001 | true |

---

## `createInitialData()` Structure

```javascript
export function createInitialData() {
  return {
    currentUser: { /* u1 admin */ },
    users: [ /* 8 users */ ],
    groups: [ /* 5 groups */ ],
    incidents: [ /* 15 incidents */ ],
    problems: [ /* 4 problems */ ],
    changeRequests: [ /* 5 change requests */ ],
    catalog: { /* 1 catalog */ },
    catalogCategories: [ /* 6 categories */ ],
    catalogItems: [ /* 12 items */ ],
    requests: [ /* 3 requests */ ],
    requestedItems: [ /* 4 requested items */ ],
    kbCategories: [ /* 10 KB categories */ ],
    kbArticles: [ /* 10 articles */ ],
    cmdbItems: [ /* 8 CIs */ ],
    journal: [ /* 12 journal entries */ ],
    notifications: [ /* 8 notifications */ ],
    // Shopping cart for service catalog
    shoppingCart: [],
    // Navigator state
    navigatorFilter: "",
    navigatorExpandedSections: ["Incident"],
    activeModule: "incident_list",
    // View state
    currentListFilters: {},
    currentSortColumn: null,
    currentSortDirection: "asc",
  };
}
```
