import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { CreateIssueModal } from './components/CreateIssueModal';
import { NotificationPanel } from './components/NotificationPanel';
import { Dashboard } from './pages/Dashboard';
import { Board } from './pages/Board';
import { Backlog } from './pages/Backlog';
import { Reports } from './pages/Reports';
import { AdvancedSearch } from './pages/AdvancedSearch';
import { Settings } from './pages/Settings';
import { StateInspector } from './pages/StateInspector';
import { X } from 'lucide-react';

// Preserve query params (e.g. ?sid=xxx) when redirecting
function RedirectWithQuery({ to }: { to: string }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

// Keyboard shortcuts help dialog
const KeyboardShortcutsDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const shortcuts = [
    { key: 'C', description: 'Create issue' },
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Esc', description: 'Close dialog' },
    { key: 'J / K', description: 'Next / Previous issue in search results (future)' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <table className="w-full">
            <tbody>
              {shortcuts.map((shortcut) => (
                <tr key={shortcut.key} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4">
                    <kbd className="bg-gray-100 border border-gray-300 rounded px-2 py-1 text-sm font-mono font-medium text-gray-700">
                      {shortcut.key}
                    </kbd>
                  </td>
                  <td className="py-3 text-sm text-gray-700">{shortcut.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Layout = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      return;
    }

    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      setShowCreateModal(true);
    } else if (e.key === '?') {
      e.preventDefault();
      setShowShortcuts(true);
    } else if (e.key === 'Escape') {
      setShowCreateModal(false);
      setShowNotifications(false);
      setShowShortcuts(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        onCreateIssue={() => setShowCreateModal(true)}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />
      <main className="flex-1 ml-64 overflow-hidden">
        <Outlet />
      </main>
      {showCreateModal && (
        <CreateIssueModal onClose={() => setShowCreateModal(false)} />
      )}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
      {showShortcuts && (
        <KeyboardShortcutsDialog onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/go" element={<StateInspector />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="project/:key/board" element={<Board />} />
            <Route path="project/:key/backlog" element={<Backlog />} />
            <Route path="project/:key/reports" element={<Reports />} />
            <Route path="project/:key/settings" element={<Settings />} />
            <Route path="search" element={<AdvancedSearch />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
