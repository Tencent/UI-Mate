import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import HotPage from './pages/HotPage';
import PostDetailPage from './pages/PostDetailPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import TopicPage from './pages/TopicPage';
import SettingsPage from './pages/SettingsPage';
import FavoritesPage from './pages/FavoritesPage';
import VideoPage from './pages/VideoPage';
import Go from './pages/Go';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/go" element={<Go />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/hot" element={<HotPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/profile" element={<Navigate to="/profile/user_current" replace />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/topic/:topicId" element={<TopicPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/video" element={<VideoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
