// Helper to create dates relative to now
const daysAgo = (d, h = 0, m = 0) => new Date(Date.now() - d * 86400000 - h * 3600000 - m * 60000).toISOString();

const emptyReactions = () => ({ like: [], celebrate: [], love: [], insightful: [], funny: [], curious: [] });

export const INITIAL_STATE = {
  currentUser: {
    id: 'user_admin',
    name: 'Alex Morgan',
    headline: 'Senior Software Engineer at TechCorp | Full Stack Developer',
    location: 'San Francisco Bay Area',
    about: 'Passionate software engineer with 8+ years of experience building scalable web applications. I specialize in React, TypeScript, and cloud architecture.\n\nCurrently leading frontend development at TechCorp, where we\'re building the next generation of developer tools.\n\nOpen to connecting with fellow engineers, product managers, and anyone passionate about technology.',
    avatar: 'https://i.pravatar.cc/200?u=user_admin',
    banner: 'https://picsum.photos/1200/400?random=banner_admin',
    connections: ['user_2', 'user_3', 'user_5', 'user_6', 'user_8'],
    experience: [
      { id: 'exp_1', title: 'Senior Software Engineer', company: 'TechCorp', companyId: 'company_1', startDate: '2021-03', endDate: 'Present', location: 'San Francisco, CA', description: 'Leading frontend architecture and mentoring junior engineers. Built component library used by 50+ developers across 3 product teams.' },
      { id: 'exp_2', title: 'Software Engineer', company: 'StartupXYZ', companyId: 'company_2', startDate: '2018-06', endDate: '2021-02', location: 'San Francisco, CA', description: 'Full stack development with React and Node.js. Shipped 3 major product features that increased user engagement by 40%.' },
      { id: 'exp_3', title: 'Junior Developer', company: 'WebAgency', companyId: 'company_3', startDate: '2016-08', endDate: '2018-05', location: 'Oakland, CA', description: 'Built responsive websites and web applications for clients across e-commerce and SaaS industries.' }
    ],
    education: [
      { id: 'edu_1', school: 'Stanford University', degree: 'BS Computer Science', year: '2016' },
      { id: 'edu_2', school: 'De Anza College', degree: 'AA Liberal Arts', year: '2014' }
    ],
    skills: [
      { id: 's1', name: 'React', endorsements: 34 },
      { id: 's2', name: 'JavaScript', endorsements: 28 },
      { id: 's3', name: 'TypeScript', endorsements: 19 },
      { id: 's4', name: 'Node.js', endorsements: 15 },
      { id: 's5', name: 'Python', endorsements: 12 },
      { id: 's6', name: 'AWS', endorsements: 8 },
      { id: 's7', name: 'GraphQL', endorsements: 6 },
      { id: 's8', name: 'System Design', endorsements: 4 }
    ]
  },

  users: {
    user_2: {
      id: 'user_2',
      name: 'Sarah Jenkins',
      headline: 'Product Manager at InnovateTech | Building Products That Matter',
      location: 'New York, NY',
      about: 'Product leader with 6 years of experience driving B2B SaaS growth. I believe in data-driven decisions and cross-functional collaboration.\n\nPreviously led product at two YC startups. Passionate about product-led growth and user research.',
      avatar: 'https://i.pravatar.cc/200?u=user_2',
      banner: 'https://picsum.photos/1200/400?random=banner2',
      connections: ['user_admin', 'user_3', 'user_5', 'user_6'],
      experience: [
        { id: 'exp_u2_1', title: 'Senior Product Manager', company: 'InnovateTech', companyId: 'company_4', startDate: '2022-01', endDate: 'Present', location: 'New York, NY', description: 'Leading product strategy for the enterprise platform. Grew ARR by 60% through feature prioritization and user research.' },
        { id: 'exp_u2_2', title: 'Product Manager', company: 'StartupXYZ', companyId: 'company_2', startDate: '2019-03', endDate: '2021-12', location: 'San Francisco, CA', description: 'Launched 5 major features from concept to release, serving 100K+ users.' }
      ],
      education: [
        { id: 'edu_u2_1', school: 'Columbia University', degree: 'MBA', year: '2019' },
        { id: 'edu_u2_2', school: 'UC Berkeley', degree: 'BA Economics', year: '2016' }
      ],
      skills: [
        { id: 'sk_u2_1', name: 'Product Strategy', endorsements: 31 },
        { id: 'sk_u2_2', name: 'User Research', endorsements: 22 },
        { id: 'sk_u2_3', name: 'Agile', endorsements: 18 },
        { id: 'sk_u2_4', name: 'SQL', endorsements: 9 }
      ]
    },
    user_3: {
      id: 'user_3',
      name: 'David Chen',
      headline: 'UX Designer | Creative Director at DesignStudio',
      location: 'Seattle, WA',
      about: 'Design leader passionate about creating intuitive, accessible interfaces. 10+ years in UX/UI design across consumer and enterprise products.\n\nI run a design mentorship group that has helped 200+ designers level up their careers.',
      avatar: 'https://i.pravatar.cc/200?u=user_3',
      banner: 'https://picsum.photos/1200/400?random=banner3',
      connections: ['user_admin', 'user_2', 'user_5', 'user_8'],
      experience: [
        { id: 'exp_u3_1', title: 'Creative Director', company: 'DesignStudio', companyId: 'company_3', startDate: '2020-06', endDate: 'Present', location: 'Seattle, WA', description: 'Leading a team of 12 designers. Established the company\'s design system used by 8 product teams.' },
        { id: 'exp_u3_2', title: 'Senior UX Designer', company: 'TechCorp', companyId: 'company_1', startDate: '2017-01', endDate: '2020-05', location: 'San Francisco, CA', description: 'Redesigned the core product experience, improving task completion rates by 35%.' }
      ],
      education: [
        { id: 'edu_u3_1', school: 'Rhode Island School of Design', degree: 'MFA Graphic Design', year: '2017' }
      ],
      skills: [
        { id: 'sk_u3_1', name: 'Figma', endorsements: 42 },
        { id: 'sk_u3_2', name: 'Design Systems', endorsements: 28 },
        { id: 'sk_u3_3', name: 'User Research', endorsements: 19 },
        { id: 'sk_u3_4', name: 'Prototyping', endorsements: 15 },
        { id: 'sk_u3_5', name: 'CSS', endorsements: 11 }
      ]
    },
    user_4: {
      id: 'user_4',
      name: 'Emily Watson',
      headline: 'Technical Recruiter at GlobalTalent | Connecting Great People with Great Opportunities',
      location: 'Austin, TX',
      about: 'Helping engineers and designers find their dream roles at top tech companies. I\'ve placed 200+ candidates in the last 3 years.\n\nIf you\'re exploring new opportunities, feel free to reach out!',
      avatar: 'https://i.pravatar.cc/200?u=user_4',
      banner: 'https://picsum.photos/1200/400?random=banner4',
      connections: ['user_7', 'user_9'],
      experience: [
        { id: 'exp_u4_1', title: 'Senior Technical Recruiter', company: 'GlobalTalent', companyId: 'company_6', startDate: '2021-04', endDate: 'Present', location: 'Austin, TX', description: 'Recruiting for senior engineering and design roles at FAANG and high-growth startups.' },
        { id: 'exp_u4_2', title: 'Recruiter', company: 'TalentFirst', startDate: '2018-09', endDate: '2021-03', location: 'Austin, TX', description: 'Full-cycle recruiting for software engineering positions.' }
      ],
      education: [
        { id: 'edu_u4_1', school: 'University of Texas at Austin', degree: 'BA Communications', year: '2018' }
      ],
      skills: [
        { id: 'sk_u4_1', name: 'Technical Recruiting', endorsements: 37 },
        { id: 'sk_u4_2', name: 'Sourcing', endorsements: 25 },
        { id: 'sk_u4_3', name: 'XinkedIn Recruiter', endorsements: 20 }
      ]
    },
    user_5: {
      id: 'user_5',
      name: 'Marcus Johnson',
      headline: 'Backend Engineer at CloudScale | Distributed Systems Enthusiast',
      location: 'Chicago, IL',
      about: 'Backend engineer focused on building reliable, scalable distributed systems. I work primarily with Go, Kubernetes, and AWS.\n\nActive open source contributor and conference speaker. Wrote the popular "Microservices Done Right" blog series.',
      avatar: 'https://i.pravatar.cc/200?u=user_5',
      banner: 'https://picsum.photos/1200/400?random=banner5',
      connections: ['user_admin', 'user_2', 'user_3', 'user_6'],
      experience: [
        { id: 'exp_u5_1', title: 'Senior Backend Engineer', company: 'CloudScale', companyId: 'company_5', startDate: '2021-08', endDate: 'Present', location: 'Chicago, IL', description: 'Building infrastructure for real-time data processing. Reduced p99 latency by 70% across core services.' },
        { id: 'exp_u5_2', title: 'Backend Engineer', company: 'DataStream Inc', startDate: '2018-02', endDate: '2021-07', location: 'Chicago, IL', description: 'Designed and implemented event-driven architecture handling 1M+ events per second.' },
        { id: 'exp_u5_3', title: 'Software Developer', company: 'CodeFactory', startDate: '2016-06', endDate: '2018-01', location: 'Detroit, MI', description: 'Full stack development with Java and React.' }
      ],
      education: [
        { id: 'edu_u5_1', school: 'University of Michigan', degree: 'BS Computer Engineering', year: '2016' }
      ],
      skills: [
        { id: 'sk_u5_1', name: 'Go', endorsements: 29 },
        { id: 'sk_u5_2', name: 'Kubernetes', endorsements: 24 },
        { id: 'sk_u5_3', name: 'AWS', endorsements: 21 },
        { id: 'sk_u5_4', name: 'Distributed Systems', endorsements: 18 },
        { id: 'sk_u5_5', name: 'PostgreSQL', endorsements: 14 }
      ]
    },
    user_6: {
      id: 'user_6',
      name: 'Priya Patel',
      headline: 'Data Scientist at AnalyticsCo | ML/AI | Speaker',
      location: 'San Francisco, CA',
      about: 'Data scientist with a focus on NLP and recommendation systems. Published researcher with 5 papers on applied machine learning.\n\nI enjoy mentoring aspiring data scientists and speaking at industry conferences about practical ML applications.',
      avatar: 'https://i.pravatar.cc/200?u=user_6',
      banner: 'https://picsum.photos/1200/400?random=banner6',
      connections: ['user_admin', 'user_2', 'user_5', 'user_8'],
      experience: [
        { id: 'exp_u6_1', title: 'Senior Data Scientist', company: 'AnalyticsCo', startDate: '2022-03', endDate: 'Present', location: 'San Francisco, CA', description: 'Building recommendation models that drive 30% of platform revenue. Leading a team of 4 data scientists.' },
        { id: 'exp_u6_2', title: 'Data Scientist', company: 'TechCorp', companyId: 'company_1', startDate: '2019-06', endDate: '2022-02', location: 'San Francisco, CA', description: 'Developed NLP pipelines for customer support automation, reducing ticket resolution time by 45%.' }
      ],
      education: [
        { id: 'edu_u6_1', school: 'MIT', degree: 'MS Computer Science (AI)', year: '2019' },
        { id: 'edu_u6_2', school: 'IIT Delhi', degree: 'BTech Computer Science', year: '2017' }
      ],
      skills: [
        { id: 'sk_u6_1', name: 'Machine Learning', endorsements: 38 },
        { id: 'sk_u6_2', name: 'Python', endorsements: 35 },
        { id: 'sk_u6_3', name: 'TensorFlow', endorsements: 22 },
        { id: 'sk_u6_4', name: 'NLP', endorsements: 19 },
        { id: 'sk_u6_5', name: 'SQL', endorsements: 15 }
      ]
    },
    user_7: {
      id: 'user_7',
      name: 'James Rodriguez',
      headline: 'VP of Engineering at FinanceApp | Building High-Performance Teams',
      location: 'New York, NY',
      about: 'Engineering leader with 15+ years of experience scaling engineering organizations from 10 to 200+ engineers.\n\nPassionate about engineering culture, technical strategy, and developing the next generation of engineering leaders.',
      avatar: 'https://i.pravatar.cc/200?u=user_7',
      banner: 'https://picsum.photos/1200/400?random=banner7',
      connections: ['user_4', 'user_9'],
      experience: [
        { id: 'exp_u7_1', title: 'VP of Engineering', company: 'FinanceApp', startDate: '2022-01', endDate: 'Present', location: 'New York, NY', description: 'Leading 150+ engineers across 12 teams. Driving technical strategy for a $2B fintech platform.' },
        { id: 'exp_u7_2', title: 'Director of Engineering', company: 'TechCorp', companyId: 'company_1', startDate: '2018-03', endDate: '2021-12', location: 'San Francisco, CA', description: 'Grew the engineering team from 30 to 80 engineers. Shipped 4 major platform initiatives.' },
        { id: 'exp_u7_3', title: 'Engineering Manager', company: 'BigCo', startDate: '2014-06', endDate: '2018-02', location: 'Seattle, WA', description: 'Managed a team of 15 engineers building cloud infrastructure products.' }
      ],
      education: [
        { id: 'edu_u7_1', school: 'Carnegie Mellon University', degree: 'MS Software Engineering', year: '2014' },
        { id: 'edu_u7_2', school: 'Georgia Tech', degree: 'BS Computer Science', year: '2012' }
      ],
      skills: [
        { id: 'sk_u7_1', name: 'Engineering Management', endorsements: 45 },
        { id: 'sk_u7_2', name: 'Technical Strategy', endorsements: 32 },
        { id: 'sk_u7_3', name: 'System Design', endorsements: 28 },
        { id: 'sk_u7_4', name: 'Agile', endorsements: 20 }
      ]
    },
    user_8: {
      id: 'user_8',
      name: 'Lisa Thompson',
      headline: 'Marketing Director at BrandFirst | Growth & Brand Strategy',
      location: 'London, UK',
      about: 'Marketing leader driving brand and growth strategy for B2B tech companies. 12+ years of experience across content marketing, demand gen, and brand building.\n\nI write about marketing leadership, brand storytelling, and the intersection of creativity and data.',
      avatar: 'https://i.pravatar.cc/200?u=user_8',
      banner: 'https://picsum.photos/1200/400?random=banner8',
      connections: ['user_admin', 'user_3', 'user_6'],
      experience: [
        { id: 'exp_u8_1', title: 'Marketing Director', company: 'BrandFirst', startDate: '2021-09', endDate: 'Present', location: 'London, UK', description: 'Leading brand and demand generation for a global SaaS platform. Grew organic traffic 300% in 18 months.' },
        { id: 'exp_u8_2', title: 'Senior Marketing Manager', company: 'InnovateTech', companyId: 'company_4', startDate: '2018-01', endDate: '2021-08', location: 'New York, NY', description: 'Built and scaled content marketing program from scratch. Generated $5M in pipeline through content initiatives.' }
      ],
      education: [
        { id: 'edu_u8_1', school: 'London School of Economics', degree: 'MSc Marketing', year: '2017' },
        { id: 'edu_u8_2', school: 'University of Manchester', degree: 'BA Business Studies', year: '2015' }
      ],
      skills: [
        { id: 'sk_u8_1', name: 'Content Marketing', endorsements: 33 },
        { id: 'sk_u8_2', name: 'Brand Strategy', endorsements: 27 },
        { id: 'sk_u8_3', name: 'SEO', endorsements: 21 },
        { id: 'sk_u8_4', name: 'Marketing Analytics', endorsements: 16 },
        { id: 'sk_u8_5', name: 'HubSpot', endorsements: 11 }
      ]
    },
    user_9: {
      id: 'user_9',
      name: 'Kevin Wu',
      headline: 'Startup Founder & CEO at DevTools Inc | Ex-Google',
      location: 'Remote',
      about: 'Building the future of developer productivity at DevTools Inc. Previously spent 5 years at Google working on Chrome DevTools and V8.\n\nI\'m passionate about open source, developer experience, and building tools that make engineers more productive. Always happy to chat about startups and developer tools.',
      avatar: 'https://i.pravatar.cc/200?u=user_9',
      banner: 'https://picsum.photos/1200/400?random=banner9',
      connections: ['user_4', 'user_7'],
      experience: [
        { id: 'exp_u9_1', title: 'Founder & CEO', company: 'DevTools Inc', startDate: '2023-01', endDate: 'Present', location: 'Remote', description: 'Building an AI-powered code review platform. Raised $4M seed round. Growing to 50K monthly active developers.' },
        { id: 'exp_u9_2', title: 'Senior Software Engineer', company: 'Google', startDate: '2018-07', endDate: '2022-12', location: 'Mountain View, CA', description: 'Worked on Chrome DevTools and V8 JavaScript engine. Led the performance profiling tools team.' },
        { id: 'exp_u9_3', title: 'Software Engineer', company: 'Microsoft', startDate: '2016-08', endDate: '2018-06', location: 'Redmond, WA', description: 'Contributed to Visual Studio Code editor extensions and TypeScript tooling.' }
      ],
      education: [
        { id: 'edu_u9_1', school: 'UC Berkeley', degree: 'BS EECS', year: '2016' }
      ],
      skills: [
        { id: 'sk_u9_1', name: 'JavaScript', endorsements: 41 },
        { id: 'sk_u9_2', name: 'TypeScript', endorsements: 36 },
        { id: 'sk_u9_3', name: 'Startup Leadership', endorsements: 15 },
        { id: 'sk_u9_4', name: 'Developer Tools', endorsements: 12 },
        { id: 'sk_u9_5', name: 'Open Source', endorsements: 10 }
      ]
    }
  },

  companies: {
    company_1: { id: 'company_1', name: 'TechCorp', logo: 'https://picsum.photos/100/100?random=co1', industry: 'Technology', size: '1,001-5,000 employees', headquarters: 'San Francisco, CA', description: 'Building next-generation developer tools and cloud infrastructure for modern engineering teams.' },
    company_2: { id: 'company_2', name: 'StartupXYZ', logo: 'https://picsum.photos/100/100?random=co2', industry: 'Technology', size: '51-200 employees', headquarters: 'San Francisco, CA', description: 'A YC-backed startup building collaborative productivity tools for distributed teams.' },
    company_3: { id: 'company_3', name: 'DesignStudio', logo: 'https://picsum.photos/100/100?random=co3', industry: 'Design Services', size: '201-500 employees', headquarters: 'Seattle, WA', description: 'Award-winning design agency creating world-class digital experiences for Fortune 500 companies.' },
    company_4: { id: 'company_4', name: 'InnovateTech', logo: 'https://picsum.photos/100/100?random=co4', industry: 'Software', size: '501-1,000 employees', headquarters: 'New York, NY', description: 'Enterprise SaaS platform helping businesses automate workflows and improve operational efficiency.' },
    company_5: { id: 'company_5', name: 'CloudScale', logo: 'https://picsum.photos/100/100?random=co5', industry: 'Cloud Computing', size: '1,001-5,000 employees', headquarters: 'Chicago, IL', description: 'Cloud-native infrastructure platform for real-time data processing and analytics at scale.' },
    company_6: { id: 'company_6', name: 'GlobalTalent', logo: 'https://picsum.photos/100/100?random=co6', industry: 'Staffing & Recruiting', size: '201-500 employees', headquarters: 'Austin, TX', description: 'Premier technical recruiting firm specializing in placing top engineering talent at innovative companies.' }
  },

  posts: [
    {
      id: 'post_1',
      userId: 'user_2',
      content: 'Excited to announce that InnovateTech just closed our Series C! The team has worked incredibly hard over the last 18 months, and this funding will help us expand into 3 new markets.\n\nA huge thank you to everyone who believed in our vision. The best is yet to come! #startup #productmanagement #growth',
      image: 'https://picsum.photos/800/400?random=post1',
      reactions: { like: ['user_admin', 'user_5', 'user_6'], celebrate: ['user_3', 'user_8'], love: ['user_4'], insightful: [], funny: [], curious: [] },
      comments: [
        { id: 'c1', userId: 'user_3', content: 'Congrats Sarah! Well deserved. The product has come so far.', created: daysAgo(0, 4), likes: ['user_admin'] },
        { id: 'c2', userId: 'user_admin', content: 'Amazing news! So proud of the whole team.', created: daysAgo(0, 3), likes: ['user_2'] },
        { id: 'c3', userId: 'user_8', content: 'This is fantastic! Looking forward to the next chapter.', created: daysAgo(0, 2), likes: [] }
      ],
      created: daysAgo(0, 6),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_2',
      userId: 'user_3',
      content: 'Just published a comprehensive guide on building Design Systems from scratch. After 3 years of leading design system initiatives, here are the 5 biggest lessons I\'ve learned:\n\n1. Start with an audit, not a component\n2. Get engineering buy-in from day one\n3. Document the "why" not just the "how"\n4. Ship incrementally, not all at once\n5. Measure adoption, not just coverage\n\nLink in comments. Would love to hear your experiences! #designsystems #ux #productdesign',
      image: null,
      reactions: { like: ['user_admin', 'user_8'], celebrate: [], love: [], insightful: ['user_2', 'user_5', 'user_6'], funny: [], curious: ['user_9'] },
      comments: [
        { id: 'c4', userId: 'user_admin', content: 'Great insights David! Point 2 is so important. We struggled with that at TechCorp initially.', created: daysAgo(1, 2), likes: ['user_3'] },
        { id: 'c5', userId: 'user_6', content: 'Bookmarking this. We are starting a design system project next quarter.', created: daysAgo(1, 1), likes: [] }
      ],
      created: daysAgo(1, 4),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_3',
      userId: 'user_5',
      content: '5 things I wish someone told me before I started working on distributed systems:\n\n1. The network is never reliable\n2. Clock synchronization is harder than you think\n3. Eventual consistency is a feature, not a bug\n4. Monitoring > Testing for production issues\n5. Simplicity always wins in the long run\n\nWhat would you add to this list? #distributedSystems #engineering #backend',
      image: null,
      reactions: { like: ['user_admin', 'user_3'], celebrate: [], love: [], insightful: ['user_6', 'user_7', 'user_9'], funny: [], curious: ['user_2'] },
      comments: [
        { id: 'c6', userId: 'user_admin', content: 'I would add: "Idempotency is your best friend." Great list Marcus!', created: daysAgo(1, 10), likes: ['user_5', 'user_6'] },
        { id: 'c7', userId: 'user_9', content: 'Number 5 is so true. I see teams over-engineer solutions all the time.', created: daysAgo(1, 8), likes: ['user_5'] },
        { id: 'c8', userId: 'user_7', content: 'Would also add: "Design for failure from the start." Solid list though.', created: daysAgo(1, 6), likes: ['user_admin', 'user_5'] }
      ],
      created: daysAgo(1, 12),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_4',
      userId: 'user_6',
      content: 'Thrilled to share that our paper "Scalable NLP Pipelines for Customer Intent Detection" has been accepted at NeurIPS 2026!\n\nThis work represents 8 months of research on improving intent classification accuracy in low-resource language settings. We achieved 94.2% accuracy with 10x less training data.\n\nProud of my co-authors and the incredible research team at AnalyticsCo. #machinelearning #NLP #research',
      image: 'https://picsum.photos/800/400?random=post4',
      reactions: { like: ['user_admin', 'user_2', 'user_5'], celebrate: ['user_3', 'user_8', 'user_9'], love: ['user_7'], insightful: [], funny: [], curious: [] },
      comments: [
        { id: 'c9', userId: 'user_admin', content: 'Incredible work Priya! NeurIPS is a huge achievement.', created: daysAgo(2, 3), likes: ['user_6'] },
        { id: 'c10', userId: 'user_5', content: 'Congratulations! Would love to read the paper when it is published.', created: daysAgo(2, 2), likes: [] },
        { id: 'c11', userId: 'user_9', content: '94.2% with 10x less data is remarkable. The low-resource angle is exactly what the industry needs.', created: daysAgo(2, 1), likes: ['user_6', 'user_admin'] }
      ],
      created: daysAgo(2, 8),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_5',
      userId: 'user_admin',
      content: 'After 3 years at TechCorp, I am still learning something new every week. This week it was about React Server Components and how they fundamentally change the way we think about data fetching.\n\nThe key insight: move data fetching closer to where data is used, not where the component tree starts.\n\nAnyone else experimenting with RSC in production? Would love to exchange notes. #react #frontend #webdev',
      image: null,
      reactions: { like: ['user_2', 'user_3', 'user_5'], celebrate: [], love: [], insightful: ['user_9'], funny: [], curious: ['user_6'] },
      comments: [
        { id: 'c12', userId: 'user_9', content: 'We started adopting RSC at DevTools Inc last month. The DX improvement is significant but there is a learning curve for the team. Happy to chat!', created: daysAgo(3, 2), likes: ['user_admin'] },
        { id: 'c13', userId: 'user_3', content: 'From a design perspective, RSC changes how we think about loading states too. Interesting shift.', created: daysAgo(3, 1), likes: [] }
      ],
      created: daysAgo(3, 5),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_6',
      userId: 'user_8',
      content: 'Hot take: Most B2B companies are spending too much on paid acquisition and not enough on building a genuine community around their product.\n\nThe companies winning in 2026 are the ones where customers voluntarily become advocates. Community-led growth is not just a buzzword - it is a fundamentally different go-to-market motion.\n\nHere is what I have seen work:\n- Developer relations that actually help developers\n- User conferences with real content, not sales pitches\n- Open source contributions that solve real problems\n- Customer advisory boards with actual influence\n\n#marketing #growth #community #b2b',
      image: null,
      reactions: { like: ['user_2', 'user_admin'], celebrate: [], love: [], insightful: ['user_3', 'user_9'], funny: [], curious: ['user_7'] },
      comments: [
        { id: 'c14', userId: 'user_2', content: 'Completely agree Lisa. We shifted 30% of our acquisition budget to community programs last year and saw better retention as a result.', created: daysAgo(3, 8), likes: ['user_8'] },
        { id: 'c15', userId: 'user_9', content: 'As a founder, this resonates deeply. Our best growth channel has been our Discord community and open source work.', created: daysAgo(3, 6), likes: ['user_8', 'user_admin'] }
      ],
      created: daysAgo(3, 14),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_7',
      userId: 'user_4',
      content: 'We are hiring! GlobalTalent is looking for Technical Sourcers and Senior Recruiters to join our growing team in Austin.\n\nWhat makes us different:\n- We actually understand the tech we recruit for\n- Competitive base + uncapped commission\n- Remote-friendly with optional Austin office\n- Amazing team culture (not just saying that!)\n\nDM me if interested or tag someone who might be a great fit! #hiring #recruiting #techrecruiting #jobs',
      image: 'https://picsum.photos/800/400?random=post7',
      reactions: { like: ['user_7'], celebrate: ['user_9'], love: [], insightful: [], funny: [], curious: [] },
      comments: [
        { id: 'c16', userId: 'user_7', content: 'Great team! I have worked with GlobalTalent for hiring at FinanceApp and the quality of candidates has been outstanding.', created: daysAgo(4, 3), likes: ['user_4'] }
      ],
      created: daysAgo(4, 6),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_8',
      userId: 'user_7',
      content: 'Reflecting on what I have learned managing engineering teams for 15 years. The biggest lesson: your job as an engineering leader is NOT to write the best code or make every technical decision.\n\nYour job is to create an environment where your team can do their best work.\n\nThat means:\n- Clear context on business priorities\n- Psychological safety to take risks\n- Growth opportunities for every engineer\n- Removing blockers, not adding process\n\nThe best technical leaders I know spend 80% of their time on people and context, 20% on technology. #engineering #leadership #management',
      image: null,
      reactions: { like: ['user_admin', 'user_5', 'user_4'], celebrate: ['user_9'], love: ['user_2'], insightful: ['user_3', 'user_6', 'user_8'], funny: [], curious: [] },
      comments: [
        { id: 'c17', userId: 'user_admin', content: 'This is gold. The "removing blockers, not adding process" point especially resonates with my experience.', created: daysAgo(4, 10), likes: ['user_7'] },
        { id: 'c18', userId: 'user_5', content: 'Totally agree. The best managers I have had were the ones who shielded the team and gave us room to experiment.', created: daysAgo(4, 8), likes: ['user_7', 'user_admin'] },
        { id: 'c19', userId: 'user_9', content: 'As a first-time founder learning to manage engineers, this is incredibly helpful. Thank you for sharing James.', created: daysAgo(4, 6), likes: ['user_7'] },
        { id: 'c20', userId: 'user_6', content: 'The psychological safety point cannot be overstated. Teams that feel safe to fail are teams that innovate.', created: daysAgo(4, 4), likes: ['user_7', 'user_admin', 'user_5'] }
      ],
      created: daysAgo(5, 2),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_9',
      userId: 'user_9',
      content: 'We just crossed 50,000 monthly active developers on DevTools Inc! When I left Google to start this company 2 years ago, people thought I was crazy.\n\nBut I believed that developer tools could be 10x better with AI. And now 50K developers agree.\n\nGrateful for every user, every bug report, and every feature request. You all make this product better every day.\n\nNext milestone: 100K MAD by end of year. Let\'s go! #startup #devtools #ai #milestone',
      image: 'https://picsum.photos/800/400?random=post9',
      reactions: { like: ['user_5', 'user_7'], celebrate: ['user_admin', 'user_2', 'user_3', 'user_4'], love: ['user_6'], insightful: [], funny: [], curious: [] },
      comments: [
        { id: 'c21', userId: 'user_admin', content: 'Huge milestone Kevin! I have been using DevTools Inc for 3 months and it has genuinely improved my workflow.', created: daysAgo(5, 10), likes: ['user_9'] },
        { id: 'c22', userId: 'user_7', content: 'Incredible growth. If you ever need advice on scaling the eng org, happy to help.', created: daysAgo(5, 8), likes: ['user_9'] },
        { id: 'c23', userId: 'user_4', content: 'We are seeing a lot of candidates mention DevTools Inc as a tool they love. That is a strong signal!', created: daysAgo(5, 6), likes: [] }
      ],
      created: daysAgo(5, 14),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_10',
      userId: 'user_admin',
      content: 'Question for my network: What is your preferred state management approach for large React applications in 2026?\n\nI have been evaluating options for a new project:\n- React Context + useReducer\n- Zustand\n- Jotai\n- Redux Toolkit\n- TanStack Query (for server state)\n\nWe need something that scales to 50+ components with complex interactions. Curious what has worked well for you in practice. #react #frontend #javascript',
      image: null,
      reactions: { like: ['user_3', 'user_9'], celebrate: [], love: [], insightful: [], funny: [], curious: ['user_5', 'user_6'] },
      comments: [
        { id: 'c24', userId: 'user_5', content: 'Zustand + TanStack Query is my go-to combo. Zustand for client state, TanStack for server state. Clean separation.', created: daysAgo(6, 3), likes: ['user_admin', 'user_9'] },
        { id: 'c25', userId: 'user_9', content: 'We use Jotai at DevTools Inc and love it. The atomic model maps really well to our UI architecture.', created: daysAgo(6, 2), likes: ['user_admin'] },
        { id: 'c26', userId: 'user_3', content: 'From a design handoff perspective, I love when teams use something simple like Zustand. Makes it easier to reason about component behavior during design reviews.', created: daysAgo(6, 1), likes: [] }
      ],
      created: daysAgo(6, 8),
      repostedBy: null,
      repostOf: null
    },
    {
      id: 'post_11',
      userId: 'user_6',
      content: 'Unpopular opinion: most companies do NOT need a dedicated ML infrastructure team. What they need is better data engineering and simpler models.\n\nI have seen too many teams build complex MLOps platforms when a well-tuned gradient boosted tree would solve their problem in a fraction of the time.\n\nStart simple. Scale when you have evidence you need to. #machinelearning #datascience #engineering',
      image: null,
      reactions: { like: ['user_5'], celebrate: [], love: [], insightful: ['user_admin', 'user_7'], funny: ['user_9'], curious: ['user_2'] },
      comments: [
        { id: 'c27', userId: 'user_5', content: 'This applies to infrastructure in general. The simplest solution that works is almost always the right one.', created: daysAgo(6, 14), likes: ['user_6'] }
      ],
      created: daysAgo(6, 18),
      repostedBy: null,
      repostOf: null
    }
  ],

  jobs: [
    {
      id: 'job_1',
      title: 'Frontend Engineer',
      company: 'InnovateTech',
      companyId: 'company_4',
      location: 'Remote',
      type: 'Full-time',
      level: 'Mid-Senior level',
      logo: 'https://picsum.photos/100/100?random=co4',
      description: 'We are looking for a talented Frontend Engineer to join our product team. You will work on building responsive, performant user interfaces for our enterprise SaaS platform used by over 10,000 businesses worldwide. Our stack includes React, TypeScript, and GraphQL.',
      requirements: ['3+ years of experience with React and TypeScript', 'Strong understanding of web performance optimization', 'Experience with GraphQL and RESTful APIs', 'Familiarity with design systems and component libraries', 'Excellent communication skills and collaborative mindset'],
      salary: '$130,000 - $180,000/yr',
      posted: '2 days ago',
      postedDate: daysAgo(2),
      applicants: 47,
      saved: false,
      applied: false
    },
    {
      id: 'job_2',
      title: 'Product Designer',
      company: 'DesignStudio',
      companyId: 'company_3',
      location: 'Seattle, WA',
      type: 'Full-time',
      level: 'Mid-Senior level',
      logo: 'https://picsum.photos/100/100?random=co3',
      description: 'Join our design team to create beautiful, intuitive interfaces for our Fortune 500 clients. You will lead end-to-end design for major projects, collaborating closely with researchers, engineers, and stakeholders. We value design thinking and data-informed decisions.',
      requirements: ['5+ years of product design experience', 'Expert-level proficiency in Figma', 'Strong portfolio demonstrating end-to-end design process', 'Experience conducting user research and usability testing', 'Understanding of accessibility standards (WCAG 2.1)'],
      salary: '$140,000 - $190,000/yr',
      posted: '5 days ago',
      postedDate: daysAgo(5),
      applicants: 63,
      saved: false,
      applied: false
    },
    {
      id: 'job_3',
      title: 'Data Analyst',
      company: 'AnalyticsCo',
      companyId: null,
      location: 'San Francisco, CA',
      type: 'Full-time',
      level: 'Entry level',
      logo: 'https://picsum.photos/100/100?random=analyticsCo',
      description: 'We are seeking a Data Analyst to join our growing analytics team. You will transform raw data into actionable insights that drive business decisions. This is a great opportunity for early-career analysts who want to work with cutting-edge ML models and large datasets.',
      requirements: ['Bachelor\'s degree in Statistics, Mathematics, or related field', 'Proficiency in SQL and Python', 'Experience with data visualization tools (Tableau, Looker)', 'Strong analytical and problem-solving skills', 'Basic understanding of statistical modeling'],
      salary: '$85,000 - $110,000/yr',
      posted: '1 day ago',
      postedDate: daysAgo(1),
      applicants: 124,
      saved: false,
      applied: false
    },
    {
      id: 'job_4',
      title: 'DevOps Engineer',
      company: 'CloudScale',
      companyId: 'company_5',
      location: 'Chicago, IL (Hybrid)',
      type: 'Full-time',
      level: 'Mid-Senior level',
      logo: 'https://picsum.photos/100/100?random=co5',
      description: 'Help us build and maintain the cloud infrastructure that powers real-time data processing for thousands of customers. You will work on Kubernetes clusters, CI/CD pipelines, and observability systems. Our infrastructure handles 1M+ events per second.',
      requirements: ['4+ years of DevOps/SRE experience', 'Strong experience with Kubernetes and Docker', 'Proficiency with AWS or GCP services', 'Experience with Terraform or Pulumi for IaC', 'Knowledge of monitoring tools (Prometheus, Grafana, Datadog)', 'Scripting in Python or Go'],
      salary: '$145,000 - $195,000/yr',
      posted: '3 days ago',
      postedDate: daysAgo(3),
      applicants: 31,
      saved: false,
      applied: false
    },
    {
      id: 'job_5',
      title: 'Software Engineering Intern',
      company: 'TechCorp',
      companyId: 'company_1',
      location: 'San Francisco, CA',
      type: 'Internship',
      level: 'Entry level',
      logo: 'https://picsum.photos/100/100?random=co1',
      description: 'Join TechCorp for a 12-week summer internship where you will work alongside senior engineers on real product features. Interns at TechCorp ship code to production and present their work to the entire engineering org. This is a hands-on learning experience.',
      requirements: ['Currently pursuing BS/MS in Computer Science or related field', 'Familiarity with at least one programming language (JavaScript, Python, Java)', 'Understanding of data structures and algorithms', 'Enthusiasm for learning and building software', 'Expected graduation in 2026 or 2027'],
      salary: '$50/hr + housing stipend',
      posted: '1 week ago',
      postedDate: daysAgo(7),
      applicants: 256,
      saved: false,
      applied: false
    },
    {
      id: 'job_6',
      title: 'Marketing Manager',
      company: 'BrandFirst',
      companyId: null,
      location: 'London, UK (Remote)',
      type: 'Full-time',
      level: 'Associate',
      logo: 'https://picsum.photos/100/100?random=brandfirst',
      description: 'We are expanding our marketing team and looking for a Marketing Manager to own demand generation campaigns across digital channels. You will report to the Marketing Director and collaborate with content, design, and sales teams to drive pipeline growth.',
      requirements: ['3+ years of B2B marketing experience', 'Experience with marketing automation (HubSpot, Marketo)', 'Strong analytical skills and experience with marketing analytics', 'Excellent written communication skills', 'Experience with paid media campaigns (Google Ads, XinkedIn Ads)'],
      salary: null,
      posted: '4 days ago',
      postedDate: daysAgo(4),
      applicants: 89,
      saved: false,
      applied: false
    },
    {
      id: 'job_7',
      title: 'UX Researcher',
      company: 'InnovateTech',
      companyId: 'company_4',
      location: 'New York, NY',
      type: 'Contract',
      level: 'Mid-Senior level',
      logo: 'https://picsum.photos/100/100?random=co4',
      description: 'We need a UX Researcher to lead qualitative and quantitative research for our enterprise product suite. You will plan and conduct user studies, synthesize findings, and present actionable recommendations to product and design teams.',
      requirements: ['4+ years of UX research experience in enterprise/B2B', 'Experience with both qualitative and quantitative methods', 'Strong presentation and stakeholder communication skills', 'Proficiency with research tools (UserTesting, Dovetail, Optimal Workshop)', 'Experience with A/B testing and experiment design'],
      salary: '$70 - $90/hr',
      posted: '6 days ago',
      postedDate: daysAgo(6),
      applicants: 42,
      saved: false,
      applied: false
    }
  ],

  chats: [
    {
      id: 'chat_1',
      participants: ['user_admin', 'user_2'],
      messages: [
        { id: 'm1', senderId: 'user_2', content: 'Hi Alex! Are you coming to the tech meetup next week?', created: daysAgo(2, 8), read: true },
        { id: 'm2', senderId: 'user_admin', content: 'Hey Sarah! Yes, I wouldn\'t miss it. Are you presenting?', created: daysAgo(2, 7), read: true },
        { id: 'm3', senderId: 'user_2', content: 'I am! Talking about product-led growth strategies. Would love your feedback on my slides.', created: daysAgo(2, 6), read: true },
        { id: 'm4', senderId: 'user_admin', content: 'Absolutely! Let\'s grab coffee before and go over them.', created: daysAgo(2, 5), read: true },
        { id: 'm5', senderId: 'user_2', content: 'Perfect! How about meeting at the Blue Bottle near the venue at 5pm?', created: daysAgo(1, 3), read: true },
        { id: 'm6', senderId: 'user_admin', content: 'Sounds great, see you there!', created: daysAgo(1, 2), read: true }
      ]
    },
    {
      id: 'chat_2',
      participants: ['user_admin', 'user_3'],
      messages: [
        { id: 'm7', senderId: 'user_3', content: 'Hey Alex, I saw your post about React Server Components. Really interesting perspective!', created: daysAgo(3, 4), read: true },
        { id: 'm8', senderId: 'user_admin', content: 'Thanks David! Have you explored how RSC might affect design system architecture?', created: daysAgo(3, 3), read: true },
        { id: 'm9', senderId: 'user_3', content: 'Actually yes. I\'ve been thinking about how streaming rendering changes the UX of loading states. Want to collab on a blog post about it?', created: daysAgo(3, 2), read: true },
        { id: 'm10', senderId: 'user_admin', content: 'That would be awesome! Let\'s set up a call next week to outline it.', created: daysAgo(3, 1), read: true },
        { id: 'm11', senderId: 'user_3', content: 'Great, I\'ll send a calendar invite. Maybe Thursday afternoon?', created: daysAgo(2, 12), read: false }
      ]
    },
    {
      id: 'chat_3',
      participants: ['user_admin', 'user_5'],
      messages: [
        { id: 'm12', senderId: 'user_5', content: 'Alex, quick question - what\'s your team using for API gateway at TechCorp?', created: daysAgo(1, 6), read: true },
        { id: 'm13', senderId: 'user_admin', content: 'We\'re using Kong with custom plugins. It has been solid for us. Why do you ask?', created: daysAgo(1, 5), read: true },
        { id: 'm14', senderId: 'user_5', content: 'We\'re evaluating options at CloudScale. Deciding between Kong and AWS API Gateway. Any gotchas with Kong?', created: daysAgo(1, 4), read: true },
        { id: 'm15', senderId: 'user_admin', content: 'Main thing is plugin development can be tricky. The Lua ecosystem is smaller than you\'d expect. But the flexibility is worth it.', created: daysAgo(1, 3), read: true },
        { id: 'm16', senderId: 'user_5', content: 'Good to know, thanks! I\'ll add that to our evaluation doc.', created: daysAgo(0, 8), read: false }
      ]
    },
    {
      id: 'chat_4',
      participants: ['user_admin', 'user_6'],
      messages: [
        { id: 'm17', senderId: 'user_6', content: 'Hey Alex! Congratulations on the 3-year anniversary at TechCorp!', created: daysAgo(4, 6), read: true },
        { id: 'm18', senderId: 'user_admin', content: 'Thank you Priya! Time flies. How\'s the NeurIPS paper prep going?', created: daysAgo(4, 4), read: true },
        { id: 'm19', senderId: 'user_6', content: 'Stressful but exciting! We just got the acceptance notification. Feeling relieved honestly.', created: daysAgo(4, 3), read: true },
        { id: 'm20', senderId: 'user_admin', content: 'That\'s amazing! You deserve it. Will you be presenting in person?', created: daysAgo(4, 2), read: true }
      ]
    }
  ],

  notifications: [
    { id: 'n1', type: 'like', actorId: 'user_2', targetId: 'post_5', content: 'liked your post about React Server Components', read: false, created: daysAgo(0, 3) },
    { id: 'n2', type: 'comment', actorId: 'user_9', targetId: 'post_5', content: 'commented on your post', read: false, created: daysAgo(0, 4) },
    { id: 'n3', type: 'connection_request', actorId: 'user_4', targetId: null, content: 'wants to connect with you', read: false, created: daysAgo(0, 8) },
    { id: 'n4', type: 'connection_accept', actorId: 'user_6', targetId: null, content: 'accepted your connection request', read: true, created: daysAgo(1, 6) },
    { id: 'n5', type: 'profile_view', actorId: 'user_7', targetId: null, content: 'viewed your profile', read: true, created: daysAgo(2, 4) },
    { id: 'n6', type: 'endorsement', actorId: 'user_5', targetId: null, content: 'endorsed you for React', read: true, created: daysAgo(2, 12) },
    { id: 'n7', type: 'job_alert', actorId: null, targetId: 'job_1', content: 'New job matches your preferences: Frontend Engineer at InnovateTech', read: false, created: daysAgo(3, 2) },
    { id: 'n8', type: 'mention', actorId: 'user_8', targetId: 'post_6', content: 'mentioned you in a post', read: false, created: daysAgo(3, 6) },
    { id: 'n9', type: 'like', actorId: 'user_3', targetId: 'post_10', content: 'liked your post about state management', read: true, created: daysAgo(4, 2) },
    { id: 'n10', type: 'comment', actorId: 'user_5', targetId: 'post_10', content: 'commented on your post about state management', read: true, created: daysAgo(4, 4) }
  ],

  connectionRequests: [
    { id: 'req_1', fromUserId: 'user_4', toUserId: 'user_admin', note: 'Hi Alex! I came across your profile and would love to connect. I\'m a recruiter specializing in senior engineering roles and I think we could have some great conversations about the tech landscape.', status: 'pending', created: daysAgo(0, 8) },
    { id: 'req_2', fromUserId: 'user_7', toUserId: 'user_admin', note: '', status: 'pending', created: daysAgo(1, 12) },
    { id: 'req_3', fromUserId: 'user_9', toUserId: 'user_admin', note: 'Fellow engineer here! Love your posts about React architecture. Would be great to connect and exchange ideas about frontend tooling.', status: 'pending', created: daysAgo(2, 6) }
  ],

  followedCompanies: [],
  dismissedSuggestions: []
};

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'linkedin_mock_state';
const BASE_INITIAL_KEY = 'linkedin_mock_initialState';

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

