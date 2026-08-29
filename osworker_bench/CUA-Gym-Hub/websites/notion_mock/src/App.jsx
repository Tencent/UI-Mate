import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store/store';
import { Sidebar, SearchModal } from './components/Sidebar';
import { Page } from './pages/Page';
import { Go } from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

const Layout = () => {
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const { state, undo, redo, addPage } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+K: Search
      if (isMod && e.key === 'k') {
        e.preventDefault();
        setShowGlobalSearch(prev => !prev);
        return;
      }

      // Cmd+N: New page
      if (isMod && e.key === 'n') {
        e.preventDefault();
        const pageId = addPage(null);
        navigate(`/page/${pageId}`);
        return;
      }

      // Cmd+\: Toggle sidebar
      if (isMod && e.key === '\\') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-sidebar'));
        return;
      }

      // Cmd+[: Navigate back
      if (isMod && e.key === '[') {
        e.preventDefault();
        window.history.back();
        return;
      }

      // Cmd+]: Navigate forward
      if (isMod && e.key === ']') {
        e.preventDefault();
        window.history.forward();
        return;
      }

      // Cmd+Z: Undo
      if (isMod && !e.shiftKey && e.key === 'z') {
        // Only capture if not inside a contentEditable
        const active = document.activeElement;
        if (active && (active.contentEditable === 'true' || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          return; // let native undo handle it
        }
        e.preventDefault();
        undo();
        return;
      }

      // Cmd+Shift+Z: Redo
      if (isMod && e.shiftKey && e.key === 'z') {
        const active = document.activeElement;
        if (active && (active.contentEditable === 'true' || active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          return;
        }
        e.preventDefault();
        redo();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, addPage, state.pages, navigate]);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-full overflow-hidden">
        <Routes>
          <Route path="/page/:pageId" element={<Page />} />
          <Route path="/" element={<WelcomeRedirect />} />
        </Routes>
      </div>
      {showGlobalSearch && <SearchModal onClose={() => setShowGlobalSearch(false)} />}
    </div>
  );
};

const WelcomeRedirect = () => {
  const { state, loading } = useStore();
  const [searchParams] = useSearchParams();

  // Wait for state initialization to complete
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  // Guard against empty state
  if (!state.pages || Object.keys(state.pages).length === 0) {
    return <div className="p-8">No pages found. Please clear local storage and reload.</div>;
  }

  // Redirect to the first page found, preserving query params
  const firstPageId = Object.keys(state.pages)[0];
  const query = searchParams.toString();
  const target = `/page/${firstPageId}`;
  return <Navigate to={query ? `${target}?${query}` : target} replace />;
};

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route path="/*" element={<Layout />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
