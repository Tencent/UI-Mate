// dataManager.js — State initialization, localStorage persistence, and session helpers

const BASE_KEY = '12306_mock_state';
const BASE_INITIAL_KEY = '12306_mock_initial_state';

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const sid = params.get('sid');
  if (sid) {
    sessionStorage.setItem('12306_sid', sid);
    return sid;
  }
  return sessionStorage.getItem('12306_sid') || null;
};

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY;
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;

export const fetchCustomState = async (sid) => {
  if (!sid) return null;
  try {
    const res = await fetch(`/state?sid=${encodeURIComponent(sid)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data && Object.keys(data).length > 0 ? data : null;
  } catch {
    return null;
  }
};

function deepMerge(base, override) {
  if (!override) return base;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (override[key] === null || override[key] === undefined) continue;
    if (Array.isArray(override[key])) {
      result[key] = override[key];
    } else if (typeof override[key] === 'object' && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

export function createInitialData() {
  // Trains do NOT have a fixed date — the date is set at search time.
  // This way, searching for any date returns results.
  return {
    user: {
      id: 'user_001',
      name: '张伟',
      username: 'zhangwei2024',
      idType: '身份证',
      idNumber: '110101199001011234',
      phone: '138****5678',
      email: 'zhangwei@example.com',
      memberLevel: '金卡会员',
      memberPoints: 12680,
      isLoggedIn: true,
    },

    stations: [
      { code: 'VNP', name: '北京南', city: '北京', pinyin: 'beijingnan', initial: 'B', isHot: true },
      { code: 'BXP', name: '北京西', city: '北京', pinyin: 'beijingxi', initial: 'B', isHot: true },
      { code: 'BJP', name: '北京', city: '北京', pinyin: 'beijing', initial: 'B', isHot: true },
      { code: 'HOH', name: '上海虹桥', city: '上海', pinyin: 'shanghaihongqiao', initial: 'S', isHot: true },
      { code: 'SHH', name: '上海', city: '上海', pinyin: 'shanghai', initial: 'S', isHot: true },
      { code: 'IZQ', name: '广州南', city: '广州', pinyin: 'guangzhounan', initial: 'G', isHot: true },
      { code: 'GZQ', name: '广州', city: '广州', pinyin: 'guangzhou', initial: 'G', isHot: false },
      { code: 'GZD', name: '广州东', city: '广州', pinyin: 'guangzhoudong', initial: 'G', isHot: false },
      { code: 'IOQ', name: '深圳北', city: '深圳', pinyin: 'shenzhenbei', initial: 'S', isHot: true },
      { code: 'SZQ', name: '深圳', city: '深圳', pinyin: 'shenzhen', initial: 'S', isHot: true },
      { code: 'ICW', name: '成都东', city: '成都', pinyin: 'chengdudong', initial: 'C', isHot: true },
      { code: 'CQW', name: '重庆北', city: '重庆', pinyin: 'chongqingbei', initial: 'C', isHot: false },
      { code: 'CQN', name: '重庆西', city: '重庆', pinyin: 'chongqingxi', initial: 'C', isHot: false },
      { code: 'WUH', name: '武汉', city: '武汉', pinyin: 'wuhan', initial: 'W', isHot: true },
      { code: 'CSQ', name: '长沙南', city: '长沙', pinyin: 'changshanan', initial: 'C', isHot: false },
      { code: 'NJH', name: '南京南', city: '南京', pinyin: 'nanjingnan', initial: 'N', isHot: true },
      { code: 'NJG', name: '南京', city: '南京', pinyin: 'nanjing', initial: 'N', isHot: false },
      { code: 'HGH', name: '杭州东', city: '杭州', pinyin: 'hangzhoudong', initial: 'H', isHot: true },
      { code: 'XAB', name: '西安北', city: '西安', pinyin: 'xianbei', initial: 'X', isHot: true },
      { code: 'ZZF', name: '郑州东', city: '郑州', pinyin: 'zhengzhoudong', initial: 'Z', isHot: false },
      { code: 'JNK', name: '济南西', city: '济南', pinyin: 'jinanxi', initial: 'J', isHot: false },
      { code: 'TJP', name: '天津', city: '天津', pinyin: 'tianjin', initial: 'T', isHot: false },
      { code: 'TJS', name: '天津西', city: '天津', pinyin: 'tianjinxi', initial: 'T', isHot: false },
      { code: 'HFN', name: '合肥南', city: '合肥', pinyin: 'hefeinan', initial: 'H', isHot: false },
      { code: 'FZS', name: '福州南', city: '福州', pinyin: 'fuzhounan', initial: 'F', isHot: false },
      { code: 'XMN', name: '厦门北', city: '厦门', pinyin: 'xiamenbei', initial: 'X', isHot: false },
      { code: 'KMI', name: '昆明南', city: '昆明', pinyin: 'kunmingnan', initial: 'K', isHot: false },
      { code: 'GYB', name: '贵阳北', city: '贵阳', pinyin: 'guiyangbei', initial: 'G', isHot: false },
      { code: 'NND', name: '南宁东', city: '南宁', pinyin: 'nanningdong', initial: 'N', isHot: false },
      { code: 'HBB', name: '哈尔滨西', city: '哈尔滨', pinyin: 'haerbinxi', initial: 'H', isHot: false },
      { code: 'CCT', name: '长春', city: '长春', pinyin: 'changchun', initial: 'C', isHot: false },
      { code: 'SYT', name: '沈阳北', city: '沈阳', pinyin: 'shenyangbei', initial: 'S', isHot: false },
      { code: 'DLT', name: '大连北', city: '大连', pinyin: 'dalianbei', initial: 'D', isHot: false },
      { code: 'QDK', name: '青岛', city: '青岛', pinyin: 'qingdao', initial: 'Q', isHot: false },
      { code: 'SZV', name: '苏州北', city: '苏州', pinyin: 'suzhoubei', initial: 'S', isHot: false },
      { code: 'SZH', name: '苏州', city: '苏州', pinyin: 'suzhou', initial: 'S', isHot: false },
      { code: 'LZJ', name: '兰州西', city: '兰州', pinyin: 'lanzhouxi', initial: 'L', isHot: false },
      { code: 'TYV', name: '太原南', city: '太原', pinyin: 'taiyuannan', initial: 'T', isHot: false },
      { code: 'NCG', name: '南昌西', city: '南昌', pinyin: 'nanchangxi', initial: 'N', isHot: false },
    ],

    // Trains without fixed dates — any date search will match by route
    trains: [
      // === G Trains: Beijing South - Shanghai Hongqiao ===
      {
        trainNo: 'G1', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureTime: '09:00', arrivalTime: '13:28',
        duration: '4时28分', durationMinutes: 268,
        stops: ['北京南', '济南西', '南京南', '上海虹桥'],
        seatAvailability: { businessSeat: 9, firstClassSeat: '有', secondClassSeat: 156, deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G2', trainType: 'G',
        departureStation: '上海虹桥', arrivalStation: '北京南',
        departureTime: '14:00', arrivalTime: '18:28',
        duration: '4时28分', durationMinutes: 268,
        stops: ['上海虹桥', '南京南', '济南西', '北京南'],
        seatAvailability: { businessSeat: '无', firstClassSeat: 23, secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G7', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureTime: '07:00', arrivalTime: '11:40',
        duration: '4时40分', durationMinutes: 280,
        stops: ['北京南', '天津西', '济南西', '南京南', '苏州北', '上海虹桥'],
        seatAvailability: { businessSeat: 3, firstClassSeat: 12, secondClassSeat: 45, deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G11', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureTime: '08:05', arrivalTime: '12:26',
        duration: '4时21分', durationMinutes: 261,
        stops: ['北京南', '济南西', '上海虹桥'],
        seatAvailability: { businessSeat: '有', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G13', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureTime: '10:00', arrivalTime: '14:30',
        duration: '4时30分', durationMinutes: 270,
        stops: ['北京南', '济南西', '南京南', '上海虹桥'],
        seatAvailability: { businessSeat: '无', firstClassSeat: '无', secondClassSeat: 7, deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G15', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureTime: '11:00', arrivalTime: '15:28',
        duration: '4时28分', durationMinutes: 268,
        stops: ['北京南', '济南西', '南京南', '上海虹桥'],
        seatAvailability: { businessSeat: 6, firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G17', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureTime: '12:30', arrivalTime: '16:58',
        duration: '4时28分', durationMinutes: 268,
        stops: ['北京南', '济南西', '上海虹桥'],
        seatAvailability: { businessSeat: '有', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G19', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureTime: '14:00', arrivalTime: '18:30',
        duration: '4时30分', durationMinutes: 270,
        stops: ['北京南', '济南西', '南京南', '上海虹桥'],
        seatAvailability: { businessSeat: 2, firstClassSeat: 34, secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G105', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureTime: '16:00', arrivalTime: '21:00',
        duration: '5时00分', durationMinutes: 300,
        stops: ['北京南', '济南西', '南京南', '苏州北', '上海虹桥'],
        seatAvailability: { businessSeat: '有', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G1305', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureTime: '18:00', arrivalTime: '23:30',
        duration: '5时30分', durationMinutes: 330,
        stops: ['北京南', '济南西', '南京南', '上海虹桥'],
        seatAvailability: { businessSeat: '无', firstClassSeat: '无', secondClassSeat: '无', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      {
        trainNo: 'G8', trainType: 'G',
        departureStation: '上海虹桥', arrivalStation: '北京南',
        departureTime: '14:30', arrivalTime: '19:10',
        duration: '4时40分', durationMinutes: 280,
        stops: ['上海虹桥', '南京南', '济南西', '北京南'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '候补', secondClassSeat: '候补', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '候补' },
        prices: { businessSeat: 1748, firstClassSeat: 933, secondClassSeat: 553, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 553 },
      },
      // === G Trains: Beijing West - Shenzhen North ===
      {
        trainNo: 'G71', trainType: 'G',
        departureStation: '北京西', arrivalStation: '深圳北',
        departureTime: '08:30', arrivalTime: '16:30',
        duration: '8时00分', durationMinutes: 480,
        stops: ['北京西', '郑州东', '武汉', '长沙南', '广州南', '深圳北'],
        seatAvailability: { businessSeat: 5, firstClassSeat: 23, secondClassSeat: 78, deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 2748, firstClassSeat: 1483, secondClassSeat: 899, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 899 },
      },
      {
        trainNo: 'G72', trainType: 'G',
        departureStation: '深圳北', arrivalStation: '北京西',
        departureTime: '07:45', arrivalTime: '15:45',
        duration: '8时00分', durationMinutes: 480,
        stops: ['深圳北', '广州南', '长沙南', '武汉', '郑州东', '北京西'],
        seatAvailability: { businessSeat: '有', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 2748, firstClassSeat: 1483, secondClassSeat: 899, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 899 },
      },
      {
        trainNo: 'G79', trainType: 'G',
        departureStation: '北京西', arrivalStation: '深圳北',
        departureTime: '10:00', arrivalTime: '18:15',
        duration: '8时15分', durationMinutes: 495,
        stops: ['北京西', '武汉', '长沙南', '广州南', '深圳北'],
        seatAvailability: { businessSeat: '有', firstClassSeat: 15, secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 2748, firstClassSeat: 1483, secondClassSeat: 899, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 899 },
      },
      // === G Trains: Beijing West - Chengdu East ===
      {
        trainNo: 'G89', trainType: 'G',
        departureStation: '北京西', arrivalStation: '成都东',
        departureTime: '07:00', arrivalTime: '14:30',
        duration: '7时30分', durationMinutes: 450,
        stops: ['北京西', '郑州东', '西安北', '成都东'],
        seatAvailability: { businessSeat: '有', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 2388, firstClassSeat: 1283, secondClassSeat: 789, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 789 },
      },
      {
        trainNo: 'G501', trainType: 'G',
        departureStation: '北京西', arrivalStation: '成都东',
        departureTime: '09:00', arrivalTime: '16:45',
        duration: '7时45分', durationMinutes: 465,
        stops: ['北京西', '郑州东', '西安北', '成都东'],
        seatAvailability: { businessSeat: '有', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 2388, firstClassSeat: 1283, secondClassSeat: 789, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 789 },
      },
      // === G Trains: Shanghai - Hangzhou ===
      {
        trainNo: 'G7501', trainType: 'G',
        departureStation: '上海虹桥', arrivalStation: '杭州东',
        departureTime: '09:00', arrivalTime: '10:00',
        duration: '1时00分', durationMinutes: 60,
        stops: ['上海虹桥', '杭州东'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: 109, secondClassSeat: 73, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 73 },
      },
      {
        trainNo: 'G7503', trainType: 'G',
        departureStation: '上海虹桥', arrivalStation: '杭州东',
        departureTime: '10:30', arrivalTime: '11:25',
        duration: '0时55分', durationMinutes: 55,
        stops: ['上海虹桥', '杭州东'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 109, secondClassSeat: 73, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 73 },
      },
      // === G Trains: Beijing West - Guangzhou South ===
      {
        trainNo: 'G65', trainType: 'G',
        departureStation: '北京西', arrivalStation: '广州南',
        departureTime: '08:00', arrivalTime: '16:00',
        duration: '8时00分', durationMinutes: 480,
        stops: ['北京西', '武汉', '长沙南', '广州南'],
        seatAvailability: { businessSeat: '有', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 2588, firstClassSeat: 1393, secondClassSeat: 862, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 862 },
      },
      {
        trainNo: 'G67', trainType: 'G',
        departureStation: '北京西', arrivalStation: '广州南',
        departureTime: '10:28', arrivalTime: '18:48',
        duration: '8时20分', durationMinutes: 500,
        stops: ['北京西', '郑州东', '武汉', '长沙南', '广州南'],
        seatAvailability: { businessSeat: 4, firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 2588, firstClassSeat: 1393, secondClassSeat: 862, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 862 },
      },
      // === G Trains: Guangzhou South - Shenzhen North ===
      {
        trainNo: 'G6001', trainType: 'G',
        departureStation: '广州南', arrivalStation: '深圳北',
        departureTime: '07:00', arrivalTime: '07:35',
        duration: '0时35分', durationMinutes: 35,
        stops: ['广州南', '深圳北'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 100, secondClassSeat: 75, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 75 },
      },
      {
        trainNo: 'G6003', trainType: 'G',
        departureStation: '广州南', arrivalStation: '深圳北',
        departureTime: '08:15', arrivalTime: '08:50',
        duration: '0时35分', durationMinutes: 35,
        stops: ['广州南', '深圳北'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 100, secondClassSeat: 75, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 75 },
      },
      {
        trainNo: 'G6005', trainType: 'G',
        departureStation: '广州南', arrivalStation: '深圳北',
        departureTime: '09:30', arrivalTime: '10:05',
        duration: '0时35分', durationMinutes: 35,
        stops: ['广州南', '深圳北'],
        seatAvailability: { businessSeat: '--', firstClassSeat: 18, secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 100, secondClassSeat: 75, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 75 },
      },
      // === G Trains: Wuhan - Guangzhou South ===
      {
        trainNo: 'G1001', trainType: 'G',
        departureStation: '武汉', arrivalStation: '广州南',
        departureTime: '07:10', arrivalTime: '11:20',
        duration: '4时10分', durationMinutes: 250,
        stops: ['武汉', '长沙南', '广州南'],
        seatAvailability: { businessSeat: '有', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: 1530, firstClassSeat: 780, secondClassSeat: 463, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 463 },
      },
      // === G Trains: Nanjing - Shanghai ===
      {
        trainNo: 'G7001', trainType: 'G',
        departureStation: '南京南', arrivalStation: '上海虹桥',
        departureTime: '07:00', arrivalTime: '08:17',
        duration: '1时17分', durationMinutes: 77,
        stops: ['南京南', '上海虹桥'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 229, secondClassSeat: 134, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 134 },
      },
      // === D Trains ===
      {
        trainNo: 'D2001', trainType: 'D',
        departureStation: '北京', arrivalStation: '天津',
        departureTime: '09:30', arrivalTime: '10:03',
        duration: '33分', durationMinutes: 33,
        stops: ['北京', '天津'],
        seatAvailability: { businessSeat: '--', firstClassSeat: 45, secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: 74, secondClassSeat: 55, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 55 },
      },
      {
        trainNo: 'D3011', trainType: 'D',
        departureStation: '上海虹桥', arrivalStation: '杭州东',
        departureTime: '10:30', arrivalTime: '11:40',
        duration: '1时10分', durationMinutes: 70,
        stops: ['上海虹桥', '杭州东'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: 119, secondClassSeat: 79, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 79 },
      },
      {
        trainNo: 'D123', trainType: 'D',
        departureStation: '上海虹桥', arrivalStation: '南京南',
        departureTime: '08:00', arrivalTime: '10:06',
        duration: '2时06分', durationMinutes: 126,
        stops: ['上海虹桥', '苏州北', '南京南'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: 147, secondClassSeat: 99, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 99 },
      },
      {
        trainNo: 'D3121', trainType: 'D',
        departureStation: '广州东', arrivalStation: '福州南',
        departureTime: '10:41', arrivalTime: '17:32',
        duration: '6时51分', durationMinutes: 411,
        stops: ['广州东', '厦门北', '福州南'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '--', secondClassSeat: 1, deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: null, secondClassSeat: 345, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 345 },
      },
      {
        trainNo: 'D2003', trainType: 'D',
        departureStation: '北京', arrivalStation: '天津',
        departureTime: '11:30', arrivalTime: '12:03',
        duration: '33分', durationMinutes: 33,
        stops: ['北京', '天津'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 74, secondClassSeat: 55, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 55 },
      },
      // === C Trains ===
      {
        trainNo: 'C2001', trainType: 'C',
        departureStation: '北京南', arrivalStation: '天津',
        departureTime: '07:30', arrivalTime: '08:00',
        duration: '30分', durationMinutes: 30,
        stops: ['北京南', '天津'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: 66, secondClassSeat: 55, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 55 },
      },
      {
        trainNo: 'C2003', trainType: 'C',
        departureStation: '北京南', arrivalStation: '天津',
        departureTime: '09:00', arrivalTime: '09:30',
        duration: '30分', durationMinutes: 30,
        stops: ['北京南', '天津'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: 66, secondClassSeat: 55, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 55 },
      },
      {
        trainNo: 'C2005', trainType: 'C',
        departureStation: '广州南', arrivalStation: '深圳北',
        departureTime: '08:00', arrivalTime: '08:31',
        duration: '31分', durationMinutes: 31,
        stops: ['广州南', '深圳北'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 78, secondClassSeat: 54, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 54 },
      },
      // === K Trains ===
      {
        trainNo: 'K101', trainType: 'K',
        departureStation: '北京', arrivalStation: '上海',
        departureTime: '21:15', arrivalTime: '11:43',
        duration: '14时28分', durationMinutes: 868,
        stops: ['北京', '天津', '济南', '南京', '苏州', '上海'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '--', secondClassSeat: '--', deluxeSoftSleeper: '--', softSleeper: 12, hardSleeper: '有', hardSeat: '有', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: null, secondClassSeat: null, deluxeSoftSleeper: null, softSleeper: 500, hardSleeper: 320, hardSeat: 180, noSeat: 143 },
      },
      {
        trainNo: 'K105', trainType: 'K',
        departureStation: '北京', arrivalStation: '上海',
        departureTime: '11:25', arrivalTime: '02:19',
        duration: '14时54分', durationMinutes: 894,
        stops: ['北京', '天津', '济南', '南京', '上海'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '--', secondClassSeat: '--', deluxeSoftSleeper: '--', softSleeper: '候补', hardSleeper: '有', hardSeat: '有', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: null, secondClassSeat: null, deluxeSoftSleeper: null, softSleeper: 500, hardSleeper: 320, hardSeat: 180, noSeat: 143 },
      },
      {
        trainNo: 'K157', trainType: 'K',
        departureStation: '北京西', arrivalStation: '广州',
        departureTime: '15:50', arrivalTime: '14:38',
        duration: '22时48分', durationMinutes: 1368,
        stops: ['北京西', '郑州', '武汉', '长沙', '广州'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '--', secondClassSeat: '--', deluxeSoftSleeper: '--', softSleeper: '有', hardSleeper: '有', hardSeat: '有', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: null, secondClassSeat: null, deluxeSoftSleeper: null, softSleeper: 680, hardSleeper: 440, hardSeat: 254, noSeat: 254 },
      },
      // === T Trains ===
      {
        trainNo: 'T109', trainType: 'T',
        departureStation: '北京', arrivalStation: '上海',
        departureTime: '19:33', arrivalTime: '08:44',
        duration: '13时11分', durationMinutes: 791,
        stops: ['北京', '天津', '济南', '南京', '上海'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '--', secondClassSeat: '--', deluxeSoftSleeper: '--', softSleeper: '有', hardSleeper: '有', hardSeat: '有', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: null, secondClassSeat: null, deluxeSoftSleeper: null, softSleeper: 480, hardSleeper: 308, hardSeat: 173, noSeat: 173 },
      },
      {
        trainNo: 'T31', trainType: 'T',
        departureStation: '北京西', arrivalStation: '武汉',
        departureTime: '17:24', arrivalTime: '05:09',
        duration: '11时45分', durationMinutes: 705,
        stops: ['北京西', '郑州', '武汉'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '--', secondClassSeat: '--', deluxeSoftSleeper: '--', softSleeper: 6, hardSleeper: '有', hardSeat: '有', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: null, secondClassSeat: null, deluxeSoftSleeper: null, softSleeper: 350, hardSleeper: 220, hardSeat: 120, noSeat: 120 },
      },
      // === Z Trains ===
      {
        trainNo: 'Z1', trainType: 'Z',
        departureStation: '北京', arrivalStation: '长沙',
        departureTime: '20:06', arrivalTime: '08:06',
        duration: '12时00分', durationMinutes: 720,
        stops: ['北京', '郑州', '武汉', '长沙'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '--', secondClassSeat: '--', deluxeSoftSleeper: 2, softSleeper: 8, hardSleeper: '有', hardSeat: '有', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: null, secondClassSeat: null, deluxeSoftSleeper: 780, softSleeper: 430, hardSleeper: 266, hardSeat: 126, noSeat: null },
      },
      {
        trainNo: 'Z9', trainType: 'Z',
        departureStation: '北京西', arrivalStation: '广州',
        departureTime: '18:00', arrivalTime: '09:24',
        duration: '15时24分', durationMinutes: 924,
        stops: ['北京西', '武汉', '长沙', '广州'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '--', secondClassSeat: '--', deluxeSoftSleeper: '有', softSleeper: '有', hardSleeper: '有', hardSeat: '有', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: null, secondClassSeat: null, deluxeSoftSleeper: 920, softSleeper: 650, hardSleeper: 430, hardSeat: 253, noSeat: null },
      },
      // === Additional routes ===
      {
        trainNo: 'G7502', trainType: 'G',
        departureStation: '杭州东', arrivalStation: '上海虹桥',
        departureTime: '08:00', arrivalTime: '08:55',
        duration: '0时55分', durationMinutes: 55,
        stops: ['杭州东', '上海虹桥'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 109, secondClassSeat: 73, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 73 },
      },
      {
        trainNo: 'G8601', trainType: 'G',
        departureStation: '成都东', arrivalStation: '重庆西',
        departureTime: '07:20', arrivalTime: '08:23',
        duration: '1时03分', durationMinutes: 63,
        stops: ['成都东', '重庆西'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 154, secondClassSeat: 96, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 96 },
      },
      {
        trainNo: 'G8603', trainType: 'G',
        departureStation: '成都东', arrivalStation: '重庆西',
        departureTime: '09:10', arrivalTime: '10:13',
        duration: '1时03分', durationMinutes: 63,
        stops: ['成都东', '重庆西'],
        seatAvailability: { businessSeat: '--', firstClassSeat: 22, secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 154, secondClassSeat: 96, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 96 },
      },
      {
        trainNo: 'D1701', trainType: 'D',
        departureStation: '西安北', arrivalStation: '成都东',
        departureTime: '08:00', arrivalTime: '11:40',
        duration: '3时40分', durationMinutes: 220,
        stops: ['西安北', '成都东'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: 350, secondClassSeat: 210, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 210 },
      },
      {
        trainNo: 'G2201', trainType: 'G',
        departureStation: '郑州东', arrivalStation: '西安北',
        departureTime: '07:50', arrivalTime: '09:45',
        duration: '1时55分', durationMinutes: 115,
        stops: ['郑州东', '西安北'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: 397, secondClassSeat: 244, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 244 },
      },
      {
        trainNo: 'G6002', trainType: 'G',
        departureStation: '深圳北', arrivalStation: '广州南',
        departureTime: '07:30', arrivalTime: '08:05',
        duration: '0时35分', durationMinutes: 35,
        stops: ['深圳北', '广州南'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '有' },
        prices: { businessSeat: null, firstClassSeat: 100, secondClassSeat: 75, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 75 },
      },
      {
        trainNo: 'G2801', trainType: 'G',
        departureStation: '昆明南', arrivalStation: '贵阳北',
        departureTime: '08:30', arrivalTime: '10:48',
        duration: '2时18分', durationMinutes: 138,
        stops: ['昆明南', '贵阳北'],
        seatAvailability: { businessSeat: '--', firstClassSeat: '有', secondClassSeat: '有', deluxeSoftSleeper: '--', softSleeper: '--', hardSleeper: '--', hardSeat: '--', noSeat: '无' },
        prices: { businessSeat: null, firstClassSeat: 324, secondClassSeat: 198, deluxeSoftSleeper: null, softSleeper: null, hardSleeper: null, hardSeat: null, noSeat: 198 },
      },
    ],

    passengers: [
      { id: 'psg_001', name: '张伟', idType: '身份证', idNumber: '110101199001011234', phone: '13812345678', passengerType: '成人', isDefault: true, seatPreference: '窗口' },
      { id: 'psg_002', name: '李娜', idType: '身份证', idNumber: '110102198505152345', phone: '13987654321', passengerType: '成人', isDefault: false, seatPreference: '过道' },
      { id: 'psg_003', name: '张明', idType: '身份证', idNumber: '110103200606060123', phone: '13711112222', passengerType: '学生', isDefault: false, seatPreference: '无偏好' },
      { id: 'psg_004', name: '王芳', idType: '身份证', idNumber: '110104196212121456', phone: '13622223333', passengerType: '成人', isDefault: false, seatPreference: '窗口' },
      { id: 'psg_005', name: '刘洋', idType: '身份证', idNumber: '110105198807073456', phone: '13533334444', passengerType: '成人', isDefault: false, seatPreference: '无偏好' },
      { id: 'psg_006', name: '陈静', idType: '身份证', idNumber: '310101199203034567', phone: '13644445555', passengerType: '成人', isDefault: false, seatPreference: '过道' },
      { id: 'psg_007', name: '张小明', idType: '身份证', idNumber: '110103201512125678', phone: '', passengerType: '儿童', isDefault: false, seatPreference: '无偏好' },
    ],

    orders: [
      {
        id: 'E202604101234',
        orderNo: 'E175946576458',
        status: '已支付',
        trainNo: 'G1', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureDate: '2026-04-15', departureTime: '09:00', arrivalTime: '13:28',
        duration: '4时28分',
        seatClass: '二等座', seatNo: '05车07A号',
        price: 553,
        passengers: [
          { passengerId: 'psg_001', name: '张伟', idType: '身份证', idNumber: '110101****1234', seatNo: '05车07A号', seatClass: '二等座', ticketPrice: 553, ticketStatus: '已出票' },
        ],
        createdAt: '2026-04-10T10:30:00',
        paidAt: '2026-04-10T10:31:00',
        canChange: true, canRefund: true,
      },
      {
        id: 'E202604052001',
        orderNo: 'E175946522001',
        status: '已支付',
        trainNo: 'D2001', trainType: 'D',
        departureStation: '北京', arrivalStation: '天津',
        departureDate: '2026-04-20', departureTime: '09:30', arrivalTime: '10:03',
        duration: '33分',
        seatClass: '一等座', seatNo: '03车12F号',
        price: 74,
        passengers: [
          { passengerId: 'psg_001', name: '张伟', idType: '身份证', idNumber: '110101****1234', seatNo: '03车12F号', seatClass: '一等座', ticketPrice: 74, ticketStatus: '已出票' },
        ],
        createdAt: '2026-04-05T14:20:00',
        paidAt: '2026-04-05T14:21:00',
        canChange: true, canRefund: true,
      },
      {
        id: 'E202604080071',
        orderNo: 'E175946570071',
        status: '待支付',
        trainNo: 'G71', trainType: 'G',
        departureStation: '北京西', arrivalStation: '深圳北',
        departureDate: '2026-04-25', departureTime: '08:30', arrivalTime: '16:30',
        duration: '8时00分',
        seatClass: '二等座', seatNo: '',
        price: 899,
        passengers: [
          { passengerId: 'psg_001', name: '张伟', idType: '身份证', idNumber: '110101****1234', seatNo: '', seatClass: '二等座', ticketPrice: 899, ticketStatus: '待出票' },
        ],
        createdAt: '2026-04-08T16:45:00',
        paidAt: null,
        canChange: false, canRefund: false,
      },
      {
        id: 'E202603200007',
        orderNo: 'E175836520007',
        status: '已完成',
        trainNo: 'G7', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureDate: '2026-03-20', departureTime: '07:00', arrivalTime: '11:40',
        duration: '4时40分',
        seatClass: '商务座', seatNo: '01车03A号',
        price: 1748,
        passengers: [
          { passengerId: 'psg_001', name: '张伟', idType: '身份证', idNumber: '110101****1234', seatNo: '01车03A号', seatClass: '商务座', ticketPrice: 1748, ticketStatus: '已完成' },
        ],
        createdAt: '2026-03-15T09:00:00',
        paidAt: '2026-03-15T09:01:00',
        canChange: false, canRefund: false,
      },
      {
        id: 'E202603153011',
        orderNo: 'E175826513011',
        status: '已完成',
        trainNo: 'D3011', trainType: 'D',
        departureStation: '上海虹桥', arrivalStation: '杭州东',
        departureDate: '2026-03-15', departureTime: '10:30', arrivalTime: '11:40',
        duration: '1时10分',
        seatClass: '二等座', seatNo: '04车08B号',
        price: 79,
        passengers: [
          { passengerId: 'psg_001', name: '张伟', idType: '身份证', idNumber: '110101****1234', seatNo: '04车08B号', seatClass: '二等座', ticketPrice: 79, ticketStatus: '已完成' },
          { passengerId: 'psg_002', name: '李娜', idType: '身份证', idNumber: '110102****2345', seatNo: '04车09B号', seatClass: '二等座', ticketPrice: 79, ticketStatus: '已完成' },
        ],
        createdAt: '2026-03-10T11:00:00',
        paidAt: '2026-03-10T11:01:00',
        canChange: false, canRefund: false,
      },
      {
        id: 'E202603100101',
        orderNo: 'E175816510101',
        status: '已退票',
        trainNo: 'K101', trainType: 'K',
        departureStation: '北京', arrivalStation: '上海',
        departureDate: '2026-03-10', departureTime: '21:15', arrivalTime: '11:43',
        duration: '14时28分',
        seatClass: '硬卧', seatNo: '06车中铺',
        price: 320,
        passengers: [
          { passengerId: 'psg_001', name: '张伟', idType: '身份证', idNumber: '110101****1234', seatNo: '06车中铺', seatClass: '硬卧', ticketPrice: 320, ticketStatus: '已退票' },
        ],
        createdAt: '2026-03-01T08:00:00',
        paidAt: '2026-03-01T08:01:00',
        canChange: false, canRefund: false,
      },
      {
        id: 'E202603050105',
        orderNo: 'E175806510105',
        status: '已改签',
        trainNo: 'G105', trainType: 'G',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureDate: '2026-03-05', departureTime: '16:00', arrivalTime: '21:00',
        duration: '5时00分',
        seatClass: '一等座', seatNo: '02车11F号',
        price: 933,
        passengers: [
          { passengerId: 'psg_001', name: '张伟', idType: '身份证', idNumber: '110101****1234', seatNo: '02车11F号', seatClass: '一等座', ticketPrice: 933, ticketStatus: '已改签' },
        ],
        createdAt: '2026-02-28T10:00:00',
        paidAt: '2026-02-28T10:01:00',
        canChange: false, canRefund: false,
      },
      {
        id: 'E202602280501',
        orderNo: 'E175796510501',
        status: '已取消',
        trainNo: 'G501', trainType: 'G',
        departureStation: '北京西', arrivalStation: '成都东',
        departureDate: '2026-02-28', departureTime: '09:00', arrivalTime: '16:45',
        duration: '7时45分',
        seatClass: '二等座', seatNo: '',
        price: 789,
        passengers: [
          { passengerId: 'psg_001', name: '张伟', idType: '身份证', idNumber: '110101****1234', seatNo: '', seatClass: '二等座', ticketPrice: 789, ticketStatus: '已取消' },
        ],
        createdAt: '2026-02-20T14:00:00',
        paidAt: null,
        canChange: false, canRefund: false,
      },
    ],

    waitlistOrders: [
      {
        id: 'WL20260410001',
        trainNo: 'G1305',
        departureStation: '北京南', arrivalStation: '上海虹桥',
        departureDate: '2026-05-01',
        seatClass: '二等座',
        passengers: ['张伟', '李娜'],
        status: '待兑现',
        depositAmount: 1106,
        createdAt: '2026-04-10T14:00:00',
        deadline: '2026-04-30T18:00:00',
      },
      {
        id: 'WL20260320001',
        trainNo: 'G71',
        departureStation: '北京西', arrivalStation: '深圳北',
        departureDate: '2026-04-01',
        seatClass: '一等座',
        passengers: ['张伟'],
        status: '已兑现',
        depositAmount: 1483,
        createdAt: '2026-03-20T10:00:00',
        deadline: '2026-03-31T18:00:00',
      },
    ],

    searchHistory: [
      { id: 'sh_001', from: '北京', to: '上海', date: '2026-04-15', timestamp: '2026-04-10T09:00:00' },
      { id: 'sh_002', from: '北京', to: '深圳', date: '2026-04-25', timestamp: '2026-04-08T16:40:00' },
      { id: 'sh_003', from: '上海', to: '杭州', date: '2026-04-20', timestamp: '2026-03-10T11:00:00' },
      { id: 'sh_004', from: '广州', to: '深圳', date: '2026-04-18', timestamp: '2026-03-25T15:00:00' },
      { id: 'sh_005', from: '北京', to: '成都', date: '2026-04-22', timestamp: '2026-02-20T14:00:00' },
    ],

    notifications: [
      {
        id: 'notif_001', type: 'departure_reminder',
        title: '出行提醒',
        content: '您的G1次列车将于明天09:00从北京南站出发，请提前1小时到站。',
        read: false,
        createdAt: '2026-04-14T18:00:00',
        relatedOrderId: 'E202604101234',
      },
      {
        id: 'notif_002', type: 'order_status',
        title: '待支付提醒',
        content: '您有一张G71次列车（北京西→深圳北）的订单尚未支付，请在30分钟内完成支付。',
        read: false,
        createdAt: '2026-04-08T16:45:00',
        relatedOrderId: 'E202604080071',
      },
      {
        id: 'notif_003', type: 'order_status',
        title: '候补订单更新',
        content: 'G1305次列车候补订单（北京南→上海虹桥）已进入匹配队列，如有座位将自动购票。',
        read: true,
        createdAt: '2026-04-10T15:00:00',
        relatedOrderId: null,
      },
      {
        id: 'notif_004', type: 'order_status',
        title: '行程已完成',
        content: '您乘坐G7次列车（北京南→上海虹桥）的行程已完成，感谢您乘坐中国铁路。',
        read: true,
        createdAt: '2026-03-20T12:00:00',
        relatedOrderId: 'E202603200007',
      },
    ],

    currentSearch: {
      from: '北京',
      to: '上海',
      date: '2026-04-15',
      isStudent: false,
      isHighSpeedOnly: false,
      tripType: 'oneWay',
      returnDate: null,
    },

    selectedTrain: null,
    selectedSeatClass: null,
    selectedPassengers: [],

    searchFilters: {
      timeRanges: [],
      trainTypes: [],
      sortBy: 'departureTime',
      sortDir: 'asc',
    },
  };
}

export function loadState(sid = null) {
  const key = storageKey(sid);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState(state, sid = null) {
  const key = storageKey(sid);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn('saveState failed:', e);
  }
  if (sid) {
    fetch(`/post?sid=${encodeURIComponent(sid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state }),
    }).catch(() => {});
  }
}

export function initializeData(sid = null, customState = null) {
  const defaultData = createInitialData();
  const merged = customState && Object.keys(customState).length > 0
    ? deepMerge(defaultData, customState)
    : defaultData;

  const stateKey = storageKey(sid);
  const initKey = initialKey(sid);

  const isFirstLoad = !localStorage.getItem(initKey);
  if (isFirstLoad) {
    localStorage.setItem(initKey, JSON.stringify(merged));
    const effectiveSid = sid || 'default';
    fetch(`/post?sid=${encodeURIComponent(effectiveSid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: merged }),
    }).catch(() => {});
  }

  const existing = loadState(sid);
  if (existing) {
    return existing;
  }

  localStorage.setItem(stateKey, JSON.stringify(merged));
  return merged;
}
