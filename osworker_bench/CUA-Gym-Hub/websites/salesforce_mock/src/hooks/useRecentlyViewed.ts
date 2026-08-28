
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RecentItem } from '../types';

export function useRecentlyViewed(type: string, id: string | undefined, name: string | undefined, path: string) {
  const { state, updateState } = useApp();

  useEffect(() => {
    if (!id || !name) return;

    const newItem: RecentItem = {
      type,
      id,
      name,
      path,
      timestamp: new Date().toISOString(),
    };

    const filtered = state.recentlyViewed.filter(item => item.id !== id);
    const updated = [newItem, ...filtered].slice(0, 10);

    // Only update if the top item changed (avoid infinite loop)
    if (state.recentlyViewed[0]?.id !== id) {
      updateState({ recentlyViewed: updated });
    }
  }, [id, name]); // eslint-disable-line react-hooks/exhaustive-deps
}
