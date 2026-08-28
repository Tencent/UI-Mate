import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSessionId, fetchCustomState, initializeData, storageKey, initialKey
} from '../utils/dataManager';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const [sid] = useState(() => getSessionId());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const iKey = initialKey(sid);
    const isRefresh = localStorage.getItem(iKey) !== null;

    if (isRefresh) {
      const data = initializeData(sid);
      setState(data);
      setLoading(false);
    } else {
      fetchCustomState(sid).then(custom => {
        const data = initializeData(sid, custom);
        setState(data);
        setLoading(false);
        // Write initial state to server so /go endpoint works
        if (sid) {
          fetch(`/post?sid=${sid}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'set', state: data })
          }).catch(() => {});
        }
      });
    }
  }, [sid]);

  const saveState = useCallback((newState) => {
    setState(newState);
    localStorage.setItem(storageKey(sid), JSON.stringify(newState));
    // sync to server if we have a sid
    if (sid) {
      fetch(`/post?sid=${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state: newState })
      }).catch(() => {});
    }
  }, [sid]);

  const updateState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(storageKey(sid), JSON.stringify(next));
      if (sid) {
        fetch(`/post?sid=${sid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'set_current', state: next })
        }).catch(() => {});
      }
      return next;
    });
  }, [sid]);

  // Campaign CRUD
  const createCampaign = useCallback((campaign) => {
    updateState(prev => ({
      ...prev,
      campaigns: [...prev.campaigns, campaign]
    }));
  }, [updateState]);

  const updateCampaign = useCallback((id, updates) => {
    updateState(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
    }));
  }, [updateState]);

  const deleteCampaign = useCallback((id) => {
    updateState(prev => ({
      ...prev,
      campaigns: prev.campaigns.map(c => c.id === id ? { ...c, status: 'deleted' } : c)
    }));
  }, [updateState]);

  // AdSet CRUD
  const createAdSet = useCallback((adSet) => {
    updateState(prev => ({
      ...prev,
      adSets: [...prev.adSets, adSet]
    }));
  }, [updateState]);

  const updateAdSet = useCallback((id, updates) => {
    updateState(prev => ({
      ...prev,
      adSets: prev.adSets.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
    }));
  }, [updateState]);

  // Ad CRUD
  const createAd = useCallback((ad) => {
    updateState(prev => ({
      ...prev,
      ads: [...prev.ads, ad]
    }));
  }, [updateState]);

  const updateAd = useCallback((id, updates) => {
    updateState(prev => ({
      ...prev,
      ads: prev.ads.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
    }));
  }, [updateState]);

  // Creative CRUD
  const createCreative = useCallback((creative) => {
    updateState(prev => ({
      ...prev,
      creatives: [...(prev.creatives || []), creative]
    }));
  }, [updateState]);

  // Audience CRUD
  const createAudience = useCallback((audience) => {
    updateState(prev => ({
      ...prev,
      audiences: [...prev.audiences, audience]
    }));
  }, [updateState]);

  const deleteAudience = useCallback((id) => {
    updateState(prev => ({
      ...prev,
      audiences: prev.audiences.filter(a => a.id !== id)
    }));
  }, [updateState]);

  // Toggle status
  const toggleStatus = useCallback((entityType, id) => {
    updateState(prev => {
      const entities = prev[entityType];
      const updated = entities.map(e => {
        if (e.id !== id) return e;
        const newStatus = e.status === 'active' ? 'paused' : 'active';
        const newDelivery = newStatus === 'active' ? 'active' : 'not_delivering';
        return { ...e, status: newStatus, deliveryStatus: newDelivery };
      });
      return { ...prev, [entityType]: updated };
    });
  }, [updateState]);

  // Duplicate entity
  const duplicateEntity = useCallback((entityType, id) => {
    updateState(prev => {
      const entity = prev[entityType].find(e => e.id === id);
      if (!entity) return prev;
      const now = new Date().toISOString();
      const newCampId = `camp_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
      const copy = {
        ...entity,
        id: newCampId,
        name: entity.name + ' (Copy)',
        status: 'draft',
        deliveryStatus: 'not_delivering',
        results: 0, reach: 0, impressions: 0, clicks: 0,
        ctr: 0, cpc: 0, cpm: 0, costPerResult: 0, amountSpent: 0,
        createdAt: now,
        updatedAt: now
      };

      if (entityType !== 'campaigns') {
        return { ...prev, [entityType]: [...prev[entityType], copy] };
      }

      // Deep copy: also clone child adSets and their ads
      const originalAdSets = (prev.adSets || []).filter(a => a.campaignId === id);
      const newAdSets = [];
      const newAds = [];

      originalAdSets.forEach((adSet, adSetIdx) => {
        const newAdSetId = `adset_${Date.now()}_${adSetIdx}_${Math.floor(Math.random() * 1e6)}`;
        newAdSets.push({
          ...adSet,
          id: newAdSetId,
          campaignId: newCampId,
          name: adSet.name + ' (Copy)',
          status: 'draft',
          deliveryStatus: 'not_delivering',
          results: 0, reach: 0, impressions: 0, clicks: 0,
          ctr: 0, cpc: 0, cpm: 0, costPerResult: 0, amountSpent: 0,
          createdAt: now,
          updatedAt: now
        });

        const originalAds = (prev.ads || []).filter(a => a.adSetId === adSet.id);
        originalAds.forEach((ad, adIdx) => {
          newAds.push({
            ...ad,
            id: `ad_${Date.now()}_${adSetIdx}_${adIdx}_${Math.floor(Math.random() * 1e6)}`,
            adSetId: newAdSetId,
            campaignId: newCampId,
            name: ad.name + ' (Copy)',
            status: 'draft',
            deliveryStatus: 'not_delivering',
            results: 0, reach: 0, impressions: 0, clicks: 0,
            ctr: 0, cpc: 0, cpm: 0, costPerResult: 0, amountSpent: 0,
            createdAt: now,
            updatedAt: now
          });
        });
      });

      return {
        ...prev,
        campaigns: [...prev.campaigns, copy],
        adSets: [...(prev.adSets || []), ...newAdSets],
        ads: [...(prev.ads || []), ...newAds]
      };
    });
  }, [updateState]);

  // Bulk actions
  const bulkAction = useCallback((entityType, ids, action) => {
    updateState(prev => {
      let entities = prev[entityType];
      if (action === 'delete') {
        entities = entities.map(e => ids.includes(e.id) ? { ...e, status: 'deleted' } : e);
      } else if (action === 'pause') {
        entities = entities.map(e => ids.includes(e.id) ? { ...e, status: 'paused', deliveryStatus: 'not_delivering' } : e);
      } else if (action === 'activate') {
        entities = entities.map(e => ids.includes(e.id) ? { ...e, status: 'active', deliveryStatus: 'active' } : e);
      } else if (action === 'duplicate') {
        const copies = ids.map(id => {
          const entity = entities.find(e => e.id === id);
          if (!entity) return null;
          return {
            ...entity,
            id: `${entity.id}_copy_${Date.now()}`,
            name: entity.name + ' (Copy)',
            status: 'draft',
            deliveryStatus: 'not_delivering',
            results: 0, reach: 0, impressions: 0, amountSpent: 0,
            createdAt: new Date().toISOString()
          };
        }).filter(Boolean);
        entities = [...entities, ...copies];
      }
      return { ...prev, [entityType]: entities, selectedRows: [] };
    });
  }, [updateState]);

  // Publish campaign with cascade to child adSets and ads
  const publishCampaign = useCallback((id) => {
    updateState(prev => {
      const campaigns = prev.campaigns.map(c =>
        c.id === id ? { ...c, status: 'active', deliveryStatus: 'active', updatedAt: new Date().toISOString() } : c
      );
      const childAdSetIds = prev.adSets.filter(a => a.campaignId === id).map(a => a.id);
      const adSets = prev.adSets.map(a =>
        a.campaignId === id ? { ...a, status: 'active', deliveryStatus: 'active', updatedAt: new Date().toISOString() } : a
      );
      const ads = prev.ads.map(a =>
        childAdSetIds.includes(a.adSetId) ? { ...a, status: 'in_review', reviewStatus: 'pending', updatedAt: new Date().toISOString() } : a
      );
      return { ...prev, campaigns, adSets, ads };
    });
  }, [updateState]);

  // UI state setters
  const setSelectedTab = useCallback((tab) => updateState(prev => ({ ...prev, selectedTab: tab })), [updateState]);
  const setDateRange = useCallback((range) => {
    updateState(prev => {
      // Multipliers per range key
      const multipliers = {
        today: 0.3,
        yesterday: 0.3,
        last_7_days: 0.5,
        last_14_days: 0.8,
        last_30_days: 2.0,
        this_month: 1.8,
        last_month: 1.7,
        maximum: 3.0,
      };
      const rangeKey = typeof range === 'object' ? 'custom' : range;
      const baseMultiplier = multipliers[rangeKey] ?? 1.0;

      // Apply a slight random variation (±15%) to make it feel realistic
      const jitter = () => 0.85 + Math.random() * 0.3;

      const applyMultiplier = (entities) => entities.map(e => {
        if (!e._baseMetrics) {
          // Store base metrics on first mutation
          const base = {
            results: e.results || 0,
            reach: e.reach || 0,
            impressions: e.impressions || 0,
            clicks: e.clicks || 0,
            amountSpent: e.amountSpent || 0,
            costPerResult: e.costPerResult || 0,
            cpc: e.cpc || 0,
            cpm: e.cpm || 0,
          };
          const m = baseMultiplier * jitter();
          return {
            ...e,
            _baseMetrics: base,
            results: Math.round(base.results * m),
            reach: Math.round(base.reach * m),
            impressions: Math.round(base.impressions * m),
            clicks: Math.round(base.clicks * m),
            amountSpent: parseFloat((base.amountSpent * m).toFixed(2)),
            costPerResult: base.costPerResult > 0 ? parseFloat((base.costPerResult * (0.9 + Math.random() * 0.2)).toFixed(2)) : 0,
          };
        } else {
          const base = e._baseMetrics;
          const m = baseMultiplier * jitter();
          return {
            ...e,
            results: Math.round(base.results * m),
            reach: Math.round(base.reach * m),
            impressions: Math.round(base.impressions * m),
            clicks: Math.round(base.clicks * m),
            amountSpent: parseFloat((base.amountSpent * m).toFixed(2)),
            costPerResult: base.costPerResult > 0 ? parseFloat((base.costPerResult * (0.9 + Math.random() * 0.2)).toFixed(2)) : 0,
          };
        }
      });

      return {
        ...prev,
        selectedDateRange: range,
        campaigns: applyMultiplier(prev.campaigns || []),
        adSets: applyMultiplier(prev.adSets || []),
        ads: applyMultiplier(prev.ads || []),
      };
    });
  }, [updateState]);
  const setVisibleColumns = useCallback((cols) => updateState(prev => ({ ...prev, visibleColumns: cols })), [updateState]);
  const setActiveBreakdown = useCallback((val) => updateState(prev => ({ ...prev, activeBreakdown: val })), [updateState]);
  const setFilters = useCallback((filters) => updateState(prev => ({ ...prev, filters })), [updateState]);
  const setSearchQuery = useCallback((q) => updateState(prev => ({ ...prev, searchQuery: q })), [updateState]);
  const setSelectedRows = useCallback((rows) => updateState(prev => ({ ...prev, selectedRows: rows })), [updateState]);
  const setSidebarCollapsed = useCallback((v) => updateState(prev => ({ ...prev, sidebarCollapsed: v })), [updateState]);

  const markNotificationRead = useCallback((id) => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  }, [updateState]);

  const markAllNotificationsRead = useCallback(() => {
    updateState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
  }, [updateState]);

  const updateSettings = useCallback((updates) => {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  }, [updateState]);

  const updateAccount = useCallback((updates) => {
    updateState(prev => ({
      ...prev,
      account: { ...prev.account, ...updates }
    }));
  }, [updateState]);

  const createSavedReport = useCallback((report) => {
    updateState(prev => ({
      ...prev,
      savedReports: [...(prev.savedReports || []), report]
    }));
  }, [updateState]);

  if (loading || !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F0F2F5', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: '#65676B', fontSize: 14 }}>
        Loading...
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      state,
      sid,
      updateState,
      createCampaign, updateCampaign, deleteCampaign, publishCampaign,
      createAdSet, updateAdSet,
      createAd, updateAd,
      createCreative,
      createAudience, deleteAudience,
      toggleStatus,
      duplicateEntity,
      bulkAction,
      setSelectedTab, setDateRange, setVisibleColumns, setActiveBreakdown, setFilters, setSearchQuery,
      setSelectedRows, setSidebarCollapsed,
      markNotificationRead, markAllNotificationsRead,
      updateSettings, updateAccount, createSavedReport,
      saveState
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
