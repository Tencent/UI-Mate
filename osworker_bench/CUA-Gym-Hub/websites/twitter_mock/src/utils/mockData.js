import { v4 as uuidv4 } from 'uuid';

export const CURRENT_USER_ID = 'u1';

// --- Seed Data ---

const now = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

export const INITIAL_USERS = [
  {
    id: 'u1',
    name: 'Alex Johnson',
    handle: 'alexj',
    bio: 'Software engineer & coffee lover. Building the future one line at a time. Open source contributor.',
    avatar: 'https://i.pravatar.cc/150?u=u1',
    banner: 'https://picsum.photos/seed/u1banner/600/200',
    location: 'San Francisco, CA',
    website: 'https://alexj.dev',
    joinedDate: '2020-03-15T00:00:00Z',
    verified: true,
    followers: ['u2', 'u3', 'u4', 'u5', 'u8'],
    following: ['u2', 'u4', 'u5', 'u6', 'u7'],
    pinnedPostId: 'p1',
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    handle: 'sarahc',
    bio: 'Tech journalist @TechCrunch alum. Writing about startups, AI, and the future of work. NYC based.',
    avatar: 'https://i.pravatar.cc/150?u=u2',
    banner: 'https://picsum.photos/seed/u2banner/600/200',
    location: 'New York, NY',
    website: 'https://sarahchen.substack.com',
    joinedDate: '2019-07-22T00:00:00Z',
    verified: true,
    followers: ['u1', 'u3', 'u5', 'u6'],
    following: ['u1', 'u3', 'u4', 'u7'],
    pinnedPostId: null,
  },
  {
    id: 'u3',
    name: 'Mike Rivera',
    handle: 'mikerivera',
    bio: 'Photographer | Exploring the world through my lens. DM for collabs.',
    avatar: 'https://i.pravatar.cc/150?u=u3',
    banner: 'https://picsum.photos/seed/u3banner/600/200',
    location: 'Los Angeles, CA',
    website: '',
    joinedDate: '2021-01-10T00:00:00Z',
    verified: false,
    followers: ['u2', 'u8'],
    following: ['u1', 'u2', 'u5'],
    pinnedPostId: null,
  },
  {
    id: 'u4',
    name: 'TechCrunch',
    handle: 'techcrunch',
    bio: 'Breaking technology news and analysis. Startup coverage, reviews, and more.',
    avatar: 'https://i.pravatar.cc/150?u=u4',
    banner: 'https://picsum.photos/seed/u4banner/600/200',
    location: 'San Francisco, CA',
    website: 'https://techcrunch.com',
    joinedDate: '2017-06-01T00:00:00Z',
    verified: true,
    followers: ['u1', 'u2', 'u5', 'u6', 'u7', 'u8'],
    following: ['u7'],
    pinnedPostId: null,
  },
  {
    id: 'u5',
    name: 'Emma Wilson',
    handle: 'emmaw',
    bio: 'UX Designer at Figma. Passionate about accessible design and design systems. She/her.',
    avatar: 'https://i.pravatar.cc/150?u=u5',
    banner: 'https://picsum.photos/seed/u5banner/600/200',
    location: 'London, UK',
    website: 'https://emmawilson.design',
    joinedDate: '2020-11-05T00:00:00Z',
    verified: false,
    followers: ['u1', 'u3', 'u6'],
    following: ['u1', 'u2', 'u4', 'u6'],
    pinnedPostId: null,
  },
  {
    id: 'u6',
    name: 'David Park',
    handle: 'davidpark',
    bio: 'Founder & CEO @LaunchPad. Building tools for the next generation of creators. Y Combinator W24.',
    avatar: 'https://i.pravatar.cc/150?u=u6',
    banner: 'https://picsum.photos/seed/u6banner/600/200',
    location: 'Austin, TX',
    website: 'https://launchpad.io',
    joinedDate: '2018-09-12T00:00:00Z',
    verified: true,
    followers: ['u2', 'u5', 'u8'],
    following: ['u1', 'u4', 'u5', 'u7'],
    pinnedPostId: null,
  },
  {
    id: 'u7',
    name: 'OpenAI',
    handle: 'openai',
    bio: 'Creating safe AGI that benefits all of humanity.',
    avatar: 'https://i.pravatar.cc/150?u=u7',
    banner: 'https://picsum.photos/seed/u7banner/600/200',
    location: 'San Francisco, CA',
    website: 'https://openai.com',
    joinedDate: '2015-12-01T00:00:00Z',
    verified: true,
    followers: ['u1', 'u2', 'u4', 'u6', 'u8'],
    following: [],
    pinnedPostId: null,
  },
  {
    id: 'u8',
    name: 'Lisa Zhang',
    handle: 'lisaz',
    bio: 'Data scientist. ML researcher. Python enthusiast. Turning data into insights.',
    avatar: 'https://i.pravatar.cc/150?u=u8',
    banner: 'https://picsum.photos/seed/u8banner/600/200',
    location: 'Seattle, WA',
    website: '',
    joinedDate: '2022-02-14T00:00:00Z',
    verified: false,
    followers: ['u1'],
    following: ['u1', 'u3', 'u4', 'u6', 'u7'],
    pinnedPostId: null,
  },
];

