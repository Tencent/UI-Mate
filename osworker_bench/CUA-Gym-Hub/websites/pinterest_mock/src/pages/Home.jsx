import React, { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import MasonryGrid from '../components/MasonryGrid';
import PinModal from '../components/PinModal';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { state } = useStore();
  const [selectedPin, setSelectedPin] = useState(null);
  const [displayPins, setDisplayPins] = useState([]);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const PINS_PER_PAGE = 20;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Show all pins shuffled for "personalized" feed
  const feedPins = [...state.pins].sort((a, b) => b.createdAt - a.createdAt);

  // Infinite Scroll
  useEffect(() => {
    setDisplayPins(feedPins.slice(0, page * PINS_PER_PAGE));
  }, [page, state.pins]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePinClick = (pin) => {
    setSelectedPin(pin);
  };

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      {/* "Today" header */}
      <div className="text-center py-6">
        <h2 className="text-[15px] font-semibold text-gray-500">Today</h2>
      </div>

      <MasonryGrid pins={displayPins} onPinClick={handlePinClick} onPinDeleted={showToast} />

      {displayPins.length === 0 && (
        <div className="text-center mt-20 text-gray-500 px-4">
          <p className="text-xl font-semibold text-gray-700 mb-2">
            Your feed is empty
          </p>
          <p className="text-gray-400 mb-4">
            Follow people and boards to fill your home feed with ideas
          </p>
          <button
            className="px-6 py-3 bg-xinterest-red text-white rounded-full font-bold hover:bg-xinterest-hover"
            onClick={() => navigate('/explore')}
          >
            Explore ideas
          </button>
        </div>
      )}

      {selectedPin && (
        <PinModal
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          onDeleted={(msg) => {
            setSelectedPin(null);
            showToast(msg);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-[100] text-sm font-semibold">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Home;
