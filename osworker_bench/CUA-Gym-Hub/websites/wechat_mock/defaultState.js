// Shared default state for both vite server (/go endpoint) and React app
// This file must be importable by both Node.js (vite.config.js) and browser (storage.js)

export function getDefaultState() {
  const now = new Date().toISOString();
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const twoHoursAgo = new Date(Date.now() - 7200000).toISOString();
  const threeHoursAgo = new Date(Date.now() - 10800000).toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const yesterdayMorning = new Date(Date.now() - 100800000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 259200000).toISOString();

  return {
    user: {
      userId: 'user_1',
      nickname: '张三',
      avatar: 'https://picsum.photos/100/100?random=1',
      wechatId: 'zhangsan_2024',
      signature: '每天进步一点点',
      region: '北京 海淀',
      gender: '男',
      coverImage: 'https://picsum.photos/800/300?random=cover',
      phone: '138****1234'
    },

    contacts: [
      { userId: 'user_2', nickname: '李四', avatar: 'https://picsum.photos/100/100?random=2', wechatId: 'lisi_wx', phone: '139****5678', signature: '简单生活', region: '上海 浦东', gender: '男', tag: '朋友', isStar: false },
      { userId: 'user_3', nickname: '王五', avatar: 'https://picsum.photos/100/100?random=3', wechatId: 'wangwu_88', phone: '136****9012', signature: '热爱运动', region: '广州 天河', gender: '男', tag: '同事', isStar: false },
      { userId: 'user_4', nickname: '赵六', avatar: 'https://picsum.photos/100/100?random=4', wechatId: 'zhaoliu_66', phone: '137****3456', signature: '认真工作，快乐生活', region: '深圳 南山', gender: '女', tag: '同事', isStar: false },
      { userId: 'user_5', nickname: '小明', avatar: 'https://picsum.photos/100/100?random=5', wechatId: 'xiaoming_99', phone: '135****7890', signature: '代码改变世界', region: '杭州 西湖', gender: '男', tag: '朋友', isStar: true },
      { userId: 'user_6', nickname: '小红', avatar: 'https://picsum.photos/100/100?random=6', wechatId: 'xiaohong_love', phone: '158****2345', signature: '生活不止眼前', region: '成都 锦江', gender: '女', tag: '朋友', isStar: false },
      { userId: 'user_7', nickname: '老板', avatar: 'https://picsum.photos/100/100?random=7', wechatId: 'boss_wang', phone: '186****6789', signature: '专注工作', region: '北京 朝阳', gender: '男', tag: '同事', isStar: false },
      { userId: 'user_8', nickname: '小美', avatar: 'https://picsum.photos/100/100?random=8', wechatId: 'xiaomei_art', phone: '159****0123', signature: '艺术是生活', region: '南京 鼓楼', gender: '女', tag: '家人', isStar: false }
    ],

    conversations: [
      { contactId: 'user_2', lastMessage: '好的，明天见！', lastTime: oneHourAgo, unreadCount: 2, isGroup: false, isPinned: true, isMuted: false, draft: '' },
      { contactId: 'group_1', lastMessage: '王五: 收到了', lastTime: twoHoursAgo, unreadCount: 5, isGroup: true, isPinned: false, isMuted: false, draft: '' },
      { contactId: 'user_3', lastMessage: '[图片]', lastTime: yesterday, unreadCount: 0, isGroup: false, isPinned: false, isMuted: false, draft: '' },
      { contactId: 'user_4', lastMessage: '项目文件已发给你了', lastTime: twoDaysAgo, unreadCount: 1, isGroup: false, isPinned: false, isMuted: false, draft: '' },
      { contactId: 'user_7', lastMessage: '下周一开会', lastTime: threeDaysAgo, unreadCount: 0, isGroup: false, isPinned: false, isMuted: true, draft: '' }
    ],

    messages: {
      'user_2': [
        { messageId: 'msg_001', senderId: 'user_2', content: '在吗？', type: 'text', timestamp: threeHoursAgo, isSelf: false },
        { messageId: 'msg_002', senderId: 'user_1', content: '在的，怎么了？', type: 'text', timestamp: new Date(Date.now() - 10200000).toISOString(), isSelf: true },
        { messageId: 'msg_003', senderId: 'user_2', content: '明天下午有空吗？一起去打球', type: 'text', timestamp: new Date(Date.now() - 9600000).toISOString(), isSelf: false },
        { messageId: 'msg_004', senderId: 'user_1', content: '可以啊，几点？', type: 'text', timestamp: new Date(Date.now() - 9000000).toISOString(), isSelf: true },
        { messageId: 'msg_005', senderId: 'user_2', content: '下午3点，老地方', type: 'text', timestamp: new Date(Date.now() - 7200000).toISOString(), isSelf: false },
        { messageId: 'msg_006', senderId: 'user_2', content: '', type: 'hongbao', timestamp: new Date(Date.now() - 5400000).toISOString(), isSelf: false, amount: 66.66, greeting: '恭喜发财，大吉大利', opened: false },
        { messageId: 'msg_007', senderId: 'user_1', content: '好的，明天见！', type: 'text', timestamp: oneHourAgo, isSelf: true }
      ],
      'user_3': [
        { messageId: 'msg_010', senderId: 'user_3', content: '看看这个风景', type: 'text', timestamp: yesterdayMorning, isSelf: false },
        { messageId: 'msg_011', senderId: 'user_3', content: 'https://picsum.photos/400/300?random=photo1', type: 'image', timestamp: yesterday, isSelf: false },
        { messageId: 'msg_012', senderId: 'user_1', content: '好美啊！这是哪里？', type: 'text', timestamp: new Date(Date.now() - 82800000).toISOString(), isSelf: true },
        { messageId: 'msg_013', senderId: 'user_3', content: '', type: 'voice', timestamp: new Date(Date.now() - 79200000).toISOString(), isSelf: false, duration: 5 },
        { messageId: 'msg_014', senderId: 'user_3', content: '白云山，周末去的', type: 'text', timestamp: new Date(Date.now() - 75600000).toISOString(), isSelf: false }
      ],
      'user_4': [
        { messageId: 'msg_020', senderId: 'user_4', content: '项目文件已发给你了', type: 'text', timestamp: new Date(Date.now() - 180000000).toISOString(), isSelf: false },
        { messageId: 'msg_021', senderId: 'user_4', content: 'Q1报告.pdf', type: 'file', timestamp: new Date(Date.now() - 176400000).toISOString(), isSelf: false, fileName: 'Q1报告.pdf', fileSize: '3.2MB' },
        { messageId: 'msg_022', senderId: 'user_1', content: '收到，我看一下', type: 'text', timestamp: new Date(Date.now() - 172800000).toISOString(), isSelf: true },
        { messageId: 'msg_023', senderId: 'user_4', content: '好的，有问题随时问我', type: 'text', timestamp: twoDaysAgo, isSelf: false }
      ],
      'user_7': [
        { messageId: 'msg_030', senderId: 'user_7', content: '下周一开会，准备好汇报材料', type: 'text', timestamp: new Date(Date.now() - 270000000).toISOString(), isSelf: false },
        { messageId: 'msg_031', senderId: 'user_1', content: '好的，收到', type: 'text', timestamp: new Date(Date.now() - 266400000).toISOString(), isSelf: true },
        { messageId: 'msg_032', senderId: 'user_7', content: '下周一开会', type: 'text', timestamp: threeDaysAgo, isSelf: false },
        { messageId: 'msg_033', senderId: 'user_1', content: '明白，我会提前准备', type: 'text', timestamp: new Date(Date.now() - 255600000).toISOString(), isSelf: true }
      ],
      'group_1': [
        { messageId: 'msg_040', senderId: 'user_1', content: '大家好，项目进度更新一下', type: 'text', timestamp: new Date(Date.now() - 14400000).toISOString(), isSelf: true },
        { messageId: 'msg_041', senderId: 'user_3', content: '我这边已经完成了设计稿', type: 'text', timestamp: new Date(Date.now() - 12600000).toISOString(), isSelf: false },
        { messageId: 'msg_042', senderId: 'user_4', content: '开发进度80%，预计下周完成', type: 'text', timestamp: new Date(Date.now() - 10800000).toISOString(), isSelf: false },
        { messageId: 'msg_043', senderId: 'user_5', content: '测试用例已经写好了', type: 'text', timestamp: new Date(Date.now() - 9000000).toISOString(), isSelf: false },
        { messageId: 'msg_044', senderId: 'user_1', content: '很好，大家继续加油！', type: 'text', timestamp: new Date(Date.now() - 7800000).toISOString(), isSelf: true },
        { messageId: 'msg_045', senderId: 'user_3', content: '收到了', type: 'text', timestamp: twoHoursAgo, isSelf: false }
      ]
    },

    moments: [
      {
        postId: 'moment_1',
        userId: 'user_2',
        content: '周末去爬山了，风景太美了！',
        images: [
          'https://picsum.photos/400/300?random=m1',
          'https://picsum.photos/400/300?random=m2',
          'https://picsum.photos/400/300?random=m3'
        ],
        timestamp: yesterday,
        likes: ['user_1', 'user_3', 'user_5'],
        comments: [
          { commentId: 'c1', userId: 'user_3', content: '好美啊！在哪里？', timestamp: new Date(Date.now() - 82800000).toISOString() },
          { commentId: 'c2', userId: 'user_2', content: '香山！推荐你也去', timestamp: new Date(Date.now() - 79200000).toISOString(), replyTo: 'user_3' }
        ],
        location: '北京·香山公园'
      },
      {
        postId: 'moment_2',
        userId: 'user_6',
        content: '新做的甜点，大家觉得怎么样？',
        images: [
          'https://picsum.photos/400/400?random=m4'
        ],
        timestamp: twoDaysAgo,
        likes: ['user_1', 'user_2', 'user_4', 'user_8'],
        comments: [
          { commentId: 'c3', userId: 'user_8', content: '看起来好好吃！', timestamp: new Date(Date.now() - 169200000).toISOString() }
        ],
        location: ''
      },
      {
        postId: 'moment_3',
        userId: 'user_1',
        content: '读完了这本书，收获很多，推荐给大家！',
        images: [],
        timestamp: threeDaysAgo,
        likes: ['user_2', 'user_6'],
        comments: [
          { commentId: 'c4', userId: 'user_2', content: '什么书？分享一下', timestamp: new Date(Date.now() - 255600000).toISOString() },
          { commentId: 'c5', userId: 'user_1', content: '《原则》，Ray Dalio写的', timestamp: new Date(Date.now() - 252000000).toISOString(), replyTo: 'user_2' }
        ],
        location: ''
      },
      {
        postId: 'moment_4',
        userId: 'user_5',
        content: '代码终于跑通了！',
        images: [],
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        likes: ['user_1', 'user_3'],
        comments: [],
        location: '杭州·阿里巴巴西溪园区'
      },
      {
        postId: 'moment_5',
        userId: 'user_3',
        content: '阳光正好，适合跑步',
        images: [
          'https://picsum.photos/400/300?random=m5',
          'https://picsum.photos/400/300?random=m6'
        ],
        timestamp: new Date(Date.now() - 432000000).toISOString(),
        likes: ['user_1', 'user_5', 'user_6', 'user_2'],
        comments: [
          { commentId: 'c6', userId: 'user_5', content: '一起跑啊！', timestamp: new Date(Date.now() - 428400000).toISOString() },
          { commentId: 'c7', userId: 'user_3', content: '好啊，下周约', timestamp: new Date(Date.now() - 424800000).toISOString(), replyTo: 'user_5' }
        ],
        location: '广州·天河体育中心'
      }
    ],

    groups: [
      {
        groupId: 'group_1',
        name: '项目讨论组',
        avatar: 'https://picsum.photos/100/100?random=g1',
        members: ['user_1', 'user_3', 'user_4', 'user_5'],
        createdAt: '2025-01-15T09:00:00Z',
        createdBy: 'user_1',
        description: '用于讨论项目进度',
        announcement: '本周五下午3点开会，请大家准时参加'
      },
      {
        groupId: 'group_2',
        name: '老同学聚会',
        avatar: 'https://picsum.photos/100/100?random=g2',
        members: ['user_1', 'user_2', 'user_5', 'user_6'],
        createdAt: '2024-12-20T18:00:00Z',
        createdBy: 'user_2',
        description: '高中同学群',
        announcement: ''
      }
    ],

    favorites: [
      { favoriteId: 'fav_1', type: 'text', content: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', source: '李四', timestamp: new Date(Date.now() - 604800000).toISOString() },
      { favoriteId: 'fav_2', type: 'image', content: 'https://picsum.photos/400/300?random=fav1', source: '小红', timestamp: new Date(Date.now() - 518400000).toISOString() },
      { favoriteId: 'fav_3', type: 'link', content: 'https://example.com/article', source: '王五', timestamp: new Date(Date.now() - 432000000).toISOString(), title: '10个提高效率的方法', preview: '工作中如何更好地管理时间...' },
      { favoriteId: 'fav_4', type: 'file', content: '年度总结.pdf', source: '赵六', timestamp: new Date(Date.now() - 345600000).toISOString(), fileName: '年度总结.pdf', fileSize: '2.1MB' },
      { favoriteId: 'fav_5', type: 'text', content: '明天会议记得带笔记本和上季度报告', source: '老板', timestamp: new Date(Date.now() - 259200000).toISOString() }
    ]
  };
}
