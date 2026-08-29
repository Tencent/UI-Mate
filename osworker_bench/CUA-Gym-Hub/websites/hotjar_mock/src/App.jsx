import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Heatmaps from './pages/Heatmaps.jsx'
import { RecordingsList, RecordingPlayer } from './pages/Recordings.jsx'
import { SurveysList, SurveyBuilder, SurveyDetail } from './pages/Surveys.jsx'
import Feedback from './pages/Feedback.jsx'
import Highlights from './pages/Highlights.jsx'
import Trends from './pages/Trends.jsx'
import Funnels from './pages/Funnels.jsx'
import Events from './pages/Events.jsx'
import Settings from './pages/Settings.jsx'
import Interviews from './pages/Interviews.jsx'
import Go from './pages/Go.jsx'
import './styles/global.css'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Header />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function FullLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Go route - raw JSON, no layout */}
          <Route path="/go" element={<Go />} />

          {/* Recording player - full layout no header */}
          <Route path="/recordings/:id" element={
            <FullLayout>
              <RecordingPlayer />
            </FullLayout>
          } />

          {/* Survey builder - full layout no header */}
          <Route path="/surveys/new" element={
            <FullLayout>
              <SurveyBuilder />
            </FullLayout>
          } />

          {/* Standard layout routes */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><Dashboard /></div></AppLayout>} />
          <Route path="/dashboard/:dashboardId" element={<AppLayout><div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><Dashboard /></div></AppLayout>} />
          <Route path="/highlights" element={<AppLayout><div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><Highlights /></div></AppLayout>} />
          <Route path="/highlights/:collectionId" element={<AppLayout><div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><Highlights /></div></AppLayout>} />
          <Route path="/trends" element={<AppLayout><Trends /></AppLayout>} />
          <Route path="/funnels" element={<AppLayout><Funnels /></AppLayout>} />
          <Route path="/recordings" element={<AppLayout><RecordingsList /></AppLayout>} />
          <Route path="/heatmaps" element={<AppLayout><div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><Heatmaps /></div></AppLayout>} />
          <Route path="/heatmaps/:id" element={<AppLayout><div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><Heatmaps /></div></AppLayout>} />
          <Route path="/feedback" element={<AppLayout><Feedback /></AppLayout>} />
          <Route path="/surveys" element={<AppLayout><SurveysList /></AppLayout>} />
          <Route path="/surveys/:id" element={<AppLayout><SurveyDetail /></AppLayout>} />
          <Route path="/events" element={<AppLayout><Events /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><Settings /></div></AppLayout>} />
          <Route path="/interviews" element={<AppLayout><Interviews /></AppLayout>} />

          {/* Catch-all redirect */}
          <Route path="*" element={<RedirectWithQuery to="/" />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
