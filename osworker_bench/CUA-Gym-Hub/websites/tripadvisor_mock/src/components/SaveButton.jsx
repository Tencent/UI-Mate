import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function SaveButton({ entityId, entityType, entitySnapshot = null, size = 24 }) {
  const { state, dispatch } = useApp();
  const [showPopover, setShowPopover] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [tripError, setTripError] = useState('');
  const key = `${entityType}_${entityId}`;
  const isSaved = !!state.savedEntities[key];

  const handleToggle = (tripId) => {
    dispatch({ type: 'TOGGLE_SAVE', payload: { entityId, entityType, tripId, snapshot: entitySnapshot } });
    setShowPopover(false);
  };

  const handleCreateTrip = () => {
    const name = newTripName.trim();
    if (!name) {
      setTripError('Enter a trip name.');
      return;
    }
    const tripId = `trip_${Date.now()}`;
    dispatch({ type: 'CREATE_TRIP', payload: { id: tripId, name, description: '' } });
    dispatch({ type: 'TOGGLE_SAVE', payload: { entityId, entityType, tripId, snapshot: entitySnapshot } });
    setNewTripName('');
    setTripError('');
    setShowPopover(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isSaved) {
            handleToggle(null);
          } else {
            setShowPopover(!showPopover);
          }
        }}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.15s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title={isSaved ? 'Remove from trip' : 'Save to trip'}
      >
        <Heart
          size={size}
          color={isSaved ? '#CC0000' : '#1A1A1A'}
          fill={isSaved ? '#CC0000' : 'none'}
        />
      </button>

      {showPopover && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
            padding: '12px',
            minWidth: '200px',
            zIndex: 100
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Save to a trip</div>
          {state.trips.map(trip => (
            <label
              key={trip.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 0',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <input
                type="checkbox"
                checked={trip.items.some(i => i.entityId === entityId)}
                onChange={() => handleToggle(trip.id)}
                style={{ accentColor: '#00AA6C' }}
              />
              {trip.name}
            </label>
          ))}
          <div style={{ borderTop: '1px solid #E0E0E0', marginTop: '8px', paddingTop: '10px' }}>
            <input
              type="text"
              value={newTripName}
              onChange={(e) => { setNewTripName(e.target.value); setTripError(''); }}
              placeholder="Trip name"
              style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: '6px', padding: '8px', fontSize: '13px', outline: 'none' }}
            />
            {tripError && <div style={{ color: '#CC0000', fontSize: '12px', marginTop: '6px' }}>{tripError}</div>}
            <button
              onClick={handleCreateTrip}
              style={{
                marginTop: '8px',
                fontSize: '13px',
                color: '#00AA6C',
                fontWeight: 700,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              + Create a trip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
