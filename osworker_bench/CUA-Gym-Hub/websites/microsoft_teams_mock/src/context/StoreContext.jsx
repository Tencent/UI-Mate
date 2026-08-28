// Compatibility shim: pages were written against an older `StoreContext`
// API but this mock uses `AppContext`. Re-export everything plus a `useStore`
// alias so `import { useStore } from '../context/StoreContext'` works.
import { useContext, createContext } from 'react';
import * as AppCtx from './AppContext';

export * from './AppContext';

// Try to find a hook to alias as useStore
const candidate =
  AppCtx.useApp ||
  AppCtx.useAppContext ||
  AppCtx.useStore ||
  null;

export const useStore = candidate || function useStoreFallback() {
  return { state: null, dispatch: () => {} };
};

export const StoreProvider = AppCtx.AppProvider || AppCtx.StoreProvider || (({ children }) => children);
