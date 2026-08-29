import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Award, Star, MessageCircle, ThumbsUp, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from '../components/RatingBubbles.jsx';

export default function Profile() {
  const { state } = useApp();
  const user = state.currentUser;
  const [activeTab, setActiveTab] = useState('reviews');

  const myReviews = state.reviews.filter(r => r.userId === user.id);
  const myTrips = state.trips.filter(t => t.userId === user.id);
  const totalHelpful = myReviews.reduce((sum, r) => sum + r.helpfulVotes, 0);

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #E0E0E0' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', background: '#00AA6C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '28px', fontWeight: 700, flexShrink: 0
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>{user.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#545454', fontSize: '14px', marginBottom: '4px' }}>
            <MapPin size={14} /> {user.location}
          </div>
          <div style={{ fontSize: '13px', color: '#8A8A8A' }}>Member since {user.memberSince}</div>
          {user.bio && <p style={{ fontSize: '14px', color: '#545454', marginTop: '8px' }}>{user.bio}</p>}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: '#FFF3CD', border: '1px solid #F2B203', borderRadius: '8px', padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Award size={16} color="#7A5500" />
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#7A5500' }}>{user.level}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
        {[
          { icon: MessageCircle, label: 'Reviews', value: user.reviewCount },
          { icon: ThumbsUp, label: 'Helpful Votes', value: user.helpfulVotes },
          { icon: Camera, label: 'Photos', value: user.photoCount }
        ].map(stat => (
          <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={22} color="#00AA6C" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{stat.value.toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: '#8A8A8A' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '2px solid #E0E0E0', marginBottom: '24px' }}>
        {['reviews', 'trips', 'contributions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 0',
              borderBottom: activeTab === tab ? '3px solid #1A1A1A' : '3px solid transparent',
              fontWeight: activeTab === tab ? 700 : 400,
              fontSize: '14px',
              color: activeTab === tab ? '#1A1A1A' : '#545454',
              background: 'none',
              border: 'none',
              borderBottomWidth: '3px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === tab ? '#1A1A1A' : 'transparent',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'reviews' && (
        <div>
          {myReviews.length === 0 ? (
            <p style={{ color: '#8A8A8A', textAlign: 'center', padding: '32px' }}>No reviews yet.</p>
          ) : (
            myReviews.map(review => (
              <div key={review.id} style={{ padding: '16px', border: '1px solid #E0E0E0', borderRadius: '12px', marginBottom: '12px' }}>
                <Link to={`/${review.entityType}/${review.entityId}`} style={{ fontWeight: 700, fontSize: '14px', color: '#00AA6C' }}>
                  {review.entityName}
                </Link>
                <div style={{ marginTop: '4px', marginBottom: '4px' }}>
                  <RatingBubbles rating={review.rating} size="small" />
                  <span style={{ fontSize: '12px', color: '#8A8A8A', marginLeft: '8px' }}>{review.createdAt}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{review.title}</div>
                <p style={{ fontSize: '14px', color: '#545454', lineHeight: '1.5' }}>
                  {review.text.slice(0, 200)}...
                </p>
                <div style={{ fontSize: '12px', color: '#8A8A8A', marginTop: '4px' }}>
                  {review.helpfulVotes} helpful votes
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'trips' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {myTrips.map(trip => (
            <Link key={trip.id} to="/trips" style={{
              textDecoration: 'none', color: '#1A1A1A', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px'
            }}>
              <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{trip.name}</h3>
              <p style={{ fontSize: '13px', color: '#545454' }}>{trip.items.length} items</p>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'contributions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'First Review', desc: 'Wrote your first review', earned: true },
            { label: 'Explorer', desc: 'Reviewed 10+ places', earned: true },
            { label: 'Helpful', desc: 'Received 100+ helpful votes', earned: true },
            { label: 'Photographer', desc: 'Uploaded 50+ photos', earned: true },
            { label: 'Globetrotter', desc: 'Reviewed in 5+ countries', earned: false },
            { label: 'Top Contributor', desc: 'Reached top contributor status', earned: false }
          ].map(badge => (
            <div key={badge.label} style={{
              padding: '16px', border: '1px solid #E0E0E0', borderRadius: '12px', textAlign: 'center',
              opacity: badge.earned ? 1 : 0.4
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: badge.earned ? '#00AA6C' : '#E0E0E0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px', color: 'white'
              }}>
                <Award size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{badge.label}</div>
              <div style={{ fontSize: '12px', color: '#8A8A8A' }}>{badge.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
