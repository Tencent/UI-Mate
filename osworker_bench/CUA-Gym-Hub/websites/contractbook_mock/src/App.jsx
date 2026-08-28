import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Contracts from './pages/Contracts';
import ContractDetail from './pages/ContractDetail';
import Templates from './pages/Templates';
import Tasks from './pages/Tasks';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import Go from './pages/Go';
import Toast from './components/Toast';
import NewContractModal from './components/NewContractModal';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function AppShell() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const handleSetCollapsed = (val) => {
    setCollapsed(val);
    localStorage.setItem('sidebar_collapsed', String(val));
  };

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={handleSetCollapsed} />
      <div className={`app-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header collapsed={collapsed} setCollapsed={handleSetCollapsed} />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<RedirectWithQuery to="/contracts" />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:id" element={<Templates />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <Toast />
      <NewContractModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
