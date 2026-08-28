import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import TweetDetail from './pages/TweetDetail';
import Notifications from './pages/Notifications';
import Explore from './pages/Explore';
import FollowingList from './pages/FollowingList';
import GoPage from './pages/GoPage';
import Messages from './pages/Messages';
import Bookmarks from './pages/Bookmarks';
import Lists from './pages/Lists';
import Modal from './components/Modal';
import Composer from './components/Composer';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function Layout() {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const location = useLocation();

  // If we are on the /go page, render it full screen without layout
  if (location.pathname === '/go') {
    return <GoPage />;
  }

  // Check if we're on /compose route to show compose modal
  const isComposeRoute = location.pathname === '/compose';

  return (
    <div className="container mx-auto max-w-[1265px] flex min-h-screen">
      <header className="flex-shrink-0">
        <Sidebar onTweet={() => setIsComposeOpen(true)} />
      </header>

      <main className="flex-grow border-r border-[#EFF3F4] min-h-screen ml-[68px] xl:ml-[275px] w-full max-w-[600px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/search" element={<Explore />} />
          <Route path="/profile/:handle" element={<Profile />} />
          <Route path="/profile/:handle/following" element={<FollowingList />} />
          <Route path="/profile/:handle/followers" element={<FollowingList mode="followers" />} />
          <Route path="/status/:id" element={<TweetDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/compose" element={<Home />} />
          <Route path="*" element={<div className="p-4 text-[#0F1419]">Page not found</div>} />
        </Routes>
      </main>

      <aside className="hidden lg:block flex-shrink-0 w-[350px]">
        <RightSidebar />
      </aside>

      <Modal isOpen={isComposeOpen || isComposeRoute} onClose={() => {
        setIsComposeOpen(false);
        if (isComposeRoute) window.history.back();
      }}>
        <Composer isModal onClose={() => {
          setIsComposeOpen(false);
          if (isComposeRoute) window.history.back();
        }} />
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
