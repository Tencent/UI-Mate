import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import './SearchPage.css';

const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d) ? '' : `周${DAY_NAMES[d.getDay()]}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

function parseTime(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

const SEAT_COLS = [
  { key: 'businessSeat', label: '商务座' },
  { key: 'firstClassSeat', label: '一等座' },
  { key: 'secondClassSeat', label: '二等座' },
  { key: 'deluxeSoftSleeper', label: '高级软卧' },
  { key: 'softSleeper', label: '软卧' },
  { key: 'hardSleeper', label: '硬卧' },
  { key: 'hardSeat', label: '硬座' },
  { key: 'noSeat', label: '无座' },
];

function AvailCell({ value, price }) {
  if (value === '--' || value === undefined || value === null) {
    return <td className="avail-cell"><span className="avail-dash">--</span></td>;
  }
  if (value === '无') {
    return <td className="avail-cell"><span className="avail-gray">无</span></td>;
  }
  if (value === '候补') {
    return (
      <td className="avail-cell">
        <span className="avail-orange">候补</span>
        {price && <div className="avail-price">&yen;{price}</div>}
      </td>
    );
  }

  const display = value === '有' ? '有' : String(value);
  return (
    <td className="avail-cell">
      <span className="avail-green">{display}</span>
      {price && <div className="avail-price">&yen;{price}</div>}
    </td>
  );
}

// Match station: "北京" matches "北京南", "北京西", "北京"
function stationMatches(trainStation, searchTerm) {
  if (!searchTerm) return true;
  const s = searchTerm.replace(/[南北东西]$/, '');
  const t = trainStation.replace(/[南北东西]$/, '');
  return trainStation === searchTerm || trainStation.includes(searchTerm) || searchTerm.includes(t) || t === s;
}

export default function SearchPage() {
  const { state, updateState, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fromParam = searchParams.get('from') || '';
  const toParam = searchParams.get('to') || '';
  const dateParam = searchParams.get('date') || '';
  const highspeedParam = searchParams.get('highspeed');

  const [currentDate, setCurrentDate] = useState(dateParam);
  const [timeRanges, setTimeRanges] = useState([]);
  const [trainTypes, setTrainTypes] = useState([]);
  const [sortBy, setSortBy] = useState('departure');
  const [sortDir, setSortDir] = useState('asc');

  const allTrains = state.trains;

  const filteredTrains = useMemo(() => {
    let list = allTrains.filter((t) => {
      const fromMatch = stationMatches(t.departureStation, fromParam);
      const toMatch = stationMatches(t.arrivalStation, toParam);
      return fromMatch && toMatch;
    });

    if (highspeedParam === '1') {
      list = list.filter(t => 'GDC'.includes(t.trainType));
    }

    if (trainTypes.length > 0) {
      list = list.filter((t) => trainTypes.includes(t.trainType));
    }

    if (timeRanges.length > 0) {
      list = list.filter((t) => {
        const mins = parseTime(t.departureTime);
        return timeRanges.some((range) => {
          if (range === '00-06') return mins < 360;
          if (range === '06-12') return mins >= 360 && mins < 720;
          if (range === '12-18') return mins >= 720 && mins < 1080;
          if (range === '18-24') return mins >= 1080;
          return true;
        });
      });
    }

    list = [...list].sort((a, b) => {
      let av, bv;
      if (sortBy === 'departure') {
        av = parseTime(a.departureTime); bv = parseTime(b.departureTime);
      } else if (sortBy === 'arrival') {
        av = parseTime(a.arrivalTime); bv = parseTime(b.arrivalTime);
      } else if (sortBy === 'duration') {
        av = a.durationMinutes; bv = b.durationMinutes;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return list;
  }, [allTrains, fromParam, toParam, trainTypes, timeRanges, sortBy, sortDir, highspeedParam]);

  const toggleTimeRange = (range) => {
    const next = timeRanges.includes(range) ? timeRanges.filter((r) => r !== range) : [...timeRanges, range];
    setTimeRanges(next);
    updateState((prev) => ({ ...prev, searchFilters: { ...prev.searchFilters, timeRanges: next } }));
  };

  const toggleTrainType = (type) => {
    const next = trainTypes.includes(type) ? trainTypes.filter((t) => t !== type) : [...trainTypes, type];
    setTrainTypes(next);
    updateState((prev) => ({ ...prev, searchFilters: { ...prev.searchFilters, trainTypes: next } }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      const nextDir = sortDir === 'asc' ? 'desc' : 'asc';
      setSortDir(nextDir);
      updateState((prev) => ({ ...prev, searchFilters: { ...prev.searchFilters, sortBy: field, sortDir: nextDir } }));
    } else {
      setSortBy(field);
      setSortDir('asc');
      updateState((prev) => ({ ...prev, searchFilters: { ...prev.searchFilters, sortBy: field, sortDir: 'asc' } }));
    }
  };

  const handleBook = (train) => {
    updateState((prev) => ({
      ...prev,
      selectedTrain: { ...train, date: currentDate },
      selectedSeatClass: null,
      selectedPassengers: [],
    }));
    navigate(`/booking/${train.trainNo}`);
  };

  const isAllSoldOut = (train) => {
    const avail = train.seatAvailability;
    const vals = Object.values(avail).filter((v) => v !== '--');
    return vals.length > 0 && vals.every((v) => v === '无');
  };

  const hasWaitlist = (train) => {
    return Object.values(train.seatAvailability).some((v) => v === '候补');
  };

  const resultCount = filteredTrains.length;

  return (
    <div className="search-page">
      <Header activePage="tickets" />
      <div className="search-content container">
        {/* Search header */}
        <div className="search-header-bar">
          <div className="search-route-info">
            <h2 className="search-title">
              <span className="search-from">{fromParam}</span>
              <span className="search-arrow">&#10142;</span>
              <span className="search-to">{toParam}</span>
            </h2>
            <span className="search-result-count">共 {resultCount} 个车次</span>
          </div>

          {/* Date navigation */}
          <div className="date-nav">
            <button className="date-nav-btn" onClick={() => setCurrentDate(addDays(currentDate, -1))}>
              &lsaquo; 前一天
            </button>
            <span className="date-nav-current">
              {currentDate} <span className="date-week">{getDayOfWeek(currentDate)}</span>
            </span>
            <button className="date-nav-btn" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
              后一天 &rsaquo;
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-section">
            <span className="filter-label">车次类型：</span>
            <div className="filter-group">
              <button
                className={`filter-chip ${trainTypes.length === 0 ? 'active' : ''}`}
                onClick={() => { setTrainTypes([]); updateState((prev) => ({ ...prev, searchFilters: { ...prev.searchFilters, trainTypes: [] } })); }}
              >
                全部
              </button>
              {[
                { types: ['G', 'D', 'C'], label: 'GDC-高铁/城际/动车' },
                { types: ['K', 'T', 'Z'], label: 'KTZ-快速/特快/直达' },
              ].map(({ types, label }) => (
                <button
                  key={label}
                  className={`filter-chip ${types.every(t => trainTypes.includes(t)) ? 'active' : ''}`}
                  onClick={() => {
                    const allIncluded = types.every(t => trainTypes.includes(t));
                    let next;
                    if (allIncluded) {
                      next = trainTypes.filter(t => !types.includes(t));
                    } else {
                      next = [...new Set([...trainTypes, ...types])];
                    }
                    setTrainTypes(next);
                    updateState((prev) => ({ ...prev, searchFilters: { ...prev.searchFilters, trainTypes: next } }));
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <span className="filter-label">出发时段：</span>
            <div className="filter-group">
              {[['00-06', '00:00-06:00'], ['06-12', '06:00-12:00'], ['12-18', '12:00-18:00'], ['18-24', '18:00-24:00']].map(([val, label]) => (
                <button
                  key={val}
                  className={`filter-chip ${timeRanges.includes(val) ? 'active' : ''}`}
                  onClick={() => toggleTimeRange(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results table */}
        <div className="results-table-wrap">
          {filteredTrains.length === 0 ? (
            <div className="no-results">
              <div className="no-results-text">没有找到符合条件的列车</div>
              <div className="no-results-hint">请尝试调整筛选条件或更换出发/到达站</div>
            </div>
          ) : (
            <table className="results-table">
              <thead>
                <tr>
                  <th className="th-train">车次</th>
                  <th>出发站<br/>到达站</th>
                  <th className="sort-th" onClick={() => handleSort('departure')}>
                    出发时间 {sortBy === 'departure' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="sort-th" onClick={() => handleSort('arrival')}>
                    到达时间 {sortBy === 'arrival' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="sort-th" onClick={() => handleSort('duration')}>
                    历时 {sortBy === 'duration' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  {SEAT_COLS.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrains.map((train) => {
                  const soldOut = isAllSoldOut(train);
                  const waitlist = !soldOut && hasWaitlist(train);
                  return (
                    <tr key={train.trainNo} className={soldOut ? 'row-soldout' : ''}>
                      <td className="train-no-cell">
                        <span className={`train-badge ${train.trainType}`}>{train.trainType}</span>
                        <Link to={`/train/${train.trainNo}`} className="train-no-link">
                          {train.trainNo}
                        </Link>
                      </td>
                      <td className="station-names-cell">
                        <div className="station-pair">
                          <span className="dep-station">{train.departureStation}</span>
                          <span className="arr-station">{train.arrivalStation}</span>
                        </div>
                      </td>
                      <td className="time-cell dep-time-cell">
                        <span className="time-big">{train.departureTime}</span>
                      </td>
                      <td className="time-cell arr-time-cell">
                        <span className="time-big">{train.arrivalTime}</span>
                      </td>
                      <td className="duration-cell">{train.duration}</td>
                      {SEAT_COLS.map((col) => (
                        <AvailCell
                          key={col.key}
                          value={train.seatAvailability[col.key]}
                          price={train.prices[col.key]}
                        />
                      ))}
                      <td className="action-cell">
                        <button
                          className={`book-btn ${soldOut && !waitlist ? 'book-btn-soldout' : waitlist ? 'book-btn-waitlist' : ''}`}
                          onClick={() => {
                            if (soldOut && !waitlist) {
                              showToast('该车次已售完，暂无余票', 'warning');
                            } else {
                              handleBook(train);
                            }
                          }}
                        >
                          {soldOut && !waitlist ? '无票' : waitlist ? '候补' : '预订'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
