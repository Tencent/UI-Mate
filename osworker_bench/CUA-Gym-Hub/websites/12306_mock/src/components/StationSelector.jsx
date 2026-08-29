import React, { useState, useRef, useEffect } from 'react';
import './StationSelector.css';

const HOT_CITIES = ['北京', '上海', '广州', '深圳', '成都', '武汉', '杭州', '南京', '西安', '重庆', '长沙', '天津'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function StationSelector({ stations, value, onChange, onClose, label }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('hot');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const getFilteredStations = () => {
    if (!query) return [];
    const q = query.toLowerCase();
    return stations.filter((s) =>
      s.name.includes(query) ||
      s.city.includes(query) ||
      s.pinyin.startsWith(q) ||
      s.pinyin.includes(q) ||
      (q.length === 1 && s.initial.toLowerCase() === q)
    ).slice(0, 12);
  };

  const stationsByLetter = {};
  stations.forEach((s) => {
    const letter = s.initial;
    if (!stationsByLetter[letter]) stationsByLetter[letter] = [];
    stationsByLetter[letter].push(s);
  });

  const filtered = getFilteredStations();

  const handleSelect = (station) => {
    onChange(station.name);
    onClose();
  };

  const hotStations = stations.filter((s) => s.isHot);

  return (
    <div className="station-selector" ref={containerRef}>
      <div className="ss-header">
        <span className="ss-label">{label}</span>
        <div className="ss-search-wrap">
          <input
            ref={inputRef}
            className="ss-search-input"
            type="text"
            placeholder="输入站名或拼音首字母"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="ss-clear" onClick={() => setQuery('')}>&times;</button>
          )}
        </div>
      </div>

      {/* Search results */}
      {query && (
        <div className="ss-results">
          {filtered.length === 0 ? (
            <div className="ss-no-result">未找到匹配车站</div>
          ) : (
            filtered.map((s) => (
              <div
                key={s.code}
                className={`ss-result-item ${s.name === value ? 'selected' : ''}`}
                onClick={() => handleSelect(s)}
              >
                <span className="ss-station-name">{s.name}</span>
                <span className="ss-station-city">{s.city}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tabs when not searching */}
      {!query && (
        <>
          <div className="ss-tabs">
            <button
              className={`ss-tab ${activeTab === 'hot' ? 'active' : ''}`}
              onClick={() => setActiveTab('hot')}
            >
              热门
            </button>
            <button
              className={`ss-tab ${activeTab === 'az' ? 'active' : ''}`}
              onClick={() => setActiveTab('az')}
            >
              A-Z
            </button>
          </div>

          {activeTab === 'hot' && (
            <div className="ss-hot-section">
              <div className="ss-hot-label">热门城市</div>
              <div className="ss-hot-grid">
                {HOT_CITIES.map((city) => {
                  const cityStations = stations.filter((s) => s.city === city);
                  return cityStations.map((s) => (
                    <div
                      key={s.code}
                      className={`ss-hot-item ${s.name === value ? 'selected' : ''}`}
                      onClick={() => handleSelect(s)}
                    >
                      {s.name}
                    </div>
                  ));
                })}
              </div>
            </div>
          )}

          {activeTab === 'az' && (
            <div className="ss-az-section">
              <div className="ss-az-nav">
                {LETTERS.filter((l) => stationsByLetter[l]).map((l) => (
                  <a
                    key={l}
                    className="ss-az-letter"
                    href={`#ss-group-${l}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(`ss-group-${l}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
                    }}
                  >
                    {l}
                  </a>
                ))}
              </div>
              <div className="ss-az-list">
                {LETTERS.filter((l) => stationsByLetter[l]).map((l) => (
                  <div key={l} id={`ss-group-${l}`} className="ss-az-group">
                    <div className="ss-az-group-label">{l}</div>
                    <div className="ss-az-group-items">
                      {stationsByLetter[l].map((s) => (
                        <div
                          key={s.code}
                          className={`ss-az-item ${s.name === value ? 'selected' : ''}`}
                          onClick={() => handleSelect(s)}
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
