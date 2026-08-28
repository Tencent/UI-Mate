import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { createInitialData, getState, setState, getInitialState, setInitialState, getSessionId, syncStateToServer, fetchCustomState } from '../utils/dataManager.js'

const AppContext = createContext(null)

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...action.payload }

    case 'UPDATE_CAMPAIGN': {
      const campaigns = state.campaigns.map(c =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      )
      return { ...state, campaigns }
    }

    case 'CREATE_CAMPAIGN': {
      const newCampaign = {
        id: generateId('camp'),
        status: 'ENABLED',
        biddingStrategy: 'MANUAL_CPC',
        targetCpa: null,
        endDate: null,
        networks: ['SEARCH'],
        locations: ['United States'],
        languages: ['English'],
        metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 },
        ...action.payload
      }
      // Also create initial ad group / ad / keywords if provided
      let newAdGroups = [...state.adGroups]
      let newAds = [...state.ads]
      let newKeywords = [...state.keywords]

      if (action.adGroup) {
        const ag = {
          id: generateId('ag'),
          campaignId: newCampaign.id,
          status: 'ENABLED',
          metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 },
          ...action.adGroup
        }
        newAdGroups = [...newAdGroups, ag]

        if (action.ad) {
          newAds = [...newAds, {
            id: generateId('ad'),
            adGroupId: ag.id,
            campaignId: newCampaign.id,
            type: 'RESPONSIVE_SEARCH',
            status: 'ENABLED',
            metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 },
            ...action.ad
          }]
        }

        if (action.keywords && action.keywords.length > 0) {
          const kwEntities = action.keywords.map(kw => ({
            id: generateId('kw'),
            adGroupId: ag.id,
            campaignId: newCampaign.id,
            status: 'ENABLED',
            bid: null,
            qualityScore: null,
            isNegative: false,
            metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 },
            ...kw
          }))
          newKeywords = [...newKeywords, ...kwEntities]
        }
      }

      return {
        ...state,
        campaigns: [...state.campaigns, newCampaign],
        adGroups: newAdGroups,
        ads: newAds,
        keywords: newKeywords
      }
    }

    case 'UPDATE_AD_GROUP': {
      const adGroups = state.adGroups.map(ag =>
        ag.id === action.payload.id ? { ...ag, ...action.payload } : ag
      )
      return { ...state, adGroups }
    }

    case 'CREATE_AD_GROUP': {
      const newAg = {
        id: generateId('ag'),
        status: 'ENABLED',
        metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 },
        ...action.payload
      }
      return { ...state, adGroups: [...state.adGroups, newAg] }
    }

    case 'UPDATE_KEYWORD': {
      const keywords = state.keywords.map(kw =>
        kw.id === action.payload.id ? { ...kw, ...action.payload } : kw
      )
      return { ...state, keywords }
    }

    case 'CREATE_KEYWORD': {
      const payload = Array.isArray(action.payload) ? action.payload : [action.payload]
      const newKws = payload.map(kw => ({
        id: generateId('kw'),
        status: 'ENABLED',
        bid: null,
        qualityScore: null,
        isNegative: false,
        metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 },
        ...kw
      }))
      return { ...state, keywords: [...state.keywords, ...newKws] }
    }

    case 'DELETE_KEYWORD': {
      const keywords = state.keywords.map(kw =>
        kw.id === action.payload ? { ...kw, status: 'REMOVED' } : kw
      )
      return { ...state, keywords }
    }

    case 'UPDATE_AD': {
      const ads = state.ads.map(ad =>
        ad.id === action.payload.id ? { ...ad, ...action.payload } : ad
      )
      return { ...state, ads }
    }

    case 'CREATE_AD': {
      const newAd = {
        id: generateId('ad'),
        type: 'RESPONSIVE_SEARCH',
        status: 'ENABLED',
        metrics: { clicks: 0, impressions: 0, ctr: 0, avgCpc: 0, cost: 0, conversions: 0, conversionRate: 0, costPerConversion: 0 },
        ...action.payload
      }
      return { ...state, ads: [...state.ads, newAd] }
    }

    case 'APPLY_RECOMMENDATION': {
      const recommendations = state.recommendations.map(r =>
        r.id === action.payload ? { ...r, status: 'APPLIED' } : r
      )
      const pendingCount = recommendations.filter(r => r.status === 'PENDING').length
      const totalCount = recommendations.length
      const appliedCount = recommendations.filter(r => r.status === 'APPLIED').length
      const newScore = Math.min(100, Math.round(72 + (appliedCount / totalCount) * 28))
      return {
        ...state,
        recommendations,
        account: { ...state.account, optimizationScore: newScore }
      }
    }

    case 'DISMISS_RECOMMENDATION': {
      const recommendations = state.recommendations.map(r =>
        r.id === action.payload ? { ...r, status: 'DISMISSED' } : r
      )
      return { ...state, recommendations }
    }

    case 'SET_GOAL':
      return { ...state, selectedGoal: action.payload }

    case 'SET_DATE_RANGE':
      return { ...state, selectedDateRange: action.payload }

    case 'SET_CAMPAIGN_FILTER':
      return { ...state, selectedCampaignFilter: action.payload }

    case 'MARK_NOTIFICATION_READ': {
      const notifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      )
      return { ...state, notifications }
    }

    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }))
      return { ...state, notifications }
    }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const sid = typeof window !== 'undefined' ? getSessionId() : null
  const isRefresh = typeof window !== 'undefined' ? localStorage.getItem(`google_ads_state_${sid || 'default'}_initial`) !== null : false

  const [state, dispatch] = useReducer(reducer, null, () => {
    const stored = sid ? getState(sid) : null
    if (stored) return stored
    if (isRefresh) return createInitialData()
    return createInitialData()
  })

  const [initialized, setInitialized] = useState(isRefresh)

  // On first load (not a refresh), check server for injected state
  useEffect(() => {
    if (isRefresh) {
      setInitialized(true)
      return
    }
    fetchCustomState(sid).then(customState => {
      if (customState) {
        const merged = { ...createInitialData(), ...customState }
        dispatch({ type: 'SET_STATE', payload: merged })
        setState(sid, merged)
        setInitialState(sid, merged)
      }
      setInitialized(true)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist state changes
  useEffect(() => {
    if (!state || !initialized) return
    setState(sid, state)
    syncStateToServer(sid, state)
    // Set initial state on first load
    if (!getInitialState(sid)) {
      setInitialState(sid, state)
    }
  }, [state, sid, initialized])

  // Expose saveState for sync
  const saveState = useCallback((newState) => {
    setState(sid, newState)
  }, [sid])

  return (
    <AppContext.Provider value={{ state, dispatch, saveState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export default AppContext
