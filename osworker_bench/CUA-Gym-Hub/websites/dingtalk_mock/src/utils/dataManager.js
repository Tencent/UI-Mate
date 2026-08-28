const BASE_KEY = 'dingtalk_mock_state'
const BASE_INITIAL_KEY = 'dingtalk_mock_initial'

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    const clean = sid.replace(/[^a-zA-Z0-9_-]/g, '')
    sessionStorage.setItem('dingtalk_sid', clean)
    return clean
  }
  return sessionStorage.getItem('dingtalk_sid') || null
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const fetchCustomState = async (sid) => {
  if (!sid) return null
  try {
    const res = await fetch(`/state?sid=${sid}`)
    if (!res.ok) return null
    const data = await res.json()
    return data?.current || null
  } catch {
    return null
  }
}

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) continue
    if (Array.isArray(source[key])) {
      result[key] = source[key]
    } else if (typeof source[key] === 'object' && typeof target[key] === 'object') {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

export function createInitialData() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const thisWeek = (offsetDays) => {
    const d = new Date(now)
    d.setDate(d.getDate() + offsetDays)
    return d.toISOString()
  }
  const timeAgo = (minutes) => {
    const d = new Date(now)
    d.setMinutes(d.getMinutes() - minutes)
    return d.toISOString()
  }
  const dayAgo = (days) => {
    const d = new Date(now)
    d.setDate(d.getDate() - days)
    return d.toISOString()
  }

  // 16 employees across 3 main departments: 技术部, 产品部, 市场部
  const users = [
    { id: 'user_001', name: '张伟', avatar: '#1890FF', title: '高级前端工程师', department: '技术部', departmentId: 'dept_tech', phone: '138****1234', email: 'zhangwei@dingtalk.com', status: 'online', isCurrentUser: true },
    { id: 'user_002', name: '李娜', avatar: '#FA8C16', title: '产品经理', department: '产品部', departmentId: 'dept_product', phone: '139****5678', email: 'lina@dingtalk.com', status: 'online', isCurrentUser: false },
    { id: 'user_003', name: '王磊', avatar: '#52C41A', title: '后端工程师', department: '技术部', departmentId: 'dept_tech', phone: '137****9012', email: 'wanglei@dingtalk.com', status: 'busy', isCurrentUser: false },
    { id: 'user_004', name: '陈静', avatar: '#722ED1', title: 'UI设计师', department: '产品部', departmentId: 'dept_product', phone: '136****3456', email: 'chenjing@dingtalk.com', status: 'online', isCurrentUser: false },
    { id: 'user_005', name: '赵强', avatar: '#F5222D', title: '技术总监', department: '技术部', departmentId: 'dept_tech', phone: '135****7890', email: 'zhaoqiang@dingtalk.com', status: 'online', isCurrentUser: false },
    { id: 'user_006', name: '刘洋', avatar: '#13C2C2', title: 'HR经理', department: '钉钉科技有限公司', departmentId: 'dept_root', phone: '134****2345', email: 'liuyang@dingtalk.com', status: 'away', isCurrentUser: false },
    { id: 'user_007', name: '周敏', avatar: '#EB2F96', title: '财务主管', department: '钉钉科技有限公司', departmentId: 'dept_root', phone: '133****6789', email: 'zhoumin@dingtalk.com', status: 'offline', isCurrentUser: false },
    { id: 'user_008', name: '吴昊', avatar: '#FA541C', title: '市场经理', department: '市场部', departmentId: 'dept_marketing', phone: '132****0123', email: 'wuhao@dingtalk.com', status: 'online', isCurrentUser: false },
    { id: 'user_009', name: '孙丽', avatar: '#2F54EB', title: 'QA工程师', department: '技术部', departmentId: 'dept_tech', phone: '131****4567', email: 'sunli@dingtalk.com', status: 'online', isCurrentUser: false },
    { id: 'user_010', name: '黄伟', avatar: '#EB2F96', title: '产品设计师', department: '产品部', departmentId: 'dept_product', phone: '130****8901', email: 'huangwei@dingtalk.com', status: 'online', isCurrentUser: false },
    { id: 'user_011', name: '杨芳', avatar: '#597EF7', title: '前端工程师', department: '技术部', departmentId: 'dept_tech', phone: '189****2345', email: 'yangfang@dingtalk.com', status: 'online', isCurrentUser: false },
    { id: 'user_012', name: '马超', avatar: '#8C8C8C', title: '总经理', department: '钉钉科技有限公司', departmentId: 'dept_root', phone: '188****6789', email: 'machao@dingtalk.com', status: 'busy', isCurrentUser: false },
    { id: 'user_013', name: '林小燕', avatar: '#36CFC9', title: '市场专员', department: '市场部', departmentId: 'dept_marketing', phone: '187****3456', email: 'linxiaoyan@dingtalk.com', status: 'online', isCurrentUser: false },
    { id: 'user_014', name: '郑凯', avatar: '#9254DE', title: '运维工程师', department: '技术部', departmentId: 'dept_tech', phone: '186****7890', email: 'zhengkai@dingtalk.com', status: 'online', isCurrentUser: false },
    { id: 'user_015', name: '徐婷', avatar: '#FF7A45', title: '产品运营', department: '产品部', departmentId: 'dept_product', phone: '185****1234', email: 'xuting@dingtalk.com', status: 'away', isCurrentUser: false },
    { id: 'user_016', name: '何明', avatar: '#73D13D', title: '市场总监', department: '市场部', departmentId: 'dept_marketing', phone: '184****5678', email: 'heming@dingtalk.com', status: 'online', isCurrentUser: false },
  ]

  // 3 main departments
  const departments = [
    { id: 'dept_root', name: '钉钉科技有限公司', parentId: null, memberCount: 16, order: 0, expanded: true },
    { id: 'dept_tech', name: '技术部', parentId: 'dept_root', memberCount: 6, order: 1, expanded: false },
    { id: 'dept_product', name: '产品部', parentId: 'dept_root', memberCount: 4, order: 2, expanded: false },
    { id: 'dept_marketing', name: '市场部', parentId: 'dept_root', memberCount: 3, order: 3, expanded: false },
  ]

  // 11 conversations (3 group + 8 dm)
  const conversations = [
    {
      id: 'conv_001', type: 'group', name: '技术部全员群', avatar: '#1890FF',
      memberIds: ['user_001', 'user_003', 'user_005', 'user_009', 'user_011', 'user_014'],
      lastMessage: { text: '[@张伟] 请帮忙 review 一下 PR #234', senderId: 'user_009', timestamp: timeAgo(5) },
      unreadCount: 3, isPinned: false, isMuted: false, isGroup: true,
      announcement: '本周五下午3点技术分享会，请大家准时参加！', createdAt: dayAgo(30)
    },
    {
      id: 'conv_002', type: 'group', name: '项目Alpha讨论组', avatar: '#FA8C16',
      memberIds: ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_008', 'user_009', 'user_011', 'user_015'],
      lastMessage: { text: '需求文档已更新，请查收', senderId: 'user_002', timestamp: timeAgo(45) },
      unreadCount: 0, isPinned: false, isMuted: false, isGroup: true,
      announcement: '', createdAt: dayAgo(20)
    },
    {
      id: 'conv_003', type: 'group', name: '全员群', avatar: '#52C41A',
      memberIds: users.map(u => u.id),
      lastMessage: { text: '关于五一假期安排，请大家查看公告', senderId: 'user_006', timestamp: dayAgo(1) },
      unreadCount: 5, isPinned: true, isMuted: false, isGroup: true,
      announcement: '欢迎加入钉钉科技！有任何问题请联系HR刘洋。', createdAt: dayAgo(180)
    },
    {
      id: 'conv_004', type: 'dm', name: '李娜', avatar: '#FA8C16',
      memberIds: ['user_001', 'user_002'],
      lastMessage: { text: '好的，我这边整理完需求再同步你', senderId: 'user_002', timestamp: timeAgo(20) },
      unreadCount: 2, isPinned: false, isMuted: false, isGroup: false,
      announcement: '', createdAt: dayAgo(60)
    },
    {
      id: 'conv_005', type: 'dm', name: '赵强', avatar: '#F5222D',
      memberIds: ['user_001', 'user_005'],
      lastMessage: { text: '明天的技术评审准备好了', senderId: 'user_001', timestamp: dayAgo(1) },
      unreadCount: 0, isPinned: false, isMuted: false, isGroup: false,
      announcement: '', createdAt: dayAgo(90)
    },
    {
      id: 'conv_006', type: 'dm', name: '陈静', avatar: '#722ED1',
      memberIds: ['user_001', 'user_004'],
      lastMessage: { text: '新版本的设计稿发你了，看一下', senderId: 'user_004', timestamp: timeAgo(60) },
      unreadCount: 1, isPinned: false, isMuted: false, isGroup: false,
      announcement: '', createdAt: dayAgo(45)
    },
    {
      id: 'conv_007', type: 'dm', name: '王磊', avatar: '#52C41A',
      memberIds: ['user_001', 'user_003'],
      lastMessage: { text: '接口文档我放在confluence了', senderId: 'user_003', timestamp: dayAgo(2) },
      unreadCount: 0, isPinned: false, isMuted: true, isGroup: false,
      announcement: '', createdAt: dayAgo(100)
    },
    {
      id: 'conv_008', type: 'dm', name: '刘洋', avatar: '#13C2C2',
      memberIds: ['user_001', 'user_006'],
      lastMessage: { text: '入职培训材料已发送到你邮箱', senderId: 'user_006', timestamp: dayAgo(3) },
      unreadCount: 0, isPinned: false, isMuted: false, isGroup: false,
      announcement: '', createdAt: dayAgo(120)
    },
    {
      id: 'conv_009', type: 'dm', name: '吴昊', avatar: '#FA541C',
      memberIds: ['user_001', 'user_008'],
      lastMessage: { text: '市场推广方案已经提交了', senderId: 'user_008', timestamp: timeAgo(90) },
      unreadCount: 1, isPinned: false, isMuted: false, isGroup: false,
      announcement: '', createdAt: dayAgo(30)
    },
    {
      id: 'conv_010', type: 'dm', name: '杨芳', avatar: '#597EF7',
      memberIds: ['user_001', 'user_011'],
      lastMessage: { text: '代码已经提交了，你帮忙看看', senderId: 'user_011', timestamp: timeAgo(15) },
      unreadCount: 1, isPinned: false, isMuted: false, isGroup: false,
      announcement: '', createdAt: dayAgo(14)
    },
    {
      id: 'conv_011', type: 'dm', name: '郑凯', avatar: '#9254DE',
      memberIds: ['user_001', 'user_014'],
      lastMessage: { text: '服务器监控已配置完成', senderId: 'user_014', timestamp: dayAgo(1) },
      unreadCount: 0, isPinned: false, isMuted: false, isGroup: false,
      announcement: '', createdAt: dayAgo(7)
    },
  ]

  const messages = [
    // conv_001 (技术部全员群)
    { id: 'msg_001', conversationId: 'conv_001', senderId: 'user_005', type: 'system', content: '赵强 邀请 杨芳 加入了群聊', timestamp: dayAgo(7), readBy: ['user_001','user_003','user_005','user_009','user_011','user_014'], isRecalled: false, replyTo: null },
    { id: 'msg_002', conversationId: 'conv_001', senderId: 'user_005', type: 'text', content: '大家好，欢迎杨芳加入技术部！', timestamp: dayAgo(7), readBy: ['user_001','user_003','user_005','user_009','user_011','user_014'], isRecalled: false, replyTo: null },
    { id: 'msg_003', conversationId: 'conv_001', senderId: 'user_001', type: 'text', content: '欢迎欢迎！有什么不懂的随时问', timestamp: dayAgo(6), readBy: ['user_001','user_003','user_005','user_009','user_011','user_014'], isRecalled: false, replyTo: null },
    { id: 'msg_004', conversationId: 'conv_001', senderId: 'user_009', type: 'text', content: '最近代码review进度怎么样了？', timestamp: dayAgo(2), readBy: ['user_001','user_005','user_009'], isRecalled: false, replyTo: null },
    { id: 'msg_005', conversationId: 'conv_001', senderId: 'user_001', type: 'text', content: '我这边已经review了3个PR，还有两个在看', timestamp: dayAgo(2), readBy: ['user_001','user_005','user_009'], isRecalled: false, replyTo: null },
    { id: 'msg_006', conversationId: 'conv_001', senderId: 'user_003', type: 'file', content: 'Q1技术文档.pdf', timestamp: dayAgo(1), readBy: ['user_001','user_003'], isRecalled: false, replyTo: null, fileName: 'Q1技术文档.pdf', fileSize: '1.2 MB' },
    { id: 'msg_007', conversationId: 'conv_001', senderId: 'user_014', type: 'text', content: '线上环境Nginx配置已更新，大家注意测试', timestamp: timeAgo(30), readBy: ['user_014'], isRecalled: false, replyTo: null },
    { id: 'msg_027', conversationId: 'conv_001', senderId: 'user_009', type: 'text', content: '[@张伟] 请帮忙 review 一下 PR #234', timestamp: timeAgo(5), readBy: ['user_009'], isRecalled: false, replyTo: null },

    // conv_002 (项目Alpha)
    { id: 'msg_008', conversationId: 'conv_002', senderId: 'user_002', type: 'text', content: '项目Alpha第一期需求已确认，预计下周开始开发', timestamp: dayAgo(5), readBy: ['user_001','user_002','user_005'], isRecalled: false, replyTo: null },
    { id: 'msg_009', conversationId: 'conv_002', senderId: 'user_001', type: 'text', content: '收到，我这边先搭框架', timestamp: dayAgo(5), readBy: ['user_001','user_002','user_005'], isRecalled: false, replyTo: null },
    { id: 'msg_010', conversationId: 'conv_002', senderId: 'user_004', type: 'text', content: '设计稿本周五出初稿', timestamp: dayAgo(3), readBy: ['user_001','user_002','user_004'], isRecalled: false, replyTo: null },
    { id: 'msg_011', conversationId: 'conv_002', senderId: 'user_002', type: 'text', content: '需求文档已更新，请查收', timestamp: timeAgo(45), readBy: ['user_002'], isRecalled: false, replyTo: null },

    // conv_003 (全员群)
    { id: 'msg_012', conversationId: 'conv_003', senderId: 'user_012', type: 'text', content: '大家好，Q1各团队都取得了很好的成绩，感谢大家的努力！', timestamp: dayAgo(5), readBy: ['user_001','user_012'], isRecalled: false, replyTo: null },
    { id: 'msg_013', conversationId: 'conv_003', senderId: 'user_006', type: 'text', content: '关于五一假期安排，请大家查看公告', timestamp: dayAgo(1), readBy: ['user_001','user_006'], isRecalled: false, replyTo: null },
    { id: 'msg_026', conversationId: 'conv_003', senderId: 'user_005', type: 'text', content: '@张伟 明天的部署计划确认了吗？', timestamp: dayAgo(1), readBy: ['user_005'], isRecalled: false, replyTo: null },

    // conv_004 (李娜 DM)
    { id: 'msg_014', conversationId: 'conv_004', senderId: 'user_001', type: 'text', content: '李娜，项目Alpha的技术方案我看了，有几个点想跟你确认一下', timestamp: timeAgo(40), readBy: ['user_001','user_002'], isRecalled: false, replyTo: null },
    { id: 'msg_015', conversationId: 'conv_004', senderId: 'user_002', type: 'text', content: '好啊，你说', timestamp: timeAgo(35), readBy: ['user_001','user_002'], isRecalled: false, replyTo: null },
    { id: 'msg_016', conversationId: 'conv_004', senderId: 'user_001', type: 'text', content: '用户列表这个接口，分页参数是前端传还是后端默认？', timestamp: timeAgo(30), readBy: ['user_001','user_002'], isRecalled: false, replyTo: null },
    { id: 'msg_017', conversationId: 'conv_004', senderId: 'user_002', type: 'text', content: '好的，我这边整理完需求再同步你', timestamp: timeAgo(20), readBy: ['user_002'], isRecalled: false, replyTo: null },

    // conv_005 (赵强 DM)
    { id: 'msg_018', conversationId: 'conv_005', senderId: 'user_005', type: 'text', content: '明天技术评审会议记得带你的方案PPT', timestamp: dayAgo(2), readBy: ['user_001','user_005'], isRecalled: false, replyTo: null },
    { id: 'msg_019', conversationId: 'conv_005', senderId: 'user_001', type: 'text', content: '明天的技术评审准备好了', timestamp: dayAgo(1), readBy: ['user_001','user_005'], isRecalled: false, replyTo: null },

    // conv_006 (陈静 DM)
    { id: 'msg_020', conversationId: 'conv_006', senderId: 'user_001', type: 'text', content: '陈静，登录页的交互稿什么时候能出？', timestamp: timeAgo(90), readBy: ['user_001','user_004'], isRecalled: false, replyTo: null },
    { id: 'msg_021', conversationId: 'conv_006', senderId: 'user_004', type: 'text', content: '新版本的设计稿发你了，看一下', timestamp: timeAgo(60), readBy: ['user_004'], isRecalled: false, replyTo: null },

    // conv_007 (王磊 DM)
    { id: 'msg_022', conversationId: 'conv_007', senderId: 'user_001', type: 'text', content: '接口文档更新了吗？', timestamp: dayAgo(3), readBy: ['user_001','user_003'], isRecalled: false, replyTo: null },
    { id: 'msg_023', conversationId: 'conv_007', senderId: 'user_003', type: 'text', content: '接口文档我放在confluence了', timestamp: dayAgo(2), readBy: ['user_001','user_003'], isRecalled: false, replyTo: null },

    // conv_008 (刘洋 DM)
    { id: 'msg_024', conversationId: 'conv_008', senderId: 'user_001', type: 'text', content: '请问新员工培训材料能发一份给我吗？', timestamp: dayAgo(4), readBy: ['user_001','user_006'], isRecalled: false, replyTo: null },
    { id: 'msg_025', conversationId: 'conv_008', senderId: 'user_006', type: 'text', content: '入职培训材料已发送到你邮箱', timestamp: dayAgo(3), readBy: ['user_001','user_006'], isRecalled: false, replyTo: null },

    // conv_009 (吴昊 DM)
    { id: 'msg_028', conversationId: 'conv_009', senderId: 'user_001', type: 'text', content: '吴昊，市场推广的预算审批通过了', timestamp: timeAgo(120), readBy: ['user_001','user_008'], isRecalled: false, replyTo: null },
    { id: 'msg_029', conversationId: 'conv_009', senderId: 'user_008', type: 'text', content: '太好了！市场推广方案已经提交了', timestamp: timeAgo(90), readBy: ['user_008'], isRecalled: false, replyTo: null },

    // conv_010 (杨芳 DM)
    { id: 'msg_030', conversationId: 'conv_010', senderId: 'user_011', type: 'text', content: '张伟哥，这段代码逻辑我不太理解，能帮我看看吗', timestamp: timeAgo(30), readBy: ['user_011'], isRecalled: false, replyTo: null },
    { id: 'msg_031', conversationId: 'conv_010', senderId: 'user_001', type: 'text', content: '可以，你截图发我看看', timestamp: timeAgo(25), readBy: ['user_001','user_011'], isRecalled: false, replyTo: null },
    { id: 'msg_032', conversationId: 'conv_010', senderId: 'user_011', type: 'text', content: '代码已经提交了，你帮忙看看', timestamp: timeAgo(15), readBy: ['user_011'], isRecalled: false, replyTo: null },

    // conv_011 (郑凯 DM)
    { id: 'msg_033', conversationId: 'conv_011', senderId: 'user_014', type: 'text', content: '服务器监控已配置完成', timestamp: dayAgo(1), readBy: ['user_001','user_014'], isRecalled: false, replyTo: null },
  ]

  const dingMessages = [
    { id: 'ding_001', senderId: 'user_001', recipientIds: ['user_002','user_003','user_004','user_005','user_009'], content: '请确认明天的上线计划，务必在今天18:00前回复', timestamp: timeAgo(120), confirmedBy: ['user_002','user_005'], type: 'sent' },
    { id: 'ding_002', senderId: 'user_001', recipientIds: ['user_003','user_011'], content: '今晚8点前需要完成登录模块的联调', timestamp: dayAgo(1), confirmedBy: ['user_003','user_011'], type: 'sent' },
    { id: 'ding_003', senderId: 'user_001', recipientIds: ['user_002','user_004','user_005'], content: '项目Alpha需求评审会议在30分钟后开始，3楼会议室A', timestamp: dayAgo(2), confirmedBy: ['user_002'], type: 'sent' },
    { id: 'ding_004', senderId: 'user_005', recipientIds: ['user_001'], content: '紧急：生产环境出现bug，请立即处理！', timestamp: timeAgo(30), confirmedBy: [], type: 'received' },
    { id: 'ding_005', senderId: 'user_002', recipientIds: ['user_001'], content: '客户明天来公司参观，请把演示环境准备好', timestamp: dayAgo(1), confirmedBy: ['user_001'], type: 'received' },
    { id: 'ding_006', senderId: 'user_006', recipientIds: ['user_001'], content: '请在今天下班前提交本月工时报告', timestamp: dayAgo(1), confirmedBy: ['user_001'], type: 'received' },
    { id: 'ding_007', senderId: 'user_016', recipientIds: ['user_001'], content: '本周五市场活动需要技术支持，请确认人员安排', timestamp: timeAgo(180), confirmedBy: [], type: 'received' },
  ]

  const approvalForms = [
    {
      id: 'appr_001', type: 'leave', title: '年假申请', submitterId: 'user_001',
      status: 'pending', createdAt: dayAgo(2),
      approverIds: ['user_005', 'user_006'], currentApproverId: 'user_005',
      fields: { leaveType: '年假', startDate: thisWeek(3).split('T')[0], endDate: thisWeek(5).split('T')[0], duration: '3天', reason: '家庭事务处理，需要请假3天' },
      comments: []
    },
    {
      id: 'appr_002', type: 'expense', title: '差旅费报销', submitterId: 'user_001',
      status: 'approved', createdAt: dayAgo(10),
      approverIds: ['user_005', 'user_007'], currentApproverId: null,
      fields: { category: '差旅', amount: 2580, items: [{desc: '高铁票（北京-上海往返）', amount: 1200}, {desc: '住宿费（2晚）', amount: 800}, {desc: '餐饮费', amount: 580}], receipts: [] },
      comments: [{ userId: 'user_005', text: '同意报销', timestamp: dayAgo(8), action: 'approved' }, { userId: 'user_007', text: '审核通过', timestamp: dayAgo(7), action: 'approved' }]
    },
    {
      id: 'appr_003', type: 'business_trip', title: '出差申请 - 深圳客户拜访', submitterId: 'user_008',
      status: 'pending', createdAt: dayAgo(1),
      approverIds: ['user_001'], currentApproverId: 'user_001',
      fields: { destination: '深圳', startDate: thisWeek(1).split('T')[0], endDate: thisWeek(2).split('T')[0], purpose: '拜访重要客户，洽谈合作方案', transportation: '高铁' },
      comments: []
    },
    {
      id: 'appr_004', type: 'overtime', title: '加班申请 - 项目上线冲刺', submitterId: 'user_001',
      status: 'rejected', createdAt: dayAgo(5),
      approverIds: ['user_005'], currentApproverId: null,
      fields: { startDate: dayAgo(3).split('T')[0], endDate: dayAgo(2).split('T')[0], duration: '2天', reason: '项目Alpha第一期上线冲刺需要加班' },
      comments: [{ userId: 'user_005', text: '请合理安排工作时间，避免过度加班', timestamp: dayAgo(4), action: 'rejected' }]
    },
    {
      id: 'appr_005', type: 'purchase', title: '办公设备采购申请', submitterId: 'user_005',
      status: 'approved', createdAt: dayAgo(7),
      approverIds: ['user_012', 'user_007'], currentApproverId: null,
      fields: { category: '办公用品', amount: 15800, items: [{desc: '苹果MacBook Pro 14寸 x2', amount: 15800}], receipts: [] },
      comments: [{ userId: 'user_012', text: '同意采购', timestamp: dayAgo(6), action: 'approved' }, { userId: 'user_007', text: '财务审核通过', timestamp: dayAgo(5), action: 'approved' }]
    },
    {
      id: 'appr_006', type: 'general', title: '项目延期申请', submitterId: 'user_002',
      status: 'pending', createdAt: dayAgo(1),
      approverIds: ['user_005', 'user_012'], currentApproverId: 'user_005',
      fields: { reason: '因需求变更，项目Alpha第一期需要延期2周交付', newDeadline: thisWeek(14).split('T')[0] },
      comments: []
    },
  ]

  // Calendar events
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1)
  const wDay = (dayOffset, hour, minute) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dayOffset)
    d.setHours(hour, minute, 0, 0)
    return d.toISOString()
  }

  const calendarEvents = [
    { id: 'evt_001', title: '每日站会', startTime: wDay(0, 9, 30), endTime: wDay(0, 10, 0), location: '线上会议', creatorId: 'user_005', participantIds: ['user_001','user_003','user_009','user_011','user_014'], color: '#1890FF', isAllDay: false, reminder: 5, recurrence: 'daily', description: '每日同步工作进度' },
    { id: 'evt_002', title: 'Q1季度复盘会议', startTime: wDay(3, 14, 0), endTime: wDay(3, 15, 30), location: '3楼会议室A', creatorId: 'user_005', participantIds: ['user_001','user_002','user_003','user_004','user_005'], color: '#FA8C16', isAllDay: false, reminder: 15, recurrence: null, description: '请提前准备部门数据和关键指标' },
    { id: 'evt_003', title: '与赵强 1:1', startTime: wDay(2, 11, 0), endTime: wDay(2, 11, 30), location: '小会议室B', creatorId: 'user_005', participantIds: ['user_001','user_005'], color: '#F5222D', isAllDay: false, reminder: 10, recurrence: 'weekly', description: '周例行1对1' },
    { id: 'evt_004', title: '团队午餐', startTime: wDay(4, 12, 0), endTime: wDay(4, 13, 30), location: '公司附近餐厅', creatorId: 'user_001', participantIds: ['user_001','user_003','user_009','user_011'], color: '#52C41A', isAllDay: false, reminder: 30, recurrence: null, description: '欢迎新成员杨芳' },
    { id: 'evt_005', title: '版本发布', startTime: wDay(5, 2, 0), endTime: wDay(5, 4, 0), location: '远程', creatorId: 'user_001', participantIds: ['user_001','user_003','user_014'], color: '#722ED1', isAllDay: false, reminder: 60, recurrence: null, description: 'v2.3.0版本发布' },
    { id: 'evt_006', title: '产品路线图评审', startTime: wDay(1, 15, 0), endTime: wDay(1, 16, 0), location: '3楼会议室A', creatorId: 'user_002', participantIds: ['user_001','user_002','user_005','user_012'], color: '#9254DE', isAllDay: false, reminder: 15, recurrence: null, description: 'Q2产品规划评审' },
    { id: 'evt_007', title: '设计评审', startTime: wDay(2, 14, 0), endTime: wDay(2, 15, 0), location: '2楼设计室', creatorId: 'user_004', participantIds: ['user_001','user_002','user_004','user_010'], color: '#EB2F96', isAllDay: false, reminder: 15, recurrence: null, description: '项目Alpha UI设计评审' },
    { id: 'evt_008', title: '全员大会', startTime: wDay(4, 10, 0), endTime: wDay(4, 11, 30), location: '1楼大会议室', creatorId: 'user_012', participantIds: users.map(u => u.id), color: '#FA541C', isAllDay: false, reminder: 30, recurrence: null, description: '月度全员大会，汇报各部门工作进展' },
  ]

  const todoItems = [
    { id: 'todo_001', title: '完成API文档更新', description: '更新用户认证模块的API文档', completed: false, dueDate: today, creatorId: 'user_001', assigneeId: 'user_001', priority: 'high', conversationId: null, createdAt: dayAgo(3) },
    { id: 'todo_002', title: 'Review PR #234', description: '前端登录模块代码review', completed: false, dueDate: today, creatorId: 'user_011', assigneeId: 'user_001', priority: 'high', conversationId: 'conv_001', createdAt: timeAgo(120) },
    { id: 'todo_003', title: '准备周报', description: '整理本周工作内容，提交周报', completed: false, dueDate: thisWeek(4).split('T')[0], creatorId: 'user_001', assigneeId: 'user_001', priority: 'medium', conversationId: null, createdAt: dayAgo(1) },
    { id: 'todo_004', title: '修复登录页面Bug', description: '修复微信登录回调404问题', completed: false, dueDate: dayAgo(1), creatorId: 'user_009', assigneeId: 'user_001', priority: 'high', conversationId: null, createdAt: dayAgo(2) },
    { id: 'todo_005', title: '更新技术选型文档', description: '更新项目Alpha技术选型文档', completed: false, dueDate: dayAgo(2), creatorId: 'user_001', assigneeId: 'user_001', priority: 'medium', conversationId: null, createdAt: dayAgo(5) },
    { id: 'todo_006', title: '搭建测试环境', description: '搭建项目Alpha的测试环境', completed: false, dueDate: thisWeek(2).split('T')[0], creatorId: 'user_003', assigneeId: 'user_001', priority: 'medium', conversationId: 'conv_002', createdAt: dayAgo(1) },
    { id: 'todo_007', title: '提交Q1工作总结', description: '提交Q1季度个人工作总结', completed: true, dueDate: dayAgo(7), creatorId: 'user_006', assigneeId: 'user_001', priority: 'high', conversationId: null, createdAt: dayAgo(14) },
  ]

  const workbenchApps = [
    { id: 'app_approval', name: '审批', icon: '📋', color: '#FF9800', route: '/workbench/approval', category: 'OA', badge: 2 },
    { id: 'app_attendance', name: '考勤打卡', icon: '📍', color: '#4CAF50', route: '/workbench/attendance', category: 'OA', badge: 0 },
    { id: 'app_calendar', name: '日程', icon: '📅', color: '#1890FF', route: '/calendar', category: '效率', badge: 0 },
    { id: 'app_todo', name: '待办', icon: '✅', color: '#9C27B0', route: '/workbench/todo', category: '效率', badge: 3 },
    { id: 'app_drive', name: '钉盘', icon: '💾', color: '#00BCD4', route: '/workbench/drive', category: '协作', badge: 0 },
    { id: 'app_log', name: '日志', icon: '📝', color: '#FF5722', route: '/workbench/log', category: 'OA', badge: 0 },
    { id: 'app_announcement', name: '公告', icon: '📢', color: '#E91E63', route: '/workbench/announcements', category: 'OA', badge: 1 },
    { id: 'app_meeting', name: '会议', icon: '🎥', color: '#673AB7', route: '/workbench/meeting', category: '协作', badge: 0 },
    { id: 'app_docs', name: '文档', icon: '📄', color: '#3F51B5', route: '/workbench/docs', category: '协作', badge: 0 },
    { id: 'app_report', name: '汇报', icon: '📊', color: '#795548', route: '/workbench/report', category: 'OA', badge: 0 },
    { id: 'app_contacts', name: '外部联系人', icon: '👥', color: '#607D8B', route: '/contacts', category: '通讯', badge: 0 },
    { id: 'app_task', name: '任务', icon: '🎯', color: '#009688', route: '/workbench/todo', category: '效率', badge: 0 },
  ]

  const announcements = [
    { id: 'ann_001', title: '关于五一假期安排的通知', content: '根据国家法定节假日安排，今年五一劳动节放假5天（5月1日至5月5日），5月6日（周一）正常上班。请大家提前做好工作安排，如有紧急事务请提前处理。祝大家五一快乐！', authorId: 'user_006', publishedAt: dayAgo(1), readBy: [], isTop: true },
    { id: 'ann_002', title: 'Q1季度绩效考核通知', content: '各位同事，Q1季度绩效考核将于本月底开始，请大家提前准备自评材料。具体流程：1. 员工自评（3月25-28日）；2. 主管评分（3月29-31日）；3. 绩效面谈（4月1-5日）。如有疑问请联系HR部门。', authorId: 'user_006', publishedAt: dayAgo(3), readBy: ['user_001'], isTop: false },
    { id: 'ann_003', title: '新员工入职培训安排', content: '本月新入职的同事请注意：入职培训将于下周一上午9点在1楼培训室进行，内容包括：公司介绍、规章制度、IT系统使用培训等。请提前做好准备。', authorId: 'user_006', publishedAt: dayAgo(5), readBy: ['user_001'], isTop: false },
    { id: 'ann_004', title: '办公区域装修通知', content: '由于3楼部分区域进行装修改造，3楼小会议室B和C将暂停使用（预计2周）。有会议需求的同事请提前预约其他会议室。给大家带来的不便，敬请谅解。', authorId: 'user_012', publishedAt: dayAgo(7), readBy: ['user_001'], isTop: false },
  ]

  const attendanceRecords = {
    checkIn: null,
    checkOut: null,
    history: {}
  }

  const drive = {
    folders: [
      { id: 'folder_001', name: '技术部', modifiedAt: dayAgo(3), uploaderId: 'user_001' },
      { id: 'folder_002', name: '产品部', modifiedAt: dayAgo(5), uploaderId: 'user_002' },
      { id: 'folder_003', name: '市场部', modifiedAt: dayAgo(7), uploaderId: 'user_008' },
    ],
    files: [
      { id: 'dfile_001', name: '技术规范.pdf', size: '2.3 MB', modifiedAt: dayAgo(1), uploaderId: 'user_001' },
      { id: 'dfile_002', name: 'Q1报告.xlsx', size: '1.1 MB', modifiedAt: dayAgo(2), uploaderId: 'user_002' },
      { id: 'dfile_003', name: '产品路线图.pptx', size: '5.6 MB', modifiedAt: dayAgo(4), uploaderId: 'user_002' },
      { id: 'dfile_004', name: '团队合影.jpg', size: '3.2 MB', modifiedAt: dayAgo(6), uploaderId: 'user_006' },
      { id: 'dfile_005', name: '项目计划.pdf', size: '0.8 MB', modifiedAt: dayAgo(8), uploaderId: 'user_001' },
    ]
  }

  // Daily reports (日志)
  const dailyReports = [
    {
      id: 'report_001', type: 'daily', authorId: 'user_001',
      createdAt: dayAgo(1),
      todayWork: '1. 完成登录模块前端开发\n2. Review PR #230 和 #231\n3. 修复首页性能问题',
      tomorrowPlan: '1. 开始用户列表模块开发\n2. 准备技术评审PPT\n3. 协助杨芳解决代码问题',
      problems: '与后端接口联调存在字段不一致的问题，需要后端配合调整',
      readBy: ['user_001', 'user_005'],
      recipientIds: ['user_005'],
    },
    {
      id: 'report_002', type: 'daily', authorId: 'user_003',
      createdAt: dayAgo(1),
      todayWork: '1. 完成用户认证接口开发\n2. 编写单元测试\n3. 优化数据库查询性能',
      tomorrowPlan: '1. 开发订单模块API\n2. 完善接口文档\n3. 部署测试环境',
      problems: '无',
      readBy: ['user_003', 'user_005'],
      recipientIds: ['user_005'],
    },
    {
      id: 'report_003', type: 'weekly', authorId: 'user_001',
      createdAt: dayAgo(7),
      todayWork: '本周完成事项：\n1. 项目Alpha前端框架搭建\n2. 登录/注册模块开发\n3. 与产品对齐需求细节\n4. 代码review 5个PR',
      tomorrowPlan: '下周计划：\n1. 用户管理模块开发\n2. 前端自动化测试搭建\n3. 性能优化方案设计',
      problems: '部分设计稿还未交付，影响部分页面开发进度',
      readBy: ['user_001', 'user_005', 'user_012'],
      recipientIds: ['user_005', 'user_012'],
    },
    {
      id: 'report_004', type: 'daily', authorId: 'user_011',
      createdAt: dayAgo(1),
      todayWork: '1. 学习项目代码结构\n2. 完成导航组件开发\n3. 提交PR #234待review',
      tomorrowPlan: '1. 完善导航组件样式\n2. 开始侧边栏模块开发',
      problems: '部分老代码缺少注释，理解起来比较困难',
      readBy: ['user_011', 'user_005'],
      recipientIds: ['user_005', 'user_001'],
    },
    {
      id: 'report_005', type: 'daily', authorId: 'user_002',
      createdAt: dayAgo(1),
      todayWork: '1. 完成项目Alpha第一期需求文档\n2. 与市场部对齐推广方案\n3. 整理用户反馈',
      tomorrowPlan: '1. 准备Q1复盘材料\n2. 跟进设计稿交付\n3. 排期第二期需求',
      problems: '客户反馈需要增加数据导出功能，需要评估开发量',
      readBy: ['user_002', 'user_012'],
      recipientIds: ['user_012'],
    },
  ]

  return {
    currentUser: users[0],
    users,
    departments,
    conversations,
    messages,
    dingMessages,
    approvalForms,
    calendarEvents,
    todoItems,
    workbenchApps,
    announcements,
    attendanceRecords,
    drive,
    dailyReports,
    activeTab: 'messages',
    activeConversationId: null,
    searchQuery: '',
    dingActiveTab: 'received',
    approvalActiveTab: 'submitted',
    contactsActiveTab: 'org',
    calendarView: 'week',
    calendarDate: new Date().toISOString(),
    settings: {
      notificationSound: true,
      messagePreview: true,
      dndEnabled: false,
      dndStart: '22:00',
      dndEnd: '08:00',
      language: '中文',
      fontSize: 14,
    }
  }
}

