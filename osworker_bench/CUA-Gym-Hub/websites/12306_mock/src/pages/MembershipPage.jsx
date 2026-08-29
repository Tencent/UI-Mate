import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';

export default function MembershipPage() {
  const { state, updateState, showToast } = useApp();
  const navigate = useNavigate();
  const { user } = state;

  const handleRedeem = (points, desc) => {
    if (user.memberPoints < points) {
      showToast('积分不足，无法兑换', 'warning');
      return;
    }
    updateState((prev) => ({
      ...prev,
      user: { ...prev.user, memberPoints: prev.user.memberPoints - points },
      notifications: [
        {
          id: `notif_redeem_${Date.now()}`,
          type: 'points_redeem',
          title: '积分兑换成功',
          content: `您已成功使用${points}积分兑换"${desc}"。`,
          read: false,
          createdAt: new Date().toISOString(),
          relatedOrderId: null,
        },
        ...prev.notifications,
      ],
    }));
    showToast(`兑换成功！消耗${points}积分`, 'success');
  };

  const redeemItems = [
    { points: 10000, desc: '100元车票抵扣券', icon: '🎫' },
    { points: 5000, desc: '50元车票抵扣券', icon: '🎫' },
    { points: 2000, desc: '高铁贵宾厅使用券', icon: '🏢' },
    { points: 1000, desc: '列车餐饮8折优惠券', icon: '🍽️' },
    { points: 500, desc: '行李寄存服务券', icon: '🧳' },
    { points: 300, desc: '高铁WiFi流量包', icon: '📶' },
  ];

  const levels = [
    { name: '普通会员', min: 0, color: '#8c8c8c' },
    { name: '银卡会员', min: 5000, color: '#a0a0a0' },
    { name: '金卡会员', min: 10000, color: '#d4a017' },
    { name: '白金会员', min: 30000, color: '#b8b8ff' },
    { name: '钻石会员', min: 100000, color: '#00ccff' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        {/* Member card */}
        <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 12, padding: 24, color: 'white', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 'bold' }}>{user.name}</div>
              <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>会员号: {user.id}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 16px', borderRadius: 20, fontSize: 14 }}>{user.memberLevel}</div>
          </div>
          <div style={{ display: 'flex', gap: 40, marginTop: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{user.memberPoints}</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>当前积分</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{state.orders.filter((o) => o.status === '已完成').length}</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>已完成行程</div>
            </div>
          </div>
        </div>

        {/* Level progression */}
        <div style={{ background: 'white', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>会员等级</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {levels.map((level) => (
              <div key={level.name} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.memberPoints >= level.min ? level.color : '#e8e8e8', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white' }}>
                  {user.memberPoints >= level.min ? '✓' : ''}
                </div>
                <div style={{ fontSize: 12, color: user.memberPoints >= level.min ? '#333' : '#bbb' }}>{level.name}</div>
                <div style={{ fontSize: 11, color: '#999' }}>{level.min > 0 ? `${level.min}分` : ''}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem items */}
        <div style={{ background: 'white', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>积分兑换</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {redeemItems.map((item, i) => (
              <div key={i} style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 8 }}>{item.desc}</div>
                <div style={{ fontSize: 13, color: '#fa8c16', marginTop: 4 }}>{item.points}积分</div>
                <button
                  onClick={() => handleRedeem(item.points, item.desc)}
                  disabled={user.memberPoints < item.points}
                  style={{
                    marginTop: 10, width: '100%', padding: '6px 0', borderRadius: 4, border: 'none', cursor: user.memberPoints >= item.points ? 'pointer' : 'not-allowed',
                    background: user.memberPoints >= item.points ? 'var(--primary-blue)' : '#e8e8e8',
                    color: user.memberPoints >= item.points ? 'white' : '#bbb', fontSize: 13,
                  }}
                >
                  {user.memberPoints >= item.points ? '立即兑换' : '积分不足'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
