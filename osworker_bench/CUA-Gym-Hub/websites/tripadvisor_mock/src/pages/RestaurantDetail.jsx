import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ShieldCheck, UtensilsCrossed } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from '../components/RatingBubbles.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import SaveButton from '../components/SaveButton.jsx';
import ReviewCard from '../components/ReviewCard.jsx';

export default function RestaurantDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [reviewFilter, setReviewFilter] = useState('all');
  const [actionNotice, setActionNotice] = useState('');

  const restaurant = state.restaurants.find(r => r.id === id);
  if (!restaurant) return <div className="container" style={{ padding: '48px', textAlign: 'center' }}>Restaurant not found.</div>;

  const dest = state.destinations.find(d => d.id === restaurant.destinationId);
  const reviews = state.reviews.filter(r => r.entityId === id && r.entityType === 'restaurant');
  const filteredReviews = reviewFilter === 'all' ? reviews : reviews.filter(r => r.tripType === reviewFilter);
  const nearbyHotels = state.hotels.filter(h => h.destinationId === restaurant.destinationId).slice(0, 3);

  const ratingBreakdown = [5, 4, 3, 2, 1].map(level => ({
    level, count: reviews.filter(r => r.rating === level).length,
    label: level === 5 ? 'Excellent' : level === 4 ? 'Very Good' : level === 3 ? 'Average' : level === 2 ? 'Poor' : 'Terrible'
  }));
  const maxCount = Math.max(...ratingBreakdown.map(b => b.count), 1);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <div style={{ fontSize: '12px', color: '#8A8A8A', marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <Link to="/restaurants" style={{ color: '#00AA6C' }}>Restaurants</Link>
        <span>/</span>
        {dest && <><Link to={`/restaurants?destination=${dest.id}`} style={{ color: '#00AA6C' }}>{dest.name}</Link><span>/</span></>}
        <span>{restaurant.name}</span>
      </div>

      <PhotoGallery images={restaurant.images} name={restaurant.name} />

      <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
        <div style={{ flex: 1 }}>
          {/* Title */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700 }}>{restaurant.name}</h1>
              <SaveButton entityId={restaurant.id} entityType="restaurant" />
            </div>
            <RatingBubbles rating={restaurant.rating} size="medium" count={restaurant.reviewCount} />
            {restaurant.travelersChoice && (
              <div className="travelers-choice-badge" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={14} /> Travelers' Choice
              </div>
            )}
            <div style={{ fontSize: '14px', color: '#545454', marginBottom: '4px' }}>
              #{restaurant.rank} of {restaurant.totalRestaurantsInCity} restaurants in {dest?.name}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {restaurant.cuisines.map(c => <span key={c} className="tag-pill">{c}</span>)}
              <span className="tag-pill">{restaurant.priceLevel}</span>
              {restaurant.meals.map(m => <span key={m} className="tag-pill">{m}</span>)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#545454' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {restaurant.address}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {restaurant.phone}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {restaurant.hours}</div>
            </div>
          </div>

          {/* Sub-ratings */}
          {restaurant.subRatings && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Ratings</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {Object.entries(restaurant.subRatings).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#545454', textTransform: 'capitalize', width: '100px' }}>{key}</span>
                    <RatingBubbles rating={val} size="small" />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>About</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.7' }}>{restaurant.description}</p>
            {restaurant.dietaryOptions.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Dietary: </span>
                {restaurant.dietaryOptions.join(', ')}
              </div>
            )}
            {restaurant.features.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Features: </span>
                {restaurant.features.join(', ')}
              </div>
            )}
          </section>

          {/* Location */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Location</h2>
            <div style={{ width: '100%', height: '200px', background: '#E8E8E8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MapPin size={32} color="#CC0000" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Hotels Nearby</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {nearbyHotels.map(h => (
                <Link key={h.id} to={`/hotel/${h.id}`} style={{ textDecoration: 'none', color: '#1A1A1A', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{h.name}</div>
                  <RatingBubbles rating={h.rating} size="small" />
                  <div style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '4px' }}>from ${h.pricePerNight}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Reviews ({reviews.length})</h2>
              <Link to={`/reviews/write/restaurant/${restaurant.id}`} className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>
                Write a review
              </Link>
            </div>

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

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['all', 'Couples', 'Family', 'Solo', 'Business', 'Friends'].map(f => (
                <button key={f} onClick={() => setReviewFilter(f)} style={{
                  padding: '6px 14px', borderRadius: '20px',
                  border: reviewFilter === f ? 'none' : '1px solid #E0E0E0',
                  background: reviewFilter === f ? '#1A1A1A' : 'white',
                  color: reviewFilter === f ? 'white' : '#1A1A1A',
                  fontSize: '13px', cursor: 'pointer'
                }}>{f === 'all' ? 'All' : f}</button>
              ))}
            </div>

            {filteredReviews.length === 0 ? (
              <p style={{ color: '#8A8A8A', padding: '24px 0' }}>No reviews match this filter.</p>
            ) : (
              filteredReviews.map(r => <ReviewCard key={r.id} review={r} />)
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '72px' }}>
            <div style={{ border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              {restaurant.features.includes('Reservations') && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    dispatch({ type: 'ADD_BOOKING', payload: { type: 'restaurant-reservation', restaurantId: restaurant.id, restaurantName: restaurant.name, partySize: 2 } });
                    setActionNotice(`Table reserved at ${restaurant.name}.`);
                  }}
                  style={{ width: '100%', marginBottom: '12px', padding: '12px' }}
                >
                  <UtensilsCrossed size={16} style={{ marginRight: '6px' }} /> Reserve a Table
                </button>
              )}
              {restaurant.features.includes('Delivery') && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    dispatch({ type: 'ADD_BOOKING', payload: { type: 'restaurant-delivery', restaurantId: restaurant.id, restaurantName: restaurant.name } });
                    setActionNotice(`Delivery order started for ${restaurant.name}.`);
                  }}
                  style={{ width: '100%', marginBottom: '12px', padding: '12px' }}
                >
                  Order Delivery
                </button>
              )}
              {actionNotice && (
                <div style={{ marginBottom: '12px', padding: '10px', borderRadius: '8px', background: '#F6FFFB', color: '#006B45', fontSize: '13px', fontWeight: 600 }}>
                  {actionNotice}
                </div>
              )}
              <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: '16px', marginTop: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Details</h4>
                <div style={{ fontSize: '13px', color: '#545454', lineHeight: '2' }}>
                  <div><strong>Price range:</strong> {restaurant.priceLevel}</div>
                  <div><strong>Cuisines:</strong> {restaurant.cuisines.join(', ')}</div>
                  <div><strong>Meals:</strong> {restaurant.meals.join(', ')}</div>
                  <div><strong>Features:</strong> {restaurant.features.join(', ')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
