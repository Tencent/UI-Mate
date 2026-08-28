import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import StoryViewer from './StoryViewer';

const StoryTray = () => {
  const { stories, users, currentUser } = useData();
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);

  // Group stories by user
  const userStoriesMap = stories.reduce((acc, story) => {
    if (!acc[story.userId]) acc[story.userId] = [];
    acc[story.userId].push(story);
    return acc;
  }, {});

  // Create list of users with stories
  const storiesList = Object.keys(userStoriesMap).map(userId => ({
    user: users[userId],
    stories: userStoriesMap[userId]
  })).filter(item => item.user);

  // Sort: Current user first, then unviewed stories first, then viewed
  storiesList.sort((a, b) => {
    if (a.user.id === currentUser.id) return -1;
    if (b.user.id === currentUser.id) return 1;
    const aHasUnviewed = a.stories.some(s => !s.viewed);
    const bHasUnviewed = b.stories.some(s => !s.viewed);
    if (aHasUnviewed && !bHasUnviewed) return -1;
    if (!aHasUnviewed && bHasUnviewed) return 1;
    return 0;
  });

  const handleStoryClick = (index) => {
    setActiveStoryIndex(index);
  };

  const closeStoryViewer = () => {
    setActiveStoryIndex(null);
  };

  return (
    <div className="w-full bg-white border border-[#DBDBDB] rounded-lg py-4 mb-4 md:border-0 md:border-b md:rounded-none">
      <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar">
        {storiesList.map((item, index) => {
          const hasUnviewed = item.stories.some(s => !s.viewed);
          return (
            <div
              key={item.user.id}
              className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer"
              onClick={() => handleStoryClick(index)}
            >
              <div className={`p-[3px] rounded-full ${hasUnviewed ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-[#DBDBDB]'}`}>
                <div className="bg-white p-[2px] rounded-full">
                  <img
                    src={item.user.avatar}
                    alt={item.user.username}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs truncate w-full text-center text-[#262626]">
                {item.user.id === currentUser.id ? 'Your story' : item.user.username}
              </span>
            </div>
          );
        })}
      </div>

      {activeStoryIndex !== null && (
        <StoryViewer
          storiesList={storiesList}
          initialUserIndex={activeStoryIndex}
          onClose={closeStoryViewer}
        />
      )}
    </div>
  );
};

export default StoryTray;
