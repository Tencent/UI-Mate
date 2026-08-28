import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import RatingBubbles from '../components/RatingBubbles.jsx';

export default function Trips() {
  const { state, dispatch } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripDesc, setNewTripDesc] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripError, setTripError] = useState('');

  const myTrips = state.trips.filter(t => t.userId === state.currentUser.id);

  const handleCreate = () => {
    if (!newTripName.trim()) {
      setTripError('Enter a trip name.');
      return;
    }
    dispatch({ type: 'CREATE_TRIP', payload: { name: newTripName.trim(), description: newTripDesc.trim() } });
    setNewTripName('');
    setNewTripDesc('');
    setTripError('');
    setShowCreateModal(false);
  };

  useEffect(() => {
    if (!showCreateModal) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowCreateModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCreateModal]);

  const handleRemoveItem = (tripId, entityId) => {
    const trip = state.trips.find(t => t.id === tripId);
    const item = trip?.items.find(i => i.entityId === entityId);
    dispatch({ type: 'TOGGLE_SAVE', payload: { entityId, entityType: item?.entityType || 'hotel', tripId } });
  };

  const getEntity = (item) => {
    if (item.entityType === 'hotel') return state.hotels.find(h => h.id === item.entityId);
    if (item.entityType === 'restaurant') return state.restaurants.find(r => r.id === item.entityId);
    if (item.entityType === 'vacationRental') return item.snapshot;
    return state.attractions.find(a => a.id === item.entityId);
  };

  const tripDetail = selectedTrip ? myTrips.find(t => t.id === selectedTrip) : null;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>My Trips</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Create a Trip
        </button>
      </div>

      {selectedTrip && tripDetail ? (
        <div>
          <button onClick={() => setSelectedTrip(null)} style={{ color: '#00AA6C', fontWeight: 600, fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>
            &larr; Back to all trips
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>{tripDetail.name}</h2>
          {tripDetail.description && <p style={{ color: '#545454', marginBottom: '16px' }}>{tripDetail.description}</p>}
          <p style={{ fontSize: '13px', color: '#8A8A8A', marginBottom: '20px' }}>{tripDetail.items.length} items saved</p>

          {tripDetail.items.length === 0 ? (
            <p style={{ color: '#8A8A8A', padding: '32px 0', textAlign: 'center' }}>No items saved to this trip yet.</p>
          ) : (
            tripDetail.items.map(item => {
              const entity = getEntity(item);
              if (!entity) return null;
              const linkPath = item.entityType === 'vacationRental'
                ? `/vacation-rentals?destination=${entity.destinationId || ''}`
                : `/${item.entityType}/${item.entityId}`;
              return (
                <div key={item.entityId} style={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '16px', marginBottom: '12px', background: 'white' }}>
                  <div style={{ width: '120px', height: '90px', borderRadius: '8px', background: entity.images?.[0] || '#E0E0E0', flexShrink: 0 }} />
                  <div style={{ flex: 1, marginLeft: '16px' }}>
                    <Link to={linkPath} style={{ fontWeight: 700, fontSize: '16px', color: '#1A1A1A' }}>{entity.name}</Link>
                    <div style={{ marginTop: '4px' }}><RatingBubbles rating={entity.rating} size="small" count={entity.reviewCount} /></div>
                    <span className="tag-pill" style={{ marginTop: '4px' }}>{item.entityType}</span>
                  </div>
                  <button onClick={() => handleRemoveItem(tripDetail.id, item.entityId)} style={{ color: '#CC0000', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <>
          {myTrips.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ fontSize: '16px', color: '#545454', marginBottom: '16px' }}>You haven't created any trips yet.</p>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>Create your first trip</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {myTrips.map(trip => (
                <div key={trip.id} onClick={() => setSelectedTrip(trip.id)} style={{
                  border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px', background: 'white', cursor: 'pointer',
                  transition: 'box-shadow 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{trip.name}</h3>
                  {trip.description && <p style={{ fontSize: '14px', color: '#545454', marginBottom: '8px' }}>{trip.description}</p>}
                  <div style={{ fontSize: '13px', color: '#8A8A8A' }}>
                    {trip.items.length} items | Created {trip.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '32px', maxWidth: '480px', width: '90%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setShowCreateModal(false); setTripError(''); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>Create a Trip</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Trip Name *</label>
              <input
                type="text"
                value={newTripName}
                onChange={(e) => { setNewTripName(e.target.value); setTripError(''); }}
                placeholder="e.g., Summer Vacation 2026"
                style={{ width: '100%', padding: '10px 14px', border: `1px solid ${tripError ? '#CC0000' : '#E0E0E0'}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              />
              {tripError && <div style={{ color: '#CC0000', fontSize: '12px', marginTop: '6px' }}>{tripError}</div>}
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '6px' }}>Description (optional)</label>
              <textarea
                value={newTripDesc}
                onChange={(e) => setNewTripDesc(e.target.value)}
                placeholder="Add notes about your trip"
                rows={3}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
              />
            </div>
            <button className="btn-primary" onClick={handleCreate} style={{ width: '100%', padding: '12px' }}>Create</button>
          </div>
        </div>
      )}
    </div>
  );
}
