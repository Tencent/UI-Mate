
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import MessagesPage from './pages/MessagesPage';
import ContactsPage from './pages/ContactsPage';
import DiscoverPage from './pages/DiscoverPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import UserProfilePage from './pages/UserProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import MomentsPage from './pages/MomentsPage';
import ChatSettingsPage from './pages/ChatSettingsPage';
import SearchChatPage from './pages/SearchChatPage';
import GroupsPage from './pages/GroupsPage';
import GroupChatPage from './pages/GroupChatPage';
import GroupInfoPage from './pages/GroupInfoPage';
import ChannelsPage from './pages/ChannelsPage';
import StateInspector from './pages/StateInspector';
import { useStore } from './store';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function App() {
  const initializeStore = useStore(state => state.initialize);

  React.useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<RedirectWithQuery to="/messages" />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="/chat/:contactId" element={<ChatPage />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/moments" element={<MomentsPage />} />
          <Route path="/chat-settings/:contactId" element={<ChatSettingsPage />} />
          <Route path="/search-chat/:contactId" element={<SearchChatPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/group/:groupId" element={<GroupChatPage />} />
          <Route path="/group-info/:groupId" element={<GroupInfoPage />} />
          <Route path="/channels" element={<ChannelsPage />} />
          <Route path="/go" element={<StateInspector />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
