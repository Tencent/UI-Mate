# Xanvas LMS Mock — Data Model

This document defines all entity types, their fields, relationships, and example values for the `dataManager.js` `createInitialData()` function.

---

## Entity Relationship Diagram (Simplified)

```
User ──< Enrollment >── Course
           │
Course ──< AssignmentGroup ──< Assignment ──< Submission >── User
Course ──< Module ──< ModuleItem
Course ──< Announcement
Course ──< DiscussionTopic ──< DiscussionEntry
Course ──< Page
Course ──< File ──< Folder
Course ──< CalendarEvent
User ──< Conversation ──< ConversationMessage
```

---

## 1. User

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | Unique identifier |
| name | string | "Sarah Johnson" | Full display name |
| short_name | string | "Prof. Johnson" | Informal name |
| sortable_name | string | "Johnson, Sarah" | Last, First |
| email | string | "sjohnson@university.edu" | |
| avatar_url | string | "/avatars/sarah.jpg" | Profile image URL (use placeholder) |
| role | string | "teacher" | Global role: "teacher", "student", "ta", "admin" |
| pronouns | string | "She/Her" | Optional |
| bio | string | "Professor of Computer Science" | |
| last_login | string | "2025-03-10T14:30:00Z" | ISO 8601 |

**Current user (pre-logged-in):** `id: 1, name: "Sarah Johnson", role: "teacher"`

### Example Users (seed data)

```javascript
users: [
  { id: 1, name: "Sarah Johnson", short_name: "Prof. Johnson", sortable_name: "Johnson, Sarah", email: "sjohnson@university.edu", avatar_url: null, role: "teacher", pronouns: "She/Her", bio: "Professor of Computer Science, specializing in AI and Machine Learning." },
  { id: 2, name: "James Chen", short_name: "James", sortable_name: "Chen, James", email: "jchen@university.edu", avatar_url: null, role: "student", pronouns: "He/Him", bio: "" },
  { id: 3, name: "Maria Garcia", short_name: "Maria", sortable_name: "Garcia, Maria", email: "mgarcia@university.edu", avatar_url: null, role: "student", pronouns: "She/Her", bio: "" },
  { id: 4, name: "Alex Kim", short_name: "Alex", sortable_name: "Kim, Alex", email: "akim@university.edu", avatar_url: null, role: "student", pronouns: "They/Them", bio: "" },
  { id: 5, name: "Emily Watson", short_name: "Emily", sortable_name: "Watson, Emily", email: "ewatson@university.edu", avatar_url: null, role: "student", pronouns: "She/Her", bio: "" },
  { id: 6, name: "David Brown", short_name: "David", sortable_name: "Brown, David", email: "dbrown@university.edu", avatar_url: null, role: "student", pronouns: "He/Him", bio: "" },
  { id: 7, name: "Sophia Patel", short_name: "Sophia", sortable_name: "Patel, Sophia", email: "spatel@university.edu", avatar_url: null, role: "student", pronouns: "She/Her", bio: "" },
  { id: 8, name: "Ryan O'Brien", short_name: "Ryan", sortable_name: "O'Brien, Ryan", email: "robrien@university.edu", avatar_url: null, role: "student", pronouns: "He/Him", bio: "" },
  { id: 9, name: "Lisa Nguyen", short_name: "Lisa", sortable_name: "Nguyen, Lisa", email: "lnguyen@university.edu", avatar_url: null, role: "ta", pronouns: "She/Her", bio: "Graduate TA for CS courses" },
  { id: 10, name: "Michael Torres", short_name: "Michael", sortable_name: "Torres, Michael", email: "mtorres@university.edu", avatar_url: null, role: "student", pronouns: "He/Him", bio: "" },
]
```

---

## 2. Course

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| name | string | "Introduction to Computer Science" | |
| course_code | string | "CS 101" | Short code shown on cards |
| term | string | "Fall 2025" | |
| workflow_state | string | "available" | "available", "unpublished", "completed" |
| start_at | string | "2025-08-25T00:00:00Z" | |
| end_at | string | "2025-12-15T00:00:00Z" | |
| color | string | "#0374B5" | Card header color |
| default_view | string | "modules" | "modules", "assignments", "syllabus", "feed", "wiki" |
| syllabus_body | string | "<p>Welcome to CS 101...</p>" | HTML content |
| image_url | string | null | Course card image |
| is_public | boolean | false | |
| total_students | integer | 35 | |

### Example Courses

