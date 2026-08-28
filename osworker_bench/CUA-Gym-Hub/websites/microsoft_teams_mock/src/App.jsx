import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import LeftRail from './components/LeftRail.jsx';
import ActivityPage from './pages/Activity.jsx';
import ChatPage from './pages/Chat.jsx';
import TeamsPage from './pages/Teams.jsx';
import CalendarPage from './pages/Calendar.jsx';
import CallsPage from './pages/Calls.jsx';
import FilesPage from './pages/Files.jsx';
import SettingsPage from './pages/Settings.jsx';
import Go from './pages/Go.jsx';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function MainLayout({ children }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const qStr = query ? `?${query}` : '';

  useEffect(() => {
    function handleKeyDown(e) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === '1') { e.preventDefault(); navigate(`/activity${qStr}`); }
      if (ctrl && e.key === '2') { e.preventDefault(); navigate(`/chat${qStr}`); }
      if (ctrl && e.key === '3') { e.preventDefault(); navigate(`/teams${qStr}`); }
      if (ctrl && e.key === '4') { e.preventDefault(); navigate(`/calendar${qStr}`); }
      if (ctrl && e.key === '5') { e.preventDefault(); navigate(`/calls${qStr}`); }
      if (ctrl && e.key === 'n') { e.preventDefault(); navigate(`/chat${qStr}`); }
      // Escape: close modals handled by individual components
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, qStr]);

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <LeftRail />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route path="/" element={<MainLayout><RedirectWithQuery to="/chat" /></MainLayout>} />
      <Route path="/activity" element={<MainLayout><ActivityPage /></MainLayout>} />
      <Route path="/chat" element={<MainLayout><ChatPage /></MainLayout>} />
      <Route path="/chat/:chatId" element={<MainLayout><ChatPage /></MainLayout>} />
      <Route path="/teams" element={<MainLayout><TeamsPage /></MainLayout>} />
      <Route path="/teams/:teamId" element={<MainLayout><TeamsPage /></MainLayout>} />
      <Route path="/teams/:teamId/channels/:channelId" element={<MainLayout><TeamsPage /></MainLayout>} />
      <Route path="/calendar" element={<MainLayout><CalendarPage /></MainLayout>} />
      <Route path="/calls" element={<MainLayout><CallsPage /></MainLayout>} />
      <Route path="/files" element={<MainLayout><FilesPage /></MainLayout>} />
      <Route path="/settings" element={<MainLayout><SettingsPage /></MainLayout>} />
    </Routes>
  );
}
