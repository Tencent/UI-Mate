import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bed, Plane, Car, Package, MapPin, Ship,
  Search, Calendar, Users, ChevronDown, Star, Heart, TrendingUp, Shield, Award
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import SearchFormStays from '../components/SearchFormStays'
import SearchFormFlights from '../components/SearchFormFlights'
import SearchFormCars from '../components/SearchFormCars'
import SearchFormPackages from '../components/SearchFormPackages'
import SearchFormActivities from '../components/SearchFormActivities'
import SearchFormCruises from '../components/SearchFormCruises'
import SandboxDialog from '../components/SandboxDialog'
import './Home.css'

const TABS = [
  { id: 'stays', label: 'Stays', icon: Bed },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'packages', label: 'Packages', icon: Package },
  { id: 'things', label: 'Things to Do', icon: MapPin },
  { id: 'cruises', label: 'Cruises', icon: Ship }
]

export default function Home() {
  const { state, toggleSavedProperty, updateState } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stays')
  const [footerTopic, setFooterTopic] = useState(null)

  const { hotels, trendingDestinations, user } = state

  // Show top-rated hotels as deals
  const dealsHotels = [...hotels]
    .filter(h => h.rooms.some(r => r.originalPrice))
    .slice(0, 6)

  const isHotelSaved = (id) => (user?.savedProperties || []).includes(id)

  const openFooterTopic = (label, section) => {
    updateState(prev => ({
      ...prev,
      helpCenterDrafts: [
        ...(prev.helpCenterDrafts || []),
        { label, section, openedAt: new Date().toISOString() }
      ]
    }))
    setFooterTopic({ label, section })
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: 'url(https://picsum.photos/seed/hero-travel/1600/600)' }} />
        <div className="hero-overlay" />
        <div className="hero-content container">
          <h1 className="hero-title">Where to next?</h1>

          {/* Search Card */}
          <div className="search-card">
            {/* Search Tabs */}
            <div className="search-tabs">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Search Form */}
            <div className="search-form-container">
              {activeTab === 'stays' && <SearchFormStays />}
              {activeTab === 'flights' && <SearchFormFlights />}
              {activeTab === 'cars' && <SearchFormCars />}
              {activeTab === 'packages' && <SearchFormPackages />}
              {activeTab === 'things' && <SearchFormActivities />}
              {activeTab === 'cruises' && <SearchFormCruises />}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="section">
        <div className="container">
          <h2 style={{ color: 'var(--color-navy)', marginBottom: '24px' }}>Trending destinations</h2>
          <div className="destinations-grid">
            {trendingDestinations.map(dest => (
              <div
                key={dest.id}
                className="destination-card"
                onClick={() => {
                  navigate('/hotels')
                }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="destination-img"
                />
                <div className="destination-overlay">
                  <div className="destination-name">{dest.name}</div>
                  <div className="destination-tagline">{dest.tagline}</div>
                  <div className="destination-price">from ${dest.averagePrice}/night</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Top Deals */}
      <section className="section" style={{ background: 'var(--color-white)', padding: '48px 0' }}>
        <div className="container">
          <h2 style={{ color: 'var(--color-navy)', marginBottom: '24px' }}>Today's top deals</h2>
          <div className="deals-scroll">
            {dealsHotels.map(hotel => {
              const bestRoom = hotel.rooms.find(r => r.originalPrice) || hotel.rooms[0]
              const saved = isHotelSaved(hotel.id)
              const savings = bestRoom.originalPrice
                ? Math.round((1 - bestRoom.pricePerNight / bestRoom.originalPrice) * 100)
                : 0
              return (
                <div
                  key={hotel.id}
                  className="deal-card"
                  onClick={() => navigate(`/hotels/${hotel.id}`)}
                >
                  <div className="deal-img-wrap">
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="deal-img"
                    />
                    {savings > 0 && (
                      <span className="deal-badge badge badge-deal">Save {savings}%</span>
                    )}
                    <button
                      className={`deal-heart ${saved ? 'saved' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleSavedProperty(hotel.id) }}
                    >
                      <Heart size={18} fill={saved ? '#E21C5B' : 'none'} color={saved ? '#E21C5B' : 'white'} />
                    </button>
                  </div>
                  <div className="deal-content">
                    <div className="deal-name">{hotel.name}</div>
                    <div className="deal-location">
                      <MapPin size={12} />
                      <span>{hotel.neighborhood}</span>
                    </div>
                    <div className="deal-stars">
                      {Array.from({ length: hotel.starRating }).map((_, i) => (
                        <Star key={i} size={12} fill="var(--color-golden-yellow)" color="var(--color-golden-yellow)" />
                      ))}
                    </div>
                    <div className="deal-price">
                      {bestRoom.originalPrice && (
                        <span className="deal-original">${bestRoom.originalPrice}</span>
                      )}
                      <span className="deal-current">${bestRoom.pricePerNight}<span className="deal-night">/night</span></span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* One Key Banner */}
      <section className="one-key-banner">
        <div className="container">
          <div className="one-key-content">
            <div className="one-key-text">
              <div className="one-key-badge-large">
                <span>&#9733;</span>
                <span>One Key</span>
              </div>
              <h2>Save more with One Key</h2>
              <p>Members save up to 20% on select hotels</p>
              <p className="one-key-cash">You have <strong>${user?.oneKeyCash?.toFixed(2)}</strong> in One Key Cash</p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => navigate('/account')}
              style={{ background: 'transparent', color: 'var(--color-golden-yellow)', borderColor: 'var(--color-golden-yellow)' }}
            >
              View rewards
            </button>
          </div>
        </div>
      </section>

      {/* Why Book Section */}
      <section className="section" style={{ background: 'var(--color-white)', padding: '48px 0' }}>
        <div className="container">
          <h2 style={{ color: 'var(--color-navy)', marginBottom: '32px', textAlign: 'center' }}>Why book with Xpedia?</h2>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon"><Shield size={28} color="var(--color-action-blue)" /></div>
              <h3>Price Match Promise</h3>
              <p>Found a lower price? We'll match it and refund the difference.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><Award size={28} color="var(--color-golden-yellow)" /></div>
              <h3>Earn One Key Cash</h3>
              <p>Earn cash back on every booking to use on your next trip.</p>
            </div>
            <div className="why-card">
              <div className="why-icon"><TrendingUp size={28} color="var(--color-success)" /></div>
              <h3>Flexible Cancellation</h3>
              <p>Plans change. Many of our properties offer free cancellation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Company</h4>
              {['About', 'Careers', 'Press', 'Investor Relations'].map(label => (
                <button key={label} onClick={() => openFooterTopic(label, 'Company')}>{label}</button>
              ))}
            </div>
            <div className="footer-col">
              <h4>Explore</h4>
              <button onClick={() => navigate('/hotels')}>Hotels</button>
              <button onClick={() => navigate('/flights')}>Flights</button>
              <button onClick={() => navigate('/cars')}>Cars</button>
              <button onClick={() => navigate('/packages')}>Packages</button>
              <button onClick={() => navigate('/activities')}>Things to Do</button>
              <button onClick={() => navigate('/cruises')}>Cruises</button>
              <button onClick={() => navigate('/trips')}>Your trips</button>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              {['Help center', 'Contact us', 'Accessibility', 'Site map'].map(label => (
                <button key={label} onClick={() => openFooterTopic(label, 'Support')}>{label}</button>
              ))}
            </div>
            <div className="footer-col">
              <h4>Policies</h4>
              {['Terms of use', 'Privacy policy', 'Cookie policy', 'Do not sell my info'].map(label => (
                <button key={label} onClick={() => openFooterTopic(label, 'Policies')}>{label}</button>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Xpedia, Inc. All rights reserved. (Mock)</span>
          </div>
        </div>
      </footer>
      {footerTopic && (
        <SandboxDialog
          title={footerTopic.label}
          onClose={() => setFooterTopic(null)}
          actions={<button className="btn-primary" onClick={() => setFooterTopic(null)}>Done</button>}
        >
          <p style={{ color: 'var(--color-medium-gray)', lineHeight: 1.6 }}>
            Local Xpedia {footerTopic.section.toLowerCase()} panel. This keeps footer navigation inspectable and closeable while staying inside the sandbox.
          </p>
          <div style={{ marginTop: 12, padding: 12, border: '1px solid var(--color-border-gray)', borderRadius: 8 }}>
            Saved to this session as a local help-center draft.
          </div>
        </SandboxDialog>
      )}
    </div>
  )
}
