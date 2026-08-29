import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';
import Dashboard from './pages/Dashboard';
import ProjectLayout from './pages/ProjectLayout';
import ProjectOverview from './pages/ProjectOverview';
import DeploymentsList from './pages/DeploymentsList';
import DeploymentDetail from './pages/DeploymentDetail';
import ProjectSettings from './pages/ProjectSettings';
import SettingsGeneral from './pages/SettingsGeneral';
import SettingsDomains from './pages/SettingsDomains';
import SettingsEnvVars from './pages/SettingsEnvVars';
import SettingsGit from './pages/SettingsGit';
import SettingsFunctions from './pages/SettingsFunctions';
import Analytics from './pages/Analytics';
import SpeedInsights from './pages/SpeedInsights';
import LogsPage from './pages/LogsPage';
import DomainsPage from './pages/DomainsPage';
import NewProject from './pages/NewProject';
import StateInspector from './pages/StateInspector';

function AppInner() {
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(s => !s);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app-layout">
      <Navbar onSearchClick={() => setCmdOpen(true)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewProject />} />
          <Route path="/domains" element={<DomainsPage />} />
          <Route path="/go" element={<StateInspector />} />

          <Route path="/project/:projectId" element={<ProjectLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ProjectOverview />} />
            <Route path="deployments" element={<DeploymentsList />} />
            <Route path="deployments/:deploymentId" element={<DeploymentDetail />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="speed-insights" element={<SpeedInsights />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="settings" element={<ProjectSettings />}>
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<SettingsGeneral />} />
              <Route path="domains" element={<SettingsDomains />} />
              <Route path="environment-variables" element={<SettingsEnvVars />} />
              <Route path="git" element={<SettingsGit />} />
              <Route path="functions" element={<SettingsFunctions />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AppProvider>
  );
}
