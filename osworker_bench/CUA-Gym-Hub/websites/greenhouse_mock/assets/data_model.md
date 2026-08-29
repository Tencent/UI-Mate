# Xreenhouse Mock — Data Model

## Entity Definitions

All entities are stored in a single state object managed by `dataManager.js`. The `createInitialData()` function returns the complete initial state.

---

### §Users
Xreenhouse team members (recruiters, hiring managers, interviewers, admins).

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique ID, e.g. `"user-1"` |
| firstName | string | First name |
| lastName | string | Last name |
| name | string | Full display name |
| email | string | Email address |
| role | string | One of: `"admin"`, `"recruiter"`, `"hiring_manager"`, `"interviewer"`, `"coordinator"` |
| avatarUrl | string | Avatar image URL (placeholder) |
| department | string | Department name |
| title | string | Job title, e.g. "Senior Recruiter" |

**Seed data:** 8 users
- Jules Park (recruiter, current user) — `"user-1"`
- Sarah Chen (recruiter) — `"user-2"`
- David Kim (hiring manager, Engineering) — `"user-3"`
- Emily Rodriguez (hiring manager, Design) — `"user-4"`
- Marcus Johnson (interviewer, Engineering) — `"user-5"`
- Priya Patel (interviewer, Engineering) — `"user-6"`
- James Wright (coordinator) — `"user-7"`
- Lisa Thompson (admin/HR Director) — `"user-8"`

---

### §Departments

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"dept-1"` |
| name | string | Department name |
| parentId | string\|null | Parent department ID for hierarchy |

**Seed data:** 6 departments
- Engineering (`"dept-1"`)
- Design (`"dept-2"`)
- Product (`"dept-3"`)
- Marketing (`"dept-4"`)
- Sales (`"dept-5"`)
- People Operations (`"dept-6"`)

---

### §Offices

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"office-1"` |
| name | string | Office name |
| location | string | City, State/Country |

**Seed data:** 3 offices
- San Francisco HQ (`"office-1"`, "San Francisco, CA")
- New York (`"office-2"`, "New York, NY")
- Remote (`"office-3"`, "Remote")

---

### §Jobs
Open positions/requisitions.

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"job-1"` |
| title | string | Job title |
| status | string | `"open"`, `"closed"`, `"draft"` |
| departmentId | string | Reference to department |
| officeId | string | Reference to office |
| hiringManagerId | string | Reference to user |
| recruiterId | string | Reference to user (primary recruiter) |
| coordinatorId | string\|null | Reference to user |
| openings | number | Number of openings |
| openDate | string | ISO date when opened |
| closeDate | string\|null | ISO date when closed |
| description | string | Job description (HTML or plain text) |
| requirements | string[] | List of requirements |
| stages | string[] | Ordered list of stage IDs for this job's pipeline |
| candidateCount | number | Total candidates (computed or cached) |
| createdAt | string | ISO timestamp |
| updatedAt | string | ISO timestamp |

**Seed data:** 6 jobs
1. "Senior Frontend Engineer" — Engineering, SF HQ, open, 2 openings
2. "Product Designer" — Design, New York, open, 1 opening
3. "Backend Engineer" — Engineering, Remote, open, 3 openings
4. "Product Manager" — Product, SF HQ, open, 1 opening
5. "Marketing Coordinator" — Marketing, New York, open, 1 opening
6. "DevOps Engineer" — Engineering, SF HQ, closed, 1 opening

---

### §JobStages
Pipeline stages within a job's hiring workflow. Each job has its own set of stages (though they follow a common template).

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"stage-1-1"` (job1-stage1) |
| jobId | string | Parent job reference |
| name | string | Stage name |
| orderIndex | number | Order in pipeline (0-based) |
| stageType | string | `"application_review"`, `"phone_screen"`, `"interview"`, `"take_home"`, `"onsite"`, `"offer"`, `"hired"` |

**Default stage template (for each open job):**
0. Application Review
1. Recruiter Phone Screen
2. Hiring Manager Screen
3. Technical Interview / Take Home Test
4. Onsite / Final Interview
5. Reference Check
6. Offer
7. Hired

