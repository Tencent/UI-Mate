import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppShell from './components/AppShell'
import Home from './pages/Home'
import ChartBuilder from './pages/ChartBuilder'
import UserProfiles from './pages/UserProfiles'
import UserProfileDetail from './pages/UserProfileDetail'
import AllContent from './pages/AllContent'
import DashboardView from './pages/DashboardView'
import DataEvents from './pages/DataEvents'
import Cohorts from './pages/Cohorts'
import CreateCohort from './pages/CreateCohort'
import LiveEvents from './pages/LiveEvents'
import AskAmplitude from './pages/AskAmplitude'
import SessionReplay from './pages/SessionReplay'
import Notebook from './pages/Notebook'
import Experiment from './pages/Experiment'
import ExperimentList from './pages/ExperimentList'
import UserPaths from './pages/UserPaths'
import Go from './pages/Go'
import './styles/global.css'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route path="/*" element={
        <AppShell>
          <Routes>
            <Route path="/" element={<RedirectWithQuery to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/content" element={<AllContent />} />
            <Route path="/chart/new" element={<ChartBuilder />} />
            <Route path="/chart/:id" element={<ChartBuilder />} />
            <Route path="/dashboard/:id" element={<DashboardView />} />
            <Route path="/users" element={<UserProfiles />} />
            <Route path="/users/:id" element={<UserProfileDetail />} />
            <Route path="/cohorts" element={<Cohorts />} />
            <Route path="/cohorts/new" element={<CreateCohort />} />
            <Route path="/data/events" element={<DataEvents />} />
            <Route path="/notebooks/:id" element={<Notebook />} />
            <Route path="/live-events" element={<LiveEvents />} />
            <Route path="/ask" element={<AskAmplitude />} />
            <Route path="/session-replay" element={<SessionReplay />} />
            <Route path="/experiments" element={<ExperimentList />} />
            <Route path="/experiment/:id" element={<Experiment />} />
            <Route path="/paths" element={<UserPaths />} />
            <Route path="*" element={<RedirectWithQuery to="/home" />} />
          </Routes>
        </AppShell>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
