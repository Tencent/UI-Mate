
import { AppState } from '../types';

export const getDefaultData = (): AppState => {
  const now = Date.now();

  const users = [
    {
      userId: 'user0',
      nickname: '张小凡',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxiaofan',
      headline: '产品经理 / 科技爱好者',
      description: '关注互联网产品设计、人工智能、认知科学。热爱思考，喜欢分享。',
      gender: 'male' as const,
      location: '北京',
      industry: '互联网',
      employment: [{ company: '某互联网公司', job: '产品经理' }],
      education: [{ school: '清华大学', major: '计算机科学' }],
      followingCount: 85,
      followerCount: 45,
      voteupCount: 328,
      thankedCount: 56,
      favoriteCount: 123,
      answerCount: 42,
      articleCount: 15,
      questionCount: 8,
    },
    {
      userId: 'user1',
      nickname: '李明',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liming',
      headline: '互联网观察者',
      description: '资深互联网从业者，关注行业动态和产品创新。十年产品经验，曾主导多款千万级用户产品。',
      gender: 'male' as const,
      location: '上海',
      industry: '互联网',
      employment: [{ company: '某大厂', job: '高级产品经理' }],
      education: [{ school: '复旦大学', major: '工商管理' }],
      followingCount: 234,
      followerCount: 1523,
      voteupCount: 8934,
      thankedCount: 456,
      favoriteCount: 2341,
      answerCount: 256,
      articleCount: 45,
      questionCount: 23,
    },
    {
      userId: 'user2',
      nickname: '王芳',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangfang',
      headline: '心理学研究者',
      description: '心理学博士，专注认知心理学研究。在核心期刊发表论文20余篇，致力于将心理学知识普及化。',
      gender: 'female' as const,
      location: '北京',
      industry: '教育',
      employment: [{ company: '某大学', job: '副教授' }],
      education: [{ school: '北京师范大学', major: '心理学' }],
      followingCount: 156,
      followerCount: 2341,
      voteupCount: 12456,
      thankedCount: 789,
      favoriteCount: 3456,
      answerCount: 345,
      articleCount: 67,
      questionCount: 12,
    },
    {
      userId: 'user3',
      nickname: '赵强',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoqiang',
      headline: '全栈工程师',
      description: '开源爱好者，热爱技术分享。GitHub 5k+ stars，专注前端工程化和全栈开发。',
      gender: 'male' as const,
      location: '深圳',
      industry: '互联网',
      employment: [{ company: '某科技公司', job: '技术专家' }],
      education: [{ school: '浙江大学', major: '软件工程' }],
      followingCount: 312,
      followerCount: 4567,
      voteupCount: 15678,
      thankedCount: 1234,
      favoriteCount: 5678,
      answerCount: 456,
      articleCount: 89,
      questionCount: 34,
    },
    {
      userId: 'user4',
      nickname: '刘洋',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liuyang',
      headline: '财经分析师',
      description: '注册分析师，关注宏观经济与投资。CFA持证人，管理资产规模超10亿元。',
      gender: 'male' as const,
      location: '北京',
      industry: '金融',
      employment: [{ company: '某证券公司', job: '首席分析师' }],
      education: [{ school: '中国人民大学', major: '金融学' }],
      followingCount: 189,
      followerCount: 3456,
      voteupCount: 9876,
      thankedCount: 567,
      favoriteCount: 2345,
      answerCount: 234,
      articleCount: 56,
      questionCount: 18,
    },
    {
      userId: 'user5',
      nickname: '陈思',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chensi',
      headline: '美食博主',
      description: '美食爱好者，探店达人。全网粉丝50万+，走遍全国200+城市，只为寻找那一口美味。',
      gender: 'female' as const,
      location: '成都',
      industry: '自媒体',
      employment: [{ company: '自由职业', job: '美食博主' }],
      education: [{ school: '四川大学', major: '新闻传播' }],
      followingCount: 423,
      followerCount: 8934,
      voteupCount: 23456,
      thankedCount: 2345,
      favoriteCount: 6789,
      answerCount: 567,
      articleCount: 123,
      questionCount: 45,
    },
    {
      userId: 'user6',
      nickname: '周雨',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouyu',
      headline: '三甲医院主治医师',
      description: '内科学博士，从事临床工作8年。擅长常见病诊治和健康科普，希望用通俗的语言传递医学知识。',
      gender: 'female' as const,
      location: '广州',
      industry: '医疗',
      employment: [{ company: '某三甲医院', job: '主治医师' }],
      education: [{ school: '中山大学', major: '临床医学' }],
      followingCount: 98,
      followerCount: 5678,
      voteupCount: 18234,
      thankedCount: 2134,
      favoriteCount: 4567,
      answerCount: 312,
      articleCount: 78,
      questionCount: 15,
    },
    {
      userId: 'user7',
      nickname: '孙磊',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunlei',
      headline: '执业律师 / 法律科普',
      description: '执业律师，专注民商事诉讼和知识产权保护。业余时间做法律科普，让法律不再高冷。',
      gender: 'male' as const,
      location: '杭州',
      industry: '法律',
      employment: [{ company: '某律师事务所', job: '合伙人律师' }],
      education: [{ school: '中国政法大学', major: '民商法学' }],
      followingCount: 145,
      followerCount: 2890,
      voteupCount: 7654,
      thankedCount: 890,
      favoriteCount: 1567,
      answerCount: 198,
      articleCount: 34,
      questionCount: 8,
    },
    {
      userId: 'user8',
      nickname: '吴佳',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wujia',
      headline: '设计总监 / 用户体验专家',
      description: '15年设计经验，曾任多家互联网公司设计负责人。信奉"好的设计是看不见的设计"。',
      gender: 'female' as const,
      location: '上海',
      industry: '设计',
      employment: [{ company: '某设计公司', job: '设计总监' }],
      education: [{ school: '中央美术学院', major: '视觉传达设计' }],
      followingCount: 267,
      followerCount: 6234,
      voteupCount: 14567,
      thankedCount: 1678,
      favoriteCount: 3890,
      answerCount: 278,
      articleCount: 92,
      questionCount: 21,
    },
    {
      userId: 'user9',
      nickname: '郑涛',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengtao',
      headline: 'AI研究员 / 深度学习',
      description: '某AI实验室研究员，专注大语言模型和多模态学习。发表顶会论文30+篇，坚信AGI终将到来。',
      gender: 'male' as const,
      location: '北京',
      industry: '科技',
      employment: [{ company: '某AI实验室', job: '高级研究员' }],
      education: [{ school: '北京大学', major: '人工智能' }],
      followingCount: 178,
      followerCount: 7890,
      voteupCount: 21345,
      thankedCount: 1890,
      favoriteCount: 5234,
      answerCount: 389,
      articleCount: 67,
      questionCount: 28,
    },
  ];

  const topics = [
    {
      topicId: 'topic1',
      name: '互联网',
      icon: 'https://picsum.photos/48/48?random=topic1',
      description: '互联网行业动态、产品、技术等相关讨论',
      followerCount: 5230000,
      questionCount: 234567,
    },
    {
      topicId: 'topic2',
      name: '人工智能',
      icon: 'https://picsum.photos/48/48?random=topic2',
      description: 'AI技术、机器学习、深度学习等话题',
      followerCount: 2890000,
      questionCount: 123456,
    },
    {
      topicId: 'topic3',
      name: '心理学',
      icon: 'https://picsum.photos/48/48?random=topic3',
      description: '心理学知识、心理健康、人际关系等',
      followerCount: 4120000,
      questionCount: 345678,
    },
    {
      topicId: 'topic4',
      name: '金融',
      icon: 'https://picsum.photos/48/48?random=topic4',
      description: '金融投资、经济分析、理财规划等话题',
      followerCount: 3560000,
      questionCount: 198765,
    },
    {
      topicId: 'topic5',
      name: '职业发展',
      icon: 'https://picsum.photos/48/48?random=topic5',
      description: '职场经验、职业规划、求职面试技巧',
      followerCount: 6780000,
      questionCount: 456789,
    },
    {
      topicId: 'topic6',
      name: '阅读',
      icon: 'https://picsum.photos/48/48?random=topic6',
      description: '书籍推荐、读书方法、文学评论',
      followerCount: 5450000,
      questionCount: 312456,
    },
    {
      topicId: 'topic7',
      name: '美食',
      icon: 'https://picsum.photos/48/48?random=topic7',
      description: '美食推荐、烹饪技巧、餐厅点评',
      followerCount: 7230000,
      questionCount: 567890,
    },
    {
      topicId: 'topic8',
      name: '设计',
      icon: 'https://picsum.photos/48/48?random=topic8',
      description: 'UI/UX设计、平面设计、设计思维',
      followerCount: 2340000,
      questionCount: 145678,
    },
    {
      topicId: 'topic9',
      name: '健康',
      icon: 'https://picsum.photos/48/48?random=topic9',
      description: '健康养生、医学科普、运动健身',
      followerCount: 4890000,
      questionCount: 389012,
    },
    {
      topicId: 'topic10',
      name: '旅行',
      icon: 'https://picsum.photos/48/48?random=topic10',
      description: '旅行攻略、景点推荐、旅行故事',
      followerCount: 3670000,
      questionCount: 278901,
    },
  ];

  const questions = [
    {
      questionId: 'q1',
      title: '如何评价人工智能的发展前景？',
      description: '近年来AI技术发展迅速，从ChatGPT到各种大模型，AI似乎正在改变我们的生活。大家怎么看待AI的未来发展？会对哪些行业产生深远影响？',
      topics: ['topic2', 'topic1'],
      authorId: 'user1',
      createdTime: now - 7 * 24 * 60 * 60 * 1000,
      updatedTime: now - 2 * 24 * 60 * 60 * 1000,
      followerCount: 1253,
      viewCount: 520000,
      answerCount: 5,
    },
    {
      questionId: 'q2',
      title: '有哪些高效的学习方法？',
      description: '想提高学习效率，有没有什么科学的学习方法推荐？最好是经过心理学研究验证的方法。',
      topics: ['topic3', 'topic5'],
      authorId: 'user2',
      createdTime: now - 15 * 24 * 60 * 60 * 1000,
      updatedTime: now - 1 * 24 * 60 * 60 * 1000,
      followerCount: 3421,
      viewCount: 1260000,
      answerCount: 3,
    },
    {
      questionId: 'q3',
      title: '程序员如何保持技术竞争力？',
      description: '技术更新迭代很快，作为程序员如何持续学习、保持竞争力？特别是工作几年后，感觉技术进步变慢了。',
      topics: ['topic1', 'topic5'],
      authorId: 'user3',
      createdTime: now - 10 * 24 * 60 * 60 * 1000,
      updatedTime: now - 3 * 24 * 60 * 60 * 1000,
      followerCount: 2134,
      viewCount: 890000,
      answerCount: 2,
    },
    {
      questionId: 'q4',
      title: '2024年有哪些值得推荐的好书？',
      description: '新的一年开始了，想给自己列一份书单。各个领域的好书都可以推荐，最好附上推荐理由。',
      topics: ['topic6'],
      authorId: 'user0',
      createdTime: now - 20 * 24 * 60 * 60 * 1000,
      updatedTime: now - 5 * 24 * 60 * 60 * 1000,
      followerCount: 4567,
      viewCount: 1890000,
      answerCount: 2,
    },
    {
      questionId: 'q5',
      title: '如何看待当前的房价走势？',
      description: '近期各地房价出现不同程度的波动，一线城市和二三线城市的走势也不尽相同。从经济学角度如何分析当前的房价趋势？',
      topics: ['topic4'],
      authorId: 'user4',
      createdTime: now - 12 * 24 * 60 * 60 * 1000,
      updatedTime: now - 4 * 24 * 60 * 60 * 1000,
      followerCount: 5678,
      viewCount: 2340000,
      answerCount: 2,
    },
    {
      questionId: 'q6',
      title: '有哪些令你难忘的旅行经历？',
      description: '分享一下你最难忘的旅行经历吧，无论是国内还是国外，是什么让这次旅行如此特别？',
      topics: ['topic10'],
      authorId: 'user5',
      createdTime: now - 8 * 24 * 60 * 60 * 1000,
      updatedTime: now - 2 * 24 * 60 * 60 * 1000,
      followerCount: 1890,
      viewCount: 670000,
      answerCount: 1,
    },
    {
      questionId: 'q7',
      title: '如何科学有效地减肥？',
      description: '网上的减肥方法五花八门，有些甚至相互矛盾。从医学和营养学的角度来看，真正有效的减肥方法是什么？',
      topics: ['topic9'],
      authorId: 'user6',
      createdTime: now - 18 * 24 * 60 * 60 * 1000,
      updatedTime: now - 6 * 24 * 60 * 60 * 1000,
      followerCount: 6789,
      viewCount: 3450000,
      answerCount: 2,
    },
    {
      questionId: 'q8',
      title: '设计师如何提升审美能力？',
      description: '作为设计师，感觉自己的审美水平遇到了瓶颈。想请教各位前辈，有什么系统性的方法来提升审美能力？',
      topics: ['topic8'],
      authorId: 'user8',
      createdTime: now - 14 * 24 * 60 * 60 * 1000,
      updatedTime: now - 7 * 24 * 60 * 60 * 1000,
      followerCount: 2345,
      viewCount: 780000,
      answerCount: 1,
    },
  ];

  const answers = [
    // q1 answers (5)
    {
      answerId: 'a1',
      questionId: 'q1',
      authorId: 'user9',
      content: '作为AI领域的研究者，我来分享一下我对人工智能发展前景的看法。\n\n首先，大语言模型（LLM）的突破让AI在自然语言理解和生成方面取得了质的飞跃。GPT-4、Claude等模型展现出了惊人的推理能力和创造力，这在几年前是难以想象的。\n\n从技术发展趋势来看，我认为有几个关键方向值得关注：\n\n第一，多模态融合。未来的AI系统将能够同时处理文本、图像、音频、视频等多种模态的信息，实现更接近人类的感知和理解能力。目前GPT-4V、Gemini等已经展示了这种能力的雏形。\n\n第二，Agent（智能体）技术。AI不仅能理解和生成内容，还能主动执行任务、使用工具、与环境交互。这将极大地拓展AI的应用场景，从简单的对话扩展到复杂的工作流自动化。\n\n第三，AI安全和对齐。随着AI能力的增强，确保AI系统安全、可控、符合人类价值观变得越来越重要。这不仅是技术问题，更是整个社会需要共同面对的挑战。\n\n从产业影响来看，AI将首先在知识密集型行业产生深远影响，包括教育、医疗、法律、金融等。但这并不意味着AI会完全取代人类，更可能的是人机协作的模式——AI增强人类的能力，让人类专注于更有创造性的工作。',
      createdTime: now - 6 * 24 * 60 * 60 * 1000,
      updatedTime: now - 6 * 24 * 60 * 60 * 1000,
      voteupCount: 1234,
      commentCount: 56,
      favoriteCount: 234,
      thankCount: 45,
    },
    {
      answerId: 'a2',
      questionId: 'q1',
      authorId: 'user1',
      content: '作为一名产品经理，我从产品和商业的角度来谈谈AI的发展前景。\n\nAI技术的成熟正在催生大量新的产品和商业模式。我们可以看到，几乎每个互联网公司都在将AI能力融入到自己的产品中。搜索引擎在变成对话式助手，办公软件在嵌入AI写作和分析功能，甚至连外卖平台都在用AI优化配送路线。\n\n从产品经理的角度看，AI带来的最大变化是交互方式的革新。传统的图形用户界面（GUI）正在向自然语言界面（NLI）演进。用户不再需要学习复杂的操作流程，只需要用自然语言描述自己的需求，AI就能理解并执行。\n\n但我也注意到一些值得警惕的问题。首先是"AI泡沫"的风险——很多产品只是简单地包装了一个聊天界面，并没有真正解决用户问题。其次是数据隐私和安全问题，AI产品需要大量用户数据来训练和优化，如何在提升体验和保护隐私之间找到平衡是一个重大挑战。\n\n总的来说，我对AI的发展前景持谨慎乐观的态度。技术本身是中性的，关键在于我们如何利用它来创造真正有价值的产品和服务。',
      createdTime: now - 5 * 24 * 60 * 60 * 1000,
      updatedTime: now - 5 * 24 * 60 * 60 * 1000,
      voteupCount: 987,
      commentCount: 43,
      favoriteCount: 189,
      thankCount: 32,
    },
    {
      answerId: 'a3',
      questionId: 'q1',
      authorId: 'user4',
      content: '从投资角度看AI领域的发展前景，我认为需要分短期和长期来分析。\n\n短期来看（1-3年），AI行业正处于资本密集投入期。全球AI领域的投融资规模在2023年已经超过了500亿美元，其中大模型赛道占据了很大比例。NVIDIA的GPU供不应求，云计算巨头的算力投入不断攀升。但这也意味着短期内很多AI公司的盈利能力还不够强，估值泡沫的风险确实存在。\n\n长期来看（5-10年），AI将成为新的基础设施，就像互联网一样渗透到经济的方方面面。据麦肯锡的预测，到2030年AI将为全球经济贡献13万亿美元的产值。最大的受益领域包括医疗健康、金融服务、制造业和教育。\n\n对于普通投资者，我的建议是：不要追逐短期热点，而应该关注那些具有真正技术壁垒和清晰商业模式的公司。同时，AI基础设施层（芯片、云服务）的确定性通常高于应用层。\n\n最后，AI的发展不仅仅是一个投资机会，更是一次产业变革。理解这场变革的本质，比单纯追逐概念股更有意义。',
      createdTime: now - 4 * 24 * 60 * 60 * 1000,
      updatedTime: now - 4 * 24 * 60 * 60 * 1000,
      voteupCount: 756,
      commentCount: 34,
      favoriteCount: 145,
      thankCount: 28,
    },
    {
      answerId: 'a4',
      questionId: 'q1',
      authorId: 'user3',
      content: '作为一名全栈工程师，我想从技术实践的角度来聊聊AI的发展。\n\n过去一年，我在实际工作中大量使用AI工具。GitHub Copilot 已经成为我日常开发中不可或缺的助手，它大幅提升了我的编码效率，尤其是在写重复性代码和单元测试时效果显著。\n\n但AI编程助手也有明显的局限性。对于复杂的架构设计、性能优化、以及涉及业务逻辑的代码，AI给出的建议往往不够准确，甚至可能引入隐蔽的bug。这让我认识到，AI目前更适合作为"增强工具"而非"替代工具"。\n\n从开发者生态来看，AI正在降低编程的门槛，让更多人能够参与到软件开发中来。但同时，高水平的工程师价值不减反增——因为AI生成的代码需要有人来审查、优化和维护。\n\n未来3-5年，我预测AI将在以下技术领域取得突破：自动化测试生成、代码重构优化、实时bug检测、以及低代码/无代码平台的智能化升级。',
      createdTime: now - 3 * 24 * 60 * 60 * 1000,
      updatedTime: now - 3 * 24 * 60 * 60 * 1000,
      voteupCount: 654,
      commentCount: 29,
      favoriteCount: 112,
      thankCount: 21,
    },
    {
      answerId: 'a5',
      questionId: 'q1',
      authorId: 'user5',
      content: 'AI技术在日常生活中的应用越来越广泛，作为一个普通用户，我来分享一下我的亲身体验。\n\n作为美食博主，我最早接触的AI应用是手机上的智能修图工具。现在的AI修图已经不只是简单的滤镜，它能自动识别食物、调整色温和饱和度，让美食照片更加诱人。这大大节省了我后期处理的时间。\n\n另一个让我印象深刻的是AI翻译。在国外旅行探店时，AI实时翻译让我能够无障碍地与当地人交流，了解菜品的做法和故事。这在以前是很难想象的。\n\n不过说实话，AI推荐算法有时候让我有些担忧。社交平台上的信息茧房效应越来越明显，推荐的内容越来越同质化。作为内容创作者，我既享受着AI带来的流量红利，也在思考如何不被算法所绑架。\n\n总的来说，AI正在以各种形式融入我们的日常生活，有好有坏。关键是我们要做技术的主人，而不是被技术所控制。',
      createdTime: now - 2 * 24 * 60 * 60 * 1000,
      updatedTime: now - 2 * 24 * 60 * 60 * 1000,
      voteupCount: 543,
      commentCount: 27,
      favoriteCount: 98,
      thankCount: 19,
    },
    // q2 answers (3)
    {
      answerId: 'a6',
      questionId: 'q2',
      authorId: 'user2',
      content: '作为心理学研究者，我想从认知科学的角度分享一些经过科学验证的高效学习方法。\n\n一、间隔重复（Spaced Repetition）。这是心理学中最为坚实的发现之一。相比集中学习，把学习分散到多个时间段会显著提高长期记忆效果。具体操作上，可以使用Anki等间隔重复软件，系统会根据你的记忆曲线自动安排复习时间。研究表明，间隔重复的效果比集中复习高出200%以上。\n\n二、主动回忆（Active Recall）。不要只是反复阅读笔记，而是要主动尝试回忆学过的内容。比如合上书本，试着回答"这一章讲了什么？""核心概念是什么？"研究发现，主动回忆比重复阅读的学习效果高出50-70%。\n\n三、交叉练习（Interleaving）。不要把同一类型的练习题做到底，而是交叉安排不同类型的练习。虽然交叉练习在短期内感觉更困难，但它能帮助大脑更好地区分不同概念，提升灵活运用知识的能力。\n\n四、精细加工（Elaboration）。学到新知识时，尝试用自己的语言解释它、与已有知识建立联系、思考它的实际应用。这个过程会在大脑中创建更丰富的记忆网络，使知识更容易被提取。\n\n五、双重编码（Dual Coding）。同时使用文字和图像来学习。比如在学习一个概念时，既要理解文字定义，也要画出思维导图或示意图。多种感觉通道的参与可以增强记忆编码。',
      createdTime: now - 14 * 24 * 60 * 60 * 1000,
      updatedTime: now - 14 * 24 * 60 * 60 * 1000,
      voteupCount: 2345,
      commentCount: 89,
      favoriteCount: 567,
      thankCount: 123,
    },
    {
      answerId: 'a7',
      questionId: 'q2',
      authorId: 'user3',
      content: '作为程序员，我发现最有效的学习方法是"学以致用"——通过实际项目来驱动学习。\n\n我总结了一个"项目驱动学习法"的框架：\n\n1. 选择一个感兴趣的项目。不要选太简单的（学不到东西），也不要选太复杂的（容易放弃）。一个好的学习项目应该有50%的知识你已经掌握，50%需要学习。\n\n2. 先做MVP（最小可行产品）。不要一开始就追求完美，先让程序跑起来。这个过程会暴露你的知识盲区，指导后续学习方向。\n\n3. 迭代优化。在MVP基础上不断改进，每次迭代都专注于一个方面的提升（比如性能优化、代码重构、功能扩展）。这种渐进式学习比一次性学完所有内容更有效。\n\n4. 写博客记录。把学习过程和心得写成博客。"如果你不能向一个六岁小孩解释清楚，说明你自己还没有真正理解"（费曼学习法的精髓）。写作会迫使你系统地梳理知识。\n\n5. 参与社区讨论。在GitHub、Stack Overflow等平台上与其他开发者交流。回答别人的问题是深度学习的绝佳方式。\n\n这套方法我已经实践了五六年，从前端小白成长为全栈工程师。关键是保持学习的热情和持续性。',
      createdTime: now - 13 * 24 * 60 * 60 * 1000,
      updatedTime: now - 13 * 24 * 60 * 60 * 1000,
      voteupCount: 1876,
      commentCount: 65,
      favoriteCount: 432,
      thankCount: 87,
    },
    {
      answerId: 'a8',
      questionId: 'q2',
      authorId: 'user0',
      content: '我来补充一个容易被忽视但非常重要的学习方法——睡眠学习法。\n\n这不是说在睡觉时播放录音就能学会的伪科学，而是指利用睡眠来巩固记忆的科学方法。神经科学研究表明，睡眠在记忆巩固中起着至关重要的作用。\n\n具体的操作方法：\n\n1. 学习新内容后，在当天晚上保证充足的睡眠（7-8小时）。研究发现，学习后的第一个睡眠期对记忆巩固最为关键。\n\n2. 利用"睡前复习"效应。在睡前15-30分钟快速回顾当天学习的重点内容。大脑会在睡眠中优先巩固最近接触的信息。\n\n3. 避免熬夜学习。虽然通宵复习可能在短期内有效果，但从长期记忆的角度看，不如分散到几天学习加充足睡眠的组合效果好。\n\n4. 适当的午睡也有帮助。20-30分钟的午睡可以提升下午的学习效率和记忆巩固效果。\n\n所以下次有人说你整天睡觉，你可以理直气壮地说："我在巩固记忆！"（开个玩笑，别真的整天睡）',
      createdTime: now - 12 * 24 * 60 * 60 * 1000,
      updatedTime: now - 12 * 24 * 60 * 60 * 1000,
      voteupCount: 567,
      commentCount: 23,
      favoriteCount: 156,
      thankCount: 34,
    },
    // q3 answers (2)
    {
      answerId: 'a9',
      questionId: 'q3',
      authorId: 'user3',
      content: '保持技术竞争力的关键是持续学习和实践，这是一个需要长期坚持的过程。\n\n我从事软件开发8年，总结了以下几个方面：\n\n一、建立自己的技术知识体系。不要只关注某个框架或工具，而要理解底层原理。框架会过时，但计算机科学的基本原理（数据结构、算法、操作系统、网络协议）是不变的。我建议每年至少深入学习一个底层主题。\n\n二、关注技术趋势但不盲目追新。每年会出现无数新框架和新工具，不可能全部学会。我的方法是：关注技术博客和播客了解趋势（如Hacker News、InfoQ），但只深入学习那些有明确需求或广泛采用的技术。\n\n三、参与开源项目。这是提升技术水平最有效的方式之一。通过阅读优秀的开源代码，你能学到很多在教程中学不到的工程实践和设计思想。从修bug开始，逐步参与到feature开发中。\n\n四、写技术博客和做技术分享。输出是最好的学习方式。每当我需要写一篇技术博客时，我都会对相关知识进行更深入的研究和思考。\n\n五、刻意练习。不要只做舒适区的事情，要主动挑战自己不擅长的领域。比如做前端的尝试学后端，写业务代码的尝试做架构设计。',
      createdTime: now - 9 * 24 * 60 * 60 * 1000,
      updatedTime: now - 9 * 24 * 60 * 60 * 1000,
      voteupCount: 2134,
      commentCount: 78,
      favoriteCount: 654,
      thankCount: 112,
    },
    {
      answerId: 'a10',
      questionId: 'q3',
      authorId: 'user9',
      content: '从AI行业的角度来看，程序员保持竞争力需要拥抱AI而不是恐惧它。\n\n现在的AI编程工具已经相当成熟，如果你还没有使用GitHub Copilot或者类似的AI辅助编程工具，我强烈建议你尽快尝试。掌握AI工具不是"作弊"，而是提升生产力的必要技能。\n\n具体来说：\n\n1. 学会用AI做代码审查。让AI帮你审查代码，找出潜在的bug和安全漏洞。\n\n2. 用AI加速学习新技术。当你需要学习一个不熟悉的框架或语言时，AI可以充当你的私人导师，回答问题、提供示例代码。\n\n3. 但不要过度依赖AI。理解代码背后的原理比写出能运行的代码更重要。AI可以帮你写代码，但不能替你理解为什么要这样写。\n\n4. 关注AI做不好的事情。创造性的系统设计、复杂的性能调优、跨系统的架构决策——这些仍然需要深厚的技术功底和经验积累。把精力投入到这些高价值的技能上。\n\n未来最有竞争力的程序员，不是那些最会写代码的人，而是最会利用AI、理解系统本质的人。',
      createdTime: now - 8 * 24 * 60 * 60 * 1000,
      updatedTime: now - 8 * 24 * 60 * 60 * 1000,
      voteupCount: 1567,
      commentCount: 45,
      favoriteCount: 389,
      thankCount: 67,
    },
    // q4 answers (2)
    {
      answerId: 'a11',
      questionId: 'q4',
      authorId: 'user2',
      content: '作为一名心理学研究者和书虫，我推荐几本2024年读到的好书：\n\n1.《思考，快与慢》丹尼尔·卡尼曼（重读推荐）。虽然这不是新书，但每次重读都有新的收获。这本书系统地介绍了人类决策的两个系统——快速直觉的系统1和慢速理性的系统2，对理解自己的思维模式非常有帮助。\n\n2.《刷新》萨提亚·纳德拉。微软CEO的自传，讲述了他如何通过文化变革让微软重新焕发活力。对于任何想了解领导力和组织变革的人来说，这本书都值得一读。\n\n3.《置身事内》兰小欢。一本非常接地气的中国经济科普书，用通俗的语言解释了中国经济体制的运行机制。即使不是经济学专业，也能看懂。\n\n4.《被讨厌的勇气》岸见一郎 / 古贺史健。阿德勒心理学的入门读物，通过对话的形式深入浅出地阐述了"课题分离"等重要的心理学概念。对于处理人际关系焦虑非常有启发。\n\n5.《人类简史》尤瓦尔·赫拉利（新版推荐）。2024年推出了更新版，加入了对AI时代的思考。这本书的视角非常独特，会改变你看待人类历史的方式。',
      createdTime: now - 18 * 24 * 60 * 60 * 1000,
      updatedTime: now - 18 * 24 * 60 * 60 * 1000,
      voteupCount: 1890,
      commentCount: 67,
      favoriteCount: 789,
      thankCount: 156,
    },
    {
      answerId: 'a12',
      questionId: 'q4',
      authorId: 'user7',
      content: '推荐几本和法律相关但非专业人士也能看懂的好书：\n\n1.《公正》迈克尔·桑德尔。哈佛最受欢迎的公开课对应的教材。通过一系列引人入胜的道德困境（电车难题、正义与不义），探讨了什么是真正的公正。不需要任何法律背景就能理解和享受。\n\n2.《看不见的城市》卡尔维诺。这不是法律书，而是一本关于想象力的文学作品。但我认为好的律师首先要是一个有人文素养的人。这本书短小精悍，每个城市的描写都像一首诗。\n\n3.《显微镜下的大明》马伯庸。用讲故事的方式还原了明朝的几个真实案件，展现了古代中国基层社会的运作方式。法律人读这本书会有特别的感触。\n\n4.《秩序的根源》弗朗西斯·福山。探讨了人类社会如何从部落制度发展出国家、法治和民主问责。对理解现代法治的起源和发展非常有帮助。',
      createdTime: now - 16 * 24 * 60 * 60 * 1000,
      updatedTime: now - 16 * 24 * 60 * 60 * 1000,
      voteupCount: 876,
      commentCount: 32,
      favoriteCount: 345,
      thankCount: 56,
    },
    // q5 answers (2)
    {
      answerId: 'a13',
      questionId: 'q5',
      authorId: 'user4',
      content: '作为一名财经分析师，我来系统分析一下当前的房价走势。\n\n首先明确一个基本判断：中国房地产市场已经从过去20年的总体上升周期，进入了分化和调整阶段。全国房价普涨的时代已经结束，取而代之的是城市间、区域间的结构性分化。\n\n一线城市方面，北京、上海、深圳、广州的核心区域仍然具有较强的保值能力。核心地段的优质住宅供给有限，加上人口持续流入，需求端支撑较强。但远郊区域和品质较差的老旧小区，价格下行压力明显。\n\n二三线城市方面，情况分化更加严重。有产业支撑、人口净流入的城市（如杭州、成都、武汉、长沙等），房价相对稳定；但很多人口流出的三四线城市，房价仍在下降通道中。\n\n从宏观经济角度看，几个关键因素会影响未来走势：\n1. 货币政策：利率下行趋势有利于减轻购房者的还贷压力\n2. 人口结构：老龄化和出生率下降将在长期抑制住房需求\n3. 政策调控：各地因城施策，政策工具箱仍然丰富\n\n对于购房者的建议：如果是刚需自住，好城市、好地段的房子什么时候买都不会太吃亏；如果是投资，需要非常谨慎，不能再用过去的经验来判断未来。',
      createdTime: now - 11 * 24 * 60 * 60 * 1000,
      updatedTime: now - 11 * 24 * 60 * 60 * 1000,
      voteupCount: 1345,
      commentCount: 89,
      favoriteCount: 456,
      thankCount: 78,
    },
    {
      answerId: 'a14',
      questionId: 'q5',
      authorId: 'user7',
      content: '从法律角度来补充一些关于房产交易的注意事项。\n\n当前市场环境下，无论买卖双方都需要特别注意法律风险：\n\n对于买方：\n1. 务必进行全面的产权调查，确认房屋没有抵押、查封、共有人争议等问题\n2. 注意开发商的资质和项目审批情况，尤其是期房项目要确认预售许可证\n3. 购房合同中的违约条款要仔细审查，当前市场波动加大，违约风险也在增加\n\n对于卖方：\n1. 如果房屋有贷款，要提前了解提前还贷的流程和费用\n2. 注意定金和违约金条款，不要轻易签署不利于自己的合同\n3. 税费方面，满五唯一可以免征个人所得税，交易前要算清楚成本\n\n最近我接手了不少因房价波动引发的购房纠纷，提醒大家在做重大资产决策时一定要咨询专业律师的意见。',
      createdTime: now - 10 * 24 * 60 * 60 * 1000,
      updatedTime: now - 10 * 24 * 60 * 60 * 1000,
      voteupCount: 678,
      commentCount: 34,
      favoriteCount: 234,
      thankCount: 45,
    },
    // q6 answers (1)
    {
      answerId: 'a15',
      questionId: 'q6',
      authorId: 'user5',
      content: '作为一个走遍全国200+城市的旅行者，最令我难忘的旅行经历发生在西藏。\n\n那是一次从成都出发的318国道自驾之旅，全程约2100公里，我们花了12天慢慢走完。每天的风景都不同，从四川盆地的绿水青山，到折多山的雪域高原，到然乌湖的碧蓝清澈，再到拉萨的布达拉宫。\n\n最让我震撼的是当车子翻过海拔5013米的东达山时，眼前突然展开一片一望无际的高原草甸，远处是连绵的雪山，天空蓝得不真实，白云仿佛触手可及。那一刻的感受，任何照片和文字都无法完全传达。\n\n路上遇到了很多有趣的人。有从拉萨骑行到尼泊尔的背包客，有在路边小茶馆里讲故事的藏族老人，还有开着改装面包车环游中国的退休夫妻。旅行的意义不仅在于看风景，更在于遇见不同的人和故事。\n\n吃的方面也有很多惊喜：林芝的石锅鸡、拉萨的甜茶馆、日喀则的手抓牦牛肉...每一种美食都是当地文化的缩影。\n\n如果你也想走这条路线，建议做好高反准备，出发前一周开始服用红景天，路上多喝水、不要剧烈运动。另外一定要买好保险！',
      createdTime: now - 7 * 24 * 60 * 60 * 1000,
      updatedTime: now - 7 * 24 * 60 * 60 * 1000,
      voteupCount: 2345,
      commentCount: 56,
      favoriteCount: 678,
      thankCount: 134,
    },
    // q7 answers (2)
    {
      answerId: 'a16',
      questionId: 'q7',
      authorId: 'user6',
      content: '作为内科医生，我来从医学角度谈谈科学减肥。\n\n首先要明确一点：减肥的本质是能量平衡——摄入的热量小于消耗的热量。所有有效的减肥方法，本质上都是在做这件事。那些声称不需要控制饮食、不需要运动就能减肥的广告，基本上都是骗人的。\n\n饮食方面的建议：\n1. 不要节食，而要调整饮食结构。增加蛋白质和蔬菜的比例，减少精制碳水和添加糖的摄入。蛋白质的热效应最高（消化蛋白质本身就会消耗较多能量），同时饱腹感最强。\n2. 控制每餐的份量，但不要跳餐。规律进食有助于维持稳定的血糖水平和代谢率。\n3. 减少液体热量的摄入。奶茶、果汁、含糖饮料的热量很容易被忽视，一杯奶茶可能就有400-600大卡。\n\n运动方面的建议：\n1. 有氧运动和力量训练结合。有氧运动直接消耗热量，力量训练增加肌肉量从而提高基础代谢率。\n2. 不要过度运动。过度运动会增加食欲、导致疲劳、增加受伤风险。每周3-5次，每次30-60分钟就够了。\n3. 日常活动量比运动更重要。多走路、少坐电梯、站立办公，这些NEAT（非运动性活动产热）对减肥的贡献可能比你想象的更大。\n\n最后强调：健康的减肥速度是每周0.5-1公斤。那些承诺一个月减10公斤的方法，很可能是以健康为代价的。',
      createdTime: now - 17 * 24 * 60 * 60 * 1000,
      updatedTime: now - 17 * 24 * 60 * 60 * 1000,
      voteupCount: 3456,
      commentCount: 123,
      favoriteCount: 890,
      thankCount: 234,
    },
    {
      answerId: 'a17',
      questionId: 'q7',
      authorId: 'user2',
      content: '从心理学角度来补充关于减肥的建议。很多人减肥失败不是因为不知道怎么做，而是因为难以坚持。这背后有深层的心理学原因。\n\n1. 意志力是有限资源。心理学研究表明，自我控制力会随着使用而消耗（自我损耗理论）。所以不要试图同时改变太多习惯，一次只改变一个小习惯更容易成功。\n\n2. 环境设计比意志力更重要。把零食放在看不见的地方、用小号餐盘吃饭、把运动鞋放在门口...通过改变环境来"默认"健康行为，比每次都靠意志力做选择要有效得多。\n\n3. 警惕"破窗效应"。吃了一顿不该吃的大餐，不代表减肥计划就彻底失败了。"既然今天已经破戒了，那就干脆放开吃吧"这种想法是非常危险的。一顿饭的影响是有限的，真正有害的是因为一次失误就全面放弃。\n\n4. 建立内在动机。"我想变瘦让别人觉得我好看"是外在动机，"我想更健康、更有活力"是内在动机。研究表明，内在动机驱动的行为改变更容易持久。\n\n5. 寻找社交支持。和朋友一起运动、在社群里分享进展...社交支持是坚持行为改变的重要因素。',
      createdTime: now - 15 * 24 * 60 * 60 * 1000,
      updatedTime: now - 15 * 24 * 60 * 60 * 1000,
      voteupCount: 1890,
      commentCount: 56,
      favoriteCount: 567,
      thankCount: 98,
    },
    // q8 answers (1)
    {
      answerId: 'a18',
      questionId: 'q8',
      authorId: 'user8',
      content: '作为一名从业15年的设计总监，关于提升审美能力，我有一些切身体会想分享。\n\n首先，审美不是天赋，而是可以通过训练提升的能力。就像健身一样，审美也有自己的"训练计划"。\n\n一、大量看好的设计作品。每天至少花30分钟浏览Dribbble、Behance、Pinterest等设计平台。看的时候不要只是"刷"，而要思考：这个设计好在哪里？用了什么手法？为什么让我觉得好看？建议准备一个审美收集本，把看到的好设计按照配色、排版、插画、动效等维度分类保存。\n\n二、学习设计史和艺术史。了解设计风格的演变（包豪斯、瑞士风格、极简主义、扁平设计等），理解每种风格背后的文化语境和设计哲学。推荐《设计的故事》和《什么是平面设计》两本入门书。\n\n三、临摹和重设计。看到好的设计，动手临摹。不是简单的复制粘贴，而是理解其中的设计规律：间距、比例、对比、韵律。之后尝试做"重设计"练习——找一个你觉得不够好的设计，用自己的方式重新设计它。\n\n四、跨领域汲取灵感。好的审美不只来自设计圈。多去看展览、看建筑、看电影、看时装。日本建筑师安藤忠雄说："所有的灵感都来自建筑之外"，设计也是一样。\n\n五、注重基础功。字体、配色、排版是设计的三大基础。把这三个基础练扎实，审美水平自然会有质的提升。推荐学习一下字体学（Typography）的基础知识，它是设计中最容易被忽视但影响最大的要素。',
      createdTime: now - 13 * 24 * 60 * 60 * 1000,
      updatedTime: now - 13 * 24 * 60 * 60 * 1000,
      voteupCount: 1567,
      commentCount: 45,
      favoriteCount: 456,
      thankCount: 89,
    },
  ];

  const comments: { [key: string]: any[] } = {
    a1: [
      {
        commentId: 'c1',
        targetId: 'a1',
        targetType: 'answer' as const,
        authorId: 'user2',
        content: '说得很有道理，AI确实在快速发展。不过关于AI安全问题，我觉得目前的讨论还远远不够。',
        createdTime: now - 5 * 24 * 60 * 60 * 1000,
        voteupCount: 23,
        replies: [
          {
            commentId: 'c1r1',
            targetId: 'c1',
            targetType: 'comment' as const,
            authorId: 'user9',
            content: '同意。AI安全不只是技术问题，更是伦理和社会治理问题。目前学术界和产业界正在积极推动相关的研究和政策。',
            createdTime: now - 5 * 24 * 60 * 60 * 1000 + 3600000,
            voteupCount: 12,
            replies: [],
          },
          {
            commentId: 'c1r2',
            targetId: 'c1',
            targetType: 'comment' as const,
            authorId: 'user3',
            content: '从技术实现的角度，AI对齐（alignment）确实是一个非常困难的问题，但目前已经有了一些有前景的方向，比如RLHF。',
            createdTime: now - 4 * 24 * 60 * 60 * 1000,
            voteupCount: 8,
            replies: [],
          },
        ],
      },
      {
        commentId: 'c2',
        targetId: 'a1',
        targetType: 'answer' as const,
        authorId: 'user4',
        content: '从投资的角度补充一下，AI安全相关的公司最近也开始受到资本的关注。Anthropic就拿到了很大的融资。',
        createdTime: now - 4 * 24 * 60 * 60 * 1000,
        voteupCount: 15,
        replies: [],
      },
      {
        commentId: 'c3',
        targetId: 'a1',
        targetType: 'answer' as const,
        authorId: 'user0',
        content: '写得非常全面！请问关于多模态AI，你觉得什么时候能达到人类水平的感知能力？',
        createdTime: now - 3 * 24 * 60 * 60 * 1000,
        voteupCount: 7,
        replies: [
          {
            commentId: 'c3r1',
            targetId: 'c3',
            targetType: 'comment' as const,
            authorId: 'user9',
            content: '完全达到人类水平可能还需要很多年。目前的多模态模型在视觉理解方面进步很快，但在听觉、触觉等方面还有很大差距。',
            createdTime: now - 3 * 24 * 60 * 60 * 1000 + 7200000,
            voteupCount: 5,
            replies: [],
          },
        ],
      },
    ],
    a6: [
      {
        commentId: 'c4',
        targetId: 'a6',
        targetType: 'answer' as const,
        authorId: 'user0',
        content: '间隔重复法确实有效！我用Anki背单词，半年词汇量从5000涨到了12000。',
        createdTime: now - 13 * 24 * 60 * 60 * 1000,
        voteupCount: 34,
        replies: [
          {
            commentId: 'c4r1',
            targetId: 'c4',
            targetType: 'comment' as const,
            authorId: 'user2',
            content: '很棒的实践！间隔重复不只适用于背单词，学习任何需要记忆的内容都可以用。',
            createdTime: now - 13 * 24 * 60 * 60 * 1000 + 3600000,
            voteupCount: 18,
            replies: [],
          },
        ],
      },
      {
        commentId: 'c5',
        targetId: 'a6',
        targetType: 'answer' as const,
        authorId: 'user3',
        content: '请问"交叉练习"具体是怎么操作的？能举个编程学习的例子吗？',
        createdTime: now - 12 * 24 * 60 * 60 * 1000,
        voteupCount: 21,
        replies: [
          {
            commentId: 'c5r1',
            targetId: 'c5',
            targetType: 'comment' as const,
            authorId: 'user2',
            content: '比如你在学数据结构，不要连续做20道链表题，而是穿插做链表、树、图的题目。这样虽然更累，但学习效果更好。',
            createdTime: now - 12 * 24 * 60 * 60 * 1000 + 7200000,
            voteupCount: 29,
            replies: [],
          },
        ],
      },
      {
        commentId: 'c6',
        targetId: 'a6',
        targetType: 'answer' as const,
        authorId: 'user1',
        content: '精细加工策略我一直在用，效果确实好。每学完一个概念就试着用自己的话复述一遍。',
        createdTime: now - 11 * 24 * 60 * 60 * 1000,
        voteupCount: 16,
        replies: [],
      },
    ],
    a9: [
      {
        commentId: 'c7',
        targetId: 'a9',
        targetType: 'answer' as const,
        authorId: 'user1',
        content: '参与开源项目这一点太认同了。我通过给React提PR，学到了很多在公司项目中学不到的东西。',
        createdTime: now - 8 * 24 * 60 * 60 * 1000,
        voteupCount: 28,
        replies: [],
      },
      {
        commentId: 'c8',
        targetId: 'a9',
        targetType: 'answer' as const,
        authorId: 'user9',
        content: '补充一点：参加技术会议和研讨会也是保持竞争力的好方法。面对面的交流往往能获得网上学不到的洞见。',
        createdTime: now - 7 * 24 * 60 * 60 * 1000,
        voteupCount: 19,
        replies: [],
      },
      {
        commentId: 'c9',
        targetId: 'a9',
        targetType: 'answer' as const,
        authorId: 'user0',
        content: '关于写技术博客，我想问一下，你通常是先确定主题再研究，还是研究过程中自然产生博客选题？',
        createdTime: now - 6 * 24 * 60 * 60 * 1000,
        voteupCount: 11,
        replies: [
          {
            commentId: 'c9r1',
            targetId: 'c9',
            targetType: 'comment' as const,
            authorId: 'user3',
            content: '两种情况都有。但我更推荐后者——在解决实际问题的过程中记录心得，这样写出来的内容更真实、更有价值。',
            createdTime: now - 6 * 24 * 60 * 60 * 1000 + 3600000,
            voteupCount: 14,
            replies: [],
          },
        ],
      },
    ],
    a16: [
      {
        commentId: 'c10',
        targetId: 'a16',
        targetType: 'answer' as const,
        authorId: 'user5',
        content: '作为美食博主，控制液体热量这一点太有共鸣了。很多人不知道一杯奶茶的热量有多高。',
        createdTime: now - 16 * 24 * 60 * 60 * 1000,
        voteupCount: 45,
        replies: [
          {
            commentId: 'c10r1',
            targetId: 'c10',
            targetType: 'comment' as const,
            authorId: 'user6',
            content: '是的，一杯全糖珍珠奶茶大约500-700大卡，相当于一顿正餐的热量了。',
            createdTime: now - 16 * 24 * 60 * 60 * 1000 + 3600000,
            voteupCount: 38,
            replies: [],
          },
        ],
      },
      {
        commentId: 'c11',
        targetId: 'a16',
        targetType: 'answer' as const,
        authorId: 'user0',
        content: '请问每周3-5次运动，推荐什么运动方式？跑步还是游泳？',
        createdTime: now - 15 * 24 * 60 * 60 * 1000,
        voteupCount: 22,
        replies: [
          {
            commentId: 'c11r1',
            targetId: 'c11',
            targetType: 'comment' as const,
            authorId: 'user6',
            content: '选自己能坚持的运动最重要。游泳对关节更友好，跑步更方便。如果是超重人群，建议先从快走、游泳开始，避免跑步对膝盖的冲击。',
            createdTime: now - 15 * 24 * 60 * 60 * 1000 + 7200000,
            voteupCount: 31,
            replies: [],
          },
        ],
      },
    ],
    a18: [
      {
        commentId: 'c12',
        targetId: 'a18',
        targetType: 'answer' as const,
        authorId: 'user1',
        content: '关于审美收集本这个方法，有什么推荐的工具吗？我之前试过Pinterest但感觉组织不太方便。',
        createdTime: now - 12 * 24 * 60 * 60 * 1000,
        voteupCount: 17,
        replies: [
          {
            commentId: 'c12r1',
            targetId: 'c12',
            targetType: 'comment' as const,
            authorId: 'user8',
            content: '推荐Eagle——专门为设计师做的素材管理工具。支持浏览器插件一键采集，可以按标签、文件夹分类，还能标注颜色。',
            createdTime: now - 12 * 24 * 60 * 60 * 1000 + 3600000,
            voteupCount: 25,
            replies: [],
          },
        ],
      },
    ],
  };

  const articles = [
    {
      articleId: 'art1',
      title: '互联网产品设计的十大原则',
      content: '在互联网产品设计中，有一些经过时间检验的核心原则。本文将从用户体验的角度，系统地介绍这些原则及其在实际项目中的应用。\n\n原则一：用户至上。所有设计决策的出发点应该是用户需求，而不是技术炫耀或商业利益。好的产品经理能够在用户需求、商业目标和技术可行性之间找到平衡。\n\n原则二：简约而不简单。减少不必要的元素和操作步骤，让用户能够快速完成任务。但简约不等于简陋，每个保留的元素都应该经过深思熟虑。\n\n原则三：一致性。界面元素的样式、交互方式和文案风格应该保持一致。一致性降低了用户的学习成本，提升了使用效率。\n\n原则四：反馈及时性。用户的每个操作都应该得到及时的反馈。点击按钮后的加载状态、表单提交后的成功提示、错误操作的警告信息——这些反馈让用户感到自己在掌控中。\n\n原则五：容错设计。人总会犯错，好的设计应该允许用户犯错并提供简便的纠正方式。撤销功能、确认对话框、自动保存都是容错设计的例子。\n\n原则六：渐进式展示。不要一次展示所有信息和功能，根据用户的需求和使用场景逐步展示。这就是"渐进式展示"的核心思想。\n\n原则七：可访问性。确保所有用户都能使用产品，包括有视觉、听觉或运动障碍的用户。这不仅是道德要求，在很多国家也是法律要求。\n\n原则八：数据驱动。设计决策应该基于数据而非直觉。A/B测试、用户行为分析、漏斗分析等工具能帮助我们做出更好的设计决策。\n\n原则九：情感化设计。好的产品不仅好用，还能让用户感到愉悦。适当的微交互、友好的文案、精心设计的空状态，都能给用户带来积极的情感体验。\n\n原则十：持续迭代。没有完美的产品设计，只有不断优化的过程。建立"发布-收集反馈-优化-再发布"的迭代循环，让产品在持续改进中越来越好。',
      coverImage: 'https://picsum.photos/660/370?random=article1',
      authorId: 'user1',
      topics: ['topic1', 'topic8'],
      createdTime: now - 10 * 24 * 60 * 60 * 1000,
      updatedTime: now - 10 * 24 * 60 * 60 * 1000,
      viewCount: 12345,
      voteupCount: 567,
      commentCount: 89,
      favoriteCount: 234,
    },
    {
      articleId: 'art2',
      title: '深度学习入门：从零开始理解神经网络',
      content: '深度学习是人工智能领域最热门的技术方向之一。本文将用通俗易懂的语言，帮助零基础的读者理解深度学习的核心概念。\n\n什么是神经网络？简单来说，人工神经网络是受生物神经系统启发的数学模型。它由大量的"神经元"组成，每个神经元接收输入、进行计算、产生输出。多个神经元按层组织，形成"网络"结构。\n\n为什么叫"深度"学习？因为现代神经网络通常有很多层（几十到几百层）。层数越多，网络越"深"，能学到的特征也越抽象和复杂。\n\n深度学习如何学习？核心机制是"反向传播"算法。给定输入和正确答案，网络计算出预测结果，然后比较预测和正确答案的差距（损失函数），通过梯度下降算法逐步调整网络参数，使预测越来越准确。\n\n常见的深度学习模型类型：\n\n1. 卷积神经网络（CNN）：擅长处理图像数据，能自动学习图像中的特征（边缘、纹理、形状等）。\n\n2. 循环神经网络（RNN/LSTM）：擅长处理序列数据，能记住之前的输入信息。适用于文本处理、时间序列预测等任务。\n\n3. Transformer：近年来最重要的架构突破。GPT、BERT等大语言模型都基于Transformer架构。它通过"注意力机制"让模型能够关注输入序列中最相关的部分。\n\n4. 生成对抗网络（GAN）：由两个网络相互博弈——一个负责生成假数据，一个负责判别真假。通过这种对抗训练，生成网络能产出极为逼真的图像、音频等内容。\n\n入门学习路径建议：先学Python编程，然后学习线性代数和概率统计基础，再通过Andrew Ng的机器学习课程入门，最后动手做项目实践。',
      coverImage: 'https://picsum.photos/660/370?random=article2',
      authorId: 'user9',
      topics: ['topic2'],
      createdTime: now - 8 * 24 * 60 * 60 * 1000,
      updatedTime: now - 8 * 24 * 60 * 60 * 1000,
      viewCount: 23456,
      voteupCount: 1234,
      commentCount: 156,
      favoriteCount: 567,
    },
    {
      articleId: 'art3',
      title: '心理学视角下的拖延症：原因、机制与应对策略',
      content: '拖延是一种几乎每个人都经历过的行为现象。从心理学的角度来看，拖延不是简单的"懒"或"意志力不足"，而是一种复杂的情绪调节失败。\n\n拖延的心理机制：当我们面对一个任务时，大脑会自动评估这个任务的"情绪价值"。如果这个任务让我们感到焦虑、无聊或恐惧（比如怕做不好），大脑就会倾向于回避它，转而选择能带来即时满足感的活动（比如刷手机）。\n\n这就是拖延的本质——它是一种短期情绪调节策略。我们不是在逃避任务本身，而是在逃避任务带来的负面情绪。\n\n但这种策略的问题在于：拖延只能暂时缓解焦虑，长期来看反而会加重焦虑和负罪感，形成恶性循环。\n\n基于研究的应对策略：\n\n1. 情绪接纳：承认自己不想做这个任务是正常的，不要因为拖延而自责。自责只会消耗更多的心理能量，让拖延更严重。\n\n2. 任务分解：把大任务拆成小步骤。"写一篇论文"听起来很可怕，但"先写一个引言的草稿"就容易多了。心理学上称之为"降低启动成本"。\n\n3. 两分钟规则：如果一件事只需要两分钟就能完成，就立刻做。如果是大任务，也可以对自己说"我先做两分钟试试"。通常一旦开始了，就会发现没那么难。\n\n4. 环境设计：消除干扰源。手机放远一点、关掉社交媒体通知、在图书馆而不是卧室学习。环境对行为的影响远超我们的想象。\n\n5. 自我compassion：对自己温柔一点。研究表明，自我批评会增加拖延，而自我关怀反而能减少拖延。下次拖延时，不要骂自己，而是理解自己为什么会拖延，然后温和地引导自己回到正轨。',
      coverImage: 'https://picsum.photos/660/370?random=article3',
      authorId: 'user2',
      topics: ['topic3'],
      createdTime: now - 6 * 24 * 60 * 60 * 1000,
      updatedTime: now - 6 * 24 * 60 * 60 * 1000,
      viewCount: 34567,
      voteupCount: 2345,
      commentCount: 234,
      favoriteCount: 890,
    },
    {
      articleId: 'art4',
      title: '前端技术趋势2024：从框架到工程化',
      content: '2024年前端技术领域依然热闹非凡。本文总结一下今年最值得关注的技术趋势。\n\nReact Server Components成熟落地。2024年RSC不再是实验性特性，而是真正进入生产环境。Next.js 14的App Router已经成为新项目的首选架构。RSC的核心价值在于：减少客户端JS bundle大小，提升首次加载性能，简化数据获取逻辑。\n\nSignals范式的扩散。最初在Solid.js中引入的Signals概念，正在被更多框架采纳。Angular引入了Signals，Vue的响应式系统本质上也是Signals的一种实现，甚至React也在探索类似的优化方案。Signals代表了一种更细粒度的状态管理模式。\n\n边缘计算（Edge Computing）的崛起。Cloudflare Workers、Vercel Edge Functions等边缘计算平台正在改变前端应用的部署方式。将计算逻辑放到离用户更近的边缘节点，可以显著降低延迟。\n\nAI辅助开发工具。GitHub Copilot、v0.dev（Vercel的AI UI生成工具）等AI工具正在改变前端开发的方式。特别是v0.dev，你只需要描述想要的UI，它就能生成相应的React组件代码。\n\nRust在前端工具链中的渗透。Turbopack（Webpack的继任者）、Biome（ESLint+Prettier的替代品）、SWC（Babel的替代品）都是用Rust编写的。Rust的高性能正在让前端构建变得更快。\n\n展望2025年，我认为最值得关注的方向是：WebGPU的普及、WebAssembly 2.0、以及AI与前端开发的更深度融合。',
      coverImage: 'https://picsum.photos/660/370?random=article4',
      authorId: 'user3',
      topics: ['topic1'],
      createdTime: now - 4 * 24 * 60 * 60 * 1000,
      updatedTime: now - 4 * 24 * 60 * 60 * 1000,
      viewCount: 18976,
      voteupCount: 876,
      commentCount: 123,
      favoriteCount: 345,
    },
    {
      articleId: 'art5',
      title: '成都美食地图：本地人推荐的20家宝藏店铺',
      content: '作为土生土长的成都人和美食博主，我要推荐一些不在大众点评前排、但真正好吃的本地宝藏店铺。\n\n火锅篇：\n1. 大龙燚（科华路店）：不是连锁店那种味道，这家店的牛油锅底特别香，毛肚和鹅肠都是每桌必点。建议下午5点前到，否则排队能排到马路上。\n2. 钢管厂五区小郡肝串串：成都串串的天花板。在钢管厂厂区里面，环境很有年代感，但味道绝了。小郡肝脆嫩入味，兔腰也特别推荐。\n\n川菜篇：\n3. 明婷饭店：成都人自己爱去的老川菜馆。招牌是蒜泥白肉和麻婆豆腐，味道是那种"回不去"的经典川味。人均60-80元，性价比极高。\n4. 陈麻婆豆腐（总府路店）：虽然是名店，但我推荐的原因是他们家确实把麻婆豆腐做到了极致。花椒麻、辣椒辣、牛肉末香，豆腐嫩滑入味。\n\n小吃篇：\n5. 张老二凉粉：文殊院附近的小店，甜水面和凉粉都是一绝。甜水面的酱汁浓稠挂面，花生碎提香。\n6. 叶婆婆钵钵鸡：锦里附近但不在景区里面，本地人常去。红油味和藤椒味都可以尝尝。\n\n甜品/饮品篇：\n7. 何氏冷锅鱼：虽然叫冷锅鱼，但他们家的冰粉才是隐藏的王者。用的是手搓冰粉，配上红糖水、芝麻、花生碎，夏天来一碗太幸福了。\n\n这只是我推荐的一小部分。成都的美食文化博大精深，每条小巷子里都可能藏着让你惊喜的美味。欢迎大家来成都吃吃逛逛！',
      coverImage: 'https://picsum.photos/660/370?random=article5',
      authorId: 'user5',
      topics: ['topic7', 'topic10'],
      createdTime: now - 2 * 24 * 60 * 60 * 1000,
      updatedTime: now - 2 * 24 * 60 * 60 * 1000,
      viewCount: 45678,
      voteupCount: 3456,
      commentCount: 345,
      favoriteCount: 1234,
    },
  ];

  const ideas = [
    {
      ideaId: 'idea1',
      authorId: 'user1',
      content: '今天读到一句话："真正的智慧不是知道所有答案，而是知道如何提出正确的问题。" 深以为然。做产品也是一样，找到正确的问题比找到解决方案更重要。',
      images: [],
      topics: ['topic3'],
      createdTime: now - 2 * 60 * 60 * 1000,
      voteupCount: 234,
      commentCount: 12,
      shareCount: 45,
    },
    {
      ideaId: 'idea2',
      authorId: 'user5',
      content: '今天在建设路发现了一家超好吃的冒烤鸭！外皮酥脆，里面嫩滑，配上特制的蘸料，绝了！强烈推荐给来成都的朋友们。',
      images: ['https://picsum.photos/400/300?random=idea2a', 'https://picsum.photos/400/300?random=idea2b'],
      topics: ['topic7'],
      createdTime: now - 5 * 60 * 60 * 1000,
      voteupCount: 567,
      commentCount: 34,
      shareCount: 89,
    },
    {
      ideaId: 'idea3',
      authorId: 'user3',
      content: 'TypeScript 5.4的NoInfer工具类型太好用了！终于不用写那些奇怪的workaround来防止类型推断了。TS团队真的在认真听社区的反馈。',
      images: [],
      topics: ['topic1'],
      createdTime: now - 8 * 60 * 60 * 1000,
      voteupCount: 345,
      commentCount: 23,
      shareCount: 56,
    },
    {
      ideaId: 'idea4',
      authorId: 'user2',
      content: '刚读完《噪声》（卡尼曼的新书），强烈推荐！这本书揭示了一个被严重忽视的问题——在做判断时，不同人之间的不一致性（噪声）可能比偏见带来的误差更大。对理解决策心理学很有帮助。',
      images: ['https://picsum.photos/400/300?random=idea4'],
      topics: ['topic3', 'topic6'],
      createdTime: now - 12 * 60 * 60 * 1000,
      voteupCount: 456,
      commentCount: 28,
      shareCount: 67,
    },
    {
      ideaId: 'idea5',
      authorId: 'user0',
      content: '周末去了趟长城（慕田峪段），人少景美，秋天的色彩真的太美了。远处的山峦层层叠叠，近处的红叶映衬着古老的城墙，感觉穿越了时空。强烈推荐秋天来！',
      images: ['https://picsum.photos/400/300?random=idea5a', 'https://picsum.photos/400/300?random=idea5b', 'https://picsum.photos/400/300?random=idea5c'],
      topics: ['topic10'],
      createdTime: now - 24 * 60 * 60 * 1000,
      voteupCount: 678,
      commentCount: 45,
      shareCount: 123,
    },
  ];

  const collections = [
    {
      collectionId: 'col1',
      name: '我的收藏',
      description: '默认收藏夹',
      privacy: 'private' as const,
      itemIds: ['a1', 'a6', 'a16'],
      itemTypes: ['answer' as const, 'answer' as const, 'answer' as const],
      createdTime: now - 60 * 24 * 60 * 60 * 1000,
      updatedTime: now - 1 * 24 * 60 * 60 * 1000,
    },
    {
      collectionId: 'col2',
      name: '技术文章精选',
      description: '收集优质的技术类回答和文章',
      privacy: 'public' as const,
      itemIds: ['a9', 'a4'],
      itemTypes: ['answer' as const, 'answer' as const],
      createdTime: now - 30 * 24 * 60 * 60 * 1000,
      updatedTime: now - 3 * 24 * 60 * 60 * 1000,
    },
    {
      collectionId: 'col3',
      name: '好答案',
      description: '各领域的精彩回答',
      privacy: 'public' as const,
      itemIds: ['a1', 'a6', 'a15', 'a18'],
      itemTypes: ['answer' as const, 'answer' as const, 'answer' as const, 'answer' as const],
      createdTime: now - 45 * 24 * 60 * 60 * 1000,
      updatedTime: now - 2 * 24 * 60 * 60 * 1000,
    },
  ];

  const notifications = [
    {
      notificationId: 'notif1',
      type: 'voteup' as const,
      fromUserId: 'user3',
      targetId: 'a8',
      targetType: 'answer' as const,
      content: '赞同了你的回答',
      isRead: false,
      createdTime: now - 2 * 60 * 60 * 1000,
    },
    {
      notificationId: 'notif2',
      type: 'comment' as const,
      fromUserId: 'user2',
      targetId: 'a8',
      targetType: 'answer' as const,
      content: '评论了你的回答',
      isRead: false,
      createdTime: now - 4 * 60 * 60 * 1000,
    },
    {
      notificationId: 'notif3',
      type: 'follow' as const,
      fromUserId: 'user9',
      targetId: 'user0',
      content: '关注了你',
      isRead: false,
      createdTime: now - 6 * 60 * 60 * 1000,
    },
    {
      notificationId: 'notif4',
      type: 'favorite' as const,
      fromUserId: 'user1',
      targetId: 'a8',
      targetType: 'answer' as const,
      content: '收藏了你的回答',
      isRead: true,
      createdTime: now - 12 * 60 * 60 * 1000,
    },
    {
      notificationId: 'notif5',
      type: 'thank' as const,
      fromUserId: 'user5',
      targetId: 'a8',
      targetType: 'answer' as const,
      content: '感谢了你的回答',
      isRead: true,
      createdTime: now - 24 * 60 * 60 * 1000,
    },
    {
      notificationId: 'notif6',
      type: 'invite' as const,
      fromUserId: 'user8',
      targetId: 'q8',
      targetType: 'question' as const,
      content: '邀请你回答问题「设计师如何提升审美能力？」',
      isRead: false,
      createdTime: now - 36 * 60 * 60 * 1000,
    },
    {
      notificationId: 'notif7',
      type: 'system' as const,
      content: '你的回答「如何评价人工智能的发展前景？」被收录到热门话题',
      isRead: true,
      createdTime: now - 48 * 60 * 60 * 1000,
    },
    {
      notificationId: 'notif8',
      type: 'comment' as const,
      fromUserId: 'user6',
      targetId: 'a8',
      targetType: 'answer' as const,
      content: '回复了你的评论',
      isRead: true,
      createdTime: now - 72 * 60 * 60 * 1000,
    },
  ];

  return {
    currentUser: users[0],
    users,
    questions,
    answers,
    articles,
    comments,
    topics,
    collections,
    notifications,
    ideas,
    userVoteups: { a1: true, a6: true, a9: true },
    userFavorites: { a1: true, a6: true },
    userFollowings: { user1: true, user3: true },
    userFollowedTopics: { topic1: true, topic2: true, topic5: true },
    userFollowedQuestions: { q1: true, q2: true },
    userCommentVoteups: {},
  };
};

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'zhihu_app_state';
const BASE_INITIAL_KEY = 'zhihu_initial_state';