export const INITIAL_TWEETS = [
  // p1: Text only, pinned by currentUser (Alex)
  {
    id: 'p1',
    userId: 'u1',
    content: 'Just shipped a major performance update to our API layer. Response times are down 40% across the board. Months of work paying off! #coding #webdev #performance',
    images: [],
    createdAt: new Date(now - 2 * HOUR).toISOString(),
    likes: ['u2', 'u3', 'u5', 'u6'],
    reposts: ['u2', 'u4'],
    retweets: ['u2', 'u4'],
    replies: ['r1', 'r2'],
    bookmarks: ['u2'],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 1843,
  },
  // p2: Single image post by Sarah
  {
    id: 'p2',
    userId: 'u2',
    content: 'Just finished reading an incredible deep-dive on the future of browser engines. The web platform is evolving faster than ever. Thread below.',
    images: ['https://picsum.photos/seed/p2/600/400'],
    createdAt: new Date(now - 3 * HOUR).toISOString(),
    likes: ['u1', 'u5'],
    reposts: ['u3'],
    retweets: ['u3'],
    replies: ['r3'],
    bookmarks: ['u1'],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 2451,
  },
  // p3: Text only by TechCrunch
  {
    id: 'p3',
    userId: 'u4',
    content: 'BREAKING: Series A funding for AI startups reached $12B in Q1 2026, a 180% increase from the same period last year. The AI gold rush shows no signs of slowing down. #AI #startups #funding',
    images: [],
    createdAt: new Date(now - 4 * HOUR).toISOString(),
    likes: ['u1', 'u2', 'u5', 'u6', 'u7', 'u8'],
    reposts: ['u1', 'u2', 'u6'],
    retweets: ['u1', 'u2', 'u6'],
    replies: ['r4', 'r5', 'r6', 'r7'],
    bookmarks: ['u1', 'u5'],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 89234,
  },
  // p4: Single image by Mike (photographer)
  {
    id: 'p4',
    userId: 'u3',
    content: 'Golden hour at Venice Beach. Moments like these make the early wake-up worth it.',
    images: ['https://picsum.photos/seed/p4/600/400'],
    createdAt: new Date(now - 5 * HOUR).toISOString(),
    likes: ['u1', 'u2', 'u5'],
    reposts: [],
    retweets: [],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 634,
  },
  // p5: Text only by Emma
  {
    id: 'p5',
    userId: 'u5',
    content: 'Hot take: Dark mode should be the default for every application in 2026. Light mode can be the opt-in.\n\nYour eyes will thank you.',
    images: [],
    createdAt: new Date(now - 6 * HOUR).toISOString(),
    likes: ['u1', 'u3', 'u6', 'u8'],
    reposts: ['u3'],
    retweets: ['u3'],
    replies: ['r8'],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 3782,
  },
  // p6: 4 images by Mike (photographer)
  {
    id: 'p6',
    userId: 'u3',
    content: 'New portrait series is live! Really proud of how these turned out. Natural light, no retouching.',
    images: [
      'https://picsum.photos/seed/p6a/600/400',
      'https://picsum.photos/seed/p6b/600/400',
      'https://picsum.photos/seed/p6c/600/400',
      'https://picsum.photos/seed/p6d/600/400',
    ],
    createdAt: new Date(now - 8 * HOUR).toISOString(),
    likes: ['u2', 'u5'],
    reposts: [],
    retweets: [],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 421,
  },
  // p7: Text only by David
  {
    id: 'p7',
    userId: 'u6',
    content: 'After 18 months of building in stealth, we\'re finally ready to share what we\'ve been working on at LaunchPad. Big announcement coming next week. Stay tuned.',
    images: [],
    createdAt: new Date(now - 10 * HOUR).toISOString(),
    likes: ['u1', 'u2', 'u4', 'u5'],
    reposts: ['u2'],
    retweets: ['u2'],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 5621,
  },
  // p8: OpenAI post with image
  {
    id: 'p8',
    userId: 'u7',
    content: 'Introducing GPT-5 Turbo: Our fastest and most capable model yet. Available today in the API.\n\nKey improvements:\n- 2x faster inference\n- 50% cost reduction\n- 200K context window\n- Enhanced reasoning',
    images: ['https://picsum.photos/seed/p8/600/400'],
    createdAt: new Date(now - 12 * HOUR).toISOString(),
    likes: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u8'],
    reposts: ['u1', 'u2', 'u4', 'u6', 'u8'],
    retweets: ['u1', 'u2', 'u4', 'u6', 'u8'],
    replies: ['r9'],
    bookmarks: ['u1', 'u2', 'u6'],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 342891,
  },
  // p9: Lisa text post
  {
    id: 'p9',
    userId: 'u8',
    content: 'Just finished training a new model on 3 months of sensor data. The accuracy improvements are wild. Machine learning in 2026 feels like magic sometimes.',
    images: [],
    createdAt: new Date(now - 14 * HOUR).toISOString(),
    likes: ['u1', 'u6'],
    reposts: [],
    retweets: [],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 287,
  },
  // p10: Quote post by Alex quoting TechCrunch
  {
    id: 'p10',
    userId: 'u1',
    content: 'This is exactly what I predicted at the start of the year. The AI infrastructure layer is where the real money is flowing now.',
    images: [],
    createdAt: new Date(now - 16 * HOUR).toISOString(),
    likes: ['u2', 'u4'],
    reposts: [],
    retweets: [],
    replies: [],
    bookmarks: [],
    quotedPostId: 'p3',
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 892,
  },
  // p11: Reply-as-post by Sarah to Alex
  {
    id: 'p11',
    userId: 'u2',
    content: '@alexj That 40% improvement is impressive. What was the main bottleneck you identified?',
    images: [],
    createdAt: new Date(now - 1.5 * HOUR).toISOString(),
    likes: ['u1'],
    reposts: [],
    retweets: [],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: 'p1',
    inReplyToUserId: 'u1',
    views: 156,
  },
  // p12: Viral post by Emma (100+ likes simulated via high view count)
  {
    id: 'p12',
    userId: 'u5',
    content: 'Unpopular opinion: The best design tool is pen and paper. \n\nSketch your ideas first, then move to digital. Your workflow will improve dramatically.\n\nI\'ve been doing this for 5 years and it changed everything about how I approach design problems.',
    images: [],
    createdAt: new Date(now - 1 * DAY).toISOString(),
    likes: ['u1', 'u2', 'u3', 'u4', 'u6', 'u7', 'u8'],
    reposts: ['u1', 'u2', 'u3', 'u6'],
    retweets: ['u1', 'u2', 'u3', 'u6'],
    replies: ['r10'],
    bookmarks: ['u3'],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 128943,
  },
  // p13: Zero engagement post by Lisa
  {
    id: 'p13',
    userId: 'u8',
    content: 'Anyone else having issues with the latest pandas update? Some of my data pipelines broke overnight.',
    images: [],
    createdAt: new Date(now - 1.5 * DAY).toISOString(),
    likes: [],
    reposts: [],
    retweets: [],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 42,
  },
  // p14: Reply-as-post by Alex to Emma
  {
    id: 'p14',
    userId: 'u1',
    content: '@emmaw Completely agree! I keep a sketchbook specifically for UI wireframing. It forces you to think about structure before pixels.',
    images: [],
    createdAt: new Date(now - 22 * HOUR).toISOString(),
    likes: ['u5'],
    reposts: [],
    retweets: [],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: 'p12',
    inReplyToUserId: 'u5',
    views: 89,
  },
  // p15: 4-image post by Emma (design showcase)
  {
    id: 'p15',
    userId: 'u5',
    content: 'Finally wrapped up the new design system for our component library. 200+ components, fully documented. Proud of the team!',
    images: [
      'https://picsum.photos/seed/p15a/600/400',
      'https://picsum.photos/seed/p15b/600/400',
      'https://picsum.photos/seed/p15c/600/400',
      'https://picsum.photos/seed/p15d/600/400',
    ],
    createdAt: new Date(now - 2 * DAY).toISOString(),
    likes: ['u1', 'u2', 'u6'],
    reposts: ['u1'],
    retweets: ['u1'],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 2134,
  },
  // p16: Long post by David (close to 280 chars)
  {
    id: 'p16',
    userId: 'u6',
    content: 'Startup advice nobody asked for: Your first 10 customers matter more than your next 10,000. Talk to them daily. Understand their problems deeply. Build for them specifically. Scale comes later. Product-market fit is everything.',
    images: [],
    createdAt: new Date(now - 2.5 * DAY).toISOString(),
    likes: ['u1', 'u2', 'u8'],
    reposts: ['u5'],
    retweets: ['u5'],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 7842,
  },
  // p17: TechCrunch with image
  {
    id: 'p17',
    userId: 'u4',
    content: 'Apple just announced their Vision Pro 2 with a significantly lower price point. AR/VR is about to get a lot more mainstream.',
    images: ['https://picsum.photos/seed/p17/600/400'],
    createdAt: new Date(now - 2.8 * DAY).toISOString(),
    likes: ['u1', 'u2', 'u6', 'u7'],
    reposts: ['u1', 'u6'],
    retweets: ['u1', 'u6'],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 45321,
  },
  // p18: Alex single image post
  {
    id: 'p18',
    userId: 'u1',
    content: 'The view from our new office. So grateful for this journey. #startup #sanfrancisco',
    images: ['https://picsum.photos/seed/p18/600/400'],
    createdAt: new Date(now - 3 * DAY).toISOString(),
    likes: ['u2', 'u3', 'u5', 'u6', 'u8'],
    reposts: ['u2'],
    retweets: ['u2'],
    replies: [],
    bookmarks: [],
    quotedPostId: null,
    inReplyToPostId: null,
    inReplyToUserId: null,
    views: 1567,
  },
];

