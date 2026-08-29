import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, Waves, Dumbbell, UtensilsCrossed, Coffee, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from '../components/RatingBubbles.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import SaveButton from '../components/SaveButton.jsx';
import ReviewCard from '../components/ReviewCard.jsx';

const amenityIcons = {
  'Free WiFi': Wifi, 'Pool': Waves, 'Parking': Car, 'Valet Parking': Car,
  'Fitness Center': Dumbbell, 'Restaurant': UtensilsCrossed, 'Bar/Lounge': Coffee
};

export default function HotelDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [showAllDescription, setShowAllDescription] = useState(false);
  const [dealNotice, setDealNotice] = useState('');

  const hotel = state.hotels.find(h => h.id === id);
  if (!hotel) return <div className="container" style={{ padding: '48px', textAlign: 'center' }}>Hotel not found.</div>;

  const dest = state.destinations.find(d => d.id === hotel.destinationId);
  const reviews = state.reviews.filter(r => r.entityId === id && r.entityType === 'hotel');
  const filteredReviews = reviewFilter === 'all' ? reviews : reviews.filter(r => r.tripType === reviewFilter);
  const nearbyRestaurants = state.restaurants.filter(r => r.destinationId === hotel.destinationId).slice(0, 3);
  const nearbyAttractions = state.attractions.filter(a => a.destinationId === hotel.destinationId).slice(0, 3);

  const ratingBreakdown = [5, 4, 3, 2, 1].map(level => ({
    level,
    count: reviews.filter(r => r.rating === level).length,
    label: level === 5 ? 'Excellent' : level === 4 ? 'Very Good' : level === 3 ? 'Average' : level === 2 ? 'Poor' : 'Terrible'
  }));
  const maxCount = Math.max(...ratingBreakdown.map(b => b.count), 1);

  const displayedAmenities = showAllAmenities ? hotel.amenities : hotel.amenities.slice(0, 9);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: '#8A8A8A', marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <Link to="/hotels" style={{ color: '#00AA6C' }}>Hotels</Link>
        <span>/</span>
        {dest && <><Link to={`/hotels?destination=${dest.id}`} style={{ color: '#00AA6C' }}>{dest.name}</Link><span>/</span></>}
        <span>{hotel.name}</span>
      </div>

      {/* Photo Gallery */}
      <PhotoGallery images={hotel.images} name={hotel.name} />

      <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
        {/* Main content */}
        <div style={{ flex: 1 }}>
          {/* Title area */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700 }}>{hotel.name}</h1>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: hotel.starClass }, (_, i) => (
                  <Star key={i} size={16} fill="#F2B203" color="#F2B203" />
                ))}
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <SaveButton entityId={hotel.id} entityType="hotel" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <RatingBubbles rating={hotel.rating} size="medium" count={hotel.reviewCount} />
            </div>
            {hotel.travelersChoice && (
              <div className="travelers-choice-badge" style={{ marginBottom: '8px' }}>
                <ShieldCheck size={14} /> Travelers' Choice
              </div>
            )}
            <div style={{ fontSize: '14px', color: '#545454', marginBottom: '4px' }}>
              #{hotel.rank} of {hotel.totalHotelsInCity} hotels in {dest?.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#545454' }}>
              <MapPin size={14} />
              {hotel.address}
            </div>
          </div>

          {/* About */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>About</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#1A1A1A' }}>
              {showAllDescription || hotel.description.length <= 200 ? hotel.description : hotel.description.slice(0, 200) + '...'}
              {hotel.description.length > 200 && (
                <button onClick={() => setShowAllDescription(!showAllDescription)} style={{ color: '#1A1A1A', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px', textDecoration: 'underline' }}>
                  {showAllDescription ? 'Read less' : 'Read more'}
                </button>
              )}
            </p>
          </section>

          {/* Amenities */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Amenities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {displayedAmenities.map(a => {
                const Icon = amenityIcons[a] || ShieldCheck;
                return (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <Icon size={16} color="#00AA6C" />
                    {a}
                  </div>
                );
              })}
            </div>
            {hotel.amenities.length > 9 && (
              <button onClick={() => setShowAllAmenities(!showAllAmenities)} style={{ marginTop: '12px', color: '#1A1A1A', fontWeight: 600, fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {showAllAmenities ? 'Show less' : `Show all ${hotel.amenities.length} amenities`}
                {showAllAmenities ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </section>

          {/* Location */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Location</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#545454', marginBottom: '12px' }}>
              <MapPin size={14} /> {hotel.address}
            </div>
            <div style={{ width: '100%', height: '200px', background: '#E8E8E8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MapPin size={32} color="#00AA6C" />
            </div>
            {/* Nearby */}
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>What's Nearby</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {nearbyRestaurants.map(r => (
                <Link key={r.id} to={`/restaurant/${r.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #E0E0E0', borderRadius: '8px', textDecoration: 'none', color: '#1A1A1A', fontSize: '13px' }}>
                  <UtensilsCrossed size={14} color="#8A8A8A" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <RatingBubbles rating={r.rating} size="small" />
                  </div>
                </Link>
              ))}
              {nearbyAttractions.map(a => (
                <Link key={a.id} to={`/attraction/${a.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #E0E0E0', borderRadius: '8px', textDecoration: 'none', color: '#1A1A1A', fontSize: '13px' }}>
                  <Star size={14} color="#8A8A8A" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <RatingBubbles rating={a.rating} size="small" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Reviews ({reviews.length})</h2>
              <Link to={`/reviews/write/hotel/${hotel.id}`} className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>
                Write a review
              </Link>
            </div>

            {/* Rating breakdown */}
            <div style={{ marginBottom: '24px', padding: '16px', background: '#F5F5F5', borderRadius: '12px' }}>
              {ratingBreakdown.map(b => (
                <div key={b.level} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ width: '80px', fontSize: '13px', color: '#545454' }}>{b.label}</span>
                  <div style={{ flex: 1, height: '8px', background: '#E0E0E0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(b.count / maxCount) * 100}%`, background: '#00AA6C', borderRadius: '4px' }} />
                  </div>
                  <span style={{ width: '30px', fontSize: '13px', color: '#545454', textAlign: 'right' }}>{b.count}</span>
                </div>
              ))}
            </div>

            {/* Sub-ratings */}
            {hotel.subRatings && (
              <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {Object.entries(hotel.subRatings).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#545454', textTransform: 'capitalize', width: '90px' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div style={{ flex: 1, height: '6px', background: '#E0E0E0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(val / 5) * 100}%`, background: '#00AA6C', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, width: '24px', textAlign: 'right' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['all', 'Couples', 'Family', 'Solo', 'Business', 'Friends'].map(f => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: reviewFilter === f ? 'none' : '1px solid #E0E0E0',
                    background: reviewFilter === f ? '#1A1A1A' : 'white',
                    color: reviewFilter === f ? 'white' : '#1A1A1A',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>

            {/* Review list */}
            {filteredReviews.length === 0 ? (
              <p style={{ color: '#8A8A8A', padding: '24px 0' }}>No reviews match this filter.</p>
            ) : (
              filteredReviews.map(r => <ReviewCard key={r.id} review={r} />)
            )}
          </section>
        </div>

        {/* Price comparison sidebar */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '72px' }}>
            <div style={{
              border: '1px solid #E0E0E0',
              borderRadius: '12px',
              padding: '20px',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Prices</h3>
              <p style={{ fontSize: '12px', color: '#8A8A8A', marginBottom: '16px' }}>
                Average nightly price provided by our partners
              </p>
              {hotel.partnerPrices.sort((a, b) => a.price - b.price).map((pp, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i > 0 ? '1px solid #E0E0E0' : 'none' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{pp.partner}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>${pp.price}</span>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        dispatch({ type: 'ADD_BOOKING', payload: { type: 'hotel', provider: pp.partner, hotelId: hotel.id, hotelName: hotel.name, price: pp.price } });
                        setDealNotice(`${pp.partner} deal saved for ${hotel.name}.`);
                      }}
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      View Deal
                    </button>
                  </div>
                </div>
              ))}
              {dealNotice && (
                <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: '#F6FFFB', color: '#006B45', fontSize: '13px', fontWeight: 600 }}>
                  {dealNotice}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