// --- Array item normalizers ---

function normalizeReactions(raw) {
  const defaults = { like: [], celebrate: [], love: [], insightful: [], funny: [], curious: [] };
  if (!raw || typeof raw !== 'object') return defaults;
  return {
    like: Array.isArray(raw.like) ? raw.like : defaults.like,
    celebrate: Array.isArray(raw.celebrate) ? raw.celebrate : defaults.celebrate,
    love: Array.isArray(raw.love) ? raw.love : defaults.love,
    insightful: Array.isArray(raw.insightful) ? raw.insightful : defaults.insightful,
    funny: Array.isArray(raw.funny) ? raw.funny : defaults.funny,
    curious: Array.isArray(raw.curious) ? raw.curious : defaults.curious,
  };
}

function normalizeComment(comment, index) {
  return {
    id: comment.id || `comment_custom_${index}`,
    userId: comment.userId || comment.user || comment.authorId || 'user_admin',
    content: comment.content || comment.text || comment.body || '',
    created: comment.created || comment.createdAt || comment.timestamp || new Date().toISOString(),
    likes: Array.isArray(comment.likes) ? comment.likes : [],
  };
}

function normalizePost(post, index) {
  const rawComments = Array.isArray(post.comments) ? post.comments : [];
  // Backward compat: if post has likes but no reactions, convert
  let reactions;
  if (post.reactions) {
    reactions = normalizeReactions(post.reactions);
  } else if (Array.isArray(post.likes)) {
    reactions = { like: post.likes, celebrate: [], love: [], insightful: [], funny: [], curious: [] };
  } else {
    reactions = normalizeReactions(null);
  }
  return {
    id: post.id || `post_custom_${index}`,
    userId: post.userId || post.user || post.authorId || post.author || 'user_admin',
    content: post.content || post.text || post.body || '',
    image: post.image || post.img || post.media || null,
    reactions,
    comments: rawComments.map((c, i) => normalizeComment(c, i)),
    created: post.created || post.createdAt || post.timestamp || new Date().toISOString(),
    repostedBy: post.repostedBy || null,
    repostOf: post.repostOf || null,
  };
}

