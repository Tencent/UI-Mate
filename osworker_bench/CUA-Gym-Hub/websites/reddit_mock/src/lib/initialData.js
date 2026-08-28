const BASE_STORAGE_KEY = 'reddit_clone_data';
const BASE_INITIAL_KEY = 'reddit_clone_initial';

// Get session-specific storage keys
function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

// Read sid from URL query string or sessionStorage (survives refresh + SPA navigation)
export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
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
    console.log('No custom state available');
  }
  return null;
};

// Save current state to session-specific localStorage
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

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  // If custom state provided (first load with session), merge with defaults
  if (customState) {
    const data = { ...createInitialData(), ...customState };
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  // Load from session-specific localStorage (refresh case)
  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) {
      localStorage.setItem(ik, stored);
    }
    return JSON.parse(stored);
  }

  // No session data, no custom state -> create defaults
  const data = createInitialData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

// --- Normalization helpers for array fields ---

function normalizeUser(user, index) {
  return {
    id: user.id || `u_custom_${index}`,
    username: user.username || `user_${index}`,
    avatar: user.avatar || `https://picsum.photos/100/100?random=u${index}`,
    postKarma: typeof user.postKarma === 'number' ? user.postKarma : (typeof user.karma === 'number' ? user.karma : 0),
    commentKarma: typeof user.commentKarma === 'number' ? user.commentKarma : 0,
    cakeDay: user.cakeDay || new Date().toISOString(),
    about: user.about || '',
  };
}

function normalizeCurrentUser(user) {
  return {
    id: user.id || 'u1',
    username: user.username || 'redditor_42',
    avatar: user.avatar || 'https://picsum.photos/100/100?random=u1',
    postKarma: typeof user.postKarma === 'number' ? user.postKarma : (typeof user.karma === 'number' ? user.karma : 0),
    commentKarma: typeof user.commentKarma === 'number' ? user.commentKarma : 0,
    cakeDay: user.cakeDay || new Date().toISOString(),
    about: user.about || '',
    joinedSubreddits: Array.isArray(user.joinedSubreddits) ? user.joinedSubreddits : [],
    savedPosts: Array.isArray(user.savedPosts) ? user.savedPosts : [],
    savedComments: Array.isArray(user.savedComments) ? user.savedComments : [],
    hiddenPosts: Array.isArray(user.hiddenPosts) ? user.hiddenPosts : [],
    reportedPosts: Array.isArray(user.reportedPosts) ? user.reportedPosts : [],
  };
}

function normalizeSubreddit(sub, index) {
  return {
    id: sub.id || `s_custom_${index}`,
    name: sub.name || `subreddit_${index}`,
    description: sub.description || '',
    icon: sub.icon || `https://picsum.photos/64/64?random=s${index}`,
    bannerColor: sub.bannerColor || '#0079D3',
    members: typeof sub.members === 'number' ? sub.members : 0,
    online: typeof sub.online === 'number' ? sub.online : 0,
    created: sub.created || new Date().toISOString(),
    rules: Array.isArray(sub.rules) ? sub.rules : [],
    moderators: Array.isArray(sub.moderators) ? sub.moderators : [],
    flairs: Array.isArray(sub.flairs) ? sub.flairs : [],
  };
}

function normalizePost(post, index) {
  return {
    id: post.id || `p_custom_${index}`,
    subredditId: post.subredditId || '',
    userId: post.userId || '',
    title: post.title || 'Untitled',
    content: post.content || '',
    type: post.type || 'text',
    url: post.url || null,
    flairId: post.flairId || null,
    upvotes: typeof post.upvotes === 'number' ? post.upvotes : 0,
    downvotes: typeof post.downvotes === 'number' ? post.downvotes : 0,
    created: post.created || new Date().toISOString(),
    isStickied: !!post.isStickied,
    isLocked: !!post.isLocked,
    isSpoiler: !!post.isSpoiler,
    isNSFW: !!post.isNSFW,
    commentIds: Array.isArray(post.commentIds) ? post.commentIds : (Array.isArray(post.comments) ? post.comments : []),
    awards: Array.isArray(post.awards) ? post.awards : [],
    pollOptions: Array.isArray(post.pollOptions) ? post.pollOptions : null,
  };
}

function normalizeComment(comment, index) {
  return {
    id: comment.id || `c_custom_${index}`,
    postId: comment.postId || '',
    parentId: comment.parentId || null,
    userId: comment.userId || '',
    content: comment.content || '',
    upvotes: typeof comment.upvotes === 'number' ? comment.upvotes : 0,
    downvotes: typeof comment.downvotes === 'number' ? comment.downvotes : 0,
    created: comment.created || new Date().toISOString(),
    isEdited: !!comment.isEdited,
    isDistinguished: !!comment.isDistinguished,
    awards: Array.isArray(comment.awards) ? comment.awards : [],
  };
}

function normalizeVote(vote, index) {
  return {
    id: vote.id || `v_custom_${index}`,
    userId: vote.userId || '',
    targetId: vote.targetId || '',
    targetType: vote.targetType || vote.type || 'post',
    value: typeof vote.value === 'number' ? vote.value : 1,
  };
}

function normalizeNotification(n, index) {
  return {
    id: n.id || `n_custom_${index}`,
    type: n.type || 'reply',
    fromUserId: n.fromUserId || '',
    postId: n.postId || null,
    commentId: n.commentId || null,
    content: n.content || '',
    read: !!n.read,
    created: n.created || new Date().toISOString(),
  };
}

