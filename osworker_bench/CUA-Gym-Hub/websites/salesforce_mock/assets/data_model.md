# Xalesforce CRM Mock — Data Model

> This document defines the data structures used in `src/data/initialData.ts` and `src/types/index.ts`.
> The dev agent should reference this for `createInitialData()` structure.

## Entity Types

### User
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| userId | string | "user-1" | Primary key |
| firstName | string | "John" | |
| lastName | string | "Smith" | |
| email | string | "john.smith@company.com" | |
| phone | string | "(555) 123-4567" | |
| title | string | "Sales Manager" | |
| department | string | "Sales" | |
| role | string | "Manager" | One of: Admin, Manager, Rep |
| avatar | string | "https://i.pravatar.cc/150?u=user-1" | Use pravatar.cc for consistent avatars |
| timezone | string | "America/New_York" | |
| locale | string | "en-US" | |
| theme | string | "lightning" | |

### Lead
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| leadId | string | "lead-1" | Primary key |
| firstName | string | "Sarah" | |
| lastName | string | "Johnson" | |
| company | string | "TechVentures Inc." | |
| title | string | "VP of Engineering" | |
| email | string | "sarah.j@techventures.com" | |
| phone | string | "(555) 234-5678" | |
| mobile | string | "(555) 234-5679" | |
| status | enum | "New" | One of: New, Working, Qualified, Unqualified |
| source | string | "Website" | One of: Website, Referral, Trade Show, Cold Call, LinkedIn, Partner, Email Campaign |
| rating | enum | "Hot" | One of: Hot, Warm, Cold |
| street | string | "123 Innovation Dr" | |
| city | string | "San Francisco" | |
| state | string | "CA" | |
| zip | string | "94105" | |
| country | string | "United States" | |
| industry | string | "Technology" | |
| employees | number | 250 | |
| revenue | number | 15000000 | Annual revenue in dollars |
| website | string | "https://techventures.com" | |
| description | string | "Interested in enterprise..." | |
| ownerId | string | "user-1" | FK → User.userId |
| createdDate | string (ISO) | "2025-01-15T10:30:00Z" | |
| modifiedDate | string (ISO) | "2025-01-20T14:00:00Z" | |

### Account
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| accountId | string | "account-1" | Primary key |
| name | string | "Acme Corporation" | |
| parentAccountId | string? | null | FK → Account.accountId (optional) |
| phone | string | "(555) 100-2000" | |
| website | string | "https://acme.com" | |
| type | string | "Customer" | One of: Prospect, Customer, Partner, Competitor, Other |
| industry | string | "Technology" | |
| revenue | number | 50000000 | Annual revenue |
| employees | number | 500 | |
| description | string | "Enterprise software company..." | |
| ownerId | string | "user-1" | FK → User.userId |
| billingStreet | string | "100 Main St" | |
| billingCity | string | "New York" | |
| billingState | string | "NY" | |
| billingZip | string | "10001" | |
| billingCountry | string | "United States" | |
| shippingStreet | string | "100 Main St" | Often same as billing |
| shippingCity | string | "New York" | |
| shippingState | string | "NY" | |
| shippingZip | string | "10001" | |
| shippingCountry | string | "United States" | |
| createdDate | string (ISO) | "2024-06-01T09:00:00Z" | |
| modifiedDate | string (ISO) | "2025-01-18T16:30:00Z" | |

### Contact
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| contactId | string | "contact-1" | Primary key |
| accountId | string | "account-1" | FK → Account.accountId |
| firstName | string | "Alice" | |
| lastName | string | "Williams" | |
| title | string | "CTO" | |
| department | string | "Engineering" | |
| email | string | "alice.w@acme.com" | |
| phone | string | "(555) 100-2001" | |
| mobile | string | "(555) 100-2002" | |
| reportsToId | string? | null | FK → Contact.contactId (optional) |
| mailingStreet | string | "100 Main St" | |
| mailingCity | string | "New York" | |
| mailingState | string | "NY" | |
| mailingZip | string | "10001" | |
| mailingCountry | string | "United States" | |
| ownerId | string | "user-1" | FK → User.userId |
| createdDate | string (ISO) | "2024-06-15T11:00:00Z" | |
| modifiedDate | string (ISO) | "2025-01-10T09:30:00Z" | |

### Opportunity
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| opportunityId | string | "opp-1" | Primary key |
| name | string | "Acme - Enterprise License" | Typically: "{AccountName} - {DealType}" |
| accountId | string | "account-1" | FK → Account.accountId |
| contactId | string? | "contact-1" | FK → Contact.contactId (primary contact, optional) |
| amount | number | 150000 | Deal value in dollars |
| closeDate | string (ISO) | "2025-03-31T00:00:00Z" | Expected close |
| stage | enum | "Proposal" | See stage values below |
| probability | number | 60 | 0-100, often auto-set by stage |
| type | string | "New Business" | One of: New Business, Existing Business, Renewal |
| leadSource | string | "Website" | How the lead was sourced |
| nextStep | string | "Schedule demo with CTO" | |
| description | string | "Enterprise license deal..." | |
| ownerId | string | "user-2" | FK → User.userId |
| createdDate | string (ISO) | "2024-11-01T08:00:00Z" | |
| modifiedDate | string (ISO) | "2025-01-22T15:00:00Z" | |

