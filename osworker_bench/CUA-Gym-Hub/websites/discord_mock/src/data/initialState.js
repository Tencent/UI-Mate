// Relative timestamp helpers
const now = Date.now();
const mins = (n) => n * 60 * 1000;
const hours = (n) => n * 60 * 60 * 1000;
const days = (n) => n * 24 * 60 * 60 * 1000;
const ts = (offset) => new Date(now - offset).toISOString();

export const INITIAL_STATE = {
  currentUser: {
    id: 'user-current',
    username: 'Alex_Dev',
    discriminator: '9201',
    avatar: 'https://picsum.photos/seed/alexdev/128/128',
    status: 'online',
    customStatus: null,
    aboutMe: 'Full-stack dev & gamer. Building cool stuff with React and Node.js.',
    roles: ['role-admin', 'role-lead-dev'],
    badges: ['server_owner'],
    bannerColor: '#5865F2',
    joinedAt: '2023-01-15T10:00:00Z',
    isBot: false
  },

  servers: {
    'server-1': {
      id: 'server-1',
      name: 'Gaming Community',
      icon: 'https://picsum.photos/seed/gaming-server/64/64',
      ownerId: 'user-current',
      channels: ['ch-1', 'ch-2', 'ch-3', 'ch-4', 'ch-5', 'ch-6', 'ch-v1'],
      roles: ['role-admin', 'role-mod', 'role-member'],
      members: ['user-current', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6'],
      categories: [
        { id: 'cat-1', name: 'TEXT CHANNELS', channelIds: ['ch-1', 'ch-2', 'ch-3', 'ch-4'] },
        { id: 'cat-2', name: 'FUN', channelIds: ['ch-5', 'ch-6'] },
        { id: 'cat-3', name: 'VOICE CHANNELS', channelIds: ['ch-v1'] }
      ],
      description: 'A community for gamers and tech enthusiasts',
      boostCount: 7,
      boostTier: 1
    },
    'server-2': {
      id: 'server-2',
      name: 'Dev Hub',
      icon: 'https://picsum.photos/seed/devhub/64/64',
      ownerId: 'user-4',
      channels: ['ch-s2-1', 'ch-s2-2', 'ch-s2-3', 'ch-s2-v1'],
      roles: ['role-lead-dev', 'role-developer'],
      members: ['user-current', 'user-2', 'user-4', 'user-5'],
      categories: [
        { id: 'cat-s2-1', name: 'TEXT CHANNELS', channelIds: ['ch-s2-1', 'ch-s2-2', 'ch-s2-3'] },
        { id: 'cat-s2-2', name: 'VOICE CHANNELS', channelIds: ['ch-s2-v1'] }
      ],
      description: 'Hub for developers to collaborate and share knowledge',
      boostCount: 2,
      boostTier: 0
    }
  },

  channels: {
    'ch-1': {
      id: 'ch-1',
      serverId: 'server-1',
      name: 'general',
      type: 'text',
      category: 'TEXT CHANNELS',
      topic: 'General discussion and community chat. Be nice!',
      position: 0,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: ['msg-3'],
      lastMessageId: 'msg-8',
      unreadCount: 0,
      permissions: {}
    },
    'ch-2': {
      id: 'ch-2',
      serverId: 'server-1',
      name: 'announcements',
      type: 'announcement',
      category: 'TEXT CHANNELS',
      topic: 'Important server news and updates. Only admins can post.',
      position: 1,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: ['msg-ann-1'],
      lastMessageId: 'msg-ann-2',
      unreadCount: 0,
      permissions: {}
    },
    'ch-3': {
      id: 'ch-3',
      serverId: 'server-1',
      name: 'off-topic',
      type: 'text',
      category: 'TEXT CHANNELS',
      topic: 'Anything goes! Just keep it civil.',
      position: 2,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: [],
      lastMessageId: 'msg-ot-3',
      unreadCount: 2,
      permissions: {}
    },
    'ch-4': {
      id: 'ch-4',
      serverId: 'server-1',
      name: 'help',
      type: 'text',
      category: 'TEXT CHANNELS',
      topic: 'Need help? Ask here and the community will assist.',
      position: 3,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: [],
      lastMessageId: 'msg-help-3',
      unreadCount: 0,
      permissions: {}
    },
    'ch-5': {
      id: 'ch-5',
      serverId: 'server-1',
      name: 'memes',
      type: 'text',
      category: 'FUN',
      topic: 'Share your best memes. No reposts!',
      position: 0,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: [],
      lastMessageId: 'msg-meme-2',
      unreadCount: 0,
      permissions: {}
    },
    'ch-6': {
      id: 'ch-6',
      serverId: 'server-1',
      name: 'clips',
      type: 'text',
      category: 'FUN',
      topic: 'Share gaming clips and highlights',
      position: 1,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: [],
      lastMessageId: null,
      unreadCount: 0,
      permissions: {}
    },
    'ch-v1': {
      id: 'ch-v1',
      serverId: 'server-1',
      name: 'General Voice',
      type: 'voice',
      category: 'VOICE CHANNELS',
      topic: null,
      position: 0,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: [],
      lastMessageId: null,
      unreadCount: 0,
      permissions: {}
    },
    'ch-s2-1': {
      id: 'ch-s2-1',
      serverId: 'server-2',
      name: 'general',
      type: 'text',
      category: 'TEXT CHANNELS',
      topic: 'General dev discussions',
      position: 0,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: [],
      lastMessageId: 'msg-s2-3',
      unreadCount: 0,
      permissions: {}
    },
    'ch-s2-2': {
      id: 'ch-s2-2',
      serverId: 'server-2',
      name: 'code-review',
      type: 'text',
      category: 'TEXT CHANNELS',
      topic: 'Submit PRs and code for peer review',
      position: 1,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: ['msg-cr-1'],
      lastMessageId: 'msg-cr-3',
      unreadCount: 0,
      permissions: {}
    },
    'ch-s2-3': {
      id: 'ch-s2-3',
      serverId: 'server-2',
      name: 'resources',
      type: 'text',
      category: 'TEXT CHANNELS',
      topic: 'Share useful links, tools, and articles',
      position: 2,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: [],
      lastMessageId: 'msg-res-1',
      unreadCount: 0,
      permissions: {}
    },
    'ch-s2-v1': {
      id: 'ch-s2-v1',
      serverId: 'server-2',
      name: 'Pair Programming',
      type: 'voice',
      category: 'VOICE CHANNELS',
      topic: null,
      position: 0,
      isNsfw: false,
      slowMode: 0,
      pinnedMessageIds: [],
      lastMessageId: null,
      unreadCount: 0,
      permissions: {}
    }
  },

  messages: {
    // === #general (ch-1) - 8 messages spanning 3 days ===
    'msg-1': {
      id: 'msg-1',
      channelId: 'ch-1',
      userId: 'user-2',
      content: 'Hey everyone! Hope you all had a great weekend. Anyone try the new Elden Ring DLC?',
      timestamp: ts(days(3) + hours(2)),
      editedTimestamp: null,
      reactions: { '🎮': ['user-3', 'user-current'], '👍': ['user-current', 'user-5'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-2': {
      id: 'msg-2',
      channelId: 'ch-1',
      userId: 'user-3',
      content: 'Yeah the DLC is **insane**! That final boss took me like 30 attempts. The new weapons are so satisfying though.',
      timestamp: ts(days(3) + hours(1)),
      editedTimestamp: null,
      reactions: { '🔥': ['user-2', 'user-current'], '😂': ['user-2'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-3': {
      id: 'msg-3',
      channelId: 'ch-1',
      userId: 'user-current',
      content: '📌 **Server Rules Reminder:**\n1. Be respectful to all members\n2. No spam or self-promotion\n3. Keep discussions in the right channels\n4. Have fun!\n\nPlease read the full rules in #announcements.',
      timestamp: ts(days(2) + hours(5)),
      editedTimestamp: null,
      reactions: { '✅': ['user-2', 'user-3', 'user-5'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: true,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-4': {
      id: 'msg-4',
      channelId: 'ch-1',
      userId: 'user-4',
      content: 'Just pushed a major update to the project. Check out the new features: https://github.com/example/awesome-project',
      timestamp: ts(days(2) + hours(1)),
      editedTimestamp: null,
      reactions: { '🚀': ['user-current', 'user-2'] },
      attachments: [],
      embeds: [{
        type: 'rich',
        title: 'example/awesome-project',
        description: 'A cutting-edge open-source project with blazing fast performance and modern architecture.',
        url: 'https://github.com/example/awesome-project',
        color: '#5865F2',
        thumbnail: { url: 'https://picsum.photos/seed/gh-embed/120/120', width: 120, height: 120 },
        image: null,
        author: { name: 'GitHub', url: 'https://github.com', iconUrl: null },
        footer: { text: '⭐ 2,431 stars • TypeScript', iconUrl: null }
      }],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-5': {
      id: 'msg-5',
      channelId: 'ch-1',
      userId: 'user-5',
      content: 'Just finished this new pixel art piece! What do you all think?',
      timestamp: ts(days(1) + hours(6)),
      editedTimestamp: null,
      reactions: { '🎨': ['user-current', 'user-2', 'user-3'], '❤️': ['user-2', 'user-4'] },
      attachments: [{
        id: 'att-1',
        filename: 'pixel_castle.png',
        url: '/files/_default/pixel_castle.png',
        contentType: 'image/png',
        size: 245000,
        width: 800,
        height: 600
      }],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-6': {
      id: 'msg-6',
      channelId: 'ch-1',
      userId: 'user-6',
      content: '🤖 **Daily Server Stats:**\n- Members online: 4/6\n- Messages today: 12\n- Most active channel: #general\n\n*Powered by BotHelper*',
      timestamp: ts(days(1) + hours(2)),
      editedTimestamp: null,
      reactions: {},
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: true
    },
    'msg-7': {
      id: 'msg-7',
      channelId: 'ch-1',
      userId: 'user-2',
      content: '@Alex_Dev have you seen the new React 19 features? The compiler looks really promising.',
      timestamp: ts(hours(5)),
      editedTimestamp: null,
      reactions: {},
      attachments: [],
      embeds: [],
      mentions: ['user-current'],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-8': {
      id: 'msg-8',
      channelId: 'ch-1',
      userId: 'user-current',
      content: 'Yeah the RSC improvements are great! I migrated my side project last week. The new `use()` hook is a game changer.\n\n```javascript\nconst data = use(fetchPromise);\nrender(data); // No more useEffect!\n```',
      timestamp: ts(hours(4)),
      editedTimestamp: null,
      reactions: { '💯': ['user-2', 'user-4'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'reply',
      referencedMessageId: 'msg-7',
      threadId: null,
      isEdited: false
    },

    // === #announcements (ch-2) - 2 messages ===
    'msg-ann-1': {
      id: 'msg-ann-1',
      channelId: 'ch-2',
      userId: 'user-current',
      content: '# 🎉 Server Relaunch!\n\nWelcome to the new and improved **Gaming Community** server! We\'ve restructured channels, added new roles, and have exciting events planned.\n\n**What\'s new:**\n- New #help channel for support\n- Fun category with #memes and #clips\n- Voice channels for gaming sessions\n- Bot integration for server stats\n\nEnjoy and happy chatting!',
      timestamp: ts(days(7)),
      editedTimestamp: null,
      reactions: { '🎉': ['user-2', 'user-3', 'user-4', 'user-5'], '❤️': ['user-2', 'user-3'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: true,
      pinned: true,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-ann-2': {
      id: 'msg-ann-2',
      channelId: 'ch-2',
      userId: 'user-current',
      content: '## 🏆 Weekend Gaming Tournament\n\nThis Saturday we\'re hosting a **Valorant tournament**! Sign up by reacting below.\n\n- **When:** Saturday 7PM EST\n- **Format:** 5v5, best of 3\n- **Prize:** Custom "Champion" role\n\nReact with ⚔️ to join!',
      timestamp: ts(days(1)),
      editedTimestamp: null,
      reactions: { '⚔️': ['user-3', 'user-4', 'user-5'], '🔥': ['user-2'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },

    // === #off-topic (ch-3) - 3 messages ===
    'msg-ot-1': {
      id: 'msg-ot-1',
      channelId: 'ch-3',
      userId: 'user-3',
      content: 'Anyone watching the new season of Arcane? It\'s so good 🤯',
      timestamp: ts(days(1) + hours(8)),
      editedTimestamp: null,
      reactions: { '🤯': ['user-2', 'user-5'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-ot-2': {
      id: 'msg-ot-2',
      channelId: 'ch-3',
      userId: 'user-5',
      content: 'The animation quality is absolutely stunning. Fortiche really outdid themselves.',
      timestamp: ts(days(1) + hours(7)),
      editedTimestamp: null,
      reactions: {},
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-ot-3': {
      id: 'msg-ot-3',
      channelId: 'ch-3',
      userId: 'user-2',
      content: 'No spoilers please! I\'m still on episode 3 😭',
      timestamp: ts(hours(12)),
      editedTimestamp: null,
      reactions: { '😂': ['user-3'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },

    // === #help (ch-4) - 3 messages, has thread ===
    'msg-help-1': {
      id: 'msg-help-1',
      channelId: 'ch-4',
      userId: 'user-3',
      content: 'How do I set up bot permissions properly? I keep getting "Missing Permissions" errors when the bot tries to moderate.',
      timestamp: ts(days(2) + hours(3)),
      editedTimestamp: null,
      reactions: {},
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'thread_starter',
      referencedMessageId: null,
      threadId: 'thread-1',
      isEdited: false
    },
    'msg-help-2': {
      id: 'msg-help-2',
      channelId: 'ch-4',
      userId: 'user-6',
      content: '🤖 **Quick Tip:** Use `/help permissions` to see a list of all available permission flags and their descriptions.',
      timestamp: ts(days(2) + hours(2)),
      editedTimestamp: null,
      reactions: { '👍': ['user-3'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-help-3': {
      id: 'msg-help-3',
      channelId: 'ch-4',
      userId: 'user-2',
      content: 'Make sure the bot role is higher than the roles it needs to manage in the role hierarchy. That\'s usually the issue.',
      timestamp: ts(days(2) + hours(1)),
      editedTimestamp: null,
      reactions: { '✅': ['user-3'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },

    // === #memes (ch-5) - 2 messages with images ===
    'msg-meme-1': {
      id: 'msg-meme-1',
      channelId: 'ch-5',
      userId: 'user-3',
      content: 'When you finally fix a bug after 4 hours and it was a missing semicolon',
      timestamp: ts(days(1) + hours(4)),
      editedTimestamp: null,
      reactions: { '😂': ['user-current', 'user-2', 'user-4', 'user-5'], '💀': ['user-4'] },
      attachments: [{
        id: 'att-meme-1',
        filename: 'debugging_meme.jpg',
        url: '/files/_default/debugging_meme.jpg',
        contentType: 'image/jpeg',
        size: 180000,
        width: 500,
        height: 400
      }],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-meme-2': {
      id: 'msg-meme-2',
      channelId: 'ch-5',
      userId: 'user-5',
      content: 'My artistic interpretation of "it works on my machine"',
      timestamp: ts(hours(8)),
      editedTimestamp: null,
      reactions: { '🎨': ['user-3'], '😂': ['user-2', 'user-current'] },
      attachments: [{
        id: 'att-meme-2',
        filename: 'works_on_my_machine.png',
        url: '/files/_default/works_on_my_machine.png',
        contentType: 'image/png',
        size: 210000,
        width: 600,
        height: 400
      }],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },

    // === Server-2: #general (ch-s2-1) - 3 messages ===
    'msg-s2-1': {
      id: 'msg-s2-1',
      channelId: 'ch-s2-1',
      userId: 'user-4',
      content: 'Welcome to **Dev Hub**! This server is for sharing knowledge, reviewing code, and collaborating on projects.',
      timestamp: ts(days(5)),
      editedTimestamp: null,
      reactions: { '🙌': ['user-current', 'user-2'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-s2-2': {
      id: 'msg-s2-2',
      channelId: 'ch-s2-1',
      userId: 'user-current',
      content: 'Great to be here! Looking forward to some solid code reviews.',
      timestamp: ts(days(4)),
      editedTimestamp: null,
      reactions: {},
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-s2-3': {
      id: 'msg-s2-3',
      channelId: 'ch-s2-1',
      userId: 'user-5',
      content: 'Anyone worked with the new Bun 1.2 release? The SQLite integration looks interesting.',
      timestamp: ts(hours(10)),
      editedTimestamp: null,
      reactions: { '👀': ['user-4'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },

    // === Server-2: #code-review (ch-s2-2) - 3 messages, has thread ===
    'msg-cr-1': {
      id: 'msg-cr-1',
      channelId: 'ch-s2-2',
      userId: 'user-4',
      content: '## 📋 Code Review Guidelines\n\n- Keep PRs small and focused\n- Include tests with your changes\n- Use descriptive commit messages\n- Review within 24 hours when possible\n- Be constructive in feedback\n\n> "Code is read much more often than it is written." — Guido van Rossum',
      timestamp: ts(days(5)),
      editedTimestamp: null,
      reactions: { '📌': ['user-current', 'user-2'] },
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: true,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },
    'msg-cr-2': {
      id: 'msg-cr-2',
      channelId: 'ch-s2-2',
      userId: 'user-current',
      content: 'Looking for reviews on my API refactor PR. Moved from REST to tRPC with full type safety.\n\nhttps://github.com/example/api-refactor/pull/42',
      timestamp: ts(days(1) + hours(3)),
      editedTimestamp: null,
      reactions: {},
      attachments: [],
      embeds: [{
        type: 'rich',
        title: 'Refactor: Migrate REST endpoints to tRPC #42',
        description: 'This PR migrates all REST API endpoints to tRPC for end-to-end type safety. Includes router setup, middleware, and client integration.',
        url: 'https://github.com/example/api-refactor/pull/42',
        color: '#238636',
        thumbnail: { url: 'https://picsum.photos/seed/pr-thumb/120/120', width: 120, height: 120 },
        image: null,
        author: { name: 'Alex_Dev', url: null, iconUrl: null },
        footer: { text: 'GitHub Pull Request • +1,243 -892', iconUrl: null }
      }],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'thread_starter',
      referencedMessageId: null,
      threadId: 'thread-2',
      isEdited: false
    },
    'msg-cr-3': {
      id: 'msg-cr-3',
      channelId: 'ch-s2-2',
      userId: 'user-4',
      content: 'I\'ll take a look at the tRPC migration today. Any breaking changes to the client?',
      timestamp: ts(days(1) + hours(1)),
      editedTimestamp: null,
      reactions: {},
      attachments: [],
      embeds: [],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    },

    // === Server-2: #resources (ch-s2-3) - 1 message ===
    'msg-res-1': {
      id: 'msg-res-1',
      channelId: 'ch-s2-3',
      userId: 'user-2',
      content: 'Great article on React Server Components patterns: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      timestamp: ts(days(2)),
      editedTimestamp: null,
      reactions: { '🙏': ['user-current', 'user-4'] },
      attachments: [],
      embeds: [{
        type: 'video',
        title: 'Advanced React Server Components Patterns',
        description: 'Deep dive into RSC patterns, streaming, and optimistic updates for production applications.',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        color: '#ff0000',
        thumbnail: { url: 'https://picsum.photos/seed/yt-thumb/320/180', width: 320, height: 180 },
        image: null,
        author: { name: 'YouTube', url: null, iconUrl: null },
        footer: null
      }],
      mentions: [],
      mentionEveryone: false,
      pinned: false,
      type: 'default',
      referencedMessageId: null,
      threadId: null,
      isEdited: false
    }
  },

  threads: {
    'thread-1': {
      id: 'thread-1',
      channelId: 'ch-4',
      messageId: 'msg-help-1',
      name: 'How to set up bot permissions',
      ownerId: 'user-3',
      messages: [
        {
          id: 'tmsg-1',
          channelId: 'thread-1',
          userId: 'user-2',
          content: 'First, go to Server Settings > Roles and make sure the bot role has the permissions you need (Kick Members, Ban Members, Manage Messages etc).',
          timestamp: ts(days(2) + hours(2) + mins(50)),
          reactions: {},
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        },
        {
          id: 'tmsg-2',
          channelId: 'thread-1',
          userId: 'user-current',
          content: 'Also check the channel-specific permission overrides. Sometimes the channel settings override the role permissions.',
          timestamp: ts(days(2) + hours(2) + mins(40)),
          reactions: { '👍': ['user-3'] },
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        },
        {
          id: 'tmsg-3',
          channelId: 'thread-1',
          userId: 'user-3',
          content: 'That was it! The channel had overrides blocking the bot. Thanks both!',
          timestamp: ts(days(2) + hours(2) + mins(30)),
          reactions: { '🎉': ['user-2'] },
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        }
      ],
      messageCount: 3,
      memberCount: 3,
      archived: false,
      locked: false,
      createdAt: ts(days(2) + hours(3))
    },
    'thread-2': {
      id: 'thread-2',
      channelId: 'ch-s2-2',
      messageId: 'msg-cr-2',
      name: 'Review: API refactor to tRPC',
      ownerId: 'user-current',
      messages: [
        {
          id: 'tmsg-4',
          channelId: 'thread-2',
          userId: 'user-4',
          content: 'The router structure looks clean. One suggestion: consider splitting the `appRouter` into feature-based sub-routers for better modularity.\n\n```typescript\n// Instead of one big router\nconst appRouter = router({\n  users: userRouter,\n  posts: postRouter,\n  comments: commentRouter,\n});\n```',
          timestamp: ts(days(1) + hours(2)),
          reactions: {},
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        },
        {
          id: 'tmsg-5',
          channelId: 'thread-2',
          userId: 'user-current',
          content: 'Good call, I\'ll split it up. Already have the user and post routers separate, just need to move comments.',
          timestamp: ts(days(1) + hours(1) + mins(30)),
          reactions: { '👍': ['user-4'] },
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        }
      ],
      messageCount: 2,
      memberCount: 2,
      archived: false,
      locked: false,
      createdAt: ts(days(1) + hours(3))
    }
  },

  users: {
    'user-current': {
      id: 'user-current',
      username: 'Alex_Dev',
      discriminator: '9201',
      avatar: 'https://picsum.photos/seed/alexdev/128/128',
      status: 'online',
      customStatus: null,
      aboutMe: 'Full-stack dev & gamer. Building cool stuff with React and Node.js.',
      roles: ['role-admin', 'role-lead-dev'],
      badges: ['server_owner'],
      bannerColor: '#5865F2',
      joinedAt: '2023-01-15T10:00:00Z',
      isBot: false
    },
    'user-2': {
      id: 'user-2',
      username: 'Sarah_Mod',
      discriminator: '4521',
      avatar: 'https://picsum.photos/seed/sarahmod/128/128',
      status: 'online',
      customStatus: '☕ Coffee break',
      aboutMe: 'Community moderator and avid reader. DM me for server issues!',
      roles: ['role-mod'],
      badges: ['early_supporter'],
      bannerColor: '#3498db',
      joinedAt: '2023-02-20T08:00:00Z',
      isBot: false
    },
    'user-3': {
      id: 'user-3',
      username: 'GameMaster42',
      discriminator: '7734',
      avatar: 'https://picsum.photos/seed/gamemaster/128/128',
      status: 'idle',
      customStatus: '🎮 Playing Elden Ring',
      aboutMe: 'Competitive gamer. Elden Ring enthusiast. Speedrunner.',
      roles: ['role-member'],
      badges: [],
      bannerColor: '#f0b232',
      joinedAt: '2023-04-10T14:00:00Z',
      isBot: false
    },
    'user-4': {
      id: 'user-4',
      username: 'CodeNinja',
      discriminator: '1337',
      avatar: 'https://picsum.photos/seed/codeninja/128/128',
      status: 'dnd',
      customStatus: '🔴 In a meeting',
      aboutMe: 'Senior software engineer. TypeScript maximalist. Open source contributor.',
      roles: ['role-member', 'role-lead-dev', 'role-developer'],
      badges: ['nitro'],
      bannerColor: '#2ecc71',
      joinedAt: '2023-03-05T11:00:00Z',
      isBot: false
    },
    'user-5': {
      id: 'user-5',
      username: 'PixelArtist',
      discriminator: '8899',
      avatar: 'https://picsum.photos/seed/pixelartist/128/128',
      status: 'offline',
      customStatus: null,
      aboutMe: 'Digital artist specializing in pixel art and game assets. Commissions open!',
      roles: ['role-member', 'role-developer'],
      badges: [],
      bannerColor: '#e91e63',
      joinedAt: '2023-06-15T09:00:00Z',
      isBot: false
    },
    'user-6': {
      id: 'user-6',
      username: 'BotHelper',
      discriminator: '0000',
      avatar: 'https://picsum.photos/seed/bothelper/128/128',
      status: 'online',
      customStatus: null,
      aboutMe: 'Moderation & utility bot. Use /help for commands.',
      roles: [],
      badges: [],
      bannerColor: '#5865F2',
      joinedAt: '2023-01-15T10:00:00Z',
      isBot: true
    }
  },

  roles: {
    'role-admin': {
      id: 'role-admin',
      serverId: 'server-1',
      name: 'Admin',
      color: '#e74c3c',
      position: 3,
      permissions: ['ADMINISTRATOR'],
      hoist: true,
      mentionable: true
    },
    'role-mod': {
      id: 'role-mod',
      serverId: 'server-1',
      name: 'Moderator',
      color: '#3498db',
      position: 2,
      permissions: ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_MESSAGES'],
      hoist: true,
      mentionable: true
    },
    'role-member': {
      id: 'role-member',
      serverId: 'server-1',
      name: 'Member',
      color: '#95a5a6',
      position: 1,
      permissions: ['SEND_MESSAGES', 'READ_MESSAGES'],
      hoist: false,
      mentionable: false
    },
    'role-lead-dev': {
      id: 'role-lead-dev',
      serverId: 'server-2',
      name: 'Lead Dev',
      color: '#2ecc71',
      position: 2,
      permissions: ['ADMINISTRATOR'],
      hoist: true,
      mentionable: true
    },
    'role-developer': {
      id: 'role-developer',
      serverId: 'server-2',
      name: 'Developer',
      color: '#1abc9c',
      position: 1,
      permissions: ['SEND_MESSAGES', 'READ_MESSAGES', 'MANAGE_MESSAGES'],
      hoist: true,
      mentionable: true
    }
  },

  dmConversations: {
    'dm-1': {
      id: 'dm-1',
      recipientId: 'user-2',
      messages: [
        {
          id: 'dm-msg-1',
          channelId: 'dm-1',
          userId: 'user-2',
          content: 'Hey Alex! I noticed some spam accounts joining the server. Should we enable the verification level?',
          timestamp: ts(days(1) + hours(6)),
          reactions: {},
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        },
        {
          id: 'dm-msg-2',
          channelId: 'dm-1',
          userId: 'user-current',
          content: 'Good catch! Yeah, let\'s bump it up to Medium verification. That should require email verification at minimum.',
          timestamp: ts(days(1) + hours(5) + mins(45)),
          reactions: {},
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        },
        {
          id: 'dm-msg-3',
          channelId: 'dm-1',
          userId: 'user-2',
          content: 'Done! Also set up auto-mod to catch common spam patterns. Should be much better now.',
          timestamp: ts(days(1) + hours(5) + mins(30)),
          reactions: {},
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        },
        {
          id: 'dm-msg-4',
          channelId: 'dm-1',
          userId: 'user-current',
          content: 'Perfect, thanks Sarah! You\'re the best mod 💪',
          timestamp: ts(days(1) + hours(5) + mins(15)),
          reactions: {},
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        }
      ],
      lastMessageTimestamp: ts(days(1) + hours(5) + mins(15)),
      unreadCount: 0
    },
    'dm-2': {
      id: 'dm-2',
      recipientId: 'user-4',
      messages: [
        {
          id: 'dm-msg-5',
          channelId: 'dm-2',
          userId: 'user-4',
          content: 'Hey, saw your tRPC PR. Want to pair program on the migration tomorrow?',
          timestamp: ts(days(2) + hours(1)),
          reactions: {},
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        },
        {
          id: 'dm-msg-6',
          channelId: 'dm-2',
          userId: 'user-current',
          content: 'That would be awesome! I\'m free after 2pm. We can hop on the Pair Programming voice channel.',
          timestamp: ts(days(2) + hours(0) + mins(45)),
          reactions: {},
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        },
        {
          id: 'dm-msg-7',
          channelId: 'dm-2',
          userId: 'user-4',
          content: 'Sounds good! I\'ll prep some notes on the auth middleware changes. See you then 👋',
          timestamp: ts(days(2) + hours(0) + mins(30)),
          reactions: {},
          attachments: [],
          embeds: [],
          mentions: [],
          mentionEveryone: false,
          pinned: false,
          type: 'default',
          referencedMessageId: null,
          threadId: null,
          isEdited: false
        }
      ],
      lastMessageTimestamp: ts(days(2) + hours(0) + mins(30)),
      unreadCount: 1
    }
  },

  activeVoiceChannel: null,
  dms: ['user-2', 'user-4'],

  ui: {
    memberSidebarVisible: true,
    threadPanelOpen: false,
    activeThreadId: null,
    searchQuery: '',
    searchResults: [],
    pinnedPanelOpen: false
  }
};

// --- Session-based state management ---

const BASE_STORAGE_KEY = 'discord_mock_state';
const BASE_INITIAL_KEY = 'discord_mock_initialState';

function storageKey(sid) { return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY; }
function initialKey(sid) { return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY; }

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) { sessionStorage.setItem('mock_sid', urlSid); return urlSid; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) { const data = await resp.json(); if (data.has_custom_state && data.stored_state) return data.stored_state; }
  } catch (e) { console.warn('No custom state available'); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state, merge: false }),
  }).catch(() => {});
};

export const getSavedInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid));
  return s ? JSON.parse(s) : null;
};

export function getDefaultData() {
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

// --- Normalization helpers for POST API custom state ---

function normalizeUser(u) {
  return {
    id: u.id || 'unknown',
    username: u.username || 'Unknown',
    discriminator: u.discriminator || '0000',
    avatar: u.avatar || `https://picsum.photos/seed/${u.id || 'default'}/128/128`,
    status: u.status || 'offline',
    customStatus: u.customStatus || null,
    aboutMe: u.aboutMe || '',
    roles: Array.isArray(u.roles) ? u.roles : [],
    badges: Array.isArray(u.badges) ? u.badges : [],
    bannerColor: u.bannerColor || '#5865F2',
    joinedAt: u.joinedAt || new Date().toISOString(),
    isBot: u.isBot || false
  };
}

function normalizeServer(s) {
  return {
    id: s.id || 'unknown',
    name: s.name || 'Unknown Server',
    icon: s.icon || `https://picsum.photos/seed/${s.id || 'default'}/64/64`,
    ownerId: s.ownerId || 'user-current',
    channels: Array.isArray(s.channels) ? s.channels : [],
    roles: Array.isArray(s.roles) ? s.roles : [],
    members: Array.isArray(s.members) ? s.members : [],
    categories: Array.isArray(s.categories) ? s.categories : [],
    description: s.description || '',
    boostCount: s.boostCount || 0,
    boostTier: s.boostTier || 0
  };
}

function normalizeChannel(c) {
  return {
    id: c.id || 'unknown',
    serverId: c.serverId || 'unknown',
    name: c.name || 'unknown',
    type: c.type || 'text',
    category: c.category || 'TEXT CHANNELS',
    topic: c.topic || null,
    position: c.position || 0,
    isNsfw: c.isNsfw || false,
    slowMode: c.slowMode || 0,
    pinnedMessageIds: Array.isArray(c.pinnedMessageIds) ? c.pinnedMessageIds : [],
    lastMessageId: c.lastMessageId || null,
    unreadCount: c.unreadCount || 0,
    permissions: c.permissions || {},
    notificationSetting: c.notificationSetting || 'default',
    muted: c.muted || false
  };
}

function normalizeMessage(m) {
  return {
    id: m.id || 'unknown',
    channelId: m.channelId || 'unknown',
    userId: m.userId || 'unknown',
    content: m.content || '',
    timestamp: m.timestamp || new Date().toISOString(),
    editedTimestamp: m.editedTimestamp || null,
    reactions: (typeof m.reactions === 'object' && m.reactions !== null) ? m.reactions : {},
    attachments: Array.isArray(m.attachments) ? m.attachments : [],
    embeds: Array.isArray(m.embeds) ? m.embeds : [],
    mentions: Array.isArray(m.mentions) ? m.mentions : [],
    mentionEveryone: m.mentionEveryone || false,
    pinned: m.pinned || false,
    type: m.type || 'default',
    referencedMessageId: m.referencedMessageId || null,
    threadId: m.threadId || null,
    isEdited: m.isEdited || false
  };
}

function normalizeThread(t) {
  return {
    id: t.id || 'unknown',
    channelId: t.channelId || 'unknown',
    messageId: t.messageId || 'unknown',
    name: t.name || 'Thread',
    ownerId: t.ownerId || 'unknown',
    messages: Array.isArray(t.messages) ? t.messages.map(normalizeMessage) : [],
    messageCount: t.messageCount || 0,
    memberCount: t.memberCount || 0,
    archived: t.archived || false,
    locked: t.locked || false,
    createdAt: t.createdAt || new Date().toISOString()
  };
}

function normalizeDMConversation(dm) {
  return {
    id: dm.id || 'unknown',
    recipientId: dm.recipientId || 'unknown',
    messages: Array.isArray(dm.messages) ? dm.messages.map(normalizeMessage) : [],
    lastMessageTimestamp: dm.lastMessageTimestamp || new Date().toISOString(),
    unreadCount: dm.unreadCount || 0
  };
}

function normalizeRole(r) {
  return {
    id: r.id || 'unknown',
    serverId: r.serverId || 'unknown',
    name: r.name || 'Role',
    color: r.color || '#95a5a6',
    position: r.position || 0,
    permissions: Array.isArray(r.permissions) ? r.permissions : [],
    hoist: r.hoist || false,
    mentionable: r.mentionable || false
  };
}

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };

  for (const key in custom) {
    if (custom[key] === null || custom[key] === undefined) continue;

    if (key === 'users' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
      result[key] = { ...defaults[key] };
      for (const [k, v] of Object.entries(custom[key])) {
        result[key][k] = normalizeUser({ ...(defaults[key]?.[k] || {}), ...v });
      }
    } else if (key === 'servers' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
      result[key] = { ...defaults[key] };
      for (const [k, v] of Object.entries(custom[key])) {
        result[key][k] = normalizeServer({ ...(defaults[key]?.[k] || {}), ...v });
      }
    } else if (key === 'channels' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
      result[key] = { ...defaults[key] };
      for (const [k, v] of Object.entries(custom[key])) {
        result[key][k] = normalizeChannel({ ...(defaults[key]?.[k] || {}), ...v });
      }
    } else if (key === 'messages' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
      result[key] = { ...defaults[key] };
      for (const [k, v] of Object.entries(custom[key])) {
        result[key][k] = normalizeMessage({ ...(defaults[key]?.[k] || {}), ...v });
      }
    } else if (key === 'threads' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
      result[key] = { ...defaults[key] };
      for (const [k, v] of Object.entries(custom[key])) {
        result[key][k] = normalizeThread({ ...(defaults[key]?.[k] || {}), ...v });
      }
    } else if (key === 'dmConversations' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
      result[key] = { ...defaults[key] };
      for (const [k, v] of Object.entries(custom[key])) {
        result[key][k] = normalizeDMConversation({ ...(defaults[key]?.[k] || {}), ...v });
      }
    } else if (key === 'roles' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
      result[key] = { ...defaults[key] };
      for (const [k, v] of Object.entries(custom[key])) {
        result[key][k] = normalizeRole({ ...(defaults[key]?.[k] || {}), ...v });
      }
    } else if (key === 'currentUser' && typeof custom[key] === 'object') {
      result[key] = normalizeUser({ ...defaults[key], ...custom[key] });
    } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
    } else {
      result[key] = custom[key];
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const d = deepMergeWithDefaults(getDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(d));
    localStorage.setItem(ik, JSON.stringify(d));
    return d;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const d = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(d));
  localStorage.setItem(ik, JSON.stringify(d));
  return d;
};
