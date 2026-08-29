# westlaw_mock Schema

**Base URL**: `http://localhost:<port>/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**Upload files**: `POST /upload?sid=<sid>` (multipart/form-data) → `{success, files: [{original_name, stored_name, size, content_type, url}]}`
**Serve files**: `GET /files/<sid>/<filename>` → file content with Content-Type

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | `{id, name, email, firm, initials}` — default `user-1` (Sarah Mitchell, Mitchell & Associates LLP) |
| `cases` | array | 15+ case documents; each: `{id, title, citation, court, date, judge, type, keyciteFlag, topics[], synopsis, headnotes[{number, topic, text}], holdings[], opinion[], citingReferences[]}` — `type`: `"case"` — `keyciteFlag`: `"green"` \| `"yellow"` \| `"red"` \| `"none"` |
| `statutes` | array | 8+ statutes; each: `{id, title, citation, type, jurisdiction, text, annotations[], lastAmended, effectiveDate}` — `type`: `"statute"` |
| `folders` | array | 3 research folders; each: `{id, name, createdAt, documentIds[]}` |
| `history` | array | Research history entries; each: `{id, type, query?, documentId?, title?, timestamp, resultCount?}` — `type`: `"search"` \| `"document"` \| `"keycite"` |
| `notes` | object | Keyed by documentId → text string (user annotations on documents) |
| `filters` | object | `{jurisdiction, dateFrom, dateTo, contentType, sortBy}` — active search filters |
| `searchQuery` | string | Current search query text |
| `searchResults` | array | Current search results (populated by SEARCH action) |
| `favorites` | array | Document IDs (strings) bookmarked by the user |

### Default IDs

**Cases**: `case-1` (Brown v. Board of Education), `case-2` (Miranda v. Arizona), `case-3` through `case-15`
**Statutes**: `statute-1` (42 U.S.C. Section 1983), `statute-2` (18 U.S.C. Section 1341 - Mail Fraud), `statute-3` (28 U.S.C. Section 1332 - Diversity), `statute-4` (14th Amendment), `statute-5` (Sherman Antitrust), `statute-6` through `statute-8`
**Folders**: `folder-1` (Constitutional Law Research), `folder-2` (Criminal Procedure Cases), `folder-3` (First Amendment Collection)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user-1",
      "name": "Sarah Mitchell",
      "email": "smitchell@lawfirm.com",
      "firm": "Mitchell & Associates LLP",
      "initials": "SM"
    },
    "cases": [
      {
        "id": "case-1",
        "title": "Brown v. Board of Education",
        "citation": "347 U.S. 483 (1954)",
        "court": "Supreme Court of the United States",
        "date": "1954-05-17",
        "judge": "Chief Justice Earl Warren",
        "type": "case",
        "keyciteFlag": "green",
        "topics": ["Constitutional Law", "Equal Protection"],
        "synopsis": "Landmark decision on school segregation.",
        "headnotes": [],
        "holdings": ["Separate educational facilities are inherently unequal."],
        "opinion": [],
        "citingReferences": []
      }
    ],
    "statutes": [],
    "folders": [],
    "history": [],
    "notes": {},
    "filters": {
      "jurisdiction": "All",
      "dateFrom": "",
      "dateTo": "",
      "contentType": "All",
      "sortBy": "relevance"
    },
    "searchQuery": "",
    "searchResults": [],
    "favorites": []
  }
}
```
