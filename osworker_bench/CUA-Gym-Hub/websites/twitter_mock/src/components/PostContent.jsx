import React from 'react';
import { useNavigate } from 'react-router-dom';

// Parses post content and renders hashtags, @mentions, and URLs as interactive links
export default function PostContent({ content }) {
  const navigate = useNavigate();

  if (!content) return null;

  // Combined regex for hashtags, @mentions, and URLs
  const regex = /(#\w+)|(@\w+)|(https?:\/\/[^\s]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      // Hashtag
      parts.push({ type: 'hashtag', value: match[1] });
    } else if (match[2]) {
      // @mention
      parts.push({ type: 'mention', value: match[2] });
    } else if (match[3]) {
      // URL
      parts.push({ type: 'url', value: match[3] });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  const handleHashtagClick = (e, hashtag) => {
    e.stopPropagation();
    navigate(`/explore?q=${encodeURIComponent(hashtag)}`);
  };

  const handleMentionClick = (e, mention) => {
    e.stopPropagation();
    const handle = mention.slice(1); // Remove @
    navigate(`/profile/${handle}`);
  };

  const handleUrlClick = (e) => {
    e.stopPropagation();
  };

  const truncateUrl = (url) => {
    try {
      const parsed = new URL(url);
      const display = parsed.hostname + parsed.pathname;
      return display.length > 30 ? display.slice(0, 30) + '...' : display;
    } catch {
      return url.length > 30 ? url.slice(0, 30) + '...' : url;
    }
  };

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'hashtag') {
          return (
            <span
              key={i}
              className="text-[#1DA1F2] hover:underline cursor-pointer"
              onClick={(e) => handleHashtagClick(e, part.value)}
            >
              {part.value}
            </span>
          );
        }
        if (part.type === 'mention') {
          return (
            <span
              key={i}
              className="text-[#1DA1F2] hover:underline cursor-pointer"
              onClick={(e) => handleMentionClick(e, part.value)}
            >
              {part.value}
            </span>
          );
        }
        if (part.type === 'url') {
          return (
            <a
              key={i}
              href={part.value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1DA1F2] hover:underline"
              onClick={handleUrlClick}
            >
              {truncateUrl(part.value)}
            </a>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </>
  );
}
