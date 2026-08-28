import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Header.css';

export default function Header({ activePage }) {
  const { state, updateState, showToast } = useApp();
  const navigate = useNavigate();
  const [ticketMenuOpen, setTicketMenuOpen] = useState(false);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const ticketMenuItems = [
    { label: '单程', onClick: () => navigate('/') },
    { label: '往返', onClick: () => navigate('/') },
    { label: '改签', onClick: () => navigate('/orders') },
    { label: '退票', onClick: () => navigate('/orders') },
  ];

  const handleLogout = () => {
    updateState((prev) => ({
      ...prev,
      user: { ...prev.user, isLoggedIn: false },
    }));
    showToast('已退出登录', 'success');
    navigate('/');
  };

  const handleLogin = () => {
    updateState((prev) => ({
      ...prev,
      user: { ...prev.user, isLoggedIn: true },
    }));
    showToast('登录成功', 'success');
  };

  return (
    <header className="header">
      {/* Top utility bar */}
      <div className="header-topbar">
        <div className="header-topbar-inner container">
          <div className="topbar-links">
            <span className="topbar-link" onClick={() => navigate('/')}>中国铁路12306</span>
            <span className="topbar-sep">|</span>
            <span className="topbar-link" onClick={() => navigate('/service-center')}>铁路客户服务中心</span>
            <span className="topbar-sep">|</span>
            <span className="topbar-link" onClick={() => navigate('/faq')}>常见问题</span>
          </div>
          <div className="topbar-right">
            {state.user.isLoggedIn ? (
              <>
                <span className="topbar-user" onClick={() => navigate('/my')}>
                  {state.user.name}
                </span>
                {unreadCount > 0 && (
                  <span className="topbar-notif-badge" onClick={() => navigate('/my')}>
                    {unreadCount}
                  </span>
                )}
                <span className="topbar-sep">|</span>
                <span className="topbar-link" onClick={() => navigate('/my')}>我的12306</span>
                <span className="topbar-sep">|</span>
                <span className="topbar-link" onClick={handleLogout}>退出</span>
              </>
            ) : (
              <>
                <span className="topbar-link" onClick={handleLogin}>登录</span>
                <span className="topbar-sep">|</span>
                <span className="topbar-link" onClick={handleLogin}>注册</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logo bar */}
      <div className="header-logo-bar">
        <div className="header-logo-inner container">
          <div className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#C0392B"/>
                <circle cx="24" cy="24" r="21" fill="none" stroke="white" strokeWidth="1.5"/>
                <text x="24" y="19" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="bold" fontFamily="'Microsoft YaHei','PingFang SC',sans-serif" letterSpacing="1">中国铁路</text>
                <line x1="10" y1="22" x2="38" y2="22" stroke="white" strokeWidth="0.8" opacity="0.7"/>
                <text x="24" y="34" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial,'Helvetica Neue',sans-serif" letterSpacing="0.5">Y2306</text>
              </svg>
            </div>
            <div className="logo-text">
              <div className="logo-cn">中国铁路<span className="logo-num">Y2306</span></div>
              <div className="logo-en">www.12306.cn</div>
            </div>
          </div>
          <div className="header-slogan">铁路客户服务中心</div>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="header-nav">
        <div className="header-nav-inner container">
          <div className="nav-main">
            <Link
              to="/"
              className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
            >
              首页
            </Link>

            <div
              className={`nav-item-wrap ${activePage === 'tickets' ? 'active' : ''}`}
              onMouseEnter={() => setTicketMenuOpen(true)}
              onMouseLeave={() => setTicketMenuOpen(false)}
            >
              <Link to="/" className="nav-item">
                车票预订
                <span className="nav-arrow-icon">&#9662;</span>
              </Link>
              {ticketMenuOpen && (
                <div className="nav-dropdown">
                  {ticketMenuItems.map((item, i) => (
                    <div key={i} className="nav-dropdown-item" onClick={() => { setTicketMenuOpen(false); item.onClick(); }}>
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <span className="nav-item" onClick={() => navigate('/food-order')}>
              餐饮·特产
            </span>
            <span className="nav-item" onClick={() => navigate('/travel')}>
              旅游
            </span>
            <span className="nav-item" onClick={() => navigate('/membership')}>
              会员服务
            </span>
            <span className="nav-item" onClick={() => navigate('/station-services')}>
              站车服务
            </span>
          </div>

          <div className="nav-right">
            <span className="nav-link-sm" onClick={() => navigate('/orders')}>我的订单</span>
            <span className="nav-link-sm" onClick={() => navigate('/passengers')}>常用联系人</span>
            <span className="nav-link-sm" onClick={() => navigate('/my')}>个人中心</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