function normalizeJob(job, index) {
  return {
    id: job.id || `job_custom_${index}`,
    title: job.title || job.name || job.position || 'Untitled Position',
    company: job.company || job.companyName || job.employer || 'Unknown Company',
    companyId: job.companyId || null,
    location: job.location || job.city || 'Remote',
    type: job.type || job.employmentType || job.jobType || 'Full-time',
    level: job.level || job.experienceLevel || 'Mid-Senior level',
    logo: job.logo || job.companyLogo || job.icon || '',
    description: job.description || job.desc || job.summary || '',
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    salary: job.salary || null,
    posted: job.posted || job.postedAt || job.date || 'Recently',
    applicants: typeof job.applicants === 'number' ? job.applicants : 0,
    saved: typeof job.saved === 'boolean' ? job.saved : false,
    applied: typeof job.applied === 'boolean' ? job.applied : false,
  };
}

function normalizeMessage(message, index) {
  return {
    id: message.id || `msg_custom_${index}`,
    senderId: message.senderId || message.sender || message.from || message.userId || 'user_admin',
    content: message.content || message.text || message.body || '',
    created: message.created || message.createdAt || message.timestamp || new Date().toISOString(),
    read: typeof message.read === 'boolean' ? message.read : true,
  };
}

function normalizeChat(chat, index) {
  const participants = Array.isArray(chat.participants) ? chat.participants : [];
  const rawMessages = Array.isArray(chat.messages) ? chat.messages : [];
  return {
    id: chat.id || `chat_custom_${index}`,
    participants,
    messages: rawMessages.map((m, i) => normalizeMessage(m, i)),
  };
}

