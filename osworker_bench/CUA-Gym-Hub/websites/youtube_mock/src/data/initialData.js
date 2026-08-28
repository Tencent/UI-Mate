
export const getDefaultData = () => {
  const categories = ['All', 'Gaming', 'Music', 'Live', 'News', 'Sports', 'Learning', 'Tech', 'Comedy', 'Cooking', 'Fitness', 'Travel', 'Movies', 'Fashion', 'DIY', 'Shorts'];

  const channels = [
    {
      channelId: 'channel-1',
      name: 'TechMaster Pro',
      handle: '@techmasterpro',
      avatar: 'https://picsum.photos/seed/ch1/100/100',
      banner: 'https://picsum.photos/seed/b1/1600/400',
      description: 'Your ultimate destination for tech reviews, tutorials, and the latest gadget news. We cover smartphones, laptops, smart home devices, and everything in between. New videos every Tuesday and Friday!',
      subscriberCount: 2500000,
      videoCount: 342,
      joinedDate: '2018-03-15',
      links: ['https://techmaster.com', 'https://twitter.com/techmaster'],
      videos: [],
      verified: true
    },
    {
      channelId: 'channel-2',
      name: 'GameZone',
      handle: '@gamezone',
      avatar: 'https://picsum.photos/seed/ch2/100/100',
      banner: 'https://picsum.photos/seed/b2/1600/400',
      description: 'Epic gaming content, walkthroughs, and live streams of the hottest games. From AAA titles to indie gems, we cover them all!',
      subscriberCount: 5800000,
      videoCount: 1234,
      joinedDate: '2016-07-22',
      links: ['https://gamezone.gg'],
      videos: [],
      verified: true
    },
    {
      channelId: 'channel-3',
      name: 'Tasty Kitchen',
      handle: '@tastykitchen',
      avatar: 'https://picsum.photos/seed/ch3/100/100',
      banner: 'https://picsum.photos/seed/b3/1600/400',
      description: 'Delicious recipes and cooking tips for food lovers everywhere. Quick meals, gourmet dishes, baking, and international cuisine.',
      subscriberCount: 3200000,
      videoCount: 567,
      joinedDate: '2017-01-10',
      links: ['https://tastykitchen.com'],
      videos: [],
      verified: true
    },
    {
      channelId: 'channel-4',
      name: 'FitLife Daily',
      handle: '@fitlifedaily',
      avatar: 'https://picsum.photos/seed/ch4/100/100',
      banner: 'https://picsum.photos/seed/b4/1600/400',
      description: 'Transform your body and mind with our daily fitness routines and wellness tips. Workouts for all levels!',
      subscriberCount: 1800000,
      videoCount: 423,
      joinedDate: '2019-05-03',
      links: ['https://fitlifedaily.com'],
      videos: [],
      verified: false
    },
    {
      channelId: 'channel-5',
      name: 'Melody Hub',
      handle: '@melodyhub',
      avatar: 'https://picsum.photos/seed/ch5/100/100',
      banner: 'https://picsum.photos/seed/b5/1600/400',
      description: 'The best music covers, originals, and music production tutorials. From classical to EDM, we cover every genre.',
      subscriberCount: 8300000,
      videoCount: 891,
      joinedDate: '2015-11-18',
      links: ['https://melodyhub.music'],
      videos: [],
      verified: true
    },
    {
      channelId: 'channel-6',
      name: 'Learn Academy',
      handle: '@learnacademy',
      avatar: 'https://picsum.photos/seed/ch6/100/100',
      banner: 'https://picsum.photos/seed/b6/1600/400',
      description: 'Educational content covering science, math, history, and more. Making learning fun and accessible!',
      subscriberCount: 4100000,
      videoCount: 678,
      joinedDate: '2017-09-12',
      links: ['https://learnacademy.edu'],
      videos: [],
      verified: true
    },
    {
      channelId: 'channel-7',
      name: 'Wanderlust Adventures',
      handle: '@wanderlustadventures',
      avatar: 'https://picsum.photos/seed/ch7/100/100',
      banner: 'https://picsum.photos/seed/b7/1600/400',
      description: 'Travel vlogs from around the world. Join us on our adventures exploring hidden gems and iconic destinations!',
      subscriberCount: 2900000,
      videoCount: 234,
      joinedDate: '2018-06-20',
      links: ['https://wanderlust.travel'],
      videos: [],
      verified: false
    },
    {
      channelId: 'channel-8',
      name: 'Laugh Factory',
      handle: '@laughfactory',
      avatar: 'https://picsum.photos/seed/ch8/100/100',
      banner: 'https://picsum.photos/seed/b8/1600/400',
      description: 'Comedy sketches, stand-up, and funny moments that will make you LOL. New content every week!',
      subscriberCount: 6500000,
      videoCount: 456,
      joinedDate: '2016-02-28',
      links: ['https://laughfactory.com'],
      videos: [],
      verified: true
    },
    {
      channelId: 'channel-9',
      name: 'DIY Crafts',
      handle: '@diycrafts',
      avatar: 'https://picsum.photos/seed/ch9/100/100',
      banner: 'https://picsum.photos/seed/b9/1600/400',
      description: 'Creative DIY projects and crafts for all skill levels. Home decor, gifts, and upcycling ideas.',
      subscriberCount: 1500000,
      videoCount: 389,
      joinedDate: '2019-08-14',
      links: [],
      videos: [],
      verified: false
    },
    {
      channelId: 'channel-10',
      name: 'News Today',
      handle: '@newstoday',
      avatar: 'https://picsum.photos/seed/ch10/100/100',
      banner: 'https://picsum.photos/seed/b10/1600/400',
      description: 'Breaking news and in-depth analysis of current events from around the world.',
      subscriberCount: 7200000,
      videoCount: 2341,
      joinedDate: '2014-01-05',
      links: ['https://newstoday.com'],
      videos: [],
      verified: true
    },
    {
      channelId: 'channel-11',
      name: 'Auto Reviews',
      handle: '@autoreviews',
      avatar: 'https://picsum.photos/seed/ch11/100/100',
      banner: 'https://picsum.photos/seed/b11/1600/400',
      description: 'Comprehensive car reviews and automotive news. Test drives, comparisons, and buyer guides.',
      subscriberCount: 3400000,
      videoCount: 512,
      joinedDate: '2017-04-19',
      links: ['https://autoreviews.com'],
      videos: [],
      verified: true
    },
    {
      channelId: 'channel-12',
      name: 'Pet Paradise',
      handle: '@petparadise',
      avatar: 'https://picsum.photos/seed/ch12/100/100',
      banner: 'https://picsum.photos/seed/b12/1600/400',
      description: 'Cute pets, animal care tips, and heartwarming pet stories. Dogs, cats, and everything adorable!',
      subscriberCount: 4800000,
      videoCount: 723,
      joinedDate: '2016-10-07',
      links: [],
      videos: [],
      verified: true
    },
    {
      channelId: 'channel-13',
      name: 'Science Explained',
      handle: '@scienceexplained',
      avatar: 'https://picsum.photos/seed/ch13/100/100',
      banner: 'https://picsum.photos/seed/b13/1600/400',
      description: 'Making complex science simple and accessible to everyone. Physics, chemistry, biology, and space.',
      subscriberCount: 2100000,
      videoCount: 445,
      joinedDate: '2018-12-03',
      links: ['https://scienceexplained.org'],
      videos: [],
      verified: false
    },
    {
      channelId: 'channel-14',
      name: 'Fashion Forward',
      handle: '@fashionforward',
      avatar: 'https://picsum.photos/seed/ch14/100/100',
      banner: 'https://picsum.photos/seed/b14/1600/400',
      description: 'Latest fashion trends, style tips, and outfit inspiration for every season.',
      subscriberCount: 3900000,
      videoCount: 634,
      joinedDate: '2017-07-25',
      links: ['https://fashionforward.style'],
      videos: [],
      verified: false
    },
    {
      channelId: 'channel-15',
      name: 'Movie Reviews',
      handle: '@moviereviews',
      avatar: 'https://picsum.photos/seed/ch15/100/100',
      banner: 'https://picsum.photos/seed/b15/1600/400',
      description: 'Honest movie reviews and film analysis. Spoiler-free reviews for new releases!',
      subscriberCount: 2700000,
      videoCount: 891,
      joinedDate: '2015-09-30',
      links: ['https://moviereviews.com'],
      videos: [],
      verified: true
    },
    {
      channelId: 'user-1',
      name: 'Alex Thompson',
      handle: '@alexthompson',
      avatar: 'https://picsum.photos/seed/user1/100/100',
      banner: 'https://picsum.photos/seed/buser1/1600/400',
      description: 'Welcome to my channel! I share tech reviews, coding tutorials, and daily vlogs. Subscribe for weekly uploads!',
      subscriberCount: 12400,
      videoCount: 8,
      joinedDate: '2020-06-15',
      links: ['https://alexthompson.dev', 'https://twitter.com/alexthompson'],
      videos: [],
      verified: false
    }
  ];

  const videoTemplates = [
    { title: 'Ultimate Gaming Setup Tour 2024', category: 'Gaming', duration: '12:45', channelId: 'channel-2', views: 2500000 },
    { title: 'iPhone 15 Pro Max Review - Worth the Upgrade?', category: 'Tech', duration: '15:23', channelId: 'channel-1', views: 5200000 },
    { title: '30 Minute Full Body Workout - No Equipment', category: 'Fitness', duration: '30:12', channelId: 'channel-4', views: 1800000 },
    { title: 'Best Chocolate Cake Recipe Ever!', category: 'Cooking', duration: '8:34', channelId: 'channel-3', views: 3400000 },
    { title: 'Top 10 Travel Destinations 2024', category: 'Travel', duration: '18:56', channelId: 'channel-7', views: 980000 },
    { title: 'Learn Python in 60 Minutes', category: 'Learning', duration: '1:02:34', channelId: 'channel-6', views: 4500000 },
    { title: 'New Music Video - Summer Vibes', category: 'Music', duration: '3:45', channelId: 'channel-5', views: 12000000 },
    { title: 'Stand Up Comedy Special', category: 'Comedy', duration: '45:23', channelId: 'channel-8', views: 7800000 },
    { title: 'Breaking News: Tech Conference Highlights', category: 'News', duration: '22:11', channelId: 'channel-10', views: 3200000 },
    { title: 'DIY Home Decor Ideas', category: 'DIY', duration: '14:28', channelId: 'channel-9', views: 890000 },
    { title: 'Tesla Model 3 Long Term Review', category: 'Tech', duration: '19:45', channelId: 'channel-11', views: 2100000 },
    { title: 'Cute Puppies Compilation', category: 'Comedy', duration: '10:23', channelId: 'channel-12', views: 15000000 },
    { title: 'How Black Holes Work', category: 'Learning', duration: '16:34', channelId: 'channel-13', views: 5600000 },
    { title: 'Spring Fashion Trends 2024', category: 'Fashion', duration: '11:56', channelId: 'channel-14', views: 1200000 },
    { title: 'Movie Review: Latest Blockbuster', category: 'Movies', duration: '13:42', channelId: 'channel-15', views: 2800000 },
    { title: 'Epic Gaming Moments Compilation', category: 'Gaming', duration: '20:15', channelId: 'channel-2', views: 8900000 },
    { title: 'Best Budget Smartphones 2024', category: 'Tech', duration: '17:28', channelId: 'channel-1', views: 3100000 },
    { title: 'Yoga for Beginners', category: 'Fitness', duration: '25:00', channelId: 'channel-4', views: 2200000 },
    { title: '5 Minute Breakfast Ideas', category: 'Cooking', duration: '6:12', channelId: 'channel-3', views: 4500000 },
    { title: 'Exploring Tokyo Japan', category: 'Travel', duration: '28:34', channelId: 'channel-7', views: 1500000 },
    { title: 'Mathematics Made Easy', category: 'Learning', duration: '32:45', channelId: 'channel-6', views: 3800000 },
    { title: 'Guitar Tutorial - Beginner Songs', category: 'Music', duration: '15:20', channelId: 'channel-5', views: 2700000 },
    { title: 'Funny Pranks Compilation 2024', category: 'Comedy', duration: '18:45', channelId: 'channel-8', views: 9200000 },
    { title: 'World News Update', category: 'News', duration: '12:30', channelId: 'channel-10', views: 1800000 },
    { title: 'Easy Paper Crafts', category: 'DIY', duration: '9:15', channelId: 'channel-9', views: 670000 },
    { title: 'Electric Cars Comparison 2024', category: 'Tech', duration: '24:18', channelId: 'channel-11', views: 1900000 },
    { title: 'Cats Being Funny', category: 'Comedy', duration: '8:52', channelId: 'channel-12', views: 18000000 },
    { title: 'The Universe Explained', category: 'Learning', duration: '42:15', channelId: 'channel-13', views: 6200000 },
    { title: 'Summer Outfit Ideas', category: 'Fashion', duration: '10:34', channelId: 'channel-14', views: 980000 },
    { title: 'Top 10 Movies of 2024', category: 'Movies', duration: '16:22', channelId: 'channel-15', views: 2400000 },
    { title: 'Gaming PC Build Guide', category: 'Gaming', duration: '35:12', channelId: 'channel-2', views: 4100000 },
    { title: 'MacBook Pro M3 Review', category: 'Tech', duration: '21:45', channelId: 'channel-1', views: 3900000 },
    { title: 'HIIT Workout for Fat Loss', category: 'Fitness', duration: '20:00', channelId: 'channel-4', views: 1600000 },
    { title: 'Italian Pasta Masterclass', category: 'Cooking', duration: '25:30', channelId: 'channel-3', views: 2800000 },
    { title: 'Backpacking Through Europe', category: 'Travel', duration: '32:18', channelId: 'channel-7', views: 1100000 },
    { title: 'Web Development Crash Course', category: 'Learning', duration: '1:15:22', channelId: 'channel-6', views: 5800000 },
    { title: 'Piano Basics Tutorial', category: 'Music', duration: '18:40', channelId: 'channel-5', views: 2100000 },
    { title: 'Best Comedy Sketches 2024', category: 'Comedy', duration: '28:15', channelId: 'channel-8', views: 6700000 },
    { title: 'Climate Change Report', category: 'News', duration: '19:45', channelId: 'channel-10', views: 2200000 },
    { title: 'Origami for Beginners', category: 'DIY', duration: '12:20', channelId: 'channel-9', views: 540000 },
    { title: 'SUV Comparison 2024', category: 'Tech', duration: '26:35', channelId: 'channel-11', views: 1700000 },
    { title: 'Dogs Playing in Snow', category: 'Comedy', duration: '7:18', channelId: 'channel-12', views: 11000000 },
    { title: 'Quantum Physics Simplified', category: 'Learning', duration: '38:50', channelId: 'channel-13', views: 4800000 },
    { title: 'Winter Fashion Guide', category: 'Fashion', duration: '13:25', channelId: 'channel-14', views: 1100000 },
    { title: 'Oscar Predictions 2024', category: 'Movies', duration: '15:55', channelId: 'channel-15', views: 1900000 },
    { title: 'Best Indie Games 2024', category: 'Gaming', duration: '22:40', channelId: 'channel-2', views: 3400000 },
    { title: 'Smart Home Setup Guide', category: 'Tech', duration: '18:15', channelId: 'channel-1', views: 2600000 },
    { title: 'Morning Stretching Routine', category: 'Fitness', duration: '15:30', channelId: 'channel-4', views: 1900000 },
    { title: 'Baking Bread at Home', category: 'Cooking', duration: '16:45', channelId: 'channel-3', views: 3200000 },
    { title: 'Hidden Gems in Asia', category: 'Travel', duration: '24:20', channelId: 'channel-7', views: 890000 },
    { title: 'My Desk Setup Tour 2024', category: 'Tech', duration: '14:32', channelId: 'user-1', views: 45000 },
    { title: 'How I Learned to Code in 6 Months', category: 'Learning', duration: '22:18', channelId: 'user-1', views: 128000 },
    { title: 'Day in the Life of a Software Engineer', category: 'Tech', duration: '18:05', channelId: 'user-1', views: 67000 },
    { title: 'Top 5 VS Code Extensions You Need', category: 'Tech', duration: '9:47', channelId: 'user-1', views: 92000 }
  ];

  const videos = videoTemplates.map((template, index) => {
    const channel = channels.find(c => c.channelId === template.channelId);
    const daysAgo = Math.floor(Math.random() * 365);
    const uploadDate = new Date();
    uploadDate.setDate(uploadDate.getDate() - daysAgo);

    return {
      videoId: `video-${index + 1}`,
      title: template.title,
      description: `This is an amazing video about ${template.title.toLowerCase()}. Watch till the end for exclusive content!\n\nSubscribe for more content like this!\n\nTimestamps:\n0:00 - Intro\n1:30 - Main content\n${template.duration} - Outro\n\n#${template.category} #trending #2024`,
      channelId: template.channelId,
      channelName: channel.name,
      channelAvatar: channel.avatar,
      thumbnail: `https://picsum.photos/seed/vid${index + 1}/640/360`,
      duration: template.duration,
      uploadDate: uploadDate.toISOString(),
      viewCount: template.views,
      likeCount: Math.floor(template.views * 0.05),
      dislikeCount: Math.floor(template.views * 0.001),
      category: template.category,
      tags: [template.category, 'trending', '2024'],
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    };
  });

  // Shorts data
  const shortsTemplates = [
    { title: 'This hack will blow your mind', channelId: 'channel-1', views: 5400000, likes: 320000 },
    { title: 'Wait for the ending...', channelId: 'channel-8', views: 12000000, likes: 890000 },
    { title: 'POV: First day at the gym', channelId: 'channel-4', views: 3200000, likes: 210000 },
    { title: 'How to make ramen in 30 seconds', channelId: 'channel-3', views: 8700000, likes: 560000 },
    { title: 'This dog is too smart', channelId: 'channel-12', views: 22000000, likes: 1800000 },
    { title: 'Life hack you never knew', channelId: 'channel-9', views: 6100000, likes: 420000 },
    { title: 'Guitar riff that goes HARD', channelId: 'channel-5', views: 4500000, likes: 310000 },
    { title: 'One minute science experiment', channelId: 'channel-13', views: 7800000, likes: 490000 },
    { title: 'Fashion transformation', channelId: 'channel-14', views: 9200000, likes: 670000 },
    { title: 'Gaming clip of the year', channelId: 'channel-2', views: 15000000, likes: 1200000 },
    { title: 'Cooking disaster turned masterpiece', channelId: 'channel-3', views: 4100000, likes: 280000 },
    { title: 'Travel tip nobody tells you', channelId: 'channel-7', views: 3800000, likes: 250000 },
    { title: 'This car feature is insane', channelId: 'channel-11', views: 6500000, likes: 430000 },
    { title: 'Cat vs cucumber (again)', channelId: 'channel-12', views: 19000000, likes: 1500000 },
    { title: 'Movie scene recreation', channelId: 'channel-15', views: 5700000, likes: 370000 },
    { title: 'Workout you can do anywhere', channelId: 'channel-4', views: 2900000, likes: 190000 },
    { title: 'Mind-blowing math trick', channelId: 'channel-6', views: 8400000, likes: 530000 },
    { title: 'Breaking news in 60 seconds', channelId: 'channel-10', views: 11000000, likes: 720000 },
    { title: 'DIY that actually works', channelId: 'channel-9', views: 4700000, likes: 310000 },
    { title: 'Stand-up comedy gold', channelId: 'channel-8', views: 16000000, likes: 1100000 },
  ];

  const shorts = shortsTemplates.map((template, index) => {
    const channel = channels.find(c => c.channelId === template.channelId);
    const daysAgo = Math.floor(Math.random() * 30);
    const uploadDate = new Date();
    uploadDate.setDate(uploadDate.getDate() - daysAgo);

    return {
      shortId: `short-${index + 1}`,
      title: template.title,
      channelId: template.channelId,
      channelName: channel.name,
      channelAvatar: channel.avatar,
      thumbnail: `https://picsum.photos/seed/short${index + 1}/405/720`,
      viewCount: template.views,
      likeCount: template.likes,
      dislikeCount: Math.floor(template.likes * 0.02),
      commentCount: Math.floor(template.likes * 0.05),
      uploadDate: uploadDate.toISOString(),
      isShort: true
    };
  });

  const user = {
    userId: 'user-1',
    displayName: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    handle: '@alexthompson',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    subscribedChannels: ['channel-1', 'channel-2', 'channel-3', 'channel-4', 'channel-5', 'channel-6', 'channel-7', 'channel-8', 'channel-10', 'channel-11', 'channel-12', 'channel-13'],
    watchHistory: [
      { videoId: 'video-1', watchedAt: new Date(Date.now() - 3600000).toISOString() },
      { videoId: 'video-5', watchedAt: new Date(Date.now() - 7200000).toISOString() },
      { videoId: 'video-12', watchedAt: new Date(Date.now() - 86400000).toISOString() },
      { videoId: 'video-8', watchedAt: new Date(Date.now() - 172800000).toISOString() },
      { videoId: 'video-15', watchedAt: new Date(Date.now() - 259200000).toISOString() },
      { videoId: 'video-3', watchedAt: new Date(Date.now() - 345600000).toISOString() },
      { videoId: 'video-20', watchedAt: new Date(Date.now() - 432000000).toISOString() },
      { videoId: 'video-7', watchedAt: new Date(Date.now() - 518400000).toISOString() },
      { videoId: 'video-25', watchedAt: new Date(Date.now() - 604800000).toISOString() },
      { videoId: 'video-11', watchedAt: new Date(Date.now() - 691200000).toISOString() },
      { videoId: 'video-32', watchedAt: new Date(Date.now() - 777600000).toISOString() },
      { videoId: 'video-44', watchedAt: new Date(Date.now() - 864000000).toISOString() }
    ],
    likedVideos: ['video-2', 'video-7', 'video-12', 'video-16', 'video-22', 'video-28', 'video-35'],
    dislikedVideos: [],
    watchLater: ['video-4', 'video-9', 'video-14', 'video-19', 'video-24', 'video-30', 'video-38'],
    playlists: ['playlist-1', 'playlist-2', 'playlist-3', 'playlist-4', 'playlist-5'],
    searchHistory: ['react tutorial', 'gaming setup', 'cooking recipe']
  };

  const playlists = [
    {
      playlistId: 'playlist-1',
      name: 'Favorite Tech Videos',
      description: 'My collection of the best tech reviews and tutorials',
      creatorId: 'user-1',
      videoIds: ['video-2', 'video-17', 'video-32', 'video-47'],
      privacy: 'Public',
      createdDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      thumbnail: 'https://picsum.photos/seed/pl1/640/360'
    },
    {
      playlistId: 'playlist-2',
      name: 'Workout Routines',
      description: 'Daily fitness videos to stay in shape',
      creatorId: 'user-1',
      videoIds: ['video-3', 'video-18', 'video-33', 'video-48'],
      privacy: 'Private',
      createdDate: new Date(Date.now() - 60 * 86400000).toISOString(),
      thumbnail: 'https://picsum.photos/seed/pl2/640/360'
    },
    {
      playlistId: 'playlist-3',
      name: 'Cooking Inspiration',
      description: 'Recipes I want to try',
      creatorId: 'user-1',
      videoIds: ['video-4', 'video-19', 'video-34', 'video-49'],
      privacy: 'Unlisted',
      createdDate: new Date(Date.now() - 45 * 86400000).toISOString(),
      thumbnail: 'https://picsum.photos/seed/pl3/640/360'
    },
    {
      playlistId: 'playlist-4',
      name: 'Learning Programming',
      description: 'Educational content for coding',
      creatorId: 'user-1',
      videoIds: ['video-6', 'video-21', 'video-36'],
      privacy: 'Public',
      createdDate: new Date(Date.now() - 90 * 86400000).toISOString(),
      thumbnail: 'https://picsum.photos/seed/pl4/640/360'
    },
    {
      playlistId: 'playlist-5',
      name: 'Funny Videos',
      description: 'Videos that make me laugh',
      creatorId: 'user-1',
      videoIds: ['video-8', 'video-12', 'video-23', 'video-38', 'video-42'],
      privacy: 'Public',
      createdDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      thumbnail: 'https://picsum.photos/seed/pl5/640/360'
    }
  ];

  // Generate 100+ comments across many videos
  const commentUsers = [
    { userId: 'user-2', userName: 'Sarah Johnson', userAvatar: 'https://picsum.photos/seed/u2/32/32' },
    { userId: 'user-3', userName: 'Mike Chen', userAvatar: 'https://picsum.photos/seed/u3/32/32' },
    { userId: 'user-4', userName: 'Emma Wilson', userAvatar: 'https://picsum.photos/seed/u4/32/32' },
    { userId: 'user-5', userName: 'David Brown', userAvatar: 'https://picsum.photos/seed/u5/32/32' },
    { userId: 'user-6', userName: 'Jessica Lee', userAvatar: 'https://picsum.photos/seed/u6/32/32' },
    { userId: 'user-7', userName: 'Ryan Garcia', userAvatar: 'https://picsum.photos/seed/u7/32/32' },
    { userId: 'user-8', userName: 'Sophia Martinez', userAvatar: 'https://picsum.photos/seed/u8/32/32' },
    { userId: 'user-9', userName: 'James Taylor', userAvatar: 'https://picsum.photos/seed/u9/32/32' },
    { userId: 'user-10', userName: 'Olivia Anderson', userAvatar: 'https://picsum.photos/seed/u10/32/32' },
    { userId: 'user-11', userName: 'Daniel Thomas', userAvatar: 'https://picsum.photos/seed/u11/32/32' },
    { userId: 'user-12', userName: 'Isabella Jackson', userAvatar: 'https://picsum.photos/seed/u12/32/32' },
    { userId: 'user-13', userName: 'William White', userAvatar: 'https://picsum.photos/seed/u13/32/32' },
    { userId: 'user-14', userName: 'Mia Harris', userAvatar: 'https://picsum.photos/seed/u14/32/32' },
    { userId: 'user-15', userName: 'Alexander Clark', userAvatar: 'https://picsum.photos/seed/u15/32/32' },
  ];

  const commentTexts = [
    'This is amazing! Thanks for sharing!',
    'Great content! Keep it up!',
    'Very informative and well explained!',
    'I learned so much from this video.',
    'Been waiting for this!',
    'Absolutely love this content.',
    'This deserves more views honestly.',
    'Best video on this topic I have seen.',
    'Came back to watch this again. Still great!',
    'The production quality is incredible.',
    'Subscribed immediately after watching this.',
    'Can you make a part 2?',
    'This changed my perspective completely.',
    'Watching this at 2am and no regrets.',
    'Why does this not have more likes?',
    'The editing in this video is top notch.',
    'I showed this to my friend and they loved it.',
    'Exactly what I was looking for!',
    'You explain things so clearly.',
    'This is underrated content right here.',
    'Just discovered this channel. Where have you been all my life?',
    'The intro got me hooked immediately.',
    'I have been following your channel for years. Never disappointed.',
    'Quality over quantity, love it.',
    'This should be in my recommended more often.',
    'Wow, I did not expect that twist!',
    'Take my like and subscribe!',
    'Every video just keeps getting better.',
    'Thanks for always being so genuine.',
    'This is the content I come to XouTube for.',
  ];

  const replyTexts = [
    'Glad you enjoyed it!',
    'Thanks for the kind words!',
    'The next walkthrough is already on the channel.',
    'Appreciate the support!',
    'Totally agree with you.',
    'Thanks for watching!',
    'That means a lot, thank you.',
    'Part 2 is in the works!',
    'So glad it was helpful!',
    'Welcome to the channel!',
  ];

  const comments = {};
  // Generate comments for all videos (3-8 comments each)
  for (let v = 1; v <= 54; v++) {
    const videoId = `video-${v}`;
    const numComments = 3 + Math.floor(Math.random() * 6);
    const videoComments = [];

    for (let c = 0; c < numComments; c++) {
      const commenter = commentUsers[Math.floor(Math.random() * commentUsers.length)];
      const hoursAgo = Math.floor(Math.random() * 720) + 1;
      const likes = Math.floor(Math.random() * 500);

      const replies = [];
      // 40% chance of having 1-3 replies
      if (Math.random() < 0.4) {
        const numReplies = 1 + Math.floor(Math.random() * 3);
        for (let r = 0; r < numReplies; r++) {
          const replier = Math.random() < 0.3
            ? { userId: 'user-1', userName: 'Alex Thompson', userAvatar: 'https://picsum.photos/seed/user1/32/32' }
            : commentUsers[Math.floor(Math.random() * commentUsers.length)];
          replies.push({
            commentId: `comment-${videoId}-${c + 1}-reply-${r + 1}`,
            videoId,
            userId: replier.userId,
            userName: replier.userName,
            userAvatar: replier.userAvatar,
            text: replyTexts[Math.floor(Math.random() * replyTexts.length)],
            timestamp: new Date(Date.now() - (hoursAgo - 1) * 3600000).toISOString(),
            likeCount: Math.floor(Math.random() * 50),
            dislikeCount: 0,
            likedBy: [],
            replies: [],
            isPinned: false
          });
        }
      }

      videoComments.push({
        commentId: `comment-${videoId}-${c + 1}`,
        videoId,
        userId: commenter.userId,
        userName: commenter.userName,
        userAvatar: commenter.userAvatar,
        text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        timestamp: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
        likeCount: likes,
        dislikeCount: Math.floor(Math.random() * 5),
        likedBy: [],
        replies,
        isPinned: c === 0 && Math.random() < 0.2
      });
    }

    comments[videoId] = videoComments;
  }

  const notifications = [
    {
      notificationId: 'notif-1',
      type: 'new_video',
      channelId: 'channel-2',
      channelName: 'GameZone',
      channelAvatar: 'https://picsum.photos/seed/nch2/36/36',
      videoId: 'video-1',
      videoTitle: 'Ultimate Gaming Setup Tour 2024',
      videoThumbnail: 'https://picsum.photos/seed/nvid1/120/68',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: false
    },
    {
      notificationId: 'notif-2',
      type: 'new_video',
      channelId: 'channel-5',
      channelName: 'Melody Hub',
      channelAvatar: 'https://picsum.photos/seed/nch5/36/36',
      videoId: 'video-7',
      videoTitle: 'New Music Video - Summer Vibes',
      videoThumbnail: 'https://picsum.photos/seed/nvid7/120/68',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: false
    },
    {
      notificationId: 'notif-3',
      type: 'new_video',
      channelId: 'channel-1',
      channelName: 'TechMaster Pro',
      channelAvatar: 'https://picsum.photos/seed/nch1/36/36',
      videoId: 'video-2',
      videoTitle: 'iPhone 15 Pro Max Review',
      videoThumbnail: 'https://picsum.photos/seed/nvid2/120/68',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      isRead: true
    },
    {
      notificationId: 'notif-4',
      type: 'new_video',
      channelId: 'channel-12',
      channelName: 'Pet Paradise',
      channelAvatar: 'https://picsum.photos/seed/nch12/36/36',
      videoId: 'video-12',
      videoTitle: 'Cute Puppies Compilation',
      videoThumbnail: 'https://picsum.photos/seed/nvid12/120/68',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      isRead: true
    },
    {
      notificationId: 'notif-5',
      type: 'new_video',
      channelId: 'channel-8',
      channelName: 'Laugh Factory',
      channelAvatar: 'https://picsum.photos/seed/nch8/36/36',
      videoId: 'video-8',
      videoTitle: 'Stand Up Comedy Special',
      videoThumbnail: 'https://picsum.photos/seed/nvid8/120/68',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      isRead: false
    },
    {
      notificationId: 'notif-6',
      type: 'new_video',
      channelId: 'channel-6',
      channelName: 'Learn Academy',
      channelAvatar: 'https://picsum.photos/seed/nch6/36/36',
      videoId: 'video-6',
      videoTitle: 'Learn Python in 60 Minutes',
      videoThumbnail: 'https://picsum.photos/seed/nvid6/120/68',
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      isRead: true
    },
    {
      notificationId: 'notif-7',
      type: 'comment_reply',
      channelId: 'channel-1',
      channelName: 'TechMaster Pro',
      channelAvatar: 'https://picsum.photos/seed/nch1b/36/36',
      videoId: 'video-2',
      videoTitle: 'iPhone 15 Pro Max Review - Worth the Upgrade?',
      videoThumbnail: 'https://picsum.photos/seed/nvid2b/120/68',
      commenterName: 'Maya Chen',
      commentSnippet: 'Totally agree about the battery test.',
      timestamp: new Date(Date.now() - 4200000).toISOString(),
      isRead: false
    },
    {
      notificationId: 'notif-8',
      type: 'milestone',
      channelId: 'channel-5',
      channelName: 'Melody Hub',
      channelAvatar: 'https://picsum.photos/seed/nch5b/36/36',
      milestone: '8M subscribers',
      timestamp: new Date(Date.now() - 93600000).toISOString(),
      isRead: true
    }
  ];

  // Community posts
  const communityPosts = {
    'channel-1': [
      { postId: 'post-1', channelId: 'channel-1', text: 'What device should I review next? Drop your suggestions below!', timestamp: new Date(Date.now() - 86400000).toISOString(), likeCount: 1240, commentCount: 89 },
      { postId: 'post-2', channelId: 'channel-1', text: 'New video dropping tomorrow at 10 AM! iPhone 16 leak analysis.', timestamp: new Date(Date.now() - 172800000).toISOString(), likeCount: 890, commentCount: 45 },
    ],
    'channel-2': [
      { postId: 'post-3', channelId: 'channel-2', text: 'GTA VI release date confirmed! Full breakdown video coming this week.', timestamp: new Date(Date.now() - 43200000).toISOString(), likeCount: 5600, commentCount: 320 },
    ],
    'channel-5': [
      { postId: 'post-4', channelId: 'channel-5', text: 'Just finished recording a new cover! Can you guess the song?', timestamp: new Date(Date.now() - 129600000).toISOString(), likeCount: 2300, commentCount: 156 },
    ],
    'channel-8': [
      { postId: 'post-5', channelId: 'channel-8', text: 'LIVE show this Saturday at 8 PM EST! Set your reminders!', timestamp: new Date(Date.now() - 259200000).toISOString(), likeCount: 3400, commentCount: 201 },
    ],
  };

  const settings = {
    autoplay: true,
    captions: false,
    subtitlesLang: 'English',
    theme: 'dark',
    location: 'United States',
    language: 'English',
    notifSubscriptions: true,
    notifRecommended: true,
    notifActivity: true,
    notifReplies: true,
    keepWatchHistory: true,
    keepSearchHistory: true
  };

  return {
    user,
    videos,
    shorts,
    channels,
    comments,
    playlists,
    notifications,
    communityPosts,
    categories,
    settings
  };
};

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'youtubeData';
const BASE_INITIAL_KEY = 'youtubeInitialData';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) { console.log('No custom state available'); }
  return null;
};

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      const initialState = getInitialState(sid) || state;
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state, initialState }),
      }).catch(() => {});
    }, 300);
  }
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Array item normalizers ---

