import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import Go from './pages/Go';
import Dashboard from './pages/Dashboard';
import ContactsList from './pages/contacts/ContactsList';
import ContactDetail from './pages/contacts/ContactDetail';
import EmailList from './pages/marketing/EmailList';
import EmailEditor from './pages/marketing/EmailEditor';
import { CampaignsList, CampaignDetail } from './pages/marketing/Campaigns';
import { FormsList, FormBuilder } from './pages/marketing/Forms';
import { WorkflowsList, WorkflowBuilder } from './pages/automations/Workflows';
import Lists from './pages/Lists';
import {
  CompaniesList,
  DealsList,
  SocialPosts,
  AdsPage,
  CTAsList,
  LandingPagesList,
  LandingPageEditor,
  Analytics,
  SettingsPage
} from './pages/misc/Pages';
import './styles/global.css';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* State inspection — no layout */}
          <Route path="/go" element={<Go />} />

          {/* Full-screen editors (no sidebar) */}
          <Route path="/marketing/email/new" element={<EmailEditor />} />
          <Route path="/marketing/email/:id" element={<EmailEditor />} />
          <Route path="/marketing/forms/new" element={<FormBuilder />} />
          <Route path="/marketing/forms/:id" element={<FormBuilder />} />
          <Route path="/marketing/landing-pages/:id" element={<LandingPageEditor />} />
          <Route path="/automations/workflows/new" element={<WorkflowBuilder />} />
          <Route path="/automations/workflows/:id" element={<WorkflowBuilder />} />

          {/* Main app layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />

            {/* CRM */}
            <Route path="/contacts" element={<ContactsList />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/companies" element={<CompaniesList />} />
            <Route path="/deals" element={<DealsList />} />
            <Route path="/lists" element={<Lists />} />

            {/* Marketing */}
            <Route path="/marketing/email" element={<EmailList />} />
            <Route path="/marketing/campaigns" element={<CampaignsList />} />
            <Route path="/marketing/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/marketing/forms" element={<FormsList />} />
            <Route path="/marketing/social" element={<SocialPosts />} />
            <Route path="/marketing/ads" element={<AdsPage />} />
            <Route path="/marketing/ctas" element={<CTAsList />} />
            <Route path="/marketing/landing-pages" element={<LandingPagesList />} />

            {/* Automations */}
            <Route path="/automations/workflows" element={<WorkflowsList />} />

            {/* Reports */}
            <Route path="/reports/dashboards" element={<Dashboard />} />
            <Route path="/reports/dashboards/:id" element={<Dashboard />} />
            <Route path="/reports/analytics" element={<Analytics />} />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
