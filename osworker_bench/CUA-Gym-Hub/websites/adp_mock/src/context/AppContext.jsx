import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getState, saveState, initializeState, resetState, getInitialState, getStateDiff, createInitialData, getStorageKey, fetchCustomState } from '../utils/dataManager.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setStateInternal] = useState(() => getState())

  // Sync state changes to localStorage + server
  const updateState = useCallback((updater) => {
    setStateInternal(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveState(next)
      return next
    })
  }, [])

  // Initialize: ensure initial state is stored; hydrate from server if SID present
  useEffect(() => {
    const key = getStorageKey()
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('sid')
    if (!localStorage.getItem(key)) {
      if (sid) {
        fetchCustomState(sid).then(serverState => {
          const initial = serverState || createInitialData()
          initializeState(initial)
          setStateInternal(initial)
        })
      } else {
        const initial = createInitialData()
        initializeState(initial)
        setStateInternal(initial)
      }
    }
  }, [])

  // Specific update helpers
  const updateEmployee = useCallback((updates) => {
    updateState(prev => ({ ...prev, employee: { ...prev.employee, ...updates } }))
  }, [updateState])

  const updateAddress = useCallback((updates) => {
    updateState(prev => ({ ...prev, address: { ...prev.address, ...updates } }))
  }, [updateState])

  const updateClockStatus = useCallback((updates) => {
    updateState(prev => ({ ...prev, clockStatus: { ...prev.clockStatus, ...updates } }))
  }, [updateState])

  const addTimeEntry = useCallback((entry) => {
    updateState(prev => ({ ...prev, timeEntries: [...prev.timeEntries, entry] }))
  }, [updateState])

  const updateTimeEntry = useCallback((id, updates) => {
    updateState(prev => ({
      ...prev,
      timeEntries: prev.timeEntries.map(te => te.id === id ? { ...te, ...updates } : te)
    }))
  }, [updateState])

  const addTimeOffRequest = useCallback((request) => {
    updateState(prev => ({
      ...prev,
      timeOffRequests: [...prev.timeOffRequests, request],
    }))
  }, [updateState])

  const updateTimeOffRequest = useCallback((id, updates) => {
    updateState(prev => ({
      ...prev,
      timeOffRequests: prev.timeOffRequests.map(r => r.id === id ? { ...r, ...updates } : r),
    }))
  }, [updateState])

  const updateTimeOffBalance = useCallback((type, updates) => {
    updateState(prev => ({
      ...prev,
      timeOffBalances: prev.timeOffBalances.map(b => {
        if (b.type !== type) return b
        return typeof updates === 'function' ? updates(b) : { ...b, ...updates }
      }),
    }))
  }, [updateState])

  const markNotificationRead = useCallback((id) => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
    }))
  }, [updateState])

  const markAllNotificationsRead = useCallback(() => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
    }))
  }, [updateState])

  const markAnnouncementRead = useCallback((id) => {
    updateState(prev => ({
      ...prev,
      announcements: prev.announcements.map(a => a.id === id ? { ...a, isRead: true } : a),
    }))
  }, [updateState])

  const toggleTodoItem = useCallback((id) => {
    updateState(prev => ({
      ...prev,
      todoItems: prev.todoItems.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t),
    }))
  }, [updateState])

  const addEmergencyContact = useCallback((contact) => {
    updateState(prev => ({ ...prev, emergencyContacts: [...prev.emergencyContacts, contact] }))
  }, [updateState])

  const updateEmergencyContact = useCallback((id, updates) => {
    updateState(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(c => c.id === id ? { ...c, ...updates } : c),
    }))
  }, [updateState])

  const removeEmergencyContact = useCallback((id) => {
    updateState(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter(c => c.id !== id),
    }))
  }, [updateState])

  const addDependent = useCallback((dep) => {
    updateState(prev => ({ ...prev, dependents: [...prev.dependents, dep] }))
  }, [updateState])

  const updateDependent = useCallback((id, updates) => {
    updateState(prev => ({
      ...prev,
      dependents: prev.dependents.map(d => d.id === id ? { ...d, ...updates } : d),
    }))
  }, [updateState])

  const removeDependent = useCallback((id) => {
    updateState(prev => ({
      ...prev,
      dependents: prev.dependents.filter(d => d.id !== id),
    }))
  }, [updateState])

  const updateDirectDeposit = useCallback((id, updates) => {
    updateState(prev => ({
      ...prev,
      directDeposits: prev.directDeposits.map(dd => dd.id === id ? { ...dd, ...updates } : dd),
    }))
  }, [updateState])

  const addDirectDeposit = useCallback((dd) => {
    updateState(prev => ({ ...prev, directDeposits: [...prev.directDeposits, dd] }))
  }, [updateState])

  const updatePendingApproval = useCallback((id, updates) => {
    updateState(prev => ({
      ...prev,
      pendingApprovals: prev.pendingApprovals.map(a => a.id === id ? { ...a, ...updates } : a),
    }))
  }, [updateState])

  const reset = useCallback(() => {
    resetState()
    const fresh = createInitialData()
    setStateInternal(fresh)
  }, [])

  const unreadNotificationCount = state.notifications ? state.notifications.filter(n => !n.isRead).length : 0

  return (
    <AppContext.Provider value={{
      state,
      updateState,
      updateEmployee,
      updateAddress,
      updateClockStatus,
      addTimeEntry,
      updateTimeEntry,
      addTimeOffRequest,
      updateTimeOffRequest,
      updateTimeOffBalance,
      markNotificationRead,
      markAllNotificationsRead,
      markAnnouncementRead,
      toggleTodoItem,
      addEmergencyContact,
      updateEmergencyContact,
      removeEmergencyContact,
      addDependent,
      updateDependent,
      removeDependent,
      updateDirectDeposit,
      addDirectDeposit,
      updatePendingApproval,
      reset,
      unreadNotificationCount,
      getInitialState,
      getStateDiff,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