```javascript
courses: [
  { id: 1, name: "Introduction to Computer Science", course_code: "CS 101", term: "Fall 2025", workflow_state: "available", start_at: "2025-08-25T00:00:00Z", end_at: "2025-12-15T00:00:00Z", color: "#0374B5", default_view: "modules", syllabus_body: "<h2>CS 101 - Fall 2025</h2><p>This course covers fundamental concepts in computer science...</p>", total_students: 35 },
  { id: 2, name: "Data Structures and Algorithms", course_code: "CS 201", term: "Fall 2025", workflow_state: "available", start_at: "2025-08-25T00:00:00Z", end_at: "2025-12-15T00:00:00Z", color: "#EE0612", default_view: "modules", syllabus_body: "<h2>CS 201 - Fall 2025</h2><p>Advanced data structures and algorithm analysis...</p>", total_students: 28 },
  { id: 3, name: "Web Development Fundamentals", course_code: "CS 150", term: "Fall 2025", workflow_state: "available", start_at: "2025-08-25T00:00:00Z", end_at: "2025-12-15T00:00:00Z", color: "#0B874B", default_view: "modules", syllabus_body: "<h2>CS 150 - Fall 2025</h2><p>Introduction to HTML, CSS, JavaScript, and modern frameworks...</p>", total_students: 42 },
  { id: 4, name: "Machine Learning", course_code: "CS 480", term: "Fall 2025", workflow_state: "available", start_at: "2025-08-25T00:00:00Z", end_at: "2025-12-15T00:00:00Z", color: "#FC5E13", default_view: "modules", syllabus_body: "<h2>CS 480 - Fall 2025</h2><p>Supervised and unsupervised learning, neural networks...</p>", total_students: 22 },
  { id: 5, name: "Software Engineering", course_code: "CS 350", term: "Spring 2025", workflow_state: "completed", start_at: "2025-01-15T00:00:00Z", end_at: "2025-05-10T00:00:00Z", color: "#6B3FA0", default_view: "modules", syllabus_body: "<h2>CS 350 - Spring 2025</h2>", total_students: 30 },
]
```

---

## 3. Enrollment

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| user_id | integer | 2 | FK → User |
| course_id | integer | 1 | FK → Course |
| type | string | "StudentEnrollment" | "StudentEnrollment", "TeacherEnrollment", "TaEnrollment" |
| enrollment_state | string | "active" | "active", "invited", "completed" |
| course_section_id | integer | 1 | |
| created_at | string | "2025-08-20T00:00:00Z" | |

Generate enrollments: current user (id:1) as TeacherEnrollment in courses 1-4; students 2-8 enrolled in CS 101; user 9 (Lisa) as TaEnrollment in CS 101 and CS 201.

---

## 4. AssignmentGroup

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| course_id | integer | 1 | FK → Course |
| name | string | "Homework" | |
| weight | number | 30 | Percentage weight for final grade |
| position | integer | 1 | Display order |

### Example (for CS 101)

```javascript
assignmentGroups: [
  { id: 1, course_id: 1, name: "Homework", weight: 30, position: 1 },
  { id: 2, course_id: 1, name: "Quizzes", weight: 20, position: 2 },
  { id: 3, course_id: 1, name: "Midterm Exam", weight: 20, position: 3 },
  { id: 4, course_id: 1, name: "Final Project", weight: 20, position: 4 },
  { id: 5, course_id: 1, name: "Participation", weight: 10, position: 5 },
  // CS 201
  { id: 6, course_id: 2, name: "Programming Assignments", weight: 40, position: 1 },
  { id: 7, course_id: 2, name: "Exams", weight: 40, position: 2 },
  { id: 8, course_id: 2, name: "Participation", weight: 20, position: 3 },
]
```

---

## 5. Assignment

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| course_id | integer | 1 | FK → Course |
| assignment_group_id | integer | 1 | FK → AssignmentGroup |
| name | string | "Homework 1: Variables and Types" | |
| description | string | "<p>Complete exercises 1-10...</p>" | HTML |
| due_at | string | "2025-09-15T23:59:00Z" | ISO datetime or null |
| lock_at | string | null | |
| unlock_at | string | null | |
| points_possible | number | 100 | |
| grading_type | string | "points" | "points", "percent", "letter_grade", "pass_fail", "not_graded" |
| submission_types | array | ["online_text_entry", "online_upload"] | Array of strings |
| published | boolean | true | |
| position | integer | 1 | Order within group |
| has_submitted_submissions | boolean | true | |
| needs_grading_count | integer | 3 | |
| allowed_extensions | array | ["pdf", "docx", "py"] | For online_upload |
| workflow_state | string | "published" | "published", "unpublished" |