function storageKey(sid: string | null): string {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid: string | null): string {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid: string | null = null): Promise<any> => {
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

let _syncTimer: ReturnType<typeof setTimeout> | null = null;

export const saveState = (state: AppState, sid: string | null = null): void => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  if (sid) {
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }
};

export const getInitialState = (sid: string | null = null): AppState | null => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Normalizers ---

function normalizeAnswer(answer: any, index: number) {
  return {
    answerId: answer.answerId || answer.id || `answer_custom_${index}`,
    questionId: answer.questionId || '',
    authorId: answer.authorId || answer.author || 'user0',
    content: answer.content || answer.text || '',
    createdTime: answer.createdTime || Date.now(),
    updatedTime: answer.updatedTime || Date.now(),
    voteupCount: typeof answer.voteupCount === 'number' ? answer.voteupCount : 0,
    commentCount: typeof answer.commentCount === 'number' ? answer.commentCount : 0,
    favoriteCount: typeof answer.favoriteCount === 'number' ? answer.favoriteCount : 0,
    thankCount: typeof answer.thankCount === 'number' ? answer.thankCount : 0,
  };
}

function normalizeQuestion(question: any, index: number) {
  return {
    questionId: question.questionId || question.id || `q_custom_${index}`,
    title: question.title || '',
    description: question.description || '',
    topics: Array.isArray(question.topics) ? question.topics : [],
    authorId: question.authorId || 'user0',
    createdTime: question.createdTime || Date.now(),
    updatedTime: question.updatedTime || Date.now(),
    followerCount: typeof question.followerCount === 'number' ? question.followerCount : 0,
    viewCount: typeof question.viewCount === 'number' ? question.viewCount : 0,
    answerCount: typeof question.answerCount === 'number' ? question.answerCount : 0,
  };
}

function normalizeNotification(notif: any, index: number) {
  return {
    notificationId: notif.notificationId || notif.id || `notif_custom_${index}`,
    type: notif.type || 'system',
    fromUserId: notif.fromUserId || '',
    targetId: notif.targetId || '',
    targetType: notif.targetType || 'answer',
    content: notif.content || '',
    isRead: typeof notif.isRead === 'boolean' ? notif.isRead : false,
    createdTime: notif.createdTime || Date.now(),
  };
}

const arrayNormalizers: Record<string, (item: any, index: number) => any> = {
  answers: normalizeAnswer,
  questions: normalizeQuestion,
  notifications: normalizeNotification,
};

function deepMergeWithDefaults(defaults: any, custom: any): any {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item: any, i: number) => arrayNormalizers[key](item, i));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export const initializeData = (sid: string | null = null, customState: any = null): AppState => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = { ...getDefaultData(), ...customState };
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
