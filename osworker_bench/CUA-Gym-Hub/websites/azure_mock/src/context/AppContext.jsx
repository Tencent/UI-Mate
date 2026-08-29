import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { getSessionId, fetchCustomState, initializeData, saveState, getInitialState, initialKey, getDefaultData } from '../utils/dataManager';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    // Resource Groups
    case 'CREATE_RESOURCE_GROUP': {
      const newRG = {
        id: `rg-${Date.now()}`,
        ...action.payload,
        provisioningState: 'Succeeded',
        createdDate: new Date().toISOString()
      };
      return { ...state, resourceGroups: [...state.resourceGroups, newRG] };
    }
    case 'DELETE_RESOURCE_GROUP':
      return { ...state, resourceGroups: state.resourceGroups.filter(rg => rg.name !== action.payload) };
    case 'UPDATE_RG_TAGS':
      return {
        ...state,
        resourceGroups: state.resourceGroups.map(rg =>
          rg.name === action.payload.name ? { ...rg, tags: action.payload.tags } : rg
        )
      };

    // Virtual Machines
    case 'CREATE_VM': {
      const newVM = {
        id: `vm-${Date.now()}`,
        ...action.payload,
        status: 'Running',
        powerState: 'VM running',
        createdDate: new Date().toISOString()
      };
      return { ...state, virtualMachines: [...state.virtualMachines, newVM] };
    }
    case 'START_VM':
      return {
        ...state,
        virtualMachines: state.virtualMachines.map(vm =>
          vm.id === action.payload ? { ...vm, status: 'Running', powerState: 'VM running' } : vm
        )
      };
    case 'STOP_VM':
      return {
        ...state,
        virtualMachines: state.virtualMachines.map(vm =>
          vm.id === action.payload ? { ...vm, status: 'Stopped', powerState: 'VM deallocated' } : vm
        )
      };
    case 'RESTART_VM':
      return {
        ...state,
        virtualMachines: state.virtualMachines.map(vm =>
          vm.id === action.payload ? { ...vm, status: 'Running', powerState: 'VM running' } : vm
        )
      };
    case 'DELETE_VM':
      return { ...state, virtualMachines: state.virtualMachines.filter(vm => vm.id !== action.payload) };
    case 'UPDATE_VM_TAGS':
      return {
        ...state,
        virtualMachines: state.virtualMachines.map(vm =>
          vm.id === action.payload.id ? { ...vm, tags: action.payload.tags } : vm
        )
      };

    // Storage Accounts
    case 'CREATE_STORAGE_ACCOUNT': {
      const newSA = {
        id: `sa-${Date.now()}`,
        ...action.payload,
        kind: 'StorageV2',
        status: 'Available',
        containers: [],
        createdDate: new Date().toISOString()
      };
      return { ...state, storageAccounts: [...state.storageAccounts, newSA] };
    }
    case 'DELETE_STORAGE_ACCOUNT':
      return { ...state, storageAccounts: state.storageAccounts.filter(sa => sa.id !== action.payload) };
    case 'UPDATE_STORAGE_TAGS':
      return {
        ...state,
        storageAccounts: state.storageAccounts.map(sa =>
          sa.id === action.payload.id ? { ...sa, tags: action.payload.tags } : sa
        )
      };
    case 'CREATE_CONTAINER':
      return {
        ...state,
        storageAccounts: state.storageAccounts.map(sa =>
          sa.id === action.payload.storageAccountId
            ? {
                ...sa,
                containers: [...sa.containers, {
                  id: `container-${Date.now()}`,
                  name: action.payload.name,
                  publicAccessLevel: action.payload.publicAccessLevel || 'Private',
                  leaseState: 'Available',
                  lastModified: new Date().toISOString(),
                  blobCount: 0
                }]
              }
            : sa
        )
      };

    // NSG Rules
    case 'ADD_NSG_RULE': {
      const { nsgId, rule, direction } = action.payload;
      const field = direction === 'Inbound' ? 'inboundRules' : 'outboundRules';
      return {
        ...state,
        networkSecurityGroups: state.networkSecurityGroups.map(nsg =>
          nsg.id === nsgId ? { ...nsg, [field]: [...nsg[field], rule] } : nsg
        )
      };
    }
    case 'DELETE_NSG_RULE': {
      const { nsgId: nId, ruleName, direction: dir } = action.payload;
      const f = dir === 'Inbound' ? 'inboundRules' : 'outboundRules';
      return {
        ...state,
        networkSecurityGroups: state.networkSecurityGroups.map(nsg =>
          nsg.id === nId ? { ...nsg, [f]: nsg[f].filter(r => r.name !== ruleName) } : nsg
        )
      };
    }

    // Notifications
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'DISMISS_ALL_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };

    // Favorites
    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.find(f => f.name === action.payload.name);
      if (exists) {
        return { ...state, favorites: state.favorites.filter(f => f.name !== action.payload.name) };
      }
      return { ...state, favorites: [...state.favorites, { id: `fav-${Date.now()}`, ...action.payload }] };
    }

    // Settings
    case 'UPDATE_SETTINGS':
      return { ...state, portalSettings: { ...state.portalSettings, ...action.payload } };

    // Cost / Budget
    case 'CREATE_BUDGET': {
      const newBudget = {
        id: `budget-${Date.now()}`,
        ...action.payload,
        currentSpend: 0,
        status: 'OK'
      };
      return {
        ...state,
        costManagement: {
          ...state.costManagement,
          budgets: [...state.costManagement.budgets, newBudget]
        }
      };
    }

    case 'UPDATE_APP_TAGS':
      return {
        ...state,
        appServices: state.appServices.map(app =>
          app.id === action.payload.id ? { ...app, tags: action.payload.tags } : app
        )
      };
    case 'UPDATE_SQL_TAGS':
      return {
        ...state,
        sqlDatabases: state.sqlDatabases.map(db =>
          db.id === action.payload.id ? { ...db, tags: action.payload.tags } : db
        )
      };
    case 'UPDATE_APP_STATUS':
      return {
        ...state,
        appServices: state.appServices.map(app =>
          app.id === action.payload.id ? { ...app, status: action.payload.status } : app
        )
      };
    case 'DELETE_APP_SERVICE':
      return { ...state, appServices: state.appServices.filter(app => app.id !== action.payload) };
    case 'DELETE_SQL_DATABASE':
      return { ...state, sqlDatabases: state.sqlDatabases.filter(db => db.id !== action.payload) };

    // Recent Resources
    case 'UPDATE_RECENT_RESOURCES': {
      const entry = action.payload;
      const filtered = state.recentResources.filter(r => r.name !== entry.name);
      const updated = [{ ...entry, lastViewed: new Date().toISOString() }, ...filtered].slice(0, 10);
      return { ...state, recentResources: updated };
    }

    // Full state replace (for session injection)
    case 'SET_STATE':
      return { ...action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null);
  const sidRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      const sid = getSessionId();
      sidRef.current = sid;
      const customState = await fetchCustomState(sid);
      const data = initializeData(sid, customState);
      dispatch({ type: 'SET_STATE', payload: data });
    };
    init();
  }, []);

  useEffect(() => {
    if (state) {
      saveState(state, sidRef.current);
    }
  }, [state]);

  const getAllResources = useCallback(() => {
    if (!state) return [];
    const resources = [];
    (state.virtualMachines || []).forEach(vm => resources.push({ ...vm, type: 'Virtual machine', detailPath: `/virtual-machines/${vm.id}` }));
    (state.storageAccounts || []).forEach(sa => resources.push({ ...sa, type: 'Storage account', detailPath: `/storage-accounts/${sa.id}` }));
    (state.appServices || []).forEach(app => resources.push({ ...app, type: 'App Service', detailPath: `/app-services/${app.id}` }));
    (state.sqlDatabases || []).forEach(db => resources.push({ ...db, type: 'SQL database', detailPath: `/sql-databases/${db.id}` }));
    (state.virtualNetworks || []).forEach(vn => resources.push({ ...vn, type: 'Virtual network', detailPath: `/virtual-networks/${vn.id}` }));
    (state.networkSecurityGroups || []).forEach(nsg => resources.push({ ...nsg, type: 'Network security group', detailPath: `/network-security-groups/${nsg.id}` }));
    return resources;
  }, [state]);

  const getStateDiff = useCallback(() => {
    if (!state) return {};
    const sid = sidRef.current;
    const stored = getInitialState(sid);
    const initial = stored || getDefaultData();
    const diff = {};
    for (const key in state) {
      if (JSON.stringify(state[key]) !== JSON.stringify(initial[key])) {
        diff[key] = { initial: initial[key], current: state[key] };
      }
    }
    return diff;
  }, [state]);

  if (!state) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: '"Segoe UI", Inter, sans-serif', color: '#605e5c' }}>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ state, dispatch, getAllResources, getStateDiff, sid: sidRef.current }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