export const INITIAL_REPLIES = [
  // r1-r2: replies to p1 (Alex's pinned post)
  {
    id: 'r1',
    tweetId: 'p1',
    postId: 'p1',
    userId: 'u2',
    content: 'This is incredible! 40% is a massive improvement. What framework are you using?',
    createdAt: new Date(now - 1.5 * HOUR).toISOString(),
    likes: ['u1'],
  },
  {
    id: 'r2',
    tweetId: 'p1',
    postId: 'p1',
    userId: 'u5',
    content: 'Congrats on the launch! The performance gains are noticeable on our end too.',
    createdAt: new Date(now - 1 * HOUR).toISOString(),
    likes: ['u1', 'u2'],
  },
  // r3: reply to p2 (Sarah's browser engine post)
  {
    id: 'r3',
    tweetId: 'p2',
    postId: 'p2',
    userId: 'u1',
    content: 'Great read! The section on WebGPU was particularly interesting. The web platform is moving fast.',
    createdAt: new Date(now - 2.5 * HOUR).toISOString(),
    likes: ['u2'],
  },
  // r4-r7: replies to p3 (TechCrunch AI funding) — most replied post
  {
    id: 'r4',
    tweetId: 'p3',
    postId: 'p3',
    userId: 'u1',
    content: 'The infrastructure play is where the real value is being created right now.',
    createdAt: new Date(now - 3.5 * HOUR).toISOString(),
    likes: ['u2', 'u4'],
  },
  {
    id: 'r5',
    tweetId: 'p3',
    postId: 'p3',
    userId: 'u6',
    content: 'Seeing this firsthand in the founder community. Every pitch deck has an AI angle now.',
    createdAt: new Date(now - 3 * HOUR).toISOString(),
    likes: ['u1', 'u2'],
  },
  {
    id: 'r6',
    tweetId: 'p3',
    postId: 'p3',
    userId: 'u8',
    content: 'The question is whether this funding level is sustainable or if we\'re in a bubble territory.',
    createdAt: new Date(now - 2.8 * HOUR).toISOString(),
    likes: [],
  },
  {
    id: 'r7',
    tweetId: 'p3',
    postId: 'p3',
    userId: 'u5',
    content: 'As a designer, I\'m seeing AI tools transform our workflow completely. The investment makes sense.',
    createdAt: new Date(now - 2.5 * HOUR).toISOString(),
    likes: ['u2'],
  },
  // r8: reply to p5 (Emma's dark mode take)
  {
    id: 'r8',
    tweetId: 'p5',
    postId: 'p5',
    userId: 'u3',
    content: 'As a photographer who edits photos, I actually prefer light mode for color accuracy. But I get the appeal!',
    createdAt: new Date(now - 5.5 * HOUR).toISOString(),
    likes: ['u5'],
  },
  // r9: reply to p8 (OpenAI GPT-5)
  {
    id: 'r9',
    tweetId: 'p8',
    postId: 'p8',
    userId: 'u1',
    content: 'The 200K context window is a game changer for our codebase analysis tools. Can\'t wait to integrate this.',
    createdAt: new Date(now - 11 * HOUR).toISOString(),
    likes: ['u7', 'u2'],
  },
  // r10: reply to p12 (Emma's pen and paper post)
  {
    id: 'r10',
    tweetId: 'p12',
    postId: 'p12',
    userId: 'u6',
    content: 'This is exactly how we approach product design at LaunchPad. Whiteboard first, then Figma.',
    createdAt: new Date(now - 23 * HOUR).toISOString(),
    likes: ['u5', 'u1'],
  },
];