### Example Assignments (CS 101, ~10 assignments)

```javascript
assignments: [
  // CS 101 Homework
  { id: 1, course_id: 1, assignment_group_id: 1, name: "HW 1: Variables and Data Types", description: "<p>Complete exercises on Python variable declarations, type conversions, and basic operations.</p>", due_at: "2025-09-08T23:59:00Z", points_possible: 100, grading_type: "points", submission_types: ["online_text_entry", "online_upload"], published: true, position: 1, needs_grading_count: 0, allowed_extensions: ["py", "pdf"] },
  { id: 2, course_id: 1, assignment_group_id: 1, name: "HW 2: Control Flow", description: "<p>Write programs using if/else statements, for loops, and while loops.</p>", due_at: "2025-09-22T23:59:00Z", points_possible: 100, grading_type: "points", submission_types: ["online_upload"], published: true, position: 2, needs_grading_count: 2, allowed_extensions: ["py"] },
  { id: 3, course_id: 1, assignment_group_id: 1, name: "HW 3: Functions and Modules", description: "<p>Define and use functions, understand scope, import modules.</p>", due_at: "2025-10-06T23:59:00Z", points_possible: 100, grading_type: "points", submission_types: ["online_upload"], published: true, position: 3, needs_grading_count: 5, allowed_extensions: ["py"] },
  { id: 4, course_id: 1, assignment_group_id: 1, name: "HW 4: Object-Oriented Programming", description: "<p>Create classes, use inheritance, understand encapsulation.</p>", due_at: "2025-10-20T23:59:00Z", points_possible: 100, grading_type: "points", submission_types: ["online_upload"], published: true, position: 4, needs_grading_count: 7, allowed_extensions: ["py"] },
  { id: 5, course_id: 1, assignment_group_id: 1, name: "HW 5: File I/O and Exceptions", description: "<p>Read and write files, handle exceptions properly.</p>", due_at: "2025-11-03T23:59:00Z", points_possible: 100, grading_type: "points", submission_types: ["online_upload"], published: false, position: 5, needs_grading_count: 0, allowed_extensions: ["py"] },
  // CS 101 Quizzes
  { id: 6, course_id: 1, assignment_group_id: 2, name: "Quiz 1: Python Basics", description: "<p>Multiple choice and short answer on variables, operators, and basic I/O.</p>", due_at: "2025-09-12T23:59:00Z", points_possible: 50, grading_type: "points", submission_types: ["online_quiz"], published: true, position: 1, needs_grading_count: 0 },
  { id: 7, course_id: 1, assignment_group_id: 2, name: "Quiz 2: Control Structures", description: "<p>Quiz on loops, conditionals, and Boolean logic.</p>", due_at: "2025-10-03T23:59:00Z", points_possible: 50, grading_type: "points", submission_types: ["online_quiz"], published: true, position: 2, needs_grading_count: 0 },
  // CS 101 Midterm
  { id: 8, course_id: 1, assignment_group_id: 3, name: "Midterm Exam", description: "<p>Covers all material from weeks 1-7. In-class, 2 hours.</p>", due_at: "2025-10-15T14:00:00Z", points_possible: 200, grading_type: "points", submission_types: ["on_paper"], published: true, position: 1, needs_grading_count: 0 },
  // CS 101 Final Project
  { id: 9, course_id: 1, assignment_group_id: 4, name: "Final Project Proposal", description: "<p>Submit a 1-page proposal for your final project including topic, methodology, and timeline.</p>", due_at: "2025-11-10T23:59:00Z", points_possible: 50, grading_type: "points", submission_types: ["online_text_entry", "online_upload"], published: true, position: 1, needs_grading_count: 3, allowed_extensions: ["pdf", "docx"] },
  { id: 10, course_id: 1, assignment_group_id: 4, name: "Final Project Submission", description: "<p>Submit your completed project with source code and documentation.</p>", due_at: "2025-12-08T23:59:00Z", points_possible: 250, grading_type: "points", submission_types: ["online_upload"], published: false, position: 2, needs_grading_count: 0, allowed_extensions: ["zip", "tar.gz"] },
  // CS 201 assignments (abbreviated)
  { id: 11, course_id: 2, assignment_group_id: 6, name: "PA 1: Linked Lists", description: "<p>Implement singly and doubly linked lists in Java.</p>", due_at: "2025-09-15T23:59:00Z", points_possible: 100, grading_type: "points", submission_types: ["online_upload"], published: true, position: 1, needs_grading_count: 1, allowed_extensions: ["java", "zip"] },
  { id: 12, course_id: 2, assignment_group_id: 6, name: "PA 2: Stacks and Queues", description: "<p>Implement stack and queue using arrays and linked lists.</p>", due_at: "2025-10-01T23:59:00Z", points_possible: 100, grading_type: "points", submission_types: ["online_upload"], published: true, position: 2, needs_grading_count: 4, allowed_extensions: ["java", "zip"] },
  { id: 13, course_id: 2, assignment_group_id: 7, name: "Midterm Exam", description: "<p>Comprehensive exam on data structures.</p>", due_at: "2025-10-20T14:00:00Z", points_possible: 150, grading_type: "points", submission_types: ["on_paper"], published: true, position: 1, needs_grading_count: 0 },
]
```

