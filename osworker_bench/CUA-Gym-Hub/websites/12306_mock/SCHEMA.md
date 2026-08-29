# 12306_mock Schema

**Base URL**: `http://localhost:5173/`
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → current state object

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Logged-in user: `{id, name, username, idType, idNumber, phone, email, memberLevel, memberPoints}` |
| `stations` | array | 30 railway stations; each: `{code, name, fullName, pinyin, initial, isHighSpeed}` |
| `trains` | array | 45+ train services; each: `{trainNo, trainType, departureStation, arrivalStation, departureTime, arrivalTime, duration, durationMinutes, date, stops[], seatAvailability{}, prices{}}` |
| `passengers` | array | Saved passenger profiles; each: `{id, name, idType, idNumber, phone, passengerType, isDefault, seatPreference}` |
| `orders` | array | All orders (all statuses); each: `{id, orderNo, status, trainNo, trainType, departureStation, arrivalStation, departureDate, departureTime, arrivalTime, duration, seatClass, seatNo, price, passengers[], createdAt, paidAt, canChange, canRefund}` |
| `waitlistOrders` | array | Waitlist (候补) orders; each: `{id, trainNo, departureStation, arrivalStation, departureDate, seatClass, passengers[], status, depositAmount, createdAt, deadline}` |
| `searchHistory` | array | Recent search pairs; each: `{id, from, to, date, timestamp}` — max 5, newest first |
| `notifications` | array | System notifications; each: `{id, type, title, content, read, createdAt, relatedOrderId}` |
| `currentSearch` | object | Active search form values: `{from, to, date, isStudent, isHighSpeedOnly, tripType, returnDate}` |
| `selectedTrain` | object\|null | Train selected for booking (full train object) — set when navigating to `/booking/:trainNo` |
| `selectedSeatClass` | string\|null | Seat class key selected in booking (e.g., `"secondClassSeat"`) |
| `selectedPassengers` | array | IDs of passengers selected for current booking |
| `searchFilters` | object | Search filter state: `{timeRanges[], trainTypes[], sortBy, sortDir}` — currently not persisted from UI |

### Train seatAvailability keys
Each train has these keys in `seatAvailability` and `prices`:
`businessSeat` (商务座), `firstClassSeat` (一等座), `secondClassSeat` (二等座), `premierSeat` (特等座), `softSleeper` (软卧), `hardSleeper` (硬卧), `hardSeat` (硬座), `noSeat` (无座), `deluxeSoftSleeper` (高级软卧)

Values in `seatAvailability`: `"--"` (not applicable), `"无"` (sold out), `"候补"` (waitlist), `"有"` (available, count unknown), or integer (specific count).

### Order status values
`"待支付"` (pending payment), `"已支付"` (paid), `"已完成"` (completed), `"已退票"` (refunded), `"已改签"` (changed), `"已取消"` (cancelled)

### Waitlist order status values
`"待支付"` (deposit pending), `"待兑现"` (waiting for match), `"已兑现"` (fulfilled), `"已退单"` (cancelled), `"兑现失败"` (failed)

### Default IDs

**User**: `user_001` (张伟)

**Passengers**: `psg_001` (张伟), `psg_002` (李娜), `psg_003` (张明), `psg_004` (王芳), `psg_005` (刘洋)

**Orders**:
- `E202604101234` — 已支付, G1 北京南→上海虹桥, 2026-04-15
- `E202604121001` — 已支付, G13 北京南→上海虹桥, 2026-04-20
- `E202604052001` — 已支付, D2001 北京西→武汉, 2026-04-20
- `E202604050071` — 已支付, C2001 北京南→天津, 2026-04-20
- `E202604080071` — 待支付, G71 北京西→深圳北, 2026-04-25
- `E202603200007` — 已完成, G7 北京南→上海虹桥, 2026-03-20
- `E202603153011` — 已完成, D3011 上海虹桥→杭州东, 2026-03-15
- `E202603100101` — 已退票, K101 北京→上海, 2026-03-10
- `E202603050105` — 已改签, G105

