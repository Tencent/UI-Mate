import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Reels from './pages/Reels';
import Messages from './pages/Messages';
import Go from './pages/Go';
import { DataProvider } from './context/DataContext';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function SidPreserver() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSid = params.get('sid');
    if (urlSid) {
      sessionStorage.setItem('mock_sid', urlSid);
      return;
    }

    const storedSid = sessionStorage.getItem('mock_sid');
    if (!storedSid || location.pathname === '/go') return;

    params.set('sid', storedSid);
    navigate(`${location.pathname}?${params.toString()}${location.hash}`, { replace: true });
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}

function App() {
  return (
    <DataProvider>
      <SidPreserver />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="reels" element={<Reels />} />
          <Route path="direct/inbox" element={<Messages />} />
          <Route path="direct/t/:conversationId" element={<Messages />} />
          <Route path="profile/:username" element={<Profile />} />
        </Route>
        <Route path="/go" element={<Go />} />
      </Routes>
    </DataProvider>
  );
}

export default App;
