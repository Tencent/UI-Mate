import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignNew from './pages/CampaignNew';
import CampaignDetail from './pages/CampaignDetail';
import CampaignReport from './pages/CampaignReport';
import CampaignEditor from './pages/CampaignEditor';
import Automations from './pages/Automations';
import AutomationPrebuilt from './pages/AutomationPrebuilt';
import AutomationDetail from './pages/AutomationDetail';
import Audience from './pages/Audience';
import ContactDetail from './pages/ContactDetail';
import Segments from './pages/Segments';
import Tags from './pages/Tags';
import ImportContacts from './pages/ImportContacts';
import Analytics from './pages/Analytics';
import ContentStudio from './pages/ContentStudio';
import LandingPages from './pages/LandingPages';
import Settings from './pages/Settings';
import SignupForms from './pages/SignupForms';
import Surveys from './pages/Surveys';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route path="/campaigns/:id/edit" element={<Layout hideSidebar><CampaignEditor /></Layout>} />
      <Route path="/campaigns/new" element={<Layout hideSidebar><CampaignNew /></Layout>} />
      <Route path="/campaigns/:id/setup" element={<Layout hideSidebar><CampaignNew /></Layout>} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id/report" element={<CampaignReport />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/automations/prebuilt" element={<AutomationPrebuilt />} />
        <Route path="/automations/:id" element={<AutomationDetail />} />
        <Route path="/audience" element={<Audience />} />
        <Route path="/audience/segments" element={<Segments />} />
        <Route path="/audience/tags" element={<Tags />} />
        <Route path="/audience/import" element={<ImportContacts />} />
        <Route path="/audience/signup-forms" element={<SignupForms />} />
        <Route path="/audience/:id" element={<ContactDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/content" element={<ContentStudio />} />
        <Route path="/landing-pages" element={<LandingPages />} />
        <Route path="/surveys" element={<Surveys />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<RedirectWithQuery to="/" />} />
    </Routes>
  );
}
