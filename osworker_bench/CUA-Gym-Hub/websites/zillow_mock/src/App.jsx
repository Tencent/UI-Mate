import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import SavedHomes from './pages/SavedHomes';
import Mortgage from './pages/Mortgage';
import AgentFinder from './pages/AgentFinder';
import Sell from './pages/Sell';
import Go from './pages/Go';
import { StoreProvider } from './lib/store';

function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-8xl font-bold text-brand-200 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-8">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-600 transition">
        Back to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/saved" element={<SavedHomes />} />
            <Route path="/mortgage" element={<Mortgage />} />
            <Route path="/agent-finder" element={<AgentFinder />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/go" element={<Go />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </StoreProvider>
  );
}

export default App;
