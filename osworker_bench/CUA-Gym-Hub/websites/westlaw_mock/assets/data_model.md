# Xestlaw Mock -- Data Model

This document defines all entity types, their fields, relationships, and example values for `dataManager.js`.

---

## 1. User (Current User)

The app is pre-logged-in as one user. This is stored as `currentUser`.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"user-1"` |
| name | string | `"Sarah Chen"` |
| email | string | `"sarah.chen@morrisonlaw.com"` |
| firm | string | `"Morrison & Associates LLP"` |
| role | string | `"Senior Associate"` |
| jurisdiction | string | `"All State & Federal"` |
| avatarInitials | string | `"SC"` |

---

## 2. Case (Case Law Document)

Central entity. ~50 cases in seed data covering various practice areas.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"case-1"` |
| title | string | `"Frisenda v. Incorporated Village of Malverne"` |
| citation | string | `"775 F.Supp.2d 486"` |
| wlNumber | string | `"2011 WL 1227774"` |
| court | string | `"United States District Court, E.D. New York."` |
| dateDecided | string | `"March 31, 2011"` |
| judges | string[] | `["Joseph F. Bianco, J."]` |
| attorneys | string[] | `["John Smith", "Jane Doe"]` |
| parties | object | `{ plaintiff: "Frisenda", defendant: "Incorporated Village of Malverne" }` |
| keyCiteFlag | string | `"yellow"` \| `"red"` \| `"orange"` \| `"green"` \| `"blue"` \| `null` |
| keyCiteText | string | `"Distinguished by 2 cases"` |
| topics | string[] | `["Constitutional Law", "First Amendment", "Employment"]` |
| keyNumbers | string[] | `["92 Constitutional Law", "92k1520 Freedom of Speech"]` |
| headnotes | Headnote[] | See Headnote entity |
| synopsis | string | `"LABOR AND EMPLOYMENT - Discrimination. Fact issues precluded summary judgment as to village police lieutenant's First Amendment retaliation claims."` |
| holdings | string[] | `["Lieutenant's speech contained in memorandum to police chief was not protected by First Amendment.", ...]` |
| opinionText | string | Full text (can be 2-5 paragraphs for mock) |
| reportedStatus | string | `"Reported"` \| `"Unreported"` |
| practiceArea | string | `"Employment Law"` |
| proceduralPosture | string | `"Motion for Summary Judgment"` |
| isFavorite | boolean | `false` |
| folders | string[] | `["folder-1"]` (folder IDs) |

---

## 3. Headnote

Sub-entity of Case. Each case has 1-7 headnotes.

| Field | Type | Example |
|-------|------|---------|
| number | number | `1` |
| keyNumber | string | `"92k1520"` |
| topic | string | `"Constitutional Law"` |
| subtopic | string | `"Freedom of Speech and of the Press"` |
| text | string | `"Lieutenant's membership and participation in union was protected activity under First Amendment."` |

---

## 4. Statute

~20 statutes in seed data.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"stat-1"` |
| title | string | `"42 U.S.C.A. Section 1983"` |
| shortTitle | string | `"Civil Action for Deprivation of Rights"` |
| code | string | `"United States Code Annotated"` |
| section | string | `"1983"` |
| chapter | string | `"Chapter 21 - Civil Rights"` |
| text | string | Full statute text (1-3 paragraphs) |
| effectiveDate | string | `"January 1, 1996"` |
| keyCiteFlag | string | `"green"` \| `"yellow"` \| `null` |
| annotations | string[] | `["Notes of Decisions (12,847)", ...]` |
| historicalNotes | string | `"As amended Pub.L. 104-317, Title III, Section 309(c), Oct. 19, 1996"` |
| topics | string[] | `["Civil Rights", "Section 1983"]` |
| isFavorite | boolean | `false` |
| folders | string[] | `[]` |

---

## 5. SecondarySource

~10 secondary sources (treatises, law review articles, encyclopedias).

| Field | Type | Example |
|-------|------|---------|
| id | string | `"sec-1"` |
| title | string | `"Employment Discrimination Law and Practice"` |
| type | string | `"Treatise"` \| `"Law Review"` \| `"Legal Encyclopedia"` \| `"Practice Guide"` |
| author | string | `"Robert Belton, Dianne Avery"` |
| publisher | string | `"West Academic Publishing"` |
| year | string | `"2024"` |
| citation | string | `"1 Emp. Discrim. Law Section 1.1"` |
| sections | Section[] | `[{ id: "sec-1-s1", number: "1.1", title: "Overview", text: "..." }]` |
| topics | string[] | `["Employment Law", "Discrimination"]` |
| keyCiteFlag | string | `null` |
| isFavorite | boolean | `false` |
| folders | string[] | `[]` |

---

## 6. Regulation

~5 regulations.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"reg-1"` |
| title | string | `"29 C.F.R. Section 1614.105"` |
| shortTitle | string | `"Pre-complaint Processing"` |
| agency | string | `"Equal Employment Opportunity Commission"` |
| text | string | Full regulation text |
| effectiveDate | string | `"November 9, 1999"` |
| keyCiteFlag | string | `null` |
| topics | string[] | `["Employment Law", "Administrative Law"]` |
| isFavorite | boolean | `false` |

---

## 7. Folder

