# Xattice Mock — Data Model

## Entity Definitions

### User
The core entity representing an employee in the organization.

```js
{
  id: "user_1",                    // String, unique
  firstName: "Sarah",              // String
  lastName: "Chen",                // String
  email: "sarah.chen@evergreen.com", // String
  avatar: null,                    // String (URL) or null (use initials)
  title: "Senior Product Manager", // String — job title
  department: "Product",           // String
  team: "Platform Team",           // String (optional sub-group)
  location: "San Francisco, CA",   // String
  startDate: "2021-03-15",         // ISO date
  managerId: "user_2",             // String ref → User.id, or null for CEO
  directReportIds: ["user_3", "user_4"], // Array<String> — derived
  role: "ic",                      // "ic" | "manager" | "admin"
  status: "active",                // "active" | "inactive"
  birthday: "1990-06-12",          // ISO date (month/day used for celebrations)
  workAnniversary: "2021-03-15",   // Same as startDate
}
```

### Goal
OKR-style goals with key results.

```js
{
  id: "goal_1",                    // String, unique
  title: "Launch v2.0 of the platform", // String
  description: "Complete the redesign and ship v2.0 to all customers by end of Q2", // String
  ownerId: "user_1",              // String ref → User.id
  status: "on_track",             // "on_track" | "progressing" | "behind" | "completed" | "not_started"
  progress: 65,                   // Number 0-100
  dueDate: "2025-06-30",         // ISO date
  parentGoalId: null,             // String ref → Goal.id (for alignment) or null
  category: "individual",         // "individual" | "team" | "company"
  keyResults: [
    {
      id: "kr_1",
      title: "Complete UI redesign for all 5 core pages",
      startValue: 0,
      currentValue: 3,
      targetValue: 5,
      unit: "pages",              // String — label for the metric
    },
    {
      id: "kr_2",
      title: "Achieve 95% test coverage",
      startValue: 72,
      currentValue: 88,
      targetValue: 95,
      unit: "%",
    }
  ],
  createdAt: "2025-01-10T09:00:00Z",
  updatedAt: "2025-04-01T14:30:00Z",
}
```

### Feedback
Feedback given between employees (private, public, or manager-only).

```js
{
  id: "fb_1",                     // String, unique
  type: "feedback",               // "feedback" | "praise"
  fromUserId: "user_2",          // String ref → User.id
  toUserId: "user_1",            // String ref → User.id
  body: "Great job leading the sprint planning session. Your preparation really showed.", // String (rich text / markdown)
  visibility: "private",          // "private" | "public" | "manager_only"
  competencyTags: ["Leadership", "Communication"], // Array<String>
  valueTags: ["Teamwork"],        // Array<String> — company values (for praise)
  reactions: [                    // Array — emoji reactions (for praise)
    { userId: "user_3", emoji: "👏" }
  ],
  createdAt: "2025-03-28T10:15:00Z",
}
```

### OneOnOne
A recurring 1:1 meeting relationship and individual meeting instances.

```js
// 1:1 Relationship
{
  id: "oo_1",                     // String, unique
  participantIds: ["user_1", "user_2"], // Array<String> — exactly 2 user refs
  frequency: "weekly",            // "weekly" | "biweekly" | "monthly"
  nextMeetingDate: "2025-04-14T14:00:00Z", // ISO datetime
}

// 1:1 Meeting instance
{
  id: "meeting_1",                // String, unique
  oneOnOneId: "oo_1",            // String ref → OneOnOne.id
  date: "2025-04-07T14:00:00Z",  // ISO datetime
  status: "completed",            // "upcoming" | "completed"
  talkingPoints: [
    {
      id: "tp_1",
      text: "Discuss Q2 goal progress",
      addedBy: "user_1",         // String ref → User.id
      discussed: true,            // Boolean
      order: 0,                   // Number
    },
    {
      id: "tp_2",
      text: "Review promotion criteria",
      addedBy: "user_2",
      discussed: true,
      order: 1,
    }
  ],
  actionItems: [
    {
      id: "ai_1",
      text: "Schedule skip-level meeting with VP",
      assigneeId: "user_1",
      dueDate: "2025-04-11",
      completed: false,
    }
  ],
  notes: "Discussed progress on v2.0 launch. Sarah is on track...", // String
}
```