export function initializeData(sid = null, customState = null) {
  const key = storageKey(sid)
  const iKey = initialKey(sid)

  const defaults = createInitialData()

  let state
  if (customState) {
    state = deepMerge(defaults, customState)
    localStorage.setItem(iKey, JSON.stringify(state))
    localStorage.setItem(key, JSON.stringify(state))
    return state
  }

  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      state = JSON.parse(saved)
    } catch {
      state = defaults
    }
  } else {
    state = defaults
  }

  const isFirstLoad = !localStorage.getItem(iKey)
  if (isFirstLoad) {
    localStorage.setItem(iKey, JSON.stringify(state))
    if (sid) {
      fetch(`/post?sid=${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', state })
      }).catch(() => {})
    }
  }

  localStorage.setItem(key, JSON.stringify(state))
  return state
}

let _saveTimer = null

export function saveState(state, sid = null) {
  const key = storageKey(sid)
  localStorage.setItem(key, JSON.stringify(state))

  if (sid) {
    if (_saveTimer) clearTimeout(_saveTimer)
    _saveTimer = setTimeout(() => {
      fetch(`/post?sid=${sid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      }).catch(() => {})
      _saveTimer = null
    }, 300)
  }
}

export function getInitialState(sid = null) {
  const iKey = initialKey(sid)
  const saved = localStorage.getItem(iKey)
  if (!saved) return null
  try {
    return JSON.parse(saved)
  } catch {
    return null
  }
}
