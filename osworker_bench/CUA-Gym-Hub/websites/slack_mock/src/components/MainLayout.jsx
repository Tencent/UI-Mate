
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThreadPanel from './ThreadPanel';
import StatusBar from './StatusBar';
import QuickSwitcher from './QuickSwitcher';
import { useApp } from '../context/AppContext';
import './MainLayout.css';

function MainLayout() {
  const { activeThread } = useApp();
  const [showQuickSwitcher, setShowQuickSwitcher] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowQuickSwitcher(prev => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="main-layout">
      <div className="main-layout-body">
        <Sidebar />
        <div className="content-wrapper">
          <div className="content-area">
            <Outlet />
          </div>
          {activeThread && <ThreadPanel />}
        </div>
      </div>
      <StatusBar />
      <QuickSwitcher
        isOpen={showQuickSwitcher}
        onClose={() => setShowQuickSwitcher(false)}
      />
    </div>
  );
}

export default MainLayout;
