# greenhouse_mock Schema

**Base URL**: `http://localhost:5173/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`
**File upload**: `POST /upload?sid=<sid>` (multipart/form-data) → `{files:[{url,original_name,stored_name,size}]}`
**Serve file**: `GET /files/<sid>/<filename>`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user (same shape as `users[]`; always `user-1` Jules Park, recruiter) |
| `users` | array | All team members; each: `{id, firstName, lastName, name, email, role, avatarUrl, department, title}` — `role` is one of `recruiter`, `hiring_manager`, `interviewer`, `coordinator`, `admin` |
| `departments` | array | Each: `{id, name, parentId}` |
| `offices` | array | Each: `{id, name, location}` |
| `sources` | array | Candidate source lookup; each: `{id, name}` |
| `rejectionReasons` | array | Each: `{id, name}` |
| `jobs` | array | Each: `{id, title, status, departmentId, officeId, hiringManagerId, recruiterId, coordinatorId, openings, openDate, closeDate, description, requirements[], stages[], candidateCount, createdAt, updatedAt}` — `status` is `open`, `closed`, or `draft` |
| `jobStages` | array | Each: `{id, jobId, name, orderIndex, stageType}` — `stageType` is one of `application_review`, `phone_screen`, `interview`, `take_home`, `onsite`, `offer`, `hired` |
| `candidates` | array | Each: `{id, firstName, lastName, name, email, phone, location, currentCompany, currentTitle, resumeUrl, linkedinUrl, source, referrerId, tags[], createdAt, updatedAt}` |
| `applications` | array | Each: `{id, candidateId, jobId, currentStageId, status, appliedAt, rejectedAt, rejectionReason, hiredAt, lastActivityAt, source, creditedTo, recruiterId, coordinatorId, actionRequired, daysInCurrentStage}` — `status` is `active`, `rejected`, or `hired`; `actionRequired` is `needs_decision`, `needs_scheduling`, `needs_scorecard`, `awaiting_candidate`, or `null` |
| `scorecards` | array | Each: `{id, applicationId, interviewerId, stageId, overallRecommendation, attributes[], submittedAt, createdAt, notes}` — `overallRecommendation` is `strong_yes`, `yes`, `no_opinion`, `no`, `strong_no`, or `null` (pending); each attribute: `{name, rating, note}` where rating is 0–4 |
| `interviews` | array | Each: `{id, applicationId, stageId, interviewerIds[], scheduledAt, duration, location, status, meetingUrl, notes}` — `status` is `scheduled`, `completed`, or `cancelled` |
| `offers` | array | Each: `{id, applicationId, jobId, status, salary, currency, startDate, expiresAt, createdBy, approvers[], createdAt, updatedAt}` — `status` is `pending_approval`, `approved`, `sent`, `accepted`, `rejected`, or `draft`; each approver: `{userId, status, respondedAt}` |
| `notes` | array | Each: `{id, candidateId, authorId, body, visibility, isPinned, createdAt, updatedAt}` — `visibility` is `public`, `private`, or `admin_only` |
| `activityFeed` | array | Each: `{id, candidateId, applicationId, type, actorId, description, metadata, createdAt}` — `type` is `application_submitted`, `stage_change`, `scorecard_submitted`, `note_added`, `email_sent`, `interview_scheduled`, `offer_created`, `rejection` |
| `notifications` | array | Each: `{id, type, title, message, isRead, link, createdAt}` — `type` is `scorecard_due`, `interview_reminder`, `candidate_applied`, `stage_change`, `offer_update`, or `mention` |
| `ui` | object | `{searchQuery, activeJobId, activeCandidateId, modals:{addCandidate, createJob, scheduleInterview, rejectCandidate, moveStage, search, notifications}}` — transient UI state, not meaningful for RL evaluation |

### Default IDs

**Users**: `user-1` (Jules Park, recruiter, currentUser), `user-2` (Sarah Chen, recruiter), `user-3` (David Kim, VP Engineering, hiring_manager), `user-4` (Emily Rodriguez, Head of Design, hiring_manager), `user-5` (Marcus Johnson, interviewer), `user-6` (Priya Patel, interviewer), `user-7` (James Wright, coordinator), `user-8` (Lisa Thompson, admin)

**Departments**: `dept-1` Engineering, `dept-2` Design, `dept-3` Product, `dept-4` Marketing, `dept-5` Sales, `dept-6` People Operations

**Offices**: `office-1` San Francisco HQ, `office-2` New York, `office-3` Remote

**Jobs**: `job-1` Senior Frontend Engineer (open), `job-2` Product Designer (open), `job-3` Backend Engineer (open), `job-4` Product Manager (open), `job-5` Marketing Coordinator (open), `job-6` DevOps Engineer (closed)

**Job stages**: `stage-job-{jobId}-{1..8}` — e.g., `stage-job-1-1` through `stage-job-1-8` for job-1. Stage index 1=Application Review, 2=Recruiter Phone Screen, 3=Hiring Manager Screen, 4=Technical Interview (varies per job), 5=Take Home / variant, 6=Onsite, 7=Offer, 8=Hired

**Candidates**: `cand-1` through `cand-20`

