import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import BoardPage from './pages/BoardPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import EventsPage from './pages/EventsPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'
import CohortsPage from './pages/CohortsPage.jsx'
import LexiconPage from './pages/LexiconPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import GoPage from './pages/GoPage.jsx'
import SessionReplayPage from './pages/SessionReplayPage.jsx'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/go" element={<GoPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<RedirectWithQuery to="/home" />} />
        <Route path="home" element={<Home />} />
        <Route path="board/:boardId" element={<BoardPage />} />
        <Route path="report/:reportId" element={<ReportPage />} />
        <Route path="insights" element={<ReportPage key="new-insights" newType="insights" />} />
        <Route path="funnels" element={<ReportPage key="new-funnels" newType="funnels" />} />
        <Route path="flows" element={<ReportPage key="new-flows" newType="flows" />} />
        <Route path="retention" element={<ReportPage key="new-retention" newType="retention" />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:userId" element={<UserProfilePage />} />
        <Route path="cohorts" element={<CohortsPage />} />
        <Route path="session-replay" element={<SessionReplayPage />} />
        <Route path="lexicon" element={<LexiconPage />} />
        <Route path="lexicon/:section" element={<LexiconPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/:tab" element={<SettingsPage />} />
        <Route path="*" element={<RedirectWithQuery to="/home" />} />
      </Route>
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