### ReviewCycle
A performance review cycle with individual reviews.

```js
// Review Cycle (admin-created)
{
  id: "rc_1",                     // String, unique
  name: "Q1 2025 Performance Review", // String
  status: "active",               // "draft" | "active" | "completed"
  startDate: "2025-03-15",       // ISO date
  endDate: "2025-04-15",         // ISO date
  steps: ["nominate_peers", "manage_team", "share_results"], // Array<String>
  currentStep: "manage_team",     // String
  revieweeIds: ["user_1", "user_3", "user_4", "user_5", "user_6"], // Array — who is being reviewed
}

// Individual Review (per person per cycle)
{
  id: "rev_1",                    // String, unique
  cycleId: "rc_1",               // String ref → ReviewCycle.id
  revieweeId: "user_3",          // String ref → User.id — person being reviewed
  status: "completed",            // "not_started" | "in_progress" | "completed"
  nominatedPeerIds: ["user_1", "user_5"], // Array<String> — peers nominated
  reviews: [
    {
      reviewerId: "user_2",       // manager
      type: "manager",            // "self" | "manager" | "peer" | "upward"
      overallRating: "meets_expectations", // "exceeds" | "meets_expectations" | "needs_improvement"
      responses: [
        {
          question: "What are this person's key strengths?",
          answer: "Strong technical leadership and mentoring skills...",
        },
        {
          question: "What areas could this person improve?",
          answer: "Could be more proactive in cross-team communication...",
        }
      ],
      competencyRatings: [
        { competency: "Technical Skills", rating: 4 },    // 1-5 scale
        { competency: "Communication", rating: 3 },
        { competency: "Leadership", rating: 4 },
      ],
      submittedAt: "2025-04-02T11:00:00Z",
    },
    {
      reviewerId: "user_3",       // self
      type: "self",
      overallRating: "meets_expectations",
      responses: [
        {
          question: "What are your key accomplishments this quarter?",
          answer: "Led the migration to the new API framework...",
        }
      ],
      competencyRatings: [
        { competency: "Technical Skills", rating: 4 },
        { competency: "Communication", rating: 4 },
        { competency: "Leadership", rating: 3 },
      ],
      submittedAt: "2025-03-28T09:30:00Z",
    }
  ],
}
```

### Update (Weekly Check-in)

```js
{
  id: "upd_1",                    // String, unique
  authorId: "user_1",            // String ref → User.id
  weekOf: "2025-04-07",          // ISO date (Monday of the week)
  accomplishments: "Completed the API integration for the payments module. Reviewed 3 PRs.", // String
  challenges: "Blocked on design approvals for the settings page.", // String
  priorities: "Finalize the settings page UI. Begin QA testing for payments.", // String
  mood: "good",                   // "great" | "good" | "okay" | "not_great" | null
  createdAt: "2025-04-11T16:00:00Z",
}
```

### GrowthArea (Career Development)

```js
{
  id: "ga_1",                     // String, unique
  userId: "user_1",              // String ref → User.id
  title: "Improve my onboarding training skills", // String
  description: "Develop ability to create and deliver effective onboarding programs", // String
  status: "active",               // "active" | "draft" | "completed"
  actions: [
    {
      id: "ga_action_1",
      text: "Shadow 2 onboarding sessions led by senior trainers",
      completed: true,
    },
    {
      id: "ga_action_2",
      text: "Create an onboarding checklist template",
      completed: false,
    }
  ],
  createdAt: "2024-11-15T10:00:00Z",
  updatedAt: "2024-12-27T14:00:00Z",
}
```

### CareerTrack

