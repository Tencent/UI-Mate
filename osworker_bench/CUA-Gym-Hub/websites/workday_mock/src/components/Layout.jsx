import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalNav from './GlobalNav';
import { X } from 'lucide-react';

const shortcuts = [
  { key: '/', description: 'Focus search bar' },
  { key: 'Escape', description: 'Close any open modal or panel' },
  { key: 'n', description: 'New task (on Inbox page)' },
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'g h', description: 'Go to Home/Dashboard' },
  { key: 'g i', description: 'Go to Inbox' },
  { key: 'g t', description: 'Go to Time & Absence' },
];

function ShortcutsModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 divide-y divide-gray-100">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-700">{s.description}</span>
              <kbd className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs font-mono font-bold text-gray-700">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <div className="px-5 pb-4">
          <p className="text-xs text-gray-400 text-center">Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">Escape</kbd> to close</p>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isGoPage = location.pathname === '/go';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalNavOpen, setGlobalNavOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleKeyDown = useCallback((e) => {
    // Don't trigger when typing in inputs
    const tag = e.target.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;

    if (e.key === 'Escape') {
      // Close any open modal/panel
      setShowShortcuts(false);
      setGlobalNavOpen(false);
      return;
    }

    if (isInput) return;

    if (e.key === '/') {
      e.preventDefault();
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (searchInput) searchInput.focus();
      return;
    }

    if (e.key === '?') {
      e.preventDefault();
      setShowShortcuts(prev => !prev);
      return;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isGoPage) {
    return <Outlet />;
  }

  const sidebarMargin = !sidebarOpen ? 'ml-0' : sidebarCollapsed ? 'ml-[52px]' : 'ml-60';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={`flex-1 ${sidebarMargin} flex flex-col min-w-0 transition-all duration-200`}>
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onOpenGlobalNav={() => setGlobalNavOpen(true)}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <GlobalNav isOpen={globalNavOpen} onClose={() => setGlobalNavOpen(false)} />
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
