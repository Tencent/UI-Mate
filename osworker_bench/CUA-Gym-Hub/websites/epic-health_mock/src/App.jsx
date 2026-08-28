import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { Component } from 'react'
import { AppProvider } from './context/AppContext'
import Header from './components/Header'
import NavBar from './components/NavBar'
import Sidebar from './components/Sidebar'
import './App.css'

// Pages
import Home from './pages/Home'
import Visits from './pages/Visits'
import VisitDetail from './pages/VisitDetail'
import ScheduleAppointment from './pages/ScheduleAppointment'
import Messages from './pages/Messages'
import ComposeMessage from './pages/ComposeMessage'
import MessageThread from './pages/MessageThread'
import TestResults from './pages/TestResults'
import TestResultDetail from './pages/TestResultDetail'
import Medications from './pages/Medications'
import MedicationDetail from './pages/MedicationDetail'
import MedicationRefill from './pages/MedicationRefill'
import HealthSummary from './pages/HealthSummary'
import MedicalHistory from './pages/MedicalHistory'
import Letters from './pages/Letters'
import Billing from './pages/Billing'
import BillingDetail from './pages/BillingDetail'
import PayBill from './pages/PayBill'
import Insurance from './pages/Insurance'
import PreventiveCare from './pages/PreventiveCare'
import CareTeam from './pages/CareTeam'
import Settings from './pages/Settings'
import Go from './pages/Go'

// Error boundary to prevent full-page crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#c00', marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: '#555', marginBottom: 20, fontSize: 14 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            style={{ padding: '10px 24px', background: '#0075BC', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
          >
            Return to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Header />
      <NavBar />
      <Sidebar />
      <main className="app-main">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/visits" element={<Visits />} />
            <Route path="/visits/:id" element={<VisitDetail />} />
            <Route path="/schedule" element={<ScheduleAppointment />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/compose" element={<ComposeMessage />} />
            <Route path="/messages/:threadId" element={<MessageThread />} />
            <Route path="/test-results" element={<TestResults />} />
            <Route path="/test-results/:id" element={<TestResultDetail />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="/medications/refill" element={<MedicationRefill />} />
            <Route path="/medications/:id" element={<MedicationDetail />} />
            <Route path="/health-summary" element={<HealthSummary />} />
            <Route path="/medical-history" element={<MedicalHistory />} />
            <Route path="/letters" element={<Letters />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/billing/pay" element={<PayBill />} />
            <Route path="/billing/:id" element={<BillingDetail />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/preventive-care" element={<PreventiveCare />} />
            <Route path="/care-team" element={<CareTeam />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<RedirectWithQuery to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppProvider>
          <Routes>
            <Route path="/go" element={<Go />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </AppProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
