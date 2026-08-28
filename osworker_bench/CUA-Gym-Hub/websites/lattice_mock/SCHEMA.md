# lattice_mock Schema

**Base URL**: `http://localhost:5173/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `currentUser` | object | Active user — same shape as `users[]` entries |
| `users` | array | All 10 employees. Each: `{id, firstName, lastName, email, avatar, title, department, team, location, startDate, managerId, directReportIds[], role, status, birthday, workAnniversary}` |
| `goals` | array | All goals. Each: `{id, title, description, ownerId, status, progress, dueDate, parentGoalId, category, keyResults[], createdAt, updatedAt}`. `status`: `on_track\|progressing\|behind\|completed\|not_started`. `category`: `individual\|team\|company`. Each `keyResult`: `{id, title, startValue, currentValue, targetValue, unit}` |
| `feedback` | array | Feedback and praise items. Each: `{id, type, fromUserId, toUserId, body, visibility, competencyTags[], valueTags[], reactions[], createdAt, isPendingRequest?}`. `type`: `feedback\|praise`. `visibility`: `private\|public\|manager_only`. Each `reaction`: `{userId, emoji}` |
| `oneOnOnes` | array | 1:1 relationships. Each: `{id, participantIds[], frequency, nextMeetingDate}` |
| `meetings` | array | Meeting instances. Each: `{id, oneOnOneId, date, status, talkingPoints[], actionItems[], notes}`. `status`: `upcoming\|completed`. Each `talkingPoint`: `{id, text, addedBy, discussed, order}`. Each `actionItem`: `{id, text, assigneeId, dueDate, completed}` |
| `reviewCycles` | array | Review cycles. Each: `{id, name, status, startDate, endDate, steps[], currentStep, revieweeIds[], nominationsSubmitted}` |
| `reviews` | array | Individual review records per reviewee per cycle. Each: `{id, cycleId, revieweeId, status, nominatedPeerIds[], selfReviewSubmitted?, reviews[]}`. `status`: `completed\|still_receiving\|not_started`. Each review submission: `{reviewerId, type, overallRating, responses[], competencyRatings[], submittedAt}` |
| `updates` | array | Weekly check-in updates. Each: `{id, authorId, weekOf, accomplishments, challenges, priorities, mood, createdAt}`. `mood`: `great\|good\|okay\|not_great\|null` |
| `growthAreas` | array | IDP growth areas. Each: `{id, userId, title, description, status, actions[], createdAt, updatedAt}`. `status`: `active\|draft`. Each `action`: `{id, text, completed}` |
| `careerTracks` | array | Career ladder definitions. Each: `{id, title, levels[]}`. Each `level`: `{id, name, level, competencies[]}`. Each `competency`: `{name, description}` |
| `surveys` | array | Engagement surveys. Each: `{id, title, status, startDate, endDate, responseRate, questions[], userHasResponded}`. `status`: `active\|closed`. Each `question`: `{id, text, type, category}`. `type`: `likert\|enps\|open_text` |
| `surveyResults` | object | Keyed by `surveyId` → `{overallScore, eNPS, categoryScores{}, responseRate}` |
| `tasks` | array | Action items for current user. Each: `{id, title, type, assigneeId, dueDate, priority, completed, relatedEntityId, relatedEntityType, createdAt}`. `type`: `review\|survey\|goal\|1on1\|feedback\|general`. `priority`: `high\|medium\|low` |
| `celebrations` | array | Upcoming milestones. Each: `{id, type, userId, date, details}`. `type`: `birthday\|anniversary\|new_hire` |
| `company` | object | `{name, departments[], values[]}` |
| `careerVision` | string | Career vision text (editable on Grow page). Always present with a default value |
| `compensation` | object | Current user compensation: `{baseSalary, bonusTarget, equityShares, currency, history[]}`. Each history entry: `{date, type, oldValue, newValue}` |

### Default IDs

**Users**: `user_1` (Sarah Chen, currentUser, Senior PM) through `user_10` (Michael Torres, CEO)
- `user_1`: Sarah Chen — Senior Product Manager (managerId: `user_2`)
- `user_2`: Marcus Johnson — VP of Product (managerId: `user_10`)
- `user_3`: Emily Rodriguez — Product Designer
- `user_4`: James Kim — Software Engineer
- `user_5`: Priya Patel — Marketing Manager
- `user_6`: David Thompson — Engineering Manager (managerId: `user_10`)
- `user_7`: Lisa Wang — Director of Marketing (managerId: `user_10`)
- `user_8`: Alex Okafor — Sales Representative (managerId: `user_9`)
- `user_9`: Rachel Martinez — Sales Director (managerId: `user_10`)
- `user_10`: Michael Torres — CEO

**Goals**: `goal_1` through `goal_8`
- `goal_1`, `goal_2`: owned by `user_1` (Sarah)
- `goal_3`: team goal, owned by `user_2` (Marcus)
- `goal_4`, `goal_5`, `goal_6`: company OKRs, owned by `user_10`
- `goal_7`: completed, owned by `user_9`
- `goal_8`: behind, team goal, owned by `user_7`

**Feedback**: `fb_1` through `fb_10`

**1:1 Relationships**: `oo_1` (Sarah ↔ Marcus, weekly), `oo_2` (Sarah ↔ Emily, biweekly)

**Meetings**: `meeting_1` through `meeting_6` (2 upcoming, 4 completed)

**Review Cycles**: `rc_1` (Q1 2025 Performance Review, active), `rc_2` (Q3 2024, completed)

**Reviews**: `rev_1` through `rev_5` (all under `rc_1`)
- `rev_5`: revieweeId `user_1` (Sarah's own review), `selfReviewSubmitted: false`

**Updates**: `upd_1` through `upd_4`

**Growth Areas**: `ga_1`, `ga_2` (active), `ga_3` (draft)

**Career Tracks**: `ct_1` (Product Manager, 3 levels), `ct_2` (Software Engineer, 4 levels)

**Surveys**: `survey_1` (Q1 2025 Engagement Pulse, active, `userHasResponded: false`), `survey_2` (Q3 2024, closed)

**Tasks**: `task_1` through `task_5`

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "currentUser": {
      "id": "user_1",
      "firstName": "Sarah",
      "lastName": "Chen",
      "title": "Senior Product Manager",
      "department": "Product",
      "managerId": "user_2"
    },
    "goals": [
      {
        "id": "goal_1",
        "title": "Launch v2.0 of the platform",
        "ownerId": "user_1",
        "status": "on_track",
        "progress": 65,
        "category": "individual",
        "keyResults": []
      }
    ],
    "tasks": [
      {
        "id": "task_1",
        "title": "Submit self-review",
        "type": "review",
        "assigneeId": "user_1",
        "priority": "high",
        "completed": false,
        "relatedEntityId": "rc_1",
        "relatedEntityType": "review_cycle"
      }
    ]
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Submit feedback or praise (Give Feedback modal) | `feedback[]` — new item prepended |
| React to praise with emoji | `feedback[].reactions[]` — reaction added or removed for `currentUser.id` |
| Create a goal | `goals[]` — new goal appended |
| Update goal status (status badge dropdown) | `goals[id].status`, `goals[id].updatedAt` |
| Update key result value | `goals[id].keyResults[].currentValue`, `goals[id].progress`, `goals[id].updatedAt` |
| Add talking point to 1:1 | `meetings[id].talkingPoints[]` — new tp appended |
| Toggle talking point discussed | `meetings[id].talkingPoints[].discussed` |
| Add action item to 1:1 | `meetings[id].actionItems[]` — new ai appended |
| Toggle action item completed | `meetings[id].actionItems[].completed` |
| Save notes in 1:1 | `meetings[id].notes` |
| Write weekly update | `updates[]` — new update prepended |
| Submit self-review | `reviews[rev_5].status` → `completed`, `reviews[rev_5].selfReviewSubmitted` → `true`, `tasks[task_1].completed` → `true` |
| Submit engagement survey | `surveys[survey_1].userHasResponded` → `true`, `tasks[task_2].completed` → `true` |
| Create growth area | `growthAreas[]` — new area appended |
| Edit/update growth area | `growthAreas[id]` — replaced with new values |
| Delete growth area | `growthAreas[]` — item removed |
| Toggle growth area action complete | `growthAreas[id].actions[].completed`, `growthAreas[id].updatedAt` |
| Add recommended growth area as draft | `growthAreas[]` — new draft area appended |
| Edit career vision | `careerVision` string updated |
| Nominate peers (confirm nominations) | `reviews[rev_5].nominatedPeerIds[]`, `reviewCycles[rc_1].nominationsSubmitted` → `true` |
| Request feedback (submit modal) | `feedback[]` — new items prepended with `isPendingRequest: true` |
| Mark task complete via checkbox (Home or Tasks page) | `tasks[id].completed` → `true` |