export const INITIAL_NOTIFICATIONS = [
  // 2 follow notifications
  {
    id: 'n1',
    type: 'follow',
    userId: 'u5',
    postId: null,
    tweetId: null,
    content: null,
    createdAt: new Date(now - 1 * HOUR).toISOString(),
    read: false,
  },
  {
    id: 'n2',
    type: 'follow',
    userId: 'u8',
    postId: null,
    tweetId: null,
    content: null,
    createdAt: new Date(now - 6 * HOUR).toISOString(),
    read: true,
  },
  // 3 like notifications
  {
    id: 'n3',
    type: 'like',
    userId: 'u2',
    postId: 'p1',
    tweetId: 'p1',
    content: null,
    createdAt: new Date(now - 2 * HOUR).toISOString(),
    read: false,
  },
  {
    id: 'n4',
    type: 'like',
    userId: 'u6',
    postId: 'p1',
    tweetId: 'p1',
    content: null,
    createdAt: new Date(now - 3 * HOUR).toISOString(),
    read: false,
  },
  {
    id: 'n5',
    type: 'like',
    userId: 'u5',
    postId: 'p18',
    tweetId: 'p18',
    content: null,
    createdAt: new Date(now - 10 * HOUR).toISOString(),
    read: true,
  },
  // 2 repost notifications
  {
    id: 'n6',
    type: 'repost',
    userId: 'u2',
    postId: 'p1',
    tweetId: 'p1',
    content: null,
    createdAt: new Date(now - 2.5 * HOUR).toISOString(),
    read: false,
  },
  {
    id: 'n7',
    type: 'repost',
    userId: 'u4',
    postId: 'p1',
    tweetId: 'p1',
    content: null,
    createdAt: new Date(now - 4 * HOUR).toISOString(),
    read: true,
  },
  // 2 reply notifications
  {
    id: 'n8',
    type: 'reply',
    userId: 'u2',
    postId: 'p1',
    tweetId: 'p1',
    content: 'This is incredible! 40% is a massive improvement. What framework are you using?',
    createdAt: new Date(now - 1.5 * HOUR).toISOString(),
    read: true,
  },
  {
    id: 'n9',
    type: 'reply',
    userId: 'u5',
    postId: 'p1',
    tweetId: 'p1',
    content: 'Congrats on the launch! The performance gains are noticeable on our end too.',
    createdAt: new Date(now - 1 * HOUR).toISOString(),
    read: true,
  },
  // 1 mention notification
  {
    id: 'n10',
    type: 'mention',
    userId: 'u2',
    postId: 'p11',
    tweetId: 'p11',
    content: '@alexj That 40% improvement is impressive. What was the main bottleneck you identified?',
    createdAt: new Date(now - 1.5 * HOUR).toISOString(),
    read: false,
  },
];

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv1',
    participants: ['u1', 'u2'],
    lastMessageId: 'dm6',
    lastMessageAt: new Date(now - 30 * 60000).toISOString(),
    isPinned: false,
    unreadCount: 2,
  },
  {
    id: 'conv2',
    participants: ['u1', 'u5'],
    lastMessageId: 'dm10',
    lastMessageAt: new Date(now - 3 * HOUR).toISOString(),
    isPinned: false,
    unreadCount: 0,
  },
  {
    id: 'conv3',
    participants: ['u1', 'u6'],
    lastMessageId: 'dm13',
    lastMessageAt: new Date(now - 5 * HOUR).toISOString(),
    isPinned: false,
    unreadCount: 1,
  },
  {
    id: 'conv4',
    participants: ['u1', 'u3'],
    lastMessageId: 'dm15',
    lastMessageAt: new Date(now - 1 * DAY).toISOString(),
    isPinned: false,
    unreadCount: 0,
  },
];

