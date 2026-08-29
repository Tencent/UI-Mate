export function createInitialData() {
  const now = Date.now();
  const day = 86400000;

  return {
    currentUserId: "u1",
    isDarkMode: false,
    users: {
      u1: {
        id: "u1",
        nickname: "生活美学家",
        redId: "lifestyle_guru",
        avatar: "https://i.pravatar.cc/150?u=u1",
        banner: "https://picsum.photos/seed/u1banner/800/300",
        bio: "分享日常美好生活 ✨ 美食 | 旅行 | 穿搭 | 探店好物推荐",
        gender: "female",
        location: "上海",
        verified: true,
        followingIds: ["u2", "u3", "u5", "u7"],
        followerIds: ["u2", "u4", "u6", "u8"],
        likesAndBookmarksReceived: 3280
      },
      u2: {
        id: "u2",
        nickname: "美食达人小林",
        redId: "foodie_lin",
        avatar: "https://i.pravatar.cc/150?u=u2",
        banner: "https://picsum.photos/seed/u2banner/800/300",
        bio: "美食探店 | 料理分享 | 每天都要吃好吃的 🍜🍣",
        gender: "female",
        location: "北京",
        verified: false,
        followingIds: ["u1", "u3", "u6"],
        followerIds: ["u1", "u3", "u4", "u5", "u6", "u7", "u8"],
        likesAndBookmarksReceived: 18500
      },
      u3: {
        id: "u3",
        nickname: "旅行摄影师Leo",
        redId: "traveler_leo",
        avatar: "https://i.pravatar.cc/150?u=u3",
        banner: "https://picsum.photos/seed/u3banner/800/300",
        bio: "用镜头记录世界之美 📷 | 足迹遍布30+国家 | 专业摄影咨询",
        gender: "male",
        location: "广州",
        verified: true,
        followingIds: ["u1", "u2", "u5"],
        followerIds: ["u1", "u2", "u4", "u5", "u6", "u7", "u8"],
        likesAndBookmarksReceived: 85200
      },
      u4: {
        id: "u4",
        nickname: "穿搭日记本",
        redId: "outfit_diary",
        avatar: "https://i.pravatar.cc/150?u=u4",
        banner: "https://picsum.photos/seed/u4banner/800/300",
        bio: "每天分享穿搭灵感 👗 | 小个子穿搭攻略 | 平价好物推荐",
        gender: "female",
        location: "杭州",
        verified: false,
        followingIds: ["u1", "u2", "u3", "u7"],
        followerIds: ["u3", "u5", "u6"],
        likesAndBookmarksReceived: 9600
      },
      u5: {
        id: "u5",
        nickname: "健身教练Amy",
        redId: "fitness_amy",
        avatar: "https://i.pravatar.cc/150?u=u5",
        banner: "https://picsum.photos/seed/u5banner/800/300",
        bio: "国家认证健身教练 💪 | 减脂塑形专业指导 | 健康饮食分享",
        gender: "female",
        location: "深圳",
        verified: true,
        followingIds: ["u1", "u3", "u2"],
        followerIds: ["u1", "u2", "u3", "u4", "u6", "u7", "u8"],
        likesAndBookmarksReceived: 42000
      },
      u6: {
        id: "u6",
        nickname: "咖啡与书",
        redId: "coffee_books",
        avatar: "https://i.pravatar.cc/150?u=u6",
        banner: "https://picsum.photos/seed/u6banner/800/300",
        bio: "慢生活爱好者 ☕📚 | 独立书店探访 | 手冲咖啡研究",
        gender: "male",
        location: "成都",
        verified: false,
        followingIds: ["u1", "u2", "u3"],
        followerIds: ["u1", "u2", "u3", "u4"],
        likesAndBookmarksReceived: 4200
      },
      u7: {
        id: "u7",
        nickname: "家居设计师Mia",
        redId: "home_mia",
        avatar: "https://i.pravatar.cc/150?u=u7",
        banner: "https://picsum.photos/seed/u7banner/800/300",
        bio: "室内设计师 🏠 | 小户型改造专家 | 北欧风格爱好者",
        gender: "female",
        location: "上海",
        verified: true,
        followingIds: ["u1", "u4", "u5"],
        followerIds: ["u1", "u2", "u3", "u4", "u5", "u6"],
        likesAndBookmarksReceived: 38000
      },
      u8: {
        id: "u8",
        nickname: "数码测评君",
        redId: "tech_review",
        avatar: "https://i.pravatar.cc/150?u=u8",
        banner: "https://picsum.photos/seed/u8banner/800/300",
        bio: "专业数码测评 📱💻 | 最新科技资讯 | 购机指南",
        gender: "male",
        location: "北京",
        verified: false,
        followingIds: ["u3", "u5"],
        followerIds: ["u1", "u3", "u4", "u5"],
        likesAndBookmarksReceived: 15600
      },
      u9: {
        id: "u9",
        nickname: "护肤研究所",
        redId: "skincare_lab",
        avatar: "https://i.pravatar.cc/150?u=u9",
        banner: "https://picsum.photos/seed/u9banner/800/300",
        bio: "成分党护肤博主 🧴 | 敏感肌护肤 | 功效护肤推荐 | 拒绝智商税",
        gender: "female",
        location: "广州",
        verified: true,
        followingIds: ["u1", "u4", "u5", "u7"],
        followerIds: ["u1", "u2", "u4", "u5", "u6", "u10"],
        likesAndBookmarksReceived: 26800
      },
      u10: {
        id: "u10",
        nickname: "萌宠日记",
        redId: "pet_diary",
        avatar: "https://i.pravatar.cc/150?u=u10",
        banner: "https://picsum.photos/seed/u10banner/800/300",
        bio: "家有两猫一狗 🐱🐱🐶 | 宠物日常 | 养宠经验分享 | 治愈系博主",
        gender: "female",
        location: "南京",
        verified: false,
        followingIds: ["u1", "u2", "u6", "u9"],
        followerIds: ["u1", "u3", "u5", "u6", "u9"],
        likesAndBookmarksReceived: 12400
      },
      u11: {
        id: "u11",
        nickname: "考研上岸指南",
        redId: "study_guide",
        avatar: "https://i.pravatar.cc/150?u=u11",
        banner: "https://picsum.photos/seed/u11banner/800/300",
        bio: "985上岸学姐 📖 | 考研经验 | 学习方法分享 | 自律打卡 | 一起加油",
        gender: "female",
        location: "武汉",
        verified: false,
        followingIds: ["u5", "u6", "u9"],
        followerIds: ["u1", "u2", "u4", "u6", "u8"],
        likesAndBookmarksReceived: 19200
      },
      u12: {
        id: "u12",
        nickname: "户外探险家",
        redId: "outdoor_explorer",
        avatar: "https://i.pravatar.cc/150?u=u12",
        banner: "https://picsum.photos/seed/u12banner/800/300",
        bio: "越野跑 | 露营 | 攀岩 🏕️ | 不走寻常路 | 记录每一次户外冒险",
        gender: "male",
        location: "昆明",
        verified: true,
        followingIds: ["u3", "u5", "u7"],
        followerIds: ["u1", "u2", "u3", "u5", "u8", "u10"],
        likesAndBookmarksReceived: 31500
      }
    },
    notes: {
      n1: {
        id: "n1",
        authorId: "u1",
        type: "image",
        title: "周末探店｜藏在巷子里的咖啡馆☕",
        content: "终于找到了这家藏在静安区的咖啡馆！\n环境超级好，特别适合拍照📸\n\n推荐他们家的拿铁和提拉米苏，味道绝绝子！\n每天限量供应的手工甜点也不要错过~\n\n地址在静安区愚园路旁边的小巷里\n\n#咖啡探店 #周末好去处 #上海美食 #打卡推荐",
        images: ["https://picsum.photos/seed/n1a/600/800", "https://picsum.photos/seed/n1b/600/800", "https://picsum.photos/seed/n1c/600/800"],
        videoUrl: null,
        hashtags: ["咖啡探店", "周末好去处", "上海美食", "打卡推荐"],
        location: "上海·静安区",
        likedByIds: ["u2", "u3", "u4", "u5", "u6"],
        bookmarkedByIds: ["u2", "u4", "u6"],
        commentCount: 12,
        shareCount: 8,
        isPinned: true,
        createdAt: now - 3 * day,
        category: "food"
      },
      n2: {
        id: "n2",
        authorId: "u1",
        type: "image",
        title: "夏日清爽穿搭｜5套通勤look分享",
        content: "最近天气越来越热了，分享5套适合上班通勤的清爽穿搭！\n\n第1套：白衬衫+阔腿裤，简约大方\n第2套：碎花裙+草帽，度假风\n第3套：牛仔短裤+条纹T恤，休闲舒适\n\n所有单品都有链接，评论区见~\n\n#夏日穿搭 #通勤穿搭 #穿搭分享 #ootd",
        images: ["https://picsum.photos/seed/n2a/600/900", "https://picsum.photos/seed/n2b/600/900", "https://picsum.photos/seed/n2c/600/900", "https://picsum.photos/seed/n2d/600/900", "https://picsum.photos/seed/n2e/600/900"],
        videoUrl: null,
        hashtags: ["夏日穿搭", "通勤穿搭", "穿搭分享", "ootd"],
        location: "上海",
        likedByIds: ["u3", "u4", "u5", "u7", "u8"],
        bookmarkedByIds: ["u3", "u4", "u7"],
        commentCount: 8,
        shareCount: 15,
        isPinned: false,
        createdAt: now - 7 * day,
        category: "fashion"
      },
      n3: {
        id: "n3",
        authorId: "u1",
        type: "image",
        title: "30平小户型改造前后对比✨",
        content: "终于把租的小房间改造完了！花了不到3000块让空间焕然一新！\n\n改造重点：\n1. 利用竖向空间增加储物\n2. 浅色系让空间看起来更大\n3. 绿植点缀增添生机\n\n详细改造清单和花费明细在评论区\n\n#小户型改造 #家居改造 #出租屋改造 #收纳技巧",
        images: ["https://picsum.photos/seed/n3a/800/600", "https://picsum.photos/seed/n3b/800/600"],
        videoUrl: null,
        hashtags: ["小户型改造", "家居改造", "出租屋改造", "收纳技巧"],
        location: "上海",
        likedByIds: ["u2", "u6", "u7", "u8"],
        bookmarkedByIds: ["u6", "u7", "u8"],
        commentCount: 18,
        shareCount: 22,
        isPinned: false,
        createdAt: now - 14 * day,
        category: "home"
      },
      n4: {
        id: "n4",
        authorId: "u1",
        type: "image",
        title: "云南大理旅行攻略｜古城+洱海5天行程",
        content: "刚从大理回来，这次旅行太治愈了！分享完整的5天行程\n\n Day1: 抵达大理，古城漫步\nDay2: 洱海环游，苍山日落\nDay3: 喜洲古镇，双廊小镇\nDay4: 三塔寺，当地集市\nDay5: 返程\n\n住宿、美食、交通全攻略见评论区！\n\n#大理旅行 #云南旅游 #洱海 #旅行攻略",
        images: ["https://picsum.photos/seed/n4a/800/600", "https://picsum.photos/seed/n4b/800/600", "https://picsum.photos/seed/n4c/600/800"],
        videoUrl: null,
        hashtags: ["大理旅行", "云南旅游", "洱海", "旅行攻略"],
        location: "云南·大理",
        likedByIds: ["u2", "u3", "u5", "u6", "u8"],
        bookmarkedByIds: ["u3", "u5", "u6"],
        commentCount: 25,
        shareCount: 35,
        isPinned: false,
        createdAt: now - 21 * day,
        category: "travel"
      },
      n5: {
        id: "n5",
        authorId: "u2",
        type: "image",
        title: "北京这家烤鸭真的绝！人均150吃到撑",
        content: "吃了这么多年北京烤鸭，这家是我心中TOP1！\n\n皮脆肉嫩，鸭皮超薄，蘸着甜面酱和葱丝卷着吃，太幸福了🤤\n\n一定要点的：\n✅ 烤鸭（提前预订！）\n✅ 炸酱面\n✅ 宫保鸡丁\n\n人均150，两个人吃完美！\n\n#北京美食 #烤鸭 #北京探店 #必吃清单",
        images: ["https://picsum.photos/seed/n5a/600/600", "https://picsum.photos/seed/n5b/600/600", "https://picsum.photos/seed/n5c/600/600"],
        videoUrl: null,
        hashtags: ["北京美食", "烤鸭", "北京探店", "必吃清单"],
        location: "北京·东城区",
        likedByIds: ["u1", "u3", "u4", "u5", "u6", "u7", "u8"],
        bookmarkedByIds: ["u1", "u3", "u4", "u7"],
        commentCount: 32,
        shareCount: 18,
        isPinned: false,
        createdAt: now - 2 * day,
        category: "food"
      },
      n6: {
        id: "n6",
        authorId: "u2",
        type: "image",
        title: "在家做日式拉面｜汤底秘方大公开🍜",
        content: "终于研究出了接近店里味道的猪骨汤底！\n\n食材清单（2人份）：\n- 猪骨1kg\n- 老姜3片\n- 大葱1根\n- 酱油50ml\n- 味霖30ml\n\n步骤详见视频，关键是要提前焯水！\n\n#自制拉面 #日式料理 #在家做饭 #美食教程",
        images: ["https://picsum.photos/seed/n6a/800/600", "https://picsum.photos/seed/n6b/800/600"],
        videoUrl: null,
        hashtags: ["自制拉面", "日式料理", "在家做饭", "美食教程"],
        location: "北京",
        likedByIds: ["u1", "u4", "u5", "u6", "u7"],
        bookmarkedByIds: ["u1", "u5", "u6"],
        commentCount: 15,
        shareCount: 12,
        isPinned: false,
        createdAt: now - 5 * day,
        category: "food"
      },
      n7: {
        id: "n7",
        authorId: "u3",
        type: "image",
        title: "冰岛极光追逐记｜一生必去的绝美景色",
        content: "三年前就开始计划这趟冰岛之旅，终于在这个冬天实现了！\n\n看到极光的那一刻，真的哭了😭\n那种绿色的光芒在天空中舞动，太震撼了\n\n追极光Tips:\n1. 查天气预报，选云少的夜晚\n2. 离开城市，避开光污染\n3. 准备好防风防寒装备\n\n详细行程攻略关注主页查看\n\n#冰岛旅行 #极光 #北欧旅游 #旅行摄影",
        images: ["https://picsum.photos/seed/n7a/800/600", "https://picsum.photos/seed/n7b/800/600", "https://picsum.photos/seed/n7c/800/600", "https://picsum.photos/seed/n7d/800/600"],
        videoUrl: null,
        hashtags: ["冰岛旅行", "极光", "北欧旅游", "旅行摄影"],
        location: "冰岛·雷克雅未克",
        likedByIds: ["u1", "u2", "u4", "u5", "u6", "u7", "u8"],
        bookmarkedByIds: ["u1", "u2", "u4", "u5", "u8"],
        commentCount: 48,
        shareCount: 65,
        isPinned: true,
        createdAt: now - 4 * day,
        category: "travel"
      },
      n8: {
        id: "n8",
        authorId: "u3",
        type: "image",
        title: "京都赏樱最佳打卡地TOP5📸",
        content: "每年3月底-4月初是京都樱花季，分享5个绝美赏樱地！\n\n1. 岚山渡月桥 - 最经典的樱花倒影\n2. 哲学之道 - 绵延2km的樱花隧道\n3. 清水寺 - 古建筑与樱花的完美搭配\n4. 醍醐寺 - 花见团的首选\n5. 二条城 - 护城河边的樱花\n\n最佳时间：通常是3月下旬到4月上旬\n\n#京都赏樱 #日本旅游 #樱花季 #旅行摄影",
        images: ["https://picsum.photos/seed/n8a/600/800", "https://picsum.photos/seed/n8b/600/800", "https://picsum.photos/seed/n8c/600/800"],
        videoUrl: null,
        hashtags: ["京都赏樱", "日本旅游", "樱花季", "旅行摄影"],
        location: "日本·京都",
        likedByIds: ["u1", "u2", "u4", "u5", "u6", "u7"],
        bookmarkedByIds: ["u1", "u2", "u4", "u6"],
        commentCount: 36,
        shareCount: 42,
        isPinned: false,
        createdAt: now - 8 * day,
        category: "travel"
      },
      n9: {
        id: "n9",
        authorId: "u4",
        type: "image",
        title: "小个子穿搭秘籍｜显高10cm的方法",
        content: "作为155cm的女生，终于总结出一套显高穿搭法则！\n\n关键技巧：\n1. 高腰线设计 - 拉长下半身比例\n2. 同色系搭配 - 视觉上拉伸身形\n3. 竖条纹图案 - 天然显高\n4. V领/深V设计 - 拉长颈部线条\n5. 避免横条纹和宽腰带\n\n这套搭配是今天的穿搭，有没有感觉长高了？\n\n#小个子穿搭 #显高穿搭 #穿搭技巧 #ootd",
        images: ["https://picsum.photos/seed/n9a/600/900", "https://picsum.photos/seed/n9b/600/900"],
        videoUrl: null,
        hashtags: ["小个子穿搭", "显高穿搭", "穿搭技巧", "ootd"],
        location: "杭州",
        likedByIds: ["u1", "u2", "u5", "u6", "u7", "u8"],
        bookmarkedByIds: ["u1", "u2", "u6", "u7"],
        commentCount: 22,
        shareCount: 19,
        isPinned: false,
        createdAt: now - 3 * day,
        category: "fashion"
      },
      n10: {
        id: "n10",
        authorId: "u4",
        type: "image",
        title: "秋冬必备的5件百搭单品🍂",
        content: "每年秋冬都会买一堆衣服，但总感觉没衣服穿？\n分享我今年秋冬最爱的5件百搭单品：\n\n1. 驼色毛呢大衣 - 万能外套\n2. 奶白色高领毛衣 - 百搭内搭\n3. 深灰色直筒裤 - 通勤首选\n4. 棕色切尔西靴 - 显腿长神器\n5. 咖色皮质包包 - 提升整体质感\n\n#秋冬穿搭 #百搭单品 #穿搭指南 #时尚",
        images: ["https://picsum.photos/seed/n10a/600/800", "https://picsum.photos/seed/n10b/600/800", "https://picsum.photos/seed/n10c/600/800"],
        videoUrl: null,
        hashtags: ["秋冬穿搭", "百搭单品", "穿搭指南", "时尚"],
        location: "杭州",
        likedByIds: ["u1", "u2", "u3", "u5", "u7"],
        bookmarkedByIds: ["u2", "u5", "u7"],
        commentCount: 16,
        shareCount: 11,
        isPinned: false,
        createdAt: now - 10 * day,
        category: "fashion"
      },
      n11: {
        id: "n11",
        authorId: "u5",
        type: "image",
        title: "30天减脂计划｜真实成果分享",
        content: "坚持了30天，减掉了5斤！分享我的减脂方法🔥\n\n饮食方面：\n- 每餐控制在500卡以内\n- 多蛋白质少碳水\n- 戒糖戒零食\n\n运动方面：\n- 每天30分钟有氧+20分钟力量训练\n- 步行上下班\n\n最重要的是坚持！前两周最难熬，熬过去就好了\n\n#减脂 #健身打卡 #减肥日记 #健康生活",
        images: ["https://picsum.photos/seed/n11a/600/800", "https://picsum.photos/seed/n11b/600/800"],
        videoUrl: null,
        hashtags: ["减脂", "健身打卡", "减肥日记", "健康生活"],
        location: "深圳",
        likedByIds: ["u1", "u2", "u3", "u4", "u6", "u7", "u8"],
        bookmarkedByIds: ["u1", "u2", "u3", "u4", "u6"],
        commentCount: 55,
        shareCount: 48,
        isPinned: false,
        createdAt: now - 5 * day,
        category: "fitness"
      },
      n12: {
        id: "n12",
        authorId: "u5",
        type: "image",
        title: "适合在家练的HIIT训练｜无需器材",
        content: "没有健身房也能练出好身材！这套HIIT训练我已经坚持了半年\n\n动作列表（每个做30秒，休息10秒）：\n1. 开合跳\n2. 深蹲跳\n3. 俯卧撑\n4. 平板支撑\n5. 高抬腿\n6. 波比跳\n\n重复3组，总时长约20分钟\n\n新手可以从每个动作15秒开始，循序渐进\n\n#HIIT训练 #居家健身 #无器械训练 #健身打卡",
        images: ["https://picsum.photos/seed/n12a/600/800"],
        videoUrl: null,
        hashtags: ["HIIT训练", "居家健身", "无器械训练", "健身打卡"],
        location: "深圳",
        likedByIds: ["u1", "u2", "u3", "u4", "u6", "u7"],
        bookmarkedByIds: ["u1", "u2", "u4"],
        commentCount: 28,
        shareCount: 32,
        isPinned: true,
        createdAt: now - 12 * day,
        category: "fitness"
      },
      n13: {
        id: "n13",
        authorId: "u6",
        type: "image",
        title: "成都最美独立书店探访｜藏在老街里的宝藏",
        content: "这家书店藏在玉林路的老街里，不看攻略根本发现不了！\n\n书店特点：\n- 超过3万册藏书\n- 复古工业风装修\n- 自家烘焙咖啡\n- 不定期举办读书分享会\n\n在这里泡了一整个下午，买了三本书，喝了两杯咖啡\n人均消费大概60-80元\n\n#成都书店 #独立书店 #阅读 #慢生活",
        images: ["https://picsum.photos/seed/n13a/600/800", "https://picsum.photos/seed/n13b/600/800"],
        videoUrl: null,
        hashtags: ["成都书店", "独立书店", "阅读", "慢生活"],
        location: "成都·武侯区",
        likedByIds: ["u1", "u2", "u3", "u4", "u7"],
        bookmarkedByIds: ["u1", "u3", "u7"],
        commentCount: 14,
        shareCount: 9,
        isPinned: false,
        createdAt: now - 6 * day,
        category: "food"
      },
      n14: {
        id: "n14",
        authorId: "u6",
        type: "image",
        title: "手冲咖啡入门指南｜器具和参数分享",
        content: "入坑手冲咖啡一年了，分享我的入门经验！\n\n必备器具：\n1. 手冲壶（细嘴壶更好控制水流）\n2. 滤杯（推荐V60或蛋糕杯）\n3. 电子秤（精确到0.1g）\n4. 温度计（85-93°C）\n5. 磨豆机\n\n基础参数：\n- 豆粉比：1:15（豆子:水）\n- 水温：88°C\n- 研磨度：中细\n- 注水时间：2-3分钟\n\n#手冲咖啡 #咖啡器具 #咖啡教程 #生活方式",
        images: ["https://picsum.photos/seed/n14a/800/600", "https://picsum.photos/seed/n14b/800/600", "https://picsum.photos/seed/n14c/600/800"],
        videoUrl: null,
        hashtags: ["手冲咖啡", "咖啡器具", "咖啡教程", "生活方式"],
        location: "成都",
        likedByIds: ["u1", "u2", "u3", "u5"],
        bookmarkedByIds: ["u1", "u2"],
        commentCount: 19,
        shareCount: 14,
        isPinned: false,
        createdAt: now - 9 * day,
        category: "food"
      },
      n15: {
        id: "n15",
        authorId: "u7",
        type: "image",
        title: "60平北欧风改造｜整体花费和设计理念",
        content: "历时3个月，终于完成了新家改造！来看看成品吧~\n\n设计理念：简约北欧风\n主色调：白色+原木色+墨绿色\n\n主要改动：\n- 打通客厅和餐厅，扩大空间感\n- 定制收纳柜，最大化利用空间\n- 加入绿植和灯光装饰\n\n总花费：8.5万（不含软装）\n详细清单和购物链接评论区见！\n\n#北欧风装修 #家居设计 #家居改造 #装修日记",
        images: ["https://picsum.photos/seed/n15a/800/600", "https://picsum.photos/seed/n15b/800/600", "https://picsum.photos/seed/n15c/800/600", "https://picsum.photos/seed/n15d/800/600"],
        videoUrl: null,
        hashtags: ["北欧风装修", "家居设计", "家居改造", "装修日记"],
        location: "上海",
        likedByIds: ["u1", "u2", "u3", "u4", "u5", "u6", "u8"],
        bookmarkedByIds: ["u1", "u2", "u3", "u5", "u6"],
        commentCount: 62,
        shareCount: 75,
        isPinned: true,
        createdAt: now - 15 * day,
        category: "home"
      },
      n16: {
        id: "n16",
        authorId: "u7",
        type: "image",
        title: "宿舍改造｜400元打造温馨小空间",
        content: "宿舍改造完成！整体花费不到400元！\n\n改造思路：\n1. 床帘遮丑+增加私密感\n2. 折叠小桌板扩展学习空间\n3. LED灯带营造氛围\n4. 墙贴装饰，不留痕迹\n\n所有物品都是在淘宝买的，评论区有链接！\n\n#宿舍改造 #宿舍收纳 #大学生 #家居好物",
        images: ["https://picsum.photos/seed/n16a/600/800", "https://picsum.photos/seed/n16b/600/800"],
        videoUrl: null,
        hashtags: ["宿舍改造", "宿舍收纳", "大学生", "家居好物"],
        location: "上海",
        likedByIds: ["u1", "u2", "u4", "u5", "u6"],
        bookmarkedByIds: ["u2", "u4", "u6"],
        commentCount: 38,
        shareCount: 44,
        isPinned: false,
        createdAt: now - 20 * day,
        category: "home"
      },
      n17: {
        id: "n17",
        authorId: "u8",
        type: "image",
        title: "iPhone 16 Pro测评｜值不值得升级？",
        content: "用了两周，来说说iPhone 16 Pro的真实感受！\n\n亮点：\n✅ 相机系统大幅升级，夜景效果惊艳\n✅ A18芯片性能怪兽\n✅ 续航明显改善\n✅ 新增相机控制按钮很实用\n\n不足：\n❌ 价格依然很贵\n❌ 外观变化不大\n❌ 充电速度仍然偏慢\n\n总结：如果你现在用的是13以上，暂时不需要换\n如果是13以下，升级体验会很明显\n\n#iPhone评测 #数码测评 #科技 #苹果",
        images: ["https://picsum.photos/seed/n17a/800/600", "https://picsum.photos/seed/n17b/800/600", "https://picsum.photos/seed/n17c/800/600"],
        videoUrl: null,
        hashtags: ["iPhone评测", "数码测评", "科技", "苹果"],
        location: "北京",
        likedByIds: ["u1", "u3", "u4", "u5", "u6", "u7"],
        bookmarkedByIds: ["u3", "u4", "u6"],
        commentCount: 45,
        shareCount: 28,
        isPinned: false,
        createdAt: now - 7 * day,
        category: "digital"
      },
      n18: {
        id: "n18",
        authorId: "u8",
        type: "image",
        title: "平价蓝牙耳机横评｜200元内最好的选择",
        content: "测评了8款200元以内的蓝牙耳机，给大家做个总结！\n\n综合推荐排名：\n🥇 第一：JLAB Go Air Pop - 音质最好，续航最长\n🥈 第二：QCY T13 - 性价比之王\n🥉 第三：漫步者LolliPods - 颜值高\n\n评测维度：\n音质、延迟、降噪、续航、佩戴舒适度\n\n详细参数对比在下方图片中\n\n#耳机推荐 #平价好物 #数码测评 #学生党",
        images: ["https://picsum.photos/seed/n18a/800/600", "https://picsum.photos/seed/n18b/800/600"],
        videoUrl: null,
        hashtags: ["耳机推荐", "平价好物", "数码测评", "学生党"],
        location: "北京",
        likedByIds: ["u1", "u2", "u3", "u4", "u5"],
        bookmarkedByIds: ["u1", "u3", "u4"],
        commentCount: 23,
        shareCount: 17,
        isPinned: false,
        createdAt: now - 11 * day,
        category: "digital"
      },
      n19: {
        id: "n19",
        authorId: "u2",
        type: "image",
        title: "上海网红餐厅避坑指南｜这些踩雷了",
        content: "在上海生活5年，试过了无数网红餐厅，来说说哪些踩雷了！\n\n踩雷名单（排名不分先后）：\n1. 某火锅店 - 排队3小时，味道普通\n2. 某ins风cafe - 出餐慢，性价比低\n3. 某日料 - 过誉严重，不如普通日料店\n\n靠谱的平价好店：\n✅ 新天地附近的小店\n✅ 安福路沿线餐厅\n\n#上海美食 #踩雷 #避坑指南 #上海探店",
        images: ["https://picsum.photos/seed/n19a/600/600", "https://picsum.photos/seed/n19b/600/600"],
        videoUrl: null,
        hashtags: ["上海美食", "踩雷", "避坑指南", "上海探店"],
        location: "上海",
        likedByIds: ["u1", "u3", "u4", "u5", "u6", "u7"],
        bookmarkedByIds: ["u1", "u4", "u5", "u6"],
        commentCount: 41,
        shareCount: 38,
        isPinned: false,
        createdAt: now - 4 * day,
        category: "food"
      },
      n20: {
        id: "n20",
        authorId: "u3",
        type: "image",
        title: "西藏徒步｜从拉萨到纳木错3天行程记录",
        content: "终于完成了心心念念的纳木错徒步！海拔4718m，真的会高反\n\n行程安排：\nDay1: 拉萨适应（必须！不然会很难受）\nDay2: 驱车前往纳木错，扎营\nDay3: 环湖徒步，下午返回拉萨\n\n高反应对：\n- 慢慢走，不要着急\n- 多喝水，少剧烈运动\n- 备好高反药\n\n这片圣湖太美了，值得每一步努力\n\n#西藏旅行 #纳木错 #徒步 #圣地",
        images: ["https://picsum.photos/seed/n20a/800/600", "https://picsum.photos/seed/n20b/800/600", "https://picsum.photos/seed/n20c/600/800"],
        videoUrl: null,
        hashtags: ["西藏旅行", "纳木错", "徒步", "圣地"],
        location: "西藏·那曲",
        likedByIds: ["u1", "u2", "u4", "u5", "u6", "u7", "u8"],
        bookmarkedByIds: ["u1", "u2", "u4", "u5", "u7"],
        commentCount: 52,
        shareCount: 58,
        isPinned: false,
        createdAt: now - 16 * day,
        category: "travel"
      },
      n21: {
        id: "n21",
        authorId: "u5",
        type: "image",
        title: "早起的健身人｜5点半晨练打卡记录",
        content: "连续90天坚持5:30起床晨练！来分享一下这种生活方式的改变\n\n晨练的好处：\n1. 一天都充满活力\n2. 不会因为加班而中断锻炼\n3. 人少，健身房/公园很舒适\n4. 养成了规律作息\n\n我的晨练日程：\n5:30 起床喝水\n5:45 到健身房\n7:00 回家洗澡\n7:30 吃早餐上班\n\n第一周最难熬，坚持过去就好了！\n\n#晨练 #健身打卡 #早起 #自律",
        images: ["https://picsum.photos/seed/n21a/600/800"],
        videoUrl: null,
        hashtags: ["晨练", "健身打卡", "早起", "自律"],
        location: "深圳",
        likedByIds: ["u1", "u2", "u3", "u4", "u6", "u7"],
        bookmarkedByIds: ["u1", "u2", "u3"],
        commentCount: 33,
        shareCount: 25,
        isPinned: false,
        createdAt: now - 8 * day,
        category: "fitness"
      },
      n22: {
        id: "n22",
        authorId: "u4",
        type: "image",
        title: "平价好物分享｜这些宝藏单品不到100元",
        content: "最近入手了一批平价好物，每一件都超级值！\n\n1. 网格收纳袋（19.9元）- 整理出行神器\n2. 折叠小风扇（39元）- 夏天必备\n3. 磁吸充电线（25元）- 充电方便很多\n4. 硅胶面膜碗（15.9元）- 自制面膜必备\n5. 懒人眼镜支架（29元）- 躺着刷手机\n\n链接都在评论区，感兴趣的去看看~\n\n#平价好物 #宝藏单品 #好物推荐 #生活好物",
        images: ["https://picsum.photos/seed/n22a/600/600", "https://picsum.photos/seed/n22b/600/600", "https://picsum.photos/seed/n22c/600/600"],
        videoUrl: null,
        hashtags: ["平价好物", "宝藏单品", "好物推荐", "生活好物"],
        location: "杭州",
        likedByIds: ["u1", "u2", "u3", "u5", "u6", "u7", "u8"],
        bookmarkedByIds: ["u1", "u2", "u3", "u5", "u7"],
        commentCount: 28,
        shareCount: 31,
        isPinned: false,
        createdAt: now - 6 * day,
        category: "fashion"
      },
      n23: {
        id: "n23",
        authorId: "u7",
        type: "image",
        title: "家居香薰推荐｜让家里香起来的好方法",
        content: "发现了让家里持续飘香的方法！分享我的香薰好物\n\n我家用的香薰方式：\n1. 藤条扩香（无需插电，持久稳定）\n2. 蜡烛（营造氛围，睡前用）\n3. 香薰机（范围大，可以加精油）\n\n推荐品牌：\n🕯 WoodWick - 木芯蜡烛声音超治愈\n🌿 The White Company - 藤条扩香经典款\n💦 MUJI - 性价比高的超声波香薰机\n\n#家居香薰 #生活好物 #气味 #家居美学",
        images: ["https://picsum.photos/seed/n23a/600/800", "https://picsum.photos/seed/n23b/600/800"],
        videoUrl: null,
        hashtags: ["家居香薰", "生活好物", "气味", "家居美学"],
        location: "上海",
        likedByIds: ["u1", "u2", "u4", "u5", "u6"],
        bookmarkedByIds: ["u1", "u4", "u5"],
        commentCount: 17,
        shareCount: 13,
        isPinned: false,
        createdAt: now - 13 * day,
        category: "home"
      },
      n24: {
        id: "n24",
        authorId: "u6",
        type: "image",
        title: "阅读挑战完成！今年读了52本书的心得",
        content: "2024年52本书挑战完成！（每周一本）来分享最喜欢的10本\n\n非虚构类：\n1. 《思考，快与慢》\n2. 《被讨厌的勇气》\n3. 《原子习惯》\n\n虚构类：\n4. 《百年孤独》\n5. 《白鹿原》\n6. 《活着》\n\n科普类：\n7. 《人类简史》\n8. 《时间简史》\n\n每本都有简短书评，感兴趣留言我整理发出来！\n\n#阅读 #书单推荐 #读书笔记 #个人成长",
        images: ["https://picsum.photos/seed/n24a/800/600", "https://picsum.photos/seed/n24b/800/600"],
        videoUrl: null,
        hashtags: ["阅读", "书单推荐", "读书笔记", "个人成长"],
        location: "成都",
        likedByIds: ["u1", "u2", "u3", "u4", "u7", "u8"],
        bookmarkedByIds: ["u1", "u2", "u3", "u7"],
        commentCount: 31,
        shareCount: 22,
        isPinned: false,
        createdAt: now - 18 * day,
        category: "study"
      },
      n25: {
        id: "n25",
        authorId: "u2",
        type: "image",
        title: "零基础学做蛋糕｜生日蛋糕成功了！",
        content: "没有烤箱经验的我，第一次做生日蛋糕成功了！！\n\n用的是戚风蛋糕胚，奶油霜装饰\n\n材料（6寸）：\n- 低筋面粉 80g\n- 鸡蛋 4个\n- 细砂糖 70g\n- 玉米油 40ml\n- 牛奶 40ml\n\n关键：蛋白打发要到位！有小弯钩状态就可以了\n\n装饰用了冻干草莓和新鲜蓝莓，颜值还可以吧？\n\n#烘焙 #生日蛋糕 #戚风蛋糕 #美食制作",
        images: ["https://picsum.photos/seed/n25a/600/600", "https://picsum.photos/seed/n25b/600/600"],
        videoUrl: null,
        hashtags: ["烘焙", "生日蛋糕", "戚风蛋糕", "美食制作"],
        location: "北京",
        likedByIds: ["u1", "u3", "u4", "u6", "u7"],
        bookmarkedByIds: ["u1", "u4", "u6"],
        commentCount: 20,
        shareCount: 16,
        isPinned: false,
        createdAt: now - 9 * day,
        category: "food"
      },
      n26: {
        id: "n26",
        authorId: "u9",
        type: "image",
        title: "敏感肌秋冬护肤攻略｜温和修护不踩雷",
        content: "换季敏感肌又开始泛红了😣 分享我的修护经验！\n\n清洁：\n- 氨基酸洁面乳（千万别用皂基！）\n- 水温控制在35-37°C\n\n护肤步骤：\n1. 舒缓喷雾\n2. 修护精华（含神经酰胺成分）\n3. 面霜封层锁水\n\n护肤原则：精简护肤，少即是多\n\n#敏感肌 #护肤攻略 #换季护肤 #成分党",
        images: ["https://picsum.photos/seed/n26a/600/800", "https://picsum.photos/seed/n26b/600/800", "https://picsum.photos/seed/n26c/600/800"],
        videoUrl: null,
        hashtags: ["敏感肌", "护肤攻略", "换季护肤", "成分党"],
        location: "广州",
        likedByIds: ["u1", "u2", "u4", "u5", "u6", "u10"],
        bookmarkedByIds: ["u1", "u4", "u5", "u10"],
        commentCount: 26,
        shareCount: 20,
        isPinned: true,
        createdAt: now - 2 * day,
        category: "beauty"
      },
      n27: {
        id: "n27",
        authorId: "u10",
        type: "image",
        title: "猫咪日常｜我家橘猫又胖了两斤😂",
        content: "大橘最近又胖了...体检回来医生说要减肥了🤦‍♀️\n\n猫咪减肥计划：\n1. 控制主粮量（每天80g→60g）\n2. 增加逗猫棒互动时间\n3. 把零食换成冻干鸡胸肉\n4. 买了自动喂食器控制进食\n\n第一张是一年前，第二张是现在\n你们说他是不是圆了好多？\n\n#橘猫 #猫咪日常 #萌宠 #猫咪减肥",
        images: ["https://picsum.photos/seed/n27a/600/600", "https://picsum.photos/seed/n27b/600/600", "https://picsum.photos/seed/n27c/600/800"],
        videoUrl: null,
        hashtags: ["橘猫", "猫咪日常", "萌宠", "猫咪减肥"],
        location: "南京",
        likedByIds: ["u1", "u2", "u3", "u4", "u6", "u7", "u9"],
        bookmarkedByIds: ["u1", "u6", "u9"],
        commentCount: 35,
        shareCount: 18,
        isPinned: false,
        createdAt: now - 1 * day,
        category: "pets"
      },
      n28: {
        id: "n28",
        authorId: "u11",
        type: "image",
        title: "考研上岸经验｜三个月逆袭985全记录",
        content: "从二本到985，三个月的考研复习经历分享\n\n时间规划：\n6:00-7:00 背单词\n7:30-11:30 政治/数学\n14:00-17:30 专业课\n19:00-22:00 英语/刷题\n\n用到的APP：\n📱 Anki - 背单词和知识点\n📱 XMind - 做思维导图\n📱 Forest - 番茄钟专注\n\n心态真的很重要！最后一个月压力最大\n\n#考研 #考研经验 #学习方法 #上岸",
        images: ["https://picsum.photos/seed/n28a/600/800", "https://picsum.photos/seed/n28b/600/800"],
        videoUrl: null,
        hashtags: ["考研", "考研经验", "学习方法", "上岸"],
        location: "武汉",
        likedByIds: ["u1", "u2", "u4", "u6", "u8", "u9", "u10"],
        bookmarkedByIds: ["u1", "u4", "u6", "u8"],
        commentCount: 42,
        shareCount: 55,
        isPinned: false,
        createdAt: now - 3 * day,
        category: "study"
      },
      n29: {
        id: "n29",
        authorId: "u12",
        type: "image",
        title: "武功山徒步全攻略｜云海日出太震撼了",
        content: "终于完成了心心念念的武功山徒步！两天一夜行程分享\n\nDay1：\n正门上山→金顶（约6小时）\n在金顶附近扎营看日落\n\nDay2：\n早起看日出+云海\n下山→景区出口（约4小时）\n\n必带装备：\n🎒 登山杖（下山必备）\n⛺ 帐篷/睡袋\n🧥 冲锋衣（山顶风大很冷）\n💡 头灯\n\n云海真的太美了！值得每一步\n\n#武功山 #徒步 #露营 #户外探险",
        images: ["https://picsum.photos/seed/n29a/800/600", "https://picsum.photos/seed/n29b/800/600", "https://picsum.photos/seed/n29c/600/800", "https://picsum.photos/seed/n29d/800/600"],
        videoUrl: null,
        hashtags: ["武功山", "徒步", "露营", "户外探险"],
        location: "江西·萍乡",
        likedByIds: ["u1", "u2", "u3", "u5", "u6", "u7", "u8", "u10"],
        bookmarkedByIds: ["u1", "u3", "u5", "u6", "u10"],
        commentCount: 38,
        shareCount: 45,
        isPinned: true,
        createdAt: now - 5 * day,
        category: "travel"
      },
      n30: {
        id: "n30",
        authorId: "u9",
        type: "image",
        title: "平价防晒测评｜5款百元内防晒实测",
        content: "夏天来了，防晒必不可少！测评了5款100元以内的防晒霜\n\n综合排名：\n🥇 碧柔水感防晒 - 清爽不油腻\n🥈 珂润润浸保湿防晒 - 敏感肌首选\n🥉 薇诺娜清透防晒乳 - 国货之光\n\n测评维度：\n防晒力、肤感、持久度、成膜速度、是否泛白\n\n每款都实际使用了2周以上\n\n#防晒推荐 #美妆测评 #平价好物 #护肤",
        images: ["https://picsum.photos/seed/n30a/600/800", "https://picsum.photos/seed/n30b/600/800"],
        videoUrl: null,
        hashtags: ["防晒推荐", "美妆测评", "平价好物", "护肤"],
        location: "广州",
        likedByIds: ["u1", "u2", "u4", "u5", "u7", "u10", "u11"],
        bookmarkedByIds: ["u1", "u2", "u4", "u10"],
        commentCount: 29,
        shareCount: 24,
        isPinned: false,
        createdAt: now - 7 * day,
        category: "beauty"
      },
      n31: {
        id: "n31",
        authorId: "u10",
        type: "image",
        title: "新手养猫必看｜第一个月踩过的坑",
        content: "养猫一年了，总结一下新手阶段踩过的坑！\n\n❌ 坑1: 猫粮不能随便换（要7天过渡期）\n❌ 坑2: 猫砂盆放在角落（通风很重要）\n❌ 坑3: 给猫洗澡太频繁（3-6个月一次就够）\n❌ 坑4: 没有定期驱虫\n❌ 坑5: 买了太多花里胡哨的猫窝（猫只爱纸箱）\n\n新手养猫清单在评论区！\n\n#养猫 #新手养猫 #猫咪 #萌宠科普",
        images: ["https://picsum.photos/seed/n31a/600/800", "https://picsum.photos/seed/n31b/600/800"],
        videoUrl: null,
        hashtags: ["养猫", "新手养猫", "猫咪", "萌宠科普"],
        location: "南京",
        likedByIds: ["u1", "u3", "u4", "u6", "u9", "u11", "u12"],
        bookmarkedByIds: ["u1", "u4", "u6", "u9"],
        commentCount: 31,
        shareCount: 27,
        isPinned: false,
        createdAt: now - 10 * day,
        category: "pets"
      },
      n32: {
        id: "n32",
        authorId: "u12",
        type: "image",
        title: "露营装备推荐｜新手入门不踩雷",
        content: "露营3年了，分享我的装备推荐清单！\n\n必备装备：\n⛺ 帐篷：牧高笛冷山2 Air（入门首选，性价比高）\n🛏 睡袋：黑冰G400（三季通用）\n💡 灯具：Goal Zero营地灯\n🪑 椅子：Moon Lence折叠椅\n🔥 炉具：火枫116T一体炉\n\n预算参考：\n入门级全套约2000-3000元\n进阶级约5000-8000元\n\n#露营 #装备推荐 #户外 #野营",
        images: ["https://picsum.photos/seed/n32a/800/600", "https://picsum.photos/seed/n32b/800/600", "https://picsum.photos/seed/n32c/600/800"],
        videoUrl: null,
        hashtags: ["露营", "装备推荐", "户外", "野营"],
        location: "昆明",
        likedByIds: ["u1", "u2", "u3", "u5", "u7", "u8", "u10"],
        bookmarkedByIds: ["u1", "u3", "u5", "u8"],
        commentCount: 24,
        shareCount: 30,
        isPinned: false,
        createdAt: now - 11 * day,
        category: "travel"
      }
    },
    comments: {
      c1: {
        id: "c1",
        noteId: "n1",
        authorId: "u2",
        content: "这家太美了！求详细地址，下次去上海一定要去！",
        likedByIds: ["u1", "u3"],
        parentCommentId: null,
        createdAt: now - 2 * day - 3600000
      },
      c2: {
        id: "c2",
        noteId: "n1",
        authorId: "u1",
        content: "在静安区愚园路弄堂里，进去之后往左走就能看到招牌，叫做「时光咖啡」~",
        likedByIds: ["u2", "u4"],
        parentCommentId: "c1",
        createdAt: now - 2 * day - 1800000
      },
      c3: {
        id: "c3",
        noteId: "n1",
        authorId: "u4",
        content: "环境好好，收藏了！下次去上海必打卡",
        likedByIds: ["u1"],
        parentCommentId: null,
        createdAt: now - 2 * day
      },
      c4: {
        id: "c4",
        noteId: "n5",
        authorId: "u1",
        content: "看起来真的很好吃！老北京烤鸭没有去过，这家叫什么名字？",
        likedByIds: ["u2"],
        parentCommentId: null,
        createdAt: now - 1 * day - 7200000
      },
      c5: {
        id: "c5",
        noteId: "n5",
        authorId: "u2",
        content: "叫大碗居！在东直门附近，记得提前订位哦",
        likedByIds: ["u1", "u3", "u6"],
        parentCommentId: "c4",
        createdAt: now - 1 * day - 3600000
      },
      c6: {
        id: "c6",
        noteId: "n5",
        authorId: "u6",
        content: "太棒了，北京老字号就是不一样！",
        likedByIds: [],
        parentCommentId: null,
        createdAt: now - 1 * day
      },
      c7: {
        id: "c7",
        noteId: "n7",
        authorId: "u1",
        content: "天啊！这照片太美了！极光真的是绿色的吗？肉眼看也这么颜色吗？",
        likedByIds: ["u3", "u5"],
        parentCommentId: null,
        createdAt: now - 3 * day - 7200000
      },
      c8: {
        id: "c8",
        noteId: "n7",
        authorId: "u3",
        content: "肉眼看颜色没有相机拍的那么鲜艳，但确实是绿色的！就像云雾一样在天上飘，很震撼！",
        likedByIds: ["u1", "u2", "u4"],
        parentCommentId: "c7",
        createdAt: now - 3 * day - 3600000
      },
      c9: {
        id: "c9",
        noteId: "n7",
        authorId: "u4",
        content: "放在愿望清单里了！一定要去一次！",
        likedByIds: ["u1"],
        parentCommentId: null,
        createdAt: now - 2 * day - 5400000
      },
      c10: {
        id: "c10",
        noteId: "n7",
        authorId: "u8",
        content: "这张照片构图太好了，请问用什么相机拍的？",
        likedByIds: ["u3"],
        parentCommentId: null,
        createdAt: now - 2 * day
      },
      c11: {
        id: "c11",
        noteId: "n7",
        authorId: "u3",
        content: "Sony A7 IV + 16mm f/2.8广角镜头，长曝光10秒左右",
        likedByIds: ["u8", "u4"],
        parentCommentId: "c10",
        createdAt: now - 1 * day - 5400000
      },
      c12: {
        id: "c12",
        noteId: "n11",
        authorId: "u2",
        content: "太厉害了！我也想减脂，但总是坚持不下来，有什么建议吗？",
        likedByIds: ["u5", "u1"],
        parentCommentId: null,
        createdAt: now - 4 * day
      },
      c13: {
        id: "c13",
        noteId: "n11",
        authorId: "u5",
        content: "找到自己喜欢的运动方式最重要！不要一开始就给自己太大压力，循序渐进~",
        likedByIds: ["u2", "u1", "u4", "u6"],
        parentCommentId: "c12",
        createdAt: now - 3 * day - 7200000
      },
      c14: {
        id: "c14",
        noteId: "n11",
        authorId: "u4",
        content: "已经跟着博主开始记录饮食了！加油！",
        likedByIds: ["u5"],
        parentCommentId: null,
        createdAt: now - 3 * day
      },
      c15: {
        id: "c15",
        noteId: "n15",
        authorId: "u1",
        content: "Mia的风格真的太好看了！定制柜子大概花了多少钱？",
        likedByIds: ["u7"],
        parentCommentId: null,
        createdAt: now - 13 * day
      },
      c16: {
        id: "c16",
        noteId: "n15",
        authorId: "u7",
        content: "定制柜大约花了2万，是整体预算里最贵的部分，但非常值得！",
        likedByIds: ["u1", "u3", "u5"],
        parentCommentId: "c15",
        createdAt: now - 12 * day - 7200000
      },
      c17: {
        id: "c17",
        noteId: "n15",
        authorId: "u6",
        content: "北欧风好美！白色+原木色真的百看不厌",
        likedByIds: ["u7", "u4"],
        parentCommentId: null,
        createdAt: now - 12 * day
      },
      c18: {
        id: "c18",
        noteId: "n17",
        authorId: "u1",
        content: "感谢测评！我在纠结要不要从12升级到16 Pro，看完这个帖子感觉不那么急了",
        likedByIds: ["u8"],
        parentCommentId: null,
        createdAt: now - 6 * day
      },
      c19: {
        id: "c19",
        noteId: "n17",
        authorId: "u8",
        content: "12到16的跨度很大！升级会很有感！",
        likedByIds: ["u1", "u4"],
        parentCommentId: "c18",
        createdAt: now - 5 * day - 7200000
      },
      c20: {
        id: "c20",
        noteId: "n3",
        authorId: "u7",
        content: "30平也能这么温馨！改造后的效果真的太棒了，学到了很多！",
        likedByIds: ["u1"],
        parentCommentId: null,
        createdAt: now - 12 * day
      },
      c21: {
        id: "c21",
        noteId: "n3",
        authorId: "u1",
        content: "谢谢！最重要是要有耐心，慢慢找到自己喜欢的风格~",
        likedByIds: ["u7", "u6"],
        parentCommentId: "c20",
        createdAt: now - 11 * day - 7200000
      },
      c22: {
        id: "c22",
        noteId: "n4",
        authorId: "u3",
        content: "大理真的太美了！你去的时候是几月份？",
        likedByIds: ["u1"],
        parentCommentId: null,
        createdAt: now - 19 * day
      },
      c23: {
        id: "c23",
        noteId: "n4",
        authorId: "u1",
        content: "三月底去的！那时候正好是洱海最蓝的时候，推荐！",
        likedByIds: ["u3", "u5"],
        parentCommentId: "c22",
        createdAt: now - 18 * day - 7200000
      },
      c24: {
        id: "c24",
        noteId: "n20",
        authorId: "u2",
        content: "西藏一直是我的梦想目的地！高反严重吗？",
        likedByIds: ["u3"],
        parentCommentId: null,
        createdAt: now - 14 * day
      },
      c25: {
        id: "c25",
        noteId: "n20",
        authorId: "u3",
        content: "第一天会有头痛头晕，适应一天就好很多了！不要做剧烈运动就没事的",
        likedByIds: ["u2", "u1", "u4"],
        parentCommentId: "c24",
        createdAt: now - 13 * day - 7200000
      },
      c26: {
        id: "c26",
        noteId: "n9",
        authorId: "u1",
        content: "同是小个子！这些技巧真的有用！高腰线真的太重要了！",
        likedByIds: ["u4"],
        parentCommentId: null,
        createdAt: now - 2 * day - 3600000
      },
      c27: {
        id: "c27",
        noteId: "n12",
        authorId: "u1",
        content: "这套动作我试了！真的很累但是效果很好！",
        likedByIds: ["u5"],
        parentCommentId: null,
        createdAt: now - 10 * day
      },
      c28: {
        id: "c28",
        noteId: "n12",
        authorId: "u5",
        content: "坚持就是胜利！💪 第一次做肌肉会酸是正常的，恢复后再做！",
        likedByIds: ["u1", "u3"],
        parentCommentId: "c27",
        createdAt: now - 9 * day - 7200000
      },
      c29: {
        id: "c29",
        noteId: "n22",
        authorId: "u3",
        content: "懒人眼镜支架是真的好用！我也买了，躺着看书太幸福了",
        likedByIds: ["u4", "u1"],
        parentCommentId: null,
        createdAt: now - 5 * day
      },
      c30: {
        id: "c30",
        noteId: "n22",
        authorId: "u6",
        content: "我的磁吸充电线用了一年半了，真的很耐用！",
        likedByIds: ["u4"],
        parentCommentId: null,
        createdAt: now - 4 * day - 7200000
      },
      c31: {
        id: "c31",
        noteId: "n6",
        authorId: "u1",
        content: "我也想自己做拉面！焯水这步是关键吧？",
        likedByIds: ["u2"],
        parentCommentId: null,
        createdAt: now - 4 * day
      },
      c32: {
        id: "c32",
        noteId: "n6",
        authorId: "u2",
        content: "对！焯水把血水去掉，汤底才会清澈不腥！",
        likedByIds: ["u1", "u3"],
        parentCommentId: "c31",
        createdAt: now - 3 * day - 7200000
      },
      c33: {
        id: "c33",
        noteId: "n24",
        authorId: "u1",
        content: "《被讨厌的勇气》我也读过，真的很有启发！你觉得哪本改变了你的想法？",
        likedByIds: ["u6"],
        parentCommentId: null,
        createdAt: now - 16 * day
      },
      c34: {
        id: "c34",
        noteId: "n24",
        authorId: "u6",
        content: "《原子习惯》！帮我养成了阅读习惯，才能坚持读完52本！",
        likedByIds: ["u1", "u2", "u4"],
        parentCommentId: "c33",
        createdAt: now - 15 * day - 7200000
      },
      c35: {
        id: "c35",
        noteId: "n13",
        authorId: "u4",
        content: "下次去成都要打卡！感觉比网红书店有灵魂多了",
        likedByIds: ["u6"],
        parentCommentId: null,
        createdAt: now - 5 * day
      },
      c36: {
        id: "c36",
        noteId: "n25",
        authorId: "u5",
        content: "好厉害！看起来很专业！蛋白打发是最难的一步，你是手打还是机打？",
        likedByIds: ["u2"],
        parentCommentId: null,
        createdAt: now - 8 * day
      },
      c37: {
        id: "c37",
        noteId: "n25",
        authorId: "u2",
        content: "电动打蛋器！手打太累了😂 打了大概8分钟才到位",
        likedByIds: ["u5", "u1"],
        parentCommentId: "c36",
        createdAt: now - 7 * day - 7200000
      },
      c38: {
        id: "c38",
        noteId: "n26",
        authorId: "u1",
        content: "终于找到适合敏感肌的攻略了！神经酰胺精华有推荐的品牌吗？",
        likedByIds: ["u9"],
        parentCommentId: null,
        createdAt: now - 1 * day - 7200000
      },
      c39: {
        id: "c39",
        noteId: "n26",
        authorId: "u9",
        content: "推荐珂润和至本！珂润更温和，至本性价比更高",
        likedByIds: ["u1", "u4", "u10"],
        parentCommentId: "c38",
        createdAt: now - 1 * day - 3600000
      },
      c40: {
        id: "c40",
        noteId: "n26",
        authorId: "u4",
        content: "同敏感肌！换季泛红太痛苦了，收藏了",
        likedByIds: ["u9", "u1"],
        parentCommentId: null,
        createdAt: now - 1 * day
      },
      c41: {
        id: "c41",
        noteId: "n27",
        authorId: "u1",
        content: "哈哈哈大橘果然是十橘九胖！太可爱了！",
        likedByIds: ["u10", "u6"],
        parentCommentId: null,
        createdAt: now - 12 * 3600000
      },
      c42: {
        id: "c42",
        noteId: "n27",
        authorId: "u6",
        content: "圆滚滚的好可爱！减肥后记得分享对比图！",
        likedByIds: ["u10"],
        parentCommentId: null,
        createdAt: now - 8 * 3600000
      },
      c43: {
        id: "c43",
        noteId: "n27",
        authorId: "u10",
        content: "一定的！不过看他每天躺着的样子就觉得减肥之路漫漫😂",
        likedByIds: ["u1", "u6", "u9"],
        parentCommentId: "c42",
        createdAt: now - 6 * 3600000
      },
      c44: {
        id: "c44",
        noteId: "n28",
        authorId: "u1",
        content: "太厉害了学姐！专业课是怎么复习的？有没有推荐的资料？",
        likedByIds: ["u11"],
        parentCommentId: null,
        createdAt: now - 2 * day - 7200000
      },
      c45: {
        id: "c45",
        noteId: "n28",
        authorId: "u11",
        content: "专业课主要是真题+笔记！真题至少刷3遍，把出题规律总结出来",
        likedByIds: ["u1", "u4", "u8"],
        parentCommentId: "c44",
        createdAt: now - 2 * day - 3600000
      },
      c46: {
        id: "c46",
        noteId: "n28",
        authorId: "u6",
        content: "备考期间心态管理真的好重要！学姐有什么放松的方法吗？",
        likedByIds: ["u11"],
        parentCommentId: null,
        createdAt: now - 2 * day
      },
      c47: {
        id: "c47",
        noteId: "n29",
        authorId: "u3",
        content: "武功山云海太绝了！上次去没赶上，下次一定要看到！",
        likedByIds: ["u12", "u1"],
        parentCommentId: null,
        createdAt: now - 4 * day
      },
      c48: {
        id: "c48",
        noteId: "n29",
        authorId: "u12",
        content: "建议选择雨后第二天上山，云海概率最高！",
        likedByIds: ["u3", "u1", "u5"],
        parentCommentId: "c47",
        createdAt: now - 3 * day - 7200000
      },
      c49: {
        id: "c49",
        noteId: "n29",
        authorId: "u5",
        content: "这个行程安排很合理！请问金顶扎营冷吗？需要什么温标的睡袋？",
        likedByIds: ["u12"],
        parentCommentId: null,
        createdAt: now - 3 * day
      },
      c50: {
        id: "c50",
        noteId: "n30",
        authorId: "u4",
        content: "碧柔那款我也在用！确实清爽，但是防水性一般",
        likedByIds: ["u9", "u1"],
        parentCommentId: null,
        createdAt: now - 6 * day
      },
      c51: {
        id: "c51",
        noteId: "n31",
        authorId: "u9",
        content: "猫只爱纸箱这条太真实了😂 买了200块的猫窝他看都不看",
        likedByIds: ["u10", "u1", "u6"],
        parentCommentId: null,
        createdAt: now - 9 * day
      },
      c52: {
        id: "c52",
        noteId: "n32",
        authorId: "u3",
        content: "牧高笛冷山2确实入门很棒！我第一个帐篷也是这款",
        likedByIds: ["u12", "u5"],
        parentCommentId: null,
        createdAt: now - 10 * day
      }
    },
    notifications: {
      notif1: {
        id: "notif1",
        recipientId: "u1",
        actorId: "u3",
        type: "like",
        noteId: "n1",
        commentId: null,
        isRead: false,
        createdAt: now - 2 * 3600000
      },
      notif2: {
        id: "notif2",
        recipientId: "u1",
        actorId: "u5",
        type: "like",
        noteId: "n2",
        commentId: null,
        isRead: false,
        createdAt: now - 4 * 3600000
      },
      notif3: {
        id: "notif3",
        recipientId: "u1",
        actorId: "u7",
        type: "bookmark",
        noteId: "n3",
        commentId: null,
        isRead: false,
        createdAt: now - 6 * 3600000
      },
      notif4: {
        id: "notif4",
        recipientId: "u1",
        actorId: "u2",
        type: "comment",
        noteId: "n1",
        commentId: "c1",
        isRead: false,
        createdAt: now - 8 * 3600000
      },
      notif5: {
        id: "notif5",
        recipientId: "u1",
        actorId: "u8",
        type: "follow",
        noteId: null,
        commentId: null,
        isRead: false,
        createdAt: now - 10 * 3600000
      },
      notif6: {
        id: "notif6",
        recipientId: "u1",
        actorId: "u4",
        type: "like",
        noteId: "n4",
        commentId: null,
        isRead: false,
        createdAt: now - 12 * 3600000
      },
      notif7: {
        id: "notif7",
        recipientId: "u1",
        actorId: "u6",
        type: "comment",
        noteId: "n3",
        commentId: "c20",
        isRead: true,
        createdAt: now - 1 * day - 2 * 3600000
      },
      notif8: {
        id: "notif8",
        recipientId: "u1",
        actorId: "u3",
        type: "bookmark",
        noteId: "n4",
        commentId: null,
        isRead: true,
        createdAt: now - 1 * day - 4 * 3600000
      },
      notif9: {
        id: "notif9",
        recipientId: "u1",
        actorId: "u5",
        type: "follow",
        noteId: null,
        commentId: null,
        isRead: true,
        createdAt: now - 2 * day - 2 * 3600000
      },
      notif10: {
        id: "notif10",
        recipientId: "u1",
        actorId: "u7",
        type: "like",
        noteId: "n2",
        commentId: null,
        isRead: true,
        createdAt: now - 2 * day - 5 * 3600000
      },
      notif11: {
        id: "notif11",
        recipientId: "u1",
        actorId: "u2",
        type: "like",
        noteId: "n3",
        commentId: null,
        isRead: true,
        createdAt: now - 3 * day - 1 * 3600000
      },
      notif12: {
        id: "notif12",
        recipientId: "u1",
        actorId: "u4",
        type: "comment",
        noteId: "n4",
        commentId: "c22",
        isRead: true,
        createdAt: now - 3 * day - 6 * 3600000
      },
      notif13: {
        id: "notif13",
        recipientId: "u1",
        actorId: "u6",
        type: "follow",
        noteId: null,
        commentId: null,
        isRead: true,
        createdAt: now - 4 * day - 3 * 3600000
      },
      notif14: {
        id: "notif14",
        recipientId: "u1",
        actorId: "u8",
        type: "like",
        noteId: "n1",
        commentId: null,
        isRead: true,
        createdAt: now - 5 * day - 2 * 3600000
      },
      notif15: {
        id: "notif15",
        recipientId: "u1",
        actorId: "u3",
        type: "comment",
        noteId: "n4",
        commentId: "c22",
        isRead: true,
        createdAt: now - 6 * day - 1 * 3600000
      },
      notif16: {
        id: "notif16",
        recipientId: "u1",
        actorId: "u5",
        type: "bookmark",
        noteId: "n4",
        commentId: null,
        isRead: true,
        createdAt: now - 7 * day - 3 * 3600000
      },
      notif17: {
        id: "notif17",
        recipientId: "u1",
        actorId: "u7",
        type: "follow",
        noteId: null,
        commentId: null,
        isRead: true,
        createdAt: now - 8 * day - 2 * 3600000
      },
      notif18: {
        id: "notif18",
        recipientId: "u1",
        actorId: "u2",
        type: "reply",
        noteId: "n1",
        commentId: "c2",
        isRead: true,
        createdAt: now - 9 * day - 1 * 3600000
      }
    },
    conversations: {
      conv1: {
        id: "conv1",
        participantIds: ["u1", "u2"],
        lastMessagePreview: "明天有空一起去那家咖啡馆吗？",
        lastMessageAt: now - 3 * 3600000,
        unreadCount: 2
      },
      conv2: {
        id: "conv2",
        participantIds: ["u1", "u3"],
        lastMessagePreview: "太厉害了！你拍极光用的什么设置？",
        lastMessageAt: now - 1 * day - 2 * 3600000,
        unreadCount: 0
      },
      conv3: {
        id: "conv3",
        participantIds: ["u1", "u5"],
        lastMessagePreview: "好的，加油！我相信你能坚持下去！",
        lastMessageAt: now - 2 * day - 5 * 3600000,
        unreadCount: 0
      }
    },
    messages: {
      msg1: {
        id: "msg1",
        conversationId: "conv1",
        senderId: "u2",
        content: "你好！看到你发的那篇咖啡馆笔记了，写得好好！",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 2 * day - 6 * 3600000
      },
      msg2: {
        id: "msg2",
        conversationId: "conv1",
        senderId: "u1",
        content: "谢谢你！那家咖啡馆真的很有氛围，有机会可以去坐坐~",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 2 * day - 5 * 3600000
      },
      msg3: {
        id: "msg3",
        conversationId: "conv1",
        senderId: "u2",
        content: "地址在哪里？我下次去上海想打卡！",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 1 * day - 8 * 3600000
      },
      msg4: {
        id: "msg4",
        conversationId: "conv1",
        senderId: "u1",
        content: "在静安区愚园路的巷子里！周末人会多一点，建议工作日去",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 1 * day - 7 * 3600000
      },
      msg5: {
        id: "msg5",
        conversationId: "conv1",
        senderId: "u2",
        content: "好的！明天有空一起去那家咖啡馆吗？",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 3 * 3600000
      },
      msg6: {
        id: "msg6",
        conversationId: "conv1",
        senderId: "u2",
        content: "我到上海出差了~",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 2 * 3600000
      },
      msg7: {
        id: "msg7",
        conversationId: "conv2",
        senderId: "u1",
        content: "你好Leo！你的极光照片真的太美了！",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 3 * day - 4 * 3600000
      },
      msg8: {
        id: "msg8",
        conversationId: "conv2",
        senderId: "u3",
        content: "谢谢！那次旅行真的很难忘，看极光是人生中最震撼的体验之一",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 3 * day - 3 * 3600000
      },
      msg9: {
        id: "msg9",
        conversationId: "conv2",
        senderId: "u1",
        content: "太厉害了！你拍极光用的什么设置？",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 1 * day - 2 * 3600000
      },
      msg10: {
        id: "msg10",
        conversationId: "conv2",
        senderId: "u3",
        content: "主要是长曝光！ISO 3200，快门5-15秒，光圈f/2.8。最重要是要有三脚架！",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 1 * day - 1 * 3600000
      },
      msg11: {
        id: "msg11",
        conversationId: "conv3",
        senderId: "u5",
        content: "看到你发的笔记说要开始健身，加油！有问题随时问我",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 5 * day - 3 * 3600000
      },
      msg12: {
        id: "msg12",
        conversationId: "conv3",
        senderId: "u1",
        content: "谢谢Amy！我刚开始很多动作不标准，有机会能指导一下吗？",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 5 * day - 2 * 3600000
      },
      msg13: {
        id: "msg13",
        conversationId: "conv3",
        senderId: "u5",
        content: "当然可以！深蹲和平板支撑的姿势最重要，要避免受伤",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 4 * day - 5 * 3600000
      },
      msg14: {
        id: "msg14",
        conversationId: "conv3",
        senderId: "u1",
        content: "明白了！我今天练完感觉大腿好酸，是不是正常的？",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 3 * day - 4 * 3600000
      },
      msg15: {
        id: "msg15",
        conversationId: "conv3",
        senderId: "u5",
        content: "好的，加油！我相信你能坚持下去！酸痛是正常的，休息一天就好了~",
        type: "text",
        imageUrl: null,
        sharedNoteId: null,
        createdAt: now - 2 * day - 5 * 3600000
      }
    },
    topics: {
      t1: {
        id: "t1",
        name: "咖啡探店",
        noteCount: 5200,
        viewCount: 1200000
      },
      t2: {
        id: "t2",
        name: "旅行攻略",
        noteCount: 38000,
        viewCount: 8500000
      },
      t3: {
        id: "t3",
        name: "穿搭分享",
        noteCount: 62000,
        viewCount: 15000000
      },
      t4: {
        id: "t4",
        name: "健身打卡",
        noteCount: 28500,
        viewCount: 6200000
      },
      t5: {
        id: "t5",
        name: "家居改造",
        noteCount: 18000,
        viewCount: 4500000
      },
      t6: {
        id: "t6",
        name: "美食探店",
        noteCount: 45000,
        viewCount: 10000000
      },
      t7: {
        id: "t7",
        name: "减脂",
        noteCount: 32000,
        viewCount: 7800000
      },
      t8: {
        id: "t8",
        name: "ootd",
        noteCount: 88000,
        viewCount: 22000000
      },
      t9: {
        id: "t9",
        name: "数码测评",
        noteCount: 12000,
        viewCount: 3500000
      },
      t10: {
        id: "t10",
        name: "北欧风装修",
        noteCount: 9500,
        viewCount: 2800000
      },
      t11: {
        id: "t11",
        name: "阅读",
        noteCount: 25000,
        viewCount: 5600000
      },
      t12: {
        id: "t12",
        name: "上海美食",
        noteCount: 42000,
        viewCount: 9800000
      },
      t13: {
        id: "t13",
        name: "敏感肌",
        noteCount: 31000,
        viewCount: 7200000
      },
      t14: {
        id: "t14",
        name: "萌宠",
        noteCount: 55000,
        viewCount: 12000000
      },
      t15: {
        id: "t15",
        name: "考研",
        noteCount: 48000,
        viewCount: 11000000
      },
      t16: {
        id: "t16",
        name: "露营",
        noteCount: 22000,
        viewCount: 5800000
      }
    }
  };
}

