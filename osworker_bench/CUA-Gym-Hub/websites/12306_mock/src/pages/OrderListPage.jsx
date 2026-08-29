import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './OrderListPage.css';

const STATUS_CLASS = {
  '已支付': 'status-paid',
  '待支付': 'status-pending',
  '已完成': 'status-done',
  '已退票': 'status-refunded',
  '已改签': 'status-changed',
  '已取消': 'status-cancelled',
};

export default function OrderListPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  const today = new Date().toISOString().split('T')[0];

  const upcoming = state.orders.filter((o) =>
    (o.status === '已支付' || o.status === '待支付') && o.departureDate >= today
  );

  const history = state.orders.filter((o) =>
    !upcoming.includes(o)
  );

  const orders = activeTab === 'upcoming' ? upcoming : history;

  return (
    <div className="order-list-page">
      <Header activePage="tickets" />
      <div className="order-content container">
        <div className="order-card-wrap">
          {/* Tabs */}
          <div className="order-tabs">
            <button
              className={`order-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              未出行订单
              {upcoming.length > 0 && <span className="tab-count">{upcoming.length}</span>}
            </button>
            <button
              className={`order-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              历史订单
            </button>
          </div>

          {/* Order list */}
          <div className="order-list">
            {orders.length === 0 ? (
              <div className="order-empty">
                <div className="order-empty-icon">📋</div>
                <div>暂无{activeTab === 'upcoming' ? '未出行' : '历史'}订单</div>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-train-info">
                      <span className={`train-badge ${order.trainType}`}>{order.trainType}</span>
                      <span className="order-train-no">{order.trainNo}</span>
                      <span className="order-route">{order.departureStation} → {order.arrivalStation}</span>
                    </div>
                    <span className={`status-badge ${STATUS_CLASS[order.status] || 'status-done'}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-card-body">
                    <div className="order-info-row">
                      <span className="order-info-label">订单号：</span>
                      <span className="order-info-value">{order.orderNo}</span>
                    </div>
                    <div className="order-info-row">
                      <span className="order-info-label">出发时间：</span>
                      <span className="order-info-value">{order.departureDate} {order.departureTime}开</span>
                    </div>
                    <div className="order-info-row">
                      <span className="order-info-label">席别：</span>
                      <span className="order-info-value">{order.seatClass}</span>
                    </div>
                    <div className="order-info-row">
                      <span className="order-info-label">总票数：</span>
                      <span className="order-info-value">{order.passengers.length}张</span>
                    </div>
                    <div className="order-info-row">
                      <span className="order-info-label">总金额：</span>
                      <span className="order-price">¥{order.price * order.passengers.length}</span>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <button
                      className="view-detail-btn"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      查看详情
                    </button>
                    {order.status === '待支付' && (
                      <button className="pay-btn" onClick={() => navigate(`/orders/${order.id}?payment=1`)}>
                        去支付
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