export const INITIAL_DIRECT_MESSAGES = [
  // conv1: Alex + Sarah — planning a coffee meetup
  { id: 'dm1', conversationId: 'conv1', senderId: 'u2', content: 'Hey Alex! I saw your API performance post. Really impressive work.', createdAt: new Date(now - 4 * HOUR).toISOString(), read: true },
  { id: 'dm2', conversationId: 'conv1', senderId: 'u1', content: 'Thanks Sarah! It was a lot of work but totally worth it.', createdAt: new Date(now - 3.5 * HOUR).toISOString(), read: true },
  { id: 'dm3', conversationId: 'conv1', senderId: 'u2', content: 'Would you be up for a coffee chat sometime this week? I\'d love to hear more about your approach.', createdAt: new Date(now - 3 * HOUR).toISOString(), read: true },
  { id: 'dm4', conversationId: 'conv1', senderId: 'u1', content: 'Absolutely! How about Thursday afternoon? There\'s a great spot near Union Square.', createdAt: new Date(now - 2 * HOUR).toISOString(), read: true },
  { id: 'dm5', conversationId: 'conv1', senderId: 'u2', content: 'Thursday works perfectly! Let\'s say 2pm?', createdAt: new Date(now - 1 * HOUR).toISOString(), read: false },
  { id: 'dm6', conversationId: 'conv1', senderId: 'u2', content: 'Also, I might bring my colleague who\'s working on something similar.', createdAt: new Date(now - 30 * 60000).toISOString(), read: false },

  // conv2: Alex + Emma — discussing a design project
  { id: 'dm7', conversationId: 'conv2', senderId: 'u1', content: 'Hey Emma! Love the new design system you shared. Mind if I pick your brain about component architecture?', createdAt: new Date(now - 8 * HOUR).toISOString(), read: true },
  { id: 'dm8', conversationId: 'conv2', senderId: 'u5', content: 'Of course! Happy to help. What are you working on?', createdAt: new Date(now - 7 * HOUR).toISOString(), read: true },
  { id: 'dm9', conversationId: 'conv2', senderId: 'u1', content: 'We\'re building a component library for our developer tools. I want to make sure the design tokens are scalable.', createdAt: new Date(now - 5 * HOUR).toISOString(), read: true },
  { id: 'dm10', conversationId: 'conv2', senderId: 'u5', content: 'That sounds great! I\'d recommend starting with spacing and color tokens first. I can share our Figma template.', createdAt: new Date(now - 3 * HOUR).toISOString(), read: true },

  // conv3: Alex + David — sharing a startup idea
  { id: 'dm11', conversationId: 'conv3', senderId: 'u6', content: 'Alex, I\'ve been thinking about a collaboration. Our platforms could integrate really well.', createdAt: new Date(now - 8 * HOUR).toISOString(), read: true },
  { id: 'dm12', conversationId: 'conv3', senderId: 'u1', content: 'That\'s an interesting idea! What kind of integration were you thinking?', createdAt: new Date(now - 7 * HOUR).toISOString(), read: true },
  { id: 'dm13', conversationId: 'conv3', senderId: 'u6', content: 'API-level integration. Your performance tools + our creator platform. Let me put together a quick proposal.', createdAt: new Date(now - 5 * HOUR).toISOString(), read: false },

  // conv4: Alex + Mike — photography tips
  { id: 'dm14', conversationId: 'conv4', senderId: 'u1', content: 'Those Venice Beach shots were amazing! What camera are you using?', createdAt: new Date(now - 1.5 * DAY).toISOString(), read: true },
  { id: 'dm15', conversationId: 'conv4', senderId: 'u3', content: 'Thanks! Sony A7IV with a 24-70mm f/2.8. Golden hour does most of the work though!', createdAt: new Date(now - 1 * DAY).toISOString(), read: true },
];

