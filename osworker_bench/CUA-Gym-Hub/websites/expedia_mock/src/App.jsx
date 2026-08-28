import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Header from './components/Header'
import Home from './pages/Home'
import Hotels from './pages/Hotels'
import HotelDetail from './pages/HotelDetail'
import Flights from './pages/Flights'
import Cars from './pages/Cars'
import Activities from './pages/Activities'
import Packages from './pages/Packages'
import Cruises from './pages/Cruises'
import Checkout from './pages/Checkout'
import Confirmation from './pages/Confirmation'
import Trips from './pages/Trips'
import Account from './pages/Account'
import Go from './pages/Go'

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams()
  const query = searchParams.toString()
  return <Navigate to={query ? `${to}?${query}` : to} replace />
}

function AppLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:hotelId" element={<HotelDetail />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/cruises" element={<Cruises />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation/:bookingId" element={<Confirmation />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<RedirectWithQuery to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/go" element={<Go />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
