import React from 'react';
import { useStore } from '../store/StoreContext';
import { getMethodColor } from '../utils/initialData';
import { X, Plus } from 'lucide-react';
import clsx from 'clsx';

export const TabBar = () => {
  const { state, dispatch } = useStore();
  const { tabs, activeTabId } = state;

  const handleTabClick = (tabId) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  };

  const handleCloseTab = (e, tabId) => {
    e.stopPropagation();
    dispatch({ type: 'CLOSE_TAB', payload: tabId });
  };

  const handleNewTab = () => {
    dispatch({
      type: 'OPEN_TAB',
      payload: {
        name: 'Untitled Request',
        method: 'GET',
        request: null,
        requestId: null,
        collectionId: null,
      }
    });
  };

  return (
    <div className="flex items-center bg-white border-b border-sidebar-border h-9 overflow-x-auto flex-shrink-0">
      <div className="flex items-center h-full min-w-0">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={clsx(
              'tab-item flex items-center gap-1.5 px-3 h-full cursor-pointer border-r border-sidebar-border min-w-0 max-w-[180px] group relative',
              tab.id === activeTabId
                ? 'bg-white'
                : 'bg-gray-50 hover:bg-gray-100'
            )}
          >
            {tab.id === activeTabId && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
            <span
              className="text-[10px] font-bold flex-shrink-0"
              style={{ color: getMethodColor(tab.method || 'GET') }}
            >
              {tab.method || 'GET'}
            </span>
            <span className={clsx(
              'text-xs truncate flex-1 min-w-0',
              tab.id === activeTabId ? 'text-gray-800' : 'text-gray-600',
              !tab.requestId && 'italic'
            )}>
              {tab.name || 'Untitled Request'}
            </span>
            {tab.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            )}
            <button
              onClick={(e) => handleCloseTab(e, tab.id)}
              className="tab-close flex-shrink-0 p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleNewTab}
        className="flex-shrink-0 p-1.5 mx-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        title="New Tab"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