---

### §Candidates
People who have applied to or been sourced for positions.

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"cand-1"` |
| firstName | string | First name |
| lastName | string | Last name |
| name | string | Full name |
| email | string | Email |
| phone | string | Phone number |
| location | string | City, State |
| currentCompany | string | Current employer |
| currentTitle | string | Current job title |
| resumeUrl | string\|null | Link to resume (mock) |
| linkedinUrl | string\|null | LinkedIn profile URL (mock) |
| source | string | How they were sourced: `"applied"`, `"referral"`, `"sourced"`, `"agency"`, `"internal"` |
| referrerId | string\|null | User ID of referrer |
| tags | string[] | Candidate tags |
| createdAt | string | ISO timestamp |
| updatedAt | string | ISO timestamp |

**Seed data:** 20 candidates with diverse names, companies, titles, and sources.

---

### §Applications
Links a candidate to a specific job with pipeline tracking.

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"app-1"` |
| candidateId | string | Reference to candidate |
| jobId | string | Reference to job |
| currentStageId | string | Current stage in pipeline |
| status | string | `"active"`, `"rejected"`, `"hired"` |
| appliedAt | string | ISO timestamp |
| rejectedAt | string\|null | ISO timestamp |
| rejectionReason | string\|null | Reason for rejection |
| hiredAt | string\|null | ISO timestamp |
| lastActivityAt | string | ISO timestamp |
| source | string | Application source (inherited from candidate or specific) |
| creditedTo | string\|null | User ID who sourced/referred |
| recruiterId | string | Assigned recruiter user ID |
| coordinatorId | string\|null | Assigned coordinator user ID |
| actionRequired | string\|null | `"needs_scheduling"`, `"needs_scorecard"`, `"needs_decision"`, `"awaiting_candidate"`, null |
| daysInCurrentStage | number | Days in current stage |

**Seed data:** 25 applications distributed across the 5 open jobs, at various pipeline stages, with a mix of active/rejected statuses. Distribution should ensure each stage has some candidates to make the pipeline view interesting.

---

### §Scorecards
Interview evaluation forms filled out by interviewers.

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"sc-1"` |
| applicationId | string | Reference to application |
| interviewerId | string | User who filled it out |
| stageId | string | Stage this scorecard is for |
| overallRecommendation | string | `"strong_yes"`, `"yes"`, `"no_opinion"`, `"no"`, `"strong_no"` |
| attributes | array | `[{ name: string, rating: number (1-4), note: string }]` |
| submittedAt | string\|null | ISO timestamp (null = pending) |
| createdAt | string | ISO timestamp |
| notes | string | Overall notes/comments |

**Attribute categories (per scorecard):**
- Technical Skills (rating 1-4)
- Communication (rating 1-4)
- Problem Solving (rating 1-4)
- Culture Fit (rating 1-4)
- Leadership (rating 1-4)

Rating scale: 1 = Strong No, 2 = No, 3 = Yes, 4 = Strong Yes

**Seed data:** 15 scorecards — some submitted, some pending (null submittedAt). Distributed across different applications and stages.

---

### §Interviews
Scheduled interview events.

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"int-1"` |
| applicationId | string | Reference to application |
| stageId | string | Pipeline stage |
| interviewerIds | string[] | User IDs of interviewers |
| scheduledAt | string | ISO datetime |
| duration | number | Duration in minutes (30, 45, 60) |
| location | string | Room name or "Video Call" |
| status | string | `"scheduled"`, `"completed"`, `"cancelled"` |
| meetingUrl | string\|null | Video call URL (mock) |
| notes | string | Interview prep notes |

**Seed data:** 10 interviews — mix of scheduled (future dates), completed, cancelled.

---

