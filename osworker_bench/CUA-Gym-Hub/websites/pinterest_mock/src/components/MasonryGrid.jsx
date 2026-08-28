import React from 'react';
import PinCard from './PinCard';

const MasonryGrid = ({ pins, onPinClick, onPinDeleted }) => {
  if (!pins || pins.length === 0) return null;

  return (
    <div className="masonry-grid">
      {pins.map(pin => (
        <PinCard key={pin.id} pin={pin} onClick={onPinClick} onDeleted={onPinDeleted} />
      ))}
    </div>
  );
};

export default MasonryGrid;
