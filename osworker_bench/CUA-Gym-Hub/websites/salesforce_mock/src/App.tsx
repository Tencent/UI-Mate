
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import { Accounts } from './pages/Accounts';
import { AccountDetail } from './pages/AccountDetail';
import { Contacts } from './pages/Contacts';
import { ContactDetail } from './pages/ContactDetail';
import { Opportunities } from './pages/Opportunities';
import { OpportunityDetail } from './pages/OpportunityDetail';
import { Cases } from './pages/Cases';
import { CaseDetail } from './pages/CaseDetail';
import { Partners } from './pages/Partners';
import { PartnerDetail } from './pages/PartnerDetail';
import { Chatter } from './pages/Chatter';
import { Files } from './pages/Files';
import { Dashboards } from './pages/Dashboards';
import { StateInspector } from './pages/StateInspector';
import { Reports } from './pages/Reports';
import { Calendar } from './pages/Calendar';
import { Toast } from './components/Toast';
import { UserProfile } from './pages/UserProfile';
import { UserSettings } from './pages/UserSettings';
import { SetupHome } from './pages/SetupHome';
import { LeadObjectManager } from './pages/LeadObjectManager';
import { LeadSourcePicklist } from './pages/LeadSourcePicklist';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Preserve query params (e.g. ?sid=xxx) when redirecting
function RedirectWithQuery({ to }: { to: string }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const showToast = (message: string, type: ToastMessage['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppProvider>
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopNav onShowToast={showToast} />
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <main style={{ flex: 1, overflow: 'auto', padding: '24px', background: 'var(--bg)' }}>
              <Routes>
                <Route path="/" element={<Home onShowToast={showToast} />} />
                <Route path="/leads" element={<Leads onShowToast={showToast} />} />
                <Route path="/leads/:id" element={<LeadDetail onShowToast={showToast} />} />
                <Route path="/accounts" element={<Accounts onShowToast={showToast} />} />
                <Route path="/accounts/:id" element={<AccountDetail onShowToast={showToast} />} />
                <Route path="/contacts" element={<Contacts onShowToast={showToast} />} />
                <Route path="/contacts/:id" element={<ContactDetail onShowToast={showToast} />} />
                <Route path="/opportunities" element={<Opportunities onShowToast={showToast} />} />
                <Route path="/opportunities/:id" element={<OpportunityDetail onShowToast={showToast} />} />
                <Route path="/cases" element={<Cases onShowToast={showToast} />} />
                <Route path="/cases/:id" element={<CaseDetail onShowToast={showToast} />} />
                <Route path="/partners" element={<Partners onShowToast={showToast} />} />
                <Route path="/partners/:id" element={<PartnerDetail onShowToast={showToast} />} />
                <Route path="/chatter" element={<Chatter onShowToast={showToast} />} />
                <Route path="/files" element={<Files onShowToast={showToast} />} />
                <Route path="/dashboards" element={<Dashboards onShowToast={showToast} />} />
                <Route path="/reports" element={<Reports onShowToast={showToast} />} />
                <Route path="/calendar" element={<Calendar onShowToast={showToast} />} />
                <Route path="/profile" element={<UserProfile onShowToast={showToast} />} />
                <Route path="/settings" element={<UserSettings onShowToast={showToast} />} />
                <Route path="/setup" element={<SetupHome />} />
                <Route path="/setup/object-manager/lead" element={<LeadObjectManager />} />
                <Route path="/setup/object-manager/lead/fields/:fieldId" element={<LeadSourcePicklist onShowToast={showToast} />} />
                <Route path="/lightning/setup/SetupOneHome/home" element={<RedirectWithQuery to="/setup" />} />
                <Route path="/go" element={<StateInspector />} />
                <Route path="*" element={<RedirectWithQuery to="/" />} />
              </Routes>
            </main>
          </div>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
