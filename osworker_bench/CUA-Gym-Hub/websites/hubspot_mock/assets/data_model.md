# XubSpot CRM Mock — Data Model

## Entity Relationship Overview

```
Contact ──< many-to-one >── Company
Contact ──< many-to-many >── Deal      (via deal.contactIds[])
Contact ──< many-to-many >── Ticket    (via ticket.contactId)
Company ──< one-to-many >── Deal       (via deal.companyId)
Company ──< one-to-many >── Ticket     (via ticket.companyId)
Contact ──< one-to-many >── Task       (via task.contactId)
Contact ──< one-to-many >── Note       (via note.associatedWith)
Deal    ──< one-to-many >── Task       (via task.dealId)
Deal    ──< one-to-many >── Note       (via note.associatedWith)
```

---

## Entity Definitions

### Contact
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "c1", "c-uuid-..." |
| firstName | string | yes | First name | "Alice" |
| lastName | string | yes | Last name | "Freeman" |
| email | string | yes | Email address (unique) | "alice@techcorp.com" |
| phone | string | no | Phone number | "+1 (555) 010-1234" |
| jobTitle | string | no | Job title | "CTO", "Marketing Director" |
| companyId | string | no | FK to Company.id | "comp1" |
| lifecycleStage | enum | no | Sales lifecycle | "lead", "mql", "sql", "opportunity", "customer", "evangelist" |
| leadStatus | enum | no | Lead qualification | "new", "open", "in_progress", "open_deal", "unqualified", "attempted", "connected" |
| owner | string | no | Assigned owner name | "Admin User" |
| city | string | no | City | "San Francisco" |
| state | string | no | State/Region | "CA" |
| country | string | no | Country | "United States" |
| avatarUrl | string | no | Profile image URL | null (use initials) |
| lastActivityDate | string (ISO) | auto | Last activity timestamp | "2024-05-10T14:00:00Z" |
| createDate | string (ISO) | auto | Creation timestamp | "2024-01-15T10:30:00Z" |
| timeline | array<Activity> | auto | Activity log | [] |

### Company
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "comp1" |
| name | string | yes | Company name | "TechCorp" |
| domain | string | no | Website domain | "techcorp.com" |
| industry | enum | no | Industry classification | "Technology", "Marketing", "Manufacturing", "Finance", "Healthcare", "Education" |
| phone | string | no | Company phone | "+1 (555) 100-2000" |
| city | string | no | City | "San Francisco" |
| state | string | no | State | "CA" |
| country | string | no | Country | "United States" |
| numberOfEmployees | number | no | Employee count | 150 |
| annualRevenue | number | no | Revenue in dollars | 5000000 |
| lifecycleStage | enum | no | Same enum as Contact | "customer" |
| owner | string | no | Assigned owner | "Admin User" |
| description | string | no | About the company | "Enterprise SaaS platform..." |
| createDate | string (ISO) | auto | Creation timestamp | "2024-01-10T09:00:00Z" |

### Deal
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "d1" |
| name | string | yes | Deal name | "TechCorp Enterprise License" |
| stage | enum | yes | Pipeline stage | "appointment_scheduled", "qualified_to_buy", "presentation_scheduled", "decision_maker_bought_in", "contract_sent", "closed_won", "closed_lost" |
| pipeline | string | no | Pipeline name | "default" (only one pipeline) |
| amount | number | yes | Deal value in dollars | 50000 |
| closeDate | string (ISO) | yes | Expected/actual close | "2024-06-15" |
| dealType | enum | no | Business type | "new_business", "existing_business" |
| priority | enum | no | Priority level | "low", "medium", "high" |
| owner | string | no | Deal owner | "Admin User" |
| companyId | string | no | FK to Company.id | "comp1" |
| contactIds | array<string> | no | FKs to Contact.id | ["c1", "c2"] |
| probability | number | auto | Win probability % (set by stage) | 40 |
| description | string | no | Deal notes | "Annual enterprise license renewal" |
| closedLostReason | string | no | Why deal was lost | "Budget constraints" |
| createDate | string (ISO) | auto | Creation timestamp | "2024-03-01T10:00:00Z" |
| lastActivityDate | string (ISO) | auto | Last activity | "2024-05-10T14:00:00Z" |

