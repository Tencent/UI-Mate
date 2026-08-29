import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './store';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Pages
import Dashboard from './pages/Dashboard';
import ProjectOverview from './pages/project/ProjectOverview';
import Pipelines from './pages/project/Pipelines';
import PipelineDetail from './pages/project/PipelineDetail';
import MergeRequests from './pages/project/MergeRequests';
import MergeRequestDetail from './pages/project/MergeRequestDetail';
import CreateMergeRequest from './pages/project/CreateMergeRequest';
import Issues from './pages/project/Issues';
import Wiki from './pages/project/Wiki';
import Registry from './pages/project/Registry';
import Security from './pages/project/Security';
import Analytics from './pages/project/Analytics';
import Milestones from './pages/project/Milestones';
import Releases from './pages/project/Releases';
import Snippets from './pages/Snippets';
import Go from './pages/Go';

// Preserve query params (e.g. ?sid=xxx) when redirecting
function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

const Layout = () => (
  <div className="flex min-h-screen bg-white">
    <Sidebar />
    <div className="flex-1 ml-64">
      <TopBar />
      <main className="mt-14 p-6 min-h-[calc(100vh-3.5rem)]">
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="snippets" element={<Snippets />} />

            <Route path="projects/:projectId" element={<Outlet />}>
              <Route index element={<ProjectOverview />} />
              <Route path="pipelines" element={<Pipelines />} />
              <Route path="pipelines/:pipelineId" element={<PipelineDetail />} />
              <Route path="merge_requests" element={<MergeRequests />} />
              <Route path="merge_requests/new" element={<CreateMergeRequest />} />
              <Route path="merge_requests/:mrId" element={<MergeRequestDetail />} />
              <Route path="issues" element={<Issues />} />
              <Route path="wiki" element={<Wiki />} />
              <Route path="registry" element={<Registry />} />
              <Route path="security" element={<Security />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="milestones" element={<Milestones />} />
              <Route path="releases" element={<Releases />} />
            </Route>
          </Route>
          <Route path="/go" element={<Go />} />
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
