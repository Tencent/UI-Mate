import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import {
  getSessionId,
  fetchCustomState,
  storageKey,
  initialKey,
  initializeData
} from '../utils/dataManager'

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload }

    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sideMenuOpen: !state.ui.sideMenuOpen } }

    case 'CLOSE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sideMenuOpen: false } }

    case 'SET_ACTIVE_SECTION':
      return { ...state, ui: { ...state.ui, activeSection: action.payload } }

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notificationBanners: state.ui.notificationBanners.map(b =>
            b.id === action.payload ? { ...b, dismissed: true } : b
          )
        }
      }

    case 'ADD_MESSAGE': {
      const newMsg = action.payload
      const threads = state.messages || []
      return {
        ...state,
        messages: [...threads, newMsg],
        ui: {
          ...state.ui,
          unreadMessageCount: state.ui.unreadMessageCount + (newMsg.folder === 'inbox' && !newMsg.isRead ? 1 : 0)
        }
      }
    }

    case 'MARK_MESSAGE_READ': {
      const { threadId } = action.payload
      const updated = state.messages.map(m =>
        m.threadId === threadId ? { ...m, isRead: true } : m
      )
      const unreadCount = updated.filter(m => !m.isRead && m.folder === 'inbox').length
      return {
        ...state,
        messages: updated,
        ui: { ...state.ui, unreadMessageCount: unreadCount }
      }
    }

    case 'MARK_MESSAGE_UNREAD': {
      const { messageId } = action.payload
      const updated = state.messages.map(m =>
        m.id === messageId ? { ...m, isRead: false } : m
      )
      const unreadCount = updated.filter(m => !m.isRead && m.folder === 'inbox').length
      return { ...state, messages: updated, ui: { ...state.ui, unreadMessageCount: unreadCount } }
    }

    case 'ARCHIVE_THREAD': {
      const updated = state.messages.map(m =>
        m.threadId === action.payload ? { ...m, folder: 'archived' } : m
      )
      const unreadCount = updated.filter(m => !m.isRead && m.folder === 'inbox').length
      return { ...state, messages: updated, ui: { ...state.ui, unreadMessageCount: unreadCount } }
    }

    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(a =>
          a.id === action.payload.id ? { ...a, ...action.payload } : a
        )
      }

    case 'CANCEL_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(a =>
          a.id === action.payload.id
            ? { ...a, status: 'Cancelled', isUpcoming: false, canCheckIn: false, canCancel: false }
            : a
        )
      }

    case 'SCHEDULE_APPOINTMENT': {
      const newAppt = action.payload
      return {
        ...state,
        appointments: [...state.appointments, newAppt]
      }
    }

    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        )
      }

    case 'REQUEST_REFILL': {
      const { medicationIds } = action.payload
      const today = new Date().toISOString().split('T')[0]
      return {
        ...state,
        medications: state.medications.map(m =>
          medicationIds.includes(m.id)
            ? { ...m, lastFilledDate: today, refillsRemaining: Math.max(0, m.refillsRemaining - 1) }
            : m
        )
      }
    }

    case 'PAY_BILL': {
      const { billId, amount } = action.payload
      return {
        ...state,
        billingStatements: state.billingStatements.map(b => {
          if (b.id !== billId) return b
          const newBalance = Math.max(0, b.balanceDue - amount)
          return {
            ...b,
            amountPaid: b.amountPaid + amount,
            balanceDue: newBalance,
            status: newBalance === 0 ? 'Paid' : b.status
          }
        })
      }
    }

    case 'UPDATE_PATIENT_INFO': {
      return {
        ...state,
        currentUser: { ...state.currentUser, ...action.payload }
      }
    }

    case 'MARK_TEST_REVIEWED': {
      return {
        ...state,
        testResults: state.testResults.map(r =>
          r.id === action.payload ? { ...r, isReviewed: true } : r
        )
      }
    }

    case 'SAVE_DRAFT': {
      const draft = action.payload
      const existing = state.drafts || []
      const idx = existing.findIndex(d => d.id === draft.id)
      const updated = idx >= 0
        ? existing.map((d, i) => i === idx ? { ...d, ...draft, updatedAt: new Date().toISOString() } : d)
        : [...existing, { ...draft, id: draft.id || `draft-${Date.now()}`, savedAt: new Date().toISOString() }]
      return { ...state, drafts: updated }
    }

    case 'DELETE_DRAFT': {
      return {
        ...state,
        drafts: (state.drafts || []).filter(d => d.id !== action.payload)
      }
    }

    case 'UPDATE_SETTINGS': {
      const { communicationPrefs, language } = action.payload
      const updates = {}
      if (language !== undefined) {
        updates.preferredLanguage = language
      }
      return {
        ...state,
        currentUser: { ...state.currentUser, ...updates },
        ui: {
          ...state.ui,
          communicationPrefs: communicationPrefs !== undefined
            ? communicationPrefs
            : (state.ui.communicationPrefs || {})
        }
      }
    }

    case 'CANCEL_APPOINTMENT_WITH_REASON': {
      const { id, reason, otherText } = action.payload
      return {
        ...state,
        appointments: state.appointments.map(a =>
          a.id === id
            ? {
                ...a,
                status: 'Cancelled',
                isUpcoming: false,
                canCheckIn: false,
                canCancel: false,
                cancelReason: reason,
                cancelOtherText: otherText || ''
              }
            : a
        )
      }
    }

    case 'SHARE_TEST_RESULT': {
      const { testResultId, providerId, providerName } = action.payload
      return {
        ...state,
        testResults: state.testResults.map(r =>
          r.id === testResultId
            ? {
                ...r,
                sharedWith: [
                  ...(r.sharedWith || []),
                  { providerId, providerName, sharedAt: new Date().toISOString() }
                ]
              }
            : r
        )
      }
    }

    // No-op for sign out — navigation handled by UI
    case 'SIGN_OUT':
      return state

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const sid = getSessionId()
    const iKey = initialKey(sid)
    const isRefresh = localStorage.getItem(iKey) !== null

    if (isRefresh) {
      const data = initializeData(sid)
      dispatch({ type: 'SET_STATE', payload: data })
      setIsReady(true)
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom)
        dispatch({ type: 'SET_STATE', payload: data })
        setIsReady(true)
      })
    }
  }, [])

  useEffect(() => {
    if (!state) return
    const sid = getSessionId()
    const sKey = storageKey(sid)
    localStorage.setItem(sKey, JSON.stringify(state))
    window.__APP_STATE__ = state
  }, [state])

  if (!isReady || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Arial, sans-serif', color: '#0075BC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>MyChart</div>
          <div style={{ fontSize: '14px', color: '#757575' }}>Loading...</div>
        </div>
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
