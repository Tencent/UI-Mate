import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import TopBar from './components/TopBar';
import IconSidebar from './components/IconSidebar';
import Home from './pages/Home';
import Workspace from './pages/Workspace';
import RunsTable from './pages/RunsTable';
import RunDetail from './pages/RunDetail';
import RunOverview from './pages/RunOverview';
import RunCharts from './pages/RunCharts';
import RunSystem from './pages/RunSystem';
import RunLogs from './pages/RunLogs';
import RunFiles from './pages/RunFiles';
import Sweeps from './pages/Sweeps';
import SweepDetail from './pages/SweepDetail';
import Artifacts from './pages/Artifacts';
import ArtifactDetail from './pages/ArtifactDetail';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import ProjectOverview from './pages/ProjectOverview';
import ProfileSettings from './pages/ProfileSettings';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <TopBar />
      <div className="app-body">
        <IconSidebar />
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route path="/settings/profile" element={<AppLayout><ProfileSettings /></AppLayout>} />
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/:entity/:project/workspace" element={<AppLayout><Workspace /></AppLayout>} />
      <Route path="/:entity/:project/runs" element={<AppLayout><RunsTable /></AppLayout>} />
      <Route path="/:entity/:project/runs/:runId" element={<AppLayout><RunDetail /></AppLayout>}>
        <Route index element={<RedirectWithQuery to="overview" />} />
        <Route path="overview" element={<RunOverview />} />
        <Route path="charts" element={<RunCharts />} />
        <Route path="system" element={<RunSystem />} />
        <Route path="logs" element={<RunLogs />} />
        <Route path="files" element={<RunFiles />} />
      </Route>
      <Route path="/:entity/:project/sweeps" element={<AppLayout><Sweeps /></AppLayout>} />
      <Route path="/:entity/:project/sweeps/:sweepId" element={<AppLayout><SweepDetail /></AppLayout>} />
      <Route path="/:entity/:project/artifacts" element={<AppLayout><Artifacts /></AppLayout>} />
      <Route path="/:entity/:project/artifacts/:artifactName/:version" element={<AppLayout><ArtifactDetail /></AppLayout>} />
      <Route path="/:entity/:project/reports" element={<AppLayout><Reports /></AppLayout>} />
      <Route path="/:entity/:project/reports/:reportId" element={<AppLayout><ReportDetail /></AppLayout>} />
      <Route path="/:entity/:project/overview" element={<AppLayout><ProjectOverview /></AppLayout>} />
      <Route path="/:entity/:project" element={<RedirectWithQuery to="workspace" />} />
      <Route path="*" element={<RedirectWithQuery to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
