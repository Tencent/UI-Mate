const BASE_STORAGE_KEY = 'fb_mock_state';
const BASE_INITIAL_KEY = 'fb_mock_initialState';

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
      if (data.has_custom_state && data.stored_state) {
        return data.stored_state;
      }
    }
  } catch (e) {
    // State not available from server
  }
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

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = deepMergeWithDefaults(getDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  const data = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

const getDefaultData = () => ({
  currentUser: {
    id: 'user_1',
    name: 'Admin User',
    avatar: 'https://picsum.photos/100/100?random=user_1',
    cover: 'https://picsum.photos/1200/400?random=cover_1',
    bio: 'Software Engineer | Coffee Lover | Traveler',
    friends: ['user_2', 'user_3', 'user_4'],
    location: 'San Francisco, CA',
    workplace: 'Tech Corp',
    education: 'Stanford University',
    joinedDate: '2020-03-15',
    relationship: 'Single',
    online: true
  },
  users: {
    'user_1': {
      id: 'user_1',
      name: 'Admin User',
      avatar: 'https://picsum.photos/100/100?random=user_1',
      cover: 'https://picsum.photos/1200/400?random=cover_1',
      bio: 'Software Engineer | Coffee Lover | Traveler',
      friends: ['user_2', 'user_3', 'user_4'],
      location: 'San Francisco, CA',
      workplace: 'Tech Corp',
      education: 'Stanford University',
      joinedDate: '2020-03-15',
      relationship: 'Single',
      online: true
    },
    'user_2': {
      id: 'user_2',
      name: 'Jane Doe',
      avatar: 'https://picsum.photos/100/100?random=user_2',
      cover: 'https://picsum.photos/1200/400?random=cover_2',
      bio: 'Digital Artist | Creating worlds one pixel at a time',
      friends: ['user_1', 'user_3'],
      location: 'Los Angeles, CA',
      workplace: 'Freelance Artist',
      education: 'Rhode Island School of Design',
      joinedDate: '2019-07-22',
      relationship: 'In a Relationship',
      online: true
    },
    'user_3': {
      id: 'user_3',
      name: 'John Smith',
      avatar: 'https://picsum.photos/100/100?random=user_3',
      cover: 'https://picsum.photos/1200/400?random=cover_3',
      bio: 'Photographer | Capturing moments that matter',
      friends: ['user_1', 'user_2'],
      location: 'New York, NY',
      workplace: 'Smith Photography Studio',
      education: 'NYU Film School',
      joinedDate: '2018-11-05',
      relationship: 'Married',
      online: false
    },
    'user_4': {
      id: 'user_4',
      name: 'Sarah Wilson',
      avatar: 'https://picsum.photos/100/100?random=user_4',
      cover: 'https://picsum.photos/1200/400?random=cover_4',
      bio: 'Travel Blogger | 50+ countries and counting ✈️',
      friends: ['user_1', 'user_7'],
      location: 'Austin, TX',
      workplace: 'WonderWanderer Blog',
      education: 'University of Texas',
      joinedDate: '2021-02-10',
      relationship: 'Single',
      online: true
    },
    'user_5': {
      id: 'user_5',
      name: 'Mike Brown',
      avatar: 'https://picsum.photos/100/100?random=user_5',
      cover: 'https://picsum.photos/1200/400?random=cover_5',
      bio: 'Chef | Food is my love language 🍳',
      friends: ['user_8'],
      location: 'Chicago, IL',
      workplace: 'The Brown Table Restaurant',
      education: 'Culinary Institute of America',
      joinedDate: '2022-05-18',
      relationship: 'In a Relationship',
      online: false
    },
    'user_6': {
      id: 'user_6',
      name: 'Emily Davis',
      avatar: 'https://picsum.photos/100/100?random=user_6',
      cover: 'https://picsum.photos/1200/400?random=cover_6',
      bio: 'UX Designer | Making the web beautiful and usable',
      friends: ['user_9'],
      location: 'Seattle, WA',
      workplace: 'Design Studio Co.',
      education: 'University of Washington',
      joinedDate: '2020-09-01',
      relationship: 'Married',
      online: true
    },
    'user_7': {
      id: 'user_7',
      name: 'Carlos Rivera',
      avatar: 'https://picsum.photos/100/100?random=user_7',
      cover: 'https://picsum.photos/1200/400?random=cover_7',
      bio: 'Software Developer | Open Source Contributor | Coffee Addict',
      friends: ['user_4', 'user_10'],
      location: 'Miami, FL',
      workplace: 'CloudSoft Inc.',
      education: 'Florida International University',
      joinedDate: '2019-03-20',
      relationship: 'Single',
      online: true
    },
    'user_8': {
      id: 'user_8',
      name: 'Aisha Johnson',
      avatar: 'https://picsum.photos/100/100?random=user_8',
      cover: 'https://picsum.photos/1200/400?random=cover_8',
      bio: 'Marketing Manager | Brand Storyteller | Dog Mom',
      friends: ['user_5', 'user_9'],
      location: 'Atlanta, GA',
      workplace: 'BrandWave Agency',
      education: 'Spelman College',
      joinedDate: '2021-08-15',
      relationship: 'Married',
      online: false
    },
    'user_9': {
      id: 'user_9',
      name: 'David Kim',
      avatar: 'https://picsum.photos/100/100?random=user_9',
      cover: 'https://picsum.photos/1200/400?random=cover_9',
      bio: 'Data Scientist | Machine Learning Enthusiast | Runner',
      friends: ['user_6', 'user_8'],
      location: 'San Jose, CA',
      workplace: 'DataVision Analytics',
      education: 'UC Berkeley',
      joinedDate: '2020-12-01',
      relationship: 'Single',
      online: true
    },
    'user_10': {
      id: 'user_10',
      name: 'Lily Chen',
      avatar: 'https://picsum.photos/100/100?random=user_10',
      cover: 'https://picsum.photos/1200/400?random=cover_10',
      bio: 'Startup Founder | Tech Investor | Yoga Practitioner',
      friends: ['user_7'],
      location: 'San Francisco, CA',
      workplace: 'NexGen Ventures',
      education: 'Harvard Business School',
      joinedDate: '2018-06-30',
      relationship: 'In a Relationship',
      online: false
    }
  },
  friendRequests: [
    { id: 'user_5', timestamp: Date.now() - 3600000, mutualFriends: 2 },
    { id: 'user_6', timestamp: Date.now() - 7200000, mutualFriends: 1 }
  ],
  groups: [
    {
      id: 'group_1',
      name: 'React Developers',
      cover: 'https://picsum.photos/1200/400?random=group_1',
      members: ['user_1', 'user_2', 'user_4'],
      description: 'A community for React developers to share knowledge and tips.',
      posts: ['post_g1'],
      privacy: 'public',
      category: 'Technology',
      createdBy: 'user_1'
    },
    {
      id: 'group_2',
      name: 'Digital Art Community',
      cover: 'https://picsum.photos/1200/400?random=group_2',
      members: ['user_1', 'user_2'],
      description: 'Share your digital art and get feedback from fellow artists!',
      posts: [],
      privacy: 'public',
      category: 'Art',
      createdBy: 'user_2'
    },
    {
      id: 'group_3',
      name: 'Photography Enthusiasts',
      cover: 'https://picsum.photos/1200/400?random=group_3',
      members: ['user_3', 'user_1', 'user_7', 'user_9'],
      description: 'For photographers of all skill levels. Share your best shots!',
      posts: ['post_g2'],
      privacy: 'public',
      category: 'Photography',
      createdBy: 'user_3'
    },
    {
      id: 'group_4',
      name: 'Foodie Adventures',
      cover: 'https://picsum.photos/1200/400?random=group_4',
      members: ['user_5', 'user_8', 'user_1'],
      description: 'Exploring the best food spots and sharing recipes.',
      posts: ['post_g3'],
      privacy: 'private',
      category: 'Food',
      createdBy: 'user_5'
    }
  ],
  pages: [
    {
      id: 'page_1',
      name: 'Tech News Daily',
      avatar: 'https://picsum.photos/100/100?random=page_1',
      cover: 'https://picsum.photos/1200/400?random=page_cover_1',
      description: 'Your daily dose of technology news and updates. Stay ahead with the latest in tech, AI, and digital innovation.',
      followers: ['user_1', 'user_3', 'user_7', 'user_9'],
      reviews: [
        { id: 'r1', userId: 'user_2', rating: 5, content: 'Great content! Always up to date with the latest tech news.', timestamp: Date.now() - 86400000 },
        { id: 'r2', userId: 'user_9', rating: 4, content: 'Very informative. The AI coverage is particularly excellent.', timestamp: Date.now() - 172800000 }
      ],
      posts: ['post_p1'],
      category: 'Technology',
      website: 'https://technewsdaily.com',
      phone: '+1 (415) 555-0192',
      address: '123 Tech Street, San Francisco, CA 94105',
      isLiked: true
    },
    {
      id: 'page_2',
      name: 'Foodie Paradise',
      avatar: 'https://picsum.photos/100/100?random=page_2',
      cover: 'https://picsum.photos/1200/400?random=page_cover_2',
      description: 'Celebrating food culture from around the world. Recipes, restaurant reviews, and culinary adventures.',
      followers: ['user_5', 'user_8', 'user_1'],
      reviews: [
        { id: 'r3', userId: 'user_5', rating: 5, content: 'As a chef, I love this page! Amazing recipes and food photography.', timestamp: Date.now() - 259200000 }
      ],
      posts: ['post_p2'],
      category: 'Food & Beverage',
      website: 'https://foodieparadise.com',
      phone: '+1 (312) 555-0147',
      address: '456 Flavor Ave, Chicago, IL 60601',
      isLiked: false
    },
    {
      id: 'page_3',
      name: 'Travel Adventures Blog',
      avatar: 'https://picsum.photos/100/100?random=page_3',
      cover: 'https://picsum.photos/1200/400?random=page_cover_3',
      description: 'Inspiring wanderlust and sharing travel tips, destination guides, and adventure stories from around the globe.',
      followers: ['user_4', 'user_1'],
      reviews: [
        { id: 'r4', userId: 'user_4', rating: 5, content: 'This page inspired my last 3 trips! Amazing destination guides.', timestamp: Date.now() - 345600000 }
      ],
      posts: ['post_p3'],
      category: 'Travel',
      website: 'https://traveladventuresblog.com',
      phone: null,
      address: null,
      isLiked: true
    }
  ],
  posts: [
    {
      id: 'post_1',
      userId: 'user_2',
      content: 'Just finished my latest digital art piece! What do you think? 🎨 Spent 3 weeks on this one.',
      image: 'https://picsum.photos/800/400?random=post_1',
      likes: ['user_1', 'user_3'],
      reactions: [
        { userId: 'user_1', type: 'love' },
        { userId: 'user_3', type: 'like' }
      ],
      comments: [
        {
          id: 'c1',
          userId: 'user_1',
          content: 'This looks amazing! The colors are so vibrant.',
          timestamp: Date.now() - 3600000,
          replies: [
            {
              id: 'c1r1',
              userId: 'user_2',
              content: 'Thank you so much! I used a new technique for the color blending.',
              timestamp: Date.now() - 3000000,
              replies: [],
              likes: []
            }
          ],
          likes: ['user_2']
        },
        {
          id: 'c2',
          userId: 'user_3',
          content: 'The composition is stunning. What software do you use?',
          timestamp: Date.now() - 1800000,
          replies: [],
          likes: []
        }
      ],
      timestamp: Date.now() - 7200000,
      type: 'photo',
      privacy: 'friends',
      shares: 4,
      edited: false
    },
    {
      id: 'post_2',
      userId: 'user_3',
      content: 'Beautiful sunset at the beach today. Nature is truly incredible. 🌅 Golden hour magic.',
      image: 'https://picsum.photos/800/400?random=post_2',
      likes: ['user_1', 'user_2', 'user_4'],
      reactions: [
        { userId: 'user_1', type: 'wow' },
        { userId: 'user_2', type: 'like' },
        { userId: 'user_4', type: 'love' }
      ],
      comments: [
        {
          id: 'c3',
          userId: 'user_4',
          content: 'Where is this? I need to visit! 😍',
          timestamp: Date.now() - 12000000,
          replies: [
            {
              id: 'c3r1',
              userId: 'user_3',
              content: 'Malibu Beach! It was absolutely magical.',
              timestamp: Date.now() - 11000000,
              replies: [],
              likes: ['user_4']
            }
          ],
          likes: ['user_1', 'user_2']
        }
      ],
      timestamp: Date.now() - 14400000,
      type: 'photo',
      privacy: 'public',
      shares: 12,
      edited: false
    },
    {
      id: 'post_3',
      userId: 'user_1',
      content: 'Started a new job at Tech Corp! Excited for this new chapter. 🚀 First day was amazing — great team, interesting projects, and unlimited coffee!',
      likes: ['user_2', 'user_3', 'user_4'],
      reactions: [
        { userId: 'user_2', type: 'care' },
        { userId: 'user_3', type: 'like' },
        { userId: 'user_4', type: 'wow' }
      ],
      comments: [
        {
          id: 'c4',
          userId: 'user_2',
          content: 'Congratulations!! You deserve it! 🎉',
          timestamp: Date.now() - 80000000,
          replies: [],
          likes: ['user_1', 'user_3']
        }
      ],
      timestamp: Date.now() - 86400000,
      type: 'life_event',
      privacy: 'friends',
      shares: 8,
      edited: false
    },
    {
      id: 'post_4',
      userId: 'user_4',
      content: 'Check out this amazing article about React performance optimization! Learned some great tricks.',
      link: {
        url: 'https://react.dev',
        title: 'React: The Library for Web and Native User Interfaces',
        description: 'Build user interfaces out of individual pieces called components written in JavaScript.',
        image: 'https://picsum.photos/800/400?random=link_1'
      },
      likes: [],
      reactions: [],
      comments: [
        {
          id: 'c5',
          userId: 'user_7',
          content: 'Great article! I use useMemo and useCallback all the time now.',
          timestamp: Date.now() - 165000000,
          replies: [],
          likes: []
        }
      ],
      timestamp: Date.now() - 172800000,
      type: 'link',
      privacy: 'public',
      shares: 3,
      edited: false
    },
    {
      id: 'post_5',
      userId: 'user_2',
      content: 'Here is a quick timelapse of my painting process. It took 6 hours in real time! 🖌️',
      video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      likes: ['user_1'],
      reactions: [{ userId: 'user_1', type: 'like' }],
      comments: [],
      timestamp: Date.now() - 259200000,
      type: 'video',
      privacy: 'friends',
      shares: 2,
      edited: false
    },
    {
      id: 'post_6',
      userId: 'user_7',
      content: 'Finally got my open source project to 1000 stars on GitHub! 🌟 Thank you all for the support! This is a huge milestone for me.',
      likes: ['user_1', 'user_9', 'user_10'],
      reactions: [
        { userId: 'user_1', type: 'like' },
        { userId: 'user_9', type: 'love' },
        { userId: 'user_10', type: 'care' }
      ],
      comments: [
        {
          id: 'c6',
          userId: 'user_9',
          content: 'Well deserved! Your project is incredibly useful.',
          timestamp: Date.now() - 40000000,
          replies: [],
          likes: ['user_7']
        }
      ],
      timestamp: Date.now() - 43200000,
      type: 'status',
      privacy: 'public',
      shares: 15,
      edited: false
    },
    {
      id: 'post_7',
      userId: 'user_8',
      content: 'New campaign launch day! After 3 months of planning, we are finally live. Fingers crossed! 🤞',
      image: 'https://picsum.photos/800/400?random=post_7',
      likes: ['user_5'],
      reactions: [{ userId: 'user_5', type: 'like' }],
      comments: [],
      timestamp: Date.now() - 50400000,
      type: 'photo',
      privacy: 'public',
      shares: 6,
      edited: false
    },
    {
      id: 'post_8',
      userId: 'user_5',
      content: 'Weekend brunch special: Avocado Toast with a Poached Egg and everything bagel seasoning. Recipe in the comments! 🥑🍳',
      image: 'https://picsum.photos/800/400?random=post_8',
      likes: ['user_8', 'user_1', 'user_4'],
      reactions: [
        { userId: 'user_8', type: 'love' },
        { userId: 'user_1', type: 'like' },
        { userId: 'user_4', type: 'wow' }
      ],
      comments: [
        {
          id: 'c7',
          userId: 'user_5',
          content: 'Recipe: Toast sourdough bread, smash ripe avocado with salt, pepper, and lemon juice, top with poached egg and everything bagel seasoning. Enjoy!',
          timestamp: Date.now() - 57000000,
          replies: [],
          likes: ['user_8', 'user_1']
        }
      ],
      timestamp: Date.now() - 57600000,
      type: 'photo',
      privacy: 'friends',
      shares: 9,
      edited: false
    },
    {
      id: 'post_9',
      userId: 'user_4',
      content: 'Just landed in Tokyo! 🇯🇵 First time in Japan and I am absolutely blown away. The city is incredible. Day 1 recap coming soon on the blog!',
      image: 'https://picsum.photos/800/400?random=post_9',
      likes: ['user_1', 'user_2', 'user_7'],
      reactions: [
        { userId: 'user_1', type: 'wow' },
        { userId: 'user_2', type: 'love' },
        { userId: 'user_7', type: 'like' }
      ],
      comments: [],
      timestamp: Date.now() - 108000000,
      type: 'photo',
      privacy: 'public',
      shares: 21,
      edited: false
    },
    {
      id: 'post_10',
      userId: 'user_1',
      content: 'Feeling grateful today. 🙏 Sometimes it is the small things — a great cup of coffee, a beautiful morning, and good friends.',
      likes: ['user_2', 'user_3'],
      reactions: [
        { userId: 'user_2', type: 'love' },
        { userId: 'user_3', type: 'care' }
      ],
      comments: [],
      timestamp: Date.now() - 21600000,
      type: 'status',
      privacy: 'friends',
      shares: 0,
      feeling: 'grateful',
      edited: false
    },
    {
      id: 'post_13',
      userId: 'user_1',
      content: 'Weekend hike in the Marin Headlands — the views were absolutely breathtaking! 🏔️ Clear skies all day.',
      image: 'https://picsum.photos/800/400?random=post_13',
      likes: ['user_2', 'user_3', 'user_4'],
      reactions: [
        { userId: 'user_2', type: 'love' },
        { userId: 'user_3', type: 'wow' },
        { userId: 'user_4', type: 'like' }
      ],
      comments: [],
      timestamp: Date.now() - 43200000,
      type: 'photo',
      privacy: 'friends',
      shares: 3,
      edited: false
    },
    {
      id: 'post_14',
      userId: 'user_1',
      content: 'Coffee shop vibes on a rainy Friday morning ☕ Nothing beats a good pour-over and a good book.',
      image: 'https://picsum.photos/800/400?random=post_14',
      likes: ['user_2', 'user_7'],
      reactions: [
        { userId: 'user_2', type: 'love' },
        { userId: 'user_7', type: 'like' }
      ],
      comments: [
        {
          id: 'c9',
          userId: 'user_2',
          content: 'Which coffee shop is this? Looks so cozy!',
          timestamp: Date.now() - 30000000,
          replies: [],
          likes: ['user_1']
        }
      ],
      timestamp: Date.now() - 32400000,
      type: 'photo',
      privacy: 'public',
      shares: 1,
      edited: false
    },
    {
      id: 'post_11',
      userId: 'user_9',
      content: 'Just published my analysis on the latest trends in large language models. The progress in the last 6 months has been staggering. Link below:',
      link: {
        url: 'https://medium.com',
        title: 'LLM Trends 2026: What Every Developer Should Know',
        description: 'A deep dive into the latest developments in large language models and what they mean for the future of software development.',
        image: 'https://picsum.photos/800/400?random=link_2'
      },
      likes: ['user_7', 'user_1'],
      reactions: [
        { userId: 'user_7', type: 'like' },
        { userId: 'user_1', type: 'wow' }
      ],
      comments: [],
      timestamp: Date.now() - 129600000,
      type: 'link',
      privacy: 'public',
      shares: 18,
      edited: false
    },
    {
      id: 'post_12',
      userId: 'user_10',
      content: 'Excited to announce NexGen Ventures has just closed our Series A round! 🚀 We are investing in the next generation of AI-powered startups.',
      image: 'https://picsum.photos/800/400?random=post_12',
      likes: ['user_7', 'user_9', 'user_1'],
      reactions: [
        { userId: 'user_7', type: 'like' },
        { userId: 'user_9', type: 'wow' },
        { userId: 'user_1', type: 'care' }
      ],
      comments: [],
      timestamp: Date.now() - 216000000,
      type: 'photo',
      privacy: 'public',
      shares: 35,
      edited: false
    },
    {
      id: 'post_g1',
      userId: 'user_2',
      groupId: 'group_1',
      content: 'Does anyone have experience with React Server Components? I am trying to understand when to use them vs. regular client components.',
      likes: ['user_1'],
      reactions: [{ userId: 'user_1', type: 'like' }],
      comments: [
        {
          id: 'c8',
          userId: 'user_1',
          content: 'RSC are great for data fetching at the component level! Use them when you need to fetch data without client-side JS.',
          timestamp: Date.now() - 80000,
          replies: [],
          likes: []
        }
      ],
      timestamp: Date.now() - 100000,
      type: 'status',
      privacy: 'public',
      shares: 0,
      edited: false
    },
    {
      id: 'post_g2',
      userId: 'user_3',
      groupId: 'group_3',
      content: 'Golden hour portrait session from this weekend. Shot on a 50mm f/1.4, ISO 400. The natural light was just perfect.',
      image: 'https://picsum.photos/800/400?random=post_g2',
      likes: ['user_1', 'user_9'],
      reactions: [
        { userId: 'user_1', type: 'love' },
        { userId: 'user_9', type: 'wow' }
      ],
      comments: [],
      timestamp: Date.now() - 300000,
      type: 'photo',
      privacy: 'public',
      shares: 0,
      edited: false
    },
    {
      id: 'post_g3',
      userId: 'user_5',
      groupId: 'group_4',
      content: 'Found this incredible hidden gem restaurant in Wicker Park. The tasting menu was absolutely divine — 9 courses of pure artistry.',
      image: 'https://picsum.photos/800/400?random=post_g3',
      likes: ['user_8'],
      reactions: [{ userId: 'user_8', type: 'love' }],
      comments: [],
      timestamp: Date.now() - 200000,
      type: 'photo',
      privacy: 'private',
      shares: 0,
      edited: false
    },
    {
      id: 'post_p1',
      pageId: 'page_1',
      content: 'BREAKING: New AI model released today sets record benchmarks! This changes everything about how we think about artificial intelligence. #tech #ai',
      image: 'https://picsum.photos/800/400?random=post_p1',
      likes: ['user_1', 'user_3'],
      reactions: [
        { userId: 'user_1', type: 'wow' },
        { userId: 'user_3', type: 'like' }
      ],
      comments: [],
      timestamp: Date.now() - 500000,
      type: 'photo',
      privacy: 'public',
      shares: 47,
      edited: false
    },
    {
      id: 'post_p2',
      pageId: 'page_2',
      content: '🍕 Neapolitan Pizza vs New York Style — which side are you on? Drop your vote in the comments! Today we explore the ultimate pizza debate.',
      image: 'https://picsum.photos/800/400?random=post_p2',
      likes: ['user_5', 'user_8'],
      reactions: [
        { userId: 'user_5', type: 'love' },
        { userId: 'user_8', type: 'haha' }
      ],
      comments: [],
      timestamp: Date.now() - 600000,
      type: 'photo',
      privacy: 'public',
      shares: 12,
      edited: false
    },
    {
      id: 'post_p3',
      pageId: 'page_3',
      content: '🌍 Top 10 Hidden Gems in Southeast Asia for 2026 — Our travel team spent 3 months researching the most underrated destinations you NEED to visit.',
      image: 'https://picsum.photos/800/400?random=post_p3',
      likes: ['user_4'],
      reactions: [{ userId: 'user_4', type: 'love' }],
      comments: [],
      timestamp: Date.now() - 700000,
      type: 'photo',
      privacy: 'public',
      shares: 28,
      edited: false
    }
  ],
  notifications: [
    {
      id: 'n1',
      type: 'like',
      userId: 'user_2',
      content: 'liked your post',
      read: false,
      timestamp: Date.now() - 1800000,
      postId: 'post_3'
    },
    {
      id: 'n2',
      type: 'comment',
      userId: 'user_3',
      content: 'commented on your photo',
      read: true,
      timestamp: Date.now() - 3600000,
      postId: 'post_3'
    },
    {
      id: 'n3',
      type: 'friend_request',
      userId: 'user_9',
      content: 'sent you a friend request',
      read: false,
      timestamp: Date.now() - 7200000
    },
    {
      id: 'n4',
      type: 'like',
      userId: 'user_4',
      content: 'loved your post about your new job',
      read: false,
      timestamp: Date.now() - 10800000,
      postId: 'post_3'
    },
    {
      id: 'n5',
      type: 'group',
      userId: 'user_2',
      content: 'posted in React Developers group',
      read: true,
      timestamp: Date.now() - 120000,
      groupId: 'group_1',
      postId: 'post_g1'
    },
    {
      id: 'n6',
      type: 'event',
      userId: 'user_7',
      content: 'invited you to React Developers Meetup',
      read: false,
      timestamp: Date.now() - 86400000
    },
    {
      id: 'n7',
      type: 'page',
      userId: 'user_9',
      content: 'Tech News Daily shared a new post',
      read: true,
      timestamp: Date.now() - 500000,
      pageId: 'page_1',
      postId: 'post_p1'
    },
    {
      id: 'n8',
      type: 'mention',
      userId: 'user_9',
      content: 'mentioned you in a comment',
      read: false,
      timestamp: Date.now() - 43200000
    }
  ],
  marketplace: [
    {
      id: 'listing_1',
      sellerId: 'user_9',
      title: 'iPhone 14 Pro Max - 256GB Space Black',
      description: 'Excellent condition iPhone 14 Pro Max. Comes with original box, charger, and AppleCare+ until March 2025. No scratches, always used with case and screen protector.',
      price: 750,
      currency: 'USD',
      category: 'electronics',
      condition: 'Used - Like New',
      images: ['https://picsum.photos/600/600?random=listing_1'],
      location: 'San Jose, CA',
      listed: Date.now() - 86400000,
      saved: false
    },
    {
      id: 'listing_2',
      sellerId: 'user_3',
      title: 'Vintage Solid Oak Writing Desk',
      description: 'Beautiful vintage oak writing desk from the 1970s. Solid construction, some light wear consistent with age. Three drawers with original brass hardware. 54 inches wide, 28 inches deep.',
      price: 220,
      currency: 'USD',
      category: 'home_goods',
      condition: 'Used - Good',
      images: ['https://picsum.photos/600/600?random=listing_2'],
      location: 'New York, NY',
      listed: Date.now() - 172800000,
      saved: true
    },
    {
      id: 'listing_3',
      sellerId: 'user_7',
      title: 'Trek Mountain Bike - 21 Speed',
      description: 'Trek Marlin 5 mountain bike. 21 speed Shimano drivetrain. Front suspension fork. Rides great, just upgraded to a newer model. Includes a bike lock.',
      price: 380,
      currency: 'USD',
      category: 'sports',
      condition: 'Used - Good',
      images: ['https://picsum.photos/600/600?random=listing_3'],
      location: 'Miami, FL',
      listed: Date.now() - 259200000,
      saved: false
    },
    {
      id: 'listing_4',
      sellerId: 'user_6',
      title: 'Nike Air Force 1 Low - Size 10',
      description: 'Classic Nike Air Force 1 Low in white/white. Worn twice, basically new. Size 10 US. Comes with original box.',
      price: 85,
      currency: 'USD',
      category: 'apparel',
      condition: 'Used - Like New',
      images: ['https://picsum.photos/600/600?random=listing_4'],
      location: 'Seattle, WA',
      listed: Date.now() - 345600000,
      saved: false
    },
    {
      id: 'listing_5',
      sellerId: 'user_10',
      title: 'MacBook Pro 16" M2 Pro - 32GB RAM',
      description: 'MacBook Pro 16-inch with M2 Pro chip, 32GB unified memory, 1TB SSD. Includes original charger and sleeve. AppleCare+ until 2026. Selling due to company upgrade.',
      price: 1800,
      currency: 'USD',
      category: 'electronics',
      condition: 'Used - Like New',
      images: ['https://picsum.photos/600/600?random=listing_5'],
      location: 'San Francisco, CA',
      listed: Date.now() - 43200000,
      saved: false
    },
    {
      id: 'listing_6',
      sellerId: 'user_8',
      title: 'REI Co-op Half Dome 2 Tent',
      description: 'REI Half Dome 2 person camping tent. Used 3 times. Includes footprint, all stakes, and original carry bag. Waterproof fly, excellent condition.',
      price: 95,
      currency: 'USD',
      category: 'sports',
      condition: 'Used - Good',
      images: ['https://picsum.photos/600/600?random=listing_6'],
      location: 'Atlanta, GA',
      listed: Date.now() - 432000000,
      saved: false
    },
    {
      id: 'listing_7',
      sellerId: 'user_4',
      title: 'Coach Signature Tote Bag - Tan',
      description: 'Authentic Coach signature canvas tote in tan/brown. Purchased at Coach outlet last year. Light wear on handles. Includes original dust bag.',
      price: 175,
      currency: 'USD',
      category: 'apparel',
      condition: 'Used - Good',
      images: ['https://picsum.photos/600/600?random=listing_7'],
      location: 'Austin, TX',
      listed: Date.now() - 518400000,
      saved: false
    },
    {
      id: 'listing_8',
      sellerId: 'user_5',
      title: 'IKEA EKTORP 3-Seater Sofa - Light Gray',
      description: 'IKEA EKTORP 3-seat sofa with Hallarp gray slipcover. Sofa is in good condition, cover has been washed. 86 inches wide. You will need a truck/van for pickup.',
      price: 280,
      currency: 'USD',
      category: 'home_goods',
      condition: 'Used - Good',
      images: ['https://picsum.photos/600/600?random=listing_8'],
      location: 'Chicago, IL',
      listed: Date.now() - 604800000,
      saved: false
    },
    {
      id: 'listing_9',
      sellerId: 'user_2',
      title: 'Box of Art Books - FREE',
      description: 'Moving and giving away my collection of art books. About 20 books covering digital art, illustration, and design. Must pick up. First come first served!',
      price: 0,
      currency: 'USD',
      category: 'free',
      condition: 'Used - Good',
      images: ['https://picsum.photos/600/600?random=listing_9'],
      location: 'Los Angeles, CA',
      listed: Date.now() - 21600000,
      saved: false
    },
    {
      id: 'listing_10',
      sellerId: 'user_7',
      title: 'Fender Player Stratocaster Electric Guitar',
      description: 'Fender Player Series Stratocaster in Tidepool blue. Barely used, just a hobby guitar. Includes a gig bag and a small practice amp. Great for beginners or intermediate players.',
      price: 450,
      currency: 'USD',
      category: 'entertainment',
      condition: 'Used - Like New',
      images: ['https://picsum.photos/600/600?random=listing_10'],
      location: 'Miami, FL',
      listed: Date.now() - 691200000,
      saved: false
    }
  ],
  events: [
    {
      id: 'event_1',
      name: 'React Developers Meetup',
      description: 'Monthly meetup for React developers in the Bay Area. This month we will be discussing React Server Components, state management patterns, and best practices for 2026. Networking and pizza included!',
      cover: 'https://picsum.photos/1200/400?random=event_1',
      hostId: 'user_1',
      date: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
      endDate: new Date(Date.now() + 5 * 24 * 3600000 + 3 * 3600000).toISOString(),
      location: 'Covo SF, 981 Mission St, San Francisco, CA',
      interested: ['user_2', 'user_7', 'user_9'],
      going: ['user_1', 'user_4'],
      category: 'networking'
    },
    {
      id: 'event_2',
      name: 'Summer Beach Party 2026',
      description: 'Join us for the annual Summer Beach Party! Live DJ, beach volleyball, bonfires, and a spectacular sunset view. Bring your friends, swimsuits, and good vibes!',
      cover: 'https://picsum.photos/1200/400?random=event_2',
      hostId: 'user_4',
      date: new Date(Date.now() + 14 * 24 * 3600000).toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 3600000 + 8 * 3600000).toISOString(),
      location: 'Ocean Beach, San Francisco, CA',
      interested: ['user_1', 'user_3', 'user_6', 'user_8'],
      going: ['user_4', 'user_2', 'user_5'],
      category: 'social'
    },
    {
      id: 'event_3',
      name: 'Photography Workshop: Natural Light Portraits',
      description: 'Learn how to use natural light to create stunning portrait photographs. Suitable for all skill levels. Bring your DSLR or mirrorless camera. Professional photographer John Smith will be leading the workshop.',
      cover: 'https://picsum.photos/1200/400?random=event_3',
      hostId: 'user_3',
      date: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 3600000 + 4 * 3600000).toISOString(),
      location: 'Golden Gate Park, San Francisco, CA',
      interested: ['user_2', 'user_9'],
      going: ['user_3', 'user_1'],
      category: 'education'
    },
    {
      id: 'event_4',
      name: 'SoMa Food Festival 2026',
      description: 'The biggest food festival in the Bay Area returns! 50+ local restaurants, live cooking demos, craft beer garden, and entertainment for the whole family. Tickets at the door.',
      cover: 'https://picsum.photos/1200/400?random=event_4',
      hostId: 'user_5',
      date: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 3600000 + 10 * 3600000).toISOString(),
      location: 'South Park, San Francisco, CA',
      interested: ['user_1', 'user_4', 'user_6', 'user_7', 'user_10'],
      going: ['user_5', 'user_8'],
      category: 'social'
    }
  ],
  stories: [
    {
      id: 'story_1',
      userId: 'user_2',
      image: 'https://picsum.photos/420/740?random=story_1',
      timestamp: Date.now() - 3600000,
      viewed: false
    },
    {
      id: 'story_2',
      userId: 'user_3',
      image: 'https://picsum.photos/420/740?random=story_2',
      timestamp: Date.now() - 7200000,
      viewed: false
    },
    {
      id: 'story_3',
      userId: 'user_4',
      image: 'https://picsum.photos/420/740?random=story_3',
      timestamp: Date.now() - 12600000,
      viewed: true
    },
    {
      id: 'story_4',
      userId: 'user_7',
      image: 'https://picsum.photos/420/740?random=story_4',
      timestamp: Date.now() - 36000000,
      viewed: true
    },
    {
      id: 'story_5',
      userId: 'user_8',
      image: 'https://picsum.photos/420/740?random=story_5',
      timestamp: Date.now() - 50400000,
      viewed: true
    }
  ],
  savedItems: [
    {
      id: 'saved_1',
      type: 'post',
      referenceId: 'post_2',
      savedAt: Date.now() - 86400000,
      collection: null
    },
    {
      id: 'saved_2',
      type: 'listing',
      referenceId: 'listing_2',
      savedAt: Date.now() - 172800000,
      collection: 'Furniture'
    },
    {
      id: 'saved_3',
      type: 'event',
      referenceId: 'event_1',
      savedAt: Date.now() - 43200000,
      collection: null
    }
  ],
  messages: {
    'conv_user_2': [
      {
        id: 'msg_1',
        senderId: 'user_2',
        content: 'Hey! Did you see my latest art post?',
        timestamp: Date.now() - 7200000,
        read: true
      },
      {
        id: 'msg_2',
        senderId: 'user_1',
        content: 'Yes! It was absolutely amazing. The colors are so vibrant!',
        timestamp: Date.now() - 7000000,
        read: true
      },
      {
        id: 'msg_3',
        senderId: 'user_2',
        content: 'Thank you!! Working on a new piece now. Should be done by the weekend.',
        timestamp: Date.now() - 6800000,
        read: true
      },
      {
        id: 'msg_4',
        senderId: 'user_1',
        content: 'Can\'t wait to see it! Your work keeps getting better and better.',
        timestamp: Date.now() - 3600000,
        read: true
      },
      {
        id: 'msg_5',
        senderId: 'user_2',
        content: '😊 You\'re too kind! I\'ll tag you when it\'s live.',
        timestamp: Date.now() - 1800000,
        read: false
      }
    ],
    'conv_user_3': [
      {
        id: 'msg_6',
        senderId: 'user_1',
        content: 'Great beach photos John! Where exactly was that?',
        timestamp: Date.now() - 14400000,
        read: true
      },
      {
        id: 'msg_7',
        senderId: 'user_3',
        content: 'Malibu Beach! Went there on Saturday. The sunset was unreal.',
        timestamp: Date.now() - 14000000,
        read: true
      },
      {
        id: 'msg_8',
        senderId: 'user_1',
        content: 'I need to go there sometime. What camera/lens setup did you use?',
        timestamp: Date.now() - 13500000,
        read: true
      }
    ],
    'conv_user_4': [
      {
        id: 'msg_9',
        senderId: 'user_4',
        content: 'Tokyo is INCREDIBLE. You have to visit sometime!',
        timestamp: Date.now() - 108000000,
        read: true
      },
      {
        id: 'msg_10',
        senderId: 'user_1',
        content: 'That\'s on my bucket list for sure! How long are you staying?',
        timestamp: Date.now() - 100000000,
        read: false
      }
    ]
  },
  hiddenPosts: [],
  reportedPosts: [],
  outgoingFriendRequests: []
});

// Keep backward-compatible named export
export const initialData = getDefaultData();
