
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import ChannelPage from './pages/ChannelPage';
import SearchPage from './pages/SearchPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import WatchLaterPage from './pages/WatchLaterPage';
import HistoryPage from './pages/HistoryPage';
import LikedVideosPage from './pages/LikedVideosPage';
import LibraryPage from './pages/LibraryPage';
import TrendingPage from './pages/TrendingPage';
import SettingsPage from './pages/SettingsPage';
import PlaylistPage from './pages/PlaylistPage';
import ShortsPage from './pages/ShortsPage';
import UploadPage from './pages/UploadPage';
import StateInspector from './pages/StateInspector';
import MiniPlayer from './components/MiniPlayer';
import './App.css';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function AppContent() {
  const { data, updateSettings } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMini, setSidebarMini] = useState(false);

  const settingsTheme = data?.settings?.theme || 'light';

  // Resolve effective theme (system -> detect preference)
  const resolveTheme = (t) => {
    if (t === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t;
  };

  const effectiveTheme = resolveTheme(settingsTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('theme', effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    const sid = new URLSearchParams(location.search).get('sid') || sessionStorage.getItem('mock_sid');
    if (!sid || new URLSearchParams(location.search).get('sid')) return;
    const params = new URLSearchParams(location.search);
    params.set('sid', sid);
    navigate(`${location.pathname}?${params.toString()}${location.hash}`, { replace: true });
  }, [location.pathname, location.search, location.hash, navigate]);

  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
  };

  const toggleSidebar = () => {
    if (sidebarOpen && !sidebarMini) {
      setSidebarMini(true);
    } else if (sidebarOpen && sidebarMini) {
      setSidebarOpen(false);
      setSidebarMini(false);
    } else {
      setSidebarOpen(true);
      setSidebarMini(false);
    }
  };

  return (
    <div className="app">
      <Header
        onMenuClick={toggleSidebar}
        theme={effectiveTheme}
        onThemeToggle={toggleTheme}
      />
      <div className="app-body">
        <Sidebar
          isOpen={sidebarOpen}
          isMini={sidebarMini}
        />
        <main className={`main-content ${sidebarOpen ? (sidebarMini ? 'sidebar-mini' : 'sidebar-open') : 'sidebar-closed'}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shorts" element={<ShortsPage />} />
            <Route path="/watch/:videoId" element={<VideoPlayerPage />} />
            <Route path="/channel/:channelId" element={<ChannelPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/watch-later" element={<WatchLaterPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/liked" element={<LikedVideosPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/go" element={<StateInspector />} />
          </Routes>
        </main>
      </div>
      <MiniPlayer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </Router>
  );
}

export default App;
