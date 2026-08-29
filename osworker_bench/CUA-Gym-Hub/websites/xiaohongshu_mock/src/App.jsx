import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import TopNav from './components/TopNav.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import NoteDetailPage from './pages/NoteDetailPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import PublishNotePage from './pages/PublishNotePage.jsx';
import FollowListPage from './pages/FollowListPage.jsx';
import Go from './pages/Go.jsx';
import Toast from './components/Toast.jsx';
import FAB from './components/FAB.jsx';
import { useState, createContext, useContext } from 'react';

export const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

function AppInner() {
  const [toast, setToast] = useState(null);

  const showToast = (msg, duration = 2000) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };

  return (
    <ToastContext.Provider value={showToast}>
      <div className="app-layout">
        <TopNav />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/explore" replace />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/explore/:category" element={<ExplorePage />} />
            <Route path="/note/:noteId" element={<NoteDetailPage />} />
            <Route path="/user/:userId" element={<UserProfilePage />} />
            <Route path="/user/:userId/followers" element={<FollowListPage type="followers" />} />
            <Route path="/user/:userId/following" element={<FollowListPage type="following" />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:conversationId" element={<MessagesPage />} />
            <Route path="/publish" element={<PublishNotePage />} />
            <Route path="/go" element={<Go />} />
          </Routes>
        </main>
        <FAB />
        {toast && <Toast message={toast} />}
      </div>
    </ToastContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
