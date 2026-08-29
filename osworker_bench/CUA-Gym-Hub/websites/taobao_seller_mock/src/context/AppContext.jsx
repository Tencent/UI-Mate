import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { createInitialData } from '../utils/dataManager'

const AppContext = createContext(null)

function getSessionId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('sid') || null
}

async function saveStateToServer(state) {
  const sid = getSessionId()
  if (!sid) return
  try {
    await fetch(`/post?sid=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    })
  } catch (e) {
    console.error('Failed to save state to server:', e)
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('taobao_seller_state')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Failed to load state from localStorage:', e)
  }
  return createInitialData()
}

function saveStateLocal(state) {
  try {
    localStorage.setItem('taobao_seller_state', JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state to localStorage:', e)
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload }

    case 'SET_CURRENT_STATE':
      return { ...state, ...action.payload }

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        )
      }

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      }

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload ? { ...p, status: 'removed' } : p
        )
      }

    case 'UPDATE_PRODUCT_STATUS':
      return {
        ...state,
        products: state.products.map(p =>
          action.payload.ids.includes(p.id)
            ? { ...p, status: action.payload.status }
            : p
        )
      }

    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.payload.id ? { ...o, ...action.payload } : o
        )
      }

    case 'SHIP_ORDER': {
      const { orderId, provider, trackingNo } = action.payload
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === orderId
            ? {
                ...o,
                status: 'shipped',
                shippedAt: new Date().toISOString(),
                logistics: { provider, trackingNo }
              }
            : o
        )
      }
    }

    case 'UPDATE_REFUND':
      return {
        ...state,
        refunds: state.refunds.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        )
      }

    case 'APPROVE_REFUND': {
      const refund = state.refunds.find(r => r.id === action.payload.refundId)
      return {
        ...state,
        refunds: state.refunds.map(r =>
          r.id === action.payload.refundId
            ? { ...r, status: 'approved', processedAt: new Date().toISOString(), sellerResponse: action.payload.response || '' }
            : r
        ),
        orders: refund
          ? state.orders.map(o =>
              o.id === refund.orderId ? { ...o, status: 'refunding' } : o
            )
          : state.orders
      }
    }

    case 'REJECT_REFUND':
      return {
        ...state,
        refunds: state.refunds.map(r =>
          r.id === action.payload.refundId
            ? { ...r, status: 'rejected', processedAt: new Date().toISOString(), sellerResponse: action.payload.reason }
            : r
        )
      }

    case 'ADD_MESSAGE': {
      const { conversationId, message } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, message],
                lastMessage: message.content,
                lastMessageTime: message.time
              }
            : c
        )
      }
    }

    case 'MARK_CONVERSATION_READ':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload ? { ...c, unreadCount: 0 } : c
        )
      }

    case 'ADD_COUPON':
      return {
        ...state,
        coupons: [...state.coupons, action.payload]
      }

    case 'UPDATE_COUPON':
      return {
        ...state,
        coupons: state.coupons.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        )
      }

    case 'DELETE_COUPON':
      return {
        ...state,
        coupons: state.coupons.filter(c => c.id !== action.payload)
      }

    case 'REPLY_REVIEW':
      return {
        ...state,
        reviews: state.reviews.map(r =>
          r.id === action.payload.reviewId
            ? { ...r, sellerReply: action.payload.reply, sellerReplyTime: new Date().toISOString() }
            : r
        )
      }

    case 'UPDATE_STORE_SETTINGS':
      return {
        ...state,
        store: { ...state.store, ...action.payload }
      }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      }

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      }

    case 'UPDATE_DASHBOARD_METRICS':
      return {
        ...state,
        dashboardMetrics: { ...state.dashboardMetrics, ...action.payload }
      }

    case 'ADD_PROMOTION':
      return {
        ...state,
        promotions: [...(state.promotions || []), action.payload]
      }

    case 'UPDATE_PROMOTION':
      return {
        ...state,
        promotions: (state.promotions || []).map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        )
      }

    case 'DELETE_PROMOTION':
      return {
        ...state,
        promotions: (state.promotions || []).filter(p => p.id !== action.payload)
      }

    case 'UPDATE_LOGISTICS_TEMPLATES':
      return {
        ...state,
        logisticsTemplates: action.payload
      }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, rawDispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('sid')
    if (sid) {
      fetch(`/state?sid=${sid}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.stored_state) {
            // Server already has state — load it into context and sync current only
            rawDispatch({ type: 'SET_STATE', payload: data.stored_state })
            fetch(`/post?sid=${sid}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'set_current', state: data.stored_state })
            }).catch(() => {})
            // Cache the initial state locally for reference
            fetch(`/go?sid=${sid}`)
              .then(r => r.json())
              .then(goData => {
                if (goData && goData.initial_state) {
                  localStorage.setItem('taobao_seller_initial', JSON.stringify(goData.initial_state))
                }
              })
              .catch(() => {})
          } else {
            // No existing server state — establish both initial and current with current local state
            const currentLocalState = loadState()
            fetch(`/post?sid=${sid}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'set', state: currentLocalState })
            }).catch(() => {})
          }
        })
        .catch(() => {})
    } else {
      // No sid: save factory default as initial state baseline only on first launch
      const existingInitial = localStorage.getItem('taobao_seller_initial')
      if (!existingInitial) {
        localStorage.setItem('taobao_seller_initial', JSON.stringify(createInitialData()))
      }
    }
  }, [])

  useEffect(() => {
    saveStateLocal(state)
    saveStateToServer(state)
  }, [state])

  const dispatch = useCallback((action) => {
    rawDispatch(action)
  }, [rawDispatch])

  const saveState = useCallback(async (newState) => {
    saveStateLocal(newState)
    await saveStateToServer(newState)
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, saveState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