const STORAGE_KEY = 'xiaohongshu_mock_state';
const INITIAL_KEY = 'xiaohongshu_mock_state_initial';

let _saveServerTimer = null;
function _scheduleSaveToServer(state) {
  clearTimeout(_saveServerTimer);
  _saveServerTimer = setTimeout(() => {
    const sid = new URLSearchParams(window.location.search).get('sid');
    if (sid) {
      fetch(`/post?sid=${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      }).catch(() => {});
    }
  }, 500);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    _scheduleSaveToServer(state);
  } catch (e) {}
}

export function loadInitialState() {
  try {
    const raw = localStorage.getItem(INITIAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function saveInitialState(state) {
  try {
    localStorage.setItem(INITIAL_KEY, JSON.stringify(state));
  } catch (e) {}
}

export function getStateDiff(initial, current) {
  const diff = {};
  for (const key in current) {
    if (JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
      diff[key] = { initial: initial[key], current: current[key] };
    }
  }
  return diff;
}

export function initializeState(serverState) {
  if (serverState) {
    saveState(serverState);
    if (!loadInitialState()) saveInitialState(serverState);
    return serverState;
  }
  let state = loadState();
  if (!state) {
    state = createInitialData();
    saveState(state);
    saveInitialState(state);
  }
  let initialState = loadInitialState();
  if (!initialState) {
    saveInitialState(state);
  }
  return state;
}