### Deal Stages (Pipeline Configuration)
| Stage ID | Label | Probability | Color | Order |
|----------|-------|-------------|-------|-------|
| appointment_scheduled | Appointment Scheduled | 20% | #E5F4FF | 1 |
| qualified_to_buy | Qualified to Buy | 40% | #FFF0E6 | 2 |
| presentation_scheduled | Presentation Scheduled | 60% | #FFF8E6 | 3 |
| decision_maker_bought_in | Decision Maker Bought-In | 80% | #E8F5E9 | 4 |
| contract_sent | Contract Sent | 90% | #E6FFFA | 5 |
| closed_won | Closed Won | 100% | #E6FFEC | 6 (Won) |
| closed_lost | Closed Lost | 0% | #FFE6E6 | 7 (Lost) |

### Ticket
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "t1" |
| subject | string | yes | Ticket title/summary | "Login issues" |
| description | string | no | Full description | "User cannot log in after password reset..." |
| status | enum | yes | Ticket status | "new", "waiting_on_contact", "waiting_on_us", "in_progress", "closed" |
| pipeline | string | no | Ticket pipeline | "support" |
| priority | enum | yes | Priority level | "low", "medium", "high" |
| category | enum | no | Issue category | "general_inquiry", "bug_report", "feature_request", "billing", "technical_support" |
| source | enum | no | How ticket was created | "email", "phone", "chat", "form", "manual" |
| owner | string | no | Assigned agent | "Admin User" |
| contactId | string | no | FK to Contact.id | "c1" |
| companyId | string | no | FK to Company.id | "comp1" |
| createDate | string (ISO) | auto | Created timestamp | "2024-05-01T09:30:00Z" |
| closeDate | string (ISO) | no | Resolved timestamp | null or "2024-05-03T16:00:00Z" |
| lastActivityDate | string (ISO) | auto | Last activity | "2024-05-02T11:00:00Z" |

### Task
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "task1" |
| title | string | yes | Task title | "Follow up with Alice on proposal" |
| type | enum | yes | Task type | "to_do", "call", "email" |
| status | enum | yes | Completion status | "not_started", "in_progress", "completed" |
| priority | enum | no | Priority level | "low", "medium", "high" |
| dueDate | string (ISO) | no | Due date | "2024-05-15T09:00:00Z" |
| notes | string | no | Additional notes | "Discuss pricing options" |
| owner | string | no | Assigned to | "Admin User" |
| contactId | string | no | FK to Contact.id | "c1" |
| companyId | string | no | FK to Company.id | "comp1" |
| dealId | string | no | FK to Deal.id | "d1" |
| createDate | string (ISO) | auto | Created timestamp | "2024-05-10T08:00:00Z" |
| completedDate | string (ISO) | no | When completed | null or "2024-05-14T15:30:00Z" |

### Activity (Timeline Entry — embedded in contact/deal/ticket timelines)
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "act1" |
| type | enum | yes | Activity type | "note", "email", "call", "meeting", "task_completed", "deal_created", "stage_change" |
| title | string | yes | Activity summary | "Email sent: Follow-up on proposal" |
| body | string | no | Detail text | "Hi Alice, wanted to check in..." |
| timestamp | string (ISO) | auto | When it happened | "2024-05-10T14:30:00Z" |
| createdBy | string | no | Who performed it | "Admin User" |
| metadata | object | no | Type-specific data | `{ outcome: "connected", duration: "5:30" }` for calls |

### Note
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "note1" |
| body | string | yes | Note content | "Had a great meeting. They're interested in the enterprise plan." |
| associatedType | enum | yes | What entity this is on | "contact", "company", "deal", "ticket" |
| associatedId | string | yes | FK to the entity | "c1" |
| createdBy | string | auto | Who wrote it | "Admin User" |
| createDate | string (ISO) | auto | When written | "2024-05-10T15:00:00Z" |

### Email Template
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "tmp1" |
| name | string | yes | Template name | "Introductory Email" |
| subject | string | yes | Email subject line | "Introduction from {{company_name}}" |
| body | string | yes | Template body (with variables) | "Hi {{first_name}},\n\nI wanted to reach out..." |
| folder | string | no | Organization folder | "Sales" |
| createdBy | string | auto | Creator | "Admin User" |
| createDate | string (ISO) | auto | Created | "2024-02-01T10:00:00Z" |
| timesUsed | number | auto | Usage counter | 24 |

