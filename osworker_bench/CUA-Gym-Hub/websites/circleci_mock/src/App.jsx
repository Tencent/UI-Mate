import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Home from './pages/Home.jsx';
import Pipelines from './pages/Pipelines.jsx';
import PipelineDetail from './pages/PipelineDetail.jsx';
import WorkflowDetail from './pages/WorkflowDetail.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Projects from './pages/Projects.jsx';
import ProjectSettings from './pages/ProjectSettings.jsx';
import Insights from './pages/Insights.jsx';
import InsightsDetail from './pages/InsightsDetail.jsx';
import Runners from './pages/Runners.jsx';
import Deploys from './pages/Deploys.jsx';
import OrgSettings from './pages/OrgSettings.jsx';
import Plan from './pages/Plan.jsx';
import Go from './pages/Go.jsx';
import './styles/global.css';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function SessionProvider({ children }) {
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid') || sessionStorage.getItem('mock_sid') || 'default';
  return <AppProvider key={sid}>{children}</AppProvider>;
}

function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<RedirectWithQuery to="/pipelines" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/pipelines" element={<Pipelines />} />
          <Route path="/pipelines/:pipelineId" element={<PipelineDetail />} />
          <Route path="/pipelines/:pipelineId/workflows/:workflowId" element={<WorkflowDetail />} />
          <Route path="/pipelines/:pipelineId/workflows/:workflowId/jobs/:jobId" element={<JobDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectSlug/settings" element={<ProjectSettings />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/insights/:projectSlug/:workflowName" element={<InsightsDetail />} />
          <Route path="/runners" element={<Runners />} />
          <Route path="/deploys" element={<Deploys />} />
          <Route path="/settings" element={<OrgSettings />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="*" element={<RedirectWithQuery to="/pipelines" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/go" element={
          <SessionProvider>
            <Go />
          </SessionProvider>
        } />
        <Route path="/*" element={
          <SessionProvider>
            <AppLayout />
          </SessionProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}
