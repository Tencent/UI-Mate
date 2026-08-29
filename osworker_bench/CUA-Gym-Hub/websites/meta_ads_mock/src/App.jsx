import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import Shell from './components/Shell';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import AccountOverviewPage from './pages/AccountOverviewPage';
import AudiencesPage from './pages/AudiencesPage';
import EventsManagerPage from './pages/EventsManagerPage';
import ReportingPage from './pages/ReportingPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';
import Go from './pages/Go';
import './styles/globals.css';

// Preserve ?sid= through redirects
function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <Routes>
            <Route path="/go" element={<Go />} />
            <Route element={<Shell />}>
              <Route index element={<RedirectWithQuery to="/campaigns" />} />
              <Route path="/campaigns" element={<CampaignsPage defaultTab="campaigns" />} />
              <Route path="/campaigns/:campaignId" element={<CampaignDetailPage />} />
              <Route path="/ad-sets" element={<CampaignsPage defaultTab="adSets" />} />
              <Route path="/ads" element={<CampaignsPage defaultTab="ads" />} />
              <Route path="/account-overview" element={<AccountOverviewPage />} />
              <Route path="/audiences" element={<AudiencesPage />} />
              <Route path="/events-manager" element={<EventsManagerPage />} />
              <Route path="/reporting" element={<ReportingPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
