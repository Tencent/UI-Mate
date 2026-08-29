
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DiscoverPage.css';

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [showScan, setShowScan] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMiniPrograms, setShowMiniPrograms] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const [showTopStories, setShowTopStories] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [activeMiniProgram, setActiveMiniProgram] = useState(null);
  const [mpSearchQuery, setMpSearchQuery] = useState('');
  const [showMpSearch, setShowMpSearch] = useState(false);

  const miniPrograms = [
    { id: 'mp1', name: '美团外卖', icon: '🍔' },
    { id: 'mp2', name: '滴滴出行', icon: '🚗' },
    { id: 'mp3', name: '京东购物', icon: '🛒' },
    { id: 'mp4', name: '拼多多', icon: '🎁' },
    { id: 'mp5', name: '携程旅行', icon: '✈️' },
    { id: 'mp6', name: '饿了么', icon: '🍜' },
    { id: 'mp7', name: '12306', icon: '🚄' },
    { id: 'mp8', name: '腾讯文档', icon: '📝' },
  ];

  const filteredMp = mpSearchQuery.trim()
    ? miniPrograms.filter(mp => mp.name.includes(mpSearchQuery))
    : miniPrograms;

  return (
    <div className="discover-page">
      <div className="discover-header">
        <h1>发现</h1>
      </div>

      <div className="discover-sections">
        {/* Section 1: Moments */}
        <div className="discover-section">
          <div className="discover-item" onClick={() => navigate('/moments')}>
            <div className="discover-icon" style={{ backgroundColor: '#576b95' }}>📷</div>
            <span className="discover-label">朋友圈</span>
            <div className="discover-right">
              <span className="red-dot"></span>
              <span className="arrow">›</span>
            </div>
          </div>
        </div>

        {/* Section 2: Channels, Live */}
        <div className="discover-section">
          <div className="discover-item" onClick={() => navigate('/channels')}>
            <div className="discover-icon" style={{ backgroundColor: '#fa9d3b' }}>▶️</div>
            <span className="discover-label">视频号</span>
            <div className="discover-right"><span className="arrow">›</span></div>
          </div>
          <div className="discover-item" onClick={() => setShowLive(true)}>
            <div className="discover-icon" style={{ backgroundColor: '#fa9d3b' }}>📡</div>
            <span className="discover-label">直播</span>
            <div className="discover-right"><span className="arrow">›</span></div>
          </div>
        </div>

        {/* Section 3: Scan, Shake */}
        <div className="discover-section">
          <div className="discover-item" onClick={() => setShowScan(true)}>
            <div className="discover-icon" style={{ backgroundColor: '#576b95' }}>📷</div>
            <span className="discover-label">扫一扫</span>
            <div className="discover-right"><span className="arrow">›</span></div>
          </div>
          <div className="discover-item" onClick={() => setShowShake(true)}>
            <div className="discover-icon" style={{ backgroundColor: '#576b95' }}>📳</div>
            <span className="discover-label">摇一摇</span>
            <div className="discover-right"><span className="arrow">›</span></div>
          </div>
        </div>

        {/* Section 4: Top Stories, Search */}
        <div className="discover-section">
          <div className="discover-item" onClick={() => setShowTopStories(true)}>
            <div className="discover-icon" style={{ backgroundColor: '#fa9d3b' }}>👁️</div>
            <span className="discover-label">看一看</span>
            <div className="discover-right">
              <span className="red-dot"></span>
              <span className="arrow">›</span>
            </div>
          </div>
          <div className="discover-item" onClick={() => setShowSearch(true)}>
            <div className="discover-icon" style={{ backgroundColor: '#e74c3c' }}>🔍</div>
            <span className="discover-label">搜一搜</span>
            <div className="discover-right"><span className="arrow">›</span></div>
          </div>
        </div>

        {/* Section 5: Nearby */}
        <div className="discover-section">
          <div className="discover-item" onClick={() => setShowNearby(true)}>
            <div className="discover-icon" style={{ backgroundColor: '#576b95' }}>📍</div>
            <span className="discover-label">附近的人</span>
            <div className="discover-right"><span className="arrow">›</span></div>
          </div>
        </div>

        {/* Section 6: Mini Programs */}
        <div className="discover-section">
          <div className="discover-item" onClick={() => setShowMiniPrograms(true)}>
            <div className="discover-icon" style={{ backgroundColor: '#7d5ee0' }}>🔗</div>
            <span className="discover-label">小程序</span>
            <div className="discover-right"><span className="arrow">›</span></div>
          </div>
        </div>
      </div>

      {/* Scan Modal */}
      {showScan && (
        <div className="modal-overlay" onClick={() => setShowScan(false)}>
          <div className="scan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="scan-header">
              <button className="back-btn" onClick={() => setShowScan(false)}>‹</button>
              <span>扫一扫</span>
              <div></div>
            </div>
            <div className="scan-body">
              <div className="scan-frame">
                <div className="scan-line"></div>
              </div>
              <p className="scan-hint">将二维码放入框内，即可自动扫描</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Modal */}
      {showLive && (
        <div className="modal-overlay" onClick={() => setShowLive(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-header">
              <button className="back-btn" onClick={() => setShowLive(false)}>‹</button>
              <span style={{ fontWeight: 'bold' }}>直播</span>
              <div></div>
            </div>
            <div className="search-body" style={{ padding: '24px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📡</div>
              <p>暂无正在进行的直播</p>
            </div>
          </div>
        </div>
      )}

      {/* Shake Modal */}
      {showShake && (
        <div className="modal-overlay" onClick={() => setShowShake(false)}>
          <div className="scan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="scan-header">
              <button className="back-btn" onClick={() => setShowShake(false)}>‹</button>
              <span>摇一摇</span>
              <div></div>
            </div>
            <div className="scan-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'shake 0.5s infinite' }}>📳</div>
              <p className="scan-hint">摇动手机，发现附近的人和音乐</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Stories Modal */}
      {showTopStories && (
        <div className="modal-overlay" onClick={() => setShowTopStories(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-header">
              <button className="back-btn" onClick={() => setShowTopStories(false)}>‹</button>
              <span style={{ fontWeight: 'bold' }}>看一看</span>
              <div></div>
            </div>
            <div className="search-body">
              <div className="hot-search" style={{ padding: '12px' }}>
                <h4>热门文章</h4>
                {['中国科技创新引领全球', '春节假期旅游消费创新高', '人工智能助力医疗诊断', '新能源汽车销量持续增长'].map((title, i) => (
                  <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>{title}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>微信公众号 · {Math.floor(Math.random() * 90 + 10)}万阅读</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nearby Modal */}
      {showNearby && (
        <div className="modal-overlay" onClick={() => setShowNearby(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-header">
              <button className="back-btn" onClick={() => setShowNearby(false)}>‹</button>
              <span style={{ fontWeight: 'bold' }}>附近的人</span>
              <div></div>
            </div>
            <div className="search-body" style={{ padding: '16px' }}>
              {['小明 · 50m以内', '旅行者A · 100m以内', '咖啡爱好者 · 200m以内'].map((person, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontSize: '20px' }}>👤</div>
                  <span style={{ fontSize: '14px' }}>{person}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="modal-overlay" onClick={() => setShowSearch(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-header">
              <div className="search-input-wrapper">
                <span className="search-icon-sm">🔍</span>
                <input
                  type="text"
                  placeholder="搜索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="cancel-btn" onClick={() => setShowSearch(false)}>取消</button>
            </div>
            <div className="search-body">
              <div className="hot-search">
                <h4>热搜</h4>
                <div className="hot-tags">
                  {['微信支付', '小程序开发', '朋友圈功能', '视频号', '微信红包', '健康码', '微信运动', '微信读书'].map((tag, i) => (
                    <span
                      key={i}
                      className="hot-tag"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSearchQuery(tag)}
                    >{tag}</span>
                  ))}
                </div>
              </div>
              {searchQuery.trim() && (
                <div style={{ padding: '8px 16px', color: '#07c160', fontSize: '14px' }}>
                  搜索 "{searchQuery}" 的相关内容
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mini Programs Modal */}
      {showMiniPrograms && !activeMiniProgram && (
        <div className="modal-overlay" onClick={() => setShowMiniPrograms(false)}>
          <div className="mini-programs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-header">
              <button className="back-btn" onClick={() => setShowMiniPrograms(false)}>‹</button>
              <span>小程序</span>
              <button className="search-btn-mp" onClick={(e) => { e.stopPropagation(); setShowMpSearch(true); }}>🔍</button>
            </div>
            {showMpSearch && (
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                <input
                  type="text"
                  placeholder="搜索小程序"
                  value={mpSearchQuery}
                  onChange={(e) => setMpSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setShowMpSearch(false)}
                  autoFocus
                  style={{ width: '100%', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '16px', fontSize: '14px', outline: 'none' }}
                />
              </div>
            )}
            <div className="mp-body">
              <div className="mp-section">
                <h4>最近使用</h4>
                <div className="mp-grid">
                  {filteredMp.slice(0, 4).map(mp => (
                    <div key={mp.id} className="mp-item" style={{ cursor: 'pointer' }} onClick={() => setActiveMiniProgram(mp)}>
                      <div className="mp-icon-box">{mp.icon}</div>
                      <span className="mp-name">{mp.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mp-section">
                <h4>我的小程序</h4>
                <div className="mp-grid">
                  {filteredMp.map(mp => (
                    <div key={mp.id + '-fav'} className="mp-item" style={{ cursor: 'pointer' }} onClick={() => setActiveMiniProgram(mp)}>
                      <div className="mp-icon-box">{mp.icon}</div>
                      <span className="mp-name">{mp.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini Program Detail Modal */}
      {activeMiniProgram && (
        <div className="modal-overlay" onClick={() => setActiveMiniProgram(null)}>
          <div className="mini-programs-modal" onClick={(e) => e.stopPropagation()} style={{ height: '80vh' }}>
            <div className="mp-header">
              <button className="back-btn" onClick={() => setActiveMiniProgram(null)}>‹</button>
              <span>{activeMiniProgram.name}</span>
              <div></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>{activeMiniProgram.icon}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{activeMiniProgram.name}</div>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>小程序已加载</div>
              <div style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '16px', width: '100%', fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                这是 {activeMiniProgram.name} 的模拟界面。在真实微信中，小程序将在此处显示完整功能。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;

