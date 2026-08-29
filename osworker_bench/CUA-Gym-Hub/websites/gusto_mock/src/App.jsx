import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'

import Home from './pages/Home'
import TeamMembers from './pages/TeamMembers'
import EmployeeProfile from './pages/EmployeeProfile'
import OrgChart from './pages/OrgChart'
import TeamInsights from './pages/TeamInsights'
import Performance from './pages/Performance'
import CompanyDetails from './pages/CompanyDetails'
import RunPayroll from './pages/RunPayroll'
import PayrollHistory from './pages/PayrollHistory'
import PayContractors from './pages/PayContractors'
import TimeTracking from './pages/TimeTracking'
import TimeOff from './pages/TimeOff'
import Benefits from './pages/Benefits'
import TaxesCompliance from './pages/TaxesCompliance'
import Reports from './pages/Reports'
import Documents from './pages/Documents'
import Settings from './pages/Settings'
import Go from './pages/Go'
import Refer from './pages/Refer'
import AppDirectory from './pages/AppDirectory'
import HelpCenter from './pages/HelpCenter'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function InnerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/people/team-members" element={<TeamMembers />} />
      <Route path="/people/team-members/:id" element={<EmployeeProfile />} />
      <Route path="/people/org-chart" element={<OrgChart />} />
      <Route path="/people/team-insights" element={<TeamInsights />} />
      <Route path="/people/performance" element={<Performance />} />
      <Route path="/company" element={<CompanyDetails />} />
      <Route path="/payroll/run" element={<RunPayroll />} />
      <Route path="/payroll/history" element={<PayrollHistory />} />
      <Route path="/payroll/contractors" element={<PayContractors />} />
      <Route path="/time-tools/time-tracking" element={<TimeTracking />} />
      <Route path="/time-tools/time-off" element={<TimeOff />} />
      <Route path="/benefits" element={<Benefits />} />
      <Route path="/taxes" element={<TaxesCompliance />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/app-directory" element={<AppDirectory />} />
      <Route path="/refer" element={<Refer />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="*" element={<RedirectWithQuery to="/" />} />
    </Routes>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route path="/*" element={
        <Layout>
          <InnerRoutes />
        </Layout>
      } />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
