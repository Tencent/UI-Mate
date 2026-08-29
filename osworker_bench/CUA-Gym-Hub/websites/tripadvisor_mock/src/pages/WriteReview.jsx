import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const tripTypes = ['Couples', 'Family', 'Solo', 'Business', 'Friends'];
const ratingLabels = ['Terrible', 'Poor', 'Average', 'Very Good', 'Excellent'];

export default function WriteReview() {
  const { entityType, entityId } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const entity = entityType === 'hotel' ? state.hotels.find(h => h.id === entityId)
    : entityType === 'restaurant' ? state.restaurants.find(r => r.id === entityId)
    : state.attractions.find(a => a.id === entityId);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tripType, setTripType] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [errors, setErrors] = useState({});

  if (!entity) return <div className="container" style={{ padding: '48px', textAlign: 'center' }}>Entity not found.</div>;

  const validate = () => {
    const newErrors = {};
    if (!rating) newErrors.rating = 'Please select a rating';
    if (!title.trim()) newErrors.title = 'Title is required';
    if (text.length < 100) newErrors.text = `Review must be at least 100 characters (${text.length}/100)`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const review = {
      id: `review_${Date.now()}`,
      entityId,
      entityType,
      entityName: entity.name,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userLocation: state.currentUser.location,
      rating,
      title: title.trim(),
      text: text.trim(),
      tripType: tripType || null,
      travelDate: travelDate || null,
      createdAt: new Date().toISOString().split('T')[0],
      helpfulVotes: 0,
      photos: [],
      managementResponse: null
    };

    dispatch({ type: 'ADD_REVIEW', payload: review });
    navigate(`/${entityType}/${entityId}`);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="container" style={{ maxWidth: '700px', paddingTop: '32px', paddingBottom: '48px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Write a Review</h1>
      <p style={{ fontSize: '16px', color: '#545454', marginBottom: '32px' }}>{entity.name}</p>

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ fontWeight: 700, fontSize: '16px', display: 'block', marginBottom: '12px' }}>
            How would you rate your experience?
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid ' + (displayRating >= i ? '#00AA6C' : '#E0E0E0'),
                  background: displayRating >= i ? '#00AA6C' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: displayRating >= i ? 'white' : '#8A8A8A',
                  fontSize: '16px',
                  fontWeight: 700
                }}
              >
                {i}
              </button>
            ))}
            {displayRating > 0 && (
              <span style={{ marginLeft: '12px', fontSize: '16px', fontWeight: 600, color: '#00AA6C' }}>
                {ratingLabels[displayRating - 1]}
              </span>
            )}
          </div>
          {errors.rating && <div style={{ color: '#CC0000', fontSize: '13px', marginTop: '8px' }}>{errors.rating}</div>}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Title of your review
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.title ? '#CC0000' : '#E0E0E0'}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          {errors.title && <div style={{ color: '#CC0000', fontSize: '13px', marginTop: '4px' }}>{errors.title}</div>}
        </div>

        {/* Body */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Your review
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tell people about your experience: describe the place, the service, and share your tips for other travelers."
            rows={8}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.text ? '#CC0000' : '#E0E0E0'}`,
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              lineHeight: '1.6'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            {errors.text ? (
              <div style={{ color: '#CC0000', fontSize: '13px' }}>{errors.text}</div>
            ) : <div />}
            <div style={{ fontSize: '12px', color: text.length >= 100 ? '#00AA6C' : '#8A8A8A' }}>
              {text.length}/100 min
            </div>
          </div>
        </div>

        {/* Trip Type */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            Trip type (optional)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tripTypes.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTripType(tripType === t ? '' : t)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: tripType === t ? 'none' : '1px solid #E0E0E0',
                  background: tripType === t ? '#1A1A1A' : 'white',
                  color: tripType === t ? 'white' : '#1A1A1A',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Date */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ fontWeight: 700, fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            When did you visit? (optional)
          </label>
          <input
            type="month"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
          Submit Review
        </button>
      </form>
    </div>
  );
}
