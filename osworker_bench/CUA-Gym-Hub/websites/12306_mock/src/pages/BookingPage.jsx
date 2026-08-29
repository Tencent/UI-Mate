import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './BookingPage.css';

const SEAT_CLASS_NAMES = {
  businessSeat: '商务座',
  firstClassSeat: '一等座',
  secondClassSeat: '二等座',
  premierSeat: '特等座',
  softSleeper: '软卧',
  hardSleeper: '硬卧',
  hardSeat: '硬座',
  noSeat: '无座',
  deluxeSoftSleeper: '高级软卧',
};

const SEAT_ORDER = ['businessSeat', 'firstClassSeat', 'secondClassSeat', 'deluxeSoftSleeper', 'softSleeper', 'hardSleeper', 'hardSeat', 'noSeat'];

export default function BookingPage() {
  const { trainNo } = useParams();
  const { state, updateState, showToast } = useApp();
  const navigate = useNavigate();

  const train = state.trains.find((t) => t.trainNo === trainNo) || state.selectedTrain;

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedPsgIds, setSelectedPsgIds] = useState([]);
  const [seatPrefs, setSeatPrefs] = useState({});
  const [contactPhone, setContactPhone] = useState(state.user.phone || '');

  useEffect(() => {
    if (!train) return;
    // Auto-select first available class
    const avail = train.seatAvailability;
    const first = Object.keys(avail).find((k) => avail[k] !== '--' && avail[k] !== '无');
    if (first && !selectedClass) setSelectedClass(first);
  }, [train]);

  if (!train) {
    return (
      <div className="booking-page">
        <Header />
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
          未找到列车信息，请返回搜索页面重新选择。
        </div>
      </div>
    );
  }

  const availableClasses = SEAT_ORDER
    .filter((k) => train.seatAvailability[k] !== '--' && train.seatAvailability[k] !== undefined)
    .map((k) => ({ key: k, value: train.seatAvailability[k], price: train.prices[k], name: SEAT_CLASS_NAMES[k] }));

  const togglePassenger = (id) => {
    if (selectedPsgIds.includes(id)) {
      setSelectedPsgIds((prev) => prev.filter((p) => p !== id));
    } else {
      if (selectedPsgIds.length >= 5) {
        showToast('最多可选择5名乘客', 'warning');
        return;
      }
      setSelectedPsgIds((prev) => [...prev, id]);
    }
  };

  const setSeatPref = (psgId, pref) => {
    setSeatPrefs((prev) => ({ ...prev, [psgId]: pref }));
  };

  const isHighSpeed = ['G', 'D', 'C'].includes(train.trainType);

  const handleSubmit = () => {
    if (!selectedClass) { showToast('请选择座位等级', 'warning'); return; }
    if (selectedPsgIds.length === 0) { showToast('请选择至少一名乘客', 'warning'); return; }

    const selectedPassengers = state.passengers.filter((p) => selectedPsgIds.includes(p.id));
    const price = train.prices[selectedClass];
    const className = SEAT_CLASS_NAMES[selectedClass];

    const seatNumbers = ['A', 'B', 'C', 'D', 'F'];
    const carNo = Math.floor(Math.random() * 15) + 1;
    const seatNo = Math.floor(Math.random() * 20) + 1;

    const orderId = `E${Date.now()}`;
    const orderNo = `E${Math.floor(Math.random() * 9e11 + 1e11)}`;

    const newOrder = {
      id: orderId,
      orderNo,
      status: '待支付',
      trainNo: train.trainNo,
      trainType: train.trainType,
      departureStation: train.departureStation,
      arrivalStation: train.arrivalStation,
      departureDate: train.date || state.currentSearch.date,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      duration: train.duration,
      seatClass: className,
      seatNo: '',
      price,
      passengers: selectedPassengers.map((p, i) => ({
        passengerId: p.id,
        name: p.name,
        idType: p.idType,
        idNumber: p.idNumber.replace(/(\d{6})\d{8}(\d{4})/, '$1****$2'),
        seatNo: `${String(carNo).padStart(2, '0')}车${String(seatNo + i).padStart(2, '0')}${seatNumbers[i % 5]}号`,
        seatClass: className,
        ticketPrice: price,
        ticketStatus: '待出票',
      })),
      createdAt: new Date().toISOString(),
      paidAt: null,
      canChange: false,
      canRefund: false,
    };

    updateState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      selectedTrain: train,
      selectedSeatClass: selectedClass,
      selectedPassengers: selectedPsgIds,
    }));

    navigate(`/orders/${orderId}?payment=1`);
  };

  return (
    <div className="booking-page">
      <Header activePage="tickets" />
      <div className="booking-content container">

        {/* Train info header card */}
        <div className="train-header-card">
          <div className="train-header-date">{train.date || state.currentSearch.date} 发车</div>
          <div className="train-header-route">
            <div className="route-station">
              <div className="route-time">{train.departureTime}</div>
              <div className="route-name">{train.departureStation}</div>
            </div>
            <div className="route-center">
              <span className={`train-badge ${train.trainType}`}>{train.trainType}</span>
              <div className="route-train-no">{train.trainNo}</div>
              <div className="route-duration">{train.duration}</div>
            </div>
            <div className="route-station">
              <div className="route-time">{train.arrivalTime}</div>
              <div className="route-name">{train.arrivalStation}</div>
            </div>
          </div>
        </div>

        {/* Seat class selector */}
        <div className="booking-section">
          <h3 className="section-title">选择座位等级</h3>
          <div className="seat-class-list">
            {availableClasses.map(({ key, value, price, name }) => (
              <div
                key={key}
                className={`seat-class-card ${selectedClass === key ? 'selected' : ''} ${value === '无' ? 'unavail' : ''}`}
                onClick={() => value !== '无' && setSelectedClass(key)}
              >
                <div className="seat-class-name">{name}</div>
                <div className="seat-class-avail">
                  {value === '无' ? <span className="avail-gray">已售完</span> :
                   value === '候补' ? <span className="avail-orange">候补</span> :
                   value === '有' ? <span className="avail-green">有票</span> :
                   <span className="avail-green">{value}张</span>}
                </div>
                {price && <div className="seat-class-price">¥{price}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Passenger selection */}
        <div className="booking-section">
          <div className="section-header">
            <h3 className="section-title">选择乘车人</h3>
            <span className="section-hint">已选 {selectedPsgIds.length}/5 人</span>
          </div>
          <div className="passenger-list">
            {state.passengers.map((p) => (
              <label key={p.id} className={`passenger-row ${selectedPsgIds.includes(p.id) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedPsgIds.includes(p.id)}
                  onChange={() => togglePassenger(p.id)}
                />
                <div className="passenger-info">
                  <span className="passenger-name">{p.name}</span>
                  <span className="passenger-id">{p.idType} {p.idNumber.replace(/(\d{6})\d{8}(\d{4})/, '$1****$2')}</span>
                  <span className={`passenger-type type-${p.passengerType}`}>{p.passengerType}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="add-passenger-link" onClick={() => navigate('/passengers')}>
            + 添加乘车人
          </div>

          {/* Seat preference for selected passengers (G/D only) */}
          {isHighSpeed && selectedPsgIds.length > 0 && (
            <div className="seat-pref-section">
              <h4 className="seat-pref-title">座位偏好</h4>
              {state.passengers.filter((p) => selectedPsgIds.includes(p.id)).map((p) => (
                <div key={p.id} className="seat-pref-row">
                  <span className="seat-pref-name">{p.name}</span>
                  <div className="seat-pref-options">
                    {['窗口', '过道', '无偏好'].map((pref) => (
                      <label key={pref} className="pref-radio">
                        <input
                          type="radio"
                          name={`pref_${p.id}`}
                          checked={(seatPrefs[p.id] || '无偏好') === pref}
                          onChange={() => setSeatPref(p.id, pref)}
                        />
                        {pref}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="booking-section">
          <h3 className="section-title">联系方式</h3>
          <div className="contact-row">
            <label className="contact-label">联系手机</label>
            <input
              className="contact-input"
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="请输入手机号"
            />
            <span className="contact-hint">（号码变更不会保存）</span>
            <label className="contact-check">
              <input type="checkbox" defaultChecked />
              接收购票信息
            </label>
          </div>
        </div>

        {/* Price summary */}
        {selectedClass && selectedPsgIds.length > 0 && (
          <div className="price-summary">
            <span className="price-label">合计：</span>
            <span className="price-total">¥{(train.prices[selectedClass] || 0) * selectedPsgIds.length}</span>
            <span className="price-hint">（{selectedPsgIds.length}人 × ¥{train.prices[selectedClass]}）</span>
          </div>
        )}

        {/* Submit button */}
        <button className="submit-order-btn" onClick={handleSubmit}>
          提交订单
        </button>
      </div>
    </div>
  );
}
