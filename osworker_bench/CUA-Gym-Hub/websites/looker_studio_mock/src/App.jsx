import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import HomePage from './pages/HomePage'
import ReportEditor from './pages/ReportEditor'
import ReportViewer from './pages/ReportViewer'
import DataSourcesPage from './pages/DataSourcesPage'
import TemplatesPage from './pages/TemplatesPage'
import GoPage from './pages/Go'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/report/:id" element={<ReportEditor />} />
      <Route path="/report/:id/view" element={<ReportViewer />} />
      <Route path="/datasources" element={<DataSourcesPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/go" element={<GoPage />} />
      <Route path="*" element={<RedirectWithQuery to="/" />} />
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
