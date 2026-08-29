const BASE_KEY = 'lucidchart_mock_state';
const BASE_INITIAL_KEY = 'lucidchart_mock_initialState';

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
      if (data.has_custom_state && data.stored_state) {
        return data.stored_state;
      }
    }
  } catch (e) {
    console.log('No custom state available');
  }
  return null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const k in custom) {
    if (custom[k] === null || custom[k] === undefined) continue;
    if (typeof custom[k] === 'object' && !Array.isArray(custom[k]) && typeof defaults[k] === 'object' && !Array.isArray(defaults[k])) {
      result[k] = deepMergeWithDefaults(defaults[k], custom[k]);
    } else {
      result[k] = custom[k];
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = { ...createInitialData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  const data = createInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

let _syncTimer = null;

export const saveState = (state, sid = null) => {
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
};

export const getSavedInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

export function createInitialData() {
  return {
    currentUser: {
      id: "user-1",
      name: "Alex Johnson",
      email: "alex.johnson@company.com",
      avatar: "AJ",
      avatarColor: "#4A86C8"
    },
    users: [
      { id: "user-2", name: "Sarah Smith", email: "sarah.smith@company.com", avatar: "SS", avatarColor: "#E74C3C" },
      { id: "user-3", name: "Mike Chen", email: "mike.chen@company.com", avatar: "MC", avatarColor: "#2ECC71" },
      { id: "user-4", name: "Emily Davis", email: "emily.davis@company.com", avatar: "ED", avatarColor: "#9B59B6" }
    ],
    folders: [
      { id: "folder-root", name: "My Documents", parentId: null, type: "my_documents", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-03-08T00:00:00Z" },
      { id: "folder-shared", name: "Shared with Me", parentId: null, type: "shared", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-03-08T00:00:00Z" },
      { id: "folder-team", name: "Team Folders", parentId: null, type: "team", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-03-08T00:00:00Z" },
      { id: "folder-trash", name: "Trash", parentId: null, type: "trash", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-03-08T00:00:00Z" },
      { id: "folder-1", name: "Marketing Diagrams", parentId: "folder-root", type: "my_documents", createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-03-01T14:30:00Z" },
      { id: "folder-2", name: "Engineering", parentId: "folder-root", type: "my_documents", createdAt: "2025-01-20T09:00:00Z", updatedAt: "2025-03-05T16:00:00Z" },
      { id: "folder-3", name: "Q1 Planning", parentId: "folder-team", type: "team", createdAt: "2025-02-01T10:00:00Z", updatedAt: "2025-03-06T17:00:00Z" }
    ],
    documents: [
      {
        id: "doc-1",
        title: "Sales Process Flowchart",
        folderId: "folder-root",
        ownerId: "user-1",
        starred: true,
        status: "draft",
        thumbnailUrl: null,
        createdAt: "2025-01-15T10:00:00Z",
        updatedAt: "2025-03-05T16:45:00Z",
        lastOpenedAt: "2025-03-08T11:00:00Z",
        sharedWith: [
          { userId: "user-2", permission: "edit" },
          { userId: "user-3", permission: "view" }
        ],
        pageOrder: ["page-1", "page-2"]
      },
      {
        id: "doc-2",
        title: "System Architecture",
        folderId: "folder-2",
        ownerId: "user-1",
        starred: false,
        status: "published",
        thumbnailUrl: null,
        createdAt: "2025-02-01T09:00:00Z",
        updatedAt: "2025-02-28T12:00:00Z",
        lastOpenedAt: "2025-03-07T15:30:00Z",
        sharedWith: [{ userId: "user-3", permission: "edit" }],
        pageOrder: ["page-3"]
      },
      {
        id: "doc-3",
        title: "Org Chart by Department",
        folderId: "folder-root",
        ownerId: "user-1",
        starred: true,
        status: "draft",
        thumbnailUrl: null,
        createdAt: "2025-02-10T14:00:00Z",
        updatedAt: "2025-03-04T10:20:00Z",
        lastOpenedAt: "2025-03-06T09:00:00Z",
        sharedWith: [],
        pageOrder: ["page-4"]
      },
      {
        id: "doc-4",
        title: "User Registration Flow",
        folderId: "folder-1",
        ownerId: "user-1",
        starred: false,
        status: "draft",
        thumbnailUrl: null,
        createdAt: "2025-01-20T11:00:00Z",
        updatedAt: "2025-02-15T08:30:00Z",
        lastOpenedAt: "2025-03-02T14:00:00Z",
        sharedWith: [{ userId: "user-4", permission: "edit" }],
        pageOrder: ["page-5"]
      },
      {
        id: "doc-5",
        title: "Database ER Diagram",
        folderId: "folder-2",
        ownerId: "user-1",
        starred: false,
        status: "published",
        thumbnailUrl: null,
        createdAt: "2025-02-05T16:00:00Z",
        updatedAt: "2025-03-01T11:00:00Z",
        lastOpenedAt: "2025-03-01T11:00:00Z",
        sharedWith: [{ userId: "user-2", permission: "view" }],
        pageOrder: ["page-6"]
      },
      {
        id: "doc-6",
        title: "Sprint Planning Mind Map",
        folderId: "folder-3",
        ownerId: "user-3",
        starred: false,
        status: "draft",
        thumbnailUrl: null,
        createdAt: "2025-02-20T09:30:00Z",
        updatedAt: "2025-03-06T17:00:00Z",
        lastOpenedAt: "2025-03-06T17:00:00Z",
        sharedWith: [{ userId: "user-1", permission: "edit" }],
        pageOrder: ["page-7"]
      },
      {
        id: "doc-7",
        title: "Customer Journey Map",
        folderId: "folder-1",
        ownerId: "user-1",
        starred: false,
        status: "draft",
        thumbnailUrl: null,
        createdAt: "2025-03-01T10:00:00Z",
        updatedAt: "2025-03-07T13:00:00Z",
        lastOpenedAt: "2025-03-07T13:00:00Z",
        sharedWith: [],
        pageOrder: ["page-8"]
      },
      {
        id: "doc-8",
        title: "Network Infrastructure",
        folderId: "folder-2",
        ownerId: "user-2",
        starred: false,
        status: "published",
        thumbnailUrl: null,
        createdAt: "2025-01-10T08:00:00Z",
        updatedAt: "2025-02-20T16:00:00Z",
        lastOpenedAt: "2025-02-20T16:00:00Z",
        sharedWith: [{ userId: "user-1", permission: "view" }],
        pageOrder: ["page-9"]
      },
      {
        id: "doc-blank",
        title: "Blank Diagram",
        folderId: "folder-root",
        ownerId: "user-1",
        starred: true,
        status: "draft",
        thumbnailUrl: null,
        createdAt: "2025-03-08T09:00:00Z",
        updatedAt: "2025-03-08T09:00:00Z",
        lastOpenedAt: "2025-03-08T09:00:00Z",
        sharedWith: [],
        pageOrder: ["page-blank"]
      }
    ],
    pages: [
      { id: "page-1", documentId: "doc-1", name: "Page 1", order: 0, width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-2", documentId: "doc-1", name: "Page 2", order: 1, width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-3", documentId: "doc-2", name: "Page 1", order: 0, width: 1600, height: 1200, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-4", documentId: "doc-3", name: "Page 1", order: 0, width: 1400, height: 800, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-5", documentId: "doc-4", name: "Page 1", order: 0, width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-6", documentId: "doc-5", name: "Page 1", order: 0, width: 1400, height: 1000, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-7", documentId: "doc-6", name: "Page 1", order: 0, width: 1600, height: 1200, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-8", documentId: "doc-7", name: "Page 1", order: 0, width: 1800, height: 600, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-9", documentId: "doc-8", name: "Page 1", order: 0, width: 1400, height: 1000, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" },
      { id: "page-blank", documentId: "doc-blank", name: "Page 1", order: 0, width: 1200, height: 900, gridVisible: true, gridSize: 20, backgroundColor: "#FFFFFF" }
    ],
    shapes: [
      { id: "shape-1", pageId: "page-1", type: "terminator", category: "flowchart", x: 460, y: 40, width: 160, height: 60, rotation: 0, text: "Start", fontSize: 14, fontFamily: "Liberation Sans", fontWeight: "bold", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#E8F5E9", borderColor: "#4CAF50", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 1, groupId: null },
      { id: "shape-2", pageId: "page-1", type: "process", category: "flowchart", x: 440, y: 160, width: 200, height: 70, rotation: 0, text: "Customer\npurchase order", fontSize: 13, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 2, groupId: null },
      { id: "shape-3", pageId: "page-1", type: "process", category: "flowchart", x: 440, y: 290, width: 200, height: 70, rotation: 0, text: "Sales order", fontSize: 13, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 3, groupId: null },
      { id: "shape-4", pageId: "page-1", type: "decision", category: "flowchart", x: 440, y: 420, width: 200, height: 120, rotation: 0, text: "POP decision:\npick, order, or\nproduce?", fontSize: 12, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 4, groupId: null },
      { id: "shape-5", pageId: "page-1", type: "process", category: "flowchart", x: 140, y: 440, width: 160, height: 60, rotation: 0, text: "Create\n\"pick ticket\"", fontSize: 12, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 5, groupId: null },
      { id: "shape-6", pageId: "page-1", type: "process", category: "flowchart", x: 700, y: 440, width: 160, height: 60, rotation: 0, text: "Determine\nquantity", fontSize: 12, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 6, groupId: null },
      { id: "shape-7", pageId: "page-1", type: "process", category: "flowchart", x: 880, y: 440, width: 140, height: 60, rotation: 0, text: "Ship to\ncustomer", fontSize: 12, fontFamily: "Liberation Sans", fontWeight: "normal", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFFFFF", borderColor: "#333333", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 7, groupId: null },
      { id: "shape-8", pageId: "page-1", type: "terminator", category: "flowchart", x: 460, y: 660, width: 160, height: 60, rotation: 0, text: "End", fontSize: 14, fontFamily: "Liberation Sans", fontWeight: "bold", fontStyle: "normal", textAlign: "center", textColor: "#333333", fillColor: "#FFEBEE", borderColor: "#F44336", borderWidth: 2, borderStyle: "solid", opacity: 1, locked: false, visible: true, zIndex: 8, groupId: null }
    ],
    connectors: [
      { id: "conn-1", pageId: "page-1", sourceShapeId: "shape-1", sourcePoint: "bottom", targetShapeId: "shape-2", targetPoint: "top", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-2", pageId: "page-1", sourceShapeId: "shape-2", sourcePoint: "bottom", targetShapeId: "shape-3", targetPoint: "top", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-3", pageId: "page-1", sourceShapeId: "shape-3", sourcePoint: "bottom", targetShapeId: "shape-4", targetPoint: "top", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-4", pageId: "page-1", sourceShapeId: "shape-4", sourcePoint: "left", targetShapeId: "shape-5", targetPoint: "right", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "Pick", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-5", pageId: "page-1", sourceShapeId: "shape-4", sourcePoint: "right", targetShapeId: "shape-6", targetPoint: "left", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "Produce", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-6", pageId: "page-1", sourceShapeId: "shape-6", sourcePoint: "right", targetShapeId: "shape-7", targetPoint: "left", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 },
      { id: "conn-7", pageId: "page-1", sourceShapeId: "shape-4", sourcePoint: "bottom", targetShapeId: "shape-8", targetPoint: "top", waypoints: [], lineStyle: "solid", lineWidth: 2, lineColor: "#333333", sourceArrow: "none", targetArrow: "arrow", label: "Order", labelPosition: 0.5, routingType: "orthogonal", zIndex: 0 }
    ],
    comments: [
      {
        id: "comment-1", pageId: "page-1", shapeId: "shape-4", x: null, y: null,
        authorId: "user-2", authorName: "Sarah Smith",
        text: "Can this be larger if we need to add more conditions?",
        resolved: false, createdAt: "2025-03-05T10:30:00Z",
        replies: [
          { id: "reply-1", authorId: "user-1", authorName: "Alex Johnson", text: "Yes, we can make the decision diamond bigger. Will update.", createdAt: "2025-03-05T11:00:00Z" }
        ]
      },
      {
        id: "comment-2", pageId: "page-1", shapeId: "shape-7", x: null, y: null,
        authorId: "user-3", authorName: "Mike Chen",
        text: "Should we add a 'verify address' step before shipping?",
        resolved: false, createdAt: "2025-03-06T14:20:00Z",
        replies: []
      },
      {
        id: "comment-3", pageId: "page-1", shapeId: "shape-2", x: null, y: null,
        authorId: "user-2", authorName: "Sarah Smith",
        text: "This step needs more detail about validation checks.",
        resolved: true, createdAt: "2025-03-04T09:15:00Z",
        replies: [
          { id: "reply-2", authorId: "user-1", authorName: "Alex Johnson", text: "Done - added a sub-process on Page 2.", createdAt: "2025-03-04T10:00:00Z" }
        ]
      }
    ],
    templates: [
      { id: "template-blank", name: "Blank", category: "general", icon: "blank", description: "Start with an empty canvas" },
      { id: "template-flowchart", name: "Flowchart", category: "flowchart", icon: "flowchart", description: "Basic flowchart with start/end and decision" },
      { id: "template-org-chart", name: "Org Chart", category: "org", icon: "org-chart", description: "Organizational hierarchy chart" },
      { id: "template-mind-map", name: "Mind Map", category: "brainstorm", icon: "mind-map", description: "Radial mind mapping layout" },
      { id: "template-education", name: "Education", category: "education", icon: "education", description: "Educational diagram layout" },
      { id: "template-business", name: "Business Analysis", category: "business", icon: "business", description: "Business process analysis template" }
    ],
    ui: {
      activeFolderId: "folder-root",
      activeDocumentId: null,
      activePageId: null,
      selectedShapeIds: [],
      dashboardViewMode: "grid",
      dashboardSearchQuery: "",
      rightPanelTab: null,
      zoomLevel: 100,
      shapePanelSearchQuery: "",
      shapePanelSections: {
        shapesInUse: true,
        standard: true,
        flowchart: true,
        shapes: true
      }
    }
  };
}
