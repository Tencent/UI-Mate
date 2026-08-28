import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardList from './pages/DashboardList';
import DashboardDetail from './pages/DashboardDetail';
import InfrastructureHosts from './pages/InfrastructureHosts';
import InfrastructureHostMap from './pages/InfrastructureHostMap';
import InfrastructureContainers from './pages/InfrastructureContainers';
import MonitorList from './pages/MonitorList';
import MonitorDetail from './pages/MonitorDetail';
import CreateMonitor from './pages/CreateMonitor';
import LogExplorer from './pages/LogExplorer';
import APMServiceList from './pages/APMServiceList';
import APMServiceDetail from './pages/APMServiceDetail';
import APMTraces from './pages/APMTraces';
import APMServiceMap from './pages/APMServiceMap';
import MetricsExplorer from './pages/MetricsExplorer';
import Events from './pages/Events';
import Incidents from './pages/Incidents';
import Notebooks from './pages/Notebooks';
import Security from './pages/Security';
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
      <Route element={<Layout />}>
        <Route path="/" element={<RedirectWithQuery to="/dashboards" />} />
        <Route path="/dashboards" element={<DashboardList />} />
        <Route path="/dashboards/:id" element={<DashboardDetail />} />
        <Route path="/infrastructure/hosts" element={<InfrastructureHosts />} />
        <Route path="/infrastructure/host-map" element={<InfrastructureHostMap />} />
        <Route path="/infrastructure/containers" element={<InfrastructureContainers />} />
        <Route path="/monitors" element={<MonitorList />} />
        <Route path="/monitors/new" element={<CreateMonitor />} />
        <Route path="/monitors/:id" element={<MonitorDetail />} />
        <Route path="/logs" element={<LogExplorer />} />
        <Route path="/apm/services" element={<APMServiceList />} />
        <Route path="/apm/services/:name" element={<APMServiceDetail />} />
        <Route path="/apm/traces" element={<APMTraces />} />
        <Route path="/apm/service-map" element={<APMServiceMap />} />
        <Route path="/metrics" element={<MetricsExplorer />} />
        <Route path="/events" element={<Events />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/notebooks" element={<Notebooks />} />
        <Route path="/security" element={<Security />} />
        <Route path="*" element={<RedirectWithQuery to="/dashboards" />} />
      </Route>
    </Routes>
  );
}
