import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './MyPage.css';

export default function MyPage() {
  const { state, updateState, showToast } = useApp();
  const navigate = useNavigate();
  const { user, notifications } = state;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    phone: user.phone,
    email: user.email,
  });
  const [showGuide, setShowGuide] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const [activeMenuPanel, setActiveMenuPanel] = useState(null);

  const quickLinks = [
    { icon: '📋', label: '我的订单', onClick: () => navigate('/orders') },
    { icon: '⏳', label: '候补订单', onClick: () => navigate('/waitlist') },
    { icon: '👥', label: '乘车人', onClick: () => navigate('/passengers') },
    { icon: '👤', label: '个人信息', onClick: () => setEditingProfile(true) },
    { icon: '🗺️', label: '出行向导', onClick: () => setShowGuide(true) },
    { icon: '👑', label: '会员中心', onClick: () => setShowMembership(true) },
  ];

  const menuPanelData = {
    '我的保险': {
      items: [
        { label: '乘意险', desc: '每次出行最高保障120万元', price: '¥3.00/份' },
        { label: '行李险', desc: '行李物品丢失或损坏保障', price: '¥5.00/份' },
        { label: '航班延误险', desc: '出行延误补偿保障', price: '¥10.00/份' },
      ],
    },
    '我的餐饮·特产': {
      items: [
        { label: '高铁订餐', desc: '在线预订高铁餐食，到站送达', action: () => navigate('/food-order') },
        { label: '地方特产', desc: '各地特产直达，品味美食', action: () => navigate('/food-order') },
        { label: '订餐记录', desc: '查看历史订餐记录', action: () => showToast('暂无订餐记录', 'info') },
      ],
    },
    '温馨服务': {
      items: [
        { label: '重点旅客预约', desc: '老幼病残孕旅客可预约专属服务' },
        { label: '遗失物品查找', desc: '列车遗失物品登记与查询' },
        { label: '接续换乘', desc: '一次购票，站内便捷换乘' },
        { label: '约车服务', desc: '到站后的出行接驳服务预约' },
      ],
    },
    '信息服务': {
      items: [
        { label: '列车时刻表', desc: '全国列车时刻查询', action: () => navigate('/') },
        { label: '正晚点查询', desc: '实时查询列车运行状态' },
        { label: '车站信息', desc: '全国火车站地址、电话及乘车指引' },
        { label: '票价查询', desc: '各线路票价信息', action: () => navigate('/') },
      ],
    },
    '旅行休闲': {
      items: [
        { label: '旅游线路', desc: '精选旅游路线推荐', action: () => navigate('/travel') },
        { label: '酒店预订', desc: '出行目的地酒店优惠预订' },
        { label: '景点门票', desc: '热门景点门票在线购买' },
        { label: '旅行攻略', desc: '热门目的地旅行攻略指南' },
      ],
    },
  };

  const markAllRead = () => {
    updateState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    showToast('已全部标为已读', 'success');
  };

  const handleSaveProfile = () => {
    updateState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        name: profileForm.name,
        phone: profileForm.phone,
        email: profileForm.email,
      },
    }));
    setEditingProfile(false);
    showToast('个人信息已更新', 'success');
  };

  return (
    <div className="my-page">
      <Header activePage="home" />
      <div className="my-content container">

        {/* User info card */}
        <div className="user-card">
          <div className="user-avatar">{user.name[0]}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-meta">
              <span className="member-level">{user.memberLevel}</span>
              <span className="member-points">🏆 {user.memberPoints}积分</span>
            </div>
            <div className="user-phone">{user.phone}</div>
          </div>
          <div className="user-notif" onClick={() => navigate('/my#notifications')}>
            {unreadCount > 0 && (
              <div className="notif-panel-trigger">
                🔔 {unreadCount}条未读消息
              </div>
            )}
          </div>
        </div>

        {/* Quick links grid */}
        <div className="quick-links-section">
          <h3 className="section-heading">快捷服务</h3>
          <div className="quick-grid">
            {quickLinks.map((link, i) => (
              <div key={i} className="quick-card" onClick={link.onClick}>
                <span className="quick-icon">{link.icon}</span>
                <span className="quick-label">{link.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="notif-section">
            <div className="section-header-row">
              <h3 className="section-heading">消息通知</h3>
              {unreadCount > 0 && (
                <span className="mark-read-btn" onClick={markAllRead}>全部已读</span>
              )}
            </div>
            <div className="notif-list">
              {notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${n.read ? 'read' : 'unread'}`}
                  onClick={() => {
                    updateState((prev) => ({
                      ...prev,
                      notifications: prev.notifications.map((notif) =>
                        notif.id === n.id ? { ...notif, read: true } : notif
                      ),
                    }));
                    if (n.relatedOrderId) navigate(`/orders/${n.relatedOrderId}`);
                  }}
                >
                  {!n.read && <span className="unread-dot" />}
                  <div className="notif-content">
                    <div className="notif-title">{n.title}</div>
                    <div className="notif-text">{n.content}</div>
                    <div className="notif-time">{n.createdAt.replace('T', ' ').slice(0, 16)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu list */}
        <div className="menu-section">
          {Object.keys(menuPanelData).map((item) => (
            <div key={item}>
              <div className="menu-item" onClick={() => setActiveMenuPanel(activeMenuPanel === item ? null : item)}>
                <span className="menu-label">{item}</span>
                <span className="menu-arrow" style={{ transform: activeMenuPanel === item ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
              </div>
              {activeMenuPanel === item && (
                <div className="menu-panel-content">
                  {menuPanelData[item].items.map((sub, i) => (
                    <div
                      key={i}
                      className="menu-panel-item"
                      onClick={() => {
                        if (sub.action) sub.action();
                        else showToast(`${sub.label}服务已记录`, 'success');
                      }}
                    >
                      <div className="menu-panel-item-label">{sub.label}</div>
                      <div className="menu-panel-item-desc">{sub.desc}</div>
                      {sub.price && <div className="menu-panel-item-price">{sub.price}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Profile edit modal */}
      {editingProfile && (
        <div className="modal-overlay" onClick={() => setEditingProfile(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">编辑个人信息</h3>
            <div className="profile-form">
              <div className="profile-field">
                <label>姓名</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="profile-field">
                <label>用户名</label>
                <input type="text" value={user.username} disabled />
              </div>
              <div className="profile-field">
                <label>证件类型</label>
                <input type="text" value={user.idType} disabled />
              </div>
              <div className="profile-field">
                <label>证件号码</label>
                <input type="text" value={user.idNumber} disabled />
              </div>
              <div className="profile-field">
                <label>手机号</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="profile-field">
                <label>邮箱</label>
                <input
                  type="text"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-confirm" onClick={handleSaveProfile}>保存</button>
              <button className="modal-cancel" onClick={() => setEditingProfile(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* Travel guide modal */}
      {showGuide && (
        <div className="modal-overlay" onClick={() => setShowGuide(false)}>
          <div className="modal-box modal-wide" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">出行向导</h3>
            <div className="guide-content">
              <div className="guide-section">
                <h4>购票流程</h4>
                <ol className="guide-steps">
                  <li>在首页选择出发地、到达地和出发日期</li>
                  <li>点击"查询"搜索可选车次</li>
                  <li>选择合适的车次，点击"预订"</li>
                  <li>选择座位等级和乘车人</li>
                  <li>提交订单并在30分钟内完成支付</li>
                </ol>
              </div>
              <div className="guide-section">
                <h4>退票/改签</h4>
                <ul className="guide-list">
                  <li>开车前8天以上退票免收手续费</li>
                  <li>开车前48小时至8天退票收取5%手续费</li>
                  <li>开车前24至48小时退票收取10%手续费</li>
                  <li>开车前24小时内退票收取20%手续费</li>
                  <li>改签只能改签同日或更晚的车次</li>
                </ul>
              </div>
              <div className="guide-section">
                <h4>乘车须知</h4>
                <ul className="guide-list">
                  <li>请携带有效身份证件，提前到站</li>
                  <li>高铁/动车建议提前30分钟到站</li>
                  <li>普速列车建议提前1小时到站</li>
                  <li>每人免费携带行李不超过20公斤</li>
                </ul>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-confirm" onClick={() => setShowGuide(false)}>我知道了</button>
            </div>
          </div>
        </div>
      )}

      {/* Membership modal */}
      {showMembership && (
        <div className="modal-overlay" onClick={() => setShowMembership(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">会员中心</h3>
            <div className="membership-content">
              <div className="membership-card-display">
                <div className="membership-level">{user.memberLevel}</div>
                <div className="membership-name">{user.name}</div>
                <div className="membership-id">会员号: {user.id}</div>
              </div>
              <div className="membership-stats">
                <div className="membership-stat">
                  <div className="stat-number">{user.memberPoints}</div>
                  <div className="stat-label">当前积分</div>
                </div>
                <div className="membership-stat">
                  <div className="stat-number">{state.orders.filter((o) => o.status === '已完成').length}</div>
                  <div className="stat-label">已完成行程</div>
                </div>
                <div className="membership-stat">
                  <div className="stat-number">{Math.floor(user.memberPoints / 100)}</div>
                  <div className="stat-label">可兑换车票(张)</div>
                </div>
              </div>
              <div className="membership-rules">
                <h4>积分规则</h4>
                <ul>
                  <li>购票消费1元累积5积分</li>
                  <li>100积分可兑换1元车票抵扣</li>
                  <li>金卡会员享受优先候补权益</li>
                  <li>积分有效期为获得之日起24个月</li>
                </ul>
              </div>
              <button
                className="modal-confirm"
                onClick={() => {
                  if (user.memberPoints >= 100) {
                    updateState((prev) => ({
                      ...prev,
                      user: { ...prev.user, memberPoints: prev.user.memberPoints - 100 },
                    }));
                    showToast('已兑换100积分，可抵扣1元车票费用', 'success');
                  } else {
                    showToast('积分不足，无法兑换', 'warning');
                  }
                }}
              >
                兑换积分
              </button>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowMembership(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