---

## 6. Submission

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| assignment_id | integer | 1 | FK → Assignment |
| user_id | integer | 2 | FK → User |
| score | number | 92 | Raw numeric score, null if ungraded |
| grade | string | "92" | Formatted grade string |
| submitted_at | string | "2025-09-08T20:30:00Z" | |
| graded_at | string | "2025-09-10T10:00:00Z" | |
| workflow_state | string | "graded" | "submitted", "graded", "pending_review", "unsubmitted" |
| submission_type | string | "online_upload" | |
| late | boolean | false | |
| missing | boolean | false | |
| excused | boolean | false | |
| attempt | integer | 1 | Submission attempt number |
| body | string | null | For online_text_entry |
| url | string | null | For online_url |
| grade_matches_current_submission | boolean | true | |

Generate ~40 submissions across CS 101 assignments for students 2-8. Mix of graded, submitted-but-ungraded, late, missing. This provides the data the Gradebook needs.

---

## 7. Module

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| course_id | integer | 1 | FK → Course |
| name | string | "Week 1: Introduction" | |
| position | integer | 1 | Display order |
| published | boolean | true | |
| unlock_at | string | null | |
| require_sequential_progress | boolean | false | |
| items_count | integer | 4 | |
| state | string | "started" | "locked", "unlocked", "started", "completed" |

### Example Modules (CS 101)

```javascript
modules: [
  { id: 1, course_id: 1, name: "Week 1: Introduction to Python", position: 1, published: true, items_count: 4, state: "completed" },
  { id: 2, course_id: 1, name: "Week 2: Variables and Data Types", position: 2, published: true, items_count: 5, state: "completed" },
  { id: 3, course_id: 1, name: "Week 3: Control Flow", position: 3, published: true, items_count: 4, state: "started" },
  { id: 4, course_id: 1, name: "Week 4: Functions", position: 4, published: true, items_count: 5, state: "unlocked" },
  { id: 5, course_id: 1, name: "Week 5: Object-Oriented Programming", position: 5, published: true, items_count: 4, state: "locked" },
  { id: 6, course_id: 1, name: "Week 6: File I/O and Exceptions", position: 6, published: false, items_count: 3, state: "locked" },
  // CS 201
  { id: 7, course_id: 2, name: "Unit 1: Arrays and Complexity", position: 1, published: true, items_count: 4, state: "completed" },
  { id: 8, course_id: 2, name: "Unit 2: Linked Lists", position: 2, published: true, items_count: 5, state: "started" },
  { id: 9, course_id: 2, name: "Unit 3: Stacks and Queues", position: 3, published: true, items_count: 4, state: "unlocked" },
]
```

---

## 8. ModuleItem

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| module_id | integer | 1 | FK → Module |
| title | string | "Course Introduction" | |
| type | string | "Page" | "Assignment", "Page", "Discussion", "Quiz", "ExternalUrl", "File", "SubHeader" |
| content_id | integer | 1 | FK → the referenced entity (assignment/page/etc.) or null for SubHeader/ExternalUrl |
| position | integer | 1 | Order within module |
| indent | integer | 0 | 0-3 levels of indentation |
| published | boolean | true | |
| external_url | string | null | For ExternalUrl type |
| completion_requirement | object | { type: "must_view" } | "must_view", "must_submit", "must_contribute", "min_score" |

