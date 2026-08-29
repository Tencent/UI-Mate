import React from 'react'
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import Layout from './components/Layout'
import Homepage from './pages/Homepage'
import VenuePage from './pages/VenuePage'
import PaperForum from './pages/PaperForum'
import ACConsole from './pages/ACConsole'
import ReviewerConsole from './pages/ReviewerConsole'
import EdgeBrowser from './pages/EdgeBrowser'
import ProfilePage from './pages/ProfilePage'
import Go from './pages/Go'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/group" element={<VenuePage />} />
        <Route path="/forum" element={<PaperForum />} />
        <Route path="/console/area-chairs" element={<ACConsole />} />
        <Route path="/console/reviewers" element={<ReviewerConsole />} />
        <Route path="/edges/browse" element={<EdgeBrowser />} />
        <Route path="/profile" element={<ProfilePage />} />
        {/* Legacy routes redirect */}
        <Route path="/venue/:venueId" element={<RedirectWithQuery to="/group" />} />
        <Route path="/forum/:paperId" element={<RedirectWithQuery to="/forum" />} />
        <Route path="/assignments/:paperId" element={<RedirectWithQuery to="/edges/browse" />} />
        <Route path="/profile/:userId" element={<RedirectWithQuery to="/profile" />} />
        <Route path="*" element={<RedirectWithQuery to="/" />} />
      </Route>
    </Routes>
  )
}

export default App
