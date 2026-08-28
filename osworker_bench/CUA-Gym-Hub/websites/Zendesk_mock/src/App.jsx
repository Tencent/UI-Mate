import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ViewsPage from './pages/ViewsPage.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import NewTicket from './pages/NewTicket.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import OrganizationsPage from './pages/OrganizationsPage.jsx';
import OrganizationDetail from './pages/OrganizationDetail.jsx';
import ReportingPage from './pages/ReportingPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import Go from './pages/Go.jsx';
import { useApp } from './context/AppContext.jsx';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

export default function App() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useApp();

  const query = searchParams.toString();
  const appendQuery = useCallback((p) => query ? `${p}?${query}` : p, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const tag = e.target.tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;

      if (e.key === 'Escape') {
        setShowShortcuts(false);
        return;
      }

      if (isEditable) return;

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('.header-search input');
        if (searchInput) searchInput.focus();
        return;
      }

      if (e.key === 'n') {
        e.preventDefault();
        navigate(appendQuery('/tickets/new'));
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      // j/k navigation in ticket list
      if (e.key === 'j' || e.key === 'k') {
        const rows = document.querySelectorAll('.ticket-table tbody tr');
        if (rows.length === 0) return;
        const focused = document.querySelector('.ticket-table tbody tr.keyboard-focused');
        let idx = -1;
        if (focused) {
          rows.forEach((r, i) => { if (r === focused) idx = i; });
          focused.classList.remove('keyboard-focused');
        }
        if (e.key === 'j') idx = Math.min(idx + 1, rows.length - 1);
        else idx = Math.max(idx - 1, 0);
        rows[idx]?.classList.add('keyboard-focused');
        rows[idx]?.scrollIntoView({ block: 'nearest' });
        return;
      }

      // Enter to open focused ticket
      if (e.key === 'Enter') {
        const focused = document.querySelector('.ticket-table tbody tr.keyboard-focused');
        if (focused) {
          e.preventDefault();
          focused.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, appendQuery]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <Header />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/views/:viewId" element={<ViewsPage />} />
            <Route path="/tickets/new" element={<NewTicket />} />
            <Route path="/tickets/:ticketId" element={<TicketDetail />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:userId" element={<CustomerDetail />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/organizations/:orgId" element={<OrganizationDetail />} />
            <Route path="/reporting" element={<ReportingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/go" element={<Go />} />
            <Route path="*" element={<RedirectWithQuery to="/" />} />
          </Routes>
        </div>
      </div>
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