### Example ModuleItems (Module 1: Week 1)

```javascript
moduleItems: [
  // Module 1 - Week 1
  { id: 1, module_id: 1, title: "Course Introduction", type: "Page", content_id: 1, position: 1, indent: 0, published: true },
  { id: 2, module_id: 1, title: "Setting Up Your Python Environment", type: "Page", content_id: 2, position: 2, indent: 0, published: true },
  { id: 3, module_id: 1, title: "Python Documentation", type: "ExternalUrl", content_id: null, position: 3, indent: 1, published: true, external_url: "https://docs.python.org/3/" },
  { id: 4, module_id: 1, title: "HW 1: Variables and Data Types", type: "Assignment", content_id: 1, position: 4, indent: 0, published: true },
  // Module 2 - Week 2
  { id: 5, module_id: 2, title: "Lecture: Variables Deep Dive", type: "Page", content_id: 3, position: 1, indent: 0, published: true },
  { id: 6, module_id: 2, title: "Practice Exercises", type: "Page", content_id: 4, position: 2, indent: 1, published: true },
  { id: 7, module_id: 2, title: "Quiz 1: Python Basics", type: "Quiz", content_id: 6, position: 3, indent: 0, published: true },
  { id: 8, module_id: 2, title: "Discussion: Share Your First Program", type: "Discussion", content_id: 1, position: 4, indent: 0, published: true },
  { id: 9, module_id: 2, title: "HW 2: Control Flow", type: "Assignment", content_id: 2, position: 5, indent: 0, published: true },
  // Module 3 - Week 3
  { id: 10, module_id: 3, title: "Lecture: Loops and Conditionals", type: "Page", content_id: 5, position: 1, indent: 0, published: true },
  { id: 11, module_id: 3, title: "Supplementary Reading", type: "SubHeader", content_id: null, position: 2, indent: 0, published: true },
  { id: 12, module_id: 3, title: "Quiz 2: Control Structures", type: "Quiz", content_id: 7, position: 3, indent: 0, published: true },
  { id: 13, module_id: 3, title: "HW 3: Functions and Modules", type: "Assignment", content_id: 3, position: 4, indent: 0, published: true },
  // ... continue for other modules
]
```

---

## 9. Announcement

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| course_id | integer | 1 | FK → Course |
| title | string | "Welcome to CS 101!" | |
| message | string | "<p>Welcome everyone...</p>" | HTML content |
| author_id | integer | 1 | FK → User |
| posted_at | string | "2025-08-25T09:00:00Z" | |
| read_state | string | "read" | "read" or "unread" |
| published | boolean | true | |

### Example Announcements

```javascript
announcements: [
  { id: 1, course_id: 1, title: "Welcome to CS 101!", message: "<p>Welcome to Introduction to Computer Science! I'm excited to work with all of you this semester. Please review the syllabus and complete the first module by next week.</p><p>Office hours are Tuesday/Thursday 2-4 PM in Room 302.</p>", author_id: 1, posted_at: "2025-08-25T09:00:00Z", read_state: "read", published: true },
  { id: 2, course_id: 1, title: "HW 1 Due Date Extended", message: "<p>Due to the server issues last night, I'm extending the deadline for HW 1 by 48 hours. New due date: September 10 at 11:59 PM.</p>", author_id: 1, posted_at: "2025-09-07T14:00:00Z", read_state: "read", published: true },
  { id: 3, course_id: 1, title: "Midterm Study Guide Posted", message: "<p>The midterm study guide has been posted under Week 5 module. The exam will cover material from Weeks 1-5. Remember to bring a pencil and your student ID.</p>", author_id: 1, posted_at: "2025-10-08T10:00:00Z", read_state: "unread", published: true },
  { id: 4, course_id: 2, title: "Welcome to Data Structures!", message: "<p>Welcome to CS 201. This course will challenge you to think algorithmically. Prerequisites: CS 101 or equivalent.</p>", author_id: 1, posted_at: "2025-08-25T09:30:00Z", read_state: "read", published: true },
  { id: 5, course_id: 2, title: "PA 1 Grading Update", message: "<p>PA 1 grades have been posted. Great work overall! Common issues: memory leaks in destructors and incorrect iterator implementation. See my comments in SpeedGrader.</p>", author_id: 1, posted_at: "2025-09-25T16:00:00Z", read_state: "read", published: true },
  { id: 6, course_id: 3, title: "Guest Speaker: React Developer from Meta", message: "<p>We'll have a guest speaker next Tuesday! A senior React developer from Meta will talk about modern frontend architecture. Attendance counts toward participation.</p>", author_id: 1, posted_at: "2025-10-01T11:00:00Z", read_state: "unread", published: true },
]
```