```js
{
  id: "ct_1",                     // String, unique
  title: "Product Marketing Manager", // String
  levels: [
    {
      id: "level_1",
      name: "Associate Product Marketing Manager",
      level: 1,
      competencies: [
        { name: "Market Research", description: "Conducts basic market analysis..." },
        { name: "Messaging", description: "Drafts product messaging under guidance..." },
      ]
    },
    {
      id: "level_2",
      name: "Product Marketing Manager",
      level: 2,
      competencies: [
        { name: "Market Research", description: "Leads comprehensive market analysis..." },
        { name: "Messaging", description: "Independently crafts product positioning..." },
      ]
    },
    {
      id: "level_3",
      name: "Senior Product Marketing Manager",
      level: 3,
      competencies: [
        { name: "Market Research", description: "Defines market research strategy..." },
        { name: "Messaging", description: "Sets messaging strategy across product lines..." },
      ]
    }
  ]
}
```

### EngagementSurvey

```js
// Survey definition
{
  id: "survey_1",                 // String, unique
  title: "Q1 2025 Engagement Pulse",
  status: "active",               // "draft" | "active" | "closed"
  startDate: "2025-03-20",
  endDate: "2025-04-03",
  responseRate: 78,               // Number 0-100 (%)
  questions: [
    {
      id: "q_1",
      text: "I feel valued at work.",
      type: "likert",             // "likert" (1-5) | "enps" (0-10) | "open_text"
      category: "Belonging",
    },
    {
      id: "q_2",
      text: "My manager supports my career development.",
      type: "likert",
      category: "Manager Effectiveness",
    },
    {
      id: "q_3",
      text: "I have the tools and resources I need to do my job well.",
      type: "likert",
      category: "Enablement",
    },
    {
      id: "q_4",
      text: "How likely are you to recommend this company as a place to work?",
      type: "enps",
      category: "eNPS",
    },
    {
      id: "q_5",
      text: "What could we do to improve your experience at work?",
      type: "open_text",
      category: "Open Feedback",
    }
  ],
}

// Survey response (per user)
{
  id: "sr_1",
  surveyId: "survey_1",
  respondentId: "user_1",        // anonymized in results
  submittedAt: "2025-03-22T10:30:00Z",
  answers: [
    { questionId: "q_1", value: 4 },
    { questionId: "q_2", value: 5 },
    { questionId: "q_3", value: 3 },
    { questionId: "q_4", value: 8 },
    { questionId: "q_5", value: "More cross-team collaboration opportunities" },
  ]
}

// Aggregated survey results (for display)
{
  surveyId: "survey_1",
  overallScore: 4.1,             // Average of all Likert responses
  eNPS: 32,                     // Net Promoter Score (-100 to 100)
  categoryScores: {
    "Belonging": 4.2,
    "Manager Effectiveness": 4.4,
    "Enablement": 3.8,
  },
  responseRate: 78,
}
```

### Task (Action Items / To-dos)

```js
{
  id: "task_1",                   // String, unique
  title: "Submit self-review for Q1 2025 Performance Review", // String
  type: "review",                 // "review" | "feedback" | "goal" | "survey" | "update" | "general"
  assigneeId: "user_1",          // String ref → User.id
  dueDate: "2025-04-10",         // ISO date or null
  priority: "high",               // "high" | "medium" | "low"
  completed: false,               // Boolean
  relatedEntityId: "rc_1",       // String — optional ref to related entity
  relatedEntityType: "review_cycle", // String
  createdAt: "2025-03-15T09:00:00Z",
}
```

### Celebration

```js
{
  id: "celeb_1",
  type: "birthday",              // "birthday" | "anniversary" | "new_hire"
  userId: "user_4",
  date: "2025-04-12",           // ISO date
  details: null,                 // String — e.g., "3 years" for anniversary
}
```

---

## Relationships Summary

```
User ──1:N──> Goal (ownerId)
User ──1:N──> Feedback (fromUserId / toUserId)
User ──M:N──> OneOnOne (participantIds)
User ──1:N──> Update (authorId)
User ──1:N──> GrowthArea (userId)
User ──1:N──> Task (assigneeId)
User ──1:1──> User (managerId → parent)

ReviewCycle ──1:N──> IndividualReview (cycleId)
OneOnOne ──1:N──> Meeting (oneOnOneId)
EngagementSurvey ──1:N──> SurveyResponse (surveyId)

Goal.parentGoalId → Goal (self-referencing for alignment)
```

