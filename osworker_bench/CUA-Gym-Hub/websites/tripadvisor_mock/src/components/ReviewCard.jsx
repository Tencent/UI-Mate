import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from './RatingBubbles.jsx';

export default function ReviewCard({ review }) {
  const { state, dispatch } = useApp();
  const [expanded, setExpanded] = useState(false);
  const hasVoted = state.votedHelpful.includes(review.id);
  const isLong = review.text.length > 300;

  const handleHelpful = () => {
    if (!hasVoted) {
      dispatch({ type: 'VOTE_HELPFUL', payload: review.id });
    }
  };

  const initials = review.userName.slice(0, 2).toUpperCase();

  return (
    <div style={{
      padding: '20px 0',
      borderBottom: '1px solid #E0E0E0'
    }}>
      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#00AA6C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 700,
          flexShrink: 0
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1A1A1A' }}>{review.userName}</div>
          <div style={{ fontSize: '12px', color: '#8A8A8A' }}>{review.userLocation}</div>
        </div>
      </div>

      {/* Rating + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <RatingBubbles rating={review.rating} size="medium" />
        <span style={{ fontSize: '12px', color: '#8A8A8A' }}>
          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: '#1A1A1A' }}>
        {review.title}
      </div>

      {/* Body */}
      <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#1A1A1A', marginBottom: '8px' }}>
        {isLong && !expanded ? review.text.slice(0, 300) + '...' : review.text}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              display: 'inline',
              background: 'none',
              border: 'none',
              color: '#1A1A1A',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              marginLeft: '4px',
              textDecoration: 'underline'
            }}
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Trip type */}
      {review.tripType && (
        <div style={{ marginBottom: '12px' }}>
          <span style={{
            display: 'inline-block',
            background: '#F2F2F2',
            border: '1px solid #E0E0E0',
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '12px',
            color: '#545454'
          }}>
            {review.tripType} trip
          </span>
        </div>
      )}

      {/* Review photos */}
      {review.photos && review.photos.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {review.photos.map((photo, i) => (
            <div key={i} style={{
              width: '80px',
              height: '80px',
              borderRadius: '8px',
              background: photo,
              flexShrink: 0
            }} />
          ))}
        </div>
      )}

      {/* Helpful */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={handleHelpful}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: hasVoted ? '#E8F5E9' : 'transparent',
            border: '1px solid ' + (hasVoted ? '#00AA6C' : '#E0E0E0'),
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '13px',
            color: hasVoted ? '#00AA6C' : '#545454',
            cursor: hasVoted ? 'default' : 'pointer',
            fontWeight: hasVoted ? 600 : 400
          }}
        >
          <ThumbsUp size={14} fill={hasVoted ? '#00AA6C' : 'none'} />
          Helpful {review.helpfulVotes > 0 && `(${review.helpfulVotes})`}
        </button>
      </div>

      {/* Management response */}
      {review.managementResponse && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: '#F5F5F5',
          borderRadius: '8px',
          borderLeft: '3px solid #00AA6C'
        }}>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
            Response from {review.managementResponse.author}
          </div>
          <div style={{ fontSize: '12px', color: '#8A8A8A', marginBottom: '8px' }}>
            {review.managementResponse.date}
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#545454' }}>
            {review.managementResponse.text}
          </div>
        </div>
      )}
    </div>
  );
}
