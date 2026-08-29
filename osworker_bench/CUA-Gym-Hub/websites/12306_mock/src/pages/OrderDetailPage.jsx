import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './OrderDetailPage.css';

const STATUS_COLORS = {
  '已支付': { bg: '#f6ffed', border: '#b7eb8f', text: '#52C41A', icon: '✓' },
  '待支付': { bg: '#fff7e6', border: '#ffd591', text: '#fa8c16', icon: '⏱' },
  '已完成': { bg: '#f5f5f5', border: '#d9d9d9', text: '#8c8c8c', icon: '✓' },
  '已退票': { bg: '#fff1f0', border: '#ffa39e', text: '#f5222d', icon: '✕' },
  '已改签': { bg: '#e6f7ff', border: '#91d5ff', text: '#1890ff', icon: '↔' },
  '已取消': { bg: '#f5f5f5', border: '#d9d9d9', text: '#8c8c8c', icon: '✕' },
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const showPayment = searchParams.get('payment') === '1';
  const { state, updateState, showToast } = useApp();
  const navigate = useNavigate();
  const [paymentView, setPaymentView] = useState(showPayment);
  const [countdown, setCountdown] = useState(30 * 60);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('支付宝');

  const order = state.orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (!paymentView) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentView]);

  if (!order) {
    return (
      <div className="order-detail-page">
        <Header />
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
          订单不存在
          <br />
          <button className="back-btn" onClick={() => navigate('/orders')} style={{ marginTop: 16 }}>
            返回订单列表
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmPayment = () => {
    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: '已支付', paidAt: new Date().toISOString(), canChange: true, canRefund: true,
              passengers: o.passengers.map((p) => ({ ...p, ticketStatus: '已出票' })) }
          : o
      ),
    }));
    setPaymentView(false);
    showToast('支付成功！', 'success');
  };

  const handleCancelOrder = () => {
    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, status: '已取消', canChange: false, canRefund: false } : o
      ),
    }));
    showToast('订单已取消', 'info');
    navigate('/orders');
  };

  const handleRefund = () => {
    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, status: '已退票', canChange: false, canRefund: false,
            passengers: o.passengers.map((p) => ({ ...p, ticketStatus: '已退票' })) } : o
      ),
    }));
    setShowRefundDialog(false);
    showToast('退票申请已提交', 'success');
  };

  const handleBuyAgain = () => {
    navigate(`/search?from=${encodeURIComponent(order.departureStation)}&to=${encodeURIComponent(order.arrivalStation)}&date=${order.departureDate}`);
  };

  const handleChange = () => {
    // Find alternative trains on the same route
    const altTrains = state.trains.filter(
      (t) => t.departureStation === order.departureStation &&
             t.arrivalStation === order.arrivalStation &&
             t.trainNo !== order.trainNo
    );
    if (altTrains.length === 0) {
      showToast('暂无可改签的车次', 'warning');
      return;
    }
    const newTrain = altTrains[0];
    const changeFee = Math.floor(order.price * 0.05);
    const priceDiff = (newTrain.prices.secondClassSeat || newTrain.prices.firstClassSeat || 0) - order.price;

    updateState((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: '已改签',
              canChange: false,
              canRefund: false,
              passengers: o.passengers.map((p) => ({ ...p, ticketStatus: '已改签' })),
            }
          : o
      ),
    }));

    // Create a new order for the changed train
    const newOrderId = `E${Date.now()}`;
    const newOrderNo = `E${Math.floor(Math.random() * 9e11 + 1e11)}`;
    const seatNumbers = ['A', 'B', 'C', 'D', 'F'];
    const carNo = Math.floor(Math.random() * 15) + 1;
    const seatNo = Math.floor(Math.random() * 20) + 1;

    const newOrder = {
      id: newOrderId,
      orderNo: newOrderNo,
      status: '已支付',
      trainNo: newTrain.trainNo,
      trainType: newTrain.trainType,
      departureStation: newTrain.departureStation,
      arrivalStation: newTrain.arrivalStation,
      departureDate: order.departureDate,
      departureTime: newTrain.departureTime,
      arrivalTime: newTrain.arrivalTime,
      duration: newTrain.duration,
      seatClass: order.seatClass,
      seatNo: '',
      price: order.price,
      passengers: order.passengers.map((p, i) => ({
        ...p,
        seatNo: `${String(carNo).padStart(2, '0')}车${String(seatNo + i).padStart(2, '0')}${seatNumbers[i % 5]}号`,
        ticketStatus: '已出票',
      })),
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      canChange: true,
      canRefund: true,
    };

    updateState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
    }));

    setShowChangeDialog(false);
    showToast(`改签成功！已改签至${newTrain.trainNo}次`, 'success');
    navigate(`/orders/${newOrderId}`);
  };

  const today = new Date().toISOString().split('T')[0];
  const isFuture = order.departureDate >= today;
  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS['已完成'];

  const countdownMins = Math.floor(countdown / 60);
  const countdownSecs = countdown % 60;

  // Refund fee calculation
  const daysUntil = Math.floor((new Date(order.departureDate) - new Date()) / (1000 * 86400));
  const refundFee = daysUntil >= 8 ? 0 : daysUntil >= 2 ? 5 : daysUntil >= 1 ? 10 : 20;
  const totalPrice = order.price * order.passengers.length;
  const refundAmount = Math.floor(totalPrice * (1 - refundFee / 100));

  if (paymentView) {
    return (
      <div className="order-detail-page">
        <Header />
        <div className="payment-content container">
          <div className="payment-card">
            <h2 className="payment-title">订单支付</h2>
            <div className="payment-timer">
              <span className="timer-icon">⏱</span>
              剩余支付时间：
              <span className="timer-value">{String(countdownMins).padStart(2, '0')}:{String(countdownSecs).padStart(2, '0')}</span>
            </div>

            <div className="payment-summary">
              <div className="payment-row">
                <span>车次</span>
                <span>{order.trainNo} {order.departureStation} → {order.arrivalStation}</span>
              </div>
              <div className="payment-row">
                <span>出发时间</span>
                <span>{order.departureDate} {order.departureTime}</span>
              </div>
              <div className="payment-row">
                <span>乘客</span>
                <span>{order.passengers.map((p) => p.name).join('、')}</span>
              </div>
              <div className="payment-row total-row">
                <span>应付总额</span>
                <span className="payment-total">¥{totalPrice}</span>
              </div>
            </div>

            <div className="payment-methods">
              <h4>选择支付方式</h4>
              <div className="payment-method-list">
                {['支付宝', '微信支付', '银联'].map((method) => (
                  <div
                    key={method}
                    className={`payment-method-card${selectedPaymentMethod === method ? ' selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod(method)}
                    style={{
                      cursor: 'pointer',
                      border: selectedPaymentMethod === method ? '2px solid #1677ff' : '2px solid #e8e8e8',
                      background: selectedPaymentMethod === method ? '#e6f4ff' : '#fff',
                      borderRadius: 8,
                      padding: '12px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                  >
                    <span className="payment-method-icon">
                      {method === '支付宝' ? '💙' : method === '微信支付' ? '💚' : '❤️'}
                    </span>
                    <span>{method}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="confirm-payment-btn" onClick={handleConfirmPayment}>
              确认支付 ¥{totalPrice}
            </button>
            <div className="cancel-order-link" onClick={handleCancelOrder}>取消订单</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <Header />
      <div className="detail-content container">
        {/* Status banner */}
        <div
          className="status-banner"
          style={{ background: statusStyle.bg, borderColor: statusStyle.border, color: statusStyle.text }}
        >
          <span className="status-icon">{statusStyle.icon}</span>
          <span className="status-text">{order.status}</span>
          {order.status === '待支付' && (
            <span className="status-sub">请在30分钟内完成支付</span>
          )}
        </div>

        {/* Train info card */}
        <div className="detail-train-card">
          <div className="detail-date">{order.departureDate} 发车</div>
          <div className="detail-route">
            <div className="detail-station">
              <div className="detail-time">{order.departureTime}</div>
              <div className="detail-station-name">{order.departureStation}</div>
            </div>
            <div className="detail-center">
              <span className={`train-badge ${order.trainType}`}>{order.trainType}</span>
              <div className="detail-train-no">{order.trainNo}</div>
              <div className="detail-duration">{order.duration}</div>
            </div>
            <div className="detail-station">
              <div className="detail-time">{order.arrivalTime}</div>
              <div className="detail-station-name">{order.arrivalStation}</div>
            </div>
          </div>
        </div>

        {/* Passenger table */}
        <div className="detail-section">
          <h3 className="detail-section-title">乘车人信息</h3>
          <table className="passenger-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>证件类型</th>
                <th>证件号码</th>
                <th>席别</th>
                <th>座位号</th>
                <th>票价</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {order.passengers.map((p, i) => (
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.idType}</td>
                  <td>{p.idNumber}</td>
                  <td>{p.seatClass}</td>
                  <td>{p.seatNo || '--'}</td>
                  <td>¥{p.ticketPrice}</td>
                  <td>{p.ticketStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order info */}
        <div className="detail-section">
          <h3 className="detail-section-title">订单信息</h3>
          <div className="order-info-grid">
            <div className="info-item"><span className="info-key">订单编号</span><span className="info-val">{order.orderNo}</span></div>
            <div className="info-item"><span className="info-key">下单时间</span><span className="info-val">{order.createdAt.replace('T', ' ').slice(0, 16)}</span></div>
            <div className="info-item"><span className="info-key">支付时间</span><span className="info-val">{order.paidAt ? order.paidAt.replace('T', ' ').slice(0, 16) : '未支付'}</span></div>
            <div className="info-item"><span className="info-key">总金额</span><span className="info-val price-red">¥{order.price * order.passengers.length}</span></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="detail-actions">
          <button className="action-back" onClick={() => navigate('/orders')}>← 返回订单列表</button>

          {order.status === '待支付' && (
            <>
              <button className="action-pay" onClick={() => setPaymentView(true)}>去支付</button>
              <button className="action-cancel" onClick={handleCancelOrder}>取消订单</button>
            </>
          )}

          {order.status === '已支付' && isFuture && (
            <>
              <button className="action-change" onClick={() => setShowChangeDialog(true)}>改签</button>
              <button className="action-refund" onClick={() => setShowRefundDialog(true)}>退票</button>
            </>
          )}

          {order.status === '已完成' && (
            <button className="action-buy-again" onClick={handleBuyAgain}>再次购买</button>
          )}
        </div>
      </div>

      {/* Refund dialog */}
      {showRefundDialog && (
        <div className="modal-overlay" onClick={() => setShowRefundDialog(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">确认退票</h3>
            <div className="refund-info">
              <div>距出发日期：{daysUntil >= 0 ? `${daysUntil}天` : '已过期'}</div>
              <div>退票手续费：{refundFee}%</div>
              <div>原票价：¥{totalPrice}</div>
              <div className="refund-amount">实际退款：<strong>¥{refundAmount}</strong></div>
            </div>
            <div className="modal-actions">
              <button className="modal-confirm" onClick={handleRefund}>确认退票</button>
              <button className="modal-cancel" onClick={() => setShowRefundDialog(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Change dialog */}
      {showChangeDialog && (
        <div className="modal-overlay" onClick={() => setShowChangeDialog(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">确认改签</h3>
            <div className="refund-info">
              <div>原车次：{order.trainNo} ({order.departureStation} → {order.arrivalStation})</div>
              <div>出发时间：{order.departureDate} {order.departureTime}</div>
              <div>改签说明：系统将为您自动匹配同线路最近可用车次</div>
              <div style={{ marginTop: 8, color: '#fa8c16', fontSize: 13 }}>
                改签手续费：¥{Math.floor(totalPrice * 0.05)}（5%）
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: '#666' }}>
                改签后原车票作废，新车票自动出票
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-confirm" onClick={handleChange}>确认改签</button>
              <button className="modal-cancel" onClick={() => setShowChangeDialog(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
