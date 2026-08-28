import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { useApp } from './context/AppContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import OneOnOnes from './pages/OneOnOnes.jsx'
import OneOnOneDetail from './pages/OneOnOneDetail.jsx'
import Feedback from './pages/Feedback.jsx'
import Goals from './pages/Goals.jsx'
import GoalDetail from './pages/GoalDetail.jsx'
import Reviews from './pages/Reviews.jsx'
import ReviewDetail from './pages/ReviewDetail.jsx'
import Updates from './pages/Updates.jsx'
import Grow from './pages/Grow.jsx'
import CareerTracks from './pages/CareerTracks.jsx'
import Engagement from './pages/Engagement.jsx'
import People from './pages/People.jsx'
import PersonProfile from './pages/PersonProfile.jsx'
import Compensation from './pages/Compensation.jsx'
import Tasks from './pages/Tasks.jsx'
import Go from './pages/Go.jsx'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppRoutes() {
  const { loading } = useApp()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8F9FA' }}>
        <div style={{ color: '#6B7280', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/go" element={<Go />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="1on1s" element={<OneOnOnes />} />
        <Route path="1on1s/:id" element={<OneOnOneDetail />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="goals" element={<Goals />} />
        <Route path="goals/:id" element={<GoalDetail />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="reviews/:id" element={<ReviewDetail />} />
        <Route path="updates" element={<Updates />} />
        <Route path="grow" element={<Grow />} />
        <Route path="grow/career-tracks" element={<CareerTracks />} />
        <Route path="engagement" element={<Engagement />} />
        <Route path="people" element={<People />} />
        <Route path="people/:id" element={<PersonProfile />} />
        <Route path="compensation" element={<Compensation />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="*" element={<RedirectWithQuery to="/" />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
