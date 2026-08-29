import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { getSessionId, fetchCustomState, initializeData, setState, storageKey, initialKey } from '../utils/dataManager'

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload }

    case 'ADD_MATTER':
      return { ...state, matters: [...state.matters, action.payload] }
    case 'UPDATE_MATTER':
      return { ...state, matters: state.matters.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m) }
    case 'DELETE_MATTER':
      return { ...state, matters: state.matters.filter(m => m.id !== action.payload) }

    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.payload] }
    case 'UPDATE_CONTACT':
      return { ...state, contacts: state.contacts.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    case 'DELETE_CONTACT':
      return { ...state, contacts: state.contacts.filter(c => c.id !== action.payload) }

    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] }
    case 'UPDATE_ACTIVITY':
      return { ...state, activities: state.activities.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) }
    case 'DELETE_ACTIVITY':
      return { ...state, activities: state.activities.filter(a => a.id !== action.payload) }

    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t) }
    case 'TOGGLE_TASK': {
      const task = state.tasks.find(t => t.id === action.payload)
      if (!task) return state
      const now = new Date().toISOString()
      const newStatus = task.status === 'Completed' ? 'Outstanding' : 'Completed'
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload
          ? { ...t, status: newStatus, completedDate: newStatus === 'Completed' ? now.split('T')[0] : null, updatedAt: now }
          : t
        )
      }
    }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }

    case 'ADD_EVENT':
      return { ...state, calendarEvents: [...state.calendarEvents, action.payload] }
    case 'UPDATE_EVENT':
      return { ...state, calendarEvents: state.calendarEvents.map(e => e.id === action.payload.id ? { ...e, ...action.payload } : e) }
    case 'DELETE_EVENT':
      return { ...state, calendarEvents: state.calendarEvents.filter(e => e.id !== action.payload) }

    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.payload] }
    case 'UPDATE_BILL':
      return { ...state, bills: state.bills.map(b => b.id === action.payload.id ? { ...b, ...action.payload } : b) }

    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] }
    case 'DELETE_DOCUMENT':
      return { ...state, documents: state.documents.filter(d => d.id !== action.payload) }
    case 'UPDATE_DOCUMENT':
      return { ...state, documents: state.documents.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d) }

    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] }
    case 'UPDATE_NOTE':
      return { ...state, notes: state.notes.map(n => n.id === action.payload.id ? { ...n, ...action.payload } : n) }
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter(n => n.id !== action.payload) }

    case 'ADD_COMMUNICATION':
      return { ...state, communications: [...state.communications, action.payload] }
    case 'DELETE_COMMUNICATION':
      return { ...state, communications: state.communications.filter(c => c.id !== action.payload) }

    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) }
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) }

    case 'UPDATE_TIMER':
      return { ...state, timer: { ...state.timer, ...action.payload } }

    case 'UPDATE_SETTINGS':
      return { ...state, firmSettings: { ...state.firmSettings, ...action.payload } }

    case 'ADD_TRUST_TRANSACTION': {
      const txn = action.payload
      const accts = state.trustAccounts.map(a => {
        if (a.id !== txn.accountId) return a
        const delta = txn.type === 'Deposit' ? txn.amount : -txn.amount
        return { ...a, balance: a.balance + delta }
      })
      return { ...state, trustTransactions: [txn, ...state.trustTransactions], trustAccounts: accts }
    }

    case 'UPDATE_ONLINE_PAYMENTS':
      return { ...state, onlinePayments: { ...state.onlinePayments, ...action.payload } }

    case 'TOGGLE_INTEGRATION': {
      const { integrationId } = action.payload
      return {
        ...state,
        appIntegrations: state.appIntegrations.map(i =>
          i.id === integrationId
            ? { ...i, status: i.status === 'Connected' ? 'Disconnected' : 'Connected', connectedAt: i.status === 'Connected' ? null : new Date().toISOString() }
            : i
        )
      }
    }

    case 'UPDATE_RECENT_MATTERS': {
      const id = action.payload
      const recent = [id, ...state.recentMatters.filter(i => i !== id)].slice(0, 10)
      return { ...state, recentMatters: recent }
    }
    case 'UPDATE_RECENT_CONTACTS': {
      const id = action.payload
      const recent = [id, ...state.recentContacts.filter(i => i !== id)].slice(0, 10)
      return { ...state, recentContacts: recent }
    }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null)
  const [loaded, setLoaded] = useState(false)
  const sid = getSessionId()

  useEffect(() => {
    const ikey = initialKey(sid)
    const isRefresh = localStorage.getItem(ikey) !== null

    if (isRefresh) {
      const data = initializeData(sid)
      dispatch({ type: 'SET_STATE', payload: data })
      setLoaded(true)
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom)
        dispatch({ type: 'SET_STATE', payload: data })
        setLoaded(true)
      })
    }
  }, [])

  useEffect(() => {
    if (state && loaded) {
      setState(state, sid)
    }
  }, [state, loaded])

  if (!loaded || !state) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Inter,sans-serif', color:'#5F6368' }}>
        Loading...
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
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
