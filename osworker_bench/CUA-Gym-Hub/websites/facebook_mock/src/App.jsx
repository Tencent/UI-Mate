import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Friends from './pages/Friends';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import PageProfile from './pages/PageProfile';
import Marketplace from './pages/Marketplace';
import Watch from './pages/Watch';
import Events from './pages/Events';
import Saved from './pages/Saved';
import Go from './pages/Go';
import ChatWindow from './components/ChatWindow';
import { useApp } from './store/AppContext';

// Preserve query params (e.g. ?sid=xxx) when redirecting
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

function ChatWindowsContainer() {
  const { openChatWindows, closeChatWindow } = useApp();
  if (!openChatWindows || openChatWindows.length === 0) return null;
  return (
    <div className="fixed bottom-0 right-20 flex items-end gap-3 z-50">
      {[...openChatWindows].reverse().map(convKey => (
        <ChatWindow key={convKey} convKey={convKey} onClose={closeChatWindow} />
      ))}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-[#F0F2F5]">
          <Routes>
            <Route path="/go" element={<Go />} />
            <Route path="*" element={
              <>
                <SidPreserver />
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/:userId" element={<UserProfile />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/groups/:groupId" element={<GroupDetail />} />
                  <Route path="/pages/:id" element={<PageProfile />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/watch" element={<Watch />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/saved" element={<Saved />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ChatWindowsContainer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
