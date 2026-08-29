import React, { useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import MasonryGrid from '../components/MasonryGrid';
import PinModal from '../components/PinModal';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const { state, setSearchQuery } = useStore();
  const [selectedPin, setSelectedPin] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All Pins');
  const [activeTag, setActiveTag] = useState(null);
  const navigate = useNavigate();

  const filters = ['All Pins', 'Videos', 'Boards', 'Profiles'];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Filter pins based on search query
  const filteredPins = state.pins.filter(pin => {
    if (!state.searchQuery) return false;
    const q = state.searchQuery.toLowerCase();
    return pin.title.toLowerCase().includes(q) ||
           pin.description.toLowerCase().includes(q) ||
           (pin.tags || []).some(t => t.toLowerCase().includes(q));
  });

  // Apply tag filter
  const tagFilteredPins = activeTag
    ? filteredPins.filter(pin => (pin.tags || []).some(t => t.toLowerCase() === activeTag.toLowerCase()))
    : filteredPins;

  // Get unique tags from results for tag chips
  const resultTags = [...new Set(filteredPins.flatMap(pin => pin.tags || []))];

  // Search matching boards
  const matchingBoards = state.searchQuery
    ? state.boards.filter(b =>
        b.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        (b.description || '').toLowerCase().includes(state.searchQuery.toLowerCase())
      ).filter(b => b.privacy !== 'secret' && !b.archived)
    : [];

  // Search matching users
  const matchingUsers = state.searchQuery
    ? state.users.filter(u =>
        u.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        (u.bio || '').toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    : [];

  // Reset tag when search changes
  useEffect(() => {
    setActiveTag(null);
    setActiveFilter('All Pins');
  }, [state.searchQuery]);

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      {!state.searchQuery ? (
        <div className="text-center mt-20 text-gray-500 px-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#e5e5e0] flex items-center justify-center">
              <SearchIcon size={28} className="text-gray-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-700 mb-2">Search for inspiration</p>
          <p className="text-gray-400">Try searching for "home decor", "recipes", or "travel"</p>
        </div>
      ) : (
        <div className="max-w-[1800px] mx-auto">
          {/* Filter bar */}
          <div className="px-4 pt-4 pb-2 flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {/* Content type filters */}
            {filters.map(filter => (
              <button
                key={filter}
                className={`h-10 px-4 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
                  activeFilter === filter
                    ? 'bg-black text-white'
                    : 'bg-[#e5e5e0] text-black hover:bg-[#d5d5d0]'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}

            {/* Separator */}
            {resultTags.length > 0 && (
              <div className="w-px h-8 bg-gray-300 flex-shrink-0 mx-1" />
            )}

            {/* Tag chips */}
            {resultTags.map(tag => (
              <button
                key={tag}
                className={`h-10 px-4 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors capitalize ${
                  activeTag === tag
                    ? 'bg-black text-white'
                    : 'bg-[#e5e5e0] text-black hover:bg-[#d5d5d0]'
                }`}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Results */}
          {activeFilter === 'All Pins' && (
            <>
              {tagFilteredPins.length > 0 ? (
                <div className="pt-4">
                  <MasonryGrid pins={tagFilteredPins} onPinClick={setSelectedPin} onPinDeleted={showToast} />
                </div>
              ) : (
                <div className="text-center mt-16 text-gray-500 px-4">
                  <p className="text-xl font-bold text-gray-700 mb-2">
                    No results found for "{state.searchQuery}"
                  </p>
                  <p className="text-gray-400">Try a different search or explore trending topics</p>
                </div>
              )}
            </>
          )}

          {activeFilter === 'Boards' && (
            <div className="px-4 pt-4">
              {matchingBoards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {matchingBoards.map(board => {
                    const coverPin = state.pins.find(p => board.pins[0] === p.id);
                    const owner = state.users.find(u => u.id === board.userId);
                    return (
                      <a
                        key={board.id}
                        href={`/board/${board.id}`}
                        className="group cursor-pointer"
                        onClick={(e) => { e.preventDefault(); navigate(`/board/${board.id}`); }}
                      >
                        <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-2">
                          {coverPin ? (
                            <img src={coverPin.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full bg-[#e5e5e0]" />
                          )}
                        </div>
                        <h3 className="font-bold text-[15px] truncate">{board.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {owner && <img src={owner.avatar} alt="" className="w-5 h-5 rounded-full" />}
                          <span className="text-xs text-gray-500">{board.pins.length} Pins</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center mt-16 text-gray-500">
                  <p className="text-xl font-bold text-gray-700 mb-2">No boards found</p>
                </div>
              )}
            </div>
          )}

          {activeFilter === 'Profiles' && (
            <div className="px-4 pt-4 max-w-2xl mx-auto">
              {matchingUsers.length > 0 ? (
                <div className="space-y-2">
                  {matchingUsers.map(user => (
                    <a
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
                      onClick={(e) => { e.preventDefault(); navigate(`/profile/${user.id}`); }}
                    >
                      <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[15px]">{user.name}</p>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{user.followers.length} followers</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center mt-16 text-gray-500">
                  <p className="text-xl font-bold text-gray-700 mb-2">No profiles found</p>
                </div>
              )}
            </div>
          )}

          {activeFilter === 'Videos' && (
            <div className="text-center mt-16 text-gray-500 px-4">
              <p className="text-xl font-bold text-gray-700 mb-2">No video results</p>
              <p className="text-gray-400">Try searching for something else</p>
            </div>
          )}
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

export default Search;