export const INITIAL_LISTS = [
  {
    id: 'list1',
    name: 'Tech News',
    description: 'Latest updates from tech industry leaders and publications',
    ownerId: 'u1',
    memberIds: ['u4', 'u7', 'u6'],
    followerIds: [],
    isPrivate: false,
    createdAt: '2025-06-01T00:00:00Z',
    bannerUrl: null,
  },
  {
    id: 'list2',
    name: 'Close Friends',
    description: 'Personal connections and close collaborators',
    ownerId: 'u1',
    memberIds: ['u2', 'u3', 'u5'],
    followerIds: [],
    isPrivate: true,
    createdAt: '2025-09-15T00:00:00Z',
    bannerUrl: null,
  },
];

export const INITIAL_TRENDS = [
  { id: 't1', category: 'Technology · Trending', name: '#WebDev', postCount: '28.5K' },
  { id: 't2', category: 'Trending in US', name: '#AI', postCount: '142K' },
  { id: 't3', category: 'Sports · Trending', name: 'Super Bowl', postCount: '1.2M' },
  { id: 't4', category: 'Entertainment', name: '#Oscars2026', postCount: '89K' },
  { id: 't5', category: 'Technology', name: 'React 20', postCount: '15.3K' },
  { id: 't6', category: 'Business · Trending', name: 'Startup Funding', postCount: '8.7K' },
  { id: 't7', category: 'Trending in US', name: 'Climate Action', postCount: '45.2K' },
  { id: 't8', category: 'Gaming · Trending', name: '#GTA6', postCount: '234K' },
  { id: 't9', category: 'Science', name: 'Mars Mission', postCount: '12.1K' },
  { id: 't10', category: 'Music · Trending', name: 'Album Drop', postCount: '67K' },
];

