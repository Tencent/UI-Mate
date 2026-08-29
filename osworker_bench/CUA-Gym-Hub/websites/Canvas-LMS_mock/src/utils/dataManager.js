const BASE_KEY = 'canvas_lms_state';
const BASE_INITIAL_KEY = 'canvas_lms_initialState';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('canvas_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('canvas_sid') || null;
};

export const fetchCustomState = async (sid) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.has_custom_state ? data.stored_state : null;
  } catch {
    return null;
  }
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  try {
    localStorage.setItem(storageKey(sid), JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }
};

export const saveInitialState = (state, sid = null) => {
  try {
    localStorage.setItem(initialKey(sid), JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save initial state:', e);
  }
};

function deepMerge(target, source) {
  if (!source) return target;
  const result = { ...target };
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) continue;
    if (
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sKey = storageKey(sid);
  const iKey = initialKey(sid);

  if (customState) {
    const defaults = createInitialData();
    const merged = { ...defaults, ...customState };
    localStorage.setItem(sKey, JSON.stringify(merged));
    localStorage.setItem(iKey, JSON.stringify(merged));
    return merged;
  }

  const stored = localStorage.getItem(sKey);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fall through
    }
  }

  const defaults = createInitialData();
  localStorage.setItem(sKey, JSON.stringify(defaults));
  localStorage.setItem(iKey, JSON.stringify(defaults));
  return defaults;
};

