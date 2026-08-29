import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import IssuesListPage from './pages/IssuesListPage.jsx'
import IssueDetailPage from './pages/IssueDetailPage.jsx'
import ProjectsListPage from './pages/ProjectsListPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import PerformancePage from './pages/PerformancePage.jsx'
import ReleasesPage from './pages/ReleasesPage.jsx'
import AlertsPage from './pages/AlertsPage.jsx'
import DashboardsListPage from './pages/DashboardsListPage.jsx'
import DashboardDetailPage from './pages/DashboardDetailPage.jsx'
import DiscoverPage from './pages/DiscoverPage.jsx'
import UserFeedbackPage from './pages/UserFeedbackPage.jsx'
import MonitorsPage from './pages/MonitorsPage.jsx'
import ActivityPage from './pages/ActivityPage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import Go from './pages/Go.jsx'

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '"Rubik", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    color: '#2B2233',
    backgroundColor: '#FFFFFF',
  },
  main: {
    marginLeft: 220,
    flex: 1,
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
    overflowY: 'auto',
  }
}

// Global reset styles
const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #FFFFFF; }
  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; font-family: inherit; }
  input, select, textarea { font-family: inherit; }
  * { scrollbar-width: thin; scrollbar-color: #E2DBE8 transparent; }
`

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <BrowserRouter>
        <div style={styles.app}>
          <Sidebar />
          <main style={styles.main}>
            <Routes>
              <Route path="/" element={<RedirectWithQuery to="/issues/" />} />
              <Route path="/issues/" element={<IssuesListPage />} />
              <Route path="/issues/:issueId/" element={<IssueDetailPage />} />
              <Route path="/projects/" element={<ProjectsListPage />} />
              <Route path="/projects/:projectSlug/" element={<ProjectDetailPage />} />
              <Route path="/performance/" element={<PerformancePage />} />
              <Route path="/releases/" element={<ReleasesPage />} />
              <Route path="/alerts/" element={<AlertsPage />} />
              <Route path="/dashboards/" element={<DashboardsListPage />} />
              <Route path="/dashboards/:dashboardId/" element={<DashboardDetailPage />} />
              <Route path="/discover/" element={<DiscoverPage />} />
              <Route path="/user-feedback/" element={<UserFeedbackPage />} />
              <Route path="/monitors/" element={<MonitorsPage />} />
              <Route path="/activity/" element={<ActivityPage />} />
              <Route path="/stats/" element={<StatsPage />} />
              <Route path="/settings/" element={<SettingsPage />} />
              <Route path="/go" element={<Go />} />
              <Route path="*" element={<RedirectWithQuery to="/issues/" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </>
  )
}