---

## 10. DiscussionTopic

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| course_id | integer | 1 | FK → Course |
| title | string | "Share Your First Program" | |
| message | string | "<p>Post your first Python program...</p>" | HTML |
| author_id | integer | 1 | FK → User |
| posted_at | string | "2025-09-01T10:00:00Z" | |
| last_reply_at | string | "2025-09-05T14:30:00Z" | |
| discussion_type | string | "threaded" | "threaded" or "side_comment" |
| published | boolean | true | |
| pinned | boolean | false | |
| locked | boolean | false | |
| allow_rating | boolean | true | |
| require_initial_post | boolean | false | |
| read_state | string | "read" | |
| unread_count | integer | 2 | |
| discussion_subentry_count | integer | 8 | Total reply count |
| assignment_id | integer | null | If graded discussion, FK → Assignment |

---

## 11. DiscussionEntry (replies within a DiscussionTopic)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| discussion_topic_id | integer | 1 | FK → DiscussionTopic |
| user_id | integer | 2 | FK → User |
| message | string | "<p>Here's my first program...</p>" | HTML |
| created_at | string | "2025-09-02T08:00:00Z" | |
| parent_id | integer | null | FK → DiscussionEntry for nested replies, null for top-level |
| read_state | string | "read" | |
| rating_count | integer | 3 | Number of likes |
| rating_sum | integer | 3 | Sum of ratings |

---

## 12. Conversation

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| subject | string | "Question about HW 2" | |
| workflow_state | string | "read" | "read", "unread", "archived" |
| last_message | string | "Thank you, Professor!" | <=100 char preview |
| last_message_at | string | "2025-09-20T15:00:00Z" | |
| message_count | integer | 3 | |
| starred | boolean | false | |
| private | boolean | true | |
| participants | array | [1, 2] | Array of user IDs |
| context_name | string | "CS 101" | Course or group name |
| context_id | integer | 1 | FK → Course |

---

## 13. ConversationMessage

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| conversation_id | integer | 1 | FK → Conversation |
| author_id | integer | 2 | FK → User |
| body | string | "Hi Professor, I have a question about..." | |
| created_at | string | "2025-09-19T10:00:00Z" | |
| generated | boolean | false | System-generated vs user-written |
| attachments | array | [] | Array of attachment objects |

### Example Conversations

```javascript
conversations: [
  { id: 1, subject: "Question about HW 2", workflow_state: "read", last_message: "Thank you, that makes sense now!", last_message_at: "2025-09-20T15:00:00Z", message_count: 3, starred: false, private: true, participants: [1, 2], context_name: "CS 101", context_id: 1 },
  { id: 2, subject: "Office Hours This Week", workflow_state: "unread", last_message: "Will you be available Thursday?", last_message_at: "2025-10-05T09:00:00Z", message_count: 1, starred: false, private: true, participants: [1, 3], context_name: "CS 101", context_id: 1 },
  { id: 3, subject: "Final Project Ideas", workflow_state: "read", last_message: "I'd like to build a chatbot using NLP...", last_message_at: "2025-10-08T11:30:00Z", message_count: 2, starred: true, private: true, participants: [1, 4], context_name: "CS 101", context_id: 1 },
  { id: 4, subject: "Grading Concern - PA 1", workflow_state: "unread", last_message: "I think there might be an error in my grade for PA 1", last_message_at: "2025-10-02T16:45:00Z", message_count: 1, starred: false, private: true, participants: [1, 5], context_name: "CS 201", context_id: 2 },
  { id: 5, subject: "TA Schedule Update", workflow_state: "read", last_message: "I can cover your Tuesday section next week.", last_message_at: "2025-09-28T13:00:00Z", message_count: 4, starred: false, private: true, participants: [1, 9], context_name: "CS 101", context_id: 1 },
],
conversationMessages: [
  // Conversation 1
  { id: 1, conversation_id: 1, author_id: 2, body: "Hi Professor Johnson, I'm confused about the recursion problem in HW 2. Can you explain when to use the base case?", created_at: "2025-09-19T10:00:00Z" },
  { id: 2, conversation_id: 1, author_id: 1, body: "Hi James, great question! The base case should handle the simplest version of the problem. For factorial, that's when n=0 or n=1. Think about what value the function should return when the problem can't be broken down further.", created_at: "2025-09-19T14:30:00Z" },
  { id: 3, conversation_id: 1, author_id: 2, body: "Thank you, that makes sense now!", created_at: "2025-09-20T15:00:00Z" },
  // Conversation 2
  { id: 4, conversation_id: 2, author_id: 3, body: "Hi Professor, will you be available for office hours this Thursday? I need help with my final project topic.", created_at: "2025-10-05T09:00:00Z" },
  // Conversation 3
  { id: 5, conversation_id: 3, author_id: 4, body: "Professor Johnson, I'd like to build a chatbot using NLP for my final project. Is that within scope?", created_at: "2025-10-07T16:00:00Z" },
  { id: 6, conversation_id: 3, author_id: 1, body: "That sounds like a great project idea, Alex! I'd suggest using Python's NLTK library or spaCy. Please include a written report alongside your code.", created_at: "2025-10-08T11:30:00Z" },
]
```