Research organization entity.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"folder-1"` |
| name | string | `"Morrison v. City of Springfield - Case Research"` |
| createdDate | string | `"2026-03-15"` |
| updatedDate | string | `"2026-04-10"` |
| parentId | string \| null | `null` (top-level) or `"folder-1"` (subfolder) |
| items | FolderItem[] | `[{ docType: "case", docId: "case-1", addedDate: "2026-04-01", notes: "" }]` |

Seed 4-5 folders with various documents filed in them.

---

## 8. SearchHistoryEntry

Tracks user research activity.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"hist-1"` |
| type | string | `"search"` \| `"document"` |
| query | string | `"First Amendment employment discrimination"` (for search type) |
| docId | string \| null | `"case-1"` (for document type) |
| docTitle | string \| null | `"Frisenda v. Incorporated Village of Malverne"` |
| docType | string \| null | `"case"` \| `"statute"` \| `"secondary"` |
| timestamp | string | `"2026-04-11T14:30:00Z"` |
| jurisdiction | string | `"All State & Federal"` |
| resultCount | number | `1904` (for search type) |

Seed 15-20 history entries spanning the last 2 weeks.

---

## 9. Alert

Saved search alerts.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"alert-1"` |
| name | string | `"First Amendment employment cases"` |
| query | string | `"First Amendment employment retaliation"` |
| jurisdiction | string | `"All Federal"` |
| contentType | string | `"Cases"` |
| frequency | string | `"Daily"` \| `"Weekly"` |
| lastTriggered | string | `"2026-04-10T08:00:00Z"` |
| newResults | number | `3` |
| isActive | boolean | `true` |

Seed 3-4 alerts.

---

## 10. Notification

Items shown in the notification bell dropdown.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"notif-1"` |
| type | string | `"alert"` \| `"keycite"` \| `"system"` |
| title | string | `"3 new results for 'First Amendment employment'"` |
| message | string | `"Your alert found 3 new cases matching your search."` |
| timestamp | string | `"2026-04-11T08:00:00Z"` |
| isRead | boolean | `false` |
| linkedAlertId | string \| null | `"alert-1"` |

Seed 5-6 notifications (mix of read/unread).

---

## 11. KeyNumberTopic (Browse Hierarchy)

For the Key Number browse tree.

| Field | Type | Example |
|-------|------|---------|
| id | string | `"kn-92"` |
| number | string | `"92"` |
| title | string | `"Constitutional Law"` |
| parentId | string \| null | `null` |
| children | string[] | `["kn-92-I", "kn-92-II", ...]` |
| caseCount | number | `45230` |

Seed a 3-level-deep hierarchy for 5-6 top-level topics (Constitutional Law, Employment Law, Civil Rights, Contracts, Torts, Criminal Law) with 2-3 subtopics each.

---

## Relationships Summary

```
User (currentUser)
  |-- owns --> Folder[]
  |-- has --> SearchHistoryEntry[]
  |-- has --> Alert[]
  |-- has --> Notification[]

Case
  |-- contains --> Headnote[]
  |-- has --> keyCiteFlag
  |-- belongs to --> Folder[] (via folders[])
  |-- tagged with --> KeyNumberTopic[] (via keyNumbers[])

Statute
  |-- has --> keyCiteFlag
  |-- belongs to --> Folder[]

SecondarySource
  |-- contains --> Section[]
  |-- belongs to --> Folder[]

Folder
  |-- contains --> FolderItem[] (references to Case/Statute/SecondarySource)
  |-- may have parent --> Folder (via parentId)
```

---

## createInitialData() Structure

```javascript
function createInitialData() {
  return {
    currentUser: { /* User object */ },
    cases: [ /* ~50 Case objects */ ],
    statutes: [ /* ~20 Statute objects */ ],
    secondarySources: [ /* ~10 SecondarySource objects */ ],
    regulations: [ /* ~5 Regulation objects */ ],
    folders: [ /* ~5 Folder objects with items */ ],
    history: [ /* ~20 SearchHistoryEntry objects */ ],
    alerts: [ /* ~4 Alert objects */ ],
    notifications: [ /* ~6 Notification objects */ ],
    keyNumberTopics: [ /* ~30 KeyNumberTopic objects (hierarchical) */ ],
    // UI state
    currentSearch: {
      query: "",
      jurisdiction: "All State & Federal",
      activeContentType: "overview",
      filters: {},
      sort: "relevance",
      page: 1,
      resultsPerPage: 20
    },
    favorites: [] // doc IDs that are starred
  };
}
```

---

## Mock Data Coverage Requirements

The seed data should cover these scenarios for agent training:

1. **Employment discrimination cases** (10+ cases): Variety of courts, dates, KeyCite flags, headnotes
2. **Constitutional law / First Amendment** (8+ cases): For cross-topic searching
3. **Contract disputes** (8+ cases): Different procedural postures
4. **Personal injury / Torts** (8+ cases): Mixed reported/unreported status
5. **Criminal law** (8+ cases): State and federal courts
6. **Remaining misc** (8+ cases): Fill out variety

Each case should have realistic but abbreviated text (synopsis, 2-4 headnotes, 2-3 paragraph opinion excerpt). Full-length opinions are not needed.

Statutes should include: 42 USC 1983, Title VII (42 USC 2000e), ADA (42 USC 12101), 4th Amendment, FMLA, a few state statutes.