export function createInitialData() {
  return {
    currentUser: {
      id: 1,
      name: 'Sarah Johnson',
      short_name: 'Prof. Johnson',
      sortable_name: 'Johnson, Sarah',
      email: 'sjohnson@university.edu',
      avatar_url: null,
      role: 'teacher',
      pronouns: 'She/Her',
      bio: 'Professor of Computer Science, specializing in AI and Machine Learning.',
      last_login: '2025-10-10T14:30:00Z'
    },

    users: [
      { id: 1, name: 'Sarah Johnson', short_name: 'Prof. Johnson', sortable_name: 'Johnson, Sarah', email: 'sjohnson@university.edu', avatar_url: null, role: 'teacher', pronouns: 'She/Her', bio: 'Professor of Computer Science, specializing in AI and Machine Learning.' },
      { id: 2, name: 'James Chen', short_name: 'James', sortable_name: 'Chen, James', email: 'jchen@university.edu', avatar_url: null, role: 'student', pronouns: 'He/Him', bio: '' },
      { id: 3, name: 'Maria Garcia', short_name: 'Maria', sortable_name: 'Garcia, Maria', email: 'mgarcia@university.edu', avatar_url: null, role: 'student', pronouns: 'She/Her', bio: '' },
      { id: 4, name: 'Alex Kim', short_name: 'Alex', sortable_name: 'Kim, Alex', email: 'akim@university.edu', avatar_url: null, role: 'student', pronouns: 'They/Them', bio: '' },
      { id: 5, name: 'Emily Watson', short_name: 'Emily', sortable_name: 'Watson, Emily', email: 'ewatson@university.edu', avatar_url: null, role: 'student', pronouns: 'She/Her', bio: '' },
      { id: 6, name: 'David Brown', short_name: 'David', sortable_name: 'Brown, David', email: 'dbrown@university.edu', avatar_url: null, role: 'student', pronouns: 'He/Him', bio: '' },
      { id: 7, name: 'Sophia Patel', short_name: 'Sophia', sortable_name: 'Patel, Sophia', email: 'spatel@university.edu', avatar_url: null, role: 'student', pronouns: 'She/Her', bio: '' },
      { id: 8, name: "Ryan O'Brien", short_name: 'Ryan', sortable_name: "O'Brien, Ryan", email: 'robrien@university.edu', avatar_url: null, role: 'student', pronouns: 'He/Him', bio: '' },
      { id: 9, name: 'Lisa Nguyen', short_name: 'Lisa', sortable_name: 'Nguyen, Lisa', email: 'lnguyen@university.edu', avatar_url: null, role: 'ta', pronouns: 'She/Her', bio: 'Graduate TA for CS courses' },
      { id: 10, name: 'Michael Torres', short_name: 'Michael', sortable_name: 'Torres, Michael', email: 'mtorres@university.edu', avatar_url: null, role: 'student', pronouns: 'He/Him', bio: '' }
    ],

    courses: [
      { id: 1, name: 'Introduction to Computer Science', course_code: 'CS 101', term: 'Fall 2025', workflow_state: 'available', start_at: '2025-08-25T00:00:00Z', end_at: '2025-12-15T00:00:00Z', color: '#0374B5', default_view: 'modules', syllabus_body: '<h2>CS 101 - Fall 2025</h2><p>This course covers fundamental concepts in computer science using Python. Topics include variables, control flow, functions, object-oriented programming, and file I/O.</p><h3>Office Hours</h3><p>Tuesday/Thursday 2-4 PM, Room 302</p><h3>Grading Policy</h3><ul><li>Homework: 30%</li><li>Quizzes: 20%</li><li>Midterm: 20%</li><li>Final Project: 20%</li><li>Participation: 10%</li></ul>', total_students: 35, image_url: null },
      { id: 2, name: 'Data Structures and Algorithms', course_code: 'CS 201', term: 'Fall 2025', workflow_state: 'available', start_at: '2025-08-25T00:00:00Z', end_at: '2025-12-15T00:00:00Z', color: '#EE0612', default_view: 'modules', syllabus_body: '<h2>CS 201 - Fall 2025</h2><p>Advanced data structures and algorithm analysis. Topics include linked lists, trees, graphs, sorting, and complexity analysis.</p>', total_students: 28, image_url: null },
      { id: 3, name: 'Web Development Fundamentals', course_code: 'CS 150', term: 'Fall 2025', workflow_state: 'available', start_at: '2025-08-25T00:00:00Z', end_at: '2025-12-15T00:00:00Z', color: '#0B874B', default_view: 'modules', syllabus_body: '<h2>CS 150 - Fall 2025</h2><p>Introduction to HTML, CSS, JavaScript, and modern frameworks. Build real web applications from scratch.</p>', total_students: 42, image_url: null },
      { id: 4, name: 'Machine Learning', course_code: 'CS 480', term: 'Fall 2025', workflow_state: 'available', start_at: '2025-08-25T00:00:00Z', end_at: '2025-12-15T00:00:00Z', color: '#FC5E13', default_view: 'modules', syllabus_body: '<h2>CS 480 - Fall 2025</h2><p>Supervised and unsupervised learning, neural networks, deep learning, and practical applications.</p>', total_students: 22, image_url: null },
      { id: 5, name: 'Software Engineering', course_code: 'CS 350', term: 'Spring 2025', workflow_state: 'completed', start_at: '2025-01-15T00:00:00Z', end_at: '2025-05-10T00:00:00Z', color: '#6B3FA0', default_view: 'modules', syllabus_body: '<h2>CS 350 - Spring 2025</h2>', total_students: 30, image_url: null }
    ],

    enrollments: [
      // Teacher (Sarah) in all courses
      { id: 1, user_id: 1, course_id: 1, type: 'TeacherEnrollment', enrollment_state: 'active', course_section_id: 1, created_at: '2025-08-20T00:00:00Z' },
      { id: 2, user_id: 1, course_id: 2, type: 'TeacherEnrollment', enrollment_state: 'active', course_section_id: 2, created_at: '2025-08-20T00:00:00Z' },
      { id: 3, user_id: 1, course_id: 3, type: 'TeacherEnrollment', enrollment_state: 'active', course_section_id: 3, created_at: '2025-08-20T00:00:00Z' },
      { id: 4, user_id: 1, course_id: 4, type: 'TeacherEnrollment', enrollment_state: 'active', course_section_id: 4, created_at: '2025-08-20T00:00:00Z' },
      { id: 5, user_id: 1, course_id: 5, type: 'TeacherEnrollment', enrollment_state: 'completed', course_section_id: 5, created_at: '2025-01-10T00:00:00Z' },
      // Students 2-8 in CS 101
      { id: 6, user_id: 2, course_id: 1, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 1, created_at: '2025-08-22T00:00:00Z' },
      { id: 7, user_id: 3, course_id: 1, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 1, created_at: '2025-08-22T00:00:00Z' },
      { id: 8, user_id: 4, course_id: 1, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 1, created_at: '2025-08-22T00:00:00Z' },
      { id: 9, user_id: 5, course_id: 1, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 1, created_at: '2025-08-22T00:00:00Z' },
      { id: 10, user_id: 6, course_id: 1, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 1, created_at: '2025-08-22T00:00:00Z' },
      { id: 11, user_id: 7, course_id: 1, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 1, created_at: '2025-08-22T00:00:00Z' },
      { id: 12, user_id: 8, course_id: 1, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 1, created_at: '2025-08-22T00:00:00Z' },
      // Students 2,3,4,5,10 in CS 201
      { id: 13, user_id: 2, course_id: 2, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 2, created_at: '2025-08-22T00:00:00Z' },
      { id: 14, user_id: 3, course_id: 2, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 2, created_at: '2025-08-22T00:00:00Z' },
      { id: 15, user_id: 4, course_id: 2, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 2, created_at: '2025-08-22T00:00:00Z' },
      { id: 16, user_id: 5, course_id: 2, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 2, created_at: '2025-08-22T00:00:00Z' },
      { id: 17, user_id: 10, course_id: 2, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 2, created_at: '2025-08-22T00:00:00Z' },
      // TA (Lisa) in CS 101 and CS 201
      { id: 18, user_id: 9, course_id: 1, type: 'TaEnrollment', enrollment_state: 'active', course_section_id: 1, created_at: '2025-08-21T00:00:00Z' },
      { id: 19, user_id: 9, course_id: 2, type: 'TaEnrollment', enrollment_state: 'active', course_section_id: 2, created_at: '2025-08-21T00:00:00Z' },
      // Students in CS 150
      { id: 20, user_id: 3, course_id: 3, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 3, created_at: '2025-08-22T00:00:00Z' },
      { id: 21, user_id: 5, course_id: 3, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 3, created_at: '2025-08-22T00:00:00Z' },
      { id: 22, user_id: 6, course_id: 3, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 3, created_at: '2025-08-22T00:00:00Z' },
      { id: 23, user_id: 7, course_id: 3, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 3, created_at: '2025-08-22T00:00:00Z' },
      { id: 24, user_id: 8, course_id: 3, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 3, created_at: '2025-08-22T00:00:00Z' },
      // Students in CS 480
      { id: 25, user_id: 2, course_id: 4, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 4, created_at: '2025-08-22T00:00:00Z' },
      { id: 26, user_id: 4, course_id: 4, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 4, created_at: '2025-08-22T00:00:00Z' },
      { id: 27, user_id: 10, course_id: 4, type: 'StudentEnrollment', enrollment_state: 'active', course_section_id: 4, created_at: '2025-08-22T00:00:00Z' }
    ],

    assignmentGroups: [
      { id: 1, course_id: 1, name: 'Homework', weight: 30, position: 1 },
      { id: 2, course_id: 1, name: 'Quizzes', weight: 20, position: 2 },
      { id: 3, course_id: 1, name: 'Midterm Exam', weight: 20, position: 3 },
      { id: 4, course_id: 1, name: 'Final Project', weight: 20, position: 4 },
      { id: 5, course_id: 1, name: 'Participation', weight: 10, position: 5 },
      { id: 6, course_id: 2, name: 'Programming Assignments', weight: 40, position: 1 },
      { id: 7, course_id: 2, name: 'Exams', weight: 40, position: 2 },
      { id: 8, course_id: 2, name: 'Participation', weight: 20, position: 3 }
    ],

    assignments: [
      // CS 101 Homework
      { id: 1, course_id: 1, assignment_group_id: 1, name: 'HW 1: Variables and Data Types', description: '<p>Complete exercises on Python variable declarations, type conversions, and basic operations. Submit your .py file.</p>', due_at: '2025-09-08T23:59:00Z', points_possible: 100, grading_type: 'points', submission_types: ['online_text_entry', 'online_upload'], published: true, position: 1, needs_grading_count: 0, allowed_extensions: ['py', 'pdf'], workflow_state: 'published' },
      { id: 2, course_id: 1, assignment_group_id: 1, name: 'HW 2: Control Flow', description: '<p>Write programs using if/else statements, for loops, and while loops. Include documentation.</p>', due_at: '2025-09-22T23:59:00Z', points_possible: 100, grading_type: 'points', submission_types: ['online_upload'], published: true, position: 2, needs_grading_count: 2, allowed_extensions: ['py'], workflow_state: 'published' },
      { id: 3, course_id: 1, assignment_group_id: 1, name: 'HW 3: Functions and Modules', description: '<p>Define and use functions, understand scope, import modules. Complete all problems in the assignment PDF.</p>', due_at: '2025-10-06T23:59:00Z', points_possible: 100, grading_type: 'points', submission_types: ['online_upload'], published: true, position: 3, needs_grading_count: 5, allowed_extensions: ['py'], workflow_state: 'published' },
      { id: 4, course_id: 1, assignment_group_id: 1, name: 'HW 4: Object-Oriented Programming', description: '<p>Create classes, use inheritance, understand encapsulation. Build a small class hierarchy.</p>', due_at: '2025-10-20T23:59:00Z', points_possible: 100, grading_type: 'points', submission_types: ['online_upload'], published: true, position: 4, needs_grading_count: 7, allowed_extensions: ['py'], workflow_state: 'published' },
      { id: 5, course_id: 1, assignment_group_id: 1, name: 'HW 5: File I/O and Exceptions', description: '<p>Read and write files, handle exceptions properly. Process a CSV data file.</p>', due_at: '2025-11-03T23:59:00Z', points_possible: 100, grading_type: 'points', submission_types: ['online_upload'], published: false, position: 5, needs_grading_count: 0, allowed_extensions: ['py'], workflow_state: 'unpublished' },
      // CS 101 Quizzes
      { id: 6, course_id: 1, assignment_group_id: 2, name: 'Quiz 1: Python Basics', description: '<p>Multiple choice and short answer on variables, operators, and basic I/O.</p>', due_at: '2025-09-12T23:59:00Z', points_possible: 50, grading_type: 'points', submission_types: ['online_quiz'], published: true, position: 1, needs_grading_count: 0, workflow_state: 'published' },
      { id: 7, course_id: 1, assignment_group_id: 2, name: 'Quiz 2: Control Structures', description: '<p>Quiz on loops, conditionals, and Boolean logic.</p>', due_at: '2025-10-03T23:59:00Z', points_possible: 50, grading_type: 'points', submission_types: ['online_quiz'], published: true, position: 2, needs_grading_count: 0, workflow_state: 'published' },
      // CS 101 Midterm
      { id: 8, course_id: 1, assignment_group_id: 3, name: 'Midterm Exam', description: '<p>Covers all material from weeks 1-7. In-class, 2 hours. Bring pencil and student ID.</p>', due_at: '2025-10-15T14:00:00Z', points_possible: 200, grading_type: 'points', submission_types: ['on_paper'], published: true, position: 1, needs_grading_count: 0, workflow_state: 'published' },
      // CS 101 Final Project
      { id: 9, course_id: 1, assignment_group_id: 4, name: 'Final Project Proposal', description: '<p>Submit a 1-page proposal for your final project including topic, methodology, and timeline.</p>', due_at: '2025-11-10T23:59:00Z', points_possible: 50, grading_type: 'points', submission_types: ['online_text_entry', 'online_upload'], published: true, position: 1, needs_grading_count: 3, allowed_extensions: ['pdf', 'docx'], workflow_state: 'published' },
      { id: 10, course_id: 1, assignment_group_id: 4, name: 'Final Project Submission', description: '<p>Submit your completed project with source code and documentation.</p>', due_at: '2025-12-08T23:59:00Z', points_possible: 250, grading_type: 'points', submission_types: ['online_upload'], published: false, position: 2, needs_grading_count: 0, allowed_extensions: ['zip', 'tar.gz'], workflow_state: 'unpublished' },
      // CS 201 assignments
      { id: 11, course_id: 2, assignment_group_id: 6, name: 'PA 1: Linked Lists', description: '<p>Implement singly and doubly linked lists in Java with full unit tests.</p>', due_at: '2025-09-15T23:59:00Z', points_possible: 100, grading_type: 'points', submission_types: ['online_upload'], published: true, position: 1, needs_grading_count: 1, allowed_extensions: ['java', 'zip'], workflow_state: 'published' },
      { id: 12, course_id: 2, assignment_group_id: 6, name: 'PA 2: Stacks and Queues', description: '<p>Implement stack and queue using arrays and linked lists. Include performance analysis.</p>', due_at: '2025-10-01T23:59:00Z', points_possible: 100, grading_type: 'points', submission_types: ['online_upload'], published: true, position: 2, needs_grading_count: 4, allowed_extensions: ['java', 'zip'], workflow_state: 'published' },
      { id: 13, course_id: 2, assignment_group_id: 7, name: 'Midterm Exam', description: '<p>Comprehensive exam on arrays, linked lists, stacks, queues, and complexity analysis.</p>', due_at: '2025-10-20T14:00:00Z', points_possible: 150, grading_type: 'points', submission_types: ['on_paper'], published: true, position: 1, needs_grading_count: 0, workflow_state: 'published' }
    ],

    submissions: [
      // HW 1 (id:1) — all 7 students graded
      { id: 1, assignment_id: 1, user_id: 2, score: 92, grade: '92', submitted_at: '2025-09-08T20:30:00Z', graded_at: '2025-09-10T10:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 2, assignment_id: 1, user_id: 3, score: 88, grade: '88', submitted_at: '2025-09-08T22:15:00Z', graded_at: '2025-09-10T10:30:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 3, assignment_id: 1, user_id: 4, score: 95, grade: '95', submitted_at: '2025-09-07T18:00:00Z', graded_at: '2025-09-10T11:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 4, assignment_id: 1, user_id: 5, score: 78, grade: '78', submitted_at: '2025-09-08T23:45:00Z', graded_at: '2025-09-10T11:30:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 5, assignment_id: 1, user_id: 6, score: 85, grade: '85', submitted_at: '2025-09-08T21:00:00Z', graded_at: '2025-09-10T12:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 6, assignment_id: 1, user_id: 7, score: 90, grade: '90', submitted_at: '2025-09-08T19:30:00Z', graded_at: '2025-09-10T12:30:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 7, assignment_id: 1, user_id: 8, score: 72, grade: '72', submitted_at: '2025-09-09T02:00:00Z', graded_at: '2025-09-10T13:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: true, missing: false, excused: false, attempt: 1, body: null },

      // HW 2 (id:2) — 5 graded, 2 submitted (ungraded)
      { id: 8, assignment_id: 2, user_id: 2, score: 88, grade: '88', submitted_at: '2025-09-22T20:00:00Z', graded_at: '2025-09-24T09:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 9, assignment_id: 2, user_id: 3, score: 91, grade: '91', submitted_at: '2025-09-22T18:30:00Z', graded_at: '2025-09-24T09:30:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 10, assignment_id: 2, user_id: 4, score: 96, grade: '96', submitted_at: '2025-09-21T15:00:00Z', graded_at: '2025-09-24T10:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 11, assignment_id: 2, user_id: 5, score: 82, grade: '82', submitted_at: '2025-09-22T23:50:00Z', graded_at: '2025-09-24T10:30:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 12, assignment_id: 2, user_id: 6, score: 75, grade: '75', submitted_at: '2025-09-23T01:15:00Z', graded_at: '2025-09-24T11:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: true, missing: false, excused: false, attempt: 1, body: null },
      { id: 13, assignment_id: 2, user_id: 7, score: null, grade: null, submitted_at: '2025-09-22T22:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 14, assignment_id: 2, user_id: 8, score: null, grade: null, submitted_at: '2025-09-22T21:30:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },

      // HW 3 (id:3) — 2 graded, 5 submitted (ungraded)
      { id: 15, assignment_id: 3, user_id: 2, score: 94, grade: '94', submitted_at: '2025-10-06T20:00:00Z', graded_at: '2025-10-08T10:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 16, assignment_id: 3, user_id: 3, score: 87, grade: '87', submitted_at: '2025-10-06T22:00:00Z', graded_at: '2025-10-08T10:30:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 17, assignment_id: 3, user_id: 4, score: null, grade: null, submitted_at: '2025-10-06T19:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 18, assignment_id: 3, user_id: 5, score: null, grade: null, submitted_at: '2025-10-06T23:55:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 19, assignment_id: 3, user_id: 6, score: null, grade: null, submitted_at: '2025-10-07T00:30:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: true, missing: false, excused: false, attempt: 1, body: null },
      { id: 20, assignment_id: 3, user_id: 7, score: null, grade: null, submitted_at: '2025-10-06T21:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 21, assignment_id: 3, user_id: 8, score: null, grade: null, submitted_at: '2025-10-06T23:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },

      // HW 4 (id:4) — 0 graded, 7 submitted (all need grading)
      { id: 22, assignment_id: 4, user_id: 2, score: null, grade: null, submitted_at: '2025-10-20T18:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 23, assignment_id: 4, user_id: 3, score: null, grade: null, submitted_at: '2025-10-20T20:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 24, assignment_id: 4, user_id: 4, score: null, grade: null, submitted_at: '2025-10-20T17:30:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 25, assignment_id: 4, user_id: 5, score: null, grade: null, submitted_at: '2025-10-20T23:50:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 26, assignment_id: 4, user_id: 6, score: null, grade: null, submitted_at: '2025-10-21T01:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: true, missing: false, excused: false, attempt: 1, body: null },
      { id: 27, assignment_id: 4, user_id: 7, score: null, grade: null, submitted_at: '2025-10-20T22:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 28, assignment_id: 4, user_id: 8, score: null, grade: null, submitted_at: '2025-10-20T21:30:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },

      // Quiz 1 (id:6) — all graded
      { id: 29, assignment_id: 6, user_id: 2, score: 45, grade: '45', submitted_at: '2025-09-12T22:00:00Z', graded_at: '2025-09-12T22:00:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 30, assignment_id: 6, user_id: 3, score: 42, grade: '42', submitted_at: '2025-09-12T21:30:00Z', graded_at: '2025-09-12T21:30:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 31, assignment_id: 6, user_id: 4, score: 48, grade: '48', submitted_at: '2025-09-12T20:00:00Z', graded_at: '2025-09-12T20:00:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 32, assignment_id: 6, user_id: 5, score: 38, grade: '38', submitted_at: '2025-09-12T23:00:00Z', graded_at: '2025-09-12T23:00:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 33, assignment_id: 6, user_id: 6, score: 40, grade: '40', submitted_at: '2025-09-12T22:30:00Z', graded_at: '2025-09-12T22:30:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 34, assignment_id: 6, user_id: 7, score: 46, grade: '46', submitted_at: '2025-09-12T21:00:00Z', graded_at: '2025-09-12T21:00:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 35, assignment_id: 6, user_id: 8, score: 35, grade: '35', submitted_at: '2025-09-12T23:30:00Z', graded_at: '2025-09-12T23:30:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },

      // Quiz 2 (id:7) — all graded
      { id: 36, assignment_id: 7, user_id: 2, score: 44, grade: '44', submitted_at: '2025-10-03T21:00:00Z', graded_at: '2025-10-03T21:00:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 37, assignment_id: 7, user_id: 3, score: 47, grade: '47', submitted_at: '2025-10-03T20:30:00Z', graded_at: '2025-10-03T20:30:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 38, assignment_id: 7, user_id: 4, score: 50, grade: '50', submitted_at: '2025-10-03T19:00:00Z', graded_at: '2025-10-03T19:00:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 39, assignment_id: 7, user_id: 5, score: 41, grade: '41', submitted_at: '2025-10-03T22:00:00Z', graded_at: '2025-10-03T22:00:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 40, assignment_id: 7, user_id: 6, score: 36, grade: '36', submitted_at: '2025-10-03T22:30:00Z', graded_at: '2025-10-03T22:30:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 41, assignment_id: 7, user_id: 7, score: 43, grade: '43', submitted_at: '2025-10-03T21:30:00Z', graded_at: '2025-10-03T21:30:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 42, assignment_id: 7, user_id: 8, score: 30, grade: '30', submitted_at: '2025-10-03T23:00:00Z', graded_at: '2025-10-03T23:00:00Z', workflow_state: 'graded', submission_type: 'online_quiz', late: false, missing: false, excused: false, attempt: 1, body: null },

      // Midterm (id:8) — all graded
      { id: 43, assignment_id: 8, user_id: 2, score: 172, grade: '172', submitted_at: '2025-10-15T16:00:00Z', graded_at: '2025-10-18T10:00:00Z', workflow_state: 'graded', submission_type: 'on_paper', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 44, assignment_id: 8, user_id: 3, score: 165, grade: '165', submitted_at: '2025-10-15T16:00:00Z', graded_at: '2025-10-18T10:30:00Z', workflow_state: 'graded', submission_type: 'on_paper', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 45, assignment_id: 8, user_id: 4, score: 188, grade: '188', submitted_at: '2025-10-15T16:00:00Z', graded_at: '2025-10-18T11:00:00Z', workflow_state: 'graded', submission_type: 'on_paper', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 46, assignment_id: 8, user_id: 5, score: 145, grade: '145', submitted_at: '2025-10-15T16:00:00Z', graded_at: '2025-10-18T11:30:00Z', workflow_state: 'graded', submission_type: 'on_paper', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 47, assignment_id: 8, user_id: 6, score: 158, grade: '158', submitted_at: '2025-10-15T16:00:00Z', graded_at: '2025-10-18T12:00:00Z', workflow_state: 'graded', submission_type: 'on_paper', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 48, assignment_id: 8, user_id: 7, score: 176, grade: '176', submitted_at: '2025-10-15T16:00:00Z', graded_at: '2025-10-18T12:30:00Z', workflow_state: 'graded', submission_type: 'on_paper', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 49, assignment_id: 8, user_id: 8, score: null, grade: null, submitted_at: null, graded_at: null, workflow_state: 'unsubmitted', submission_type: null, late: false, missing: true, excused: false, attempt: 0, body: null },

      // Final Project Proposal (id:9) — 3 submitted ungraded, 1 excused
      { id: 50, assignment_id: 9, user_id: 2, score: null, grade: null, submitted_at: '2025-11-09T22:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 51, assignment_id: 9, user_id: 3, score: null, grade: null, submitted_at: '2025-11-10T20:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 52, assignment_id: 9, user_id: 4, score: null, grade: null, submitted_at: '2025-11-10T18:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 53, assignment_id: 9, user_id: 5, score: null, grade: 'EX', submitted_at: null, graded_at: '2025-11-08T10:00:00Z', workflow_state: 'graded', submission_type: null, late: false, missing: false, excused: true, attempt: 0, body: null },

      // CS 201 PA 1 (id:11)
      { id: 54, assignment_id: 11, user_id: 2, score: 90, grade: '90', submitted_at: '2025-09-15T20:00:00Z', graded_at: '2025-09-20T10:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 55, assignment_id: 11, user_id: 3, score: 85, grade: '85', submitted_at: '2025-09-15T22:00:00Z', graded_at: '2025-09-20T10:30:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 56, assignment_id: 11, user_id: 4, score: 95, grade: '95', submitted_at: '2025-09-14T18:00:00Z', graded_at: '2025-09-20T11:00:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 57, assignment_id: 11, user_id: 5, score: 78, grade: '78', submitted_at: '2025-09-15T23:50:00Z', graded_at: '2025-09-20T11:30:00Z', workflow_state: 'graded', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 58, assignment_id: 11, user_id: 10, score: null, grade: null, submitted_at: '2025-09-15T21:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },

      // CS 201 PA 2 (id:12)
      { id: 59, assignment_id: 12, user_id: 2, score: null, grade: null, submitted_at: '2025-10-01T20:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 60, assignment_id: 12, user_id: 3, score: null, grade: null, submitted_at: '2025-10-01T22:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 61, assignment_id: 12, user_id: 4, score: null, grade: null, submitted_at: '2025-10-01T19:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: false, missing: false, excused: false, attempt: 1, body: null },
      { id: 62, assignment_id: 12, user_id: 5, score: null, grade: null, submitted_at: '2025-10-02T01:00:00Z', graded_at: null, workflow_state: 'submitted', submission_type: 'online_upload', late: true, missing: false, excused: false, attempt: 1, body: null }
    ],

    modules: [
      { id: 1, course_id: 1, name: 'Week 1: Introduction to Python', position: 1, published: true, items_count: 4, state: 'completed' },
      { id: 2, course_id: 1, name: 'Week 2: Variables and Data Types', position: 2, published: true, items_count: 5, state: 'completed' },
      { id: 3, course_id: 1, name: 'Week 3: Control Flow', position: 3, published: true, items_count: 4, state: 'started' },
      { id: 4, course_id: 1, name: 'Week 4: Functions', position: 4, published: true, items_count: 5, state: 'unlocked' },
      { id: 5, course_id: 1, name: 'Week 5: Object-Oriented Programming', position: 5, published: true, items_count: 4, state: 'locked' },
      { id: 6, course_id: 1, name: 'Week 6: File I/O and Exceptions', position: 6, published: false, items_count: 3, state: 'locked' },
      { id: 7, course_id: 2, name: 'Unit 1: Arrays and Complexity', position: 1, published: true, items_count: 4, state: 'completed' },
      { id: 8, course_id: 2, name: 'Unit 2: Linked Lists', position: 2, published: true, items_count: 5, state: 'started' },
      { id: 9, course_id: 2, name: 'Unit 3: Stacks and Queues', position: 3, published: true, items_count: 4, state: 'unlocked' }
    ],

    moduleItems: [
      // Module 1 - Week 1
      { id: 1, module_id: 1, title: 'Course Introduction', type: 'Page', content_id: 1, position: 1, indent: 0, published: true },
      { id: 2, module_id: 1, title: 'Setting Up Your Python Environment', type: 'Page', content_id: 2, position: 2, indent: 0, published: true },
      { id: 3, module_id: 1, title: 'Python Documentation', type: 'ExternalUrl', content_id: null, position: 3, indent: 1, published: true, external_url: 'https://docs.python.org/3/' },
      { id: 4, module_id: 1, title: 'HW 1: Variables and Data Types', type: 'Assignment', content_id: 1, position: 4, indent: 0, published: true },
      // Module 2 - Week 2
      { id: 5, module_id: 2, title: 'Lecture: Variables Deep Dive', type: 'Page', content_id: 3, position: 1, indent: 0, published: true },
      { id: 6, module_id: 2, title: 'Practice Exercises', type: 'Page', content_id: 4, position: 2, indent: 1, published: true },
      { id: 7, module_id: 2, title: 'Quiz 1: Python Basics', type: 'Quiz', content_id: 6, position: 3, indent: 0, published: true },
      { id: 8, module_id: 2, title: 'Discussion: Share Your First Program', type: 'Discussion', content_id: 1, position: 4, indent: 0, published: true },
      { id: 9, module_id: 2, title: 'HW 2: Control Flow', type: 'Assignment', content_id: 2, position: 5, indent: 0, published: true },
      // Module 3 - Week 3
      { id: 10, module_id: 3, title: 'Lecture: Loops and Conditionals', type: 'Page', content_id: 5, position: 1, indent: 0, published: true },
      { id: 11, module_id: 3, title: 'Supplementary Reading', type: 'SubHeader', content_id: null, position: 2, indent: 0, published: true },
      { id: 12, module_id: 3, title: 'Quiz 2: Control Structures', type: 'Quiz', content_id: 7, position: 3, indent: 0, published: true },
      { id: 13, module_id: 3, title: 'HW 3: Functions and Modules', type: 'Assignment', content_id: 3, position: 4, indent: 0, published: true },
      // Module 4 - Week 4
      { id: 14, module_id: 4, title: 'Lecture: Defining Functions', type: 'Page', content_id: null, position: 1, indent: 0, published: true },
      { id: 15, module_id: 4, title: 'Function Best Practices', type: 'Page', content_id: null, position: 2, indent: 1, published: true },
      { id: 16, module_id: 4, title: 'Discussion: Best Practices for Code Comments', type: 'Discussion', content_id: 2, position: 3, indent: 0, published: true },
      { id: 17, module_id: 4, title: 'HW 4: Object-Oriented Programming', type: 'Assignment', content_id: 4, position: 4, indent: 0, published: true },
      { id: 18, module_id: 4, title: 'Midterm Review Materials', type: 'SubHeader', content_id: null, position: 5, indent: 0, published: true },
      // Module 5 - Week 5
      { id: 19, module_id: 5, title: 'Lecture: Classes and Objects', type: 'Page', content_id: null, position: 1, indent: 0, published: true },
      { id: 20, module_id: 5, title: 'Midterm Exam', type: 'Assignment', content_id: 8, position: 2, indent: 0, published: true },
      { id: 21, module_id: 5, title: 'Discussion: Midterm Study Group', type: 'Discussion', content_id: 3, position: 3, indent: 0, published: true },
      { id: 22, module_id: 5, title: 'Final Project Proposal', type: 'Assignment', content_id: 9, position: 4, indent: 0, published: true },
      // Module 6 - Week 6
      { id: 23, module_id: 6, title: 'Lecture: File I/O', type: 'Page', content_id: null, position: 1, indent: 0, published: false },
      { id: 24, module_id: 6, title: 'HW 5: File I/O and Exceptions', type: 'Assignment', content_id: 5, position: 2, indent: 0, published: false },
      { id: 25, module_id: 6, title: 'Final Project Submission', type: 'Assignment', content_id: 10, position: 3, indent: 0, published: false },
      // Module 7 - CS 201 Unit 1
      { id: 26, module_id: 7, title: 'Introduction to Data Structures', type: 'Page', content_id: null, position: 1, indent: 0, published: true },
      { id: 27, module_id: 7, title: 'Big-O Notation Guide', type: 'ExternalUrl', content_id: null, position: 2, indent: 0, published: true, external_url: 'https://www.bigocheatsheet.com/' },
      { id: 28, module_id: 7, title: 'Array Operations Practice', type: 'Page', content_id: null, position: 3, indent: 1, published: true },
      { id: 29, module_id: 7, title: 'PA 1: Linked Lists', type: 'Assignment', content_id: 11, position: 4, indent: 0, published: true },
      // Module 8 - CS 201 Unit 2
      { id: 30, module_id: 8, title: 'Linked List Theory', type: 'Page', content_id: null, position: 1, indent: 0, published: true },
      { id: 31, module_id: 8, title: 'Singly vs Doubly Linked Lists', type: 'Page', content_id: null, position: 2, indent: 1, published: true },
      { id: 32, module_id: 8, title: 'Linked List Visualization Tool', type: 'ExternalUrl', content_id: null, position: 3, indent: 1, published: true, external_url: 'https://visualgo.net/en/list' },
      { id: 33, module_id: 8, title: 'PA 2: Stacks and Queues', type: 'Assignment', content_id: 12, position: 4, indent: 0, published: true },
      { id: 34, module_id: 8, title: 'Midterm Exam', type: 'Assignment', content_id: 13, position: 5, indent: 0, published: true },
      // Module 9 - CS 201 Unit 3
      { id: 35, module_id: 9, title: 'Stack Implementation', type: 'Page', content_id: null, position: 1, indent: 0, published: true },
      { id: 36, module_id: 9, title: 'Queue Implementation', type: 'Page', content_id: null, position: 2, indent: 0, published: true },
      { id: 37, module_id: 9, title: 'Real-World Applications', type: 'SubHeader', content_id: null, position: 3, indent: 0, published: true },
      { id: 38, module_id: 9, title: 'Stack-Based Calculator', type: 'Page', content_id: null, position: 4, indent: 1, published: true }
    ],

    announcements: [
      { id: 1, course_id: 1, title: 'Welcome to CS 101!', message: '<p>Welcome to Introduction to Computer Science! I\'m excited to work with all of you this semester. Please review the syllabus and complete the first module by next week.</p><p>Office hours are Tuesday/Thursday 2-4 PM in Room 302.</p>', author_id: 1, posted_at: '2025-08-25T09:00:00Z', read_state: 'read', published: true },
      { id: 2, course_id: 1, title: 'HW 1 Due Date Extended', message: '<p>Due to the server issues last night, I\'m extending the deadline for HW 1 by 48 hours. New due date: September 10 at 11:59 PM.</p>', author_id: 1, posted_at: '2025-09-07T14:00:00Z', read_state: 'read', published: true },
      { id: 3, course_id: 1, title: 'Midterm Study Guide Posted', message: '<p>The midterm study guide has been posted under Week 5 module. The exam will cover material from Weeks 1-5. Remember to bring a pencil and your student ID.</p>', author_id: 1, posted_at: '2025-10-08T10:00:00Z', read_state: 'unread', published: true },
      { id: 4, course_id: 2, title: 'Welcome to Data Structures!', message: '<p>Welcome to CS 201. This course will challenge you to think algorithmically. Prerequisites: CS 101 or equivalent.</p>', author_id: 1, posted_at: '2025-08-25T09:30:00Z', read_state: 'read', published: true },
      { id: 5, course_id: 2, title: 'PA 1 Grading Update', message: '<p>PA 1 grades have been posted. Great work overall! Common issues: memory leaks in destructors and incorrect iterator implementation. See my comments in SpeedGrader.</p>', author_id: 1, posted_at: '2025-09-25T16:00:00Z', read_state: 'read', published: true },
      { id: 6, course_id: 3, title: 'Guest Speaker: React Developer from Meta', message: '<p>We\'ll have a guest speaker next Tuesday! A senior React developer from Meta will talk about modern frontend architecture. Attendance counts toward participation.</p>', author_id: 1, posted_at: '2025-10-01T11:00:00Z', read_state: 'unread', published: true }
    ],

    discussionTopics: [
      { id: 1, course_id: 1, title: 'Share Your First Program', message: '<p>Post your first Python program here! It can be as simple as a "Hello, World!" or something more creative. Share what you learned and any challenges you faced.</p>', author_id: 1, posted_at: '2025-09-01T10:00:00Z', last_reply_at: '2025-09-05T14:30:00Z', discussion_type: 'threaded', published: true, pinned: true, locked: false, allow_rating: true, require_initial_post: false, read_state: 'read', unread_count: 2, discussion_subentry_count: 5, assignment_id: null },
      { id: 2, course_id: 1, title: 'Best Practices for Code Comments', message: '<p>When should you use comments in your code? What makes a good comment vs a bad one? Share your thoughts and examples.</p>', author_id: 1, posted_at: '2025-09-20T10:00:00Z', last_reply_at: '2025-09-28T09:00:00Z', discussion_type: 'threaded', published: true, pinned: false, locked: false, allow_rating: true, require_initial_post: true, read_state: 'read', unread_count: 1, discussion_subentry_count: 4, assignment_id: null },
      { id: 3, course_id: 1, title: 'Midterm Study Group', message: '<p>Use this thread to organize study groups for the midterm. Share study materials, ask questions, and help each other prepare!</p>', author_id: 1, posted_at: '2025-10-05T10:00:00Z', last_reply_at: '2025-10-12T16:00:00Z', discussion_type: 'threaded', published: true, pinned: false, locked: false, allow_rating: false, require_initial_post: false, read_state: 'unread', unread_count: 3, discussion_subentry_count: 6, assignment_id: null },
      { id: 4, course_id: 1, title: 'Final Project Brainstorm', message: '<p>Share your final project ideas here for peer feedback. The more creative, the better! Remember the project is worth 20% of your grade.</p>', author_id: 1, posted_at: '2025-10-15T10:00:00Z', last_reply_at: null, discussion_type: 'threaded', published: true, pinned: false, locked: false, allow_rating: true, require_initial_post: false, read_state: 'read', unread_count: 0, discussion_subentry_count: 0, assignment_id: null }
    ],

    discussionEntries: [
      // Discussion 1: Share Your First Program
      { id: 1, discussion_topic_id: 1, user_id: 2, message: '<p>Here\'s my first program! It calculates the area of a circle:<br><code>import math<br>radius = float(input("Enter radius: "))<br>area = math.pi * radius ** 2<br>print(f"Area: {area:.2f}")</code></p>', created_at: '2025-09-02T08:00:00Z', parent_id: null, read_state: 'read', rating_count: 3, rating_sum: 3 },
      { id: 2, discussion_topic_id: 1, user_id: 3, message: '<p>Nice one James! I made a temperature converter that handles both F to C and C to F.</p>', created_at: '2025-09-02T10:30:00Z', parent_id: 1, read_state: 'read', rating_count: 1, rating_sum: 1 },
      { id: 3, discussion_topic_id: 1, user_id: 4, message: '<p>I built a simple number guessing game! It picks a random number and gives you hints.</p>', created_at: '2025-09-03T14:00:00Z', parent_id: null, read_state: 'unread', rating_count: 5, rating_sum: 5 },
      { id: 4, discussion_topic_id: 1, user_id: 5, message: '<p>That\'s creative Alex! How did you handle invalid inputs?</p>', created_at: '2025-09-04T09:15:00Z', parent_id: 3, read_state: 'unread', rating_count: 0, rating_sum: 0 },
      { id: 5, discussion_topic_id: 1, user_id: 4, message: '<p>I used a try/except block to catch ValueError when the user enters non-numeric input!</p>', created_at: '2025-09-05T14:30:00Z', parent_id: 4, read_state: 'read', rating_count: 2, rating_sum: 2 },

      // Discussion 2: Best Practices for Code Comments
      { id: 6, discussion_topic_id: 2, user_id: 6, message: '<p>I think comments should explain WHY, not WHAT. The code itself should be clear enough to explain what it does.</p>', created_at: '2025-09-22T11:00:00Z', parent_id: null, read_state: 'read', rating_count: 4, rating_sum: 4 },
      { id: 7, discussion_topic_id: 2, user_id: 7, message: '<p>Agreed! Docstrings for functions are essential though. They help with documentation generation.</p>', created_at: '2025-09-23T14:00:00Z', parent_id: 6, read_state: 'read', rating_count: 2, rating_sum: 2 },
      { id: 8, discussion_topic_id: 2, user_id: 8, message: '<p>I sometimes write comments to remind myself of complex logic. Is that bad practice?</p>', created_at: '2025-09-25T09:00:00Z', parent_id: null, read_state: 'read', rating_count: 1, rating_sum: 1 },
      { id: 9, discussion_topic_id: 2, user_id: 1, message: '<p>Not at all, Ryan! If the logic is genuinely complex, a brief comment explaining the approach is valuable. The key is to avoid comments like "increment i by 1" — those add noise without value.</p>', created_at: '2025-09-28T09:00:00Z', parent_id: 8, read_state: 'unread', rating_count: 6, rating_sum: 6 },

      // Discussion 3: Midterm Study Group
      { id: 10, discussion_topic_id: 3, user_id: 3, message: '<p>Anyone want to meet at the library Saturday afternoon to study? I\'m struggling with recursion.</p>', created_at: '2025-10-06T15:00:00Z', parent_id: null, read_state: 'unread', rating_count: 0, rating_sum: 0 },
      { id: 11, discussion_topic_id: 3, user_id: 2, message: '<p>I\'m in! I can help with recursion. Let\'s meet at 2 PM in the study room on the 3rd floor.</p>', created_at: '2025-10-07T08:00:00Z', parent_id: 10, read_state: 'unread', rating_count: 1, rating_sum: 1 },
      { id: 12, discussion_topic_id: 3, user_id: 5, message: '<p>Count me in too. I made a study guide for chapters 1-5, happy to share!</p>', created_at: '2025-10-08T12:00:00Z', parent_id: 10, read_state: 'unread', rating_count: 3, rating_sum: 3 },
      { id: 13, discussion_topic_id: 3, user_id: 4, message: '<p>Here are my notes on Big-O complexity for the different sorting algorithms we covered: O(n^2) for bubble/selection, O(n log n) for merge sort.</p>', created_at: '2025-10-10T10:00:00Z', parent_id: null, read_state: 'read', rating_count: 7, rating_sum: 7 },
      { id: 14, discussion_topic_id: 3, user_id: 7, message: '<p>Thanks Alex! Super helpful. Does anyone have practice problems for the OOP section?</p>', created_at: '2025-10-11T14:00:00Z', parent_id: 13, read_state: 'read', rating_count: 0, rating_sum: 0 },
      { id: 15, discussion_topic_id: 3, user_id: 9, message: '<p>I\'ll be holding extra office hours on Monday from 4-6 PM for midterm review. Bring your questions!</p>', created_at: '2025-10-12T16:00:00Z', parent_id: null, read_state: 'read', rating_count: 5, rating_sum: 5 }
    ],

    conversations: [
      { id: 1, subject: 'Question about HW 2', workflow_state: 'read', last_message: 'Thank you, that makes sense now!', last_message_at: '2025-09-20T15:00:00Z', message_count: 3, starred: false, private: true, participants: [1, 2], context_name: 'CS 101', context_id: 1 },
      { id: 2, subject: 'Office Hours This Week', workflow_state: 'unread', last_message: 'Will you be available Thursday?', last_message_at: '2025-10-05T09:00:00Z', message_count: 1, starred: false, private: true, participants: [1, 3], context_name: 'CS 101', context_id: 1 },
      { id: 3, subject: 'Final Project Ideas', workflow_state: 'read', last_message: "I'd like to build a chatbot using NLP...", last_message_at: '2025-10-08T11:30:00Z', message_count: 2, starred: true, private: true, participants: [1, 4], context_name: 'CS 101', context_id: 1 },
      { id: 4, subject: 'Grading Concern - PA 1', workflow_state: 'unread', last_message: 'I think there might be an error in my grade for PA 1', last_message_at: '2025-10-02T16:45:00Z', message_count: 1, starred: false, private: true, participants: [1, 5], context_name: 'CS 201', context_id: 2 },
      { id: 5, subject: 'TA Schedule Update', workflow_state: 'read', last_message: 'I can cover your Tuesday section next week.', last_message_at: '2025-09-28T13:00:00Z', message_count: 4, starred: false, private: true, participants: [1, 9], context_name: 'CS 101', context_id: 1 }
    ],

    conversationMessages: [
      { id: 1, conversation_id: 1, author_id: 2, body: "Hi Professor Johnson, I'm confused about the recursion problem in HW 2. Can you explain when to use the base case?", created_at: '2025-09-19T10:00:00Z', generated: false, attachments: [] },
      { id: 2, conversation_id: 1, author_id: 1, body: "Hi James, great question! The base case should handle the simplest version of the problem. For factorial, that's when n=0 or n=1. Think about what value the function should return when the problem can't be broken down further.", created_at: '2025-09-19T14:30:00Z', generated: false, attachments: [] },
      { id: 3, conversation_id: 1, author_id: 2, body: 'Thank you, that makes sense now!', created_at: '2025-09-20T15:00:00Z', generated: false, attachments: [] },
      { id: 4, conversation_id: 2, author_id: 3, body: 'Hi Professor, will you be available for office hours this Thursday? I need help with my final project topic.', created_at: '2025-10-05T09:00:00Z', generated: false, attachments: [] },
      { id: 5, conversation_id: 3, author_id: 4, body: "Professor Johnson, I'd like to build a chatbot using NLP for my final project. Is that within scope?", created_at: '2025-10-07T16:00:00Z', generated: false, attachments: [] },
      { id: 6, conversation_id: 3, author_id: 1, body: "That sounds like a great project idea, Alex! I'd suggest using Python's NLTK library or spaCy. Please include a written report alongside your code.", created_at: '2025-10-08T11:30:00Z', generated: false, attachments: [] },
      { id: 7, conversation_id: 4, author_id: 5, body: 'I think there might be an error in my grade for PA 1. I got 78 but I believe my linked list implementation was correct. Could you take another look?', created_at: '2025-10-02T16:45:00Z', generated: false, attachments: [] },
      { id: 8, conversation_id: 5, author_id: 9, body: 'Hi Professor, I wanted to let you know about the grading schedule for this week.', created_at: '2025-09-25T10:00:00Z', generated: false, attachments: [] },
      { id: 9, conversation_id: 5, author_id: 1, body: "Thanks Lisa! Can you also cover my Tuesday section next week? I have a conference.", created_at: '2025-09-26T09:00:00Z', generated: false, attachments: [] },
      { id: 10, conversation_id: 5, author_id: 9, body: 'Of course! I can cover your Tuesday section next week. I\'ll prepare review materials.', created_at: '2025-09-27T11:00:00Z', generated: false, attachments: [] },
      { id: 11, conversation_id: 5, author_id: 1, body: 'I can cover your Tuesday section next week.', created_at: '2025-09-28T13:00:00Z', generated: false, attachments: [] }
    ],

    calendarEvents: [
      { id: 1, title: 'Office Hours', description: 'Weekly office hours - all students welcome', start_at: '2025-10-07T14:00:00Z', end_at: '2025-10-07T16:00:00Z', all_day: false, location_name: 'Room 302, CS Building', context_code: 'course_1', context_name: 'CS 101', workflow_state: 'active' },
      { id: 2, title: 'CS Department Meeting', description: 'Monthly faculty meeting', start_at: '2025-10-10T10:00:00Z', end_at: '2025-10-10T11:30:00Z', all_day: false, location_name: 'Conference Room A', context_code: 'user_1', context_name: 'Personal', workflow_state: 'active' },
      { id: 3, title: 'Guest Lecture: AI Ethics', description: 'Special guest lecture on ethical AI development', start_at: '2025-10-14T13:00:00Z', end_at: '2025-10-14T14:30:00Z', all_day: false, location_name: 'Auditorium 101', context_code: 'course_4', context_name: 'CS 480', workflow_state: 'active' },
      { id: 4, title: 'Midterm Review Session', description: 'Open review session for midterm exam preparation', start_at: '2025-10-13T18:00:00Z', end_at: '2025-10-13T20:00:00Z', all_day: false, location_name: 'Room 201', context_code: 'course_1', context_name: 'CS 101', workflow_state: 'active' },
      { id: 5, title: 'Fall Break - No Classes', description: '', start_at: '2025-10-20T00:00:00Z', end_at: '2025-10-21T00:00:00Z', all_day: true, location_name: '', context_code: 'user_1', context_name: 'Personal', workflow_state: 'active' }
    ],

    pages: [
      { id: 1, course_id: 1, title: 'Course Introduction', url: 'course-introduction', body: '<h2>Welcome to CS 101</h2><p>This course introduces the fundamental concepts of computer science using Python. By the end of this course, you will be able to write programs that solve real-world problems.</p><h3>Learning Objectives</h3><ul><li>Understand variables, data types, and operators</li><li>Write programs using control structures (loops, conditionals)</li><li>Define and use functions effectively</li><li>Apply object-oriented programming concepts</li><li>Handle files and exceptions properly</li></ul><h3>Required Textbook</h3><p><em>Think Python</em> by Allen Downey (available free online)</p>', published: true, front_page: true, created_at: '2025-08-20T10:00:00Z', updated_at: '2025-08-24T15:00:00Z', editing_roles: 'teachers', last_edited_by: 1 },
      { id: 2, course_id: 1, title: 'Setting Up Your Python Environment', url: 'python-setup', body: '<h2>Python Installation Guide</h2><p>Follow these steps to set up Python on your computer:</p><ol><li>Download Python 3.11+ from <a href="https://python.org">python.org</a></li><li>Install an IDE (we recommend VS Code)</li><li>Install VS Code Python extension</li><li>Verify installation by running <code>python --version</code> in terminal</li></ol><h3>Troubleshooting</h3><p>If you encounter issues, visit office hours or post in the Q&A discussion.</p>', published: true, front_page: false, created_at: '2025-08-20T11:00:00Z', updated_at: '2025-08-20T11:00:00Z', editing_roles: 'teachers', last_edited_by: 1 },
      { id: 3, course_id: 1, title: 'Lecture Notes: Variables Deep Dive', url: 'variables-deep-dive', body: '<h2>Variables in Python</h2><p>Python is dynamically typed, meaning you don\'t need to declare variable types explicitly.</p><h3>Key Concepts</h3><ul><li><strong>Assignment:</strong> <code>x = 42</code></li><li><strong>Type checking:</strong> <code>type(x)</code> returns <code>&lt;class \'int\'&gt;</code></li><li><strong>Type conversion:</strong> <code>int()</code>, <code>float()</code>, <code>str()</code></li></ul><h3>Naming Conventions</h3><p>Use snake_case for variables: <code>my_variable</code>, <code>student_count</code></p>', published: true, front_page: false, created_at: '2025-09-01T08:00:00Z', updated_at: '2025-09-01T08:00:00Z', editing_roles: 'teachers', last_edited_by: 1 },
      { id: 4, course_id: 1, title: 'Practice Exercises', url: 'practice-exercises', body: '<h2>Extra Practice</h2><p>These exercises are optional but recommended:</p><ol><li>Write a program that converts Fahrenheit to Celsius</li><li>Create a simple calculator that handles +, -, *, /</li><li>Build a number guessing game with hints</li><li>Write a program that checks if a string is a palindrome</li></ol><p>Submit your solutions on the discussion board for peer feedback!</p>', published: true, front_page: false, created_at: '2025-09-05T09:00:00Z', updated_at: '2025-09-05T09:00:00Z', editing_roles: 'teachers', last_edited_by: 1 },
      { id: 5, course_id: 1, title: 'Lecture Notes: Loops and Conditionals', url: 'loops-conditionals', body: '<h2>Control Flow</h2><p>Control flow statements determine the order in which code is executed.</p><h3>If Statements</h3><pre><code>if condition:\n    # do something\nelif other_condition:\n    # do something else\nelse:\n    # default action</code></pre><h3>For Loops</h3><pre><code>for item in iterable:\n    print(item)</code></pre><h3>While Loops</h3><pre><code>while condition:\n    # repeat until condition is False</code></pre>', published: true, front_page: false, created_at: '2025-09-15T08:00:00Z', updated_at: '2025-09-15T08:00:00Z', editing_roles: 'teachers', last_edited_by: 1 }
    ],

    files: [
      { id: 1, course_id: 1, display_name: 'syllabus.pdf', filename: 'syllabus.pdf', content_type: 'application/pdf', size: 245000, folder_id: 1, created_at: '2025-08-20T10:00:00Z', updated_at: '2025-08-20T10:00:00Z', url: '/files/1/download' },
      { id: 2, course_id: 1, display_name: 'week1_slides.pptx', filename: 'week1_slides.pptx', content_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 1250000, folder_id: 2, created_at: '2025-08-25T08:00:00Z', updated_at: '2025-08-25T08:00:00Z', url: '/files/2/download' },
      { id: 3, course_id: 1, display_name: 'week2_slides.pptx', filename: 'week2_slides.pptx', content_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 1380000, folder_id: 2, created_at: '2025-09-01T08:00:00Z', updated_at: '2025-09-01T08:00:00Z', url: '/files/3/download' },
      { id: 4, course_id: 1, display_name: 'hello_world.py', filename: 'hello_world.py', content_type: 'text/x-python', size: 1200, folder_id: 3, created_at: '2025-08-25T09:00:00Z', updated_at: '2025-08-25T09:00:00Z', url: '/files/4/download' },
      { id: 5, course_id: 1, display_name: 'data_types_demo.py', filename: 'data_types_demo.py', content_type: 'text/x-python', size: 3400, folder_id: 3, created_at: '2025-09-01T09:00:00Z', updated_at: '2025-09-01T09:00:00Z', url: '/files/5/download' },
      { id: 6, course_id: 1, display_name: 'week3_slides.pptx', filename: 'week3_slides.pptx', content_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 1540000, folder_id: 2, created_at: '2025-09-15T08:00:00Z', updated_at: '2025-09-15T08:00:00Z', url: '/files/6/download' },
      { id: 7, course_id: 1, display_name: 'midterm_study_guide.pdf', filename: 'midterm_study_guide.pdf', content_type: 'application/pdf', size: 420000, folder_id: 1, created_at: '2025-10-08T10:00:00Z', updated_at: '2025-10-08T10:00:00Z', url: '/files/7/download' },
      { id: 8, course_id: 1, display_name: 'loop_examples.py', filename: 'loop_examples.py', content_type: 'text/x-python', size: 2800, folder_id: 3, created_at: '2025-09-15T09:00:00Z', updated_at: '2025-09-15T09:00:00Z', url: '/files/8/download' }
    ],

    folders: [
      { id: 1, course_id: 1, name: 'Course Files', parent_folder_id: null, position: 1, files_count: 2, folders_count: 2 },
      { id: 2, course_id: 1, name: 'Lecture Slides', parent_folder_id: 1, position: 1, files_count: 3, folders_count: 0 },
      { id: 3, course_id: 1, name: 'Lab Materials', parent_folder_id: 1, position: 2, files_count: 3, folders_count: 0 }
    ],

    todoItems: [
      { id: 1, type: 'grading', assignment_id: 3, course_id: 1, title: 'Grade HW 3: Functions and Modules', needs_grading_count: 5, due_at: '2025-10-06T23:59:00Z', points_possible: 100 },
      { id: 2, type: 'grading', assignment_id: 4, course_id: 1, title: 'Grade HW 4: Object-Oriented Programming', needs_grading_count: 7, due_at: '2025-10-20T23:59:00Z', points_possible: 100 },
      { id: 3, type: 'grading', assignment_id: 9, course_id: 1, title: 'Grade Final Project Proposal', needs_grading_count: 3, due_at: '2025-11-10T23:59:00Z', points_possible: 50 },
      { id: 4, type: 'grading', assignment_id: 12, course_id: 2, title: 'Review PA 2: Stacks and Queues', needs_grading_count: 4, due_at: '2025-10-01T23:59:00Z', points_possible: 100 },
      { id: 5, type: 'grading', assignment_id: 2, course_id: 1, title: 'Grade HW 2: Control Flow (remaining)', needs_grading_count: 2, due_at: '2025-09-22T23:59:00Z', points_possible: 100 }
    ],

    announcementReplies: [],

    // UI state
    dashboardView: 'cards',
    activeCourseNav: {}
  };
}