function normalizeNotification(notif, index) {
  return {
    id: notif.id || `notif_custom_${index}`,
    type: notif.type || 'like',
    actorId: notif.actorId || notif.actor || notif.userId || notif.fromUserId || null,
    targetId: notif.targetId || null,
    content: notif.content || notif.text || notif.message || '',
    read: typeof notif.read === 'boolean' ? notif.read : false,
    created: notif.created || notif.createdAt || notif.timestamp || new Date().toISOString(),
  };
}

function normalizeConnectionRequest(req, index) {
  return {
    id: req.id || `req_custom_${index}`,
    fromUserId: req.fromUserId || req.from || req.senderId || '',
    toUserId: req.toUserId || req.to || req.recipientId || '',
    note: req.note || req.message || '',
    status: req.status || 'pending',
    created: req.created || req.createdAt || req.timestamp || new Date().toISOString(),
  };
}

function normalizeExperience(exp, index) {
  return {
    id: exp.id || `exp_custom_${index}`,
    title: exp.title || exp.role || exp.position || '',
    company: exp.company || exp.companyName || exp.employer || '',
    companyId: exp.companyId || null,
    startDate: exp.startDate || exp.start || exp.from || '',
    endDate: exp.endDate || exp.end || exp.to || 'Present',
    location: exp.location || '',
    description: exp.description || exp.desc || exp.summary || '',
  };
}