### Meeting
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "m1" |
| title | string | yes | Meeting title | "Demo with Alice" |
| date | string (ISO) | yes | Start date/time | "2024-05-10T14:00:00Z" |
| duration | number | no | Duration in minutes | 30 |
| contactId | string | no | FK to Contact.id | "c1" |
| companyId | string | no | FK to Company.id | "comp1" |
| status | enum | no | Meeting status | "scheduled", "completed", "cancelled", "no_show" |
| notes | string | no | Meeting notes | "Discuss Q2 roadmap" |
| location | string | no | Meeting location | "Zoom", "Google Meet", "In-person" |
| owner | string | no | Organizer | "Admin User" |
| createDate | string (ISO) | auto | Created | "2024-05-08T09:00:00Z" |

### Form
| Field | Type | Required | Description | Example Values |
|-------|------|----------|-------------|----------------|
| id | string (uuid) | auto | Unique identifier | "f1" |
| name | string | yes | Form name | "Contact Us" |
| status | enum | no | Active/Inactive | "active", "inactive" |
| submissions | number | auto | Submission count | 12 |
| fields | array<string> | no | Field names | ["email", "first_name", "company", "message"] |
| createDate | string (ISO) | auto | Created | "2024-01-20T10:00:00Z" |
| lastSubmission | string (ISO) | no | Last submission date | "2024-05-09T16:30:00Z" |

---

## Suggested `createInitialData()` Structure