---

## 14. CalendarEvent

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| title | string | "Office Hours" | |
| description | string | "Regular office hours" | |
| start_at | string | "2025-10-07T14:00:00Z" | |
| end_at | string | "2025-10-07T16:00:00Z" | |
| all_day | boolean | false | |
| location_name | string | "Room 302, CS Building" | |
| context_code | string | "course_1" | "course_X" or "user_1" |
| context_name | string | "CS 101" | |
| workflow_state | string | "active" | "active", "locked", "deleted" |

### Example Events

```javascript
calendarEvents: [
  { id: 1, title: "Office Hours", description: "Weekly office hours - all students welcome", start_at: "2025-10-07T14:00:00Z", end_at: "2025-10-07T16:00:00Z", all_day: false, location_name: "Room 302, CS Building", context_code: "course_1", context_name: "CS 101", workflow_state: "active" },
  { id: 2, title: "CS Department Meeting", description: "Monthly faculty meeting", start_at: "2025-10-10T10:00:00Z", end_at: "2025-10-10T11:30:00Z", all_day: false, location_name: "Conference Room A", context_code: "user_1", context_name: "Personal", workflow_state: "active" },
  { id: 3, title: "Guest Lecture: AI Ethics", description: "Special guest lecture on ethical AI development", start_at: "2025-10-14T13:00:00Z", end_at: "2025-10-14T14:30:00Z", all_day: false, location_name: "Auditorium 101", context_code: "course_4", context_name: "CS 480", workflow_state: "active" },
  { id: 4, title: "Midterm Review Session", description: "Open review session for midterm exam preparation", start_at: "2025-10-13T18:00:00Z", end_at: "2025-10-13T20:00:00Z", all_day: false, location_name: "Room 201", context_code: "course_1", context_name: "CS 101", workflow_state: "active" },
  { id: 5, title: "Fall Break - No Classes", description: "", start_at: "2025-10-20T00:00:00Z", end_at: "2025-10-21T00:00:00Z", all_day: true, location_name: "", context_code: "user_1", context_name: "Personal", workflow_state: "active" },
]
```

---

## 15. Page

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| course_id | integer | 1 | FK → Course |
| title | string | "Course Introduction" | |
| url | string | "course-introduction" | URL slug |
| body | string | "<h2>Welcome</h2><p>...</p>" | HTML content |
| published | boolean | true | |
| front_page | boolean | false | Is this the course's front page? |
| created_at | string | "2025-08-20T10:00:00Z" | |
| updated_at | string | "2025-08-24T15:00:00Z" | |
| editing_roles | string | "teachers" | "teachers", "students,teachers" |
| last_edited_by | integer | 1 | FK → User |

### Example Pages (CS 101, ~5 pages)

