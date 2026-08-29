import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { PropertyDetail } from './pages/PropertyDetail';
import { Checkout } from './pages/Checkout';
import { Confirmation } from './pages/Confirmation';
import { Trips } from './pages/Trips';
import { Saved } from './pages/Saved';
import { Go } from './pages/Go';

function App() {
  return (
    <StoreProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation/:bookingId?" element={<Confirmation />} />
              <Route path="/mytrips" element={<Trips />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/go" element={<Go />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </StoreProvider>
  );
}

export default App;