**Opportunity Stages** (in order):
1. Prospecting (probability: 10%)
2. Qualification (probability: 20%)
3. Needs Analysis (probability: 30%)
4. Value Proposition (probability: 50%)
5. Proposal (probability: 60%)
6. Negotiation (probability: 80%)
7. Closed Won (probability: 100%)
8. Closed Lost (probability: 0%)

### Case
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| caseId | string | "case-1" | Primary key |
| caseNumber | string | "00001001" | Auto-generated display number |
| subject | string | "Unable to access dashboard" | |
| status | enum | "New" | One of: New, Working, Escalated, Closed |
| priority | enum | "High" | One of: Low, Medium, High, Critical |
| origin | string | "Phone" | One of: Phone, Email, Web, Chat |
| type | string? | "Problem" | One of: Problem, Feature Request, Question |
| accountId | string | "account-1" | FK → Account.accountId |
| contactId | string | "contact-1" | FK → Contact.contactId |
| description | string | "Customer reports..." | |
| internalComments | string? | "Escalated to tier 2" | |
| ownerId | string | "user-3" | FK → User.userId |
| createdDate | string (ISO) | "2025-01-20T09:15:00Z" | |
| modifiedDate | string (ISO) | "2025-01-21T11:30:00Z" | |
| closedDate | string? (ISO) | null | Set when status = Closed |

### Activity
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| activityId | string | "activity-1" | Primary key |
| type | enum | "task" | One of: task, event |
| subject | string | "Follow up call with Alice" | |
| status | string | "Not Started" | Tasks: Not Started, In Progress, Completed. Events: Scheduled, Completed |
| priority | string | "Normal" | One of: Low, Normal, High |
| dueDate | string? (ISO) | "2025-02-01T00:00:00Z" | For tasks |
| startDateTime | string? (ISO) | "2025-02-01T10:00:00Z" | For events |
| endDateTime | string? (ISO) | "2025-02-01T11:00:00Z" | For events |
| relatedToType | string | "Opportunity" | One of: Lead, Account, Contact, Opportunity, Case |
| relatedToId | string | "opp-1" | FK → related record |
| assignedToId | string | "user-1" | FK → User.userId |
| description | string | "Discuss pricing..." | |
| createdDate | string (ISO) | "2025-01-25T08:00:00Z" | |

### ChatterPost
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| postId | string | "post-1" | Primary key |
| userId | string | "user-1" | FK → User.userId (author) |
| content | string | "Just closed the Acme deal!" | Supports @mentions (text only) |
| createdDate | string (ISO) | "2025-01-26T14:30:00Z" | |
| likeCount | number | 5 | Denormalized from likes array length |
| commentCount | number | 2 | Denormalized from comments array length |
| comments | ChatterComment[] | [...] | Inline array |
| likes | string[] | ["user-2", "user-3"] | Array of userId |

### ChatterComment
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| commentId | string | "comment-1" | Primary key |
| userId | string | "user-2" | FK → User.userId (author) |
| content | string | "Great work!" | |
| createdDate | string (ISO) | "2025-01-26T15:00:00Z" | |
| likeCount | number | 1 | |
| likes | string[] | ["user-1"] | |

### FileItem
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| fileId | string | "file-1" | Primary key |
| name | string | "Q4 Forecast.xlsx" | |
| type | string | "application/xlsx" | MIME type |
| size | number | 245000 | Bytes |
| url | string | "https://picsum.photos/200/200?random=1" | Placeholder URL |
| ownerId | string | "user-1" | FK → User.userId |
| uploadDate | string (ISO) | "2025-01-15T10:00:00Z" | |

## Relationships Diagram

```
User ──< Lead          (ownerId)
User ──< Account       (ownerId)
User ──< Contact       (ownerId)
User ──< Opportunity   (ownerId)
User ──< Case          (ownerId)
User ──< Activity      (assignedToId)
User ──< ChatterPost   (userId)
User ──< FileItem      (ownerId)

Account ──< Contact       (accountId)
Account ──< Opportunity   (accountId)
Account ──< Case          (accountId)
Account ──< Account       (parentAccountId, self-referential)

Contact ──< Case          (contactId)
Contact ──< Contact       (reportsToId, self-referential)

Activity → Lead|Account|Contact|Opportunity|Case  (relatedToType + relatedToId, polymorphic)

Lead → (converts to) → Account + Contact + Opportunity
```

## Suggested createInitialData() Structure

The initial data should include:
- **1 current user** (John Smith, Sales Manager)
- **5 users** (team members with diverse roles)
- **8 leads** (across all 4 statuses: 3 New, 2 Working, 2 Qualified, 1 Unqualified; diverse sources and ratings)
- **5 accounts** (mix of Customer, Prospect, Partner types; diverse industries)
- **6 contacts** (2-3 per account, with reporting relationships)
- **6 opportunities** (across all stages, diverse amounts: $25K to $500K, some closing soon)
- **5 cases** (mix of statuses and priorities, different origins)
- **8 activities** (mix of tasks and events, some overdue, some today, some future; linked to various records)
- **5 chatter posts** (with 2-3 having comments and likes)
- **5 files** (diverse types: .xlsx, .pdf, .docx, .pptx, .png)
- **following**: ["user-2", "user-3"] (users the current user follows)

### Important: Ensure cross-references
- Every Contact should reference a valid Account
- Every Opportunity should reference a valid Account
- Every Case should reference a valid Account and Contact
- Activities should reference valid related records
- All ownerId values should reference valid Users