```javascript
export const createInitialData = () => ({
  // -- Core CRM Objects --
  contacts: [
    // 12 contacts across 6 companies, varying lifecycle stages
    { id: 'c1', firstName: 'Alice', lastName: 'Freeman', email: 'alice@techcorp.com', phone: '+1 (555) 010-1234', jobTitle: 'CTO', companyId: 'comp1', lifecycleStage: 'customer', leadStatus: 'open_deal', owner: 'Admin User', city: 'San Francisco', state: 'CA', country: 'United States', createDate: '2024-01-15T10:30:00Z', lastActivityDate: '2024-05-10T14:00:00Z', timeline: [...] },
    { id: 'c2', firstName: 'Bob', lastName: 'Martinez', email: 'bob@marketinggurus.com', phone: '+1 (555) 020-5678', jobTitle: 'Marketing Director', companyId: 'comp2', lifecycleStage: 'sql', leadStatus: 'in_progress', ... },
    { id: 'c3', firstName: 'Charlie', lastName: 'Davis', email: 'charlie@startups.io', phone: '+1 (555) 030-9012', jobTitle: 'Founder & CEO', companyId: 'comp3', lifecycleStage: 'opportunity', leadStatus: 'open_deal', ... },
    { id: 'c4', firstName: 'Diana', lastName: 'Prince', email: 'diana@enterprise.global', phone: '+1 (555) 040-3456', jobTitle: 'VP of Sales', companyId: 'comp4', lifecycleStage: 'customer', leadStatus: 'connected', ... },
    { id: 'c5', firstName: 'Emma', lastName: 'Wilson', email: 'emma@techcorp.com', phone: '+1 (555) 050-7890', jobTitle: 'Product Manager', companyId: 'comp1', lifecycleStage: 'customer', ... },
    { id: 'c6', firstName: 'Frank', lastName: 'Chen', email: 'frank@greenleaf.co', phone: '+1 (555) 060-1234', jobTitle: 'Head of Operations', companyId: 'comp5', lifecycleStage: 'mql', leadStatus: 'new', ... },
    { id: 'c7', firstName: 'Grace', lastName: 'Kim', email: 'grace@designstudio.com', phone: '+1 (555) 070-5678', jobTitle: 'Creative Director', companyId: 'comp6', lifecycleStage: 'lead', leadStatus: 'new', ... },
    { id: 'c8', firstName: 'Henry', lastName: 'Taylor', email: 'henry@enterprise.global', phone: '+1 (555) 080-9012', jobTitle: 'CIO', companyId: 'comp4', lifecycleStage: 'opportunity', leadStatus: 'open_deal', ... },
    { id: 'c9', firstName: 'Isabella', lastName: 'Garcia', email: 'isabella@startups.io', phone: '+1 (555) 090-3456', jobTitle: 'Head of Growth', companyId: 'comp3', lifecycleStage: 'sql', ... },
    { id: 'c10', firstName: 'James', lastName: 'Brown', email: 'james@greenleaf.co', phone: '+1 (555) 100-7890', jobTitle: 'Sales Manager', companyId: 'comp5', lifecycleStage: 'lead', ... },
    { id: 'c11', firstName: 'Katherine', lastName: 'Lee', email: 'katherine@marketinggurus.com', phone: '+1 (555) 110-1234', jobTitle: 'Content Strategist', companyId: 'comp2', lifecycleStage: 'mql', ... },
    { id: 'c12', firstName: 'Lucas', lastName: 'Wright', email: 'lucas@designstudio.com', phone: '+1 (555) 120-5678', jobTitle: 'UX Lead', companyId: 'comp6', lifecycleStage: 'lead', leadStatus: 'attempted', ... },
  ],

  companies: [
    // 6 companies across different industries
    { id: 'comp1', name: 'TechCorp', domain: 'techcorp.com', industry: 'Technology', phone: '+1 (555) 100-0001', city: 'San Francisco', state: 'CA', country: 'United States', numberOfEmployees: 250, annualRevenue: 15000000, lifecycleStage: 'customer', owner: 'Admin User', description: 'Enterprise SaaS platform for developer tools', createDate: '2024-01-10T09:00:00Z' },
    { id: 'comp2', name: 'Marketing Gurus', domain: 'marketinggurus.com', industry: 'Marketing', phone: '+1 (555) 200-0002', city: 'New York', state: 'NY', country: 'United States', numberOfEmployees: 50, annualRevenue: 3000000, ... },
    { id: 'comp3', name: 'Startups.io', domain: 'startups.io', industry: 'Venture Capital', phone: '+1 (555) 300-0003', city: 'Austin', state: 'TX', country: 'United States', numberOfEmployees: 30, annualRevenue: 8000000, ... },
    { id: 'comp4', name: 'Enterprise Global', domain: 'enterprise.global', industry: 'Manufacturing', phone: '+1 (555) 400-0004', city: 'Chicago', state: 'IL', country: 'United States', numberOfEmployees: 5000, annualRevenue: 500000000, ... },
    { id: 'comp5', name: 'GreenLeaf Solutions', domain: 'greenleaf.co', industry: 'Environmental Services', phone: '+1 (555) 500-0005', city: 'Portland', state: 'OR', country: 'United States', numberOfEmployees: 75, annualRevenue: 4500000, ... },
    { id: 'comp6', name: 'Design Studio Pro', domain: 'designstudio.com', industry: 'Design', phone: '+1 (555) 600-0006', city: 'Los Angeles', state: 'CA', country: 'United States', numberOfEmployees: 20, annualRevenue: 1200000, ... },
  ],

  deals: [
    // 10 deals spread across all pipeline stages, various amounts
    { id: 'd1', name: 'TechCorp Enterprise License', stage: 'contract_sent', amount: 50000, closeDate: '2024-06-15', dealType: 'new_business', priority: 'high', owner: 'Admin User', companyId: 'comp1', contactIds: ['c1', 'c5'], description: 'Annual enterprise license for 250 seats', createDate: '2024-03-01T10:00:00Z', lastActivityDate: '2024-05-10T14:00:00Z' },
    { id: 'd2', name: 'Marketing Automation Setup', stage: 'presentation_scheduled', amount: 12000, closeDate: '2024-05-20', dealType: 'new_business', priority: 'medium', owner: 'Admin User', companyId: 'comp2', contactIds: ['c2'], ... },
    { id: 'd3', name: 'Seed Funding Platform', stage: 'qualified_to_buy', amount: 150000, closeDate: '2024-07-01', dealType: 'new_business', priority: 'high', owner: 'Admin User', companyId: 'comp3', contactIds: ['c3', 'c9'], ... },
    { id: 'd4', name: 'Global Logistics Upgrade', stage: 'appointment_scheduled', amount: 75000, closeDate: '2024-08-10', dealType: 'existing_business', priority: 'medium', owner: 'Admin User', companyId: 'comp4', contactIds: ['c4', 'c8'], ... },
    { id: 'd5', name: 'GreenLeaf CRM Implementation', stage: 'decision_maker_bought_in', amount: 25000, closeDate: '2024-06-01', dealType: 'new_business', priority: 'medium', companyId: 'comp5', contactIds: ['c6'], ... },
    { id: 'd6', name: 'Design Studio Rebrand Package', stage: 'appointment_scheduled', amount: 8000, closeDate: '2024-07-15', dealType: 'new_business', priority: 'low', companyId: 'comp6', contactIds: ['c7'], ... },
    { id: 'd7', name: 'TechCorp Support Expansion', stage: 'closed_won', amount: 35000, closeDate: '2024-04-20', dealType: 'existing_business', priority: 'high', companyId: 'comp1', contactIds: ['c1'], ... },
    { id: 'd8', name: 'Marketing Gurus Content Package', stage: 'closed_won', amount: 18000, closeDate: '2024-03-15', dealType: 'new_business', companyId: 'comp2', contactIds: ['c2', 'c11'], ... },
    { id: 'd9', name: 'Enterprise Security Audit', stage: 'closed_lost', amount: 90000, closeDate: '2024-04-30', dealType: 'new_business', companyId: 'comp4', contactIds: ['c4'], closedLostReason: 'Budget constraints', ... },
    { id: 'd10', name: 'Startups.io Analytics Dashboard', stage: 'presentation_scheduled', amount: 42000, closeDate: '2024-06-30', dealType: 'new_business', companyId: 'comp3', contactIds: ['c3'], ... },
  ],

  tickets: [
    // 8 tickets across different statuses and priorities
    { id: 't1', subject: 'Cannot access admin dashboard', description: 'User reports 403 error when trying to access the admin panel', status: 'in_progress', priority: 'high', category: 'bug_report', source: 'email', owner: 'Admin User', contactId: 'c1', companyId: 'comp1', createDate: '2024-05-01T09:30:00Z', closeDate: null, lastActivityDate: '2024-05-10T11:00:00Z' },
    { id: 't2', subject: 'Billing discrepancy on invoice #4521', description: 'Client noticed double charge on their latest invoice', status: 'closed', priority: 'medium', category: 'billing', source: 'phone', owner: 'Admin User', contactId: 'c2', companyId: 'comp2', createDate: '2024-04-28T14:00:00Z', closeDate: '2024-04-30T16:00:00Z', lastActivityDate: '2024-04-30T16:00:00Z' },
    { id: 't3', subject: 'Feature request: Dark mode', description: 'Customer requesting dark mode for the web portal', status: 'new', priority: 'low', category: 'feature_request', source: 'form', owner: null, contactId: 'c7', companyId: 'comp6', createDate: '2024-05-08T10:00:00Z', closeDate: null, lastActivityDate: '2024-05-08T10:00:00Z' },
    { id: 't4', subject: 'API rate limiting issues', description: 'Getting 429 errors when making bulk API calls', status: 'waiting_on_us', priority: 'high', category: 'technical_support', source: 'email', owner: 'Admin User', contactId: 'c5', companyId: 'comp1', createDate: '2024-05-05T11:00:00Z', closeDate: null, ... },
    { id: 't5', subject: 'How to set up SSO?', description: 'Need help configuring SAML SSO for team', status: 'waiting_on_contact', priority: 'medium', category: 'general_inquiry', source: 'chat', owner: 'Admin User', contactId: 'c8', companyId: 'comp4', createDate: '2024-05-07T08:30:00Z', closeDate: null, ... },
    { id: 't6', subject: 'Data export not working', description: 'CSV export button returns empty file', status: 'in_progress', priority: 'medium', category: 'bug_report', source: 'email', owner: 'Admin User', contactId: 'c3', companyId: 'comp3', createDate: '2024-05-09T15:00:00Z', closeDate: null, ... },
    { id: 't7', subject: 'Upgrade plan inquiry', description: 'Interested in upgrading from Pro to Enterprise', status: 'new', priority: 'low', category: 'general_inquiry', source: 'form', owner: null, contactId: 'c6', companyId: 'comp5', createDate: '2024-05-10T09:00:00Z', closeDate: null, ... },
    { id: 't8', subject: 'Integration with Slack not syncing', description: 'Slack notifications stopped working after update', status: 'closed', priority: 'high', category: 'technical_support', source: 'phone', owner: 'Admin User', contactId: 'c4', companyId: 'comp4', createDate: '2024-04-25T10:00:00Z', closeDate: '2024-04-27T14:00:00Z', ... },
  ],

  tasks: [
    // 8 tasks across different types and statuses
    { id: 'task1', title: 'Follow up with Alice on enterprise proposal', type: 'call', status: 'not_started', priority: 'high', dueDate: '2024-05-15T09:00:00Z', notes: 'Discuss pricing and contract terms', owner: 'Admin User', contactId: 'c1', companyId: 'comp1', dealId: 'd1', createDate: '2024-05-10T08:00:00Z', completedDate: null },
    { id: 'task2', title: 'Send revised quote to Charlie', type: 'email', status: 'in_progress', priority: 'high', dueDate: '2024-05-12T17:00:00Z', notes: 'Include volume discount options', owner: 'Admin User', contactId: 'c3', dealId: 'd3', createDate: '2024-05-09T10:00:00Z', completedDate: null },
    { id: 'task3', title: 'Prepare demo presentation for GreenLeaf', type: 'to_do', status: 'not_started', priority: 'medium', dueDate: '2024-05-18T10:00:00Z', notes: 'Focus on environmental tracking features', owner: 'Admin User', contactId: 'c6', companyId: 'comp5', dealId: 'd5', createDate: '2024-05-08T14:00:00Z', completedDate: null },
    { id: 'task4', title: 'Review Bob\'s marketing automation requirements', type: 'to_do', status: 'completed', priority: 'medium', dueDate: '2024-05-08T12:00:00Z', notes: 'Check compatibility with existing tools', owner: 'Admin User', contactId: 'c2', dealId: 'd2', createDate: '2024-05-06T09:00:00Z', completedDate: '2024-05-08T11:30:00Z' },
    { id: 'task5', title: 'Schedule onboarding call with Diana', type: 'call', status: 'not_started', priority: 'medium', dueDate: '2024-05-20T14:00:00Z', notes: 'Introduce support team', owner: 'Admin User', contactId: 'c4', companyId: 'comp4', createDate: '2024-05-10T10:00:00Z', completedDate: null },
    { id: 'task6', title: 'Update CRM records for Design Studio', type: 'to_do', status: 'not_started', priority: 'low', dueDate: '2024-05-22T16:00:00Z', notes: 'Add new contact info from trade show', owner: 'Admin User', companyId: 'comp6', createDate: '2024-05-10T11:00:00Z', completedDate: null },
    { id: 'task7', title: 'Send thank-you email after meeting', type: 'email', status: 'completed', priority: 'low', dueDate: '2024-05-07T09:00:00Z', notes: null, owner: 'Admin User', contactId: 'c9', createDate: '2024-05-06T16:00:00Z', completedDate: '2024-05-07T08:45:00Z' },
    { id: 'task8', title: 'Call Henry about security audit proposal', type: 'call', status: 'not_started', priority: 'high', dueDate: '2024-05-14T11:00:00Z', notes: 'Discuss scope and timeline', owner: 'Admin User', contactId: 'c8', companyId: 'comp4', dealId: 'd9', createDate: '2024-05-10T12:00:00Z', completedDate: null },
  ],

  notes: [
    // 6 notes attached to various records
    { id: 'note1', body: 'Had a great meeting with Alice and Emma. They are very interested in the enterprise plan and want to move forward by Q3. Key concerns: SSO integration and data migration support.', associatedType: 'contact', associatedId: 'c1', createdBy: 'Admin User', createDate: '2024-05-10T15:00:00Z' },
    { id: 'note2', body: 'Bob mentioned they are comparing us with Competitor X. Need to highlight our marketing automation advantages in the next call.', associatedType: 'deal', associatedId: 'd2', createdBy: 'Admin User', createDate: '2024-05-08T11:00:00Z' },
    { id: 'note3', body: 'Charlie\'s team is growing fast. They need a platform that can scale from 30 to 200 users within a year.', associatedType: 'company', associatedId: 'comp3', createdBy: 'Admin User', createDate: '2024-05-06T14:00:00Z' },
    { id: 'note4', body: 'Resolved the billing issue. Refund processed and confirmation sent to Bob.', associatedType: 'ticket', associatedId: 't2', createdBy: 'Admin User', createDate: '2024-04-30T16:00:00Z' },
    { id: 'note5', body: 'Enterprise Global expressed interest in a 3-year contract. Need to prepare custom pricing.', associatedType: 'deal', associatedId: 'd4', createdBy: 'Admin User', createDate: '2024-05-09T10:00:00Z' },
    { id: 'note6', body: 'GreenLeaf team loved the demo. Decision maker Frank Chen is on board. Waiting for budget approval from the board.', associatedType: 'deal', associatedId: 'd5', createdBy: 'Admin User', createDate: '2024-05-07T16:30:00Z' },
  ],

  templates: [
    { id: 'tmp1', name: 'Introductory Email', subject: 'Introduction from {{company_name}}', body: 'Hi {{first_name}},\n\nI wanted to reach out and introduce myself. I\'m {{sender_name}} from {{company_name}}.\n\nI noticed that your company {{their_company}} might benefit from our solutions. Would you be open to a quick 15-minute call this week?\n\nBest regards,\n{{sender_name}}', folder: 'Sales', createdBy: 'Admin User', createDate: '2024-02-01T10:00:00Z', timesUsed: 47 },
    { id: 'tmp2', name: 'Follow-Up After Meeting', subject: 'Great meeting, {{first_name}}!', body: 'Hi {{first_name}},\n\nThank you for taking the time to meet with me today. I really enjoyed learning about {{their_company}} and your goals for this quarter.\n\nAs discussed, I\'m attaching the proposal for your review. Feel free to reach out with any questions.\n\nLooking forward to our next conversation!\n\nBest,\n{{sender_name}}', folder: 'Sales', createdBy: 'Admin User', createDate: '2024-02-15T10:00:00Z', timesUsed: 32 },
    { id: 'tmp3', name: 'Deal Closing Nudge', subject: 'Quick update on our proposal', body: 'Hi {{first_name}},\n\nJust wanted to check in on the proposal we sent over last week. We\'d love to get things moving and make sure you have everything you need to make a decision.\n\nIs there anything else I can help clarify?\n\nBest,\n{{sender_name}}', folder: 'Sales', createdBy: 'Admin User', createDate: '2024-03-01T10:00:00Z', timesUsed: 18 },
    { id: 'tmp4', name: 'Welcome New Customer', subject: 'Welcome to {{company_name}}! 🎉', body: 'Hi {{first_name}},\n\nWelcome aboard! We\'re thrilled to have {{their_company}} as a customer.\n\nYour dedicated account manager will be in touch shortly to schedule your onboarding session. In the meantime, here are some resources to get started...\n\nBest,\n{{sender_name}}', folder: 'Onboarding', createdBy: 'Admin User', createDate: '2024-03-10T10:00:00Z', timesUsed: 12 },
  ],

  meetings: [
    { id: 'm1', title: 'Demo with Alice & Emma', date: '2024-05-10T14:00:00Z', duration: 45, contactId: 'c1', companyId: 'comp1', status: 'completed', notes: 'Went great — showed enterprise features', location: 'Zoom', owner: 'Admin User', createDate: '2024-05-08T09:00:00Z' },
    { id: 'm2', title: 'Quarterly Review - Marketing Gurus', date: '2024-05-15T10:00:00Z', duration: 60, contactId: 'c2', companyId: 'comp2', status: 'scheduled', notes: 'Review Q1 results, plan Q2', location: 'Google Meet', owner: 'Admin User', createDate: '2024-05-05T11:00:00Z' },
    { id: 'm3', title: 'Pricing Discussion - Startups.io', date: '2024-05-18T15:00:00Z', duration: 30, contactId: 'c3', companyId: 'comp3', status: 'scheduled', notes: 'Discuss volume pricing', location: 'Zoom', owner: 'Admin User', createDate: '2024-05-10T09:00:00Z' },
    { id: 'm4', title: 'Onboarding Kickoff - Enterprise Global', date: '2024-05-20T09:00:00Z', duration: 90, contactId: 'c4', companyId: 'comp4', status: 'scheduled', notes: 'Full team onboarding session', location: 'In-person', owner: 'Admin User', createDate: '2024-05-10T10:00:00Z' },
  ],

  forms: [
    { id: 'f1', name: 'Contact Us', status: 'active', submissions: 156, fields: ['email', 'first_name', 'last_name', 'company', 'message'], createDate: '2024-01-20T10:00:00Z', lastSubmission: '2024-05-09T16:30:00Z' },
    { id: 'f2', name: 'Newsletter Signup', status: 'active', submissions: 1250, fields: ['email', 'first_name'], createDate: '2024-01-15T10:00:00Z', lastSubmission: '2024-05-10T08:15:00Z' },
    { id: 'f3', name: 'Request a Demo', status: 'active', submissions: 89, fields: ['email', 'first_name', 'last_name', 'company', 'phone', 'company_size'], createDate: '2024-02-01T10:00:00Z', lastSubmission: '2024-05-10T11:00:00Z' },
    { id: 'f4', name: 'Customer Feedback Survey', status: 'inactive', submissions: 43, fields: ['email', 'rating', 'feedback', 'recommend'], createDate: '2024-03-15T10:00:00Z', lastSubmission: '2024-04-20T14:00:00Z' },
  ],

  // -- App State --
  dealStages: {
    appointment_scheduled: { id: 'appointment_scheduled', label: 'Appointment Scheduled', probability: 20, color: '#E5F4FF', order: 1 },
    qualified_to_buy: { id: 'qualified_to_buy', label: 'Qualified to Buy', probability: 40, color: '#FFF0E6', order: 2 },
    presentation_scheduled: { id: 'presentation_scheduled', label: 'Presentation Scheduled', probability: 60, color: '#FFF8E6', order: 3 },
    decision_maker_bought_in: { id: 'decision_maker_bought_in', label: 'Decision Maker Bought-In', probability: 80, color: '#E8F5E9', order: 4 },
    contract_sent: { id: 'contract_sent', label: 'Contract Sent', probability: 90, color: '#E6FFFA', order: 5 },
    closed_won: { id: 'closed_won', label: 'Closed Won', probability: 100, color: '#E6FFEC', order: 6 },
    closed_lost: { id: 'closed_lost', label: 'Closed Lost', probability: 0, color: '#FFE6E6', order: 7 },
  },

  ticketStatuses: {
    new: { id: 'new', label: 'New', color: '#E5F4FF', order: 1 },
    waiting_on_contact: { id: 'waiting_on_contact', label: 'Waiting on Contact', color: '#FFF8E6', order: 2 },
    waiting_on_us: { id: 'waiting_on_us', label: 'Waiting on Us', color: '#FFF0E6', order: 3 },
    in_progress: { id: 'in_progress', label: 'In Progress', color: '#E6FFFA', order: 4 },
    closed: { id: 'closed', label: 'Closed', color: '#E6FFEC', order: 5 },
  },

  appState: {
    sidebarOpen: true,
    currentUser: { name: 'Admin User', email: 'admin@example.com', avatar: null },
  }
});
```

---

## Key Relationships for Agent Training

These are the relationships an agent would exercise when interacting with the CRM:

1. **Create a contact → Associate with a company** (set companyId)
2. **Create a deal → Associate with contacts + company** (set contactIds + companyId)
3. **Create a ticket → Associate with contact + company** (set contactId + companyId)
4. **Create a task → Associate with contact/deal/company** (set associations)
5. **Move deal stage** → drag-and-drop in Kanban or change stage dropdown
6. **Update ticket status** → select new status from dropdown
7. **Complete a task** → check it off, status changes to "completed"
8. **Add a note to a record** → creates a Note entity linked to the record
9. **Search for contacts/companies** → search bar filters results in real-time
10. **Filter table views** → apply lifecycle stage, status, date range, owner filters