function normalizeEducation(edu, index) {
  return {
    id: edu.id || `edu_custom_${index}`,
    school: edu.school || edu.institution || edu.university || '',
    degree: edu.degree || edu.program || edu.major || '',
    year: edu.year || edu.graduationYear || edu.endYear || '',
  };
}

function normalizeSkill(skill, index) {
  if (typeof skill === 'string') {
    return { id: `skill_custom_${index}`, name: skill, endorsements: 0 };
  }
  return {
    id: skill.id || `skill_custom_${index}`,
    name: skill.name || skill.title || skill.label || 'Unknown Skill',
    endorsements: typeof skill.endorsements === 'number' ? skill.endorsements : (typeof skill.count === 'number' ? skill.count : 0),
  };
}

const arrayNormalizers = {
  posts: normalizePost,
  jobs: normalizeJob,
  chats: normalizeChat,
  notifications: normalizeNotification,
  connectionRequests: normalizeConnectionRequest,
};

const currentUserArrayNormalizers = {
  experience: normalizeExperience,
  education: normalizeEducation,
  skills: normalizeSkill,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item, i) => arrayNormalizers[key](item, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        if (key === 'currentUser') {
          result[key] = deepMergeCurrentUser(defaults[key], custom[key]);
        } else {
          result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
        }
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

function deepMergeCurrentUser(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && currentUserArrayNormalizers[key]) {
        result[key] = custom[key].map((item, i) => currentUserArrayNormalizers[key](item, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

function createDefaultData() {
  return { ...INITIAL_STATE };
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
    const parsed = JSON.parse(stored);
    if (!parsed.connectionRequests) parsed.connectionRequests = [];
    if (!parsed.companies) parsed.companies = {};
    return parsed;
  }

  const initialData = createDefaultData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
