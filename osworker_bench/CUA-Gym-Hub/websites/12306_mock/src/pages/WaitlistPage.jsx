import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

const STATUS_CLASS = {
  '待支付': 'status-pending',
  '待兑现': 'status-changed',
  '已兑现': 'status-paid',
  '已退单': 'status-cancelled',
  '兑现失败': 'status-refunded',
};

export default function WaitlistPage() {
  const { state, updateState, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('active');

  const active = state.waitlistOrders.filter((w) => w.status === '待支付' || w.status === '待兑现');
  const done = state.waitlistOrders.filter((w) => !active.includes(w));

  const orders = activeTab === 'active' ? active : done;

  const cancelWaitlist = (id) => {
    updateState((prev) => ({
      ...prev,
      waitlistOrders: prev.waitlistOrders.map((w) =>
        w.id === id ? { ...w, status: '已退单' } : w
      ),
    }));
    showToast('候补订单已取消', 'info');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header activePage="tickets" />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[['active', '候补中'], ['done', '已处理']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  background: 'none', border: 'none', padding: '16px 28px', fontSize: 15,
                  color: activeTab === key ? 'var(--primary-blue)' : 'var(--text-gray)',
                  borderBottom: activeTab === key ? '2px solid var(--primary-blue)' : '2px solid transparent',
                  marginBottom: -1, cursor: 'pointer', fontWeight: activeTab === key ? 'bold' : 'normal',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: '16px' }}>
            {orders.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-gray)' }}>
                暂无候补订单
              </div>
            ) : (
              orders.map((w) => (
                <div key={w.id} style={{ border: '1px solid var(--border)', borderRadius: 6, marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--light-blue-bg)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="train-badge G">G</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-blue)' }}>{w.trainNo}</span>
                      <span style={{ fontSize: 14 }}>{w.departureStation} → {w.arrivalStation}</span>
                    </div>
                    <span className={`status-badge ${STATUS_CLASS[w.status] || 'status-done'}`}>{w.status}</span>
                  </div>
                  <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                    <div><span style={{ color: 'var(--text-gray)' }}>出发日期：</span>{w.departureDate}</div>
                    <div><span style={{ color: 'var(--text-gray)' }}>席别：</span>{w.seatClass}</div>
                    <div><span style={{ color: 'var(--text-gray)' }}>乘客：</span>{w.passengers.join('、')}</div>
                    <div><span style={{ color: 'var(--text-gray)' }}>押金：</span><span style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{w.depositAmount}</span></div>
                    <div><span style={{ color: 'var(--text-gray)' }}>截止时间：</span>{w.deadline.replace('T', ' ').slice(0, 16)}</div>
                  </div>
                  {(w.status === '待兑现' || w.status === '待支付') && (
                    <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => cancelWaitlist(w.id)}
                        style={{ background: 'none', border: '1px solid #f5222d', color: '#f5222d', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
                      >
                        取消候补
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
