import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Popular from './pages/Popular';
import All from './pages/All';
import Subreddit from './pages/Subreddit';
import PostPage from './pages/PostPage';
import UserPage from './pages/UserPage';
import SearchPage from './pages/SearchPage';
import GoPage from './pages/GoPage';
import CreatePostPage from './pages/CreatePostPage';
import ErrorBoundary from './components/ErrorBoundary';

// Preserve query params (e.g. ?sid=xxx) when redirecting
function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar onMenuToggle={() => setMobileSidebarOpen(prev => !prev)} />
      <div className="flex">
        <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/go" element={<GoPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="popular" element={<Popular />} />
            <Route path="all" element={<All />} />
            <Route path="r/:id" element={<Subreddit />} />
            <Route path="post/:id" element={<PostPage />} />
            <Route path="user/:id" element={<UserPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="submit" element={<CreatePostPage />} />
          </Route>
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
