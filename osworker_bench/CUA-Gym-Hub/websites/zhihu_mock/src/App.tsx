import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Question from './pages/Question';
import Answer from './pages/Answer';
import Article from './pages/Article';
import User from './pages/User';
import Topic from './pages/Topic';
import Search from './pages/Search';
import HotList from './pages/HotList';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Collections from './pages/Collections';
import Discover from './pages/Discover';
import WaitingForAnswer from './pages/WaitingForAnswer';
import IdeaPage from './pages/IdeaPage';
import StateInspector from './pages/StateInspector';
import { useStore } from './store/useStore';

function RedirectWithQuery({ to }: { to: string }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function SessionInit({ children }: { children: React.ReactNode }) {
  const initSession = useStore(state => state._initSession);
  const loading = useStore(state => state._loading);

  useEffect(() => {
    initSession();
  }, [initSession]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#8590a6' }}>Loading...</div>;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <SessionInit>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/question/:id" element={<Question />} />
            <Route path="/answer/:id" element={<Answer />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/user/:id" element={<User />} />
            <Route path="/topic/:id" element={<Topic />} />
            <Route path="/search" element={<Search />} />
            <Route path="/hot" element={<HotList />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/waiting" element={<WaitingForAnswer />} />
            <Route path="/idea/:id" element={<IdeaPage />} />
            <Route path="/go" element={<StateInspector />} />
            <Route path="*" element={<RedirectWithQuery to="/" />} />
          </Routes>
        </div>
      </SessionInit>
    </BrowserRouter>
  );
}

export default App;