### §Offers

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"offer-1"` |
| applicationId | string | Reference to application |
| jobId | string | Reference to job |
| status | string | `"draft"`, `"pending_approval"`, `"approved"`, `"sent"`, `"accepted"`, `"rejected"` |
| salary | number | Base salary amount |
| currency | string | `"USD"` |
| startDate | string | Proposed start date |
| expiresAt | string | Offer expiration date |
| createdBy | string | User ID who created the offer |
| approvers | array | `[{ userId: string, status: "pending"|"approved"|"rejected", respondedAt: string|null }]` |
| createdAt | string | ISO timestamp |
| updatedAt | string | ISO timestamp |

**Seed data:** 3 offers — 1 pending approval, 1 sent/awaiting response, 1 accepted.

---

### §Notes
Notes on candidate profiles.

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"note-1"` |
| candidateId | string | Reference to candidate |
| authorId | string | User who wrote it |
| body | string | Note content |
| visibility | string | `"public"`, `"private"`, `"admin_only"` |
| isPinned | boolean | Whether pinned to top |
| createdAt | string | ISO timestamp |
| updatedAt | string | ISO timestamp |

**Seed data:** 12 notes across different candidates.

---

### §ActivityFeed
Activity log entries for candidate profiles.

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"act-1"` |
| candidateId | string | Reference to candidate |
| applicationId | string\|null | Reference to application |
| type | string | `"stage_change"`, `"scorecard_submitted"`, `"note_added"`, `"email_sent"`, `"interview_scheduled"`, `"offer_created"`, `"rejection"`, `"application_submitted"` |
| actorId | string | User who performed the action |
| description | string | Human-readable description |
| metadata | object | Type-specific data (e.g., `{ fromStage, toStage }`) |
| createdAt | string | ISO timestamp |

**Seed data:** 30+ activity entries across candidates, covering various types.

---

### §Notifications
In-app notifications for the current user.

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"notif-1"` |
| type | string | `"scorecard_due"`, `"interview_reminder"`, `"candidate_applied"`, `"stage_change"`, `"offer_update"`, `"mention"` |
| title | string | Notification title |
| message | string | Notification body |
| isRead | boolean | Read status |
| link | string | Route to navigate to |
| createdAt | string | ISO timestamp |

**Seed data:** 8 notifications (3 unread, 5 read).

---

### §Sources
Recruitment sources/channels.

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"src-1"` |
| name | string | Source name |

**Seed data:** Applied, Referral, LinkedIn, Indeed, Xreenhouse Job Board, Agency - TechRecruit, Internal Transfer

---

### §RejectionReasons

| Field | Type | Description |
|-------|------|-------------|
| id | string | e.g. `"rr-1"` |
| name | string | Reason text |

**Seed data:** Lacking technical skills, Lacking culture fit, Position filled, Candidate withdrew, Overqualified, Underqualified, Better qualified candidate, Compensation mismatch

---

## createInitialData() Structure

```javascript
export function createInitialData() {
  return {
    currentUser: { /* user-1: Jules Park */ },
    users: [ /* 8 users */ ],
    departments: [ /* 6 departments */ ],
    offices: [ /* 3 offices */ ],
    jobs: [ /* 6 jobs */ ],
    jobStages: [ /* ~48 stages (8 per job) */ ],
    candidates: [ /* 20 candidates */ ],
    applications: [ /* 25 applications */ ],
    scorecards: [ /* 15 scorecards */ ],
    interviews: [ /* 10 interviews */ ],
    offers: [ /* 3 offers */ ],
    notes: [ /* 12 notes */ ],
    activityFeed: [ /* 30+ entries */ ],
    notifications: [ /* 8 notifications */ ],
    sources: [ /* 7 sources */ ],
    rejectionReasons: [ /* 8 reasons */ ],
  };
}
```

## Key Relationships Diagram

```
Department ←── Job ──→ Office
                │
                ├── JobStage[] (ordered pipeline)
                │
                └── Application[] ──→ Candidate
                       │
                       ├── Scorecard[] ──→ User (interviewer)
                       ├── Interview[] ──→ User[] (interviewers)
                       ├── Offer[]
                       └── ActivityFeed[]

Candidate ──→ Note[] ──→ User (author)
User ──→ Notification[]
```