export const INITIAL_BOOKMARKED_POST_IDS = ['p3', 'p2', 'p8'];

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'x_clone_state';
const BASE_INITIAL_KEY = 'x_clone_initialState';

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
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Data normalizers for malformed POST data ---

function normalizeUser(user, index) {
  return {
    id: user.id || `user_custom_${index}`,
    name: user.name || user.displayName || user.username || `User ${index}`,
    handle: user.handle || user.username || user.screen_name || `user${index}`,
    bio: user.bio || user.description || user.about || '',
    avatar: user.avatar || user.profileImage || user.profile_image || `https://i.pravatar.cc/150?u=custom_${index}`,
    banner: user.banner || user.coverImage || user.cover_image || `https://picsum.photos/seed/banner_custom_${index}/600/200`,
    location: user.location || '',
    website: user.website || '',
    joinedDate: user.joinedDate || user.joined || user.createdAt || user.created_at || new Date().toISOString(),
    verified: typeof user.verified === 'boolean' ? user.verified : false,
    followers: Array.isArray(user.followers) ? user.followers : [],
    following: Array.isArray(user.following) ? user.following : [],
    pinnedPostId: user.pinnedPostId || null,
  };
}

function normalizeTweet(tweet, index) {
  return {
    id: tweet.id || `tweet_custom_${index}`,
    userId: tweet.userId || tweet.user_id || tweet.authorId || tweet.author_id || CURRENT_USER_ID,
    content: tweet.content || tweet.text || tweet.body || tweet.message || '',
    images: Array.isArray(tweet.images) ? tweet.images : (Array.isArray(tweet.media) ? tweet.media : []),
    createdAt: tweet.createdAt || tweet.created_at || tweet.timestamp || tweet.date || new Date().toISOString(),
    likes: Array.isArray(tweet.likes) ? tweet.likes : [],
    reposts: Array.isArray(tweet.reposts) ? tweet.reposts : (Array.isArray(tweet.retweets) ? tweet.retweets : []),
    retweets: Array.isArray(tweet.retweets) ? tweet.retweets : (Array.isArray(tweet.reposts) ? tweet.reposts : []),
    replies: Array.isArray(tweet.replies) ? tweet.replies : [],
    bookmarks: Array.isArray(tweet.bookmarks) ? tweet.bookmarks : [],
    quotedPostId: tweet.quotedPostId || null,
    inReplyToPostId: tweet.inReplyToPostId || null,
    inReplyToUserId: tweet.inReplyToUserId || null,
    views: typeof tweet.views === 'number' ? tweet.views : 0,
  };
}

function normalizeReply(reply, index) {
  return {
    id: reply.id || `reply_custom_${index}`,
    tweetId: reply.tweetId || reply.tweet_id || reply.postId || reply.post_id || reply.parentId || reply.parent_id || '',
    postId: reply.postId || reply.post_id || reply.tweetId || reply.tweet_id || reply.parentId || reply.parent_id || '',
    userId: reply.userId || reply.user_id || reply.authorId || reply.author_id || CURRENT_USER_ID,
    content: reply.content || reply.text || reply.body || reply.message || '',
    createdAt: reply.createdAt || reply.created_at || reply.timestamp || reply.date || new Date().toISOString(),
    likes: Array.isArray(reply.likes) ? reply.likes : [],
  };
}