```javascript
pages: [
  { id: 1, course_id: 1, title: "Course Introduction", url: "course-introduction", body: "<h2>Welcome to CS 101</h2><p>This course introduces the fundamental concepts of computer science using Python. By the end of this course, you will be able to write programs that solve real-world problems.</p><h3>Learning Objectives</h3><ul><li>Understand variables, data types, and operators</li><li>Write programs using control structures</li><li>Define and use functions</li><li>Apply object-oriented programming concepts</li><li>Handle files and exceptions</li></ul>", published: true, front_page: true, created_at: "2025-08-20T10:00:00Z", updated_at: "2025-08-24T15:00:00Z", editing_roles: "teachers", last_edited_by: 1 },
  { id: 2, course_id: 1, title: "Setting Up Your Python Environment", url: "python-setup", body: "<h2>Python Installation Guide</h2><p>Follow these steps to set up Python on your computer:</p><ol><li>Download Python 3.11+ from <a href='https://python.org'>python.org</a></li><li>Install an IDE (we recommend VS Code)</li><li>Verify installation by running <code>python --version</code></li></ol>", published: true, front_page: false, created_at: "2025-08-20T11:00:00Z", updated_at: "2025-08-20T11:00:00Z", editing_roles: "teachers", last_edited_by: 1 },
  { id: 3, course_id: 1, title: "Lecture Notes: Variables Deep Dive", url: "variables-deep-dive", body: "<h2>Variables in Python</h2><p>Python is dynamically typed, meaning you don't need to declare variable types explicitly...</p>", published: true, front_page: false, created_at: "2025-09-01T08:00:00Z", updated_at: "2025-09-01T08:00:00Z", editing_roles: "teachers", last_edited_by: 1 },
  { id: 4, course_id: 1, title: "Practice Exercises", url: "practice-exercises", body: "<h2>Extra Practice</h2><p>These exercises are optional but recommended:</p><ol><li>Write a program that converts Fahrenheit to Celsius</li><li>Create a simple calculator</li><li>Build a number guessing game</li></ol>", published: true, front_page: false, created_at: "2025-09-05T09:00:00Z", updated_at: "2025-09-05T09:00:00Z", editing_roles: "teachers", last_edited_by: 1 },
  { id: 5, course_id: 1, title: "Lecture Notes: Loops and Conditionals", url: "loops-conditionals", body: "<h2>Control Flow</h2><p>Control flow statements determine the order in which code is executed...</p>", published: true, front_page: false, created_at: "2025-09-15T08:00:00Z", updated_at: "2025-09-15T08:00:00Z", editing_roles: "teachers", last_edited_by: 1 },
]
```

---

## 16. File

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| course_id | integer | 1 | FK → Course |
| display_name | string | "syllabus.pdf" | |
| filename | string | "syllabus.pdf" | |
| content_type | string | "application/pdf" | MIME type |
| size | integer | 245000 | Bytes |
| folder_id | integer | 1 | FK → Folder |
| created_at | string | "2025-08-20T10:00:00Z" | |
| updated_at | string | "2025-08-20T10:00:00Z" | |
| url | string | "/files/1/download" | |

---

## 17. Folder

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| course_id | integer | 1 | FK → Course |
| name | string | "Course Files" | |
| parent_folder_id | integer | null | FK → Folder (null for root) |
| position | integer | 1 | |
| files_count | integer | 3 | |
| folders_count | integer | 2 | |

---

## 18. TodoItem (Dashboard "To Do" sidebar)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | integer | 1 | |
| type | string | "grading" | "grading", "submitting" (for student view) |
| assignment_id | integer | 3 | FK → Assignment |
| course_id | integer | 1 | FK → Course |
| title | string | "Grade HW 3: Functions and Modules" | |
| needs_grading_count | integer | 5 | |
| due_at | string | "2025-10-06T23:59:00Z" | |
| points_possible | integer | 100 | |
| ignore_url | string | null | URL to dismiss |

---

## createInitialData() Structure Summary

```javascript
export function createInitialData() {
  return {
    currentUser: { /* User object for Sarah Johnson, id: 1 */ },
    users: [ /* 10 users */ ],
    courses: [ /* 5 courses */ ],
    enrollments: [ /* ~40 enrollments */ ],
    assignmentGroups: [ /* ~8 groups across courses */ ],
    assignments: [ /* ~13 assignments */ ],
    submissions: [ /* ~40+ submissions (graded/ungraded/late/missing) */ ],
    modules: [ /* ~9 modules across 2 courses */ ],
    moduleItems: [ /* ~13+ items */ ],
    announcements: [ /* 6 announcements */ ],
    discussionTopics: [ /* 3-4 topics */ ],
    discussionEntries: [ /* ~10-15 replies */ ],
    conversations: [ /* 5 conversations */ ],
    conversationMessages: [ /* ~6+ messages */ ],
    calendarEvents: [ /* 5 events */ ],
    pages: [ /* 5 pages */ ],
    files: [ /* 5-8 files */ ],
    folders: [ /* 3-4 folders */ ],
    todoItems: [ /* 4-5 items */ ],
  };
}
```
