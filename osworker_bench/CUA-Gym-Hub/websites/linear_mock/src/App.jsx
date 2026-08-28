import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import CreateIssueModal from './components/CreateIssueModal.jsx';
import CommandPalette from './components/CommandPalette.jsx';

import Inbox from './pages/Inbox.jsx';
import MyIssues from './pages/MyIssues.jsx';
import TeamIssues from './pages/TeamIssues.jsx';
import Backlog from './pages/Backlog.jsx';
import Triage from './pages/Triage.jsx';
import CyclesList from './pages/CyclesList.jsx';
import CycleDetail from './pages/CycleDetail.jsx';
import ProjectsList from './pages/ProjectsList.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import IssueDetail from './pages/IssueDetail.jsx';
import ViewsList from './pages/ViewsList.jsx';
import ViewDetail from './pages/ViewDetail.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Settings from './pages/Settings.jsx';
import Go from './pages/Go.jsx';

import './App.css';

function RedirectWithSid({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function ShortcutHelp({ onClose }) {
  const SHORTCUTS = [
    { group: 'Navigation', keys: [
      { combo: 'G then I', desc: 'Go to Inbox' },
      { combo: 'G then M', desc: 'Go to My Issues' },
      { combo: 'G then B', desc: 'Go to Backlog' },
      { combo: 'G then C', desc: 'Go to Cycles' },
      { combo: 'G then P', desc: 'Go to Projects' },
      { combo: 'G then R', desc: 'Go to Roadmap' },
      { combo: 'G then S', desc: 'Go to Settings' },
      { combo: '[', desc: 'Toggle sidebar' },
    ]},
    { group: 'General', keys: [
      { combo: 'C', desc: 'Create new issue' },
      { combo: '⌘K', desc: 'Open command palette' },
      { combo: '?', desc: 'Show keyboard shortcuts' },
      { combo: 'Esc', desc: 'Close modal / panel' },
    ]},
    { group: 'Issue list', keys: [
      { combo: 'J / ↓', desc: 'Focus next issue' },
      { combo: 'K / ↑', desc: 'Focus previous issue' },
      { combo: 'Space', desc: 'Open issue peek' },
      { combo: 'F', desc: 'Open filter bar' },
      { combo: '⌘B', desc: 'Toggle board view' },
    ]},
  ];

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="shortcuts-modal">
        <div className="shortcuts-header">
          <span>Keyboard shortcuts</span>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', cursor: 'pointer' }}>✕</button>
        </div>
        <div className="shortcuts-body">
          {SHORTCUTS.map(g => (
            <div key={g.group} className="shortcuts-group">
              <div className="shortcuts-group-title">{g.group}</div>
              {g.keys.map(k => (
                <div key={k.combo} className="shortcut-row">
                  <span className="shortcut-desc">{k.desc}</span>
                  <kbd className="shortcut-key">{k.combo}</kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sid = params.get('sid');
  const toPath = p => sid ? `${p}?sid=${sid}` : p;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const gKeyRef = useRef(false);
  const gTimerRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    const tag = document.activeElement?.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;

    if (e.key === 'Escape') {
      setShowCreateModal(false);
      setShowCommandPalette(false);
      setShowShortcuts(false);
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowCommandPalette(v => !v);
      return;
    }

    if (isInput) return;

    if (e.key === '?') {
      setShowShortcuts(v => !v);
      return;
    }

    if (e.key === '[') {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
      return;
    }

    if (e.key === 'c' || e.key === 'C') {
      setShowCreateModal(true);
      return;
    }

    if (e.key === 'g' || e.key === 'G') {
      gKeyRef.current = true;
      clearTimeout(gTimerRef.current);
      gTimerRef.current = setTimeout(() => { gKeyRef.current = false; }, 500);
      return;
    }

    if (gKeyRef.current) {
      clearTimeout(gTimerRef.current);
      gKeyRef.current = false;
      const firstTeam = state.teams?.[0];
      switch (e.key.toLowerCase()) {
        case 'i': navigate(toPath('/inbox')); break;
        case 'm': navigate(toPath('/my-issues')); break;
        case 'b': if (firstTeam) navigate(toPath(`/team/${firstTeam.id}/backlog`)); break;
        case 'c': if (firstTeam) navigate(toPath(`/team/${firstTeam.id}/cycles`)); break;
        case 'p': if (firstTeam) navigate(toPath(`/team/${firstTeam.id}/projects`)); break;
        case 'r': navigate(toPath('/roadmap')); break;
        case 's': navigate(toPath('/settings')); break;
        default: break;
      }
      return;
    }
  }, [navigate, dispatch, sid, state.teams, toPath]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (location.pathname === '/go') {
    return <Go />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        onCreateIssue={() => setShowCreateModal(true)}
        onCommandPalette={() => setShowCommandPalette(true)}
      />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<RedirectWithSid to="/inbox" />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/my-issues" element={<MyIssues />} />
          <Route path="/team/:teamId/issues" element={<TeamIssues />} />
          <Route path="/team/:teamId/board" element={<TeamIssues />} />
          <Route path="/team/:teamId/backlog" element={<Backlog />} />
          <Route path="/team/:teamId/triage" element={<Triage />} />
          <Route path="/team/:teamId/cycles" element={<CyclesList />} />
          <Route path="/team/:teamId/cycles/:cycleId" element={<CycleDetail />} />
          <Route path="/team/:teamId/projects" element={<ProjectsList />} />
          <Route path="/project/:projectId" element={<ProjectDetail />} />
          <Route path="/issue/:issueId" element={<IssueDetail />} />
          <Route path="/views" element={<ViewsList />} />
          <Route path="/views/:viewId" element={<ViewDetail />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<RedirectWithSid to="/inbox" />} />
        </Routes>
      </main>

      {showCreateModal && (
        <CreateIssueModal onClose={() => setShowCreateModal(false)} />
      )}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onCreateIssue={() => { setShowCommandPalette(false); setShowCreateModal(true); }}
        />
      )}
      {showShortcuts && <ShortcutHelp onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
