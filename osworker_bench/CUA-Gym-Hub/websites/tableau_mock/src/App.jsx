import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import MainLayout from './components/MainLayout'
import Go from './pages/Go'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/go" element={<Go />} />
        <Route path="*" element={<RedirectWithQuery to="/" />} />
      </Routes>
    </AppProvider>
  )
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