function normalizeAward(award, index) {
  return {
    id: award.id || `award_custom_${index}`,
    name: award.name || 'Award',
    icon: award.icon || '',
    cost: typeof award.cost === 'number' ? award.cost : 0,
  };
}

// Deep merge custom state with defaults (custom takes precedence)
function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;

  const result = { ...defaults };

  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (key === 'currentUser' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        result[key] = normalizeCurrentUser({ ...defaults[key], ...custom[key] });
      } else if (key === 'users' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((u, i) => normalizeUser(u, i));
      } else if (key === 'subreddits' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((s, i) => normalizeSubreddit(s, i));
      } else if (key === 'posts' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((p, i) => normalizePost(p, i));
      } else if (key === 'comments' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((c, i) => normalizeComment(c, i));
      } else if (key === 'votes' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((v, i) => normalizeVote(v, i));
      } else if (key === 'notifications' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((n, i) => normalizeNotification(n, i));
      } else if (key === 'awards' && Array.isArray(custom[key])) {
        result[key] = custom[key].map((a, i) => normalizeAward(a, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object') {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }

  return result;
}

const createInitialData = () => {
  const now = Date.now();
  const HOUR = 3600000;
  const DAY = 86400000;

  return {
    currentUser: {
      id: "u1",
      username: "redditor_42",
      avatar: "https://picsum.photos/100/100?random=u1",
      postKarma: 3450,
      commentKarma: 8920,
      cakeDay: "2021-03-15T00:00:00.000Z",
      about: "Just a regular redditor. I love tech, gaming, and cats.",
      joinedSubreddits: ["s1", "s2", "s3", "s4", "s5", "s6"],
      savedPosts: [],
      savedComments: [],
      hiddenPosts: [],
    },
    users: [
      {
        id: "u1",
        username: "redditor_42",
        avatar: "https://picsum.photos/100/100?random=u1",
        postKarma: 3450,
        commentKarma: 8920,
        cakeDay: "2021-03-15T00:00:00.000Z",
        about: "Just a regular redditor. I love tech, gaming, and cats.",
      },
      {
        id: "u2",
        username: "tech_guru_99",
        avatar: "https://picsum.photos/100/100?random=u2",
        postKarma: 45200,
        commentKarma: 12800,
        cakeDay: "2019-06-22T00:00:00.000Z",
        about: "Software engineer by day, hardware enthusiast by night.",
      },
      {
        id: "u3",
        username: "astro_nerd",
        avatar: "https://picsum.photos/100/100?random=u3",
        postKarma: 22100,
        commentKarma: 31500,
        cakeDay: "2020-01-10T00:00:00.000Z",
        about: "PhD candidate in astrophysics. Space is cool.",
      },
      {
        id: "u4",
        username: "pixel_artist",
        avatar: "https://picsum.photos/100/100?random=u4",
        postKarma: 89400,
        commentKarma: 5600,
        cakeDay: "2019-11-03T00:00:00.000Z",
        about: "Digital artist and game designer. Portfolio in pinned post.",
      },
      {
        id: "u5",
        username: "history_buff",
        avatar: "https://picsum.photos/100/100?random=u5",
        postKarma: 15700,
        commentKarma: 42300,
        cakeDay: "2020-08-18T00:00:00.000Z",
        about: "History teacher. Ask me about ancient Rome!",
      },
      {
        id: "u6",
        username: "code_monkey",
        avatar: "https://picsum.photos/100/100?random=u6",
        postKarma: 8900,
        commentKarma: 19200,
        cakeDay: "2022-02-14T00:00:00.000Z",
        about: "Full-stack dev. Rust evangelist. Coffee addict.",
      },
      {
        id: "u7",
        username: "nature_lover",
        avatar: "https://picsum.photos/100/100?random=u7",
        postKarma: 67300,
        commentKarma: 3200,
        cakeDay: "2021-07-30T00:00:00.000Z",
        about: "Wildlife photographer. National Geographic contributor.",
      },
      {
        id: "u8",
        username: "debate_champion",
        avatar: "https://picsum.photos/100/100?random=u8",
        postKarma: 2100,
        commentKarma: 55800,
        cakeDay: "2023-04-05T00:00:00.000Z",
        about: "Philosophy grad. I argue for fun.",
      },
    ],
    subreddits: [
      {
        id: "s1",
        name: "technology",
        description: "Subreddit dedicated to the news and discussions about the creation and use of technology and its surrounding issues.",
        icon: "https://picsum.photos/64/64?random=s1",
        bannerColor: "#0079D3",
        members: 14500000,
        online: 12000,
        created: "2008-01-25T00:00:00.000Z",
        rules: [
          "Submissions must be about technology",
          "No images, audio, or video",
          "Titles must be from the article",
          "No personal attacks",
          "No self-promotion or spam"
        ],
        moderators: ["u2", "u5"],
        flairs: [
          { id: "f1", text: "Discussion", color: "#0079D3", bgColor: "#E3F2FD" },
          { id: "f2", text: "News", color: "#FF4500", bgColor: "#FFF3E0" },
          { id: "f3", text: "Software", color: "#46D160", bgColor: "#E8F5E9" },
          { id: "f4", text: "Hardware", color: "#9C27B0", bgColor: "#F3E5F5" }
        ]
      },
      {
        id: "s2",
        name: "funny",
        description: "Welcome to r/funny, Xeddit's largest humour depository.",
        icon: "https://picsum.photos/64/64?random=s2",
        bannerColor: "#FF4500",
        members: 45000000,
        online: 85000,
        created: "2008-01-25T00:00:00.000Z",
        rules: [
          "All posts must make an attempt at humor",
          "No memes or memetic content",
          "No reposts",
          "No politics or political figures"
        ],
        moderators: ["u4"],
        flairs: [
          { id: "f5", text: "Meme", color: "#FF4500", bgColor: "#FFF3E0" },
          { id: "f6", text: "OC", color: "#0079D3", bgColor: "#E3F2FD" },
          { id: "f7", text: "Repost", color: "#787C7E", bgColor: "#F2F2F2" },
          { id: "f8", text: "Wholesome", color: "#46D160", bgColor: "#E8F5E9" }
        ]
      },
      {
        id: "s3",
        name: "programming",
        description: "Computer Programming",
        icon: "https://picsum.photos/64/64?random=s3",
        bannerColor: "#1DB954",
        members: 5200000,
        online: 4500,
        created: "2009-03-15T00:00:00.000Z",
        rules: [
          "No direct links to images",
          "Keep it civil and on-topic",
          "No job postings",
          "Titles must be descriptive",
          "No homework questions"
        ],
        moderators: ["u6"],
        flairs: [
          { id: "f9", text: "Question", color: "#0079D3", bgColor: "#E3F2FD" },
          { id: "f10", text: "Show & Tell", color: "#FF4500", bgColor: "#FFF3E0" },
          { id: "f11", text: "Article", color: "#9C27B0", bgColor: "#F3E5F5" },
          { id: "f12", text: "Tutorial", color: "#46D160", bgColor: "#E8F5E9" }
        ]
      },
      {
        id: "s4",
        name: "science",
        description: "This community is a place to share and discuss new scientific research. Read about the latest advances in astronomy, biology, medicine, physics, social science, and more.",
        icon: "https://picsum.photos/64/64?random=s4",
        bannerColor: "#7B1FA2",
        members: 31000000,
        online: 22000,
        created: "2008-03-14T00:00:00.000Z",
        rules: [
          "Peer-reviewed research only",
          "No editorialized titles",
          "No blogspam, rehosted content, or lay summaries",
          "Comments must be on topic and contribute to the discussion"
        ],
        moderators: ["u3", "u5"],
        flairs: [
          { id: "f13", text: "Biology", color: "#46D160", bgColor: "#E8F5E9" },
          { id: "f14", text: "Physics", color: "#0079D3", bgColor: "#E3F2FD" },
          { id: "f15", text: "Chemistry", color: "#FF4500", bgColor: "#FFF3E0" },
          { id: "f16", text: "Research", color: "#9C27B0", bgColor: "#F3E5F5" }
        ]
      },
      {
        id: "s5",
        name: "gaming",
        description: "A subreddit for (almost) anything related to games - video games, board games, card games, etc. (but not sports).",
        icon: "https://picsum.photos/64/64?random=s5",
        bannerColor: "#E91E63",
        members: 38000000,
        online: 95000,
        created: "2008-06-10T00:00:00.000Z",
        rules: [
          "No spam, selling, or begging",
          "Follow Xeddit's rules of conduct",
          "Mark spoilers and NSFW content",
          "No giveaways or surveys",
          "No piracy or key reselling"
        ],
        moderators: ["u4"],
        flairs: [
          { id: "f17", text: "Discussion", color: "#0079D3", bgColor: "#E3F2FD" },
          { id: "f18", text: "Screenshot", color: "#FF4500", bgColor: "#FFF3E0" },
          { id: "f19", text: "News", color: "#46D160", bgColor: "#E8F5E9" },
          { id: "f20", text: "Review", color: "#9C27B0", bgColor: "#F3E5F5" }
        ]
      },
      {
        id: "s6",
        name: "AskReddit",
        description: "r/AskReddit is the place to ask and answer thought-provoking questions.",
        icon: "https://picsum.photos/64/64?random=s6",
        bannerColor: "#FF6F00",
        members: 42000000,
        online: 110000,
        created: "2008-01-25T00:00:00.000Z",
        rules: [
          "Questions must be open-ended",
          "No personal advice requests",
          "No yes/no questions",
          "Be respectful"
        ],
        moderators: ["u5", "u8"],
        flairs: [
          { id: "f21", text: "Serious", color: "#D32F2F", bgColor: "#FFEBEE" },
          { id: "f22", text: "Discussion", color: "#0079D3", bgColor: "#E3F2FD" },
          { id: "f23", text: "Stories", color: "#FF4500", bgColor: "#FFF3E0" },
          { id: "f24", text: "Advice", color: "#46D160", bgColor: "#E8F5E9" }
        ]
      }
    ],
    posts: [
      // --- Stickied post in r/technology ---
      {
        id: "p1",
        subredditId: "s1",
        userId: "u2",
        title: "Weekly Discussion Thread: What tech are you excited about in 2026?",
        content: "Welcome to our weekly discussion thread! This is the place to share what technology trends, products, or innovations you're most excited about this year.\n\nPlease keep discussions civil and on-topic. Share links to articles or resources when possible.\n\nRemember to follow all subreddit rules.",
        type: "text",
        url: null,
        flairId: "f1",
        upvotes: 892,
        downvotes: 34,
        created: new Date(now - 6 * HOUR).toISOString(),
        isStickied: true,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c1", "c2", "c3", "c1_1", "c1_2", "c2_1"],
        awards: ["gold", "helpful"],
      },
      // --- Viral AI post ---
      {
        id: "p2",
        subredditId: "s1",
        userId: "u3",
        title: "The future of AI is here, and it's changing everything we know about work",
        content: "Artificial Intelligence has made massive strides in the last few years. From generative art to coding assistants, the landscape is shifting rapidly. Companies are now deploying AI agents that can handle complex multi-step tasks autonomously.\n\nWhat's particularly interesting is how this is affecting the job market. Rather than replacing jobs entirely, AI seems to be augmenting human capabilities in ways we didn't expect. Developers are shipping code faster, designers are iterating more quickly, and researchers are finding patterns in data that would have taken years to discover.\n\nThe question remains: where does this trajectory take us in the next 5-10 years? I'd love to hear your thoughts on the implications for education, employment, and creativity.",
        type: "text",
        url: null,
        flairId: "f2",
        upvotes: 14500,
        downvotes: 230,
        created: new Date(now - 2 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c4", "c5", "c6", "c7", "c4_1", "c4_2", "c5_1", "c6_1"],
        awards: ["gold", "silver", "helpful", "mind_blown"],
      },
      // --- Image post in r/funny ---
      {
        id: "p3",
        subredditId: "s2",
        userId: "u4",
        title: "My cat figured out how to open doors and now nothing is safe",
        content: "",
        type: "image",
        url: "https://picsum.photos/800/600?random=cat_door",
        flairId: "f6",
        upvotes: 25400,
        downvotes: 120,
        created: new Date(now - 5 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c8", "c9", "c10", "c8_1"],
        awards: ["wholesome", "wholesome", "hugz", "silver"],
      },
      // --- Link post in r/programming ---
      {
        id: "p4",
        subredditId: "s3",
        userId: "u6",
        title: "Why Rust is becoming the favorite language for systems programming",
        content: "",
        type: "link",
        url: "https://rust-lang.org",
        flairId: "f11",
        upvotes: 3200,
        downvotes: 45,
        created: new Date(now - 24 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c11", "c12", "c11_1"],
        awards: ["helpful"],
      },
      // --- Post by currentUser (u1) for edit/delete testing ---
      {
        id: "p5",
        subredditId: "s3",
        userId: "u1",
        title: "Just built my first CLI tool in Go and it actually works!",
        content: "After months of learning Go on the side, I finally built something useful: a CLI tool that monitors my Docker containers and sends Slack notifications when something crashes.\n\nThe code is messy but it works. Planning to refactor and open-source it this weekend. Anyone interested in contributing?",
        type: "text",
        url: null,
        flairId: "f10",
        upvotes: 487,
        downvotes: 12,
        created: new Date(now - 8 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c13", "c14", "c13_1"],
        awards: ["helpful", "rocket"],
      },
      // --- Science post with image ---
      {
        id: "p6",
        subredditId: "s4",
        userId: "u3",
        title: "New research suggests dark matter may interact with itself through a previously unknown force",
        content: "A team at CERN has published findings suggesting dark matter particles may interact with each other through a force we haven't characterized yet. This could reshape our understanding of galaxy formation and the large-scale structure of the universe.\n\nThe study analyzed gravitational lensing data from over 10,000 galaxy clusters and found anomalies that can't be explained by current dark matter models. The researchers propose a new \"dark force\" that acts between dark matter particles at very short ranges.",
        type: "text",
        url: null,
        flairId: "f16",
        upvotes: 8900,
        downvotes: 67,
        created: new Date(now - 10 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c15", "c16", "c17", "c15_1"],
        awards: ["gold", "mind_blown", "mind_blown"],
      },
      // --- Gaming screenshot ---
      {
        id: "p7",
        subredditId: "s5",
        userId: "u4",
        title: "After 200 hours in Elden Ring, I finally beat Malenia at level 1",
        content: "",
        type: "image",
        url: "https://picsum.photos/1200/675?random=elden_ring",
        flairId: "f18",
        upvotes: 15200,
        downvotes: 180,
        created: new Date(now - 4 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c18", "c19", "c18_1"],
        awards: ["gold", "rocket", "wholesome"],
      },
      // --- AskReddit stickied post ---
      {
        id: "p8",
        subredditId: "s6",
        userId: "u5",
        title: "[Serious] What's a piece of advice you wish someone had given you 10 years ago?",
        content: "",
        type: "text",
        url: null,
        flairId: "f21",
        upvotes: 45200,
        downvotes: 340,
        created: new Date(now - 12 * HOUR).toISOString(),
        isStickied: true,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c20", "c21", "c22", "c23", "c20_1", "c20_2", "c21_1"],
        awards: ["gold", "platinum", "wholesome", "helpful", "helpful"],
      },
      // --- Image post in r/funny ---
      {
        id: "p9",
        subredditId: "s2",
        userId: "u7",
        title: "Tried to take a panoramic photo of my dog. Nailed it.",
        content: "",
        type: "image",
        url: "https://picsum.photos/900/500?random=panoramic_dog",
        flairId: "f5",
        upvotes: 32100,
        downvotes: 210,
        created: new Date(now - 3 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c24", "c25"],
        awards: ["hugz", "wholesome", "silver"],
      },
      // --- Link post in r/science ---
      {
        id: "p10",
        subredditId: "s4",
        userId: "u5",
        title: "Study finds that reading fiction improves empathy and social cognition more than non-fiction",
        content: "",
        type: "link",
        url: "https://arxiv.org/abs/2401.12345",
        flairId: "f13",
        upvotes: 5600,
        downvotes: 89,
        created: new Date(now - 18 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c26", "c27"],
        awards: ["helpful"],
      },
      // --- Second post by currentUser (u1) ---
      {
        id: "p11",
        subredditId: "s5",
        userId: "u1",
        title: "What game has the best soundtrack of all time? I'll start: Hollow Knight",
        content: "Christopher Larkin absolutely killed it with the Hollow Knight soundtrack. Every area has a unique, atmospheric track that perfectly complements the gameplay. City of Tears is still my go-to study music.\n\nWhat are your picks for best gaming soundtracks? I'm always looking for new ones to add to my playlist.",
        type: "text",
        url: null,
        flairId: "f17",
        upvotes: 1240,
        downvotes: 28,
        created: new Date(now - 15 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c28", "c29"],
        awards: [],
      },
      // --- Locked post ---
      {
        id: "p12",
        subredditId: "s6",
        userId: "u8",
        title: "What hill are you willing to die on that most people disagree with?",
        content: "",
        type: "text",
        url: null,
        flairId: "f22",
        upvotes: 8700,
        downvotes: 450,
        created: new Date(now - 36 * HOUR).toISOString(),
        isStickied: false,
        isLocked: true,
        isSpoiler: false,
        isNSFW: false,
        commentIds: ["c30", "c31"],
        awards: ["silver"],
      },
      // --- Link post in r/technology ---
      {
        id: "p13",
        subredditId: "s1",
        userId: "u2",
        title: "Apple announces M5 chip with 40% performance improvement and dedicated AI cores",
        content: "",
        type: "link",
        url: "https://www.apple.com/newsroom/2026/",
        flairId: "f4",
        upvotes: 6300,
        downvotes: 156,
        created: new Date(now - 7 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: [],
        awards: ["rocket"],
      },
      // --- Gaming news ---
      {
        id: "p14",
        subredditId: "s5",
        userId: "u7",
        title: "GTA VI release date officially confirmed for Fall 2026",
        content: "",
        type: "link",
        url: "https://www.rockstargames.com/gta-vi",
        flairId: "f19",
        upvotes: 41000,
        downvotes: 520,
        created: new Date(now - 1 * HOUR).toISOString(),
        isStickied: false,
        isLocked: false,
        isSpoiler: false,
        isNSFW: false,
        commentIds: [],
        awards: ["gold", "rocket", "rocket", "mind_blown"],
      },
    ],
    comments: [
      // --- Comments on p1 (Weekly Discussion Thread) ---
      {
        id: "c1",
        postId: "p1",
        parentId: null,
        userId: "u3",
        content: "I'm really excited about the advances in quantum computing this year. Google and IBM are both claiming breakthroughs and it feels like we might actually see practical applications soon.",
        upvotes: 145,
        downvotes: 3,
        created: new Date(now - 5.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c1_1",
        postId: "p1",
        parentId: "c1",
        userId: "u6",
        content: "The error correction advances are the real game-changer. Without those, quantum computers are just expensive random number generators.",
        upvotes: 89,
        downvotes: 1,
        created: new Date(now - 5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c1_2",
        postId: "p1",
        parentId: "c1",
        userId: "u1",
        content: "I went to a quantum computing workshop last month. The hands-on lab with Qiskit was really eye-opening. Still can't wrap my head around superposition though lol.",
        upvotes: 42,
        downvotes: 0,
        created: new Date(now - 4.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c2",
        postId: "p1",
        parentId: null,
        userId: "u5",
        content: "Foldable phones are finally getting good enough for daily use. The Galaxy Z Fold 6 addressed most of the durability concerns from previous generations.",
        upvotes: 78,
        downvotes: 12,
        created: new Date(now - 5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: true,
        awards: [],
      },
      {
        id: "c2_1",
        postId: "p1",
        parentId: "c2",
        userId: "u4",
        content: "Agreed, but the crease is still there. Until that's solved, I'm sticking with my regular phone. Cool tech though.",
        upvotes: 34,
        downvotes: 2,
        created: new Date(now - 4.8 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c3",
        postId: "p1",
        parentId: null,
        userId: "u2",
        content: "Great discussion everyone! Keep the ideas flowing. Remember to check out our monthly AMA with tech industry professionals coming up next week.",
        upvotes: 56,
        downvotes: 0,
        created: new Date(now - 4 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: true,
        awards: [],
      },
      // --- Comments on p2 (AI post) ---
      {
        id: "c4",
        postId: "p2",
        parentId: null,
        userId: "u6",
        content: "As a developer, I can confirm AI coding assistants have literally doubled my productivity. I spend less time on boilerplate and more time on architecture decisions. The key is knowing when to trust the AI and when to verify its output.",
        upvotes: 890,
        downvotes: 15,
        created: new Date(now - 1.8 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["helpful"],
      },
      {
        id: "c4_1",
        postId: "p2",
        parentId: "c4",
        userId: "u3",
        content: "Same experience in research. AI tools are incredible for literature review and data analysis. But I've caught some hallucinated citations, so always double-check.",
        upvotes: 340,
        downvotes: 5,
        created: new Date(now - 1.6 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c4_2",
        postId: "p2",
        parentId: "c4",
        userId: "u1",
        content: "This is so true. I've been using GitHub Copilot for about a year now and it's changed how I approach coding. The autocomplete suggestions are shockingly good for common patterns.",
        upvotes: 156,
        downvotes: 2,
        created: new Date(now - 1.4 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c5",
        postId: "p2",
        parentId: null,
        userId: "u8",
        content: "The job market implications are being way overhyped. Every new technology has created more jobs than it destroyed. The printing press didn't kill scribes - it created an entire publishing industry. Same thing will happen here.",
        upvotes: 567,
        downvotes: 89,
        created: new Date(now - 1.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c5_1",
        postId: "p2",
        parentId: "c5",
        userId: "u5",
        content: "While I agree with the historical pattern, the pace of change this time is fundamentally different. Previous industrial revolutions took decades. AI is disrupting multiple industries simultaneously in just a few years.",
        upvotes: 234,
        downvotes: 18,
        created: new Date(now - 1.3 * HOUR).toISOString(),
        isEdited: true,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c6",
        postId: "p2",
        parentId: null,
        userId: "u7",
        content: "I'm a photographer and AI image generators genuinely worry me. Clients are already asking why they should pay for a photoshoot when they can generate images for free. The quality isn't there yet for most use cases, but it's getting better fast.",
        upvotes: 1200,
        downvotes: 45,
        created: new Date(now - 1.2 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["gold"],
      },
      {
        id: "c6_1",
        postId: "p2",
        parentId: "c6",
        userId: "u4",
        content: "As a digital artist, I feel your pain. But I've also started using AI as a brainstorming tool for composition ideas. It's not replacing my work - it's becoming part of my workflow. Adaptation is key.",
        upvotes: 456,
        downvotes: 8,
        created: new Date(now - 1 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c7",
        postId: "p2",
        parentId: null,
        userId: "u2",
        content: "Great post OP. One thing that's often overlooked is the energy consumption. Training a single large language model can consume as much energy as five cars over their entire lifetime. We need to address the sustainability angle.",
        upvotes: 789,
        downvotes: 12,
        created: new Date(now - 0.8 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["helpful"],
      },
      // --- Comments on p3 (Cat door) ---
      {
        id: "c8",
        postId: "p3",
        parentId: null,
        userId: "u1",
        content: "My cat did the same thing! Next step: they learn to use the fridge. Then it's over for all of us.",
        upvotes: 2100,
        downvotes: 8,
        created: new Date(now - 4.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["hugz"],
      },
      {
        id: "c8_1",
        postId: "p3",
        parentId: "c8",
        userId: "u4",
        content: "OP here - she actually HAS figured out the fridge. We had to put a child lock on it. Send help.",
        upvotes: 3400,
        downvotes: 5,
        created: new Date(now - 4.2 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["wholesome", "silver"],
      },
      {
        id: "c9",
        postId: "p3",
        parentId: null,
        userId: "u7",
        content: "This is peak cat behavior. They're just testing their limits before the eventual takeover.",
        upvotes: 890,
        downvotes: 3,
        created: new Date(now - 4 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c10",
        postId: "p3",
        parentId: null,
        userId: "u8",
        content: "r/CatsAreAssholes would love this",
        upvotes: 567,
        downvotes: 2,
        created: new Date(now - 3.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      // --- Comments on p4 (Rust article) ---
      {
        id: "c11",
        postId: "p4",
        parentId: null,
        userId: "u2",
        content: "Rust's memory safety guarantees are a game changer. I've been using it for about 2 years now and the borrow checker, while frustrating at first, has made me a much better programmer overall.",
        upvotes: 234,
        downvotes: 8,
        created: new Date(now - 22 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c11_1",
        postId: "p4",
        parentId: "c11",
        userId: "u6",
        content: "The learning curve is steep but worth it. I always recommend starting with small CLI tools before jumping into anything complex. The Rust Book is an excellent resource.",
        upvotes: 145,
        downvotes: 1,
        created: new Date(now - 21 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c12",
        postId: "p4",
        parentId: null,
        userId: "u8",
        content: "Hot take: Rust is overhyped. For most applications, Go or even modern C++ are perfectly fine and have way larger ecosystems. Rust makes sense for specific use cases, not everything.",
        upvotes: 89,
        downvotes: 67,
        created: new Date(now - 20 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      // --- Comments on p5 (currentUser's Go CLI post) ---
      {
        id: "c13",
        postId: "p5",
        parentId: null,
        userId: "u6",
        content: "Nice work! Go is great for CLI tools. If you're looking to improve the code, I'd recommend using cobra for the CLI framework and viper for configuration management.",
        upvotes: 67,
        downvotes: 0,
        created: new Date(now - 7 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c13_1",
        postId: "p5",
        parentId: "c13",
        userId: "u1",
        content: "Thanks for the suggestions! I'll definitely look into cobra. Right now I'm just using the flag package and it's getting unwieldy.",
        upvotes: 23,
        downvotes: 0,
        created: new Date(now - 6.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c14",
        postId: "p5",
        parentId: null,
        userId: "u2",
        content: "Would love to contribute! Drop the GitHub link when you publish it. Docker monitoring tools are always useful.",
        upvotes: 45,
        downvotes: 0,
        created: new Date(now - 6 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      // --- Comments on p6 (Dark matter) ---
      {
        id: "c15",
        postId: "p6",
        parentId: null,
        userId: "u8",
        content: "I'm skeptical but intrigued. How does this 'dark force' differ from the existing weak nuclear force? Is there a mechanism proposed for the interaction?",
        upvotes: 345,
        downvotes: 5,
        created: new Date(now - 9 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c15_1",
        postId: "p6",
        parentId: "c15",
        userId: "u3",
        content: "Great question. The paper proposes a Yukawa-type potential mediated by a new massive boson. The range is about 1-10 kpc, which is much larger than the weak force but much smaller than gravity at galactic scales. It's purely theoretical at this point but the observational data is compelling.",
        upvotes: 567,
        downvotes: 2,
        created: new Date(now - 8.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["helpful"],
      },
      {
        id: "c16",
        postId: "p6",
        parentId: null,
        userId: "u5",
        content: "This is why I love r/science. Where else can you casually discuss potential new fundamental forces of nature?",
        upvotes: 890,
        downvotes: 8,
        created: new Date(now - 8 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c17",
        postId: "p6",
        parentId: null,
        userId: "u3",
        content: "For those interested in the methodology, the team used data from the Hubble Space Telescope and the Vera C. Rubin Observatory. The statistical significance is above 4 sigma, which is strong but not quite at the discovery threshold of 5 sigma.",
        upvotes: 234,
        downvotes: 1,
        created: new Date(now - 7.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      // --- Comments on p7 (Elden Ring) ---
      {
        id: "c18",
        postId: "p7",
        parentId: null,
        userId: "u1",
        content: "At level 1?! That's insane. I died to Malenia at least 50 times at level 150. What build did you use?",
        upvotes: 456,
        downvotes: 2,
        created: new Date(now - 3.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c18_1",
        postId: "p7",
        parentId: "c18",
        userId: "u4",
        content: "Wretch starting class, no leveling. Used a Cold Uchigatana with Bloodhound Step for the first phase and Rivers of Blood (minimum stats via Talismans) for phase 2. Took me about 3 weeks of attempts.",
        upvotes: 789,
        downvotes: 3,
        created: new Date(now - 3.2 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["gold"],
      },
      {
        id: "c19",
        postId: "p7",
        parentId: null,
        userId: "u7",
        content: "Meanwhile I still can't beat Margit at level 80. This community makes me feel things.",
        upvotes: 1200,
        downvotes: 10,
        created: new Date(now - 3 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["hugz"],
      },
      // --- Comments on p8 (AskReddit stickied) ---
      {
        id: "c20",
        postId: "p8",
        parentId: null,
        userId: "u6",
        content: "Start investing early. Even small amounts. Compound interest is genuinely magic if you start in your 20s. I wish someone had explained index funds to me when I was 18.",
        upvotes: 2100,
        downvotes: 34,
        created: new Date(now - 11 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["gold", "helpful"],
      },
      {
        id: "c20_1",
        postId: "p8",
        parentId: "c20",
        userId: "u3",
        content: "Can't upvote this enough. Started investing at 22 and even a few hundred a month has grown significantly over the years.",
        upvotes: 890,
        downvotes: 5,
        created: new Date(now - 10.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c20_2",
        postId: "p8",
        parentId: "c20",
        userId: "u8",
        content: "This assumes you have disposable income in your 20s, which is a privilege not everyone has. Housing costs alone eat most people's salaries now.",
        upvotes: 567,
        downvotes: 45,
        created: new Date(now - 10 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c21",
        postId: "p8",
        parentId: null,
        userId: "u7",
        content: "Your mental health matters more than your career. I burned out badly at 28 chasing promotions and it took years to recover. No job is worth sacrificing your wellbeing.",
        upvotes: 3400,
        downvotes: 23,
        created: new Date(now - 10 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["wholesome", "helpful", "gold"],
      },
      {
        id: "c21_1",
        postId: "p8",
        parentId: "c21",
        userId: "u5",
        content: "This hit hard. Currently in the middle of burnout and reading this was the reality check I needed. Thank you.",
        upvotes: 890,
        downvotes: 2,
        created: new Date(now - 9.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["hugz"],
      },
      {
        id: "c22",
        postId: "p8",
        parentId: null,
        userId: "u4",
        content: "Learn to cook. Seriously. It saves money, it's healthier, and it's an impressive skill. Start with simple recipes and work your way up. YouTube is your best friend here.",
        upvotes: 1800,
        downvotes: 15,
        created: new Date(now - 9 * HOUR).toISOString(),
        isEdited: true,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c23",
        postId: "p8",
        parentId: null,
        userId: "u2",
        content: "Document everything at work. Emails, conversations, decisions. When things go sideways (and they will), having a paper trail protects you. I learned this the hard way.",
        upvotes: 1500,
        downvotes: 12,
        created: new Date(now - 8 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["helpful"],
      },
      // --- Comments on p9 (Panoramic dog) ---
      {
        id: "c24",
        postId: "p9",
        parentId: null,
        userId: "u4",
        content: "The longer I look at this, the funnier it gets. This belongs in a museum.",
        upvotes: 1500,
        downvotes: 5,
        created: new Date(now - 2.5 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c25",
        postId: "p9",
        parentId: null,
        userId: "u8",
        content: "Your dog has achieved a form that transcends normal dog physics. Congratulations.",
        upvotes: 2300,
        downvotes: 8,
        created: new Date(now - 2 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: ["hugz"],
      },
      // --- Comments on p10 (Fiction empathy study) ---
      {
        id: "c26",
        postId: "p10",
        parentId: null,
        userId: "u3",
        content: "The methodology looks solid. They controlled for prior reading habits, personality traits, and socioeconomic factors. Sample size of 2,400 participants across 5 countries is respectable.",
        upvotes: 234,
        downvotes: 3,
        created: new Date(now - 16 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c27",
        postId: "p10",
        parentId: null,
        userId: "u5",
        content: "As an English teacher, this validates what I've always told my students. Reading fiction literally makes you a better person. Adding this to my curriculum resources.",
        upvotes: 189,
        downvotes: 5,
        created: new Date(now - 15 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: true,
        awards: [],
      },
      // --- Comments on p11 (currentUser's soundtrack post) ---
      {
        id: "c28",
        postId: "p11",
        parentId: null,
        userId: "u4",
        content: "Hollow Knight is an amazing choice! My pick would be Ori and the Blind Forest. Gareth Coker created something truly magical with that score.",
        upvotes: 89,
        downvotes: 1,
        created: new Date(now - 14 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c29",
        postId: "p11",
        parentId: null,
        userId: "u7",
        content: "Skyrim. Hands down. Jeremy Soule captured the feeling of epic adventure better than any other game composer. The main theme still gives me chills.",
        upvotes: 156,
        downvotes: 8,
        created: new Date(now - 13 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      // --- Comments on p12 (Locked post) ---
      {
        id: "c30",
        postId: "p12",
        parentId: null,
        userId: "u6",
        content: "Pineapple belongs on pizza and I will not be taking questions at this time.",
        upvotes: 890,
        downvotes: 340,
        created: new Date(now - 35 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: false,
        awards: [],
      },
      {
        id: "c31",
        postId: "p12",
        parentId: null,
        userId: "u5",
        content: "Locking this thread due to Rule 4 violations. Please remember to be respectful even when you disagree.",
        upvotes: 45,
        downvotes: 12,
        created: new Date(now - 34 * HOUR).toISOString(),
        isEdited: false,
        isDistinguished: true,
        awards: [],
      },
    ],
    votes: [
      { id: "v1", userId: "u1", targetId: "p2", targetType: "post", value: 1 },
      { id: "v2", userId: "u1", targetId: "p3", targetType: "post", value: 1 },
      { id: "v3", userId: "u1", targetId: "p7", targetType: "post", value: 1 },
      { id: "v4", userId: "u1", targetId: "p8", targetType: "post", value: 1 },
      { id: "v5", userId: "u1", targetId: "p12", targetType: "post", value: -1 },
      { id: "v6", userId: "u1", targetId: "c4", targetType: "comment", value: 1 },
      { id: "v7", userId: "u1", targetId: "c6", targetType: "comment", value: 1 },
      { id: "v8", userId: "u1", targetId: "c12", targetType: "comment", value: -1 },
      { id: "v9", userId: "u1", targetId: "c21", targetType: "comment", value: 1 },
      { id: "v10", userId: "u1", targetId: "c19", targetType: "comment", value: -1 },
    ],
    notifications: [
      {
        id: "n1",
        type: "reply",
        fromUserId: "u6",
        postId: "p5",
        commentId: "c13",
        content: "code_monkey replied to your post \"Just built my first CLI tool in Go...\"",
        read: false,
        created: new Date(now - 7 * HOUR).toISOString(),
      },
      {
        id: "n2",
        type: "reply",
        fromUserId: "u2",
        postId: "p5",
        commentId: "c14",
        content: "tech_guru_99 replied to your post \"Just built my first CLI tool in Go...\"",
        read: false,
        created: new Date(now - 6 * HOUR).toISOString(),
      },
      {
        id: "n3",
        type: "mention",
        fromUserId: "u3",
        postId: "p2",
        commentId: null,
        content: "astro_nerd mentioned you in a comment on \"The future of AI is here...\"",
        read: false,
        created: new Date(now - 3 * HOUR).toISOString(),
      },
      {
        id: "n4",
        type: "upvote",
        fromUserId: null,
        postId: "p5",
        commentId: null,
        content: "Your post \"Just built my first CLI tool in Go...\" reached 400 upvotes!",
        read: true,
        created: new Date(now - 5 * HOUR).toISOString(),
      },
      {
        id: "n5",
        type: "award",
        fromUserId: "u2",
        postId: "p5",
        commentId: null,
        content: "tech_guru_99 gave you a Helpful Award on your post!",
        read: true,
        created: new Date(now - 4 * HOUR).toISOString(),
      },
      {
        id: "n6",
        type: "post_reply",
        fromUserId: "u4",
        postId: "p11",
        commentId: "c28",
        content: "pixel_artist replied to your post \"What game has the best soundtrack of all time?\"",
        read: false,
        created: new Date(now - 14 * HOUR).toISOString(),
      },
    ],
    awards: [
      { id: "silver", name: "Silver", icon: "\u{1F948}", cost: 100 },
      { id: "gold", name: "Gold", icon: "\u{1F947}", cost: 500 },
      { id: "platinum", name: "Platinum", icon: "\u{1F48E}", cost: 1800 },
      { id: "wholesome", name: "Wholesome", icon: "\u{1F9AD}", cost: 125 },
      { id: "helpful", name: "Helpful", icon: "\u{1F91D}", cost: 150 },
      { id: "hugz", name: "Hugz", icon: "\u{1F43B}", cost: 80 },
      { id: "rocket", name: "Rocket Like", icon: "\u{1F680}", cost: 200 },
      { id: "mind_blown", name: "Mind Blown", icon: "\u{1F92F}", cost: 250 },
    ]
  };
};

// Keep backward-compatible export for existing code that imports initialData directly
export const initialData = createInitialData();

export const calculateStateDiff = (initial, current) => {
  const diff = {};
  for (const key in current) {
    if (JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
      diff[key] = {
        from: initial[key],
        to: current[key]
      };
    }
  }
  return diff;
};
