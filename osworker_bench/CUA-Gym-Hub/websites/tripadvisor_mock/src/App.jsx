import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import CategoryNav from './components/CategoryNav.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import HotelSearch from './pages/HotelSearch.jsx';
import HotelDetail from './pages/HotelDetail.jsx';
import RestaurantSearch from './pages/RestaurantSearch.jsx';
import RestaurantDetail from './pages/RestaurantDetail.jsx';
import AttractionSearch from './pages/AttractionSearch.jsx';
import AttractionDetail from './pages/AttractionDetail.jsx';
import WriteReview from './pages/WriteReview.jsx';
import Trips from './pages/Trips.jsx';
import Forums, { ForumDetail } from './pages/Forums.jsx';
import Profile from './pages/Profile.jsx';
import Flights from './pages/Flights.jsx';
import VacationRentals from './pages/VacationRentals.jsx';
import Go from './pages/Go.jsx';

export default function App() {
  const location = useLocation();
  const isGoPage = location.pathname === '/go';

  if (isGoPage) {
    return <Go />;
  }

  return (
    <>
      <Header />
      <CategoryNav />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<HotelSearch />} />
          <Route path="/hotel/:id" element={<HotelDetail />} />
          <Route path="/restaurants" element={<RestaurantSearch />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/attractions" element={<AttractionSearch />} />
          <Route path="/attraction/:id" element={<AttractionDetail />} />
          <Route path="/reviews/write/:entityType/:entityId" element={<WriteReview />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/forums" element={<Forums />} />
          <Route path="/forum/:destinationId" element={<ForumDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/vacation-rentals" element={<VacationRentals />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
