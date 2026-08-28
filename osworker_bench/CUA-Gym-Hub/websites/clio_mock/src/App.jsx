import { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import Matters from './pages/Matters'
import MatterDetail from './pages/MatterDetail'
import Contacts from './pages/Contacts'
import ContactDetail from './pages/ContactDetail'
import Activities from './pages/Activities'
import Tasks from './pages/Tasks'
import CalendarPage from './pages/CalendarPage'
import Billing from './pages/Billing'
import BillDetail from './pages/BillDetail'
import Documents from './pages/Documents'
import Communications from './pages/Communications'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import AccountsPage from './pages/AccountsPage'
import OnlinePaymentsPage from './pages/OnlinePaymentsPage'
import AppIntegrationsPage from './pages/AppIntegrationsPage'
import Go from './pages/Go'
import {
  MatterModal, ContactModal, TimeEntryModal, ExpenseModal,
  TaskModal, EventModal, CommunicationModal, GenerateBillModal
} from './components/Modals'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [modal, setModal] = useState(null)
  const sidebarWidth = collapsed ? 56 : 200
  const nKeyRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (e.type === 'openModal') setModal(e.detail)
      if (e.type === 'openTimerEntry') setModal({ type: 'timeEntry', ...e.detail })
    }
    window.addEventListener('openModal', handler)
    window.addEventListener('openTimerEntry', handler)
    return () => {
      window.removeEventListener('openModal', handler)
      window.removeEventListener('openTimerEntry', handler)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      // Skip if focused in an input
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') {
          document.activeElement.blur()
        }
        return
      }

      // Escape: close modal
      if (e.key === 'Escape') {
        setModal(null)
        return
      }

      // Ctrl+K or /: focus search
      if ((e.ctrlKey && e.key === 'k') || e.key === '/') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="Search"]')
        if (searchInput) searchInput.focus()
        return
      }

      // N then M: new matter
      // N then T: new time entry
      // N then C: new contact
      if (e.key === 'n' || e.key === 'N') {
        nKeyRef.current = Date.now()
        return
      }
      if (nKeyRef.current && (Date.now() - nKeyRef.current) < 1000) {
        if (e.key === 'm' || e.key === 'M') {
          e.preventDefault()
          setModal({ type: 'matter' })
          nKeyRef.current = null
          return
        }
        if (e.key === 't' || e.key === 'T') {
          e.preventDefault()
          setModal({ type: 'timeEntry', duration: 0, description: '' })
          nKeyRef.current = null
          return
        }
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault()
          setModal({ type: 'contact' })
          nKeyRef.current = null
          return
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const closeModal = () => setModal(null)

  const renderModal = () => {
    if (!modal) return null
    switch (modal.type) {
      case 'matter': return <MatterModal onClose={closeModal} />
      case 'contact': return <ContactModal onClose={closeModal} />
      case 'timeEntry': return <TimeEntryModal onClose={closeModal} prefill={{ duration: modal.duration, description: modal.description, matterId: modal.matterId }} />
      case 'expense': return <ExpenseModal onClose={closeModal} />
      case 'task': return <TaskModal onClose={closeModal} />
      case 'event': return <EventModal onClose={closeModal} />
      case 'communication': return <CommunicationModal onClose={closeModal} />
      case 'bill': return <GenerateBillModal onClose={closeModal} />
      default: return null
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: sidebarWidth, transition: 'margin-left 0.2s ease', minHeight: 0 }}>
        <TopBar sidebarWidth={sidebarWidth} />
        <main style={{
          flex: 1,
          marginTop: 52,
          background: '#F5F6FA',
          overflowY: 'auto',
          padding: '24px',
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/matters" element={<Matters />} />
            <Route path="/matters/:id" element={<MatterDetail />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactDetail />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/billing/:id" element={<BillDetail />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/online-payments" element={<OnlinePaymentsPage />} />
            <Route path="/app-integrations" element={<AppIntegrationsPage />} />
            <Route path="*" element={<RedirectWithQuery to="/" />} />
          </Routes>
        </main>
      </div>
      {renderModal()}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
