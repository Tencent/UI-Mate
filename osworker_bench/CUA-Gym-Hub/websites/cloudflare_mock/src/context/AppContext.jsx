import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getSessionId, fetchCustomState, initializeData, saveState, getInitialState, getStateDiff } from '../utils/dataManager'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [sid] = useState(() => getSessionId())
  const [state, setStateLocal] = useState(() => initializeData(sid))

  // On mount, fetch custom state from server if sid is present
  useEffect(() => {
    if (!sid) return
    fetchCustomState(sid).then(custom => {
      if (custom) {
        const data = initializeData(sid, custom)
        setStateLocal(data)
      }
    })
  }, [sid])

  // Persist state to localStorage and server whenever it changes
  useEffect(() => {
    saveState(state, sid)
  }, [state, sid])

  const updateState = useCallback((updater) => {
    setStateLocal(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      return next
    })
  }, [])

  // Zone helpers
  const getZone = useCallback((zoneId) => {
    return state.zones.find(z => z.id === zoneId)
  }, [state.zones])

  const updateZone = useCallback((zoneId, changes) => {
    updateState(prev => ({
      ...prev,
      zones: prev.zones.map(z => z.id === zoneId ? { ...z, ...changes } : z)
    }))
  }, [updateState])

  const addZone = useCallback((zone) => {
    updateState(prev => ({
      ...prev,
      zones: [...prev.zones, zone],
      dnsRecords: { ...prev.dnsRecords, [zone.id]: [] },
      sslSettings: { ...prev.sslSettings, [zone.id]: { zone_id: zone.id, mode: 'flexible', certificate_status: 'pending_validation', always_use_https: false, min_tls_version: '1.0', automatic_https_rewrites: false, tls_1_3: 'off', edge_certificates: [] } },
      securitySettings: { ...prev.securitySettings, [zone.id]: { zone_id: zone.id, security_level: 'medium', challenge_ttl: 1800, browser_integrity_check: true, bot_fight_mode: false, waf_enabled: false, ip_access_rules: [] } },
      firewallRules: { ...prev.firewallRules, [zone.id]: [] },
      speedSettings: { ...prev.speedSettings, [zone.id]: { zone_id: zone.id, auto_minify: { javascript: false, css: false, html: false }, brotli: false, rocket_loader: 'off', polish: 'off', mirage: false, early_hints: false, http2_prioritization: false } },
      cachingSettings: { ...prev.cachingSettings, [zone.id]: { zone_id: zone.id, caching_level: 'standard', browser_cache_ttl: 14400, always_online: false, development_mode: false, development_mode_expires: null, cache_rules: [] } },
      networkSettings: { ...prev.networkSettings, [zone.id]: { zone_id: zone.id, http2: true, http3: true, websockets: true, grpc: false, onion_routing: 'off', ip_geolocation: true, pseudo_ipv4: 'off' } },
      pageRules: { ...prev.pageRules, [zone.id]: [] },
      scrapeShieldSettings: { ...prev.scrapeShieldSettings, [zone.id]: { zone_id: zone.id, email_obfuscation: false, server_side_excludes: false, hotlink_protection: false } }
    }))
  }, [updateState])

  const deleteZone = useCallback((zoneId) => {
    updateState(prev => ({
      ...prev,
      zones: prev.zones.filter(z => z.id !== zoneId)
    }))
  }, [updateState])

  // DNS helpers
  const getDnsRecords = useCallback((zoneId) => {
    return state.dnsRecords[zoneId] || []
  }, [state.dnsRecords])

  const addDnsRecord = useCallback((zoneId, record) => {
    updateState(prev => ({
      ...prev,
      dnsRecords: {
        ...prev.dnsRecords,
        [zoneId]: [...(prev.dnsRecords[zoneId] || []), record]
      }
    }))
  }, [updateState])

  const updateDnsRecord = useCallback((zoneId, recordId, changes) => {
    updateState(prev => ({
      ...prev,
      dnsRecords: {
        ...prev.dnsRecords,
        [zoneId]: (prev.dnsRecords[zoneId] || []).map(r => r.id === recordId ? { ...r, ...changes } : r)
      }
    }))
  }, [updateState])

  const deleteDnsRecord = useCallback((zoneId, recordId) => {
    updateState(prev => ({
      ...prev,
      dnsRecords: {
        ...prev.dnsRecords,
        [zoneId]: (prev.dnsRecords[zoneId] || []).filter(r => r.id !== recordId)
      }
    }))
  }, [updateState])

  // SSL Settings
  const updateSslSettings = useCallback((zoneId, changes) => {
    updateState(prev => ({
      ...prev,
      sslSettings: {
        ...prev.sslSettings,
        [zoneId]: { ...(prev.sslSettings[zoneId] || {}), ...changes }
      }
    }))
  }, [updateState])

  // Security Settings
  const updateSecuritySettings = useCallback((zoneId, changes) => {
    updateState(prev => ({
      ...prev,
      securitySettings: {
        ...prev.securitySettings,
        [zoneId]: { ...(prev.securitySettings[zoneId] || {}), ...changes }
      }
    }))
  }, [updateState])

  // Firewall Rules
  const getFirewallRules = useCallback((zoneId) => {
    return state.firewallRules[zoneId] || []
  }, [state.firewallRules])

  const addFirewallRule = useCallback((zoneId, rule) => {
    updateState(prev => ({
      ...prev,
      firewallRules: {
        ...prev.firewallRules,
        [zoneId]: [...(prev.firewallRules[zoneId] || []), rule]
      }
    }))
  }, [updateState])

  const updateFirewallRule = useCallback((zoneId, ruleId, changes) => {
    updateState(prev => ({
      ...prev,
      firewallRules: {
        ...prev.firewallRules,
        [zoneId]: (prev.firewallRules[zoneId] || []).map(r => r.id === ruleId ? { ...r, ...changes } : r)
      }
    }))
  }, [updateState])

  const deleteFirewallRule = useCallback((zoneId, ruleId) => {
    updateState(prev => ({
      ...prev,
      firewallRules: {
        ...prev.firewallRules,
        [zoneId]: (prev.firewallRules[zoneId] || []).filter(r => r.id !== ruleId)
      }
    }))
  }, [updateState])

  // Speed Settings
  const updateSpeedSettings = useCallback((zoneId, changes) => {
    updateState(prev => ({
      ...prev,
      speedSettings: {
        ...prev.speedSettings,
        [zoneId]: { ...(prev.speedSettings[zoneId] || {}), ...changes }
      }
    }))
  }, [updateState])

  // Caching Settings
  const updateCachingSettings = useCallback((zoneId, changes) => {
    updateState(prev => ({
      ...prev,
      cachingSettings: {
        ...prev.cachingSettings,
        [zoneId]: { ...(prev.cachingSettings[zoneId] || {}), ...changes }
      }
    }))
  }, [updateState])

  // Page Rules
  const getPageRules = useCallback((zoneId) => {
    return state.pageRules[zoneId] || []
  }, [state.pageRules])

  const addPageRule = useCallback((zoneId, rule) => {
    updateState(prev => ({
      ...prev,
      pageRules: {
        ...prev.pageRules,
        [zoneId]: [...(prev.pageRules[zoneId] || []), rule]
      }
    }))
  }, [updateState])

  const updatePageRule = useCallback((zoneId, ruleId, changes) => {
    updateState(prev => ({
      ...prev,
      pageRules: {
        ...prev.pageRules,
        [zoneId]: (prev.pageRules[zoneId] || []).map(r => r.id === ruleId ? { ...r, ...changes } : r)
      }
    }))
  }, [updateState])

  const deletePageRule = useCallback((zoneId, ruleId) => {
    updateState(prev => ({
      ...prev,
      pageRules: {
        ...prev.pageRules,
        [zoneId]: (prev.pageRules[zoneId] || []).filter(r => r.id !== ruleId)
      }
    }))
  }, [updateState])

  // Network Settings
  const updateNetworkSettings = useCallback((zoneId, changes) => {
    updateState(prev => ({
      ...prev,
      networkSettings: {
        ...prev.networkSettings,
        [zoneId]: { ...(prev.networkSettings[zoneId] || {}), ...changes }
      }
    }))
  }, [updateState])

  // Scrape Shield Settings
  const updateScrapeShieldSettings = useCallback((zoneId, changes) => {
    updateState(prev => ({
      ...prev,
      scrapeShieldSettings: {
        ...prev.scrapeShieldSettings,
        [zoneId]: { ...(prev.scrapeShieldSettings[zoneId] || {}), ...changes }
      }
    }))
  }, [updateState])

  // Notifications
  const markAllNotificationsRead = useCallback(() => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }))
  }, [updateState])

  // Workers
  const addWorkerRoute = useCallback((zoneId, route) => {
    updateState(prev => ({
      ...prev,
      workers: (prev.workers || []).map(w => {
        if (w.name === route.worker) {
          return { ...w, routes: [...(w.routes || []), route] }
        }
        return w
      })
    }))
  }, [updateState])

  const deleteWorkerRoute = useCallback((routeId) => {
    updateState(prev => ({
      ...prev,
      workers: (prev.workers || []).map(w => ({
        ...w,
        routes: (w.routes || []).filter(r => r.id !== routeId)
      }))
    }))
  }, [updateState])

  const getStateDiffPublic = useCallback(() => {
    const initial = getInitialState(sid)
    return getStateDiff(initial, state)
  }, [state, sid])

  const value = {
    state,
    updateState,
    getZone,
    updateZone,
    addZone,
    deleteZone,
    getDnsRecords,
    addDnsRecord,
    updateDnsRecord,
    deleteDnsRecord,
    updateSslSettings,
    updateSecuritySettings,
    getFirewallRules,
    addFirewallRule,
    updateFirewallRule,
    deleteFirewallRule,
    updateSpeedSettings,
    updateCachingSettings,
    getPageRules,
    addPageRule,
    updatePageRule,
    deletePageRule,
    updateNetworkSettings,
    updateScrapeShieldSettings,
    markAllNotificationsRead,
    addWorkerRoute,
    deleteWorkerRoute,
    getStateDiff: getStateDiffPublic
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
