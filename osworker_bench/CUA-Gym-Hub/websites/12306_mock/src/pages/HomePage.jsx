import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import StationSelector from '../components/StationSelector';
import './HomePage.css';

export default function HomePage() {
  const { state, updateState, showToast } = useApp();
  const navigate = useNavigate();
  const { currentSearch, stations, searchHistory } = state;

  const [from, setFrom] = useState(currentSearch.from || '');
  const [to, setTo] = useState(currentSearch.to || '');
  const [date, setDate] = useState(currentSearch.date || '');
  const [isStudent, setIsStudent] = useState(currentSearch.isStudent || false);
  const [isHighSpeedOnly, setIsHighSpeedOnly] = useState(currentSearch.isHighSpeedOnly || false);
  const [tripType, setTripType] = useState(currentSearch.tripType || 'oneWay');
  const [returnDate, setReturnDate] = useState(currentSearch.returnDate || '');

  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);

  const fromRef = useRef(null);
  const toRef = useRef(null);

  const handleSwap = () => {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
  };

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = () => {
    if (!from.trim()) { showToast('请输入出发地', 'warning'); return; }
    if (!to.trim()) { showToast('请输入到达地', 'warning'); return; }
    if (!date) { showToast('请选择出发日期', 'warning'); return; }

    const newHistory = {
      id: `sh_${Date.now()}`,
      from: from.trim(),
      to: to.trim(),
      date,
      timestamp: new Date().toISOString(),
    };
    const updatedHistory = [newHistory, ...searchHistory.filter(
      (h) => !(h.from === from.trim() && h.to === to.trim())
    )].slice(0, 5);

    updateState((prev) => ({
      ...prev,
      currentSearch: { ...prev.currentSearch, from: from.trim(), to: to.trim(), date, isStudent, isHighSpeedOnly, tripType, returnDate },
      searchHistory: updatedHistory,
    }));

    const params = new URLSearchParams({ from: from.trim(), to: to.trim(), date });
    if (isStudent) params.set('student', '1');
    if (isHighSpeedOnly) params.set('highspeed', '1');
    navigate(`/search?${params.toString()}`);
  };

  const fillFromHistory = (item) => {
    setFrom(item.from);
    setTo(item.to);
    setDate(item.date);
  };

  return (
    <div className="homepage">
      <Header activePage="home" />
      <div className="homepage-banner">
        <div className="banner-bg" />
        <div className="homepage-body container">
          {/* Left sidebar */}
          <aside className="home-sidebar">
            <div className="sidebar-title">快捷入口</div>
            <SidebarLink label="车票预订" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} active />
            <SidebarLink label="车票查询" onClick={() => {
              if (!from.trim() || !to.trim()) { showToast('请先输入出发地和到达地', 'warning'); return; }
              const params = new URLSearchParams({ from: from.trim(), to: to.trim(), date: date || new Date().toISOString().split('T')[0] });
              navigate(`/search?${params.toString()}`);
            }} />
            <SidebarLink label="订餐" onClick={() => navigate('/food-order')} />
            <SidebarLink label="计次定期票" onClick={() => navigate('/pass-tickets')} />
            <SidebarLink label="我的订单" onClick={() => navigate('/orders')} />
            <SidebarLink label="常用联系人" onClick={() => navigate('/passengers')} />
            <SidebarLink label="候补订单" onClick={() => navigate('/waitlist')} />
          </aside>

          {/* Main search card */}
          <div className="home-center">
            <div className="search-card">
              {/* Trip type tabs */}
              <div className="trip-tabs">
                <button
                  className={`trip-tab ${tripType === 'oneWay' ? 'active' : ''}`}
                  onClick={() => setTripType('oneWay')}
                >
                  单程
                </button>
                <button
                  className={`trip-tab ${tripType === 'roundTrip' ? 'active' : ''}`}
                  onClick={() => setTripType('roundTrip')}
                >
                  往返
                </button>
              </div>

              <div className="search-form">
                {/* Station row */}
                <div className="station-row">
                  <div className="station-field" ref={fromRef}>
                    <label className="field-label">出发地</label>
                    <div
                      className="station-display"
                      onClick={() => { setShowFromSelector(true); setShowToSelector(false); }}
                    >
                      {from || <span className="placeholder">请选择</span>}
                    </div>
                    {showFromSelector && (
                      <StationSelector
                        stations={stations}
                        value={from}
                        onChange={setFrom}
                        onClose={() => setShowFromSelector(false)}
                        label="出发地"
                      />
                    )}
                  </div>

                  <button className="swap-btn" onClick={handleSwap} title="交换出发地和到达地">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 16L3 12M3 12L7 8M3 12H21M17 8L21 12M21 12L17 16" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <div className="station-field" ref={toRef}>
                    <label className="field-label">到达地</label>
                    <div
                      className="station-display"
                      onClick={() => { setShowToSelector(true); setShowFromSelector(false); }}
                    >
                      {to || <span className="placeholder">请选择</span>}
                    </div>
                    {showToSelector && (
                      <StationSelector
                        stations={stations}
                        value={to}
                        onChange={setTo}
                        onClose={() => setShowToSelector(false)}
                        label="到达地"
                      />
                    )}
                  </div>
                </div>

                {/* Date row */}
                <div className="date-row">
                  <div className="date-field">
                    <label className="field-label">出发日期</label>
                    <input
                      className="date-input"
                      type="date"
                      value={date}
                      min={today}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  {tripType === 'roundTrip' && (
                    <div className="date-field">
                      <label className="field-label">返程日期</label>
                      <input
                        className="date-input"
                        type="date"
                        value={returnDate}
                        min={date || today}
                        onChange={(e) => setReturnDate(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Options */}
                <div className="options-row">
                  <label className="option-label">
                    <input type="checkbox" checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)} />
                    学生票
                  </label>
                  <label className="option-label">
                    <input type="checkbox" checked={isHighSpeedOnly} onChange={(e) => setIsHighSpeedOnly(e.target.checked)} />
                    高铁/动车
                  </label>
                </div>

                {/* Search button */}
                <button className="search-btn" onClick={handleSearch}>查&nbsp;&nbsp;&nbsp;询</button>
              </div>
            </div>

            {/* Recent searches */}
            {searchHistory.length > 0 && (
              <div className="recent-section">
                <div className="recent-title">最近搜索</div>
                <div className="recent-list">
                  {searchHistory.map((h) => (
                    <span key={h.id} className="recent-chip" onClick={() => fillFromHistory(h)}>
                      {h.from} → {h.to}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right info area */}
          <div className="home-right">
            <div className="info-card">
              <div className="info-card-title">公告信息</div>
              <div className="info-item-text">铁路旅客车票实名制管理办法实施中</div>
              <div className="info-item-text">12306网站购票每日05:00至次日01:00</div>
              <div className="info-item-text">高铁畅行服务已开通积分兑换车票功能</div>
            </div>
            <div className="info-card">
              <div className="info-card-title">会员服务</div>
              <div className="member-info-row">
                <span>当前积分</span>
                <span className="member-points">{state.user.memberPoints}</span>
              </div>
              <div className="member-info-row">
                <span>会员等级</span>
                <span className="member-level">{state.user.memberLevel}</span>
              </div>
            </div>
            <div className="info-card promo-card">
              <div className="info-card-title">铁路畅行</div>
              <div className="info-item-text">积分换车票，出行更划算</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="homepage-footer">
        <div className="container footer-links">
          <span>关于我们</span>
          <span>|</span>
          <span>法律声明</span>
          <span>|</span>
          <span>联系我们</span>
          <span>|</span>
          <span>铁路局查询</span>
          <span>|</span>
          <span>网站地图</span>
        </div>
        <div className="container footer-copyright">
          中国铁道科学研究院集团有限公司 版权所有 京ICP备05071141号-15
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ label, onClick, active }) {
  return (
    <div className={`sidebar-link ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="sidebar-label">{label}</span>
    </div>
  );
}