---

## createInitialData() Structure

```js
function createInitialData() {
  return {
    // Current user (pre-logged-in)
    currentUser: { /* user_1 — Sarah Chen, Senior PM, reports to user_2 */ },

    // All employees (8-12 total for realistic directory)
    users: [ /* user_1 through user_10 */ ],

    // Goals (6-8 goals: mix of individual, team, company; various statuses)
    goals: [ /* goal_1 through goal_8 */ ],

    // Feedback items (8-10: mix of praise and private feedback)
    feedback: [ /* fb_1 through fb_10 */ ],

    // 1:1 relationships (2-3: with manager, with report, possibly skip-level)
    oneOnOnes: [ /* oo_1, oo_2 */ ],

    // 1:1 meeting instances (4-6: mix of upcoming and completed)
    meetings: [ /* meeting_1 through meeting_6 */ ],

    // Review cycles (1-2: one active, one completed)
    reviewCycles: [ /* rc_1, rc_2 */ ],

    // Individual reviews (5-6: for team members in active cycle)
    reviews: [ /* rev_1 through rev_6 */ ],

    // Weekly updates (3-4: recent weeks)
    updates: [ /* upd_1 through upd_4 */ ],

    // Growth areas (2-3: for current user)
    growthAreas: [ /* ga_1, ga_2, ga_3 */ ],

    // Career tracks (2-3: showing different paths)
    careerTracks: [ /* ct_1, ct_2 */ ],

    // Engagement surveys (1-2: one active/recently closed)
    surveys: [ /* survey_1 */ ],
    surveyResponses: [ /* aggregated results, NOT individual responses for privacy */ ],
    surveyResults: { /* aggregated scores */ },

    // Tasks/to-dos (3-5: pending items for current user)
    tasks: [ /* task_1 through task_5 */ ],

    // Celebrations (5-8: upcoming birthdays, anniversaries, new hires)
    celebrations: [ /* celeb_1 through celeb_8 */ ],

    // Company info
    company: {
      name: "Evergreen Technologies, Inc",
      departments: ["Engineering", "Product", "Design", "Marketing", "Sales", "People Operations", "Finance"],
      values: ["Innovation", "Teamwork", "Customer Focus", "Integrity", "Growth Mindset"],
    },
  };
}
```

---

## Seed Data Requirements

### Users (10 employees)
| ID | Name | Title | Department | Manager | Role |
|----|------|-------|------------|---------|------|
| user_1 | Sarah Chen | Senior Product Manager | Product | user_2 | ic (current user) |
| user_2 | Marcus Johnson | VP of Product | Product | user_10 | manager |
| user_3 | Emily Rodriguez | Product Designer | Design | user_2 | ic |
| user_4 | James Kim | Software Engineer | Engineering | user_6 | ic |
| user_5 | Priya Patel | Marketing Manager | Marketing | user_7 | manager |
| user_6 | David Thompson | Engineering Manager | Engineering | user_10 | manager |
| user_7 | Lisa Wang | Director of Marketing | Marketing | user_10 | manager |
| user_8 | Alex Okafor | Sales Representative | Sales | user_9 | ic |
| user_9 | Rachel Martinez | Sales Director | Sales | user_10 | manager |
| user_10 | Michael Torres | CEO | Executive | null | admin |

### Goals — Cover these scenarios:
- 2 personal goals for current user (one on track, one progressing)
- 1 team goal owned by current user's manager
- 2 company-wide OKRs
- 1 completed goal, 1 behind goal (for other users)

### Feedback — Cover these scenarios:
- 3 pieces of private feedback received by current user
- 2 praise items (public, with value tags and reactions)
- 2 feedback items given by current user
- 1 feedback request pending

### Review Cycle — Active cycle with:
- 5 team members at various statuses (completed, still receiving, not started)
- Current user needs to submit self-review (creates a task)

### Celebrations — Upcoming in the next 2 weeks:
- 2 birthdays
- 1 work anniversary (e.g., "3 years")
- 2 new hires this month
