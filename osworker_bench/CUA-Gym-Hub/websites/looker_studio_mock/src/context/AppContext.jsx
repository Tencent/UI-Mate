import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import {
  getSessionId,
  fetchCustomState,
  initializeData,
  saveState,
  storageKey,
  initialKey
} from '../utils/dataManager'

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload }

    case 'UPDATE_REPORT': {
      const reports = state.reports.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r)
      const currentReport = state.currentReport?.id === action.payload.id
        ? { ...state.currentReport, ...action.payload }
        : state.currentReport
      return { ...state, reports, currentReport }
    }

    case 'SET_CURRENT_REPORT': {
      const report = state.reports.find(r => r.id === action.payload)
      return { ...state, currentReport: report || state.currentReport }
    }

    case 'ADD_COMPONENT': {
      const comp = action.payload
      const page = state.pages[comp.pageId]
      if (!page) return state
      return {
        ...state,
        components: { ...state.components, [comp.id]: comp },
        pages: {
          ...state.pages,
          [comp.pageId]: { ...page, components: [...page.components, comp.id] }
        }
      }
    }

    case 'UPDATE_COMPONENT': {
      const { id, ...changes } = action.payload
      if (!state.components[id]) return state
      return {
        ...state,
        components: { ...state.components, [id]: { ...state.components[id], ...changes } }
      }
    }

    case 'DELETE_COMPONENT': {
      const { id } = action.payload
      const comp = state.components[id]
      if (!comp) return state
      const newComps = { ...state.components }
      delete newComps[id]
      const page = state.pages[comp.pageId]
      const newPages = page
        ? { ...state.pages, [comp.pageId]: { ...page, components: page.components.filter(c => c !== id) } }
        : state.pages
      return {
        ...state,
        components: newComps,
        pages: newPages,
        editor: { ...state.editor, selectedComponentIds: state.editor.selectedComponentIds.filter(c => c !== id) }
      }
    }

    case 'MOVE_COMPONENT': {
      const { id, x, y } = action.payload
      if (!state.components[id]) return state
      return {
        ...state,
        components: { ...state.components, [id]: { ...state.components[id], x, y } }
      }
    }

    case 'RESIZE_COMPONENT': {
      const { id, x, y, width, height } = action.payload
      if (!state.components[id]) return state
      return {
        ...state,
        components: { ...state.components, [id]: { ...state.components[id], x, y, width, height } }
      }
    }

    case 'SELECT_COMPONENT': {
      const { id, multi } = action.payload
      const current = state.editor.selectedComponentIds
      let newSelected
      if (multi) {
        newSelected = current.includes(id) ? current.filter(c => c !== id) : [...current, id]
      } else {
        newSelected = [id]
      }
      return { ...state, editor: { ...state.editor, selectedComponentIds: newSelected } }
    }

    case 'DESELECT_ALL':
      return { ...state, editor: { ...state.editor, selectedComponentIds: [] } }

    case 'SET_EDITOR_MODE':
      return { ...state, editor: { ...state.editor, mode: action.payload } }

    case 'SET_EDITOR': {
      return { ...state, editor: { ...state.editor, ...action.payload } }
    }

    case 'ADD_PAGE': {
      const page = action.payload
      const report = state.reports.find(r => r.id === page.reportId) || state.currentReport
      if (!report) return state
      const updatedReport = { ...report, pages: [...report.pages, page.id] }
      return {
        ...state,
        pages: { ...state.pages, [page.id]: page },
        reports: state.reports.map(r => r.id === report.id ? updatedReport : r),
        currentReport: state.currentReport?.id === report.id ? updatedReport : state.currentReport
      }
    }

    case 'DELETE_PAGE': {
      const { pageId } = action.payload
      const page = state.pages[pageId]
      if (!page) return state
      const report = state.reports.find(r => r.id === page.reportId) || state.currentReport
      if (!report || report.pages.length <= 1) return state
      const newPageIds = report.pages.filter(p => p !== pageId)
      const updatedReport = {
        ...report,
        pages: newPageIds,
        currentPageId: report.currentPageId === pageId ? newPageIds[0] : report.currentPageId
      }
      const newPages = { ...state.pages }
      delete newPages[pageId]
      const newComps = { ...state.components }
      page.components.forEach(cid => delete newComps[cid])
      return {
        ...state,
        pages: newPages,
        components: newComps,
        reports: state.reports.map(r => r.id === report.id ? updatedReport : r),
        currentReport: state.currentReport?.id === report.id ? updatedReport : state.currentReport
      }
    }

    case 'RENAME_PAGE': {
      const { pageId, name } = action.payload
      if (!state.pages[pageId]) return state
      return { ...state, pages: { ...state.pages, [pageId]: { ...state.pages[pageId], name } } }
    }

    case 'SET_CURRENT_PAGE': {
      const { reportId, pageId } = action.payload
      const updatedReport = state.reports.find(r => r.id === reportId)
      if (!updatedReport) return state
      const newReport = { ...updatedReport, currentPageId: pageId }
      return {
        ...state,
        reports: state.reports.map(r => r.id === reportId ? newReport : r),
        currentReport: state.currentReport?.id === reportId ? newReport : state.currentReport,
        editor: { ...state.editor, selectedComponentIds: [] }
      }
    }

    case 'SET_HOME_VIEW':
      return { ...state, home: { ...state.home, view: action.payload } }

    case 'SET_HOME_SORT':
      return { ...state, home: { ...state.home, sortBy: action.payload } }

    case 'SET_HOME_VIEW_MODE':
      return { ...state, home: { ...state.home, viewMode: action.payload } }

    case 'SET_SEARCH_QUERY':
      return { ...state, home: { ...state.home, searchQuery: action.payload } }

    case 'TOGGLE_STAR': {
      const { id } = action.payload
      return {
        ...state,
        reports: state.reports.map(r => r.id === id ? { ...r, starred: !r.starred } : r)
      }
    }

    case 'MOVE_TO_TRASH': {
      const { id } = action.payload
      return {
        ...state,
        reports: state.reports.map(r => r.id === id ? { ...r, trashed: true } : r)
      }
    }

    case 'RESTORE_FROM_TRASH': {
      const { id } = action.payload
      return {
        ...state,
        reports: state.reports.map(r => r.id === id ? { ...r, trashed: false } : r)
      }
    }

    case 'DELETE_PERMANENTLY': {
      const { id } = action.payload
      return {
        ...state,
        reports: state.reports.filter(r => r.id !== id)
      }
    }

    case 'DUPLICATE_REPORT': {
      const { sourceId, newId } = action.payload
      const source = state.reports.find(r => r.id === sourceId)
      if (!source) return state
      const now = new Date().toISOString()
      const newPageId = `page_${newId}`
      const newReport = {
        ...source,
        id: newId,
        name: `${source.name} (copy)`,
        createdAt: now,
        modifiedAt: now,
        lastOpenedAt: now,
        starred: false,
        shared: false,
        sharedWith: [],
        pages: [newPageId],
        currentPageId: newPageId
      }
      const newPage = {
        id: newPageId, reportId: newId, name: 'Page 1',
        width: 1160, height: 900, backgroundColor: '#FFFFFF', components: []
      }
      return {
        ...state,
        reports: [newReport, ...state.reports],
        pages: { ...state.pages, [newPageId]: newPage }
      }
    }

    case 'RENAME_REPORT': {
      const { id, name } = action.payload
      return {
        ...state,
        reports: state.reports.map(r => r.id === id ? { ...r, name } : r),
        currentReport: state.currentReport?.id === id ? { ...state.currentReport, name } : state.currentReport
      }
    }

    case 'CREATE_REPORT': {
      const report = action.payload
      const page = { id: `page_${report.id}`, reportId: report.id, name: 'Page 1', width: 1160, height: 900, backgroundColor: '#FFFFFF', components: [] }
      const newReport = { ...report, pages: [page.id], currentPageId: page.id }
      return {
        ...state,
        reports: [newReport, ...state.reports],
        pages: { ...state.pages, [page.id]: page },
        currentReport: newReport
      }
    }

    case 'OPEN_SHARE_DIALOG':
      return { ...state, shareDialog: { open: true, reportId: action.payload } }

    case 'CLOSE_SHARE_DIALOG':
      return { ...state, shareDialog: { open: false, reportId: null } }

    case 'OPEN_PUBLISH_DIALOG':
      return { ...state, publishDialog: { open: true, reportId: action.payload } }

    case 'CLOSE_PUBLISH_DIALOG':
      return { ...state, publishDialog: { open: false, reportId: null } }

    case 'OPEN_CONNECTOR_DIALOG':
      return { ...state, connectorDialog: { open: true } }

    case 'CLOSE_CONNECTOR_DIALOG':
      return { ...state, connectorDialog: { open: false } }

    case 'ADD_DATA_SOURCE': {
      const ds = action.payload
      return { ...state, dataSources: [...state.dataSources, ds] }
    }

    case 'UPDATE_SHARE': {
      const { reportId, sharedWith } = action.payload
      return {
        ...state,
        reports: state.reports.map(r => r.id === reportId ? { ...r, sharedWith, shared: sharedWith.length > 0 } : r),
        currentReport: state.currentReport?.id === reportId
          ? { ...state.currentReport, sharedWith, shared: sharedWith.length > 0 }
          : state.currentReport
      }
    }

    case 'PUBLISH_REPORT': {
      const { reportId, published, embedEnabled } = action.payload
      return {
        ...state,
        reports: state.reports.map(r => r.id === reportId ? { ...r, published: published !== undefined ? published : r.published, embedEnabled: embedEnabled !== undefined ? embedEnabled : r.embedEnabled } : r)
      }
    }

    case 'BRING_TO_FRONT': {
      const { compId, pageId } = action.payload
      const page = state.pages[pageId]
      if (!page) return state
      const filtered = page.components.filter(c => c !== compId)
      return {
        ...state,
        pages: { ...state.pages, [pageId]: { ...page, components: [...filtered, compId] } }
      }
    }

    case 'SEND_TO_BACK': {
      const { compId, pageId } = action.payload
      const page = state.pages[pageId]
      if (!page) return state
      const filtered = page.components.filter(c => c !== compId)
      return {
        ...state,
        pages: { ...state.pages, [pageId]: { ...page, components: [compId, ...filtered] } }
      }
    }

    case 'ALIGN_COMPONENTS': {
      const { alignment } = action.payload
      const ids = state.editor.selectedComponentIds
      if (!ids.length) return state
      const comps = ids.map(id => state.components[id]).filter(Boolean)
      if (!comps.length) return state
      let newComponents = { ...state.components }
      if (alignment === 'left') {
        const minX = Math.min(...comps.map(c => c.x))
        comps.forEach(c => { newComponents[c.id] = { ...c, x: minX } })
      } else if (alignment === 'center') {
        const avgX = comps.reduce((s, c) => s + c.x + c.width / 2, 0) / comps.length
        comps.forEach(c => { newComponents[c.id] = { ...c, x: Math.round(avgX - c.width / 2) } })
      } else if (alignment === 'right') {
        const maxRight = Math.max(...comps.map(c => c.x + c.width))
        comps.forEach(c => { newComponents[c.id] = { ...c, x: maxRight - c.width } })
      } else if (alignment === 'top') {
        const minY = Math.min(...comps.map(c => c.y))
        comps.forEach(c => { newComponents[c.id] = { ...c, y: minY } })
      } else if (alignment === 'middle') {
        const avgY = comps.reduce((s, c) => s + c.y + c.height / 2, 0) / comps.length
        comps.forEach(c => { newComponents[c.id] = { ...c, y: Math.round(avgY - c.height / 2) } })
      } else if (alignment === 'bottom') {
        const maxBottom = Math.max(...comps.map(c => c.y + c.height))
        comps.forEach(c => { newComponents[c.id] = { ...c, y: maxBottom - c.height } })
      }
      return { ...state, components: newComponents }
    }

    case 'UNDO': {
      const { undoStack, redoStack } = state.editor
      if (!undoStack.length) return state
      const prev = undoStack[undoStack.length - 1]
      const newUndo = undoStack.slice(0, -1)
      const snapshot = { components: state.components, pages: state.pages }
      return {
        ...state,
        ...prev,
        editor: { ...state.editor, undoStack: newUndo, redoStack: [...redoStack, snapshot] }
      }
    }

    case 'REDO': {
      const { undoStack, redoStack } = state.editor
      if (!redoStack.length) return state
      const next = redoStack[redoStack.length - 1]
      const newRedo = redoStack.slice(0, -1)
      const snapshot = { components: state.components, pages: state.pages }
      return {
        ...state,
        ...next,
        editor: { ...state.editor, undoStack: [...undoStack, snapshot], redoStack: newRedo }
      }
    }

    case 'PUSH_UNDO': {
      const snapshot = { components: state.components, pages: state.pages }
      return {
        ...state,
        editor: { ...state.editor, undoStack: [...state.editor.undoStack.slice(-19), snapshot], redoStack: [] }
      }
    }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null)
  const initialized = useRef(false)
  const sid = useRef(getSessionId())

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const s = sid.current
    const isRefresh = localStorage.getItem(initialKey(s)) !== null

    if (isRefresh) {
      const data = initializeData(s)
      dispatch({ type: 'SET_STATE', payload: data })
    } else {
      fetchCustomState(s).then(custom => {
        const data = initializeData(s, custom)
        dispatch({ type: 'SET_STATE', payload: data })
      })
    }
  }, [])

  useEffect(() => {
    if (!state) return
    saveState(sid.current, state)
  }, [state])

  if (!state) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Roboto, sans-serif', color: '#5F6368' }}>
        <div>Loading Xooker Studio...</div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
