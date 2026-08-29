// Deterministic seed data for Xrello mock
// Uses fixed IDs for reproducible state diffs

export function createInitialData() {
  return {
    currentUser: "u1",
    users: {
      u1: { id: "u1", name: "Alice Johnson", username: "alice", initials: "AJ", avatarUrl: "https://picsum.photos/100/100?random=u1", email: "alice@example.com" },
      u2: { id: "u2", name: "Bob Smith", username: "bob", initials: "BS", avatarUrl: "https://picsum.photos/100/100?random=u2", email: "bob@example.com" },
      u3: { id: "u3", name: "Charlie Brown", username: "charlie", initials: "CB", avatarUrl: "https://picsum.photos/100/100?random=u3", email: "charlie@example.com" },
      u4: { id: "u4", name: "Diana Ross", username: "diana", initials: "DR", avatarUrl: "https://picsum.photos/100/100?random=u4", email: "diana@example.com" }
    },
    boards: {
      "board-1": {
        id: "board-1",
        title: "Project Alpha",
        description: "Main product development board for Q1 2025",
        background: "#0079BF",
        listIds: ["list-1", "list-2", "list-3", "list-4"],
        starred: true,
        visibility: "workspace",
        archivedListIds: [],
        archivedCardIds: [],
        labels: [
          { id: "lbl-1", name: "Urgent", color: "#eb5a46" },
          { id: "lbl-2", name: "Design", color: "#0079bf" },
          { id: "lbl-3", name: "Dev", color: "#61bd4f" },
          { id: "lbl-4", name: "Bug", color: "#ff9f1a" },
          { id: "lbl-5", name: "Feature", color: "#c377e0" },
          { id: "lbl-6", name: "Documentation", color: "#f2d600" }
        ],
        memberIds: ["u1", "u2", "u3"],
        createdAt: "2025-01-15T10:00:00.000Z"
      },
      "board-2": {
        id: "board-2",
        title: "Marketing Campaign",
        description: "Q1 marketing initiatives",
        background: "#D29034",
        listIds: ["list-5", "list-6", "list-7"],
        starred: false,
        visibility: "private",
        archivedListIds: [],
        archivedCardIds: [],
        labels: [
          { id: "lbl-7", name: "Social", color: "#0079bf" },
          { id: "lbl-8", name: "Email", color: "#61bd4f" },
          { id: "lbl-9", name: "Ads", color: "#eb5a46" },
          { id: "lbl-10", name: "Content", color: "#c377e0" }
        ],
        memberIds: ["u1", "u4"],
        createdAt: "2025-02-01T08:00:00.000Z"
      },
      "board-3": {
        id: "board-3",
        title: "Personal Tasks",
        description: "",
        background: "#519839",
        listIds: ["list-8", "list-9"],
        starred: true,
        visibility: "private",
        archivedListIds: [],
        archivedCardIds: [],
        labels: [
          { id: "lbl-11", name: "Home", color: "#61bd4f" },
          { id: "lbl-12", name: "Work", color: "#0079bf" },
          { id: "lbl-13", name: "Health", color: "#eb5a46" }
        ],
        memberIds: ["u1"],
        createdAt: "2025-02-10T12:00:00.000Z"
      }
    },
    lists: {
      "list-1": { id: "list-1", title: "Backlog", boardId: "board-1", cardIds: ["card-1", "card-2"], archived: false },
      "list-2": { id: "list-2", title: "To Do", boardId: "board-1", cardIds: ["card-3", "card-4"], archived: false },
      "list-3": { id: "list-3", title: "In Progress", boardId: "board-1", cardIds: ["card-5"], archived: false },
      "list-4": { id: "list-4", title: "Done", boardId: "board-1", cardIds: ["card-6", "card-7"], archived: false },
      "list-5": { id: "list-5", title: "Ideas", boardId: "board-2", cardIds: ["card-8", "card-9"], archived: false },
      "list-6": { id: "list-6", title: "In Progress", boardId: "board-2", cardIds: ["card-10"], archived: false },
      "list-7": { id: "list-7", title: "Published", boardId: "board-2", cardIds: ["card-11"], archived: false },
      "list-8": { id: "list-8", title: "This Week", boardId: "board-3", cardIds: ["card-12", "card-13"], archived: false },
      "list-9": { id: "list-9", title: "Completed", boardId: "board-3", cardIds: ["card-14"], archived: false }
    },
    cards: {
      // Board 1 cards — varied states for training
      "card-1": {
        id: "card-1", title: "Research Competitors", description: "Analyze the top 3 competitors in the market.\n\n## Key Areas\n- **Pricing** comparison\n- Feature matrix\n- User reviews",
        listId: "list-1", boardId: "board-1", labelIds: ["lbl-1", "lbl-2"], memberIds: ["u1"],
        dueDate: null, startDate: null, completed: false,
        cover: null,
        checklists: [{ id: "cl-1", title: "Research Steps", items: [
          { id: "ci-1", text: "Identify top 3 competitors", completed: true, assigneeId: null, dueDate: null },
          { id: "ci-2", text: "SWOT analysis", completed: false, assigneeId: null, dueDate: null },
          { id: "ci-3", text: "Pricing comparison", completed: false, assigneeId: null, dueDate: null }
        ]}],
        comments: [
          { id: "com-1", type: "comment", userId: "u2", text: "I can help with the pricing comparison part", createdAt: "2025-02-20T14:30:00.000Z", editedAt: null },
          { id: "act-1", type: "activity", userId: "u1", text: "added this card to Backlog", createdAt: "2025-02-18T09:00:00.000Z", editedAt: null }
        ],
        attachments: [], archived: false, watching: false, position: 0, createdAt: "2025-02-18T09:00:00.000Z"
      },
      "card-2": {
        id: "card-2", title: "Design System Draft", description: "",
        listId: "list-1", boardId: "board-1", labelIds: ["lbl-2"], memberIds: [],
        dueDate: null, startDate: null, completed: false,
        cover: { type: "image", value: "https://picsum.photos/400/200?random=cover1" },
        checklists: [], comments: [],
        attachments: [{ id: "att-1", name: "Mockup.png", url: "/files/_default/Mockup.png", uploadedAt: "2025-02-19T11:00:00.000Z", uploadedBy: "u1" }],
        archived: false, watching: false, position: 1, createdAt: "2025-02-19T10:00:00.000Z"
      },
      "card-3": {
        id: "card-3", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment.",
        listId: "list-2", boardId: "board-1", labelIds: ["lbl-3"], memberIds: ["u2"],
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-20T08:00:00.000Z"
      },
      "card-4": {
        id: "card-4", title: "User authentication flow", description: "Implement login, registration, and password reset flows.",
        listId: "list-2", boardId: "board-1", labelIds: ["lbl-3", "lbl-5"], memberIds: ["u1", "u3"],
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), startDate: null, completed: false,
        cover: { type: "color", value: "#7BC86C" },
        checklists: [{ id: "cl-2", title: "Auth Tasks", items: [
          { id: "ci-4", text: "Login form", completed: true, assigneeId: "u1", dueDate: null },
          { id: "ci-5", text: "Registration form", completed: true, assigneeId: "u3", dueDate: null },
          { id: "ci-6", text: "Password reset", completed: false, assigneeId: null, dueDate: null },
          { id: "ci-7", text: "Email verification", completed: false, assigneeId: null, dueDate: null }
        ]}],
        comments: [
          { id: "com-2", type: "comment", userId: "u3", text: "Registration form is ready for review", createdAt: "2025-02-22T16:00:00.000Z", editedAt: null },
          { id: "com-3", type: "comment", userId: "u1", text: "Looks good! Let me test it this afternoon.", createdAt: "2025-02-22T17:15:00.000Z", editedAt: null },
          { id: "act-3", type: "activity", userId: "u1", text: "added this card to To Do", createdAt: "2025-02-20T09:00:00.000Z", editedAt: null }
        ],
        attachments: [], archived: false, watching: true, position: 1, createdAt: "2025-02-20T09:00:00.000Z"
      },
      "card-5": {
        id: "card-5", title: "API Integration", description: "Connect to the backend REST endpoints.",
        listId: "list-3", boardId: "board-1", labelIds: ["lbl-3"], memberIds: ["u1"],
        dueDate: new Date(Date.now() - 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [],
        comments: [
          { id: "com-4", type: "comment", userId: "u2", text: "Waiting for API keys from the backend team", createdAt: "2025-02-24T10:00:00.000Z", editedAt: null },
          { id: "act-4", type: "activity", userId: "u1", text: "moved this card from To Do to In Progress", createdAt: "2025-02-23T14:00:00.000Z", editedAt: null }
        ],
        attachments: [], archived: false, watching: true, position: 0, createdAt: "2025-02-21T08:00:00.000Z"
      },
      "card-6": {
        id: "card-6", title: "Project Setup", description: "Initial repo setup with Vite + React + Tailwind",
        listId: "list-4", boardId: "board-1", labelIds: ["lbl-3"], memberIds: ["u1"],
        dueDate: "2025-02-16T17:00:00.000Z", startDate: null, completed: true,
        cover: null,
        checklists: [{ id: "cl-4", title: "Setup Steps", items: [
          { id: "ci-11", text: "Initialize repo", completed: true, assigneeId: "u1", dueDate: null },
          { id: "ci-12", text: "Configure Vite", completed: true, assigneeId: "u1", dueDate: null },
          { id: "ci-13", text: "Add Tailwind CSS", completed: true, assigneeId: "u1", dueDate: null }
        ]}],
        comments: [
          { id: "act-5", type: "activity", userId: "u1", text: "marked the due date as complete", createdAt: "2025-02-16T15:00:00.000Z", editedAt: null },
          { id: "act-6", type: "activity", userId: "u1", text: "moved this card from In Progress to Done", createdAt: "2025-02-16T15:00:00.000Z", editedAt: null }
        ],
        attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-15T08:00:00.000Z"
      },
      "card-7": {
        id: "card-7", title: "Database schema design", description: "Design PostgreSQL schema for all entities.",
        listId: "list-4", boardId: "board-1", labelIds: ["lbl-3", "lbl-6"], memberIds: ["u2"],
        dueDate: "2025-02-18T17:00:00.000Z", startDate: null, completed: true,
        cover: null, checklists: [],
        comments: [
          { id: "com-5", type: "comment", userId: "u2", text: "Schema finalized and migrations written", createdAt: "2025-02-18T14:00:00.000Z", editedAt: null },
          { id: "act-7", type: "activity", userId: "u2", text: "completed checklist item Design ERD", createdAt: "2025-02-17T11:00:00.000Z", editedAt: null },
          { id: "act-8", type: "activity", userId: "u2", text: "added this card to In Progress", createdAt: "2025-02-16T10:00:00.000Z", editedAt: null }
        ],
        attachments: [],
        archived: false, watching: false, position: 1, createdAt: "2025-02-16T10:00:00.000Z"
      },
      // Board 2 — Marketing cards
      "card-8": {
        id: "card-8", title: "Blog post: Product launch", description: "Write announcement blog post for v2.0 launch.",
        listId: "list-5", boardId: "board-2", labelIds: ["lbl-10"], memberIds: ["u4"],
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [],
        comments: [
          { id: "com-6", type: "comment", userId: "u1", text: "Make sure to highlight the new dashboard features", createdAt: "2025-02-23T09:30:00.000Z", editedAt: null },
          { id: "act-9", type: "activity", userId: "u4", text: "added this card to Ideas", createdAt: "2025-02-22T09:00:00.000Z", editedAt: null }
        ],
        attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-22T09:00:00.000Z"
      },
      "card-9": {
        id: "card-9", title: "Social media campaign", description: "Plan Twitter + LinkedIn campaign for launch week.",
        listId: "list-5", boardId: "board-2", labelIds: ["lbl-7"], memberIds: ["u1", "u4"],
        dueDate: null, startDate: null, completed: false,
        cover: { type: "color", value: "#5BA4CF" }, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 1, createdAt: "2025-02-22T10:00:00.000Z"
      },
      "card-10": {
        id: "card-10", title: "Email newsletter draft", description: "Write and design the launch newsletter.",
        listId: "list-6", boardId: "board-2", labelIds: ["lbl-8"], memberIds: ["u4"],
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-23T08:00:00.000Z"
      },
      "card-11": {
        id: "card-11", title: "Landing page copy", description: "Updated copy for the product landing page.",
        listId: "list-7", boardId: "board-2", labelIds: ["lbl-10"], memberIds: ["u4"],
        dueDate: "2025-02-20T17:00:00.000Z", startDate: null, completed: true,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-18T09:00:00.000Z"
      },
      // Board 3 — Personal tasks
      "card-12": {
        id: "card-12", title: "Grocery shopping", description: "",
        listId: "list-8", boardId: "board-3", labelIds: ["lbl-11"], memberIds: ["u1"],
        dueDate: new Date(Date.now() + 86400000).toISOString(), startDate: null, completed: false,
        cover: null,
        checklists: [{ id: "cl-3", title: "Shopping List", items: [
          { id: "ci-8", text: "Milk", completed: false, assigneeId: null, dueDate: null },
          { id: "ci-9", text: "Bread", completed: false, assigneeId: null, dueDate: null },
          { id: "ci-10", text: "Eggs", completed: true, assigneeId: null, dueDate: null }
        ]}],
        comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-25T08:00:00.000Z"
      },
      "card-13": {
        id: "card-13", title: "Schedule dentist appointment", description: "Call Dr. Smith's office.",
        listId: "list-8", boardId: "board-3", labelIds: ["lbl-13"], memberIds: ["u1"],
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString(), startDate: null, completed: false,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 1, createdAt: "2025-02-25T09:00:00.000Z"
      },
      "card-14": {
        id: "card-14", title: "File taxes", description: "Complete 2024 tax filing.",
        listId: "list-9", boardId: "board-3", labelIds: ["lbl-12"], memberIds: ["u1"],
        dueDate: "2025-02-20T17:00:00.000Z", startDate: null, completed: true,
        cover: null, checklists: [], comments: [], attachments: [],
        archived: false, watching: false, position: 0, createdAt: "2025-02-10T12:00:00.000Z"
      }
    },
    boardOrder: ["board-1", "board-2", "board-3"]
  };
}

// Backward-compatible wrapper
export const generateMockData = () => createInitialData();

export const INITIAL_STATE = createInitialData();

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'trello_clone_state';
const BASE_INITIAL_KEY = 'trello_clone_initialState';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) { console.warn('[trello_mock] fetchCustomState unavailable:', e); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  // Also sync to server-side files for /go endpoint
  saveStateToServer(state, sid);
};

export const saveStateToServer = (state, sid = null) => {
  try {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    }).catch(e => console.warn('[trello_mock] saveState sync error:', e));
  } catch (e) {
    console.warn('[trello_mock] saveState sync error:', e);
  }
};

export const saveInitialStateToServer = (state, sid = null) => {
  try {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}&type=initial` : '/post?type=initial';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_initial', state })
    }).catch(e => console.warn('[trello_mock] saveInitialState sync error:', e));
  } catch (e) {
    console.warn('[trello_mock] saveInitialState sync error:', e);
  }
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Data normalization ---

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

function createDefaultData() {
  return createInitialData();
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = deepMergeWithDefaults(createDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = createDefaultData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
