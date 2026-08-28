import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { getDefaultData, getSessionId, fetchCustomState, saveState, getInitialState, initializeData, initialKey } from './dataManager';

const StoreContext = createContext();

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

function deepDiff(initial, current, prefix = '') {
  const diff = {};
  if (initial === current) return diff;
  if (initial == null || current == null || typeof initial !== typeof current) {
    if (initial !== current) {
      diff[prefix || '_root'] = { old: initial, new: current };
    }
    return diff;
  }
  if (Array.isArray(initial) || Array.isArray(current)) {
    if (JSON.stringify(initial) !== JSON.stringify(current)) {
      diff[prefix || '_root'] = { old: initial, new: current };
    }
    return diff;
  }
  if (typeof initial === 'object') {
    const allKeys = new Set([...Object.keys(initial), ...Object.keys(current)]);
    for (const key of allKeys) {
      const path = prefix ? `${prefix}.${key}` : key;
      const sub = deepDiff(initial[key], current[key], path);
      Object.assign(diff, sub);
    }
    return diff;
  }
  if (initial !== current) {
    diff[prefix || '_root'] = { old: initial, new: current };
  }
  return diff;
}

function reducer(prev, action) {
  const newState = { ...prev };

  switch (action.type) {
    case 'LAUNCH_INSTANCE':
      newState.ec2 = [...prev.ec2, action.payload];
      break;
    case 'TERMINATE_INSTANCE':
      newState.ec2 = prev.ec2.filter(i => i.id !== action.payload);
      break;
    case 'UPDATE_INSTANCE_STATE':
      newState.ec2 = prev.ec2.map(i =>
        i.id === action.payload.id
          ? { ...i, state: action.payload.state, ...(action.payload.publicIp !== undefined ? { publicIp: action.payload.publicIp } : {}) }
          : i
      );
      break;
    case 'SET_REGION':
      newState.user = { ...prev.user, region: action.payload };
      break;
    case 'MARK_NOTIFICATION_READ':
      newState.notifications = prev.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      break;
    case 'DISMISS_NOTIFICATION':
      newState.notifications = prev.notifications.filter(n => n.id !== action.payload);
      break;
    case 'ADD_NOTIFICATION': {
      const notif = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      };
      newState.notifications = [notif, ...prev.notifications];
      break;
    }
    case 'CREATE_BUCKET':
      newState.s3 = [...prev.s3, action.payload];
      break;
    case 'DELETE_BUCKET':
      newState.s3 = prev.s3.filter(b => b.name !== action.payload);
      break;
    case 'EMPTY_BUCKET':
      newState.s3 = prev.s3.map(b =>
        b.name === action.payload ? { ...b, objects: [] } : b
      );
      break;
    case 'UPLOAD_OBJECT':
      newState.s3 = prev.s3.map(b =>
        b.name === action.payload.bucketName
          ? { ...b, objects: [...b.objects, action.payload.object] }
          : b
      );
      break;
    case 'DELETE_OBJECT':
      newState.s3 = prev.s3.map(b =>
        b.name === action.payload.bucketName
          ? { ...b, objects: b.objects.filter(o => o.key !== action.payload.key) }
          : b
      );
      break;
    case 'CREATE_FOLDER':
      newState.s3 = prev.s3.map(b =>
        b.name === action.payload.bucketName
          ? { ...b, objects: [...b.objects, { key: action.payload.folderKey, size: 0, lastModified: new Date().toISOString(), storageClass: "Standard", type: "folder" }] }
          : b
      );
      break;
    case 'UPDATE_BUCKET_VERSIONING':
      newState.s3 = prev.s3.map(b =>
        b.name === action.payload.bucketName
          ? { ...b, versioning: action.payload.versioning }
          : b
      );
      break;
    case 'CREATE_FUNCTION':
      newState.lambda = [...prev.lambda, action.payload];
      break;
    case 'DELETE_FUNCTION':
      newState.lambda = prev.lambda.filter(f => f.name !== action.payload);
      break;
    case 'UPDATE_FUNCTION_CODE':
      newState.lambda = prev.lambda.map(f =>
        f.name === action.payload.name
          ? { ...f, code: action.payload.code, lastModified: new Date().toISOString() }
          : f
      );
      break;
    case 'UPDATE_FUNCTION_CONFIG':
      newState.lambda = prev.lambda.map(f =>
        f.name === action.payload.name
          ? {
              ...f,
              description: action.payload.description,
              memorySize: action.payload.memorySize,
              timeout: action.payload.timeout,
              lastModified: new Date().toISOString()
            }
          : f
      );
      break;
    case 'UPDATE_FUNCTION_ENVIRONMENT':
      newState.lambda = prev.lambda.map(f =>
        f.name === action.payload.name
          ? { ...f, environment: action.payload.environment, lastModified: new Date().toISOString() }
          : f
      );
      break;
    case 'CREATE_DB':
      newState.rds = [...prev.rds, action.payload];
      break;
    case 'DELETE_DB':
      newState.rds = prev.rds.filter(db => db.id !== action.payload);
      break;
    case 'UPDATE_DB_STATUS':
      newState.rds = prev.rds.map(db =>
        db.id === action.payload.id
          ? { ...db, status: action.payload.status }
          : db
      );
      break;
    case 'CREATE_USER':
      newState.iam = {
        ...prev.iam,
        users: [...prev.iam.users, action.payload]
      };
      break;
    case 'DELETE_USER':
      newState.iam = {
        ...prev.iam,
        users: prev.iam.users.filter(u => u.name !== action.payload),
        groups: prev.iam.groups.map(g => ({
          ...g,
          users: g.users.filter(u => u !== action.payload)
        }))
      };
      break;
    case 'CREATE_ROLE':
      newState.iam = {
        ...prev.iam,
        roles: [...prev.iam.roles, action.payload]
      };
      break;
    case 'DELETE_ROLE':
      newState.iam = {
        ...prev.iam,
        roles: prev.iam.roles.filter(r => r.name !== action.payload)
      };
      break;
    case 'CREATE_GROUP':
      newState.iam = {
        ...prev.iam,
        groups: [...prev.iam.groups, action.payload]
      };
      break;
    case 'DELETE_GROUP':
      newState.iam = {
        ...prev.iam,
        groups: prev.iam.groups.filter(g => g.name !== action.payload)
      };
      break;
    case 'ADD_USER_TO_GROUP':
      newState.iam = {
        ...prev.iam,
        users: prev.iam.users.map(u =>
          u.name === action.payload.userName
            ? { ...u, groups: [...new Set([...u.groups, action.payload.groupName])] }
            : u
        ),
        groups: prev.iam.groups.map(g =>
          g.name === action.payload.groupName
            ? { ...g, users: [...new Set([...g.users, action.payload.userName])] }
            : g
        )
      };
      break;
    case 'REMOVE_USER_FROM_GROUP':
      newState.iam = {
        ...prev.iam,
        users: prev.iam.users.map(u =>
          u.name === action.payload.userName
            ? { ...u, groups: u.groups.filter(g => g !== action.payload.groupName) }
            : u
        ),
        groups: prev.iam.groups.map(g =>
          g.name === action.payload.groupName
            ? { ...g, users: g.users.filter(u => u !== action.payload.userName) }
            : g
        )
      };
      break;
    case 'CREATE_SECURITY_GROUP':
      newState.securityGroups = [...prev.securityGroups, action.payload];
      break;
    case 'DELETE_SECURITY_GROUP':
      newState.securityGroups = prev.securityGroups.filter(sg => sg.id !== action.payload);
      break;
    case 'CREATE_KEY_PAIR':
      newState.keyPairs = [...prev.keyPairs, action.payload];
      break;
    case 'DELETE_KEY_PAIR':
      newState.keyPairs = prev.keyPairs.filter(kp => kp.name !== action.payload);
      break;
    case 'TOGGLE_FAVORITE': {
      const favs = prev.favorites || [];
      const idx = favs.indexOf(action.payload);
      newState.favorites = idx >= 0 ? favs.filter(f => f !== action.payload) : [...favs, action.payload];
      break;
    }
    case 'ADD_RECENT_SERVICE': {
      const existing = prev.recentServices.filter(s => s.id !== action.payload.id);
      newState.recentServices = [{ ...action.payload, lastVisited: new Date().toISOString() }, ...existing].slice(0, 10);
      break;
    }
    case 'ADD_FLASH': {
      const flash = {
        id: `flash-${Date.now()}`,
        timestamp: Date.now(),
        ...action.payload
      };
      newState.flash = [...(prev.flash || []), flash];
      break;
    }
    case 'DISMISS_FLASH':
      newState.flash = (prev.flash || []).filter(f => f.id !== action.payload);
      break;
    default:
      return prev;
  }
  return newState;
}

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [initialStateData, setInitialStateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const sid = sidRef.current;

    if (sid) {
      const ik = initialKey(sid);
      const isRefresh = localStorage.getItem(ik) !== null;
      if (isRefresh) {
        const data = initializeData(sid);
        setState(data);
        setInitialStateData(getInitialState(sid) || data);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const data = initializeData(sid, customState);
          setState(data);
          setInitialStateData(getInitialState(sid) || data);
          setLoading(false);
        });
      }
    } else {
      const data = initializeData();
      setState(data);
      setInitialStateData(getInitialState() || data);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && state) {
      saveState(state, sidRef.current);
    }
  }, [state, loading]);

  const dispatch = useCallback((action) => {
    setState(prev => reducer(prev, action));
  }, []);

  const addFlash = useCallback((type, message) => {
    dispatch({ type: 'ADD_FLASH', payload: { type, message } });
  }, [dispatch]);

  const getDebugState = useCallback(() => {
    const initial = initialStateData || getDefaultData();
    const current = state;
    const stateDiff = deepDiff(initial, current);
    return { initial_state: initial, current_state: current, state_diff: stateDiff };
  }, [state, initialStateData]);

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: '"Helvetica Neue", -apple-system, sans-serif', color: '#545B64' }}>
        Loading XWS Console...
      </div>
    );
  }

  return (
    <StoreContext.Provider value={{ state, dispatch, getDebugState, addFlash }}>
      {children}
    </StoreContext.Provider>
  );
};
