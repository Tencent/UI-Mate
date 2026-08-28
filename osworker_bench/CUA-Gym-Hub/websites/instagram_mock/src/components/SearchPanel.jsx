import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { useData } from '../context/DataContext';

const SearchPanel = ({ onClose }) => {
  const { users, currentUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const allUsers = Object.values(users).filter(u => u.id !== currentUser.id);

  const results = searchTerm.trim()
    ? allUsers.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const hashtagResults = searchTerm.startsWith('#')
    ? [{ tag: searchTerm, count: Math.floor(Math.random() * 5000) + 100 }]
    : [];

  const handleUserClick = (user) => {
    // Add to recent
    setRecentSearches(prev => {
      const filtered = prev.filter(u => u.id !== user.id);
      return [user, ...filtered].slice(0, 5);
    });
    navigate(`/profile/${user.username}`);
    onClose();
  };

  const handleHashtagClick = (tag) => {
    navigate('/explore', { state: { search: tag } });
    onClose();
  };

  const clearRecent = () => setRecentSearches([]);

  return (
    <div className="fixed left-[72px] top-0 h-full w-[397px] bg-white border-r border-[#DBDBDB] z-30 shadow-xl rounded-r-2xl flex flex-col animate-slide-in">
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-2xl font-bold mb-8">Search</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <SearchIcon className="w-4 h-4 text-[#8E8E8E]" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#EFEFEF] rounded-lg py-2.5 pl-10 pr-10 text-sm outline-none placeholder-[#8E8E8E]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-3 flex items-center"
            >
              <div className="w-4 h-4 bg-[#C7C7C7] rounded-full flex items-center justify-center">
                <X className="w-2.5 h-2.5 text-white" />
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[#EFEFEF]" />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!searchTerm.trim() ? (
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-base">Recent</span>
              {recentSearches.length > 0 && (
                <button onClick={clearRecent} className="text-[#0095F6] font-semibold text-sm hover:text-[#00376B] transition-colors">
                  Clear all
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              recentSearches.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="flex items-center gap-3 py-2 hover:bg-[#FAFAFA] w-full -mx-2 px-2 rounded-lg transition-colors"
                >
                  <img src={user.avatar} alt={user.username} className="w-11 h-11 rounded-full object-cover" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm flex items-center gap-1">
                      {user.username}
                      {user.isVerified && (
                        <svg className="w-3 h-3 text-[#0095F6]" viewBox="0 0 40 40" fill="currentColor">
                          <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                        </svg>
                      )}
                    </div>
                    <div className="text-xs text-[#8E8E8E]">{user.name}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecentSearches(prev => prev.filter(u => u.id !== user.id));
                    }}
                    className="p-1 hover:opacity-50 transition-opacity"
                  >
                    <X className="w-4 h-4 text-[#8E8E8E]" />
                  </button>
                </button>
              ))
            ) : (
              <div className="text-center text-sm text-[#8E8E8E] py-8">
                No recent searches.
              </div>
            )}
          </div>
        ) : (
          <div className="py-2">
            {hashtagResults.map((h, i) => (
              <button
                key={i}
                onClick={() => handleHashtagClick(h.tag)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAFAFA] w-full transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[#EFEFEF] flex items-center justify-center text-lg font-semibold border border-[#DBDBDB]">
                  #
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{h.tag}</div>
                  <div className="text-xs text-[#8E8E8E]">{h.count.toLocaleString()} posts</div>
                </div>
              </button>
            ))}
            {results.map(user => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FAFAFA] w-full transition-colors"
              >
                <div className="relative">
                  <img src={user.avatar} alt={user.username} className="w-11 h-11 rounded-full object-cover" />
                  {user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#12B76A] rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm flex items-center gap-1">
                    {user.username}
                    {user.isVerified && (
                      <svg className="w-3 h-3 text-[#0095F6]" viewBox="0 0 40 40" fill="currentColor">
                        <path d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094zM18.37 27.04l-6.77-6.77 2.83-2.83 3.94 3.94 8.52-8.52 2.83 2.83L18.37 27.04z"/>
                      </svg>
                    )}
                  </div>
                  <div className="text-xs text-[#8E8E8E]">{user.name}</div>
                </div>
              </button>
            ))}
            {results.length === 0 && hashtagResults.length === 0 && (
              <div className="text-center text-sm text-[#8E8E8E] py-8">
                No results found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
