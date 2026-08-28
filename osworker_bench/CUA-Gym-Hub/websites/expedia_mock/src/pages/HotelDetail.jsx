import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Star, Heart, MapPin, Share2, Wifi, Waves, Dumbbell, Coffee,
  Utensils, ParkingCircle, X, ChevronLeft, ChevronRight, Check,
  Users, AlertTriangle, Info
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import './HotelDetail.css'

const AMENITY_ICONS = {
  'Free WiFi': Wifi,
  'Pool': Waves,
  'Fitness center': Dumbbell,
  'Restaurant': Utensils,
  'Parking': ParkingCircle,
  'Spa': Coffee,
  'Room service': Coffee,
  'Business center': Info,
  'Concierge': Info,
  'Bar': Coffee,
  'Rooftop bar': Coffee,
  'Kitchen': Coffee
}

function RatingBadge({ rating }) {
  const cls = rating >= 8 ? 'excellent' : rating >= 7 ? 'very-good' : 'good'
  return <div className={`rating-badge ${cls}`} style={{ width: '40px', height: '40px', fontSize: '16px' }}>{rating}</div>
}

function StarRating({ count }) {
  return (
    <span className="star-row">
      {Array.from({length: count}).map((_, i) => (
        <Star key={i} size={14} fill="var(--color-golden-yellow)" color="var(--color-golden-yellow)" />
      ))}
    </span>
  )
}

