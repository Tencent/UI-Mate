import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react'
import { createInitialData } from '../utils/dataManager'
import { deepDiff, cloneDeep } from '../utils/helpers'

function getSessionId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('sid') || null
}

function storageKey(sid) {
  return sid ? `sentry_mock_state_${sid}` : 'sentry_mock_state'
}

function getStoredState(sid) {
  try {
    const raw = localStorage.getItem(storageKey(sid))
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

async function fetchCustomState(sid) {
  if (!sid) return null
  try {
    const response = await fetch(`/state?sid=${encodeURIComponent(sid)}`)
    if (!response.ok) return null
    const data = await response.json()
    return data.has_custom_state ? data.stored_state : null
  } catch {
    return null
  }
}

let _syncTimer = null
function saveState(state, sid) {
  try {
    localStorage.setItem(storageKey(sid), JSON.stringify(state))
  } catch {}
  if (sid) {
    clearTimeout(_syncTimer)
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {})
    }, 300)
  }
}

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload }

    case 'SET_ISSUE_STATUS': {
      const issues = state.issues.map(issue =>
        issue.id === action.issueId ? { ...issue, status: action.status } : issue
      )
      return { ...state, issues }
    }

    case 'SET_ISSUE_ASSIGNEE': {
      const issues = state.issues.map(issue =>
        issue.id === action.issueId ? { ...issue, assignee: action.assignee } : issue
      )
      return { ...state, issues }
    }

    case 'SET_ISSUE_PRIORITY': {
      const issues = state.issues.map(issue =>
        issue.id === action.issueId ? { ...issue, priority: action.priority } : issue
      )
      return { ...state, issues }
    }

    case 'RESOLVE_ISSUE': {
      const issues = state.issues.map(issue =>
        issue.id === action.issueId ? { ...issue, status: 'resolved' } : issue
      )
      return { ...state, issues }
    }

    case 'UNRESOLVE_ISSUE': {
      const issues = state.issues.map(issue =>
        issue.id === action.issueId ? { ...issue, status: 'unresolved' } : issue
      )
      return { ...state, issues }
    }

    case 'ARCHIVE_ISSUE': {
      const issues = state.issues.map(issue =>
        issue.id === action.issueId ? { ...issue, status: 'archived' } : issue
      )
      return { ...state, issues }
    }

    case 'TOGGLE_BOOKMARK': {
      const bookmarked = state.bookmarkedIssues || []
      const already = bookmarked.includes(action.issueId)
      return {
        ...state,
        bookmarkedIssues: already
          ? bookmarked.filter(id => id !== action.issueId)
          : [...bookmarked, action.issueId]
      }
    }

    case 'ADD_COMMENT': {
      const comments = { ...(state.comments || {}) }
      const issueComments = [...(comments[action.issueId] || [])]
      issueComments.push({
        id: `comment-${Date.now()}`,
        author: state.currentUser?.name || 'Jane Schmidt',
        text: action.text,
        timestamp: new Date().toISOString(),
        type: 'comment'
      })
      comments[action.issueId] = issueComments
      return { ...state, comments }
    }

    case 'TOGGLE_SUBSCRIBE': {
      const subscribed = state.subscribedIssues || []
      const already = subscribed.includes(action.issueId)
      return {
        ...state,
        subscribedIssues: already
          ? subscribed.filter(id => id !== action.issueId)
          : [...subscribed, action.issueId]
      }
    }

    case 'ADD_ALERT_RULE':
      return { ...state, alertRules: [action.alertRule, ...(state.alertRules || [])] }

    case 'ADD_DASHBOARD':
      return { ...state, dashboards: [action.dashboard, ...(state.dashboards || [])] }

    case 'UPDATE_DASHBOARD': {
      const dashboards = (state.dashboards || []).map(dashboard =>
        dashboard.id === action.dashboard.id ? { ...dashboard, ...action.dashboard } : dashboard
      )
      return { ...state, dashboards }
    }

    case 'UPDATE_ORGANIZATION_SETTINGS':
      return {
        ...state,
        organization: { ...(state.organization || {}), name: action.name },
        settings: {
          ...(state.settings || {}),
          timezone: action.timezone,
          defaultRole: action.defaultRole,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'TOGGLE_INTEGRATION': {
      const installed = state.installedIntegrations || ['GitHub', 'Jira', 'Slack', 'Vercel']
      const exists = installed.includes(action.name)
      return { ...state, installedIntegrations: exists ? installed.filter(n => n !== action.name) : [...installed, action.name] }
    }

    case 'TOGGLE_NOTIFICATION_RULE': {
      const rules = state.notificationRules || {}
      return { ...state, notificationRules: { ...rules, [action.label]: !rules[action.label] } }
    }

    case 'SAVE_DISCOVER_QUERY':
      return { ...state, discoverSavedQueries: [action.query, ...(state.discoverSavedQueries || [])] }

    case 'SAVE_ISSUE_VIEW':
      return { ...state, issueSavedViews: [action.view, ...(state.issueSavedViews || [])] }

    case 'SET_SORT':
      return { ...state, issueListSort: action.sort }

    case 'SET_TAB':
      return { ...state, issueListTab: action.tab }

    case 'SET_SEARCH':
      return { ...state, issueSearchQuery: action.query }

    case 'SET_SELECTED_ISSUES':
      return { ...state, selectedIssues: action.ids }

    case 'SET_PROJECT_FILTER':
      return { ...state, selectedProject: action.project }

    case 'SET_ENV_FILTER':
      return { ...state, selectedEnvironment: action.environment }

    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.range }

    case 'BULK_RESOLVE': {
      const issues = state.issues.map(issue =>
        action.ids.includes(issue.id) ? { ...issue, status: 'resolved' } : issue
      )
      return { ...state, issues, selectedIssues: [] }
    }

    case 'BULK_ARCHIVE': {
      const issues = state.issues.map(issue =>
        action.ids.includes(issue.id) ? { ...issue, status: 'archived' } : issue
      )
      return { ...state, issues, selectedIssues: [] }
    }

    case 'MERGE_ISSUES': {
      // Merge secondary issues into the first one
      const [primaryId, ...mergeIds] = action.ids
      let primary = state.issues.find(i => i.id === primaryId)
      if (!primary) return state
      const mergedCount = mergeIds.reduce((sum, id) => {
        const i = state.issues.find(x => x.id === id)
        return sum + (i ? i.count : 0)
      }, 0)
      primary = { ...primary, count: primary.count + mergedCount }
      const issues = state.issues
        .filter(i => !mergeIds.includes(i.id))
        .map(i => i.id === primaryId ? primary : i)
      return { ...state, issues, selectedIssues: [] }
    }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const sid = getSessionId()
  const initialData = createInitialData()
  const storedState = getStoredState(sid)
  const initialState = storedState || initialData

  const [state, dispatch] = useReducer(reducer, initialState)
  const initialStateRef = useRef(cloneDeep(initialData))
  const sidRef = useRef(sid)
  const [loading, setLoading] = useState(Boolean(sid))

  // On mount: load session state without overwriting server-provided setup.
  useEffect(() => {
    let cancelled = false
    if (!sid) {
      setLoading(false)
      return () => { cancelled = true }
    }
    fetchCustomState(sid).then(customState => {
      if (cancelled) return
      if (customState) {
        initialStateRef.current = cloneDeep(customState)
        dispatch({ type: 'SET_STATE', payload: customState })
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!loading) saveState(state, sidRef.current)
  }, [state, loading])

  // Expose state globally for session-based access and /go route
  useEffect(() => {
    window.__sentryMockState = state
    window.__sentryMockInitial = initialStateRef.current
  }, [state])

  const getStateDiff = () => deepDiff(initialStateRef.current, state)

  const value = {
    state,
    dispatch,
    initialState: initialStateRef.current,
    getStateDiff,
    // Helper actions
    resolveIssue: (issueId) => dispatch({ type: 'RESOLVE_ISSUE', issueId }),
    unresolveIssue: (issueId) => dispatch({ type: 'UNRESOLVE_ISSUE', issueId }),
    archiveIssue: (issueId) => dispatch({ type: 'ARCHIVE_ISSUE', issueId }),
    setIssueStatus: (issueId, status) => dispatch({ type: 'SET_ISSUE_STATUS', issueId, status }),
    setIssueAssignee: (issueId, assignee) => dispatch({ type: 'SET_ISSUE_ASSIGNEE', issueId, assignee }),
    setIssuePriority: (issueId, priority) => dispatch({ type: 'SET_ISSUE_PRIORITY', issueId, priority }),
    toggleBookmark: (issueId) => dispatch({ type: 'TOGGLE_BOOKMARK', issueId }),
    toggleSubscribe: (issueId) => dispatch({ type: 'TOGGLE_SUBSCRIBE', issueId }),
    addComment: (issueId, text) => dispatch({ type: 'ADD_COMMENT', issueId, text }),
    addAlertRule: (alertRule) => dispatch({ type: 'ADD_ALERT_RULE', alertRule }),
    addDashboard: (dashboard) => dispatch({ type: 'ADD_DASHBOARD', dashboard }),
    updateDashboard: (dashboard) => dispatch({ type: 'UPDATE_DASHBOARD', dashboard }),
    updateOrganizationSettings: (name, timezone, defaultRole) => dispatch({ type: 'UPDATE_ORGANIZATION_SETTINGS', name, timezone, defaultRole }),
    toggleIntegration: (name) => dispatch({ type: 'TOGGLE_INTEGRATION', name }),
    toggleNotificationRule: (label) => dispatch({ type: 'TOGGLE_NOTIFICATION_RULE', label }),
    saveDiscoverQuery: (query) => dispatch({ type: 'SAVE_DISCOVER_QUERY', query }),
    saveIssueView: (view) => dispatch({ type: 'SAVE_ISSUE_VIEW', view }),
    setSort: (sort) => dispatch({ type: 'SET_SORT', sort }),
    setTab: (tab) => dispatch({ type: 'SET_TAB', tab }),
    setSearch: (query) => dispatch({ type: 'SET_SEARCH', query }),
    setSelectedIssues: (ids) => dispatch({ type: 'SET_SELECTED_ISSUES', ids }),
    setProjectFilter: (project) => dispatch({ type: 'SET_PROJECT_FILTER', project }),
    setEnvFilter: (environment) => dispatch({ type: 'SET_ENV_FILTER', environment }),
    setDateRange: (range) => dispatch({ type: 'SET_DATE_RANGE', range }),
    bulkResolve: (ids) => dispatch({ type: 'BULK_RESOLVE', ids }),
    bulkArchive: (ids) => dispatch({ type: 'BULK_ARCHIVE', ids }),
    mergeIssues: (ids) => dispatch({ type: 'MERGE_ISSUES', ids }),
  }

  if (loading) {
    return (
      <div style={{ padding: 48, fontFamily: '"Rubik", system-ui, sans-serif', color: '#80708F' }}>
        Loading Xentry...
      </div>
    )
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
