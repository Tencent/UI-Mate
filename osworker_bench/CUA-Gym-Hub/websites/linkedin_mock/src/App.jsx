import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/layout/Navbar';
import Feed from './pages/Feed';
import Network from './pages/Network';
import Jobs from './pages/Jobs';
import Messaging from './pages/Messaging';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Search from './pages/Search';
import GoDebug from './pages/GoDebug';
import ErrorBoundary from './components/ErrorBoundary';

function Layout() {
  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <Outlet />
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Page not found</p>
        <p className="text-gray-500 mb-8">The page you are looking for does not exist or has been moved.</p>
        <Link
          to="/"
          className="bg-xinkedin-blue text-white px-6 py-2.5 rounded-full font-semibold hover:bg-xinkedin-dark inline-block"
        >
          Go to Home Feed
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/go" element={<GoDebug />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Feed />} />
              <Route path="mynetwork" element={<Network />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="messaging" element={<Messaging />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile/:id" element={<Profile />} />
              <Route path="search" element={<Search />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ErrorBoundary>
  );
}

export default App;