import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import {
  getSessionId, fetchCustomState, initializeData, saveState, initialKey, storageKey
} from '../utils/dataManager'

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload }
    case 'UPDATE_ORDER': {
      const orders = state.orders.map(o => o.id === action.payload.id ? { ...o, ...action.payload } : o)
      return { ...state, orders }
    }
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] }
    case 'UPDATE_PRODUCT': {
      const products = state.products.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p)
      return { ...state, products }
    }
    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products] }
    case 'DELETE_PRODUCT': {
      const products = state.products.filter(p => p.id !== action.payload)
      return { ...state, products }
    }
    case 'UPDATE_CUSTOMER': {
      const customers = state.customers.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c)
      return { ...state, customers }
    }
    case 'ADD_NOTE': {
      const orders = state.orders.map(o => {
        if (o.id !== action.payload.orderId) return o
        return { ...o, orderNotes: [...(o.orderNotes || []), action.payload.note] }
      })
      return { ...state, orders }
    }
    case 'UPDATE_SETTINGS':
      return { ...state, store: { ...state.store, ...action.payload } }
    case 'MARK_NOTIFICATION_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, isRead: true } : n
      )
      return { ...state, notifications }
    }
    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const notifications = state.notifications.map(n => ({ ...n, isRead: true }))
      return { ...state, notifications }
    }
    case 'UPDATE_COUPON': {
      const coupons = state.coupons.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c)
      return { ...state, coupons }
    }
    case 'ADD_COUPON':
      return { ...state, coupons: [action.payload, ...state.coupons] }
    case 'DELETE_COUPON':
      return { ...state, coupons: state.coupons.filter(c => c.id !== action.payload) }
    case 'UPDATE_REVIEW': {
      const reviews = state.reviews.map(r => r.id === action.payload.id ? { ...r, ...action.payload } : r)
      return { ...state, reviews }
    }
    case 'UPDATE_PAYMENT_GATEWAY': {
      const paymentGateways = state.paymentGateways.map(g =>
        g.id === action.payload.id ? { ...g, ...action.payload } : g
      )
      return { ...state, paymentGateways }
    }
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] }
    case 'DELETE_TAG':
      return { ...state, tags: state.tags.filter(t => t.id !== action.payload) }
    case 'UPDATE_SHIPPING_ZONE': {
      const shippingZones = state.shippingZones.map(z => z.id === action.payload.id ? { ...z, ...action.payload } : z)
      return { ...state, shippingZones }
    }
    case 'ADD_SHIPPING_ZONE':
      return { ...state, shippingZones: [...state.shippingZones, action.payload] }
    case 'UPDATE_TAX_RATE': {
      const taxRates = state.taxRates.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t)
      return { ...state, taxRates }
    }
    case 'ADD_TAX_RATE':
      return { ...state, taxRates: [...state.taxRates, action.payload] }
    case 'DELETE_TAX_RATE':
      return { ...state, taxRates: state.taxRates.filter(t => t.id !== action.payload) }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null)
  const [ready, setReady] = useState(false)
  const sid = getSessionId()

  useEffect(() => {
    const iKey = initialKey(sid)
    const isRefresh = localStorage.getItem(iKey) !== null

    if (isRefresh) {
      const data = initializeData(sid)
      dispatch({ type: 'SET_STATE', payload: data })
      setReady(true)
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom)
        dispatch({ type: 'SET_STATE', payload: data })
        setReady(true)
      })
    }
  }, [])

  useEffect(() => {
    if (state && ready) {
      saveState(state, sid)
    }
  }, [state, ready])

  if (!ready || !state) return null

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
