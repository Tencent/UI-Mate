import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import TopNav from './components/TopNav/TopNav';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Pipeline from './pages/Pipeline';
import JobCandidates from './pages/JobCandidates';
import Candidates from './pages/Candidates';
import CandidateProfile from './pages/CandidateProfile';
import ScorecardForm from './pages/ScorecardForm';
import Interviews from './pages/Interviews';
import Offers from './pages/Offers';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import Settings from './pages/Settings';
import Go from './pages/Go';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function Layout({ children }) {
  return (
    <div className="app-layout">
      <TopNav />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RedirectWithQuery to="/dashboard" />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
      <Route path="/jobs/:jobId" element={<Layout><JobDetail /></Layout>} />
      <Route path="/jobs/:jobId/pipeline" element={<Layout><Pipeline /></Layout>} />
      <Route path="/jobs/:jobId/candidates" element={<Layout><JobCandidates /></Layout>} />
      <Route path="/candidates" element={<Layout><Candidates /></Layout>} />
      <Route path="/candidates/:candidateId" element={<Layout><CandidateProfile /></Layout>} />
      <Route path="/candidates/:candidateId/scorecard/:scorecardId" element={<Layout><ScorecardForm /></Layout>} />
      <Route path="/interviews" element={<Layout><Interviews /></Layout>} />
      <Route path="/offers" element={<Layout><Offers /></Layout>} />
      <Route path="/reports" element={<Layout><Reports /></Layout>} />
      <Route path="/reports/:reportId" element={<Layout><ReportDetail /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/go" element={<Go />} />
      <Route path="*" element={<RedirectWithQuery to="/dashboard" />} />
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