export default function HotelDetail() {
  const { hotelId } = useParams()
  const { state, toggleSavedProperty, setCart, addRecentlyViewed } = useApp()
  const navigate = useNavigate()

  const hotel = state.hotels.find(h => h.id === hotelId)

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [reviewFilter, setReviewFilter] = useState('All')
  const [reviewSort, setReviewSort] = useState('relevant')
  const [reviewsShown, setReviewsShown] = useState(3)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (hotel) {
      addRecentlyViewed(hotel.id)
    }
  }, [hotel?.id])

  if (!hotel) {
    return (
      <div className="page-content" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2>Hotel not found</h2>
        <button className="btn-primary" onClick={() => navigate('/hotels')}>Back to results</button>
      </div>
    )
  }

  const isSaved = (state.user?.savedProperties || []).includes(hotel.id)

  const filteredReviews = hotel.reviews.filter(r => reviewFilter === 'All' || r.tripType === reviewFilter)
  let sortedReviews = [...filteredReviews]
  if (reviewSort === 'recent') sortedReviews.sort((a,b) => b.date.localeCompare(a.date))
  else if (reviewSort === 'highest') sortedReviews.sort((a,b) => b.rating - a.rating)
  else if (reviewSort === 'lowest') sortedReviews.sort((a,b) => a.rating - b.rating)

  const handleReserve = (room) => {
    if (room.availability === 'sold out') return
    const cart = {
      type: 'hotel',
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.images[0],
      roomId: room.id,
      roomType: room.name,
      checkIn: state.searchFilters.checkIn,
      checkOut: state.searchFilters.checkOut,
      guests: state.searchFilters.guests,
      rooms: state.searchFilters.rooms,
      pricePerNight: hotel.memberPrice && room.memberPrice ? room.memberPrice : room.pricePerNight,
      totalPrice: room.totalPrice,
      breakfastIncluded: room.breakfastIncluded,
      freeCancellation: room.freeCancellation
    }
    setCart(cart)
    navigate('/checkout')
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="page-content hotel-detail">
      {/* Breadcrumb */}
      <div className="container" style={{ padding: '12px 24px' }}>
        <span className="breadcrumb">
          <a href="/" onClick={e => { e.preventDefault(); navigate('/') }}>Home</a>
          {' > '}
          <a href="/hotels" onClick={e => { e.preventDefault(); navigate('/hotels') }}>New York Hotels</a>
          {' > '}
          <span>{hotel.name}</span>
        </span>
      </div>

      {/* Photo Gallery */}
      <div className="container">
        <div className="gallery">
          <div className="gallery-main" onClick={() => { setLightboxIndex(0); setLightboxOpen(true) }}>
            <img src={hotel.images[0]} alt={hotel.name} className="gallery-main-img" />
          </div>
          <div className="gallery-grid">
            {hotel.images.slice(1, 5).map((img, i) => (
              <div key={i} className="gallery-thumb" onClick={() => { setLightboxIndex(i + 1); setLightboxOpen(true) }}>
                <img src={img} alt={`${hotel.name} ${i+2}`} />
                {i === 3 && hotel.images.length > 5 && (
                  <div className="gallery-more">+{hotel.images.length - 5} photos</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hotel Header */}
        <div className="hotel-header">
          <div className="hotel-header-left">
            <h1>{hotel.name}</h1>
            <StarRating count={hotel.starRating} />
            <div className="hotel-address">
              <MapPin size={14} />
              <span>{hotel.address}</span>
            </div>
            <div className="hotel-dist">{hotel.distanceFromCenter}</div>
          </div>
          <div className="hotel-header-right">
            <button
              className={`btn-secondary ${isSaved ? 'saved-btn' : ''}`}
              onClick={() => { toggleSavedProperty(hotel.id); showToast(isSaved ? 'Removed from saved' : 'Saved to favorites') }}
            >
              <Heart size={16} fill={isSaved ? '#E21C5B' : 'none'} color={isSaved ? '#E21C5B' : undefined} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button className="btn-secondary" onClick={() => showToast('Share link copied!')}>
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>

        {/* Rating Summary */}
        <div className="rating-summary card">
          <div className="rating-summary-main">
            <div className={`rating-badge ${hotel.guestRating >= 8 ? 'excellent' : hotel.guestRating >= 7 ? 'very-good' : 'good'}`} style={{ width: '48px', height: '48px', fontSize: '18px' }}>
              {hotel.guestRating}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px' }}>
                {hotel.guestRating >= 9 ? 'Exceptional' : hotel.guestRating >= 8 ? 'Excellent' : 'Very Good'}
              </div>
              <div style={{ color: 'var(--color-medium-gray)', fontSize: '13px' }}>{hotel.reviewCount.toLocaleString()} reviews</div>
            </div>
          </div>
          {hotel.reviews[0]?.categories && (
            <div className="rating-categories">
              {Object.entries(hotel.reviews[0].categories).map(([cat, avg]) => (
                <div key={cat} className="rating-cat">
                  <span className="cat-label">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                  <div className="cat-bar">
                    <div className="cat-bar-fill" style={{ width: `${(avg / 10) * 100}%` }} />
                  </div>
                  <span className="cat-score">{avg}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overview */}
        <div className="detail-section">
          <h2>About this property</h2>
          <p className="hotel-description">{hotel.description}</p>
          <div className="highlights-grid">
            {hotel.highlights.map(h => (
              <div key={h} className="highlight-item">
                <Check size={16} color="var(--color-success)" />
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div className="detail-section">
          <h2>Popular amenities</h2>
          <div className="amenities-grid">
            {hotel.amenities.map(a => {
              const Icon = AMENITY_ICONS[a] || Info
              return (
                <div key={a} className="amenity-item">
                  <Icon size={18} color="var(--color-action-blue)" />
                  <span>{a}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Room Selection */}
        <div className="detail-section">
          <h2>Choose your room</h2>
          <div className="rooms-list">
            {hotel.rooms.map(room => (
              <div key={room.id} className={`room-card ${room.availability === 'sold out' ? 'sold-out' : ''}`}>
                <div className="room-info">
                  <div className="room-name">{room.name}</div>
                  <div className="room-desc">{room.description}</div>
                  <div className="room-specs">
                    <span><Users size={14} /> {room.maxGuests} guests max</span>
                    <span>{room.sqFt} sq ft</span>
                    <span>{room.bedType}</span>
                  </div>
                  <div className="room-amenities-list">
                    {room.amenities.slice(0, 5).map(a => (
                      <span key={a} className="room-amenity">{a}</span>
                    ))}
                  </div>
                  <div className="room-highlights">
                    {room.freeCancellation && (
                      <span className="room-highlight success"><Check size={12} /> Free cancellation</span>
                    )}
                    {room.payLater && (
                      <span className="room-highlight success"><Check size={12} /> Reserve now, pay later</span>
                    )}
                    {room.breakfastIncluded && (
                      <span className="room-highlight success"><Check size={12} /> Breakfast included</span>
                    )}
                    {room.availability === '3 left' || room.availability === '2 left' || room.availability === '1 left' ? (
                      <span className="room-highlight warning">
                        <AlertTriangle size={12} /> Only {room.availability} room{room.availability.startsWith('1') ? '' : 's'} left!
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="room-price-area">
                  {room.availability === 'sold out' ? (
                    <div className="sold-out-label">Sold out</div>
                  ) : (
                    <>
                      {hotel.memberPrice && room.memberPrice && (
                        <span className="badge badge-member" style={{ display: 'inline-block', marginBottom: '4px' }}>Member Price</span>
                      )}
                      {room.originalPrice && (
                        <div className="room-original">${room.originalPrice}<span className="per-night">/night</span></div>
                      )}
                      <div className="room-current">
                        ${hotel.memberPrice && room.memberPrice ? room.memberPrice : room.pricePerNight}
                        <span className="per-night">/night</span>
                      </div>
                      <div className="room-total">${room.totalPrice} total</div>
                      <button
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                        onClick={() => handleReserve(room)}
                      >
                        Reserve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="detail-section">
          <h2>Guest reviews</h2>
          <div className="reviews-header">
            <div className="reviews-filter-tabs">
              {['All', 'Couple', 'Family', 'Business', 'Solo'].map(type => (
                <button
                  key={type}
                  className={`filter-tab ${reviewFilter === type ? 'active' : ''}`}
                  onClick={() => setReviewFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <select
              value={reviewSort}
              onChange={e => setReviewSort(e.target.value)}
              className="sort-select"
            >
              <option value="relevant">Most relevant</option>
              <option value="recent">Most recent</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>

          <div className="reviews-list">
            {sortedReviews.slice(0, reviewsShown).map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div>
                    <div className="reviewer-name">{review.authorName}</div>
                    <div className="review-meta">
                      <span className="badge" style={{ background: 'var(--color-bg-light)', color: 'var(--color-medium-gray)' }}>{review.tripType}</span>
                      <span style={{ color: 'var(--color-medium-gray)', fontSize: '12px' }}>{review.date}</span>
                    </div>
                  </div>
                  <div className="review-rating">
                    <Star size={14} fill="var(--color-golden-yellow)" color="var(--color-golden-yellow)" />
                    <strong>{review.rating}</strong>
                  </div>
                </div>
                <div className="review-title">{review.title}</div>
                <div className="review-body">{review.body}</div>
              </div>
            ))}
          </div>

          {sortedReviews.length > reviewsShown && (
            <button
              className="btn-ghost"
              onClick={() => setReviewsShown(s => s + 5)}
            >
              Show more reviews ({sortedReviews.length - reviewsShown} remaining)
            </button>
          )}
        </div>

        {/* Policies */}
        <div className="detail-section">
          <h2>Important information</h2>
          <div className="policies-grid">
            <div className="policy-item">
              <div className="policy-label">Check-in</div>
              <div className="policy-value">{hotel.policies.checkIn}</div>
            </div>
            <div className="policy-item">
              <div className="policy-label">Check-out</div>
              <div className="policy-value">{hotel.policies.checkOut}</div>
            </div>
            <div className="policy-item">
              <div className="policy-label">Cancellation policy</div>
              <div className="policy-value">{hotel.policies.cancellation}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxOpen(false)}><X size={24} /></button>
            <button
              className="lightbox-nav lightbox-prev"
              onClick={() => setLightboxIndex(i => (i - 1 + hotel.images.length) % hotel.images.length)}
            >
              <ChevronLeft size={32} />
            </button>
            <img src={hotel.images[lightboxIndex]} alt={`Photo ${lightboxIndex + 1}`} className="lightbox-img" />
            <button
              className="lightbox-nav lightbox-next"
              onClick={() => setLightboxIndex(i => (i + 1) % hotel.images.length)}
            >
              <ChevronRight size={32} />
            </button>
            <div className="lightbox-counter">{lightboxIndex + 1} / {hotel.images.length}</div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast">
          <Check size={16} color="white" />
          {toast}
        </div>
      )}
    </div>
  )
}