**Applications**: `app-1` through `app-25`

**Scorecards**: `sc-1` through `sc-15` (sc-1 through sc-10 submitted, sc-11 through sc-15 pending)

**Interviews**: `int-1` through `int-10` (int-1 to int-4 scheduled future, int-5 to int-9 completed, int-10 cancelled)

**Offers**: `offer-1` (pending_approval, job-1 cand-3), `offer-2` (sent, job-2 cand-7), `offer-3` (accepted, job-6)

**Notes**: `note-1` through `note-12`

**Notifications**: `notif-1` through `notif-8` (notif-1 to notif-3 unread, notif-4 to notif-8 read)

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user-1",
      "firstName": "Jules",
      "lastName": "Park",
      "name": "Jules Park",
      "email": "jules.park@company.com",
      "role": "recruiter",
      "title": "Senior Recruiter"
    },
    "users": [
      { "id": "user-1", "firstName": "Jules", "lastName": "Park", "name": "Jules Park", "email": "jules.park@company.com", "role": "recruiter", "title": "Senior Recruiter" }
    ],
    "departments": [{ "id": "dept-1", "name": "Engineering", "parentId": null }],
    "offices": [{ "id": "office-1", "name": "San Francisco HQ", "location": "San Francisco, CA" }],
    "sources": [{ "id": "src-1", "name": "Applied" }],
    "rejectionReasons": [{ "id": "rr-1", "name": "Lacking technical skills" }],
    "jobs": [
      {
        "id": "job-1", "title": "Senior Frontend Engineer", "status": "open",
        "departmentId": "dept-1", "officeId": "office-1",
        "hiringManagerId": null, "recruiterId": "user-1", "coordinatorId": null,
        "openings": 1, "openDate": "2026-01-15", "closeDate": null,
        "description": "A senior frontend role.", "requirements": [],
        "stages": ["stage-job-1-1"], "candidateCount": 1,
        "createdAt": "2026-01-15T09:00:00Z", "updatedAt": "2026-01-15T09:00:00Z"
      }
    ],
    "jobStages": [
      { "id": "stage-job-1-1", "jobId": "job-1", "name": "Application Review", "orderIndex": 0, "stageType": "application_review" }
    ],
    "candidates": [
      {
        "id": "cand-1", "firstName": "Alex", "lastName": "Chen", "name": "Alex Chen",
        "email": "alex@example.com", "phone": "", "location": "", "currentCompany": "Stripe",
        "currentTitle": "Engineer", "resumeUrl": null, "linkedinUrl": null,
        "source": "applied", "referrerId": null, "tags": [],
        "createdAt": "2026-01-20T10:00:00Z", "updatedAt": "2026-01-20T10:00:00Z"
      }
    ],
    "applications": [
      {
        "id": "app-1", "candidateId": "cand-1", "jobId": "job-1",
        "currentStageId": "stage-job-1-1", "status": "active",
        "appliedAt": "2026-01-20T10:00:00Z", "rejectedAt": null,
        "rejectionReason": null, "hiredAt": null,
        "lastActivityAt": "2026-01-20T10:00:00Z",
        "source": "applied", "creditedTo": null, "recruiterId": "user-1",
        "coordinatorId": null, "actionRequired": "needs_decision", "daysInCurrentStage": 0
      }
    ],
    "scorecards": [], "interviews": [], "offers": [], "notes": [],
    "activityFeed": [], "notifications": [],
    "ui": { "searchQuery": "", "activeJobId": null, "activeCandidateId": null, "modals": {} }
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Add new candidate via "Add Candidate" modal | `candidates` array grows by 1 with new candidate object |
| Add candidate to job (via modal Job field) | `applications` array grows by 1; `jobs[id].candidateCount` increments by 1 |
| Move candidate to different stage (Move Stage modal) | `applications[id].currentStageId` changes to new stage ID; `applications[id].daysInCurrentStage` → 0; `applications[id].lastActivityAt` updated; `activityFeed` grows by 1 |
| Drag candidate card to different pipeline column | same as Move Stage above |
| Reject candidate (Reject modal) | `applications[id].status` → `"rejected"`; `applications[id].rejectedAt` set; `applications[id].rejectionReason` set; `activityFeed` grows by 1 |
| Submit scorecard | `scorecards[id].overallRecommendation` set; `scorecards[id].submittedAt` set; `scorecards[id].attributes[]` updated with ratings/notes; `activityFeed` grows by 1 |
| Add note to candidate | `notes` array grows by 1; `activityFeed` grows by 1 |
| Pin note | `notes[id].isPinned` → `true` |
| Unpin note | `notes[id].isPinned` → `false` |
| Delete note | `notes` array shrinks by 1 (note with matching id removed) |
| Schedule interview (Schedule Interview modal) | `interviews` array grows by 1; `activityFeed` grows by 1; `notifications` may grow if interviewers are not currentUser |
| Create new job (Create Job modal) | `jobs` array grows by 1 with status `"draft"`; `jobStages` grows by 8 (default pipeline stages) |
| Mark single notification read (click notification) | `notifications[id].isRead` → `true` |
| Mark all notifications read | all `notifications[].isRead` → `true` |
