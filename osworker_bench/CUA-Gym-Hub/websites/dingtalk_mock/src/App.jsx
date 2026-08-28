import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import IconSidebar from './components/IconSidebar'
import MessagesPage from './pages/MessagesPage'
import DingPage from './pages/DingPage'
import WorkbenchPage from './pages/WorkbenchPage'
import ContactsPage from './pages/ContactsPage'
import CalendarPage from './pages/CalendarPage'
import MePage from './pages/MePage'
import DrivePage from './pages/DrivePage'
import Go from './pages/Go'
import './styles/global.css'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <IconSidebar />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<RedirectWithQuery to="/messages" />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:conversationId" element={<MessagesPage />} />
          <Route path="/ding" element={<DingPage />} />
          <Route path="/workbench" element={<WorkbenchPage />} />
          <Route path="/workbench/approval" element={<WorkbenchPage section="approval" />} />
          <Route path="/workbench/approval/:id" element={<WorkbenchPage section="approval-detail" />} />
          <Route path="/workbench/todo" element={<WorkbenchPage section="todo" />} />
          <Route path="/workbench/attendance" element={<WorkbenchPage section="attendance" />} />
          <Route path="/workbench/announcements" element={<WorkbenchPage section="announcements" />} />
          <Route path="/workbench/log" element={<WorkbenchPage section="log" />} />
          <Route path="/workbench/meeting" element={<WorkbenchPage section="meeting" />} />
          <Route path="/workbench/docs" element={<WorkbenchPage section="docs" />} />
          <Route path="/workbench/report" element={<WorkbenchPage section="report" />} />
          <Route path="/workbench/drive" element={<DrivePage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/me" element={<MePage />} />
          <Route path="*" element={<RedirectWithQuery to="/messages" />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/go" element={
          <AppProvider>
            <Go />
          </AppProvider>
        } />
        <Route path="*" element={
          <AppProvider>
            <AppLayout />
          </AppProvider>
        } />
      </Routes>
    </BrowserRouter>
  )
}
