import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, ShieldCheck, Check, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from '../components/RatingBubbles.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import SaveButton from '../components/SaveButton.jsx';
import ReviewCard from '../components/ReviewCard.jsx';

export default function AttractionDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const [reviewFilter, setReviewFilter] = useState('all');
  const [bookingNotice, setBookingNotice] = useState('');

  const attraction = state.attractions.find(a => a.id === id);
  if (!attraction) return <div className="container" style={{ padding: '48px', textAlign: 'center' }}>Attraction not found.</div>;

  const dest = state.destinations.find(d => d.id === attraction.destinationId);
  const reviews = state.reviews.filter(r => r.entityId === id && r.entityType === 'attraction');
  const filteredReviews = reviewFilter === 'all' ? reviews : reviews.filter(r => r.tripType === reviewFilter);

  const ratingBreakdown = [5, 4, 3, 2, 1].map(level => ({
    level, count: reviews.filter(r => r.rating === level).length,
    label: level === 5 ? 'Excellent' : level === 4 ? 'Very Good' : level === 3 ? 'Average' : level === 2 ? 'Poor' : 'Terrible'
  }));
  const maxCount = Math.max(...ratingBreakdown.map(b => b.count), 1);

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <div style={{ fontSize: '12px', color: '#8A8A8A', marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <Link to="/attractions" style={{ color: '#00AA6C' }}>Things to Do</Link>
        <span>/</span>
        {dest && <><Link to={`/attractions?destination=${dest.id}`} style={{ color: '#00AA6C' }}>{dest.name}</Link><span>/</span></>}
        <span>{attraction.name}</span>
      </div>

      <PhotoGallery images={attraction.images} name={attraction.name} />

      <div style={{ display: 'flex', gap: '24px', marginTop: '24px' }}>
        <div style={{ flex: 1 }}>
          {/* Title */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700 }}>{attraction.name}</h1>
              <SaveButton entityId={attraction.id} entityType="attraction" />
            </div>
            <RatingBubbles rating={attraction.rating} size="medium" count={attraction.reviewCount} />
            {attraction.travelersChoice && (
              <div className="travelers-choice-badge" style={{ marginTop: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={14} /> Travelers' Choice
              </div>
            )}
            <div style={{ fontSize: '14px', color: '#545454', marginBottom: '4px' }}>
              #{attraction.rank} of {attraction.totalAttractionsInCity} things to do in {dest?.name}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="tag-pill">{attraction.category}</span>
              <span className="tag-pill"><Clock size={12} style={{ marginRight: '4px' }} />{attraction.duration}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#545454' }}>
              <MapPin size={14} /> {attraction.address}
            </div>
          </div>

          {/* Description */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>About</h2>
            <p style={{ fontSize: '14px', lineHeight: '1.7' }}>{attraction.description}</p>
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '14px', color: '#545454' }}>
              <div><strong>Duration:</strong> {attraction.duration}</div>
              <div><strong>Hours:</strong> {attraction.hours}</div>
            </div>
            {attraction.bestTimeToVisit && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#E8F5E9', borderRadius: '8px', fontSize: '14px' }}>
                <strong>Best time to visit:</strong> {attraction.bestTimeToVisit}
              </div>
            )}
          </section>

          {/* What's Included */}
          {attraction.whatsIncluded && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>What's Included</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {attraction.whatsIncluded.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <Check size={16} color="#00AA6C" /> {item}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Location */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Location</h2>
            <div style={{ width: '100%', height: '200px', background: '#E8E8E8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={32} color="#00AA6C" />
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Reviews ({reviews.length})</h2>
              <Link to={`/reviews/write/attraction/${attraction.id}`} className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '8px 16px' }}>
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

        {/* Booking sidebar */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: '72px' }}>
            <div style={{ border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Book Your Experience</h3>
              {attraction.bookingOptions.map((opt, i) => (
                <div key={i} style={{ padding: '12px 0', borderTop: i > 0 ? '1px solid #E0E0E0' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{opt.tier}</div>
                  <div style={{ fontSize: '12px', color: '#545454', marginBottom: '8px' }}>{opt.includes}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '18px' }}>
                      {opt.price === 0 ? 'Free' : `$${opt.price}`}
                    </span>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        dispatch({ type: 'ADD_BOOKING', payload: { type: 'attraction', attractionId: attraction.id, attractionName: attraction.name, tier: opt.tier, price: opt.price } });
                        setBookingNotice(`${opt.tier} booked for ${attraction.name}.`);
                      }}
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      {opt.price === 0 ? 'Reserve' : 'Book'}
                    </button>
                  </div>
                </div>
              ))}
              {bookingNotice && (
                <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: '#F6FFFB', color: '#006B45', fontSize: '13px', fontWeight: 600 }}>
                  {bookingNotice}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
