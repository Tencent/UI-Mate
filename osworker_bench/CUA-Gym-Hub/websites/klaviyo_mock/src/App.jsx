import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import CampaignCreate from './pages/CampaignCreate';
import FlowList from './pages/FlowList';
import FlowBuilder from './pages/FlowBuilder';
import SignupFormList from './pages/SignupFormList';
import AudienceLists from './pages/AudienceLists';
import ProfileList from './pages/ProfileList';
import ProfileDetail from './pages/ProfileDetail';
import TemplateList from './pages/TemplateList';
import BrandSettings from './pages/BrandSettings';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import MetricsList from './pages/MetricsList';
import Benchmarks from './pages/Benchmarks';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/campaigns" element={<Layout><CampaignList /></Layout>} />
      <Route path="/campaigns/new" element={<Layout><CampaignCreate /></Layout>} />
      <Route path="/campaigns/:id" element={<Layout><CampaignDetail /></Layout>} />
      <Route path="/flows" element={<Layout><FlowList /></Layout>} />
      <Route path="/flows/:id" element={<Layout><FlowBuilder /></Layout>} />
      <Route path="/signup-forms" element={<Layout><SignupFormList /></Layout>} />
      <Route path="/audience/lists-segments" element={<Layout><AudienceLists /></Layout>} />
      <Route path="/audience/profiles" element={<Layout><ProfileList /></Layout>} />
      <Route path="/audience/profiles/:id" element={<Layout><ProfileDetail /></Layout>} />
      <Route path="/content/templates" element={<Layout><TemplateList /></Layout>} />
      <Route path="/content/brand" element={<Layout><BrandSettings /></Layout>} />
      <Route path="/analytics/dashboards" element={<Layout><AnalyticsDashboard /></Layout>} />
      <Route path="/analytics/metrics" element={<Layout><MetricsList /></Layout>} />
      <Route path="/analytics/benchmarks" element={<Layout><Benchmarks /></Layout>} />
      <Route path="*" element={<RedirectWithQuery to="/" />} />
    </Routes>
  );
}