function normalizeVideo(video, index) {
  return {
    ...video,
    videoId: video.videoId || video.id || `video_custom_${index}`,
    title: video.title || video.name || 'Untitled Video',
    description: video.description || video.desc || '',
    channelId: video.channelId || video.channel || '',
    channelName: video.channelName || '',
    channelAvatar: video.channelAvatar || '',
    thumbnail: video.thumbnail || video.thumb || '',
    duration: video.duration || '0:00',
    uploadDate: video.uploadDate || video.createdAt || new Date().toISOString(),
    viewCount: typeof video.viewCount === 'number' ? video.viewCount : (typeof video.views === 'number' ? video.views : 0),
    likeCount: typeof video.likeCount === 'number' ? video.likeCount : 0,
    dislikeCount: typeof video.dislikeCount === 'number' ? video.dislikeCount : 0,
    category: video.category || 'All',
    tags: Array.isArray(video.tags) ? video.tags : [],
    videoUrl: video.videoUrl || video.url || '',
  };
}

function normalizePlaylist(playlist, index) {
  return {
    ...playlist,
    playlistId: playlist.playlistId || playlist.id || `playlist_custom_${index}`,
    name: playlist.name || playlist.title || 'Untitled Playlist',
    description: playlist.description || '',
    creatorId: playlist.creatorId || 'user-1',
    videoIds: Array.isArray(playlist.videoIds) ? playlist.videoIds : [],
    privacy: playlist.privacy || 'Public',
    createdDate: playlist.createdDate || new Date().toISOString(),
    thumbnail: playlist.thumbnail || '',
  };
}

