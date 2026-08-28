import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MailRoute from './routes/MailRoute';
import CalendarRoute from './routes/CalendarRoute';
import PeopleRoute from './routes/PeopleRoute';
import TasksRoute from './routes/TasksRoute';
import GoRoute from './routes/GoRoute';
import ComposeModal from './components/ComposeModal';
import SettingsPanel from './components/SettingsPanel';

// Preserve query params (e.g. ?sid=xxx) when redirecting
function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function LayoutContent() {
  const { state } = useStore();

  // Apply theme to document
  React.useEffect(() => {
    const theme = state.settings?.theme || 'light';
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }, [state.settings?.theme]);

  return (
    <>
      <Outlet />
      {state.composeState && <ComposeModal />}
      {state.settingsOpen && <SettingsPanel />}
    </>
  );
}

const Layout = () => (
  <div className="flex flex-col h-screen w-screen overflow-hidden">
    <Header />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        <LayoutContent />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/go" element={<GoRoute />} />

          <Route element={<Layout />}>
            <Route path="/" element={<RedirectWithQuery to="/mail/inbox" />} />
            <Route path="/mail" element={<RedirectWithQuery to="/mail/inbox" />} />
            <Route path="/mail/:folderId" element={<MailRoute />} />
            <Route path="/calendar" element={<CalendarRoute />} />
            <Route path="/people" element={<PeopleRoute />} />
            <Route path="/tasks" element={<TasksRoute />} />
            <Route path="*" element={<RedirectWithQuery to="/mail/inbox" />} />
          </Route>
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
}

export default App;
