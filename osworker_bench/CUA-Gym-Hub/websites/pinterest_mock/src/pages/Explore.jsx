import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import MasonryGrid from '../components/MasonryGrid';
import PinModal from '../components/PinModal';
import { useNavigate } from 'react-router-dom';
import { Home, Utensils, Globe2, Shirt, Scissors, Palette, Heart, Dumbbell, TrendingUp, Sparkles } from 'lucide-react';

const categoryIcons = {
  'Home Decor': Home,
  'Food & Drink': Utensils,
  'Travel': Globe2,
  'Fashion': Shirt,
  'DIY & Crafts': Scissors,
  'Art': Palette,
  'Weddings': Heart,
  'Health & Fitness': Dumbbell,
};

const categoryColors = {
  'Home Decor': '#E60023',
  'Food & Drink': '#FF6900',
  'Travel': '#0074E8',
  'Fashion': '#8E44AD',
  'DIY & Crafts': '#27AE60',
  'Art': '#E91E63',
  'Weddings': '#F06292',
  'Health & Fitness': '#00BCD4',
};

// Category cover images using picsum with seeds
const categoryCoverImages = {
  'Home Decor': 'https://picsum.photos/seed/homedecor/600/400',
  'Food & Drink': 'https://picsum.photos/seed/fooddrink/600/400',
  'Travel': 'https://picsum.photos/seed/travel/600/400',
  'Fashion': 'https://picsum.photos/seed/fashion/600/400',
  'DIY & Crafts': 'https://picsum.photos/seed/diy/600/400',
  'Art': 'https://picsum.photos/seed/artwork/600/400',
  'Weddings': 'https://picsum.photos/seed/wedding/600/400',
  'Health & Fitness': 'https://picsum.photos/seed/fitness/600/400',
};

const Explore = () => {
  const { state, setSearchQuery } = useStore();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const categories = state.exploreCategories || [
    { id: 'cat1', name: 'Home Decor', tag: 'interior' },
    { id: 'cat2', name: 'Food & Drink', tag: 'food' },
    { id: 'cat3', name: 'Travel', tag: 'travel' },
    { id: 'cat4', name: 'Fashion', tag: 'fashion' },
    { id: 'cat5', name: 'DIY & Crafts', tag: 'diy' },
    { id: 'cat6', name: 'Art', tag: 'art' },
    { id: 'cat7', name: 'Weddings', tag: 'wedding' },
    { id: 'cat8', name: 'Health & Fitness', tag: 'fitness' },
  ];

  const trendingTopics = [
    { label: 'Scandinavian Design', tag: 'interior' },
    { label: 'Meal Prep Ideas', tag: 'food' },
    { label: 'Japan Travel Guide', tag: 'travel' },
    { label: 'Fall Fashion 2025', tag: 'fashion' },
    { label: 'Easy DIY Gifts', tag: 'diy' },
    { label: 'Watercolor Tutorial', tag: 'art' },
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
  };

  const handleTrendingClick = (topic) => {
    setSearchQuery(topic.label);
    navigate('/search');
  };

  // Filter pins by selected category
  const categoryPins = selectedCategory
    ? state.pins.filter(p => (p.tags || []).some(t => t.toLowerCase() === selectedCategory.tag.toLowerCase()))
    : [];

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      {!selectedCategory ? (
        <>
          {/* Trending section */}
          <div className="max-w-[1400px] mx-auto px-4 pt-8 pb-4">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-xinterest-red" />
              <h2 className="text-2xl font-bold">Trending now</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {trendingTopics.map((topic, i) => {
                const topicPins = state.pins.filter(p => (p.tags || []).some(t => t.toLowerCase() === topic.tag.toLowerCase()));
                const coverPin = topicPins[i % topicPins.length];
                return (
                  <button
                    key={i}
                    className="relative rounded-2xl overflow-hidden h-[120px] group"
                    onClick={() => handleTrendingClick(topic)}
                  >
                    {coverPin && (
                      <img src={coverPin.image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{topic.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories grid */}
          <div className="max-w-[1400px] mx-auto px-4 pb-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={20} className="text-xinterest-red" />
              <h2 className="text-2xl font-bold">Browse by category</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => {
                const IconComp = categoryIcons[cat.name] || Home;
                const color = categoryColors[cat.name] || '#E60023';
                const coverImg = categoryCoverImages[cat.name];
                const catPins = state.pins.filter(p => (p.tags || []).some(t => t.toLowerCase() === cat.tag.toLowerCase()));

                return (
                  <button
                    key={cat.id}
                    className="relative rounded-2xl overflow-hidden h-[180px] group cursor-pointer"
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {coverImg ? (
                      <img src={coverImg} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : catPins[0] ? (
                      <img src={catPins[0].image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="absolute inset-0" style={{ backgroundColor: color }} />
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <IconComp size={32} className="mb-2" />
                      <span className="font-bold text-lg">{cat.name}</span>
                      <span className="text-sm opacity-80">{catPins.length} Pins</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Pins section */}
          <div className="max-w-[1800px] mx-auto px-4 pb-8">
            <h2 className="text-2xl font-bold mb-6 px-2">Popular right now</h2>
            <MasonryGrid
              pins={state.pins.slice(0, 20).sort((a, b) => (b.saves || 0) - (a.saves || 0))}
              onPinClick={setSelectedPin}
              onPinDeleted={showToast}
            />
          </div>
        </>
      ) : (
        <>
          {/* Category detail view */}
          <div className="max-w-[1800px] mx-auto px-4 pt-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                className="px-4 py-2 bg-[#e5e5e0] hover:bg-[#d5d5d0] rounded-full font-semibold text-sm"
                onClick={() => setSelectedCategory(null)}
              >
                Back
              </button>
              <h1 className="text-3xl font-bold">{selectedCategory.name}</h1>
              <span className="text-gray-500">{categoryPins.length} Pins</span>
            </div>

            <MasonryGrid pins={categoryPins} onPinClick={setSelectedPin} onPinDeleted={showToast} />

            {categoryPins.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xl font-bold mb-2">No pins in this category yet</p>
                <p>Check back later for new content</p>
              </div>
            )}
          </div>
        </>
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

export default Explore;
