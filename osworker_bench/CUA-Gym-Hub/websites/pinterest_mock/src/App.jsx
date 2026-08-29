import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import BoardDetail from './pages/BoardDetail';
import CreatePin from './pages/CreatePin';
import Settings from './pages/Settings';
import Explore from './pages/Explore';
import Search from './pages/Search';
import Messages from './pages/Messages';
import PinDetail from './pages/PinDetail';
import Go from './pages/Go';

// Preserves ?sid= query string during redirects
function RedirectWithQuery({ to }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

// 404 page
function NotFound() {
  return (
    <div className="pt-16 min-h-screen bg-white flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <svg height="40" width="40" viewBox="0 0 24 24" aria-hidden="true" className="text-xinterest-red" fill="currentColor">
          <path d="M0 12c0 5.123 3.211 9.497 7.73 11.218-.11-.937-.227-2.482.025-3.566.217-.932 1.401-5.938 1.401-5.938s-.357-.715-.357-1.774c0-1.66.962-2.899 2.16-2.899 1.017 0 1.508.765 1.508 1.682 0 1.026-.653 2.56-1.01 3.982-.297 1.186.597 2.153 1.769 2.153 2.126 0 3.76-2.245 3.76-5.487 0-2.87-2.064-4.875-5.008-4.875-3.65 0-5.789 2.732-5.789 5.558 0 1.1.424 2.279.952 2.917.105.127.12.237.09.429-.098.636-.316 1.29-.358 1.465-.057.237-.233.287-.536.147-2.002-.932-3.256-3.854-3.256-6.205 0-5.053 3.674-9.696 10.59-9.696 5.56 0 9.874 3.96 9.874 9.24 0 5.514-3.475 9.942-8.293 9.942-1.62 0-3.14-.841-3.66-1.832l-.997 3.79c-.358 1.375-1.332 3.097-1.984 4.025 1.49.46 3.09.71 4.74.71 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12S0 5.373 0 12" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold mb-3">Oops! Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-md">The page you're looking for doesn't exist or may have been moved.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-xinterest-red text-white rounded-full font-bold hover:bg-xinterest-hover transition-colors"
      >
        Go back home
      </Link>
    </div>
  );
}

function SidPreserver() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get('sid') || sessionStorage.getItem('mock_sid');
    if (!sid || params.get('sid')) return;
    params.set('sid', sid);
    navigate(`${location.pathname}?${params.toString()}${location.hash}`, { replace: true });
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route path="*" element={
            <>
              <SidPreserver />
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/board/:boardId" element={<BoardDetail />} />
                <Route path="/pin/:pinId" element={<PinDetail />} />
                <Route path="/create" element={<CreatePin />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:conversationId" element={<Messages />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </>
          } />
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;
