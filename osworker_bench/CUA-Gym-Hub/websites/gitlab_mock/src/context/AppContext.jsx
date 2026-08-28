import { createContext, useContext, useReducer, useEffect } from 'react';
import { createInitialData, saveState, loadState } from '../utils/dataManager';

export const ACTIONS = {
  INIT: 'INIT',
  RESET: 'RESET',
  CREATE_PROJECT: 'CREATE_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  STAR_PROJECT: 'STAR_PROJECT',
  FORK_PROJECT: 'FORK_PROJECT',
  CREATE_ISSUE: 'CREATE_ISSUE',
  UPDATE_ISSUE: 'UPDATE_ISSUE',
  CLOSE_ISSUE: 'CLOSE_ISSUE',
  REOPEN_ISSUE: 'REOPEN_ISSUE',
  DELETE_ISSUE: 'DELETE_ISSUE',
  ADD_ISSUE_COMMENT: 'ADD_ISSUE_COMMENT',
  UPDATE_ISSUE_COMMENT: 'UPDATE_ISSUE_COMMENT',
  DELETE_ISSUE_COMMENT: 'DELETE_ISSUE_COMMENT',
  CREATE_MERGE_REQUEST: 'CREATE_MERGE_REQUEST',
  UPDATE_MERGE_REQUEST: 'UPDATE_MERGE_REQUEST',
  MERGE_MR: 'MERGE_MR',
  CLOSE_MR: 'CLOSE_MR',
  REOPEN_MR: 'REOPEN_MR',
  ADD_MR_COMMENT: 'ADD_MR_COMMENT',
  UPDATE_MR_COMMENT: 'UPDATE_MR_COMMENT',
  DELETE_MR_COMMENT: 'DELETE_MR_COMMENT',
  CREATE_LABEL: 'CREATE_LABEL',
  UPDATE_LABEL: 'UPDATE_LABEL',
  DELETE_LABEL: 'DELETE_LABEL',
  CREATE_MILESTONE: 'CREATE_MILESTONE',
  UPDATE_MILESTONE: 'UPDATE_MILESTONE',
  CLOSE_MILESTONE: 'CLOSE_MILESTONE',
  CREATE_BRANCH: 'CREATE_BRANCH',
  DELETE_BRANCH: 'DELETE_BRANCH',
  CREATE_WIKI_PAGE: 'CREATE_WIKI_PAGE',
  UPDATE_WIKI_PAGE: 'UPDATE_WIKI_PAGE',
  DELETE_WIKI_PAGE: 'DELETE_WIKI_PAGE',
  CREATE_SNIPPET: 'CREATE_SNIPPET',
  UPDATE_SNIPPET: 'UPDATE_SNIPPET',
  DELETE_SNIPPET: 'DELETE_SNIPPET',
  ADD_MEMBER: 'ADD_MEMBER',
  UPDATE_MEMBER_ROLE: 'UPDATE_MEMBER_ROLE',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
  MARK_TODO_DONE: 'MARK_TODO_DONE',
  MARK_ALL_TODOS_DONE: 'MARK_ALL_TODOS_DONE',
  MOVE_BOARD_ISSUE: 'MOVE_BOARD_ISSUE',
  UPDATE_FILE: 'UPDATE_FILE',
  UPDATE_PROJECT_SETTINGS: 'UPDATE_PROJECT_SETTINGS',
  CREATE_TAG: 'CREATE_TAG',
  CREATE_RELEASE: 'CREATE_RELEASE',
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.INIT:
      return action.payload;
    case ACTIONS.RESET:
      return createInitialData();
    case ACTIONS.STAR_PROJECT:
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, isStarred: !p.isStarred, stars: p.isStarred ? p.stars - 1 : p.stars + 1 }
            : p
        )
      };
    case ACTIONS.CREATE_PROJECT:
      return { ...state, projects: [...state.projects, action.payload] };
    case ACTIONS.UPDATE_PROJECT:
      return { ...state, projects: state.projects.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p) };
    case ACTIONS.DELETE_PROJECT:
      return { ...state, projects: state.projects.filter(p => p.id !== action.payload.projectId) };
    case ACTIONS.FORK_PROJECT: {
      const orig = state.projects.find(p => p.id === action.payload.projectId);
      if (!orig) return state;
      const forked = {
        ...orig,
        id: `p${Date.now()}`,
        name: `${orig.name}-forked`,
        fullPath: `${state.currentUser.username}/${orig.name}-forked`,
        forkedFrom: orig.id,
        stars: 0,
        forks: 0,
        isStarred: false,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        projects: state.projects.map(p => p.id === orig.id ? { ...p, forks: (p.forks || 0) + 1 } : p).concat(forked)
      };
    }
    case ACTIONS.CREATE_ISSUE: {
      const newIssue = { ...action.payload, id: `i${Date.now()}`, iid: (state.issues.filter(i => i.projectId === action.payload.projectId).length + 1), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), commentCount: 0 };
      return { ...state, issues: [...state.issues, newIssue] };
    }
    case ACTIONS.UPDATE_ISSUE:
      return { ...state, issues: state.issues.map(i => i.id === (action.payload.issueId || action.payload.id) ? { ...i, ...action.payload, id: i.id, updatedAt: new Date().toISOString() } : i) };
    case ACTIONS.CLOSE_ISSUE:
      return { ...state, issues: state.issues.map(i => i.id === action.payload.issueId ? { ...i, state: 'closed', updatedAt: new Date().toISOString() } : i) };
    case ACTIONS.REOPEN_ISSUE:
      return { ...state, issues: state.issues.map(i => i.id === action.payload.issueId ? { ...i, state: 'opened', updatedAt: new Date().toISOString() } : i) };
    case ACTIONS.DELETE_ISSUE:
      return { ...state, issues: state.issues.filter(i => i.id !== action.payload.issueId), issueComments: state.issueComments.filter(c => c.issueId !== action.payload.issueId) };
    case ACTIONS.ADD_ISSUE_COMMENT: {
      const comment = { ...action.payload, id: `ic${Date.now()}`, createdAt: new Date().toISOString() };
      return {
        ...state,
        issueComments: [...state.issueComments, comment],
        issues: state.issues.map(i => i.id === action.payload.issueId ? { ...i, commentCount: (i.commentCount || 0) + 1 } : i)
      };
    }
    case ACTIONS.DELETE_ISSUE_COMMENT:
      return { ...state, issueComments: state.issueComments.filter(c => c.id !== action.payload.commentId) };
    case ACTIONS.UPDATE_ISSUE_COMMENT:
      return { ...state, issueComments: state.issueComments.map(c => c.id === action.payload.commentId ? { ...c, body: action.payload.body, updatedAt: new Date().toISOString() } : c) };
    case ACTIONS.CREATE_MERGE_REQUEST: {
      const newMR = { ...action.payload, id: `mr${Date.now()}`, iid: (state.mergeRequests.filter(m => m.projectId === action.payload.projectId).length + 1), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      return { ...state, mergeRequests: [...state.mergeRequests, newMR] };
    }
    case ACTIONS.UPDATE_MERGE_REQUEST:
      return { ...state, mergeRequests: state.mergeRequests.map(m => m.id === (action.payload.mrId || action.payload.id) ? { ...m, ...action.payload, id: m.id, updatedAt: new Date().toISOString() } : m) };
    case ACTIONS.MERGE_MR:
      return { ...state, mergeRequests: state.mergeRequests.map(m => m.id === action.payload.mrId ? { ...m, state: 'merged', mergedAt: new Date().toISOString(), mergedBy: action.payload.userId, updatedAt: new Date().toISOString() } : m) };
    case ACTIONS.CLOSE_MR:
      return { ...state, mergeRequests: state.mergeRequests.map(m => m.id === action.payload.mrId ? { ...m, state: 'closed', updatedAt: new Date().toISOString() } : m) };
    case ACTIONS.REOPEN_MR:
      return { ...state, mergeRequests: state.mergeRequests.map(m => m.id === action.payload.mrId ? { ...m, state: 'opened', updatedAt: new Date().toISOString() } : m) };
    case ACTIONS.ADD_MR_COMMENT: {
      const c = { ...action.payload, id: `mrc${Date.now()}`, createdAt: new Date().toISOString() };
      return { ...state, mrComments: [...state.mrComments, c] };
    }
    case ACTIONS.UPDATE_MR_COMMENT:
      return { ...state, mrComments: state.mrComments.map(c => c.id === action.payload.commentId ? { ...c, body: action.payload.body, updatedAt: new Date().toISOString() } : c) };
    case ACTIONS.DELETE_MR_COMMENT:
      return { ...state, mrComments: state.mrComments.filter(c => c.id !== action.payload.commentId) };
    case ACTIONS.CREATE_LABEL: {
      const label = { ...action.payload, id: `l${Date.now()}` };
      return { ...state, labels: [...state.labels, label] };
    }
    case ACTIONS.UPDATE_LABEL:
      return { ...state, labels: state.labels.map(l => l.id === action.payload.id ? { ...l, ...action.payload } : l) };
    case ACTIONS.DELETE_LABEL:
      return { ...state, labels: state.labels.filter(l => l.id !== action.payload.labelId) };
    case ACTIONS.CREATE_MILESTONE: {
      const ms = { ...action.payload, id: `m${Date.now()}`, createdAt: new Date().toISOString() };
      return { ...state, milestones: [...state.milestones, ms] };
    }
    case ACTIONS.UPDATE_MILESTONE:
      return { ...state, milestones: state.milestones.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m) };
    case ACTIONS.CLOSE_MILESTONE:
      return { ...state, milestones: state.milestones.map(m => m.id === action.payload.milestoneId ? { ...m, status: 'closed' } : m) };
    case ACTIONS.CREATE_BRANCH: {
      const br = { ...action.payload, id: `br${Date.now()}`, createdAt: new Date().toISOString() };
      return { ...state, branches: [...state.branches, br] };
    }
    case ACTIONS.DELETE_BRANCH:
      return { ...state, branches: state.branches.filter(b => b.id !== action.payload.branchId) };
    case ACTIONS.CREATE_WIKI_PAGE: {
      const wp = { ...action.payload, id: `w${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      return { ...state, wikiPages: [...state.wikiPages, wp] };
    }
    case ACTIONS.UPDATE_WIKI_PAGE:
      return { ...state, wikiPages: state.wikiPages.map(w => w.id === action.payload.id ? { ...w, ...action.payload, updatedAt: new Date().toISOString() } : w) };
    case ACTIONS.DELETE_WIKI_PAGE:
      return { ...state, wikiPages: state.wikiPages.filter(w => w.id !== action.payload.pageId) };
    case ACTIONS.CREATE_SNIPPET: {
      const sn = { ...action.payload, id: action.payload.id || `sn${Date.now()}`, createdAt: action.payload.createdAt || new Date().toISOString() };
      return { ...state, snippets: [...state.snippets, sn] };
    }
    case ACTIONS.UPDATE_SNIPPET:
      return { ...state, snippets: state.snippets.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s) };
    case ACTIONS.DELETE_SNIPPET:
      return { ...state, snippets: state.snippets.filter(s => s.id !== action.payload.snippetId) };
    case ACTIONS.ADD_MEMBER: {
      const mem = { ...action.payload, id: `mem${Date.now()}`, createdAt: new Date().toISOString() };
      return { ...state, members: [...state.members, mem] };
    }
    case ACTIONS.UPDATE_MEMBER_ROLE:
      return { ...state, members: state.members.map(m => m.id === action.payload.memberId ? { ...m, role: action.payload.role } : m) };
    case ACTIONS.REMOVE_MEMBER:
      return { ...state, members: state.members.filter(m => m.id !== action.payload.memberId) };
    case ACTIONS.MARK_TODO_DONE:
      return { ...state, todos: state.todos.map(t => t.id === action.payload.todoId ? { ...t, isDone: true } : t) };
    case ACTIONS.MARK_ALL_TODOS_DONE:
      return { ...state, todos: state.todos.map(t => ({ ...t, isDone: true })) };
    case ACTIONS.MOVE_BOARD_ISSUE: {
      const { issueId, fromListId, toListId } = action.payload;
      return {
        ...state,
        boards: state.boards.map(board => ({
          ...board,
          lists: board.lists.map(list => {
            if (list.id === fromListId) return { ...list, issueIds: list.issueIds.filter(id => id !== issueId) };
            if (list.id === toListId) return { ...list, issueIds: [...list.issueIds, issueId] };
            return list;
          })
        }))
      };
    }
    case ACTIONS.UPDATE_FILE:
      return { ...state, files: state.files.map(f => f.path === action.payload.path ? { ...f, content: action.payload.content } : f) };
    case ACTIONS.UPDATE_PROJECT_SETTINGS:
      return { ...state, projects: state.projects.map(p => p.id === action.payload.projectId ? { ...p, ...action.payload.settings } : p) };
    case ACTIONS.CREATE_TAG: {
      const tag = { ...action.payload, id: `tag${Date.now()}`, createdAt: new Date().toISOString() };
      return { ...state, tags: [...state.tags, tag] };
    }
    case ACTIONS.CREATE_RELEASE: {
      const release = { ...action.payload, id: `rel${Date.now()}`, createdAt: new Date().toISOString() };
      return { ...state, releases: [...state.releases, release] };
    }
    case ACTIONS.UPDATE_USER_PROFILE:
      return { ...state, currentUser: { ...state.currentUser, ...action.payload }, users: state.users.map(u => u.id === state.currentUser.id ? { ...u, ...action.payload } : u) };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const saved = loadState();
    return saved || createInitialData();
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
