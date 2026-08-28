
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RichText = ({ text, className = '' }) => {
  const navigate = useNavigate();

  if (!text) return null;

  // Split text by spaces and newlines to find tags/mentions
  // This is a simple parser; for production, use a more robust regex-based tokenizer
  const parts = text.split(/(\s+)/);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('#')) {
          const tag = part.trim();
          // Remove # for search
          const searchTerm = tag.substring(1);
          return (
            <span 
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to explore with search state (mocking query param or state)
                // Since our Explore component uses local state for search, we can't easily pass it via URL without refactoring Explore.
                // For this mock, we'll just navigate to Explore. 
                // To fully support "Click hashtag shows posts", we'd ideally pass state.
                // Let's use React Router state.
                navigate('/explore', { state: { search: tag } });
              }}
              className="text-[#00376b] cursor-pointer hover:underline"
            >
              {part}
            </span>
          );
        } else if (part.startsWith('@')) {
          const username = part.trim().substring(1);
          // Simple check to remove punctuation if attached
          const cleanUsername = username.replace(/[^a-zA-Z0-9_.]/g, '');
          const suffix = username.slice(cleanUsername.length);
          
          return (
            <React.Fragment key={index}>
              <Link 
                to={`/profile/${cleanUsername}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[#00376b] cursor-pointer hover:underline"
              >
                @{cleanUsername}
              </Link>
              {suffix}
            </React.Fragment>
          );
        }
        return part;
      })}
    </span>
  );
};

export default RichText;
  