import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react'
import { createInitialData } from '../utils/dataManager'

const AppContext = createContext(null)

function getSid() {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    try { sessionStorage.setItem('sap_mock_sid', sid) } catch (e) {}
    return sid
  }
  try { return sessionStorage.getItem('sap_mock_sid') || null } catch (e) {}
  return null
}

function getStorageKey(sid) {
  return sid ? `sap_mock_state_${sid}` : 'sap_mock_state'
}

function loadState(sid) {
  try {
    const raw = localStorage.getItem(getStorageKey(sid))
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return null
}

function saveState(sid, state) {
  try {
    localStorage.setItem(getStorageKey(sid), JSON.stringify(state))
  } catch (e) {}
  try {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post'
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    }).catch(() => {})
  } catch (e) {}
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_SELECTED_VARIANT':
      return { ...state, selectedVariant: action.payload }
    case 'SET_FILTER_STATE':
      return { ...state, filterState: { ...state.filterState, ...action.payload } }
    case 'READ_NOTIFICATION': {
      const updated = state.notifications.map(n =>
        n.id === action.payload ? { ...n, isRead: true } : n
      )
      const unread = updated.filter(n => !n.isRead).length
      return { ...state, notifications: updated, notificationCount: unread }
    }
    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const updated = state.notifications.map(n => ({ ...n, isRead: true }))
      return { ...state, notifications: updated, notificationCount: 0 }
    }
    case 'ADD_PURCHASE_ORDER': {
      const now = new Date().toISOString().split('T')[0]
      const newPO = { ...action.payload, lastChanged: now }
      const items = action.items || []
      return {
        ...state,
        purchaseOrders: [...state.purchaseOrders, newPO],
        purchaseOrderItems: [...state.purchaseOrderItems, ...items]
      }
    }
    case 'UPDATE_PURCHASE_ORDER': {
      const now = new Date().toISOString().split('T')[0]
      const updated = state.purchaseOrders.map(po =>
        po.id === action.payload.id
          ? { ...po, ...action.payload.changes, lastChanged: now, lastChangedBy: state.currentUser.firstName + ' ' + state.currentUser.lastName }
          : po
      )
      return { ...state, purchaseOrders: updated }
    }
    case 'DELETE_PURCHASE_ORDER': {
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.filter(po => po.id !== action.payload),
        purchaseOrderItems: state.purchaseOrderItems.filter(i => i.poId !== action.payload)
      }
    }
    case 'ADD_PO_ITEM': {
      const item = action.payload
      const updatedPOs = state.purchaseOrders.map(po => {
        if (po.id !== item.poId) return po
        const currentItems = state.purchaseOrderItems.filter(i => i.poId === po.id)
        const newTotal = currentItems.reduce((s, i) => s + (i.netValue || 0), 0) + (item.netValue || 0)
        return { ...po, totalNetValue: parseFloat(newTotal.toFixed(2)) }
      })
      return {
        ...state,
        purchaseOrders: updatedPOs,
        purchaseOrderItems: [...state.purchaseOrderItems, item]
      }
    }
    case 'DELETE_PO_ITEM': {
      const remaining = state.purchaseOrderItems.filter(i => i.id !== action.payload)
      const deletedItem = state.purchaseOrderItems.find(i => i.id === action.payload)
      const updatedPOs = deletedItem ? state.purchaseOrders.map(po => {
        if (po.id !== deletedItem.poId) return po
        const newItems = remaining.filter(i => i.poId === po.id)
        const newTotal = newItems.reduce((s, i) => s + (i.netValue || 0), 0)
        return { ...po, totalNetValue: parseFloat(newTotal.toFixed(2)) }
      }) : state.purchaseOrders
      return { ...state, purchaseOrders: updatedPOs, purchaseOrderItems: remaining }
    }
    case 'ADD_SALES_ORDER': {
      const now = new Date().toISOString().split('T')[0]
      const newSO = { ...action.payload, lastChanged: now }
      const items = action.items || []
      return {
        ...state,
        salesOrders: [...state.salesOrders, newSO],
        salesOrderItems: [...state.salesOrderItems, ...items]
      }
    }
    case 'UPDATE_SALES_ORDER': {
      const now = new Date().toISOString().split('T')[0]
      const updated = state.salesOrders.map(so =>
        so.id === action.payload.id
          ? { ...so, ...action.payload.changes, lastChanged: now, lastChangedBy: state.currentUser.firstName + ' ' + state.currentUser.lastName }
          : so
      )
      return { ...state, salesOrders: updated }
    }
    case 'DELETE_SALES_ORDER': {
      return {
        ...state,
        salesOrders: state.salesOrders.filter(so => so.id !== action.payload),
        salesOrderItems: state.salesOrderItems.filter(i => i.soId !== action.payload)
      }
    }
    case 'UPDATE_MATERIAL': {
      const now = new Date().toISOString().split('T')[0]
      const updated = state.materials.map(m =>
        m.id === action.payload.id
          ? { ...m, ...action.payload.changes, lastChanged: now, lastChangedBy: state.currentUser.firstName + ' ' + state.currentUser.lastName }
          : m
      )
      return { ...state, materials: updated }
    }
    case 'ADD_ATTACHMENT_TO_SALES_ORDER': {
      const { soId, attachment } = action.payload
      return {
        ...state,
        salesOrders: state.salesOrders.map(so =>
          so.id === soId
            ? { ...so, attachments: [...(so.attachments || []), attachment] }
            : so
        )
      }
    }
    case 'ADD_JOURNAL_ENTRY': {
      const items = action.items || []
      return {
        ...state,
        journalEntries: [...state.journalEntries, action.payload],
        journalEntryItems: [...state.journalEntryItems, ...items]
      }
    }
    case 'UPDATE_JOURNAL_ENTRY': {
      const updated = state.journalEntries.map(je =>
        je.id === action.payload.id ? { ...je, ...action.payload.changes } : je
      )
      return { ...state, journalEntries: updated }
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const sid = getSid()
  const initialState = loadState(sid) || createInitialData()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [hydrated, setHydrated] = useState(false)
  const initialStateRef = useRef(initialState)

  useEffect(() => {
    if (hydrated) saveState(sid, state)
  }, [state, sid, hydrated])

  // Fetch server-side state if available (session injection)
  useEffect(() => {
    async function fetchServerState() {
      try {
        const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state'
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data.has_custom_state && data.stored_state) {
            dispatch({ type: 'SET_STATE', payload: data.stored_state })
            initialStateRef.current = data.stored_state
          }
        }
      } catch (e) {
      } finally {
        setHydrated(true)
      }
    }
    fetchServerState()
  }, [sid])

  const value = {
    state,
    dispatch,
    initialState: initialStateRef.current,
    setActiveTab: (tab) => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab }),
    setSearchQuery: (q) => dispatch({ type: 'SET_SEARCH_QUERY', payload: q }),
    setSelectedVariant: (v) => dispatch({ type: 'SET_SELECTED_VARIANT', payload: v }),
    setFilterState: (fs) => dispatch({ type: 'SET_FILTER_STATE', payload: fs }),
    readNotification: (id) => dispatch({ type: 'READ_NOTIFICATION', payload: id }),
    markAllNotificationsRead: () => dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' }),
    addPurchaseOrder: (po, items) => dispatch({ type: 'ADD_PURCHASE_ORDER', payload: po, items }),
    updatePurchaseOrder: (id, changes) => dispatch({ type: 'UPDATE_PURCHASE_ORDER', payload: { id, changes } }),
    deletePurchaseOrder: (id) => dispatch({ type: 'DELETE_PURCHASE_ORDER', payload: id }),
    addPOItem: (item) => dispatch({ type: 'ADD_PO_ITEM', payload: item }),
    deletePOItem: (id) => dispatch({ type: 'DELETE_PO_ITEM', payload: id }),
    addSalesOrder: (so, items) => dispatch({ type: 'ADD_SALES_ORDER', payload: so, items }),
    updateSalesOrder: (id, changes) => dispatch({ type: 'UPDATE_SALES_ORDER', payload: { id, changes } }),
    deleteSalesOrder: (id) => dispatch({ type: 'DELETE_SALES_ORDER', payload: id }),
    addSalesOrderAttachment: (soId, attachment) => dispatch({ type: 'ADD_ATTACHMENT_TO_SALES_ORDER', payload: { soId, attachment } }),
    updateMaterial: (id, changes) => dispatch({ type: 'UPDATE_MATERIAL', payload: { id, changes } }),
    addJournalEntry: (je, items) => dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: je, items }),
    updateJournalEntry: (id, changes) => dispatch({ type: 'UPDATE_JOURNAL_ENTRY', payload: { id, changes } })
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
