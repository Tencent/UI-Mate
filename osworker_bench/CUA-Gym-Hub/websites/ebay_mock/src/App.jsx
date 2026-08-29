import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import Go from './pages/Go';

function Layout({ children }) {
  const location = useLocation();
  const isGo = location.pathname === '/go';

  return (
    <>
      {!isGo && <Navbar />}
      <main className={!isGo ? "min-h-[calc(100vh-200px)]" : ""}>
        {children}
      </main>
      {!isGo && (
        <footer className="bg-white border-t border-gray-200 py-8 mt-12">
          <div className="container mx-auto px-4 text-center text-xs text-gray-500">
            <p className="mb-2">Copyright © 1995-2024 xBay Inc. All Rights Reserved.</p>
            <p>Accessibility, User Agreement, Privacy, Payments Terms of Use, Cookies, CA Privacy Notice, Your Privacy Choices and AdChoice</p>
          </div>
        </footer>
      )}
    </>
  );
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/item/:id" element={<ProductDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sell" element={<CreateListing />} />
            <Route path="/go" element={<Go />} />
          </Routes>
        </Layout>
      </Router>
    </StoreProvider>
  );
}

export default App;