function normalizeNotification(notif, index) {
  return {
    ...notif,
    notificationId: notif.notificationId || notif.id || `notif_custom_${index}`,
    type: notif.type || 'new_video',
    channelId: notif.channelId || '',
    channelName: notif.channelName || '',
    channelAvatar: notif.channelAvatar || '',
    videoId: notif.videoId || '',
    videoTitle: notif.videoTitle || '',
    videoThumbnail: notif.videoThumbnail || '',
    timestamp: notif.timestamp || notif.createdAt || new Date().toISOString(),
    isRead: typeof notif.isRead === 'boolean' ? notif.isRead : false,
  };
}

function normalizeChannel(channel, index) {
  return {
    ...channel,
    channelId: channel.channelId || channel.id || `channel_custom_${index}`,
    name: channel.name || 'Unknown Channel',
    handle: channel.handle || '',
    avatar: channel.avatar || '',
    banner: channel.banner || '',
    description: channel.description || '',
    subscriberCount: typeof channel.subscriberCount === 'number' ? channel.subscriberCount : 0,
    videoCount: typeof channel.videoCount === 'number' ? channel.videoCount : 0,
    joinedDate: channel.joinedDate || '',
    links: Array.isArray(channel.links) ? channel.links : [],
    videos: Array.isArray(channel.videos) ? channel.videos : [],
    verified: typeof channel.verified === 'boolean' ? channel.verified : false,
  };
}

const arrayNormalizers = {
  videos: normalizeVideo,
  playlists: normalizePlaylist,
  notifications: normalizeNotification,
  channels: normalizeChannel,
};

function deepMergeWithDefaults(defaults, incoming) {
  if (!incoming || typeof incoming !== 'object') return defaults;
  const result = { ...defaults, ...incoming };

  Object.keys(defaults).forEach(key => {
    const defaultValue = defaults[key];
    const incomingValue = incoming[key];

    if (Array.isArray(defaultValue)) {
      const value = Array.isArray(incomingValue) ? incomingValue : defaultValue;
      result[key] = arrayNormalizers[key]
        ? value.map((item, index) => arrayNormalizers[key](item || {}, index))
        : value;
      return;
    }

    if (
      defaultValue &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue) &&
      incomingValue &&
      typeof incomingValue === 'object' &&
      !Array.isArray(incomingValue)
    ) {
      result[key] = deepMergeWithDefaults(defaultValue, incomingValue);
    }
  });

  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = deepMergeWithDefaults(getDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