function normalizeNotification(notif, index) {
  const validTypes = ['like', 'repost', 'retweet', 'follow', 'reply', 'mention'];
  let type = notif.type || notif.kind || notif.action || 'like';
  if (!validTypes.includes(type)) type = 'like';

  return {
    id: notif.id || `notif_custom_${index}`,
    type,
    userId: notif.userId || notif.user_id || notif.fromUserId || notif.from_user_id || '',
    postId: notif.postId || notif.post_id || notif.tweetId || notif.tweet_id || null,
    tweetId: notif.tweetId || notif.tweet_id || notif.postId || notif.post_id || null,
    content: notif.content || null,
    createdAt: notif.createdAt || notif.created_at || notif.timestamp || notif.date || new Date().toISOString(),
    read: typeof notif.read === 'boolean' ? notif.read : false,
  };
}

function normalizeConversation(conv, index) {
  return {
    id: conv.id || `conv_custom_${index}`,
    participants: Array.isArray(conv.participants) ? conv.participants : [],
    lastMessageId: conv.lastMessageId || null,
    lastMessageAt: conv.lastMessageAt || conv.updatedAt || new Date().toISOString(),
    isPinned: typeof conv.isPinned === 'boolean' ? conv.isPinned : false,
    unreadCount: typeof conv.unreadCount === 'number' ? conv.unreadCount : 0,
  };
}

function normalizeDirectMessage(dm, index) {
  return {
    id: dm.id || `dm_custom_${index}`,
    conversationId: dm.conversationId || dm.conversation_id || '',
    senderId: dm.senderId || dm.sender_id || dm.from || '',
    content: dm.content || dm.text || dm.message || '',
    createdAt: dm.createdAt || dm.created_at || dm.timestamp || new Date().toISOString(),
    read: typeof dm.read === 'boolean' ? dm.read : false,
  };
}

function normalizeList(list, index) {
  return {
    id: list.id || `list_custom_${index}`,
    name: list.name || `List ${index}`,
    description: list.description || '',
    ownerId: list.ownerId || list.owner_id || CURRENT_USER_ID,
    memberIds: Array.isArray(list.memberIds) ? list.memberIds : (Array.isArray(list.members) ? list.members : []),
    followerIds: Array.isArray(list.followerIds) ? list.followerIds : [],
    isPrivate: typeof list.isPrivate === 'boolean' ? list.isPrivate : false,
    createdAt: list.createdAt || list.created_at || new Date().toISOString(),
    bannerUrl: list.bannerUrl || null,
  };
}

function normalizeTrend(trend, index) {
  return {
    id: trend.id || `t_custom_${index}`,
    category: trend.category || 'Trending',
    name: trend.name || trend.topic || trend.hashtag || `Trend ${index}`,
    postCount: trend.postCount || trend.post_count || trend.tweets || '0',
  };
}

const arrayNormalizers = {
  users: normalizeUser,
  tweets: normalizeTweet,
  posts: normalizeTweet,
  replies: normalizeReply,
  notifications: normalizeNotification,
  conversations: normalizeConversation,
  directMessages: normalizeDirectMessage,
  lists: normalizeList,
  trends: normalizeTrend,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (key === 'bookmarkedPostIds' && Array.isArray(custom[key])) {
        result[key] = custom[key];
      } else if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item, index) => arrayNormalizers[key](item, index));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export function createDefaultData() {
  return {
    users: INITIAL_USERS,
    tweets: INITIAL_TWEETS,
    replies: INITIAL_REPLIES,
    notifications: INITIAL_NOTIFICATIONS,
    conversations: INITIAL_CONVERSATIONS,
    directMessages: INITIAL_DIRECT_MESSAGES,
    lists: INITIAL_LISTS,
    trends: INITIAL_TRENDS,
    bookmarkedPostIds: INITIAL_BOOKMARKED_POST_IDS,
    mutedUsers: [],
    blockedUsers: [],
    notInterestedPostIds: [],
    currentUser: INITIAL_USERS.find(u => u.id === CURRENT_USER_ID),
  };
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = { ...createDefaultData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = createDefaultData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
