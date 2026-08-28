const BASE_KEY = 'monday_mock_state';
const BASE_INITIAL_KEY = 'monday_mock_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      if (data.has_custom_state && data.stored_state) {
        return data.stored_state;
      }
    }
  } catch {
    // Local fallback is expected when the dev API is unavailable.
  }
  return null;
};

function serverSeedKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_serverSeeded_${sid}` : `${BASE_INITIAL_KEY}_serverSeeded`;
}

function syncInitialState(initialState, sid = null) {
  if (!sid || !initialState || localStorage.getItem(serverSeedKey(sid))) return;
  fetch(`/post?sid=${encodeURIComponent(sid)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set', state: initialState }),
  }).then(resp => {
    if (resp.ok) localStorage.setItem(serverSeedKey(sid), 'true');
  }).catch(() => {});
}

function deepMerge(target, source) {
  if (!source) return target;
  const result = { ...target };
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) continue;
    if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else if (typeof source[key] === 'object' && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function createInitialData() {
  return {
    currentUserId: "user-1",

    users: {
      "user-1": { id: "user-1", name: "Sarah Johnson", email: "sarah@company.com", initials: "SJ", color: "#0073EA", role: "Admin", isCurrentUser: true },
      "user-2": { id: "user-2", name: "Alex Chen", email: "alex@company.com", initials: "AC", color: "#00C875", role: "Member", isCurrentUser: false },
      "user-3": { id: "user-3", name: "Mike Roberts", email: "mike@company.com", initials: "MR", color: "#FDAB3D", role: "Member", isCurrentUser: false },
      "user-4": { id: "user-4", name: "Emily Davis", email: "emily@company.com", initials: "ED", color: "#E2445C", role: "Member", isCurrentUser: false },
      "user-5": { id: "user-5", name: "Jordan Lee", email: "jordan@company.com", initials: "JL", color: "#A25DDC", role: "Member", isCurrentUser: false },
      "user-6": { id: "user-6", name: "Priya Patel", email: "priya@company.com", initials: "PP", color: "#FF642E", role: "Viewer", isCurrentUser: false },
    },

    workspaces: {
      "ws-1": { id: "ws-1", name: "Main Workspace", icon: "M", color: "#0073EA", boardIds: ["board-1", "board-2", "board-3"] },
      "ws-2": { id: "ws-2", name: "Marketing", icon: "K", color: "#FF158A", boardIds: ["board-4"] },
    },

    activeWorkspaceId: "ws-1",
    activeBoardId: "board-1",

    boards: {
      "board-1": {
        id: "board-1", name: "Team Projects", description: "Track all team projects and milestones",
        workspaceId: "ws-1", type: "board", isFavorite: true,
        groupIds: ["group-1", "group-2", "group-3"],
        columnIds: ["col-person-1", "col-status-1", "col-priority-1", "col-date-1", "col-timeline-1", "col-numbers-1"],
        views: [
          { id: "view-1", type: "table", name: "Table", isDefault: true },
          { id: "view-2", type: "kanban", name: "Kanban", statusColumnId: "col-status-1" },
        ],
        createdAt: "2024-11-01T10:00:00Z", updatedAt: "2025-01-15T14:30:00Z"
      },
      "board-2": {
        id: "board-2", name: "Sprint Planning", description: "Current sprint backlog and tracking",
        workspaceId: "ws-1", type: "board", isFavorite: false,
        groupIds: ["group-4", "group-5"],
        columnIds: ["col-person-2", "col-status-2", "col-priority-2", "col-date-2", "col-text-1"],
        views: [
          { id: "view-3", type: "table", name: "Table", isDefault: true },
          { id: "view-4", type: "kanban", name: "Kanban", statusColumnId: "col-status-2" },
        ],
        createdAt: "2024-12-01T10:00:00Z", updatedAt: "2025-01-14T11:00:00Z"
      },
      "board-3": {
        id: "board-3", name: "Bug Tracker", description: "Report and track bugs",
        workspaceId: "ws-1", type: "board", isFavorite: false,
        groupIds: ["group-6", "group-7"],
        columnIds: ["col-person-3", "col-status-3", "col-priority-3", "col-text-2", "col-dropdown-1"],
        views: [
          { id: "view-5", type: "table", name: "Table", isDefault: true },
        ],
        createdAt: "2025-01-01T10:00:00Z", updatedAt: "2025-01-15T09:00:00Z"
      },
      "board-4": {
        id: "board-4", name: "Content Calendar", description: "Marketing content schedule",
        workspaceId: "ws-2", type: "board", isFavorite: true,
        groupIds: ["group-8", "group-9"],
        columnIds: ["col-person-4", "col-status-4", "col-date-3", "col-tags-1", "col-text-3"],
        views: [
          { id: "view-6", type: "table", name: "Table", isDefault: true },
        ],
        createdAt: "2024-10-15T10:00:00Z", updatedAt: "2025-01-13T16:00:00Z"
      },
    },

    columns: {
      "col-person-1": { id: "col-person-1", title: "Owner", type: "people", width: 120, settings: {} },
      "col-status-1": { id: "col-status-1", title: "Status", type: "status", width: 140, settings: { labels: { 0: { text: "Done", color: "#00C875" }, 1: { text: "Working on it", color: "#FDAB3D" }, 2: { text: "Stuck", color: "#E2445C" }, 3: { text: "Not Started", color: "#C4C4C4" } } } },
      "col-priority-1": { id: "col-priority-1", title: "Priority", type: "status", width: 140, settings: { labels: { 0: { text: "Critical", color: "#333333" }, 1: { text: "High", color: "#401694" }, 2: { text: "Medium", color: "#5559DF" }, 3: { text: "Low", color: "#579BFC" }, 4: { text: "", color: "#C4C4C4" } } } },
      "col-date-1": { id: "col-date-1", title: "Due Date", type: "date", width: 140, settings: {} },
      "col-timeline-1": { id: "col-timeline-1", title: "Timeline", type: "timeline", width: 180, settings: {} },
      "col-numbers-1": { id: "col-numbers-1", title: "Budget", type: "numbers", width: 120, settings: { unit: "$", direction: "left" } },

      "col-person-2": { id: "col-person-2", title: "Assignee", type: "people", width: 120, settings: {} },
      "col-status-2": { id: "col-status-2", title: "Status", type: "status", width: 140, settings: { labels: { 0: { text: "Done", color: "#00C875" }, 1: { text: "In Progress", color: "#FDAB3D" }, 2: { text: "Stuck", color: "#E2445C" }, 3: { text: "Ready", color: "#579BFC" }, 4: { text: "Backlog", color: "#C4C4C4" } } } },
      "col-priority-2": { id: "col-priority-2", title: "Priority", type: "status", width: 140, settings: { labels: { 0: { text: "Critical", color: "#333333" }, 1: { text: "High", color: "#401694" }, 2: { text: "Medium", color: "#5559DF" }, 3: { text: "Low", color: "#579BFC" }, 4: { text: "", color: "#C4C4C4" } } } },
      "col-date-2": { id: "col-date-2", title: "Due Date", type: "date", width: 140, settings: {} },
      "col-text-1": { id: "col-text-1", title: "Notes", type: "text", width: 200, settings: {} },

      "col-person-3": { id: "col-person-3", title: "Assignee", type: "people", width: 120, settings: {} },
      "col-status-3": { id: "col-status-3", title: "Status", type: "status", width: 140, settings: { labels: { 0: { text: "Fixed", color: "#00C875" }, 1: { text: "In Progress", color: "#FDAB3D" }, 2: { text: "Blocked", color: "#E2445C" }, 3: { text: "Open", color: "#579BFC" }, 4: { text: "Won't Fix", color: "#C4C4C4" } } } },
      "col-priority-3": { id: "col-priority-3", title: "Severity", type: "status", width: 140, settings: { labels: { 0: { text: "Critical", color: "#333333" }, 1: { text: "High", color: "#401694" }, 2: { text: "Medium", color: "#5559DF" }, 3: { text: "Low", color: "#579BFC" } } } },
      "col-text-2": { id: "col-text-2", title: "Description", type: "text", width: 250, settings: {} },
      "col-dropdown-1": { id: "col-dropdown-1", title: "Component", type: "dropdown", width: 150, settings: { options: ["Frontend", "Backend", "API", "Database", "DevOps", "Mobile"] } },

      "col-person-4": { id: "col-person-4", title: "Author", type: "people", width: 120, settings: {} },
      "col-status-4": { id: "col-status-4", title: "Status", type: "status", width: 140, settings: { labels: { 0: { text: "Published", color: "#00C875" }, 1: { text: "In Review", color: "#FDAB3D" }, 2: { text: "Writing", color: "#579BFC" }, 3: { text: "Idea", color: "#C4C4C4" } } } },
      "col-date-3": { id: "col-date-3", title: "Publish Date", type: "date", width: 140, settings: {} },
      "col-tags-1": { id: "col-tags-1", title: "Tags", type: "tags", width: 180, settings: { options: [{ id: "tag-blog", name: "Blog", color: "#0073EA" }, { id: "tag-social", name: "Social", color: "#FF158A" }, { id: "tag-email", name: "Email", color: "#00C875" }, { id: "tag-video", name: "Video", color: "#FDAB3D" }, { id: "tag-pr", name: "PR", color: "#A25DDC" }] } },
      "col-text-3": { id: "col-text-3", title: "Topic", type: "text", width: 200, settings: {} },
    },

    groups: {
      "group-1": { id: "group-1", boardId: "board-1", title: "This Quarter", color: "#579BFC", isCollapsed: false, itemIds: ["item-1", "item-2", "item-3", "item-4"], position: 0 },
      "group-2": { id: "group-2", boardId: "board-1", title: "Next Quarter", color: "#00C875", isCollapsed: false, itemIds: ["item-5", "item-6", "item-7"], position: 1 },
      "group-3": { id: "group-3", boardId: "board-1", title: "Completed", color: "#A25DDC", isCollapsed: true, itemIds: ["item-8", "item-9"], position: 2 },
      "group-4": { id: "group-4", boardId: "board-2", title: "Sprint 12", color: "#FF642E", isCollapsed: false, itemIds: ["item-10", "item-11", "item-12", "item-13"], position: 0 },
      "group-5": { id: "group-5", boardId: "board-2", title: "Sprint 13 (Planned)", color: "#579BFC", isCollapsed: false, itemIds: ["item-14", "item-15"], position: 1 },
      "group-6": { id: "group-6", boardId: "board-3", title: "Active Bugs", color: "#E2445C", isCollapsed: false, itemIds: ["item-16", "item-17", "item-18"], position: 0 },
      "group-7": { id: "group-7", boardId: "board-3", title: "Resolved", color: "#00C875", isCollapsed: false, itemIds: ["item-19", "item-20"], position: 1 },
      "group-8": { id: "group-8", boardId: "board-4", title: "January", color: "#FF158A", isCollapsed: false, itemIds: ["item-21", "item-22", "item-23"], position: 0 },
      "group-9": { id: "group-9", boardId: "board-4", title: "February", color: "#0086C0", isCollapsed: false, itemIds: ["item-24", "item-25"], position: 1 },
    },

    items: {
      "item-1": { id: "item-1", boardId: "board-1", groupId: "group-1", name: "Design landing page", columnValues: { "col-person-1": { value: ["user-2"] }, "col-status-1": { value: 1 }, "col-priority-1": { value: 1 }, "col-date-1": { value: "2025-01-20" }, "col-timeline-1": { value: { start: "2025-01-06", end: "2025-01-20" } }, "col-numbers-1": { value: 5000 } }, subitemIds: [], isSelected: false, createdAt: "2024-12-15T09:00:00Z", updatedAt: "2025-01-10T16:00:00Z", creatorId: "user-1" },
      "item-2": { id: "item-2", boardId: "board-1", groupId: "group-1", name: "Implement API endpoints", columnValues: { "col-person-1": { value: ["user-3"] }, "col-status-1": { value: 1 }, "col-priority-1": { value: 0 }, "col-date-1": { value: "2025-01-25" }, "col-timeline-1": { value: { start: "2025-01-10", end: "2025-01-25" } }, "col-numbers-1": { value: 8000 } }, subitemIds: [], isSelected: false, createdAt: "2024-12-15T09:00:00Z", updatedAt: "2025-01-12T11:00:00Z", creatorId: "user-1" },
      "item-3": { id: "item-3", boardId: "board-1", groupId: "group-1", name: "User testing phase 1", columnValues: { "col-person-1": { value: ["user-4", "user-5"] }, "col-status-1": { value: 3 }, "col-priority-1": { value: 2 }, "col-date-1": { value: "2025-02-10" }, "col-timeline-1": { value: { start: "2025-01-27", end: "2025-02-10" } }, "col-numbers-1": { value: 3000 } }, subitemIds: [], isSelected: false, createdAt: "2024-12-20T09:00:00Z", updatedAt: "2025-01-08T14:00:00Z", creatorId: "user-1" },
      "item-4": { id: "item-4", boardId: "board-1", groupId: "group-1", name: "Database migration", columnValues: { "col-person-1": { value: ["user-3"] }, "col-status-1": { value: 2 }, "col-priority-1": { value: 0 }, "col-date-1": { value: "2025-01-18" }, "col-timeline-1": { value: { start: "2025-01-13", end: "2025-01-18" } }, "col-numbers-1": { value: 2000 } }, subitemIds: [], isSelected: false, createdAt: "2025-01-02T09:00:00Z", updatedAt: "2025-01-14T15:00:00Z", creatorId: "user-3" },
      "item-5": { id: "item-5", boardId: "board-1", groupId: "group-2", name: "Mobile app redesign", columnValues: { "col-person-1": { value: ["user-2"] }, "col-status-1": { value: 3 }, "col-priority-1": { value: 2 }, "col-date-1": { value: "2025-04-15" }, "col-timeline-1": { value: { start: "2025-03-01", end: "2025-04-15" } }, "col-numbers-1": { value: 15000 } }, subitemIds: [], isSelected: false, createdAt: "2025-01-05T09:00:00Z", updatedAt: "2025-01-05T09:00:00Z", creatorId: "user-1" },
      "item-6": { id: "item-6", boardId: "board-1", groupId: "group-2", name: "Analytics dashboard v2", columnValues: { "col-person-1": { value: ["user-5"] }, "col-status-1": { value: 3 }, "col-priority-1": { value: 3 }, "col-date-1": { value: "2025-05-01" }, "col-timeline-1": { value: { start: "2025-03-15", end: "2025-05-01" } }, "col-numbers-1": { value: 12000 } }, subitemIds: [], isSelected: false, createdAt: "2025-01-05T09:00:00Z", updatedAt: "2025-01-05T09:00:00Z", creatorId: "user-1" },
      "item-7": { id: "item-7", boardId: "board-1", groupId: "group-2", name: "Performance optimization", columnValues: { "col-person-1": { value: ["user-3", "user-5"] }, "col-status-1": { value: 3 }, "col-priority-1": { value: 1 }, "col-date-1": { value: "2025-04-01" }, "col-timeline-1": { value: { start: "2025-03-01", end: "2025-04-01" } }, "col-numbers-1": { value: 6000 } }, subitemIds: [], isSelected: false, createdAt: "2025-01-05T09:00:00Z", updatedAt: "2025-01-05T09:00:00Z", creatorId: "user-1" },
      "item-8": { id: "item-8", boardId: "board-1", groupId: "group-3", name: "Setup CI/CD pipeline", columnValues: { "col-person-1": { value: ["user-3"] }, "col-status-1": { value: 0 }, "col-priority-1": { value: 1 }, "col-date-1": { value: "2024-12-20" }, "col-timeline-1": { value: { start: "2024-12-01", end: "2024-12-20" } }, "col-numbers-1": { value: 4000 } }, subitemIds: [], isSelected: false, createdAt: "2024-11-15T09:00:00Z", updatedAt: "2024-12-20T17:00:00Z", creatorId: "user-1" },
      "item-9": { id: "item-9", boardId: "board-1", groupId: "group-3", name: "Brand guidelines document", columnValues: { "col-person-1": { value: ["user-2"] }, "col-status-1": { value: 0 }, "col-priority-1": { value: 2 }, "col-date-1": { value: "2024-12-15" }, "col-timeline-1": { value: { start: "2024-11-20", end: "2024-12-15" } }, "col-numbers-1": { value: 2000 } }, subitemIds: [], isSelected: false, createdAt: "2024-11-10T09:00:00Z", updatedAt: "2024-12-15T14:00:00Z", creatorId: "user-1" },
      "item-10": { id: "item-10", boardId: "board-2", groupId: "group-4", name: "Fix login redirect bug", columnValues: { "col-person-2": { value: ["user-3"] }, "col-status-2": { value: 0 }, "col-priority-2": { value: 1 }, "col-date-2": { value: "2025-01-12" }, "col-text-1": { value: "Users redirected to 404 after login" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-06T09:00:00Z", updatedAt: "2025-01-12T10:00:00Z", creatorId: "user-3" },
      "item-11": { id: "item-11", boardId: "board-2", groupId: "group-4", name: "Add dark mode toggle", columnValues: { "col-person-2": { value: ["user-2"] }, "col-status-2": { value: 1 }, "col-priority-2": { value: 2 }, "col-date-2": { value: "2025-01-17" }, "col-text-1": { value: "User preference stored in localStorage" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-06T09:00:00Z", updatedAt: "2025-01-14T14:00:00Z", creatorId: "user-1" },
      "item-12": { id: "item-12", boardId: "board-2", groupId: "group-4", name: "Optimize image loading", columnValues: { "col-person-2": { value: ["user-5"] }, "col-status-2": { value: 2 }, "col-priority-2": { value: 0 }, "col-date-2": { value: "2025-01-15" }, "col-text-1": { value: "Waiting on CDN configuration" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-06T09:00:00Z", updatedAt: "2025-01-13T11:00:00Z", creatorId: "user-5" },
      "item-13": { id: "item-13", boardId: "board-2", groupId: "group-4", name: "Write unit tests for auth module", columnValues: { "col-person-2": { value: ["user-4"] }, "col-status-2": { value: 3 }, "col-priority-2": { value: 2 }, "col-date-2": { value: "2025-01-19" }, "col-text-1": { value: "Target 80% coverage" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-06T09:00:00Z", updatedAt: "2025-01-06T09:00:00Z", creatorId: "user-1" },
      "item-14": { id: "item-14", boardId: "board-2", groupId: "group-5", name: "Implement search feature", columnValues: { "col-person-2": { value: ["user-3"] }, "col-status-2": { value: 4 }, "col-priority-2": { value: 1 }, "col-date-2": { value: "2025-01-31" }, "col-text-1": { value: "Full-text search with Elasticsearch" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-10T09:00:00Z", updatedAt: "2025-01-10T09:00:00Z", creatorId: "user-1" },
      "item-15": { id: "item-15", boardId: "board-2", groupId: "group-5", name: "User profile page redesign", columnValues: { "col-person-2": { value: ["user-2"] }, "col-status-2": { value: 4 }, "col-priority-2": { value: 3 }, "col-date-2": { value: "2025-02-07" }, "col-text-1": { value: "Match new brand guidelines" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-10T09:00:00Z", updatedAt: "2025-01-10T09:00:00Z", creatorId: "user-1" },
      "item-16": { id: "item-16", boardId: "board-3", groupId: "group-6", name: "Dropdown menu not closing on outside click", columnValues: { "col-person-3": { value: ["user-5"] }, "col-status-3": { value: 1 }, "col-priority-3": { value: 2 }, "col-text-2": { value: "Dropdown stays open when clicking outside. Affects all dropdown components." }, "col-dropdown-1": { value: "Frontend" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-08T09:00:00Z", updatedAt: "2025-01-13T09:00:00Z", creatorId: "user-4" },
      "item-17": { id: "item-17", boardId: "board-3", groupId: "group-6", name: "API timeout on large data export", columnValues: { "col-person-3": { value: ["user-3"] }, "col-status-3": { value: 3 }, "col-priority-3": { value: 0 }, "col-text-2": { value: "Export fails with 504 timeout when dataset > 10k rows" }, "col-dropdown-1": { value: "API" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-12T09:00:00Z", updatedAt: "2025-01-12T09:00:00Z", creatorId: "user-3" },
      "item-18": { id: "item-18", boardId: "board-3", groupId: "group-6", name: "Date picker shows wrong month on first open", columnValues: { "col-person-3": { value: [] }, "col-status-3": { value: 3 }, "col-priority-3": { value: 3 }, "col-text-2": { value: "Reproducible on Safari and Firefox" }, "col-dropdown-1": { value: "Frontend" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-14T09:00:00Z", updatedAt: "2025-01-14T09:00:00Z", creatorId: "user-4" },
      "item-19": { id: "item-19", boardId: "board-3", groupId: "group-7", name: "Memory leak in WebSocket handler", columnValues: { "col-person-3": { value: ["user-3"] }, "col-status-3": { value: 0 }, "col-priority-3": { value: 0 }, "col-text-2": { value: "Fixed: Properly cleaning up event listeners on disconnect" }, "col-dropdown-1": { value: "Backend" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-03T09:00:00Z", updatedAt: "2025-01-10T14:00:00Z", creatorId: "user-3" },
      "item-20": { id: "item-20", boardId: "board-3", groupId: "group-7", name: "CSS grid layout breaking on mobile", columnValues: { "col-person-3": { value: ["user-2"] }, "col-status-3": { value: 0 }, "col-priority-3": { value: 2 }, "col-text-2": { value: "Added responsive breakpoints for mobile grid" }, "col-dropdown-1": { value: "Frontend" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-05T09:00:00Z", updatedAt: "2025-01-09T11:00:00Z", creatorId: "user-2" },
      "item-21": { id: "item-21", boardId: "board-4", groupId: "group-8", name: "Q1 Product Update Blog Post", columnValues: { "col-person-4": { value: ["user-6"] }, "col-status-4": { value: 1 }, "col-date-3": { value: "2025-01-20" }, "col-tags-1": { value: ["tag-blog"] }, "col-text-3": { value: "New features launched in Q1" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-02T09:00:00Z", updatedAt: "2025-01-14T10:00:00Z", creatorId: "user-6" },
      "item-22": { id: "item-22", boardId: "board-4", groupId: "group-8", name: "Social media campaign: New Year", columnValues: { "col-person-4": { value: ["user-4"] }, "col-status-4": { value: 0 }, "col-date-3": { value: "2025-01-05" }, "col-tags-1": { value: ["tag-social"] }, "col-text-3": { value: "New year, new features campaign" } }, subitemIds: [], isSelected: false, createdAt: "2024-12-20T09:00:00Z", updatedAt: "2025-01-05T16:00:00Z", creatorId: "user-6" },
      "item-23": { id: "item-23", boardId: "board-4", groupId: "group-8", name: "Customer success story video", columnValues: { "col-person-4": { value: ["user-6", "user-4"] }, "col-status-4": { value: 2 }, "col-date-3": { value: "2025-01-30" }, "col-tags-1": { value: ["tag-video", "tag-social"] }, "col-text-3": { value: "Interview with Acme Corp" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-03T09:00:00Z", updatedAt: "2025-01-10T09:00:00Z", creatorId: "user-6" },
      "item-24": { id: "item-24", boardId: "board-4", groupId: "group-9", name: "Monthly newsletter", columnValues: { "col-person-4": { value: ["user-6"] }, "col-status-4": { value: 3 }, "col-date-3": { value: "2025-02-01" }, "col-tags-1": { value: ["tag-email"] }, "col-text-3": { value: "February product highlights" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-10T09:00:00Z", updatedAt: "2025-01-10T09:00:00Z", creatorId: "user-6" },
      "item-25": { id: "item-25", boardId: "board-4", groupId: "group-9", name: "PR: Series B announcement", columnValues: { "col-person-4": { value: ["user-4", "user-6"] }, "col-status-4": { value: 3 }, "col-date-3": { value: "2025-02-15" }, "col-tags-1": { value: ["tag-pr", "tag-blog"] }, "col-text-3": { value: "Press release and blog post" } }, subitemIds: [], isSelected: false, createdAt: "2025-01-12T09:00:00Z", updatedAt: "2025-01-12T09:00:00Z", creatorId: "user-1" },
    },

    updates: {
      "update-1": { id: "update-1", itemId: "item-1", authorId: "user-2", body: "Just finished the hero section. Moving to the features section next. Design system is looking great!", createdAt: "2025-01-10T14:30:00Z", likes: ["user-1"], isReply: false, parentUpdateId: null },
      "update-2": { id: "update-2", itemId: "item-1", authorId: "user-1", body: "Looks amazing! Can we also add the testimonials section this week?", createdAt: "2025-01-10T15:00:00Z", likes: [], isReply: true, parentUpdateId: "update-1" },
      "update-3": { id: "update-3", itemId: "item-4", authorId: "user-3", body: "Blocked on this \u2014 need access to the production database credentials. @Sarah can you grant access?", createdAt: "2025-01-14T10:00:00Z", likes: [], isReply: false, parentUpdateId: null },
      "update-4": { id: "update-4", itemId: "item-4", authorId: "user-1", body: "Done! Credentials shared via 1Password. Let me know if you need anything else.", createdAt: "2025-01-14T10:30:00Z", likes: ["user-3"], isReply: true, parentUpdateId: "update-3" },
      "update-5": { id: "update-5", itemId: "item-12", authorId: "user-5", body: "CDN team says the new configuration will be ready by Thursday. Will resume once it's live.", createdAt: "2025-01-13T11:00:00Z", likes: [], isReply: false, parentUpdateId: null },
      "update-6": { id: "update-6", itemId: "item-2", authorId: "user-3", body: "Auth endpoints done. Starting on the data endpoints now. Swagger docs are updated.", createdAt: "2025-01-12T11:00:00Z", likes: ["user-1", "user-5"], isReply: false, parentUpdateId: null },
    },

    notifications: [
      { id: "notif-1", type: "mention", message: "Mike Roberts mentioned you in \"Database migration\"", userId: "user-1", actorId: "user-3", itemId: "item-4", boardId: "board-1", isRead: false, createdAt: "2025-01-14T10:00:00Z" },
      { id: "notif-2", type: "status_change", message: "Alex Chen changed status to \"Done\" on \"Fix login redirect bug\"", userId: "user-1", actorId: "user-3", itemId: "item-10", boardId: "board-2", isRead: false, createdAt: "2025-01-12T10:00:00Z" },
      { id: "notif-3", type: "assignment", message: "You were assigned to \"User testing phase 1\"", userId: "user-1", actorId: "user-1", itemId: "item-3", boardId: "board-1", isRead: true, createdAt: "2025-01-08T14:00:00Z" },
      { id: "notif-4", type: "update", message: "Alex Chen commented on \"Design landing page\"", userId: "user-1", actorId: "user-2", itemId: "item-1", boardId: "board-1", isRead: true, createdAt: "2025-01-10T14:30:00Z" },
    ],

    activityLog: [
      { id: "activity-1", boardId: "board-1", itemId: "item-4", userId: "user-3", columnId: "col-status-1", action: "column_change", previousValue: { value: 1 }, newValue: { value: 2 }, createdAt: "2025-01-14T15:00:00Z" },
      { id: "activity-2", boardId: "board-2", itemId: "item-10", userId: "user-3", columnId: "col-status-2", action: "column_change", previousValue: { value: 1 }, newValue: { value: 0 }, createdAt: "2025-01-12T10:00:00Z" },
      { id: "activity-3", boardId: "board-1", itemId: "item-1", userId: "user-2", columnId: "col-status-1", action: "column_change", previousValue: { value: 3 }, newValue: { value: 1 }, createdAt: "2025-01-10T09:00:00Z" },
    ],

    ui: {
      sidebarCollapsed: false,
      activeBoardId: "board-1",
      activeViewId: "view-1",
      selectedItemIds: [],
      searchQuery: "",
      filterConditions: [],
      sortConditions: [],
      itemDetailOpenId: null,
      notificationsPanelOpen: false,
    },
  };
}

export function initializeData(sid = null, customState = null) {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const defaults = createInitialData();
    const merged = { ...defaults, ...customState };
    localStorage.setItem(sk, JSON.stringify(merged));
    localStorage.setItem(ik, JSON.stringify(merged));
    syncInitialState(merged, sid);
    return merged;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    syncInitialState(JSON.parse(localStorage.getItem(ik) || stored), sid);
    return JSON.parse(stored);
  }

  const data = createInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  syncInitialState(data, sid);
  return data;
}

let _syncTimer = null;

export function saveState(state, sid = null) {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
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
}

export function getInitialState(sid = null) {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
}