**Waitlist orders**: `WL20260410001` (待兑现), `WL20260320001` (已兑现)

**Search history**: `sh_001` through `sh_005`

**Notifications**: `notif_001` (unread), `notif_002` (unread), `notif_003` (read), `notif_004` (read)

**Key trains (北京南→上海虹桥)**: G1, G7, G11, G13, G15, G17, G19, G21, G25, G27, G29, G31, G101, G103, G105

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "user": {
      "id": "user_001",
      "name": "张伟",
      "username": "zhangwei2024",
      "idType": "身份证",
      "idNumber": "110101199001011234",
      "phone": "138****5678",
      "email": "zhangwei@example.com",
      "memberLevel": "普通会员",
      "memberPoints": 2680
    },
    "passengers": [
      {
        "id": "psg_001",
        "name": "张伟",
        "idType": "身份证",
        "idNumber": "110101199001011234",
        "phone": "13812345678",
        "passengerType": "成人",
        "isDefault": true,
        "seatPreference": "窗口"
      }
    ],
    "orders": [],
    "waitlistOrders": [],
    "searchHistory": [],
    "notifications": [],
    "currentSearch": {
      "from": "北京",
      "to": "上海",
      "date": "2026-04-15",
      "isStudent": false,
      "isHighSpeedOnly": false,
      "tripType": "oneWay",
      "returnDate": null
    },
    "selectedTrain": null,
    "selectedSeatClass": null,
    "selectedPassengers": [],
    "searchFilters": {
      "timeRanges": [],
      "trainTypes": [],
      "sortBy": "departureTime",
      "sortDir": "asc"
    }
  }
}
```

> Omit `stations` and `trains` arrays in inject payloads to use default seed data — they are large and rarely need overriding.

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Search for trains (click 查询) | `currentSearch.{from,to,date,isStudent,isHighSpeedOnly}` updated; `searchHistory` gains new entry (max 5, deduped by from+to) |
| Click recent search chip on homepage | `currentSearch` updated (via UI state only — `updateState` not called until 查询 is clicked) |
| Swap departure/arrival stations on homepage | UI state only (no state update until 查询 is clicked) |
| Click "预订" on a train in search results | `selectedTrain` set to full train object; `selectedSeatClass` → null; `selectedPassengers` → [] |
| Submit booking (click 提交订单) | `orders` array gains new order with status `"待支付"`; `selectedTrain`, `selectedSeatClass`, `selectedPassengers` updated |
| Confirm payment (click 确认支付) | `orders[i].status` → `"已支付"`; `orders[i].paidAt` set to ISO timestamp; `orders[i].canChange` → true; `orders[i].canRefund` → true; all `orders[i].passengers[j].ticketStatus` → `"已出票"` |
| Cancel order (click 取消订单) | `orders[i].status` → `"已取消"`; `orders[i].canChange` → false; `orders[i].canRefund` → false |
| Confirm refund (click 确认退票) | `orders[i].status` → `"已退票"`; `orders[i].canChange` → false; `orders[i].canRefund` → false; all `orders[i].passengers[j].ticketStatus` → `"已退票"` |
| Click 改签 button on paid order | Shows "功能开发中" toast — no state change (feature not implemented) |
| Add passenger | `passengers` array gains new entry with generated `id: "psg_<timestamp>"` |
| Edit passenger | `passengers[i]` updated in-place (matched by id) |
| Delete passenger | `passengers` array loses matching entry |
| Cancel waitlist order (click 取消候补) | `waitlistOrders[i].status` → `"已退单"` |
| Mark all notifications read (click 全部已读) | all `notifications[j].read` → true |
| Click individual notification | `notifications[i].read` → true |
| Navigate date on search results (前一天/后一天) | UI-local `currentDate` state only — no AppContext state change |
| Toggle train type filter | UI-local `trainTypes` state only — no AppContext state change |
| Toggle time range filter | UI-local `timeRanges` state only — no AppContext state change |
